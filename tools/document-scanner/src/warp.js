/**
 * Taking the page out of the photograph: the perspective resample.
 *
 * One function of any consequence. For every pixel of the flat page that is
 * being produced, work out where that point was in the photograph, and read the
 * colour there. Going in this direction - destination first, source second - is
 * what makes the result complete: every output pixel is written exactly once,
 * so there are no seams, no gaps and no pixels written twice, which is what
 * happens to anyone who tries it the other way round.
 *
 * WHY NOT setTransform AND ONE drawImage. Because a canvas transform is affine:
 * six numbers, which can rotate, scale, shear and move, and cannot do
 * perspective. Perspective needs the eight numbers of a homography, and the
 * division by the third row is the whole point of it - it is what makes the far
 * end of the page smaller than the near end, and undoing it is what this tool is
 * for. There is a well-known trick of splitting the quad into triangles and
 * transforming each affinely, and it is visibly wrong on a page: straight lines
 * of text develop a kink down the middle.
 *
 * WHERE THE SMOOTHING COMES FROM. Reading one source pixel per output pixel is
 * fine while the page is being enlarged or barely shrunk, and it is not fine
 * when a forty megapixel photograph is being resampled down to something
 * printable, because sampling below the detail in the picture is aliasing and on
 * a page of small text it looks like the letters are dissolving. So the number
 * of samples per output pixel is taken from the scale being applied: at 1:1, one
 * sample; at half size, a 2x2 average of four. That is a box filter, which is
 * not the best kernel there is, and it is the one whose cost is proportional to
 * exactly how much of a problem there is.
 */

import { homography, project } from './geometry.js';

/** Sub-samples per output pixel, per axis, however far it is being shrunk. */
const MAX_SAMPLES = 2;

/**
 * How far inside its own corners the page is actually read, in source pixels
 * per sample.
 *
 * Without this every scan comes out with a thin dark frame around it, and the
 * reason is worth writing down because it looks like a bug in the corner finder
 * and is only half one. Two things put desk into the outermost row of the page:
 * the sample is bilinear, so it averages the four source pixels around a point
 * that is only half an output pixel inside the edge; and the edge itself is a
 * line fitted to a photograph, so it can sit a pixel or two outside the paper
 * along part of its length even when all four corners are right.
 *
 * Three pixels absorbs both. Measured on the synthetic pages in
 * tests/js/document-scanner-scan.test.js, one pixel of inset leaves a third of
 * the outermost column reading as ink and three leaves none of it. What it costs
 * is three pixels of page at the very edge, where there is nothing but paper -
 * about a third of a millimetre on an A4 page scanned at 200 dpi.
 */
const INSET = 3;

/**
 * Straighten a quadrilateral out of a photograph.
 *
 * @param {{data: Uint8ClampedArray, width: number, height: number}} source
 * @param {{x: number, y: number}[]} quad in TL, TR, BR, BL order, in source
 *   pixels
 * @param {{width: number, height: number}} size of the page to produce
 * @returns {{data: Uint8ClampedArray, width: number, height: number}}
 */
export function warpPage(source, quad, size) {
  const width = Math.max(1, Math.round(size.width));
  const height = Math.max(1, Math.round(size.height));

  const samples = sampleCount(quad, width, height);

  // The map from the flat page to the photograph. Built this way round, not
  // inverted afterwards, because the inverse of a homography is another
  // homography and solving for the one that is wanted is no more work than
  // solving for the one that is not.
  const toSource = homography(
    [{ x: 0, y: 0 }, { x: width, y: 0 }, { x: width, y: height }, { x: 0, y: height }],
    inset(quad, INSET * samples),
  );
  // A phrase key: this module ships in fifteen languages, and dragging a
  // corner past its neighbours is something somebody can actually do.
  if (!toSource) throw new Error('warp.degenerate');
  const out = new Uint8ClampedArray(width * height * 4);
  const step = 1 / samples;
  const first = step / 2;

  let at = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let r = 0;
      let g = 0;
      let b = 0;

      for (let sy = 0; sy < samples; sy += 1) {
        for (let sx = 0; sx < samples; sx += 1) {
          const point = project(toSource, x + first + sx * step, y + first + sy * step);
          const pixel = bilinear(source, point.x - 0.5, point.y - 0.5);
          r += pixel[0];
          g += pixel[1];
          b += pixel[2];
        }
      }

      const taken = samples * samples;
      out[at] = r / taken;
      out[at + 1] = g / taken;
      out[at + 2] = b / taken;
      out[at + 3] = 255;
      at += 4;
    }
  }

  return { data: out, width, height };
}

