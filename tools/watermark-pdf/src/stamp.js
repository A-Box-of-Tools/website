/**
 * Where the stamp goes on a page, and the drawing instructions that put it
 * there.
 *
 * Everything here is arithmetic on a page's box, so that it can be tested
 * without a browser and so that the preview on the page and the file that is
 * written agree by construction: the preview draws these same placements on
 * a canvas the shape of the first page, and the writer turns them into `cm`
 * operators. There is no renderer on this site, so a preview that computed
 * its own positions would be a promise the file might not keep.
 *
 * THE STAMP IS A PICTURE, NOT TEXT
 *
 * The stamp arrives as an image the browser drew - see render.js - and is
 * placed as an image XObject, which draws into the unit square. So a
 * placement is a matrix that takes the unit square to a rectangle of the
 * right size, turned by the right angle, centred where it should be. The
 * arithmetic is the same for every placement; only the centre moves.
 *
 * ROTATED PAGES
 *
 * A page may carry /Rotate, in which case what the reader shows is the page
 * turned clockwise by that much, and "diagonal from bottom-left to top-right"
 * means diagonal on the screen, not in the page's own coordinates. Rather than
 * work the angle and the corners out four times over, every placement is
 * computed in VISIBLE coordinates - the page as shown, origin bottom-left -
 * and one extra matrix in front maps visible space back to the page's own.
 * `visibleToUser` is that matrix, and it is the only place /Rotate is read.
 */

/** How wide the stamp is, as a fraction of the visible page's shorter side
 *  when it lies flat, or of the diagonal when it lies along it. */
export const SIZES = { small: 0.45, medium: 0.65, large: 0.85 };

/** The gap between repeated stamps, as a fraction of the stamp's width. */
const TILE_GAP = 0.6;

/**
 * @typedef {object} Placement
 * @property {number} cx  centre, visible coordinates, points
 * @property {number} cy
 * @property {number} width  points
 * @property {number} height
 * @property {number} angle  degrees, anticlockwise, on the screen
 */

/**
 * Every place the stamp goes on one page.
 *
 * @param {{width: number, height: number}} visible  the page as shown, points
 * @param {number} aspect  the stamp image's width over its height
 * @param {{size: 'small'|'medium'|'large', diagonal: boolean, tiled: boolean}} settings
 * @returns {Placement[]}
 */
export function placements(visible, aspect, { size, diagonal, tiled }) {
  const angle = diagonal ? diagonalAngle(visible) : 0;
  const fraction = SIZES[size] ?? SIZES.medium;

  // Along the diagonal the stamp can be as long as the diagonal; flat, only
  // as long as the page is wide. Either way it is a fraction of that.
  const reach = diagonal
    ? Math.hypot(visible.width, visible.height)
    : Math.min(visible.width, visible.height * aspect);
  let width = reach * fraction;
  let height = width / aspect;

  // A stamp taller than the page is a stamp nobody asked for.
  const tallest = visible.height * 0.9;
  if (height > tallest) {
    height = tallest;
    width = height * aspect;
  }

  if (!tiled) {
    return [{ cx: visible.width / 2, cy: visible.height / 2, width, height, angle }];
  }

  // Repeated: a grid of centres over the visible page, stepped by the stamp's
  // own footprint plus a gap, every other row shifted by half a step so the
  // stamps do not line up into columns a reader could crop between. The grid
  // is laid out unrotated and each stamp turned in place, which is what a
  // repeated watermark looks like in every reader that offers one.
  const tile = tiled ? Math.min(width, visible.width * 0.5) : width;
  const tileHeight = tile / aspect;
  const stepX = tile * (1 + TILE_GAP);
  const stepY = Math.max(tileHeight * 3, tile * 0.75);
  const out = [];
  let row = 0;
  for (let cy = stepY / 2; cy < visible.height; cy += stepY, row += 1) {
    const shift = row % 2 ? stepX / 2 : 0;
    for (let cx = shift + stepX / 2 - stepX; cx < visible.width + stepX / 2; cx += stepX) {
      if (cx < -tile / 2 || cx > visible.width + tile / 2) continue;
      out.push({ cx, cy, width: tile, height: tileHeight, angle });
    }
  }
  return out;
}

/** The angle of the page's own diagonal, bottom-left to top-right. On a
 *  portrait page that is steeper than 45 degrees, and matching it is what
 *  makes the stamp cross the whole page rather than the middle of it. */
export function diagonalAngle(visible) {
  return (Math.atan2(visible.height, visible.width) * 180) / Math.PI;
}

/**
 * The matrix that takes the unit square to one placement: scaled to its
 * size, turned by its angle, centred on its centre. Six numbers, in the
 * order `cm` wants them.
 *
 * @param {Placement} at
 * @returns {number[]}
 */
export function placementMatrix({ cx, cy, width, height, angle }) {
  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  // Scale by (width, height), then rotate: the unit square's x axis becomes
  // (width cos, width sin) and its y axis (-height sin, height cos). The
  // translation puts the square's centre - (0.5, 0.5) before the transform -
  // at (cx, cy).
  return [
    width * cos, width * sin,
    -height * sin, height * cos,
    cx - (width * cos - height * sin) / 2,
    cy - (width * sin + height * cos) / 2,
  ];
}

/**
 * The matrix from visible coordinates to the page's own, for a page shown
 * turned clockwise by `rotate` degrees whose box is [x0 y0 x1 y1].
 *
 * Worked out from where the corners go rather than from a formula: turning a
 * page 90 degrees clockwise sends its bottom-left corner to the top-left, so
 * a visible point (vx, vy) came from user (x1 - vy, y0 + vx) - and so on
 * round the four cases. The reader shows the box, so the visible page is the
 * box's size, turned.
 *
 * @param {number} rotate  0, 90, 180 or 270
 * @param {number[]} box  [x0, y0, x1, y1]
 * @returns {number[]}
 */
export function visibleToUser(rotate, box) {
  const [x0, y0, x1, y1] = box;
  switch (rotate) {
    case 90: return [0, 1, -1, 0, x1, y0];
    case 180: return [-1, 0, 0, -1, x1, y1];
    case 270: return [0, -1, 1, 0, x0, y1];
    default: return [1, 0, 0, 1, x0, y0];
  }
}

/** The page as it is shown: the box's size, swapped when the page is turned
 *  on its side. */
export function visibleSize(rotate, box) {
  const width = box[2] - box[0];
  const height = box[3] - box[1];
  return rotate === 90 || rotate === 270
    ? { width: height, height: width }
    : { width, height };
}

/**
 * The content stream that draws the stamp on one page.
 *
 * Wrapped in its own q ... Q, and every placement in one of its own again,
 * so nothing here leaks into whatever the page draws after it - which, since
 * this stream is appended last, is nothing, but a document that has been
 * through several tools has streams in orders nobody planned.
 *
 * @param {Placement[]} spots
 * @param {number[]} toUser  from visibleToUser
 * @param {{image: string, state: string}} names  the resource names
 * @returns {string}
 */
export function contentFor(spots, toUser, names) {
  const lines = ['q', `/${names.state} gs`, `${matrix(toUser)} cm`];
  for (const spot of spots) {
    lines.push('q', `${matrix(placementMatrix(spot))} cm`, `/${names.image} Do`, 'Q');
  }
  lines.push('Q');
  return `${lines.join('\n')}\n`;
}

/** Six numbers as a PDF writes them: no exponents, no trailing zeros. */
function matrix(values) {
  return values.map(formatNumber).join(' ');
}

export function formatNumber(value) {
  if (!Number.isFinite(value)) return '0';
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(4).replace(/\.?0+$/, '') || '0';
}
