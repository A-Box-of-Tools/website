/**
 * tools/document-scanner/src/geometry.js - the shape of the straightened page.
 *
 * The risk this file covers is not a crash. It is a scan that comes out looking
 * perfectly good and is the wrong shape: an A4 page a tenth too wide, every line
 * of text slightly the wrong height, and nothing on screen to say so. That
 * happens whenever the aspect ratio is measured off the edges of a photograph
 * taken at an angle, which is what the obvious method does and what most web
 * scanners do.
 *
 * So the fixture here is a camera. A rectangle of known size is placed in front
 * of a pinhole of known focal length, turned to a known angle, and projected -
 * and every assertion is about how close the recovered shape is to the rectangle
 * that was actually photographed. The tolerances are in per cent of the true
 * ratio, because that is the unit the failure is in: one per cent on A4 is three
 * millimetres of page.
 *
 * The awkward cases matter more than the easy one:
 *
 *   - the square-on photograph, where the perspective method has nothing to work
 *     with, cannot answer, and must not be allowed to answer badly;
 *   - the nearly square-on photograph with a few pixels of noise in its corners,
 *     which is where the arithmetic misbehaves spectacularly rather than gently;
 *   - a page that is genuinely not a standard sheet, which has to come back as
 *     itself rather than being rounded to A4.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  edgeAspect, homography, isConvex, orderCorners, outputSize, pageAspect,
  perspectiveAspect, project, quadArea, sharpestCorner, wholeFrame,
} from '../../tools/document-scanner/src/geometry.js';
import {
  coverage, matchPaper, outName, pageName, ratioText, scanQuality, sizeText, stemOf,
} from '../../tools/document-scanner/src/pages.js';

/* ------------------------------------------------------------- the camera */

const rotateX = (p, a) => [
  p[0],
  p[1] * Math.cos(a) - p[2] * Math.sin(a),
  p[1] * Math.sin(a) + p[2] * Math.cos(a),
];
const rotateY = (p, a) => [
  p[0] * Math.cos(a) + p[2] * Math.sin(a),
  p[1],
  -p[0] * Math.sin(a) + p[2] * Math.cos(a),
];
const rotateZ = (p, a) => [
  p[0] * Math.cos(a) - p[1] * Math.sin(a),
  p[0] * Math.sin(a) + p[1] * Math.cos(a),
  p[2],
];

/**
 * Photograph a rectangle.
 *
 * An ordinary pinhole: the corners are placed on a plane in front of the camera,
 * the plane is tilted and panned and possibly rolled, and each corner is divided
 * by its own depth. That division is the entire subject of this file - it is
 * what makes the far edge shorter than the near one, and undoing it is what the
 * tool does.
 *
 * @returns the four corners in image pixels, in TL, TR, BR, BL order
 */
function photograph({
  mm = [210, 297], tilt = 0, pan = 0, roll = 0, distance = 600, focal = 3000,
  width = 4000, height = 3000,
} = {}) {
  const [w, h] = mm;
  return [[-w / 2, -h / 2, 0], [w / 2, -h / 2, 0], [w / 2, h / 2, 0], [-w / 2, h / 2, 0]]
    .map((corner) => {
      const turned = rotateZ(rotateY(rotateX(corner, tilt), pan), roll);
      const z = turned[2] + distance;
      return { x: (focal * turned[0]) / z + width / 2, y: (focal * turned[1]) / z + height / 2 };
    });
}

/** How far out an aspect ratio is, as a percentage of the true one. */
const outBy = (got, truth) => Math.abs(got / truth - 1) * 100;

/* -------------------------------------------------------- ordering corners */

test('orderCorners: any four points come back top left first, clockwise', () => {
  const quad = [{ x: 10, y: 12 }, { x: 90, y: 20 }, { x: 84, y: 70 }, { x: 6, y: 64 }];

  for (const shift of [0, 1, 2, 3]) {
    const shuffled = [0, 1, 2, 3].map((i) => quad[(i + shift) % 4]);
    assert.deepEqual(orderCorners(shuffled), quad, `rotated by ${shift}`);
  }
  // And backwards, which is the case that matters: dragging one corner past
  // another reverses the winding, and a quad wound the other way would be
  // resampled inside out.
  assert.deepEqual(orderCorners([...quad].reverse()), quad);
});

