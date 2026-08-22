/**
 * Choosing 256 colours, and deciding which one every pixel becomes.
 *
 * A GIF frame is one byte per pixel and a table of at most 256 colours. A photo
 * has tens of thousands. Everything hard about making a GIF is here rather than
 * in the file format: the table is the picture's quality, and the same frame
 * through a careless palette and a careful one differ by more than any other
 * setting on the page does.
 *
 * THREE STEPS
 *
 * 1. A histogram, in 15-bit colour - 32,768 bins, five bits per channel. Small
 *    enough to be a flat array, which is what makes step 2 cheap. Each bin also
 *    keeps the exact sum of the pixels that fell in it, so the colours chosen in
 *    step 2 are true averages of real pixels rather than bin centres. A sky
 *    quantized to multiples of eight would band visibly before the palette even
 *    got involved.
 *
 * 2. Median cut. Start with one box holding every occupied bin, then repeatedly
 *    split the box with the most pixels in it, across its longest axis, at the
 *    point that puts half its pixels either side. Stop at the number of colours
 *    asked for. The palette that falls out spends its entries where the pixels
 *    actually are: a picture that is mostly sky gets mostly blues.
 *
 * 3. Map every pixel to the nearest colour in that palette, optionally spreading
 *    the rounding error into the neighbours not yet reached - see `mapFrame`.
 *
 * WHY NOT SOMETHING SIMPLER
 *
 * The obvious alternative is a fixed 6x6x6 web-safe cube, which needs no
 * histogram and no search. It is also why early GIFs look like early GIFs: 216
 * colours spread evenly through a space that a photograph barely visits. Median
 * cut is perhaps 150 lines more, and it is the difference between a picture and
 * a poster.
 */

/** Five bits per channel: the histogram is a flat array of this many bins. */
const BINS = 32768;

/**
 * Pixels at or above this alpha are opaque. GIF transparency is one bit, so the
 * line has to be drawn somewhere, and the middle is the least surprising place
 * for it.
 */
export const ALPHA_CUTOFF = 128;

/** A 15-bit key for an 8-bit-per-channel colour. */
const binOf = (r, g, b) => ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);

/**
 * An empty histogram. Deliberately separate from the frames that fill it,
 * because one palette shared by the whole animation is exactly "one histogram,
 * every frame added to it".
 */
export function createHistogram() {
  return {
    counts: new Uint32Array(BINS),
    // Float64, not Uint32: a shared palette adds every frame of the animation
    // to one histogram, and 255 times that many pixels overflows 32 bits
    // somewhere around a four-thousand-frame slideshow. Silently, and only for
    // whoever made that one.
    sumR: new Float64Array(BINS),
    sumG: new Float64Array(BINS),
    sumB: new Float64Array(BINS),
    pixels: 0,
  };
}

/**
 * Add one frame's pixels to a histogram.
 *
 * When transparency is being kept, transparent pixels are left out on purpose:
 * they will not be drawn in any colour, so letting them vote spends palette
 * entries on whatever happens to sit underneath the alpha - usually black, and
 * usually a wasted eighth of the table.
 *
 * @param {object} histogram
 * @param {Uint8ClampedArray|Uint8Array} rgba  four bytes per pixel
 * @param {boolean} [keepTransparent]
 */
export function addToHistogram(histogram, rgba, keepTransparent = false) {
  const { counts, sumR, sumG, sumB } = histogram;
  let pixels = 0;

  for (let i = 0; i < rgba.length; i += 4) {
    if (keepTransparent && rgba[i + 3] < ALPHA_CUTOFF) continue;

    const r = rgba[i];
    const g = rgba[i + 1];
    const b = rgba[i + 2];
    const bin = binOf(r, g, b);

    counts[bin] += 1;
    sumR[bin] += r;
    sumG[bin] += g;
    sumB[bin] += b;
    pixels += 1;
  }

  histogram.pixels += pixels;
  return histogram;
}

/**
 * Median cut over the occupied bins.
 *
 * A box is a range into one array of bin indices, which the splits reorder in
 * place. That keeps the whole thing to two allocations however many colours are
 * asked for, and it is why a box is three numbers rather than a list of its own.
 *
 * @param {object} histogram
 * @param {number} maxColors  1..256
 * @returns {Uint8Array} three bytes per colour, so `length / 3` colours
 */
