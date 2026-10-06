/**
 * AI image store: generation queue + persistent cache.
 *
 * Generated images are large data URLs, so they are kept in IndexedDB (not localStorage,
 * and not in React app state that gets saved). Projects only carry the prompts; images are
 * looked up by a hash of the prompt, so a saved project gets its pictures back instantly.
 */

import { callAi } from './aiGateway.js';

const DB_NAME = 'upcycling-ai-images';
const STORE = 'images';
const MAX_PARALLEL = 3;

/* ---------------- hashing ---------------- */

export function hashKey(text) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36) + '-' + text.length.toString(36);
}

export function imageKey({ kind, visualBible = '', prompt = '' }) {
  return hashKey(`${kind}|${visualBible}|${prompt}`);
}

/* ---------------- IndexedDB (fails soft) ---------------- */

let dbPromise = null;
function openDb() {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  if (!dbPromise) {
    dbPromise = new Promise(resolve => {
      try {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => req.result.createObjectStore(STORE);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      } catch { resolve(null); }
    });
  }
  return dbPromise;
}

async function idbGet(key) {
  const db = await openDb();
  if (!db) return null;
  return new Promise(resolve => {
    try {
      const r = db.transaction(STORE).objectStore(STORE).get(key);
      r.onsuccess = () => resolve(r.result || null);
      r.onerror = () => resolve(null);
    } catch { resolve(null); }
  });
}

async function idbPut(key, value) {
  const db = await openDb();
  if (!db) return;
  try { db.transaction(STORE, 'readwrite').objectStore(STORE).put(value, key); } catch { /* quota etc. */ }
}

/* ---------------- image compression (browser only; passthrough elsewhere) ---------------- */

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image decode failed'));
    img.src = url;
  });
}

/** Re-encode to JPEG at a sane size so IndexedDB and memory stay small. */
export async function compressDataUrl(url, { maxSide = 1280, quality = 0.86, force = false } = {}) {
  if (typeof document === 'undefined' || typeof url !== 'string' || !url.startsWith('data:image/')) return url;
  try {
    const img = await loadImage(url);
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    const out = canvas.toDataURL('image/jpeg', quality);
    return force || out.length < url.length ? out : url;
  } catch {
    return url;
  }
}

/* ---------------- memory cache + queue ---------------- */

const memory = new Map();     // key -> dataUrl
const inflight = new Map();   // key -> Promise
const waiting = [];           // queued jobs {run, priority}
let running = 0;

function pump() {
  while (running < MAX_PARALLEL && waiting.length) {
    waiting.sort((a, b) => b.priority - a.priority);
    const job = waiting.shift();
    running++;
    job.run().finally(() => { running--; pump(); });
  }
}

export function peekImage(spec) {
  return memory.get(imageKey(spec)) || null;
}

export async function loadCachedImage(spec) {
  const key = imageKey(spec);
  if (memory.has(key)) return memory.get(key);
  const stored = await idbGet(key);
  if (stored) memory.set(key, stored);
  return stored;
}

/**
 * Get (or generate) one image. Resolves to a data URL, rejects on failure.
 * spec: { kind: 'hero'|'assembly'|'lifestyle'|'step', visualBible, prompt }
 */
export function requestImage(spec, { priority = 0, force = false, reference = null, stageLabel = '', isFinal = false } = {}) {
  const cacheKey = imageKey(spec);
  const flightKey = force ? `${cacheKey}#force` : cacheKey;

  if (!force && memory.has(cacheKey)) return Promise.resolve(memory.get(cacheKey));
  if (inflight.has(flightKey)) return inflight.get(flightKey);

  const p = (async () => {
    // Resolve the style reference BEFORE taking a queue slot, otherwise step jobs could fill
    // every slot while waiting for a hero job that is itself stuck in the queue.
    if (!force) {
      const stored = await idbGet(cacheKey);
      if (stored) { memory.set(cacheKey, stored); return stored; }
    }
    let referenceImage = null;
    try { referenceImage = typeof reference === 'function' ? await reference() : reference; } catch { referenceImage = null; }

    return new Promise((resolve, reject) => {
      waiting.push({
        priority,
        run: async () => {
          try {
            const res = await callAi('image', {
              kind: spec.kind,
              visualBible: spec.visualBible,
              prompt: spec.prompt,
              referenceImage: referenceImage || undefined,
              stageLabel: stageLabel || undefined,
              isFinal: isFinal || undefined
            }, { timeoutMs: 110000 });
            const packed = await compressDataUrl(res.imageUrl);
            memory.set(cacheKey, packed);
            idbPut(cacheKey, packed);
            resolve(packed);
          } catch (e) {
            reject(e);
          }
        }
      });
      pump();
    });
  })().finally(() => inflight.delete(flightKey));

  inflight.set(flightKey, p);
  return p;
}

/**
 * Small JPEG of the finished-object photo, used as the style reference for step images.
 * Resolves to null if the hero image is unavailable (steps are then generated without it).
 */
export function heroReferenceFor(project) {
  const spec = heroSpec(project, 'finished');
  if (!spec) return Promise.resolve(null);
  return requestImage(spec, { priority: 150 })
    .then(url => compressDataUrl(url, { maxSide: 512, quality: 0.8, force: true }))
    .catch(() => null);
}

/* ---------------- project helpers ---------------- */

export function heroSpec(project, view = 'finished') {
  const prompts = project?.imagePrompts || {};
  const map = {
    finished: ['hero', prompts.hero],
    assembly: ['assembly', prompts.assembly],
    inUse: ['lifestyle', prompts.lifestyle]
  };
  const [kind, prompt] = map[view] || map.finished;
  if (!prompt) return null;
  return { kind, visualBible: project.visualBible || '', prompt };
}

export function stepSpec(project, step) {
  if (!step?.imagePrompt) return null;
  return { kind: 'step', visualBible: project.visualBible || '', prompt: step.imagePrompt };
}

const isHeavy = v => typeof v === 'string' && v.startsWith('data:image/') && !v.startsWith('data:image/svg') && v.length > 2000;

/**
 * Never let generated data URLs reach localStorage / cloud saves.
 * Heavy images are swapped for the lightweight fallback (project.fallbackGallery);
 * the real pictures come back from IndexedDB by prompt hash when the project is opened.
 */
export function stripHeavyImages(project) {
  if (!project) return project;
  const fb = project.fallbackGallery || {};
  const swap = (v, key) => (isHeavy(v) ? (fb[key] || fb.finished || '') : v);
  const out = { ...project };
  if (out.gallery) out.gallery = Object.fromEntries(Object.entries(out.gallery).map(([k, v]) => [k, swap(v, k)]));
  if (out.multiAngleViews) out.multiAngleViews = Object.fromEntries(Object.entries(out.multiAngleViews).map(([k, v]) => [k, swap(v, k)]));
  out.generatedImage = swap(out.generatedImage, 'finished');
  out.image = swap(out.image, 'finished');
  return out;
}
