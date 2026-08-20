/**
 * tools/*\/src/zip.js - the stored-only ZIP writer.
 *
 * Nothing here compresses, so the interesting part is the bookkeeping: the
 * three signatures, the CRC of each entry, the offset in each central
 * directory record pointing at that entry's local header, and the flag that
 * says the names are UTF-8. Get the offsets wrong and the archive opens in one
 * reader and not another, which is the kind of failure nobody notices until
 * somebody else cannot open the file.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { makeZip as compressZip } from '../../tools/compress-image/src/zip.js';
import { makeZip as exifZip } from '../../tools/exif-editor/src/zip.js';
import { crc32 } from '../../tools/exif-editor/src/crc32.js';
import { ascii, blobBytes } from './helpers.js';

const LOCAL_SIG = 0x04034b50;
const CENTRAL_SIG = 0x02014b50;
const END_SIG = 0x06054b50;

const files = [
  { name: 'one.jpg', data: ascii('the first file') },
  { name: 'two.png', data: ascii('and the second') },
];

/** Read the end-of-central-directory record, which is the last 22 bytes. */
function endRecord(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const at = bytes.length - 22;
  return {
    signature: view.getUint32(at, true),
    entries: view.getUint16(at + 8, true),
    total: view.getUint16(at + 10, true),
    centralSize: view.getUint32(at + 12, true),
    centralAt: view.getUint32(at + 16, true),
  };
}

const copies = [['compress-image', compressZip], ['exif-editor', exifZip]];

for (const [tool, makeZip] of copies) {
  const built = async (input = files) => blobBytes(makeZip(input));

  test(`${tool}: the blob is typed as a zip`, () => {
    assert.equal(makeZip(files).type, 'application/zip');
  });

  test(`${tool}: it starts with a local file header`, async () => {
    const bytes = await built();
    const view = new DataView(bytes.buffer);
    assert.equal(view.getUint32(0, true), LOCAL_SIG);
  });

  test(`${tool}: the end record counts the files`, async () => {
    const end = endRecord(await built());
    assert.equal(end.signature, END_SIG);
    assert.equal(end.entries, files.length);
    assert.equal(end.total, files.length);
  });

  test(`${tool}: the central directory is where the end record says`, async () => {
    const bytes = await built();
    const end = endRecord(bytes);
    const view = new DataView(bytes.buffer);
    assert.equal(view.getUint32(end.centralAt, true), CENTRAL_SIG);
    assert.equal(end.centralAt + end.centralSize + 22, bytes.length);
  });

  test(`${tool}: each central record points at its own local header`, async () => {
    // This is the field that decides whether the archive opens at all.
    const bytes = await built();
    const end = endRecord(bytes);
    const view = new DataView(bytes.buffer);

    let at = end.centralAt;
    for (const file of files) {
      assert.equal(view.getUint32(at, true), CENTRAL_SIG);
      const nameLength = view.getUint16(at + 28, true);
      const localAt = view.getUint32(at + 42, true);
      assert.equal(view.getUint32(localAt, true), LOCAL_SIG, `${file.name}: local header`);
      assert.equal(
        new TextDecoder().decode(bytes.subarray(localAt + 30, localAt + 30 + nameLength)),
        file.name,
      );
      at += 46 + nameLength;
    }
    assert.equal(at, end.centralAt + end.centralSize);
  });

  test(`${tool}: the file data follows its header, uncompressed`, async () => {
    const bytes = await built();
    const view = new DataView(bytes.buffer);
    const nameLength = view.getUint16(26, true);
    const start = 30 + nameLength;
    assert.equal(view.getUint16(8, true), 0, 'method 0: stored');
    assert.deepEqual(bytes.subarray(start, start + files[0].data.length), files[0].data);
  });

  test(`${tool}: the sizes are the real ones and are equal`, async () => {
    const bytes = await built();
    const view = new DataView(bytes.buffer);
    assert.equal(view.getUint32(18, true), files[0].data.length, 'compressed size');
    assert.equal(view.getUint32(22, true), files[0].data.length, 'uncompressed size');
  });

  test(`${tool}: each entry carries the CRC of its own data`, async () => {
    const bytes = await built();
    const view = new DataView(bytes.buffer);
    assert.equal(view.getUint32(14, true), crc32([files[0].data]));
  });

  test(`${tool}: names are flagged as UTF-8`, async () => {
    // Bit 11, or a name outside code page 437 comes out as mojibake.
    const bytes = await built();
    const view = new DataView(bytes.buffer);
    assert.equal(view.getUint16(6, true) & 0x0800, 0x0800);
  });

  test(`${tool}: a non-ASCII name survives`, async () => {
    const name = 'café — photo.jpg';
    const bytes = await built([{ name, data: ascii('x') }]);
    const view = new DataView(bytes.buffer);
    const nameLength = view.getUint16(26, true);
    assert.equal(new TextDecoder().decode(bytes.subarray(30, 30 + nameLength)), name);
    assert.ok(nameLength > name.length, 'a multi-byte name is longer in bytes');
  });

  test(`${tool}: an empty archive is just an end record`, async () => {
    const bytes = await built([]);
    assert.equal(bytes.length, 22);
    const end = endRecord(bytes);
    assert.equal(end.entries, 0);
    assert.equal(end.centralSize, 0);
    assert.equal(end.centralAt, 0);
  });

  test(`${tool}: an empty file is allowed`, async () => {
    const bytes = await built([{ name: 'empty.txt', data: new Uint8Array(0) }]);
    const view = new DataView(bytes.buffer);
    assert.equal(view.getUint32(18, true), 0);
    assert.equal(view.getUint32(14, true), 0, 'CRC of nothing is zero');
  });

  test(`${tool}: total length is the sum of its parts`, async () => {
    const bytes = await built();
    const names = files.reduce((n, f) => n + f.name.length, 0);
    const data = files.reduce((n, f) => n + f.data.length, 0);
    // Two local headers (30 + name), the data, two central records
    // (46 + name), and one 22-byte end record.
    assert.equal(bytes.length, 30 * 2 + names + data + 46 * 2 + names + 22);
  });
}
