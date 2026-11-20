import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  BLUR_ARCMIN_AT_1MM, LIMITS, RAYLEIGH_ARCSEC_MM, RAYLEIGH_UM_NA, SEEING_CEILING, WIDEST_SHOWN_FIELD,
  binoculars, dialPosition, dialPower, dialSpan, eyepieceFor, feetAt1000Yards, fieldFromFeet, fieldFromMetres,
  firstFault, limitsFor, magnifier, magnifierFocal, magnifierValue, metresAt1000, microscope, regimeFor, telescope,
  tidy, zoneEdges
} from '../../tools/magnification-calculator/src/optics.js';
import {
  CRATERS, ENCKE, GALILEANS, JUPITER, LOOKS, MARIA, MOON, PLEIADES, RINGS, SATURN, SUBJECTS, arcminPerUnit,
  arcsecPerKm, faintestStar, moonSpot, seen, shownBrightness
} from '../../tools/magnification-calculator/src/subjects.js';
import { CLOSE_PX_PER_ARCMIN, FRAME_DEGREES, frameFor, geometry, render, softening } from '../../tools/magnification-calculator/src/view.js';

function close(actual, expected, tolerance = 1e-9) {
  assert.ok(Number.isFinite(actual), `${actual} is not a number`);
  assert.ok(Math.abs(actual - expected) <= Math.max(1e-12, Math.abs(expected) * tolerance), `${actual} differs from ${expected}`);
}

test('magnification calculator derives its three limits from one blur', () => {
  // Rayleigh at 550 nm, in the three units the page prints.
  close(BLUR_ARCMIN_AT_1MM, 2.3067, 1e-4);
  close(RAYLEIGH_ARCSEC_MM, 138.4, 1e-3);
  close(RAYLEIGH_UM_NA, 0.3355, 1e-9);
});

test('magnification calculator works a starter telescope through', () => {
  const view = telescope({ aperture: 70, focal: 700, eyepiece: 10 });
  close(view.magnification, 70);
  close(view.focalRatio, 10);
  close(view.exitPupil, 1);
  close(view.shownField, 52);
  close(view.trueField, 52 / 70);
  close(view.limitArcsec, 138.4 / 70, 1e-3);
  close(view.lowest, 10);
  close(view.fullFrom, 70);
  close(view.highest, 140);
  close(view.sharpFrom, 70 / BLUR_ARCMIN_AT_1MM);
  close(view.lightGrasp, 100);
  close(view.brightness, 1 / 49);
  assert.equal(view.regime, 'sharp');
  assert.equal(view.stopped, false);
  assert.equal(view.seeing, false);
});

test('magnification calculator calls the 675 times on a department-store box empty', () => {
  const box = telescope({ aperture: 60, focal: 900, eyepiece: 4, barlow: 3 });
  close(box.magnification, 675);
  close(box.exitPupil, 60 / 675);
  assert.equal(box.regime, 'empty');
  close(box.highest, 120);
  // As big as from 569 km, as detailed as from the distance 26 times would give.
  const moon = seen(SUBJECTS.moon, box);
  close(moon.asIfFrom, 384400000 / 675);
  close(box.detailPower, 60 / BLUR_ARCMIN_AT_1MM);
  close(moon.detailFrom, 384400000 / (60 / BLUR_ARCMIN_AT_1MM));
  assert.equal(moon.detailBound, true);
  // The picture and the verdict are the same statement: the blur is what is magnified.
  close(box.blurArcmin, BLUR_ARCMIN_AT_1MM * 675 / 60);
});

test('magnification calculator puts each exit pupil in its regime, boundaries to the better side', () => {
  assert.equal(regimeFor(8, 7), 'wasted');
  assert.equal(regimeFor(7, 7), 'spare');
  assert.equal(regimeFor(2.4, 7), 'spare');
  assert.equal(regimeFor(BLUR_ARCMIN_AT_1MM, 7), 'sharp');
  assert.equal(regimeFor(1, 7), 'sharp');
  assert.equal(regimeFor(0.99, 7), 'full');
  assert.equal(regimeFor(0.5, 7), 'full');
  assert.equal(regimeFor(0.49, 7), 'empty');
  // No eye pupil, no waste: a microscope's beam is never wider than it needs.
  assert.equal(regimeFor(40), 'spare');
  const scope = { aperture: 100, focal: 1000 };
  assert.equal(telescope({ ...scope, eyepiece: 10 }).regime, 'sharp');
  assert.equal(telescope({ ...scope, eyepiece: 5 }).regime, 'full');
  assert.equal(telescope({ ...scope, eyepiece: 4.9 }).regime, 'empty');
  assert.equal(telescope({ ...scope, eyepiece: 80 }).regime, 'wasted');
  assert.equal(telescope({ ...scope, eyepiece: 60, eyePupil: 5 }).regime, 'wasted');
});

