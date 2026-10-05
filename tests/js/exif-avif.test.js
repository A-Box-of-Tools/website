/** AVIF uses EXIF preview and native PNG cleaning, never the container writer. */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readBytes, serialize, sniff, outputType } from '../../tools/exif-editor/src/container.js';
import { cleanAvif } from '../../tools/exif-editor/src/avif.js';
import { readExif } from '../../shared/js/heif-metadata.js';
import { ascii, concat, u16be, u32be, TIFF_LE, TIFF_BE, png } from './helpers.js';

const box = (type, ...payload) => {
  const body = concat(...payload);
  return concat(u32be(body.length + 8), ascii(type), body);
};
const full = (type, version, ...payload) => box(type, [version, 0, 0, 0], ...payload);
const brands = (major, ...compatible) => box('ftyp', ascii(major), u32be(0), ...compatible.map(ascii));

function withMetadataLocations(locations, payload, ...after) {
  return concat(brands('avif', 'mif1'), full('meta', 0,
    full('iinf', 0, u16be(1), full('infe', 2, u16be(2), u16be(0), ascii('Exif'), [0])),
    locations, box('idat', payload)), ...after);
}

function avifWithExif(exif = TIFF_LE) {
  const data = concat(u32be(0), exif);
  return concat(brands('mif1', 'avif'), full('meta', 0,
    full('pitm', 0, u16be(1)),
    full('iinf', 0, u16be(1), full('infe', 2, u16be(2), u16be(0), ascii('Exif'), [0])),
    full('iloc', 1, [0x44, 0], u16be(1), u16be(2), u16be(1), u16be(0), u16be(1), u32be(0), u32be(data.length)),
    full('iref', 0, box('cdsc', u16be(2), u16be(1), u16be(1))),
    box('idat', data)));
}

function avifWithImageMetadata(metadata, links = []) {
  const items = [{ id: 1, type: 'av01', data: ascii('primary pixels') },
    { id: 2, type: 'av01', data: ascii('secondary pixels') },
    ...metadata.map(({ id, exif }) => ({ id, type: 'Exif', data: concat(u32be(0), exif) }))];
  let offset = 0;
  const locations = items.map(item => {
    const extent = concat(u16be(item.id), u16be(1), u16be(0), u16be(1), u32be(offset), u32be(item.data.length));
    offset += item.data.length;
    return extent;
  });
  return concat(brands('avif', 'mif1'), full('meta', 0,
    full('pitm', 0, u16be(1)),
    full('iinf', 0, u16be(items.length), ...items.map(item =>
      full('infe', 2, u16be(item.id), u16be(0), ascii(item.type), [0]))),
    full('iloc', 1, [0x44, 0], u16be(items.length), ...locations),
    ...links.map(([from, to]) => full('iref', 0, box('cdsc', u16be(from), u16be(1), u16be(to)))),
    box('idat', concat(...items.map(item => item.data)))));
}

test('AVIF compatible brands take priority over a generic HEIF major brand', () => {
  assert.equal(sniff(brands('mif1', 'avif', 'miaf')), 'avif');
  assert.equal(sniff(brands('avis', 'mif1')), 'avif');
  assert.equal(sniff(brands('mif1', 'heic')), 'heic');
});

test('AVIF EXIF is extracted for viewing while writing remains a separate PNG conversion', async () => {
  const original = avifWithExif();
  const copy = original.slice();
  const item = await readBytes(original);
  assert.equal(item.ok, true);
  assert.equal(item.kind, 'avif');
  assert.equal(item.exif.ok, true);
  assert.deepEqual(item.meta.exif, TIFF_LE);
  assert.equal(item.exif.groups.ifd0.length, 2);
  assert.equal(item.meta.xmp, null);
  assert.throws(() => serialize(item, { exif: null }), /refuse.unwritable/);
  assert.deepEqual(outputType(item.kind), { mime: 'image/png', ext: 'png' });
  assert.deepEqual(original, copy);
});

