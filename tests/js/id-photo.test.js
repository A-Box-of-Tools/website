/**
 * tools/id-photo/src/{specs,geometry,sheet,background,jpeg,files}.js.
 *
 * The risk in this tool is not that it throws. It is that it hands somebody a
 * photograph which looks right, is 35 x 45 mm, and has the head two millimetres
 * too large - and the first anybody hears of it is a letter six weeks later. So
 * the tests here are about the arithmetic that decides those millimetres, and
 * about the two byte-level edits that a canvas cannot make:
 *
 *   - the rulebook itself: every published band has to be a band, in range, and
 *     the millimetres written in it have to agree with the fractions derived
 *     from them. A transcription error is the one bug in this tool that no
 *     amount of correct code would catch.
 *   - the fit: four marked points in, one crop rectangle out, with the head
 *     height and the eye line landing where the specification says. Measured
 *     back out again afterwards, because the page shows the measurement and the
 *     measurement is what somebody trusts.
 *   - the sheet: nothing scaled to fit, nothing off the paper, and no cut mark
 *     drawn across a photograph.
 *   - the JPEG header: the resolution written where a print shop reads it, and
 *     the padding that brings a too-small upload up to a portal's floor without
 *     touching a pixel of the picture.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  BACKGROUNDS, ICAO_EYE, ICAO_HEAD, SPECS, backgroundOf, pixelLabel, portalBytes,
  portalPixels, printLabel, specById, specsByCountry, trim, withCustom,
} from '../../tools/id-photo/src/specs.js';
import {
  checkBand, containIn, faceOf, fitFrame, frameAspect, guideLines, measure,
  mmToPx, passes, printPixels, pxToMm, resampling,
} from '../../tools/id-photo/src/geometry.js';
import {
  PAPERS, bestSheet, describeSheet, paperById, planSheet,
} from '../../tools/id-photo/src/sheet.js';
import {
  checkBackground, checkSignature, deltaE, hexToRgb, inBackgroundZone,
  readBackground, readSignature, rgbToHex, rgbToLab,
} from '../../tools/id-photo/src/background.js';
import {
  headerSegments, isJpeg, padTo, readComments, readDensity, setDensity,
} from '../../tools/id-photo/src/jpeg.js';
import {
  bandText, centreText, outName, percent, readyText, resamplingText, statusClass,
  stemOf, tiltText, verdictText,
} from '../../tools/id-photo/src/files.js';

import { JFIF_SEGMENT, ascii, concat, jpeg, segment } from './helpers.js';

/* ================================================================ the rules */

test('specs: every entry can be cropped to and is describable', () => {
  for (const spec of SPECS) {
    assert.ok(spec.print || spec.digital, `${spec.id} has neither a print size nor a pixel size`);
    assert.ok(frameAspect(spec) > 0, `${spec.id} has no usable shape`);
    assert.ok(spec.notes.length > 0, `${spec.id} says nothing about itself`);
    assert.ok(spec.source.authority, `${spec.id} names no authority`);
    assert.ok(BACKGROUNDS[spec.background], `${spec.id} wants a background that does not exist`);
    assert.ok(printLabel(spec).length > 0);
  }
});

test('specs: every band is a band, and inside the frame', () => {
  for (const spec of SPECS) {
    for (const [name, band] of [['head', spec.head], ['eye', spec.eye]]) {
      assert.ok(band.min < band.max, `${spec.id}: ${name} min is not below max`);
      assert.ok(band.min >= 0 && band.max <= 1, `${spec.id}: ${name} band leaves the frame`);
    }
  }
});

test('specs: the millimetres and the fractions agree', () => {
  // The table writes the published figure in millimetres and derives the
  // fraction. If those two ever disagreed, the page would show one number and
  // the crop would use another - which is exactly the failure nobody notices.
  for (const spec of SPECS) {
    if (!spec.print) continue;
    for (const band of [spec.head, spec.eye]) {
      if (band.minMm === undefined) continue;
      assert.ok(Math.abs(band.min * spec.print.heightMm - band.minMm) < 1e-9);
      assert.ok(Math.abs(band.max * spec.print.heightMm - band.maxMm) < 1e-9);
    }
  }
});

