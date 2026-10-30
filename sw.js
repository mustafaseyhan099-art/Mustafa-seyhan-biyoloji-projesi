/* MMS Biology 3D: cache only immutable, content-hashed model assets.
   HTML and other resources remain network-managed so site updates remain visible. */
const MODEL_CACHE = 'mms-biyoloji-glb-v1';
const MODEL_PATTERN = /\/assets\/[a-z]+-[0-9a-f]{12}\.glb$/i;

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !MODEL_PATTERN.test(url.pathname)) return;

  event.respondWith((async () => {
    let cache;
    try {
      cache = await caches.open(MODEL_CACHE);
      const stored = await cache.match(request);
      if (stored) return stored;
    } catch (error) {
      return fetch(request);
    }
    const response = await fetch(request);
    if (response.ok) {
      event.waitUntil(cache.put(request, response.clone()).catch(() => {}));
    }
    return response;
  })());
});
