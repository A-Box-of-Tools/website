/**
 * Finding the table on a page nobody drew a table on.
 *
 * A statement looks like a grid and almost never is one. There are usually no
 * ruled lines - and this tool could not see them if there were, because
 * shared/js/pdf-text.js reads text and ignores paths, which is what keeps it
 * small. What there is instead is the thing that made the grid readable to a
 * person in the first place: vertical strips of paper down which nothing is
 * ever printed.
 *
 * So the columns are found by looking for the gaps rather than the content.
 * Every line of every page is projected onto the horizontal axis, and the
 * strips that stay empty are the gutters between columns. It is the oldest
 * trick in document analysis and it holds up here because a statement's
 * columns are its whole reason for existing: whoever printed it kept them
 * apart on purpose.
 *
 * WHY A LINE MAY INTRUDE INTO A GUTTER
 *
 * Because the page is not only the table. A title across the top, a page
 * number at the foot, an address block, a pale watermark of the page number -
 * each is one line lying across every column at once, and a gutter test that
 * demanded complete emptiness would find no gutters at all on most statements.
 *
 * Two things keep those lines out of the way. The first is type size: a
 * statement sets its table in one size and its furniture in others, so only
 * lines near the document's median height are projected at all. That is what
 * removes a heading twice the size of a row and a page number eight times it,
 * and it is stronger evidence than anything about position, because a title
 * that happens to be short is still a title. The second is TOLERANCE, for the
 * furniture that is set in the body size after all: a strip is a gutter when
 * nearly every line leaves it alone. What survives both is dropped later by
 * rows.js, on evidence about what a line says rather than how it looks.
 *
 * WHY COLUMNS ARE SPANS AND NOT CUT LINES
 *
 * Because a gutter can be wide - the empty right-hand half of a description
 * column runs into the real gutter beside it - and cutting such a gutter down
 * the middle would slice the ends off long descriptions. Keeping the columns
 * as the *occupied* spans and assigning each run to the span it overlaps most
 * has no midpoint to get wrong.
 */

import { endOf } from './shared/pdf-text.js';

/** How many of a page's lines may print inside a strip and leave it still
 *  counting as a gutter. */
const TOLERANCE = 0.12;

/** And how wide a strip has to be before it is a gutter rather than the space
 *  between two words. A word space is about a quarter of the type size; no
 *  statement sets its columns that close. */
const MIN_GUTTER = 7;

/** How far a line's type size may be from the document's median and still be
 *  taken for part of the table. Wide, because a statement often sets its
 *  column headings a point or two smaller than the rows under them. */
const SIZE_RANGE = [0.6, 1.6];

/**
 * A page's text as lines of runs, each run knowing where it sits.
 *
 * The line grouping is the reader's own - it has already sorted glyphs down
 * the page and decided where a space belongs that nobody wrote - so this walks
 * the text it produced rather than the glyphs, and asks `owner` which glyph
 * drew each character. A character with no glyph behind it is one of those
 * invented spaces, and it is exactly where one run ends and the next begins.
 *
 * @param {object} page  what shared/js/pdf-text.js `readPage` returned
 * @returns {{y: number, runs: {text: string, x0: number, x1: number}[]}[]}
 */
export function pageRuns(page) {
  const byOrder = new Map();
  for (const glyph of page.glyphs) byOrder.set(glyph.order, glyph);

  const lines = [];

  for (const { from, to } of page.lines) {
    const runs = [];
    const heights = [];
    let run = null;
    let y = null;

    for (let at = from; at < to; at += 1) {
      const character = page.text[at];
      const glyph = byOrder.get(page.owner[at]);

      if (!glyph || character === ' ') {
        run = null;
        continue;
      }

      if (y === null) y = glyph.origin.y;
      heights.push(glyph.height);

      if (!run) {
        run = { text: '', x0: glyph.origin.x, x1: glyph.origin.x };
        runs.push(run);
      }

      run.text += character;
      run.x1 = Math.max(run.x1, endOf(glyph).x);
    }

    if (runs.length) lines.push({ y, runs, height: median(heights) });
  }

  return lines;
}

