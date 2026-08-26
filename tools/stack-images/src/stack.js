/**
 * The seven ways of combining a pile of pixels into one.
 *
 * Every mode here is an accumulator: it is handed one band of one frame at a
 * time as plain RGBA bytes, it keeps whatever it needs to keep, and at the end
 * it gives back a band of the answer. It never sees a file, a canvas or a
 * decoder, which is what makes the arithmetic testable without any of them.
 *
 * WHY SIX OF THE SEVEN NEED NO HISTORY
 *
 * A running maximum, a running minimum, a running sum and a running mean can
 * all be updated from the frame in front of them and nothing else, so those
 * modes hold one accumulator no matter how many frames arrive. That is the
 * whole performance story of this tool: a hundred frames costs the same memory
 * as two, and each frame is read once.
 *
 * The median cannot be done that way - the middle value of a set is not
 * knowable until the set is complete - so it keeps every frame's bytes and is
 * banded by plan.js to stay inside a memory budget.
 *
 * Sigma clipping is the interesting middle. It reads the frames twice: once to
 * learn what each pixel usually is and how much it varies, and once to average
 * only the values that agree with that. Two passes over a constant amount of
 * memory beats one pass over all the frames at once, which is why this is the
 * mode to reach for when the median will not fit.
 *
 * PRECISION
 *
 * The input is eight bits a channel, because that is what the camera's own
 * preview is and what a browser decodes to. The accumulators are wider than
 * that on purpose: averaging in Float32 and rounding once at the end is what
 * makes stacking reduce noise at all. Rounding each running total back to a
 * byte would reintroduce, every frame, exactly the quantisation the stack is
 * there to average away.
 */

/** Channels kept per pixel. Alpha is not stacked; see `result` below. */
const RGB = 3;

/**
 * How many values a median has to sort before it is worth doing anything
 * cleverer than an insertion sort. Well above any stack anybody assembles by
 * hand, and an insertion sort on a short run that is nearly always already
 * ordered is hard to beat.
 */
const SORT_DIRECTLY_UP_TO = 512;

/**
 * @typedef {object} Stack
 * @property {number} passes                  how many times the frames must be read
 * @property {(pass: number) => void} beginPass
 * @property {(rgba: Uint8Array|Uint8ClampedArray, index: number) => void} add
 * @property {(pass: number) => void} endPass
 * @property {() => Uint8ClampedArray} result  RGBA for the band
 */

/**
 * @param {string} mode
 * @param {object} options
 * @param {number} options.width    the band's width in pixels
 * @param {number} options.height   the band's height in pixels
 * @param {number} options.frames   how many frames will be added, per pass
 * @param {number} [options.kappa]  sigma clipping: how many standard deviations
 *   from the mean a value may be and still be counted
 * @param {number} [options.gain]   multiplied into the result before rounding
 * @param {number} [options.radius] focus stacking: how far around a pixel the
 *   sharpness measure looks
 * @returns {Stack}
 */
export function createStack(mode, options) {
  const build = BUILDERS[mode];
  if (!build) throw new RangeError(`unknown mode: ${mode}`);
  const { width, height, frames } = options;
  if (!(width > 0) || !(height > 0)) throw new RangeError('a band with no size');
  if (!(frames > 0)) throw new RangeError('a stack of no frames');
  // A field passed explicitly as undefined must fall to its default rather
  // than land on it: spreading `{ gain: undefined }` over `{ gain: 1 }` keeps
  // the undefined, the gain multiplies every channel into NaN, and NaN clamps
  // to zero - a caller that skipped one option gets an all-black picture with
  // nothing thrown anywhere near the cause.
  const given = {};
  for (const [key, value] of Object.entries(options)) {
    if (value !== undefined) given[key] = value;
  }
  return build({ kappa: 2, gain: 1, radius: 3, ...given, pixels: width * height });
}

/**
 * Pack an RGB accumulator into the RGBA the canvas wants, applying the gain and
 * rounding exactly once.
 *
 * Alpha is written opaque rather than stacked. A stack has no meaningful
 * transparency - averaging the alpha of frames that are all opaque produces
 * opaque, and averaging it over frames that are not produces a value no channel
 * below it agrees with - so it is set rather than computed.
 */
function pack(pixels, gain, value) {
  const out = new Uint8ClampedArray(pixels * 4);
  for (let i = 0, at = 0; i < pixels; i += 1, at += 4) {
    out[at] = value(i * RGB) * gain;
    out[at + 1] = value(i * RGB + 1) * gain;
    out[at + 2] = value(i * RGB + 2) * gain;
    out[at + 3] = 255;
  }
  return out;
}

/* -------------------------------------------------------------- the modes */

