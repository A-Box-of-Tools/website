/**
 * Inversion is useful for a filled merchant logo, but would damage ordinary
 * receipt text. The header search must leave those pages and their pixels alone.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { findDarkHeader, normalizeReceiptImage, headerReadingDimensions } from '../../tools/receipt-invoice-extractor/src/ocr-image.js';

function picture(width = 400, height = 900) {
  return { width, height, data: new Uint8ClampedArray(width * height * 4).fill(255) };
}

function rectangle(image, x, y, width, height, grey, alpha = 255) {
  for (let row = y; row < y + height; row += 1) {
    for (let column = x; column < x + width; column += 1) {
      const offset = (row * image.width + column) * 4;
      image.data.set([grey, grey, grey, alpha], offset);
    }
  }
}

test('a filled dark merchant logo remains recognizable with white letter holes', () => {
  const image = picture();
  rectangle(image, 80, 40, 240, 110, 20);
  for (const x of [100, 135, 175, 215, 260]) rectangle(image, x, 65, 15, 50, 255);
  rectangle(image, 100, 180, 160, 30, 15);
  const original = image.data.slice();
  assert.deepEqual(findDarkHeader(image), { x: 80, y: 40, width: 240, height: 110 });
  assert.deepEqual(image.data, original);
});

test('receipt lettering, outlines, isolated noise and long photographic edges are not filled logos', () => {
  const image = picture();
  rectangle(image, 10, 10, 380, 3, 20);
  rectangle(image, 10, 120, 380, 3, 20);
  rectangle(image, 10, 10, 3, 113, 20);
  rectangle(image, 387, 10, 3, 113, 20);
  for (let x = 45; x < 350; x += 20) rectangle(image, x, 160, 8, 15, 10);
  for (let x = 30; x < 350; x += 30) rectangle(image, x, 240, 2, 2, 0);
  assert.equal(findDarkHeader(image), null);
});

test('giant dark backgrounds, lower-page art and transparent black regions are ignored', () => {
  const background = picture();
  rectangle(background, 0, 0, 400, 300, 10);
  assert.equal(findDarkHeader(background), null);
  const lower = picture();
  rectangle(lower, 80, 400, 240, 110, 10);
  assert.equal(findDarkHeader(lower), null);
  const transparent = picture();
  rectangle(transparent, 80, 40, 240, 110, 0, 0);
  assert.equal(findDarkHeader(transparent), null);
});

test('large inputs use a bounded sampled header rather than a full-size mask', () => {
  const width = 8000;
  const height = 8000;
  let reads = 0;
  const data = new Proxy({ length: width * height * 4 }, {
    get(target, key) {
      if (key === 'length') return target.length;
      reads += 1;
      const offset = Number(key);
      if (offset % 4 === 3) return 255;
      const pixel = Math.floor(offset / 4);
      const x = pixel % width;
      const y = Math.floor(pixel / width);
      return x >= 2000 && x < 5000 && y >= 400 && y < 1200 ? 20 : 255;
    },
    set() { assert.fail('Header detection must not modify the source pixels.'); },
  });
  assert.deepEqual(findDarkHeader({ width, height, data }), { x: 2000, y: 400, width: 3000, height: 800 });
  assert.ok(reads <= 400 * 400 * 4);
});

test('malformed or excessive image dimensions do not allocate a working image', () => {
  for (const image of [null, {}, { width: 0, height: 10, data: [] },
    { width: 2, height: 2, data: [255] }, { width: 1.5, height: 2, data: [] },
    { width: 10_000, height: 10_000, data: { length: 400_000_000 } }]) {
    assert.equal(findDarkHeader(image), null);
  }
});

test('local paper normalization strengthens faint print on lit and shadowed paper without editing the source', () => {
  const image = picture(256, 128);
  rectangle(image, 0, 0, 128, 128, 240);
  rectangle(image, 128, 0, 128, 128, 165);
  rectangle(image, 40, 40, 6, 24, 225);
  rectangle(image, 200, 40, 6, 24, 150);
  const original = image.data.slice();
  const normalized = normalizeReceiptImage(image);
  assert.equal(normalized.width, image.width);
  assert.equal(normalized.height, image.height);
  for (const [paperX, inkX] of [[36, 42], [196, 202]]) {
    const paperOffset = (50 * image.width + paperX) * 4;
    const inkOffset = (50 * image.width + inkX) * 4;
    assert.equal(normalized.data[paperOffset], 255);
    assert.equal(normalized.data[inkOffset], 210);
    assert.equal(normalized.data[inkOffset + 3], 255);
  }
  assert.deepEqual(image.data, original);
});

test('normalization flattens a gradual shadow while preserving faint letter contrast and dark artwork', () => {
  const image = picture(320, 128);
  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const grey = Math.round(160 + 90 * x / (image.width - 1));
      image.data.set([grey, grey, grey, 255], (y * image.width + x) * 4);
    }
  }
  for (const x of [90, 154, 218]) {
    for (let y = 42; y < 64; y += 1) {
      const offset = (y * image.width + x) * 4;
      image.data[offset] -= 18;
      image.data[offset + 1] -= 18;
      image.data[offset + 2] -= 18;
    }
  }
  rectangle(image, 10, 10, 48, 16, 10);
  const normalized = normalizeReceiptImage(image);
  for (const x of [90, 154, 218]) {
    const ink = normalized.data[(50 * image.width + x) * 4];
    const paper = normalized.data[(50 * image.width + x + 2) * 4];
    assert.ok(paper - ink >= 45);
  }
  assert.equal(normalized.data[(15 * image.width + 20) * 4], 0);
});

test('recovery pixels blend transparency onto white and reject dimensions outside the OCR budget', () => {
  const transparent = picture(32, 32);
  rectangle(transparent, 0, 0, 32, 32, 0, 0);
  assert.ok(normalizeReceiptImage(transparent).data.every(value => value === 255));
  for (const image of [null, {}, { width: 0, height: 1, data: [] },
    { width: 2, height: 2, data: [255] }, { width: 1.5, height: 2, data: [] },
    { width: 2401, height: 1, data: { length: 9604 } }]) {
    assert.equal(normalizeReceiptImage(image), null);
  }
});

test('closer header dimensions bound the top region and enlargement including its white border', () => {
  const typical = headerReadingDimensions(400, 2400);
  assert.equal(typical.sourceHeight, 528);
  assert.equal(typical.width, 1032);
  assert.equal(typical.height, 1352);
  assert.equal(typical.border, 16);
  for (const [width, height] of [[120, 2400], [2400, 2400], [387, 516], [1, 2400]]) {
    const dimensions = headerReadingDimensions(width, height);
    assert.ok(dimensions.width >= 1 && dimensions.width <= 2400);
    assert.ok(dimensions.height >= 1 && dimensions.height <= 2400);
    assert.ok(dimensions.sourceHeight <= height * 0.22 + 1);
  }
  for (const [width, height] of [[0, 400], [400, 0], [2401, 400], [1.5, 400], [NaN, 400]]) {
    assert.equal(headerReadingDimensions(width, height), null);
  }
});
