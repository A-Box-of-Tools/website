/**
 * The reconstruction: layout.js, tables.js, rows.js and check.js together.
 *
 * Most pages here are built out of positioned runs rather than out of PDFs.
 * The geometry *is* what is under test - where a run sits decides which region,
 * table and column it lands in - and writing it directly is the only way to
 * cover a sidebar a fraction of a point off the table's baselines, a heading
 * repeated on page three or a balance chain with one row missing without a
 * corpus of real statements, which could not be committed here anyway.
 *
 * The last tests build a real PDF with the layout of the statement that broke
 * the first version of this tool - every name and number invented - and read
 * it through the same reader the page uses, because the failure that prompted
 * all of this was invisible until a real document went through the whole chain.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { findTables } from '../../tools/pdf-to-csv/src/tables.js';
import { buildTable } from '../../tools/pdf-to-csv/src/rows.js';
import { checkBalance } from '../../tools/pdf-to-csv/src/check.js';
import { pageRuns } from '../../tools/pdf-to-csv/src/layout.js';
import { PdfDocument } from '../../shared/js/pdf-reader.js';
import { pagesOf, readPage } from '../../shared/js/pdf-text.js';
import { base14Widths, WIN_ANSI } from '../../shared/js/pdf-base14.js';
import { buildPdf } from './pdf-fixtures.js';

/** One line of text from `[x, 'words']` pairs, every character six points
 *  wide and three points between words - about the proportions of real type,
 *  which matters, because whether two words are one cell or two is decided by
 *  how far apart they are compared with the size they are set in. Every run
 *  sits on the line's baseline unless a piece says otherwise. */
function line(y, pieces, height = 11) {
  const runs = [];
  for (const [x, text, baseline = y] of pieces) {
    let at = x;
    for (const word of String(text).split(' ')) {
      runs.push({ text: word, x0: at, x1: at + word.length * 6, y: baseline });
      at += word.length * 6 + 3;
    }
  }
  return { y, runs, height };
}

/** The same, with each piece ending at `x` - how a column of amounts is set. */
const right = (x, text) => [x - String(text).length * 6, text];

const page = (lines, number = 1) => ({ number, lines });

/** Every table in some pages, built, with its rows as plain arrays. */
function tablesIn(pages, options = {}) {
  return findTables(pages).map((table) => buildTable(table, { order: 'dmy', mark: '.', ...options }))
    .filter((table) => table.rows.length);
}

const cells = (table) => table.rows.map((row) => row.cells);

/* ------------------------------------------------------------- the columns */

test('columns are found from what lines up, and a row needs no date', () => {
  const [table] = tablesIn([page([
    line(700, [[56, 'Item'], [220, 'Size'], right(460, 'Price')], 9),
    line(680, [[56, 'Oak table'], [220, 'Large'], right(460, '420.00')]),
    line(660, [[56, 'Pine shelf'], [220, 'Small'], right(460, '89.50')]),
    line(640, [[56, 'Birch stool'], [220, 'Medium'], right(460, '64.00')]),
  ])]);

  assert.deepEqual(table.headers, ['Item', 'Size', 'Price']);
  assert.deepEqual(cells(table), [
    ['Oak table', 'Large', '420.00'],
    ['Pine shelf', 'Small', '89.50'],
    ['Birch stool', 'Medium', '64.00'],
  ]);
});

test('a title set large across every column is a heading, not a row', () => {
  const [table] = tablesIn([page([
    line(760, [[56, 'FIRST NATIONAL BANK STATEMENT OF ACCOUNT']], 22),
    line(700, [[56, 'Date'], [140, 'Description'], right(460, 'Amount')], 9),
    line(680, [[56, '2026-01-04'], [140, 'ACME LTD'], right(460, '1240.00')]),
    line(660, [[56, '2026-01-07'], [140, 'UTILITIES'], right(460, '-86.40')]),
    line(640, [[56, '2026-01-11'], [140, 'K TANAKA'], right(460, '318.50')]),
  ])]);

  assert.equal(table.headers.length, 3);
  assert.equal(table.rows.length, 3);
  assert.ok(!cells(table).flat().some((cell) => cell.includes('NATIONAL')));
});

