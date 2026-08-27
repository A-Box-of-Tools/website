/**
 * tools/split-gif/src/sheet.js - the sprite-sheet geometry.
 *
 * Arithmetic rather than pixels, which is the reason it is a module of its own:
 * the drawing needs a canvas and a browser, and the part that decides how many
 * columns there are, whether the result will fit in one, and what the file is
 * called needs neither.
 *
 * The cases worth holding are the ones that are not a neat square: a prime
 * number of frames, one frame, a column count larger than the frame count, and
 * the sizes no engine will allocate.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  CAUTION_SIDE, MAX_SIDE, cellAt, sheetName, sheetPlan, suggestColumns,
} from '../../tools/split-gif/src/sheet.js';

test('the suggested grid is the squarest one that holds the frames', () => {
  assert.equal(suggestColumns(16), 4);
  assert.equal(suggestColumns(1), 1);
  // 17 does not factor into a rectangle, so the last row is short rather than
  // the grid being wrong.
  assert.equal(suggestColumns(17), 5);
  assert.equal(suggestColumns(0), 0);
});

test('a short last row is a short last row, not a smaller grid', () => {
  const plan = sheetPlan(17, 10, 10, 0);
  assert.equal(plan.columns, 5);
  assert.equal(plan.rows, 4);          // 20 cells for 17 frames
  assert.equal(plan.width, 50);
  assert.equal(plan.height, 40);
});

test('asking for more columns than there are frames gives one row', () => {
  const plan = sheetPlan(6, 32, 32, 99);
  assert.equal(plan.columns, 6);
  assert.equal(plan.rows, 1);
});

test('a column count of zero falls back to the suggestion', () => {
  assert.equal(sheetPlan(9, 8, 8, 0).columns, 3);
  assert.equal(sheetPlan(9, 8, 8, -4).columns, 3);
});

test('one frame is a one-by-one sheet the size of the frame', () => {
  const plan = sheetPlan(1, 120, 90, 0);
  assert.deepEqual(
    [plan.columns, plan.rows, plan.width, plan.height], [1, 1, 120, 90]);
  assert.equal(plan.tooBig, false);
});

test('no frames is an empty plan rather than a division by zero', () => {
  const plan = sheetPlan(0, 10, 10, 0);
  assert.equal(plan.rows, 0);
  assert.equal(plan.height, 0);
  assert.ok(Number.isFinite(plan.width));
});

test('a sheet past the universal canvas limit is refused', () => {
  // 400 frames of 500x500 in a square grid is 20 cells a side: 10000px, which
  // is allowed. Forcing it into two columns is not.
  const square = sheetPlan(400, 500, 500, 0);
  assert.equal(square.tooBig, false);
  const tall = sheetPlan(400, 500, 500, 2);
  assert.ok(tall.height > MAX_SIDE);
  assert.equal(tall.tooBig, true);
});

test('the phone warning fires below the refusal, not with it', () => {
  const plan = sheetPlan(64, 640, 640, 8);   // 5120px a side
  assert.ok(plan.width > CAUTION_SIDE);
  assert.equal(plan.risky, true);
  assert.equal(plan.tooBig, false, 'a desktop should not be stopped by this');
});

test('cells run left to right, then down', () => {
  const plan = sheetPlan(6, 16, 16, 3);
  assert.deepEqual(cellAt(0, plan, 16, 16), { x: 0, y: 0 });
  assert.deepEqual(cellAt(2, plan, 16, 16), { x: 32, y: 0 });
  assert.deepEqual(cellAt(3, plan, 16, 16), { x: 0, y: 16 });
  assert.deepEqual(cellAt(5, plan, 16, 16), { x: 32, y: 16 });
});

test('the grid is in the filename, because the image cannot carry it', () => {
  assert.equal(sheetName('walk', sheetPlan(48, 32, 32, 6)), 'walk-sheet-6x8.png');
});
