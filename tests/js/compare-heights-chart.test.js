/**
 * tools/compare-heights/src/chart.js - the layout.
 *
 * This is the module that has no browser in it on purpose: the widths it needs
 * come through a `measure` callback, so the whole of it can be checked here
 * with a ruler that counts characters. What is worth checking is the handful
 * of decisions that are invisible until somebody looks at a finished picture -
 * that a name fits above the figure it belongs to, that the tallest figure's
 * label is not off the top, and that the numbers the tool reports are the
 * numbers in the markup.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { ceiling, chartSvg, isDark } from '../../tools/compare-heights/src/chart.js';
import { objectShape, shapeOf } from '../../tools/compare-heights/src/figures.js';

/** A monospaced world, so a width in this file is a number anyone can check. */
const measure = (text, fontPx) => String(text).length * fontPx * 0.5;

const figure = (over = {}) => ({
  shape: shapeOf('man'),
  name: '',
  label: '178 cm',
  cm: 178,
  widthCm: 0,
  colour: '#4a80d4',
  ...over,
});

const options = (over = {}) => ({
  plotHeight: 900,
  unit: 'cm',
  background: '#ffffff',
  ink: '#16191d',
  showRuler: true,
  showNames: true,
  ...over,
});

const draw = (figures, over) => chartSvg(figures, options(over), measure);

test('the svg declares the size the tool reports', () => {
  const result = draw([figure()]);
  assert.match(result.svg, new RegExp(`width="${result.width}" height="${result.height}"`));
  assert.match(result.svg, new RegExp(`viewBox="0 0 ${result.width} ${result.height}"`));
});

test('the ruler runs from the ground to a whole gridline above the tallest', () => {
  const result = draw([figure({ cm: 178 }), figure({ cm: 165 })]);
  assert.equal(result.step, 20);
  // Not 180. That is the next line, and two centimetres of headroom is not
  // enough for the label the tallest figure carries - see the ceiling test
  // below, which is the rule that pushes it up one more.
  assert.equal(result.topCm, 200);
  assert.equal(result.topCm % result.step, 0, 'and it is still a whole number of lines');
});

test('the ceiling leaves room for the tallest figure\'s own label', () => {
  // 179 of 180 leaves one centimetre of headroom, which at any sane scale is
  // less than two lines of text. Without this the name of the tallest person
  // on the chart is drawn off the top of the picture.
  const { topCm } = ceiling(179, 900, 40, 'cm');
  const scale = 900 / topCm;
  assert.ok((topCm - 179) * scale >= 40, `only ${(topCm - 179) * scale}px of headroom`);
  assert.equal(ceiling(180, 900, 40, 'cm').topCm, 200, 'a height on the line still needs it');
});

test('with the names off, the picture is shorter', () => {
  const tall = draw([figure()]);
  const short = draw([figure()], { showNames: false });
  assert.ok(short.height < tall.height);
  assert.ok(!short.svg.includes('178 cm'), 'and says nothing');
});

