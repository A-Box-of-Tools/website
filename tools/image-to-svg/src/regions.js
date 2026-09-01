import { traceContours } from './contour.js';

/**
 * Pointing at a part of the picture and meaning all of it.
 *
 * A threshold is one number for a whole image and it is always wrong somewhere:
 * a shadow becomes ink, a stamp survives that should not, the middle of an O
 * fills in. Every one of those is a local mistake with an obvious local fix,
 * and the fix is not another slider - it is being able to point at the thing
 * and say "not that".
 *
 * The unit you point at is a REGION: the run of pixels next to each other that
 * are the same as the one under the pointer. That is the whole of "auto choose
 * the same area" - a click carries no size, so the size has to come from the
 * picture. What "the same" means is the question, and there are two answers
 * worth having:
 *
 *   colour  the same COLOUR, within a tolerance. This is what a person means by
 *           pointing at something: a grey smudge is not the black stamp beside
 *           it, and white paper is not the pale blue rule across it, however
 *           the threshold happened to sort them. It is the default because the
 *           other one gets this wrong in a way that is hard to explain - a mask
 *           knows only two colours, so on it every dark thing touching every
 *           other dark thing is one thing.
 *
 *   shape   the same side of the THRESHOLD - exactly the shape the tracer would
 *           have drawn. Worth keeping for the times you want to grab precisely
 *           the loop that is coming out wrong, because what you select is then
 *           what you would get, and it can never select half of one.
 *
 * Connectivity has to agree with the tracer's or the two would disagree about
 * what one shape is: with joinDiagonals off, ink is 4-connected and paper is
 * 8-connected. They must be opposites, or a diagonal pinch would be a join in
 * both directions at once and neither the labels nor the outlines would be
 * consistent.
 */

/**
 * @param {{w: number, h: number, bits: Uint8Array}} mask
 * @param {{joinDiagonals?: boolean}} [options]
 * @returns {{labels: Int32Array, w: number, h: number, ink: number, paper: number}}
 */
export function labelRegions(mask, options = {}) {
  const { w, h, bits } = mask;
  const joinDiagonals = options.joinDiagonals === true;
  const labels = new Int32Array(w * h);
  const stack = new Int32Array(w * h);
  let ink = 0, paper = 0;

  for (let seed = 0; seed < labels.length; seed++) {
    if (labels[seed] !== 0) continue;
    const isInk = bits[seed] === 1;
    const diagonal = isInk ? joinDiagonals : !joinDiagonals;
    const id = isInk ? ++ink : -(++paper);

    let top = 0;
    stack[top++] = seed;
    labels[seed] = id;
    while (top > 0) {
      const at = stack[--top];
      const x = at % w, y = (at / w) | 0;
      for (let k = 0; k < 8; k++) {
        if (!diagonal && k >= 4) break;
        const nx = x + NX[k], ny = y + NY[k];
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const n = ny * w + nx;
        if (labels[n] !== 0 || (bits[n] === 1) !== isInk) continue;
        labels[n] = id;
        stack[top++] = n;
      }
    }
  }
  return { labels, w, h, ink, paper };
}

// Four sides first, then the corners, so one loop serves both connectivities.
const NX = [1, -1, 0, 0, 1, 1, -1, -1];
const NY = [0, 0, 1, -1, 1, -1, 1, -1];

/**
 * One flood fill stack, kept and reused.
 *
 * It is four bytes a pixel, so on an eight megapixel photograph it is 32 MB -
 * and the wand runs on every pointer move. Allocating it per call asks the
 * collector to find and free 32 MB several times a second, which is not slow,
 * it is a stopped tab. It is never handed out, so reusing it is safe in a way
 * that reusing the result would not be.
 */
let stackBuffer = new Int32Array(0);
function stackFor(n) {
  if (stackBuffer.length < n) stackBuffer = new Int32Array(n);
  return stackBuffer;
}

/**
 * A pixel's colour as it would look on the page: over white, because that is
 * what a half-transparent pixel is sitting on and what the threshold assumed.
 */
function colourAt(rgba, i, out) {
  const p = i * 4;
  const k = rgba[p + 3] / 255;
  out[0] = rgba[p] * k + 255 * (1 - k);
  out[1] = rgba[p + 1] * k + 255 * (1 - k);
  out[2] = rgba[p + 2] * k + 255 * (1 - k);
  return out;
}

/**
 * The region under (x, y), as one flag per pixel.
 *
 * @param {{w, h, bits: Uint8Array, grey?: Uint8Array, rgba?: Uint8ClampedArray}} mask
 * @param {{labels: Int32Array}|null} labelled from labelRegions, for mode 'shape'
 * @param {number} x
 * @param {number} y
 * @param {{mode?, tolerance?, budget?: number}} [options] budget caps how many
 *   pixels may be visited, for a preview that must not cost more than a frame;
 *   the result then carries `truncated` and is a piece of the region, not it.
 * @returns {{pixels: Uint8Array, size: number, wasInk: boolean, truncated: boolean}}
 */
