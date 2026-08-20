/**
 * tools/compress-pdf/src/{writer,inventory,placements,format,compress}.js.
 *
 * The writer is where a mistake is expensive: it rebuilds the file from the
 * objects that are still reachable, so an object wrongly judged unreachable
 * disappears from a document somebody is about to send to somebody else. The
 * round trip below is the real check - rewrite the document, open the result,
 * and confirm the pages and the content are still there.
 *
 * stripMetadata gets the same argument the EXIF tool makes, applied to a
 * different container: a PDF routinely carries the name of the program that
 * made it and a private blob a layout application left behind, and none of it
 * is needed to display the document.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { PdfDocument } from '../../tools/compress-pdf/src/reader.js';
import { reachable, stripMetadata, writeDocument } from '../../tools/compress-pdf/src/writer.js';
import { Ref, PdfStream } from '../../tools/compress-pdf/src/objects.js';
import { decodeStream } from '../../tools/compress-pdf/src/filters.js';
import { verdict } from '../../tools/compress-pdf/src/inventory.js';
import { effectiveDpi } from '../../tools/compress-pdf/src/placements.js';
import {
  PRESETS, describeSettings,
} from '../../tools/compress-pdf/src/compress.js';
import {
  bytes as sizeText, change, count, dimensions, dpi, outName, share,
} from '../../tools/compress-pdf/src/format.js';
import {
  ascii, blobBytes, buildPdf, deflate, minimalPdf, pdfWithMetadata, streamObject, text,
} from './pdf-fixtures.js';

/* =============================================================== reachable */

test('reachable walks out from the trailer', async () => {
  const doc = await PdfDocument.open(minimalPdf());
  const live = reachable(doc, [doc.trailer.get('Root')]);
  assert.deepEqual([...live].sort(), [1, 2, 3]);
});

test('an object nothing points at is not reachable', async () => {
  const doc = await PdfDocument.open(buildPdf([
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R >>',
    '<< /Orphan (nothing points here) >>',
  ]));
  const live = reachable(doc, [doc.trailer.get('Root')]);
  assert.ok(!live.has(4), 'the orphan is left out');
  assert.equal(live.size, 3);
});

test('reachable follows arrays and nested dictionaries', async () => {
  const doc = await PdfDocument.open(buildPdf([
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Resources << /XObject << /Im0 4 0 R >> >> /Annots [5 0 R] >>',
    '<< /Type /XObject >>',
    '<< /Type /Annot >>',
  ]));
  const live = reachable(doc, [doc.trailer.get('Root')]);
  assert.ok(live.has(4), 'reached through two dictionaries');
  assert.ok(live.has(5), 'reached through an array');
});

test('reachable survives a reference cycle', async () => {
  // A page pointing back at its parent is the normal case, not a broken one.
  const doc = await PdfDocument.open(minimalPdf());
  const live = reachable(doc, [doc.trailer.get('Root')]);
  assert.equal(live.size, 3);
});

test('reachable follows a stream dictionary as well as a plain one', async () => {
  const doc = await PdfDocument.open(buildPdf([
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Contents 4 0 R >>',
    streamObject('/Extra 5 0 R', ascii('content')),
    '<< /Reached (through a stream dict) >>',
  ]));
  const live = reachable(doc, [doc.trailer.get('Root')]);
  assert.ok(live.has(5));
});

/* =========================================================== stripMetadata */

test('stripMetadata takes out what the file remembers about its origin', async () => {
  const doc = await PdfDocument.open(pdfWithMetadata());
  assert.ok(doc.trailer.has('Info'), 'there was something to remove');

  const removed = stripMetadata(doc);
  assert.ok(removed > 0);
  assert.equal(doc.trailer.has('Info'), false);
  assert.equal(doc.catalog.has('Metadata'), false);

  const page = doc.getObject(3);
  assert.equal(page.has('LastModified'), false);
  assert.equal(page.has('PieceInfo'), false);
});

test('stripMetadata leaves the document itself alone', async () => {
  const doc = await PdfDocument.open(pdfWithMetadata());
  stripMetadata(doc);
  assert.equal(doc.countPages(), 1);
  assert.equal(doc.getObject(3).get('MediaBox').length, 4);
});

test('stripMetadata on a file with none removes nothing', async () => {
  const doc = await PdfDocument.open(minimalPdf());
  assert.equal(stripMetadata(doc), 0);
});

/* ============================================================ writeDocument */

test('the rewritten file is a PDF that opens again', async () => {
  const doc = await PdfDocument.open(minimalPdf());
  const out = await blobBytes(await writeDocument(doc, { recompress: false }));

  assert.equal(text(out.subarray(0, 5)), '%PDF-');
  assert.ok(text(out.subarray(out.length - 20)).includes('%%EOF'));

  const again = await PdfDocument.open(out);
  assert.equal(again.countPages(), 1);
  assert.equal(again.repaired, false, 'the xref it wrote is believed');
});

