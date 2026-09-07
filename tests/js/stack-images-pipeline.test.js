/**
 * tools/stack-images/src/pipeline.js - the part of the run that needs no canvas.
 *
 * The pipeline is written for a worker and touches no DOM at module scope, so
 * it loads here; what it does with a decoder and a surface is exercised in a
 * browser and not in this file. Two things are worth pinning without either.
 *
 * `declaredSize`, because every later stage plans from the number it returns
 * and the number has to be the size the decode will actually have. That is
 * the bug this file exists to keep fixed: a portrait JPEG from a phone is
 * stored sideways with an Exif tag saying so, the browser's decoder turns it
 * upright, and a size read off the frame header alone is a quarter turn out
 * from the bitmap. Three such frames used to come back as one squashed
 * landscape.
 *
 * And `openFrame`, which needs a File and nothing else, because the rule it
 * implements for a RAW preview has four arms - the preview's own Exif wins;
 * with none, the RAW's directory is applied here; with the head unable to
 * say, a longer read; and after that, none - and a wrong arm does not fail,
 * it turns one frame twice or not at all.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  EXIF_ID, IHDR, PNG_SIGNATURE, TIFF_LE, TIFF_TYPE, ascii, concat, segment, tiffEntry, tiffOf,
  u16be, u32be,
} from './helpers.js';
import { declaredSize, openFrame } from '../../tools/stack-images/src/pipeline.js';

const sof = (width, height) => concat(
  [0xff, 0xc0], u16be(17), [8], u16be(height), u16be(width),
  [3, 1, 0x22, 0, 2, 0x11, 1, 3, 0x11, 1],
);

const jpegWith = (segments, width, height) => concat(
  [0xff, 0xd8], segments, sof(width, height), [0xff, 0xda], u16be(2050), new Uint8Array(2048),
);

/** An Exif APP1 saying 6, padded out to the length a camera's would have. */
const exifSegment = (tail = 0) => segment(0xe1, concat(EXIF_ID, TIFF_LE, new Uint8Array(tail)));

/** A TIFF-shaped RAW whose IFD0 says `orientation` and points at `preview`. */
function rawWith(preview, orientation, size = null) {
  const entries = [
    tiffEntry(0x0103, TIFF_TYPE.SHORT, 1, 6),
    tiffEntry(0x0111, TIFF_TYPE.LONG, 1, { blob: 0 }),
    tiffEntry(0x0117, TIFF_TYPE.LONG, 1, preview.length),
    tiffEntry(0x0112, TIFF_TYPE.SHORT, 1, orientation),
  ];
  if (size) {
    entries.push(tiffEntry(0x0100, TIFF_TYPE.LONG, 1, size.width));
    entries.push(tiffEntry(0x0101, TIFF_TYPE.LONG, 1, size.height));
  }
  const bytes = tiffOf({ dirs: [{ entries }], blobs: [preview] });
  return new File([bytes], 'shot.cr2');
}

/** A Fujifilm RAF: no directory, the preview's offset and length at 84 and 88. */
function rafWith(preview) {
  const offset = 2048;
  const bytes = new Uint8Array(offset + preview.length);
  bytes.set(ascii('FUJIFILMCCD-RAW '), 0);
  bytes.set(u32be(offset), 84);
  bytes.set(u32be(preview.length), 88);
  bytes.set(preview, offset);
  return new File([bytes], 'shot.raf');
}

test('a JPEG stored sideways declares the upright size the decoder will give', () => {
  // TIFF_LE's orientation is 6: rows run down the right-hand side, and the
  // decode is a quarter turn clockwise from the stored 3000 by 2000.
  const sideways = jpegWith([segment(0xe1, concat(EXIF_ID, TIFF_LE))], 3000, 2000);
  assert.deepEqual(declaredSize(sideways), { width: 2000, height: 3000, orientation: 6 });
});

test('a JPEG without Exif declares its stored size, and says it found nothing', () => {
  assert.deepEqual(declaredSize(jpegWith([], 3000, 2000)),
    { width: 3000, height: 2000, orientation: null });
});

test('an orientation that does not turn the picture leaves the size alone', () => {
  const flipped = new Uint8Array(TIFF_LE);
  flipped[0x1e] = 3;
  const upsideDown = jpegWith([segment(0xe1, concat(EXIF_ID, flipped))], 3000, 2000);
  assert.deepEqual(declaredSize(upsideDown), { width: 3000, height: 2000, orientation: 3 });
});

test('a PNG is read off IHDR and carries no orientation', () => {
  // helpers.js's IHDR is 1 by 1; enough bytes follow it for the check that
  // guards the DataView.
  const png = concat(PNG_SIGNATURE, IHDR, new Uint8Array(16));
  assert.deepEqual(declaredSize(png), { width: 1, height: 1 });
});