test('specs: the ICAO geometry is the one Doc 9303 publishes', () => {
  assert.deepEqual([ICAO_HEAD.min, ICAO_HEAD.max], [0.70, 0.80]);
  assert.deepEqual([ICAO_EYE.min, ICAO_EYE.max], [0.50, 0.60]);
  const icao = specById('icao');
  assert.equal(icao.print.widthMm, 35);
  assert.equal(icao.print.heightMm, 45);
});

test('specs: the two Indian form rules are the ones the notices state', () => {
  const photo = specById('in-exam-photo');
  assert.deepEqual(portalPixels(photo), { width: 200, height: 230 });
  assert.deepEqual(portalBytes(photo), { min: 20 * 1024, max: 50 * 1024 });

  const signature = specById('in-exam-signature');
  assert.equal(signature.kind, 'signature');
  assert.deepEqual(portalPixels(signature), { width: 140, height: 60 });
  assert.deepEqual(portalBytes(signature), { min: 10 * 1024, max: 20 * 1024 });
});

test('portalPixels: a range is written at its smallest allowed size', () => {
  // Every pixel over the minimum is bytes spent fighting the file-size ceiling
  // for detail nobody looks at on a form.
  assert.deepEqual(portalPixels(specById('us-passport')), { width: 600, height: 600 });
  assert.deepEqual(portalPixels(specById('uk-passport')), { width: 600, height: 750 });
  assert.equal(portalPixels(specById('schengen')), null);
});

test('portalBytes: an unstated end is not a limit', () => {
  const bytes = portalBytes(specById('icao'));
  assert.equal(bytes.min, 0);
  assert.equal(bytes.max, Infinity);
});

test('pixelLabel: says which kind of rule it is', () => {
  assert.match(pixelLabel(specById('us-dv')), /exactly 600 x 600/);
  assert.match(pixelLabel(specById('uk-passport')), /at least 600 x 750/);
  assert.equal(pixelLabel(specById('schengen')), null);
});

test('specsByCountry: groups without losing or duplicating anything', () => {
  const groups = specsByCountry();
  const flat = groups.flatMap((group) => group.specs.map((spec) => spec.id));
  assert.deepEqual(flat, SPECS.map((spec) => spec.id));
  assert.equal(new Set(groups.map((group) => group.country)).size, groups.length);
});

test('withCustom: applies the typed figures and never writes into the table', () => {
  const before = structuredClone(specById('custom'));
  const custom = withCustom(specById('custom'), {
    widthMm: '50', heightMm: '70', dpi: '600',
    headMinMm: '31', headMaxMm: '36',
    background: 'white', pxWidth: '420', pxHeight: '540',
    minKb: '10', maxKb: '400',
  });

  assert.deepEqual(custom.print, { widthMm: 50, heightMm: 70, dpi: 600 });
  assert.equal(custom.head.minMm, 31);
  assert.ok(Math.abs(custom.head.min - 31 / 70) < 1e-9);
  assert.deepEqual(portalPixels(custom), { width: 420, height: 540 });
  assert.deepEqual(portalBytes(custom), { min: 10240, max: 409600 });
  assert.deepEqual(specById('custom'), before, 'the rulebook was mutated');
});

test('withCustom: a head band typed backwards is read the right way round', () => {
  const custom = withCustom(specById('custom'), { headMinMm: '36', headMaxMm: '31' });
  assert.ok(custom.head.min < custom.head.max);
});

