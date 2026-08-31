/**
 * tools/compare-heights/src/traced.js against tools/compare-heights/vendor/.
 *
 * Four of the five figures are somebody else's artwork. The files in vendor/
 * are theirs as they were published, which is what makes the claim checkable;
 * traced.js holds the path data again, because a chart is one self-contained
 * SVG and the geometry has to be inside it rather than fetched.
 *
 * Two copies of anything drift. This is the test that stops them. Three of the
 * four are compared character for character. The fourth - the man - ships
 * smoothed, so it is not compared but RE-DERIVED: the same function that made
 * him is run over the vendored original here, and if the answer is not what
 * traced.js carries then either the artwork moved, the smoothing changed, or
 * somebody edited the output by hand. All three are worth stopping for.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { TRACED } from '../../tools/compare-heights/src/traced.js';
import { smoothOutline } from '../../scripts/smooth-outline.mjs';

const bytesOf = (name) => readFileSync(
  fileURLToPath(new URL(`../../tools/compare-heights/vendor/${name}`, import.meta.url)),
);

const vendor = (name) => bytesOf(name).toString('utf8');

/**
 * Every path element's `d`, in document order.
 *
 * The namespace prefix is optional because one of the four is published as
 * `<ns0:svg><ns0:path>`, which is valid SVG and would otherwise be read as a
 * file with no paths in it at all.
 */
const pathsOf = (svg) => [...svg.matchAll(/<(?:\w+:)?path\b[^>]*?\sd="([^"]+)"/g)]
  .map((m) => m[1]);

test('there are four drawn figures, in the order the menu offers them', () => {
  assert.deepEqual(Object.keys(TRACED), ['man', 'woman', 'boy', 'girl']);
});

test('the vendored files are the ones traced.js was written against', () => {
  // A digest rather than a spot check on the markup: "as published" is the
  // whole claim these files exist to support, and only a hash says it without
  // leaving room to be nearly true. A failure means somebody reformatted,
  // minified or re-exported one of them - or upstream moved, which is worth
  // stopping for either way.
  for (const art of Object.values(TRACED)) {
    const bytes = bytesOf(art.source);
    assert.equal(bytes.length, art.bytes, `${art.source} has changed length`);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), art.sha256,
                 `${art.source} is not the file traced.js was written against`);
    assert.ok(!bytes.includes(13), `${art.source} has a carriage return in it`);
  }
});

test('an unsmoothed figure is the vendored file, character for character', () => {
  for (const [id, art] of Object.entries(TRACED)) {
    if (art.smoothed) continue;
    assert.deepEqual(art.paths, pathsOf(vendor(art.source)),
                     `${id} has drifted from ${art.source}`);
  }
});

test('the smoothed man is what the smoother makes of the vendored man', () => {
  const art = TRACED.man;
  assert.equal(art.smoothed, true, 'the man is the one that ships smoothed');

  const published = pathsOf(vendor(art.source));
  assert.equal(published.length, 1, 'the original is one path');

  const again = smoothOutline(published[0]);
  assert.deepEqual(art.paths, again,
                   'traced.js is not what scripts/smooth-outline.mjs produces from vendor/');
});

test('smoothing keeps the man the shape he was', () => {
  // The point of the smoothing is to lose the tracing chatter, not the man.
  // Both of these would have caught the settings being turned up too far.
  const art = TRACED.man;
  const original = pathsOf(vendor(art.source))[0];
  assert.ok(art.paths.join('').length < original.length * 0.6,
            'the smoothed path should be markedly shorter than the trace');
  assert.equal(art.paths.length, 1,
               'fifteen specks of stray ink go, and the man stays');
});

test('a drawn figure carries the transform that puts it in the unit box', () => {
  for (const [id, art] of Object.entries(TRACED)) {
    const match = /^scale\(([\d.e-]+)\) translate\((-?[\d.e-]+) (-?[\d.e-]+)\)$/.exec(art.inner);
    assert.ok(match, `${id}: inner is not a scale and a translate: ${art.inner}`);

    const scale = Number(match[1]);
    // One over the artwork's own height, so a drawing a few hundred units tall
    // lands one unit tall. Anything near 1 would mean the box was measured in
    // the unit box it was supposed to be mapped out of.
    assert.ok(scale > 0 && scale < 0.1, `${id}: implausible scale ${scale}`);
  }
});

test('every drawn figure is a plausible width for the person it is', () => {
  for (const [id, art] of Object.entries(TRACED)) {
    assert.ok(art.width > 0.25 && art.width < 0.55,
              `${id}: width ${art.width} is not a standing person`);
  }
  // The children are drawn with their hands on their hips and the adults with
  // their arms down, so the children are the wider pair. If that ever flips,
  // somebody has swapped a figure for one in a different pose and the chart's
  // columns will be sized for the wrong thing.
  const { man, woman, boy, girl } = TRACED;
  assert.ok(boy.width > man.width && girl.width > woman.width,
            'the children should be the wider pair');
});
