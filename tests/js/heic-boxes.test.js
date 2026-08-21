/**
 * tools/heic-to-jpg/src/boxes.js - the HEIF container reader.
 *
 * Two questions are asked of a file dropped on that tool, and both are answered
 * here rather than by the vendored decoder: is this actually a HEIC, and where
 * is the EXIF block. The decode itself is a megabyte of somebody else's
 * compiled C and is not what these tests are about.
 *
 * The fixtures are built out of the same box primitives the format is made of,
 * so what is being asserted is visible in the test rather than hidden in a
 * checked-in binary. `iloc` offsets are absolute offsets into the file, which is
 * why `heic()` below assembles the container twice: once to find out how long
 * the front of it is, and once with the real numbers in it.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { heifBrand, isAvif, readExif } from '../../tools/heic-to-jpg/src/boxes.js';
import {
  ascii, concat, jpeg as makeJpeg, png as makePng, u16be, u32be,
} from './helpers.js';

/* ------------------------------------------------------------------ boxes */

const box = (type, ...payload) => {
  const body = concat(...payload);
  return concat(u32be(8 + body.length), ascii(type), body);
};

/** A "full box": a version byte and three flag bytes before the payload. */
const fullBox = (type, version, ...payload) =>
  box(type, [version, 0, 0, 0], ...payload);

const ftyp = (major, ...compatible) =>
  box('ftyp', ascii(major), u32be(0), ...compatible.map(ascii));

/** One `infe`, version 2: the entry that gives an item its four-character type. */
const infe = (id, type) =>
  fullBox('infe', 2, u16be(id), u16be(0), ascii(type), [0]);

const iinf = (...entries) =>
  fullBox('iinf', 0, u16be(entries.length), ...entries);

/** `iloc` version 1, with 4-byte offsets and lengths and no base offset. */
const iloc = (items) => fullBox(
  'iloc', 1,
  [0x44, 0x00], // offset_size 4, length_size 4; base_offset_size 0, index_size 0
  u16be(items.length),
  ...items.map((item) => concat(
    u16be(item.id),
    u16be(item.inIdat ? 1 : 0), // twelve reserved bits, then construction_method
    u16be(0), // data_reference_index: this file
    u16be(1), // one extent
    u32be(item.offset),
    u32be(item.length),
  )),
);

/** `iref` with one `cdsc`: "this item is the metadata for that picture". */
const iref = (from, to) =>
  fullBox('iref', 0, box('cdsc', u16be(from), u16be(1), u16be(to)));

/** The four-byte header HEIF puts in front of the TIFF block in an Exif item. */
const exifItem = (tiff) => concat(u32be(0), tiff);

/**
 * A HEIC holding whatever items are asked for.
 *
 * @param {object} options
 * @param {{id: number, type: string, data: Uint8Array}[]} options.items
 * @param {number} [options.primary] which item id `pitm` names
 * @param {[number, number][]} [options.describes] cdsc links, [from, to]
 * @param {boolean} [options.inIdat] store the items in `idat` rather than `mdat`
 * @param {string} [options.brand]
 */
function heic({ items, primary = 1, describes = [], inIdat = false, brand = 'heic' }) {
  const payload = concat(...items.map((item) => item.data));

  // Where each item's bytes will sit, relative to the start of whichever box
  // ends up holding them.
  const places = [];
  let at = 0;
  for (const item of items) {
    places.push({ id: item.id, offset: at, length: item.data.length, inIdat });
    at += item.data.length;
  }

  const build = (shift) => {
    const meta = fullBox(
      'meta', 0,
      fullBox('pitm', 0, u16be(primary)),
      iinf(...items.map((item) => infe(item.id, item.type))),
      ...describes.map(([from, to]) => iref(from, to)),
      iloc(places.map((place) => ({ ...place, offset: place.offset + shift }))),
      ...(inIdat ? [box('idat', payload)] : []),
    );
    return concat(ftyp(brand, 'mif1', brand), meta, inIdat ? [] : box('mdat', payload));
  };

  if (inIdat) {
    // Offsets are into the idat box's payload, so they need no shifting at all
    // - and the box is inside the meta box whose length they would change.
    return build(0);
  }

  // Two passes. The offsets are absolute, so they depend on how long everything
  // in front of `mdat` turns out to be, which depends on the offsets.
  const draft = build(0);
  return build(draft.length - payload.length);
}

/** A minimal but real TIFF block: byte order, 42, one IFD with one entry. */
const TIFF = concat(
  ascii('MM'), u16be(42), u32be(8),
  u16be(1),
  u16be(0x010f), u16be(2), u32be(5), u32be(26),
  u32be(0),
  ascii('Acme\0'),
);

/* ============================================================== heifBrand */

test('heifBrand: the brands a phone writes', () => {
  assert.equal(heifBrand(ftyp('heic', 'mif1', 'heic')), 'heic');
  assert.equal(heifBrand(ftyp('mif1', 'heic')), 'mif1');
  assert.equal(heifBrand(ftyp('heix', 'mif1')), 'heix');
  assert.equal(heifBrand(ftyp('msf1', 'hevc')), 'msf1');
});

test('heifBrand: a compatible brand counts, not just the major one', () => {
  // Some writers put a generic major brand up front and name the real one
  // further down the list. Reading only the first four characters misses them.
  assert.equal(heifBrand(ftyp('iso8', 'mif1')), 'mif1');
});

