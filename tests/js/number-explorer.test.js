import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAX_COUNT, VOLUME_REFERENCES, parseCount, sandModel, textModel, countingModel, chooseReference, compareVolume, countForVolume } from '../../tools/number-explorer/src/scale.js';

function close(actual, expected, tolerance = 1e-10) {
  assert.ok(Number.isFinite(actual));
  assert.ok(Math.abs(actual - expected) <= Math.max(Number.EPSILON, Math.abs(expected) * tolerance), `${actual} differs from ${expected}`);
}

test('number explorer preserves exact counts across accepted input forms', () => {
  for (const input of ['1000000000', '1,000,000,000', '1 000 000 000', '1b', '1 billion', '1e9']) assert.deepEqual(parseCount(input), { ok: true, count: 1000000000n });
  assert.deepEqual(parseCount(' 1.5B '), { ok: true, count: 1500000000n });
  assert.deepEqual(parseCount('.5 thousand'), { ok: true, count: 500n });
  assert.deepEqual(parseCount('1,234.5k'), { ok: true, count: 1234500n });
  assert.deepEqual(parseCount('1\u202f000\u202f000'), { ok: true, count: 1000000n });
  assert.deepEqual(parseCount('1\u00a0000'), { ok: true, count: 1000n });
  assert.deepEqual(parseCount('10e-1'), { ok: true, count: 1n });
  assert.deepEqual(parseCount('9007199254740993'), { ok: true, count: 9007199254740993n });
});
test('number explorer supports named suffixes without combining them with exponents', () => {
  const cases = [['2k', 2000n], ['2 thousand', 2000n], ['2m', 2000000n], ['2 million', 2000000n], ['2b', 2000000000n], ['2 billion', 2000000000n], ['2t', 2000000000000n], ['2 trillion', 2000000000000n]];
  for (const [input, count] of cases) assert.deepEqual(parseCount(input), { ok: true, count });
  assert.deepEqual(parseCount('1e3k'), { ok: false, key: 'amount-invalid' });
});
test('number explorer rejects ambiguous grouping and nonnumeric input', () => {
  for (const input of ['-1', '+1', 'NaN', 'Infinity', '0xff', '1,00', '1234,567', '1 00', '1  000', '1,000 000', '1\t000', '1e', '1e3.5', '1.2.3', '.', 'one million']) assert.deepEqual(parseCount(input), { ok: false, key: 'amount-invalid' }, input);
  assert.deepEqual(parseCount(1), { ok: false, key: 'amount-invalid' });
  for (const input of ['', '   ', null, undefined]) assert.deepEqual(parseCount(input), { ok: false, key: 'amount-required' });
});
test('number explorer enforces whole counts and the exact upper boundary', () => {
  for (const input of ['0.5', '1e-1', '1.0001k']) assert.deepEqual(parseCount(input), { ok: false, key: 'amount-whole' });
  for (const input of ['0', '0.0', '0e999999999999999999999']) assert.deepEqual(parseCount(input), { ok: true, count: 0n });
  assert.deepEqual(parseCount('1e30'), { ok: true, count: MAX_COUNT });
  assert.deepEqual(parseCount(MAX_COUNT.toString()), { ok: true, count: MAX_COUNT });
  assert.deepEqual(parseCount((MAX_COUNT + 1n).toString()), { ok: false, key: 'amount-too-large' });
  assert.deepEqual(parseCount('1e999999999999999999999'), { ok: false, key: 'amount-too-large' });
  assert.deepEqual(parseCount('1e-999999999999999999999'), { ok: false, key: 'amount-whole' });
  assert.equal(parseCount('1'.repeat(1000)).ok, false);
});
test('number explorer turns the default billion grains into approximately 109 liters', () => {
  const result = sandModel(1000000000n);
  close(result.volumeM3, 0.109083078, 1e-7);
  close(result.liters, 109.083078, 1e-7);
  close(result.cubeSideM, 0.477807, 1e-5);
});
test('number explorer scales grain diameter as volume and cube edge as length', () => {
  const fine = sandModel(1000000000n, 0.25), medium = sandModel(1000000000n, 0.5), coarse = sandModel(1000000000n, 1);
  close(medium.volumeM3 / fine.volumeM3, 8);
  close(coarse.volumeM3 / medium.volumeM3, 8);
  close(medium.cubeSideM / fine.cubeSideM, 2);
  close(coarse.cubeSideM / medium.cubeSideM, 2);
});
test('number explorer keeps a thousandfold volume increase distinct from its height increase', () => {
  const small = sandModel(1000n), large = sandModel(1000000n);
  close(large.volumeM3 / small.volumeM3, 1000);
  close(large.cubeSideM / small.cubeSideM, 10);
});
test('number explorer includes the gaps between grains in bulk volume', () => {
  close(sandModel(1000000n, 0.5, 0.3).volumeM3 / sandModel(1000000n, 0.5, 0.6).volumeM3, 2);
});
test('number explorer distinguishes reference books from token counts', () => {
  assert.deepEqual(textModel(100000n), { words: 75000, books: 1 });
  assert.deepEqual(textModel(100000n, 150000), { words: 75000, books: 0.5 });
});
test('number explorer counts continuously at the selected rate with a defined year length', () => {
  assert.equal(countingModel(60n).seconds, 60);
  assert.equal(countingModel(60n, 2).seconds, 30);
  close(countingModel(31557600n).years, 1);
});
test('number explorer gives empty counts zero amounts without an infinite inverse', () => {
  assert.deepEqual(sandModel(0n), { volumeM3: 0, liters: 0, cubeSideM: 0 });
  assert.deepEqual(textModel(0n), { words: 0, books: 0 });
  assert.deepEqual(countingModel(0n), { seconds: 0, years: 0 });
  assert.deepEqual(compareVolume(0, 'bucket'), { ratio: 0, inverse: null });
  assert.equal(chooseReference(0).id, 'spoon');
});
test('number explorer compares like volumes and selects a reference near ten units', () => {
  const buckets = compareVolume(0.2, 'bucket');
  close(buckets.ratio, 20);
  close(buckets.inverse, 0.05);
  for (const reference of VOLUME_REFERENCES) {
    close(compareVolume(reference.volumeM3, reference.id).ratio, 1);
    assert.equal(chooseReference(reference.volumeM3 * 10).id, reference.id);
  }
  assert.equal(chooseReference(sandModel(1000000000n).volumeM3).id, 'bucket');
});
test('number explorer defines the mountain by volume rather than by height alone', () => {
  close(VOLUME_REFERENCES.find(reference => reference.id === 'mountain').volumeM3, 1047197551.1965976);
  close(compareVolume(sandModel(9600000000000000000n).volumeM3, 'mountain').ratio, 1);
});
test('number explorer reverses references within the rounding precision of one grain', () => {
  for (const diameterMm of [0.25, 0.5, 1]) {
    const oneGrain = sandModel(1n, diameterMm).volumeM3;
    for (const reference of VOLUME_REFERENCES) {
      const count = countForVolume(reference.id, diameterMm);
      assert.equal(typeof count, 'bigint');
      assert.ok(count > 0n && count <= MAX_COUNT);
      const rebuilt = sandModel(count, diameterMm).volumeM3;
      assert.ok(Math.abs(rebuilt - reference.volumeM3) <= oneGrain / 2 + reference.volumeM3 * 1e-14);
    }
  }
});
test('number explorer stays finite across all presets at its maximum count', () => {
  for (const diameterMm of [0.25, 0.5, 1]) for (const value of Object.values(sandModel(MAX_COUNT, diameterMm))) assert.ok(Number.isFinite(value) && value > 0);
  for (const result of [textModel(MAX_COUNT), countingModel(MAX_COUNT)]) for (const value of Object.values(result)) assert.ok(Number.isFinite(value) && value > 0);
});
test('number explorer rejects invalid model inputs before producing misleading amounts', () => {
  for (const count of [-1n, MAX_COUNT + 1n, 1, NaN]) {
    assert.throws(() => sandModel(count), RangeError);
    assert.throws(() => textModel(count), RangeError);
    assert.throws(() => countingModel(count), RangeError);
  }
  for (const value of [0, -1, NaN, Infinity]) {
    assert.throws(() => sandModel(1n, value), RangeError);
    assert.throws(() => sandModel(1n, 0.5, value), RangeError);
    assert.throws(() => textModel(1n, value), RangeError);
    assert.throws(() => countingModel(1n, value), RangeError);
  }
  assert.throws(() => sandModel(1n, 0.5, 1.1), RangeError);
  for (const value of [-1, NaN, Infinity]) {
    assert.throws(() => compareVolume(value, 'bucket'), RangeError);
    assert.throws(() => chooseReference(value), RangeError);
  }
  assert.throws(() => compareVolume(1, 'unknown'), RangeError);
  assert.throws(() => countForVolume('unknown'), RangeError);
});
