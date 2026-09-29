/**
 * Checking a statement's net changes against its printed balances.
 *
 * The columns and rows are inferred from layout. A matching balance is useful
 * evidence about the amounts between two balances, but not a proof that every
 * value is right: two mistakes may cancel, and amounts before the first or
 * after the last balance have no pair to compare against. Coverage is returned
 * alongside the arithmetic so the page can say exactly what was checked.
 *
 * The same arithmetic finds the balance column without reading a heading.
 * Every money column is tried against each amount column and each debit/credit
 * pair. A failed comparison never suppresses the CSV; it tells the reader
 * which rows need checking against the PDF.
 */

import { parseAmount } from './values.js';

/** Money is equal when it is equal to the half-penny; anything looser would
 *  let a genuinely wrong row through, and anything tighter fails on the
 *  rounding a statement does before it prints. */
const EPSILON = 0.005;

/**
 * How much of a chain has to hold before the column is believed to be a
 * balance at all.
 *
 * Half, which is far looser than it looks, because this threshold answers only
 * the question "is this column a running balance?" and never "did the check
 * pass?". Those were one number once, and it made the tool useless in exactly
 * the case it exists for: a four-row statement with one misread amount has two
 * links holding out of three, so a threshold strict enough to be a verdict
 * rejected the column outright and the page said there was no balance to check
 * against - which reads as "nothing to worry about" instead of "look at row
 * three". The verdict is not a threshold at all; it is `held` and `links`,
 * reported.
 */
const RECOGNISE = 0.5;

/** And how many links there have to be at all. Two rows agreeing proves
 *  nothing: a column of the same number twice would pass. */
const MIN_LINKS = 3;

/**
 * @typedef {object} Proof
 * @property {number} balance   the column holding the running balance
 * @property {number[]} amounts one column, or two for a debit and a credit
 * @property {boolean} credited true when `amounts` is [debit, credit]
 * @property {number} links     how many pairs of rows were compared
 * @property {number} held      how many of them agreed
 * @property {number[]} broken  the row numbers where the chain broke
 * @property {number[]} checked rows included in a numerical comparison
 * @property {number[]} unchecked rows without a complete, readable comparison
 */

/**
 * Find the running balance and check it.
 *
 * @param {{cells: string[]}[]} rows
 * @param {number[]} money  the columns that hold amounts
 * @param {string} mark     this document's decimal point
 * @returns {Proof|null} null when no column behaves like a balance
 */
export function checkBalance(rows, money, mark) {
  if (rows.length < MIN_LINKS + 1) return null;

  let best = null;

  for (const balance of money) {
    const others = money.filter((at) => at !== balance);

    for (const amount of others) {
      const proof = follow(rows, balance, [amount], false, mark);
      if (better(proof, best)) best = proof;
    }

    // A debit column and a credit column, either way round: which is which is
    // not knowable from the numbers alone, so both are tried and the one that
    // satisfies the chain is the one the statement meant.
    for (const debit of others) {
      for (const credit of others) {
        if (debit === credit) continue;
        const proof = follow(rows, balance, [debit, credit], true, mark);
        if (better(proof, best)) best = proof;
      }
    }
  }

  // Only now, once the best candidate is known, is it asked whether it looks
  // like a balance column at all. A column that holds on half its rows is one
  // this tool has read imperfectly; a column that holds on almost none is a
  // column that was never a balance, and reporting it as a broken one would
  // send somebody hunting for an error in a statement that has none.
  if (!best || best.held < 2 || best.held < best.links * RECOGNISE) return null;
  return best;
}

function better(proof, best) {
  if (!proof) return false;
  if (!best) return true;
  if (proof.held !== best.held) return proof.held > best.held;
  return proof.links > best.links;
}

/**
 * Walk the rows following one candidate chain.
 *
 * Rows without a balance are not skipped but carried: a statement that prints
 * one balance at the end of each day still balances, against the sum of the
 * amounts since the last one it printed. Treating those rows as breaks would
 * report a perfectly good extraction as unproven.
 */
function follow(rows, balance, amounts, credited, mark) {
  let previous = null;
  let carried = 0;
  let links = 0;
  let held = 0;
  const broken = [];
  const checked = [];
  const unchecked = [];
  let pending = [];
  let readable = true;

  for (let at = 0; at < rows.length; at += 1) {
    const cells = rows[at].cells;

    const parts = amounts.map((column) => String(cells[column] ?? '').trim());
    // An unused debit or credit cell is zero, but a missing signed amount or
    // an unreadable nonempty cell is unknown. Substituting zero for either
    // would let a damaged extraction pass whenever the balances stayed flat.
    const values = parts.map((part) => part === '' && credited ? 0 : parseAmount(part, mark));
    const value = values.some((part) => part === null) || parts.every((part) => part === '')
      ? null : credited ? values[1] - values[0] : values[0];
    pending.push(at + 1);
    if (value === null) readable = false;
    else carried += value;

    const here = parseAmount(cells[balance], mark);
    if (here === null) {
      if (String(cells[balance] ?? '').trim()) readable = false;
      continue;
    }

    if (previous !== null && readable) {
      links += 1;
      checked.push(...pending);
      if (Math.abs(here - previous - carried) <= EPSILON) held += 1;
      else broken.push(at + 1);
    } else {
      unchecked.push(...pending);
    }

    previous = here;
    carried = 0;
    pending = [];
    readable = true;
  }
  unchecked.push(...pending);

  if (links < MIN_LINKS) return null;
  return { balance, amounts, credited, links, held, broken, checked, unchecked };
}
