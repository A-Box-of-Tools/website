/**
 * tools/stack-images/src/raw.js - finding the picture inside a RAW file.
 *
 * There are no camera files in this repository and there is no way to put one
 * here: a CR2 is sixty megabytes and is somebody's photograph. So the fixtures
 * below are written out byte by byte, which is the better test anyway - each
 * one is a named shape a real camera writes, small enough to read, and the
 * comment above it says which camera writes it that way.
 *
 * WHAT IS ACTUALLY BEING PINNED
 *
 * Two things, and neither is "does it parse TIFF".
 *
 * The first is that the *largest* preview is chosen. Every one of these files
 * has more than one picture in it, and picking the wrong one is not a failure -
 * it is a stack that quietly comes out at 160 by 120. That is the single most
 * likely way for this tool to disappoint somebody without anything going wrong.
 *
 * The second is that almost nothing is read. The whole argument for the
 * embedded preview over a demosaic is that opening a frame touches kilobytes
 * rather than the file, so `pages touched` is asserted rather than admired.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { ascii, concat, u16be, u32be, u32le } from './helpers.js';
import {
  RAW_EXTENSIONS, findPreview, jpegSize, looksRaw, paged, tiffHeader,
} from '../../tools/stack-images/src/raw.js';

/* ------------------------------------------------------------------ fixtures */

/** A frame header, which is where a JPEG says how big it is. */
const sof = (marker, width, height) => concat(
  [0xff, marker], u16be(17), [8], u16be(height), u16be(width),
  [3, 1, 0x22, 0, 2, 0x11, 1, 3, 0x11, 1],
);

/**
 * A JPEG that declares a size. The scan is filler - nothing here decodes one -
 * but the length matters twice over: ranking falls back to byte length whenever
 * a candidate arrives without dimensions, and findPreview refuses anything
 * under a kilobyte outright, on the grounds that a byte range that short is a
 * misread tag rather than a photograph. So every fixture below is padded past
 * that floor, including the ones testing that something is rejected - a test
 * that passes because its fixture was too small has not tested anything.
 */
const jpegOf = (width, height, filler = 64, marker = 0xc0) => concat(
  [0xff, 0xd8], sof(marker, width, height),
  [0xff, 0xda], u16be(filler + 2), new Uint8Array(filler).fill(0x5a),
);

/** Bytes that are not a JPEG, for the cases where a tag lies about what it points at. */
const notJpeg = (length) => new Uint8Array(length).fill(0x77);

const TYPE = { ASCII: 2, SHORT: 3, LONG: 4, UNDEFINED: 7 };
const WIDTHS = { 2: 1, 3: 2, 4: 4, 7: 1 };

/**
 * Lay out a TIFF: a header, a run of directories, then the data too long to sit
 * inside an entry.
 *
 * An entry's value is a number when it fits in the four bytes the entry has,
 * and an offset into the data area when it does not. That indirection is the
 * only awkward part of the format and it is the part worth exercising, so the
 * fixtures below deliberately use both.
 *
 * `dirs` is a list of `{ entries, next }`. An entry's value may be a plain
 * number, `{ blob: i }` for the offset of a data block, or `{ dir: i }` for the
 * offset of another directory.
 */
