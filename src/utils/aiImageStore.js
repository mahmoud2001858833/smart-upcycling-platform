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
export function requestImage(spec, { priority = 0, force = false } = {}) {
  const key = imageKey(force ? { ...spec, prompt: spec.prompt + `#${Date.now()}` } : spec);
  const cacheKey = imageKey(spec);

  if (!force && memory.has(cacheKey)) return Promise.resolve(memory.get(cacheKey));
  if (!force && inflight.has(cacheKey)) return inflight.get(cacheKey);

  const p = new Promise((resolve, reject) => {
    waiting.push({
      priority,
      run: async () => {
        try {
          if (!force) {
            const stored = await idbGet(cacheKey);
            if (stored) { memory.set(cacheKey, stored); return resolve(stored); }
          }
          const res = await callAi('image', {
            kind: spec.kind,
            visualBible: spec.visualBible,
            prompt: spec.prompt
          }, { timeoutMs: 100000 });
          memory.set(cacheKey, res.imageUrl);
          idbPut(cacheKey, res.imageUrl);
          resolve(res.imageUrl);
        } catch (e) {
          reject(e);
        } finally {
          inflight.delete(key);
        }
      }
    });
    pump();
  });

  inflight.set(key, p);
  return p;
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
