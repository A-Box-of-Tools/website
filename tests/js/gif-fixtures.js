/**
 * A GIF reader, for the tests of the GIF writer.
 *
 * Written from the GIF89a specification rather than from the writer it checks,
 * and deliberately literal about the format's shape - a header, a screen
 * descriptor, a colour table whose length is a power of two, then a stream of
 * blocks - because that shape is the thing under test. A fixture of expected
 * bytes would pass whatever the writer did as long as it kept doing it; a
 * parser fails when a field moves.
 *
 * It reads the parts this repository writes and skips the rest: there is no
 * plain-text extension, no comment block and no interlacing here, so those are
 * stepped over rather than understood.
 */

import assert from 'node:assert/strict';

const latin1 = new TextDecoder('latin1');

/**
 * @param {Uint8Array} bytes
 * @returns {{width: number, height: number, tableSize: number,
 *            palette: Uint8Array, loop: number|null, frames: object[]}}
 */
export function parseGif(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  assert.equal(latin1.decode(bytes.subarray(0, 6)), 'GIF89a');

  const packed = bytes[10];
  const tableSize = 1 << ((packed & 7) + 1);
  const out = {
    width: view.getUint16(6, true),
    height: view.getUint16(8, true),
    hasGlobalTable: Boolean(packed & 0x80),
    tableSize,
    palette: bytes.subarray(13, 13 + tableSize * 3),
    loop: null,
    trailerAt: -1,
    frames: [],
  };

  let at = 13 + tableSize * 3;
  /** The graphic control block in front of the next image, if there was one. */
  let control = null;

  const skipBlocks = () => {
    while (bytes[at]) at += bytes[at] + 1;
    at += 1;
  };

  while (at < bytes.length) {
    const marker = bytes[at];

    if (marker === 0x3b) {
      out.trailerAt = at;
      break;
    }

    if (marker === 0x21) {
      const label = bytes[at + 1];
      at += 2;
      if (label === 0xf9) {
        assert.equal(bytes[at], 4, 'a graphic control block is four bytes long');
        control = {
          disposal: (bytes[at + 1] >> 2) & 7,
          hasTransparent: Boolean(bytes[at + 1] & 1),
          delay: view.getUint16(at + 2, true),
          transparent: bytes[at + 4],
        };
        at += 5;
        assert.equal(bytes[at], 0, 'and is terminated');
        at += 1;
      } else if (label === 0xff) {
        const size = bytes[at];
        const name = latin1.decode(bytes.subarray(at + 1, at + 12));
        at += 1 + size;
        if (name === 'NETSCAPE2.0') out.loop = view.getUint16(at + 2, true);
        skipBlocks();
      } else {
        at += 1;
        skipBlocks();
      }
      continue;
    }

    if (marker === 0x2c) {
      const frame = {
        x: view.getUint16(at + 1, true),
        y: view.getUint16(at + 3, true),
        width: view.getUint16(at + 5, true),
        height: view.getUint16(at + 7, true),
        localTable: Boolean(bytes[at + 9] & 0x80),
        control,
      };
      at += 10;
      frame.minCodeSize = bytes[at];
      at += 1;
      const from = at;
      skipBlocks();
      frame.dataLength = at - from;
      out.frames.push(frame);
      control = null;
      continue;
    }

    throw new Error(`unknown block 0x${marker.toString(16)} at ${at}`);
  }

  return out;
}

/** A frame of flat colour, four bytes a pixel, as the encoder expects them. */
export function flatFrame(width, height, [r, g, b]) {
  const rgba = new Uint8ClampedArray(width * height * 4);
  for (let at = 0; at < rgba.length; at += 4) {
    rgba[at] = r;
    rgba[at + 1] = g;
    rgba[at + 2] = b;
    rgba[at + 3] = 255;
  }
  return rgba;
}
