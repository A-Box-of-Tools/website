/**
 * Where a picture goes on a page, in PDF units.
 *
 * PDF measures in points - 1/72 inch - with the origin at the bottom left of
 * the page and y increasing upwards, which is the opposite of a canvas. Every
 * rectangle in this file is in that space, and the preview flips it once when
 * it draws rather than each of these having to think in two coordinate systems.
 */

import { PT_PER_INCH, PT_PER_MM } from './pdf.js';

/** Named page sizes, in millimetres, portrait. */
export const PAGE_SIZES = {
  a3: [297, 420],
  a4: [210, 297],
  a5: [148, 210],
  letter: [215.9, 279.4],
  legal: [215.9, 355.6],
  tabloid: [279.4, 431.8],
};

/**
 * How stored pixels have to be turned to be seen the right way up.
 *
 * A PDF image is drawn into the unit square, so a rotation is expressed as a
 * matrix mapping that square onto itself: the picture ends up in the same place
 * on the page, turned. Tags 5 to 8 also swap the picture's width and height,
 * which is what swapsAxes below is for.
 *
 * Each matrix is [a b c d e f], the PDF form of
 *
 *     x' = a*x + c*y + e
 *     y' = b*x + d*y + f
 *
 * There is no PDF equivalent of the EXIF tag - readers do not rotate images,
 * they draw what the matrix says - so this is the only place a sideways phone
 * photo gets put right.
 */
const ORIENTATIONS = {
  1: [1, 0, 0, 1, 0, 0],       // as stored
  2: [-1, 0, 0, 1, 1, 0],      // mirrored left to right
  3: [-1, 0, 0, -1, 1, 1],     // turned half way round
  4: [1, 0, 0, -1, 0, 1],      // mirrored top to bottom
  5: [0, -1, -1, 0, 1, 1],     // mirrored, then a quarter turn
  6: [0, -1, 1, 0, 0, 1],      // a quarter turn clockwise
  7: [0, 1, 1, 0, 0, 0],       // mirrored, then a quarter turn the other way
  8: [0, 1, -1, 0, 1, 0],      // a quarter turn anticlockwise
};

/** The turn asked for by the buttons on a tile, clockwise, in degrees. */
const ROTATIONS = {
  0: ORIENTATIONS[1],
  90: ORIENTATIONS[6],
  180: ORIENTATIONS[3],
  270: ORIENTATIONS[8],
};

/**
 * Two of these applied in order, as one matrix.
 *
 * Written for row vectors - a point is [x y 1] on the left - which is the
 * convention PDF itself uses, so the result can be handed straight to `cm`.
 */
function multiply(first, second) {
  const [a1, b1, c1, d1, e1, f1] = first;
  const [a2, b2, c2, d2, e2, f2] = second;
  return [
    a1 * a2 + b1 * c2,
    a1 * b2 + b1 * d2,
    c1 * a2 + d1 * c2,
    c1 * b2 + d1 * d2,
    e1 * a2 + f1 * c2 + e2,
    e1 * b2 + f1 * d2 + f2,
  ];
}

/** True when a quarter turn is involved, so width and height trade places. */
export function swapsAxes(orientation = 1, rotate = 0) {
  const tagTurns = orientation >= 5 && orientation <= 8;
  const ownTurns = rotate === 90 || rotate === 270;
  return tagTurns !== ownTurns;
}

/** The size a picture is seen at, once its tag and its own rotation are applied. */
export function displaySize(width, height, orientation = 1, rotate = 0) {
  return swapsAxes(orientation, rotate)
    ? { width: height, height: width }
    : { width, height };
}

/** The size an item is seen at. */
export function seenSize(item) {
  return displaySize(item.width, item.height, item.orientation, item.rotate);
}

/**
 * The placement matrix for one image: what the tag says, then what the buttons
 * on the tile said, then scaled to the box it is going in and moved to it.
 *
 * Composing all of that here rather than writing three `cm` operators keeps the
 * content stream to one line per image, and one line is easier to read in a
 * text editor when something has gone wrong.
 */
export function placement(rect, orientation = 1, rotate = 0) {
  const turn = multiply(
    ORIENTATIONS[orientation] ?? ORIENTATIONS[1],
    ROTATIONS[rotate] ?? ROTATIONS[0],
  );
  const [a, b, c, d, e, f] = turn;
  return [
    a * rect.width, b * rect.height,
    c * rect.width, d * rect.height,
    e * rect.width + rect.x, f * rect.height + rect.y,
  ];
}

/** Convert a page-size setting into points. */
export function pageSizePt(settings) {
  if (settings.pageSize === 'custom') {
    const unit = settings.customUnit === 'in' ? PT_PER_INCH : PT_PER_MM;
    return [
      Math.max(1, Number(settings.customWidth) || 0) * unit,
      Math.max(1, Number(settings.customHeight) || 0) * unit,
    ];
  }
  const [width, height] = PAGE_SIZES[settings.pageSize] ?? PAGE_SIZES.a4;
  return [width * PT_PER_MM, height * PT_PER_MM];
}

/**
 * Work out one page: how big it is, and where the picture sits on it.
 *
 * @param {{width: number, height: number, orientation: number, rotate: number}} image
 * @param {object} settings
 * @returns {{width: number, height: number, rect: object, clip: object|null}}
 */
export function layoutPage(image, settings) {
  const seen = displaySize(image.width, image.height, image.orientation, image.rotate);
  const margin = Math.max(0, Number(settings.margin) || 0) * PT_PER_MM;

  if (settings.pageSize === 'fit') {
    // The page becomes the picture: its size at the chosen resolution, plus the
    // margin on all four sides. Nothing is cropped and nothing is letterboxed,
    // because there is no page the picture has to be made to fit.
    const dpi = Math.min(1200, Math.max(18, Number(settings.dpi) || 150));
    const width = (seen.width * PT_PER_INCH) / dpi;
    const height = (seen.height * PT_PER_INCH) / dpi;
    return {
      width: width + margin * 2,
      height: height + margin * 2,
      rect: { x: margin, y: margin, width, height },
      clip: null,
    };
  }

  let [width, height] = pageSizePt(settings);
  const landscape = settings.orientation === 'landscape'
    || (settings.orientation === 'auto' && seen.width > seen.height);
  if (landscape !== (width > height)) [width, height] = [height, width];

  const box = {
    x: margin,
    y: margin,
    width: Math.max(1, width - margin * 2),
    height: Math.max(1, height - margin * 2),
  };

  return {
    width,
    height,
    rect: fitRect(seen.width, seen.height, box, settings.fit),
    // Only "fill the page" can put ink outside the box it was given, so only
    // that one needs the page clipped to the margins.
    clip: settings.fit === 'cover' ? box : null,
  };
}

/** Fit a `sw` by `sh` picture into `box` the way `mode` asks for. */
export function fitRect(sw, sh, box, mode) {
  if (mode === 'stretch') return { ...box };

  const scale = mode === 'cover'
    ? Math.max(box.width / sw, box.height / sh)
    : Math.min(box.width / sw, box.height / sh);

  const width = sw * scale;
  const height = sh * scale;
  return {
    x: box.x + (box.width - width) / 2,
    y: box.y + (box.height - height) / 2,
    width,
    height,
  };
}
