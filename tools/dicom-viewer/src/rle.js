/**
 * RLE Lossless, which is PackBits with a table in front of it. PS3.5 annex G.
 *
 * The only compressed transfer syntax in DICOM that a page can decode in fifty
 * lines, and the reason this tool opens more files than it otherwise would.
 * Ultrasound and secondary capture archives are full of it.
 *
 * WHY THE SEGMENTS ARE BYTE PLANES AND NOT PIXELS
 *
 * A frame is split into up to fifteen segments, and a segment is one *byte* of
 * one sample - not one sample and not one row. A 16-bit greyscale frame is two
 * segments: every high byte of every pixel, then every low byte of every pixel.
 * An 8-bit RGB frame is three: all the red, all the green, all the blue.
 *
 * That is what makes it compress at all. The high bytes of a CT slice are
 * nearly all the same value, so a run-length coder eats them; interleaved with
 * the low bytes they would be a different value every second byte and the
 * "compressed" frame would be larger than the original. It is also the part
 * readers get wrong, and getting it wrong on a 16-bit image produces a picture
 * that is recognisable and wrong - the anatomy is there, the numbers are not,
 * and nothing on screen says so.
 *
 * The high byte comes first. PS3.5 G.2: segment 0 is the most significant byte
 * of sample 0, whatever byte order the rest of the file is in.
 */

import { refuse } from './refusal.js';

/**
 * One frame, expanded.
 *
 * @param {Uint8Array} bytes         the fragment, header and all
 * @param {number} pixels            rows times columns
 * @param {number} samples           1 for greyscale, 3 for colour
 * @param {number} bytesPerSample    1 or 2
 * @returns {Uint8Array} the frame, sample-interleaved, in the file's own byte
 *   order for each sample - which is to say exactly what an uncompressed
 *   Pixel Data element of the same image would have held, so that pixels.js
 *   has one path rather than two.
 */
export function decodeRLE(bytes, pixels, samples, bytesPerSample) {
  if (bytes.length < 64) {
    throw refuse('rle.short');
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const count = view.getUint32(0, true);
  const wanted = samples * bytesPerSample;

  if (count < 1 || count > 15) {
    throw refuse('rle.segments', { count });
  }
  if (count < wanted) {
    throw refuse('rle.wrongcount', { wanted, count });
  }

  const offsets = [];
  for (let at = 0; at < count; at += 1) offsets.push(view.getUint32(4 + at * 4, true));

  const out = new Uint8Array(pixels * wanted);

  for (let segment = 0; segment < wanted; segment += 1) {
    const from = offsets[segment];
    const to = segment + 1 < count ? offsets[segment + 1] : bytes.length;
    if (from < 64 || from > bytes.length || to > bytes.length || to < from) {
      throw refuse('rle.outside', { segment });
    }

    // Which byte of which sample this segment holds, and therefore where in the
    // interleaved output each of its bytes belongs. Segment 0 is the top byte,
    // so a 16-bit sample wants it at the *end* of the pair on a little-endian
    // file - which every file carrying RLE is.
    const sample = Math.floor(segment / bytesPerSample);
    const byte = segment % bytesPerSample;
    const start = sample * bytesPerSample + (bytesPerSample - 1 - byte);

    unpack(bytes.subarray(from, to), out, start, wanted, pixels);
  }

  return out;
}

/**
 * PackBits, scattered into every `stride`th byte of the output.
 *
 * The scatter is what saves a pass: expanding each segment into its own buffer
 * and interleaving afterwards would mean allocating and copying the whole frame
 * a second time, and on a 4096x4096 mammogram that is thirty-two megabytes of
 * pure bookkeeping.
 *
 * A run that would overrun the frame is clipped rather than throwing. Encoders
 * pad the last segment to an even length, and a file whose last run is one byte
 * long is not a file worth refusing.
 */
function unpack(segment, out, start, stride, pixels) {
  const end = start + pixels * stride;
  let write = start;
  let at = 0;

  while (at < segment.length && write < end) {
    const control = segment[at++];

    if (control === 128) continue;          // 0x80: a no-op, and rare

    if (control < 128) {
      // A literal run: the next control + 1 bytes, as they are.
      const run = control + 1;
      for (let step = 0; step < run && at < segment.length && write < end; step += 1) {
        out[write] = segment[at++];
        write += stride;
      }
      continue;
    }

    // A replicate run: the next byte, 257 - control times.
    const run = 257 - control;
    if (at >= segment.length) break;
    const value = segment[at++];
    for (let step = 0; step < run && write < end; step += 1) {
      out[write] = value;
      write += stride;
    }
  }
}
