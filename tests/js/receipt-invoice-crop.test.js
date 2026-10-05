import test from 'node:test';
import assert from 'node:assert/strict';
import { findReceiptCrop } from '../../tools/receipt-invoice-extractor/src/receipt-crop.js';

function picture(width = 240, height = 360, value = 165) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < data.length; i += 4) data.set([value, value, value, 255], i);
  return { width, height, data };
}

function fill(image, x, y, width, height, value) {
  for (let row = y; row < y + height; row += 1) {
    for (let col = x; col < x + width; col += 1) {
      image.data.set([value, value, value, 255], (row * image.width + col) * 4);
    }
  }
}

function printing(image, left, right) {
  for (let y = 14; y < image.height - 90; y += 22) {
    fill(image, left + 10, y, right - left - 20, 3, 50);
  }
  for (let x = left + 10; x < right - 10; x += 5) {
    fill(image, x, image.height - 75, 2, 50, 15);
  }
  // The last line is deliberately near the frame: cropping to ink would lose it.
  fill(image, left + 8, image.height - 7, right - left - 16, 2, 60);
}

function turn(image) {
  const output = picture(image.height, image.width);
  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const pixel = image.data.slice((y * image.width + x) * 4, (y * image.width + x + 1) * 4);
      output.data.set(pixel, ((image.width - x - 1) * output.width + y) * 4);
    }
  }
  return output;
}

test('faint receipt sides remove background while retaining the barcode and final date line', () => {
  const image = picture();
  fill(image, 60, 0, 120, image.height, 175);
  printing(image, 60, 180);
  const result = findReceiptCrop(image);
  assert.equal(result.found, true);
  assert.ok(result.crop.x < 60 / image.width && result.crop.x > 0.15);
  assert.ok(result.crop.x + result.crop.width > 180 / image.width);
  assert.ok(result.crop.width < 0.65);
  assert.equal(result.crop.y, 0);
  assert.equal(result.crop.height, 1);
});

test('a sideways receipt keeps the same complete document and removes only the side background', () => {
  const source = picture();
  fill(source, 60, 0, 120, source.height, 175);
  printing(source, 60, 180);
  const image = turn(source);
  const result = findReceiptCrop(image);
  assert.equal(result.found, true);
  assert.equal(result.crop.x, 0);
  assert.equal(result.crop.width, 1);
  assert.ok(result.crop.y < 0.25 && result.crop.y + result.crop.height > 0.75);
});

test('an isolated logo or barcode cannot substitute for two full receipt edges', () => {
  const image = picture();
  fill(image, 60, 80, 120, 210, 175);
  printing(image, 60, 180);
  assert.equal(findReceiptCrop(image).found, false);
});

test('flat pictures, one-sided lighting and blank reflections leave the full image available', () => {
  const flat = picture();
  const step = picture();
  fill(step, 60, 0, 180, step.height, 175);
  printing(step, 60, 180);
  const blank = picture();
  fill(blank, 60, 0, 120, blank.height, 175);
  for (const image of [flat, step, blank, { width: 1, height: 1, data: new Uint8ClampedArray(4) }]) {
    assert.deepEqual(findReceiptCrop(image), {
      found: false, crop: { x: 0, y: 0, width: 1, height: 1 }, score: 0,
    });
  }
});

test('two separate printed strips remain uncropped instead of silently choosing one document', () => {
  const image = picture(300, 440);
  fill(image, 25, 0, 80, image.height, 175);
  fill(image, 195, 0, 80, image.height, 175);
  printing(image, 25, 105);
  printing(image, 195, 275);
  assert.equal(findReceiptCrop(image).found, false);
});
