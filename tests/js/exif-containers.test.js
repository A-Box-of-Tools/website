/**
 * tools/exif-editor/src/{jpeg,png,webp}.js.
 *
 * All three do the same job three ways: split a file into a list, report what
 * metadata is in it, rewrite the list from a plan, and put it back together.
 *
 * The claim that matters is the one on every page of the tool: removing
 * metadata does not touch the picture. For JPEG that means the entropy-coded
 * scan is copied byte for byte; for PNG it means IDAT is; for WebP it means
 * the VP8 chunk is. Each of those is asserted below on a file that had its
 * metadata taken out.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import * as jpeg from '../../tools/exif-editor/src/jpeg.js';
import * as png from '../../tools/exif-editor/src/png.js';
import * as webp from '../../tools/exif-editor/src/webp.js';
import {
  EXIF_ID, IDAT, IHDR, JFIF_SEGMENT, PNG_SIGNATURE, VP8_CHUNK, XMP_ID,
  ascii, chunk, concat, deflate, indexOfBytes, jpeg as makeJpeg, png as makePng,
  segment, textChunk, vp8xChunk, webp as makeWebp, webpChunk,
} from './helpers.js';

const STRIP_ALL = { exif: null, xmp: null, iptc: null, icc: null, comments: null, extras: null, text: null };

/* ================================================================== JPEG */

test('jpeg: a file that does not start like one', () => {
  assert.equal(jpeg.read(ascii('nope')).ok, false);
  assert.match(jpeg.read(ascii('nope')).error, /does not start like a JPEG/);
});

test('jpeg: a file with no scan in it', () => {
  const parsed = jpeg.read(new Uint8Array([0xff, 0xd8, 0xff, 0xd9]));
  assert.equal(parsed.ok, false);
  assert.match(parsed.error, /ended before the image data/);
});

test('jpeg: a segment claiming a length past the end of the file', () => {
  const bytes = concat([0xff, 0xd8], [0xff, 0xe1], [0xff, 0xff], ascii('short'));
  const parsed = jpeg.read(bytes);
  assert.equal(parsed.ok, false);
  assert.match(parsed.error, /runs off the end/);
});

test('jpeg: lost segment structure is reported', () => {
  const bytes = concat([0xff, 0xd8], ascii('not a marker'));
  assert.match(jpeg.read(bytes).error, /segment structure/);
});

test('jpeg: read then write is byte-for-byte', () => {
  const bytes = makeJpeg([JFIF_SEGMENT, segment(0xe1, concat(EXIF_ID, ascii('block')))]);
  const doc = jpeg.read(bytes);
  assert.equal(doc.ok, true);
  assert.deepEqual(jpeg.write(doc), bytes);
});

test('jpeg: padding 0xff bytes before a marker are tolerated', () => {
  const bytes = concat([0xff, 0xd8], [0xff, 0xff, 0xff], JFIF_SEGMENT,
    [0xff, 0xda], [0x00, 0x04], ascii('ab'));
  const doc = jpeg.read(bytes);
  assert.equal(doc.ok, true);
  assert.equal(doc.segments.length, 1);
});

test('jpeg: standalone markers carry no payload', () => {
  const bytes = concat([0xff, 0xd8], [0xff, 0x01], [0xff, 0xd0], JFIF_SEGMENT,
    [0xff, 0xda], [0x00, 0x04], ascii('ab'));
  assert.equal(jpeg.read(bytes).segments.length, 1);
});

test('jpeg: the exif block is collected without its wrapper', () => {
  const bytes = makeJpeg([segment(0xe1, concat(EXIF_ID, ascii('TIFFBLOCK')))]);
  const meta = jpeg.collect(jpeg.read(bytes));
  assert.deepEqual(meta.exif, ascii('TIFFBLOCK'));
});

