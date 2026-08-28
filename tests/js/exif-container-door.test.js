/**
 * tools/exif-editor/src/container.js and src/report.js.
 *
 * container.js is the one door in front of the three formats: it identifies a
 * file by its first bytes rather than by its name (a ".jpg" that is really a
 * PNG is common, and acting on the extension would mean writing a JPEG segment
 * into a PNG), and it turns all three into one shape.
 *
 * report.js turns that shape into sentences. The findings list is the part of
 * the page that matters - it is the answer to "is there anything in this photo
 * I would not want to post" - so what is asserted here is which findings appear
 * and how severe each is said to be.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  KIND_NAMES, exifBytes, outputType, readBytes, serialize, sniff,
} from '../../tools/exif-editor/src/container.js';
import {
  badges, bytes as sizeText, buildFindings, countTags, hasMetadata, metadataSize,
  readPosition, tagGroups,
} from '../../tools/exif-editor/src/report.js';
import { TYPE, createEntry } from '../../tools/exif-editor/src/tiff.js';
import {
  EXIF_ID, TIFF_LE, VP8_CHUNK, ascii, chunk, concat, indexOfBytes,
  jpeg as makeJpeg, png as makePng, segment, textChunk, vp8xChunk,
  webp as makeWebp, webpChunk,
} from './helpers.js';

const exifSegment = (block) => segment(0xe1, concat(EXIF_ID, block));

/* ================================================================ sniff */

test('sniff: the three formats this tool can rewrite', () => {
  assert.equal(sniff(makeJpeg([])), 'jpeg');
  assert.equal(sniff(makePng([])), 'png');
  assert.equal(sniff(makeWebp([VP8_CHUNK])), 'webp');
});

test('sniff: the formats it can name but not rewrite', () => {
  const ftyp = (brand) => concat(new Uint8Array(4), ascii('ftyp'), ascii(brand));
  assert.equal(sniff(ftyp('heic')), 'heic');
  assert.equal(sniff(ftyp('mif1')), 'heic');
  assert.equal(sniff(ftyp('avif')), 'avif');
  assert.equal(sniff(ascii('GIF89a')), 'gif');
  assert.equal(sniff(new Uint8Array([0x49, 0x49, 0x2a, 0x00])), 'tiff');
  assert.equal(sniff(new Uint8Array([0x4d, 0x4d, 0x00, 0x2a])), 'tiff');
});

test('sniff: anything else', () => {
  assert.equal(sniff(ascii('hello there')), 'unknown');
  assert.equal(sniff(new Uint8Array(0)), 'unknown');
  assert.equal(sniff(new Uint8Array([0xff])), 'unknown');
});

test('sniff: the name is never consulted', async () => {
  // A PNG that arrived called ".jpg" must be read as a PNG.
  const item = await readBytes(makePng([]));
  assert.equal(item.kind, 'png');
  assert.equal(KIND_NAMES[item.kind], 'PNG');
});

/* ============================================================= readBytes */

test('readBytes: a JPEG with EXIF in it', async () => {
  const item = await readBytes(makeJpeg([exifSegment(TIFF_LE)]));
  assert.equal(item.ok, true);
  assert.equal(item.kind, 'jpeg');
  assert.equal(item.exif.ok, true);
  assert.equal(item.size, makeJpeg([exifSegment(TIFF_LE)]).length);
  assert.equal(countTags(item), 2);
});

test('readBytes: EXIF that will not parse comes back as a failure, not a crash', async () => {
  const item = await readBytes(makeJpeg([exifSegment(ascii('XXnot a tiff block'))]));
  assert.equal(item.ok, true, 'the file itself still read');
  assert.equal(item.exif.ok, false);
  assert.ok(item.exif.error);
});

test('readBytes: a file with no EXIF has no model', async () => {
  const item = await readBytes(makeJpeg([]));
  assert.equal(item.exif, null);
  assert.equal(countTags(item), 0);
});

