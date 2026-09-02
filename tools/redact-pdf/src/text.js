/**
 * Where every word on a page is, and which bytes of which stream drew it.
 *
 * This is the module the whole tool turns on. Everything before it reads the
 * format; everything after it edits what this found. What it produces for each
 * page is two things that have to agree exactly:
 *
 *   - the text, as a reader would copy it, so a person can search it;
 *   - for every character of that text, the glyph that drew it - which stream,
 *     which operator, which byte of which string, how wide, and where on the
 *     paper it landed.
 *
 * The second half is what makes this a redaction tool rather than a text
 * extractor. Finding "Smith" is not the job. Knowing that those five characters
 * are bytes 12 to 17 of the second string in the fourth `TJ` on the page, and
 * that they occupy 31.4 points starting 72 points from the left, is the job.
 *
 * WHAT IS BEING SIMULATED
 *
 * A tiny piece of a PDF renderer: the current transformation matrix, the text
 * matrix, and the eight parameters of the text state. Nothing else - no
 * colour, no paths, no shading, no images beyond noticing that they are there.
 * That is enough to place every glyph, and it stops well short of the megabyte
 * of engine that drawing the page would need.
 *
 * READING ORDER
 *
 * Glyphs come out of a content stream in the order they were written, which is
 * not the order they are read in: a two-column page can arrive column by
 * column, and a table can arrive by column too. So they are grouped into lines
 * by where they sit on the paper and sorted down the page. Text set at an
 * angle defeats that, and is sorted as though it were level - it will look
 * wrong in the panel that lists the page's text, and it is removed just as
 * exactly, because removal works off the glyph and not off the ordering.
 */

import { lex } from './content.js';
import { decodeStream } from './shared/pdf-filters.js';
import { glyphsOf, readFonts } from './fonts.js';
import { isName, Name, PdfStream, PdfString, Ref } from './shared/pdf-objects.js';
import { decodeText } from './strings.js';

/**
 * How far apart two glyphs have to be, as a fraction of the font size, before
 * the gap counts as a space that was never written as one.
 *
 * A quarter of the size, which is a shade under the width of a space in most
 * text faces, because the two ways of being wrong here are not equally bad. A
 * gap missed joins two words, and somebody searching for either still finds it
 * inside the join. A gap invented splits one word into two, and somebody
 * searching for "Account" is told the document does not contain it. The second
 * is the failure that sends an unredacted file, so the threshold sits where
 * ordinary justification kerning cannot reach it.
 */
const SPACE_GAP = 0.25;

/** And how far apart two baselines have to be to be different lines. */
const LINE_GAP = 0.4;

/** Nested form XObjects, guarded because a form may refer to itself. */
const MAX_DEPTH = 12;

/* ---------------------------------------------------------------- matrices */

const IDENTITY = [1, 0, 0, 1, 0, 0];

/** `a` then `b`, in the order a PDF means when it says one matrix is
 *  concatenated onto another. */
function times(a, b) {
  return [
    a[0] * b[0] + a[1] * b[2],
    a[0] * b[1] + a[1] * b[3],
    a[2] * b[0] + a[3] * b[2],
    a[2] * b[1] + a[3] * b[3],
    a[4] * b[0] + a[5] * b[2] + b[4],
    a[4] * b[1] + a[5] * b[3] + b[5],
  ];
}

function apply(m, x, y) {
  return { x: m[0] * x + m[2] * y + m[4], y: m[1] * x + m[3] * y + m[5] };
}

/** How much a matrix scales lengths, used only to size the space gap and the
 *  line gap in the units the page is measured in. */
function scaleOf(m) {
  return Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2])) || 1;
}

function numbers(args, count) {
  if (args.length < count) return null;
  const out = args.slice(args.length - count).map(Number);
  return out.every((value) => Number.isFinite(value)) ? out : null;
}

/* ------------------------------------------------------------- the walker */

