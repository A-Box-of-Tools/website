/**
 * The PDF: one sheet, and the two sides of the card on it at their real size.
 *
 * The sheet is never drawn as a picture here. Each side goes in as its own
 * JPEG, placed by a matrix in points, so the card measures 85.6 by 53.98
 * millimetres on the paper because the file says so in numbers - not because a
 * picture of a whole sheet happened to be scaled to the right size. That is
 * also why the PDF is the file to print: a print dialog that leaves a PDF at
 * "actual size" puts the card on the paper exactly as big as the card.
 *
 * Like the document scanner's, it carries no date, no author and nothing about
 * the machine or the photographs it was made from. It is a picture of an
 * identity card, and the usual quiet extras would be this tool writing
 * something about the person into a file that is going to be handed to a
 * stranger.
 */

import { PdfWriter, PT_PER_MM, num, textString } from './shared/pdf-page-writer.js';

const PRODUCER = 'abox.tools ID card copy';

/**
 * @param {{width: number, height: number, rects: object[]}} plan  millimetres,
 *   from the top left
 * @param {{data: Uint8Array, width: number, height: number}[]} images  JPEG
 *   bytes, one per rectangle in the plan
 * @returns {Blob}
 */
export function buildPdf(plan, images) {
  if (!images.length || images.length !== plan.rects.length) throw new Error('build.nocards');

  const pdf = new PdfWriter();
  const catalog = pdf.reserve();
  const tree = pdf.reserve();
  const imageIds = images.map(() => pdf.reserve());
  const contents = pdf.reserve();
  const page = pdf.reserve();

  images.forEach((image, index) => {
    pdf.stream(imageIds[index], ' /Type /XObject /Subtype /Image'
      + ` /Width ${image.width} /Height ${image.height}`
      + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode', image.data);
  });

  const width = plan.width * PT_PER_MM;
  const height = plan.height * PT_PER_MM;
  pdf.stream(contents, '', contentStream(plan, width, height));

  const names = imageIds.map((id, index) => `/Im${index} ${id} 0 R`).join(' ');
  pdf.object(page, `<< /Type /Page /Parent ${tree} 0 R`
    + ` /MediaBox [0 0 ${num(width)} ${num(height)}]`
    + ` /Resources << /XObject << ${names} >> >>`
    + ` /Contents ${contents} 0 R >>`);
  pdf.object(catalog, `<< /Type /Catalog /Pages ${tree} 0 R >>`);
  pdf.object(tree, `<< /Type /Pages /Count 1 /Kids [${page} 0 R] >>`);

  const info = pdf.reserve();
  pdf.object(info, `<< /Producer ${textString(PRODUCER)} >>`);
  return pdf.finish({ root: catalog, info });
}

/**
 * The sheet painted white, then each side drawn into its rectangle.
 *
 * PDF's origin is the bottom left with y going up, and the plan's is the top
 * left with y going down, so each rectangle's y is measured from the other end.
 */
export function contentStream(plan, width, height) {
  const lines = ['q', '1 1 1 rg', `0 0 ${num(width)} ${num(height)} re f`, 'Q'];
  plan.rects.forEach((rect, index) => {
    const w = rect.width * PT_PER_MM;
    const h = rect.height * PT_PER_MM;
    const x = rect.x * PT_PER_MM;
    const y = height - (rect.y + rect.height) * PT_PER_MM;
    lines.push('q', `${num(w)} 0 0 ${num(h)} ${num(x)} ${num(y)} cm`, `/Im${index} Do`, 'Q');
  });
  lines.push('');
  return new TextEncoder().encode(lines.join('\n'));
}
