/**
 * A projective image, drawn through the browser's ordinary affine rasterizer.
 *
 * Reading an entire decoded frame into JavaScript would add another four bytes
 * per pixel beside the bitmap already in hand. A mesh keeps that frame in the
 * decoder: small affine draws sample its rectangles directly into the current
 * band, and the existing band readback remains the only pixel copy.
 *
 * The grid belongs to the uncropped, upright placement, not to a band. Reusing
 * that grid is what keeps a star in the same place across pass and band edges.
 */

import { orientationMatrix, orientedSize } from './orient.js';

export const MESH_TOLERANCE = 0.15;
const MAX_DIVISIONS = 128;
export const MESH_MAX_BYTES = (MAX_DIVISIONS + 1) ** 2 * 2 * Float64Array.BYTES_PER_ELEMENT;

// A pixel square reaches sqrt(.5) pixels from its centre in the worst edge
// direction. One pixel of overlap therefore lets a neighbouring triangle
// cover the whole sample where an antialiased clip alone would leave a crack.
const SEAM_PAD = 1;
const SOURCE_PAD = 4;
const cache = new WeakMap();

function denominator(h, point) {
  return h[6] * point.x + h[7] * point.y + h[8];
}

function map(h, point) {
  const q = denominator(h, point);
  return {
    x: (h[0] * point.x + h[1] * point.y + h[2]) / q,
    y: (h[3] * point.x + h[4] * point.y + h[5]) / q,
  };
}

function corner(spot, column, row, divisions) {
  return {
    x: spot.x + spot.width * column / divisions,
    y: spot.y + spot.height * row / divisions,
  };
}

/**
 * A bound on every point's error when one triangle is drawn as an affine map.
 *
 * The exact projected point is the weighted mean of the projected vertices
 * with weights lambda_i*q_i; the affine point uses lambda_i alone. Their
 * difference is a sum of the three pair products lambda_i*lambda_j times
 * (q_i-q_j)*(target_i-target_j), divided by the weighted denominator. The
 * pair products sum to at most 1/3, and the denominator is at least min|q|.
 * This bounds the interior as well as the midpoints; a midpoint-only check
 * could miss an image whose denominator changed fastest near a corner.
 */
export function triangleErrorBound(h, source) {
  const q = source.map((point) => denominator(h, point));
  if (q.some((value) => !Number.isFinite(value) || value === 0)
    || q.some((value) => Math.sign(value) !== Math.sign(q[0]))) return Infinity;
  const target = source.map((point) => map(h, point));
  let worst = 0;
  for (let i = 0; i < 3; i += 1) {
    for (let j = i + 1; j < 3; j += 1) {
      worst = Math.max(worst, Math.abs(q[i] - q[j])
        * Math.hypot(target[i].x - target[j].x, target[i].y - target[j].y));
    }
  }
  return worst / (3 * Math.min(...q.map(Math.abs)));
}

function gridError(h, spot, divisions) {
  let worst = 0;
  for (let row = 0; row < divisions; row += 1) {
    for (let column = 0; column < divisions; column += 1) {
      const a = corner(spot, column, row, divisions);
      const b = corner(spot, column + 1, row, divisions);
      const c = corner(spot, column + 1, row + 1, divisions);
      const d = corner(spot, column, row + 1, divisions);
      worst = Math.max(worst, triangleErrorBound(h, [a, b, c]),
        triangleErrorBound(h, [a, c, d]));
      if (worst > MESH_TOLERANCE) return worst;
    }
  }
  return worst;
}

/**
 * Validate and retain a bounded mesh before the pipeline accepts a new fit.
 *
 * Accepted homographies are immutable for the rest of a run. A weak cache
 * lets later bands reuse their geometry without retaining completed runs.
 * Only the final grid is allocated; trial grids are evaluated directly, so
 * choosing the resolution does not accumulate discarded coordinate buffers.
 */
