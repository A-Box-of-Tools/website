/**
 * Finding a QR symbol in a picture, and reading its modules off the pixels.
 *
 * Everything in `qr-decode.js` assumes a tidy square of modules. Getting one
 * out of a photograph is this file's job, and it is the part that has nothing
 * to do with the specification: the standard says what a symbol looks like, not
 * how to find one that is small, rotated, off to one side and photographed at
 * an angle.
 *
 * The way in is the three big squares in the corners. They are there precisely
 * so that a reader can find the symbol without understanding it: along any line
 * across one, the dark and light runs are in the ratio 1:1:3:1:1, and that
 * ratio holds whatever angle the line crosses at and whatever size the symbol
 * is drawn at. So the picture is scanned row by row for that ratio, every hit
 * is checked again down its column and along its diagonals, and what survives
 * is a list of centres.
 *
 * Three centres give the corners of the symbol, which is nearly enough. It is
 * not quite enough, because a photograph is a projection: the far edge of a
 * code lying on a table is shorter than the near one, so the modules are not
 * evenly spaced and no amount of dividing by an average will land on them. The
 * fourth reference point is the alignment pattern near the remaining corner,
 * and with four points there is exactly one perspective transform that maps
 * the grid onto the picture. That transform is what the sampler walks.
 *
 * The approach is the one ZXing established and everything since has followed;
 * this is a fresh implementation of it, written to be read.
 */

import { decodeMatrix, UnreadableError } from './qr-decode.js';
import { sizeOf } from './shared/qr-tables.js';

/** The largest symbol there is, which bounds how coarsely a row scan may step. */
const MAX_MODULES = 177;

/* ------------------------------------------------------- the finder patterns */

/**
 * Do five runs of dark, light, dark, light, dark hold the finder ratio?
 *
 * The allowance is half a module on the thin runs and one and a half on the
 * thick middle one - generous, because this is only the first sieve and every
 * hit is checked twice more before it counts.
 */
function isFinderRatio(runs) {
  let total = 0;
  for (const run of runs) {
    if (run === 0) return false;
    total += run;
  }
  if (total < 7) return false;

  const module = total / 7;
  const allowance = module / 2;
  return Math.abs(module - runs[0]) < allowance
    && Math.abs(module - runs[1]) < allowance
    && Math.abs(3 * module - runs[2]) < 3 * allowance
    && Math.abs(module - runs[3]) < allowance
    && Math.abs(module - runs[4]) < allowance;
}

/** Where the middle of the pattern is, counting back from where the last run ended. */
function centreFromEnd(runs, end) {
  return end - runs[4] - runs[3] - runs[2] / 2;
}

/**
 * Follow the same five runs down a column, or along a diagonal, through a
 * point a row scan liked.
 *
 * A row of a barcode, a line of text, or the edge of a table can all produce
 * 1:1:3:1:1 across one row. Almost nothing that is not a finder pattern
 * produces it in two directions at once through the same point, which is what
 * makes this cheap check worth so much.
 *
 * `middle` bounds how far each walk may run before giving up, and is only a
 * guard against walking the length of a dark photograph: it is deliberately
 * loose, because how long a run is depends on the angle the line crosses the
 * symbol at. A code turned 45 degrees is crossed corner to corner, and its
 * runs are half as long again as the same code crossed square on.
 *
 * `expected` is the total the line that found this point measured. Comparing
 * against it throws out a feature that has the right proportions and the wrong
 * size, and it is left off for the diagonal, where the two totals have no
 * fixed relation at all - a diagonal step covers a different distance
 * depending on how the symbol is turned.
 */
