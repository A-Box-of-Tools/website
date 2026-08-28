/**
 * tools/exif-editor/src/tiff.js.
 *
 * The rule the file is built on is "a tag nobody edited is written back byte
 * for byte from the bytes it was read as", so most of these tests are round
 * trips: parse, serialise, parse again, and check that what came back is what
 * went in. That is the property that keeps values this tool does not
 * understand exactly as the camera wrote them.
 *
 * The rest are the things a malformed file could do: an IFD pointing at
 * itself, a count that runs off the end of the block, a type nobody has heard
 * of. None of them may hang the page or read past the buffer.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  GROUP_ORDER, TYPE, createEntry, isEdited, parseExif, serializeExif, setEntryValue,
} from '../../tools/exif-editor/src/tiff.js';
import { TIFF_BE, TIFF_LE, concat, u32le } from './helpers.js';

const MAKE = 0x010f;
const ORIENTATION = 0x0112;
const X_RESOLUTION = 0x011a;
const USER_COMMENT = 0x9286;
const XP_TITLE = 0x9c9b;

const tag = (group, id) => group.find((e) => e.tag === id);
const values = (group) => Object.fromEntries(group.map((e) => [e.tag, e.value]));

/** Parse a model, serialise it, and parse the result. */
function roundTrip(model) {
  const bytes = serializeExif(model);
  assert.ok(bytes, 'serialising produced nothing');
  const back = parseExif(bytes);
  assert.equal(back.ok, true, back.error);
  return back;
}

/* -------------------------------------------------------------- reading */

test('a hand-written little-endian block', () => {
  const parsed = parseExif(TIFF_LE);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.littleEndian, true);
  assert.deepEqual(values(parsed.groups.ifd0), { [MAKE]: 'Acme', [ORIENTATION]: 6 });
});

test('a hand-written big-endian block reads the same', () => {
  const parsed = parseExif(TIFF_BE);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.littleEndian, false);
  assert.deepEqual(values(parsed.groups.ifd0), { [MAKE]: 'Acme', [ORIENTATION]: 6 });
});

test('every group exists even when empty', () => {
  const parsed = parseExif(TIFF_LE);
  for (const group of GROUP_ORDER) {
    assert.ok(Array.isArray(parsed.groups[group]), group);
  }
  assert.equal(parsed.thumbnail, null);
});

test('an entry keeps the bytes it was read as', () => {
  const entry = tag(parseExif(TIFF_LE).groups.ifd0, MAKE);
  assert.deepEqual(entry.raw, new Uint8Array([0x41, 0x63, 0x6d, 0x65, 0x00]));
  assert.equal(entry.type, TYPE.ASCII);
  assert.equal(entry.count, 5);
  assert.equal(entry.edited, undefined);
});

test('a short value read from inside its own entry', () => {
  const entry = tag(parseExif(TIFF_LE).groups.ifd0, ORIENTATION);
  assert.equal(entry.type, TYPE.SHORT);
  assert.equal(entry.raw.length, 2, 'four bytes or fewer sit in the entry');
});

/* ------------------------------------------------------- reading badly */

test('a block that is too short', () => {
  const parsed = parseExif(new Uint8Array(4));
  assert.equal(parsed.ok, false);
  assert.equal(parsed.error, 'read.exifshort');
});

test('nothing at all', () => {
  assert.equal(parseExif(null).ok, false);
  assert.equal(parseExif(new Uint8Array(0)).ok, false);
});

test('no byte-order mark', () => {
  const bytes = TIFF_LE.slice();
  bytes[0] = 0x58;
  bytes[1] = 0x58;
  assert.equal(parseExif(bytes).error, 'read.exifnobom');
});

test('the wrong magic number', () => {
  const bytes = TIFF_LE.slice();
  bytes[2] = 43;
  assert.equal(parseExif(bytes).error, 'read.exifmagic');
});

test('a first directory offset pointing outside the block', () => {
  const bytes = TIFF_LE.slice();
  bytes.set(u32le(9999), 4);
  const parsed = parseExif(bytes);
  assert.equal(parsed.ok, false);
  // "unreadable" and "no tags" are different claims, and the caller needs the
  // first one.
  assert.equal(parsed.error, 'read.exifoffset');
});

