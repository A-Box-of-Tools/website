/**
 * Which lines make a table, and where its columns are.
 *
 * The first version of this tool found one set of columns for the whole
 * document, from the strips of paper nothing was printed in. That works when
 * one long table owns the page, and fails completely on the statement that
 * replaced it as the test case: two transactions, surrounded by an account
 * summary, a rewards table, an interest table, a column of small print and a
 * dozen totals and headings. Every one of those crosses the gutters the
 * transactions needed, so there were no gutters to find.
 *
 * So tables are found where they are, rather than assumed to be everywhere.
 *
 * BLOCKS, THEN TABLES
 *
 * Within each region layout.js found, lines are walked top to bottom and cut
 * into blocks wherever something ends a table: a heading (a line in a size of
 * its own), a stretch of empty paper, or a line whose pieces stop lining up
 * with the ones above it. A block with at least two lines of structure - two
 * or more cells - is a table in its own right.
 *
 * Then consecutive blocks with the same columns are joined. That is what puts
 * "Payments received" and "Purchases" back into one table when a statement
 * prints them as two sections under the same headings, and what carries a
 * table on page one on to its continuation on page two.
 *
 * COLUMNS FROM ALIGNMENT, NOT FROM EMPTY PAPER
 *
 * A column is an edge that several lines agree on: cells that start at the
 * same place, or - for a column of amounts set flush right - end there. Every
 * cell's two edges are gathered and clustered, and an edge survives when more
 * than one line puts a cell on it.
 *
 * Lines do not vote equally. A line with five cells is far better evidence of
 * the grid than a total with two, which is usually a label spanning three
 * columns and an amount under the fourth; each line votes with one less than
 * its number of cells, so a totals line barely counts and a full row counts
 * most. And the fullest line in the table always votes, however few lines
 * agree with it, because a table with a single row of data - the rewards table
 * on a statement, a one-line summary - has nothing to agree with. Its own six
 * values are the only evidence there is, and they are good evidence.
 *
 * An edge whose cells span two columns that survived on their own is a label
 * lying across them, not a column, and is dropped.
 */

import { chunksOf, isBodySized, median, splitRegions } from './layout.js';

/** Two edges this close, in points, are the same edge. Wider than the rounding
 *  in any real producer, narrower than any gap between two columns. */
const ALIGN = 4;

/** Empty paper, in line heights, that ends a block. A little more than the
 *  space a statement leaves between its column headings and its first row. */
const BLOCK_GAP = 2.8;

/** And, once a block has a rhythm, a gap this many times its usual spacing.
 *  A summary set every thirteen points does not continue across twenty-one;
 *  the line after that gap is in a different box on the page, whether or not
 *  the box was drawn. Erring towards a split is safe, because two blocks with
 *  the same columns are joined again below; a foreign line absorbed into a
 *  table cannot be taken out again. */
const RHYTHM_BREAK = 1.5;

/** The fullest line decides columns on its own only in a block this small -
 *  where there is nothing else to agree with it. In a larger block, one line
 *  with more pieces than the rest is the odd one out, not the authority. */
const SPINE_LINES = 3;

/** How close, in line heights, a line has to sit to the one above to be its
 *  continuation - a heading that wrapped, a cell that ran onto a second line. */
const ADJACENT = 1.6;

/** The share of a line's cells that must land on the block's edges for the
 *  line to belong to the block. Half, so a totals line - a spanning label and
 *  an amount in the right place - still belongs. */
const LINE_MATCH = 0.5;

/** The share of columns two blocks must share before they are one table.
 *  Stricter than a line's, because joining two tables that only resemble each
 *  other is a worse mistake than leaving one table in two pieces. */
const TABLE_MATCH = 0.75;

/** A piece is split between two columns only at a gap wider than this, as a
 *  fraction of the type size - wider than any space between two words. "06"
 *  and "RB" on one statement were 0.9 of a letter apart and in two columns;
 *  "payments received" were 0.28 apart, and straddling a gutter does not make
 *  them two cells. */
const SPLIT_GAP = 0.5;

/** An edge needs this share of the strongest edge's votes to survive. */
const ANCHOR_SHARE = 0.3;

