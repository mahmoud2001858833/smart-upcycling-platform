// Google Gemini (AI Studio) REST client. Server-side only: the key comes from the
// GEMINI_API_KEY secret (or GEMINI_API_KEYS, comma separated, for keys of the SAME account/project).
// Shared by the Supabase Edge Function (Deno) and the Vite dev middleware (Node).

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';

export function geminiConfig(env = {}) {
  const keys = [env.GEMINI_API_KEY, ...(env.GEMINI_API_KEYS ? String(env.GEMINI_API_KEYS).split(',') : [])]
    .map(s => (s || '').trim()).filter(Boolean);
  const imageKeys = [env.GEMINI_IMAGE_API_KEY, ...(env.GEMINI_IMAGE_API_KEYS ? String(env.GEMINI_IMAGE_API_KEYS).split(',') : [])]
    .map(s => (s || '').trim()).filter(Boolean);
  return {
    keys: [...new Set(keys)],
    imageKeys: [...new Set(imageKeys)],
    base: env.GEMINI_API_BASE || GEMINI_BASE,
    model: env.GEMINI_MODEL || 'gemini-3.8-flash',
    developModel: env.GEMINI_DEVELOP_MODEL || env.GEMINI_MODEL || 'gemini-3.8-flash',
    // comma separated list: tried in order
    imageModels: (env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-image,gemini-2.5-flash-image').split(',').map(x => x.trim()).filter(Boolean),
    // 'openrouter' (default) | 'gemini' -> which provider handles ideate/develop first
    freeImages: String(env.FREE_IMAGE_FALLBACK || 'off').toLowerCase() === 'on',
    textProvider: (env.TEXT_PROVIDER || 'openrouter').toLowerCase()
  };
}

export const hasGemini = cfg => Boolean(cfg?.keys?.length || cfg?.imageKeys?.length);

// key -> timestamp until which it is skipped (quota/rate limit)
const cooldown = new Map();
const modelBlocked = new Map(); // image model -> until (quota 'limit: 0' etc.)
let rr = 0;

function pickKeys(cfg) {
  const now = Date.now();
  const live = cfg.keys.filter(k => (cooldown.get(k) || 0) <= now);
  const pool = live.length ? live : cfg.keys;
  const start = rr++ % pool.length;
  return [...pool.slice(start), ...pool.slice(0, start)];
}

async function call({ cfg, model, body, timeoutMs }) {
  let lastErr = null;
  for (const key of pickKeys(cfg)) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(`${cfg.base}/models/${model}:generateContent`, {
        method: 'POST',
        signal: ctrl.signal,
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify(body)
      });
      const raw = await res.text();
      let data = null;
      try { data = JSON.parse(raw); } catch { /* keep raw */ }
      if (res.ok) return data;
      const msg = data?.error?.message || raw.slice(0, 300) || `HTTP ${res.status}`;
      lastErr = Object.assign(new Error(`gemini ${model}: ${msg}`), { status: res.status });
      if (res.status === 429) { cooldown.set(key, Date.now() + 60_000); continue; }
      if (res.status === 400 && /API key/i.test(msg)) { cooldown.set(key, Date.now() + 600_000); lastErr.code = 'BAD_KEY'; continue; }
      if (res.status === 401 || res.status === 403) { cooldown.set(key, Date.now() + 600_000); lastErr.code = 'BAD_KEY'; continue; }
      throw lastErr;
    } catch (e) {
      if (e === lastErr) throw e;
      lastErr = Object.assign(new Error(`gemini ${model}: ${e.name === 'AbortError' ? 'انتهت المهلة' : e.message}`), { status: 0 });
      if (e.name === 'AbortError') throw lastErr;
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr || new Error('gemini: no key');
}

/** messages: OpenAI-style [{role: system|user|assistant, content: string}] */
export async function geminiText({ cfg, model, messages, json = false, temperature = 0.7, maxTokens = 8000, timeoutMs = 100000 }) {
  const system = messages.filter(m => m.role === 'system').map(m => m.content).join('\n\n');
  const contents = messages.filter(m => m.role !== 'system').map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: String(m.content) }]
  }));
  const body = {
    contents,
    generationConfig: {
      temperature,
      maxOutputTokens: Math.min(maxTokens + 4000, 60000), // headroom: thinking tokens count against the limit
      ...(json ? { responseMimeType: 'application/json' } : {})
    },
    ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {})
  };
  let data = null; let used = model || cfg.model; const errs = [];
  const started = Date.now();
  const models = [...new Set([used, cfg.model, 'gemini-3.6-flash', 'gemini-3.5-flash-lite'])];
  for (let i = 0; i < models.length; i++) {
    const m = models[i];
    const left = timeoutMs - (Date.now() - started);
    if (left < 8000) break;
    // each attempt gets a slice so a hung/overloaded model can't eat the whole budget
    const per = i === models.length - 1 ? left : Math.min(left, Math.max(25000, Math.floor(timeoutMs / 2.5)));
    try { data = await call({ cfg, model: m, body, timeoutMs: per }); used = m; break; } catch (e) {
      errs.push(e.message);
      if (e.code === 'BAD_KEY') break;
      // overload / quota / timeout / unknown model -> try the next model
    }
  }
  if (!data) throw new Error(errs.join(' | ') || 'gemini: failed');
  model = used;
  const text = (data?.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('');
  if (!text) throw new Error(`gemini ${model}: استجابة فارغة`);
  const u = data.usageMetadata || {};
  return { text, model: model || cfg.model, usage: { total_tokens: u.totalTokenCount || 0, cost: 0 } };
}

