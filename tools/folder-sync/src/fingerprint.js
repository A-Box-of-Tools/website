/**
 * Whether two files that share a size share their bytes. Writing a file is the
 * only way a web page can sync one, and writing gives it today's date, so two
 * equal copies routinely disagree about when they were last changed. Their
 * contents settle it.
 *
 * crypto.subtle digests a whole buffer at once and has no streaming form, so a
 * file is read eight megabytes at a time and the block digests are digested
 * together with the length in front. Both sides compute the same thing, which
 * is all a comparison needs; it is not the file's SHA-256 and is never shown.
 */
const BLOCK = 8 * 1024 * 1024;

const hex = (bytes) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

export async function fingerprint(file, subtle = globalThis.crypto.subtle) {
  const header = new Uint8Array(8);
  new DataView(header.buffer).setBigUint64(0, BigInt(file.size));
  const parts = [header];
  let offset = 0;
  do {
    const buffer = await file.slice(offset, offset + BLOCK).arrayBuffer();
    parts.push(new Uint8Array(await subtle.digest('SHA-256', buffer)));
    offset += BLOCK;
  } while (offset < file.size);
  const joined = new Uint8Array(parts.reduce((total, item) => total + item.length, 0));
  let at = 0;
  for (const item of parts) {
    joined.set(item, at);
    at += item.length;
  }
  return hex(new Uint8Array(await subtle.digest('SHA-256', joined)));
}