test('AVIF without extracted EXIF can still be converted without claiming a metadata inventory', async () => {
  const item = await readBytes(brands('avif', 'mif1'));
  assert.equal(item.ok, true);
  assert.equal(item.exif, null);
  assert.deepEqual(item.meta.extras, []);
});

test('AVIF preview never labels a secondary image EXIF block as the primary image metadata', async () => {
  const onlySecondary = avifWithImageMetadata([{ id: 3, exif: TIFF_LE }], [[3, 2]]);
  assert.deepEqual(readExif(onlySecondary), TIFF_LE, 'legacy converter fallback remains available');
  assert.equal(readExif(onlySecondary, { primaryOnly: true }), null);
  assert.equal((await readBytes(onlySecondary)).meta.exif, null);

  const unreadablePrimary = avifWithImageMetadata([
    { id: 3, exif: ascii('not TIFF') }, { id: 4, exif: TIFF_LE },
  ], [[3, 1], [4, 2]]);
  assert.equal(readExif(unreadablePrimary, { primaryOnly: true }), null);
  assert.equal((await readBytes(unreadablePrimary)).exif, null);
});

test('strict AVIF preview uses the primary cdsc association and refuses unbound metadata', () => {
  const linked = avifWithImageMetadata([{ id: 3, exif: TIFF_BE }, { id: 4, exif: TIFF_LE }], [[3, 2], [4, 1]]);
  assert.deepEqual(readExif(linked, { primaryOnly: true }), TIFF_LE);
  const unbound = avifWithImageMetadata([{ id: 3, exif: TIFF_BE }, { id: 4, exif: TIFF_LE }]);
  assert.equal(readExif(unbound, { primaryOnly: true }), null);
  const singleUnbound = avifWithImageMetadata([{ id: 3, exif: TIFF_LE }]);
  assert.equal(readExif(singleUnbound, { primaryOnly: true }), null);
  assert.deepEqual(readExif(singleUnbound), TIFF_LE);
  assert.deepEqual(readExif(avifWithExif(), { primaryOnly: true }), TIFF_LE);
});

test('repeated cdsc boxes accumulate the images a shared EXIF item describes', () => {
  const linked = avifWithImageMetadata([{ id: 3, exif: TIFF_LE }], [[3, 1], [3, 2]]);
  assert.deepEqual(readExif(linked, { primaryOnly: true }), TIFF_LE);
});

test('shared HEIF metadata joins split EXIF extents without including gaps', () => {
  const data = concat(u32be(0), TIFF_LE);
  const cut = 10;
  const gap = ascii('not metadata');
  const locations = full('iloc', 1, [0x44, 0], u16be(1),
    u16be(2), u16be(1), u16be(0), u16be(2),
    u32be(0), u32be(cut), u32be(cut + gap.length), u32be(data.length - cut));
  const file = withMetadataLocations(locations, concat(data.subarray(0, cut), gap, data.subarray(cut)));
  assert.deepEqual(readExif(file), TIFF_LE);
});

test('shared HEIF metadata honours a declared TIFF offset beyond the short fallback scan', () => {
  const data = concat(u32be(64), new Uint8Array(64), TIFF_LE);
  const locations = full('iloc', 1, [0x44, 0], u16be(1),
    u16be(2), u16be(1), u16be(0), u16be(1), u32be(0), u32be(data.length));
  assert.deepEqual(readExif(withMetadataLocations(locations, data)), TIFF_LE);
});

test('shared HEIF metadata rejects counts outside the box, external references, and unsupported construction', () => {
  const data = concat(u32be(0), TIFF_LE);
  const malformed = [
    full('iloc', 2, [0x44, 0], u32be(0xffffffff)),
    full('iloc', 1, [0x44, 0], u16be(1), u16be(2), u16be(1), u16be(0), u16be(0xffff)),
    full('iloc', 1, [0x44, 0], u16be(1), u16be(2), u16be(1), u16be(1), u16be(1), u32be(0), u32be(data.length)),
    full('iloc', 1, [0x44, 0], u16be(1), u16be(2), u16be(2), u16be(0), u16be(1), u32be(0), u32be(data.length)),
  ];
  for (const locations of malformed) assert.equal(readExif(withMetadataLocations(locations, data)), null);
});