export function buildPalette(histogram, maxColors) {
  const { counts, sumR, sumG, sumB } = histogram;

  const occupied = [];
  for (let bin = 0; bin < BINS; bin += 1) {
    if (counts[bin] !== 0) occupied.push(bin);
  }

  // A frame with no opaque pixels at all still needs a table: the format has no
  // way to say "no colours", and one black entry is three bytes.
  if (occupied.length === 0) return new Uint8Array([0, 0, 0]);

  const order = Int32Array.from(occupied);
  const wanted = Math.max(1, Math.min(256, Math.floor(maxColors)));

  const pixelsIn = (lo, hi) => {
    let total = 0;
    for (let i = lo; i < hi; i += 1) total += counts[order[i]];
    return { lo, hi, pixels: total };
  };

  const boxes = [pixelsIn(0, order.length)];

  while (boxes.length < wanted) {
    // The box with the most pixels in it is the one the most of the picture is
    // made of, so it is the one worth spending a palette entry on splitting.
    // A box holding a single bin cannot be split at all.
    let chosen = -1;
    let most = 0;
    for (let i = 0; i < boxes.length; i += 1) {
      const box = boxes[i];
      if (box.hi - box.lo < 2) continue;
      if (box.pixels > most) {
        most = box.pixels;
        chosen = i;
      }
    }
    if (chosen === -1) break;

    const box = boxes[chosen];
    const at = splitPoint(order, counts, box);
    boxes[chosen] = pixelsIn(box.lo, at);
    boxes.push(pixelsIn(at, box.hi));
  }

  const palette = new Uint8Array(boxes.length * 3);
  for (let i = 0; i < boxes.length; i += 1) {
    let pixels = 0;
    let r = 0;
    let g = 0;
    let b = 0;
    for (let j = boxes[i].lo; j < boxes[i].hi; j += 1) {
      const bin = order[j];
      pixels += counts[bin];
      r += sumR[bin];
      g += sumG[bin];
      b += sumB[bin];
    }
    if (pixels === 0) continue;
    palette[i * 3] = Math.round(r / pixels);
    palette[i * 3 + 1] = Math.round(g / pixels);
    palette[i * 3 + 2] = Math.round(b / pixels);
  }

  return palette;
}

/**
 * Sort a box's bins along its longest axis and say where half its pixels have
 * gone by. Returns the first index of the second half, which is always strictly
 * inside the box, so neither side can come out empty.
 */
function splitPoint(order, counts, box) {
  let rMin = 31; let rMax = 0;
  let gMin = 31; let gMax = 0;
  let bMin = 31; let bMax = 0;

  for (let i = box.lo; i < box.hi; i += 1) {
    const bin = order[i];
    const r = (bin >> 10) & 31;
    const g = (bin >> 5) & 31;
    const b = bin & 31;
    if (r < rMin) rMin = r;
    if (r > rMax) rMax = r;
    if (g < gMin) gMin = g;
    if (g > gMax) gMax = g;
    if (b < bMin) bMin = b;
    if (b > bMax) bMax = b;
  }

  // Green counts for more and blue for less, because that is roughly how much
  // of brightness each channel carries. Splitting boxes along the axis the eye
  // is least able to see is how a palette ends up holding eight greens that
  // all look the same.
  const spreadR = (rMax - rMin) * 2;
  const spreadG = (gMax - gMin) * 3;
  const spreadB = bMax - bMin;

  let shift = 10;
  if (spreadG >= spreadR && spreadG >= spreadB) shift = 5;
  else if (spreadB > spreadR && spreadB > spreadG) shift = 0;

  const slice = Array.from(order.subarray(box.lo, box.hi));
  slice.sort((a, b) => ((a >> shift) & 31) - ((b >> shift) & 31));
  order.set(slice, box.lo);

  const half = box.pixels / 2;
  let running = 0;
  for (let i = box.lo; i < box.hi - 1; i += 1) {
    running += counts[order[i]];
    if (running >= half) return i + 1;
  }

  // Every pixel is in the last bin. Split it off on its own rather than hand
  // back a boundary that would leave one side with nothing in it.
  return box.hi - 1;
}

/** Nearest entry in the table by squared distance, weighted as the splits are. */
function nearest(palette, from, r, g, b) {
  const entries = palette.length / 3;
  let bestIndex = from;
  let bestDistance = Infinity;

  for (let i = from; i < entries; i += 1) {
    const dr = r - palette[i * 3];
    const dg = g - palette[i * 3 + 1];
    const db = b - palette[i * 3 + 2];
    const distance = dr * dr * 2 + dg * dg * 3 + db * db;
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = i;
      if (distance === 0) break;
    }
  }

  return bestIndex;
}

const clamp255 = (value) => (value < 0 ? 0 : (value > 255 ? 255 : value));

