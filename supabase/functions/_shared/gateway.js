/**
 * Gateway — one request handler shared by the Supabase Edge Function and the Vite dev server.
 *
 * Responsibilities on top of the raw OpenRouter calls:
 *   - decide how many projects a visitor gets right now (load + remaining credit),
 *   - pause pictures when the budget or the server is under pressure,
 *   - per-person daily caps,
 *   - record visits, usage, cost and every generated project,
 *   - serve the admin dashboard — only to the verified admin account.
 *
 * Returns { status, body } and never throws.
 */

import {
  resolveConfig, ideate, develop, generateImage, chatReply, newMeter, GatewayError
} from './openrouterCore.js';
import { hasGemini } from './gemini.js';
import {
  resolveLimits, decideCapacity, publicCapacity, fetchCredit, resolveIdentity, hashIp,
  getStore, aggregateStats, clip
} from './platform.js';

const DAY = 86_400_000;
const HOUR = 3_600_000;

const IMAGE_KINDS = new Set(['hero', 'assembly', 'lifestyle', 'step']);
const IDEATE_COUNT = { 3: 8, 2: 6, 1: 5 };

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

function header(headers, name) {
  if (!headers) return '';
  if (typeof headers.get === 'function') return headers.get(name) || '';
  const key = Object.keys(headers).find(k => k.toLowerCase() === name.toLowerCase());
  const v = key ? headers[key] : '';
  return Array.isArray(v) ? v[0] : (v || '');
}

const cleanId = v => (typeof v === 'string' && /^[\w-]{8,64}$/.test(v) ? v : null);

function deviceOf(ua = '') {
  if (/bot|crawl|spider|headless/i.test(ua)) return 'bot';
  if (/ipad|tablet/i.test(ua)) return 'tablet';
  if (/mobi|android|iphone/i.test(ua)) return 'mobile';
  return ua ? 'desktop' : 'unknown';
}

function hostOf(url = '') {
  try { return new URL(url).host.slice(0, 80); } catch { return ''; }
}

function cleanStage(st) {
  if (!st || typeof st !== 'object') return null;
  return {
    title: clip(st.title, 160), goal: clip(st.goal, 300), measurements: clip(st.measurements, 300),
    checkpoint: clip(st.checkpoint, 300),
    actions: Array.isArray(st.actions) ? st.actions.slice(0, 8).map(a => clip(a, 300)) : []
  };
}

const strList = (v, n, max) => (Array.isArray(v) ? v.slice(0, n).map(x => clip(typeof x === 'string' ? x : (x?.name || x?.title || ''), max)).filter(Boolean) : []);

/** The assistant is told about the whole project; keep it bounded and plain. */
function cleanProjectContext(p) {
  if (!p || typeof p !== 'object') return null;
  return {
    name: clip(p.name, 120), materials: clip(p.materials, 400), idea: clip(p.idea, 800),
    difficulty: clip(p.difficulty, 40), time: clip(p.time, 60), cost: clip(p.cost, 60),
    materialsList: strList(p.materialsList, 20, 120), tools: strList(p.tools, 20, 80), safety: strList(p.safety, 10, 200),
    steps: (Array.isArray(p.steps) ? p.steps.slice(0, 14) : []).map(st => ({
      title: clip(st?.title, 100), tip: clip(st?.tip, 160), goal: clip(st?.goal, 220), measurements: clip(st?.measurements, 220), actions: strList(st?.actions, 8, 220)
    }))
  };
}

function cleanFocus(f) {
  if (!f || typeof f !== 'object') return null;
  const index = Number.isInteger(f.index) ? f.index : null;
  return { index, title: clip(f.title, 100) };
}

const money = n => (Number.isFinite(n) ? Number(n.toFixed(6)) : null);

/* ------------------------------------------------------------------ */
/* Capacity                                                            */
/* ------------------------------------------------------------------ */

const capCache = new Map(); // signature -> { at, value }

async function currentPressure(store, limits) {
  const sinceMs = Date.now() - limits.windowSec * 1000;
  const [starts, images] = await Promise.all([
    store.countEvents({ kinds: ['gen_start'], sinceMs }),
    store.countEvents({ kinds: ['image'], status: 'ok', sinceMs })
  ]);
  // a picture is heavier than a text request, but much lighter than a whole generation
  return starts + Math.floor(images / 2);
}

