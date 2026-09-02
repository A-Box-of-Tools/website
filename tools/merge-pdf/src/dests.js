/**
 * Destinations: the two and a half ways a PDF says "go to that page".
 *
 * A link or a bookmark can carry its destination as an array whose first entry
 * is the page itself - [12 0 R /XYZ null null 0] - and if every one of them
 * did, this file would not exist. But it can also carry a *name*, which is
 * looked up in a table hanging off the catalogue, and there are two of those
 * tables: /Dests in the catalogue, keyed by PDF name, which is the 1.1 way, and
 * /Names /Dests, a balanced tree keyed by string, which is the 1.2 way and what
 * everything writes now. Word writes named destinations for every heading; so
 * does LaTeX; so does every tool that builds a table of contents.
 *
 * This tool takes pages out of one document and puts them in another, so it
 * cannot carry either table across intact - half the names would point at
 * pages that are no longer in the file, and two merged documents would each
 * bring a "section.1". Instead, every destination is resolved *here*, against
 * the document it came from, down to the page it means. What gets written into
 * the output is an explicit array, and a link whose page did not come along is
 * written out with no action at all rather than one that goes nowhere.
 */

import { isName, Name, PdfString, Ref } from './shared/pdf-objects.js';

/**
 * Every named destination in `doc`, as a map from the name to its destination.
 *
 * Both tables, with the modern one winning where they disagree, which is the
 * order a reader resolves them in.
 *
 * @param {import('./shared/pdf-reader.js').PdfDocument} doc
 * @returns {Map<string, any>}
 */
export function namedDestinations(doc) {
  const found = new Map();
  const catalog = doc.catalog;
  if (!catalog) return found;

  const old = doc.get(catalog, 'Dests');
  if (old instanceof Map) {
    for (const [key, value] of old) found.set(key, value);
  }

  const names = doc.get(catalog, 'Names');
  if (names instanceof Map) walkNameTree(doc, doc.resolve(names.get('Dests')), found, 0);

  return found;
}

/**
 * A name tree, which is a B-tree with the leaves in /Names and the branches in
 * /Kids. Read rather than searched: this tool wants all of them, and a document
 * with enough destinations for the difference to matter has other problems.
 */
function walkNameTree(doc, node, into, depth) {
  if (!(node instanceof Map) || depth > 32 || into.size > 50000) return;

  const entries = doc.resolve(node.get('Names'));
  if (Array.isArray(entries)) {
    for (let i = 0; i + 1 < entries.length; i += 2) {
      const key = doc.resolve(entries[i]);
      if (key instanceof PdfString) into.set(keyOf(key), entries[i + 1]);
    }
  }

  const kids = doc.resolve(node.get('Kids'));
  if (Array.isArray(kids)) {
    for (const kid of kids) walkNameTree(doc, doc.resolve(kid), into, depth + 1);
  }
}

/** Name tree keys are byte strings and are compared as bytes, so that is what
 *  they are keyed by here - a decode would collide two different names. */
function keyOf(value) {
  let text = '';
  for (const byte of value.bytes) text += String.fromCharCode(byte);
  return text;
}

/**
 * The page a destination lands on, as a reference into the source document.
 *
 * @param {import('./shared/pdf-reader.js').PdfDocument} doc
 * @param {*} dest the value of a /Dest, or the /D of a GoTo action
 * @param {Map<string, any>} named what namedDestinations found
 * @returns {{ref: Ref, view: any[]}|null}
 */
export function resolveDestination(doc, dest, named, depth = 0) {
  if (depth > 8) return null;

  // A name or a string: look it up, and follow it once more, because the entry
  // in the table may itself be a dictionary with the array under /D.
  if (dest instanceof Name || dest instanceof PdfString) {
    const key = dest instanceof Name ? dest.value : keyOf(dest);
    // Both tables are keyed by the same characters here - the 1.1 one by the
    // name's letters, the 1.2 one by the string's bytes - so one lookup does.
    const found = named.get(key);
    if (found === undefined) return null;
    return resolveDestination(doc, doc.resolve(found), named, depth + 1);
  }

  const value = doc.resolve(dest);
  if (value instanceof Map) {
    return resolveDestination(doc, doc.resolve(value.get('D')), named, depth + 1);
  }

  if (!Array.isArray(value) || value.length === 0) return null;

  const page = value[0];
  // An integer first entry is a page *number*, which only appears in a
  // destination that points into another file. There is no other file here.
  if (!(page instanceof Ref)) return null;

  return { ref: page, view: value.slice(1) };
}

/** True when this action is one that goes to a page in this document, rather
 *  than opening a URL, running JavaScript, or launching a file. */
export function isGoTo(doc, action) {
  return action instanceof Map && isName(doc.resolve(action.get('S')), 'GoTo');
}