test('magnification calculator knows a wasted beam is a smaller telescope', () => {
  const wide = telescope({ aperture: 200, focal: 1000, eyepiece: 50, apparentField: 52, barrel: 46 });
  close(wide.exitPupil, 10);
  // Twenty times with a 7 mm pupil uses 140 mm of the 200.
  close(wide.lightGrasp, 400);
  close(telescope({ aperture: 200, focal: 1000, eyepiece: 10 }).lightGrasp, (200 / 7) ** 2);
});

test('magnification calculator stops a long eyepiece at its barrel', () => {
  const long = telescope({ aperture: 200, focal: 2000, eyepiece: 40 });
  assert.equal(long.stopped, true);
  // 27 mm of field stop over 40 mm of eyepiece, not the 52 degrees asked for.
  close(long.shownField, 27 / 40 * 180 / Math.PI);
  close(long.trueField, 27 / 2000 * 180 / Math.PI);
  const wide = telescope({ aperture: 200, focal: 2000, eyepiece: 40, barrel: 46 });
  assert.equal(wide.stopped, false);
  close(wide.shownField, 52);
});

test('magnification calculator names the air once it is the limit', () => {
  const big = { aperture: 250, focal: 1250 };
  assert.equal(telescope({ ...big, eyepiece: 5 }).seeing, false);
  assert.equal(telescope({ ...big, eyepiece: 4 }).seeing, true);
  assert.equal(telescope({ ...big, eyepiece: 4 }).regime, 'full');
  // An empty verdict already says enough.
  assert.equal(telescope({ aperture: 100, focal: 1000, eyepiece: 3 }).seeing, false);
  assert.equal(SEEING_CEILING, 300);
});

test('magnification calculator finds the eyepiece a magnification needs', () => {
  close(eyepieceFor(70, 700), 10);
  close(eyepieceFor(675, 900, 3), 4);
});

test('magnification calculator decodes 8x42', () => {
  const pair = binoculars({ magnification: 8, objective: 42, field: 7.5, eyePupil: 5 });
  close(pair.exitPupil, 5.25);
  close(pair.twilight, Math.sqrt(336));
  close(pair.shownField, 60);
  close(pair.metres, 131.06, 1e-3);
  close(pair.feet, 393.2, 1e-3);
  close(pair.brightness, 1);
  assert.equal(pair.light, 'full');
  assert.equal(pair.hand, 'steady');
  // With no field printed, sixty apparent degrees is assumed.
  close(binoculars({ magnification: 8, objective: 42 }).trueField, 7.5);
  close(binoculars({ magnification: 10, objective: 50 }).trueField, 6);
});

test('magnification calculator reads a field of view in any of its three forms', () => {
  close(fieldFromMetres(metresAt1000(7.5)), 7.5);
  close(fieldFromFeet(feetAt1000Yards(6.3)), 6.3);
  // 393 ft at 1000 yd and 131 m at 1000 m are the same slope, and the same field.
  close(fieldFromFeet(393), 7.495, 1e-4);
  close(fieldFromMetres(131), fieldFromFeet(393));
});

test('magnification calculator shows what the second number is for at dusk', () => {
  const compact = binoculars({ magnification: 8, objective: 21, eyePupil: 5 });
  close(compact.exitPupil, 2.625);
  close(compact.brightness, (2.625 / 5) ** 2);
  assert.equal(compact.light, 'dim');
  assert.equal(binoculars({ magnification: 8, objective: 21, eyePupil: 3 }).light, 'less');
  assert.equal(binoculars({ magnification: 8, objective: 25, eyePupil: 3 }).light, 'full');
  assert.equal(binoculars({ magnification: 8, objective: 32, eyePupil: 5 }).light, 'less');
  assert.equal(binoculars({ magnification: 10, objective: 42, eyePupil: 5 }).hand, 'care');
  assert.equal(binoculars({ magnification: 12, objective: 50, eyePupil: 5 }).hand, 'care');
  assert.equal(binoculars({ magnification: 15, objective: 70, eyePupil: 7 }).hand, 'tripod');
});

test('magnification calculator works a school microscope through', () => {
  const view = microscope({ objective: 40, na: 0.65, eyepiece: 10 });
  close(view.magnification, 400);
  close(view.fieldNumber, 18);
  close(view.fieldMm, 0.45);
  close(view.limitUm, 0.3355 / 0.65);
  close(view.exitPupil, 0.8125);
  close(view.fullFrom, 325);
  close(view.highest, 650);
  close(view.sharpFrom, 325 / BLUR_ARCMIN_AT_1MM);
  assert.equal(view.regime, 'full');
  // An engraved field number wins over the typical one.
  close(microscope({ objective: 40, na: 0.65, eyepiece: 10, fieldNumber: 22 }).fieldMm, 0.55);
  // A weak eyepiece is not given a field its tube could not pass.
  close(microscope({ objective: 4, na: 0.1, eyepiece: 5 }).fieldNumber, 20);
  close(microscope({ objective: 4, na: 0.1, eyepiece: 15 }).fieldNumber, 12);
});

