/**
 * Taking the chatter out of a traced outline.
 *
 * WHY THIS EXISTS
 *
 * One of the figures on /compare-heights/ - the standing man - is public-domain
 * artwork traced from a photograph, and the tracing shows: forty-six thousand
 * characters of path, its edge visibly ragged wherever the original had a
 * shadow, and fifteen specks of stray ink that are not part of the man at all.
 * At the size a height chart draws him it reads as a bad scan.
 *
 * So the shipped figure is a smoothed copy. That is allowed - the artwork is
 * CC0 - but a smoothed copy is a derived thing, and a derived thing in this
 * repository has to be reproducible or it is just a file somebody once made.
 * Hence one function, here, used by two callers: scripts/smooth-figure.mjs,
 * which regenerates the path, and tests/js/compare-heights-traced.test.js,
 * which runs it over the vendored original and fails if what ships is not what
 * comes out. Nothing is taken on trust and nothing is hand-tuned afterwards.
 *
 * HOW IT WORKS
 *
 * Flatten the curves to points, walk the outline at even spacing, average each
 * sample with its neighbours, and lay a Catmull-Rom spline back through the
 * result. Averaging is what forgets the wobble; even spacing is what stops the
 * averaging pulling harder where the original happened to put more points.
 *
 * It is deliberately not a browser routine. `getPointAtLength` would do the
 * walking for free, and then only a browser could check the answer - which is
 * the one thing this file is for.
 */

/** Absolute M, L, C and Z, which is all the vendored outlines use. */
const TOKENS = /([MLCZmlcz])|(-?\d*\.?\d+(?:e[-+]?\d+)?)/gi;

/**
 * A path as flat point lists, one per subpath.
 *
 * Each cubic is cut into a fixed number of straight pieces rather than an
 * adaptive number: the count has to be the same on every machine that runs
 * this, or the test that re-derives the answer is testing the arithmetic of
 * whoever ran it last.
 */
export function flatten(d, pieces = 16) {
  const tokens = [...d.matchAll(TOKENS)].map((m) => (m[1] ? m[1] : Number(m[2])));
  const subpaths = [];
  let points = null;
  let at = { x: 0, y: 0 };
  let start = { x: 0, y: 0 };
  let i = 0;

  const push = (p) => {
    const last = points[points.length - 1];
    if (!last || Math.hypot(last.x - p.x, last.y - p.y) > 1e-9) points.push(p);
  };

  while (i < tokens.length) {
    const command = tokens[i];
    if (typeof command !== 'string') { i += 1; continue; }
    i += 1;

    if (command === 'M' || command === 'm') {
      const relative = command === 'm';
      at = { x: (relative ? at.x : 0) + tokens[i], y: (relative ? at.y : 0) + tokens[i + 1] };
      i += 2;
      start = at;
      points = [at];
      subpaths.push(points);
      // A moveto with more pairs after it is an implicit lineto run.
      while (typeof tokens[i] === 'number') {
        at = { x: (relative ? at.x : 0) + tokens[i], y: (relative ? at.y : 0) + tokens[i + 1] };
        push(at);
        i += 2;
      }
    } else if (command === 'L' || command === 'l') {
      const relative = command === 'l';
      while (typeof tokens[i] === 'number') {
        at = { x: (relative ? at.x : 0) + tokens[i], y: (relative ? at.y : 0) + tokens[i + 1] };
        push(at);
        i += 2;
      }
    } else if (command === 'C' || command === 'c') {
      const relative = command === 'c';
      while (typeof tokens[i] === 'number') {
        const base = relative ? at : { x: 0, y: 0 };
        const c1 = { x: base.x + tokens[i], y: base.y + tokens[i + 1] };
        const c2 = { x: base.x + tokens[i + 2], y: base.y + tokens[i + 3] };
        const end = { x: base.x + tokens[i + 4], y: base.y + tokens[i + 5] };
        for (let step = 1; step <= pieces; step += 1) {
          const t = step / pieces;
          const u = 1 - t;
          push({
            x: u * u * u * at.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * end.x,
            y: u * u * u * at.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * end.y,
          });
        }
        at = end;
        i += 6;
      }
    } else if (command === 'Z' || command === 'z') {
      at = start;
    }
  }

  return subpaths.filter((list) => list.length > 2);
}

