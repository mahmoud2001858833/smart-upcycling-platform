// Dedicated Cloudflare Worker & Cloudflare Workers AI client
export function cfConfig(env = {}) {
  return {
    workerUrl: (env.CLOUDFLARE_WORKER_URL || 'https://fancy-snow-7de1.jowmahmoud6.workers.dev').trim(),
    workerToken: (env.CLOUDFLARE_WORKER_TOKEN || '12345678').trim(),
    accountId: (env.CLOUDFLARE_ACCOUNT_ID || '').trim(),
    token: (env.CLOUDFLARE_API_TOKEN || '').trim(),
    model: (env.CLOUDFLARE_IMAGE_MODEL || 'cloudflare-worker').trim(),
    quality: (env.CLOUDFLARE_IMAGE_QUALITY || 'medium').trim(), // low | medium | high | xhigh | max | auto
    size: (env.CLOUDFLARE_IMAGE_SIZE || '1024x1024').trim(),
    base: env.CLOUDFLARE_API_BASE || 'https://api.cloudflare.com/client/v4'
  };
}

export const hasCloudflare = cfg => Boolean(cfg?.workerUrl || (cfg?.accountId && cfg?.token));

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
  if (v.length > 100) {
    const mime = v.startsWith('/9j/') ? 'image/jpeg' : 'image/png';
    return `data:${mime};base64,${v}`;
  }
  return null;
};

/** Convert binary image buffer directly to a data URL. */
export function binaryBufferToDataUrl(buf, defaultMime = 'image/png') {
  if (!buf || buf.length === 0) return null;
  let mime = defaultMime;
  // Inspect magic bytes
  if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) {
    mime = 'image/png';
  } else if (buf.length >= 3 && buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) {
    mime = 'image/jpeg';
  } else if (buf.length >= 12 && buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46) {
    mime = 'image/webp';
  }

  let base64 = '';
  if (typeof Buffer !== 'undefined') {
    base64 = Buffer.from(buf).toString('base64');
  } else {
    let bin = '';
    const len = buf.byteLength;
    for (let i = 0; i < len; i += 0x8000) {
      bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
    }
    base64 = btoa(bin);
  }
  return `data:${mime};base64,${base64}`;
}

/** Primary generator: dedicated Cloudflare Worker returning binary image buffer directly. */
export async function cloudflareWorkerImage({ workerUrl, workerToken, prompt, timeoutMs = 120000 }) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const endpoint = workerUrl || 'https://fancy-snow-7de1.jowmahmoud6.workers.dev';
    const authHeader = (workerToken || '12345678').startsWith('Bearer ') ? workerToken : `Bearer ${workerToken || '12345678'}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      body: JSON.stringify({ prompt: String(prompt || '') })
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw Object.assign(new Error(`Cloudflare Worker HTTP ${res.status}: ${errText.slice(0, 250)}`), { status: res.status });
    }

    const contentType = (res.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    
    // Process the returned binary image buffer directly
    const arrayBuffer = await res.arrayBuffer();
    const buf = new Uint8Array(arrayBuffer);
    if (!buf || buf.length === 0) {
      throw new Error('Cloudflare Worker: استجابة فارغة (لا توجد بيانات صورة)');
    }

    const dataUrl = binaryBufferToDataUrl(buf, contentType && contentType.startsWith('image/') ? contentType : 'image/png');
    if (!dataUrl) throw new Error('Cloudflare Worker: فشل تحويل البيانات الثنائية للصورة');

    return {
      imageUrl: dataUrl,
      model: 'cloudflare-worker'
    };
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('Cloudflare Worker: انتهت المهلة');
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

/** Fallback to classic Cloudflare Workers AI if configured. */
export async function cloudflareClassicImage({ cfg, prompt, timeoutMs = 120000 }) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    let endpoint = '';
    let bodyPayload = {};

    if (cfg.model && cfg.model.startsWith('@cf/')) {
      endpoint = `${cfg.base}/accounts/${cfg.accountId}/ai/run/${cfg.model}`;
      bodyPayload = { prompt };
    } else {
      endpoint = `${cfg.base}/accounts/${cfg.accountId}/ai/run`;
      bodyPayload = {
        model: cfg.model || 'openai/gpt-image-2.5-sunburst',
        input: {
          prompt: String(prompt).slice(0, 2000),
          quality: cfg.quality,
          size: cfg.size
        }
      };
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.token}`
      },
      body: JSON.stringify(bodyPayload)
    });

    const raw = await res.text();
    let data = null; try { data = JSON.parse(raw); } catch { /* keep raw */ }

    if (!res.ok || data?.success === false) {
      const msg = data?.errors?.[0]?.message || data?.error?.message || raw.slice(0, 250) || `HTTP ${res.status}`;
      throw Object.assign(new Error(`cloudflare ${cfg.model}: ${msg}`), { status: res.status });
    }

    const out = data?.result ?? data;
    const candidate = out?.image || out?.images?.[0] || out?.url || (typeof out === 'string' ? out : '');
    const url = await toDataUrl(candidate, 60000);
    if (!url) throw new Error(`cloudflare ${cfg.model}: لم يُرجع صورة`);

    return { imageUrl: url, model: cfg.model };
  } catch (e) {
    if (e.name === 'AbortError') throw new Error(`cloudflare ${cfg.model}: انتهت المهلة`);
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

export async function cloudflareImage({ cfg, prompt, timeoutMs = 120000 }) {
  const workerUrl = cfg?.workerUrl || 'https://fancy-snow-7de1.jowmahmoud6.workers.dev';
  const workerToken = cfg?.workerToken || '12345678';
  if (workerUrl) {
    try {
      return await cloudflareWorkerImage({ workerUrl, workerToken, prompt, timeoutMs });
    } catch (e) {
      console.warn('Dedicated Cloudflare Worker failed:', e.message);
      if (cfg?.accountId && cfg?.token) {
        return await cloudflareClassicImage({ cfg, prompt, timeoutMs });
      }
      throw e;
    }
  }
  return await cloudflareClassicImage({ cfg, prompt, timeoutMs });
}
