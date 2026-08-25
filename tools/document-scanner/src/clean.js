/**
 * Making the straightened page look like a scan rather than like a photograph.
 *
 * THE PROBLEM IS NOT CONTRAST, IT IS THAT THE LIGHT IS UNEVEN. A page held under
 * a ceiling light and photographed by somebody standing over it has a bright
 * band where the light is, a dimmer corner furthest from it, and very often the
 * photographer's own shadow across one side. Every one of those is a gentle
 * change in brightness across tens or hundreds of pixels. Raising the contrast
 * of that picture makes the bright part white, the dark part black, and the
 * writing in the dark part unreadable - which is why "auto contrast" and
 * "levels" both make a photographed page worse rather than better, and why
 * every real scanner app does something else.
 *
 * WHAT IT DOES INSTEAD is estimate the paper. If the brightness of the paper
 * itself were known at every point, dividing by it would leave exactly the ink,
 * evenly lit, everywhere - because the light that fell on a letter is the same
 * light that fell on the paper a millimetre away from it. It is not known, but
 * it is easy to estimate, because paper is the bright majority of any small
 * patch of a page: take a grid of tiles, and in each tile take a high percentile
 * of the brightness. Text, being a minority and being dark, does not reach the
 * percentile and does not move the estimate. That is the whole method, and the
 * two refinements after it - filling in the tiles with no paper in them, and a
 * blur, both over the coarse grid - exist for the one case it fails on: a tile
 * lying entirely inside a photograph or a solid black heading, where the honest
 * local answer is "there is no paper here" and the right answer is "as bright as
 * the paper beside it".
 *
 * THE BLACK AND WHITE MODE is Sauvola's local threshold rather than a single
 * global one, for a related reason and a different failure: a global threshold
 * is one number for the whole page, and a page with a gradient across it has no
 * single number that keeps the writing in the dark half and the paper in the
 * light half. Sauvola compares each pixel to the mean and the standard deviation
 * of its own neighbourhood, so a faint grey letter surrounded by slightly
 * fainter grey paper survives, and an empty patch of paper is not turned into
 * speckle by whatever noise it has - which is what a plain local mean does.
 *
 * Everything here is a pure function on a pixel array: no canvas, no DOM, no
 * network, and nothing that needs a browser to run or to test.
 */

/** What can be done to a page. Any other value is treated as 'photo'. */
export const MODES = ['photo', 'colour', 'grey', 'mono'];

/**
 * How many tiles the shorter side of the page is divided into when the paper is
 * estimated.
 *
 * Sixteen is a compromise with a failure at each end. Coarser, and a shadow with
 * a hard edge - the edge of the photographer, usually - is averaged across the
 * boundary and leaves a soft grey band where it was. Finer, and a tile becomes
 * small enough to fit inside a heading or a photograph on the page, where there
 * is no paper for the percentile to find and the estimate stops being an
 * estimate of paper.
 */
const TILES = 16;

/**
 * Where in a tile's brightness the paper is taken to be.
 *
 * Not the maximum, which is a single pixel and therefore whatever the noise did;
 * not the mean, which text pulls down by however much text there is. The eighth
 * decile is above any plausible amount of ink and below the top of the noise.
 */
const PAPER_PERCENTILE = 0.8;

/**
 * How much darker than the tiles around it a tile has to be before it is treated
 * as having no paper in it at all.
 */
const HOLE = 0.6;

