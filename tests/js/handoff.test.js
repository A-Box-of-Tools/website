import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { File } from 'node:buffer';
import { randomUUID } from 'node:crypto';

const script = readFileSync(new URL('../../shared/handoff.js', import.meta.url), 'utf8');
const settle = () => new Promise(resolve => setImmediate(resolve));

// Requests queued by onsuccess must finish before commit. Competing writes
// serialize, including cleanup racing a newer transfer.
function memoryIDB() {
  const records = new Map(), waiting = [];
  let active = false, created = false;
  const state = { records, hold: false, held: [], fail: false, failPut: false, beforeComplete: null };
  function pump() {
    if (active || !waiting.length) return;
    active = true;
    const tx = waiting.shift();
    tx.data = new Map(records);
    function step() {
      if (tx.ops.length) {
        try { tx.ops.shift()(); }
        catch (error) { tx.error = error; active = false; tx.onerror?.(); queueMicrotask(pump); return; }
        queueMicrotask(step);
        return;
      }
      const hook = state.beforeComplete;
      state.beforeComplete = null;
      hook?.();
      records.clear();
      for (const [key, value] of tx.data) records.set(key, value);
      active = false;
      tx.oncomplete?.();
      queueMicrotask(pump);
    }
    queueMicrotask(step);
  }
  const connection = {
    close() {}, createObjectStore() {},
    transaction() {
      const tx = { ops: [], data: null };
      function request(action, req = {}) {
        tx.ops.push(() => { req.result = action(); req.onsuccess?.(); });
        return req;
      }
      const store = {
        get: key => request(() => tx.data.get(key)),
        put: (value, key) => request(() => {
          if (state.failPut) { state.failPut = false; throw new Error('quota-exceeded'); }
          tx.data.set(key, value);
          return key;
        }),
        delete: key => request(() => { tx.data.delete(key); }),
        openCursor() {
          const req = {};
          let keys, index = 0;
          function advance() {
            request(() => {
              keys ??= [...tx.data.keys()];
              if (index === keys.length) return null;
              const key = keys[index++];
              return { value: tx.data.get(key), delete: () => store.delete(key), continue: advance };
            }, req);
          }
          advance();
          return req;
        },
      };
      tx.objectStore = () => store;
      waiting.push(tx);
      queueMicrotask(pump);
      return tx;
    },
  };
  state.indexedDB = {
    open() {
      const req = { result: connection }, fail = state.fail;
      state.fail = false;
      const finish = () => {
        if (fail) { req.error = new Error('storage-unavailable'); req.onerror?.(); return; }
        if (!created) { created = true; req.onupgradeneeded?.(); }
        req.onsuccess?.();
      };
      if (state.hold) { state.hold = false; state.held.push(finish); }
      else queueMicrotask(finish);
      return req;
    },
  };
  state.release = () => { for (const finish of state.held.splice(0)) queueMicrotask(finish); };
  return state;
}

function harness(db, { tool = 'text-diff', now = 1_000_000_000 } = {}) {
  const deliveries = [], effects = { fetch: 0, navigation: 0 };
  const input = { multiple: true, dispatchEvent() { deliveries.push(Array.from(this.files)); } };
  const window = {
    indexedDB: db.indexedDB, fetch() { effects.fetch++; },
    location: { assign() { effects.navigation++; } },
  };
  class DataTransfer {
    files = [];
    items = { add: file => this.files.push(file) };
  }
  vm.runInNewContext(script, {
    window, File, DataTransfer, Promise, crypto: { randomUUID },
    Date: class extends Date { static now() { return now; } }, Event: class {},
    document: {
      readyState: 'complete',
      getElementById(id) {
        if (id === 'feedback') return { getAttribute: () => tool };
        if (id === 'file-input') return input;
        return null;
      },
    },
  });
  return { window, deliveries, effects, now, ready: settle };
}

const pair = tag => [new File([tag + '-A'], tag + '-a.csv'), new File([tag + '-B'], tag + '-b.csv')];

