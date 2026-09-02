/**
 * The run itself: decide what each image deserves, do it, write the file, then
 * read the file back and check.
 *
 * The rule the whole tool is built on is the one compress-image settled on next
 * door: **do nothing if nothing is needed**. Every image here is re-encoded on
 * approval rather than on principle. If the new version is not smaller than the
 * old one, the old one goes back in untouched - not "kept because it was close",
 * actually the original bytes, never decoded and never compressed twice. A
 * photograph that was already lean loses nothing by being run through this.
 *
 * What is spent, and in what order:
 *
 *   1. **Resolution first, and only down to what the page uses.** This is the
 *      opposite of the image tool, and the reason is that a PDF says how big
 *      each picture is drawn. A 4000-pixel scan placed across eight inches of
 *      paper is carrying 500 pixels per inch; at 150 it would look the same on
 *      screen and print indistinguishably on anything short of a proof press.
 *      Throwing away pixels nobody can see costs nothing, so it happens before
 *      any quality is spent. placements.js is what makes this measurable
 *      rather than a guess.
 *   2. **Then quality.** Once the pixel count is right, the JPEG dial does the
 *      rest, at whatever the chosen setting says.
 *
 * And the check at the end is not decoration. This tool rewrites somebody's
 * document from its own parse of it, which is a strong claim to make about a
 * format with as many corners as PDF. So the finished file is opened again by
 * the same reader, and its page count and object graph compared with the
 * original. If they disagree, the run is reported as failed and the original is
 * what you keep. A compressor that hands back a broken file has done something
 * far worse than nothing.
 */

import { takeInventory } from './inventory.js';
import {
  decodeImage, findImages, reencode, replaceImage, SKIP,
} from './images.js';
import { effectiveDpi, measurePlacements } from './placements.js';
import { PdfDocument } from './shared/pdf-reader.js';
import { stripMetadata, writeDocument } from './shared/pdf-writer.js';

/**
 * The four settings, and what each is for.
 *
 * The DPI figures are the ones the printing trade has used for decades: 150 is
 * where a photograph stops looking soft on paper, 300 is where a printer stops
 * being able to do anything more with it, and 96 is a screen. The quality
 * figures were chosen the same way compress-image's floor was - by the point
 * where the artefacts start showing on text and flat areas.
 */
export const PRESETS = {
  smallest: { dpi: 96, quality: 0.55 },
  screen: { dpi: 130, quality: 0.68 },
  print: { dpi: 220, quality: 0.82 },
  gentle: { dpi: 0, quality: 0.9 },
};

/** Never shrink an image below this on its long side; past here it is a smudge
 *  rather than a picture, whatever the arithmetic said. */
const MIN_PIXELS = 32;

/**
 * @typedef {object} ImageReport
 * @property {number} num
 * @property {number} before
 * @property {number} after
 * @property {string} action 'recompressed' | 'downsampled' | 'kept'
 * @property {string} note why, in words
 * @property {number} width the size it ended up
 * @property {number} height
 * @property {number} dpiBefore
 * @property {number} dpiAfter
 */

/**
 * @param {Uint8Array} bytes the file as loaded
 * @param {{preset: string, dpi: number, quality: number, stripMeta: boolean}} settings
 * @param {{onStage?: Function, onProgress?: Function, signal?: AbortSignal}} hooks
 */
