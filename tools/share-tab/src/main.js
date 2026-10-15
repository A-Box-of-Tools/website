import { TabCapture } from './capture.js';
import { TabSession } from './session.js';
import { makeCode, parseCode, viewerLink } from './protocol.js';
import { phrase } from './shared/phrases.js';
import { clipboardFeedback } from './shared/clipboard-feedback.js';

const $ = (id) => document.getElementById(id);
let revision = 0;
let role = null;
let invitation = '';
let offlineAccepted = false;
let offlineAccepting = false;
let remoteRevision = 0;
let waitingRequests = [];
const terminal = new Set([
  'connection.server-failed', 'connection.not-found', 'connection.taken', 'connection.busy',
  'connection.ended', 'connection.invalid', 'connection.direct-failed',
  'viewer.denied', 'host.ended', 'offline.expired',
]);

function status(id, key, error = false) {
  $(id).textContent = key ? phrase(key) : '';
  $(id).dataset.error = String(error);
}

function listFocus(list) {
  const button = document.activeElement;
  return list.contains(button) && button?.dataset.peer && button?.dataset.action
    ? { peer: button.dataset.peer, action: button.dataset.action } : null;
}

function restoreListFocus(list, focused) {
  if (!focused) return;
  const button = [...list.querySelectorAll('button')].find((item) =>
    !item.disabled && item.dataset.peer === focused.peer && item.dataset.action === focused.action);
  button?.focus({ preventScroll: true });
}

function renderRequests(requests) {
  waitingRequests = requests;
  const list = $('viewer-requests');
  const focused = listFocus(list);
  $('viewer-requests').replaceChildren();
  $('request-panel').hidden = requests.length === 0;
  for (const request of requests) {
    const item = document.createElement('li');
    const note = document.createElement('p');
    note.textContent = request.note || phrase('host.unnamed');
    const actions = document.createElement('div');
    actions.className = 'run-row';
    for (const [key, action] of [
      ['host.approve', () => session.approve(request.id)],
      ['host.deny', () => session.deny(request.id)],
    ]) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = phrase(key);
      button.disabled = key === 'host.approve' && session.viewerCount > 0;
      button.dataset.peer = request.id;
      button.dataset.action = key;
      button.addEventListener('click', action);
      actions.append(button);
    }
    item.append(note, actions);
    $('viewer-requests').append(item);
  }
  restoreListFocus(list, focused);
}

function renderViewers(viewers) {
  const list = $('accepted-viewers');
  const focused = listFocus(list);
  $('accepted-viewers').replaceChildren();
  $('accepted-panel').hidden = viewers.length === 0;
  for (const viewer of viewers) {
    const item = document.createElement('li');
    const note = document.createElement('p');
    note.textContent = viewer.note || phrase('host.unnamed');
    const state = document.createElement('p');
    state.className = 'field-note';
    state.textContent = phrase(viewer.streaming ? 'host.viewer-watching' : 'host.viewer-preparing');
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = phrase('host.disconnect');
    button.dataset.peer = viewer.id;
    button.dataset.action = 'host.disconnect';
    button.addEventListener('click', () => session.disconnectViewer(viewer.id));
    item.append(note, state, button);
    $('accepted-viewers').append(item);
  }
  restoreListFocus(list, focused);
  renderRequests(waitingRequests);
}

function clearRemote() {
  remoteRevision += 1;
  $('remote-video').srcObject = null;
  $('viewer-video-panel').hidden = true;
  $('viewer-play').hidden = true;
}

function isOffline() { return $('pairing-offline').checked; }