function crossCheck(bits, width, height, startX, startY, stepX, stepY, middle, expected) {
  const runs = [0, 0, 0, 0, 0];
  const dark = (x, y) => (x >= 0 && y >= 0 && x < width && y < height
    ? bits[y * width + x] === 1 : false);
  const centre = middle * 2;
  const outer = middle * 4;

  let x = startX;
  let y = startY;
  while (dark(x, y) && runs[2] <= centre) {
    runs[2] += 1;
    x -= stepX;
    y -= stepY;
  }
  if (runs[2] > centre) return NaN;
  while (!dark(x, y) && runs[1] <= centre) {
    runs[1] += 1;
    x -= stepX;
    y -= stepY;
  }
  if (runs[1] > centre) return NaN;
  while (dark(x, y) && runs[0] <= outer) {
    runs[0] += 1;
    x -= stepX;
    y -= stepY;
  }
  if (runs[0] > outer) return NaN;

  x = startX + stepX;
  y = startY + stepY;
  while (dark(x, y) && runs[2] <= centre) {
    runs[2] += 1;
    x += stepX;
    y += stepY;
  }
  if (runs[2] > centre) return NaN;
  while (!dark(x, y) && runs[3] <= centre) {
    runs[3] += 1;
    x += stepX;
    y += stepY;
  }
  if (runs[3] > centre) return NaN;
  while (dark(x, y) && runs[4] <= outer) {
    runs[4] += 1;
    x += stepX;
    y += stepY;
  }
  if (runs[4] > outer) return NaN;

  const total = runs[0] + runs[1] + runs[2] + runs[3] + runs[4];
  if (expected !== null && Math.abs(total - expected) * 5 >= 2 * expected) return NaN;

  if (!isFinderRatio(runs)) return NaN;
  const end = stepX !== 0 ? x : y;
  return centreFromEnd(runs, end);
}

/**
 * Every finder pattern in the picture.
 *
 * Rows are scanned with a stride at first, because a finder pattern is at
 * least seven modules tall and no symbol has more than 177 of them: stepping
 * three rows at a time cannot step over one. `dense` scans every row, which is
 * what a small or blurred symbol needs and what a second attempt uses.
 *
 * @returns {{x: number, y: number, size: number, seen: number}[]}
 */
export function findFinders(bits, width, height, dense = false) {
  const found = [];
  const stride = dense ? 1 : Math.max(3, Math.floor((3 * height) / (4 * MAX_MODULES)));

  const remember = (runs, row, endColumn) => {
    const total = runs[0] + runs[1] + runs[2] + runs[3] + runs[4];
    let x = centreFromEnd(runs, endColumn);

    const y = crossCheck(bits, width, height, Math.floor(x), row, 0, 1, runs[2], total);
    if (Number.isNaN(y)) return;

    x = crossCheck(bits, width, height, Math.floor(x), Math.floor(y), 1, 0, runs[2], total);
    if (Number.isNaN(x)) return;

    // One diagonal as well. It is the check that throws out the corner of a
    // table and the gap between two paragraphs of text.
    const diagonal = crossCheck(bits, width, height, Math.floor(x), Math.floor(y),
                                1, 1, runs[2], null);
    if (Number.isNaN(diagonal)) return;

    const size = total / 7;
    for (const centre of found) {
      if (Math.abs(centre.x - x) <= size && Math.abs(centre.y - y) <= size
        && Math.abs(centre.size - size) <= Math.max(size, centre.size) / 2) {
        // The same pattern, seen from another row. Averaged in, and the count
        // of how often it was seen is what tells a real one from a fluke.
        const n = centre.seen + 1;
        centre.x = (centre.x * centre.seen + x) / n;
        centre.y = (centre.y * centre.seen + y) / n;
        centre.size = (centre.size * centre.seen + size) / n;
        centre.seen = n;
        return;
      }
    }
    found.push({ x, y, size, seen: 1 });
  };

  for (let row = stride - 1; row < height; row += stride) {
    const runs = [0, 0, 0, 0, 0];
    let state = 0;

    for (let column = 0; column < width; column += 1) {
      if (bits[row * width + column] === 1) {
        // Dark. An odd state means the run before this was light, so this
        // starts the next run.
        if ((state & 1) === 1) state += 1;
        runs[state] += 1;
      } else if ((state & 1) === 1) {
        runs[state] += 1;
      } else if (state === 4) {
        if (isFinderRatio(runs)) {
          remember(runs, row, column);
          runs.fill(0);
          state = 0;
        } else {
          // Not a pattern, but the last three runs may be the first three of
          // one. Shifting rather than restarting is what finds two finder
          // patterns that touch.
          runs[0] = runs[2];
          runs[1] = runs[3];
          runs[2] = runs[4];
          runs[3] = 1;
          runs[4] = 0;
          state = 3;
        }
      } else {
        state += 1;
        runs[state] += 1;
      }
    }

    if (state === 4 && isFinderRatio(runs)) remember(runs, row, width);
  }

  return found;
}

