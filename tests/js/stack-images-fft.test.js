/**
 * tools/stack-images/src/fft.js - the transform the alignment is built on.
 *
 * Nothing here is about stacking. It is about being able to trust the next test
 * file along: if the transform is wrong, phase correlation still produces a
 * confident-looking answer, just not the right one, and debugging that from the
 * far end is miserable. So this pins the transform against cases whose answers
 * are known from the definition rather than from running the code.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { fft, fft2, isPowerOfTwo } from '../../tools/stack-images/src/fft.js';

const close = (actual, expected, tolerance, what) => assert.ok(
  Math.abs(actual - expected) <= tolerance,
  `${what}: ${actual} is not within ${tolerance} of ${expected}`,
);

test('sizes must be a power of two', () => {
  assert.equal(isPowerOfTwo(1), false, 'a single sample is not a transform');
  assert.equal(isPowerOfTwo(2), true);
  assert.equal(isPowerOfTwo(512), true);
  assert.equal(isPowerOfTwo(6), false);
  assert.equal(isPowerOfTwo(2.5), false);

  assert.throws(() => fft(new Float64Array(6), new Float64Array(6), 6), RangeError);
  assert.throws(() => fft2(new Float64Array(36), new Float64Array(36), 6), RangeError);
});

test('the transform of a constant is all of it at zero frequency', () => {
  const n = 8;
  const re = new Float64Array(n).fill(3);
  const im = new Float64Array(n);

  fft(re, im, n);

  close(re[0], 3 * n, 1e-9, 'the direct term');
  for (let k = 1; k < n; k += 1) {
    close(re[k], 0, 1e-9, `real part of bin ${k}`);
    close(im[k], 0, 1e-9, `imaginary part of bin ${k}`);
  }
});

test('the transform of a spike is flat, and its phase is the spike position', () => {
  // A delta at sample d transforms to exp(-2*pi*i*k*d/n): every bin has
  // magnitude one, and the phase turns d times around as k runs over the range.
  const n = 16;
  const d = 3;
  const re = new Float64Array(n);
  const im = new Float64Array(n);
  re[d] = 1;

  fft(re, im, n);

  for (let k = 0; k < n; k += 1) {
    close(Math.hypot(re[k], im[k]), 1, 1e-9, `magnitude of bin ${k}`);
    close(re[k], Math.cos((-2 * Math.PI * k * d) / n), 1e-9, `real part of bin ${k}`);
    close(im[k], Math.sin((-2 * Math.PI * k * d) / n), 1e-9, `imaginary part of bin ${k}`);
  }
});

test('a cosine lands in exactly the two bins it should', () => {
  const n = 32;
  const cycles = 5;
  const re = new Float64Array(n);
  const im = new Float64Array(n);
  for (let i = 0; i < n; i += 1) re[i] = Math.cos((2 * Math.PI * cycles * i) / n);

  fft(re, im, n);

  for (let k = 0; k < n; k += 1) {
    const expected = (k === cycles || k === n - cycles) ? n / 2 : 0;
    close(Math.hypot(re[k], im[k]), expected, 1e-9, `bin ${k}`);
  }
});

test('the inverse undoes the forward, in one dimension and in two', () => {
  for (const n of [8, 64]) {
    const original = Float64Array.from({ length: n }, (_, i) => Math.sin(i) * 100 + i);
    const re = Float64Array.from(original);
    const im = new Float64Array(n);

    fft(re, im, n);
    fft(re, im, n, true);

    for (let i = 0; i < n; i += 1) {
      close(re[i], original[i], 1e-9, `1D round trip at ${i}`);
      close(im[i], 0, 1e-9, `1D round trip left an imaginary part at ${i}`);
    }
  }

  const size = 16;
  const original = Float64Array.from(
    { length: size * size },
    (_, i) => Math.cos(i * 0.37) * 40 + (i % 7),
  );
  const re = Float64Array.from(original);
  const im = new Float64Array(size * size);

  fft2(re, im, size);
  fft2(re, im, size, true);

  for (let i = 0; i < original.length; i += 1) {
    close(re[i], original[i], 1e-9, `2D round trip at ${i}`);
  }
});

test('a column is transformed in place, without being copied out', () => {
  // The stride argument is what lets fft2 do its second half without gathering
  // each column into a scratch buffer. A column read through it has to give the
  // same answer as the same values laid out as a row.
  const size = 8;
  const square = new Float64Array(size * size);
  const squareIm = new Float64Array(size * size);
  const row = new Float64Array(size);
  const rowIm = new Float64Array(size);

  for (let y = 0; y < size; y += 1) {
    const value = Math.sin(y * 1.1) * 10;
    square[y * size + 3] = value;
    row[y] = value;
  }

  fft(square, squareIm, size, false, 3, size);
  fft(row, rowIm, size);

  for (let y = 0; y < size; y += 1) {
    close(square[y * size + 3], row[y], 1e-9, `column real part at ${y}`);
    close(squareIm[y * size + 3], rowIm[y], 1e-9, `column imaginary part at ${y}`);
  }
});

test('the two-dimensional transform separates, as it is assumed to', () => {
  // fft2 does rows then columns and calls that the 2D transform. That is exact
  // rather than approximate, and this is the case that would catch it if the
  // row and column passes were ever swapped or one of them skipped: a product
  // of two one-dimensional cosines has one non-zero bin per quadrant.
  const size = 16;
  const re = new Float64Array(size * size);
  const im = new Float64Array(size * size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      re[y * size + x] = Math.cos((2 * Math.PI * 3 * x) / size)
        * Math.cos((2 * Math.PI * 5 * y) / size);
    }
  }

  fft2(re, im, size);

  const corners = new Set([
    5 * size + 3, 5 * size + (size - 3),
    (size - 5) * size + 3, (size - 5) * size + (size - 3),
  ]);
  for (let i = 0; i < size * size; i += 1) {
    const expected = corners.has(i) ? (size * size) / 4 : 0;
    close(Math.hypot(re[i], im[i]), expected, 1e-8, `bin ${i}`);
  }
});