test('source handoff snapshots ordered Files without fetching or navigating', async () => {
  const db = memoryIDB(), env = harness(db);
  await env.ready();
  const files = pair('source');
  const pending = env.window.aboxHandoffFiles('stitch-tables', files, () => true);
  files.reverse();
  assert.equal(await pending, true);
  const record = db.records.get('stitch-tables');
  assert.deepEqual(Array.from(record.files, file => file.name), ['source-a.csv', 'source-b.csv']);
  assert.equal(await record.files[0].text(), 'source-A');
  assert.equal(record.from, 'text-diff');
  assert.equal(record.time, env.now);
  assert.ok(record.id);
  assert.deepEqual(env.effects, { fetch: 0, navigation: 0 });
});

test('a delayed old transfer cannot overwrite a newer pair', async () => {
  const db = memoryIDB(), env = harness(db);
  await env.ready();
  db.hold = true;
  const old = env.window.aboxHandoffFiles('stitch-tables', pair('old'), () => true);
  assert.equal(await env.window.aboxHandoffFiles('stitch-tables', pair('new'), () => true), true);
  db.release();
  assert.equal(await old, false);
  assert.equal(db.records.get('stitch-tables').files[0].name, 'new-a.csv');
});

test('cancelled cleanup cannot delete a newer committed source pair', async () => {
  const db = memoryIDB(), env = harness(db);
  await env.ready();
  let newer;
  db.beforeComplete = () => { newer = env.window.aboxHandoffFiles('stitch-tables', pair('new'), () => true); };
  assert.equal(await env.window.aboxHandoffFiles('stitch-tables', pair('old'), () => true), false);
  assert.equal(await newer, true);
  assert.equal(db.records.get('stitch-tables').files[0].name, 'new-a.csv');
});

test('editing a source during storage retires only that packet', async () => {
  const db = memoryIDB(), env = harness(db);
  await env.ready();
  let current = true;
  db.beforeComplete = () => { current = false; };
  assert.equal(await env.window.aboxHandoffFiles('stitch-tables', pair('old'), () => current), false);
  assert.equal(db.records.has('stitch-tables'), false);
});

test('storage failure leaves source Files intact and does not navigate', async () => {
  const db = memoryIDB(), env = harness(db);
  await env.ready();
  const files = pair('source');
  db.fail = true;
  await assert.rejects(env.window.aboxHandoffFiles('stitch-tables', files, () => true), /storage-unavailable/);
  assert.equal(files[0].name, 'source-a.csv');
  assert.equal(db.records.has('stitch-tables'), false);
  assert.deepEqual(env.effects, { fetch: 0, navigation: 0 });
});

test('the normal receiver consumes an ordered pair exactly once', async () => {
  const db = memoryIDB(), sender = harness(db);
  await sender.ready();
  await sender.window.aboxHandoffFiles('stitch-tables', pair('source'), () => true);
  const receiver = harness(db, { tool: 'stitch-tables' });
  await receiver.ready();
  assert.deepEqual(receiver.deliveries.map(files => files.map(file => file.name)), [['source-a.csv', 'source-b.csv']]);
  assert.equal(db.records.has('stitch-tables'), false);
  const again = harness(db, { tool: 'stitch-tables' });
  await again.ready();
  assert.equal(again.deliveries.length, 0);
});

test('an expired source pair is consumed without delivery', async () => {
  const db = memoryIDB(), sender = harness(db);
  await sender.ready();
  await sender.window.aboxHandoffFiles('stitch-tables', pair('source'), () => true);
  const receiver = harness(db, { tool: 'stitch-tables', now: sender.now + 600001 });
  await receiver.ready();
  assert.equal(receiver.deliveries.length, 0);
  assert.equal(db.records.has('stitch-tables'), false);
});

test('a rejected storage write does not park partial data or navigate', async () => {
  const db = memoryIDB(), env = harness(db);
  await env.ready();
  db.failPut = true;
  await assert.rejects(env.window.aboxHandoffFiles('stitch-tables', pair('source'), () => true), /quota-exceeded/);
  assert.equal(db.records.has('stitch-tables'), false);
  assert.deepEqual(env.effects, { fetch: 0, navigation: 0 });
});

test('a transfer remains valid at exactly the ten-minute boundary', async () => {
  const db = memoryIDB(), sender = harness(db);
  await sender.ready();
  await sender.window.aboxHandoffFiles('stitch-tables', pair('source'), () => true);
  const receiver = harness(db, { tool: 'stitch-tables', now: sender.now + 600000 });
  await receiver.ready();
  assert.equal(receiver.deliveries.length, 1);
});
