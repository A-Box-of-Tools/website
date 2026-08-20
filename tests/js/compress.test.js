/**
 * tools/compress-image/src/{files,compress,codecs}.js and shared/js/*.js.
 *
 * The wording functions look like the least important thing in the tool and
 * are not: sizes on this page are read against a target, so a 511.6 KB result
 * shown as "512 KB" beside a 512 KB target reads as a miss when it was a hit.
 * That rounding rule is a test.
 *
 * The format choices are the other half. Keeping the format is the default
 * because a .jpg that leaves as a .webp is a support question for whoever it
 * gets sent to, and there is exactly one case where "auto" changes the
 * extension anyway.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  UNITS, bytes, change, dimensions, matchText, outName, psnrText, targetBytes,
} from '../../tools/compress-image/src/files.js';
import {
  MIN_SCALE, QUALITY_CEILING, QUALITY_FLOOR, QUALITY_HARD_MIN, SEARCH_QUALITY,
  alternativeFormat, keepFormat,
} from '../../tools/compress-image/src/compress.js';
import { FORMATS, JPEG, PNG, READABLE, WEBP } from '../../tools/compress-image/src/codecs.js';
import { readingLabel } from '../../shared/js/file-picker.js';
import { parseImageUrl } from '../../shared/js/url-import.js';

/* ================================================================= sizes */

test('bytes: under a kilobyte is counted exactly', () => {
  assert.equal(bytes(0), '0 bytes');
  assert.equal(bytes(1), '1 bytes');
  assert.equal(bytes(1023), '1023 bytes');
});

test('bytes: kilobytes carry a decimal until ten of them', () => {
  assert.equal(bytes(1024), '1.0 KB');
  assert.equal(bytes(10239), '10.0 KB');
  assert.equal(bytes(10240), '10 KB');
  assert.equal(bytes(512 * 1024), '512 KB');
});

test('bytes: megabytes carry two decimals', () => {
  assert.equal(bytes(1024 * 1024), '1.00 MB');
  assert.equal(bytes(1536 * 1024), '1.50 MB');
});

test('bytes: a near miss is never rounded up past its target', () => {
  // 511.6 KB shown as "512 KB" beside a 512 KB target reads as a miss.
  assert.equal(bytes(511 * 1024 + 600), '512 KB');
  assert.equal(bytes(1024 * 1024 - 1), '1024 KB');
});

test('targetBytes: a number and a unit', () => {
  assert.equal(targetBytes('500', 'KB'), 500 * 1024);
  assert.equal(targetBytes('1.5', 'MB'), Math.round(1.5 * 1024 * 1024));
  assert.equal(targetBytes('2', 'MB'), 2 * 1024 * 1024);
});

test('targetBytes: KB and MB mean 1024, which is what people mean', () => {
  assert.equal(UNITS.KB, 1024);
  assert.equal(UNITS.MB, 1024 * 1024);
});

test('targetBytes: an unknown unit is read as KB', () => {
  assert.equal(targetBytes('500', 'gigglebytes'), 500 * 1024);
  assert.equal(targetBytes('500', undefined), 500 * 1024);
});

test('targetBytes: a field with nothing usable in it', () => {
  assert.equal(targetBytes('', 'KB'), null);
  assert.equal(targetBytes('abc', 'KB'), null);
  assert.equal(targetBytes('0', 'KB'), null);
  assert.equal(targetBytes('-5', 'KB'), null);
  assert.equal(targetBytes('Infinity', 'KB'), null);
});

test('targetBytes: a trailing unit in the field is ignored', () => {
  assert.equal(targetBytes('500kb', 'KB'), 500 * 1024);
});

test('dimensions: a real multiplication sign', () => {
  assert.equal(dimensions(4032, 3024), '4032 × 3024');
});

/* ================================================================= names */

test('outName: the original extension is dropped, not kept alongside', () => {
  // "holiday.jpg-compressed.webp" is how a file ends up unopenable on a phone.
  assert.equal(outName('holiday.jpg', WEBP), 'holiday-compressed.webp');
  assert.equal(outName('holiday.jpeg', JPEG), 'holiday-compressed.jpg');
  assert.equal(outName('shot.PNG', PNG), 'shot-compressed.png');
});

test('outName: only the last extension goes', () => {
  assert.equal(outName('my.holiday.photo.jpg', JPEG), 'my.holiday.photo-compressed.jpg');
});

test('outName: a name with no extension', () => {
  assert.equal(outName('holiday', JPEG), 'holiday-compressed.jpg');
});

test('outName: a name that is nothing but an extension', () => {
  assert.equal(outName('.jpg', JPEG), 'image-compressed.jpg');
  assert.equal(outName('', JPEG), 'image-compressed.jpg');
});

test('outName: an unknown type falls back to jpg', () => {
  assert.equal(outName('a.gif', 'image/gif'), 'a-compressed.jpg');
});

/* =============================================================== wording */

test('change: smaller, larger, or about the same', () => {
  assert.equal(change(1000, 270), '73% smaller');
  assert.equal(change(1000, 1030), '3% larger');
  assert.equal(change(1000, 1000), 'about the same size');
  assert.equal(change(1000, 998), 'about the same size');
});

test('change: nothing to say about a file that was empty', () => {
  assert.equal(change(0, 100), '');
});

