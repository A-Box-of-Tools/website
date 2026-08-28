/**
 * tools/merge-pdf/src/{assemble,pages,dests,outline,produce}.js.
 *
 * This is the tool's whole risk in one file. It lifts a page out of a document
 * somebody else wrote and puts it in a new one, and every way that can go
 * wrong is silent: a page copied without the size it inherited opens as US
 * Letter, a page copied without its resources opens blank, a copy walk with no
 * rule against following /Parent drags in the four hundred pages nobody asked
 * for, and a link left pointing at an object number that means something else
 * now sends the reader to the wrong page.
 *
 * So the checks below are all of the "open it again and look" kind. The
 * fixture is a four-page document with the awkward parts a real one has: the
 * size and the font live on the tree node rather than the pages, one page is
 * rotated and has a size of its own, one link points through a named
 * destination and another through a GoTo action, and there is a two-level
 * outline whose entries point at three different pages.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { assemble, readSource } from '../../tools/merge-pdf/src/assemble.js';
import { namedDestinations, resolveDestination } from '../../tools/merge-pdf/src/dests.js';
import { readPages } from '../../tools/merge-pdf/src/pages.js';
import { produce } from '../../tools/merge-pdf/src/produce.js';
import { PdfDocument } from '../../tools/merge-pdf/src/reader.js';
import { decodeStream } from '../../tools/merge-pdf/src/filters.js';
import { isName, PdfStream, Ref } from '../../tools/merge-pdf/src/objects.js';
import { writeDocument } from '../../tools/merge-pdf/src/writer.js';
import { ascii, buildPdf, streamObject, text } from './pdf-fixtures.js';

/* ============================================================== the fixture */

const OBJECTS = [
  // 1 the catalogue
  '<< /Type /Catalog /Pages 2 0 R /Outlines 14 0 R /Names << /Dests 18 0 R >> >>',
  // 2 the page tree, carrying the size and the resources for everything below
  '<< /Type /Pages /Kids [3 0 R 4 0 R 5 0 R 6 0 R] /Count 4 '
    + '/MediaBox [0 0 612 792] /Resources << /Font << /F1 7 0 R >> >> >>',
  '<< /Type /Page /Parent 2 0 R /Contents 8 0 R /Annots [12 0 R] >>',
  '<< /Type /Page /Parent 2 0 R /Contents 9 0 R /Annots [13 0 R] >>',
  '<< /Type /Page /Parent 2 0 R /Contents 10 0 R >>',
  // 6 the odd one out: its own size, and turned on its side
  '<< /Type /Page /Parent 2 0 R /Contents 11 0 R /MediaBox [0 0 595 842] /Rotate 90 >>',
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  streamObject('', ascii('BT /F1 12 Tf (page one) Tj ET')),
  streamObject('', ascii('BT /F1 12 Tf (page two) Tj ET')),
  streamObject('', ascii('BT /F1 12 Tf (page three) Tj ET')),
  streamObject('', ascii('BT /F1 12 Tf (page four) Tj ET')),
  // 12 a link through the name table, to page three
  '<< /Type /Annot /Subtype /Link /Rect [10 10 100 30] /Dest (chapter2) >>',
  // 13 a link through an action, to page four
  '<< /Type /Annot /Subtype /Link /Rect [10 10 100 30] '
    + '/A << /S /GoTo /D [6 0 R /Fit] >> >>',
  // 14 the outline: two top-level entries, one of them with a child
  '<< /Type /Outlines /First 15 0 R /Last 16 0 R /Count 2 >>',
  '<< /Title (One) /Parent 14 0 R /Next 16 0 R /Dest [3 0 R /Fit] >>',
  '<< /Title (Two) /Parent 14 0 R /Prev 15 0 R /First 17 0 R /Last 17 0 R '
    + '/Count 1 /Dest [5 0 R /Fit] >>',
  '<< /Title (Two point one) /Parent 16 0 R /Dest [6 0 R /Fit] >>',
  // 18 the name tree the first link goes through
  '<< /Names [(chapter2) [5 0 R /XYZ null null 0]] >>',
];

