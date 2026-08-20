/**
 * CRC-32, the one from the PNG and ZIP specifications - they use the same
 * polynomial, so both callers share this.
 *
 * The table is built on first use rather than written out as a 256-entry
 * literal. Generated tables are unreadable either way, and this version can be
 * checked against the specification by eye.
 */

let table = null;

function build() {
  table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    table[n] = c >>> 0;
  }
}

/**
 * @param {Uint8Array[]} parts checksummed as if they were one run of bytes
 * @returns {number} unsigned 32-bit
 */
export function crc32(parts) {
  if (!table) build();
  let c = 0xffffffff;
  for (const part of parts) {
    for (let i = 0; i < part.length; i += 1) c = table[(c ^ part[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}
