/**
 * The reconstruction: layout.js, rows.js and check.js together.
 *
 * The pages here are built out of positioned runs rather than out of PDFs. The
 * geometry *is* what is under test - where a run sits decides which column it
 * lands in - and writing it directly is the only way to cover a right-aligned
 * amount column, a description wrapped onto a second line, a heading repeated
 * on page three and a balance chain with one row missing, none of which a
 * corpus of real statements could be committed here to demonstrate.
 *
 * The example statement exercises the same code through a real PDF; that is
 * what the page's own example is for. This file is for the layouts the example
 * is not.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { findColumns, intoCells } from '../../tools/bank-statement-to-csv/src/layout.js';
import { buildTable } from '../../tools/bank-statement-to-csv/src/rows.js';
import { checkBalance } from '../../tools/bank-statement-to-csv/src/check.js';

/** One line of text, from `[x, 'words']` pairs. Every run is 6pt a character,
 *  which is close enough to a proportional face for a gutter test. */
function line(y, pieces, height = 11) {
  const runs = [];
  for (const [x, text] of pieces) {
    let at = x;
    for (const word of String(text).split(' ')) {
      runs.push({ text: word, x0: at, x1: at + word.length * 6 });
      at += word.length * 6 + 6;
    }
  }
  return { y, runs, height };
}

/** The same, but with each piece ending at `x` instead of starting there -
 *  which is how every statement sets a column of amounts. */
function rightAligned(y, pieces, height = 11) {
  return line(y, pieces.map(([x, text]) => [x - String(text).length * 6, text]), height);
}

const cellsOf = (columns) => (l) => intoCells(l, columns);

/* --------------------------------------------------------------- the columns */

test('columns are found from the strips nothing is printed in', () => {
  const lines = [
    line(700, [[56, 'Date'], [140, 'Description'], [400, 'Amount']], 9),
    line(680, [[56, '2026-01-04'], [140, 'ACME LTD'], [400, '1240.00']]),
    line(660, [[56, '2026-01-07'], [140, 'UTILITIES'], [400, '-86.40']]),
    line(640, [[56, '2026-01-11'], [140, 'K TANAKA'], [400, '318.50']]),
  ];

  const columns = findColumns(lines);
  assert.equal(columns.length, 3);
  assert.deepEqual(intoCells(lines[1], columns),
    ['2026-01-04', 'ACME LTD', '1240.00']);
});

test('a title lying across every column does not erase the gutters under it', () => {
  const lines = [
    // Set large, like every statement's own name at the top of the page.
    line(760, [[56, 'FIRST NATIONAL BANK STATEMENT OF ACCOUNT']], 22),
    line(700, [[56, 'Date'], [140, 'Description'], [400, 'Amount']], 9),
    line(680, [[56, '2026-01-04'], [140, 'ACME LTD'], [400, '1240.00']]),
    line(660, [[56, '2026-01-07'], [140, 'UTILITIES'], [400, '-86.40']]),
    line(640, [[56, '2026-01-11'], [140, 'K TANAKA'], [400, '318.50']]),
  ];

  assert.equal(findColumns(lines).length, 3);
});

test('a right-aligned column of amounts is still one column', () => {
  const lines = [
    line(700, [[56, 'Date'], [140, 'Description']], 9),
    ...[['2026-01-04', 'ACME LTD', '1,240.00'],
      ['2026-01-07', 'UTILITIES', '-86.40'],
      ['2026-01-11', 'K TANAKA', '318.50'],
      ['2026-01-18', 'L OKAFOR', '2,905.75']].map(([date, who, sum], at) => ({
      ...line(680 - at * 20, [[56, date], [140, who]]),
    })).map((l, at) => ({
      ...l,
      runs: [...l.runs, ...rightAligned(0, [[460, ['1,240.00', '-86.40', '318.50', '2,905.75'][at]]]).runs],
    })),
  ];

  const columns = findColumns(lines);
  assert.equal(columns.length, 3);
  assert.deepEqual(intoCells(lines[1], columns), ['2026-01-04', 'ACME LTD', '1,240.00']);
  assert.deepEqual(intoCells(lines[4], columns), ['2026-01-18', 'L OKAFOR', '2,905.75']);
});

/* ------------------------------------------------------------------ the rows */

/** A page of the same three-column statement, with whatever extra lines. */
function statement(extra = []) {
  const rows = [
    ['2026-01-04', 'ACME LTD', '1240.00', '4740.00'],
    ['2026-01-07', 'UTILITIES', '-86.40', '4653.60'],
    ['2026-01-11', 'K TANAKA', '318.50', '4972.10'],
    ['2026-01-18', 'L OKAFOR', '2905.75', '7877.85'],
  ];
  return [
    line(700, [[56, 'Date'], [140, 'Description'], [340, 'Amount'], [460, 'Balance']], 9),
    ...rows.map(([date, who, sum, balance], at) => line(680 - at * 20,
      [[56, date], [140, who], [340, sum], [460, balance]])),
    ...extra,
  ];
}

test('a wrapped description is folded into the row above, not left as a row', () => {
  const lines = statement();
  // The payee ran on: a second line under the description with nothing beside it.
  lines.splice(2, 0, line(670, [[140, 'TRADING AS ACME SUPPLIES']]));

  const columns = findColumns(lines);
  const table = buildTable([{ number: 1, lines }], cellsOf(columns), { order: 'dmy' });

  assert.equal(table.rows.length, 4);
  assert.equal(table.rows[0].cells[1], 'ACME LTD TRADING AS ACME SUPPLIES');
  assert.deepEqual(table.headers, ['Date', 'Description', 'Amount', 'Balance']);
});

