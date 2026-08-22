/**
 * How big each picture actually appears on the page.
 *
 * This is the measurement that makes downsampling honest. An image's pixel
 * dimensions on their own say nothing about whether it has too many: 3000
 * pixels across is lavish for a logo in a letterhead and barely adequate for a
 * full-bleed A3 poster. What matters is the ratio between the pixels stored and
 * the space they are drawn into - the effective resolution - and the only way
 * to know it is to read the page's content stream and see.
 *
 * So this walks the drawing instructions. A content stream is a stack machine:
 * `q` pushes the current transformation matrix, `Q` pops it, `cm` multiplies a
 * new matrix into it, and `/Im0 Do` paints an image into the unit square, which
 * the matrix has by then turned into whatever rectangle the page wanted. The
 * width the image is drawn at is the length of the matrix's first row.
 *
 * Nothing here renders anything. Colours, text, paths, clipping and blend modes
 * are all skipped: three operators out of the several hundred PDF has are
 * enough to answer the only question being asked.
 *
 * The alternative - assume every image is a full-page scan and divide by the
 * page size - is what a surprising number of tools do. It is right for the
 * scanned document that is most of the traffic and wrong, sometimes by a factor
 * of ten, for everything else.
 */

import { decodeStream } from './filters.js';
import {
  indexOfAscii, Name, Parser, PdfStream, Ref,
} from './objects.js';

/** Nested form XObjects are legal; this deep, something is wrong. */
const MAX_DEPTH = 12;

/**
 * @typedef {object} Placement
 * @property {number} widthPt widest it is ever drawn, in points
 * @property {number} heightPt tallest it is ever drawn, in points
 * @property {number} uses how many times it is painted
 * @property {number} firstPage 1-based, for telling the user where to look
 */

/**
 * Measure every image in the document.
 *
 * @param {import('./reader.js').PdfDocument} doc
 * @returns {Promise<Map<number, Placement>>} keyed by object number
 */
export async function measurePlacements(doc) {
  /** @type {Map<number, Placement>} */
  const found = new Map();
  const pages = collectPages(doc);

  for (const [index, page] of pages.entries()) {
    const content = await contentBytes(doc, page);
    if (!content) continue;
    const resources = inheritedResources(doc, page);
    try {
      await walk(doc, content, resources, IDENTITY, found, index + 1, 0, new Set());
    } catch {
      // A content stream that will not tokenise costs this page's measurements
      // and nothing else. The images are still found by inventory.js; they just
      // have no drawn size, and compress.js treats that as "leave it alone".
    }
  }

  return found;
}

const IDENTITY = [1, 0, 0, 1, 0, 0];

/** a·b, in the order PDF means: the new matrix applies first. */
function multiply(a, b) {
  return [
    a[0] * b[0] + a[1] * b[2],
    a[0] * b[1] + a[1] * b[3],
    a[2] * b[0] + a[3] * b[2],
    a[2] * b[1] + a[3] * b[3],
    a[4] * b[0] + a[5] * b[2] + b[4],
    a[4] * b[1] + a[5] * b[3] + b[5],
  ];
}

/** The page tree, flattened, in reading order. */
function collectPages(doc) {
  const pages = [];
  const seen = new Set();

  const walkTree = (node, depth) => {
    if (!(node instanceof Map) || depth > 64 || pages.length > 5000) return;
    const kids = doc.get(node, 'Kids');
    if (!Array.isArray(kids)) {
      pages.push(node);
      return;
    }
    for (const kid of kids) {
      if (kid instanceof Ref) {
        if (seen.has(kid.key)) continue;
        seen.add(kid.key);
      }
      walkTree(doc.resolve(kid), depth + 1);
    }
  };

  walkTree(doc.get(doc.catalog, 'Pages'), 0);
  return pages;
}

/** /Resources may sit on an ancestor rather than the page itself. */
function inheritedResources(doc, page) {
  let node = page;
  for (let depth = 0; node instanceof Map && depth < 64; depth += 1) {
    const resources = doc.get(node, 'Resources');
    if (resources instanceof Map) return resources;
    node = doc.get(node, 'Parent');
  }
  return new Map();
}

/** /Contents is one stream or an array of them, which join end to end. */
async function contentBytes(doc, page) {
  const contents = doc.get(page, 'Contents');
  const streams = (Array.isArray(contents) ? contents : [contents])
    .map((entry) => doc.resolve(entry))
    .filter((entry) => entry instanceof PdfStream);
  if (!streams.length) return null;

  const parts = [];
  let total = 0;
  for (const stream of streams) {
    try {
      const { bytes, remaining } = await decodeStream(stream, (v) => doc.resolve(v));
      if (remaining.length) continue;
      parts.push(bytes);
      total += bytes.length + 1;
    } catch {
      // One unreadable part of a split content stream; the rest still parses.
    }
  }
  if (!parts.length) return null;

  const joined = new Uint8Array(total);
  let at = 0;
  for (const part of parts) {
    joined.set(part, at);
    at += part.length;
    joined[at] = 0x0a; // the parts are separate tokens, not one run-on word
    at += 1;
  }
  return joined;
}

/**
 * Tokenise a content stream, tracking the matrix and noting every `Do`.
 *
 * Written as a loop over values and operators rather than a full interpreter.
 * An operand stack that is only ever read by two operators does not need to be
 * correct for the other three hundred - it needs to not get lost, which is what
 * the inline-image skip below is for.
 */
