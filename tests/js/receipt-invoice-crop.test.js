import test from 'node:test';
import assert from 'node:assert/strict';
import { findReceiptCrop, preserveColoredReceiptEnds } from '../../tools/receipt-invoice-extractor/src/receipt-crop.js';

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

function fillColor(image, x, y, width, height, color) {
  for (let row = y; row < y + height; row += 1) {
    for (let col = x; col < x + width; col += 1) {
      image.data.set([...color, 255], (row * image.width + col) * 4);
    }
  }
}

function cyanReceipt() {
  const image = picture(102, 480);
  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      image.data.set([128 + x % 7, 98 + y % 9, 67 + (x + y) % 11, 255],
        (y * image.width + x) * 4);
    }
  }
  fillColor(image, 8, 0, 86, image.height, [176, 224, 241]);
  printing(image, 8, 94);
  fill(image, 24, 7, 52, 2, 45);
  fill(image, 22, 23, 57, 2, 45);
  for (let x = 28; x < 80; x += 4) fill(image, x, 44, 2, 12, 15);
  return image;
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

test('a barcode crop keeps a cyan receipt header and final line while retaining the side-background crop', () => {
  const image = cyanReceipt();
  // The strong interior barcode sits below the store heading; accepting it as
  // the paper boundary would discard the heading despite continuous paper.
  const crop = { x: 4 / 102, y: 40 / 480, width: 95 / 102, height: 405 / 480 };
  const retained = preserveColoredReceiptEnds(image, crop);
  assert.equal(retained.y, 0);
  assert.equal(retained.height, 1);
  assert.equal(retained.x, crop.x);
  assert.equal(retained.width, crop.width);
  assert.ok(retained.x > 0 && retained.x + retained.width < 1);
  assert.equal(crop.y, 40 / 480);
});

test('the same colored-paper containment follows a rotated receipt', () => {
  const image = turn(cyanReceipt());
  const crop = { x: 40 / 480, y: 3 / 102, width: 405 / 480, height: 95 / 102 };
  const retained = preserveColoredReceiptEnds(image, crop);
  assert.equal(retained.x, 0);
  assert.equal(retained.width, 1);
  assert.equal(retained.y, crop.y);
  assert.equal(retained.height, crop.height);
});

test('contrasting wood beyond a real colored-paper boundary does not extend the crop', () => {
  const image = picture(102, 480);
  fillColor(image, 0, 0, image.width, image.height, [128, 98, 67]);
  fillColor(image, 8, 70, 86, 360, [176, 224, 241]);
  const crop = { x: 4 / 102, y: 62 / 480, width: 95 / 102, height: 376 / 480 };
  assert.deepEqual(preserveColoredReceiptEnds(image, crop), crop);
});

test('neutral paper keeps the established document crop unchanged', () => {
  const image = picture();
  fill(image, 60, 0, 120, image.height, 175);
  printing(image, 60, 180);
  const crop = { x: 0.2, y: 0.12, width: 0.6, height: 0.85 };
  assert.deepEqual(preserveColoredReceiptEnds(image, crop), crop);
});