test('magnification calculator tells a thousand times from a thousand times', () => {
  const stretched = microscope({ objective: 40, na: 0.65, eyepiece: 25 });
  const oil = microscope({ objective: 100, na: 1.25, eyepiece: 10 });
  close(stretched.magnification, 1000);
  close(oil.magnification, 1000);
  assert.equal(stretched.regime, 'empty');
  assert.equal(oil.regime, 'full');
  assert.ok(oil.limitUm < stretched.limitUm / 1.9);
  // The same detail as the same objective showed at 141 times.
  close(stretched.detailPower, 325 / BLUR_ARCMIN_AT_1MM);
  // The eyepiece changes the picture as well as the verdict: with the same circle to
  // look into, 2.5 times the eyepiece is 2.5 times less specimen across it.
  close(microscope({ objective: 40, na: 0.65, eyepiece: 10 }).fieldMm / stretched.fieldMm, 2.5);
  close(stretched.shownField, microscope({ objective: 40, na: 0.65, eyepiece: 10 }).shownField);
});

test('magnification calculator does not call a low power objective too low', () => {
  assert.equal(microscope({ objective: 10, na: 0.25, eyepiece: 10 }).regime, 'sharp');
  assert.equal(microscope({ objective: 4, na: 0.1, eyepiece: 10 }).regime, 'sharp');
  assert.equal(microscope({ objective: 4, na: 0.1, eyepiece: 5 }).regime, 'spare');
});

test('magnification calculator turns a magnifier between power, focal length and dioptres', () => {
  const loupe = magnifier({ value: 10 });
  close(loupe.focal, 25);
  close(loupe.dioptres, 40);
  close(loupe.magnification, 10);
  assert.equal(loupe.band, 'loupe');
  close(magnifier({ value: 40, unit: 'dioptre' }).magnification, 10);
  close(magnifier({ value: 25, unit: 'focal' }).magnification, 10);
  // The same lens is sold as one more when the eye is taken to be focused close.
  close(magnifier({ value: 25, unit: 'focal', close: true }).magnification, 11);
  close(magnifier({ value: 11, close: true }).focal, 25);
  close(magnifierFocal(5, 'power', true), 62.5);
  for (const unit of ['power', 'focal', 'dioptre']) {
    for (const near of [false, true]) {
      close(magnifier({ value: magnifierValue(6, unit, near), unit, close: near }).magnification, 6);
    }
  }
  assert.equal(magnifier({ value: 2 }).band, 'reading');
  assert.equal(magnifier({ value: 5 }).band, 'inspect');
  assert.equal(magnifier({ value: 30 }).band, 'beyond');
  // The patch seen is as wide as the lens, and a typed lens wins over the typical one.
  close(magnifier({ value: 10 }).fieldMm, 21.25);
  close(magnifier({ value: 10, lens: 18 }).fieldMm, 18);
  // A weak lens is not given a width nobody could hold, and what its picture shows is
  // what its sentence says: the window's angle over the magnification.
  const lamp = magnifier({ value: 3, unit: 'dioptre', close: true });
  close(lamp.lens, 100);
  close(lamp.fieldMm, 250 * (lamp.shownField * Math.PI / 180) / lamp.magnification);
  close(lamp.fieldMm, 100 * 0.75 / 1.75);
});

test('magnification calculator lays the dial out so a round trip lands where it started', () => {
  for (const world of ['telescope', 'binoculars', 'microscope', 'magnifier']) {
    const range = dialSpan(world, { aperture: 114, objective: 40 });
    for (const power of [range[0], Math.sqrt(range[0] * range[1]), range[1]]) close(dialPower(dialPosition(power, range), range), power, 1e-9);
    assert.equal(dialPosition(range[0] / 10, range), 0);
    assert.equal(dialPosition(range[1] * 10, range), 1);
  }
  // A telescope's zones fall in the same places whatever its size.
  const small = telescope({ aperture: 60, focal: 700, eyepiece: 10 });
  const large = telescope({ aperture: 250, focal: 1250, eyepiece: 10 });
  const places = (numbers, aperture) => zoneEdges('telescope', numbers).map(edge => dialPosition(edge, dialSpan('telescope', { aperture })));
  places(small, 60).forEach((place, i) => close(place, places(large, 250)[i], 1e-9));
  assert.deepEqual(zoneEdges('microscope', microscope({ objective: 40, na: 0.65, eyepiece: 10 })).map(Math.round), [141, 325, 650]);
  assert.deepEqual(zoneEdges('binoculars', {}), [8, 12]);
  assert.equal(tidy(9.7222222), 9.72);
  assert.equal(tidy(1234.5, 2), 1200);
});

