/**
 * shared/js/crc32.js - the CRC-32 from the PNG and ZIP specifications.
 *
 * Checked against values from outside this repository. There used to be nine
 * identical copies of this file and a test at the foot asserting that two of
 * them agreed. Seven of the nine are this module now, so that much of the
 * agreement is a fact about the repository rather than something to assert;
 * exif-editor and merge-pdf keep their own, for the reason in shared/js/zip.js,
 * and tests/js/exif-containers.test.js still exercises exif-editor's.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { crc32 } from '../../shared/js/crc32.js';
import { ascii } from './helpers.js';

test('the check value from the specification', () => {
  // "123456789" is the standard CRC-32 check vector.
  assert.equal(crc32([ascii('123456789')]), 0xcbf43926);
});

test('an empty input', () => {
  assert.equal(crc32([]), 0);
  assert.equal(crc32([new Uint8Array(0)]), 0);
});

test('known short inputs', () => {
  assert.equal(crc32([ascii('a')]), 0xe8b7be43);
  assert.equal(crc32([ascii('abc')]), 0x352441c2);
  assert.equal(crc32([new Uint8Array([0])]), 0xd202ef8d);
});

test('parts are checksummed as one run of bytes', () => {
  // The signature takes a list because a PNG chunk's CRC covers its type and
  // its data, which are two arrays and one checksum.
  assert.equal(crc32([ascii('abc'), ascii('def')]), crc32([ascii('abcdef')]));
  assert.equal(crc32([ascii('a'), ascii('b'), ascii('c')]), crc32([ascii('abc')]));
});

test('the result is unsigned', () => {
  // 0xffffffff read as a signed 32-bit integer would be -1, and a PNG with a
  // negative CRC written into it is a corrupt PNG.
  for (const input of ['', 'a', '123456789', '\0\0\0\0', 'the quick brown fox']) {
    const value = crc32([ascii(input)]);
    assert.ok(value >= 0 && value <= 0xffffffff, `${input}: ${value}`);
    assert.ok(Number.isInteger(value));
  }
});

test('the table survives being built once', () => {
  // The table is built lazily on first use; a second call must not rebuild
  // it into something different.
  assert.equal(crc32([ascii('123456789')]), crc32([ascii('123456789')]));
});

test('a long input', () => {
  const long = new Uint8Array(10000);
  for (let i = 0; i < long.length; i += 1) long[i] = i & 0xff;
  assert.equal(crc32([long]), crc32([long.subarray(0, 5000), long.subarray(5000)]));
});