/** A line of one piece set at least this much larger than the region's usual
 *  size is a heading. Both halves matter: rows on one statement mixed seven
 *  and nine points, so size alone cannot tell a heading from a row set larger
 *  - but a heading is a single phrase, and a row larger than its neighbours,
 *  a bold total, still has its cells. */
const HEADING = 1.25;

/**
 * @typedef {object} Table
 * @property {{x0: number, x1: number}[]} columns  each column's extent, left to right
 * @property {{page: number, lines: object[]}[]} blocks  in reading order
 * @property {number} page  where it starts
 */

/**
 * Every table in the document.
 *
 * @param {{number: number, lines: object[]}[]} pages
 * @returns {Table[]}
 */
export function findTables(pages) {
  const blocks = [];
  for (const page of pages) {
    for (const region of splitRegions(page.lines)) {
      // The usual size is the region's, not the document's. A statement sets
      // its summary page in ten points and its transactions in seven, and a
      // median taken across both lands at nine - where a twelve-point section
      // heading passes for body text and stops ending the table above it.
      const usual = median(region.map((line) => line.height));
      for (const block of blocksOf(region, usual)) {
        blocks.push({ page: page.number, ...block });
      }
    }
  }

  const tables = [];
  for (const block of blocks) {
    const last = tables[tables.length - 1];
    if (last && sameGrid(last.columns, block.columns)) {
      last.blocks.push(block);
      last.columns = columnsOf(last.blocks.flatMap((b) => b.lines));
    } else {
      tables.push({ page: block.page, blocks: [block], columns: block.columns });
    }
  }

  return tables;
}

/**
 * One region's lines, cut into the blocks that are tables.
 */
function blocksOf(lines, usual) {
  const out = [];
  let block = null;
  let pending = [];

  const close = () => {
    if (block && block.gridLines >= 2) {
      const columns = columnsOf(block.lines);
      if (columns.length >= 2) {
        out.push({ lines: trimTail(block.lines, columns), columns });
      }
    }
    block = null;
  };

  for (const line of lines) {
    const chunks = chunksOf(line);
    const grid = chunks.length >= 2;

    // A heading ends whatever it follows, and belongs to nothing: it is the
    // name of the table below it, not a row of it.
    const heading = !isBodySized(line, usual)
      || (!grid && line.height >= usual * HEADING);
    if (heading) {
      close();
      pending = [];
      continue;
    }

    if (block && breaksRhythm(block.lines, line)) close();
    // Not judged until two lines of structure exist: the first is often a
    // heading whose words stand wherever they fit, and it is the second - the
    // first row of data - that says where the columns really are.
    if (block && grid && block.gridLines >= 2 && !fits(chunks, block.edges)) close();

    if (!block) {
      if (!grid) {
        // Held back in case the next line starts a table: the top line of a
        // two-line heading has too few gaps in it to count as structure on
        // its own - "TRANSACTION POSTING" is one piece - but belongs above
        // the grid it sits over.
        pending = [...pending, line].slice(-2);
        continue;
      }
      block = { lines: [], edges: [], gridLines: 0 };
      for (const held of pending) {
        if (gapBetween(held, line) <= ADJACENT * 2 && sitsOver(held, chunks)) block.lines.push(held);
      }
      pending = [];
    }

    block.lines.push(line);
    if (grid) {
      block.gridLines += 1;
      block.edges.push(...chunks);
    }
  }

  close();
  return out;
}

/** Vertical space between two lines, in line heights. */
function gapBetween(upper, lower) {
  return (upper.y - lower.y) / Math.max(upper.height, lower.height, 1);
}

/** Whether the space above a line is too much for it to belong to the block. */
function breaksRhythm(lines, line) {
  const last = lines[lines.length - 1];
  if (gapBetween(last, line) > BLOCK_GAP) return true;
  if (lines.length < 3) return false;
  const steps = [];
  for (let at = 1; at < lines.length; at += 1) steps.push(lines[at - 1].y - lines[at].y);
  return last.y - line.y > median(steps) * RHYTHM_BREAK;
}

/** Whether a line's pieces land on the edges the block already has. */
function fits(chunks, edges) {
  if (!edges.length) return true;
  const landed = chunks.filter((chunk) => edges.some((edge) => aligned(chunk, edge))).length;
  return landed >= Math.ceil(chunks.length * LINE_MATCH);
}