test('idat metadata ranges cannot reach another box even when they remain inside the file', () => {
  const locations = full('iloc', 1, [0x44, 0], u16be(1),
    u16be(2), u16be(1), u16be(0), u16be(1), u32be(16), u32be(TIFF_LE.length));
  const file = withMetadataLocations(locations, new Uint8Array(0), box('free', TIFF_LE));
  assert.equal(readExif(file), null);
});

async function withNativeEncoder(options, run) {
  const descriptors = new Map(['document', 'createImageBitmap'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const canvases = [];
  const calls = [];
  const encodes = [];
  let closed = false;
  let input;
  let decodeOptions;
  const bitmap = { width: options.width ?? 400, height: options.height ?? 300, close() { closed = true; } };
  const encoded = Object.hasOwn(options, 'encoded') ? options.encoded : new Blob([png([])], { type: 'image/png' });
  Object.defineProperty(globalThis, 'createImageBitmap', { configurable: true, writable: true,
    value: async (blob, opts) => {
      input = blob; decodeOptions = opts;
      if (options.decodeError) throw new Error('platform detail');
      return bitmap;
    } });
  Object.defineProperty(globalThis, 'document', { configurable: true, writable: true, value: {
    createElement(tag) {
      assert.equal(tag, 'canvas');
      const context = { drawImage(...args) { calls.push(args); } };
      const canvas = { width: 0, height: 0,
        getContext: () => options.noContext ? null : context,
        toBlob(callback, mime) {
          assert.equal(mime, 'image/png');
          encodes.push({ width: this.width, height: this.height });
          callback(encoded);
        } };
      canvases.push(canvas);
      return canvas;
    },
  } });
  try { await run({ canvases, calls, encodes, bitmap, input: () => input, decodeOptions: () => decodeOptions, closed: () => closed }); }
  finally {
    for (const [key, descriptor] of descriptors) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
}

test('native AVIF cleaning preserves decoded dimensions and alpha, strips source metadata, and frees pixels', async () => {
  await withNativeEncoder({}, async ({ canvases, calls, encodes, bitmap, input, decodeOptions, closed }) => {
    const source = avifWithExif();
    const original = source.slice();
    const cleaned = await cleanAvif(source);
    assert.equal(input().type, 'image/avif');
    assert.deepEqual(new Uint8Array(await input().arrayBuffer()), original);
    assert.deepEqual(decodeOptions(), { imageOrientation: 'from-image' });
    assert.deepEqual(calls, [[bitmap, 0, 0]]);
    assert.deepEqual(encodes, [{ width: 400, height: 300 }]);
    assert.equal((await readBytes(cleaned)).kind, 'png');
    assert.equal((await readBytes(cleaned)).meta.exif, null);
    assert.deepEqual(source, original);
    assert.ok(canvases.every(canvas => canvas.width === 0 && canvas.height === 0));
    assert.equal(closed(), true);
  });
});

test('AVIF decoder and PNG encoder failures return readable keys and release allocated resources', async () => {
  for (const options of [
    { decodeError: true, error: 'read.avifdecode' },
    { encoded: null, error: 'write.avifpng' },
    { encoded: new Blob(['wrong'], { type: 'image/jpeg' }), error: 'write.avifpng' },
    { noContext: true, error: 'write.avifpng' },
  ]) {
    await withNativeEncoder(options, async ({ canvases, closed }) => {
      await assert.rejects(cleanAvif(avifWithExif()), new RegExp(options.error));
      assert.equal(closed(), !options.decodeError);
      assert.ok(canvases.every(canvas => canvas.width === 0 && canvas.height === 0));
    });
  }
});

test('the AVIF decoded-pixel limit is checked before output allocation', async () => {
  await withNativeEncoder({ width: 10_000, height: 10_000 }, async ({ canvases, closed }) => {
    await assert.rejects(cleanAvif(avifWithExif()), /write.aviflarge/);
    assert.equal(canvases.length, 0);
    assert.equal(closed(), true);
  });
});
