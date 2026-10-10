import { useCallback, useEffect, useRef, useState } from 'react';
import {
  heroSpec, stepSpec, imageKey, loadCachedImage, requestImage, heroReferenceFor, subscribeImages
} from '../utils/aiImageStore.js';

const HERO_VIEWS = ['finished', 'assembly', 'inUse'];

/**
 * Pictures for one project. NOTHING is generated automatically: this only restores pictures
 * the person already made (IndexedDB) and exposes explicit "generate" actions.
 *
 * state values: 'loading' | 'ready' | 'error'
 */
export function useProjectAiImages(project, activeStepIndex = 0) {
  void activeStepIndex;
  const enabled = Boolean(project);
  const [hero, setHero] = useState({});
  const [stepImgs, setStepImgs] = useState({});
  const [state, setState] = useState({});
  const [errors, setErrors] = useState({});
  const aliveRef = useRef(true);

  const projectId = project?.id;
  const stepCount = project?.steps?.length || 0;

  const set = useCallback((bucket, id, url, st, err = null) => {
    if (!aliveRef.current) return;
    if (url) (bucket === 'hero' ? setHero : setStepImgs)(prev => ({ ...prev, [id]: url }));
    setState(prev => ({ ...prev, [`${bucket}:${id}`]: st }));
    setErrors(prev => ({ ...prev, [`${bucket}:${id}`]: err }));
  }, []);

  const restore = useCallback(async () => {
    for (const view of HERO_VIEWS) {
      const spec = heroSpec(project, view);
      if (!spec) continue;
      const cached = await loadCachedImage(spec);
      if (cached) set('hero', view, cached, 'ready');
    }
    for (let i = 0; i < stepCount; i++) {
      const spec = stepSpec(project, project.steps[i]);
      if (!spec) continue;
      const cached = await loadCachedImage(spec);
      if (cached) set('step', i, cached, 'ready');
    }
  }, [project, stepCount, set]);

  useEffect(() => {
    aliveRef.current = true;
    setHero({}); setStepImgs({}); setState({}); setErrors({});
    if (enabled) restore();
    return () => { aliveRef.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, enabled]);

  const run = useCallback((bucket, id, spec, priority, force = false) => {
    if (!spec) return Promise.resolve();
    set(bucket, id, null, 'loading');
    const extra = bucket === 'step'
      ? {
          reference: () => heroReferenceFor(project),
          stageLabel: `${Number(id) + 1} of ${stepCount}`,
          isFinal: Number(id) === stepCount - 1
        }
      : {};
    return requestImage(spec, { priority, force, ...extra })
      .then(url => set(bucket, id, url, 'ready'))
      .catch(err => {
        console.warn(`AI image (${bucket}:${id}) failed:`, err.message);
        set(bucket, id, null, 'error', { message: err.message, code: err.code || 'ERROR' });
      });
  }, [set, project, stepCount]);

  const generateHero = useCallback((view = 'finished') => run('hero', view, heroSpec(project, view), 200), [project, run]);
  const generateStep = useCallback(i => run('step', i, stepSpec(project, project.steps[i]), 200), [project, run]);
  const regenerateHero = useCallback(view => run('hero', view, heroSpec(project, view), 200, true), [project, run]);
  const regenerateStep = useCallback(i => run('step', i, stepSpec(project, project.steps[i]), 200, true), [project, run]);

  return {
    enabled,
    heroUrl: view => hero[view] || null,
    stepUrl: i => stepImgs[i] || null,
    heroState: view => state[`hero:${view}`] || null,
    stepState: i => state[`step:${i}`] || null,
    heroError: view => errors[`hero:${view}`] || null,
    stepError: i => errors[`step:${i}`] || null,
    generateHero,
    generateStep,
    regenerateHero,
    regenerateStep
  };
}

/**
 * List views (cards / spotlight / compare): shows a picture ONLY if it was already generated.
 * It never starts a generation; it refreshes itself when the picture is created elsewhere.
 */
export function useAiHero(project, view = 'finished') {
  const spec = project ? heroSpec(project, view) : null;
  const key = spec ? imageKey(spec) : null;
  const [entry, setEntry] = useState({ key: null, url: null });

  useEffect(() => {
    if (!spec) return undefined;
    let alive = true;
    const load = () => loadCachedImage(spec).then(url => { if (alive) setEntry({ key, url: url || null }); });
    load();
    const off = subscribeImages(k => { if (k === key) load(); });
    return () => { alive = false; off(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const current = entry.key === key ? entry : { url: null };
  return { url: current.url, status: current.url ? 'ready' : 'idle', isAi: Boolean(spec) };
}