test('magnification calculator refuses a box it cannot use and lets an optional one stay empty', () => {
  assert.equal(firstFault('telescope', { aperture: 70, focal: 700, eyepiece: 10 }), null);
  assert.deepEqual(firstFault('telescope', { aperture: 70, focal: 700, eyepiece: 0 }), { name: 'eyepiece', low: 2, high: 60, missing: false });
  assert.deepEqual(firstFault('telescope', { aperture: null, focal: 700, eyepiece: 10 }), { name: 'aperture', low: 20, high: 2000, missing: true });
  assert.equal(firstFault('telescope', { aperture: Number.NaN, focal: 700, eyepiece: 10 }).name, 'aperture');
  assert.equal(firstFault('binoculars', { magnification: 8, objective: 42, field: null }), null);
  assert.equal(firstFault('microscope', { objective: 40, na: 0.65, eyepiece: 10, fieldNumber: null }), null);
  // A field of view is bounded by the widest circle an eyepiece shows.
  close(limitsFor('binoculars', { magnification: 8 }).field[1], WIDEST_SHOWN_FIELD / 8);
  assert.equal(firstFault('binoculars', { magnification: 8, objective: 42, field: 12 }).name, 'field');
  assert.equal(firstFault('microscope', { objective: 40, na: 0.65, eyepiece: 25, fieldNumber: 18 }).name, 'fieldNumber');
  assert.equal(firstFault('magnifier', { power: 10, lens: 60, focalLength: 25 }).name, 'lens');
  assert.equal(firstFault('magnifier', { power: 10, lens: 20, focalLength: 25 }), null);
  // Only the notation in use is checked.
  assert.equal(firstFault('magnifier', { dioptre: 40, lens: null, focalLength: 25 }), null);
  // A lamp magnifier of three diopters is 1.75 times counted the way it is sold, and
  // under one time counted the other way, which is refused rather than shown.
  close(magnifier({ value: 3, unit: 'dioptre', close: true }).magnification, 1.75);
  assert.equal(firstFault('magnifier', { dioptre: 3, lens: null, close: true, focalLength: 1000 / 3 }), null);
  assert.equal(firstFault('magnifier', { dioptre: 3, lens: null, close: false, focalLength: 1000 / 3 }).name, 'dioptre');
  assert.equal(firstFault('magnifier', { focal: 300, lens: null, close: false, focalLength: 300 }).name, 'focal');
  assert.equal(firstFault('magnifier', { focal: 300, lens: null, close: true, focalLength: 300 }), null);
  assert.deepEqual(Object.keys(LIMITS), ['telescope', 'binoculars', 'microscope', 'magnifier']);
});

test('magnification calculator measures every subject in arcminutes for the bare eye', () => {
  close(arcminPerUnit(SUBJECTS.moon), 1 / 60);
  close(arcminPerUnit(SUBJECTS['bird-day']), 10800 / Math.PI / 20);
  close(arcminPerUnit(SUBJECTS.blood), 10800 / Math.PI / 250);
  // The Moon is half a degree, Jupiter 47 arcseconds, the rings 44.
  close(SUBJECTS.moon.piece / 60, 31.08, 1e-3);
  close(SUBJECTS.jupiter.piece, 46.9, 1e-3);
  close(SUBJECTS.saturn.piece, 44.2, 2e-3);
  close(2 * SATURN.equatorial * arcsecPerKm(SATURN), 19.47, 1e-3);
  close(1 / arcsecPerKm(MOON), 1.8636, 1e-4);
});

test('magnification calculator fills the view by the share the numbers give', () => {
  const view = telescope({ aperture: 70, focal: 700, eyepiece: 10 });
  const moon = seen(SUBJECTS.moon, view);
  close(moon.share, 31.08 / (52 / 70 * 60), 1e-3);
  close(moon.asIfFrom, 384400000 / 70);
  assert.equal(moon.detailBound, true);
  assert.equal(seen(SUBJECTS.moon, telescope({ aperture: 70, focal: 700, eyepiece: 25 })).detailBound, false);
  // A red cell at 400 times looks 3 mm across from the reading distance.
  close(seen(SUBJECTS.blood, microscope({ objective: 40, na: 0.65, eyepiece: 10 })).lookalike, 3);
  assert.equal(seen(SUBJECTS.pleiades, view).asIfFrom, undefined);
  // The eye alone is the same sum at one times.
  close(seen(SUBJECTS.moon, { magnification: 1, shownField: 52, detailPower: 1 }).apparentArcmin, 31.08, 1e-3);
});

test('magnification calculator places the Moon\'s seas and craters on the side that faces us', () => {
  const crisium = moonSpot(MARIA[3][0], MARIA[3][1]);
  assert.ok(crisium.across > 0.8 && crisium.down < 0, 'the Sea of Crises is up and to the right');
  const tycho = moonSpot(CRATERS[0][0], CRATERS[0][1]);
  assert.ok(tycho.down > 0.6 && Math.abs(tycho.across) < 0.2, 'Tycho is near the bottom');
  for (const [latitude, longitude, width] of [...MARIA, ...CRATERS]) {
    const spot = moonSpot(latitude, longitude);
    assert.ok(spot.facing > 0.3, `${latitude}, ${longitude} is not on the near side`);
    assert.ok(width > 20 && width < 1500);
  }
});