/**
 * Read one page.
 *
 * @param {import('./shared/pdf-reader.js').PdfDocument} doc
 * @param {Map} page the page dictionary
 * @param {number} number the page number, one-based, for reporting
 * @returns {Promise<Page>}
 */
export async function readPage(doc, page, number) {
  const state = {
    doc,
    number,
    glyphs: [],
    marked: [],
    spans: new Map(),
    streams: new Map(),
    unreadable: 0,
    images: [],
    fonts: new Map(),
  };

  const contents = await pageContent(doc, page);
  if (contents) {
    state.streams.set('page', { kind: 'page', bytes: contents, page });
    await walk(state, 'page', contents, doc.get(page, 'Resources'), IDENTITY, 0);
  }

  await readAnnotations(state, page);

  return assemble(state, page);
}

/**
 * The page's content streams, joined.
 *
 * /Contents may be one stream or an array of them, and an array is defined to
 * behave as though the streams were concatenated - an operator is even allowed
 * to begin in one and end in the next. Joining them here rather than walking
 * them separately is the only reading that cannot get that wrong, and it is
 * why an edited page is written back as a single stream.
 */
async function pageContent(doc, page) {
  const value = doc.get(page, 'Contents');
  const list = Array.isArray(value) ? value : [value];
  const parts = [];

  for (const item of list) {
    const stream = doc.resolve(item);
    if (!(stream instanceof PdfStream)) continue;
    try {
      const { bytes } = await decodeStream(stream, (v) => doc.resolve(v));
      parts.push(bytes);
    } catch {
      // A content stream that will not decompress is a page this tool cannot
      // read. It is counted as unreadable rather than silently skipped.
      return null;
    }
  }

  if (!parts.length) return null;

  const size = parts.reduce((sum, part) => sum + part.length + 1, 0);
  const bytes = new Uint8Array(size);
  let at = 0;
  for (const part of parts) {
    bytes.set(part, at);
    at += part.length;
    bytes[at] = 0x0a; // the separator an array of streams implies
    at += 1;
  }

  return bytes;
}

/**
 * One content stream, operator by operator.
 *
 * @param {object} state       what is being collected
 * @param {string} sid         which stream this is, for the editor
 * @param {Uint8Array} bytes   the decoded stream
 * @param {Map} resources      the resource dictionary in scope
 * @param {number[]} ctm       where this stream's space sits on the paper
 * @param {number} depth       form XObject nesting
 */
