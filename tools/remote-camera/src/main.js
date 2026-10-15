import { phrase, ltr } from './shared/phrases.js';
import { makeQr } from './shared/qr.js';
import { watchDiscovery } from './shared/peer-discovery.js';
import { CameraCapture } from './capture.js';
import { CameraSession } from './session.js';
import { TOOL, makeCode, normalize, parseCode, viewerLink } from './protocol.js';

const $ = (id) => document.getElementById(id);
let mode = 'camera';
let activeRole = null;
let epoch = 0;
let wake = null;
let wakePending = false;
let detailsTimer = null;
let discovery = null;
let discoveryState = 'connecting';
let foundCameras = [];
let hostCode = null;
let devicesRevision = 0;
let cameraIntent = null;
let cameraResumeNeeded = false;
let cameraResuming = false;
let cameraStarting = false;
let resumeOnVisible = false;
let pageSuspended = false;
const watchedStreams = new WeakMap();
const capture = new CameraCapture({ getUserMedia: (constraints) => {
  // Exclusive-camera retries can outlive the gesture that opened them.
  if (document.hidden || pageSuspended) throw new DOMException('', 'AbortError');
  return navigator.mediaDevices.getUserMedia(constraints);
} });

const warning = (key) => /failed|invalid|unsupported|denied|missing|busy|not-found|taken/.test(key);
function showStatus(key, role = mode) {
  const element = $(role === 'camera' ? 'camera-status' : 'viewer-status');
  element.textContent = phrase(key);
  element.classList.toggle('warn', warning(key));
}

function idleCamera() {
  cameraResumeNeeded = false;
  cameraResuming = false;
  cameraStarting = false;
  resumeOnVisible = false;
  $('camera-start').disabled = false;
  $('camera-start').hidden = false;
  $('camera-start').textContent = phrase('camera.start');
  $('camera-name').disabled = false;
  $('camera-suggest').disabled = false;
  $('camera-discoverable').disabled = false;
  $('camera-stop').hidden = true;
  $('camera-invite').hidden = true;
  $('camera-approval').hidden = true;
  $('camera-preview-panel').hidden = true;
  $('camera-preview').srcObject = null;
  $('camera-link').value = '';
  $('camera-code').textContent = '';
  $('camera-requests').replaceChildren();
  $('copy-status').textContent = '';
  $('camera-publication-status').textContent = '';
  $('camera-device-field').hidden = true;
  $('camera-device').disabled = true;
  $('camera-device').replaceChildren();
  $('camera-switch-status').textContent = '';
  devicesRevision += 1;
  hostCode = null;
  renderDiscovery();
}

