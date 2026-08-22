/**
 * Where the bytes went.
 *
 * Every byte of the file is put in exactly one bucket, and the buckets are then
 * checked against the file's own length. That check is the point of this file
 * rather than a precaution: a breakdown that does not add up is a breakdown
 * that is wrong somewhere, and the honest thing to do with the remainder is
 * show it as a row called "not accounted for" rather than silently normalise
 * the percentages so the bar still reaches the end.
 *
 * The buckets are the ones somebody can act on. "Compressed pixels" is the
 * number that is supposed to be large. "Colour tables" is the one that is
 * quietly enormous on a file with a palette per frame - 768 bytes each, which
 * is more than a small frame's pixels. "Block framing" is the length byte every
 * 255 bytes, which nobody thinks about and which a GIF of a thousand tiny
 * frames spends real money on. And "metadata" is the forty kilobytes of XMP
 * that an image editor left behind, which is the single best answer this tool
 * ever gives to "why is this file so big".
 */

import { HEADER_BYTES } from './gif.js';

/**
 * @param {object} gif  as returned by parseGif
 * @returns {{total: number, accounted: number, rows: object[]}}
 */
export function budget(gif) {
  let controls = 0;
  let descriptors = 0;
  let localTables = 0;
  let pixels = 0;
  let framing = 0;

  for (const frame of gif.frames) {
    if (frame.control) controls += frame.control.bytes;
    // The ten bytes of the image descriptor, plus the one byte of LZW code size
    // that sits between the colour table and the data.
    descriptors += 11;
    if (frame.palette) localTables += frame.palette.bytes;
    pixels += frame.payloadBytes;
    framing += frame.framingBytes;
  }

  let metadata = 0;
  for (const extension of gif.extensions) metadata += extension.bytes;

  const rows = [
    {
      key: 'header',
      label: 'Header and screen descriptor',
      bytes: HEADER_BYTES,
      note: 'The signature, the canvas size, and the flags. Thirteen bytes, in every GIF ever made.',
    },
    {
      key: 'global',
      label: 'Global colour table',
      bytes: gif.globalPalette ? gif.globalPalette.bytes : 0,
      note: gif.globalPalette
        ? `${gif.globalPalette.count} colours at three bytes each, shared by every frame that does not bring its own.`
        : 'This file has none: every frame carries its own palette.',
    },
    {
      key: 'local',
      label: 'Per-frame colour tables',
      bytes: localTables,
      note: 'A palette of its own for a frame that needed different colours. Three bytes a colour, every time.',
    },
    {
      key: 'control',
      label: 'Frame timing blocks',
      bytes: controls,
      note: 'Eight bytes per frame: the delay, the disposal method, and which colour is transparent.',
    },
    {
      key: 'descriptor',
      label: 'Frame descriptors',
      bytes: descriptors,
      note: 'Eleven bytes per frame: where the rectangle sits, how big it is, and the compressor’s starting code size.',
    },
    {
      key: 'pixels',
      label: 'Compressed pixels',
      bytes: pixels,
      note: 'The picture itself, LZW-compressed. On a healthy GIF this is nearly all of the file.',
    },
    {
      key: 'framing',
      label: 'Block framing',
      bytes: framing,
      note: 'One length byte for every 255 bytes of data, plus a zero to end each run. Unavoidable, and worth seeing.',
    },
    {
      key: 'metadata',
      label: 'Comments and metadata',
      bytes: metadata,
      note: 'Loop blocks, comments, colour profiles, and any XMP an editor left behind.',
    },
    {
      key: 'trailer',
      label: 'Trailer',
      bytes: gif.trailerAt >= 0 ? 1 : 0,
      note: 'One byte saying the file is over.',
    },
    {
      key: 'after',
      label: 'Bytes after the end',
      bytes: gif.trailingBytes,
      note: 'Data sitting past the trailer. No decoder reads it, and it is pure weight.',
    },
  ];

  const accounted = rows.reduce((sum, row) => sum + row.bytes, 0);
  const missing = gif.size - accounted;
  if (missing !== 0) {
    rows.push({
      key: 'unaccounted',
      label: missing > 0 ? 'Not accounted for' : 'Counted twice',
      bytes: Math.abs(missing),
      note: missing > 0
        ? 'Bytes inside blocks this reader stopped at. A file that ends mid-block leaves some.'
        : 'The blocks overlap, which means this file disagrees with itself about where they start.',
    });
  }

  for (const row of rows) row.share = gif.size > 0 ? row.bytes / gif.size : 0;

  return { total: gif.size, accounted, rows };
}

/**
 * What a colour table costs against what it carries.
 *
 * A palette is a fixed 3 x 2^n bytes whatever is in it, and encoders round up:
 * a frame using nine colours still gets a 16-entry table, and one using 130
 * still gets 256. The waste is small per frame and is not small at all across
 * three hundred of them, which is why this is worth a number rather than a
 * shrug.
 *
 * @param {object[]} used  one `used` array per frame, from paintFrame
 */
export function paletteWaste(gif, used) {
  let declared = 0;
  let referenced = 0;

  // A frame with a table of its own pays for that table by itself.
  for (const [index, frame] of gif.frames.entries()) {
    if (!frame.palette || !used[index]) continue;
    declared += frame.palette.count;
    referenced += count(used[index], frame.palette.count);
  }

  // The global table is written once however many frames share it, so it is
  // counted once, against the union of every index any of them referred to.
  if (gif.globalPalette) {
    declared += gif.globalPalette.count;
    const union = new Uint8Array(256);
    for (const [index, frame] of gif.frames.entries()) {
      if (frame.palette || !used[index]) continue;
      for (let i = 0; i < 256; i += 1) if (used[index][i]) union[i] = 1;
    }
    referenced += count(union, gif.globalPalette.count);
  }

  return {
    declared,
    referenced,
    wastedEntries: Math.max(0, declared - referenced),
    wastedBytes: Math.max(0, declared - referenced) * 3,
  };
}

const count = (flags, limit) => {
  let total = 0;
  for (let i = 0; i < limit; i += 1) if (flags[i]) total += 1;
  return total;
};

/**
 * Every distinct colour the animation actually draws with.
 *
 * Not the sum of the palette sizes: a GIF with twenty frames each carrying 256
 * colours does not have 5,120 colours in it, it has however many different ones
 * the tables between them name. That number is what says whether the file is a
 * photograph fighting the format or a cartoon comfortably inside it.
 */
export function distinctColors(gif, used) {
  const seen = new Set();
  for (const [index, frame] of gif.frames.entries()) {
    const palette = frame.palette ?? gif.globalPalette;
    if (!palette) continue;
    const flags = used[index];
    for (let i = 0; i < palette.count; i += 1) {
      if (flags && !flags[i]) continue;
      const at = i * 3;
      seen.add((palette.colors[at] << 16) | (palette.colors[at + 1] << 8) | palette.colors[at + 2]);
    }
  }
  return seen;
}