test('backgroundOf: every named colour parses to a real one', () => {
  for (const spec of SPECS) {
    const background = backgroundOf(spec);
    assert.match(background.hex, /^#[0-9a-f]{6}$/);
    assert.ok(background.tolerance > 0);
  }
});

/* ================================================================= the fit */

/** A 35 x 45 photograph at 300 dpi, which is what most of these are about. */
const UK = specById('uk-passport');

/** A synthetic face on a 2000 x 3000 phone photograph. */
const FACE = {
  crown: { x: 1000, y: 700 },
  chin: { x: 1000, y: 1500 },
  leftEye: { x: 930, y: 1000 },
  rightEye: { x: 1070, y: 1000 },
};
const SOURCE = { width: 2000, height: 3000 };

test('mmToPx: 35 mm at 300 dpi is 413 pixels and back again', () => {
  assert.ok(Math.abs(mmToPx(25.4, 300) - 300) < 1e-9);
  assert.equal(Math.round(mmToPx(35, 300)), 413);
  assert.ok(Math.abs(pxToMm(mmToPx(45, 600), 600) - 45) < 1e-9);
});

test('printPixels: the published DPI is a floor, not a preference', () => {
  assert.deepEqual(printPixels(UK, 300), { width: 413, height: 531, dpi: 300 });
  assert.deepEqual(printPixels(UK, 600), { width: 827, height: 1063, dpi: 600 });
  // Asked for less than the rule states, the rule wins.
  assert.equal(printPixels(UK, 150).dpi, 300);
  assert.equal(printPixels(UK, 0).dpi, 300);
  assert.equal(printPixels(specById('in-exam-photo'), 300), null);
});

test('faceOf: the eye line and the centre come from the pupils', () => {
  const face = faceOf(FACE);
  assert.equal(face.eyeY, 1000);
  assert.equal(face.centreX, 1000);
  assert.equal(face.headPx, 800);
  assert.equal(face.eyeSpacing, 140);
  assert.equal(face.tilt, 0);
});

test('faceOf: a tilted head is reported and is signed', () => {
  const tilted = faceOf({ ...FACE, rightEye: { x: 1070, y: 1014 } });
  assert.ok(tilted.tilt > 5 && tilted.tilt < 6, `${tilted.tilt}`);
  const other = faceOf({ ...FACE, rightEye: { x: 1070, y: 986 } });
  assert.ok(other.tilt < -5);
});

test('fitFrame: the head and the eye line land in the middle of both bands', () => {
  const { rect, short } = fitFrame(FACE, UK, SOURCE);
  const metrics = measure(rect, FACE, UK);

  const headMid = (UK.head.min + UK.head.max) / 2;
  const eyeMid = (UK.eye.min + UK.eye.max) / 2;
  assert.ok(Math.abs(metrics.head.value - headMid) < 0.005, `head ${metrics.head.value}`);
  assert.ok(Math.abs(metrics.eye.value - eyeMid) < 0.005, `eye ${metrics.eye.value}`);
  assert.ok(passes(metrics));
  assert.deepEqual(short, { top: 0, bottom: 0, left: 0, right: 0 });
});

test('fitFrame: the box keeps the specification\'s shape, whatever the picture is', () => {
  for (const spec of SPECS) {
    const { rect } = fitFrame(FACE, spec, SOURCE);
    const aspect = frameAspect(spec);
    assert.ok(Math.abs(rect.width / rect.height - aspect) < 0.01, `${spec.id} came out ${rect.width}x${rect.height}`);
  }
});

test('fitFrame: the box never leaves the photograph', () => {
  // A face marked hard against the top left corner: the ideal crop would start
  // outside the picture, and the answer is a box inside it plus a report of how
  // much was missing - not a rectangle with negative coordinates.
  const corner = {
    crown: { x: 60, y: 10 }, chin: { x: 60, y: 400 },
    leftEye: { x: 30, y: 150 }, rightEye: { x: 90, y: 150 },
  };
  const { rect, short } = fitFrame(corner, UK, SOURCE);
  assert.ok(rect.x >= 0 && rect.y >= 0);
  assert.ok(rect.x + rect.width <= SOURCE.width);
  assert.ok(rect.y + rect.height <= SOURCE.height);
  assert.ok(short.top > 0, 'the missing headroom was not reported');
});

test('fitFrame: a face too large for the frame shrinks the box rather than overflowing', () => {
  const small = { width: 400, height: 500 };
  const big = {
    crown: { x: 200, y: 20 }, chin: { x: 200, y: 470 },
    leftEye: { x: 160, y: 180 }, rightEye: { x: 240, y: 180 },
  };
  const { rect } = fitFrame(big, UK, small);
  assert.ok(rect.width <= small.width && rect.height <= small.height);
});

test('measure: the same box measured twice says the same thing', () => {
  const { rect } = fitFrame(FACE, UK, SOURCE);
  assert.deepEqual(measure(rect, FACE, UK), measure({ ...rect }, FACE, UK));
});

test('measure: the eye line is measured up from the bottom', () => {
  // Sixty per cent up from the bottom is forty per cent down from the top, and
  // getting this the wrong way round would move every crop by a fifth of a frame.
  const rect = { x: 0, y: 600, width: 778, height: 1000 };
  const metrics = measure(rect, FACE, UK);
  assert.ok(Math.abs(metrics.eye.value - 0.6) < 1e-9);
});

test('measure: head height and its millimetres agree with the print size', () => {
  const { rect } = fitFrame(FACE, UK, SOURCE);
  const metrics = measure(rect, FACE, UK);
  assert.ok(Math.abs(metrics.head.mm - metrics.head.value * 45) < 1e-9);
  assert.ok(metrics.head.mm >= 29 && metrics.head.mm <= 34);
});

test('measure: a box dragged too tight reports a head that is too large', () => {
  const { rect } = fitFrame(FACE, UK, SOURCE);
  const tight = { ...rect, height: Math.round(rect.height * 0.7) };
  tight.width = Math.round(tight.height * frameAspect(UK));
  const metrics = measure(tight, FACE, UK);
  assert.equal(metrics.head.status, 'high');
  assert.ok(!passes(metrics));
});

test('measure: off-centre and tilted are each reported on their own', () => {
  const { rect } = fitFrame(FACE, UK, SOURCE);
  const shifted = measure({ ...rect, x: rect.x + Math.round(rect.width * 0.1) }, FACE, UK);
  assert.equal(shifted.centre.status, 'low');
  assert.equal(shifted.head.status, 'ok', 'moving sideways changed the head height');

  const tilted = measure(rect, { ...FACE, rightEye: { x: 1070, y: 1020 } }, UK);
  assert.equal(tilted.tilt.status, 'high');
});

test('checkBand: says which side of the band it fell off', () => {
  assert.equal(checkBand(0.5, { min: 0.6, max: 0.8 }).status, 'low');
  assert.equal(checkBand(0.9, { min: 0.6, max: 0.8 }).status, 'high');
  assert.equal(checkBand(0.7, { min: 0.6, max: 0.8 }).status, 'ok');
  assert.equal(checkBand(0.6, { min: 0.6, max: 0.8 }).status, 'ok', 'the edge is inside');
});

test('containIn: a rectangle larger than the picture is cut down, not moved out', () => {
  const rect = containIn({ x: -50, y: -50, width: 5000, height: 5000 }, SOURCE);
  assert.deepEqual(rect, { x: 0, y: 0, width: 2000, height: 3000 });
});

test('resampling: enlargement is measured rather than refused', () => {
  const enough = resampling({ width: 1000, height: 1300 }, { width: 413, height: 531 });
  assert.ok(!enough.enlarging);
  const short = resampling({ width: 200, height: 260 }, { width: 413, height: 531 });
  assert.ok(short.enlarging && short.severe);
});

test('guideLines: the eye band is turned over exactly once', () => {
  const lines = guideLines(UK);
  assert.ok(Math.abs(lines.eye.from - (1 - UK.eye.max)) < 1e-9);
  assert.ok(Math.abs(lines.eye.to - (1 - UK.eye.min)) < 1e-9);
  assert.ok(lines.eye.from < lines.eye.to, 'the band was drawn upside down');
});

/* =============================================================== the sheet */

const PHOTO_35x45 = { widthMm: 35, heightMm: 45 };

test('planSheet: a 35 x 45 fits eight to a 6 x 4 print', () => {
  const plan = bestSheet({ photo: PHOTO_35x45, paper: paperById('4x6'), dpi: 300 });
  assert.equal(plan.count, 8);
  assert.equal(plan.columns, 4);
  assert.equal(plan.rows, 2);
  assert.match(describeSheet(plan), /8 copies/);
});

test('planSheet: nothing is scaled to fit', () => {
  // The whole tool exists to produce a photograph of an exact size. A layout
  // that shrank one by two per cent to fit another copy on would produce eight
  // photographs that are all wrong.
  const plan = bestSheet({ photo: PHOTO_35x45, paper: paperById('4x6'), dpi: 300 });
  for (const cell of plan.cells) {
    assert.equal(cell.width, Math.round(mmToPx(35, 300)));
    assert.equal(cell.height, Math.round(mmToPx(45, 300)));
  }
});

test('planSheet: every cell is inside the paper', () => {
  for (const paper of PAPERS) {
    const plan = bestSheet({ photo: PHOTO_35x45, paper, dpi: 300 });
    for (const cell of plan.cells) {
      assert.ok(cell.x >= 0 && cell.y >= 0, `${paper.id}: a cell starts off the paper`);
      assert.ok(cell.x + cell.width <= plan.canvas.width, `${paper.id}: a cell runs off the right`);
      assert.ok(cell.y + cell.height <= plan.canvas.height, `${paper.id}: a cell runs off the bottom`);
    }
  }
});

test('planSheet: no cut mark is drawn across a photograph', () => {
  const plan = bestSheet({ photo: PHOTO_35x45, paper: paperById('4x6'), dpi: 300 });
  assert.ok(plan.marks.length > 0);

  const inside = (x, y, cell) => (
    x > cell.x && x < cell.x + cell.width && y > cell.y && y < cell.y + cell.height
  );

  for (const mark of plan.marks) {
    for (const cell of plan.cells) {
      // Both ends outside is not enough on its own for a diagonal, but every
      // mark here is axis-aligned, so a segment with both ends outside a
      // rectangle it does not span cannot cross it.
      assert.ok(!inside(mark.x1, mark.y1, cell), 'a mark starts on a photograph');
      assert.ok(!inside(mark.x2, mark.y2, cell), 'a mark ends on a photograph');
    }
  }
});

test('planSheet: the block of photographs is centred on the paper', () => {
  const plan = bestSheet({ photo: PHOTO_35x45, paper: paperById('4x6'), dpi: 300 });
  const left = Math.min(...plan.cells.map((cell) => cell.x));
  const right = Math.max(...plan.cells.map((cell) => cell.x + cell.width));
  assert.ok(Math.abs(left - (plan.canvas.width - right)) <= 1);
});

test('planSheet: the paper is tried both ways round and the better one wins', () => {
  const upright = planSheet({ photo: PHOTO_35x45, paper: paperById('4x6'), dpi: 300, rotate: false });
  const turned = planSheet({ photo: PHOTO_35x45, paper: paperById('4x6'), dpi: 300, rotate: true });
  const best = bestSheet({ photo: PHOTO_35x45, paper: paperById('4x6'), dpi: 300 });
  assert.equal(best.count, Math.max(upright.count, turned.count));
});

test('planSheet: a photograph larger than the paper lays out nothing, and says so', () => {
  const plan = bestSheet({ photo: { widthMm: 300, heightMm: 400 }, paper: paperById('4x6'), dpi: 300 });
  assert.equal(plan.count, 0);
  assert.equal(plan.marks.length, 0);
  assert.match(describeSheet(plan), /does not fit/);
});

test('planSheet: doubling the resolution doubles the pixels and moves nothing', () => {
  const low = bestSheet({ photo: PHOTO_35x45, paper: paperById('4x6'), dpi: 300 });
  const high = bestSheet({ photo: PHOTO_35x45, paper: paperById('4x6'), dpi: 600 });
  assert.equal(high.count, low.count);
  assert.ok(Math.abs(high.canvas.width - low.canvas.width * 2) <= 1);
});

/* ========================================================== the background */

test('rgbToLab: white, black and a mid grey land where they should', () => {
  assert.ok(Math.abs(rgbToLab([255, 255, 255])[0] - 100) < 0.01);
  assert.ok(Math.abs(rgbToLab([0, 0, 0])[0]) < 0.01);
  const grey = rgbToLab([128, 128, 128]);
  assert.ok(Math.abs(grey[1]) < 0.01 && Math.abs(grey[2]) < 0.01, 'a grey has no colour cast');
});

test('deltaE: two indistinguishable greys are closer than two obvious colours', () => {
  const greys = deltaE(rgbToLab([220, 220, 220]), rgbToLab([228, 228, 228]));
  const colours = deltaE(rgbToLab([220, 220, 220]), rgbToLab([220, 220, 180]));
  assert.ok(greys < colours, 'RGB distance would have called these the same');
});

test('hexToRgb: both spellings, and nonsense falls back to white', () => {
  assert.deepEqual(hexToRgb('#ffffff'), [255, 255, 255]);
  assert.deepEqual(hexToRgb('abc'), [170, 187, 204]);
  assert.deepEqual(hexToRgb('not a colour'), [255, 255, 255]);
  assert.equal(rgbToHex([255, 128, 0]), '#ff8000');
});

test('inBackgroundZone: the top and the sides, never the face or the shoulders', () => {
  assert.ok(inBackgroundZone(0.5, 0.05), 'the top band');
  assert.ok(inBackgroundZone(0.05, 0.4), 'the left band');
  assert.ok(inBackgroundZone(0.95, 0.4), 'the right band');
  assert.ok(!inBackgroundZone(0.5, 0.4), 'the middle is a face');
  assert.ok(!inBackgroundZone(0.5, 0.9), 'the bottom is clothing');
  assert.ok(!inBackgroundZone(0.05, 0.9), 'a shoulder is not background');
});

/** A picture of one flat colour, with an optional darker left-hand side. */
function flatImage(rgb, { width = 60, height = 80, shade = null } = {}) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const at = (y * width + x) * 4;
      const colour = shade && x < width * 0.2 ? shade : rgb;
      data[at] = colour[0];
      data[at + 1] = colour[1];
      data[at + 2] = colour[2];
      data[at + 3] = 255;
    }
  }
  return { data, width, height };
}

