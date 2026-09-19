/**
 * shared/js/image-convert.js - the half of the three format converters that
 * can be tested without a browser.
 *
 * WHAT IS AND IS NOT HERE
 *
 * The module is deliberately split down the middle. Identifying a file,
 * walking a RIFF chunk list, naming the output and comparing sizes are
 * arithmetic over bytes and are all covered below. Decoding and encoding are a
 * canvas, which Node has none of, so they are exercised in a browser instead -
 * each tool's README says what to look at.
 *
 * The fixtures come from tests/js/helpers.js, which already knew how to build
 * a WebP because the EXIF tools needed one. The AVIF headers are built here:
 * nothing else in the repository reads one, and they are eight bytes of magic
 * plus a brand list, which is worth seeing written out.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  AVIF, BMP, GIF, JPEG, PNG, WEBP,
  change, outName, riffChunks, sniff, uniqueNames, webpFacts,
} from '../../shared/js/image-convert.js';
import {
  ascii, concat, jpeg, png, u32be, VP8_CHUNK, vp8xChunk, webp, webpChunk,
} from './helpers.js';

/**
 * An ISO base media header: a `ftyp` box with a major brand and a list of
 * compatible ones. Real AVIFs put several in - `avif mif1 miaf` and so on -
 * and the brand that matters can be any of them, which is the case the loop in
 * sniff() exists for.
 */
const ftyp = (brands) => {
  const body = concat(ascii('ftyp'), ...brands.map((brand) => ascii(brand)));
  return concat(u32be(body.length + 4), body);
};

/* --------------------------------------------------------------- sniffing */

test('each format is recognised from its first bytes', () => {
  assert.equal(sniff(png()), PNG);
  assert.equal(sniff(jpeg()), JPEG);
  assert.equal(sniff(webp([VP8_CHUNK])), WEBP);
  assert.equal(sniff(ascii('GIF89a') && concat(ascii('GIF89a'), new Uint8Array(8))), GIF);
  assert.equal(sniff(concat(ascii('BM'), new Uint8Array(16))), BMP);
});

test('an AVIF is found by its brand, wherever in the list it sits', () => {
  assert.equal(sniff(ftyp(['avif', '\0\0\0\0', 'avif', 'mif1', 'miaf'])), AVIF);
  // The major brand can be something else entirely as long as avif is
  // compatible, which is how libavif and ffmpeg both write them.
  assert.equal(sniff(ftyp(['mif1', '\0\0\0\0', 'mif1', 'avif'])), AVIF);
  // 'avis' is the image-sequence brand. It decodes to a first picture like any
  // other still, so it is accepted rather than refused.
  assert.equal(sniff(ftyp(['avis', '\0\0\0\0', 'avis', 'msf1'])), AVIF);
});

test('an ISO file that is not an AVIF is not claimed as one', () => {
  // An MP4 is the same container with different brands, and this tool has
  // nothing to offer it.
  assert.equal(sniff(ftyp(['isom', '\0\0\0\0', 'isom', 'iso2', 'mp41'])), null);
  // HEIC is the closest relative of all - the same boxes, HEVC inside - and is
  // the one format here that genuinely needs the other tool's decoder.
  assert.equal(sniff(ftyp(['heic', '\0\0\0\0', 'mif1', 'heic'])), null);
});

test('a brand is only matched on a four-byte boundary', () => {
  // "xavi" + "fxxx" contains the letters of a brand across the join, and is
  // not one. Walking a byte at a time would accept it.
  assert.equal(sniff(ftyp(['xavi', 'fxxx'])), null);
});

test('anything else, and anything too short, is null', () => {
  assert.equal(sniff(ascii('this is a text file, not a picture')), null);
  assert.equal(sniff(new Uint8Array(0)), null);
  assert.equal(sniff(new Uint8Array([0x89, 0x50])), null);
  assert.equal(sniff(null), null);
  // RIFF, but a WAV rather than a WebP.
  assert.equal(sniff(concat(ascii('RIFF'), u32be(4), ascii('WAVE'), new Uint8Array(8))), null);
});

/* ------------------------------------------------------------ RIFF walking */

test('the chunk list is walked in order', () => {
  const file = webp([vp8xChunk(0), webpChunk('ICCP', ascii('profile')), VP8_CHUNK]);
  assert.deepEqual(riffChunks(file).map((one) => one.type), ['VP8X', 'ICCP', 'VP8 ']);
});

