/** Pending browser text reads must never outlive the editor they replace. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { textImport } from '../../shared/js/text-import.js';

function delayed() {
  let resolve;
  let reject;
  const value = new Promise((pass, fail) => { resolve = pass; reject = fail; });
  return { file: { text: () => value }, resolve, reject };
}

function page() {
  const events = [];
  let busy = false;
  const imports = textImport({
    busy(count) { busy = true; events.push(['reading', count]); },
    done() { busy = false; events.push(['done']); },
  });
  return { imports, events, busy: () => busy };
}

test('a current batch retains order and exact line endings despite reverse completion', async () => {
  const a = delayed();
  const b = delayed();
  const { imports, events, busy } = page();
  const reading = imports.read([a.file, b.file]);
  b.resolve('changed\r\n');
  await Promise.resolve();
  assert.equal(busy(), true);
  a.resolve('original\r\n');
  assert.deepEqual(await reading, ['original\r\n', 'changed\r\n']);
  assert.deepEqual(events, [['reading', 2], ['done']]);
});

test('editing retires a batch before it completes and clears reading immediately', async () => {
  const a = delayed();
  const b = delayed();
  const { imports, events, busy } = page();
  let editor = 'original';
  const reading = imports.read([a.file, b.file]).then((texts) => {
    if (texts !== null) editor = texts[0];
  });
  editor = 'newer edit';
  imports.invalidate();
  assert.equal(busy(), false);
  imports.invalidate();
  b.resolve('old second');
  a.resolve('old first');
  await reading;
  assert.equal(editor, 'newer edit');
  assert.deepEqual(events, [['reading', 2], ['done']]);
});

test('an older successful import cannot replace or finish a newer pending one', async () => {
  const old = delayed();
  const next = delayed();
  const { imports, events, busy } = page();
  const before = imports.read([old.file]);
  const after = imports.read([next.file]);
  old.resolve('old');
  assert.equal(await before, null);
  assert.equal(busy(), true);
  assert.deepEqual(events, [['reading', 1], ['reading', 1]]);
  next.resolve('next');
  assert.deepEqual(await after, ['next']);
  assert.equal(busy(), false);
  assert.deepEqual(events.at(-1), ['done']);
});

test('a rejected superseded import cannot publish an error or clear the latest reading label', async () => {
  const old = delayed();
  const next = delayed();
  const { imports, events, busy } = page();
  const before = imports.read([old.file]);
  const after = imports.read([next.file]);
  old.reject(new Error('late failure'));
  assert.equal(await before, null);
  assert.equal(busy(), true);
  assert.deepEqual(events, [['reading', 1], ['reading', 1]]);
  next.resolve('current');
  assert.deepEqual(await after, ['current']);
  assert.equal(busy(), false);
});

test('a late failure stays retired after the newer import has already finished', async () => {
  const old = delayed();
  const next = delayed();
  const { imports, events } = page();
  const before = imports.read([old.file]);
  const after = imports.read([next.file]);
  next.resolve('current');
  assert.deepEqual(await after, ['current']);
  const finished = events.slice();
  old.reject(new Error('late failure'));
  assert.equal(await before, null);
  assert.deepEqual(events, finished);
});

test('Clear silences pending failures and allows the next read to start normally', async () => {
  const old = delayed();
  const { imports, events, busy } = page();
  const before = imports.read([old.file]);
  imports.invalidate();
  old.reject(new Error('late failure'));
  assert.equal(await before, null);
  assert.equal(busy(), false);
  assert.deepEqual(await imports.read([{ text: async () => 'new' }]), ['new']);
  assert.deepEqual(events, [['reading', 1], ['done'], ['reading', 1], ['done']]);
});

test('a current asynchronous or synchronous read failure is reported and ends reading', async () => {
  for (const asynchronous of [true, false]) {
    const failure = new Error('current failure');
    const { imports, events, busy } = page();
    const file = { text() { if (asynchronous) return Promise.reject(failure); throw failure; } };
    await assert.rejects(imports.read([file]), (error) => error === failure);
    assert.equal(busy(), false);
    assert.deepEqual(events, [['reading', 1], ['done']]);
  }
});


test('applying a result has no await handoff in which a queued newer edit can be lost', async () => {
  const held = delayed();
  const { imports } = page();
  let editor = '';
  const reading = imports.read([held.file], { apply(texts) { editor = texts[0]; } });
  held.resolve('import');
  queueMicrotask(() => queueMicrotask(() => { editor = 'newer'; imports.invalidate(); }));
  await reading;
  await Promise.resolve();
  assert.equal(editor, 'newer');
});

test('error callbacks belong to the current owner and a stale failure cannot invoke them', async () => {
  const old = delayed();
  const next = delayed();
  const { imports } = page();
  const failures = [];
  const before = imports.read([old.file], { failed(error) { failures.push(error); } });
  const after = imports.read([next.file], { failed(error) { failures.push(error); } });
  const current = new Error('current');
  old.reject(new Error('old'));
  next.reject(current);
  assert.equal(await before, null);
  assert.equal(await after, null);
  assert.deepEqual(failures, [current]);
});
