/**
 * shared/js/format.js - sizes and durations as words.
 *
 * The file replaced eleven byte formatters and seven duration formatters that
 * agreed on the arithmetic and disagreed on the tiers and the decimals, and
 * its contract is that a tool naming its old choices in a `style` gets its old
 * output. So the cases below are the tiers, one at a time, with the numbers
 * each tier showed before - and the two rounding traps that were the point of
 * writing a formatter carefully the first time.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { sizeText, durationText, clockText } from '../../shared/js/format.js';

const KB = 1024;
const MB = KB * 1024;
const GB = MB * 1024;

/** A phrase() that shows which key was asked for and what it was given. */
const t = (key, values) => `${key}:${Object.values(values).join('/')}`;

test('sizes: kilobytes from zero when there is no bytes key', () => {
  // The video tools' style: a file under a kilobyte is "0 KB", by design.
  const style = { kb: 0, mb: 1, gb: 'size.gb' };
  assert.equal(sizeText(0, t, style), 'size.kb:0');
  assert.equal(sizeText(3 * KB, t, style), 'size.kb:3');
  assert.equal(sizeText(1.5 * MB, t, style), 'size.mb:1.5');
  assert.equal(sizeText(2 * GB, t, style), 'size.gb:2.00');
});

test('sizes: a bytes tier under whichever key the tool has', () => {
  assert.equal(sizeText(512, t, { under: 'size.bytes' }), 'size.bytes:512');
  assert.equal(sizeText(512, t, { under: 'size.b' }), 'size.b:512');
  assert.equal(sizeText(KB, t, { under: 'size.b' }), 'size.kb:1');
});

test("sizes: 'auto' kilobytes keep a decimal below ten", () => {
  const style = { kb: 'auto', mb: 2 };
  assert.equal(sizeText(1.5 * KB, t, style), 'size.kb:1.5');
  assert.equal(sizeText(10 * KB, t, style), 'size.kb:10');
  assert.equal(sizeText(20.4 * KB, t, style), 'size.kb:20');
  assert.equal(sizeText(1.25 * MB, t, style), 'size.mb:1.25');
});

test('sizes: megabytes carry on when there is no gigabyte key', () => {
  assert.equal(sizeText(2 * GB, t, { mb: 2 }), 'size.mb:2048.00');
  assert.equal(sizeText(2 * GB, t, { mb: 1, gb: 'size.gb' }), 'size.gb:2.00');
});

test('sizes: an estimate that is not a number yet is a zero', () => {
  // merge-pdf and compress-pdf format sizes they have not finished working
  // out; "NaN KB" is not a size.
  assert.equal(sizeText(NaN, t, { under: 'size.bytes' }), 'size.bytes:0');
  assert.equal(sizeText(-40, t, { under: 'size.bytes' }), 'size.bytes:0');
  assert.equal(sizeText(Infinity, t, {}), 'size.kb:0');
});

test('durations: a decimal below ten seconds, whole seconds from there', () => {
  assert.equal(durationText(4.24, t), 'time.seconds:4.2');
  assert.equal(durationText(12.6, t), 'time.seconds:13');
  assert.equal(durationText(65, t), 'time.minutes:1/05');
  assert.equal(durationText(-3, t), 'time.seconds:-3.0');
});

test('durations: a fixed count of decimals where the tool asks for one', () => {
  assert.equal(durationText(4.24, t, { decimals: 2 }), 'time.seconds:4.24');
  assert.equal(durationText(12.6, t, { decimals: 1 }), 'time.seconds:12.6');
});

test('durations: hours only for the tool that has a key for them', () => {
  assert.equal(durationText(3725, t, { hours: 'time.hours' }), 'time.hours:1/02');
  assert.equal(durationText(3725, t), 'time.minutes:62/05');
  assert.equal(durationText(3599.4, t, { hours: 'time.hours' }), 'time.minutes:59/59');
});

test('the clock rounds to a millisecond once, before it is taken apart', () => {
  assert.equal(clockText(0), '0:00.000');
  assert.equal(clockText(83.5), '1:23.500');
  assert.equal(clockText(3725.25), '1:02:05.250');
  // Flooring the seconds and rounding the fraction separately wrote this as
  // 0:03.1000, which parses back as 3.1.
  assert.equal(clockText(3.9996), '0:04.000');
  assert.equal(clockText(-2), '0:00.000');
  assert.equal(clockText(undefined), '0:00.000');
});
