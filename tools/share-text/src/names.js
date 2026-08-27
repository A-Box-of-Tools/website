/**
 * Link names: the code words a share is reachable at.
 *
 * A suggestion reads like a phrase - adjective, noun, number - because the
 * whole point of a code word is that it can be said across a room or read
 * over a phone. The words are deliberately not translated: a link name is an
 * address, like a slug, and the same share must be reachable by the same
 * word from every language the site is served in.
 */

const ADJECTIVES = [
  'bold', 'brave', 'bright', 'calm', 'clever', 'eager', 'gentle', 'glad',
  'golden', 'happy', 'keen', 'kind', 'lively', 'lucky', 'mellow', 'merry',
  'noble', 'proud', 'quick', 'quiet', 'sunny', 'swift', 'warm', 'witty',
];

const NOUNS = [
  'acorn', 'badger', 'comet', 'falcon', 'fern', 'harbor', 'heron', 'lagoon',
  'lantern', 'maple', 'meadow', 'otter', 'owl', 'pebble', 'pine', 'quartz',
  'reef', 'robin', 'sparrow', 'tulip', 'walnut', 'willow', 'wren', 'yarrow',
];

const pick = (list) => list[Math.floor(Math.random() * list.length)];

/** A fresh suggestion: `brave-otter-42`. */
export function makeCode() {
  return `${pick(ADJECTIVES)}-${pick(NOUNS)}-${10 + Math.floor(Math.random() * 90)}`;
}

/**
 * Fold whatever was typed to the shape the rendezvous accepts - lowercase
 * letters, digits and hyphens, at most 64 - rather than rejecting near
 * misses. `  My Secret NOTE!! ` becomes `my-secret-note`.
 */
export function normalize(raw) {
  return raw.toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64);
}

/** The pattern a code in a share link must match to be dialled at all. */
export const CODE_PATTERN = /^[a-z0-9][a-z0-9-]{0,63}$/;

/**
 * A file size a person can read. The unit names come from the caller - they
 * are words a visitor sees, so they live in the markup, not here.
 *
 * @param {number} n bytes
 * @param {{b: string, kb: string, mb: string}} units
 */
export function formatSize(n, units) {
  if (n < 1024) return `${n} ${units.b}`;
  if (n < 1048576) return `${(n / 1024).toFixed(1)} ${units.kb}`;
  return `${(n / 1048576).toFixed(1)} ${units.mb}`;
}
