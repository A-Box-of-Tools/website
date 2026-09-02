/**
 * tools/redact-pdf/src/text.js - where every word on a page is.
 *
 * Two things have to come out of a page and they have to agree exactly: the
 * text as a reader would copy it, and, for each character of it, the glyph
 * that drew it. Everything downstream is indexed off that agreement, so a
 * test here that only checked the text would miss the failure that matters -
 * the right words with the wrong offsets behind them, which removes the wrong
 * bytes and is invisible until somebody opens the finished file.
 *
 * The fixtures are written as content streams by hand, because that is what
 * the module reads and because the awkward cases - a form XObject with a
 * matrix, an appearance stream fitted to an annotation's rectangle, an OCR
 * layer in render mode 3 - cannot be produced any other way.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { PdfDocument } from '../../shared/js/pdf-reader.js';
import { glyphsIn } from '../../tools/redact-pdf/src/matches.js';
import { cornersOf, pagesOf, readPage } from '../../tools/redact-pdf/src/text.js';
import { ascii, buildPdf, streamObject } from './pdf-fixtures.js';

const HELVETICA = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';

/**
 * A one-page document whose content is the stream given.
 *
 * Object 4 is the content and object 5 the font, so a fixture that needs more
 * objects adds them from 6 and refers to them by number.
 */
async function pageOf(content, { page = '', extra = [] } = {}) {
  const bytes = buildPdf([
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] `
    + `/Resources << /Font << /F1 5 0 R >> ${page ? '' : ''}>> /Contents 4 0 R ${page} >>`,
    streamObject('', ascii(content)),
    HELVETICA,
    ...extra,
  ]);
  const doc = await PdfDocument.open(bytes);
  return { doc, page: await readPage(doc, pagesOf(doc)[0], 1) };
}

/** The same, with a resource dictionary written out in full. */
async function pageWith(resources, content, extra, entries = '') {
  const bytes = buildPdf([
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] `
    + `/Resources ${resources} /Contents 4 0 R ${entries} >>`,
    streamObject('', ascii(content)),
    HELVETICA,
    ...extra,
  ]);
  const doc = await PdfDocument.open(bytes);
  return { doc, page: await readPage(doc, pagesOf(doc)[0], 1) };
}

/* ==================================================================== text */

test('a page comes back as the text a reader would copy', async () => {
  const { page } = await pageOf('BT /F1 12 Tf 72 700 Td (Dear Mr Smith) Tj ET');
  assert.equal(page.text, 'Dear Mr Smith');
  assert.equal(page.unreadable, 0);
  assert.equal(page.glyphs.length, 13);
});

test('every character knows which glyph drew it', async () => {
  const { page } = await pageOf('BT /F1 12 Tf 72 700 Td (Smith) Tj ET');
  assert.deepEqual([...page.owner], [0, 1, 2, 3, 4]);
  const s = page.glyphs[page.owner[0]];
  assert.equal(s.text, 'S');
  assert.equal(s.sid, 'page');
  assert.equal(s.at, 0);
  assert.equal(s.size, 1);
  assert.equal(page.glyphs[page.owner[4]].at, 4);
});

test('a TJ array is one operator with a part index per string', async () => {
  const { page } = await pageOf('BT /F1 12 Tf 72 700 Td [(Ac)-200(count)] TJ ET');
  assert.equal(page.text, 'Account');
  // The part is the position in the array, so the kern between the two strings
  // takes index 1 - which is exactly what the editor needs to rebuild it.
  assert.deepEqual(page.glyphs.map((g) => g.part), [0, 0, 2, 2, 2, 2, 2]);
  assert.deepEqual(page.glyphs.map((g) => g.at), [0, 1, 0, 1, 2, 3, 4]);
});

test('a gap wide enough to be a space is read as one', async () => {
  // -400 thousandths at 12pt is 4.8 points, well past a space's worth of gap.
  const { page } = await pageOf('BT /F1 12 Tf 72 700 Td [(one)-400(two)] TJ ET');
  assert.equal(page.text, 'one two');
  assert.equal(page.owner[3], -1);
});

test('an ordinary kern between letters is not read as a space', async () => {
  const { page } = await pageOf('BT /F1 12 Tf 72 700 Td [(A)-20(V)] TJ ET');
  assert.equal(page.text, 'AV');
});

test('lines are sorted down the page rather than in drawing order', async () => {
  const { page } = await pageOf(
    'BT /F1 12 Tf 72 600 Td (second) Tj 0 100 Td (first) Tj ET',
  );
  assert.equal(page.text, 'first\nsecond');
  assert.deepEqual(page.lines, [{ from: 0, to: 5 }, { from: 6, to: 12 }]);
});

