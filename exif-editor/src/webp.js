/**
 * WebP, as a RIFF file.
 *
 * "RIFF", a size, "WEBP", then a run of chunks: a four-letter name, a size, the
 * data, and a pad byte when the size is odd. A plain WebP is one VP8 or VP8L
 * chunk and nothing else. Anything with metadata, transparency or animation is
 * an "extended" file, which starts with a VP8X chunk whose first byte is a set
 * of flags saying which of the optional chunks are present.
 *
 * Those flags are the trap. Removing the EXIF chunk without clearing its flag
 * leaves a file that says it has metadata and does not, which some readers
 * treat as corruption. This file always rewrites the flags to match what it
 * actually wrote.
 *
 * As with the other two containers, the picture chunk is copied untouched.
 */

const FLAG_ICC = 0x20;
const FLAG_ALPHA = 0x10;
const FLAG_EXIF = 0x08;
const FLAG_XMP = 0x04;
const FLAG_ANIM = 0x02;

const latin1 = new TextDecoder('latin1');
const utf8 = new TextEncoder();

/** The order the WebP container specification requires of extended files. */
const CHUNK_ORDER = ['VP8X', 'ICCP', 'ANIM', 'ANMF', 'ALPH', 'VP8 ', 'VP8L', 'EXIF', 'XMP '];

export function read(bytes) {
  if (bytes.length < 16 || latin1.decode(bytes.subarray(0, 4)) !== 'RIFF'
      || latin1.decode(bytes.subarray(8, 12)) !== 'WEBP') {
    return { ok: false, kind: 'webp', error: 'This does not start like a WebP.' };
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const chunks = [];
  let at = 12;

  while (at + 8 <= bytes.length) {
    const fourcc = latin1.decode(bytes.subarray(at, at + 4));
    const size = view.getUint32(at + 4, true);
    if (at + 8 + size > bytes.length) {
      return { ok: false, kind: 'webp', error: 'A chunk claims a size that runs off the end of the file.' };
    }
    chunks.push({ fourcc, data: bytes.slice(at + 8, at + 8 + size) });
    at += 8 + size + (size % 2); // chunks are padded to an even length
  }

  if (!chunks.length) return { ok: false, kind: 'webp', error: 'The file has no chunks in it.' };
  return { ok: true, kind: 'webp', chunks };
}

export function write(doc) {
  let body = 4; // the "WEBP" that follows the RIFF size
  for (const c of doc.chunks) body += 8 + c.data.length + (c.data.length % 2);

  const out = new Uint8Array(8 + body);
  const view = new DataView(out.buffer);
  out.set(utf8.encode('RIFF'));
  view.setUint32(4, body, true);
  out.set(utf8.encode('WEBP'), 8);

  let at = 12;
  for (const chunk of doc.chunks) {
    out.set(utf8.encode(chunk.fourcc.padEnd(4, ' ')), at);
    view.setUint32(at + 4, chunk.data.length, true);
    out.set(chunk.data, at + 8);
    at += 8 + chunk.data.length + (chunk.data.length % 2);
  }

  return out;
}

/** Some writers prefix the JPEG-style marker. Tolerate it, as with PNG. */
function stripExifId(data) {
  return latin1.decode(data.subarray(0, 6)) === 'Exif\0\0' ? data.slice(6) : data;
}

/** @returns {import('./container.js').Meta} */
export function collect(doc) {
  const meta = {
    exif: null, xmp: null, iptc: null, icc: null,
    comments: [], text: [], extras: [], notes: [],
  };

  for (const chunk of doc.chunks) {
    if (chunk.fourcc === 'EXIF' && !meta.exif) meta.exif = stripExifId(chunk.data);
    else if (chunk.fourcc === 'XMP ') meta.xmp = new TextDecoder('utf-8').decode(chunk.data);
    else if (chunk.fourcc === 'ICCP') meta.icc = chunk.data;
  }

  return meta;
}

/** The chunks that only an extended (VP8X-headed) file is allowed to contain. */
const EXTENDED_ONLY = new Set(['ANIM', 'ANMF', 'ALPH', 'EXIF', 'XMP ', 'ICCP']);

/** Build a VP8X header for a file that did not have one. */
function makeVp8x(width, height) {
  const data = new Uint8Array(10);
  const w = width - 1;
  const h = height - 1;
  data[4] = w & 0xff; data[5] = (w >> 8) & 0xff; data[6] = (w >> 16) & 0xff;
  data[7] = h & 0xff; data[8] = (h >> 8) & 0xff; data[9] = (h >> 16) & 0xff;
  return { fourcc: 'VP8X', data };
}

/**
 * Rewrite the chunk list from a plan, then make the VP8X flags agree with it.
 *
 * @param {object} doc `doc.canvas` holds the decoded width and height, which is
 *   needed only in the one case where metadata is added to a file that had none
 *   and therefore has no VP8X header to put the flags in.
 * @param {{exif?: Uint8Array|null, xmp?: string|null, icc?: null}} plan
 */
export function apply(doc, plan) {
  const keep = [];
  let vp8x = null;

  for (const chunk of doc.chunks) {
    if (chunk.fourcc === 'VP8X') { vp8x = chunk; continue; }
    if (chunk.fourcc === 'EXIF' && plan.exif !== undefined) continue;
    if (chunk.fourcc === 'XMP ' && plan.xmp !== undefined) continue;
    if (chunk.fourcc === 'ICCP' && plan.icc === null) continue;
    keep.push(chunk);
  }

  if (plan.exif) keep.push({ fourcc: 'EXIF', data: plan.exif });
  if (typeof plan.xmp === 'string' && plan.xmp) keep.push({ fourcc: 'XMP ', data: utf8.encode(plan.xmp) });

  const present = new Set(keep.map((c) => c.fourcc));
  const needsExtended = [...present].some((f) => EXTENDED_ONLY.has(f));

  if (needsExtended && !vp8x) {
    if (!doc.canvas?.width || !doc.canvas?.height) {
      throw new Error('This WebP has no extended header, and its size could not be read, so metadata cannot be added to it.');
    }
    vp8x = makeVp8x(doc.canvas.width, doc.canvas.height);
  }

  if (vp8x) {
    const data = vp8x.data.slice();
    // The alpha flag can be set by a lossless bitstream that has no ALPH chunk
    // of its own, so it is carried over rather than derived.
    let flags = data[0] & FLAG_ALPHA;
    if (present.has('ALPH')) flags |= FLAG_ALPHA;
    if (present.has('ICCP')) flags |= FLAG_ICC;
    if (present.has('EXIF')) flags |= FLAG_EXIF;
    if (present.has('XMP ')) flags |= FLAG_XMP;
    if (present.has('ANIM')) flags |= FLAG_ANIM;
    data[0] = flags;
    keep.push({ fourcc: 'VP8X', data });
  }

  // Stable sort into the order the specification asks for. Several ANMF frames
  // share a rank and keep the order they were read in.
  keep.sort((a, b) => rank(a.fourcc) - rank(b.fourcc));
  doc.chunks = keep;
}

function rank(fourcc) {
  const at = CHUNK_ORDER.indexOf(fourcc);
  return at === -1 ? CHUNK_ORDER.length : at;
}
