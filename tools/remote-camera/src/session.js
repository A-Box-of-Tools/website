import { rtcConfig, allowedCandidate, localDescription } from './shared/peer-network.js';
import { PROTOCOL, TOOL, CODE_PATTERN, controlMessage } from './protocol.js';

const RENDEZVOUS = 'wss://rendezvous.abox.tools';
const CONNECT_TIMEOUT = 20000;
const MAX_PEERS = 4;

export class CameraSession {
  constructor({
    PeerConnection = globalThis.RTCPeerConnection, Socket = globalThis.WebSocket,
    onState = () => {}, onRequests = () => {}, onStream = () => {}, onDiscovery = () => {},
    onSignaling = () => {}, visible = () => globalThis.document?.hidden !== true,
  } = {}) {
    this.PeerConnection = PeerConnection;
    this.Socket = Socket;
    this.onState = onState;
    this.onRequests = onRequests;
    this.onStream = onStream;
    this.onDiscovery = onDiscovery;
    this.onSignaling = onSignaling;
    this.visible = visible;
    this.signalingLost = false;
    this.signalingRetry = null;
    this.signalAttempts = 0;
    this.revision = 0;
    this.role = null;
    this.socket = null;
    this.stream = null;
    this.peers = new Map();
    this.active = null;
    this.keepalive = null;
    this.requireApproval = true;
    this.cameraChange = null;
  }

  state(key) {
    if (key === 'camera.waiting' && !this.requireApproval) key = 'camera.open-waiting';
    this.onState(key, this.role);
  }

  // Stopping also interrupts viewers whose connection has not reached the
  // approval request yet, so the active video slot alone is not enough.
  get hasViewers() { return this.role === 'camera' && this.peers.size > 0; }

  setApprovalRequired(value) {
    this.requireApproval = Boolean(value);
    if (this.role === 'camera' && this.active === null) this.state('camera.waiting');
  }

  async startHost(stream, code, { discoverable = false, requireApproval = true } = {}) {
    this.stop();
    this.role = 'camera';
    this.requireApproval = Boolean(requireApproval);
    this.discoverable = discoverable;
    this.stream = stream;
    if (!stream?.getVideoTracks().some((track) => track.readyState === 'live')) {
      this.stop('camera.ended');
      throw new Error('camera.ended');
    }
    return this.open(code, discoverable);
  }

  async connect(code, note) {
    this.stop();
    this.role = 'viewer';
    this.note = String(note ?? '').trim().slice(0, 80);
    return this.open(code);
  }

  open(code, discoverable = false, recovering = false) {
    if (!CODE_PATTERN.test(code)) {
      this.stop('code.invalid');
      return Promise.reject(new Error('code.invalid'));
    }
    const revision = this.revision;
    this.code = code;
    this.state('connection.starting');
    return new Promise((resolve, reject) => {
      let ready = false;
      const socket = this.socket = new this.Socket(`${RENDEZVOUS}/ws/${code}?role=${this.role === 'camera' ? 'host' : 'viewer'}&local=1&tool=${TOOL}${discoverable ? '&discover=1' : ''}`);
      const current = () => this.revision === revision && this.socket === socket;
      const timer = setTimeout(() => fail('connection.server-failed'), CONNECT_TIMEOUT);
      const fail = (key) => {
        clearTimeout(timer);
        if (current()) {
          if (recovering || (ready && key !== 'connection.invalid' && [...this.peers.values()].some(entry => this.healthyPeer(entry)))) {
            this.loseSignaling(socket);
          } else this.stop(key);
        }
        if (!ready) reject(new Error(key));
      };
      const connected = () => {
        ready = true;
        clearTimeout(timer);
        this.signalingLost = false;
        this.signalAttempts = 0;
        this.state(recovering ? (this.active === null ? 'camera.waiting' : 'camera.streaming')
          : this.role === 'camera' ? 'camera.waiting' : 'connection.connecting');
        this.onSignaling();
        resolve();
      };
      socket.addEventListener('open', () => {
        if (!current()) return;
        this.keepalive = setInterval(() => {
          if (current() && socket.readyState === 1) socket.send('ping');
        }, 25000);
        // Refused Room handshakes also emit open. A pong confirms recovery
        // before its retry budget or unavailable indicator can be cleared.
        if (recovering) {
          try { socket.send('ping'); } catch { fail('connection.server-failed'); }
        } else connected();
      });
      socket.addEventListener('error', () => fail('connection.server-failed'));
      socket.addEventListener('close', (event) => {
        const reasons = { 4404: 'connection.not-found', 4409: 'connection.taken', 4429: 'connection.busy', 4410: 'connection.ended' };
        fail(reasons[event.code] ?? 'connection.server-failed');
      });
      socket.addEventListener('message', (event) => {
        if (!current()) return;
        if (event.data === 'pong') { if (recovering && !ready) connected(); return; }
        if (typeof event.data !== 'string' || event.data.length > 65536) return fail('connection.invalid');
        let message;
        try { message = JSON.parse(event.data); } catch { return fail('connection.invalid'); }
        try { this.message(message); } catch { fail('connection.invalid'); }
      });
    });
  }

