/**
 * A crop applies to the upright preview, including after a quarter turn. These
 * checks protect the selected area, and keep encoding failure or an oversized
 * source from quietly falling back to emailing the original photograph.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FULL_CROP, normalizedCrop, rotateCrop, imageDimensions, attachmentDimensions, ocrDimensions,
  cropFromQuad, attachmentName, readImageCanvas, prepareImage,
} from '../../tools/receipt-invoice-extractor/src/attachments.js';

function nearRect(actual, expected) {
  for (const key of ['x', 'y', 'width', 'height']) {
    assert.ok(Math.abs(actual[key] - expected[key]) < 1e-9, `${key}: ${actual[key]} instead of ${expected[key]}`);
  }
}

test('attachment crops reject empty, malformed and out-of-frame selections', () => {
  for (const crop of [
    { x: 0, y: 0, width: 0, height: 1 },
    { x: 0, y: 0, width: 1, height: -0.1 },
    { x: -0.1, y: 0, width: 0.5, height: 0.5 },
    { x: 0.6, y: 0, width: 0.5, height: 0.5 },
    { x: 0, y: 1, width: 0.5, height: 0.1 },
    { x: 0, y: NaN, width: 0.5, height: 0.5 },
    { x: 0, y: 0, width: '1', height: 1 },
  ]) assert.throws(() => normalizedCrop(crop), /invalidCrop/);
  const rect = normalizedCrop({ x: 0.2, y: 0.4, width: 0.8 + 1e-12, height: 0.6 });
  assert.ok(rect.x + rect.width <= 1);
  assert.ok(rect.y + rect.height <= 1);
});

test('turning a photo keeps the same selected area instead of resetting the crop', () => {
  const crop = { x: 0.1, y: 0.2, width: 0.3, height: 0.6 };
  nearRect(rotateCrop(crop), { x: 0.2, y: 0.1, width: 0.6, height: 0.3 });
  nearRect(rotateCrop(rotateCrop(crop), -90), crop);
  let turned = crop;
  for (let index = 0; index < 4; index += 1) turned = rotateCrop(turned);
  nearRect(turned, crop);
  nearRect(rotateCrop(FULL_CROP), FULL_CROP);
  assert.throws(() => rotateCrop(crop, 45), /invalidRotation/);
});

test('attachment size follows the selected document, preserves its shape and never enlarges', () => {
  assert.deepEqual(imageDimensions(4000, 3000, 90), { width: 3000, height: 4000 });
  assert.deepEqual(attachmentDimensions(3000, 4000), { width: 1200, height: 1600 });
  assert.deepEqual(attachmentDimensions(4000, 3000, { x: 0.1, y: 0.2, width: 0.2, height: 0.2 }), { width: 800, height: 600 });
  assert.deepEqual(attachmentDimensions(101, 67), { width: 101, height: 67 });
  assert.throws(() => attachmentDimensions(100, 100, { x: 0, y: 0, width: 0.001, height: 1 }), /invalidCrop/);
  assert.throws(() => imageDimensions(10_000, 10_000), /imageSize/);
  assert.throws(() => attachmentDimensions(100, 100, FULL_CROP, 10_000), /imageSize/);
});

test('a small receipt gets larger OCR lettering and a border without enlarging its email attachment', () => {
  const receiptCrop = { x: 0.25, y: 0, width: 0.5, height: 1 };
  assert.deepEqual(ocrDimensions(388, 516, receiptCrop), { width: 614, height: 1580, border: 16 });
  assert.deepEqual(attachmentDimensions(388, 516, receiptCrop), { width: 194, height: 516 });
  assert.deepEqual(ocrDimensions(3000, 4000), { width: 1808, height: 2400, border: 16 });
  assert.deepEqual(ocrDimensions(1, 1, FULL_CROP, 1), { width: 1, height: 1, border: 0 });
  for (const edge of [0, 2401, 1.5, NaN, '2400']) {
    assert.throws(() => ocrDimensions(388, 516, FULL_CROP, edge), /imageSize/);
  }
  assert.throws(() => ocrDimensions(10_000, 10_000), /imageSize/);
  assert.throws(() => ocrDimensions(388, 516, { x: 0, y: 0, width: 0.001, height: 1 }), /invalidCrop/);
});

test('the automatic rectangle keeps every page corner and a margin without crossing the image edge', () => {
  const quad = [{ x: 30, y: 10 }, { x: 160, y: 20 }, { x: 170, y: 280 }, { x: 20, y: 290 }];
  const rect = cropFromQuad(quad, 200, 300);
  for (const point of quad) {
    assert.ok(point.x / 200 >= rect.x && point.x / 200 <= rect.x + rect.width);
    assert.ok(point.y / 300 >= rect.y && point.y / 300 <= rect.y + rect.height);
  }
  assert.ok(rect.x < 0.1 && rect.y < 10 / 300);
  nearRect(cropFromQuad([{ x: 0, y: 0 }, { x: 200, y: 0 }, { x: 200, y: 300 }, { x: 0, y: 300 }], 200, 300), FULL_CROP);
  assert.throws(() => cropFromQuad([], 200, 300), /invalidCrop/);
});

test('attachment names remove paths and control characters while keeping the document name recognizable', () => {
  assert.equal(attachmentName('Shop receipt.PNG'), 'Shop receipt-cropped.jpg');
  assert.equal(attachmentName('folder/invoice\r\nB.jpg'), 'folder-invoice--B-cropped.jpg');
  assert.equal(attachmentName(''), 'document-cropped.jpg');
  assert.ok(attachmentName('x'.repeat(500) + '.jpg').length <= 92);
});

/** A browser stand-in records resource lifetime and asks the real Blob for bytes. */
async function withEncoder({ width = 2000, height = 1000, size, type = 'image/jpeg' }, run) {
  const saved = new Map(['document', 'createImageBitmap'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const canvases = [];
  const attempts = [];
  let closed = false;
  let decodeOptions;
  const bitmap = { width, height, close() { closed = true; } };
  const document = {
    createElement(tag) {
      assert.equal(tag, 'canvas');
      const calls = [];
      const context = Object.fromEntries(['fillRect', 'beginPath', 'rect', 'clip', 'scale', 'translate', 'rotate', 'drawImage'].map(key => [key, (...args) => calls.push([key, ...args])]));
      const canvas = {
        width: 0, height: 0, calls, context,
        getContext: () => context,
        toBlob(callback, mime, quality) {
          assert.equal(mime, 'image/jpeg');
          const attempt = { width: this.width, height: this.height, quality };
          attempts.push(attempt);
          callback(size === null ? null : new Blob([new Uint8Array(typeof size === 'function' ? size(attempt) : size)], { type }));
        },
      };
      canvases.push(canvas);
      return canvas;
    },
  };
  Object.defineProperty(globalThis, 'document', { value: document, writable: true, configurable: true });
  Object.defineProperty(globalThis, 'createImageBitmap', {
    value: async (file, options) => { decodeOptions = options; return bitmap; }, writable: true, configurable: true,
  });
  try { await run({ canvases, attempts, closed: () => closed, decodeOptions: () => decodeOptions }); }
  finally {
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
}

test('OCR uses only the selected pixels and keeps surrounding image pixels out of its white border', async () => {
  await withEncoder({ width: 388, height: 516, size: 100 }, async ({ canvases, closed }) => {
    const canvas = await readImageCanvas(new File(['photo'], 'receipt.jpg'), {
      crop: { x: 0.25, y: 0, width: 0.5, height: 1 },
    });
    assert.equal(canvas, canvases[0]);
    assert.equal(canvas.width, 614);
    assert.equal(canvas.height, 1580);
    assert.equal(canvas.context.fillStyle, '#fff');
    assert.ok(canvas.calls.findIndex(([key]) => key === 'clip') < canvas.calls.findIndex(([key]) => key === 'drawImage'));
    assert.ok(canvas.calls.some(([key, x, y, width, height]) => key === 'rect' && x === 16 && y === 16 && width === 582 && height === 1548));
    assert.ok(canvas.calls.some(([key, x, y]) => key === 'translate' && x === -97 && y === 0));
    assert.equal(closed(), true);
  });
});

test('encoding uses the upright crop, writes a fresh JPEG, and releases the decoded source', async () => {
  await withEncoder({ size: 500 }, async ({ canvases, attempts, closed, decodeOptions }) => {
    const file = new File([new Uint8Array(9000)], 'invoice.png', { type: 'image/png' });
    const result = await prepareImage(file, { rotation: 90, crop: { x: 0.1, y: 0.2, width: 0.5, height: 0.4 }, targetBytes: 1000 });
    assert.equal(result.file.type, 'image/jpeg');
    assert.equal(result.file.name, 'invoice-cropped.jpg');
    assert.equal(result.file.size, 500);
    assert.equal(result.originalSize, 9000);
    assert.deepEqual({ width: result.width, height: result.height }, { width: 500, height: 800 });
    assert.deepEqual(attempts, [{ width: 500, height: 800, quality: 0.84 }]);
    assert.equal(result.targetMet, true);
    assert.equal(canvases[0].context.fillStyle, '#fff');
    assert.ok(canvases[0].calls.some(([key, x, y]) => key === 'translate' && x === -100 && y === -400));
    assert.deepEqual(decodeOptions(), { imageOrientation: 'from-image' });
    assert.ok(canvases.every(canvas => canvas.width === 0 && canvas.height === 0));
    assert.equal(closed(), true);
  });
});

test('compression retries stop at a fixed readability floor and report an unmet byte target', async () => {
  await withEncoder({ size: ({ width, quality }) => Math.round(width * quality * 100) }, async ({ attempts, closed }) => {
    const result = await prepareImage(new File(['a'], 'receipt.jpg'), { targetBytes: 1 });
    assert.equal(attempts.length, 9);
    assert.ok(attempts.every(attempt => attempt.quality >= 0.6));
    assert.equal(Math.max(result.width, result.height), 1024);
    assert.equal(result.targetMet, false);
    assert.equal(result.size, Math.min(...attempts.map(attempt => Math.round(attempt.width * attempt.quality * 100))));
    assert.equal(closed(), true);
  });
});

test('JPEG failures never return the original or a file mislabeled as JPEG', async () => {
  for (const options of [{ size: null }, { size: 100, type: 'image/png' }]) {
    await withEncoder(options, async ({ canvases, closed }) => {
      await assert.rejects(prepareImage(new File(['original'], 'receipt.jpg')), /imageEncodeFailed/);
      assert.equal(closed(), true);
      assert.ok(canvases.every(canvas => canvas.width === 0 && canvas.height === 0));
    });
  }
});

test('an oversized decoded image is closed before any output canvas is allocated', async () => {
  await withEncoder({ width: 10_000, height: 10_000, size: 100 }, async ({ canvases, closed }) => {
    await assert.rejects(prepareImage(new File(['large'], 'receipt.jpg')), /imageSize/);
    assert.equal(canvases.length, 0);
    assert.equal(closed(), true);
  });
});
