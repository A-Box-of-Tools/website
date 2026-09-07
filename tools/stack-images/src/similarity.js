/**
 * The one transform a field of measured shifts agrees on, and which of them
 * agree at all.
 *
 * The refinement measures the residual shift between a frame and the reference
 * in nine windows spread over the picture, and nine shifts are more than a
 * shift: they are nine samples of a field, and a field that varies across the
 * frame is exactly what a rotation looks like. A frame turned a third of a
 * degree moves the middle of a 6000 by 4000 picture by nothing and each of
 * its corners by nineteen pixels, in four different directions - so a single
 * window at the middle finds nothing to correct and the corners stay as soft
 * as they were.
 * Nine windows see the turn; this module is what reads it back out of them.
 *
 * WHY THE FIT IS CLOSED-FORM AND NOT ITERATED
 *
 * A similarity has four degrees of freedom - one angle, one scale, two of
 * translation - and the least-squares similarity through a set of matched
 * points is a formula, not a search. Two sums over the points give the pair of
 * numbers the rotation and the scale are the polar form of, and the
 * translation is whatever moves one centroid onto the other afterwards. It
 * costs one pass over nine points and it is the exact minimiser, which an
 * iteration would only ever approach.
 *
 * WHY THE CONSENSUS IS EXHAUSTIVE AND NOT RANDOM
 *
 * Some of the nine windows will be wrong. A window on a cloudless sky has no
 * position to report, one on a walking figure reports the figure's movement
 * rather than the camera's, and least squares has no defence against either:
 * one window twenty pixels out drags the angle by a tenth of a degree and puts
 * the error back where it was. So the fit is made from the windows that agree
 * with each other and the rest are dropped, which is what RANSAC does - except
 * that RANSAC samples its pairs at random because its point sets run to
 * thousands, and nine points have thirty-six pairs. Every one is tried, the
 * largest agreeing set wins, and the answer is the same answer every time the
 * same nine windows are measured. A test can pin it exactly, which is not true
 * of a sampler.
 *
 * THE SIGN, WHICH IS THE THING TO GET RIGHT
 *
 * A point carries the shift to APPLY to the frame there - the same convention
 * as everything align.js returns, a correction and never a measurement. So the
 * transform handed back is the one that puts the frame straight, and a frame
 * that arrived turned by a third of a degree is described by an angle of minus
 * a third. Getting this backwards does not throw and does not look wrong in
 * review; it turns the frame the wrong way and doubles the blur the refinement
 * was there to remove.
 */

/**
 * How many windows have to agree before their fit is worth applying.
 *
 * Four of nine. Two determine a similarity exactly and so can never disagree
 * with themselves, and three is one measurement of agreement, which a pair of
 * windows that happened to catch the same moving branch would pass. Four is
 * two independent confirmations, and it is more than one cell's worth of the
 * grid, so no single wrong region of the picture can produce it alone.
 */
export const MIN_INLIERS = 4;

const DEGREES = 180 / Math.PI;

/** The centre a fit is expressed about, when the caller does not name one. */
const ORIGIN = Object.freeze({ x: 0, y: 0 });

/**
 * Where a similarity puts one point.
 *
 * Scale, then rotation, then the shift, all about `centre` - the same order
 * and the same centre as the pipeline's drawAligned, which is what makes a fit
 * from here something the drawing transform can be handed without any further
 * arithmetic.
 */
export function apply(fit, x, y, centre = ORIGIN) {
  const radians = fit.angle / DEGREES;
  const cos = Math.cos(radians) * fit.scale;
  const sin = Math.sin(radians) * fit.scale;
  const dx = x - centre.x;
  const dy = y - centre.y;
  return {
    x: centre.x + dx * cos - dy * sin + fit.dx,
    y: centre.y + dx * sin + dy * cos + fit.dy,
  };
}

/**
 * How far one point sits from where a fit says it should be, in pixels.
 *
 * The fit maps where the frame's content is now onto where it has to end up,
 * so the point goes in at `(x - dx, y - dy)` and is expected to come out at
 * `(x, y)`. That is the quantity the least-squares fit minimises, so the
 * consensus below and the `rms` a fit reports are measuring one thing.
 */
function distance(fit, point, centre) {
  const at = apply(fit, point.x - point.dx, point.y - point.dy, centre);
  return Math.hypot(at.x - point.x, at.y - point.y);
}

function rmsOf(fit, points, centre) {
  if (!points.length) return 0;
  let total = 0;
  for (const point of points) {
    const off = distance(fit, point, centre);
    total += off * off;
  }
  return Math.sqrt(total / points.length);
}

/**
 * The similarity that best explains a field of shifts.
 *
 * @param {{x: number, y: number, dx: number, dy: number}[]} points  each a
 *   place in the output and the shift to apply to the frame there
 * @param {{x: number, y: number}} [centre]  the point the returned angle and
 *   scale turn about, and the point the returned shift is expressed at
 * @returns {{angle: number, scale: number, dx: number, dy: number,
 *   rms: number} | null}  null when the points cannot determine one: fewer
 *   than two of them, or two in the same place, which fixes no angle.
 */
