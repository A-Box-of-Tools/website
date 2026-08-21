/**
 * tools/image-to-data-uri/src/metadata.js - what is in the file besides the
 * picture.
 *
 * This warning exists because this tool, alone among the ones here, does not
 * re-encode anything. Every other tool destroys metadata as a side effect of
 * decoding and encoding; this one copies the bytes, so a phone photograph's GPS
 * fix travels into the stylesheet and from there into a repository.
 *
 * Two failures are worth guarding against and they pull in opposite directions.
 * Missing a real EXIF block means the warning never fires. Counting JFIF - the
 * fourteen bytes present in essentially every JPEG - means it fires on
 * everything, which is the same as it never firing, because nobody reads a
 * warning that is always on.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { metadata } from '../../tools/image-to-data-uri/src/metadata.js';
import {
  concat, ascii, jpeg, segment, png, chunk, textChunk, webp, webpChunk, VP8_CHUNK,
  EXIF_ID, XMP_ID, JFIF_SEGMENT, TIFF_LE,
} from './helpers.js';

/* -------------------------------------------------------------------- JPEG */

test('EXIF in a JPEG is found, and its size is the whole segment', () => {
  const exif = segment(0xe1, concat(EXIF_ID, TIFF_LE));
  const found = metadata(jpeg([exif]), 'image/jpeg');

  assert.deepEqual(found.kinds, ['EXIF']);
  // The marker and the length field are part of what a data URI would carry,
  // so the figure on the page counts them.
  assert.equal(found.bytes, exif.length);
});

test('JFIF alone is not reported', () => {
  // Fourteen bytes saying the file is a JPEG in the usual way. Reporting it
  // would put a warning on every photograph ever taken.
  assert.equal(metadata(jpeg([JFIF_SEGMENT]), 'image/jpeg'), null);
});

test('XMP, ICC, IPTC and a comment are told apart', () => {
  const file = jpeg([
    JFIF_SEGMENT,
    segment(0xe1, concat(XMP_ID, ascii('<x:xmpmeta/>'))),
    segment(0xe2, concat(ascii('ICC_PROFILE\0'), ascii('profile bytes'))),
    segment(0xed, concat(ascii('Photoshop 3.0\0'), ascii('8BIM'))),
    segment(0xfe, ascii('made in a hurry')),
  ]);

  assert.deepEqual(
    metadata(file, 'image/jpeg').kinds,
    ['XMP', 'a colour profile', 'IPTC', 'a comment'],
  );
});

test('two EXIF-carrying segments are one kind and two sizes', () => {
  const one = segment(0xe1, concat(EXIF_ID, TIFF_LE));
  const found = metadata(jpeg([one, one]), 'image/jpeg');

  assert.deepEqual(found.kinds, ['EXIF']);
  assert.equal(found.bytes, one.length * 2);
});

test('nothing after the scan is counted', () => {
  // The walker stops at SOS. Anything that looks like a marker inside the
  // compressed data is compressed data, and reading it as a segment would put
  // an arbitrary number on the page.
  const file = concat(jpeg([]), ascii('\xff\xe1 whatever this is'));
  assert.equal(metadata(file, 'image/jpeg'), null);
});

test('a JPEG with nothing in it reports nothing', () => {
  assert.equal(metadata(jpeg([]), 'image/jpeg'), null);
});

/* --------------------------------------------------------------------- PNG */

test('PNG text chunks are found', () => {
  const text = textChunk('Comment', 'taken at home');
  const found = metadata(png([text]), 'image/png');

  assert.deepEqual(found.kinds, ['text']);
  assert.equal(found.bytes, text.length);
});

test('an eXIf chunk in a PNG is EXIF', () => {
  const exif = chunk('eXIf', TIFF_LE);
  assert.deepEqual(metadata(png([exif]), 'image/png').kinds, ['EXIF']);
});

test('an iTXt holding XMP is named as XMP, not as text', () => {
  // Where an editor puts the things people expect EXIF to hold, so lumping it
  // in with "text" would understate what is being copied.
  const xmp = chunk('iTXt', concat(ascii('XML:com.adobe.xmp\0'), ascii('\0\0\0\0<x:xmpmeta/>')));
  assert.deepEqual(metadata(png([xmp]), 'image/png').kinds, ['XMP']);
});

test('a colour profile and a timestamp are both named', () => {
  const file = png([
    chunk('iCCP', concat(ascii('sRGB\0\0'), ascii('deflated'))),
    chunk('tIME', new Uint8Array(7)),
  ]);
  assert.deepEqual(metadata(file, 'image/png').kinds, ['a colour profile', 'a timestamp']);
});

test('an ordinary PNG reports nothing', () => {
  assert.equal(metadata(png(), 'image/png'), null);
});

/* -------------------------------------------------------------------- WebP */

test('WebP EXIF and XMP chunks are found', () => {
  const exif = webpChunk('EXIF', TIFF_LE);
  const found = metadata(webp([VP8_CHUNK, exif]), 'image/webp');

  assert.deepEqual(found.kinds, ['EXIF']);
  assert.equal(found.bytes, TIFF_LE.length + 8);
});

test('an odd-length WebP chunk does not desynchronise the walk', () => {
  // Every RIFF chunk is padded to an even length and the pad byte is not in
  // the size field. Forgetting it shifts everything after by one byte, and the
  // walk then finds nothing at all.
  const odd = webpChunk('XMP ', ascii('seven..'));
  const file = webp([VP8_CHUNK, odd, webpChunk('EXIF', TIFF_LE)]);

  assert.deepEqual(metadata(file, 'image/webp').kinds, ['XMP', 'EXIF']);
});

test('a plain WebP reports nothing', () => {
  assert.equal(metadata(webp([VP8_CHUNK]), 'image/webp'), null);
});

/* ------------------------------------------------------------- not inspected */

test('a format this cannot walk answers null, not zero', () => {
  // null means "not looked at". The page is careful never to render that as
  // "clean", because a GIF or an AVIF may well be carrying something.
  assert.equal(metadata(new Uint8Array(64), 'image/gif'), null);
  assert.equal(metadata(new Uint8Array(64), 'image/avif'), null);
  assert.equal(metadata(new Uint8Array(64), 'image/svg+xml'), null);
});
