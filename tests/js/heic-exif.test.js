/**
 * tools/heic-to-jpg/src/exif.js and src/files.js.
 *
 * exif.js does two things to the metadata block on its way out of a HEIC and
 * into a JPEG: it says what is in there, so that "keep the photo details" is a
 * choice made knowing whether the details include somebody's home address, and
 * it sets the orientation tag to 1.
 *
 * That second one is the reason most of this file exists. libheif applies the
 * container's rotation while decoding, so the pixels are already the right way
 * up; a block copied across untouched would tell the viewer to turn the picture
 * again, and every portrait photo would come out on its side. It is a two-byte
 * change that is invisible until somebody opens their photos a week later, which
 * is exactly the kind of thing worth pinning down here.
 *
 * The blocks are built rather than checked in, so a reader can see which tag is
 * where. Both byte orders are exercised throughout: Apple writes big-endian and
 * most Android phones write little-endian, and both turn up in HEICs.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  describeExif, fitsInJpeg, uprightExif, withExif,
} from '../../tools/heic-to-jpg/src/exif.js';
import {
  metadataText, outName, uniqueNames,
} from '../../tools/heic-to-jpg/src/files.js';
import { readBytes } from '../../tools/exif-editor/src/container.js';
import {
  ascii, concat, indexOfBytes, jpeg as makeJpeg, JFIF_SEGMENT, u16be, u32be,
} from './helpers.js';

/**
 * The stand-in for phrase(). What the row says lives in body.html now, in
 * fifteen languages; the order of the parts is what this file is about, and
 * the join is a phrase of its own, so it is resolved for real here.
 */
const say = (key, values = {}) => (
  key === 'join.dot' ? `${values.a} | ${values.b}`
    : [key, ...Object.values(values)].join(' '));

/* ------------------------------------------------------------- a TIFF block */

const ASCII = 2;
const SHORT = 3;
const LONG = 4;

const ENTRY = 12;
const IFD_SIZE = (count) => 2 + count * ENTRY + 4;

/**
 * Build a TIFF block with the tags these tests care about.
 *
 * The layout is fixed and computed here rather than hard-coded, because the
 * whole point of a TIFF is that everything past the first eight bytes is found
 * through an offset:
 *
 *     header   IFD0   [IFD1]   [Exif IFD]   [GPS IFD]   strings
 */
function tiff({
  little = true, make = null, orientation = null,
  date = null, gps = null, thumbOrientation = null,
} = {}) {
  const u16 = (n) => (little
    ? new Uint8Array([n & 0xff, (n >> 8) & 0xff])
    : u16be(n));
  const u32 = (n) => (little
    ? new Uint8Array([n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, (n >>> 24) & 0xff])
    : u32be(n));

  // A SHORT sits in the first two bytes of the four-byte value field, whichever
  // end the number itself goes in.
  const entry = (tag, type, count, value) =>
    concat(u16(tag), u16(type), u32(count), value);
  const shortValue = (n) => concat(u16(n), [0, 0]);

  const makeText = make === null ? null : ascii(`${make}\0`);
  const dateText = date === null ? null : ascii(`${date}\0`);

  // Where everything lands. IFD0 is counted first because its own size depends
  // on how many of these tags were asked for.
  const ifd0Count = [make, orientation, date, gps].filter((v) => v !== null).length;
  let at = 8 + IFD_SIZE(ifd0Count);

  const ifd1At = thumbOrientation === null ? 0 : at;
  if (thumbOrientation !== null) at += IFD_SIZE(1);

  const exifAt = date === null ? 0 : at;
  if (date !== null) at += IFD_SIZE(1);

  const gpsAt = gps === null ? 0 : at;
  if (gps !== null) at += IFD_SIZE(gps);

  const makeAt = at;
  if (makeText) at += makeText.length;
  const dateAt = at;

  const ifd0 = [];
  if (make !== null) ifd0.push(entry(0x010f, ASCII, makeText.length, u32(makeAt)));
  if (orientation !== null) ifd0.push(entry(0x0112, SHORT, 1, shortValue(orientation)));
  if (date !== null) ifd0.push(entry(0x8769, LONG, 1, u32(exifAt)));
  if (gps !== null) ifd0.push(entry(0x8825, LONG, 1, u32(gpsAt)));

  return concat(
    little ? ascii('II') : ascii('MM'),
    little ? new Uint8Array([0x2a, 0x00]) : new Uint8Array([0x00, 0x2a]),
    u32(8),

    u16(ifd0.length), ...ifd0, u32(ifd1At),

    thumbOrientation === null ? [] : concat(
      u16(1), entry(0x0112, SHORT, 1, shortValue(thumbOrientation)), u32(0),
    ),

    date === null ? [] : concat(
      u16(1), entry(0x9003, ASCII, dateText.length, u32(dateAt)), u32(0),
    ),

    gps === null ? [] : concat(
      u16(gps),
      // Whatever these say does not matter: the tool reports that coordinates
      // are present, and never reads them.
      ...Array.from({ length: gps }, () => entry(0x0001, ASCII, 2, ascii('N\0\0\0'))),
      u32(0),
    ),

    makeText ?? [],
    dateText ?? [],
  );
}

