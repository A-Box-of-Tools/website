/**
 * Taking the glyphs out, and putting the gap back.
 *
 * Removing a word from a content stream is two problems, and only the first
 * one is obvious.
 *
 * The first: cut the bytes. `(Dear Mr Smith) Tj` becomes `(Dear Mr ) Tj` and
 * the name is not in the file any more - not under a rectangle, not in a layer,
 * not anywhere. That is the whole point of the tool and it is the easy half.
 *
 * The second: everything that came after those bytes now moves. Text is drawn
 * by advancing a pen, so deleting five glyphs pulls the rest of the line five
 * glyphs to the left, and a page redacted that way is visibly wrong - columns
 * no longer line up, a total slides under a different heading. So the exact
 * distance the removed glyphs would have advanced is measured and put back as
 * a kern:
 *
 *     [(Dear Mr ) 2470 (, of this address) ] TJ
 *
 * A number in a `TJ` array moves the pen without drawing anything. The
 * arithmetic is the definition read backwards - a number `n` moves the pen by
 * -n/1000 of the font size - so the width that came out of the font metrics
 * goes straight back in, and the horizontal scale cancels because it multiplies
 * both sides.
 *
 * WHY NOT SET THE TEXT MATRIX INSTEAD
 *
 * `Tm` would place what follows absolutely, which sounds safer and is not: `Tm`
 * also sets the *line* matrix, so the next `Td` or `T*` in the stream - the
 * next line of the paragraph - would be measured from the position this tool
 * chose rather than from the one the document chose. A kern moves the pen and
 * touches nothing else, which is the property that makes it safe to splice
 * into somebody else's page.
 */

import { formatNumber, formatString, formatValue } from './content.js';
import { PdfString } from './shared/pdf-objects.js';
import { decodeText, encodeText } from './strings.js';
import { cornersOf, endOf } from './text.js';

/**
 * What to change, for one page.
 *
 * @param {import('./text.js').Page} page
 * @param {Set<number>} removing  indices into page.glyphs
 * @param {{boxes?: boolean, remove?: (text: string) => string}} options
 *   `remove` is the same text-removing function the rest of the document is
 *   scrubbed with, applied here to the replacement text written into the page.
 * @returns {{splices: Map<string, object[]>, overlay: string, marks: object[]}}
 */
export function planEdits(page, removing, { boxes = true, remove = null } = {}) {
  const splices = new Map();
  const byOperator = new Map();

  for (const index of removing) {
    const glyph = page.glyphs[index];
    if (!glyph) continue;
    const key = `${glyph.sid} ${glyph.op}`;
    if (!byOperator.has(key)) byOperator.set(key, []);
    byOperator.get(key).push(glyph);
  }

  for (const glyphs of byOperator.values()) {
    const { sid, op } = glyphs[0];
    const stream = page.streams.get(sid);
    const operator = stream?.ops?.[op];
    if (!operator) continue;

    const text = rewrite(operator, glyphs);
    if (text === null) continue;
    if (!splices.has(sid)) splices.set(sid, []);
    splices.get(sid).push({ start: operator.start, end: operator.end, text });
  }

  if (remove) markedText(page, remove, splices);

  const marks = boxes ? blackBoxes(page, removing) : [];
  return { splices, overlay: overlayFor(page, marks), marks };
}

/**
 * The text a page carries beside its glyphs.
 *
 * `/Span << /ActualText (Smith) >> BDC` tells a reader to copy "Smith" for
 * whatever glyphs follow, whatever those glyphs are. It exists so that a
 * ligature copies as two letters and a hyphenated line copies as one word, and
 * it means a redaction that removed only the glyphs would hand the whole
 * sentence back to anyone who selected the paragraph and pressed copy. /Alt is
 * the same problem for a screen reader.
 *
 * These are the only operators this tool writes out rather than splicing
 * around, because the dictionary is written into the page and there is no
 * object to edit.
 */
function markedText(page, remove, splices) {
  for (const mark of page.marked) {
    const stream = page.streams.get(mark.sid);
    const operator = stream?.ops?.[mark.op];
    if (!operator) continue;

    let changed = false;
    for (const key of ['ActualText', 'Alt', 'E']) {
      const value = mark.dict.get(key);
      if (!(value instanceof PdfString)) continue;
      const before = decodeText(value.bytes);
      const after = remove(before);
      if (after === before) continue;
      mark.dict.set(key, new PdfString(encodeText(after)));
      changed = true;
    }
    if (!changed) continue;

    const tag = operator.args[operator.args.length - 2];
    if (!splices.has(mark.sid)) splices.set(mark.sid, []);
    splices.get(mark.sid).push({
      start: operator.start,
      end: operator.end,
      text: `${formatValue(tag)} ${formatValue(mark.dict)} BDC`,
    });
  }
}

/* --------------------------------------------------- rewriting one operator */

/**
 * One text-showing operator, without the glyphs being removed.
 *
 * Every form of it comes out as `TJ`, because `TJ` is the only one that can
 * carry the kern that holds the rest of the line in place. The operators that
 * do something else as well - `'` moves to the next line, `"` also sets the
 * word and character spacing - keep those effects as the explicit operators
 * they are shorthand for, in the same order, so that what follows in the
 * stream sees the state it expected.
 */
