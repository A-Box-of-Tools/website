/** Cancelled PDF extraction cannot progress into later readers or publish partial data. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readTables, TableReadError } from '../../tools/pdf-to-csv/src/read.js';

const file = { arrayBuffer: async () => new ArrayBuffer(4) };
const table = { columns: [], blocks: [] };
function services(count = 3) {
  return {
    open: async () => ({}), pageList: () => Array.from({ length: count }, (_, at) => at),
    read: async (_, page) => page, lines: (page) => [{ page }], tablesIn: () => [table],
    pause: async () => {}, now: () => 0,
  };
}
function delayed() {
  let resolve;
  const value = new Promise((done) => { resolve = done; });
  return { value, resolve };
}
const aborted = (error) => error.name === 'AbortError';

test('a completed read reports all pages in order and returns a local complete document', async () => {
  const progress = [];
  const result = await readTables(file, { onProgress: (...pair) => progress.push(pair) }, services());
  assert.equal(result.file, file);
  assert.equal(result.pages, 3);
  assert.equal(result.bytes, 4);
  assert.deepEqual(result.tables, [table]);
  assert.deepEqual(progress, [[0, 3], [1, 3], [2, 3], [3, 3]]);
});

test('cancellation before or during file bytes never opens the PDF', async () => {
  for (const initially of [true, false]) {
    const controller = new AbortController();
    const held = delayed();
    let opened = false;
    const deps = { ...services(), open: async () => { opened = true; return {}; } };
    if (initially) controller.abort();
    const reading = readTables({ arrayBuffer: () => held.value }, { signal: controller.signal }, deps);
    const rejected = assert.rejects(reading, aborted);
    if (!initially) controller.abort();
    held.resolve(new ArrayBuffer(1));
    await rejected;
    assert.equal(opened, false);
  }
});

test('cancellation while opening never starts page extraction or progress', async () => {
  const controller = new AbortController();
  const held = delayed();
  let started;
  const opened = new Promise((done) => { started = done; });
  let pageReads = 0;
  const deps = { ...services(), open: () => { started(); return held.value; }, read: async () => { pageReads++; } };
  const progress = [];
  const reading = readTables(file, { signal: controller.signal, onProgress: (...pair) => progress.push(pair) }, deps);
  const rejected = assert.rejects(reading, aborted);
  await opened;
  controller.abort();
  held.resolve({});
  await rejected;
  assert.equal(pageReads, 0);
  assert.deepEqual(progress, []);
});

test('cancellation during a page read suppresses its progress and all later pages', async () => {
  const controller = new AbortController();
  const held = delayed();
  let started;
  const pageStarted = new Promise((done) => { started = done; });
  let pageReads = 0;
  const deps = { ...services(), read() { pageReads++; started(); return held.value; } };
  const progress = [];
  const reading = readTables(file, { signal: controller.signal, onProgress: (...pair) => progress.push(pair) }, deps);
  const rejected = assert.rejects(reading, aborted);
  await pageStarted;
  controller.abort();
  held.resolve(0);
  await rejected;
  assert.equal(pageReads, 1);
  assert.deepEqual(progress, [[0, 3]]);
});

test('fast page reads yield to a task so cancellation can stop before the remaining pages', async () => {
  const controller = new AbortController();
  let pageReads = 0;
  let inferred = false;
  const deps = { ...services(20), read: async () => { pageReads++; return {}; },
    pause: async () => controller.abort(), tablesIn: () => { inferred = true; return [table]; } };
  await assert.rejects(readTables(file, { signal: controller.signal }, deps), aborted);
  assert.ok(pageReads > 0 && pageReads < 20);
  assert.equal(inferred, false);
});

test('cancellation after the last page prevents the synchronous inference pass', async () => {
  const controller = new AbortController();
  let inferred = false;
  const deps = { ...services(1), pause: async () => controller.abort(),
    tablesIn: () => { inferred = true; return [table]; } };
  await assert.rejects(readTables(file, { signal: controller.signal }, deps), aborted);
  assert.equal(inferred, false);
});

test('missing pages, scanned pages and missing tables retain distinct refusal reasons', async () => {
  for (const [reason, deps] of [['load.nopages', services(0)],
    ['scan.notext', { ...services(), lines: () => [] }],
    ['scan.notables', { ...services(), tablesIn: () => [] }]]) {
    await assert.rejects(readTables(file, {}, deps), (error) => error instanceof TableReadError && error.reason === reason);
  }
});
