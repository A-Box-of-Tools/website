/** The browser and vendored decoder are boundaries; the batch decisions are ours. */

import test from 'node:test';
import assert from 'node:assert/strict';
import { captureBatch, convertOne } from '../../tools/heic-to-jpg/src/convert.js';
import { encodePixels, JPEG, PNG } from '../../tools/heic-to-jpg/src/codecs.js';
import { resultTotals, uniqueNames } from '../../tools/heic-to-jpg/src/files.js';
import { readBytes } from '../../tools/exif-editor/src/container.js';
import { jpeg, TIFF_LE } from './helpers.js';

const item = (id = 1, avif = false) => ({
  id, avif, file: new File([new Uint8Array([1, 2, 3])], 'IMG_0001.HEIC'),
  exif: { present: true, camera: 'Acme', gps: false },
});
const options = () => ({ mime: JPEG, quality: 0.92, keepExif: true });
const picture = (primary = true) => ({
  width: 1, height: 1, pixels: new Uint8ClampedArray([255, 0, 0, 128]), primary,
});
const encoded = () => new Blob([jpeg()], { type: JPEG });

function deferred() {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
}

test('a delayed full-file read keeps the captured settings, source identity and metadata', async () => {
  const source = item(7);
  const waiting = deferred();
  source.file.arrayBuffer = () => waiting.promise;
  const settingsBefore = options();
  const originals = [source];
  const { batch, settings } = captureBatch(originals, settingsBefore);
  const writes = [];
  const steps = [];
  const pending = convertOne(batch[0], settings, (key) => steps.push(key), {
    decodeHeic: async () => [picture()],
    encodePixels: async (_, encoding) => { writes.push(encoding); return encoded(); },
    readExif: () => TIFF_LE,
  });
  settingsBefore.mime = PNG;
  settingsBefore.quality = 0.5;
  settingsBefore.keepExif = false;
  source.id = 99;
  source.exif.camera = 'changed';
  originals.length = 0;
  waiting.resolve(new Uint8Array([1, 2, 3]).buffer);
  const [result] = await pending;
  assert.deepEqual(writes, [{ mime: JPEG, quality: 0.92 }]);
  assert.equal(result.inputId, 7);
  assert.equal(result.exif.camera, 'Acme');
  assert.equal(result.mime, JPEG);
  assert.equal(result.quality, 0.92);
  assert.equal(result.metadata, 'kept');
  assert.deepEqual(steps, ['step.decoding', 'step.writing.file']);
  const read = await readBytes(new Uint8Array(await result.blob.arrayBuffer()));
  assert.equal(read.exif.groups.ifd0.find(tag => tag.tag === 0x0112).value, 1);
  assert.equal(TIFF_LE[30], 6, 'the source metadata remains unchanged');
});

test('multiple pictures share one source identity and metadata belongs only to the primary', async () => {
  const { batch, settings } = captureBatch([item(3)], options());
  const results = await convertOne(batch[0], settings, () => {}, {
    decodeHeic: async () => [picture(), picture(false)],
    encodePixels: async () => encoded(),
    readExif: () => TIFF_LE,
  });
  assert.deepEqual(results.map(result => result.inputId), [3, 3]);
  assert.deepEqual(results.map(result => result.metadata), ['kept', 'none']);
  assert.deepEqual(results.map(result => result.part), [1, 2]);
  assert.deepEqual(results.map(result => result.outName), ['IMG_0001.jpg', 'IMG_0001-2.jpg']);
  assert.equal(resultTotals(results).files, 1);
  assert.equal(resultTotals(results).beforeBytes, batch[0].file.size);
});

test('repeated camera names count separately while multiple output pictures count one input once', () => {
  const results = [
    { inputId: 1, name: 'IMG_0001.HEIC', before: 100, after: 10 },
    { inputId: 1, name: 'IMG_0001.HEIC', before: 100, after: 20 },
    { inputId: 2, name: 'IMG_0001.HEIC', before: 200, after: 30 },
  ];
  assert.deepEqual(resultTotals(results), { files: 2, pictures: 3, beforeBytes: 300, afterBytes: 60 });
  assert.deepEqual(uniqueNames(['IMG_0001.jpg', 'IMG_0001-2.jpg', 'IMG_0001.jpg']),
    ['IMG_0001.jpg', 'IMG_0001-2.jpg', 'IMG_0001-3.jpg']);
  assert.deepEqual(resultTotals([]), { files: 0, pictures: 0, beforeBytes: 0, afterBytes: 0 });
});

