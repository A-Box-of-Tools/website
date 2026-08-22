/**
 * The print sheet: as many copies of one photograph as a 4 x 6 will hold.
 *
 * A passport photo costs four pounds in a booth and about eleven pence at a
 * print shop, and the difference is entirely that the booth sells you a sheet
 * and the print shop sells you a 4 x 6 print. Every photo counter on earth
 * prints a 6 x 4 for pennies, so the useful output of this tool is not one
 * 35 x 45 mm image, it is a 4 x 6 with eight of them on it and lines saying
 * where to cut.
 *
 * Three rules the layout follows, all of them learned by cutting one out badly:
 *
 *   - NOTHING IS SCALED TO FIT. Every cell is exactly the specification's size
 *     in millimetres, converted at the sheet's own DPI. A layout that shrank a
 *     photograph by two per cent to fit one more copy on would produce eight
 *     photographs that are all the wrong size, which is the one failure this
 *     entire tool exists to prevent.
 *   - THE MARKS SIT IN THE GAPS, NEVER ON THE PICTURE. A crop mark drawn across
 *     the image is ink you then have to cut off, and cutting exactly along a
 *     line you can see is harder than cutting between two ticks you can line a
 *     blade up on.
 *   - THE SHEET IS TRIED BOTH WAYS ROUND. A 35 x 45 photograph fits eight to a
 *     landscape 6 x 4 and six to a portrait one. Which way up the paper goes is
 *     the printer's business, so both are laid out and the one that holds more
 *     copies wins.
 *
 * Everything here is arithmetic on rectangles. The drawing is one loop of
 * drawImage calls in encode.js; this file decides where they land.
 */

import { mmToPx } from './geometry.js';

/**
 * The papers worth offering, in millimetres.
 *
 * 4 x 6 first because it is the one every photo counter prints and the one the
 * whole idea rests on. A4 and Letter are here because a home printer has no
 * 4 x 6 in it and a sheet of A4 holds thirty passport photos, which is
 * more than anybody needs and cheaper than any of the alternatives.
 */
export const PAPERS = [
  { id: '4x6', label: '4 x 6 inch print (10 x 15 cm)', widthMm: 152.4, heightMm: 101.6 },
  { id: '5x7', label: '5 x 7 inch print (13 x 18 cm)', widthMm: 177.8, heightMm: 127 },
  { id: 'a4', label: 'A4 sheet (210 x 297 mm)', widthMm: 297, heightMm: 210 },
  { id: 'letter', label: 'US Letter (8.5 x 11 inch)', widthMm: 279.4, heightMm: 215.9 },
];

export const paperById = (id) => PAPERS.find((paper) => paper.id === id) ?? PAPERS[0];

/**
 * The white border every photo lab loses to its own cutter, near enough, and
 * the gap between two photographs.
 *
 * Both are as small as they can honestly be, because a millimetre either way
 * decides whether eight photographs fit on a 6 x 4 or six do. At 3 and 2, four
 * 35 mm photographs and their three gaps come to 146 mm on a 152 mm sheet,
 * which is the layout every passport-photo counter prints.
 */
const DEFAULT_MARGIN_MM = 3;
const DEFAULT_GAP_MM = 2;

/**
 * How many cells of a given size fit across a given span.
 *
 * The gap only exists between cells, so n cells need n-1 gaps: forgetting that
 * is how a layout claims one more column than the paper has room for and pushes
 * the last one off the edge.
 */
function fitCount(spanMm, cellMm, gapMm) {
  if (cellMm <= 0) return 0;
  return Math.max(0, Math.floor((spanMm + gapMm) / (cellMm + gapMm)));
}

/**
 * Lay out one sheet.
 *
 * @param {object} options
 * @param {{widthMm: number, heightMm: number}} options.photo   one copy, in mm
 * @param {{widthMm: number, heightMm: number}} options.paper   the sheet
 * @param {number} options.dpi
 * @param {number} [options.marginMm]
 * @param {number} [options.gapMm]
 * @param {boolean} [options.rotate]  lay the paper the other way round
 * @returns {{
 *   canvas: {width: number, height: number},
 *   paper: {widthMm: number, heightMm: number},
 *   cells: {x: number, y: number, width: number, height: number}[],
 *   marks: {x1: number, y1: number, x2: number, y2: number}[],
 *   columns: number, rows: number, count: number, dpi: number,
 * }}
 */
