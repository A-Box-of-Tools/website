import { rtcConfig, allowedCandidate } from './shared/peer-network.js';
import { PairingSocket } from './shared/peer-pairing.js';
import { TOOL, PROTOCOL, CHANNEL, CODE_PATTERN, controlMessage, relayServer } from './protocol.js';

const RENDEZVOUS = 'wss://rendezvous.abox.tools';
const TIMEOUT = 20000;
const MAX_PENDING = 4;

export class TabSession {
  constructor({
    PeerConnection = globalThis.RTCPeerConnection, Socket = globalThis.WebSocket, MediaStream = globalThis.MediaStream,
    onState = () => {}, onRequests = () => {}, onViewers = () => {}, onStream = () => {}, diagnostics = null,
  } = {}) {
    Object.assign(this, { PeerConnection, Socket, MediaStream, onState, onRequests, onViewers, onStream, diagnostics });
    this.revision = 0;
    this.role = null;
    this.stream = null;
    this.socket = null;
    this.pairing = null;
    this.peers = new Map();
    this.cancelOpen = null;
    this.openingTrace = null;
  }

  state(key) { this.onState(key, this.role); }
  get viewerCount() { return this.role === 'host' ? [...this.peers.values()].filter((entry) => entry.approved).length : 0; }
  get hasViewers() { return this.role === 'host' && this.peers.size > 0; }

  hostState() {
    if ([...this.peers.values()].some((entry) => entry.media && entry.negotiated && entry.pc.connectionState === 'connected')) return 'host.streaming';
    return this.viewerCount ? 'host.approved' : 'host.waiting';
  }

  requests() { this.onRequests([...this.peers.values()].filter((entry) => entry.pending).map(({ id, note }) => ({ id, note }))); }
  viewers() {
    this.onViewers([...this.peers.values()].filter((entry) => entry.approved && this.role === 'host')
      .map(({ id, note, media, negotiated, pc }) => ({ id, note, streaming: Boolean(media && negotiated && pc.connectionState === 'connected') })));
  }

  async startHost(stream, code) {
    this.stop();
    this.role = 'host';
    this.stream = stream;
    const track = stream?.getVideoTracks().find((item) => item.readyState === 'live');
    if (!track) { this.stop('host.ended'); throw new Error('host.ended'); }
    const revision = this.revision;
    track.addEventListener('ended', () => {
      if (this.revision === revision && this.role === 'host' && this.stream === stream) this.stop('host.ended');
    }, { once: true });
    return this.open(code);
  }

  async connect(code, note, { relay = false } = {}) {
    this.stop();
    this.role = 'viewer';
    this.note = String(note ?? '').trim().slice(0, 80);
    this.wantRelay = Boolean(relay);
    this.relay = null;
    return this.open(code);
  }