test('readBytes: a format that cannot be rewritten explains itself', async () => {
  const heic = concat(new Uint8Array(4), ascii('ftyp'), ascii('heic'), new Uint8Array(8));
  const item = await readBytes(heic);
  assert.equal(item.ok, false);
  assert.equal(item.kind, 'heic');
  assert.equal(item.error, 'refuse.heic');
});

test('readBytes: an unknown format is refused plainly', async () => {
  const item = await readBytes(ascii('this is a text file'));
  assert.equal(item.ok, false);
  assert.equal(item.error, 'refuse.unknown');
});

test('readBytes: a damaged file of a known format reports the format error', async () => {
  const item = await readBytes(concat([0xff, 0xd8, 0xff], ascii('broken')));
  assert.equal(item.ok, false);
  assert.equal(item.kind, 'jpeg');
});

test('readBytes: the original bytes are kept', async () => {
  // "Undo my changes" is this function run again on them.
  const original = makeJpeg([exifSegment(TIFF_LE)]);
  const item = await readBytes(original);
  assert.deepEqual(item.bytes, original);
});

/* ============================================================= serialize */

test('serialize: stripping a JPEG keeps the scan', async () => {
  const scan = ascii('PICTURE DATA');
  const item = await readBytes(makeJpeg([exifSegment(TIFF_LE)], scan));
  const out = serialize(item, { exif: null, xmp: null, comments: null, extras: null });
  assert.ok(indexOfBytes(out, scan) > 0);
  assert.equal((await readBytes(out)).exif, null);
});

test('serialize: the in-memory document is not changed', async () => {
  // A failed or cancelled save must not leave the copy half-rewritten.
  const item = await readBytes(makeJpeg([exifSegment(TIFF_LE)]));
  const before = item.doc.segments.length;
  serialize(item, { exif: null });
  assert.equal(item.doc.segments.length, before);
  assert.equal(countTags(item), 2);
});

test('serialize: a PNG and a WebP go through the same door', async () => {
  const pngItem = await readBytes(makePng([chunk('eXIf', TIFF_LE)]));
  assert.equal((await readBytes(serialize(pngItem, { exif: null }))).exif, null);

  const webpItem = await readBytes(
    makeWebp([vp8xChunk(0x08), VP8_CHUNK, webpChunk('EXIF', TIFF_LE)]));
  assert.equal((await readBytes(serialize(webpItem, { exif: null }))).exif, null);
});

test('exifBytes: an edited model comes back as a block', async () => {
  const item = await readBytes(makeJpeg([exifSegment(TIFF_LE)]));
  const block = exifBytes(item.exif);
  assert.ok(block instanceof Uint8Array);
  assert.equal((await readBytes(serialize(item, { exif: block }))).exif.ok, true);
});

test('exifBytes: nothing left means nothing written', () => {
  assert.equal(exifBytes(null), null);
  assert.equal(exifBytes({ ok: false }), null);
  assert.equal(exifBytes({ ok: true, groups: {} }), null);
});

test('outputType: the extension and type each format is saved as', () => {
  assert.deepEqual(outputType('png'), { mime: 'image/png', ext: 'png' });
  assert.deepEqual(outputType('webp'), { mime: 'image/webp', ext: 'webp' });
  assert.deepEqual(outputType('jpeg'), { mime: 'image/jpeg', ext: 'jpg' });
  assert.deepEqual(outputType('anything else'), { mime: 'image/jpeg', ext: 'jpg' });
});

/* ================================================================ report */

test('bytes: sizes in the units a person would say them in', () => {
  assert.equal(sizeText(0), '0 B');
  assert.equal(sizeText(1023), '1023 B');
  assert.equal(sizeText(1024), '1.0 KB');
  assert.equal(sizeText(10240), '10 KB');
  assert.equal(sizeText(1024 * 1024), '1.0 MB');
});