async function walk(state, sid, bytes, resources, ctm, depth) {
  const { doc } = state;
  const fonts = await fontsFor(state, resources);
  const ops = lex(bytes);
  if (!state.streams.get(sid).ops) state.streams.get(sid).ops = ops;

  // The graphics state stack, and the text state that rides on top of it. Only
  // the parts that move a glyph are modelled.
  let gs = {
    ctm,
    font: null,
    fontName: '',
    size: 0,
    charSpacing: 0,
    wordSpacing: 0,
    hscale: 1,
    leading: 0,
    rise: 0,
    render: 0,
  };
  const stack = [];
  const spans = [];
  let tm = IDENTITY;
  let tlm = IDENTITY;
  let unbalanced = 0;

  /** The innermost span with replacement text, or null. */
  const inside = () => {
    for (let at = spans.length - 1; at >= 0; at -= 1) {
      if (spans[at] !== null) return spans[at];
    }
    return null;
  };

  const show = (value, index) => {
    if (!(value instanceof PdfString)) return;
    tm = showString(state, {
      sid, op: index, part: -1, bytes: value.bytes, gs, tm, group: inside(),
    });
  };

  for (let index = 0; index < ops.length; index += 1) {
    const op = ops[index];
    const { name, args } = op;

    switch (name) {
      case 'q':
        stack.push(gs);
        unbalanced += 1;
        break;
      case 'Q':
        if (stack.length) {
          gs = stack.pop();
          unbalanced -= 1;
        }
        break;
      case 'cm': {
        const m = numbers(args, 6);
        if (m) gs = { ...gs, ctm: times(m, gs.ctm) };
        break;
      }

      case 'BT':
        tm = IDENTITY;
        tlm = IDENTITY;
        break;
      case 'ET':
        break;

      case 'Tf': {
        const size = numbers(args, 1);
        const named = args.find((value) => value instanceof Name);
        gs = {
          ...gs,
          size: size ? size[0] : gs.size,
          fontName: named ? named.value : gs.fontName,
          font: named ? fonts.get(named.value) ?? MISSING_FONT : gs.font,
        };
        break;
      }
      case 'Tc': {
        const value = numbers(args, 1);
        if (value) gs = { ...gs, charSpacing: value[0] };
        break;
      }
      case 'Tw': {
        const value = numbers(args, 1);
        if (value) gs = { ...gs, wordSpacing: value[0] };
        break;
      }
      case 'Tz': {
        const value = numbers(args, 1);
        if (value) gs = { ...gs, hscale: value[0] / 100 };
        break;
      }
      case 'TL': {
        const value = numbers(args, 1);
        if (value) gs = { ...gs, leading: value[0] };
        break;
      }
      case 'Ts': {
        const value = numbers(args, 1);
        if (value) gs = { ...gs, rise: value[0] };
        break;
      }
      case 'Tr': {
        const value = numbers(args, 1);
        if (value) gs = { ...gs, render: value[0] };
        break;
      }

      case 'Td': {
        const value = numbers(args, 2);
        if (value) {
          tlm = times([1, 0, 0, 1, value[0], value[1]], tlm);
          tm = tlm;
        }
        break;
      }
      case 'TD': {
        const value = numbers(args, 2);
        if (value) {
          gs = { ...gs, leading: -value[1] };
          tlm = times([1, 0, 0, 1, value[0], value[1]], tlm);
          tm = tlm;
        }
        break;
      }
      case 'Tm': {
        const m = numbers(args, 6);
        if (m) {
          tlm = m;
          tm = m;
        }
        break;
      }
      case 'T*':
        tlm = times([1, 0, 0, 1, 0, -gs.leading], tlm);
        tm = tlm;
        break;

      case 'Tj':
        show(args[args.length - 1], index);
        break;
      case "'":
        tlm = times([1, 0, 0, 1, 0, -gs.leading], tlm);
        tm = tlm;
        show(args[args.length - 1], index);
        break;
      case '"': {
        const value = numbers(args.slice(0, -1), 2);
        if (value) gs = { ...gs, wordSpacing: value[0], charSpacing: value[1] };
        tlm = times([1, 0, 0, 1, 0, -gs.leading], tlm);
        tm = tlm;
        show(args[args.length - 1], index);
        break;
      }
      case 'TJ': {
        const array = args[args.length - 1];
        if (!Array.isArray(array)) break;
        array.forEach((item, part) => {
          if (item instanceof PdfString) {
            tm = showString(state, {
              sid, op: index, part, bytes: item.bytes, gs, tm, group: inside(),
            });
          } else if (Number.isFinite(item)) {
            // A kern, in thousandths of the font size and against the
            // direction of writing.
            const shift = (-item / 1000) * gs.size * gs.hscale;
            tm = times([1, 0, 0, 1, shift, 0], tm);
          }
        });
        break;
      }

      case 'BDC': {
        // A dictionary written into the page beside the glyphs it marks. Two
        // of its keys hold text of their own - /ActualText, which is what a
        // reader copies in place of the glyphs, and /Alt, which is what a
        // screen reader says. Both override what the glyphs spell, so this is
        // where a word can be present in a document that draws something else
        // entirely, and where a redaction that read only the glyphs would
        // leave the word behind.
        const dict = args[args.length - 1];
        const replacement = dict instanceof Map
          ? dict.get('ActualText') ?? dict.get('Alt') : null;
        if (replacement instanceof PdfString) {
          const id = state.marked.length;
          state.marked.push({ sid, op: index, dict });
          state.spans.set(id, decodeText(replacement.bytes));
          spans.push(id);
        } else {
          spans.push(null);
        }
        break;
      }
      case 'BMC':
        spans.push(null);
        break;
      case 'EMC':
        spans.pop();
        break;

      case 'Do':
        await drawXObject(state, args[args.length - 1], resources, gs.ctm, depth);
        break;
      case 'INLINE_IMAGE':
        state.images.push({ ctm: gs.ctm, inline: true });
        break;

      default:
        break;
    }
  }

  if (sid === 'page') state.unbalanced = unbalanced;
}