/* ---------------------------------------------------------- three of them */

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Which three of the candidates are the corners of one symbol.
 *
 * Three finder patterns of one symbol are drawn at the same size and sit at
 * the corners of a right isosceles triangle. Both facts are scored, because
 * either alone is fooled: three unrelated marks can be the same size, and a
 * finder pattern plus two pieces of furniture can make a right angle.
 */
export function rankTriples(candidates, keep = 4) {
  if (candidates.length < 3) return [];

  // A symbol has three of these and a busy photograph can offer a dozen. The
  // ones seen most often are the ones a row scan crossed most times, which is
  // to say the biggest and clearest.
  const pool = [...candidates].sort((a, b) => b.seen - a.seen).slice(0, 12);
  const scored = [];

  for (let i = 0; i < pool.length; i += 1) {
    for (let j = i + 1; j < pool.length; j += 1) {
      for (let k = j + 1; k < pool.length; k += 1) {
        const three = [pool[i], pool[j], pool[k]];
        const sizes = three.map((centre) => centre.size);
        const meanSize = (sizes[0] + sizes[1] + sizes[2]) / 3;
        const spread = Math.max(...sizes) - Math.min(...sizes);

        const sides = [
          distance(three[0], three[1]),
          distance(three[1], three[2]),
          distance(three[0], three[2]),
        ].sort((a, b) => a - b);
        // Closer together than the smallest symbol allows: version 1 puts
        // fourteen modules between two finder centres.
        if (sides[0] < meanSize * 4) continue;

        // The angle at the corner, which for a symbol is a right angle and for
        // three marks in a row is a straight one. This is a gate rather than a
        // score because a straight line scores rather well on everything else -
        // its two halves are equal, and its ends are the same size as each
        // other - and three things in a row is what a page of text, a shelf, or
        // a row of windows looks like from here.
        const corner = Math.acos(
          Math.min(1, Math.max(-1, (sides[0] ** 2 + sides[1] ** 2 - sides[2] ** 2)
            / (2 * sides[0] * sides[1]))));
        if (corner < 0.96 || corner > 2.18) continue;

        // Two equal legs and a hypotenuse root two longer.
        const legs = Math.abs(sides[0] - sides[1]) / sides[1];
        const right = Math.abs(sides[2] - sides[1] * Math.SQRT2) / sides[2];
        const score = spread / meanSize + legs * 2 + right * 3;

        // Loose, because the score is a ranking and not a verdict. A code
        // photographed at a steep angle has one finder pattern visibly smaller
        // than the others and a triangle that is not much of a right angle;
        // what settles whether it is a code is trying to read it.
        if (score < 3) scored.push({ three, score });
      }
    }
  }

  scored.sort((a, b) => a.score - b.score);
  return scored.slice(0, keep).map((entry) => entry.three);
}

/**
 * Which of the three is which corner.
 *
 * The corner with the right angle is the one the other two are nearest to, so
 * it is the one not on the longest side. Which of the remaining two is the top
 * right depends on which way round the symbol is, and a cross product answers
 * that in one line - and answers it for a code photographed upside down as
 * readily as for one the right way up.
 */
export function orient(three) {
  const sides = [
    { length: distance(three[0], three[1]), opposite: 2 },
    { length: distance(three[1], three[2]), opposite: 0 },
    { length: distance(three[0], three[2]), opposite: 1 },
  ].sort((a, b) => b.length - a.length);

  const topLeft = three[sides[0].opposite];
  const others = three.filter((centre) => centre !== topLeft);
  const [a, b] = others;

  const cross = (b.x - topLeft.x) * (a.y - topLeft.y)
    - (b.y - topLeft.y) * (a.x - topLeft.x);

  return cross < 0
    ? { topLeft, topRight: a, bottomLeft: b }
    : { topLeft, topRight: b, bottomLeft: a };
}