/**
 * Turn one frame's pixels into palette indices.
 *
 * DITHERING
 *
 * Without it, a gradient through a 256-colour palette comes out as bands: every
 * pixel in a wide stretch of nearly-the-same-colour rounds to the same entry,
 * and the step between two entries becomes a visible edge. Floyd-Steinberg
 * carries each pixel's rounding error into the neighbours not yet visited, so
 * that edge becomes a mix of both colours instead. It costs a little noise and
 * on flat, cartoon-like artwork it is worth turning off - which is why it is a
 * setting on the page rather than a decision made here.
 *
 * The scan alternates direction row by row. Always going left to right makes
 * the error drift the same way on every line, which shows up as faint diagonal
 * streaking in skies; reversing every other row cancels it.
 *
 * THE LOOKUP CACHE
 *
 * Searching 256 colours per pixel is thirty million comparisons for a modest
 * frame, so answers are remembered against the same 15-bit key the histogram
 * uses. That rounds the colour being looked up to the nearest 1/32 before the
 * search - well below the error the dither is deliberately introducing, and
 * nowhere near the size of a palette step. The error handed to the neighbours
 * is measured against the true colour rather than the rounded one, so nothing
 * accumulates.
 *
 * @param {Uint8ClampedArray|Uint8Array} rgba
 * @param {number} width
 * @param {number} height
 * @param {Uint8Array} palette  the whole colour table, three bytes per entry
 * @param {object} [options]
 * @param {boolean} [options.dither]
 * @param {number} [options.from]  first entry the mapper may choose
 * @param {number} [options.transparentIndex]  -1 for none
 * @returns {Uint8Array} one index per pixel
 */
export function mapFrame(rgba, width, height, palette, options = {}) {
  const { dither = true, from = 0, transparentIndex = -1 } = options;

  const indices = new Uint8Array(width * height);
  const cache = new Int16Array(BINS).fill(-1);

  const lookup = (r, g, b) => {
    const bin = binOf(r, g, b);
    const remembered = cache[bin];
    if (remembered >= 0) return remembered;
    const found = nearest(palette, from, r, g, b);
    cache[bin] = found;
    return found;
  };

  if (!dither) {
    for (let p = 0; p < indices.length; p += 1) {
      const i = p * 4;
      if (transparentIndex >= 0 && rgba[i + 3] < ALPHA_CUTOFF) {
        indices[p] = transparentIndex;
        continue;
      }
      indices[p] = lookup(rgba[i], rgba[i + 1], rgba[i + 2]);
    }
    return indices;
  }

  // A working copy for the diffusion to write into. Floats rather than the
  // clamped bytes the canvas handed over: the errors are fractional and signed,
  // and rounding them at every step is the thing dithering exists to avoid.
  const work = new Float32Array(width * height * 3);
  for (let p = 0; p < indices.length; p += 1) {
    work[p * 3] = rgba[p * 4];
    work[p * 3 + 1] = rgba[p * 4 + 1];
    work[p * 3 + 2] = rgba[p * 4 + 2];
  }

  for (let y = 0; y < height; y += 1) {
    const rightwards = (y & 1) === 0;
    const start = rightwards ? 0 : width - 1;
    const step = rightwards ? 1 : -1;

    for (let n = 0; n < width; n += 1) {
      const x = start + n * step;
      const p = y * width + x;

      if (transparentIndex >= 0 && rgba[p * 4 + 3] < ALPHA_CUTOFF) {
        indices[p] = transparentIndex;
        continue;
      }

      const r = clamp255(work[p * 3]);
      const g = clamp255(work[p * 3 + 1]);
      const b = clamp255(work[p * 3 + 2]);

      const index = lookup(r, g, b);
      indices[p] = index;

      const errR = r - palette[index * 3];
      const errG = g - palette[index * 3 + 1];
      const errB = b - palette[index * 3 + 2];

      // The classic weights, mirrored when the scan is running right to left.
      spread(work, width, height, x + step, y, errR, errG, errB, 7 / 16);
      spread(work, width, height, x - step, y + 1, errR, errG, errB, 3 / 16);
      spread(work, width, height, x, y + 1, errR, errG, errB, 5 / 16);
      spread(work, width, height, x + step, y + 1, errR, errG, errB, 1 / 16);
    }
  }

  return indices;
}

function spread(work, width, height, x, y, errR, errG, errB, share) {
  if (x < 0 || x >= width || y < 0 || y >= height) return;
  const w = (y * width + x) * 3;
  work[w] += errR * share;
  work[w + 1] += errG * share;
  work[w + 2] += errB * share;
}