test('readBackground: a flat wall reads as its own colour and as even', () => {
  const reading = readBackground(flatImage([220, 220, 220]), { stride: 1 });
  assert.equal(reading.hex, '#dcdcdc');
  assert.ok(reading.spread < 0.01);
  assert.ok(reading.lightRange < 0.01);
  assert.ok(reading.samples > 100);
});

test('readBackground: an empty picture is not guessed at', () => {
  assert.equal(readBackground({ data: new Uint8ClampedArray(0), width: 0, height: 0 }), null);
});

test('checkBackground: the right colour passes and a wrong one does not', () => {
  const grey = backgroundOf(specById('schengen'));
  const good = checkBackground(readBackground(flatImage([220, 220, 220]), { stride: 1 }), grey);
  assert.equal(good.status, 'good');

  const blue = checkBackground(readBackground(flatImage([70, 110, 200]), { stride: 1 }), grey);
  assert.equal(blue.status, 'bad');
  assert.equal(blue.findings.find((one) => one.key === 'colour').status, 'bad');
});

test('checkBackground: a shadow down one side is reported separately from the colour', () => {
  const white = BACKGROUNDS.white;
  const reading = readBackground(flatImage([252, 252, 252], { shade: [170, 170, 170] }), { stride: 1 });
  const verdict = checkBackground(reading, white);
  assert.equal(verdict.status, 'bad');
  assert.ok(verdict.findings.some((one) => one.key === 'sides'));
  assert.ok(verdict.findings.some((one) => one.key === 'uniform' && one.status !== 'good'));
});

