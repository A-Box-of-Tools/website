/**
 * Whether a camera view is still arriving: tools/remote-camera/src/picture.js.
 *
 * The page used to say "receiving live video" for as long as the connection
 * held, and a phone that locks pauses its camera without dropping it. Nothing
 * in the browser announces that, so it is worked out from a count of decoded
 * frames - and a rule worked out from a count is one that can be wrong in
 * both directions: a warning over a picture that is fine, or none over one
 * that has stopped. The module takes a count and a clock reading, so both
 * are numbers here.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { pictureWatch } from '../../tools/remote-camera/src/picture.js';

/** The page reads the connection's statistics this often, in milliseconds. */
const READING = 1000;

/** Read `frames` once a second from `from` to `until`, and collect what changed. */
function readings(watch, frames, from, until) {
  const said = [];
  for (let now = from; now <= until; now += READING) {
    const change = watch.read(typeof frames === 'function' ? frames(now) : frames, now);
    if (change) said.push({ change, now });
  }
  return said;
}

test('a picture that keeps arriving is never called stopped', () => {
  const watch = pictureWatch();
  // Thirty frames a second, for a minute.
  assert.deepEqual(readings(watch, (now) => 100 + now * 0.03, 0, 60_000), []);
});

test('a count that stands still for five seconds is a picture that has stopped, said once', () => {
  const watch = pictureWatch();
  watch.read(1530, 0);
  const said = readings(watch, 1530, READING, 30_000);
  assert.deepEqual(said, [{ change: 'stalled', now: 5000 }]);
});

test('a pause shorter than the patience is not mentioned', () => {
  // Switching cameras on the other device, or a bad second of Wi-Fi.
  const watch = pictureWatch();
  watch.read(900, 0);
  assert.deepEqual(readings(watch, 900, READING, 4000), []);
  assert.equal(watch.read(930, 5000), null);
  assert.deepEqual(readings(watch, 930, 6000, 9000), [], 'and the wait starts from the last frame, not the first');
});

test('the first frame after a stop says the picture is back, once', () => {
  const watch = pictureWatch();
  watch.read(1530, 0);
  readings(watch, 1530, READING, 8000);
  assert.equal(watch.read(1531, 9000), 'moving');
  assert.equal(watch.read(1560, 10_000), null);
  assert.deepEqual(readings(watch, 1560, 11_000, 16_000), [{ change: 'stalled', now: 15_000 }], 'and it can stop again');
});

test('a picture that has not started is not one that has stopped', () => {
  // session.js gives the first frame its own deadline and its own sentence.
  const watch = pictureWatch();
  assert.deepEqual(readings(watch, 0, 0, 30_000), []);
  assert.equal(watch.read(12, 31_000), null);
});

test('a reading that arrives late proves nothing about the time before it', () => {
  // The page was hidden or frozen and took no readings. Coming back to a
  // warning that is withdrawn a second later would be a false alarm.
  const watch = pictureWatch();
  watch.read(400, 0);
  watch.read(400, READING);
  assert.equal(watch.read(400, 61_000), null, 'a minute unread is not a minute stopped');
  assert.deepEqual(readings(watch, 400, 62_000, 65_000), []);
  assert.equal(watch.read(400, 66_000), 'stalled', 'five seconds of looking is');
});

test('a late reading does not withdraw a stop that was already said', () => {
  const watch = pictureWatch();
  watch.read(400, 0);
  assert.deepEqual(readings(watch, 400, READING, 6000), [{ change: 'stalled', now: 5000 }]);
  assert.equal(watch.read(400, 90_000), null, 'still stopped, and not said twice');
  assert.equal(watch.read(431, 91_000), 'moving');
});

test('a clock that goes backwards is treated as a gap, not as a long wait', () => {
  const watch = pictureWatch();
  watch.read(400, 10_000);
  watch.read(400, 11_000);
  assert.equal(watch.read(400, 2000), null);
  assert.deepEqual(readings(watch, 400, 3000, 6000), []);
  assert.equal(watch.read(400, 7000), 'stalled');
});

test('a counter that starts again under a new receiver is a fresh start, not movement', () => {
  const watch = pictureWatch();
  watch.read(5000, 0);
  readings(watch, 5000, READING, 6000);
  assert.equal(watch.read(0, 7000), null, 'a smaller count is not a frame arriving');
  assert.equal(watch.read(3, 8000), 'moving', 'a larger one after it is');
});

test('a new connection starts from nothing', () => {
  const watch = pictureWatch();
  watch.read(1530, 0);
  readings(watch, 1530, READING, 6000);
  watch.reset();
  assert.equal(watch.read(1530, 7000), null, 'no memory of having stopped');
  assert.deepEqual(readings(watch, (now) => 1530 + now, 8000, 20_000), []);
});

test('the patience and the gap are the caller\'s to set', () => {
  const watch = pictureWatch({ patienceMs: 2000, gapMs: 10_000 });
  watch.read(10, 0);
  assert.equal(watch.read(10, 1000), null);
  assert.equal(watch.read(10, 2000), 'stalled');
  watch.reset();
  watch.read(10, 0);
  assert.equal(watch.read(10, 9000), 'stalled', 'nine seconds is inside a ten-second gap');
});