async function getCapacity({ apiKey, config, limits, store, env, force = false }) {
  const sig = `${apiKey ? apiKey.slice(-6) : 'nokey'}|${store.kind}`;
  const hit = capCache.get(sig);
  if (!force && hit && Date.now() - hit.at < 4000) return hit.value;

  const [pressure, credit] = await Promise.all([
    currentPressure(store, limits).catch(() => 0),
    fetchCredit({ apiKey, apiBase: config.apiBase, managementKey: env.OPENROUTER_MANAGEMENT_KEY || '', force })
  ]);
  const cap = decideCapacity({ pressure, remaining: credit.known ? credit.remaining : null, limits });
  const value = { cap, pressure, credit };
  capCache.set(sig, { at: Date.now(), value });
  return value;
}

/** The admin is not throttled by load (so they can always test), but nobody can outrun an empty balance. */
function effectiveCap(cap, viewer, limits) {
  if (!viewer.isAdmin || cap.causes.includes('credit')) return cap;
  return decideCapacity({ pressure: 0, remaining: null, limits });
}

/* ------------------------------------------------------------------ */
/* Per-person daily caps                                               */
/* ------------------------------------------------------------------ */

const DAILY = {
  ideate: { limit: 'dailyGenerations', what: 'توليد المشاريع' },
  develop: { limit: 'dailyProjects', what: 'المشاريع' },
  image: { limit: 'dailyImages', what: 'توليد الصور' },
  chat: { limit: 'dailyChats', what: 'استشارة الخبير' }
};

function viewerFilter(viewer) {
  if (viewer.userId) return { user_id: viewer.userId };
  if (viewer.ipHash) return { ip_hash: viewer.ipHash };
  return { visitor_id: viewer.visitorId || 'anon-unknown' };
}

async function enforceDaily({ store, limits, viewer, kind }) {
  if (viewer.isAdmin) return;
  const spec = DAILY[kind];
  if (!spec) return;
  const base = limits[spec.limit];
  const max = viewer.userId ? base : base * limits.anonMultiplier;
  let used = 0;
  try {
    used = await store.countEvents({
      kinds: [kind], status: 'ok', sinceMs: Date.now() - DAY, ...viewerFilter(viewer)
    });
  } catch (err) {
    // usage tables missing / database hiccup: do not take generation down with it
    console.warn('[usage] daily cap check skipped:', err.message);
    return;
  }
  if (used >= max) {
    throw new GatewayError(
      `وصلت إلى الحد اليومي في ${spec.what}. يتجدد الحد خلال 24 ساعة، فجرّب لاحقاً.`,
      { status: 429, code: 'DAILY_LIMIT' }
    );
  }
}

/* ------------------------------------------------------------------ */
/* Logging (never allowed to break a request)                          */
/* ------------------------------------------------------------------ */

async function safeLog(store, viewer, e) {
  try {
    await store.logEvent({
      kind: e.kind,
      status: e.status || 'ok',
      user_id: viewer.userId || null,
      user_email: viewer.email || null,
      visitor_id: viewer.visitorId || null,
      ip_hash: viewer.ipHash || null,
      model: e.model ? clip(e.model, 80) : null,
      cost_usd: e.cost != null ? money(e.cost) : null,
      tokens: Number.isFinite(e.tokens) ? Math.round(e.tokens) : null,
      duration_ms: Number.isFinite(e.durationMs) ? Math.round(e.durationMs) : null,
      meta: e.meta || {}
    });
  } catch (err) {
    console.warn('[usage] could not record event:', err.message);
  }
}

/* ------------------------------------------------------------------ */
/* Viewer                                                              */
/* ------------------------------------------------------------------ */

async function describeViewer({ payload, headers, ip, env }) {
  const token = header(headers, 'x-user-token');
  const identity = await resolveIdentity({ token, env }).catch(() => null);
  const ipHash = await hashIp(ip, env.IP_SALT || 'upcycling');
  return {
    userId: identity?.id || null,
    email: identity?.email || null,
    isAdmin: Boolean(identity?.isAdmin),
    signedIn: Boolean(identity),
    // with no address at all, everyone shares one strict bucket instead of escaping the caps
    visitorId: cleanId(payload?.visitorId) || (ipHash ? null : 'anon-unknown'),
    ipHash
  };
}

