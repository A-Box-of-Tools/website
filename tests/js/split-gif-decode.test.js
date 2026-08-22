/**
 * tools/split-gif/src/gif.js and compose.js - the GIF reader.
 *
 * The reader is checked two ways, and the difference between them matters.
 *
 * The LZW half and the container half are put through a **round trip against
 * this repository's own writer**: frames are compressed by
 * `/video-to-gif/src/gif.js` and `/gif-maker/src/lzw.js` and read back here.
 * That is worth something only because the two sides were written from the
 * GIF89a specification independently rather than from each other - a decoder
 * written by reading the encoder would agree with it about a shared mistake.
 *
 * Everything the writer cannot produce - interlacing, local colour tables,
 * disposal methods 2 and 3, GIF87a, a truncated file - is built here by hand,
 * from the specification, in `buildGif` below.
 *
 * The composition half is tested on frame objects directly rather than through
 * a file, because what is under test there is the order of three operations and
 * not the parsing that produced them.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  decodeGif, deinterlace, GifFormatError, lzwDecode, playedDelay, totalDuration,
} from '../../tools/split-gif/src/gif.js';
import {
  GifCanvas, flatten, parseColour, patchPixels,
} from '../../tools/split-gif/src/compose.js';
import {
  baseName, formatBytes, formatSeconds, frameName, timingList, zipName,
} from '../../tools/split-gif/src/frames.js';
import { GifWriter } from '../../tools/video-to-gif/src/gif.js';
import { lzwEncode } from '../../tools/gif-maker/src/lzw.js';
import { blobBytes } from './helpers.js';

/* ------------------------------------------------------------------- LZW */

test('what the maker compresses, this decompresses, byte for byte', () => {
  const indices = Uint8Array.from([0, 0, 1, 1, 2, 2, 3, 3, 0, 1, 2, 3, 3, 2, 1, 0]);
  const { indices: back, partial } = lzwDecode(lzwEncode(indices, 2), 2, indices.length);

  assert.equal(partial, false);
  assert.deepEqual(back, indices);
});

test('a payload long enough to grow the code width several times', () => {
  // Deterministic pseudo-random bytes: long enough that the dictionary passes
  // 512, 1024 and 2048 entries, which is where a decoder that widens its codes
  // one step out of step with the encoder starts producing confetti.
  const indices = new Uint8Array(40000);
  let seed = 12345;
  for (let i = 0; i < indices.length; i += 1) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    indices[i] = (seed >> 16) & 0xff;
  }

  const { indices: back, partial } = lzwDecode(lzwEncode(indices, 8), 8, indices.length);
  assert.equal(partial, false);
  assert.deepEqual(back, indices);
});

test('a payload long enough to fill the dictionary and clear it', () => {
  // 4096 entries is the ceiling; past it the encoder writes a clear code and
  // starts again. Runs of varying length over a small alphabet get there fast
  // and keep getting there.
  const parts = [];
  for (let run = 1; run < 400; run += 1) {
    for (let value = 0; value < 4; value += 1) {
      parts.push(...new Array(run % 17 + 1).fill(value));
    }
  }
  const indices = Uint8Array.from(parts);

  const { indices: back, partial } = lzwDecode(lzwEncode(indices, 2), 2, indices.length);
  assert.equal(partial, false);
  assert.deepEqual(back, indices);
});

test('a run of one repeated pixel, which is the code that is not in the table yet', () => {
  // The encoder reaches for an entry the instant it creates it, so the stream
  // contains a code the decoder has not defined. A decoder without that branch
  // fails here and nowhere else.
  const indices = new Uint8Array(5000).fill(3);
  const { indices: back } = lzwDecode(lzwEncode(indices, 2), 2, indices.length);
  assert.deepEqual(back, indices);
});

test('a code stream that stops early fills what it can and says so', () => {
  const indices = Uint8Array.from([1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3]);
  const stream = lzwEncode(indices, 2);
  const cut = stream.subarray(0, 2);

  const { indices: back, partial } = lzwDecode(cut, 2, indices.length);
  assert.equal(partial, true, 'the caller has to be able to tell');
  assert.equal(back.length, indices.length, 'and still gets a full rectangle');
});

/* ------------------------------------------------------------- interlacing */

