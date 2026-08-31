/**
 * tools/compare-heights/src/figures.js - the list of figures a chart can hold.
 *
 * This file used to be most of a drawing program: a toddler was built here out
 * of a table of body proportions, and the rules below checked its geometry -
 * that nothing reached above the top of its box or below the ground, that it
 * was symmetrical, that it fitted the column it was given. The toddler is gone
 * and so are they, because every figure is now artwork somebody drew, held to
 * its box by the bounding box it was measured at rather than by arithmetic
 * here. What holds THAT to the artwork is compare-heights-traced.test.js.
 *
 * What is left is the contract the rest of the tool reads: which ids exist, in
 * what order, and what each one carries.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { SHAPES, shapeOf } from '../../tools/compare-heights/src/figures.js';

test('there is a figure for every id the menu can hold, and it knows its name', () => {
  assert.deepEqual(SHAPES.map((shape) => shape.id),
                   ['man', 'woman', 'boy', 'girl', 'object']);
  for (const shape of SHAPES) {
    assert.equal(shape.label, `shape.${shape.id}`,
                 'the words live in the markup; this is only the key');
  }
});

test('every person is drawn artwork, and the rectangle is not', () => {
  for (const shape of SHAPES) {
    const drawn = shape.id !== 'object';
    assert.equal(Boolean(shape.paths), drawn, `${shape.id}: paths`);
    // `inner` is not decoration: chart.js writes a second <g> for anything that
    // has one, and it is what maps the artwork's own coordinates into the unit
    // box the chart places figures in.
    assert.equal(typeof shape.inner, drawn ? 'string' : 'object', `${shape.id}: inner`);
  }
});

test('the rectangle carries no paths, because the visitor types its shape', () => {
  assert.equal(shapeOf('object').paths, null);
  assert.ok(shapeOf('object').width > 0, 'it still needs a default aspect');
});

test('every person starts at a height, and the rectangle does not', () => {
  // A row that arrives empty is a row that draws nothing until it is filled
  // in, which is how this tool used to open: as a form rather than a chart.
  for (const shape of SHAPES) {
    if (shape.id === 'object') {
      assert.equal(shape.defaultCm, 0, 'an object arrives with its own two numbers');
      continue;
    }
    assert.ok(shape.defaultCm > 30 && shape.defaultCm < 220,
              `${shape.id}: ${shape.defaultCm} is not a height to start at`);
  }
});

test('the children start shorter than the adults', () => {
  // Not a claim about averages - the numbers are a starting point to type over
  // - but a chart whose boy opens taller than his father is one nobody would
  // trust for the two seconds before they changed it.
  const cm = Object.fromEntries(SHAPES.map((shape) => [shape.id, shape.defaultCm]));
  assert.ok(cm.man > cm.woman, 'the two adults differ');
  assert.ok(cm.woman > cm.boy && cm.woman > cm.girl, 'the children are the shorter pair');
});

test('an id nobody has falls back rather than throwing', () => {
  // It can only come from a stale menu, and a chart drawn with one figure
  // wrong is more use than a page that stops.
  assert.equal(shapeOf('toddler').id, 'man');
  assert.equal(shapeOf(undefined).id, 'man');
});
