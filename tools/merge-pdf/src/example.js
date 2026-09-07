/**
 * The documents behind the "Try an example" button.
 *
 * Three of them, of three, four and five pages, because everything this tool
 * does is about which page ended up where - and that is unanswerable against
 * one document, or against pages that look alike. Every page here carries its
 * number in 96pt down at the foot, so a merge, a reorder or a split can be
 * checked by looking rather than by opening a reader.
 */

import { examplePdfFile } from './shared/example-pdf.js';

export function makeExample() {
  return [
    examplePdfFile('example-a.pdf', { pages: 3 }),
    examplePdfFile('example-b.pdf', { pages: 4 }),
    examplePdfFile('example-c.pdf', { pages: 5 }),
  ];
}