test('orderCorners: a quad turned a quarter turn is relabelled, not refused', () => {
  // What "turn the page" does: the same four points, one place along. The corner
  // that was bottom left becomes top left, and nothing else in the tool has to
  // know that a rotation happened.
  const quad = [{ x: 10, y: 10 }, { x: 90, y: 10 }, { x: 90, y: 60 }, { x: 10, y: 60 }];
  const turned = orderCorners([quad[3], quad[0], quad[1], quad[2]]);
  assert.deepEqual(turned, quad);
});

test('isConvex and sharpestCorner: a bow tie and a sliver are both refused', () => {
  const page = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 60 }, { x: 0, y: 60 }];
  assert.ok(isConvex(page));
  assert.ok(sharpestCorner(page) > 89);

  // Two edges crossing: the shape a candidate takes when two of its four lines
  // were the same side of the page found twice.
  const crossed = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 0, y: 60 }, { x: 100, y: 60 }];
  assert.ok(!isConvex(crossed));

  // Three edges of something else and one line that happened to cross them.
  const sliver = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 10, y: 8 }, { x: 0, y: 30 }];
  assert.ok(sharpestCorner(sliver) < 20);
});

test('quadArea: the shoelace agrees with the rectangle it is given', () => {
  assert.equal(quadArea(wholeFrame(640, 480)), 640 * 480);
});

/* --------------------------------------------------------- the homography */

test('homography: the four points it was built from land exactly', () => {
  const quad = photograph({ tilt: 0.5, pan: 0.3 });
  const flat = [{ x: 0, y: 0 }, { x: 800, y: 0 }, { x: 800, y: 1131 }, { x: 0, y: 1131 }];
  const h = homography(flat, quad);

  flat.forEach((corner, index) => {
    const landed = project(h, corner.x, corner.y);
    assert.ok(Math.hypot(landed.x - quad[index].x, landed.y - quad[index].y) < 1e-6);
  });
});

test('homography: it keeps straight lines straight', () => {
  // The property the whole resample rests on, and the one a triangle-by-triangle
  // affine warp does not have: the middle of an edge has to land on the middle
  // of the edge it maps to, not off to one side of it.
  const quad = photograph({ tilt: 0.6, pan: 0.25 });
  const flat = [{ x: 0, y: 0 }, { x: 800, y: 0 }, { x: 800, y: 1131 }, { x: 0, y: 1131 }];
  const h = homography(flat, quad);

  const a = project(h, 0, 0);
  const b = project(h, 800, 1131);
  const middle = project(h, 400, 565.5);
  const cross = (b.x - a.x) * (middle.y - a.y) - (b.y - a.y) * (middle.x - a.x);
  assert.ok(Math.abs(cross) / Math.hypot(b.x - a.x, b.y - a.y) < 1e-6);
});

test('homography: three points in a line have no answer, and it says so', () => {
  const degenerate = [
    { x: 0, y: 0 }, { x: 10, y: 10 }, { x: 20, y: 20 }, { x: 5, y: 40 },
  ];
  assert.equal(homography(degenerate, wholeFrame(100, 100)), null);
});

/* ------------------------------------------------------- the page's shape */

test('perspectiveAspect: an angled photo of A4 gives back A4, and the focal length', () => {
  const quad = photograph({ tilt: 0.61, pan: 0.2, focal: 3000 });
  const solved = perspectiveAspect(quad, 4000, 3000);

  assert.ok(solved, 'a photograph with perspective in it must have an answer');
  assert.ok(outBy(solved.aspect, 210 / 297) < 0.5,
    `recovered ${solved.aspect.toFixed(4)}, wanted ${(210 / 297).toFixed(4)}`);
  // The focal length falls out of the same solve, and getting it right is the
  // reason to believe the aspect ratio rather than merely to accept it.
  assert.ok(Math.abs(solved.focal / 3000 - 1) < 0.02);
});

