/**
 * The ICO writer.
 *
 * An .ico is a container, not a codec: a small directory followed by several
 * complete images, each one a picture of the same thing at a different size.
 * Nothing in here compresses anything. The pixels arrive already encoded -
 * either as a PNG the browser wrote, or as a raw DIB assembled below - and this
 * file is the header wrapped around them.
 *
 * That is the whole reason this tool needs no vendored encoder and no network
 * step. The one lossy part of the job, scaling a picture down, is done by the
 * browser's own canvas; see render.js.
 *
 * THE TWO WAYS AN ENTRY CAN BE STORED, AND WHY BOTH ARE HERE
 *
 * An entry is either a PNG file copied in whole, or a Windows DIB - a
 * BITMAPINFOHEADER, bottom-up BGRA rows, and a 1-bit mask. PNG entries are
 * three to ten times smaller at 256x256 and are what every modern .ico uses,
 * but Windows only learned to read them in Vista. XP, and a surprising amount
 * of installer and shell tooling that still does its own icon parsing, sees a
 * PNG entry as a corrupt one and shows nothing at all.
 *
 * So the default is neither: DIB for the small sizes, where the difference is a
 * few kilobytes nobody will notice, and PNG at 128 and above, where it is the
 * difference between a 30 KB file and a 300 KB one. That is the same split
 * every icon toolchain that has thought about it settles on, and it is a
 * setting on the page rather than a decision made quietly here.
 *
 * @see https://learn.microsoft.com/en-us/previous-versions/ms997538(v=msdn.10)
 * @see https://en.wikipedia.org/wiki/ICO_(file_format)
 */

/** No entry may be larger than this. One byte holds the side, and 0 means 256. */
export const MAX_SIDE = 256;

const ICONDIR = 6;
const ICONDIRENTRY = 16;
const DIB_HEADER = 40;

/** BI_RGB: no compression, which is the only kind a DIB in an icon may use. */
const BI_RGB = 0;

/**
 * A pixel is transparent to the 1-bit mask below this alpha, opaque at or above
 * it. The mask is what pre-Vista Windows draws through, and what a few current
 * shell surfaces still consult, so a picture with soft edges wants its cut made
 * somewhere sensible rather than at "any alpha at all".
 */
const MASK_CUTOFF = 128;

/**
 * One image inside the file.
 *
 * @typedef {object} IconEntry
 * @property {number} width  1..256
 * @property {number} height 1..256
 * @property {'png'|'bmp'} kind  how `data` is stored
 * @property {Uint8Array} data   a whole PNG file, or a DIB from `dibEntry`
 */

/**
 * Wrap the entries in an ICONDIR and hand back the file.
 *
 * Entries are written in the order given, and main.js gives them smallest
 * first. Every reader worth the name picks the size it wants out of the
 * directory, but the handful that do not take the first entry they can decode -
 * which is the 16x16 one, the size those readers were written for.
 *
 * @param {IconEntry[]} entries
 * @returns {Uint8Array}
 */
/**
 * A refusal this file wrote, rather than one the platform threw.
 *
 * The message is a phrase key and `values` fills its blanks; main.js turns the
 * pair into a sentence. A platform error coming up the same path still reads
 * as itself, because phrase() hands back a key it cannot find.
 */
function refusal(key, values) {
  const error = new Error(key);
  error.values = values;
  return error;
}

export function writeIco(entries) {
  if (!entries.length) throw refusal('ico.empty');

  for (const entry of entries) {
    if (entry.width < 1 || entry.height < 1) {
      throw refusal('ico.zero');
    }
    if (entry.width > MAX_SIDE || entry.height > MAX_SIDE) {
      throw refusal('ico.toobig', { size: `${entry.width}x${entry.height}` });
    }
  }

  const total = ICONDIR + entries.length * ICONDIRENTRY
    + entries.reduce((n, entry) => n + entry.data.length, 0);

  const out = new Uint8Array(total);
  const view = new DataView(out.buffer);

  view.setUint16(0, 0, true);              // reserved, always zero
  view.setUint16(2, 1, true);              // 1 is an icon; 2 would be a cursor
  view.setUint16(4, entries.length, true);

  let dir = ICONDIR;
  let at = ICONDIR + entries.length * ICONDIRENTRY;

  for (const entry of entries) {
    // 256 is written as 0. The field is one byte, so 256 does not fit in it,
    // and the format's answer is to let zero mean the largest size there is.
    out[dir] = entry.width % 256;
    out[dir + 1] = entry.height % 256;
    out[dir + 2] = 0;                      // palette size; zero for truecolour
    out[dir + 3] = 0;                      // reserved
    view.setUint16(dir + 4, 1, true);      // colour planes
    view.setUint16(dir + 6, 32, true);     // bits per pixel
    view.setUint32(dir + 8, entry.data.length, true);
    view.setUint32(dir + 12, at, true);

    out.set(entry.data, at);

    dir += ICONDIRENTRY;
    at += entry.data.length;
  }

  return out;
}