async function fixture(label = 'four.pdf') {
  return readSource(await PdfDocument.open(buildPdf(OBJECTS)), label);
}

/** The pages of a built document, in order, as dictionaries. */
function outputPages(build) {
  const catalog = build.resolve(build.trailer.get('Root'));
  const tree = build.resolve(catalog.get('Pages'));
  return build.resolve(tree.get('Kids')).map((ref) => build.resolve(ref));
}

/** What one page draws, decoded. */
async function contentOf(build, page) {
  const stream = build.resolve(page.get('Contents'));
  assert.ok(stream instanceof PdfStream, 'the page has a content stream');
  return text((await decodeStream(stream, (v) => build.resolve(v))).bytes);
}

const pick = (source, index, rotate = 0) => ({ source, index, rotate });

/* ============================================================== readPages */

/**
 * A stand-in for `phrase`, so a test can say which sentence was chosen.
 *
 * The real one reads the markup; these modules take whichever they are given.
 * This one writes the key and its blanks, which is what these tests are about -
 * the English is body.html's, in fifteen languages.
 */
const say = (key, values = {}) => {
  const filled = Object.entries(values).map(([k, v]) => `${k}=${v}`).join(' ');
  return filled ? `${key} ${filled}` : key;
};

test('every page is found, in reading order', async () => {
  const source = await fixture();
  assert.equal(source.pages.length, 4);
});

test('a page is measured at the size it inherited', async () => {
  const source = await fixture();
  assert.deepEqual([source.pages[0].width, source.pages[0].height], [612, 792]);
});

test('a rotated page is measured the way it will be seen', async () => {
  const source = await fixture();
  const last = source.pages[3];
  assert.equal(last.rotate, 90);
  assert.deepEqual([last.width, last.height], [842, 595]);
});

test('a page tree with no catalogue gives no pages rather than throwing', async () => {
  const doc = await PdfDocument.open(buildPdf([
    '<< /Type /Catalog >>',
  ]));
  assert.deepEqual(readPages(doc), []);
});

test('a page listed twice in one tree is walked once', async () => {
  const doc = await PdfDocument.open(buildPdf([
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R 3 0 R] /Count 2 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 10 10] >>',
  ]));
  assert.equal(readPages(doc).length, 1);
});

/* =============================================================== the copy */

test('pages come out in the order they were asked for', async () => {
  const source = await fixture();
  const { build } = assemble([pick(source, 2), pick(source, 0)], { t: say });
  const pages = outputPages(build);

  assert.equal(pages.length, 2);
  assert.match(await contentOf(build, pages[0]), /page three/);
  assert.match(await contentOf(build, pages[1]), /page one/);
});

test('what a page inherited is written onto the copy', async () => {
  const source = await fixture();
  const { build } = assemble([pick(source, 0)], { t: say });
  const [page] = outputPages(build);

  // Neither of these is on the source page: both live on the tree node above
  // it, which is not copied, so a page that did not carry them down would
  // open at the wrong size with none of its fonts.
  assert.deepEqual(build.resolve(page.get('MediaBox')), [0, 0, 612, 792]);
  const resources = build.resolve(page.get('Resources'));
  assert.ok(resources instanceof Map);
  assert.ok(build.resolve(resources.get('Font')) instanceof Map);
});

test('the new page belongs to the new tree', async () => {
  const source = await fixture();
  const { build } = assemble([pick(source, 0)], { t: say });
  const catalog = build.resolve(build.trailer.get('Root'));
  const tree = build.resolve(catalog.get('Pages'));
  const [page] = outputPages(build);

  assert.equal(build.resolve(tree.get('Count')), 1);
  assert.ok(page.get('Parent') instanceof Ref);
  assert.equal(build.resolve(page.get('Parent')), tree);
});

