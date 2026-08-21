/**
 * tools/reverse-video/src/{timeline,audio}.js.
 *
 * `timeline.js` decides which frame comes out when, and it is the part of a
 * reversal that fails quietly: get it wrong and nothing throws, you simply get
 * a video that is a frame and a half too long, or that stutters where the
 * source changed frame rate, or - the one that would be hardest to spot - that
 * plays backwards but with the frames of each group in the wrong order.
 *
 * So the checks below are about lengths and orders rather than about pictures:
 * that every frame comes out exactly once, that the file is the same length as
 * the one that went in, that a frame keeps its own duration, and that the
 * groups a decoder has to be fed are the groups the file actually has.
 *
 * The one thing tests here cannot do is decode anything, so what a real
 * decoder hands back for a real file with B-frames is checked in a browser by
 * hand; see the tool's README.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  averageFps, closeDurations, displayTimes, frameWindows, gopRanges, outputSize,
  reversedTimes, windowLimit,
} from '../../tools/reverse-video/src/timeline.js';
import { reverseChannels } from '../../tools/reverse-video/src/audio.js';

/* ------------------------------------------------------------- fixtures */

/**
 * A video track at 30 fps on a 90000-tick clock, with a keyframe every `gap`
 * frames. No B-frames, so pts and dts agree and decode order is display order.
 */
function track({ frames = 60, fps = 30, gap = 15, timescale = 90000 } = {}) {
  const step = timescale / fps;
  const samples = [];
  for (let i = 0; i < frames; i++) {
    samples.push({ dts: i * step, pts: i * step, isKey: i % gap === 0, size: 1000, offset: i * 1000 });
  }
  return {
    timescale,
    samples,
    duration: frames * step,
    codedWidth: 1920,
    codedHeight: 1080,
    displayWidth: 1920,
    displayHeight: 1080,
  };
}

/**
 * Twelve frames in the order a file with B-frames stores them: the frame that
 * is shown last in each group of three is stored first, because the two after
 * it are built from it.
 */
function withBFrames({ timescale = 600, step = 20 } = {}) {
  const shownAt = [0, 3, 1, 2, 6, 4, 5, 9, 7, 8, 11, 10];
  const samples = shownAt.map((shown, index) => ({
    dts: index * step,
    pts: shown * step,
    isKey: index === 0,
    size: 500,
    offset: index * 500,
  }));
  return {
    timescale,
    samples,
    duration: shownAt.length * step,
    codedWidth: 640,
    codedHeight: 360,
    displayWidth: 640,
    displayHeight: 360,
  };
}

/* ------------------------------------------------------------- display order */

test('display times run in order and each frame lasts until the next', () => {
  const video = track({ frames: 10 });
  const { position, pts, duration, totalTicks } = displayTimes(video);

  assert.equal(position[0], 0);
  assert.equal(position[9], 9);
  assert.equal(pts[0], 0);
  assert.equal(pts[9], 9 * 3000);
  for (let i = 0; i < 10; i++) assert.equal(duration[i], 3000);
  assert.equal(totalTicks, 30000);
});

test('a file with B-frames is put back into the order it is shown in', () => {
  const video = withBFrames();
  const { position, pts } = displayTimes(video);

  // The second sample in the file is the fourth frame on screen.
  assert.equal(position[1], 3);
  assert.equal(position[2], 1);
  // Position is a permutation: every frame appears exactly once.
  assert.deepEqual([...position].sort((a, b) => a - b), [...Array(12).keys()]);
  // And the times are the presentation times, not the decode times.
  assert.equal(pts[1], 60);
  assert.equal(pts[2], 20);
});

test('the last frame is given what is left of the declared duration', () => {
  const video = track({ frames: 5 });
  video.duration = 5 * 3000 + 1200;          // a longer tail than the others
  assert.equal(displayTimes(video).duration[4], 4200);

  // A file that declares a duration ending before its last frame starts falls
  // back to the usual gap rather than writing a negative one.
  const broken = track({ frames: 5 });
  broken.duration = 6000;
  assert.equal(displayTimes(broken).duration[4], 3000);
});

/* --------------------------------------------------------------- reversing */

test('reversing keeps the clip exactly as long as it was', () => {
  const video = track({ frames: 45 });
  const { start, duration, totalTicks } = reversedTimes(video);

  assert.equal(totalTicks, 45 * 3000);
  // The frame shown last starts the output; the first frame ends it.
  assert.equal(start[44], 0);
  assert.equal(start[0] + duration[0], totalTicks);

  const times = [...start].sort((a, b) => a - b);
  assert.equal(times[0], 0);
  assert.equal(times[44] + 3000, totalTicks);
  // No two frames land on the same tick, and none is left out.
  assert.equal(new Set(times).size, 45);
});

test('a frame keeps its own duration when the frame rate wanders', () => {
  // Ten frames at 30 fps, then five at 15: what a phone that got hot does.
  const timescale = 90000;
  const samples = [];
  let at = 0;
  for (let i = 0; i < 10; i++) {
    samples.push({ dts: at, pts: at, isKey: i === 0, size: 100, offset: i * 100 });
    at += 3000;
  }
  for (let i = 0; i < 5; i++) {
    samples.push({ dts: at, pts: at, isKey: false, size: 100, offset: 1000 + i * 100 });
    at += 6000;
  }
  const video = { timescale, samples, duration: at };

  const { start, duration, totalTicks } = reversedTimes(video);
  assert.equal(totalTicks, at);

  // The slow frames were last, so they come out first, still slow.
  assert.equal(start[14], 0);
  assert.equal(duration[14], 6000);
  assert.equal(start[13], 6000);
  // And the quick ones are still quick, at the end.
  assert.equal(duration[0], 3000);
  assert.equal(start[0], at - 3000);

  // Laid end to end with no gap and no overlap, in the order they come out.
  const order = [...samples.keys()].sort((a, b) => start[a] - start[b]);
  let expected = 0;
  for (const index of order) {
    assert.equal(start[index], expected);
    expected += duration[index];
  }
  assert.equal(expected, totalTicks);
});