  healthyPeer(entry) {
    return Boolean(entry?.approved && entry.mediaReady && entry.dc?.readyState === 'open'
      && entry.pc.connectionState === 'connected');
  }

  loseSignaling(socket) {
    if (this.socket !== socket) return;
    this.socket = null;
    clearInterval(this.keepalive);
    this.keepalive = null;
    this.signalingLost = true;
    try { socket.close(); } catch {}
    for (const entry of [...this.peers.values()]) {
      if (!this.healthyPeer(entry)) this.removePeer(entry.id);
    }
    this.onSignaling();
  }

  restoreSignaling({ manual = false } = {}) {
    if (this.role !== 'camera' || !this.signalingLost || !this.visible()) return Promise.resolve(false);
    if (this.signalingRetry) return this.signalingRetry.promise;
    if (manual) this.signalAttempts = 0;
    if (this.signalAttempts >= 3) return Promise.resolve(false);
    this.signalAttempts += 1;
    const flight = { revision: this.revision, promise: null };
    this.signalingRetry = flight;
    flight.promise = Promise.resolve().then(() => {
      if (this.signalingRetry !== flight || this.revision !== flight.revision || !this.visible()) return false;
      return this.open(this.code, this.discoverable, true).then(() => this.revision === flight.revision, () => false);
    }).finally(() => {
      if (this.signalingRetry === flight) {
        this.signalingRetry = null;
        this.onSignaling();
      }
    });
    this.onSignaling();
    return flight.promise;
  }

  send(data, id = null) {
    if (this.socket?.readyState !== 1) throw new Error('connection.server-failed');
    this.socket.send(JSON.stringify(id === null ? { data } : { to: id, data }));
  }

  message(message) {
    if (this.role === 'camera' && message?.type === 'host-ready') {
      const publication = message.discovery;
      if (publication?.tool === TOOL && publication.code === this.code && CODE_PATTERN.test(publication.code)
          && typeof publication.lease === 'string' && /^[a-z0-9-]{16,128}$/i.test(publication.lease)) {
        this.onDiscovery(publication);
      }
      return;
    }
    if (this.role === 'viewer' && message?.type === 'ready') {
      if (this.peers.size) return;
      const entry = this.newPeer('viewer');
      this.send({ protocol: PROTOCOL, dial: true });
      return entry;
    }
    if (this.role === 'camera' && message?.type === 'leave') {
      if (this.healthyPeer(this.peers.get(message.id))) return;
      this.removePeer(message.id);
      return;
    }
    if (message?.type !== 'signal' || message.data?.protocol !== PROTOCOL) return;
    const id = this.role === 'camera' ? message.from : 'viewer';
    if (typeof id !== 'string' || (this.role === 'camera' && !id.startsWith('v:'))) return;
    const data = message.data;
    if (data.dial === true && this.role === 'camera') {
      if (this.peers.has(id)) return;
      if (this.active !== null || this.peers.size >= MAX_PEERS) {
        this.send({ protocol: PROTOCOL, refused: 'busy' }, id);
        return;
      }
      const entry = this.newPeer(id);
      this.channel(entry, entry.pc.createDataChannel('camera-control'));
      this.queue(entry, () => this.offer(entry));
      return;
    }
    if (data.refused === 'busy' && this.role === 'viewer') {
      this.stop('connection.busy');
      return;
    }
    const entry = this.peers.get(id);
    if (!entry) return;
    this.queue(entry, async () => {
      if (data.description !== undefined) {
        const description = data.description;
        const expected = this.role === 'camera' ? 'answer' : 'offer';
        if (description?.type !== expected || typeof description.sdp !== 'string'
            || description.sdp.length > 60000 || !description.sdp.startsWith('v=0')) throw new Error('connection.invalid');
        await entry.pc.setRemoteDescription(localDescription(description));
        if (!this.current(entry)) return;
        if (expected === 'answer' && entry.video) entry.mediaReady = true;
        for (const candidate of entry.candidates.splice(0)) await entry.pc.addIceCandidate(candidate);
        if (expected === 'answer' && entry.video && entry.pc.connectionState === 'connected') globalThis.aboxToolComplete?.();
        if (expected === 'offer') {
          entry.pc.getTransceivers().forEach((transceiver) => { transceiver.direction = 'recvonly'; });
          await entry.pc.setLocalDescription(await entry.pc.createAnswer());
          if (this.current(entry)) this.signal(entry, { description: localDescription(entry.pc.localDescription) });
        }
      } else if (data.candidate !== undefined) {
        const candidate = data.candidate;
        if (typeof candidate?.candidate !== 'string' || candidate.candidate.length > 2048 || !allowedCandidate(candidate, true)) return;
        if (entry.pc.remoteDescription) await entry.pc.addIceCandidate(candidate);
        else {
          if (entry.candidates.length >= 128) throw new Error('connection.invalid');
          entry.candidates.push(candidate);
        }
      }
    });
  }

