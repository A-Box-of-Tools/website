/**
 * GIF's LZW, in reverse.
 *
 * Codes are variable width and packed least significant bit first. The
 * dictionary starts as the palette itself - one entry per colour - plus a clear
 * code and an end code, and grows by one entry for every code read, widening by
 * a bit each time it fills. That is the whole scheme; it is from 1984 and it is
 * why a GIF of a screenshot is small and a GIF of a photograph is not.
 *
 * The dictionary is three flat arrays rather than an array of arrays. An entry
 * is "some earlier entry, plus one byte", so `prefix` says which earlier entry
 * and `suffix` says which byte; expanding one means walking the chain backwards
 * onto a stack and reading it off forwards. 4096 entries of three typed arrays
 * is 20 KB allocated once, against 4096 JavaScript arrays that grow.
 *
 * WHY IT COUNTS THINGS
 *
 * This is an analyzer, so the decoder reports on the stream as well as
 * expanding it: how many codes it read, and how many times the encoder gave up
 * and reset the dictionary. A reset means the encoder hit 4096 entries and
 * started again, and a frame with several of them is a frame whose compressor
 * was struggling - which is a real answer to "why is this file so big" and is
 * not visible anywhere else.
 *
 * WHAT IT DOES WITH A BROKEN STREAM
 *
 * It stops and says so, with whatever pixels it had. A truncated frame drawn as
 * far as it goes is more use to somebody analysing a damaged file than an
 * exception, and the flags say exactly which of the three things went wrong.
 */

/** The largest dictionary the format allows: twelve bits of code. */
const MAX_CODES = 4096;

/**
 * @param {Uint8Array} data  the frame's compressed bytes, sub-blocks joined
 * @param {number} minCodeSize  the byte in front of them, 2..8
 * @param {number} pixelCount  width * height: how many indices to expect
 * @returns {{indices: Uint8Array, pixels: number, codes: number, clears: number,
 *            complete: boolean, truncated: boolean,
 *            corrupt: {key: string, values: object}|null}}
 */
export function lzwDecode(data, minCodeSize, pixelCount) {
  if (minCodeSize < 2 || minCodeSize > 8) {
    return fail(pixelCount,
      { key: 'decode.codesize', values: { size: minCodeSize } });
  }

  const clearCode = 1 << minCodeSize;
  const endCode = clearCode + 1;

  const indices = new Uint8Array(pixelCount);
  const prefix = new Uint16Array(MAX_CODES);
  const suffix = new Uint8Array(MAX_CODES);
  const stack = new Uint8Array(MAX_CODES);

  for (let code = 0; code < clearCode; code += 1) suffix[code] = code;

  let next = endCode + 1;
  let width = minCodeSize + 1;
  let previous = -1;

  let bitBuffer = 0;
  let bitCount = 0;
  let at = 0;

  let out = 0;
  let codes = 0;
  let clears = 0;
  let complete = false;
  let truncated = false;
  let corrupt = null;

  reading: while (true) {
    // Fill the bit buffer. Twelve is the widest a code gets and eight the most
    // a byte adds, so this never holds more than nineteen bits and stays inside
    // what a 32-bit shift can carry.
    while (bitCount < width) {
      if (at >= data.length) {
        truncated = true;
        break reading;
      }
      bitBuffer |= data[at] << bitCount;
      at += 1;
      bitCount += 8;
    }

    const code = bitBuffer & ((1 << width) - 1);
    bitBuffer >>= width;
    bitCount -= width;
    codes += 1;

    if (code === clearCode) {
      next = endCode + 1;
      width = minCodeSize + 1;
      previous = -1;
      clears += 1;
      continue;
    }

    if (code === endCode) {
      complete = true;
      break;
    }

    // The first code after a reset has to be a colour: there is nothing in the
    // dictionary yet for anything else to refer back to.
    if (previous < 0) {
      if (code >= clearCode) {
        corrupt = { key: 'decode.codefirst', values: { code: code.toLocaleString() } };
        break;
      }
      if (out < pixelCount) indices[out] = suffix[code];
      out += 1;
      previous = code;
      continue;
    }

    // The one case that looks like a paradox: a code for an entry that has not
    // been added yet. It is always the entry about to be added, which is the
    // previous string plus its own first byte - so it can be expanded from what
    // is already known. Anything further ahead than that is a corrupt stream.
    let walk = code;
    let top = 0;
    if (code > next) {
      corrupt = {
        key: 'decode.codemissing',
        values: { code: code.toLocaleString(), entries: next.toLocaleString() },
      };
      break;
    }
    if (code === next) {
      stack[top] = firstByte(prefix, suffix, clearCode, previous);
      top += 1;
      walk = previous;
    }

    while (walk >= clearCode) {
      stack[top] = suffix[walk];
      top += 1;
      walk = prefix[walk];
    }
    stack[top] = walk;
    top += 1;

    // The chain came off backwards, so it goes out backwards.
    while (top > 0) {
      top -= 1;
      if (out < pixelCount) indices[out] = stack[top];
      out += 1;
    }

    if (next < MAX_CODES) {
      prefix[next] = previous;
      suffix[next] = walk;
      next += 1;
      // The dictionary widens when it fills, and stops at twelve bits. An
      // encoder that keeps going without a clear code is relying on the decoder
      // holding still here, which every decoder does.
      if (next === (1 << width) && width < 12) width += 1;
    }

    previous = code;
  }

  return {
    indices,
    pixels: Math.min(out, pixelCount),
    // What the frame claimed against what its stream actually produced. Not the
    // same thing on a damaged file, and the difference is worth showing.
    overrun: Math.max(0, out - pixelCount),
    codes,
    clears,
    bytesRead: at,
    complete,
    truncated,
    corrupt,
  };
}

/** The first byte of a dictionary entry: the far end of its chain. */
function firstByte(prefix, suffix, clearCode, code) {
  let walk = code;
  while (walk >= clearCode) walk = prefix[walk];
  return walk;
}

function fail(pixelCount, why) {
  return {
    indices: new Uint8Array(pixelCount),
    pixels: 0,
    overrun: 0,
    codes: 0,
    clears: 0,
    bytesRead: 0,
    complete: false,
    truncated: false,
    corrupt: why,
  };
}