  open(code) {
    if (typeof code !== 'string' || !CODE_PATTERN.test(code)) { this.stop('code.invalid'); return Promise.reject(new Error('code.invalid')); }
    this.code = code;
    this.state('connection.starting');
    this.openingTrace = this.diagnostics?.begin(this.role, this.wantRelay && this.role === 'viewer' ? 'relay' : 'internet') ?? null;
    const revision = this.revision;
    return new Promise((resolve, reject) => {
      let settled = false, ready = false, socket;
      try { socket = this.socket = new this.Socket(`${RENDEZVOUS}/ws/${code}?role=${this.role}&tool=${TOOL}`); }
      catch { this.stop('connection.server-failed'); reject(new Error('connection.server-failed')); return; }
      const current = () => this.revision === revision && this.socket === socket;
      const pairing = this.pairing = new PairingSocket(socket, { current });
      const finish = () => {
        if (settled || !current()) return;
        settled = true;
        pairing.clear('opening');
        this.cancelOpen = null;
        this.state(this.role === 'host' ? this.hostState() : 'connection.connecting');
        resolve();
      };
      const fail = (key) => {
        if (!current()) return;
        const pending = !settled;
        settled = true;
        this.cancelOpen = null;
        this.stop(key);
        if (pending) reject(new Error(key));
      };
      this.cancelOpen = () => { if (!settled) { settled = true; reject(new Error('connection.stopped')); } };
      pairing.after('opening', TIMEOUT, () => fail('connection.server-failed'));
      pairing.listen({
        open: () => {
          this.openingTrace?.socket('open');
          if (!pairing.send('ping')) return fail('connection.server-failed');
          pairing.every('heartbeat', 25000, () => {
            if (!pairing.probe({ timeout: 10000, onTimeout: () => fail('connection.server-failed') })) fail('connection.server-failed');
          });
        },
        error: () => fail('connection.server-failed'),
        close: (event) => fail(({ 4404: 'connection.not-found', 4409: 'connection.taken', 4429: 'connection.busy', 4410: 'connection.ended' })[event.code] ?? 'connection.server-failed'),
        message: (event) => {
          if (event.data === 'pong') { if (this.role === 'host') finish(); return; }
          if (typeof event.data !== 'string' || event.data.length > 65536) return fail('connection.invalid');
          let message;
          try { message = JSON.parse(event.data); } catch { return fail('connection.invalid'); }
          if (!message || typeof message !== 'object' || Array.isArray(message)) return fail('connection.invalid');
          if (message.type === 'ready' && this.role === 'viewer' && !ready) {
            ready = true;
            finish();
            if (this.wantRelay) {
              this.state('connection.relaying');
              pairing.after('relay', 10000, () => fail('connection.relay-unavailable'));
              if (!pairing.send({ relay: true })) fail('connection.server-failed');
            } else this.dial();
          } else if (message.type === 'relay' && this.role === 'viewer' && this.wantRelay && ready && !this.peers.size) {
            pairing.clear('relay');
            this.relay = relayServer(message.iceServers);
            if (!this.relay) return fail('connection.relay-unavailable');
            this.dial();
          } else {
            try { this.message(message); } catch { fail('connection.invalid'); }
          }
        },
      });
    });
  }

  send(data, id = null) {
    if (!this.pairing?.send(id === null ? { data } : { to: id, data })) throw new Error('connection.server-failed');
  }

  dial() {
    try {
      this.newPeer('viewer');
      this.send({ protocol: PROTOCOL, dial: true });
    } catch { this.stop(this.wantRelay ? 'connection.relay-failed' : 'connection.direct-failed'); }
  }

  message(message) {
    if (this.role === 'host' && message.type === 'leave') { this.removePeer(message.id); return; }
    if (message.type !== 'signal') return;
    const id = this.role === 'host' ? message.from : 'viewer';
    if (typeof id !== 'string' || (this.role === 'host' && !/^v:[a-z0-9-]{1,64}$/i.test(id))) return;
    const data = message.data;
    if (data?.protocol !== PROTOCOL) {
      const entry = this.peers.get(id);
      if (entry) this.peerFailed(entry, 'connection.invalid');
      else if (this.role === 'host' && data?.dial === true) this.send({ protocol: PROTOCOL, refused: 'protocol' }, id);
      return;
    }
    if (data.dial === true && this.role === 'host') {
      if (this.peers.has(id)) return;
      if (this.viewerCount || [...this.peers.values()].filter((entry) => !entry.approved).length >= MAX_PENDING) {
        this.send({ protocol: PROTOCOL, refused: 'busy' }, id);
        return;
      }
      const entry = this.newPeer(id);
      this.channel(entry, entry.pc.createDataChannel(CHANNEL));
      this.queue(entry, () => this.offer(entry));
      return;
    }
    if (data.refused === 'busy' && this.role === 'viewer') { this.stop('connection.busy'); return; }
    if (data.refused === 'protocol' && this.role === 'viewer') { this.stop('connection.invalid'); return; }
    const entry = this.peers.get(id);
    if (!entry) return;
    this.queue(entry, async () => {
      if (data.description !== undefined) {
        const description = data.description;
        const expected = this.role === 'host' ? 'answer' : 'offer';
        if (description?.type !== expected || typeof description.sdp !== 'string' || description.sdp.length > 60000
            || !description.sdp.startsWith('v=0') || (expected === 'answer' && !entry.awaitingAnswer)
            || (expected === 'offer' && (/^m=audio\s/m.test(description.sdp) || (!entry.approved && /^m=video\s/m.test(description.sdp))))) throw new Error('connection.invalid');
        await entry.pc.setRemoteDescription(description);
        if (!this.current(entry)) return;
        for (const candidate of entry.candidates.splice(0)) {
          await entry.pc.addIceCandidate(candidate);
          if (!this.current(entry)) return;
        }
        if (expected === 'offer') {
          entry.pc.getTransceivers().forEach((transceiver) => { transceiver.direction = 'recvonly'; });
          const answer = await entry.pc.createAnswer();
          if (!this.current(entry)) return;
          await entry.pc.setLocalDescription(answer);
          if (this.current(entry)) this.signal(entry, { description: entry.pc.localDescription });
        } else {
          entry.awaitingAnswer = false;
          if (entry.media) { this.clear(entry, 'media'); entry.negotiated = true; this.viewers(); this.state(this.hostState()); }
        }
      } else if (data.candidate !== undefined) {
        const candidate = data.candidate;
        if (typeof candidate?.candidate !== 'string' || candidate.candidate.length > 2048 || !allowedCandidate(candidate, false)) throw new Error('connection.invalid');
        if (entry.pc.remoteDescription) await entry.pc.addIceCandidate(candidate);
        else if (entry.candidates.length < 64) entry.candidates.push(candidate);
        else throw new Error('connection.invalid');
      }
    });
  }

