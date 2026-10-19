import { InboxSession } from './session.js';
import { phrase } from './shared/phrases.js';
import { makeQr } from './shared/qr.js';
import { watchDiscovery } from './shared/peer-discovery.js';
import { createDiscoveryGroupControl, appendConnectionIcons } from './shared/peer-discovery-ui.js';
import { rendezvousEndpoint } from './shared/peer-endpoint.js';
import { observeForeground } from './shared/foreground-recovery.js';
import { transportMode, readTransport, transportUrl } from './shared/peer-transport.js';
import { bindTransportControl } from './shared/peer-transport-ui.js';
import { validCode, validKey, makeSenderKey, makeInboxIdentity, codeForKey, derivePasswordProof } from './inbox-credentials.js';

activateOncall();
const privacyToggle = document.getElementById('privacy-toggle');
const privacyPanel = document.getElementById('privacy-panel');
privacyToggle.addEventListener('click', () => {
  const open = privacyPanel.hidden;
  privacyPanel.hidden = !open;
  privacyToggle.setAttribute('aria-expanded', String(open));
});
document.getElementById('boot-warning')?.remove();

function activateOncall() {
  const element = id => document.getElementById(`vi-${id}`);
  const ui = Object.fromEntries([
    'tab-join', 'tab-host', 'join-panel', 'host-panel', 'status-text', 'status-dot',
    'join-form', 'nearby', 'refresh', 'discovery-status', 'rooms', 'empty',
    'sender-password', 'join', 'connection-icons', 'sender', 'sender-room', 'sender-note', 'resume',
    'hold', 'toggle', 'leave', 'host-form', 'room-name', 'password-required',
    'host-password-field', 'host-password', 'saved-password', 'start', 'host-live',
    'live-name', 'end', 'participant-count', 'host-empty', 'participants',
    'audio-recovery', 'audio-note', 'restore-sound',
    'moderation-note', 'link', 'copy', 'copy-note', 'publication-status', 'qr', 'qr-note',
  ].map(id => [id, element(id)]));
  const hostStorage = 'voice-oncall.host';
  const senderStorage = 'voice-oncall.senders';
  const pageUrl = new URL(location.href);
  pageUrl.hash = '';
  const invitationCode = new URLSearchParams(location.hash.slice(1)).get('code');
  let selectedCode = validCode(invitationCode) ? invitationCode.toLowerCase() : null;
  let selectedTransport = readTransport(location.href);
  let selectedFromDiscovery = false;
  let rooms = [];
  let roomsSignature = null;
  let view = 'join';
  let activeRole = null;
  let session = null;
  let sessionGeneration = 0;
  let operationEpoch = 0;
  let starting = false;
  let hostActive = false;
  let senderActive = false;
  let senderPaused = false;
  let senderTerminal = false;
  let senderMuted = false;
  let captureState = 'ready';
  let microphoneResuming = false;
  let captureRecoveryTried = false;
  let resumeRoleOnReturn = null;
  let canTransmit = false;
  let activePointer = null;
  let keyboardHeld = false;
  let heldKey = null;
  let latched = false;
  let pageSuspended = false;
  let senderIdentity = null;
  let lastPublication = null;
  let audioContext = null;
  let hostAudioCleanup = null;
  let hostAudioSession = null;
  let audioRestorePending = false;
  let audioRestoreFailed = false;
  let audioRestoreTimer = null;
  let audioRestoreEpoch = 0;
  const audioGraphs = new Map();
  const playbackMuted = new Map();
  // A refused moderation request must never undo the host's local silence.
  const localMute = new Map();
  const removedIds = new Set();
  const participantNodes = new Map();
  let participants = new Map();

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
    } catch {
      // Storage is optional; the current room still works without it.
    }
  }

  function removeStored(key) {
    try {
      sessionStorage.removeItem(key);
    } catch {
      // Closing the current session must not depend on browser storage.
    }
  }

  const savedSenders = readStored(senderStorage);
  const senderRecords = savedSenders && typeof savedSenders === 'object' && !Array.isArray(savedSenders) ? savedSenders : {};
  // Older pages saved caller names alongside the credentials needed for recovery.
  let removedStoredNames = false;
  for (const record of Object.values(senderRecords)) {
    if (record && typeof record === 'object' && Object.hasOwn(record, 'name')) {
      delete record.name;
      removedStoredNames = true;
    }
  }
  if (removedStoredNames) writeStored(senderStorage, senderRecords);
  const savedHost = readStored(hostStorage);
  // Reload loses the private group code. Its old identity must never be
  // restarted under the default public discovery scope.
  let hostIdentity = savedHost && !savedHost.discoveryGroup && validCode(savedHost.code) && validKey(savedHost.key) && typeof savedHost.roomName === 'string' && (savedHost.passwordProof === null || validKey(savedHost.passwordProof)) ? savedHost : null;
  if (savedHost?.discoveryGroup) removeStored(hostStorage);
  const transportControl = bindTransportControl({ onChange: () => {
    transportControl.route(null);
    updateHostPassword();
  } });
  transportControl.set(selectedCode ? selectedTransport || 'direct' : 'direct');
  if (hostIdentity) {
    ui['room-name'].value = hostIdentity.roomName;
    ui['password-required'].checked = Boolean(hostIdentity.passwordProof);
  }
  const groupControl = createDiscoveryGroupControl({ root: document, onChange: () => {
    discovery.close();
    rooms = [];
    roomsSignature = null;
    selectedCode = null;
    selectedTransport = 'direct';
    selectedFromDiscovery = false;
    ui['sender-password'].value = '';
    ui['sender-password'].setCustomValidity('');
    lastPublication = null;
    stripInvitation();
    transportControl.set('direct');
    transportControl.route(null);
    updateHostPassword();
    renderRooms();
    discovery = openDiscovery();
  } });

  function stripInvitation() {
    try {
      history.replaceState(history.state, '', pageUrl.href);
    } catch {
      // The room code is an invitation, never a host or sender secret.
    }
  }

  function updateHostPassword() {
    const locked = ui['password-required'].checked;
    ui['host-password-field'].hidden = !locked;
    ui['host-password'].disabled = !locked;
    const canKeepPassword = Boolean(hostIdentity?.passwordProof && transportMode(hostIdentity.transport) === transportControl.value()
      && (hostIdentity.discoveryGroup || null) === groupControl.id() && hostIdentity.roomName === ui['room-name'].value.trim());
    ui['host-password'].required = locked && !canKeepPassword;
    ui['saved-password'].hidden = !locked || !canKeepPassword;
  }

  function currentRoom() {
    return rooms.find(room => room.code === selectedCode) || (selectedCode ? { code: selectedCode, name: phrase('invited-room'), locked: null, transport: selectedTransport } : null);
  }

  function setView(next) {
    if (hostActive || senderActive || senderPaused || starting) return;
    view = next;
    if (next === 'host' && hostIdentity) transportControl.set(transportMode(hostIdentity.transport) || 'direct');
    if (next === 'join' && selectedCode) transportControl.set(selectedTransport || 'direct');
    updateHostPassword();
    for (const role of ['join', 'host']) {
      const selected = role === next;
      ui[`tab-${role}`].setAttribute('aria-selected', String(selected));
      ui[`tab-${role}`].tabIndex = selected ? 0 : -1;
      ui[`${role}-panel`].hidden = !selected;
    }
    renderState(next === 'host' ? 'host-idle' : 'join-idle');
  }

  function updateControls() {
    const room = currentRoom();
    ui['connection-icons'].hidden = !room;
    if (room) appendConnectionIcons(ui['connection-icons'], { transport: room.transport, locked: room.locked, approval: false });
    const occupied = hostActive || senderActive || senderPaused || starting;
    transportControl.lock(occupied);
    groupControl.lock(occupied || resumeRoleOnReturn !== null);
    ui.nearby.hidden = senderActive || senderPaused || senderTerminal || (starting && activeRole === 'sender');
    for (const radio of ui.rooms.querySelectorAll('input')) radio.disabled = occupied || senderTerminal;
    ui['tab-join'].disabled = occupied && view !== 'join';
    ui['tab-host'].disabled = occupied && view !== 'host';
    ui.start.disabled = starting;
    ui.join.disabled = starting;
    ui['host-form'].hidden = hostActive;
    ui['host-live'].hidden = !hostActive;
    ui['join-form'].hidden = senderActive || senderPaused || senderTerminal;
    ui.sender.hidden = !senderActive && !senderPaused && !senderTerminal;
    const capturePaused = senderActive && captureState !== 'ready';
    ui.resume.hidden = (!senderPaused && !capturePaused) || senderTerminal;
    ui.resume.disabled = starting || microphoneResuming;
    ui.resume.textContent = phrase(microphoneResuming ? 'microphone-resuming' : 'resume-microphone');
    const talking = senderActive && canTransmit && !senderMuted && (activePointer !== null || keyboardHeld || latched);
    ui.hold.disabled = !senderActive || !canTransmit || senderMuted;
    ui.toggle.disabled = ui.hold.disabled;
    ui.hold.setAttribute('aria-pressed', String(talking && (activePointer !== null || keyboardHeld)));
    ui.hold.textContent = phrase(talking && (activePointer !== null || keyboardHeld) ? 'hold-talking' : 'hold-talk');
    ui.toggle.setAttribute('aria-pressed', String(talking && latched));
    ui.toggle.textContent = phrase(talking && latched ? 'toggle-stop' : 'toggle-start');
    ui['sender-note'].hidden = !senderMuted && !senderPaused && !capturePaused;
    ui['sender-note'].textContent = senderMuted ? phrase('sender-muted') : capturePaused ? phrase('sender-microphone-paused') : senderPaused ? phrase('sender-paused') : '';
    updateHostSound();
  }

  function interruptedHostAudio() {
    try {
      return hostAudioSession?.state === 'interrupted';
    } catch {
      return false;
    }
  }

  function updateHostSound() {
    const interrupted = interruptedHostAudio();
    const primerPaused = Array.from(audioGraphs.values()).some(graph => graph.primerFailed || (graph.primerStarted && graph.primer.paused));
    const needsRestore = hostActive && audioContext && (audioContext.state !== 'running' || interrupted || primerPaused);
    ui['audio-recovery'].hidden = !needsRestore;
    ui['restore-sound'].disabled = audioRestorePending;
    ui['audio-note'].textContent = !needsRestore ? '' : phrase(audioRestorePending ? 'host-sound-restoring' : audioRestoreFailed ? 'error-sound-restore' : interrupted ? 'host-sound-interrupted' : 'host-sound-paused');
  }

  function monitorHostAudio(context) {
    hostAudioCleanup?.();
    let audioSession = null;
    let previousType = null;
    let playbackAssigned = false;
    try {
      const candidate = navigator.audioSession;
      if (candidate && typeof candidate.type === 'string') {
        audioSession = candidate;
        previousType = candidate.type;
        candidate.type = 'playback';
        playbackAssigned = true;
      }
    } catch {
      // Playback still works on browsers without a usable AudioSession API.
    }
    hostAudioSession = audioSession;
    const changed = () => {
      if (audioContext === context) updateHostSound();
    };
    context.addEventListener('statechange', changed);
    audioSession?.addEventListener?.('statechange', changed);
    hostAudioCleanup = () => {
      context.removeEventListener('statechange', changed);
      audioSession?.removeEventListener?.('statechange', changed);
      try {
        if (playbackAssigned && audioSession.type === 'playback') audioSession.type = previousType;
      } catch {
        // Ending the room must not depend on restoring an experimental setting.
      }
      hostAudioSession = null;
      hostAudioCleanup = null;
    };
    updateHostSound();
  }

  function resumeHostSound() {
    const context = audioContext;
    if (!hostActive || !context || audioRestorePending || pageSuspended) return;
    const epoch = ++audioRestoreEpoch;
    audioRestorePending = true;
    audioRestoreFailed = false;
    updateHostSound();
    clearTimeout(audioRestoreTimer);
    audioRestoreTimer = setTimeout(() => {
      if (context !== audioContext || epoch !== audioRestoreEpoch) return;
      audioRestorePending = false;
      audioRestoreFailed = true;
      updateHostSound();
    }, 3000);
    const attempts = [];
    try {
      if (hostAudioSession && hostAudioSession.type !== 'playback') hostAudioSession.type = 'playback';
    } catch {
      // A rejected playback hint does not prevent a normal AudioContext resume.
    }
    try {
      attempts.push(context.resume());
    } catch (error) {
      attempts.push(Promise.reject(error));
    }
    for (const [id, graph] of audioGraphs) {
      try {
        attempts.push(graph.primer.play().then(() => {
          if (audioGraphs.get(id) !== graph) return;
          graph.primerStarted = true;
          graph.primerFailed = false;
        }).catch(error => {
          if (error.name === 'AbortError' || audioGraphs.get(id) !== graph) return;
          graph.primerFailed = true;
          throw error;
        }));
      } catch (error) {
        attempts.push(Promise.reject(error));
      }
    }
    void Promise.allSettled(attempts).then(results => {
      if (context !== audioContext || epoch !== audioRestoreEpoch) return;
      clearTimeout(audioRestoreTimer);
      audioRestorePending = false;
      audioRestoreFailed = results.some(result => result.status === 'rejected');
      updateHostSound();
    });
  }

  function clearTransmitFlags() {
    activePointer = null;
    keyboardHeld = false;
    heldKey = null;
    latched = false;
  }

  function transmit() {
    session?.setTalking(senderActive && canTransmit && !senderMuted && (activePointer !== null || keyboardHeld || latched));
    updateControls();
  }

  function releaseTransmission() {
    clearTransmitFlags();
    transmit();
  }

  function releaseHold() {
    activePointer = null;
    keyboardHeld = false;
    heldKey = null;
    transmit();
  }

  async function resumeSenderMicrophone(automatic = false) {
    if (activeRole !== 'sender' || senderTerminal || pageSuspended || document.hidden || starting || microphoneResuming) return;
    if (senderPaused && !senderActive) {
      await startSender(true);
      return;
    }
    if (!senderActive || captureState === 'ready' || !session) return;
    if (automatic && (captureState !== 'ended' || captureRecoveryTried)) return;
    captureRecoveryTried = true;
    microphoneResuming = true;
    releaseTransmission();
    const current = session;
    const generation = sessionGeneration;
    let timer;
    ui['status-text'].textContent = phrase('microphone-resuming');
    updateControls();
    try {
      await Promise.race([
        current.resumeCapture(),
        new Promise(resolve => { timer = setTimeout(() => resolve(false), 10000); }),
      ]);
    } catch {
      // Failed capture replacement does not retire this caller's authenticated session.
    } finally {
      clearTimeout(timer);
      if (session === current && sessionGeneration === generation) {
        microphoneResuming = false;
        if (captureState !== 'ready') ui['status-text'].textContent = phrase('sender-microphone-paused');
        updateControls();
      }
    }
  }

  function clearSenderRecord() {
    const code = senderIdentity?.code || selectedCode;
    if (code && !senderRecords[code]?.blocked) {
      delete senderRecords[code];
      writeStored(senderStorage, senderRecords);
    }
    senderIdentity = null;
  }

  function rememberSenderTerminal(reason) {
    const code = senderIdentity?.code || selectedCode;
    if (code) {
      senderRecords[code] = { blocked: true, reason, roomName: ui['sender-room'].textContent };
      writeStored(senderStorage, senderRecords);
    }
    senderIdentity = null;
  }

  function renderState(key, detail = {}) {
    const connecting = ['host-starting', 'host-reconnecting', 'sender-connecting', 'sender-reconnecting'].includes(key);
    transportControl.route(detail.directReady ? detail.route || 'unknown' : connecting ? 'unknown' : null);
    if (key.startsWith('transport.')) {
      resumeRoleOnReturn = null;
      senderActive = senderPaused = hostActive = false;
      canTransmit = false;
      clearTransmitFlags();
      discovery?.unpublish();
      lastPublication = null;
      clearAudio();
    }
    if (detail.directReady) globalThis.aboxToolComplete?.();
    if (activeRole === 'sender' && detail.captureState) {
      captureState = detail.captureState;
      if (captureState === 'ready') captureRecoveryTried = false;
    }
    if (activeRole === 'host' && key === 'error-moderation-full') {
      const refused = detail.moderation;
      if (refused?.action === 'kick' && validCode(refused.id)) {
        removedIds.delete(refused.id);
        localMute.set(refused.id, true);
        playbackMuted.set(refused.id, true);
        updateGain(refused.id);
        renderParticipants(Array.from(participants.values()));
      }
      ui['moderation-note'].textContent = phrase(refused?.action === 'kick' ? 'error-removal-full' : key);
      ui['moderation-note'].hidden = false;
      return;
    }
    if (activeRole === 'host' && ['host-starting', 'host-ready', 'host-reconnecting', 'error-connection'].includes(key)) hostActive = true;
    if (activeRole === 'host' && key === 'host-ready' && detail.discovery) {
      const publication = detail.discovery;
      const identity = `${publication.code}:${publication.lease}`;
      if (validCode(publication.code) && typeof publication.lease === 'string' && identity !== lastPublication) {
        lastPublication = identity;
        discovery.publish(publication.code, publication.lease);
      }
    }
    if (activeRole === 'sender' && ['sender-ready', 'sender-talking', 'sender-muted', 'sender-reconnecting', 'error-full', 'error-connection'].includes(key)) {
      senderActive = true;
      senderPaused = false;
      senderMuted = key === 'sender-muted' || Boolean(detail.muted);
      canTransmit = captureState === 'ready' && !senderMuted && Boolean(detail.directReady || (detail.signaling && !detail.waiting));
      if (!canTransmit || senderMuted) clearTransmitFlags();
    }
    if (activeRole === 'sender' && key === 'error-microphone') {
      operationEpoch++;
      starting = false;
      senderActive = false;
      senderPaused = true;
      canTransmit = false;
      clearTransmitFlags();
    }
    if (activeRole === 'sender' && ['error-password', 'error-access'].includes(key)) {
      senderActive = false;
      senderPaused = false;
      canTransmit = false;
      clearTransmitFlags();
      if (key === 'error-password' && senderIdentity) {
        senderIdentity.passwordProof = null;
        if (senderRecords[senderIdentity.code]) senderRecords[senderIdentity.code].passwordProof = null;
        writeStored(senderStorage, senderRecords);
        ui['sender-password'].setCustomValidity(phrase('password-required'));
      }
      if (key === 'error-access') clearSenderRecord();
    }
    if (activeRole === 'host' && ['error-access', 'inbox-ended'].includes(key)) {
      resumeRoleOnReturn = null;
      hostActive = false;
      hostIdentity = null;
      removeStored(hostStorage);
      discovery.unpublish();
      lastPublication = null;
      updateHostPassword();
      clearAudio();
    }
    if (activeRole === 'sender' && ['inbox-ended', 'kicked'].includes(key)) {
      resumeRoleOnReturn = null;
      senderActive = false;
      senderPaused = false;
      senderTerminal = true;
      canTransmit = false;
      clearTransmitFlags();
      rememberSenderTerminal(key);
      stripInvitation();
    }
    ui['status-text'].textContent = phrase(activeRole === 'sender' && senderActive && captureState !== 'ready'
      ? microphoneResuming ? 'microphone-resuming' : 'sender-microphone-paused' : key);
    ui['status-dot'].dataset.state = activeRole === 'sender' && senderActive && captureState !== 'ready'
      ? 'waiting' : key === 'sender-talking' ? 'talking' : ['host-ready', 'sender-ready'].includes(key) ? 'ready' : 'waiting';
    updateControls();
  }

  function renderRooms() {
    const listed = rooms.slice();
    if (selectedCode && !listed.some(room => room.code === selectedCode)) listed.unshift({ code: selectedCode, name: phrase('invited-room'), locked: null, transport: selectedTransport });
    ui.rooms.replaceChildren();
    for (const room of listed) {
      const label = document.createElement('label');
      label.className = 'vi-room paired-nearby-row';
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'voice-oncall-room';
      radio.value = room.code;
      radio.checked = room.code === selectedCode;
      radio.disabled = hostActive || senderActive || senderPaused || senderTerminal || starting || pageSuspended;
      const content = document.createElement('span');
      const name = document.createElement('span');
      name.className = 'vi-room-name';
      name.textContent = room.name;
      content.className = 'paired-connection-info';
      content.append(name);
      appendConnectionIcons(content, { transport: room.transport, locked: room.locked, approval: false });
      label.append(radio, content);
      const chooseRoom = (event) => {
        if (hostActive || senderActive || senderPaused || senderTerminal || starting || pageSuspended) return;
        if (selectedCode !== room.code) ui['sender-password'].value = '';
        selectedCode = room.code;
        selectedTransport = transportMode(room.transport);
        selectedFromDiscovery = rooms.some(listed => listed.code === room.code);
        setView('join');
        if (event.type === 'click' && event.detail > 0) (room.locked ? ui['sender-password'] : ui.join).focus();
      };
      radio.addEventListener('change', chooseRoom);
      radio.addEventListener('click', chooseRoom);
      ui.rooms.append(label);
    }
    ui.empty.hidden = listed.length > 0;
    const room = currentRoom();
    ui['connection-icons'].hidden = !room;
    if (room) appendConnectionIcons(ui['connection-icons'], { transport: room.transport, locked: room.locked, approval: false });
  }

  let discovery;
  function openDiscovery() {
    return watchDiscovery(`${rendezvousEndpoint()}/discover?tool=voice-oncall`, {
    list(shares) {
      const next = (Array.isArray(shares) ? shares : []).filter(room => validCode(room.code) && typeof room.name === 'string').map(room => ({ code: room.code.toLowerCase(), name: room.name, locked: Boolean(room.locked), transport: transportMode(room.transport) })).sort((a, b) => a.name.localeCompare(b.name));
      const signature = JSON.stringify(next);
      if (signature === roomsSignature) return;
      roomsSignature = signature;
      rooms = next;
      if (selectedFromDiscovery && !hostActive && !senderActive && !senderPaused && !starting
          && !rooms.some(room => room.code === selectedCode)) {
        selectedCode = null;
        selectedFromDiscovery = false;
        selectedTransport = 'direct';
        ui['sender-password'].value = '';
        ui['sender-password'].setCustomValidity('');
      }
      renderRooms();
    },
    status(key) {
      ui['discovery-status'].textContent = phrase(`discovery-${key}`);
    },
    publication(key) {
      ui['publication-status'].textContent = key ? phrase(`publication-${key}`) : '';
    },
    }, { group: groupControl.code() });
  }
  discovery = openDiscovery();

  function disconnectGraph(id) {
    const graph = audioGraphs.get(id);
    if (!graph) return;
    graph.primer.pause();
    graph.primer.srcObject = null;
    graph.primer.remove();
    graph.source.disconnect();
    graph.gain.disconnect();
    audioGraphs.delete(id);
  }

  function updateGain(id) {
    const graph = audioGraphs.get(id);
    if (graph) graph.gain.gain.value = playbackMuted.has(id) && !playbackMuted.get(id) && !removedIds.has(id) ? 1 : 0;
  }

  function receiveStream(stream, id) {
    disconnectGraph(id);
    if (!stream || !audioContext) return;
    try {
      const source = audioContext.createMediaStreamSource(stream);
      const gain = audioContext.createGain();
      gain.gain.value = 0;
      // Chromium needs an audio element to decode remote WebRTC audio (issue 40504498).
      // It stays silent; the participant's gain remains the only audible route.
      const primer = document.createElement('audio');
      primer.hidden = true;
      primer.muted = true;
      primer.defaultMuted = true;
      primer.volume = 0;
      primer.playsInline = true;
      primer.addEventListener('volumechange', () => {
        if (!primer.muted) primer.muted = true;
        if (primer.volume !== 0) primer.volume = 0;
      });
      primer.srcObject = stream;
      document.body.append(primer);
      const graph = { source, gain, primer, primerStarted: false, primerFailed: false };
      audioGraphs.set(id, graph);
      primer.addEventListener('pause', () => {
        if (audioGraphs.get(id) === graph) updateHostSound();
      });
      primer.addEventListener('playing', () => {
        if (audioGraphs.get(id) !== graph) return;
        graph.primerStarted = true;
        graph.primerFailed = false;
        updateHostSound();
      });
      updateGain(id);
      source.connect(gain);
      gain.connect(audioContext.destination);
      void primer.play().catch(error => {
        if (error.name === 'AbortError' || audioGraphs.get(id) !== graph) return;
        graph.primerFailed = true;
        updateHostSound();
      });
    } catch {
      ui['moderation-note'].textContent = phrase('error-audio');
      ui['moderation-note'].hidden = false;
    }
  }

  function clearAudio() {
    audioRestoreEpoch++;
    clearTimeout(audioRestoreTimer);
    audioRestorePending = false;
    audioRestoreFailed = false;
    hostAudioCleanup?.();
    const context = audioContext;
    audioContext = null;
    for (const id of audioGraphs.keys()) disconnectGraph(id);
    if (context) void context.close().catch(() => {});
    updateHostSound();
  }

  function restoreProtection(rows) {
    if (activeRole !== 'host' || !hostActive || !session) return;
    const current = session, generation = sessionGeneration;
    for (const row of rows) {
      if (row.pendingRemoval || (!removedIds.has(row.id) && (!localMute.get(row.id) || row.muted))) continue;
      // A suspended page rebuilds its session, and the service forgets policy
      // after every room socket closes. Reapply retained decisions on rejoin.
      // Deferring avoids reentering the participant callback while it renders.
      queueMicrotask(() => {
        if (session !== current || generation !== sessionGeneration || activeRole !== 'host' || !hostActive) return;
        const latest = participants.get(row.id);
        if (!latest || latest.pendingRemoval) return;
        if (removedIds.has(row.id)) current.kick(row.id);
        else if (localMute.get(row.id) && !latest.muted) current.moderate(row.id, true);
      });
    }
  }

  function renderParticipants(rows) {
    const next = new Map((Array.isArray(rows) ? rows : []).filter(row => validCode(row.id) && typeof row.name === 'string').map(row => [row.id, row]));
    participants = next;
    for (const id of playbackMuted.keys()) {
      if (!next.has(id)) {
        playbackMuted.set(id, true);
        updateGain(id);
      }
    }
    for (const [id, node] of participantNodes) {
      if (!next.has(id)) {
        node.item.remove();
        participantNodes.delete(id);
      }
    }
    for (const [id, row] of next) {
      let labelLength = 6;
      while (labelLength < id.length && Array.from(next.keys()).some(other => other !== id && other.slice(0, labelLength) === id.slice(0, labelLength))) labelLength++;
      const displayName = row.name.trim() || phrase('participant-anonymous-name', { id: id.slice(0, labelLength) });
      const muted = localMute.has(id) ? localMute.get(id) : Boolean(row.muted);
      playbackMuted.set(id, muted);
      updateGain(id);
      let node = participantNodes.get(id);
      if (!node) {
        const item = document.createElement('li');
        item.className = 'vi-participant';
        const info = document.createElement('div');
        info.className = 'vi-participant-info';
        const name = document.createElement('span');
        name.className = 'vi-participant-name';
        const status = document.createElement('span');
        status.className = 'vi-participant-state';
        info.append(name, status);
        const actions = document.createElement('div');
        actions.className = 'vi-participant-actions';
        const mute = document.createElement('button');
        mute.type = 'button';
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'vi-secondary';
        actions.append(mute, remove);
        item.append(info, actions);
        ui.participants.append(item);
        node = { item, name, status, mute, remove };
        participantNodes.set(id, node);
        mute.addEventListener('click', () => {
          const current = participants.get(id);
          if (!current || current.pendingRemoval) return;
          const muted = !playbackMuted.get(id);
          if (muted) localMute.set(id, true);
          else localMute.delete(id);
          playbackMuted.set(id, muted || Boolean(current.muted));
          updateGain(id);
          session?.moderate(id, muted);
        });
        remove.addEventListener('click', () => {
          removedIds.add(id);
          localMute.set(id, true);
          playbackMuted.set(id, true);
          updateGain(id);
          session?.kick(id);
        });
      }
      node.name.textContent = displayName;
      node.status.textContent = phrase(row.pendingRemoval ? 'participant-removing' : muted ? 'participant-muted' : row.talking ? 'participant-speaking' : row.connected ? 'participant-ready' : 'participant-waiting');
      node.item.dataset.speaking = String(Boolean(row.talking && !muted));
      node.mute.textContent = phrase(muted ? 'unmute-label' : 'mute-label');
      node.mute.setAttribute('aria-label', phrase(muted ? 'participant-unmute' : 'participant-mute', { name: displayName }));
      node.mute.setAttribute('aria-pressed', String(muted));
      node.mute.disabled = Boolean(row.pendingRemoval);
      node.remove.textContent = phrase('remove-label');
      node.remove.setAttribute('aria-label', phrase('participant-remove', { name: displayName }));
      node.remove.disabled = Boolean(row.pendingRemoval);
    }
    const count = Array.from(next.values()).filter(row => row.connected).length;
    ui['participant-count'].textContent = phrase(count === 1 ? 'participant-count-one' : 'participant-count', { count });
    ui['host-empty'].hidden = next.size > 0;
    restoreProtection(next.values());
  }

  function createSession(role, identity) {
    const generation = ++sessionGeneration;
    activeRole = role;
    captureState = 'ready';
    microphoneResuming = false;
    captureRecoveryTried = false;
    session = new InboxSession({
      role,
      code: identity.code,
      key: identity.key,
      transport: transportMode(identity.transport),
      discoveryGroup: role === 'host' ? identity.discoveryGroup : null,
      roomName: role === 'host' ? identity.roomName : undefined,
      passwordProof: identity.passwordProof,
      onState: (key, detail) => {
        if (generation === sessionGeneration) renderState(key, detail);
      },
      onStream: (stream, id) => {
        if (generation === sessionGeneration && role === 'host') receiveStream(stream, id);
      },
      onParticipants: rows => {
        if (generation === sessionGeneration && role === 'host') renderParticipants(rows);
      },
    });
    return session;
  }

  function stopSession(notify) {
    sessionGeneration++;
    session?.stop({ notify, state: null });
    session = null;
  }

  function drawInvitation() {
    const invitation = new URL(transportUrl(pageUrl.href, hostIdentity.transport));
    invitation.hash = new URLSearchParams({ code: hostIdentity.code }).toString();
    ui.link.value = invitation.href;
    ui['copy-note'].textContent = '';
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
      ui['qr-note'].hidden = true;
    } catch {
      ui.qr.hidden = true;
      ui['qr-note'].hidden = false;
    }
  }

  function validateName(input) {
    const value = input.value.trim();
    input.setCustomValidity(value && !/[\u0000-\u001f\u007f]/.test(value) ? '' : phrase('name-invalid'));
    return input.reportValidity();
  }

  function browserReady(sender) {
    if (sender && !window.isSecureContext) {
      renderState('error-secure-context');
      return false;
    }
    if (!globalThis.crypto?.subtle || !window.RTCPeerConnection || (sender && !navigator.mediaDevices?.getUserMedia)) {
      renderState('error-browser');
      return false;
    }
    return true;
  }

  async function startHost(automatic = false) {
    if (starting || hostActive || pageSuspended || !validateName(ui['room-name']) || !browserReady(false)) return;
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) {
      renderState('error-audio');
      return;
    }
    const epoch = ++operationEpoch;
    starting = true;
    activeRole = 'host';
    hostActive = true;
    renderState('host-starting');
    try {
      audioContext = new Context();
      monitorHostAudio(audioContext);
      const playing = audioContext.resume();
      if (automatic) void playing.catch(() => {
        if (epoch === operationEpoch) updateHostSound();
      });
      else await playing;
      if (epoch !== operationEpoch || pageSuspended) return;
      const roomName = ui['room-name'].value.trim();
      const locked = ui['password-required'].checked;
      const password = ui['host-password'].value;
      const reusable = hostIdentity && transportMode(hostIdentity.transport) === transportControl.value()
        && (hostIdentity.discoveryGroup || null) === groupControl.id() && hostIdentity.roomName === roomName
        && Boolean(hostIdentity.passwordProof) === locked && !password && await codeForKey(hostIdentity.key) === hostIdentity.code;
      if (locked && !password && !reusable) {
        hostActive = false;
        clearAudio();
        ui['host-password'].setCustomValidity(phrase('password-required'));
        renderState('password-required');
        ui['host-password'].reportValidity();
        return;
      }
      let nextIdentity = hostIdentity;
      if (!reusable) {
        const identity = await makeInboxIdentity();
        identity.roomName = roomName;
        identity.transport = transportControl.value();
        identity.discoveryGroup = groupControl.id();
        identity.passwordProof = locked ? await derivePasswordProof(identity.code, password) : null;
        nextIdentity = identity;
      }
      if (epoch !== operationEpoch || pageSuspended) return;
      hostIdentity = nextIdentity;
      writeStored(hostStorage, hostIdentity);
      ui['host-password'].value = '';
      updateHostPassword();
      ui['live-name'].textContent = hostIdentity.roomName;
      if (!automatic) {
        removedIds.clear();
        playbackMuted.clear();
        localMute.clear();
      }
      renderParticipants([]);
      ui['moderation-note'].hidden = true;
      drawInvitation();
      const current = createSession('host', hostIdentity);
      const success = await current.start();
      if (epoch !== operationEpoch) return;
      hostActive = success;
      if (!success) clearAudio();
    } catch {
      if (epoch === operationEpoch) {
        hostActive = false;
        stopSession(false);
        clearAudio();
        renderState('error-audio');
      }
    } finally {
      if (epoch === operationEpoch) {
        starting = false;
        updateControls();
      }
    }
  }

  async function startSender(resume = false) {
    if (starting || senderActive || pageSuspended || !browserReady(true)) return;
    if (!validCode(selectedCode)) {
      renderState('room-required');
      return;
    }
    const room = currentRoom();
    if (selectedTransport === null || transportMode(room?.transport) !== transportControl.value()) {
      renderState(selectedTransport === null ? 'transport.invalid' : 'transport.mismatch');
      return;
    }
    const record = senderRecords[selectedCode];
    if (record?.blocked) {
      activeRole = 'sender';
      senderTerminal = true;
      ui['sender-room'].textContent = record.roomName || room?.name || phrase('invited-room');
      renderState(record.reason === 'kicked' ? 'kicked' : 'inbox-ended');
      return;
    }
    const password = ui['sender-password'].value;
    if (room?.locked && !password && !validKey(record?.passwordProof)) {
      ui['sender-password'].setCustomValidity(phrase('password-required'));
      ui['sender-password'].reportValidity();
      return;
    }
    const epoch = ++operationEpoch;
    starting = true;
    activeRole = 'sender';
    senderTerminal = false;
    senderPaused = false;
    senderActive = true;
    senderMuted = false;
    canTransmit = false;
    clearTransmitFlags();
    ui['sender-room'].textContent = room?.name || phrase('invited-room');
    renderState('sender-connecting');
    try {
      const identity = resume && senderIdentity ? senderIdentity : {
        code: selectedCode,
        transport: transportControl.value(),
        key: validKey(record?.key) ? record.key : makeSenderKey(),
        passwordProof: password ? await derivePasswordProof(selectedCode, password) : validKey(record?.passwordProof) ? record.passwordProof : null,
      };
      if (epoch !== operationEpoch || pageSuspended || document.hidden) return;
      senderIdentity = identity;
      senderRecords[selectedCode] = { key: identity.key, passwordProof: identity.passwordProof, transport: identity.transport };
      writeStored(senderStorage, senderRecords);
      ui['sender-password'].value = '';
      const current = createSession('sender', identity);
      const success = await current.start();
      if (epoch !== operationEpoch) return;
      senderActive = success;
    } catch {
      if (epoch === operationEpoch) {
        senderActive = false;
        stopSession(false);
        renderState('error-connection');
        senderActive = false;
        canTransmit = false;
      }
    } finally {
      if (epoch === operationEpoch) {
        starting = false;
        updateControls();
      }
    }
  }

  function pauseSender() {
    if (activeRole !== 'sender' || (!senderActive && !starting)) return;
    operationEpoch++;
    clearTransmitFlags();
    stopSession(false);
    starting = false;
    senderActive = false;
    senderPaused = true;
    canTransmit = false;
    renderState('sender-paused');
  }

  function leaveSender() {
    resumeRoleOnReturn = null;
    operationEpoch++;
    releaseTransmission();
    stopSession(true);
    starting = false;
    senderActive = false;
    senderPaused = false;
    senderTerminal = false;
    senderMuted = false;
    canTransmit = false;
    clearSenderRecord();
    activeRole = null;
    stripInvitation();
    renderState('sender-left');
    discovery.refresh();
  }

  function endHost() {
    resumeRoleOnReturn = null;
    operationEpoch++;
    stopSession(true);
    discovery.unpublish();
    lastPublication = null;
    hostIdentity = null;
    removeStored(hostStorage);
    clearAudio();
    renderParticipants([]);
    starting = false;
    hostActive = false;
    activeRole = null;
    ui.link.value = '';
    ui['host-password'].value = '';
    updateHostPassword();
    renderState('inbox-ended');
  }

  ui['tab-join'].addEventListener('click', () => setView('join'));
  ui['tab-host'].addEventListener('click', () => setView('host'));
  for (const role of ['join', 'host']) {
    ui[`tab-${role}`].addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 'join' : event.key === 'End' ? 'host' : role === 'join' ? 'host' : 'join';
      setView(next);
      if (view === next) ui[`tab-${next}`].focus();
    });
  }
  ui.refresh.addEventListener('click', () => discovery.refresh());
  ui['password-required'].addEventListener('change', updateHostPassword);
  ui['room-name'].addEventListener('input', updateHostPassword);
  for (const input of [ui['room-name'], ui['sender-password'], ui['host-password']]) input.addEventListener('input', () => input.setCustomValidity(''));
  ui['host-form'].addEventListener('submit', event => {
    event.preventDefault();
    void startHost();
  });
  ui['join-form'].addEventListener('submit', event => {
    event.preventDefault();
    void startSender();
  });
  ui.resume.addEventListener('click', () => void resumeSenderMicrophone());
  ui.end.addEventListener('click', endHost);
  ui['restore-sound'].addEventListener('click', resumeHostSound);
  ui.leave.addEventListener('click', leaveSender);
  ui.hold.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !senderActive || !canTransmit || senderMuted || activePointer !== null) return;
    event.preventDefault();
    ui.hold.focus();
    ui.hold.setPointerCapture(event.pointerId);
    activePointer = event.pointerId;
    latched = false;
    transmit();
  });
  const releasePointer = event => {
    if (event.pointerId !== activePointer) return;
    activePointer = null;
    transmit();
  };
  ui.hold.addEventListener('pointerup', releasePointer);
  ui.hold.addEventListener('pointercancel', releasePointer);
  ui.hold.addEventListener('lostpointercapture', releasePointer);
  ui.hold.addEventListener('contextmenu', event => event.preventDefault());
  ui.hold.addEventListener('blur', () => {
    activePointer = null;
    keyboardHeld = false;
    heldKey = null;
    transmit();
  });
  document.addEventListener('keydown', event => {
    if (!senderActive || !canTransmit || senderMuted) return;
    const target = event.target instanceof Element ? event.target : document.body;
    const space = event.code === 'Space' && !target.closest('input, select, textarea, [contenteditable="true"]') && (!target.closest('button, a, summary') || target === ui.hold);
    const enter = event.key === 'Enter' && target === ui.hold;
    if (!space && !enter) return;
    event.preventDefault();
    if (event.repeat) return;
    keyboardHeld = true;
    heldKey = event.code || event.key;
    latched = false;
    transmit();
  });
  document.addEventListener('keyup', event => {
    if (!keyboardHeld || (event.code || event.key) !== heldKey) return;
    event.preventDefault();
    keyboardHeld = false;
    heldKey = null;
    transmit();
  });
  ui.toggle.addEventListener('click', () => {
    if (!senderActive || !canTransmit || senderMuted) return;
    latched = !latched;
    transmit();
  });
  ui.link.addEventListener('click', () => ui.link.select());
  ui.copy.addEventListener('click', async () => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(ui.link.value);
      else {
        ui.link.select();
        if (!document.execCommand('copy')) throw new Error();
      }
      ui['copy-note'].textContent = phrase('copy-success');
    } catch {
      ui.link.focus();
      ui.link.select();
      ui['copy-note'].textContent = phrase('copy-error');
    }
  });
  function returnToPage() {
    if (pageSuspended || document.hidden) return;
    discovery.refresh();
    const resume = resumeRoleOnReturn;
    resumeRoleOnReturn = null;
    if (resume === 'host' && hostIdentity && !hostActive && !starting) void startHost(true);
    else if (resume === 'sender' && senderPaused && !senderTerminal) void resumeSenderMicrophone(true);
    else if (activeRole === 'sender' && senderActive) void resumeSenderMicrophone(true);
    if (activeRole === 'host') resumeHostSound();
  }
  observeForeground({
    blur() { if (activeRole === 'sender') releaseHold(); },
    foreground: returnToPage,
    hidden() {
      if (activeRole === 'sender') {
        releaseHold();
        if (starting) {
          resumeRoleOnReturn = 'sender';
          pauseSender();
        }
      }
    },
    suspend() {
      if (hostActive || senderActive || starting) resumeRoleOnReturn = activeRole;
      pageSuspended = true;
      discovery.close();
      lastPublication = null;
      if (activeRole === 'sender') pauseSender();
      else if (activeRole === 'host') {
        operationEpoch++;
        stopSession(false);
        clearAudio();
        starting = false;
        hostActive = false;
        renderState('host-paused');
      }
    },
    restore(event) {
      pageSuspended = false;
      if (event.persisted) discovery = openDiscovery();
    },
  });

  updateHostPassword();
  const selectedRecord = selectedCode && senderRecords[selectedCode];
  renderRooms();
  if (invitationCode && !validCode(invitationCode)) renderState('error-access');
  else if (selectedRecord?.blocked) {
    activeRole = 'sender';
    senderTerminal = true;
    ui['sender-room'].textContent = selectedRecord.roomName || phrase('invited-room');
    renderState(selectedRecord.reason === 'kicked' ? 'kicked' : 'inbox-ended');
  }
  else renderState('join-idle');
}