function tiffOf({ little = true, magic = 42, dirs, blobs = [] }) {
  const dirSizes = dirs.map((dir) => 2 + dir.entries.length * 12 + 4);
  const dirAt = [];
  let at = 8;
  for (const size of dirSizes) { dirAt.push(at); at += size; }

  const blobAt = [];
  for (const blob of blobs) { blobAt.push(at); at += blob.length; }

  const out = new Uint8Array(at);
  const view = new DataView(out.buffer);
  const resolve = (value) => {
    if (typeof value === 'number') return value;
    if (value.blob !== undefined) return blobAt[value.blob];
    return dirAt[value.dir];
  };

  out.set(ascii(little ? 'II' : 'MM'), 0);
  view.setUint16(2, magic, little);
  view.setUint32(4, dirAt[0], little);

  dirs.forEach((dir, index) => {
    let cursor = dirAt[index];
    view.setUint16(cursor, dir.entries.length, little);
    cursor += 2;
    for (const entry of dir.entries) {
      view.setUint16(cursor, entry.tag, little);
      view.setUint16(cursor + 2, entry.type, little);
      view.setUint32(cursor + 4, entry.count, little);
      const needed = WIDTHS[entry.type] * entry.count;
      if (needed <= 4) {
        // Left-justified inside the entry, whichever way round the file is.
        if (entry.type === TYPE.SHORT) view.setUint16(cursor + 8, resolve(entry.value), little);
        else view.setUint32(cursor + 8, resolve(entry.value), little);
      } else {
        view.setUint32(cursor + 8, resolve(entry.value), little);
      }
      cursor += 12;
    }
    view.setUint32(cursor, dir.next === undefined ? 0 : dirAt[dir.next], little);
  });

  blobs.forEach((blob, index) => out.set(blob, blobAt[index]));
  return out;
}

const entry = (tag, type, count, value) => ({ tag, type, count, value });

/** Read a whole in-memory fixture, counting what was asked for. */
function readerFor(bytes) {
  const asked = [];
  const read = (offset, length) => {
    asked.push([offset, length]);
    return Promise.resolve(bytes.subarray(offset, offset + length));
  };
  return { read, asked, size: bytes.length };
}

const findIn = (bytes, minimum) => findPreview(
  readerFor(bytes).read, bytes.length, minimum,
);

/* --------------------------------------------------------------------- TIFF */

test('a header is recognised, including the magic numbers cameras invent', () => {
  assert.deepEqual(tiffHeader(new Uint8Array([0x49, 0x49, 42, 0, 8, 0, 0, 0])),
    { little: true, first: 8 });
  assert.deepEqual(tiffHeader(new Uint8Array([0x4d, 0x4d, 0, 42, 0, 0, 0, 8])),
    { little: false, first: 8 });
  // Panasonic writes 0x55 where the specification asks for 42.
  assert.ok(tiffHeader(new Uint8Array([0x49, 0x49, 0x55, 0, 8, 0, 0, 0])));

  assert.equal(tiffHeader(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0])), null,
    'a PNG is not a TIFF');
  assert.equal(tiffHeader(new Uint8Array([0x49, 0x49, 99, 0, 8, 0, 0, 0])), null);
  assert.equal(tiffHeader(new Uint8Array([0x49, 0x49, 42, 0, 2, 0, 0, 0])), null,
    'a first directory inside the header is nonsense');
});

test('a CR2 gives up its full-size preview, not its thumbnail', () => {
  // Canon's shape: the full-size JPEG is IFD0's single strip, with compression
  // saying JPEG, and a small thumbnail hangs off the chain in IFD1 under the
  // tag pair everybody else uses for thumbnails.
  const full = jpegOf(6000, 4000, 4096);
  const thumb = jpegOf(160, 120, 2048);
  const bytes = tiffOf({
    dirs: [
      {
        entries: [
          entry(0x0103, TYPE.SHORT, 1, 6),
          entry(0x0111, TYPE.LONG, 1, { blob: 0 }),
          entry(0x0117, TYPE.LONG, 1, full.length),
          entry(0x010f, TYPE.ASCII, 6, { blob: 2 }),
          entry(0x0110, TYPE.ASCII, 8, { blob: 3 }),
          entry(0x0112, TYPE.SHORT, 1, 6),
        ],
        next: 1,
      },
      {
        entries: [
          entry(0x0201, TYPE.LONG, 1, { blob: 1 }),
          entry(0x0202, TYPE.LONG, 1, thumb.length),
        ],
      },
    ],
    blobs: [full, thumb, ascii('Canon\0'), ascii('EOS 5D\0\0')],
  });

  return findIn(bytes).then((found) => {
    assert.ok(found, 'nothing was found in a file with two pictures in it');
    assert.equal(found.width, 6000, 'the thumbnail was chosen over the full-size preview');
    assert.equal(found.height, 4000);
    assert.equal(found.length, full.length);
    assert.equal(found.from, 'ifd0');
    assert.equal(found.make, 'Canon');
    assert.equal(found.model, 'EOS 5D');
    assert.equal(found.orientation, 6, 'a sideways camera is worth knowing about');
    assert.deepEqual(Array.from(bytes.subarray(found.offset, found.offset + 3)),
      [0xff, 0xd8, 0xff], 'the offset does not land on a JPEG');
  });
});

