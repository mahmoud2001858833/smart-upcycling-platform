/**
 * MUDAM Service Worker — Progressive Web App (PWA)
 * Enables offline viewing of saved projects, step guides, and static assets.
 */

const CACHE_NAME = 'mudam-pwa-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/mudam-logo.png',
  '/mudam-logo.svg',
  '/favicon.svg',
  '/icons.svg',
  '/step1.jpg',
  '/step2.jpg',
  '/step3.jpg',
  '/step4.jpg',
  '/step5.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip caching huge video files (.mov, .mp4) to prevent filling device storage limits
  if (url.pathname.endsWith('.mov') || url.pathname.endsWith('.mp4')) {
    return;
  }

  // Handle SPA navigation requests: if offline, return cached index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/index.html') || caches.match('/');
      })
    );
    return;
  }

  // Handle API calls or dynamic Supabase functions with Network First
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // Stale-While-Revalidate strategy for static assets (scripts, styles, images)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Offline and no network, return cached response if present
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});
