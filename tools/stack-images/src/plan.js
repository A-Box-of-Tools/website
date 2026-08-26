/**
 * How much memory a stack will take, and how many decodes it will cost.
 *
 * Everything expensive about this tool is decided here, before a single file is
 * opened, which is why this module holds no pixels and touches no DOM: it is
 * arithmetic over four numbers - how wide, how tall, how many frames, which
 * mode - and it is the part worth being sure about.
 *
 * THE TWO SHAPES A STACK CAN HAVE
 *
 * Six of the seven modes are *streaming*. A running maximum does not need to
 * remember the frames it has already seen, and neither does a running sum, so
 * those modes hold one accumulator and read each frame exactly once. Twenty
 * 24-megapixel frames cost twenty decodes and about 290 MB, whatever twenty is.
 *
 * The median is not. To know the middle value of a pixel you must have all of
 * its values at once, and twenty 24-megapixel frames at three bytes a pixel is
 * 1.4 GB, which no browser tab will give you. So the picture is cut into
 * horizontal bands and one band is stacked at a time, and that trades memory
 * for decodes: the frames are read once per band rather than once in total.
 *
 * THE BAND IS THE SAME MACHINERY EITHER WAY
 *
 * Rather than have two engines, every mode is banded and the band height falls
 * out of the budget. A streaming mode's working set is small enough that the
 * band is the whole picture and the loop runs once, which is the fast path
 * without being a separate path. A mode that cannot fit gets as many rows as it
 * can afford instead of failing, and `decodes` below says out loud what that
 * cost - so the number on the page is this function's answer and not a guess.
 *
 * The budget is deliberately not "all the memory there is". A tab that
 * allocates until it dies takes the user's other tabs with it, and a stack that
 * runs slightly slower is better than one that never finishes.
 */

/** Bytes of working memory a run may use before it starts banding. */
export const DEFAULT_BUDGET = 512 * 1024 * 1024;

/**
 * The bands never go below this many rows. A one-row band would technically
 * fit any budget and would spend all of its time in per-band overhead instead
 * of doing arithmetic.
 */
export const MIN_BAND_ROWS = 16;

/**
 * What each mode costs per pixel of a band, and how many times it has to read
 * the frames.
 *
 *   bytes    the accumulators, in bytes per pixel of the band. Where a mode
 *            needs every frame at once this is per frame instead.
 *   perFrame the bytes above are multiplied by the number of frames
 *   passes   how many times the whole set is read. Sigma clipping needs two:
 *            one to find the mean and the spread, one to average what is
 *            within the spread. There is no way to do it in one, because the
 *            threshold a pixel is tested against depends on frames that have
 *            not been read yet
 *   context  rows of overlap a band needs on each side, for modes that look at
 *            a pixel's neighbours
 *
 * The numbers are the real allocations, not estimates: a mean holds three
 * Float32 sums (12 bytes), a maximum holds three bytes and nothing else.
 */
export const MODES = {
  mean: { bytes: 12, perFrame: false, passes: 1, context: 0 },
  median: { bytes: 3, perFrame: true, passes: 1, context: 0 },
  sigma: { bytes: 30, perFrame: false, passes: 2, context: 0 },
  max: { bytes: 3, perFrame: false, passes: 1, context: 0 },
  min: { bytes: 3, perFrame: false, passes: 1, context: 0 },
  sum: { bytes: 12, perFrame: false, passes: 1, context: 0 },
  focus: { bytes: 15, perFrame: false, passes: 1, context: 2 },
};

/** The one band that is always there: the RGBA the canvas hands back. */
const READBACK_BYTES = 4;

export const MODE_IDS = Object.keys(MODES);

export function isMode(id) {
  return Object.hasOwn(MODES, id);
}

/**
 * Working resolution. Decoding straight to a smaller size is the one lever that
 * costs nothing to pull: `createImageBitmap` resamples inside the browser's own
 * decoder, so half resolution is not "decode then shrink", it is less decoding.
 * Memory falls with the square, which is why a stack that will not fit at full
 * size usually fits comfortably one step down.
 */
export const SCALES = { full: 1, half: 0.5, quarter: 0.25 };

/**
 * The size a frame will be worked at.
 *
 * Rounded rather than floored so that a 4001-pixel edge halves to 2001 and not
 * to 2000, and floored at one so a scale can never produce a zero-sized canvas.
 */
