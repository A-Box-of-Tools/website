/**
 * What two admitted devices say about their folders, and the runs that move
 * files between them. session.js hands this a link once the host has approved
 * the guest; this hands main.js a view to draw whenever anything changes.
 *
 * Both sides do the same thing in the same order: announce the folder, send
 * its listing, fingerprint any file the two listings cannot tell apart, and
 * show the plan. Either side may press Sync. The plan travels with the
 * request, and the other side checks every action against its own listing
 * and its own mode before a byte moves, so what one device decides never
 * outranks what the other allowed.
 */
import { splitParts, listRows, readListRows, readKeyRows, readHashRows, readActionRows } from './listing.js';
import { comparePlan, needsCheck, acceptActions, planActions } from './plan.js';
import { createSource, createSink } from './transfer.js';
import { fingerprint } from './fingerprint.js';
import { FILES, makeRunId } from './protocol.js';

// Progress arrives per 64 KiB chunk; the page needs a few pictures a second.
const PAINT = 200;

export class SyncLink {
  constructor({ link, folder, onChange = () => {}, onFail = () => {}, makeId = makeRunId, hash = fingerprint,
    // Wrapped: stored as a property and called as one, the browser's own
    // setTimeout refuses to run with this object as its receiver.
    later = (callback, delay) => setTimeout(callback, delay), cancelTimer = (timer) => clearTimeout(timer) }) {
    Object.assign(this, { link, folder, onChange, onFail, makeId, hash, later, cancelTimer });
    this.role = link.role;
    this.mine = this.role === 'host' ? 0 : 1;
    this.closed = false;
    this.localGen = 0;
    this.remote = { gen: 0, entries: null, meta: null, incoming: null, incomingGen: 0 };
    // Pairs of entries known to hold the same bytes, for as long as this link
    // lasts: [host size, host date, guest size, guest date] by path.
    this.same = new Map();
    this.memo = new Map();
    this.hashing = Promise.resolve();
    this.check = null;
    this.answer = null;
    this.incoming = null;
    this.plan = null;
    this.phase = 'listing';
    this.pending = null;
    this.run = null;
    this.early = null;
    this.last = null;
    this.error = null;
    this.scanning = false;
    this.paint = null;
    this.cancelled = new Set();
  }

  live() { return !this.closed && this.link.current(); }
  send(type, values = {}) { return this.live() && this.link.send(type, values); }
  gens() { return this.role === 'host' ? [this.localGen, this.remote.gen] : [this.remote.gen, this.localGen]; }
  sameGens(gens) { const mine = this.gens(); return gens[0] === mine[0] && gens[1] === mine[1]; }

  start() { this.sendListing(); }

  close() {
    if (this.closed) return;
    const run = this.run;
    this.closed = true;
    this.cancelTimer(this.paint);
    this.early?.close();
    this.early = null;
    if (run) {
      run.sink?.cancel();
      run.source?.stop();
      this.run = null;
    }
  }

  fail() {
    if (this.closed) return;
    this.close();
    this.onFail();
  }

  sendListing() {
    const entries = this.folder.entries();
    this.localGen += 1;
    const gen = this.localGen;
    this.send('folder', { name: this.folder.name().slice(0, 255), mode: this.folder.mode(), into: this.folder.into(),
      files: entries.size, bytes: this.folder.bytes() });
    const parts = splitParts(listRows(entries));
    parts.forEach((part, index) => this.send('list', { gen, part, done: index === parts.length - 1 }));
    this.recompute();
  }

  receive(message) {
    if (!this.live()) return;
    switch (message.type) {
      case 'folder':
        this.remote.meta = { name: message.name, mode: message.mode, into: message.into, files: message.files, bytes: message.bytes };
        this.recompute();
        break;
      case 'list': this.takeList(message); break;
      case 'rescan': if (!this.run && !this.pending) void this.rescan(false); break;
      case 'hash-request': this.takeHashRequest(message); break;
      case 'hashes': this.takeHashes(message); break;
      case 'sync': void this.takeSync(message); break;
      case 'sync-ok':
        if (this.pending?.id === message.id) {
          const { id, accepted } = this.pending;
          this.pending = null;
          this.begin(id, accepted);
        }
        break;
      case 'sync-no':
        if (this.pending?.id === message.id) {
          this.pending = null;
          this.error = `refused.${message.reason}`;
          this.closeEarly();
          this.recompute();
        }
        break;
      case 'sync-cancel':
        if (this.run?.id === message.id) this.finish('cancelled', false);
        else if (this.pending?.id === message.id) { this.pending = null; this.closeEarly(); this.recompute(); }
        else {
          // Withdrawn while this side was still deciding: never start it.
          if (this.cancelled.size >= 16) this.cancelled.clear();
          this.cancelled.add(message.id);
        }
        break;
      case 'sync-done':
        if (this.run?.id === message.id) {
          this.run.peerDone = true;
          this.run.peerResult = { received: message.received, failed: message.failed };
          this.settle(this.run);
        }
        break;
    }
  }

