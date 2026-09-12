/**
 * Putting the stamp into a document somebody else wrote.
 *
 * Nothing on any page is touched. The stamp is one image object, shared by
 * every page that carries it, and each page gains a small content stream at
 * the END of its list that draws the image - after everything the page
 * already drew, so the stamp lies over the page rather than under it. A
 * second small stream goes at the START of the list, holding a single `q`,
 * so that the page's own drawing can leave the graphics state however it
 * likes and the stamp's `Q` still finds its way back.
 *
 * That is the whole edit: three new objects for the document, two per page,
 * and a resource name added to each page's own /Resources. The page's
 * existing streams are not read, not decoded and not rewritten, which is
 * why a scanned document, a form and a fifty-megabyte brochure all go
 * through this the same way.
 *
 * INHERITED RESOURCES
 *
 * A page may have no /Resources of its own and use its parent's. Adding the
 * stamp's name to the parent's dictionary would add it to every page under
 * that node, which is harmless, but it would also mean editing a dictionary
 * that pages this run is leaving alone can see. So a page without resources
 * of its own gets a copy of the inherited dictionary first, and the name goes
 * into the copy. shared/js/pdf-pages.js is what says which of the four
 * inheritable entries came from where.
 */

import { Name, PdfStream, Ref } from './shared/pdf-objects.js';
import { readPages } from './shared/pdf-pages.js';
import { contentFor, placements, visibleSize, visibleToUser } from './stamp.js';

/** The resource names the stamp is drawn by. Prefixed so as not to collide
 *  with anything a page already names; /Im0 and /GS0 are what every writer
 *  reaches for first. */
export const NAMES = { image: 'AbxWmImg', state: 'AbxWmGs' };

/**
 * @typedef {object} StampImage  what render.js hands back
 * @property {number} width  pixels
 * @property {number} height
 * @property {Uint8Array} rgb  width * height * 3 bytes, the stamp's colour
 * @property {Uint8Array} alpha  width * height bytes, its shape
 */

/**
 * @typedef {object} StampSettings
 * @property {'small'|'medium'|'large'} size
 * @property {boolean} diagonal
 * @property {boolean} tiled
 * @property {number} opacity  0 to 1
 * @property {boolean} firstPageOnly
 */

/**
 * Stamp every page of `doc` in place. The writer does the rest.
 *
 * @param {import('./shared/pdf-reader.js').PdfDocument} doc
 * @param {StampImage} image
 * @param {StampSettings} settings
 * @returns {{pages: number, stamps: number}} how many pages were stamped, and
 *   how many times the stamp was drawn across them
 */
export function stampDocument(doc, image, settings) {
  const pages = readPages(doc);
  const chosen = settings.firstPageOnly ? pages.slice(0, 1) : pages;
  if (chosen.length === 0) return { pages: 0, stamps: 0 };

  const imageRef = addImage(doc, image);
  const stateRef = addObject(doc, new Map([
    ['Type', new Name('ExtGState')],
    ['ca', settings.opacity],
    ['CA', settings.opacity],
  ]));

  // One `q` stream is enough for the whole document: it has no state of its
  // own and every page can point at the same object.
  const openRef = addObject(doc, textStream('q\n'));

  let stamps = 0;
  const aspect = image.width / image.height;

  for (const page of chosen) {
    const visible = visibleSize(page.rotate, page.box);
    const spots = placements(visible, aspect, settings);
    stamps += spots.length;

    const drawing = contentFor(spots, visibleToUser(page.rotate, page.box), NAMES);
    const existing = page.dict.get('Contents');
    const list = existing === undefined
      ? []
      : Array.isArray(doc.resolve(existing)) ? [...doc.resolve(existing)] : [existing];

    // The page's own streams, if any, sit between the `q` and the `Q` that
    // opens the stamp's stream; a page with none needs neither.
    const closing = list.length ? '\nQ\n' : '';
    const drawRef = addObject(doc, textStream(`${closing}${drawing}`));
    page.dict.set('Contents', list.length ? [openRef, ...list, drawRef] : [drawRef]);

    const resources = ownResources(doc, page);
    subDictionary(doc, resources, 'XObject').set(NAMES.image, imageRef);
    subDictionary(doc, resources, 'ExtGState').set(NAMES.state, stateRef);
  }

  return { pages: chosen.length, stamps };
}

