/**
 * The arithmetic behind "make it 25 MB".
 *
 * Everything the page decides before the encoder starts is in plan.js and is
 * pinned here to numbers worked out by hand: what the budget leaves the
 * picture once the sound and the tables have taken theirs, which rung of the
 * ladder that bitrate can afford, and what the second attempt is asked for
 * when the first overshoots. The encoder itself is WebCodecs and is checked
 * in a browser; the README says how.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  chooseFrame, fit, fixedBytes, fractionOf, LADDER, MB, MIN_BITRATE, plan, PRESETS, retune,
  videoBitrate,
} from '../../tools/compress-video/src/plan.js';
import { bitrateText, frameText, outName } from '../../tools/compress-video/src/format.js';

/** A minute of 1080p at 30 fps with 128 kbit/s of sound, 60 MB in all. */
const CLIP = {
  seconds: 60,
  fps: 30,
  displayWidth: 1920,
  displayHeight: 1080,
  videoBytes: 59_000_000,
  audioBytes: 960_000,
  samples: 60 * 30 + 60 * 43,
};

test('the sound and the tables come off the top, and the picture gets the rest', () => {
  const fixed = fixedBytes(CLIP, true);
  assert.ok(fixed > CLIP.audioBytes, 'the tables cost something');
  assert.ok(fixed < CLIP.audioBytes + 200_000, 'but not much');

  const rate = videoBitrate(CLIP, 25_000_000, true);
  // (25 MB - fixed) * 8 / 60 s, times the safety margin.
  const expected = ((25_000_000 - fixed) * 8 / 60) * 0.94;
  assert.ok(Math.abs(rate - expected) < 1, `${rate} vs ${expected}`);

  // Without the sound the picture gets the sound's share too.
  assert.ok(videoBitrate(CLIP, 25_000_000, false) > rate);
});

test('a target the sound alone would not fit is refused, and says what would', () => {
  assert.equal(videoBitrate(CLIP, 500_000, true), null);
  const refused = plan(CLIP, { targetBytes: 500_000, keepAudio: true, longEdge: null });
  assert.equal(refused.ok, false);
  assert.equal(refused.reason, 'nofit');
  assert.ok(refused.least > CLIP.audioBytes);

  // The same target with the sound left out is refused for the other reason:
  // nothing watchable fits.
  const silent = plan(CLIP, { targetBytes: 500_000, keepAudio: false, longEdge: null });
  assert.equal(silent.ok, false);
  assert.equal(silent.reason, 'toosmall');
  // And the least it asks for really would work.
  assert.ok(plan(CLIP, { targetBytes: silent.least, keepAudio: false, longEdge: null }).ok);
});

test('the ladder steps the frame down until each pixel can afford its bits', () => {
  // Plenty of bitrate: the source's own size.
  const rich = chooseFrame(CLIP, 8_000_000);
  assert.deepEqual([rich.width, rich.height], [1920, 1080]);
  assert.equal(rich.auto, true);

  // A quarter of that: 1080p would starve, 720p is fine.
  const modest = chooseFrame(CLIP, 2_000_000);
  assert.deepEqual([modest.width, modest.height], [1280, 720]);

  // Almost nothing: the bottom rung, rather than a large smeared picture.
  const poor = chooseFrame(CLIP, MIN_BITRATE);
  assert.equal(poor.longEdge, LADDER[LADDER.length - 1]);

  // A rung the visitor chose is honoured even when the number would not
  // have chosen it, and is never above the source.
  const chosen = chooseFrame(CLIP, 2_000_000, 1920);
  assert.deepEqual([chosen.width, chosen.height, chosen.auto], [1920, 1080, false]);
  const capped = chooseFrame(CLIP, 8_000_000, 3840);
  assert.deepEqual([capped.width, capped.height], [1920, 1080]);
});

test('the frame keeps its shape, in even numbers, and a small source is never enlarged', () => {
  const portrait = { ...CLIP, displayWidth: 1080, displayHeight: 1920 };
  assert.deepEqual(fit(portrait, 1280), { width: 720, height: 1280 });
  assert.deepEqual(fit({ ...CLIP, displayWidth: 1919, displayHeight: 1079 }, 1280),
    { width: 1280, height: 720 });
  assert.deepEqual(fit({ ...CLIP, displayWidth: 640, displayHeight: 360 }, 1920),
    { width: 640, height: 360 });
  const odd = fit({ ...CLIP, displayWidth: 1001, displayHeight: 333 }, 1001);
  assert.equal(odd.width % 2, 0);
  assert.equal(odd.height % 2, 0);
});

test('the estimate sits under the target by the safety margin', () => {
  const planned = plan(CLIP, { targetBytes: 25_000_000, keepAudio: true, longEdge: null });
  assert.equal(planned.ok, true);
  assert.ok(planned.estimate < 25_000_000, 'under');
  assert.ok(planned.estimate > 23_000_000, 'but only by the margin');
});

test('a second pass asks for proportionally less, and a little more than that', () => {
  const fixed = fixedBytes(CLIP, true);
  // Asked for 3 Mbit/s, came out 10% over the target.
  const again = retune(3_000_000, 27_500_000, 25_000_000, fixed);
  const ratio = (25_000_000 - fixed) / (27_500_000 - fixed);
  assert.ok(Math.abs(again - 3_000_000 * ratio * 0.96) < 1);
  assert.ok(again < 3_000_000 * 0.9);
  // And never below the floor.
  assert.equal(retune(200_000, 10_000_000, 1_000_000, fixed), MIN_BITRATE);
});

test('presets and fractions are what people are told to stay under', () => {
  assert.equal(MB, 1048576);
  assert.deepEqual(PRESETS, [8, 16, 25, 50, 100].map((n) => n * MB));
  assert.equal(fractionOf(60_000_000, 0.5), 30_000_000);
  assert.equal(fractionOf(3, 0.25), 1);
});

test('format: rates, frames and the file name read as people say them', () => {
  assert.deepEqual(bitrateText(2_450_000), { key: 'rate.mbit', values: { n: '2.5' } });
  assert.deepEqual(bitrateText(640_000), { key: 'rate.kbit', values: { n: 640 } });
  assert.deepEqual(frameText({ width: 1280, height: 720 }),
    { key: 'frame.named', values: { name: '720p', width: 1280, height: 720 } });
  assert.deepEqual(frameText({ width: 720, height: 1280 }),
    { key: 'frame.named', values: { name: '720p', width: 720, height: 1280 } });
  assert.deepEqual(frameText({ width: 1000, height: 500 }),
    { key: 'frame.plain', values: { width: 1000, height: 500 } });
  assert.equal(outName('holiday.MOV'), 'holiday-compressed.mp4');
  assert.equal(outName('.mp4'), 'video-compressed.mp4');
});
