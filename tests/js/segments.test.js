/**
 * shared/js/segments.js - the marks and their file.
 *
 * The format itself is tested through the two tools that use it
 * (trim-audio.test.js, trim-video-segments.test.js), reading and writing
 * both layouts. What is pinned here is the one thing the shared file made a
 * parameter: the shortest segment worth keeping is the caller's number, so a
 * mark that the audio trimmer keeps is one the video cutter drops.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { segmentRanges, totalCaptured, writeTimestamps } from '../../shared/js/segments.js';

const marks = [
  { id: 1, start: 1, end: 1.005 },   // five milliseconds: sound, not a frame
  { id: 2, start: 2, end: 3 },
  { id: 3, start: 4, end: null },    // still open
];

test('a segment shorter than the threshold given is not a segment', () => {
  assert.deepEqual(segmentRanges(marks, 0.001), [{ start: 1, end: 1.005 }, { start: 2, end: 3 }]);
  assert.deepEqual(segmentRanges(marks, 0.02), [{ start: 2, end: 3 }]);
});

test('the total and the file follow the same threshold', () => {
  assert.equal(totalCaptured(marks, 0.001), 1.005);
  assert.equal(totalCaptured(marks, 0.02), 1);
  assert.equal(writeTimestamps(marks, { name: 'take 2', minSegment: 0.02 }),
    'seconds,take 2\n2.000,3.000\n');
  assert.equal(writeTimestamps(marks, { minSegment: 0.001 }),
    'seconds,\n1.000,1.005\n2.000,3.000\n');
});
