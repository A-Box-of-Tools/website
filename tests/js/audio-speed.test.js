/**
 * tools/edit-audio/src/speed.js and src/stretch.js - the two ways of changing
 * how fast a recording plays.
 *
 * These are the files where a mistake does not throw. It comes out as a track
 * that is the wrong length, or the right length at the wrong pitch, or the
 * right pitch with a metallic ring behind it - so the tests here measure the
 * output rather than inspecting it: how long it is, and what frequency is
 * actually in it.
 *
 * The measurement is a Goertzel filter, which is the cheap way to ask "how much
 * of this tone is in that signal" without a whole FFT.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { resample, resampledLength } from '../../tools/edit-audio/src/speed.js';
import { stretch, stretchedLength } from '../../tools/edit-audio/src/stretch.js';

const RATE = 44100;

/** A sine at `freq`, `seconds` long, at full scale by default. */
function tone(freq, seconds, { rate = RATE, amplitude = 1, phase = 0 } = {}) {
  const length = Math.round(rate * seconds);
  return Float32Array.from(
    { length }, (_, i) => amplitude * Math.sin(phase + (2 * Math.PI * freq * i) / rate));
}

/** How much of `freq` is in `samples`, as an amplitude. */
function strengthAt(samples, freq, rate = RATE) {
  const w = (2 * Math.PI * freq) / rate;
  const coefficient = 2 * Math.cos(w);
  let previous = 0;
  let older = 0;
  for (let i = 0; i < samples.length; i += 1) {
    const value = samples[i] + coefficient * previous - older;
    older = previous;
    previous = value;
  }
  const power = previous * previous + older * older - coefficient * previous * older;
  return (2 * Math.sqrt(Math.max(0, power))) / samples.length;
}

/** The loudest sample, which is what "did the level survive" comes down to. */
const peak = (samples) => samples.reduce((high, v) => Math.max(high, Math.abs(v)), 0);

/* ------------------------------------------------------- the pitch moves */

test('resampling: the result is the length the arithmetic says', async () => {
  for (const speed of [0.25, 0.5, 1.5, 2, 4]) {
    const input = tone(440, 0.5);
    const [output] = await resample([input], speed);
    assert.equal(output.length, resampledLength(input.length, speed));
    assert.equal(output.length, Math.round(input.length / speed), `speed ${speed}`);
  }
});

test('resampling at twice the speed puts the tone an octave up', async () => {
  const [output] = await resample([tone(1000, 0.5)], 2);
  assert.ok(strengthAt(output, 2000) > 0.9, 'the octave is there');
  assert.ok(strengthAt(output, 1000) < 0.05, 'and the original tone is not');
});

test('resampling at half speed puts it an octave down', async () => {
  const [output] = await resample([tone(2000, 0.5)], 0.5);
  assert.ok(strengthAt(output, 1000) > 0.9);
  assert.ok(strengthAt(output, 2000) < 0.05);
});

test('resampling holds the level where it was', async () => {
  for (const speed of [0.5, 1.25, 2]) {
    const [output] = await resample([tone(500, 0.4, { amplitude: 0.5 })], speed);
    // Measured away from the two ends, where half the kernel hangs off the
    // edge of the file and the normalisation is doing the work.
    const middle = output.subarray(2000, output.length - 2000);
    assert.ok(Math.abs(peak(middle) - 0.5) < 0.01, `speed ${speed}: peak ${peak(middle)}`);
  }
});

test('speeding up does not fold high notes back down as a ring', async () => {
  // 15 kHz played at four times the speed would be 60 kHz, which does not fit
  // in a 44.1 kHz file. Reading every fourth sample would fold it back to
  // 15.9 kHz and leave it there, audibly. Filtering first throws it away.
  const [output] = await resample([tone(15000, 0.3)], 4);
  // Away from the two ends, where half the kernel hangs off the edge of the
  // file: those few samples are a weighted average of what is actually there
  // rather than of a whole window, so they are not where a filter is measured.
  const middle = output.subarray(200, output.length - 200);
  assert.ok(peak(middle) < 0.001, `aliased energy: ${peak(middle)}`);
  assert.ok(peak(output) <= 1, 'and nothing at the edges runs away');
});

test('resampling leaves a steady level steady', async () => {
  const flat = new Float32Array(4410).fill(0.5);
  const [output] = await resample([flat], 2);
  for (let i = 100; i < output.length - 100; i += 1) {
    assert.ok(Math.abs(output[i] - 0.5) < 0.002, `sample ${i} is ${output[i]}`);
  }
});