/**
 * Assemble one DIB entry from RGBA pixels.
 *
 * Three things about this are easy to get wrong and silently wrong, which is
 * why they are each spelled out below: the doubled height, the upside-down
 * rows, and the mask that has to be there even when it carries no information.
 *
 * @param {{width: number, height: number, data: Uint8Array|Uint8ClampedArray}} image
 *   RGBA, row-major, top row first - exactly what `ctx.getImageData` returns
 * @returns {Uint8Array} a BITMAPINFOHEADER, the pixels, and the mask
 */
export function dibEntry({ width, height, data }) {
  if (data.length !== width * height * 4) {
    throw refusal('ico.pixels');
  }

  const xorStride = width * 4;             // 32bpp rows are aligned already
  const maskStride = ((width + 31) >> 5) * 4;  // 1bpp rows, padded to 4 bytes
  const xorSize = xorStride * height;
  const maskSize = maskStride * height;

  const out = new Uint8Array(DIB_HEADER + xorSize + maskSize);
  const view = new DataView(out.buffer);

  view.setUint32(0, DIB_HEADER, true);
  view.setInt32(4, width, true);
  // Twice the real height, because the DIB in an icon holds two bitmaps stacked
  // on top of each other: the colour image, then the mask. Writing the true
  // height here is the classic bug, and it produces an icon that draws as its
  // own bottom half.
  view.setInt32(8, height * 2, true);
  view.setUint16(12, 1, true);             // planes
  view.setUint16(14, 32, true);            // bits per pixel
  view.setUint32(16, BI_RGB, true);
  view.setUint32(20, xorSize + maskSize, true);
  view.setInt32(24, 0, true);              // pixels per metre, horizontal
  view.setInt32(28, 0, true);              // and vertical
  view.setUint32(32, 0, true);             // colours used
  view.setUint32(36, 0, true);             // colours that matter

  const xorAt = DIB_HEADER;
  const maskAt = xorAt + xorSize;

  for (let y = 0; y < height; y += 1) {
    // A DIB is stored bottom row first. Nothing warns you about this: get it
    // wrong and the icon is simply upside down, at 16 pixels across, in a
    // taskbar, where about half of all logos look plausible either way.
    const source = y * xorStride;
    const dest = xorAt + (height - 1 - y) * xorStride;
    const maskRow = maskAt + (height - 1 - y) * maskStride;

    for (let x = 0; x < width; x += 1) {
      const from = source + x * 4;
      const to = dest + x * 4;
      const alpha = data[from + 3];

      out[to] = data[from + 2];            // blue
      out[to + 1] = data[from + 1];        // green
      out[to + 2] = data[from];            // red
      out[to + 3] = alpha;

      // The mask is left over from icons that had no alpha channel: a set bit
      // means "let the desktop through here". A 32-bit entry does not need it -
      // the alpha channel says the same thing, in more detail - but the field
      // is not optional, and a reader old enough to ignore the alpha is exactly
      // the reader that will draw a black box without this.
      if (alpha < MASK_CUTOFF) out[maskRow + (x >> 3)] |= 0x80 >> (x & 7);
    }
  }

  return out;
}

/**
 * What the directory of an existing .ico says is in it.
 *
 * Used to describe the file this tool just wrote, on the page, from the bytes
 * themselves rather than from the plan that produced them. It is a small piece
 * of paranoia and it costs nothing: if the writer above ever disagreed with the
 * settings above it, the page would say so instead of the user finding out when
 * Windows drew nothing.
 *
 * @param {Uint8Array} bytes
 * @returns {{width: number, height: number, kind: 'png'|'bmp', bytes: number}[]}
 */
export function readIcoDirectory(bytes) {
  if (bytes.length < ICONDIR) throw refusal('ico.short');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.getUint16(2, true) !== 1) throw refusal('ico.type');

  const count = view.getUint16(4, true);
  const found = [];

  for (let i = 0; i < count; i += 1) {
    const dir = ICONDIR + i * ICONDIRENTRY;
    if (dir + ICONDIRENTRY > bytes.length) throw refusal('ico.directory');

    const size = view.getUint32(dir + 8, true);
    const offset = view.getUint32(dir + 12, true);
    if (offset + size > bytes.length) throw refusal('ico.entry');

    found.push({
      width: bytes[dir] === 0 ? MAX_SIDE : bytes[dir],
      height: bytes[dir + 1] === 0 ? MAX_SIDE : bytes[dir + 1],
      kind: isPng(bytes, offset) ? 'png' : 'bmp',
      bytes: size,
    });
  }

  return found;
}

/** The PNG signature, which is how a reader tells the two kinds of entry apart. */
function isPng(bytes, at) {
  return bytes[at] === 0x89 && bytes[at + 1] === 0x50
    && bytes[at + 2] === 0x4e && bytes[at + 3] === 0x47;
}
