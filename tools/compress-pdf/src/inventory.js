/**
 * Where the bytes actually went.
 *
 * This exists because "compress a PDF" is two different jobs wearing one name,
 * and which one you are looking at is not a matter of opinion - it is a number
 * that can be read off the file in a second.
 *
 * A scanned document is a stack of photographs in a wrapper: ninety-odd per
 * cent images, and re-encoding them is worth most of the file. A contract or a
 * thesis is text, vector drawing and embedded fonts, all of which were already
 * deflated by whatever produced them; there is no eighty per cent to be had,
 * and a tool that implies otherwise is going to disappoint you in about forty
 * seconds. Showing the split before anything is compressed is the honest way
 * round, and it is the screen this tool would keep if it could only keep one.
 *
 * Every figure here is the length of a stream as it sits in the file, added up.
 * Nothing is estimated and nothing is scaled to make the pie look tidy - which
 * is why the groups do not quite add to the file size, and why what is left
 * over is shown as its own line rather than folded into the others.
 */

import { isName, PdfStream, Ref } from './shared/pdf-objects.js';
import { scanObjectHeaders } from './shared/pdf-reader.js';
import { reachable } from './shared/pdf-writer.js';

/** The groups, in the order the page lists them. */
const GROUPS = [
  { id: 'images', label: 'group.images' },
  { id: 'fonts', label: 'group.fonts' },
  { id: 'content', label: 'group.content' },
  { id: 'metadata', label: 'group.metadata' },
  { id: 'other', label: 'group.other' },
  { id: 'structure', label: 'group.structure' },
  { id: 'orphans', label: 'group.orphans' },
];

/**
 * @typedef {object} Inventory
 * @property {number} total the file size
 * @property {number} pages
 * @property {{id: string, label: string, bytes: number, count: number}[]} groups
 * @property {number} images what the pictures cost, which is what can be worked on
 */

/**
 * @param {import('./shared/pdf-reader.js').PdfDocument} doc
 * @returns {Inventory}
 */
export function takeInventory(doc) {
  const roots = [doc.trailer.get('Root')];
  if (doc.trailer.has('Info')) roots.push(doc.trailer.get('Info'));
  const live = reachable(doc, roots);

  const roles = assignRoles(doc);
  const totals = new Map(GROUPS.map((group) => [group.id, { bytes: 0, count: 0 }]));

  let streamBytes = 0;

  for (const [num, value] of doc.objects) {
    if (!(value instanceof PdfStream)) continue;
    const size = value.raw.length;
    streamBytes += size;

    // Object streams and cross-reference streams are the file's own machinery
    // and are not reachable from the catalogue by design. They are not
    // leftovers, so they stay under structure rather than being reported as
    // something an earlier edit abandoned.
    const role = roles.get(num) ?? 'other';
    const id = role === 'structure' || live.has(num) ? role : 'orphans';
    const bucket = totals.get(id) ?? totals.get('other');
    bucket.bytes += size;
    bucket.count += 1;
  }

  // Old copies of objects a later edit replaced. They are not in `doc.objects`
  // at all - the table points at the newest version of each number and the
  // reader never looks at the rest - so they have to be measured off the file
  // itself, or they would show up as "structure" and turn that line into a lie
  // on exactly the files where it matters most.
  const stale = supersededBytes(doc);
  const orphans = totals.get('orphans');
  orphans.bytes += stale.bytes;
  orphans.count += stale.count;

  // Whatever is left: the dictionaries, the cross-reference tables, and the
  // punctuation between objects.
  totals.get('structure').bytes = Math.max(0, doc.bytes.length - streamBytes - stale.bytes);
  totals.get('structure').count = doc.objects.size;

  const groups = GROUPS
    .map((group) => ({ ...group, ...totals.get(group.id) }))
    .filter((group) => group.bytes > 0);

  return {
    total: doc.bytes.length,
    pages: doc.countPages(),
    groups,
    images: totals.get('images').bytes,
  };
}

/**
 * How much of the file is old copies of things.
 *
 * A PDF that has been edited is usually appended to rather than rewritten: the
 * original bytes stay where they are and the new version of each changed object
 * is added at the end. Four rounds of editing can leave four copies of a page
 * in the file, and on a document where somebody replaced a photograph that is
 * not a rounding error.
 *
 * The measurement is the span from a superseded object's header to whatever
 * comes next, which is that object and its punctuation. Approximate at the
 * edges - a few bytes of whitespace either way - and exact enough for a figure
 * that is being shown to the nearest kilobyte.
 */
