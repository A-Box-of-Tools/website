/** Retired image batches dispose of decoded resources that never reach the list. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadImages, releaseItem } from '../../tools/images-to-pdf/src/images.js';
import { nativeSlots } from '../../tools/images-to-pdf/src/native-work.js';
import { orderedLoads } from '../../shared/js/ordered-loads.js';

const deferred = () => {
  let resolve;
  const promise = new Promise(yes => { resolve = yes; });
  return { promise, resolve };
};
const file = (name = 'photo.png', type = 'image/png') => ({ name, type, size: 123,
  lastModified: 456, slice() { return new Blob(['unreadable JPEG header']); } });
function browser(t, hooks = {}) {
  const saved = Object.getOwnPropertyDescriptors(globalThis);
  const bitmaps = [], canvases = [], images = [], created = [], revoked = [];
  globalThis.createImageBitmap = async selected => {
    if (hooks.refuse?.(selected)) throw new TypeError('native decoder refusal');
    const bitmap = { width: 400, height: 200, closed: 0, close() { this.closed += 1; } };
    bitmaps.push(bitmap);
    return hooks.decode ? hooks.decode(bitmap, selected) : bitmap;
  };
  globalThis.document = { createElement() {
    const canvas = { width: 0, height: 0, getContext() { return { drawImage() {} }; },
      toBlob(callback) { if (hooks.encode) hooks.encode(callback, canvas); else callback(new Blob(['thumbnail'])); } };
    canvases.push(canvas);
    return canvas;
  } };
  globalThis.Image = class {
    constructor() { this.src = ''; this.removed = 0; images.push(this); }
    async decode() { await hooks.imageDecode?.(this); }
    removeAttribute(name) { assert.equal(name, 'src'); this.src = ''; this.removed += 1; }
  };
  t.mock.method(URL, 'createObjectURL', () => { const url = `blob:thumbnail-${created.length}`; created.push(url); return url; });
  t.mock.method(URL, 'revokeObjectURL', url => revoked.push(url));
  t.after(() => {
    for (const key of ['createImageBitmap', 'document', 'Image']) {
      if (saved[key]) Object.defineProperty(globalThis, key, saved[key]); else delete globalThis[key];
    }
  });
  return { bitmaps, canvases, images, created, revoked };
}
const closed = resources => {
  assert.ok(resources.bitmaps.every(bitmap => bitmap.closed === 1));
  assert.ok(resources.canvases.every(canvas => canvas.width === 0 && canvas.height === 0));
};

test('successful imports retain only small thumbnails and explicit release clears their sources', async t => {
  const resources = browser(t);
  const result = await loadImages([file()]);
  assert.equal(result.items.length, 1); assert.deepEqual(result.skipped, []);
  const selected = result.items[0];
  assert.equal(selected.width, 400); assert.equal(selected.height, 200);
  assert.equal(selected.lastModified, 456); assert.equal(selected.rotate, 0);
  assert.equal(resources.created.length, 1); assert.deepEqual(resources.revoked, []);
  releaseItem(selected);
  assert.deepEqual(resources.revoked, resources.created);
  assert.equal(resources.images[0].src, ''); closed(resources);
});

test('image admission and native decoder refusals retain localized filenames', async t => {
  const resources = browser(t, { refuse: selected => selected.name === 'broken.avif' });
  const result = await loadImages([file('form.pdf', 'application/pdf'), file('photo.avif', ''), file('broken.avif', '')]);
  assert.equal(result.items.length, 1);
  assert.deepEqual(result.skipped, [
    { key: 'read.notimage', values: { name: 'form.pdf' } },
    { key: 'read.nodecode', values: { name: 'broken.avif' } },
  ]);
  releaseItem(result.items[0]); closed(resources);
});

test('abort after native decode closes its bitmap before creating a thumbnail', async t => {
  const controller = new AbortController(), gate = deferred(), entered = deferred();
  const resources = browser(t, { decode: async bitmap => { entered.resolve(); await gate.promise; return bitmap; } });
  const work = loadImages([file()], { signal: controller.signal });
  const refused = assert.rejects(work, { name: 'AbortError' });
  await entered.promise; controller.abort(); gate.resolve(); await refused;
  assert.equal(resources.canvases.length, 0); assert.deepEqual(resources.created, []); closed(resources);
});

test('abort at native thumbnail encoding retires the canvas before making an object URL', async t => {
  const controller = new AbortController(), entered = deferred();
  let finish;
  const resources = browser(t, { encode(callback) { finish = callback; entered.resolve(); } });
  const work = loadImages([file()], { signal: controller.signal });
  const refused = assert.rejects(work, { name: 'AbortError' });
  await entered.promise; controller.abort(); finish(new Blob(['late thumbnail'])); await refused;
  assert.deepEqual(resources.created, []); closed(resources);
});

test('abort during thumbnail image decode revokes its URL and removes the image source', async t => {
  const controller = new AbortController(), gate = deferred(), entered = deferred();
  const resources = browser(t, { imageDecode: async () => { entered.resolve(); await gate.promise; } });
  const work = loadImages([file()], { signal: controller.signal });
  const refused = assert.rejects(work, { name: 'AbortError' });
  await entered.promise; controller.abort(); gate.resolve(); await refused;
  assert.deepEqual(resources.revoked, resources.created);
  assert.equal(resources.images[0].removed, 1); closed(resources);
});

test('aborting a multi-file import releases already accumulated and late thumbnails exactly once', async t => {
  const controller = new AbortController(), gate = deferred(), entered = deferred();
  let decoded = 0;
  const resources = browser(t, { imageDecode: async () => {
    decoded += 1;
    if (decoded === 2) { entered.resolve(); await gate.promise; }
  } });
  const work = loadImages([file('one.png'), file('two.png'), file('three.png')], { signal: controller.signal });
  const refused = assert.rejects(work, { name: 'AbortError' });
  await entered.promise; controller.abort(); gate.resolve(); await refused;
  assert.equal(decoded, 2);
  assert.equal(resources.revoked.length, 2);
  assert.equal(new Set(resources.revoked).size, 2);
  assert.deepEqual(resources.revoked.slice().sort(), resources.created.slice().sort());
  assert.ok(resources.images.every(image => image.removed === 1)); closed(resources);
});

test('ordered handoff owns current thumbnails while reset discards accumulated and stale resources', async t => {
  const resources = browser(t), gate = deferred(), entered = deferred();
  let first = true;
  const handoffs = [];
  const loads = orderedLoads({
    async read(selected) {
      const { items } = await loadImages([selected]);
      if (selected.name === 'held.png' && first) { first = false; entered.resolve(); await gate.promise; }
      return items[0];
    },
    complete: batch => handoffs.push(batch.items), discard: releaseItem, status() {},
  });
  const retired = loads.add([file('accumulated.png'), file('held.png')]);
  await entered.promise; loads.reset();
  await loads.add([file('fresh.png')]);
  assert.equal(handoffs.length, 1); assert.equal(handoffs[0][0].name, 'fresh.png');
  assert.deepEqual(resources.revoked, []);
  gate.resolve(); await retired;
  assert.equal(handoffs.length, 1);
  assert.equal(resources.revoked.length, 2); assert.equal(new Set(resources.revoked).size, 2);
  assert.ok(!resources.revoked.includes(handoffs[0][0].thumb.url));
  releaseItem(handoffs[0][0]);
  assert.deepEqual(resources.revoked.slice().sort(), resources.created.slice().sort()); closed(resources);
});

test('two unfinished native jobs retain their leases until settlement and a cancelled wait allocates nothing', async () => {
  const slots = nativeSlots(), first = new AbortController(), second = new AbortController(), waiting = new AbortController();
  const releaseFirst = await slots.take(first.signal), releaseSecond = await slots.take(second.signal);
  assert.equal(slots.active, 2);
  first.abort(); second.abort();
  assert.equal(slots.active, 2, 'retirement cannot pretend native work has finished');
  const cancelledWait = slots.take(waiting.signal);
  const refused = assert.rejects(cancelledWait, { name: 'AbortError' });
  waiting.abort(); await refused;
  let entered = false;
  const next = slots.take().then(release => { entered = true; return release; });
  await Promise.resolve(); assert.equal(entered, false);
  releaseFirst(); const releaseNext = await next;
  assert.equal(slots.active, 2); releaseFirst(); assert.equal(slots.active, 2);
  releaseSecond(); releaseNext(); assert.equal(slots.active, 0);
  const already = new AbortController(); already.abort();
  await assert.rejects(slots.take(already.signal), { name: 'AbortError' });
  assert.equal(slots.active, 0);
});
