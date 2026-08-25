/**
 * Applying the plan to the document.
 *
 * By the time anything here runs, the decisions have been made: `text.js` found
 * the glyphs, a person ticked the ones to go, and `edit.js` worked out what
 * each affected operator should say instead. This is the part that writes those
 * changes into the object graph and hands the result to the writer the
 * compressor and the merger already share.
 *
 * WHAT ELSE GOES, AND WHY IT IS NOT OPTIONAL
 *
 * A redacted document keeps its old /Info dictionary and its old XMP packet
 * unless something takes them out, and both of them routinely name the file
 * the document started as - "Smith divorce petition draft 3.docx" - along with
 * the author and the machine. Removing a name from the pages of a file whose
 * properties still say whose file it is would be a strange thing to leave to a
 * checkbox, so `stripMetadata` runs on every job.
 *
 * A STREAM CAN BE ON MORE THAN ONE PAGE
 *
 * Headers, footers, letterheads and watermarks are usually one form XObject
 * drawn by every page. Editing it edits all of them at once, which is more
 * than was asked for - and which is safe in the only direction that matters,
 * because it removes more rather than less. It is reported rather than
 * prevented: the alternative is copying the block and rewriting whichever
 * resource dictionary refers to it, and those dictionaries are shared too, so
 * the rewrite has the same problem one level up.
 */

import { applySplices, encode } from './content.js';
import { planEdits } from './edit.js';
import { PdfStream, Ref } from './objects.js';
import { removeCarriedFiles, scrubStrings } from './strings.js';
import { stripMetadata, writeDocument } from './writer.js';

/**
 * @param {import('./reader.js').PdfDocument} doc
 * @param {import('./text.js').Page[]} pages
 * @param {Map<number, Set<number>>} chosen  page index to glyph indices
 * @param {object} options
 * @param {{onProgress?: Function, signal?: AbortSignal}} hooks
 */
export async function redact(doc, pages, chosen, options = {}, hooks = {}) {
  const {
    boxes = true, elsewhere = true, attachments = true, texts = [],
  } = options;
  const report = {
    pages: [],
    shared: 0,
    overImage: 0,
    strings: { changed: 0, where: [] },
    attachments: 0,
    actions: 0,
    metadata: 0,
  };

  // One function for everything that is text rather than glyphs, so that no two
  // passes can disagree about what "removed" means. It runs over the page's own
  // replacement text whatever the options say - /ActualText is part of the
  // page, not part of "elsewhere", and a page whose glyphs are gone and whose
  // replacement text still spells the word has not been redacted.
  const scrub = texts.length ? remover(texts) : null;

  // Splices are collected before any of them is applied. A form XObject drawn
  // on several pages is one stream with one set of bytes, so editing it once
  // per page would write the second page's version over the first page's.
  const jobs = new Map();

  pages.forEach((page, index) => {
    const removing = chosen.get(index);
    if (!removing || !removing.size) return;

    const plan = planEdits(page, removing, { boxes, remove: scrub });
    const behind = [...removing].filter((glyph) => hidesBehindPicture(page, glyph));

    for (const [sid, splices] of plan.splices) {
      const stream = page.streams.get(sid);
      if (!stream) continue;
      const key = sid === 'page' ? `page:${index}` : sid;

      if (!jobs.has(key)) {
        jobs.set(key, { page, stream, splices: [], overlay: '', pages: 0 });
      }
      const job = jobs.get(key);
      job.splices.push(...splices);
      job.pages += 1;
    }

    // A page whose words were all drawn by a form XObject still needs its own
    // stream rewritten, because that is where the black boxes go.
    if (plan.overlay && page.streams.has('page')) {
      const key = `page:${index}`;
      if (!jobs.has(key)) {
        jobs.set(key, {
          page, stream: page.streams.get('page'), splices: [], overlay: '', pages: 1,
        });
      }
      jobs.get(key).overlay = plan.overlay;
    }

    report.overImage += behind.length;
    report.pages.push({
      number: page.number,
      removed: removing.size,
      boxes: plan.marks.length,
      overImage: behind.length,
    });
  });

  for (const [key, job] of jobs) {
    const bytes = applySplices(job.stream.bytes, job.splices);
    if (key.startsWith('page:')) writePageContent(doc, job.page, bytes, job.overlay);
    else writeStream(job.stream.stream, bytes);
    if (job.pages > 1) report.shared += 1;
  }

  hooks.onProgress?.('edited');

  if (scrub && elsewhere) report.strings = scrubStrings(doc, scrub);
  if (attachments) {
    const carried = removeCarriedFiles(doc);
    report.attachments = carried.attachments;
    report.actions = carried.actions;
  }
  report.metadata = stripMetadata(doc);

  hooks.onProgress?.('writing');
  const blob = await writeDocument(doc, { signal: hooks.signal });
  return { bytes: new Uint8Array(await blob.arrayBuffer()), report };
}