/* ------------------------------------------------------------ the module size */

/**
 * How far it is from a point to the far side of the dark-light-dark it sits
 * in, walking towards another point.
 *
 * Bresenham, with a state machine counting the two colour changes. The point
 * of walking towards the other finder pattern rather than straight along a row
 * is that the line between two finder centres is parallel to the edge of the
 * symbol however the symbol is turned - so what comes back is the module size,
 * and not the module size divided by the cosine of an angle nobody measured.
 */
function runTowards(bits, width, height, fromX, fromY, toX, toY) {
  const steep = Math.abs(toY - fromY) > Math.abs(toX - fromX);
  let [ax, ay, bx, by] = steep ? [fromY, fromX, toY, toX] : [fromX, fromY, toX, toY];

  const dx = Math.abs(bx - ax);
  const dy = Math.abs(by - ay);
  const stepX = ax < bx ? 1 : -1;
  const stepY = ay < by ? 1 : -1;
  let error = -dx / 2;
  let state = 0;

  const dark = (x, y) => {
    const realX = steep ? y : x;
    const realY = steep ? x : y;
    return realX >= 0 && realY >= 0 && realX < width && realY < height
      && bits[realY * width + realX] === 1;
  };

  let x = ax;
  let y = ay;
  for (; x !== bx + stepX; x += stepX) {
    if ((state === 1) === dark(x, y)) {
      if (state === 2) return Math.hypot(x - ax, y - ay);
      state += 1;
    }
    error += dy;
    if (error > 0) {
      if (y === by) break;
      y += stepY;
      error -= dx;
    }
  }

  // Ran out of line still inside the second dark run. That is a symbol that
  // reaches the edge of the picture, and the distance so far is the best
  // measurement available.
  if (state === 2) return Math.hypot(bx + stepX - ax, by - ay);
  return NaN;
}

/**
 * The module size, measured between two finder centres.
 *
 * Each finder pattern is seven modules across, so the dark-light-dark run
 * either side of its centre is seven modules end to end - measured in both
 * directions, from each centre, and averaged over the fourteen.
 */
function moduleSizeBetween(bits, width, height, a, b) {
  const both = (from, to) => {
    const forwards = runTowards(bits, width, height,
                                Math.round(from.x), Math.round(from.y),
                                Math.round(to.x), Math.round(to.y));
    // The other half of the same run, found by walking towards the point
    // opposite: the run through a finder centre is symmetrical about it.
    const backwards = runTowards(bits, width, height,
                                 Math.round(from.x), Math.round(from.y),
                                 Math.round(from.x - (to.x - from.x)),
                                 Math.round(from.y - (to.y - from.y)));
    return forwards + backwards - 1;
  };

  const one = both(a, b);
  const other = both(b, a);
  if (Number.isNaN(one)) return Number.isNaN(other) ? NaN : other / 7;
  if (Number.isNaN(other)) return one / 7;
  return (one + other) / 14;
}

/* ------------------------------------------------------ the alignment pattern */

/** Are three runs all one module long, give or take half of one? */
function isAlignmentRatio(runs, moduleSize) {
  const allowance = moduleSize / 2;
  return Math.abs(moduleSize - runs[0]) < allowance
    && Math.abs(moduleSize - runs[1]) < allowance
    && Math.abs(moduleSize - runs[2]) < allowance;
}

/**
 * Look for the small three-ring square near the fourth corner.
 *
 * What is looked for is the light-dark-light through the middle of it: the
 * inner light ring, the single dark module at its centre, and the light ring
 * on the other side. That is a much weaker signature than the finder pattern's
 * - one module either side of one module is a shape that occurs all over an
 * ordinary QR symbol - so the search is confined to a box around where the
 * geometry says the pattern should be, and to runs about one module long.
 *
 * Not finding one is not a failure. The caller falls back to treating the
 * symbol as a parallelogram, which is exactly right for a scan or a screenshot
 * and close enough for a photograph taken square on.
 */
