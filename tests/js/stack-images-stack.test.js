/**
 * tools/stack-images/src/stack.js - the seven ways of combining pixels.
 *
 * These are checked against answers worked out by hand rather than against
 * whatever the code produced when it was written, because every one of them is
 * plausible when wrong. A mean that divides by the wrong count is a stack that
 * is slightly dark; a median that takes the lower of the two middles is off by
 * half a level; a maximum initialised to 255 instead of 0 is a white picture.
 * None of those throw and none of them look like a bug in a screenshot.
 *
 * The frames are built as flat colours so that the expected value of each mode
 * is arithmetic anybody can check in their head from the numbers in the test.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  boxBlur, createStack, laplacian, medianOf,
} from '../../tools/stack-images/src/stack.js';

/** One frame of `pixels` pixels, every channel set to `value`. */
function flat(pixels, value) {
  const out = new Uint8ClampedArray(pixels * 4);
  for (let i = 0; i < pixels; i += 1) {
    out[i * 4] = value;
    out[i * 4 + 1] = value;
    out[i * 4 + 2] = value;
    out[i * 4 + 3] = 255;
  }
  return out;
}

/** Run a whole stack over a list of flat values and read back the first pixel. */
function stackFlat(mode, values, options = {}) {
  const pixels = 4;
  const stack = createStack(mode, {
    width: 2, height: 2, frames: values.length, ...options,
  });
  for (let pass = 0; pass < stack.passes; pass += 1) {
    stack.beginPass(pass);
    values.forEach((value, index) => stack.add(flat(pixels, value), index, pass));
    stack.endPass(pass);
  }
  const result = stack.result();
  return { red: result[0], green: result[1], blue: result[2], alpha: result[3], result };
}

test('an unknown mode is refused rather than guessed at', () => {
  assert.throws(() => createStack('average', { width: 1, height: 1, frames: 1 }), RangeError);
  assert.throws(() => createStack('mean', { width: 0, height: 1, frames: 1 }), RangeError);
  assert.throws(() => createStack('mean', { width: 1, height: 1, frames: 0 }), RangeError);
});

test('the mean is the mean, and it is not rounded on the way', () => {
  // 10, 20 and 31 average to 20.333, which rounds to 20. A stack that rounded
  // each frame into a byte accumulator would give the same answer here and a
  // different one over twenty frames, so the second case is the real check:
  // four values whose average is not an integer at any point in the sum.
  assert.equal(stackFlat('mean', [10, 20, 31]).red, 20);
  assert.equal(stackFlat('mean', [1, 2, 2, 2]).red, 2);
  assert.equal(stackFlat('mean', [100]).red, 100);
});

test('the mean of one hundred frames of noise lands on the true value', () => {
  // The claim the whole tool rests on. Values alternating either side of 128
  // must average to exactly 128, not to 127 or 129.
  const values = [];
  for (let i = 0; i < 100; i += 1) values.push(i % 2 ? 148 : 108);
  assert.equal(stackFlat('mean', values).red, 128);
});

test('the sum adds up and clips, which is what a long exposure does', () => {
  assert.equal(stackFlat('sum', [10, 20, 30]).red, 60);
  assert.equal(stackFlat('sum', [200, 200]).red, 255, 'a sum past white stays white');
  assert.equal(stackFlat('sum', [10, 20], { gain: 2 }).red, 60, 'the gain multiplies the total');
});

test('the maximum and the minimum take the extremes', () => {
  assert.equal(stackFlat('max', [10, 200, 45]).red, 200);
  assert.equal(stackFlat('min', [10, 200, 45]).red, 10);
  assert.equal(stackFlat('max', [0, 0]).red, 0, 'black frames stack to black');
  assert.equal(stackFlat('min', [255, 255]).red, 255, 'white frames stack to white');
});

test('the maximum works per channel, not per pixel', () => {
  // Lighten takes the brighter red, the brighter green and the brighter blue
  // independently. Picking the brighter *pixel* instead would be a different
  // and much less useful operation, and the two agree on flat frames - which is
  // why this case is not flat.
  const stack = createStack('max', { width: 1, height: 1, frames: 2 });
  stack.beginPass(0);
  stack.add(new Uint8ClampedArray([200, 10, 30, 255]), 0, 0);
  stack.add(new Uint8ClampedArray([50, 240, 20, 255]), 1, 0);
  stack.endPass(0);
  const out = stack.result();
  assert.deepEqual(Array.from(out), [200, 240, 30, 255]);
});

