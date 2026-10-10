import { rtcConfig, allowedCandidate, localDescription } from './shared/peer-network.js';
import { PROTOCOL, TOOL, CODE_PATTERN, controlMessage } from './protocol.js';

const RENDEZVOUS = 'wss://rendezvous.abox.tools';
const CONNECT_TIMEOUT = 20000;
const MAX_PEERS = 4;

export class CameraSession {
  constructor({
    PeerConnection = globalThis.RTCPeerConnection, Socket = globalThis.WebSocket,
    onState = () => {}, onRequests = () => {}, onStream = () => {}, onDiscovery = () => {},
  } = {}) {
    this.PeerConnection = PeerConnection;
    this.Socket = Socket;
    this.onState = onState;
    this.onRequests = onRequests;
    this.onStream = onStream;
    this.onDiscovery = onDiscovery;
    this.revision = 0;
    this.role = null;
    this.socket = null;
    this.stream = null;
    this.peers = new Map();
    this.active = null;
    this.keepalive = null;
  }

  state(key) { this.onState(key, this.role); }

  async startHost(stream, code, { discoverable = false } = {}) {
    this.stop();
    this.role = 'camera';
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

  open(code, discoverable = false) {
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
        if (current()) this.stop(key);
        if (!ready) reject(new Error(key));
      };
      socket.addEventListener('open', () => {
        if (!current()) return;
        ready = true;
        clearTimeout(timer);
        this.keepalive = setInterval(() => {
          if (current() && socket.readyState === 1) socket.send('ping');
        }, 25000);
        this.state(this.role === 'camera' ? 'camera.waiting' : 'connection.connecting');
        resolve();
      });
      socket.addEventListener('error', () => fail('connection.server-failed'));
      socket.addEventListener('close', (event) => {
        const reasons = { 4404: 'connection.not-found', 4409: 'connection.taken', 4429: 'connection.busy', 4410: 'connection.ended' };
        fail(reasons[event.code] ?? 'connection.server-failed');
      });
      socket.addEventListener('message', (event) => {
        if (!current() || event.data === 'pong') return;
        if (typeof event.data !== 'string' || event.data.length > 65536) return fail('connection.invalid');
        let message;
        try { message = JSON.parse(event.data); } catch { return fail('connection.invalid'); }
        try { this.message(message); } catch { fail('connection.invalid'); }
      });
    });
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
        for (const candidate of entry.candidates.splice(0)) await entry.pc.addIceCandidate(candidate);
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
  }

  queue(entry, work) {
    if (entry.queued >= 32) return this.peerFailed(entry, 'connection.invalid');
    entry.queued += 1;
    entry.queue = entry.queue.then(() => this.current(entry) && work()).catch(() => {
      if (this.current(entry)) this.peerFailed(entry, 'connection.invalid');
    }).finally(() => { entry.queued -= 1; });
  }

  signal(entry, data) {
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
        if (entry.pending) return;
        entry.pending = true;
        entry.note = message.note;
        this.requests();
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
    if (!entry?.pending || this.active !== null || this.role !== 'camera') return false;
    const track = this.stream?.getVideoTracks().find((item) => item.readyState === 'live');
    if (!track) { this.stop('camera.ended'); return false; }
    this.active = id;
    entry.pending = false;
    entry.approved = true;
    try {
      this.control(entry, 'approved');
    } catch {
      this.peerFailed(entry, 'connection.ended');
      return false;
    }
    this.deadline(entry, () => {
      if (!entry.video) this.peerFailed(entry, 'connection.direct-failed');
    }, CONNECT_TIMEOUT);
    this.requests();
    this.state('camera.approved');
    for (const other of [...this.peers.values()]) {
      if (other !== entry) this.deny(other.id, 'busy');
    }
    return true;
  }

  beginVideo(entry) {
    if (!this.current(entry) || entry.video || this.role !== 'camera' || this.active !== entry.id) return;
    const track = this.stream?.getVideoTracks().find((item) => item.readyState === 'live');
    if (!track) { this.stop('camera.ended'); return; }
    try {
      // Approval and SDP use different transports. The acknowledgement proves
      // the viewer processed approval before a video offer can overtake it.
      entry.pc.addTransceiver(track, { direction: 'sendonly', streams: [this.stream] });
      entry.video = true;
    } catch {
      this.peerFailed(entry, 'connection.ended');
      return;
    }
    this.queue(entry, () => this.offer(entry));
    this.state('camera.streaming');
  }

  deny(id, reason = 'denied') {
    const entry = this.peers.get(id);
    if (!entry || entry.approved) return false;
    try { this.control(entry, reason); } catch {}
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
  }

  stop(key = 'connection.stopped') {
    const role = this.role;
    this.revision += 1;
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
