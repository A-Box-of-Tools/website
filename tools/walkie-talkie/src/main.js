import { BroadcastSession } from './session.js';
import { phrase } from './shared/phrases.js';
import { makeQr } from './shared/qr.js';
import { watchDiscovery } from './shared/peer-discovery.js';

activateChannel();
const privacyToggle = document.getElementById('privacy-toggle');
const privacyPanel = document.getElementById('privacy-panel');
privacyToggle.addEventListener('click', () => {
  const open = privacyPanel.hidden;
  privacyPanel.hidden = !open;
  privacyToggle.setAttribute('aria-expanded', String(open));
});
document.getElementById('boot-warning')?.remove();

function activateChannel() {
  const element = id => document.getElementById(`wt-${id}`);
  const ui = Object.fromEntries([
    'role', 'host-intro', 'status-text', 'status-dot', 'error', 'error-text',
    'host', 'start', 'listener-count', 'transmit', 'hold', 'toggle', 'hands-free', 'live-banner',
    'microphone', 'microphone-note', 'end', 'invite', 'link', 'copy',
    'invite-feedback', 'qr', 'qr-error', 'listener', 'listening', 'playback-note',
    'mute', 'leave', 'audio', 'nearby', 'channels', 'empty', 'refresh',
    'discovery-status', 'publication', 'setup', 'room-name', 'discover',
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
  let role = hasInvitation || listenerIdentity ? 'listener' : 'host';
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
  let preparingCredentials = false;
  let hostWanted = false;
  let resumeHostOnReturn = false;
  let hostNeedsResume = Boolean(credentials);
  let hostResumeTimer = null;
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
  let channels = [];
  let lastPublication = null;
  let discovery = openDiscovery();
  if (credentials) {
    if (typeof credentials.roomName === 'string') ui['room-name'].value = credentials.roomName;
    // A channel created before discovery was offered keeps its private link.
    ui.discover.checked = credentials.discover === true;
  }

  function renderRole() {
    ui.role.textContent = phrase(role === 'host' ? 'host-role' : 'listener-role');
    ui.host.hidden = role !== 'host';
    ui.listener.hidden = role !== 'listener';
    ui['host-intro'].hidden = role !== 'host';
    ui.nearby.hidden = role !== 'host' || hostActive || starting || preparingCredentials;
  }
  renderRole();

  function renderChannels() {
    ui.channels.replaceChildren();
    const available = channels.filter(channel => channel.code !== credentials?.code);
    ui.empty.hidden = available.length > 0;
    for (const channel of available) {
      const item = document.createElement('li');
      const name = document.createElement('span');
      name.textContent = channel.name;
      const join = document.createElement('button');
      join.type = 'button';
      join.textContent = phrase('join-channel');
      join.setAttribute('aria-label', phrase('join-channel-name', { name: channel.name }));
      join.addEventListener('click', () => {
        if (role !== 'host' || hostActive || starting || preparingCredentials || pageSuspended) return;
        hostWanted = false;
        resumeHostOnReturn = false;
        hostNeedsResume = false;
        clearHostResumeTimer();
        sessionGeneration++;
        session?.stop({ notify: false, state: null });
        session = null;
        listenerIdentity = { code: channel.code, key: channel.listenKey, muted: false, ended: false };
        if (!writeStored(listenerStorage, listenerIdentity)) {
          const invitation = new URL(pageUrl.href);
          invitation.hash = new URLSearchParams({ code: channel.code, listen: channel.listenKey }).toString();
          try { history.replaceState(history.state, '', invitation.href); } catch {
            // The current session can still listen when recovery storage is blocked.
          }
        }
        listenerLeft = false;
        listenerEnded = false;
        listenerMuted = false;
        playbackBlocked = false;
        role = 'listener';
        renderRole();
        void startListener();
      });
      item.append(name, join);
      ui.channels.append(item);
    }
  }

  function openDiscovery() {
    return watchDiscovery('wss://rendezvous.abox.tools/discover?tool=walkie-talkie', {
      list: rows => { channels = rows; renderChannels(); },
      status: status => { ui['discovery-status'].textContent = phrase(`discovery-${status}`); },
      publication: status => {
        ui.publication.hidden = status === null;
        ui.publication.textContent = status === null ? '' : phrase(`publication-${status}`);
      },
    });
  }

  function unpublish() {
    discovery.unpublish();
    lastPublication = null;
  }

  function syncPublication(detail) {
    const listing = detail.discovery;
    if (role !== 'host' || !hostActive || !detail.signaling || !credentials?.discover
        || listing?.tool !== 'walkie-talkie' || listing.code !== credentials.code) {
      if (lastPublication !== null) unpublish();
      return;
    }
    if (listing.lease !== lastPublication && discovery.publish(listing.code, listing.lease, { listenKey: credentials.listenKey })) {
      lastPublication = listing.lease;
    }
  }

  const held = () => activePointer !== null || keyboardHeld;

  function updateHostControls() {
    const talking = hostActive && canTransmit && !microphoneMuted && (held() || latched);
    const handsFree = talking && latched;
    ui['hands-free'].dataset.active = String(handsFree);
    ui['live-banner'].hidden = !handsFree;
    ui.start.hidden = hostActive;
    ui.start.disabled = starting || preparingCredentials;
    ui.start.textContent = phrase(hostNeedsResume ? 'resume-channel' : 'start-channel');
    ui.setup.hidden = hostActive;
    ui['room-name'].disabled = starting || preparingCredentials;
    ui.discover.disabled = starting || preparingCredentials;
    renderRole();
    ui.transmit.hidden = !hostActive;
    ui.invite.hidden = !hostActive || !ui.link.value;
    ui.hold.disabled = !hostActive || !canTransmit || microphoneMuted;
    ui.toggle.disabled = !hostActive || !canTransmit || microphoneMuted;
    ui.hold.setAttribute('aria-pressed', String(held() && talking));
    ui.hold.textContent = phrase(held() && talking ? 'hold-talking' : 'hold-talk');
    ui.toggle.setAttribute('aria-pressed', String(handsFree));
    ui.toggle.textContent = phrase(handsFree ? 'toggle-stop' : 'toggle-start');
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
    if (role === 'host' && ['host-ready', 'host-talking'].includes(key)) {
      hostWanted = true;
      hostNeedsResume = false;
      clearHostResumeTimer();
    }
    if (role === 'host' && key === 'broadcast-ended') {
      hostWanted = false;
      resumeHostOnReturn = false;
      hostNeedsResume = false;
      clearHostResumeTimer();
    }
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
    if (role === 'host' && (['host-idle', 'host-hidden', 'host-resume-needed', 'broadcast-ended'].includes(key) || errors.has(key))) {
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
    const statusKey = role === 'host' && hostNeedsResume
      ? starting ? 'host-resuming' : errors.has(key) ? 'host-resume-needed' : key
      : key;
    ui['status-text'].textContent = phrase(statusKey);
    ui['status-dot'].dataset.state = stateTalking ? 'talking' : key === 'host-ready' || key === 'listener-listening' ? 'ready' : 'waiting';
    ui.error.hidden = !errors.has(key);
    ui['error-text'].textContent = errors.has(key) ? phrase(key) : '';
    updateHostControls();
    updateListenerControls();
    syncPublication(detail);
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
      roomName: role === 'host' ? identity.roomName : undefined,
      discover: role === 'host' && identity.discover === true,
      onState: (key, detail) => {
        if (generation !== sessionGeneration) return;
        if (role === 'host' && hostNeedsResume && errors.has(key) && key !== 'error-full') {
          requireHostResume(key);
          return;
        }
        if (role === 'host' && key === 'error-microphone') {
          // A phone can interrupt capture before it reports that the page is hidden.
          hostWanted = hostActive;
          sourceEpoch++;
          starting = false;
        }
        if (role === 'host' && key === 'error-access') hostWanted = false;
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
    let identity = credentials;
    if (!identity || await channelCode(identity.key) !== identity.code) {
      const key = randomKey();
      identity = { code: await channelCode(key), key, listenKey: randomKey() };
    }
    if (!hostWanted && !resumeHostOnReturn) return null;
    credentials = { ...identity, roomName: ui['room-name'].value.trim(), discover: ui.discover.checked };
    writeStored(hostStorage, credentials);
    return credentials;
  }

  function clearHostResumeTimer() {
    clearTimeout(hostResumeTimer);
    hostResumeTimer = null;
  }

  function requireHostResume(errorKey = 'host-resume-needed') {
    clearHostResumeTimer();
    hostWanted = false;
    resumeHostOnReturn = false;
    hostNeedsResume = true;
    sourceEpoch++;
    sessionGeneration++;
    releaseTransmission();
    session?.stop({ notify: false, state: null });
    session = null;
    unpublish();
    starting = false;
    hostActive = false;
    canTransmit = false;
    listenerCount = 0;
    renderState(errorKey);
  }

  function resumeHiddenHost() {
    if (!resumeHostOnReturn || role !== 'host' || starting || hostActive || preparingCredentials
        || pageSuspended || document.hidden || !credentials) return;
    void startHost(true);
  }

  async function startHost(automatic = false) {
    if (role !== 'host' || starting || hostActive || preparingCredentials || pageSuspended || document.hidden) return;
    if (!automatic) {
      const name = ui['room-name'].value.trim();
      ui['room-name'].setCustomValidity(name && name.length <= 80 && !/[\u0000-\u001f\u007f-\u009f]/.test(name) ? '' : phrase('name-invalid'));
      if (!ui['room-name'].reportValidity()) return;
    }
    resumeHostOnReturn = false;
    clearHostResumeTimer();
    if (!window.isSecureContext) {
      hostWanted = false;
      renderState('error-secure-context');
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || !globalThis.crypto?.subtle || !window.RTCPeerConnection) {
      hostWanted = false;
      renderState('error-browser');
      return;
    }
    hostWanted = true;
    starting = true;
    const epoch = ++sourceEpoch;
    releaseTransmission();
    renderState('host-starting');
    try {
      let identity = credentials;
      if (!automatic) {
        preparingCredentials = true;
        try { identity = await prepareCredentials(); }
        finally { preparingCredentials = false; }
      }
      if (epoch !== sourceEpoch || pageSuspended || document.hidden) return;
      if (session) {
        sessionGeneration++;
        session.stop({ notify: false, state: null });
      }
      const currentSession = createSession(identity);
      drawInvitation();
      if (hostNeedsResume) {
        // A stalled wake must leave a gesture-driven retry, not a pending capture forever.
        hostResumeTimer = setTimeout(() => {
          if (epoch === sourceEpoch) requireHostResume();
        }, 10000);
      }
      const success = await currentSession.start();
      if (epoch !== sourceEpoch || pageSuspended || document.hidden) return;
      hostActive = success;
      if (!success && hostNeedsResume) requireHostResume();
    } catch {
      if (epoch === sourceEpoch) {
        if (hostNeedsResume) requireHostResume('error-connection');
        else {
          hostWanted = false;
          renderState('error-connection');
        }
      }
    } finally {
      if (epoch === sourceEpoch) {
        clearHostResumeTimer();
        starting = false;
      }
      updateHostControls();
      if (resumeHostOnReturn && !preparingCredentials && !credentials) requireHostResume('error-connection');
      else resumeHiddenHost();
    }
  }

  function stopHiddenSource() {
    if (role !== 'host' || (!hostWanted && !starting && !session)) return;
    resumeHostOnReturn = hostWanted || starting;
    hostNeedsResume ||= resumeHostOnReturn;
    clearHostResumeTimer();
    sourceEpoch++;
    sessionGeneration++;
    releaseTransmission();
    session?.stop({ notify: false, state: null });
    session = null;
    unpublish();
    starting = false;
    hostActive = false;
    listenerCount = 0;
    if (resumeHostOnReturn) renderState('host-hidden');
    else if (hostNeedsResume) renderState('host-resume-needed');
    else updateHostControls();
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
  ui['room-name'].addEventListener('input', () => ui['room-name'].setCustomValidity(''));
  ui.refresh.addEventListener('click', () => discovery.refresh());
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
    hostWanted = false;
    resumeHostOnReturn = false;
    hostNeedsResume = false;
    clearHostResumeTimer();
    sourceEpoch++;
    sessionGeneration++;
    releaseTransmission();
    session?.stop({ notify: true, state: null });
    session = null;
    credentials = null;
    unpublish();
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
    listenerIdentity = null;
    role = 'host';
    renderState('listener-left');
    renderChannels();
    discovery.refresh();
  });
  window.addEventListener('blur', () => {
    if (role === 'host') releaseTransmission();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopHiddenSource();
    else resumeHiddenHost();
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
    discovery.close();
    lastPublication = null;
  });
  window.addEventListener('pageshow', event => {
    pageSuspended = false;
    if (event.persisted) discovery = openDiscovery();
    if (role === 'host') resumeHiddenHost();
    if (event.persisted && role === 'listener' && !listenerLeft && !listenerEnded) void startListener();
  });

  if (role === 'host') renderState(hostNeedsResume ? 'host-resume-needed' : 'host-idle');
  else if (!validIdentity(listenerIdentity)) renderState('error-access');
  else if (listenerEnded) renderState('broadcast-ended');
  else void startListener();
}
