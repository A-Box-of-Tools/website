/**
 * tools/video-to-gif/src/plan.js - the instants, the sizes and the delays.
 *
 * This is the arithmetic that decides whether the animation comes out the
 * length of the section it was cut from, and it is worth testing precisely
 * because getting it wrong throws nothing: the GIF plays, it just runs slow, and
 * the error is a percent or two per frame that only shows up as a whole second
 * of drift at the end of a long one.
 *
 * The delays are stored in hundredths of a second, so most frame rates do not
 * divide evenly into them. 15 fps is 6.67 hundredths; rounding each frame on its
 * own gives 7, and 7 x 15 is 105 hundredths per second rather than 100.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  frameTimes, frameDelays, outputSize, workingBytes, estimateBytes, MIN_DELAY, MAX_FPS,
} from '../../tools/video-to-gif/src/plan.js';

const sum = (values) => values.reduce((total, value) => total + value, 0);

test('a section gives fps frames for every second of it', () => {
  assert.equal(frameTimes({ start: 0, end: 2, fps: 10 }).length, 20);
  assert.equal(frameTimes({ start: 4, end: 5, fps: 12 }).length, 12);
  assert.equal(frameTimes({ start: 0, end: 10, fps: 25 }).length, 250);
});

test('the instants start at the mark and are one frame apart', () => {
  const times = frameTimes({ start: 1.5, end: 2, fps: 10 });
  assert.equal(times[0], 1.5);
  for (let i = 1; i < times.length; i += 1) {
    assert.ok(Math.abs((times[i] - times[i - 1]) - 0.1) < 1e-9);
  }
});

test('no frame is sampled from past the end', () => {
  const times = frameTimes({ start: 0, end: 0.95, fps: 10 });
  assert.equal(times.length, 9, 'nine whole frames fit, not ten');
  assert.ok(times[times.length - 1] < 0.95);
});

test('a section too short for one frame still gives one', () => {
  assert.equal(frameTimes({ start: 3, end: 3.01, fps: 10 }).length, 1);
  assert.equal(frameTimes({ start: 3, end: 3, fps: 10 }).length, 1);
});

test('a length that arrives a hair under two seconds is still two seconds', () => {
  // What a pair of slider positions actually produces, and the reason for the
  // epsilon: 1.9999999999999998 must not lose a frame.
  const times = frameTimes({ start: 0.30000000000000004, end: 2.3, fps: 10 });
  assert.equal(times.length, 20);
});

test('the delays add up to the length of the section', () => {
  for (const fps of [5, 10, 12, 15, 20, 25]) {
    const times = frameTimes({ start: 0, end: 4, fps });
    const delays = frameDelays(times, 4);
    assert.equal(delays.length, times.length);
    assert.equal(sum(delays), 400, `${fps} fps should still add up to four seconds`);
  }
});

test('an awkward frame rate alternates rather than drifting', () => {
  // 15 fps is 6.67 hundredths. Every frame at 7 would be five per cent slow.
  const delays = frameDelays(frameTimes({ start: 0, end: 1, fps: 15 }), 1);
  assert.equal(sum(delays), 100);
  assert.deepEqual([...new Set(delays)].sort(), [6, 7]);
});

test('the last frame is held to the end of the section', () => {
  // Nine frames of a 0.95-second section: the ninth covers the leftover 0.05.
  const times = frameTimes({ start: 0, end: 0.95, fps: 10 });
  const delays = frameDelays(times, 0.95);
  assert.equal(sum(delays), 95);
  assert.equal(delays[delays.length - 1], 15);
});

test('no delay is below the floor every browser enforces', () => {
  const times = frameTimes({ start: 0, end: 1, fps: MAX_FPS });
  const delays = frameDelays(times, 1);
  assert.ok(delays.every((delay) => delay >= MIN_DELAY));
  assert.equal(Math.min(...delays), MIN_DELAY, 'the fastest rate is exactly the floor');
});

test('a rate above what the format can express is brought down to it', () => {
  assert.equal(frameTimes({ start: 0, end: 1, fps: 500 }).length, MAX_FPS);
});

test('the output keeps the shape it was given', () => {
  assert.deepEqual(outputSize(1920, 1080, 480), { width: 480, height: 270 });
  assert.deepEqual(outputSize(1080, 1920, 320), { width: 320, height: 569 });
  assert.deepEqual(outputSize(640, 640, 200), { width: 200, height: 200 });
});

test('an odd size is left odd, because GIF stores whole pixels', () => {
  assert.deepEqual(outputSize(1000, 667, 333), { width: 333, height: 222 });
  assert.deepEqual(outputSize(101, 33, 101), { width: 101, height: 33 });
});

test('a source with no size still gives something square to work with', () => {
  assert.deepEqual(outputSize(0, 0, 240), { width: 240, height: 240 });
});

test('the memory figure is four bytes a pixel of every frame at once', () => {
  assert.equal(workingBytes({ frames: 100, width: 480, height: 270 }), 100 * 480 * 270 * 4);
});

test('the size estimate is a range, and the low end is below the high one', () => {
  const { low, high } = estimateBytes({ frames: 60, width: 480, height: 270 });
  assert.ok(low > 0);
  assert.ok(high > low * 2);
});