/** The orientation value in IFD0, read back independently of exif.js. */
function orientationOf(block) {
  const little = block[0] === 0x49;
  const view = new DataView(block.buffer, block.byteOffset, block.byteLength);
  const count = view.getUint16(8, little);
  for (let i = 0; i < count; i += 1) {
    const at = 10 + i * ENTRY;
    if (view.getUint16(at, little) === 0x0112) return view.getUint16(at + 8, little);
  }
  return null;
}

/* ============================================================ describeExif */

test('describeExif: nothing to describe', () => {
  assert.equal(describeExif(null).present, false);
  assert.equal(describeExif(new Uint8Array(4)).present, false);
  // Not a TIFF at all: the byte-order mark is wrong.
  assert.equal(describeExif(ascii('XX\0\0\0\0\0\0')).present, false);
});

test('describeExif: the camera and the date, both byte orders', () => {
  for (const little of [true, false]) {
    const found = describeExif(tiff({
      little, make: 'Apple', date: '2026:08:20 14:03:11', orientation: 6,
    }));
    assert.equal(found.present, true, `little=${little}`);
    assert.equal(found.camera, 'Apple');
    // EXIF writes colons in the date. The page shows something a person reads.
    assert.equal(found.taken, '2026-08-20 14:03');
    assert.equal(found.gps, false);
  }
});

test('describeExif: coordinates are reported only when there are some', () => {
  // A GPS directory with no entries in it is what a phone leaves behind when
  // location is off. Reporting that as "this photo has GPS" would be a lie
  // people would then act on.
  assert.equal(describeExif(tiff({ gps: 0 })).gps, false);
  assert.equal(describeExif(tiff({ gps: 3 })).gps, true);
});

test('describeExif: a block that is nothing but a header', () => {
  const bare = tiff();
  const found = describeExif(bare);
  assert.equal(found.present, true);
  assert.equal(found.camera, '');
  assert.equal(found.taken, '');
  assert.equal(found.bytes, bare.length);
});

/* ============================================================== uprightExif */

test('uprightExif: the orientation tag is set to 1', () => {
  for (const little of [true, false]) {
    for (const was of [2, 3, 5, 6, 8]) {
      const block = tiff({ little, orientation: was, make: 'Apple' });
      assert.equal(orientationOf(block), was);
      assert.equal(orientationOf(uprightExif(block)), 1);
    }
  }
});

test('uprightExif: the thumbnail is turned the right way up as well', () => {
  // IFD1 carries its own orientation. Missing it is how a picture comes out
  // upright and its own thumbnail comes out sideways in a file manager.
  const block = tiff({ orientation: 6, thumbOrientation: 6 });
  const upright = uprightExif(block);

  const view = new DataView(upright.buffer);
  const ifd1At = view.getUint32(8 + IFD_SIZE(1) - 4, true);
  assert.ok(ifd1At > 0, 'the fixture has no second directory');
  assert.equal(view.getUint16(ifd1At + 2 + 8, true), 1);
});

test('uprightExif: the block handed in is not touched', () => {
  // It is a view onto the file the visitor chose. Patching that would mean the
  // second conversion of the same file saw different metadata from the first.
  const block = tiff({ orientation: 6 });
  const before = block.slice();
  uprightExif(block);
  assert.deepEqual(block, before);
});

test('uprightExif: everything else in the block is left alone', () => {
  const block = tiff({ make: 'Apple', orientation: 6, date: '2026:08:20 14:03:11' });
  const upright = uprightExif(block);

  assert.equal(upright.length, block.length, 'the block changed size');
  assert.deepEqual(describeExif(upright).camera, 'Apple');
  assert.deepEqual(describeExif(upright).taken, '2026-08-20 14:03');

  // Two bytes differ, and they are the two the tag sits in.
  const differ = [...block].filter((byte, at) => byte !== upright[at]).length;
  assert.equal(differ, 1, 'more than the orientation value changed');
});

test('uprightExif: a block with no orientation in it survives unchanged', () => {
  const block = tiff({ make: 'Apple' });
  assert.deepEqual(uprightExif(block), block);
});

/* ================================================================= withExif */

test('withExif: the block goes in as an APP1 segment after the start marker', () => {
  const block = tiff({ make: 'Apple' });
  const out = withExif(makeJpeg([]), block);

  assert.deepEqual(out.subarray(0, 2), new Uint8Array([0xff, 0xd8]));
  assert.deepEqual(out.subarray(2, 4), new Uint8Array([0xff, 0xe1]));

  const length = (out[4] << 8) | out[5];
  assert.equal(length, 2 + 6 + block.length, 'the segment length is wrong');
  assert.deepEqual(out.subarray(6, 12), ascii('Exif\0\0'));
  assert.deepEqual(out.subarray(12, 12 + block.length), block);
});