function findAlignment(bits, width, height, centreX, centreY, moduleSize, allowance) {
  const left = Math.max(0, Math.floor(centreX - allowance));
  const right = Math.min(width - 1, Math.ceil(centreX + allowance));
  const top = Math.max(0, Math.floor(centreY - allowance));
  const bottom = Math.min(height - 1, Math.ceil(centreY + allowance));
  if (right - left < moduleSize * 3 || bottom - top < moduleSize * 3) return null;

  const candidates = [];

  for (let row = top; row <= bottom; row += 1) {
    const runs = [0, 0, 0];
    let state = 0;

    for (let column = left; column <= right; column += 1) {
      const dark = bits[row * width + column] === 1;
      if (state === 1 ? dark : !dark) {
        runs[state] += 1;
      } else if (state === 2) {
        if (isAlignmentRatio(runs, moduleSize)) {
          const x = column - runs[2] - runs[1] / 2;
          const y = alignmentColumn(bits, width, height, Math.round(x), row,
                                    runs[1], runs[0] + runs[1] + runs[2], moduleSize);
          if (!Number.isNaN(y)) candidates.push({ x, y, size: (runs[0] + runs[1] + runs[2]) / 3 });
        }
        // Not a pattern, or one already taken: the light run that ended it may
        // still be the light run that starts the next one.
        runs[0] = runs[2];
        runs[1] = 1;
        runs[2] = 0;
        state = 1;
      } else {
        state += 1;
        runs[state] += 1;
      }
    }
  }

  if (!candidates.length) return null;

  // The one nearest where it was expected. A photograph of a sheet of codes
  // can put a neighbour's pattern inside the search box.
  return candidates.reduce((best, candidate) => (
    Math.hypot(candidate.x - centreX, candidate.y - centreY)
      < Math.hypot(best.x - centreX, best.y - centreY) ? candidate : best));
}

/** The same three runs down a column, which is what confirms an alignment hit. */
function alignmentColumn(bits, width, height, x, startY, middle, expected, moduleSize) {
  if (x < 0 || x >= width) return NaN;
  const dark = (y) => y >= 0 && y < height && bits[y * width + x] === 1;

  // Twice the run the row measured, because a run that is exactly as long
  // vertically as it was horizontally has to be allowed to finish. A bound of
  // exactly `middle` rejects the square pattern this is looking for.
  const limit = middle * 2;

  let centre = 0;
  let y = startY;
  while (dark(y) && centre <= limit) { centre += 1; y -= 1; }
  if (y < 0 || centre > limit) return NaN;
  let above = 0;
  while (y >= 0 && !dark(y) && above <= limit) { above += 1; y -= 1; }
  if (above > limit) return NaN;

  let downward = 0;
  y = startY + 1;
  while (dark(y) && centre + downward <= limit) { downward += 1; y += 1; }
  if (y >= height || centre + downward > limit) return NaN;
  let below = 0;
  while (y < height && !dark(y) && below <= limit) { below += 1; y += 1; }
  if (below > limit) return NaN;

  const runs = [above, centre + downward, below];
  const total = runs[0] + runs[1] + runs[2];
  if (5 * Math.abs(total - expected) >= 2 * expected) return NaN;
  if (!isAlignmentRatio(runs, moduleSize)) return NaN;

  return y - below - runs[1] / 2;
}

/* ------------------------------------------------------ the transform, and the grid */

/**
 * The perspective transform taking the unit square to four points.
 *
 * Eight numbers, worked out from the four corners: the affine case when the
 * quadrilateral is a parallelogram, and the projective one otherwise. This is
 * the standard construction; what is worth knowing is why a projective one is
 * needed at all. An affine transform keeps parallel lines parallel, and in a
 * photograph of anything not held exactly flat and square they are not.
 */
