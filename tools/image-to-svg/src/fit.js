/**
 * Turning a staircase into a shape.
 *
 * The crack outline from contour.js is exact and useless: it has one point per
 * pixel of perimeter and every corner is a right angle, so drawn at any size
 * above its own it looks like what it is. Three things happen here, in order,
 * and each undoes a different part of that.
 *
 * 1. SIMPLIFY. Douglas-Peucker over the closed loop, at a tolerance of about a
 *    pixel. What survives is a polygon whose vertices are where the outline
 *    actually changes direction rather than where the grid made it turn.
 *
 * 2. REFINE. Each edge of that polygon has the crack points it was chosen to
 *    stand for; a least-squares line through those points is a far better
 *    estimate of the true edge than the lattice ever was, because the
 *    staircase error is symmetric and averages out. Where two of those lines
 *    meet is a corner known to a fraction of a pixel. This is the step that
 *    makes the result look drawn rather than resampled, and it is why the
 *    tolerance in step 1 can be loose: a stray vertex costs a segment, not
 *    accuracy.
 *
 * 3. CURVE. A vertex is a corner if the outline genuinely turns there, and a
 *    sampling artefact if it does not - the same distinction Selinger's
 *    potrace paper draws with its alpha, and the same continuum between them:
 *    a vertex that is nearly a corner gets a curve that nearly touches it.
 *    Curves run midpoint to midpoint of the two edges, so consecutive vertices
 *    join with matching tangents and the whole loop is smooth except where it
 *    is meant not to be.
 *
 * The knobs are all here rather than in trace.js because they are all about
 * this one trade: fewer segments against closer fit.
 */

export const DEFAULTS = {
  /**
   * Douglas-Peucker tolerance, in pixels, or 'auto'.
   *
   * Below about 1.0 a fixed tolerance does nothing at all: a staircase step
   * stands a whole unit off the line it is meant to be on, so anything under
   * that keeps every step and there is nothing left to simplify. Above about
   * 1.5 it starts eating real curvature. That would be a narrow but workable
   * range if every shape were the same size - and the first thing a page of
   * 12 pixel text proves is that they are not. A tolerance of 1.5 is a tenth
   * of a silhouette's arm and the whole width of a letter's stem, and at that
   * size it does not simplify the letter, it demolishes it.
   *
   * So the tolerance is not a property of the image, it is a property of each
   * loop in it, and 'auto' works it out per loop from the one number that says
   * how thick the thing is: twice its area over its perimeter, which is the
   * width of a bar and the radius of a disc. See autoEpsilon.
   */
  epsilon: 'auto',
  /** The band 'auto' is allowed to choose from, and its share of the thickness. */
  epsilonRange: [0.6, 1.5],
  epsilonOfThickness: 0.35,
  /**
   * How far a vertex must stand off its neighbours' chord to be a real corner,
   * counted in multiples of epsilon. It is a multiple rather than a length
   * because the two scale together: a smoothly curved outline, at any radius
   * from 8 pixels to 2000, puts its vertices about 3 epsilon off the chord,
   * while a right angle puts its vertex half an edge away. Anywhere from 3.5
   * to 6 separates them; 4 is the middle of that.
   */
  cornerFactor: 4,
  /**
   * ...or how far it must turn, in degrees away from straight, whatever its
   * size. This is the rule that catches a sharp point whose edges are too
   * short for the one above. A circle of radius 8 turns 47 degrees at each of
   * its 8 vertices, which is the floor this cannot go under without shattering
   * small round things into polygons.
   */
  cornerAngle: 65,
  /** Below this bulge a vertex is not a feature at all, just a point on a line. */
  flatBulge: 0.08,
  /**
   * The fewest crack points an edge may stand on. Two kept points a step apart
   * are not two edges meeting, they are one edge with a hesitation in it - and
   * the damage is not the wasted segment, it is that the corner they surround
   * gets shared between them: a 116 degree turn read as two of 58, neither of
   * which is sharp enough to be called a corner. That is how a five pointed
   * star traced with nine points.
   */
  minRun: 3,
  /** A refined vertex is never moved further than this from the lattice. */
  maxShift: 2.0,
};

