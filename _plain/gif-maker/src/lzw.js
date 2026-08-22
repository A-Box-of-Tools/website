/**
 * The LZW coder GIF wraps its pixels in.
 *
 * This is the one part of a GIF that is actually compression rather than
 * bookkeeping, and it is the reason this tool needs no vendored encoder: the
 * algorithm is about eighty lines, it is fully specified, and the browser does
 * not ship it. Everything else in gif.js is a header wrapped around what comes
 * out of here.
 *
 * WHAT IT DOES
 *
 * The input is one byte per pixel - an index into the colour table, never a
 * colour. The coder keeps a dictionary that starts as the palette itself and
 * grows by one entry for every code it writes, so a run that has been seen
 * before is written as a single code. Codes are packed least-significant bit
 * first, and the code width grows from `minCodeSize + 1` up to 12 bits as the
 * dictionary fills.
 *
 * WHERE THE CODE WIDTH GROWS, AND WHY IT IS NOT WHERE YOU WOULD PUT IT
 *
 * This is the one thing in the file that is easy to get wrong and impossible to
 * notice: a stream with the width changing one code early still decodes for a
 * while, and then quietly turns into confetti somewhere in the middle of the
 * picture.
 *
 * The decoder is one entry behind the encoder. When the encoder writes code C
 * it immediately adds the entry it just learned; the decoder only adds that
 * entry when it reads the *next* code, because it needs that code's first pixel
 * to know what the entry is. So at the moment both sides are deciding how wide
 * the next code is, the decoder's table is one entry smaller than the encoder's
 * dictionary.
 *
 * The fix is to check the width *after* writing each code, against the count as
 * it stood before that code's entry was added - which is exactly what `emit`
 * below does, and exactly what the encoder in `compress.c` that every GIF
 * writer descends from does. Checking before writing, or after adding, is the
 * off-by-one.
 *
 * @see https://www.w3.org/Graphics/GIF/spec-gif89a.txt  (Appendix F)
 */

import { ByteSink } from './bytes.js';

/** The dictionary stops here: a code is at most 12 bits wide. */
const MAX_CODE = 4096;
const MAX_CODE_SIZE = 12;

/**
 * Compress one frame's colour indices.
 *
 * The result is the raw code stream. Cutting it into the 255-byte sub-blocks a
 * GIF file stores it in is the container's business, and happens in gif.js.
 *
 * @param {Uint8Array} indices   one palette index per pixel, row-major
 * @param {number} minCodeSize   bits per index; 2..8, and never below 2 even
 *   for a two-colour image, because the format says so
 * @returns {Uint8Array}
 */
export function lzwEncode(indices, minCodeSize) {
  if (!Number.isInteger(minCodeSize) || minCodeSize < 2 || minCodeSize > 8) {
    throw new RangeError(`minCodeSize must be an integer 2..8, got ${minCodeSize}`);
  }

  const clearCode = 1 << minCodeSize;
  const endCode = clearCode + 1;
  const firstFree = endCode + 1;

  const out = new ByteSink(Math.max(64, indices.length >> 1));

  let accumulator = 0;   // bits waiting to be written, LSB first
  let accumulated = 0;   // how many of them there are; always < 8 on entry
  let codeSize = minCodeSize + 1;
  let next = firstFree;  // the code the next dictionary entry will get
  let resetAfterWrite = false;

  const emit = (code) => {
    accumulator |= code << accumulated;
    accumulated += codeSize;
    while (accumulated >= 8) {
      out.byte(accumulator & 0xff);
      accumulator >>= 8;
      accumulated -= 8;
    }

    // See the note at the top: this runs after the code has been written, and
    // reads `next` as it stands before this code's entry is added.
    if (resetAfterWrite) {
      codeSize = minCodeSize + 1;
      resetAfterWrite = false;
    } else if (next > (1 << codeSize) - 1 && codeSize < MAX_CODE_SIZE) {
      codeSize += 1;
    }
  };

  emit(clearCode);

  if (indices.length > 0) {
    // The dictionary is keyed by (prefix code, next pixel). Both halves fit in
    // one integer - a prefix is at most 12 bits and a pixel is 8 - so the key
    // is arithmetic rather than a string, which is what keeps this fast enough
    // to run on the main thread.
    const dictionary = new Map();
    let prefix = indices[0];

    for (let i = 1; i < indices.length; i += 1) {
      const pixel = indices[i];
      const key = (prefix << 8) | pixel;

      const known = dictionary.get(key);
      if (known !== undefined) {
        prefix = known;
        continue;
      }

      emit(prefix);

      if (next < MAX_CODE) {
        dictionary.set(key, next);
        next += 1;
      } else {
        // Full. Tell the decoder to throw its table away and start again, at
        // the narrow code width - which is what `resetAfterWrite` defers until
        // the clear code itself has been written at the current width.
        resetAfterWrite = true;
        emit(clearCode);
        dictionary.clear();
        next = firstFree;
      }

      prefix = pixel;
    }

    emit(prefix);
  }

  emit(endCode);

  if (accumulated > 0) out.byte(accumulator & 0xff);

  return out.done();
}