export function prepareMesh(h, spot) {
  if (!h || h.length !== 9 || !Array.from(h).every(Number.isFinite)
    || ![spot.x, spot.y, spot.width, spot.height].every(Number.isFinite)
    || spot.width <= 0 || spot.height <= 0) throw new Error('warp');
  const signature = [spot.x, spot.y, spot.width, spot.height].join(',');
  const previous = cache.get(h);
  if (previous?.signature === signature) return previous;

  const edges = [corner(spot, 0, 0, 1), corner(spot, 1, 0, 1),
    corner(spot, 1, 1, 1), corner(spot, 0, 1, 1)];
  const q = edges.map((point) => denominator(h, point));
  if (q.some((value) => !Number.isFinite(value) || value === 0)
    || q.some((value) => Math.sign(value) !== Math.sign(q[0]))) throw new Error('warp');

  let divisions = 1;
  let error = gridError(h, spot, divisions);
  while (error > MESH_TOLERANCE && divisions < MAX_DIVISIONS) {
    divisions *= 2;
    error = gridError(h, spot, divisions);
  }
  if (!Number.isFinite(error) || error > MESH_TOLERANCE) throw new Error('warp');

  const vertices = new Float64Array((divisions + 1) ** 2 * 2);
  let at = 0;
  for (let row = 0; row <= divisions; row += 1) {
    for (let column = 0; column <= divisions; column += 1) {
      const point = map(h, corner(spot, column, row, divisions));
      if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) throw new Error('warp');
      vertices[at++] = point.x;
      vertices[at++] = point.y;
    }
  }
  const mesh = { signature, spot: { ...spot }, divisions, vertices, error,
    affine: h[6] === 0 && h[7] === 0 };
  cache.set(h, mesh);
  return mesh;
}

/** The same global triangles, regardless of the rows a caller is drawing. */
export function* meshTriangles(mesh) {
  const { spot, divisions, vertices } = mesh;
  const vertex = (column, row) => {
    const index = (row * (divisions + 1) + column) * 2;
    return { x: vertices[index], y: vertices[index + 1] };
  };
  for (let row = 0; row < divisions; row += 1) {
    for (let column = 0; column < divisions; column += 1) {
      const source = [corner(spot, column, row, divisions),
        corner(spot, column + 1, row, divisions),
        corner(spot, column + 1, row + 1, divisions),
        corner(spot, column, row + 1, divisions)];
      const target = [vertex(column, row), vertex(column + 1, row),
        vertex(column + 1, row + 1), vertex(column, row + 1)];
      yield { source: [source[0], source[1], source[2]],
        target: [target[0], target[1], target[2]] };
      yield { source: [source[0], source[2], source[3]],
        target: [target[0], target[2], target[3]] };
    }
  }
}

/** Invert the pipeline's upright placement, including the RAW's EXIF turn. */
export function bitmapPoint(point, bitmap, spot, turn) {
  const uprightX = point.x - spot.x - spot.width / 2;
  const uprightY = point.y - spot.y - spot.height / 2;
  const stored = orientedSize(spot.width, spot.height, turn);
  const [a, b, c, d] = orientationMatrix(turn);
  return {
    x: (a * uprightX + b * uprightY + stored.width / 2) * bitmap.width / stored.width,
    y: (c * uprightX + d * uprightY + stored.height / 2) * bitmap.height / stored.height,
  };
}

/** A Canvas transform through three correspondences, in setTransform order. */
export function affineFromTriangles(source, target) {
  const sx1 = source[1].x - source[0].x;
  const sy1 = source[1].y - source[0].y;
  const sx2 = source[2].x - source[0].x;
  const sy2 = source[2].y - source[0].y;
  const dx1 = target[1].x - target[0].x;
  const dy1 = target[1].y - target[0].y;
  const dx2 = target[2].x - target[0].x;
  const dy2 = target[2].y - target[0].y;
  const det = sx1 * sy2 - sx2 * sy1;
  if (!Number.isFinite(det) || Math.abs(det) < 1e-12) throw new Error('warp');
  const a = (dx1 * sy2 - dx2 * sy1) / det;
  const b = (dy1 * sy2 - dy2 * sy1) / det;
  const c = (sx1 * dx2 - sx2 * dx1) / det;
  const d = (sx1 * dy2 - sx2 * dy1) / det;
  return [a, b, c, d, target[0].x - a * source[0].x - c * source[0].y,
    target[0].y - b * source[0].x - d * source[0].y];
}