  current(entry) { return this.peers.get(entry.id) === entry && entry.revision === this.revision; }

  newPeer(id) {
    const pc = new this.PeerConnection(rtcConfig(true));
    const entry = { id, pc, revision: this.revision, queue: Promise.resolve(), queued: 0, candidates: [], pending: false, approved: false, timers: new Set() };
    this.peers.set(id, entry);
    this.deadline(entry, () => this.peerFailed(entry, 'connection.direct-failed'), CONNECT_TIMEOUT);
    pc.addEventListener('icecandidate', (event) => {
      if (!this.current(entry) || !event.candidate || !allowedCandidate(event.candidate, true)) return;
      try { this.signal(entry, { candidate: event.candidate.toJSON() }); } catch { this.peerFailed(entry, 'connection.server-failed'); }
    });
    pc.addEventListener('datachannel', (event) => {
      if (this.role !== 'viewer' || entry.dc || event.channel.label !== 'camera-control') return this.peerFailed(entry, 'connection.invalid');
      this.channel(entry, event.channel);
    });
    pc.addEventListener('track', (event) => {
      if (!this.current(entry)) return;
      if (this.role !== 'viewer' || !entry.approved || event.track.kind !== 'video') return this.peerFailed(entry, 'connection.invalid');
      const stream = new MediaStream([event.track]);
      entry.mediaReady = true;
      this.onStream(stream);
      event.track.addEventListener('ended', () => {
        if (this.current(entry)) this.stop('connection.ended');
      });
    });
    pc.addEventListener('connectionstatechange', () => {
      if (!this.current(entry)) return;
      if (pc.connectionState === 'failed') this.peerFailed(entry, 'connection.direct-failed');
      if (pc.connectionState === 'disconnected') {
        this.deadline(entry, () => {
          if (pc.connectionState === 'disconnected') this.peerFailed(entry, 'connection.direct-failed');
        }, 5000);
      }
    });
    return entry;
  }

  deadline(entry, work, ms) {
    const timer = setTimeout(() => {
      entry.timers.delete(timer);
      if (this.current(entry)) work();
    }, ms);
    entry.timers.add(timer);
    return timer;
  }

  queue(entry, work) {
    if (entry.queued >= 32) return this.peerFailed(entry, 'connection.invalid');
    entry.queued += 1;
    entry.queue = entry.queue.then(() => this.current(entry) && work()).catch(() => {
      if (this.current(entry)) this.peerFailed(entry, 'connection.invalid');
    }).finally(() => { entry.queued -= 1; });
  }

  signal(entry, data) {
    if (this.signalingLost && this.healthyPeer(entry)) return;
    this.send({ protocol: PROTOCOL, ...data }, this.role === 'camera' ? entry.id : null);
  }

  async offer(entry) {
    await entry.pc.setLocalDescription(await entry.pc.createOffer());
    if (this.current(entry)) this.signal(entry, { description: localDescription(entry.pc.localDescription) });
  }

  control(entry, type, values = {}) {
    if (entry.dc?.readyState !== 'open') throw new Error('connection.direct-failed');
    entry.dc.send(JSON.stringify({ protocol: PROTOCOL, type, ...values }));
  }

