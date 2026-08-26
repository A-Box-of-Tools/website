/**
 * tools/stack-images/src/align.js - finding how far a frame moved.
 *
 * THE SIGN IS THE POINT OF THIS FILE
 *
 * Phase correlation reports an offset, and there are two opposite things that
 * offset can mean: how far the frame moved, or how far it has to be moved back.
 * Both read perfectly well in a comment, the arithmetic to get from one to the
 * other is a minus sign, and getting it backwards does not throw, does not warn
 * and does not look wrong in code review - it produces a stack that is blurred
 * by exactly twice the camera shake instead of by none of it, which looks like
 * the alignment simply not working very well.
 *
 * So the convention is pinned here, against a shift this file created and
 * therefore knows: `estimate` returns what has to be applied to the frame to
 * land it on the reference. The first test is exact, over a circular shift with
 * no windowing, so it can be asserted to within a rounding error rather than
 * within a tolerance that would hide a sign error of half a pixel.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ALIGN_MODES, MAX_ROTATION, NO_MOVE,
  estimate, logPolar, logSpectrum, phaseCorrelate, rotateScale, window2d,
} from '../../tools/stack-images/src/align.js';

const close = (actual, expected, tolerance, what) => assert.ok(
  Math.abs(actual - expected) <= tolerance,
  `${what}: ${actual} is not within ${tolerance} of ${expected}`,
);

/** A picture with enough structure at enough orientations to correlate. */
function field(size, fn) {
  const centre = (size - 1) / 2;
  const out = new Float64Array(size * size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      out[y * size + x] = fn(x - centre, y - centre);
    }
  }
  return out;
}

/**
 * A photograph is broadband: it has detail at every size and in every
 * direction. A fixture made of a few sinusoids is not, and it is the wrong test
 * subject here - phase correlation divides by the magnitude of each frequency,
 * so a picture that put nothing into most of them is all rounding error by the
 * time it reaches the peak search. So the scene below is value noise over three
 * octaves: smooth, defined at any real coordinate so it can be rotated and
 * scaled exactly rather than resampled, and full of structure at every scale.
 */
