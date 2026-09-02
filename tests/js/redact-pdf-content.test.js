/**
 * tools/redact-pdf/src/content.js - the content-stream grammar.
 *
 * A page's drawing instructions are the one part of a PDF neither the merger
 * nor the compressor ever had to open, and the whole of this tool depends on
 * reading them exactly. Two failures matter more than the rest and both are
 * silent:
 *
 *   - an operand mistaken for an operator, or the reverse, puts every byte
 *     offset after it out by a token, so the wrong bytes get cut;
 *   - an inline image whose length is misjudged leaves the lexer resuming in
 *     the middle of binary, which does not lose an image - it loses the rest
 *     of the page.
 *
 * The splicing is tested here too, because "everything except the operators
 * that showed the removed words is copied byte for byte" is a claim the tool
 * page makes out loud.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applySplices, encode, formatNumber, formatString, formatValue, lex,
} from '../../tools/redact-pdf/src/content.js';
import { Name, PdfString } from '../../shared/js/pdf-objects.js';
import { ascii, concat } from './pdf-fixtures.js';

const ops = (source) => lex(ascii(source));
const names = (source) => ops(source).map((op) => op.name);
const latin1 = (bytes) => new TextDecoder('latin1').decode(bytes);

/* =============================================================== operators */

test('operands accumulate and an operator consumes them', () => {
  const found = ops('1 0 0 1 72 700 cm');
  assert.deepEqual(names('1 0 0 1 72 700 cm'), ['cm']);
  assert.deepEqual(found[0].args, [1, 0, 0, 1, 72, 700]);
});

test('a whole text block comes back in order', () => {
  assert.deepEqual(
    names('BT /F1 12 Tf 72 700 Td (hi) Tj ET Q'),
    ['BT', 'Tf', 'Td', 'Tj', 'ET', 'Q'],
  );
});

test('the byte range of an operator covers its operands as well', () => {
  const source = 'q 1 0 0 1 5 5 cm Q';
  const found = ops(source);
  const cm = found[1];
  assert.equal(source.slice(cm.start, cm.end), '1 0 0 1 5 5 cm');
});

test('an operator with no operands starts at itself', () => {
  const source = 'BT ET';
  const [bt] = ops(source);
  assert.equal(source.slice(bt.start, bt.end), 'BT');
});

test('the operators that look like numbers are not numbers', () => {
  // "0 0 1 RG" would be an indirect reference if the R were read as one.
  assert.deepEqual(names('0 0 1 RG 1 0 0 rg'), ['RG', 'rg']);
});

test('strings, names, arrays and dictionaries all arrive as values', () => {
  const [op] = ops('[(a) -20 <42>] TJ');
  assert.equal(op.name, 'TJ');
  assert.equal(op.args.length, 1);
  const [array] = op.args;
  assert.equal(latin1(array[0].bytes), 'a');
  assert.equal(array[1], -20);
  assert.equal(latin1(array[2].bytes), 'B');
});

test('a name operand keeps its spelling', () => {
  const [op] = ops('/F1 12 Tf');
  assert.ok(op.args[0] instanceof Name);
  assert.equal(op.args[0].value, 'F1');
});

test('the two operators that are punctuation are read as operators', () => {
  assert.deepEqual(names("(a) ' 1 2 (b) \""), ["'", '"']);
});

test('a stray bracket costs one operator and not the page', () => {
  assert.deepEqual(names('BT ] (a) Tj ET'), ['BT', 'Tj', 'ET']);
});

test('an unclosed string does not hang or swallow the stream', () => {
  const found = names('BT (unclosed');
  assert.deepEqual(found.slice(0, 1), ['BT']);
});

/* ============================================================ inline images */

test('an unfiltered inline image is measured from its dictionary', () => {
  // 2x2 grey at 8 bits is four bytes, and two of them spell "EI" so that a
  // search for the delimiter alone would end the image in the wrong place.
  const data = new Uint8Array([0x45, 0x49, 0x20, 0x21]);
  const stream = concat('q BI /W 2 /H 2 /BPC 8 /CS /G ID ', data, ' EI Q BT ET');
  assert.deepEqual(lex(stream).map((op) => op.name),
    ['q', 'INLINE_IMAGE', 'Q', 'BT', 'ET']);
});

test('a filtered inline image falls back to a delimited EI', () => {
  const stream = concat('BI /W 8 /H 8 /F /AHx ID ', ascii('ffddaa'), ' EI\nBT ET');
  assert.deepEqual(lex(stream).map((op) => op.name),
    ['INLINE_IMAGE', 'BT', 'ET']);
});

test('an image that runs to the end of the stream does not loop', () => {
  assert.deepEqual(lex(ascii('BI /W 2 /H 2 ID abcd')).map((op) => op.name),
    ['INLINE_IMAGE']);
});

/* ================================================================ writing */

test('numbers never come out in exponent notation', () => {
  assert.equal(formatNumber(0.0000001), '0');
  assert.ok(!formatNumber(1e-7).includes('e'));
  assert.ok(!formatNumber(1e21).includes('e'));
  assert.ok(!formatNumber(-1.5e-9).includes('e'));
});

test('numbers keep the precision a page position needs and no more', () => {
  assert.equal(formatNumber(72), '72');
  assert.equal(formatNumber(-2556), '-2556');
  assert.equal(formatNumber(1.5), '1.5');
  assert.equal(formatNumber(1 / 3), '0.333333');
  assert.equal(formatNumber(Number.NaN), '0');
});

test('strings are written as hex, which has no escaping to get wrong', () => {
  assert.equal(formatString(ascii('A(b)\\')), '<412862295c>');
  assert.equal(formatString(new Uint8Array([0, 255])), '<00ff>');
});

/* ================================================================ splicing */

test('a splice replaces one run and copies the rest byte for byte', () => {
  const bytes = ascii('BT (one) Tj (two) Tj ET');
  const out = applySplices(bytes, [{ start: 3, end: 11, text: '[<6f6e65>] TJ' }]);
  assert.equal(latin1(out), 'BT [<6f6e65>] TJ (two) Tj ET');
});

test('splices are applied in order wherever they were given in', () => {
  const bytes = ascii('abcdefgh');
  const out = applySplices(bytes, [
    { start: 4, end: 6, text: 'Y' },
    { start: 1, end: 3, text: 'X' },
  ]);
  assert.equal(latin1(out), 'aXdYgh');
});

test('an overlapping splice is dropped rather than corrupting the stream', () => {
  const bytes = ascii('abcdefgh');
  const out = applySplices(bytes, [
    { start: 1, end: 5, text: 'X' },
    { start: 3, end: 6, text: 'Y' },
  ]);
  assert.equal(latin1(out), 'aXfgh');
});

test('no splices means the same bytes back', () => {
  const bytes = ascii('BT ET');
  assert.equal(applySplices(bytes, []), bytes);
});

test('encode is byte per character, which is what a content stream is', () => {
  assert.deepEqual([...encode('AB')], [65, 66]);
});

/* ================================================================== asking */

test('a string operand survives the round trip through the lexer', () => {
  const [op] = ops('(A\\(b\\)) Tj');
  assert.ok(op.args[0] instanceof PdfString);
  assert.equal(latin1(op.args[0].bytes), 'A(b)');
});
