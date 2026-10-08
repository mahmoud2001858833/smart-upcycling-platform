/**
 * Platform layer — usage store, capacity decisions, credit lookup and admin identity.
 *
 * Pure ESM that only needs `fetch` and Web Crypto, so it runs unchanged in the Supabase Edge
 * Function (Deno) and in the Vite dev middleware (Node). Nothing here is ever bundled for the browser.
 */

export const DEFAULT_ADMIN_EMAIL = 'jowmahmoud6@gmail.com';

const int = (v, d) => { const n = parseInt(v, 10); return Number.isFinite(n) ? n : d; };
const flt = (v, d) => { const n = parseFloat(v); return Number.isFinite(n) ? n : d; };
const clip = (s, n) => String(s ?? '').slice(0, n);

/* ------------------------------------------------------------------ */
/* Limits                                                              */
/* ------------------------------------------------------------------ */

export function resolveLimits(env = {}) {
  return {
    maxProjects: Math.max(1, Math.min(3, int(env.MAX_PROJECTS, 3))),

    // Load: how many generations *started* in the last windowSec seconds.
    windowSec: int(env.CAPACITY_WINDOW_SEC, 60),
    busyAt: int(env.CAPACITY_BUSY_AT, 8),     // -> 2 projects
    heavyAt: int(env.CAPACITY_HEAVY_AT, 16),  // -> 1 project
    stopAt: int(env.CAPACITY_STOP_AT, 30),    // -> temporarily closed

    // Credit (USD remaining on the OpenRouter key).
    creditLowUsd: flt(env.CREDIT_LOW_USD, 3),       // <= -> 2 projects
    creditCriticalUsd: flt(env.CREDIT_CRITICAL_USD, 1), // <= -> 1 project, no images
    creditStopUsd: flt(env.CREDIT_STOP_USD, 0.25),  // <= -> closed

    // Per-person daily caps (anonymous visitors are keyed by IP and get a larger allowance
    // because a whole school can share one address).
    dailyGenerations: int(env.DAILY_GENERATIONS, 8),
    dailyProjects: int(env.DAILY_PROJECTS, 24),
    dailyImages: int(env.DAILY_IMAGES, 30),
    dailyChats: int(env.DAILY_CHATS, 40),
    anonMultiplier: int(env.ANON_MULTIPLIER, 3),

    // Used for the runway estimate until real costs have been recorded.
    estProjectCostUsd: flt(env.EST_PROJECT_COST_USD, 0.15),
    estImageCostUsd: flt(env.EST_IMAGE_COST_USD, 0.04)
  };
}

/* ------------------------------------------------------------------ */
/* Capacity                                                            */
/* ------------------------------------------------------------------ */

const LEVEL_RANK = { normal: 0, busy: 1, heavy: 2, closed: 3 };

/**
 * Decide how many projects a visitor may get right now.
 * @returns {{level:string, projects:number, imagesAllowed:boolean, causes:string[], reasons:string[], message:string}}
 */
