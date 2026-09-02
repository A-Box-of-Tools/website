/**
 * tools/redact-pdf/src/matches.js - finding the things worth taking out.
 *
 * Two halves with opposite risks. A typed word is auto-ticked, so it must not
 * match anything the person did not mean; a pattern is only ever offered, so
 * it may over-reach a little but must not claim arithmetic it has not done.
 * The card and IBAN finders check their own check digits, which is what
 * separates them from "sixteen digits in a row", and both are tested against
 * numbers that are one digit away from valid.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  contextOf, findPattern, findTerm, glyphsIn, luhn, mergeRanges, mod97, wordsOf,
} from '../../tools/redact-pdf/src/matches.js';
import { PdfDocument } from '../../shared/js/pdf-reader.js';
import { pagesOf, readPage } from '../../tools/redact-pdf/src/text.js';
import { ascii, buildPdf, streamObject } from './pdf-fixtures.js';

const hits = (text, term, how) => findTerm(text, term, how).map((r) => text.slice(r.from, r.to));
const patterns = (text, id) => findPattern(text, id).map((r) => text.slice(r.from, r.to));

async function pageOf(content) {
  const doc = await PdfDocument.open(buildPdf([
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] '
    + '/Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    streamObject('', ascii(content)),
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ]));
  return readPage(doc, pagesOf(doc)[0], 1);
}

/* =================================================================== terms */

test('a term is found everywhere it appears, ignoring case by default', () => {
  const text = 'Smith wrote to smith about SMITH';
  assert.equal(findTerm(text, 'smith').length, 3);
  assert.deepEqual(hits(text, 'smith', { matchCase: true }), ['smith']);
});

test('whole words only means what it says', () => {
  const text = 'cat concatenate cat.';
  assert.equal(findTerm(text, 'cat').length, 3);
  assert.equal(findTerm(text, 'cat', { wholeWord: true }).length, 2);
});

test('a space in the search matches a line break, or no gap at all', () => {
  assert.deepEqual(hits('Dear John\nSmith,', 'John Smith'), ['John\nSmith']);
  assert.deepEqual(hits('paid to JohnSmith today', 'John Smith'), ['JohnSmith']);
  assert.deepEqual(hits('paid to John  Smith today', 'John Smith'), ['John  Smith']);
});

test('a search without a space will not match across one', () => {
  assert.deepEqual(hits('the in voice is late', 'invoice'), []);
});

test('a term with regular-expression punctuation in it is a term', () => {
  assert.deepEqual(hits('ref (a.b) here', '(a.b)'), ['(a.b)']);
  assert.deepEqual(hits('ref axb here', 'a.b'), []);
});

test('an empty search finds nothing rather than everything', () => {
  assert.deepEqual(findTerm('anything', '   '), []);
});

/* ================================================================ patterns */

test('email addresses', () => {
  const text = 'write to jane.doe+tax@example.co.uk or ask; not @nothing';
  assert.deepEqual(patterns(text, 'email'), ['jane.doe+tax@example.co.uk']);
});

test('a card number is only offered when its check digit agrees', () => {
  // The first is a well-known test number; the second is it with one digit
  // changed, which is what a reference number that looks like a card is.
  assert.deepEqual(patterns('pay 4242 4242 4242 4242 now', 'card'),
    ['4242 4242 4242 4242']);
  assert.deepEqual(patterns('ref 4242 4242 4242 4243 now', 'card'), []);
});

test('luhn is the arithmetic, not a length check', () => {
  assert.equal(luhn('4111111111111111'), true);
  assert.equal(luhn('4111111111111112'), false);
  assert.equal(luhn('79927398713'), false); // valid check digit, too short to be a card
  assert.equal(luhn('4242424242424242424242'), false);
  assert.equal(luhn('42424242424242x2'), false);
});

test('an IBAN is checked with mod 97', () => {
  assert.deepEqual(patterns('to GB82 WEST 1234 5698 7654 32 please', 'iban'),
    ['GB82 WEST 1234 5698 7654 32']);
  assert.deepEqual(patterns('to GB82 WEST 1234 5698 7654 33 please', 'iban'), []);
});

test('mod97 rejects what is not an account number at all', () => {
  assert.equal(mod97('GB82WEST12345698765432'), true);
  assert.equal(mod97('DE89370400440532013000'), true);
  assert.equal(mod97('DE89370400440532013001'), false);
  assert.equal(mod97('NOTANIBAN'), false);
});

test('the two national numbers people are asked for on forms', () => {
  assert.deepEqual(patterns('SSN 123-45-6789 on file', 'nationalid'), ['123-45-6789']);
  assert.deepEqual(patterns('NI AB 12 34 56 C today', 'nationalid'), ['AB 12 34 56 C']);
  // The letters a national insurance number cannot begin with are not in the
  // pattern, so a reference that merely looks like one is not offered.
  assert.deepEqual(patterns('ref QQ 12 34 56 C today', 'nationalid'), []);
});

test('a telephone number is a shape with a digit count, and says so', () => {
  assert.deepEqual(patterns('call +44 161 496 0000 today', 'phone'),
    ['+44 161 496 0000']);
  // Too few digits to be a telephone number anywhere.
  assert.deepEqual(patterns('page 12-13 of the report', 'phone'), []);
});

test('a pattern never keeps the punctuation that ended the sentence', () => {
  assert.deepEqual(patterns('mail me at a@b.com.', 'email'), ['a@b.com']);
});

test('an unknown finder is nothing rather than a crash', () => {
  assert.deepEqual(findPattern('anything', 'nonsense'), []);
});

/* ================================================================== ranges */

test('overlapping ranges become one', () => {
  assert.deepEqual(
    mergeRanges([{ from: 0, to: 5 }, { from: 3, to: 9 }, { from: 20, to: 22 }]),
    [{ from: 0, to: 9 }, { from: 20, to: 22 }],
  );
});

test('ranges that only touch are still one', () => {
  assert.deepEqual(mergeRanges([{ from: 5, to: 8 }, { from: 8, to: 11 }]),
    [{ from: 5, to: 11 }]);
});

/* ============================================================ on a page */

test('the words of a page are the runs with no gap in them', async () => {
  const page = await pageOf('BT /F1 12 Tf 72 700 Td (Dear Mr Smith) Tj ET');
  assert.deepEqual(wordsOf(page).map((word) => word.text), ['Dear', 'Mr', 'Smith']);
});

test('a range of characters maps back to the glyphs that drew it', async () => {
  const page = await pageOf('BT /F1 12 Tf 72 700 Td (Dear Mr Smith) Tj ET');
  const [word] = wordsOf(page).slice(-1);
  const glyphs = [...glyphsIn(page, word.from, word.to)];
  assert.equal(glyphs.length, 5);
  assert.equal(glyphs.map((index) => page.glyphs[index].text).join(''), 'Smith');
});

test('a character with no glyph behind it is skipped, not counted', async () => {
  // The gap between the two strings is a space nobody drew.
  const page = await pageOf('BT /F1 12 Tf 72 700 Td [(one)-600(two)] TJ ET');
  assert.equal(page.text, 'one two');
  assert.equal(glyphsIn(page, 3, 4).size, 0);
});

test('the context of a match is the line it sits on', async () => {
  const page = await pageOf(
    'BT /F1 12 Tf 72 700 Td (Dear Mr Smith) Tj 0 -20 Td (and nobody else) Tj ET',
  );
  const [hit] = findTerm(page.text, 'Smith');
  assert.deepEqual(contextOf(page, hit.from, hit.to), {
    before: 'Dear Mr ', hit: 'Smith', after: '',
  });
});
