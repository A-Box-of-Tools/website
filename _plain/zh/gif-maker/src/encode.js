/**
 * The export loop: decode a picture, draw it into the frame, choose its colours,
 * write it, and do it again.
 *
 * Nothing here touches the network, and nothing here is asynchronous except the
 * decoding - which is also what keeps the page responsive, because awaiting each
 * decode hands the main thread back between frames. A worker would be tidier and
 * would cost this tool a blob: worker source in its Content-Security-Policy for
 * a job that is already fast enough to watch happen.
 *
 * THE TWO WAYS THE COLOURS CAN BE CHOSEN
 *
 * Per frame, each picture gets the 256 colours that suit it best. That is the
 * better-looking answer for a set of unrelated photographs, and it is why it is
 * the default.
 *
 * Shared, one table is built from every frame at once and all of them use it.
 * That takes a second pass - the histogram has to see every picture before any
 * of them can be written - and it is what stops the flicker you get when a
 * fifth of a scene changes and the palette lurches with it. For frames out of
 * one video, or one scene, it is the right answer and the smaller file.
 */

import { GifWriter } from './gif.js';
import { createHistogram, addToHistogram, buildPalette, mapFrame } from './quantize.js';
import { drawFrame } from './compose.js';
import { decodeFull } from './images.js';

class AbortedError extends Error {
  constructor() {
    super('Export cancelled.');
    this.name = 'AbortError';
  }
}

function throwIfAborted(signal) {
  if (signal?.aborted) throw new AbortedError();
}

/** Hand the main thread back so a click on Cancel is heard and the bar moves. */
const yieldToPage = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * How many times the animation is played, as the loop block wants it.
 *
 * 'once' writes no block at all rather than a count of one. The count is the
 * one field in a GIF that decoders have never fully agreed on - some play a
 * count of n exactly n times and some play it n+1 - and a file with no loop
 * block is played once by every one of them.
 */
export function loopValue(mode, times) {
  if (mode === 'once') return null;
  if (mode === 'forever') return 0;
  const value = Math.round(Number(times));
  return Number.isFinite(value) ? Math.max(1, Math.min(65535, value)) : 0;
}

/**
 * @param {object} args
 * @param {object[]} args.items  in order, each with a `delay` in seconds
 * @param {object} args.settings
 * @param {(progress: object) => void} [args.onProgress]
 * @param {AbortSignal} [args.signal]
 * @returns {Promise<{blob: Blob, width: number, height: number, frames: number}>}
 */
export async function encodeGif({ items, settings, onProgress, signal }) {
  const {
    width, height, fit, background, colors, dither, sharedPalette, transparent, loop,
  } = settings;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  // willReadFrequently, because every single frame is drawn and then read back
  // out with getImageData. Without it the canvas is kept on the GPU and each
  // read is a stall.
  const ctx = canvas.getContext('2d', { alpha: true, willReadFrequently: true });

  // One index is spent on "transparent" when transparency is being kept, so the
  // colours start at 1 and there is one fewer of them to go round.
  const reserved = transparent ? 1 : 0;
  const wanted = Math.max(2, Math.min(256, colors) - reserved);

  const total = items.length * (sharedPalette ? 2 : 1);
  let step = 0;

  const report = (phase) => {
    step += 1;
    onProgress?.({ phase, done: step, total });
  };

  /** Draw one item into the canvas and hand back its pixels. */
  const pixelsFor = async (item) => {
    const bitmap = await decodeFull(item);
    try {
      drawFrame(ctx, bitmap, { fit, background: transparent ? null : background });
    } finally {
      bitmap.close();
    }
    return ctx.getImageData(0, 0, width, height).data;
  };

  let shared = null;
  if (sharedPalette) {
    const histogram = createHistogram();
    for (const item of items) {
      throwIfAborted(signal);
      addToHistogram(histogram, await pixelsFor(item), transparent);
      report('palette');
      await yieldToPage();
    }
    shared = withReserved(buildPalette(histogram, wanted), reserved);
  }

  const writer = new GifWriter({ width, height, palette: shared, loop });

  for (const item of items) {
    throwIfAborted(signal);

    const rgba = await pixelsFor(item);

    let palette = shared;
    if (!palette) {
      const histogram = addToHistogram(createHistogram(), rgba, transparent);
      palette = withReserved(buildPalette(histogram, wanted), reserved);
    }

    writer.addFrame({
      indices: mapFrame(rgba, width, height, palette, {
        dither,
        from: reserved,
        transparentIndex: transparent ? 0 : -1,
      }),
      // A shared table is written once, at the top of the file. A per-frame one
      // is written again for every frame, which is up to 768 bytes each and the
      // smaller half of what the choice costs.
      palette: shared ? null : palette,
      delay: Math.round(item.delay * 100),
      transparentIndex: transparent ? 0 : -1,
    });

    report('writing');
    await yieldToPage();
  }

  const bytes = writer.finalize();
  return {
    blob: new Blob([bytes], { type: 'image/gif' }),
    width,
    height,
    frames: writer.frames,
  };
}

/**
 * Put `reserved` unused entries in front of a palette.
 *
 * Index 0 is the transparent one when there is transparency, and it needs a
 * colour anyway: a decoder that ignores the transparency flag - a still-image
 * viewer taking the first frame, say - paints whatever is there. Black is the
 * least alarming thing for it to paint.
 */
function withReserved(palette, reserved) {
  if (reserved === 0) return palette;
  const out = new Uint8Array(palette.length + reserved * 3);
  out.set(palette, reserved * 3);
  return out;
}
