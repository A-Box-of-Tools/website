/**
 * tools/image-to-data-uri/src/sniff.js - reading the media type out of the file.
 *
 * A data URI declares its own type and the browser believes it, with no
 * sniffing fallback: the wrong type renders nothing, silently, in somebody
 * else's page. So the type is read from the bytes rather than from the name,
 * and these tests cover the two ways that can go wrong - a signature that is
 * not recognised, and a signature that is recognised as the wrong thing.
 *
 * The refusal at the end matters as much as the matches. Guessing at an
 * unrecognised file would move the failure from this page, where it can be
 * explained, to a page nobody here will ever see.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { sniff, looksLikeSvg, extensionType } from '../../tools/image-to-data-uri/src/sniff.js';
import {
  concat, ascii, u32be, u32le, png, jpeg, webp, VP8_CHUNK,
} from './helpers.js';

const bytes = (...values) => new Uint8Array(values.flat());
const pad = (head, length = 64) => concat(head, new Uint8Array(Math.max(0, length - head.length)));

/** An ISO base media header: a box length, `ftyp`, a major brand, a version,
 *  then the compatible brands. This is what AVIF and HEIC both look like. */
const ftyp = (major, ...compatible) => concat(
  u32be(16 + compatible.length * 4),
  ascii('ftyp'),
  ascii(major),
  u32be(0),
  ...compatible.map((brand) => ascii(brand)),
);

/* --------------------------------------------------------- the raster kinds */

test('PNG by its signature', () => {
  assert.equal(sniff(png()).mime, 'image/png');
});

test('JPEG by SOI', () => {
  assert.equal(sniff(jpeg()).mime, 'image/jpeg');
});

test('both GIF versions', () => {
  assert.equal(sniff(pad(ascii('GIF87a'))).mime, 'image/gif');
  assert.equal(sniff(pad(ascii('GIF89a'))).mime, 'image/gif');
});

test('WebP needs both halves of its header', () => {
  assert.equal(sniff(webp([VP8_CHUNK])).mime, 'image/webp');
  // RIFF alone is a container format, not a picture: a WAV starts this way too.
  const wav = concat(ascii('RIFF'), u32le(36), ascii('WAVE'));
  assert.equal(sniff(pad(wav)), null);
});

test('BMP, and ICO by its zero-zero-one-zero', () => {
  assert.equal(sniff(pad(ascii('BM'))).mime, 'image/bmp');
  assert.equal(sniff(pad(bytes(0, 0, 1, 0, 1, 0))).mime, 'image/x-icon');
});

test('TIFF in both byte orders, with the warning attached', () => {
  for (const head of [bytes(0x49, 0x49, 0x2a, 0x00), bytes(0x4d, 0x4d, 0x00, 0x2a)]) {
    const hit = sniff(pad(head));
    assert.equal(hit.mime, 'image/tiff');
    // Valid URI, and nothing outside Safari will draw it. Saying so on the
    // page is the difference between a confusing bug and an explained one.
    assert.ok(hit.note);
  }
});

/* ---------------------------------------------------------- the ftyp family */

test('AVIF by its brand, wherever the brand sits', () => {
  assert.equal(sniff(pad(ftyp('avif', 'mif1', 'miaf'))).mime, 'image/avif');
  // Written by encoders that put a generic brand first and the real one after.
  assert.equal(sniff(pad(ftyp('mif1', 'avif'))).mime, 'image/avif');
});

test('HEIC is recognised and flagged as undrawable', () => {
  const hit = sniff(pad(ftyp('heic', 'mif1')));
  assert.equal(hit.mime, 'image/heic');
  assert.ok(hit.note);
});

test('an ftyp box shorter than it claims does not read past the end', () => {
  // The box says it is 64 bytes; only 16 arrived. Reading the declared length
  // would walk off the end of the array.
  const truncated = concat(u32be(64), ascii('ftyp'), ascii('avif'), u32be(0));
  assert.equal(sniff(truncated).mime, 'image/avif');
});

test('AVIF brands in extended-size ftyp boxes are read at their actual payload offsets', () => {
  const extended = concat(u32be(1), ascii('ftyp'), u32be(0), u32be(28),
    ascii('mif1'), u32be(0), ascii('avif'));
  assert.equal(sniff(extended).mime, 'image/avif');
  const sequence = concat(u32be(1), ascii('ftyp'), u32be(0), u32be(24), ascii('avis'), u32be(0));
  assert.equal(sniff(sequence).mime, 'image/avif');
});

test('the minor version is not an AVIF brand in either ftyp header form', () => {
  const standard = concat(u32be(16), ascii('ftyp'), ascii('qt  '), ascii('avif'));
  const extended = concat(u32be(1), ascii('ftyp'), u32be(0), u32be(24), ascii('qt  '), ascii('avif'));
  assert.equal(sniff(standard), null);
  assert.equal(sniff(extended), null);
});

