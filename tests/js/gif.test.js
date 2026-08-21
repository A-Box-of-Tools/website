/**
 * tools/gif-maker/src/ - the LZW coder and the GIF89a writer.
 *
 * A broken GIF does not report itself. It decodes for a while and then turns
 * into diagonal confetti, or it shows one frame and stops, or it loops when it
 * was told not to - and all three read as a problem with the pictures rather
 * than with the file around them. So the tests here are round trips through a
 * decoder written *in this file*, from the specification, rather than against
 * anything the writer exports.
 *
 * That is the whole point of it being here. A round trip against the encoder's
 * own idea of the format would prove the two agree with each other and nothing
 * else, and the one bug this file exists to catch - the code width growing a
 * code too early, which is the classic LZW off-by-one - is exactly the kind
 * that two halves of one implementation would share.
 *
 * @see https://www.w3.org/Graphics/GIF/spec-gif89a.txt
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { lzwEncode } from '../../tools/gif-maker/src/lzw.js';
import { GifWriter, padPalette } from '../../tools/gif-maker/src/gif.js';
import { loopValue } from '../../tools/gif-maker/src/encode.js';
import { concat } from './helpers.js';

/* ------------------------------------------------------------- the decoder */

/**
 * Read one LZW stream back to pixel indices.
 *
 * Written from the specification. The table starts as the palette plus the two
 * control codes, grows by one entry per code read, and the read width goes up
 * when the table reaches the width's capacity - which is one entry behind where
 * the encoder adds, and is the detail the whole file is here to pin down.
 */
function lzwDecode(data, minCodeSize) {
  const clearCode = 1 << minCodeSize;
  const endCode = clearCode + 1;

  let table = [];
  let codeSize = minCodeSize + 1;

  const reset = () => {
    table = [];
    for (let i = 0; i < clearCode; i += 1) table.push([i]);
    table.push(null, null); // the clear and end codes hold no pixels
    codeSize = minCodeSize + 1;
  };

  reset();

  const out = [];
  let bit = 0;
  let previous = null;

  const readCode = () => {
    let code = 0;
    for (let i = 0; i < codeSize; i += 1) {
      code |= ((data[bit >> 3] >> (bit & 7)) & 1) << i;
      bit += 1;
    }
    return code;
  };

  while (bit + codeSize <= data.length * 8) {
    const code = readCode();

    if (code === clearCode) {
      reset();
      previous = null;
      continue;
    }
    if (code === endCode) return { pixels: Uint8Array.from(out), ended: true };

    let entry;
    if (code < table.length && table[code] !== null) {
      entry = table[code];
      if (previous !== null) table.push([...table[previous], entry[0]]);
    } else {
      assert.notEqual(previous, null, 'a stream may not open with an unknown code');
      entry = [...table[previous], table[previous][0]];
      table.push(entry);
    }

    out.push(...entry);
    previous = code;

    if (table.length >= (1 << codeSize) && codeSize < 12) codeSize += 1;
  }

  return { pixels: Uint8Array.from(out), ended: false };
}

/** Read the sub-block chain at `at` and join it. */
function readSubBlocks(bytes, at) {
  const parts = [];
  for (;;) {
    const length = bytes[at];
    at += 1;
    if (length === 0) return { data: concat(...parts), at };
    parts.push(bytes.subarray(at, at + length));
    at += length;
  }
}

/**
 * Read a whole GIF back into something assertable. Deliberately strict: an
 * unknown block is an error rather than something to skip past, because the
 * writer is not supposed to be producing any.
 */
