/**
 * The file behind the "Try an example" button: an ordinary document.
 *
 * The unlocker next door had to build a locked file for its example, because
 * a page showing restrictions coming off has to show them coming off
 * something. This page shows them going on, so what it needs is the opposite:
 * a document with nothing on it, which is what somebody arriving here is
 * holding. shared/js/example-pdf.js already writes one - the two-page
 * statement every PDF tool on the site demonstrates on - and this asks it for
 * that and nothing more.
 *
 * Built in the page rather than fetched, for the reason at the top of
 * shared/js/example-photo.js: the page's own policy forbids a fetch, and an
 * example that arrives as a file the visitor could have chosen is the honest
 * kind.
 */

import { examplePdfFile } from './shared/example-pdf.js';

/**
 * @param {string} name the filename the picker will show
 * @returns {File}
 */
export function makeExample(name = 'statement.pdf') {
  return examplePdfFile(name, { pages: 2 });
}
