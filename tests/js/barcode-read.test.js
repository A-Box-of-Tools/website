/**
 * tools/qr-barcode-reader/src/linear.js - the striped barcodes, read back.
 *
 * Same arrangement as qr-read.test.js: every symbol here is drawn by the
 * GENERATOR NEXT DOOR and read by this tool, so the two tables of patterns have
 * to agree with each other and a transposed row in either one fails the round
 * trip rather than passing quietly in both.
 *
 * The half of the file that is not a round trip is about refusing. A linear
 * barcode has no error correction, so the only thing standing between a
 * photograph of gravel and a confident wrong number is that a reading has to
 * come with a quiet zone in front of it and either a strong checksum or a
 * second line that agrees. Those are tested directly, because they are the
 * part that has no visible symptom when it stops working.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { makeBarcode } from '../../tools/qr-barcode/src/barcode.js';
import { gs1Check, readLinear } from '../../tools/qr-barcode-reader/src/linear.js';
import { scan } from '../../tools/qr-barcode-reader/src/scan.js';

import { inverted, noisy, renderBars, rotate } from './code-pictures.js';

/** The picture as one byte a pixel, which is what `readLinear` reads. */
function bitsOf(image) {
  const bits = new Uint8Array(image.width * image.height);
  for (let i = 0; i < bits.length; i += 1) bits[i] = image.data[i * 4] < 128 ? 1 : 0;
  return { bits, width: image.width, height: image.height };
}

const draw = (symbology, text, scale = 3, tall = 60) => (
  renderBars(makeBarcode(text, { symbology }).modules, scale, tall));

/* --------------------------------------------------------------- the round trip */

test('every symbology the generator writes reads back', () => {
  // What goes in, and what should come out - which is not always the same
  // string, because the retail codes are given eleven or twelve digits and
  // compute the last one.
  const cases = [
    ['ean13', '590123412345', '5901234123457'],
    ['ean13', '4006381333931', '4006381333931'],
    ['upca', '03600029145', '036000291452'],
    ['ean8', '9638507', '96385074'],
    ['itf14', '1540014128876', '15400141288763'],
    ['itf', '1234567890', '1234567890'],
    ['itf', '001234567890', '001234567890'],
    ['code39', 'ABOX TOOLS', 'ABOX TOOLS'],
    ['code39', 'AB-12.34$/+%', 'AB-12.34$/+%'],
    ['code128', 'ABOX-TOOLS-128', 'ABOX-TOOLS-128'],
    ['code128', '1234567890123456', '1234567890123456'],
    ['code128', 'Hello, World! 42', 'Hello, World! 42'],
    ['code128', 'abc123DEF', 'abc123DEF'],
    ['code128', 'a', 'a'],
  ];

  for (const [symbology, input, expected] of cases) {
    for (const scale of [1, 2, 3, 5]) {
      const image = bitsOf(draw(symbology, input, scale));
      const found = readLinear(image.bits, image.width, image.height);
      assert.ok(found, `${symbology} ${input} at ${scale}px a module`);
      assert.equal(found.text, expected, `${symbology} ${input} at ${scale}px`);
      assert.equal(found.format, symbology, `${symbology} ${input} named itself`);
    }
  }
});

test('the check digit is the generator\'s, worked out independently', () => {
  // Both tools compute this and neither imports it from the other, so the
  // published examples are what keeps them honest.
  assert.equal(gs1Check('590123412345'), 7);
  assert.equal(gs1Check('400638133393'), 1);
  assert.equal(gs1Check('03600029145'), 2);
  assert.equal(gs1Check('9638507'), 4);
});

test('a code turned sideways or upside down still reads', () => {
  const flat = draw('code128', 'ABOX-TOOLS-128', 4);

  for (const degrees of [0, 90, 180, 270]) {
    const found = scan(rotate(flat, degrees));
    assert.equal(found?.text, 'ABOX-TOOLS-128', `turned ${degrees} degrees`);
  }
});