/** Rec. 601 luma, the same weights the detector uses. */
export function toLuma({ data, width, height }) {
  const out = new Float32Array(width * height);
  for (let i = 0, p = 0; p < out.length; i += 4, p += 1) {
    out[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  return out;
}

/**
 * The brightness of the paper, as a coarse grid.
 *
 * Returned coarse rather than expanded to every pixel, because the expansion is
 * a bilinear read that costs nothing where it is used and a whole extra
 * full-size buffer if it is done in advance. On a twelve megapixel page that is
 * forty-eight megabytes not allocated.
 */
export function paperGrid(luma, width, height) {
  const cell = Math.max(8, Math.round(Math.min(width, height) / TILES));
  const cols = Math.max(1, Math.ceil(width / cell));
  const rows = Math.max(1, Math.ceil(height / cell));
  const grid = new Float32Array(cols * rows);
  const bins = new Uint32Array(256);

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      bins.fill(0);
      let counted = 0;

      const y1 = Math.min(height, (row + 1) * cell);
      const x1 = Math.min(width, (col + 1) * cell);
      for (let y = row * cell; y < y1; y += 1) {
        const at = y * width;
        for (let x = col * cell; x < x1; x += 1) {
          bins[Math.max(0, Math.min(255, Math.round(luma[at + x])))] += 1;
          counted += 1;
        }
      }

      grid[row * cols + col] = counted ? percentile(bins, counted, PAPER_PERCENTILE) : 255;
    }
  }

  return { grid: smooth(fillHoles(grid, cols, rows), cols, rows), cols, rows, cell };
}

function percentile(bins, counted, fraction) {
  let seen = 0;
  const want = counted * fraction;
  for (let value = 0; value < 256; value += 1) {
    seen += bins[value];
    if (seen >= want) return value;
  }
  return 255;
}

/**
 * Fill in the tiles that have no paper in them.
 *
 * A tile lying entirely inside a photograph, a filled box or a black heading has
 * no paper for the percentile to find, so its estimate is the darkness of
 * whatever is there. Dividing by that would lift the whole patch to white and
 * destroy it, so a tile whose estimate is far below its neighbours' takes theirs
 * instead.
 *
 * "Far below" is doing real work here, and a plain maximum over the neighbours -
 * which is the obvious way to write this - is measurably worse. Light falls off
 * across a page, and a shadow can have a hard edge; a blanket maximum treats
 * every genuinely darker tile as a hole and lifts it, and the finished page then
 * has a dark band exactly where the shadow was, which is the artefact this whole
 * file exists to remove. Comparing against the median of the neighbours rather
 * than their maximum, and only acting when the gap is large, tells the two apart:
 * a tile at the edge of a shadow is darker than some of its neighbours and not
 * than most of them, while a tile inside a photograph is darker than all of them.
 */
function fillHoles(grid, cols, rows) {
  const out = new Float32Array(grid);
  const neighbours = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      neighbours.length = 0;
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          if (!dx && !dy) continue;
          const y = row + dy;
          const x = col + dx;
          if (y < 0 || x < 0 || y >= rows || x >= cols) continue;
          neighbours.push(grid[y * cols + x]);
        }
      }
      if (!neighbours.length) continue;

      neighbours.sort((a, b) => a - b);
      const middle = neighbours[Math.floor(neighbours.length / 2)];
      const own = grid[row * cols + col];
      if (own < middle * HOLE) out[row * cols + col] = middle;
    }
  }

  return out;
}

/** A 3x3 average over the grid, so the estimate has no tile edges in it. */
function smooth(grid, cols, rows) {
  const out = new Float32Array(grid.length);
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      let total = 0;
      let taken = 0;
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          const y = Math.min(rows - 1, Math.max(0, row + dy));
          const x = Math.min(cols - 1, Math.max(0, col + dx));
          total += grid[y * cols + x];
          taken += 1;
        }
      }
      out[row * cols + col] = total / taken;
    }
  }
  return out;
}

/**
 * Read the paper estimate at one pixel, between the four tiles around it.
 *
 * The tile's value belongs at the middle of the tile, which is the half a cell
 * subtracted here. Without it the estimate is a step function and every tile
 * boundary shows up in the finished page as a faint line.
 */