test('a long name widens its own column and not its neighbour', () => {
  const plain = draw([figure({ name: 'Al' }), figure({ cm: 40, name: 'Bo' })]);
  const long = draw([figure({ name: 'Al' }),
                     figure({ cm: 40, name: 'Bartholomew Cubbins the Third' })]);
  assert.ok(long.width > plain.width, 'the picture grew');

  // The first figure has not moved: its centre is the first <g transform>.
  const centre = (svg) => /translate\((-?[\d.]+) /.exec(svg)[1];
  assert.equal(centre(long.svg), centre(plain.svg));
});

test('a name is written in the figure\'s colour and the height in the ink', () => {
  const svg = draw([figure({ name: 'Rosa', colour: '#3f9e72' })]).svg;
  assert.match(svg, /fill="#3f9e72"[^>]*>Rosa</);
  assert.match(svg, /fill="#16191d"[^>]*>178 cm</);
});

test('a name is escaped rather than trusted', () => {
  const svg = draw([figure({ name: '<script>&"' })]).svg;
  assert.ok(!svg.includes('<script>'), 'no tag arrives whole');
  assert.match(svg, /&lt;script&gt;&amp;&quot;/);
});

test('a rectangle is as wide as it was told to be', () => {
  const result = draw([figure({ shape: shapeOf('object'), cm: 200, widthCm: 100 })]);
  const rect = /<rect x="[\d.]+" y="[\d.]+" width="([\d.]+)" height="([\d.]+)"/.exec(result.svg);
  assert.ok(rect, 'the object is drawn as a rectangle');
  assert.ok(Math.abs(Number(rect[1]) / Number(rect[2]) - 0.5) < 0.01,
            'half as wide as it is tall, because that is what 100 by 200 means');
});

test('a rectangle with no width given falls back to its own default', () => {
  const result = draw([figure({ shape: shapeOf('object'), cm: 200, widthCm: 0 })]);
  assert.match(result.svg, /<rect x=/);
});

test('the background is drawn, or left out entirely', () => {
  assert.match(draw([figure()], { background: '#102030' }).svg,
               /<rect width="\d+" height="\d+" fill="#102030"\/>/);
  assert.ok(!draw([figure()], { background: 'none' }).svg.includes('<rect width='));
});

test('with the ruler off there are no gridlines and no gutters', () => {
  const on = draw([figure()]);
  const off = draw([figure()], { showRuler: false });
  assert.ok(off.width < on.width, 'the gutters the labels sat in are gone');
  assert.ok(!off.svg.includes('>180 cm<'));
  assert.match(off.svg, />178 cm</, 'the figure still says how tall it is');
});

test('every figure stands on the same ground line', () => {
  const result = draw([figure({ cm: 178 }), figure({ cm: 86 })]);
  const tops = [...result.svg.matchAll(/translate\(-?[\d.]+ ([\d.]+)\) scale\(([\d.]+)\)/g)]
    .map(([, top, height]) => Number(top) + Number(height));
  assert.equal(tops.length, 2);
  assert.ok(Math.abs(tops[0] - tops[1]) < 0.5, `feet at ${tops[0]} and ${tops[1]}`);
});

test('two figures are drawn at heights in the same ratio as their heights', () => {
  const result = draw([figure({ cm: 180 }), figure({ cm: 90 })]);
  // The outer transform only. A traced figure carries a second, inner one
  // that maps the artwork into the unit box, and it is not what is being
  // asked about here.
  const scales = [...result.svg.matchAll(/translate\([-\d. ]+\) scale\(([\d.]+)\)/g)]
    .map((m) => Number(m[1]));
  assert.ok(Math.abs(scales[0] / scales[1] - 2) < 0.01, `${scales[0]} to ${scales[1]}`);
});

test('a drawn object is stretched to both numbers, a person to one', () => {
  // The whole difference between the two kinds of figure the chart draws. A
  // person has one scale factor because nobody types a person's width; an
  // object has two, because the width box in its row is the claim being made.
  const door = draw([figure({ shape: objectShape('door'), cm: 203, widthCm: 81 })]);
  const [, sx, sy] = door.svg.match(/translate\([-\d. ]+\) scale\(([\d.]+) ([\d.]+)\)/)
    .map(Number);
  assert.ok(Math.abs(sx / sy - 81 / 203) < 0.02,
            `drawn ${sx} by ${sy}, wanted the ratio of 81 to 203`);

  const person = draw([figure({ shape: shapeOf('man') })]);
  assert.doesNotMatch(person.svg, /scale\([\d.]+ [\d.]+\)/,
                      'a person keeps the proportions they were drawn with');
});

test('an object with no width falls back rather than collapsing', () => {
  // widthCm is what somebody typed, and it can be empty for a moment.
  const result = draw([figure({ shape: objectShape('sofa'), cm: 85, widthCm: 0 })]);
  const [, sx] = result.svg.match(/scale\(([\d.]+) [\d.]+\)/).map(Number);
  assert.ok(sx > 0, 'the drawing still has a width');
  assert.ok(Number.isFinite(result.width) && result.width > 0);
});

test('an empty chart does not divide by nothing', () => {
  const result = draw([]);
  assert.ok(result.width > 0 && result.height > 0);
  assert.ok(Number.isFinite(result.topCm));
});

test('the ink is chosen from the background, not guessed', () => {
  assert.equal(isDark('#ffffff'), false);
  assert.equal(isDark('#16191d'), true);
  assert.equal(isDark('#1d3a6b'), true, 'a navy slide wants light ink');
  assert.equal(isDark('#ffd400'), false, 'and yellow does not, however loud it is');
  assert.equal(isDark('not a colour'), false, 'and nonsense falls to the light case');
});