test('anything else declares nothing, so the decoder is asked instead', () => {
  assert.equal(declaredSize(new Uint8Array(64).fill(0x77)), null);
  assert.equal(declaredSize(new Uint8Array([0xff, 0xd8, 0xff])), null,
    'a JPEG cut off before its frame header has no size to give');
  assert.equal(declaredSize(new Uint8Array(0)), null);
});

/* ---------------------------------------------------------------- openFrame */

test('a JPEG the browser will orient is opened at its upright size, unturned', async () => {
  const frame = await openFrame(new File([jpegWith([exifSegment()], 3000, 2000)], 'a.jpg'));
  assert.equal(frame.kind, 'image');
  assert.equal(frame.turn, 1, 'the decoder reads the file\'s own Exif; nothing is left to do');
  assert.deepEqual([frame.width, frame.height], [2000, 3000]);
  assert.deepEqual(frame.decoded, { width: 2000, height: 3000 });
});

test('a preview with Exif of its own is left to the browser, whatever the RAW says', async () => {
  const frame = await openFrame(rawWith(jpegWith([exifSegment()], 6000, 4000), 8));
  assert.equal(frame.kind, 'raw');
  assert.equal(frame.turn, 1, 'applying the directory\'s 8 as well would turn it twice');
  assert.deepEqual([frame.width, frame.height], [4000, 6000], 'oriented by the preview\'s 6');
  assert.deepEqual(frame.decoded, { width: 4000, height: 6000 });
});

test('a preview with no Exif is turned here, by the RAW directory', async () => {
  const frame = await openFrame(rawWith(jpegWith([], 6000, 4000), 6));
  assert.equal(frame.turn, 6);
  assert.deepEqual([frame.width, frame.height], [4000, 6000]);
  assert.deepEqual(frame.decoded, { width: 6000, height: 4000 },
    'the decoder will hand back the stored, sideways picture');
});

test('a long Exif block is read from the head, with no second read', async () => {
  // Six kilobytes of maker note behind IFD0, so the segment runs past the 4 KB
  // head. The tag was in the first forty bytes, and the head is enough. The
  // size comes from the directory's tags, as it does for a CR2, because the
  // frame header is behind the maker note too.
  const size = { width: 6000, height: 4000 };
  const short = await openFrame(rawWith(jpegWith([exifSegment()], 6000, 4000), 8, size));
  const long = await openFrame(rawWith(jpegWith([exifSegment(6000)], 6000, 4000), 8, size));
  assert.equal(long.turn, 1);
  assert.deepEqual([long.width, long.height], [4000, 6000]);
  assert.equal(long.bytesRead, short.bytesRead, 'nothing beyond the usual head was read');
});

test('a head that ends before the Exif block is followed by one longer read', async () => {
  // An ICC profile ahead of the Exif block pushes it past the 4 KB head. The
  // head cannot say either way, so the pipeline reads more - once, and no
  // more of the preview than an Exif block could be behind - and finds it.
  const icc = segment(0xe2, new Uint8Array(6000));
  const preview = jpegWith([icc, exifSegment()], 6000, 4000);
  const short = await openFrame(rawWith(jpegWith([exifSegment()], 6000, 4000), 8));
  const frame = await openFrame(rawWith(preview, 8, { width: 6000, height: 4000 }));
  assert.equal(frame.turn, 1, 'the preview\'s 6 was found on the second read');
  assert.deepEqual([frame.width, frame.height], [4000, 6000]);
  assert.equal(frame.bytesRead, short.bytesRead + Math.min(preview.length, 65536));
});

test('an Exif block the longer read cannot reach is treated as none', async () => {
  // Two maximal segments before the Exif block put it past 64 KB. That is not
  // a file a camera writes, so the pipeline stops reading and applies the
  // directory, which for a real preview is the right answer.
  const far = [segment(0xe2, new Uint8Array(40000)), segment(0xe2, new Uint8Array(40000))];
  const frame = await openFrame(rawWith(jpegWith([...far, exifSegment()], 6000, 4000), 6));
  assert.equal(frame.turn, 6);
});

test('a preview whose frame header lay past the head declares no size, not a size of nulls', async () => {
  // A RAF arrives without size tags, and its frame header sits behind the
  // camera's Exif block, past what the 4 KB head reached. The survey decode
  // then fills the size in from the bitmap - but only if what it finds is
  // null. A pair of nulls is an object, survives every `??`, and reaches the
  // stack as a 1 by 1 working size that asks for a full decode on every band.
  const frame = await openFrame(rafWith(jpegWith([exifSegment(6000)], 6000, 4000)));
  assert.equal(frame.kind, 'raw');
  assert.equal(frame.width, null);
  assert.equal(frame.height, null);
  assert.equal(frame.decoded, null);
  assert.equal(frame.turn, 1, 'the RAF preview\'s own Exif, read off the head, does the turning');
});
