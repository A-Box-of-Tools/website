/**
 * Reading an SVG's own idea of how big it is, and handing the browser a copy
 * that is the size we actually want.
 *
 * WHY THE MARKUP IS REWRITTEN AT ALL
 *
 * A browser will rasterise an SVG for you - that is what an <img> holding one
 * does - but only at the size the file asks for. Three things go wrong if the
 * file is handed over untouched:
 *
 *   - `width="100%" height="100%"`, which is how most exports from a drawing
 *     program come out, has no pixel size at all. An <img> falls back to the
 *     replaced-element default of 300x150 and the picture is drawn at that.
 *   - `width="24" height="24"` with no `viewBox` scales to nothing. Drawn into
 *     a 512-pixel box the artwork stays 24 pixels across in the top left
 *     corner, because without a viewBox there is no user-coordinate system to
 *     stretch and the drawing keeps its own units.
 *   - Some builds of Safari refuse to draw an SVG with no intrinsic size onto
 *     a canvas at all, and hand back a blank rather than an error.
 *
 * So the root tag is rewritten: `width` and `height` become the pixel size
 * being asked for, and a `viewBox` is put in if there was not one, taken from
 * whatever size the file did declare. Everything else in the file is left
 * exactly as it was - this is a rewrite of one tag, not a reserialisation, so
 * nothing in the artwork can be lost in the round trip.
 *
 * WHY IT IS PARSED BY HAND RATHER THAN WITH DOMParser
 *
 * The browser has a perfectly good XML parser, and using it would mean this
 * file could only ever be tested in a browser. The part that decides what size
 * a picture comes out - unit conversion, the viewBox fallback, what a missing
 * height means - is the part worth testing, and it is arithmetic over one tag.
 * So it is done here with a scanner that reads plain strings, runs the same in
 * Node as in a browser, and is covered by tests/js/svg-to-image.test.js.
 */

/**
 * What an <img> makes of an SVG that declares no size of its own: the CSS
 * default size for a replaced element with no intrinsic dimensions.
 * @see https://www.w3.org/TR/CSS22/visudet.html#inline-replaced-width
 */
export const DEFAULT_WIDTH = 300;
export const DEFAULT_HEIGHT = 150;

/**
 * CSS absolute length units, in pixels.
 *
 * The font-relative ones - em, ex, rem, ch - and percentages are deliberately
 * absent. They are not lengths until something has resolved them against a
 * font or a parent box, and there is no parent box here: an SVG being drawn
 * into a canvas is the root of its own world. Anything in this table converts;
 * anything else is treated as "the file did not say", which is the honest
 * answer and lands on the viewBox instead.
 */
const UNITS = {
  '': 1,
  px: 1,
  pt: 96 / 72,
  pc: 16,
  in: 96,
  cm: 96 / 2.54,
  mm: 96 / 25.4,
  q: 96 / 101.6,
};

/** True for a file this tool will try to read. */
export function looksLikeSvg(file) {
  return file?.type === 'image/svg+xml' || /\.svgz?$/i.test(file?.name ?? '');
}

/**
 * Text out of the bytes on disk.
 *
 * `Blob.text()` is UTF-8 and nothing else, which is right for almost every SVG
 * and wrong for the ones that matter: a file saved out of an older Windows
 * drawing program is quite often UTF-16, and Illustrator writes an XML
 * declaration naming its encoding. Decoded as UTF-8, a UTF-16 file comes back
 * as NUL bytes between every letter and the root tag is never found, so the
 * tool would say "this is not an SVG" about a perfectly good one.
 *
 * The BOM is checked first because it is definitive, then the declaration,
 * then UTF-8 - which is also what an XML parser is required to do.
 *
 * @param {ArrayBuffer|Uint8Array} buffer
 * @returns {string}
 */
export function decodeSvgText(buffer) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);

  if (bytes[0] === 0xff && bytes[1] === 0xfe) return decodeWith(bytes.subarray(2), 'utf-16le');
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return decodeWith(bytes.subarray(2), 'utf-16be');
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return decodeWith(bytes.subarray(3), 'utf-8');
  }

  // No BOM. A UTF-16 file without one still gives itself away: every other
  // byte of "<?xml" or "<svg" is a NUL.
  if (bytes[0] === 0x3c && bytes[1] === 0x00) return decodeWith(bytes, 'utf-16le');
  if (bytes[0] === 0x00 && bytes[1] === 0x3c) return decodeWith(bytes, 'utf-16be');

  // The declaration is ASCII whatever the rest of the file is, so reading the
  // first line as Latin-1 to find it is safe for any encoding that could carry
  // one at all.
  const head = decodeWith(bytes.subarray(0, 200), 'latin1');
  const declared = /<\?xml[^>]*encoding\s*=\s*["']([\w-]+)["']/i.exec(head)?.[1];
  if (declared && !/^utf-?8$/i.test(declared)) {
    try {
      return new TextDecoder(declared).decode(bytes);
    } catch {
      // An encoding this browser has never heard of. UTF-8 below is a better
      // guess than refusing the file outright.
    }
  }

  return decodeWith(bytes, 'utf-8');
}