test('checkBackground: nothing to read is "unknown", not a pass', () => {
  assert.equal(checkBackground(null, BACKGROUNDS.white).status, 'unknown');
});

test('readSignature: ink on white paper, and a page with nothing on it', () => {
  const paper = flatImage([250, 250, 250], { width: 40, height: 20 });
  for (let x = 0; x < 40 * 0.1; x += 1) {
    const at = (10 * 40 + x) * 4;
    paper.data[at] = 10;
    paper.data[at + 1] = 10;
    paper.data[at + 2] = 40;
  }
  const signed = checkSignature(readSignature(paper, { stride: 1 }));
  assert.ok(signed.findings.some((one) => one.key === 'paper' && one.status === 'good'));

  const blank = checkSignature(readSignature(flatImage([250, 250, 250]), { stride: 1 }));
  assert.equal(blank.findings.find((one) => one.key === 'ink').status, 'bad');
});

/* ============================================================= the JPEG bytes */

const PICTURE = ascii('SCANDATA-PRETENDING-TO-BE-A-PICTURE');
const BASE = jpeg([JFIF_SEGMENT], PICTURE);

test('isJpeg: only a file that starts the way one does', () => {
  assert.ok(isJpeg(BASE));
  assert.ok(!isJpeg(ascii('PK')));
  assert.ok(!isJpeg(new Uint8Array([0xff])));
});

