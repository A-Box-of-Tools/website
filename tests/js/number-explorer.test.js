import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAX_COUNT, PLANET_REFERENCES, STAR_REFERENCES, TIME_REFERENCES, VOLUME_LADDER, VOLUME_REFERENCES, bookModel, booksPerUnit, compareVolume, countForSize, countForVolume, countText, countingModel, dialCount, heightLadder, ladderFor, log10Count, parseCount, placeOnLadder, roundUpCount, sandModel, sizePerUnit, textModel, waterModel } from '../../tools/number-explorer/src/scale.js';
import { CONTAINERS, containerIndex, levelForShare } from '../../tools/number-explorer/src/containers.js';
import { circleGroup, starLevel } from '../../tools/number-explorer/src/scene-stars.js';

function close(actual, expected, tolerance = 1e-10) {
  assert.ok(Number.isFinite(actual));
  assert.ok(Math.abs(actual - expected) <= Math.max(Number.EPSILON, Math.abs(expected) * tolerance), `${actual} differs from ${expected}`);
}

test('number explorer preserves exact counts across accepted input forms', () => {
  for (const input of ['1000000000', '1,000,000,000', '1 000 000 000', '1b', '1 billion', '1e9']) assert.deepEqual(parseCount(input), { ok: true, count: 1000000000n });
  assert.deepEqual(parseCount(' 1.5B '), { ok: true, count: 1500000000n });
  assert.deepEqual(parseCount('.5 thousand'), { ok: true, count: 500n });
  assert.deepEqual(parseCount('1,234.5k'), { ok: true, count: 1234500n });
  assert.deepEqual(parseCount('1 000 000'), { ok: true, count: 1000000n });
  assert.deepEqual(parseCount('1 000'), { ok: true, count: 1000n });
  assert.deepEqual(parseCount('10e-1'), { ok: true, count: 1n });
  assert.deepEqual(parseCount('9007199254740993'), { ok: true, count: 9007199254740993n });
});
test('number explorer supports named suffixes without combining them with exponents', () => {
  const cases = [['2k', 2000n], ['2 thousand', 2000n], ['2m', 2000000n], ['2 million', 2000000n], ['2b', 2000000000n], ['2 billion', 2000000000n], ['2t', 2000000000000n], ['2 trillion', 2000000000000n]];
  for (const [input, count] of cases) assert.deepEqual(parseCount(input), { ok: true, count });
  assert.deepEqual(parseCount('1e3k'), { ok: false, key: 'amount-invalid' });
});
test('number explorer names every power up to its largest count', () => {
  const names = [['quadrillion', 15n], ['quintillion', 18n], ['sextillion', 21n], ['septillion', 24n], ['octillion', 27n], ['nonillion', 30n]];
  for (const [name, power] of names) assert.deepEqual(parseCount(`1 ${name}`), { ok: true, count: 10n ** power });
  assert.deepEqual(parseCount('2 nonillion'), { ok: false, key: 'amount-too-large' });
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
test('number explorer turns the default billion drops into fifty thousand liters', () => {
  const result = waterModel(1000000000n);
  close(result.liters, 50000);
  close(result.volumeM3, 50);
  close(waterModel(1000000000n, 0.25).liters, 250000);
  close(compareVolume(result.volumeM3, 'pool').ratio, 0.02);
  close(compareVolume(result.volumeM3, 'bath').ratio, 250);
});
test('number explorer stacks a billion default books about 30,000 km high', () => {
  const { heightM, books, words } = bookModel(1000000000n);
  close(heightM, 30000000);
  assert.equal(books, 1000000000);
  assert.equal(words, 75000000000000);
  close(bookModel(1000000000n, { thicknessM: 0.05 }).heightM, 50000000);
});
test('number explorer distinguishes reference books from token counts', () => {
  assert.deepEqual(textModel(100000n), { words: 75000, books: 1 });
  assert.deepEqual(textModel(100000n, 150000), { words: 75000, books: 0.5 });
});
test('number explorer turns words and tokens into shares of a book, not books of their own', () => {
  const tokens = bookModel(1000000n, { unit: 'token' });
  assert.equal(tokens.books, 10);
  close(tokens.heightM, 0.3);
  assert.equal(bookModel(75000n, { unit: 'word' }).books, 1);
  assert.equal(booksPerUnit('book'), 1);
  close(booksPerUnit('token', 150000), 0.75 / 150000);
  assert.equal(textModel(1000000n).books, tokens.books);
});
test('number explorer counts continuously at the selected rate with a defined year length', () => {
  assert.equal(countingModel(60n).seconds, 60);
  assert.equal(countingModel(60n, 2).seconds, 30);
  close(countingModel(31557600n).years, 1);
});
test('number explorer gives empty counts zero amounts without an infinite inverse', () => {
  assert.deepEqual(sandModel(0n), { volumeM3: 0, liters: 0, cubeSideM: 0 });
  assert.deepEqual(waterModel(0n), { volumeM3: 0, liters: 0, cubeSideM: 0 });
  assert.deepEqual(bookModel(0n), { books: 0, words: 0, heightM: 0 });
  assert.deepEqual(textModel(0n), { words: 0, books: 0 });
  assert.deepEqual(countingModel(0n), { seconds: 0, years: 0 });
  assert.deepEqual(compareVolume(0, 'bucket'), { ratio: 0, inverse: null });
});
test('number explorer compares like volumes', () => {
  const buckets = compareVolume(0.2, 'bucket');
  close(buckets.ratio, 20);
  close(buckets.inverse, 0.05);
  for (const reference of VOLUME_LADDER) close(compareVolume(reference.size, reference.id).ratio, 1);
});
test('number explorer defines the mountain by volume rather than by height alone', () => {
  close(VOLUME_REFERENCES.find(reference => reference.id === 'mountain').size, 1047197551.1965976);
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
      assert.ok(Math.abs(rebuilt - reference.size) <= oneGrain / 2 + reference.size * 1e-14);
    }
  }
});
test('number explorer stays finite across all presets at its maximum count', () => {
  for (const diameterMm of [0.25, 0.5, 1]) for (const value of Object.values(sandModel(MAX_COUNT, diameterMm))) assert.ok(Number.isFinite(value) && value > 0);
  for (const dropMl of [0.05, 0.25]) for (const value of Object.values(waterModel(MAX_COUNT, dropMl))) assert.ok(Number.isFinite(value) && value > 0);
  for (const result of [textModel(MAX_COUNT), countingModel(MAX_COUNT), bookModel(MAX_COUNT)]) for (const value of Object.values(result)) assert.ok(Number.isFinite(value) && value > 0);
});
test('number explorer rejects invalid model inputs before producing misleading amounts', () => {
  for (const count of [-1n, MAX_COUNT + 1n, 1, NaN]) {
    assert.throws(() => sandModel(count), RangeError);
    assert.throws(() => waterModel(count), RangeError);
    assert.throws(() => bookModel(count), RangeError);
    assert.throws(() => textModel(count), RangeError);
    assert.throws(() => countingModel(count), RangeError);
  }
  for (const value of [0, -1, NaN, Infinity]) {
    assert.throws(() => sandModel(1n, value), RangeError);
    assert.throws(() => sandModel(1n, 0.5, value), RangeError);
    assert.throws(() => waterModel(1n, value), RangeError);
    assert.throws(() => bookModel(1n, { thicknessM: value }), RangeError);
    assert.throws(() => bookModel(1n, { wordsPerBook: value }), RangeError);
    assert.throws(() => heightLadder(value), RangeError);
    assert.throws(() => textModel(1n, value), RangeError);
    assert.throws(() => countingModel(1n, value), RangeError);
  }
  assert.throws(() => sandModel(1n, 0.5, 1.1), RangeError);
  for (const value of [-1, NaN, Infinity]) assert.throws(() => compareVolume(value, 'bucket'), RangeError);
  assert.throws(() => compareVolume(1, 'unknown'), RangeError);
  assert.throws(() => countForVolume('unknown'), RangeError);
  assert.throws(() => sizePerUnit('unknown'), RangeError);
  assert.throws(() => ladderFor('unknown'), RangeError);
});

