/**
 * The five things a data URI is actually pasted into.
 *
 * A URI on its own is rarely what somebody wants. They want the line that goes
 * in the stylesheet, and the two mistakes that line is usually written with
 * are the reason this is a menu rather than a note at the bottom of the page:
 *
 *   url(data:...)   unquoted, which works until the picture is an SVG and the
 *                   spaces and parentheses inside it end the token early;
 *
 *   the same URI pasted twice in the same file, because there was no obvious
 *   place to put it once - which is what the custom-property shape is for.
 *
 * Everything here quotes the URI. That is what buys the SVG encoding in
 * encode.js the right to leave spaces alone.
 */

/**
 * The shapes, and the extension each one downloads as.
 *
 * What they are called and what they are for is written in body.html, beside
 * the radio button that selects them, rather than here - a string in a module
 * is a string no locale file can reach, and these are the words somebody has
 * to read to choose.
 */
export const SHAPES = [
  { id: 'uri', ext: 'txt' },
  { id: 'css-rule', ext: 'css' },
  { id: 'css-var', ext: 'css' },
  { id: 'html', ext: 'html' },
  { id: 'markdown', ext: 'md' },
];

export const shapeById = (id) => SHAPES.find((shape) => shape.id === id) ?? SHAPES[0];

/**
 * @typedef {object} Result
 * @property {string} name the original file name
 * @property {string} ident a CSS-safe name derived from it, made unique
 * @property {string} uri the data URI
 * @property {number} width in pixels, 0 when unknown
 * @property {number} height
 * @property {boolean} svg
 */

/** One result, in the chosen shape. */
export function render(id, result) {
  switch (id) {
    case 'css-rule':
      return `.${result.ident} {\n  background-image: url("${result.uri}");\n}`;
    case 'css-var':
      return `--${result.ident}: url("${result.uri}");`;
    case 'html':
      return `<img src="${result.uri}" alt=""${size(result)}>`;
    case 'markdown':
      return `![](${result.uri})`;
    default:
      return result.uri;
  }
}

/**
 * `width` and `height` on the tag, which is what stops the page reflowing when
 * the image arrives - and which is left off an SVG on purpose. An SVG that
 * carries only a viewBox has no pixel size of its own; the browser reports the
 * 300x150 default, and writing that onto the tag would fix a scalable picture
 * at a size nobody chose.
 */
function size(result) {
  if (result.svg || !result.width || !result.height) return '';
  return ` width="${result.width}" height="${result.height}"`;
}

/**
 * Every result at once, as one file.
 *
 * The custom properties are wrapped in `:root` because that is the only form
 * of them that can be pasted straight in and work; the others are already
 * standalone.
 */
export function bundle(id, results) {
  const parts = results.map((result) => render(id, result));

  if (id === 'css-var') {
    return `:root {\n${parts.map((line) => `  ${line}`).join('\n')}\n}`;
  }
  if (id === 'uri') {
    // A wall of undelimited URIs is unusable, and a URI cannot contain a line
    // break, so the file name above each one is enough to tell them apart.
    return results.map((result, at) => `${result.name}\n${parts[at]}`).join('\n\n');
  }
  return parts.join('\n\n');
}

/** What the download is called. */
export function bundleName(id) {
  return `data-uris.${shapeById(id).ext}`;
}

export function fileName(id, result) {
  return `${result.ident}-data-uri.${shapeById(id).ext}`;
}

/**
 * File names into names a stylesheet will accept, kept distinct from each
 * other.
 *
 * `Logo Final (2).PNG` is a perfectly ordinary thing to have on a disk and not
 * a thing CSS will take: an identifier is letters, digits, hyphens and
 * underscores, and may not begin with a digit. Two files that reduce to the
 * same name get a number, because the failure otherwise is silent - the second
 * rule wins and one of the pictures simply never appears.
 *
 * @param {string[]} names
 * @returns {string[]} one identifier per name, in the same order
 */
export function identifiers(names) {
  const used = new Map();
  return names.map((name) => {
    const base = identifier(name);
    const seen = used.get(base) ?? 0;
    used.set(base, seen + 1);
    return seen ? `${base}-${seen + 1}` : base;
  });
}

function identifier(name) {
  const stem = name.replace(/\.[^.]+$/, '') || name;
  const cleaned = stem
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!cleaned) return 'image';
  return /^[0-9]/.test(cleaned) ? `img-${cleaned}` : cleaned;
}