function idleViewer() {
  $('viewer-connect').disabled = false;
  $('viewer-connect').hidden = false;
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
  visible: () => !document.hidden && !pageSuspended,
  onSignaling() {
    if (session.signalingLost) {
      discovery?.unpublish();
      showStatus(session.signalingRetry ? 'connection.reconnecting' : 'connection.unavailable', session.role);
    } else if (cameraResumeNeeded && session.role === 'camera') showStatus('camera.paused', 'camera');
    if (cameraIntent) renderCameraRecovery();
  },
  onState(key, role) {
    if (!role) return;
    const awaitingPairing = session.signalingLost && ['camera.waiting', 'camera.open-waiting', 'camera.streaming', 'connection.starting'].includes(key);
    showStatus(awaitingPairing ? session.signalingRetry ? 'connection.reconnecting' : 'connection.unavailable' : key, role);
    if (session.role === null) {
      const retain = role === 'camera' && cameraIntent !== null
        && ['connection.server-failed', 'connection.ended', 'camera.switch-ended', 'camera.ended', 'camera.paused'].includes(key);
      closeStopDialog();
      discovery?.unpublish();
      epoch += 1;
      clearDetails();
      if (role === 'camera') {
        cameraStarting = false;
        capture.stop(); releaseWake();
        $('camera-preview').srcObject = null;
        $('camera-preview-panel').hidden = true;
        if (retain) {
          cameraResumeNeeded = true;
          cameraResuming = false;
          resumeOnVisible = document.hidden || pageSuspended;
          showCameraIdentity(cameraIntent.code);
          renderCameraRecovery();
          showStatus('camera.resume-needed', 'camera');
        } else { cameraIntent = null; idleCamera(); }
      }
      else idleViewer();
      showActiveRole(retain ? 'camera' : null);
    } else if (role === 'camera' && key === 'camera.paused') {
      cameraResumeNeeded = true;
      renderCameraRecovery();
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
        button.disabled = Boolean(session.cameraChange) || capture.switching || cameraResumeNeeded || cameraResuming;
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
  onDiscovery({ code, lease }) {
    if (hostCode === code && $('camera-discoverable').checked) discovery?.publish(code, lease);
  },
});

function renderDiscovery() {
  const cameras = foundCameras.filter(({ code }) => code !== hostCode);
  $('discovery-status').textContent = phrase(discoveryState === 'ready'
    ? cameras.length ? 'discovery.ready' : 'discovery.empty' : `discovery.${discoveryState}`);
  $('discovery-list').replaceChildren();
  for (const { code } of cameras) {
    const row = document.createElement('li');
    const link = document.createElement('a');
    link.href = viewerLink(location.href, code);
    link.textContent = code;
    link.dir = 'ltr';
    link.addEventListener('click', (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (activeRole) return;
      $('viewer-code').value = code;
      connectViewer();
    });
    row.append(link);
    $('discovery-list').append(row);
  }
}

function startDiscovery() {
  discovery = watchDiscovery(`wss://rendezvous.abox.tools/discover?tool=${TOOL}`, {
    list(list) { foundCameras = list; renderDiscovery(); },
    status(state) { discoveryState = state; renderDiscovery(); },
    publication(state) {
      $('camera-publication-status').textContent = state ? phrase(`discovery.${state}`) : '';
    },
  });
}

function stop(key = 'connection.stopped') {
  // Explicit Stop and navigation retire recovery before asynchronous cleanup.
  cameraIntent = null;
  resumeOnVisible = false;
  closeStopDialog();
  epoch += 1;
  discovery?.unpublish();
  session.stop(key);
  capture.stop();
  releaseWake();
  idleCamera();
  idleViewer();
  clearDetails();
  showStatus('camera.ready', 'camera');
  showStatus('viewer.ready', 'viewer');
  showStatus(key);
  showActiveRole(null);
}

function closeStopDialog() {
  const dialog = $('camera-stop-dialog');
  if (dialog.open) dialog.close('cancel');
}

function stopCamera() {
  stop();
  $('camera-start').focus();
}

function requestCameraStop() {
  if (!session.hasViewers) return stopCamera();
  const dialog = $('camera-stop-dialog');
  dialog.showModal();
}

function showActiveRole(role) {
  activeRole = role;
  $('camera-panel').hidden = role === 'viewer';
  $('viewer-panel').hidden = role === 'camera';
  $('camera-discovery').hidden = role !== null;
  if (role) $('camera-workspace').dataset.active = role;
  else delete $('camera-workspace').dataset.active;
}

function fillViewerCode(code) {
  if (activeRole) stop();
  mode = 'viewer';
  $('viewer-code').value = code;
  showStatus('viewer.ready', 'viewer');
  $('viewer-code').focus();
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
  if (document.hidden || pageSuspended || wakePending || wake && !wake.released) return;
  wakePending = true;
  try {
    const lock = await navigator.wakeLock?.request('screen');
    if (!lock) return;
    if (current !== epoch || session.role !== 'camera' || document.hidden || pageSuspended) await lock.release();
    else wake = lock;
  } catch {}
  finally { wakePending = false; }
}

function captureError(error) {
  if (error?.name === 'NotAllowedError' || error?.name === 'SecurityError') return 'camera.denied';
  if (error?.name === 'NotFoundError' || error?.name === 'OverconstrainedError') return 'camera.missing';
  if (error?.message?.startsWith('camera.') || error?.message?.startsWith('connection.')) return error.message;
  return 'camera.busy';
}

function showApprovalPolicy() {
  const required = $('camera-require-approval').checked;
  $('camera-approval-policy').textContent = phrase(required ? 'camera.approval-required' : 'camera.open-access');
  $('camera-approval-policy').classList.toggle('warn', !required);
}

function showCameraStream(stream, current) {
  $('camera-preview').srcObject = stream;
  $('camera-preview-panel').hidden = false;
  $('camera-preview').play().catch(() => {});
  if (watchedStreams.get(stream) === current) return;
  watchedStreams.set(stream, current);
  for (const track of stream.getVideoTracks()) {
    if (cameraIntent) cameraIntent.deviceId = track.getSettings?.().deviceId || cameraIntent.deviceId;
    track.addEventListener('ended', () => {
      // Opening another camera can end the old hardware track. The switch
      // reconciles that result; a replaced stream must not stop its successor.
      if (current === epoch && capture.stream === stream && !capture.switching) pauseCameraCapture();
    });
    track.addEventListener('mute', () => {
      if (current === epoch && capture.stream === stream && !capture.switching) pauseCameraCapture();
    });
    track.addEventListener('unmute', () => {
      if (current !== epoch || capture.stream !== stream || !cameraIntent || track.readyState !== 'live') return;
      cameraResumeNeeded = false;
      resumeOnVisible = false;
      renderCameraRecovery();
      session.state(session.active === null ? 'camera.waiting' : 'camera.streaming');
      if (!document.hidden) keepAwake(current);
    });
  }
}

function showCameraIdentity(code) {
  hostCode = code;
  const link = viewerLink(location.href, code);
  $('camera-link').value = link;
  $('camera-code').textContent = code;
  $('camera-invite').hidden = false;
  qr(link);
  renderDiscovery();
}

function renderCameraRecovery() {
  if (!cameraIntent) return;
  const pairing = session.role === 'camera' && session.signalingLost;
  $('camera-start').hidden = !cameraResumeNeeded && !cameraResuming && !pairing;
  $('camera-start').disabled = cameraResuming || Boolean(session.signalingRetry) || document.hidden || pageSuspended;
  $('camera-start').textContent = phrase(cameraResuming ? 'camera.resuming' : pairing && !cameraResumeNeeded
    ? session.signalingRetry ? 'connection.reconnecting' : 'connection.resume' : 'camera.resume');
  $('camera-stop').hidden = false;
  $('camera-name').value = cameraIntent.code;
  $('camera-name').disabled = true;
  $('camera-suggest').disabled = true;
  $('camera-discoverable').disabled = true;
  $('camera-device').disabled = cameraResuming || cameraResumeNeeded || capture.switching;
  session.requests();
}

function pauseCameraCapture() {
  if (!cameraIntent) return;
  cameraResumeNeeded = true;
  resumeOnVisible = document.hidden || pageSuspended;
  releaseWake();
  if (!capture.stream?.getVideoTracks().some((track) => track.readyState === 'live')) {
    $('camera-preview').srcObject = null;
    $('camera-preview-panel').hidden = true;
  }
  renderCameraRecovery();
  showStatus('camera.paused', 'camera');
}

function suspendCameraResources() {
  if (!cameraIntent) return;
  closeStopDialog();
  epoch += 1;
  discovery?.unpublish();
  session.stop('camera.paused');
  capture.stop();
  releaseWake();
  $('camera-preview').srcObject = null;
  $('camera-preview-panel').hidden = true;
  cameraStarting = false;
  cameraResuming = false;
  cameraResumeNeeded = true;
  resumeOnVisible = true;
  showCameraIdentity(cameraIntent.code);
  renderCameraRecovery();
  showStatus('camera.paused', 'camera');
}

async function resumeCamera() {
  if (!cameraIntent || cameraStarting || cameraResuming || capture.switching || document.hidden || pageSuspended) return;
  if (!cameraResumeNeeded && session.role === 'camera'
      && capture.stream?.getVideoTracks().some((track) => track.readyState === 'live' && !track.muted)) {
    await session.restoreSignaling({ manual: true });
    return;
  }
  const identity = cameraIntent, current = ++epoch;
  cameraResuming = true;
  cameraResumeNeeded = false;
  resumeOnVisible = false;
  renderCameraRecovery();
  showStatus('camera.resuming', 'camera');
  let change = null;
  try {
    let stream;
    const constraints = { video: identity.deviceId ? { deviceId: { exact: identity.deviceId } } : true };
    if (session.role === 'camera') {
      change = session.prepareCameraChange({ preserveOnFailure: true });
      if (capture.stream) stream = await capture.switchDevice(identity.deviceId || '', async (candidate) => {
        if (document.hidden || pageSuspended) { pauseCameraCapture(); return false; }
        return change.commit(candidate);
      });
      else {
        stream = await capture.start(constraints);
        if (current !== epoch || cameraIntent !== identity || stream === null) return;
        if (document.hidden || pageSuspended) { suspendCameraResources(); return; }
        if (!await change.commit(stream)) return;
      }
    } else {
      stream = await capture.start(constraints);
      if (current !== epoch || cameraIntent !== identity || stream === null) return;
      if (document.hidden || pageSuspended) { suspendCameraResources(); return; }
      await session.startHost(stream, identity.code, identity);
    }
    if (current !== epoch || cameraIntent !== identity) return;
    if (stream === null) {
      cameraResumeNeeded = true;
      showStatus('camera.resume-needed', 'camera');
      return;
    }
    if (document.hidden || pageSuspended) {
      suspendCameraResources();
      return;
    }
    showCameraStream(stream, current);
    showCameraIdentity(identity.code);
    cameraResumeNeeded = stream.getVideoTracks().some((track) => track.muted || track.readyState !== 'live');
    if (cameraResumeNeeded) showStatus('camera.paused', 'camera');
    else session.state(session.active === null ? 'camera.waiting' : 'camera.streaming');
    watchDetails();
    keepAwake(current);
    await refreshCameras();
  } catch {
    if (current !== epoch || cameraIntent !== identity) return;
    const restored = capture.stream?.getVideoTracks().some((track) => track.readyState === 'live' && !track.muted);
    cameraResumeNeeded = !restored;
    if (restored && session.role === 'camera') {
      session.state(session.active === null ? 'camera.waiting' : 'camera.streaming');
      keepAwake(current);
    } else showStatus('camera.resume-needed', 'camera');
  } finally {
    change?.cancel();
    if (current === epoch && cameraIntent === identity) {
      cameraResuming = false;
      if (capture.stream?.getVideoTracks().some((track) => track.readyState === 'live')) showCameraStream(capture.stream, current);
      renderCameraRecovery();
    }
  }
}

function visibleCamera() {
  if (document.hidden || pageSuspended) return;
  discovery?.refresh();
  if (session.role === 'camera') void session.restoreSignaling();
  if (!cameraIntent) {
    if (session.role === 'viewer' && $('remote-video').srcObject) void playVideo();
    return;
  }
  const track = capture.stream?.getVideoTracks().find((item) => item.readyState === 'live');
  if (session.role === 'camera' && track && !track.muted) {
    cameraResumeNeeded = false;
    resumeOnVisible = false;
    renderCameraRecovery();
    $('camera-preview').play().catch(() => {});
    keepAwake(epoch);
  } else if (resumeOnVisible && (!track || session.role !== 'camera')) {
    void resumeCamera();
  } else renderCameraRecovery();
}

async function refreshCameras() {
  if (session.role !== 'camera' || capture.switching || !capture.stream || !navigator.mediaDevices?.enumerateDevices) return;
  const current = epoch, revision = ++devicesRevision, stream = capture.stream;
  let devices;
  try { devices = (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === 'videoinput' && device.deviceId); }
  catch { return; }
  if (current !== epoch || revision !== devicesRevision || capture.stream !== stream || capture.switching) return;
  const selected = stream.getVideoTracks()[0]?.getSettings?.().deviceId;
  const select = $('camera-device');
  select.replaceChildren();
  if (!devices.some((device) => device.deviceId === selected)) {
    const option = document.createElement('option');
    option.value = ''; option.disabled = true; option.selected = true;
    option.textContent = phrase('camera.current-device');
    select.append(option);
  }
  devices.forEach((device, index) => {
    const option = document.createElement('option');
    option.value = device.deviceId;
    option.textContent = device.label || phrase('camera.device-label', { number: ltr((index + 1).toLocaleString(document.documentElement.lang)) });
    select.append(option);
  });
  if (devices.some((device) => device.deviceId === selected)) select.value = selected;
  $('camera-device-field').hidden = devices.length < 2;
  select.disabled = false;
}

async function switchCamera() {
  if (document.hidden || pageSuspended) return;
  const deviceId = $('camera-device').value;
  if (!deviceId || session.role !== 'camera' || session.cameraChange || capture.switching || !capture.stream) return;
  if (capture.stream.getVideoTracks()[0]?.getSettings?.().deviceId === deviceId) return;
  const current = epoch;
  const operation = session.prepareCameraChange();
  $('camera-device').disabled = true;
  $('camera-switch-status').textContent = phrase('camera.switching');
  $('camera-switch-status').classList.remove('warn');
  try {
    const stream = await capture.switchDevice(deviceId, operation.commit);
    if (current !== epoch || stream === null) return;
    showCameraStream(stream, current);
    $('camera-switch-status').textContent = phrase('camera.switched');
  } catch {
    if (current !== epoch) return;
    if (capture.stream?.getVideoTracks().some((track) => track.readyState === 'live')) {
      showCameraStream(capture.stream, current);
      $('camera-switch-status').textContent = phrase('camera.switch-failed');
      $('camera-switch-status').classList.add('warn');
    } else stop('camera.switch-ended');
  } finally {
    operation.cancel();
    if (current === epoch && session.role === 'camera') {
      session.requests();
      $('camera-device').disabled = false;
      await refreshCameras();
    }
  }
}

async function startCamera() {
  if (cameraIntent) return resumeCamera();
  if (document.hidden || pageSuspended) return;
  const code = normalize($('camera-name').value);
  if (!code) return showStatus('code.name-invalid', 'camera');
  if (!globalThis.isSecureContext || !navigator.mediaDevices?.getUserMedia) return showStatus('camera.unsupported', 'camera');
  if (!globalThis.RTCPeerConnection) return showStatus('connection.unsupported', 'camera');
  stop();
  mode = 'camera';
  cameraIntent = { code, discoverable: $('camera-discoverable').checked,
    requireApproval: $('camera-require-approval').checked, deviceId: null };
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  showActiveRole('camera');
  const current = ++epoch;
  cameraStarting = true;
  $('camera-start').disabled = true;
  $('camera-start').hidden = true;
  $('camera-name').value = code;
  $('camera-name').disabled = true;
  $('camera-suggest').disabled = true;
  $('camera-discoverable').disabled = true;
  $('camera-stop').hidden = false;
  $('camera-stop').focus();
  showStatus('camera.permission', 'camera');
  try {
    const stream = await capture.start();
    if (current !== epoch || stream === null) return;
    if (document.hidden || pageSuspended) { suspendCameraResources(); return; }
    showCameraStream(stream, current);
    hostCode = code;
    if ($('camera-discoverable').checked) $('camera-publication-status').textContent = phrase('discovery.not-published');
    renderDiscovery();
    await session.startHost(stream, code, { discoverable: $('camera-discoverable').checked, requireApproval: $('camera-require-approval').checked });
    if (current !== epoch) return;
    showCameraIdentity(code);
    watchDetails();
    keepAwake(current);
    refreshCameras();
    if (stream.getVideoTracks().some((track) => track.muted)) pauseCameraCapture();
  } catch (error) {
    if (current === epoch) stop(captureError(error));
  } finally {
    if (current === epoch) cameraStarting = false;
  }
}

async function connectViewer() {
  if (activeRole === 'viewer') return;
  const code = parseCode($('viewer-code').value);
  if (!code) return showStatus('code.invalid', 'viewer');
  if (!globalThis.isSecureContext || !globalThis.RTCPeerConnection) return showStatus('connection.unsupported', 'viewer');
  stop();
  mode = 'viewer';
  showActiveRole('viewer');
  const current = ++epoch;
  $('viewer-code').value = code;
  $('viewer-code').disabled = true;
  $('viewer-name').disabled = true;
  $('viewer-connect').disabled = true;
  $('viewer-connect').hidden = true;
  $('viewer-stop').hidden = false;
  $('viewer-stop').focus();
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
    globalThis.aboxToolComplete?.();
    showStatus('viewer.receiving', 'viewer');
  } catch {
    if ($('remote-video').srcObject !== stream || stream === null) return;
    $('viewer-play').hidden = false;
    showStatus('viewer.play', 'viewer');
  }
}

