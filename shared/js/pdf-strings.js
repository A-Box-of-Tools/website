/**
 * A PDF text string, as characters and back again.
 *
 * Two functions, because the encoding is not a property of the document but of
 * each individual string: a string is UTF-16 when it starts with a byte order
 * mark and PDFDocEncoding - near enough Latin-1 for anything a reader will
 * show - when it does not. Everything that reads words out of a PDF meets
 * this, whether the words came off a page, out of a bookmark or out of a form
 * field, so it sits below all of them rather than inside any one.
 *
 * GENERATED INTO EACH TOOL. This file lives at shared/js/pdf-strings.js and
 * the build copies it to <tool>/src/shared/pdf-strings.js.
 */

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