test('headerSegments: the walk stops at the scan', () => {
  const found = headerSegments(BASE);
  assert.deepEqual(found.map((one) => one.marker), [0xe0]);
});

test('readDensity: a canvas JPEG claims an aspect ratio, not a resolution', () => {
  // This is the whole reason setDensity exists: units 0 means "these two
  // numbers are a ratio", so the file says nothing about how large it is.
  const density = readDensity(BASE);
  assert.equal(density.units, 0);
  assert.equal(density.dpi, null);
});

test('setDensity: the file then says 300 dpi, and the picture is untouched', () => {
  const out = setDensity(BASE, 300);
  assert.deepEqual(readDensity(out), { units: 1, x: 300, y: 300, dpi: 300 });
  assert.equal(out.length, BASE.length, 'bytes were added to patch five of them');
  assert.deepEqual(out.slice(-PICTURE.length), PICTURE);
});

test('setDensity: 600 as well, and it does not modify what it was given', () => {
  const before = BASE.slice();
  setDensity(BASE, 600);
  assert.deepEqual(BASE, before);
  assert.equal(readDensity(setDensity(BASE, 600)).dpi, 600);
});

test('setDensity: a file with no JFIF header gets one', () => {
  const bare = jpeg([segment(0xdb, ascii('quant'))], PICTURE);
  assert.equal(readDensity(bare), null);
  const out = setDensity(bare, 300);
  assert.equal(readDensity(out).dpi, 300);
  assert.deepEqual(out.slice(-PICTURE.length), PICTURE);
});

