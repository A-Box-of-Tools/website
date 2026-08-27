/**
 * Laying the frames out as one picture: a sprite sheet.
 *
 * A GIF is an animation that only a GIF player can play. Every engine that
 * wants to show it - a game engine, a shader, a CSS `steps()` animation -
 * wants the same thing instead: one image with the frames in a grid, plus the
 * two numbers saying how the grid is cut. So this is the same forward walk the
 * ZIP export already does, with each frame painted into a cell rather than
 * encoded on its own.
 *
 * The geometry is here, away from the DOM and away from the canvas, because it
 * is arithmetic with edges worth testing: a prime number of frames, a single
 * frame, a column count somebody typed that is larger than the frame count,
 * and the sizes that no browser will allocate.
 *
 * Cells are the size the GIF holds its frames at and nothing is scaled on the
 * way in. That is the tool's existing rule - see "No resizing on the way out"
 * in README.md - and it matters more here than anywhere else: a sprite sheet
 * resampled by a hair puts a seam of a neighbouring frame's pixels down the
 * edge of every cell, and pixel art is what most of these GIFs are.
 */

/**
 * The largest side any of the three engines will allocate. Chrome and Safari
 * both stop at 16384; Firefox goes further, and matching the lowest of the
 * three is the only way a refusal here means the same thing everywhere.
 */
export const MAX_SIDE = 16384;

/**
 * Above this, a phone may refuse what a desktop allows. iOS Safari has long
 * capped a canvas far below the desktop limit, and the failure is silent - a
 * blank sheet rather than an error - so it is worth saying before rather than
 * explaining after.
 */
export const CAUTION_SIDE = 4096;

/**
 * How many columns to suggest for a given number of frames.
 *
 * The squarest grid that holds them, because a sheet that is 300 cells wide
 * and one tall is legal, useless to look at, and hits the side limit at a
 * frame count the square version would not have. Ties go to the wider grid:
 * screens are wider than they are tall, and so is every sheet anybody checks
 * by eye.
 */
export function suggestColumns(count) {
  if (count <= 0) return 0;
  return Math.ceil(Math.sqrt(count));
}

/**
 * The grid, and whether a browser will allocate it.
 *
 * Returns the shape of the sheet rather than drawing it, so the page can show
 * the numbers - and the refusal - before anybody presses a button. `columns`
 * is what the reader asked for; it is clamped rather than rejected, because a
 * column count above the frame count means one row and that is a legitimate
 * thing to want.
 */
export function sheetPlan(count, frameWidth, frameHeight, columns) {
  const cells = Math.max(0, Math.floor(count));
  const wanted = Math.floor(columns) > 0 ? Math.floor(columns) : suggestColumns(cells);
  const cols = Math.max(1, Math.min(wanted, cells || 1));
  const rows = cells > 0 ? Math.ceil(cells / cols) : 0;
  const width = cols * frameWidth;
  const height = rows * frameHeight;
  return {
    cells, columns: cols, rows, width, height,
    // Two separate answers rather than one "ok". The first is a fact about
    // every browser; the second is a warning about one, and a reader on a
    // desktop should not be stopped by it.
    tooBig: width > MAX_SIDE || height > MAX_SIDE,
    risky: width > CAUTION_SIDE || height > CAUTION_SIDE,
  };
}

/**
 * Where one cell sits, in pixels, given its position in the sequence.
 *
 * Row-major - left to right, then down - which is the order every sprite-sheet
 * consumer assumes and the order the frames were already in.
 */
export function cellAt(index, plan, frameWidth, frameHeight) {
  return {
    x: (index % plan.columns) * frameWidth,
    y: Math.floor(index / plan.columns) * frameHeight,
  };
}

/**
 * The name the file goes out under.
 *
 * The grid is in the filename because the two numbers are not recoverable from
 * the image: 48 cells in a 1536x512 sheet could be 6x8 or 12x4 and both look
 * plausible. Whatever reads the sheet has to be told, and the filename is the
 * one place the answer survives being emailed to somebody.
 */
export function sheetName(base, plan) {
  return `${base}-sheet-${plan.columns}x${plan.rows}.png`;
}