/** A font that is named by a page and not in its resources. Its glyphs still
 *  have to advance the pen, or everything after them lands in the wrong place. */
const MISSING_FONT = {
  split: (bytes) => [...bytes].map((code) => ({ code, size: 1 })),
  singleByte: true,
  text: () => '',
  width: () => 500,
  ascent: 750,
  descent: -220,
  scale: 1,
  toUnicode: null,
  missing: true,
};

/** Resource dictionaries are shared between pages, so their fonts are read
 *  once per document rather than once per page. */
async function fontsFor(state, resources) {
  const key = resources instanceof Map ? resources : null;
  if (key && state.fonts.has(key)) return state.fonts.get(key);
  const fonts = await readFonts(state.doc, resources);
  if (key) state.fonts.set(key, fonts);
  return fonts;
}

/**
 * One string operand: the glyphs it draws, and where the pen ends up.
 *
 * Every glyph is recorded whatever its render mode, invisible ones included.
 * Mode 3 is how a scanner's OCR layer is written - text laid exactly over the
 * picture of itself, so that the page can be searched - and it is the single
 * most important case for a tool like this to see, because it is text that a
 * person looking at the page has no way of knowing is there.
 */
function showString(state, {
  sid, op, part, bytes, gs, tm, group = null,
}) {
  const font = gs.font ?? MISSING_FONT;
  const glyphs = glyphsOf(font, bytes);
  let matrix = tm;

  for (const glyph of glyphs) {
    const trm = times(
      [gs.size * gs.hscale, 0, 0, gs.size, 0, gs.rise],
      times(matrix, gs.ctm),
    );

    // /Tw applies to the single byte 32 and to nothing else - not to a
    // two-byte code that happens to end in 32, and not to a space that a
    // font's encoding put at some other code.
    const spacing = font.singleByte && glyph.code === 32 && glyph.size === 1
      ? gs.wordSpacing : 0;
    const advance = ((glyph.width / 1000) * gs.size + gs.charSpacing + spacing);

    state.glyphs.push({
      sid,
      op,
      part,
      at: glyph.at,
      size: glyph.size,
      code: glyph.code,
      text: glyph.text,
      // Kept so the editor can put back exactly the advance it takes away.
      advanceWidth: glyph.width,
      fontSize: gs.size,
      charSpacing: gs.charSpacing,
      wordSpacing: spacing,
      hscale: gs.hscale,
      render: gs.render,
      invisible: gs.render === 3 || gs.render === 7,
      group,
      origin: apply(trm, 0, 0),
      height: Math.abs(gs.size * scaleOf(times(matrix, gs.ctm))),
      // The one matrix everything else about this glyph's place on the paper
      // is derived from. Six numbers rather than the five points they give,
      // because a long document holds every glyph of every page at once and
      // the points are wanted for the few that are removed.
      trm,
      ascent: font.ascent,
      descent: font.descent,
      order: state.glyphs.length,
    });

    if (!glyph.known) state.unreadable += 1;

    matrix = times([1, 0, 0, 1, advance * gs.hscale, 0], matrix);
  }

  return matrix;
}

/**
 * `Do`: either a picture, or a form - a stream of the same language with its
 * own resources and its own matrix.
 *
 * Forms are where a great deal of real text lives. A letterhead, a stamp, a
 * signature block and every filled-in form field is one, and a tool that
 * walked only the page's own stream would report those pages as empty.
 */
