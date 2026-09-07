/**
 * tools/stack-images/src/similarity.js - nine measured shifts into one turn.
 *
 * Two things are worth pinning hard here and they are both about direction.
 *
 * The SIGN. A point carries the shift to apply to the frame at that place, so
 * the transform that comes back is a correction: a frame that arrived turned
 * by a third of a degree is described by an angle of minus a third. Every
 * field below is therefore built forwards - a frame is turned by a known
 * amount, the shift each window would measure is worked out from that turn,
 * and the fit is asked to give the turn back with the opposite sign. Nothing
 * here assumes a convention; the fixtures create one.
 *
 * The AGREEMENT. The consensus exists so that a window on a moving branch does
 * not drag the whole frame with it, and the way that fails silently is by
 * quietly including the outlier and reporting a fit that is a little bit
 * wrong. So the tests check which points were kept, not only what came out.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  MIN_INLIERS, apply, consensus, fitSimilarity,
} from '../../tools/stack-images/src/similarity.js';

const CENTRE = { x: 1500, y: 1000 };

/** The nine window centres of a 3x3 grid over a 3000x2000 output. */
const GRID = [];
for (const y of [500, 1000, 1500]) for (const x of [750, 1500, 2250]) GRID.push({ x, y });

/**
 * The shifts nine windows would measure of a frame that arrived turned by
 * `angle`, scaled by `scale` and moved by (`dx`, `dy`) about the centre.
 *
 * Forwards: the transform is what happened TO the frame, and the shift at a
 * place is what it would take to undo it there. So a fit of this field has to
 * come back as the inverse of what went in.
 */
function fieldFrom({ angle = 0, scale = 1, dx = 0, dy = 0 }, points = GRID) {
  const radians = (angle * Math.PI) / 180;
  const cos = Math.cos(radians) * scale;
  const sin = Math.sin(radians) * scale;
  return points.map(({ x, y }) => {
    const at = {
      x: CENTRE.x + (x - CENTRE.x) * cos - (y - CENTRE.y) * sin + dx,
      y: CENTRE.y + (x - CENTRE.x) * sin + (y - CENTRE.y) * cos + dy,
    };
    return { x, y, dx: x - at.x, dy: y - at.y };
  });
}

/**
 * The largest distance between where a fit puts a point and where it belongs.
 *
 * Entered where the frame's content is - the place the window measured, less
 * the shift measured there - and expected to come out at the place itself.
 */
function worst(fit, points, centre = CENTRE) {
  let most = 0;
  for (const point of points) {
    const at = apply(fit, point.x - point.dx, point.y - point.dy, centre);
    most = Math.max(most, Math.hypot(at.x - point.x, at.y - point.y));
  }
  return most;
}

test('a third of a degree of turn is read back, with the sign it has to have', () => {
  // The case the whole grid exists for. A frame turned by 0.3 degrees is
  // eight pixels out at the corners of a 3000-pixel picture and nothing at all
  // at the middle, so one window in the middle sees nothing to correct - and
  // the coarse log-polar pass, whose square resolves 0.7 degrees a row, sees
  // about a third of it.
  const field = fieldFrom({ angle: 0.3 });
  const fit = fitSimilarity(field, CENTRE);

  assert.ok(Math.abs(fit.angle + 0.3) < 0.02, `turned back by ${fit.angle}, not -0.3`);
  assert.ok(Math.abs(fit.scale - 1) < 1e-4, `invented a scale of ${fit.scale}`);
  assert.ok(fit.rms < 0.01, `fitted an exact field to ${fit.rms} px`);
  // And the transform composed out of it puts every window where its own
  // measurement said it should go. The half-pixel scale of the whole exercise
  // is what makes 0.05 the interesting number here.
  assert.ok(worst(fit, field) < 0.05, `left ${worst(fit, field)} px on the table`);

  // Read the other way round, which is how the pipeline uses it: the frame is
  // drawn through this transform, so the content standing at a window's own
  // centre has to end up that window's measured shift away from where it was.
  // The two readings differ by the square of the turn - a hundredth of a pixel
  // at a third of a degree - and are the same statement at this size.
  for (const point of field) {
    const at = apply(fit, point.x, point.y, CENTRE);
    assert.ok(
      Math.hypot(at.x - point.x - point.dx, at.y - point.y - point.dy) < 0.05,
      `the window at ${point.x},${point.y} was not moved by what it measured`,
    );
  }
});

