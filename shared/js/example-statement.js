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
