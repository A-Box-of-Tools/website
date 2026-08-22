/**
 * The arithmetic: which part of the picture is kept, and how big it comes out.
 *
 * Everything in this file is a pure function on rectangles. No canvas, no
 * bitmap, no DOM - which is why it is the part that is actually tested
 * (tests/js/resize-image.test.js), and why the drawing code in main.js is four
 * lines long: a plan comes out of here and goes straight into one drawImage
 * call, source rectangle and destination rectangle both.
 *
 * The order is fixed and is the whole model of the tool: crop first, then
 * resize what is left, then encode that. Cropping after a resize would throw
 * away pixels that had already been thrown away once, and the numbers on the
 * page would stop meaning what they say.
 */

/** Nothing is ever rounded to zero: a canvas of no width cannot be encoded. */
const px = (value) => Math.max(1, Math.round(value));

/**
 * The shapes the crop box can be locked to.
 *
 * Written as strings rather than numbers so the button that sets one and the
 * label that reports it are the same text, and so "3:2" cannot silently become
 * 1.5000000000000002 on its way through a dataset attribute.
 */
export const RATIOS = ['1:1', '4:5', '9:16', '16:9', '4:3', '3:2'];

/**
 * "16:9" as a number, or null.
 *
 * Also accepts "16/9", "1.777" and "16 x 9", because people paste all three
 * into a box labelled "shape" and refusing two of them teaches nothing.
 */
export function parseRatio(text) {
  if (typeof text === 'number') return Number.isFinite(text) && text > 0 ? text : null;
  const value = String(text ?? '').trim();
  if (!value) return null;

  const pair = value.match(/^(\d*\.?\d+)\s*[:/x×]\s*(\d*\.?\d+)$/i);
  if (pair) {
    const w = Number.parseFloat(pair[1]);
    const h = Number.parseFloat(pair[2]);
    return w > 0 && h > 0 ? w / h : null;
  }

  // A whole number and nothing else. parseFloat on its own would read "16:" as
  // 16, which is a half-typed pair being silently accepted as a square-ish
  // shape rather than refused.
  if (!/^\d*\.?\d+$/.test(value)) return null;
  const single = Number.parseFloat(value);
  return Number.isFinite(single) && single > 0 ? single : null;
}

/** The largest rectangle of the given shape that fits, centred. */
export function ratioCrop(rect, aspect) {
  if (!aspect || !Number.isFinite(aspect)) return { ...rect };

  let width = rect.width;
  let height = rect.height;
  if (width / height > aspect) width = height * aspect;
  else height = width / aspect;

  width = Math.min(rect.width, px(width));
  height = Math.min(rect.height, px(height));

  return {
    x: rect.x + Math.round((rect.width - width) / 2),
    y: rect.y + Math.round((rect.height - height) / 2),
    width,
    height,
  };
}

/**
 * A crop rectangle as fractions of the picture it was drawn on.
 *
 * This is how one box drawn on one image is applied to the rest of a batch.
 * For images the same size as the one it was drawn on it is exact; for the
 * others it is the same relative area, which is what the page says it is.
 */
export function toFractions(rect, size) {
  return {
    x: rect.x / size.width,
    y: rect.y / size.height,
    width: rect.width / size.width,
    height: rect.height / size.height,
  };
}

/** The other direction, clamped so the result is always inside the picture. */
export function fromFractions(fractions, size) {
  const width = Math.min(size.width, px(fractions.width * size.width));
  const height = Math.min(size.height, px(fractions.height * size.height));
  return {
    x: Math.max(0, Math.min(Math.round(fractions.x * size.width), size.width - width)),
    y: Math.max(0, Math.min(Math.round(fractions.y * size.height), size.height - height)),
    width,
    height,
  };
}

/** The whole picture, as a rectangle. */
export const wholeOf = (size) => ({ x: 0, y: 0, width: size.width, height: size.height });

/**
 * What each fit does when a width *and* a height are both given.
 *
 * They only differ in what happens to the shape of the picture, and that is
 * the only thing worth choosing between:
 *
 *   contain - the whole picture, inside the box. One side comes out short.
 *   cover   - the whole box, filled. The overflow is cut off the long side.
 *   pad     - the whole picture, inside the box, on a background. Exact size.
 *   stretch - the whole picture, the whole box, and the shape distorted.
 */
export const FITS = ['contain', 'cover', 'pad', 'stretch'];