function updateControls() {
  const hosting = role === 'host';
  const viewing = role === 'viewer';
  const busy = hosting || viewing;
  const offline = isOffline();
  $('pairing-online').disabled = busy;
  $('pairing-offline').disabled = busy;
  $('online-viewer-fields').hidden = offline;
  $('offline-viewer-fields').hidden = !offline;
  $('offline-note').hidden = !offline;
  $('host-start').disabled = hosting || viewing || !canCapture;
  $('host-stop').hidden = !hosting;
  $('viewer-connect').hidden = offline;
  $('viewer-connect').disabled = busy || !canConnect;
  $('offline-reply').hidden = !offline;
  $('offline-reply').disabled = busy || !canConnect;
  $('viewer-stop').hidden = !viewing;
  $('viewer-code').readOnly = busy;
  $('viewer-name').readOnly = busy;
  $('offline-offer-input').readOnly = busy;
  $('choose-offer').disabled = busy;
  $('host-invitation').hidden = offline || !hosting || !invitation;
  $('offline-host-panel').hidden = !offline || !hosting || !$('offline-offer').value;
  $('offline-answer-panel').hidden = !offline || !viewing || !$('offline-answer').value;
  $('offline-answer-input').readOnly = offlineAccepted || offlineAccepting;
  $('choose-answer').disabled = offlineAccepted || offlineAccepting;
  $('offline-accept').disabled = !hosting || offlineAccepted || offlineAccepting;
}

const session = new TabSession({
  onState(key, sessionRole) {
    if (key === 'connection.stopped' || !role || (sessionRole && sessionRole !== role)) return;
    const currentRole = role;
    status(currentRole === 'host' ? 'host-status' : 'viewer-status', key, terminal.has(key));
    if (terminal.has(key) && currentRole === 'viewer') {
      stopAll(key, 'viewer');
    } else if (terminal.has(key) && currentRole === 'host' && !session.role) {
      stopAll(key, 'host');
    }
  },
  onRequests: renderRequests,
  onViewers: renderViewers,
  onStream(stream) {
    if (!stream || role !== 'viewer') { clearRemote(); return; }
    const owner = ++remoteRevision;
    $('remote-video').srcObject = stream;
    $('viewer-video-panel').hidden = false;
    $('remote-video').play().then(() => {
      if (owner !== remoteRevision || role !== 'viewer') return;
      globalThis.aboxToolComplete?.();
    }).catch(() => {
      if (owner !== remoteRevision || role !== 'viewer') return;
      $('viewer-play').hidden = false;
      status('viewer-status', 'viewer.play');
    });
  },
});

const capture = new TabCapture({
  onEnded() { stopAll('host.ended', 'host'); },
});

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

function blockCopy(field, feedback, expectedRole) {
  return clipboardFeedback({
    read: () => ({ text: $(field).value }),
    current: (value) => role === expectedRole && isOffline() && Boolean(value.text) && value.text === $(field).value,
    write: (value) => navigator.clipboard.writeText(value),
    done: () => status(feedback, 'copy.done'),
    selected: () => {
      $(field).focus();
      $(field).select();
      status(feedback, 'copy.manual');
    },
    restore: () => { $(feedback).textContent = ''; },
  });
}

const offerCopy = blockCopy('offline-offer', 'offer-copy-status', 'host');
const answerCopy = blockCopy('offline-answer', 'answer-copy-status', 'viewer');

function stopAll(key = 'connection.stopped', previousRole = role) {
  revision += 1;
  role = null;
  invitation = '';
  offlineAccepted = false;
  offlineAccepting = false;
  linkCopy.invalidate();
  offerCopy.invalidate();
  answerCopy.invalidate();
  session.stop();
  capture.stop();
  $('local-video').srcObject = null;
  $('host-preview-panel').hidden = true;
  $('share-link').value = '';
  $('offline-offer').value = '';
  $('offline-answer').value = '';
  $('offline-answer-input').value = '';
  $('offline-accept-status').textContent = '';
  renderRequests([]);
  renderViewers([]);
  clearRemote();
  updateControls();
  if (previousRole) status(previousRole === 'host' ? 'host-status' : 'viewer-status', key, terminal.has(key));
}

