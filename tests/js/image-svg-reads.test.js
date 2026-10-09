import test from 'node:test';
import assert from 'node:assert/strict';
import { pictureReads, readPicture, releasePicture } from '../../tools/image-to-svg/src/picture-read.js';

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function environment(t, failPixels = false) {
  const canvases = [], bitmaps = [];
  globalThis.createImageBitmap = file => file.decoding.promise;
  globalThis.document = { createElement() {
    const canvas = { width: 0, height: 0, getContext() { return {
      fillRect() {}, drawImage() {},
      getImageData() { if (failPixels) throw new Error('pixels'); return { width: canvas.width, height: canvas.height }; },
    }; } };
    canvases.push(canvas);
    return canvas;
  } };
  const file = (name) => {
    const bitmap = { width: 120, height: 80, closed: 0, close() { this.closed++; } };
    bitmaps.push(bitmap);
    return { name, bitmap, decoding: deferred() };
  };
  return { canvases, bitmaps, file };
}

// Native globals are absent in Node, so fixtures install only the two APIs the
// decoder owns and restore them after each real promise/lifetime scenario.
function nativeEnvironment(t, failPixels = false) {
  const saved = { document: globalThis.document, createImageBitmap: globalThis.createImageBitmap };
  globalThis.document = { createElement() {} };
  globalThis.createImageBitmap = () => {};
  t.after(() => { for (const [key, value] of Object.entries(saved)) {
    if (value === undefined) delete globalThis[key]; else globalThis[key] = value;
  } });
  return environment(t, failPixels);
}

test('a retired native decode closes its bitmap before allocating or applying a picture', async (t) => {
  const e = nativeEnvironment(t), applied = [], errors = [], status = [];
  const reads = pictureReads({ apply: p => applied.push(p), failed: e => errors.push(e),
    busy: () => status.push('busy'), done: () => status.push('done') });
  const file = e.file('retired.png'), work = reads.read(file);
  reads.retire();
  file.decoding.resolve(file.bitmap);
  await work;
  assert.deepEqual(applied, []);
  assert.deepEqual(errors, []);
  assert.deepEqual(status, ['busy', 'done']);
  assert.equal(file.bitmap.closed, 1);
  assert.equal(e.canvases.length, 0);
});

test('newest picture owns success and busy cleanup while an earlier read finishes', async (t) => {
  const e = nativeEnvironment(t), applied = [], status = [];
  const reads = pictureReads({ apply: p => applied.push(p), failed: assert.fail,
    busy: () => status.push('busy'), done: () => status.push('done') });
  const first = e.file('first.png'), second = e.file('second.png');
  const a = reads.read(first), b = reads.read(second);
  first.decoding.resolve(first.bitmap);
  await a;
  assert.deepEqual(status, ['busy', 'busy']);
  assert.deepEqual(applied, []);
  second.decoding.resolve(second.bitmap);
  await b;
  assert.equal(applied[0].name, 'second.png');
  assert.deepEqual(status, ['busy', 'busy', 'done']);
  assert.deepEqual(e.bitmaps.map(v => v.closed), [1, 1]);
  assert.equal(applied[0].canvas.width, 120);
  releasePicture(applied[0]);
  assert.equal(applied[0].canvas.width, 0);
  assert.equal(applied[0].canvas.height, 0);
});

test('late native failure cannot report an error over the current source', async (t) => {
  const e = nativeEnvironment(t), errors = [], applied = [];
  const reads = pictureReads({ apply: p => applied.push(p), failed: e => errors.push(e), busy() {}, done() {} });
  const first = e.file('first.png'), second = e.file('second.png');
  const a = reads.read(first), b = reads.read(second);
  first.decoding.reject(new Error('old "native]" error'));
  await a;
  second.decoding.resolve(second.bitmap);
  await b;
  assert.deepEqual(errors, []);
  assert.equal(applied[0].name, 'second.png');
  releasePicture(applied[0]);
});

test('pixel extraction failure releases both decode bitmap and temporary canvas', async (t) => {
  const e = nativeEnvironment(t, true), file = e.file('pixels.png');
  const work = readPicture(file);
  file.decoding.resolve(file.bitmap);
  await assert.rejects(work, /pixels/);
  assert.equal(file.bitmap.closed, 1);
  assert.equal(e.canvases[0].width, 0);
  assert.equal(e.canvases[0].height, 0);
});
