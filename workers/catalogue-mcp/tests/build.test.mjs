import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { gzipSync, gunzipSync } from 'node:zlib';
import { createHash, webcrypto } from 'node:crypto';

import { packCatalogue, renderView, bundleAppJavascript } from '../scripts/build.mjs';
import { decodeCatalogueData, decodeUtf8Data, MAX_CATALOGUE_BYTES } from '../ui/view-data.mjs';

const catalogue = {
  language: '日本語',
  tools: [{ name: 'PNG < JPEG & WebP', description: '</script><script>untrusted()</script> café 😀 \u2028\u2029' }]
};

test('catalogue packing is deterministic gzip and round-trips exact Unicode data', async () => {
  const first = packCatalogue(catalogue);
  assert.deepEqual(packCatalogue(catalogue), first);
  assert.match(first.base64, /^[A-Za-z0-9+/]+={0,2}$/);
  const compressed = Buffer.from(first.base64, 'base64');
  assert.deepEqual([...compressed.subarray(4, 8)], [0, 0, 0, 0]);
  assert.equal(compressed[9], 255);
  assert.equal(gunzipSync(compressed).toString('utf8'), JSON.stringify(catalogue));
  assert.deepEqual(await decodeCatalogueData(first.base64, first.bytes), catalogue);
});

test('catalogue decoding rejects corruption, incorrect sizes and invalid UTF-8', async () => {
  const packed = packCatalogue(catalogue);
  for (const [encoded, size] of [
    [packed.base64, packed.bytes - 1], [packed.base64, packed.bytes + 1],
    [packed.base64, MAX_CATALOGUE_BYTES + 1], [packed.base64, 0],
    ['not base64', packed.bytes], [Buffer.from('not gzip').toString('base64'), 8],
    [gzipSync(Buffer.from([255])).toString('base64'), 1],
    [gzipSync(Buffer.from('not JSON')).toString('base64'), 8]
  ]) await assert.rejects(decodeCatalogueData(encoded, size));
  assert.throws(() => packCatalogue({ text: 'x'.repeat(MAX_CATALOGUE_BYTES) }));
});

test('generic UTF-8 decoding preserves a BOM and rejects malformed bytes', async () => {
  const source = '\uFEFF日本語\n';
  const bytes = Buffer.from(source, 'utf8');
  assert.equal(await decodeUtf8Data(gzipSync(bytes).toString('base64'), bytes.length), source);
  await assert.rejects(decodeUtf8Data(gzipSync(Buffer.from([255])).toString('base64'), 1));
});

test('built HTML keeps compressed data inert and preserves exact UTF-8 module execution', async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'catalogue-view-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const entry = path.join(directory, 'unicode.mjs');
  const sample = '日本語 café 😀 </script><script>untrusted()</script> \u2028\u2029';
  await writeFile(entry, 'export const sample = ' + JSON.stringify(sample) + ';\n');
  const javascript = await bundleAppJavascript(entry);
  assert.ok(javascript.includes('日本語'));
  const template = await readFile(new URL('../ui/view.html', import.meta.url), 'utf8');
  const { html, catalogueBytes, packedCatalogueBytes, moduleBytes, packedModuleBytes, moduleSha256 } = await renderView({
    template, css: 'body { color: black; }', javascript, catalogue
  });
  assert.ok(html.includes('<meta charset="utf-8">'));
  assert.equal((html.match(/<\/script>/gi) ?? []).length, 3);
  const data = /<script id="catalogue-data" type="application\/octet-stream" data-encoding="gzip-base64" data-bytes="(\d+)">([A-Za-z0-9+/=]+)<\/script>/.exec(html);
  assert.ok(data);
  assert.equal(Number(data[1]), catalogueBytes);
  assert.equal(Buffer.byteLength(data[2]), packedCatalogueBytes);
  assert.deepEqual(await decodeCatalogueData(data[2], Number(data[1])), catalogue);
  const packed = /<script id="app-module-data" type="application\/octet-stream" data-encoding="gzip-base64" data-bytes="(\d+)" data-sha256="([A-Za-z0-9+/]{43}=)">([A-Za-z0-9+/=]+)<\/script>/.exec(html);
  assert.ok(packed);
  assert.equal(Number(packed[1]), moduleBytes);
  assert.equal(packed[2], moduleSha256);
  assert.equal(Buffer.byteLength(packed[3]), packedModuleBytes);
  const source = await decodeUtf8Data(packed[3], Number(packed[1]));
  assert.equal(source, javascript);
  assert.equal(createHash('sha256').update(source, 'utf8').digest('base64'), moduleSha256);
  assert.equal((html.match(/<script type="module">/g) ?? []).length, 1);
  assert.ok(!html.includes(javascript));
  const executed = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
  assert.equal(executed.sample, sample);
  assert.ok(!html.includes('__APP_'));
});

let bootstrapSequence = 0;

