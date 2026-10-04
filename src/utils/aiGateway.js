/**
 * Client for the AI gateway. The OpenRouter key lives ONLY on the server side:
 *  - dev:  Vite middleware at /api/ai   (reads OPENROUTER_API_KEY from .env.local)
 *  - prod: Supabase Edge Function `ai-gateway` (reads the OPENROUTER_API_KEY secret)
 */

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';
const CUSTOM_URL = import.meta.env?.VITE_AI_GATEWAY_URL || '';

// null = not probed yet, true/false after the first dev attempt
let devGatewayAvailable = import.meta.env?.DEV ? null : false;

async function postJson(url, headers, body, timeoutMs) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body,
      signal: ctrl.signal
    });
  } finally {
    clearTimeout(timer);
  }
}

function unwrap(data) {
  if (!data || data.success === false) {
    throw new Error(data?.error || 'فشل طلب الذكاء الاصطناعي');
  }
  return data;
}

export async function callAi(action, payload = {}, { timeoutMs = 150000 } = {}) {
  const body = JSON.stringify({ action, payload });

  if (devGatewayAvailable !== false) {
    try {
      const res = await postJson('/api/ai', {}, body, timeoutMs);
      const isJson = (res.headers.get('content-type') || '').includes('json');
      if (isJson) {
        devGatewayAvailable = true;
        return unwrap(await res.json());
      }
      devGatewayAvailable = false; // static host / no middleware
    } catch (e) {
      if (devGatewayAvailable === true) throw e; // middleware exists; real failure
      devGatewayAvailable = false;
    }
  }

  const url = CUSTOM_URL || (SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/ai-gateway` : '');
  if (!url) throw new Error('بوابة الذكاء الاصطناعي غير مهيأة (VITE_SUPABASE_URL)');

  const res = await postJson(url, { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }, body, timeoutMs);
  let data = null;
  try { data = await res.json(); } catch { /* handled below */ }
  if (!res.ok && !data) throw new Error(`فشل الاتصال بالبوابة (${res.status})`);
  return unwrap(data);
}