test('interlaced rows go back where they belong', () => {
  // Eight rows, stored in the format's four passes. The value in each stored
  // row is the order it was stored in; the assertion is where each one lands.
  const width = 2;
  const height = 8;
  const stored = new Uint8Array(width * height);
  for (let row = 0; row < height; row += 1) {
    stored.fill(row, row * width, row * width + width);
  }

  const out = deinterlace(stored, width, height);
  const firstColumn = [...Array(height).keys()].map((row) => out[row * width]);

  // Passes: row 0; row 4; rows 2 and 6; rows 1, 3, 5 and 7.
  assert.deepEqual(firstColumn, [0, 4, 2, 5, 1, 6, 3, 7]);
});

/* ------------------------------------- a round trip through the real writer */

const PALETTE = Uint8Array.from([
  0, 0, 0,
  255, 0, 0,
  0, 255, 0,
]);

async function writeAndRead(build, options = {}) {
  const writer = new GifWriter({ width: 4, height: 3, palette: PALETTE, ...options });
  build(writer);
  return decodeGif(await blobBytes(writer.finish()));
}

test('the header, the palette and the loop block come back as they went in', async () => {
  const gif = await writeAndRead((writer) => {
    writer.addFrame(Uint8Array.from([0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2]), { delay: 7 });
  }, { loop: 3 });

  assert.equal(gif.width, 4);
  assert.equal(gif.height, 3);
  assert.equal(gif.loopCount, 3);
  assert.equal(gif.frames.length, 1);
  assert.deepEqual(gif.globalPalette.subarray(0, 9), PALETTE);
  assert.equal(gif.globalPalette.length, 4 * 3, 'padded to a power of two');
});

test('a frame comes back with its pixels, its delay and its rectangle', async () => {
  const pixels = Uint8Array.from([0, 1, 2, 1, 2, 0, 1, 0, 2, 2, 1, 0]);

  const gif = await writeAndRead((writer) => {
    writer.addFrame(pixels, { delay: 25 });
  });

  const [frame] = gif.frames;
  assert.deepEqual(frame.indices, pixels);
  assert.equal(frame.delay, 25);
  assert.equal(frame.x, 0);
  assert.equal(frame.y, 0);
  assert.equal(frame.width, 4);
  assert.equal(frame.height, 3);
  assert.equal(frame.disposal, 1, 'the writer leaves every frame in place');
  assert.equal(frame.transparentIndex, -1);
  assert.equal(frame.partial, false);
  assert.equal(frame.hasLocalPalette, false);
});

test('a differenced frame keeps its offset, its size and its transparent index', async () => {
  const gif = await writeAndRead((writer) => {
    writer.addFrame(new Uint8Array(12), { delay: 5 });
    writer.addFrame(Uint8Array.from([1, 3, 3, 1]), {
      delay: 5, x: 2, y: 1, width: 2, height: 2, transparent: 3,
    });
  }, { transparentIndex: 3 });

  assert.equal(gif.frames.length, 2);
  const [, second] = gif.frames;
  assert.deepEqual([second.x, second.y, second.width, second.height], [2, 1, 2, 2]);
  assert.equal(second.transparentIndex, 3);
  assert.deepEqual(second.indices, Uint8Array.from([1, 3, 3, 1]));
});

