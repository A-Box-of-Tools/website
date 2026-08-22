/**
 * Measuring what the compression actually cost.
 *
 * Every tool of this kind claims "minimal quality loss". Almost none of them
 * says how much, because saying how much means measuring it, and measuring it
 * means decoding the result and comparing it with the original - which a site
 * that does the work on a server would have to do at its own expense.
 *
 * Here the work is already happening on the visitor's machine, so the
 * comparison is nearly free, and the number it produces is the difference
 * between a claim and a fact.
 *
 * Two figures come out:
 *
 *   SSIM - structural similarity, on the brightness channel. It compares
 *   local brightness, local contrast and local structure over small windows,
 *   which is much closer to what an eye objects to than counting how many
 *   pixel values moved. Above about 0.98 the two pictures are hard to tell
 *   apart side by side; below about 0.90 the difference is plain.
 *
 *   PSNR - peak signal-to-noise ratio, in decibels. The traditional figure.
 *   It is a poor model of the eye, but it is the number people expect to see,
 *   and it is honest about heavy compression even when SSIM is generous.
 *
 * Both are computed with the two pictures drawn at the same size, in the
 * original's shape - which means a result that fitted the target by becoming
 * half as wide is stretched back up before it is judged. That is the honest
 * way round. Such a result has lost something real, and comparing it against
 * an original shrunk to match would hide exactly the cost this tool exists to
 * be straight about.
 *
 * @see https://en.wikipedia.org/wiki/Structural_similarity_index_measure
 */

/** The long side of the picture the comparison is done on.
 *
 *  This is a trade, and it is worth knowing which way it goes: the smaller
 *  this is, the kinder the numbers, because shrinking a picture smooths out
 *  exactly the blocking and ringing that heavy compression adds. 1280 keeps
 *  those artefacts clearly visible in the comparison while holding the work to
 *  about a megapixel, which stays quick even on a phone and even when a
 *  40-megapixel photo is what went in. */
const COMPARE_LONG_SIDE = 1280;

/** SSIM window. 8x8 non-overlapping blocks rather than the sliding 11x11
 *  Gaussian of the paper: an eighth of the arithmetic, and the average over a
 *  whole picture lands within a couple of thousandths of the same answer. */
const WINDOW = 8;

/* The stabilising constants from the paper, for 8-bit data. */
const C1 = (0.01 * 255) ** 2;
const C2 = (0.03 * 255) ** 2;

/**
 * Draw a picture into a canvas of a given size and hand back its brightness.
 *
 * Rec. 601 luma, which is what JPEG and WebP themselves encode: it is the
 * channel these codecs keep most of, and the one the eye is most sensitive to.
 */
function luma(source, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
  // Transparency has to land on something, and it has to be the same something
  // in both pictures or the comparison is measuring the background.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, width, height);

  const { data } = ctx.getImageData(0, 0, width, height);
  const out = new Float32Array(width * height);
  for (let i = 0, p = 0; i < out.length; i += 1, p += 4) {
    out[i] = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2];
  }

  canvas.width = 0;
  canvas.height = 0;
  return out;
}

/**
 * Compare two decoded pictures.
 *
 * @param {ImageBitmap|HTMLImageElement} original
 * @param {ImageBitmap|HTMLImageElement} result
 * @param {{width: number, height: number}} size the original's dimensions
 * @returns {{ssim: number, psnr: number}|null} null if it could not be done
 */
export function compare(original, result, size) {
  const scale = Math.min(1, COMPARE_LONG_SIDE / Math.max(size.width, size.height));
  const width = Math.max(WINDOW, Math.round(size.width * scale));
  const height = Math.max(WINDOW, Math.round(size.height * scale));

  let a;
  let b;
  try {
    a = luma(original, width, height);
    b = luma(result, width, height);
  } catch {
    // getImageData throws on a tainted canvas. Nothing here is cross-origin,
    // so this should not happen - but a missing number is better than a
    // broken page, and the rest of the row is still worth showing.
    return null;
  }

  let ssimTotal = 0;
  let windows = 0;
  let squareError = 0;

  const acrossWindows = Math.floor(width / WINDOW);
  const downWindows = Math.floor(height / WINDOW);

  for (let wy = 0; wy < downWindows; wy += 1) {
    for (let wx = 0; wx < acrossWindows; wx += 1) {
      let sumA = 0;
      let sumB = 0;
      let sumAA = 0;
      let sumBB = 0;
      let sumAB = 0;

      for (let y = 0; y < WINDOW; y += 1) {
        let i = (wy * WINDOW + y) * width + wx * WINDOW;
        for (let x = 0; x < WINDOW; x += 1, i += 1) {
          const va = a[i];
          const vb = b[i];
          sumA += va;
          sumB += vb;
          sumAA += va * va;
          sumBB += vb * vb;
          sumAB += va * vb;
        }
      }

      const n = WINDOW * WINDOW;
      const meanA = sumA / n;
      const meanB = sumB / n;
      const varA = sumAA / n - meanA * meanA;
      const varB = sumBB / n - meanB * meanB;
      const covAB = sumAB / n - meanA * meanB;

      const numerator = (2 * meanA * meanB + C1) * (2 * covAB + C2);
      const denominator = (meanA * meanA + meanB * meanB + C1) * (varA + varB + C2);
      ssimTotal += numerator / denominator;
      windows += 1;
    }
  }

  for (let i = 0; i < a.length; i += 1) {
    const diff = a[i] - b[i];
    squareError += diff * diff;
  }

  const mse = squareError / a.length;
  // A perfect match has no error at all, and log(0) is not a number anyone
  // wants on a page. Infinity is the honest answer and is rendered as such.
  const psnr = mse === 0 ? Infinity : 10 * Math.log10((255 * 255) / mse);

  return { ssim: windows ? ssimTotal / windows : 1, psnr };
}

/**
 * Does this picture use its alpha channel?
 *
 * Only asked so that "auto" does not turn a logo with a transparent
 * background into a JPEG with a white one. A small sample is enough: a picture
 * that is transparent anywhere is almost always transparent over whole
 * regions, and this is choosing a default, not certifying anything.
 */
export function hasTransparency(source, size) {
  const scale = Math.min(1, 200 / Math.max(size.width, size.height));
  const width = Math.max(1, Math.round(size.width * scale));
  const height = Math.max(1, Math.round(size.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(source, 0, 0, width, height);

  let transparent = false;
  try {
    const { data } = ctx.getImageData(0, 0, width, height);
    for (let p = 3; p < data.length; p += 4) {
      if (data[p] < 250) { transparent = true; break; }
    }
  } catch {
    transparent = false;
  }

  canvas.width = 0;
  canvas.height = 0;
  return transparent;
}
