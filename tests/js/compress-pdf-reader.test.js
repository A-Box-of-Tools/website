/**
 * tools/compress-pdf/src/{reader,filters}.js.
 *
 * The reader's job is to survive files it did not write. There are three ways
 * in - a classic cross-reference table, a cross-reference stream, and, when
 * neither survives checking, scanning the whole file for "N 0 obj" - and the
 * third one is the one that matters, because it is what stands between a
 * damaged file and an error message.
 *
 * The two refusals are tested too. An encrypted PDF is turned away rather than
 * quietly decrypted, and something that is not a PDF is told so.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  EncryptedPdfError, NotAPdfError, PdfDocument, scanObjectHeaders,
} from '../../tools/compress-pdf/src/reader.js';
import { decodeStream, filterNames } from '../../tools/compress-pdf/src/filters.js';
import { PdfStream, name } from '../../tools/compress-pdf/src/objects.js';
import {
  MINIMAL_OBJECTS, ascii, buildPdf, concat, deflate, minimalPdf, pdfWithMetadata,
  streamObject, text,
} from './pdf-fixtures.js';

/* ================================================================= opening */

test('a minimal document opens through the real xref table', async () => {
  const doc = await PdfDocument.open(minimalPdf());
  assert.equal(doc.repaired, false, 'the table was believed');
  assert.equal(doc.entries.size, 3);
  assert.equal(doc.version, '1.7');
  assert.equal(doc.countPages(), 1);
});

test('the catalogue is found through the trailer', async () => {
  const doc = await PdfDocument.open(minimalPdf());
  assert.ok(doc.catalog instanceof Map);
  assert.equal(doc.catalog.get('Type').value, 'Catalog');
});

test('the version comes off the header', async () => {
  assert.equal((await PdfDocument.open(minimalPdf({ header: '%PDF-1.4\n' }))).version, '1.4');
  assert.equal((await PdfDocument.open(minimalPdf({ header: '%PDF-2.0\n' }))).version, '2.0');
});

test('junk in front of the header is allowed', async () => {
  // A shell script or a mail part may precede it; readers are told to look in
  // the first kilobyte.
  const bytes = concat('#!/bin/sh\n# a wrapper\n', minimalPdf());
  const doc = await PdfDocument.open(bytes);
  assert.equal(doc.countPages(), 1);
});

test('objects resolve through references', async () => {
  const doc = await PdfDocument.open(minimalPdf());
  const pages = doc.resolve(doc.catalog.get('Pages'));
  assert.equal(pages.get('Type').value, 'Pages');
  assert.equal(pages.get('Count'), 1);
});

test('a page tree with several pages is counted', async () => {
  const doc = await PdfDocument.open(buildPdf([
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R 4 0 R 5 0 R] /Count 3 >>',
    '<< /Type /Page /Parent 2 0 R >>',
    '<< /Type /Page /Parent 2 0 R >>',
    '<< /Type /Page /Parent 2 0 R >>',
  ]));
  assert.equal(doc.countPages(), 3);
});

/* ================================================================ refusals */

test('something that is not a PDF is told so', async () => {
  await assert.rejects(
    () => PdfDocument.open(ascii('This is a plain text file, not a PDF at all.')),
    NotAPdfError,
  );
});

test('the refusal names what was missing', async () => {
  await assert.rejects(() => PdfDocument.open(ascii('nope')), /no %PDF- header/);
});

test('an encrypted PDF is turned away rather than quietly decrypted', async () => {
  // Even when the password is blank, removing that protection is a different
  // job from making the file smaller.
  const bytes = buildPdf(MINIMAL_OBJECTS);
  const withEncrypt = concat(
    text(bytes).replace('/Root 1 0 R >>', '/Root 1 0 R /Encrypt 4 0 R >>'),
  );
  await assert.rejects(() => PdfDocument.open(withEncrypt), EncryptedPdfError);
});

test('the encryption refusal explains itself', async () => {
  const bytes = buildPdf(MINIMAL_OBJECTS);
  const withEncrypt = concat(
    text(bytes).replace('/Root 1 0 R >>', '/Root 1 0 R /Encrypt 4 0 R >>'),
  );
  await assert.rejects(() => PdfDocument.open(withEncrypt),
    /will not do it behind your back/);
});

test('a PDF header with no catalogue behind it is refused', async () => {
  await assert.rejects(
    () => PdfDocument.open(ascii('%PDF-1.7\nnothing else at all\n%%EOF\n')),
    NotAPdfError,
  );
});

/* ================================================================= repair */

