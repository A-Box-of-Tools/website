import test from 'node:test';
import assert from 'node:assert/strict';
import { BOOKKEEPING_RESERVE, ROW_RESERVE, WORKING_LIMIT, disposalCopies,
  gifWorkingBase, gifWorkingPlan, withWorkingBytes, headerWorkingPlan, previewRgba, requireWorking, requireZipEntries,
  retainedBuffers } from '../../tools/split-gif/src/working.js';

const frame = (changes = {}) => ({ width: 3, height: 2, disposal: 1, ...changes });
const gif = (changes = {}) => ({ width: 3, height: 2, frames: [frame()], ...changes });

test('source and preview copies fit an inclusive independently calculated ceiling', () => {
  const expected = BOOKKEEPING_RESERVE + ROW_RESERVE + 24 + 72;
  assert.equal(gifWorkingPlan(gif()).bytes, expected);
  assert.equal(gifWorkingPlan(gif(), { limitBytes: expected }).fits, true);
  assert.equal(gifWorkingPlan(gif(), { limitBytes: expected - 1 }).fits, false);
});

test('retained palette/index views count their original ArrayBuffers once', () => {
  const input = new ArrayBuffer(97), indices = new Uint8Array(6);
  const value = gif({ globalPalette: new Uint8Array(input, 0, 6), frames: [
    frame({ palette: new Uint8Array(input, 12, 6), indices }),
    frame({ palette: new Uint8Array(input, 36, 6), indices: indices.subarray(2) }),
  ] });
  assert.equal(retainedBuffers(value), 103);
});

test('disposal replacement budgets old and new snapshots while stored patches avoid them', () => {
  const value = gif({ frames: [frame({ disposal: 3 }), frame({ disposal: 3 })] });
  assert.equal(disposalCopies(value), 2);
  const base = BOOKKEEPING_RESERVE + 2 * ROW_RESERVE + 48;
  assert.equal(gifWorkingPlan(value).bytes, base + 120);
  assert.equal(gifWorkingPlan(value, { stored: true }).bytes, base + 72);
});

test('a tiny patch does not make a giant logical screen affordable', () => {
  const value = gif({ width: 65535, height: 65535, frames: [frame({ width: 1, height: 1 })] });
  assert.equal(gifWorkingPlan(value).fits, false);
  assert.equal(gifWorkingPlan(value).screenBytes, 17179344900);
  assert.equal(gifWorkingPlan(value, { stored: true }).fits, true);
});

test('preview dimensions, previous pixels and actual PNG bytes all contribute', () => {
  const value = gif({ width: 336, height: 168 });
  assert.equal(previewRgba(value), 168 * 84 * 4);
  assert.equal(previewRgba(value, true), 24);
  const first = gifWorkingPlan(value).bytes;
  assert.equal(gifWorkingPlan(value, { thumbnailBytes: 11, thumbnailRgbaBytes: 29 }).bytes, first + 40);
});

test('native sheet storage and archive ownership add to the source peak', () => {
  const base = gifWorkingPlan(gif()).bytes;
  assert.equal(gifWorkingPlan(gif(), { sheet: { width: 6, height: 4 } }).bytes, base + 192);
  assert.equal(gifWorkingPlan(gif(), { archiveBytes: 17, incomingBytes: 13 }).bytes, base + 73);
  assert.equal(gifWorkingPlan(gif(), { archiveBytes: WORKING_LIMIT }).fits, false);
});

test('unsafe allocation arithmetic is refused rather than rounded to a budget', () => {
  assert.equal(gifWorkingPlan(gif({ width: Number.MAX_SAFE_INTEGER, height: 2 })).fits, false);
  for (const field of ['archiveBytes', 'incomingBytes', 'thumbnailBytes', 'thumbnailRgbaBytes']) {
    for (const value of [-1, NaN, Infinity, 1.5]) assert.equal(gifWorkingPlan(gif(), { [field]: value }).reason, 'invalid');
  }
  assert.throws(() => requireWorking({ fits: false, reason: 'limit' }), /gif\.workinglimit/);
  assert.throws(() => requireWorking({ fits: false, reason: 'overflow' }), /gif\.workinginvalid/);
});

test('header admission refuses the full logical screen before patches are decoded', () => {
  const bytes = Uint8Array.from([...new TextEncoder().encode('GIF89a'), 255, 255, 255, 255, 0, 0, 0]);
  assert.equal(headerWorkingPlan(bytes).fits, false);
  bytes[6] = bytes[7] = 0;
  assert.equal(headerWorkingPlan(bytes), null);
  assert.equal(headerWorkingPlan(new Uint8Array(13)), null);
});

test('ordinary ZIP allows exactly 65,535 entries including the optional timing file', () => {
  assert.equal(requireZipEntries(65535, false), 65535);
  assert.equal(requireZipEntries(65534, true), 65535);
  for (const [frames, timing] of [[65536, false], [65535, true], [0, false]]) {
    assert.throws(() => requireZipEntries(frames, timing), error => error.message === 'zip.entries' && error.values.limit === 65535);
  }
});

test('frozen source estimates preserve inclusive dynamic-byte and sheet limits', () => {
  const expected = BOOKKEEPING_RESERVE + ROW_RESERVE + 24 + 72 + 192;
  const base = gifWorkingBase(gif(), { sheet: { width: 6, height: 4 }, limitBytes: expected + 73 });
  assert.equal(Object.isFrozen(base), true);
  assert.equal(base.bytes, expected);
  const added = { archiveBytes: 17, incomingBytes: 13 };
  assert.equal(withWorkingBytes(base, added).bytes, expected + 73);
  assert.equal(withWorkingBytes(base, added).fits, true);
  assert.equal(withWorkingBytes(base, { ...added, thumbnailBytes: 1 }).fits, false);
  assert.equal(base.bytes, expected);
});

test('returning byte checks never revisit a captured source or its frame buffers', () => {
  let reads = 0;
  const palette = new Uint8Array(9), indices = new Uint8Array(6);
  const value = gif({ globalPalette: palette, frames: [
    frame({ indices, disposal: 3 }), frame({ indices, disposal: 3 }),
  ] });
  Object.defineProperty(value, 'globalPalette', { get() { reads += 1; return palette; } });
  Object.defineProperty(value.frames[0], 'indices', { get() { reads += 1; return indices; } });
  const base = gifWorkingBase(value);
  const first = reads;
  assert.ok(first >= 2);
  assert.equal(base.bytes, BOOKKEEPING_RESERVE + 2 * ROW_RESERVE + 48 + 120 + 15);
  for (let at = 0; at < 1000; at += 1) {
    assert.equal(withWorkingBytes(base, { thumbnailBytes: at, incomingBytes: 7 }).bytes, base.bytes + at + 21);
  }
  assert.equal(reads, first);
});

test('frozen dynamic totals retain invalid, overflow and refused-source classifications', () => {
  const base = gifWorkingBase(gif());
  assert.equal(withWorkingBytes(base, { incomingBytes: Number.MAX_SAFE_INTEGER }).reason, 'overflow');
  for (const field of ['archiveBytes', 'incomingBytes', 'thumbnailBytes', 'thumbnailRgbaBytes']) {
    assert.equal(withWorkingBytes(base, { [field]: -1 }).reason, 'invalid');
  }
  const refused = gifWorkingBase(gif({ width: 65535, height: 65535 }));
  assert.equal(withWorkingBytes(refused, { incomingBytes: 1 }), refused);
});
