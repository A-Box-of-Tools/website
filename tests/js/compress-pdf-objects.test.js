/**
 * tools/compress-pdf/src/objects.js - the PDF object grammar.
 *
 * This is the half of the format images-to-pdf never needed. That tool only
 * ever wrote documents it had just built; this one opens files somebody else
 * made, which means the whole grammar and, more to the point, everything real
 * files do to it.
 *
 * The module's own comments name the concessions it makes to broken files - a
 * dictionary key that is not a name, a "1.0-2" number from a scanner, a
 * /Length that lies. Each of those is a test, because each is a place where a
 * silent guess would write out a document that is subtly not the one it read.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  Name, Parser, PdfStream, PdfString, PdfSyntaxError, Ref,
  ascii as asciiOf, indexOfAscii, isName, lastIndexOfAscii, name,
  parseIndirectObject,
} from '../../tools/compress-pdf/src/objects.js';
import { ascii, concat } from './pdf-fixtures.js';

/** Parse one value out of a source string. */
const parse = (source, resolve) => new Parser(ascii(source), 0, resolve).parseValue();

/** Parse one value and say where the cursor stopped. */
function parseWithPos(source) {
  const parser = new Parser(ascii(source));
  return { value: parser.parseValue(), pos: parser.pos };
}

const stringOf = (value) => new TextDecoder('latin1').decode(value.bytes);

/* ================================================================== atoms */

test('numbers', () => {
  assert.equal(parse('42'), 42);
  assert.equal(parse('-17'), -17);
  assert.equal(parse('+3'), 3);
  assert.equal(parse('3.14'), 3.14);
  assert.equal(parse('.5'), 0.5);
  assert.equal(parse('-.5'), -0.5);
  assert.equal(parse('0'), 0);
});

test('a number with a minus in the middle stops at the minus', () => {
  // "1.0-2" is a real thing scanners emit; readers take the number up to that
  // point, and so does this.
  assert.equal(parseWithPos('1.0-2').value, 1);
});

test('booleans and null', () => {
  assert.equal(parse('true'), true);
  assert.equal(parse('false'), false);
  assert.equal(parse('null'), null);
});

test('names', () => {
  assert.ok(parse('/Type') instanceof Name);
  assert.equal(parse('/Type').value, 'Type');
  assert.equal(parse('/').value, '', 'the empty name is legal');
});

test('a name may carry escaped bytes', () => {
  // #41 is how a name carries a byte that would otherwise end it.
  assert.equal(parse('/A#20Name').value, 'A Name');
  assert.equal(parse('/Sl#2Fash').value, 'Sl/ash');
  assert.equal(parse('/Hash#23').value, 'Hash#');
});

test('an incomplete escape is left as a literal hash', () => {
  assert.equal(parse('/Bad#ZZ').value, 'Bad#ZZ');
  assert.equal(parse('/Trailing#').value, 'Trailing#');
});

test('names are interned, so comparison is cheap', () => {
  assert.equal(name('Type'), name('Type'));
  assert.equal(parse('/Type'), parse('/Type'));
});

test('isName answers for anything, including nothing', () => {
  assert.equal(isName(name('Page'), 'Page'), true);
  assert.equal(isName(name('Page'), 'Pages'), false);
  assert.equal(isName(undefined, 'Page'), false);
  assert.equal(isName(null, 'Page'), false);
  assert.equal(isName('Page', 'Page'), false, 'a JS string is not a name');
});

/* ================================================================ strings */

test('a literal string', () => {
  assert.ok(parse('(Hello)') instanceof PdfString);
  assert.equal(stringOf(parse('(Hello)')), 'Hello');
  assert.equal(stringOf(parse('()')), '');
});

test('a literal string may nest balanced brackets', () => {
  assert.equal(stringOf(parse('(a (b) c)')), 'a (b) c');
  assert.equal(stringOf(parse('(((deep)))')), '((deep))');
});

