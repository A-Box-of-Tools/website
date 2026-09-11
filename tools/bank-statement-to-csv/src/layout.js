/**
 * A page's text as lines, the lines as pieces, and the page as regions.
 *
 * Everything here is about where text sits, and nothing is about what it says.
 * tables.js decides which of these lines make a table; this file only gets the
 * page into a shape where that question can be asked one region at a time.
 *
 * WHY REGIONS COME FIRST
 *
 * Because a page is rarely one thing. A statement puts its transactions down
 * the left and a column of small print down the right; a report sets a table
 * beside a paragraph. Those two halves have nothing to do with each other,
 * but they share baselines by accident, so a line of the table and a line of
 * the prose arrive from the reader as one line. Looking for columns across the
 * whole page then finds the prose as one more column, and the prose's words
 * land on the end of every transaction that happens to share its baseline.
 *
 * So the page is split first, at a vertical strip of paper that nearly every
 * line leaves empty, that has lines of its own on both sides, and that hardly
 * any single line crosses. The last test is the one that matters, and it took
 * a wrong answer to find. The first version chose the widest qualifying strip,
 * and on the statement this was written against the widest was the gap before
 * the amount column: the sidebar sat to the right of every gutter in the table,
 * so every gutter had lines wholly on both sides, and the page was cut between
 * descriptions and their amounts.
 *
 * What separates them is what crosses them - measured, on that statement. A
 * row's cells are laid out together and share a baseline to the hundredth of a
 * point: all 38 lines lying on one side had a spread of exactly 0.00. A line of
 * the sidebar only ever sat beside a row by accident, 0.66 to 5 points off. So
 * a line whose two halves are on different baselines counts as two lines, and
 * the edge between regions is the strip that no row crosses, where a gutter
 * inside a table is crossed by every row it has.
 *
 * WHY LINES ARE CUT INTO CHUNKS
 *
 * The reader splits a line into runs at every space. That is the right unit for
 * searching and the wrong one for a table, where "Total payments received" is
 * one cell and its three words are not three columns. A chunk is what is left
 * after joining runs that sit closer together than about the width of a letter:
 * a phrase, a date, an amount - the thing a person would call a cell.
 */

import { endOf } from './shared/pdf-text.js';

/** How far apart two runs have to be, as a fraction of the type size, before
 *  they are two cells rather than two words of one. A word space is about a
 *  quarter of the size; the gap between two columns is almost never less than
 *  the width of a letter, which is what this is. */
const CHUNK_GAP = 0.9;

/** How far a line's type size may be from the document's median and still be
 *  taken for part of a table. Wide, because a statement often sets its column
 *  headings a point or two smaller than the rows under them. */
const SIZE_RANGE = [0.6, 1.6];

/** A strip has to be at least this wide, in points, to split a page. */
const RIVER_WIDTH = 9;

/** How many lines must sit wholly on each side of a strip before it counts as
 *  the edge between two regions rather than a gutter inside one table. */
const RIVER_SIDE = 3;

/** And how many lines may cross it anyway - a title set across the top of the
 *  page, a running header - as a share of the page's lines. */
const RIVER_CROSSING = 0.06;

/** Two runs are on the same baseline when they are this close, in points.
 *
 * The reader groups glyphs into lines with a generous tolerance, which is right
 * for reading and wrong for this one question. Measured on the statement this
 * was written against: every one of 38 lines lying wholly on one side of the
 * page had a baseline spread of exactly 0.00 - a table's cells are laid out
 * together and share a baseline to the hundredth - while the lines a sidebar
 * shared with the table by accident were 0.66 to 5 points apart. */
const SAME_BASELINE = 0.3;

/** Recursion guard: a page split more often than this is split into noise. */
const MAX_REGIONS_DEPTH = 3;

/**
 * A page's text as lines of runs, each run knowing where it sits.
 *
 * The line grouping is the reader's own - it has already sorted glyphs down
 * the page and decided where a space belongs that nobody wrote - so this walks
 * the text it produced rather than the glyphs, and asks `owner` which glyph
 * drew each character. A character with no glyph behind it is one of those
 * invented spaces, and it is exactly where one run ends and the next begins.
 *
 * Text placed outside the page's own box is dropped. Some producers write an
 * index or a routing code at a position no viewer will ever show, and a line
 * nobody can see is not a row of anything.
 *
 * @param {object} page  what shared/js/pdf-text.js `readPage` returned
 * @returns {{y: number, height: number, runs: {text: string, x0: number, x1: number, y: number}[]}[]}
 */
export function pageRuns(page) {
  const byOrder = new Map();
  for (const glyph of page.glyphs) byOrder.set(glyph.order, glyph);

  const box = page.box;
  const onPage = (y) => !box || (y >= box.y - 1 && y <= box.y + box.height + 1);

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
        run = { text: '', x0: glyph.origin.x, x1: glyph.origin.x, y: glyph.origin.y };
        runs.push(run);
      }

      run.text += character;
      run.x1 = Math.max(run.x1, endOf(glyph).x);
    }

    if (runs.length && onPage(y)) lines.push({ y, runs, height: median(heights) });
  }

  return lines;
}

/** The middle value, which is the size to compare against when a line has a
 *  word of another size in it - a bold reference in a sentence, a currency
 *  symbol set small - and a mean would be dragged off by it. */
export function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[sorted.length >> 1];
}

/**
 * The lines set at something near the document's usual size.
 *
 * A statement sets its table in one size and its furniture in others, so this
 * is what removes a heading twice the height of a row and a page number eight
 * times it - stronger evidence than anything about position, because a title
 * that happens to be short is still a title.
 */