function supersededBytes(doc) {
  const live = new Map();
  for (const [num, entry] of doc.entries) {
    if ('offset' in entry) live.set(num, entry.offset);
  }

  const heads = scanObjectHeaders(doc.bytes).sort((a, b) => a.offset - b.offset);
  let bytes = 0;
  let count = 0;

  for (const [index, head] of heads.entries()) {
    if (live.get(head.num) === head.offset) continue;
    // Not the copy the table points at. Either an earlier version of it, or -
    // if the table was rebuilt - something the scan found twice.
    const next = heads[index + 1]?.offset ?? doc.bytes.length;
    bytes += Math.max(0, next - head.offset);
    count += 1;
  }

  return { bytes, count };
}

/**
 * Which group each stream belongs to.
 *
 * A stream cannot be classified by looking only at itself: a font file is a
 * blob of bytes whose dictionary says almost nothing, and what makes it a font
 * is that a /FontDescriptor points at it under /FontFile2. So the classification
 * is done by looking at who refers to what, which is one pass over every
 * dictionary in the document.
 */
function assignRoles(doc) {
  /** @type {Map<number, string>} */
  const roles = new Map();

  const mark = (value, role) => {
    for (const ref of refsIn(value)) {
      // First claim wins. A stream reached two ways - a content stream shared
      // between pages - keeps the first sensible label rather than flickering.
      if (!roles.has(ref.num)) roles.set(ref.num, role);
    }
  };

  for (const value of doc.objects.values()) {
    const dict = value instanceof PdfStream ? value.dict : value;
    if (!(dict instanceof Map)) continue;

    mark(dict.get('Contents'), 'content');
    mark(dict.get('FontFile'), 'fonts');
    mark(dict.get('FontFile2'), 'fonts');
    mark(dict.get('FontFile3'), 'fonts');
    mark(dict.get('Metadata'), 'metadata');
    mark(dict.get('PieceInfo'), 'metadata');
    mark(dict.get('Thumb'), 'metadata');
  }

  // Images and forms say what they are, so they are read off the stream itself
  // and they overrule anything the pass above guessed. A form XObject reached
  // through /Contents is still page content, which is what it is set to here.
  for (const [num, value] of doc.objects) {
    if (!(value instanceof PdfStream)) continue;
    const subtype = doc.get(value.dict, 'Subtype');
    if (isName(subtype, 'Image')) roles.set(num, 'images');
    else if (isName(subtype, 'Form')) roles.set(num, 'content');
    else if (isName(doc.get(value.dict, 'Type'), 'Metadata')) roles.set(num, 'metadata');
    else if (isName(doc.get(value.dict, 'Type'), 'ObjStm')) roles.set(num, 'structure');
    else if (isName(doc.get(value.dict, 'Type'), 'XRef')) roles.set(num, 'structure');
    else if (!roles.has(num) && looksLikeFont(doc, value)) roles.set(num, 'fonts');
  }

  return roles;
}

/** The three /Length keys are how a Type 1 font program declares its sections,
 *  and nothing else in a PDF uses them. */
function looksLikeFont(doc, stream) {
  if (stream.dict.has('Length1')) return true;
  const subtype = doc.get(stream.dict, 'Subtype');
  return isName(subtype, 'Type1C') || isName(subtype, 'CIDFontType0C')
    || isName(subtype, 'OpenType');
}

function refsIn(value) {
  if (value instanceof Ref) return [value];
  if (Array.isArray(value)) return value.filter((item) => item instanceof Ref);
  if (value instanceof Map) return [...value.values()].filter((item) => item instanceof Ref);
  return [];
}

/**
 * A sentence saying which kind of document this is.
 *
 * Deliberately blunt. Somebody who has just been told their contract cannot be
 * made much smaller should be told why in the same breath, rather than left to
 * work it out from a run that saved four per cent.
 */
export function verdict(inventory) {
  const share = inventory.total ? inventory.images / inventory.total : 0;

  const percent = Math.round(share * 100);

  if (share > 0.7) return { tone: 'good', text: { key: 'verdict.most', values: { percent } } };
  if (share > 0.3) return { tone: 'ok', text: { key: 'verdict.some', values: { percent } } };
  if (inventory.images > 0) {
    return { tone: 'thin', text: { key: 'verdict.few', values: { percent } } };
  }
  return { tone: 'thin', text: { key: 'verdict.none' } };
}
