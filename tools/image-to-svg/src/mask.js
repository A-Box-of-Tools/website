/**
 * Deciding which pixels are ink.
 *
 * Everything downstream works on one bit per pixel, so this is the only place
 * that ever looks at a colour. A silhouette arrives as one of three things - a
 * black shape on white, a black shape on nothing (alpha), or a photo somebody
 * expects to become a silhouette - and the difference between them is a
 * threshold and which side of it counts.
 *
 * The default threshold is Otsu's: the level that minimises the variance
 * inside each of the two groups it splits the histogram into. It is the right
 * default because it is the one that needs no number from the person using it,
 * and on the file this tool is for - a logo, a stencil, a scanned signature -
 * the histogram has two piles and Otsu lands between them. It is a poor
 * default for a photograph, which has no two piles, and that is not a bug in
 * the threshold.
 */

/** Alpha below this is background whatever colour it claims to be. */
const ALPHA_FLOOR = 128;

/**
 * @param {{data: Uint8ClampedArray, width: number, height: number}} image
 * @param {{threshold?: number|'otsu', invert?: boolean}} [options]
 * @returns {{w, h, bits, grey: Uint8Array, rgba: Uint8ClampedArray, threshold}}
 */
export function maskFromImage(image, options = {}) {
  const { width: w, height: h, data } = image;
  const invert = options.invert === true;
  const grey = new Uint8Array(w * h);
  const opaque = new Uint8Array(w * h);

  for (let i = 0, p = 0; i < grey.length; i++, p += 4) {
    const a = data[p + 3];
    opaque[i] = a >= ALPHA_FLOOR ? 1 : 0;
    // Rec. 601 luma, and unpremultiplied onto white so a half-transparent
    // grey does not read darker than it looks on the page.
    const k = a / 255;
    const r = data[p] * k + 255 * (1 - k);
    const g = data[p + 1] * k + 255 * (1 - k);
    const b = data[p + 2] * k + 255 * (1 - k);
    grey[i] = (0.299 * r + 0.587 * g + 0.114 * b) | 0;
  }

  const wanted = options.threshold === undefined ? 'otsu' : options.threshold;
  const threshold = wanted === 'otsu' ? otsu(grey) : wanted;

  const bits = new Uint8Array(w * h);
  for (let i = 0; i < bits.length; i++) {
    // Fully transparent is never ink: a PNG cut out of its background is the
    // commonest silhouette there is, and its "colour" underneath is black.
    const dark = opaque[i] === 1 && grey[i] <= threshold;
    bits[i] = (invert ? !dark : dark) ? 1 : 0;
  }
  // The colours are kept because the wand needs them. Which pixels look alike
  // is a question about the picture, and a mask has already thrown away the
  // only thing that could answer it - by the time you have bits, a grey smudge
  // and a black stamp are the same word.
  return { w, h, bits, grey, rgba: data, threshold };
}

/** The between-class variance maximiser, over a 256-bin histogram. */
export function otsu(grey) {
  const hist = new Float64Array(256);
  for (let i = 0; i < grey.length; i++) hist[grey[i]]++;

  const total = grey.length;
  let sum = 0;
  for (let v = 0; v < 256; v++) sum += v * hist[v];

  let sumB = 0, wB = 0, best = -1, level = 127;
  for (let v = 0; v < 256; v++) {
    wB += hist[v];
    if (wB === 0) continue;
    const wF = total - wB;
    if (wF === 0) break;
    sumB += v * hist[v];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const between = wB * wF * (mB - mF) * (mB - mF);
    if (between > best) { best = between; level = v; }
  }
  return level;
}

/** How much of the mask is ink - the honest way to spot a photo. */
export function inkFraction(mask) {
  let n = 0;
  for (let i = 0; i < mask.bits.length; i++) n += mask.bits[i];
  return n / mask.bits.length;
}
