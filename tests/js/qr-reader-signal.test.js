/**
 * The camera's reads: which of them the page says anything about.
 *
 * It is a decision rather than plumbing, and it used to be wrong in a way no
 * test would have caught because there was nothing to test: a read was a
 * two-pixel border for 0.7 seconds, and a code shown a second time was
 * silence. The module does not touch the DOM, so it runs here with a clock
 * that is a number. What a read sounds like is the shared part
 * shared/js/chime.js, which tests/js/chime.test.js holds.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { sightings } from '../../tools/qr-barcode-reader/src/sightings.js';

/** The camera looks at a frame this often, in milliseconds. */
const FRAME = 120;

/* ------------------------------------------------------------ sightings */

test('a code held in front of the camera is announced once', () => {
  const seen = sightings();
  assert.equal(seen.note('qr:hello', 0), 'first');
  for (let now = FRAME; now <= 10_000; now += FRAME) {
    assert.equal(seen.note('qr:hello', now), 'still', `read again at ${now} ms`);
  }
});

test('a code the reader misses for a moment has not left', () => {
  // Poor light: read, missed for nearly two seconds, read again, and nothing
  // else seen in between. That is one code that never moved.
  const seen = sightings();
  seen.note('qr:hello', 0);
  assert.equal(seen.note('qr:hello', 1900), 'still');
  assert.equal(seen.note('qr:hello', 3800), 'still');
});

test('a code taken away and shown again is announced again, once', () => {
  const seen = sightings();
  seen.note('qr:hello', 0);
  assert.equal(seen.note('qr:hello', 2000), 'back');
  assert.equal(seen.note('qr:hello', 2000 + FRAME), 'still');
});

test('a different code is announced at once, and so is going back to the first', () => {
  // The case that was silent when only time out of sight was counted: one
  // second on another code is a deliberate swap, and after it the page is
  // naming the wrong code until it says something.
  const seen = sightings();
  assert.equal(seen.note('qr:first', 0), 'first');
  assert.equal(seen.note('qr:second', 1000), 'first');
  assert.equal(seen.note('qr:first', 2000), 'back');
  assert.equal(seen.note('qr:second', 3000), 'back');
});

test('two codes in one frame are one picture, not a visitor switching eight times a second', () => {
  const seen = sightings();
  assert.equal(seen.note('qr:left', 0), 'first');
  assert.equal(seen.note('qr:right', FRAME), 'first');
  for (let frame = 2; frame < 60; frame += 1) {
    const key = frame % 2 ? 'qr:right' : 'qr:left';
    assert.equal(seen.note(key, frame * FRAME), 'still', `frame ${frame}`);
  }
});

test('the two gaps are the caller\'s to set', () => {
  const seen = sightings({ awayMs: 500, swapMs: 100 });
  seen.note('a', 0);
  assert.equal(seen.note('a', 499), 'still');
  assert.equal(seen.note('a', 999), 'back');
  seen.note('b', 1000);
  assert.equal(seen.note('a', 1050), 'still', 'seen 51 ms ago: both in the frame');
  assert.equal(seen.note('b', 1100), 'still', 'still the code the page is naming');
  assert.equal(seen.note('a', 1160), 'back', 'out of sight for 110 ms, behind another code');
});

test('only the newest codes are remembered, and one that was dropped is new again', () => {
  const seen = sightings({ most: 2 });
  seen.note('a', 0);
  seen.note('b', 10);
  seen.note('c', 20);
  assert.equal(seen.note('a', 30), 'first', 'the oldest was let go');
  assert.equal(seen.note('c', 40), 'still', 'the newest was kept');
});

test('a new camera session starts from nothing', () => {
  const seen = sightings();
  seen.note('qr:hello', 0);
  seen.forget();
  assert.equal(seen.note('qr:hello', FRAME), 'first');
});
