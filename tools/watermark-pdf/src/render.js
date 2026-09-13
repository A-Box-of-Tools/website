/**
 * The stamp itself: the words, drawn by the browser into a transparent
 * picture.
 *
 * WHY A PICTURE AND NOT TEXT
 *
 * A PDF draws text with a font, and the only fonts a document can use
 * without carrying one are the base fourteen, whose alphabet is Latin. A
 * watermark that said "仅供某银行使用" or "Nur für die Bank" would need a font
 * embedded - megabytes, and a subsetting engine this site does not have and
 * has argued against carrying. The browser, on the other hand, has every
 * font the visitor's machine has and draws any script there is. So the
 * stamp is drawn here, once, at a resolution a printer will not notice, and
 * placed on every page as an image with its transparency in a soft mask.
 *
 * What that costs is selectable text: the stamp is a picture, so a reader
 * cannot search for it or copy it. For a watermark that is closer to a
 * feature than a cost - the words are there to be seen, not extracted -
 * and it is said plainly on the page rather than left to be discovered.
 *
 * WHAT IS DRAWN
 *
 * One line, in the page's own sans-serif at a size chosen so the picture is
 * about 2400 pixels wide whatever the words are - long enough that the stamp
 * stretched across an A3 page is still 200 dots per inch, short enough that
 * a stamp of three words does not become a 30-megapixel image. The colour is
 * put in every pixel and the shape in the alpha channel, so the edge of a
 * letter is a soft edge and not a fringe of the wrong colour.
 */

/** The width the picture is drawn at, in pixels. */
const TARGET_WIDTH = 2400;
/** The tallest a picture gets, for a stamp of one or two characters. */
const MAX_HEIGHT = 1200;
/** Room round the words so nothing is clipped by a descender or a swash. */
const PADDING = 0.15;

/**
 * @typedef {object} StampImage
 * @property {number} width
 * @property {number} height
 * @property {Uint8Array} rgb
 * @property {Uint8Array} alpha
 */

/**
 * Draw `text` in `colour` and hand back the pixels.
 *
 * @param {string} text
 * @param {{r: number, g: number, b: number}} colour  0 to 255 each
 * @returns {StampImage}
 */
export function renderStamp(text, colour) {
  const words = text.trim() || ' ';
  const family = 'system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif';

  // Measure at a fixed size first, then scale the font so that the picture
  // comes out the target width.
  const probe = canvas(10, 10).getContext('2d');
  probe.font = `bold 100px ${family}`;
  const measured = probe.measureText(words);
  const ascent = measured.actualBoundingBoxAscent || 80;
  const descent = measured.actualBoundingBoxDescent || 20;
  const widthAt100 = Math.max(measured.width, 1);

  let fontSize = (100 * TARGET_WIDTH) / (widthAt100 * (1 + 2 * PADDING));
  let height = (ascent + descent) * (fontSize / 100) * (1 + 2 * PADDING);
  if (height > MAX_HEIGHT) {
    fontSize *= MAX_HEIGHT / height;
    height = MAX_HEIGHT;
  }
  const width = Math.max(1, Math.round(widthAt100 * (fontSize / 100) * (1 + 2 * PADDING)));
  height = Math.max(1, Math.round(height));

  const surface = canvas(width, height);
  const ctx = surface.getContext('2d');
  ctx.font = `bold ${fontSize}px ${family}`;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'center';
  const { r, g, b } = colour;
  ctx.fillStyle = `rgb(${r} ${g} ${b})`;
  const baseline = height - descent * (fontSize / 100) - height * PADDING / (1 + 2 * PADDING);
  ctx.fillText(words, width / 2, baseline);

  const { data } = ctx.getImageData(0, 0, width, height);
  const count = width * height;
  const rgb = new Uint8Array(count * 3);
  const alpha = new Uint8Array(count);
  for (let i = 0; i < count; i += 1) {
    // The colour is constant and the shape is the alpha, so the colour is
    // written everywhere rather than read back: what the canvas returns for
    // a nearly-transparent pixel has been rounded through premultiplication
    // and is not quite the colour that went in.
    rgb[i * 3] = colour.r;
    rgb[i * 3 + 1] = colour.g;
    rgb[i * 3 + 2] = colour.b;
    alpha[i] = data[i * 4 + 3];
  }
  return { width, height, rgb, alpha };
}

/** An OffscreenCanvas where there is one, and a canvas element where there
 *  is not - Safari before 16.4 has none, and a hidden element draws the same. */
function canvas(width, height) {
  if (typeof OffscreenCanvas === 'function') return new OffscreenCanvas(width, height);
  const element = document.createElement('canvas');
  element.width = width;
  element.height = height;
  return element;
}

/** The colours the page offers, named by the phrase keys the page uses. */
export const COLOURS = {
  grey: { r: 96, g: 96, b: 96 },
  red: { r: 192, g: 32, b: 32 },
  blue: { r: 32, g: 80, b: 192 },
};
