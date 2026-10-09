/** Native operations are deferred boundaries; retained batch work is our contract. */

import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareImageBatch, convertImageBatch } from '../../shared/js/image-batch.js';
import { JPEG, WEBP } from '../../shared/js/image-convert.js';

const source = (id) => ({
  id, file: new File([new Uint8Array([id])], 'same.webp', { type: WEBP }),
  alpha: id === 2, animated: false,
});
const settings = () => ({ mime: JPEG, quality: 0.92, background: '#ffffff' });
const picture = (file) => ({ bitmap: { file }, width: 12, height: 8 });
const blob = () => new Blob(['encoded'], { type: JPEG });
const noYield = async () => {};
function deferred() {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
}

function boundaries(extra = {}) {
  return { read: async (file) => picture(file), write: async () => ({ blob: blob() }),
    dispose: () => {}, yieldControl: noYield, ...extra };
}

test('a decode failure retains earlier outputs, attempts later files and keeps allocated names', async () => {
  const items = [source(1), source(2), source(3)];
  const plan = prepareImageBatch(items, settings());
  const failure = new Error('error.decode');
  const reads = [];
  const disposed = [];
  const progress = [];
  const outcome = await convertImageBatch(plan, boundaries({
    read: async (file) => { reads.push(file); if (file === items[1].file) throw failure; return picture(file); },
    dispose: (bitmap) => disposed.push(bitmap.file),
    onProgress: (index, total, item) => progress.push([index, total, item.id]),
  }));
  assert.deepEqual(reads, items.map(item => item.file));
  assert.deepEqual(outcome.results.map(result => result.item.id), [1, 3]);
  assert.deepEqual(outcome.results.map(result => result.name), ['same.jpg', 'same-3.jpg']);
  assert.equal(outcome.failures[0].item.id, 2);
  assert.equal(outcome.failures[0].error, failure);
  assert.deepEqual(disposed, [items[0].file, items[2].file]);
  assert.deepEqual(progress, [[0, 3, 1], [1, 3, 2], [2, 3, 3]]);
  assert.equal(outcome.stopped, false);
  assert.equal(outcome.total, 3);
});

test('an encoder failure carries its phrase values and releases all decoded bitmaps', async () => {
  const items = [source(1), source(2), source(3)];
  const failure = Object.assign(new Error('error.encode'), { values: { format: 'JPEG' } });
  const disposed = [];
  const outcome = await convertImageBatch(prepareImageBatch(items, settings()), boundaries({
    write: async (bitmap) => { if (bitmap.file === items[1].file) throw failure; return { blob: blob() }; },
    dispose: (bitmap) => disposed.push(bitmap.file),
  }));
  assert.deepEqual(outcome.results.map(result => result.item.id), [1, 3]);
  assert.equal(outcome.failures[0].error, failure);
  assert.deepEqual(outcome.failures[0].error.values, { format: 'JPEG' });
  assert.deepEqual(disposed, items.map(item => item.file));
});

test('a pending decode cannot mix live settings or source facts into a prepared batch', async () => {
  const items = [source(1), source(2)];
  const before = settings();
  const plan = prepareImageBatch(items, before);
  const waiting = deferred();
  const started = deferred();
  const writes = [];
  const outcomePromise = convertImageBatch(plan, boundaries({
    read: async (file) => { started.resolve(); await waiting.promise; return picture(file); },
    write: async (_, options) => { writes.push(options); return { blob: blob() }; },
  }));
  await started.promise;
  before.mime = WEBP;
  before.quality = 0.4;
  before.background = '#000000';
  items[0].alpha = true;
  items[0].id = 99;
  items.length = 0;
  waiting.resolve();
  const outcome = await outcomePromise;
  assert.equal(outcome.total, 2);
  assert.deepEqual(writes, [1, 2].map(() => ({ ...settings(), width: 12, height: 8 })));
  assert.equal(outcome.results[0].item.id, 1);
  assert.equal(outcome.results[0].item.alpha, false);
  assert.equal(outcome.results[0].settings.background, '#ffffff');
  assert.deepEqual(outcome.results.map(result => result.name), ['same.jpg', 'same-2.jpg']);
});

test('a stop while yielding starts no decoder and keeps an empty stopped outcome', async () => {
  const waiting = deferred();
  const started = deferred();
  let stopping = false;
  const pending = convertImageBatch(prepareImageBatch([source(1)], settings()), boundaries({
    yieldControl: () => { started.resolve(); return waiting.promise; },
    shouldStop: () => stopping,
    read: () => assert.fail('a stop before decoding must not start work'),
  }));
  await started.promise;
  stopping = true;
  waiting.resolve();
  assert.deepEqual(await pending, { results: [], failures: [], stopped: true, total: 1 });
});

test('a stop during a later decode releases that bitmap, skips writing and preserves prior work', async () => {
  const items = [source(1), source(2), source(3)];
  const waiting = deferred();
  const started = deferred();
  let stopping = false;
  const reads = [];
  const writes = [];
  const disposed = [];
  const pending = convertImageBatch(prepareImageBatch(items, settings()), boundaries({
    read: async (file) => { reads.push(file); if (file === items[1].file) { started.resolve(); await waiting.promise; } return picture(file); },
    write: async (bitmap) => { writes.push(bitmap.file); return { blob: blob() }; },
    dispose: (bitmap) => disposed.push(bitmap.file), shouldStop: () => stopping,
  }));
  await started.promise;
  stopping = true;
  waiting.resolve();
  const outcome = await pending;
  assert.deepEqual(reads, items.slice(0, 2).map(item => item.file));
  assert.deepEqual(writes, [items[0].file]);
  assert.deepEqual(disposed, items.slice(0, 2).map(item => item.file));
  assert.deepEqual(outcome.results.map(result => result.item.id), [1]);
  assert.deepEqual(outcome.failures, []);
  assert.equal(outcome.stopped, true);
});

test('a stop during encoding keeps the completed result and starts no later job', async () => {
  const items = [source(1), source(2)];
  const waiting = deferred();
  const started = deferred();
  let stopping = false;
  const reads = [];
  const disposed = [];
  const pending = convertImageBatch(prepareImageBatch(items, settings()), boundaries({
    read: async (file) => { reads.push(file); return picture(file); },
    write: async () => { started.resolve(); await waiting.promise; return { blob: blob() }; },
    dispose: (bitmap) => disposed.push(bitmap.file), shouldStop: () => stopping,
  }));
  await started.promise;
  stopping = true;
  waiting.resolve();
  const outcome = await pending;
  assert.equal(outcome.results.length, 1);
  assert.deepEqual(reads, [items[0].file]);
  assert.deepEqual(disposed, [items[0].file]);
  assert.equal(outcome.stopped, true);
});

test('a custom WebP writer keeps its actual lossless verdict rather than echoing the request', async () => {
  const input = source(1);
  const plan = prepareImageBatch([input], { mime: WEBP, quality: 0.85, lossless: true });
  const actual = new Blob(['lossy'], { type: WEBP });
  const outcome = await convertImageBatch(plan, boundaries({
    write: async (_, options) => {
      assert.equal(options.lossless, true);
      assert.equal(options.quality, 0.85);
      return { blob: actual, lossless: false };
    },
  }));
  assert.equal(outcome.results[0].blob, actual);
  assert.equal(outcome.results[0].lossless, false);
  assert.equal(outcome.results[0].settings.lossless, true);
  assert.equal(outcome.results[0].settings.quality, 0.85);
  assert.equal(outcome.results[0].settings.mime, WEBP);
  assert.equal(outcome.results[0].name, 'same.webp');
});
