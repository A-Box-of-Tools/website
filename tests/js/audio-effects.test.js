/**
 * tools/edit-audio/src/effects.js - reversing, and the level.
 *
 * Both of these are claimed on the page to be exactly reversible, which is the
 * kind of claim worth pinning down: reverse twice and you have the file you
 * started with, and a boost followed by the same cut in decibels lands back on
 * the samples that went in.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  reverse, peak, applyGain, dbToGain, gainToDb, normalizeGain,
} from '../../tools/edit-audio/src/effects.js';

const of = (...values) => Float32Array.from(values);

test('reversing turns each channel around', () => {
  const left = of(1, 2, 3, 4);
  const right = of(5, 6, 7, 8, 9);
  reverse([left, right]);
  assert.deepEqual([...left], [4, 3, 2, 1]);
  assert.deepEqual([...right], [9, 8, 7, 6, 5]);
});

test('reversing twice gives back exactly what went in', () => {
  for (const length of [0, 1, 2, 3, 64, 65]) {
    const original = Float32Array.from({ length }, (_, i) => Math.sin(i) * 0.7);
    const working = Float32Array.from(original);
    reverse([working]);
    reverse([working]);
    assert.deepEqual([...working], [...original], `length ${length}`);
  }
});

test('the peak is the largest distance from silence, either way', () => {
  // Math.fround throughout: the samples live in a Float32Array, so 0.9 stored
  // and read back is the nearest float to 0.9 rather than 0.9 itself.
  assert.equal(peak([of(0.2, -0.9, 0.5)]), Math.fround(0.9));
  assert.equal(peak([of(0.1), of(-0.4)]), Math.fround(0.4), 'across every channel, not each one');
  assert.equal(peak([of(0, 0, 0)]), 0);
  assert.equal(peak([new Float32Array(0)]), 0);
});

test('gain multiplies in place and reports where it landed', () => {
  const samples = of(0.25, -0.5, 0.125);
  const result = applyGain([samples], 2);
  assert.deepEqual([...samples], [0.5, -1, 0.25]);
  assert.equal(result.peak, 1);
  assert.equal(result.clipped, 0, 'exactly full scale is not past full scale');
});

test('gain counts the samples it pushed past full scale', () => {
  const result = applyGain([of(0.5, -0.9, 0.1), of(0.95)], 2);
  // 0.5 -> 1.0 is at the ceiling, -0.9 -> -1.8 and 0.95 -> 1.9 are past it.
  assert.equal(result.clipped, 2);
  // Float32 rather than the double the multiplication was done in: the peak is
  // read back out of the array it was stored in, which is where it rounded.
  assert.equal(result.peak, Math.fround(1.9));
});

test('gain does not clamp: 32-bit float carries the overshoot out', () => {
  const samples = of(0.8);
  applyGain([samples], 4);
  assert.equal(samples[0], Math.fround(3.2));
});

test('decibels and multipliers agree in both directions', () => {
  assert.ok(Math.abs(dbToGain(0) - 1) < 1e-12);
  assert.ok(Math.abs(dbToGain(6.020599913279624) - 2) < 1e-9, '+6 dB is twice as loud');
  assert.ok(Math.abs(dbToGain(-6.020599913279624) - 0.5) < 1e-9);
  for (const db of [-24, -6, -0.5, 0, 3, 12]) {
    assert.ok(Math.abs(gainToDb(dbToGain(db)) - db) < 1e-9, `${db} dB`);
  }
  assert.equal(gainToDb(0), -Infinity, 'silence has no level');
});

test('a boost and the same cut land back on the samples that went in', () => {
  const original = Float32Array.from({ length: 32 }, (_, i) => Math.sin(i / 3) * 0.4);
  const working = Float32Array.from(original);
  applyGain([working], dbToGain(9));
  applyGain([working], dbToGain(-9));
  for (let i = 0; i < original.length; i += 1) {
    assert.ok(Math.abs(working[i] - original[i]) < 1e-6, `sample ${i}`);
  }
});

test('normalising puts the loudest moment exactly where it was asked to', () => {
  const samples = of(0.1, -0.25, 0.2);
  const gain = normalizeGain(peak([samples]), -1);
  const result = applyGain([samples], gain);
  assert.ok(Math.abs(gainToDb(result.peak) - -1) < 1e-6);
  assert.equal(result.clipped, 0, 'the setting that cannot clip does not clip');
});

test('normalising a loud recording turns it down rather than refusing', () => {
  const gain = normalizeGain(2, -1);
  assert.ok(gain < 1);
  assert.ok(Math.abs(2 * gain - dbToGain(-1)) < 1e-9);
});

test('normalising silence leaves it alone rather than dividing by zero', () => {
  assert.equal(normalizeGain(0, -1), 1);
});