test('magnification calculator keeps the planets\' companions at their published distances', () => {
  const reach = GALILEANS.map(moon => moon.orbit * arcsecPerKm(JUPITER));
  [138.4, 220.1, 351.1, 617.6].forEach((arcsec, i) => close(reach[i], arcsec, 1e-3));
  for (const moon of GALILEANS) assert.ok(Math.abs(moon.along) <= 1 && Math.abs(moon.along) > 0.5);
  // Cassini's division is the gap between the second ring and the third.
  close((RINGS[2].inner - RINGS[1].outer) * arcsecPerKm(SATURN), 0.78, 1e-2);
  assert.ok(RINGS.every((ring, i) => ring.outer > ring.inner && (i === 0 || ring.inner >= RINGS[i - 1].outer)));
  assert.ok(ENCKE.middle > RINGS[2].inner && ENCKE.middle < RINGS[2].outer);
});

test('magnification calculator puts the Pleiades where the catalogue does', () => {
  assert.equal(PLEIADES.length, 11);
  const [alcyone, atlas, electra] = PLEIADES;
  // The distance between two stars on the picture, against the same distance worked
  // out on the sphere from the catalogue's own figures.
  const turn = Math.PI / 180;
  const place = (hours, minutes, seconds, degrees, arcminutes, arcseconds) => [(hours + minutes / 60 + seconds / 3600) * 15 * turn, (degrees + arcminutes / 60 + arcseconds / 3600) * turn];
  const apart = ([a1, d1], [a2, d2]) => Math.acos(Math.sin(d1) * Math.sin(d2) + Math.cos(d1) * Math.cos(d2) * Math.cos(a1 - a2)) / turn * 3600;
  const drawn = (one, other) => Math.hypot(one.across - other.across, one.down - other.down);
  const sky = { alcyone: place(3, 47, 29.06, 24, 6, 18.9), atlas: place(3, 49, 9.73, 24, 3, 12.7), electra: place(3, 44, 52.52, 24, 6, 48.4) };
  close(drawn(alcyone, atlas), apart(sky.alcyone, sky.atlas), 1e-4);
  close(drawn(electra, atlas), apart(sky.electra, sky.atlas), 1e-4);
  close(apart(sky.alcyone, sky.atlas) / 60, 23.2, 5e-3);
  // Atlas is east of Alcyone, which is to the left with north up.
  assert.ok(atlas.across < alcyone.across && alcyone.across < electra.across);
  // Alcyone is the middle of the picture, and the rest are within a degree of it.
  assert.deepEqual([Math.abs(alcyone.across), Math.abs(alcyone.down)], [0, 0]);
  assert.ok(PLEIADES.every(star => Math.hypot(star.across, star.down) < 3600));
  close(SUBJECTS.pleiades.piece / 60, 59.8, 1e-2);
  // Ten of the eleven are within a dark-adapted eye's reach, and binoculars add the last.
  assert.equal(PLEIADES.filter(star => star.magnitude <= faintestStar(1)).length, 10);
  assert.equal(PLEIADES.filter(star => star.magnitude <= faintestStar(36)).length, 11);
  close(faintestStar(100), 11);
});

test('magnification calculator dims a picture only once the light to spare is spent', () => {
  // The Moon has a factor of 1250 in hand: full at a 1 mm exit pupil, not at a tenth.
  assert.equal(shownBrightness(SUBJECTS.moon, 1 / 49), 1);
  assert.ok(shownBrightness(SUBJECTS.moon, (0.089 / 7) ** 2) < 0.6);
  // Saturn is twenty times fainter a surface, so it dulls first.
  assert.ok(SUBJECTS.saturn.nits < SUBJECTS.jupiter.nits && SUBJECTS.jupiter.nits < SUBJECTS.moon.nits);
  close(SUBJECTS.jupiter.nits / SUBJECTS.moon.nits, 0.1656, 1e-3);
  assert.ok(shownBrightness(SUBJECTS.saturn, (0.5 / 7) ** 2) < 0.7);
  assert.equal(shownBrightness(SUBJECTS.jupiter, (1 / 7) ** 2), 1);
  // Daylight hides a small exit pupil, dusk does not.
  assert.equal(shownBrightness(SUBJECTS['bird-day'], (2.625 / 3) ** 2), 1);
  assert.ok(shownBrightness(SUBJECTS['bird-dusk'], (2.625 / 5) ** 2) < 0.7);
  assert.equal(shownBrightness(SUBJECTS['bird-dusk'], 1), 1);
  // Stars are points and a lamp can be turned up.
  assert.equal(shownBrightness(SUBJECTS.pleiades, 0.001), 1);
  assert.equal(shownBrightness(SUBJECTS.blood, 0.001), 1);
});

