import { BroadcastSession } from './session.js';
import { phrase } from './shared/phrases.js';
import { makeQr } from './shared/qr.js';

// The public page explains setup. Only the helper's local shell may connect.
if (document.documentElement.hasAttribute('data-local-broadcast')) {
  activateLocalChannel();
}

// The public setup page has no pairing step, but its module has still started.
document.getElementById('boot-warning')?.remove();

function activateLocalChannel() {
  const element = id => document.getElementById(`wt-${id}`);
  const ui = Object.fromEntries([
    'setup', 'local', 'role', 'status-text', 'status-dot', 'error', 'error-text',
    'retry', 'host', 'start', 'listener-count', 'transmit', 'hold', 'toggle',
    'microphone', 'microphone-note', 'end', 'invite', 'address', 'link', 'copy',
    'invite-feedback', 'qr', 'qr-error', 'listener', 'listening', 'playback-note',
    'mute', 'leave', 'audio',
  ].map(id => [id, element(id)]));
  ui.setup.hidden = true;
  ui.local.hidden = false;

  const fragment = new URLSearchParams(location.hash.slice(1));
  const hostToken = fragment.get('host');
  const listenerToken = fragment.get('listen');
  const role = hostToken && !listenerToken ? 'host' : listenerToken && !hostToken ? 'listener' : null;
  const token = role === 'host' ? hostToken : listenerToken;
  const validToken = role && /^[A-Za-z0-9_-]{43}$/.test(token);
  const errors = new Set(['error-access', 'error-full', 'error-microphone', 'error-connection']);
  let session = null;
  let configured = false;
  let initializing = false;
  let configRetry = null;
  let configController = null;
  let pageSuspended = false;
  let starting = false;
  let hostActive = false;
  let sourceEpoch = 0;
  let held = false;
  let latched = false;
  let microphoneMuted = false;
  let listenerMuted = false;
  let playbackBlocked = false;
  let listenerLeft = false;
  let listenerEnded = false;
  let listenerCount = 0;
  let currentStream = null;
  let stateTalking = false;

  function updateHostControls() {
    const talking = hostActive && !microphoneMuted && (held || latched);
    ui.start.hidden = hostActive;
    ui.start.disabled = starting;
    ui.transmit.hidden = !hostActive;
    ui.invite.hidden = !hostActive || !ui.address.options.length;
    ui.hold.disabled = !hostActive || microphoneMuted;
    ui.toggle.disabled = !hostActive || microphoneMuted;
    ui.hold.setAttribute('aria-pressed', String(talking));
    ui.hold.textContent = phrase(held && talking ? 'hold-talking' : 'hold-talk');
    ui.toggle.setAttribute('aria-pressed', String(latched));
    ui.toggle.textContent = phrase(latched ? 'toggle-stop' : 'toggle-start');
    ui.microphone.setAttribute('aria-pressed', String(microphoneMuted));
    ui.microphone.textContent = phrase(microphoneMuted ? 'microphone-unmute' : 'microphone-mute');
    ui['microphone-note'].hidden = !microphoneMuted;
    ui['listener-count'].textContent = phrase(listenerCount === 1 ? 'host-count-one' : 'host-count', { count: listenerCount });
  }

  function updateListenerControls() {
    const silent = listenerMuted || playbackBlocked;
    ui.audio.muted = listenerMuted;
    ui.mute.textContent = phrase(silent ? 'listener-unmute' : 'listener-mute');
    ui.mute.setAttribute('aria-pressed', String(silent));
    ui.mute.disabled = listenerLeft || listenerEnded;
    ui.leave.disabled = listenerLeft;
    ui['playback-note'].hidden = !playbackBlocked;
    ui.listening.dataset.talking = String(stateTalking && !silent);
  }

  function renderState(key, detail = {}) {
    if (typeof detail.listeners === 'number') listenerCount = detail.listeners;
    if (role === 'host' && (key === 'host-ready' || key === 'host-talking' || key === 'host-reconnecting')) hostActive = true;
    if (role === 'host' && (key === 'broadcast-ended' || errors.has(key))) hostActive = false;
    if (key === 'broadcast-ended' && role === 'listener') listenerEnded = true;
    if (key === 'listener-left') listenerLeft = true;
    const talking = key === 'host-talking' || key === 'listener-talking';
    stateTalking = talking;
    ui['status-text'].textContent = phrase(key);
    ui['status-dot'].dataset.state = talking ? 'talking' : key === 'host-ready' || key === 'listener-listening' ? 'ready' : 'waiting';
    ui.error.hidden = !errors.has(key);
    ui['error-text'].textContent = errors.has(key) ? phrase(key) : '';
    ui.retry.hidden = role !== 'host' || key === 'error-access';
    updateHostControls();
    updateListenerControls();
  }

  function updateTransmission() {
    session?.setTalking(hostActive && !microphoneMuted && (held || latched));
    updateHostControls();
  }

  function releaseTransmission() {
    held = false;
    latched = false;
    updateTransmission();
  }

  async function playAudio() {
    if (!currentStream || listenerMuted || listenerLeft || listenerEnded) return;
    const stream = currentStream;
    try {
      await ui.audio.play();
      if (currentStream === stream) playbackBlocked = false;
    } catch {
      if (currentStream === stream) playbackBlocked = true;
    }
    updateListenerControls();
  }

  function receiveStream(stream) {
    currentStream = stream;
    ui.audio.srcObject = stream;
    if (!stream) ui.audio.pause();
    else void playAudio();
    updateListenerControls();
  }

  function updateInvitation() {
    ui.link.value = ui.address.value;
    ui['invite-feedback'].textContent = '';
    try {
      const qr = makeQr(ui.link.value, { level: 'M' });
      const scale = Math.max(1, Math.floor(220 / (qr.size + 8)));
      const width = (qr.size + 8) * scale;
      ui.qr.width = width;
      ui.qr.height = width;
      const context = ui.qr.getContext('2d');
      context.fillStyle = '#fff';
      context.fillRect(0, 0, width, width);
      context.fillStyle = '#000';
      for (let row = 0; row < qr.size; row++) {
        for (let column = 0; column < qr.size; column++) {
          if (qr.modules[row * qr.size + column]) context.fillRect((column + 4) * scale, (row + 4) * scale, scale, scale);
        }
      }
      ui.qr.hidden = false;
      ui['qr-error'].hidden = true;
    } catch {
      ui.qr.hidden = true;
      ui['qr-error'].hidden = false;
    }
  }

  function setInvitations(urls) {
    ui.address.replaceChildren();
    for (const value of Array.isArray(urls) ? urls : []) {
      try {
        const url = new URL(value);
        const receiverToken = new URLSearchParams(url.hash.slice(1)).get('listen');
        if (!['http:', 'https:'].includes(url.protocol) || !/^[A-Za-z0-9_-]{43}$/.test(receiverToken || '')) continue;
        const option = document.createElement('option');
        option.value = url.href;
        option.textContent = url.host;
        ui.address.append(option);
      } catch {
        // An unusable address must never become a QR invitation.
      }
    }
    const lanOption = Array.from(ui.address.options).find(option => !['localhost', '127.0.0.1', '[::1]'].includes(new URL(option.value).hostname));
    if (lanOption) ui.address.value = lanOption.value;
    if (ui.address.options.length) updateInvitation();
  }

  async function configure() {
    if (initializing || configured || !validToken || listenerLeft || pageSuspended) return;
    clearTimeout(configRetry);
    initializing = true;
    renderState('config-connecting');
    const controller = new AbortController();
    configController = controller;
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch('/api/config', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
        signal: controller.signal,
      });
      if (pageSuspended) return;
      if (response.status === 401 || response.status === 403) {
        renderState('error-access');
        return;
      }
      if (!response.ok) throw new Error();
      const config = await response.json();
      if (pageSuspended) return;
      if (config.role !== role) {
        renderState('error-access');
        return;
      }
      configured = true;
      ui.role.textContent = phrase(role === 'host' ? 'host-role' : 'listener-role');
      ui.host.hidden = role !== 'host';
      ui.listener.hidden = role !== 'listener';
      session = new BroadcastSession({ role, token, onState: renderState, onStream: receiveStream });
      if (role === 'host') {
        setInvitations(config.urls);
        renderState('host-idle');
      } else {
        await session.start();
      }
    } catch {
      if (pageSuspended) return;
      renderState(role === 'listener' ? 'listener-reconnecting' : 'error-connection');
      if (role === 'listener' && !listenerLeft) configRetry = setTimeout(() => void configure(), 1000);
    } finally {
      clearTimeout(timeout);
      if (configController === controller) configController = null;
      initializing = false;
    }
  }

  async function startHost() {
    if (!configured || !session || starting || hostActive) return;
    starting = true;
    const epoch = ++sourceEpoch;
    held = false;
    latched = false;
    updateHostControls();
    try {
      const success = await session.start();
      if (epoch !== sourceEpoch) return;
      hostActive = success;
    } catch {
      if (epoch === sourceEpoch) renderState('error-connection');
    } finally {
      if (epoch === sourceEpoch) {
        starting = false;
        updateHostControls();
      }
    }
  }

  function stopHiddenSource() {
    if (role !== 'host' || (!hostActive && !starting)) return;
    sourceEpoch++;
    releaseTransmission();
    session?.stop({ notify: false, state: null });
    starting = false;
    hostActive = false;
    renderState('host-hidden');
  }

  ui.start.addEventListener('click', () => void startHost());
  ui.retry.addEventListener('click', () => configured ? void startHost() : void configure());
  ui.hold.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !hostActive || microphoneMuted) return;
    event.preventDefault();
    ui.hold.focus();
    ui.hold.setPointerCapture(event.pointerId);
    held = true;
    updateTransmission();
  });
  const releaseHeld = () => {
    held = false;
    updateTransmission();
  };
  ui.hold.addEventListener('pointerup', releaseHeld);
  ui.hold.addEventListener('pointercancel', releaseHeld);
  ui.hold.addEventListener('lostpointercapture', releaseHeld);
  ui.hold.addEventListener('blur', releaseHeld);
  ui.hold.addEventListener('contextmenu', event => event.preventDefault());
  document.addEventListener('keydown', event => {
    if (role !== 'host' || !hostActive || microphoneMuted || event.repeat) return;
    const target = event.target;
    const space = event.code === 'Space' && !target.closest('input, select, textarea, [contenteditable="true"]') && (!target.closest('button, a, summary') || target === ui.hold);
    const enter = event.key === 'Enter' && target === ui.hold;
    if (!space && !enter) return;
    event.preventDefault();
    held = true;
    updateTransmission();
  });
  document.addEventListener('keyup', event => {
    if (role === 'host' && (event.code === 'Space' || (event.key === 'Enter' && event.target === ui.hold))) {
      event.preventDefault();
      releaseHeld();
    }
  });
  ui.toggle.addEventListener('click', () => {
    latched = !latched;
    updateTransmission();
  });
  ui.microphone.addEventListener('click', () => {
    microphoneMuted = !microphoneMuted;
    if (microphoneMuted) {
      held = false;
      latched = false;
    }
    updateTransmission();
  });
  ui.end.addEventListener('click', () => {
    sourceEpoch++;
    releaseTransmission();
    session?.stop({ notify: true });
    starting = false;
    hostActive = false;
    listenerCount = 0;
    renderState('broadcast-ended');
  });
  ui.address.addEventListener('change', updateInvitation);
  ui.link.addEventListener('click', () => ui.link.select());
  ui.copy.addEventListener('click', async () => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(ui.link.value);
      else {
        ui.link.focus();
        ui.link.select();
        if (!document.execCommand('copy')) throw new Error();
      }
      ui['invite-feedback'].textContent = phrase('copy-success');
    } catch {
      ui.link.focus();
      ui.link.select();
      ui['invite-feedback'].textContent = phrase('copy-error');
    }
  });
  ui.mute.addEventListener('click', () => {
    listenerMuted = playbackBlocked ? false : !listenerMuted;
    playbackBlocked = false;
    updateListenerControls();
    if (!listenerMuted) void playAudio();
  });
  ui.leave.addEventListener('click', () => {
    listenerLeft = true;
    clearTimeout(configRetry);
    session?.stop({ notify: true });
    receiveStream(null);
    renderState('listener-left');
  });
  window.addEventListener('blur', () => {
    if (role === 'host') releaseTransmission();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopHiddenSource();
  });
  window.addEventListener('pagehide', () => {
    pageSuspended = true;
    configController?.abort();
    clearTimeout(configRetry);
    if (role === 'host') stopHiddenSource();
    else {
      session?.stop({ notify: false, state: null });
      receiveStream(null);
    }
  });
  window.addEventListener('pageshow', event => {
    pageSuspended = false;
    if (event.persisted && role === 'listener' && !listenerLeft && !listenerEnded) {
      if (session) void session.start();
      else void configure();
    } else if (event.persisted && !configured) {
      void configure();
    }
  });

  if (!validToken) renderState('error-access');
  else void configure();
}