test('perspectiveAspect: measuring the edges instead would be a third out', () => {
  // The number this whole method exists for. If this assertion ever fails
  // because the edge estimate got good, the perspective solve has stopped being
  // worth its thirty lines.
  const quad = photograph({ tilt: 0.61, pan: 0.2 });
  assert.ok(outBy(edgeAspect(quad), 210 / 297) > 20,
    'an angled photograph is meant to foreshorten badly');
});

test('perspectiveAspect: four shapes, four angles, all within a per cent', () => {
  const cases = [
    { name: 'A4 portrait', mm: [210, 297], tilt: 0.4, pan: 0.35, roll: 0.3 },
    { name: 'Letter landscape', mm: [279.4, 215.9], tilt: 0.1, pan: 0.5, focal: 2600 },
    { name: 'a long receipt', mm: [80, 300], tilt: 0.5, pan: 0.3, distance: 400 },
    { name: 'a business card', mm: [85.6, 53.98], tilt: 0.45, pan: 0.25, distance: 250 },
  ];

  for (const item of cases) {
    const quad = photograph(item);
    const got = pageAspect(quad, 4000, 3000);
    assert.equal(got.method, 'perspective', `${item.name}: fell back to the edges`);
    assert.ok(outBy(got.aspect, item.mm[0] / item.mm[1]) < 1,
      `${item.name}: ${outBy(got.aspect, item.mm[0] / item.mm[1]).toFixed(1)}% out`);
  }
});

test('pageAspect: a square-on photo falls back to the edges, which are exact', () => {
  // The affine case. There is no perspective information in the picture, the
  // solve divides by something that has gone to zero, and the honest answer is
  // the one the edges already give - which is right to the pixel here.
  const quad = photograph({ tilt: 0, pan: 0 });
  assert.equal(perspectiveAspect(quad, 4000, 3000), null);

  const got = pageAspect(quad, 4000, 3000);
  assert.equal(got.method, 'edges');
  assert.ok(outBy(got.aspect, 210 / 297) < 0.1);
});

test('pageAspect: noise on a nearly square-on photo cannot run away with it', () => {
  // Where an unguarded solve misbehaves: at almost no tilt the numerator and the
  // denominator both approach zero, so a couple of pixels of corner noise can
  // move the answer by a third. The check against the edges is what bounds it,
  // and the bound has to hold for every draw rather than on average.
  let random = 20260825;
  const next = () => {
    random = (random * 1664525 + 1013904223) >>> 0;
    return random / 4294967296 - 0.5;
  };

  for (let run = 0; run < 300; run += 1) {
    const quad = photograph({ tilt: 0.04, pan: 0.01 })
      .map((corner) => ({ x: corner.x + next() * 6, y: corner.y + next() * 6 }));
    const got = pageAspect(quad, 4000, 3000);
    assert.ok(outBy(got.aspect, 210 / 297) < 10,
      `run ${run}: ${outBy(got.aspect, 210 / 297).toFixed(1)}% out via ${got.method}`);
  }
});

test('pageAspect: nothing is ever straightened to a shape no page has', () => {
  const sliver = [
    { x: 0, y: 0 }, { x: 4000, y: 0 }, { x: 4000, y: 20 }, { x: 0, y: 20 },
  ];
  const got = pageAspect(sliver, 4000, 3000);
  assert.ok(got.aspect <= 6 && got.aspect >= 1 / 6);
});

/* ----------------------------------------------------------- output sizes */

test('outputSize: no direction is ever resampled below what it arrived with', () => {
  // The near edge of a page photographed at an angle is longer than the far one,
  // and it is the near edge - the sharp, detailed one - that must not be thrown
  // away.
  const quad = photograph({ tilt: 0.7, pan: 0.2 });
  const size = outputSize(quad, 210 / 297, 0);
  const longestAcross = Math.max(
    Math.hypot(quad[1].x - quad[0].x, quad[1].y - quad[0].y),
    Math.hypot(quad[2].x - quad[3].x, quad[2].y - quad[3].y),
  );

  assert.ok(size.width >= Math.floor(longestAcross));
  assert.ok(Math.abs(size.width / size.height - 210 / 297) < 0.005);
});