export function samplePaper({ grid, cols, rows, cell }, x, y) {
  const fx = Math.min(cols - 1, Math.max(0, (x - cell / 2) / cell));
  const fy = Math.min(rows - 1, Math.max(0, (y - cell / 2) / cell));
  const x0 = Math.floor(fx);
  const y0 = Math.floor(fy);
  const x1 = Math.min(cols - 1, x0 + 1);
  const y1 = Math.min(rows - 1, y0 + 1);
  const ax = fx - x0;
  const ay = fy - y0;

  const top = grid[y0 * cols + x0] * (1 - ax) + grid[y0 * cols + x1] * ax;
  const bottom = grid[y1 * cols + x0] * (1 - ax) + grid[y1 * cols + x1] * ax;
  return Math.max(1, top * (1 - ay) + bottom * ay);
}

/**
 * The black and white points a given strength asks for.
 *
 * One control, because two would be two controls nobody adjusts. Turning it up
 * raises the black point, which is what "make the writing darker and the paper
 * cleaner" means once the light has already been evened out: everything below
 * the black point becomes ink and everything above the white point becomes
 * paper. It is deliberately capable of going too far - a page with a photograph
 * on it will lose the photograph at 100 - because the alternative is a control
 * that does nothing on the pages that need it most.
 */
export function levels(strength, mode = 'grey') {
  const amount = Math.min(100, Math.max(0, Number(strength) || 0));
  // Colour keeps half the black point, and that is not a fudge - it is the
  // difference between the two modes doing what they say. A signature in blue
  // ballpoint is about a quarter as bright as the paper around it, which at the
  // full black point is below it: the pen comes out solid black, on the one
  // setting whose whole purpose is that the pen stays blue. Halving it keeps
  // printed text black - text really is near zero once the light is divided out
  // - and leaves the ink an ink colour.
  const floor = mode === 'colour' ? 0.5 : 1;
  return { black: amount * 1.6 * floor, white: 255 - amount * 0.25 };
}

/** The window Sauvola looks at, and how hard it leans on what it sees. */
function sauvolaSettings(width, height, strength) {
  const amount = Math.min(100, Math.max(0, Number(strength) || 0));
  return {
    // Wide enough to hold a letter and the paper around it at any sensible
    // resolution, and odd so that it is centred on the pixel it is deciding.
    window: oddAtLeast(Math.round(Math.min(width, height) / 24), 15),
    k: 0.08 + amount * 0.0034,
  };
}

const oddAtLeast = (value, floor) => {
  const size = Math.max(floor, value);
  return size % 2 ? size : size + 1;
};

/**
 * Clean up one straightened page.
 *
 * @param {{data: Uint8ClampedArray, width: number, height: number}} page
 * @param {{mode?: string, strength?: number}} options
 * @returns {{data: Uint8ClampedArray, width: number, height: number,
 *   mono: boolean, grey: boolean}}
 */
export function cleanPage(page, { mode = 'colour', strength = 50 } = {}) {
  const { width, height } = page;
  if (mode === 'photo') {
    return { data: page.data, width, height, mono: false, grey: false };
  }

  const luma = toLuma(page);
  const paper = paperGrid(luma, width, height);
  const flat = flatten(luma, paper, width, height);

  if (mode === 'mono') {
    const settings = sauvolaSettings(width, height, strength);
    const ink = sauvola(flat, width, height, settings);
    const data = new Uint8ClampedArray(width * height * 4);
    for (let p = 0, i = 0; p < ink.length; p += 1, i += 4) {
      const value = ink[p] ? 0 : 255;
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
      data[i + 3] = 255;
    }
    return { data, width, height, mono: true, grey: true };
  }

  const { black, white } = levels(strength, mode);
  const data = new Uint8ClampedArray(width * height * 4);
  const span = Math.max(1, white - black);

  for (let p = 0, i = 0; p < flat.length; p += 1, i += 4) {
    const value = ((flat[p] - black) / span) * 255;

    if (mode === 'grey') {
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
    } else {
      // Colour is kept by scaling the three channels together rather than by
      // putting each of them through the curve on its own. Per-channel curves
      // shift the hue of everything that is not already grey, which on a page is
      // every stamp, every signature in blue ink and every highlighted line -
      // the parts somebody kept the colour for.
      const before = Math.max(1, luma[p]);
      const scale = value / before;
      data[i] = page.data[i] * scale;
      data[i + 1] = page.data[i + 1] * scale;
      data[i + 2] = page.data[i + 2] * scale;
    }
    data[i + 3] = 255;
  }

  return { data, width, height, mono: false, grey: mode === 'grey' };
}