test('matchText: the number, and wording that stops it being over-read', () => {
  // 0.97 is a good result, not "97% of the picture survived".
  assert.equal(matchText(1), '100.0% - indistinguishable');
  assert.equal(matchText(0.995), '99.5% - indistinguishable');
  assert.equal(matchText(0.99), '99.0% - no visible difference');
  assert.equal(matchText(0.97), '97.0% - very close');
  assert.equal(matchText(0.93), '93.0% - slight softening');
  assert.equal(matchText(0.8), '80.0% - visibly compressed');
});

test('matchText: the boundaries land on the wording above them', () => {
  assert.match(matchText(0.985), /no visible difference/);
  assert.match(matchText(0.96), /very close/);
  assert.match(matchText(0.92), /slight softening/);
  assert.match(matchText(0.9199), /visibly compressed/);
});

test('psnrText: identical pictures have no finite ratio to report', () => {
  assert.equal(psnrText(Infinity), 'identical');
  assert.equal(psnrText(NaN), 'identical');
  assert.equal(psnrText(42.35), '42.4 dB');
});

test('readingLabel: one file, or several', () => {
  assert.equal(readingLabel(1), 'Reading 1 file...');
  assert.equal(readingLabel(0), 'Reading 0 files...');
  assert.equal(readingLabel(12), 'Reading 12 files...');
});

/* ================================================================ formats */

test('the search constants are in the order the search spends them', () => {
  assert.ok(QUALITY_CEILING > SEARCH_QUALITY);
  assert.ok(SEARCH_QUALITY > QUALITY_FLOOR);
  assert.ok(QUALITY_FLOOR > QUALITY_HARD_MIN);
  assert.ok(MIN_SCALE > 0 && MIN_SCALE < 1);
});

test('FORMATS names every writable type, and READABLE covers more', () => {
  assert.deepEqual(Object.keys(FORMATS).sort(), [JPEG, PNG, WEBP].sort());
  assert.equal(FORMATS[PNG].lossy, false);
  assert.equal(FORMATS[JPEG].lossy, true);
  for (const mime of Object.keys(FORMATS)) assert.ok(READABLE.includes(mime));
  assert.ok(READABLE.includes('image/avif'), 'read but not written');
});

test('keepFormat: keeping the format is the default answer', () => {
  const all = new Set([JPEG, PNG, WEBP]);
  assert.equal(keepFormat(JPEG, all), JPEG);
  assert.equal(keepFormat(PNG, all), PNG);
  assert.equal(keepFormat(WEBP, all), WEBP);
});

test('keepFormat: a type this browser cannot write becomes one it can', () => {
  const noWebp = new Set([JPEG, PNG]);
  assert.equal(keepFormat(WEBP, noWebp), JPEG);
});

test('keepFormat: a GIF keeps its transparency by becoming a PNG', () => {
  assert.equal(keepFormat('image/gif', new Set([JPEG, PNG])), PNG);
});

test('keepFormat: everything else this browser will not write becomes a JPEG', () => {
  const writable = new Set([JPEG, PNG]);
  assert.equal(keepFormat('image/bmp', writable), JPEG);
  assert.equal(keepFormat('image/avif', writable), JPEG);
  assert.equal(keepFormat('image/heic', writable), JPEG);
});

test('alternativeFormat: WebP is the one thing worth trying', () => {
  const all = new Set([JPEG, PNG, WEBP]);
  assert.equal(alternativeFormat(JPEG, all, false), WEBP);
  assert.equal(alternativeFormat(PNG, all, true), WEBP);
});

test('alternativeFormat: a PNG with no transparency can become a JPEG', () => {
  assert.equal(alternativeFormat(PNG, new Set([JPEG, PNG]), false), JPEG);
});

test('alternativeFormat: a PNG carrying transparency has nowhere to go', () => {
  assert.equal(alternativeFormat(PNG, new Set([JPEG, PNG]), true), null);
});

test('alternativeFormat: nothing better than WebP', () => {
  assert.equal(alternativeFormat(WEBP, new Set([JPEG, PNG, WEBP]), false), null);
});

test('alternativeFormat: a JPEG in a browser with no WebP has nowhere to go', () => {
  assert.equal(alternativeFormat(JPEG, new Set([JPEG, PNG]), false), null);
});

/* ============================================================ url import */

test('parseImageUrl: http and https are the only schemes', () => {
  assert.equal(parseImageUrl('https://example.test/a.jpg').href,
    'https://example.test/a.jpg');
  assert.equal(parseImageUrl('http://example.test/a.jpg').protocol, 'http:');
});

test('parseImageUrl: surrounding whitespace is forgiven', () => {
  assert.equal(parseImageUrl('  https://example.test/a.jpg \n ').hostname,
    'example.test');
});

test('parseImageUrl: anything that is not a web address is refused', () => {
  assert.throws(() => parseImageUrl('not a url'), /Not a valid web address/);
  assert.throws(() => parseImageUrl(''), /Not a valid web address/);
  assert.throws(() => parseImageUrl('example.test/a.jpg'), /Not a valid web address/);
});

test('parseImageUrl: other schemes are named in the refusal', () => {
  // file:, data: and javascript: all have to be turned away by scheme rather
  // than by guesswork.
  for (const raw of ['file:///etc/passwd', 'data:image/png;base64,AAA', 'ftp://x.test/a.jpg']) {
    assert.throws(() => parseImageUrl(raw), /Only http and https/, raw);
  }
});

test('parseImageUrl: the refusal message is short enough to show', () => {
  try {
    parseImageUrl('x'.repeat(500));
    assert.fail('should have thrown');
  } catch (err) {
    assert.ok(err.message.length < 100);
  }
});