$('camera-start').addEventListener('click', startCamera);
$('camera-device').addEventListener('change', switchCamera);
$('camera-require-approval').addEventListener('change', () => {
  showApprovalPolicy();
  if (cameraIntent) cameraIntent.requireApproval = $('camera-require-approval').checked;
  session.setApprovalRequired($('camera-require-approval').checked);
});
navigator.mediaDevices?.addEventListener?.('devicechange', refreshCameras);
$('camera-suggest').addEventListener('click', () => { $('camera-name').value = makeCode(); });
$('camera-name').addEventListener('change', () => { $('camera-name').value = normalize($('camera-name').value); });
$('discovery-refresh').addEventListener('click', () => discovery?.refresh());
$('camera-stop').addEventListener('click', requestCameraStop);
$('camera-stop-confirm').addEventListener('click', () => {
  if (activeRole === 'camera') stopCamera();
});
$('viewer-connect').addEventListener('click', connectViewer);
$('viewer-stop').addEventListener('click', () => { stop(); $('viewer-connect').focus(); });
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
window.addEventListener('pagehide', (event) => {
  pageSuspended = true;
  if (event.persisted && cameraIntent) {
    suspendCameraResources();
  } else stop();
  discovery?.close(); discovery = null;
});
window.addEventListener('pageshow', () => {
  pageSuspended = false;
  if (!discovery) startDiscovery();
  visibleCamera();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    releaseWake();
    if (cameraIntent && (cameraStarting || cameraResuming || capture.switching)) suspendCameraResources();
    else if (cameraIntent) resumeOnVisible = true;
  } else visibleCamera();
});
window.addEventListener('hashchange', () => {
  const code = parseCode(location.hash);
  if (code) fillViewerCode(code);
});
$('privacy-toggle').addEventListener('click', () => {
  const panel = $('privacy-panel');
  const open = panel.hidden;
  panel.hidden = !open;
  $('privacy-toggle').setAttribute('aria-expanded', String(open));
});
const code = parseCode(location.hash);
$('camera-name').value = makeCode();
showActiveRole(null);
if (code) fillViewerCode(code);
startDiscovery();
showApprovalPolicy();

// The frame keeps its warning until every control has been initialised.
$('boot-warning')?.remove();