/** The middle value, which is the size to compare against when a line has a
 *  word of another size in it - a bold reference in a sentence, a currency
 *  symbol set small - and a mean would be dragged off by it. */
function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[sorted.length >> 1];
}

/**
 * The columns, as the spans of paper that are printed on.
 *
 * Taken over every line of every page at once rather than page by page: a
 * statement's columns do not move between pages, and a short last page has too
 * few lines to find them from on its own.
 *
 * @param {{runs: {x0: number, x1: number}[]}[]} lines
 * @returns {{x0: number, x1: number}[]}
 */
export function findColumns(allLines) {
  const lines = bodySized(allLines);
  if (!lines.length) return [];

  let left = Infinity;
  let right = -Infinity;
  for (const line of lines) {
    for (const run of line.runs) {
      left = Math.min(left, run.x0);
      right = Math.max(right, run.x1);
    }
  }
  if (!Number.isFinite(left) || right <= left) return [];

  const width = Math.ceil(right - left) + 1;
  const printed = new Int32Array(width);

  // Counted once per line, not once per run: a column of six-digit references
  // and a column of one long sentence should weigh the same, and counting runs
  // would let the wordy column vote against every gutter beside it.
  for (const line of lines) {
    const seen = new Uint8Array(width);
    for (const run of line.runs) {
      const from = Math.max(0, Math.floor(run.x0 - left));
      const to = Math.min(width - 1, Math.ceil(run.x1 - left));
      for (let x = from; x <= to; x += 1) seen[x] = 1;
    }
    for (let x = 0; x < width; x += 1) printed[x] += seen[x];
  }

  const allowed = Math.floor(lines.length * TOLERANCE);
  const columns = [];
  let start = null;

  for (let x = 0; x < width; x += 1) {
    const empty = printed[x] <= allowed;
    if (!empty && start === null) start = x;
    if (empty && start !== null) {
      // Only a strip wide enough to be a gutter ends a column; a narrower one
      // is the gap between two words and the column continues through it.
      let run = x;
      while (run < width && printed[run] <= allowed) run += 1;
      if (run - x >= MIN_GUTTER || run === width) {
        columns.push({ x0: left + start, x1: left + x - 1 });
        start = null;
      }
      x = run - 1;
    }
  }

  if (start !== null) columns.push({ x0: left + start, x1: left + width - 1 });
  return columns;
}

/**
 * The lines set at something near the document's usual size.
 *
 * Exported because rows.js wants the same judgement for a different reason: a
 * line in a size of its own is furniture whether it is being projected or
 * being turned into a transaction.
 */
export function bodySized(lines) {
  const usual = median(lines.map((line) => line.height));
  if (!usual) return lines;
  return lines.filter((line) => line.height >= usual * SIZE_RANGE[0]
    && line.height <= usual * SIZE_RANGE[1]);
}

/**
 * One line's runs, dealt out into the columns.
 *
 * By overlap rather than by which side of a line the run falls on, so a run
 * that leans into a gutter still lands in the column it shares most paper
 * with. A run overlapping nothing - a footnote out in a margin - goes to the
 * nearest column rather than being dropped: this is not the place to decide
 * that something is not part of the table.
 *
 * @returns {string[]} one cell per column, in order, trimmed and possibly empty
 */
export function intoCells(line, columns) {
  const cells = columns.map(() => []);
  if (!columns.length) return [];

  for (const run of line.runs) {
    let best = 0;
    let bestOverlap = -Infinity;

    for (let index = 0; index < columns.length; index += 1) {
      const { x0, x1 } = columns[index];
      const overlap = Math.min(run.x1, x1) - Math.max(run.x0, x0);
      // A run to one side of everything overlaps nothing; the negative width
      // of the gap then ranks the columns by distance, which is what "nearest"
      // means here and costs no second pass.
      if (overlap > bestOverlap) {
        bestOverlap = overlap;
        best = index;
      }
    }

    cells[best].push(run);
  }

  return cells.map((runs) => runs.map((run) => run.text).join(' ').trim());
}
