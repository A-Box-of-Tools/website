/**
 * Offline cache. GENERATED FILE - do not edit; see templates/sw.js.
 *
 * One of these per installable folder: one per tool, and one per language for
 * the front page. Beyond convenience, this is the app's strongest privacy
 * proof: once the worker is installed you can disconnect from the network
 * entirely and every feature still works, which no design that uploaded your
 * {{ words.plural }} could manage.
 *
 * CACHE_NAME carries a hash of the files listed below, so it changes exactly
 * when one of them changes and never otherwise. That used to be a comment
 * asking whoever edited a file to remember to bump a number by hand.
 *
 * It also carries the scope it was registered with, because the cache store is
 * one per origin and every tool and every front page here is a separate
 * registration sharing it. `activate` below has to tell this registration's own
 * superseded caches from its neighbours' current ones, and for a long time it
 * did not: the filter was `name !== CACHE_NAME`, so activating any worker
 * deleted every other cache on the origin. Only the tool you had opened last
 * worked offline, and the way to see it was to open two tools and count the
 * caches in DevTools - one.
 *
 * The delimiters matter. `/de/` is a string prefix of `/de/video-zuschneiden/`,
 * so a bare path would put the front page's worker back in the business of
 * deleting the tools' caches; a path wrapped in `abox:` and `:` is a prefix of
 * nothing but its own older selves.
 */

const CACHE_PREFIX = 'abox:{{ cache_scope }}:';
const CACHE_NAME = CACHE_PREFIX + '{{ cache_hash }}';

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
      // A new worker must not seed its cache with the previous deployment's
      // HTML from the browser's HTTP cache. The worker's own hash changes
      // independently of those unversioned addresses.
      .then((cache) => cache.addAll(ASSETS.map((asset) => (
        new Request(new URL(asset, self.location.href), { cache: 'reload' })
      ))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  // Two things are ours to delete, and nothing else is: a superseded copy of
  // this registration's own cache, and anything left over from before cache
  // names carried a scope. A name with no `abox:` on it was written by the
  // scheme this replaced, no worker writes one any more, and the alternative is
  // leaving every visitor who ever used a tool holding a few megabytes that
  // nothing will ever read or clear.
  const ours = (name) => name.startsWith(CACHE_PREFIX);
  const orphaned = (name) => !name.startsWith('abox:');

  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((name) => name !== CACHE_NAME && (ours(name) || orphaned(name)))
          .map((name) => caches.delete(name)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Third-party requests never enter the offline cache.
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // A guide can change without changing the hub or its worker. So can an
  // unversioned Markdown page or image that the hub happened to cache. Only
  // URLs bearing the build's content hash are safe to keep without asking
  // the network again; a navigation always asks, even with a query string.
  const immutable = request.mode !== 'navigate'
    && /^[0-9a-f]{10}$/.test(url.searchParams.get('v') || '');
  const cached = (key) => caches.match(key, { cacheName: CACHE_NAME })
    .catch(() => undefined);

  event.respondWith((async () => {
    // CacheStorage is shared by every scope. Looking through all of it lets
    // an old page in the hub's cache override a tool's newly installed copy.
    if (immutable) {
      const hit = await cached(request);
      if (hit) return hit;
    }

    try {
      const response = await fetch(request, {
        cache: immutable ? 'default' : 'no-cache',
      });
      if (response.ok && response.type === 'basic') {
        const copy = response.clone();
        // Hold the worker alive until the copy lands, without delaying the
        // page or turning a full or unavailable cache into a failed request.
        event.waitUntil(caches.open(CACHE_NAME)
          .then((cache) => cache.put(request, copy))
          .catch(() => {}));
      }
      return response;
    } catch (error) {
      const hit = await cached(request);
      if (hit) return hit;
      // Only navigation may fall back to this scope's app shell. A missing
      // script must fail rather than receive HTML from this or another app.
      if (request.mode === 'navigate') {
        const shell = await cached('index.html');
        if (shell) return shell;
      }
      throw error;
    }
  })());
});