/**
 * Divide the picture by the paper, so that what is left is the ink.
 *
 * The result is on the same 0 to 255 scale, where 255 now means "as bright as
 * the paper here" rather than "as bright as anything in the picture".
 */
function flatten(luma, paper, width, height) {
  const out = new Float32Array(luma.length);
  for (let y = 0, p = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1, p += 1) {
      out[p] = Math.min(255, (luma[p] / samplePaper(paper, x, y)) * 255);
    }
  }
  return out;
}

/**
 * Sauvola's local threshold.
 *
 *     T = m * (1 + k * (s / R - 1))
 *
 * where m and s are the mean and the standard deviation of the window around
 * the pixel and R is the largest standard deviation there could be. Read it as:
 * where the neighbourhood is varied - a letter and the paper around it - the
 * threshold sits near the mean and the letter is kept; where it is flat - blank
 * paper, with nothing in it but noise - the threshold drops well below the mean
 * and the noise is not promoted to text. That second half is the difference
 * between this and a plain local mean, and it is the difference between a clean
 * page and a page covered in speckle.
 *
 * Both sums come from integral images, so the window costs four reads whatever
 * size it is, and the whole pass is linear in the number of pixels rather than
 * in the number of pixels times the area of the window.
 *
 * @returns {Uint8Array} one byte per pixel: 1 where there is ink.
 */
export function sauvola(luma, width, height, { window = 25, k = 0.25, range = 128 } = {}) {
  const sums = new Float64Array((width + 1) * (height + 1));
  const squares = new Float64Array((width + 1) * (height + 1));

  for (let y = 0; y < height; y += 1) {
    let rowSum = 0;
    let rowSquares = 0;
    for (let x = 0; x < width; x += 1) {
      const value = luma[y * width + x];
      rowSum += value;
      rowSquares += value * value;
      const at = (y + 1) * (width + 1) + (x + 1);
      sums[at] = sums[at - (width + 1)] + rowSum;
      squares[at] = squares[at - (width + 1)] + rowSquares;
    }
  }

  const half = Math.floor(window / 2);
  const ink = new Uint8Array(width * height);

  for (let y = 0; y < height; y += 1) {
    const top = Math.max(0, y - half);
    const bottom = Math.min(height - 1, y + half);
    for (let x = 0; x < width; x += 1) {
      const left = Math.max(0, x - half);
      const right = Math.min(width - 1, x + half);
      const count = (right - left + 1) * (bottom - top + 1);

      const total = box(sums, width, left, top, right, bottom);
      const totalSquares = box(squares, width, left, top, right, bottom);
      const mean = total / count;
      // Clamped at zero because the difference of two large sums can land a
      // hair below it, and Math.sqrt of that is NaN, which would then be
      // compared against and quietly turn a whole page white.
      const variance = Math.max(0, totalSquares / count - mean * mean);
      const threshold = mean * (1 + k * (Math.sqrt(variance) / range - 1));

      ink[y * width + x] = luma[y * width + x] < threshold ? 1 : 0;
    }
  }

  return ink;
}

/** The sum over a rectangle, from an integral image, in four reads. */
function box(table, width, left, top, right, bottom) {
  const stride = width + 1;
  return table[(bottom + 1) * stride + (right + 1)]
    - table[top * stride + (right + 1)]
    - table[(bottom + 1) * stride + left]
    + table[top * stride + left];
}