test('jpeg: xmp is collected as text', () => {
  const bytes = makeJpeg([segment(0xe1, concat(XMP_ID, ascii('<x:xmpmeta/>')))]);
  assert.equal(jpeg.collect(jpeg.read(bytes)).xmp, '<x:xmpmeta/>');
});

test('jpeg: a comment is collected', () => {
  const bytes = makeJpeg([segment(0xfe, ascii('taken on holiday'))]);
  assert.deepEqual(jpeg.collect(jpeg.read(bytes)).comments, ['taken on holiday']);
});

test('jpeg: an ICC profile split over segments is rejoined in order', () => {
  const part = (seq, total, body) =>
    segment(0xe2, concat(ascii('ICC_PROFILE\0'), [seq, total], ascii(body)));
  // Deliberately out of order in the file.
  const bytes = makeJpeg([part(2, 2, 'second'), part(1, 2, 'first')]);
  assert.equal(new TextDecoder().decode(jpeg.collect(jpeg.read(bytes)).icc),
    'firstsecond');
});

test('jpeg: jfif and the adobe marker are reported as deliberately kept', () => {
  const adobe = segment(0xee, ascii('Adobe\0something'));
  const meta = jpeg.collect(jpeg.read(makeJpeg([JFIF_SEGMENT, adobe])));
  assert.deepEqual(meta.notes.map((n) => n.label),
    ['JFIF header', 'Adobe colour marker']);
  assert.equal(meta.extras.length, 0);
});

test('jpeg: an unidentified APPn segment is labelled by its signature', () => {
  const bytes = makeJpeg([segment(0xe5, ascii('SomeTool\0payload'))]);
  const extras = jpeg.collect(jpeg.read(bytes)).extras;
  assert.equal(extras.length, 1);
  assert.equal(extras[0].label, 'APP5 (SomeTool)');
});

test('jpeg: an APPn with no readable signature is named by its number', () => {
  const bytes = makeJpeg([segment(0xe5, new Uint8Array([1, 2, 3, 0, 9]))]);
  assert.equal(jpeg.collect(jpeg.read(bytes)).extras[0].label, 'APP5');
});

test('jpeg: stripping everything leaves the scan untouched', () => {
  const scan = ascii('ENTROPY CODED PICTURE DATA');
  const bytes = makeJpeg([
    JFIF_SEGMENT,
    segment(0xe1, concat(EXIF_ID, ascii('exif'))),
    segment(0xe1, concat(XMP_ID, ascii('xmp'))),
    segment(0xfe, ascii('a comment')),
    segment(0xe5, ascii('Other\0junk')),
    segment(0xdb, ascii('quantisation table')), // image data, must survive
  ], scan);

  const doc = jpeg.read(bytes);
  jpeg.apply(doc, STRIP_ALL);
  const out = jpeg.write(doc);

  const meta = jpeg.collect(doc);
  assert.equal(meta.exif, null);
  assert.equal(meta.xmp, null);
  assert.deepEqual(meta.comments, []);
  assert.deepEqual(meta.extras, []);
  assert.ok(indexOfBytes(out, scan) > 0, 'the scan is still in the file');
  assert.ok(indexOfBytes(out, ascii('quantisation table')) > 0, 'image data kept');
  assert.equal(indexOfBytes(out, ascii('a comment')), -1);
  assert.ok(out.length < bytes.length);
});

test('jpeg: jfif goes first and the adobe marker survives stripping', () => {
  const doc = jpeg.read(makeJpeg([
    segment(0xfe, ascii('comment')),
    segment(0xee, ascii('Adobe\0x')),
    JFIF_SEGMENT,
  ]));
  jpeg.apply(doc, STRIP_ALL);
  // Removing the Adobe marker turns some files inside out colour-wise.
  assert.equal(new TextDecoder('latin1').decode(doc.segments[0].payload).slice(0, 5), 'JFIF\0');
  assert.equal(doc.segments.length, 2);
});

