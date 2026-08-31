/**
 * tools/compare-heights/src/figures.js - the silhouettes, and the box they
 * have to stay inside.
 *
 * The claim this file is really testing is the one the whole tool rests on:
 * the top of a figure is the height written beside it. Every figure is drawn
 * in a box one unit tall, so "the picture is as tall as it says" is exactly
 * "nothing reaches above y = 0 or below y = 1" - which is checkable, and was
 * not true of two shapes that have since been cut.
 *
 * The other half is that a figure fits the column the chart gives it, which is
 * `width`. A hand nudged outwards without its `width` following it is a figure
 * that overlaps its neighbour, and nothing but looking would say so.
 *
 * THE GEOMETRY RULES RUN OVER THE BUILT FIGURES ONLY
 *
 * The two adults are traced artwork with an `inner` transform, and the point
 * extractor below understands the handful of path commands this file emits
 * rather than the whole of SVG - so pointed at four thousand characters of
 * somebody else's beziers it would report confident nonsense. What holds those
 * two to their box is the bounding box they were measured at, and what holds
 * that to the artwork is compare-heights-traced.test.js.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { SHAPES, roundedLoop, shapeOf } from '../../tools/compare-heights/src/figures.js';

/**
 * Every point a path visits, plus the extremes of any arc in it.
 *
 * Not a general SVG path parser: it handles exactly the commands figures.js
 * emits - absolute M, L and Q, the relative half-ellipse arcs the head is made
 * of, and Z. A quadratic lies inside the triangle of its control points, so
 * taking those as points is a conservative bound and cannot pass a shape that
 * really does leave the box.
 */
function pointsOf(d) {
  const tokens = d.match(/[MLQaZz]|-?\d*\.?\d+/g) ?? [];
  const points = [];
  let at = { x: 0, y: 0 };
  let i = 0;

  while (i < tokens.length) {
    const command = tokens[i];
    i += 1;
    const numbers = [];
    while (i < tokens.length && !/[MLQaZz]/.test(tokens[i])) {
      numbers.push(Number(tokens[i]));
      i += 1;
    }

    if (command === 'M' || command === 'L') {
      at = { x: numbers[0], y: numbers[1] };
      points.push(at);
    } else if (command === 'Q') {
      points.push({ x: numbers[0], y: numbers[1] });
      at = { x: numbers[2], y: numbers[3] };
      points.push(at);
    } else if (command === 'a') {
      // rx ry rotation large-arc sweep dx dy. The half-ellipse bulges ry from
      // the MIDPOINT of its two ends - which for the head is the centre of the
      // circle - rather than from wherever the pen happened to be.
      const [, ry, , , , dx, dy] = numbers;
      const end = { x: at.x + dx, y: at.y + dy };
      const middle = { x: (at.x + end.x) / 2, y: (at.y + end.y) / 2 };
      points.push(at, end,
                  { x: middle.x, y: middle.y - ry }, { x: middle.x, y: middle.y + ry });
      at = end;
    }
  }

  return points;
}

// Built here, so in the unit box already: the ones these rules can read.
const drawn = SHAPES.filter((shape) => shape.paths && !shape.inner);

test('there is a figure for every id the menu can hold, and it knows its name', () => {
  assert.deepEqual(SHAPES.map((shape) => shape.id),
                   ['man', 'woman', 'boy', 'girl', 'toddler', 'object']);
  for (const shape of SHAPES) {
    assert.equal(shape.label, `shape.${shape.id}`,
                 'the words live in the markup; this is only the key');
  }
});

test('four figures are drawn and the toddler is built here', () => {
  const traced = SHAPES.filter((shape) => shape.inner).map((shape) => shape.id);
  assert.deepEqual(traced, ['man', 'woman', 'boy', 'girl']);
  for (const shape of SHAPES) {
    assert.equal(typeof shape.inner, shape.inner === null ? 'object' : 'string',
                 `${shape.id}: inner is neither a transform nor null`);
  }
});

test('a built figure is already in the unit box and says so', () => {
  // `inner` null is not decoration: chart.js writes a second <g> for anything
  // that has one, and a built figure wrapped in a transform meant for traced
  // artwork would be drawn somewhere off the page.
  for (const shape of SHAPES.filter((s) => !['man', 'woman', 'boy', 'girl'].includes(s.id))) {
    assert.equal(shape.inner, null, `${shape.id} should not carry a transform`);
  }
});

