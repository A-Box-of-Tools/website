import { BroadcastSession } from './session.js';
import { phrase } from './shared/phrases.js';
import { makeQr } from './shared/qr.js';

activateChannel();
document.getElementById('boot-warning')?.remove();

function activateChannel() {
  const element = id => document.getElementById(`wt-${id}`);
  const ui = Object.fromEntries([
    'role', 'host-intro', 'status-text', 'status-dot', 'error', 'error-text',
    'host', 'start', 'listener-count', 'transmit', 'hold', 'toggle',
    'microphone', 'microphone-note', 'end', 'invite', 'link', 'copy',
    'invite-feedback', 'qr', 'qr-error', 'listener', 'listening', 'playback-note',
    'mute', 'leave', 'audio',
  ].map(id => [id, element(id)]));
  const hostStorage = 'walkie-talkie.host';
  const listenerStorage = 'walkie-talkie.listener';
  const pageUrl = new URL(location.href);
  pageUrl.hash = '';
  const fragment = new URLSearchParams(location.hash.slice(1));
  const hasInvitation = fragment.has('code') || fragment.has('listen');
  const validCode = value => typeof value === 'string' && /^[0-9a-f]{64}$/i.test(value);
  const validKey = value => typeof value === 'string' && /^[A-Za-z0-9_-]{43}$/.test(value);
  const validIdentity = value => value && validCode(value.code) && validKey(value.key);

  function readStored(key) {
    try {
      return JSON.parse(sessionStorage.getItem(key));
    } catch {
      return null;
    }
  }

  function writeStored(key, value) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  function removeStored(key) {
    try {
      sessionStorage.removeItem(key);
    } catch {
      // A channel remains usable when browser storage is unavailable.
    }
  }

  const cachedListener = readStored(listenerStorage);
  let listenerIdentity = hasInvitation ? { code: fragment.get('code'), key: fragment.get('listen'), muted: false, ended: false } : validIdentity(cachedListener) ? cachedListener : null;
  const role = hasInvitation || listenerIdentity ? 'listener' : 'host';
  if (validIdentity(listenerIdentity)) {
    listenerIdentity.code = listenerIdentity.code.toLowerCase();
    if (hasInvitation && writeStored(listenerStorage, listenerIdentity)) {
      try {
        history.replaceState(history.state, '', pageUrl.href);
      } catch {
        // Keeping the fragment still allows receivers to reload their invitation.
      }
    }
  }
  const cachedHost = readStored(hostStorage);
  let credentials = validIdentity(cachedHost) && validKey(cachedHost.listenKey) ? cachedHost : null;
  const errors = new Set(['error-access', 'error-full', 'error-microphone', 'error-connection', 'error-secure-context', 'error-browser']);
  let session = null;
  let sessionGeneration = 0;
  let starting = false;
  let hostActive = false;
  let canTransmit = false;
  let sourceEpoch = 0;
  let activePointer = null;
  let keyboardHeld = false;
  let heldKey = null;
  let latched = false;
  let microphoneMuted = false;
  let listenerMuted = Boolean(listenerIdentity?.muted);
  let playbackBlocked = false;
  let listenerLeft = false;
  let listenerEnded = Boolean(listenerIdentity?.ended);
  let listenerCount = 0;
  let currentStream = null;
  let stateTalking = false;
  let pageSuspended = false;

  ui.role.textContent = phrase(role === 'host' ? 'host-role' : 'listener-role');
  ui.host.hidden = role !== 'host';
  ui.listener.hidden = role !== 'listener';
  ui['host-intro'].hidden = role !== 'host';

  const held = () => activePointer !== null || keyboardHeld;

  function updateHostControls() {
    const talking = hostActive && canTransmit && !microphoneMuted && (held() || latched);
    ui.start.hidden = hostActive;
    ui.start.disabled = starting;
    ui.transmit.hidden = !hostActive;
    ui.invite.hidden = !hostActive || !ui.link.value;
    ui.hold.disabled = !hostActive || !canTransmit || microphoneMuted;
    ui.toggle.disabled = !hostActive || !canTransmit || microphoneMuted;
    ui.hold.setAttribute('aria-pressed', String(talking));
    ui.hold.textContent = phrase(held() && talking ? 'hold-talking' : 'hold-talk');
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
    if (role === 'host' && ['host-ready', 'host-talking', 'host-reconnecting'].includes(key)) {
      hostActive = true;
      canTransmit = Boolean(detail.signaling || detail.directReady || detail.listeners > 0);
      if (!canTransmit) {
        activePointer = null;
        keyboardHeld = false;
        heldKey = null;
        latched = false;
      }
    }
    if (role === 'host' && (['host-idle', 'host-hidden', 'broadcast-ended'].includes(key) || errors.has(key))) {
      hostActive = false;
      canTransmit = false;
      activePointer = null;
      keyboardHeld = false;
      heldKey = null;
      latched = false;
    }
    if (key === 'broadcast-ended' && role === 'listener') {
      listenerEnded = true;
      if (validIdentity(listenerIdentity)) {
        listenerIdentity.ended = true;
        writeStored(listenerStorage, listenerIdentity);
      }
    }
    if (key === 'listener-left') listenerLeft = true;
    stateTalking = key === 'host-talking' || key === 'listener-talking';
    ui['status-text'].textContent = phrase(key);
    ui['status-dot'].dataset.state = stateTalking ? 'talking' : key === 'host-ready' || key === 'listener-listening' ? 'ready' : 'waiting';
    ui.error.hidden = !errors.has(key);
    ui['error-text'].textContent = errors.has(key) ? phrase(key) : '';
    updateHostControls();
    updateListenerControls();
  }

  function updateTransmission() {
    session?.setTalking(hostActive && canTransmit && !microphoneMuted && (held() || latched));
    updateHostControls();
  }

  function releaseTransmission() {
    activePointer = null;
    keyboardHeld = false;
    heldKey = null;
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

  function createSession(identity) {
    const generation = ++sessionGeneration;
    session = new BroadcastSession({
      role,
      code: identity.code,
      key: identity.key,
      listenKey: role === 'host' ? identity.listenKey : undefined,
      onState: (key, detail) => {
        if (generation !== sessionGeneration) return;
        if (role === 'host' && key === 'error-microphone') {
          sourceEpoch++;
          starting = false;
        }
        renderState(key, detail);
      },
      onStream: stream => {
        if (generation === sessionGeneration) receiveStream(stream);
      },
    });
    return session;
  }

  function drawInvitation() {
    const invitation = new URL(pageUrl.href);
    invitation.hash = new URLSearchParams({ code: credentials.code, listen: credentials.listenKey }).toString();
    ui.link.value = invitation.href;
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

  function randomKey() {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  async function channelCode(key) {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key));
    return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
  }

  async function prepareCredentials() {
    if (credentials && await channelCode(credentials.key) === credentials.code) return credentials;
    const key = randomKey();
    credentials = { code: await channelCode(key), key, listenKey: randomKey() };
    writeStored(hostStorage, credentials);
    return credentials;
  }

  async function startHost() {
    if (starting || hostActive || pageSuspended) return;
    if (!window.isSecureContext) {
      renderState('error-secure-context');
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || !globalThis.crypto?.subtle || !window.RTCPeerConnection) {
      renderState('error-browser');
      return;
    }
    starting = true;
    const epoch = ++sourceEpoch;
    releaseTransmission();
    renderState('host-starting');
    try {
      const identity = await prepareCredentials();
      if (epoch !== sourceEpoch || pageSuspended || document.hidden) return;
      if (session) {
        sessionGeneration++;
        session.stop({ notify: false, state: null });
      }
      const currentSession = createSession(identity);
      drawInvitation();
      const success = await currentSession.start();
      if (epoch !== sourceEpoch || pageSuspended || document.hidden) return;
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
    if (role !== 'host' || (!hostActive && !starting && !session)) return;
    sourceEpoch++;
    releaseTransmission();
    sessionGeneration++;
    session?.stop({ notify: false, state: null });
    session = null;
    starting = false;
    hostActive = false;
    listenerCount = 0;
    renderState('host-hidden');
  }

  async function startListener() {
    if (listenerLeft || listenerEnded || pageSuspended || !validIdentity(listenerIdentity)) return;
    if (!globalThis.crypto?.subtle || !window.RTCPeerConnection) {
      renderState('error-browser');
      return;
    }
    renderState('listener-connecting');
    const currentSession = createSession(listenerIdentity);
    try {
      await currentSession.start();
    } catch {
      if (session === currentSession) renderState('error-connection');
    }
  }

  ui.start.addEventListener('click', () => void startHost());
  ui.hold.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !hostActive || !canTransmit || microphoneMuted || activePointer !== null) return;
    event.preventDefault();
    ui.hold.focus();
    ui.hold.setPointerCapture(event.pointerId);
    latched = false;
    activePointer = event.pointerId;
    updateTransmission();
  });
  const releasePointer = event => {
    if (event.pointerId !== activePointer) return;
    activePointer = null;
    updateTransmission();
  };
  ui.hold.addEventListener('pointerup', releasePointer);
  ui.hold.addEventListener('pointercancel', releasePointer);
  ui.hold.addEventListener('lostpointercapture', releasePointer);
  ui.hold.addEventListener('blur', () => {
    activePointer = null;
    keyboardHeld = false;
    heldKey = null;
    updateTransmission();
  });
  ui.hold.addEventListener('contextmenu', event => event.preventDefault());
  document.addEventListener('keydown', event => {
    if (role !== 'host' || !hostActive || !canTransmit || microphoneMuted) return;
    const target = event.target instanceof Element ? event.target : document.body;
    const space = event.code === 'Space' && !target.closest('input, select, textarea, [contenteditable="true"]') && (!target.closest('button, a, summary') || target === ui.hold);
    const enter = event.key === 'Enter' && target === ui.hold;
    if (!space && !enter) return;
    event.preventDefault();
    if (event.repeat) return;
    latched = false;
    keyboardHeld = true;
    heldKey = event.code || event.key;
    updateTransmission();
  });
  document.addEventListener('keyup', event => {
    if (!keyboardHeld || (event.code || event.key) !== heldKey) return;
    event.preventDefault();
    keyboardHeld = false;
    heldKey = null;
    updateTransmission();
  });
  ui.toggle.addEventListener('click', () => {
    if (!hostActive || !canTransmit || microphoneMuted) return;
    latched = !latched;
    updateTransmission();
  });
  ui.microphone.addEventListener('click', () => {
    microphoneMuted = !microphoneMuted;
    if (microphoneMuted) releaseTransmission();
    else updateTransmission();
  });
  ui.end.addEventListener('click', () => {
    sourceEpoch++;
    releaseTransmission();
    sessionGeneration++;
    session?.stop({ notify: true, state: null });
    session = null;
    credentials = null;
    removeStored(hostStorage);
    starting = false;
    hostActive = false;
    listenerCount = 0;
    ui.link.value = '';
    renderState('broadcast-ended');
  });
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
    if (validIdentity(listenerIdentity)) {
      listenerIdentity.muted = listenerMuted;
      writeStored(listenerStorage, listenerIdentity);
    }
    updateListenerControls();
    if (!listenerMuted) void playAudio();
  });
  ui.leave.addEventListener('click', () => {
    listenerLeft = true;
    sessionGeneration++;
    session?.stop({ notify: true, state: null });
    session = null;
    removeStored(listenerStorage);
    try {
      history.replaceState(history.state, '', pageUrl.href);
    } catch {
      // Leaving still stops this receiver when its address cannot be changed.
    }
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
    if (role === 'host') stopHiddenSource();
    else {
      sessionGeneration++;
      session?.stop({ notify: false, state: null });
      session = null;
      receiveStream(null);
    }
  });
  window.addEventListener('pageshow', event => {
    pageSuspended = false;
    if (event.persisted && role === 'listener' && !listenerLeft && !listenerEnded) void startListener();
  });

  if (role === 'host') renderState('host-idle');
  else if (!validIdentity(listenerIdentity)) renderState('error-access');
  else if (listenerEnded) renderState('broadcast-ended');
  else void startListener();
}