test('a turn, a stretch and a shift together come back as all three', () => {
  // Asymmetric on purpose: a grid symmetric about the centre can hide a sign
  // error in the translation, because the two halves cancel.
  const points = [
    { x: 400, y: 300 }, { x: 1200, y: 350 }, { x: 2600, y: 500 },
    { x: 500, y: 1100 }, { x: 1700, y: 1250 }, { x: 2400, y: 900 },
    { x: 700, y: 1800 }, { x: 1500, y: 1700 }, { x: 2800, y: 1900 },
  ];
  const truth = { angle: -0.25, scale: 1.01, dx: 6.5, dy: -3.25 };
  const field = fieldFrom(truth, points);
  const fit = fitSimilarity(field, CENTRE);

  assert.ok(Math.abs(fit.angle - 0.25) < 0.02, `angle ${fit.angle}`);
  assert.ok(Math.abs(fit.scale - 1 / 1.01) < 1e-4, `scale ${fit.scale}`);
  // The translation is the inverse's, about the same centre: undoing a move of
  // (6.5, -3.25) means moving back by it, once the turn has been taken out.
  const undone = apply({ angle: 0.25, scale: 1 / 1.01, dx: 0, dy: 0 }, 6.5, -3.25, { x: 0, y: 0 });
  assert.ok(Math.abs(fit.dx + undone.x) < 0.05, `dx ${fit.dx}`);
  assert.ok(Math.abs(fit.dy + undone.y) < 0.05, `dy ${fit.dy}`);
  assert.ok(worst(fit, field) < 0.05);
});

test('a field that is all one shift is a shift, and no turn at all', () => {
  // The translate case, and the one where a rotation invented out of rounding
  // would be worst: it is applied to every frame of the burst.
  const fit = fitSimilarity(fieldFrom({ dx: 12, dy: -5 }), CENTRE);
  assert.equal(fit.angle, 0);
  assert.equal(fit.scale, 1);
  assert.ok(Math.abs(fit.dx + 12) < 1e-9, `dx ${fit.dx}`);
  assert.ok(Math.abs(fit.dy - 5) < 1e-9, `dy ${fit.dy}`);
});

test('the centre the fit is quoted about is the centre it is asked for', () => {
  // The angle and the scale do not depend on it and the translation entirely
  // does, because the translation is what is left over after turning about
  // that point. drawAligned turns about the uncropped output centre, so a fit
  // quoted about anything else composes into the wrong place.
  const field = fieldFrom({ angle: 0.4 });
  const middle = fitSimilarity(field, CENTRE);
  const corner = fitSimilarity(field, { x: 0, y: 0 });

  assert.ok(Math.abs(middle.angle - corner.angle) < 1e-9);
  assert.ok(Math.abs(middle.scale - corner.scale) < 1e-12);
  assert.ok(Math.hypot(middle.dx - corner.dx, middle.dy - corner.dy) > 1);
  // Both still put the points in the same place, which is the whole claim.
  assert.ok(worst(corner, field, { x: 0, y: 0 }) < 0.05);
});

test('two points determine one exactly, and one point determines nothing', () => {
  const field = fieldFrom({ angle: 0.3, dx: 4 });
  const pair = fitSimilarity([field[0], field[8]], CENTRE);
  assert.ok(Math.abs(pair.angle + 0.3) < 0.02);
  assert.equal(fitSimilarity([field[0]], CENTRE), null);
  assert.equal(fitSimilarity([], CENTRE), null);
  // Two windows in the same place fix no angle, whatever they say about it.
  assert.equal(fitSimilarity([field[4], { ...field[4], dx: 3 }], CENTRE), null);
});

test('four windows that agree outvote five that do not', () => {
  // The moving-subject case, at its worst: more of the picture disagrees than
  // agrees, and the four that do are the ones that saw the ground.
  const truth = fieldFrom({ angle: 0.3, dx: 2, dy: -1 });
  const points = truth.map((point, index) => (
    [0, 2, 6, 8].includes(index)
      ? point
      : { ...point, dx: point.dx + 9 + index, dy: point.dy - 7 - index }
  ));

  const found = consensus(points, 2, CENTRE);
  assert.deepEqual(found.inliers, [0, 2, 6, 8], 'kept a window that saw the subject');
  assert.ok(Math.abs(found.fit.angle + 0.3) < 0.02, `angle ${found.fit.angle}`);
  assert.ok(found.rms < 0.05, `rms ${found.rms}`);
  assert.ok(worst(found.fit, truth) < 0.05, 'the fit does not explain the windows it kept');
});

