/**
 * The five algorithms, and reading a file through them.
 *
 * WHY crypto.subtle IS NOT USED
 *
 * The browser ships four of these already: crypto.subtle.digest does SHA-1,
 * SHA-256, SHA-384 and SHA-512, in native code, several times faster than
 * anything on this page. It is not used, and the reason is its signature. It
 * takes a BufferSource - one buffer, the whole message, in memory at once - and
 * there is no way to feed it a file in pieces. WebCrypto has no incremental
 * digest and never has; the proposal for one has sat unimplemented for years.
 *
 * So using it would mean reading the whole file into memory first, and the size
 * of the file you can check would become the size of the buffer this browser
 * will give a tab. On a phone that is a few hundred megabytes, and the file
 * people most want to check is a disk image. The tool would fail on exactly its
 * best use.
 *
 * Reading in chunks removes that ceiling entirely: memory here is one chunk and
 * a few hundred bytes of state, whether the file is four kilobytes or forty
 * gigabytes. The cost is that the compression functions are written out in
 * JavaScript, which runs at roughly a third of native speed. That is the trade,
 * and it is made in favour of the tool working at all.
 *
 * MD5 was never on offer either way. crypto.subtle does not implement it, on
 * the sound grounds that nothing new should use it - and half the download
 * pages on the internet still print one.
 */

import { md5 } from './md5.js';
import { sha1 } from './sha1.js';
import { sha256 } from './sha256.js';
import { sha384, sha512 } from './sha512.js';

/**
 * Every algorithm this tool knows, by the id the markup uses.
 *
 * `tag` is the name in a BSD-style checksum line - `SHA256 (disk.iso) = ...` -
 * which is what the saved file is written in and what a pasted one is read as.
 * It is a format identifier rather than a label, which is why it is here and
 * the visible names are in body.html where a translation can reach them.
 */
export const ALGORITHMS = {
  md5: { create: md5, tag: 'MD5', hex: 32 },
  sha1: { create: sha1, tag: 'SHA1', hex: 40 },
  sha256: { create: sha256, tag: 'SHA256', hex: 64 },
  sha384: { create: sha384, tag: 'SHA384', hex: 96 },
  sha512: { create: sha512, tag: 'SHA512', hex: 128 },
};

/** The order the page shows them in, weakest first, which is also oldest first. */
export const ORDER = ['md5', 'sha1', 'sha256', 'sha384', 'sha512'];

/**
 * How much is read at a time.
 *
 * Four megabytes is about fifty milliseconds of hashing, which is short enough
 * that the progress bar keeps moving and the Stop button keeps answering, and
 * long enough that the per-chunk overhead is nothing. Bigger chunks are not
 * faster in any measurable way and do make the page stutter.
 */
export const CHUNK = 4 * 1024 * 1024;

/** Thrown when the Stop button was pressed. Not an error worth reporting as one. */
export class Stopped extends Error {}

/** Thrown when the file could not be read to the end - see below. */
export class Unreadable extends Error {}

/** Bytes as lower-case hex, which is what every checksum published anywhere is in. */
export function hex(bytes) {
  let out = '';
  for (let i = 0; i < bytes.length; i += 1) out += bytes[i].toString(16).padStart(2, '0');
  return out;
}

/**
 * Run a file through one or more algorithms in a single pass.
 *
 * The file is never held whole. Each slice is read, handed to every running
 * algorithm, and dropped, so asking for five digests costs one read of the disk
 * rather than five - which matters, because the disk is usually the slower half.
 *
 * @param {Blob} file            what to read; a File is a Blob
 * @param {string[]} ids         which algorithms, by their key in ALGORITHMS
 * @param {object} [options]
 * @param {(done: number, total: number) => void} [options.onProgress]
 * @param {AbortSignal} [options.signal]
 * @param {number} [options.chunkSize]
 * @returns {Promise<Record<string, string>>}  id to lower-case hex digest
 */
export async function hashFile(file, ids, { onProgress, signal, chunkSize = CHUNK } = {}) {
  const running = ids.map((id) => ({ id, state: ALGORITHMS[id].create() }));
  const total = file.size;
  let at = 0;

  onProgress?.(0, total);

  while (at < total) {
    if (signal?.aborted) throw new Stopped('stopped');

    let bytes;
    try {
      bytes = new Uint8Array(await file.slice(at, Math.min(at + chunkSize, total)).arrayBuffer());
    } catch (error) {
      // A File is a reference to something on disk, not a copy of it. Edit,
      // move or unplug the file half way through and this is where it shows up.
      // A digest of the first half of a file is worse than no digest at all, so
      // it is thrown away rather than reported.
      throw new Unreadable(error?.message ?? 'the file could not be read');
    }

    // The same case again, arriving quietly: the file shrank, so the slice came
    // back short or empty. Without this the loop would never reach the end.
    if (bytes.length === 0) throw new Unreadable('the file ended sooner than its size said');

    for (const one of running) one.state.update(bytes);
    at += bytes.length;
    onProgress?.(at, total);
  }

  const out = {};
  for (const one of running) out[one.id] = hex(one.state.digest());
  return out;
}
