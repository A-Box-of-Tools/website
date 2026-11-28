/**
 * One side of the card, finished: straightened pixels in, a picture of a card out.
 *
 * What happens between the two is short and in this order, and the order is
 * the decision:
 *
 *   1. greyscale, if asked for, on the pixels themselves;
 *   2. the words across it, if there are any, drawn over the card;
 *   3. the corners rounded off, and the four bits of desk that were left in
 *      them painted white;
 *   4. a hairline round the edge, if asked for.
 *
 * The words go on before the corners are cut so that they are clipped with the
 * card rather than hanging off it, and they go on to the pixels rather than as
 * a layer in the PDF, because a layer can be deleted in any PDF editor and the
 * whole point of writing "for the tenancy only" across an identity card is that
 * it cannot be taken off again.
 *
 * The same function makes the preview and the file, at different sizes. What
 * is on screen at step 3 is therefore not a drawing of the result but the
 * result, smaller.
 */

import { CORNER_RADIUS } from './layout.js';

/** The ink for the words across the card, by the name the markup uses. */
export const INKS = {
  grey: '#3d3d3d',
  red: '#c42121',
  blue: '#1b46b4',
  black: '#000000',
};

/**
 * A system sans-serif with the CJK faces named, because "for the lease only"
 * is as often written in Chinese or Japanese as in English, and the generic
 * family alone falls back to a serif for those on some systems.
 */
const FONT_STACK = 'system-ui, "Segoe UI", "Helvetica Neue", Arial, "PingFang SC", '
  + '"Hiragino Sans", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif';

/**
 * @param {{data: Uint8ClampedArray, width: number, height: number}} flat
 * @param {object} options
 * @param {number} options.pxPerMm  how many of these pixels make a millimetre
 * @param {boolean} options.grey
 * @param {boolean} options.round
 * @param {boolean} options.outline
 * @param {string} options.text  the words across the card; empty for none
 * @param {keyof INKS} options.ink
 * @param {number} options.strength  0 to 1, how solid the words are
 * @returns {HTMLCanvasElement}
 */
export function finishCard(flat, options) {
  if (options.grey) toGrey(flat.data);

  const canvas = document.createElement('canvas');
  canvas.width = flat.width;
  canvas.height = flat.height;
  const context = canvas.getContext('2d');
  context.putImageData(new ImageData(flat.data, flat.width, flat.height), 0, 0);

  const text = String(options.text ?? '').trim();
  if (text) drawWords(context, flat.width, flat.height, text, options);

  const radius = options.round ? CORNER_RADIUS * options.pxPerMm : 0;
  if (radius > 0) {
    context.save();
    context.globalCompositeOperation = 'destination-in';
    cardPath(context, 0, 0, flat.width, flat.height, radius);
    context.fill();
    // What the cut left transparent becomes paper. A JPEG has no transparency,
    // and an encoder handed a transparent corner paints it black.
    context.globalCompositeOperation = 'destination-over';
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, flat.width, flat.height);
    context.restore();
  }

  if (options.outline) {
    // A quarter of a millimetre, the weight of the edge a photocopier draws
    // round a card, and never less than one pixel or a small preview loses it.
    const line = Math.max(1, 0.25 * options.pxPerMm);
    context.save();
    context.lineWidth = line;
    context.strokeStyle = '#8c8c8c';
    cardPath(context, line / 2, line / 2, flat.width - line, flat.height - line,
      Math.max(0, radius - line / 2));
    context.stroke();
    context.restore();
  }

  return canvas;
}

/** Rec. 601 luma, written back into all three channels. */
export function toGrey(data) {
  for (let i = 0; i < data.length; i += 4) {
    const y = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = y;
    data[i + 1] = y;
    data[i + 2] = y;
  }
}

/**
 * A rounded rectangle, by arcTo.
 *
 * Not `roundRect`, which is newer than the rest of what this page needs and is
 * missing from browsers that otherwise run it perfectly well.
 */
function cardPath(context, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

/**
 * The words, repeated in slanting rows across the whole card.
 *
 * Repeated rather than written once, because a single line of text across a
 * card can be cropped off a copy along with a strip of the card's edge, and
 * slanted because a horizontal line can sit in the gap between two printed
 * lines and be cut out of a screenshot without touching anything on the card.
 * The size follows the card's height, so the same words come out the same size
 * relative to the card whatever resolution it is being drawn at.
 */
function drawWords(context, width, height, text, { ink, strength }) {
  const size = Math.max(9, height * 0.1);
  context.save();
  context.font = `600 ${size}px ${FONT_STACK}`;
  context.fillStyle = INKS[ink] ?? INKS.grey;
  context.globalAlpha = Math.min(1, Math.max(0.05, strength));
  context.textBaseline = 'middle';

  const spacing = size * 1.6;
  const step = context.measureText(text).width + spacing;
  const rowHeight = size * 2.5;
  const reach = Math.hypot(width, height);

  context.translate(width / 2, height / 2);
  context.rotate(-24 * (Math.PI / 180));
  let row = 0;
  for (let y = -reach / 2; y <= reach / 2; y += rowHeight) {
    // Every other row moves along by half, so the words fall in a brick pattern
    // rather than in columns a crop could follow.
    const offset = (row % 2) * (step / 2);
    for (let x = -reach / 2 - step + offset; x <= reach / 2; x += step) {
      context.fillText(text, x, y);
    }
    row += 1;
  }
  context.restore();
}

/**
 * The whole sheet as one picture, for the preview and for an image file.
 *
 * @param {{width: number, height: number, rects: object[]}} plan  in millimetres
 * @param {HTMLCanvasElement[]} cards  finished, in the plan's order
 * @param {number} dpi
 */
export function drawSheet(plan, cards, dpi) {
  const scale = dpi / 25.4;
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(plan.width * scale));
  canvas.height = Math.max(1, Math.round(plan.height * scale));
  const context = canvas.getContext('2d');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  plan.rects.forEach((rect, index) => {
    const card = cards[index];
    if (!card) return;
    context.drawImage(card, Math.round(rect.x * scale), Math.round(rect.y * scale),
      Math.round(rect.width * scale), Math.round(rect.height * scale));
  });
  return canvas;
}
