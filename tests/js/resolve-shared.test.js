/**
 * tests/js/resolve-shared.mjs - where a test finds a tool's ./shared/ imports.
 *
 * The hook is registered before this file loads, so the plainest proof that it
 * works is elsewhere: exif-containers.test.js imports
 * tools/exif-editor/src/png.js, and png.js imports ./shared/crc32.js. What is
 * held here is the contract - which specifiers the hook touches, that it
 * touches nothing else, and that the rewrite really does land on a file - so
 * that a change to it is judged against something narrower than "the suite
 * still passes".
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { resolve } from './resolve-shared.mjs';

const ROOT = new URL('../../', import.meta.url);
const at = (path) => new URL(path, ROOT).href;
const from = (path) => ({ parentURL: at(path) });

// Stands in for Node's own resolver: whatever reaches it is reported back, so
// a test can see exactly what the hook handed on.
const asWritten = (specifier, context) => ({ url: `next:${specifier}`, context });

test('a ./shared/ import in a tool module lands on shared/js', () => {
  const { url } = resolve('./shared/crc32.js', from('tools/exif-editor/src/png.js'), asWritten);
  assert.equal(url, `next:${at('shared/js/crc32.js')}`);
});

test('main.js gets the same answer as a leaf', () => {
  const { url } = resolve('./shared/zip.js', from('tools/exif-editor/src/main.js'), asWritten);
  assert.equal(url, `next:${at('shared/js/zip.js')}`);
});

test('the context travels through untouched', () => {
  const context = { parentURL: at('tools/merge-pdf/src/produce.js'), conditions: ['node'] };
  const seen = resolve('./shared/zip.js', context, asWritten);
  assert.equal(seen.context, context);
});

test('a shared module importing its neighbour is left to Node', () => {
  const { url } = resolve('./crc32.js', from('shared/js/zip.js'), asWritten);
  assert.equal(url, 'next:./crc32.js');
});

test('anything that is not a tool module asking for one shared file is left alone', () => {
  const untouched = [
    ['./shared/crc32.js', 'tests/js/helpers.js'],
    ['./shared/crc32.js', 'shared/js/zip.js'],
    ['./shared/crc32.js', 'tools/exif-editor/src/deeper/png.js'],
    ['./shared/crc32.js', 'tools/exif-editor/png.js'],
    ['./shared/nested/crc32.js', 'tools/exif-editor/src/png.js'],
    ['./crc32.js', 'tools/exif-editor/src/png.js'],
    ['../shared/crc32.js', 'tools/exif-editor/src/png.js'],
    ['node:fs', 'tools/exif-editor/src/png.js'],
  ];
  for (const [specifier, parent] of untouched) {
    assert.equal(resolve(specifier, from(parent), asWritten).url, `next:${specifier}`,
      `${specifier} from ${parent}`);
  }
});

test('a module with no parent is left alone', () => {
  assert.equal(resolve('./shared/crc32.js', {}, asWritten).url, 'next:./shared/crc32.js');
});

test('the two modules that gave up their copies load through the hook', async () => {
  // Both run in this file's own child process, so this also shows that
  // `node --test` carried the --import into it.
  const png = await import(at('tools/exif-editor/src/png.js'));
  const produce = await import(at('tools/merge-pdf/src/produce.js'));
  assert.equal(typeof png.read, 'function');
  assert.equal(typeof produce.produce, 'function');
});