test('the page content survives the rewrite', async () => {
  const content = 'BT /F1 12 Tf 72 720 Td (Hello) Tj ET';
  const doc = await PdfDocument.open(buildPdf([
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /Contents 4 0 R >>',
    streamObject('', ascii(content)),
  ]));
  const out = await blobBytes(await writeDocument(doc, { recompress: false }));

  const again = await PdfDocument.open(out);
  const page = again.resolve(again.resolve(again.catalog.get('Pages')).get('Kids')[0]);
  const stream = again.resolve(page.get('Contents'));
  assert.ok(stream instanceof PdfStream);
  const decoded = await decodeStream(stream, (v) => again.resolve(v));
  assert.equal(new TextDecoder().decode(decoded.bytes), content);
});

/** Catalogue -> page tree -> first page -> its content stream. */
async function firstPageContent(doc) {
  const pages = doc.resolve(doc.catalog.get('Pages'));
  const page = doc.resolve(doc.resolve(pages.get('Kids'))[0]);
  const stream = doc.resolve(page.get('Contents'));
  assert.ok(stream instanceof PdfStream, 'the page has a content stream');
  const decoded = await decodeStream(stream, (v) => doc.resolve(v));
  return new TextDecoder().decode(decoded.bytes);
}

test('a compressed stream still decodes after the rewrite', async () => {
  const content = 'q 1 0 0 1 0 0 cm Q'.repeat(40);
  const doc = await PdfDocument.open(buildPdf([
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /Contents 4 0 R >>',
    streamObject('/Filter /FlateDecode', await deflate(ascii(content))),
  ]));
  const out = await blobBytes(await writeDocument(doc, { recompress: false }));

  const again = await PdfDocument.open(out);
  assert.equal(again.countPages(), 1);
  assert.equal(await firstPageContent(again), content);
});

test('the rewrite packs the small objects into an object stream', async () => {
  // Which is most of where the repack saving comes from, and the reason a
  // rewritten file cannot be compared to the original object by object.
  const doc = await PdfDocument.open(minimalPdf());
  const out = await blobBytes(await writeDocument(doc, { recompress: false }));
  assert.ok(text(out).includes('/ObjStm'), 'objects were packed');

  const again = await PdfDocument.open(out);
  assert.equal(again.catalog.get('Type').value, 'Catalog',
    'and they are still readable through the xref stream');
});

test('an unreferenced object is dropped from the rewrite', async () => {
  const doc = await PdfDocument.open(buildPdf([
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R >>',
    streamObject('', ascii('THIS ORPHAN SHOULD NOT SURVIVE THE REWRITE')),
  ]));
  const out = await blobBytes(await writeDocument(doc, { recompress: false }));
  assert.equal(text(out).includes('THIS ORPHAN SHOULD NOT SURVIVE'), false);
});

test('the blob is typed as a pdf', async () => {
  const doc = await PdfDocument.open(minimalPdf());
  assert.equal((await writeDocument(doc, { recompress: false })).type, 'application/pdf');
});

test('progress is reported and ends at the total', async () => {
  const doc = await PdfDocument.open(minimalPdf());
  const seen = [];
  await writeDocument(doc, { recompress: false, onProgress: (d, t) => seen.push([d, t]) });
  assert.ok(seen.length > 0);
  const [done, total] = seen.at(-1);
  assert.equal(done, total);
});

test('a stripped document round-trips with its metadata gone', async () => {
  const doc = await PdfDocument.open(pdfWithMetadata());
  stripMetadata(doc);
  const out = await blobBytes(await writeDocument(doc, { recompress: false }));

  assert.equal(text(out).includes('Some Layout App'), false);
  assert.equal(text(out).includes('xmpmeta'), false);
  const again = await PdfDocument.open(out);
  assert.equal(again.countPages(), 1);
});

/* ================================================================ verdict */

test('verdict: a file that is mostly images promises a large saving', () => {
  const found = verdict({ images: 900, total: 1000 });
  assert.equal(found.tone, 'good');
  assert.match(found.text, /90% of this file is images/);
});

test('verdict: a middling file says where the floor comes from', () => {
  assert.equal(verdict({ images: 500, total: 1000 }).tone, 'ok');
});

test('verdict: a text document is told so in the same breath', () => {
  // Somebody whose contract cannot be made smaller should be told why.
  const thin = verdict({ images: 100, total: 1000 });
  assert.equal(thin.tone, 'thin');
  assert.match(thin.text, /not much for an image compressor/);

  const none = verdict({ images: 0, total: 1000 });
  assert.equal(none.tone, 'thin');
  assert.match(none.text, /no images in this file/);
});