/**
 * Mean. The plain average, and the reason stacking works: random noise is as
 * often above the true value as below it, so averaging n frames cuts it by
 * roughly the square root of n. Nothing else here is as effective on a
 * tripod-steady set, and nothing else is as easily ruined by one frame with a
 * bird in it.
 */
function meanStack({ pixels, gain }) {
  const sum = new Float32Array(pixels * RGB);
  let counted = 0;

  return {
    passes: 1,
    beginPass() {},
    add(rgba) {
      for (let i = 0, at = 0; i < pixels; i += 1, at += 4) {
        const to = i * RGB;
        sum[to] += rgba[at];
        sum[to + 1] += rgba[at + 1];
        sum[to + 2] += rgba[at + 2];
      }
      counted += 1;
    },
    endPass() {},
    result() {
      const divisor = counted || 1;
      return pack(pixels, gain, (at) => sum[at] / divisor);
    },
  };
}

/**
 * Sum. The same accumulator, undivided: what a single long exposure would have
 * collected. Light painting and fireworks want this, and so does anything where
 * the subject is brighter than the background and the background is meant to
 * stay dark. It clips, and clipping is the point - a highlight that would have
 * blown out in one long exposure blows out here too.
 */
function sumStack({ pixels, gain }) {
  const sum = new Float32Array(pixels * RGB);

  return {
    passes: 1,
    beginPass() {},
    add(rgba) {
      for (let i = 0, at = 0; i < pixels; i += 1, at += 4) {
        const to = i * RGB;
        sum[to] += rgba[at];
        sum[to + 1] += rgba[at + 1];
        sum[to + 2] += rgba[at + 2];
      }
    },
    endPass() {},
    result() {
      return pack(pixels, gain, (at) => sum[at]);
    },
  };
}

/**
 * Maximum and minimum, per channel.
 *
 * Maximum is what draws star trails out of a sequence of short exposures, and
 * what assembles a firework from the frames of its own explosion. Minimum is
 * its opposite and is the quiet one of the pair: it removes anything bright and
 * moving - a passing headlight, a reflection, a raindrop lit by a flash -
 * because a pixel only stays bright if it was bright in every single frame.
 */
function extremeStack({ pixels, gain }, keepHigher) {
  const best = new Uint8Array(pixels * RGB);
  if (!keepHigher) best.fill(255);
  let seen = false;

  return {
    passes: 1,
    beginPass() {},
    add(rgba) {
      for (let i = 0, at = 0; i < pixels; i += 1, at += 4) {
        const to = i * RGB;
        for (let c = 0; c < RGB; c += 1) {
          const value = rgba[at + c];
          if (keepHigher ? value > best[to + c] : value < best[to + c]) best[to + c] = value;
        }
      }
      seen = true;
    },
    endPass() {},
    result() {
      // An empty minimum would otherwise come back as a white band rather than
      // as nothing, which reads as a bug in the stack rather than as no input.
      if (!seen) return new Uint8ClampedArray(pixels * 4);
      return pack(pixels, gain, (at) => best[at]);
    },
  };
}

/**
 * Median. The middle value of each pixel across the frames.
 *
 * This is the mode people describe rather than name: photograph a busy square a
 * dozen times and the square comes out empty, because a given pixel is
 * pavement in most frames and a tourist in one or two, and the middle value of
 * that set is pavement. It is also the most robust noise reduction there is,
 * being entirely unmoved by a frame with an aeroplane in it.
 *
 * What it costs is memory: every frame's bytes have to be here at once. The
 * banding in plan.js exists for this mode and no other.
 *
 * The store is frame-major - all of frame 0, then all of frame 1 - so that
 * adding a frame is one straight walk through memory. Reading it back for the
 * median is the awkward direction, so it is done a chunk at a time through a
 * scratch buffer small enough to stay in cache, rather than by striding across
 * hundreds of megabytes once per pixel.
 */
function medianStack({ pixels, frames, gain }) {
  const channels = pixels * RGB;
  const store = new Uint8Array(channels * frames);
  let counted = 0;

  return {
    passes: 1,
    beginPass() {},
    add(rgba, index) {
      const base = (index ?? counted) * channels;
      for (let i = 0, at = 0; i < pixels; i += 1, at += 4) {
        const to = base + i * RGB;
        store[to] = rgba[at];
        store[to + 1] = rgba[at + 1];
        store[to + 2] = rgba[at + 2];
      }
      counted = Math.max(counted, (index ?? counted) + 1);
    },
    endPass() {},
    result() {
      const n = counted || 1;
      const out = new Uint8ClampedArray(pixels * 4);
      const chunk = Math.min(channels, 8192);
      const scratch = new Uint8Array(chunk * n);
      const values = new Uint8Array(n);

      for (let start = 0; start < channels; start += chunk) {
        const take = Math.min(chunk, channels - start);
        // Gather: one contiguous run per frame, which is the cheap direction.
        for (let f = 0; f < n; f += 1) {
          scratch.set(store.subarray(f * channels + start, f * channels + start + take), f * chunk);
        }
        for (let j = 0; j < take; j += 1) {
          for (let f = 0; f < n; f += 1) values[f] = scratch[f * chunk + j];
          const middle = medianOf(values, n);
          const channel = start + j;
          const pixel = (channel / RGB) | 0;
          out[pixel * 4 + (channel - pixel * RGB)] = middle * gain;
        }
      }
      for (let i = 0; i < pixels; i += 1) out[i * 4 + 3] = 255;
      return out;
    },
  };
}

