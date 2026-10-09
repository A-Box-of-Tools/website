import { phrase, ltr } from './shared/phrases.js';
import { makeQr } from './shared/qr.js';
import { CameraCapture } from './capture.js';
import { CameraSession } from './session.js';
import { makeCode, parseCode, viewerLink } from './protocol.js';

const $ = (id) => document.getElementById(id);
let mode = 'camera';
let epoch = 0;
let wake = null;
let detailsTimer = null;
const capture = new CameraCapture({ getUserMedia: (constraints) => navigator.mediaDevices.getUserMedia(constraints) });

const warning = (key) => /failed|invalid|unsupported|denied|missing|busy|not-found|taken/.test(key);
function showStatus(key, role = mode) {
  const element = $(role === 'camera' ? 'camera-status' : 'viewer-status');
  element.textContent = phrase(key);
  element.classList.toggle('warn', warning(key));
}

function idleCamera() {
  $('camera-start').disabled = false;
  $('camera-facing').disabled = false;
  $('camera-stop').hidden = true;
  $('camera-invite').hidden = true;
  $('camera-approval').hidden = true;
  $('camera-preview-panel').hidden = true;
  $('camera-preview').srcObject = null;
  $('camera-link').value = '';
  $('camera-code').textContent = '';
  $('camera-requests').replaceChildren();
  $('copy-status').textContent = '';
}

function idleViewer() {
  $('viewer-connect').disabled = false;
  $('viewer-code').disabled = false;
  $('viewer-name').disabled = false;
  $('viewer-stop').hidden = true;
  $('viewer-video-panel').hidden = true;
  $('remote-video').srcObject = null;
  $('viewer-play').hidden = true;
}

function clearDetails() {
  clearInterval(detailsTimer);
  detailsTimer = null;
  $('details-route').textContent = phrase('details.idle');
  $('details-frames').hidden = true;
}

function releaseWake() {
  const lock = wake;
  wake = null;
  lock?.release().catch(() => {});
}

const session = new CameraSession({
  onState(key, role) {
    if (!role) return;
    showStatus(key, role);
    if (session.role === null) {
      epoch += 1;
      clearDetails();
      if (role === 'camera') { capture.stop(); releaseWake(); idleCamera(); }
      else idleViewer();
    }
  },
  onRequests(requests) {
    $('camera-requests').replaceChildren();
    $('camera-approval').hidden = requests.length === 0;
    for (const request of requests) {
      const row = document.createElement('div');
      row.className = 'camera-request';
      const note = document.createElement('p');
      note.textContent = request.note || phrase('camera.unnamed');
      for (const [action, key] of [['approve', 'camera.approve'], ['deny', 'camera.deny']]) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = phrase(key);
        button.dataset.action = action;
        button.dataset.peer = request.id;
        if (action === 'deny') button.className = 'ghost';
        button.addEventListener('click', () => session[action](request.id));
        row.append(button);
      }
      row.prepend(note);
      $('camera-requests').append(row);
    }
  },
  onStream(stream) {
    $('remote-video').srcObject = stream;
    $('viewer-video-panel').hidden = stream === null;
    if (stream) playVideo();
  },
});

function stop(key = 'connection.stopped') {
  epoch += 1;
  session.stop(key);
  capture.stop();
  releaseWake();
  idleCamera();
  idleViewer();
  clearDetails();
  showStatus(key);
}

function selectMode(next) {
  stop();
  mode = next;
  $('camera-panel').hidden = next !== 'camera';
  $('viewer-panel').hidden = next !== 'viewer';
  $('role-camera').setAttribute('aria-pressed', String(next === 'camera'));
  $('role-viewer').setAttribute('aria-pressed', String(next === 'viewer'));
  $('role-camera').classList.toggle('ghost', next !== 'camera');
  $('role-viewer').classList.toggle('ghost', next !== 'viewer');
  showStatus(next === 'camera' ? 'camera.ready' : 'viewer.ready');
}

function qr(link) {
  try {
    const symbol = makeQr(link, { level: 'M' });
    const canvas = $('camera-qr');
    const scale = 5;
    canvas.width = canvas.height = (symbol.size + 8) * scale;
    const context = canvas.getContext('2d');
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#000';
    for (let y = 0; y < symbol.size; y += 1) {
      for (let x = 0; x < symbol.size; x += 1) {
        if (symbol.modules[y * symbol.size + x]) context.fillRect((x + 4) * scale, (y + 4) * scale, scale, scale);
      }
    }
    canvas.hidden = false;
  } catch {
    $('camera-qr').hidden = true;
    $('copy-status').textContent = phrase('qr.unavailable');
  }
}

async function updateDetails() {
  const current = epoch;
  const result = await session.inspect().catch(() => null);
  if (current !== epoch) return;
  if (!result) {
    $('details-route').textContent = phrase('details.idle');
    $('details-frames').hidden = true;
    return;
  }
  $('details-route').textContent = phrase(result.local === 'host' && result.remote === 'host' ? 'details.direct' : 'details.host-policy');
  $('details-frames').hidden = mode !== 'viewer';
  $('details-frames').textContent = phrase('details.frames', { count: ltr(result.frames.toLocaleString(document.documentElement.lang)) });
}

