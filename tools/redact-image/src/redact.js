/**
 * The part that destroys the pixels.
 *
 * Everything here rewrites a buffer of RGBA bytes in place. That buffer is the
 * decoded picture, and what comes out of this file is what the encoder is given
 * - there is no second layer, no overlay, no annotation, and nothing anywhere
 * in this tool that records where a box was. Once these functions have run, the
 * pixels under a box are not in memory any more, so they cannot be in the file
 * either.
 *
 * That is the whole argument for this tool existing, and it is the difference
 * between it and drawing a black rectangle in a PDF reader, a slide deck or an
 * image viewer that saves the shape beside the picture rather than into it.
 *
 * THE THREE STYLES ARE NOT EQUALLY SAFE, and the page says so in those words:
 *
 *   FILL replaces the box with one flat colour. Nothing about what was there
 *   survives - not an edge, not an average, not a hint of how many characters
 *   there were. It is the only one of the three that is finished, and it is the
 *   default for that reason.
 *
 *   PIXELATE replaces each block with the average of that block. The pixels are
 *   gone, but a grid of averages is still a small, lossy measurement of what was
 *   underneath, and for text in a known font at a known size that has been
 *   enough to recover the original by rendering candidates and comparing their
 *   averages. Fewer, larger blocks leave less to work with, which is why the
 *   page shows the block count rather than a strength word alone.
 *
 *   BLUR replaces each pixel with a weighted average of its neighbours. The same
 *   objection, more sharply: a blur is a convolution, convolutions are
 *   invertible in principle, and a small radius over crisp text is the case
 *   where deconvolution does best.
 *
 * @typedef {{data: Uint8ClampedArray, width: number, height: number}} Pixels
 * @typedef {{x: number, y: number, width: number, height: number}} Rect
 */

import { blockSize, blurRadius, clampRect } from './regions.js';

/** What a filled box is filled with. Black, which is what redaction looks like. */
export const FILL = [0, 0, 0];

/**
 * Paint one flat colour over the box.
 *
 * The alpha channel is set to opaque along with the colour. A transparent
 * picture whose redacted box was left transparent would hand back a file where
 * the hidden part shows whatever the reader happens to put behind it - a white
 * page in one viewer, the original underneath in a layered editor - which is
 * the exact failure this tool exists to avoid.
 */
export function fillRegion(image, rect, colour = FILL) {
  const { data, width } = image;
  const [r, g, b] = colour;
  for (let y = rect.y; y < rect.y + rect.height; y += 1) {
    let at = (y * width + rect.x) * 4;
    for (let x = 0; x < rect.width; x += 1, at += 4) {
      data[at] = r;
      data[at + 1] = g;
      data[at + 2] = b;
      data[at + 3] = 255;
    }
  }
  return image;
}

/**
 * Replace each block of the box with that block's average colour.
 *
 * The grid is anchored to the box's own top left corner rather than to the
 * picture's, so moving a box by a pixel moves its mosaic with it instead of
 * re-cutting it. The block at the right or bottom edge is whatever is left, and
 * is averaged over its real size - not padded, which would drag the edge of the
 * mosaic towards the colour of a block that is not there.
 */
export function pixelateRegion(image, rect, block) {
  const { data, width } = image;
  const size = Math.max(1, Math.round(block));
  const right = rect.x + rect.width;
  const bottom = rect.y + rect.height;

  for (let by = rect.y; by < bottom; by += size) {
    const rows = Math.min(size, bottom - by);
    for (let bx = rect.x; bx < right; bx += size) {
      const columns = Math.min(size, right - bx);
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;

      for (let y = by; y < by + rows; y += 1) {
        let at = (y * width + bx) * 4;
        for (let x = 0; x < columns; x += 1, at += 4) {
          r += data[at];
          g += data[at + 1];
          b += data[at + 2];
          a += data[at + 3];
        }
      }

      const count = rows * columns;
      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);
      a = Math.round(a / count);

      for (let y = by; y < by + rows; y += 1) {
        let at = (y * width + bx) * 4;
        for (let x = 0; x < columns; x += 1, at += 4) {
          data[at] = r;
          data[at + 1] = g;
          data[at + 2] = b;
          data[at + 3] = a;
        }
      }
    }
  }
  return image;
}