/**
 * The middle of `n` bytes, averaging the two middles when there is no single
 * one. Sorts a copy in place; `values` is a scratch buffer the caller reuses.
 */
export function medianOf(values, n = values.length) {
  if (n === 1) return values[0];
  if (n <= SORT_DIRECTLY_UP_TO) {
    // Insertion sort. The runs are short, they are often nearly sorted already
    // because neighbouring frames of a burst resemble each other, and there is
    // no allocation anywhere in it.
    for (let i = 1; i < n; i += 1) {
      const value = values[i];
      let j = i - 1;
      while (j >= 0 && values[j] > value) {
        values[j + 1] = values[j];
        j -= 1;
      }
      values[j + 1] = value;
    }
  } else {
    const sorted = Array.prototype.slice.call(values, 0, n).sort((a, b) => a - b);
    for (let i = 0; i < n; i += 1) values[i] = sorted[i];
  }
  const half = n >> 1;
  return n & 1 ? values[half] : (values[half - 1] + values[half]) / 2;
}

/**
 * Sigma-clipped mean: the average of the values that agree with each other.
 *
 * Pass one learns, for every pixel, what it usually is and how much it varies.
 * Pass two averages only the values within kappa standard deviations of that,
 * so a car that crossed one frame is excluded from that pixel and every other
 * frame still counts. It is the median's result with the mean's noise
 * reduction, and unlike the median it does not have to hold the frames.
 *
 * There is no way to fold this into one pass. The threshold a value is tested
 * against depends on frames that have not been read yet.
 *
 * The mean and the spread are carried between the passes as bytes rather than
 * floats, which is what keeps the peak at two float accumulators rather than
 * four. The spread is stored eight times over so that a standard deviation of a
 * third of a level - an ordinary figure for a clean stack - survives the trip.
 */
function sigmaStack({ pixels, kappa, gain }) {
  const channels = pixels * RGB;
  const mean = new Uint8Array(channels);
  // 1/8 of a level per step, saturating at just under 32 levels. Noise wider
  // than that is not noise, and clipping the threshold there costs nothing.
  const SPREAD_STEPS = 8;
  const spread = new Uint8Array(channels);

  let sum = new Float32Array(channels);
  let squares = new Float32Array(channels);
  let counted = 0;

  let clipped = null;
  let kept = null;

  return {
    passes: 2,
    beginPass(pass) {
      if (pass === 1) {
        clipped = new Float32Array(channels);
        kept = new Uint16Array(channels);
      }
    },
    add(rgba, index, pass) {
      if (pass === 0) {
        for (let i = 0, at = 0; i < pixels; i += 1, at += 4) {
          const to = i * RGB;
          for (let c = 0; c < RGB; c += 1) {
            const value = rgba[at + c];
            sum[to + c] += value;
            squares[to + c] += value * value;
          }
        }
        counted += 1;
        return;
      }
      for (let i = 0, at = 0; i < pixels; i += 1, at += 4) {
        const to = i * RGB;
        for (let c = 0; c < RGB; c += 1) {
          const value = rgba[at + c];
          const limit = spread[to + c] / SPREAD_STEPS;
          if (Math.abs(value - mean[to + c]) <= limit) {
            clipped[to + c] += value;
            kept[to + c] += 1;
          }
        }
      }
    },
    endPass(pass) {
      if (pass !== 0) return;
      const n = counted || 1;
      for (let i = 0; i < channels; i += 1) {
        const average = sum[i] / n;
        // The variance of a sample, from its sum and its sum of squares. It can
        // come out very slightly negative through rounding when every value was
        // identical, which is exactly the case a clean stack hits.
        const variance = Math.max(0, squares[i] / n - average * average);
        mean[i] = Math.round(average);
        spread[i] = Math.min(255, Math.round(Math.sqrt(variance) * kappa * SPREAD_STEPS));
      }
      // Released before the second pass allocates, so the two accumulators are
      // never all live at once.
      sum = null;
      squares = null;
    },
    result() {
      return pack(pixels, gain, (at) => (
        // A pixel every frame disagreed about keeps its mean rather than
        // becoming a hole. That happens where the whole set is moving, and a
        // hole would be a black speck in the middle of an otherwise fine stack.
        kept && kept[at] ? clipped[at] / kept[at] : mean[at]
      ));
    },
  };
}

