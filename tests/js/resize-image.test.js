/**
 * tools/resize-image/src/{geometry,files,codecs}.js.
 *
 * `geometry.js` is the whole of what this tool decides. Everything else is a
 * canvas call: one `drawImage` with the source rectangle and the destination
 * rectangle this file works out, and one `toBlob`. So a mistake here does not
 * throw and does not look like a bug - it silently hands somebody a picture
 * cropped off centre, or stretched by two percent, or 1919 pixels wide when
 * they asked for 1920 and were going to check.
 *
 * The cases that get the most attention are the ones with a decision in them:
 * what a blank height means, what happens when the two numbers given disagree
 * with the shape of the picture, and whether "never enlarge" is honoured by
 * every fit that could enlarge.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  FITS, RATIOS, fromFractions, isUntouched, parseRatio, plan, ratioCrop,
  toFractions, wholeOf,
} from '../../tools/resize-image/src/geometry.js';
import {
  bytes, change, countOf, describePlan, dimensions, outName, scaleText,
} from '../../tools/resize-image/src/files.js';
import {
  FORMATS, JPEG, PNG, READABLE, WEBP, keepFormat,
} from '../../tools/resize-image/src/codecs.js';

/** A 4000 x 3000 photograph, which is the shape most of these are about. */
const PHOTO = { width: 4000, height: 3000 };
const whole = (size) => wholeOf(size);

/* ================================================================= ratios */

test('parseRatio: the three ways people write a shape', () => {
  assert.equal(parseRatio('16:9'), 16 / 9);
  assert.equal(parseRatio('16/9'), 16 / 9);
  assert.equal(parseRatio('16 x 9'), 16 / 9);
  assert.equal(parseRatio('4:5'), 0.8);
});

test('parseRatio: a bare number is already a ratio', () => {
  assert.equal(parseRatio('1.5'), 1.5);
  assert.equal(parseRatio(1.5), 1.5);
});

test('parseRatio: nonsense and impossible shapes are refused', () => {
  for (const value of ['', '   ', 'free', '16:', ':9', '0:9', '16:0', '-2:1', null, undefined, NaN]) {
    assert.equal(parseRatio(value), null, `${String(value)} should not parse`);
  }
});

test('RATIOS: every shape on the buttons parses', () => {
  for (const key of RATIOS) assert.ok(parseRatio(key) > 0, key);
});

/* ============================================================== ratioCrop */

test('ratioCrop: a square out of a landscape photograph is centred', () => {
  const square = ratioCrop(whole(PHOTO), 1);
  assert.deepEqual(square, { x: 500, y: 0, width: 3000, height: 3000 });
});

test('ratioCrop: a wide shape out of a landscape photograph loses the top and bottom', () => {
  const wide = ratioCrop(whole(PHOTO), 16 / 9);
  assert.equal(wide.width, 4000);
  assert.equal(wide.height, 2250);
  assert.equal(wide.x, 0);
  assert.equal(wide.y, (3000 - 2250) / 2);
});

test('ratioCrop: never reaches outside the rectangle it was given', () => {
  for (const aspect of RATIOS.map(parseRatio)) {
    const rect = ratioCrop({ x: 10, y: 20, width: 101, height: 67 }, aspect);
    assert.ok(rect.width <= 101 && rect.height <= 67, `${aspect} overflowed`);
    assert.ok(rect.x >= 10 && rect.y >= 20, `${aspect} moved out of the rectangle`);
    assert.ok(rect.x + rect.width <= 111, `${aspect} ran off the right`);
    assert.ok(rect.y + rect.height <= 87, `${aspect} ran off the bottom`);
  }
});

test('ratioCrop: the shape it was already is left alone', () => {
  const rect = { x: 0, y: 0, width: 1600, height: 900 };
  assert.deepEqual(ratioCrop(rect, 16 / 9), rect);
});

/* =============================================================== fractions */

test('fractions: a box survives the round trip through the picture it was drawn on', () => {
  const box = { x: 400, y: 300, width: 2000, height: 1500 };
  assert.deepEqual(fromFractions(toFractions(box, PHOTO), PHOTO), box);
});

test('fractions: the same relative area on a smaller picture', () => {
  // Half the width, half the height: every number halves and the framing holds.
  const box = { x: 400, y: 300, width: 2000, height: 1500 };
  const moved = fromFractions(toFractions(box, PHOTO), { width: 2000, height: 1500 });
  assert.deepEqual(moved, { x: 200, y: 150, width: 1000, height: 750 });
});

test('fractions: a box is clamped inside whatever it lands on', () => {
  const wild = { x: 0.9, y: 0.9, width: 0.5, height: 0.5 };
  const rect = fromFractions(wild, { width: 100, height: 100 });
  assert.ok(rect.x + rect.width <= 100);
  assert.ok(rect.y + rect.height <= 100);
});