const decodeWith = (bytes, label) => new TextDecoder(label).decode(bytes);

/**
 * Find the root <svg> tag and pull its attributes apart.
 *
 * Everything a document may legally carry in front of its root element is
 * stepped over first: the XML declaration, comments, processing instructions
 * and a doctype - which can itself contain an internal subset in brackets with
 * a `>` inside it, so it is not enough to scan to the next angle bracket.
 *
 * Attributes are keyed by their lowercased name, so that a lookup does not
 * have to know whether this particular file wrote `viewBox` or `viewbox`.
 * `spelling` remembers how each one was actually written, because SVG in an
 * XML document is case-sensitive and writing the tag back out with the wrong
 * capitals produces `viewbox`, which is not an attribute anything reads.
 *
 * @param {string} text
 * @returns {{attrs: Record<string, string>, spelling: Map<string, string>,
 *   start: number, end: number}|null}
 *   `start` and `end` bracket the whole opening tag, so it can be replaced.
 */
export function readRoot(text) {
  let at = skipProlog(text, 0);
  if (!/^<svg[\s/>]/i.test(text.slice(at, at + 5))) return null;

  const end = findTagEnd(text, at);
  if (end < 0) return null;

  const inner = text.slice(at + 4, text[end - 1] === '/' ? end - 1 : end);
  const attrs = {};
  const spelling = new Map();
  const pattern = /([:A-Za-z_][-.:\w]*)\s*=\s*("[^"]*"|'[^']*')/g;
  for (let match = pattern.exec(inner); match; match = pattern.exec(inner)) {
    const key = match[1].toLowerCase();
    attrs[key] = unescapeAttr(match[2].slice(1, -1));
    spelling.set(key, match[1]);
  }

  return { attrs, spelling, start: at, end: end + 1 };
}

/** Whitespace, declarations, comments and a doctype, up to the root element. */
function skipProlog(text, at) {
  for (;;) {
    while (at < text.length && /\s/.test(text[at])) at += 1;
    if (text.startsWith('<?', at)) {
      const close = text.indexOf('?>', at);
      if (close < 0) return text.length;
      at = close + 2;
    } else if (text.startsWith('<!--', at)) {
      const close = text.indexOf('-->', at);
      if (close < 0) return text.length;
      at = close + 3;
    } else if (/^<!doctype/i.test(text.slice(at, at + 9))) {
      at = skipDoctype(text, at);
    } else {
      return at;
    }
  }
}

/** A doctype, internal subset and all: `<!DOCTYPE svg [ ... ]>`. */
function skipDoctype(text, at) {
  const bracket = text.indexOf('[', at);
  const close = text.indexOf('>', at);
  if (bracket >= 0 && close >= 0 && bracket < close) {
    const subset = text.indexOf(']', bracket);
    if (subset < 0) return text.length;
    const after = text.indexOf('>', subset);
    return after < 0 ? text.length : after + 1;
  }
  return close < 0 ? text.length : close + 1;
}

/** The index of the `>` that closes the tag starting at `at`, quotes respected. */
function findTagEnd(text, at) {
  let quote = null;
  for (let i = at; i < text.length; i += 1) {
    const ch = text[i];
    if (quote) {
      if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === '>') {
      return i;
    }
  }
  return -1;
}

/**
 * A length in CSS pixels, or null if the file did not give one this tool can
 * resolve - a percentage, a font-relative unit, or nonsense.
 *
 * @param {string|undefined} value
 * @returns {number|null}
 */