test('many frames, each with its own delay', async () => {
  const gif = await writeAndRead((writer) => {
    for (let n = 0; n < 12; n += 1) {
      writer.addFrame(new Uint8Array(12).fill(n % 3), { delay: n + 1 });
    }
  });

  assert.equal(gif.frames.length, 12);
  assert.deepEqual(gif.frames.map((frame) => frame.delay), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  assert.deepEqual(gif.frames[5].indices, new Uint8Array(12).fill(2));
});

/* --------------------------------------------- files built from the spec */

const ascii = (text) => [...text].map((character) => character.charCodeAt(0));
const u16 = (value) => [value & 0xff, (value >> 8) & 0xff];

/** The format's sub-blocks: a length byte, up to 255 bytes, repeated, then 0. */
function subBlocks(data) {
  const out = [];
  for (let at = 0; at < data.length; at += 255) {
    const run = data.subarray(at, Math.min(at + 255, data.length));
    out.push(run.length, ...run);
  }
  out.push(0);
  return out;
}

/**
 * A GIF, written here rather than by the tool's own writer, so that the parts
 * this repository never writes can still be read back: interlacing, local
 * colour tables, disposal methods other than 1, and GIF87a.
 */
function buildGif({
  width, height, palette, bits = 2, version = 'GIF89a', loop = null, frames,
}) {
  const out = [...ascii(version), ...u16(width), ...u16(height),
    0x80 | 0x70 | (bits - 1), 0, 0];

  const table = new Uint8Array((1 << bits) * 3);
  table.set(palette.subarray(0, table.length));
  out.push(...table);

  if (loop !== null) {
    out.push(0x21, 0xff, 0x0b, ...ascii('NETSCAPE2.0'), 0x03, 0x01, ...u16(loop), 0x00);
  }

  for (const frame of frames) {
    const {
      x = 0, y = 0, w, h, indices, delay = 10, disposal = 0,
      transparent = null, interlaced = false, localPalette = null,
    } = frame;

    out.push(0x21, 0xf9, 0x04,
      (disposal << 2) | (transparent === null ? 0 : 1),
      ...u16(delay),
      transparent === null ? 0 : transparent,
      0x00);

    const localBits = localPalette ? Math.max(1, Math.log2(localPalette.length / 3)) : 0;
    out.push(0x2c, ...u16(x), ...u16(y), ...u16(w), ...u16(h),
      (localPalette ? 0x80 : 0) | (interlaced ? 0x40 : 0) | (localPalette ? localBits - 1 : 0));
    if (localPalette) out.push(...localPalette);

    const minCodeSize = Math.max(2, bits);
    out.push(minCodeSize, ...subBlocks(lzwEncode(indices, minCodeSize)));
  }

  out.push(0x3b);
  return Uint8Array.from(out);
}

const FOUR = Uint8Array.from([0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255]);

test('an interlaced frame is read in the order it is displayed', () => {
  const rows = 8;
  const stored = new Uint8Array(2 * rows);
  for (let row = 0; row < rows; row += 1) stored.fill(row % 4, row * 2, row * 2 + 2);

  const gif = decodeGif(buildGif({
    width: 2, height: rows, palette: FOUR,
    frames: [{ w: 2, h: rows, indices: stored, interlaced: true }],
  }));

  const [frame] = gif.frames;
  assert.equal(frame.interlaced, true);
  assert.deepEqual(frame.indices, deinterlace(stored, 2, rows));
  assert.notDeepEqual(frame.indices, stored, 'and is not simply copied through');
});

test('a local colour table is used for that frame and only that frame', () => {
  const local = Uint8Array.from([9, 9, 9, 8, 8, 8, 7, 7, 7, 6, 6, 6]);

  const gif = decodeGif(buildGif({
    width: 2, height: 1, palette: FOUR,
    frames: [
      { w: 2, h: 1, indices: Uint8Array.from([1, 2]) },
      { w: 2, h: 1, indices: Uint8Array.from([1, 2]), localPalette: local },
    ],
  }));

  assert.equal(gif.frames[0].hasLocalPalette, false);
  assert.deepEqual(gif.frames[0].palette.subarray(0, 12), FOUR);
  assert.equal(gif.frames[1].hasLocalPalette, true);
  assert.deepEqual(gif.frames[1].palette, local);
});

test('GIF87a is read, and has no delays or loop block to find', () => {
  const gif = decodeGif(buildGif({
    width: 2, height: 1, palette: FOUR, version: 'GIF87a',
    frames: [{ w: 2, h: 1, indices: Uint8Array.from([1, 2]), delay: 0 }],
  }));

  assert.equal(gif.version, 'GIF87a');
  assert.equal(gif.loopCount, null, 'no loop block means play once');
  assert.equal(gif.frames[0].delay, 0);
});

test('every disposal method survives the trip', () => {
  const gif = decodeGif(buildGif({
    width: 2, height: 1, palette: FOUR,
    frames: [0, 1, 2, 3].map((disposal) => ({
      w: 2, h: 1, indices: Uint8Array.from([1, 2]), disposal,
    })),
  }));

  assert.deepEqual(gif.frames.map((frame) => frame.disposal), [0, 1, 2, 3]);
});

/* ------------------------------------------------------ what it refuses */

test('a file that is not a GIF is refused, and says so in words', () => {
  const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0]);
  assert.throws(() => decodeGif(png), GifFormatError);
  assert.throws(() => decodeGif(new Uint8Array(4)), GifFormatError);
});

test('a truncated file hands back the frames that were complete', () => {
  const whole = buildGif({
    width: 2, height: 1, palette: FOUR,
    frames: [
      { w: 2, h: 1, indices: Uint8Array.from([1, 2]) },
      { w: 2, h: 1, indices: Uint8Array.from([2, 3]) },
      { w: 2, h: 1, indices: Uint8Array.from([3, 1]) },
    ],
  });

  // Cut inside the third frame's blocks: two frames are whole, and the reader
  // is expected to say so rather than refuse a file a browser would play.
  const gif = decodeGif(whole.subarray(0, whole.length - 6));
  assert.ok(gif.frames.length >= 2, 'the complete frames come back');
  assert.ok(gif.truncated, 'and the damage is reported');
});

