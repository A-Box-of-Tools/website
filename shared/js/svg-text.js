/**
 * Text out of the bytes on disk.
 *
 * `Blob.text()` is UTF-8 and nothing else, which is right for almost every SVG
 * and wrong for the ones that matter: a file saved out of an older Windows
 * drawing program is quite often UTF-16, and Illustrator writes an XML
 * declaration naming its encoding. Decoded as UTF-8, a UTF-16 file comes back
 * as NUL bytes between every letter and the root tag is never found, so the
 * tool would say "this is not an SVG" about a perfectly good one.
 *
 * The BOM is checked first because it is definitive, then the declaration,
 * then UTF-8 - which is also what an XML parser is required to do.
 *
 * @param {ArrayBuffer|Uint8Array} buffer
 * @returns {string}
 */
export function decodeSvgText(buffer) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);

  if (bytes[0] === 0xff && bytes[1] === 0xfe) return decodeWith(bytes.subarray(2), 'utf-16le');
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return decodeWith(bytes.subarray(2), 'utf-16be');
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return decodeWith(bytes.subarray(3), 'utf-8');
  }

  // No BOM. A UTF-16 file without one still gives itself away: every other
  // byte of "<?xml" or "<svg" is a NUL.
  if (bytes[0] === 0x3c && bytes[1] === 0x00) return decodeWith(bytes, 'utf-16le');
  if (bytes[0] === 0x00 && bytes[1] === 0x3c) return decodeWith(bytes, 'utf-16be');

  // The declaration is ASCII whatever the rest of the file is, so reading the
  // first line as Latin-1 to find it is safe for any encoding that could carry
  // one at all.
  const head = decodeWith(bytes.subarray(0, 200), 'latin1');
  const declared = /<\?xml[^>]*encoding\s*=\s*["']([\w-]+)["']/i.exec(head)?.[1];
  if (declared && !/^utf-?8$/i.test(declared)) {
    try {
      return new TextDecoder(declared).decode(bytes);
    } catch {
      // An encoding this browser has never heard of. UTF-8 below is a better
      // guess than refusing the file outright.
    }
  }

  return decodeWith(bytes, 'utf-8');
}

const decodeWith = (bytes, label) => new TextDecoder(label).decode(bytes);