export function decideCapacity({ pressure = 0, remaining = null, limits }) {
  let projects = limits.maxProjects;
  let level = 'normal';
  const causes = new Set();
  const reasons = [];

  const lower = (n, lvl, cause, why) => {
    projects = Math.min(projects, n);
    if (LEVEL_RANK[lvl] > LEVEL_RANK[level]) level = lvl;
    causes.add(cause);
    reasons.push(why);
  };

  if (pressure >= limits.stopAt) lower(0, 'closed', 'load', `الضغط ${pressure} ≥ ${limits.stopAt}`);
  else if (pressure >= limits.heavyAt) lower(1, 'heavy', 'load', `الضغط ${pressure} ≥ ${limits.heavyAt}`);
  else if (pressure >= limits.busyAt) lower(2, 'busy', 'load', `الضغط ${pressure} ≥ ${limits.busyAt}`);

  if (remaining != null) {
    if (remaining <= limits.creditStopUsd) lower(0, 'closed', 'credit', `الرصيد $${remaining.toFixed(2)} ≤ $${limits.creditStopUsd}`);
    else if (remaining <= limits.creditCriticalUsd) lower(1, 'heavy', 'credit', `الرصيد $${remaining.toFixed(2)} ≤ $${limits.creditCriticalUsd}`);
    else if (remaining <= limits.creditLowUsd) lower(2, 'busy', 'credit', `الرصيد $${remaining.toFixed(2)} ≤ $${limits.creditLowUsd}`);
  }

  const imagesAllowed = level !== 'closed' && !(remaining != null && remaining <= limits.creditCriticalUsd);
  const byCredit = causes.has('credit');
  const count = projects === 1 ? 'مشروعاً واحداً' : 'مشروعين';

  let message = '';
  if (level === 'closed') {
    message = byCredit
      ? 'خدمة التوليد متوقفة مؤقتاً. يرجى المحاولة لاحقاً.'
      : 'المنصة مزدحمة جداً الآن. حاول مرة أخرى بعد دقيقة.';
  } else if (level !== 'normal') {
    message = byCredit
      ? `موارد الذكاء الاصطناعي محدودة حالياً، لذلك سننتج لك ${count} هذه المرة.`
      : `المنصة مزدحمة الآن، لذلك سننتج لك ${count} هذه المرة ليبقى الجميع سريعاً.`;
    if (!imagesAllowed) message += ' وتوليد الصور متوقف مؤقتاً.';
  }

  return { level, projects, imagesAllowed, causes: [...causes], reasons, message };
}

/** What any visitor may see (no dollar amounts, no internal thresholds). */
export function publicCapacity(cap, limits) {
  return {
    level: cap.level,
    projects: cap.projects,
    maxProjects: limits.maxProjects,
    imagesAllowed: cap.imagesAllowed,
    message: cap.message
  };
}

/* ------------------------------------------------------------------ */
/* OpenRouter credit                                                   */
/* ------------------------------------------------------------------ */

const creditCache = new Map(); // key -> { at, value }