async function startHost() {
  if (role || !canCapture || !canConnect) return;
  stopAll();
  const owner = revision;
  role = 'host';
  const offline = isOffline();
  status('host-status', 'host.choosing');
  updateControls();
  try {
    // Invoke before yielding: opening the browser picker needs this click's activation.
    const stream = await capture.start();
    if (owner !== revision || role !== 'host') return;
    $('local-video').srcObject = stream;
    $('host-preview-panel').hidden = false;
    $('local-video').play().catch(() => {});
    if (offline) {
      const block = await session.startOfflineHost(stream);
      if (owner !== revision || role !== 'host') return;
      $('offline-offer').value = block;
    } else {
      const code = makeCode();
      await session.startHost(stream, code);
      if (owner !== revision || role !== 'host') return;
      invitation = viewerLink(location.href, code);
      $('share-link').value = invitation;
    }
    updateControls();
  } catch (error) {
    if (owner !== revision) return;
    const key = error.code || error.message;
    stopAll(knownPhrase(key) ? key : 'capture.failed', 'host');
  }
}

function knownPhrase(key) {
  return typeof key === 'string' && Array.from(document.querySelectorAll('#phrases [data-phrase]'))
    .some((element) => element.dataset.phrase === key);
}

async function connectViewer() {
  if (role || !canConnect) return;
  const code = parseCode($('viewer-code').value);
  if (!code) { status('viewer-status', 'code.invalid', true); return; }
  const note = $('viewer-name').value.trim();
  stopAll();
  const owner = revision;
  role = 'viewer';
  $('viewer-code').value = code;
  updateControls();
  try {
    await session.connect(code, note);
  } catch (error) {
    if (owner !== revision || role !== 'viewer') return;
    const key = error.code || error.message;
    stopAll(knownPhrase(key) ? key : 'connection.server-failed', 'viewer');
  }
}

async function createViewerReply() {
  if (role || !canConnect || !isOffline()) return;
  const block = $('offline-offer-input').value.trim();
  const note = $('viewer-name').value.trim();
  if (!block || block.length > 65536) { status('viewer-status', 'offline.invalid-offer', true); return; }
  stopAll();
  const owner = revision;
  role = 'viewer';
  updateControls();
  try {
    const answer = await session.createOfflineAnswer(block, note);
    if (owner !== revision || role !== 'viewer') return;
    $('offline-answer').value = answer;
    updateControls();
  } catch (error) {
    if (owner !== revision || role !== 'viewer') return;
    const key = error.code || error.message;
    stopAll(knownPhrase(key) ? key : 'offline.invalid-offer', 'viewer');
  }
}

async function acceptViewerReply() {
  if (role !== 'host' || !isOffline() || offlineAccepted || offlineAccepting) return;
  const owner = revision;
  offlineAccepting = true;
  updateControls();
  try {
    await session.acceptOfflineAnswer($('offline-answer-input').value.trim());
    if (owner !== revision || role !== 'host') return;
    offlineAccepted = true;
    $('offline-accept-status').textContent = '';
  } catch (error) {
    if (owner !== revision || role !== 'host') return;
    const key = error.code || error.message;
    status('offline-accept-status', knownPhrase(key) ? key : 'offline.invalid-answer', true);
  } finally {
    if (owner === revision) { offlineAccepting = false; updateControls(); }
  }
}

async function loadBlock(input, field, feedback) {
  const file = input.files?.[0];
  input.value = '';
  if (!file) return;
  const owner = revision;
  try {
    if (file.size > 65536) throw new Error('offline.file-invalid');
    const text = await file.text();
    if (owner !== revision || !isOffline()) return;
    if (field === 'offline-answer-input' && (offlineAccepted || offlineAccepting)) return;
    if (!text.trim() || text.length > 65536) throw new Error('offline.file-invalid');
    $(field).value = text;
  } catch { if (owner === revision) status(feedback, 'offline.file-invalid', true); }
}

function saveBlock(field, filename, feedback) {
  const text = $(field).value;
  if (!text || !isOffline() || !role) return;
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  status(feedback, 'offline.saved');
}

