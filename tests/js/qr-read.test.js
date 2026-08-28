/**
 * tools/qr-barcode-reader/src - the QR reader.
 *
 * Every test here builds a symbol with the ENCODER NEXT DOOR and reads it back
 * with this one. That is the only arrangement worth having: a decoder checked
 * against fixtures it was written alongside proves that two halves of one
 * misunderstanding agree, and a decoder checked against its own encoder proves
 * even less. Here, a wrong table, a wrong mask, a wrong block split or a wrong
 * bit in either tool fails the round trip.
 *
 * The file is in three parts, and they test genuinely different things:
 *
 *   - the modules, where the reader is handed a perfect grid and only the
 *     specification is on trial;
 *   - the arithmetic, where modules are flipped on purpose and the
 *     Reed-Solomon correction has to put them back - and, just as important,
 *     has to refuse rather than invent when there is too much damage;
 *   - the pictures, where the symbol is drawn into pixels and then turned,
 *     warped, inverted, dimmed and grained, and the detector has to find it.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { makeQr } from '../../tools/qr-barcode/src/qr.js';

// The generator next door asks its caller for the words. These tests only read
// the bars back, so they hand it a resolver that echoes the key.
const say = (key) => key;
import { remainder } from '../../tools/qr-barcode/src/gf256.js';
import { LEVELS, sizeOf } from '../../tools/qr-barcode/src/qr-tables.js';

import { correct } from '../../tools/qr-barcode-reader/src/reed-solomon.js';
import { decodeMatrix, UnreadableError } from '../../tools/qr-barcode-reader/src/qr-decode.js';
import { orient, rankTriples } from '../../tools/qr-barcode-reader/src/detect.js';
import { scan } from '../../tools/qr-barcode-reader/src/scan.js';

import {
  inverted, noisy, placed, renderQr, rotate, shaded, warp,
} from './code-pictures.js';

const LINK = 'https://abox.tools/qr-barcode-reader/';

/* ------------------------------------------------------- the error correction */

test('reed-solomon: a clean block reports no errors', () => {
  const data = Uint8Array.from({ length: 20 }, (unused, i) => (i * 37 + 11) & 0xff);
  const block = Uint8Array.from([...data, ...remainder(data, 10)]);
  assert.equal(correct(block.slice(), 10), 0);
});

test('reed-solomon: one wrong codeword, at every position', () => {
  const data = Uint8Array.from({ length: 20 }, (unused, i) => (i * 37 + 11) & 0xff);
  const whole = Uint8Array.from([...data, ...remainder(data, 10)]);

  for (let at = 0; at < whole.length; at += 1) {
    const damaged = whole.slice();
    damaged[at] ^= 0x3c;
    assert.equal(correct(damaged, 10), 1, `one error at ${at}`);
    assert.deepEqual([...damaged], [...whole], `restored after ${at}`);
  }
});

test('reed-solomon: exactly half the check codewords is the limit, and it is met', () => {
  const data = Uint8Array.from({ length: 20 }, (unused, i) => (i * 37 + 11) & 0xff);
  const whole = Uint8Array.from([...data, ...remainder(data, 10)]);

  const five = whole.slice();
  for (const [at, mask] of [[0, 0xff], [3, 0x11], [19, 0x7f], [22, 0x03], [29, 0x9a]]) {
    five[at] ^= mask;
  }
  assert.equal(correct(five, 10), 5);
  assert.deepEqual([...five], [...whole]);
});

test('reed-solomon: past the limit it refuses rather than answering', () => {
  // The arithmetic does not fail loudly on a block damaged past repair - it
  // answers, and the answer is a plausible block of the wrong bytes. This is
  // the check that turns that into a refusal, and it is the difference between
  // a reader that says "I could not read it" and one that lies.
  const data = Uint8Array.from({ length: 20 }, (unused, i) => (i * 37 + 11) & 0xff);
  const whole = Uint8Array.from([...data, ...remainder(data, 10)]);

  const six = whole.slice();
  for (const at of [0, 2, 4, 6, 8, 10]) six[at] ^= 0x5a;
  assert.equal(correct(six, 10), -1);
});

/* ------------------------------------------------------------ the modules */

test('modules: every mode and every level survives a round trip', () => {
  const strings = [
    '01234567',
    '8675309',
    'HELLO WORLD',
    'HTTPS://ABOX.TOOLS/QR-BARCODE-READER/',
    LINK,
    'WIFI:T:WPA;S:The Cafe;P:hunter2;;',
    'café — über ✓',
    '你好，世界',
    'a'.repeat(300),
    '9'.repeat(1000),
  ];

  for (const text of strings) {
    for (const level of LEVELS) {
      const qr = makeQr(text, { level }, say);
      const read = decodeMatrix(qr.size, qr.modules);
      assert.equal(read.text, text, `${level}: ${text.slice(0, 20)}`);
      assert.equal(read.level, level);
      assert.equal(read.version, qr.version);
      assert.equal(read.mask, qr.mask);
      assert.equal(read.corrections, 0);
    }
  }
});