test('an entry whose count runs off the end is skipped, not read', () => {
  const bytes = TIFF_LE.slice();
  bytes.set(u32le(0xffff), 0x0a + 4); // Make's count
  const parsed = parseExif(bytes);
  assert.equal(parsed.ok, true);
  assert.equal(tag(parsed.groups.ifd0, MAKE), undefined);
  assert.equal(tag(parsed.groups.ifd0, ORIENTATION).value, 6, 'the rest still reads');
});

test('an unknown type is skipped', () => {
  const bytes = TIFF_LE.slice();
  bytes[0x0a + 2] = 99; // Make's type
  const parsed = parseExif(bytes);
  assert.equal(parsed.ok, true);
  assert.equal(tag(parsed.groups.ifd0, MAKE), undefined);
});

test('an IFD pointing at itself does not hang', () => {
  // A malformed file can point one directory at another in a loop; visited
  // offsets are remembered so a corrupt photo cannot hang the page.
  const bytes = TIFF_LE.slice();
  bytes.set(u32le(8), 0x22); // "next IFD" points back at IFD0
  const parsed = parseExif(bytes);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.groups.ifd1.length, 0);
});

/* ------------------------------------------------- pointers and thumbnails */

test('a sub-directory is followed and its pointer tag is not shown', () => {
  const model = {
    littleEndian: true,
    groups: {
      ifd0: [createEntry(MAKE, TYPE.ASCII, 'Acme', true)],
      exif: [createEntry(0x829a, TYPE.RATIONAL, '0.005', true)],
      gps: [], interop: [], ifd1: [],
    },
  };
  const back = roundTrip(model);
  assert.equal(back.groups.exif.length, 1);
  // 0x8769 and 0x8825 are bookkeeping this file rewrites, never content.
  assert.equal(tag(back.groups.ifd0, 0x8769), undefined);
  assert.equal(tag(back.groups.ifd0, 0x8825), undefined);
});

test('an interop directory is reached through the exif one', () => {
  const model = {
    littleEndian: true,
    groups: {
      ifd0: [], exif: [], gps: [], ifd1: [],
      interop: [createEntry(0x0001, TYPE.ASCII, 'R98', true)],
    },
  };
  const back = roundTrip(model);
  assert.equal(back.groups.interop.length, 1);
  assert.equal(tag(back.groups.interop, 0x0001).value, 'R98');
});

test('a gps directory survives a round trip', () => {
  const model = {
    littleEndian: true,
    groups: {
      ifd0: [], exif: [], interop: [], ifd1: [],
      gps: [
        createEntry(0x0001, TYPE.ASCII, 'N', true),
        createEntry(0x0002, TYPE.RATIONAL, '51 30 26', true),
      ],
    },
  };
  const back = roundTrip(model);
  assert.equal(tag(back.groups.gps, 0x0001).value, 'N');
  assert.deepEqual(tag(back.groups.gps, 0x0002).value, [51, 30, 26]);
});

test('a thumbnail is lifted out and put back', () => {
  const thumbnail = new Uint8Array([0xff, 0xd8, 1, 2, 3, 4, 0xff, 0xd9]);
  const model = {
    littleEndian: true,
    thumbnail,
    groups: { ifd0: [], exif: [], gps: [], interop: [], ifd1: [] },
  };
  const back = roundTrip(model);
  assert.deepEqual(back.thumbnail, thumbnail);
  // The two tags that say where it lives are rewritten, never copied.
  assert.equal(tag(back.groups.ifd1, 0x0201), undefined);
  assert.equal(tag(back.groups.ifd1, 0x0202), undefined);
});

/* -------------------------------------------------------------- writing */

test('an empty model serialises to nothing', () => {
  // Which is what "remove everything" produces, and the caller's signal to
  // drop the wrapper rather than write an empty one.
  const empty = { groups: { ifd0: [], exif: [], gps: [], interop: [], ifd1: [] } };
  assert.equal(serializeExif(empty), null);
  assert.equal(serializeExif({ groups: {} }), null);
});

