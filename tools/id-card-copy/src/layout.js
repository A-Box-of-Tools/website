/**
 * Where the two sides of the card go: the sheet, and a rectangle on it for each.
 *
 * Everything here is in millimetres, measured from the top left of the sheet
 * with y increasing downwards, which is the way a canvas counts. The PDF writer
 * turns it into points from the bottom left at the very end, and the preview
 * and the image file multiply it by a resolution. One plan for all three is the
 * point of the file: a preview laid out by CSS would be easy to write and could
 * quietly disagree with the paper by the width of a rounding error, which on a
 * copy that is meant to come out the size of the card is the whole failure.
 *
 * No DOM, no canvas and no sentence a visitor reads. Where something has to be
 * said it is a key, and main.js looks the words up in the markup.
 */

/**
 * The card sizes of ISO/IEC 7810, landscape, in millimetres.
 *
 * ID-1 is the one nearly everybody means: bank cards, driving licences, most
 * national identity cards and residence permits, health insurance cards. ID-2
 * is the older, larger identity card some countries still issue, and ID-3 is a
 * passport's data page, which has a front and no back but is asked for as a
 * copy just as often. The corner radius is the one the standard gives the ID-1
 * card; it is used for all three, because a copy only needs the corner to look
 * like a card's rather than like a photograph's.
 */
export const CARDS = {
  id1: { width: 85.6, height: 53.98 },
  id2: { width: 105, height: 74 },
  id3: { width: 125, height: 88 },
};

export const CORNER_RADIUS = 3.18;

/** Sheets, portrait, in millimetres. `cards` is no sheet at all: see below. */
export const PAPERS = {
  a4: { width: 210, height: 297 },
  letter: { width: 215.9, height: 279.4 },
};

/** The space between the two sides, and the least either keeps from an edge. */
export const GAP = 12;
export const MIN_MARGIN = 8;

/** How far down the sheet "the top" starts, which is roughly where a copier puts a card. */
export const TOP_MARGIN = 20;

/** The white border round the cards when there is no sheet. */
export const CARD_BORDER = 4;

export const MM_PER_INCH = 25.4;

/**
 * The size of one side, the way it is turned.
 *
 * @param {keyof CARDS} card
 * @param {boolean} portrait  the card is upright: some licences are printed that
 *   way, and a card photographed sideways is upright until somebody turns it
 */
export function cardSize(card, portrait = false) {
  const { width, height } = CARDS[card] ?? CARDS.id1;
  return portrait ? { width: height, height: width } : { width, height };
}

/**
 * The plan for one sheet.
 *
 * @param {{width: number, height: number}[]} cards  one or two, front first
 * @param {object} options
 * @param {'a4'|'letter'|'cards'} options.paper
 * @param {'stack'|'side'} options.arrange  one above the other, or side by side
 * @param {'middle'|'top'} options.place  where on a sheet the pair sits
 * @returns {{width: number, height: number, landscape: boolean,
 *   rects: {x: number, y: number, width: number, height: number}[]}}
 */
export function layoutSheet(cards, { paper = 'a4', arrange = 'stack', place = 'middle' } = {}) {
  if (!cards.length) return { width: 0, height: 0, landscape: false, rects: [] };

  const block = arrangeBlock(cards, arrange);

  if (paper === 'cards') {
    return {
      width: block.width + CARD_BORDER * 2,
      height: block.height + CARD_BORDER * 2,
      landscape: block.width > block.height,
      rects: block.rects.map((rect) => shift(rect, CARD_BORDER, CARD_BORDER)),
    };
  }

  const sheet = PAPERS[paper] ?? PAPERS.a4;
  // Turned only when the pair does not fit upright, which on A4 or Letter means
  // the two larger card sizes side by side. Everything else keeps the sheet the
  // way a printer feeds it.
  const fits = (width, height) => block.width + MIN_MARGIN * 2 <= width
    && block.height + MIN_MARGIN * 2 <= height;
  const landscape = !fits(sheet.width, sheet.height) && fits(sheet.height, sheet.width);
  const width = landscape ? sheet.height : sheet.width;
  const height = landscape ? sheet.width : sheet.height;

  const x = (width - block.width) / 2;
  const middle = (height - block.height) / 2;
  const y = place === 'top' ? Math.min(middle, TOP_MARGIN) : middle;

  return { width, height, landscape, rects: block.rects.map((rect) => shift(rect, x, y)) };
}