test('magnification calculator draws finer than its best instrument resolves', () => {
  // Otherwise a subject would stop improving while the verdict still said "sharp".
  const scope = RAYLEIGH_ARCSEC_MM / 500;
  for (const id of ['moon', 'jupiter', 'saturn']) assert.ok(SUBJECTS[id].finest <= scope, id);
  // The strongest objective on the turret, and the strongest lens the page calls a loupe.
  const oil = RAYLEIGH_UM_NA / 1.25 / 1000;
  for (const id of LOOKS.microscope) assert.ok(SUBJECTS[id].finest <= oil, id);
  const loupe = magnifier({ value: 20 }).detailUm / 1000;
  for (const id of LOOKS.magnifier) assert.ok(SUBJECTS[id].finest <= loupe, id);
  // A bird 20 m off through 40 times: the eye's arcminute, which is 0.15 mm of feather.
  assert.ok(SUBJECTS['bird-day'].finest <= 20 * Math.PI / 10800 / 40);
  for (const ids of Object.values(LOOKS)) for (const id of ids) assert.ok(SUBJECTS[id], id);
});

// A canvas that paints nothing and counts what it was asked to do. A layer is another
// of the same, so a picture drawn small and scaled back up can be told from one drawn
// straight.
function countingCanvas() {
  const calls = {};
  const state = {};
  const gradient = { addColorStop() {} };
  const ctx = new Proxy({}, {
    get(unused, key) {
      if (key === 'createRadialGradient' || key === 'createLinearGradient') return () => gradient;
      if (key === 'measureText') return words => ({ width: [...String(words)].length * 5 });
      if (key in state) return state[key];
      return (...given) => {
        calls[key] = (calls[key] || 0) + 1;
        if (key === 'fillText') (calls.written ||= []).push(String(given[0]));
      };
    },
    set(unused, key, value) {
      state[key] = value;
      return true;
    }
  });
  const total = () => Object.entries(calls).reduce((sum, [key, count]) => sum + (key === 'written' ? 0 : count), 0);
  return { ctx, calls, total };
}

function layers() {
  const made = [];
  const layerFor = (width, height) => {
    const layer = { width, height, ...countingCanvas() };
    layer.getContext = () => layer.ctx;
    made.push(layer);
    return layer;
  };
  return { made, layerFor };
}

const PRINTED = ['A line of print.', 'Another line of it.', 'And a third.', 'MICROPRINT'];
const pictureOf = (id, numbers, extra = {}) => ({
  subject: SUBJECTS[id],
  id,
  power: numbers.magnification,
  blurArcmin: numbers.blurArcmin,
  brightness: shownBrightness(SUBJECTS[id], numbers.brightness),
  backdrop: 'slide',
  lit: false,
  faintest: faintestStar(numbers.lightGrasp ?? 1),
  words: PRINTED,
  face: 'serif',
  ...extra
});

test('magnification calculator sizes a subject on screen by the share the numbers give it', () => {
  const numbers = telescope({ aperture: 70, focal: 700, eyepiece: 10 });
  const pxPerArcmin = 500 / (frameFor(numbers.shownField) * 60);
  const g = geometry(pictureOf('moon', numbers, { pxPerArcmin }), 500, 500, 2);
  const circle = numbers.shownField * 60 * pxPerArcmin;
  close(SUBJECTS.moon.piece * g.k / circle, seen(SUBJECTS.moon, numbers).share);
  assert.equal(FRAME_DEGREES, 72);
  assert.equal(frameFor(52), 72);
  assert.equal(frameFor(82), 86);
  // The eye alone is the same drawing at one times, so the two close looks differ by
  // exactly the magnification, which is the definition of it.
  const through = geometry(pictureOf('moon', numbers, { pxPerArcmin: CLOSE_PX_PER_ARCMIN }), 250, 250, 2);
  const bare = geometry({ ...pictureOf('moon', numbers, { pxPerArcmin: CLOSE_PX_PER_ARCMIN }), power: 1, blurArcmin: 1 }, 250, 250, 2);
  close(through.k / bare.k, 70);
});

