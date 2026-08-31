/**
 * tools/compare-heights/src/units.js - what somebody typed, and what the ruler
 * says back.
 *
 * The parsing is where this tool can be wrong without looking wrong: a chart
 * drawn from a misread height is a confident picture of the wrong thing. Two
 * rules in particular are guesses the page promises to make - a bare number is
 * centimetres on a metric chart and inches on an imperial one, and a bare
 * number under three is metres - so they are pinned here rather than left to
 * whichever regular expression happens to match first.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ceilTo, format, formatBoth, formatCm, formatFeet, gridLabel, gridStep,
  parseHeight, toInput,
} from '../../tools/compare-heights/src/units.js';

const cm = (text, prefer) => parseHeight(text, prefer).cm;
const near = (actual, expected, why) => assert.ok(
  Math.abs(actual - expected) < 0.01, `${why}: ${actual} is not ${expected}`,
);

test('metric, however it is written', () => {
  assert.equal(cm('173'), 173);
  assert.equal(cm('173cm'), 173);
  assert.equal(cm('173 CM'), 173);
  assert.equal(cm(' 173 centimetres '), 173);
  assert.equal(cm('173 centimeters'), 173, 'the American spelling too');
  assert.equal(cm('1.73m'), 173);
  assert.equal(cm('1.73 metres'), 173);
  assert.equal(cm('1730 mm'), 173);
});

test('a bare number under three is metres, because 1.73 cm is nobody', () => {
  assert.equal(cm('1.73'), 173);
  assert.equal(cm('2.01'), 201);
  assert.equal(parseHeight('3').error, 'height.tooshort',
               'three itself is three centimetres, and refused as one');
  assert.equal(cm('12'), 12, 'past three, centimetres');
});

test('feet and inches, however they are written', () => {
  near(cm("5'8"), 172.72, 'apostrophe, no inch mark');
  near(cm('5\'8"'), 172.72, 'both marks');
  near(cm('5 ft 8 in'), 172.72, 'words');
  near(cm('5ft8'), 172.72, 'no spaces');
  near(cm('5 feet 8 inches'), 172.72, 'spelled out');
  near(cm("6'"), 182.88, 'whole feet');
  near(cm('68in'), 172.72, 'inches alone');
  near(cm('68"'), 172.72, 'the double prime alone');
});

test("the curly quotes a phone keyboard makes are read as the marks they are", () => {
  near(cm('5’8'), 172.72, 'right single quotation mark');
  near(cm('5′8'), 172.72, 'prime');
  near(cm('68”'), 172.72, 'right double quotation mark');
});

test('a bare number means what the chart is measured in', () => {
  assert.equal(cm('178', 'cm'), 178);
  near(cm('68', 'ft'), 172.72, 'inches on an imperial chart');
  near(cm('5.9', 'ft'), 179.83, 'and under eight it is feet');
});

test("5'14\" is refused rather than carried", () => {
  // Twelve inches is a foot, so this is somebody who has not carried it. A
  // tool that silently made it 6'2" would draw a person nobody asked for.
  assert.equal(parseHeight('5\'14"').error, 'height.unreadable');
  near(cm('5\'11"'), 180.34, 'eleven is still fine');
});

test('nonsense, and heights off both ends, come back as their own mistake', () => {
  assert.equal(parseHeight('').error, 'height.empty');
  assert.equal(parseHeight('   ').error, 'height.empty');
  assert.equal(parseHeight('tall').error, 'height.unreadable');
  assert.equal(parseHeight('173 furlongs').error, 'height.unreadable');
  assert.equal(parseHeight('2').error, undefined, 'two metres is a height');
  assert.equal(parseHeight('4 cm').error, 'height.tooshort');
  assert.equal(parseHeight('1300 cm').error, 'height.tootall');
});

test('writing a height out, in either system', () => {
  assert.equal(formatCm(173), '173 cm');
  assert.equal(formatCm(173.4), '173 cm', 'whole centimetres above a metre');
  assert.equal(formatCm(42.55), '42.6 cm', 'and a decimal below one');
  assert.equal(formatFeet(172.72), '5 ft 8 in');
  assert.equal(formatFeet(182.88), '6 ft', 'no "0 in" on a whole foot');
  assert.equal(formatFeet(25), '10 in', 'and no "0 ft" under one');
  assert.equal(format(173, 'ft'), formatFeet(173));
  assert.equal(formatBoth(172.72, 'cm'), '173 cm (5 ft 8 in)');
  assert.equal(formatBoth(172.72, 'ft'), '5 ft 8 in (173 cm)');
});

test('the inch is rounded before the foot is carried', () => {
  // 5 ft 11.7 in is six foot. Rounding the inches in place would print
  // "5 ft 12 in", which is a sentence no tape measure has ever said.
  assert.equal(formatFeet(182.5), '6 ft');
  assert.equal(formatFeet(181.5), '5 ft 11 in');
});

test('switching units rewrites the box rather than reinterpreting it', () => {
  // The round trip is the point: `178` on a metric chart and `5'10"` on an
  // imperial one have to be the same person, or the picture moves when only
  // the notation was meant to.
  for (const height of [178, 165, 128, 86, 203]) {
    const written = toInput(height, 'ft');
    near(parseHeight(written, 'ft').cm, Math.round(height / 2.54) * 2.54,
         `${height} written as ${written}`);
    assert.equal(parseHeight(toInput(height, 'cm'), 'cm').cm, height);
  }
});

test('the ruler is spaced by what the picture can carry, not by the height', () => {
  assert.equal(gridStep(200, 'cm'), 20, 'two adults: a line every 20 cm');
  assert.equal(gridStep(90, 'cm'), 10, 'a toddler alone: every 10 cm');
  assert.equal(gridStep(1000, 'cm'), 100, 'a giraffe: every metre');
  assert.equal(gridStep(30, 'cm'), 5);

  // The imperial ladder is inches converted, so the lines land ON whole
  // inches rather than near them.
  for (const step of [1, 2, 3, 6, 12, 24, 60]) {
    const inches = (gridStep(step * 12 * 2.54 * 14, 'ft')) / 2.54;
    assert.ok(Math.abs(inches - Math.round(inches)) < 1e-9,
              `${inches} is not a whole number of inches`);
  }
});

test('the ceiling is the next line at or above a height', () => {
  assert.equal(ceilTo(178, 20), 180);
  assert.equal(ceilTo(180, 20), 180, 'a height already on a line stays there');
  assert.equal(ceilTo(181, 20), 200);
});

test('a gridline says what it is in the unit the chart is in', () => {
  assert.equal(gridLabel(150, 'cm'), '150 cm');
  assert.equal(gridLabel(0, 'cm'), '0 cm');
  assert.equal(gridLabel(182.88, 'ft'), '6 ft');
  assert.equal(gridLabel(167.64, 'ft'), '5′6″');
  assert.equal(gridLabel(15.24, 'ft'), '6 in', 'under a foot, inches alone');
});