export function fitSimilarity(points, centre = ORIGIN) {
  const count = points.length;
  if (count < 2) return null;

  // The two centroids: where the content is now, and where it has to end up.
  // Taking them out first is what separates the rotation and the scale from
  // the translation - about their own centroids the two clouds differ by
  // nothing except a turn and a stretch.
  let sourceX = 0;
  let sourceY = 0;
  let targetX = 0;
  let targetY = 0;
  for (const point of points) {
    sourceX += point.x - point.dx;
    sourceY += point.y - point.dy;
    targetX += point.x;
    targetY += point.y;
  }
  sourceX /= count;
  sourceY /= count;
  targetX /= count;
  targetY /= count;

  // `a` and `b` are the rotation and the scale in one: the matrix that best
  // maps the centred source onto the centred target is [[a, -b], [b, a]],
  // whose polar form is a turn of atan2(b, a) by a factor of hypot(a, b).
  let alongside = 0;
  let across = 0;
  let spread = 0;
  let reach = 0;
  for (const point of points) {
    const x = point.x - point.dx - sourceX;
    const y = point.y - point.dy - sourceY;
    const u = point.x - targetX;
    const v = point.y - targetY;
    alongside += x * u + y * v;
    across += x * v - y * u;
    spread += x * x + y * y;
    reach += u * u + v * v;
  }
  // Both clouds have to have a size. Points all in one place fix no angle, and
  // it is the two windows measured at the same spot that reach this: their
  // targets coincide, the formula's numerators both come out zero, and what
  // would be handed back is a scale of nothing - a transform that collapses
  // the frame to a point rather than an admission that it could not be found.
  if (!(spread > 0) || !(reach > 0)) return null;

  const a = alongside / spread;
  const b = across / spread;
  const offX = sourceX - centre.x;
  const offY = sourceY - centre.y;
  const fit = {
    angle: Math.atan2(b, a) * DEGREES,
    scale: Math.hypot(a, b),
    // Whatever is left over once the turn has been applied about the caller's
    // centre: the shift that carries the source centroid onto the target one.
    dx: targetX - centre.x - (a * offX - b * offY),
    dy: targetY - centre.y - (b * offX + a * offY),
    rms: 0,
  };
  fit.rms = rmsOf(fit, points, centre);
  return fit;
}

/**
 * The largest set of points that agree on one similarity, and that similarity.
 *
 * Every pair is taken as a proposal - two points determine a similarity
 * exactly - and scored by how many of the others it explains within
 * `tolerance` pixels. The largest agreeing set wins, ties going to the lower
 * error, and the answer is refitted by least squares over that whole set, so
 * that the pair which proposed it has no more say than the rest.
 *
 * Null rather than a poor answer when nothing agrees, and that is the point of
 * the arrangement: a frame whose windows disagree has a moving subject or a
 * parallax in it, no similarity describes either, and the honest outcome is to
 * say nothing and leave the caller with the answer it already had.
 *
 * Null as well when two sets of the same size share no window between them,
 * which is the same refusal wearing a disguise. Each of the two fits its own
 * windows exactly, so both score a zero error and the tie falls to whichever
 * pair the loops reach first - and on a burst with a subject moving across
 * four windows and the background holding the other four, "first" means the
 * top left of the grid. Winning a coin toss is not evidence, and the answer
 * that came back would be a full-confidence fit indistinguishable from nine
 * windows agreeing. So a picture with two stories in it gets the same answer
 * as a picture with none.
 *
 * @param {{x: number, y: number, dx: number, dy: number}[]} points
 * @param {number} tolerance  how far a point may sit from a fit and still count
 * @param {{x: number, y: number}} [centre]
 * @returns {{fit: object, inliers: number[], rms: number} | null}
 */
export function consensus(points, tolerance, centre = ORIGIN) {
  // Every proposal is kept rather than only the leader, because the question
  // asked at the end - is there a rival nobody can choose between? - is about
  // the field of proposals and cannot be answered from the winner alone.
  const found = [];
  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      const proposal = fitSimilarity([points[i], points[j]], centre);
      if (!proposal) continue;

      const inliers = [];
      for (let k = 0; k < points.length; k += 1) {
        if (distance(proposal, points[k], centre) <= tolerance) inliers.push(k);
      }
      found.push({ inliers, rms: rmsOf(proposal, inliers.map((k) => points[k]), centre) });
    }
  }

  let best = null;
  for (const candidate of found) {
    // Strictly better, so that the first proposal to reach a given size and
    // error keeps it. The pairs are walked in index order, which is what
    // makes the whole thing repeatable rather than merely usually right.
    const better = !best
      || candidate.inliers.length > best.inliers.length
      || (candidate.inliers.length === best.inliers.length && candidate.rms < best.rms);
    if (better) best = candidate;
  }

  if (!best || best.inliers.length < MIN_INLIERS) return null;
  const kept = new Set(best.inliers);
  const rival = found.some((candidate) => candidate.inliers.length === best.inliers.length
    && candidate.inliers.every((k) => !kept.has(k)));
  if (rival) return null;

  const fit = fitSimilarity(best.inliers.map((k) => points[k]), centre);
  if (!fit) return null;
  return { fit, inliers: best.inliers, rms: fit.rms };
}
