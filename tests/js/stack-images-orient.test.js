/**
 * tools/stack-images/src/orient.js - EXIF orientation, read and applied.
 *
 * Two things are pinned here and neither is "does it parse Exif".
 *
 * The first is the tri-state. The reader runs on the head of a file, and a
 * head can end before the answer does: a 4 KB head that stops inside a long
 * APP segment has not said "no Exif", it has said "not yet". The pipeline reads
 * more on undefined and guesses on null, so the two must not be confused - a
 * reader that returned null for a short head would turn every RAW preview with
 * a big maker-note sideways, and only on cameras that write one.
 *
 * The second is the sign of the turn. `orientationMatrix` is applied to a
 * decode the browser did not orient, and a matrix with the rotation the wrong
 * way round does not throw, does not warn and does not look wrong in review; it
 * puts one frame into the stack a half turn from the rest. So every value is
 * pinned by where it sends the corners, against the specification's own
 * wording of what each value means.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  EXIF_ID, TIFF_BE, TIFF_LE, XMP_ID, ascii, concat, segment, u16be,
} from './helpers.js';
import {
  jpegOrientation, jpegSegments, orientationMatrix, orientedSize,
} from '../../tools/stack-images/src/orient.js';
import { jpegSize } from '../../tools/stack-images/src/raw.js';

/* ------------------------------------------------------------------ fixtures */

/** A baseline frame header for a picture of the size given. */
const sof = (width, height) => concat(
  [0xff, 0xc0], u16be(17), [8], u16be(height), u16be(width),
  [3, 1, 0x22, 0, 2, 0x11, 1, 3, 0x11, 1],
);

/** SOI, the segments given, a frame header, then a scan nobody decodes. */
const jpegWith = (...segments) => concat(
  [0xff, 0xd8], segments, sof(640, 480), [0xff, 0xda], u16be(10), new Uint8Array(8),
);

/** An Exif APP1 wrapping the TIFF block given. */
const exifSegment = (tiff) => segment(0xe1, concat(EXIF_ID, tiff));

/** A TIFF block with IFD0 holding one SHORT orientation, in either byte order. */
function tiffWithOrientation(value, little = true) {
  const out = new Uint8Array(8 + 2 + 12 + 4);
  const view = new DataView(out.buffer);
  out.set(little ? [0x49, 0x49] : [0x4d, 0x4d], 0);
  view.setUint16(2, 42, little);
  view.setUint32(4, 8, little);
  view.setUint16(8, 1, little);
  view.setUint16(10, 0x0112, little);
  view.setUint16(12, 3, little);
  view.setUint32(14, 1, little);
  view.setUint16(18, value, little);
  return out;
}

/* ------------------------------------------------------------------- reader */

test('the orientation is read off an Exif APP1 in either byte order', () => {
  // helpers.js's hand-written blocks both say 6, and say it in both orders.
  assert.equal(jpegOrientation(jpegWith(exifSegment(TIFF_LE))), 6);
  assert.equal(jpegOrientation(jpegWith(exifSegment(TIFF_BE))), 6);
  for (let value = 1; value <= 8; value += 1) {
    assert.equal(jpegOrientation(jpegWith(exifSegment(tiffWithOrientation(value)))), value);
    assert.equal(jpegOrientation(jpegWith(exifSegment(tiffWithOrientation(value, false)))), value);
  }
});

test('an Exif block after a JFIF or an XMP one is still found', () => {
  const jfif = segment(0xe0, concat([0x4a, 0x46, 0x49, 0x46, 0], [1, 2, 0, 0, 1, 0, 1, 0, 0]));
  assert.equal(jpegOrientation(jpegWith(jfif, exifSegment(TIFF_LE))), 6);

  // An editor's export puts its XMP in an APP1 of its own, often ahead of the
  // Exif one. Stopping at the first APP1 would read every such file as having
  // no orientation.
  const xmp = segment(0xe1, concat(XMP_ID, ascii('<x/>')));
  assert.equal(jpegOrientation(jpegWith(xmp, exifSegment(TIFF_LE))), 6);
});

test('a frame header reached with no Exif is null, not undefined', () => {
  // null is the answer the pipeline acts on without reading more, so it must
  // only come back once the head has proved there is nothing to find.
  assert.equal(jpegOrientation(jpegWith()), null);

  const jfif = segment(0xe0, concat([0x4a, 0x46, 0x49, 0x46, 0], [1, 2, 0, 0, 1, 0, 1, 0, 0]));
  assert.equal(jpegOrientation(jpegWith(jfif)), null, 'an APP0 is not an Exif block');

  const xmp = segment(0xe1, new Uint8Array(64).fill(0x20));
  assert.equal(jpegOrientation(jpegWith(xmp)), null,
    'an APP1 that is not Exif is not an orientation');
});