test('jpeg: a key left out of the plan means leave it alone', () => {
  const doc = jpeg.read(makeJpeg([segment(0xfe, ascii('keep me'))]));
  jpeg.apply(doc, { exif: null });
  assert.deepEqual(jpeg.collect(doc).comments, ['keep me']);
});

test('jpeg: a new exif block is written into an APP1 segment', () => {
  const doc = jpeg.read(makeJpeg([]));
  jpeg.apply(doc, { exif: ascii('NEWBLOCK') });
  assert.deepEqual(jpeg.collect(doc).exif, ascii('NEWBLOCK'));
  assert.deepEqual(jpeg.write(doc).subarray(0, 2), new Uint8Array([0xff, 0xd8]));
});

test('jpeg: metadata too large for one segment is refused with advice', () => {
  const doc = jpeg.read(makeJpeg([]));
  assert.throws(
    () => jpeg.apply(doc, { exif: new Uint8Array(70000) }),
    /thumbnail|maker note/,
  );
});

/* =================================================================== PNG */

test('png: a file that does not start like one', async () => {
  const parsed = await png.read(ascii('not a png at all'));
  assert.equal(parsed.ok, false);
  assert.match(parsed.error, /does not start like a PNG/);
});

test('png: a chunk claiming a length past the end of the file', async () => {
  const bad = concat(PNG_SIGNATURE, [0xff, 0xff, 0xff, 0xff], ascii('IHDR'), ascii('xx'));
  assert.match((await png.read(bad)).error, /runs off the end/);
});

test('png: a file whose first chunk is not IHDR', async () => {
  const bad = concat(PNG_SIGNATURE, textChunk('a', 'b'));
  assert.match((await png.read(bad)).error, /header chunk is missing/);
});

test('png: read then write recomputes every CRC and matches', async () => {
  const bytes = makePng([textChunk('Author', 'Jane')]);
  const doc = await png.read(bytes);
  assert.equal(doc.ok, true);
  assert.deepEqual(png.write(doc), bytes);
});

test('png: chunks after IEND are not read', async () => {
  const bytes = concat(makePng([]), textChunk('Trailing', 'junk'));
  const doc = await png.read(bytes);
  assert.equal(doc.chunks.at(-1).type, 'IEND');
});

test('png: a tEXt chunk is unpacked', async () => {
  const doc = await png.read(makePng([textChunk('Author', 'Jane Doe')]));
  const meta = png.collect(doc);
  assert.equal(meta.text.length, 1);
  assert.equal(meta.text[0].keyword, 'Author');
  assert.equal(meta.text[0].value, 'Jane Doe');
  assert.equal(meta.text[0].encoding, 'tEXt');
});

test('png: a zTXt chunk is decompressed', async () => {
  const body = await deflate(ascii('a compressed comment'));
  const zTXt = chunk('zTXt', concat(ascii('Comment'), [0, 0], body));
  const meta = png.collect(await png.read(makePng([zTXt])));
  assert.equal(meta.text[0].value, 'a compressed comment');
});

test('png: an unreadable compressed chunk is still reported', async () => {
  // Unreadable is not the same as empty: it is still there and still
  // removable.
  const zTXt = chunk('zTXt', concat(ascii('Comment'), [0, 0], ascii('not deflate')));
  const meta = png.collect(await png.read(makePng([zTXt])));
  assert.equal(meta.text[0].unreadable, true);
  assert.equal(meta.text[0].value, null);
});

test('png: an eXIf chunk is collected', async () => {
  const doc = await png.read(makePng([chunk('eXIf', ascii('TIFFBLOCK'))]));
  assert.deepEqual(png.collect(doc).exif, ascii('TIFFBLOCK'));
});

test('png: a JPEG-style Exif marker in front is tolerated', async () => {
  const doc = await png.read(makePng([chunk('eXIf', concat(EXIF_ID, ascii('TIFF')))]));
  assert.deepEqual(png.collect(doc).exif, ascii('TIFF'));
});

