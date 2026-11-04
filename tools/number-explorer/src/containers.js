// The shape of each thing water or sand can fill, as the polygon of its inside in
// a box one unit square, with y running down. The picture only ever claims one
// thing about these: the coloured area is the true share of the polygon's area.
// Their sizes are not on one ruler, and the page says so.

function arc(cx, cy, rx, ry, from, to, steps = 28) {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const angle = from + (to - from) * i / steps;
    return [cx + rx * Math.cos(angle), cy + ry * Math.sin(angle)];
  });
}

const CIRCLE = arc(0.5, 0.5, 0.5, 0.5, 0, Math.PI * 2, 56);
const TRIANGLE = [[0.5, 0], [1, 1], [0, 1]];

export const CONTAINERS = Object.freeze({
  spoon: { aspect: 2.5, inside: arc(0.28, 0.2, 0.26, 0.74, 0, Math.PI) },
  cup: { aspect: 0.72, inside: [[0.05, 0.02], [0.95, 0.02], [0.84, 0.95], [0.16, 0.95]] },
  bucket: { aspect: 0.98, inside: [[0.09, 0.16], [0.91, 0.16], [0.77, 0.98], [0.23, 0.98]] },
  bath: { aspect: 2.1, inside: [[0.03, 0.14], [0.97, 0.14], [0.94, 0.56], ...arc(0.76, 0.56, 0.18, 0.3, 0, Math.PI / 2, 8), ...arc(0.24, 0.56, 0.18, 0.3, Math.PI / 2, Math.PI, 8), [0.06, 0.56]] },
  room: { aspect: 2.5, inside: [[0, 0], [1, 0], [1, 1], [0, 1]] },
  pool: { aspect: 3.2, inside: [[0, 0.16], [1, 0.16], [1, 1], [0, 1]] },
  tanker: { aspect: 3.8, inside: [[0, 0.3], [1, 0.3], [0.97, 0.72], [0.91, 1], [0.08, 1], [0.03, 0.8]] },
  pyramid: { aspect: 1.57, inside: TRIANGLE },
  mountain: { aspect: 2, inside: TRIANGLE },
  loch: { aspect: 2.6, inside: [[0, 0.12], [0.14, 0.2], [0.27, 0.56], [0.4, 0.86], [0.58, 0.97], [0.75, 0.72], [0.87, 0.34], [1, 0.1]] },
  superior: { aspect: 3.5, inside: [[0, 0.3], [0.12, 0.42], [0.32, 0.72], [0.52, 0.9], [0.76, 0.78], [0.92, 0.5], [1, 0.3]] },
  water: { aspect: 1, inside: CIRCLE },
  moon: { aspect: 1, inside: CIRCLE },
  earth: { aspect: 1, inside: CIRCLE },
  neptune: { aspect: 1, inside: CIRCLE }
});

function spanAt(polygon, y) {
  let low = Infinity;
  let high = -Infinity;
  for (let i = 0; i < polygon.length; i++) {
    const [ax, ay] = polygon[i];
    const [bx, by] = polygon[(i + 1) % polygon.length];
    if ((ay <= y && by > y) || (by <= y && ay > y)) {
      const x = ax + (y - ay) / (by - ay) * (bx - ax);
      low = Math.min(low, x);
      high = Math.max(high, x);
    }
  }
  return high > low ? high - low : 0;
}

// The height that leaves this share of the polygon's area below it. Height alone
// would overstate a tapering shape: a pyramid a tenth full by volume is not filled
// a tenth of the way up, which is the mistake the old pictures were careful about.
export function levelForShare(polygon, share) {
  const ys = polygon.map(point => point[1]);
  const top = Math.min(...ys);
  const bottom = Math.max(...ys);
  if (share <= 0) return bottom;
  if (share >= 1) return top;
  const steps = 240;
  const step = (bottom - top) / steps;
  const areas = [0];
  let total = 0;
  for (let i = 0; i < steps; i++) {
    total += spanAt(polygon, bottom - (i + 0.5) * step) * step;
    areas.push(total);
  }
  const wanted = share * total;
  for (let i = 1; i <= steps; i++) {
    if (areas[i] >= wanted) {
      const part = (wanted - areas[i - 1]) / (areas[i] - areas[i - 1] || 1);
      return bottom - (i - 1 + part) * step;
    }
  }
  return top;
}

// The container a volume is being poured into: the smallest one it does not yet
// overflow. Past the last rung the largest stays on screen, full, with the rest
// said in words, because there is nothing bigger on this ladder to draw.
export function containerIndex(volumeM3, rungs) {
  for (let i = 0; i < rungs.length; i++) if (volumeM3 <= rungs[i].size * (1 + 1e-12)) return i;
  return rungs.length - 1;
}
