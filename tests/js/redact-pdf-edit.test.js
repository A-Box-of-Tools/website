/**
 * tools/redact-pdf/src/{edit,redact,strings,verify}.js - the removal.
 *
 * This is the whole risk of the tool in one file, and the risk is not that it
 * fails loudly. It is that it appears to work: a page that looks redacted with
 * the letters still in the stream, or a word taken off the page and left in a
 * bookmark, is worse than a tool that refused the job, because somebody sends
 * the file.
 *
 * So the checks below are of two kinds. The first read the rewritten content
 * stream and assert on the bytes - the letters are gone, the kern that holds
 * the line together is the width the font said, the operators around it are
 * untouched. The second write the whole document out, open it again as though
 * a stranger had sent it, and search it.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { decodeStream } from '../../tools/redact-pdf/src/filters.js';
import { findTerm, glyphsIn } from '../../tools/redact-pdf/src/matches.js';
import { PdfStream } from '../../tools/redact-pdf/src/objects.js';
import { PdfDocument } from '../../tools/redact-pdf/src/reader.js';
import { redact, remover } from '../../tools/redact-pdf/src/redact.js';
import { decodeText, encodeText } from '../../tools/redact-pdf/src/strings.js';
import { pagesOf, readPage } from '../../tools/redact-pdf/src/text.js';
import { countOf, harvestAll, verify } from '../../tools/redact-pdf/src/verify.js';
import { ascii, buildPdf, streamObject, text as latin1 } from './pdf-fixtures.js';

const HELVETICA = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';

/** A document with one page whose content is `content`. */
function document(content, { extra = [], entries = '', resources = '' } = {}) {
  return buildPdf([
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources '
    + `${resources || '<< /Font << /F1 5 0 R >> >>'} /Contents 4 0 R ${entries} >>`,
    streamObject('', ascii(content)),
    HELVETICA,
    ...extra,
  ]);
}

/** Open, find `term`, take every occurrence of it out, and hand back both the
 *  finished bytes and the page's rewritten content stream. */
async function removing(bytes, term, options = {}) {
  const doc = await PdfDocument.open(bytes);
  const pages = await Promise.all(
    pagesOf(doc).map((page, index) => readPage(doc, page, index + 1)),
  );

  const chosen = new Map();
  const texts = new Set();
  let count = 0;

  pages.forEach((page, index) => {
    const glyphs = new Set();
    for (const range of findTerm(page.text, term)) {
      for (const glyph of glyphsIn(page, range.from, range.to)) glyphs.add(glyph);
      texts.add(page.text.slice(range.from, range.to));
      count += 1;
    }
    if (glyphs.size) chosen.set(index, glyphs);
  });

  const before = await harvestAll(doc, pages);
  const result = await redact(doc, pages, chosen, { texts: [...texts], ...options });

  return {
    ...result, before, count, pages: pages.length, texts: [...texts],
  };
}

/** The page's content stream out of a finished document. */
async function contentOf(bytes, which = 0) {
  const doc = await PdfDocument.open(bytes);
  const page = pagesOf(doc)[which];
  const value = doc.resolve(page.get('Contents'));
  const streams = Array.isArray(value) ? value.map((v) => doc.resolve(v)) : [value];
  const parts = [];
  for (const stream of streams) {
    if (!(stream instanceof PdfStream)) continue;
    parts.push(latin1((await decodeStream(stream, (v) => doc.resolve(v))).bytes));
  }
  return parts.join('\n');
}

/* ================================================== cutting the bytes out */

test('the letters are gone from the stream, not covered up', async () => {
  const out = await removing(
    document('BT /F1 12 Tf 72 700 Td (Dear Mr Smith) Tj ET'), 'Smith',
  );
  const content = await contentOf(out.bytes);

  assert.ok(!content.includes('Smith'));
  assert.ok(!content.toLowerCase().includes('736d697468')); // "Smith" as hex
  assert.ok(content.includes('<44656172204d7220>')); // "Dear Mr " survives
});

test('the gap is held open by a kern of exactly the width removed', async () => {
  const out = await removing(
    document('BT /F1 12 Tf 72 700 Td (Dear Mr Smith) Tj ET'), 'Smith',
  );
  // S 667 + m 833 + i 222 + t 278 + h 556 = 2556 thousandths, and a TJ number
  // moves the pen by -n/1000 of the font size.
  assert.match(await contentOf(out.bytes), /-2556/);
});

test('a word taken out of the middle leaves the rest either side of a kern', async () => {
  const out = await removing(
    document('BT /F1 12 Tf 72 700 Td (paid to Smith today) Tj ET'), 'Smith',
  );
  const content = await contentOf(out.bytes);
  assert.match(content, /\[<7061696420746f20> -2556 <20746f646179>\] TJ/);
});

