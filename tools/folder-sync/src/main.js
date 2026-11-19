import { SyncSession } from './session.js';
import { SyncLink } from './sync.js';
import { makeCode, parseCode, inviteLink } from './protocol.js';
import { folderSupport, readDirectory, readFileList, emptyFolder, fileOf, folderWriter, zipCollector, ZIP_LIMIT } from './folder.js';
import { MAX_FILES } from './listing.js';
import { chosen, summarize } from './plan.js';
import { phrase } from './shared/phrases.js';
import { sizeText } from './shared/format.js';
import { clipboardFeedback } from './shared/clipboard-feedback.js';
import { watchDiscovery } from './shared/peer-discovery.js';
import { rendezvousEndpoint } from './shared/peer-endpoint.js';
import { createDiscoveryGroupControl, appendConnectionIcons } from './shared/peer-discovery-ui.js';
import { createApprovalPrompt } from './shared/peer-approval-ui.js';
import { createRequestSignal, KNOCK } from './shared/peer-request-signal.js';
import { createChime } from './shared/chime.js';
import { makeZip } from './shared/zip.js';
import { saveBlob } from './shared/download.js';

const $ = (id) => document.getElementById(id);
// A plan of thousands of rows is still one decision per row; past this many,
// drawing them all only slows the page, and the rest keep their defaults.
const MAX_ROWS = 500;
const support = folderSupport();
const lang = document.documentElement.lang || undefined;
const numbers = new Intl.NumberFormat(lang);
const dates = new Intl.DateTimeFormat(lang, { dateStyle: 'medium', timeStyle: 'short' });
const names = new Intl.Collator(lang, { numeric: true, sensitivity: 'base' });
const size = (n) => sizeText(n, phrase, { under: 'size.bytes', kb: 'auto', mb: 1, gb: 'size.gb' });
const fileCount = (n) => phrase(n === 1 ? 'count.file' : 'count.files', { n: numbers.format(n) });
const canConnect = globalThis.isSecureContext && typeof globalThis.RTCPeerConnection === 'function';

let role = null;
let invitation = '';
let revision = 0;
let folderRevision = 0;
let reading = false;
let pageSuspended = false;
let waitingRequests = [];
let partner = null;
let discovery = null;
let discoveryPublication = null;
let nearbyShares = [];
let discoveryState = 'idle';
let browsingNearby = false;
let sync = null;
let view = null;
let overrides = new Map();
let overridesFor = '';
const folder = { kind: null, handle: null, ...emptyFolder(), zip: zipCollector() };

const terminal = new Set([
  'connection.server-failed', 'connection.not-found', 'connection.taken', 'connection.busy',
  'connection.ended', 'connection.invalid', 'connection.direct-failed', 'connection.lost', 'guest.denied',
]);

function status(id, key, error = false, values = {}) {
  $(id).textContent = key ? phrase(key, values) : '';
  $(id).dataset.error = String(error);
}

function knownPhrase(key) {
  return typeof key === 'string' && [...document.querySelectorAll('#phrases [data-phrase]')].some((element) => element.dataset.phrase === key);
}

// The folder ------------------------------------------------------------

function mode() { return document.querySelector('input[name="sync-mode"]:checked')?.value ?? 'both'; }
function setMode(value) { const input = document.querySelector(`input[name="sync-mode"][value="${value}"]`); if (input) input.checked = true; }
const receives = (value) => value !== 'send';

function folderReady() { return folder.kind !== null && !reading; }

const adapter = {
  name: () => folder.name,
  mode,
  into: () => (folder.kind === 'handle' ? 'folder' : 'zip'),
  entries: () => folder.entries,
  bytes: () => folder.bytes,
  read: (entry) => fileOf(entry),
  writer: () => (folder.kind === 'handle' ? folderWriter(folder.handle) : folder.zip),
  async writable() {
    if (folder.kind !== 'handle') return true;
    try { return (await folder.handle.queryPermission({ mode: 'readwrite' })) === 'granted'; } catch { return false; }
  },
  async rescan() {
    // A snapshot from the folder input cannot be read again; only a handle can.
    if (folder.kind !== 'handle') return;
    const result = await readDirectory(folder.handle);
    Object.assign(folder, result);
    showFolder();
  },
};

