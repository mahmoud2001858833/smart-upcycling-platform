// Supabase Edge Function: ai-gateway
// Keeps the OpenRouter key on the server. The browser only sends {action, payload}.
//
// Deploy:
//   supabase secrets set OPENROUTER_API_KEY=sk-or-v1-...
//   supabase functions deploy ai-gateway
//
// Optional secrets: OPENROUTER_IDEATION_MODEL, OPENROUTER_DEVELOP_MODEL,
//                   OPENROUTER_CHAT_MODEL, OPENROUTER_IMAGE_MODEL (comma separated fallbacks)

import { handleAction } from '../_shared/openrouterCore.js';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

// Best-effort per-IP limiter (resets when the instance recycles). The real spending
// guard is the credit limit you set on the key inside OpenRouter.
const hits = new Map<string, number[]>();
function limited(ip: string, max = 40, windowMs = 60_000) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < windowMs);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > max;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ success: false, error: 'POST only' }, 405);

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (limited(ip)) return json({ success: false, error: 'طلبات كثيرة، حاول بعد دقيقة' }, 429);

  try {
    const { action, payload } = await req.json();
    const env = Deno.env.toObject();
    const result = await handleAction({
      action,
      payload,
      apiKey: env.OPENROUTER_API_KEY,
      env
    });
    return json(result);
  } catch (e) {
    return json({ success: false, error: (e as Error).message || 'خطأ غير متوقع' }, 500);
  }
});