export function planSheet({ photo, paper, dpi, marginMm = DEFAULT_MARGIN_MM, gapMm = DEFAULT_GAP_MM, rotate = false }) {
  const sheet = rotate
    ? { widthMm: paper.heightMm, heightMm: paper.widthMm }
    : { widthMm: paper.widthMm, heightMm: paper.heightMm };

  const usableW = sheet.widthMm - marginMm * 2;
  const usableH = sheet.heightMm - marginMm * 2;

  const columns = fitCount(usableW, photo.widthMm, gapMm);
  const rows = fitCount(usableH, photo.heightMm, gapMm);

  const toPx = (mm) => Math.round(mmToPx(mm, dpi));
  const canvas = { width: toPx(sheet.widthMm), height: toPx(sheet.heightMm) };

  const cells = [];
  const marks = [];

  if (columns > 0 && rows > 0) {
    // The block of photographs is centred on the paper rather than pushed into
    // the top-left corner. Photo labs trim a millimetre or two off whichever
    // edge their cutter feels like, and a centred block loses the same amount
    // from both sides instead of all of it from one.
    const blockW = columns * photo.widthMm + (columns - 1) * gapMm;
    const blockH = rows * photo.heightMm + (rows - 1) * gapMm;
    const originX = (sheet.widthMm - blockW) / 2;
    const originY = (sheet.heightMm - blockH) / 2;

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        cells.push({
          x: toPx(originX + column * (photo.widthMm + gapMm)),
          y: toPx(originY + row * (photo.heightMm + gapMm)),
          width: toPx(photo.widthMm),
          height: toPx(photo.heightMm),
        });
      }
    }

    marks.push(...cutMarks({
      columns, rows, photo, gapMm, originX, originY, sheet, toPx,
    }));
  }

  return {
    canvas,
    paper: sheet,
    cells,
    marks,
    columns,
    rows,
    count: cells.length,
    dpi,
  };
}

/**
 * The ticks to cut between.
 *
 * One pair per column edge and one per row edge, drawn in the margin at the
 * outside of the sheet and in the gutters between the photographs - never
 * across a picture. Cutting on a line drawn between two ticks is what every
 * printer's crop mark has always been, and it is easier to do accurately than
 * cutting along a line drawn on the thing you are cutting out.
 *
 * The marks are returned in canvas pixels, as pairs of points, so the renderer
 * is a loop of moveTo and lineTo with nothing to work out.
 */
function cutMarks({ columns, rows, photo, gapMm, originX, originY, sheet, toPx }) {
  const marks = [];

  // How far a tick reaches: the whole margin outside the block, and half the
  // gutter from each side in between, so two facing ticks nearly meet.
  const reachMm = Math.min(gapMm / 2, 2.5);

  const columnEdges = [];
  for (let column = 0; column < columns; column += 1) {
    const left = originX + column * (photo.widthMm + gapMm);
    columnEdges.push(left, left + photo.widthMm);
  }

  const rowEdges = [];
  for (let row = 0; row < rows; row += 1) {
    const top = originY + row * (photo.heightMm + gapMm);
    rowEdges.push(top, top + photo.heightMm);
  }

  const blockTop = rowEdges[0];
  const blockBottom = rowEdges[rowEdges.length - 1];
  const blockLeft = columnEdges[0];
  const blockRight = columnEdges[columnEdges.length - 1];

  // Vertical ticks above and below the block, on every column edge.
  for (const edge of columnEdges) {
    marks.push({
      x1: toPx(edge), y1: 0, x2: toPx(edge), y2: toPx(Math.max(0, blockTop - reachMm)),
    });
    marks.push({
      x1: toPx(edge),
      y1: toPx(Math.min(sheet.heightMm, blockBottom + reachMm)),
      x2: toPx(edge),
      y2: toPx(sheet.heightMm),
    });
  }

  // Horizontal ticks to the left and the right of the block, on every row edge.
  for (const edge of rowEdges) {
    marks.push({
      x1: 0, y1: toPx(edge), x2: toPx(Math.max(0, blockLeft - reachMm)), y2: toPx(edge),
    });
    marks.push({
      x1: toPx(Math.min(sheet.widthMm, blockRight + reachMm)),
      y1: toPx(edge),
      x2: toPx(sheet.widthMm),
      y2: toPx(edge),
    });
  }

  // And the gutter ticks: between two columns, and between two rows.
  for (let column = 1; column < columns; column += 1) {
    const gapCentre = originX + column * (photo.widthMm + gapMm) - gapMm / 2;
    for (const edge of rowEdges) {
      marks.push({
        x1: toPx(gapCentre - reachMm), y1: toPx(edge),
        x2: toPx(gapCentre + reachMm), y2: toPx(edge),
      });
    }
  }
  for (let row = 1; row < rows; row += 1) {
    const gapCentre = originY + row * (photo.heightMm + gapMm) - gapMm / 2;
    for (const edge of columnEdges) {
      marks.push({
        x1: toPx(edge), y1: toPx(gapCentre - reachMm),
        x2: toPx(edge), y2: toPx(gapCentre + reachMm),
      });
    }
  }

  return marks;
}

/**
 * The better of the two ways round, for this photograph on this paper.
 *
 * More copies wins. A tie goes to the unrotated sheet, which is the way the
 * paper is described - "4 x 6" is a landscape 6 x 4 in every photo lab's
 * ordering system - so a tie should not silently turn the print sideways.
 */
export function bestSheet(options) {
  const upright = planSheet({ ...options, rotate: false });
  const turned = planSheet({ ...options, rotate: true });
  return turned.count > upright.count ? turned : upright;
}

/** "8 copies, 4 across and 2 down" - the sentence under the sheet preview. */
export function describeSheet(plan) {
  if (!plan.count) return 'this photo does not fit on this paper at all.';
  const copies = plan.count === 1 ? '1 copy' : `${plan.count} copies`;
  return `${copies}, ${plan.columns} across and ${plan.rows} down`;
}