function showFolder() {
  if (folder.kind === 'none') status('folder-status', 'folder.receive-only');
  else if (folder.kind) status('folder-status', 'folder.ready', false, { name: folder.name || phrase('folder.unnamed'), count: fileCount(folder.entries.size), size: size(folder.bytes) });
  else status('folder-status', 'folder.none');
  const list = $('folder-skipped-list');
  list.replaceChildren();
  $('folder-skipped').hidden = !folder.skippedCount;
  if (folder.skippedCount) {
    $('folder-skipped-summary').textContent = phrase('folder.skipped', { count: numbers.format(folder.skippedCount) });
    for (const { path, reason } of folder.skipped) {
      const item = document.createElement('li');
      item.textContent = phrase('skip.item', { path, reason: phrase(`skip.${reason}`) });
      list.append(item);
    }
    if (folder.skippedCount > folder.skipped.length) {
      const item = document.createElement('li');
      item.textContent = phrase('folder.skipped-more', { count: numbers.format(folder.skippedCount - folder.skipped.length) });
      list.append(item);
    }
  }
  updateControls();
}

function showSupport() {
  const note = folder.kind === 'none' ? 'support.none' : folder.kind === 'files' ? 'support.zip' : null;
  $('folder-support').hidden = !note;
  if (note) $('folder-support').textContent = phrase(note, { limit: sizeText(ZIP_LIMIT, phrase, { mb: 0 }) });
}

async function chooseFolder() {
  if (role || reading) return;
  if (!support.directory) { $('folder-input').click(); return; }
  let handle;
  try {
    // Asking for write access here, inside the click, is what lets a later
    // sync started from the other device write without asking again.
    handle = await window.showDirectoryPicker({ id: 'folder-sync', mode: receives(mode()) ? 'readwrite' : 'read' });
  } catch (error) {
    if (error?.name !== 'AbortError') status('folder-status', 'folder.denied', true);
    return;
  }
  await loadFolder('handle', handle, (current) => readDirectory(handle, {
    current, progress: (files) => { if (current()) status('folder-status', 'folder.reading', false, { count: fileCount(files) }); },
  }));
}

async function loadFolder(kind, handle, read) {
  const owner = ++folderRevision;
  const current = () => owner === folderRevision;
  reading = true;
  status('folder-status', 'folder.reading', false, { count: fileCount(0) });
  updateControls();
  try {
    const result = await read(current);
    if (!current()) return;
    Object.assign(folder, { kind, handle }, result);
    folder.zip.clear();
    showSupport();
    showFolder();
  } catch (error) {
    if (!current()) return;
    status('folder-status', error?.message === 'folder.too-many' ? 'folder.too-many' : 'folder.failed', true, { max: numbers.format(MAX_FILES) });
  } finally {
    if (current()) { reading = false; updateControls(); }
  }
}

$('folder-choose').addEventListener('click', chooseFolder);
$('folder-input').addEventListener('change', () => {
  const files = [...$('folder-input').files];
  $('folder-input').value = '';
  if (!files.length || role) return;
  void loadFolder('files', null, async () => readFileList(files));
});
for (const input of document.querySelectorAll('input[name="sync-mode"]')) {
  input.addEventListener('change', async () => {
    if (folder.kind !== 'handle' || !receives(mode())) { updateControls(); return; }
    let state = 'denied';
    try { state = await folder.handle.requestPermission({ mode: 'readwrite' }); } catch {}
    if (state !== 'granted') {
      setMode('send');
      status('folder-status', 'folder.write-denied', true);
    }
    updateControls();
  });
}

// Discovery -------------------------------------------------------------

