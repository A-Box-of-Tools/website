/**
 * tools/redact-pdf/src/{base14,fonts}.js - what a string in a page says.
 *
 * The bytes of `(\003\020\021\005) Tj` are indices into a font, not letters,
 * and every one of the four ways a PDF can explain them is here because real
 * documents use all four: a /ToUnicode map, a named encoding, an /Encoding
 * with /Differences, and - for the fourteen fonts the format promised every
 * reader would have - nothing at all.
 *
 * The widths matter as much as the characters. They are what holds the rest of
 * a line in place after a word is cut out of it, so a font that reports the
 * wrong width does not lose the redaction, it slides the paragraph.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  base14Name, base14Widths, encodingByName, glyphText,
  MAC_ROMAN, STANDARD, WIN_ANSI,
} from '../../tools/redact-pdf/src/base14.js';
import { glyphsOf, readFont } from '../../tools/redact-pdf/src/fonts.js';
import { PdfDocument } from '../../shared/js/pdf-reader.js';
import { ascii, buildPdf, streamObject } from './pdf-fixtures.js';

/** Read one font dictionary, written as it would appear in a file. */
async function fontFrom(objects, which = 1) {
  const doc = await PdfDocument.open(buildPdf([
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [] /Count 0 >>',
    ...objects,
  ]));
  return readFont(doc, doc.getObject(which + 2));
}

const textOf = (font, bytes) => glyphsOf(font, bytes).map((g) => g.text).join('');

/* =============================================================== encodings */

test('the three named encodings put the right glyph at the awkward codes', () => {
  // 39 and 96 are the two codes Standard and WinAnsi disagree about, and the
  // disagreement is exactly the curly-versus-straight quote.
  assert.equal(WIN_ANSI[39], 'quotesingle');
  assert.equal(STANDARD[39], 'quoteright');
  assert.equal(WIN_ANSI[96], 'grave');
  assert.equal(STANDARD[96], 'quoteleft');

  assert.equal(WIN_ANSI[0xe9], 'eacute');
  assert.equal(MAC_ROMAN[0x8e], 'eacute');
  assert.equal(STANDARD[0xa9], 'quotesingle');
});

test('a code an encoding does not define is empty, not a space', () => {
  assert.equal(STANDARD[0x80], '');
  assert.equal(WIN_ANSI[0x81], '');
  assert.equal(WIN_ANSI[32], 'space');
});

test('glyph names become the characters they stand for', () => {
  assert.equal(glyphText('A'), 'A');
  assert.equal(glyphText('eacute'), 'é');
  assert.equal(glyphText('quoteright'), '’');
  assert.equal(glyphText('bullet'), '•');
  assert.equal(glyphText('Euro'), '€');
  assert.equal(glyphText('germandbls'), 'ß');
  assert.equal(glyphText('fi'), 'ﬁ');
  assert.equal(glyphText('lozenge'), '◊');
});

test('the two conventions a subsetter writes instead of a name', () => {
  assert.equal(glyphText('uni20AC'), '€');
  assert.equal(glyphText('u1F600'), '\u{1f600}');
  assert.equal(glyphText('eacute.sc'), 'é');
  assert.equal(glyphText('g42'), '');
  assert.equal(glyphText(''), '');
});

test('encodingByName knows the three that are in the specification', () => {
  assert.equal(encodingByName('WinAnsiEncoding'), WIN_ANSI);
  assert.equal(encodingByName('MacRomanEncoding'), MAC_ROMAN);
  assert.equal(encodingByName('StandardEncoding'), STANDARD);
  assert.equal(encodingByName('Identity-H'), null);
});

/* ================================================================= metrics */

test('the base fourteen are recognised through the spellings files use', () => {
  assert.equal(base14Name('Helvetica'), 'Helvetica');
  assert.equal(base14Name('ABCDEF+Helvetica-Bold'), 'Helvetica-Bold');
  assert.equal(base14Name('Arial,Bold'), 'Helvetica-Bold');
  assert.equal(base14Name('TimesNewRomanPS-BoldItalicMT'), 'Times-BoldItalic');
  assert.equal(base14Name('Courier-Oblique'), 'Courier');
  assert.equal(base14Name('Wingdings'), '');
});

test('sans-serif is read as sans, which is the half that is a face', () => {
  assert.equal(base14Name('sans-serif'), 'Helvetica');
});

test('the metrics are the ones every PDF library ships', () => {
  const helvetica = base14Widths('Helvetica');
  assert.equal(helvetica.width('space'), 278);
  assert.equal(helvetica.width('A'), 667);
  assert.equal(helvetica.width('W'), 944);
  assert.equal(helvetica.width('i'), 222);
  assert.equal(helvetica.width('zero'), 556);

  const times = base14Widths('Times-Roman');
  assert.equal(times.width('space'), 250);
  assert.equal(times.width('A'), 722);
  assert.equal(times.width('a'), 444);

  assert.equal(base14Widths('Courier-BoldOblique').width('W'), 600);
  assert.equal(base14Widths('Courier').width('i'), 600);
});

test('an accent does not move the pen, so the letter under it answers', () => {
  const helvetica = base14Widths('Helvetica');
  assert.equal(helvetica.width('eacute'), helvetica.width('e'));
  assert.equal(helvetica.width('Adieresis'), helvetica.width('A'));
  assert.equal(helvetica.width('ccedilla'), helvetica.width('c'));
});

/* ============================================================ simple fonts */