  channel(entry, channel) {
    entry.dc = channel;
    const opened = () => {
      if (!this.current(entry) || entry.opened) return;
      entry.opened = true;
      try {
        // Both sides identify the tool over the encrypted channel; approval
        // and the viewer's note never become signalling messages.
        this.control(entry, 'hello');
      } catch { this.peerFailed(entry, 'connection.direct-failed'); }
    };
    channel.addEventListener('open', opened);
    if (channel.readyState === 'open') opened();
    channel.addEventListener('close', () => {
      if (this.current(entry)) this.peerFailed(entry, 'connection.ended');
    });
    channel.addEventListener('message', (event) => {
      if (!this.current(entry)) return;
      const message = controlMessage(event.data);
      if (!message) return this.peerFailed(entry, 'connection.invalid');
      if (message.type === 'hello') {
        if (entry.hello) return;
        entry.hello = true;
        for (const timer of entry.timers) clearTimeout(timer);
        entry.timers.clear();
        if (this.role === 'viewer') {
          this.control(entry, 'request', { note: this.note });
          this.state('viewer.waiting');
        }
      } else if (!entry.hello) {
        this.peerFailed(entry, 'connection.invalid');
      } else if (message.type === 'request' && this.role === 'camera' && !entry.approved) {
        if (entry.pending || entry.refused) return;
        entry.pending = true;
        entry.note = message.note;
        entry.autoAccept = !this.requireApproval;
        if (entry.autoAccept && !this.cameraChange) {
          if (!this.approve(entry.id)) this.deny(entry.id, 'busy');
        } else this.requests();
      } else if (message.type === 'approved' && this.role === 'viewer' && !entry.approved) {
        entry.approved = true;
        this.state('viewer.approved');
        this.control(entry, 'approval-ack');
        this.deadline(entry, () => {
          entry.pc.getStats().then((stats) => {
            const received = [...stats.values()].some((item) => item.type === 'inbound-rtp' && item.kind === 'video' && item.framesDecoded > 0);
            if (this.current(entry) && !received) this.peerFailed(entry, 'connection.direct-failed');
          }).catch(() => {
            if (this.current(entry)) this.peerFailed(entry, 'connection.direct-failed');
          });
        }, CONNECT_TIMEOUT);
      } else if (message.type === 'approval-ack' && this.role === 'camera' && entry.approved && this.active === entry.id) {
        entry.acknowledged = true;
        clearTimeout(entry.approvalDeadline);
        entry.timers.delete(entry.approvalDeadline);
        this.beginVideo(entry);
      } else if (message.type === 'denied' && this.role === 'viewer') {
        this.stop('viewer.denied');
      } else if (message.type === 'busy' && this.role === 'viewer') {
        this.stop('connection.busy');
      } else if (message.type === 'ended' && this.role === 'viewer') {
        this.stop('connection.ended');
      } else {
        this.peerFailed(entry, 'connection.invalid');
      }
    });
  }

  requests() {
    this.onRequests([...this.peers.values()].filter((entry) => entry.pending).map(({ id, note }) => ({ id, note })));
  }

  approve(id) {
    const entry = this.peers.get(id);
    if (!entry?.pending || entry.refused || this.active !== null || this.role !== 'camera' || this.cameraChange) return false;
    const track = this.stream?.getVideoTracks().find((item) => item.readyState === 'live');
    if (!track) { this.state('camera.paused'); return false; }
    this.active = id;
    entry.pending = false;
    entry.approved = true;
    try {
      this.control(entry, 'approved');
    } catch {
      this.peerFailed(entry, 'connection.ended');
      return false;
    }
    entry.approvalDeadline = this.deadline(entry, () => {
      if (!entry.acknowledged) this.peerFailed(entry, 'connection.direct-failed');
    }, CONNECT_TIMEOUT);
    this.requests();
    this.state('camera.approved');
    for (const other of [...this.peers.values()]) {
      if (other !== entry) this.deny(other.id, 'busy');
    }
    return true;
  }

  beginVideo(entry) {
    if (!this.current(entry) || entry.video || !entry.acknowledged || this.role !== 'camera' || this.active !== entry.id || this.cameraChange) return;
    const track = this.stream?.getVideoTracks().find((item) => item.readyState === 'live');
    if (!track) { this.state('camera.paused'); return; }
    try {
      // Approval and SDP use different transports. The acknowledgement proves
      // the viewer processed approval before a video offer can overtake it.
      entry.sender = entry.pc.addTransceiver(track, { direction: 'sendonly', streams: [this.stream] }).sender;
      entry.video = true;
    } catch {
      this.peerFailed(entry, 'connection.ended');
      return;
    }
    this.queue(entry, () => this.offer(entry));
    this.state('camera.streaming');
  }