const requestSignal = createRequestSignal({
  panel: $('request-panel'),
  sound: { chime: createChime(KNOCK), toggle: $('pairing-request-sound') },
});
const approvalPrompt = createApprovalPrompt({
  dialog: $('pairing-request-dialog'),
  signal: requestSignal,
  isActive: () => role === 'host' && !pageSuspended,
  canApprove: () => session.partnerCount === 0,
  onApprove: (id) => session.approve(id),
  onDeny: (id) => session.deny(id),
  focusFallback: (id) => [...$('guest-requests').querySelectorAll('button')].find((button) => button.dataset.peer === id && !button.disabled) ?? $('host-stop'),
});
const groupControl = createDiscoveryGroupControl({ root: document, onChange() {
  closeDiscovery();
  browsingNearby = true;
  startDiscovery();
  updateControls();
} });

function renderDiscovery() {
  const list = $('discovery-list');
  const focused = document.activeElement?.dataset.code;
  list.replaceChildren();
  for (const share of nearbyShares) {
    const code = parseCode(share.code);
    if (!code || code !== share.code || share.transport === 'relay' || (code === session.code && role === 'host')) continue;
    const item = document.createElement('li');
    item.className = 'paired-nearby-row';
    const label = document.createElement('code');
    label.textContent = code;
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.code = code;
    button.textContent = phrase('discovery.join');
    button.setAttribute('aria-label', phrase('discovery.join-direct', { code }));
    button.disabled = Boolean(role) || pageSuspended;
    button.addEventListener('click', () => {
      if (role || pageSuspended || !browsingNearby || !nearbyShares.some((entry) => entry.code === code)) return;
      $('guest-code').value = code;
      void connectGuest();
      if (role === 'guest') $('guest-stop').focus();
    });
    item.append(label);
    appendConnectionIcons(item, { transport: 'direct', approval: true });
    item.append(button);
    list.append(item);
  }
  const key = discoveryState === 'ready' ? (list.children.length ? 'discovery.found' : 'discovery.empty') : `discovery.${discoveryState}`;
  status('discovery-status', key, discoveryState === 'unavailable');
  if (focused) [...list.querySelectorAll('button')].find((button) => button.dataset.code === focused)?.focus({ preventScroll: true });
}

function startDiscovery() {
  if (discovery || pageSuspended || !canConnect) return;
  discovery = watchDiscovery(`${rendezvousEndpoint()}/discover?tool=folder-sync`, {
    list(shares) { nearbyShares = shares; renderDiscovery(); },
    status(state) { discoveryState = state; renderDiscovery(); },
    publication(state) { status('host-publication-status', state ? `discovery.${state}` : '', state === 'not-published'); },
  }, { group: groupControl.code() });
}

function closeDiscovery() {
  discovery?.unpublish();
  discovery?.close();
  discovery = null;
  browsingNearby = false;
  nearbyShares = [];
  discoveryState = 'idle';
  renderDiscovery();
}

function publishDiscovery() {
  if (!discoveryPublication || role !== 'host' || !$('host-discoverable').checked || pageSuspended) {
    discovery?.unpublish();
    return;
  }
  startDiscovery();
  discovery?.publish(discoveryPublication.code, discoveryPublication.lease);
}

// The session -------------------------------------------------------------

function listFocus(list) {
  const button = document.activeElement;
  return list.contains(button) && button?.dataset.peer && button?.dataset.action
    ? { peer: button.dataset.peer, action: button.dataset.action } : null;
}

function restoreListFocus(list, focused) {
  if (!focused) return;
  [...list.querySelectorAll('button')].find((item) => !item.disabled && item.dataset.peer === focused.peer
    && item.dataset.action === focused.action)?.focus({ preventScroll: true });
}