test('a heading repeated on the next page is dropped, not read as a row', () => {
  const first = statement();
  const second = statement();

  const columns = findColumns([...first, ...second]);
  const table = buildTable(
    [{ number: 1, lines: first }, { number: 2, lines: second }],
    cellsOf(columns), { order: 'dmy' });

  assert.equal(table.rows.length, 8);
  assert.ok(table.skipped >= 2, `expected the two headings dropped, got ${table.skipped}`);
  assert.ok(!table.rows.some((row) => row.cells[0] === 'Date'));
});

test('a carried total has money but no date, and is not folded into anything', () => {
  const lines = statement([
    line(590, [[140, 'BALANCE CARRIED FORWARD'], [460, '7877.85']]),
  ]);

  const columns = findColumns(lines);
  const table = buildTable([{ number: 1, lines }], cellsOf(columns), { order: 'dmy' });

  assert.equal(table.rows.length, 4);
  assert.ok(!table.rows[3].cells[1].includes('CARRIED'));
});

test('a column of reference numbers is not mistaken for money', () => {
  const lines = [
    line(700, [[56, 'Date'], [140, 'Cheque'], [300, 'Description'], [460, 'Amount']], 9),
    line(680, [[56, '2026-01-04'], [140, '0001234'], [300, 'ACME'], [460, '1240.00']]),
    line(660, [[56, '2026-01-07'], [140, '0001235'], [300, 'UTILITIES'], [460, '-86.40']]),
    line(640, [[56, '2026-01-11'], [140, '0001236'], [300, 'TANAKA'], [460, '318.50']]),
  ];

  const columns = findColumns(lines);
  const table = buildTable([{ number: 1, lines }], cellsOf(columns), { order: 'dmy' });

  assert.deepEqual(table.moneyColumns, [3],
    'the cheque numbers have no pence, so they are not money');
});

/* ----------------------------------------------------------------- the proof */

test('the balance column is found by the arithmetic, not by its heading', () => {
  const lines = statement();
  const columns = findColumns(lines);
  const table = buildTable([{ number: 1, lines }], cellsOf(columns), { order: 'dmy' });

  const proof = checkBalance(table.rows, table.moneyColumns, '.');
  assert.ok(proof, 'the chain should have been found');
  assert.equal(proof.balance, 3);
  assert.deepEqual(proof.amounts, [2]);
  assert.equal(proof.held, proof.links);
  assert.deepEqual(proof.broken, []);
});

test('a misread amount breaks the chain at the row it happened on', () => {
  const lines = statement();
  const columns = findColumns(lines);
  const table = buildTable([{ number: 1, lines }], cellsOf(columns), { order: 'dmy' });

  // 318.50 read as 31850, which is exactly the kind of mistake a decimal point
  // in the wrong place makes and exactly what nobody would spot by eye.
  table.rows[2].cells[2] = '31850.00';

  const proof = checkBalance(table.rows, table.moneyColumns, '.');
  assert.ok(proof, 'the balance column is still recognisable');
  assert.deepEqual(proof.broken, [3]);
});

test('a dropped row breaks the chain, which is the point of checking', () => {
  const lines = statement();
  const columns = findColumns(lines);
  const table = buildTable([{ number: 1, lines }], cellsOf(columns), { order: 'dmy' });

  table.rows.splice(1, 1);

  const proof = checkBalance(table.rows, table.moneyColumns, '.');
  assert.ok(!proof || proof.broken.length > 0,
    'losing a transaction must not leave a chain that still adds up');
});

test('separate debit and credit columns are one more shape of the same chain', () => {
  const rows = [
    ['2026-01-04', 'ACME LTD', '', '1240.00', '4740.00'],
    ['2026-01-07', 'UTILITIES', '86.40', '', '4653.60'],
    ['2026-01-11', 'K TANAKA', '', '318.50', '4972.10'],
    ['2026-01-18', 'L OKAFOR', '', '2905.75', '7877.85'],
    ['2026-01-22', 'INSURANCE', '212.00', '', '7665.85'],
  ];
  const lines = [
    line(700, [[56, 'Date'], [140, 'Description'], [300, 'Paid out'],
      [390, 'Paid in'], [480, 'Balance']], 9),
    ...rows.map(([date, who, out, into, balance], at) => line(680 - at * 20,
      [[56, date], [140, who], ...(out ? [[300, out]] : []),
        ...(into ? [[390, into]] : []), [480, balance]])),
  ];

  const columns = findColumns(lines);
  const table = buildTable([{ number: 1, lines }], cellsOf(columns), { order: 'dmy' });
  const proof = checkBalance(table.rows, table.moneyColumns, '.');

  assert.ok(proof, 'a debit and a credit column should still balance');
  assert.equal(proof.credited, true);
  assert.equal(proof.held, proof.links);
  assert.deepEqual(proof.amounts, [2, 3], 'paid out is the debit, paid in the credit');
});

test('a statement with no balance is reported as unproven rather than wrong', () => {
  const lines = [
    line(700, [[56, 'Date'], [140, 'Description'], [400, 'Amount']], 9),
    line(680, [[56, '2026-01-04'], [140, 'ACME LTD'], [400, '1240.00']]),
    line(660, [[56, '2026-01-07'], [140, 'UTILITIES'], [400, '-86.40']]),
    line(640, [[56, '2026-01-11'], [140, 'K TANAKA'], [400, '318.50']]),
    line(620, [[56, '2026-01-18'], [140, 'L OKAFOR'], [400, '2905.75']]),
  ];

  const columns = findColumns(lines);
  const table = buildTable([{ number: 1, lines }], cellsOf(columns), { order: 'dmy' });

  assert.equal(table.rows.length, 4);
  assert.equal(checkBalance(table.rows, table.moneyColumns, '.'), null);
});