function readGif(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const u16 = (at) => view.getUint16(at, true);

  assert.equal(String.fromCharCode(...bytes.subarray(0, 6)), 'GIF89a');

  const file = {
    width: u16(6),
    height: u16(8),
    globalPalette: null,
    background: bytes[11],
    aspect: bytes[12],
    loop: null,
    frames: [],
  };

  // The signature is six bytes and the logical screen descriptor is seven, so
  // whatever comes next starts here.
  let at = 13;

  const packed = bytes[10];
  if (packed & 0x80) {
    const entries = 1 << ((packed & 0x07) + 1);
    file.globalPalette = bytes.subarray(at, at + entries * 3);
    at += entries * 3;
  }

  /** Whatever the last graphic control extension said, for the next frame. */
  let control = null;

  for (;;) {
    const block = bytes[at];
    at += 1;

    if (block === 0x3b) {
      assert.equal(at, bytes.length, 'the trailer is the last byte in the file');
      return file;
    }

    if (block === 0x21) {
      const label = bytes[at];
      at += 1;

      if (label === 0xf9) {
        assert.equal(bytes[at], 4, 'a graphic control extension is four bytes long');
        const flags = bytes[at + 1];
        control = {
          disposal: (flags >> 2) & 0x07,
          transparent: (flags & 1) === 1,
          delay: u16(at + 2),
          transparentIndex: bytes[at + 4],
        };
        at += 5;
        assert.equal(bytes[at], 0, 'and is terminated');
        at += 1;
        continue;
      }

      if (label === 0xff) {
        assert.equal(bytes[at], 11);
        const name = String.fromCharCode(...bytes.subarray(at + 1, at + 12));
        assert.equal(name, 'NETSCAPE2.0');
        at += 12;
        const { data, at: after } = readSubBlocks(bytes, at);
        assert.equal(data[0], 1, 'sub-block 1 is the loop counter');
        file.loop = data[1] | (data[2] << 8);
        at = after;
        continue;
      }

      throw new Error(`unexpected extension 0x${label.toString(16)}`);
    }

    if (block === 0x2c) {
      const frame = {
        left: u16(at),
        top: u16(at + 2),
        width: u16(at + 4),
        height: u16(at + 6),
        palette: file.globalPalette,
        local: false,
        ...control,
      };
      const framePacked = bytes[at + 8];
      at += 9;

      assert.equal(framePacked & 0x40, 0, 'nothing here is interlaced');

      if (framePacked & 0x80) {
        const entries = 1 << ((framePacked & 0x07) + 1);
        frame.palette = bytes.subarray(at, at + entries * 3);
        frame.local = true;
        at += entries * 3;
      }

      const minCodeSize = bytes[at];
      at += 1;
      const { data, at: after } = readSubBlocks(bytes, at);
      at = after;

      const { pixels, ended } = lzwDecode(data, minCodeSize);
      assert.ok(ended, 'every frame ends with the end-of-information code');
      assert.equal(pixels.length, frame.width * frame.height);

      frame.minCodeSize = minCodeSize;
      frame.indices = pixels;
      file.frames.push(frame);
      control = null;
      continue;
    }

    throw new Error(`unexpected block 0x${block.toString(16)} at ${at - 1}`);
  }
}

/* ----------------------------------------------------------------- fixtures */

/** A deterministic pseudo-random source, so a failure is reproducible. */
function noise(length, symbols, seed = 1) {
  const out = new Uint8Array(length);
  let state = seed;
  for (let i = 0; i < length; i += 1) {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    out[i] = (state >> 8) % symbols;
  }
  return out;
}

const solid = (length, value) => new Uint8Array(length).fill(value);

const greyPalette = (count) => {
  const out = new Uint8Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    out[i * 3] = i;
    out[i * 3 + 1] = i;
    out[i * 3 + 2] = i;
  }
  return out;
};

/* ---------------------------------------------------------------- the coder */

test('LZW: a run of one colour survives the round trip', () => {
  const pixels = solid(1000, 3);
  const { pixels: back } = lzwDecode(lzwEncode(pixels, 4), 4);
  assert.deepEqual(back, pixels);
});

test('LZW: a single pixel survives', () => {
  const { pixels } = lzwDecode(lzwEncode(new Uint8Array([7]), 4), 4);
  assert.deepEqual(pixels, new Uint8Array([7]));
});

test('LZW: the stream opens with a clear code', () => {
  // Four colours, so codes are five bits wide and the clear code is 4. The
  // first five bits of the stream are it, least significant bit first.
  const bytes = lzwEncode(new Uint8Array([0, 1, 2, 3]), 2);
  assert.equal(bytes[0] & 0b111, 4);
});

for (const symbols of [2, 4, 16, 256]) {
  test(`LZW: noise over ${symbols} symbols survives the round trip`, () => {
    // Long enough, and unpredictable enough, to walk the code width from its
    // narrowest all the way to twelve bits - which is where an off-by-one in
    // the growth rule stops being invisible.
    const minCodeSize = Math.max(2, Math.ceil(Math.log2(symbols)));
    const pixels = noise(120_000, symbols, 7);
    const { pixels: back } = lzwDecode(lzwEncode(pixels, minCodeSize), minCodeSize);
    assert.deepEqual(back, pixels);
  });
}