/* ------------------------------------------------------------------ */
/* Admin                                                               */
/* ------------------------------------------------------------------ */

function requireAdmin(viewer) {
  if (!viewer.isAdmin) throw new GatewayError('غير مصرح', { status: 403, code: 'FORBIDDEN' });
}

async function adminStats({ store, config, limits, apiKey, env, payload }) {
  const now = Date.now();
  const tz = Math.max(-840, Math.min(840, Number(payload?.tzOffsetMin) || 0));

  const [events, first, totalProjects, totalVisits, totalGenerations, totalImages, capacity] = await Promise.all([
    store.recentEvents({ kinds: ['visit', 'ideate', 'develop', 'image', 'chat'], sinceMs: now - 30 * DAY, limit: 5000, slim: true }),
    store.firstEventAt(),
    store.countProjects(),
    store.countEvents({ kinds: ['visit'], status: 'ok' }),
    store.countEvents({ kinds: ['ideate'], status: 'ok' }),
    store.countEvents({ kinds: ['image'], status: 'ok' }),
    getCapacity({ apiKey, config, limits, store, env, force: true })
  ]);

  const stats = aggregateStats(events, { now, days: 14, tzOffsetMin: tz });
  const remaining = capacity.credit.known ? capacity.credit.remaining : null;

  const perProject = stats.avgProjectCostUsd ?? limits.estProjectCostUsd;
  const perImage = stats.avgImageCostUsd ?? limits.estImageCostUsd;
  const runway = {
    remainingUsd: remaining,
    perProjectUsd: money(perProject),
    perImageUsd: money(perImage),
    estimated: stats.avgProjectCostUsd == null,
    // projects are produced in groups of up to 3 by one brainstorm, so report both views
    projects: remaining != null && perProject > 0 ? Math.max(0, Math.floor(remaining / perProject)) : null,
    images: remaining != null && perImage > 0 ? Math.max(0, Math.floor(remaining / perImage)) : null
  };

  // How many projects can the platform make per hour? Two independent ceilings:
  //  - by load: the busy/heavy/stop thresholds cap how many generations may start per window,
  //    and each level hands out fewer projects (3 below busyAt, 2 below heavyAt, 1 below stopAt);
  //  - by credit: remaining balance / average cost of a project.
  const perHour = 3600 / limits.windowSec;
  const perWindow = Math.min(limits.busyAt, limits.stopAt) * limits.maxProjects
    + Math.max(0, Math.min(limits.heavyAt, limits.stopAt) - limits.busyAt) * Math.max(1, limits.maxProjects - 1)
    + Math.max(0, limits.stopAt - limits.heavyAt) * 1;
  const byLoadHour = Math.floor(perWindow * perHour);
  const byLoadComfortable = Math.floor(limits.busyAt * limits.maxProjects * perHour);
  const hourly = {
    comfortable: byLoadComfortable,
    maxByLoad: byLoadHour,
    byCredit: runway.projects,
    effective: runway.projects == null ? byLoadHour : Math.min(byLoadHour, runway.projects),
    last24hPeakPerHour: stats.peakProjectsPerHour ?? null
  };

  const launchEnv = env.PLATFORM_LAUNCH_AT && Date.parse(env.PLATFORM_LAUNCH_AT);
  const sinceMs = Number.isFinite(launchEnv) ? launchEnv : (first ? Date.parse(first) : now);

  const [visits, errors] = await Promise.all([
    store.recentEvents({ kinds: ['visit'], status: 'ok', limit: 60 }),
    store.recentEvents({ status: 'error', limit: 10 })
  ]);

  return {
    success: true,
    platform: {
      since: new Date(sinceMs).toISOString(),
      uptimeMs: Math.max(0, now - sinceMs),
      serverTime: new Date(now).toISOString(),
      storage: store.kind,
      launchFrom: Number.isFinite(launchEnv) ? 'env' : 'first-event'
    },
    totals: { projects: totalProjects, visits: totalVisits, generations: totalGenerations, images: totalImages },
    credit: capacity.credit,
    runway,
    hourly,
    capacity: {
      ...capacity.cap,
      pressure: capacity.pressure,
      thresholds: {
        busyAt: limits.busyAt, heavyAt: limits.heavyAt, stopAt: limits.stopAt, windowSec: limits.windowSec,
        creditLowUsd: limits.creditLowUsd, creditCriticalUsd: limits.creditCriticalUsd, creditStopUsd: limits.creditStopUsd
      }
    },
    stats,
    recentVisits: visits.map(v => ({
      at: v.created_at,
      who: v.user_email || null,
      signedIn: Boolean(v.user_id),
      visitor: (v.visitor_id || '').slice(0, 6) || null,
      ip: (v.ip_hash || '').slice(0, 6) || null,
      country: v.meta?.country || null,
      device: v.meta?.device || null,
      path: v.meta?.path || '/',
      from: v.meta?.referrer || null
    })),
    recentErrors: errors.map(e => ({
      at: e.created_at, kind: e.kind, model: e.model || null, message: e.meta?.error || null
    }))
  };
}