function hash(i, j) {
  let h = Math.imul(i | 0, 374761393) + Math.imul(j | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function octave(u, v, cell) {
  const x = u / cell;
  const y = v / cell;
  const i = Math.floor(x);
  const j = Math.floor(y);
  const fx = x - i;
  const fy = y - j;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const top = hash(i, j) * (1 - sx) + hash(i + 1, j) * sx;
  const bottom = hash(i, j + 1) * (1 - sx) + hash(i + 1, j + 1) * sx;
  return top * (1 - sy) + bottom * sy;
}

const scene = (u, v) => (
  90 * octave(u, v, 13)
  + 60 * octave(u + 100, v - 60, 5)
  + 35 * octave(u - 40, v + 25, 2.2)
);

/** Move a square by whole pixels, wrapping - an exact shift, with no resampling. */
function circularShift(values, size, dx, dy) {
  const out = new Float64Array(size * size);
  for (let y = 0; y < size; y += 1) {
    const from = ((y - dy) % size + size) % size;
    for (let x = 0; x < size; x += 1) {
      out[y * size + x] = values[from * size + (((x - dx) % size + size) % size)];
    }
  }
  return out;
}

test('the shift reported is the one that puts the frame back', () => {
  const size = 64;
  const reference = field(size, scene);
  // The frame is the reference moved seven to the right and five up. Putting it
  // back therefore means seven left and five down.
  const frame = circularShift(reference, size, 7, -5);

  const found = phaseCorrelate(reference, frame, size);

  close(found.dx, -7, 1e-6, 'horizontal correction');
  close(found.dy, 5, 1e-6, 'vertical correction');
  assert.ok(found.confidence > 10, `an exact shift should correlate strongly, got ${found.confidence}`);
});

test('two identical frames need no correction at all', () => {
  const size = 64;
  const reference = field(size, scene);
  const found = phaseCorrelate(reference, Float64Array.from(reference), size);

  close(found.dx, 0, 1e-6, 'horizontal');
  close(found.dy, 0, 1e-6, 'vertical');
});

test('a shift is found to better than a whole pixel', () => {
  // The interpolation is what stops every frame snapping to an integer offset,
  // which would leave a drifting burst stacking slightly soft - the exact
  // softness the alignment exists to prevent. A half-pixel shift is built by
  // sampling the scene half a pixel over, so the answer is known exactly.
  const size = 64;
  const centre = (size - 1) / 2;
  const reference = field(size, scene);
  const frame = new Float64Array(size * size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      frame[y * size + x] = scene(x - centre - 2.5, y - centre);
    }
  }

  const found = phaseCorrelate(window2d(reference, size), window2d(frame, size), size);

  // The frame samples the scene two and a half pixels over, so it is the
  // reference moved right by that much and the correction is to move it back.
  close(found.dx, -2.5, 0.35, 'a half-pixel shift');
  assert.notEqual(found.dx, Math.round(found.dx), 'the answer snapped to an integer');
});

test('a windowed shift survives the taper', () => {
  const size = 128;
  const reference = window2d(field(size, scene), size);
  const frame = window2d(circularShift(field(size, scene), size, -11, 6), size);

  const found = phaseCorrelate(reference, frame, size);

  close(found.dx, 11, 0.5, 'horizontal correction');
  close(found.dy, -6, 0.5, 'vertical correction');
});

test('the window removes the mean and fades the edges to nothing', () => {
  const size = 16;
  const flat = new Float64Array(size * size).fill(200);
  window2d(flat, size);
  for (const value of flat) close(value, 0, 1e-9, 'a flat field is nothing but its mean');

  const values = window2d(field(size, scene), size);
  for (let x = 0; x < size; x += 1) {
    close(values[x], 0, 1e-9, `top edge at ${x}`);
    close(values[(size - 1) * size + x], 0, 1e-9, `bottom edge at ${x}`);
    close(values[x * size], 0, 1e-9, `left edge at ${x}`);
  }
});

test('the log-polar map turns a rotation into a shift down its rows', () => {
  // The claim the "rotation too" setting rests on, checked on its own rather
  // than through the whole estimator: rotate the picture, and its log-polar
  // spectrum comes out the same picture moved down.
  const size = 128;
  const degrees = 12;
  const radians = (degrees * Math.PI) / 180;
  const reference = field(size, scene);
  const turned = field(size, (u, v) => scene(
    u * Math.cos(radians) + v * Math.sin(radians),
    -u * Math.sin(radians) + v * Math.cos(radians),
  ));

  const a = logPolar(logSpectrum(reference, size), size);
  const b = logPolar(logSpectrum(turned, size), size);
  const found = phaseCorrelate(window2d(a.values, size), window2d(b.values, size), size);

  // Rows span half a turn over the whole square, so a degree is size/180 rows -
  // and what comes off them is the turn that puts the frame back, so a picture
  // rotated twelve degrees reads as minus twelve.
  close((found.dy * 180) / size, -degrees, 2, 'the angle read off the rows');
});

test('a rotated frame is measured and undone', () => {
  const size = 128;
  const degrees = 9;
  const radians = (degrees * Math.PI) / 180;
  const reference = field(size, scene);
  const turned = field(size, (u, v) => scene(
    u * Math.cos(radians) + v * Math.sin(radians),
    -u * Math.sin(radians) + v * Math.cos(radians),
  ));

  const found = estimate(window2d(reference, size), window2d(turned, size), size, 'similarity');

  assert.equal(found.clamped, false, 'a nine degree turn is a plausible one');
  close(found.angle, -degrees, 2.5, 'the angle, as the correction it is');
  close(found.scale, 1, 0.06, 'a rotation is not a scale');

  // And the angle it reports is the one that undoes the turn, applied exactly
  // as the pipeline applies it. This is the half that matters: an angle of the
  // right size and the wrong sign is worse than no alignment at all.
  const back = rotateScale(turned, size, found.angle, found.scale);
  const straight = phaseCorrelate(window2d(reference, size), window2d(back, size), size);
  close(straight.dx, 0, 1.5, 'what is left over horizontally');
  close(straight.dy, 0, 1.5, 'what is left over vertically');
});

test('a scaled frame is measured', () => {
  const size = 128;
  const factor = 1.12;
  const reference = field(size, scene);
  const bigger = field(size, (u, v) => scene(u / factor, v / factor));

  const found = estimate(window2d(reference, size), window2d(bigger, size), size, 'similarity');

  assert.equal(found.clamped, false, 'a twelve per cent change is a plausible one');
  // A frame twelve per cent larger is corrected by being shrunk back.
  close(found.scale, 1 / factor, 0.04, 'the scale, as the correction it is');
  close(found.angle, 0, 2.5, 'a scale is not a rotation');
});

test('an implausible transform is refused rather than applied', () => {
  // Two unrelated pictures will still produce a peak somewhere. What must not
  // happen is that peak being turned into a ninety degree rotation and applied.
  const size = 64;
  const reference = field(size, scene);
  const noise = new Float64Array(size * size);
  let seed = 7;
  for (let i = 0; i < noise.length; i += 1) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    noise[i] = seed % 256;
  }

  const found = estimate(window2d(reference, size), window2d(noise, size), size, 'similarity');

  assert.ok(
    found.clamped || (Math.abs(found.angle) <= MAX_ROTATION),
    'an unrelated frame produced a rotation that was applied anyway',
  );
});

test('doing nothing is one of the three answers', () => {
  const size = 32;
  const reference = field(size, scene);
  const frame = circularShift(reference, size, 9, 9);

  assert.deepEqual(estimate(reference, frame, size, 'none'), { ...NO_MOVE, clamped: false });
  assert.deepEqual(ALIGN_MODES, ['none', 'translate', 'similarity']);

  // Translation-only leaves the angle and the scale alone rather than guessing
  // at them, which is what makes it the safe setting for a locked-off camera.
  const moved = estimate(reference, frame, size, 'translate');
  assert.equal(moved.angle, 0);
  assert.equal(moved.scale, 1);
  close(moved.dx, -9, 1e-6, 'horizontal correction');
});