test('LZW: a full dictionary is cleared and the stream carries on', () => {
  // 300,000 pixels of noise over the whole palette fills 4096 entries several
  // times over, so this only round-trips if the reset is written where the
  // decoder expects it: after the clear code, not before it.
  const pixels = noise(300_000, 256, 99);
  const encoded = lzwEncode(pixels, 8);

  // More than 4096 codes have to have been written for the dictionary to have
  // filled at all, so this is the guard that the fixture is really exercising
  // the reset rather than passing because it never got there.
  assert.ok(encoded.length * 8 > 4096 * 12, 'the fixture is long enough to fill the dictionary');

  const { pixels: back } = lzwDecode(encoded, 8);
  assert.deepEqual(back, pixels);
});

test('LZW: an impossible minimum code size is refused', () => {
  assert.throws(() => lzwEncode(new Uint8Array([0]), 1), RangeError);
  assert.throws(() => lzwEncode(new Uint8Array([0]), 9), RangeError);
});

/* --------------------------------------------------------- the colour table */

test('a colour table is padded up to a power of two', () => {
  assert.equal(padPalette(greyPalette(3)).table.length, 4 * 3);
  assert.equal(padPalette(greyPalette(3)).depth, 2);
  assert.equal(padPalette(greyPalette(200)).table.length, 256 * 3);
  assert.equal(padPalette(greyPalette(200)).depth, 8);
  assert.equal(padPalette(greyPalette(256)).depth, 8);
});

test('padding leaves the colours that were given alone', () => {
  const { table } = padPalette(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9]));
  assert.deepEqual(Array.from(table.subarray(0, 9)), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  assert.deepEqual(Array.from(table.subarray(9)), [0, 0, 0]);
});

test('a table of more than 256 colours is refused', () => {
  assert.throws(() => padPalette(new Uint8Array(257 * 3)), RangeError);
});

/* ---------------------------------------------------------------- the file */

test('one frame: the pixels come back out as they went in', () => {
  const indices = noise(8 * 5, 16, 3);

  const writer = new GifWriter({ width: 8, height: 5, palette: greyPalette(16) });
  writer.addFrame({ indices, delay: 25 });
  const file = readGif(writer.finalize());

  assert.equal(file.width, 8);
  assert.equal(file.height, 5);
  assert.equal(file.frames.length, 1);
  assert.deepEqual(file.frames[0].indices, indices);
  assert.equal(file.frames[0].delay, 25);
  assert.equal(file.frames[0].left, 0);
  assert.equal(file.frames[0].top, 0);
  assert.equal(file.frames[0].width, 8);
  assert.equal(file.frames[0].height, 5);
});

test('the shared table is written once and every frame uses it', () => {
  const writer = new GifWriter({ width: 4, height: 4, palette: greyPalette(4) });
  writer.addFrame({ indices: solid(16, 1), delay: 10 });
  writer.addFrame({ indices: solid(16, 2), delay: 10 });
  const file = readGif(writer.finalize());

  assert.equal(file.globalPalette.length, 4 * 3);
  assert.equal(file.frames.length, 2);
  for (const frame of file.frames) assert.equal(frame.local, false);
});

test('a frame may carry a table of its own', () => {
  const mine = new Uint8Array([9, 9, 9, 8, 8, 8]);

  const writer = new GifWriter({ width: 2, height: 2, palette: greyPalette(4) });
  writer.addFrame({ indices: solid(4, 1), delay: 10 });
  writer.addFrame({ indices: solid(4, 1), delay: 10, palette: mine });
  const file = readGif(writer.finalize());

  assert.equal(file.frames[0].local, false);
  assert.equal(file.frames[1].local, true);
  assert.deepEqual(Array.from(file.frames[1].palette), Array.from(mine));
});

test('a frame with no table at all, shared or local, is refused', () => {
  const writer = new GifWriter({ width: 2, height: 2 });
  assert.throws(() => writer.addFrame({ indices: solid(4, 0), delay: 10 }), /palette/);
});

test('a frame of the wrong length is refused rather than written short', () => {
  const writer = new GifWriter({ width: 4, height: 4, palette: greyPalette(4) });
  assert.throws(() => writer.addFrame({ indices: solid(15, 0), delay: 10 }), RangeError);
});