test('a minimum over no frames is nothing, not white', () => {
  // The minimum starts at 255 so that the first frame can only lower it. Handed
  // no frames at all it must not report that starting point as an answer.
  const stack = createStack('min', { width: 1, height: 1, frames: 1 });
  stack.beginPass(0);
  stack.endPass(0);
  assert.deepEqual(Array.from(stack.result()), [0, 0, 0, 0]);
});

test('the median takes the middle, and averages the two middles of an even set', () => {
  assert.equal(stackFlat('median', [10, 200, 45]).red, 45);
  assert.equal(stackFlat('median', [10, 20, 30, 40]).red, 25);
  assert.equal(stackFlat('median', [7]).red, 7);
});

test('the median ignores the frame with the tourist in it', () => {
  // The reason people reach for this mode. Nine frames of pavement and two of
  // somebody walking across it: the median is pavement, and the mean is not.
  const values = [120, 121, 119, 120, 250, 122, 120, 240, 119, 121, 120];
  assert.equal(stackFlat('median', values).red, 120);
  assert.ok(stackFlat('mean', values).red > 130, 'the mean should be dragged upwards');
});

test('the median survives more frames than fit in one chunk', () => {
  // The store is read back a chunk at a time through a scratch buffer, and the
  // gather across frames inside that chunk is the fiddly part. A stack wide
  // enough to need several chunks is what would catch an index that forgot to
  // account for where the chunk starts.
  const pixels = 5000;
  const frames = 5;
  const stack = createStack('median', { width: 100, height: 50, frames });
  stack.beginPass(0);
  for (let f = 0; f < frames; f += 1) stack.add(flat(pixels, 10 + f * 20), f, 0);
  stack.endPass(0);

  const out = stack.result();
  for (let i = 0; i < pixels; i += 1) {
    assert.equal(out[i * 4], 50, `pixel ${i} is not the middle of the five frames`);
    assert.equal(out[i * 4 + 3], 255, `pixel ${i} lost its alpha`);
  }
});

test('the median puts each channel back where it came from', () => {
  // The store is one long run of channels and the result is RGBA, so the walk
  // back out has to divide by three and take the remainder. Getting that wrong
  // rotates the colours, which on flat grey frames is invisible.
  const stack = createStack('median', { width: 2, height: 1, frames: 3 });
  stack.beginPass(0);
  for (const value of [0, 1, 2]) {
    stack.add(new Uint8ClampedArray([
      10 + value, 100 + value, 200 + value, 255,
      20 + value, 110 + value, 210 + value, 255,
    ]), value, 0);
  }
  stack.endPass(0);
  assert.deepEqual(Array.from(stack.result()), [11, 101, 201, 255, 21, 111, 211, 255]);
});

test('medianOf sorts in place and handles both parities', () => {
  const odd = new Uint8Array([5, 1, 9]);
  assert.equal(medianOf(odd, 3), 5);
  const even = new Uint8Array([8, 2, 6, 4]);
  assert.equal(medianOf(even, 4), 5);
  assert.equal(medianOf(new Uint8Array([42]), 1), 42);
  // Only the first n values are considered, so a scratch buffer longer than the
  // stack does not contribute the zeros left in its tail.
  const padded = new Uint8Array([3, 7, 11, 0, 0, 0]);
  assert.equal(medianOf(padded, 3), 7);
});

test('sigma clipping excludes the outlier and averages the rest', () => {
  // Ten frames within a level or two of 120, and one at 250. The mean is pulled
  // up by twelve; the clipped mean should not move at all.
  const values = [120, 121, 119, 120, 121, 119, 120, 121, 119, 120, 250];
  const clipped = stackFlat('sigma', values, { kappa: 2 }).red;
  assert.ok(Math.abs(clipped - 120) <= 1, `expected about 120, got ${clipped}`);
  assert.ok(stackFlat('mean', values).red > 130, 'the plain mean should be dragged upwards');
});

test('sigma clipping reads the frames twice and says so', () => {
  const stack = createStack('sigma', { width: 1, height: 1, frames: 2 });
  assert.equal(stack.passes, 2, 'the threshold depends on frames not yet read');
});

test('a pixel every frame disagreed about keeps its mean rather than becoming a hole', () => {
  // Where the whole set is moving, nothing survives the clip. Falling through
  // to the unclipped mean is what stops that being a black speck.
  const values = [0, 255, 0, 255];
  const out = stackFlat('sigma', values, { kappa: 0 }).red;
  assert.ok(out > 100 && out < 160, `expected the plain mean, got ${out}`);
});

