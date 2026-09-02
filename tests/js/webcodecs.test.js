/**
 * shared/js/webcodecs.js - the arithmetic around a decoder and an encoder.
 *
 * A codec here is an EventTarget with a queue size, which is all `settle`
 * reads, and the clock is the runner's, so the thirty-second stall can be
 * reached in a test that takes none.
 */

import test, { mock } from 'node:test';
import assert from 'node:assert/strict';

import { decoderConfig, averageFps, micros, settle, QUEUE_LIMIT } from '../../shared/js/webcodecs.js';

/** A decoder or encoder holding `queued` frames. */
function codec(kind, queued) {
  const target = new EventTarget();
  target[kind === 'decoder' ? 'decodeQueueSize' : 'encodeQueueSize'] = queued;
  target.drain = (n) => {
    target[kind === 'decoder' ? 'decodeQueueSize' : 'encodeQueueSize'] -= n;
    target.dispatchEvent(new Event('dequeue'));
  };
  return target;
}

test('decoderConfig hands over the description only when the track has one', () => {
  const h264 = { codec: 'avc1.64001f', codedWidth: 1920, codedHeight: 1088, description: new Uint8Array(3) };
  assert.deepEqual(decoderConfig(h264), {
    codec: 'avc1.64001f', codedWidth: 1920, codedHeight: 1088, description: h264.description,
  });
  const vp9 = { codec: 'vp09.00.10.08', codedWidth: 640, codedHeight: 360 };
  assert.deepEqual(decoderConfig(vp9), { codec: 'vp09.00.10.08', codedWidth: 640, codedHeight: 360 });
});

test('averageFps is the sample count over the duration, within what a clip can be', () => {
  assert.equal(averageFps({ duration: 6000, timescale: 600, samples: new Array(300) }), 30);
  assert.equal(averageFps({ duration: 0, timescale: 600, samples: [] }), 30, 'no duration: assume 30');
  assert.equal(averageFps({ duration: 600, timescale: 600, samples: new Array(5000) }), 240);
  assert.equal(averageFps({ duration: 6000, timescale: 600, samples: new Array(2) }), 1);
});

test('micros converts a time on the file own clock into what WebCodecs counts in', () => {
  assert.equal(micros(0, 600), 0);
  assert.equal(micros(600, 600), 1_000_000);
  assert.equal(micros(20, 600), 33333);
  assert.equal(micros(3003, 90000), 33367);
});

test('settle returns at once when nothing is over the limit', async () => {
  await settle([codec('decoder', QUEUE_LIMIT), codec('encoder', 0)]);
});

test('settle waits for every codec over the limit to drain', async () => {
  const decoder = codec('decoder', QUEUE_LIMIT + 3);
  const encoder = codec('encoder', QUEUE_LIMIT + 1);
  let done = false;
  const waiting = settle([decoder, encoder]).then(() => { done = true; });

  await Promise.resolve();
  assert.equal(done, false);
  decoder.drain(3);
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(done, false, 'the encoder is still over');
  encoder.drain(1);
  await waiting;
  assert.equal(done, true);
});

test('settle polls when no dequeue event ever comes', async () => {
  // `dequeue` is not in every implementation, so the wait is capped and the
  // queue size is read again.
  const encoder = codec('encoder', QUEUE_LIMIT + 1);
  setTimeout(() => { encoder.encodeQueueSize = 0; }, 5);
  await settle([encoder]);
});

test('settle gives up after stallAfter without progress, under the key given', async () => {
  mock.timers.enable({ apis: ['setTimeout', 'Date'] });
  const decoder = codec('decoder', QUEUE_LIMIT + 2);
  const failed = settle([decoder], { stallAfter: 30_000, stallKey: 'stall.both' })
    .then(() => 'resolved', (error) => error.message);
  // Each 20 ms poll finds the same queue; thirty seconds of that is a stall.
  for (let i = 0; i < 1600; i += 1) {
    mock.timers.tick(20);
    await Promise.resolve();
    await Promise.resolve();
  }
  assert.equal(await failed, 'stall.both');
  mock.timers.reset();
});

test('progress resets the stall clock', async () => {
  mock.timers.enable({ apis: ['setTimeout', 'Date'] });
  const decoder = codec('decoder', QUEUE_LIMIT + 4);
  const waiting = settle([decoder], { stallAfter: 100 });
  for (let step = 0; step < 4; step += 1) {
    // 80 ms without progress each time, then one frame drains: never a stall.
    for (let i = 0; i < 4; i += 1) {
      mock.timers.tick(20);
      await Promise.resolve();
      await Promise.resolve();
    }
    decoder.drain(1);
    await Promise.resolve();
    await Promise.resolve();
  }
  await waiting;
  mock.timers.reset();
});