test('png: an XMP packet is recognised by its keyword', async () => {
  const iTXt = chunk('iTXt', concat(
    ascii('XML:com.adobe.xmp'), [0, 0, 0, 0, 0], ascii('<x:xmpmeta/>'),
  ));
  const meta = png.collect(await png.read(makePng([iTXt])));
  assert.equal(meta.xmp, '<x:xmpmeta/>');
  assert.equal(meta.text.length, 0, 'XMP is not listed twice');
});

test('png: an ICC profile is collected with its name', async () => {
  const iCCP = chunk('iCCP', concat(ascii('Display P3'), [0, 0], ascii('profile')));
  const meta = png.collect(await png.read(makePng([iCCP])));
  assert.equal(meta.iccName, 'Display P3');
  assert.deepEqual(meta.icc, ascii('profile'));
});

test('png: tIME and dSIG are listed as removable extras', async () => {
  const doc = await png.read(makePng([chunk('tIME', new Uint8Array(7)), chunk('dSIG', ascii('sig'))]));
  assert.deepEqual(png.collect(doc).extras.map((e) => e.label), [
    'Last-modified time (tIME)', 'Embedded digital signature (dSIG)',
  ]);
});

test('png: stripping everything leaves IDAT untouched', async () => {
  const bytes = makePng([
    textChunk('Author', 'Jane'),
    chunk('eXIf', ascii('TIFFBLOCK')),
    chunk('iCCP', concat(ascii('P3'), [0, 0], ascii('profile'))),
    chunk('tIME', new Uint8Array(7)),
  ]);
  const doc = await png.read(bytes);
  png.apply(doc, STRIP_ALL);
  const out = png.write(doc);

  assert.deepEqual(doc.chunks.map((c) => c.type), ['IHDR', 'IDAT', 'IEND']);
  assert.ok(indexOfBytes(out, IDAT) > 0, 'IDAT survives byte for byte');
  assert.equal(indexOfBytes(out, ascii('Jane')), -1);
  assert.ok(out.length < bytes.length);
});

test('png: new metadata goes in after IHDR and nothing else moves', async () => {
  // An animated PNG carries fcTL and fdAT chunks after IDAT; shuffling chunks
  // into tidy groups would quietly turn the animation into a still.
  const fcTL = chunk('fcTL', new Uint8Array(26));
  const fdAT = chunk('fdAT', ascii('frame'));
  const bytes = concat(PNG_SIGNATURE, IHDR, IDAT, fcTL, fdAT, chunk('IEND'));
  const doc = await png.read(bytes);
  png.apply(doc, { exif: ascii('NEW') });
  assert.deepEqual(doc.chunks.map((c) => c.type),
    ['IHDR', 'eXIf', 'IDAT', 'fcTL', 'fdAT', 'IEND']);
});

test('png: plain text is written as tEXt and other text as iTXt', async () => {
  const doc = await png.read(makePng([]));
  png.apply(doc, { text: [{ keyword: 'A', value: 'plain' }, { keyword: 'B', value: 'café — x' }] });
  assert.deepEqual(doc.chunks.map((c) => c.type), ['IHDR', 'tEXt', 'iTXt', 'IDAT', 'IEND']);

  const back = png.collect(await png.read(png.write(doc)));
  assert.deepEqual(back.text.map((t) => t.value), ['plain', 'café — x']);
});

test('png: a keyword longer than the format allows is truncated', async () => {
  const doc = await png.read(makePng([]));
  png.apply(doc, { text: [{ keyword: 'k'.repeat(120), value: 'v' }] });
  assert.equal(png.collect(doc).text[0].keyword.length, 79);
});

/* ================================================================== WebP */

test('webp: a file that does not start like one', () => {
  assert.match(webp.read(ascii('RIFFxxxxNOPExxxx')).error, /does not start like a WebP/);
  assert.match(webp.read(ascii('short')).error, /does not start like a WebP/);
});

