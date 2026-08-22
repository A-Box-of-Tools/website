/**
 * tools/grab-frame/src/frames.js and still.js.
 *
 * The frame list is the tool. Everything the page shows - which picture is on
 * screen, "frame 812 of 3,540", where the arrow keys go, which frames a series
 * takes - is an index into the list these functions build, and an error in it
 * does not throw: it hands somebody a perfectly good picture of the wrong
 * moment.
 *
 * The case worth the most attention is a file whose frames are stored in an
 * order other than the one they are watched in, which is what B-frames are.
 * Sorting by presentation time is what makes "the next frame" mean the next
 * picture rather than the next entry in the file, and the fixture below is
 * built with the two orders deliberately different so that a version that
 * confused them could not pass.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  displayOrder, frameNear, keyframeBefore, lookaheadFor, micros, seriesFrames,
} from '../../tools/grab-frame/src/frames.js';
import {
  clockTime, stillName, timecode,
} from '../../tools/grab-frame/src/still.js';

/**
 * Seven frames at 30 fps on a 600-tick clock, stored the way a file with
 * B-frames stores them: each P frame is written before the two B frames that
 * are watched in front of it.
 *
 *   decode: I0  P3  B1  B2  P6  B4  B5
 *   pts:     0  60  20  40 120  80 100
 */
function track() {
  const samples = [
    { offset: 0, size: 100, dts: 0, pts: 0, isKey: true },
    { offset: 100, size: 40, dts: 20, pts: 60, isKey: false },
    { offset: 140, size: 10, dts: 40, pts: 20, isKey: false },
    { offset: 150, size: 10, dts: 60, pts: 40, isKey: false },
    { offset: 160, size: 40, dts: 80, pts: 120, isKey: false },
    { offset: 200, size: 10, dts: 100, pts: 80, isKey: false },
    { offset: 210, size: 10, dts: 120, pts: 100, isKey: false },
  ];
  return { timescale: 600, samples, codedWidth: 1920, codedHeight: 1080 };
}

/* --------------------------------------------------------- the frame list */

test('displayOrder sorts the frames into the order they are watched in', () => {
  const order = displayOrder(track());

  assert.deepEqual(order.map((frame) => frame.pts), [0, 20, 40, 60, 80, 100, 120]);
  // The way back to the file: watching them in order means reading them in this
  // order, which is not the order they are stored in.
  assert.deepEqual(order.map((frame) => frame.decode), [0, 2, 3, 1, 5, 6, 4]);
  assert.deepEqual(order.map((frame) => frame.time), [0, 1 / 30, 2 / 30, 3 / 30, 4 / 30, 5 / 30, 6 / 30]);
  assert.deepEqual(order.map((frame) => frame.isKey), [true, false, false, false, false, false, false]);
});

test('displayOrder breaks a tie by decode order rather than arbitrarily', () => {
  const one = track();
  one.samples[2].pts = 0;   // two frames claiming the same instant

  const order = displayOrder(one);
  assert.deepEqual(order.slice(0, 2).map((frame) => frame.decode), [0, 2]);
});

test('displayOrder leaves the source list alone', () => {
  const one = track();
  const before = one.samples.map((sample) => sample.pts);
  displayOrder(one);
  assert.deepEqual(one.samples.map((sample) => sample.pts), before);
});

/* ------------------------------------------------ which frame is on screen */

test('frameNear finds the frame being watched at a moment', () => {
  const order = displayOrder(track());

  assert.equal(frameNear(order, 0), 0);
  assert.equal(frameNear(order, 1 / 30), 1);
  assert.equal(frameNear(order, 6 / 30), 6);
});

test('frameNear takes the frame in front of a time between two of them', () => {
  const order = displayOrder(track());

  // A player showing the picture at 0.05s is showing frame 1, which started at
  // 0.0333s - not frame 2, which has not been reached.
  assert.equal(frameNear(order, 0.05), 1);
  assert.equal(frameNear(order, 0.0999), 2);
});

test('frameNear clamps rather than running off either end', () => {
  const order = displayOrder(track());

  assert.equal(frameNear(order, -5), 0);
  assert.equal(frameNear(order, 900), 6);
  assert.equal(frameNear([], 1), -1);
});

/* ------------------------------------------------------- decoding from where */

test('keyframeBefore walks back to the last frame that can start a decode', () => {
  const { samples } = track();

  assert.equal(keyframeBefore(samples, 0), 0);
  assert.equal(keyframeBefore(samples, 6), 0);
});

test('keyframeBefore finds the nearer keyframe when there is one', () => {
  const one = track();
  one.samples[4].isKey = true;

  assert.equal(keyframeBefore(one.samples, 3), 0);
  assert.equal(keyframeBefore(one.samples, 4), 4);
  assert.equal(keyframeBefore(one.samples, 6), 4);
});

test('keyframeBefore starts at the beginning of a file with no keyframe at all', () => {
  const one = track();
  one.samples[0].isKey = false;

  assert.equal(keyframeBefore(one.samples, 5), 0);
});

test('keyframeBefore clamps an index past the end of the list', () => {
  const { samples } = track();
  assert.equal(keyframeBefore(samples, 9999), 0);
});

/* ------------------------------------------------------------- the series */

