/**
 * Files over a data channel lane: one lane per sync run and direction, opened
 * by the side that has the files.
 *
 * The side that wants a file pulls it. It asks for a few files ahead so small
 * files do not each wait a round trip, and the side that has them sends them
 * in the order asked. A data channel's own backpressure only watches the
 * sender's buffer, not the receiver's disk, so the receiver also acknowledges
 * the bytes it has written and the sender never runs more than WINDOW ahead.
 * That keeps the receiving page's memory flat however large the file is.
 */

export const CHUNK = 64 * 1024;
const READ = 1024 * 1024;
const FLUSH = 1024 * 1024;
export const WINDOW = 8 * 1024 * 1024;
export const ACK_STEP = 512 * 1024;
const HIGH = 2 * 1024 * 1024;
const LOW = 512 * 1024;
export const PIPELINE = 4;
// A disk can be slow; a minute with not one frame from the other side is a
// connection that has stopped, and waiting longer only hides that.
export const STALL = 60000;
const MAX_FRAME = 4096;
const MAX_BINARY = 256 * 1024;
const MAX_ID = 2 ** 31;
const SKIPS = new Set(['refused', 'changed', 'missing']);

function frame(data) {
  if (typeof data !== 'string' || data.length > MAX_FRAME) return null;
  try {
    const value = JSON.parse(data);
    return value && typeof value === 'object' && !Array.isArray(value) && typeof value.type === 'string' ? value : null;
  } catch { return null; }
}
const requestId = (value) => Number.isSafeInteger(value) && value >= 1 && value <= MAX_ID;

/**
 * Serves this side's files. `lookup(key)` returns the entry the agreed run
 * allows to be sent, once, or null; `read(entry)` returns its File.
 */
export function createSource({ channel, lookup, read, current = () => true,
  onSent = () => {}, onStored = () => {}, onError = () => {} }) {
  channel.binaryType = 'arraybuffer';
  channel.bufferedAmountLowThreshold = LOW;
  const queue = [];
  const served = new Map();
  let sent = 0, acked = 0, busy = false, stopped = false, wake = null;
  const live = () => !stopped && current() && channel.readyState === 'open';
  const notify = () => { const resume = wake; wake = null; resume?.(); };
  const send = (value) => { if (live()) channel.send(JSON.stringify(value)); };
  function stop() {
    if (stopped) return;
    stopped = true;
    queue.length = 0;
    notify();
    try { channel.close(); } catch {}
  }
  function fail() {
    if (stopped) return;
    stop();
    onError();
  }
  channel.addEventListener('bufferedamountlow', notify);
  channel.addEventListener('close', () => { stopped = true; notify(); });
  // The other side hears of a lane as soon as it is announced, so its first
  // request can arrive here before this end has finished opening. It waits
  // in the queue until the lane is open; without this nothing would start it.
  channel.addEventListener('open', () => { void pump(); });
  channel.addEventListener('message', (event) => {
    if (stopped || !current()) return;
    const message = frame(event.data);
    if (message?.type === 'get' && requestId(message.id) && typeof message.key === 'string' && queue.length < PIPELINE) {
      queue.push(message);
      void pump();
    } else if (message?.type === 'ack' && Number.isSafeInteger(message.bytes) && message.bytes >= acked && message.bytes <= sent) {
      acked = message.bytes;
      notify();
    } else if (message?.type === 'stored' && served.has(message.id) && Number.isSafeInteger(message.mtime) && message.mtime >= 0) {
      onStored(served.get(message.id), message.mtime);
      served.delete(message.id);
    } else if (message?.type === 'cancel') stop();
    else fail();
  });

  async function pump() {
    if (busy) return;
    busy = true;
    try {
      while (queue.length && live()) await serve(queue.shift());
    } catch { fail(); }
    finally { busy = false; }
  }

  async function serve({ id, key }) {
    const entry = lookup(key);
    if (!entry) { send({ type: 'skip', id, reason: 'refused' }); return; }
    let file;
    try { file = await read(entry); } catch { send({ type: 'skip', id, reason: 'missing' }); return; }
    if (!live()) return;
    // The listing promised these bytes. A file edited since is not what the
    // other side agreed to; the next comparison offers the new version.
    if (file.size !== entry.size || file.lastModified !== entry.mtime) { send({ type: 'skip', id, reason: 'changed' }); return; }
    served.set(id, key);
    send({ type: 'begin', id, size: file.size });
    for (let offset = 0; offset < file.size;) {
      let buffer;
      // A File is a snapshot: Chromium refuses to read one whose file has
      // changed underneath it, and that refusal lands here.
      try { buffer = await file.slice(offset, offset + READ).arrayBuffer(); } catch { buffer = null; }
      if (!live()) return;
      if (!buffer?.byteLength) { served.delete(id); send({ type: 'abort', id }); return; }
      for (let at = 0; at < buffer.byteLength; at += CHUNK) {
        while (live() && (sent - acked > WINDOW || channel.bufferedAmount > HIGH)) {
          await new Promise((resolve) => { wake = resolve; });
        }
        if (!live()) return;
        const piece = buffer.slice(at, Math.min(at + CHUNK, buffer.byteLength));
        channel.send(piece);
        sent += piece.byteLength;
        onSent(key, piece.byteLength);
      }
      offset += buffer.byteLength;
    }
    send({ type: 'end', id });
  }

  return { stop };
}

/**
 * Pulls `items` ({ key, path, size }) from the other side's lane into
 * `writer`. `onFile(item, reason, stored)` reports each file once: reason
 * null for a file written whole, otherwise why it was not.
 */
