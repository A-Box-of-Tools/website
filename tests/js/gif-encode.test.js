/**
 * tools/video-to-gif/src/encode.js - frames in, a file out.
 *
 * What is worth testing here is the bookkeeping around a frame that is the same
 * as the one before it. Sampling a video at 12 frames a second over a held shot
 * produces several identical frames, and writing them is pure waste: each costs
 * a block of LZW to say "nothing changed". So they are dropped and their time
 * is given to the frame in front of them.
 *
 * That is the part that can go quietly wrong. Dropping the frames is easy;
 * keeping the animation the length it was cut to while doing it is the bit
 * with an off-by-one in it, and a GIF that plays a fifth too fast looks like a
 * choice rather than a bug.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { encodeGif, MAX_COLORS } from '../../tools/video-to-gif/src/encode.js';
import { ColorHistogram } from '../../tools/video-to-gif/src/quantize.js';
import { parseGif, flatFrame } from './gif-fixtures.js';
import { blobBytes } from './helpers.js';

const W = 8;
const H = 4;

/** Run the encoder over frames of flat colour, and read the file back. */
async function encode(colors, delays, options = {}) {
  const frames = colors.map((color) => flatFrame(W, H, color));
  const histogram = new ColorHistogram();
  for (const frame of frames) histogram.add(frame);

  const result = await encodeGif({
    frames, histogram, delays, width: W, height: H, colors: MAX_COLORS, ...options,
  });
  return { result, gif: parseGif(await blobBytes(result.blob)) };
}

const RED = [220, 30, 30];
const GREEN = [30, 200, 60];
const BLUE = [40, 60, 220];

test('frames that differ are all written', async () => {
  const { result, gif } = await encode([RED, GREEN, BLUE], [8, 9, 8]);
  assert.equal(result.written, 3);
  assert.equal(result.dropped, 0);
  assert.equal(gif.frames.length, 3);
  assert.deepEqual(gif.frames.map((frame) => frame.control.delay), [8, 9, 8]);
});

test('a held shot is one frame with the time of all of them', async () => {
  const { result, gif } = await encode([RED, RED, RED, RED], [8, 9, 8, 8]);
  assert.equal(result.written, 1);
  assert.equal(result.dropped, 3);
  assert.equal(gif.frames.length, 1);
  assert.equal(gif.frames[0].control.delay, 33, 'the four delays end up on the one frame');
});

test('dropping frames does not change how long the animation runs', async () => {
  const delays = [8, 9, 8, 8, 9, 8, 8, 9];
  const colors = [RED, RED, RED, GREEN, GREEN, BLUE, BLUE, BLUE];
  const { result, gif } = await encode(colors, delays);

  const total = gif.frames.reduce((sum, frame) => sum + frame.control.delay, 0);
  assert.equal(total, delays.reduce((sum, delay) => sum + delay, 0));
  assert.equal(result.written, 3);
  assert.equal(result.dropped, 5);
});

test('the first frame is the whole picture and is opaque', async () => {
  const { gif } = await encode([RED, GREEN], [8, 8]);
  const [first, second] = gif.frames;

  assert.deepEqual([first.x, first.y, first.width, first.height], [0, 0, W, H]);
  assert.equal(first.control.hasTransparent, false);

  // Everything changed on the second one too, so it covers the picture as well
  // - but the marker still has its place in the table.
  assert.deepEqual([second.x, second.y, second.width, second.height], [0, 0, W, H]);
});

test('only the corner that changed is written', async () => {
  const before = flatFrame(W, H, RED);
  const after = flatFrame(W, H, RED);
  // one pixel, at (6, 2)
  const at = (2 * W + 6) * 4;
  after[at] = GREEN[0];
  after[at + 1] = GREEN[1];
  after[at + 2] = GREEN[2];

  const histogram = new ColorHistogram();
  histogram.add(before);
  histogram.add(after);

  const result = await encodeGif({
    frames: [before, after], histogram, delays: [8, 8], width: W, height: H,
  });
  const gif = parseGif(await blobBytes(result.blob));

  assert.equal(gif.frames.length, 2);
  assert.deepEqual(
    [gif.frames[1].x, gif.frames[1].y, gif.frames[1].width, gif.frames[1].height],
    [6, 2, 1, 1]);
});

test('the palette leaves room for the transparent marker', async () => {
  // 300 distinct colours is more than the format can hold, and one index has to
  // stay free for "unchanged", so the table can hold 255 colours and no more.
  const frames = [];
  const histogram = new ColorHistogram();
  for (let i = 0; i < 4; i += 1) {
    const rgba = new Uint8ClampedArray(W * H * 4);
    for (let p = 0; p < W * H; p += 1) {
      rgba[p * 4] = (p * 8 + i * 2) & 0xff;
      rgba[p * 4 + 1] = (p * 3 + i * 40) & 0xff;
      rgba[p * 4 + 2] = (p * 17 + i) & 0xff;
      rgba[p * 4 + 3] = 255;
    }
    histogram.add(rgba);
    frames.push(rgba);
  }

  const result = await encodeGif({
    frames, histogram, delays: [8, 8, 8, 8], width: W, height: H,
  });
  assert.ok(result.colors <= MAX_COLORS, `${result.colors} colours is one too many`);
});

test('the frames handed in are released rather than held', async () => {
  const frames = [flatFrame(W, H, RED), flatFrame(W, H, GREEN)];
  const histogram = new ColorHistogram();
  for (const frame of frames) histogram.add(frame);

  await encodeGif({ frames, histogram, delays: [8, 8], width: W, height: H });
  assert.deepEqual(frames, [null, null], 'a long animation must not hold both formats at once');
});

test('a run cancelled partway through throws rather than returning half a file', async () => {
  const controller = new AbortController();
  controller.abort();
  const frames = [flatFrame(W, H, RED)];
  const histogram = new ColorHistogram();
  histogram.add(frames[0]);

  await assert.rejects(
    () => encodeGif({ frames, histogram, delays: [8], width: W, height: H, signal: controller.signal }),
    (error) => error.name === 'AbortError');
});
