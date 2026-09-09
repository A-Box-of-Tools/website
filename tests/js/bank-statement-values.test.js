/**
 * tools/bank-statement-to-csv/src/values.js - dates and amounts.
 *
 * The risk here is silent and expensive: every failure in this file produces a
 * number that looks like a number. `1.240,00` read with the wrong decimal mark
 * is not an error, it is 1.24; `03/04` read the wrong way round is not an
 * error, it is a different day. So the cases below are mostly pairs that a
 * single-value parser cannot tell apart, checked through the document-wide
 * decision that is the only thing that can.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  dateOrder, decimalMark, formatAmount, hasAmbiguousDates, looksNumeric,
  parseAmount, parseDate,
} from '../../tools/bank-statement-to-csv/src/values.js';

test('an amount is recognised in the shapes a statement writes it', () => {
  for (const text of ['1,240.00', '318.50', '(87.20)', '-40.00', '40.00-',
    '1 240,00', '86.40 CR', '£1,015.00']) {
    assert.equal(looksNumeric(text), true, text);
  }
});

test('a reference is not an amount, however many digits it has', () => {
  for (const text of ['INV-2026-0184', 'A. Moreau', 'Payroll', '', 'DD-2026-0031']) {
    assert.equal(looksNumeric(text), false, text);
  }
});

test('the decimal mark is settled by a value carrying both separators', () => {
  assert.equal(decimalMark(['1.240,00', '86,40']), ',');
  assert.equal(decimalMark(['1,240.00', '86.40']), '.');
});

test('two digits after a separator is a decimal point, three is grouping', () => {
  assert.equal(decimalMark(['318,50', '87,20']), ',');
  assert.equal(decimalMark(['318.50', '87.20']), '.');
  // Nothing but round thousands: the separator must be the grouping one, so
  // the evidence points at the other character.
  assert.equal(decimalMark(['1.240', '2.905']), ',');
});

test('the same characters are different money under the two conventions', () => {
  assert.equal(parseAmount('1.240,00', ','), 1240);
  assert.equal(parseAmount('1,240.00', '.'), 1240);
  assert.equal(parseAmount('1 240,00', ','), 1240);
});

test('a debit is a debit however the statement spells it', () => {
  assert.equal(parseAmount('-40.00'), -40);
  assert.equal(parseAmount('40.00-'), -40);
  assert.equal(parseAmount('(40.00)'), -40);
  assert.equal(parseAmount('40.00 DR'), -40);
  assert.equal(parseAmount('DR 40.00'), -40);
  assert.equal(parseAmount('40.00 CR'), 40);
  assert.equal(parseAmount('+40.00'), 40);
});

test('a currency symbol is not part of the number', () => {
  assert.equal(parseAmount('£1,015.00'), 1015);
  assert.equal(parseAmount('€87,20', ','), 87.2);
});

test('what is not an amount comes back as null rather than as zero', () => {
  for (const text of ['', 'Payroll', 'INV-2026-0184', '12-34-56 78']) {
    assert.equal(parseAmount(text), null, text);
  }
});

test('an amount is written out for a spreadsheet, cents and all', () => {
  assert.equal(formatAmount(1240), '1240.00');
  assert.equal(formatAmount(-86.4), '-86.40');
});

test('a date that says which way round it is needs no convention', () => {
  assert.equal(parseDate('2026-01-04'), '2026-01-04');
  assert.equal(parseDate('4 Jan 2026'), '2026-01-04');
  assert.equal(parseDate('04-JAN-26'), '2026-01-04');
  assert.equal(parseDate('Jan 4, 2026'), '2026-01-04');
  // ...and reading it under the other convention changes nothing.
  assert.equal(parseDate('2026-01-04', 'mdy'), '2026-01-04');
  assert.equal(parseDate('4 Jan 2026', 'mdy'), '2026-01-04');
});

test('a numeric date is read the way the document is told to write them', () => {
  assert.equal(parseDate('03/04/2026', 'dmy'), '2026-04-03');
  assert.equal(parseDate('03/04/2026', 'mdy'), '2026-03-04');
});

test('one day past the twelfth settles the order for the whole document', () => {
  assert.equal(dateOrder(['03/04/2026', '31/01/2026']), 'dmy');
  assert.equal(dateOrder(['03/04/2026', '01/31/2026']), 'mdy');
});

test('a document that could be read either way says so instead of guessing', () => {
  assert.equal(dateOrder(['03/04/2026', '05/06/2026']), null);
  // And a contradiction is not resolved by majority: it is not resolved.
  assert.equal(dateOrder(['31/01/2026', '01/31/2026']), null);
});

test('ISO and spelled months leave nothing to ask about', () => {
  assert.equal(hasAmbiguousDates(['2026-01-04', '4 Jan 2026']), false);
  assert.equal(hasAmbiguousDates(['2026-01-04', '03/04/2026']), true);
  assert.equal(hasAmbiguousDates(['Payroll', '1,240.00']), false);
});

test('an impossible date is not a date', () => {
  assert.equal(parseDate('31/02/2026', 'dmy'), null);
  assert.equal(parseDate('13/13/2026', 'dmy'), null);
  assert.equal(parseDate('Payroll'), null);
});

test('a two-digit year is this century until that would be the future', () => {
  assert.equal(parseDate('04/01/26', 'dmy'), '2026-01-04');
  assert.equal(parseDate('04/01/99', 'dmy'), '1999-01-04');
});