/**
 * Work out the canvas to draw on, and where the cropped region goes on it.
 *
 * @param {{x:number,y:number,width:number,height:number}} crop  region kept
 * @param {object} resize
 * @param {'none'|'percent'|'longest'|'pixels'} resize.mode
 * @param {number} [resize.percent]     for 'percent'
 * @param {number} [resize.longest]     for 'longest'
 * @param {number|null} [resize.width]  for 'pixels'; null means "work it out"
 * @param {number|null} [resize.height] for 'pixels'; null means "work it out"
 * @param {string} [resize.fit]         one of FITS, when both sides are given
 * @param {boolean} [resize.noEnlarge]  refuse to scale above 1
 * @returns {{source: object, canvas: object, draw: object, padded: boolean, scale: number}}
 *   `source` may be tighter than `crop` - 'cover' takes its overflow out of
 *   the source rectangle rather than drawing past the edge of the canvas.
 */
export function plan(crop, resize) {
  const source = { ...crop };
  const mode = resize.mode ?? 'none';

  if (mode === 'percent') {
    const factor = (Number(resize.percent) || 100) / 100;
    return laid(source, source.width * factor, source.height * factor);
  }

  if (mode === 'longest') {
    const longest = Math.max(source.width, source.height);
    const wanted = Number(resize.longest) || longest;
    const scale = limit(wanted / longest, resize.noEnlarge);
    return laid(source, source.width * scale, source.height * scale);
  }

  if (mode === 'pixels') {
    return pixelPlan(source, resize);
  }

  return laid(source, source.width, source.height);
}

/**
 * The pixels mode, which is the only one with a decision in it.
 *
 * One number and a blank is the common case and has no ambiguity: the blank
 * side follows from the shape of the picture, and no fit applies because
 * nothing has to be reconciled. The fit only means something when both boxes
 * have a number in them and the two disagree with the picture's own shape.
 */
function pixelPlan(source, resize) {
  const width = positive(resize.width);
  const height = positive(resize.height);

  if (!width && !height) return laid(source, source.width, source.height);

  if (width && !height) {
    const scale = limit(width / source.width, resize.noEnlarge);
    return laid(source, source.width * scale, source.height * scale);
  }

  if (height && !width) {
    const scale = limit(height / source.height, resize.noEnlarge);
    return laid(source, source.width * scale, source.height * scale);
  }

  const fit = FITS.includes(resize.fit) ? resize.fit : 'contain';

  // Stretching is the one answer that is exact by definition, so "never
  // enlarge" has nothing to say about it: the size asked for is the size.
  if (fit === 'stretch') {
    return {
      source,
      canvas: { width, height },
      draw: { x: 0, y: 0, width, height },
      padded: false,
      scale: width / source.width,
    };
  }

  if (fit === 'cover') {
    // The overflow comes out of the source rectangle rather than being drawn
    // off the edge of the canvas. Same picture either way, but this way the
    // numbers the page reports are the pixels that were actually read.
    const tight = ratioCrop(source, width / height);
    const scale = limit(width / tight.width, resize.noEnlarge);
    return laid(tight, tight.width * scale, tight.height * scale);
  }

  const scale = limit(Math.min(width / source.width, height / source.height), resize.noEnlarge);

  if (fit === 'pad') {
    const drawn = { width: px(source.width * scale), height: px(source.height * scale) };
    return {
      source,
      canvas: { width, height },
      draw: {
        x: Math.round((width - drawn.width) / 2),
        y: Math.round((height - drawn.height) / 2),
        width: drawn.width,
        height: drawn.height,
      },
      padded: drawn.width !== width || drawn.height !== height,
      scale,
    };
  }

  return laid(source, source.width * scale, source.height * scale);
}

/** A canvas of exactly this size, with the picture filling it corner to corner. */
function laid(source, width, height) {
  const canvas = { width: px(width), height: px(height) };
  return {
    source,
    canvas,
    draw: { x: 0, y: 0, width: canvas.width, height: canvas.height },
    padded: false,
    scale: canvas.width / source.width,
  };
}

/** A scale factor, held at 1 when the picture is not allowed to grow. */
const limit = (scale, noEnlarge) => (noEnlarge ? Math.min(1, scale) : scale);

/** A field that is blank, zero or nonsense means "work this side out for me". */
function positive(value) {
  const number = Number.parseFloat(value);
  return Number.isFinite(number) && number >= 1 ? Math.round(number) : null;
}

/**
 * Did this plan actually change anything?
 *
 * A file that is not being cropped, not being resized and not changing format
 * is handed back byte for byte instead of being decoded and re-encoded. That
 * is worth knowing before any work is done, because the difference is not only
 * speed: a re-encode costs a little quality and drops every EXIF tag, and
 * doing that to a file nobody asked to change would be the tool quietly
 * damaging something.
 */
export function isUntouched(size, result) {
  return result.source.x === 0
    && result.source.y === 0
    && result.source.width === size.width
    && result.source.height === size.height
    && result.canvas.width === size.width
    && result.canvas.height === size.height
    && !result.padded;
}