test('metadata is omitted for PNG or an unchecked option and oversized JPEG metadata is reported', async () => {
  for (const [mime, keepExif] of [[PNG, true], [JPEG, false]]) {
    const { batch, settings } = captureBatch([item()], { ...options(), mime, keepExif });
    const [result] = await convertOne(batch[0], settings, () => {}, {
      decodeHeic: async () => [picture()], encodePixels: async () => encoded(),
      readExif: () => assert.fail('metadata that cannot be copied must not be read'),
    });
    assert.equal(result.metadata, 'none');
  }
  const { batch, settings } = captureBatch([item()], options());
  const [result] = await convertOne(batch[0], settings, () => {}, {
    decodeHeic: async () => [picture()], encodePixels: async () => encoded(),
    readExif: () => new Uint8Array(65535),
  });
  assert.equal(result.metadata, 'too large');
  assert.deepEqual(new Uint8Array(await result.blob.arrayBuffer()), jpeg());
});

test('AVIF keeps captured encoding during a pending decode and never requests HEIC metadata', async () => {
  const source = item(8, true);
  const before = options();
  const { batch, settings } = captureBatch([source], before);
  const waiting = deferred();
  const bitmap = {};
  const writes = [];
  const released = [];
  const pending = convertOne(batch[0], settings, () => {}, {
    decode: () => waiting.promise,
    encode: async (_, encoding) => { writes.push(encoding); return encoded(); },
    release: (source) => released.push(source),
    decodeHeic: () => assert.fail('AVIF must not use the HEIC engine'),
    readExif: () => assert.fail('AVIF must not read HEIC metadata'),
  });
  before.mime = PNG;
  before.quality = 0.5;
  before.keepExif = false;
  waiting.resolve({ bitmap, width: 12, height: 8 });
  const [result] = await pending;
  assert.deepEqual(writes, [{ width: 12, height: 8, mime: JPEG, quality: 0.92, background: '#ffffff' }]);
  assert.equal(result.metadata, 'none');
  assert.equal(result.inputId, 8);
  assert.equal(settings.hasHeic, false);
  assert.deepEqual(released, [bitmap]);
});

test('AVIF releases its bitmap after an encoder error or cancellation before encoding', async () => {
  for (const cancel of [false, true]) {
    const { batch, settings } = captureBatch([item(1, true)], options());
    const bitmap = {};
    const released = [];
    const failure = cancel ? new DOMException('Cancelled', 'AbortError') : new Error('error.encode');
    await assert.rejects(convertOne(batch[0], settings, (key) => {
      if (cancel && key === 'step.writing.file') throw failure;
    }, {
      decode: async () => ({ bitmap, width: 1, height: 1 }),
      encode: async () => { if (cancel) assert.fail('cancelled work must not encode'); throw failure; },
      release: (source) => released.push(source),
    }), (error) => error === failure);
    assert.deepEqual(released, [bitmap]);
  }
});

test('pixel canvases clear after success and context, pixel, compositing or encoder failure', async () => {
  for (const mime of [JPEG, PNG]) {
    for (const failure of ['none', 'context', 'pixels', 'draw', 'encode', 'null']) {
      if (mime === PNG && failure === 'draw') continue;
      const expected = new Error(failure);
      const canvases = [];
      const previousDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
      const previousImage = Object.getOwnPropertyDescriptor(globalThis, 'ImageData');
      Object.defineProperty(globalThis, 'ImageData', { configurable: true, value: class {} });
      Object.defineProperty(globalThis, 'document', {
        configurable: true, value: { createElement: () => {
          const canvas = {
            width: 0, height: 0,
            getContext: () => {
              if (failure === 'context') throw expected;
              return {
                putImageData() { if (failure === 'pixels') throw expected; },
                fillRect() {},
                drawImage() { if (failure === 'draw') throw expected; },
              };
            },
            toBlob(callback) {
              if (failure === 'encode') throw expected;
              callback(failure === 'null' ? null : new Blob(['encoded'], { type: mime }));
            },
          };
          canvases.push(canvas);
          return canvas;
        } },
      });
      try {
        const output = encodePixels(picture(), { mime, quality: 0.92 });
        if (failure === 'none') assert.equal((await output).type, mime);
        else if (failure === 'null') await assert.rejects(output, /codec\.nowrite/);
        else await assert.rejects(output, (error) => error === expected);
      } finally {
        if (previousDocument) Object.defineProperty(globalThis, 'document', previousDocument);
        else delete globalThis.document;
        if (previousImage) Object.defineProperty(globalThis, 'ImageData', previousImage);
        else delete globalThis.ImageData;
      }
      assert.ok(canvases.length > 0);
      for (const canvas of canvases) {
        assert.equal(canvas.width, 0, failure);
        assert.equal(canvas.height, 0, failure);
      }
    }
  }
});
