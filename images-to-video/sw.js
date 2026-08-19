/**
 * Offline cache.
 *
 * Beyond convenience, this is the app's strongest privacy proof: once the
 * worker is installed you can disconnect from the network entirely and every
 * feature still works, which no design that uploaded your images could manage.
 *
 * Bump CACHE_NAME whenever any listed file changes.
 */

const CACHE_NAME = 'images-to-video-v5';

const ASSETS = [
  './',
  'index.html',
  'styles.css',
  'src/main.js',
  'src/images.js',
  'src/compose.js',
  'src/encoder.js',
  'src/recorder.js',
  'src/support.js',
  'src/remote.js',
  'src/mp4.js',
  // Same-origin, so it is cached like everything else. Offline it simply
  // queues a measurement call that never goes out - the app does not depend
  // on it, and nothing about your files is in it either way.
  'analytics.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only ever serve this app's own files. Nothing else should be requested,
  // and if it somehow is, we do not want to be the thing that fetches it.
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        // Cache successful same-origin responses so first-visit misses are
        // available offline afterwards.
        if (response.ok && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      }).catch(() => caches.match('index.html'));
    }),
  );
});
