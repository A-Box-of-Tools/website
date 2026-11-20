/**
 * tools/number-explorer/src/stage.js - a journey ends by telling whoever started it.
 *
 * The stage runs journeys: the picture growing from one up to the number, and the
 * short zoom that follows a change of world. Left alone, one arrives. It is also ended
 * early by four things, a new number being aimed at, a jump, another journey starting,
 * and motion being turned off under it, and the stage used to drop it in silence in
 * all four. The page's button was then left reading Stop with nothing to stop: it
 * guessed from whether any journey was running, the zoom was one, and nothing told it
 * when the zoom was over.
 *
 * So what is asked here is the promise the page now leans on. A journey handed a
 * `done` has it called once, however it ends, and with the stage already in the state
 * it is going to be in.
 *
 * The browser is the least that lets the stage build itself: a canvas with a size, the
 * two observers the stage watches it with, a media query whose answer can be changed,
 * and animation frames that are run by hand, so a test decides how much time passes.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { createStage } from '../../tools/number-explorer/src/stage.js';

function browser({ reduced = false } = {}) {
  let frames = [];
  let now = 1000;
  const heard = {};
  const quiet = {
    matches: reduced,
    listeners: [],
    addEventListener(type, listener) { this.listeners.push(listener); }
  };
  globalThis.matchMedia = () => quiet;
  globalThis.requestAnimationFrame = callback => { frames.push(callback); };
  globalThis.ResizeObserver = class {
    constructor(listener) { heard.size = listener; }
    observe() {}
  };
  globalThis.IntersectionObserver = class {
    constructor(listener) { heard.view = listener; }
    observe() {}
  };
  globalThis.document = { hidden: false, addEventListener() {} };
  return {
    canvas: {
      width: 0,
      height: 0,
      getContext: () => ({ setTransform() {} }),
      getBoundingClientRect: () => ({ width: 800, height: 450 })
    },
    /** The canvas is given its size, which is when the stage first has anything to draw on. */
    open() { heard.size(); },
    /** How much of the stage is on screen: under a quarter and it stops spending frames. */
    inView(share) { heard.view([{ intersectionRatio: share }]); },
    /** The system's own setting for less motion, changed while the page is open. */
    reduceMotion(value) {
      quiet.matches = value;
      for (const listener of quiet.listeners) listener();
    },
    /** Run every frame the stage asks for, sixty to the second, until this much time has passed. */
    run(seconds) {
      for (let passed = 0; passed < seconds && frames.length; passed += 1 / 60) {
        const due = frames;
        frames = [];
        now += 1000 / 60;
        for (const frame of due) frame(now);
      }
    }
  };
}

/** A stage on screen, and how often and in what state a journey's starter was told. */
function staged(options) {
  const page = browser(options);
  const drawn = [];
  const stage = createStage(page.canvas, (ctx, frame) => { drawn.push(frame.log); });
  page.open();
  const told = [];
  return { page, stage, drawn, told, done: () => { told.push(stage.playing); } };
}

test('number explorer tells whoever started a journey when it arrives', () => {
  const { page, stage, drawn, told, done } = staged();
  stage.travel(0, 9, 1, done);
  assert.equal(stage.playing, true);

  page.run(0.5);
  assert.deepEqual(told, [], 'half way there is not there');
  assert.ok(drawn.at(-1) > 0 && drawn.at(-1) < 9, `half way through, the picture is at ${drawn.at(-1)}`);

  page.run(1);
  assert.deepEqual(told, [false], 'the journey arrived and nobody was told, or was told while it still counted as under way');
  assert.equal(stage.playing, false);
  assert.equal(drawn.at(-1), 9);

  page.run(1);
  assert.equal(told.length, 1, 'told once');
});

// Everything that ends a journey before it arrives, and whether a journey is under way
// afterwards. Each of these used to end one without a word.
const ENDINGS = [
  ['a new number is aimed at', stage => stage.aim(4), false],
  ['the stage jumps to a number', stage => stage.jump(4), false],
  ['another journey starts', stage => stage.travel(2, 4, 0.9), true],
  ['motion is paused', (stage, page) => { stage.pause(true); page.run(0.1); }, false],
  ['the system asks for less motion', (stage, page) => { page.reduceMotion(true); page.run(0.1); }, false]
];

for (const [ending, end, stillPlaying] of ENDINGS) {
  test(`number explorer tells whoever started a journey when ${ending} under it`, () => {
    const { page, stage, told, done } = staged();
    stage.travel(0, 9, 5, done);
    page.run(0.5);
    // The control: it was still going, so what follows is what ended it.
    assert.deepEqual(told, []);
    assert.equal(stage.playing, true);

    end(stage, page);
    assert.deepEqual(told, [stillPlaying], `the journey was ended and its starter ${told.length ? 'was told with the stage in the wrong state' : 'was not told'}`);

    // Long enough for the journey to have arrived, had it still been running.
    page.run(6);
    assert.equal(told.length, 1, 'told once');
  });
}

test('number explorer says a journey is over as it starts when motion is off', () => {
  const { page, stage, drawn, told, done } = staged({ reduced: true });
  stage.travel(0, 9, 5, done);
  assert.deepEqual(told, [false]);
  assert.equal(stage.playing, false);
  page.run(0.1);
  assert.equal(drawn.at(-1), 9, 'the picture did not go straight to the number');
});

test('number explorer keeps a journey waiting off screen, and finishes it when it is seen', () => {
  const { page, stage, told, done } = staged();
  page.inView(0);
  stage.travel(0, 9, 1, done);
  // Not spent where nobody can see it, and not called finished either.
  page.run(10);
  assert.deepEqual(told, []);
  assert.equal(stage.playing, true);

  page.inView(1);
  page.run(2);
  assert.deepEqual(told, [false]);
});

test('number explorer ends a journey nobody asked to hear about without complaint', () => {
  // The zoom after a change of world is started with nothing to call.
  const { page, stage } = staged();
  stage.travel(7, 9, 0.9);
  stage.aim(3);
  stage.travel(7, 9, 0.9);
  page.run(2);
  assert.equal(stage.playing, false);
});