  takeList({ gen, part, done }) {
    const remote = this.remote;
    if (gen <= remote.gen || gen < remote.incomingGen) return;
    if (gen > remote.incomingGen) {
      remote.incomingGen = gen;
      remote.incoming = new Map();
    }
    if (!remote.incoming || !readListRows(part, remote.incoming)) { this.fail(); return; }
    if (!done) return;
    remote.entries = remote.incoming;
    remote.gen = gen;
    remote.incoming = null;
    this.recompute();
  }

  remember(key, mine, theirs) {
    const [host, guest] = this.role === 'host' ? [mine, theirs] : [theirs, mine];
    this.same.set(key, [host.size, host.mtime, guest.size, guest.mtime]);
  }

  isSame(key, mine, theirs) {
    const pair = this.same.get(key);
    if (!pair) return false;
    const [host, guest] = this.role === 'host' ? [mine, theirs] : [theirs, mine];
    return host.size === pair[0] && host.mtime === pair[1] && guest.size === pair[2] && guest.mtime === pair[3];
  }

  recompute() {
    if (!this.live() || this.run || this.pending) return;
    if (!this.localGen || !this.remote.gen || !this.remote.meta || this.scanning) {
      this.phase = 'listing';
      this.changed();
      return;
    }
    const local = this.folder.entries(), remote = this.remote.entries;
    const generations = this.gens().join(':');
    if (this.check?.gens !== generations) {
      const keys = needsCheck(local, remote, (key, mine, theirs) => this.isSame(key, mine, theirs));
      this.check = { gens: generations, keys, local: new Map(), remote: new Map(), incoming: null };
      if (keys.length) this.startCheck(this.check);
    }
    const check = this.check;
    if (check.local.size < check.keys.length || check.remote.size < check.keys.length) {
      this.phase = 'checking';
      this.changed();
      return;
    }
    const hashes = new Map();
    for (const key of check.keys) {
      const pair = { local: check.local.get(key), remote: check.remote.get(key) };
      hashes.set(key, pair);
      // Equal contents settle the question for as long as neither copy changes.
      if (pair.local && pair.local === pair.remote) this.remember(key, local.get(key), remote.get(key));
    }
    this.plan = comparePlan({ local, remote, localMode: this.folder.mode(), remoteMode: this.remote.meta.mode, hashes,
      same: (key, mine, theirs) => this.isSame(key, mine, theirs) });
    this.phase = 'ready';
    this.changed();
  }

  startCheck(check) {
    const gens = this.gens();
    const parts = splitParts(check.keys);
    parts.forEach((part, index) => this.send('hash-request', { gens, part, done: index === parts.length - 1 }));
    for (const key of check.keys) {
      this.fingerprintLocal(key).then((value) => {
        if (this.check !== check || !this.live()) return;
        check.local.set(key, value);
        this.checked(check);
      });
    }
  }

  checked(check) {
    if (check.local.size >= check.keys.length && check.remote.size >= check.keys.length) this.recompute();
    else this.tick();
  }

  // One file at a time: two reads of one disk at once are slower than one after the other.
  fingerprintLocal(key) {
    const entry = this.folder.entries().get(key);
    if (!entry) return Promise.resolve(null);
    const memo = `${key}\n${entry.size}\n${entry.mtime}`;
    if (!this.memo.has(memo)) {
      const work = this.hashing.then(async () => {
        if (!this.live()) return null;
        return this.hash(await this.folder.read(entry));
      }).catch(() => null);
      this.hashing = work;
      this.memo.set(memo, work);
    }
    return this.memo.get(memo);
  }