test('a file with nothing readable in it at all is an error', () => {
  const header = buildGif({
    width: 2, height: 1, palette: FOUR,
    frames: [{ w: 2, h: 1, indices: Uint8Array.from([1, 2]) }],
  }).subarray(0, 14);

  assert.throws(() => decodeGif(header), GifFormatError);
});

test('a screen size of zero is taken from the frames instead', () => {
  const gif = decodeGif(buildGif({
    width: 0, height: 0, palette: FOUR,
    frames: [{ x: 1, y: 2, w: 3, h: 4, indices: new Uint8Array(12) }],
  }));

  assert.equal(gif.width, 4);
  assert.equal(gif.height, 6);
});

/* ------------------------------------------------------------ composition */

/** A frame object of the shape decodeGif produces, without the file around it. */
function frame(options) {
  return {
    x: 0, y: 0, width: 2, height: 2, disposal: 1, delay: 10,
    transparentIndex: -1, palette: FOUR, partial: false, hasLocalPalette: false,
    ...options,
  };
}

const at = (pixels, width, x, y) => [...pixels.subarray((y * width + x) * 4, (y * width + x) * 4 + 4)];

test('the first frame is painted, opaque, in the palette it names', () => {
  const gif = {
    width: 2,
    height: 2,
    frames: [frame({ indices: Uint8Array.from([1, 2, 3, 0]) })],
  };

  const { pixels } = new GifCanvas(gif).next();
  assert.deepEqual(at(pixels, 2, 0, 0), [255, 0, 0, 255]);
  assert.deepEqual(at(pixels, 2, 1, 0), [0, 255, 0, 255]);
  assert.deepEqual(at(pixels, 2, 0, 1), [0, 0, 255, 255]);
  assert.deepEqual(at(pixels, 2, 1, 1), [0, 0, 0, 255]);
});

test('a transparent index leaves the frame underneath showing through', () => {
  const gif = {
    width: 2,
    height: 2,
    frames: [
      frame({ indices: Uint8Array.from([1, 1, 1, 1]) }),
      frame({ indices: Uint8Array.from([2, 0, 0, 0]), transparentIndex: 0 }),
    ],
  };

  const canvas = new GifCanvas(gif);
  canvas.next();
  const { pixels } = canvas.next();

  assert.deepEqual(at(pixels, 2, 0, 0), [0, 255, 0, 255], 'the one pixel it does draw');
  assert.deepEqual(at(pixels, 2, 1, 1), [255, 0, 0, 255], 'and the rest is frame one');
});

test('method 2 clears its own rectangle to transparent, not to a colour', () => {
  const gif = {
    width: 2,
    height: 2,
    frames: [
      frame({ indices: Uint8Array.from([1, 1, 1, 1]), disposal: 1 }),
      frame({ x: 0, y: 0, width: 1, height: 1, indices: Uint8Array.from([2]), disposal: 2 }),
      frame({ x: 1, y: 1, width: 1, height: 1, indices: Uint8Array.from([3]) }),
    ],
  };

  const canvas = new GifCanvas(gif);
  canvas.next();
  canvas.next();
  const { pixels } = canvas.next();

  assert.deepEqual(at(pixels, 2, 0, 0), [0, 0, 0, 0], 'the cleared pixel is transparent');
  assert.deepEqual(at(pixels, 2, 1, 0), [255, 0, 0, 255], 'and nothing else moved');
  assert.deepEqual(at(pixels, 2, 1, 1), [0, 0, 255, 255]);
});

test('method 3 restores the canvas from before its own frame, not before the last one', () => {
  // The order inside next() is the whole of this test: apply the previous
  // frame's disposal, *then* take the snapshot, then paint. Snapshotting first
  // restores a canvas that was never on screen.
  const gif = {
    width: 2,
    height: 2,
    frames: [
      frame({ indices: Uint8Array.from([1, 1, 1, 1]), disposal: 2 }),
      frame({ indices: Uint8Array.from([2, 2, 2, 2]), disposal: 3 }),
      frame({ x: 0, y: 0, width: 1, height: 1, indices: Uint8Array.from([3]) }),
    ],
  };

  const canvas = new GifCanvas(gif);
  canvas.next();
  canvas.next();
  const { pixels } = canvas.next();

  // Frame 1 cleared itself away, so what frame 2 restores is an empty canvas.
  assert.deepEqual(at(pixels, 2, 0, 0), [0, 0, 255, 255], 'frame three painted');
  assert.deepEqual(at(pixels, 2, 1, 1), [0, 0, 0, 0], 'and everything else is back to nothing');
});