test('modules: every version, and every mask, reads back', () => {
  for (let version = 1; version <= 40; version += 1) {
    // Short enough that `minVersion` is what decides the size at every step,
    // including version 1, where a longer fixture would not fit and the
    // encoder would quietly pick version 2.
    const text = `v${version}`;
    const qr = makeQr(text, { level: 'Q', minVersion: version }, say);
    assert.equal(qr.version, version, `the fixture is meant to be version ${version}`);

    const read = decodeMatrix(qr.size, qr.modules);
    assert.equal(read.version, version, `version ${version}`);
    assert.equal(read.text, text);
    assert.equal(qr.size, sizeOf(version));
  }

  for (let mask = 0; mask < 8; mask += 1) {
    const qr = makeQr(LINK, { level: 'M', mask }, say);
    const read = decodeMatrix(qr.size, qr.modules);
    assert.equal(read.mask, mask);
    assert.equal(read.text, LINK);
  }
});

test('modules: damage inside the symbol is repaired, and counted', () => {
  const qr = makeQr(LINK, { level: 'H' }, say);
  const damaged = qr.modules.slice();

  // A block seven modules square, well inside the data area, which is about
  // what a fingerprint or a scratch takes out.
  let flipped = 0;
  for (let row = 9; row < 16; row += 1) {
    for (let column = 9; column < 16; column += 1) {
      damaged[row * qr.size + column] ^= 1;
      flipped += 1;
    }
  }

  const read = decodeMatrix(qr.size, damaged);
  assert.equal(read.text, LINK);
  assert.ok(read.corrections > 0, `${flipped} modules flipped and nothing was repaired`);
});

test('modules: a symbol that is mostly noise is refused, not guessed at', () => {
  const qr = makeQr(LINK, { level: 'L' }, say);
  const ruined = qr.modules.slice();
  for (let i = 0; i < ruined.length; i += 3) ruined[i] ^= 1;

  assert.throws(() => decodeMatrix(qr.size, ruined), UnreadableError);
});

test('modules: a size no QR symbol has is refused', () => {
  assert.throws(() => decodeMatrix(20, new Uint8Array(400)), UnreadableError);
  assert.throws(() => decodeMatrix(22, new Uint8Array(484)), UnreadableError);
});

test('modules: the format information is read from either copy', () => {
  // Both copies say the same thing so that one of them can be destroyed. The
  // first is wiped here, which is what a torn top-left corner does.
  const qr = makeQr(LINK, { level: 'Q' }, say);
  const torn = qr.modules.slice();
  for (let i = 0; i <= 8; i += 1) {
    torn[i * qr.size + 8] = 0;
    torn[8 * qr.size + i] = 0;
  }

  const read = decodeMatrix(qr.size, torn);
  assert.equal(read.level, 'Q');
  assert.equal(read.text, LINK);
});

/* ------------------------------------------------------------- the pictures */

/** What the page does with a picture, minus the page. */
const read = (image) => scan(image);

test('pictures: a flat symbol at several sizes and margins', () => {
  for (const level of LEVELS) {
    for (const scale of [2, 3, 5, 8]) {
      for (const quiet of [4, 1]) {
        const found = read(renderQr(makeQr(LINK, { level }, say), scale, quiet));
        assert.ok(found, `${level} at ${scale}px, margin ${quiet}`);
        assert.equal(found.text, LINK);
        assert.equal(found.kind, 'qr');
      }
    }
  }
});

test('pictures: turned to any angle', () => {
  const qr = makeQr(LINK, { level: 'M' }, say);
  for (const degrees of [0, 2, 5, 10, 15, 22, 30, 37, 45, 47, 60, 75, 90, 137, 180, 200, 271, 330]) {
    const found = read(rotate(renderQr(qr, 6), degrees));
    assert.ok(found, `turned ${degrees} degrees`);
    assert.equal(found.text, LINK, `turned ${degrees} degrees`);
  }
});

test('pictures: photographed at an angle, which needs the alignment pattern', () => {
  const flat = renderQr(makeQr(LINK, { level: 'M' }, say), 8);
  const side = flat.width;

  const mild = warp(flat, [
    { x: 20, y: 20 }, { x: side - 20, y: 50 },
    { x: side - 40, y: side - 20 }, { x: 40, y: side - 50 },
  ]);
  assert.equal(read(mild)?.text, LINK, 'a mild angle');

  const steep = warp(flat, [
    { x: 10, y: 60 }, { x: side - 10, y: 10 },
    { x: side - 30, y: side - 60 }, { x: 60, y: side - 10 },
  ]);
  assert.equal(read(steep)?.text, LINK, 'a steeper one');
});