/**
 * @param {{xs: Int32Array, ys: Int32Array}} contour
 * @param {object} [options] see DEFAULTS
 * @returns {{start: number[], cmds: Array<object>, vertices: object[]}}
 */
export function fitContour(contour, options = {}) {
  const o = { ...DEFAULTS, ...options };
  const { xs, ys } = contour;
  const n = xs.length;
  const epsilon = o.epsilon === 'auto' ? autoEpsilon(contour, o) : o.epsilon;

  let keep = simplifyClosed(xs, ys, epsilon);
  keep = dropHesitations(keep, n, o.minRun);
  if (keep.length < 3) keep = staircaseCorners(xs, ys);
  if (keep.length < 3) keep = [0, Math.floor(n / 3), Math.floor((2 * n) / 3)];

  const m = keep.length;
  const lines = new Array(m);
  for (let i = 0; i < m; i++) lines[i] = fitLine(xs, ys, keep[i], keep[(i + 1) % m], n);

  const vertices = new Array(m);
  for (let i = 0; i < m; i++) {
    const at = keep[i];
    vertices[i] = meetOfLines(lines[(i - 1 + m) % m], lines[i], xs[at], ys[at], o.maxShift);
  }

  return { ...curveThrough(vertices, o, epsilon), vertices, epsilon };
}

/**
 * How thick is this loop, and so how much detail is worth keeping in it?
 *
 * Twice the area over the perimeter is a decent width for anything that is not
 * pathological: a bar of width w and length L gives 2wL/(2L+2w), which is w
 * for a long bar; a disc of radius r gives r. A loop thinner than about four
 * pixels cannot afford a tolerance of one and a half, because there is not one
 * and a half pixels of it to spare, and this is what stops a page of small
 * text from being simplified into wedges.
 *
 * Holes are wound the other way, hence the absolute value.
 */
function autoEpsilon(contour, o) {
  const perimeter = contour.xs.length;
  const thickness = perimeter > 0 ? (2 * Math.abs(contour.area)) / perimeter : 0;
  const [lo, hi] = o.epsilonRange;
  return Math.max(lo, Math.min(hi, thickness * o.epsilonOfThickness));
}

/* ---- 1. simplify ---------------------------------------------------------- */

function simplifyClosed(xs, ys, epsilon) {
  const n = xs.length;
  if (n < 4) return [...xs.keys()];

  // Two anchors that are certainly on the hull of the loop, so neither of the
  // two halves can be simplified away wholesale.
  let cx = 0, cy = 0;
  for (let i = 0; i < n; i++) { cx += xs[i]; cy += ys[i]; }
  cx /= n; cy /= n;
  let a = 0, far = -1;
  for (let i = 0; i < n; i++) {
    const d = (xs[i] - cx) ** 2 + (ys[i] - cy) ** 2;
    if (d > far) { far = d; a = i; }
  }
  let b = a, far2 = -1;
  for (let i = 0; i < n; i++) {
    const d = (xs[i] - xs[a]) ** 2 + (ys[i] - ys[a]) ** 2;
    if (d > far2) { far2 = d; b = i; }
  }

  const order = new Array(n + 1);
  for (let k = 0; k <= n; k++) order[k] = (a + k) % n;
  const posB = (b - a + n) % n;

  const kept = new Uint8Array(n + 1);
  kept[0] = 1;
  kept[posB] = 1;
  kept[n] = 1;
  rdp(xs, ys, order, 0, posB, epsilon, kept);
  rdp(xs, ys, order, posB, n, epsilon, kept);

  const out = [];
  for (let k = 0; k < n; k++) if (kept[k]) out.push(order[k]);
  return out;
}

