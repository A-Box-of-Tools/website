/**
 * Working out how far one frame moved from another.
 *
 * Stacking a hand-held burst without this produces a blur, so alignment is not
 * a refinement here, it is most of what makes the tool work on anything but a
 * tripod. There are three settings and this file implements two of them; the
 * third is doing nothing, which is the right answer for an intervalometer
 * sequence and is offered because it is.
 *
 * PHASE CORRELATION, AND WHY IT IS THE FAST ANSWER
 *
 * Shifting a picture does not change the size of its spectrum, only the phase
 * of it, and the phase changes by an amount proportional to the shift. So
 * multiplying one frame's spectrum by the conjugate of another's, throwing away
 * the magnitudes, and transforming back gives a surface with a single spike at
 * the offset between them. One transform each and one back - about ten
 * milliseconds on the small squares this works over - and it finds a shift of
 * two hundred pixels as cheaply as a shift of two. Searching for the same
 * answer by trying offsets is quadratic in the range and would be the slowest
 * thing in the tool.
 *
 * ROTATION AND SCALE, BY THE SAME TRICK APPLIED TWICE
 *
 * Rotating a picture rotates its spectrum by the same angle; scaling it scales
 * the spectrum by the inverse. Neither of those is a shift, so phase
 * correlation cannot see them - until the spectrum is resampled into log-polar
 * coordinates, where a rotation *is* a shift along one axis and a scale *is* a
 * shift along the other. Then the same correlation reads both off, the frame is
 * unrotated, and a second correlation finds what is left over as translation.
 * That is the Fourier-Mellin method, and it is why the "rotation too" setting
 * costs one more transform rather than a feature detector.
 *
 * WHAT IT CANNOT DO, STATED HERE BECAUSE THE PAGE STATES IT TOO
 *
 * Everything here is global: one shift, one angle, one scale for the whole
 * frame. A frame where the camera moved is corrected exactly; a frame where the
 * *subject* moved is not, and neither is one taken from a step to the left,
 * because parallax moves the near things further than the far ones and no
 * single transform describes that. Rotation is also only ever recovered within
 * a half turn, because the magnitude spectrum of a real picture is symmetric
 * and a rotation of 175 degrees looks exactly like one of -5.
 */

import { fft2 } from './fft.js';

/** The three settings, in the order the page offers them. */
export const ALIGN_MODES = ['none', 'translate', 'similarity'];

/**
 * Rotation and scale beyond these are not a burst, they are a mistake - a frame
 * from a different shoot, or a correlation that locked onto the noise. Past
 * them the estimate is thrown away and the frame is aligned by translation
 * alone, which is the answer that is at worst unhelpful rather than wrong.
 */
export const MAX_ROTATION = 30;
export const MIN_SCALE = 0.8;
export const MAX_SCALE = 1.25;

/** Below this the correlation peak is not a peak, and the frame is reported. */
export const WEAK_PEAK = 4;

/** The identity, for a frame that needs no moving or could not be measured. */
export const NO_MOVE = Object.freeze({ dx: 0, dy: 0, angle: 0, scale: 1, confidence: 0 });

/* ------------------------------------------------------------- preparation */

/**
 * A Hann window over the square, with the mean taken out first.
 *
 * Both halves matter and both are about the edges. A Fourier transform treats
 * the square as one tile of an infinite repeating pattern, so the right-hand
 * edge sits against the left-hand one; unless the picture happens to match
 * itself there, that seam is a hard vertical line, and a hard line is a huge
 * feature that both frames share regardless of how they moved. The window fades
 * the edges to nothing so there is no seam, and subtracting the mean first
 * stops the fade itself becoming the brightest structure in the frame.
 */
export function window2d(values, size) {
  let total = 0;
  for (let i = 0; i < values.length; i += 1) total += values[i];
  const mean = total / values.length;

  const taper = new Float64Array(size);
  for (let i = 0; i < size; i += 1) {
    taper[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (size - 1));
  }

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      values[y * size + x] = (values[y * size + x] - mean) * taper[y] * taper[x];
    }
  }
  return values;
}

/* ------------------------------------------------------- phase correlation */

/**
 * Where `b` sits relative to `a`.
 *
 * The returned shift is what has to be applied to `b` to put it on top of `a`,
 * measured in pixels of the square both were resampled into.
 *
 * The peak is fitted with a parabola through its two neighbours on each axis,
 * which is what gets this below a whole pixel. Without it every frame snaps to
 * an integer offset and a burst that drifted by half a pixel a frame stacks
 * slightly soft - the exact softness the alignment was there to prevent.
 *
 * @param {Float64Array} a  windowed, size*size
 * @param {Float64Array} b  windowed, size*size
 * @param {number} size     a power of two
 */