export function createSink({ channel, items, writer, current = () => true,
  onProgress = () => {}, onFile = () => {}, onDone = () => {}, onError = () => {},
  now = () => Date.now(), later = (callback, delay) => setTimeout(callback, delay), cancelTimer = (timer) => clearTimeout(timer) }) {
  channel.binaryType = 'arraybuffer';
  const waiting = [...items];
  const outstanding = [];
  let next = 1, consumed = 0, acked = 0, active = null, chain = Promise.resolve();
  let stopped = false, stall = null, last = now();
  const send = (value) => {
    if (stopped || channel.readyState !== 'open') return;
    try { channel.send(JSON.stringify(value)); } catch { fail(); }
  };

  function check() {
    stall = null;
    if (stopped || !outstanding.length) return;
    const idle = now() - last;
    if (idle >= STALL) fail();
    else stall = later(check, STALL - idle);
  }
  function watch() {
    last = now();
    if (stall === null && outstanding.length && !stopped) stall = later(check, STALL);
  }
  function release() {
    cancelTimer(stall);
    stall = null;
    const out = active?.out;
    active = null;
    if (out) void Promise.resolve(out.abort()).catch(() => {});
  }
  function fail() {
    if (stopped) return;
    stopped = true;
    release();
    onError();
  }
  function ask() {
    while (!stopped && outstanding.length < PIPELINE && waiting.length) {
      const item = waiting.shift();
      const id = next++;
      outstanding.push({ id, item });
      send({ type: 'get', id, key: item.key });
    }
    watch();
    if (!stopped && !outstanding.length && !waiting.length) {
      stopped = true;
      release();
      onDone();
    }
  }
  function acknowledge(force) {
    if (consumed > acked && (force || consumed - acked >= ACK_STEP)) {
      acked = consumed;
      send({ type: 'ack', bytes: consumed });
    }
  }
  // A write is a round trip to the browser process, so sixteen chunks make
  // one write. Only written bytes are acknowledged: the window then measures
  // the disk as well as the network.
  async function flush(file) {
    const parts = file.pending, bytes = file.pendingBytes;
    file.pending = [];
    file.pendingBytes = 0;
    let joined = parts[0];
    if (parts.length > 1) {
      joined = new Uint8Array(bytes);
      let at = 0;
      for (const part of parts) { joined.set(part, at); at += part.length; }
    }
    try { await file.out.write(joined); }
    catch {
      // Keep reading the rest of this file so the lane stays in step; only
      // this file is lost, and the original on disk is untouched.
      const out = file.out;
      file.out = null;
      file.reason = 'write';
      if (out) await Promise.resolve(out.abort()).catch(() => {});
    }
    consumed += bytes;
  }

  async function handle(data) {
    if (stopped) return;
    if (data instanceof ArrayBuffer) {
      const file = active;
      if (!file || data.byteLength === 0 || data.byteLength > MAX_BINARY
          || file.got + data.byteLength > file.item.size) throw new Error('invalid');
      file.got += data.byteLength;
      onProgress(data.byteLength);
      if (file.out) {
        file.pending.push(new Uint8Array(data));
        file.pendingBytes += data.byteLength;
        if (file.pendingBytes >= FLUSH || file.got === file.item.size) await flush(file);
      } else consumed += data.byteLength;
      if (stopped) return;
      acknowledge(false);
      return;
    }
    const message = frame(data);
    const head = outstanding[0];
    if (!message || !head || message.id !== head.id) throw new Error('invalid');
    if (message.type === 'begin') {
      if (active || message.size !== head.item.size) throw new Error('invalid');
      const opening = active = { id: head.id, item: head.item, got: 0, out: null, reason: null, pending: [], pendingBytes: 0 };
      try {
        const out = await writer.open(head.item.path, head.item.size);
        // Stopped while the file was being opened: nothing else will close it.
        if (stopped || active !== opening) { await Promise.resolve(out.abort()).catch(() => {}); return; }
        opening.out = out;
      } catch (error) { opening.reason = error?.message === 'zip.limit' ? 'limit' : 'write'; }
      return;
    }
    if (message.type === 'end') {
      if (!active || active.got !== active.item.size) throw new Error('invalid');
      outstanding.shift();
      const done = active;
      active = null;
      let stored = null;
      if (done.out) {
        try { stored = await done.out.close(); }
        catch {
          done.reason = 'write';
          await Promise.resolve(done.out.abort()).catch(() => {});
        }
      }
      if (stopped) return;
      if (stored && stored.mtime !== null) send({ type: 'stored', id: done.id, mtime: stored.mtime });
      acknowledge(true);
      onFile(done.item, done.reason, stored);
      ask();
      return;
    }
    if (message.type === 'skip') {
      if (active || !SKIPS.has(message.reason)) throw new Error('invalid');
      outstanding.shift();
      onFile(head.item, message.reason, null);
      ask();
      return;
    }
    if (message.type === 'abort') {
      if (!active) throw new Error('invalid');
      outstanding.shift();
      const done = active;
      active = null;
      if (done.out) await Promise.resolve(done.out.abort()).catch(() => {});
      if (stopped) return;
      acknowledge(true);
      onFile(done.item, 'unreadable', null);
      ask();
      return;
    }
    throw new Error('invalid');
  }

  channel.addEventListener('message', (event) => {
    if (stopped || !current()) return;
    watch();
    const data = event.data;
    chain = chain.then(() => handle(data)).catch(() => fail());
  });
  channel.addEventListener('close', () => { if (!stopped) fail(); });
  channel.addEventListener('open', () => ask(), { once: true });
  if (channel.readyState === 'open') ask();

  return {
    cancel() {
      if (stopped) return;
      send({ type: 'cancel' });
      stopped = true;
      release();
    },
  };
}
