import { useCallback, useEffect, useRef, useState } from 'react';
import { heroSpec, stepSpec, loadCachedImage, requestImage, heroReferenceFor } from '../utils/aiImageStore.js';

const HERO_VIEWS = ['finished', 'assembly', 'inUse'];

/**
 * Resolves AI pictures for a project: cache first (IndexedDB), then generates what is missing.
 * Only active for projects built by the AI pipeline (they carry image prompts).
 *
 * state values: 'loading' | 'ready' | 'error'
 */
export function useProjectAiImages(project, activeStepIndex = 0) {
  const enabled = Boolean(project?.isAiDeveloped);
  const [hero, setHero] = useState({});
  const [stepImgs, setStepImgs] = useState({});
  const [state, setState] = useState({});
  const aliveRef = useRef(true);

  const projectId = project?.id;
  const stepCount = project?.steps?.length || 0;

  const set = useCallback((bucket, id, url, st) => {
    if (!aliveRef.current) return;
    if (url) (bucket === 'hero' ? setHero : setStepImgs)(prev => ({ ...prev, [id]: url }));
    setState(prev => ({ ...prev, [`${bucket}:${id}`]: st }));
  }, []);

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
        set(bucket, id, null, 'error');
      });
  }, [set, project, stepCount]);

  // reset + restore from cache whenever the project changes
  useEffect(() => {
    aliveRef.current = true;
    setHero({});
    setStepImgs({});
    setState({});
    if (!enabled) return () => { aliveRef.current = false; };

    (async () => {
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
    })();

    return () => { aliveRef.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, enabled]);

  // generate missing pictures: hero first, then the step being viewed, then the rest
  useEffect(() => {
    if (!enabled) return;
    const missingHero = view => !hero[view] && state[`hero:${view}`] !== 'loading' && state[`hero:${view}`] !== 'error';
    if (missingHero('finished')) run('hero', 'finished', heroSpec(project, 'finished'), 100);

    for (let offset = 0; offset < stepCount; offset++) {
      const i = (activeStepIndex + offset) % stepCount;
      const st = state[`step:${i}`];
      if (stepImgs[i] || st === 'loading' || st === 'error') continue;
      run('step', i, stepSpec(project, project.steps[i]), 90 - offset);
    }

    for (const view of ['assembly', 'inUse']) {
      if (missingHero(view)) run('hero', view, heroSpec(project, view), 10);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, projectId, activeStepIndex, stepCount, hero, stepImgs, state]);

  const regenerateStep = useCallback(
    i => run('step', i, stepSpec(project, project.steps[i]), 200, true),
    [project, run]
  );
  const regenerateHero = useCallback(
    view => run('hero', view, heroSpec(project, view), 200, true),
    [project, run]
  );
  const retryStep = useCallback(i => {
    setState(prev => { const n = { ...prev }; delete n[`step:${i}`]; return n; });
  }, []);

  return {
    enabled,
    heroUrl: view => hero[view] || null,
    stepUrl: i => stepImgs[i] || null,
    heroState: view => state[`hero:${view}`] || null,
    stepState: i => state[`step:${i}`] || null,
    regenerateStep,
    regenerateHero,
    retryStep
  };
}

/**
 * Lightweight hook for list views (spotlight / cards / compare):
 * resolves ONE hero view from cache or generates it, without touching step images.
 */
export function useAiHero(project, view = 'finished', { enabled = true } = {}) {
  const spec = project?.isAiDeveloped ? heroSpec(project, view) : null;
  const key = spec ? `${project.id}:${view}` : null;
  const [entry, setEntry] = useState({ key: null, url: null, status: 'idle' });

  useEffect(() => {
    if (!spec) return undefined;
    let alive = true;
    (async () => {
      const cached = await loadCachedImage(spec);
      if (!alive) return;
      if (cached) return setEntry({ key, url: cached, status: 'ready' });
      if (!enabled) return setEntry({ key, url: null, status: 'idle' });
      setEntry({ key, url: null, status: 'loading' });
      requestImage(spec, { priority: view === 'finished' ? 100 : 60 })
        .then(url => alive && setEntry({ key, url, status: 'ready' }))
        .catch(() => alive && setEntry({ key, url: null, status: 'error' }));
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);

  const retry = useCallback(() => {
    if (!spec) return;
    setEntry({ key, url: null, status: 'loading' });
    requestImage(spec, { priority: 120, force: true })
      .then(url => setEntry({ key, url, status: 'ready' }))
      .catch(() => setEntry({ key, url: null, status: 'error' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const current = entry.key === key ? entry : { url: null, status: spec && enabled ? 'loading' : 'idle' };
  return { url: current.url, status: current.status, retry, isAi: Boolean(spec) };
}