test('two runs on one baseline are one line, in the order they sit', async () => {
  const { page } = await pageOf(
    'BT /F1 12 Tf 200 700 Td (right) Tj 1 0 0 1 72 700 Tm (left) Tj ET',
  );
  assert.equal(page.text, 'left right');
  assert.equal(page.lines.length, 1);
});

/* ============================================================== positions */

test('a glyph lands where the text matrix put it', async () => {
  const { page } = await pageOf('BT /F1 12 Tf 72 700 Td (AB) Tj ET');
  const [a, b] = page.glyphs;
  assert.equal(Math.round(a.origin.x), 72);
  assert.equal(Math.round(a.origin.y), 700);
  // A is 667 thousandths wide at 12 points, so B starts 8.004 points along.
  assert.ok(Math.abs(b.origin.x - 80.004) < 0.001);
});

test('the page matrix is carried into the glyph', async () => {
  const { page } = await pageOf(
    'q 2 0 0 2 10 10 cm BT /F1 12 Tf 0 100 Td (A) Tj ET Q',
  );
  const [a] = page.glyphs;
  assert.equal(a.origin.x, 10);
  assert.equal(a.origin.y, 210);
  assert.equal(a.height, 24);
});

test('a glyph box runs from the font descender to its ascender', async () => {
  const { page } = await pageOf('BT /F1 10 Tf 72 700 Td (A) Tj ET');
  const [bottomLeft, bottomRight, topRight] = cornersOf(page.glyphs[0]);
  assert.equal(Math.round(bottomLeft.x), 72);
  assert.ok(bottomLeft.y < 700 && bottomLeft.y > 690);
  assert.ok(topRight.y > 700 && topRight.y < 710);
  assert.ok(Math.abs(bottomRight.x - (72 + 6.67)) < 0.01);
});

test('character and word spacing move the pen', async () => {
  const plain = await pageOf('BT /F1 12 Tf 72 700 Td (a a) Tj ET');
  const spaced = await pageOf('BT /F1 12 Tf 5 Tc 10 Tw 72 700 Td (a a) Tj ET');
  const last = (found) => found.page.glyphs[2].origin.x;
  // Two characters of Tc and one space of Tw before the third glyph.
  assert.ok(Math.abs(last(spaced) - last(plain) - 20) < 0.001);
});

test('the horizontal scale multiplies the advance', async () => {
  const { page } = await pageOf('BT /F1 12 Tf 50 Tz 72 700 Td (AB) Tj ET');
  assert.ok(Math.abs(page.glyphs[1].origin.x - (72 + 8.004 / 2)) < 0.001);
});

test('T* and the leading move down a line', async () => {
  const { page } = await pageOf(
    'BT /F1 12 Tf 14 TL 72 700 Td (one) Tj T* (two) Tj ET',
  );
  assert.equal(page.text, 'one\ntwo');
  assert.equal(page.glyphs[3].origin.y, 686);
});

test("the ' operator moves to the next line before it draws", async () => {
  const { page } = await pageOf("BT /F1 12 Tf 14 TL 72 700 Td (one) Tj (two) ' ET");
  assert.equal(page.text, 'one\ntwo');
  assert.equal(page.glyphs[3].origin.y, 686);
});

test('the " operator sets the two spacings as well', async () => {
  const { page } = await pageOf('BT /F1 12 Tf 14 TL 72 700 Td 10 5 (a a) " ET');
  assert.equal(page.glyphs[0].wordSpacing, 0);
  assert.equal(page.glyphs[1].wordSpacing, 10);
  assert.equal(page.glyphs[1].charSpacing, 5);
});

/* ============================================================== the rest */

test('text inside a form XObject is found, with the form matrix applied', async () => {
  const { page } = await pageWith(
    '<< /Font << /F1 5 0 R >> /XObject << /Fx 6 0 R >> >>',
    'q 1 0 0 1 0 0 cm /Fx Do Q',
    [streamObject(
      '/Type /XObject /Subtype /Form /BBox [0 0 200 50] /Matrix [1 0 0 1 40 500] '
      + '/Resources << /Font << /F1 5 0 R >> >>',
      ascii('BT /F1 12 Tf 10 10 Td (Letterhead) Tj ET'),
    )],
  );

  assert.equal(page.text, 'Letterhead');
  assert.equal(page.glyphs[0].sid, 'obj:6');
  assert.equal(page.glyphs[0].origin.x, 50);
  assert.equal(page.glyphs[0].origin.y, 510);
});