test('a right-aligned column of amounts of different widths is one column', () => {
  const [table] = tablesIn([page([
    line(700, [[56, 'Date'], [140, 'Description'], right(460, 'Amount')], 9),
    line(680, [[56, '2026-01-04'], [140, 'ACME LTD'], right(460, '1,240.00')]),
    line(660, [[56, '2026-01-07'], [140, 'UTILITIES'], right(460, '-86.40')]),
    line(640, [[56, '2026-01-18'], [140, 'L OKAFOR'], right(460, '12,905.75')]),
  ])]);

  assert.deepEqual(cells(table).map((row) => row[2]), ['1,240.00', '-86.40', '12,905.75']);
});

test('a one-row table takes its columns from its one row of values', () => {
  // A heading on two lines whose words stand wherever they fit, over a single
  // row of six values - the rewards table on a card statement.
  const [table] = tablesIn([page([
    line(270, [[60, 'Previous'], [122, 'New'], [238, 'Redeemed'], [318, 'Total']], 9),
    line(260, [[60, 'balance'], [116, 'this period'], [176, 'Adjustments'], [288, 'Bonus']], 9),
    line(246, [right(100, '$101.10'), right(156, '$1.77'), right(212, '$0.00'),
      right(268, '$0.00'), right(312, '$0.00'), right(372, '$102.87')], 10),
  ])]);

  assert.equal(table.headers.length, 6);
  assert.deepEqual(cells(table), [['$101.10', '$1.77', '$0.00', '$0.00', '$0.00', '$102.87']]);
  assert.equal(table.headers[0], 'Previous balance');
});

/* ------------------------------------------------------------ the regions */

test('a sidebar beside a table is its own region, and the table keeps its amounts', () => {
  const rows = [
    ['May 06', 'NW BANK TELEPAYMENT', '-527.61'],
    ['Apr 22', 'NORTHWIND UTIL', '120.43'],
    ['Apr 28', 'CONTOSO GROCERY', '45.10'],
    ['May 03', 'FABRIKAM FUEL', '12.40'],
  ];
  const lines = [
    line(700, [[40, 'Date'], [100, 'Description'], right(340, 'Amount')], 8),
    ...rows.map(([date, what, amount], i) => line(690 - i * 12,
      [[40, date], [100, what], right(340, amount)], 8)),
  ];

  // Small print down the right, every nine and a bit points - so whenever one
  // of its lines meets a row, it is a fraction of a point off the row's
  // baseline, as it was on the statement this is modelled on.
  const prose = ['Billing errors must be reported', 'within ninety days of posting', 'to your account and may not',
    'be disputed after that period', 'If your card is lost call us', 'at once from anywhere at all'];
  prose.forEach((words, i) => {
    const y = 703.4 - i * 9.3;
    const near = lines.find((l) => Math.abs(l.y - y) < 3);
    if (near) near.runs.push(...line(near.y, [[380, words, y]], 8).runs);
    else lines.push(line(y, [[380, words]], 8));
  });
  lines.sort((a, b) => b.y - a.y);

  const tables = tablesIn([page(lines)]);
  const table = tables.find((t) => t.headers.includes('Amount'));
  assert.ok(table, 'the transactions table should be found');
  assert.deepEqual(table.headers, ['Date', 'Description', 'Amount']);
  assert.deepEqual(cells(table).map((row) => row[2]), ['-527.61', '120.43', '45.10', '12.40']);
  assert.ok(!cells(table).flat().some((cell) => /ninety|disputed|lost/.test(cell)),
    'no word of the sidebar lands in the table');
});

/* ------------------------------------------------------------- the tables */