test('readPosition: degrees, minutes and seconds become a decimal', () => {
  const gps = [
    { tag: 0x0001, value: 'N' },
    { tag: 0x0002, value: [51, 30, 26] },
    { tag: 0x0003, value: 'W' },
    { tag: 0x0004, value: [0, 7, 39] },
  ];
  const position = readPosition(gps);
  assert.ok(Math.abs(position.lat - 51.507222) < 1e-5);
  assert.ok(Math.abs(position.lon - -0.1275) < 1e-5);
  assert.match(position.text, /51\.507222. N, 0\.127500. W/);
});

test('readPosition: the hemisphere tag decides the sign', () => {
  const at = (ref) => readPosition([
    { tag: 0x0001, value: ref }, { tag: 0x0002, value: [10, 0, 0] },
    { tag: 0x0003, value: 'E' }, { tag: 0x0004, value: [10, 0, 0] },
  ]).lat;
  assert.equal(at('N'), 10);
  assert.equal(at('S'), -10);
});

test('readPosition: altitude is read and said in words', () => {
  const gps = [
    { tag: 0x0001, value: 'N' }, { tag: 0x0002, value: [1, 0, 0] },
    { tag: 0x0003, value: 'E' }, { tag: 0x0004, value: [1, 0, 0] },
    { tag: 0x0005, value: 1 }, { tag: 0x0006, value: 12.4 },
  ];
  assert.equal(readPosition(gps).altitude, '12 m below sea level');
});

test('readPosition: an incomplete coordinate is no coordinate', () => {
  assert.equal(readPosition([]), null);
  assert.equal(readPosition(null), null);
  assert.equal(readPosition([{ tag: 0x0002, value: [51, 30, 26] }]), null,
    'a latitude with no longitude');
  assert.equal(readPosition([
    { tag: 0x0002, value: [51, 30] }, { tag: 0x0004, value: [0, 7, 39] },
  ]), null, 'fewer than three parts');
});

/** An item shaped the way readBytes returns one, for the report functions. */
function itemWith({ groups = {}, meta = {}, ...rest } = {}) {
  return {
    ok: true,
    kind: 'jpeg',
    exif: { ok: true, groups: { ifd0: [], exif: [], gps: [], interop: [], ifd1: [], ...groups } },
    meta: {
      exif: null, xmp: null, iptc: null, icc: null,
      comments: [], text: [], extras: [], notes: [], ...meta,
    },
    ...rest,
  };
}

// buildFindings takes a resolver. This one answers with the key, which is what
// phrase() does when the page has no such phrase - so a finding's title in
// these tests is the key that names it.
const key = (name) => name;

test('findings: a location is the headline finding', () => {
  const item = itemWith({
    meta: { exif: ascii('block') },
    groups: {
      gps: [
        { tag: 0x0001, value: 'N' }, { tag: 0x0002, value: [51, 30, 26] },
        { tag: 0x0003, value: 'W' }, { tag: 0x0004, value: [0, 7, 39] },
      ],
    },
  });
  const found = buildFindings(item, key);
  assert.equal(found[0].level, 'high');
  assert.equal(found[0].title, 'find.gps.title');
});

test('findings: EXIF that will not parse is a reason to remove it', () => {
  const item = itemWith({
    exifUnreadable: true,
    exifError: 'read.exifmagic',
    meta: { exif: ascii('block') },
  });
  const found = buildFindings(item, key);
  assert.ok(found.some((f) => f.level === 'high' && f.title === 'find.exifbad.title'));
});

test('findings: an EXIF block that parses to nothing is only worth a note', () => {
  const item = itemWith({ meta: { exif: ascii('block') } });
  const found = buildFindings(item, key);
  assert.equal(found.length, 1);
  assert.equal(found[0].level, 'low');
  assert.equal(found[0].title, 'find.exifempty.title');
});

test('findings: a clean file has none', () => {
  assert.deepEqual(buildFindings(itemWith(), key), []);
});

