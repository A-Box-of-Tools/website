/**
 * Proving the extraction, by making the statement check itself.
 *
 * Everything before this file is inference. Which strip of paper was a gutter,
 * which line was a heading, whether the wrapped line belonged to the row above
 * - each is a decision made on evidence, and any of them can be wrong on a
 * statement laid out in a way nobody here has seen. A tool that stopped there
 * would be asking its user to check forty rows by eye against the PDF, which
 * nobody does, which is how a wrong number ends up in a tax return.
 *
 * But most statements carry a running balance, and a running balance is a
 * proof. If the balance on each row really is the balance on the row above
 * plus that row's amount, then the amounts were read correctly, the rows were
 * separated correctly, and none was dropped or duplicated - because any of
 * those mistakes breaks the chain at the row where it happened. One subtraction
 * per row turns the whole reconstruction from a hope into a checked claim, and
 * it costs nothing.
 *
 * WHICH COLUMN IS THE BALANCE IS DECIDED BY THE SAME ARITHMETIC
 *
 * Rather than guessed from the heading, which would only work in English. Every
 * money column is tried as the balance against every other as the amount, and
 * the pairing that satisfies the arithmetic is the answer. A statement with
 * separate debit and credit columns is one more candidate in the same search:
 * the amount is then the credit less the debit. So the check and the
 * classification are one step, and a statement that passes has necessarily had
 * its columns identified correctly.
 *
 * WHAT A FAILURE MEANS, AND WHAT IT DOES NOT
 *
 * It does not mean the rows are wrong. A statement may simply not print a
 * balance, or print one only at the end of each day, or carry a balance this
 * cannot line up for a reason that is nobody's fault. So a failed check never
 * suppresses the CSV: it is reported as "not checked" rather than "wrong", and
 * the page says which of the two happened. Claiming the rows are wrong when
 * they are merely unproven would train people to ignore the line that matters.
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

  for (let at = 0; at < rows.length; at += 1) {
    const cells = rows[at].cells;

    const value = credited
      ? (parseAmount(cells[amounts[1]], mark) ?? 0) - (parseAmount(cells[amounts[0]], mark) ?? 0)
      : parseAmount(cells[amounts[0]], mark) ?? 0;

    carried += value;

    const here = parseAmount(cells[balance], mark);
    if (here === null) continue;

    if (previous !== null) {
      links += 1;
      if (Math.abs(here - previous - carried) <= EPSILON) held += 1;
      else broken.push(at + 1);
    }

    previous = here;
    carried = 0;
  }

  if (links < MIN_LINKS) return null;
  return { balance, amounts, credited, links, held, broken };
}
