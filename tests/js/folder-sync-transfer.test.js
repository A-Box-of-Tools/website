import test from 'node:test';
import assert from 'node:assert/strict';
import { createSource, createSink, CHUNK, WINDOW, STALL } from '../../tools/folder-sync/src/transfer.js';

// One end of an in-memory data channel. Delivery is asynchronous and ordered,
// as SCTP's is; a closed end throws on send like the browser's, and an end
// still opening already receives, as Chromium's does once the lane is announced.
class Lane {
  constructor(log) {
    Object.assign(this, { log, readyState: 'open', bufferedAmount: 0, binaryType: 'blob', listeners: new Map(), peer: null });
  }
  addEventListener(type, listener) { (this.listeners.get(type) ?? this.listeners.set(type, []).get(type)).push(listener); }
  dispatch(type, event = {}) { for (const listener of [...(this.listeners.get(type) ?? [])]) listener(event); }
  send(data) {
    if (this.readyState !== 'open') throw new Error('closed');
    const copy = typeof data === 'string' ? data : data.slice(0);
    this.log.push({ from: this, data: copy });
    setImmediate(() => { if (this.peer.readyState !== 'closed') this.peer.dispatch('message', { data: copy }); });
  }
  close() {
    if (this.readyState === 'closed') return;
    this.readyState = 'closed';
    setImmediate(() => {
      this.dispatch('close');
      if (this.peer.readyState !== 'closed') { this.peer.readyState = 'closed'; this.peer.dispatch('close'); }
    });
  }
}

function lanes() {
  const log = [];
  const source = new Lane(log), sink = new Lane(log);
  source.peer = sink;
  sink.peer = source;
  return { source, sink, log };
}

function bytes(length, seed = 1) {
  const data = new Uint8Array(length);
  for (let i = 0; i < length; i += 1) data[i] = (i * seed + (i >> 8)) & 255;
  return data;
}

function folder(entries) {
  const map = new Map(entries.map(([key, data, mtime = 1000]) => [key, { key, path: key, size: data.length, mtime, data }]));
  return {
    map,
    lookup: (key) => map.get(key) ?? null,
    read: async (entry) => new File([entry.data], entry.key, { lastModified: entry.mtime }),
  };
}

// Writes that take a moment, as a disk's do, so the window has something to hold back.
function memoryWriter({ slow = 0, failOpen = new Set(), failWrite = new Set() } = {}) {
  const stored = new Map(), aborted = [];
  return {
    stored, aborted,
    async open(path, size) {
      if (failOpen.has(path)) throw new Error('denied');
      const parts = [];
      return {
        async write(chunk) {
          if (failWrite.has(path)) throw new Error('disk full');
          if (slow) await new Promise((resolve) => setTimeout(resolve, slow));
          parts.push(new Uint8Array(chunk));
        },
        close() {
          const data = new Uint8Array(size);
          let at = 0;
          for (const part of parts) { data.set(part, at); at += part.length; }
          stored.set(path, data);
          return { size, mtime: 5000 + stored.size };
        },
        abort() { aborted.push(path); },
      };
    },
  };
}

function pull({ items, source: files, writer, sourceOptions = {}, sinkOptions = {} }) {
  const { source, sink, log } = lanes();
  const results = [], stored = [];
  return new Promise((resolve) => {
    let done = false;
    createSource({ channel: source, lookup: files.lookup, read: files.read, onStored: (key, mtime) => stored.push([key, mtime]), ...sourceOptions });
    const handle = createSink({
      channel: sink, items, writer,
      onFile: (item, reason) => results.push([item.key, reason]),
      onDone: () => { done = true; setImmediate(() => resolve({ results, stored, log, source, sink, done, handle })); },
      onError: () => resolve({ results, stored, log, source, sink, done, error: true, handle }),
      ...sinkOptions,
    });
  });
}

test('files of every size arrive whole, and the sender never outruns what was written', async () => {
  const files = folder([['empty.txt', new Uint8Array(0)], ['small.txt', bytes(100)], ['odd.bin', bytes(3 * 1024 * 1024 + 7, 3)],
    ['big.bin', bytes(12 * 1024 * 1024, 5)], ['docs/deep/note.md', bytes(CHUNK, 7)]]);
  const items = [...files.map.values()].map(({ key, path, size }) => ({ key, path, size }));
  const writer = memoryWriter({ slow: 1 });
  const { results, stored, log, source, done } = await pull({ items, source: files, writer });
  assert.equal(done, true);
  assert.deepEqual(results, items.map((item) => [item.key, null]));
  for (const entry of files.map.values()) assert.deepEqual(writer.stored.get(entry.key), entry.data, entry.key);
  assert.deepEqual(stored.map(([key]) => key), items.map((item) => item.key));
  // Replay the lane: at no binary send was the sender more than a window
  // (and the chunk in hand) ahead of the bytes the receiver had acknowledged.
  let sent = 0, acked = 0, furthest = 0;
  for (const { from, data } of log) {
    if (from === source && typeof data !== 'string') { sent += data.byteLength; furthest = Math.max(furthest, sent - acked); }
    if (from !== source && typeof data === 'string' && JSON.parse(data).type === 'ack') acked = JSON.parse(data).bytes;
  }
  assert.ok(furthest <= WINDOW + CHUNK, `ran ${furthest} bytes ahead`);
  assert.ok(furthest > CHUNK, 'the window was actually used');
  assert.equal(acked, sent, 'every written byte is acknowledged by the end');
});