test('fractions: nothing ever rounds down to a zero-sized crop', () => {
  const rect = fromFractions({ x: 0, y: 0, width: 0.0001, height: 0.0001 }, { width: 10, height: 10 });
  assert.ok(rect.width >= 1 && rect.height >= 1);
});

/* ==================================================================== plan */

test('plan: no resize keeps the crop exactly', () => {
  const crop = { x: 100, y: 50, width: 800, height: 600 };
  const result = plan(crop, { mode: 'none' });
  assert.deepEqual(result.canvas, { width: 800, height: 600 });
  assert.deepEqual(result.source, crop);
  assert.deepEqual(result.draw, { x: 0, y: 0, width: 800, height: 600 });
  assert.equal(result.padded, false);
});

test('plan: a percentage scales both sides', () => {
  const result = plan(whole(PHOTO), { mode: 'percent', percent: 25 });
  assert.deepEqual(result.canvas, { width: 1000, height: 750 });
  assert.equal(result.scale, 0.25);
});

test('plan: a percentage above 100 enlarges, because that was asked for', () => {
  // "Never enlarge" is not offered in percent mode, and is ignored here even
  // if it arrives set: 200% means 200%.
  const result = plan(whole(PHOTO), { mode: 'percent', percent: 200, noEnlarge: true });
  assert.deepEqual(result.canvas, { width: 8000, height: 6000 });
});

test('plan: the longest side is whichever one is longer', () => {
  const landscape = plan(whole(PHOTO), { mode: 'longest', longest: 1000 });
  assert.deepEqual(landscape.canvas, { width: 1000, height: 750 });

  const portrait = plan(whole({ width: 3000, height: 4000 }), { mode: 'longest', longest: 1000 });
  assert.deepEqual(portrait.canvas, { width: 750, height: 1000 });
});

test('plan: the longest side will not enlarge unless allowed to', () => {
  const small = whole({ width: 400, height: 300 });
  assert.deepEqual(plan(small, { mode: 'longest', longest: 1920, noEnlarge: true }).canvas,
    { width: 400, height: 300 });
  assert.deepEqual(plan(small, { mode: 'longest', longest: 1920, noEnlarge: false }).canvas,
    { width: 1920, height: 1440 });
});

/* --------------------------------------------------------- pixels: one side */

test('plan: a width and no height keeps the shape', () => {
  const result = plan(whole(PHOTO), { mode: 'pixels', width: 1920, height: null });
  assert.deepEqual(result.canvas, { width: 1920, height: 1440 });
});

test('plan: a height and no width keeps the shape', () => {
  const result = plan(whole(PHOTO), { mode: 'pixels', width: null, height: 1200 });
  assert.deepEqual(result.canvas, { width: 1600, height: 1200 });
});

test('plan: neither side given is not a resize at all', () => {
  const result = plan(whole(PHOTO), { mode: 'pixels', width: null, height: null });
  assert.deepEqual(result.canvas, PHOTO);
});

test('plan: one side given still respects "never enlarge"', () => {
  const small = whole({ width: 400, height: 300 });
  assert.deepEqual(plan(small, { mode: 'pixels', width: 4000, noEnlarge: true }).canvas,
    { width: 400, height: 300 });
});

/* ------------------------------------------------------------ pixels: fits */

test('plan: contain fits the whole picture inside and comes up short on one side', () => {
  // 4000x3000 into a 1000x1000 box: the width is what runs out first.
  const result = plan(whole(PHOTO), { mode: 'pixels', width: 1000, height: 1000, fit: 'contain' });
  assert.deepEqual(result.canvas, { width: 1000, height: 750 });
  assert.equal(result.padded, false);
});

test('plan: cover fills the box exactly and takes the overflow out of the source', () => {
  const result = plan(whole(PHOTO), { mode: 'pixels', width: 1000, height: 1000, fit: 'cover' });
  assert.deepEqual(result.canvas, { width: 1000, height: 1000 });
  // The source rectangle is narrowed to a square rather than the picture being
  // drawn off the edge of the canvas, so the reported crop is what was read.
  assert.deepEqual(result.source, { x: 500, y: 0, width: 3000, height: 3000 });
  assert.deepEqual(result.draw, { x: 0, y: 0, width: 1000, height: 1000 });
});

test('plan: pad keeps the exact frame and centres what fits in it', () => {
  const result = plan(whole(PHOTO), { mode: 'pixels', width: 1000, height: 1000, fit: 'pad' });
  assert.deepEqual(result.canvas, { width: 1000, height: 1000 });
  assert.deepEqual(result.draw, { x: 0, y: 125, width: 1000, height: 750 });
  assert.equal(result.padded, true);
  // The whole picture is still drawn: padding adds, it does not cut.
  assert.deepEqual(result.source, whole(PHOTO));
});

