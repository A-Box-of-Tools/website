/**
 * The tracer, against shapes whose right answer is known by construction.
 *
 * The interesting assertions here are the COUNTS, not the fit. A circle traced
 * with corners in it and a star traced with nine points both still cover
 * almost exactly the right pixels, so any measure of area agrees with both;
 * what tells them apart is how many corners came back. Both of those were real
 * bugs during development and both would have passed a fidelity check.
 *
 * The fit is checked as well, by rasterising the emitted path back with a
 * scanline filler written here and comparing pixel for pixel. It parses the
 * `d` string rather than reading the command objects, so a bug in the string
 * this tool actually ships is a bug this catches.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { maskFromImage, otsu } from '../../tools/image-to-svg/src/mask.js';
import { traceContours } from '../../tools/image-to-svg/src/contour.js';
import { traceImage, traceMask } from '../../tools/image-to-svg/src/trace.js';
import { subjectMask } from '../../tools/image-to-svg/src/subject.js';
import { labelRegions, selectRegion, MaskEdits } from '../../tools/image-to-svg/src/regions.js';

/* ---- pictures whose answer is known ---------------------------------------- */

/** An ImageData-shaped object; `inside` decides which pixels are ink. */
function drawing(w, h, inside) {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = (y * w + x) * 4;
      const on = inside(x + 0.5, y + 0.5);
      data[p] = data[p + 1] = data[p + 2] = on ? 0 : 255;
      data[p + 3] = 255;
    }
  }
  return { data, width: w, height: h };
}

const circle = (size, r) =>
  drawing(size, size, (x, y) => Math.hypot(x - size / 2, y - size / 2) < r);

const square = (size, side) => drawing(size, size, (x, y) => {
  const lo = (size - side) / 2;
  return x > lo && x < lo + side && y > lo && y < lo + side;
});

