/**
 * tools/image-to-ico/src/icns.js - the ICNS writer.
 *
 * The macOS container, and the mirror image of the .ico beside it: big-endian
 * where that one is little, no directory at all, and a four-letter type in
 * place of a size. It fails the same way, which is to say silently - a Mac with
 * an icon it cannot parse shows the generic blank document and says nothing.
 *
 * Two fields carry the whole file and both are easy to write plausibly wrong:
 * the length in the header counts the header, and the length on every element
 * counts that element's own eight-byte header. Get the second one wrong and a
 * reader lands eight bytes short of the next type, reads four bytes of PNG as a
 * type name, and everything after the first element is rubbish. The walk in
 * `readIcnsElements` is what these tests use to prove it does not.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { writeIcns, readIcnsElements, ICNS_TYPES, ICNS_SIZES } from '../../tools/image-to-ico/src/icns.js';

const HEADER = 8;

const view = (bytes) => new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
const ascii = (bytes, at) => String.fromCharCode(...bytes.subarray(at, at + 4));
const filler = (length, value) => new Uint8Array(length).fill(value);

/* ------------------------------------------------------------- the header */

test('the header is the magic and the length of the whole file', () => {
  const file = writeIcns([{ type: 'ic07', data: filler(20, 0xaa) }]);

  assert.equal(ascii(file, 0), 'icns');
  assert.equal(view(file).getUint32(4, false), file.length,
    'the length counts the header it is written in');
  assert.equal(file.length, HEADER + HEADER + 20);
});

test('the file is big-endian, which is the opposite of the .ico beside it', () => {
  const file = writeIcns([{ type: 'ic07', data: filler(248, 1) }]);
  // 264 = 0x0108. Big-endian puts the 0x01 first; little-endian would not.
  assert.deepEqual(Array.from(file.subarray(4, 8)), [0, 0, 0x01, 0x08]);
});

/* ----------------------------------------------------------- the elements */

test('every element length includes its own eight-byte header', () => {
  const elements = [
    { type: 'icp4', data: filler(11, 1) },
    { type: 'ic11', data: filler(37, 2) },
    { type: 'ic10', data: filler(5, 3) },
  ];

  const file = writeIcns(elements);
  const v = view(file);

  let at = HEADER;
  for (const element of elements) {
    assert.equal(ascii(file, at), element.type);
    assert.equal(v.getUint32(at + 4, false), HEADER + element.data.length,
      `${element.type} counts its own header`);
    assert.deepEqual(
      file.slice(at + HEADER, at + HEADER + element.data.length), element.data,
      `${element.type} was copied through byte for byte`);
    at += HEADER + element.data.length;
  }

  assert.equal(at, file.length, 'the elements end exactly where the file does');
});

test('the elements are written in the order given, with no padding between them', () => {
  const file = writeIcns([
    { type: 'icp4', data: filler(3, 1) },
    { type: 'icp5', data: filler(3, 2) },
  ]);

  // 3 is odd: a format that aligned its elements would leave a gap here.
  assert.equal(file.length, HEADER + (HEADER + 3) * 2);
  assert.equal(ascii(file, HEADER + HEADER + 3), 'icp5');
});

test('an empty icon, and a type that is not four letters, are refused', () => {
  assert.throws(() => writeIcns([]), /at least one image/);
  assert.throws(() => writeIcns([{ type: 'ic7', data: filler(4, 0) }]), /four-letter/);
  assert.throws(() => writeIcns([{ type: 'icon7', data: filler(4, 0) }]), /four-letter/);
});

/* ----------------------------------------------------- reading it back out */

test('a written file walks back to the elements that went into it', () => {
  const elements = ICNS_TYPES.map((slot, index) => ({
    type: slot.type,
    data: filler(16 + index, index),
  }));

  assert.deepEqual(
    readIcnsElements(writeIcns(elements)),
    ICNS_TYPES.map((slot, index) => ({ type: slot.type, px: slot.px, bytes: 16 + index })));
});

test('the reader refuses a file that is not one, rather than inventing elements', () => {
  assert.throws(() => readIcnsElements(new Uint8Array(4)), /too short/);

  const notIcns = writeIcns([{ type: 'ic07', data: filler(8, 0) }]);
  notIcns[0] = 0x69 + 1;
  assert.throws(() => readIcnsElements(notIcns), /magic/);

  // A length that disagrees with the file is the failure this format is most
  // prone to, because every writer has to compute it rather than fill it in.
  const short = writeIcns([{ type: 'ic07', data: filler(8, 0) }]);
  assert.throws(() => readIcnsElements(short.slice(0, short.length - 1)), /claims/);

  const lying = writeIcns([{ type: 'ic07', data: filler(8, 0) }]);
  view(lying).setUint32(HEADER + 4, 0xffff, false);
  assert.throws(() => readIcnsElements(lying), /length the file cannot hold/);
});

/* -------------------------------------------------------- Apple's ten slots */

test('the slots are the ten Apple names, and no others', () => {
  assert.equal(ICNS_TYPES.length, 10);
  assert.deepEqual(
    ICNS_TYPES.map((slot) => slot.type),
    ['icp4', 'ic11', 'icp5', 'ic12', 'ic07', 'ic13', 'ic08', 'ic14', 'ic09', 'ic10']);
  assert.equal(new Set(ICNS_TYPES.map((slot) => slot.type)).size, 10, 'no type twice');
});

test('every slot names an iconset file, and the name agrees with the pixels', () => {
  for (const { type, px, role } of ICNS_TYPES) {
    const [, side, retina] = role.match(/^icon_(\d+)x\d+(@2x)?$/);
    assert.equal(px, Number(side) * (retina ? 2 : 1),
      `${type} is ${role}, which is ${Number(side) * (retina ? 2 : 1)} pixels, not ${px}`);
  }
});

test('the duplicate sizes are real, and are the point of the format', () => {
  // 32, 256 and 512 each fill two slots: one as themselves, one as the Retina
  // version of the size below. The same picture goes in both, and the tool
  // encodes it once - so a test that "deduplicated" these would be wrong.
  const counts = new Map();
  for (const { px } of ICNS_TYPES) counts.set(px, (counts.get(px) ?? 0) + 1);

  assert.deepEqual([...counts.entries()].filter(([, n]) => n > 1).map(([px]) => px), [32, 256, 512]);
  assert.deepEqual(ICNS_SIZES, [16, 32, 64, 128, 256, 512, 1024], 'seven renders for ten slots');
});

test('the sizes climb, so a reader meets the cheap ones first', () => {
  const sizes = ICNS_TYPES.map((slot) => slot.px);
  assert.deepEqual(sizes, [...sizes].sort((a, b) => a - b));
});
