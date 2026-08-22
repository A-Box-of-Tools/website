/**
 * What is in the file besides the picture.
 *
 * This matters here more than it does in most image tools, and for a reason
 * that is easy to miss. Every other tool on this site decodes a picture and
 * encodes it again, which throws the metadata away as a side effect. This one
 * copies the bytes exactly - that is the whole point of it - so whatever the
 * camera wrote goes into the URI too, and from there into a stylesheet, a
 * template, a repository, and a page served to everybody.
 *
 * A JPEG straight off a phone can carry a GPS fix, a serial number and a
 * timestamp in around 30 KB of EXIF. Pasted into CSS, that is 40 KB of base64
 * on the critical path of every page load, and a home address in a file that
 * gets committed. Both halves of that are worth saying out loud before
 * somebody copies the result.
 *
 * The walkers below are deliberately shallow. They find the blocks and add up
 * their sizes; they do not parse a single tag, because the answer this page
 * needs is "there is metadata in here, this much of it, of these kinds" and
 * reading the tags themselves is a different tool - see exif-editor.
 */

const ascii = (bytes, at, text) => {
  for (let i = 0; i < text.length; i += 1) {
    if (bytes[at + i] !== text.charCodeAt(i)) return false;
  }
  return true;
};

const tag = (bytes, at) => String.fromCharCode(
  bytes[at] ?? 0, bytes[at + 1] ?? 0, bytes[at + 2] ?? 0, bytes[at + 3] ?? 0,
);

const u32be = (b, at) => ((b[at] << 24 | b[at + 1] << 16 | b[at + 2] << 8 | b[at + 3]) >>> 0);
const u32le = (b, at) => ((b[at + 3] << 24 | b[at + 2] << 16 | b[at + 1] << 8 | b[at]) >>> 0);

/**
 * @typedef {object} Metadata
 * @property {number} bytes how much of the file is not the picture
 * @property {string[]} kinds what was found, in the words the page uses
 */

/**
 * @param {Uint8Array} bytes the whole file
 * @param {string} mime from sniff(), so the walker matches the container
 * @returns {Metadata|null} null means "not inspected", which is not the same
 *   as "clean" and is never reported as though it were.
 */
export function metadata(bytes, mime) {
  if (mime === 'image/jpeg') return jpeg(bytes);
  if (mime === 'image/png') return png(bytes);
  if (mime === 'image/webp') return webp(bytes);
  return null;
}

/** Formats this can look inside. Everything else is reported as unknown
 *  rather than as empty, which is the honest half of the same answer. */
export const INSPECTS = ['image/jpeg', 'image/png', 'image/webp'];

function found(hits) {
  const kinds = [...new Set(hits.map((hit) => hit.kind))];
  const bytes = hits.reduce((sum, hit) => sum + hit.bytes, 0);
  return bytes ? { bytes, kinds } : null;
}

/* -------------------------------------------------------------------- JPEG */

/**
 * Walk the marker segments in front of the scan.
 *
 * JFIF (APP0) is not counted. It is a fourteen-byte header saying the file is
 * a JPEG in the usual way, it says nothing about you, and reporting it as
 * metadata would mean every picture on earth gets a warning - which trains
 * people to ignore the warning that matters.
 */
function jpeg(bytes) {
  if (!(bytes[0] === 0xff && bytes[1] === 0xd8)) return null;

  const hits = [];
  let at = 2;

  while (at + 4 <= bytes.length) {
    if (bytes[at] !== 0xff) break;
    const marker = bytes[at + 1];

    // A run of 0xFF is legal padding in front of the next marker.
    if (marker === 0xff) { at += 1; continue; }
    // Standalone markers: SOI, TEM, and the restart markers, none with a body.
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      at += 2;
      continue;
    }
    // The scan, and the end of the file. Nothing beyond here is a segment.
    if (marker === 0xda || marker === 0xd9) break;

    const length = (bytes[at + 2] << 8) | bytes[at + 3];
    if (length < 2) break;
    const body = at + 4;
    const kind = jpegKind(bytes, marker, body);
    if (kind) hits.push({ kind, bytes: length + 2 });
    at += 2 + length;
  }

  return found(hits);
}

function jpegKind(bytes, marker, body) {
  if (marker === 0xe1) {
    if (ascii(bytes, body, 'Exif\0\0')) return 'EXIF';
    if (ascii(bytes, body, 'http://ns.adobe.com/xap/1.0/\0')) return 'XMP';
    return null;
  }
  if (marker === 0xe2 && ascii(bytes, body, 'ICC_PROFILE\0')) return 'a colour profile';
  if (marker === 0xed && ascii(bytes, body, 'Photoshop 3.0\0')) return 'IPTC';
  if (marker === 0xfe) return 'a comment';
  return null;
}

/* --------------------------------------------------------------------- PNG */

const PNG_CHUNKS = {
  eXIf: 'EXIF',
  iTXt: 'text',
  tEXt: 'text',
  zTXt: 'text',
  iCCP: 'a colour profile',
  tIME: 'a timestamp',
};

function png(bytes) {
  const hits = [];
  let at = 8;

  while (at + 12 <= bytes.length) {
    const length = u32be(bytes, at);
    const type = tag(bytes, at + 4);
    // iTXt often holds XMP, which is worth naming separately: it is where a
    // photo editor puts the things people expect EXIF to hold.
    const kind = type === 'iTXt' && ascii(bytes, at + 8, 'XML:com.adobe.xmp\0')
      ? 'XMP'
      : PNG_CHUNKS[type];
    if (kind) hits.push({ kind, bytes: length + 12 });
    if (type === 'IEND') break;
    at += length + 12;
  }

  return found(hits);
}

/* -------------------------------------------------------------------- WebP */

const WEBP_CHUNKS = {
  EXIF: 'EXIF',
  'XMP ': 'XMP',
  ICCP: 'a colour profile',
};

function webp(bytes) {
  const hits = [];
  let at = 12;

  while (at + 8 <= bytes.length) {
    const type = tag(bytes, at);
    const size = u32le(bytes, at + 4);
    const kind = WEBP_CHUNKS[type];
    if (kind) hits.push({ kind, bytes: size + 8 });
    // Every RIFF chunk is padded to an even length, and the pad byte is not
    // counted in the size field.
    at += 8 + size + (size % 2);
  }

  return found(hits);
}