test('a broken startxref falls back to scanning, and still opens', async () => {
  const bytes = concat(text(minimalPdf()).replace(/startxref\n\d+/, 'startxref\n999999'));
  const doc = await PdfDocument.open(bytes);
  assert.equal(doc.repaired, true);
  assert.equal(doc.countPages(), 1, 'the document still reads');
});

test('an xref table full of wrong offsets is repaired', async () => {
  const bytes = concat(text(minimalPdf()).replace(/^0000000(\d\d\d) 00000 n $/gm,
    '0000000999 00000 n '));
  const doc = await PdfDocument.open(bytes);
  assert.equal(doc.countPages(), 1);
});

test('scanObjectHeaders finds every object in the file', () => {
  const found = scanObjectHeaders(minimalPdf());
  const numbers = found.map((entry) => entry.num);
  for (const num of [1, 2, 3]) assert.ok(numbers.includes(num), `object ${num}`);
});

test('scanObjectHeaders reports the offset the object number starts at', () => {
  const bytes = minimalPdf();
  for (const entry of scanObjectHeaders(bytes)) {
    const head = text(bytes.subarray(entry.offset, entry.offset + 12));
    assert.match(head, new RegExp(`^${entry.num} \\d+ obj`), head);
  }
});

test('scanObjectHeaders lists a rewritten object twice, in file order', () => {
  // An incremental update rewrites an object further down the file. The
  // scanner reports both and the caller takes the later one.
  const bytes = concat(
    '%PDF-1.7\n',
    '1 0 obj\n<< /Version 1 >>\nendobj\n',
    '1 0 obj\n<< /Version 2 >>\nendobj\n',
  );
  const found = scanObjectHeaders(bytes).filter((entry) => entry.num === 1);
  assert.equal(found.length, 2);
  assert.ok(found[0].offset < found[1].offset);
});

test('scanObjectHeaders does not take the tail of a longer number', () => {
  // "1234 0 obj" is object 1234, not object 234.
  const bytes = concat('%PDF-1.7\n', '1234 0 obj\n42\nendobj\n');
  assert.deepEqual(scanObjectHeaders(bytes).map((e) => e.num), [1234]);
});

/* ================================================================ filters */

test('filterNames reads both spellings', () => {
  assert.deepEqual(filterNames(new Map([['Filter', name('FlateDecode')]])), ['FlateDecode']);
  assert.deepEqual(
    filterNames(new Map([['Filter', [name('ASCII85Decode'), name('FlateDecode')]]])),
    ['ASCII85Decode', 'FlateDecode'],
  );
});

test('filterNames on a stream with no filter', () => {
  assert.deepEqual(filterNames(new Map()), []);
  assert.deepEqual(filterNames(new Map([['Filter', null]])), []);
});

test('decodeStream leaves an unfiltered stream alone', async () => {
  const stream = new PdfStream(new Map(), ascii('plain bytes'));
  const { bytes, remaining } = await decodeStream(stream);
  assert.equal(new TextDecoder().decode(bytes), 'plain bytes');
  assert.deepEqual(remaining, []);
});

test('decodeStream inflates FlateDecode', async () => {
  const raw = await deflate(ascii('the quick brown fox'.repeat(20)));
  const stream = new PdfStream(new Map([['Filter', name('FlateDecode')]]), raw);
  const { bytes, remaining } = await decodeStream(stream);
  assert.equal(new TextDecoder().decode(bytes), 'the quick brown fox'.repeat(20));
  assert.deepEqual(remaining, []);
});

test('decodeStream understands ASCIIHexDecode', async () => {
  const stream = new PdfStream(new Map([['Filter', name('ASCIIHexDecode')]]),
    ascii('48656C6C6F>'));
  const { bytes } = await decodeStream(stream);
  assert.equal(new TextDecoder().decode(bytes), 'Hello');
});

test('decodeStream understands RunLengthDecode', async () => {
  // A length byte under 128 means "the next n+1 bytes are literal"; over 128
  // means "repeat the next byte 257-n times"; 128 ends the data.
  const raw = new Uint8Array([4, 0x48, 0x65, 0x6c, 0x6c, 0x6f, 254, 0x21, 128]);
  const stream = new PdfStream(new Map([['Filter', name('RunLengthDecode')]]), raw);
  const { bytes } = await decodeStream(stream);
  assert.equal(new TextDecoder().decode(bytes), 'Hello!!!');
});

test('decodeStream understands ASCII85Decode', async () => {
  const stream = new PdfStream(new Map([['Filter', name('ASCII85Decode')]]),
    ascii('87cURD]j7BEbo7~>'));
  const { bytes } = await decodeStream(stream);
  assert.equal(new TextDecoder().decode(bytes), 'Hello world');
});

