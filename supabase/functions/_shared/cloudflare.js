// Cloudflare Workers AI client (paid image model "GPT Image 2.5 Sunburst"). Server-side only:
// secrets CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN (token needs the "Workers AI" permission).

export function cfConfig(env = {}) {
  return {
    accountId: (env.CLOUDFLARE_ACCOUNT_ID || '').trim(),
    token: (env.CLOUDFLARE_API_TOKEN || '').trim(),
    model: (env.CLOUDFLARE_IMAGE_MODEL || 'openai/gpt-image-2.5-sunburst').trim(),
    // low | medium | high | xhigh | max | auto  ("medium" = normal quality)
    quality: (env.CLOUDFLARE_IMAGE_QUALITY || 'medium').trim(),
    size: (env.CLOUDFLARE_IMAGE_SIZE || '1024x1024').trim(),
    base: env.CLOUDFLARE_API_BASE || 'https://api.cloudflare.com/client/v4'
  };
}

export const hasCloudflare = cfg => Boolean(cfg?.accountId && cfg?.token);

const toDataUrl = async (value, timeoutMs) => {
  const v = String(value || '');
  if (v.startsWith('data:image/')) return v;
  if (/^https?:\/\//i.test(v)) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(v, { signal: ctrl.signal });
      if (!res.ok) throw new Error(`image download HTTP ${res.status}`);
      const type = (res.headers.get('content-type') || 'image/png').split(';')[0];
      const buf = new Uint8Array(await res.arrayBuffer());
      let bin = ''; for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
      return `data:${type};base64,${btoa(bin)}`;
    } finally { clearTimeout(t); }
  }
  if (v.length > 100) return `data:image/png;base64,${v}`; // raw base64
  return null;
};

export async function cloudflareImage({ cfg, prompt, timeoutMs = 120000 }) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${cfg.base}/accounts/${cfg.accountId}/ai/run/${cfg.model}`, {
      method: 'POST',
      signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.token}` },
      body: JSON.stringify({ prompt, quality: cfg.quality, size: cfg.size })
    });
    const raw = await res.text();
    let data = null; try { data = JSON.parse(raw); } catch { /* keep raw */ }
    if (!res.ok || data?.success === false) {
      const msg = data?.errors?.[0]?.message || data?.error?.message || raw.slice(0, 250) || `HTTP ${res.status}`;
      throw Object.assign(new Error(`cloudflare ${cfg.model}: ${msg}`), { status: res.status, code: res.status === 401 || res.status === 403 ? 'BAD_KEY' : undefined });
    }
    const out = data?.result ?? data;
    const candidate = out?.image || out?.images?.[0] || out?.url || (typeof out === 'string' ? out : '');
    const url = await toDataUrl(candidate, 60000);
    if (!url) throw new Error(`cloudflare ${cfg.model}: لم يُرجع صورة`);
    return { imageUrl: url, model: cfg.model };
  } catch (e) {
    if (e.name === 'AbortError') throw new Error(`cloudflare ${cfg.model}: انتهت المهلة`);
    throw e;
  } finally { clearTimeout(timer); }
}
