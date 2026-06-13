/**
 * YuvaZ Service Worker – PWA Support
 * Caches static assets for offline functionality.
 */

const CACHE_NAME = 'yuvaz-v1.0.0';
const STATIC_ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './css/animations.css',
  './css/components.css',
  './css/modules.css',
  './js/data.js',
  './js/ai-engine.js',
  './js/safety.js',
  './js/components.js',
  './js/router.js',
  './js/app.js',
  './js/pages/dashboard.js',
  './js/pages/mood.js',
  './js/pages/journal.js',
  './js/pages/companion.js',
  './js/pages/insights.js',
  './js/pages/readiness.js',
  './js/pages/focus.js',
  './js/pages/wellness.js',
  './js/pages/community.js',
  './js/pages/parent.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      });
    }).catch(() => caches.match('./index.html'))
  );
});
