/**
 * Pairing for a folder sync: the introduction, the peer connection, and the
 * host's approval of the one device it syncs with. What the two devices then
 * say about their folders is sync.js's; this file hands it a link once the
 * other side is admitted and takes it away when that side goes.
 *
 * The shape follows Share a Browser Tab's session, minus the video and the
 * relay: an encrypted control channel first, the guest's request and the
 * host's approval on it, and nothing about either folder until both have
 * agreed. Direct is the only route. A relay would forward whole folders
 * through a metered service, which is a different decision from forwarding
 * a few kilobytes of text or a picture.
 */
import { transportUrl, peerConfiguration, transportCandidate, transportDescription } from './shared/peer-transport.js';
import { PairingSocket } from './shared/peer-pairing.js';
import { createChannelGreeting } from './shared/peer-greeting.js';
import { rendezvousEndpoint } from './shared/peer-endpoint.js';
import { groupUrl } from './shared/discovery-group.js';
import { AdmissionGrants, createAdmissionCache } from './shared/peer-admission.js';
import { answerHostProve, createHostClaim, holderUrl } from './shared/peer-host-claim.js';
import { TOOL, PROTOCOL, CHANNEL, CODE_PATTERN, LANE_PATTERN, SESSION_TYPES, controlMessage } from './protocol.js';

const RENDEZVOUS = rendezvousEndpoint();
const TIMEOUT = 20000;
const MAX_PENDING = 4;
const ROUTE = 'direct';

export class SyncSession {
  constructor({
    PeerConnection = globalThis.RTCPeerConnection, Socket = globalThis.WebSocket,
    onState = () => {}, onRequests = () => {}, onPeer = () => {}, onDiscovery = () => {},
    onLink = () => {}, onMessage = () => {}, onLane = () => {},
    admissions = createAdmissionCache(), hostClaim = createHostClaim(),
  } = {}) {
    Object.assign(this, { PeerConnection, Socket, onState, onRequests, onPeer, onDiscovery, onLink, onMessage, onLane });
    this.admissions = admissions;
    // Settled long before anybody can press Start. Without WebCrypto the room
    // is hosted as an older page hosts it, with nothing proving the name its own.
    this.hostClaim = null;
    Promise.resolve(hostClaim).then((claim) => { this.hostClaim = claim; }, () => {});
    this.grants = new AdmissionGrants();
    this.revision = 0;
    this.role = null;
    this.code = null;
    this.note = '';
    this.discoverable = false;
    this.discoveryGroup = null;
    this.socket = null;
    this.pairing = null;
    this.peers = new Map();
    this.cancelOpen = null;
  }

  state(key) { this.onState(key, this.role); }
  get linked() { return [...this.peers.values()].some((entry) => entry.admitted); }
  get partnerCount() { return this.role === 'host' ? [...this.peers.values()].filter((entry) => entry.approved).length : 0; }

  hostState() { return this.linked ? 'host.linked' : this.partnerCount ? 'host.approved' : 'host.waiting'; }

  requests() { this.onRequests([...this.peers.values()].filter((entry) => entry.pending).map(({ id, note }) => ({ id, note }))); }
  partner() {
    const entry = [...this.peers.values()].find((item) => item.approved && this.role === 'host');
    this.onPeer(entry ? { id: entry.id, note: entry.note, linked: Boolean(entry.admitted) } : null);
  }

  async startHost(code, { discoverable = false, discoveryGroup = null } = {}) {
    this.stop();
    this.role = 'host';
    this.discoverable = discoverable === true;
    this.discoveryGroup = discoveryGroup;
    return this.open(code);
  }

  async connect(code, note) {
    this.stop();
    this.role = 'guest';
    this.note = String(note ?? '').trim().slice(0, 80);
    return this.open(code);
  }