test('outputSize: the ceiling applies to the long side and keeps the shape', () => {
  // Photographed close, so the page really is bigger than the ceiling: the
  // ceiling only ever shrinks, because enlarging a scan invents detail.
  const quad = photograph({ tilt: 0.3, pan: 0.1, distance: 340, focal: 3400 });
  const size = outputSize(quad, 210 / 297, 2400);
  assert.equal(Math.max(size.width, size.height), 2400);
  assert.ok(Math.abs(size.width / size.height - 210 / 297) < 0.005);
});

/* ------------------------------------------------------------- the labels */

test('matchPaper: A4, Letter and Legal are told apart, either way up', () => {
  assert.equal(matchPaper(210 / 297).key, 'paper.a');
  assert.equal(matchPaper(210 / 297).landscape, false);
  assert.equal(matchPaper(297 / 210).key, 'paper.a');
  assert.equal(matchPaper(297 / 210).landscape, true);

  // A5 is the same shape as A4 by construction - halving an A sheet gives
  // another A sheet - so the label says "A4 or A5" and this is why.
  assert.equal(matchPaper(148 / 210).key, 'paper.a');

  assert.equal(matchPaper(215.9 / 279.4).key, 'paper.letter');
  assert.equal(matchPaper(215.9 / 355.6).key, 'paper.legal');
  assert.equal(matchPaper(85.6 / 53.98).key, 'paper.card');
});

test('matchPaper: Letter is not called A4, and a receipt is not called anything', () => {
  // Letter and A4 are 9% apart in shape, which is close enough that a sloppy
  // tolerance would label every American page A4.
  assert.notEqual(matchPaper(215.9 / 279.4).key, 'paper.a');
  assert.equal(matchPaper(80 / 300), null);
  assert.equal(matchPaper(1), null);
});

test('scanQuality: dots per inch are measured across the real page', () => {
  // 2480 pixels across A4 is 300 dpi, which is what an office scanner is set to.
  const good = scanQuality(2480, 210 / 297);
  assert.equal(good.key, 'quality.good');
  assert.ok(Math.abs(good.dpi - 300) <= 1);

  const soft = scanQuality(900, 210 / 297);
  assert.equal(soft.key, 'quality.low');

  // Nothing to measure against, so nothing is claimed.
  assert.equal(scanQuality(2000, 80 / 300), null);
});

test('coverage: the share of the frame a page filled', () => {
  const half = [{ x: 0, y: 0 }, { x: 320, y: 0 }, { x: 320, y: 480 }, { x: 0, y: 480 }];
  assert.ok(Math.abs(coverage(half, 640, 480) - 0.5) < 1e-9);
});

test('names: the file is named after the photograph, and pages sort', () => {
  assert.equal(stemOf('IMG_4021.HEIC'), 'IMG_4021');
  assert.equal(outName(stemOf('lease.jpg'), 'pdf'), 'lease-scan.pdf');
  // Ten pages have to sort as ten pages in a file manager, which means padding.
  assert.equal(pageName('lease', 0, 10, 'png'), 'lease-page-01.png');
  assert.equal(pageName('lease', 9, 10, 'png'), 'lease-page-10.png');
  assert.equal(outName('a/b:c', 'zip'), 'a-b-c-scan.zip');
});

test('sizeText and ratioText: the units a person would say', () => {
  assert.equal(sizeText(900), '900 B');
  assert.equal(sizeText(2048), '2.0 kB');
  assert.equal(sizeText(300 * 1024), '300 kB');
  assert.equal(sizeText(3 * 1024 * 1024), '3.0 MB');
  assert.equal(ratioText(210 / 297), '1:1.41');
  assert.equal(ratioText(297 / 210), '1:1.41');
});
