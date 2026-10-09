import test from 'node:test';
import assert from 'node:assert/strict';
import { seriesPlan, coveringInterval } from '../../tools/grab-frame/src/plan.js';

const order = (times) => times.map((time) => ({ time }));

test('series planning reports the whole requested range above the cap', () => {
  const plan = seriesPlan({ order: order(Array.from({ length: 600 }, (_, n) => n)), every: 1 });
  assert.equal(plan.count, 600);
  assert.equal(plan.overflow, true);
  assert.equal(plan.first, 0);
  assert.equal(plan.last, 599);
  assert.equal(plan.indexes.length, 500);
});

test('a covering interval gives a usable whole-clip plan', () => {
  const frames = order(Array.from({ length: 600 }, (_, n) => n));
  const plan = seriesPlan({ order: frames, every: coveringInterval(599) });
  assert.ok(plan.count <= 500);
  assert.equal(plan.overflow, false);
  assert.ok(plan.last >= 597);
});

test('sparse frames count selected frames without walking held marks', () => {
  const frames = order([0, 1000000000, 1000000001]);
  const before = structuredClone(frames);
  const plan = seriesPlan({ order: frames, every: 0.1 });
  assert.deepEqual(plan.indexes, [0, 1, 2]);
  assert.equal(plan.count, 3);
  assert.deepEqual(frames, before);
});

test('playback plans show requested marks and validate finite intervals', () => {
  const plan = seriesPlan({ duration: 600, every: 1 });
  assert.equal(plan.count, 601);
  assert.equal(plan.last, 600);
  assert.equal(plan.overflow, true);
  for (const every of [0, -1, 0.099, Infinity, NaN]) assert.equal(seriesPlan({ duration: 600, every }), null);
});

test('interval boundaries do not count a duplicate when multiplication rounds below a frame', () => {
  const plan = seriesPlan({ order: order([0, 0.7, 1.8]), every: 0.3 });
  assert.deepEqual(plan.indexes, [0, 1]);
  assert.equal(plan.count, 2);
});

test('duplicate presentation times cannot promise an exact per-frame plan', () => {
  assert.equal(seriesPlan({ order: order([0, 0, 0.7, 1.8]), every: 0.1 }), null);
});

test('exact reader and series refuse duplicate times before allocating a decoder', async () => {
  const { FrameReader, decodeSeries } = await import('../../tools/grab-frame/src/frames.js');
  const video = { timescale: 100, samples: [{ pts: 0 }, { pts: 0 }] };
  assert.throws(() => new FrameReader({}, video), /read\.duplicatetime/);
  await assert.rejects(decodeSeries({ file: {}, video, indexes: [0, 1], onFrame() { throw new Error('must not publish'); } }), /read\.duplicatetime/);
});
