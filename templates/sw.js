/**
 * Offline cache. GENERATED FILE - do not edit; see templates/sw.js.
 *
 * Beyond convenience, this is the app's strongest privacy proof: once the
 * worker is installed you can disconnect from the network entirely and every
 * feature still works, which no design that uploaded your {{ tool.words.plural }} could manage.
 *
 * CACHE_NAME carries a hash of the files listed below, so it changes exactly
 * when one of them changes and never otherwise. That used to be a comment
 * asking whoever edited a file to remember to bump a number by hand.
 */

const CACHE_NAME = '{{ tool.slug }}-{{ cache_hash }}';

const ASSETS = [
  './',
{% for asset in assets %}  '{{ asset }}',
{% endfor %}  // Same-origin, so it is cached like everything else. Offline it simply
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
      }).catch(() => (
        // Offline and not in the cache. A navigation gets the app shell, which
        // is the whole point of this worker. Anything else gets the failure,
        // because handing HTML back to something that asked for a script only
        // turns "offline" into a MIME-type error in the console - which is
        // exactly what /lang.js, one of the two root-absolute scripts a tool
        // page asks for and does not precache, did before this line said
        // `navigate`.
        // /feedback.js is the other, and is deliberately in the same position:
        // offline there is nothing for it to ask about, because there is no
        // measurement call to carry the answer.
        request.mode === 'navigate'
          ? caches.match('index.html')
          : Promise.reject(new Error('offline and not cached'))
      ));
    }),
  );
});