test('two tables with different columns on one page stay two tables', () => {
  const tables = tablesIn([page([
    line(700, [[40, 'Date'], [100, 'Description'], right(340, 'Amount')], 8),
    line(690, [[40, 'May 06'], [100, 'NW BANK'], right(340, '-527.61')], 8),
    line(680, [[40, 'Apr 22'], [100, 'NORTHWIND'], right(340, '120.43')], 8),
    line(655, [[40, 'Interest charges']], 12),
    line(640, [[40, 'Type'], [170, 'Annual'], [240, 'Daily'], right(340, 'Charges')], 8),
    line(630, [[40, 'Purchases'], [170, '21.99%'], [240, '0.06024%'], right(340, '0.00')], 8),
    line(620, [[40, 'Cash'], [170, '22.99%'], [240, '0.06298%'], right(340, '0.00')], 8),
  ])]);

  assert.equal(tables.length, 2);
  assert.deepEqual(tables[0].headers, ['Date', 'Description', 'Amount']);
  assert.deepEqual(tables[1].headers, ['Type', 'Annual', 'Daily', 'Charges']);
});

test('sections with the same columns are one table, and the repeated heading goes', () => {
  const heading = (y) => line(y, [[40, 'Date'], [100, 'Description'], right(340, 'Amount')], 8);
  const [table, ...rest] = tablesIn([page([
    line(720, [[40, 'Payments']], 12),
    heading(700),
    line(690, [[40, 'May 06'], [100, 'NW BANK'], right(340, '-527.61')], 8),
    line(665, [[40, 'Purchases']], 12),
    heading(650),
    line(640, [[40, 'Card ending 0001']], 8),
    line(630, [[40, 'Apr 22'], [100, 'NORTHWIND'], right(340, '120.43')], 8),
    line(620, [[40, 'Apr 28'], [100, 'CONTOSO'], right(340, '45.10')], 8),
  ])]);

  assert.equal(rest.length, 0);
  assert.deepEqual(table.headers, ['Date', 'Description', 'Amount']);
  assert.deepEqual(cells(table), [
    ['May 06', 'NW BANK', '-527.61'],
    ['Card ending 0001', '', ''],
    ['Apr 22', 'NORTHWIND', '120.43'],
    ['Apr 28', 'CONTOSO', '45.10'],
  ]);
});

test('a table running on to the next page is one table with one heading', () => {
  const pageOf = (number, rows) => page([
    line(700, [[56, 'Date'], [140, 'Description'], right(460, 'Amount')], 9),
    ...rows.map(([date, what, amount], i) => line(680 - i * 20,
      [[56, date], [140, what], right(460, amount)])),
    line(80, [[500, `Page ${number} of 2`]], 9),
  ], number);

  const tables = tablesIn([
    pageOf(1, [['2026-01-04', 'ACME LTD', '1240.00'], ['2026-01-07', 'UTILITIES', '-86.40']]),
    pageOf(2, [['2026-01-11', 'K TANAKA', '318.50'], ['2026-01-18', 'L OKAFOR', '2905.75']]),
  ]);

  assert.equal(tables.length, 1);
  assert.equal(tables[0].rows.length, 4);
  assert.ok(!cells(tables[0]).flat().some((cell) => /Page|Date/.test(cell)),
    'neither the second heading nor a page number is a row');
});

/* --------------------------------------------------------------- the rows */

test('totals and labels are rows, as they are on the page', () => {
  const [table] = tablesIn([page([
    line(700, [[40, 'Date'], [100, 'Description'], right(340, 'Amount')], 8),
    line(690, [[40, 'May 06'], [100, 'NW BANK'], right(340, '-527.61')], 8),
    line(680, [[40, 'Total payments received'], right(340, '-$527.61')], 8),
    line(670, [[40, 'Apr 22'], [100, 'NORTHWIND'], right(340, '120.43')], 8),
  ])]);

  assert.deepEqual(cells(table)[1], ['Total payments received', '', '-$527.61'],
    'a label running across columns is one cell, in the first column it touches');
});