/**
 * A function that takes every one of the removed strings out of a piece of
 * text, longest first so that removing "Smith" cannot leave the "Mr " of
 * "Mr Smith" behind when both were chosen.
 */
export function remover(texts) {
  const ordered = [...new Set(texts.filter(Boolean))]
    .sort((a, b) => b.length - a.length);

  return (text) => {
    let out = text;
    for (const term of ordered) {
      if (!term.trim()) continue;
      out = out.split(term).join('');
    }
    return out;
  };
}

/**
 * The page's content, rewritten as a single stream.
 *
 * A new object rather than an edit of the old one, because /Contents may have
 * been an array of several streams which this tool read as the one stream the
 * specification says they are. The old objects are simply not referred to any
 * more, and the writer only writes what the catalogue can still reach.
 */
function writePageContent(doc, page, bytes, overlay) {
  const tail = overlay ? encode(overlay) : new Uint8Array(0);
  const joined = new Uint8Array(bytes.length + tail.length);
  joined.set(bytes, 0);
  joined.set(tail, bytes.length);

  const stream = new PdfStream(new Map([['Length', joined.length]]), joined);
  page.page.set('Contents', addObject(doc, stream));
}

/** A stream that has been edited: the bytes are now the decoded ones, so the
 *  filter that described the old ones has to go with them. */
function writeStream(stream, bytes) {
  stream.raw = bytes;
  stream.dict.delete('Filter');
  stream.dict.delete('DecodeParms');
  stream.dict.set('Length', bytes.length);
}

function addObject(doc, value) {
  let number = 1;
  for (const key of doc.objects.keys()) if (key >= number) number = key + 1;
  for (const key of doc.entries.keys()) if (key >= number) number = key + 1;
  doc.objects.set(number, value);
  return new Ref(number, 0);
}

/**
 * Whether the words being removed are also drawn as a picture.
 *
 * This is the scanned-document case, and it is the one thing this tool cannot
 * fix. A scanner writes the page as a photograph and lays the text its OCR
 * found invisibly on top so the page can be searched; removing that text layer
 * removes what a search and a copy would find, and changes nothing about the
 * picture, in which the words are still perfectly legible.
 *
 * Saying so is the whole of the honest answer here. The alternative - decoding
 * the scan, painting over the pixels and re-encoding it - is the image
 * redactor's job on a different kind of file, and quietly re-encoding somebody
 * as answer to this would be a surprising thing for a page-editing tool to do.
 */
function hidesBehindPicture(page, index) {
  const glyph = page.glyphs[index];
  if (!glyph) return false;
  if (glyph.invisible) return true;

  return page.images.some((image) => {
    const box = unitSquare(image.ctm);
    return glyph.origin.x >= box.left && glyph.origin.x <= box.right
      && glyph.origin.y >= box.bottom && glyph.origin.y <= box.top;
  });
}

/** Every image is drawn into the unit square, so its matrix is its position. */
function unitSquare(m) {
  if (!Array.isArray(m)) return { left: 0, right: 0, top: 0, bottom: 0 };
  const xs = [m[4], m[0] + m[4], m[2] + m[4], m[0] + m[2] + m[4]];
  const ys = [m[5], m[1] + m[5], m[3] + m[5], m[1] + m[3] + m[5]];
  return {
    left: Math.min(...xs),
    right: Math.max(...xs),
    bottom: Math.min(...ys),
    top: Math.max(...ys),
  };
}