test('turning a page adds to the rotation it already had', async () => {
  const source = await fixture();
  const { build } = assemble([pick(source, 3, 90), pick(source, 0, -90)], { t: say });
  const [turned, back] = outputPages(build);

  assert.equal(build.resolve(turned.get('Rotate')), 180); // 90 in the file, 90 more
  assert.equal(build.resolve(back.get('Rotate')), 270);   // 0 in the file, a turn back
});

test('one page does not bring the other three with it', async () => {
  const source = await fixture();
  const { build } = assemble([pick(source, 0)], { t: say });

  const streams = [...build.objects.values()].filter((v) => v instanceof PdfStream);
  assert.equal(streams.length, 1, 'only the one page\'s content stream was copied');

  const drawn = await Promise.all(streams.map(
    (stream) => decodeStream(stream, (v) => build.resolve(v)).then((out) => text(out.bytes))));
  assert.ok(drawn.every((body) => !/page (two|three|four)/.test(body)));
});

test('a font shared by two pages is copied once', async () => {
  const source = await fixture();
  const { build } = assemble([pick(source, 0), pick(source, 1)], { t: say });

  const fonts = [...build.objects.values()]
    .filter((value) => value instanceof Map && isName(value.get('Type'), 'Font'));
  assert.equal(fonts.length, 1);
});

test('the same page twice is two pages sharing everything under them', async () => {
  const source = await fixture();
  const { build } = assemble([pick(source, 0), pick(source, 0)], { t: say });
  const pages = outputPages(build);

  assert.equal(pages.length, 2);
  assert.notEqual(pages[0], pages[1]);
  // The content stream behind them is the same object, not a second copy.
  assert.equal(pages[0].get('Contents').num, pages[1].get('Contents').num);
});

/* ================================================================= links */

test('a named destination is resolved through the name tree', async () => {
  const source = await fixture();
  const named = namedDestinations(source.doc);
  const found = resolveDestination(source.doc, source.doc.resolve(
    source.doc.getObject(12).get('Dest')), named);
  assert.equal(found.ref.num, 5); // object 5 is page three
});

test('a link follows its page to where it now is', async () => {
  const source = await fixture();
  // Page one carries the link; page three is what it points at, and it lands
  // second here rather than third.
  const { build, links } = assemble([pick(source, 0), pick(source, 2)], { t: say });
  const pages = outputPages(build);

  assert.equal(links, 1);
  const annots = build.resolve(pages[0].get('Annots'));
  const link = build.resolve(annots[0]);
  const dest = build.resolve(link.get('Dest'));

  assert.ok(Array.isArray(dest));
  assert.equal(build.resolve(dest[0]), pages[1], 'points at the page, wherever it went');
});

test('a link to a page that did not come along keeps its place and loses its action', async () => {
  const source = await fixture();
  // Page two's link points at page four, which is not in this output.
  const { build, notes } = assemble([pick(source, 1)], { t: say });
  const [page] = outputPages(build);
  const link = build.resolve(build.resolve(page.get('Annots'))[0]);

  assert.ok(link instanceof Map, 'the annotation is still there');
  assert.equal(link.get('A'), undefined);
  assert.equal(link.get('Dest'), undefined);
  assert.ok(notes.some((note) => note.startsWith('notes.brokenlinks')),
    notes.join(' / '));
});

test('an annotation points back at the page it is on', async () => {
  const source = await fixture();
  const { build } = assemble([pick(source, 0)], { t: say });
  const [page] = outputPages(build);
  const link = build.resolve(build.resolve(page.get('Annots'))[0]);
  assert.equal(build.resolve(link.get('P')), page);
});

