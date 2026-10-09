/** Page windows stay bounded and use the row numbers shown by balance checks. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { previewWindow } from '../../tools/pdf-to-csv/src/preview.js';

test('jumps reach boundary and final rows without dropping the partial last page', () => {
  assert.deepEqual(previewWindow(65, 1), { start: 0, end: 25 });
  assert.deepEqual(previewWindow(65, 25), { start: 0, end: 25 });
  assert.deepEqual(previewWindow(65, 26), { start: 25, end: 50 });
  assert.deepEqual(previewWindow(65, 65), { start: 50, end: 65 });
  assert.deepEqual(previewWindow(0, 1), { start: 0, end: 0 });
});

test('out-of-range and nonfinite requested rows stay within the table', () => {
  assert.deepEqual(previewWindow(3, -9), { start: 0, end: 3 });
  assert.deepEqual(previewWindow(65, 1000), { start: 50, end: 65 });
  assert.deepEqual(previewWindow(65, NaN), { start: 0, end: 25 });
  assert.deepEqual(previewWindow(65, Infinity), { start: 0, end: 25 });
});

test('every valid target lies in a window of at most 25 rows, including a large table', () => {
  for (const total of [1, 24, 25, 26, 50, 65, 1000000]) {
    for (const row of [1, Math.ceil(total / 2), total]) {
      const { start, end } = previewWindow(total, row);
      assert.ok(start <= row - 1 && end >= row);
      assert.ok(start >= 0 && end <= total && end - start <= 25);
    }
  }
});
