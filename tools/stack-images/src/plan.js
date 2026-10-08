/**
 * How much memory a stack will take, and how many decodes it will cost.
 *
 * Everything expensive about this tool is decided here, before a single file is
 * opened, which is why this module holds no pixels and touches no DOM: it is
 * arithmetic over sizes and settings, and it is the part worth being sure
 * about before any large accumulator is allocated.
 *
 * THE TWO SHAPES A STACK CAN HAVE
 *
 * Six of the seven modes are *streaming*. A running maximum does not need to
 * remember the frames it has already seen, and neither does a running sum, so
 * those modes hold one accumulator regardless of frame count. Their canvases
 * and a decoded frame still have to fit alongside it, so even a streaming
 * method may need bands at a large working resolution.
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

import { MESH_MAX_BYTES } from './mesh.js';
import { applyHomography } from './projective.js';
import { DEFAULT_RADIUS } from './stack.js';

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
  focus: { bytes: 15, perFrame: false, passes: 1, context: DEFAULT_RADIUS + 1 },
};

/** The one band that is always there: the RGBA the canvas hands back. */
const READBACK_BYTES = 4;

export const MODE_IDS = Object.keys(MODES);

export function isMode(id) {
  return Object.hasOwn(MODES, id);
}

/**
 * Working resolution. Asking createImageBitmap for a smaller bitmap reduces
 * the pixels held and processed by this pipeline. A browser may also avoid some
 * decoding work, but that is its implementation choice rather than a guarantee.
 * Pixel memory falls with the square, which is why a stack that will not fit at
 * full size usually fits comfortably one step down.
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

/** The largest bitmap retained for each frame during the alignment survey. */
export const SURVEY_EDGE = 256;

/**
 * Correlation owns its input squares, six transform buffers and the reference
 * grid. Reserving the largest grid keeps refinement inside the plan even when
 * its final crop has not been measured yet.
 */
const ALIGN_WORK = 16 * SURVEY_EDGE * SURVEY_EDGE * 8 + SURVEY_EDGE * 32;

/**
 * Plan from the largest live stage, rather than adding allocations that never
 * coexist or omitting a canvas because it is not an accumulator. Browser codec
 * internals and the timing of garbage collection remain outside this estimate.
 *
 * `decodePixels` is the full working frame, including the part outside a crop;
 * `surveyDecodePixels` is the natural frame that an unrecognised header may
 * require before its small survey bitmap can be made.
 */
export function planRun({
  width, height, frames, mode, budget = DEFAULT_BUDGET, radius = DEFAULT_RADIUS,
  decodePixels = width * height, surveyDecodePixels = decodePixels, align = 'similarity',
}) {
  const spec = MODES[mode];
  if (!spec) throw new RangeError(`unknown mode: ${mode}`);
  if (!(width > 0) || !(height > 0)) throw new RangeError('a frame with no size');
  const count = Math.max(1, Math.floor(frames));
  const context = mode === 'focus' ? Math.max(0, Math.floor(radius)) + 1 : 0;
  const accumulatorBytes = spec.perFrame ? spec.bytes * count : spec.bytes;
  const canvas = width * height * 4;
  const decode = Math.max(1, decodePixels) * 4;
  const thumb = Math.min(surveyDecodePixels, SURVEY_EDGE * SURVEY_EDGE) * 4;
  const retained = count * thumb;
  const survey = Math.max(1, surveyDecodePixels) * 4 + retained + thumb * 2;
  const measure = retained + (align === 'none' ? 0 : ALIGN_WORK);
  const refine = align === 'none' || !refineWindow({ width, height }) ? 0 : ALIGN_WORK;
  const mesh = align === 'projective' && refine ? Math.max(0, count - 1) * (MESH_MAX_BYTES + 1024) : 0;
  // A median gathers contiguous chunks and sorts one frame-count-sized list.
  // The larger-list branch uses ordinary numbers, so reserve its array too.
  const medianScratch = mode === 'median'
    ? Math.min(width * height * 3, 8192) * count + count * 17
    : 0;

  const stagesAt = (rows) => {
    const readRows = Math.min(height, rows + context * 2);
    const pixels = width * readRows;
    const accumulator = pixels * accumulatorBytes;
    const rgba = pixels * 4;
    return {
      survey,
      measure,
      decode: canvas + accumulator + rgba + decode + refine + mesh,
      readback: canvas + accumulator + rgba * 2 + mesh,
      pack: canvas + accumulator + rgba + medianScratch + mesh,
      // The encoder may copy its input. This is an allowance, not a claim
      // about a particular browser's PNG or JPEG implementation.
      encode: canvas * 2 + mesh,
    };
  };
  const peakAt = (rows) => Math.max(...Object.values(stagesAt(rows)));
  const minimum = Math.min(height, MIN_BAND_ROWS);
  let rows = height;
  if (peakAt(rows) > budget) {
    let low = minimum;
    let high = height;
    while (low < high) {
      const middle = Math.ceil((low + high) / 2);
      if (peakAt(middle) <= budget) low = middle;
      else high = middle - 1;
    }
    rows = low;
  }
  const countBands = Math.ceil(height / rows);
  const stages = stagesAt(rows);
  const peak = Math.max(...Object.values(stages));
  return {
    rows,
    bands: countBands,
    passes: spec.passes,
    decodes: countBands * spec.passes * count,
    peak,
    stages,
    overBudget: peak > budget,
    banded: countBands > 1,
    context,
  };
}