/**
 * Focus stacking: from each pixel, the frame that had it in focus.
 *
 * A macro shot at f/8 has perhaps a millimetre of depth in focus, so the way to
 * photograph a whole insect is to take twenty frames along the focus ring and
 * take, from each, only what was sharp in it. Sharpness is measured as the
 * Laplacian - how much a pixel differs from its four neighbours, which is large
 * on an edge and near zero on a blur - and then blurred, because the question
 * is not "is this pixel on an edge" but "is this part of the picture in focus".
 * Without that second step the result is a per-pixel scramble of every frame.
 *
 * Like the extremes, it holds one frame's worth of best-so-far and nothing
 * else, so it streams.
 */
function focusStack({ pixels, width, height, radius, gain }) {
  const best = new Uint8Array(pixels * RGB);
  const score = new Float32Array(pixels);
  const luma = new Float32Array(pixels);
  const sharp = new Float32Array(pixels);
  score.fill(-1);

  return {
    passes: 1,
    beginPass() {},
    add(rgba) {
      for (let i = 0, at = 0; i < pixels; i += 1, at += 4) {
        luma[i] = rgba[at] * 0.299 + rgba[at + 1] * 0.587 + rgba[at + 2] * 0.114;
      }
      laplacian(luma, sharp, width, height);
      // The blur needs a scratch buffer the size of the band, and `luma` is one
      // that has just been finished with - the Laplacian has already read all
      // of it, and the next frame overwrites it from scratch anyway. Allocating
      // a third buffer here cost four bytes a pixel, which at 24 megapixels was
      // the difference between this mode banding and not.
      boxBlur(sharp, luma, width, height, radius);

      for (let i = 0; i < pixels; i += 1) {
        if (sharp[i] > score[i]) {
          score[i] = sharp[i];
          const to = i * RGB;
          const at = i * 4;
          best[to] = rgba[at];
          best[to + 1] = rgba[at + 1];
          best[to + 2] = rgba[at + 2];
        }
      }
    },
    endPass() {},
    result() {
      return pack(pixels, gain, (at) => best[at]);
    },
  };
}

/**
 * |4c - up - down - left - right|, with the edges of the band left at zero.
 *
 * Zero rather than a mirrored or clamped edge, because a band's top and bottom
 * rows are usually not the picture's - they are a seam in the middle of it -
 * and inventing an edge there would score the seam higher than the picture
 * around it. plan.js gives focus stacking two rows of overlap for this reason,
 * so the rows scored as zero are rows that get thrown away.
 */
export function laplacian(source, out, width, height) {
  out.fill(0);
  for (let y = 1; y < height - 1; y += 1) {
    const row = y * width;
    for (let x = 1; x < width - 1; x += 1) {
      const at = row + x;
      out[at] = Math.abs(
        4 * source[at] - source[at - 1] - source[at + 1]
        - source[at - width] - source[at + width],
      );
    }
  }
}

/**
 * A separable box blur, in place, using `scratch` for the horizontal half.
 *
 * A running sum rather than a window per pixel, so the cost does not grow with
 * the radius - which matters because this runs once per frame per band and the
 * radius is a setting somebody can turn up.
 */
export function boxBlur(values, scratch, width, height, radius) {
  if (radius < 1) return;

  for (let y = 0; y < height; y += 1) {
    const row = y * width;
    let total = 0;
    for (let x = 0; x < Math.min(radius, width); x += 1) total += values[row + x];
    for (let x = 0; x < width; x += 1) {
      const entering = x + radius;
      const leaving = x - radius - 1;
      if (entering < width) total += values[row + entering];
      if (leaving >= 0) total -= values[row + leaving];
      const from = Math.max(0, x - radius);
      const to = Math.min(width - 1, x + radius);
      scratch[row + x] = total / (to - from + 1);
    }
  }

  for (let x = 0; x < width; x += 1) {
    let total = 0;
    for (let y = 0; y < Math.min(radius, height); y += 1) total += scratch[y * width + x];
    for (let y = 0; y < height; y += 1) {
      const entering = y + radius;
      const leaving = y - radius - 1;
      if (entering < height) total += scratch[entering * width + x];
      if (leaving >= 0) total -= scratch[leaving * width + x];
      const from = Math.max(0, y - radius);
      const to = Math.min(height - 1, y + radius);
      values[y * width + x] = total / (to - from + 1);
    }
  }
}

const BUILDERS = {
  mean: meanStack,
  sum: sumStack,
  max: (options) => extremeStack(options, true),
  min: (options) => extremeStack(options, false),
  median: medianStack,
  sigma: sigmaStack,
  focus: focusStack,
};
