/**
 * A peer controls its file list and transfer markers. The reader must keep
 * the selected size as its budget and refuse a premature or mismatched end,
 * rather than silently downloading a partial file or accumulating more bytes.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  appendFileChunk, beginFile, cleanFileList, finishFile,
} from '../../tools/share-text/src/receive-file.js';

const MAX = 16;
const file = (overrides = {}) => ({ id: 'chosen', name: 'report.bin', size: 4, ...overrides });
const receive = (overrides = {}) => ({ ...file(), mime: '', parts: [], got: 0, btn: {}, ...overrides });
const begin = (overrides = {}) => ({ id: 'chosen', size: 4, mime: 'application/octet-stream', ...overrides });
const chunk = (length) => new ArrayBuffer(length);

test('the file list retains only bounded metadata and unique ids', () => {
  const valid = file();
  const entries = [
    null, [], 'file', {},
    file({ id: '' }), file({ id: 'x'.repeat(129) }), file({ id: 4 }),
    file({ name: null }), file({ name: 'x'.repeat(256) }),
    file({ size: -1 }), file({ size: 1.5 }), file({ size: '4' }),
    file({ size: Infinity }), file({ size: NaN }), file({ size: MAX + 1 }),
    { ...valid, mime: 'unnecessary metadata' },
    file({ name: 'replacement.bin', size: 8 }),
    file({ id: 'empty', name: '', size: 0 }),
    file({ id: 'largest', name: 'x'.repeat(255), size: MAX }),
  ];
  assert.deepEqual(cleanFileList(entries, MAX), [
    valid, file({ id: 'empty', name: '', size: 0 }),
    file({ id: 'largest', name: 'x'.repeat(255), size: MAX }),
  ]);
});

test('only the first 256 advertised entries are inspected', () => {
  const entries = Array.from({ length: 256 }, (_, i) => file({ id: String(i) }));
  Object.defineProperty(entries, 256, { get() { throw new Error('read past the cap'); } });
  assert.equal(cleanFileList(entries, MAX).length, 256);
  assert.deepEqual(cleanFileList([...Array(256).fill(null), file()], MAX), []);
});

test('a malformed list or size cap offers no files', () => {
  for (const value of [undefined, null, {}, 'files', 4]) assert.deepEqual(cleanFileList(value, MAX), []);
  for (const value of [undefined, -1, '16', 1.5, Infinity]) assert.deepEqual(cleanFileList([file()], value), []);
});

test('a begin marker must match the requested id and exact size', () => {
  const rx = receive();
  const before = structuredClone(rx);
  for (const msg of [
    undefined, null, [], {}, begin({ id: 'other' }), begin({ size: 0 }),
    begin({ size: 5 }), begin({ size: '4' }), begin({ size: -1 }),
    begin({ mime: undefined }), begin({ mime: null }), begin({ mime: 'x'.repeat(256) }),
  ]) {
    assert.equal(beginFile(rx, msg, MAX), false);
    assert.deepEqual(rx, before);
  }
  assert.equal(beginFile(rx, begin(), MAX), true);
  assert.equal(rx.begun, true);
  assert.equal(rx.mime, 'application/octet-stream');
  assert.equal(rx.size, 4);
  assert.equal(beginFile(rx, begin({ mime: 'text/plain' }), MAX), false);
  assert.equal(rx.mime, 'application/octet-stream');
});

test('a zero-byte file completes after a matching begin and end', () => {
  const rx = receive({ size: 0 });
  assert.equal(finishFile(rx, { id: rx.id }), false);
  assert.equal(beginFile(rx, begin({ size: 0, mime: '' }), MAX), true);
  assert.equal(appendFileChunk(rx, chunk(0), MAX), false);
  assert.equal(appendFileChunk(rx, chunk(1), MAX), false);
  assert.deepEqual(rx.parts, []);
  assert.equal(rx.got, 0);
  assert.equal(finishFile(rx, { id: rx.id }), true);
  assert.equal(finishFile(rx, { id: rx.id }), false);
});

test('binary bytes before begin and non-ArrayBuffer values never append', () => {
  const rx = receive();
  assert.equal(appendFileChunk(rx, chunk(4), MAX), false);
  assert.equal(beginFile(rx, begin(), MAX), true);
  for (const value of [undefined, null, {}, 'bytes', new Uint8Array(4), new Blob(['data'])]) {
    assert.equal(appendFileChunk(rx, value, MAX), false);
  }
  assert.deepEqual(rx.parts, []);
  assert.equal(rx.got, 0);
});

test('empty chunks cannot grow a positive-size receiver without spending its byte budget', () => {
  const rx = receive();
  assert.equal(beginFile(rx, begin(), MAX), true);
  for (let i = 0; i < 256; i += 1) assert.equal(appendFileChunk(rx, chunk(0), MAX), false);
  assert.deepEqual(rx.parts, []);
  assert.equal(rx.got, 0);
  assert.equal(appendFileChunk(rx, chunk(4), MAX), true);
  assert.equal(finishFile(rx, { id: rx.id }), true);
});

test('tiny chunks cannot accumulate more than the receiver part cap', () => {
  const cap = 16384;
  const rx = receive({ size: cap + 1 });
  assert.equal(beginFile(rx, begin({ size: rx.size }), rx.size), true);
  for (let i = 0; i < cap; i += 1) assert.equal(appendFileChunk(rx, chunk(1), rx.size), true);
  const last = rx.parts.at(-1);
  assert.equal(appendFileChunk(rx, chunk(1), rx.size), false);
  assert.equal(rx.parts.length, cap);
  assert.equal(rx.parts.at(-1), last);
  assert.equal(rx.got, cap);
  assert.equal(finishFile(rx, { id: rx.id }), false);
});

test('the receiver holds at most the requested byte count and page cap', () => {
  const rx = receive();
  assert.equal(beginFile(rx, begin(), MAX), true);
  const first = chunk(3);
  assert.equal(appendFileChunk(rx, first, MAX), true);
  assert.equal(appendFileChunk(rx, chunk(2), MAX), false);
  assert.equal(rx.got, 3);
  assert.deepEqual(rx.parts, [first]);
  assert.equal(appendFileChunk(rx, chunk(1), MAX), true);
  assert.equal(appendFileChunk(rx, chunk(1), MAX), false);
  assert.equal(rx.got, 4);
  assert.equal(rx.parts.length, 2);
  assert.equal(beginFile(receive({ size: MAX + 1 }), begin({ size: MAX + 1 }), MAX), false);
  assert.equal(appendFileChunk(rx, chunk(0), 3), false);
});

test('a truncated or mismatched end cannot complete a download', () => {
  const rx = receive();
  assert.equal(beginFile(rx, begin(), MAX), true);
  assert.equal(appendFileChunk(rx, chunk(3), MAX), true);
  assert.equal(finishFile(rx, { id: rx.id }), false);
  assert.equal(rx.begun, true);
  assert.equal(appendFileChunk(rx, chunk(1), MAX), true);
  for (const msg of [undefined, null, [], {}, { id: 'other' }]) assert.equal(finishFile(rx, msg), false);
  assert.equal(finishFile(rx, { id: rx.id }), true);
  assert.equal(appendFileChunk(rx, chunk(0), MAX), false);
  assert.equal(finishFile(rx, { id: rx.id }), false);
});

test('malformed receiver state is refused without changing it', () => {
  for (const rx of [undefined, null, [], {}, receive({ size: -1 }), receive({ got: -1 }), receive({ parts: null })]) {
    const before = structuredClone(rx);
    assert.equal(beginFile(rx, begin(), MAX), false);
    assert.equal(appendFileChunk(rx, chunk(1), MAX), false);
    assert.equal(finishFile(rx, { id: 'chosen' }), false);
    assert.deepEqual(rx, before);
  }
});
