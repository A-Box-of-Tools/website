/**
 * Choosing 256 colours, and then deciding which one every pixel becomes.
 *
 * This is the part of making a GIF that decides what it looks like. A video
 * frame carries up to sixteen million colours and the format allows 256 for the
 * whole animation, so almost all of the picture's colour is thrown away here,
 * and the only question is which parts of it to keep.
 *
 * Three pieces:
 *
 *   - **A histogram**, filled while the frames are being read. Every frame is
 *     counted, not only the first, because the colour that matters may only
 *     appear at the end - a title card, a lamp coming on, a cut to another
 *     scene. It is binned to five bits a channel, which is 32,768 buckets: fine
 *     enough that colours a person can tell apart land in different buckets, and
 *     small enough that a two-minute clip costs the same memory as a two-second
 *     one.
 *   - **Median cut**, which splits the colours that are actually in the clip
 *     into 256 groups and takes the average of each. Heckbert's method from
 *     1982, and still the one to write by hand: it is a hundred lines, it never
 *     gets stuck, and its failure mode - a subtle gradient losing a step - is
 *     the one people notice least.
 *   - **The mapping**, with an optional ordered dither. See DITHER below for
 *     why the dither is ordered rather than the diffusion kind that a still
 *     image would use.
 */

/** Bits per channel in the histogram. Five is 32,768 buckets. */
const HIST_BITS = 5;
const HIST_SIZE = 1 << (HIST_BITS * 3);

/** Bits per channel in the lookup cache the mapping uses. */
const CACHE_BITS = 6;
const CACHE_SIZE = 1 << (CACHE_BITS * 3);

/**
 * The 8x8 ordered dither matrix, in the order Bayer gave it.
 *
 * ORDERED, NOT DIFFUSED. Floyd-Steinberg looks better on a single still
 * picture and is the wrong choice here, for two reasons that both come from
 * this being an animation:
 *
 *   - **It is unstable.** Diffusion carries each pixel's error into its
 *     neighbours, so one changed pixel changes the dither of everything after
 *     it. Two frames that differ in a corner come out differing everywhere, and
 *     the result crawls: a still background visibly boils. An ordered dither
 *     depends only on where a pixel is, so an unchanged part of the picture
 *     quantizes to exactly the same indices in every frame and simply sits
 *     still.
 *   - **It would undo the differencing.** Because unchanged pixels keep their
 *     index, gif.js can write only the rectangle that moved and leave the rest
 *     transparent. Under diffusion almost every pixel changes slightly every
 *     frame, so every frame is a whole picture again and the file is several
 *     times the size.
 */
const BAYER = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

/** Flattened, and centred on zero: -0.5 to +0.5 of one quantization step. */
const DITHER = new Float32Array(64);
for (let y = 0; y < 8; y += 1) {
  for (let x = 0; x < 8; x += 1) DITHER[y * 8 + x] = BAYER[y][x] / 64 - 0.5 + 1 / 128;
}

/** Bounds on the dither amplitude, in levels out of 255. See amplitudeFor(). */
const MIN_AMPLITUDE = 6;
const MAX_AMPLITUDE = 40;

/**
 * Counts of the colours seen, and their exact sums.
 *
 * The counts decide where median cut splits; the sums decide what colour each
 * group ends up being. Keeping both means a group's colour is the true average
 * of the pixels in it rather than the average of the buckets they fell into,
 * which is what stops a palette drifting a shade off across a flat area.
 */
export class ColorHistogram {
  counts = new Uint32Array(HIST_SIZE);
  sums = new Float64Array(HIST_SIZE * 3);
  pixels = 0;

  /**
   * @param {Uint8ClampedArray|Uint8Array} rgba  one frame, four bytes a pixel
   * @param {number} [step]  count every nth pixel. The palette does not need
   *   every pixel of every frame to be right, and stepping keeps a long clip
   *   from spending seconds here.
   */
  add(rgba, step = 1) {
    const stride = Math.max(1, Math.floor(step)) * 4;
    for (let at = 0; at < rgba.length; at += stride) {
      const r = rgba[at];
      const g = rgba[at + 1];
      const b = rgba[at + 2];
      const bin = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
      this.counts[bin] += 1;
      this.sums[bin * 3] += r;
      this.sums[bin * 3 + 1] += g;
      this.sums[bin * 3 + 2] += b;
      this.pixels += 1;
    }
  }
}