const star = (size, spike, waist) => drawing(size, size, (x, y) => {
  const a = Math.atan2(y - size / 2, x - size / 2);
  const r = Math.hypot(x - size / 2, y - size / 2);
  const t = (((a + Math.PI / 2) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const k = (t % ((Math.PI * 2) / 5)) / ((Math.PI * 2) / 5);
  const edge = k < 0.5
    ? spike + (waist - spike) * (k / 0.5)
    : waist + (spike - waist) * ((k - 0.5) / 0.5);
  return r < edge;
});

/* ---- a filler, so the path can be checked against the pixels ---------------- */

function flatten(p0, p1, p2, p3, into) {
  const span = Math.hypot(p1[0] - p0[0], p1[1] - p0[1])
    + Math.hypot(p2[0] - p1[0], p2[1] - p1[1])
    + Math.hypot(p3[0] - p2[0], p3[1] - p2[1]);
  const n = Math.max(3, Math.min(400, Math.ceil(span * 6)));
  for (let k = 1; k <= n; k++) {
    const t = k / n, u = 1 - t;
    into.push([
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ]);
  }
}

/** Absolute M/L/C/z only, which is all trace.js emits. */
function parsePath(d) {
  const number = /[-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?/g;
  const loops = [];
  let i = 0, loop = null, at = [0, 0];
  while (i < d.length) {
    const letter = d[i];
    if (letter !== 'M' && letter !== 'L' && letter !== 'C') { i += 1; continue; }
    number.lastIndex = i + 1;
    const take = (count) => {
      const got = [];
      for (let k = 0; k < count; k++) {
        const found = number.exec(d);
        assert.ok(found, `short ${letter} command`);
        got.push(Number(found[0]));
      }
      i = number.lastIndex;
      return got;
    };
    const more = () => /^[\s,]*[-+.0-9]/.test(d.slice(i));
    if (letter === 'M') {
      at = take(2);
      loop = [at];
      loops.push(loop);
    } else if (letter === 'L') {
      do { at = take(2); loop.push(at); } while (more());
    } else {
      do {
        const [x1, y1, x2, y2, x, y] = take(6);
        flatten(at, [x1, y1], [x2, y2], [x, y], loop);
        at = [x, y];
      } while (more());
    }
  }
  return loops;
}

/** Nonzero winding fill at pixel centres. */
function fill(loops, w, h) {
  const bits = new Uint8Array(w * h);
  const edges = [];
  for (const points of loops) {
    for (let i = 0; i < points.length; i++) {
      const a = points[i], b = points[(i + 1) % points.length];
      if (a[1] !== b[1]) edges.push([a[0], a[1], b[0], b[1]]);
    }
  }
  for (let j = 0; j < h; j++) {
    const y = j + 0.5;
    const hits = [];
    for (const [x0, y0, x1, y1] of edges) {
      const down = y0 < y1;
      if (y < Math.min(y0, y1) || y >= Math.max(y0, y1)) continue;
      hits.push([x0 + ((y - y0) * (x1 - x0)) / (y1 - y0), down ? 1 : -1]);
    }
    hits.sort((a, b) => a[0] - b[0]);
    let wind = 0;
    for (let k = 0; k < hits.length - 1; k++) {
      wind += hits[k][1];
      if (wind === 0) continue;
      const from = Math.max(0, Math.ceil(hits[k][0] - 0.5));
      const to = Math.min(w - 1, Math.ceil(hits[k + 1][0] - 0.5) - 1);
      for (let x = from; x <= to; x++) bits[j * w + x] = 1;
    }
  }
  return bits;
}

function agreement(image, out) {
  const back = fill(parsePath(out.d), image.width, image.height);
  let both = 0, either = 0;
  for (let i = 0; i < back.length; i++) {
    const ink = image.data[i * 4] < 128 ? 1 : 0;
    if (ink && back[i]) both++;
    if (ink || back[i]) either++;
  }
  return either ? both / either : 1;
}

/* ---- the outline runs between the pixels ------------------------------------ */

test('one ink pixel traces to its four corners, clockwise', () => {
  const bits = new Uint8Array(36);
  bits[2 * 6 + 2] = 1;
  const [loop] = traceContours({ w: 6, h: 6, bits });
  assert.deepEqual([...loop.xs], [2, 3, 3, 2]);
  assert.deepEqual([...loop.ys], [2, 2, 3, 3]);
  // Positive area is the winding an outline has; a hole gets the other sign,
  // which is what lets one path carry both with no fill-rule set.
  assert.equal(loop.area, 1);
});

test('a hole is found in the same pass, wound the other way', () => {
  const w = 8, h = 8, bits = new Uint8Array(w * h);
  for (let y = 1; y < 7; y++) for (let x = 1; x < 7; x++) bits[y * w + x] = 1;
  for (let y = 3; y < 5; y++) for (let x = 3; x < 5; x++) bits[y * w + x] = 0;
  const loops = traceContours({ w, h, bits });
  assert.equal(loops.length, 2);
  assert.equal(loops[0].area, 36);
  assert.equal(loops[1].area, -4);
});

test('ink touching corner to corner is two shapes, or one when asked', () => {
  const w = 6, h = 6, bits = new Uint8Array(w * h);
  bits[1 * w + 1] = 1;
  bits[2 * w + 2] = 1;
  assert.equal(traceContours({ w, h, bits }).length, 2);
  assert.equal(traceContours({ w, h, bits }, { joinDiagonals: true }).length, 1);
});

/* ---- corners are counted, because that is what tells the bugs apart --------- */

test('a square keeps exactly four corners and no curves', () => {
  const out = traceImage(square(256, 200));
  assert.equal(out.stats.contours, 1);
  assert.equal(out.stats.corners, 4);
  assert.equal(out.stats.curves, 0);
  assert.equal(agreement(square(256, 200), out), 1);
});

test('a circle comes back with no corners at all, at any size', () => {
  for (const [size, r] of [[64, 25], [512, 200]]) {
    const picture = circle(size, r);
    const out = traceImage(picture);
    assert.equal(out.stats.corners, 0, `radius ${r} traced with corners`);
    assert.ok(agreement(picture, out) > 0.98, `radius ${r} fit`);
  }
});

test('a circle is round to within a pixel, and cheaper than its staircase', () => {
  const size = 512, r = 200;
  const out = traceImage(circle(size, r));
  let worst = 0;
  for (const [x, y] of parsePath(out.d)[0]) {
    worst = Math.max(worst, Math.abs(Math.hypot(x - size / 2, y - size / 2) - r));
  }
  assert.ok(worst < 1, `worst radius error ${worst.toFixed(3)} px`);
  // The same circle with the simplifier turned off, which is the staircase.
  const staircase = traceImage(circle(size, r), { epsilon: 0.01, cornerAngle: 1 });
  assert.ok(out.stats.bytes < staircase.stats.bytes / 2);
});

test('a five-pointed star traces with ten corners, not nine', () => {
  // Nine is not a hypothetical: one vertex was split in two by a one-pixel
  // hesitation, and each half turned 58 degrees, which is under the threshold
  // that would have called either of them a corner.
  const out = traceImage(star(300, 130, 55));
  assert.equal(out.stats.corners, 10);
});

/* ---- the mask -------------------------------------------------------------- */

test('otsu lands between two piles', () => {
  const grey = new Uint8Array(200);
  grey.fill(30, 0, 100);
  grey.fill(220, 100);
  // The cut is the top of the lower pile rather than the middle of the gap:
  // mask.js reads it as "this level and below is ink", so 30 is the answer
  // that puts the 30s on one side and the 220s on the other.
  const level = otsu(grey);
  assert.ok(level >= 30 && level < 220, `otsu chose ${level}`);
});

test('a transparent pixel is never ink, whatever colour it claims', () => {
  const data = new Uint8ClampedArray(4 * 4);
  // Two black pixels: the first opaque, the second not there at all.
  data.set([0, 0, 0, 255], 0);
  data.set([0, 0, 0, 0], 4);
  data.set([255, 255, 255, 255], 8);
  data.set([255, 255, 255, 255], 12);
  const mask = maskFromImage({ data, width: 4, height: 1 }, { threshold: 128 });
  assert.deepEqual([...mask.bits], [1, 0, 0, 0]);
});

/* ---- the wand, and the corrections over it ---------------------------------- */

test('by colour takes the patch; by shape takes everything joined to it', () => {
  // A black bar and a grey bar, touching. Both are ink; they are not the same
  // colour, and that difference is the whole argument between the two wands.
  const w = 20, h = 6;
  const data = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = (y * w + x) * 4;
      const v = x < 10 ? 10 : (x < 16 ? 110 : 255);
      data[p] = data[p + 1] = data[p + 2] = v;
      data[p + 3] = 255;
    }
  }
  const mask = maskFromImage({ data, width: w, height: h }, { threshold: 200 });
  const labelled = labelRegions(mask, {});

  const byColour = selectRegion(mask, labelled, 12, 3, { mode: 'colour', tolerance: 30 });
  assert.equal(byColour.size, 6 * h);          // the grey bar alone
  assert.equal(byColour.wasInk, true);

  const byShape = selectRegion(mask, labelled, 12, 3, { mode: 'shape' });
  assert.equal(byShape.size, 16 * h);          // grey and black together
});

test('a preview budget stops the fill early and says so', () => {
  const w = 200, h = 200;
  const data = new Uint8ClampedArray(w * h * 4).fill(255);
  for (let i = 3; i < data.length; i += 4) data[i] = 255;
  const mask = maskFromImage({ data, width: w, height: h }, { threshold: 128 });
  const capped = selectRegion(mask, null, 100, 100, { tolerance: 40, budget: 500 });
  assert.equal(capped.truncated, true);
  assert.ok(capped.size <= 500 + 8);
  const whole = selectRegion(mask, null, 100, 100, { tolerance: 40 });
  assert.equal(whole.truncated, false);
  assert.equal(whole.size, w * h);
});

test('a correction survives the threshold moving, and undo puts it back', () => {
  const picture = square(64, 30);
  const mask = maskFromImage(picture, {});
  const edits = new MaskEdits(mask.w, mask.h);
  const chosen = selectRegion(mask, labelRegions(mask, {}), 32, 32, { mode: 'shape' });

  edits.set(chosen.pixels, false);
  assert.equal(edits.apply(mask).bits.reduce((a, b) => a + b, 0), 0);

  // A different threshold, the same correction: the square is still gone.
  const looser = maskFromImage(picture, { threshold: 200 });
  assert.equal(edits.apply(looser).bits.reduce((a, b) => a + b, 0), 0);

  assert.equal(edits.undo(), true);
  assert.ok(edits.apply(mask).bits.reduce((a, b) => a + b, 0) > 0);
  assert.equal(edits.undo(), false);
});

test('inverting flips the corrections with it, twice over', () => {
  const edits = new MaskEdits(4, 1);
  const pixels = Uint8Array.from([1, 0, 0, 0]);
  edits.set(pixels, false);
  assert.equal(edits.overrides[0], 2);
  edits.flip();
  assert.equal(edits.overrides[0], 1);
  edits.flip();
  assert.equal(edits.overrides[0], 2);
  // And undo still restores what it was told to, after the flipping.
  assert.equal(edits.undo(), true);
  assert.equal(edits.overrides[0], 0);
});

/* ---- finding a subject a threshold cannot see -------------------------------- */

test('the subject finder sees what a grey threshold cannot', () => {
  // A blob the same brightness as its ground, differing only in hue. Otsu has
  // nothing to cut between; the distance from the background has everything.
  const w = 240, h = 300;
  const data = new Uint8ClampedArray(w * h * 4);
  const inside = (x, y) => ((x - w / 2) / 60) ** 2 + ((y - h / 2) / 90) ** 2 < 1;
  let ink = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = (y * w + x) * 4;
      const noise = ((x * 7919 + y * 104729) % 17) - 8;
      if (inside(x, y)) {
        ink++;
        data[p] = 96 + noise; data[p + 1] = 42 + noise; data[p + 2] = 36 + noise;
      } else {
        const v = 58 + noise;
        data[p] = v; data[p + 1] = v + 3; data[p + 2] = v + 7;
      }
      data[p + 3] = 255;
    }
  }
  const picture = { data, width: w, height: h };

  const found = subjectMask(picture, {});
  let both = 0, either = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const truth = inside(x, y) ? 1 : 0;
      const got = found.bits[y * w + x];
      if (truth && got) both++;
      if (truth || got) either++;
    }
  }
  assert.ok(both / either > 0.95, `overlap was ${(both / either).toFixed(4)}`);

  // And it is one shape, where the threshold's answer is a shower of noise.
  assert.equal(traceMask(found, {}).stats.contours, 1);
  assert.ok(traceImage(picture, {}).stats.contours > 50);
});

test('the largest island is kept and a caption in the corner is not', () => {
  const w = 200, h = 200;
  const data = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = (y * w + x) * 4;
      const middle = Math.hypot(x - 100, y - 110) < 55;
      const caption = x > 8 && x < 60 && y > 8 && y < 20;
      const v = middle || caption ? 30 : 210;
      data[p] = data[p + 1] = data[p + 2] = v;
      data[p + 3] = 255;
    }
  }
  const picture = { data, width: w, height: h };
  assert.equal(subjectMask(picture, {}).islands, 2);
  assert.equal(traceMask(subjectMask(picture, {}), {}).stats.contours, 1);

  // `keep: 'all'` is not "keep everything": it keeps every island at least
  // minShare of the largest, and this caption is six per cent of the circle.
  // Something has to hold that line or a photograph's every speck of grain
  // comes back as a shape.
  assert.equal(traceMask(subjectMask(picture, { keep: 'all' }), {}).stats.contours, 1);
  assert.equal(
    traceMask(subjectMask(picture, { keep: 'all', minShare: 0.02 }), {}).stats.contours, 2);
});