function squareToQuad(p) {
  const dx3 = p[0].x - p[1].x + p[2].x - p[3].x;
  const dy3 = p[0].y - p[1].y + p[2].y - p[3].y;

  if (dx3 === 0 && dy3 === 0) {
    return [p[1].x - p[0].x, p[2].x - p[1].x, p[0].x,
      p[1].y - p[0].y, p[2].y - p[1].y, p[0].y,
      0, 0, 1];
  }

  const dx1 = p[1].x - p[2].x;
  const dx2 = p[3].x - p[2].x;
  const dy1 = p[1].y - p[2].y;
  const dy2 = p[3].y - p[2].y;
  const denominator = dx1 * dy2 - dx2 * dy1;
  const a13 = (dx3 * dy2 - dx2 * dy3) / denominator;
  const a23 = (dx1 * dy3 - dx3 * dy1) / denominator;

  return [
    p[1].x - p[0].x + a13 * p[1].x, p[3].x - p[0].x + a23 * p[3].x, p[0].x,
    p[1].y - p[0].y + a13 * p[1].y, p[3].y - p[0].y + a23 * p[3].y, p[0].y,
    a13, a23, 1,
  ];
}

/** The adjoint, which stands in for the inverse: scale does not matter here. */
function adjoint(m) {
  return [
    m[4] * m[8] - m[5] * m[7], m[2] * m[7] - m[1] * m[8], m[1] * m[5] - m[2] * m[4],
    m[5] * m[6] - m[3] * m[8], m[0] * m[8] - m[2] * m[6], m[2] * m[3] - m[0] * m[5],
    m[3] * m[7] - m[4] * m[6], m[1] * m[6] - m[0] * m[7], m[0] * m[4] - m[1] * m[3],
  ];
}

function times(a, b) {
  const out = new Array(9);
  for (let row = 0; row < 3; row += 1) {
    for (let column = 0; column < 3; column += 1) {
      out[row * 3 + column] = a[row * 3] * b[column]
        + a[row * 3 + 1] * b[3 + column]
        + a[row * 3 + 2] * b[6 + column];
    }
  }
  return out;
}

/** The transform taking the four grid corners onto the four picture corners. */
function quadToQuad(from, to) {
  return times(squareToQuad(to), adjoint(squareToQuad(from)));
}

function apply(m, x, y) {
  const w = m[6] * x + m[7] * y + m[8];
  return { x: (m[0] * x + m[1] * y + m[2]) / w, y: (m[3] * x + m[4] * y + m[5]) / w };
}

/**
 * Read the modules off the picture, one sample per module.
 *
 * The sample is taken at the middle of each module, which is the point
 * furthest from every edge and so the one least affected by the picture being
 * blurred or the transform being slightly off. A sample that lands outside the
 * picture means the symbol is cut off at the frame, and the whole detection is
 * abandoned rather than guessed at.
 */
function sampleGrid(bits, width, height, dimension, transform) {
  const modules = new Uint8Array(dimension * dimension);
  for (let row = 0; row < dimension; row += 1) {
    for (let column = 0; column < dimension; column += 1) {
      const point = apply(transform, column + 0.5, row + 0.5);
      const x = Math.floor(point.x);
      const y = Math.floor(point.y);
      if (x < 0 || y < 0 || x >= width || y >= height) return null;
      modules[row * dimension + column] = bits[y * width + x];
    }
  }
  return modules;
}

/* ------------------------------------------------------------------- the top */

/**
 * Sample and decode a symbol whose three corners are known, at one size.
 *
 * Split out because the size is a guess. It is worked out by dividing the
 * distance between two finder centres by the module size, and both of those
 * are measured from a photograph, so the answer can be one module row out -
 * which puts every sample on the wrong side of an edge and produces nothing.
 * Trying the neighbouring sizes costs a few milliseconds and turns a fair
 * number of failures into reads.
 */