function watchDetails() {
  clearInterval(detailsTimer);
  detailsTimer = setInterval(updateDetails, 1000);
  updateDetails();
}

async function keepAwake(current) {
  try {
    const lock = await navigator.wakeLock?.request('screen');
    if (!lock) return;
    if (current !== epoch || session.role !== 'camera') await lock.release();
    else wake = lock;
  } catch {}
}

function captureError(error) {
  if (error?.name === 'NotAllowedError' || error?.name === 'SecurityError') return 'camera.denied';
  if (error?.name === 'NotFoundError' || error?.name === 'OverconstrainedError') return 'camera.missing';
  if (error?.message?.startsWith('camera.') || error?.message?.startsWith('connection.')) return error.message;
  return 'camera.busy';
}

async function startCamera() {
  if (!globalThis.isSecureContext || !navigator.mediaDevices?.getUserMedia) return showStatus('camera.unsupported', 'camera');
  if (!globalThis.RTCPeerConnection) return showStatus('connection.unsupported', 'camera');
  stop();
  const current = ++epoch;
  $('camera-start').disabled = true;
  $('camera-facing').disabled = true;
  $('camera-stop').hidden = false;
  showStatus('camera.permission', 'camera');
  try {
    const stream = await capture.start({
      video: { facingMode: { ideal: $('camera-facing').value }, width: { ideal: 1280, max: 1920 }, height: { ideal: 720, max: 1080 }, frameRate: { ideal: 24, max: 30 } },
      audio: false,
    });
    if (current !== epoch || stream === null) return;
    $('camera-preview').srcObject = stream;
    $('camera-preview-panel').hidden = false;
    $('camera-preview').play().catch(() => {});
    for (const track of stream.getVideoTracks()) {
      track.addEventListener('ended', () => { if (current === epoch) stop('camera.ended'); });
    }
    const code = makeCode();
    await session.startHost(stream, code);
    if (current !== epoch) return;
    const link = viewerLink(location.href, code);
    $('camera-link').value = link;
    $('camera-code').textContent = code;
    $('camera-invite').hidden = false;
    qr(link);
    watchDetails();
    keepAwake(current);
  } catch (error) {
    if (current === epoch) stop(captureError(error));
  }
}

async function connectViewer() {
  const code = parseCode($('viewer-code').value);
  if (!code) return showStatus('code.invalid', 'viewer');
  if (!globalThis.isSecureContext || !globalThis.RTCPeerConnection) return showStatus('connection.unsupported', 'viewer');
  stop();
  const current = ++epoch;
  $('viewer-code').value = code;
  $('viewer-code').disabled = true;
  $('viewer-name').disabled = true;
  $('viewer-connect').disabled = true;
  $('viewer-stop').hidden = false;
  const url = new URL(location.href);
  url.hash = code;
  history.replaceState(null, '', url);
  try {
    await session.connect(code, $('viewer-name').value);
    if (current === epoch) watchDetails();
  } catch (error) {
    if (current === epoch) stop(error?.message ?? 'connection.server-failed');
  }
}

async function playVideo() {
  const stream = $('remote-video').srcObject;
  try {
    await $('remote-video').play();
    if ($('remote-video').srcObject !== stream || stream === null) return;
    $('viewer-play').hidden = true;
    showStatus('viewer.receiving', 'viewer');
  } catch {
    if ($('remote-video').srcObject !== stream || stream === null) return;
    $('viewer-play').hidden = false;
    showStatus('viewer.play', 'viewer');
  }
}

$('role-camera').addEventListener('click', () => {
  if (parseCode(location.hash)) history.replaceState(null, '', location.pathname + location.search);
  selectMode('camera');
});
$('role-viewer').addEventListener('click', () => selectMode('viewer'));
$('camera-start').addEventListener('click', startCamera);
$('camera-stop').addEventListener('click', () => stop());
$('viewer-connect').addEventListener('click', connectViewer);
$('viewer-stop').addEventListener('click', () => stop());
$('viewer-play').addEventListener('click', playVideo);
$('viewer-fullscreen').addEventListener('click', async () => {
  try { await $('remote-video').requestFullscreen(); }
  catch { showStatus('viewer.fullscreen-failed', 'viewer'); }
});
$('camera-copy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText($('camera-link').value);
    $('copy-status').textContent = phrase('copy.done');
  } catch {
    $('camera-link').focus();
    $('camera-link').select();
    $('copy-status').textContent = phrase('copy.manual');
  }
});
window.addEventListener('pagehide', () => stop());
document.addEventListener('visibilitychange', () => {
  if (document.hidden && (!$('camera-stop').hidden || session.role === 'camera')) stop('camera.hidden');
});
window.addEventListener('hashchange', () => {
  const code = parseCode(location.hash);
  if (code) { selectMode('viewer'); $('viewer-code').value = code; }
});
const code = parseCode(location.hash);
selectMode(code ? 'viewer' : 'camera');
if (code) $('viewer-code').value = code;
