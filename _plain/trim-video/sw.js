/**
 * Offline cache. GENERATED FILE - do not edit; see templates/sw.js.
 *
 * Beyond convenience, this is the app's strongest privacy proof: once the
 * worker is installed you can disconnect from the network entirely and every
 * feature still works, which no design that uploaded your videos could manage.
 *
 * CACHE_NAME carries a hash of the files listed below, so it changes exactly
 * when one of them changes and never otherwise. That used to be a comment
 * asking whoever edited a file to remember to bump a number by hand.
 */

const CACHE_NAME = 'trim-video-74673c45d4';

const ASSETS = [
  './',
  'index.html',
  'styles.css?v=3d9138c0b9',
  'src/shared/file-picker.js',
  'src/audio.js',
  'src/clips.js',
  'src/copy.js',
  'src/demux.js',
  'src/draw.js',
  'src/main.js',
  'src/mp4.js',
  'src/ranges.js',
  'src/record.js',
  'src/segments.js',
  'src/support.js',
  'src/timeline.js',
  'src/transcode.js',
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
