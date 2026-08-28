/**
 * The text that is not on any page.
 *
 * A word can be removed from every content stream in a document and still be
 * sitting in four other places, all of which a reader will show, search or
 * copy:
 *
 *   - the title and author in /Info, and the same again in the XMP packet;
 *   - a bookmark, which is a line of text with a page number attached;
 *   - what somebody typed into a form field, which lives in /V as well as in
 *     the appearance stream that draws it;
 *   - a comment, a sticky note, the /Alt text a screen reader is given, and
 *     the /ActualText a reader copies *instead of* the glyphs.
 *
 * That last one is the trap worth naming. /ActualText exists so that a
 * ligature, a hyphenated line break or a decorative capital can copy as the
 * word it stands for, which means a document is allowed to say "the glyphs
 * here spell this" - and a redaction that removed only the glyphs would leave
 * the sentence intact for anyone who selected the paragraph and pressed copy.
 *
 * WHICH STRINGS ARE TOUCHED, AND WHY NOT ALL OF THEM
 *
 * A named list, not every string in the file. Most strings in a PDF are not
 * text: they are dates, identifiers, hashes, colour-space tables, the bytes of
 * a CMap. Rewriting one of those because it happened to contain the letters
 * being removed would corrupt something for no gain, so the keys below are the
 * ones the specification defines as *text strings* and that a person can
 * actually read back out.
 */

import { PdfStream, PdfString } from './objects.js';

/**
 * Keys whose value is text a reader will show.
 *
 * `T` is the exception with a condition on it: on a comment it is the author's
 * name, which is exactly the kind of thing being removed, and on a form field
 * it is the field's *identifier*, which other objects refer to by name. The
 * check below tells them apart.
 */
const TEXT_KEYS = [
  'Title', 'Author', 'Subject', 'Keywords', 'Creator', 'Producer',
  'Contents', 'RC', 'Subj', 'T', 'V', 'DV', 'TU', 'Alt', 'ActualText', 'E',
  'Desc', 'F', 'UF',
];

/** A text string as characters. UTF-16 when it says so, and otherwise the
 *  byte-per-character encoding that covers everything else a reader meets. */
export function decodeText(bytes) {
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
 * And back again, always as UTF-16.
 *
 * A string that has had something cut out of it is rewritten rather than
 * patched, and rewriting it in the encoding it arrived in would mean deciding
 * whether every surviving character still fits. UTF-16 with the mark in front
 * of it is legal wherever a text string is legal and can hold anything.
 */
export function encodeText(text) {
  const out = new Uint8Array(2 + text.length * 2);
  out[0] = 0xfe;
  out[1] = 0xff;
  for (let at = 0; at < text.length; at += 1) {
    const code = text.charCodeAt(at);
    out[2 + at * 2] = (code >> 8) & 0xff;
    out[3 + at * 2] = code & 0xff;
  }
  return out;
}

/**
 * Run `remove` over every text string in the document.
 *
 * @param {import('./reader.js').PdfDocument} doc
 * @param {(text: string) => string} remove
 * @returns {{changed: number, where: string[]}}
 */
export function scrubStrings(doc, remove) {
  let changed = 0;
  const where = new Set();

  for (const value of doc.objects.values()) {
    const dict = value instanceof PdfStream ? value.dict : value;
    if (!(dict instanceof Map)) continue;

    for (const key of TEXT_KEYS) {
      const item = dict.get(key);
      if (!(item instanceof PdfString)) continue;
      if (key === 'T' && isFieldName(dict)) continue;

      const before = decodeText(item.bytes);
      const after = remove(before);
      if (after === before) continue;

      dict.set(key, new PdfString(encodeText(after)));
      changed += 1;
      where.add(describe(key));
    }
  }

  return { changed, where: [...where] };
}

/** True when this dictionary is a form field, where /T names the field for
 *  other objects to find rather than saying anything about a person. */
function isFieldName(dict) {
  return dict.has('FT') || dict.has('Ff') || dict.has('Kids');
}

/**
 * Where a string was found, as a phrase key.
 *
 * A key rather than the words: this module is copied byte for byte into
 * fifteen languages, and main.js is the only place a phrase can be read.
 */
function describe(key) {
  if (key === 'V' || key === 'DV' || key === 'TU') return 'where.field';
  if (key === 'Contents' || key === 'RC' || key === 'Subj' || key === 'T') {
    return 'where.comment';
  }
  if (key === 'ActualText' || key === 'Alt' || key === 'E') return 'where.actualtext';
  if (key === 'F' || key === 'UF' || key === 'Desc') return 'where.attachment';
  return 'where.properties';
}

/**
 * Every text string in the document, for the check at the end.
 *
 * Deliberately wider than the list that gets scrubbed: this is what a reader
 * could show, and the point of reading it back is to find text that survived
 * somewhere nothing thought to look.
 */
export function harvestStrings(doc) {
  const found = [];

  const visit = (value, depth) => {
    if (depth > 32) return;
    if (value instanceof PdfString) {
      const text = decodeText(value.bytes);
      if (text.trim()) found.push(text);
      return;
    }
    if (Array.isArray(value)) {
      for (const item of value) visit(item, depth + 1);
      return;
    }
    const dict = value instanceof PdfStream ? value.dict : value;
    if (dict instanceof Map) {
      for (const [key, item] of dict) {
        // Not the identifiers and dates, which are strings and are not text,
        // and would otherwise fill the check with noise.
        if (key === 'ID' || key === 'O' || key === 'U') continue;
        visit(item, depth + 1);
      }
    }
  };

  for (const value of doc.objects.values()) visit(value, 0);
  return found;
}

/**
 * Things a redacted document should not be carrying out of its old life.
 *
 * Not text, so nothing above can search them. An attachment is a whole file
 * inside this one and could be anything at all; an action that runs JavaScript
 * can carry a copy of anything at all as well, and neither is needed in order
 * to read a document. The XMP packet and /Info are taken out by
 * `stripMetadata` in writer.js, which the compressor already had.
 *
 * @returns {{attachments: number, actions: number}}
 */
export function removeCarriedFiles(doc) {
  let attachments = 0;
  let actions = 0;

  for (const value of doc.objects.values()) {
    const dict = value instanceof PdfStream ? value.dict : value;
    if (!(dict instanceof Map)) continue;

    if (dict.has('EF')) {
      dict.delete('EF');
      attachments += 1;
    }
    if (dict.has('EmbeddedFiles')) {
      dict.delete('EmbeddedFiles');
      attachments += 1;
    }
    for (const key of ['JS', 'OpenAction', 'AA']) {
      if (dict.has(key)) {
        dict.delete(key);
        actions += 1;
      }
    }
  }

  const names = doc.get(doc.catalog, 'Names');
  if (names instanceof Map && names.has('JavaScript')) {
    names.delete('JavaScript');
    actions += 1;
  }

  return { attachments, actions };
}