export function parseLength(value) {
  if (value == null) return null;
  const match = /^\s*([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)\s*([a-z%]*)\s*$/i.exec(String(value));
  if (!match) return null;

  const scale = UNITS[match[2].toLowerCase()];
  if (scale === undefined) return null;

  const px = Number(match[1]) * scale;
  return Number.isFinite(px) && px > 0 ? px : null;
}

/** The four numbers of a viewBox, separated by whitespace or commas. */
export function parseViewBox(value) {
  if (!value) return null;
  const parts = String(value).trim().split(/[\s,]+/);
  if (parts.length !== 4) return null;

  const numbers = parts.map(Number);
  if (numbers.some((n) => !Number.isFinite(n))) return null;

  const [x, y, width, height] = numbers;
  if (width <= 0 || height <= 0) return null;
  return { x, y, width, height };
}

/**
 * How big this file says it is, and how sure we are of that.
 *
 * The order is the one a browser uses to size an <img>:
 *
 *   `attributes` - width and height are both there, in units that resolve.
 *                  That is the file's own answer and nothing overrides it.
 *   `mixed`      - one of the two, with a viewBox to supply the shape. The
 *                  missing side follows from the ratio, which is exactly what
 *                  the browser does.
 *   `viewbox`    - neither, but a viewBox. Its width and height are user units
 *                  rather than pixels, but they are the only numbers in the
 *                  file and a browser treats them as the intrinsic size.
 *   `default`    - nothing at all. 300x150, the replaced-element default, and
 *                  the one case where the page says out loud that the number
 *                  came from the browser rather than the file.
 *
 * @param {string} text
 * @returns {{width: number, height: number, ratio: number,
 *   source: 'attributes'|'mixed'|'viewbox'|'default', viewBox: object|null}|null}
 *   null if there is no root <svg> in here at all.
 */
export function intrinsicSize(text) {
  const root = readRoot(text);
  if (!root) return null;

  const viewBox = parseViewBox(root.attrs.viewbox);
  const width = parseLength(root.attrs.width);
  const height = parseLength(root.attrs.height);

  const answer = (w, h, source) => ({
    width: round(w),
    height: round(h),
    ratio: w / h,
    source,
    viewBox,
  });

  if (width && height) return answer(width, height, 'attributes');

  const boxRatio = viewBox ? viewBox.width / viewBox.height : null;
  if (width && boxRatio) return answer(width, width / boxRatio, 'mixed');
  if (height && boxRatio) return answer(height * boxRatio, height, 'mixed');
  if (viewBox) return answer(viewBox.width, viewBox.height, 'viewbox');

  // One dimension and no viewBox: there is no shape to complete it with, so
  // the other keeps the browser's default. Rare, and better than pretending
  // the picture is square.
  if (width) return answer(width, DEFAULT_HEIGHT, 'mixed');
  if (height) return answer(DEFAULT_WIDTH, height, 'mixed');

  return answer(DEFAULT_WIDTH, DEFAULT_HEIGHT, 'default');
}

const round = (n) => Math.max(1, Math.round(n * 1000) / 1000);

/**
 * The same file, asking to be drawn at `width` x `height` pixels.
 *
 * Only the root tag is touched. `width` and `height` are replaced outright, a
 * `viewBox` is added if there was none - without one the artwork would keep
 * its own units and sit in the corner of a larger canvas - and `xmlns` is
 * added if it is missing, because a document without it is not SVG as far as
 * an <img> is concerned and draws as nothing.
 *
 * `stretch` sets `preserveAspectRatio="none"`, which is the only way to make a
 * vector fill a box of a different shape. Left alone, the file's own
 * preserveAspectRatio is kept, so an SVG that was written to align to one
 * corner still does.
 *
 * @param {string} text
 * @param {number} width   in pixels
 * @param {number} height
 * @param {{stretch?: boolean}} [options]
 * @returns {string}
 */
export function sizedSvg(text, width, height, { stretch = false } = {}) {
  const root = readRoot(text);
  if (!root) throw new Error('there is no <svg> element in this file.');

  const attrs = { ...root.attrs };
  const size = intrinsicSize(text);

  if (!parseViewBox(attrs.viewbox)) {
    attrs.viewbox = `0 0 ${size.width} ${size.height}`;
  }
  if (!attrs.xmlns) attrs.xmlns = 'http://www.w3.org/2000/svg';
  if (stretch) attrs.preserveaspectratio = 'none';

  attrs.width = String(width);
  attrs.height = String(height);

  return text.slice(0, root.start) + renderRoot(attrs, root.spelling) + text.slice(root.end);
}

/**
 * The names that have to carry capitals when this tool is the one adding them.
 *
 * An attribute the file already had is written back exactly as the file wrote
 * it. These two are for the case where it did not have one at all: a `viewBox`
 * put in so the drawing scales, and the `preserveAspectRatio` that stretching
 * needs. Written lowercase they are not attributes anything reads, and the
 * failure looks like "the picture is in the corner" rather than like a bug.
 */
const CANONICAL = {
  viewbox: 'viewBox',
  preserveaspectratio: 'preserveAspectRatio',
};

/** Write the root tag back out, each attribute spelled as it arrived. */
function renderRoot(attrs, spelling) {
  const written = Object.entries(attrs).map(([key, value]) => {
    const name = spelling.get(key) ?? CANONICAL[key] ?? key;
    return `${name}="${escapeAttr(value)}"`;
  });

  return `<svg ${written.join(' ')}>`;
}

/**
 * The five predefined XML entities, in and out.
 *
 * An attribute is read for its value - a width of `24` - and written back as
 * markup, so the value has to come out escaped again or a title attribute
 * holding an ampersand would produce a file the browser refuses to parse.
 */
function unescapeAttr(value) {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