test('padTo: reaches the floor, and every byte of the picture survives', () => {
  const padded = padTo(BASE, 20 * 1024);
  assert.ok(padded.length >= 20 * 1024);
  assert.ok(padded.length < 20 * 1024 + 8, 'padded a long way past the floor');
  assert.deepEqual(padded.slice(-PICTURE.length), PICTURE);
  assert.equal(readDensity(padded).units, 0, 'the header was disturbed');
});

test('padTo: the padding says what it is, in the file', () => {
  const comments = readComments(padTo(BASE, 4096));
  assert.equal(comments.length, 1);
  assert.match(comments[0], /^Padding added by abox\.tools/);
  assert.match(comments[0], /picture itself is unchanged/);
});

test('padTo: more than one segment where one cannot hold it', () => {
  const padded = padTo(BASE, 200 * 1024);
  assert.ok(padded.length >= 200 * 1024);
  const comments = readComments(padded);
  assert.ok(comments.length > 1, 'a comment segment cannot exceed 65533 bytes');
  for (const comment of comments) assert.ok(comment.length <= 65533);
});

test('padTo: a file already large enough is handed straight back', () => {
  const padded = padTo(BASE, 4);
  assert.equal(padded, BASE);
});

test('padTo: what came out is still a JPEG the walker can read', () => {
  const padded = padTo(setDensity(BASE, 300), 30 * 1024);
  assert.ok(isJpeg(padded));
  assert.equal(readDensity(padded).dpi, 300);
  const markers = headerSegments(padded).map((one) => one.marker);
  assert.equal(markers[0], 0xe0, 'JFIF must stay the first segment');
});