/**
 * One pass of a box blur along a line, as a sliding sum.
 *
 * Naively, blurring with a radius of r costs 2r+1 reads per pixel, and the radii
 * here are a fraction of the box - a hundred pixels and more on a large
 * photograph, which is enough to make a redaction take a visible second per box.
 * The window only ever gains one value and loses one, so keeping the sum and
 * sliding it costs the same per pixel whatever the radius is.
 *
 * Off the end of the line the edge value is repeated, which is the usual choice
 * and the only one that does not darken the border of the box.
 */
function blurLine(src, dst, count, stride, radius) {
  const window = radius * 2 + 1;
  for (let channel = 0; channel < 4; channel += 1) {
    const at = (i) => channel + stride * Math.max(0, Math.min(i, count - 1));
    let sum = src[at(0)] * (radius + 1);
    for (let i = 1; i <= radius; i += 1) sum += src[at(i)];

    for (let i = 0; i < count; i += 1) {
      dst[channel + stride * i] = sum / window;
      sum += src[at(i + radius + 1)] - src[at(i - radius)];
    }
  }
}

/**
 * Blur the box, using only the box.
 *
 * Reading neighbours from outside the rectangle would pull the surrounding
 * picture into the blurred patch - and, far more importantly, would smear what
 * is being hidden outwards past the edge of the box the user drew. The box is
 * the boundary in both directions.
 *
 * Three box passes rather than one: a single box blur leaves square-edged smears
 * that read as an artefact, and three of them approximate a Gaussian closely
 * enough that nothing is gained by computing a real one.
 */
export function blurRegion(image, rect, radius) {
  const { width: w, height: h } = rect;
  if (w < 1 || h < 1) return image;
  const r = Math.max(1, Math.min(Math.round(radius), Math.max(w, h)));

  const buffer = readRect(image, rect);
  const scratch = new Float32Array(buffer.length);

  for (let pass = 0; pass < 3; pass += 1) {
    for (let y = 0; y < h; y += 1) {
      blurLine(buffer.subarray(y * w * 4), scratch.subarray(y * w * 4), w, 4, r);
    }
    for (let x = 0; x < w; x += 1) {
      blurLine(scratch.subarray(x * 4), buffer.subarray(x * 4), h, w * 4, r);
    }
  }

  writeRect(image, rect, buffer);
  return image;
}

/** The box's pixels, copied out as floats so the three passes round once. */
function readRect(image, rect) {
  const span = rect.width * 4;
  const out = new Float32Array(span * rect.height);
  for (let y = 0; y < rect.height; y += 1) {
    const from = ((rect.y + y) * image.width + rect.x) * 4;
    for (let i = 0; i < span; i += 1) out[y * span + i] = image.data[from + i];
  }
  return out;
}

/** ...and back again, rounded, at the end. */
function writeRect(image, rect, values) {
  const span = rect.width * 4;
  for (let y = 0; y < rect.height; y += 1) {
    const to = ((rect.y + y) * image.width + rect.x) * 4;
    for (let i = 0; i < span; i += 1) image.data[to + i] = Math.round(values[y * span + i]);
  }
}

/**
 * Every box, in the order they were drawn.
 *
 * Order matters where boxes overlap, and the honest order is the one the user
 * made: a black fill drawn last covers the mosaic it was drawn over, which is
 * what somebody who drew it there was asking for.
 *
 * @param {Pixels} image     rewritten in place
 * @param {Array<Rect & {style: string}>} regions
 * @param {string} strength  one of the ids in STRENGTHS
 */
export function applyRegions(image, regions, strength = 'medium') {
  for (const region of regions) {
    const rect = clampRect(region, image);
    if (rect.width < 1 || rect.height < 1) continue;
    if (region.style === 'pixelate') pixelateRegion(image, rect, blockSize(rect, strength));
    else if (region.style === 'blur') blurRegion(image, rect, blurRadius(rect, strength));
    else fillRegion(image, rect);
  }
  return image;
}
