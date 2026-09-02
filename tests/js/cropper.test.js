/**
 * shared/js/cropper.js - the crop box, as arithmetic.
 *
 * The box is a rectangle in the picture's own pixels and everything it does
 * is arithmetic on that rectangle, so the DOM here is the least that lets the
 * class build itself: elements that remember a class name, a style and a
 * label, and a stage with a size. What is pinned is the two rules a tool
 * sets - the smallest crop and whether every side is even - and the geometry
 * both tools relied on before they shared the file.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { Cropper } from '../../shared/js/cropper.js';

/** An element that records what the cropper does to it. */
function element() {
  const classes = new Set();
  return {
    className: '',
    textContent: '',
    style: {},
    dataset: {},
    children: [],
    classList: {
      toggle: (name, on) => (on ? classes.add(name) : classes.delete(name)),
      add: (name) => classes.add(name),
      remove: (name) => classes.delete(name),
      contains: (name) => classes.has(name),
    },
    append(...nodes) { this.children.push(...nodes); },
    setAttribute(name, value) { this[`@${name}`] = value; },
    addEventListener() {},
    focus() {},
    getBoundingClientRect: () => ({ width: 500, height: 300 }),
  };
}

function build(options = {}) {
  globalThis.document = { createElement: () => element() };
  const stage = element();
  const seen = [];
  const cropper = new Cropper(stage, { onChange: (rect) => seen.push(rect), ...options });
  const box = stage.children[0];
  return { cropper, stage, box, seen, label: () => box.children[0].textContent };
}

test('the box opens on the whole picture, and says how big it is', () => {
  const { cropper, box, seen, label } = build({ label: 'Crop area' });
  cropper.setSource(400, 300);
  assert.deepEqual(cropper.rect, { x: 0, y: 0, width: 400, height: 300 });
  assert.equal(label(), '400 x 300');
  assert.equal(box['@aria-label'], 'Crop area');
  assert.equal(box.style.width, '100%');
  assert.deepEqual(seen.at(-1), { x: 0, y: 0, width: 400, height: 300 });
});

test('the video cropper: every side even, never smaller than sixteen', () => {
  const { cropper, label } = build({ minSize: 16, evenSizes: true });
  cropper.setSource(101, 75);
  // Rounded down, never up: 101 wide is a 100-pixel crop, 75 tall a 74.
  assert.deepEqual(cropper.rect, { x: 0, y: 0, width: 100, height: 74 });
  cropper.setRect({ x: 10, y: 10, width: 7, height: 9 });
  assert.deepEqual(cropper.rect, { x: 10, y: 10, width: 16, height: 16 });
  cropper.setRect({ x: 90, y: 60, width: 33, height: 21 });
  // 33 becomes 32, 21 becomes 20, and the box is pushed back inside the
  // picture - the picture itself is still 101 x 75, only the box is even.
  assert.deepEqual(cropper.rect, { x: 69, y: 55, width: 32, height: 20 });
  assert.equal(label(), '32 x 20');
});

test('the image resizer: any size down to eight, odd ones included', () => {
  const { cropper } = build({ minSize: 8 });
  cropper.setSource(1001, 75);
  assert.deepEqual(cropper.rect, { x: 0, y: 0, width: 1001, height: 75 });
  cropper.setRect({ x: 0, y: 0, width: 7, height: 3 });
  assert.deepEqual(cropper.rect, { x: 0, y: 0, width: 8, height: 8 });
  cropper.setRect({ x: 2, y: 2, width: 999, height: 71 });
  assert.deepEqual(cropper.rect, { x: 2, y: 2, width: 999, height: 71 });
});

test('a picture smaller than the smallest crop is cropped whole', () => {
  const { cropper } = build({ minSize: 16, evenSizes: true });
  cropper.setSource(6, 6);
  assert.deepEqual(cropper.rect, { x: 0, y: 0, width: 6, height: 6 });
});

test('a locked shape keeps the largest box of that shape where the box was', () => {
  const { cropper } = build();
  cropper.setSource(200, 100);
  cropper.setAspect(1);
  assert.deepEqual(cropper.rect, { x: 50, y: 0, width: 100, height: 100 });
  cropper.setAspect(16 / 9);
  assert.equal(cropper.aspect, 16 / 9);
  const { width, height } = cropper.rect;
  assert.equal(Math.round(width / height * 9), 16);
  cropper.maximize();
  assert.deepEqual(cropper.rect, { x: 11, y: 0, width: 178, height: 100 });
  cropper.reset();
  assert.equal(cropper.aspect, null);
  assert.deepEqual(cropper.rect, { x: 0, y: 0, width: 200, height: 100 });
});

test('centre keeps the size and moves the box to the middle', () => {
  const { cropper } = build();
  cropper.setSource(400, 300);
  cropper.setRect({ x: 0, y: 0, width: 100, height: 50 });
  cropper.centre();
  assert.deepEqual(cropper.rect, { x: 150, y: 125, width: 100, height: 50 });
});

test('nothing is applied before there is a picture', () => {
  const { cropper, seen } = build();
  cropper.setRect({ x: 1, y: 1, width: 10, height: 10 });
  assert.deepEqual(cropper.rect, { x: 0, y: 0, width: 0, height: 0 });
  assert.equal(seen.length, 0);
});