test('plan: pad that happens to fit exactly is not reported as padded', () => {
  const result = plan(whole({ width: 800, height: 600 }), {
    mode: 'pixels', width: 400, height: 300, fit: 'pad',
  });
  assert.equal(result.padded, false);
  assert.deepEqual(result.draw, { x: 0, y: 0, width: 400, height: 300 });
});

test('plan: stretch takes both numbers literally', () => {
  const result = plan(whole(PHOTO), {
    mode: 'pixels', width: 1000, height: 1000, fit: 'stretch', noEnlarge: true,
  });
  // "Never enlarge" has nothing to say about a size stated exactly.
  assert.deepEqual(result.canvas, { width: 1000, height: 1000 });
  assert.deepEqual(result.draw, { x: 0, y: 0, width: 1000, height: 1000 });
});

test('plan: an unknown fit falls back to fitting inside', () => {
  const odd = plan(whole(PHOTO), { mode: 'pixels', width: 1000, height: 1000, fit: 'squish' });
  const contain = plan(whole(PHOTO), { mode: 'pixels', width: 1000, height: 1000, fit: 'contain' });
  assert.deepEqual(odd.canvas, contain.canvas);
});

test('plan: every fit honours "never enlarge" except the one that states a size', () => {
  const small = whole({ width: 200, height: 100 });
  const box = { mode: 'pixels', width: 1000, height: 1000, noEnlarge: true };

  // Fitting inside and filling both stop at the picture's own scale.
  assert.deepEqual(plan(small, { ...box, fit: 'contain' }).canvas, { width: 200, height: 100 });
  assert.deepEqual(plan(small, { ...box, fit: 'cover' }).canvas, { width: 100, height: 100 });

  // Padding keeps the frame - that is the point of it - and simply does not
  // blow the picture up to fill it.
  const padded = plan(small, { ...box, fit: 'pad' });
  assert.deepEqual(padded.canvas, { width: 1000, height: 1000 });
  assert.deepEqual(padded.draw, { x: 400, y: 450, width: 200, height: 100 });

  assert.deepEqual(plan(small, { ...box, fit: 'stretch' }).canvas, { width: 1000, height: 1000 });
});

test('plan: every fit on the menu is a genuinely different answer', () => {
  // A 4:3 photograph into a 3:2 box, which is a box no fit can satisfy for
  // free. If two of them ever agreed here, one of them would be a control on
  // the page that does nothing.
  const answers = new Set();
  for (const fit of FITS) {
    const { canvas, source, draw } = plan(whole(PHOTO), {
      mode: 'pixels', width: 900, height: 600, fit,
    });
    answers.add(JSON.stringify({ canvas, source, draw }));
  }
  assert.equal(answers.size, FITS.length);
});

/* ------------------------------------------------------------ plan: edges */

test('plan: a canvas is never rounded down to nothing', () => {
  const result = plan(whole({ width: 10, height: 10000 }), { mode: 'percent', percent: 1 });
  assert.ok(result.canvas.width >= 1);
  assert.ok(result.canvas.height >= 1);
});

test('plan: a crop is carried through untouched by every mode that does not narrow it', () => {
  const crop = { x: 11, y: 22, width: 333, height: 444 };
  for (const resize of [
    { mode: 'none' },
    { mode: 'percent', percent: 60 },
    { mode: 'longest', longest: 100 },
    { mode: 'pixels', width: 100 },
    { mode: 'pixels', width: 100, height: 100, fit: 'contain' },
    { mode: 'pixels', width: 100, height: 100, fit: 'pad' },
    { mode: 'pixels', width: 100, height: 100, fit: 'stretch' },
  ]) {
    assert.deepEqual(plan(crop, resize).source, crop, JSON.stringify(resize));
  }
});

/* ============================================================= isUntouched */

test('isUntouched: nothing asked for means the file is handed back', () => {
  assert.equal(isUntouched(PHOTO, plan(whole(PHOTO), { mode: 'none' })), true);
  assert.equal(isUntouched(PHOTO, plan(whole(PHOTO), { mode: 'percent', percent: 100 })), true);
  assert.equal(isUntouched(PHOTO, plan(whole(PHOTO), { mode: 'pixels', width: null, height: null })), true);
});

test('isUntouched: a resize that lands on the same size is still no change', () => {
  const result = plan(whole(PHOTO), { mode: 'pixels', width: 4000, height: 3000, fit: 'contain' });
  assert.equal(isUntouched(PHOTO, result), true);
});

