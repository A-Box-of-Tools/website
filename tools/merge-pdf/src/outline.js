/**
 * Bookmarks: reading the tree a document came with, and writing a new one.
 *
 * The outline is the one part of a PDF that a page-shuffling tool cannot copy
 * and cannot honestly drop. Copying it is impossible because its entries point
 * at pages, and half of them may not be in the output any more - and because
 * the tree is doubly linked, so an entry that goes has to be unstitched from
 * four neighbours rather than deleted. Dropping it is what most tools do, and
 * it is why a merged report opens with an empty bookmarks panel and somebody
 * has to build it again by hand.
 *
 * So it is read into an ordinary JavaScript tree here, pruned against the
 * pages that survived, and written out again from scratch. An entry whose page
 * is gone keeps its place as a heading if it still has children under it - a
 * chapter title whose first page was deleted is still where the chapter is -
 * and disappears if it does not.
 *
 * Everything written out is closed rather than open. A merged document with
 * four files in it opens showing four lines instead of four hundred.
 */

import { isGoTo, resolveDestination } from './dests.js';
import { decodeText } from './pages.js';
import { name, PdfString, Ref } from './shared/pdf-objects.js';

/** Enough for any real document, and a stop for one built to be a bomb. */
const MAX_ITEMS = 5000;

/**
 * The bookmark tree of `doc`, as plain objects.
 *
 * @param {import('./shared/pdf-reader.js').PdfDocument} doc
 * @param {Map<string, any>} named what dests.js found in this document
 * @returns {{title: string, target: Ref|null, view: any[], kids: any[]}[]}
 */
export function readOutline(doc, named) {
  const root = doc.get(doc.catalog, 'Outlines');
  if (!(root instanceof Map)) return [];

  const seen = new Set();
  let budget = MAX_ITEMS;

  const chain = (first, depth) => {
    const out = [];
    let ref = first;

    // The /Next chain, which in a damaged file can loop back on itself.
    while (ref instanceof Ref && budget > 0 && depth < 24) {
      if (seen.has(ref.key)) break;
      seen.add(ref.key);
      budget -= 1;

      const item = doc.resolve(ref);
      if (!(item instanceof Map)) break;

      out.push({
        title: decodeText(doc.resolve(item.get('Title'))) || 'Untitled',
        ...place(doc, item, named),
        kids: chain(item.get('First'), depth + 1),
      });

      ref = item.get('Next');
    }

    return out;
  };

  return chain(root.get('First'), 0);
}

/** Where one bookmark points: its own /Dest, or the /D of a GoTo action. Any
 *  other action - a URL, a file, some JavaScript - is not a page in this
 *  document, so the entry comes across as a heading with nothing behind it. */
function place(doc, item, named) {
  let dest = item.get('Dest');
  if (dest === undefined || doc.resolve(dest) === null) {
    const action = doc.resolve(item.get('A'));
    dest = isGoTo(doc, action) ? action.get('D') : undefined;
  }
  if (dest === undefined) return { target: null, view: [] };

  // A name or a string has to reach resolveDestination as itself; anything
  // else it resolves for itself.
  const found = resolveDestination(doc, dest instanceof Ref ? doc.resolve(dest) : dest, named);
  return { target: found?.ref ?? null, view: found?.view ?? [] };
}

/**
 * Drop what no longer has a page, and translate the rest.
 *
 * @param {any[]} nodes what readOutline returned
 * @param {(ref: Ref) => Ref|null} locate the page in the output, or null
 * @returns {any[]} the same shape, with `page` as an output reference
 */
export function pruneOutline(nodes, locate) {
  const kept = [];

  for (const node of nodes) {
    const kids = pruneOutline(node.kids, locate);
    const page = node.target ? locate(node.target) : null;
    // A heading with no page of its own is worth keeping only for what is
    // under it. With nothing under it, it is a line that does nothing.
    if (!page && kids.length === 0) continue;
    kept.push({ title: node.title, page, view: node.view, kids });
  }

  return kept;
}

/**
 * Write a pruned tree into `build` and return the reference to its root, or
 * null when there is nothing to write.
 *
 * The linking is the whole job. Every item carries /Parent, and /Prev and
 * /Next to its siblings; a node with children carries /First and /Last as
 * well. Getting one of those wrong does not produce an error anywhere - it
 * produces a bookmarks panel that is missing everything after the mistake.
 *
 * @param {{reserve: () => number, put: (num: number, value: any) => Ref}} build
 * @param {any[]} nodes
 */
export function writeOutline(build, nodes) {
  if (!nodes.length) return null;

  const rootNum = build.reserve();
  const root = new Map([['Type', name('Outlines')]]);

  const level = (items, parentRef) => {
    const numbers = items.map(() => build.reserve());

    items.forEach((item, index) => {
      const dict = new Map([
        ['Title', textString(item.title)],
        ['Parent', parentRef],
      ]);

      if (index > 0) dict.set('Prev', new Ref(numbers[index - 1], 0));
      if (index + 1 < numbers.length) dict.set('Next', new Ref(numbers[index + 1], 0));

      if (item.page) dict.set('Dest', [item.page, ...destinationView(item.view)]);

      if (item.kids.length) {
        const kids = level(item.kids, new Ref(numbers[index], 0));
        dict.set('First', kids.first);
        dict.set('Last', kids.last);
        // Negative because every item is written closed: the magnitude is how
        // many lines would appear if the reader opened this one.
        dict.set('Count', -item.kids.length);
      }

      build.put(numbers[index], dict);
    });

    return {
      first: new Ref(numbers[0], 0),
      last: new Ref(numbers[numbers.length - 1], 0),
    };
  };

  const top = level(nodes, new Ref(rootNum, 0));
  root.set('First', top.first);
  root.set('Last', top.last);
  // The root's count is what is visible with nothing expanded, which is the
  // top level and no more, because everything below it was written closed.
  root.set('Count', nodes.length);

  return build.put(rootNum, root);
}

/**
 * The rest of a destination array, after the page.
 *
 * Kept when it is one of the simple forms and replaced with /Fit when it is
 * not. The coordinates in an /XYZ destination were measured against the page
 * as it was placed in its old document; they still mean the same point on the
 * same page here, so they come across untouched.
 */
function destinationView(view) {
  if (!Array.isArray(view) || view.length === 0) return [name('Fit')];
  return view;
}

/** A PDF text string, written as UTF-16 big-endian with the byte order mark
 *  that says so. The alternative encoding cannot hold a bookmark titled in
 *  Greek, Japanese, or anything else outside Latin-1. */
export function textString(text) {
  const bytes = new Uint8Array(2 + text.length * 2);
  bytes[0] = 0xfe;
  bytes[1] = 0xff;
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    bytes[2 + i * 2] = (code >> 8) & 0xff;
    bytes[3 + i * 2] = code & 0xff;
  }
  return new PdfString(bytes);
}