test('the round trip preserves untouched entries byte for byte', () => {
  const parsed = parseExif(TIFF_LE);
  const before = tag(parsed.groups.ifd0, MAKE).raw;
  const back = roundTrip(parsed);
  assert.deepEqual(tag(back.groups.ifd0, MAKE).raw, before);
});

test('the round trip is stable', () => {
  const once = serializeExif(parseExif(TIFF_LE));
  const twice = serializeExif(parseExif(once));
  assert.deepEqual(twice, once);
});

test('byte order is carried through', () => {
  const fromBig = serializeExif(parseExif(TIFF_BE));
  assert.equal(parseExif(fromBig).littleEndian, false);
  const fromLittle = serializeExif(parseExif(TIFF_LE));
  assert.equal(parseExif(fromLittle).littleEndian, true);
});

test('little-endian is the default when the model does not say', () => {
  const model = {
    groups: { ifd0: [createEntry(MAKE, TYPE.ASCII, 'X', true)], exif: [], gps: [], interop: [], ifd1: [] },
  };
  assert.equal(parseExif(serializeExif(model)).littleEndian, true);
});

test('entries are written in ascending tag order', () => {
  // Some readers do a binary search and quietly miss tags that are out of
  // order.
  const model = {
    littleEndian: true,
    groups: {
      ifd0: [
        createEntry(ORIENTATION, TYPE.SHORT, '1', true),
        createEntry(MAKE, TYPE.ASCII, 'Acme', true),
        createEntry(0x0100, TYPE.LONG, '640', true),
      ],
      exif: [], gps: [], interop: [], ifd1: [],
    },
  };
  const written = roundTrip(model).groups.ifd0.map((e) => e.tag);
  assert.deepEqual(written, [...written].sort((a, b) => a - b));
});

test('a value longer than four bytes lands outside its entry and comes back', () => {
  const long = 'a name far too long to sit inside a twelve byte entry';
  const model = {
    littleEndian: true,
    groups: {
      ifd0: [createEntry(MAKE, TYPE.ASCII, long, true)],
      exif: [], gps: [], interop: [], ifd1: [],
    },
  };
  assert.equal(tag(roundTrip(model).groups.ifd0, MAKE).value, long);
});

test('directory offsets are even', () => {
  // TIFF offsets are word-aligned and readers that assume it are common.
  const model = {
    littleEndian: true,
    groups: {
      // An odd-length value forces the padding path.
      ifd0: [createEntry(MAKE, TYPE.ASCII, 'odd', true)],
      exif: [createEntry(0x9000, TYPE.UNDEFINED, '0231', true)],
      gps: [], interop: [], ifd1: [],
    },
  };
  const bytes = serializeExif(model);
  const view = new DataView(bytes.buffer);
  assert.equal(view.getUint32(4, true) % 2, 0, 'IFD0 offset');
});

/* -------------------------------------------------------------- editing */

test('setEntryValue re-encodes and marks the entry', () => {
  const parsed = parseExif(TIFF_LE);
  const entry = tag(parsed.groups.ifd0, MAKE);
  assert.equal(isEdited(parsed), false);

  assert.equal(setEntryValue(entry, 'Other', true), true);
  assert.equal(entry.value, 'Other');
  assert.equal(entry.edited, true);
  assert.equal(isEdited(parsed), true);
  assert.equal(tag(roundTrip(parsed).groups.ifd0, MAKE).value, 'Other');
});

test('an ASCII value is NUL-terminated', () => {
  const entry = createEntry(MAKE, TYPE.ASCII, 'Acme', true);
  assert.equal(entry.raw.length, 5);
  assert.equal(entry.raw[4], 0);
});

test('a number that does not fit the tag type is refused', () => {
  const entry = tag(parseExif(TIFF_LE).groups.ifd0, ORIENTATION);
  assert.equal(setEntryValue(entry, 'not a number', true), false);
  assert.equal(entry.value, 6, 'the old value is left alone');
  assert.equal(entry.edited, undefined);
});