async function getJson(url, headers, timeoutMs = 6000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { headers, signal: ctrl.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Remaining OpenRouter credit. Uses the key's own limit when one is set, otherwise the account
 * credits endpoint (which may need a management key). `remaining === null` means "unknown".
 */
export async function fetchCredit({ apiKey, apiBase, managementKey = '', ttlMs = 60_000, force = false }) {
  if (!apiKey) return { remaining: null, known: false, source: 'none' };
  const cacheKey = `${apiBase}|${apiKey.slice(-8)}`;
  const hit = creditCache.get(cacheKey);
  if (!force && hit && Date.now() - hit.at < ttlMs) return hit.value;

  const headers = { Authorization: `Bearer ${apiKey}` };
  let value = { remaining: null, usage: null, limit: null, known: false, source: 'unknown' };

  const key = await getJson(`${apiBase}/key`, headers);
  const k = key?.data;
  if (k) {
    value = { ...value, usage: Number(k.usage) || 0, limit: k.limit ?? null, isFreeTier: Boolean(k.is_free_tier) };
    if (k.limit_remaining != null && Number.isFinite(Number(k.limit_remaining))) {
      value = { ...value, remaining: Number(k.limit_remaining), known: true, source: 'key-limit' };
    }
  }
  if (!value.known) {
    // /credits normally needs a management key; try it first when one is configured.
    const credits = await getJson(`${apiBase}/credits`, managementKey ? { Authorization: `Bearer ${managementKey}` } : headers);
    const c = credits?.data;
    if (c && Number.isFinite(Number(c.total_credits))) {
      const used = Number(c.total_usage) || 0;
      value = { ...value, remaining: Number(c.total_credits) - used, usage: used, known: true, source: 'account-credits' };
    }
  }
  creditCache.set(cacheKey, { at: Date.now(), value });
  return value;
}

/* ------------------------------------------------------------------ */
/* Identity & admin                                                    */
/* ------------------------------------------------------------------ */

const identityCache = new Map(); // token -> { exp, identity }

export function isAdminIdentity(identity, env = {}) {
  if (!identity?.email || !identity.confirmed) return false;
  const adminEmail = String(env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim().toLowerCase();
  if (identity.email !== adminEmail) return false;
  // Optional pin: once the owner has signed in once, set ADMIN_USER_ID so nobody can ever
  // take over the address by registering it on a project that has email confirmation off.
  if (env.ADMIN_USER_ID && identity.id !== env.ADMIN_USER_ID) return false;
  return true;
}

/**
 * Verify a Supabase access token with Supabase itself. A token typed into localStorage, a
 * "guest" token or a forged JWT all fail here, so the admin check can never be faked client-side.
 */
export async function resolveIdentity({ token, env = {} }) {
  if (!token || typeof token !== 'string' || token === 'guest_token' || token.length < 20 || token.length > 4000) return null;

  const withAdmin = identity => (identity ? { ...identity, isAdmin: isAdminIdentity(identity, env) } : null);
  const hit = identityCache.get(token);
  if (hit && hit.exp > Date.now()) return withAdmin(hit.identity);

  const url = String(env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
  const anon = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || '';
  if (!url || !anon) return null;

  const u = await getJson(`${url}/auth/v1/user`, { apikey: anon, Authorization: `Bearer ${token}` });
  let identity = null;
  if (u?.id) {
    identity = {
      id: u.id,
      email: String(u.email || '').toLowerCase(),
      confirmed: Boolean(u.email_confirmed_at || u.confirmed_at),
      provider: u.app_metadata?.provider || null
    };
  }
  if (identityCache.size > 500) identityCache.clear();
  identityCache.set(token, { exp: Date.now() + (identity ? 5 * 60_000 : 20_000), identity });
  return withAdmin(identity);
}

export async function hashIp(ip, salt = 'upcycling') {
  if (!ip) return null;
  const data = new TextEncoder().encode(`${salt}|${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join('');
}

/* ------------------------------------------------------------------ */
/* Stores                                                              */
/* ------------------------------------------------------------------ */

const matchEvent = (e, f) =>
  (!f.kinds || f.kinds.includes(e.kind)) &&
  (!f.status || e.status === f.status) &&
  (!f.sinceMs || Date.parse(e.created_at) >= f.sinceMs) &&
  (!f.user_id || e.user_id === f.user_id) &&
  (!f.ip_hash || e.ip_hash === f.ip_hash) &&
  (!f.visitor_id || e.visitor_id === f.visitor_id);

export function createMemoryStore() {
  const events = [];
  const projects = [];
  let seq = 1;
  return {
    kind: 'memory',
    async logEvent(e) {
      events.push({ id: seq++, created_at: new Date().toISOString(), status: 'ok', meta: {}, ...e });
      if (events.length > 5000) events.shift();
    },
    async saveProject(p) {
      projects.push({ id: crypto.randomUUID(), created_at: new Date().toISOString(), ...p });
      if (projects.length > 1000) projects.shift();
    },
    async countEvents(f = {}) {
      return events.filter(e => matchEvent(e, f)).length;
    },
    async recentEvents({ limit = 100, ...f } = {}) {
      return events.filter(e => matchEvent(e, f)).slice(-limit).reverse();
    },
    async listProjects({ limit = 20, offset = 0, q = '' } = {}) {
      const needle = q.trim().toLowerCase();
      const all = projects
        .filter(p => !needle || `${p.name} ${p.materials}`.toLowerCase().includes(needle))
        .slice().reverse();
      const items = all.slice(offset, offset + limit).map(({ project: _p, ...rest }) => rest);
      return { items, total: all.length };
    },
    async getProject(id) {
      return projects.find(p => p.id === id) || null;
    },
    async countProjects() {
      return projects.length;
    },
    async firstEventAt() {
      return events.length ? events[0].created_at : null;
    }
  };
}

export function createSupabaseStore({ url, serviceKey }) {
  const base = `${url.replace(/\/$/, '')}/rest/v1`;
  const baseHeaders = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' };

  async function rest(path, { method = 'GET', body, headers = {} } = {}) {
    const res = await fetch(`${base}/${path}`, {
      method,
      headers: { ...baseHeaders, ...headers },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`store ${method} ${path.split('?')[0]} → HTTP ${res.status} ${text.slice(0, 160)}`);
    }
    return res;
  }

  const filters = f => {
    const p = [];
    if (f.kinds?.length) p.push(`kind=in.(${f.kinds.map(k => String(k).replace(/[^\w]/g, '')).join(',')})`);
    if (f.status) p.push(`status=eq.${encodeURIComponent(f.status)}`);
    if (f.sinceMs) p.push(`created_at=gte.${encodeURIComponent(new Date(f.sinceMs).toISOString())}`);
    if (f.user_id) p.push(`user_id=eq.${encodeURIComponent(f.user_id)}`);
    if (f.ip_hash) p.push(`ip_hash=eq.${encodeURIComponent(f.ip_hash)}`);
    if (f.visitor_id) p.push(`visitor_id=eq.${encodeURIComponent(f.visitor_id)}`);
    return p;
  };
  const totalOf = res => {
    const m = /\/(\d+)$/.exec(res.headers.get('content-range') || '');
    return m ? Number(m[1]) : 0;
  };

  return {
    kind: 'supabase',
    async logEvent(e) {
      await rest('usage_events', { method: 'POST', body: e, headers: { Prefer: 'return=minimal' } });
    },
    async saveProject(p) {
      await rest('generated_projects', { method: 'POST', body: p, headers: { Prefer: 'return=minimal' } });
    },
    async countEvents(f = {}) {
      const res = await rest(`usage_events?select=id&${filters(f).join('&')}`, {
        headers: { Prefer: 'count=exact', 'Range-Unit': 'items', Range: '0-0' }
      });
      return totalOf(res);
    },
    async recentEvents({ limit = 100, slim = false, ...f } = {}) {
      const cols = slim
        ? 'created_at,kind,status,user_id,visitor_id,ip_hash,cost_usd'
        : 'id,created_at,kind,status,user_id,user_email,visitor_id,ip_hash,model,cost_usd,tokens,duration_ms,meta';
      const res = await rest(`usage_events?select=${cols}&${filters(f).join('&')}&order=created_at.desc&limit=${Math.min(limit, 5000)}`);
      return res.json();
    },
    async listProjects({ limit = 20, offset = 0, q = '' } = {}) {
      const needle = q.replace(/[,()*%\\]/g, ' ').trim();
      const search = needle ? `&or=(name.ilike.*${encodeURIComponent(needle)}*,materials.ilike.*${encodeURIComponent(needle)}*)` : '';
      const cols = 'id,created_at,user_id,user_email,visitor_id,materials,level,project_type,name,model';
      const res = await rest(`generated_projects?select=${cols}&order=created_at.desc${search}`, {
        headers: { Prefer: 'count=exact', 'Range-Unit': 'items', Range: `${offset}-${offset + limit - 1}` }
      });
      return { items: await res.json(), total: totalOf(res) };
    },
    async getProject(id) {
      if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
      const res = await rest(`generated_projects?id=eq.${id}&select=*&limit=1`);
      const rows = await res.json();
      return rows[0] || null;
    },
    async countProjects() {
      const res = await rest('generated_projects?select=id', {
        headers: { Prefer: 'count=exact', 'Range-Unit': 'items', Range: '0-0' }
      });
      return totalOf(res);
    },
    async firstEventAt() {
      const res = await rest('usage_events?select=created_at&order=created_at.asc&limit=1');
      const rows = await res.json();
      return rows[0]?.created_at || null;
    }
  };
}

export function getStore(env = {}) {
  const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL || '';
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || '';
  const sig = url && serviceKey ? `sb|${url}|${serviceKey.slice(-8)}` : 'memory';
  const g = globalThis;
  g.__upcyclingStores ||= new Map();
  if (!g.__upcyclingStores.has(sig)) {
    g.__upcyclingStores.set(sig, sig === 'memory' ? createMemoryStore() : createSupabaseStore({ url, serviceKey }));
  }
  return g.__upcyclingStores.get(sig);
}

/* ------------------------------------------------------------------ */
/* Aggregation for the admin dashboard                                 */
/* ------------------------------------------------------------------ */

const DAY = 86_400_000;

/**
 * @param events newest-first rows of usage_events
 * @param opts { now, days, tzOffsetMin }
 */
export function aggregateStats(events = [], { now = Date.now(), days = 14, tzOffsetMin = 0 } = {}) {
  const dayKey = ts => new Date(ts + tzOffsetMin * 60_000).toISOString().slice(0, 10);
  const series = new Map();
  for (let i = days - 1; i >= 0; i--) {
    series.set(dayKey(now - i * DAY), { date: dayKey(now - i * DAY), visits: 0, projects: 0, images: 0, errors: 0, cost: 0, _v: new Set() });
  }

  const windows = { d1: now - DAY, d7: now - 7 * DAY, d30: now - 30 * DAY };
  const empty = () => ({ visits: 0, visitors: new Set(), projects: 0, generations: 0, images: 0, chats: 0, errors: 0, throttled: 0, cost: 0 });
  const acc = { d1: empty(), d7: empty(), d30: empty() };

  let projectCostSum = 0, projectCount = 0, imageCostSum = 0, imageCount = 0, ideateCostSum = 0, ideateOk = 0;

  for (const e of events) {
    const ts = Date.parse(e.created_at);
    if (!Number.isFinite(ts)) continue;
    const cost = Number(e.cost_usd) || 0;
    const who = e.visitor_id || e.ip_hash || e.user_id || null;
    const isOk = e.status === 'ok';

    for (const [k, since] of Object.entries(windows)) {
      if (ts < since) continue;
      const a = acc[k];
      a.cost += cost;
      if (e.status === 'error') a.errors++;
      if (e.status === 'throttled') a.throttled++;
      if (!isOk) continue;
      if (e.kind === 'visit') { a.visits++; if (who) a.visitors.add(who); }
      else if (e.kind === 'develop') a.projects++;
      else if (e.kind === 'ideate') a.generations++;
      else if (e.kind === 'image') a.images++;
      else if (e.kind === 'chat') a.chats++;
    }

    const day = series.get(dayKey(ts));
    if (day) {
      day.cost += cost;
      if (e.status === 'error') day.errors++;
      if (isOk && e.kind === 'visit') { day.visits++; if (who) day._v.add(who); }
      if (isOk && e.kind === 'develop') day.projects++;
      if (isOk && e.kind === 'image') day.images++;
    }

    if (ts >= windows.d30 && isOk) {
      if (e.kind === 'develop') { projectCount++; projectCostSum += cost; }
      if (e.kind === 'ideate') { ideateOk++; ideateCostSum += cost; }
      if (e.kind === 'image' && e.cost_usd != null) { imageCount++; imageCostSum += cost; }
    }
  }

  // busiest clock hour (last 7 days) by finished projects
  const perHourCount = new Map();
  for (const e of events) {
    const ts = Date.parse(e.created_at);
    if (e.kind === 'develop' && e.status === 'ok' && ts >= windows.d7) {
      const h = Math.floor(ts / 3_600_000);
      perHourCount.set(h, (perHourCount.get(h) || 0) + 1);
    }
  }
  const peakProjectsPerHour = perHourCount.size ? Math.max(...perHourCount.values()) : 0;

  const fin = a => ({ ...a, visitors: a.visitors.size });
  // Per-project cost = writing it + its share of the brainstorm (one brainstorm feeds up to 3 projects).
  const ideateShare = projectCount ? (ideateCostSum / Math.max(1, ideateOk)) / Math.max(1, projectCount / Math.max(1, ideateOk)) : 0;
  const avgProjectCostUsd = projectCount && projectCostSum > 0 ? projectCostSum / projectCount + ideateShare : null;

  return {
    last24h: fin(acc.d1),
    last7d: fin(acc.d7),
    last30d: fin(acc.d30),
    series: [...series.values()].map(({ _v, ...d }) => ({ ...d, visitors: _v.size, cost: Number(d.cost.toFixed(4)) })),
    peakProjectsPerHour,
    avgProjectCostUsd,
    avgImageCostUsd: imageCount && imageCostSum > 0 ? imageCostSum / imageCount : null,
    sampled: events.length
  };
}

export { clip };