/* ------------------------------------------------------------------ */
/* Actions                                                             */
/* ------------------------------------------------------------------ */

const actions = {
  /** Cheap, cached; the page polls this to show the "busy" banner and to learn who is looking. */
  async status({ ctx }) {
    const c = await getCapacity(ctx);
    const eff = effectiveCap(c.cap, ctx.viewer, ctx.limits);
    return {
      success: true,
      capacity: publicCapacity(eff, ctx.limits),
      viewer: { signedIn: ctx.viewer.signedIn, isAdmin: ctx.viewer.isAdmin }
    };
  },

  async track({ ctx, payload }) {
    const { store, viewer, headers } = ctx;
    // at most a few records per person per 5 minutes, whatever the client does
    const recent = await store.countEvents({
      kinds: ['visit'], sinceMs: Date.now() - 5 * 60_000, ...viewerFilter(viewer)
    }).catch(() => 0);
    if (recent < 3) {
      await safeLog(store, viewer, {
        kind: 'visit',
        meta: {
          path: clip(payload?.path || '/', 120),
          referrer: hostOf(payload?.referrer),
          device: deviceOf(header(headers, 'user-agent')),
          country: clip(header(headers, 'cf-ipcountry') || header(headers, 'x-vercel-ip-country') || '', 3) || null,
          lang: clip(payload?.lang || '', 12)
        }
      });
    }
    const c = await getCapacity(ctx);
    return {
      success: true,
      capacity: publicCapacity(effectiveCap(c.cap, viewer, ctx.limits), ctx.limits),
      viewer: { signedIn: viewer.signedIn, isAdmin: viewer.isAdmin }
    };
  },

  async ideate({ ctx, payload }) {
    const { store, viewer, limits, config, apiKey } = ctx;
    const started = Date.now();

    const c = await getCapacity({ ...ctx, force: true });
    const cap = effectiveCap(c.cap, viewer, limits);
    if (cap.level === 'closed') {
      await safeLog(store, viewer, { kind: 'ideate', status: 'throttled', meta: { reason: cap.reasons.join(' | ') } });
      throw new GatewayError(cap.message, {
        status: 503, code: cap.causes.includes('credit') ? 'NO_CREDIT' : 'CAPACITY_CLOSED'
      });
    }
    try {
      await enforceDaily({ store, limits, viewer, kind: 'ideate' });
    } catch (e) {
      await safeLog(store, viewer, { kind: 'ideate', status: 'throttled', meta: { reason: 'daily' } });
      throw e;
    }

    const wanted = Math.max(1, Math.min(3, Number(payload?.take) || limits.maxProjects));
    const take = Math.min(wanted, cap.projects);

    await safeLog(store, viewer, { kind: 'gen_start', meta: { take, level: cap.level } });

    const meter = newMeter();
    try {
      const r = await ideate({
        apiKey, config, meter, take,
        materials: payload?.materials, level: payload?.level, type: payload?.type,
        count: IDEATE_COUNT[take] || 8, avoid: Array.isArray(payload?.avoid) ? payload.avoid : []
      });
      await safeLog(store, viewer, {
        kind: 'ideate', model: r.model, cost: meter.cost, tokens: meter.tokens, durationMs: Date.now() - started,
        meta: { take, asked: wanted, level: cap.level, materials: clip(payload?.materials, 200) }
      });
      return {
        success: true,
        concepts: r.top,
        allConcepts: r.all,
        model: r.model,
        capacity: { ...publicCapacity(cap, limits), granted: r.top.length, asked: wanted }
      };
    } catch (e) {
      await safeLog(store, viewer, {
        kind: 'ideate', status: 'error', cost: meter.cost, durationMs: Date.now() - started,
        meta: { error: clip(e.message, 300), code: e.code }
      });
      throw e;
    }
  },

  async develop({ ctx, payload }) {
    const { store, viewer, limits, config, apiKey } = ctx;
    if (!payload?.concept) throw new GatewayError('concept مطلوب', { status: 400, code: 'BAD_REQUEST' });
    const started = Date.now();

    const c = await getCapacity(ctx);
    const cap = effectiveCap(c.cap, viewer, limits);
    if (cap.level === 'closed') {
      throw new GatewayError(cap.message, { status: 503, code: cap.causes.includes('credit') ? 'NO_CREDIT' : 'CAPACITY_CLOSED' });
    }
    await enforceDaily({ store, limits, viewer, kind: 'develop' });

    const meter = newMeter();
    try {
      const r = await develop({
        apiKey, config, meter,
        materials: payload.materials, concept: payload.concept, level: payload.level, type: payload.type
      });
      const cost = meter.cost;
      await safeLog(store, viewer, {
        kind: 'develop', model: r.model, cost, tokens: meter.tokens, durationMs: Date.now() - started,
        meta: { name: clip(r.project?.name, 120), repaired: Boolean(r.repaired) }
      });
      try {
        await store.saveProject({
          user_id: viewer.userId, user_email: viewer.email, visitor_id: viewer.visitorId, ip_hash: viewer.ipHash,
          materials: clip(payload.materials, 1500), level: clip(payload.level, 40), project_type: clip(payload.type, 40),
          name: clip(r.project?.name, 200), model: clip(r.model, 80), cost_usd: money(cost),
          project: r.project
        });
      } catch (err) {
        console.warn('[usage] could not save project:', err.message);
      }
      return { success: true, project: r.project, model: r.model, repaired: r.repaired };
    } catch (e) {
      await safeLog(store, viewer, {
        kind: 'develop', status: 'error', cost: meter.cost, durationMs: Date.now() - started,
        meta: { error: clip(e.message, 300), code: e.code }
      });
      throw e;
    }
  },

  async image({ ctx, payload }) {
    const { store, viewer, limits, config, apiKey } = ctx;
    const prompt = clip(payload?.prompt, 2500);
    if (!prompt.trim()) throw new GatewayError('prompt مطلوب', { status: 400, code: 'BAD_REQUEST' });
    const kind = IMAGE_KINDS.has(payload?.kind) ? payload.kind : 'step';
    const started = Date.now();

    const c = await getCapacity(ctx);
    const cap = effectiveCap(c.cap, viewer, limits);
    if (!cap.imagesAllowed) {
      await safeLog(store, viewer, { kind: 'image', status: 'throttled', meta: { reason: cap.reasons.join(' | ') } });
      throw new GatewayError(
        'توليد الصور متوقف مؤقتاً بسبب الازدحام أو محدودية الرصيد. فكرة المشروع وخطواته متاحة بالكامل، وجرّب الصورة لاحقاً.',
        { status: 503, code: 'IMAGES_PAUSED' }
      );
    }
    try {
      await enforceDaily({ store, limits, viewer, kind: 'image' });
    } catch (e) {
      await safeLog(store, viewer, { kind: 'image', status: 'throttled', meta: { reason: 'daily' } });
      throw e;
    }

    const meter = newMeter();
    try {
      const r = await generateImage({
        apiKey, config, meter, kind,
        visualBible: clip(payload?.visualBible, 1500), prompt,
        referenceImage: payload?.referenceImage, stageLabel: clip(payload?.stageLabel, 40),
        isFinal: Boolean(payload?.isFinal), hd: payload?.hd !== false,
        projectName: clip(payload?.projectName, 120), stage: cleanStage(payload?.stage)
      });
      await safeLog(store, viewer, {
        kind: 'image', model: r.model, cost: meter.cost, tokens: meter.tokens, durationMs: Date.now() - started,
        meta: { picture: kind, size: r.size || '1K', withReference: Boolean(r.usedReference) }
      });
      return { success: true, imageUrl: r.imageUrl, model: r.model, size: r.size || '1K' };
    } catch (e) {
      await safeLog(store, viewer, {
        kind: 'image', status: 'error', cost: meter.cost, durationMs: Date.now() - started,
        meta: { error: clip(e.message, 300), code: e.code, picture: kind }
      });
      throw e;
    }
  },

  async chat({ ctx, payload }) {
    const { store, viewer, limits, config, apiKey } = ctx;
    const started = Date.now();
    const c = await getCapacity(ctx);
    const cap = effectiveCap(c.cap, viewer, limits);
    if (cap.level === 'closed' && !hasGemini(config.gemini)) {
      throw new GatewayError(cap.message, { status: 503, code: cap.causes.includes('credit') ? 'NO_CREDIT' : 'CAPACITY_CLOSED' });
    }
    await enforceDaily({ store, limits, viewer, kind: 'chat' });
    const meter = newMeter();
    try {
      const r = await chatReply({
        apiKey, config, meter, question: payload?.question, history: Array.isArray(payload?.history) ? payload.history : [],
        project: cleanProjectContext(payload?.project), focusStep: cleanFocus(payload?.focusStep)
      });
      await safeLog(store, viewer, {
        kind: 'chat', model: r.model, cost: meter.cost, tokens: meter.tokens, durationMs: Date.now() - started
      });
      return { success: true, reply: r.reply, model: r.model };
    } catch (e) {
      await safeLog(store, viewer, {
        kind: 'chat', status: 'error', cost: meter.cost, durationMs: Date.now() - started, meta: { error: clip(e.message, 300) }
      });
      throw e;
    }
  },

  /* ----- admin only ----- */

  async admin_stats({ ctx, payload }) {
    requireAdmin(ctx.viewer);
    return adminStats({ ...ctx, payload });
  },

  async admin_projects({ ctx, payload }) {
    requireAdmin(ctx.viewer);
    const pageSize = Math.max(1, Math.min(50, Number(payload?.pageSize) || 20));
    const page = Math.max(0, Number(payload?.page) || 0);
    const r = await ctx.store.listProjects({ limit: pageSize, offset: page * pageSize, q: clip(payload?.q, 80) });
    return { success: true, items: r.items, total: r.total, page, pageSize };
  },

  async admin_project({ ctx, payload }) {
    requireAdmin(ctx.viewer);
    const row = await ctx.store.getProject(String(payload?.id || ''));
    if (!row) throw new GatewayError('المشروع غير موجود', { status: 404, code: 'NOT_FOUND' });
    return { success: true, project: row };
  }
};