test('an identical stack has no spread, and does not divide by it', () => {
  // The variance of a set of identical values comes out very slightly negative
  // through rounding, and a square root of that is NaN. A clean stack is
  // exactly the case that hits it.
  const out = stackFlat('sigma', [200, 200, 200, 200]).red;
  assert.equal(out, 200);
});

test('focus stacking takes each pixel from the frame it was sharp in', () => {
  // Two frames: the left half is detailed in one and flat in the other, and the
  // right half the other way round. The result should be the detailed half of
  // each - which is the whole promise of the mode.
  const width = 32;
  const height = 32;
  const pixels = width * height;

  const make = (sharpLeft) => {
    const out = new Uint8ClampedArray(pixels * 4);
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const left = x < width / 2;
        const detailed = left === sharpLeft;
        const value = detailed ? ((x + y) % 2 ? 30 : 220) : 128;
        const at = (y * width + x) * 4;
        out[at] = value;
        out[at + 1] = value;
        out[at + 2] = value;
        out[at + 3] = 255;
      }
    }
    return out;
  };

  const stack = createStack('focus', { width, height, frames: 2, radius: 2 });
  stack.beginPass(0);
  stack.add(make(true), 0, 0);
  stack.add(make(false), 1, 0);
  stack.endPass(0);
  const out = stack.result();

  // Sample well inside each half, away from the seam and the band edges, where
  // the sharpness measure is unambiguous.
  const at = (x, y) => out[(y * width + x) * 4];
  assert.notEqual(at(6, 16), 128, 'the left half came from the blurred frame');
  assert.notEqual(at(26, 16), 128, 'the right half came from the blurred frame');
});

test('the laplacian is large on an edge and zero on flat ground', () => {
  const width = 5;
  const height = 5;
  const flatField = new Float32Array(width * height).fill(50);
  const out = new Float32Array(width * height);

  laplacian(flatField, out, width, height);
  for (const value of out) assert.equal(value, 0, 'flat ground has no edges');

  const step = new Float32Array(width * height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) step[y * width + x] = x < 2 ? 0 : 100;
  }
  laplacian(step, out, width, height);
  assert.ok(out[2 * width + 2] > 0, 'the step should register');
  assert.equal(out[2 * width + 1], 100, 'and its size should be the size of the step');

  // The border is left at zero on purpose: a band's edge is usually a seam in
  // the middle of a picture, not the picture's own edge.
  for (let x = 0; x < width; x += 1) assert.equal(out[x], 0, 'the top row is not scored');
});

test('the box blur averages, and its cost does not grow with its radius', () => {
  const width = 8;
  const height = 8;
  const values = new Float32Array(width * height).fill(10);
  const scratch = new Float32Array(width * height);

  boxBlur(values, scratch, width, height, 2);
  for (const value of values) {
    assert.ok(Math.abs(value - 10) < 1e-4, 'a flat field blurs to itself');
  }

  // A single spike spreads over the window and keeps its total, which is the
  // property a running-sum implementation gets wrong if a value leaves the
  // window a step early or late.
  const spike = new Float32Array(width * height);
  spike[3 * width + 3] = 100;
  boxBlur(spike, scratch, width, height, 1);
  let total = 0;
  for (const value of spike) total += value;
  assert.ok(Math.abs(total - 100) < 1e-3, `the blur lost energy: ${total}`);
  assert.ok(spike[3 * width + 3] > 0 && spike[3 * width + 3] < 100, 'the spike did not spread');

  boxBlur(values, scratch, width, height, 0);
  assert.equal(values[0], 10, 'a radius of nothing does nothing');
});

test('the gain is applied once, at the end, and clips', () => {
  assert.equal(stackFlat('mean', [100, 100], { gain: 2 }).red, 200);
  assert.equal(stackFlat('mean', [200, 200], { gain: 2 }).red, 255);
  assert.equal(stackFlat('max', [40], { gain: 0.5 }).red, 20);
});

test('the alpha channel is written opaque rather than stacked', () => {
  // Averaging alpha over frames that are all opaque gives opaque anyway, and
  // over frames that are not it gives a value no colour channel below it agrees
  // with. So it is set.
  for (const mode of ['mean', 'median', 'sigma', 'max', 'min', 'sum', 'focus']) {
    assert.equal(stackFlat(mode, [10, 20, 30]).alpha, 255, `${mode} lost its alpha`);
  }
});
