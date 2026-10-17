import { TabCapture } from './capture.js';
import { TabSession } from './session.js';
import { makeCode, parseCode, viewerLink } from './protocol.js';
import { phrase } from './shared/phrases.js';
import { clipboardFeedback } from './shared/clipboard-feedback.js';
import { watchDiscovery } from './shared/peer-discovery.js';
import { rendezvousEndpoint } from './shared/peer-endpoint.js';
import { pairingOptions, pairingBlocks } from './shared/pairing-ui.js';

const $ = (id) => document.getElementById(id);
let revision = 0;
let role = null;
let invitation = '';
let offlineAccepted = false;
let offlineAccepting = false;
let remoteRevision = 0;
let waitingRequests = [];
let discovery = null;
let discoveryPublication = null;
let nearbyShares = [];
let discoveryState = 'idle';
let browsingNearby = false;
let pageSuspended = false;
let pairingMethod = 'online';
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

function isOffline() { return pairingMethod === 'offline'; }

function syncPairingChoice() { pairing.refresh(); }

function renderDiscovery() {
  const list = $('discovery-list');
  const focused = document.activeElement?.dataset.code;
  list.replaceChildren();
  for (const share of nearbyShares) {
    const code = parseCode(share.code);
    if (!code || code !== share.code || code === session.code && role === 'host') continue;
    const item = document.createElement('li');
    item.className = 'paired-nearby-row';
    const label = document.createElement('code');
    label.textContent = code;
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.code = code;
    button.textContent = phrase('discovery.choose', { code });
    button.disabled = Boolean(role) || isOffline();
    button.addEventListener('click', () => {
      if (role || isOffline() || !browsingNearby || !nearbyShares.some((entry) => entry.code === code)) return;
      $('viewer-code').value = code;
      status('viewer-status', 'discovery.selected');
      $('viewer-connect').focus();
    });
    item.append(label, button);
    list.append(item);
  }
  const key = discoveryState === 'ready' ? (list.children.length ? 'discovery.found' : 'discovery.empty') : `discovery.${discoveryState}`;
  status('discovery-status', key, discoveryState === 'unavailable');
  if (focused) [...list.querySelectorAll('button')].find((button) => button.dataset.code === focused)?.focus({ preventScroll: true });
}

function startDiscovery() {
  if (discovery || isOffline() || pageSuspended || !canConnect) return;
  discovery = watchDiscovery(`${rendezvousEndpoint()}/discover?tool=share-tab`, {
    list(shares) { nearbyShares = shares; renderDiscovery(); },
    status(state) { discoveryState = state; renderDiscovery(); },
    publication(state) {
      status('host-publication-status', state ? `discovery.${state}` : '', state === 'not-published');
    },
  });
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
  if (!discoveryPublication || role !== 'host' || isOffline() || !$('host-discoverable').checked || pageSuspended) {
    discovery?.unpublish();
    return;
  }
  startDiscovery();
  discovery?.publish(discoveryPublication.code, discoveryPublication.lease);
}

function updateControls() {
  pairing.refresh();
  const hosting = role === 'host';
  const viewing = role === 'viewer';
  const busy = hosting || viewing;
  const offline = isOffline();
  $('pairing-status').hidden = busy || !$('pairing-status').textContent;
  $('pairing-auto').disabled = busy;
  $('pairing-online').disabled = busy;
  $('pairing-offline').disabled = busy;
  $('host-discovery-option').hidden = offline;
  $('host-discoverable').disabled = busy || !canCapture;
  $('host-publication-status').hidden = offline || !hosting || !$('host-discoverable').checked;
  $('nearby-section').hidden = offline || busy;
  $('discovery-controls').hidden = offline || busy;
  $('discovery-start').hidden = browsingNearby;
  $('discovery-start').disabled = !canConnect;
  $('discovery-panel').hidden = offline || busy || !browsingNearby;
  $('online-viewer-fields').hidden = offline;
  $('offline-viewer-fields').hidden = !offline;
  $('offline-help').hidden = !offline;
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
  $('offline-host').hidden = !offline || !hosting || !$('offline-offer').value;
  $('offline-viewer-reply').hidden = !offline || !viewing || !$('offline-answer').value;
  $('offline-answer-input').readOnly = offlineAccepted || offlineAccepting;
  $('choose-answer').disabled = offlineAccepted || offlineAccepting;
  $('offline-accept').disabled = !hosting || offlineAccepted || offlineAccepting;
}