function renderRequests(requests) {
  waitingRequests = requests;
  const list = $('guest-requests');
  const focused = listFocus(list);
  list.replaceChildren();
  $('request-panel').hidden = requests.length === 0;
  for (const request of requests) {
    const item = document.createElement('li');
    const note = document.createElement('p');
    note.textContent = request.note || phrase('host.unnamed');
    const actions = document.createElement('div');
    actions.className = 'run-row';
    for (const [key, action] of [['host.approve', () => session.approve(request.id)], ['host.deny', () => session.deny(request.id)]]) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = phrase(key);
      button.disabled = key === 'host.approve' && session.partnerCount > 0;
      button.dataset.peer = request.id;
      button.dataset.action = key;
      button.addEventListener('click', () => { approvalPrompt.close(false); action(); });
      actions.append(button);
    }
    item.append(note, actions);
    list.append(item);
  }
  restoreListFocus(list, focused);
  approvalPrompt.update(requests.map((request) => ({ id: request.id, name: request.note || phrase('host.unnamed') })));
}

function renderPartner(current) {
  partner = current;
  const list = $('partner-list');
  const focused = listFocus(list);
  list.replaceChildren();
  $('partner-panel').hidden = !current;
  if (current) {
    const item = document.createElement('li');
    const note = document.createElement('p');
    note.textContent = current.note || phrase('host.unnamed');
    const state = document.createElement('p');
    state.className = 'field-note';
    state.textContent = phrase(current.linked ? 'host.partner-linked' : 'host.partner-connecting');
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = phrase('host.disconnect');
    button.dataset.peer = current.id;
    button.dataset.action = 'host.disconnect';
    button.addEventListener('click', () => session.disconnectPartner(current.id));
    item.append(note, state, button);
    list.append(item);
  }
  restoreListFocus(list, focused);
  renderRequests(waitingRequests);
}

const session = new SyncSession({
  onDiscovery(publication) {
    discoveryPublication = publication;
    publishDiscovery();
  },
  onState(key, sessionRole) {
    if (key === 'connection.stopped' || !role || (sessionRole && sessionRole !== role)) return;
    const currentRole = role;
    status(currentRole === 'host' ? 'host-status' : 'guest-status', key, terminal.has(key) || key === 'host.lost');
    if (terminal.has(key) && currentRole === 'guest') stopAll(key, 'guest');
    else if (terminal.has(key) && currentRole === 'host' && !session.role) stopAll(key, 'host');
  },
  onRequests: renderRequests,
  onPeer: renderPartner,
  onLink(link) { if (link) openLink(link); else closeLink(); },
  onMessage(message) { sync?.receive(message); },
  onLane(channel) { if (sync) sync.acceptLane(channel); else channel.close(); },
});

function openLink(link) {
  closeLink();
  overrides = new Map();
  overridesFor = '';
  $('side-there-label').textContent = link.note ? phrase('side.there', { note: link.note }) : phrase('side.other');
  sync = new SyncLink({
    link, folder: adapter, onChange: renderSync,
    onFail() {
      if (role === 'guest') stopAll('connection.invalid', 'guest');
      else if (partner) session.disconnectPartner(partner.id);
    },
  });
  $('sync-panel').hidden = false;
  sync.start();
}

function closeLink() {
  sync?.close();
  sync = null;
  view = null;
  drawnPlan = null;
  $('sync-panel').hidden = true;
  $('sync-rows').replaceChildren();
  updateControls();
}

const linkCopy = clipboardFeedback({
  read: () => ({ text: invitation }),
  current: (value) => role === 'host' && Boolean(value.text) && value.text === invitation,
  write: (value) => navigator.clipboard.writeText(value),
  done: () => status('copy-status', 'copy.done'),
  selected: () => {
    $('share-link').focus();
    $('share-link').select();
    status('copy-status', 'copy.manual');
  },
  restore: () => { $('copy-status').textContent = ''; },
});

function stopAll(key = 'connection.stopped', previousRole = role) {
  approvalPrompt.clear();
  revision += 1;
  role = null;
  invitation = '';
  discoveryPublication = null;
  closeDiscovery();
  linkCopy.invalidate();
  session.stop();
  closeLink();
  $('share-link').value = '';
  renderRequests([]);
  renderPartner(null);
  updateControls();
  if (previousRole) status(previousRole === 'host' ? 'host-status' : 'guest-status', key, terminal.has(key));
}