test('a NEF gives up the preview hidden in a sub-directory', () => {
  // Nikon's shape: IFD0 carries a small thumbnail and points, through SubIFDs,
  // at a directory whose strip is the large preview. A walker that followed the
  // chain but not the sub-directories would find only the thumbnail - and would
  // look like it was working.
  const preview = jpegOf(4928, 3264, 2048);
  const thumb = jpegOf(160, 120, 2048);
  const bytes = tiffOf({
    dirs: [
      {
        entries: [
          entry(0x0201, TYPE.LONG, 1, { blob: 1 }),
          entry(0x0202, TYPE.LONG, 1, thumb.length),
          entry(0x014a, TYPE.LONG, 1, { dir: 1 }),
          entry(0x010f, TYPE.ASCII, 7, { blob: 2 }),
        ],
      },
      {
        entries: [
          entry(0x0103, TYPE.SHORT, 1, 7),
          entry(0x0111, TYPE.LONG, 1, { blob: 0 }),
          entry(0x0117, TYPE.LONG, 1, preview.length),
        ],
      },
    ],
    blobs: [preview, thumb, ascii('NIKON\0\0')],
  });

  return findIn(bytes).then((found) => {
    assert.equal(found.width, 4928);
    assert.equal(found.from, 'sub');
    assert.equal(found.make, 'NIKON');
  });
});

test('a big-endian file reads the same as a little-endian one', () => {
  const build = (little) => tiffOf({
    little,
    dirs: [{
      entries: [
        entry(0x0103, TYPE.SHORT, 1, 6),
        entry(0x0111, TYPE.LONG, 1, { blob: 0 }),
        entry(0x0117, TYPE.LONG, 1, jpegOf(3000, 2000, 2048).length),
      ],
    }],
    blobs: [jpegOf(3000, 2000, 2048)],
  });

  return Promise.all([findIn(build(true)), findIn(build(false))]).then(([le, be]) => {
    assert.equal(le.width, 3000);
    assert.equal(be.width, 3000, 'a Nikon-order file was read as if it were Canon-order');
    assert.equal(le.offset, be.offset);
  });
});

test('a Panasonic RW2 gives up the whole JPEG it stores as one field', () => {
  const full = jpegOf(4592, 3448, 1024);
  const bytes = tiffOf({
    magic: 0x55,
    dirs: [{ entries: [entry(0x002e, TYPE.UNDEFINED, full.length, { blob: 0 })] }],
    blobs: [full],
  });

  return findIn(bytes).then((found) => {
    assert.equal(found.from, 'jpgfromraw');
    assert.equal(found.width, 4592);
  });
});

test('a tag that lies about pointing at a JPEG is refused', () => {
  // A strip marked as JPEG compression that is actually packed sensor data. The
  // check that saves this is the one on the bytes themselves, not on the tag:
  // hand those bytes to a decoder and it reports whatever it likes.
  const thumb = jpegOf(320, 240, 2048);
  const bytes = tiffOf({
    dirs: [
      {
        entries: [
          entry(0x0103, TYPE.SHORT, 1, 6),
          entry(0x0111, TYPE.LONG, 1, { blob: 0 }),
          entry(0x0117, TYPE.LONG, 1, 8192),
          entry(0x0100, TYPE.LONG, 1, 6000),
          entry(0x0101, TYPE.LONG, 1, 4000),
        ],
        next: 1,
      },
      {
        entries: [
          entry(0x0201, TYPE.LONG, 1, { blob: 1 }),
          entry(0x0202, TYPE.LONG, 1, thumb.length),
        ],
      },
    ],
    blobs: [notJpeg(8192), thumb],
  });

  return findIn(bytes, 0).then((found) => {
    assert.equal(found.width, 320, 'the sensor data was accepted as a picture');
    assert.equal(found.from, 'ifd');
  });
});