/**
 * Does this page draw the stamp? The check the page runs on the finished
 * file: the name in the page's resources, and the last of its content
 * streams ending in the instruction that draws it.
 *
 * @param {import('./shared/pdf-reader.js').PdfDocument} doc
 * @param {ReturnType<typeof readPages>[number]} page
 * @returns {Promise<boolean>}
 */
export async function carriesStamp(doc, page, decode) {
  const resources = doc.resolve(page.dict.get('Resources') ?? page.inherited.get('Resources'));
  const xobjects = resources instanceof Map ? doc.resolve(resources.get('XObject')) : null;
  if (!(xobjects instanceof Map) || !xobjects.has(NAMES.image)) return false;

  const contents = doc.resolve(page.dict.get('Contents'));
  const last = Array.isArray(contents) ? doc.resolve(contents[contents.length - 1]) : contents;
  if (!(last instanceof PdfStream)) return false;
  const text = await decode(last);
  return text.includes(`/${NAMES.image} Do`);
}

/* ---------------------------------------------------------------- objects */

/**
 * The stamp as an image XObject with its shape in a soft mask.
 *
 * RGB for the colour and a separate 8-bit grey stream for the alpha, which is
 * how a PDF carries a picture with transparent parts. Both are written raw
 * here; the shared writer deflates every uncompressed stream on the way out,
 * and a stamp that is mostly transparent deflates to almost nothing.
 */
function addImage(doc, image) {
  const maskRef = addObject(doc, new PdfStream(new Map([
    ['Type', new Name('XObject')],
    ['Subtype', new Name('Image')],
    ['Width', image.width],
    ['Height', image.height],
    ['ColorSpace', new Name('DeviceGray')],
    ['BitsPerComponent', 8],
    ['Length', image.alpha.length],
  ]), image.alpha));

  return addObject(doc, new PdfStream(new Map([
    ['Type', new Name('XObject')],
    ['Subtype', new Name('Image')],
    ['Width', image.width],
    ['Height', image.height],
    ['ColorSpace', new Name('DeviceRGB')],
    ['BitsPerComponent', 8],
    ['SMask', maskRef],
    ['Length', image.rgb.length],
  ]), image.rgb));
}

/** A content stream from text. Latin-1, because a content stream is bytes
 *  and everything this tool writes into one is ASCII. */
function textStream(text) {
  const bytes = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i += 1) bytes[i] = text.charCodeAt(i) & 0xff;
  return new PdfStream(new Map([['Length', bytes.length]]), bytes);
}

/** A new object, numbered past everything the document has or ever had. The
 *  same rule the redactor uses, so two tools cannot disagree about it. */
function addObject(doc, value) {
  let number = 1;
  for (const key of doc.objects.keys()) if (key >= number) number = key + 1;
  for (const key of doc.entries.keys()) if (key >= number) number = key + 1;
  doc.objects.set(number, value);
  return new Ref(number, 0);
}

/**
 * The page's own /Resources dictionary, made if it has none.
 *
 * Inherited resources are copied rather than edited, for the reason in the
 * header. A /Resources that is an indirect reference to a dictionary shared
 * between pages is treated the same way: the copy is this page's, and the
 * shared one is left as it was.
 */
function ownResources(doc, page) {
  const own = page.dict.get('Resources');
  if (own instanceof Map) return own;

  const source = doc.resolve(own ?? page.inherited.get('Resources'));
  const copy = source instanceof Map ? new Map(source) : new Map();
  page.dict.set('Resources', copy);
  return copy;
}

/** /XObject or /ExtGState inside a resources dictionary, made if missing,
 *  and copied if it was shared, for the same reason as the dictionary above. */
function subDictionary(doc, resources, key) {
  const value = resources.get(key);
  if (value instanceof Map) return value;
  const source = doc.resolve(value);
  const copy = source instanceof Map ? new Map(source) : new Map();
  resources.set(key, copy);
  return copy;
}
