/**
 * The bookkeeping all four of these algorithms do identically.
 *
 * MD5, SHA-1, SHA-256 and SHA-512 differ entirely in what they do to a block
 * and hardly at all in how they get one. Every one of them fills a fixed block,
 * compresses it, counts the bytes that went by, and finishes by appending a
 * 0x80 byte, some zeros and the message length in bits. Written out four times
 * that is four chances to get the carry into the second-to-last block wrong -
 * the bug that only shows up on a message whose length lands in the last nine
 * bytes of a block, which is one length in eight and therefore not something a
 * handful of test vectors would catch.
 *
 * So it is written once. What each algorithm supplies is the block size, what
 * to do with a full block, and where the length field goes: MD5 writes it
 * little-endian, the SHA family big-endian, and SHA-512 gives it sixteen bytes
 * rather than eight.
 */

/**
 * @param {number} size            bytes per block: 64, or 128 for SHA-512
 * @param {(view: DataView) => void} compress   called with each full block
 * @returns {{update: (chunk: Uint8Array) => void,
 *            finish: (lengthBytes: number,
 *                     write: (view: DataView, at: number, bytes: number) => void) => void}}
 */
export function blocks(size, compress) {
  const block = new Uint8Array(size);
  const view = new DataView(block.buffer);
  let filled = 0;
  let length = 0;

  return {
    /**
     * Take the next piece of the message. A chunk may be any size at all and
     * need not land on a block boundary, which is the whole point: the caller
     * hands over whatever it read off the disk.
     */
    update(chunk) {
      length += chunk.length;
      let at = 0;
      while (at < chunk.length) {
        const take = Math.min(size - filled, chunk.length - at);
        block.set(chunk.subarray(at, at + take), filled);
        filled += take;
        at += take;
        if (filled === size) {
          compress(view);
          filled = 0;
        }
      }
    },

    /**
     * Pad and compress what is left.
     *
     * The padding is a single 1 bit, then zeros, then the length. If the 1 bit
     * and the zeros will not fit in front of the length field, the block is
     * finished with zeros and compressed, and the length goes in a block of its
     * own - which is the case worth having written once.
     */
    finish(lengthBytes, write) {
      block[filled] = 0x80;
      filled += 1;
      if (filled > size - lengthBytes) {
        block.fill(0, filled);
        compress(view);
        filled = 0;
      }
      block.fill(0, filled);
      write(view, size - lengthBytes, length);
      compress(view);
    },
  };
}

/**
 * The message length in bits, as two 32-bit halves.
 *
 * A JavaScript number holds every integer up to 2^53 exactly, so a byte count
 * is exact up to eight petabytes and multiplying it by eight is exact up to
 * one. Neither is a file. The halves are what the padding writes, because the
 * field is 64 bits wide and there is no 32-bit way to say so.
 */
export function bitLength(bytes) {
  const bits = bytes * 8;
  return { hi: Math.floor(bits / 0x100000000), lo: bits >>> 0 };
}