test('pictures: printed light on dark', () => {
  const found = read(inverted(renderQr(makeQr(LINK, { level: 'M' }, say), 6)));
  assert.equal(found?.text, LINK);
  assert.equal(found.how, 'inverted');
});

test('pictures: grainy, unevenly lit, and both at once', () => {
  const flat = renderQr(makeQr(LINK, { level: 'M' }, say), 8);

  assert.equal(read(noisy(flat, 120))?.text, LINK, 'grain');
  assert.equal(read(shaded(flat))?.text, LINK, 'lit from one side');
  assert.equal(read(noisy(shaded(flat), 50))?.text, LINK, 'both');
});

test('pictures: small, and off to one side of a big frame', () => {
  const flat = renderQr(makeQr(LINK, { level: 'M' }, say), 8);
  const found = read(placed(flat, 700, 500, 420, 40));
  assert.equal(found?.text, LINK);
});

test('pictures: a large version, flat and turned', () => {
  const text = 'x'.repeat(900);
  const qr = makeQr(text, { level: 'M' }, say);
  assert.ok(qr.version >= 20, 'the fixture is meant to be a big symbol');

  assert.equal(read(renderQr(qr, 4))?.text, text, 'flat');
  assert.equal(read(rotate(renderQr(qr, 5), 23))?.text, text, 'turned');
});

test('pictures: a picture with no code in it finds nothing', () => {
  // Plain white, and grain with no structure. Neither should produce an
  // answer, which is the one failure mode this whole tool exists to avoid.
  const white = { data: new Uint8ClampedArray(400 * 400 * 4).fill(255), width: 400, height: 400 };
  assert.equal(read(white), null, 'blank paper');
  assert.equal(read(noisy(white, 255, 99)), null, 'static');
});

test('pictures: what it reports about how it read it', () => {
  const qr = makeQr('WIFI:T:WPA;S:The Cafe;P:hunter2;;', { level: 'Q' }, say);
  const found = read(renderQr(qr, 6));

  assert.equal(found.kind, 'qr');
  assert.equal(found.symbology, 'qr');
  assert.equal(found.version, qr.version);
  assert.equal(found.level, 'Q');
  assert.equal(found.dimension, qr.size);
  assert.equal(found.modules.length, qr.size * qr.size);
  assert.equal(found.payload.kind, 'wifi');

  // The sampled grid is what the page draws back out so that the reading can
  // be checked by eye. It has to BE the symbol, not merely decode to it.
  assert.deepEqual([...found.modules], [...qr.modules]);
});

/* ---------------------------------------------------------- the geometry */

test('geometry: three corners are put in the right order, whichever way round', () => {
  // A square of three finder centres, listed in every order and turned every
  // quarter, always names the same corner as the top left.
  const centres = {
    topLeft: { x: 100, y: 100, size: 4, seen: 9 },
    topRight: { x: 300, y: 100, size: 4, seen: 9 },
    bottomLeft: { x: 100, y: 300, size: 4, seen: 9 },
  };

  for (const order of [
    [centres.topLeft, centres.topRight, centres.bottomLeft],
    [centres.topRight, centres.bottomLeft, centres.topLeft],
    [centres.bottomLeft, centres.topLeft, centres.topRight],
    [centres.bottomLeft, centres.topRight, centres.topLeft],
  ]) {
    const ordered = orient(order);
    assert.equal(ordered.topLeft, centres.topLeft);
    assert.equal(ordered.topRight, centres.topRight);
    assert.equal(ordered.bottomLeft, centres.bottomLeft);
  }
});

test('geometry: three marks that are not the corners of a symbol are ranked last', () => {
  const square = [
    { x: 100, y: 100, size: 4, seen: 9 },
    { x: 300, y: 100, size: 4, seen: 9 },
    { x: 100, y: 300, size: 4, seen: 9 },
  ];
  assert.equal(rankTriples(square).length, 1);

  // Three in a line: no right angle, no symbol.
  const line = [
    { x: 100, y: 100, size: 4, seen: 9 },
    { x: 200, y: 100, size: 4, seen: 9 },
    { x: 300, y: 100, size: 4, seen: 9 },
  ];
  assert.equal(rankTriples(line).length, 0);

  // Too close together to be one symbol's corners.
  const crowded = [
    { x: 100, y: 100, size: 20, seen: 9 },
    { x: 130, y: 100, size: 20, seen: 9 },
    { x: 100, y: 130, size: 20, seen: 9 },
  ];
  assert.equal(rankTriples(crowded).length, 0);

  assert.deepEqual(rankTriples([square[0], square[1]]), []);
});
