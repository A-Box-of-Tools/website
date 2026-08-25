/**
 * The arithmetic of a quadrilateral: ordering its corners, turning it into a
 * rectangle, and working out what shape that rectangle really is.
 *
 * Everything here is a pure function on numbers and points. No canvas, no
 * pixels, no DOM - which is why this is the half of the straightening that is
 * actually tested (tests/js/document-scanner-geometry.test.js), and why the
 * resampling next door is a loop with one line of arithmetic in it.
 *
 * THE PROBLEM THIS FILE SOLVES, AND THE ONE IT DOES NOT
 *
 * Four corners of a page in a photograph are four points. Mapping them onto a
 * rectangle is a homography and is not interesting: eight numbers, eight
 * equations, one linear solve. What is interesting is how big that rectangle
 * should be - because the answer people expect is "the shape the page is", and
 * the corners alone do not obviously say.
 *
 * The obvious answer, and the one nearly every web scanner uses, is to take the
 * longest pair of opposite edges and call their ratio the aspect. It is wrong in
 * exactly the case this tool exists for: a photograph taken at an angle
 * foreshortens the far edge, so a sheet of A4 shot from above and to one side
 * comes out visibly squat, and every line of text on it is the wrong height. It
 * looks fine until it is put beside a real scan.
 *
 * The better answer is that a photograph of a rectangle carries enough
 * information to recover both the rectangle's aspect ratio AND the camera's
 * focal length, given only that the camera is an ordinary pinhole with square
 * pixels and its principal point near the middle of the frame. That is Zhang and
 * He's result from "Whiteboard Scanning and Image Enhancement" (2003), and
 * `perspectiveAspect` below is it: thirty lines of cross products, and the page
 * comes out the shape the page is.
 *
 * It has one honest failure, and it is not a rare one: a photograph taken
 * square-on. There the information is simply not present - the projection is
 * affine, the focal length cancels, and the arithmetic divides by something that
 * has gone to zero. That case does not need it, because an edge-length ratio is
 * exact when there is no perspective to distort it. So `pageAspect` asks for the
 * perspective answer, checks whether it was available and whether it is
 * plausible, and falls back to the edges when it was not. Which of the two
 * answered is reported, because the page says so.
 */

/** The corners, in the order this whole tool holds them: top left, clockwise. */
export const CORNER_KEYS = ['tl', 'tr', 'br', 'bl'];

/**
 * Put four points in TL, TR, BR, BL order.
 *
 * Sorting by angle about the centroid puts them in order around the quad -
 * clockwise on screen, where y counts downwards - and then the corner nearest
 * the top left is rotated to the front. Both steps are needed: the first fixes
 * the direction, the second fixes where it starts.
 *
 * This is what lets a corner handle be dragged anywhere at all, including past
 * its neighbours, without the rest of the tool ever being handed a quad whose
 * "top left" is at the bottom.
 */
export function orderCorners(points) {
  if (points.length !== 4) throw new Error('a page has four corners.');

  const cx = points.reduce((sum, p) => sum + p.x, 0) / 4;
  const cy = points.reduce((sum, p) => sum + p.y, 0) / 4;

  const around = [...points].sort(
    (a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx),
  );

  let first = 0;
  let best = Infinity;
  around.forEach((point, index) => {
    const score = point.x + point.y;
    if (score < best) {
      best = score;
      first = index;
    }
  });

  return [0, 1, 2, 3].map((step) => around[(first + step) % 4]);
}

/** Twice the signed area, by the shoelace formula. */
function shoelace(quad) {
  let sum = 0;
  for (let i = 0; i < 4; i += 1) {
    const a = quad[i];
    const b = quad[(i + 1) % 4];
    sum += a.x * b.y - b.x * a.y;
  }
  return sum;
}

/** How much of the picture the quad covers. Always positive. */
export function quadArea(quad) {
  return Math.abs(shoelace(quad)) / 2;
}

