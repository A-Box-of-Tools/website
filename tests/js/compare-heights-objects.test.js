/**
 * tools/compare-heights/src/objects.js - the drawings behind the object presets.
 *
 * Two things are being held down here, and only one of them is code.
 *
 * The first is the LICENCE RULE. The four people are public domain because a
 * chart is downloaded and passed on, and a licence that asks something of a
 * reproduction asks it of the visitor. The objects are allowed to be MIT and
 * Apache-2.0, whose conditions attach to the icon set rather than to a picture
 * drawn with it. Nothing here may be CC BY or share-alike, and that is not a
 * comment - it is the assertion below, so a drawing added next year has to
 * answer the question before it can ship.
 *
 * The second is the STRETCH. An object is fitted to the height and the width
 * the visitor typed, unlike a person, who keeps the proportions they were drawn
 * with. That is the difference between the two kinds of figure the chart draws,
 * it lives in one flag and one transform, and it is worth a test because a
 * chart that quietly narrowed somebody's door would still look fine.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { OBJECTS } from '../../tools/compare-heights/src/objects.js';
import { objectShape, shapeOf } from '../../tools/compare-heights/src/figures.js';

const IDS = Object.keys(OBJECTS);

test('every drawing says where it came from and what it is worth', () => {
  assert.ok(IDS.length >= 16, `only ${IDS.length} objects`);
  for (const [id, art] of Object.entries(OBJECTS)) {
    assert.match(art.source, /^[a-z0-9-]+\.svg$/, `${id}: source`);
    assert.match(art.sha256, /^[0-9a-f]{64}$/, `${id}: sha256`);
    assert.ok(art.bytes > 0, `${id}: bytes`);
    assert.ok(art.markup.startsWith('<g'), `${id}: markup`);
    for (const side of ['x', 'y', 'width', 'height']) {
      assert.equal(typeof art.box[side], 'number', `${id}: box.${side}`);
    }
    assert.ok(art.box.width > 0 && art.box.height > 0, `${id}: box has no size`);
  }
});

test('nothing here is under a licence that would follow the chart out', () => {
  // CC BY and share-alike ask something of a reproduction, and a downloaded
  // chart is one. MIT and Apache-2.0 ask it of the icon set, which
  // vendor/objects/ carries. That is the whole line, and it is drawn here.
  const ALLOWED = new Set(['MIT', 'Apache-2.0', 'CC0', 'Public domain']);
  for (const [id, art] of Object.entries(OBJECTS)) {
    assert.ok(ALLOWED.has(art.licence), `${id}: ${art.licence} is not on the list`);
    assert.doesNotMatch(art.licence, /\bBY\b|share.?alike|\bSA\b|NC\b/i,
                        `${id}: ${art.licence}`);
  }
});

test('the markup is shapes and nothing else, the way an upload would be', () => {
  // src/import-svg.js produced all of it, so this is really a check that
  // nobody has since pasted a file in by hand.
  for (const [id, art] of Object.entries(OBJECTS)) {
    for (const bad of ['<script', '<image', '<use', '<style', 'foreignObject',
                       'href', 'url(', ' id=', ' class=', ' fill=', 'onload']) {
      assert.ok(!art.markup.includes(bad), `${id}: markup carries ${bad}`);
    }
    assert.match(art.markup, /<(g|path)[ >]/, `${id}: nothing drawable`);
  }
});

test('an object shape is the rectangle with a drawing in it', () => {
  const door = objectShape('door');
  assert.equal(door.id, 'object', 'it is still the object row, width box and all');
  assert.equal(door.label, 'shape.object');
  assert.equal(door.stretch, true, 'which is what makes chart.js scale both axes');
  assert.equal(door.markup, OBJECTS.door.markup);
  assert.equal(door.paths, null, 'the drawing arrives as markup, not as a path list');
  assert.equal(door.defaultCm, 0, 'a preset brings its own height');
});

test('an id nobody knows falls back to the plain rectangle', () => {
  // A stale option or a typo in body.html should cost the drawing, not the row.
  const unknown = objectShape('teapot');
  assert.equal(unknown.id, 'object');
  assert.equal(unknown.markup, null);
  assert.equal(unknown, shapeOf('object'));
});

test('the transform maps the drawing onto the unit square', () => {
  // The chart writes translate(centre top) scale(width height) around this, so
  // `inner` has to leave the drawing spanning x -0.5..0.5 and y 0..1 whatever
  // coordinates its author used. Two of these boxes have negative y - Material
  // Symbols draws in a 0 -960 960 960 viewBox - which is exactly the case that
  // would break a transform written for the four people.
  for (const id of IDS) {
    const { box } = OBJECTS[id];
    const shape = objectShape(id);
    const [, sx, sy] = shape.inner.match(/scale\(([-\d.e]+) ([-\d.e]+)\)/).map(Number);
    const [, tx, ty] = shape.inner.match(/translate\(([-\d.e]+) ([-\d.e]+)\)/).map(Number);
    const at = (px, py) => [(px + tx) * sx, (py + ty) * sy];

    const [left, top] = at(box.x, box.y);
    const [right, bottom] = at(box.x + box.width, box.y + box.height);
    assert.ok(Math.abs(left + 0.5) < 1e-9, `${id}: left edge at ${left}`);
    assert.ok(Math.abs(right - 0.5) < 1e-9, `${id}: right edge at ${right}`);
    assert.ok(Math.abs(top) < 1e-9, `${id}: top at ${top}`);
    assert.ok(Math.abs(bottom - 1) < 1e-9, `${id}: ground at ${bottom}`);
  }
});

test('width is the drawing\'s own, for the column sizing that still asks', () => {
  for (const id of IDS) {
    const { box } = OBJECTS[id];
    assert.equal(objectShape(id).width, box.width / box.height, id);
  }
});