test('an annotation appearance is read and fitted to its rectangle', async () => {
  const { page } = await pageWith(
    '<< /Font << /F1 5 0 R >> >>',
    'BT /F1 12 Tf 72 700 Td (Name:) Tj ET',
    [
      '<< /Type /Annot /Subtype /Widget /FT /Tx /T (name) (x) '
      + '/Rect [200 690 400 710] /AP << /N 7 0 R >> >>',
      streamObject(
        '/Type /XObject /Subtype /Form /BBox [0 0 200 20] '
        + '/Resources << /Font << /F1 5 0 R >> >>',
        ascii('BT /F1 12 Tf 2 5 Td (Jane Smith) Tj ET'),
      ),
    ],
    '/Annots [6 0 R]',
  );

  assert.ok(page.text.includes('Jane Smith'));
  const jane = page.glyphs.find((glyph) => glyph.text === 'J');
  assert.equal(jane.sid, 'obj:7');
  assert.equal(jane.origin.x, 202);
  assert.equal(jane.origin.y, 695);
});

test('invisible text is found and marked, because that is the OCR layer', async () => {
  const { page } = await pageOf('BT 3 Tr /F1 12 Tf 72 700 Td (scanned words) Tj ET');
  assert.equal(page.text, 'scanned words');
  assert.ok(page.glyphs.every((glyph) => glyph.invisible));
});

test('an /ActualText replacement is the text, because it is what copies', async () => {
  const { page } = await pageOf(
    'BT /F1 12 Tf 72 700 Td (Dear ) Tj /Span << /ActualText (Smith) >> BDC '
    + '(Sm) Tj EMC ET',
  );
  // The glyphs spell "Sm" and the document says they spell "Smith". A reader
  // copies the second, so a search that offered the first would tell somebody
  // their name is not in a document that hands it over on Ctrl+C.
  assert.equal(page.text, 'Dear Smith');
  assert.equal(page.marked.length, 1);
  assert.equal(page.marked[0].sid, 'page');
  assert.deepEqual(page.groups.get(0), [5, 6]);
});

test('a span is taken whole: every character of it names every glyph', async () => {
  const { page } = await pageOf(
    'BT /F1 12 Tf 72 700 Td /Span << /ActualText (Smith) >> BDC (Sm) Tj EMC ET',
  );
  // The last character of the replacement is the first glyph's as far as the
  // map goes, and touching any of it has to take both glyphs with it.
  assert.deepEqual([...page.owner], [0, 0, 0, 0, 0]);
  assert.deepEqual([...glyphsIn(page, 4, 5)].sort(), [0, 1]);
});

test('an unbalanced q is counted, so the overlay can unwind it', async () => {
  const { page } = await pageOf('q q 1 0 0 1 0 0 cm BT /F1 12 Tf 72 700 Td (a) Tj ET');
  assert.equal(page.unbalanced, 2);
});

test('an image on the page is recorded with where it sits', async () => {
  const { page } = await pageWith(
    '<< /Font << /F1 5 0 R >> /XObject << /Im0 6 0 R >> >>',
    'q 612 0 0 792 0 0 cm /Im0 Do Q BT /F1 12 Tf 72 700 Td (a) Tj ET',
    [streamObject(
      '/Type /XObject /Subtype /Image /Width 4 /Height 4 /ColorSpace /DeviceGray '
      + '/BitsPerComponent 8',
      new Uint8Array(16),
    )],
  );
  assert.equal(page.images.length, 1);
  assert.equal(page.images[0].ctm[0], 612);
});

test('a page with no content stream is empty rather than broken', async () => {
  const doc = await PdfDocument.open(buildPdf([
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>',
  ]));
  const page = await readPage(doc, pagesOf(doc)[0], 1);
  assert.equal(page.text, '');
  assert.equal(page.glyphs.length, 0);
});

test('the page size is inherited from the tree when the page omits it', async () => {
  const doc = await PdfDocument.open(buildPdf([
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 /MediaBox [0 0 595 842] >>',
    '<< /Type /Page /Parent 2 0 R >>',
  ]));
  const page = await readPage(doc, pagesOf(doc)[0], 1);
  assert.equal(page.box.width, 595);
  assert.equal(page.box.height, 842);
});

test('several content streams are read as the one stream they are', async () => {
  // The operator is split across the two, which the specification allows.
  const doc = await PdfDocument.open(buildPdf([
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] '
    + '/Resources << /Font << /F1 5 0 R >> >> /Contents [4 0 R 6 0 R] >>',
    streamObject('', ascii('BT /F1 12 Tf 72 700 Td (split')),
    HELVETICA,
    streamObject('', ascii(' here) Tj ET')),
  ]));
  const page = await readPage(doc, pagesOf(doc)[0], 1);
  assert.equal(page.text, 'split here');
});
