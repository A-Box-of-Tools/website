/**
 * JPEG, as a list of segments.
 *
 * A JPEG is SOI, then a run of segments, then the compressed picture itself.
 * Each segment is 0xFF, a marker byte, a two-byte length, and a payload. All of
 * the metadata lives in the APPn segments and in COM; none of it is inside the
 * compressed data.
 *
 * That is the whole reason this tool can strip a photo without touching its
 * quality. Removing metadata here is deleting items from a list and writing the
 * list back out - the entropy-coded scan, which is every pixel you care about,
 * is copied across untouched. Nothing is decoded and nothing is re-compressed,
 * so a stripped JPEG is bit-for-bit identical to the original in the only part
 * that carries the image.
 */

const SOI = 0xd8;
const EOI = 0xd9;
const SOS = 0xda;
const COM = 0xfe;
const APP0 = 0xe0;
const APP1 = 0xe1;
const APP2 = 0xe2;
const APP13 = 0xed;
const APP14 = 0xee;

const EXIF_ID = 'Exif\0\0';
const XMP_ID = 'http://ns.adobe.com/xap/1.0/\0';
const XMP_EXT_ID = 'http://ns.adobe.com/xmp/extension/\0';
const ICC_ID = 'ICC_PROFILE\0';
const PS_ID = 'Photoshop 3.0\0';
const JFIF_ID = 'JFIF\0';

const latin1 = new TextDecoder('latin1');
const utf8 = new TextEncoder();

/** Read the first `n` bytes of a payload as text, for identifying a segment. */
const idOf = (payload, n) => latin1.decode(payload.subarray(0, n));

const startsWith = (payload, id) => payload.length >= id.length && idOf(payload, id.length) === id;

function bytesOf(text) {
  const out = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i += 1) out[i] = text.charCodeAt(i) & 0xff;
  return out;
}

/**
 * Split a JPEG into segments and the scan.
 *
 * @returns {{ok: boolean, error?: string, kind: 'jpeg',
 *            segments?: {marker: number, payload: Uint8Array}[], scan?: Uint8Array}}
 */
export function read(bytes) {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== SOI) {
    return { ok: false, kind: 'jpeg', error: 'read.notjpeg' };
  }

  const segments = [];
  let i = 2;

  while (i < bytes.length) {
    if (bytes[i] !== 0xff) return { ok: false, kind: 'jpeg', error: 'read.jpeglost' };

    // Any number of 0xFF bytes may pad the gap before a marker.
    let marker = bytes[i + 1];
    while (marker === 0xff && i + 2 < bytes.length) { i += 1; marker = bytes[i + 1]; }

    // Standalone markers carry no length and no payload.
    if (marker === SOI || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { i += 2; continue; }
    if (marker === EOI) break;

    if (i + 4 > bytes.length) break;
    const length = (bytes[i + 2] << 8) | bytes[i + 3];
    if (length < 2 || i + 2 + length > bytes.length) {
      return { ok: false, kind: 'jpeg', error: 'read.jpegoverrun' };
    }

    // Everything from the start-of-scan marker onwards is the picture. It is
    // never parsed and never rewritten, only copied.
    if (marker === SOS) return { ok: true, kind: 'jpeg', segments, scan: bytes.slice(i) };

    segments.push({ marker, payload: bytes.slice(i + 4, i + 2 + length) });
    i += 2 + length;
  }

  return { ok: false, kind: 'jpeg', error: 'read.jpegnoscan' };
}

/** Reassemble a JPEG from its segments and its untouched scan. */
export function write(doc) {
  let total = 2 + (doc.scan?.length ?? 0);
  for (const s of doc.segments) total += 4 + s.payload.length;

  const out = new Uint8Array(total);
  out[0] = 0xff;
  out[1] = SOI;
  let at = 2;

  for (const s of doc.segments) {
    const length = s.payload.length + 2;
    out[at] = 0xff;
    out[at + 1] = s.marker;
    out[at + 2] = (length >> 8) & 0xff;
    out[at + 3] = length & 0xff;
    out.set(s.payload, at + 4);
    at += 4 + s.payload.length;
  }

  if (doc.scan) out.set(doc.scan, at);
  return out;
}

/**
 * What a segment is, in one word.
 *
 * 'image' means the segment is part of how the picture is encoded - quantisation
 * tables, Huffman tables, the frame header - and must survive everything this
 * tool does. Everything else is metadata of some kind.
 */
function roleOf(segment) {
  const { marker, payload } = segment;
  if (marker === COM) return 'comment';
  if (marker === APP0) return startsWith(payload, JFIF_ID) ? 'jfif' : 'other';
  if (marker === APP1) {
    if (startsWith(payload, EXIF_ID)) return 'exif';
    if (startsWith(payload, XMP_ID) || startsWith(payload, XMP_EXT_ID)) return 'xmp';
    return 'other';
  }
  if (marker === APP2) return startsWith(payload, ICC_ID) ? 'icc' : 'other';
  if (marker === APP13) return startsWith(payload, PS_ID) ? 'iptc' : 'other';
  // APP14 "Adobe" records which colour transform the encoder used. Drop it and
  // a CMYK or YCCK JPEG decodes with inverted colours, so it counts as image
  // data rather than metadata however much it looks like the latter.
  if (marker === APP14) return startsWith(payload, 'Adobe') ? 'adobe' : 'other';
  if (marker >= 0xe0 && marker <= 0xef) return 'other';
  return 'image';
}