test('a description too long for its column is folded into the row above', () => {
  const [table] = tablesIn([page([
    line(700, [[56, 'Date'], [140, 'Description'], right(460, 'Amount')], 9),
    line(680, [[56, '2026-01-04'], [140, 'ACME LTD'], right(460, '1240.00')]),
    line(669, [[140, 'TRADING AS ACME SUPPLIES']]),
    line(650, [[56, '2026-01-07'], [140, 'UTILITIES'], right(460, '-86.40')]),
    line(630, [[56, '2026-01-11'], [140, 'K TANAKA'], right(460, '318.50')]),
  ])]);

  assert.equal(table.rows.length, 3);
  assert.equal(cells(table)[0][1], 'ACME LTD TRADING AS ACME SUPPLIES');
});

test('a label wrapped above its value is folded down into it', () => {
  const [table] = tablesIn([page([
    line(300, [[300, 'Customer service'], right(600, '1-800-555-0100')], 8),
    line(288, [[300, 'From outside Canada or']], 8),
    line(278, [[300, 'the U.S., call collect at'], right(600, '905-555-0199')], 8),
    line(266, [[300, 'Statement date'], right(600, 'May 15, 2025')], 8),
  ])]);

  assert.deepEqual(cells(table)[1], ['From outside Canada or the U.S., call collect at', '905-555-0199']);
});

test('a word drawn apart from its cell stays in that cell, not in the amounts', () => {
  const [table] = tablesIn([page([
    line(700, [[40, 'Date'], [100, 'Description'], right(360, 'Amount')], 8),
    line(690, [[40, 'May 06'], [100, 'NW BANK TELEPAY'], [230, 'DIRECT'], right(360, '-527.61')], 8),
    line(680, [[40, 'Apr 22'], [100, 'NORTHWIND UTIL'], right(360, '120.43')], 8),
    line(670, [[40, 'Apr 28'], [100, 'CONTOSO'], right(360, '45.10')], 8),
    line(660, [[40, 'May 03'], [100, 'FABRIKAM'], right(360, '12.40')], 8),
  ])]);

  assert.deepEqual(cells(table)[0], ['May 06', 'NW BANK TELEPAY DIRECT', '-527.61']);
});

test('a date with no year is data, and is left exactly as written', () => {
  const [table] = tablesIn([page([
    line(700, [[40, 'Posted'], [100, 'Description'], right(340, 'Amount')], 8),
    line(690, [[40, 'May 06'], [100, 'NW BANK'], right(340, '-527.61')], 8),
    line(680, [[40, 'Apr 22'], [100, 'NORTHWIND'], right(340, '120.43')], 8),
  ])]);

  assert.deepEqual(table.headers, ['Posted', 'Description', 'Amount']);
  assert.equal(cells(table)[0][0], 'May 06');
  assert.equal(table.dateColumn, -1, 'a date with no year is never rewritten');
});

test('a column of reference numbers is not mistaken for money', () => {
  const [table] = tablesIn([page([
    line(700, [[56, 'Date'], [140, 'Cheque'], [300, 'Description'], right(500, 'Amount')], 9),
    line(680, [[56, '2026-01-04'], [140, '0001234'], [300, 'ACME'], right(500, '1240.00')]),
    line(660, [[56, '2026-01-07'], [140, '0001235'], [300, 'UTILITIES'], right(500, '-86.40')]),
    line(640, [[56, '2026-01-11'], [140, '0001236'], [300, 'TANAKA'], right(500, '318.50')]),
  ])]);

  assert.deepEqual(table.moneyColumns, [3], 'the cheque numbers have no pence, so they are not money');
});

/* -------------------------------------------------------------- the proof */

function ledger() {
  const rows = [
    ['2026-01-04', 'ACME LTD', '1240.00', '4740.00'],
    ['2026-01-07', 'UTILITIES', '-86.40', '4653.60'],
    ['2026-01-11', 'K TANAKA', '318.50', '4972.10'],
    ['2026-01-18', 'L OKAFOR', '2905.75', '7877.85'],
  ];
  const [table] = tablesIn([page([
    line(700, [[56, 'Date'], [140, 'Description'], right(400, 'Amount'), right(520, 'Balance')], 9),
    ...rows.map(([date, who, sum, balance], at) => line(680 - at * 20,
      [[56, date], [140, who], right(400, sum), right(520, balance)])),
  ])]);
  return table;
}