async function startHost() {
  if (role || !canConnect) return;
  if (!folderReady()) { status('host-status', 'host.need-folder', true); $('folder-choose').focus(); return; }
  stopAll();
  const owner = revision;
  role = 'host';
  // Here, inside the click, or the first request has no sound: see arm() in peer-request-signal.js.
  requestSignal.arm();
  updateControls();
  const code = makeCode();
  try {
    if ($('host-discoverable').checked) status('host-publication-status', 'discovery.not-published');
    await session.startHost(code, { discoverable: $('host-discoverable').checked, discoveryGroup: groupControl.id() });
    if (owner !== revision || role !== 'host') return;
    invitation = inviteLink(location.href, code);
    $('share-link').value = invitation;
    updateControls();
  } catch (error) {
    if (owner !== revision) return;
    const key = error.code || error.message;
    stopAll(knownPhrase(key) ? key : 'connection.server-failed', 'host');
  }
}

async function connectGuest() {
  if (role || !canConnect) return;
  if (!folderReady()) { status('guest-status', 'guest.folder-first', true); $('folder-choose').focus(); return; }
  const code = parseCode($('guest-code').value);
  if (!code) { status('guest-status', 'code.invalid', true); return; }
  const note = $('guest-note').value.trim();
  stopAll();
  const owner = revision;
  role = 'guest';
  $('guest-code').value = code;
  updateControls();
  try {
    await session.connect(code, note);
  } catch (error) {
    if (owner !== revision || role !== 'guest') return;
    const key = error.code || error.message;
    stopAll(knownPhrase(key) ? key : 'connection.server-failed', 'guest');
  }
}

function updateControls() {
  const hosting = role === 'host';
  const joined = role === 'guest';
  const busy = hosting || joined;
  const pickable = support.directory || support.input;
  groupControl.lock(busy);
  $('folder-choose').disabled = busy || reading || !pickable;
  for (const input of document.querySelectorAll('input[name="sync-mode"]')) {
    // Without a folder this device has nothing to send, so receiving is all it can do.
    input.disabled = busy || reading || (folder.kind === 'none' && input.value !== 'receive');
  }
  $('host-discoverable').disabled = busy || !canConnect;
  $('host-publication-status').hidden = !hosting || !$('host-discoverable').checked;
  $('nearby-section').hidden = joined;
  $('discovery-controls').hidden = busy;
  $('discovery-start').hidden = browsingNearby;
  $('discovery-start').disabled = !canConnect;
  $('discovery-panel').hidden = busy || !browsingNearby;
  $('host-start').disabled = busy || !canConnect || reading;
  $('host-stop').hidden = !hosting;
  $('guest-connect').disabled = busy || !canConnect || reading;
  $('guest-stop').hidden = !joined;
  $('guest-code').readOnly = busy;
  $('guest-note').readOnly = busy;
  $('host-invitation').hidden = !hosting || !invitation;
  requestSignal.host(hosting);
  renderDiscovery();
}

// Comparing and syncing ---------------------------------------------------

function sideText(meta, own) {
  if (!meta) return phrase('side.waiting');
  const count = fileCount(meta.files), bytes = size(meta.bytes);
  const name = meta.name || phrase('folder.unnamed');
  let text;
  if (own && folder.kind === 'none') text = phrase('side.none');
  else if (!own && meta.into === 'zip' && meta.files === 0) text = phrase('side.none');
  else text = phrase(meta.into === 'zip' ? 'side.zip' : 'side.folder', { name, count, size: bytes });
  return `${text} ${phrase(`side.mode.${meta.mode}`)}`;
}

function rowDetail(entry) {
  return entry ? phrase('row.detail', { size: size(entry.size), date: dates.format(new Date(entry.mtime)) }) : phrase('row.absent');
}