test('webp: a chunk claiming a size past the end of the file', () => {
  const bytes = concat(ascii('RIFF'), new Uint8Array([20, 0, 0, 0]), ascii('WEBP'),
    ascii('VP8 '), new Uint8Array([0xff, 0xff, 0, 0]), ascii('xx'));
  assert.match(webp.read(bytes).error, /runs off the end/);
});

test('webp: read then write is byte-for-byte', () => {
  const bytes = makeWebp([vp8xChunk(0x08), VP8_CHUNK, webpChunk('EXIF', ascii('TIFF'))]);
  const doc = webp.read(bytes);
  assert.equal(doc.ok, true);
  assert.deepEqual(webp.write(doc), bytes);
});

test('webp: an odd-length chunk is padded and the pad is not data', () => {
  const bytes = makeWebp([webpChunk('EXIF', ascii('odd')), VP8_CHUNK]);
  const doc = webp.read(bytes);
  assert.deepEqual(doc.chunks[0].data, ascii('odd'));
  assert.deepEqual(webp.write(doc), bytes);
});

test('webp: metadata chunks are collected', () => {
  const doc = webp.read(makeWebp([
    vp8xChunk(0x2c), VP8_CHUNK,
    webpChunk('EXIF', ascii('TIFFBLOCK')),
    webpChunk('XMP ', ascii('<x:xmpmeta/>')),
    webpChunk('ICCP', ascii('profile')),
  ]));
  const meta = webp.collect(doc);
  assert.deepEqual(meta.exif, ascii('TIFFBLOCK'));
  assert.equal(meta.xmp, '<x:xmpmeta/>');
  assert.deepEqual(meta.icc, ascii('profile'));
});

test('webp: a JPEG-style Exif marker in front is tolerated', () => {
  const doc = webp.read(makeWebp([VP8_CHUNK, webpChunk('EXIF', concat(EXIF_ID, ascii('TIFF')))]));
  assert.deepEqual(webp.collect(doc).exif, ascii('TIFF'));
});

test('webp: a chunk this tool cannot read is reported as an extra', () => {
  // "Remove everything" promises that any block this tool could not identify
  // goes. JPEG and PNG always kept that promise; WebP once quietly did not.
  const doc = webp.read(makeWebp([VP8_CHUNK, webpChunk('ZZZZ', ascii('who knows'))]));
  const extras = webp.collect(doc).extras;
  assert.equal(extras.length, 1);
  assert.equal(extras[0].label, '"ZZZZ" chunk');
  assert.equal(extras[0].size, 'who knows'.length);
});

test('webp: the chunks it does understand are not reported as extras', () => {
  const doc = webp.read(makeWebp([
    vp8xChunk(0x2c), VP8_CHUNK,
    webpChunk('EXIF', ascii('x')), webpChunk('XMP ', ascii('y')),
    webpChunk('ICCP', ascii('z')), webpChunk('ALPH', ascii('a')),
  ]));
  assert.deepEqual(webp.collect(doc).extras, []);
});

test('webp: an unreadable chunk is removed with the rest', () => {
  const doc = webp.read(makeWebp([
    vp8xChunk(0x08), VP8_CHUNK,
    webpChunk('EXIF', ascii('TIFF')), webpChunk('ZZZZ', ascii('who knows')),
  ]));
  webp.apply(doc, STRIP_ALL);
  assert.deepEqual(doc.chunks.map((c) => c.fourcc), ['VP8X', 'VP8 ']);
  assert.equal(indexOfBytes(webp.write(doc), ascii('who knows')), -1);
});

test('webp: an unprintable fourcc is shown safely', () => {
  const doc = webp.read(makeWebp([VP8_CHUNK, webpChunk('ab', ascii('x'))]));
  assert.equal(webp.collect(doc).extras[0].label, '"??ab" chunk');
});