export function selectRegion(mask, labelled, x, y, options = {}) {
  const { w, h, bits, grey, rgba } = mask;
  const mode = options.mode ?? 'colour';
  const tolerance = options.tolerance ?? 32;
  const budget = options.budget ?? Infinity;
  const at = y * w + x;
  const pixels = new Uint8Array(w * h);
  const wasInk = bits[at] === 1;
  let size = 0;

  if (mode === 'shape' && labelled) {
    const want = labelled.labels[at];
    const { labels } = labelled;
    for (let i = 0; i < labels.length; i++) {
      if (labels[i] === want) { pixels[i] = 1; size++; }
    }
    return { pixels, size, wasInk, truncated: false };
  }

  // Growing over the colours. Eight-connected: this one is about what looks
  // joined, and a diagonal thread of the same colour looks joined.
  const seed = [0, 0, 0];
  const here = [0, 0, 0];
  if (rgba) colourAt(rgba, at, seed);
  else seed[0] = seed[1] = seed[2] = grey ? grey[at] : (wasInk ? 0 : 255);
  const limit = tolerance * tolerance * 3;

  const stack = stackFor(w * h);
  let top = 0;
  stack[top++] = at;
  pixels[at] = 1;
  size = 1;
  while (top > 0 && size < budget) {
    const cur = stack[--top];
    const cx = cur % w, cy = (cur / w) | 0;
    for (let k = 0; k < 8; k++) {
      const nx = cx + NX[k], ny = cy + NY[k];
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const n = ny * w + nx;
      if (pixels[n]) continue;
      if (rgba) colourAt(rgba, n, here);
      else here[0] = here[1] = here[2] = grey ? grey[n] : (bits[n] === 1 ? 0 : 255);
      const dr = here[0] - seed[0], dg = here[1] - seed[1], db = here[2] - seed[2];
      // Squared, and against three channels' worth of the tolerance, so the
      // number on the slider is "how far off in each channel" rather than a
      // distance nobody can picture.
      if (dr * dr + dg * dg + db * db > limit) continue;
      pixels[n] = 1;
      size++;
      stack[top++] = n;
    }
  }
  return { pixels, size, wasInk, truncated: top > 0 };
}

/**
 * The edge of a selection, as closed polygons on the pixel lattice.
 *
 * The same crack walk the tracer uses, so the line drawn round a selection is
 * exactly the boundary the tracer would start from - not a blur, not a swollen
 * copy of the pixels, and crisp at any zoom because it is coordinates.
 */
export function outlineOfSelection(pixels, w, h, maxPoints = Infinity) {
  const contours = traceContours({ w, h, bits: pixels }, { minArea: 0 });
  // A selection of half a photograph has a boundary of hundreds of thousands
  // of points, and stroking that on every pointer move is the same stopped tab
  // by another route. The caller gets nothing and says so, rather than a
  // drawing nobody can wait for.
  let points = 0;
  for (const c of contours) points += c.xs.length;
  return points > maxPoints ? null : contours;
}

/**
 * What the visitor has decided, kept apart from what the threshold decided.
 *
 * Corrections are stored as their own layer rather than painted into the mask,
 * so moving the threshold afterwards does not throw them away: the slider still
 * decides every pixel nobody has touched, and a touched one stays touched. It
 * is also what makes undo one line.
 */
export class MaskEdits {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    /** 0 = whatever the threshold said, 1 = forced ink, 2 = forced paper. */
    this.overrides = new Uint8Array(w * h);
    this.history = [];
    this.touched = 0;
  }

  /** @param {Uint8Array} pixels @param {boolean} ink */
  set(pixels, ink) {
    const value = ink ? 1 : 2;
    const where = [];
    const was = [];
    for (let i = 0; i < pixels.length; i++) {
      if (!pixels[i] || this.overrides[i] === value) continue;
      where.push(i);
      was.push(this.overrides[i]);
      this.overrides[i] = value;
    }
    if (!where.length) return 0;
    this.history.push({ where: Int32Array.from(where), was: Uint8Array.from(was) });
    this.touched += where.length;
    return where.length;
  }

  /**
   * Swap what every correction means, because ink and paper just swapped.
   *
   * A correction says "this belongs to the object" or "this does not", and
   * inverting the picture does not change anybody's mind about that - it
   * changes which colour the object is. Leave the overrides alone and a speck
   * somebody deleted reappears as a hole punched in the background, which
   * looks exactly like a bug. The history is flipped with them so undo still
   * restores what it was told to.
   */
  flip() {
    const swap = (v) => (v === 1 ? 2 : v === 2 ? 1 : 0);
    for (let i = 0; i < this.overrides.length; i++) {
      this.overrides[i] = swap(this.overrides[i]);
    }
    for (const step of this.history) {
      for (let k = 0; k < step.was.length; k++) step.was[k] = swap(step.was[k]);
    }
  }

  undo() {
    const last = this.history.pop();
    if (!last) return false;
    for (let k = 0; k < last.where.length; k++) this.overrides[last.where[k]] = last.was[k];
    this.touched -= last.where.length;
    return true;
  }

  reset() {
    this.overrides.fill(0);
    this.history.length = 0;
    this.touched = 0;
  }

  get edits() { return this.history.length; }

  /** The mask the tracer should actually see. */
  apply(mask) {
    const bits = Uint8Array.from(mask.bits);
    for (let i = 0; i < bits.length; i++) {
      const o = this.overrides[i];
      if (o === 1) bits[i] = 1;
      else if (o === 2) bits[i] = 0;
    }
    return { ...mask, bits };
  }
}