/** The occupied buckets, as a list median cut can sort and split. */
function occupied(histogram) {
  const bins = [];
  for (let bin = 0; bin < HIST_SIZE; bin += 1) {
    if (histogram.counts[bin]) bins.push(bin);
  }
  return Int32Array.from(bins);
}

const channelOf = (bin, channel) => (bin >> (10 - channel * 5)) & 31;

/** The colour of a run of buckets: the average of every pixel in them. */
function averageColor(histogram, bins, from, to) {
  let count = 0;
  let r = 0;
  let g = 0;
  let b = 0;
  for (let i = from; i < to; i += 1) {
    const bin = bins[i];
    count += histogram.counts[bin];
    r += histogram.sums[bin * 3];
    g += histogram.sums[bin * 3 + 1];
    b += histogram.sums[bin * 3 + 2];
  }
  if (!count) return [0, 0, 0];
  return [
    Math.min(255, Math.round(r / count)),
    Math.min(255, Math.round(g / count)),
    Math.min(255, Math.round(b / count)),
  ];
}

/** A box's pixel count and its longest side, which is what decides splitting. */
function measure(histogram, bins, from, to) {
  let count = 0;
  const low = [31, 31, 31];
  const high = [0, 0, 0];

  for (let i = from; i < to; i += 1) {
    const bin = bins[i];
    count += histogram.counts[bin];
    for (let channel = 0; channel < 3; channel += 1) {
      const value = channelOf(bin, channel);
      if (value < low[channel]) low[channel] = value;
      if (value > high[channel]) high[channel] = value;
    }
  }

  let longest = 0;
  let extent = high[0] - low[0];
  for (let channel = 1; channel < 3; channel += 1) {
    if (high[channel] - low[channel] > extent) {
      extent = high[channel] - low[channel];
      longest = channel;
    }
  }

  return { from, to, count, longest, extent };
}

/**
 * Split the colours in the histogram into at most `maxColors` groups.
 *
 * Which box to split next is the one judgement in the algorithm. Splitting the
 * box with the most pixels alone gives a photograph's dominant colour dozens of
 * near-identical entries; splitting the widest box alone spends the palette on
 * a handful of stray pixels nobody will notice. The product of the two is the
 * usual compromise and behaves well on both: a large area of subtly varying
 * colour wins, a large area of one flat colour does not.
 *
 * @returns {Uint8Array} RGB triples
 */
export function medianCut(histogram, maxColors) {
  const bins = occupied(histogram);
  if (!bins.length) return new Uint8Array([0, 0, 0]);

  // Sorting is done inside each box, over a shared list, so a box is only ever
  // a pair of offsets into it.
  const sortable = Array.from(bins);
  let boxes = [measure(histogram, sortable, 0, sortable.length)];

  while (boxes.length < maxColors) {
    let best = -1;
    let bestScore = 0;
    for (let i = 0; i < boxes.length; i += 1) {
      const box = boxes[i];
      if (box.to - box.from < 2 || box.extent === 0) continue;
      const score = box.count * (box.extent + 1);
      if (score > bestScore) {
        bestScore = score;
        best = i;
      }
    }
    if (best < 0) break;   // every box is a single colour; nothing left to split

    const box = boxes[best];
    const slice = sortable.slice(box.from, box.to)
      .sort((a, b) => channelOf(a, box.longest) - channelOf(b, box.longest));
    for (let i = 0; i < slice.length; i += 1) sortable[box.from + i] = slice[i];

    // Cut where half of the pixels lie, not half of the buckets: the point is
    // to divide the picture evenly, and a bucket holding one pixel and a bucket
    // holding a million are the same size in a list.
    const half = box.count / 2;
    let running = 0;
    let cut = box.from;
    while (cut < box.to - 1) {
      running += histogram.counts[sortable[cut]];
      cut += 1;
      if (running >= half) break;
    }

    boxes.splice(best, 1,
      measure(histogram, sortable, box.from, cut),
      measure(histogram, sortable, cut, box.to));
  }

  const palette = new Uint8Array(boxes.length * 3);
  boxes.forEach((box, i) => {
    const [r, g, b] = averageColor(histogram, sortable, box.from, box.to);
    palette[i * 3] = r;
    palette[i * 3 + 1] = g;
    palette[i * 3 + 2] = b;
  });
  return palette;
}