  takeHashRequest({ gens, part, done }) {
    const generations = gens.join(':');
    if (this.answer?.gens !== generations) this.answer = { gens: generations, keys: new Set() };
    if (!readKeyRows(part, this.answer.keys)) { this.fail(); return; }
    if (!done) return;
    const keys = [...this.answer.keys];
    this.answer = null;
    // Asked about a listing this side has since replaced: the new listing is
    // already on its way, and the question will be asked again about it.
    if (gens[this.mine] !== this.localGen) return;
    Promise.all(keys.map((key) => this.fingerprintLocal(key))).then((values) => {
      if (!this.live() || gens[this.mine] !== this.localGen) return;
      const parts = splitParts(keys.map((key, index) => [key, values[index] ?? null]));
      parts.forEach((rows, index) => this.send('hashes', { gens, part: rows, done: index === parts.length - 1 }));
    });
  }

  takeHashes({ gens, part, done }) {
    const check = this.check;
    if (!check || check.gens !== gens.join(':')) return;
    check.incoming ??= new Map();
    if (!readHashRows(part, check.incoming)) { this.fail(); return; }
    if (!done) return;
    for (const key of check.keys) check.remote.set(key, check.incoming.get(key) ?? null);
    check.incoming = null;
    this.checked(check);
  }

  /** Ask the other side to run the plan as shown here, with the visitor's choices applied. */
  syncNow(overrides = new Map()) {
    if (!this.live() || this.phase !== 'ready' || !this.plan || this.run || this.pending || this.scanning) return false;
    const actions = new Map(planActions(this.plan, overrides, this.role));
    if (!actions.size) return false;
    const accepted = acceptActions({ actions, local: this.folder.entries(), remote: this.remote.entries, role: this.role,
      localMode: this.folder.mode(), remoteMode: this.remote.meta.mode });
    if (!accepted) return false;
    const id = this.makeId();
    const gens = this.gens();
    this.pending = { id, accepted };
    this.error = null;
    this.phase = 'asking';
    const parts = splitParts([...actions]);
    parts.forEach((part, index) => this.send('sync', { id, gens, part, done: index === parts.length - 1 }));
    this.changed();
    return true;
  }

  refuse(id, reason) {
    this.send('sync-no', { id, reason });
    this.recompute();
  }

  async takeSync({ id, gens, part, done }) {
    if (this.incoming?.id !== id) this.incoming = { id, actions: new Map() };
    if (!readActionRows(part, this.incoming.actions)) { this.fail(); return; }
    if (!done) return;
    const { actions } = this.incoming;
    this.incoming = null;
    // Both pressed Sync at once: the host's run goes first, and the guest's
    // own request is refused by the host as busy.
    if (this.run || this.scanning || (this.pending && this.role === 'host')) { this.send('sync-no', { id, reason: 'busy' }); return; }
    if (this.pending) { this.pending = null; this.closeEarly(); }
    if (!this.sameGens(gens) || !this.remote.meta) { this.refuse(id, 'stale'); return; }
    const accepted = acceptActions({ actions, local: this.folder.entries(), remote: this.remote.entries, role: this.role,
      localMode: this.folder.mode(), remoteMode: this.remote.meta.mode });
    if (!accepted) { this.refuse(id, 'invalid'); return; }
    // The other side cannot ask the browser for this page's permission to
    // write; only a click here can. Without it, say so rather than fail later.
    if (accepted.receive.length && !(await this.folder.writable())) { this.refuse(id, 'permission'); return; }
    if (this.cancelled.has(id)) { this.recompute(); return; }
    if (!this.live() || this.run || this.pending || this.scanning || !this.sameGens(gens)) { this.refuse(id, 'stale'); return; }
    this.send('sync-ok', { id });
    this.begin(id, accepted);
  }

  begin(id, { receive, send }) {
    if (!this.live()) return;
    const entries = this.folder.entries();
    const items = receive.map((entry) => ({ key: entry.key, path: entry.path, size: entry.size, mtime: entry.mtime }));
    const run = this.run = {
      id, items, send, served: new Set(),
      receiveTotal: items.reduce((total, item) => total + item.size, 0),
      sendTotal: [...send].reduce((total, key) => total + (entries.get(key)?.size ?? 0), 0),
      received: 0, sent: 0, copied: 0, failed: [],
      receiving: items.length > 0, peerDone: false, peerResult: null, source: null, sink: null,
    };
    this.error = null;
    this.last = null;
    this.phase = 'syncing';
    if (send.size) {
      run.source = createSource({
        channel: this.link.lane(FILES + id),
        current: () => this.run === run && this.live(),
        // Each agreed file once: a second request for it is not part of the run.
        lookup: (key) => {
          if (!run.send.has(key) || run.served.has(key)) return null;
          run.served.add(key);
          return this.folder.entries().get(key) ?? null;
        },
        read: (entry) => this.folder.read(entry),
        onSent: (key, bytes) => { run.sent += bytes; this.tick(); },
        onStored: (key, mtime) => {
          const mine = this.folder.entries().get(key);
          if (mine) this.remember(key, mine, { size: mine.size, mtime });
        },
        onError: () => this.abort(run),
      });
    }
    const early = this.early;
    this.early = null;
    if (!run.receiving) {
      early?.close();
      this.send('sync-done', { id, received: 0, failed: 0 });
    } else if (early?.label === FILES + id) this.adopt(run, early);
    else early?.close();
    this.changed();
  }