  prepareCameraChange({ preserveOnFailure = false } = {}) {
    if (this.role !== 'camera' || this.cameraChange) throw new Error('camera.switch-failed');
    const revision = this.revision;
    const operation = { candidate: null };
    this.cameraChange = operation;
    const current = () => this.role === 'camera' && this.revision === revision && this.cameraChange === operation;
    const finish = () => {
      if (!current()) return;
      this.cameraChange = null;
      if (!this.stream?.getVideoTracks().some((track) => track.readyState === 'live')) {
        if (preserveOnFailure) { this.state('camera.paused'); this.requests(); }
        else this.stop('camera.switch-ended');
        return;
      }
      const active = this.peers.get(this.active);
      if (active?.acknowledged) this.beginVideo(active);
      // Only requests made while approval was off may be accepted here.
      // An existing manual request does not inherit a later policy change.
      for (const entry of [...this.peers.values()]) {
        if (entry.pending && entry.autoAccept && !entry.refused) {
          if (!this.approve(entry.id)) this.deny(entry.id, 'busy');
        }
      }
      this.requests();
    };
    this.requests();
    return {
      commit: async (stream) => {
        if (!current()) return false;
        const track = stream?.getVideoTracks().find((item) => item.readyState === 'live');
        if (!track) throw new Error('camera.switch-failed');
        operation.candidate = stream;
        const entry = this.peers.get(this.active);
        const sender = entry?.video ? entry.sender : null;
        const previous = sender?.track;
        if (sender) {
          try { await sender.replaceTrack(track); }
          catch (error) {
            if (!current()) return false;
            // A departing viewer no longer has a sender to replace. The new
            // camera can still serve the next viewer on the same invitation.
            if (this.current(entry)) throw error;
          }
        }
        if (!current()) return false;
        if (track.readyState !== 'live') {
          if (sender && this.current(entry) && previous?.readyState === 'live') {
            try { await sender.replaceTrack(previous); }
            catch { if (this.current(entry)) this.peerFailed(entry, 'connection.ended'); }
          }
          if (!current()) return false;
          throw new Error('camera.switch-failed');
        }
        this.stream = stream;
        operation.candidate = null;
        finish();
        return true;
      },
      cancel: finish,
    };
  }

  deny(id, reason = 'denied') {
    const entry = this.peers.get(id);
    if (!entry || entry.approved) return false;
    try { this.control(entry, reason); } catch {}
    entry.refused = true;
    entry.pending = false;
    this.requests();
    this.deadline(entry, () => this.removePeer(id), 150);
    return true;
  }

  peerFailed(entry, key) {
    if (!this.current(entry)) return;
    if (this.role === 'viewer') this.stop(key);
    else {
      this.removePeer(entry.id);
      // A viewer leaving closes only its peer; the camera invitation remains
      // available and must not acquire the viewer's end-of-link status.
      if (key !== 'connection.ended') this.state(key);
    }
  }

  removePeer(id) {
    const entry = this.peers.get(id);
    if (!entry) return;
    this.peers.delete(id);
    for (const timer of entry.timers) clearTimeout(timer);
    entry.dc?.close();
    entry.pc.close();
    if (this.active === id) this.active = null;
    this.requests();
    if (this.role === 'camera' && this.active === null) this.state('camera.waiting');
    if (this.role === 'camera' && this.signalingLost && this.active === null) void this.restoreSignaling();
  }

  stop(key = 'connection.stopped') {
    const role = this.role;
    // Room's 4410 means host-socket loss, not intentional End. The direct
    // control message remains authoritative even when introductions are down.
    if (role === 'camera' && key === 'connection.stopped') {
      for (const entry of this.peers.values()) {
        try { this.control(entry, 'ended'); } catch {}
      }
    }
    this.revision += 1;
    this.signalingRetry = null;
    this.signalingLost = false;
    this.signalAttempts = 0;
    this.cameraChange?.candidate?.getTracks().forEach((track) => {
      if (track.readyState !== 'ended') track.stop();
    });
    this.cameraChange = null;
    clearInterval(this.keepalive);
    this.keepalive = null;
    const socket = this.socket;
    this.socket = null;
    this.role = null;
    for (const id of [...this.peers.keys()]) this.removePeer(id);
    this.active = null;
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    socket?.close();
    if (role === 'viewer') this.onStream(null);
    if (role) this.onState(key, role);
  }

  async inspect() {
    const entry = this.peers.get(this.role === 'viewer' ? 'viewer' : this.active);
    if (!entry) return null;
    const stats = await entry.pc.getStats();
    const values = [...stats.values()];
    const transport = values.find((item) => item.type === 'transport' && item.selectedCandidatePairId);
    const pair = transport && stats.get(transport.selectedCandidatePairId);
    const local = pair && stats.get(pair.localCandidateId);
    const remote = pair && stats.get(pair.remoteCandidateId);
    const video = values.find((item) => item.type === 'inbound-rtp' && item.kind === 'video');
    return { state: entry.pc.connectionState, local: local?.candidateType, remote: remote?.candidateType, frames: video?.framesDecoded ?? 0 };
  }
}
