/**
 * A radix-2 fast Fourier transform, one and two dimensional.
 *
 * Here because aligning frames is done by phase correlation, and phase
 * correlation is a Fourier method: it compares two pictures by multiplying
 * their spectra, which finds the offset between them in one step no matter how
 * large that offset is. The alternative - sliding one picture over the other
 * and scoring every position - is the same answer at hundreds of times the
 * cost, and it is the cost that decides whether a tool can align twenty
 * 24-megapixel frames while somebody waits.
 *
 * It is used on small buffers: the 256 square the coarse alignment runs in,
 * and the 512 window the refinement correlates at output resolution. The whole
 * frame never goes through it - the coarse square finds the large offset
 * cheaply, and the window finishes the sub-pixel part where there is nothing
 * to multiply back up. See "The alignment, and the sign" in the README.
 *
 * WHY IT IS WRITTEN OUT RATHER THAN IMPORTED
 *
 * The same reason as everything else in this repository: there is no build step
 * for the JavaScript and no dependency to install. This is the textbook
 * iterative Cooley-Tukey - bit-reversal permutation, then log2(n) rounds of
 * butterflies - and it is about sixty lines.
 */

/** A size this transform can take: a power of two, and at least two. */
export function isPowerOfTwo(n) {
  return Number.isInteger(n) && n >= 2 && (n & (n - 1)) === 0;
}

/**
 * The twiddle factors for one size, worked out once and reused.
 *
 * A 512-square two-dimensional transform runs the one-dimensional one 2048
 * times, and computing the same few hundred sines and cosines 2048 times over
 * is most of what a naive implementation spends its time on.
 */
const TABLES = new Map();

function tableFor(n) {
  let table = TABLES.get(n);
  if (!table) {
    const cos = new Float64Array(n / 2);
    const sin = new Float64Array(n / 2);
    for (let i = 0; i < n / 2; i += 1) {
      cos[i] = Math.cos((-2 * Math.PI * i) / n);
      sin[i] = Math.sin((-2 * Math.PI * i) / n);
    }
    table = { cos, sin };
    // Only ever a handful of sizes are asked for, and each is at most a few
    // kilobytes, so there is nothing here worth evicting.
    TABLES.set(n, table);
  }
  return table;
}

/**
 * In-place one-dimensional transform of `n` complex values held as two arrays.
 *
 * The inverse is the forward transform with the imaginary parts negated on the
 * way in and out, and a division by n. Writing it that way rather than as a
 * second loop means there is one butterfly implementation to get right.
 *
 * @param {Float64Array} re
 * @param {Float64Array} im
 * @param {number} n       a power of two
 * @param {boolean} [inverse]
 * @param {number} [offset]  where in the arrays this run starts
 * @param {number} [stride]  the gap between consecutive values, so that a 2D
 *   transform can run down a column without copying it out first
 */
export function fft(re, im, n, inverse = false, offset = 0, stride = 1) {
  if (!isPowerOfTwo(n)) throw new RangeError(`fft size must be a power of two, got ${n}`);

  if (inverse) {
    for (let i = 0; i < n; i += 1) im[offset + i * stride] = -im[offset + i * stride];
  }

  // Bit-reversal permutation. `j` is kept as the reverse of `i` incrementally,
  // which is the standard trick and avoids reversing bits per element.
  for (let i = 1, j = 0; i < n; i += 1) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      const a = offset + i * stride;
      const b = offset + j * stride;
      const tempRe = re[a]; re[a] = re[b]; re[b] = tempRe;
      const tempIm = im[a]; im[a] = im[b]; im[b] = tempIm;
    }
  }

  const { cos, sin } = tableFor(n);

  for (let len = 2; len <= n; len <<= 1) {
    const half = len >> 1;
    const step = n / len;
    for (let start = 0; start < n; start += len) {
      for (let k = 0; k < half; k += 1) {
        const wRe = cos[k * step];
        const wIm = sin[k * step];
        const a = offset + (start + k) * stride;
        const b = offset + (start + k + half) * stride;
        const bRe = re[b] * wRe - im[b] * wIm;
        const bIm = re[b] * wIm + im[b] * wRe;
        re[b] = re[a] - bRe;
        im[b] = im[a] - bIm;
        re[a] += bRe;
        im[a] += bIm;
      }
    }
  }

  if (inverse) {
    for (let i = 0; i < n; i += 1) {
      const at = offset + i * stride;
      re[at] /= n;
      im[at] = -im[at] / n;
    }
  }
}

/**
 * In-place two-dimensional transform of a `size` by `size` square.
 *
 * Rows then columns, which is exact rather than an approximation: the
 * two-dimensional transform genuinely separates. The columns are transformed in
 * place through the stride argument above rather than gathered into a scratch
 * buffer and written back, which halves the memory traffic of the second half.
 */
export function fft2(re, im, size, inverse = false) {
  if (!isPowerOfTwo(size)) throw new RangeError(`fft2 size must be a power of two, got ${size}`);
  for (let y = 0; y < size; y += 1) fft(re, im, size, inverse, y * size, 1);
  for (let x = 0; x < size; x += 1) fft(re, im, size, inverse, x, size);
}
