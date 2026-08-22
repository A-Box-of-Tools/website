/**
 * From a list of frames to a finished file.
 *
 * The three steps are in quantize.js and gif.js; what is here is the order they
 * happen in and the one piece of bookkeeping that belongs to neither: what to do
 * with a frame identical to the one before it.
 *
 * A section of video where nothing moves - a held shot, a title card, a pause
 * between two gestures - samples to several identical frames. Writing them is
 * pure waste: each costs a full LZW block to say "no change". Dropping them and
 * giving their time to the frame before instead costs nothing at all, and is
 * why each frame is held back until the next one proves it has to be written.
 * That is also why the delays are accumulated rather than written as they
 * arrive: a frame that stands in for four is on screen for four frames' worth
 * of time, and the animation has to come out the length it was cut to.
 */

import { ColorHistogram, Palette, medianCut, amplitudeFor, quantizeFrame } from './quantize.js';
import { GifWriter, diffFrame } from './gif.js';

/**
 * The largest palette that can be differenced.
 *
 * 256 entries and one of them has to be the "unchanged" marker, which is not a
 * colour. Giving up one colour to keep the differencing is not a close call:
 * the 256th colour is invisible and the differencing is most of the file size.
 */
export const MAX_COLORS = 255;

/** GIF's delay field is sixteen bits of hundredths - about eleven minutes. */
const MAX_DELAY = 0xffff;

/** Frames between handing the page back so the progress bar can paint. */
const YIELD_EVERY = 8;

const breathe = () => new Promise((resolve) => { setTimeout(resolve, 0); });

/**
 * @param {object} args
 * @param {Array<Uint8ClampedArray|null>} args.frames  RGBA, one per frame. This
 *   array is emptied as it goes: each frame is released as soon as it has been
 *   quantized, so a long animation does not hold both its pixels and its
 *   indices at once.
 * @param {ColorHistogram} args.histogram  filled while the frames were read
 * @param {number[]} args.delays  hundredths of a second, one per frame
 * @param {number} args.width
 * @param {number} args.height
 * @param {number} [args.colors]  palette size to aim for
 * @param {boolean} [args.dither]
 * @param {boolean} [args.loop]
 * @returns {Promise<{blob: Blob, colors: number, written: number, dropped: number}>}
 */
export async function encodeGif({
  frames, histogram, delays, width, height,
  colors = MAX_COLORS, dither = true, loop = true, onProgress, signal,
}) {
  const palette = new Palette(medianCut(histogram, Math.min(MAX_COLORS, colors)));
  const amplitude = dither ? amplitudeFor(palette.rgb) : 0;

  // The marker sits one past the last real colour, so it is inside the table
  // the format writes and outside the colours anything can quantize to.
  const transparent = palette.size;

  const writer = new GifWriter({
    width, height, palette: palette.rgb, transparentIndex: transparent, loop: loop ? 0 : 1,
  });

  const pixels = width * height;
  let previous = null;
  let current = new Uint8Array(pixels);

  /** The frame written last, held back until the next one differs from it. */
  let held = null;
  let heldDelay = 0;
  let written = 0;
  let dropped = 0;

  const flush = () => {
    if (!held) return;
    writer.addFrame(held.indices, {
      x: held.x,
      y: held.y,
      width: held.width,
      height: held.height,
      transparent: held.transparent,
      delay: Math.min(MAX_DELAY, heldDelay),
    });
    written += 1;
  };

  for (let i = 0; i < frames.length; i += 1) {
    if (signal?.aborted) {
      const error = new Error('Cancelled.');
      error.name = 'AbortError';
      throw error;
    }

    const indices = quantizeFrame(frames[i], width, height, palette, amplitude, current);
    frames[i] = null;

    let block;
    if (previous === null) {
      // The first frame is the whole picture, opaque: there is nothing behind
      // it for a transparent pixel to reveal.
      block = {
        indices: indices.slice(), x: 0, y: 0, width, height, transparent: null,
      };
    } else {
      const changed = diffFrame(previous, indices, width, height, transparent);
      if (!changed) {
        heldDelay += delays[i];
        dropped += 1;
        continue;
      }
      block = {
        indices: changed.indices,
        x: changed.x,
        y: changed.y,
        width: changed.width,
        height: changed.height,
        transparent: changed.transparent ? transparent : null,
      };
    }

    flush();
    held = block;
    heldDelay = delays[i];

    // The buffer the last frame is in has to survive as the thing the next one
    // is compared against, so the two swap rather than one being reallocated.
    const spare = previous ?? new Uint8Array(pixels);
    previous = indices;
    current = spare;

    if (i % YIELD_EVERY === 0) {
      onProgress?.({ phase: 'encoding', done: i + 1, total: frames.length });
      await breathe();
    }
  }

  flush();
  onProgress?.({ phase: 'encoding', done: frames.length, total: frames.length });

  return {
    blob: writer.finish(),
    colors: palette.size,
    written,
    dropped,
  };
}

export { ColorHistogram };