test('everything around the edited operator is copied byte for byte', async () => {
  const source = 'q 1 0 0 1 0 0 cm BT /F1 12 Tf 72 700 Td (Smith) Tj ET Q 0 0 1 RG';
  const out = await removing(document(source), 'Smith', { boxes: false });
  const content = await contentOf(out.bytes);

  assert.equal(content.trim(),
    'q 1 0 0 1 0 0 cm BT /F1 12 Tf 72 700 Td [-2556] TJ ET Q 0 0 1 RG');
});

test('a TJ array keeps its own kerns and its untouched strings', async () => {
  const out = await removing(
    document('BT /F1 12 Tf 72 700 Td [(Ref: )-100(Smith)-100( 2026)] TJ ET'),
    'Smith', { boxes: false },
  );
  const content = await contentOf(out.bytes);
  assert.match(content, /\[<5265663a20> -100 -2556 -100 <2032303236>\] TJ/);
  assert.ok(!content.includes('Smith'));
});

test("the ' operator keeps the line it was going to move to", async () => {
  const out = await removing(
    document("BT /F1 12 Tf 14 TL 72 700 Td (one) Tj (Smith) ' ET"),
    'Smith', { boxes: false },
  );
  assert.match(await contentOf(out.bytes), /T\* \[-2556\] TJ/);
});

test('the " operator keeps the two spacings it was setting', async () => {
  const out = await removing(
    document('BT /F1 12 Tf 14 TL 72 700 Td 3 1 (Smith) " ET'),
    'Smith', { boxes: false },
  );
  const content = await contentOf(out.bytes);
  assert.match(content, /3 Tw 1 Tc T\* \[/);
  // Five glyphs of character spacing on top of the widths: 2556 thousandths
  // is 30.672 points at this size, plus five points of /Tc, back over 12.
  assert.match(content, /-2972\.667\] TJ/);
});

test('a black box is drawn over the gap, as a path and not a rectangle', async () => {
  const out = await removing(
    document('BT /F1 12 Tf 72 700 Td (Dear Mr Smith) Tj ET'), 'Smith',
  );
  const content = await contentOf(out.bytes);
  assert.match(content, /q 0 g/);
  assert.match(content, /m .* l .* l .* l h f/);
  assert.equal(out.report.pages[0].boxes, 1);
});

test('no black box when it was not asked for', async () => {
  const out = await removing(
    document('BT /F1 12 Tf 72 700 Td (Smith) Tj ET'), 'Smith', { boxes: false },
  );
  assert.ok(!(await contentOf(out.bytes)).includes(' f\n'));
  assert.equal(out.report.pages[0].boxes, 0);
});

test('the overlay unwinds a page that ended inside a saved state', async () => {
  const out = await removing(
    document('q q BT /F1 12 Tf 72 700 Td (Smith) Tj ET'), 'Smith',
  );
  assert.match(await contentOf(out.bytes), /QQ\nq 0 g/);
});

/* ============================================================ elsewhere */

test('a word is taken out of a bookmark as well as off the page', async () => {
  const bytes = document('BT /F1 12 Tf 72 700 Td (Smith) Tj ET', {
    extra: [
      '<< /Type /Outlines /First 7 0 R /Last 7 0 R /Count 1 >>',
      '<< /Title (Smith v Jones) /Parent 6 0 R >>',
    ],
  });
  // The catalogue has to point at the outline for the writer to keep it.
  const withOutline = ascii(latin1(bytes).replace(
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Catalog /Pages 2 0 R /Outlines 6 0 R >>',
  ));

  const out = await removing(withOutline, 'Smith');
  assert.equal(out.report.strings.changed, 1);

  const doc = await PdfDocument.open(out.bytes);
  const titles = [...doc.objects.values()]
    .filter((value) => value instanceof Map && value.has('Title'))
    .map((value) => decodeText(value.get('Title').bytes));
  assert.deepEqual(titles, [' v Jones']);
});

test('a form field value goes, and so does its appearance', async () => {
  const bytes = document('BT /F1 12 Tf 72 700 Td (Name) Tj ET', {
    entries: '/Annots [6 0 R]',
    extra: [
      '<< /Type /Annot /Subtype /Widget /FT /Tx /T (name) /V (Jane Smith) '
      + '/Rect [200 690 400 710] /AP << /N 7 0 R >> >>',
      streamObject(
        '/Type /XObject /Subtype /Form /BBox [0 0 200 20] '
        + '/Resources << /Font << /F1 5 0 R >> >>',
        ascii('BT /F1 12 Tf 2 5 Td (Jane Smith) Tj ET'),
      ),
    ],
  });

  const out = await removing(bytes, 'Jane Smith');
  const doc = await PdfDocument.open(out.bytes);
  const pages = await Promise.all(
    pagesOf(doc).map((page, index) => readPage(doc, page, index + 1)),
  );

  assert.ok(!pages[0].text.includes('Jane'));
  assert.equal(countOf(await harvestAll(doc, pages), 'Jane Smith'), 0);
});

