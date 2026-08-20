/**
 * tools/*\/src/crc32.js - the CRC-32 from the PNG and ZIP specifications.
 *
 * Both tools carry a copy, so both copies are checked, and checked against
 * values from outside this repository rather than against each other.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { crc32 as compressCrc } from '../../tools/compress-image/src/crc32.js';
import { crc32 as exifCrc } from '../../tools/exif-editor/src/crc32.js';
import { ascii } from './helpers.js';

const copies = [['compress-image', compressCrc], ['exif-editor', exifCrc]];

for (const [tool, crc32] of copies) {
  test(`${tool}: the check value from the specification`, () => {
    // "123456789" is the standard CRC-32 check vector.
    assert.equal(crc32([ascii('123456789')]), 0xcbf43926);
  });

  test(`${tool}: an empty input`, () => {
    assert.equal(crc32([]), 0);
    assert.equal(crc32([new Uint8Array(0)]), 0);
  });

  test(`${tool}: known short inputs`, () => {
    assert.equal(crc32([ascii('a')]), 0xe8b7be43);
    assert.equal(crc32([ascii('abc')]), 0x352441c2);
    assert.equal(crc32([new Uint8Array([0])]), 0xd202ef8d);
  });

  test(`${tool}: parts are checksummed as one run of bytes`, () => {
    // The signature takes a list because a PNG chunk's CRC covers its type and
    // its data, which are two arrays and one checksum.
    assert.equal(crc32([ascii('abc'), ascii('def')]), crc32([ascii('abcdef')]));
    assert.equal(crc32([ascii('a'), ascii('b'), ascii('c')]), crc32([ascii('abc')]));
  });

  test(`${tool}: the result is unsigned`, () => {
    // 0xffffffff read as a signed 32-bit integer would be -1, and a PNG with a
    // negative CRC written into it is a corrupt PNG.
    for (const input of ['', 'a', '123456789', '\0\0\0\0', 'the quick brown fox']) {
      const value = crc32([ascii(input)]);
      assert.ok(value >= 0 && value <= 0xffffffff, `${input}: ${value}`);
      assert.ok(Number.isInteger(value));
    }
  });

  test(`${tool}: the table survives being built once`, () => {
    // The table is built lazily on first use; a second call must not rebuild
    // it into something different.
    assert.equal(crc32([ascii('123456789')]), crc32([ascii('123456789')]));
  });

  test(`${tool}: a long input`, () => {
    const long = new Uint8Array(10000);
    for (let i = 0; i < long.length; i += 1) long[i] = i & 0xff;
    assert.equal(crc32([long]), crc32([long.subarray(0, 5000), long.subarray(5000)]));
  });
}

test('the two copies agree', () => {
  const sample = new Uint8Array(512);
  for (let i = 0; i < sample.length; i += 1) sample[i] = (i * 7) & 0xff;
  assert.equal(compressCrc([sample]), exifCrc([sample]));
});