test('a preview too small to stack is no preview at all', () => {
  const bytes = tiffOf({
    dirs: [{
      entries: [
        entry(0x0201, TYPE.LONG, 1, { blob: 0 }),
        entry(0x0202, TYPE.LONG, 1, jpegOf(160, 120, 2048).length),
      ],
    }],
    blobs: [jpegOf(160, 120, 2048)],
  });

  return findIn(bytes).then((found) => {
    assert.equal(found, null, 'a 160 by 120 thumbnail is not something to stack');
    // And with the floor lowered it is found, which is what proves the line
    // above rejected it for its size on screen rather than its size on disk.
    return findIn(bytes, 100).then((lowered) => assert.equal(lowered.width, 160));
  });
});

test('an offset past the end of the file is refused rather than thrown', () => {
  const bytes = tiffOf({
    dirs: [{
      entries: [
        entry(0x0201, TYPE.LONG, 1, 900000),
        entry(0x0202, TYPE.LONG, 1, 5000),
      ],
    }],
  });

  return findIn(bytes).then((found) => assert.equal(found, null));
});

test('sub-directories that point back at each other still terminate', () => {
  // Sony and Nikon both write files whose directories form a loop. Without the
  // visited set this walk does not finish, and a hung tab is a worse failure
  // than a missing preview.
  const preview = jpegOf(2000, 1500, 2048);
  const bytes = tiffOf({
    dirs: [
      { entries: [entry(0x014a, TYPE.LONG, 1, { dir: 1 })], next: 1 },
      {
        entries: [
          entry(0x014a, TYPE.LONG, 1, { dir: 0 }),
          entry(0x0103, TYPE.SHORT, 1, 6),
          entry(0x0111, TYPE.LONG, 1, { blob: 0 }),
          entry(0x0117, TYPE.LONG, 1, preview.length),
        ],
        next: 0,
      },
    ],
    blobs: [preview],
  });

  return findIn(bytes).then((found) => {
    assert.equal(found.width, 2000);
  });
});

/* ---------------------------------------------------------------------- RAF */

test('a Fujifilm RAF is read from the two numbers in its header', () => {
  const preview = jpegOf(4896, 3264, 1024);
  const offset = 2048;
  const bytes = new Uint8Array(offset + preview.length);
  bytes.set(ascii('FUJIFILMCCD-RAW '), 0);
  new DataView(bytes.buffer).setUint32(84, offset, false);
  new DataView(bytes.buffer).setUint32(88, preview.length, false);
  bytes.set(preview, offset);

  return findIn(bytes).then((found) => {
    assert.equal(found.from, 'raf');
    assert.equal(found.offset, offset);
    assert.equal(found.width, 4896);
    assert.equal(found.make, 'FUJIFILM');
  });
});

/* --------------------------------------------------------------------- CR3 */

const box = (type, payload) => concat(u32be(payload.length + 8), ascii(type), payload);

test('a CR3 gives up the track whose sample turns out to be a JPEG', () => {
  // Canon's newer files are MP4s. Which track holds the full-size JPEG is not
  // reliably readable from the sample description, so every track's first
  // sample is offered and the FF D8 FF check decides - which is also what stops
  // the packed raw track being handed to a decoder.
  const preview = jpegOf(6000, 4000, 2048);
  const raw = notJpeg(4096);

  const ftyp = box('ftyp', concat(ascii('crx '), u32be(1), ascii('crx isom')));
  const mdatBody = concat(preview, raw);
  const mdat = box('mdat', mdatBody);
  const mdatAt = ftyp.length + 8;

  const trak = (offset, length) => box('trak', box('mdia', box('minf', box('stbl', concat(
    box('stco', concat(u32be(0), u32be(1), u32be(offset))),
    box('stsz', concat(u32be(0), u32be(0), u32be(1), u32be(length))),
  )))));

  const moov = box('moov', concat(
    trak(mdatAt, preview.length),
    trak(mdatAt + preview.length, raw.length),
  ));

  const bytes = concat(ftyp, mdat, moov);

  return findIn(bytes).then((found) => {
    assert.ok(found, 'nothing was found in the CR3');
    assert.equal(found.from, 'trak');
    assert.equal(found.offset, mdatAt);
    assert.equal(found.width, 6000);
    assert.equal(found.make, 'Canon');
  });
});

