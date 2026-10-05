/**
 * Inversion is useful for a filled merchant logo, but would damage ordinary
 * receipt text. The header search must leave those pages and their pixels alone.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { findDarkHeader } from '../../tools/receipt-invoice-extractor/src/ocr-image.js';

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
