// Google Imagen 3 client for Supabase Edge Functions
export function getImagenApiKey(env = {}) {
  return (env.GEMINI_IMAGE_API_KEY || env.GEMINI_API_KEY || '').trim();
}

export async function generateImagen({ apiKey, prompt, aspectRatio = '1:1', timeoutMs = 60000 }) {
  const key = apiKey || Deno.env.get('GEMINI_IMAGE_API_KEY') || Deno.env.get('GEMINI_API_KEY');
  if (!key) {
    throw new Error('Google Imagen 3: مفتاح GEMINI_IMAGE_API_KEY غير متوفر في متغيرات البيئة');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${key}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt: String(prompt).slice(0, 2000) }],
        parameters: {
          sampleCount: 1,
          aspectRatio: aspectRatio,
          outputMimeType: 'image/jpeg'
        }
      })
    });

    const raw = await res.text();
    let data = null;
    try { data = JSON.parse(raw); } catch { /* raw */ }

    if (!res.ok) {
      const msg = data?.error?.message || raw.slice(0, 250) || `HTTP ${res.status}`;
      throw new Error(`Google Imagen 3: ${msg}`);
    }

    const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
    const mime = data?.predictions?.[0]?.mimeType || 'image/jpeg';
    if (!b64) throw new Error('Google Imagen 3: لم يتم إرجاع بيانات الصورة من الخادم');

    return {
      imageUrl: `data:${mime};base64,${b64}`,
      model: 'imagen-3.0-generate-002'
    };
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Google Imagen 3: انتهت المهلة المحددة للتوليد');
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