async function drawXObject(state, named, resources, ctm, depth) {
  if (depth >= MAX_DEPTH || !(named instanceof Name)) return;

  const { doc } = state;
  const table = doc.get(resources, 'XObject');
  const ref = table instanceof Map ? table.get(named.value) : null;
  const stream = doc.resolve(ref);
  if (!(stream instanceof PdfStream)) return;

  if (isName(doc.get(stream.dict, 'Subtype'), 'Image')) {
    state.images.push({ ctm, dict: stream.dict });
    return;
  }
  if (!isName(doc.get(stream.dict, 'Subtype'), 'Form')) return;

  const sid = ref instanceof Ref ? `obj:${ref.num}` : `inline:${state.streams.size}`;
  if (state.streams.has(sid) && state.streams.get(sid).walked) return;

  let bytes;
  try {
    ({ bytes } = await decodeStream(stream, (value) => doc.resolve(value)));
  } catch {
    return;
  }

  state.streams.set(sid, {
    kind: 'xobject', bytes, stream, ref: ref instanceof Ref ? ref : null, walked: true,
  });

  const matrix = doc.get(stream.dict, 'Matrix');
  const inner = Array.isArray(matrix) && matrix.length === 6
    ? times(matrix.map(Number), ctm) : ctm;

  await walk(state, sid, bytes,
    doc.get(stream.dict, 'Resources') ?? resources, inner, depth + 1);
}

/* ---------------------------------------------------------- annotations */

/**
 * The text that is not in the page at all.
 *
 * A form field's value, a sticky note, a stamp: each is an annotation with an
 * appearance stream, drawn over the page by the reader rather than by the
 * page's own content. Somebody's name typed into a form is there and nowhere
 * else, so a redaction that skipped appearance streams would leave the name on
 * screen while claiming to have removed it.
 */
async function readAnnotations(state, page) {
  const { doc } = state;
  const annots = doc.get(page, 'Annots');
  if (!Array.isArray(annots)) return;

  for (const item of annots) {
    const annot = doc.resolve(item);
    if (!(annot instanceof Map)) continue;
    if (isName(doc.get(annot, 'Subtype'), 'Link')) continue;
    if (isName(doc.get(annot, 'Subtype'), 'Popup')) continue;

    const appearance = normalAppearance(doc, annot);
    const ref = appearance?.ref;
    const stream = appearance?.stream;
    if (!(stream instanceof PdfStream)) continue;

    const sid = ref instanceof Ref ? `obj:${ref.num}` : `annot:${state.streams.size}`;
    if (state.streams.has(sid)) continue;

    let bytes;
    try {
      ({ bytes } = await decodeStream(stream, (value) => doc.resolve(value)));
    } catch {
      continue;
    }

    state.streams.set(sid, {
      kind: 'annotation', bytes, stream, ref: ref instanceof Ref ? ref : null, annot,
    });

    await walk(state, sid, bytes,
      doc.get(stream.dict, 'Resources') ?? doc.get(page, 'Resources'),
      appearanceMatrix(doc, annot, stream), 1);
  }
}

/** /AP /N, which is either the appearance or a dictionary of them - one per
 *  state, for a checkbox or a radio button. /AS says which is showing. */
function normalAppearance(doc, annot) {
  const ap = doc.get(annot, 'AP');
  const normal = ap instanceof Map ? ap.get('N') : null;
  const resolved = doc.resolve(normal);

  if (resolved instanceof PdfStream) {
    return { stream: resolved, ref: normal instanceof Ref ? normal : null };
  }
  if (!(resolved instanceof Map)) return null;

  const as = doc.get(annot, 'AS');
  const key = as instanceof Name ? as.value : [...resolved.keys()][0];
  const chosen = resolved.get(key);
  const stream = doc.resolve(chosen);
  return stream instanceof PdfStream
    ? { stream, ref: chosen instanceof Ref ? chosen : null } : null;
}

