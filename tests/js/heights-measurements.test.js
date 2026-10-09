import test from 'node:test';
import assert from 'node:assert/strict';
import { chartMeasurements } from '../../tools/compare-heights/src/chart-measurements.js';
import { objectShape, shapeOf } from '../../tools/compare-heights/src/figures.js';
import { chartSvg } from '../../tools/compare-heights/src/chart.js';

const rectangle = shapeOf('object');
const options = { plotHeight: 900, unit: 'cm', background: '#fff' };
const draw = (shape, widthCm) => chartSvg([{ shape, cm: 203, widthCm,
  name: '', label: '203 cm', colour: '#123456' }], options, text => text.length * 8);

test('blank object width keeps the existing automatic pixels while nonblank refusals omit a row', () => {
  for (const shape of [rectangle, objectShape('door')]) {
    const blank = chartMeasurements('203 cm', '  ', 'cm', shape);
    assert.equal(blank.valid, true);
    assert.equal(blank.width.auto, true);
    assert.equal(blank.width.cm, 0);
    assert.equal(draw(shape, blank.width.cm).svg, draw(shape, 0).svg);
    for (const [text, error] of [['abc', 'width.unreadable'], ['2 cm', 'width.toosmall'],
      ['2000 cm', 'width.toolarge']]) {
      const refused = chartMeasurements('203 cm', text, 'cm', shape);
      assert.equal(refused.valid, false);
      assert.equal(refused.width.error, error);
    }
  }
});

test('drawn object width reaches the existing stretch renderer rather than its automatic fallback', () => {
  const shape = objectShape('door');
  const first = chartMeasurements('203', '81', 'cm', shape);
  const wider = chartMeasurements('203', '162', 'cm', shape);
  assert.equal(first.usesWidth, true);
  assert.equal(first.width.cm, 81);
  assert.equal(wider.width.cm, 162);
  const before = draw(shape, first.width.cm), after = draw(shape, wider.width.cm);
  const scales = svg => /scale\(([\d.]+) ([\d.]+)\)/.exec(svg).slice(1).map(Number);
  const [a, h] = scales(before.svg), [b, sameHeight] = scales(after.svg);
  assert.ok(Math.abs(b / a - 2) < 0.001);
  assert.equal(sameHeight, h);
  assert.ok(after.width > before.width);
});

test('people and uploaded art keep their intrinsic ratio regardless of a hidden width draft', () => {
  const upload = { markup: '<path d="M0 0L1 0L1 1Z"/>', width: 0.5 };
  for (const shape of [shapeOf('woman'), upload]) {
    const result = chartMeasurements('203', 'not a width', 'cm', shape);
    assert.equal(result.valid, true);
    assert.equal(result.usesWidth, false);
    assert.equal(result.width.cm, 0);
    assert.equal(draw(shape, result.width.cm).svg, draw(shape, 0).svg);
  }
});

test('width uses the existing unit interpretation and boundary rules independently of height', () => {
  assert.equal(chartMeasurements('203', '24', 'ft', rectangle).width.cm, 60.96);
  assert.equal(chartMeasurements('203', '0.6 m', 'cm', rectangle).width.cm, 60);
  assert.equal(chartMeasurements('203', '5 cm', 'cm', rectangle).width.cm, 5);
  assert.equal(chartMeasurements('203', '12 m', 'cm', rectangle).width.cm, 1200);
  const refusedHeight = chartMeasurements('', '60 cm', 'cm', rectangle);
  assert.equal(refusedHeight.valid, false);
  assert.equal(refusedHeight.height.error, 'height.empty');
  assert.equal(refusedHeight.width.cm, 60);
  assert.equal(chartMeasurements('203', '5\'14"', 'cm', rectangle).width.error, 'width.unreadable');
});
