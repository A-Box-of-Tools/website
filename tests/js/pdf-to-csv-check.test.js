/** Balance agreement and coverage are different answers, and both matter. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { checkBalance } from '../../tools/pdf-to-csv/src/check.js';

const check = (cells) => checkBalance(cells.map((row) => ({ cells: row })), [0, 1], '.');

test('amounts before the first balance and after the last stay unchecked', () => {
  const proof = check([
    ['777777.00', ''], ['999999.00', '100.00'], ['10.00', '110.00'],
    ['10.00', '120.00'], ['10.00', '130.00'], ['777777.00', ''],
  ]);
  assert.equal(proof.held, 3);
  assert.deepEqual(proof.broken, []);
  assert.deepEqual(proof.checked, [3, 4, 5]);
  assert.deepEqual(proof.unchecked, [1, 2, 6]);
});

test('daily balances compare the sum and cover every amount in that interval', () => {
  const proof = check([
    ['0.00', '100.00'], ['4.00', ''], ['6.00', '110.00'],
    ['10.00', '120.00'], ['10.00', '130.00'],
  ]);
  assert.equal(proof.links, 3);
  assert.equal(proof.held, 3);
  assert.deepEqual(proof.checked, [2, 3, 4, 5]);
  assert.deepEqual(proof.unchecked, [1]);
});

test('an unreadable amount leaves its whole daily interval unchecked', () => {
  const proof = check([
    ['0.00', '100.00'], ['4.00', ''], ['unreadable', ''], ['6.00', '110.00'],
    ['10.00', '120.00'], ['10.00', '130.00'], ['10.00', '140.00'],
  ]);
  assert.equal(proof.links, 3);
  assert.equal(proof.held, 3);
  assert.deepEqual(proof.checked, [5, 6, 7]);
  assert.deepEqual(proof.unchecked, [1, 2, 3, 4]);
});

test('a missing signed amount is unknown even when the balance is unchanged', () => {
  const proof = check([
    ['0.00', '100.00'], ['', '100.00'], ['10.00', '110.00'],
    ['10.00', '120.00'], ['10.00', '130.00'],
  ]);
  assert.equal(proof.links, 3);
  assert.deepEqual(proof.unchecked, [1, 2]);
});

test('an unreadable balance leaves the containing interval unchecked', () => {
  const proof = check([
    ['0.00', '100.00'], ['10.00', 'unreadable'], ['10.00', '120.00'],
    ['10.00', '130.00'], ['10.00', '140.00'], ['10.00', '150.00'],
  ]);
  assert.equal(proof.links, 3);
  assert.deepEqual(proof.unchecked, [1, 2, 3]);
});

test('an unused debit cell is zero, but an unreadable debit is not', () => {
  const rows = [
    ['', '1.00', '100.00'], ['unreadable', '', '100.00'],
    ['', '10.00', '110.00'], ['5.00', '', '105.00'], ['', '10.00', '115.00'],
  ].map((cells) => ({ cells }));
  const proof = checkBalance(rows, [0, 1, 2], '.');
  assert.equal(proof.credited, true);
  assert.deepEqual(proof.amounts, [0, 1]);
  assert.equal(proof.held, 3);
  assert.deepEqual(proof.unchecked, [1, 2]);
});