export async function compressDocument(bytes, settings, hooks = {}) {
  const { onStage, onProgress, signal } = hooks;
  const before = bytes.length;

  onStage?.('stage.reading');
  const doc = await PdfDocument.open(bytes);
  const inventory = takeInventory(doc);

  onStage?.('stage.measuring');
  const placements = await measurePlacements(doc);
  stop(signal);

  onStage?.('stage.images');
  const images = findImages(doc);
  const reports = [];

  for (const [index, entry] of images.entries()) {
    stop(signal);
    onProgress?.(index, images.length);
    // A soft mask is drawn wherever the image it belongs to is drawn, and at
    // the same size, however many pixels it happens to store.
    const placement = placements.get(entry.num) ?? placements.get(entry.maskOf);
    reports.push(await handleImage(doc, entry, placement, settings));
    // Between pictures, so the bar moves and Cancel is a button rather than a
    // suggestion. Decoding a 30-megapixel scan is one long task either way.
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  onProgress?.(images.length, images.length);

  let metadataRemoved = 0;
  if (settings.stripMeta) {
    onStage?.('stage.metadata');
    metadataRemoved = stripMetadata(doc);
  }

  onStage?.('stage.writing');
  const blob = await writeDocument(doc, {
    signal,
    onProgress: (done, total) => onProgress?.(done, total),
  });

  onStage?.('stage.checking');
  const check = await verify(blob, inventory.pages);

  return {
    blob,
    before,
    after: blob.size,
    inventory,
    images: reports,
    metadataRemoved,
    check,
    repaired: doc.repaired,
    incremental: doc.incremental,
  };
}

function stop(signal) {
  if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError');
}

/**
 * One picture.
 *
 * The order of the questions matters, because each one is cheaper than the
 * next: the ones that need no decoding come first, and the picture is only
 * handed to the browser's decoder once every reason to skip it has been ruled
 * out.
 */
async function handleImage(doc, entry, placement, settings) {
  const report = {
    num: entry.num,
    before: entry.bytes,
    after: entry.bytes,
    action: 'kept',
    note: '',
    width: entry.width,
    height: entry.height,
    dpiBefore: 0,
    dpiAfter: 0,
  };

  if (entry.skip) {
    report.note = entry.skip;
    return report;
  }

  if (!placement) {
    // Reachable from the page tree but never painted: an image left in the
    // resources of a page that no longer draws it. It survives the rewrite
    // because something still refers to it, but there is no drawn size to
    // reason about, so it is left exactly as it is.
    report.note = SKIP.unused;
    return report;
  }

  const dpiBefore = effectiveDpi(entry.width, placement.widthPt);
  report.dpiBefore = dpiBefore;

  // How many pixels the page can actually use, at the chosen resolution.
  const wanted = settings.dpi > 0 && placement.widthPt > 0
    ? Math.round((placement.widthPt / 72) * settings.dpi)
    : entry.width;
  const target = Math.max(MIN_PIXELS, Math.min(entry.width, wanted));
  const scale = target / entry.width;

  const source = await decodeImage(doc, entry);
  if (!source) {
    report.note = SKIP.unreadable;
    return report;
  }

  try {
    const made = await reencode(source, {
      width: Math.max(1, Math.round(source.width * scale)),
      height: Math.max(1, Math.round(source.height * scale)),
      quality: settings.quality,
      gray: entry.isSMask,
    });

    if (!made) {
      report.note = 'kept.noencoder';
      return report;
    }

    // The whole rule, in one line: a re-encode that did not win is discarded
    // and the original bytes stay in the document.
    if (made.bytes.length >= entry.bytes) {
      report.note = 'kept.alreadysmall';
      return report;
    }

    replaceImage(entry, made, { gray: entry.isSMask });
    report.after = made.bytes.length;
    report.width = made.width;
    report.height = made.height;
    report.dpiAfter = effectiveDpi(made.width, placement.widthPt);
    report.action = made.width < entry.width ? 'downsampled' : 'recompressed';
    return report;
  } finally {
    if (source.source && typeof source.source.close === 'function') source.source.close();
  }
}

/**
 * Open the finished file with the same reader and see whether it is a document.
 *
 * Page count is the check worth making. It is the one number that depends on
 * the whole chain having survived - the catalogue, the page tree, the object
 * streams, the cross-reference stream and every reference between them. A file
 * whose page count comes back right is not proof of perfection, and this does
 * not claim to be; it is the difference between a bug that is caught here and
 * one that is caught by whoever the document was sent to.
 */
async function verify(blob, expectedPages) {
  try {
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const reopened = await PdfDocument.open(bytes);
    const pages = reopened.countPages();
    if (pages !== expectedPages) {
      return {
        ok: false,
        text: { key: 'check.pages', values: { pages, expected: expectedPages } },
      };
    }
    if (reopened.repaired) {
      return { ok: false, text: { key: 'check.unclean' } };
    }
    return {
      ok: true,
      text: { key: pages === 1 ? 'check.ok.one' : 'check.ok.many', values: { pages } },
    };
  } catch (error) {
    return { ok: false, text: { key: 'check.reopen', values: { detail: error.message } } };
  }
}

/** What the settings add up to, as a sentence for under the controls. */
export function describeSettings(settings) {
  const quality = Math.round(settings.quality * 100);
  if (!settings.dpi) return { key: 'settings.fullsize', values: { quality } };
  return { key: 'settings.downsampled', values: { quality, dpi: settings.dpi } };
}