test('seriesFrames takes the frame at or before each mark', () => {
  const order = displayOrder(track());

  // Every 0.1s over a clip of seven 30fps frames: 0.0 lands on frame 0, 0.1 on
  // frame 3, which starts exactly there, and 0.2 on frame 6, the last one.
  assert.deepEqual(seriesFrames(order, { every: 0.1 }), [0, 3, 6]);

  // A mark that falls between two frames takes the one already on screen, and
  // the run stops at the last mark inside the clip rather than at the last
  // frame of it.
  assert.deepEqual(seriesFrames(order, { every: 0.09 }), [0, 2, 5]);
});

test('seriesFrames never returns the same frame twice', () => {
  const order = displayOrder(track());

  // An interval shorter than a frame would otherwise produce a run of copies of
  // one picture, each saved under a different name.
  const picked = seriesFrames(order, { every: 0.001 });
  assert.deepEqual(picked, [...new Set(picked)]);
  assert.deepEqual(picked, [0, 1, 2, 3, 4, 5, 6]);
});

test('seriesFrames stops at the ceiling it was given', () => {
  const order = displayOrder(track());

  assert.equal(seriesFrames(order, { every: 0.001, limit: 3 }).length, 3);
});

test('seriesFrames refuses an interval that is not a positive number', () => {
  const order = displayOrder(track());

  assert.deepEqual(seriesFrames(order, { every: 0 }), []);
  assert.deepEqual(seriesFrames(order, { every: -2 }), []);
  assert.deepEqual(seriesFrames([], { every: 1 }), []);
});

test('seriesFrames keeps inside the window it was given', () => {
  const order = displayOrder(track());

  assert.deepEqual(seriesFrames(order, { every: 1 / 30, from: 2 / 30, to: 4 / 30 }), [2, 3, 4]);
});

/* ------------------------------------------------------------ the plumbing */

test('micros converts a time on the file own clock into what WebCodecs counts in', () => {
  assert.equal(micros(0, 600), 0);
  assert.equal(micros(600, 600), 1_000_000);
  assert.equal(micros(20, 600), 33333);
  // 90 kHz, the other clock an MP4 is commonly written on.
  assert.equal(micros(3003, 90000), 33367);
});

test('lookaheadFor keeps fewer frames the larger they are', () => {
  const budget = 96 << 20;

  // 1080p is about 8 MB a frame, 4K about 33, and the ceiling is what stops a
  // postage-stamp video from being cached by the thousand.
  assert.equal(lookaheadFor(1920, 1080, budget), 12);
  assert.equal(lookaheadFor(3840, 2160, budget), 3);
  assert.equal(lookaheadFor(64, 64, budget), 16);
  assert.equal(lookaheadFor(8000, 8000, budget), 2);
});

/* ----------------------------------------------------------- names and times */

test('timecode writes a name that sorts and that a file system will accept', () => {
  assert.equal(timecode(0), '00-00.000');
  assert.equal(timecode(12.48), '00-12.480');
  assert.equal(timecode(83.5), '01-23.500');
  // Hours only when there are any: nobody wants 00-00-12.480 out of a short clip.
  assert.equal(timecode(3723.25), '01-02-03.250');
  assert.equal(timecode(-4), '00-00.000');
});

test('timecode carries a millisecond over rather than writing four digits', () => {
  // Rounding the seconds and the milliseconds separately is how a time a shade
  // under 13 seconds comes out as "12.1000".
  assert.equal(timecode(12.9999), '00-13.000');
  assert.equal(timecode(59.9999), '01-00.000');
  assert.equal(timecode(3599.9999), '01-00-00.000');
});

test('the name and the readout agree about the instant', () => {
  // These are the same moment written twice - once under the slider and once in
  // the file name - and a viewer comparing them should not find them a
  // millisecond apart.
  const digits = (text) => text.replace(/[^0-9]/g, '').padStart(9, '0');
  for (const at of [0, 0.5666666, 12.48, 12.9999, 83.5, 3723.25]) {
    assert.equal(digits(timecode(at)), digits(clockTime(at)));
  }
});

test('clockTime writes the same instant the way a person reads it', () => {
  assert.equal(clockTime(0), '0:00.000');
  assert.equal(clockTime(12.48), '0:12.480');
  assert.equal(clockTime(83.5), '1:23.500');
  assert.equal(clockTime(3723.25), '1:02:03.250');
});

test('stillName carries the time and the source name', () => {
  assert.equal(stillName('holiday.mp4', 12.48, 'image/png'), 'holiday-00-12.480.png');
  assert.equal(stillName('holiday.mp4', 12.48, 'image/jpeg'), 'holiday-00-12.480.jpg');
  assert.equal(stillName('holiday.mp4', 12.48, 'image/webp'), 'holiday-00-12.480.webp');
});

test('stillName drops only the last extension, and only a real one', () => {
  assert.equal(stillName('my.holiday.2026.mov', 1, 'image/png'), 'my.holiday.2026-00-01.000.png');
  assert.equal(stillName('no-extension', 1, 'image/png'), 'no-extension-00-01.000.png');
});

test('stillName replaces what a file system would object to', () => {
  assert.equal(stillName('a/b:c*d?.mp4', 0, 'image/png'), 'a_b_c_d_-00-00.000.png');
});

test('stillName falls back rather than producing a nameless file', () => {
  assert.equal(stillName(undefined, 0, 'image/png'), 'video-00-00.000.png');
  assert.equal(stillName('.mp4', 0, 'image/png'), 'video-00-00.000.png');
  assert.equal(stillName('holiday.mp4', 0, 'image/avif'), 'holiday-00-00.000.png');
});