test('B-frames come out in the order they were shown, backwards', () => {
  const video = withBFrames();
  const { start, duration } = reversedTimes(video);

  const order = [...video.samples.keys()].sort((a, b) => start[a] - start[b]);
  const shown = order.map((index) => video.samples[index].pts / 20);
  assert.deepEqual(shown, [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0]);
  for (const index of order) assert.equal(duration[index], 20);
});

/* ----------------------------------------------------------- decoding groups */

test('groups begin at keyframes and cover every frame once', () => {
  const groups = gopRanges(track({ frames: 60, gap: 15 }).samples);

  assert.equal(groups.length, 4);
  assert.deepEqual(groups[0], { from: 0, to: 14 });
  assert.deepEqual(groups[3], { from: 45, to: 59 });

  let covered = 0;
  for (const group of groups) covered += group.to - group.from + 1;
  assert.equal(covered, 60);
});

test('a file that does not start on a keyframe still gets a first group', () => {
  const video = track({ frames: 20, gap: 10 });
  video.samples[0].isKey = false;
  const groups = gopRanges(video.samples);

  assert.deepEqual(groups[0], { from: 0, to: 9 });
  assert.equal(groups.length, 2);
});

test('groups of one, for a file where every frame is a keyframe', () => {
  const groups = gopRanges(track({ frames: 5, gap: 1 }).samples);
  assert.equal(groups.length, 5);
  assert.deepEqual(groups[2], { from: 2, to: 2 });
});

/* -------------------------------------------------- how much is held at once */

test('windows come out last first and cover the group exactly once', () => {
  const windows = frameWindows(10, 4);

  assert.deepEqual(windows, [
    { from: 6, to: 9 },
    { from: 2, to: 5 },
    { from: 0, to: 1 },
  ]);

  const seen = [];
  for (const window of windows) {
    for (let i = window.from; i <= window.to; i++) seen.push(i);
  }
  assert.deepEqual(seen.sort((a, b) => a - b), [...Array(10).keys()]);
});

test('a group that fits in the budget is decoded once', () => {
  assert.deepEqual(frameWindows(30, 250), [{ from: 0, to: 29 }]);
  assert.deepEqual(frameWindows(1, 250), [{ from: 0, to: 0 }]);
  assert.deepEqual(frameWindows(0, 250), []);
});

test('the frame budget falls as the frames get bigger', () => {
  const hd = windowLimit(1920, 1080);
  const uhd = windowLimit(3840, 2160);

  assert.ok(uhd < hd, 'a 4K frame is four times a 1080p one');
  assert.equal(uhd, Math.floor(hd / 4));
  // However small the budget, something has to be held, and however large it
  // is, holding six hundred frames is enough.
  assert.equal(windowLimit(16000, 16000), 4);
  assert.equal(windowLimit(64, 64), 600);
});

/* -------------------------------------------------------------- the writing */

test('durations are the gaps between one written frame and the next', () => {
  const written = closeDurations([
    { dts: 0, tailDuration: 3000 },
    { dts: 3000, tailDuration: 3000 },
    { dts: 7500, tailDuration: 3000 },
  ]);

  assert.deepEqual(written.map((sample) => sample.duration), [3000, 4500, 3000]);
});

test('the frame size is rounded to what H.264 can store', () => {
  assert.deepEqual(outputSize({ displayWidth: 1920, displayHeight: 1080 }),
    { width: 1920, height: 1080 });
  assert.deepEqual(outputSize({ displayWidth: 1081, displayHeight: 607 }),
    { width: 1080, height: 606 });
  assert.deepEqual(outputSize({ displayWidth: 1, displayHeight: 1 }),
    { width: 2, height: 2 });
});

test('the average frame rate is what the frames and the clock say', () => {
  assert.equal(averageFps(track({ frames: 60, fps: 30 })), 30);
  assert.equal(averageFps({ samples: [], duration: 0, timescale: 90000 }), 30);
});

/* ------------------------------------------------------------------ the sound */

test('reversing the samples is exact, and doing it twice gives them back', () => {
  const left = Float32Array.from([0, 0.25, -0.5, 1]);
  const right = Float32Array.from([-1, 0.75, 0.5, 0]);
  const original = [left.slice(), right.slice()];

  reverseChannels([left, right]);
  assert.deepEqual([...left], [1, -0.5, 0.25, 0]);
  assert.deepEqual([...right], [0, 0.5, 0.75, -1]);

  reverseChannels([left, right]);
  assert.deepEqual([...left], [...original[0]]);
  assert.deepEqual([...right], [...original[1]]);
});

test('an odd-length track keeps its middle sample where it was', () => {
  const samples = Float32Array.from([1, 2, 3, 4, 5]);
  reverseChannels([samples]);
  assert.deepEqual([...samples], [5, 4, 3, 2, 1]);
});