/** Offset each clip edge outwards, so adjacent affine samples meet opaquely. */
export function expandTriangle(points, padding = SEAM_PAD) {
  const area = (points[1].x - points[0].x) * (points[2].y - points[0].y)
    - (points[1].y - points[0].y) * (points[2].x - points[0].x);
  if (!Number.isFinite(area) || Math.abs(area) < 1e-12) throw new Error('warp');
  const sign = Math.sign(area);
  const normals = points.map((point, index) => {
    const next = points[(index + 1) % 3];
    const dx = next.x - point.x;
    const dy = next.y - point.y;
    const length = Math.hypot(dx, dy);
    return { x: sign * dy / length, y: -sign * dx / length };
  });
  return points.map((point, index) => {
    const previous = normals[(index + 2) % 3];
    const next = normals[index];
    const divisor = 1 + previous.x * next.x + previous.y * next.y;
    if (divisor < 1e-8) throw new Error('warp');
    return { x: point.x + padding * (previous.x + next.x) / divisor,
      y: point.y + padding * (previous.y + next.y) / divisor };
  });
}

function sourceRectangle(points, bitmap) {
  const left = Math.max(0, Math.floor(Math.min(...points.map((point) => point.x)) - SOURCE_PAD));
  const top = Math.max(0, Math.floor(Math.min(...points.map((point) => point.y)) - SOURCE_PAD));
  const right = Math.min(bitmap.width,
    Math.ceil(Math.max(...points.map((point) => point.x)) + SOURCE_PAD));
  const bottom = Math.min(bitmap.height,
    Math.ceil(Math.max(...points.map((point) => point.y)) + SOURCE_PAD));
  return { x: left, y: top, width: right - left, height: bottom - top };
}

function intersects(points, viewport) {
  return Math.max(...points.map((point) => point.x)) >= viewport.x
    && Math.min(...points.map((point) => point.x)) <= viewport.x + viewport.width
    && Math.max(...points.map((point) => point.y)) >= viewport.y
    && Math.min(...points.map((point) => point.y)) <= viewport.y + viewport.height;
}

/**
 * Draw directly into a crop or band whose origin is in output coordinates.
 *
 * The clip is set in destination pixels before the source affine transform.
 * Copy compositing replaces overlapping samples, including their alpha;
 * source-over would make a translucent PNG more opaque along every seam.
 * The expanded clips give each seam a fully covered sample, while the bounded
 * source rectangles keep the decoder from resampling a whole frame per draw.
 */
export function drawMesh(context, bitmap, homography, spot, turn, viewport) {
  const mesh = prepareMesh(homography, spot);
  context.save();
  try {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.globalCompositeOperation = 'copy';
    for (const triangle of meshTriangles(mesh)) {
      const clip = mesh.affine ? null : expandTriangle(triangle.target);
      // Acute clip corners extend further than one pixel along an axis. Cull
      // the expanded polygon itself so a neighbouring band's samples are not
      // omitted merely because its original triangle stopped just outside.
      if (!intersects(clip ?? triangle.target, viewport)) continue;
      const source = triangle.source.map((point) => bitmapPoint(point, bitmap, spot, turn));
      const matrix = affineFromTriangles(source, triangle.target);
      const rect = sourceRectangle(source, bitmap);
      if (rect.width <= 0 || rect.height <= 0) continue;
      context.save();
      try {
        if (clip) {
          context.beginPath();
          context.moveTo(clip[0].x - viewport.x, clip[0].y - viewport.y);
          context.lineTo(clip[1].x - viewport.x, clip[1].y - viewport.y);
          context.lineTo(clip[2].x - viewport.x, clip[2].y - viewport.y);
          context.closePath();
          context.clip();
        }
        context.setTransform(matrix[0], matrix[1], matrix[2], matrix[3],
          matrix[4] - viewport.x, matrix[5] - viewport.y);
        context.drawImage(bitmap, rect.x, rect.y, rect.width, rect.height,
          rect.x, rect.y, rect.width, rect.height);
      } finally {
        context.restore();
      }
      // A genuinely affine homography needs one rectangle, not two clipped
      // triangles. Both triangles have the same full source bounding box.
      if (mesh.affine) break;
    }
  } finally {
    context.restore();
  }
}
