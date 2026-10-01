/**
 * The worker's caching decisions, with a cache store shared by nested scopes.
 * The template itself runs here: replacing it with a model of its decisions
 * would miss the bug where a global lookup finds another worker's old page.
 * Browser installation and offline operation are still checked on the site.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const template = readFileSync(new URL('../../templates/sw.js', import.meta.url), 'utf8');
const origin = 'https://abox.test';

function response(body, status = 200) {
  const value = new Response(body, { status });
  Object.defineProperty(value, 'type', { value: 'basic' });
  return value;
}

function worker(scope = '/') {
  const base = `${origin}${scope}sw.js`;
  const name = `abox:${scope}:0123456789`;
  const stores = new Map([[name, new Map()]]);
  const handlers = new Map();
  const network = new Map();
  const state = { offline: false, unavailable: false, full: false, claimed: false };
  const fetches = [];
  const precached = [];
  const key = (request) => new URL(typeof request === 'string' ? request : request.url, base).href;
  const ensure = (cacheName) => {
    if (!stores.has(cacheName)) stores.set(cacheName, new Map());
    return stores.get(cacheName);
  };

  const caches = {
    async match(request, options = {}) {
      if (state.unavailable) throw new Error('cache unavailable');
      const chosen = options.cacheName ? [stores.get(options.cacheName)] : stores.values();
      for (const entries of chosen) {
        const hit = entries?.get(key(request));
        if (hit) return hit.clone();
      }
    },
    async open(cacheName) {
      if (state.unavailable) throw new Error('cache unavailable');
      const entries = ensure(cacheName);
      return {
        async addAll(requests) {
          precached.push(...requests);
          for (const request of requests) {
            const path = key(request);
            const body = network.get(path)?.body ?? (/\/(?:index.html)?$/.test(path)
              ? '<html data-offline-version="0123456789">current</html>' : 'asset');
            entries.set(path, response(body));
          }
        },
        async match(request) { return entries.get(key(request))?.clone(); },
        async put(request, value) {
          if (state.full) throw new Error('cache full');
          entries.set(key(request), value.clone());
        },
      };
    },
    async keys() { return [...stores.keys()]; },
    async delete(cacheName) { return stores.delete(cacheName); },
  };

  const source = template
    .replaceAll('{{ words.plural }}', 'files')
    .replaceAll('{{ cache_scope }}', scope)
    .replaceAll('{{ cache_hash }}', '0123456789')
    .replace(/\{% for asset in assets %\}[\s\S]*?\{% endfor %\}/,
      "  'index.html',\n  'src/main.js?v=0123456789',\n");

  runInNewContext(source, {
    URL, Request, caches,
    self: {
      location: new URL(base),
      addEventListener(type, handler) { handlers.set(type, handler); },
      async skipWaiting() {},
      clients: { async claim() { state.claimed = true; } },
    },
    async fetch(request, options) {
      fetches.push({ url: key(request), cache: options?.cache });
      if (state.offline) throw new Error('offline');
      const value = network.get(key(request));
      return response(value?.body ?? 'network', value?.status ?? 200);
    },
  }, { filename: 'templates/sw.js' });

  return {
    name, state, stores, fetches, precached,
    seed(path, body, cacheName = name) { ensure(cacheName).set(key(path), response(body)); },
    serve(path, body, status = 200) { network.set(key(path), { body, status }); },
    async read(path, mode = 'navigate', method = 'GET') {
      const pending = [];
      let answer;
      handlers.get('fetch')({
        request: { url: key(path), mode, method },
        respondWith(promise) { answer = promise; },
        waitUntil(promise) { pending.push(promise); },
      });
      const result = await answer;
      await Promise.all(pending);
      return result;
    },
    async ready(version = '0123456789') {
      const pending = [];
      let answer;
      handlers.get('message')({
        data: { type: 'abox-offline-ready', version },
        ports: [{ postMessage(value) { answer = value; } }],
        waitUntil(promise) { pending.push(promise); },
      });
      await Promise.all(pending);
      return answer;
    },
    async lifecycle(type) {
      const pending = [];
      handlers.get(type)({ waitUntil(promise) { pending.push(promise); } });
      await Promise.all(pending);
    },
  };
}

test('a guide update arrives without replacing the hub worker and remains available offline', async () => {
  const app = worker();
  const path = '/guides/safe-files/';
  app.serve(path, 'before');
  assert.equal(await (await app.read(path)).text(), 'before');
  app.serve(path, 'after');
  assert.equal(await (await app.read(path)).text(), 'after');
  assert.ok(app.fetches.every((entry) => entry.cache === 'no-cache'));
  app.state.offline = true;
  assert.equal(await (await app.read(path)).text(), 'after');
});

test('unversioned Markdown and images refresh even when the hub has cached them', async () => {
  const app = worker();
  for (const path of ['/guides/safe-files/index.md', '/logo.svg']) {
    app.seed(path, 'before');
    app.serve(path, 'after');
    assert.equal(await (await app.read(path, 'same-origin')).text(), 'after');
  }
  assert.ok(app.fetches.every((entry) => entry.cache === 'no-cache'));
});

test('a tool uses its own versioned asset when the hub holds an older copy', async () => {
  const app = worker('/text-diff/');
  const path = '/text-diff/src/main.js?v=0123456789';
  app.seed(path, 'hub copy', 'abox:/:older');
  // The hub was created first on a real visit. Preserve that order here too.
  const own = app.stores.get(app.name);
  app.stores.delete(app.name);
  app.stores.set(app.name, own);
  app.seed(path, 'tool copy');
  assert.equal(await (await app.read(path, 'same-origin')).text(), 'tool copy');
  assert.equal(app.fetches.length, 0);
});

test('an asset missing from this scope is fetched rather than borrowed from another cache', async () => {
  const app = worker('/text-diff/');
  const path = '/text-diff/src/main.js?v=0123456789';
  app.seed(path, 'hub copy', 'abox:/:older');
  app.serve(path, 'current');
  assert.equal(await (await app.read(path, 'same-origin')).text(), 'current');
  assert.equal(app.fetches.length, 1);
  assert.equal(await (await app.read(path, 'same-origin')).text(), 'current');
  assert.equal(app.fetches.length, 1);
});

test('navigation still refreshes when its query happens to contain a content hash', async () => {
  const app = worker('/text-diff/');
  const path = './?v=0123456789';
  app.seed(path, 'before');
  app.serve(path, 'after');
  assert.equal(await (await app.read(path)).text(), 'after');
  assert.equal(app.fetches[0].cache, 'no-cache');
});

test('offline fallbacks stay inside the current scope and never give a script HTML', async () => {
  const app = worker('/zh/text-diff/');
  app.seed('/zh/text-diff/index.html', 'old neighbour', 'abox:/zh/:older');
  app.seed('index.html', 'own shell');
  app.state.offline = true;
  assert.equal(await (await app.read('./?settings=1')).text(), 'own shell');
  await assert.rejects(app.read('./missing.js', 'same-origin'), /offline/);
});

test('an unavailable or full cache does not fail an online request', async () => {
  for (const condition of ['unavailable', 'full']) {
    const app = worker();
    app.state[condition] = true;
    app.serve('/guides/safe-files/', 'fresh');
    assert.equal(await (await app.read('/guides/safe-files/')).text(), 'fresh');
  }
});

test('HTTP errors are returned without replacing the saved offline page', async () => {
  const app = worker();
  app.seed('/guides/safe-files/', 'saved');
  app.serve('/guides/safe-files/', 'missing', 404);
  assert.equal((await app.read('/guides/safe-files/')).status, 404);
  app.state.offline = true;
  assert.equal(await (await app.read('/guides/safe-files/')).text(), 'saved');
});

test('installing a new worker reloads its precache instead of copying stale HTTP responses', async () => {
  const app = worker('/zh/text-diff/');
  await app.lifecycle('install');
  assert.ok(app.precached.length > 0);
  for (const request of app.precached) {
    assert.equal(request.cache, 'reload');
    assert.ok(request.url.startsWith(`${origin}/zh/text-diff/`));
  }
});

test('activating a translated hub preserves the nested tool and other language caches', async () => {
  const app = worker('/zh/');
  app.seed('./', 'old hub', 'abox:/zh/:older');
  app.seed('./', 'tool', 'abox:/zh/text-diff/:current');
  app.seed('./', 'english', 'abox:/:current');
  await app.lifecycle('activate');
  assert.equal(app.stores.has('abox:/zh/:older'), false);
  assert.equal(app.stores.has('abox:/zh/text-diff/:current'), true);
  assert.equal(app.stores.has('abox:/:current'), true);
  assert.equal(app.stores.has(app.name), true);
  assert.equal(app.state.claimed, true);
});

test('cross-origin and non-GET requests are left to the browser', async () => {
  const app = worker();
  assert.equal(await app.read('https://elsewhere.test/file.js', 'cors'), undefined);
  assert.equal(await app.read('/file', 'same-origin', 'POST'), undefined);
  assert.equal(app.fetches.length, 0);
});

test('an old worker returns fresh HTML online without replacing its coherent offline shell', async () => {
  const app = worker('/text-diff/');
  const previous = '<html data-offline-version="0123456789">old page</html>';
  const current = '<html data-offline-version="9876543210">new page</html>';
  app.seed('./', previous);
  app.serve('./', current);
  assert.equal(await (await app.read('./')).text(), current);
  app.state.offline = true;
  assert.equal(await (await app.read('./')).text(), previous);
});

test('installation refuses stale HTML beside the new module graph, at either shell URL', async () => {
  for (const path of ['./', 'index.html']) {
    const app = worker('/text-diff/');
    app.serve(path, '<html data-offline-version="9876543210">stale</html>');
    await assert.rejects(app.lifecycle('install'), /different builds/);
  }
});

test('readiness requires this page version and every eagerly cached module', async () => {
  const app = worker('/text-diff/');
  await app.lifecycle('install');
  assert.equal((await app.ready()).ready, true);
  assert.equal((await app.ready('9876543210')).ready, false);
  app.stores.get(app.name).delete(`${origin}/text-diff/src/main.js?v=0123456789`);
  assert.equal((await app.ready()).ready, false);
});

test('legacy HTML without a generation cannot replace either current offline shell address', async () => {
  for (const path of ['./', 'index.html', './?preferences=1']) {
    const app = worker('/text-diff/');
    const current = '<html data-offline-version="0123456789">current</html>';
    app.seed(path, current);
    app.serve(path, '<html>legacy CDN response</html>');
    assert.equal(await (await app.read(path)).text(), '<html>legacy CDN response</html>');
    app.state.offline = true;
    assert.equal(await (await app.read(path)).text(), current);
  }
});
