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

import { ltr } from '../../shared/js/phrases.js';

import {
  UNITS, bytes, change, dimensions, matchText, outName, psnrText, targetBytes,
} from '../../tools/compress-image/src/files.js';
import {
  MIN_SCALE, QUALITY_CEILING, QUALITY_FLOOR, QUALITY_HARD_MIN, SEARCH_QUALITY,
  alternativeFormat, keepFormat,
} from '../../tools/compress-image/src/compress.js';
import { encode, FORMATS, JPEG, PNG, READABLE, WEBP } from '../../tools/compress-image/src/codecs.js';
import { parseImageUrl } from '../../shared/js/url-import.js';
import { captureSettings, compressOne, score } from '../../tools/compress-image/src/process.js';
import { compare, hasTransparency } from '../../tools/compress-image/src/measure.js';

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
  assert.equal(dimensions(4032, 3024), ltr('4032 × 3024'));
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
  assert.throws(() => parseImageUrl('not a url'), /url\.invalid/);
  assert.throws(() => parseImageUrl(''), /url\.invalid/);
  assert.throws(() => parseImageUrl('example.test/a.jpg'), /url\.invalid/);
});

test('parseImageUrl: other schemes are named in the refusal', () => {
  // file:, data: and javascript: all have to be turned away by scheme rather
  // than by guesswork.
  for (const raw of ['file:///etc/passwd', 'data:image/png;base64,AAA', 'ftp://x.test/a.jpg']) {
    assert.throws(() => parseImageUrl(raw), (error) => {
      assert.equal(error.message, 'url.protocol');
      assert.equal(error.values.protocol, new URL(raw).protocol);
      return true;
    }, raw);
  }
});

test('parseImageUrl: the invalid address is short enough to show in a translated refusal', () => {
  try {
    parseImageUrl('x'.repeat(500));
    assert.fail('should have thrown');
  } catch (err) {
    assert.equal(err.message, 'url.invalid');
    assert.equal(err.values.address.length, 60);
  }
});


/* =========================================================== run settings */

const deferred = () => {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
};

const runItem = () => ({
  file: { name: 'photo.png', size: 20000, type: PNG },
  size: { width: 320, height: 240 },
});

function fitted(mime, extra = {}) {
  return {
    blob: new Blob(['encoded'], { type: mime }), mime,
    width: 320, height: 240, fitted: true, resized: false,
    quality: 0.8, encodes: 1, ...extra,
  };
}

test('a delayed decode keeps the batch target, format and resizing permission', async () => {
  const options = { targetBytes: 10000, format: JPEG, allowResize: true };
  const writable = new Set([JPEG, PNG]);
  const settings = captureSettings(options, writable);
  const decoded = deferred();
  const bitmap = {};
  const searches = [];
  const released = [];
  const processing = compressOne(runItem(), settings, () => {}, {
    decode: () => decoded.promise,
    hasTransparency: () => false,
    fitToTarget: async (_, search) => { searches.push(search); return fitted(search.mime); },
    score: async () => ({ ssim: 0.99 }),
    release: (source) => released.push(source),
  });
  options.targetBytes = 50000;
  options.format = PNG;
  options.allowResize = false;
  writable.clear();
  decoded.resolve({ bitmap, width: 320, height: 240 });
  const result = await processing;
  assert.equal(searches.length, 1);
  assert.equal(searches[0].targetBytes, 10000);
  assert.equal(searches[0].mime, JPEG);
  assert.equal(searches[0].allowResize, true);
  assert.equal(result.mime, JPEG);
  assert.equal(result.outName, 'photo-compressed.jpg');
  assert.deepEqual(released, [bitmap]);
});

test('automatic comparison uses the captured encoder set for both searches', async () => {
  const writable = new Set([JPEG, PNG, WEBP]);
  const settings = captureSettings({ targetBytes: 10000, format: 'auto', allowResize: true }, writable);
  const decoded = deferred();
  const bitmap = {};
  const searches = [];
  const released = [];
  const processing = compressOne(runItem(), settings, () => {}, {
    decode: () => decoded.promise,
    hasTransparency: () => true,
    fitToTarget: async (_, search) => {
      searches.push(search);
      return fitted(search.mime, { resized: true, encodes: 2 });
    },
    score: async (_, candidate) => ({ ssim: candidate.mime === WEBP ? 0.99 : 0.8 }),
    release: (source) => released.push(source),
  });
  writable.delete(WEBP);
  decoded.resolve({ bitmap, width: 320, height: 240 });
  const result = await processing;
  assert.deepEqual(searches.map(({ mime, targetBytes, allowResize }) =>
    ({ mime, targetBytes, allowResize })), [
    { mime: PNG, targetBytes: 10000, allowResize: true },
    { mime: WEBP, targetBytes: 10000, allowResize: true },
  ]);
  assert.equal(result.mime, WEBP);
  assert.equal(result.changedFormat, true);
  assert.equal(result.encodes, 4);
  assert.deepEqual(released, [bitmap]);
});