test('a font with no widths at all falls back to its own metrics', async () => {
  const font = await fontFrom(['<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>']);
  assert.equal(textOf(font, ascii('Hi')), 'Hi');
  assert.equal(font.width('H'.charCodeAt(0)), 722);
  assert.equal(font.width(32), 278);
});

test('a /Widths array is believed, including where it says zero', async () => {
  const font = await fontFrom([
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica '
    + '/FirstChar 65 /LastChar 66 /Widths [500 600] >>',
  ]);
  assert.equal(font.width(65), 500);
  assert.equal(font.width(66), 600);
  // Outside the array the specification says zero, and a metric table would
  // be inventing a number the file did not give.
  assert.equal(font.width(67), 0);
});

test('/Differences renames individual codes', async () => {
  const font = await fontFrom([
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica '
    + '/Encoding << /BaseEncoding /WinAnsiEncoding '
    + '/Differences [65 /eacute /germandbls] >> >>',
  ]);
  assert.equal(textOf(font, ascii('ABC')), 'éßC');
});

test('a WinAnsi font reads its top half as Latin-1', async () => {
  const font = await fontFrom([
    '<< /Type /Font /Subtype /TrueType /BaseFont /Arial /Encoding /WinAnsiEncoding >>',
  ]);
  assert.equal(textOf(font, new Uint8Array([0x4d, 0xfc, 0x6c, 0x6c, 0x65, 0x72])), 'Müller');
});

/* ================================================================ ToUnicode */

test('a /ToUnicode map beats the encoding, because the file wrote it', async () => {
  const cmap = `/CIDInit /ProcSet findresource begin
12 dict begin begincmap
1 begincodespacerange <00> <ff> endcodespacerange
2 beginbfchar <01> <0053> <02> <006d> endbfchar
1 beginbfrange <10> <12> <0041> endbfrange
endcmap end end`;

  const font = await fontFrom([
    '<< /Type /Font /Subtype /Type1 /BaseFont /Subset /ToUnicode 4 0 R >>',
    streamObject('', ascii(cmap)),
  ]);

  assert.equal(textOf(font, new Uint8Array([1, 2])), 'Sm');
  // A range's destination counts up in its last character, which is how one
  // entry covers an alphabet.
  assert.equal(textOf(font, new Uint8Array([0x10, 0x11, 0x12])), 'ABC');
});

test('a ToUnicode destination may be more than one character', async () => {
  const cmap = '1 beginbfchar <01> <00660069> endbfchar';
  const font = await fontFrom([
    '<< /Type /Font /Subtype /Type1 /BaseFont /X /ToUnicode 4 0 R >>',
    streamObject('', ascii(cmap)),
  ]);
  assert.equal(textOf(font, new Uint8Array([1])), 'fi');
});

test('a glyph nothing can explain is reported rather than guessed', async () => {
  const font = await fontFrom([
    '<< /Type /Font /Subtype /Type1 /BaseFont /Weird '
    + '/Encoding << /Differences [1 /g7] >> >>',
  ]);
  const [glyph] = glyphsOf(font, new Uint8Array([1]));
  assert.equal(glyph.text, '');
  assert.equal(glyph.known, false);
});

/* ========================================================= composite fonts */

test('Identity-H is two bytes a glyph and the CID is the code', async () => {
  const cmap = '1 beginbfrange <0003> <0004> <0041> endbfrange';
  const font = await fontFrom([
    '<< /Type /Font /Subtype /Type0 /BaseFont /Sub+Noto /Encoding /Identity-H '
    + '/DescendantFonts [5 0 R] /ToUnicode 4 0 R >>',
    streamObject('', ascii(cmap)),
    '<< /Type /Font /Subtype /CIDFontType2 /BaseFont /Sub+Noto /DW 1000 '
    + '/W [3 [600 700]] >>',
  ]);

  const glyphs = glyphsOf(font, new Uint8Array([0, 3, 0, 4]));
  assert.equal(glyphs.length, 2);
  assert.equal(glyphs.map((g) => g.text).join(''), 'AB');
  assert.deepEqual(glyphs.map((g) => g.width), [600, 700]);
  assert.deepEqual(glyphs.map((g) => g.at), [0, 2]);
});

test('a /W run written as first-last-width covers the whole run', async () => {
  const font = await fontFrom([
    '<< /Type /Font /Subtype /Type0 /BaseFont /X /Encoding /Identity-H '
    + '/DescendantFonts [4 0 R] >>',
    '<< /Type /Font /Subtype /CIDFontType0 /BaseFont /X /DW 250 /W [10 12 800] >>',
  ]);
  assert.equal(font.width(10), 800);
  assert.equal(font.width(12), 800);
  assert.equal(font.width(13), 250);
});

test('word spacing never applies to a two-byte font', async () => {
  const font = await fontFrom([
    '<< /Type /Font /Subtype /Type0 /BaseFont /X /Encoding /Identity-H '
    + '/DescendantFonts [4 0 R] >>',
    '<< /Type /Font /Subtype /CIDFontType2 /BaseFont /X /DW 500 >>',
  ]);
  assert.equal(font.singleByte, false);
});

test('a Type 3 font measures in its own coordinate system', async () => {
  // The matrix is a hundredth rather than a thousandth, so a width of 50 in
  // glyph space is 500 in the thousandths everything else here uses.
  const font = await fontFrom([
    '<< /Type /Font /Subtype /Type3 /FontMatrix [0.01 0 0 0.01 0 0] '
    + '/CharProcs << >> /Encoding << /Differences [65 /A] >> '
    + '/FirstChar 65 /LastChar 65 /Widths [50] >>',
  ]);
  assert.equal(font.width(65), 500);
});