/**
 * Is this quad convex, and not degenerate?
 *
 * A page is convex in every photograph of one, so a candidate that is not is
 * either two edges that crossed or three corners in a line. Both come out of the
 * search in detect.js, and both would produce a warp that folds the picture over
 * itself, so they are refused here rather than drawn.
 */
export function isConvex(quad) {
  let sign = 0;
  for (let i = 0; i < 4; i += 1) {
    const a = quad[i];
    const b = quad[(i + 1) % 4];
    const c = quad[(i + 2) % 4];
    const cross2 = (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x);
    if (Math.abs(cross2) < 1e-9) return false;
    const way = cross2 > 0 ? 1 : -1;
    if (sign === 0) sign = way;
    else if (way !== sign) return false;
  }
  return true;
}

export const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

/** The four sides as they appear in the photograph: top, right, bottom, left. */
export function edgeLengths(quad) {
  return [0, 1, 2, 3].map((i) => distance(quad[i], quad[(i + 1) % 4]));
}

/**
 * The smallest corner angle, in degrees.
 *
 * A rectangle photographed from anywhere a person would stand keeps all four
 * corners well away from flat. A candidate with a twenty degree corner in it is
 * a sliver - three edges of something else and one line that happened to cross
 * them - and this is the cheapest way to say so.
 */
export function sharpestCorner(quad) {
  let sharpest = 180;
  for (let i = 0; i < 4; i += 1) {
    const previous = quad[(i + 3) % 4];
    const point = quad[i];
    const next = quad[(i + 1) % 4];
    const a = Math.atan2(previous.y - point.y, previous.x - point.x);
    const b = Math.atan2(next.y - point.y, next.x - point.x);
    let angle = Math.abs(a - b) * (180 / Math.PI);
    if (angle > 180) angle = 360 - angle;
    sharpest = Math.min(sharpest, angle);
  }
  return sharpest;
}

/* -------------------------------------------------------------- homography */

/**
 * The 3x3 matrix taking four source points to four destination points.
 *
 * Eight unknowns - the ninth is fixed at 1, which is allowed because a
 * homography is only defined up to scale - and two equations per pair of points,
 * so this is one 8x8 solve with no iteration in it. Written out as an augmented
 * matrix and reduced with partial pivoting, because that is thirty readable
 * lines and the alternative is a linear algebra library nobody here would read.
 *
 * @returns {number[]|null} nine numbers, row major, or null when the points are
 *   degenerate: three in a line, or two on top of each other.
 */
export function homography(source, destination) {
  const rows = [];
  for (let i = 0; i < 4; i += 1) {
    const { x, y } = source[i];
    const { x: u, y: v } = destination[i];
    rows.push([x, y, 1, 0, 0, 0, -u * x, -u * y, u]);
    rows.push([0, 0, 0, x, y, 1, -v * x, -v * y, v]);
  }

  for (let col = 0; col < 8; col += 1) {
    let pivot = col;
    for (let row = col + 1; row < 8; row += 1) {
      if (Math.abs(rows[row][col]) > Math.abs(rows[pivot][col])) pivot = row;
    }
    if (Math.abs(rows[pivot][col]) < 1e-10) return null;
    [rows[col], rows[pivot]] = [rows[pivot], rows[col]];

    const lead = rows[col][col];
    for (let k = col; k <= 8; k += 1) rows[col][k] /= lead;

    for (let row = 0; row < 8; row += 1) {
      if (row === col) continue;
      const factor = rows[row][col];
      if (!factor) continue;
      for (let k = col; k <= 8; k += 1) rows[row][k] -= factor * rows[col][k];
    }
  }

  const h = rows.map((row) => row[8]);
  return [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1];
}

/** Push one point through a homography. */
export function project(h, x, y) {
  const w = h[6] * x + h[7] * y + h[8];
  if (!w) return { x: 0, y: 0 };
  return {
    x: (h[0] * x + h[1] * y + h[2]) / w,
    y: (h[3] * x + h[4] * y + h[5]) / w,
  };
}

/* ------------------------------------------------------------- the shape */