/** A comparison closes its decoded frame before asking the encoder to run. */
export function planComparison({ output, crop, move, budget = DEFAULT_BUDGET }) {
  const canvas = crop.width * crop.height * 4;
  const decode = output.width * output.height * 4;
  const mesh = move?.homography ? MESH_MAX_BYTES + 1024 : 0;
  const peak = Math.max(canvas + decode, canvas * 2) + mesh;
  return { peak, overBudget: peak > budget };
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
 * Each frame's content filled its own placement box before it was moved, so
 * the region it covers afterwards is that box under its own transform. The
 * box is the whole output for the ordinary set of frames that are all one
 * size and shape, and is smaller for a frame of another shape, which
 * `placement` letterboxes: a 4:3 frame in a 3:2 output never covered the
 * columns either side of it, whether or not it moved, and a crop that assumed
 * the whole output would leave those columns in with nothing behind them. A
 * move that names no spot is taken to have filled the output, which is what
 * every caller before the letterboxing was noticed meant.
 *
 * The rectangle returned is the largest axis-aligned one inside all of them:
 * for a rotated quad, that means taking the inner of each pair of corners on
 * every side, which is conservative rather than exact and errs towards
 * cropping slightly too much.
 *
 * With no alignment every transform is the identity and this returns whatever
 * the frames covered, so a set of one shape is not cropped and nothing is lost.
 *
 * @param {{dx: number, dy: number, angle: number, scale: number,
 *   spot?: {x: number, y: number, width: number, height: number}}[]} moves
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
    const at = (x, y) => move.homography ? applyHomography(move.homography, x, y) : ({
      x: cx + (x - cx) * cos - (y - cy) * sin + (move.dx ?? 0),
      y: cy + (x - cx) * sin + (y - cy) * cos + (move.dy ?? 0),
    });

    const box = move.spot ?? { x: 0, y: 0, width: output.width, height: output.height };
    const topLeft = at(box.x, box.y);
    const topRight = at(box.x + box.width, box.y);
    const bottomRight = at(box.x + box.width, box.y + box.height);
    const bottomLeft = at(box.x, box.y + box.height);

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

/** How many windows across the refinement lays its grid. */
export const REFINE_GRID = 3;

/**
 * How far the grid stays off the edge of the crop, in output pixels.
 *
 * Not because the frames move afterwards - they do, but the windows are drawn
 * through the coarse moves the crop was worked out from, so every one of them
 * is inside every frame's coverage at the moment it is measured. It is because
 * that edge is only NEARLY the edge of the coverage: `commonArea` approximates
 * each rotated quad by the inner of each pair of corners and then rounds, and
 * a resample at the boundary takes its samples from just outside it either
 * way. A window flush against the edge can catch the transparent ground there,
 * which correlates as an edge both frames share wherever they went and pins
 * the window to a shift that is not the frame's. Eight pixels of margin keeps
 * it off, and eight pixels of a crop that has room for this grid at all is
 * nothing given up.
 */
export const REFINE_INSET = 8;

/**
 * The grid of squares the alignment's refinement measures in, or null when the
 * crop has no room for one worth trusting.
 *
 * The coarse measurement happens in a small square and is multiplied back up,
 * which multiplies its sub-pixel error with it - at 6000 pixels across, a
 * twentieth of a pixel of estimation error comes back as more than one whole
 * pixel of blur. The refinement corrects that by correlating windows cut from
 * the frames at output resolution, where an error of a twentieth of a pixel is
 * an error of a twentieth of a pixel.
 *
 * Nine of them rather than one, because one window measures a shift and nine
 * measure a field, and a field is what a rotation is. A frame turned a third
 * of a degree moves the middle of a 6000 by 4000 picture by nothing and each
 * of its corners by nineteen pixels, so a single window at the middle finds
 * nothing to correct and reports honestly that the frame did not move.
 *
 * `cover` is how much of the output one window spans and `size` is the square
 * it is drawn into, which is half of it: the residual being looked for is a
 * pixel or two, the correlation resolves a fraction of a pixel of ITS OWN
 * square, and drawing at half scale halves the reading and the cost of every
 * transform in the run behind it. 512 is plenty of texture to lock onto and is
 * the first size tried; the grid falls to 256 and then 128 on a crop that
 * cannot fit three of them, and below a 3x3 grid of 64-pixel covers there is
 * too little in each window for a peak to mean anything and no grid is the
 * honest answer - the coarse move then stands.
 */
export function refineWindow({ width, height }) {
  const room = Math.min(width, height) - REFINE_INSET * 2;
  let cover = 512;
  while (cover > 64 && REFINE_GRID * cover > room) cover /= 2;
  if (REFINE_GRID * cover > room) return null;
  // Half the cover, held inside what a correlation square may usefully be:
  // 256 is where the transform stops being cheap and 64 is where the surface
  // stops having a peak on it. A cover of 64 is drawn at 1:1 rather than at
  // half, which is the floor doing its job rather than an exception to it.
  const size = Math.min(256, Math.max(64, cover / 2));
  return { cover, size, grid: REFINE_GRID };
}

/**
 * The largest scale whose plan fits the budget without banding, or null if even
 * the smallest one does not.
 *
 * Offered as advice rather than applied: a tool that quietly halves the
 * resolution of somebody's stack has made the one decision they would most want
 * to be asked about.
 */
export function scaleThatFits({
  width, height, frames, mode, budget = DEFAULT_BUDGET, radius = DEFAULT_RADIUS,
  align = 'similarity', surveyDecodePixels = width * height,
}) {
  for (const [name, scale] of Object.entries(SCALES)) {
    const size = workingSize(width, height, scale);
    const plan = planRun({ ...size, frames, mode, budget, radius, align, surveyDecodePixels });
    if (!plan.banded && !plan.overBudget) return name;
  }
  return null;
}