test('an empty file is refused', () => {
  const writer = new GifWriter({ width: 4, height: 4, palette: greyPalette(4) });
  assert.throws(() => writer.finalize(), /at least one frame/);
});

test('a size the format cannot express is refused', () => {
  assert.throws(() => new GifWriter({ width: 0, height: 10 }), RangeError);
  assert.throws(() => new GifWriter({ width: 10, height: 70000 }), RangeError);
});

test('delays are written in hundredths of a second, per frame', () => {
  const writer = new GifWriter({ width: 2, height: 2, palette: greyPalette(2) });
  writer.addFrame({ indices: solid(4, 0), delay: 3 });
  writer.addFrame({ indices: solid(4, 1), delay: 250 });
  const file = readGif(writer.finalize());

  assert.deepEqual(file.frames.map((f) => f.delay), [3, 250]);
});

test('looping forever writes a Netscape block holding zero', () => {
  const writer = new GifWriter({ width: 2, height: 2, palette: greyPalette(2), loop: 0 });
  writer.addFrame({ indices: solid(4, 0), delay: 10 });
  assert.equal(readGif(writer.finalize()).loop, 0);
});

test('a count is written as itself', () => {
  const writer = new GifWriter({ width: 2, height: 2, palette: greyPalette(2), loop: 5 });
  writer.addFrame({ indices: solid(4, 0), delay: 10 });
  assert.equal(readGif(writer.finalize()).loop, 5);
});

test('playing once writes no loop block at all', () => {
  // Rather than a count of one, which decoders disagree about. readGif leaves
  // `loop` null when it never sees the block, and would throw on an unexpected
  // one, so this asserts both halves.
  const writer = new GifWriter({ width: 2, height: 2, palette: greyPalette(2), loop: null });
  writer.addFrame({ indices: solid(4, 0), delay: 10 });
  assert.equal(readGif(writer.finalize()).loop, null);
});

test('loopValue turns the page\'s three choices into that', () => {
  assert.equal(loopValue('forever', 3), 0);
  assert.equal(loopValue('once', 3), null);
  assert.equal(loopValue('times', 4), 4);
  assert.equal(loopValue('times', 0), 1, 'a count below one is not a count');
  assert.equal(loopValue('times', 1e9), 65535, 'and the field is sixteen bits');
});

test('an opaque frame keeps what it drew; a transparent one clears it', () => {
  const writer = new GifWriter({ width: 2, height: 2, palette: greyPalette(4) });
  writer.addFrame({ indices: solid(4, 1), delay: 10 });
  writer.addFrame({ indices: solid(4, 0), delay: 10, transparentIndex: 0 });
  const file = readGif(writer.finalize());

  assert.equal(file.frames[0].transparent, false);
  assert.equal(file.frames[0].disposal, 1, 'keep');

  assert.equal(file.frames[1].transparent, true);
  assert.equal(file.frames[1].transparentIndex, 0);
  assert.equal(file.frames[1].disposal, 2, 'restore to background');
});

test('a two-colour frame still uses a minimum code size of two', () => {
  // One bit per pixel would do, and is not allowed: the clear and end codes
  // have to fit beside the colours.
  const writer = new GifWriter({ width: 4, height: 4, palette: greyPalette(2) });
  writer.addFrame({ indices: noise(16, 2, 5), delay: 10 });
  const file = readGif(writer.finalize());

  assert.equal(file.frames[0].minCodeSize, 2);
});

test('a large noisy frame survives the round trip', () => {
  // The case that exercises everything at once: sub-blocks longer than 255
  // bytes, the code width climbing to twelve, and the dictionary filling.
  const width = 320;
  const height = 240;
  const indices = noise(width * height, 256, 42);

  const writer = new GifWriter({ width, height, palette: greyPalette(256), loop: 0 });
  writer.addFrame({ indices, delay: 4 });
  const file = readGif(writer.finalize());

  assert.deepEqual(file.frames[0].indices, indices);
});

test('the screen is square-pixel and the background index is written', () => {
  const writer = new GifWriter({ width: 3, height: 3, palette: greyPalette(4) });
  writer.addFrame({ indices: solid(9, 0), delay: 10 });
  const file = readGif(writer.finalize());

  assert.equal(file.aspect, 0);
  assert.equal(file.background, 0);
});
