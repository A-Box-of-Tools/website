import { phrase, ltr } from './shared/phrases.js';
import { makeQr } from './shared/qr.js';
import { watchDiscovery } from './shared/peer-discovery.js';
import { wireHelpTooltip } from './shared/help-tooltip.js';
import { CameraCapture } from './capture.js';
import { CameraSession } from './session.js';
import { alertCapabilities, ViewerAlerts } from './alerts.js';
import { TOOL, makeCode, normalize, parseCode, viewerLink } from './protocol.js';

const $ = (id) => document.getElementById(id);
document.querySelectorAll('.camera-help').forEach(wireHelpTooltip);
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
let viewerAlerts = null;
let alertsRevision = 0;
let alertsTimer = null;
let alertsAttempts = 0;
let viewerAudioTrack = null;
let viewerWantsAudio = true;
let viewerAudioBlocked = false;
let playbackRevision = 0;
let viewerSoundSupported = false;
let cameraIntent = null;
let cameraResumeNeeded = false;
let cameraAudioResumeNeeded = false;
let cameraResuming = false;
let cameraStarting = false;
let resumeOnVisible = false;
let pageSuspended = false;
const watchedTracks = new WeakSet();
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
  cameraAudioResumeNeeded = false;
  cameraResuming = false;
  cameraStarting = false;
  resumeOnVisible = false;
  $('camera-start').disabled = false;
  $('camera-start').hidden = false;
  $('camera-start').textContent = phrase('camera.start');
  $('camera-name').disabled = false;
  $('camera-suggest').disabled = false;
  $('camera-discoverable').disabled = false;
  $('camera-audio').disabled = false;
  $('camera-audio-status').textContent = '';
  $('camera-bandwidth-status').textContent = '';
  $('camera-bandwidth-status').classList.remove('warn');
  $('camera-viewers').hidden = true;
  $('camera-viewer-count').textContent = '';
  $('camera-viewer-list').replaceChildren();
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
  if (document.fullscreenElement === $('viewer-video-frame')) document.exitFullscreen().catch(() => {});
  resetViewerAlerts();
  $('viewer-connect').disabled = false;
  $('viewer-connect').hidden = false;
  $('viewer-code').disabled = false;
  $('viewer-name').disabled = false;
  $('viewer-stop').hidden = true;
  $('viewer-video-panel').hidden = true;
  $('remote-video').srcObject = null;
  $('remote-video').muted = true;
  viewerAudioTrack = null;
  viewerWantsAudio = true;
  viewerAudioBlocked = false;
  playbackRevision += 1;
  $('viewer-listen').hidden = true;
  $('viewer-listen').setAttribute('aria-pressed', 'false');
  $('viewer-listen').textContent = phrase('viewer.listen');
  $('viewer-audio-status').textContent = '';
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
        button.addEventListener('click', () => {
          if (action === 'approve' && !session.approve(request.id)) showStatus('connection.busy', 'camera');
          else if (action === 'deny') session.deny(request.id);
        });
        row.append(button);
      }
      row.prepend(note);
      $('camera-requests').append(row);
    }
  },
  onViewers(viewers) {
    $('camera-viewers').hidden = viewers.length === 0;
    $('camera-viewer-count').textContent = phrase('camera.viewer-count', {
      count: ltr(viewers.length.toLocaleString(document.documentElement.lang)),
      limit: ltr(session.maxViewers.toLocaleString(document.documentElement.lang)),
    });
    const focused = document.activeElement?.dataset;
    $('camera-viewer-list').replaceChildren();
    for (const viewer of viewers) {
      const row = document.createElement('div');
      row.className = 'camera-request';
      row.dataset.peer = viewer.id;
      const label = document.createElement('p');
      label.textContent = viewer.note || phrase('camera.unnamed');
      const state = document.createElement('span');
      state.className = 'field-note';
      state.textContent = phrase(viewer.streaming ? 'camera.viewer-watching' : 'camera.viewer-preparing');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'ghost danger';
      button.dataset.action = 'disconnect';
      button.dataset.peer = viewer.id;
      button.textContent = phrase('camera.disconnect-viewer');
      button.addEventListener('click', () => {
        session.disconnectViewer(viewer.id);
        $('camera-stop').focus();
      });
      row.append(label, state, button);
      $('camera-viewer-list').append(row);
      if (focused?.action === 'disconnect' && focused.peer === viewer.id) button.focus();
    }
  },
  onBandwidth(key) {
    $('camera-bandwidth-status').textContent = key ? phrase(key) : '';
    $('camera-bandwidth-status').classList.toggle('warn', key === 'camera.bandwidth-unsupported');
  },
  onStream(stream) {
    const previous = $('remote-video').srcObject;
    if (previous !== stream) $('remote-video').srcObject = stream;
    const hasVideo = stream?.getVideoTracks().some((track) => track.readyState === 'live');
    $('viewer-video-panel').hidden = !hasVideo;
    if (stream) {
      updateViewerAudio();
      viewerAlerts?.attach(stream);
      if (hasVideo) { refreshViewerAlerts(); playVideo(); }
    } else resetViewerAlerts();
  },
  onDiscovery(publication) {
    if (!publication) { discovery?.unpublish(); return; }
    const { code, lease } = publication;
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

function resetViewerAlerts() {
  alertsRevision += 1;
  clearTimeout(alertsTimer);
  alertsTimer = null;
  alertsAttempts = 0;
  viewerSoundSupported = false;
  viewerAlerts?.disconnect();
  viewerAlerts = null;
  $('viewer-alert-options').hidden = true;
  $('viewer-motion-alert').checked = false;
  $('viewer-sound-alert').checked = false;
  $('viewer-alert-status').textContent = '';
  $('viewer-alert-status').classList.remove('warn');
}

function updateViewerAudio() {
  const video = $('remote-video');
  const track = video.srcObject?.getAudioTracks().find((item) => item.readyState === 'live');
  if (track && track !== viewerAudioTrack) {
    track.addEventListener('ended', () => {
      if (video.srcObject?.getAudioTracks().includes(track)) updateViewerAudio();
    });
  }
  viewerAudioTrack = track ?? null;
  $('viewer-listen').hidden = !track;
  video.muted = !track || !viewerWantsAudio || viewerAudioBlocked;
  const listening = Boolean(track) && !video.muted;
  $('viewer-listen').setAttribute('aria-pressed', String(listening));
  $('viewer-listen').textContent = phrase(listening ? 'viewer.mute' : 'viewer.listen');
  $('viewer-audio-status').textContent = phrase(track ? listening ? 'viewer.audio-listening' : viewerAudioBlocked ? 'viewer.audio-blocked' : 'viewer.audio-available' : 'viewer.audio-none');
  $('viewer-audio-status').classList.toggle('warn', Boolean(track) && viewerAudioBlocked);
  $('viewer-sound-alert').disabled = !viewerSoundSupported || (!track && !$('viewer-sound-alert').checked);
}

async function listenToAudio() {
  const video = $('remote-video');
  if (!viewerAudioTrack || activeRole !== 'viewer') return;
  viewerWantsAudio = video.muted;
  viewerAudioBlocked = false;
  playbackRevision += 1;
  updateViewerAudio();
  if (viewerWantsAudio) await playVideo();
}

async function refreshViewerAlerts() {
  const stream = $('remote-video').srcObject;
  if (!stream?.getVideoTracks().some((track) => track.readyState === 'live') || activeRole !== 'viewer') return;
  if (viewerAlerts) return;
  const current = epoch, revision = ++alertsRevision;
  const capabilities = await alertCapabilities().catch(() => ({ supported: false }));
  if (current !== epoch || revision !== alertsRevision || $('remote-video').srcObject !== stream) return;
  if (!capabilities.supported) {
    // A fresh visit may not have activated its tool worker when media arrives.
    // Retry briefly without leaving serviceWorker.ready pending indefinitely.
    if (globalThis.Notification?.requestPermission && ++alertsAttempts < 4) {
      clearTimeout(alertsTimer);
      alertsTimer = setTimeout(refreshViewerAlerts, 1000);
    }
    return;
  }
  const monitor = new ViewerAlerts({
    video: $('remote-video'), registration: capabilities.registration,
    title: phrase('alerts.title'), motionBody: phrase('alerts.motion-body'), soundBody: phrase('alerts.sound-body'),
    onStatus(key) {
      if (current !== epoch || viewerAlerts !== monitor) return;
      $('viewer-alert-status').textContent = phrase(key);
      $('viewer-alert-status').classList.toggle('warn', key === 'alerts.denied' || key === 'alerts.failed');
      if (key === 'alerts.denied' || key === 'alerts.failed') {
        $('viewer-motion-alert').checked = false;
        $('viewer-sound-alert').checked = false;
      }
    },
  });
  viewerAlerts = monitor;
  viewerSoundSupported = capabilities.sound;
  monitor.attach(stream);
  $('viewer-sound-option').hidden = !capabilities.sound;
  $('viewer-motion-alert').disabled = !capabilities.motion;
  $('viewer-sound-alert').disabled = !viewerAudioTrack || !capabilities.sound;
  $('viewer-alert-options').hidden = false;
  $('viewer-alert-status').textContent = phrase('alerts.off');
}

function changeViewerAlerts() {
  if (!viewerAlerts || activeRole !== 'viewer') return;
  const options = { motion: $('viewer-motion-alert').checked, sound: $('viewer-sound-alert').checked };
  updateViewerAudio();
  if (!options.motion && !options.sound) viewerAlerts.disable();
  else viewerAlerts.enable(options).catch(() => {});
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
  const audio = cameraAudioTrack(stream);
  if (cameraIntent?.audio && (!audio || audio.muted)) cameraAudioResumeNeeded = true;
  if (cameraAudioResumeNeeded && audio) audio.enabled = false;
  updateCameraAudio();
  for (const track of stream.getTracks()) {
    if (track.kind === 'video' && cameraIntent) cameraIntent.deviceId = track.getSettings?.().deviceId || cameraIntent.deviceId;
    if (watchedTracks.has(track)) continue;
    watchedTracks.add(track);
    // The microphone can belong to several successive camera streams. One
    // observer follows its current capture instead of retaining old streams.
    const valid = () => cameraIntent && capture.stream?.getTracks().includes(track);
    const interrupted = () => {
      if (!valid()) return;
      if (track.kind === 'audio') {
        track.enabled = false;
        cameraAudioResumeNeeded = true;
        resumeOnVisible ||= document.hidden || pageSuspended;
        updateCameraAudio();
        renderCameraRecovery();
      } else if (!capture.switching) pauseCameraCapture();
    };
    track.addEventListener('ended', interrupted);
    track.addEventListener('mute', interrupted);
    track.addEventListener('unmute', () => {
      if (!valid() || track.readyState !== 'live') return;
      if (track.kind === 'audio') updateCameraAudio();
      else {
        cameraResumeNeeded = false;
        session.state(session.hostState());
        if (!document.hidden) keepAwake(epoch);
      }
      renderCameraRecovery();
    });
  }
}

function cameraAudioTrack(stream = capture.stream) {
  return stream?.getAudioTracks().find((track) => track.readyState === 'live');
}

function updateCameraAudio() {
  const audio = cameraAudioTrack();
  $('camera-audio-status').textContent = !cameraIntent?.audio ? ''
    : phrase(cameraAudioResumeNeeded || !audio || audio.muted || !audio.enabled ? 'camera.audio-paused' : 'camera.audio-on');
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
  updateCameraAudio();
  const pairing = session.role === 'camera' && session.signalingLost;
  $('camera-start').hidden = !cameraResumeNeeded && !cameraAudioResumeNeeded && !cameraResuming && !pairing;
  $('camera-start').disabled = cameraResuming || Boolean(session.signalingRetry) || document.hidden || pageSuspended;
  $('camera-start').textContent = phrase(cameraResuming ? 'camera.resuming' : cameraResumeNeeded ? 'camera.resume'
    : cameraAudioResumeNeeded ? 'camera.resume-audio' : session.signalingRetry ? 'connection.reconnecting' : 'connection.resume');
  $('camera-stop').hidden = false;
  $('camera-name').value = cameraIntent.code;
  $('camera-name').disabled = true;
  $('camera-suggest').disabled = true;
  $('camera-discoverable').disabled = true;
  $('camera-audio').disabled = true;
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
  cameraAudioResumeNeeded = cameraIntent.audio;
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

async function resumeCamera({ manual = true } = {}) {
  if (!cameraIntent || cameraStarting || cameraResuming || capture.switching || document.hidden || pageSuspended) return;
  const previousAudio = cameraAudioTrack();
  const healthyVideo = capture.stream?.getVideoTracks().some((track) => track.readyState === 'live' && !track.muted);
  const resumeAudio = manual && !cameraResumeNeeded && cameraAudioResumeNeeded;
  if (!cameraResumeNeeded && session.role === 'camera' && healthyVideo
      && (!cameraIntent.audio || previousAudio)) {
    if (resumeAudio && previousAudio && !previousAudio.muted) {
      previousAudio.enabled = true;
      cameraAudioResumeNeeded = false;
      updateCameraAudio();
    }
    renderCameraRecovery();
    await session.restoreSignaling({ manual });
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
    const constraints = { video: identity.deviceId ? { deviceId: { exact: identity.deviceId } } : true, audio: identity.audio };
    const prepareAudio = (candidate) => {
      const audio = cameraAudioTrack(candidate);
      if (audio && (audio !== previousAudio || audio.muted || cameraAudioResumeNeeded)) {
        audio.enabled = false;
        cameraAudioResumeNeeded = true;
      }
    };
    if (session.role === 'camera') {
      change = session.prepareCameraChange({ preserveOnFailure: true });
      if (capture.stream) stream = await capture.switchDevice(identity.deviceId || '', async (candidate) => {
        if (current !== epoch || cameraIntent !== identity || document.hidden || pageSuspended) return false;
        prepareAudio(candidate);
        return change.commit(candidate);
      }, { audio: identity.audio });
      else {
        stream = await capture.start(constraints);
        if (current !== epoch || cameraIntent !== identity || stream === null) return;
        if (document.hidden || pageSuspended) { suspendCameraResources(); return; }
        prepareAudio(stream);
        if (!await change.commit(stream)) { capture.stop(); return; }
      }
    } else {
      stream = await capture.start(constraints);
      if (current !== epoch || cameraIntent !== identity || stream === null) return;
      if (document.hidden || pageSuspended) { suspendCameraResources(); return; }
      prepareAudio(stream);
      await session.startHost(stream, identity.code, identity);
    }
    if (current !== epoch || cameraIntent !== identity) return;
    if (stream === null) {
      cameraResumeNeeded = !capture.stream?.getVideoTracks().some((track) => track.readyState === 'live' && !track.muted);
      if (cameraResumeNeeded) showStatus('camera.resume-needed', 'camera');
      updateCameraAudio();
      return;
    }
    if (document.hidden || pageSuspended) {
      suspendCameraResources();
      return;
    }
    const audio = cameraAudioTrack(stream);
    if (resumeAudio && audio && !audio.muted) {
      audio.enabled = true;
      cameraAudioResumeNeeded = false;
    }
    showCameraStream(stream, current);
    showCameraIdentity(identity.code);
    cameraResumeNeeded = stream.getVideoTracks().some((track) => track.muted || track.readyState !== 'live');
    if (cameraResumeNeeded) showStatus('camera.paused', 'camera');
    else session.state(session.hostState());
    watchDetails();
    keepAwake(current);
    await refreshCameras();
  } catch {
    if (current !== epoch || cameraIntent !== identity) return;
    const restored = capture.stream?.getVideoTracks().some((track) => track.readyState === 'live' && !track.muted);
    cameraResumeNeeded = !restored;
    if (restored && session.role === 'camera') {
      session.state(session.hostState());
      keepAwake(current);
    } else showStatus('camera.resume-needed', 'camera');
  } finally {
    change?.cancel();
    if (current === epoch && cameraIntent === identity) {
      cameraResuming = false;
      cameraResumeNeeded = session.role !== 'camera'
        || !capture.stream?.getVideoTracks().some((track) => track.readyState === 'live' && !track.muted);
      if (identity.audio && !cameraAudioTrack()) cameraAudioResumeNeeded = true;
      if (capture.stream?.getVideoTracks().some((track) => track.readyState === 'live')) showCameraStream(capture.stream, current);
      updateCameraAudio();
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
  const audioEnded = cameraIntent.audio && !cameraAudioTrack();
  if (resumeOnVisible && (!track || session.role !== 'camera' || audioEnded)) {
    void resumeCamera({ manual: false });
  } else if (session.role === 'camera' && track && !track.muted) {
    cameraResumeNeeded = false;
    resumeOnVisible = false;
    renderCameraRecovery();
    $('camera-preview').play().catch(() => {});
    keepAwake(epoch);
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
  select.disabled = cameraResuming || cameraResumeNeeded || capture.switching;
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
    requireApproval: $('camera-require-approval').checked, deviceId: null,
    audio: $('camera-audio').checked, videoBudget: Number($('camera-bandwidth').value) };
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
  $('camera-audio').disabled = true;
  $('camera-stop').hidden = false;
  $('camera-stop').focus();
  showStatus('camera.permission', 'camera');
  try {
    const stream = await capture.start({ video: true, audio: cameraIntent.audio });
    if (current !== epoch || stream === null) return;
    if (document.hidden || pageSuspended) { suspendCameraResources(); return; }
    showCameraStream(stream, current);
    hostCode = code;
    if ($('camera-discoverable').checked) $('camera-publication-status').textContent = phrase('discovery.not-published');
    renderDiscovery();
    await session.startHost(stream, code, cameraIntent);
    if (current !== epoch) return;
    showCameraIdentity(code);
    watchDetails();
    keepAwake(current);
    refreshCameras();
    if (stream.getVideoTracks().some((track) => track.muted)) pauseCameraCapture();
    else renderCameraRecovery();
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

async function playVideo(retryAudio = false) {
  const video = $('remote-video'), stream = video.srcObject;
  if (!stream || activeRole !== 'viewer') return;
  const current = epoch, revision = ++playbackRevision;
  const valid = () => current === epoch && revision === playbackRevision && video.srcObject === stream && activeRole === 'viewer';
  if (retryAudio && viewerWantsAudio) viewerAudioBlocked = false;
  updateViewerAudio();
  try {
    await video.play();
    if (!valid()) return;
    $('viewer-play').hidden = true;
    globalThis.aboxToolComplete?.();
    showStatus('viewer.receiving', 'viewer');
  } catch {
    if (!valid()) return;
    if (viewerAudioTrack && !video.muted) {
      // Delayed approval can outlive the viewer's playback gesture. Keep the
      // video running silently, with one explicit action to retry audio.
      viewerAudioBlocked = true;
      updateViewerAudio();
      try {
        await video.play();
        if (!valid()) return;
        $('viewer-play').hidden = true;
        showStatus('viewer.receiving', 'viewer');
        return;
      } catch { if (!valid()) return; }
    }
    $('viewer-play').hidden = false;
    showStatus('viewer.play', 'viewer');
  }
}

function updateFullscreenControl() {
  const full = document.fullscreenElement === $('viewer-video-frame');
  $('viewer-fullscreen').setAttribute('aria-pressed', String(full));
  $('viewer-fullscreen').textContent = phrase(full ? 'viewer.fullscreen-exit' : 'viewer.fullscreen');
}

$('camera-start').addEventListener('click', startCamera);
$('camera-device').addEventListener('change', switchCamera);
$('camera-bandwidth').addEventListener('change', () => {
  if (cameraIntent) cameraIntent.videoBudget = Number($('camera-bandwidth').value);
  if (session.role === 'camera') session.setVideoBudget(Number($('camera-bandwidth').value));
});
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
$('viewer-play').addEventListener('click', () => playVideo(true));
$('viewer-listen').addEventListener('click', listenToAudio);
$('viewer-motion-alert').addEventListener('change', changeViewerAlerts);
$('viewer-sound-alert').addEventListener('change', changeViewerAlerts);
navigator.serviceWorker?.addEventListener('controllerchange', refreshViewerAlerts);
$('viewer-fullscreen').addEventListener('click', async () => {
  const frame = $('viewer-video-frame'), video = $('remote-video');
  if (activeRole !== 'viewer' || $('viewer-video-panel').hidden) return;
  const current = epoch;
  try {
    if (document.fullscreenElement === frame) await document.exitFullscreen();
    else if (frame.requestFullscreen) await frame.requestFullscreen();
    else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
    else throw new Error();
    if (current !== epoch && document.fullscreenElement === frame) await document.exitFullscreen();
  }
  catch { if (current === epoch) showStatus('viewer.fullscreen-failed', 'viewer'); }
});
document.addEventListener('fullscreenchange', updateFullscreenControl);
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
