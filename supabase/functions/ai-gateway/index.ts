// Supabase Edge Function: ai-gateway
// Keeps the OpenRouter key on the server. The browser only sends {action, payload}.
// All logic (capacity, credit, caps, usage log, admin) lives in ../_shared/gateway.js so the
// Vite dev server runs exactly the same code.
//
// Deploy:
//   supabase secrets set OPENROUTER_API_KEY=sk-or-v1-...
//   supabase functions deploy ai-gateway
//
// Optional secrets (all have defaults): OPENROUTER_*_MODEL, OPENROUTER_IMAGE_SIZE, ADMIN_EMAIL,
// ADMIN_USER_ID, MAX_PROJECTS, CAPACITY_*, CREDIT_*, DAILY_*, OPENROUTER_MANAGEMENT_KEY, PLATFORM_LAUNCH_AT.
// SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY are injected by Supabase itself.

import { handleRequest } from '../_shared/gateway.js';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-token',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const MAX_BODY_BYTES = 4_000_000; // a style-reference picture is the largest legitimate payload

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

// Best-effort per-IP burst limiter (resets when the instance recycles). The real guards are the
// capacity / credit / daily limits inside the shared gateway.
const hits = new Map<string, number[]>();
function limited(ip: string, max = 60, windowMs = 60_000) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < windowMs);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > max;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ success: false, error: 'POST only' }, 405);

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '';
  if (ip && limited(ip)) return json({ success: false, code: 'RATE_LIMIT', error: 'طلبات كثيرة، حاول بعد دقيقة' }, 429);

  const length = Number(req.headers.get('content-length') || 0);
  if (length > MAX_BODY_BYTES) return json({ success: false, code: 'TOO_LARGE', error: 'الطلب كبير جداً' }, 413);

  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    return json({ success: false, code: 'BAD_REQUEST', error: 'طلب غير صالح' }, 400);
  }

  const { status, body: out } = await handleRequest({
    body: body as { action?: string; payload?: Record<string, unknown> },
    headers: req.headers,
    ip,
    env: Deno.env.toObject()
  });
  return json(out, status);
});
