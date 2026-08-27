/**
 * tools/compress-image/src/{files,compress,codecs}.js and shared/js/*.js.
 *
 * The wording functions look like the least important thing in the tool and
 * are not: sizes on this page are read against a target, so a 511.6 KB result
 * shown as "512 KB" beside a 512 KB target reads as a miss when it was a hit.
 * That rounding rule is a test.
 *
 * They hand back the key of a phrase and the blanks to fill it with rather
 * than a sentence, because this file imports them off the disk and a module a
 * test can import cannot import `./shared/phrases.js` - so the words live in
 * the tool's body.html and main.js resolves them. What is tested here is the
 * decision each one makes: which wording, and what number goes in it.
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
import { parseImageUrl } from '../../shared/js/url-import.js';

/* ================================================================= sizes */

test('bytes: under a kilobyte is counted exactly', () => {
  assert.deepEqual(bytes(0), { key: 'size.bytes', values: { amount: 0 } });
  assert.deepEqual(bytes(1), { key: 'size.bytes', values: { amount: 1 } });
  assert.deepEqual(bytes(1023), { key: 'size.bytes', values: { amount: 1023 } });
});

test('bytes: kilobytes carry a decimal until ten of them', () => {
  assert.deepEqual(bytes(1024), { key: 'size.kb', values: { amount: '1.0' } });
  assert.deepEqual(bytes(10239), { key: 'size.kb', values: { amount: '10.0' } });
  assert.deepEqual(bytes(10240), { key: 'size.kb', values: { amount: '10' } });
  assert.deepEqual(bytes(512 * 1024), { key: 'size.kb', values: { amount: '512' } });
});

test('bytes: megabytes carry two decimals', () => {
  assert.deepEqual(bytes(1024 * 1024), { key: 'size.mb', values: { amount: '1.00' } });
  assert.deepEqual(bytes(1536 * 1024), { key: 'size.mb', values: { amount: '1.50' } });
});

test('bytes: a near miss is never rounded up past its target', () => {
  // 511.6 KB shown as "512 KB" beside a 512 KB target reads as a miss.
  assert.deepEqual(bytes(511 * 1024 + 600), { key: 'size.kb', values: { amount: '512' } });
  assert.deepEqual(bytes(1024 * 1024 - 1), { key: 'size.kb', values: { amount: '1024' } });
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
  assert.deepEqual(change(1000, 270), { key: 'change.smaller', values: { percent: 73 } });
  assert.deepEqual(change(1000, 1030), { key: 'change.larger', values: { percent: 3 } });
  assert.deepEqual(change(1000, 1000), { key: 'change.same' });
  assert.deepEqual(change(1000, 998), { key: 'change.same' });
});

test('change: nothing to say about a file that was empty', () => {
  assert.equal(change(0, 100), null);
});

test('matchText: the number, and wording that stops it being over-read', () => {
  // 0.97 is a good result, not "97% of the picture survived".
  assert.deepEqual(matchText(1), { key: 'match.identical', values: { percent: '100.0' } });
  assert.deepEqual(matchText(0.995), { key: 'match.identical', values: { percent: '99.5' } });
  assert.deepEqual(matchText(0.99), { key: 'match.invisible', values: { percent: '99.0' } });
  assert.deepEqual(matchText(0.97), { key: 'match.close', values: { percent: '97.0' } });
  assert.deepEqual(matchText(0.93), { key: 'match.softened', values: { percent: '93.0' } });
  assert.deepEqual(matchText(0.8), { key: 'match.visible', values: { percent: '80.0' } });
});

test('matchText: the boundaries land on the wording above them', () => {
  assert.equal(matchText(0.985).key, 'match.invisible');
  assert.equal(matchText(0.96).key, 'match.close');
  assert.equal(matchText(0.92).key, 'match.softened');
  assert.equal(matchText(0.9199).key, 'match.visible');
});

test('psnrText: identical pictures have no finite ratio to report', () => {
  assert.deepEqual(psnrText(Infinity), { key: 'psnr.identical' });
  assert.deepEqual(psnrText(NaN), { key: 'psnr.identical' });
  assert.deepEqual(psnrText(42.35), { key: 'psnr.db', values: { db: '42.4' } });
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