test('countTags: across every directory', () => {
  const item = itemWith({
    groups: {
      ifd0: [{ tag: 1 }, { tag: 2 }],
      exif: [{ tag: 3 }],
      gps: [{ tag: 4 }],
    },
  });
  assert.equal(countTags(item), 4);
  assert.equal(countTags({ exif: null }), 0);
  assert.equal(countTags({ exif: { ok: false } }), 0);
});

test('metadataSize: the blocks are added up', () => {
  const item = itemWith({
    meta: {
      exif: new Uint8Array(100),
      xmp: 'x'.repeat(50),
      icc: new Uint8Array(20),
      comments: ['abc'],
      text: [{ keyword: 'ab', value: 'cd' }],
      extras: [{ label: 'x', size: 7 }],
    },
  });
  assert.equal(metadataSize(item), 100 + 50 + 20 + 3 + 4 + 7);
});

test('badges: an unreadable file says only that', () => {
  assert.deepEqual(badges({ ok: false }), [{ label: 'Cannot read', level: 'high' }]);
});

test('badges: a clean file says so rather than saying nothing', () => {
  assert.deepEqual(badges(itemWith()), [{ label: 'Nothing found', level: 'clean' }]);
});

test('badges: GPS outranks everything else', () => {
  const item = itemWith({
    meta: { exif: ascii('x'), xmp: 'x', icc: new Uint8Array(1) },
    groups: { gps: [{ tag: 1 }], ifd0: [{ tag: 2 }] },
  });
  const labels = badges(item).map((b) => b.label);
  assert.equal(labels[0], 'GPS');
  assert.ok(labels.includes('EXIF 2'));
  assert.ok(labels.includes('XMP'));
  assert.ok(labels.includes('ICC'));
});

test('badges: an empty EXIF block is distinguished from an unreadable one', () => {
  assert.ok(badges(itemWith({ meta: { exif: ascii('x') } }))
    .some((b) => b.label === 'EXIF empty'));
  assert.ok(badges(itemWith({ exifUnreadable: true, meta: { exif: ascii('x') } }))
    .some((b) => b.label === 'EXIF unreadable'));
});

test('hasMetadata: a block that parsed to nothing is still bytes to remove', () => {
  assert.equal(hasMetadata(itemWith()), false);
  assert.equal(hasMetadata(itemWith({ meta: { exif: ascii('x') } })), true);
  assert.equal(hasMetadata(itemWith({ meta: { comments: ['hi'] } })), true);
  assert.equal(hasMetadata(itemWith({ groups: { ifd0: [{ tag: 1 }] } })), true);
  assert.equal(hasMetadata({ ok: false }), false);
});

test('tagGroups: empty directories are left out and tags are sorted', () => {
  const item = itemWith({
    groups: {
      ifd0: [{ tag: 0x0112 }, { tag: 0x010f }],
      exif: [{ tag: 0x829a }],
    },
  });
  const shown = tagGroups(item);
  assert.deepEqual(shown.map((g) => g.id), ['ifd0', 'exif']);
  assert.deepEqual(shown[0].entries.map((e) => e.tag), [0x010f, 0x0112]);
  assert.equal(tagGroups({ exif: null }).length, 0);
});

test('a real edit survives the whole door: read, edit, write, read again', async () => {
  const item = await readBytes(makeJpeg([exifSegment(TIFF_LE)]));
  item.exif.groups.ifd0.push(createEntry(0x010e, TYPE.ASCII, 'A description', true));

  const out = serialize(item, { exif: exifBytes(item.exif) });
  const back = await readBytes(out);

  assert.equal(back.exif.ok, true);
  assert.equal(countTags(back), 3);
  assert.equal(back.exif.groups.ifd0.find((e) => e.tag === 0x010e).value,
    'A description');
});

test('text chunks in a PNG reach the report', async () => {
  const item = await readBytes(makePng([textChunk('Author', 'Jane')]));
  assert.equal(hasMetadata(item), true);
  assert.ok(badges(item).some((b) => b.label === 'Text 1'));
});