function rdp(xs, ys, order, lo, hi, epsilon, kept) {
  const stack = [[lo, hi]];
  while (stack.length) {
    const [i, j] = stack.pop();
    if (j <= i + 1) continue;
    const ax = xs[order[i]], ay = ys[order[i]];
    const bx = xs[order[j]], by = ys[order[j]];
    let ex = bx - ax, ey = by - ay;
    const len = Math.hypot(ex, ey);
    if (len > 0) { ex /= len; ey /= len; }
    let worst = -1, at = -1;
    for (let k = i + 1; k < j; k++) {
      const px = xs[order[k]] - ax, py = ys[order[k]] - ay;
      const d = len > 0 ? Math.abs(px * ey - py * ex) : Math.hypot(px, py);
      if (d > worst) { worst = d; at = k; }
    }
    if (worst > epsilon) {
      kept[at] = 1;
      stack.push([i, at], [at, j]);
    }
  }
}

/**
 * Thin out kept points that sit on top of each other. See minRun.
 *
 * The test is not "are these two close" but "are these two close while their
 * other neighbours are far", and that difference is the whole function. A
 * genuine hesitation is one short edge in a run of long ones - the pair
 * straddling the inner point of a star. A letter at 12 pixels is short edges
 * all the way round, every one of them real, and a rule that only looked at
 * the near side would decimate it to every third point and turn an H into a
 * wedge.
 *
 * Dropping one of the pair is safe even at a sharp point, because the edges
 * either side of the survivor are fitted from their own crack points and the
 * corner comes back as their intersection. Nothing is averaged across the tip.
 */
function dropHesitations(keep, n, minRun) {
  if (keep.length <= 4) return keep;
  const out = keep.slice();
  for (let i = 0; i < out.length && out.length > 4; i++) {
    const m = out.length;
    const before = (out[i] - out[(i - 1 + m) % m] + n) % n;
    const after = (out[(i + 1) % m] - out[i] + n) % n;
    if (Math.min(before, after) >= minRun) continue;
    if (before + after < minRun * 3) continue;
    out.splice(i, 1);
    i--;
  }
  return out;
}

/** Every point where the staircase itself changes direction. */
function staircaseCorners(xs, ys) {
  const n = xs.length;
  const out = [];
  for (let i = 0; i < n; i++) {
    const p = (i - 1 + n) % n, q = (i + 1) % n;
    if ((xs[i] - xs[p]) !== (xs[q] - xs[i]) || (ys[i] - ys[p]) !== (ys[q] - ys[i])) out.push(i);
  }
  return out;
}

/* ---- 2. refine ------------------------------------------------------------ */

/** Least squares through the crack points from `from` to `to` around the loop. */
function fitLine(xs, ys, from, to, n) {
  let count = (to - from + n) % n;
  if (count === 0) count = n;
  count += 1;

  let sx = 0, sy = 0;
  for (let k = 0, i = from; k < count; k++, i = (i + 1) % n) { sx += xs[i]; sy += ys[i]; }
  const mx = sx / count, my = sy / count;

  let sxx = 0, sxy = 0, syy = 0;
  for (let k = 0, i = from; k < count; k++, i = (i + 1) % n) {
    const dx = xs[i] - mx, dy = ys[i] - my;
    sxx += dx * dx; sxy += dx * dy; syy += dy * dy;
  }
  // Principal axis of the point set: the eigenvector of the larger eigenvalue.
  const t = sxx + syy, det = sxx * syy - sxy * sxy;
  const lambda = t / 2 + Math.sqrt(Math.max(0, (t * t) / 4 - det));
  let ux = sxy, uy = lambda - sxx;
  if (Math.abs(ux) + Math.abs(uy) < 1e-9) { ux = lambda - syy; uy = sxy; }
  const len = Math.hypot(ux, uy);
  if (len < 1e-9) {
    const ex = xs[to] - xs[from], ey = ys[to] - ys[from];
    const l = Math.hypot(ex, ey) || 1;
    return { cx: mx, cy: my, dx: ex / l, dy: ey / l };
  }
  return { cx: mx, cy: my, dx: ux / len, dy: uy / len };
}