const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/**
 * The page's true width-to-height ratio, recovered from the perspective.
 *
 * Zhang and He, "Whiteboard Scanning and Image Enhancement", Microsoft Research
 * MSR-TR-2003-39, section 3. The argument in one paragraph:
 *
 * Four image points that are the corners of a rectangle constrain the plane they
 * lie on. Each pair of opposite sides meets at a vanishing point; the two
 * directions those vanishing points stand for are perpendicular in the world,
 * and writing that perpendicularity down in terms of the camera matrix leaves
 * one equation in the one unknown a square-pixel camera with a centred principal
 * point still has - the focal length. Solve it, and those same two directions,
 * now measured with the focal length known, give the ratio of the sides.
 *
 * `n2` and `n3` are those two directions and `f2` is the focal length squared.
 *
 * @param {{x: number, y: number}[]} quad in TL, TR, BR, BL order
 * @param {number} width  of the picture the corners were measured in
 * @param {number} height
 * @returns {{aspect: number, focal: number}|null} null when the geometry does
 *   not carry the answer, which is the square-on photograph and is normal.
 */
export function perspectiveAspect(quad, width, height) {
  // The derivation wants the principal point at the origin. Taking it to be the
  // middle of the frame is the same assumption as "an ordinary camera, not
  // cropped off centre", which is what every method of this kind assumes.
  const cx = width / 2;
  const cy = height / 2;
  const at = (index) => [quad[index].x - cx, quad[index].y - cy, 1];

  // Zhang's m1..m4 are the corners in reading order - top left, top right,
  // bottom left, bottom right - which is not the order this tool holds them in.
  const m1 = at(0);
  const m2 = at(1);
  const m3 = at(3);
  const m4 = at(2);

  const k2d = dot(cross(m2, m4), m3);
  const k3d = dot(cross(m3, m4), m2);
  if (!k2d || !k3d) return null;

  const k2 = dot(cross(m1, m4), m3) / k2d;
  const k3 = dot(cross(m1, m4), m2) / k3d;

  const n2 = [k2 * m2[0] - m1[0], k2 * m2[1] - m1[1], k2 * m2[2] - m1[2]];
  const n3 = [k3 * m3[0] - m1[0], k3 * m3[1] - m1[1], k3 * m3[2] - m1[2]];

  // Both third components going to zero together is the affine case: the
  // photograph was taken square-on, the sides are parallel on the sensor as well
  // as in the world, and there is no perspective left to measure a focal length
  // with. The cut-off here is a guard against dividing by a rounding error and
  // nothing more - it is deliberately not a "is there enough perspective to
  // trust this" test, because that question is answered in pageAspect, where the
  // answer can be compared against the edges rather than guessed at in advance.
  if (Math.abs(n2[2] * n3[2]) < 1e-9) return null;

  const f2 = -(n2[0] * n3[0] + n2[1] * n3[1]) / (n2[2] * n3[2]);
  if (!(f2 > 0)) return null;

  const across = (n2[0] * n2[0] + n2[1] * n2[1]) / f2 + n2[2] * n2[2];
  const down = (n3[0] * n3[0] + n3[1] * n3[1]) / f2 + n3[2] * n3[2];
  if (!(across > 0) || !(down > 0)) return null;

  return { aspect: Math.sqrt(across / down), focal: Math.sqrt(f2) };
}

/**
 * The ratio the sides are in as they appear on the sensor.
 *
 * Exact for a photograph taken square-on, and wrong by however much the
 * perspective foreshortened the far edge for every other one - which is why it
 * is the fallback rather than the answer.
 */
export function edgeAspect(quad) {
  const [top, right, bottom, left] = edgeLengths(quad);
  const across = Math.max(top, bottom);
  const down = Math.max(left, right);
  return down > 0 ? across / down : 1;
}

/**
 * How far from a parallelogram the quad is, as a fraction.
 *
 * Zero means each pair of opposite sides is the same length as itself, which is
 * exactly the case where the perspective solve has nothing to work with - so
 * this is how much disagreement between the two answers the picture can account
 * for.
 */
