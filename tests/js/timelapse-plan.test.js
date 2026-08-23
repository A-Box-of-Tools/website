/**
 * tools/timelapse-video/src/plan.js - the instants, the sizes, and the runs.
 *
 * Two things here are worth pinning down precisely, and neither of them throws
 * when it is wrong.
 *
 * The first is the sum a time-lapse *is*: an hour at sixty times has to come
 * out a minute, and it has to come out a minute at 24, 30 and 60 frames a
 * second alike, because the frame rate is how smooth it looks and not how fast
 * it runs. Get that confused and the tool still produces a video - just not the
 * one that was asked for.
 *
 * The second is `decodeRuns`, which is the reason this tool is quick. It decides
 * which short runs of the file have to go through the decoder to answer the
 * chosen instants, and there are two ways for it to be wrong: read too little,
 * and a frame is missing its keyframe and comes out as garbage or not at all;
 * read too much, and the promise that an hour of video does not take an hour is
 * quietly gone. Both are checked below against a sample table with a keyframe
 * every second.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  MIN_SPEED, MAX_SPEED,
  clampSpeed, lengthForSpeed, speedForLength, sampleInterval, frameTimes, repeatsFrames,
  outputSize, chooseBitrate, estimateBytes, reorderSlack, decodeRuns, decodeCost,
} from '../../tools/timelapse-video/src/plan.js';

/**
 * A sample table: `seconds` long, `fps` frames a second, a keyframe every
 * `gop` frames, counted in a timescale of 90000 as an MP4 would.
 */
function table({ seconds = 60, fps = 30, gop = 30, timescale = 90000 } = {}) {
  const samples = [];
  for (let i = 0; i < Math.round(seconds * fps); i += 1) {
    samples.push({
      pts: Math.round(i / fps * timescale),
      isKey: i % gop === 0,
      offset: i * 1000,
      size: 1000,
    });
  }
  return { samples, timescale };
}

/* ------------------------------------------------------- speed and length */

test('the finished length is the source length divided by the speed', () => {
  assert.equal(lengthForSpeed({ duration: 3600, speed: 60 }), 60);
  assert.equal(lengthForSpeed({ duration: 120, speed: 10 }), 12);
});

test('the frame rate does not change how fast the clip runs', () => {
  // The mistake this exists to catch: treating the output rate as part of the
  // speed. An hour at 60x is a minute at 24, 30 and 60 fps alike - what changes
  // is how many frames that minute is made of.
  for (const fps of [24, 30, 60]) {
    const times = frameTimes({ duration: 3600, speed: 60, fps });
    assert.equal(times.length, 60 * fps);
    assert.ok(Math.abs(times.length / fps - 60) < 1e-9, `${fps} fps ran the wrong length`);
  }
});

test('speed and length are the same sum in both directions', () => {
  for (const seconds of [5, 12, 30, 90]) {
    const speed = speedForLength({ duration: 600, seconds });
    assert.ok(Math.abs(lengthForSpeed({ duration: 600, speed }) - seconds) < 1e-9);
  }
});

test('an impossible finished length is clamped rather than believed', () => {
  // Asking for a ten-minute clip to come out ten minutes long is not a
  // time-lapse; asking for it in a nanosecond is not one either.
  assert.equal(speedForLength({ duration: 600, seconds: 600 }), MIN_SPEED);
  assert.equal(speedForLength({ duration: 600, seconds: 0.0001 }), MAX_SPEED);
  assert.equal(speedForLength({ duration: 600, seconds: 0 }), MIN_SPEED);
  assert.equal(clampSpeed(Number.NaN), MIN_SPEED);
});

test('the interval is the speed over the frame rate', () => {
  assert.equal(sampleInterval({ speed: 60, fps: 30 }), 2);
  assert.equal(sampleInterval({ speed: 120, fps: 24 }), 5);
});

/* --------------------------------------------------------------- the instants */

test('the instants start at zero and are one interval apart', () => {
  const times = frameTimes({ duration: 100, speed: 30, fps: 30 });
  assert.equal(times[0], 0);
  for (let i = 1; i < times.length; i += 1) {
    assert.ok(Math.abs((times[i] - times[i - 1]) - 1) < 1e-9);
  }
});

test('nothing is sampled from past the end of the clip', () => {
  const times = frameTimes({ duration: 9.5, speed: 60, fps: 30 }); // every 2s
  assert.equal(times.length, 4, 'four whole intervals fit in 9.5 seconds, not five');
  assert.ok(times[times.length - 1] < 9.5);
});