const session = new TabSession({
  onDiscovery(publication) {
    discoveryPublication = publication;
    publishDiscovery();
  },
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

function stopAll(key = 'connection.stopped', previousRole = role) {
  revision += 1;
  role = null;
  invitation = '';
  offlineAccepted = false;
  offlineAccepting = false;
  discoveryPublication = null;
  closeDiscovery();
  linkCopy.invalidate();
  blocks.clear();
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
  if (key === 'connection.server-failed') pairing.fail();
  syncPairingChoice();
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
      blocks.setOffer(block);
    } else {
      const code = makeCode();
      if ($('host-discoverable').checked) status('host-publication-status', 'discovery.not-published');
      await session.startHost(stream, code, { discoverable: $('host-discoverable').checked });
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
  syncPairingChoice();
  if (role || !canConnect || isOffline()) return;
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
  syncPairingChoice();
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
    blocks.setAnswer(answer);
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

function showInvitation() {
  const hash = location.hash.slice(1);
  const watching = Boolean(hash) && hash !== 'main';
  $('host-panel').hidden = watching;
  $('show-host').hidden = !watching;
  $('tab-share-grid').classList.toggle('tab-share-watching', watching);
  if (watching) {
    const code = parseCode(hash);
    $('viewer-code').value = code || hash.slice(0, 2048);
    syncPairingChoice();
    if (!code) status('viewer-status', 'code.invalid', true);
    else if (canConnect) status('viewer-status', isOffline() ? 'offline.viewer-ready' : 'viewer.ready');
  }
  syncPairingChoice();
  updateControls();
}

const canConnect = globalThis.isSecureContext && typeof globalThis.RTCPeerConnection === 'function';
const canCapture = canConnect && typeof navigator.mediaDevices?.getDisplayMedia === 'function';
const pairing = pairingOptions({
  busy: () => Boolean(role),
  invitation: () => Boolean($('viewer-code').value.trim()),
  invitationLink: () => Boolean(location.hash && location.hash !== '#main'),
  onChange({ method }) {
    if (pairingMethod !== method) {
      revision += 1;
      pairingMethod = method;
      closeDiscovery();
      if (canConnect) status('viewer-status', isOffline() ? 'offline.viewer-ready' : 'viewer.ready');
    }
    updateControls();
  },
});
const blocks = pairingBlocks({
  createReply: createViewerReply, acceptReply: acceptViewerReply,
  onChange: updateControls,
  onError(error, action) { status(action.includes('answer') || action === 'offline-accept' ? 'offline-accept-status' : 'viewer-status',
    knownPhrase(error.message) ? error.message : 'offline.file-invalid', true); },
});
if (!canCapture) {
  $('capture-support').textContent = phrase('capture.unsupported');
  status('host-status', 'capture.unsupported');
}
if (!canConnect) status('viewer-status', 'connection.unsupported', true);

$('host-start').addEventListener('click', startHost);
$('host-stop').addEventListener('click', () => stopAll('host.stopped'));
$('viewer-connect').addEventListener('click', () => connectViewer());
$('viewer-stop').addEventListener('click', () => stopAll());
$('discovery-start').addEventListener('click', () => {
  if (role || isOffline() || !canConnect || pageSuspended) return;
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
  pairing.reset();
  showInvitation();
});
window.addEventListener('pagehide', () => { pageSuspended = true; stopAll(); });
window.addEventListener('pageshow', () => { pageSuspended = false; syncPairingChoice(); updateControls(); });
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
