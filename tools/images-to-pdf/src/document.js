/**
 * Assembling the document: one page per picture.
 *
 * The shape of a PDF made here is deliberately dull. Every page is a MediaBox,
 * a content stream of three or four operators, and one image; there are no
 * fonts, no annotations, no outlines, no JavaScript - PDF has all of those and
 * this writes none of them. A file that contains nothing but pictures on pages
 * is one that opens in everything, prints predictably, and has nothing in it
 * that anybody has to take on trust.
 */

import { PdfWriter, num, textString } from './shared/pdf-page-writer.js';
import { prepareImage } from './encode.js';
import { layoutPage, placement } from './layout.js';

/** What the document says made it. No version, no machine, no user. */
const PRODUCER = 'abox.tools images to PDF';

/**
 * Build the whole document.
 *
 * @param {object[]} items in page order
 * @param {object} settings
 * @param {{onProgress?: Function, signal?: AbortSignal}} hooks
 * @returns {Promise<{blob: Blob, pages: number, copied: number}>}
 */
export async function buildDocument(items, settings, { onProgress, signal } = {}) {
  if (!items.length) throw new Error('build.noimages');

  const pdf = new PdfWriter();
  const catalog = pdf.reserve();
  const pageTree = pdf.reserve();
  const pageIds = [];
  let copied = 0;

  for (const [index, item] of items.entries()) {
    stopIfCancelled(signal);
    onProgress?.({ done: index, total: items.length, name: item.name });

    const image = await prepareImage(item, settings);
    if (image.copied) copied += 1;

    const page = layoutPage({
      width: image.width,
      height: image.height,
      orientation: image.orientation,
      rotate: item.rotate,
    }, settings);

    pageIds.push(writePage(pdf, pageTree, image, page, settings, item.rotate));

    // Hand the main thread back between pictures, so the progress bar moves and
    // the Cancel button can be pressed. Without this the whole run is one task
    // and the page is frozen for the length of it.
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  stopIfCancelled(signal);
  onProgress?.({ done: items.length, total: items.length, name: '' });

  pdf.object(catalog, `<< /Type /Catalog /Pages ${pageTree} 0 R >>`);
  pdf.object(pageTree, `<< /Type /Pages /Count ${pageIds.length} `
    + `/Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] >>`);

  // Written before finish, because finish writes the table of where every
  // object starts and this is the last object there is.
  const info = writeInfo(pdf, settings);

  return { blob: pdf.finish({ root: catalog, info }), pages: pageIds.length, copied };
}

function stopIfCancelled(signal) {
  if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError');
}

/**
 * One page, and the objects only that page uses.
 *
 * The image is named /Im0 in every page's resources. Names are scoped to the
 * dictionary they appear in, so a hundred pages each calling their own picture
 * /Im0 is correct rather than merely tolerated.
 */
function writePage(pdf, pageTree, image, page, settings, rotate) {
  const imageId = pdf.reserve();
  const contentsId = pdf.reserve();
  const pageId = pdf.reserve();

  const smaskId = image.smask ? pdf.reserve() : 0;
  const iccId = usableIcc(image) ? pdf.reserve() : 0;

  if (smaskId) {
    pdf.stream(smaskId, ` /Type /XObject /Subtype /Image`
      + ` /Width ${image.width} /Height ${image.height}`
      + ' /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /FlateDecode'
      + decodeParms(image, 1), image.smask.data);
  }
  if (iccId) {
    // Written as it came out of the file, uncompressed. A profile is a few
    // kilobytes against a photograph's few megabytes, and deflating it would
    // make this whole function asynchronous to save nothing anyone can measure.
    pdf.stream(iccId, ` /N ${image.gray ? 1 : 3}`
      + ` /Alternate ${image.gray ? '/DeviceGray' : '/DeviceRGB'}`, image.icc);
  }

  const colorSpace = iccId
    ? `[/ICCBased ${iccId} 0 R]`
    : (image.gray ? '/DeviceGray' : '/DeviceRGB');

  pdf.stream(imageId, ' /Type /XObject /Subtype /Image'
    + ` /Width ${image.width} /Height ${image.height}`
    + ` /ColorSpace ${colorSpace} /BitsPerComponent 8`
    + (image.kind === 'dct' ? ' /Filter /DCTDecode' : ' /Filter /FlateDecode')
    + (image.predictor ? decodeParms(image, 3) : '')
    + (smaskId ? ` /SMask ${smaskId} 0 R` : ''), image.data);

  pdf.stream(contentsId, '', contentStream(image, page, settings, rotate));

  pdf.object(pageId, `<< /Type /Page /Parent ${pageTree} 0 R`
    + ` /MediaBox [0 0 ${num(page.width)} ${num(page.height)}]`
    + ` /Resources << /XObject << /Im0 ${imageId} 0 R >> >>`
    + ` /Contents ${contentsId} 0 R >>`);

  return pageId;
}

/**
 * The PNG predictor parameters, which have to describe the same rows the
 * filtering in encode.js wrote. /Columns is in samples, not bytes.
 */
function decodeParms(image, colors) {
  return ` /DecodeParms << /Predictor 15 /Colors ${colors}`
    + ` /BitsPerComponent 8 /Columns ${image.width} >>`;
}

/**
 * A colour profile is only attached if it describes the picture it came with.
 *
 * The number of components in an /ICCBased stream has to match the image, and a
 * mismatch is not a wrong colour - it is a page that will not render in some
 * readers. Bytes 16 to 20 of an ICC profile name its data colour space, so the
 * check is exact and cheap.
 */
function usableIcc(image) {
  if (!image.icc || image.icc.length < 20) return false;
  const space = String.fromCharCode(...image.icc.subarray(16, 20));
  return image.gray ? space === 'GRAY' : space === 'RGB ';
}

/**
 * The page itself, as PDF operators.
 *
 *   q ... Q     save and restore, so nothing here leaks into the next page
 *   rg / re f   the background, painted before anything is put on it
 *   re W n      the clip, used only when a picture is allowed past its box
 *   cm          the placement matrix - position, size and rotation in one
 *   /Im0 Do     draw it
 */
function contentStream(image, page, settings, rotate) {
  const lines = ['q'];

  const [r, g, b] = parseColor(settings.background);
  lines.push(`${num(r)} ${num(g)} ${num(b)} rg`);
  lines.push(`0 0 ${num(page.width)} ${num(page.height)} re f`);

  if (page.clip) {
    lines.push(`${num(page.clip.x)} ${num(page.clip.y)} `
      + `${num(page.clip.width)} ${num(page.clip.height)} re W n`);
  }

  const matrix = placement(page.rect, image.orientation, rotate);
  lines.push(`${matrix.map(num).join(' ')} cm`);
  lines.push('/Im0 Do', 'Q', '');

  return new TextEncoder().encode(lines.join('\n'));
}

/** '#rrggbb' to the three numbers between 0 and 1 that PDF's `rg` wants. */
function parseColor(value) {
  const match = /^#?([0-9a-f]{6})$/i.exec(String(value ?? ''));
  if (!match) return [1, 1, 1];
  const int = parseInt(match[1], 16);
  return [(int >> 16) & 0xff, (int >> 8) & 0xff, int & 0xff].map((c) => c / 255);
}

/**
 * The document information dictionary.
 *
 * Everything in here is either something the person typed or the name of this
 * tool. There is no creation date unless it was asked for, no author unless it
 * was typed, and nothing derived from the machine, the clock, the file names or
 * the pictures. A PDF is a thing people send to other people, and the usual
 * quiet extras - a local timestamp, a user name, a serial number of some sort -
 * would be this tool putting something into a document about the person who
 * made it.
 */
function writeInfo(pdf, settings) {
  const entries = [`/Producer ${textString(PRODUCER)}`];
  if (settings.title?.trim()) entries.push(`/Title ${textString(settings.title.trim())}`);
  if (settings.author?.trim()) entries.push(`/Author ${textString(settings.author.trim())}`);
  if (settings.dated) entries.push(`/CreationDate ${pdfDate(new Date())}`);

  const id = pdf.reserve();
  pdf.object(id, `<< ${entries.join(' ')} >>`);
  return id;
}

/** A PDF date: D:YYYYMMDDHHmmSS+HH'mm', in local time. */
function pdfDate(date) {
  const pad = (value) => String(Math.floor(Math.abs(value))).padStart(2, '0');
  const offset = -date.getTimezoneOffset();
  const zone = offset === 0
    ? 'Z'
    : `${offset > 0 ? '+' : '-'}${pad(offset / 60)}'${pad(offset % 60)}'`;

  return `(D:${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`
    + `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}${zone})`;
}
