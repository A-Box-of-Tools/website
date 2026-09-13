/**
 * The arithmetic behind turning a GIF into a video: when each frame is
 * shown, what the encoder is asked for, and the words. Pinned by hand; the
 * encoder is WebCodecs and is checked in a browser, and the GIF reader has
 * its own tests beside the splitter's.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  MAX_BITRATE, MIN_BITRATE, bitrateFor, frameTimes, hasTransparency, nominalFps, outputSize,
  parseHex,
} from '../../tools/gif-to-mp4/src/plan.js';
import {
  bitrateText, frameText, outName, timingText,
} from '../../tools/gif-to-mp4/src/format.js';

const frames = (...delays) => delays.map((delay) => ({ delay, transparentIndex: -1 }));

test('each frame starts where the last one ended and lasts its own delay', () => {
  const { times, total } = frameTimes(frames(10, 200, 5, 10));
  assert.deepEqual(times, [
    { start: 0, duration: 0.1 },
    { start: 0.1, duration: 2 },
    { start: 2.1, duration: 0.05 },
    { start: 2.15, duration: 0.1 },
  ]);
  assert.ok(Math.abs(total - 2.25) < 1e-9);
});

test('a delay under two hundredths is played as ten, the way every browser does', () => {
  const { times, total } = frameTimes(frames(0, 1, 2));
  assert.deepEqual(times.map((t) => t.duration), [0.1, 0.1, 0.02]);
  assert.ok(Math.abs(total - 0.22) < 1e-9);
  assert.deepEqual(frameTimes([]), { times: [], total: 0 });
});

test('the nominal rate is one over the commonest delay, held to what an encoder takes', () => {
  assert.equal(nominalFps(frames(8, 8, 8, 200)), 13);   // 1 / 0.08 = 12.5
  assert.equal(nominalFps(frames(4, 4, 10)), 25);
  assert.equal(nominalFps(frames(1, 1, 1)), 10);         // played as ten hundredths
  assert.equal(nominalFps(frames(300, 300)), 1);         // never under one
  assert.equal(nominalFps(frames(2, 2)), 50);
  assert.equal(nominalFps([]), 10);
});

test('the output is the GIF\'s size made even, and no wider than an encoder takes', () => {
  assert.deepEqual(outputSize({ width: 400, height: 300 }), { width: 400, height: 300, scale: 1 });
  assert.deepEqual(outputSize({ width: 401, height: 301 }), { width: 402, height: 302, scale: 1 });
  assert.deepEqual(outputSize({ width: 1, height: 1 }), { width: 2, height: 2, scale: 1 });
  const huge = outputSize({ width: 7680, height: 4320 });
  assert.deepEqual([huge.width, huge.height], [3840, 2160]);
  assert.ok(Math.abs(huge.scale - 0.5) < 1e-9);
});

test('the bitrate is generous per pixel and held between its floor and ceiling', () => {
  // 400x300 at 12 fps wants 216 kbit/s by the pixel rule, which is under the floor.
  assert.equal(bitrateFor({ width: 400, height: 300, fps: 12 }), MIN_BITRATE);
  assert.equal(bitrateFor({ width: 800, height: 600, fps: 25 }), Math.round(800 * 600 * 25 * 0.15 / 1000) * 1000);
  assert.equal(bitrateFor({ width: 64, height: 64, fps: 10 }), MIN_BITRATE);
  assert.equal(bitrateFor({ width: 3840, height: 2160, fps: 30 }), MAX_BITRATE);
});

test('transparency is noticed on any frame, and a colour is read from hex', () => {
  assert.equal(hasTransparency(frames(10, 10)), false);
  assert.equal(hasTransparency([{ delay: 10, transparentIndex: -1 }, { delay: 10, transparentIndex: 3 }]), true);
  assert.deepEqual(parseHex('#ff8000'), { r: 255, g: 128, b: 0 });
  assert.deepEqual(parseHex('00FF00'), { r: 0, g: 255, b: 0 });
  assert.deepEqual(parseHex('nonsense'), { r: 255, g: 255, b: 255 });
});

test('the words', () => {
  assert.deepEqual(timingText(frames(8, 8, 8), 12), { key: 'timing.steady', values: { fps: 12 } });
  assert.deepEqual(timingText(frames(8, 200), 12), { key: 'timing.varies', values: { fps: 12 } });
  // Two delays a browser plays the same way are one timing.
  assert.deepEqual(timingText(frames(0, 1, 10), 10), { key: 'timing.steady', values: { fps: 10 } });
  assert.deepEqual(bitrateText(2_400_000), { key: 'rate.mbit', values: { n: '2.4' } });
  assert.deepEqual(bitrateText(400_000), { key: 'rate.kbit', values: { n: 400 } });
  assert.deepEqual(frameText({ width: 400, height: 300 }), { key: 'frame.plain', values: { width: 400, height: 300 } });
  assert.equal(outName('reaction.gif'), 'reaction.mp4');
  assert.equal(outName('.gif'), 'animation.mp4');
});
