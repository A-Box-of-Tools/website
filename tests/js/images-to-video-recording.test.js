/**
 * These boundaries drive the real-time recorder, whose output must agree with
 * the hold times entered in the page even when a frame is shorter than 100 ms.
 * Decoder ownership and visible capture are checked in a real browser.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  recordingTimeline, recordingIndex,
} from '../../tools/images-to-video/src/recording-timeline.js';

test('24 images held for one frame at 24 fps take one second', () => {
  const { boundaries, totalSeconds } = recordingTimeline(
    Array.from({ length: 24 }, () => ({ duration: 1 / 24 })));
  assert.ok(Math.abs(totalSeconds - 1) < 1e-12);
  assert.equal(boundaries.length, 24);
  assert.equal(boundaries[0], 1 / 24);
});

test('one-frame holds are preserved at the highest allowed frame rate', () => {
  const { boundaries, totalSeconds } = recordingTimeline([{ duration: 1 / 120 }]);
  assert.equal(totalSeconds, 1 / 120);
  assert.equal(recordingIndex(boundaries, totalSeconds), 0);
});

test('seconds holds retain their independent durations', () => {
  const { boundaries, totalSeconds } = recordingTimeline(
    [{ duration: 0.1 }, { duration: 2.5 }, { duration: 0.25 }]);
  assert.deepEqual(boundaries, [0.1, 2.6, 2.85]);
  assert.equal(totalSeconds, 2.85);
});

test('a boundary belongs to the next image rather than the one that ended', () => {
  const { boundaries } = recordingTimeline([{ duration: 0.125 }, { duration: 0.25 }]);
  assert.equal(recordingIndex(boundaries, 0), 0);
  assert.equal(recordingIndex(boundaries, 0.124), 0);
  assert.equal(recordingIndex(boundaries, 0.125), 1);
  assert.equal(recordingIndex(boundaries, 0.375), 1);
});

test('a late tick targets the current image without visiting skipped indices', () => {
  const { boundaries } = recordingTimeline(
    Array.from({ length: 24 }, () => ({ duration: 1 / 24 })));
  assert.equal(recordingIndex(boundaries, 0.18), 4);
  assert.equal(recordingIndex(boundaries, 0.92), 22);
  assert.equal(recordingIndex(boundaries, 20), 23);
});

test('an empty timeline has no picture to select', () => {
  assert.deepEqual(recordingTimeline([]), { boundaries: [], totalSeconds: 0 });
  assert.equal(recordingIndex([], 0), -1);
});