  /** A lane the other side opened. It can arrive before that side's sync-ok, so one is held. */
  acceptLane(channel) {
    const run = this.run;
    if (!this.live()) { channel.close(); return; }
    if (run && channel.label === FILES + run.id) {
      if (run.receiving && !run.sink) this.adopt(run, channel);
      else channel.close();
      return;
    }
    if (!run && this.pending && channel.label === FILES + this.pending.id && !this.early) { this.early = channel; return; }
    channel.close();
  }

  closeEarly() {
    this.early?.close();
    this.early = null;
  }

  adopt(run, channel) {
    run.sink = createSink({
      channel, items: run.items, writer: this.folder.writer(),
      current: () => this.run === run && this.live(),
      onProgress: (bytes) => { run.received += bytes; this.tick(); },
      onFile: (item, reason, stored) => {
        if (reason) run.failed.push({ path: item.path, reason });
        else {
          run.copied += 1;
          if (stored?.mtime != null) this.remember(item.key, { size: stored.size, mtime: stored.mtime }, item);
        }
        this.tick();
      },
      onDone: () => {
        run.receiving = false;
        this.send('sync-done', { id: run.id, received: run.copied, failed: run.failed.length });
        this.settle(run);
      },
      onError: () => this.abort(run),
    });
  }

  settle(run) {
    if (this.run === run && !run.receiving && run.peerDone) this.finish('done', false);
  }

  abort(run) {
    if (this.run === run) this.finish('failed', true);
  }

  cancel() {
    if (this.run) this.finish('cancelled', true);
    else if (this.pending) {
      this.send('sync-cancel', { id: this.pending.id });
      this.pending = null;
      this.closeEarly();
      this.recompute();
    }
  }

  finish(outcome, tell) {
    const run = this.run;
    if (!run) return;
    if (tell) this.send('sync-cancel', { id: run.id });
    this.run = null;
    run.sink?.cancel();
    run.source?.stop();
    this.last = {
      outcome, copied: run.copied, failed: run.failed, receivedBytes: run.received, sentBytes: run.sent,
      delivered: run.peerResult?.received ?? null, undelivered: run.peerResult?.failed ?? null,
    };
    this.phase = 'done';
    this.changed();
    // Writing gave every received file today's date. Read both folders again
    // so the next plan starts from what is really there now.
    void this.rescan(false);
  }

  async rescan(ask) {
    if (!this.live() || this.run || this.pending || this.scanning) return;
    this.scanning = true;
    this.plan = null;
    this.phase = 'listing';
    this.changed();
    if (ask) this.send('rescan');
    let failed = false;
    try { await this.folder.rescan(); } catch { failed = true; }
    this.scanning = false;
    if (!this.live()) return;
    if (failed) this.error = 'error.rescan';
    this.sendListing();
  }

  tick() {
    if (this.paint !== null || this.closed) return;
    this.paint = this.later(() => { this.paint = null; this.changed(); }, PAINT);
  }

  changed() {
    if (this.closed) return;
    this.onChange(this.view());
  }

  view() {
    const run = this.run, check = this.check;
    return {
      phase: this.phase,
      gens: this.gens().join(':'),
      remote: this.remote.meta,
      plan: this.phase === 'ready' ? this.plan : null,
      checking: this.phase === 'checking' && check
        ? { done: Math.min(check.local.size, check.remote.size), total: check.keys.length } : null,
      run: run ? {
        receiveTotal: run.receiveTotal, received: run.received, sendTotal: run.sendTotal, sent: run.sent,
        files: run.items.length, copied: run.copied, failed: run.failed.length, outgoing: run.send.size,
      } : null,
      last: this.last,
      error: this.error,
    };
  }
}