test('a CR3 with only a preview box still gives something back', () => {
  // Some firmware puts a modest preview in a PRVW box behind a uuid, and it is
  // better than nothing when the tracks cannot be read. The JPEG sits a few
  // bytes into the box behind a header whose length is not worth pinning, which
  // is why the candidate is scanned for its start rather than assumed.
  const preview = jpegOf(1620, 1080, 2048);
  const ftyp = box('ftyp', concat(ascii('crx '), u32be(1), ascii('crx isom')));
  const prvw = box('PRVW', concat(new Uint8Array(12), preview));
  const uuid = box('uuid', concat(new Uint8Array(16), prvw));
  const moov = box('moov', uuid);
  const bytes = concat(ftyp, moov);

  return findIn(bytes).then((found) => {
    assert.equal(found.from, 'prvw');
    assert.equal(found.width, 1620);
    assert.deepEqual(Array.from(bytes.subarray(found.offset, found.offset + 3)),
      [0xff, 0xd8, 0xff]);
  });
});

/* ------------------------------------------------------------------- paging */

test('opening a frame touches kilobytes, not the file', () => {
  // The whole argument for the embedded preview. A 60 MB file whose preview is
  // two thirds of the way through must not be read on the way there.
  const preview = jpegOf(6000, 4000, 4096);
  const inner = tiffOf({
    dirs: [{
      entries: [
        entry(0x0103, TYPE.SHORT, 1, 6),
        entry(0x0111, TYPE.LONG, 1, 40 * 1024 * 1024),
        entry(0x0117, TYPE.LONG, 1, preview.length),
      ],
    }],
  });

  const bytes = new Uint8Array(60 * 1024 * 1024);
  bytes.set(inner, 0);
  bytes.set(preview, 40 * 1024 * 1024);

  const reader = readerFor(bytes);
  return findPreview(reader.read, bytes.length).then((found) => {
    assert.equal(found.width, 6000);
    const total = reader.asked.reduce((sum, [, length]) => sum + length, 0);
    assert.ok(total < 512 * 1024,
      `finding the preview read ${(total / 1024).toFixed(0)} KB of a 60 MB file`);
    assert.ok(found.read < 512 * 1024, 'and it should report roughly that figure');
  });
});

test('a read spanning several pages is assembled in the right order', () => {
  const bytes = new Uint8Array(200000);
  for (let i = 0; i < bytes.length; i += 1) bytes[i] = i & 0xff;
  const file = paged((offset, length) => Promise.resolve(
    bytes.subarray(offset, offset + length),
  ), bytes.length, 1024);

  return Promise.all([
    file.at(1020, 8),
    file.at(0, 3000),
    file.at(199990, 10),
    file.at(500, 0),
  ]).then(([across, long, tail, empty]) => {
    assert.deepEqual(Array.from(across), Array.from(bytes.subarray(1020, 1028)),
      'a read straddling a page boundary came back scrambled');
    assert.deepEqual(Array.from(long), Array.from(bytes.subarray(0, 3000)));
    assert.deepEqual(Array.from(tail), Array.from(bytes.subarray(199990, 200000)),
      'the last, short page');
    assert.equal(empty.length, 0);
  });
});