export function bodySized(lines, usual = median(lines.map((line) => line.height))) {
  if (!usual) return lines;
  return lines.filter((line) => isBodySized(line, usual));
}

export function isBodySized(line, usual) {
  return line.height >= usual * SIZE_RANGE[0] && line.height <= usual * SIZE_RANGE[1];
}

/**
 * One line's runs, joined into the pieces a person would call cells.
 *
 * @returns {{text: string, x0: number, x1: number, runs: object[]}[]}
 */
export function chunksOf(line) {
  const gap = Math.max(line.height, 1) * CHUNK_GAP;
  const chunks = [];
  let chunk = null;

  for (const run of [...line.runs].sort((a, b) => a.x0 - b.x0)) {
    if (chunk && run.x0 - chunk.x1 < gap) {
      chunk.text += ` ${run.text}`;
      chunk.x1 = Math.max(chunk.x1, run.x1);
      chunk.runs.push(run);
    } else {
      chunk = { text: run.text, x0: run.x0, x1: run.x1, runs: [run] };
      chunks.push(chunk);
    }
  }

  return chunks;
}

/**
 * A page's lines, split into regions that have nothing to do with each other.
 *
 * Returned in reading order - left region before right - with each region's
 * lines still top to bottom. A line that straddles a split is cut at it, each
 * run going to the side its middle falls on.
 *
 * @param {object[]} lines  one page's lines, top to bottom
 * @returns {object[][]}
 */
export function splitRegions(lines, depth = 0) {
  if (depth >= MAX_REGIONS_DEPTH || lines.length < RIVER_SIDE * 2) return [lines];

  const river = findRiver(lines);
  if (!river) return [lines];

  const middle = (river.from + river.to) / 2;
  const left = [];
  const right = [];

  for (const line of lines) {
    const west = line.runs.filter((run) => (run.x0 + run.x1) / 2 < middle);
    const east = line.runs.filter((run) => (run.x0 + run.x1) / 2 >= middle);
    if (west.length) left.push({ ...line, runs: west });
    if (east.length) right.push({ ...line, runs: east });
  }

  return [...splitRegions(left, depth + 1), ...splitRegions(right, depth + 1)];
}

/**
 * The strip that divides the page into two regions, or null.
 *
 * Every strip nearly every line leaves empty is a candidate, and one needs
 * lines of its own on both sides to qualify - otherwise it is a gutter inside
 * a table. Of those, the strip crossed by the fewest *real* lines wins.
 *
 * Not the widest, which was the first rule and was wrong in the case it was
 * written for. A sidebar of small print sits to the right of every gutter in
 * the table beside it, so every gutter has lines wholly on each side; the gap
 * before the amount column was wider than the gap before the sidebar, and the
 * page was cut between descriptions and their amounts. What tells them apart
 * is what crosses them. A row of the table crosses every gutter inside it on a
 * single baseline, because its cells were laid out together; a line of small
 * print only ever sits beside a row by accident, a fraction of a point off.
 * So a line whose two sides sit on different baselines is counted as two lines,
 * one on each side, and the true edge between regions is the one hardly any
 * single line crosses.
 */
function findRiver(lines) {
  let left = Infinity;
  let right = -Infinity;
  for (const line of lines) {
    for (const run of line.runs) {
      left = Math.min(left, run.x0);
      right = Math.max(right, run.x1);
    }
  }
  if (!Number.isFinite(left) || right - left < RIVER_WIDTH * 3) return null;

  const width = Math.ceil(right - left) + 1;
  const printed = new Int32Array(width);
  for (const line of lines) {
    const seen = new Uint8Array(width);
    for (const run of line.runs) {
      const from = Math.max(0, Math.floor(run.x0 - left));
      const to = Math.min(width - 1, Math.ceil(run.x1 - left));
      for (let x = from; x <= to; x += 1) seen[x] = 1;
    }
    for (let x = 0; x < width; x += 1) printed[x] += seen[x];
  }

  const allowed = Math.max(2, Math.floor(lines.length * RIVER_CROSSING));
  const candidates = [];
  let start = null;
  for (let x = 0; x <= width; x += 1) {
    const empty = x < width && printed[x] <= allowed;
    if (empty && start === null) start = x;
    if (!empty && start !== null) {
      // Interior strips only: the margins of the page are not between anything.
      if (x - start >= RIVER_WIDTH && start > 0 && x < width) {
        candidates.push({ from: left + start, to: left + x - 1 });
      }
      start = null;
    }
  }

  let best = null;
  for (const strip of candidates) {
    const tally = sides(lines, strip);
    if (tally.west < RIVER_SIDE || tally.east < RIVER_SIDE) continue;
    const width = strip.to - strip.from;
    if (!best || tally.crossing < best.crossing
      || (tally.crossing === best.crossing && width > best.width)) {
      best = { ...strip, crossing: tally.crossing, width };
    }
  }

  return best;
}

/** How many lines sit wholly west of a strip, wholly east, and across it. */
function sides(lines, strip) {
  let west = 0;
  let east = 0;
  let crossing = 0;

  for (const line of lines) {
    const w = line.runs.filter((run) => run.x1 <= strip.from + 1);
    const e = line.runs.filter((run) => run.x0 >= strip.to - 1);
    const over = line.runs.length - w.length - e.length;

    if (over > 0 || (w.length && e.length && Math.abs(baseline(w) - baseline(e)) <= SAME_BASELINE)) {
      crossing += 1;
    } else {
      if (w.length) west += 1;
      if (e.length) east += 1;
    }
  }

  return { west, east, crossing };
}

function baseline(runs) {
  return median(runs.map((run) => run.y ?? 0));
}