test('a frame hanging off the edge of the screen is clipped, not wrapped', () => {
  const gif = {
    width: 2,
    height: 2,
    frames: [frame({ x: 1, y: 1, width: 2, height: 2, indices: Uint8Array.from([1, 2, 3, 1]) })],
  };

  const { pixels } = new GifCanvas(gif).next();
  assert.deepEqual(at(pixels, 2, 1, 1), [255, 0, 0, 255], 'the pixel that fits');
  assert.deepEqual(at(pixels, 2, 0, 0), [0, 0, 0, 0], 'and no pixel wrapped round to the start');
});

test('a stored frame is its own patch and owes nothing to its neighbours', () => {
  const patch = patchPixels(frame({
    x: 5, y: 5, width: 2, height: 1, indices: Uint8Array.from([1, 0]), transparentIndex: 0,
  }));

  assert.equal(patch.length, 2 * 1 * 4);
  assert.deepEqual([...patch.subarray(0, 4)], [255, 0, 0, 255]);
  assert.deepEqual([...patch.subarray(4)], [0, 0, 0, 0], 'the transparent one stays empty');
});

test('flattening fills what was transparent and leaves the rest alone', () => {
  const pixels = Uint8ClampedArray.from([255, 0, 0, 255, 0, 0, 0, 0]);
  flatten(pixels, { r: 1, g: 2, b: 3 });

  assert.deepEqual([...pixels.subarray(0, 4)], [255, 0, 0, 255]);
  assert.deepEqual([...pixels.subarray(4)], [1, 2, 3, 255]);
});

test('a colour that cannot be read comes back white rather than throwing', () => {
  assert.deepEqual(parseColour('#0a0b0c'), { r: 10, g: 11, b: 12 });
  assert.deepEqual(parseColour('rebeccapurple'), { r: 255, g: 255, b: 255 });
  assert.deepEqual(parseColour(null), { r: 255, g: 255, b: 255 });
});

/* ------------------------------------------------------- delays and names */

test('a delay under two hundredths is played at a tenth of a second', () => {
  assert.equal(playedDelay(0), 0.1, 'the commonest value in the wild');
  assert.equal(playedDelay(1), 0.1);
  assert.equal(playedDelay(2), 0.02, 'and two is where the clamp stops');
  assert.equal(playedDelay(25), 0.25);
});

test('the length of an animation is what a browser really plays', () => {
  const frames = [{ delay: 1 }, { delay: 1 }, { delay: 50 }];
  assert.equal(Number(totalDuration(frames).toFixed(2)), 0.7);
});

test('frame numbers are padded to the width of the last one', () => {
  assert.equal(frameName('cat.gif', 1, 9), 'cat-01.png');
  assert.equal(frameName('cat.gif', 7, 120), 'cat-007.png');
  assert.equal(frameName('cat.gif', 120, 120), 'cat-120.png');
});

test('the source name is kept, minus the extension and anything illegal', () => {
  assert.equal(baseName('holiday.gif'), 'holiday');
  assert.equal(baseName('a/b:c.gif'), 'a_b_c');
  assert.equal(baseName(''), 'animation');
  assert.equal(zipName('holiday.gif'), 'holiday-frames.zip');
});

test('the timing list carries what a PNG cannot', () => {
  const gif = { width: 4, height: 3, frames: [1, 2] };
  const rows = [
    { name: 'a-01.png', played: 0.1, frame: { delay: 1, x: 0, y: 0, width: 4, height: 3, disposal: 1 } },
    { name: 'a-02.png', played: 0.5, frame: { delay: 50, x: 1, y: 2, width: 2, height: 1, disposal: 2 } },
  ];

  const text = timingList('a.gif', gif, rows);
  const lines = text.trim().split('\n');
  const last = lines[lines.length - 1].split('\t');

  assert.ok(text.startsWith('# Frames of a'));
  assert.deepEqual(last, ['a-02.png', '0.50', '0.50', '1', '2', '2', '1', '2']);
  assert.ok(lines.some((line) => line.startsWith('a-01.png\t0.01\t0.10')),
    'the stored delay and the played delay are both written down');
});

test('sizes and durations are written the way a person reads them', () => {
  assert.equal(formatBytes(900), '900 B');
  assert.equal(formatBytes(2048), '2.0 KB');
  assert.equal(formatBytes(3 * 1024 * 1024), '3.0 MB');
  assert.equal(formatSeconds(0.08), '0.08s');
  assert.equal(formatSeconds(2.25), '2.3s');
  assert.equal(formatSeconds(61.4), '61s');
});