/**
 * How far to dither, in levels out of 255.
 *
 * The right amplitude is one quantization step: enough that two neighbouring
 * pixels can straddle the gap between two palette entries and average out to
 * the colour that is missing, and no more, because past that it is just noise.
 * So it is measured off the palette itself rather than fixed - the distance
 * from a typical entry to its nearest neighbour - which makes a flat cartoon
 * with twelve colours in it dither almost not at all, and a photographic
 * gradient dither as much as it needs.
 */
export function amplitudeFor(palette) {
  const colors = palette.length / 3;
  if (colors < 2) return 0;

  const distances = [];
  for (let i = 0; i < colors; i += 1) {
    let nearest = Infinity;
    for (let j = 0; j < colors; j += 1) {
      if (i === j) continue;
      const dr = palette[i * 3] - palette[j * 3];
      const dg = palette[i * 3 + 1] - palette[j * 3 + 1];
      const db = palette[i * 3 + 2] - palette[j * 3 + 2];
      const distance = dr * dr + dg * dg + db * db;
      if (distance < nearest) nearest = distance;
    }
    distances.push(Math.sqrt(nearest));
  }

  distances.sort((a, b) => a - b);
  const median = distances[distances.length >> 1];
  return Math.min(MAX_AMPLITUDE, Math.max(MIN_AMPLITUDE, median));
}

/**
 * The palette, plus a cache of which entry any colour becomes.
 *
 * Finding the nearest of 256 colours is 256 subtractions and a multiply, per
 * pixel, per frame - about three billion of them for a ten-second clip, which
 * is the difference between a tool that answers and one that hangs. So each
 * answer is worked out once and kept, in a table indexed by the colour rounded
 * to six bits a channel. That is 262,144 entries, or half a megabyte, and after
 * the first frame almost every lookup is a single array read.
 */
export class Palette {
  #cache = new Int16Array(CACHE_SIZE).fill(-1);

  /** @param {Uint8Array} rgb  the table, as triples */
  constructor(rgb) {
    this.rgb = rgb;
    this.size = rgb.length / 3;
  }

  /** The entry nearest a colour, by straight-line distance in RGB. */
  indexOf(r, g, b) {
    const key = ((r >> 2) << (CACHE_BITS * 2)) | ((g >> 2) << CACHE_BITS) | (b >> 2);
    const cached = this.#cache[key];
    if (cached >= 0) return cached;

    // The search is done from the centre of the cache's bucket rather than from
    // the colour asked about, so every colour in a bucket gets the same answer
    // and the table can be trusted the second time.
    const cr = ((key >> (CACHE_BITS * 2)) << 2) | 2;
    const cg = (((key >> CACHE_BITS) & 63) << 2) | 2;
    const cb = ((key & 63) << 2) | 2;

    let best = 0;
    let bestDistance = Infinity;
    for (let i = 0; i < this.size; i += 1) {
      const dr = cr - this.rgb[i * 3];
      const dg = cg - this.rgb[i * 3 + 1];
      const db = cb - this.rgb[i * 3 + 2];
      const distance = dr * dr + dg * dg + db * db;
      if (distance < bestDistance) {
        bestDistance = distance;
        best = i;
      }
    }

    this.#cache[key] = best;
    return best;
  }
}

/**
 * One frame of pixels, as one palette index per pixel.
 *
 * @param {Uint8ClampedArray|Uint8Array} rgba
 * @param {number} width
 * @param {number} height
 * @param {Palette} palette
 * @param {number} [amplitude]  0 for no dithering
 * @param {Uint8Array} [into]  a buffer to write into, to save an allocation per
 *   frame - the caller keeps two and swaps them
 */
export function quantizeFrame(rgba, width, height, palette, amplitude = 0, into = null) {
  const out = into ?? new Uint8Array(width * height);

  if (!amplitude) {
    for (let i = 0, at = 0; i < out.length; i += 1, at += 4) {
      out[i] = palette.indexOf(rgba[at], rgba[at + 1], rgba[at + 2]);
    }
    return out;
  }

  for (let y = 0; y < height; y += 1) {
    const row = y * width;
    const dithers = (y & 7) * 8;
    for (let x = 0; x < width; x += 1) {
      const at = (row + x) * 4;
      const offset = DITHER[dithers + (x & 7)] * amplitude;
      const r = Math.max(0, Math.min(255, rgba[at] + offset));
      const g = Math.max(0, Math.min(255, rgba[at + 1] + offset));
      const b = Math.max(0, Math.min(255, rgba[at + 2] + offset));
      out[row + x] = palette.indexOf(r, g, b);
    }
  }

  return out;
}
