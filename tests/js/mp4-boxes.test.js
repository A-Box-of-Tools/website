/**
 * shared/js/mp4-boxes.js - the bytes an MP4 is built out of.
 *
 * The writers that use these are tested end to end elsewhere (a file they
 * wrote is read back by the reader), so what is pinned here is the byte-level
 * contract each of them assumes: big-endian, a length that counts its own
 * eight bytes, and a full box's four-byte header in front of the payload.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ascii, bytes, u16, u32, i32, zeros, concat, box, fullBox, fourcc,
} from '../../shared/js/mp4-boxes.js';

test('integers are big-endian, and a negative one is two\'s complement', () => {
  assert.deepEqual([...u16(0x1234)], [0x12, 0x34]);
  assert.deepEqual([...u32(0x01020304)], [1, 2, 3, 4]);
  assert.deepEqual([...u32(0xffffffff)], [255, 255, 255, 255]);
  assert.deepEqual([...i32(-1)], [255, 255, 255, 255]);
  assert.deepEqual([...i32(-2)], [255, 255, 255, 254]);
});

test('ascii, bytes and zeros are what they say', () => {
  assert.deepEqual([...ascii('moov')], [0x6d, 0x6f, 0x6f, 0x76]);
  assert.deepEqual([...bytes(1, 2, 250)], [1, 2, 250]);
  assert.deepEqual([...zeros(3)], [0, 0, 0]);
});

test('concat joins runs in order and copes with an empty list', () => {
  assert.deepEqual([...concat([bytes(1), bytes(), bytes(2, 3)])], [1, 2, 3]);
  assert.equal(concat([]).byteLength, 0);
});

test('a box is its total length, its type, then the payload', () => {
  const made = box('free', bytes(9, 9));
  assert.deepEqual([...made], [0, 0, 0, 10, 0x66, 0x72, 0x65, 0x65, 9, 9]);
  assert.equal(box('free').byteLength, 8, 'an empty box is eight bytes');
});

test('a full box carries version and 24-bit flags before the payload', () => {
  const made = fullBox('tkhd', 1, 0x000007, bytes(0xaa));
  assert.deepEqual([...made.subarray(0, 8)], [0, 0, 0, 13, 0x74, 0x6b, 0x68, 0x64]);
  assert.deepEqual([...made.subarray(8)], [1, 0, 0, 7, 0xaa]);
});

test('fourcc reads a type back out of a view', () => {
  const view = new DataView(box('mdat', bytes(1)).buffer);
  assert.equal(fourcc(view, 4), 'mdat');
});