test('resampling keeps the channels in step and does not touch the input', async () => {
  const left = tone(400, 0.2);
  const right = tone(400, 0.2, { phase: Math.PI });
  const before = Float32Array.from(left);
  const [outLeft, outRight] = await resample([left, right], 1.5);

  assert.deepEqual([...left], [...before], 'the samples handed in are not written to');
  assert.equal(outLeft.length, outRight.length);
  for (let i = 100; i < outLeft.length - 100; i += 10) {
    assert.ok(Math.abs(outLeft[i] + outRight[i]) < 0.01, `channels drifted apart at ${i}`);
  }
});

test('resampling reports progress and answers a cancel', async () => {
  const seen = [];
  await resample([tone(440, 0.5)], 2, { onProgress: (done) => seen.push(done) });
  assert.ok(seen.length >= 1);
  assert.equal(seen.at(-1), 1, 'the last report is the finished one');

  const controller = new AbortController();
  controller.abort();
  await assert.rejects(
    () => resample([tone(440, 2)], 0.5, { signal: controller.signal }),
    (error) => error.name === 'AbortError');
});

test('a speed of zero or less is refused rather than looping forever', async () => {
  await assert.rejects(() => resample([tone(440, 0.1)], 0), /greater than zero/);
  await assert.rejects(() => stretch([tone(440, 0.1)], -1, RATE), /greater than zero/);
});

/* -------------------------------------------------------- the pitch stays */

test('stretching: the result is the length the arithmetic says', async () => {
  for (const speed of [0.5, 0.75, 1.5, 2]) {
    const input = tone(440, 1);
    const [output] = await stretch([input], speed, RATE);
    assert.equal(output.length, stretchedLength(input.length, speed));
  }
});

test('stretching leaves the pitch exactly where it was', async () => {
  for (const speed of [0.5, 1.5, 2]) {
    const [output] = await stretch([tone(1000, 1)], speed, RATE);
    const middle = output.subarray(4410, output.length - 4410);
    assert.ok(strengthAt(middle, 1000) > 0.8,
      `speed ${speed}: 1 kHz came back at ${strengthAt(middle, 1000).toFixed(3)}`);
    assert.ok(strengthAt(middle, 1000 * speed) < 0.1,
      `speed ${speed}: the pitch moved with the speed, which is the other mode`);
  }
});

test('stretching holds the level, rather than cancelling where windows cross', async () => {
  // The classic failure: two windows laid down out of step partly cancel each
  // other, and the result is quieter and hollow. A tone that comes back at its
  // own amplitude is the evidence that the search found the right offsets.
  for (const speed of [0.5, 1.25, 2]) {
    const [output] = await stretch([tone(440, 1, { amplitude: 0.8 })], speed, RATE);
    const middle = output.subarray(4410, output.length - 4410);
    assert.ok(Math.abs(peak(middle) - 0.8) < 0.06,
      `speed ${speed}: peak came back at ${peak(middle).toFixed(3)}`);
  }
});

test('stretching keeps the start and the end at full level', async () => {
  // The windows are added up and then divided by how much window was actually
  // laid down, which is what stops the first and last fiftieth of a second
  // fading in and out.
  const [output] = await stretch([tone(440, 0.5, { amplitude: 0.8 })], 1.5, RATE);
  assert.ok(peak(output.subarray(0, 441)) > 0.5, 'the opening is not faded in');
  assert.ok(peak(output.subarray(output.length - 441)) > 0.5, 'nor the ending out');
});

test('stretching silence gives silence back', async () => {
  const [output] = await stretch([new Float32Array(RATE)], 2, RATE);
  assert.equal(peak(output), 0);
});

test('stretching moves both channels the same way', async () => {
  const left = tone(500, 0.5);
  const right = tone(500, 0.5, { phase: Math.PI });
  const before = Float32Array.from(left);
  const [outLeft, outRight] = await stretch([left, right], 1.5, RATE);

  assert.deepEqual([...left], [...before], 'the samples handed in are not written to');
  assert.equal(outLeft.length, outRight.length);
  // Windows chosen per channel would tear the stereo image in half; chosen
  // once on the mixdown, the two channels stay each other's mirror image.
  for (let i = 2205; i < outLeft.length - 2205; i += 7) {
    assert.ok(Math.abs(outLeft[i] + outRight[i]) < 0.05, `channels drifted apart at ${i}`);
  }
});

test('a file too short to hold two windows is still handled', async () => {
  const [output] = await stretch([tone(440, 0.002)], 2, RATE);
  assert.equal(output.length, stretchedLength(Math.round(RATE * 0.002), 2));
});

test('stretching reports progress and answers a cancel', async () => {
  const seen = [];
  await stretch([tone(440, 1)], 0.5, RATE, { onProgress: (done) => seen.push(done) });
  assert.equal(seen.at(-1), 1);

  const controller = new AbortController();
  controller.abort();
  await assert.rejects(
    () => stretch([tone(440, 4)], 0.5, RATE, { signal: controller.signal }),
    (error) => error.name === 'AbortError');
});
