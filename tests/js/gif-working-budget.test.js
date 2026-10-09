import test from 'node:test';
import assert from 'node:assert/strict';
import { logicalScreenPlan } from '../../shared/js/gif-working-budget.js';
import { gifWorkingPlan, headerWorkingPlan, retainedGifBytes, sourceCopies, WORKING_LIMIT } from '../../tools/gif-to-mp4/src/working.js';
import { gifToMp4 } from '../../tools/gif-to-mp4/src/encode.js';

const plan = (values = {}) => logicalScreenPlan({ width: 3, height: 2, ...values });

test('RGBA copies and retained bytes fit exactly at the chosen ceiling', () => {
  assert.deepEqual(plan({ copies: 3, extraBytes: 5, limitBytes: 77 }), { fits: true, screenBytes: 24, bytes: 77, reason: null });
  assert.deepEqual(plan({ copies: 3, extraBytes: 5, limitBytes: 76 }), { fits: false, screenBytes: 24, bytes: 77, reason: 'limit' });
});

test('dimensions and copy counts require positive safe integers', () => {
  for (const field of ['width', 'height', 'copies']) {
    for (const value of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) assert.equal(plan({ [field]: value }).reason, 'invalid');
  }
});

test('retained bytes and ceilings require nonnegative safe integers', () => {
  for (const field of ['extraBytes', 'limitBytes']) {
    for (const value of [-1, 0.5, NaN, Infinity]) assert.equal(plan({ [field]: value }).reason, 'invalid');
  }
  assert.equal(plan({ limitBytes: 0 }).reason, 'limit');
});

test('unsafe pixel, RGBA, copy and addition arithmetic is refused', () => {
  const max = Number.MAX_SAFE_INTEGER;
  for (const values of [{ width: max, height: 2 }, { width: Math.floor(max / 2), height: 1 },
    { width: 1, height: 1, copies: max }, { extraBytes: max }]) assert.equal(plan(values).reason, 'overflow');
});

test('palette views count their retained encoded buffer once', () => {
  const encoded = new ArrayBuffer(100);
  const indices = new Uint8Array(5);
  const gif = { globalPalette: new Uint8Array(encoded, 10, 6), frames: [
    { palette: new Uint8Array(encoded, 30, 6), indices },
    { palette: new Uint8Array(encoded, 40, 6), indices: indices.subarray(1) },
  ] };
  assert.equal(retainedGifBytes(gif), 105);
});

test('saved disposal replacement accounts both old and new snapshots', () => {
  assert.equal(sourceCopies({ frames: [{ disposal: 2 }] }), 3);
  assert.equal(sourceCopies({ frames: [{ disposal: 3 }] }), 4);
  assert.equal(sourceCopies({ frames: [{ disposal: 3 }, { disposal: 2 }, { disposal: 3 }] }), 5);
});

test('source pixels remain budgeted independently of resized output', () => {
  const gif = { width: 65535, height: 65535, frames: [] };
  const plan = gifWorkingPlan(gif, { width: 3840, height: 3840 });
  assert.equal(plan.fits, false);
  assert.equal(plan.reason, 'limit');
  assert.equal(plan.screenBytes, 17179344900);
});

test('retained patches and collected video data both contribute to admission', () => {
  const gif = { width: 2, height: 2, frames: [] }, size = { width: 2, height: 2 };
  assert.equal(gifWorkingPlan(gif, size, { retainedBytes: 5, chunkBytes: 7 }).bytes, 108);
  assert.equal(gifWorkingPlan(gif, size, { retainedBytes: WORKING_LIMIT }).fits, false);
  assert.equal(gifWorkingPlan(gif, size, { chunkBytes: WORKING_LIMIT }).fits, false);
  assert.equal(gifWorkingPlan(gif, size, { chunkBytes: -1 }).reason, 'invalid');
});

test('a valid oversized screen header is refused before decoding patches', () => {
  const bytes = Uint8Array.from([...new TextEncoder().encode('GIF89a'), 255, 255, 255, 255, 0, 0, 0]);
  assert.equal(headerWorkingPlan(bytes).fits, false);
  bytes[6] = bytes[7] = 0;
  assert.equal(headerWorkingPlan(bytes), null);
  assert.equal(headerWorkingPlan(new Uint8Array(13)), null);
});

test('direct encoder callers cannot allocate an oversized compositor', async () => {
  await assert.rejects(gifToMp4({ gif: { width: 65535, height: 65535, frames: [] },
    size: { width: 3840, height: 3840, scale: 1 }, fps: 10, bitrate: 400000 }), /gif\.workinglimit/);
});