test('a code printed light on dark still reads', () => {
  const found = scan(inverted(draw('ean13', '4006381333931', 4)));
  assert.equal(found?.text, '4006381333931');
  assert.equal(found.how, 'inverted');
});

test('grain does not stop it', () => {
  const found = scan(noisy(draw('code128', 'ABOX-TOOLS-128', 5), 90));
  assert.equal(found?.text, 'ABOX-TOOLS-128');
});

test('what it reports about a barcode', () => {
  const found = scan(draw('itf14', '1540014128876', 3));
  assert.equal(found.kind, 'linear');
  assert.equal(found.symbology, 'itf14');
  assert.equal(found.name, 'ITF-14');
  assert.equal(found.text, '15400141288763');
  assert.ok(found.lines >= 2, 'more than one scan line agreed');
  assert.equal(found.payload.kind, 'number');
});

/* ------------------------------------------------------------- the refusals */

test('a picture of nothing produces no reading', () => {
  const white = { data: new Uint8ClampedArray(600 * 300 * 4).fill(255), width: 600, height: 300 };
  assert.equal(scan(white), null, 'blank paper');

  // Fine grain offers runs in every ratio a decoder could want. What it does
  // not offer is a clean white gap in front of one, which is the whole reason
  // the quiet zone is checked.
  for (const seed of [1, 7, 99, 4242, 31337]) {
    assert.equal(scan(noisy(white, 255, seed)), null, `static, seed ${seed}`);
  }
});

test('a barcode with its quiet zone cut off is refused', () => {
  // Not a defect: it is the same rule that stops noise being read, and a code
  // this tightly cropped is one a supermarket scanner would also refuse.
  const whole = draw('ean13', '4006381333931', 3);
  const bars = bitsOf(whole);

  const cropWidth = whole.width - 3 * 20;
  const cropped = new Uint8Array(cropWidth * whole.height);
  for (let y = 0; y < whole.height; y += 1) {
    for (let x = 0; x < cropWidth; x += 1) {
      cropped[y * cropWidth + x] = bars.bits[y * whole.width + x + 3 * 10];
    }
  }

  assert.ok(readLinear(bars.bits, whole.width, whole.height), 'the whole symbol reads');
  assert.equal(readLinear(cropped, cropWidth, whole.height), null, 'trimmed to the bars');
});

test('one line agreeing is not enough for a format without a real checksum', () => {
  // A single row of the picture, which is all a one-pixel-tall image has.
  // Code 39 carries no check character, so this must not be believed - and the
  // same symbol two rows tall must be.
  const one = bitsOf(draw('code39', 'ABOX TOOLS', 3, 1));
  assert.equal(readLinear(one.bits, one.width, one.height), null);

  const two = bitsOf(draw('code39', 'ABOX TOOLS', 3, 2));
  assert.equal(readLinear(two.bits, two.width, two.height, 2)?.text, 'ABOX TOOLS');
});

test('a QR code is not read as a barcode', () => {
  // The rows of a QR symbol are runs in every ratio there is, sitting inside a
  // four-module quiet zone - which is the one arrangement most likely to fool
  // this half of the reader.
  const image = bitsOf(draw('code128', 'X', 3));
  assert.ok(readLinear(image.bits, image.width, image.height), 'the control reads');

  // Built here rather than imported, so this test says what it is about: a
  // 21x21 grid of alternating and clustered modules with a margin round it.
  const size = 21;
  const scale = 6;
  const margin = 4 * scale;
  const side = size * scale + margin * 2;
  const bits = new Uint8Array(side * side);
  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      const ring = Math.max(Math.abs(row - 3), Math.abs(column - 3));
      const dark = (row < 7 && column < 7) ? ring !== 2 : ((row * 7 + column * 3) % 5) < 2;
      if (!dark) continue;
      for (let y = 0; y < scale; y += 1) {
        for (let x = 0; x < scale; x += 1) {
          bits[(margin + row * scale + y) * side + margin + column * scale + x] = 1;
        }
      }
    }
  }

  assert.equal(readLinear(bits, side, side), null);
});
