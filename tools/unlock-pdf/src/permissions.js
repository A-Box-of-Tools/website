/**
 * /P, the field that decides what a well-behaved reader will let you do.
 *
 * Thirty-two bits, of which eight mean anything, and they are numbered from 1
 * in the specification while JavaScript numbers them from 0 - so every entry
 * below carries the specification's bit number and the mask is worked out from
 * it. Writing the masks out by hand is how an implementation ends up refusing
 * to print a document that allowed it.
 *
 * The sense is inverted from what people expect: a bit that is *set* means the
 * thing is permitted. The unused bits are required to be 1, which is why a
 * document with no restrictions at all has a /P of -1 or -4 and why the number
 * shown in other tools is usually a large negative one.
 *
 * Three of them only exist from revision 3, and one - extracting text for a
 * screen reader - was deprecated outright in PDF 2.0, on the grounds that no
 * document should have been able to forbid it in the first place. It is
 * reported when a file still sets it, because the file still says it and the
 * page's job is to say what the file said.
 */

/**
 * @typedef {object} Permission
 * @property {string} id      the phrase key naming it on the page
 * @property {number} bit     the specification's bit number, counting from 1
 * @property {number} since   the earliest revision that defines it
 * @property {boolean} allowed
 */

const BITS = [
  { id: 'perm.print', bit: 3, since: 2 },
  { id: 'perm.modify', bit: 4, since: 2 },
  { id: 'perm.copy', bit: 5, since: 2 },
  { id: 'perm.annotate', bit: 6, since: 2 },
  { id: 'perm.forms', bit: 9, since: 3 },
  { id: 'perm.accessibility', bit: 10, since: 3 },
  { id: 'perm.assemble', bit: 11, since: 3 },
  { id: 'perm.printhq', bit: 12, since: 3 },
];

/**
 * Read /P as the list of things this document has an opinion about.
 *
 * @param {number} p the /P entry, which is a signed 32-bit integer
 * @param {number} revision the /R entry
 * @returns {Permission[]} in the order the page lists them
 */
export function permissionsIn(p, revision) {
  const bits = p | 0;

  return BITS
    .filter((entry) => revision >= entry.since)
    .map((entry) => ({
      ...entry,
      allowed: (bits & (1 << (entry.bit - 1))) !== 0,
    }));
}

/** Just the ones the document asked readers to refuse. */
export function refusedIn(permissions) {
  return permissions.filter((entry) => !entry.allowed);
}