test('an Exif block without the tag is null once the frame header is reached', () => {
  const bare = new Uint8Array([0x49, 0x49, 42, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  assert.equal(jpegOrientation(jpegWith(exifSegment(bare))), null);
});

test('a head that ends inside a segment is undefined, so the caller reads more', () => {
  const whole = jpegWith(segment(0xe2, new Uint8Array(3000)), exifSegment(TIFF_LE));
  assert.equal(jpegOrientation(whole), 6, 'the whole file reads fine');
  assert.equal(jpegOrientation(whole.subarray(0, 2048)), undefined,
    'a head stopping inside the long segment has not answered');
  assert.equal(jpegOrientation(whole.subarray(0, 4)), undefined);

  // And the same cut inside the Exif segment's directory itself.
  const exifFirst = jpegWith(exifSegment(TIFF_LE));
  assert.equal(jpegOrientation(exifFirst.subarray(0, 12)), undefined);
  assert.equal(jpegOrientation(exifFirst.subarray(0, 4 + 6 + 8 + 2 + 12 + 6)), undefined,
    'a head ending in the middle of the entry that would have said');
});

test('an Exif block cut after its directory is read from what the head holds', () => {
  // A camera's Exif segment is mostly maker note and thumbnail, behind IFD0,
  // and runs past any sensible head. The tag is in the first few dozen bytes,
  // so the head has the answer, and a reader that insisted on the whole
  // segment would send every camera-written preview back for a second read.
  const long = jpegWith(exifSegment(concat(TIFF_LE, new Uint8Array(6000))));
  assert.equal(jpegOrientation(long), 6);
  assert.equal(jpegOrientation(long.subarray(0, 4096)), 6,
    'the head holds IFD0, and IFD0 holds the tag');

  // The same head with no tag in the directory is not yet an answer: the
  // segment that has one might still be behind the cut.
  const bare = new Uint8Array([0x49, 0x49, 42, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const longBare = jpegWith(exifSegment(concat(bare, new Uint8Array(6000))));
  assert.equal(jpegOrientation(longBare), null);
  assert.equal(jpegOrientation(longBare.subarray(0, 4096)), undefined);
});

test('a value outside 1..8, or a tag of the wrong shape, is treated as absent', () => {
  assert.equal(jpegOrientation(jpegWith(exifSegment(tiffWithOrientation(0)))), null);
  assert.equal(jpegOrientation(jpegWith(exifSegment(tiffWithOrientation(9)))), null);

  const long = tiffWithOrientation(6);
  new DataView(long.buffer).setUint16(12, 4, true);
  assert.equal(jpegOrientation(jpegWith(exifSegment(long))), null,
    'a LONG where the specification says SHORT is not believed');
});

test('garbage yields null or undefined, never a throw', () => {
  const lies = tiffWithOrientation(6);
  new DataView(lies.buffer).setUint32(4, 0xfffffff0, true);
  assert.equal(jpegOrientation(jpegWith(exifSegment(lies))), null,
    'an IFD offset outside the block');

  const many = tiffWithOrientation(6);
  new DataView(many.buffer).setUint16(8, 0xffff, true);
  assert.equal(jpegOrientation(jpegWith(exifSegment(many))), 6,
    'a directory claiming more entries than it has still yields the one it has');

  const badMagic = tiffWithOrientation(6);
  new DataView(badMagic.buffer).setUint16(2, 99, true);
  assert.equal(jpegOrientation(jpegWith(exifSegment(badMagic))), null);

  assert.equal(jpegOrientation(new Uint8Array(0)), undefined);
  assert.equal(jpegOrientation(new Uint8Array([0xff, 0xd8])), undefined);
  assert.equal(jpegOrientation(new Uint8Array(64).fill(0x77)), undefined);
  assert.equal(jpegOrientation(concat([0xff, 0xd8, 0xff, 0xe1], u16be(1))), null,
    'a segment length under two is nonsense, and nonsense is null');
  assert.equal(jpegOrientation(concat([0xff, 0xd8, 0xff, 0xe1], u16be(0))), null);
});

/* ------------------------------------------------------------------- walker */

test('the size and the orientation are read off one walk of the same segments', () => {
  // Both readers run on the same head, and a preview of one camera turned the
  // wrong way is what it would look like if they ever disagreed about where
  // the preamble ends. So there is one walker, and both consumers see the
  // same list.
  const jfif = segment(0xe0, concat([0x4a, 0x46, 0x49, 0x46, 0], [1, 2, 0, 0, 1, 0, 1, 0, 0]));
  const file = jpegWith(jfif, exifSegment(TIFF_LE), segment(0xdb, new Uint8Array(65)));
  assert.deepEqual(
    Array.from(jpegSegments(file), (seg) => [seg.marker, seg.complete, seg.frame, seg.final]),
    [[0xe0, true, false, false], [0xe1, true, false, false], [0xdb, true, false, false],
      [0xc0, true, true, false]],
  );
  assert.deepEqual(jpegSize(file), { width: 640, height: 480 });
  assert.equal(jpegOrientation(file), 6);

  const cut = file.subarray(0, file.length - 40);
  const last = Array.from(jpegSegments(cut)).at(-1);
  assert.equal(last.marker, 0xdb);
  assert.equal(last.complete, false, 'the head ended inside the tables');
  assert.equal(jpegSize(cut), null);
  assert.equal(jpegOrientation(cut), 6, 'but the Exif block before them was whole');
});

/* --------------------------------------------------------------------- size */

test('the size swaps for the four quarter turns and only those', () => {
  for (const value of [1, 2, 3, 4]) {
    assert.deepEqual(orientedSize(3000, 2000, value), { width: 3000, height: 2000 });
  }
  for (const value of [5, 6, 7, 8]) {
    assert.deepEqual(orientedSize(3000, 2000, value), { width: 2000, height: 3000 });
  }
  assert.deepEqual(orientedSize(3000, 2000, null), { width: 3000, height: 2000 });
  assert.deepEqual(orientedSize(3000, 2000, undefined), { width: 3000, height: 2000 });
});

/* ------------------------------------------------------------------- matrix */

/**
 * Where the matrix sends a corner of a w by h decode, in the upright picture's
 * own coordinates: about the decode's centre, then re-centred in the upright
 * box, which is exactly what drawFrame in pipeline.js does with it.
 */
function landing(orientation, w, h, x, y) {
  const [a, b, c, d] = orientationMatrix(orientation);
  const px = x - w / 2;
  const py = y - h / 2;
  const upright = orientedSize(w, h, orientation);
  return [a * px + c * py + upright.width / 2, b * px + d * py + upright.height / 2];
}

test('each orientation sends the corners where the specification says', () => {
  // Exif's own wording for each value is "the 0th row is the visual X and the
  // 0th column is the visual Y". So the stored top-left corner - start of row
  // 0 and of column 0 - lands at the visual X-Y corner, and the stored
  // top-right, end of row 0, lands at the other end of the visual X edge.
  const w = 300;
  const h = 200;
  const stored = { TL: [0, 0], TR: [w, 0], BR: [w, h], BL: [0, h] };
  const uprightCorner = (orientation, name) => {
    const { width, height } = orientedSize(w, h, orientation);
    return { TL: [0, 0], TR: [width, 0], BR: [width, height], BL: [0, height] }[name];
  };

  const expected = {
    1: { TL: 'TL', TR: 'TR', BR: 'BR', BL: 'BL' },
    2: { TL: 'TR', TR: 'TL', BR: 'BL', BL: 'BR' },
    3: { TL: 'BR', TR: 'BL', BR: 'TL', BL: 'TR' },
    4: { TL: 'BL', TR: 'BR', BR: 'TR', BL: 'TL' },
    5: { TL: 'TL', TR: 'BL', BR: 'BR', BL: 'TR' },
    // 6 is the one that matters: a phone held upright. Row 0 runs down the
    // right-hand side, so the stored top-left lands top-right and the decode
    // has been turned a quarter clockwise.
    6: { TL: 'TR', TR: 'BR', BR: 'BL', BL: 'TL' },
    7: { TL: 'BR', TR: 'TR', BR: 'TL', BL: 'BL' },
    8: { TL: 'BL', TR: 'TL', BR: 'TR', BL: 'BR' },
  };

  for (const [orientation, corners] of Object.entries(expected)) {
    for (const [from, to] of Object.entries(corners)) {
      assert.deepEqual(
        landing(Number(orientation), w, h, ...stored[from]),
        uprightCorner(Number(orientation), to),
        `orientation ${orientation} sends the stored ${from} corner somewhere other than ${to}`,
      );
    }
  }
});

test('the identity is the answer for no orientation at all', () => {
  assert.deepEqual(orientationMatrix(1), [1, 0, 0, 1]);
  assert.deepEqual(orientationMatrix(null), [1, 0, 0, 1]);
  assert.deepEqual(orientationMatrix(undefined), [1, 0, 0, 1]);
  assert.deepEqual(orientationMatrix(0), [1, 0, 0, 1]);
  assert.deepEqual(orientationMatrix(9), [1, 0, 0, 1]);
});

test('every matrix is a signed permutation, so no turn scales the picture', () => {
  for (let value = 1; value <= 8; value += 1) {
    const [a, b, c, d] = orientationMatrix(value);
    assert.equal(Math.abs(a * d - b * c), 1, `orientation ${value} changes the area`);
    assert.equal(Math.abs(a) + Math.abs(b), 1);
    assert.equal(Math.abs(c) + Math.abs(d), 1);
  }
});