function rewrite(operator, glyphs) {
  const removed = new Map();
  for (const glyph of glyphs) {
    if (!removed.has(glyph.part)) removed.set(glyph.part, []);
    removed.get(glyph.part).push(glyph);
  }

  const last = operator.args[operator.args.length - 1];

  if (operator.name === 'Tj' || operator.name === "'" || operator.name === '"') {
    if (!(last instanceof PdfString)) return null;
    const array = arrayFor(last.bytes, removed.get(-1) ?? []);
    if (operator.name === 'Tj') return `${array} TJ`;
    if (operator.name === "'") return `T* ${array} TJ`;

    const spacing = operator.args.slice(-3, -1).map(Number);
    if (spacing.length !== 2 || !spacing.every(Number.isFinite)) return null;
    return `${formatNumber(spacing[0])} Tw ${formatNumber(spacing[1])} Tc `
      + `T* ${array} TJ`;
  }

  if (operator.name !== 'TJ' || !Array.isArray(last)) return null;

  const parts = last.map((item, part) => {
    if (item instanceof PdfString) {
      return arrayFor(item.bytes, removed.get(part) ?? [], true);
    }
    return Number.isFinite(item) ? formatNumber(item) : '';
  });

  return `[${parts.filter(Boolean).join(' ')}] TJ`;
}

/**
 * One string, as the pieces of it that survive with kerns between them.
 *
 * @param {Uint8Array} bytes    the string operand
 * @param {object[]} glyphs     the glyphs of it being removed
 * @param {boolean} bare        true when this is already inside a TJ array
 */
function arrayFor(bytes, glyphs, bare = false) {
  const cuts = [...glyphs].sort((a, b) => a.at - b.at);
  const pieces = [];
  let at = 0;

  for (let index = 0; index < cuts.length;) {
    // A run of glyphs that were next to each other in the string is one cut,
    // and one kern, rather than several that would each round separately.
    let last = index;
    while (last + 1 < cuts.length
           && cuts[last + 1].at === cuts[last].at + cuts[last].size) last += 1;

    const run = cuts.slice(index, last + 1);
    const from = run[0].at;
    const to = run[run.length - 1].at + run[run.length - 1].size;

    if (from > at) pieces.push(formatString(bytes.subarray(at, from)));
    const kern = kernFor(run);
    if (kern) pieces.push(kern);

    at = to;
    index = last + 1;
  }

  if (at < bytes.length) pieces.push(formatString(bytes.subarray(at)));
  const body = pieces.join(' ');
  return bare ? body : `[${body}]`;
}

/**
 * The kern that stands in for a run of removed glyphs.
 *
 * '' when the font size is zero, which is the one case the arithmetic cannot
 * express - a `TJ` number is scaled by the font size, so at a size of nothing
 * there is no number that moves the pen at all. Text set at size zero is
 * invisible, so nothing visible moves either.
 */
function kernFor(run) {
  const size = run[0].fontSize;
  if (!size) return '';

  let advance = 0;
  for (const glyph of run) {
    advance += (glyph.advanceWidth / 1000) * glyph.fontSize
      + glyph.charSpacing + glyph.wordSpacing;
  }

  const kern = (-advance * 1000) / size;
  return Math.abs(kern) < 0.0005 ? '' : formatNumber(round(kern));
}

function round(value) {
  return Math.round(value * 1000) / 1000;
}

/* ------------------------------------------------------------- black boxes */

/**
 * Where to paint, so that a reader can see something was taken out.
 *
 * This is the part every other redaction tool does *instead* of the removal.
 * Here it is decoration: the words have already gone, and the rectangle only
 * says so. It is drawn as a four-point path rather than a rectangle because
 * the text it covers may be at an angle, and `re` can only draw a box that
 * lines up with the page.
 */
function blackBoxes(page, removing) {
  const ordered = [...removing]
    .map((index) => page.glyphs[index])
    .filter(Boolean)
    .sort((a, b) => a.order - b.order);

  const runs = [];
  let current = null;

  for (const glyph of ordered) {
    if (current && joins(current[current.length - 1], glyph)) current.push(glyph);
    else {
      current = [glyph];
      runs.push(current);
    }
  }

  return runs.map((run) => {
    const first = cornersOf(run[0]);
    const last = cornersOf(run[run.length - 1]);
    return {
      points: [first[0], last[1], last[2], first[3]],
      invisible: run.every((glyph) => glyph.invisible),
    };
  });
}

/** Whether two removed glyphs are near enough, and level enough, to be covered
 *  by one shape. A run that turns a corner gets a shape each. */
function joins(previous, glyph) {
  if (glyph.order !== previous.order + 1) return false;
  const size = Math.max(previous.height, 1);
  if (Math.abs(glyph.origin.y - previous.origin.y) > size * 0.1) return false;
  const end = endOf(previous);
  return Math.hypot(glyph.origin.x - end.x, glyph.origin.y - end.y) < size;
}

/**
 * The content stream appended to the page to draw them.
 *
 * It opens with as many `Q`s as the page left `q`s outstanding. A page whose
 * content ends inside a saved state has left a transformation, and possibly a
 * clipping path, in force - and a clipping path is quite capable of throwing
 * away a rectangle drawn after it. Unwinding to the state the page began in is
 * the only position from which the coordinates measured while walking the page
 * mean what they say.
 */
function overlayFor(page, marks) {
  if (!marks.length) return '';

  // The leading newline is not decoration. This is appended to whatever the
  // page's last operator was, and `ET` followed straight away by `Q` reads as
  // the single keyword `ETQ`, which is not an operator at all.
  let out = `\n${'Q'.repeat(Math.max(0, page.unbalanced ?? 0))}\nq 0 g\n`;
  for (const mark of marks) {
    const [a, b, c, d] = mark.points;
    out += `${point(a)} m ${point(b)} l ${point(c)} l ${point(d)} l h f\n`;
  }
  return `${out}Q\n`;
}

function point({ x, y }) {
  return `${formatNumber(round(x))} ${formatNumber(round(y))}`;
}