test('backslash escapes', () => {
  assert.equal(stringOf(parse('(a\\nb)')), 'a\nb');
  assert.equal(stringOf(parse('(a\\rb)')), 'a\rb');
  assert.equal(stringOf(parse('(a\\tb)')), 'a\tb');
  assert.equal(stringOf(parse('(a\\bb)')), 'a\bb');
  assert.equal(stringOf(parse('(a\\fb)')), 'a\fb');
  assert.equal(stringOf(parse('(a\\(b)')), 'a(b');
  assert.equal(stringOf(parse('(a\\)b)')), 'a)b');
  assert.equal(stringOf(parse('(a\\\\b)')), 'a\\b');
});

test('an octal escape', () => {
  assert.equal(stringOf(parse('(\\101\\102)')), 'AB');
  assert.equal(stringOf(parse('(\\5)')), '', 'fewer than three digits');
  assert.equal(parse('(\\400)').bytes[0], 0x00, 'wrapped to a byte');
});

test('a backslash before a line break continues the line', () => {
  assert.equal(stringOf(parse('(one\\\ntwo)')), 'onetwo');
  assert.equal(stringOf(parse('(one\\\r\ntwo)')), 'onetwo');
});

test('a hex string', () => {
  assert.equal(stringOf(parse('<48656C6C6F>')), 'Hello');
  assert.equal(stringOf(parse('<>')), '');
});

test('a hex string ignores whitespace and takes an odd digit as a high nibble', () => {
  assert.equal(stringOf(parse('<48 65 6C 6C 6F>')), 'Hello');
  assert.deepEqual(parse('<4>').bytes, new Uint8Array([0x40]));
  assert.deepEqual(parse('<414>').bytes, new Uint8Array([0x41, 0x40]));
});

test('a string is kept as bytes, not decoded', () => {
  // The bytes may be PDFDocEncoding, UTF-16, or not text at all; decoding on
  // the way in and re-encoding on the way out would change files this tool is
  // only meant to be passing through.
  assert.deepEqual(parse('<FEFF0041>').bytes, new Uint8Array([0xfe, 0xff, 0x00, 0x41]));
});

/* ================================================================= arrays */

test('an array', () => {
  assert.deepEqual(parse('[1 2 3]'), [1, 2, 3]);
  assert.deepEqual(parse('[]'), []);
});

test('an array may hold anything, including other arrays', () => {
  const value = parse('[1 /Name (str) [2 3] true null]');
  assert.equal(value.length, 6);
  assert.equal(value[0], 1);
  assert.equal(value[1].value, 'Name');
  assert.deepEqual(value[3], [2, 3]);
  assert.equal(value[4], true);
  assert.equal(value[5], null);
});

test('an unclosed array is reported', () => {
  assert.throws(() => parse('[1 2 3'), PdfSyntaxError);
});

/* =========================================================== dictionaries */

test('a dictionary is a Map keyed without the slash', () => {
  const dict = parse('<< /Type /Page /Count 3 >>');
  assert.ok(dict instanceof Map);
  assert.equal(dict.get('Type').value, 'Page');
  assert.equal(dict.get('Count'), 3);
});

test('a dictionary is a Map so that odd keys cannot reach a prototype', () => {
  // "/constructor" and "/__proto__" are legal PDF names.
  const dict = parse('<< /__proto__ 1 /constructor 2 >>');
  assert.equal(dict.get('__proto__'), 1);
  assert.equal(dict.get('constructor'), 2);
  assert.equal(Object.getPrototypeOf(dict), Map.prototype);
});

test('an empty dictionary', () => {
  assert.equal(parse('<< >>').size, 0);
});

test('dictionaries nest', () => {
  const dict = parse('<< /Resources << /Font << /F1 5 0 R >> >> >>');
  assert.equal(dict.get('Resources').get('Font').get('F1').num, 5);
});

test('a key that is not a name is skipped rather than abandoning the rest', () => {
  // The file is damaged; a dictionary that is almost entirely readable is
  // worth more than nothing.
  const dict = parse('<< /Good 1 42 /Also 2 >>');
  assert.equal(dict.get('Good'), 1);
  assert.equal(dict.get('Also'), 2);
});

test('an unclosed dictionary is reported', () => {
  assert.throws(() => parse('<< /Type /Page'), PdfSyntaxError);
});