test('verdict: an empty file does not divide by zero', () => {
  assert.equal(verdict({ images: 0, total: 0 }).tone, 'thin');
});

/* =========================================================== effectiveDpi */

test('effectiveDpi is pixels per inch of the space drawn into', () => {
  // 72 points is an inch, so 300 pixels across 72 points is 300 DPI.
  assert.equal(effectiveDpi(300, 72), 300);
  assert.equal(effectiveDpi(150, 72), 150);
  assert.equal(effectiveDpi(1224, 612), 144);
});

test('effectiveDpi: an image that is never drawn answers zero', () => {
  assert.equal(effectiveDpi(300, 0), 0);
  assert.equal(effectiveDpi(0, 72), 0);
  assert.equal(effectiveDpi(300, 0.001), 0);
  assert.equal(effectiveDpi(NaN, 72), 0);
});

/* ================================================================ wording */

test('bytes: the units a person would use', () => {
  assert.equal(sizeText(0), '0 bytes');
  assert.equal(sizeText(999), '999 bytes');
  assert.equal(sizeText(1024), '1.0 KB');
  assert.equal(sizeText(10240), '10 KB');
  assert.equal(sizeText(1024 * 1024), '1.00 MB');
  assert.equal(sizeText(5.5 * 1024 * 1024), '5.50 MB');
});

test('bytes: nonsense in, zero out', () => {
  assert.equal(sizeText(-1), '0 bytes');
  assert.equal(sizeText(NaN), '0 bytes');
  assert.equal(sizeText(Infinity), '0 bytes');
});

test('change: the honest answer when a run went the wrong way', () => {
  assert.equal(change(1000, 320), '68% smaller');
  assert.equal(change(1000, 1050), '5% larger');
  assert.equal(change(1000, 1000), 'about the same size');
  assert.equal(change(0, 100), '');
});

test('share: never rounded up to 100 unless it really is all of it', () => {
  assert.equal(share(1000, 1000), '100%');
  assert.equal(share(999, 1000), '99%');
  assert.equal(share(9999, 10000), '99%', 'not 100 while a byte is left');
  assert.equal(share(1, 1000), '<1%');
  assert.equal(share(0, 1000), '0%');
  assert.equal(share(5, 0), '0%');
});

test('dpi: rounded, and empty when there is nothing to say', () => {
  assert.equal(dpi(300), '300 DPI');
  assert.equal(dpi(149.6), '150 DPI');
  assert.equal(dpi(0), '');
  assert.equal(dpi(-1), '');
});

test('dimensions: a real multiplication sign', () => {
  assert.equal(dimensions(2480, 3508), '2480 × 3508');
});

test('outName: the extension is kept, because it is still a PDF', () => {
  assert.equal(outName('contract.pdf'), 'contract-compressed.pdf');
  assert.equal(outName('CONTRACT.PDF'), 'CONTRACT-compressed.pdf');
  assert.equal(outName('report'), 'report-compressed.pdf');
  assert.equal(outName('.pdf'), 'document-compressed.pdf');
});

test('outName: only the trailing extension goes', () => {
  assert.equal(outName('v1.pdf.pdf'), 'v1.pdf-compressed.pdf');
});

test('count: one image, fourteen images', () => {
  assert.equal(count(1, 'image'), '1 image');
  assert.equal(count(14, 'image'), '14 images');
  assert.equal(count(0, 'image'), '0 images');
  assert.equal(count(1, 'entry', 'entries'), '1 entry');
  assert.equal(count(3, 'entry', 'entries'), '3 entries');
});

/* =============================================================== presets */

test('the presets are ordered the way the trade uses them', () => {
  assert.ok(PRESETS.smallest.dpi < PRESETS.screen.dpi);
  assert.ok(PRESETS.screen.dpi < PRESETS.print.dpi);
  assert.ok(PRESETS.smallest.quality < PRESETS.screen.quality);
  assert.ok(PRESETS.screen.quality < PRESETS.print.quality);
  assert.ok(PRESETS.print.quality < PRESETS.gentle.quality);
  assert.equal(PRESETS.gentle.dpi, 0, 'gentle does not resize at all');
});

test('every preset has a label to show', () => {
  for (const [key, preset] of Object.entries(PRESETS)) {
    assert.equal(typeof preset.label, 'string', key);
    assert.ok(preset.label.length > 0, key);
  }
});

test('describeSettings says what the controls add up to', () => {
  assert.match(describeSettings({ dpi: 150, quality: 0.7 }),
    /at most 150 pixels per inch.*JPEG quality 70/s);
  assert.match(describeSettings({ dpi: 0, quality: 0.9 }),
    /kept at their full size/);
  assert.match(describeSettings({ dpi: 0, quality: 0.9 }), /JPEG quality 90/);
});
