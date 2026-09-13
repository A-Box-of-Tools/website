/**
 * The file behind the "Try an example" button: an ordinary document.
 *
 * A stamp goes on to a page that has something on it, so what the example
 * needs is a document with pages worth stamping and nothing else. That is
 * the statement shared/js/example-pdf.js writes for every PDF tool on the
 * site, built in the page for the reason at the top of
 * shared/js/example-photo.js: the page's own policy forbids a fetch, and an
 * example that arrives as a file the visitor could have chosen is the honest
 * kind.
 *
 * Three pages rather than the two the other tools ask for, because the
 * thing this page proves is "every page", and "first page only" leaves
 * something behind to be visibly left alone. That is also what tells this
 * file apart from the protector's, which asks for the same statement:
 * tests/python/test_duplicates.py refuses two tools carrying one module,
 * and a copy that differs only in its comments is still a copy.
 */

import { examplePdfFile } from './shared/example-pdf.js';

/**
 * @param {string} name the filename the picker will show
 * @returns {File}
 */
export function makeExample(name = 'statement.pdf') {
  return examplePdfFile(name, { pages: 3 });
}