function showInvitation() {
  const hash = location.hash.slice(1);
  const watching = Boolean(hash) && hash !== 'main';
  $('host-panel').hidden = watching;
  $('show-host').hidden = !watching;
  $('tab-share-grid').classList.toggle('tab-share-watching', watching);
  if (watching) {
    $('pairing-online').checked = true;
    $('pairing-offline').checked = false;
    const code = parseCode(hash);
    $('viewer-code').value = code || hash.slice(0, 2048);
    if (!code) status('viewer-status', 'code.invalid', true);
  }
}

const canConnect = globalThis.isSecureContext && typeof globalThis.RTCPeerConnection === 'function';
const canCapture = canConnect && typeof navigator.mediaDevices?.getDisplayMedia === 'function';
if (!canCapture) {
  $('capture-support').textContent = phrase('capture.unsupported');
  status('host-status', 'capture.unsupported');
}
if (!canConnect) status('viewer-status', 'connection.unsupported', true);

$('host-start').addEventListener('click', startHost);
$('host-stop').addEventListener('click', () => stopAll('host.stopped'));
$('viewer-connect').addEventListener('click', () => connectViewer());
$('viewer-stop').addEventListener('click', () => stopAll());
$('offline-reply').addEventListener('click', createViewerReply);
$('offline-accept').addEventListener('click', acceptViewerReply);
$('copy-link').addEventListener('click', () => linkCopy.copy());
$('copy-offer').addEventListener('click', () => offerCopy.copy());
$('copy-answer').addEventListener('click', () => answerCopy.copy());
$('save-offer').addEventListener('click', () => saveBlock('offline-offer', 'tab-offer.json', 'offer-copy-status'));
$('save-answer').addEventListener('click', () => saveBlock('offline-answer', 'tab-answer.json', 'answer-copy-status'));
$('choose-offer').addEventListener('click', () => $('load-offer').click());
$('choose-answer').addEventListener('click', () => $('load-answer').click());
$('load-offer').addEventListener('change', () => loadBlock($('load-offer'), 'offline-offer-input', 'viewer-status'));
$('load-answer').addEventListener('change', () => loadBlock($('load-answer'), 'offline-answer-input', 'offline-accept-status'));
for (const id of ['pairing-online', 'pairing-offline']) {
  $(id).addEventListener('change', () => {
    if (role) return;
    revision += 1;
    if (canConnect) status('viewer-status', isOffline() ? 'offline.viewer-ready' : 'viewer.ready');
    updateControls();
  });
}
for (const id of ['viewer-code', 'viewer-name']) {
  $(id).addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (isOffline()) createViewerReply();
      else connectViewer();
    }
  });
}
$('viewer-play').addEventListener('click', async () => {
  const owner = remoteRevision;
  try {
    await $('remote-video').play();
    if (owner !== remoteRevision || role !== 'viewer') return;
    $('viewer-play').hidden = true;
    globalThis.aboxToolComplete?.();
    status('viewer-status', 'viewer.streaming');
  } catch { if (owner === remoteRevision) status('viewer-status', 'viewer.play'); }
});
$('viewer-fullscreen').addEventListener('click', async () => {
  try { await $('viewer-video-frame').requestFullscreen(); }
  catch { status('viewer-status', 'viewer.fullscreen-failed'); }
});
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
window.addEventListener('pagehide', () => stopAll());
$('privacy-toggle').addEventListener('click', () => {
  const panel = $('privacy-panel');
  const open = panel.hidden;
  panel.hidden = !open;
  $('privacy-toggle').setAttribute('aria-expanded', String(open));
});

// A translated viewer page needs the invitation too, but still requests
// approval again because navigating tears down the current connection.
const alternates = new Set(
  [...document.querySelectorAll('link[rel="alternate"][hreflang]')]
    .map((link) => new URL(link.href).pathname),
);
addEventListener('click', (event) => {
  const anchor = event.target.closest('a[href]');
  if (!anchor || anchor.origin !== location.origin || !alternates.has(anchor.pathname)) return;
  const code = parseCode(location.hash.slice(1));
  if (code) anchor.href = viewerLink(anchor.href, code);
}, true);

showInvitation();
updateControls();
document.getElementById('boot-warning')?.remove();