  current(entry) { return this.peers.get(entry.id) === entry && entry.revision === this.revision; }

  newPeer(id) {
    const configuration = rtcConfig(false, this.role === 'viewer' ? this.relay : null);
    if (this.role === 'viewer' && this.relay) configuration.iceTransportPolicy = 'relay';
    const pc = new this.PeerConnection(configuration);
    const trace = this.openingTrace ?? this.diagnostics?.begin(this.role, 'internet');
    this.openingTrace = null;
    const entry = { id, pc, trace, revision: this.revision, queue: Promise.resolve(), queued: 0, candidates: [], timers: new Map(), approved: false, pending: false };
    this.peers.set(id, entry);
    trace?.attach(pc);
    this.deadline(entry, 'connect', TIMEOUT, () => this.peerFailed(entry));
    pc.addEventListener('icecandidate', (event) => {
      if (!this.current(entry) || !event.candidate) return;
      try { this.signal(entry, { candidate: event.candidate.toJSON() }); } catch { this.peerFailed(entry); }
    });
    pc.addEventListener('datachannel', (event) => {
      if (!this.current(entry)) { event.channel.close(); return; }
      if (this.role !== 'viewer' || entry.dc || event.channel.label !== CHANNEL) { event.channel.close(); this.peerFailed(entry, 'connection.invalid'); return; }
      this.channel(entry, event.channel);
    });
    pc.addEventListener('track', (event) => {
      if (!this.current(entry)) { event.track.stop(); return; }
      if (this.role !== 'viewer' || !entry.approved || event.track.kind !== 'video'
          || (entry.received && !entry.received.getTracks().includes(event.track))) {
        event.track.stop(); this.peerFailed(entry, 'connection.invalid'); return;
      }
      if (entry.received) return;
      this.stream = entry.received = new this.MediaStream([event.track]);
      this.onStream(entry.received);
      this.state('viewer.streaming');
      event.track.addEventListener('ended', () => { if (this.current(entry)) this.stop('connection.ended'); }, { once: true });
    });
    pc.addEventListener('connectionstatechange', () => {
      if (!this.current(entry)) return;
      if (pc.connectionState === 'connected') {
        this.clear(entry, 'disconnect');
        if (this.role === 'host') { this.viewers(); this.state(this.hostState()); }
      } else if (pc.connectionState === 'disconnected') {
        this.deadline(entry, 'disconnect', 8000, () => this.peerFailed(entry, entry.approved ? 'connection.ended' : undefined));
      } else if (['failed', 'closed'].includes(pc.connectionState)) this.peerFailed(entry);
    });
    return entry;
  }