test('an odd-length chunk is padded, and the pad byte is not counted', () => {
  // 'ICCP' holds seven bytes, so a pad byte follows it. Forgetting that walks
  // into the middle of the next header and finds nothing after it.
  const file = webp([webpChunk('ICCP', ascii('seven77')), VP8_CHUNK]);
  const found = riffChunks(file);
  assert.deepEqual(found.map((one) => one.type), ['ICCP', 'VP8 ']);
  assert.equal(found[0].size, 7);
});

test('something that is not RIFF has no chunks rather than throwing', () => {
  assert.deepEqual(riffChunks(png()), []);
  assert.deepEqual(riffChunks(new Uint8Array(4)), []);
  assert.deepEqual(riffChunks(null), []);
});

/* -------------------------------------------------------------- WebP facts */

test('a plain lossy still', () => {
  assert.deepEqual(webpFacts(webp([VP8_CHUNK])), {
    animated: false, alpha: false, lossless: false,
  });
});

test('the lossless coding is read from the chunk that holds the pixels', () => {
  const file = webp([vp8xChunk(0), webpChunk('VP8L', ascii('lossless'))]);
  assert.equal(webpFacts(file).lossless, true);
});

test('alpha is found from the chunk or from the VP8X flag', () => {
  assert.equal(webpFacts(webp([vp8xChunk(0), webpChunk('ALPH', ascii('a')), VP8_CHUNK])).alpha, true);
  // 0x10 is the alpha bit. A lossless still can carry alpha with no ALPH
  // chunk at all, and this is the only cheap way to see it.
  assert.equal(webpFacts(webp([vp8xChunk(0x10), webpChunk('VP8L', ascii('x'))])).alpha, true);
  assert.equal(webpFacts(webp([vp8xChunk(0), VP8_CHUNK])).alpha, false);
});

test('an animation is found from either of the chunks that make one', () => {
  const file = webp([vp8xChunk(0x02), webpChunk('ANIM', new Uint8Array(6)),
    webpChunk('ANMF', ascii('frame'))]);
  assert.equal(webpFacts(file).animated, true);
  assert.equal(webpFacts(webp([VP8_CHUNK])).animated, false);
});

test('the pixel chunk is found past a colour profile, not only at the front', () => {
  // The bug this pins: a browser writes ICCP in front of the pixels, so the
  // first 64 bytes of a real lossless WebP contain no VP8L at all. Reading
  // only a head reported every lossless file as lossy.
  const profile = new Uint8Array(456);
  const file = webp([vp8xChunk(0), webpChunk('ICCP', profile), webpChunk('VP8L', ascii('px'))]);
  assert.equal(webpFacts(file).lossless, true);
  assert.equal(webpFacts(file.slice(0, 64)).lossless, false,
    'a 64-byte head cannot reach the pixels - which is why encodeWebp does not use one');
});

/* ------------------------------------------------------------------ naming */

test('the old extension is replaced rather than kept beside the new one', () => {
  assert.equal(outName('holiday.webp', 'jpg'), 'holiday.jpg');
  assert.equal(outName('SHOUTING.PNG', 'webp'), 'SHOUTING.webp');
  assert.equal(outName('two.dots.here.avif', 'jpg'), 'two.dots.here.jpg');
});

test('a name with no extension keeps all of itself', () => {
  assert.equal(outName('screenshot', 'jpg'), 'screenshot.jpg');
  // A dot in a folder name is not an extension on the file.
  assert.equal(outName('my.photos/august', 'jpg'), 'my.photos/august.jpg');
  assert.equal(outName('', 'jpg'), 'image.jpg');
});

test('repeated names are numbered, before the extension', () => {
  assert.deepEqual(
    uniqueNames(['a.jpg', 'b.jpg', 'a.jpg', 'a.jpg']),
    ['a.jpg', 'b.jpg', 'a-2.jpg', 'a-3.jpg'],
  );
  assert.deepEqual(uniqueNames(['x', 'x']), ['x', 'x-2']);
  assert.deepEqual(uniqueNames([]), []);
});

/* ------------------------------------------------------------- the compare */

test('the size change is a key and a whole percentage', () => {
  assert.deepEqual(change(1000, 250), { key: 'change.smaller', values: { percent: 75 } });
  assert.deepEqual(change(100, 150), { key: 'change.larger', values: { percent: 50 } });
  assert.deepEqual(change(1000, 1000), { key: 'change.same' });
  // Under half a percent either way reads as no change rather than as "0%
  // smaller", which is a sentence nobody wants to read.
  assert.deepEqual(change(1000, 999), { key: 'change.same' });
});

test('a file that was empty has nothing to compare', () => {
  assert.equal(change(0, 500), null);
});