function actionLabel(row, action) {
  if (action === 'send') return phrase(row.there ? 'action.send-replace' : 'action.send');
  if (action === 'receive') return phrase(row.here ? 'action.receive-replace' : 'action.receive');
  return phrase('action.skip');
}

// A narrow screen stacks each row and names the side every cell describes;
// the names are the column headings, so they arrive translated with the page.
const columns = [...document.querySelectorAll('.sync-table thead th')].map((heading) => heading.textContent.trim());
function cell(column) {
  const element = document.createElement('td');
  element.setAttribute('role', 'cell');
  element.dataset.label = columns[column];
  return element;
}

function renderRows(plan) {
  const body = $('sync-rows');
  body.replaceChildren();
  // As a file manager lists them: page2 before page10, and Notes.txt beside notes.txt.
  const shown = [...plan.rows].sort((a, b) => names.compare(a.key, b.key) || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0))
    .slice(0, MAX_ROWS);
  for (const row of shown) {
    const line = document.createElement('tr');
    line.setAttribute('role', 'row');
    const file = document.createElement('th');
    file.scope = 'row';
    file.setAttribute('role', 'rowheader');
    const path = document.createElement('code');
    path.textContent = row.key;
    path.dir = 'ltr';
    const kind = document.createElement('span');
    kind.className = 'sync-kind';
    kind.dataset.kind = row.kind;
    kind.textContent = phrase(`kind.${row.kind}`);
    file.append(path, kind);
    const here = cell(1);
    here.textContent = rowDetail(row.here);
    const there = cell(2);
    there.textContent = rowDetail(row.there);
    const what = cell(3);
    if (row.allowed.length > 1) {
      const select = document.createElement('select');
      select.setAttribute('aria-label', phrase('row.action', { path: row.key }));
      select.dataset.key = row.key;
      for (const action of row.allowed) {
        const option = document.createElement('option');
        option.value = action;
        option.textContent = actionLabel(row, action);
        select.append(option);
      }
      select.value = chosen(row, overrides);
      select.addEventListener('change', () => {
        overrides.set(row.key, select.value);
        renderSummary();
        renderStatus();
      });
      what.append(select);
    } else what.textContent = actionLabel(row, row.allowed[0]);
    line.append(file, here, there, what);
    body.append(line);
  }
  $('sync-table-wrap').hidden = plan.rows.length === 0;
  $('sync-more').hidden = plan.rows.length <= MAX_ROWS;
  if (plan.rows.length > MAX_ROWS) {
    $('sync-more').textContent = phrase('sync.more', { shown: numbers.format(MAX_ROWS), total: numbers.format(plan.rows.length) });
  }
}

// One line says where the comparison stands; an error from the last attempt
// takes its place until the next plan or run replaces it.
function renderStatus() {
  const next = view;
  if (!next) return;
  let key = 'sync.listing', values = {}, error = false;
  if (next.phase === 'checking') {
    key = 'sync.checking';
    values = { done: numbers.format(next.checking.done), total: numbers.format(next.checking.total) };
  } else if (next.phase === 'asking') key = 'sync.asking';
  else if (next.phase === 'syncing') {
    key = 'sync.syncing';
    values = { received: size(next.run.received), receiveTotal: size(next.run.receiveTotal),
      sent: size(next.run.sent), sendTotal: size(next.run.sendTotal) };
  } else if (next.phase === 'ready' && next.plan) {
    const totals = summarize(next.plan, overrides);
    if (!next.plan.rows.length) key = 'sync.same';
    else if (totals.send + totals.receive) key = 'sync.review';
    // Rows with a choice wait for one; rows without, such as a case clash, wait for a rename.
    else key = next.plan.rows.some((row) => row.allowed.length > 1) ? 'sync.idle' : 'sync.blocked';
  }
  if (next.error && (next.phase === 'ready' || next.phase === 'listing')) { key = next.error; values = {}; error = true; }
  status('sync-status', key, error, values);
}