async function walk(doc, bytes, resources, matrix, found, page, depth, active) {
  if (depth > MAX_DEPTH) return;

  const xobjects = doc.get(resources, 'XObject');
  const parser = new Parser(bytes, 0);
  const stack = [];
  let ctm = matrix;
  let operands = [];

  for (;;) {
    parser.skip();
    if (parser.pos >= bytes.length) return;

    const code = bytes[parser.pos];
    const startsValue = code === 0x2f || code === 0x28 || code === 0x5b
      || code === 0x3c || code === 0x2e || code === 0x2b || code === 0x2d
      || (code >= 0x30 && code <= 0x39);

    if (startsValue) {
      try {
        operands.push(parser.parseValue());
      } catch {
        parser.pos += 1; // a byte that cannot start a value after all
        operands = [];
      }
      if (operands.length > 32) operands = operands.slice(-8);
      continue;
    }

    const operator = parser.peekKeyword();
    if (!operator) { parser.pos += 1; continue; }
    parser.pos += operator.length;

    if (operator === 'true' || operator === 'false' || operator === 'null') {
      operands.push(operator === 'true');
      continue;
    }

    switch (operator) {
      case 'q':
        stack.push(ctm);
        break;
      case 'Q':
        ctm = stack.pop() ?? IDENTITY;
        break;
      case 'cm': {
        const six = operands.slice(-6);
        if (six.length === 6 && six.every((n) => typeof n === 'number')) {
          ctm = multiply(six, ctm);
        }
        break;
      }
      case 'BI':
        // An inline image: its data is raw bytes in the middle of the
        // instructions, and tokenising them produces nonsense. Skip to EI.
        parser.pos = endOfInlineImage(bytes, parser.pos);
        break;
      case 'Do': {
        const named = operands[operands.length - 1];
        if (named instanceof Name && xobjects instanceof Map) {
          await paint(doc, xobjects, named.value, ctm, found, page, depth, active);
        }
        break;
      }
      default:
        break;
    }

    operands = [];
  }
}

/** One `Do`: record an image's drawn size, or step into a form and keep going. */
async function paint(doc, xobjects, key, ctm, found, page, depth, active) {
  const ref = xobjects.get(key);
  const target = doc.resolve(ref);
  if (!(target instanceof PdfStream)) return;

  const subtype = target.dict.get('Subtype');
  const num = ref instanceof Ref ? ref.num : -1;

  if (subtype instanceof Name && subtype.value === 'Image') {
    if (num < 0) return;
    // The drawn width is the length of the matrix's first row, and the height
    // the length of its second: that is what the unit square becomes. Taking
    // the length rather than the diagonal entry is what makes a rotated image
    // measure correctly instead of coming out as zero.
    const widthPt = Math.hypot(ctm[0], ctm[1]);
    const heightPt = Math.hypot(ctm[2], ctm[3]);
    const existing = found.get(num);
    if (existing) {
      existing.widthPt = Math.max(existing.widthPt, widthPt);
      existing.heightPt = Math.max(existing.heightPt, heightPt);
      existing.uses += 1;
    } else {
      found.set(num, { widthPt, heightPt, uses: 1, firstPage: page });
    }
    return;
  }

  if (subtype instanceof Name && subtype.value === 'Form') {
    // A form drawn inside itself is a malformed file, not a deep one.
    if (num >= 0 && active.has(num)) return;
    if (num >= 0) active.add(num);
    try {
      const { bytes, remaining } = await decodeStream(target, (v) => doc.resolve(v));
      if (remaining.length) return;
      const own = doc.get(target.dict, 'Matrix');
      const inner = Array.isArray(own) && own.length === 6
        ? multiply(own.map((n) => doc.resolve(n)), ctm)
        : ctm;
      const formResources = doc.get(target.dict, 'Resources');
      await walk(doc, bytes, formResources instanceof Map ? formResources : new Map(),
        inner, found, page, depth + 1, active);
    } catch {
      // An unreadable form: its images keep whatever measurement they already
      // have, which may be none.
    } finally {
      if (num >= 0) active.delete(num);
    }
  }
}

/**
 * Where an inline image ends.
 *
 * `EI` has to be found by looking, because the image data between `ID` and it
 * is arbitrary bytes that may contain those two letters. The rule every reader
 * uses is to require whitespace on both sides, which is a heuristic rather than
 * a guarantee - and the reason inline images are a bad idea for anything bigger
 * than a rubber stamp.
 */
function endOfInlineImage(bytes, from) {
  const id = indexOfAscii(bytes, 'ID', from);
  if (id < 0) return bytes.length;

  for (let at = id + 3; at < bytes.length - 1; at += 1) {
    if (bytes[at] !== 0x45 || bytes[at + 1] !== 0x49) continue; // E I
    const before = bytes[at - 1];
    const after = bytes[at + 2] ?? 0x20;
    const spaced = before === 0x20 || before === 0x0a || before === 0x0d || before === 0x09;
    const ended = after === 0x20 || after === 0x0a || after === 0x0d || after === 0x09
      || after === 0x2f || after === 0x5b || after === 0x51;
    if (spaced && ended) return at + 2;
  }
  return bytes.length;
}

/**
 * Effective resolution, in pixels per inch.
 *
 * @param {number} pixels the stored width or height
 * @param {number} points how wide or tall it is drawn
 * @returns {number} 0 when the image is never drawn, which is its own answer
 */
export function effectiveDpi(pixels, points) {
  if (!(points > 0.01) || !(pixels > 0)) return 0;
  return (pixels * 72) / points;
}