/** A readable name for an APPn segment nobody has identified. */
function labelFor(segment) {
  const { marker, payload } = segment;
  if (marker >= 0xe0 && marker <= 0xef) {
    // Most unknown APPn segments still start with a NUL-terminated signature,
    // which is worth showing: it usually names the program that put it there.
    const head = idOf(payload, Math.min(24, payload.length));
    const sig = head.split('\0')[0].replace(/[^\x20-\x7e]/g, '');
    const name = `APP${marker - 0xe0}`;
    return sig.length >= 3 ? `${name} (${sig})` : name;
  }
  return `Marker 0x${marker.toString(16)}`;
}

/**
 * The metadata in this file, in the shape every container reports.
 * @returns {import('./container.js').Meta}
 */
export function collect(doc) {
  const meta = {
    exif: null, xmp: null, iptc: null, icc: null,
    comments: [], text: [], extras: [], notes: [],
  };

  const iccChunks = [];

  for (const segment of doc.segments) {
    const role = roleOf(segment);
    const { payload } = segment;

    if (role === 'exif' && !meta.exif) {
      meta.exif = payload.slice(EXIF_ID.length);
    } else if (role === 'xmp') {
      const id = startsWith(payload, XMP_ID) ? XMP_ID : XMP_EXT_ID;
      const text = latin1.decode(payload.subarray(id.length)).replace(/\0+$/, '');
      meta.xmp = meta.xmp === null ? text : `${meta.xmp}\n${text}`;
    } else if (role === 'iptc') {
      meta.iptc = payload.slice(PS_ID.length);
    } else if (role === 'icc') {
      // A profile larger than a segment is split across several, each carrying
      // its sequence number and the total. Put them back in order.
      const seq = payload[ICC_ID.length] ?? 1;
      iccChunks.push({ seq, data: payload.slice(ICC_ID.length + 2) });
    } else if (role === 'comment') {
      meta.comments.push(latin1.decode(payload).replace(/\0+$/, ''));
    } else if (role === 'other') {
      meta.extras.push({ label: labelFor(segment), size: payload.length });
    } else if (role === 'jfif') {
      // Both halves are keys: main.js resolves them against #phrases, because
      // this module is copied into fifteen languages unchanged.
      meta.notes.push({
        label: 'segment.jfif.label',
        detail: 'segment.jfif.detail',
      });
    } else if (role === 'adobe') {
      meta.notes.push({
        label: 'segment.adobe.label',
        detail: 'segment.adobe.detail',
      });
    }
  }

  if (iccChunks.length) {
    iccChunks.sort((a, b) => a.seq - b.seq);
    const total = iccChunks.reduce((n, c) => n + c.data.length, 0);
    meta.icc = new Uint8Array(total);
    let at = 0;
    for (const chunk of iccChunks) { meta.icc.set(chunk.data, at); at += chunk.data.length; }
  }

  return meta;
}

/** The largest payload a JPEG segment can hold: the length field is 16 bits. */
const MAX_PAYLOAD = 0xffff - 2;

function segmentWithId(marker, id, body) {
  const head = bytesOf(id);
  const payload = new Uint8Array(head.length + body.length);
  payload.set(head);
  payload.set(body, head.length);
  if (payload.length > MAX_PAYLOAD) {
    // The key of a sentence and its numbers: this module is copied into
    // fifteen languages and cannot reach the markup the words live in.
    const error = new Error('write.segmentfull');
    error.values = { size: payload.length, limit: MAX_PAYLOAD };
    throw error;
  }
  return { marker, payload };
}

/**
 * Rewrite the segment list from a plan.
 *
 * A key left out of the plan means "leave this alone"; null means "remove it";
 * anything else replaces what was there. Segments that are part of how the
 * picture is encoded are never in the plan and always survive.
 *
 * @param {object} doc
 * @param {{exif?: Uint8Array|null, xmp?: string|null, iptc?: null,
 *          icc?: null, comments?: null, extras?: null}} plan
 */
export function apply(doc, plan) {
  const byRole = { exif: [], xmp: [], iptc: [], icc: [], comment: [], other: [], jfif: [], adobe: [] };
  const image = [];

  for (const segment of doc.segments) {
    const role = roleOf(segment);
    if (role === 'image') image.push(segment);
    else byRole[role].push(segment);
  }

  const out = [];

  // JFIF goes first when it is there at all; it is the one segment whose
  // position some decoders are fussy about.
  out.push(...byRole.jfif);

  if (plan.exif === undefined) out.push(...byRole.exif);
  else if (plan.exif) out.push(segmentWithId(APP1, EXIF_ID, plan.exif));

  if (plan.xmp === undefined) out.push(...byRole.xmp);
  else if (typeof plan.xmp === 'string' && plan.xmp) out.push(segmentWithId(APP1, XMP_ID, utf8.encode(plan.xmp)));

  if (plan.icc === undefined) out.push(...byRole.icc);
  if (plan.iptc === undefined) out.push(...byRole.iptc);

  out.push(...byRole.adobe);

  if (plan.comments === undefined) out.push(...byRole.comment);
  if (plan.extras === undefined) out.push(...byRole.other);

  doc.segments = out.concat(image);
}