test('a file under the captured target stays byte-for-byte without decoding', async () => {
  const item = runItem();
  const settings = captureSettings({ targetBytes: 30000, format: JPEG, allowResize: true }, new Set([JPEG, PNG]));
  const result = await compressOne(item, settings, () => {}, {
    decode: () => assert.fail('a file that fits must not be decoded'),
  });
  assert.equal(result.blob, item.file);
  assert.equal(result.outName, item.file.name);
  assert.equal(result.mime, PNG);
  assert.equal(result.untouched, true);
});

test('source bitmaps are released after encoder failure and cancellation', async () => {
  const settings = captureSettings({ targetBytes: 10000, format: JPEG, allowResize: true }, new Set([JPEG, PNG]));
  for (const failure of [new Error('error.encode'), new DOMException('Cancelled', 'AbortError')]) {
    const bitmap = {};
    const released = [];
    await assert.rejects(compressOne(runItem(), settings, (step) => {
      if (step === 'step.quality') throw failure;
    }, {
      decode: async () => ({ bitmap, width: 320, height: 240 }),
      hasTransparency: () => false,
      fitToTarget: async (_, { onStep }) => {
        if (failure.name === 'AbortError') onStep('step.quality');
        throw failure;
      },
      release: (source) => released.push(source),
    }), (error) => error === failure);
    assert.deepEqual(released, [bitmap]);
  }
});

test('measurement releases its bitmap on success and comparison failure', async () => {
  for (const failed of [false, true]) {
    const bitmap = {};
    const released = [];
    const failure = new Error('comparison failed');
    const measurement = score({ bitmap: {}, width: 320, height: 240 }, fitted(JPEG), {
      decode: async () => ({ bitmap }),
      compare: () => { if (failed) throw failure; return { ssim: 0.99 }; },
      release: (source) => released.push(source),
    });
    if (failed) await assert.rejects(measurement, (error) => error === failure);
    else assert.deepEqual(await measurement, { ssim: 0.99 });
    assert.deepEqual(released, [bitmap]);
  }
});


async function withCanvas(canvas, work) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', {
    configurable: true, value: { createElement: () => canvas },
  });
  try { return await work(); }
  finally {
    if (previous) Object.defineProperty(globalThis, 'document', previous);
    else delete globalThis.document;
  }
}

test('encode releases canvas storage after success, null output and thrown failures', async () => {
  for (const failure of ['none', 'draw', 'encode', 'null']) {
    const expected = new Error(failure);
    const canvas = {
      width: 0, height: 0,
      getContext: () => ({
        fillRect() {},
        drawImage() { if (failure === 'draw') throw expected; },
      }),
      toBlob(callback) {
        if (failure === 'encode') throw expected;
        callback(failure === 'null' ? null : new Blob(['encoded'], { type: JPEG }));
      },
    };
    await withCanvas(canvas, async () => {
      const output = encode({}, { width: 4000, height: 3000, mime: JPEG, quality: 0.8 });
      if (failure === 'none') assert.equal((await output).type, JPEG);
      else if (failure === 'null') await assert.rejects(output, /error\.encode/);
      else await assert.rejects(output, (error) => error === expected);
    });
    assert.equal(canvas.width, 0, failure);
    assert.equal(canvas.height, 0, failure);
  }
});

test('measurement canvases release storage when pixel reads or drawing fail', async () => {
  for (const failure of ['draw', 'pixels']) {
    for (const operation of [compare, hasTransparency]) {
      const canvas = {
        width: 0, height: 0,
        getContext: () => ({
          fillRect() {},
          drawImage() { if (failure === 'draw') throw new Error('drawing failed'); },
          getImageData() { throw new Error('pixels unavailable'); },
        }),
      };
      await withCanvas(canvas, async () => {
        if (operation === compare) assert.equal(compare({}, {}, { width: 4000, height: 3000 }), null);
        else if (failure === 'draw') assert.throws(() => hasTransparency({}, { width: 4000, height: 3000 }), /drawing failed/);
        else assert.equal(hasTransparency({}, { width: 4000, height: 3000 }), false);
      });
      assert.equal(canvas.width, 0, failure);
      assert.equal(canvas.height, 0, failure);
    }
  }
});