test('AVIF words outside the declared ftyp bounds cannot override its type', () => {
  const after = concat(ftyp('qt  '), ascii('avif'));
  const tooShort = concat(u32be(8), ascii('ftyp'), ascii('avif'), u32be(0));
  const noVersion = concat(u32be(12), ascii('ftyp'), ascii('avif'));
  assert.equal(sniff(after), null);
  assert.equal(sniff(tooShort), null);
  assert.equal(sniff(noVersion), null);
});

test('partial and oversized extended ftyp headers are refused without guessing', () => {
  const partial = concat(u32be(1), ascii('ftyp'), u32be(0), u32be(28),
    ascii('qt  '), u32be(0), ascii('avi'));
  const oversized = concat(u32be(1), ascii('ftyp'), u32be(0x200000), u32be(1), ascii('avif'), u32be(0));
  assert.equal(sniff(partial), null);
  assert.equal(sniff(partial.subarray(0, 23)), null);
  assert.equal(sniff(oversized), null);
});

/* --------------------------------------------------------------------- SVG */

/** Real UTF-8, so a byte-order mark is the three bytes it actually is rather
 *  than whatever `ascii` makes of U+FEFF. */
const utf8 = (text) => new TextEncoder().encode(text);

test('SVG past whatever the drawing program left in front of it', () => {
  assert.ok(looksLikeSvg(ascii('<svg viewBox="0 0 1 1"/>')));
  assert.ok(looksLikeSvg(ascii('<?xml version="1.0"?>\n<svg/>')));
  assert.ok(looksLikeSvg(utf8('﻿<?xml version="1.0"?><!-- Generator: X --><svg/>')));
  assert.ok(looksLikeSvg(ascii('<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "x.dtd">\n<svg/>')));
  assert.equal(sniff(ascii('<svg/>')).mime, 'image/svg+xml');
});

test('XML that is not an SVG is not an SVG', () => {
  assert.equal(looksLikeSvg(ascii('<?xml version="1.0"?><rss/>')), false);
  assert.equal(looksLikeSvg(ascii('<html><body></body></html>')), false);
  // An unterminated comment is a broken file, not an SVG.
  assert.equal(looksLikeSvg(ascii('<!-- forever')), false);
});

/* ------------------------------------------------------------- the refusals */

test('an unrecognised file is refused rather than guessed at', () => {
  assert.equal(sniff(pad(ascii('not a picture at all'))), null);
  assert.equal(sniff(new Uint8Array(0)), null);
});

/* ------------------------------------------------------- names, for contrast */

test('extensionType reads the name, case and all', () => {
  assert.equal(extensionType('logo.PNG'), 'image/png');
  assert.equal(extensionType('holiday.jpeg'), 'image/jpeg');
  assert.equal(extensionType('icon.svg'), 'image/svg+xml');
  assert.equal(extensionType('archive.tar.gz'), null);
  assert.equal(extensionType('no-extension'), null);
});

test('the bytes and the name can disagree, which is the point of having both', () => {
  // A JPEG somebody renamed. The tool follows the bytes and says so; following
  // the name would produce a URI that renders nowhere.
  const renamed = jpeg();
  assert.equal(sniff(renamed).mime, 'image/jpeg');
  assert.equal(extensionType('holiday.png'), 'image/png');
});


const utf16Svg = (source, bigEndian, bom) => {
  const bytes = new Uint8Array(source.length * 2 + (bom ? 2 : 0));
  if (bom) bytes.set(bigEndian ? [254, 255] : [255, 254]);
  for (let index = 0; index < source.length; index += 1) {
    const code = source.charCodeAt(index), at = index * 2 + (bom ? 2 : 0);
    bytes[at] = bigEndian ? code >> 8 : code & 255;
    bytes[at + 1] = bigEndian ? code & 255 : code >> 8;
  }
  return bytes;
};

test('SVG detection recognizes both UTF-16 orders with or without a BOM', () => {
  const source = '<?xml version="1.0" encoding="UTF-16"?><!-- saved by a drawing tool --><svg><text>café 😀</text></svg>';
  for (const bigEndian of [false, true]) for (const bom of [false, true]) {
    assert.equal(sniff(utf16Svg(source, bigEndian, bom)).mime, 'image/svg+xml');
    assert.equal(sniff(utf16Svg('<?xml version="1.0"?><rss/>', bigEndian, bom)), null);
  }
});

test('a root name beginning with svg is not an SVG root', () => {
  for (const source of ['<svg-not-a-picture/>', '<svgfoo/>']) {
    assert.equal(sniff(utf8(source)), null);
    assert.equal(sniff(utf16Svg(source, false, true)), null);
  }
});
