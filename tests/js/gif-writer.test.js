/**
 * tools/video-to-gif/src/gif.js - the file itself, and the frame differencing.
 *
 * The writer is checked by parsing what it produced rather than by comparing it
 * against a recorded blob: a fixture of expected bytes would pass whatever the
 * writer did as long as it kept doing it, while a parser fails when a field
 * moves. That parser is `gif-fixtures.js`, written from the specification and
 * not from this writer.
 *
 * The differencing is the other half. It is what makes a GIF of a mostly still
 * video small, and its failure mode is a picture that looks right in the browser
 * that wrote it and wrong somewhere else, so the rectangles and the transparent
 * marker are pinned down here rather than trusted.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { GifWriter, diffFrame, tableBits } from '../../tools/video-to-gif/src/gif.js';
import { parseGif } from './gif-fixtures.js';
import { blobBytes } from './helpers.js';

const PALETTE = Uint8Array.from([
  0, 0, 0,
  255, 0, 0,
  0, 255, 0,
]);

async function writeGif(build, options = {}) {
  const writer = new GifWriter({ width: 4, height: 3, palette: PALETTE, ...options });
  build(writer);
  return parseGif(await blobBytes(writer.finish()));
}

test('the table is padded to a power of two, and the palette is at the front', async () => {
  const gif = await writeGif((writer) => {
    writer.addFrame(new Uint8Array(12), { delay: 10 });
  });

  assert.equal(gif.width, 4);
  assert.equal(gif.height, 3);
  assert.ok(gif.hasGlobalTable);
  assert.equal(gif.tableSize, 4, 'three colours are written as a table of four');
  assert.deepEqual(gif.palette.subarray(0, 9), PALETTE);
  assert.deepEqual(gif.palette.subarray(9), Uint8Array.of(0, 0, 0));
});

test('the table is large enough to hold the transparent index', async () => {
  // Sixteen colours would be a table of sixteen, and index 16 would not be in
  // it. The marker is not a colour, but it still has to be a legal index.
  const palette = new Uint8Array(16 * 3);
  const writer = new GifWriter({ width: 2, height: 2, palette, transparentIndex: 16 });
  writer.addFrame(new Uint8Array(4), { delay: 5 });
  const gif = parseGif(await blobBytes(writer.finish()));
  assert.equal(gif.tableSize, 32);
});

test('every frame carries its delay, and disposal that leaves it in place', async () => {
  const gif = await writeGif((writer) => {
    writer.addFrame(new Uint8Array(12), { delay: 7 });
    writer.addFrame(new Uint8Array(12).fill(1), { delay: 33 });
  });

  assert.equal(gif.frames.length, 2);
  assert.deepEqual(gif.frames.map((frame) => frame.control.delay), [7, 33]);
  for (const frame of gif.frames) {
    assert.equal(frame.control.disposal, 1, 'disposal 1 is "leave the frame in place"');
    assert.equal(frame.localTable, false, 'there is one palette, and it is the global one');
    assert.equal(frame.minCodeSize, 2, 'a table of four codes in two bits');
  }
});

test('a frame is written where it was told to go', async () => {
  const gif = await writeGif((writer) => {
    writer.addFrame(new Uint8Array(12), { delay: 4 });
    writer.addFrame(new Uint8Array(2), {
      delay: 4, x: 1, y: 2, width: 2, height: 1, transparent: 3,
    });
  }, { transparentIndex: 3 });

  const [first, second] = gif.frames;
  assert.deepEqual(
    [first.x, first.y, first.width, first.height], [0, 0, 4, 3],
    'a frame given no rectangle covers the whole picture');
  assert.equal(first.control.hasTransparent, false, 'and is opaque');

  assert.deepEqual([second.x, second.y, second.width, second.height], [1, 2, 2, 1]);
  assert.equal(second.control.hasTransparent, true);
  assert.equal(second.control.transparent, 3);
});

test('looping is on by default and can be turned off', async () => {
  const forever = await writeGif((writer) => writer.addFrame(new Uint8Array(12), { delay: 1 }));
  assert.equal(forever.loop, 0, 'zero means forever');

  const once = await writeGif(
    (writer) => writer.addFrame(new Uint8Array(12), { delay: 1 }),
    { loop: 1 });
  assert.equal(once.loop, 1);
});

test('the file ends with the trailer and nothing else', async () => {
  const writer = new GifWriter({ width: 4, height: 3, palette: PALETTE });
  writer.addFrame(new Uint8Array(12), { delay: 1 });
  const bytes = await blobBytes(writer.finish());
  const gif = parseGif(bytes);
  assert.equal(gif.trailerAt, bytes.length - 1);
});

test('two colours still write a table of four and a code size of two', () => {
  assert.equal(tableBits(1), 2);
  assert.equal(tableBits(2), 2);
  assert.equal(tableBits(5), 3);
  assert.equal(tableBits(255), 8);
  assert.equal(tableBits(256), 8);
});

/* ------------------------------------------------------------- differencing */

const grid = (rows) => Uint8Array.from(rows.flat());

test('two identical frames produce no difference at all', () => {
  const frame = grid([[1, 1, 1], [1, 1, 1]]);
  assert.equal(diffFrame(frame, frame.slice(), 3, 2, 9), null);
});

test('the rectangle is the smallest box holding every changed pixel', () => {
  const before = grid([
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]);
  const after = grid([
    [0, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 2, 0],
  ]);

  const changed = diffFrame(before, after, 4, 3, 9);
  assert.deepEqual(
    [changed.x, changed.y, changed.width, changed.height], [1, 1, 2, 2]);
  // Inside the box, the two pixels that did not change are the marker.
  assert.deepEqual(Array.from(changed.indices), [1, 9, 9, 2]);
  assert.equal(changed.transparent, true);
});

test('a box in which everything changed needs no transparency', () => {
  const before = grid([[0, 0], [0, 0]]);
  const after = grid([[1, 2], [3, 4]]);

  const changed = diffFrame(before, after, 2, 2, 9);
  assert.deepEqual([changed.x, changed.y, changed.width, changed.height], [0, 0, 2, 2]);
  assert.deepEqual(Array.from(changed.indices), [1, 2, 3, 4]);
  assert.equal(changed.transparent, false, 'nothing was left showing through');
});

test('one changed pixel is a one-pixel frame', () => {
  const before = new Uint8Array(100);
  const after = new Uint8Array(100);
  after[57] = 3;   // row 5, column 7 of a 10x10

  const changed = diffFrame(before, after, 10, 10, 9);
  assert.deepEqual([changed.x, changed.y, changed.width, changed.height], [7, 5, 1, 1]);
  assert.deepEqual(Array.from(changed.indices), [3]);
});