/**
 * Where an appearance stream lands on the page.
 *
 * Its /BBox is put through its /Matrix, and the box that comes out is then
 * stretched to fit the annotation's /Rect. That is the whole of the algorithm
 * in the specification, and it matters here only for drawing a black box in
 * the right place - the removal itself needs no coordinates at all.
 */
function appearanceMatrix(doc, annot, stream) {
  const rect = (doc.get(annot, 'Rect') ?? []).map((v) => Number(doc.resolve(v)));
  const box = (doc.get(stream.dict, 'BBox') ?? []).map((v) => Number(doc.resolve(v)));
  const matrix = doc.get(stream.dict, 'Matrix');
  const form = Array.isArray(matrix) && matrix.length === 6 ? matrix.map(Number) : IDENTITY;

  if (rect.length !== 4 || box.length !== 4 || !rect.every(Number.isFinite)
      || !box.every(Number.isFinite)) return IDENTITY;

  const corners = [
    apply(form, box[0], box[1]), apply(form, box[2], box[1]),
    apply(form, box[2], box[3]), apply(form, box[0], box[3]),
  ];
  const xs = corners.map((point) => point.x);
  const ys = corners.map((point) => point.y);
  const width = Math.max(...xs) - Math.min(...xs);
  const height = Math.max(...ys) - Math.min(...ys);

  const sx = width > 0 ? (Math.abs(rect[2] - rect[0])) / width : 1;
  const sy = height > 0 ? (Math.abs(rect[3] - rect[1])) / height : 1;

  return times(form, [
    sx, 0, 0, sy,
    Math.min(rect[0], rect[2]) - Math.min(...xs) * sx,
    Math.min(rect[1], rect[3]) - Math.min(...ys) * sy,
  ]);
}

/* ------------------------------------------------- lines, words and text */

/**
 * Turn the glyphs into something a person can read and search.
 *
 * @typedef {object} Page
 * @property {number} number
 * @property {string} text        the page as a reader would copy it
 * @property {Int32Array} owner   for each character, the glyph that drew it
 * @property {object[]} glyphs
 * @property {{from: number, to: number}[]} lines  character ranges
 * @property {number} unreadable  glyphs whose character could not be known
 */
function assemble(state, page) {
  const lines = intoLines(state.glyphs);

  // Which glyphs each replacement span covers. They are removed together or
  // not at all: half of a span whose text says "Smith" is still a span whose
  // text says "Smith".
  const groups = new Map();
  for (const glyph of state.glyphs) {
    if (glyph.group === null || glyph.group === undefined) continue;
    if (!groups.has(glyph.group)) groups.set(glyph.group, []);
    groups.get(glyph.group).push(glyph.order);
  }

  let text = '';
  const owner = [];
  const ranges = [];

  // The text and the ranges into it are built in one pass. Two loops that had
  // to arrive at the same character count would be one edit away from
  // disagreeing, and a range that is off by one redacts the wrong word.
  // A span with replacement text contributes that text once, at its first
  // glyph, and its remaining glyphs contribute nothing - because what the
  // document says those glyphs spell is the span's text and not their own.
  const spent = new Set();

  lines.forEach((line, index) => {
    if (index) {
      text += '\n';
      owner.push(-1);
    }
    const from = text.length;
    let previous = null;

    for (const glyph of line) {
      const replaced = glyph.group !== null && glyph.group !== undefined;
      if (replaced && spent.has(glyph.group)) {
        previous = glyph;
        continue;
      }
      if (previous && gapBefore(previous, glyph)) {
        text += ' ';
        owner.push(-1);
      }

      const said = replaced ? state.spans.get(glyph.group) ?? '' : glyph.text;
      if (replaced) spent.add(glyph.group);

      for (const character of said) {
        text += character;
        owner.push(glyph.order);
      }
      previous = glyph;
    }
    ranges.push({ from, to: text.length });
  });

  return {
    number: state.number,
    page,
    text,
    owner: Int32Array.from(owner),
    glyphs: state.glyphs,
    lines: ranges,
    streams: state.streams,
    marked: state.marked,
    groups,
    unreadable: state.unreadable,
    images: state.images,
    unbalanced: state.unbalanced ?? 0,
    box: mediaBox(state.doc, page),
  };
}

