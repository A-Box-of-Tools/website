/**
 * A mesh must locate pixels correctly before a browser is asked to rasterize it.
 * These checks use dense projective samples, all eight stored orientations,
 * and a recording canvas to keep cropped bands in the same reference space.
 * Actual antialiasing and copy/clip behaviour are checked in a browser.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MESH_MAX_BYTES, MESH_TOLERANCE, affineFromTriangles, bitmapPoint, drawMesh,
  expandTriangle, meshTriangles, prepareMesh,
} from '../../tools/stack-images/src/mesh.js';

const spot = { x: 37, y: 19, width: 6000, height: 4000 };
const homography = [1.002, -.003, 2, .004, .999, -3, 1.4e-6, -1.1e-6, 1];
const identity = [1, 0, 0, 0, 1, 0, 0, 0, 1];
const project = (h, p) => ({
  x: (h[0] * p.x + h[1] * p.y + h[2]) / (h[6] * p.x + h[7] * p.y + h[8]),
  y: (h[3] * p.x + h[4] * p.y + h[5]) / (h[6] * p.x + h[7] * p.y + h[8]),
});
const affine = (m, p) => ({ x: m[0] * p.x + m[2] * p.y + m[4],
  y: m[1] * p.x + m[3] * p.y + m[5] });
const near = (actual, expected, tolerance = 1e-8) => {
  assert.ok(Math.hypot(actual.x - expected.x, actual.y - expected.y) <= tolerance,
    `${JSON.stringify(actual)} differs from ${JSON.stringify(expected)}`);
};

// Barycentric interior samples exercise more than the points used to choose
// the grid. A wrong bound would leave the vertices perfect but blur stars in
// the middle of a triangle, which is precisely the failure this mesh avoids.
test('wide-field projective triangles stay below subpixel error throughout their interiors', () => {
  const mesh = prepareMesh(homography, spot);
  assert.ok(mesh.divisions > 1);
  assert.ok(mesh.error <= MESH_TOLERANCE);
  assert.ok(mesh.vertices.byteLength <= MESH_MAX_BYTES);
  for (const triangle of meshTriangles(mesh)) {
    const matrix = affineFromTriangles(triangle.source, triangle.target);
    for (let a = 0; a <= 8; a += 1) {
      for (let b = 0; b <= 8 - a; b += 1) {
        const weights = [a / 8, b / 8, 1 - (a + b) / 8];
        const point = { x: 0, y: 0 };
        for (let i = 0; i < 3; i += 1) {
          point.x += weights[i] * triangle.source[i].x;
          point.y += weights[i] * triangle.source[i].y;
        }
        near(affine(matrix, point), project(homography, point), MESH_TOLERANCE + 1e-8);
      }
    }
  }
});

test('an accepted mesh is reused and a horizon crossing is rejected before drawing', () => {
  assert.equal(prepareMesh(homography, spot), prepareMesh(homography, { ...spot }));
  assert.throws(() => prepareMesh([1, 0, 0, 0, 1, 0, -1 / 3000, 0, 1], spot),
    /warp/);
  assert.throws(() => prepareMesh([1, 0, 0, 0, 1, 0, NaN, 0, 1], spot), /warp/);
});

test('upright placement inverts every EXIF orientation into the stored bitmap', () => {
  const box = { x: 30, y: 20, width: 400, height: 300 };
  const upright = [{ x: 30, y: 20 }, { x: 430, y: 20 },
    { x: 430, y: 320 }, { x: 30, y: 320 }];
  const expected = [
    [[0, 0], [1, 0], [1, 1], [0, 1]],
    [[1, 0], [0, 0], [0, 1], [1, 1]],
    [[1, 1], [0, 1], [0, 0], [1, 0]],
    [[0, 1], [1, 1], [1, 0], [0, 0]],
    [[0, 0], [0, 1], [1, 1], [1, 0]],
    [[0, 1], [0, 0], [1, 0], [1, 1]],
    [[1, 1], [1, 0], [0, 0], [0, 1]],
    [[1, 0], [1, 1], [0, 1], [0, 0]],
  ];
  for (let turn = 1; turn <= 8; turn += 1) {
    const bitmap = turn < 5 ? { width: 800, height: 600 } : { width: 600, height: 800 };
    upright.forEach((point, index) => near(bitmapPoint(point, bitmap, box, turn), {
      x: expected[turn - 1][index][0] * bitmap.width,
      y: expected[turn - 1][index][1] * bitmap.height,
    }));
  }
});

test('expanded clips include a whole pixel square along a shared diagonal', () => {
  for (const points of [
    [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }],
    [{ x: 100, y: 100 }, { x: 100, y: 0 }, { x: 0, y: 0 }],
  ]) {
    const expanded = expandTriangle(points);
    const cross = (a, b, p) => (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
    const sign = Math.sign(cross(expanded[0], expanded[1], expanded[2]));
    for (const x of [49.5, 50.5]) {
      for (const y of [49.5, 50.5]) {
        for (let i = 0; i < 3; i += 1) {
          assert.ok(sign * cross(expanded[i], expanded[(i + 1) % 3], { x, y }) >= 0);
        }
      }
    }
  }
});

function recorder() {
  const draws = [];
  const stack = [];
  let matrix = identity;
  let operation = 'source-over';
  const context = {
    save() { stack.push({ matrix, operation }); },
    restore() { ({ matrix, operation } = stack.pop()); },
    setTransform(...values) { matrix = values; },
    get globalCompositeOperation() { return operation; },
    set globalCompositeOperation(value) { operation = value; },
    beginPath() {}, moveTo() {}, lineTo() {}, closePath() {}, clip() {},
    drawImage(...args) { draws.push({ matrix: [...matrix], operation, args }); },
  };
  return { context, draws, stack };
}

test('band drawing keeps full-frame coordinates and never reads a source RGBA buffer', () => {
  const bitmap = { width: 6000, height: 4000 };
  const whole = { x: 45, y: 35, width: 5800, height: 3800 };
  const band = { ...whole, y: 1000, height: 70 };
  const full = recorder();
  const partial = recorder();
  drawMesh(full.context, bitmap, homography, spot, 1, whole);
  drawMesh(partial.context, bitmap, homography, spot, 1, band);
  assert.ok(partial.draws.length > 0 && partial.draws.length < full.draws.length);
  for (const draw of partial.draws) {
    assert.equal(draw.operation, 'copy');
    assert.equal(draw.args.length, 9);
    const fullDraw = full.draws.find((candidate) =>
      candidate.args.slice(1).every((value, index) => value === draw.args[index + 1])
      && candidate.matrix.slice(0, 4).every((value, index) => value === draw.matrix[index]));
    assert.ok(fullDraw, 'a band must reuse a triangle from the global mesh');
    for (let i = 0; i < 4; i += 1) assert.equal(draw.matrix[i], fullDraw.matrix[i]);
    assert.ok(Math.abs(draw.matrix[4] + band.x - fullDraw.matrix[4] - whole.x) < 1e-8);
    assert.ok(Math.abs(draw.matrix[5] + band.y - fullDraw.matrix[5] - whole.y) < 1e-8);
    assert.ok(draw.args[3] < bitmap.width && draw.args[4] < bitmap.height,
      'each projective draw samples a bounded source rectangle');
  }
  assert.equal(partial.stack.length, 0, 'the caller retains its canvas state');
  assert.equal(partial.context.globalCompositeOperation, 'source-over');
});

test('an affine homography draws once and preserves the rotated bitmap mapping', () => {
  const bitmap = { width: 300, height: 400 };
  const box = { x: 10, y: 20, width: 400, height: 300 };
  const recorded = recorder();
  drawMesh(recorded.context, bitmap, identity, box, 6,
    { x: 15, y: 25, width: 380, height: 280 });
  assert.equal(recorded.draws.length, 1);
  const draw = recorded.draws[0];
  near(affine(draw.matrix, { x: 0, y: 0 }), { x: 395, y: -5 });
  near(affine(draw.matrix, { x: 300, y: 400 }), { x: -5, y: 295 });
});