test('createEntry returns null rather than writing something else', () => {
  assert.equal(createEntry(ORIENTATION, TYPE.SHORT, 'sideways', true), null);
});

test('a list of numbers can be typed with spaces or commas', () => {
  assert.deepEqual(createEntry(0x0100, TYPE.SHORT, '1 2 3', true).value, [1, 2, 3]);
  assert.deepEqual(createEntry(0x0100, TYPE.SHORT, '1,2,3', true).value, [1, 2, 3]);
  assert.deepEqual(createEntry(0x0100, TYPE.SHORT, ' 1 , 2 ', true).value, [1, 2]);
});

test('numbers are clamped to what the type can hold', () => {
  assert.equal(createEntry(0x0100, TYPE.SHORT, '99999', true).value, 65535);
  assert.equal(createEntry(0x0100, TYPE.BYTE, '300', true).value, 255);
  assert.equal(createEntry(0x0100, TYPE.SHORT, '-5', true).value, 0);
});

test('a rational is written as a decimal fraction', () => {
  const entry = createEntry(X_RESOLUTION, TYPE.RATIONAL, '72.5', true);
  assert.deepEqual(entry.pairs, [725, 10]);
  assert.equal(entry.value, 72.5);
});

test('a whole-number rational keeps a denominator of one', () => {
  const entry = createEntry(X_RESOLUTION, TYPE.RATIONAL, '300', true);
  assert.deepEqual(entry.pairs, [300, 1]);
});

test('a signed rational can go negative', () => {
  const entry = createEntry(0x9203, TYPE.SRATIONAL, '-1.5', true);
  assert.deepEqual(entry.pairs, [-15, 10]);
  assert.equal(entry.value, -1.5);
});

test('a UserComment gets the ASCII header the format requires', () => {
  const entry = createEntry(USER_COMMENT, TYPE.UNDEFINED, 'hello', true);
  assert.equal(new TextDecoder().decode(entry.raw.subarray(0, 8)), 'ASCII\0\0\0');
  // ... and reading it back does not print the header, which is where the
  // stray "ASCII" in so many comments comes from.
  assert.equal(entry.value, 'hello');
});

test('a UserComment with non-ASCII text is written as UNICODE', () => {
  const entry = createEntry(USER_COMMENT, TYPE.UNDEFINED, 'café', true);
  assert.equal(new TextDecoder().decode(entry.raw.subarray(0, 8)), 'UNICODE\0');
  assert.equal(entry.value, 'café');
});

test('an XP tag is stored as UTF-16 and read back whole', () => {
  // Trimming NULs a byte at a time here would eat half of the last Latin
  // letter: "Jane P" would come back as "Jane " and a broken fragment.
  const entry = createEntry(XP_TITLE, TYPE.BYTE, 'Jane P', true);
  assert.equal(entry.type, TYPE.BYTE);
  assert.equal(entry.value, 'Jane P');
});

test('an XP tag survives a round trip', () => {
  const model = {
    littleEndian: true,
    groups: {
      ifd0: [createEntry(XP_TITLE, TYPE.BYTE, 'A title', true)],
      exif: [], gps: [], interop: [], ifd1: [],
    },
  };
  assert.equal(tag(roundTrip(model).groups.ifd0, XP_TITLE).value, 'A title');
});

test('an edited entry loses the rational pair it used to have', () => {
  const entry = createEntry(X_RESOLUTION, TYPE.RATIONAL, '72.5', true);
  assert.ok(entry.pairs);
  setEntryValue(entry, '300', true);
  assert.deepEqual(entry.pairs, [300, 1]);
});

test('isEdited is false for a model read straight off disk', () => {
  assert.equal(isEdited(parseExif(TIFF_LE)), false);
  assert.equal(isEdited({ groups: {} }), false);
  assert.equal(isEdited({}), false);
});

test('a value with an embedded NUL is shown as a space', () => {
  const bytes = concat(TIFF_LE.subarray(0, 38), new Uint8Array([0x41, 0x00, 0x42, 0x00, 0x00]));
  const parsed = parseExif(bytes);
  assert.equal(tag(parsed.groups.ifd0, MAKE).value, 'A B');
});
