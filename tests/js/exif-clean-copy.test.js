/** Requested exceptions must agree with independently reparsed output bytes. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareCleanCopy } from '../../tools/exif-editor/src/clean-copy.js';
import { readBytes, serialize } from '../../tools/exif-editor/src/container.js';
import { countTags, hasMetadata } from '../../tools/exif-editor/src/report.js';
import { createEntry, setEntryValue, serializeExif, TYPE } from '../../tools/exif-editor/src/tiff.js';
import { ascii, concat, jpeg, png, webp, segment, chunk, textChunk, webpChunk,
  EXIF_ID, JFIF_SEGMENT, VP8_CHUNK, vp8xChunk } from './helpers.js';

const profile = ascii('the original profile bytes');
function exif(orientation = 6) {
  return serializeExif({ littleEndian: true, groups: {
    ifd0: [createEntry(0x013b, TYPE.ASCII, 'Private artist', true),
      ...(orientation === null ? [] : [createEntry(0x0112, TYPE.SHORT, String(orientation), true)])],
    exif: [], gps: [], interop: [], ifd1: [],
  }, thumbnail: null });
}
function fixture(kind, block = exif(), withProfile = true) {
  if (kind === 'jpeg') return jpeg([JFIF_SEGMENT,
    segment(0xe1, concat(EXIF_ID, block)), segment(0xfe, ascii('private comment')),
    ...(withProfile ? [segment(0xe2, concat(ascii('ICC_PROFILE\0'), [1, 1], profile))] : [])]);
  if (kind === 'png') return png([chunk('eXIf', block), textChunk('Author', 'Private artist'),
    ...(withProfile ? [chunk('iCCP', concat(ascii('Profile'), [0, 0], profile))] : [])]);
  return webp([vp8xChunk(0x20 | 0x08), VP8_CHUNK, webpChunk('EXIF', block),
    webpChunk('XMP ', ascii('private history')),
    ...(withProfile ? [webpChunk('ICCP', profile)] : [])]);
}
function picture(item) {
  if (item.kind === 'jpeg') return item.doc.scan;
  const chunk = item.doc.chunks.find(c => c.type === 'IDAT' || c.fourcc === 'VP8 ');
  return chunk.data;
}
const file = (item) => Object.assign(item, { name: 'private-photo.jpg', size: item.bytes.length });

// Keeping orientation rebuilds one tag rather than leaving private/unparsed EXIF.
test('clean requests independently preserve the requested exceptions in all three containers', async () => {
  for (const kind of ['jpeg', 'png', 'webp']) {
    for (const keepOrientation of [false, true]) {
      for (const keepIcc of [false, true]) {
        const original = fixture(kind);
        const item = file(await readBytes(original));
        const request = prepareCleanCopy(item, { keepOrientation, keepIcc });
        const output = await readBytes(serialize(item, request.plan));
        assert.equal(output.ok, true);
        assert.equal(countTags(output), keepOrientation ? 1 : 0);
        assert.equal(output.exif?.groups.ifd0.find(e => e.tag === 0x0112)?.value,
          keepOrientation ? 6 : undefined);
        assert.deepEqual(output.meta.icc, keepIcc ? profile : null);
        assert.equal(output.meta.comments.length + output.meta.text.length, 0);
        assert.equal(output.meta.xmp, null);
        assert.deepEqual(picture(output), picture(item), 'compressed image data remains exact');
        assert.deepEqual(item.bytes, original, 'the original is never rewritten');
        if (kind === 'jpeg') assert.equal(output.meta.notes[0].label, 'segment.jfif.label');
      }
    }
  }
});

test('upright, missing and unreadable orientation leave no original EXIF behind', async () => {
  for (const block of [exif(1), exif(null), ascii('unreadable private EXIF')]) {
    const item = file(await readBytes(fixture('jpeg', block)));
    const request = prepareCleanCopy(item, { keepOrientation: true, keepIcc: false });
    const output = await readBytes(serialize(item, request.plan));
    assert.equal(request.requested.keepOrientation, true, 'a request is distinct from actual presence');
    assert.equal(output.meta.exif, null);
    assert.equal(countTags(output), 0);
    assert.equal(hasMetadata(output), false);
    assert.deepEqual(output.doc.scan, item.doc.scan);
  }
});

test('requesting an absent ICC profile does not label it as actually present', async () => {
  const item = file(await readBytes(fixture('png', exif(1), false)));
  const request = prepareCleanCopy(item, { keepOrientation: true, keepIcc: true });
  const output = await readBytes(serialize(item, request.plan));
  assert.equal(request.requested.keepIcc, true);
  assert.equal(output.meta.icc, null);
  assert.equal(output.meta.exif, null);
  assert.equal(hasMetadata(output), false);
});

test('captured policy, name and serialized orientation survive later editor changes', async () => {
  const item = file(await readBytes(fixture('jpeg')));
  const options = { keepOrientation: true, keepIcc: true };
  const request = prepareCleanCopy(item, options);
  options.keepOrientation = false;
  options.keepIcc = false;
  item.name = 'later-name.jpg';
  setEntryValue(item.exif.groups.ifd0.find(e => e.tag === 0x0112), '8', true);
  item.exif.groups.ifd0.push(createEntry(0x0131, TYPE.ASCII, 'Later editor', true));
  const output = await readBytes(serialize(item, request.plan));
  assert.equal(request.source.name, 'private-photo.jpg');
  assert.ok(Object.isFrozen(request.source));
  assert.ok(Object.isFrozen(request.requested));
  assert.equal(request.requested.keepOrientation, true);
  assert.equal(request.requested.keepIcc, true);
  assert.equal(countTags(output), 1);
  assert.equal(output.exif.groups.ifd0[0].value, 6);
  assert.deepEqual(output.meta.icc, profile);
});

test('AVIF captures its distinct conversion policy without inventing a container strip plan', async () => {
  const item = { ok: true, kind: 'avif', name: 'source.avif', size: 20,
    exif: null, meta: { exif: null, xmp: null, iptc: null, icc: null,
      comments: [], text: [], extras: [] } };
  const request = prepareCleanCopy(item, { keepOrientation: true, keepIcc: true });
  assert.equal(request.requested.applies, false);
  assert.equal(request.plan, null);
  assert.equal(request.source.kind, 'avif');
  const plain = file(await readBytes(jpeg([JFIF_SEGMENT])));
  assert.equal(prepareCleanCopy(plain, { keepOrientation: true, keepIcc: true }).metadata, false,
    'display headers alone keep the existing unchanged-file path');
});