test('a duration that arrives a hair under the interval is not rounded away', () => {
  // What a timescale division actually produces, and the reason for the epsilon.
  const times = frameTimes({ duration: 9.999999999999998, speed: 30, fps: 30 });
  assert.equal(times.length, 10);
});

test('a clip too short for one interval still gives one frame', () => {
  assert.equal(frameTimes({ duration: 0.5, speed: 60, fps: 30 }).length, 1);
  assert.equal(frameTimes({ duration: 0, speed: 60, fps: 30 }).length, 1);
});

test('instants closer together than the source has frames are reported', () => {
  // 2x written at 30 fps takes an instant every 1/15 s, which a 30 fps source
  // can answer and a 12 fps source cannot.
  assert.equal(repeatsFrames({ speed: 2, fps: 30, sourceFps: 30 }), false);
  assert.equal(repeatsFrames({ speed: 2, fps: 30, sourceFps: 12 }), true);
  // Exactly one frame per instant is not a repeat.
  assert.equal(repeatsFrames({ speed: 1, fps: 30, sourceFps: 30 }), false);
  // Nothing is claimed about a source whose rate is unknown.
  assert.equal(repeatsFrames({ speed: 2, fps: 30, sourceFps: 0 }), false);
});

/* ----------------------------------------------------------------- the picture */

test('the output frame keeps the shape and is even on both sides', () => {
  const landscape = outputSize({ width: 1920, height: 1080, shortEdge: 720 });
  assert.deepEqual(landscape, { width: 1280, height: 720 });

  // A portrait clip: "720p" is 720 across the short side, which is the width.
  const portrait = outputSize({ width: 1080, height: 1920, shortEdge: 720 });
  assert.deepEqual(portrait, { width: 720, height: 1280 });
});

test('an odd-sized source is rounded to something H.264 can describe', () => {
  const { width, height } = outputSize({ width: 1079, height: 607 });
  assert.equal(width % 2, 0);
  assert.equal(height % 2, 0);
});

test('nothing is ever scaled up', () => {
  assert.deepEqual(outputSize({ width: 640, height: 360, shortEdge: 1080 }),
    { width: 640, height: 360 });
  assert.deepEqual(outputSize({ width: 640, height: 360, shortEdge: 0 }),
    { width: 640, height: 360 });
});

test('the bitrate rises with quality and stays inside its rails', () => {
  const frame = { width: 1280, height: 720, fps: 30 };
  const low = chooseBitrate({ ...frame, quality: 'low' });
  const medium = chooseBitrate({ ...frame, quality: 'medium' });
  const high = chooseBitrate({ ...frame, quality: 'high' });
  assert.ok(low < medium && medium < high);

  // A postage stamp does not get a bitrate that makes it look worse than the
  // floor, and a 16K frame does not get one no encoder will accept.
  assert.ok(chooseBitrate({ width: 16, height: 16, fps: 24, quality: 'low' }) >= 300_000);
  assert.ok(chooseBitrate({ width: 15360, height: 8640, fps: 60, quality: 'high' })
    <= 60_000_000);
});

test('an unknown quality name falls back rather than producing NaN', () => {
  assert.equal(chooseBitrate({ width: 1280, height: 720, fps: 30, quality: 'silly' }),
    chooseBitrate({ width: 1280, height: 720, fps: 30, quality: 'medium' }));
});

test('the size estimate is the bitrate over the running time', () => {
  // 300 frames at 30 fps is 10 seconds; 8 Mbit/s for 10 seconds is 10 MB.
  assert.equal(estimateBytes({ frames: 300, fps: 30, bitrate: 8_000_000 }), 10_000_000);
});

/* -------------------------------------------------------------- what to decode */

test('a sparse time-lapse reads a small part of the file', () => {
  // A minute at 30 fps with a keyframe every second, sampled every two seconds.
  const { samples, timescale } = table({ seconds: 60, fps: 30, gop: 30 });
  const times = frameTimes({ duration: 60, speed: 60, fps: 30 });
  const runs = decodeRuns({ samples, timescale, times });
  const cost = decodeCost(runs, samples.length);

  assert.equal(times.length, 30);
  assert.ok(cost.read <= samples.length / 20,
    `read ${cost.read} of ${cost.total}, which is not a saving worth having`);
});

test('a file that stores its frames in order is read with no slack at all', () => {
  const { samples, timescale } = table({ seconds: 60, fps: 30, gop: 30 });
  assert.equal(reorderSlack(samples, timescale), 0);

  // Which is the whole saving: one frame per instant, not sixteen.
  const times = frameTimes({ duration: 60, speed: 60, fps: 30 });
  assert.equal(decodeCost(decodeRuns({ samples, timescale, times }), samples.length).read,
    times.length);
});

