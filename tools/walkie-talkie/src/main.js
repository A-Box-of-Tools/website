import { BroadcastSession } from './session.js';
import { phrase } from './shared/phrases.js';
import { makeQr } from './shared/qr.js';
import { watchDiscovery } from './shared/peer-discovery.js';
import { rendezvousEndpoint } from './shared/peer-endpoint.js';
import { observeForeground } from './shared/foreground-recovery.js';
import { transportMode, readTransport, transportUrl } from './shared/peer-transport.js';
import { bindTransportControl } from './shared/peer-transport-ui.js';

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
    'microphone', 'microphone-note', 'resume-microphone', 'end', 'invite', 'link', 'copy',
    'invite-feedback', 'qr', 'qr-error', 'listener', 'listening', 'playback-note',
    'mute', 'leave', 'audio', 'nearby', 'channels', 'empty', 'refresh',
    'discovery-status', 'selected-channel', 'join', 'connect-listener', 'publication', 'setup', 'room-name', 'discover',
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
  let listenerIdentity = hasInvitation ? { code: fragment.get('code'), key: fragment.get('listen'), muted: false, ended: false,
    transport: readTransport(location.href), confirmed: false } : validIdentity(cachedListener) ? cachedListener : null;
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
  const errors = new Set(['error-access', 'error-full', 'error-microphone', 'error-connection', 'error-secure-context', 'error-browser',
    'transport.invalid', 'transport.unavailable', 'transport.limited', 'transport.forbidden', 'transport.timeout', 'transport.mismatch']);
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
  let captureState = 'ready';
  let microphoneResuming = false;
  let captureRecoveryTried = false;
  let listenerMuted = Boolean(listenerIdentity?.muted);
  let playbackBlocked = false;
  let listenerLeft = false;
  let listenerEnded = Boolean(listenerIdentity?.ended);
  let listenerCount = 0;
  let currentStream = null;
  let stateTalking = false;
  let pageSuspended = false;
  let channels = [];
  let selectedChannel = null;
  let lastPublication = null;
  const transportControl = bindTransportControl({ onChange: () => {
    transportControl.route('unknown');
    updateHostControls();
    updateListenerControls();
  } });
  transportControl.set(transportMode(role === 'listener' ? listenerIdentity?.transport : credentials?.transport) || 'direct');
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
    const unavailable = role !== 'host' || hostActive || starting || preparingCredentials || pageSuspended;
    ui.join.disabled = unavailable || !selectedChannel;
    for (const button of ui.channels.querySelectorAll('button')) button.disabled = unavailable;
  }
  renderRole();

  function renderChannels() {
    ui.channels.replaceChildren();
    const available = channels.filter(channel => channel.code !== credentials?.code);
    if (!available.some(channel => channel.code === selectedChannel?.code && channel.listenKey === selectedChannel?.listenKey)) selectedChannel = null;
    ui['selected-channel'].textContent = phrase(selectedChannel ? 'channel-selected' : 'channel-unselected', { name: selectedChannel?.name });
    ui.join.disabled = !selectedChannel || role !== 'host' || hostActive || starting || preparingCredentials || pageSuspended;
    ui.empty.hidden = available.length > 0;
    for (const channel of available) {
      const item = document.createElement('li');
      item.className = 'paired-nearby-row';
      const name = document.createElement('span');
      name.textContent = channel.name;
      const join = document.createElement('button');
      join.type = 'button';
      join.textContent = phrase('choose-channel');
      join.setAttribute('aria-label', phrase('choose-channel-name', { name: channel.name }));
      join.setAttribute('aria-pressed', String(channel.code === selectedChannel?.code));
      join.disabled = role !== 'host' || hostActive || starting || preparingCredentials || pageSuspended;
      join.addEventListener('click', () => {
        if (role !== 'host' || hostActive || starting || preparingCredentials || pageSuspended) return;
        selectedChannel = channel;
        transportControl.set(transportMode(channel.transport) || 'direct');
        renderChannels();
        ui.join.focus();
      });
      item.append(name, join);
      ui.channels.append(item);
    }
  }

  function joinSelectedChannel() {
    const channel = selectedChannel;
    if (role !== 'host' || hostActive || starting || preparingCredentials || pageSuspended
        || !channel || !channels.some(row => row.code === channel.code && row.listenKey === channel.listenKey)) return;
    if (transportControl.value() !== transportMode(channel.transport)) { renderState('transport.mismatch'); return; }
    hostWanted = false;
    resumeHostOnReturn = false;
    hostNeedsResume = false;
    clearHostResumeTimer();
    sessionGeneration++;
    session?.stop({ notify: false, state: null });
    session = null;
    listenerIdentity = { code: channel.code, key: channel.listenKey, muted: false, ended: false,
      transport: transportControl.value(), confirmed: true };
    if (!writeStored(listenerStorage, listenerIdentity)) {
      const invitation = new URL(transportUrl(pageUrl.href, listenerIdentity.transport));
      invitation.hash = new URLSearchParams({ code: channel.code, listen: channel.listenKey }).toString();
      try { history.replaceState(history.state, '', invitation.href); } catch {
        // The current session can still listen when recovery storage is blocked.
      }
    }
    listenerLeft = false;
    listenerEnded = false;
    listenerMuted = false;
    playbackBlocked = false;
    selectedChannel = null;
    role = 'listener';
    renderRole();
    void startListener();
  }

  function openDiscovery() {
    return watchDiscovery(`${rendezvousEndpoint()}/discover?tool=walkie-talkie`, {
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
    transportControl.lock(hostActive || starting || preparingCredentials || Boolean(session));
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
    ui['resume-microphone'].hidden = !hostActive || captureState === 'ready';
    ui['resume-microphone'].disabled = microphoneResuming;
    ui['resume-microphone'].textContent = phrase(microphoneResuming ? 'microphone-resuming' : 'resume-microphone');
    ui['listener-count'].textContent = phrase(listenerCount === 1 ? 'host-count-one' : 'host-count', { count: listenerCount });
  }

  function updateListenerControls() {
    const needsConfirmation = role === 'listener' && transportMode(listenerIdentity?.transport) === 'relay'
      && !listenerIdentity?.confirmed && !listenerLeft && !listenerEnded;
    ui['connect-listener'].hidden = !needsConfirmation;
    ui['connect-listener'].disabled = starting || pageSuspended;
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
    transportControl.route(detail.route || 'unknown');
    const activeHostError = role === 'host' && key === 'error-full' && Boolean(detail.directReady);
    if (detail.directReady) globalThis.aboxToolComplete?.();
    if (role === 'host' && detail.captureState) {
      captureState = detail.captureState;
      if (captureState === 'ready') captureRecoveryTried = false;
    }
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
    if (role === 'host' && (['host-ready', 'host-talking', 'host-reconnecting'].includes(key) || activeHostError)) {
      hostActive = true;
      canTransmit = captureState === 'ready' && Boolean(detail.signaling || detail.directReady || detail.listeners > 0);
      if (!canTransmit) {
        activePointer = null;
        keyboardHeld = false;
        heldKey = null;
        latched = false;
      }
    }
    if (role === 'host' && (['host-idle', 'host-hidden', 'host-resume-needed', 'broadcast-ended'].includes(key) || (errors.has(key) && !activeHostError))) {
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
    // A busy introduction service can leave direct speech running normally.
    stateTalking = key === 'host-talking' || key === 'listener-talking' || (activeHostError && detail.talking);
    const statusKey = role === 'host' && hostActive && captureState !== 'ready'
      ? microphoneResuming ? 'microphone-resuming' : 'host-microphone-paused'
      : role === 'host' && hostNeedsResume
      ? starting ? 'host-resuming' : errors.has(key) ? 'host-resume-needed' : key
      : key;
    ui['status-text'].textContent = phrase(statusKey);
    ui['status-dot'].dataset.state = role === 'host' && hostActive && captureState !== 'ready'
      ? 'waiting' : stateTalking ? 'talking' : key === 'host-ready' || key === 'listener-listening' ? 'ready' : 'waiting';
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

  function releaseHold() {
    activePointer = null;
    keyboardHeld = false;
    heldKey = null;
    updateTransmission();
  }

  async function resumeHostMicrophone(automatic = false) {
    if (role !== 'host' || !hostActive || captureState === 'ready' || microphoneResuming
        || pageSuspended || document.hidden || !session) return;
    if (automatic && (captureState !== 'ended' || captureRecoveryTried)) return;
    captureRecoveryTried = true;
    microphoneResuming = true;
    releaseTransmission();
    const current = session;
    const generation = sessionGeneration;
    let timer;
    ui['status-text'].textContent = phrase('microphone-resuming');
    updateHostControls();
    try {
      await Promise.race([
        current.resumeCapture(),
        new Promise(resolve => { timer = setTimeout(() => resolve(false), 10000); }),
      ]);
    } catch {
      // A denied replacement leaves the existing channel and its Resume action available.
    } finally {
      clearTimeout(timer);
      if (session === current && sessionGeneration === generation) {
        microphoneResuming = false;
        if (captureState !== 'ready') ui['status-text'].textContent = phrase('host-microphone-paused');
        updateHostControls();
      }
    }
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
    captureState = 'ready';
    microphoneResuming = false;
    captureRecoveryTried = false;
    session = new BroadcastSession({
      role,
      code: identity.code,
      key: identity.key,
      transport: transportMode(identity.transport),
      listenKey: role === 'host' ? identity.listenKey : undefined,
      roomName: role === 'host' ? identity.roomName : undefined,
      discover: role === 'host' && identity.discover === true,
      onState: (key, detail) => {
        if (generation !== sessionGeneration) return;
        if (key.startsWith('transport.')) {
          hostWanted = resumeHostOnReturn = false;
          session = null;
          if (listenerIdentity?.transport === 'relay') {
            listenerIdentity.confirmed = false;
            writeStored(listenerStorage, listenerIdentity);
          }
        }
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
    const invitation = new URL(transportUrl(pageUrl.href, credentials.transport));
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
    if (!identity || transportMode(identity.transport) !== transportControl.value() || await channelCode(identity.key) !== identity.code) {
      const key = randomKey();
      identity = { code: await channelCode(key), key, listenKey: randomKey() };
    }
    if (!hostWanted && !resumeHostOnReturn) return null;
    credentials = { ...identity, roomName: ui['room-name'].value.trim(), discover: ui.discover.checked, transport: transportControl.value() };
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
    if (listenerIdentity.transport === null || !transportMode(listenerIdentity.transport)) { renderState('transport.invalid'); return; }
    if (transportControl.value() !== transportMode(listenerIdentity.transport)) { renderState('transport.mismatch'); return; }
    if (listenerIdentity.transport === 'relay' && !listenerIdentity.confirmed) { renderState('listener-confirm'); return; }
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
  ui['resume-microphone'].addEventListener('click', () => void resumeHostMicrophone());
  ui['room-name'].addEventListener('input', () => ui['room-name'].setCustomValidity(''));
  ui.refresh.addEventListener('click', () => discovery.refresh());
  ui.join.addEventListener('click', joinSelectedChannel);
  ui['connect-listener'].addEventListener('click', () => {
    if (role !== 'listener' || session || !validIdentity(listenerIdentity)) return;
    if (transportControl.value() !== transportMode(listenerIdentity.transport)) { renderState('transport.mismatch'); return; }
    listenerIdentity.confirmed = true;
    writeStored(listenerStorage, listenerIdentity);
    void startListener();
  });
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
  let resumeListenerOnReturn = false;
  observeForeground({
    blur() { if (role === 'host') releaseHold(); },
    hidden() {
      if (role === 'host') {
        releaseHold();
        if (starting && !hostActive) stopHiddenSource();
      }
    },
    foreground() {
      discovery.refresh();
      resumeHiddenHost();
      void resumeHostMicrophone(true);
      const reconnect = resumeListenerOnReturn;
      resumeListenerOnReturn = false;
      if (role === 'listener') {
        if (reconnect && !listenerLeft && !listenerEnded) void startListener();
        else void playAudio();
      }
    },
    suspend() {
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
    },
    restore(event) {
      pageSuspended = false;
      if (event.persisted) discovery = openDiscovery();
      resumeListenerOnReturn = event.persisted && role === 'listener' && !listenerLeft && !listenerEnded;
    },
  });

  if (role === 'host') renderState(hostNeedsResume ? 'host-resume-needed' : 'host-idle');
  else if (!validIdentity(listenerIdentity)) renderState('error-access');
  else if (listenerEnded) renderState('broadcast-ended');
  else void startListener();
}