function attempt(bits, width, height, corners, dimension, moduleSize) {
  if (dimension < 21 || dimension > 177 || (dimension - 17) % 4 !== 0) return null;

  const { topLeft, topRight, bottomLeft } = corners;
  const far = dimension - 3.5;

  // Where the bottom-right corner is, if there is nothing there to measure:
  // the fourth corner of the parallelogram the other three make.
  let bottomRight = {
    x: topRight.x - topLeft.x + bottomLeft.x,
    y: topRight.y - topLeft.y + bottomLeft.y,
  };
  let sourceBottomRight = far;

  if (dimension > 21) {
    // The alignment pattern sits three modules in from the corner. Its
    // expected place is that fraction of the way along the diagonal.
    const fraction = 1 - 3 / (dimension - 7);
    const guessX = topLeft.x + fraction * (bottomRight.x - topLeft.x);
    const guessY = topLeft.y + fraction * (bottomRight.y - topLeft.y);

    for (const factor of [4, 8, 16]) {
      const found = findAlignment(bits, width, height, guessX, guessY,
                                  moduleSize, moduleSize * factor);
      if (found) {
        bottomRight = found;
        sourceBottomRight = dimension - 6.5;
        break;
      }
    }
  }

  const grid = [
    { x: 3.5, y: 3.5 },
    { x: far, y: 3.5 },
    { x: sourceBottomRight, y: sourceBottomRight },
    { x: 3.5, y: far },
  ];
  const picture = [topLeft, topRight, bottomRight, bottomLeft];

  const modules = sampleGrid(bits, width, height, dimension,
                             quadToQuad(grid, picture));
  if (!modules) return null;

  try {
    const decoded = decodeMatrix(dimension, modules);
    return { ...decoded, modules, dimension, corners };
  } catch (error) {
    if (error instanceof UnreadableError) return null;
    throw error;
  }
}

/**
 * Find and read one QR symbol in a black-and-white picture.
 *
 * @param {Uint8Array} bits  one byte per pixel; 1 is dark
 * @returns {object|null} the decoded symbol, or null if there was none
 */
export function readQr(bits, width, height, dense = false) {
  for (const three of rankTriples(findFinders(bits, width, height, dense))) {
    const read = fromCorners(bits, width, height, orient(three));
    if (read) return read;
  }
  return null;
}

/** One arrangement of three finder patterns, tried at every plausible size. */
function fromCorners(bits, width, height, corners) {
  const { topLeft, topRight, bottomLeft } = corners;

  // Measured along the edges of the symbol rather than taken from the row
  // scans that found the corners. A row scan crosses a turned symbol at an
  // angle and so reads every run as longer than it is - by 40% at 45 degrees,
  // which is enough to put the size of the whole symbol out by a version, and
  // to make the search box for the alignment pattern wide enough to find
  // something that is not one.
  const measured = [
    moduleSizeBetween(bits, width, height, topLeft, topRight),
    moduleSizeBetween(bits, width, height, topLeft, bottomLeft),
  ].filter((value) => !Number.isNaN(value) && value >= 1);

  const moduleSize = measured.length
    ? measured.reduce((sum, value) => sum + value, 0) / measured.length
    : (topLeft.size + topRight.size + bottomLeft.size) / 3;
  if (!(moduleSize >= 1)) return null;

  const across = Math.round(distance(topLeft, topRight) / moduleSize);
  const down = Math.round(distance(topLeft, bottomLeft) / moduleSize);
  let guess = Math.round((across + down) / 2) + 7;

  // A symbol is always one more than a multiple of four modules across, so the
  // rounding above can be nudged onto a legal size rather than thrown away.
  const remainder = ((guess % 4) + 4) % 4;
  if (remainder === 0) guess += 1;
  else if (remainder === 2) guess -= 1;
  else if (remainder === 3) guess += 2;

  for (const dimension of [guess, guess - 4, guess + 4, guess - 8, guess + 8]) {
    const read = attempt(bits, width, height, corners, dimension, moduleSize);
    if (read) return read;
  }
  return null;
}

/** Every symbol size, for the caller that wants to say what it was looking for. */
export const SIZES = Array.from({ length: 40 }, (unused, i) => sizeOf(i + 1));