const span = (list) => {
  let low = Infinity;
  let high = -Infinity;
  for (const p of list) { low = Math.min(low, p.y); high = Math.max(high, p.y); }
  return high - low;
};

function perimeter(points) {
  let total = 0;
  for (let i = 0; i < points.length; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    total += Math.hypot(b.x - a.x, b.y - a.y);
  }
  return total;
}

/** `count` points spaced evenly around a closed outline. */
function resample(points, count) {
  const total = perimeter(points);
  const out = [];
  let walked = 0;
  let i = 0;
  let carried = 0;

  for (let n = 0; n < count; n += 1) {
    const want = (n / count) * total;
    while (walked + carried < want && i < points.length) {
      walked += carried;
      const a = points[i];
      const b = points[(i + 1) % points.length];
      carried = Math.hypot(b.x - a.x, b.y - a.y);
      i += 1;
    }
    const a = points[(i - 1 + points.length) % points.length];
    const b = points[i % points.length];
    const t = carried > 0 ? Math.min(1, Math.max(0, (want - walked) / carried)) : 0;
    out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
  }

  return out;
}

/** Each point replaced by the average of itself and its neighbours, wrapping. */
function average(points, window) {
  const count = points.length;
  return points.map((_, index) => {
    let x = 0;
    let y = 0;
    for (let k = -window; k <= window; k += 1) {
      const p = points[(index + k + count) % count];
      x += p.x;
      y += p.y;
    }
    return { x: x / (window * 2 + 1), y: y / (window * 2 + 1) };
  });
}

/** A closed Catmull-Rom spline through `points`, written as cubics. */
function curve(points, places) {
  const round = (n) => {
    const f = 10 ** places;
    // +0 so a rounded -0 prints as 0 rather than "-0".
    return (Math.round(n * f) / f) + 0;
  };
  const at = (i) => points[(i + points.length) % points.length];

  let d = `M${round(at(0).x)} ${round(at(0).y)}`;
  for (let i = 0; i < points.length; i += 1) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    d += `C${round(p1.x + (p2.x - p0.x) / 6)} ${round(p1.y + (p2.y - p0.y) / 6)}`
      + ` ${round(p2.x - (p3.x - p1.x) / 6)} ${round(p2.y - (p3.y - p1.y) / 6)}`
      + ` ${round(p2.x)} ${round(p2.y)}`;
  }
  return `${d}Z`;
}

/**
 * One traced outline, redrawn smooth.
 *
 * @param {string} d  the vendored path, exactly as published
 * @param {object} [options]
 *   `step` is the spacing of the walk as a fraction of the artwork's height, so
 *   the same numbers suit a drawing however it was scaled. `window` is how many
 *   neighbours each side get averaged in. `dropBelow` throws away any subpath
 *   whose perimeter is under that fraction of the height - the specks a tracer
 *   leaves behind, which are never part of the figure.
 * @returns {string[]} one `d` per surviving subpath
 */
export function smoothOutline(d, options = {}) {
  const {
    step = 1 / 150, window = 2, dropBelow = 0.08, pieces = 16, places = 2,
  } = options;

  const subpaths = flatten(d, pieces);
  const height = Math.max(...subpaths.map(span), 1e-9);

  return subpaths
    .filter((points) => perimeter(points) >= dropBelow * height)
    .map((points) => {
      const count = Math.max(12, Math.min(600, Math.round(perimeter(points) / (step * height))));
      return curve(average(resample(points, count), window), places);
    });
}
