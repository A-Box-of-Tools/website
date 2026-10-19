import { TabCapture } from './capture.js';
import { TabSession } from './session.js';
import { makeCode, parseCode, viewerLink } from './protocol.js';
import { phrase } from './shared/phrases.js';
import { clipboardFeedback } from './shared/clipboard-feedback.js';
import { watchDiscovery } from './shared/peer-discovery.js';
import { rendezvousEndpoint } from './shared/peer-endpoint.js';
import { readTransport } from './shared/peer-transport.js';
import { bindTransportControl } from './shared/peer-transport-ui.js';
import { createDiscoveryGroupControl, appendConnectionIcons } from './shared/peer-discovery-ui.js';

const $ = (id) => document.getElementById(id);
let invalidInvitationTransport = false;
const transportControl = bindTransportControl({ onChange: () => { invalidInvitationTransport = false; renderInvitationType(); } });
function selectTransport(value) {
  invalidInvitationTransport = !transportControl.set(value);
  renderInvitationType();
  if (invalidInvitationTransport) status('viewer-status', 'transport.invalid', true);
}
function renderInvitationType() {
  const indicator = $('viewer-connection-type');
  indicator.replaceChildren();
  if (!invalidInvitationTransport) appendConnectionIcons(indicator, { transport: transportControl.value(), locked: false, approval: true });
}
let routeTimer = null;
let revision = 0;
let role = null;
let invitation = '';
let remoteRevision = 0;
let waitingRequests = [];
let discovery = null;
let discoveryPublication = null;
let nearbyShares = [];
let discoveryState = 'idle';
let browsingNearby = false;
let pageSuspended = false;
const groupControl = createDiscoveryGroupControl({ root: document, onChange() {
  closeDiscovery();
  $('viewer-code').value = '';
  selectTransport('direct');
  status('viewer-status', 'viewer.ready');
  browsingNearby = true;
  startDiscovery();
  updateControls();
} });
const terminal = new Set([
  'connection.server-failed', 'connection.not-found', 'connection.taken', 'connection.busy',
  'connection.ended', 'connection.invalid', 'connection.direct-failed',
  'viewer.denied', 'host.ended',
  'transport.invalid', 'transport.unavailable', 'transport.limited', 'transport.forbidden',
  'transport.timeout', 'transport.mismatch', 'transport.failed', 'transport.stopped',
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
    button.disabled = Boolean(role);
    button.addEventListener('click', () => {
      if (role || !browsingNearby || !nearbyShares.some((entry) => entry.code === code)) return;
      selectTransport(share.transport ?? 'direct');
      $('viewer-code').value = code;
      status('viewer-status', 'discovery.selected');
      $('viewer-connect').focus();
    });
    item.append(label);
    appendConnectionIcons(item, { transport: share.transport ?? 'direct', locked: false, approval: true });
    item.append(button);
    list.append(item);
  }
  const key = discoveryState === 'ready' ? (list.children.length ? 'discovery.found' : 'discovery.empty') : `discovery.${discoveryState}`;
  status('discovery-status', key, discoveryState === 'unavailable');
  if (focused) [...list.querySelectorAll('button')].find((button) => button.dataset.code === focused)?.focus({ preventScroll: true });
}