  queue(entry, work) {
    if (!this.current(entry)) return;
    if (entry.queued >= 128) { this.peerFailed(entry, 'connection.invalid'); return; }
    entry.queued += 1;
    entry.queue = entry.queue.then(() => this.current(entry) ? work() : undefined).catch(() => {
      if (this.current(entry)) this.peerFailed(entry, 'connection.invalid');
    }).finally(() => { entry.queued -= 1; });
  }

  signal(entry, data) { this.send({ protocol: PROTOCOL, ...data }, this.role === 'host' ? entry.id : null); }

  async offer(entry) {
    const offer = await entry.pc.createOffer();
    if (!this.current(entry)) return;
    await entry.pc.setLocalDescription(offer);
    if (!this.current(entry)) return;
    entry.awaitingAnswer = true;
    this.signal(entry, { description: entry.pc.localDescription });
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
      try { this.control(entry, 'hello'); } catch { this.peerFailed(entry); }
    };
    channel.addEventListener('open', opened);
    channel.addEventListener('close', () => { if (this.current(entry)) this.peerFailed(entry, 'connection.ended'); });
    channel.addEventListener('error', () => { if (this.current(entry)) this.peerFailed(entry); });
    channel.addEventListener('message', (event) => {
      if (!this.current(entry)) return;
      const message = controlMessage(event.data);
      if (!message) return this.peerFailed(entry, 'connection.invalid');
      try {
        if (message.type === 'hello') {
          if (entry.hello) return;
          entry.hello = true;
          this.clear(entry, 'connect');
          if (this.role === 'viewer') { this.control(entry, 'request', { note: this.note }); this.state('viewer.waiting'); }
          else this.deadline(entry, 'request', TIMEOUT, () => this.peerFailed(entry));
        } else if (!entry.hello) this.peerFailed(entry, 'connection.invalid');
        else if (message.type === 'request' && this.role === 'host' && !entry.approved) {
          if (!entry.pending && !entry.refused) {
            this.clear(entry, 'request'); entry.note = message.note; entry.pending = true; this.requests();
          }
        } else if (message.type === 'approved' && this.role === 'viewer') {
          if (entry.approved) return;
          entry.approved = true;
          this.state('viewer.approved');
          this.control(entry, 'approval-ack');
          this.deadline(entry, 'media', TIMEOUT, async () => {
            try {
              const stats = await entry.pc.getStats();
              if (this.current(entry) && ![...stats.values()].some((item) => item.type === 'inbound-rtp' && item.kind === 'video' && item.framesDecoded > 0)) this.peerFailed(entry);
            } catch { if (this.current(entry)) this.peerFailed(entry); }
          });
        } else if (message.type === 'approval-ack' && this.role === 'host' && entry.approved) {
          if (entry.acknowledged) return;
          entry.acknowledged = true;
          this.clear(entry, 'approval');
          this.beginVideo(entry);
        } else if (message.type === 'denied' && this.role === 'viewer') this.stop('viewer.denied');
        else if (message.type === 'busy' && this.role === 'viewer') this.stop('connection.busy');
        else if (message.type === 'ended' && this.role === 'viewer') this.stop('connection.ended');
        else this.peerFailed(entry, 'connection.invalid');
      } catch { this.peerFailed(entry); }
    });
    if (channel.readyState === 'open') opened();
  }

  approve(id) {
    const entry = this.peers.get(id);
    if (this.role !== 'host' || !entry?.pending || entry.approved || entry.refused || this.viewerCount) return false;
    if (!this.stream?.getVideoTracks().some((track) => track.readyState === 'live')) { this.stop('host.ended'); return false; }
    entry.pending = false;
    entry.approved = true;
    try { this.control(entry, 'approved'); } catch { this.peerFailed(entry); return false; }
    this.deadline(entry, 'approval', TIMEOUT, () => this.peerFailed(entry));
    this.requests(); this.viewers(); this.state(this.hostState());
    return true;
  }

  beginVideo(entry) {
    this.queue(entry, async () => {
      if (this.role !== 'host' || !entry.approved || !entry.acknowledged || entry.media) return;
      const track = this.stream?.getVideoTracks().find((item) => item.readyState === 'live');
      if (!track) { this.stop('host.ended'); return; }
      // Consent travels on the encrypted channel before any media enters SDP.
      entry.sender = entry.pc.addTransceiver(track, { direction: 'sendonly', streams: [this.stream] }).sender;
      entry.media = true;
      this.deadline(entry, 'media', TIMEOUT, () => this.peerFailed(entry));
      await this.offer(entry);
    });
  }

  deny(id) {
    const entry = this.peers.get(id);
    if (this.role !== 'host' || !entry || entry.approved) return false;
    try { this.control(entry, 'denied'); } catch {}
    entry.refused = true;
    entry.pending = false;
    this.requests();
    this.deadline(entry, 'denied', 150, () => this.removePeer(id));
    return true;
  }

  disconnectViewer(id) {
    const entry = this.peers.get(id);
    if (this.role !== 'host' || !entry?.approved) return false;
    try { this.control(entry, 'ended'); } catch {}
    this.removePeer(id);
    return true;
  }

  clear(entry, name) { clearTimeout(entry.timers.get(name)); entry.timers.delete(name); }
  deadline(entry, name, delay, callback) {
    this.clear(entry, name);
    const timer = setTimeout(() => {
      if (entry.timers.get(name) !== timer) return;
      entry.timers.delete(name);
      if (this.current(entry)) callback();
    }, delay);
    entry.timers.set(name, timer);
  }

  peerFailed(entry, key = this.wantRelay && this.role === 'viewer' ? 'connection.relay-failed' : 'connection.direct-failed') {
    if (!this.current(entry)) return;
    if (this.role === 'viewer') this.stop(key);
    else this.removePeer(entry.id);
  }

  removePeer(id) {
    const entry = this.peers.get(id);
    if (!entry) return;
    this.peers.delete(id);
    for (const timer of entry.timers.values()) clearTimeout(timer);
    entry.timers.clear();
    entry.trace?.finish('ended');
    entry.received?.getTracks().forEach((track) => track.stop());
    entry.dc?.close();
    entry.pc.close();
    this.requests(); this.viewers();
    if (this.role === 'host') this.state(this.hostState());
  }

  stop(key = 'connection.stopped') {
    const role = this.role;
    // Retire asynchronous offers before closing anything that can emit events.
    this.revision += 1;
    if (role === 'host') for (const entry of this.peers.values()) { try { this.control(entry, 'ended'); } catch {} }
    this.role = null;
    this.cancelOpen?.(); this.cancelOpen = null;
    this.openingTrace?.finish('stopped'); this.openingTrace = null;
    const pairing = this.pairing;
    this.pairing = null; this.socket = null;
    for (const id of [...this.peers.keys()]) this.removePeer(id);
    this.stream?.getTracks().forEach((track) => { if (track.readyState !== 'ended') track.stop(); });
    this.stream = null;
    pairing?.close();
    if (role === 'viewer') this.onStream(null);
    if (role) this.onState(key, role);
  }

  async inspect() {
    const entry = this.peers.values().next().value;
    if (!entry) return null;
    const stats = await entry.pc.getStats();
    if (!this.current(entry)) return null;
    const values = [...stats.values()];
    const transport = values.find((item) => item.type === 'transport' && item.selectedCandidatePairId);
    const pair = transport && stats.get(transport.selectedCandidatePairId);
    const video = values.find((item) => item.type === 'inbound-rtp' && item.kind === 'video');
    return { state: entry.pc.connectionState, local: pair && stats.get(pair.localCandidateId)?.candidateType,
      remote: pair && stats.get(pair.remoteCandidateId)?.candidateType, frames: video?.framesDecoded ?? 0 };
  }
}