test('an action that is not going to a page is not copied', async () => {
  const doc = await PdfDocument.open(buildPdf([
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 /MediaBox [0 0 10 10] >>',
    '<< /Type /Page /Parent 2 0 R /Annots [4 0 R 5 0 R] >>',
    '<< /Type /Annot /Subtype /Link /A << /S /JavaScript /JS (app.alert\\(1\\)) >> >>',
    '<< /Type /Annot /Subtype /Link /A << /S /URI /URI (https://example.org/) >> >>',
  ]));
  const { build, notes } = assemble([pick(readSource(doc, 'js.pdf'), 0)], { t: say });
  const [page] = outputPages(build);
  const [script, web] = build.resolve(page.get('Annots')).map((ref) => build.resolve(ref));

  assert.equal(script.get('A'), undefined, 'the JavaScript action is gone');
  assert.ok(isName(build.resolve(build.resolve(web.get('A')).get('S')), 'URI'),
    'the web link is kept');
  assert.ok(notes.some((note) => note.startsWith('notes.actions.')),
    notes.join(' / '));
});

/* ============================================================= bookmarks */

test('bookmarks whose pages survived are kept, and follow them', async () => {
  const source = await fixture();
  const { build } = assemble([pick(source, 2), pick(source, 0)], { t: say });
  const catalog = build.resolve(build.trailer.get('Root'));
  const outlines = build.resolve(catalog.get('Outlines'));

  assert.ok(outlines instanceof Map);
  const titles = walkOutline(build, outlines);
  assert.deepEqual(titles.map((entry) => entry.title), ['One', 'Two']);

  const pages = outputPages(build);
  // "One" is about page one, which is now the second page in the document.
  assert.equal(build.resolve(titles[0].dest[0]), pages[1]);
});

test('a bookmark whose page is gone but whose chapter is not stays as a heading', async () => {
  const source = await fixture();
  // Page four survives; page three, which "Two" points at, does not.
  const { build } = assemble([pick(source, 3)], { t: say });
  const catalog = build.resolve(build.trailer.get('Root'));
  const titles = walkOutline(build, build.resolve(catalog.get('Outlines')));

  assert.deepEqual(titles.map((entry) => entry.title), ['Two']);
  assert.equal(titles[0].dest, null, 'a heading with nothing behind it');
  assert.deepEqual(titles[0].kids.map((entry) => entry.title), ['Two point one']);
});

test('no bookmark has a page left, so there is no outline at all', async () => {
  const source = await fixture();
  const { build } = assemble([pick(source, 1)], { t: say }); // page two is in no bookmark
  const catalog = build.resolve(build.trailer.get('Root'));
  assert.equal(catalog.get('Outlines'), undefined);
});

test('bookmarks can be turned off', async () => {
  const source = await fixture();
  const { build } = assemble([pick(source, 0)], { bookmarks: false, t: say });
  const catalog = build.resolve(build.trailer.get('Root'));
  assert.equal(catalog.get('Outlines'), undefined);
});

test('merging two files puts each one under a heading of its own', async () => {
  const one = await fixture('first.pdf');
  const two = await fixture('second.pdf');
  const { build } = assemble([pick(one, 0), pick(two, 0)], { t: say });
  const catalog = build.resolve(build.trailer.get('Root'));
  const titles = walkOutline(build, build.resolve(catalog.get('Outlines')));

  assert.deepEqual(titles.map((entry) => entry.title), ['first.pdf', 'second.pdf']);
  assert.deepEqual(titles[0].kids.map((entry) => entry.title), ['One']);
});

/**
 * Walk the written outline the way a reader does - /First, then /Next until
 * there is no next - rather than reading it out of the structure that built
 * it. An entry that is in the file but not on that chain is invisible in
 * every PDF reader there is, which is exactly the bug worth catching.
 */
