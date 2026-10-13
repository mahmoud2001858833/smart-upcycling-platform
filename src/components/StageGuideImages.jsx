import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, X, Download, Maximize2 } from 'lucide-react';
import { requestImage, loadCachedImage } from '../utils/aiImageStore.js';

const CHUNK = 4;
const LIMIT_CODES = ['IMAGES_PAUSED', 'DAILY_LIMIT', 'GLOBAL_DAILY_LIMIT', 'NO_CREDIT', 'CAPACITY_CLOSED'];

const asText = v => (Array.isArray(v) ? v.join(', ') : String(v || '')).trim();

/** One short English-friendly description per step: title plus the first action/detail. */
function stepText(step) {
  const actions = Array.isArray(step.actions) && step.actions.length ? step.actions : [];
  const body = actions[0] || step.detail || step.instruction || step.goal || '';
  return [step.title, body].filter(Boolean).join(' — ').replace(/\s+/g, ' ').slice(0, 240);
}

/** Every 4 steps become ONE picture (2x2 grid): images = ceil(steps / 4). */
export function chunkSteps(steps) {
  const out = [];
  for (let i = 0; i < steps.length; i += CHUNK) {
    out.push(steps.slice(i, i + CHUNK).map((st, k) => ({ n: i + k + 1, text: stepText(st) })));
  }
  return out;
}

export default function StageGuideImages({ project, steps }) {
  const projectName = project?.name || project?.title || '';
  const material = asText(project?.materials) || 'recycled household materials';
  const groups = useMemo(() => chunkSteps(steps || []), [steps]);
  const specs = useMemo(() => groups.map((g, i) => ({
    kind: 'guide',
    visualBible: `${projectName}|${material}`.slice(0, 300),
    prompt: `guide-${i}|${g.map(x => `${x.n}:${x.text}`).join('|')}`.slice(0, 1500),
    guide: { projectName, material, steps: g }
  })), [groups, projectName, material]);

  const [images, setImages] = useState({});   // index -> data URL
  const [errors, setErrors] = useState({});   // index -> message
  const [busy, setBusy] = useState(false);
  const [zoom, setZoom] = useState(null);     // index

  // restore pictures made earlier (stored in the browser, nothing is generated automatically)
  useEffect(() => {
    let alive = true;
    setImages({}); setErrors({});
    (async () => {
      for (let i = 0; i < specs.length; i++) {
        const url = await loadCachedImage(specs[i]).catch(() => null);
        if (alive && url) setImages(prev => ({ ...prev, [i]: url }));
      }
    })();
    return () => { alive = false; };
  }, [specs]);

  const generate = useCallback(async () => {
    if (busy || !specs.length) return;
    setBusy(true);
    setErrors({});
    await Promise.all(specs.map(async (spec, i) => {
      try {
        const url = await requestImage(spec, { priority: 1 });
        setImages(prev => ({ ...prev, [i]: url }));
      } catch (e) {
        setErrors(prev => ({ ...prev, [i]: LIMIT_CODES.includes(e?.code) ? e.message : 'تعذر توليد هذه الصورة، حاول مرة أخرى.' }));
      }
    }));
    setBusy(false);
  }, [busy, specs]);

  useEffect(() => {
    if (zoom == null) return undefined;
    const onKey = e => { if (e.key === 'Escape') setZoom(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoom]);

  if (!groups.length) return null;
  const done = Object.keys(images).length;
  const missing = specs.length - done;

  return (
    <div className="mt-6 pt-5 border-t border-slate-200" data-testid="stage-guide">
      <div className="flex flex-col items-center gap-2 text-center">
        <button
          type="button"
          onClick={generate}
          disabled={busy}
          className="gen-image-btn"
          data-testid="generate-guides"
          aria-busy={busy}
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          <span>{busy ? 'جاري إنشاء الصور…' : (done && !missing ? '🎨 إعادة إنشاء صور المراحل' : '🎨 إنشاء صور المراحل')}</span>
        </button>
        <p className="text-[11px] text-slate-500">
          {groups.length === 1 ? 'صورة واحدة' : `${groups.length} صور`} (كل صورة تشرح حتى 4 مراحل بشبكة 2×2) بجودة قياسية 1024×1024.
        </p>
      </div>

      {(busy || done > 0 || Object.keys(errors).length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {specs.map((spec, i) => {
            const g = groups[i];
            const label = g.length === 1 ? `المرحلة ${g[0].n}` : `المراحل ${g[0].n}–${g[g.length - 1].n}`;
            return (
              <figure key={i} className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm m-0">
                <div className="relative aspect-square bg-slate-100">
                  {images[i] ? (
                    <>
                      <button type="button" onClick={() => setZoom(i)} className="absolute inset-0 w-full h-full p-0 border-0 bg-transparent cursor-zoom-in" aria-label={`تكبير صورة ${label}`}>
                        <img src={images[i]} alt={`دليل مصور: ${label}`} className="w-full h-full object-cover" />
                      </button>
                      <span className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 border border-slate-200 text-slate-700 pointer-events-none"><Maximize2 className="w-3.5 h-3.5" /></span>
                    </>
                  ) : busy && !errors[i] ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-600">
                      <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
                      <span className="text-xs font-bold">جاري رسم {label}…</span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-xs text-red-600" role="alert">{errors[i] || 'لم تُنشأ بعد'}</div>
                  )}
                </div>
                <figcaption className="px-3 py-2 text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>{label}</span>
                  {images[i] && <a href={images[i]} download={`mudam-stages-${i + 1}.jpg`} className="text-emerald-700 inline-flex items-center gap-1"><Download className="w-3.5 h-3.5" /> تحميل</a>}
                </figcaption>
              </figure>
            );
          })}
        </div>
      )}

      {zoom != null && images[zoom] && (
        <div className="fixed inset-0 z-[1000] bg-black/80 flex items-center justify-center p-4" onClick={() => setZoom(null)} role="dialog" aria-modal="true" aria-label="عرض الصورة بحجم كامل">
          <button type="button" onClick={() => setZoom(null)} className="absolute top-4 left-4 p-2 rounded-full bg-white text-slate-800 cursor-pointer" aria-label="إغلاق"><X className="w-5 h-5" /></button>
          <img src={images[zoom]} alt="" className="max-h-[92vh] max-w-[92vw] rounded-xl shadow-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
