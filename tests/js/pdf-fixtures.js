/**
 * Building real PDFs to read back.
 *
 * The compress-pdf tool opens files somebody else made, so its tests need
 * files somebody else made - or the nearest honest substitute, which is one
 * assembled here with the byte offsets worked out rather than asserted. A
 * fixture whose xref table is wrong would test the repair path by accident
 * and never touch the one that matters.
 *
 * `buildPdf` therefore writes a correct classic cross-reference table, and the
 * damaged variants below each break exactly one thing.
 */

export const ascii = (text) => {
  const out = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i += 1) out[i] = text.charCodeAt(i) & 0xff;
  return out;
};

export const concat = (...parts) => {
  const runs = parts.map((p) => (typeof p === 'string' ? ascii(p) : p));
  const out = new Uint8Array(runs.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const run of runs) {
    out.set(run, at);
    at += run.length;
  }
  return out;
};

export const text = (bytes) => new TextDecoder('latin1').decode(bytes);

/**
 * Assemble a PDF from a list of object bodies.
 *
 * @param {(string|Uint8Array)[]} objects  body of object 1, 2, 3... in order
 * @param {{root?: number, info?: number, header?: string, extra?: string}} options
 */
export function buildPdf(objects, { root = 1, info = null, header = '%PDF-1.7\n' } = {}) {
  const parts = [ascii(header)];
  let at = parts[0].length;
  const offsets = [];

  objects.forEach((body, index) => {
    offsets.push(at);
    const chunk = concat(`${index + 1} 0 obj\n`, body, '\nendobj\n');
    parts.push(chunk);
    at += chunk.length;
  });

  const startxref = at;
  let table = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) {
    table += `${String(offset).padStart(10, '0')} 00000 n \n`;
  }
  const trailer = info === null
    ? `trailer\n<< /Size ${objects.length + 1} /Root ${root} 0 R >>\n`
    : `trailer\n<< /Size ${objects.length + 1} /Root ${root} 0 R /Info ${info} 0 R >>\n`;

  parts.push(ascii(table + trailer + `startxref\n${startxref}\n%%EOF\n`));
  return concat(...parts);
}

/** A stream object: a dictionary, the `stream` keyword, the bytes, `endstream`. */
export const streamObject = (dict, data) =>
  concat(`<< ${dict} /Length ${data.length} >>\nstream\n`, data, '\nendstream');

/**
 * The smallest document this tool will open: a catalogue, a page tree and one
 * page. Object 1 is the catalogue, so `root` defaults to it everywhere.
 */
export const MINIMAL_OBJECTS = [
  '<< /Type /Catalog /Pages 2 0 R >>',
  '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
  '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>',
];

export const minimalPdf = (options) => buildPdf(MINIMAL_OBJECTS, options);

/** The same, plus an /Info dictionary and an XMP packet to strip. */
export function pdfWithMetadata() {
  return buildPdf([
    '<< /Type /Catalog /Pages 2 0 R /Metadata 5 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] '
      + '/LastModified (D:20260101000000Z) /PieceInfo << /App << /Private (blob) >> >> >>',
    '<< /Producer (Some Layout App 9.1) /Creator (A Person) >>',
    streamObject('/Type /Metadata /Subtype /XML', ascii('<x:xmpmeta>a packet</x:xmpmeta>')),
  ], { info: 4 });
}

/** Deflate, so a FlateDecode fixture is genuinely compressed. */
export async function deflate(bytes) {
  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** Read a Blob back as bytes. */
export const blobBytes = async (blob) => new Uint8Array(await blob.arrayBuffer());
