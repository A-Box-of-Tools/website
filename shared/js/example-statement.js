/**
 * The rows on the example statement, and nothing else.
 *
 * Its own module with no imports because two very different things need the
 * same content: shared/js/example-pdf.js sets it as real PDF text, and
 * shared/js/example-document.js draws it on a canvas as a photographed page.
 * A tool that wanted the picture should not have to ship a PDF writer to get
 * the words, which is what putting them in either of those files would cost.
 *
 * WHY DATES, CODES AND AMOUNTS
 *
 * Because this content appears in fifteen languages and must be right in all
 * of them. A paragraph of English prose inside a Japanese page is the thing
 * shared/js/phrases.js exists to prevent, and a translated paragraph is not
 * available here: the PDF path can only use a base-fourteen font, whose
 * repertoire is Latin, and embedding a CJK font would cost megabytes on a page
 * whose subject is not typography.
 *
 * A statement solves it honestly rather than by looking away. Reference codes,
 * ISO dates, amounts and two names read the same everywhere - and they are
 * what people actually redact, which makes them the right example twice over.
 *
 * Fixed rather than generated, so that two people comparing what a tool did to
 * the example are looking at the same document.
 */

export const HEADINGS = ['Date', 'Reference', 'Account', 'Amount'];

export const ROWS = [
  ['2026-01-04', 'INV-2026-0184', 'A. Moreau', '1,240.00'],
  ['2026-01-11', 'INV-2026-0191', 'K. Tanaka', '318.50'],
  ['2026-01-18', 'INV-2026-0207', 'A. Moreau', '2,905.75'],
  ['2026-02-02', 'INV-2026-0233', 'L. Okafor', '87.20'],
  ['2026-02-15', 'INV-2026-0248', 'K. Tanaka', '1,015.00'],
  ['2026-02-27', 'INV-2026-0262', 'L. Okafor', '640.40'],
];

/** The rows a given page shows, rotated so no two pages are identical. */
export function rowsFor(page, count = 5) {
  const start = ((page - 1) * 2) % ROWS.length;
  return [...ROWS.slice(start), ...ROWS.slice(0, start)].slice(0, count);
}

/* ------------------------------------------------------- the same as a ledger
 *
 * One tool needs more than the rows above: /bank-statement-to-csv/ checks its
 * own reading of a statement against the running balance printed on it, so an
 * example with no balance column would demonstrate the tool with its best
 * feature switched off.
 *
 * It is a second export rather than a change to ROWS because five other tools
 * draw those six rows today, two of them as a picture, and an example is
 * worth nothing if it moves under the person comparing two of them.
 *
 * The money goes both ways here, which the rows above do not: a statement of
 * nothing but receipts would let a converter mistake the amount column for the
 * balance and still appear to work.
 */

/** Date, reference, who, and how much - the sign being the point. */
const MOVEMENTS = [
  ['2026-01-04', 'INV-2026-0184', 'A. Moreau', 1240.00],
  ['2026-01-07', 'DD-2026-0031', 'Utilities', -86.40],
  ['2026-01-11', 'INV-2026-0191', 'K. Tanaka', 318.50],
  ['2026-01-15', 'CRD-2026-4417', 'Stationery', -54.15],
  ['2026-01-18', 'INV-2026-0207', 'A. Moreau', 2905.75],
  ['2026-01-22', 'DD-2026-0044', 'Insurance', -212.00],
  ['2026-01-29', 'SAL-2026-0011', 'Payroll', -1860.00],
  ['2026-02-02', 'INV-2026-0233', 'L. Okafor', 87.20],
  ['2026-02-09', 'CRD-2026-4502', 'Travel', -143.65],
  ['2026-02-15', 'INV-2026-0248', 'K. Tanaka', 1015.00],
  ['2026-02-19', 'DD-2026-0058', 'Utilities', -91.30],
  ['2026-02-23', 'CRD-2026-4590', 'Software', -240.00],
  ['2026-02-27', 'INV-2026-0262', 'L. Okafor', 640.40],
  ['2026-03-02', 'SAL-2026-0012', 'Payroll', -1860.00],
  ['2026-03-06', 'INV-2026-0274', 'A. Moreau', 1730.85],
];

export const LEDGER_HEADINGS = ['Date', 'Reference', 'Account', 'Amount', 'Balance'];

/** Thousands grouped and the pence always written, which is what makes a
 *  column of these recognisable as money rather than as reference numbers. */
function money(value) {
  const text = Math.abs(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return value < 0 ? `-${text}` : text;
}

/**
 * Every row of the ledger, with the balance carried down the column.
 *
 * Computed rather than written out, so the example cannot ship a balance that
 * does not add up - which would make a tool that checks the balance report a
 * failure against its own example.
 *
 * @param {number} [opening]
 * @returns {string[][]}
 */
export function ledgerRows(opening = 3500) {
  let balance = opening;
  return MOVEMENTS.map(([date, reference, account, amount]) => {
    balance = Math.round((balance + amount) * 100) / 100;
    return [date, reference, account, money(amount), money(balance)];
  });
}
