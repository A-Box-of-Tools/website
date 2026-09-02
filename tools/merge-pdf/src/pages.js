/**
 * The page list of a document somebody else wrote.
 *
 * A PDF does not store its pages as a list. It stores a tree, and four of the
 * things a page needs - its size, its crop, its rotation and its resources -
 * may be written on any node above it and inherited by everything underneath.
 * A reader that reads only the leaf dictionaries gets pages with no size, and
 * a tool that then copied those leaves into a new document would produce a
 * file whose pages are all US Letter because that is what a reader falls back
 * to. So the walk carries the inheritable four down with it and writes them
 * onto every page it hands back.
 *
 * The walk is also where a broken file is caught: /Kids can point at a node
 * that points back, /Count can disagree with reality, and a page can appear in
 * the tree twice. Every one of those is survivable as long as the walk keeps
 * its own set of what it has already seen and never trusts /Count for anything
 * except a sanity check.
 */

import { isName, PdfString, Ref } from './shared/pdf-objects.js';

/** The keys a page inherits from the nodes above it. There are exactly four,
 *  and they are named in the specification's table of page tree attributes. */
const INHERITED = ['Resources', 'MediaBox', 'CropBox', 'Rotate'];

/** US Letter, in points. What a reader assumes when a page has no /MediaBox,
 *  which makes it the honest thing to show rather than a blank or a zero. */
const DEFAULT_BOX = [0, 0, 612, 792];

/**
 * Every page of `doc`, in reading order.
 *
 * @param {import('./shared/pdf-reader.js').PdfDocument} doc
 * @returns {{ref: object|null, dict: Map, inherited: Map, box: number[],
 *            rotate: number, width: number, height: number}[]}
 */
export function readPages(doc) {
  const found = [];
  const seen = new Set();

  const walk = (node, ref, inherited, depth) => {
    if (!(node instanceof Map) || depth > 64 || found.length > 20000) return;

    const carried = new Map(inherited);
    for (const key of INHERITED) {
      if (node.has(key)) carried.set(key, node.get(key));
    }

    const kids = doc.resolve(node.get('Kids'));
    if (!Array.isArray(kids)) {
      // A leaf. /Type is missing often enough in files written by scripts that
      // "has no kids" is the more reliable test, and /Contents is the tie
      // breaker for a node that has neither.
      if (isName(node.get('Type'), 'Pages')) return;
      found.push(describe(doc, node, ref, carried));
      return;
    }

    for (const kid of kids) {
      const key = kid instanceof Ref ? kid.key : null;
      if (key) {
        if (seen.has(key)) continue; // a loop, or a page listed twice
        seen.add(key);
      }
      walk(doc.resolve(kid), kid instanceof Ref ? kid : null, carried, depth + 1);
    }
  };

  walk(doc.get(doc.catalog, 'Pages'), null, new Map(), 0);
  return found;
}

/** One page, with everything the interface and the copier need already worked
 *  out, so that neither has to know about inheritance. */
function describe(doc, dict, ref, carried) {
  const inherited = new Map();
  for (const key of INHERITED) {
    if (!dict.has(key) && carried.has(key)) inherited.set(key, carried.get(key));
  }

  const box = normalizeBox(doc.resolve(dict.get('MediaBox') ?? carried.get('MediaBox')));
  const rotate = normalizeRotation(doc.resolve(dict.get('Rotate') ?? carried.get('Rotate')));
  const turned = rotate === 90 || rotate === 270;

  return {
    ref,
    dict,
    inherited,
    box,
    rotate,
    // What the page looks like on screen, which is the box turned by the
    // rotation. A landscape scan saved as a portrait page with /Rotate 90 is
    // landscape to everyone who opens it, so that is what gets shown.
    width: turned ? box[3] - box[1] : box[2] - box[0],
    height: turned ? box[2] - box[0] : box[3] - box[1],
  };
}

/**
 * A rectangle as [left, bottom, right, top], in that order and no other.
 *
 * A /MediaBox is allowed to name its corners in either order - [0 792 612 0]
 * is the same rectangle as [0 0 612 792] - and files in the wild use both.
 * Sorting the pairs is what every reader does, and skipping it is how a page
 * ends up with a negative width.
 */