/** Where the pen ends up after a glyph and before any spacing, which is what
 *  the gap to the next one is measured from. */
export function endOf(glyph) {
  return apply(glyph.trm, glyph.advanceWidth / 1000, 0);
}

/** The four corners of the mark a glyph makes, from its baseline to the top
 *  and bottom its font claims. Only the removed glyphs are ever asked. */
export function cornersOf(glyph) {
  const top = glyph.ascent / 1000;
  const bottom = glyph.descent / 1000;
  const right = glyph.advanceWidth / 1000;
  return [
    apply(glyph.trm, 0, bottom), apply(glyph.trm, right, bottom),
    apply(glyph.trm, right, top), apply(glyph.trm, 0, top),
  ];
}

/** A gap wide enough to be the space nobody wrote. */
function gapBefore(previous, glyph) {
  if (/\s$/.test(previous.text) || /^\s/.test(glyph.text)) return false;
  const size = Math.max(previous.height, 1);
  const end = endOf(previous);
  return Math.hypot(glyph.origin.x - end.x, glyph.origin.y - end.y) > size * SPACE_GAP;
}

/**
 * Glyphs into lines, by where they sit rather than by when they were drawn.
 *
 * Sorting on the baseline puts a two-column page back into reading order per
 * column only by accident, which is the same thing every extractor without a
 * layout analyser does. It is good enough for the job: what this ordering
 * decides is how the page reads in the panel, never what gets removed.
 */
function intoLines(glyphs) {
  if (!glyphs.length) return [];

  const rows = [];
  for (const glyph of glyphs) {
    const size = Math.max(glyph.height, 1);
    const row = rows.find((item) => Math.abs(item.y - glyph.origin.y) <= size * LINE_GAP);
    if (row) {
      row.glyphs.push(glyph);
      // The running baseline follows the last glyph, so a line that drifts -
      // subscripts, a signature line - stays one line.
      row.y = (row.y * (row.glyphs.length - 1) + glyph.origin.y) / row.glyphs.length;
    } else {
      rows.push({ y: glyph.origin.y, glyphs: [glyph] });
    }
  }

  rows.sort((a, b) => b.y - a.y);
  for (const row of rows) row.glyphs.sort((a, b) => a.origin.x - b.origin.x);
  return rows.map((row) => row.glyphs);
}

function mediaBox(doc, page) {
  let node = page;
  for (let depth = 0; node instanceof Map && depth < 32; depth += 1) {
    const box = doc.get(node, 'MediaBox');
    if (Array.isArray(box) && box.length === 4) {
      const values = box.map((value) => Number(doc.resolve(value)));
      if (values.every(Number.isFinite)) {
        return {
          x: Math.min(values[0], values[2]),
          y: Math.min(values[1], values[3]),
          width: Math.abs(values[2] - values[0]),
          height: Math.abs(values[3] - values[1]),
        };
      }
    }
    node = doc.get(node, 'Parent');
  }
  return { x: 0, y: 0, width: 612, height: 792 };
}

/** Every page dictionary, in order, walking the tree rather than trusting
 *  /Count - the same rule the merger and the compressor both settled on. */
export function pagesOf(doc) {
  const pages = [];
  const seen = new Set();

  const visit = (node, depth) => {
    if (!(node instanceof Map) || depth > 64 || pages.length > 10000) return;
    const kids = doc.get(node, 'Kids');
    if (!Array.isArray(kids)) {
      if (isName(node.get('Type'), 'Page') || node.has('Contents')) pages.push(node);
      return;
    }
    for (const kid of kids) {
      const key = kid instanceof Ref ? kid.key : null;
      if (key) {
        if (seen.has(key)) continue;
        seen.add(key);
      }
      visit(doc.resolve(kid), depth + 1);
    }
  };

  visit(doc.get(doc.catalog, 'Pages'), 0);
  return pages;
}
