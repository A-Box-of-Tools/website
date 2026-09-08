/**
 * tools/redact-image/src/stage.js - the drag, as arithmetic.
 *
 * Every step of a drag is measured from where the pointer went down, not from
 * where the box was a moment ago, and the caller writes each answer straight
 * into the rectangle it handed over. Those two facts are only safe together
 * because the stage copies that rectangle once, when the press happens: a
 * stage that kept the caller's object would re-apply the whole drag on every
 * pointer report, and the box would sprint away from the pointer - visibly
 * broken on screen, invisible to every test of the arithmetic underneath.
 *
 * So the caller modelled here mutates in place exactly as main.js does, and
 * the pointer reports its way across the picture in small steps rather than
 * one jump, because one jump is the single case the broken version got right.
 *
 * The DOM is the least that lets the class build itself: elements that
 * remember a class, a style and their parent, and a window that hands back the
 * move and up events a drag listens for.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { Stage } from '../../tools/redact-image/src/stage.js';

/** The stage is 500 x 400 on screen and the picture is 1000 x 800: two to one. */
const STAGE = { left: 0, top: 0, width: 500, height: 400 };
const SOURCE = { width: 1000, height: 800 };

/** An element that remembers what the stage does to it. */
function element() {
  const node = {
    className: '',
    textContent: '',
    style: {},
    dataset: {},
    children: [],
    parent: null,
    listeners: {},
    append(...nodes) {
      for (const child of nodes) {
        child.parent = node;
        node.children.push(child);
      }
    },
    setAttribute(name, value) { node[`@${name}`] = value; },
    addEventListener(type, fn) { (node.listeners[type] ??= []).push(fn); },
    focus() {},
    remove() { node.parent = null; },
    querySelector: (selector) => node.children.find(
      (child) => child.className.split(' ').includes(selector.slice(1)),
    ),
    closest: (selector) => (node.className.split(' ').includes(selector.slice(1))
      ? node
      : node.parent?.closest(selector) ?? null),
    getBoundingClientRect: () => STAGE,
  };
  return node;
}

/** A window that keeps the listeners a drag adds and lets a test fire them. */
function fakeWindow() {
  const listeners = {};
  return {
    addEventListener(type, fn) { (listeners[type] ??= []).push(fn); },
    removeEventListener(type, fn) {
      listeners[type] = (listeners[type] ?? []).filter((other) => other !== fn);
    },
    fire(type, event) { for (const fn of [...(listeners[type] ?? [])]) fn(event); },
  };
}

/**
 * A stage wired to a caller that behaves like main.js: it owns the regions and
 * writes each change into the object it already has.
 */
function build(regions) {
  globalThis.document = { createElement: () => element() };
  globalThis.window = fakeWindow();

  const stage = element();
  const gestures = [];
  const owner = new Stage(stage, {
    onCreate: (rect) => regions.push({ id: `r${regions.length + 1}`, style: 'fill', ...rect }),
    onChange: (id, rect) => {
      Object.assign(regions.find((region) => region.id === id), rect);
      owner.render(regions, id);
    },
    onSelect: () => {},
    onDelete: () => {},
    onGestureStart: () => gestures.push(regions.map((region) => ({ ...region }))),
    regionOf: (id) => regions.find((region) => region.id === id),
    describe: () => 'a box',
  });

  owner.setSource(SOURCE.width, SOURCE.height);
  owner.render(regions, null);
  const boxes = stage.children.filter((child) => child.className.startsWith('redact-box'));
  return { stage, boxes, gestures, regions };
}

/** The stage a node sits on: the press is listened for there, not on the box. */
const stageOf = (node) => (node.parent ? stageOf(node.parent) : node);

/** Press, report the move in `steps` reports, and let go. */
function drag(target, from, to, { steps = 8 } = {}) {
  stageOf(target).listeners.pointerdown[0]({
    button: 0, pointerId: 1, target, clientX: from.x, clientY: from.y, preventDefault() {},
  });
  for (let i = 1; i <= steps; i += 1) {
    window.fire('pointermove', {
      clientX: from.x + ((to.x - from.x) * i) / steps,
      clientY: from.y + ((to.y - from.y) * i) / steps,
    });
  }
  window.fire('pointerup', {});
}

const grip = (box, handle) => box.children.find((child) => child.dataset.handle === handle);

test('a move lands where the pointer let go, however often the pointer reported', () => {
  const regions = [{ id: 'r1', x: 100, y: 100, width: 200, height: 100, style: 'fill' }];
  const { boxes } = build(regions);

  // 50 across and 50 down on a stage drawn at half size: 100 source pixels each way.
  drag(boxes[0], { x: 100, y: 80 }, { x: 150, y: 130 });

  assert.deepEqual(regions[0], {
    id: 'r1', x: 200, y: 200, width: 200, height: 100, style: 'fill',
  });
});

test('a drag reported in one jump and the same drag reported in fifty agree', () => {
  const once = [{ id: 'r1', x: 100, y: 100, width: 200, height: 100, style: 'fill' }];
  const many = [{ id: 'r1', x: 100, y: 100, width: 200, height: 100, style: 'fill' }];

  drag(build(once).boxes[0], { x: 60, y: 60 }, { x: 20, y: 90 }, { steps: 1 });
  drag(build(many).boxes[0], { x: 60, y: 60 }, { x: 20, y: 90 }, { steps: 50 });

  assert.deepEqual(many[0], once[0]);
});

test('a resize follows the handle rather than outrunning it', () => {
  const regions = [{ id: 'r1', x: 100, y: 100, width: 200, height: 100, style: 'fill' }];
  const { boxes } = build(regions);

  // The bottom right corner is at (150, 100) on screen; take it 20 right and
  // 10 down, which is 40 and 20 more source pixels of box.
  drag(grip(boxes[0], 'se'), { x: 150, y: 100 }, { x: 170, y: 110 });

  assert.deepEqual(regions[0], {
    id: 'r1', x: 100, y: 100, width: 240, height: 120, style: 'fill',
  });
});

test('a click that did not move changes nothing and is not undoable', () => {
  const regions = [{ id: 'r1', x: 100, y: 100, width: 200, height: 100, style: 'fill' }];
  const { boxes, gestures } = build(regions);

  drag(boxes[0], { x: 100, y: 80 }, { x: 100, y: 80 });

  assert.deepEqual(regions[0], {
    id: 'r1', x: 100, y: 100, width: 200, height: 100, style: 'fill',
  });
  assert.equal(gestures.length, 0);
});