test('the /ActualText a reader copies instead of the glyphs is scrubbed', async () => {
  // The trap: the glyphs spell "Sm" and a reader copies "Smith", so removing
  // only what is drawn would hand the name back to anyone who selected it.
  const out = await removing(document(
    'BT /F1 12 Tf 72 700 Td /Span << /MCID 0 /ActualText (Smith) >> BDC '
    + '(Sm) Tj EMC ET',
  ), 'Smith');

  const content = await contentOf(out.bytes);
  assert.match(content, /\/Span <<\/MCID 0 \/ActualText <feff>>> BDC/);
  assert.ok(!content.includes('Smith'));

  const doc = await PdfDocument.open(out.bytes);
  const pages = await Promise.all(
    pagesOf(doc).map((page, index) => readPage(doc, page, index + 1)),
  );
  assert.equal(countOf(await harvestAll(doc, pages), 'Smith'), 0);
});

test('the page keeps nothing back even when the rest is left alone', async () => {
  // "The rest of the document" means bookmarks and comments. The replacement
  // text written into the page is the page saying the word, so it goes either
  // way - otherwise the glyphs would be gone and the sentence still copyable.
  const bytes = document(
    'BT /F1 12 Tf 72 700 Td /Span << /ActualText (Smith) >> BDC (Sm) Tj EMC ET',
    { extra: ['<< /Type /Outlines /First 7 0 R /Last 7 0 R /Count 1 >>',
      '<< /Title (Smith v Jones) /Parent 6 0 R >>'] },
  );
  const withOutline = ascii(latin1(bytes).replace(
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Catalog /Pages 2 0 R /Outlines 6 0 R >>',
  ));

  const out = await removing(withOutline, 'Smith', { elsewhere: false });
  assert.equal(out.report.strings.changed, 0);

  const content = await contentOf(out.bytes);
  assert.ok(!content.includes('Smith'));

  const doc = await PdfDocument.open(out.bytes);
  const titles = [...doc.objects.values()]
    .filter((value) => value instanceof Map && value.has('Title'))
    .map((value) => decodeText(value.get('Title').bytes));
  assert.deepEqual(titles, ['Smith v Jones']);
});

test('the document properties do not survive a redaction', async () => {
  const bytes = buildPdf([
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] '
    + '/Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    streamObject('', ascii('BT /F1 12 Tf 72 700 Td (Smith) Tj ET')),
    HELVETICA,
    '<< /Producer (Some Layout App) /Title (Smith settlement draft 3) >>',
  ], { info: 6 });

  const out = await removing(bytes, 'Smith');
  const doc = await PdfDocument.open(out.bytes);
  assert.equal(doc.info, null);
  assert.equal(countOf(await harvestAll(doc), 'Smith'), 0);
});

test('attachments and anything that runs are dropped', async () => {
  const bytes = document('BT /F1 12 Tf 72 700 Td (Smith) Tj ET', {
    extra: ['<< /Type /Filespec /F (private.docx) /EF << /F 8 0 R >> >>',
      streamObject('', ascii('the other document'))],
  });
  const out = await removing(bytes, 'Smith');
  assert.equal(out.report.attachments, 1);
});

test('a shared block edited once is reported as having gone everywhere', async () => {
  const bytes = buildPdf([
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R 6 0 R] /Count 2 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] '
    + '/Resources << /XObject << /Fx 7 0 R >> >> /Contents 4 0 R >>',
    streamObject('', ascii('/Fx Do')),
    HELVETICA,
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] '
    + '/Resources << /XObject << /Fx 7 0 R >> >> /Contents 4 0 R >>',
    streamObject(
      '/Type /XObject /Subtype /Form /BBox [0 0 612 792] '
      + '/Resources << /Font << /F1 5 0 R >> >>',
      ascii('BT /F1 12 Tf 72 700 Td (Smith and Co) Tj ET'),
    ),
  ]);

  const out = await removing(bytes, 'Smith');
  assert.equal(out.report.shared, 1);

  const doc = await PdfDocument.open(out.bytes);
  const pages = await Promise.all(
    pagesOf(doc).map((page, index) => readPage(doc, page, index + 1)),
  );
  assert.deepEqual(pages.map((page) => page.text), [' and Co', ' and Co']);
});

/* ================================================================= checking */

test('the finished file is opened again and the words are not in it', async () => {
  const out = await removing(
    document('BT /F1 12 Tf 72 700 Td (Dear Mr Smith, of Smith and Co) Tj ET'),
    'Smith',
  );

  const check = await verify(out.bytes, {
    text: out.before,
    pages: out.pages,
    terms: [{ text: 'Smith', removed: out.count }],
  });

  assert.equal(check.ok, true);
  assert.equal(check.terms[0].was, 2);
  assert.equal(check.terms[0].now, 0);
  assert.equal(check.pages, 1);
});

