/** An opaque regeneration must not silently remove the background demonstration. */

import test from 'node:test';
import assert from 'node:assert/strict';
import { makeExample } from '../../tools/avif-to-jpg/src/example.js';
import { MARK } from '../../tools/avif-to-jpg/src/example-data.js';
import { AVIF, sniff } from '../../shared/js/image-convert.js';

const ascii = (bytes) => new TextDecoder().decode(bytes);

/** Only the small boxes in this committed fixture are needed, not an AVIF decoder. */
function boxes(bytes, start = 0, end = bytes.length) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const entries = [];
  let at = start;
  while (at < end) {
    assert.ok(at + 8 <= end);
    const size = view.getUint32(at);
    assert.ok(size >= 8 && at + size <= end);
    entries.push({ type: ascii(bytes.subarray(at + 4, at + 8)), start: at + 8, end: at + size });
    at += size;
  }
  assert.equal(at, end);
  return entries;
}

const ofType = (entries, type) => {
  const entry = entries.find(one => one.type === type);
  assert.ok(entry, type);
  return entry;
};

test('all three example Files remain actual AVIFs with distinct download names', async () => {
  const files = await makeExample();
  assert.deepEqual(files.map(file => file.name), [
    'example-landscape.avif', 'example-square.avif', 'example-logo.avif',
  ]);
  for (const file of files) {
    assert.equal(file.type, AVIF);
    assert.equal(sniff(new Uint8Array(await file.slice(0, 64).arrayBuffer())), AVIF);
    assert.ok(file.size > 0);
  }
});

test('the logo has a 256-pixel alpha auxiliary item associated with the primary picture', () => {
  const bytes = Uint8Array.from(atob(MARK), character => character.charCodeAt(0));
  const view = new DataView(bytes.buffer);
  const meta = ofType(boxes(bytes), 'meta');
  assert.equal(view.getUint32(meta.start), 0);
  const entries = boxes(bytes, meta.start + 4, meta.end);
  const primary = view.getUint16(ofType(entries, 'pitm').start + 4);
  const properties = ofType(entries, 'iprp');
  const propertyEntries = boxes(bytes, properties.start, properties.end);
  const container = ofType(propertyEntries, 'ipco');
  const definitions = boxes(bytes, container.start, container.end);
  const alphaProperty = ofType(definitions, 'auxC');
  assert.equal(ascii(bytes.subarray(alphaProperty.start + 4, alphaProperty.end)).replace(/\0.*$/, ''),
    'urn:mpeg:mpegB:cicp:systems:auxiliary:alpha');
  const alphaIndex = definitions.indexOf(alphaProperty) + 1;
  const associations = ofType(propertyEntries, 'ipma');
  assert.equal(view.getUint32(associations.start), 0);
  const linked = new Map();
  let at = associations.start + 8;
  for (let count = view.getUint32(associations.start + 4); count > 0; count -= 1) {
    const id = view.getUint16(at);
    const length = bytes[at + 2];
    at += 3;
    linked.set(id, Array.from(bytes.subarray(at, at + length), value => value & 0x7f));
    at += length;
  }
  assert.equal(at, associations.end);
  const alphaId = [...linked].find(([, indices]) => indices.includes(alphaIndex))?.[0];
  assert.ok(alphaId && alphaId !== primary);
  const references = ofType(entries, 'iref');
  assert.equal(view.getUint32(references.start), 0);
  const auxiliary = ofType(boxes(bytes, references.start + 4, references.end), 'auxl');
  assert.equal(view.getUint16(auxiliary.start), alphaId);
  assert.equal(view.getUint16(auxiliary.start + 2), 1);
  assert.equal(view.getUint16(auxiliary.start + 4), primary);
  for (const id of [primary, alphaId]) {
    const dimensions = linked.get(id).map(index => definitions[index - 1]).find(one => one.type === 'ispe');
    assert.ok(dimensions);
    assert.deepEqual([view.getUint32(dimensions.start + 4), view.getUint32(dimensions.start + 8)], [256, 256]);
  }
});
