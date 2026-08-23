/**
 * Reading whatever was pasted into the box, and deciding whether it matches.
 *
 * There is no single format for a published checksum. A release page might give
 * you a bare string of hex, or the output of sha256sum, or the BSD form with the
 * algorithm named in front, or a whole SHA256SUMS file with forty lines in it,
 * or a subresource-integrity attribute out of an HTML tag - and people paste all
 * of them, sometimes with the surrounding sentence still attached.
 *
 * Asking a visitor which one they have would be asking them to know. So this
 * reads all of them, and identifies the algorithm from the length of the digest
 * rather than from anything the paste claims: 32 hex characters is an MD5, 64 is
 * a SHA-256, and no two of the five are the same length. That is also what makes
 * the box work before a file is chosen - paste first, and the page can tick the
 * right algorithm before it has read a byte.
 */

import { ALGORITHMS, ORDER } from './hash.js';

/** Digest length in hex characters to the algorithm that has it. */
const BY_LENGTH = new Map(ORDER.map((id) => [ALGORITHMS[id].hex, id]));

/** `SHA256 (disk.iso) = abc123...` - the BSD form, and what `shasum --tag` writes. */
const TAGGED = /^[^\S\n]*[A-Za-z0-9-]+[^\S\n]*\(([^)]*)\)[^\S\n]*=[^\S\n]*([0-9a-fA-F]+)[^\S\n]*$/;

/** `abc123...  disk.iso` - the GNU form, where the star means "read as binary". */
const GNU = /^[^\S\n]*([0-9a-fA-F]{16,160})[^\S\n]+[*?^ ]?[^\S\n]*(\S.*?)[^\S\n]*$/;

/** `sha384-Base64==` - subresource integrity, as pasted out of a script tag. */
const SRI = /\b(sha256|sha384|sha512)-([A-Za-z0-9+/]{20,}={0,2})/;

/** Any run of hex long enough to be worth complaining about if it is the wrong length. */
const HEX_RUN = /^[0-9a-fA-F]+$/;

/**
 * @typedef {object} Expected
 * @property {string} hex        the digest, lower case
 * @property {string} algorithm  its id in ALGORITHMS
 * @property {string|null} name  the filename the line named, if it named one
 */

/**
 * Everything in a pasted blob that is a checksum, and everything that tried.
 *
 * @param {string} text
 * @returns {{entries: Expected[], strays: {hex: string}[], wrapped: boolean}}
 */
export function readExpected(text) {
  const entries = [];
  const strays = [];
  const seen = new Set();

  const take = (digest, name) => {
    const lower = digest.toLowerCase();
    const algorithm = BY_LENGTH.get(lower.length);
    if (!algorithm) {
      if (!seen.has(lower)) strays.push({ hex: lower });
      seen.add(lower);
      return;
    }
    const key = `${algorithm}:${lower}:${name ?? ''}`;
    if (seen.has(key)) return;
    seen.add(key);
    entries.push({ hex: lower, algorithm, name: name || null });
  };

  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;

    const tagged = TAGGED.exec(line);
    if (tagged) {
      take(tagged[2], tagged[1].trim());
      continue;
    }

    const sri = SRI.exec(line);
    if (sri) {
      const bytes = fromBase64(sri[2]);
      if (bytes) {
        take([...bytes].map((b) => b.toString(16).padStart(2, '0')).join(''), null);
        continue;
      }
    }

    const gnu = GNU.exec(line);
    if (gnu) {
      take(gnu[1], gnu[2]);
      continue;
    }

    // Nothing structured, so treat the line as the digest itself. A label in
    // front of it comes off - `SHA-256: abc123` is how a good many release
    // pages write one - and so does the whitespace, because a page that prints
    // its checksum in groups of eight is still printing one checksum.
    const bare = line.replace(/^[^:=]*[:=]/, '').replace(/\s+/g, '');
    if (HEX_RUN.test(bare) && bare.length >= 8) take(bare, null);
  }

  // One digest wrapped across several lines by whatever it was copied out of.
  //
  // Worth trying whenever the whole paste is nothing but hex, because the
  // ambiguous case is real and common: a SHA-512 wrapped at 64 columns is two
  // lines that are each exactly the length of a SHA-256, so reading it line by
  // line finds two checksums that were never written. The joined reading is put
  // first and the line-by-line ones are kept as well, so whichever the visitor
  // actually meant is among the candidates and the comparison decides.
  //
  // Only when nothing has a filename beside it. A SHA256SUMS file joined end to
  // end would be a digest nobody wrote.
  const joined = text.replace(/\s+/g, '');
  const wrapped = entries.length !== 1
    && entries.every((entry) => entry.name === null)
    && HEX_RUN.test(joined)
    && BY_LENGTH.has(joined.length);

  if (wrapped) {
    strays.length = 0;
    entries.unshift({ hex: joined.toLowerCase(), algorithm: BY_LENGTH.get(joined.length), name: null });
  }

  return { entries, strays, wrapped };
}

/** Base64 to bytes, or null if it was not base64 after all. */
function fromBase64(text) {
  try {
    const raw = atob(text);
    const out = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}

/** Which algorithms a paste asks for, in the page order, without repeats. */
export function algorithmsIn(entries) {
  const wanted = new Set(entries.map((entry) => entry.algorithm));
  return ORDER.filter((id) => wanted.has(id));
}

/**
 * Does what was computed match what was pasted?
 *
 * A paste with filenames in it - a SHA256SUMS file, say - is narrowed to the
 * lines naming the file that was chosen, if any of them do. Otherwise every
 * line is a candidate, which is what makes a one-line paste work without the
 * name having to agree.
 *
 * @param {Expected[]} entries      what readExpected found
 * @param {Record<string, string>} digests   what has been computed so far
 * @param {string} [fileName]       the name of the file that was chosen
 * @returns {{state: 'none'|'waiting'|'match'|'mismatch',
 *            entry?: Expected, missing?: string[], renamed?: boolean}}
 */
export function verdict(entries, digests, fileName) {
  if (!entries.length) return { state: 'none' };

  const named = fileName
    ? entries.filter((entry) => entry.name && basename(entry.name) === basename(fileName))
    : [];
  const candidates = named.length ? named : entries;

  for (const entry of candidates) {
    if (digests[entry.algorithm] === entry.hex) {
      return { state: 'match', entry, renamed: false };
    }
  }

  // A digest that matches a line naming some other file is still a match of the
  // bytes, and saying so is more useful than a bare red cross: it is what you
  // get when a mirror renamed the download.
  if (named.length) {
    for (const entry of entries) {
      if (digests[entry.algorithm] === entry.hex) {
        return { state: 'match', entry, renamed: true };
      }
    }
  }

  const missing = algorithmsIn(candidates).filter((id) => !(id in digests));
  if (missing.length) return { state: 'waiting', missing };

  return { state: 'mismatch', entry: candidates[0] };
}

/** The last path segment, so a Windows path and a URL both come down to a name. */
function basename(name) {
  return name.split(/[\/]/).pop().trim();
}
