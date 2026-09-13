/**
 * The file behind the "Try an example" button: a document that really is
 * protected.
 *
 * This one had to be built rather than borrowed, and the reason says something
 * about the tool. Every other example on this site is a picture, a recording
 * or a document, and shared/js/example-pdf.js already writes a perfectly good
 * PDF. What it does not write is a *locked* one - and a page demonstrating
 * that restrictions come off a document that never had any would be
 * demonstrating nothing at all. So this writes the same kind of statement and
 * then encrypts it, with the writing side of shared/js/pdf-crypt.js and its
 * own /Encrypt dictionary, exactly as a word processor's "restrict editing"
 * box would - at revision 4, AES-128, because that is what such boxes write.
 *
 * What comes out is the commonest protected file in the world and the case
 * this tool answers with one click: no password to open it, an owner password
 * nobody typed in, and printing and copying switched off. Open it in a reader
 * first if you like - the print button will be greyed out.
 *
 * The layout is deliberately plainer than example-pdf.js's, because it is not
 * standing in for a statement here. It is standing in for "a document", and
 * what the page is about happens to the whole file rather than to anything on
 * a particular line of it.
 */

import { PdfWriter, PT_PER_MM } from './shared/pdf-page-writer.js';
import { HEADINGS, rowsFor } from './shared/example-statement.js';
import { protect } from './shared/pdf-crypt.js';

const A4 = { width: Math.round(210 * PT_PER_MM), height: Math.round(297 * PT_PER_MM) };
const COLUMNS = [56, 150, 260, 420];
const PAGES = 2;

/**
 * Everything the /P field can say, with printing and copying taken away.
 *
 * -1 is every bit set, which means "no restrictions". Clearing bits 3 and 5 -
 * worth 4 and 16 - is what a reader reads as "you may not print this and you
 * may not copy from it", and is the pair of boxes people actually tick.
 */
const PERMISSIONS = -1 & ~(4 | 16);

/** The owner password on the example. It is written down here, in public, on
 *  purpose: it is not what opens the document, and nothing here needs it. */
const OWNER_PASSWORD = 'example-owner-password';

/** Escape for a PDF literal string: a backslash and the two parentheses. */
const literal = (s) => s.replace(/([\\()])/g, '\\$1');

const latin1 = (text) => {
  const out = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i += 1) out[i] = text.charCodeAt(i) & 0xff;
  return out;
};

/** One page: a heading, a rule, a row of column headings, and some rows. */
function pageStream(page, rows) {
  const top = A4.height - 90;
  const out = [];

  out.push('0.12 0.21 0.31 rg');
  out.push(`BT /F1 22 Tf 56 ${top + 26} Td (${literal(`STATEMENT ${page} / ${PAGES}`)}) Tj ET`);
  out.push(`56 ${top + 14} m ${A4.width - 56} ${top + 14} l S`);

  out.push('0.35 0.35 0.35 rg');
  HEADINGS.forEach((heading, c) => {
    out.push(`BT /F1 9 Tf ${COLUMNS[c]} ${top - 10} Td (${literal(heading)}) Tj ET`);
  });

  out.push('0 0 0 rg');
  rows.forEach((row, i) => {
    const y = top - 34 - i * 22;
    row.forEach((cell, c) => {
      out.push(`BT /F1 11 Tf ${COLUMNS[c]} ${y} Td (${literal(cell)}) Tj ET`);
    });
  });

  return latin1(out.join('\n'));
}

/**
 * @param {string} name the filename the picker will show
 * @returns {Promise<File>}
 */
export async function makeExample(name = 'protected-statement.pdf') {
  // The document's /ID goes into the key, so it has to exist before anything
  // is encrypted and be written into the trailer unchanged afterwards.
  const id = crypto.getRandomValues(new Uint8Array(16));
  const security = await protect({
    ownerPassword: OWNER_PASSWORD, permissions: PERMISSIONS, id, revision: 4,
  });

  const writer = new PdfWriter();
  const catalog = writer.reserve();
  const pagesId = writer.reserve();
  const font = writer.reserve();
  const info = writer.reserve();
  const encrypt = writer.reserve();

  const pageIds = [];
  const contentIds = [];
  for (let i = 0; i < PAGES; i += 1) {
    pageIds.push(writer.reserve());
    contentIds.push(writer.reserve());
  }

  writer.object(font,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');

  for (let i = 0; i < PAGES; i += 1) {
    // Encrypted with the object's own number, which is the whole of algorithm
    // 1 and the reason the ids have to be reserved before anything is written.
    writer.stream(contentIds[i], '', security.encrypt(pageStream(i + 1, rowsFor(i + 1)),
      contentIds[i], 0));

    writer.object(pageIds[i],
      `<< /Type /Page /Parent ${pagesId} 0 R`
      + ` /MediaBox [0 0 ${A4.width} ${A4.height}]`
      + ` /Resources << /Font << /F1 ${font} 0 R >> >>`
      + ` /Contents ${contentIds[i]} 0 R >>`);
  }

  writer.object(pagesId,
    `<< /Type /Pages /Count ${PAGES}`
    + ` /Kids [${pageIds.map((pageId) => `${pageId} 0 R`).join(' ')}] >>`);
  writer.object(catalog, `<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

  // A producer line, because a document that has been through a program that
  // locks things usually says which program, and the page reports what it
  // finds. The strings in it are encrypted like any others.
  writer.object(info, `<< /Producer ${hex(security.encrypt(
    latin1('An office suite, restricted on export'), info, 0))}`
    + ` /Title ${hex(security.encrypt(latin1('Quarterly statement'), info, 0))} >>`);

  // The one object in the file that is not encrypted: it is what a reader
  // needs in order to work out the key.
  writer.object(encrypt, security.dictionary);

  return new File(
    [writer.finish({
      root: catalog,
      info,
      extra: ` /Encrypt ${encrypt} 0 R /ID [${hex(id)} ${hex(id)}]`,
    })],
    name,
    { type: 'application/pdf', lastModified: Date.now() },
  );
}

function hex(bytes) {
  let out = '<';
  for (const byte of bytes) out += byte.toString(16).padStart(2, '0');
  return `${out}>`;
}
