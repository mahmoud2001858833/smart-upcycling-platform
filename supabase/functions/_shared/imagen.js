// Google Imagen 3 (Gemini API "predict" endpoint). Server-side only.
const BASE = 'https://generativelanguage.googleapis.com/v1beta';
const VALID_ASPECTS = ['1:1', '3:4', '4:3', '9:16', '16:9'];

export async function generateImagen({ apiKey, prompt, aspectRatio = '1:1', model = 'imagen-3.0-generate-002', timeoutMs = 90000 }) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE}/models/${model}:predict`, {
      method: 'POST',
      signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        instances: [{ prompt: String(prompt).slice(0, 1400) }], // Imagen 3 accepts ~480 tokens
        parameters: { sampleCount: 1, aspectRatio: VALID_ASPECTS.includes(aspectRatio) ? aspectRatio : '1:1' }
      })
    });
    const raw = await res.text();
    let data = null; try { data = JSON.parse(raw); } catch { /* keep raw */ }
    if (!res.ok) {
      const msg = data?.error?.message || raw.slice(0, 250) || `HTTP ${res.status}`;
      throw Object.assign(new Error(`imagen ${model}: ${msg}`), { status: res.status, code: res.status === 401 || res.status === 403 ? 'BAD_KEY' : undefined });
    }
    const p = data?.predictions?.[0];
    const b64 = p?.bytesBase64Encoded;
    if (!b64) throw new Error(`imagen ${model}: لم يُرجع صورة (قد يكون الوصف رُفض لأسباب السلامة)`);
    return { imageUrl: `data:${p.mimeType || 'image/png'};base64,${b64}`, model };
  } catch (e) {
    if (e.name === 'AbortError') throw new Error(`imagen ${model}: انتهت المهلة`);
    throw e;
  } finally { clearTimeout(timer); }
}