test('magnification calculator softens a picture by the blur and by nothing else', () => {
  assert.equal(softening(0.4), 1);
  assert.equal(softening(1.2), 1);
  assert.equal(softening(3), 3);
  assert.equal(softening(500), 48);
  // At the sharpest setting the close look is drawn straight, a pixel of blur or so.
  const sharp = telescope({ aperture: 70, focal: 700, eyepiece: 25 });
  assert.equal(geometry(pictureOf('moon', sharp, { pxPerArcmin: CLOSE_PX_PER_ARCMIN }), 250, 250, 1).shrink, 1);
  // The 675 times on the box is thirteen pixels of it.
  const box = telescope({ aperture: 60, focal: 900, eyepiece: 4, barlow: 3 });
  const soft = geometry(pictureOf('moon', box, { pxPerArcmin: CLOSE_PX_PER_ARCMIN }), 250, 250, 1);
  close(soft.shrink, box.blurArcmin * CLOSE_PX_PER_ARCMIN);
  assert.ok(soft.shrink > 12 && soft.shrink < 14);
  // Nothing under a third of the blur is worth drawing, and nothing over it is left
  // out. In a softened layer a pixel is the blur, so the two limits are one.
  assert.ok(soft.fine >= soft.soft / 3 && soft.fine < soft.soft / 2.8);
  const { made, layerFor } = layers();
  const { ctx, calls } = countingCanvas();
  render(ctx, 250, 250, 1, pictureOf('moon', box, { pxPerArcmin: CLOSE_PX_PER_ARCMIN }), layerFor);
  assert.ok(made.length >= 2, 'drawn small, then stepped back up');
  assert.equal(made[0].width, Math.ceil(250 / soft.shrink));
  assert.ok(made[0].total() > 10, 'the scene went into the small layer');
  assert.ok(calls.drawImage === 1 && !calls.arc, 'and only the layer went into the picture');
  const straight = layers();
  render(countingCanvas().ctx, 250, 250, 1, pictureOf('moon', sharp, { pxPerArcmin: CLOSE_PX_PER_ARCMIN }), straight.layerFor);
  assert.equal(straight.made.length, 0);
});

test('magnification calculator draws the field stop only round the whole view, and dims only what has no light to spare', () => {
  const numbers = telescope({ aperture: 60, focal: 900, eyepiece: 4, barlow: 3 });
  const whole = countingCanvas();
  render(whole.ctx, 400, 400, 1, pictureOf('saturn', numbers, { pxPerArcmin: 400 / (72 * 60), shownField: numbers.shownField }), layers().layerFor);
  assert.ok(whole.calls.rect >= 1 && whole.calls.fillRect >= 1, 'a field stop, and a veil over a dull Saturn');
  const bright = countingCanvas();
  const easy = telescope({ aperture: 200, focal: 1200, eyepiece: 10 });
  render(bright.ctx, 400, 400, 1, pictureOf('moon', easy, { pxPerArcmin: CLOSE_PX_PER_ARCMIN, shownField: 0 }), layers().layerFor);
  assert.equal(bright.calls.rect, undefined);
});

// Each instrument across its dial, in the three pictures the page draws.
function everyPicture(visit) {
  const sweeps = {
    telescope: [10, 35, 70, 140, 300, 675].map(power => telescope({ aperture: 70, focal: 700, eyepiece: 700 / power })),
    binoculars: [4, 8, 12, 25].map(magnification => binoculars({ magnification, objective: 42 })),
    microscope: [[4, 0.1, 10], [10, 0.25, 10], [40, 0.65, 10], [40, 0.65, 25], [100, 1.25, 10], [100, 1.25, 25]].map(([objective, na, eyepiece]) => microscope({ objective, na, eyepiece })),
    magnifier: [2, 5, 10, 20, 40].map(value => magnifier({ value }))
  };
  for (const [world, list] of Object.entries(sweeps)) {
    for (const id of LOOKS[world]) {
      for (const numbers of list) {
        const backdrop = world === 'magnifier' ? 'paper' : 'slide';
        for (const [w, ratio] of [[300, 3], [520, 1]]) {
          visit(world, id, 'whole', pictureOf(id, numbers, { backdrop, lit: world === 'microscope', pxPerArcmin: w / (frameFor(numbers.shownField) * 60), shownField: numbers.shownField }), w, ratio);
          visit(world, id, 'close', pictureOf(id, numbers, { backdrop, lit: world === 'microscope', pxPerArcmin: CLOSE_PX_PER_ARCMIN, shownField: 0 }), w / 2, ratio);
          visit(world, id, 'bare', { ...pictureOf(id, numbers, { backdrop, pxPerArcmin: CLOSE_PX_PER_ARCMIN, shownField: 0 }), power: 1, blurArcmin: 1, brightness: 1, faintest: faintestStar(1) }, w / 2, ratio);
        }
      }
    }
  }
}

test('magnification calculator draws every subject at every scale, with no words but the page of print and the numbers on the ruler', () => {
  let pictures = 0;
  let most = 0;
  everyPicture((world, id, which, spec, w, ratio) => {
    const { ctx, calls, total } = countingCanvas();
    const store = layers();
    render(ctx, w, w, ratio, spec, store.layerFor);
    const drawn = total() + store.made.reduce((sum, layer) => sum + layer.total(), 0);
    const written = [...(calls.written || []), ...store.made.flatMap(layer => layer.calls.written || [])];
    assert.ok(drawn > 1, `${world} ${id} ${which}: nothing drawn`);
    // A dial dragged across this is a picture per frame, so each has to be cheap.
    assert.ok(drawn < 200000, `${world} ${id} ${which} at ${spec.power}: ${drawn} calls`);
    most = Math.max(most, drawn);
    if (id === 'print') assert.ok(written.every(line => PRINTED.some(words => line.includes(words))), `${which}: ${written}`);
    else if (id === 'ruler') assert.ok(written.every(line => /^\d+$/.test(line)), `${which}: ${written}`);
    else assert.deepEqual(written, [], `${world} ${id} ${which} wrote on the picture`);
    pictures += 1;
  });
  assert.ok(pictures > 400 && most > 1000, `${pictures} pictures, the busiest ${most} calls`);
});

