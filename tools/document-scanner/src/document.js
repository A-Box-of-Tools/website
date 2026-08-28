/**
 * Assembling the document: one straightened page per page.
 *
 * The shape of the PDF made here is deliberately dull. Every page is a MediaBox,
 * a content stream of four operators, and one image; there are no fonts, no
 * annotations, no outlines and no JavaScript - PDF has all of those and this
 * writes none of them. A file that contains nothing but pictures on pages is one
 * that opens in everything, prints predictably, and has nothing in it that
 * anybody has to take on trust.
 *
 * There is no creation date, no author, no producer version and nothing derived
 * from the machine, the clock or the file names. A scan is a thing people send
 * to other people, usually because an office asked them for it, and the usual
 * quiet extras would be this tool putting something into a document about the
 * person who made it.
 */

import { PdfWriter, PT_PER_INCH, PT_PER_MM, num, textString } from './pdf.js';

/** What the document says made it. No version, no machine, no user. */
const PRODUCER = 'abox.tools document scanner';

/** Named page sizes, in millimetres, portrait. */
export const PAGE_SIZES = {
  a4: [210, 297],
  a5: [148, 210],
  letter: [215.9, 279.4],
  legal: [215.9, 355.6],
};

/**
 * Where one page goes: how big the sheet is, and what rectangle on it the scan
 * is drawn into.
 *
 * PDF measures in points - a seventy-second of an inch - with the origin at the
 * bottom left and y increasing upwards, which is the opposite of a canvas. Every
 * rectangle here is in that space.
 *
 * "Fit" is the default and is the one that is right for a scan: the sheet
 * becomes the size the page really is, at the resolution it was scanned at, so
 * nothing is letterboxed and a straightened A4 comes out as an A4-shaped sheet
 * without anybody having to say so. The named sizes are for the other case,
 * where somebody has been asked for A4 specifically and the scan has to be put
 * on one whatever shape it came out.
 *
 * @param {{width: number, height: number}} page in pixels
 * @param {object} settings
 */
export function layoutPage(page, settings) {
  const margin = Math.max(0, Number(settings.margin) || 0) * PT_PER_MM;

  if (settings.pageSize === 'fit') {
    const dpi = Math.min(1200, Math.max(36, Number(settings.dpi) || 200));
    const width = (page.width * PT_PER_INCH) / dpi;
    const height = (page.height * PT_PER_INCH) / dpi;
    return {
      width: width + margin * 2,
      height: height + margin * 2,
      rect: { x: margin, y: margin, width, height },
    };
  }

  const [shortSide, longSide] = PAGE_SIZES[settings.pageSize] ?? PAGE_SIZES.a4;
  const portrait = page.height >= page.width;
  const sheet = portrait
    ? [shortSide * PT_PER_MM, longSide * PT_PER_MM]
    : [longSide * PT_PER_MM, shortSide * PT_PER_MM];

  const box = {
    x: margin,
    y: margin,
    width: Math.max(1, sheet[0] - margin * 2),
    height: Math.max(1, sheet[1] - margin * 2),
  };

  // Always "fit inside", never "fill". A scan cropped to fill a sheet loses
  // whatever was at the edge of it, and what is at the edge of a scan is a page
  // number, a signature line, or the bit of the form somebody will say is
  // missing.
  const scale = Math.min(box.width / page.width, box.height / page.height);
  const width = page.width * scale;
  const height = page.height * scale;

  return {
    width: sheet[0],
    height: sheet[1],
    rect: {
      x: box.x + (box.width - width) / 2,
      y: box.y + (box.height - height) / 2,
      width,
      height,
    },
  };
}

/**
 * Build the document.
 *
 * @param {Array<{kind: string, data: Uint8Array, width: number, height: number}>} pages
 *   already encoded, in order
 * @param {object} settings
 * @returns {Blob}
 */
export function buildDocument(pages, settings) {
  if (!pages.length) throw new Error('build.nopages');

  const pdf = new PdfWriter();
  const catalog = pdf.reserve();
  const tree = pdf.reserve();
  const ids = [];

  for (const page of pages) {
    ids.push(writePage(pdf, tree, page, layoutPage(page, settings)));
  }

  pdf.object(catalog, `<< /Type /Catalog /Pages ${tree} 0 R >>`);
  pdf.object(tree, `<< /Type /Pages /Count ${ids.length} `
    + `/Kids [${ids.map((id) => `${id} 0 R`).join(' ')}] >>`);

  const info = writeInfo(pdf, settings);
  return pdf.finish({ root: catalog, info });
}

/**
 * One page, and the objects only that page uses.
 *
 * The image is named /Im0 in every page's resources. Names are scoped to the
 * dictionary they appear in, so twenty pages each calling their own picture /Im0
 * is correct rather than merely tolerated.
 */
function writePage(pdf, tree, image, sheet) {
  const imageId = pdf.reserve();
  const contentsId = pdf.reserve();
  const pageId = pdf.reserve();

  const bits = image.kind === 'flate1' ? 1 : 8;
  pdf.stream(imageId, ' /Type /XObject /Subtype /Image'
    + ` /Width ${image.width} /Height ${image.height}`
    + ` /ColorSpace ${image.gray ? '/DeviceGray' : '/DeviceRGB'}`
    + ` /BitsPerComponent ${bits}`
    + (image.kind === 'dct' ? ' /Filter /DCTDecode' : ' /Filter /FlateDecode'), image.data);

  pdf.stream(contentsId, '', contentStream(sheet));

  pdf.object(pageId, `<< /Type /Page /Parent ${tree} 0 R`
    + ` /MediaBox [0 0 ${num(sheet.width)} ${num(sheet.height)}]`
    + ` /Resources << /XObject << /Im0 ${imageId} 0 R >> >>`
    + ` /Contents ${contentsId} 0 R >>`);

  return pageId;
}

/**
 * The page itself, as PDF operators.
 *
 *   q ... Q     save and restore, so nothing here leaks into the next page
 *   rg / re f   the sheet, painted before anything is put on it
 *   cm          the placement matrix: size and position in one
 *   /Im0 Do     draw it
 *
 * The white rectangle is not decoration. An image is drawn into the unit square
 * and scaled by the matrix, so on a named page size with a margin there is bare
 * sheet around the scan - and bare sheet in a PDF is whatever the reader decides
 * to paint behind the page, which is usually white and is not always.
 */
function contentStream(sheet) {
  const { rect } = sheet;
  const lines = [
    'q',
    '1 1 1 rg',
    `0 0 ${num(sheet.width)} ${num(sheet.height)} re f`,
    `${num(rect.width)} 0 0 ${num(rect.height)} ${num(rect.x)} ${num(rect.y)} cm`,
    '/Im0 Do',
    'Q',
    '',
  ];
  return new TextEncoder().encode(lines.join('\n'));
}

/**
 * The document information dictionary: the name of this tool, and a title only
 * if somebody typed one.
 */
function writeInfo(pdf, settings) {
  const entries = [`/Producer ${textString(PRODUCER)}`];
  const title = settings.title?.trim();
  if (title) entries.push(`/Title ${textString(title)}`);

  const id = pdf.reserve();
  pdf.object(id, `<< ${entries.join(' ')} >>`);
  return id;
}