  open(code) {
    if (typeof code !== 'string' || !CODE_PATTERN.test(code)) { this.stop('code.invalid'); return Promise.reject(new Error('code.invalid')); }
    this.code = code;
    this.state('connection.starting');
    const revision = this.revision;
    return new Promise((resolve, reject) => {
      let settled = false, ready = false, confirmed = false, socket;
      const offered = this.role === 'host' && this.discoverable;
      // The rendezvous knows a guest as a viewer; to it, one is the other.
      const role = this.role === 'host' ? 'host' : 'viewer';
      try {
        const base = `${RENDEZVOUS}/ws/${code}?role=${role}&tool=${TOOL}${offered ? '&local=1&discover=1' : ''}`;
        socket = this.socket = new this.Socket(holderUrl(groupUrl(transportUrl(base, ROUTE), offered ? this.discoveryGroup : null),
          this.role === 'host' ? this.hostClaim : null));
      } catch { this.stop('connection.server-failed'); reject(new Error('connection.server-failed')); return; }
      const current = () => this.revision === revision && this.socket === socket;
      const pairing = this.pairing = new PairingSocket(socket, { current });
      const finish = () => {
        if (settled || !current() || (this.role === 'host' && !confirmed)) return;
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
          if (!pairing.send('ping')) return fail('connection.server-failed');
          pairing.every('heartbeat', 25000, () => {
            if (!pairing.probe({ timeout: 10000, onTimeout: () => fail('connection.server-failed') })) fail('connection.server-failed');
          });
        },
        error: () => fail('connection.server-failed'),
        close: (event) => fail(({ 4404: 'connection.not-found', 4409: 'connection.taken', 4429: 'connection.busy',
          4410: 'connection.ended', 4412: 'connection.invalid', 4413: 'connection.invalid' })[event.code] ?? 'connection.server-failed'),
        message: (event) => {
          if (event.data === 'pong') { confirmed = true; if (this.role === 'host') finish(); return; }
          if (typeof event.data !== 'string' || event.data.length > 65536) return fail('connection.invalid');
          let message;
          try { message = JSON.parse(event.data); } catch { return fail('connection.invalid'); }
          if (!message || typeof message !== 'object' || Array.isArray(message)) return fail('connection.invalid');
          if (answerHostProve(message, this.role === 'host' ? this.hostClaim : null, (frame) => pairing.send(frame))) return;
          // Just ahead of the close with 4410, which Chromium holds for up to two seconds.
          if (message.type === 'host-gone') return fail('connection.ended');
          if (message.type === 'ready' && this.role === 'guest' && !ready) {
            ready = true;
            finish();
            this.dial();
            return;
          }
          try { this.signalling(message); } catch { fail('connection.invalid'); }
        },
      });
    });
  }

  send(data, id = null) {
    if (!this.pairing?.send(id === null ? { data } : { to: id, data })) throw new Error('connection.server-failed');
  }

  dial() {
    try {
      this.newPeer('host');
      this.send({ protocol: PROTOCOL, dial: true });
    } catch { this.stop('connection.direct-failed'); }
  }

  signalling(message) {
    if (message.type === 'host-ready') {
      const publication = message.discovery;
      if (this.role === 'host' && this.discoverable
          && publication?.tool === TOOL && publication.code === this.code && CODE_PATTERN.test(publication.code)
          && typeof publication.lease === 'string' && /^[a-z0-9-]{16,128}$/i.test(publication.lease)) {
        this.onDiscovery({ code: publication.code, lease: publication.lease, tool: TOOL });
      }
      return;
    }
    if (this.role === 'host' && message.type === 'leave') {
      // The rendezvous can hear the guest go before its channel closes here;
      // either way the host is told the same thing.
      const admitted = this.peers.get(message.id)?.admitted === true;
      this.removePeer(message.id);
      if (admitted) this.state('host.lost');
      return;
    }
    if (message.type !== 'signal') return;
    const id = this.role === 'host' ? message.from : 'host';
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
      if (this.partnerCount || [...this.peers.values()].filter((entry) => !entry.approved).length >= MAX_PENDING) {
        this.send({ protocol: PROTOCOL, refused: 'busy' }, id);
        return;
      }
      const entry = this.newPeer(id);
      this.channel(entry, entry.pc.createDataChannel(CHANNEL));
      this.queue(entry, () => this.offer(entry));
      return;
    }
    if (data.refused === 'busy' && this.role === 'guest') { this.stop('connection.busy'); return; }
    if (data.refused === 'protocol' && this.role === 'guest') { this.stop('connection.invalid'); return; }
    const entry = this.peers.get(id);
    if (!entry) return;
    this.queue(entry, () => this.receiveSignal(entry, data));
  }

  async receiveSignal(entry, data) {
    if (!this.current(entry)) return;
    if (data.description !== undefined) {
      const description = data.description;
      const expected = this.role === 'host' ? 'answer' : 'offer';
      // A folder sync never carries sound or pictures, so a description that
      // offers either is not one this page made.
      if (description?.type !== expected || typeof description.sdp !== 'string' || description.sdp.length > 60000
          || !description.sdp.startsWith('v=0') || (expected === 'answer' && !entry.awaitingAnswer)
          || /^m=(?:audio|video)\s/m.test(description.sdp)) throw new Error('connection.invalid');
      await entry.pc.setRemoteDescription(transportDescription(description, ROUTE));
      if (!this.current(entry)) return;
      for (const candidate of entry.candidates.splice(0)) {
        await entry.pc.addIceCandidate(candidate);
        if (!this.current(entry)) return;
      }
      if (expected === 'offer') {
        const answer = await entry.pc.createAnswer();
        if (!this.current(entry)) return;
        await entry.pc.setLocalDescription(transportDescription(answer, ROUTE));
        if (!this.current(entry)) return;
        this.signal(entry, { description: entry.pc.localDescription });
      } else entry.awaitingAnswer = false;
    } else if (data.candidate !== undefined) {
      const candidate = data.candidate;
      if (typeof candidate?.candidate !== 'string' || candidate.candidate.length > 2048) throw new Error('connection.invalid');
      if (!transportCandidate(candidate, ROUTE)) return;
      if (entry.pc.remoteDescription) await entry.pc.addIceCandidate(candidate);
      else if (entry.candidates.length < 64) entry.candidates.push(candidate);
      else throw new Error('connection.invalid');
    }
  }

  current(entry) { return this.peers.get(entry.id) === entry && entry.revision === this.revision; }

  newPeer(id) {
    // Host candidates only: the devices reach each other on the network they
    // share, and a failed attempt never widens into some other route.
    const pc = new this.PeerConnection(peerConfiguration(ROUTE));
    const entry = { id, pc, revision: this.revision, queue: Promise.resolve(), queued: 0, candidates: [], timers: new Map(),
      approved: false, pending: false, admitted: false };
    this.peers.set(id, entry);
    this.deadline(entry, 'connect', TIMEOUT, () => this.peerFailed(entry));
    pc.addEventListener('icecandidate', (event) => {
      if (!this.current(entry) || !event.candidate) return;
      try {
        const candidate = event.candidate.toJSON();
        if (transportCandidate(candidate, ROUTE)) this.signal(entry, { candidate });
      } catch { this.peerFailed(entry); }
    });
    pc.addEventListener('datachannel', (event) => {
      const channel = event.channel;
      if (!this.current(entry)) { channel.close(); return; }
      if (this.role === 'guest' && !entry.dc && channel.label === CHANNEL) { this.channel(entry, channel); return; }
      // File lanes open only between admitted devices; sync.js decides which run one belongs to.
      if (entry.admitted && LANE_PATTERN.test(channel.label)) { this.onLane(channel); return; }
      channel.close();
      this.peerFailed(entry, 'connection.invalid');
    });
    pc.addEventListener('track', (event) => {
      event.track.stop();
      if (this.current(entry)) this.peerFailed(entry, 'connection.invalid');
    });
    pc.addEventListener('connectionstatechange', () => {
      if (!this.current(entry)) return;
      if (pc.connectionState === 'connected') this.clear(entry, 'disconnect');
      else if (pc.connectionState === 'disconnected') {
        this.deadline(entry, 'disconnect', 8000, () => this.peerFailed(entry, entry.admitted ? 'connection.lost' : undefined));
      } else if (['failed', 'closed'].includes(pc.connectionState)) this.peerFailed(entry, entry.admitted ? 'connection.lost' : undefined);
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
    const frame = data.description === undefined ? data : { ...data, description: transportDescription(data.description, ROUTE) };
    this.send({ protocol: PROTOCOL, ...frame }, this.role === 'host' ? entry.id : null);
  }

  async offer(entry) {
    const offer = await entry.pc.createOffer();
    if (!this.current(entry)) return;
    await entry.pc.setLocalDescription(transportDescription(offer, ROUTE));
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
    channel.addEventListener('close', () => { if (this.current(entry)) this.peerFailed(entry, entry.admitted ? 'connection.lost' : 'connection.ended'); });
    channel.addEventListener('error', () => { if (this.current(entry)) this.peerFailed(entry); });
    channel.addEventListener('message', (event) => {
      if (!this.current(entry)) return;
      // A received frame can arrive before the local open callback. Identify
      // this side before responding, and stop if sending that hello retires it.
      if (!greeting.open()) return;
      const message = controlMessage(event.data);
      if (!message) return this.peerFailed(entry, 'connection.invalid');
      if (!SESSION_TYPES.has(message.type)) {
        // Nothing about either folder is read before both sides have agreed.
        if (!entry.admitted) return this.peerFailed(entry, 'connection.invalid');
        this.onMessage(message);
        return;
      }
      try {
        if (message.type === 'hello') {
          if (!greeting.receive()) return;
          entry.hello = true;
          this.clear(entry, 'connect');
          if (this.role === 'guest') {
            const token = this.admissions.read(TOOL, this.code, ROUTE);
            this.control(entry, 'request', { note: this.note, ...(token ? { token } : {}) });
            this.state('guest.waiting');
          } else this.deadline(entry, 'request', TIMEOUT, () => this.peerFailed(entry));
        } else if (!entry.hello) this.peerFailed(entry, 'connection.invalid');
        else if (message.type === 'request' && this.role === 'host' && !entry.approved) {
          if (!entry.pending && !entry.refused) {
            this.clear(entry, 'request');
            entry.note = message.note;
            entry.pending = true;
            entry.admissionToken = message.token;
            if (this.grants.has(message.token)) {
              if (!this.approve(entry.id) && this.current(entry)) {
                this.control(entry, 'busy');
                this.removePeer(entry.id);
              }
            } else this.requests();
          }
        } else if (message.type === 'approved' && this.role === 'guest') {
          if (entry.approved) return;
          entry.approved = true;
          this.admissions.save(TOOL, this.code, ROUTE, message.token);
          this.control(entry, 'approval-ack');
          this.admit(entry);
        } else if (message.type === 'approval-ack' && this.role === 'host' && entry.approved) {
          if (entry.admitted) return;
          this.clear(entry, 'approval');
          this.admit(entry);
        } else if (message.type === 'denied' && this.role === 'guest') this.stop('guest.denied');
        else if (message.type === 'busy' && this.role === 'guest') this.stop('connection.busy');
        else if (message.type === 'ended' && this.role === 'guest') this.stop('connection.ended');
        else this.peerFailed(entry, 'connection.invalid');
      } catch { this.peerFailed(entry); }
    });
    if (channel.readyState === 'open') opened();
  }

  admit(entry) {
    entry.admitted = true;
    this.state(this.role === 'host' ? this.hostState() : 'guest.linked');
    this.partner();
    this.onLink({
      role: this.role,
      note: this.role === 'host' ? entry.note ?? '' : '',
      current: () => this.current(entry) && entry.admitted,
      send: (type, values) => {
        if (!this.current(entry) || !entry.admitted) return false;
        try { this.control(entry, type, values); return true; } catch { return false; }
      },
      lane: (label) => entry.pc.createDataChannel(label, { ordered: true }),
    });
  }

  approve(id) {
    const entry = this.peers.get(id);
    if (this.role !== 'host' || !entry?.pending || entry.approved || entry.refused || this.partnerCount) return false;
    const token = this.grants.issue(entry.admissionToken);
    if (!token) { this.state('approval.limit'); return false; }
    entry.pending = false;
    entry.approved = true;
    entry.admissionToken = token;
    try { this.control(entry, 'approved', { token }); } catch { this.peerFailed(entry); return false; }
    this.deadline(entry, 'approval', TIMEOUT, () => this.peerFailed(entry));
    this.requests(); this.partner(); this.state(this.hostState());
    return true;
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

  disconnectPartner(id) {
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
    if (this.role === 'guest') this.stop(key);
    else {
      this.removePeer(entry.id);
      if (key === 'connection.lost') this.state('host.lost');
    }
  }

  removePeer(id) {
    const entry = this.peers.get(id);
    if (!entry) return;
    this.peers.delete(id);
    const admitted = entry.admitted;
    entry.admitted = false;
    for (const timer of entry.timers.values()) clearTimeout(timer);
    entry.timers.clear();
    entry.dc?.close();
    entry.pc.close();
    if (admitted) this.onLink(null);
    this.requests(); this.partner();
    if (this.role === 'host') this.state(this.hostState());
  }

  stop(key = 'connection.stopped') {
    const role = this.role;
    this.grants.clear();
    // Retire asynchronous offers before closing anything that can emit events.
    this.revision += 1;
    if (role === 'host') for (const entry of this.peers.values()) { try { this.control(entry, 'ended'); } catch {} }
    this.role = null;
    this.code = null;
    this.discoverable = false;
    this.cancelOpen?.(); this.cancelOpen = null;
    this.discoveryGroup = null;
    const pairing = this.pairing;
    this.pairing = null; this.socket = null;
    for (const id of [...this.peers.keys()]) this.removePeer(id);
    pairing?.close();
    if (role === 'host') this.onDiscovery(null);
    if (role) this.onState(key, role);
  }
}
