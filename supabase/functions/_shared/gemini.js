// Google Gemini (AI Studio) REST client. Server-side only: the key comes from the
// GEMINI_API_KEY secret (or GEMINI_API_KEYS, comma separated, for keys of the SAME account/project).
// Shared by the Supabase Edge Function (Deno) and the Vite dev middleware (Node).

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';

export function geminiConfig(env = {}) {
  const keys = [env.GEMINI_API_KEY, ...(env.GEMINI_API_KEYS ? String(env.GEMINI_API_KEYS).split(',') : [])]
    .map(s => (s || '').trim()).filter(Boolean);
  return {
    keys: [...new Set(keys)],
    base: env.GEMINI_API_BASE || GEMINI_BASE,
    model: env.GEMINI_MODEL || 'gemini-3.8-flash',
    developModel: env.GEMINI_DEVELOP_MODEL || env.GEMINI_MODEL || 'gemini-3.8-flash',
    // comma separated list: tried in order
    imageModels: (env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-image,gemini-2.5-flash-image').split(',').map(x => x.trim()).filter(Boolean),
    // 'openrouter' (default) | 'gemini' -> which provider handles ideate/develop first
    textProvider: (env.TEXT_PROVIDER || 'openrouter').toLowerCase()
  };
}

export const hasGemini = cfg => Boolean(cfg?.keys?.length);

// key -> timestamp until which it is skipped (quota/rate limit)
const cooldown = new Map();
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
  let data = null; let used = model || cfg.model; let lastErr = null;
  for (const m of [...new Set([used, cfg.model, 'gemini-3.6-flash'])]) {
    try { data = await call({ cfg, model: m, body, timeoutMs }); used = m; break; } catch (e) {
      lastErr = e;
      if (e.status !== 404 && e.status !== 400) throw e; // only an unknown/retired model moves on to the next
    }
  }
  if (!data) throw lastErr;
  model = used;
  const text = (data?.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('');
  if (!text) throw new Error(`gemini ${model}: استجابة فارغة`);
  const u = data.usageMetadata || {};
  return { text, model: model || cfg.model, usage: { total_tokens: u.totalTokenCount || 0, cost: 0 } };
}

export async function geminiImage({ cfg, text, referenceImage = null, aspect = '4:3', timeoutMs = 120000 }) {
  const parts = [{ text }];
  const m = typeof referenceImage === 'string' && referenceImage.match(/^data:(image\/[a-z+]+);base64,(.+)$/);
  if (m) parts.push({ inlineData: { mimeType: m[1], data: m[2] } });
  const body = {
    contents: [{ role: 'user', parts }],
    generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: aspect } }
  };
  let lastErr = null;
  for (const model of cfg.imageModels) {
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
      lastErr = e;
      if (e.code === 'BAD_KEY') throw e;
      continue; // unknown / retired model -> next one
    }
    for (const p of data?.candidates?.[0]?.content?.parts || []) {
      const d = p.inlineData || p.inline_data;
      if (d?.data) return { imageUrl: `data:${d.mimeType || d.mime_type || 'image/png'};base64,${d.data}`, model };
    }
    lastErr = new Error(`gemini ${model}: لم يُرجع صورة`);
  }
  throw lastErr || new Error('gemini: لم يُرجع صورة');
}
