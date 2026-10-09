import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyHomography, boundedHomography, fitHomography, multiplyHomographies,
  projectiveConsensus, similarityHomography,
} from '../../tools/stack-images/src/projective.js';
import { NO_MOVE } from '../../tools/stack-images/src/align.js';
import { REFINED, refineMove, refineProjective } from '../../tools/stack-images/src/pipeline.js';
import { commonArea, planRun } from '../../tools/stack-images/src/plan.js';
import { MESH_MAX_BYTES } from '../../tools/stack-images/src/mesh.js';

const output = { width: 6000, height: 4000 };
const centre = { x: 3000, y: 2000 };
const spot = { x: 0, y: 0, ...output };
const perspective = [1.001, -.002, 3, .003, .998, -4, .0000014, -.0000021, 1];

function inverse(h) {
  const out = [
    h[4] * h[8] - h[5] * h[7], h[2] * h[7] - h[1] * h[8], h[1] * h[5] - h[2] * h[4],
    h[5] * h[6] - h[3] * h[8], h[0] * h[8] - h[2] * h[6], h[2] * h[3] - h[0] * h[5],
    h[3] * h[7] - h[4] * h[6], h[1] * h[6] - h[0] * h[7], h[0] * h[4] - h[1] * h[3],
  ];
  return out.map((value) => value / out[8]);
}

function field(matrix, noise = 0) {
  const back = inverse(matrix);
  const points = [];
  for (const y of [700, 2000, 3300]) {
    for (const x of [1000, 3000, 5000]) {
      const source = applyHomography(back, x, y);
      const index = points.length;
      points.push({
        x, y, dx: x - source.x + Math.sin(index * 7) * noise,
        dy: y - source.y + Math.cos(index * 11) * noise,
      });
    }
  }
  return points;
}

function near(actual, expected, tolerance = 1e-7) {
  assert.ok(Math.hypot(actual.x - expected.x, actual.y - expected.y) <= tolerance);
}

test('projective fit maps measured source features back to their targets at photographic dimensions', () => {
  const points = field(perspective);
  const fitted = fitHomography(points, centre);
  assert.ok(fitted);
  for (const point of points) {
    near(applyHomography(fitted, point.x - point.dx, point.y - point.dy), point);
  }
  for (const [x, y] of [[0, 0], [6000, 4000], [3700, 1250]]) {
    near(applyHomography(fitted, x, y), applyHomography(perspective, x, y));
  }
  assert.equal(fitHomography(points.slice(0, 3), centre), null);
  assert.equal(fitHomography(points.slice(0, 3).concat(points[0]), centre), null);
});

test('residual perspective composes on the left of the coarse rotation', () => {
  const coarse = { dx: 8, dy: -6, angle: 1.1, scale: .999 };
  const first = similarityHomography(coarse, centre);
  const combined = multiplyHomographies(perspective, first);
  for (const [x, y] of [[50, 60], [3000, 2000], [5800, 3900]]) {
    const intermediate = applyHomography(first, x, y);
    near(applyHomography(combined, x, y),
      applyHomography(perspective, intermediate.x, intermediate.y));
  }
});

test('wide-field fit predicts held-out windows and tolerates two localized outliers', () => {
  const points = field(perspective, .12);
  points[1].dx += 15;
  points[7].dy -= 18;
  const found = projectiveConsensus(points, { centre, output, limit: 100 });
  assert.ok(found);
  assert.equal(found.inliers.length, 7);
  assert.ok(!found.inliers.includes(1) && !found.inliers.includes(7));
  assert.ok(found.rms < .3);
  assert.ok(found.validation < .5);
});

test('ordinary rotation and scale do not acquire an unnecessary perspective warp', () => {
  const matrix = similarityHomography({ dx: 3, dy: -2, angle: .4, scale: 1.001 }, centre);
  const points = field(matrix, .12);
  assert.equal(projectiveConsensus(points, { centre, output, limit: 100 }), null);
  const coarse = { ...NO_MOVE, measured: true, clamped: false };
  const simple = refineMove(coarse, points, true, centre, 100);
  const auto = refineProjective(coarse, points, centre, 100, output, spot);
  assert.equal(auto.refine, REFINED.projectiveFallback);
  assert.equal(auto.fallbackRefine, simple.refine);
  for (const key of ['dx', 'dy', 'angle', 'scale']) assert.equal(auto[key], simple[key]);
  assert.equal(auto.homography, undefined);
});

test('perspective requires measured support across the full image', () => {
  const points = field(perspective);
  assert.equal(projectiveConsensus(points.slice(0, 6), { centre, output, limit: 100 }), null,
    'six windows in only the top two rows cannot establish the bottom of the image');
  assert.equal(projectiveConsensus(points.slice(0, 5), { centre, output, limit: 100 }), null);
});

test('a horizon, reflection, or excessive residual is rejected before a mesh can be drawn', () => {
  assert.equal(boundedHomography([1, 0, 0, 0, 1, 0, -1 / 3000, 0, 1], output), false);
  assert.equal(boundedHomography([-1, 0, 6000, 0, 1, 0, 0, 0, 1], output), false);
  assert.equal(boundedHomography([1, 0, 500, 0, 1, 0, 0, 0, 1], output, 100), false);
  assert.equal(projectiveConsensus(field(perspective), { centre, output, limit: 1 }), null);
});

test('a verified projective refinement retains quality and composes a drawable output transform', () => {
  const points = field(perspective, .1);
  const coarse = { dx: 3, dy: 8, angle: .5, scale: 1, measured: true, clamped: false };
  const found = refineProjective(coarse, points, centre, 100, output, spot);
  assert.equal(found.refine, REFINED.projective);
  assert.equal(found.projectiveInliers, 9);
  assert.ok(found.projectiveRms < .2 && found.projectiveValidation < .4);
  assert.equal(found.homography.length, 9);
});

test('projective crop corners lie inside every transformed frame', () => {
  const first = similarityHomography({ dx: 7, dy: -9, angle: .7, scale: 1 }, centre);
  const matrices = [perspective, multiplyHomographies(perspective, first)];
  const crop = commonArea(matrices.map((homography) => ({ ...NO_MOVE, homography })), output);
  assert.ok(crop.width > 5000 && crop.height > 3000);
  const corners = [[crop.x, crop.y], [crop.x + crop.width, crop.y],
    [crop.x + crop.width, crop.y + crop.height], [crop.x, crop.y + crop.height]];
  for (const matrix of matrices) {
    const quad = [[0, 0], [6000, 0], [6000, 4000], [0, 4000]]
      .map(([x, y]) => applyHomography(matrix, x, y));
    for (const [x, y] of corners) {
      for (let i = 0; i < 4; i += 1) {
        const a = quad[i], b = quad[(i + 1) % 4];
        assert.ok((b.x - a.x) * (y - a.y) - (b.y - a.y) * (x - a.x) >= -1e-6);
      }
    }
  }
});

test('projective planning reserves every retained mesh during decode and packing', () => {
  const request = { width: 1200, height: 800, frames: 8, mode: 'mean', budget: 1e9 };
  const simple = planRun({ ...request, align: 'similarity' });
  const projective = planRun({ ...request, align: 'projective' });
  const reserve = 7 * (MESH_MAX_BYTES + 1024);
  for (const stage of ['decode', 'readback', 'pack', 'encode']) {
    assert.equal(projective.stages[stage] - simple.stages[stage], reserve);
  }
  assert.equal(projective.stages.survey, simple.stages.survey);
});
