import { TabCapture } from './capture.js';
import { TabSession } from './session.js';
import { makeCode, parseCode, viewerLink } from './protocol.js';
import { phrase } from './shared/phrases.js';
import { clipboardFeedback } from './shared/clipboard-feedback.js';

const $ = (id) => document.getElementById(id);
let revision = 0;
let role = null;
let invitation = '';
let attempt = null;
let remoteRevision = 0;
let waitingRequests = [];
const terminal = new Set([
  'connection.server-failed', 'connection.not-found', 'connection.taken', 'connection.busy',
  'connection.ended', 'connection.invalid', 'connection.direct-failed',
  'connection.relay-unavailable', 'connection.relay-failed', 'viewer.denied', 'host.ended',
]);

function status(id, key, error = false) {
  $(id).textContent = key ? phrase(key) : '';
  $(id).dataset.error = String(error);
}

function renderRequests(requests) {
  waitingRequests = requests;
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
      button.addEventListener('click', action);
      actions.append(button);
    }
    item.append(note, actions);
    $('viewer-requests').append(item);
  }
}

function renderViewers(viewers) {
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
    button.addEventListener('click', () => session.disconnectViewer(viewer.id));
    item.append(note, state, button);
    $('accepted-viewers').append(item);
  }
  renderRequests(waitingRequests);
}

function clearRemote() {
  remoteRevision += 1;
  $('remote-video').srcObject = null;
  $('viewer-video-panel').hidden = true;
  $('viewer-play').hidden = true;
}

function updateControls() {
  const hosting = role === 'host';
  const viewing = role === 'viewer';
  $('host-start').disabled = hosting || viewing || !canCapture;
  $('host-stop').hidden = !hosting;
  $('viewer-connect').disabled = hosting || viewing || !canConnect;
  $('viewer-stop').hidden = !viewing;
  $('viewer-code').readOnly = hosting || viewing;
  $('viewer-name').readOnly = hosting || viewing;
  $('host-invitation').hidden = !hosting || !invitation;
}

const session = new TabSession({
  onState(key, sessionRole) {
    if (key === 'connection.stopped' || !role || (sessionRole && sessionRole !== role)) return;
    const currentRole = role;
    status(currentRole === 'host' ? 'host-status' : 'viewer-status', key, terminal.has(key));
    if (terminal.has(key) && currentRole === 'viewer') {
      const offerRelay = key === 'connection.direct-failed' && attempt && !attempt.relay;
      role = null;
      clearRemote();
      updateControls();
      $('relay-panel').hidden = !offerRelay;
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
    $('remote-video').play().catch(() => {
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
  linkCopy.invalidate();
  session.stop();
  capture.stop();
  $('local-video').srcObject = null;
  $('host-preview-panel').hidden = true;
  $('share-link').value = '';
  $('relay-panel').hidden = true;
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
  attempt = null;
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
    await session.startHost(stream, code);
    if (owner !== revision || role !== 'host') return;
    invitation = viewerLink(location.href, code);
    $('share-link').value = invitation;
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

async function connectViewer(relay = false) {
  if (role || !canConnect) return;
  const code = relay ? attempt?.code : parseCode($('viewer-code').value);
  if (!code) { status('viewer-status', 'code.invalid', true); return; }
  const note = relay ? attempt.note : $('viewer-name').value.trim();
  stopAll();
  const owner = revision;
  role = 'viewer';
  attempt = { code, note, relay };
  $('viewer-code').value = code;
  updateControls();
  try {
    await session.connect(code, note, { relay });
  } catch (error) {
    if (owner !== revision || role !== 'viewer') return;
    const key = error.code || error.message;
    stopAll(knownPhrase(key) ? key : 'connection.server-failed', 'viewer');
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
$('viewer-stop').addEventListener('click', () => { attempt = null; stopAll(); });
$('viewer-relay').addEventListener('click', () => connectViewer(true));
$('copy-link').addEventListener('click', () => linkCopy.copy());
$('viewer-code').addEventListener('input', () => { $('relay-panel').hidden = true; });
for (const id of ['viewer-code', 'viewer-name']) {
  $(id).addEventListener('keydown', (event) => {
    if (event.key === 'Enter') { event.preventDefault(); connectViewer(); }
  });
}
$('viewer-play').addEventListener('click', async () => {
  const owner = remoteRevision;
  try {
    await $('remote-video').play();
    if (owner !== remoteRevision || role !== 'viewer') return;
    $('viewer-play').hidden = true;
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
    $('main').focus();
    $('main').scrollIntoView();
    return;
  }
  stopAll();
  showInvitation();
});
window.addEventListener('pagehide', () => stopAll());
showInvitation();
updateControls();
document.getElementById('boot-warning')?.remove();
