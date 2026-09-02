/**
 * Opening the finished file and looking for the words again.
 *
 * Everything up to this point is this tool's own code reporting on its own
 * work: the glyphs were cut, the streams were spliced, the file was written.
 * None of that is evidence, and for this particular job the difference matters
 * more than it does anywhere else on this site - a document that merely looks
 * redacted is the exact failure the tool exists to prevent, and it is a
 * failure nobody notices until somebody else finds the text.
 *
 * So the bytes that are about to be offered as a download are handed back to
 * the reader as though a stranger had sent them, every page is walked again by
 * the same extractor, every text string in the file is collected, and the words
 * that were supposed to have gone are searched for. If any of them is still
 * there the run is reported as failed and there is no download.
 *
 * WHAT "GONE" MEANS WHEN NOT EVERY OCCURRENCE WAS CHOSEN
 *
 * Somebody may remove one "Smith" of twelve. The check is therefore against a
 * count rather than against zero: the finished file must contain at most what
 * it started with less what was taken out. When every occurrence was chosen -
 * which is the ordinary case, and the one the page recommends - that number is
 * zero, and the tool can say the strongest thing it is able to say about a
 * file: this word is not in it.
 */

import { PdfDocument } from './shared/pdf-reader.js';
import { harvestStrings } from './strings.js';
import { pagesOf, readPage } from './text.js';

/**
 * Everything a reader could get out of a document as text.
 *
 * The pages, and then every text string in the object graph - a bookmark, a
 * comment, a form field, the document properties. Both halves matter: a word
 * that survives in either is a word that survives.
 *
 * @param {import('./shared/pdf-reader.js').PdfDocument} doc
 * @param {import('./text.js').Page[]} [pages] already read, to save reading again
 * @returns {Promise<string>}
 */
export async function harvestAll(doc, pages = null) {
  const read = pages ?? await Promise.all(
    pagesOf(doc).map((page, index) => readPage(doc, page, index + 1)),
  );

  const parts = read.map((page) => page.text);

  // The /ActualText and /Alt written into a content stream rather than into an
  // object, which the string walk below cannot see.
  for (const page of read) {
    for (const mark of page.marked ?? []) {
      for (const key of ['ActualText', 'Alt']) {
        const value = mark.dict.get(key);
        if (value?.bytes) parts.push(textOf(value.bytes));
      }
    }
  }

  parts.push(...harvestStrings(doc));
  return parts.join('\n');
}

/** A string's characters, both spellings. The same rule as strings.js, kept
 *  here so that the check does not depend on the module it is checking. */
function textOf(bytes) {
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    let text = '';
    for (let at = 2; at + 1 < bytes.length; at += 2) {
      text += String.fromCharCode((bytes[at] << 8) | bytes[at + 1]);
    }
    return text;
  }
  let text = '';
  for (const byte of bytes) text += String.fromCharCode(byte);
  return text;
}

/**
 * Read the finished file back and count what is left.
 *
 * @param {Uint8Array} bytes  the document that was just written
 * @param {{text: string, terms: {text: string, removed: number}[],
 *          pages: number}} expected
 * @returns {Promise<{ok: boolean, pages: number, terms: object[],
 *                    problem: string}>}
 */
export async function verify(bytes, expected) {
  const doc = await PdfDocument.open(bytes);
  const pages = pagesOf(doc);
  const read = await Promise.all(
    pages.map((page, index) => readPage(doc, page, index + 1)),
  );
  const after = await harvestAll(doc, read);

  const terms = expected.terms.map((term) => {
    const was = countOf(expected.text, term.text);
    const now = countOf(after, term.text);
    return {
      text: term.text,
      was,
      now,
      removed: term.removed,
      // More may have gone than was ticked - a header drawn by one shared
      // block appears on every page that draws it - and that is not a failure.
      ok: now <= Math.max(0, was - term.removed),
    };
  });

  const survived = terms.filter((term) => !term.ok);
  const problem = problemWith(survived, pages.length, expected.pages);

  return {
    ok: !problem,
    pages: pages.length,
    terms,
    survived,
    problem,
  };
}

/** The one sentence the caller shows when the check fails, as a key rather
 *  than as English: a sentence a visitor reads does not live in here. */
function problemWith(survived, found, expected) {
  if (found !== expected) return 'check.pages';
  if (survived.length) return 'check.survived';
  return '';
}

/**
 * How many times a piece of text appears, ignoring case and treating any run
 * of spaces as one.
 *
 * The whitespace part is not fussiness. A line break in the middle of an
 * address, or the space a PDF implies by moving the pen rather than by drawing
 * one, is a difference between the same words written twice - and a check that
 * missed a survivor because it was spelled with two spaces would be worse than
 * no check at all.
 */
export function countOf(haystack, needle) {
  const target = normalise(needle);
  if (!target) return 0;

  const text = normalise(haystack);
  let count = 0;
  for (let at = text.indexOf(target); at >= 0; at = text.indexOf(target, at + target.length)) {
    count += 1;
  }
  return count;
}

function normalise(text) {
  return text.replace(/\s+/g, ' ').trim().toLowerCase();
}
