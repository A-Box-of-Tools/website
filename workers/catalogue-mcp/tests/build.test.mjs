import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { gzipSync, gunzipSync } from 'node:zlib';

import { packCatalogue, renderView, bundleAppJavascript } from '../scripts/build.mjs';
import { decodeCatalogueData, MAX_CATALOGUE_BYTES } from '../ui/view-data.mjs';

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

test('built HTML keeps catalogue data inert and executes one unchanged UTF-8 module', async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'catalogue-view-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const entry = path.join(directory, 'unicode.mjs');
  const sample = '日本語 café 😀 </script><script>untrusted()</script> \u2028\u2029';
  await writeFile(entry, 'export const sample = ' + JSON.stringify(sample) + ';\n');
  const javascript = await bundleAppJavascript(entry);
  assert.ok(javascript.includes('日本語'));
  const template = await readFile(new URL('../ui/view.html', import.meta.url), 'utf8');
  const { html, catalogueBytes, packedCatalogueBytes } = renderView({
    template, css: 'body { color: black; }', javascript, catalogue
  });
  assert.ok(html.includes('<meta charset="utf-8">'));
  assert.equal((html.match(/<\/script>/gi) ?? []).length, 2);
  const data = /<script id="catalogue-data" type="application\/octet-stream" data-encoding="gzip-base64" data-bytes="(\d+)">([A-Za-z0-9+/=]+)<\/script>/.exec(html);
  assert.ok(data);
  assert.equal(Number(data[1]), catalogueBytes);
  assert.equal(Buffer.byteLength(data[2]), packedCatalogueBytes);
  assert.deepEqual(await decodeCatalogueData(data[2], Number(data[1])), catalogue);
  const module = /<script type="module">([\s\S]*?)<\/script>/.exec(html);
  assert.ok(module);
  assert.equal(module[1], javascript.replace(/<\/script/gi, '<\\/script'));
  const executed = await import('data:text/javascript;base64,' + Buffer.from(module[1]).toString('base64'));
  assert.equal(executed.sample, sample);
  assert.ok(!html.includes('__APP_'));
});