/* ================================================================ the words */

test('outName: three files that cannot be confused with each other', () => {
  const spec = specById('uk-passport');
  assert.equal(outName('holiday snap', spec, 'print'), 'holiday-snap-uk-passport-35x45mm.jpg');
  assert.equal(outName('holiday snap', spec, 'sheet', { paper: '4x6' }), 'holiday-snap-uk-passport-sheet-4x6.jpg');
  assert.equal(
    outName('holiday snap', spec, 'upload', { width: 600, height: 750 }),
    'holiday-snap-uk-passport-600x750.jpg',
  );
});

test('outName: a name with nothing usable in it still produces a filename', () => {
  assert.equal(stemOf('IMG_2049.HEIC'), 'IMG_2049');
  assert.equal(stemOf(''), 'photo');
  assert.match(outName('###', specById('icao'), 'print'), /^photo-icao-/);
});

test('bandText: the published millimetres are shown, not recomputed ones', () => {
  assert.match(bandText(specById('uk-passport').head, 45), /29-34 mm/);
  assert.match(bandText(specById('icao').head, 45), /31\.5-36 mm/);
  assert.equal(percent(0.732), '73.2%');
  assert.equal(trim(16.933333), '16.9');
});

test('verdictText: says which way to drag, and never for a passing check', () => {
  const spec = specById('uk-passport');
  const low = verdictText({ value: 0.5, mm: 22.5, status: 'low', min: 0.64, max: 0.76 }, 'Head height', 45);
  assert.match(low, /too small/);
  assert.match(low, /Make the box smaller/);

  const eye = verdictText({ value: 0.4, mm: 18, status: 'low', min: 0.5, max: 0.6 }, 'Eye line', 45);
  assert.match(eye, /too low in the frame/);
  assert.match(eye, /Move the box down/);

  const ok = verdictText({ value: 0.7, mm: 31.5, status: 'ok', min: 0.64, max: 0.76 }, 'Head height', 45);
  assert.ok(!/Make the box/.test(ok));
  assert.ok(spec.head.minMm);
});

test('statusClass: an advisory band never paints a failure red', () => {
  assert.equal(statusClass('ok'), 'good');
  assert.equal(statusClass('high'), 'bad');
  assert.equal(statusClass('high', true), 'warn');
});

test('tiltText, centreText, resamplingText, readyText: all say something', () => {
  assert.match(tiltText({ degrees: 0.1, status: 'ok' }), /level/);
  assert.match(tiltText({ degrees: -4.2, status: 'high' }), /4\.2 degrees to the left/);
  assert.match(centreText({ offset: 0, status: 'ok' }), /centred/);
  assert.match(centreText({ offset: -0.08, status: 'low' }), /left of centre/);
  assert.match(resamplingText(resampling({ width: 120, height: 150 }, { width: 600, height: 750 })), /soft/);
  assert.match(readyText(false, 'good'), /does not meet the rule yet/);
  assert.match(readyText(true, 'bad'), /background does not/);
  assert.match(readyText(true, 'good'), /meets the rule/);
});