test('the balance column is found by the arithmetic, not by its heading', () => {
  const table = ledger();
  const proof = checkBalance(table.rows, table.moneyColumns, '.');
  assert.ok(proof);
  assert.equal(proof.balance, 3);
  assert.deepEqual(proof.amounts, [2]);
  assert.deepEqual(proof.broken, []);
});

test('a misread amount breaks the chain at the row it happened on', () => {
  const table = ledger();
  // 318.50 read as 31850, which is what a decimal point in the wrong place
  // makes and what nobody would spot by eye.
  table.rows[2].cells[2] = '31850.00';
  const proof = checkBalance(table.rows, table.moneyColumns, '.');
  assert.ok(proof, 'the balance column is still recognisable');
  assert.deepEqual(proof.broken, [3]);
});

test('a dropped row breaks the chain, which is the point of checking', () => {
  const table = ledger();
  table.rows.splice(1, 1);
  const proof = checkBalance(table.rows, table.moneyColumns, '.');
  assert.ok(!proof || proof.broken.length > 0);
});

test('separate debit and credit columns are one more shape of the same chain', () => {
  const rows = [
    ['2026-01-04', 'ACME LTD', '', '1240.00', '4740.00'],
    ['2026-01-07', 'UTILITIES', '86.40', '', '4653.60'],
    ['2026-01-11', 'K TANAKA', '', '318.50', '4972.10'],
    ['2026-01-18', 'L OKAFOR', '', '2905.75', '7877.85'],
    ['2026-01-22', 'INSURANCE', '212.00', '', '7665.85'],
  ];
  const [table] = tablesIn([page([
    line(700, [[56, 'Date'], [140, 'Description'], right(360, 'Paid out'),
      right(440, 'Paid in'), right(530, 'Balance')], 9),
    ...rows.map(([date, who, out, into, balance], at) => line(680 - at * 20,
      [[56, date], [140, who], ...(out ? [right(360, out)] : []),
        ...(into ? [right(440, into)] : []), right(530, balance)])),
  ])]);

  const proof = checkBalance(table.rows, table.moneyColumns, '.');
  assert.ok(proof);
  assert.equal(proof.credited, true);
  assert.deepEqual(proof.amounts, [2, 3]);
  assert.deepEqual(proof.broken, []);
});

test('a table with no balance is unproven rather than wrong', () => {
  const [table] = tablesIn([page([
    line(700, [[56, 'Date'], [140, 'Description'], right(460, 'Amount')], 9),
    line(680, [[56, '2026-01-04'], [140, 'ACME LTD'], right(460, '1240.00')]),
    line(660, [[56, '2026-01-07'], [140, 'UTILITIES'], right(460, '-86.40')]),
    line(640, [[56, '2026-01-11'], [140, 'K TANAKA'], right(460, '318.50')]),
    line(620, [[56, '2026-01-18'], [140, 'L OKAFOR'], right(460, '2905.75')]),
  ])]);
  assert.equal(checkBalance(table.rows, table.moneyColumns, '.'), null);
});

/* ------------------------------------------------ through the real reader */

const helvetica = base14Widths('Helvetica');
const widthOf = (size, s) => [...s].reduce((sum, ch) => sum
  + helvetica.width(WIN_ANSI[ch.charCodeAt(0)] ?? 'space'), 0) / 1000 * size;
const esc = (s) => s.replace(/([\\()])/g, '\\$1');
const L = (size, x, y, s) => `BT /F1 ${size} Tf ${x.toFixed(2)} ${y} Td (${esc(s)}) Tj ET`;
const R = (size, edge, y, s) => L(size, edge - widthOf(size, s), y, s);

/** A card statement's second page, laid out like the one that broke the
 *  first version of this tool and with every word of it invented. */