test('number explorer keeps every ladder running smallest to largest', () => {
  const ladders = { STAR_REFERENCES, TIME_REFERENCES, VOLUME_LADDER, thin: heightLadder(0.02), default: heightLadder(0.03), thick: heightLadder(0.05) };
  for (const [name, rungs] of Object.entries(ladders)) {
    for (let i = 1; i < rungs.length; i++) assert.ok(rungs[i - 1].size < rungs[i].size, `${name}: ${rungs[i - 1].id} before ${rungs[i].id}`);
    assert.equal(new Set(rungs.map(rung => rung.id)).size, rungs.length, name);
  }
  assert.deepEqual([...VOLUME_LADDER], [...VOLUME_REFERENCES, ...PLANET_REFERENCES]);
});
test('number explorer moves book-count landmarks with thickness and leaves heights alone', () => {
  const size = (thickness, id) => heightLadder(thickness).find(rung => rung.id === id).size;
  close(size(0.03, 'congress'), 25.77e6 * 0.03);
  close(size(0.05, 'congress') / size(0.03, 'congress'), 5 / 3);
  assert.equal(size(0.03, 'moon'), size(0.05, 'moon'));
});
test('number explorer places a value between the landmarks either side of it', () => {
  const rungs = [{ id: 'a', size: 10 }, { id: 'b', size: 100 }];
  assert.deepEqual(placeOnLadder(1, rungs), { index: -1, below: null, above: rungs[0], times: null, share: 0.1 });
  assert.deepEqual(placeOnLadder(50, rungs), { index: 0, below: rungs[0], above: rungs[1], times: 5, share: 0.5 });
  assert.deepEqual(placeOnLadder(1000, rungs), { index: 1, below: rungs[1], above: null, times: 10, share: null });
  // A count worked back from a landmark has reached it, not stopped just short.
  assert.equal(placeOnLadder(100 * (1 - 1e-14), rungs).below.id, 'b');
});
test('number explorer places the default numbers where the page says they are', () => {
  const books = placeOnLadder(Number(bookModel(1000000000n).heightM), heightLadder());
  assert.equal(books.above.id, 'around');
  close(placeOnLadder(30000000, heightLadder()).share, 30000000 / 40075000);
  close(placeOnLadder(30000000, heightLadder().filter(rung => rung.id === 'moon')).share, 30000000 / 3.844e8);
  assert.equal(placeOnLadder(1e9, STAR_REFERENCES).above.id, 'milkyway');
  close(placeOnLadder(1e9, STAR_REFERENCES).share, 0.01);
  assert.equal(placeOnLadder(1e9, TIME_REFERENCES).below.id, 'decade');
});
test('number explorer measures one counted thing in each world', () => {
  const settings = { unit: 'book', thicknessM: 0.03, wordsPerBook: 75000, dropMl: 0.05, diameterMm: 0.5, rate: 10 };
  close(sizePerUnit('books', settings), bookModel(1n, settings).heightM);
  close(sizePerUnit('books', { ...settings, unit: 'token' }), bookModel(1n, { ...settings, unit: 'token' }).heightM);
  close(sizePerUnit('water', settings), waterModel(1n, 0.05).volumeM3);
  close(sizePerUnit('sand', settings), sandModel(1n, 0.5).volumeM3);
  assert.equal(sizePerUnit('stars', settings), 1);
  assert.equal(sizePerUnit('time', settings), 0.1);
});
test('number explorer works back to a count that reaches a landmark', () => {
  const perUnit = sizePerUnit('books');
  const reach = countForSize(3.844e8, perUnit);
  assert.ok(Number(reach) * perUnit >= 3.844e8);
  assert.equal(reach, 12900000000n);
  assert.equal(countForSize(1, 1), 1n);
  assert.equal(countForSize(0.001, 1), 1n);
  assert.equal(countForSize(1e40, 1), null);
  assert.equal(countForSize(Infinity, 1), null);
});
test('number explorer rounds a worked-back count up, within the largest count', () => {
  assert.equal(roundUpCount(12813333334n), 12900000000n);
  assert.equal(roundUpCount(12800000000n), 12800000000n);
  assert.equal(roundUpCount(999n), 999n);
  assert.equal(roundUpCount(1001n), 1010n);
  assert.equal(roundUpCount(9991n), 10000n);
  assert.equal(roundUpCount(MAX_COUNT - 1n), MAX_COUNT);
});
test('number explorer reads the power of ten of a count of any length', () => {
  assert.equal(log10Count(0n), 0);
  assert.equal(log10Count(1n), 0);
  close(log10Count(1000n), 3);
  close(log10Count(MAX_COUNT), 30);
  close(log10Count(3n * 10n ** 25n), 25 + Math.log10(3));
  close(log10Count(123456789012345678901234n), Math.log10(1.23456789012345) + 23, 1e-9);
});
test('number explorer lands the dial on readable counts within its range', () => {
  assert.equal(dialCount(0), 1n);
  assert.equal(dialCount(-1), 1n);
  assert.equal(dialCount(9), 1000000000n);
  assert.equal(dialCount(9.01), 1000000000n);
  assert.equal(dialCount(0.5), 3n);
  assert.equal(dialCount(3.3), 2000n);
  assert.equal(dialCount(30), MAX_COUNT);
  assert.equal(dialCount(31), MAX_COUNT);
  for (let position = 0; position <= 30; position += 0.137) {
    const count = dialCount(position);
    assert.ok(count >= 1n && count <= MAX_COUNT, String(position));
    assert.ok(count.toString().replace(/0+$/, '').length <= 2, `${position}: ${count}`);
    // Below ten there are only whole numbers to land on, and they are far apart.
    assert.ok(Math.abs(log10Count(count) - position) < (position < 1 ? 0.18 : 0.06), `${position}: ${count}`);
  }
});
test('number explorer writes back only what its own parser reads', () => {
  const counts = [0n, 1n, 999n, 1000n, 1234567n, 999999999999999n, 10n ** 15n, 12n * 10n ** 17n, 1234n * 10n ** 20n, 12345n * 10n ** 20n, 9007199254740993n, MAX_COUNT];
  for (const count of counts) assert.deepEqual(parseCount(countText(count)), { ok: true, count }, count.toString());
  assert.equal(countText(1000000000n), '1,000,000,000');
  assert.equal(countText(MAX_COUNT), '1e30');
  assert.equal(countText(12n * 10n ** 17n), '1.2e18');
});