/**
 * The cards placed against each other, before the block is put on a sheet.
 *
 * Each side is centred across the other's width (or height), so a front and a
 * back of different shapes - an upright licence with a landscape back is a
 * thing that exists - still line up down the middle.
 */
function arrangeBlock(cards, arrange) {
  if (arrange === 'side') {
    const height = Math.max(...cards.map((card) => card.height));
    let x = 0;
    const rects = cards.map((card) => {
      const rect = { x, y: (height - card.height) / 2, width: card.width, height: card.height };
      x += card.width + GAP;
      return rect;
    });
    return { width: x - GAP, height, rects };
  }

  const width = Math.max(...cards.map((card) => card.width));
  let y = 0;
  const rects = cards.map((card) => {
    const rect = { x: (width - card.width) / 2, y, width: card.width, height: card.height };
    y += card.height + GAP;
    return rect;
  });
  return { width, height: y - GAP, rects };
}

const shift = (rect, x, y) => ({ ...rect, x: rect.x + x, y: rect.y + y });

/** Millimetres to pixels at a resolution, rounded to whole pixels. */
export const toPixels = (mm, dpi) => Math.max(1, Math.round((mm / MM_PER_INCH) * dpi));

/**
 * The resolution an image of the whole sheet can actually be made at.
 *
 * A sheet of A4 at 600 DPI is thirty-five million pixels, and Safari on a
 * phone will not allocate a canvas of more than about sixteen and a half: the
 * call does not fail, it hands back a canvas that draws nothing. So the image
 * is made at the highest resolution under the ceiling, and the caller says so
 * when that was less than was asked for. The PDF never needs this, because it
 * never draws the sheet - only the two cards, which are small.
 */
export const MAX_CANVAS_PIXELS = 16_000_000;

export function sheetDpi(sheet, dpi, ceiling = MAX_CANVAS_PIXELS) {
  const inches = (sheet.width / MM_PER_INCH) * (sheet.height / MM_PER_INCH);
  if (!(inches > 0)) return dpi;
  const most = Math.floor(Math.sqrt(ceiling / inches));
  return Math.min(dpi, most);
}

/**
 * How much detail the photograph holds for one side, as dots per inch at the
 * card's true size.
 *
 * The longer of each pair of opposite edges is taken, because a card shot at
 * an angle has a near edge longer than its far one, and the near edge is the
 * detail actually there to be kept. Returns a key for the sentence that says
 * whether that is enough, beside the number.
 *
 * @param {{x: number, y: number}[]} quad  in the photograph's own pixels
 * @param {{width: number, height: number}} size  the card, in millimetres
 */
export function captureDpi(quad, size) {
  const length = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);
  const across = Math.max(length(quad[0], quad[1]), length(quad[3], quad[2]));
  const down = Math.max(length(quad[0], quad[3]), length(quad[1], quad[2]));
  const dpi = Math.round(Math.min(
    across / (size.width / MM_PER_INCH),
    down / (size.height / MM_PER_INCH),
  ));
  let key = 'quality.good';
  if (dpi < 150) key = 'quality.low';
  else if (dpi < 250) key = 'quality.fair';
  return { dpi, key };
}

/**
 * Whether four corners are the shape of a card lying sideways.
 *
 * Only the question "is the long side running down the photograph" is asked,
 * so the edge lengths are enough: a card is more than one and a half times as
 * long as it is wide, and no amount of perspective a person would photograph
 * a card at turns that into the other answer.
 */
export function looksUpright(quad) {
  const length = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);
  const across = length(quad[0], quad[1]) + length(quad[3], quad[2]);
  const down = length(quad[0], quad[3]) + length(quad[1], quad[2]);
  return down > across;
}
