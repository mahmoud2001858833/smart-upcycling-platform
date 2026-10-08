/**
 * Client for the AI gateway. The OpenRouter key lives ONLY on the server side:
 *  - dev:  Vite middleware at /api/ai   (reads OPENROUTER_API_KEY from .env.local)
 *  - prod: Supabase Edge Function `ai-gateway` (reads the OPENROUTER_API_KEY secret)
 */

import { supabase } from '../supabaseClient.js';

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

/** Error with the server's machine-readable code (CAPACITY_CLOSED, NO_CREDIT, DAILY_LIMIT, IMAGES_PAUSED, FORBIDDEN …). */
export class AiError extends Error {
  constructor(message, code = 'ERROR') {
    super(message);
    this.name = 'AiError';
    this.code = code;
  }
}

/** Errors where silently switching to fake/legacy generators would hide a real limit from the person. */
export const isLimitError = e => ['CAPACITY_CLOSED', 'NO_CREDIT', 'DAILY_LIMIT', 'IMAGES_PAUSED', 'RATE_LIMIT'].includes(e?.code);

function unwrap(data) {
  if (!data || data.success === false) {
    throw new AiError(data?.error || 'فشل طلب الذكاء الاصطناعي', data?.code);
  }
  return data;
}

/** Anonymous but stable id so the server can count one browser's visits and daily use. */
export function getVisitorId() {
  try {
    let id = localStorage.getItem('upcycling_visitor_id');
    if (!id) {
      id = (crypto.randomUUID?.() || `v${Date.now()}${Math.random().toString(36).slice(2)}`).replace(/[^\w-]/g, '').slice(0, 40);
      localStorage.setItem('upcycling_visitor_id', id);
    }
    return id;
  } catch {
    return null;
  }
}

/** Real Supabase access token (or null). The server verifies it; nothing here is trusted. */
async function getAccessToken() {
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || null;
  } catch {
    return null;
  }
}

export async function callAi(action, payload = {}, { timeoutMs = 150000 } = {}) {
  const visitorId = getVisitorId();
  const body = JSON.stringify({ action, payload: visitorId ? { visitorId, ...payload } : payload });
  const token = await getAccessToken();
  const userHeaders = token ? { 'x-user-token': token } : {};

  if (devGatewayAvailable !== false) {
    try {
      const res = await postJson('/api/ai', userHeaders, body, timeoutMs);
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

  const res = await postJson(url, { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, ...userHeaders }, body, timeoutMs);
  let data = null;
  try { data = await res.json(); } catch { /* handled below */ }
  if (!res.ok && !data) throw new Error(`فشل الاتصال بالبوابة (${res.status})`);
  return unwrap(data);
}
