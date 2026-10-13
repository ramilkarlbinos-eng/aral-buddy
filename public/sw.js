const CACHE_NAME = 'aral-buddy-v1';

// Assets to pre-cache when installed
const PRECACHE_ASSETS = [
  '/aral-buddy/',
  '/aral-buddy/index.html',
  '/aral-buddy/manifest.json'
];

// 1. Install Event: Save essential assets into cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// 2. Activate Event: Delete old cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Handle requests intelligently
self.addEventListener('fetch', (event) => {
  // Ignore non-GET requests and non-http(s) requests (like Chrome extensions)
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  const isNavigation = event.request.mode === 'navigate';

  if (isNavigation) {
    // Network-First for HTML/Pages: Try network to get fresh updates, fallback to cache if offline
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => {
          return caches.match('/aral-buddy/index.html') || caches.match('/aral-buddy/');
        })
    );
  } else {
    // Cache-First for assets (CSS, JS, Images): Load from cache first for maximum speed
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(event.request).then((response) => {
          if (response && response.ok && new URL(event.request.url).origin === self.location.origin) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        });
      })
    );
  }
});