test('the slack is measured off the file rather than assumed', () => {
  // Two frames swapped in the stored order, as a file with B-frames does it:
  // the frame shown at 4/30 s is stored before the one shown at 3/30 s.
  const { samples, timescale } = table({ seconds: 10, fps: 30, gop: 30 });
  const swap = samples[3].pts;
  samples[3].pts = samples[4].pts;
  samples[4].pts = swap;

  assert.ok(Math.abs(reorderSlack(samples, timescale) - 1 / 30) < 1e-9);
});

test('a nonsense timestamp cannot make the plan read the whole file', () => {
  const { samples, timescale } = table({ seconds: 60, fps: 30, gop: 30 });
  samples[900].pts = 0;   // one corrupt row, claiming a thirty-second reorder

  assert.equal(reorderSlack(samples, timescale), 0.5, 'the cap did not hold');
});

test('every instant has a keyframe in front of it inside its own run', () => {
  const { samples, timescale } = table({ seconds: 60, fps: 30, gop: 30 });
  const times = frameTimes({ duration: 60, speed: 90, fps: 30 });
  const runs = decodeRuns({ samples, timescale, times });

  for (const run of runs) {
    assert.equal(samples[run.first].isKey, true,
      'a run that does not begin at a keyframe decodes to nothing');
    for (const time of run.times) {
      const ticks = time * timescale;
      assert.ok(samples[run.first].pts <= ticks + 1e-9,
        'the run starts after the instant it is meant to answer');
      assert.ok(samples[run.last].pts >= ticks - 1e-9,
        'the run ends before the instant it is meant to answer');
    }
  }
});

test('every instant is answered exactly once, in order', () => {
  const { samples, timescale } = table({ seconds: 30, fps: 30, gop: 15 });
  const times = frameTimes({ duration: 30, speed: 45, fps: 30 });
  const runs = decodeRuns({ samples, timescale, times });

  assert.deepEqual(runs.flatMap((run) => run.times), times);
});

test('the runs march forwards and never overlap', () => {
  const { samples, timescale } = table({ seconds: 120, fps: 30, gop: 60 });
  const times = frameTimes({ duration: 120, speed: 150, fps: 30 });
  const runs = decodeRuns({ samples, timescale, times });

  for (let i = 1; i < runs.length; i += 1) {
    assert.ok(runs[i].first > runs[i - 1].last,
      'two runs cover the same samples, so something is decoded twice');
  }
});

test('a dense time-lapse asks for one run per group, not one per instant', () => {
  // At 2x the instants are two frames apart, so most of them fall inside the
  // same group of pictures as the one before. Without the merge that would be
  // 450 runs and 450 restarts over a file being read straight through anyway;
  // with it there is one run per keyframe, which is as few as there can be.
  const { samples, timescale } = table({ seconds: 30, fps: 30, gop: 30 });
  const times = frameTimes({ duration: 30, speed: 2, fps: 30 });
  const runs = decodeRuns({ samples, timescale, times });
  const keyframes = samples.filter((sample) => sample.isKey).length;

  assert.equal(times.length, 450);
  assert.equal(runs.length, keyframes);
  assert.equal(runs[0].first, 0);

  // And it does read nearly all of the file, which is correct at this speed:
  // there is no saving available when every second frame is wanted.
  const cost = decodeCost(runs, samples.length);
  assert.ok(cost.fraction > 0.9, `read only ${cost.read} of ${cost.total}`);
});

test('the reordering slack keeps a frame stored after the instant in the run', () => {
  const { samples, timescale } = table({ seconds: 10, fps: 30, gop: 30 });
  const times = [5];
  const [run] = decodeRuns({ samples, timescale, times, slack: 0.5 });

  // The instant is frame 150; the run has to reach past it by half a second,
  // because a file with B-frames stores a later frame before an earlier one.
  assert.ok(run.last >= 150 + 15, `the run stops at ${run.last}, too early to reorder`);
});

test('an empty table or no instants asks for nothing', () => {
  const { samples, timescale } = table({ seconds: 10 });
  assert.deepEqual(decodeRuns({ samples: [], timescale, times: [1] }), []);
  assert.deepEqual(decodeRuns({ samples, timescale, times: [] }), []);
  assert.deepEqual(decodeCost([], 0), { read: 0, total: 0, fraction: 0 });
});