test('a request that reaches the sending end before it has opened is served once it opens', async () => {
  const files = folder([['early.txt', bytes(50)]]);
  const { source, sink } = lanes();
  source.readyState = 'connecting';
  const writer = memoryWriter();
  const results = [];
  createSource({ channel: source, lookup: files.lookup, read: files.read });
  const finished = new Promise((resolve) => {
    createSink({ channel: sink, items: [{ key: 'early.txt', path: 'early.txt', size: 50 }], writer,
      onFile: (item, reason) => results.push([item.key, reason]), onDone: resolve });
  });
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.deepEqual(results, [], 'nothing is sent on a lane that has not opened');
  source.readyState = 'open';
  source.dispatch('open');
  await Promise.race([finished, new Promise((resolve, reject) => setTimeout(() => reject(new Error('the queued request was never served')), 2000))]);
  assert.deepEqual(results, [['early.txt', null]]);
  assert.deepEqual(writer.stored.get('early.txt'), files.map.get('early.txt').data);
});

test('a file the run does not allow, or one changed since the listing, is skipped and the lane goes on', async () => {
  const files = folder([['allowed.txt', bytes(10)], ['edited.txt', bytes(20)]]);
  const items = [{ key: 'secret.txt', path: 'secret.txt', size: 5 }, { key: 'edited.txt', path: 'edited.txt', size: 20 },
    { key: 'allowed.txt', path: 'allowed.txt', size: 10 }];
  // The file on disk now carries a later date than the listing promised.
  files.read = async (entry) => new File([entry.data], entry.key, { lastModified: entry.key === 'edited.txt' ? 2000 : entry.mtime });
  const writer = memoryWriter();
  const { results } = await pull({ items, source: files, writer });
  assert.deepEqual(results, [['secret.txt', 'refused'], ['edited.txt', 'changed'], ['allowed.txt', null]]);
  assert.deepEqual([...writer.stored.keys()], ['allowed.txt']);
});

test('a file that cannot be written fails alone and leaves no partial copy', async () => {
  const files = folder([['locked.txt', bytes(10)], ['full.bin', bytes(2 * 1024 * 1024)], ['fine.txt', bytes(30)]]);
  const items = [...files.map.values()].map(({ key, path, size }) => ({ key, path, size }));
  const writer = memoryWriter({ failOpen: new Set(['locked.txt']), failWrite: new Set(['full.bin']) });
  const { results, done } = await pull({ items, source: files, writer });
  assert.equal(done, true);
  assert.deepEqual(results, [['locked.txt', 'write'], ['full.bin', 'write'], ['fine.txt', null]]);
  assert.deepEqual(writer.aborted, ['full.bin']);
  assert.deepEqual([...writer.stored.keys()], ['fine.txt']);
});

test('a peer that sends more bytes than it promised ends the run', async () => {
  const { source, sink } = lanes();
  let failed = false;
  const writer = memoryWriter();
  createSink({ channel: sink, items: [{ key: 'a.txt', path: 'a.txt', size: 4 }], writer, onError: () => { failed = true; } });
  source.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.type !== 'get') return;
    source.send(JSON.stringify({ type: 'begin', id: message.id, size: 4 }));
    source.send(new Uint8Array(8).buffer);
  });
  await new Promise((resolve) => setTimeout(resolve, 50));
  assert.equal(failed, true);
  assert.equal(writer.stored.size, 0);
});

test('cancelling stops the sender and discards the file in flight', async () => {
  const files = folder([['huge.bin', bytes(16 * 1024 * 1024)]]);
  const { source, sink } = lanes();
  const writer = memoryWriter({ slow: 2 });
  let finished = false;
  createSource({ channel: source, lookup: files.lookup, read: files.read });
  const handle = createSink({ channel: sink, items: [{ key: 'huge.bin', path: 'huge.bin', size: 16 * 1024 * 1024 }], writer,
    onDone: () => { finished = true; }, onFile: () => { finished = true; } });
  await new Promise((resolve) => setTimeout(resolve, 30));
  handle.cancel();
  await new Promise((resolve) => setTimeout(resolve, 50));
  assert.equal(finished, false);
  assert.deepEqual(writer.aborted, ['huge.bin']);
  assert.equal(writer.stored.size, 0);
  assert.equal(source.readyState, 'closed', 'the sender closes its lane on cancel');
});

test('a lane that goes quiet for a minute is a stalled run', async () => {
  const { sink } = lanes();
  let clock = 0, failed = false;
  const timers = [];
  createSink({ channel: sink, items: [{ key: 'a.txt', path: 'a.txt', size: 1 }], writer: memoryWriter(),
    now: () => clock, later: (callback, delay) => { timers.push({ callback, at: clock + delay }); return timers.length; },
    cancelTimer: () => {}, onError: () => { failed = true; } });
  assert.equal(timers.length, 1);
  clock = STALL - 1;
  assert.equal(failed, false);
  clock = timers[0].at;
  timers[0].callback();
  assert.equal(failed, true);
});