/** Where two fitted edges meet - or, when they are nearly parallel, near enough. */
function meetOfLines(a, b, latticeX, latticeY, maxShift) {
  const cross = a.dx * b.dy - a.dy * b.dx;
  let px, py;
  if (Math.abs(cross) > 0.3) {
    const t = ((b.cx - a.cx) * b.dy - (b.cy - a.cy) * b.dx) / cross;
    px = a.cx + t * a.dx;
    py = a.cy + t * a.dy;
  } else {
    // Shallow crossing: the intersection is real but wildly sensitive, so take
    // the lattice corner projected onto each edge instead and split it.
    const p1 = project(a, latticeX, latticeY);
    const p2 = project(b, latticeX, latticeY);
    px = (p1[0] + p2[0]) / 2;
    py = (p1[1] + p2[1]) / 2;
  }
  const ox = px - latticeX, oy = py - latticeY;
  const d = Math.hypot(ox, oy);
  if (d > maxShift) { px = latticeX + (ox / d) * maxShift; py = latticeY + (oy / d) * maxShift; }
  return { x: px, y: py };
}

function project(line, x, y) {
  const t = (x - line.cx) * line.dx + (y - line.cy) * line.dy;
  return [line.cx + t * line.dx, line.cy + t * line.dy];
}

/* ---- 3. curve ------------------------------------------------------------- */

function curveThrough(v, o, epsilon) {
  const m = v.length;
  const mid = (p, q) => ({ x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 });
  const lerp = (p, q, t) => ({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t });

  const cosLimit = Math.cos((o.cornerAngle * Math.PI) / 180);
  const cornerBulge = o.cornerFactor * epsilon;
  const cmds = [];
  let corners = 0, smooth = 0, flat = 0;
  let start = null;

  for (let i = 0; i < m; i++) {
    const prev = v[(i - 1 + m) % m], cur = v[i], next = v[(i + 1) % m];
    const m1 = mid(prev, cur), m2 = mid(cur, next);

    // How far this vertex stands off the line between its neighbours, and how
    // hard the outline turns there. The first catches a corner between long
    // edges, the second a corner between short ones.
    const ex = next.x - prev.x, ey = next.y - prev.y;
    const chord = Math.hypot(ex, ey);
    const bulge = chord < 1e-9
      ? Math.hypot(cur.x - prev.x, cur.y - prev.y)
      : Math.abs((cur.x - prev.x) * ey - (cur.y - prev.y) * ex) / chord;

    const ax = cur.x - prev.x, ay = cur.y - prev.y;
    const bx = next.x - cur.x, by = next.y - cur.y;
    const la = Math.hypot(ax, ay) || 1e-9, lb = Math.hypot(bx, by) || 1e-9;
    const cosTurn = (ax * bx + ay * by) / (la * lb);

    if (start === null) start = [m1.x, m1.y];

    if (bulge < o.flatBulge) {
      // Three points on one line. Nothing happens here; say so in one command
      // and let the emitter fold it into its neighbours.
      cmds.push({ t: 'L', p: [m2.x, m2.y] });
      flat++;
    } else if (bulge >= cornerBulge || cosTurn <= cosLimit) {
      cmds.push({ t: 'L', p: [cur.x, cur.y] });
      cmds.push({ t: 'L', p: [m2.x, m2.y] });
      corners++;
    } else {
      // Controls sit along the two edges, so the curve leaves and arrives
      // tangent to them whatever k is; k alone says how close it passes to the
      // vertex. 2/3 is the parabola through both midpoints - the roundest
      // answer - and it tightens towards 1 as the vertex approaches a corner.
      const k = 2 / 3 + (1 / 3) * Math.min(1, bulge / cornerBulge);
      const c1 = lerp(m1, cur, k), c2 = lerp(m2, cur, k);
      cmds.push({ t: 'C', c1: [c1.x, c1.y], c2: [c2.x, c2.y], p: [m2.x, m2.y] });
      smooth++;
    }
  }
  return { start, cmds, corners, smooth, flat };
}
