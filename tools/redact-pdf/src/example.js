/**
 * The document behind the "Try an example" button.
 *
 * A statement: dates, reference codes, two names and the amounts against them,
 * which is what people actually bring to a redactor. The text is real text and
 * not a picture of text - see shared/js/example-pdf.js - because this tool's
 * claim is that it deletes the letters from the file and then searches the
 * file to prove they are gone, and neither half of that means anything against
 * a page with no text in it.
 */

import { examplePdfFile } from './shared/example-pdf.js';

export function makeExample() {
  return examplePdfFile('example.pdf', { pages: 3 });
}
