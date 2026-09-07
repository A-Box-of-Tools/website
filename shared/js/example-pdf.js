/**
 * A small PDF, written in the page.
 *
 * Three tools take a document and none can be shown anything without one. It
 * is built rather than fetched for the reason set out at the top of
 * shared/js/example-photo.js, and it is built on shared/js/pdf-page-writer.js,
 * which is the same writer /images-to-pdf/ uses - so the example is made by
 * the code the site already trusts to make documents.
 *
 * WHY THE TEXT IS CODES, DATES AND AMOUNTS
 *
 * Because it has to be real text rather than a picture of text: the redactor's
 * whole claim is that it deletes letters from the file, and a page whose words
 * were drawn as an image would have nothing in it to delete. Real text means a
 * font, and the only fonts a PDF can use without embedding megabytes are the
 * base fourteen - Helvetica here - whose repertoire is Latin.
 *
 * So the page is a statement: reference codes, dates, amounts, and two names.
 * That is a deliberate choice and not a shrug. It is what people actually
 * redact, it reads the same in every language this site is published in, and
 * it avoids the alternative - a paragraph of English prose sitting inside a
 * Japanese page - which is the thing shared/js/phrases.js exists to prevent.
 * Embedding a CJK font to do better would cost several megabytes on a page
 * whose subject is not typography.
 */

import { PdfWriter, num, textString, PT_PER_MM } from './pdf-page-writer.js';

const A4 = { width: Math.round(210 * PT_PER_MM), height: Math.round(297 * PT_PER_MM) };

/** Escape for a PDF literal string: backslash, and the two parentheses. */
const literal = (s) => s.replace(/([\\()])/g, '\\$1');

/**
 * The rows on the statement. Codes, dates and amounts - see the header.
 *
 * Fixed rather than random, so that two people comparing what a tool did to
 * the example are looking at the same document.
 */
const ROWS = [
  ['2026-01-04', 'INV-2026-0184', 'A. Moreau', '1,240.00'],
  ['2026-01-11', 'INV-2026-0191', 'K. Tanaka', '318.50'],
  ['2026-01-18', 'INV-2026-0207', 'A. Moreau', '2,905.75'],
  ['2026-02-02', 'INV-2026-0233', 'L. Okafor', '87.20'],
  ['2026-02-15', 'INV-2026-0248', 'K. Tanaka', '1,015.00'],
  ['2026-02-27', 'INV-2026-0262', 'L. Okafor', '640.40'],
];

const COLUMNS = [56, 150, 260, 420];

/**
 * One page's content stream: a rule, a row of column headings, and the rows.
 *
 * `page` is drawn large in the corner so that a merged or split document can
 * be checked at a glance - which page ended up where is the only question
 * those two tools answer, and it cannot be answered against six pages that
 * look identical.
 */
function pageStream(page, pages, rows) {
  const top = A4.height - 90;
  const out = [];

  out.push('0.12 0.21 0.31 rg');
  out.push(`BT /F1 22 Tf 56 ${top + 26} Td (${literal(`STATEMENT ${page} / ${pages}`)}) Tj ET`);
  out.push(`56 ${top + 14} m ${A4.width - 56} ${top + 14} l S`);

  out.push('0.35 0.35 0.35 rg');
  out.push(`BT /F1 9 Tf ${COLUMNS[0]} ${top - 10} Td (Date) Tj ET`);
  out.push(`BT /F1 9 Tf ${COLUMNS[1]} ${top - 10} Td (Reference) Tj ET`);
  out.push(`BT /F1 9 Tf ${COLUMNS[2]} ${top - 10} Td (Account) Tj ET`);
  out.push(`BT /F1 9 Tf ${COLUMNS[3]} ${top - 10} Td (Amount) Tj ET`);

  out.push('0 0 0 rg');
  rows.forEach((row, i) => {
    const y = top - 34 - i * 22;
    row.forEach((cell, c) => {
      out.push(`BT /F1 11 Tf ${COLUMNS[c]} ${y} Td (${literal(cell)}) Tj ET`);
    });
  });

  // A big pale page number, low on the sheet.
  out.push('0.78 0.80 0.82 rg');
  out.push(`BT /F1 96 Tf ${A4.width / 2 - 30} 90 Td (${page}) Tj ET`);

  return new TextEncoder().encode(out.join('\n'));
}

/**
 * Build the document.
 *
 * @param {string} name
 * @param {object} [options]
 * @param {number} [options.pages]
 * @param {Uint8Array[]} [options.jpegs]  one JPEG per page, drawn full width
 *   under the table. The compressor's example needs them - a document of text
 *   alone has almost nothing in it to squeeze - and the other two do not.
 * @param {{width: number, height: number}} [options.jpegSize]
 * @returns {File}
 */
export function examplePdfFile(name, { pages = 3, jpegs = null, jpegSize = null } = {}) {
  const writer = new PdfWriter();

  const catalog = writer.reserve();
  const pagesId = writer.reserve();
  const font = writer.reserve();

  const pageIds = [];
  const contentIds = [];
  const imageIds = [];
  for (let i = 0; i < pages; i += 1) {
    pageIds.push(writer.reserve());
    contentIds.push(writer.reserve());
    imageIds.push(jpegs ? writer.reserve() : null);
  }

  writer.object(font,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');

  for (let i = 0; i < pages; i += 1) {
    // A different slice of the rows per page, so no two pages are identical.
    const start = (i * 2) % ROWS.length;
    const rows = [...ROWS.slice(start), ...ROWS.slice(0, start)].slice(0, 5);
    let stream = pageStream(i + 1, pages, rows);

    if (jpegs) {
      const w = A4.width - 112;
      const h = Math.round(w * (jpegSize.height / jpegSize.width));
      const draw = new TextEncoder().encode(
        `\nq ${num(w)} 0 0 ${num(h)} 56 ${num(120)} cm /Im0 Do Q`);
      const joined = new Uint8Array(stream.length + draw.length);
      joined.set(stream, 0);
      joined.set(draw, stream.length);
      stream = joined;

      writer.stream(imageIds[i],
        ' /Type /XObject /Subtype /Image'
        + ` /Width ${jpegSize.width} /Height ${jpegSize.height}`
        + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode',
        jpegs[i % jpegs.length]);
    }

    writer.stream(contentIds[i], '', stream);

    const xobject = jpegs ? ` /XObject << /Im0 ${imageIds[i]} 0 R >>` : '';
    writer.object(pageIds[i],
      `<< /Type /Page /Parent ${pagesId} 0 R`
      + ` /MediaBox [0 0 ${A4.width} ${A4.height}]`
      + ` /Resources << /Font << /F1 ${font} 0 R >>${xobject} >>`
      + ` /Contents ${contentIds[i]} 0 R >>`);
  }

  writer.object(pagesId,
    `<< /Type /Pages /Count ${pages}`
    + ` /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] >>`);
  writer.object(catalog, `<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

  // No /Info. The tools that read this file report what a document says about
  // whoever made it, and an example arriving with a producer line already in it
  // would be answering that question for them.
  const blob = writer.finish({ root: catalog });
  return new File([blob], name, { type: 'application/pdf', lastModified: Date.now() });
}

/** The `textString` import is re-exported so a caller can label a document. */
export { textString };