test('magnification calculator shows more of a subject as the instrument resolves more', () => {
  // The same close look of the same thing through a small aperture and a large one at
  // one magnification: only the blur differs, and the sharper one has more in it.
  const drawnBy = (numbers, id) => {
    const store = layers();
    const picture = countingCanvas();
    render(picture.ctx, 250, 250, 2, pictureOf(id, numbers, { lit: true, pxPerArcmin: CLOSE_PX_PER_ARCMIN, shownField: 0 }), store.layerFor);
    return picture.total() + store.made.reduce((sum, layer) => sum + layer.total(), 0);
  };
  assert.ok(drawnBy(telescope({ aperture: 250, focal: 1250, eyepiece: 2.5 }), 'moon') > drawnBy(telescope({ aperture: 60, focal: 1250, eyepiece: 2.5 }), 'moon') * 2);
  // A thousand times two ways is the same drawing under twice the blur.
  const blurOf = numbers => geometry(pictureOf('bacteria', numbers, { pxPerArcmin: CLOSE_PX_PER_ARCMIN }), 250, 250, 2).shrink;
  close(blurOf(microscope({ objective: 40, na: 0.65, eyepiece: 25 })) / blurOf(microscope({ objective: 100, na: 1.25, eyepiece: 10 })), 1.25 / 0.65);
});

// The page's own markup, because the keys a module can name are only words if the
// body defines them, and a missing one reaches a visitor as the key itself.
const BODY = readFileSync(new URL('../../tools/magnification-calculator/body.html', import.meta.url), 'utf8');
const PHRASES = new Set([...BODY.slice(BODY.indexOf('<div id="phrases"')).matchAll(/data-phrase="([^"]+)"/g)].map(match => match[1]));

test('magnification calculator has words for every verdict its arithmetic can reach', () => {
  const reached = new Set(['verdict.seeing']);
  for (const eyepiece of [2, 3, 5, 8, 12, 20, 32, 60]) {
    for (const aperture of [60, 130, 300]) {
      const view = telescope({ aperture, focal: 1200, eyepiece });
      reached.add(`verdict.telescope.${view.regime}`).add(`zone.${view.regime}`);
    }
  }
  for (const eyepiece of [2, 5, 10, 16, 25, 40]) {
    for (const [objective, na] of [[4, 0.1], [10, 0.25], [40, 0.65], [100, 1.25]]) {
      const view = microscope({ objective, na, eyepiece });
      reached.add(`verdict.microscope.${view.regime}`).add(`zone.${view.regime}`);
    }
  }
  for (const magnification of [6, 8, 10, 12, 16, 25]) {
    for (const objective of [20, 30, 42, 70]) {
      for (const eyePupil of [3, 5, 7]) {
        const view = binoculars({ magnification, objective, eyePupil });
        reached.add(`verdict.binoculars.light.${view.light}`).add(`zone.light.${view.light}`).add(`verdict.binoculars.hand.${view.hand}`).add(`zone.${view.hand}`);
      }
    }
  }
  for (const value of [1.5, 2.5, 4, 9, 18, 30]) {
    const view = magnifier({ value });
    reached.add(`verdict.magnifier.${view.band}`).add(`zone.${view.band}`);
  }
  // Five regimes for a telescope and four for a microscope, which share their zones;
  // three lights and three hands for binoculars, each named twice over; four bands for
  // a magnifier; and the air.
  assert.equal(reached.size, 1 + 5 + 4 + 5 + 3 + 3 + 3 + 3 + 4 + 4, [...reached].sort().join(' '));
  for (const key of reached) assert.ok(PHRASES.has(key), `${key} has no phrase in body.html`);
});

test('magnification calculator names and captions every subject it can draw', () => {
  for (const [id, subject] of Object.entries(SUBJECTS)) {
    assert.ok(PHRASES.has(`subject.${id}`), `subject.${id}`);
    const caption = subject.kind === 'sky' ? id : subject.kind === 'land' ? 'bird' : subject.kind;
    assert.ok(PHRASES.has(`caption.${caption}`), `caption.${caption}`);
  }
  // The buttons that choose a subject are the subjects each instrument has, in order.
  for (const [world, ids] of Object.entries(LOOKS)) {
    const offered = [...BODY.matchAll(new RegExp(`name="look-${world}" value="([^"]+)"`, 'g'))].map(match => match[1]);
    assert.deepEqual(offered, ids, world);
  }
  // No key is a bare word: the suite that reads the built page looks for every key in
  // the text a visitor sees, and "moon" would be found in a sentence about the Moon.
  for (const key of PHRASES) assert.match(key, /^[a-z]+(\.[a-z0-9-]+)+$/, key);
});
