/**
 * A keyboard user needs the position where a landmark stopped, not every
 * intermediate position. The timer is tested independently of the DOM, then
 * the real widget is exercised so resets and hidden landmarks cannot leave an
 * old photograph speaking after it has gone.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createMarkFeedback, Marks } from '../../tools/id-photo/src/marks.js';

function clock() {
  const jobs = [];
  return {
    jobs,
    schedule: (callback, delay) => {
      const job = { callback, delay, cancelled: false };
      jobs.push(job);
      return job;
    },
    cancel: (job) => { job.cancelled = true; },
  };
}

test('landmark feedback coalesces a key burst and snapshots the final position', () => {
  const timers = clock();
  const seen = [];
  const feedback = createMarkFeedback((position) => seen.push(position), timers);
  feedback.queue({ label: 'mark.crown', x: 12, y: 34 });
  const position = { label: 'mark.crown', x: 12, y: 44 };
  feedback.queue(position);
  position.y = 500;
  assert.equal(timers.jobs[0].cancelled, true);
  assert.equal(timers.jobs[1].delay, 250);
  assert.deepEqual(seen, []);
  timers.jobs[1].callback();
  assert.deepEqual(seen, [{ label: 'mark.crown', x: 12, y: 44 }]);
});

test('a superseded timer cannot publish an earlier landmark position', () => {
  const timers = clock();
  const seen = [];
  const feedback = createMarkFeedback((position) => seen.push(position), timers);
  feedback.queue({ label: 'mark.crown', x: 1, y: 2 });
  feedback.queue({ label: 'mark.chin', x: 3, y: 4 });
  // Deliberately run a cancelled callback: retirement must survive a late one.
  timers.jobs[0].callback();
  assert.deepEqual(seen, []);
  timers.jobs[1].callback();
  assert.deepEqual(seen, [{ label: 'mark.chin', x: 3, y: 4 }]);
});

test('retiring feedback clears its reading and rejects a late callback', () => {
  const timers = clock();
  const seen = [];
  const feedback = createMarkFeedback((position) => seen.push(position), timers);
  feedback.queue({ label: 'mark.crown', x: 1, y: 2 });
  feedback.clear();
  assert.equal(timers.jobs[0].cancelled, true);
  timers.jobs[0].callback();
  assert.deepEqual(seen, [null]);
});

function element() {
  const handlers = new Map();
  return {
    children: [], dataset: {}, style: {}, attributes: {}, hidden: false,
    classList: { add() {}, remove() {} },
    append(node) { this.children.push(node); },
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener(name, handler) { handlers.set(name, handler); },
    emit(name, values = {}) {
      const event = { currentTarget: this, preventDefault() { this.prevented = true; }, ...values };
      handlers.get(name)?.(event);
      return event;
    },
    focus() { this.emit('focus'); },
    getBoundingClientRect: () => ({ width: 500, height: 300 }),
  };
}

function build(t) {
  const savedDocument = globalThis.document;
  const savedWindow = globalThis.window;
  const listeners = new Map();
  globalThis.document = { createElement: () => element() };
  globalThis.window = {
    addEventListener: (name, handler) => listeners.set(name, handler),
    removeEventListener: (name) => listeners.delete(name),
  };
  t.mock.timers.enable({ apis: ['setTimeout'] });
  t.after(() => {
    globalThis.document = savedDocument;
    globalThis.window = savedWindow;
    t.mock.timers.reset();
  });
  const stage = element();
  const seen = [];
  const changes = [];
  const marks = new Marks(stage, {
    t: (key) => key,
    onPosition: (position) => seen.push(position),
    onChange: (points, why) => changes.push({ points, why }),
  });
  const dots = Object.fromEntries(stage.children.map((dot) => [dot.dataset.key, dot]));
  marks.setSource(100, 100);
  marks.open();
  seen.length = 0;
  changes.length = 0;
  return { marks, dots, seen, changes, listeners, tick: (ms) => t.mock.timers.tick(ms) };
}

test('arrow and Shift-arrow feedback reports the actual clamped source point once', (t) => {
  const { marks, dots, seen, changes, tick } = build(t);
  dots.crown.focus();
  assert.equal(dots.crown.emit('keydown', { key: 'ArrowDown' }).prevented, true);
  tick(200);
  dots.crown.emit('keydown', { key: 'ArrowDown', shiftKey: true });
  tick(249);
  assert.deepEqual(seen, []);
  tick(1);
  assert.deepEqual(seen, [{ label: 'mark.crown', x: 50, y: 25 }]);
  assert.deepEqual(marks.marks.crown, { x: 50, y: 25 });
  assert.equal(changes.at(-1).why, 'drag');
  assert.equal(dots.crown.emit('keydown', { key: 'Enter' }).prevented, undefined);
  for (let i = 0; i < 10; i += 1) dots.crown.emit('keydown', { key: 'ArrowLeft', shiftKey: true });
  tick(250);
  assert.deepEqual(seen.at(-1), { label: 'mark.crown', x: 0, y: 25 });
});

test('focus reports the current dot while blur retires the previous reading', (t) => {
  const { dots, seen, tick } = build(t);
  dots.crown.focus();
  tick(100);
  dots.crown.emit('blur');
  dots.chin.focus();
  tick(250);
  assert.deepEqual(seen, [null, { label: 'mark.chin', x: 50, y: 54 }]);
  dots.chin.emit('blur');
  assert.equal(seen.at(-1), null);
});

test('hide, show, reset, replacement and clear retire pending landmark feedback', (t) => {
  const { marks, dots, seen, tick } = build(t);
  const retire = [
    () => marks.hide(), () => marks.show(), () => marks.open(),
    () => marks.place(marks.marks), () => marks.setSource(200, 300), () => marks.clear(),
  ];
  for (const action of retire) {
    marks.setSource(100, 100);
    marks.open();
    seen.length = 0;
    dots.crown.emit('keydown', { key: 'ArrowDown' });
    action();
    tick(300);
    assert.equal(seen.at(-1), null);
    assert.equal(seen.some((position) => position !== null), false);
  }
});

test('starting a pointer drag retires both a key burst and focus feedback', (t) => {
  const { dots, seen, listeners, tick } = build(t);
  dots.crown.emit('keydown', { key: 'ArrowDown' });
  dots.crown.emit('pointerdown', { button: 0, clientX: 0, clientY: 0, pointerId: 1 });
  listeners.get('pointermove')({ clientX: 20, clientY: 10 });
  tick(300);
  assert.deepEqual(seen, [null]);
  listeners.get('pointerup')();
  assert.equal(listeners.size, 0);
});