function aligned(a, b) {
  return Math.abs(a.x0 - b.x0) <= ALIGN || Math.abs(a.x1 - b.x1) <= ALIGN;
}

/** Whether a held-back line's words stand over the cells of the line below -
 *  at least two of them starting where cells below start. A sentence above a
 *  table does not; the top half of its column headings does. */
function sitsOver(line, chunks) {
  const starts = new Set();
  for (const run of line.runs) {
    const under = chunks.findIndex((chunk) => Math.abs(chunk.x0 - run.x0) <= ALIGN);
    if (under >= 0) starts.add(under);
  }
  return starts.size >= 2;
}

/**
 * Drop lines hanging off the bottom of a block that are not part of it.
 *
 * A paragraph set close under a table would otherwise become its last rows.
 * What is kept is what a table actually has there: a cell that ran onto a
 * second line, sitting close under the row and inside one column.
 */
function trimTail(lines, columns) {
  const kept = [...lines];
  while (kept.length > 1) {
    const last = kept[kept.length - 1];
    if (chunksOf(last).length >= 2) break;
    const above = kept[kept.length - 2];
    const inside = overlapping(last, columns).length === 1;
    if (inside && gapBetween(above, last) <= ADJACENT) break;
    kept.pop();
  }
  return kept;
}

/**
 * Where a set of lines puts its columns.
 *
 * @returns {{x0: number, x1: number}[]}
 */
export function columnsOf(lines) {
  const grid = lines.map(chunksOf).filter((chunks) => chunks.length >= 2);
  if (!grid.length) return [];

  const fullest = Math.max(...grid.map((chunks) => chunks.length));
  const small = grid.length <= SPINE_LINES;
  const edges = { left: [], right: [] };

  grid.forEach((chunks, line) => {
    const weight = chunks.length - 1;
    const spine = small && chunks.length === fullest;
    for (const chunk of chunks) {
      edges.left.push({ x: chunk.x0, line, weight, spine, chunk });
      edges.right.push({ x: chunk.x1, line, weight, spine, chunk });
    }
  });

  const clusters = [...cluster(edges.left), ...cluster(edges.right)].map((members) => {
    const votes = new Map();
    for (const edge of members) votes.set(edge.line, Math.max(votes.get(edge.line) ?? 0, edge.weight));
    return {
      lines: votes.size,
      score: [...votes.values()].reduce((sum, vote) => sum + vote, 0),
      spine: members.some((edge) => edge.spine),
      // What the pieces agree on rather than everything any of them covers:
      // the upper middle of their left edges and the lower middle of their
      // right, which for two pieces is simply their overlap. One piece that
      // ran into its neighbour - "Bonus" set half a letter from "on May 15" -
      // would otherwise make its column as wide as both, and the column
      // beside it would be swallowed.
      x0: upperMiddle(members.map((edge) => edge.chunk.x0)),
      x1: lowerMiddle(members.map((edge) => edge.chunk.x1)),
    };
  });

  const best = Math.max(...clusters.map((c) => c.score));
  const kept = clusters
    .filter((c) => c.spine || (c.lines >= 2 && c.score >= best * ANCHOR_SHARE))
    .sort((a, b) => b.score - a.score || Number(b.spine) - Number(a.spine));

  // Strongest first. A candidate overlapping one accepted column is the same
  // column seen from its other edge, and widens it; overlapping two, it is a
  // label lying across them and is not a column at all.
  const columns = [];
  for (const candidate of kept) {
    const touching = columns.filter((column) => overlaps(candidate, column));
    if (touching.length === 0) columns.push({ x0: candidate.x0, x1: candidate.x1 });
    else if (touching.length === 1) {
      touching[0].x0 = Math.min(touching[0].x0, candidate.x0);
      touching[0].x1 = Math.max(touching[0].x1, candidate.x1);
    }
  }

  return columns.sort((a, b) => a.x0 - b.x0);
}

function upperMiddle(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[sorted.length >> 1];
}

function lowerMiddle(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[(sorted.length - 1) >> 1];
}

/** Edges sorted and grouped, each group no wider than twice the tolerance so
 *  a run of evenly spaced edges cannot chain into one. */