test('a page is fetched once however often it is read', () => {
  const bytes = new Uint8Array(4096);
  let fetches = 0;
  const file = paged((offset, length) => {
    fetches += 1;
    return Promise.resolve(bytes.subarray(offset, offset + length));
  }, bytes.length, 1024);

  return Promise.all([file.at(0, 4), file.at(8, 4), file.at(1000, 4)]).then(() => {
    assert.equal(fetches, 1, 'the same page was fetched more than once');
    return file.at(2000, 4).then(() => assert.equal(fetches, 2));
  });
});

test('a read outside the file is a range error, not a silent short read', () => {
  const file = paged(() => Promise.resolve(new Uint8Array(0)), 100);
  assert.rejects(() => file.at(90, 20), RangeError);
  assert.rejects(() => file.at(-1, 2), RangeError);
});

/* -------------------------------------------------------------------- JPEG */

test('the size is read off whichever frame marker the camera used', () => {
  assert.deepEqual(jpegSize(jpegOf(1920, 1080, 8, 0xc0)), { width: 1920, height: 1080 });
  assert.deepEqual(jpegSize(jpegOf(800, 600, 8, 0xc2)), { width: 800, height: 600 },
    'a progressive preview is still a preview');
  assert.deepEqual(jpegSize(jpegOf(4, 4, 8, 0xc3)), { width: 4, height: 4 },
    'lossless, which is what a raw strip inside a DNG is');

  // C4 is the Huffman tables and must not be mistaken for a frame, or the size
  // comes back as two arbitrary bytes out of a code length table.
  const withTables = concat(
    [0xff, 0xd8],
    [0xff, 0xc4], u16be(6), [0, 1, 2, 3],
    sof(0xc0, 1024, 768),
    [0xff, 0xda], u16be(4), [1, 2],
  );
  assert.deepEqual(jpegSize(withTables), { width: 1024, height: 768 });
});

test('a JPEG with no frame header before its scan has no size to give', () => {
  assert.equal(jpegSize(concat([0xff, 0xd8], [0xff, 0xda], u16be(4), [1, 2])), null);
  assert.equal(jpegSize(new Uint8Array([0xff, 0xd8, 0xff])), null);
  assert.equal(jpegSize(notJpeg(64)), null);
});

/* -------------------------------------------------------------------- door */

test('the extensions offered are the ones the readers can actually open', () => {
  assert.ok(looksRaw('DSC_0001.NEF'));
  assert.ok(looksRaw('img.cr3'), 'the check is not case sensitive');
  assert.ok(looksRaw('a.b.dng'), 'the last dot is the one that counts');
  assert.equal(looksRaw('photo.jpg'), false);
  assert.equal(looksRaw('noextension'), false);
  assert.equal(looksRaw(''), false);

  assert.deepEqual(RAW_EXTENSIONS, RAW_EXTENSIONS.slice().sort(), 'kept sorted, to stay readable');
  assert.equal(new Set(RAW_EXTENSIONS).size, RAW_EXTENSIONS.length, 'a duplicate crept in');
  for (const extension of ['cr2', 'cr3', 'nef', 'arw', 'dng', 'raf', 'rw2', 'orf']) {
    assert.ok(RAW_EXTENSIONS.includes(extension), `${extension} is not offered`);
  }
});

test('an ordinary JPEG is not a RAW file, and says so by finding nothing', () => {
  return findIn(jpegOf(4000, 3000, 1024)).then((found) => {
    assert.equal(found, null, 'a plain JPEG went down the RAW path');
  });
});

test('a truncated or empty file finds nothing rather than throwing', () => {
  return Promise.all([
    findIn(new Uint8Array(0)),
    findIn(new Uint8Array([0x49, 0x49])),
    findIn(new Uint8Array(64).fill(0xff)),
  ]).then((results) => {
    for (const found of results) assert.equal(found, null);
  });
});

test('u32le is left where the helpers put it', () => {
  // Guards against the shared fixture helpers changing under this file.
  assert.deepEqual(Array.from(u32le(1)), [1, 0, 0, 0]);
  assert.deepEqual(Array.from(u32be(1)), [0, 0, 0, 1]);
});