export function phaseCorrelate(a, b, size) {
  const n = size * size;
  const aRe = Float64Array.from(a);
  const aIm = new Float64Array(n);
  const bRe = Float64Array.from(b);
  const bIm = new Float64Array(n);

  fft2(aRe, aIm, size);
  fft2(bRe, bIm, size);

  // The cross-power spectrum, normalised to unit magnitude. Throwing the
  // magnitudes away is what makes this robust to one frame being brighter than
  // the other: only where the structure is matters, not how strong it is.
  //
  // Except where there is no structure. Normalising divides by the magnitude,
  // so a bin the picture put nothing in gets its rounding error amplified to
  // the same weight as a real edge - and a picture with a narrow spectrum has
  // thousands of those. Bins below a millionth of the strongest are dropped
  // rather than whitened, which costs nothing on a photograph and is the
  // difference between an answer and noise on anything smooth.
  let strongest = 0;
  for (let i = 0; i < n; i += 1) {
    const re = aRe[i] * bRe[i] + aIm[i] * bIm[i];
    const im = aIm[i] * bRe[i] - aRe[i] * bIm[i];
    aRe[i] = re;
    aIm[i] = im;
    const magnitude = Math.hypot(re, im);
    if (magnitude > strongest) strongest = magnitude;
  }

  const floor = strongest * 1e-6;
  for (let i = 0; i < n; i += 1) {
    const magnitude = Math.hypot(aRe[i], aIm[i]);
    if (magnitude <= floor) {
      aRe[i] = 0;
      aIm[i] = 0;
    } else {
      aRe[i] /= magnitude;
      aIm[i] /= magnitude;
    }
  }

  fft2(aRe, aIm, size, true);

  let peak = -Infinity;
  let peakAt = 0;
  let total = 0;
  let squares = 0;
  for (let i = 0; i < n; i += 1) {
    const value = aRe[i];
    total += value;
    squares += value * value;
    if (value > peak) { peak = value; peakAt = i; }
  }

  const mean = total / n;
  const deviation = Math.sqrt(Math.max(0, squares / n - mean * mean)) || 1e-12;

  const px = peakAt % size;
  const py = (peakAt / size) | 0;
  const at = (x, y) => aRe[((y + size) % size) * size + ((x + size) % size)];

  const dx = wrap(px + parabola(at(px - 1, py), peak, at(px + 1, py)), size);
  const dy = wrap(py + parabola(at(px, py - 1), peak, at(px, py + 1)), size);

  return {
    // The peak sits where the frame has to be moved to, not where it moved
    // from, so this is already the correction and is not negated. That is the
    // one fact in this file worth checking rather than reasoning about, and the
    // first test beside it pins it against a shift the test itself created.
    dx,
    dy,
    peak,
    confidence: (peak - mean) / deviation,
  };
}

/** Sub-pixel offset of a peak, from it and its two neighbours. */
function parabola(before, middle, after) {
  const denominator = before - 2 * middle + after;
  if (!denominator) return 0;
  const shift = (0.5 * (before - after)) / denominator;
  // A fit that lands outside the sample it was centred on is not a refinement,
  // it is a peak that was never parabolic. The integer answer is better.
  return Math.abs(shift) <= 1 ? shift : 0;
}

/** An index in [0, size) read as an offset in (-size/2, size/2]. */
function wrap(value, size) {
  return value > size / 2 ? value - size : value;
}

/* ------------------------------------------------------------- log-polar */

/**
 * The log-magnitude spectrum of a square, with the zero frequency moved to the
 * middle.
 *
 * The logarithm is not decoration. A picture's spectrum is overwhelmingly
 * concentrated near zero frequency - the average brightness dwarfs everything -
 * and resampling that linearly gives a log-polar image that is one bright blob
 * and no structure to correlate. Taking the logarithm flattens it enough for
 * the edges and textures further out to count.
 */
export function logSpectrum(values, size) {
  const re = Float64Array.from(values);
  const im = new Float64Array(size * size);
  fft2(re, im, size);

  const half = size >> 1;
  const out = new Float64Array(size * size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      // fftshift, done while reading rather than as a second pass over the
      // array: quadrant (x, y) of the transform belongs at (x + half, y + half).
      const to = ((y + half) % size) * size + ((x + half) % size);
      out[to] = Math.log1p(Math.hypot(re[y * size + x], im[y * size + x]));
    }
  }
  return out;
}

/**
 * Resample a centred spectrum into log-polar coordinates: angle down, log of
 * radius across.
 *
 * Angles run over half a turn only, which is the 180-degree ambiguity mentioned
 * at the top of this file: the magnitude spectrum of a real-valued picture is
 * symmetric through the origin, so the other half carries no information this
 * has not already got.
 *
 * The radius starts at 1 rather than 0 because the logarithm of nothing is not
 * a coordinate, and because the very centre of the spectrum is the average
 * brightness, which says nothing about rotation.
 */
