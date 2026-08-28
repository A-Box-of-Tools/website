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

  // A row names a phrase rather than carrying a sentence: this module is
  // copied byte for byte into fifteen languages, so the words live in the
  // tool's body.html and whoever shows a row resolves them.
  const rows = [
    { key: 'header', bytes: HEADER_BYTES },
    {
      key: 'global',
      bytes: gif.globalPalette ? gif.globalPalette.bytes : 0,
      note: gif.globalPalette ? 'budget.global.note' : 'budget.global.none',
      values: gif.globalPalette ? { colours: gif.globalPalette.count } : undefined,
    },
    { key: 'local', bytes: localTables },
    { key: 'control', bytes: controls },
    { key: 'descriptor', bytes: descriptors },
    { key: 'pixels', bytes: pixels },
    { key: 'framing', bytes: framing },
    { key: 'metadata', bytes: metadata },
    { key: 'trailer', bytes: gif.trailerAt >= 0 ? 1 : 0 },
    { key: 'after', bytes: gif.trailingBytes },
  ];

  const accounted = rows.reduce((sum, row) => sum + row.bytes, 0);
  const missing = gif.size - accounted;
  if (missing !== 0) {
    rows.push({
      key: missing > 0 ? 'unaccounted' : 'twice',
      bytes: Math.abs(missing),
    });
  }

  // Every row's words come from its key; the two that vary say so themselves.
  for (const row of rows) {
    row.share = gif.size > 0 ? row.bytes / gif.size : 0;
    row.label = `budget.${row.key}.label`;
    row.note ??= `budget.${row.key}.note`;
  }

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
