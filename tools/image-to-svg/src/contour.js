/**
 * Walking the border between ink and paper.
 *
 * The outline of a bitmap shape is not a line through the pixels: it runs
 * BETWEEN them, along the cracks of the pixel grid, so every point on it has
 * whole-number coordinates and every step is one unit north, south, east or
 * west. Following those cracks is the only exact thing in this whole pipeline
 * - what comes after is all approximation, and it approximates this.
 *
 * The rule is: keep ink on your right. Start on the top edge of an ink pixel
 * with paper above it, heading east, and that single rule walks the whole
 * closed loop and brings you back. Outlines come out clockwise and the holes
 * inside them anticlockwise, which is exactly what SVG's default nonzero fill
 * wants: a hole punched by a loop wound the other way needs no bookkeeping
 * from us and no fill-rule on the path.
 *
 * WHY EVERY LOOP IS FOUND
 *
 * The scan starts a loop at any ink pixel whose neighbour above is paper. An
 * outline's topmost row has one of those. So does a hole - the ink pixel below
 * the hole's floor has paper (the hole) above it - and that edge belongs to
 * the hole's loop. So one scan finds both kinds, and the flood-and-invert step
 * other tracers need is not needed here.
 *
 * THE ONE AMBIGUOUS CASE
 *
 * Two ink pixels touching corner to corner, with paper in the other two
 * corners. The border can either pinch through the middle - two shapes - or
 * run round both - one shape. Neither is wrong; `joinDiagonals` chooses, and
 * the default (false) treats ink as 4-connected, which keeps two specks that
 * happen to touch from becoming one path.
 */

/**
 * @param {{w: number, h: number, bits: Uint8Array}} mask
 * @param {{joinDiagonals?: boolean, minArea?: number}} [options]
 * @returns {Array<{xs: Int32Array, ys: Int32Array, area: number}>}
 */
export function traceContours(mask, options = {}) {
  const { w, h, bits } = mask;
  const joinDiagonals = options.joinDiagonals === true;
  const minArea = options.minArea ?? 0;

  const ink = (x, y) => (x >= 0 && y >= 0 && x < w && y < h && bits[y * w + x] === 1);

  // One flag per crack, so a loop is walked once however many times its start
  // pixel is passed. Horizontal cracks are w by (h+1), vertical (w+1) by h.
  const hSeen = new Uint8Array(w * (h + 1));
  const vSeen = new Uint8Array((w + 1) * h);

  const out = [];
  const limit = 8 * (w + 1) * (h + 1);

  for (let sy = 0; sy < h; sy++) {
    for (let sx = 0; sx < w; sx++) {
      if (!ink(sx, sy) || ink(sx, sy - 1)) continue;
      if (hSeen[sy * w + sx]) continue;

      const xs = [];
      const ys = [];
      let x = sx, y = sy, dx = 1, dy = 0, steps = 0;

      for (;;) {
        xs.push(x); ys.push(y);
        if (dy === 0) hSeen[y * w + (dx > 0 ? x : x - 1)] = 1;
        else vSeen[(dy > 0 ? y : y - 1) * (w + 1) + x] = 1;

        x += dx; y += dy;

        // The two pixels ahead of the crossing, one either side of the line
        // we are walking. Left is (dy, -dx) with y pointing down the screen.
        const lx = dy, ly = -dx;
        const rx = -dy, ry = dx;
        const front = ink(x + (dx + rx - 1) / 2, y + (dy + ry - 1) / 2);
        const back = ink(x + (dx + lx - 1) / 2, y + (dy + ly - 1) / 2);

        if (!front) {
          if (back && joinDiagonals) { dx = lx; dy = ly; }
          else { dx = rx; dy = ry; }
        } else if (back) {
          dx = lx; dy = ly;
        }

        if (x === sx && y === sy && dx === 1 && dy === 0) break;
        if (++steps > limit) break;  // a bug, not a shape; better than a hang
      }

      let twice = 0;
      for (let i = 0, n = xs.length; i < n; i++) {
        const j = i + 1 === n ? 0 : i + 1;
        twice += xs[i] * ys[j] - xs[j] * ys[i];
      }
      const area = twice / 2;
      if (Math.abs(area) >= minArea) {
        out.push({ xs: Int32Array.from(xs), ys: Int32Array.from(ys), area });
      }
    }
  }
  return out;
}