/**
 * The same quad with every side moved inwards by `by` pixels.
 *
 * Each side is offset along its own normal and the new corners are where the
 * offset sides cross, which gives exactly `by` pixels of clearance on all four
 * regardless of the shape. Pulling the corners towards the centroid instead is
 * one line shorter and is not the same thing: on a page much taller than it is
 * wide it insets the long sides by a fraction of what it insets the short ones,
 * and the frame comes back down two of the four edges.
 */
function inset(quad, by) {
  const sides = [];
  for (let i = 0; i < 4; i += 1) {
    const a = quad[i];
    const b = quad[(i + 1) % 4];
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    if (length < 1e-6) return quad.map((point) => ({ ...point }));

    // Inward, for corners held in the order orderCorners produces.
    const nx = -(b.y - a.y) / length;
    const ny = (b.x - a.x) / length;
    sides.push({ nx, ny, c: (a.x + nx * by) * nx + (a.y + ny * by) * ny });
  }

  return [0, 1, 2, 3].map((i) => {
    const previous = sides[(i + 3) % 4];
    const here = sides[i];
    const det = previous.nx * here.ny - previous.ny * here.nx;
    if (Math.abs(det) < 1e-9) return { ...quad[i] };
    return {
      x: (previous.c * here.ny - here.c * previous.ny) / det,
      y: (previous.nx * here.c - here.nx * previous.c) / det,
    };
  });
}

/**
 * How many sub-samples each output pixel deserves.
 *
 * The comparison is between the longest side of the page as it appears in the
 * photograph and the number of pixels that side is being resampled into. Taking
 * the longest rather than the average is deliberate: the near edge of a page
 * photographed at an angle can be half as long again as the far one, and it is
 * the near edge - the sharp, detailed one - that aliasing would be visible on.
 */
function sampleCount(quad, width, height) {
  const across = Math.max(
    Math.hypot(quad[1].x - quad[0].x, quad[1].y - quad[0].y),
    Math.hypot(quad[2].x - quad[3].x, quad[2].y - quad[3].y),
  );
  const down = Math.max(
    Math.hypot(quad[3].x - quad[0].x, quad[3].y - quad[0].y),
    Math.hypot(quad[2].x - quad[1].x, quad[2].y - quad[1].y),
  );

  const shrink = Math.max(across / width, down / height);
  return Math.min(MAX_SAMPLES, Math.max(1, Math.round(shrink)));
}

/**
 * One colour, read between four pixels.
 *
 * Coordinates are in the convention where a whole number is the centre of a
 * pixel, which is why the caller subtracts a half before getting here. Outside
 * the picture the nearest edge pixel is repeated rather than the sample being
 * dropped: a corner dragged a little past the edge of the photograph should
 * produce a page with a smear of its own border down one side, not a black
 * stripe, and certainly not a hole in the middle of the arithmetic.
 */
function bilinear({ data, width, height }, x, y) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;

  const left = clamp(x0, width);
  const right = clamp(x0 + 1, width);
  const top = clamp(y0, height) * width;
  const bottom = clamp(y0 + 1, height) * width;

  const tl = (top + left) * 4;
  const tr = (top + right) * 4;
  const bl = (bottom + left) * 4;
  const br = (bottom + right) * 4;

  const out = [0, 0, 0];
  for (let c = 0; c < 3; c += 1) {
    const upper = data[tl + c] + (data[tr + c] - data[tl + c]) * fx;
    const lower = data[bl + c] + (data[br + c] - data[bl + c]) * fx;
    out[c] = upper + (lower - upper) * fy;
  }
  return out;
}

const clamp = (value, size) => (value < 0 ? 0 : (value > size - 1 ? size - 1 : value));

/**
 * The same four corners, turned a quarter turn clockwise.
 *
 * Rotating a scan is not a rotation of any pixels here: which corner of the
 * photograph is treated as the top left of the page is the only thing that
 * decides which way up the page comes out, so a quarter turn is a shift of this
 * list by one. The aspect ratio, the output size and the resample all follow
 * from the corners, so all three turn with it and none of them has to know.
 */
export const turnQuad = (quad) => [quad[3], quad[0], quad[1], quad[2]];