function renderSummary() {
  const plan = view?.phase === 'ready' ? view.plan : null;
  $('sync-start').disabled = true;
  if (!plan) { $('sync-summary').textContent = ''; return; }
  const totals = summarize(plan, overrides);
  $('sync-summary').textContent = phrase('sync.summary', {
    send: numbers.format(totals.send), sendSize: size(totals.sendBytes),
    receive: numbers.format(totals.receive), receiveSize: size(totals.receiveBytes),
    skip: numbers.format(totals.skip), same: numbers.format(totals.identical),
  });
  $('sync-start').disabled = totals.send + totals.receive === 0;
}

function renderResults(last) {
  $('sync-results').hidden = !last;
  if (!last) return;
  const key = last.outcome === 'done' ? 'sync.done' : `sync.${last.outcome}`;
  $('sync-results-text').textContent = phrase(key, {
    copied: numbers.format(last.copied), delivered: numbers.format(last.delivered ?? 0),
    failed: numbers.format(last.failed.length + (last.undelivered ?? 0)),
  });
  const list = $('sync-failures');
  list.replaceChildren();
  for (const { path, reason } of last.failed.slice(0, MAX_ROWS)) {
    const item = document.createElement('li');
    item.textContent = phrase('failure.item', { path, reason: phrase(`reason.${reason}`) });
    list.append(item);
  }
  const zipped = folder.zip.files().length;
  $('zip-save').hidden = zipped === 0;
  if (zipped) $('zip-save').textContent = phrase('zip.save', { size: size(folder.zip.bytes()) });
}

let drawnPlan = null;
let reported = null;

function renderSync(next) {
  if (!sync) return;
  view = next;
  if (next.gens !== overridesFor) { overrides = new Map(); overridesFor = next.gens; }
  $('side-here').textContent = sideText({ name: folder.name, files: folder.entries.size, bytes: folder.bytes, mode: mode(), into: adapter.into() }, true);
  $('side-there').textContent = sideText(next.remote, false);
  const progress = $('sync-progress');
  const moving = next.phase === 'syncing' || next.phase === 'asking';
  progress.hidden = !(next.phase === 'syncing' || next.phase === 'checking');
  if (next.phase === 'checking') {
    progress.max = next.checking.total || 1;
    progress.value = next.checking.done;
  } else if (next.phase === 'syncing') {
    progress.max = Math.max(1, next.run.receiveTotal + next.run.sendTotal);
    progress.value = next.run.received + next.run.sent;
  }
  const ready = next.phase === 'ready' && Boolean(next.plan);
  $('sync-start').hidden = moving;
  $('sync-cancel').hidden = !moving;
  $('sync-compare').disabled = !(ready || next.phase === 'checking');
  // Redrawn only for a new plan, so a choice being made in a list is not
  // thrown away by a progress tick.
  if (ready && next.plan !== drawnPlan) renderRows(next.plan);
  if (ready) drawnPlan = next.plan;
  else if (!moving) { drawnPlan = null; $('sync-table-wrap').hidden = true; }
  for (const select of $('sync-rows').querySelectorAll('select')) select.disabled = !ready;
  renderSummary();
  renderStatus();
  renderResults(next.last);
  if (next.last?.outcome === 'done' && next.last !== reported) {
    reported = next.last;
    globalThis.aboxToolComplete?.();
  }
}

$('sync-start').addEventListener('click', async () => {
  if (!sync || view?.phase !== 'ready' || !view.plan) return;
  const totals = summarize(view.plan, overrides);
  // Only a click on this page can grant the browser's permission to write.
  if (totals.receive && folder.kind === 'handle' && !(await adapter.writable())) {
    let state = 'denied';
    try { state = await folder.handle.requestPermission({ mode: 'readwrite' }); } catch {}
    if (state !== 'granted') { status('sync-status', 'sync.permission', true); return; }
  }
  sync?.syncNow(overrides);
});
$('sync-cancel').addEventListener('click', () => sync?.cancel());
$('sync-compare').addEventListener('click', () => { if (sync) void sync.rescan(true); });
$('zip-save').addEventListener('click', () => {
  const files = folder.zip.files();
  if (!files.length) return;
  saveBlob(makeZip(files), `${(folder.name || 'folder-sync').replace(/[\\/:*?"<>|]+/g, '-')}-received.zip`);
  folder.zip.clear();
  $('zip-save').hidden = true;
});

