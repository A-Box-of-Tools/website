import test from 'node:test';
import assert from 'node:assert/strict';
import { SyncLink } from '../../tools/folder-sync/src/sync.js';
import { PROTOCOL, FILES, controlMessage } from '../../tools/folder-sync/src/protocol.js';

class Lane {
  constructor(label) {
    Object.assign(this, { label, readyState: 'open', bufferedAmount: 0, binaryType: 'blob', listeners: new Map(), peer: null });
  }
  addEventListener(type, listener) { (this.listeners.get(type) ?? this.listeners.set(type, []).get(type)).push(listener); }
  dispatch(type, event = {}) { for (const listener of [...(this.listeners.get(type) ?? [])]) listener(event); }
  send(data) {
    if (this.readyState !== 'open') throw new Error('closed');
    const copy = typeof data === 'string' ? data : data.slice(0);
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

const other = (role) => (role === 'host' ? 'guest' : 'host');

// Two admitted links, each frame checked by the same validator the session applies.
function linkPair() {
  const sides = {};
  const make = (role) => ({
    role,
    current: () => true,
    send(type, values) {
      const message = controlMessage(JSON.stringify({ protocol: PROTOCOL, type, ...values }));
      assert.ok(message, `${role} sent a ${type} frame the other side would refuse`);
      setImmediate(() => sides[other(role)]?.receive(message));
      return true;
    },
    lane(label) {
      const mine = new Lane(label), theirs = new Lane(label);
      mine.peer = theirs;
      theirs.peer = mine;
      setImmediate(() => sides[other(role)]?.acceptLane(theirs));
      return mine;
    },
  });
  return { sides, host: make('host'), guest: make('guest') };
}

const encoder = new TextEncoder();
let clock = 1_800_000_000_000;

// A folder as sync.js sees one. Writing gives a file a new date, as a browser's write does.
function memoryFolder(name, files, mode = 'both') {
  const store = new Map(Object.entries(files).map(([path, [text, mtime]]) => [path, { data: encoder.encode(text), mtime }]));
  let entries = new Map();
  const scan = () => { entries = new Map([...store].map(([key, { data, mtime }]) => [key, { key, path: key, size: data.length, mtime }])); };
  scan();
  return {
    store,
    name: () => name,
    mode: () => mode,
    into: () => 'folder',
    entries: () => entries,
    bytes: () => [...entries.values()].reduce((total, entry) => total + entry.size, 0),
    read: async (entry) => new File([store.get(entry.key).data], entry.key, { lastModified: store.get(entry.key).mtime }),
    writer: () => ({
      async open(path, size) {
        const parts = [];
        return {
          write(chunk) { parts.push(new Uint8Array(chunk)); },
          close() {
            const data = new Uint8Array(size);
            let at = 0;
            for (const part of parts) { data.set(part, at); at += part.length; }
            clock += 1000;
            store.set(path, { data, mtime: clock });
            return { size, mtime: clock };
          },
          abort() {},
        };
      },
    }),
    writable: async () => true,
    rescan: async () => scan(),
  };
}

async function until(predicate, label) {
  for (let i = 0; i < 2000; i += 1) {
    if (predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 1));
  }
  assert.fail(`timed out waiting for ${label}`);
}

function devices(hostFiles, guestFiles, { hostMode = 'both', guestMode = 'both' } = {}) {
  const hostFolder = memoryFolder('Shared', hostFiles, hostMode);
  const guestFolder = memoryFolder('Shared', guestFiles, guestMode);
  const { sides, host, guest } = linkPair();
  const views = { host: null, guest: null };
  sides.host = new SyncLink({ link: host, folder: hostFolder, onChange: (view) => { views.host = view; }, onFail: () => assert.fail('host failed') });
  sides.guest = new SyncLink({ link: guest, folder: guestFolder, onChange: (view) => { views.guest = view; }, onFail: () => assert.fail('guest failed') });
  sides.host.start();
  sides.guest.start();
  const ready = () => views.host?.phase === 'ready' && views.guest?.phase === 'ready';
  return { sides, views, hostFolder, guestFolder, ready };
}

const text = (folder, path) => new TextDecoder().decode(folder.store.get(path)?.data ?? new Uint8Array());

test('two devices compare, sync both ways, and then agree without moving a byte twice', async () => {
  const { sides, views, hostFolder, guestFolder, ready } = devices(
    { 'a.txt': ['only on the host', 100], 'same.txt': ['identical', 100], 'newer.txt': ['edited on the host later', 300], 'Case.txt': ['A', 100] },
    { 'b/c.txt': ['only on the guest', 100], 'same.txt': ['identical', 200], 'newer.txt': ['older', 200], 'case.txt': ['b', 100] },
  );
  await until(ready, 'both plans');
  const rows = Object.fromEntries(views.host.plan.rows.map((row) => [row.key, row]));
  assert.equal(rows['a.txt'].action, 'send');
  assert.equal(rows['b/c.txt'].action, 'receive');
  assert.equal(rows['newer.txt'].kind, 'newer-here');
  assert.equal(rows['Case.txt'].kind, 'case');
  assert.equal(rows['same.txt'], undefined, 'equal contents under two dates are recognised by fingerprint');
  const mirrored = Object.fromEntries(views.guest.plan.rows.map((row) => [row.key, row.action]));
  assert.deepEqual(mirrored, { 'Case.txt': 'skip', 'a.txt': 'receive', 'b/c.txt': 'send', 'case.txt': 'skip', 'newer.txt': 'receive' });

  assert.equal(sides.host.syncNow(), true);
  await until(() => views.host.last?.outcome === 'done' && views.guest.last?.outcome === 'done' && ready(), 'the run and the comparison after it');
  assert.equal(views.host.last.copied, 1);
  assert.equal(views.host.last.delivered, 2);
  assert.equal(views.guest.last.copied, 2);
  for (const path of ['a.txt', 'b/c.txt', 'newer.txt', 'same.txt']) assert.equal(text(hostFolder, path), text(guestFolder, path), path);
  assert.equal(text(guestFolder, 'newer.txt'), 'edited on the host later');
  assert.equal(text(guestFolder, 'case.txt'), 'b');
  assert.equal(guestFolder.store.has('Case.txt'), false);
  // Written copies carry new dates; the pairs remembered from the run say they are equal.
  assert.deepEqual(views.host.plan.rows.map((row) => row.key), ['Case.txt', 'case.txt']);
  assert.equal(views.host.plan.identical, 4);
});

test('when both devices press Sync at once, the host goes first and the files still move once', async () => {
  const { sides, views, hostFolder, guestFolder, ready } = devices({ 'h.txt': ['from the host', 100] }, { 'g.txt': ['from the guest', 100] });
  await until(ready, 'both plans');
  assert.equal(sides.guest.syncNow(), true);
  assert.equal(sides.host.syncNow(), true);
  await until(() => views.host.last?.outcome === 'done' && views.guest.last?.outcome === 'done' && ready(), 'one run');
  assert.equal(text(hostFolder, 'g.txt'), 'from the guest');
  assert.equal(text(guestFolder, 'h.txt'), 'from the host');
  assert.deepEqual(views.host.plan.rows, []);
});

test('a device set to Send only refuses any plan that would write into it', async () => {
  const guestFolder = memoryFolder('Mine', { 'keep.txt': ['do not touch', 100] }, 'send');
  const sent = [];
  const guest = new SyncLink({
    link: { role: 'guest', current: () => true, send: (type, values) => { sent.push({ type, ...values }); return true; }, lane: () => assert.fail('no lane') },
    folder: guestFolder,
  });
  guest.start();
  // What a misbehaving host might send: its listing, then a plan writing into the guest.
  guest.receive({ protocol: PROTOCOL, type: 'folder', name: 'Theirs', mode: 'both', into: 'folder', files: 1, bytes: 4 });
  guest.receive({ protocol: PROTOCOL, type: 'list', gen: 1, part: [['keep.txt', 4, 999]], done: true });
  const id = 'c'.repeat(32);
  await guest.takeSync({ id, gens: [1, 1], part: [['keep.txt', 'guest']], done: true });
  assert.deepEqual(sent.at(-1), { type: 'sync-no', id, reason: 'invalid' });
  assert.equal(guest.run, null);
  assert.equal(text(guestFolder, 'keep.txt'), 'do not touch');
  // A lane for a run that was never agreed is closed, not read.
  const lane = new Lane(`${FILES}${id}`);
  lane.peer = new Lane(lane.label);
  guest.acceptLane(lane);
  assert.equal(lane.readyState, 'closed');
});