export function logPolar(spectrum, size) {
  const centre = size / 2;
  const maxRadius = centre - 1;
  const base = Math.log(maxRadius) / size;
  const out = new Float64Array(size * size);

  for (let row = 0; row < size; row += 1) {
    const angle = (Math.PI * row) / size;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    for (let column = 0; column < size; column += 1) {
      const radius = Math.exp(column * base);
      out[row * size + column] = sample(
        spectrum, size, centre + radius * cos, centre + radius * sin,
      );
    }
  }
  return { values: out, base };
}

/** Bilinear read, with anything outside the square treated as zero. */
function sample(values, size, x, y) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  if (x0 < 0 || y0 < 0 || x0 + 1 >= size || y0 + 1 >= size) return 0;
  const fx = x - x0;
  const fy = y - y0;
  const top = values[y0 * size + x0] * (1 - fx) + values[y0 * size + x0 + 1] * fx;
  const bottom = values[(y0 + 1) * size + x0] * (1 - fx) + values[(y0 + 1) * size + x0 + 1] * fx;
  return top * (1 - fy) + bottom * fy;
}

/**
 * Rotate and scale a square about its middle, bilinearly.
 *
 * Used to undo a measured rotation before measuring the translation that is
 * left. It reads backwards - for each destination pixel, where in the source
 * did it come from - which is the only way to resample without leaving holes.
 */
export function rotateScale(values, size, degrees, scale) {
  const out = new Float64Array(size * size);
  const radians = (degrees * Math.PI) / 180;
  const cos = Math.cos(radians) / scale;
  const sin = Math.sin(radians) / scale;
  const centre = (size - 1) / 2;

  for (let y = 0; y < size; y += 1) {
    const dy = y - centre;
    for (let x = 0; x < size; x += 1) {
      const dx = x - centre;
      out[y * size + x] = sample(
        values, size, centre + dx * cos + dy * sin, centre - dx * sin + dy * cos,
      );
    }
  }
  return out;
}

/* --------------------------------------------------------------- the door */

/**
 * How to move `frame` so that it lands on `reference`.
 *
 * EVERYTHING RETURNED IS A CORRECTION, NOT A MEASUREMENT. `scale` is what the
 * frame must be multiplied by, not how much larger it is; `angle` is the turn
 * that puts it straight, not the turn it arrived with; `dx`/`dy` are where it
 * has to go, not where it came from. Mixing the two conventions in one object
 * is the mistake this whole file is arranged to avoid, because every one of
 * them is off by a minus sign in a way that still produces a plausible picture.
 *
 * They apply in that order: scale about the centre, then rotate about the
 * centre, then translate. The translation is measured after the other two have
 * been undone, so applying it first would be applying it in the wrong frame.
 *
 * Both arguments are luma squares of the same power-of-two size, already
 * windowed by `window2d`. The answer is in the units of that square; the caller
 * scales the translation back up to the working resolution, and leaves the
 * angle and the scale alone because neither depends on how large the square
 * was.
 *
 * @param {Float64Array} reference
 * @param {Float64Array} frame
 * @param {number} size
 * @param {string} mode  one of ALIGN_MODES
 * @returns {{dx: number, dy: number, angle: number, scale: number,
 *   confidence: number, clamped: boolean}}
 */
export function estimate(reference, frame, size, mode) {
  if (mode === 'none') return { ...NO_MOVE, clamped: false };

  let angle = 0;
  let scale = 1;
  let clamped = false;
  let moved = frame;

  if (mode === 'similarity') {
    const a = logPolar(logSpectrum(reference, size), size);
    const b = logPolar(logSpectrum(frame, size), size);
    // The log-polar maps are windowed too. Their left edge is the middle of the
    // spectrum and their right edge is its corner, which is as abrupt a seam as
    // the one in the picture itself.
    const found = phaseCorrelate(
      window2d(a.values, size), window2d(b.values, size), size,
    );

    // Down the rows is the angle, across the columns is the logarithm of the
    // scale. The row shift covers half a turn over the whole square.
    // Both readings come out as corrections already - the shift that puts the
    // frame's spectrum back on the reference's is the rotation that puts the
    // frame back - so neither is negated here. The scale is the exception: the
    // column shift measures how much larger the frame is, and the correction is
    // the reciprocal of that.
    const measured = (found.dy * 180) / size;
    angle = measured > 90 ? measured - 180 : measured;
    scale = 1 / Math.exp(found.dx * b.base);

    if (Math.abs(angle) > MAX_ROTATION || scale < MIN_SCALE || scale > MAX_SCALE
        || !Number.isFinite(scale) || found.confidence < WEAK_PEAK) {
      // Not a burst, or not a peak. Fall back to translation, which is the
      // answer that can only fail to help rather than actively harm.
      angle = 0;
      scale = 1;
      clamped = true;
    } else {
      moved = rotateScale(frame, size, angle, scale);
    }
  }

  const shift = phaseCorrelate(reference, moved, size);
  return {
    dx: shift.dx,
    dy: shift.dy,
    angle,
    scale,
    confidence: shift.confidence,
    clamped,
  };
}