test('heifBrand: the minor version is a number, not a brand', () => {
  // The four bytes after the major brand are a version. If they happened to
  // spell "heic" and were read as a brand, a file that is not a HEIC would be
  // accepted as one.
  const faked = box('ftyp', ascii('qt  '), ascii('heic'), ascii('avc1'));
  assert.equal(heifBrand(faked), null);
});

test('heifBrand: an AVIF is not a HEIF, whatever else it says it is', () => {
  // AVIF and HEIC are the same container, and an AVIF routinely names `mif1`
  // among its compatible brands. A brand list scanned in file order would call
  // this one a HEIF and hand it to the decoder.
  assert.equal(heifBrand(ftyp('avif', 'mif1', 'miaf')), null);
  assert.equal(heifBrand(ftyp('mif1', 'avif')), null);
});

test('heifBrand: anything that is not one', () => {
  assert.equal(heifBrand(makeJpeg([])), null);
  assert.equal(heifBrand(makePng([])), null);
  assert.equal(heifBrand(ftyp('avif', 'mif1')), null);
  assert.equal(heifBrand(new Uint8Array(0)), null);
  assert.equal(heifBrand(ascii('not a file at all')), null);
});

test('heifBrand: a truncated file stops the walk rather than throwing', () => {
  // Files do arrive half-copied. "This does not look like a HEIC" is a better
  // thing to tell somebody than a stack trace.
  const whole = heic({ items: [{ id: 1, type: 'hvc1', data: ascii('picture') }] });
  for (const cut of [3, 7, 12, 20, whole.length - 1]) {
    assert.doesNotThrow(() => heifBrand(whole.subarray(0, cut)));
  }
});

/* ================================================================== isAvif */

test('isAvif: the container this tool refuses on purpose', () => {
  assert.equal(isAvif(ftyp('avif', 'mif1')), true);
  assert.equal(isAvif(ftyp('mif1', 'avif')), true);
  assert.equal(isAvif(ftyp('heic', 'mif1')), false);
  assert.equal(isAvif(makeJpeg([])), false);
});

/* ================================================================ readExif */

test('readExif: the TIFF block out of an Exif item', () => {
  const file = heic({
    items: [
      { id: 1, type: 'hvc1', data: ascii('the picture bytes') },
      { id: 2, type: 'Exif', data: exifItem(TIFF) },
    ],
  });

  const found = readExif(file);
  assert.ok(found, 'the Exif item was not found');
  // The four-byte HEIF header in front of the block is skipped, so what comes
  // back begins at the byte-order mark and can be written into a JPEG as it is.
  assert.deepEqual(found, TIFF);
});

test('readExif: both byte orders', () => {
  const little = concat(
    ascii('II'), new Uint8Array([0x2a, 0x00]), new Uint8Array([8, 0, 0, 0]),
    new Uint8Array([0, 0, 0, 0, 0, 0]),
  );
  const file = heic({ items: [{ id: 1, type: 'Exif', data: exifItem(little) }] });
  assert.deepEqual(readExif(file), little);
});

test('readExif: a file with no metadata in it', () => {
  const file = heic({ items: [{ id: 1, type: 'hvc1', data: ascii('picture') }] });
  assert.equal(readExif(file), null);
});

test('readExif: an item stored in idat rather than mdat', () => {
  const file = heic({
    inIdat: true,
    items: [{ id: 1, type: 'Exif', data: exifItem(TIFF) }],
  });
  assert.deepEqual(readExif(file), TIFF);
});

test('readExif: the block belonging to the primary picture', () => {
  // A burst holds several pictures and several Exif items. Without the cdsc
  // link there is no way to tell which describes which beyond hoping they were
  // written in order - so the link is what is followed, and here the file is
  // deliberately written out of order to prove it.
  const other = concat(ascii('MM'), u16be(42), u32be(8), u16be(0), u32be(0));

  const file = heic({
    primary: 2,
    items: [
      { id: 1, type: 'hvc1', data: ascii('first picture') },
      { id: 2, type: 'hvc1', data: ascii('second picture') },
      { id: 3, type: 'Exif', data: exifItem(other) },
      { id: 4, type: 'Exif', data: exifItem(TIFF) },
    ],
    describes: [[3, 1], [4, 2]],
  });

  assert.deepEqual(readExif(file), TIFF);
});

test('readExif: one Exif item and no reference is used anyway', () => {
  // The common case by a very long way, and there is nothing to be ambiguous
  // about in it.
  const file = heic({
    items: [
      { id: 1, type: 'hvc1', data: ascii('picture') },
      { id: 2, type: 'Exif', data: exifItem(TIFF) },
    ],
    describes: [],
  });
  assert.deepEqual(readExif(file), TIFF);
});

test('readExif: an item that lies past the bytes given is not read', () => {
  // The file list reads only the first 256 KB of each photo. A block further in
  // than that must come back as "nothing found" rather than as a slice of
  // whatever happened to be at that offset.
  const file = heic({
    items: [
      { id: 1, type: 'hvc1', data: new Uint8Array(4096) },
      { id: 2, type: 'Exif', data: exifItem(TIFF) },
    ],
  });
  assert.equal(readExif(file.subarray(0, file.length - 2048)), null);
});

test('readExif: junk is refused rather than parsed', () => {
  assert.equal(readExif(makeJpeg([])), null);
  assert.equal(readExif(new Uint8Array(0)), null);
  assert.equal(readExif(ascii('ftyp but not really')), null);
});