test('nine windows that all agree keep all nine', () => {
  const field = fieldFrom({ angle: -0.15, scale: 0.999, dx: -3 });
  const found = consensus(field, 2, CENTRE);
  assert.deepEqual(found.inliers, [0, 1, 2, 3, 4, 5, 6, 7, 8]);
  assert.ok(Math.abs(found.fit.angle - 0.15) < 0.02);
  assert.ok(Math.abs(found.fit.scale - 1 / 0.999) < 1e-4);
});

test('a consensus is the same consensus every time it is asked', () => {
  // No sampling anywhere in it, which is the reason a test may pin the inlier
  // list above rather than a property of it.
  const field = fieldFrom({ angle: 0.2 });
  const points = field.map((point, index) => (
    index % 2 ? { ...point, dx: point.dx + 30 } : point
  ));
  const first = consensus(points, 2, CENTRE);
  for (let again = 0; again < 5; again += 1) {
    assert.deepEqual(consensus(points, 2, CENTRE), first);
  }
});

test('windows that agree on nothing produce nothing, not a plausible fit', () => {
  // Two unrelated pictures, or a featureless one: the shifts are noise with
  // coordinates. Least squares would hand back an angle and a scale for this
  // set without complaining, which is exactly the failure the gate is for.
  const scattered = GRID.map(({ x, y }, index) => ({
    x, y, dx: [17, -23, 9, -31, 40, -12, 26, -38, 5][index], dy: [-29, 14, 33, 7, -19, 36, -8, 21, -27][index],
  }));
  assert.equal(consensus(scattered, 2, CENTRE), null);
});

test('two stories the same size is no story, and the order they are in cannot decide', () => {
  // A subject moving across the top-left block of the grid and the background
  // holding the other four, with the ninth window junk. Both sets fit
  // themselves exactly, so both score a zero error, and whichever the loops
  // reach first would otherwise win and drag the whole frame by the subject's
  // own movement - reported as a full-confidence fit.
  const truth = fieldFrom({ angle: 0.3 });
  const subject = [0, 1, 3, 4];
  const points = truth.map((point, index) => {
    if (subject.includes(index)) return { ...point, dx: point.dx - 14, dy: point.dy + 9 };
    if (index === 8) return { ...point, dx: point.dx + 31, dy: point.dy - 22 };
    return point;
  });

  assert.equal(consensus(points, 2, CENTRE), null);
  // And the same set with the subject on one window fewer is not ambiguous at
  // all, so the refusal is about the tie and not about the disagreement.
  const outvoted = truth.map((point, index) => (
    [0, 1, 3].includes(index) ? { ...point, dx: point.dx - 14, dy: point.dy + 9 } : point
  ));
  assert.deepEqual(consensus(outvoted, 2, CENTRE).inliers, [2, 4, 5, 6, 7, 8]);
});

test('fewer windows than the floor is nothing, however well they agree', () => {
  // Three windows on a wall agreeing perfectly is three windows on a wall.
  const field = fieldFrom({ angle: 0.3 });
  assert.equal(MIN_INLIERS, 4);
  assert.equal(consensus(field.slice(0, 3), 2, CENTRE), null);
  assert.equal(consensus(field.slice(0, 1), 2, CENTRE), null);
  assert.equal(consensus([], 2, CENTRE), null);
  assert.ok(consensus(field.slice(0, 4), 2, CENTRE), 'four is the floor, not the wall');
});

test('the tolerance is what decides, and it is the caller who sets it', () => {
  const field = fieldFrom({ angle: 0.3 });
  const points = field.map((point, index) => (
    index === 4 ? { ...point, dx: point.dx + 3 } : point
  ));
  assert.deepEqual(consensus(points, 2, CENTRE).inliers, [0, 1, 2, 3, 5, 6, 7, 8]);
  assert.deepEqual(
    consensus(points, 5, CENTRE).inliers, [0, 1, 2, 3, 4, 5, 6, 7, 8],
    'a tolerance wide enough to swallow it does',
  );
});