test('nesting past the guard is refused rather than exhausting the stack', () => {
  // This runs on bytes a stranger sent.
  assert.throws(() => parse('['.repeat(400) + ']'.repeat(400)),
    /^PdfSyntaxError: pdf\.deep$/);
});

/* ============================================================= references */

test('an indirect reference', () => {
  const ref = parse('12 0 R');
  assert.ok(ref instanceof Ref);
  assert.equal(ref.num, 12);
  assert.equal(ref.gen, 0);
  assert.equal(ref.key, '12,0');
});

test('two numbers that are not a reference stay two numbers', () => {
  assert.deepEqual(parse('[12 0]'), [12, 0]);
  assert.deepEqual(parse('[1 2 3]'), [1, 2, 3]);
});

test('the lookahead puts the cursor back when the guess is wrong', () => {
  const parser = new Parser(ascii('12 0 /Next'));
  assert.equal(parser.parseValue(), 12);
  assert.equal(parser.parseValue(), 0);
  assert.equal(parser.parseValue().value, 'Next');
});

test('R must stand alone to end a reference', () => {
  // "12 0 Rx" is not a reference: the two numbers come back as numbers, and
  // the leftover keyword is reported rather than guessed at.
  const parser = new Parser(ascii('12 0 Rx'));
  assert.equal(parser.parseValue(), 12);
  assert.equal(parser.parseValue(), 0);
  assert.throws(() => parser.parseValue(), PdfSyntaxError);
});

test('a reference may be followed immediately by a delimiter', () => {
  assert.equal(parse('[12 0 R]')[0].num, 12);
  assert.equal(parse('<< /A 12 0 R>>').get('A').num, 12);
});

test('a negative object number is not a reference', () => {
  assert.equal(parse('-1 0 R'), -1);
});

/* ============================================================== comments */

test('a comment runs to the end of the line and is skipped', () => {
  assert.equal(parse('% a note\n42'), 42);
  const dict = parse('<< /A 1 % why\n/B 2 >>');
  assert.equal(dict.get('B'), 2);
});

/* ================================================================ streams */

test('a stream keeps its bytes exactly as they appeared', () => {
  const source = '<< /Length 5 >>\nstream\nHELLO\nendstream';
  const value = parse(source);
  assert.ok(value instanceof PdfStream);
  assert.equal(new TextDecoder().decode(value.raw), 'HELLO');
});

test('a stream with a CRLF after the keyword', () => {
  const value = parse('<< /Length 5 >>\nstream\r\nHELLO\r\nendstream');
  assert.equal(new TextDecoder().decode(value.raw), 'HELLO');
});

test('a /Length that lies is not believed', () => {
  // Getting this wrong does not produce a small error: every byte after it is
  // misread.
  const value = parse('<< /Length 2 >>\nstream\nHELLO WORLD\nendstream');
  assert.equal(new TextDecoder().decode(value.raw), 'HELLO WORLD');
  assert.equal(value.dict.get('Length'), 11, 'the dictionary is corrected');
});

test('a missing /Length falls back to finding endstream', () => {
  const value = parse('<< /Filter /FlateDecode >>\nstream\nDATA HERE\nendstream');
  assert.equal(new TextDecoder().decode(value.raw), 'DATA HERE');
});

test('the end-of-line before endstream is punctuation, not data', () => {
  const value = parse('<< >>\nstream\nDATA\r\nendstream');
  assert.equal(new TextDecoder().decode(value.raw), 'DATA');
});

test('an indirect /Length is resolved when it can be', () => {
  const resolve = (ref) => (ref instanceof Ref && ref.num === 9 ? 5 : null);
  const value = parse('<< /Length 9 0 R >>\nstream\nHELLO\nendstream', resolve);
  assert.equal(new TextDecoder().decode(value.raw), 'HELLO');
});

test('an indirect /Length that cannot be resolved falls back', () => {
  const resolve = () => { throw new Error('no such object'); };
  const value = parse('<< /Length 9 0 R >>\nstream\nHELLO\nendstream', resolve);
  assert.equal(new TextDecoder().decode(value.raw), 'HELLO');
});