export async function geminiImage({ cfg: baseCfg, text, referenceImage = null, aspect = '4:3', timeoutMs = 120000 }) {
  // a dedicated image key (often from another Google account/project) wins over the text key
  const cfg = baseCfg.imageKeys?.length ? { ...baseCfg, keys: baseCfg.imageKeys } : baseCfg;
  const parts = [{ text }];
  const m = typeof referenceImage === 'string' && referenceImage.match(/^data:(image\/[a-z+]+);base64,(.+)$/);
  if (m) parts.push({ inlineData: { mimeType: m[1], data: m[2] } });
  const body = {
    contents: [{ role: 'user', parts }],
    generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: aspect } }
  };
  const errs = [];
  for (const model of cfg.imageModels) {
    if ((modelBlocked.get(model) || 0) > Date.now()) { errs.push(`${model}: quota (skipped)`); continue; }
    let data;
    try {
      try {
        data = await call({ cfg, model, body, timeoutMs });
      } catch (e) {
        if (e.status !== 400) throw e;
        // some image models reject imageConfig / IMAGE-only: retry in the simplest form
        data = await call({ cfg, model, timeoutMs, body: { contents: body.contents, generationConfig: { responseModalities: ['TEXT', 'IMAGE'] } } });
      }
    } catch (e) {
      errs.push(e.message.replace(/\s+/g, ' ').slice(0, 110));
      if (e.code === 'BAD_KEY') throw e;
      if (e.status === 429) modelBlocked.set(model, Date.now() + 20 * 60_000);
      continue; // unknown / retired model -> next one
    }
    for (const p of data?.candidates?.[0]?.content?.parts || []) {
      const d = p.inlineData || p.inline_data;
      if (d?.data) return { imageUrl: `data:${d.mimeType || d.mime_type || 'image/png'};base64,${d.data}`, model };
    }
    errs.push(`gemini ${model}: لم يُرجع صورة`);
  }
  throw new Error(errs.join(' | ') || 'gemini: لم يُرجع صورة');
}

/** Free last-resort image route (no key, no quota). Best effort, retries with another seed/model. */
export async function freeImage({ text, aspect = '4:3', timeoutMs = 45000 }) {
  const [w, h] = aspect === '16:9' ? [1280, 720] : aspect === '1:1' ? [1024, 1024] : aspect === '3:4' ? [768, 1024] : aspect === '3:2' ? [1152, 768] : [1024, 768];
  const clean = String(text).replace(/\s+/g, ' ');
  const attempts = [
    { model: 'flux', prompt: clean.slice(0, 900) },
    { model: 'flux', prompt: clean.slice(0, 500) },
    { model: 'turbo', prompt: clean.slice(0, 500) }
  ];
  const errs = [];
  for (let i = 0; i < attempts.length; i++) {
    const a = attempts[i];
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(a.prompt)}?width=${w}&height=${h}&model=${a.model}&nologo=true&seed=${Math.floor(Math.random() * 1e6)}`;
      const res = await fetch(url, { signal: ctrl.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const type = res.headers.get('content-type') || 'image/jpeg';
      if (!/^image\//.test(type)) throw new Error('not an image');
      const buf = new Uint8Array(await res.arrayBuffer());
      if (buf.length < 2000) throw new Error('empty image');
      let bin = ''; for (let k = 0; k < buf.length; k += 0x8000) bin += String.fromCharCode(...buf.subarray(k, k + 0x8000));
      return { imageUrl: `data:${type.split(';')[0]};base64,${btoa(bin)}`, model: `free-${a.model}` };
    } catch (e) {
      errs.push(`${a.model}: ${e.name === 'AbortError' ? 'timeout' : e.message}`);
      if (i < attempts.length - 1) await new Promise(r => setTimeout(r, 1500));
    } finally { clearTimeout(timer); }
  }
  throw new Error(errs.join(', '));
}