// Wiring ------------------------------------------------------------------

$('host-start').addEventListener('click', startHost);
$('host-stop').addEventListener('click', () => stopAll('host.stopped'));
$('guest-connect').addEventListener('click', () => connectGuest());
$('guest-stop').addEventListener('click', () => stopAll());
$('discovery-start').addEventListener('click', () => {
  if (role || !canConnect || pageSuspended) return;
  browsingNearby = true;
  startDiscovery();
  updateControls();
});
$('discovery-refresh').addEventListener('click', () => discovery?.refresh());
$('discovery-close').addEventListener('click', () => {
  if (role) return;
  closeDiscovery();
  updateControls();
  $('discovery-start').focus();
});
$('copy-link').addEventListener('click', () => linkCopy.copy());
for (const id of ['guest-code', 'guest-note']) {
  $(id).addEventListener('keydown', (event) => {
    if (event.key === 'Enter') { event.preventDefault(); void connectGuest(); }
  });
}

function showInvitation() {
  const hash = location.hash.slice(1);
  const joining = Boolean(hash) && hash !== 'main';
  $('host-panel').hidden = joining;
  $('show-host').hidden = !joining;
  $('sync-grid').classList.toggle('sync-joining', joining);
  if (joining) {
    const code = parseCode(hash);
    $('guest-code').value = code || hash.slice(0, 2048);
    if (!code) status('guest-status', 'code.invalid', true);
    else if (canConnect) status('guest-status', 'guest.ready');
  }
  updateControls();
}

$('show-host').addEventListener('click', () => {
  stopAll();
  history.replaceState(null, '', location.pathname + location.search);
  showInvitation();
});
window.addEventListener('hashchange', (event) => {
  // The frame's skip link must move focus without replacing an invitation
  // or ending a live session that also uses the URL fragment for routing.
  if (location.hash === '#main') {
    history.replaceState(null, '', event.oldURL);
    $('main').tabIndex = -1;
    $('main').focus();
    $('main').scrollIntoView();
    return;
  }
  stopAll();
  showInvitation();
});
window.addEventListener('pagehide', () => { pageSuspended = true; stopAll(); });
window.addEventListener('pageshow', () => { pageSuspended = false; updateControls(); });
// Leaving mid-run cancels it; the files already written stay whole either way.
window.addEventListener('beforeunload', (event) => { if (view?.phase === 'syncing') event.preventDefault(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) approvalPrompt.close(false); });
$('privacy-toggle').addEventListener('click', () => {
  const panel = $('privacy-panel');
  const open = panel.hidden;
  panel.hidden = !open;
  $('privacy-toggle').setAttribute('aria-expanded', String(open));
});

// A translated page needs the invitation too, but still asks for approval
// again because navigating tears down the current connection.
const alternates = new Set([...document.querySelectorAll('link[rel="alternate"][hreflang]')].map((link) => new URL(link.href).pathname));
addEventListener('click', (event) => {
  const anchor = event.target.closest('a[href]');
  if (!anchor || anchor.origin !== location.origin || !alternates.has(anchor.pathname)) return;
  const code = parseCode(location.hash.slice(1));
  if (code) anchor.href = inviteLink(anchor.href, code);
}, true);

if (!support.directory && !support.input) {
  folder.kind = 'none';
  setMode('receive');
  showSupport();
  showFolder();
}
if (!canConnect) {
  status('host-status', 'connection.unsupported', true);
  status('guest-status', 'connection.unsupported', true);
}
showInvitation();
updateControls();
document.getElementById('boot-warning')?.remove();