test('a file this tool wrote can be opened and redacted again', async () => {
  // Everything above starts from a classic cross-reference table, and what the
  // writer produces is the 1.5 shape instead: the objects packed into an object
  // stream and the table itself a compressed stream. That is what a modern
  // generator writes and what most real input looks like, so the second pass
  // here is the one that exercises reading it.
  const first = await removing(
    document('BT /F1 12 Tf 72 700 Td (Dear Mr Smith of Acme Ltd) Tj ET'), 'Smith',
  );
  const second = await removing(first.bytes, 'Acme');

  const doc = await PdfDocument.open(second.bytes);
  const pages = await Promise.all(
    pagesOf(doc).map((page, index) => readPage(doc, page, index + 1)),
  );
  assert.equal(pages[0].text, 'Dear Mr  of  Ltd');

  const check = await verify(second.bytes, {
    text: second.before, pages: 1, terms: [{ text: 'Acme', removed: 1 }],
  });
  assert.equal(check.ok, true);
});

test('the check fails when a page has gone missing', async () => {
  const out = await removing(document('BT /F1 12 Tf 72 700 Td (Smith) Tj ET'), 'Smith');
  const check = await verify(out.bytes, {
    text: out.before, pages: 2, terms: [],
  });
  assert.equal(check.ok, false);
  assert.equal(check.problem, 'check.pages');
});

test('the check counts what was left behind on purpose', async () => {
  // Only the first of the two is removed, so one is expected to survive.
  const doc = await PdfDocument.open(
    document('BT /F1 12 Tf 72 700 Td (Smith and Smith) Tj ET'),
  );
  const pages = await Promise.all(
    pagesOf(doc).map((page, index) => readPage(doc, page, index + 1)),
  );
  const first = findTerm(pages[0].text, 'Smith')[0];
  const before = await harvestAll(doc, pages);
  const out = await redact(doc, pages,
    new Map([[0, glyphsIn(pages[0], first.from, first.to)]]),
    { texts: ['Smith'] });

  const check = await verify(out.bytes, {
    text: before, pages: 1, terms: [{ text: 'Smith', removed: 1 }],
  });
  assert.equal(check.ok, true);
  assert.equal(check.terms[0].was, 2);
  assert.equal(check.terms[0].now, 1);
});

test('the search that checks does not care how the whitespace fell', () => {
  assert.equal(countOf('Dear John\nSmith and John  Smith', 'john smith'), 2);
  assert.equal(countOf('nothing here', 'anything'), 0);
  assert.equal(countOf('aaa', ''), 0);
});

/* ================================================================= strings */

test('a text string survives a round trip in either spelling', () => {
  assert.equal(decodeText(ascii('plain')), 'plain');
  assert.equal(decodeText(encodeText('Müller')), 'Müller');
  assert.equal(decodeText(new Uint8Array([0xfe, 0xff, 0x00, 0x41])), 'A');
});

test('the remover takes the longest match first', () => {
  const remove = remover(['Smith', 'Mr Smith']);
  assert.equal(remove('Dear Mr Smith and Smith'), 'Dear  and ');
});

/* ============================================================== a scan */

test('an OCR layer over a picture is removed and reported as still visible', async () => {
  const bytes = document(
    'q 612 0 0 792 0 0 cm /Im0 Do Q BT 3 Tr /F1 12 Tf 72 700 Td (Smith) Tj ET',
    {
      resources: '<< /Font << /F1 5 0 R >> /XObject << /Im0 6 0 R >> >>',
      extra: [streamObject(
        '/Type /XObject /Subtype /Image /Width 2 /Height 2 '
        + '/ColorSpace /DeviceGray /BitsPerComponent 8',
        new Uint8Array(4),
      )],
    },
  );

  const out = await removing(bytes, 'Smith');
  assert.equal(out.report.overImage, 5);

  const doc = await PdfDocument.open(out.bytes);
  const pages = await Promise.all(
    pagesOf(doc).map((page, index) => readPage(doc, page, index + 1)),
  );
  assert.equal(pages[0].text, '');
});

test('a page with no text at all is left exactly as it was', async () => {
  const doc = await PdfDocument.open(document('q 1 0 0 1 0 0 cm Q'));
  const pages = await Promise.all(
    pagesOf(doc).map((page, index) => readPage(doc, page, index + 1)),
  );
  const out = await redact(doc, pages, new Map(), { texts: [] });
  assert.deepEqual(out.report.pages, []);
  assert.match(await contentOf(out.bytes), /q 1 0 0 1 0 0 cm Q/);
});