function foreshortening(quad) {
  const [top, right, bottom, left] = edgeLengths(quad);
  const across = Math.abs(top - bottom) / Math.max(top, bottom, 1);
  const down = Math.abs(left - right) / Math.max(left, right, 1);
  return Math.max(across, down);
}

/**
 * The aspect ratio to straighten to, and where it came from.
 *
 * The perspective answer is preferred and then checked twice, because it is a
 * ratio of two square roots of quantities that go to zero together, and it
 * misbehaves spectacularly rather than gently:
 *
 *   - it has to be a page shape at all. Nothing anybody photographs as a
 *     document is eight times longer than it is wide, and a solve that says so
 *     has found a numerical edge rather than a page;
 *   - it has to be within reach of what the edges say, unless there is enough
 *     perspective in the photograph to account for the difference. A square-on
 *     photograph with two pixels of noise in a corner can produce a perspective
 *     answer a third away from an edge measurement that is, in that case,
 *     exactly right.
 *
 * @returns {{aspect: number, method: 'perspective'|'edges'}}
 */
export function pageAspect(quad, width, height) {
  const edges = edgeAspect(quad);
  const solved = perspectiveAspect(quad, width, height);
  if (!solved) return { aspect: clampAspect(edges), method: 'edges' };

  const { aspect } = solved;
  if (!(aspect > 0.1) || !(aspect < 10)) return { aspect: clampAspect(edges), method: 'edges' };

  // A strongly angled photograph earns a wide tolerance, because that is where
  // the two answers are meant to differ. A flat one earns almost none, because
  // there the edges are already right.
  const allowed = 0.08 + 2.2 * foreshortening(quad);
  if (Math.abs(Math.log(aspect / edges)) > allowed) {
    return { aspect: clampAspect(edges), method: 'edges' };
  }

  return { aspect: clampAspect(aspect), method: 'perspective' };
}

/** Nothing is ever straightened to a shape no page has. */
function clampAspect(aspect) {
  if (!Number.isFinite(aspect) || aspect <= 0) return 1;
  return Math.min(6, Math.max(1 / 6, aspect));
}

/**
 * The size to resample the page at.
 *
 * Two rules, in this order. The first is that no part of the page may be
 * squeezed: the output is at least as many pixels across as the longest edge
 * running that way in the photograph, so the sharpest part of the picture -
 * usually the near edge - is not the part thrown away. The second is the
 * ceiling, which is what stops a forty-eight megapixel photograph of a page held
 * at arm's length becoming a twelve thousand pixel canvas the browser declines
 * to allocate.
 *
 * @param {{x: number, y: number}[]} quad
 * @param {number} aspect  width / height, from pageAspect
 * @param {number} maxSide
 */
export function outputSize(quad, aspect, maxSide) {
  const [top, right, bottom, left] = edgeLengths(quad);
  const across = Math.max(top, bottom);
  const down = Math.max(left, right);

  // Whichever of the two measured sides implies the larger page wins, so neither
  // direction is resampled below the detail it arrived with.
  let height = Math.max(down, across / aspect);
  let width = height * aspect;

  const longest = Math.max(width, height);
  if (maxSide > 0 && longest > maxSide) {
    const scale = maxSide / longest;
    width *= scale;
    height *= scale;
  }

  return {
    width: Math.max(1, Math.round(width)),
    height: Math.max(1, Math.round(height)),
  };
}

/** Keep a point inside the picture it was measured in. */
export const clampPoint = (point, width, height) => ({
  x: Math.min(width, Math.max(0, point.x)),
  y: Math.min(height, Math.max(0, point.y)),
});

/** The four corners of the whole picture, in TL-first order. */
export const wholeFrame = (width, height) => [
  { x: 0, y: 0 },
  { x: width, y: 0 },
  { x: width, y: height },
  { x: 0, y: height },
];

/** A corner list copied, so that state and history never share points. */
export const copyQuad = (quad) => quad.map((point) => ({ x: point.x, y: point.y }));

/** The same quad measured in a picture `scale` times the size. */
export const scaleQuad = (quad, scale) => quad.map((point) => ({
  x: point.x * scale,
  y: point.y * scale,
}));