test('the rectangle carries no paths, because the visitor types its shape', () => {
  assert.equal(shapeOf('object').paths, null);
  assert.ok(shapeOf('object').width > 0, 'it still needs a default aspect');
});

test('nothing reaches above the top of its box or below the ground', () => {
  for (const shape of drawn) {
    for (const d of shape.paths) {
      for (const point of pointsOf(d)) {
        assert.ok(point.y >= -1e-9,
                  `${shape.id}: something is ${-point.y} above the stated height`);
        assert.ok(point.y <= 1 + 1e-9,
                  `${shape.id}: something is ${point.y - 1} below the ground`);
      }
    }
  }
});

test('every figure touches both the top and the ground', () => {
  // A figure that stopped short would be drawn shorter than the number beside
  // it, which is the same failure as overflowing and harder to notice.
  for (const shape of drawn) {
    const all = shape.paths.flatMap(pointsOf);
    assert.ok(Math.min(...all.map((p) => p.y)) < 0.01, `${shape.id}: not up to the line`);
    assert.ok(Math.max(...all.map((p) => p.y)) > 0.99, `${shape.id}: not down to the ground`);
  }
});

test('every figure fits inside the width its column is given', () => {
  for (const shape of drawn) {
    const half = shape.width / 2;
    for (const point of shape.paths.flatMap(pointsOf)) {
      assert.ok(Math.abs(point.x) <= half + 1e-9,
                `${shape.id}: ${point.x} is outside a column of ${shape.width}`);
    }
  }
});

test('a person is symmetrical about the centre line', () => {
  // The body is one list of points mirrored, so this cannot drift - which is
  // exactly why it is worth asserting: it is the property that makes the
  // mirroring worth having.
  for (const shape of drawn) {
    // The distinct x values rather than every one of them: a closed loop
    // visits its first point twice, and an ellipse's two arcs share both of
    // their ends, so counting occurrences would fail on bookkeeping.
    const xs = [...new Set(shape.paths.flatMap(pointsOf)
      .map((p) => Math.round(p.x * 10000) / 10000))];
    const left = xs.filter((x) => x < 0).map((x) => -x).sort();
    const right = xs.filter((x) => x > 0).sort();
    assert.deepEqual(left, right, `${shape.id} is lopsided`);
  }
});

test('the toddler is built four and a half heads tall', () => {
  // The whole reason it is built rather than scaled down from an adult. Read
  // off the head path, which is the first subpath.
  const ys = pointsOf(shapeOf('toddler').paths[0]).map((p) => p.y);
  const head = Math.max(...ys) - Math.min(...ys);
  assert.ok(head > 0.2 && head < 0.24, `four and a half heads tall: ${head}`);
  // An adult is seven and a half - an eighth of them is head - so a toddler's
  // is nearly double the share. That gap is the whole point of the table.
  assert.ok(head > (1 / 7.5) * 1.5, 'a toddler is not a small adult');
});

test('a corner with no radius stays where it was put', () => {
  const d = roundedLoop([
    { x: 0, y: 0, r: 0 },
    { x: 1, y: 0, r: 0 },
    { x: 1, y: 1, r: 0 },
  ]);
  assert.equal(d, 'M0 0L1 0L1 1Z');
});

test('a radius pulls the corner back along both of its edges', () => {
  const d = roundedLoop([
    { x: 0, y: 0, r: 0 },
    { x: 1, y: 0, r: 0.25 },
    { x: 1, y: 1, r: 0 },
  ]);
  assert.equal(d, 'M0 0L0.75 0Q1 0 1 0.25L1 1Z');
});

test('a radius larger than the edge is clamped rather than turning it inside out', () => {
  const d = roundedLoop([
    { x: 0, y: 0, r: 0 },
    { x: 1, y: 0, r: 99 },
    { x: 1, y: 1, r: 0 },
  ]);
  assert.equal(d, 'M0 0L0.5 0Q1 0 1 0.5L1 1Z', 'half of each edge, and no further');
});