export function workingSize(width, height, scale = 1) {
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

/**
 * Bytes of working set per pixel of a band, for a mode and a frame count.
 *
 * Sigma clipping is quoted at its first pass, which is its expensive one: it
 * carries a sum and a sum of squares, and the second pass reuses that memory
 * for a clipped sum and a count that together are smaller. Quoting the peak is
 * the only honest figure, because the peak is what has to be available.
 */
export function bytesPerPixel(mode, frames) {
  const spec = MODES[mode];
  if (!spec) throw new RangeError(`unknown mode: ${mode}`);
  const accumulator = spec.perFrame ? spec.bytes * Math.max(1, frames) : spec.bytes;
  return accumulator + READBACK_BYTES;
}

/**
 * The whole plan for one run.
 *
 * @param {object} options
 * @param {number} options.width       working width, after any scale
 * @param {number} options.height      working height
 * @param {number} options.frames      how many pictures are being stacked
 * @param {string} options.mode        one of MODE_IDS
 * @param {number} [options.budget]    bytes of working memory to stay inside
 * @returns {{rows: number, bands: number, passes: number, decodes: number,
 *   peak: number, banded: boolean, context: number}}  `peak` counts the
 *   accumulators, the readback, and the full-size canvas the answer is drawn
 *   into - everything the run actually allocates.
 */
export function planRun({ width, height, frames, mode, budget = DEFAULT_BUDGET }) {
  const spec = MODES[mode];
  if (!spec) throw new RangeError(`unknown mode: ${mode}`);
  if (!(width > 0) || !(height > 0)) throw new RangeError('a frame with no size');
  const count = Math.max(1, Math.floor(frames));

  const perPixel = bytesPerPixel(mode, count);
  const perRow = width * perPixel;

  // The picture being accumulated into exists whether or not the run is banded,
  // at full size, at four bytes a pixel. It is not part of the band arithmetic
  // and it is very much part of the memory: at 24 megapixels it is 96 MB, which
  // is a fifth of the budget and would be a fifth missing from the figure the
  // page shows. So it comes off the top, and the bands are sized in what is
  // left rather than in the whole.
  const canvas = width * height * 4;
  const forBands = Math.max(0, budget - canvas);

  // How many rows that buys, held between one useful band and the whole
  // picture. Math.min last, so a picture shorter than MIN_BAND_ROWS is one band
  // rather than a band taller than the picture it is cut from.
  const affordable = Math.floor(forBands / Math.max(1, perRow));
  const rows = Math.min(height, Math.max(MIN_BAND_ROWS, affordable));
  const bands = Math.ceil(height / rows);

  return {
    rows,
    bands,
    passes: spec.passes,
    // What this run will actually ask the JPEG decoder to do. One decode per
    // frame per pass in the ordinary case; multiplied by the bands when the
    // frames have to be revisited because they would not all fit at once.
    decodes: bands * spec.passes * count,
    peak: canvas + rows * perRow,
    banded: bands > 1,
    context: spec.context,
  };
}

/**
 * The bands themselves, in order, with the overlap a mode asked for.
 *
 * `y`/`rows` are the band that gets written; `readY`/`readRows` are the band
 * that has to be read to write it. They differ only for focus stacking, which
 * measures how sharp a pixel is by looking at its neighbours and would
 * otherwise draw a seam along every band edge - a real bug, and an invisible
 * one until somebody stacks something with a horizon in it.
 */
export function bands(height, rows, context = 0) {
  const out = [];
  for (let y = 0; y < height; y += rows) {
    const take = Math.min(rows, height - y);
    const readY = Math.max(0, y - context);
    const readRows = Math.min(height, y + take + context) - readY;
    out.push({ y, rows: take, readY, readRows, offset: y - readY });
  }
  return out;
}

/**
 * Where a frame sits inside the output, when the frames are not all one size.
 *
 * Stacking frames of different sizes is nearly always a mistake - a burst is a
 * burst - but "nearly always" is not "always", and the alternative to placing
 * them is refusing the whole set. They are centred, at their own scale, which
 * keeps a stack of the same scene shot at two resolutions aligned about the
 * middle instead of about the top left corner.
 */
export function placement(frame, output) {
  const scale = Math.min(output.width / frame.width, output.height / frame.height);
  const width = frame.width * scale;
  const height = frame.height * scale;
  return {
    scale,
    x: (output.width - width) / 2,
    y: (output.height - height) / 2,
    width,
    height,
  };
}

/**
 * The output size for a set of frames: the largest of them, at the working
 * scale.
 *
 * The largest rather than the first, because the frame somebody happened to
 * pick first should not decide what everything else is resampled down to, and
 * rather than the smallest because throwing away resolution that every frame
 * has is the one choice that cannot be undone afterwards.
 */
export function outputSize(frames, scale = 1) {
  let width = 0;
  let height = 0;
  for (const frame of frames) {
    if (frame.width * frame.height > width * height) {
      width = frame.width;
      height = frame.height;
    }
  }
  if (!width || !height) return null;
  return workingSize(width, height, scale);
}

/**
 * The part of the output that every frame actually covers, once aligned.
 *
 * Alignment moves frames, and a frame moved twenty pixels left no longer
 * reaches the right-hand edge. Whatever it does not reach is transparent, and
 * transparent reads as zero to an accumulator - so without this an averaged
 * hand-held burst comes out with a dark border, and a darkened stack is exactly
 * what somebody would blame the stacking for. Cropping to what they all cover
 * is what every stacker does and is the only answer that invents nothing.
 *
 * Each frame's content filled the output box before it was moved, so the region
 * it covers afterwards is that box under its own transform. The rectangle
 * returned is the largest axis-aligned one inside all of them: for a rotated
 * quad, that means taking the inner of each pair of corners on every side,
 * which is conservative rather than exact and errs towards cropping slightly
 * too much.
 *
 * With no alignment every transform is the identity and this returns the whole
 * output, so nothing is cropped and nothing is lost.
 *
 * @param {{dx: number, dy: number, angle: number, scale: number}[]} moves
 * @param {{width: number, height: number}} output
 * @returns {{x: number, y: number, width: number, height: number}}
 */
export function commonArea(moves, output) {
  const cx = output.width / 2;
  const cy = output.height / 2;

  let left = 0;
  let top = 0;
  let right = output.width;
  let bottom = output.height;

  for (const move of moves) {
    const radians = ((move.angle ?? 0) * Math.PI) / 180;
    const cos = Math.cos(radians) * (move.scale ?? 1);
    const sin = Math.sin(radians) * (move.scale ?? 1);
    const at = (x, y) => ({
      x: cx + (x - cx) * cos - (y - cy) * sin + (move.dx ?? 0),
      y: cy + (x - cx) * sin + (y - cy) * cos + (move.dy ?? 0),
    });

    const topLeft = at(0, 0);
    const topRight = at(output.width, 0);
    const bottomRight = at(output.width, output.height);
    const bottomLeft = at(0, output.height);

    left = Math.max(left, topLeft.x, bottomLeft.x);
    right = Math.min(right, topRight.x, bottomRight.x);
    top = Math.max(top, topLeft.y, topRight.y);
    bottom = Math.min(bottom, bottomLeft.y, bottomRight.y);
  }

  const x = Math.max(0, Math.ceil(left));
  const y = Math.max(0, Math.ceil(top));
  const width = Math.floor(Math.min(output.width, right)) - x;
  const height = Math.floor(Math.min(output.height, bottom)) - y;

  // A set that overlaps in almost nothing would otherwise crop to a sliver or
  // to nothing at all. Returning the whole box instead produces a stack with
  // visible edges, which is a result somebody can look at and understand.
  if (width < output.width / 4 || height < output.height / 4) {
    return { x: 0, y: 0, width: output.width, height: output.height };
  }
  return { x, y, width, height };
}

/**
 * The square the alignment's refinement pass measures in, or 0 when the crop
 * has no room for one worth trusting.
 *
 * The coarse measurement happens in a small square and is multiplied back up,
 * which multiplies its sub-pixel error with it - at 6000 pixels across, a
 * twentieth of a pixel of estimation error comes back as more than one whole
 * pixel of blur. The refinement corrects that by correlating a window cut from
 * the frames at output resolution, where an error of a twentieth of a pixel is
 * an error of a twentieth of a pixel. 512 is plenty of texture to lock onto;
 * below 64 there is too little for the peak to mean anything, and no window is
 * the honest answer.
 *
 * The 16 the window keeps back from the crop is the two margins the caller
 * shrinks the crop by; asking for a window the margin then makes impossible
 * would be answering a different question than the one asked.
 */
export function refineWindow({ width, height }) {
  const room = Math.min(width, height) - 16;
  if (room < 64) return 0;
  let size = 64;
  while (size * 2 <= Math.min(room, 512)) size *= 2;
  return size;
}

/**
 * How far the refinement may move a frame beyond its coarse answer, in output
 * pixels. Also how much the crop must shrink on every side, because a frame
 * moved after the crop was decided stops covering ground the crop assumed.
 *
 * The bound is the coarse pass's own error budget: its sub-pixel mistake is a
 * fraction of one alignment-square pixel, which the multiply-up turns into a
 * handful of output pixels. Eight covers that with room to spare. A set whose
 * frames barely moved cannot have been mismeasured by much - the error lives
 * in the sub-pixel fraction of the shift - so it keeps a one-pixel allowance
 * and a tripod burst is not charged sixteen rows for a correction it does not
 * need.
 */
export function refineMargin(moves) {
  let most = 0;
  for (const move of moves) {
    most = Math.max(most, Math.abs(move.dx ?? 0), Math.abs(move.dy ?? 0));
  }
  return most < 0.5 ? 1 : 8;
}

/**
 * The largest scale whose plan fits the budget without banding, or null if even
 * the smallest one does not.
 *
 * Offered as advice rather than applied: a tool that quietly halves the
 * resolution of somebody's stack has made the one decision they would most want
 * to be asked about.
 */
export function scaleThatFits({ width, height, frames, mode, budget = DEFAULT_BUDGET }) {
  for (const [name, scale] of Object.entries(SCALES)) {
    const size = workingSize(width, height, scale);
    if (!planRun({ ...size, frames, mode, budget }).banded) return name;
  }
  return null;
}
