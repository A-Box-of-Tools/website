/** Captured document choices and retired native encoders must keep their own resources. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { inflateSync } from 'node:zlib';
import { buildDocument } from '../../tools/images-to-pdf/src/document.js';
import { prepareImage } from '../../tools/images-to-pdf/src/encode.js';
import { errorDetail, outputName, snapshotItems } from '../../tools/images-to-pdf/src/export-state.js';
import { textString } from '../../shared/js/pdf-page-writer.js';

const deferred = () => {
  let resolve;
  const promise = new Promise(yes => { resolve = yes; });
  return { promise, resolve };
};
// This is a parser frame fixture; native browser evidence covers decoded photographs.
const jpeg = (width = 3, height = 2) => new Uint8Array([
  255, 216, 255, 192, 0, 8, 8, height >> 8, height & 255, width >> 8, width & 255, 3, 255, 217,
]);
const item = (name = 'private-photo.jpg', bytes = jpeg()) => ({
  name, file: { type: 'image/jpeg', arrayBuffer: async () => bytes.buffer },
  width: 99, height: 99, orientation: 1, rotate: 0, thumb: { url: 'not-exported' },
});
const settings = Object.freeze({ pageSize: 'fit', dpi: 72, mode: 'keep', maxSide: 0,
  margin: 0, background: '#ffffff', title: '', author: '', dated: false });
const bytesOf = async blob => Buffer.from(await blob.arrayBuffer());
const textOf = async blob => (await bytesOf(blob)).toString('latin1');

function browser(t, hooks = {}) {
  const saved = Object.getOwnPropertyDescriptors(globalThis);
  const bitmaps = [], canvases = [];
  globalThis.createImageBitmap = async file => {
    const bitmap = { width: 2, height: 2, closed: 0, close() { this.closed += 1; } };
    bitmaps.push(bitmap);
    return hooks.decode ? hooks.decode(bitmap, file) : bitmap;
  };
  globalThis.document = { createElement() {
    const canvas = { width: 0, height: 0,
      getContext() {
        if (hooks.context) return hooks.context(canvas);
        return { fillRect() {}, drawImage() {}, getImageData() { return { data: new Uint8ClampedArray([
          12, 40, 90, 255, 60, 70, 80, 0, 11, 22, 33, 128, 99, 88, 77, 255,
        ]) }; } };
      },
      toBlob(callback) { if (hooks.encode) hooks.encode(callback, canvas); else callback(new Blob(['encoded-jpeg'])); },
    };
    canvases.push(canvas);
    return canvas;
  } };
  t.after(() => {
    for (const key of ['createImageBitmap', 'document']) {
      if (saved[key]) Object.defineProperty(globalThis, key, saved[key]); else delete globalThis[key];
    }
  });
  return { bitmaps, canvases };
}
const released = ({ bitmaps, canvases }) => {
  assert.ok(bitmaps.every(bitmap => bitmap.closed === 1));
  assert.ok(canvases.every(canvas => canvas.width === 0 && canvas.height === 0));
};

function unfilter(compressed, width, channels) {
  const filtered = inflateSync(compressed), stride = width * channels;
  const height = filtered.length / (stride + 1), out = new Uint8Array(stride * height);
  for (let y = 0; y < height; y += 1) {
    const kind = filtered[y * (stride + 1)];
    for (let x = 0; x < stride; x += 1) {
      const at = y * stride + x;
      const left = x < channels ? 0 : out[at - channels], up = y ? out[at - stride] : 0;
      const corner = y && x >= channels ? out[at - stride - channels] : 0;
      const p = left + up - corner, distances = [Math.abs(p - left), Math.abs(p - up), Math.abs(p - corner)];
      const paeth = distances[0] <= distances[1] && distances[0] <= distances[2] ? left
        : distances[1] <= distances[2] ? up : corner;
      const predictor = [0, left, up, Math.floor((left + up) / 2), paeth][kind];
      assert.notEqual(predictor, undefined);
      out[at] = filtered[y * (stride + 1) + 1 + x] + predictor;
    }
  }
  return Array.from(out);
}

test('captured image order, rotation and metadata produce an unchanged default document', async () => {
  const source = [item('first-private.jpg', jpeg(3, 2)), item('second-private.jpg', jpeg(4, 2))];
  const captured = snapshotItems(source);
  const baseline = await buildDocument(snapshotItems(source), settings);
  source.reverse(); source[0].rotate = 90; source[0].width = 1234;
  assert.equal(captured[1].rotate, 0);
  assert.equal(captured[1].width, 99);
  assert.ok(!('thumb' in captured[0]));
  const reports = [];
  const actual = await buildDocument(captured, settings, { onProgress: value => reports.push(value) });
  assert.deepEqual(await bytesOf(actual.blob), await bytesOf(baseline.blob));
  assert.deepEqual(reports.map(value => value.name), ['first-private.jpg', 'second-private.jpg', '']);
  assert.equal(actual.pages, 2); assert.equal(actual.copied, 2);
  const text = await textOf(actual.blob);
  assert.ok(text.includes(textString('abox.tools images to PDF')));
  assert.ok(text.indexOf('/Width 3') < text.indexOf('/Width 4'));
  for (const absent of ['/Title ', '/Author ', '/CreationDate ', '/ID ', 'private.jpg']) assert.ok(!text.includes(absent));
  assert.equal(source[1].width, 99, 'authoritative JPEG measurements only update the captured item');
});

test('entered Unicode metadata is trimmed and a creation date is opt-in', async () => {
  const { blob } = await buildDocument([item()], { ...settings, title: '  日本語 😀  ', author: '  A (B) \\ C  ', dated: true });
  const text = await textOf(blob);
  assert.ok(text.includes(`/Title ${textString('日本語 😀')}`));
  assert.ok(text.includes(`/Author ${textString('A (B) \\ C')}`));
  assert.match(text, /\/CreationDate \(D:\d{14}(?:Z|[+-]\d{2}'\d{2}')\)/);
  assert.ok(!text.includes('private-photo'));
});

test('retired JPEG reads stop before the next page and cannot affect an independent retry', async () => {
  const gate = deferred(), entered = deferred(), controller = new AbortController();
  const first = item(), next = item('next.jpg');
  let nextReads = 0;
  first.file.arrayBuffer = async () => { entered.resolve(); return gate.promise; };
  next.file.arrayBuffer = async () => { nextReads += 1; return jpeg().buffer; };
  const reports = [];
  const old = buildDocument([first, next], settings, { signal: controller.signal, onProgress: value => reports.push(value) });
  const refused = assert.rejects(old, { name: 'AbortError' });
  await entered.promise; controller.abort();
  const before = reports.slice();
  const retry = await buildDocument([item('retry.jpg')], settings);
  assert.equal(retry.pages, 1);
  gate.resolve(jpeg().buffer); await refused;
  assert.equal(nextReads, 0); assert.deepEqual(reports, before);
});

test('an already aborted document never reads its first file', async () => {
  const controller = new AbortController(); controller.abort();
  const selected = item(); selected.file.arrayBuffer = () => assert.fail('unexpected read');
  await assert.rejects(buildDocument([selected], settings, { signal: controller.signal }), { name: 'AbortError' });
});

test('retired native decode closes its bitmap without creating an encoder canvas', async t => {
  const controller = new AbortController(), gate = deferred(), entered = deferred();
  const resources = browser(t, { decode: async bitmap => { entered.resolve(); await gate.promise; return bitmap; } });
  const work = prepareImage(item(), { ...settings, mode: 'jpeg' }, controller.signal);
  const refused = assert.rejects(work, { name: 'AbortError' });
  await entered.promise; controller.abort(); gate.resolve(); await refused;
  assert.equal(resources.canvases.length, 0); released(resources);
});

test('cancel after native JPEG callback retires canvas pixels and its bitmap', async t => {
  const controller = new AbortController(), entered = deferred();
  let finish;
  const resources = browser(t, { encode(callback) { finish = callback; entered.resolve(); } });
  const work = prepareImage(item(), { ...settings, mode: 'jpeg' }, controller.signal);
  const refused = assert.rejects(work, { name: 'AbortError' });
  await entered.promise; controller.abort(); finish(new Blob(['late jpeg'])); await refused;
  released(resources);
});

test('cancel after encoded Blob read cannot offer late JPEG bytes', async t => {
  const controller = new AbortController(), gate = deferred(), entered = deferred();
  const resources = browser(t, { encode(callback) { callback({ arrayBuffer: async () => {
    entered.resolve(); return gate.promise;
  } }); } });
  const work = prepareImage(item(), { ...settings, mode: 'jpeg' }, controller.signal);
  const refused = assert.rejects(work, { name: 'AbortError' });
  await entered.promise; controller.abort(); gate.resolve(new ArrayBuffer(2)); await refused;
  released(resources);
});

test('native encoder refusal releases its allocated canvas and bitmap', async t => {
  const native = new TypeError('refused "quoted" [canvas]');
  const resources = browser(t, { context() { throw native; } });
  await assert.rejects(prepareImage(item(), { ...settings, mode: 'jpeg' }), error => error === native);
  released(resources);
});

test('a refused JPEG callback preserves its localized key and releases its resources', async t => {
  const resources = browser(t, { encode(callback) { callback(null); } });
  await assert.rejects(prepareImage(item(), { ...settings, mode: 'jpeg' }), { message: 'encode.nojpeg' });
  released(resources);
});

test('lossless encoding preserves exact RGB and alpha samples and retires its canvas', async t => {
  const resources = browser(t);
  const result = await prepareImage(item(), { ...settings, mode: 'lossless' });
  assert.deepEqual(unfilter(result.data, 2, 3), [12, 40, 90, 60, 70, 80, 11, 22, 33, 99, 88, 77]);
  assert.deepEqual(unfilter(result.smask.data, 2, 1), [255, 0, 128, 255]);
  assert.equal(result.predictor, true); released(resources);
});

test('cancel after RGB deflate avoids a second alpha compression and releases pixels', async t => {
  const controller = new AbortController(), gate = deferred(), entered = deferred();
  const resources = browser(t);
  let reads = 0;
  const native = Response.prototype.arrayBuffer;
  t.mock.method(Response.prototype, 'arrayBuffer', async function () {
    reads += 1;
    const bytes = await native.call(this);
    entered.resolve(); await gate.promise; return bytes;
  });
  const work = prepareImage(item(), { ...settings, mode: 'lossless' }, controller.signal);
  const refused = assert.rejects(work, { name: 'AbortError' });
  await entered.promise; controller.abort(); gate.resolve(); await refused;
  assert.equal(reads, 1); released(resources);
});

test('default transparent images use lossless samples and release the alpha probe', async t => {
  const resources = browser(t);
  const selected = item('transparent.png'); selected.file.type = 'image/png';
  const result = await prepareImage(selected, settings);
  assert.equal(result.kind, 'flate'); assert.ok(result.smask);
  assert.equal(resources.canvases.length, 2); released(resources);
});

test('download renaming normalizes only its name and catch boundaries preserve native diagnostics', () => {
  assert.equal(outputName('  report.PDF  '), 'report.pdf');
  assert.equal(outputName('a\\b/c:*?"<>|'), 'a-b-c-------.pdf');
  assert.equal(outputName(' '), 'images.pdf');
  assert.equal(outputName('x'.repeat(130)), 'x'.repeat(120) + '.pdf');
  const calls = [], values = { name: 'quote " [photo]' };
  const phrase = (key, blanks) => { calls.push({ key, blanks }); return key + ':' + blanks.name; };
  for (const key of ['build.noimages', 'encode.nojpeg', 'encode.nodeflate', 'read.notimage', 'read.nodecode']) {
    assert.equal(errorDetail(Object.assign(new Error(key), { values }), phrase), key + ':' + values.name);
    assert.equal(calls.at(-1).blanks, values);
  }
  const before = calls.length, native = new TypeError('refused " [native]');
  assert.equal(errorDetail(native, phrase), native.message);
  assert.equal(errorDetail('plain native detail', phrase), 'plain native detail');
  assert.equal(calls.length, before);
});