export function normalizeBox(value) {
  if (!Array.isArray(value) || value.length < 4) return [...DEFAULT_BOX];
  const numbers = value.slice(0, 4).map((n) => (Number.isFinite(n) ? n : 0));
  const box = [
    Math.min(numbers[0], numbers[2]), Math.min(numbers[1], numbers[3]),
    Math.max(numbers[0], numbers[2]), Math.max(numbers[1], numbers[3]),
  ];
  if (box[2] - box[0] < 1 || box[3] - box[1] < 1) return [...DEFAULT_BOX];
  return box;
}

/** /Rotate is a multiple of 90 and may be negative or past 360. Both happen. */
export function normalizeRotation(value) {
  if (!Number.isFinite(value)) return 0;
  const turns = Math.round(value / 90) % 4;
  return ((turns + 4) % 4) * 90;
}

/* --------------------------------------------------------------- page sizes */

/** The named sizes, in points, portrait. A page is called by one of these
 *  names when it is within a millimetre of it; a scan is rarely exact. */
const NAMED = [
  ['A3', 841.89, 1190.55],
  ['A4', 595.28, 841.89],
  ['A5', 419.53, 595.28],
  ['A6', 297.64, 419.53],
  ['B5', 498.90, 708.66],
  ['Letter', 612, 792],
  ['Legal', 612, 1008],
  ['Tabloid', 792, 1224],
  ['Executive', 522, 756],
];

/** Within this many points - about a millimetre - a page is that size. */
const TOLERANCE = 3;

/**
 * "A4 portrait", or "216 × 356 mm" when it is nothing with a name.
 *
 * Points are not a unit anybody thinks in, so they never appear. Which of
 * millimetres or inches is used follows the paper: a page that is a whole
 * number of inches across was designed in inches.
 */
export function sizeLabel(width, height) {
  const portrait = width <= height;
  const short = Math.min(width, height);
  const long = Math.max(width, height);

  for (const [label, w, h] of NAMED) {
    if (Math.abs(short - w) <= TOLERANCE && Math.abs(long - h) <= TOLERANCE) {
      return `${label} ${portrait ? 'portrait' : 'landscape'}`;
    }
  }

  const inches = [width / 72, height / 72];
  if (inches.every((value) => Math.abs(value - Math.round(value * 2) / 2) < 0.02)) {
    return `${trim(inches[0])} × ${trim(inches[1])} in`;
  }
  return `${Math.round((width / 72) * 25.4)} × ${Math.round((height / 72) * 25.4)} mm`;
}

function trim(value) {
  return String(Math.round(value * 2) / 2);
}

/* ------------------------------------------------------- text out of a PDF */

/**
 * A PDF text string as something that can be put in the interface.
 *
 * Two spellings, and the file says which by starting with a byte order mark:
 * UTF-16 big-endian with FE FF in front of it, or PDFDocEncoding, which is
 * Latin-1 in every part anybody uses. Bookmarks and document titles are the
 * only strings this tool ever shows, and both are routinely one or the other.
 */
export function decodeText(value) {
  const bytes = value?.bytes;
  if (!bytes || !bytes.length) return '';

  if (bytes[0] === 0xfe && bytes[1] === 0xff) {
    let text = '';
    for (let i = 2; i + 1 < bytes.length; i += 2) {
      text += String.fromCharCode((bytes[i] << 8) | bytes[i + 1]);
    }
    return text.replace(/\0/g, '').trim();
  }

  let text = '';
  for (const byte of bytes) text += String.fromCharCode(byte);
  return text.replace(/\0/g, '').trim();
}

/** The document's own title, when it has one worth showing. */
export function documentTitle(doc) {
  const info = doc.info;
  const title = info instanceof Map ? doc.resolve(info.get('Title')) : null;
  const text = title instanceof PdfString ? decodeText(title) : '';
  return text.length > 0 && text.length < 200 ? text : '';
}