test('number explorer has a container shape for every volume on its ladder', () => {
  for (const rung of VOLUME_LADDER) assert.ok(CONTAINERS[rung.id], rung.id);
});
test('number explorer fills a container by area rather than by height', () => {
  const square = [[0, 0], [1, 0], [1, 1], [0, 1]];
  close(levelForShare(square, 0.25), 0.75, 1e-3);
  // A cone is half full by area well below half its height.
  const cone = [[0.5, 0], [1, 1], [0, 1]];
  close(levelForShare(cone, 0.5), Math.SQRT1_2, 1e-2);
  assert.equal(levelForShare(cone, 0), 1);
  assert.equal(levelForShare(cone, 1), 0);
});
test('number explorer raises the level steadily in every container', () => {
  for (const [id, { inside }] of Object.entries(CONTAINERS)) {
    let last = Infinity;
    for (let share = 0; share <= 1.0001; share += 0.05) {
      const level = levelForShare(inside, share);
      assert.ok(level < last + 1e-9, `${id} at ${share}`);
      assert.ok(level >= -1e-9 && level <= 1 + 1e-9, `${id} at ${share}`);
      last = level;
    }
  }
});
test('number explorer pours into the smallest container not yet overflowing', () => {
  const rungs = [{ size: 1 }, { size: 10 }];
  assert.equal(containerIndex(0, rungs), 0);
  assert.equal(containerIndex(1, rungs), 0);
  assert.equal(containerIndex(1.5, rungs), 1);
  assert.equal(containerIndex(100, rungs), 1);
});
test('number explorer says how many stars one dot stands for at every scale', () => {
  assert.deepEqual(starLevel(1), { id: 'sky', perDot: 1 });
  assert.deepEqual(starLevel(9100), { id: 'sky', perDot: 1 });
  assert.equal(starLevel(9101).id, 'ball');
  assert.equal(starLevel(1e7).id, 'ball');
  assert.equal(starLevel(1e11).id, 'spiral');
  assert.equal(starLevel(1e15).id, 'galaxies');
  assert.equal(starLevel(1e23).id, 'web');
  assert.equal(starLevel(1e24).id, 'multi');
  assert.equal(circleGroup(50), 1);
  assert.equal(circleGroup(1000), 10);
  assert.equal(circleGroup(1e7), 1e5);
  for (const universes of [101, 5000, 1e7]) assert.ok(universes / circleGroup(universes) <= 100);
});