test('ASCII85 handles a partial final group and the z shorthand', async () => {
  const decode = async (source) => {
    const stream = new PdfStream(new Map([['Filter', name('ASCII85Decode')]]), ascii(source));
    return new TextDecoder().decode((await decodeStream(stream)).bytes);
  };
  assert.equal(await decode('9jqo^~>'), 'Man ', 'a full group');
  assert.equal(await decode('87cURD]j7BEbo7~>'), 'Hello world', 'a partial one');
  // 'z' stands for four zero bytes.
  const zeros = new PdfStream(new Map([['Filter', name('ASCII85Decode')]]), ascii('z~>'));
  assert.deepEqual(Array.from((await decodeStream(zeros)).bytes), [0, 0, 0, 0]);
});

test('ASCII85 accepts the optional opener and ignores whitespace', async () => {
  const stream = new PdfStream(new Map([['Filter', name('ASCII85Decode')]]),
    ascii('<~87cURD]j7\n BEbo7~>'));
  assert.equal(new TextDecoder().decode((await decodeStream(stream)).bytes), 'Hello world');
});

test('decodeStream applies a chain of filters in order', async () => {
  const inner = await deflate(ascii('twice wrapped'));
  let hex = '';
  for (const byte of inner) hex += byte.toString(16).padStart(2, '0');
  const stream = new PdfStream(
    new Map([['Filter', [name('ASCIIHexDecode'), name('FlateDecode')]]]),
    ascii(`${hex}>`),
  );
  const { bytes } = await decodeStream(stream);
  assert.equal(new TextDecoder().decode(bytes), 'twice wrapped');
});

test('decodeStream stops in front of an image filter and says which', async () => {
  // ['DCTDecode'] means the bytes are a JPEG, and the caller wants them that
  // way rather than decoded.
  const stream = new PdfStream(new Map([['Filter', name('DCTDecode')]]),
    ascii('JPEG BYTES'));
  const { bytes, remaining } = await decodeStream(stream);
  assert.deepEqual(remaining, ['DCTDecode']);
  assert.equal(new TextDecoder().decode(bytes), 'JPEG BYTES');
});

test('decodeStream unwraps a flate layer in front of an image filter', async () => {
  const raw = await deflate(ascii('JPEG BYTES'));
  const stream = new PdfStream(
    new Map([['Filter', [name('FlateDecode'), name('DCTDecode')]]]), raw,
  );
  const { bytes, remaining } = await decodeStream(stream);
  assert.deepEqual(remaining, ['DCTDecode']);
  assert.equal(new TextDecoder().decode(bytes), 'JPEG BYTES');
});

test('decodeStream refuses a filter it does not know', async () => {
  const stream = new PdfStream(new Map([['Filter', name('MadeUpDecode')]]), ascii('x'));
  await assert.rejects(() => decodeStream(stream), /unknown filter \/MadeUpDecode/);
});

test('decodeStream undoes a PNG predictor', async () => {
  // Predictor 12 is PNG "up": each row is stored as the difference from the
  // row above, with a filter-type byte in front.
  const rows = [
    [2, 10, 20, 30],  // filter type 2 (up), first row: nothing above, so as-is
    [2, 1, 1, 1],     // each byte one more than the row above
  ];
  const raw = await deflate(Uint8Array.from(rows.flat()));
  const stream = new PdfStream(new Map([
    ['Filter', name('FlateDecode')],
    ['DecodeParms', new Map([['Predictor', 12], ['Colors', 1], ['Columns', 3]])],
  ]), raw);
  const { bytes } = await decodeStream(stream);
  assert.deepEqual(Array.from(bytes), [10, 20, 30, 11, 21, 31]);
});

/* =============================================== streams inside a document */

test('a document holding a compressed stream reads it back', async () => {
  const raw = await deflate(ascii('BT /F1 12 Tf (Hello) Tj ET'));
  const doc = await PdfDocument.open(buildPdf([
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /Contents 4 0 R >>',
    streamObject('/Filter /FlateDecode', raw),
  ]));

  const contents = doc.resolve(doc.resolve(doc.catalog.get('Pages')));
  assert.ok(contents);
  const stream = doc.getObject(4);
  assert.ok(stream instanceof PdfStream);
  const { bytes } = await decodeStream(stream, (v) => doc.resolve(v));
  assert.equal(new TextDecoder().decode(bytes), 'BT /F1 12 Tf (Hello) Tj ET');
});