async function withGlobals(replacements, run) {
  const originals = new Map(Object.keys(replacements).map(name => [name,
    Object.getOwnPropertyDescriptor(globalThis, name)]));
  try {
    for (const [name, value] of Object.entries(replacements)) {
      Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
    }
    return await run();
  } finally {
    for (const [name, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  }
}

async function withBootstrap(html, options, inspect) {
  const packed = /<script id="app-module-data"[^>]*data-bytes="(\d+)" data-sha256="([A-Za-z0-9+/]{43}=)">([A-Za-z0-9+/=]+)<\/script>/.exec(html);
  const bootstrap = /<script type="module">([\s\S]*?)<\/script>/.exec(html);
  assert.ok(packed && bootstrap);
  const data = { dataset: { encoding: 'gzip-base64', bytes: packed[1], sha256: packed[2] }, textContent: packed[3] };
  options.mutate?.(data);
  const elements = new Map(['loading-module', 'loading-catalogue', 'connecting', 'module-failed']
    .map(id => [id, { hidden: id === 'module-failed' }]));
  const controls = [{ disabled: true }, { disabled: true }];
  const appended = [];
  const events = new EventTarget();
  const document = {
    URL: 'about:srcdoc',
    body: { dataset: {}, append: module => appended.push(module) },
    getElementById: id => id === 'app-module-data' ? data : elements.get(id),
    querySelectorAll: () => controls,
    createElement: tag => {
      assert.equal(tag, 'script');
      const module = {};
      if (options.trustedTypes) Object.defineProperty(module, 'textContent', {
        set() { throw new TypeError('TrustedScript required by fixture host'); }
      });
      return module;
    }
  };
  const replacements = { document,
    window: { addEventListener: events.addEventListener.bind(events), removeEventListener: events.removeEventListener.bind(events) },
    crypto: options.missingCrypto ? undefined : webcrypto };
  if (options.missingDecompression) replacements.DecompressionStream = undefined;
  await withGlobals(replacements, async () => {
    try {
      await import('data:text/javascript;base64,' + Buffer.from(bootstrap[1]).toString('base64')
        + '#bootstrap-' + ++bootstrapSequence);
      await inspect({ appended, controls, elements, events });
    } finally {
      // A real browser eventually fires load/error; the fixture only captures
      // the verified source and must release the loader's watchdog itself.
      for (const module of appended) module.onload?.();
    }
  });
}

test('the built bootstrap enforces its baked module identity before insertion', { concurrency: false }, async (t) => {
  const javascript = '\uFEFFexport const sample = "SAFE 日本語 </script> café 😀";\n';
  const template = await readFile(new URL('../ui/view.html', import.meta.url), 'utf8');
  const { html } = await renderView({ template, css: '', javascript, catalogue });
  const altered = javascript.replace('SAFE', 'EVIL');
  const changed = gzipSync(Buffer.from(altered, 'utf8')).toString('base64');
  const changedHash = createHash('sha256').update(altered, 'utf8').digest('base64');
  const failure = state => {
    assert.equal(state.appended.length, 0);
    assert.ok(state.controls.every(control => control.disabled));
    assert.equal(state.elements.get('module-failed').hidden, false);
  };
  await t.test('exact build is inserted unchanged, without enabling controls or choosing a URL', () =>
    withBootstrap(html, {}, state => {
      assert.equal(state.appended.length, 1);
      assert.equal(state.appended[0].type, 'module');
      assert.equal(state.appended[0].textContent, javascript);
      assert.equal(state.appended[0].src, undefined);
      assert.ok(state.controls.every(control => control.disabled));
      assert.equal(state.elements.get('module-failed').hidden, true);
    }));
  for (const [name, options] of [
    ['changed source with original digest', { mutate: data => { data.textContent = changed; } }],
    ['changed source with matching rewritten attributes', { mutate: data => {
      data.textContent = changed;
      data.dataset.bytes = String(Buffer.byteLength(altered));
      data.dataset.sha256 = changedHash;
    } }],
    ['incorrect length metadata', { mutate: data => { data.dataset.bytes = String(Number(data.dataset.bytes) + 1); } }],
    ['corrupt compressed module', { mutate: data => { data.textContent = Buffer.from('not gzip').toString('base64'); } }],
    ['missing native SHA-256', { missingCrypto: true }],
    ['missing native decompression', { missingDecompression: true }],
    ['Trusted Types rejects assignment', { trustedTypes: true }]
  ]) await t.test(name, () => withBootstrap(html, options, failure));
  await t.test('a caught eval probe does not hide a module, while denied inline execution does', () =>
    withBootstrap(html, {}, state => {
      const probe = new Event('securitypolicyviolation');
      Object.defineProperties(probe, {
        effectiveDirective: { value: 'script-src' }, blockedURI: { value: 'eval' }
      });
      state.events.dispatchEvent(probe);
      assert.equal(state.elements.get('module-failed').hidden, true);
      const blocked = new Event('securitypolicyviolation');
      Object.defineProperties(blocked, {
        effectiveDirective: { value: 'script-src-elem' }, blockedURI: { value: 'inline' }
      });
      state.events.dispatchEvent(blocked);
      assert.equal(state.elements.get('module-failed').hidden, false);
    }));
  await t.test('later module loading failure remains visible and disables controls', () =>
    withBootstrap(html, {}, state => {
      assert.equal(state.appended.length, 1);
      state.controls[0].disabled = false;
      state.appended[0].onerror();
      assert.ok(state.controls.every(control => control.disabled));
      assert.equal(state.elements.get('module-failed').hidden, false);
    }));
});
