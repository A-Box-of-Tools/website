/**
 * Every export starts from the original bytes and the cipher already derived.
 * Removing metadata edits a document in place; keeping it on a later run must
 * not depend on whether an earlier export succeeded or was cancelled. Reusing
 * the proven cipher avoids asking for or retaining another password value.
 */
import { PdfDocument } from './shared/pdf-reader.js';

export function documentForExport(input) {
  const bytes = input.bytes;
  const cipher = input.doc.crypt;
  return PdfDocument.open(bytes, { unlock: () => cipher });
}