test('webp: stripping everything clears the VP8X flags to match', () => {
  // A file that says it has metadata and does not is what some readers treat
  // as corruption.
  const doc = webp.read(makeWebp([
    vp8xChunk(0x08 | 0x04 | 0x20), VP8_CHUNK,
    webpChunk('EXIF', ascii('TIFF')),
    webpChunk('XMP ', ascii('xmp')),
    webpChunk('ICCP', ascii('profile')),
  ]));
  webp.apply(doc, STRIP_ALL);

  const vp8x = doc.chunks.find((c) => c.fourcc === 'VP8X');
  assert.equal(vp8x.data[0], 0, 'every optional-chunk flag is cleared');
  assert.deepEqual(doc.chunks.map((c) => c.fourcc), ['VP8X', 'VP8 ']);
});

test('webp: the alpha flag is carried over rather than derived', () => {
  // A lossless bitstream can set it with no ALPH chunk of its own.
  const doc = webp.read(makeWebp([vp8xChunk(0x10 | 0x08), VP8_CHUNK, webpChunk('EXIF', ascii('x'))]));
  webp.apply(doc, { exif: null });
  assert.equal(doc.chunks.find((c) => c.fourcc === 'VP8X').data[0], 0x10);
});

test('webp: adding metadata sets the flag for it', () => {
  const doc = webp.read(makeWebp([vp8xChunk(0), VP8_CHUNK]));
  webp.apply(doc, { exif: ascii('TIFF') });
  assert.equal(doc.chunks.find((c) => c.fourcc === 'VP8X').data[0] & 0x08, 0x08);
});

test('webp: a plain file gains a VP8X header when metadata is added', () => {
  const doc = webp.read(makeWebp([VP8_CHUNK]));
  doc.canvas = { width: 16, height: 16 };
  webp.apply(doc, { exif: ascii('TIFF') });

  const vp8x = doc.chunks.find((c) => c.fourcc === 'VP8X');
  assert.ok(vp8x, 'a VP8X header was built');
  assert.equal(vp8x.data[4], 15, 'width - 1, little-endian');
  assert.equal(vp8x.data[7], 15, 'height - 1');
  assert.equal(vp8x.data[0] & 0x08, 0x08);
});

test('webp: adding metadata without a known size is refused', () => {
  const doc = webp.read(makeWebp([VP8_CHUNK]));
  assert.throws(() => webp.apply(doc, { exif: ascii('TIFF') }), /size could not be read/);
});

test('webp: chunks come out in the order the specification asks for', () => {
  const doc = webp.read(makeWebp([VP8_CHUNK, vp8xChunk(0)]));
  doc.canvas = { width: 16, height: 16 };
  webp.apply(doc, { exif: ascii('TIFF'), xmp: 'xmp' });
  assert.deepEqual(doc.chunks.map((c) => c.fourcc), ['VP8X', 'VP8 ', 'EXIF', 'XMP ']);
});

test('webp: the picture chunk is copied untouched', () => {
  const bytes = makeWebp([vp8xChunk(0x08), VP8_CHUNK, webpChunk('EXIF', ascii('TIFF'))]);
  const doc = webp.read(bytes);
  webp.apply(doc, STRIP_ALL);
  const out = webp.write(doc);
  assert.ok(indexOfBytes(out, ascii('bitstream')) > 0);
  assert.equal(indexOfBytes(out, ascii('TIFF')), -1);
});

test('webp: the RIFF size field describes what follows it', () => {
  const doc = webp.read(makeWebp([vp8xChunk(0x08), VP8_CHUNK, webpChunk('EXIF', ascii('TIFF'))]));
  webp.apply(doc, STRIP_ALL);
  const out = webp.write(doc);
  const view = new DataView(out.buffer);
  assert.equal(view.getUint32(4, true), out.length - 8);
});
