import { useEffect, useState } from 'react';
import { callAi } from '../utils/aiGateway.js';

/**
 * Records one visit per page load / sign-in change and keeps the capacity (busy / credit) fresh.
 * `isAdmin` comes ONLY from the server's verification of the Supabase token; never from client state.
 */
const tracked = new Set(); // one visit record per page load per identity (React StrictMode runs effects twice in dev)

export function usePlatformStatus(accessToken) {
  const [status, setStatus] = useState({ capacity: null, isAdmin: false, loaded: false });

  useEffect(() => {
    let alive = true;
    const apply = r => alive && setStatus({ capacity: r.capacity || null, isAdmin: Boolean(r.viewer?.isAdmin), loaded: true });

    const first = !tracked.has(accessToken || 'anon');
    tracked.add(accessToken || 'anon');
    callAi(first ? 'track' : 'status', { path: location.pathname, referrer: document.referrer, lang: navigator.language }, { timeoutMs: 15000 })
      .then(apply)
      .catch(() => alive && setStatus(s => ({ ...s, loaded: true })));

    const timer = setInterval(() => {
      if (document.hidden) return;
      callAi('status', {}, { timeoutMs: 15000 }).then(apply).catch(() => {});
    }, 60_000);
    return () => { alive = false; clearInterval(timer); };
  }, [accessToken]);

  return status;
}