/* ------------------------------------------------------------------ */
/* Entry                                                               */
/* ------------------------------------------------------------------ */

const PUBLIC_ERROR = 'تعذّر إكمال الطلب الآن، حاول مرة أخرى بعد قليل.';

/**
 * @param {{ body: {action?:string,payload?:object}, headers?: any, ip?: string, env?: object, store?: object }} req
 * @returns {Promise<{status:number, body:object}>}
 */
export async function handleRequest({ body, headers = {}, ip = '', env = {}, store = null }) {
  let viewer = { isAdmin: false };
  try {
    const action = body?.action;
    const payload = body?.payload && typeof body.payload === 'object' ? body.payload : {};
    const fn = Object.prototype.hasOwnProperty.call(actions, action) ? actions[action] : null;
    if (!fn) throw new GatewayError(`إجراء غير معروف: ${clip(action, 40)}`, { status: 400, code: 'BAD_ACTION' });

    const theStore = store || getStore(env);
    viewer = await describeViewer({ payload, headers, ip, env });
    const ctx = {
      store: theStore, viewer, headers, env,
      apiKey: env.OPENROUTER_API_KEY,
      config: resolveConfig(env),
      limits: resolveLimits(env)
    };
    return { status: 200, body: await fn({ ctx, payload }) };
  } catch (e) {
    const known = e instanceof GatewayError;
    const expose = known || viewer.isAdmin || env.EXPOSE_ERRORS === '1';
    if (!known) console.warn('[gateway] request failed:', e?.message);
    if (e?.code === 'NO_CREDIT') capCache.clear();
    return {
      status: known ? e.status : 500,
      body: {
        success: false,
        code: known ? e.code : 'ERROR',
        error: expose ? (e?.message || PUBLIC_ERROR) : PUBLIC_ERROR
      }
    };
  }
}