async function cardStatement() {
  const head = (y) => [
    L(6, 40, y, 'TRANSACTION'), L(6, 88, y, 'POSTING'),
    L(7, 40, y - 9, 'DATE'), L(7, 88, y - 9, 'DATE'), L(7, 136, y - 9, 'TRANSACTION DESCRIPTION'),
    R(7, 360, y - 9, 'AMOUNT ($)'),
  ];
  const row = (y, a, b, what, amount) => [L(7, 40, y, a), L(7, 88, y, b), L(7, 136, y, what), R(7, 360, y, amount)];
  const content = [
    L(11, 34, 716, 'Payments received'),
    ...head(700),
    ...row(680, 'May 06', 'May 06', 'NW BANK TELEPAYMENT', '-527.61'),
    L(7, 40, 668, 'Total payments received'), R(7, 360, 668, '-$527.61'),
    L(11, 34, 642, 'Purchases'),
    ...head(626),
    ...row(606, 'Apr 22', 'Apr 23', 'NORTHWIND UTIL. 117', '120.43'),
    ...row(596, 'Apr 28', 'Apr 29', 'CONTOSO GROCERY 4402', '45.10'),
    L(7, 40, 582, 'Total purchases'), R(7, 360, 582, '$165.53'),
    L(11, 34, 550, 'Interest charges'),
    L(7, 40, 530, 'TYPE'), L(7, 170, 530, 'ANNUAL RATE'), L(7, 240, 530, 'DAILY RATE'), R(7, 360, 530, 'CHARGES'),
    L(7, 40, 519, 'Purchases'), L(7, 170, 519, '21.99%'), L(7, 240, 519, '0.06024%'), R(7, 360, 519, '0.00'),
    L(7, 40, 508, 'Cash advances'), L(7, 170, 508, '22.99%'), L(7, 240, 508, '0.06298%'), R(7, 360, 508, '0.00'),
    ...['Billing errors: tell us within ninety', 'days of a transaction being posted.',
      'If your card is lost or stolen, call', 'us at once. Gift cards are not', 'accepted as payment on this account.',
      'Minimum payment due: the estimate', 'assumes the balance shown and the', 'minimum paid each month on time.']
      .map((s, i) => L(7, 380, 712.4 - i * 9.3, s)),
  ].join('\n');

  const doc = await PdfDocument.open(buildPdf([
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
  ]));
  const [dict] = pagesOf(doc);
  return [{ number: 1, lines: pageRuns(await readPage(doc, dict, 1)) }];
}

test('a card statement with no years and a sidebar reads through the whole chain', async () => {
  const tables = tablesIn(await cardStatement());
  const transactions = tables.find((t) => t.headers.includes('AMOUNT ($)'));

  assert.ok(transactions, 'the transactions table should be found');
  assert.deepEqual(transactions.headers,
    ['TRANSACTION DATE', 'POSTING DATE', 'TRANSACTION DESCRIPTION', 'AMOUNT ($)']);
  assert.deepEqual(cells(transactions), [
    ['May 06', 'May 06', 'NW BANK TELEPAYMENT', '-527.61'],
    ['Total payments received', '', '', '-$527.61'],
    ['Apr 22', 'Apr 23', 'NORTHWIND UTIL. 117', '120.43'],
    ['Apr 28', 'Apr 29', 'CONTOSO GROCERY 4402', '45.10'],
    ['Total purchases', '', '', '$165.53'],
  ]);
});

test('the interest table beside it is its own table, not more transactions', async () => {
  const tables = tablesIn(await cardStatement());
  const interest = tables.find((t) => t.headers.includes('CHARGES'));

  assert.ok(interest);
  assert.deepEqual(interest.headers, ['TYPE', 'ANNUAL RATE', 'DAILY RATE', 'CHARGES']);
  assert.deepEqual(cells(interest)[0], ['Purchases', '21.99%', '0.06024%', '0.00']);
  assert.ok(!tables.some((t) => cells(t).flat().some((cell) => /Billing|stolen|Gift/.test(cell))),
    'the small print is in no table');
});
