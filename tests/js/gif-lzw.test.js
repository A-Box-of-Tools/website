/**
 * tools/video-to-gif/src/gif.js - the LZW compressor.
 *
 * The only test worth having here is a round trip, because the failure this
 * code has is not "it throws": it is a stream that decodes to something else,
 * which no amount of looking at the encoder will reveal. So the decompressor
 * below is written out in full, from the GIF89a specification and not from the
 * encoder it is checking, and every case is compressed and then expanded again.
 *
 * The cases that matter are the ones around the dictionary:
 *
 *   - a stream long and varied enough to fill all 4096 codes and force a reset,
 *     which is where an encoder and a decoder disagree about code widths if
 *     they are going to;
 *   - the widths themselves, which grow one code apart in the two directions -
 *     the decoder is always one entry behind the encoder, so each has to change
 *     width at a different point in its own counting for the stream to line up;
 *   - a two-colour image, where the code size is larger than the palette needs.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { lzwEncode } from '../../tools/video-to-gif/src/gif.js';

/** Undo the length-prefixed blocks the format packs a payload into. */
function unblock(bytes) {
  const out = [];
  let at = 0;
  while (at < bytes.length) {
    const size = bytes[at];
    at += 1;
    if (!size) break;
    for (let i = 0; i < size; i += 1) out.push(bytes[at + i]);
    at += size;
  }
  return Uint8Array.from(out);
}

/**
 * GIF's LZW, in reverse. Codes are variable width and packed least significant
 * bit first; the dictionary starts as the palette, plus a clear code and an end
 * code, and grows by one entry per code read.
 */
function lzwDecode(data, minCodeSize) {
  const clearCode = 1 << minCodeSize;
  const endCode = clearCode + 1;

  let dictionary = [];
  let width = minCodeSize + 1;
  let next = endCode + 1;

  const reset = () => {
    dictionary = [];
    for (let i = 0; i < clearCode; i += 1) dictionary.push([i]);
    dictionary.push(null, null);   // the clear and end codes are not sequences
    width = minCodeSize + 1;
    next = endCode + 1;
  };

  reset();

  const out = [];
  let bit = 0;
  let previous = null;

  const read = () => {
    let code = 0;
    for (let i = 0; i < width; i += 1) {
      const byte = data[bit >> 3] ?? 0;
      code |= ((byte >> (bit & 7)) & 1) << i;
      bit += 1;
    }
    return code;
  };

  while ((bit >> 3) < data.length) {
    const code = read();

    if (code === clearCode) {
      reset();
      previous = null;
      continue;
    }
    if (code === endCode) break;

    let entry;
    if (code < dictionary.length && dictionary[code]) {
      entry = dictionary[code];
    } else if (code === next && previous) {
      // The one case the decoder has to guess: a code for an entry the encoder
      // added on the pixel it is describing.
      entry = [...previous, previous[0]];
    } else {
      throw new Error(`code ${code} is not in the dictionary (next is ${next})`);
    }

    out.push(...entry);

    if (previous) {
      dictionary[next] = [...previous, entry[0]];
      next += 1;
      if (next === (1 << width) && width < 12) width += 1;
    }
    previous = entry;
  }

  return Uint8Array.from(out);
}

const roundTrip = (indices, minCodeSize) => lzwDecode(unblock(lzwEncode(indices, minCodeSize)), minCodeSize);

test('a run of one colour comes back unchanged', () => {
  const indices = new Uint8Array(1000).fill(7);
  assert.deepEqual(roundTrip(indices, 8), indices);
});

test('a two-colour image codes in two bits and comes back unchanged', () => {
  const indices = Uint8Array.from({ length: 500 }, (_, i) => (i % 3 === 0 ? 1 : 0));
  assert.deepEqual(roundTrip(indices, 2), indices);
});

test('random data comes back unchanged', () => {
  // Fixed seed arithmetic rather than Math.random, so a failure is reproducible.
  let seed = 12345;
  const indices = Uint8Array.from({ length: 20000 }, () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return (seed >> 16) & 0xff;
  });
  assert.deepEqual(roundTrip(indices, 8), indices);
});

test('a stream long enough to fill the dictionary and reset comes back unchanged', () => {
  // Ascending runs of growing length: every pair is new for a long time, which
  // is what fills 4096 codes rather than reusing a handful of them.
  const parts = [];
  for (let run = 1; run < 90; run += 1) {
    for (let value = 0; value < 256; value += 1) {
      for (let i = 0; i < (run % 5) + 1; i += 1) parts.push((value + run) & 0xff);
    }
  }
  const indices = Uint8Array.from(parts);
  assert.ok(indices.length > 60000, 'the fixture has to be big enough to force a reset');
  assert.deepEqual(roundTrip(indices, 8), indices);
});

test('an empty image is still a valid stream', () => {
  assert.deepEqual(roundTrip(new Uint8Array(0), 8), new Uint8Array(0));
});

test('a single pixel is still a valid stream', () => {
  assert.deepEqual(roundTrip(Uint8Array.of(42), 8), Uint8Array.of(42));
});

test('the payload is packed into blocks of at most 255 bytes', () => {
  const indices = Uint8Array.from({ length: 5000 }, (_, i) => i & 0xff);
  const packed = lzwEncode(indices, 8);

  let at = 0;
  let blocks = 0;
  while (at < packed.length) {
    const size = packed[at];
    if (!size) break;
    assert.ok(size <= 255);
    at += size + 1;
    blocks += 1;
  }
  assert.ok(blocks > 1, 'this fixture is meant to need several blocks');
  assert.equal(packed[at], 0, 'the payload ends with a zero-length block');
  assert.equal(at, packed.length - 1, 'and nothing follows it');
});
