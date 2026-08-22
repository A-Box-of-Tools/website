/**
 * The ICNS writer - the macOS half of the same job.
 *
 * Windows reads .ico and macOS reads .icns, and neither will look at the
 * other. They are the same idea twice: a container holding the same picture at
 * several sizes, with a small header saying where each one is. The differences
 * are all in the details, and every one of them is the opposite of the .ico:
 *
 *   ICO                                ICNS
 *   little-endian                      big-endian
 *   a directory at the front           no directory; elements end to end
 *   a size in the entry                a four-letter type that implies the size
 *   raw pixels or PNG                  PNG (or JPEG 2000, which no browser writes)
 *   256 pixels is the ceiling          1024
 *
 * That last row is why this is a second file rather than a setting: a macOS
 * icon is a different set of sizes, not the same set in a different wrapper,
 * and the sizes are not a choice. Apple publishes exactly ten slots and a Mac
 * asks for the one it wants by name.
 *
 * @see https://developer.apple.com/design/human-interface-guidelines/app-icons
 * @see https://en.wikipedia.org/wiki/Apple_Icon_Image_format
 */

const MAGIC = 0x69636e73;   // 'icns'
const ELEMENT_HEADER = 8;   // four-letter type, then a four-byte length

/**
 * The ten slots, in the order `iconutil` writes them.
 *
 * `role` is the name the file would have inside a `.iconset` folder, which is
 * the form Apple's own tool takes as input. It is worth carrying because it is
 * the only thing that explains the duplicates: 32 pixels appears twice because
 * it is both "the 32-pixel icon" and "the 16-pixel icon on a Retina display",
 * and macOS picks between them by type rather than by size. The same picture
 * goes in both, encoded once.
 *
 * There is no 64-pixel slot of its own, and no 16-pixel Retina slot beyond
 * ic11. Adding sizes Apple does not name would produce a larger file that
 * nothing reads.
 *
 * @type {{type: string, px: number, role: string}[]}
 */
export const ICNS_TYPES = [
  { type: 'icp4', px: 16, role: 'icon_16x16' },
  { type: 'ic11', px: 32, role: 'icon_16x16@2x' },
  { type: 'icp5', px: 32, role: 'icon_32x32' },
  { type: 'ic12', px: 64, role: 'icon_32x32@2x' },
  { type: 'ic07', px: 128, role: 'icon_128x128' },
  { type: 'ic13', px: 256, role: 'icon_128x128@2x' },
  { type: 'ic08', px: 256, role: 'icon_256x256' },
  { type: 'ic14', px: 512, role: 'icon_256x256@2x' },
  { type: 'ic09', px: 512, role: 'icon_512x512' },
  { type: 'ic10', px: 1024, role: 'icon_512x512@2x' },
];

/** The distinct sizes that have to be drawn: seven renders for ten slots. */
export const ICNS_SIZES = [...new Set(ICNS_TYPES.map(({ px }) => px))];

/**
 * Wrap the elements in an icns header and hand back the file.
 *
 * There is no table of contents. `iconutil` writes one - a `TOC ` element
 * listing the types and lengths that follow - and it is an index rather than
 * part of the format: a reader that ignores it walks the elements end to end
 * and arrives at the same answer. It is left out here because a wrong index is
 * worse than no index, and nothing this file is read by needs one.
 *
 * @param {{type: string, data: Uint8Array}[]} elements
 * @returns {Uint8Array}
 */
export function writeIcns(elements) {
  if (!elements.length) throw new Error('an icon needs at least one image in it.');

  for (const element of elements) {
    // Every type is four bytes with no terminator, so a name of any other
    // length does not overflow into anything - it silently shifts every
    // element after it and the file stops being readable at all.
    if (element.type.length !== 4) {
      throw new Error(`"${element.type}" is not a four-letter icns type.`);
    }
  }

  const total = ELEMENT_HEADER
    + elements.reduce((n, element) => n + ELEMENT_HEADER + element.data.length, 0);

  const out = new Uint8Array(total);
  const view = new DataView(out.buffer);

  view.setUint32(0, MAGIC, false);
  // Big-endian, and the length counts this header as well - which is the one
  // field a reader checks before it trusts anything else in the file.
  view.setUint32(4, total, false);

  let at = ELEMENT_HEADER;
  for (const element of elements) {
    for (let i = 0; i < 4; i += 1) out[at + i] = element.type.charCodeAt(i);
    // The element's own length includes its eight-byte header, not just the
    // payload. Writing the payload length instead walks the reader eight bytes
    // short of the next type and the rest of the file is read as rubbish.
    view.setUint32(at + 4, ELEMENT_HEADER + element.data.length, false);
    out.set(element.data, at + ELEMENT_HEADER);
    at += ELEMENT_HEADER + element.data.length;
  }

  return out;
}

/**
 * What the elements of an existing .icns say is in it.
 *
 * The counterpart of `readIcoDirectory`, and there for the same reason: the
 * page describes a finished file from its own bytes rather than from the plan
 * that produced it.
 *
 * @param {Uint8Array} bytes
 * @returns {{type: string, px: number|null, bytes: number}[]}
 */
export function readIcnsElements(bytes) {
  if (bytes.length < ELEMENT_HEADER) throw new Error('not an .icns: too short to hold a header.');

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.getUint32(0, false) !== MAGIC) throw new Error('not an .icns: the magic is not "icns".');

  const claimed = view.getUint32(4, false);
  if (claimed !== bytes.length) {
    throw new Error(`the header claims ${claimed} bytes and the file is ${bytes.length}.`);
  }

  const sizeOf = new Map(ICNS_TYPES.map(({ type, px }) => [type, px]));
  const found = [];
  let at = ELEMENT_HEADER;

  while (at < bytes.length) {
    if (at + ELEMENT_HEADER > bytes.length) throw new Error('an element runs past the end of the file.');

    const type = String.fromCharCode(bytes[at], bytes[at + 1], bytes[at + 2], bytes[at + 3]);
    const length = view.getUint32(at + 4, false);
    if (length < ELEMENT_HEADER || at + length > bytes.length) {
      throw new Error(`the ${type} element claims a length the file cannot hold.`);
    }

    found.push({ type, px: sizeOf.get(type) ?? null, bytes: length - ELEMENT_HEADER });
    at += length;
  }

  return found;
}
