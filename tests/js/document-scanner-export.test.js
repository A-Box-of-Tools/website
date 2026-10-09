/** Page ownership is checked at the awaits where a retired native job returns. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { writeScan } from '../../tools/document-scanner/src/write-scan.js';
import { encodeImage, encodePage } from '../../tools/document-scanner/src/encode.js';
import { buildDocument } from '../../tools/document-scanner/src/document.js';
import { errorDetail, fileSummary, photoBatch, snapshotPages } from '../../tools/document-scanner/src/pages.js';

const immediate = async () => {};
const deferred = () => {
  let resolve;
  const promise = new Promise(yes => { resolve = yes; });
  return { promise, resolve };
};
const pages = () => [1, 2].map(index => ({
  name: `photo-${index}.jpg`, file: new Blob([String(index)]), width: 2, height: 2,
  quad: [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 2 }, { x: 0, y: 2 }],
}));
const options = Object.freeze({ mode: 'mono', quality: .82, title: 'Captured', pageSize: 'fit', dpi: 200, margin: 10 });
const mono = () => ({
  width: 2, height: 2, mono: true, grey: true,
  data: new Uint8ClampedArray([255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255]),
});

test('scan export preserves the mono PDF writer bytes and captured page order', async () => {
  const original = pages();
  const selected = snapshotPages(original);
  original.reverse();
  original[0].quad[0].x = 99;
  const seen = [];
  const rendered = [];
  const result = await writeScan(selected, options, {
    kind: 'pdf', yieldControl: immediate,
    renderPage: async page => { seen.push(page.name); rendered.push(mono()); return rendered.at(-1); },
  });
  const streams = await Promise.all(rendered.map(page => encodePage(page, options)));
  const expected = buildDocument(streams, options);
  assert.deepEqual(Buffer.from(await result.blob.arrayBuffer()), Buffer.from(await expected.arrayBuffer()));
  assert.deepEqual(seen, ['photo-1.jpg', 'photo-2.jpg']);
  assert.equal(selected[1].quad[0].x, 0);
  assert.equal(result.name, 'photo-1-scan.pdf');
  assert.equal(result.count, 2);
});

test('cancelled scan decoding never starts encoding or the next page', async () => {
  const controller = new AbortController();
  const read = deferred();
  const entered = deferred();
  let rendered = 0, encoded = 0, written = 0;
  const reports = [];
  const work = writeScan(pages(), options, {
    kind: 'pdf', signal: controller.signal, yieldControl: immediate,
    renderPage: async () => { rendered += 1; entered.resolve(); return read.promise; },
    encodePdfPage: async () => { encoded += 1; },
    documentWriter: () => { written += 1; }, report: key => reports.push(key),
  });
  const refused = assert.rejects(work, { name: 'AbortError' });
  await entered.promise;
  controller.abort();
  const before = reports.slice();
  read.resolve(mono());
  await refused;
  assert.deepEqual(reports, before);
  assert.equal(rendered, 1);
  assert.equal(encoded, 0);
  assert.equal(written, 0);
});

test('cancelled scan encoding cannot assemble a file or disturb an independent retry', async () => {
  const controller = new AbortController();
  const native = deferred(), entered = deferred();
  let oldRenders = 0, oldWrites = 0;
  const oldReports = [];
  const old = writeScan(pages(), options, {
    kind: 'pdf', signal: controller.signal, yieldControl: immediate,
    renderPage: async () => { oldRenders += 1; return mono(); },
    encodePdfPage: async () => { entered.resolve(); return native.promise; },
    documentWriter: () => { oldWrites += 1; }, report: key => oldReports.push(key),
  });
  const refused = assert.rejects(old, { name: 'AbortError' });
  await entered.promise;
  controller.abort();
  const before = oldReports.slice();
  const retry = await writeScan(pages().slice(0, 1), options, {
    kind: 'pdf', yieldControl: immediate, renderPage: async () => mono(),
  });
  assert.equal(retry.count, 1);
  assert.ok(retry.blob.size > 0);
  native.resolve({ kind: 'flate1', width: 2, height: 2, data: new Uint8Array(), gray: true });
  await refused;
  assert.equal(oldRenders, 1);
  assert.equal(oldWrites, 0);
  assert.deepEqual(oldReports, before);
});

test('one scanned image remains one file without an unnecessary archive', async () => {
  const blob = new Blob(['image bytes'], { type: 'image/png' });
  let zipped = 0;
  const result = await writeScan(pages().slice(0, 1), options, {
    kind: 'images', yieldControl: immediate, renderPage: async () => mono(),
    encodeImagePage: async () => ({ blob, extension: 'png' }), zipWriter: () => { zipped += 1; },
  });
  assert.equal(result.blob, blob);
  assert.equal(result.name, 'photo-1-page-1.png');
  assert.equal(zipped, 0);
});

test('scan ZIP reading checks cancellation before assembly after native blob reads', async () => {
  const controller = new AbortController();
  const bytes = deferred(), entered = deferred();
  let zipped = 0;
  const work = writeScan(pages(), options, {
    kind: 'images', signal: controller.signal, yieldControl: immediate,
    renderPage: async () => mono(),
    encodeImagePage: async () => ({ extension: 'png', blob: {
      arrayBuffer: () => { entered.resolve(); return bytes.promise; },
    } }),
    zipWriter: () => { zipped += 1; },
  });
  const refused = assert.rejects(work, { name: 'AbortError' });
  await entered.promise;
  controller.abort();
  bytes.resolve(new ArrayBuffer(2));
  await refused;
  assert.equal(zipped, 0);
});

test('native canvas cancellation releases pixels and avoids reading refused JPEG bytes', async t => {
  const oldDocument = globalThis.document, oldImageData = globalThis.ImageData;
  t.after(() => { globalThis.document = oldDocument; globalThis.ImageData = oldImageData; });
  globalThis.ImageData = class { constructor(data, width, height) { Object.assign(this, { data, width, height }); } };
  const canvases = [];
  let callback, reads = 0;
  globalThis.document = { createElement: () => {
    const canvas = { width: 0, height: 0, getContext: () => ({ putImageData() {} }), toBlob: done => { callback = done; } };
    canvases.push(canvas);
    return canvas;
  } };
  for (const encoder of [encodePage, encodeImage]) {
    const controller = new AbortController();
    const work = encoder({ ...mono(), mono: false }, options, controller.signal);
    const refused = assert.rejects(work, { name: 'AbortError' });
    controller.abort();
    callback({ arrayBuffer: () => { reads += 1; return Promise.resolve(new ArrayBuffer(2)); } });
    await refused;
    assert.equal(canvases.at(-1).width, 0);
    assert.equal(canvases.at(-1).height, 0);
  }
  assert.equal(reads, 0);
});

test('native canvas setup failure releases an allocated scan canvas', async t => {
  const oldDocument = globalThis.document;
  t.after(() => { globalThis.document = oldDocument; });
  const canvas = { width: 0, height: 0, getContext() { throw new Error('canvas refused'); } };
  globalThis.document = { createElement: () => canvas };
  await assert.rejects(encodePage({ ...mono(), mono: false }, options), /canvas refused/);
  assert.equal(canvas.width, 0);
  assert.equal(canvas.height, 0);
});

test('photo admission and bounded refusals distinguish extensions from decoded support', () => {
  const avif = { name: 'photo.avif', type: '' }, heic = { name: 'phone.heic', type: '' };
  const typedHeic = { name: 'phone.heic', type: 'image/heic' }, pdf = { name: 'form.pdf', type: 'application/pdf' };
  const result = photoBatch([avif, heic, typedHeic, pdf]);
  assert.deepEqual(result.accepted, [avif, typedHeic]);
  assert.deepEqual(result.refused, [heic, pdf]);
  const long = '📷'.repeat(120) + '<script>untrusted</script>';
  const summary = fileSummary([{ name: long }, { name: 'two.pdf' }, { name: 'three.pdf' }, { name: 'four.pdf' }]);
  assert.equal(summary.count, 4);
  assert.equal(summary.more, 1);
  assert.ok(summary.names.startsWith('📷'.repeat(80) + '…'));
  assert.ok(!summary.names.includes('script'));
  assert.ok(!summary.names.includes('four.pdf'));
});


test('scan catches resolve only known leaf keys and preserve their phrase values', () => {
  const calls = [], values = { detail: 'a quoted "value" [with brackets]', count: 7 };
  const phrase = (key, blanks) => { calls.push({ key, blanks }); return `${key}:${blanks.detail}`; };
  for (const key of ['build.nopages', 'encode.nodeflate', 'encode.nojpeg', 'encode.nopage', 'warp.degenerate']) {
    assert.equal(errorDetail(Object.assign(new Error(key), { values }), phrase), `${key}:${values.detail}`);
    assert.equal(calls.at(-1).blanks, values);
  }
  const before = calls.length;
  const native = new TypeError('The browser refused "quoted" [canvas] input.');
  assert.equal(errorDetail(native, phrase), native.message);
  assert.equal(errorDetail('plain diagnostic', phrase), 'plain diagnostic');
  assert.equal(calls.length, before);
});
