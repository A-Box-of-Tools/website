/**
 * Native surfaces and bitmaps need explicit ownership, especially when a run
 * stops between awaits. These doubles record that ownership without pretending
 * to check a browser's decoding or canvas rasterisation.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  Cancelled, compareReference, inspect, runStack, surveyFrame,
} from '../../tools/stack-images/src/pipeline.js';

function nativeSurfaces(t, options = {}) {
  const width = options.width ?? 32;
  const height = options.height ?? 64;
  const bitmaps = [];
  const canvases = [];
  const writes = [];
  const replace = (key, value) => {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
    t.after(() => {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    });
  };
  replace('createImageBitmap', async (source, resize) => {
    if (resize && options.failResize) throw new Error('resize failed');
    const bitmap = {
      width: resize?.resizeWidth ?? width,
      height: resize?.resizeHeight ?? height,
      closed: false,
      close() { this.closed = true; },
    };
    bitmaps.push(bitmap);
    options.onDecode?.(bitmaps.length);
    return bitmap;
  });
  replace('OffscreenCanvas', class {
    constructor(w, h) {
      this.width = w;
      this.height = h;
      this.originalWidth = w;
      this.originalHeight = h;
      canvases.push(this);
    }
    getContext() {
      const noop = () => {};
      return {
        save: noop, restore: noop, translate: noop, scale: noop, transform: noop,
        setTransform: noop, rotate: noop, drawImage: noop, clearRect: noop,
        getImageData(x, y, w, h) {
          const data = new Uint8ClampedArray(w * h * 4);
          for (let at = 0; at < data.length; at += 4) {
            data[at] = data[at + 1] = data[at + 2] = 50;
            data[at + 3] = 255;
          }
          return { data };
        },
        putImageData(...args) { writes.push(args); },
      };
    }
    async convertToBlob({ type }) {
      if (options.failEncode) throw new Error('encode failed');
      return new Blob([Uint8Array.of(1)], { type });
    }
  });
  replace('ImageData', class {
    constructor(data, w, h) {
      assert.ok(data instanceof Uint8ClampedArray, 'packing wraps its existing buffer');
      this.data = data;
      this.width = w;
      this.height = h;
    }
  });
  return { bitmaps, canvases, writes };
}

const file = () => new File([Uint8Array.of(0x77)], 'frame.avif', { type: 'image/avif' });
const hooks = () => ({ cancelled: () => false, onProgress() {} });

test('an unknown-format survey retains only a small bitmap and preserves natural dimensions', async (t) => {
  const native = nativeSurfaces(t, { width: 6000, height: 4000 });
  const surveyed = await surveyFrame({ blob: file(), turn: 1, width: null, height: null, decoded: null });
  assert.deepEqual(surveyed.described.decoded, { width: 6000, height: 4000 });
  assert.deepEqual([surveyed.described.width, surveyed.described.height], [6000, 4000]);
  assert.equal(surveyed.described.surveyDecodePixels, 6000 * 4000);
  assert.deepEqual([surveyed.bitmap.width, surveyed.bitmap.height], [256, 171]);
  assert.equal(native.bitmaps[0].closed, true, 'the discovery decode is released immediately');
  assert.equal(surveyed.bitmap.closed, false, 'only the small bitmap passes to the caller');
  assert.deepEqual(native.canvases.map((canvas) => [canvas.originalWidth, canvas.originalHeight]), [[256, 171]]);
  assert.ok(native.canvases.every((canvas) => canvas.width === 0));
  surveyed.bitmap.close();
});

test('a failed survey closes its discovery bitmap and any thumbnail surface', async (t) => {
  const native = nativeSurfaces(t, { width: 6000, height: 4000, failEncode: true });
  await assert.rejects(surveyFrame({ blob: file(), turn: 1 }), /encode failed/);
  assert.ok(native.bitmaps.every((bitmap) => bitmap.closed));
  assert.ok(native.canvases.every((canvas) => canvas.width === 0));
});

test('a failed thumbnail resize releases the full discovery decode', async (t) => {
  const native = nativeSurfaces(t, { width: 6000, height: 4000, failResize: true });
  await assert.rejects(surveyFrame({ blob: file(), turn: 1 }), /resize failed/);
  assert.equal(native.bitmaps.length, 1);
  assert.equal(native.bitmaps[0].closed, true);
});

test('inspection propagates cancellation and closes the last surveyed bitmap', async (t) => {
  let cancelled = false;
  const native = nativeSurfaces(t, { onDecode() { cancelled = true; } });
  await assert.rejects(inspect([file()], {
    cancelled: () => cancelled, onProgress() {},
  }), Cancelled);
  assert.ok(native.bitmaps.every((bitmap) => bitmap.closed));
  assert.ok(native.canvases.every((canvas) => canvas.width === 0));
});

test('a stack cancelled after its full decode releases the active bitmap and scratch', async (t) => {
  let cancelled = false;
  const native = nativeSurfaces(t, { onDecode(count) { if (count === 3) cancelled = true; } });
  await assert.rejects(runStack({ files: [file(), file()], mode: 'mean', align: 'none' }, {
    cancelled: () => cancelled, onProgress() {},
  }), Cancelled);
  assert.equal(native.bitmaps.length, 3);
  assert.ok(native.bitmaps.every((bitmap) => bitmap.closed));
  assert.ok(native.canvases.every((canvas) => canvas.width === 0));
});

test('a finished stack defers the reference decode until comparison is requested', async (t) => {
  const native = nativeSurfaces(t);
  const reference = file();
  const result = await runStack({ files: [reference, file()], mode: 'mean', align: 'none' }, hooks());
  assert.equal(native.bitmaps.length, 4, 'two surveys and two stacking decodes only');
  assert.deepEqual(result.comparison.output, { width: 32, height: 64 });
  assert.deepEqual(result.comparison.crop, { x: 0, y: 0, width: 32, height: 64 });
  assert.deepEqual(result.comparison.decoded, { width: 32, height: 64 });
  assert.ok(native.writes.every((args) => args.length === 7), 'the crop uses the existing RGBA buffer');
  assert.ok(native.bitmaps.every((bitmap) => bitmap.closed));
  assert.ok(native.canvases.every((canvas) => canvas.width === 0));
  const shown = await compareReference({ ...result.comparison, file: reference }, hooks());
  assert.equal(native.bitmaps.length, 5);
  assert.equal(shown.blob.type, 'image/png');
  assert.deepEqual([shown.width, shown.height], [result.width, result.height]);
  assert.ok(native.bitmaps.every((bitmap) => bitmap.closed));
  assert.ok(native.canvases.every((canvas) => canvas.width === 0));
});

test('a failed reference encoding releases its bitmap and canvas', async (t) => {
  const native = nativeSurfaces(t, { failEncode: true });
  await assert.rejects(compareReference({
    file: file(), output: { width: 32, height: 64 },
    crop: { x: 0, y: 0, width: 32, height: 64 },
    spot: { x: 0, y: 0, width: 32, height: 64 },
    move: { dx: 0, dy: 0, angle: 0, scale: 1 },
    decoded: { width: 32, height: 64 },
  }, hooks()), /encode failed/);
  assert.ok(native.bitmaps.every((bitmap) => bitmap.closed));
  assert.ok(native.canvases.every((canvas) => canvas.width === 0));
});