test('withExif: an APP0 written by the encoder keeps its place', () => {
  // Safari's canvas writes a JFIF APP0 and Chrome's does not. Both orders are
  // legal, but APP0-then-APP1 is what every camera writes and therefore the
  // order every reader has been tested against.
  const out = withExif(makeJpeg([JFIF_SEGMENT]), tiff({ make: 'Apple' }));

  assert.deepEqual(out.subarray(2, 4), new Uint8Array([0xff, 0xe0]));
  const app1At = 2 + JFIF_SEGMENT.length;
  assert.deepEqual(out.subarray(app1At, app1At + 2), new Uint8Array([0xff, 0xe1]));
});

test('withExif: the picture itself is copied byte for byte', () => {
  const scan = ascii('THE ACTUAL PICTURE');
  const out = withExif(makeJpeg([], scan), tiff({ make: 'Apple' }));
  assert.ok(indexOfBytes(out, scan) > 0, 'the scan did not survive');
});

test('withExif: something that is not a JPEG is handed back untouched', () => {
  const notJpeg = ascii('this is not a JPEG at all');
  assert.deepEqual(withExif(notJpeg, tiff({})), notJpeg);
});

test('fitsInJpeg: the segment limit', () => {
  // A segment's length field is two bytes and counts itself, so an APP1 payload
  // has 65533 bytes including the "Exif\0\0" in front of the block.
  assert.equal(fitsInJpeg(new Uint8Array(65535 - 2 - 6)), true);
  assert.equal(fitsInJpeg(new Uint8Array(65535 - 2 - 6 + 1)), false);
});

/* ------------------------------- read back by the site's own EXIF reader ---
 *
 * The converter writes an APP1 segment; the EXIF tool next door reads them.
 * Checking one against the other closes the loop without either of them having
 * to trust an assertion about the format: if what is written here is not a
 * segment a real reader accepts, this fails.
 */

test('the JPEG this writes is one the EXIF tool can read back', async () => {
  const block = tiff({ make: 'Apple', orientation: 6, date: '2026:08:20 14:03:11' });
  const out = withExif(makeJpeg([JFIF_SEGMENT]), uprightExif(block));

  const item = await readBytes(out);
  assert.equal(item.ok, true, item.error);
  assert.equal(item.kind, 'jpeg');
  assert.equal(item.exif.ok, true, item.exif?.error);

  const ifd0 = item.exif.groups.ifd0;
  assert.equal(ifd0.find((entry) => entry.tag === 0x010f).value, 'Apple');
  // The whole point of uprightExif, seen from the other end: a reader is told
  // the picture is already the right way up.
  assert.equal(ifd0.find((entry) => entry.tag === 0x0112).value, 1);
  assert.equal(
    item.exif.groups.exif.find((entry) => entry.tag === 0x9003).value,
    '2026:08:20 14:03:11',
  );
});

/* ==================================================== names and description */

test('outName: the stem is kept and only the extension changes', () => {
  assert.equal(outName('IMG_4021.HEIC', 'image/jpeg'), 'IMG_4021.jpg');
  assert.equal(outName('IMG_4021.heic', 'image/png'), 'IMG_4021.png');
  assert.equal(outName('IMG_4021.heic', 'image/webp'), 'IMG_4021.webp');
  // A file with no extension, and a name that is nothing but one.
  assert.equal(outName('holiday', 'image/jpeg'), 'holiday.jpg');
  assert.equal(outName('.heic', 'image/jpeg'), 'image.jpg');
});

test('outName: the second picture in one file is numbered', () => {
  assert.equal(outName('IMG_4021.heic', 'image/jpeg', 0), 'IMG_4021.jpg');
  assert.equal(outName('IMG_4021.heic', 'image/jpeg', 1), 'IMG_4021-2.jpg');
  assert.equal(outName('IMG_4021.heic', 'image/jpeg', 4), 'IMG_4021-5.jpg');
});

test('uniqueNames: two folders can hold two IMG_0001.HEIC', () => {
  // A zip with two entries of the same name unpacks to one file on every
  // platform, so this is the difference between getting twenty photos back and
  // getting nineteen.
  assert.deepEqual(
    uniqueNames(['a.jpg', 'b.jpg', 'a.jpg', 'a.jpg']),
    ['a.jpg', 'b.jpg', 'a-2.jpg', 'a-3.jpg'],
  );
});

test('uniqueNames: the suffix does not collide with a name already used', () => {
  assert.deepEqual(
    uniqueNames(['a.jpg', 'a-2.jpg', 'a.jpg']),
    ['a.jpg', 'a-2.jpg', 'a-3.jpg'],
  );
});

test('metadataText: what the row says about a photo', () => {
  assert.equal(
    metadataText({ present: false, camera: '', taken: '', gps: false }, say),
    'meta.none',
  );
  // Coordinates first: it is the only part somebody might act on.
  assert.equal(
    metadataText({ present: true, camera: 'Apple iPhone 15', taken: '2026-08-20 14:03', gps: true },
      say),
    'meta.gps | 2026-08-20 14:03 | Apple iPhone 15',
  );
  assert.equal(
    metadataText({ present: true, camera: '', taken: '', gps: false }, say),
    'meta.nothing',
  );
});
