/**
 * A picture on the ruler: the raster half of what a visitor can add.
 *
 * WHY THIS IS NOT import-svg.js
 *
 * An SVG is a program, and that file reads one by building a third tree out of
 * a whitelist. A PNG is not a program: it is a rectangle of pixels, the
 * browser's own decoder reads it, and there is nothing in it to sanitise. What
 * needs care here is the opposite end - what goes OUT.
 *
 * A chart is one self-contained SVG that gets downloaded and sent on, and the
 * one thing it must never carry is a reference to somewhere else. import-svg.js
 * therefore drops every `href` an uploaded file has. This module writes an
 * `href`, which is the same attribute, so it has to be provably a different
 * thing: `imageMarkup` refuses anything that is not a `data:image/png;base64,`
 * URI of the base64 alphabet and nothing else. The bytes are ones this page
 * encoded a moment earlier from a canvas - not the visitor's file passed
 * through - so there is no string in it that came from outside.
 *
 * WHY THE PICTURE IS REDRAWN RATHER THAN EMBEDDED AS IT ARRIVED
 *
 * Three things fall out of drawing it onto a canvas first and encoding that:
 *
 *   * the size is bounded. A chart figure is a few hundred pixels tall in the
 *     download, and base64 costs a third on top - a 12-megapixel photo carried
 *     through verbatim would be a 20 MB SVG of which the chart uses a tenth.
 *   * the metadata is gone. Whatever the file had in it - the camera, the
 *     place, the colour profile, a comment - is not in a canvas, so it cannot
 *     be in the chart. Nobody has to think about that again.
 *   * the format is ours. What is embedded is a PNG this page wrote, whatever
 *     was opened, so the string in the markup has one shape.
 *
 * None of it involves the network, and the file is never read as text.
 */

export const IMAGE_LIMITS = {
  // The file on disk. Bigger than the SVG limit because a photograph honestly
  // is bigger than a drawing, and it is bounded again by `side` below before
  // any of it reaches the chart.
  bytes: 12 * 1024 * 1024,
  // The longest side kept after redrawing. A chart is at most a couple of
  // thousand pixels tall at 3x, and a figure is a column of that.
  side: 1400,
  // Below this in either direction there is no picture to speak of, and the
  // aspect ratio a chart would take from it is noise.
  smallest: 2,
};

/** Only what this page's own canvas produces, and nothing that could be a URL. */
const PNG_DATA = /^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/;

/**
 * The size to redraw at: the picture's own, unless it is larger than `longest`.
 *
 * Never enlarged. A small picture blown up to the bound would be bigger bytes
 * for the same blur, and the chart scales whatever it is given anyway.
 */
export function fit(width, height, longest = IMAGE_LIMITS.side) {
  // Both sides, not the larger one: a decoder can hand back something 0 by 100,
  // and rounding that up to a single pixel would put a hairline on the ruler
  // and call it a picture.
  if (!(width > 0) || !(height > 0)) return null;
  const scale = Math.min(1, longest / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

/**
 * The `<image>` a chart draws, in the unit box every figure lives in.
 *
 * y runs 0 to 1 from the top of the head to the ground, x is centred on 0, so
 * a picture of aspect `w` occupies x from -w/2 to w/2 - the same box a drawn
 * figure gets, which is why chart.js needs to know nothing about rasters.
 *
 * `preserveAspectRatio="none"` is safe precisely because the aspect written
 * here was measured from the picture: the box is already its shape, so there
 * is nothing to letterbox and nothing to squash.
 *
 * @returns {string|null} null if the href is not one this page made.
 */
export function imageMarkup(href, aspect) {
  if (typeof href !== 'string' || !PNG_DATA.test(href)) return null;
  if (!(aspect > 0) || !Number.isFinite(aspect)) return null;
  const w = Math.round(aspect * 1e6) / 1e6;
  return `<image href="${href}" x="${-w / 2}" y="0" width="${w}" height="1"`
    + ' preserveAspectRatio="none"/>';
}

/**
 * A name for the row, from the file's own.
 *
 * The extension goes because it is the one part nobody means as a name, and
 * the length is cut because a row's name is drawn above a figure a few
 * centimetres wide.
 */
export function nameFromFile(filename) {
  return String(filename).replace(/\.(png|svg)$/i, '').slice(0, 40);
}
