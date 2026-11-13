/**
 * What a page sounds like when it has something to say: shared/js/chime.js.
 *
 * The module is decisions rather than plumbing - when a context may be made,
 * what is done with one the browser will not start, how a note begins and
 * ends - and none of them can be heard in a test run. So it runs here with an
 * audio context that is an object recording what it was asked. It began as
 * the QR reader's own module; Remote Camera's alerts are why it is shared and
 * why a caller can bring its own notes.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createChime, ring } from '../../shared/js/chime.js';

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

test('a tool that is not saying yes brings its own notes and its own buzz', () => {
  // Remote Camera's alert is a call from across the room, not an answer to
  // "did that scan?", so it is lower, longer and felt twice.
  const { Context, made } = audio();
  const buzzes = [];
  const notes = [
    { hertz: 880, starts: 0, lasts: 0.16 },
    { hertz: 1175, starts: 0.19, lasts: 0.26 },
  ];
  const chime = createChime({ AudioContext: Context, vibrate: (pattern) => buzzes.push(pattern), notes, buzz: [120, 80, 120] });
  chime.arm();
  assert.equal(chime.play(), true);

  assert.deepEqual(made[0].oscillators.map((oscillator) => oscillator.hertz), [880, 1175]);
  assert.deepEqual(made[0].oscillators.map((oscillator) => oscillator.from), [3, 3.19]);
  assert.deepEqual(buzzes, [[120, 80, 120]], 'the pattern goes to the device as it was given');

  const plain = createChime({ AudioContext: Context, vibrate: () => {} });
  plain.arm();
  plain.play();
  assert.deepEqual(made[1].oscillators.map((oscillator) => oscillator.hertz), [1319, 1760], 'and the reader still hears its own');
});

test('notes handed to ring are the ones scheduled', () => {
  const { Context } = audio();
  const context = new Context();
  ring(context, 10, [{ hertz: 440, starts: 0.5, lasts: 0.2 }]);
  assert.equal(context.oscillators.length, 1);
  assert.equal(context.oscillators[0].hertz, 440);
  assert.equal(context.oscillators[0].from, 10.5);
  assert.ok(context.oscillators[0].until >= 10.7);
});
