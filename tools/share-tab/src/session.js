import { transportMode, transportUrl, peerConfiguration, transportCandidate, transportDescription, selectedTransport, RelayCredentials } from './shared/peer-transport.js';
import { PairingSocket } from './shared/peer-pairing.js';
import { createChannelGreeting } from './shared/peer-greeting.js';
import { rendezvousEndpoint } from './shared/peer-endpoint.js';
import { groupUrl } from './shared/discovery-group.js';
import { AdmissionGrants, createAdmissionCache } from './shared/peer-admission.js';
import { TOOL, PROTOCOL, CHANNEL, CODE_PATTERN, controlMessage } from './protocol.js';

const RENDEZVOUS = rendezvousEndpoint();
const TIMEOUT = 20000;
const MAX_PENDING = 4;

export class TabSession {
  constructor({
    PeerConnection = globalThis.RTCPeerConnection, Socket = globalThis.WebSocket, MediaStream = globalThis.MediaStream,
    onState = () => {}, onRequests = () => {}, onViewers = () => {}, onStream = () => {}, onDiscovery = () => {}, diagnostics = null,
    admissions = createAdmissionCache(),
  } = {}) {
    Object.assign(this, { PeerConnection, Socket, MediaStream, onState, onRequests, onViewers, onStream, onDiscovery, diagnostics });
    this.admissions = admissions;
    this.grants = new AdmissionGrants();
    this.revision = 0;
    this.role = null;
    this.code = null;
    this.discoverable = false;
    this.discoveryGroup = null;
    this.stream = null;
    this.socket = null;
    this.pairing = null;
    this.transport = 'direct';
    this.iceServers = [];
    this.relay = null;
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

  prepareHost(stream) {
    this.stop();
    this.role = 'host';
    this.stream = stream;
    const track = stream?.getVideoTracks().find((item) => item.readyState === 'live');
    if (!track) { this.stop('host.ended'); throw new Error('host.ended'); }
    const revision = this.revision;
    track.addEventListener('ended', () => {
      if (this.revision === revision && this.role === 'host' && this.stream === stream) this.stop('host.ended');
    }, { once: true });
  }

  async startHost(stream, code, { discoverable = false, transport = 'direct', discoveryGroup = null } = {}) {
    this.prepareHost(stream);
    this.transport = transportMode(transport);
    if (!this.transport) { this.stop('transport.invalid'); throw new Error('transport.invalid'); }
    this.discoverable = discoverable === true;
    this.discoveryGroup = discoveryGroup;
    return this.open(code);
  }

  async connect(code, note, { transport = 'direct' } = {}) {
    this.stop();
    this.role = 'viewer';
    this.transport = transportMode(transport);
    if (!this.transport) { this.stop('transport.invalid'); throw new Error('transport.invalid'); }
    this.note = String(note ?? '').trim().slice(0, 80);
    return this.open(code);
  }

  open(code) {
    if (typeof code !== 'string' || !CODE_PATTERN.test(code)) { this.stop('code.invalid'); return Promise.reject(new Error('code.invalid')); }
    this.code = code;
    this.state('connection.starting');
    this.openingTrace = this.diagnostics?.begin(this.role, this.transport === 'relay' ? 'relay' : 'local') ?? null;
    const revision = this.revision;
    return new Promise((resolve, reject) => {
      let settled = false, ready = false, confirmed = false, configured = this.transport === 'direct', socket;
      const waiting = [];
      const offered = this.role === 'host' && this.discoverable;
      try { socket = this.socket = new this.Socket(groupUrl(transportUrl(`${RENDEZVOUS}/ws/${code}?role=${this.role}&tool=${TOOL}${offered ? '&local=1&discover=1' : ''}`, this.transport), offered ? this.discoveryGroup : null)); }
      catch { this.stop('connection.server-failed'); reject(new Error('connection.server-failed')); return; }
      const current = () => this.revision === revision && this.socket === socket;
      const pairing = this.pairing = new PairingSocket(socket, { current });
      const finish = () => {
        if (settled || !current() || !configured || (this.role === 'host' && !confirmed)) return;
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
      const dispatch = (message) => {
        if (message.type === 'ready' && this.role === 'viewer' && !ready) {
          ready = true;
          finish();
          this.dial();
        } else {
          try { this.message(message); } catch { fail('connection.invalid'); }
        }
      };
      if (!configured) this.relay = new RelayCredentials({
        send: (frame) => pairing.send(frame), current,
        onRenew: (servers) => this.renewRelay(servers),
        onError: (error) => fail(error.message),
      });
      this.cancelOpen = () => { if (!settled) { settled = true; reject(new Error('connection.stopped')); } };
      pairing.after('opening', TIMEOUT, () => fail('connection.server-failed'));
      pairing.listen({
        open: () => {
          this.openingTrace?.socket('open');
          if (!pairing.send('ping')) return fail('connection.server-failed');
          pairing.every('heartbeat', 25000, () => {
            if (!pairing.probe({ timeout: 10000, onTimeout: () => fail('connection.server-failed') })) fail('connection.server-failed');
          });
          if (!configured) this.relay.prepare().then((servers) => {
            if (!current()) return;
            this.iceServers = servers;
            configured = true;
            if (this.role === 'host') finish();
            for (const message of waiting.splice(0)) { if (current()) dispatch(message); }
          }).catch((error) => { if (current()) fail(error.message); });
        },
        error: () => fail('connection.server-failed'),
        close: (event) => fail(({ 4404: 'connection.not-found', 4409: 'connection.taken', 4429: 'connection.busy', 4410: 'connection.ended', 4412: 'transport.mismatch', 4413: 'transport.unavailable' })[event.code] ?? 'connection.server-failed'),
        message: (event) => {
          if (event.data === 'pong') { confirmed = true; if (this.role === 'host') finish(); return; }
          if (typeof event.data !== 'string' || event.data.length > 65536) return fail('connection.invalid');
          let message;
          try { message = JSON.parse(event.data); } catch { return fail('connection.invalid'); }
          if (!message || typeof message !== 'object' || Array.isArray(message)) return fail('connection.invalid');
          if (this.relay?.receive(message)) return;
          if (!configured) {
            if (waiting.length >= 64) return fail('connection.invalid');
            waiting.push(message);
          } else dispatch(message);
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
    } catch { this.stop(this.transport === 'relay' ? 'transport.failed' : 'connection.direct-failed'); }
  }

  message(message) {
    if (message.type === 'host-ready') {
      const publication = message.discovery;
      if (this.role === 'host' && this.discoverable
          && publication?.tool === TOOL && publication.code === this.code && CODE_PATTERN.test(publication.code)
          && typeof publication.lease === 'string' && /^[a-z0-9-]{16,128}$/i.test(publication.lease)) {
        this.onDiscovery({ code: publication.code, lease: publication.lease, tool: TOOL, ...(publication.transport ? { transport: publication.transport } : {}) });
      }
      return;
    }
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
    if (data.restart === true && this.role === 'host' && this.transport === 'relay') {
      entry.restartPending = true;
      this.queue(entry, () => this.offer(entry));
      return;
    }
    this.queue(entry, () => this.receiveSignal(entry, data));
  }

  async receiveSignal(entry, data) {
      if (!this.current(entry)) return;
      if (data.description !== undefined) {
        const description = data.description;
        const expected = this.role === 'host' ? 'answer' : 'offer';
        if (description?.type !== expected || typeof description.sdp !== 'string' || description.sdp.length > 60000
            || !description.sdp.startsWith('v=0') || (expected === 'answer' && !entry.awaitingAnswer)
            || (expected === 'offer' && (/^m=audio\s/m.test(description.sdp) || (!entry.approved && /^m=video\s/m.test(description.sdp))))) throw new Error('connection.invalid');
        await entry.pc.setRemoteDescription(transportDescription(description, this.transport));
        if (!this.current(entry)) return;
        for (const candidate of entry.candidates.splice(0)) {
          await entry.pc.addIceCandidate(candidate);
          if (!this.current(entry)) return;
        }
        if (expected === 'offer') {
          entry.pc.getTransceivers().forEach((transceiver) => { transceiver.direction = 'recvonly'; });
          const answer = await entry.pc.createAnswer();
          if (!this.current(entry)) return;
          await entry.pc.setLocalDescription(transportDescription(answer, this.transport));
          if (!this.current(entry)) return;
          this.signal(entry, { description: entry.pc.localDescription });
        } else {
          entry.awaitingAnswer = false;
          if (entry.media) { this.clear(entry, 'media'); entry.negotiated = true; this.viewers(); this.state(this.hostState()); }
          if (entry.offerPending) this.queue(entry, () => this.offer(entry));
        }
      } else if (data.candidate !== undefined) {
        const candidate = data.candidate;
        if (typeof candidate?.candidate !== 'string' || candidate.candidate.length > 2048) throw new Error('connection.invalid');
        if (!transportCandidate(candidate, this.transport)) return;
        if (entry.pc.remoteDescription) await entry.pc.addIceCandidate(candidate);
        else if (entry.candidates.length < 64) entry.candidates.push(candidate);
        else throw new Error('connection.invalid');
      }
  }

  current(entry) { return this.peers.get(entry.id) === entry && entry.revision === this.revision; }

  newPeer(id) {
    // The selected route is a boundary, never an automatic fallback.
    const pc = new this.PeerConnection(peerConfiguration(this.transport, this.iceServers));
    const trace = this.openingTrace ?? this.diagnostics?.begin(this.role, this.transport === 'relay' ? 'relay' : 'local');
    this.openingTrace = null;
    const entry = { id, pc, trace, revision: this.revision, queue: Promise.resolve(), queued: 0, candidates: [], timers: new Map(), approved: false, pending: false };
    this.peers.set(id, entry);
    trace?.attach(pc);
    this.deadline(entry, 'connect', TIMEOUT, () => this.peerFailed(entry));
    pc.addEventListener('icecandidate', (event) => {
      if (!this.current(entry) || !event.candidate) return;
      try {
        const candidate = event.candidate.toJSON();
        if (transportCandidate(candidate, this.transport)) this.signal(entry, { candidate });
      } catch { this.peerFailed(entry); }
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

  signal(entry, data) {
    const frame = data.description === undefined ? data : { ...data, description: transportDescription(data.description, this.transport) };
    this.send({ protocol: PROTOCOL, ...frame }, this.role === 'host' ? entry.id : null);
  }

  renewRelay(servers) {
    this.iceServers = servers;
    for (const entry of this.peers.values()) {
      entry.pc.setConfiguration(peerConfiguration(this.transport, servers));
      if (this.role === 'host') {
        entry.restartPending = true;
        this.queue(entry, () => this.offer(entry));
      } else if (this.role === 'viewer') this.signal(entry, { restart: true });
    }
  }

  async offer(entry) {
    if (entry.awaitingAnswer) { entry.offerPending = true; return; }
    const restarting = entry.restartPending === true;
    entry.restartPending = false;
    entry.offerPending = false;
    const offer = await entry.pc.createOffer(restarting ? { iceRestart: true } : undefined);
    if (!this.current(entry)) return;
    await entry.pc.setLocalDescription(transportDescription(offer, this.transport));
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
    const greeting = createChannelGreeting({
      current: () => this.current(entry),
      send: () => this.control(entry, 'hello'),
      failed: () => this.peerFailed(entry),
    });
    const opened = () => greeting.open();
    channel.addEventListener('open', opened);
    channel.addEventListener('close', () => { if (this.current(entry)) this.peerFailed(entry, 'connection.ended'); });
    channel.addEventListener('error', () => { if (this.current(entry)) this.peerFailed(entry); });
    channel.addEventListener('message', (event) => {
      if (!this.current(entry)) return;
      // A received frame can arrive before the local open callback. Identify
      // this side before responding, and stop if sending that hello retires it.
      if (!greeting.open()) return;
      const message = controlMessage(event.data);
      if (!message) return this.peerFailed(entry, 'connection.invalid');
      try {
        if (message.type === 'hello') {
          if (!greeting.receive()) return;
          entry.hello = true;
          this.clear(entry, 'connect');
          if (this.role === 'viewer') {
            const token = this.admissions.read(TOOL, this.code, this.transport);
            this.control(entry, 'request', { note: this.note, ...(token ? { token } : {}) }); this.state('viewer.waiting');
          }
          else this.deadline(entry, 'request', TIMEOUT, () => this.peerFailed(entry));
        } else if (!entry.hello) this.peerFailed(entry, 'connection.invalid');
        else if (message.type === 'request' && this.role === 'host' && !entry.approved) {
          if (!entry.pending && !entry.refused) {
            this.clear(entry, 'request'); entry.note = message.note; entry.pending = true;
            entry.admissionToken = message.token;
            if (this.grants.has(message.token)) {
              if (!this.approve(entry.id) && this.current(entry)) {
                this.control(entry, 'busy');
                this.removePeer(entry.id);
              }
            } else this.requests();
          }
        } else if (message.type === 'approved' && this.role === 'viewer') {
          if (entry.approved) return;
          entry.approved = true;
          this.admissions.save(TOOL, this.code, this.transport, message.token);
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
    const token = this.grants.issue(entry.admissionToken);
    if (!token) { this.state('approval.limit'); return false; }
    entry.pending = false;
    entry.approved = true;
    entry.admissionToken = token;
    try { this.control(entry, 'approved', { token }); } catch { this.peerFailed(entry); return false; }
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
    this.grants.revoke(entry.admissionToken);
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
    this.grants.revoke(entry.admissionToken);
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

  peerFailed(entry, key = 'connection.direct-failed') {
    if (!this.current(entry)) return;
    if (key === 'connection.direct-failed' && this.transport === 'relay') key = 'transport.failed';
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
    this.grants.clear();
    // Retire asynchronous offers before closing anything that can emit events.
    this.revision += 1;
    this.relay?.close();
    this.relay = null;
    this.iceServers = [];
    if (role === 'host') for (const entry of this.peers.values()) { try { this.control(entry, 'ended'); } catch {} }
    this.role = null;
    this.code = null;
    this.discoverable = false;
    this.cancelOpen?.(); this.cancelOpen = null;
    this.discoveryGroup = null;
    this.openingTrace?.finish('stopped'); this.openingTrace = null;
    const pairing = this.pairing;
    this.pairing = null; this.socket = null;
    for (const id of [...this.peers.keys()]) this.removePeer(id);
    this.stream?.getTracks().forEach((track) => { if (track.readyState !== 'ended') track.stop(); });
    this.stream = null;
    pairing?.close();
    if (role === 'host') this.onDiscovery(null);
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
    return { state: entry.pc.connectionState, route: selectedTransport(stats), local: pair && stats.get(pair.localCandidateId)?.candidateType,
      remote: pair && stats.get(pair.remoteCandidateId)?.candidateType, frames: video?.framesDecoded ?? 0 };
  }
}