function startDiscovery() {
  if (discovery || pageSuspended || !canConnect) return;
  discovery = watchDiscovery(`${rendezvousEndpoint()}/discover?tool=share-tab`, {
    list(shares) { nearbyShares = shares; renderDiscovery(); },
    status(state) { discoveryState = state; renderDiscovery(); },
    publication(state) {
      status('host-publication-status', state ? `discovery.${state}` : '', state === 'not-published');
    },
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

function updateControls() {
  const hosting = role === 'host';
  const viewing = role === 'viewer';
  const busy = hosting || viewing;
  transportControl.lock(busy);
  groupControl.lock(busy);
  $('host-discoverable').disabled = busy || !canCapture;
  $('host-publication-status').hidden = !hosting || !$('host-discoverable').checked;
  $('nearby-section').hidden = busy;
  $('discovery-controls').hidden = busy;
  $('discovery-start').hidden = browsingNearby;
  $('discovery-start').disabled = !canConnect;
  $('discovery-panel').hidden = busy || !browsingNearby;
  $('host-start').disabled = busy || !canCapture;
  $('host-stop').hidden = !hosting;
  $('viewer-connect').disabled = busy || !canConnect;
  $('viewer-stop').hidden = !viewing;
  $('viewer-code').readOnly = busy;
  $('viewer-name').readOnly = busy;
  $('host-invitation').hidden = !hosting || !invitation;
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
  clearInterval(routeTimer);
  routeTimer = null;
  transportControl.route(null);
  role = null;
  invitation = '';
  discoveryPublication = null;
  closeDiscovery();
  linkCopy.invalidate();
  session.stop();
  capture.stop();
  $('local-video').srcObject = null;
  $('host-preview-panel').hidden = true;
  $('share-link').value = '';
  renderRequests([]);
  renderViewers([]);
  clearRemote();
  updateControls();
  if (previousRole) status(previousRole === 'host' ? 'host-status' : 'viewer-status', key, terminal.has(key));
}

async function startHost() {
  if (role || !canCapture || !canConnect) return;
  const transport = transportControl.value();
  if (!transport || invalidInvitationTransport) { status('host-status', 'transport.invalid', true); return; }
  stopAll();
  const owner = revision;
  role = 'host';
  status('host-status', 'host.choosing');
  updateControls();
  try {
    // Invoke before yielding: opening the browser picker needs this click's activation.
    const stream = await capture.start();
    if (owner !== revision || role !== 'host') return;
    $('local-video').srcObject = stream;
    $('host-preview-panel').hidden = false;
    $('local-video').play().catch(() => {});
    const code = makeCode();
    if ($('host-discoverable').checked) status('host-publication-status', 'discovery.not-published');
    await session.startHost(stream, code, { discoverable: $('host-discoverable').checked, transport, discoveryGroup: groupControl.id() });
    if (owner !== revision || role !== 'host') return;
    invitation = viewerLink(location.href, code, transport);
    $('share-link').value = invitation;
    updateControls();
    watchRoute();
  } catch (error) {
    if (owner !== revision) return;
    const key = error.code || error.message;
    stopAll(knownPhrase(key) ? key : 'capture.failed', 'host');
  }
}

function knownPhrase(key) {
  return typeof key === 'string' && Array.from(document.querySelectorAll('[data-phrase]'))
    .some((element) => element.dataset.phrase === key);
}

async function connectViewer() {
  if (role || !canConnect) return;
  const input = $('viewer-code').value.trim();
  if (/^https?:\/\//i.test(input)) {
    const invited = readTransport(input);
    if (!invited) { status('viewer-status', 'transport.invalid', true); return; }
    if (invited !== transportControl.value()) {
      selectTransport(invited);
      $('viewer-connect').focus();
      return;
    }
  }
  const code = parseCode($('viewer-code').value);
  if (!code) { status('viewer-status', 'code.invalid', true); return; }
  const note = $('viewer-name').value.trim();
  const transport = transportControl.value();
  if (!transport || invalidInvitationTransport) { status('viewer-status', 'transport.invalid', true); return; }
  stopAll();
  const owner = revision;
  role = 'viewer';
  $('viewer-code').value = code;
  updateControls();
  try {
    await session.connect(code, note, { transport });
    if (owner === revision && role === 'viewer') watchRoute();
  } catch (error) {
    if (owner !== revision || role !== 'viewer') return;
    const key = error.code || error.message;
    stopAll(knownPhrase(key) ? key : 'connection.server-failed', 'viewer');
  }
}

function watchRoute() {
  clearInterval(routeTimer);
  const owner = revision;
  const update = async () => {
    const result = await session.inspect().catch(() => null);
    if (owner === revision) transportControl.route(result?.route ?? 'unknown');
  };
  routeTimer = setInterval(update, 1000);
  update();
}

function showInvitation() {
  const hash = location.hash.slice(1);
  const watching = Boolean(hash) && hash !== 'main';
  $('host-panel').hidden = watching;
  $('show-host').hidden = !watching;
  $('tab-share-grid').classList.toggle('tab-share-watching', watching);
  if (watching) {
    selectTransport(readTransport(location.href));
    const code = parseCode(hash);
    $('viewer-code').value = code || hash.slice(0, 2048);
    if (!code) status('viewer-status', 'code.invalid', true);
    else if (invalidInvitationTransport) status('viewer-status', 'transport.invalid', true);
    else if (canConnect) status('viewer-status', 'viewer.ready');
  }
  updateControls();
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
$('viewer-code').addEventListener('input', () => {
  if (role) return;
  const value = $('viewer-code').value.trim();
  if (/^https?:\/\//i.test(value)) selectTransport(readTransport(value));
  else invalidInvitationTransport = false;
});
$('viewer-stop').addEventListener('click', () => stopAll());
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
for (const id of ['viewer-code', 'viewer-name']) {
  $(id).addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      connectViewer();
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
window.addEventListener('pagehide', () => { pageSuspended = true; stopAll(); });
window.addEventListener('pageshow', () => { pageSuspended = false; updateControls(); });
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
  if (code) anchor.href = viewerLink(anchor.href, code, transportControl.value());
}, true);

showInvitation();
updateControls();
renderInvitationType();
document.getElementById('boot-warning')?.remove();
