/**
 * The camera's reads: which of them the page says anything about, and what
 * the saying sounds like.
 *
 * Both halves are decisions rather than plumbing, and both used to be wrong
 * in ways no test would have caught because there was nothing to test: a read
 * was a two-pixel border for 0.7 seconds, and a code shown a second time was
 * silence. Neither module touches the DOM, so both run here with a clock that
 * is a number and an audio context that is an object.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { sightings } from '../../tools/qr-barcode-reader/src/sightings.js';
import { createChime, ring } from '../../tools/qr-barcode-reader/src/chime.js';

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

/* ---------------------------------------------------------------- chime */

/**
 * As much of an AudioContext as chime.js uses, recording what it was asked.
 *
 * `willRun` is whether resume() is honoured, which is the whole of the
 * browser's autoplay policy as far as this module can see it.
 */
function audio({ willRun = true } = {}) {
  const made = [];

  class Context {
    constructor() {
      this.state = 'suspended';
      this.currentTime = 3;
      this.destination = { is: 'the speaker' };
      this.oscillators = [];
      this.resumes = 0;
      made.push(this);
    }

    resume() {
      this.resumes += 1;
      if (willRun) this.state = 'running';
      return Promise.resolve();
    }

    close() {
      this.state = 'closed';
      return Promise.resolve();
    }

    createOscillator() {
      const oscillator = {
        type: null,
        frequency: { setValueAtTime(hertz) { oscillator.hertz = hertz; } },
        connect(to) { oscillator.into = to; },
        start(at) { oscillator.from = at; },
        stop(at) { oscillator.until = at; },
      };
      this.oscillators.push(oscillator);
      return oscillator;
    }

    createGain() {
      const level = {
        steps: [],
        gain: {
          setValueAtTime(value, at) { level.steps.push({ value, at, ramp: false }); },
          linearRampToValueAtTime(value, at) { level.steps.push({ value, at, ramp: true }); },
        },
        connect(to) { level.into = to; },
      };
      return level;
    }
  }

  return { Context, made };
}

test('a sound asked for inside the tap is ready when a code is read', () => {
  const { Context, made } = audio();
  const buzzes = [];
  const chime = createChime({ AudioContext: Context, vibrate: (ms) => buzzes.push(ms) });

  chime.arm();
  assert.equal(made.length, 1);
  assert.equal(made[0].resumes, 1, 'started inside the gesture, not at the first read');

  assert.equal(chime.play(), true);
  const [low, high] = made[0].oscillators;
  assert.equal(made[0].oscillators.length, 2);
  assert.ok(high.hertz > low.hertz, 'the second note is the higher one');
  assert.equal(low.from, 3, 'it starts now, on the context\'s own clock');
  assert.ok(high.from >= low.until - 0.03, 'and the second follows the first');
  for (const oscillator of made[0].oscillators) {
    assert.equal(oscillator.into.into, made[0].destination, 'through its own level to the speaker');
  }
  assert.equal(buzzes.length, 1);
  assert.ok(buzzes[0] > 0 && buzzes[0] <= 200, 'a tap, not a ringtone');
});

test('each note is faded in, held and faded out, never switched', () => {
  // A level that starts or ends on a step is a click. And a note with no hold
  // is a tick: the first version ramped straight down from its peak and had
  // lost five sixths of its level in fifteen milliseconds.
  const { Context, made } = audio();
  const context = new Context();
  ring(context, 10);
  assert.equal(made[0].oscillators.length, 2);

  for (const oscillator of context.oscillators) {
    const [silent, risen, held, gone] = oscillator.into.steps;
    assert.equal(oscillator.into.steps.length, 4);

    assert.deepEqual([silent.value, silent.at], [0, oscillator.from], 'from nothing, as it starts');
    assert.ok(risen.ramp && risen.value > 0.05 && risen.value <= 0.5, 'up to a level that is heard and is not full volume');
    assert.ok(risen.at - silent.at >= 0.004, 'over long enough not to click');

    assert.ok(!held.ramp && held.value === risen.value, 'held there');
    assert.ok(held.at - risen.at >= 0.03, 'for most of the note');

    assert.ok(gone.ramp && gone.value === 0, 'and back to nothing');
    assert.ok(gone.at - held.at >= 0.01, 'again not on a step');
    assert.ok(oscillator.until >= gone.at, 'before the oscillator is stopped');
  }
});

test('a context the browser will not start is asked again, and never played into', () => {
  // Scheduling into a suspended context is how a beep turns up minutes late,
  // about nothing, the next time the visitor touches the page.
  const { Context, made } = audio({ willRun: false });
  const chime = createChime({ AudioContext: Context, vibrate: () => {} });
  chime.arm();
  assert.equal(chime.play(), false);
  assert.equal(made[0].oscillators.length, 0);
  assert.equal(made[0].resumes, 2, 'once from the tap and once from the read');
});

test('nothing is played before the visitor has touched anything', () => {
  const { Context, made } = audio();
  const buzzes = [];
  const chime = createChime({ AudioContext: Context, vibrate: (ms) => buzzes.push(ms) });
  assert.equal(chime.play(), false);
  assert.equal(made.length, 0, 'no context is made outside a gesture');
  assert.equal(buzzes.length, 1, 'the buzz does not wait for the sound');
});

test('a browser with no audio interface still buzzes, and one that will not buzz still sounds', () => {
  const buzzes = [];
  const silent = createChime({ AudioContext: undefined, vibrate: (ms) => buzzes.push(ms) });
  silent.arm();
  assert.equal(silent.play(), false);
  assert.equal(buzzes.length, 1);

  const { Context, made } = audio();
  const still = createChime({ AudioContext: Context, vibrate: () => { throw new Error('not allowed'); } });
  still.arm();
  assert.equal(still.play(), true);
  assert.equal(made[0].oscillators.length, 2);
});

test('a context that cannot be made is no sound, not a broken camera', () => {
  class Rationed {
    constructor() { throw new Error('too many contexts'); }
  }
  const chime = createChime({ AudioContext: Rationed, vibrate: () => {} });
  assert.doesNotThrow(() => chime.arm());
  assert.equal(chime.play(), false);
});

test('arming twice makes one context, and releasing lets it go', () => {
  const { Context, made } = audio();
  const chime = createChime({ AudioContext: Context, vibrate: () => {} });
  chime.arm();
  chime.arm();
  assert.equal(made.length, 1);
  assert.equal(made[0].resumes, 2, 'a second tap asks an interrupted context back');

  chime.release();
  assert.equal(made[0].state, 'closed');
  assert.equal(chime.play(), false, 'a closed context is not played into');
  assert.doesNotThrow(() => chime.release(), 'and stopping twice is not an error');

  chime.arm();
  assert.equal(made.length, 2, 'the next camera session gets its own');
  assert.equal(chime.play(), true);
});