function cluster(edges) {
  const sorted = [...edges].sort((a, b) => a.x - b.x);
  const groups = [];
  let group = null;
  for (const edge of sorted) {
    if (group && edge.x - group[group.length - 1].x <= ALIGN && edge.x - group[0].x <= ALIGN * 2) {
      group.push(edge);
    } else {
      group = [edge];
      groups.push(group);
    }
  }
  return groups;
}

function overlaps(a, b) {
  return Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0) > 0.5;
}

/** The columns an extent touches, left to right. */
function overlapping(item, columns) {
  const x0 = item.x0 ?? Math.min(...item.runs.map((run) => run.x0));
  const x1 = item.x1 ?? Math.max(...item.runs.map((run) => run.x1));
  const out = [];
  columns.forEach((column, index) => {
    if (overlaps({ x0, x1 }, column)) out.push(index);
  });
  return out;
}

/**
 * Where a piece that lands in no column belongs: the column to its left.
 *
 * Not the nearest. A piece in the gap between two columns is almost always the
 * tail of the cell before it - a payee's name drawn in two parts, "CR" set
 * after an amount - and on one layout "DIRECT" sat nearer the amounts than the
 * description it ends, which made an amount into a phrase. Text runs left to
 * right; what overflows a cell overflows rightwards out of it.
 */
function leftward(item, columns) {
  let found = 0;
  columns.forEach((column, index) => {
    if (column.x0 <= item.x0 + ALIGN) found = index;
  });
  return found;
}

/**
 * Whether two blocks have the same columns - the test for joining them.
 *
 * Matched one to one and in order. Matching each column against any column of
 * the other let two columns of one table both claim the same column of the
 * next - a posting date and a transaction type ending a point apart - and
 * joined an interest table on to the transactions above it.
 */
function sameGrid(a, b) {
  const [small, large] = a.length <= b.length ? [a, b] : [b, a];
  let from = 0;
  let matched = 0;
  for (const column of small) {
    for (let at = from; at < large.length; at += 1) {
      if (aligned(column, large[at])) {
        matched += 1;
        from = at + 1;
        break;
      }
    }
  }
  return matched >= Math.ceil(small.length * TABLE_MATCH);
}

/**
 * One line, dealt out into a table's columns.
 *
 * Piece by piece, and split only where a piece's own words sit inside
 * different columns. A heading's words each stand over their own column -
 * "TRANSACTION" over the first, "POSTING" over the second, closer together
 * than a column gap but each inside one column - and are split between them.
 * A word that lands in no column at all follows the words beside it, rather
 * than the nearest column: otherwise a sentence lying across a table is cut
 * wherever the middle of a gap happens to fall. And a piece with a word that
 * touches two columns is a label running across them, which goes whole to the
 * leftmost, because "Total payments received" is one cell and not three.
 *
 * @returns {string[]} one cell per column, possibly empty
 */
export function cellsOf(line, columns) {
  const cells = columns.map(() => []);
  if (!columns.length) return [];

  for (const chunk of chunksOf(line)) {
    const hits = chunk.runs.map((run) => overlapping(run, columns));

    if (hits.some((touched) => touched.length > 1)) {
      cells[overlapping(chunk, columns)[0]].push(chunk.text);
      continue;
    }

    const anchors = new Set(hits.filter((touched) => touched.length).map((touched) => touched[0]));
    if (anchors.size <= 1) {
      const into = anchors.size ? [...anchors][0] : leftward(chunk, columns);
      cells[into].push(chunk.text);
      continue;
    }

    // Cut only where a word lands in a different column from the words before
    // it *and* sits further from them than a space between words. Everything
    // between two cuts is one cell, in the column its words are in.
    const gap = Math.max(line.height, 1) * SPLIT_GAP;
    const pieces = [];
    let piece = null;
    chunk.runs.forEach((run, index) => {
      const column = hits[index][0] ?? null;
      const apart = index > 0 && run.x0 - chunk.runs[index - 1].x1 > gap;
      if (piece && column !== null && piece.column !== null && column !== piece.column && apart) {
        piece = null;
      }
      if (!piece) {
        piece = { column, words: [] };
        pieces.push(piece);
      }
      if (piece.column === null) piece.column = column;
      piece.words.push(run.text);
    });
    for (const { column, words } of pieces) {
      cells[column ?? leftward(chunk, columns)].push(words.join(' '));
    }
  }

  return cells.map((parts) => parts.join(' ').trim());
}