test('a stream with no endstream is reported', () => {
  assert.throws(() => parse('<< >>\nstream\nDATA'),
    /^PdfSyntaxError: pdf\.noendstream$/);
});

test('a stream may hold bytes that look like syntax', () => {
  const data = '<< >> obj endobj [ ] ( )';
  const value = parse(`<< /Length ${data.length} >>\nstream\n${data}\nendstream`);
  assert.equal(new TextDecoder().decode(value.raw), data);
});

test('the cursor lands past endstream', () => {
  const parser = new Parser(ascii('<< /Length 5 >>\nstream\nHELLO\nendstream /After'));
  parser.parseValue();
  assert.equal(parser.parseValue().value, 'After');
});

/* ======================================================= indirect objects */

test('parseIndirectObject reads the whole envelope', () => {
  const bytes = ascii('12 0 obj\n<< /Type /Page >>\nendobj\n');
  const found = parseIndirectObject(bytes, 0);
  assert.equal(found.num, 12);
  assert.equal(found.gen, 0);
  assert.equal(found.value.get('Type').value, 'Page');
});

test('parseIndirectObject reads from an offset', () => {
  const bytes = ascii('%PDF-1.7\n7 0 obj\n42\nendobj\n');
  const found = parseIndirectObject(bytes, 9);
  assert.equal(found.num, 7);
  assert.equal(found.value, 42);
});

test('parseIndirectObject refuses something that is not one', () => {
  assert.throws(() => parseIndirectObject(ascii('12 0 << >>'), 0),
    (error) => error.message === 'pdf.noobj' && error.values.at === 0);
});

/* ============================================================ byte search */

test('ascii reads a run of bytes as text', () => {
  const bytes = ascii('hello world');
  assert.equal(asciiOf(bytes, 0, 5), 'hello');
  assert.equal(asciiOf(bytes, 6, 11), 'world');
  assert.equal(asciiOf(bytes, 6, 999), 'world', 'clamped to the end');
});

test('indexOfAscii finds the first occurrence', () => {
  const bytes = ascii('one two one two');
  assert.equal(indexOfAscii(bytes, 'one'), 0);
  assert.equal(indexOfAscii(bytes, 'one', 1), 8);
  assert.equal(indexOfAscii(bytes, 'two'), 4);
  assert.equal(indexOfAscii(bytes, 'three'), -1);
});

test('lastIndexOfAscii searches backwards, which is how startxref is found', () => {
  const bytes = ascii('startxref 1 startxref 2');
  assert.equal(lastIndexOfAscii(bytes, 'startxref'), 12);
  assert.equal(lastIndexOfAscii(bytes, 'startxref', 11), 0);
  assert.equal(lastIndexOfAscii(bytes, 'nope'), -1);
});

test('the searches do not run off either end', () => {
  const bytes = ascii('abc');
  assert.equal(indexOfAscii(bytes, 'abcd'), -1);
  assert.equal(lastIndexOfAscii(bytes, 'abcd'), -1);
  assert.equal(indexOfAscii(bytes, 'a', -5), 0);
  assert.equal(indexOfAscii(bytes, 'c', 99), -1);
});

/* ================================================================ refusals */

test('an empty input, and a value that is not one', () => {
  assert.throws(() => parse(''), /^PdfSyntaxError: pdf\.short$/);
  assert.throws(() => parse('>>'), PdfSyntaxError);
  assert.throws(() => parse(']'), PdfSyntaxError);
});

test('a syntax error names where it happened', () => {
  try {
    new Parser(concat('   ', ']')).parseValue();
    assert.fail('should have thrown');
  } catch (err) {
    assert.ok(err instanceof PdfSyntaxError);
    // The offset is what this test is about, and it is a blank in the
    // sentence rather than part of it - the sentence is in body.html.
    // A "]" is not a word, so it is reported as the byte it is - which is
    // the other of the two keys, because "byte" is a word and goes in the
    // sentence rather than beside the number.
    assert.equal(err.message, 'pdf.unexpectedbyte');
    assert.equal(err.values.at, 3);
    assert.equal(err.values.hex, '5d');
  }
});