test('isUntouched: a crop, a resize or a pad all count as a change', () => {
  const cropped = plan({ x: 10, y: 0, width: 3990, height: 3000 }, { mode: 'none' });
  assert.equal(isUntouched(PHOTO, cropped), false);

  const resized = plan(whole(PHOTO), { mode: 'percent', percent: 50 });
  assert.equal(isUntouched(PHOTO, resized), false);

  // Same pixel count, but the picture now sits on a background: a real change.
  const padded = plan(whole(PHOTO), { mode: 'pixels', width: 4000, height: 4000, fit: 'pad' });
  assert.equal(isUntouched(PHOTO, padded), false);
});

/* ================================================================= formats */

test('keepFormat: a format the browser can write is kept', () => {
  const writable = new Set([JPEG, PNG, WEBP]);
  assert.equal(keepFormat(JPEG, writable), JPEG);
  assert.equal(keepFormat(WEBP, writable), WEBP);
});

test('keepFormat: anything the browser cannot write becomes PNG, not JPEG', () => {
  // A GIF or a BMP is likelier to be flat colour or transparent than a
  // photograph, and PNG is the one of the two that keeps both.
  const writable = new Set([JPEG, PNG]);
  assert.equal(keepFormat('image/gif', writable), PNG);
  assert.equal(keepFormat('image/bmp', writable), PNG);
  assert.equal(keepFormat(WEBP, writable), PNG);
  assert.equal(keepFormat('', writable), PNG);
});

test('FORMATS: only PNG is lossless, and only JPEG has no alpha', () => {
  assert.deepEqual(Object.keys(FORMATS).filter((m) => !FORMATS[m].lossy), [PNG]);
  assert.deepEqual(Object.keys(FORMATS).filter((m) => !FORMATS[m].alpha), [JPEG]);
});

test('READABLE: everything writable can also be read', () => {
  for (const mime of Object.keys(FORMATS)) assert.ok(READABLE.includes(mime), mime);
});

/* =================================================================== words */

test('bytes: the units people expect', () => {
  assert.equal(bytes(0), '0 bytes');
  assert.equal(bytes(1023), '1023 bytes');
  assert.equal(bytes(1024), '1.0 KB');
  assert.equal(bytes(10240), '10 KB');
  assert.equal(bytes(1024 * 1024), '1.00 MB');
});

test('dimensions: a real multiplication sign, not the letter x', () => {
  assert.equal(dimensions(1920, 1080), '1920 × 1080');
});

test('outName: the new size goes in the name, and the old extension goes', () => {
  assert.equal(outName('holiday.JPG', WEBP, 1280, 720), 'holiday-1280x720.webp');
  assert.equal(outName('logo.png', PNG, 64, 64), 'logo-64x64.png');
  assert.equal(outName('scan.tiff', JPEG, 800, 600), 'scan-800x600.jpg');
});

test('outName: a file with no name at all still gets one', () => {
  assert.equal(outName('', PNG, 10, 10), 'image-10x10.png');
  assert.equal(outName('.gitignore', PNG, 10, 10), 'image-10x10.png');
});

test('change: which way it went', () => {
  assert.equal(change(1000, 250), '75% smaller');
  assert.equal(change(1000, 1200), '20% larger');
  assert.equal(change(1000, 1000), 'about the same size');
  assert.equal(change(0, 100), '');
});

test('countOf: the plural is not "1 images"', () => {
  assert.equal(countOf(1), '1 image');
  assert.equal(countOf(4), '4 images');
});

test('scaleText: a small percentage keeps a decimal, so it is never "0%"', () => {
  assert.equal(scaleText(0.5), '50%');
  assert.equal(scaleText(1), '100%');
  assert.equal(scaleText(0.004), '0.4%');
  assert.equal(scaleText(0.0999), '10.0%');
});

test('describePlan: says what happened, in the order it happened', () => {
  const crop = { x: 500, y: 0, width: 3000, height: 3000 };
  const result = plan(crop, { mode: 'pixels', width: 1000, height: 1000, fit: 'contain' });
  assert.equal(
    describePlan(PHOTO, result.source, result, WEBP),
    'cropped to 3000 × 3000, then resized to 1000 × 1000, written as WebP.',
  );
});

test('describePlan: a picture that only changes format says so and nothing more', () => {
  const result = plan(whole(PHOTO), { mode: 'none' });
  assert.equal(
    describePlan(PHOTO, result.source, result, PNG),
    'kept at 4000 × 3000, written as PNG.',
  );
});

test('describePlan: padding is called out, because the frame is not the picture', () => {
  const result = plan(whole(PHOTO), { mode: 'pixels', width: 1000, height: 1000, fit: 'pad' });
  assert.match(describePlan(PHOTO, result.source, result, JPEG), /padded out to the exact frame/);
});