function walkOutline(build, node, depth = 0) {
  const out = [];
  if (!(node instanceof Map) || depth > 8) return out;

  let ref = node.get('First');
  const seen = new Set();

  while (ref instanceof Ref && !seen.has(ref.num)) {
    seen.add(ref.num);
    const item = build.resolve(ref);
    if (!(item instanceof Map)) break;

    const title = item.get('Title');
    out.push({
      title: latin(title.bytes).replace(/^þÿ/, '').replace(/\0/g, ''),
      dest: build.resolve(item.get('Dest')) ?? null,
      kids: walkOutline(build, item, depth + 1),
      item,
    });
    ref = item.get('Next');
  }

  // Everything the reader would draw is also linked backwards and upwards.
  out.forEach((entry, index) => {
    if (index > 0) {
      assert.equal(build.resolve(entry.item.get('Prev')), out[index - 1].item,
        'each entry points back at the one before it');
    }
    assert.equal(build.resolve(entry.item.get('Parent')), node,
      'each entry points up at its parent');
  });
  if (out.length) {
    assert.equal(build.resolve(node.get('Last')), out[out.length - 1].item,
      '/Last is the end of the chain');
  }

  return out;
}

const latin = (bytes) => text(bytes);

/* ================================================================= forms */

test('a form field is carried across and listed in the catalogue', async () => {
  const doc = await PdfDocument.open(buildPdf([
    '<< /Type /Catalog /Pages 2 0 R /AcroForm << /Fields [5 0 R] /DA (/Helv 0 Tf 0 g) >> >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 /MediaBox [0 0 300 300] >>',
    '<< /Type /Page /Parent 2 0 R /Annots [4 0 R] >>',
    '<< /Type /Annot /Subtype /Widget /Rect [0 0 50 20] /Parent 5 0 R >>',
    '<< /FT /Tx /T (name) /V (Ada) /Kids [4 0 R] >>',
  ]));
  const { build, fields } = assemble([pick(readSource(doc, 'form.pdf'), 0)], { t: say });
  const catalog = build.resolve(build.trailer.get('Root'));
  const form = build.resolve(catalog.get('AcroForm'));

  assert.equal(fields, 1);
  assert.ok(form instanceof Map, 'the document is still a form');
  const listed = build.resolve(form.get('Fields'));
  assert.equal(listed.length, 1);
  const field = build.resolve(listed[0]);
  assert.equal(latin(build.resolve(field.get('V')).bytes), 'Ada', 'what was typed is still there');
});

/* ============================================================== the whole */

test('a merged document opens again with the pages it was given', async () => {
  const one = await fixture('one.pdf');
  const two = await fixture('two.pdf');
  const entries = [pick(one, 0), pick(two, 3), pick(one, 2)];

  const { build } = assemble(entries, { t: say });
  const blob = await writeDocument(build);
  const reopened = await PdfDocument.open(new Uint8Array(await blob.arrayBuffer()));

  assert.equal(reopened.countPages(), 3);
  const pages = readPages(reopened);
  assert.deepEqual([pages[1].width, pages[1].height], [842, 595], 'the rotated page survived');
});

test('produce writes one file per part, and checks each one', async () => {
  const source = await fixture('long.pdf');
  const entries = source.pages.map((_, index) => pick(source, index));

  const result = await produce(entries, {
    split: { mode: 'every', size: 2 },
    stem: 'long.pdf',
    suffix: 'edited',
    bookmarks: true,
  }, { t: say });

  assert.equal(result.ok, true, result.problem);
  assert.equal(result.files.length, 2);
  assert.deepEqual(result.files.map((file) => file.pages), [2, 2]);
  assert.deepEqual(result.files.map((file) => file.name),
    ['long-pages-1-2.pdf', 'long-pages-3-4.pdf']);
  assert.ok(result.archive, 'two files are handed over as one archive');
  assert.ok(result.files.every((file) => file.check.ok));

  const first = await PdfDocument.open(result.files[0].data);
  assert.equal(first.countPages(), 2);
});

test('one part is one file and no archive', async () => {
  const source = await fixture();
  const result = await produce([pick(source, 0)], {
    split: { mode: 'single' }, stem: 'four.pdf', suffix: 'edited', bookmarks: true,
  }, { t: say });

  assert.equal(result.files.length, 1);
  assert.equal(result.archive, null);
  assert.equal(result.files[0].name, 'four-edited.pdf');
});

test('a document with no pages is refused rather than written', async () => {
  assert.throws(() => assemble([], { t: say }), /^Error: assemble\.empty$/);
});
