import { allowedCandidate, localDescription } from './shared/peer-network.js';

const INTERVAL = 1000;
const DEADLINE = 10000;
const KEEPALIVE = 30000;
const MAX_ICE = 128;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const realClock = { now: () => Date.now(),
  setTimeout: (fn, delay) => globalThis.setTimeout(fn, delay),
  clearTimeout: timer => globalThis.clearTimeout(timer) };
const uuid = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

export class BroadcastSession {
  constructor({ role, code, key, listenKey, onState = () => {}, onStream = () => {},
    Socket = globalThis.WebSocket, Peer = globalThis.RTCPeerConnection,
    mediaDevices = globalThis.navigator?.mediaDevices, clock = realClock,
    origin = 'wss://rendezvous.abox.tools', endpoint }) {
    this.role = role;
    this.code = code;
    this.key = key;
    this.listenKey = listenKey;
    this.onState = onState;
    this.onStream = onStream;
    this._Socket = Socket;
    this._Peer = Peer;
    this._mediaDevices = mediaDevices;
    this._clock = clock;
    const url = new URL(endpoint || origin);
    url.pathname = `/broadcast/${code}`;
    url.search = url.hash = '';
    this._endpoint = url.href;
    this._active = false;
    this._epoch = 0;
    this._socket = null;
    this._tickTimer = this._retryTimer = null;
    this._failures = 0;
    this._generation = this._id = null;
    this._waiting = true;
    this._offerAt = 0;
    this._talking = this._remoteTalking = false;
    this._stream = this._activePeer = null;
    this._peers = new Map();
    this._hostIds = new Set();
    this._orphanIce = [];
    this._resolveStart = null;
  }

  async start() {
    this.stop({ notify: false, state: null });
    const epoch = ++this._epoch;
    this._active = true;
    this._failures = 0;
    this._waiting = true;
    this._state(this.role === 'host' ? 'host-starting' : 'listener-connecting');
    if (!/^[0-9a-f]{64}$/.test(this.code || '') || !/^[A-Za-z0-9_-]{43}$/.test(this.key || '') ||
        !['host', 'listener'].includes(this.role) ||
        (this.role === 'host' && !/^[A-Za-z0-9_-]{43}$/.test(this.listenKey || ''))) {
      this._finish('error-access');
      return false;
    }
    if (this.role === 'host') {
      let stream;
      try { stream = await this._mediaDevices.getUserMedia({ audio: true, video: false }); }
      catch {
        if (this._live(epoch)) this._finish('error-microphone');
        return false;
      }
      // An old permission prompt must not resurrect a stopped or replaced session.
      if (!this._live(epoch)) {
        stream.getTracks().forEach(track => track.stop());
        return false;
      }
      this._stream = stream;
      for (const track of stream.getTracks()) {
        track.enabled = false;
        track.onended = () => {
          if (this._live(epoch)) this.stop({ notify: false, state: 'error-microphone' });
        };
      }
    }
    if (!this._live(epoch)) return false;
    const started = new Promise(resolve => { this._resolveStart = resolve; });
    this._connect(epoch);
    this._scheduleTick(epoch);
    const result = await started;
    return result && this._live(epoch);
  }

  setTalking(talking) {
    if (!this._active || this.role !== 'host' || !this._stream) return;
    // Direct audio can remain useful while the introduction socket reconnects.
    if (talking && !this._canSignal() && !this._connected().length) return;
    this._talking = Boolean(talking);
    for (const track of this._stream.getAudioTracks()) track.enabled = this._talking;
    if (this._canSignal()) this._send({ type: 'status', generation: this._generation,
      talking: this._talking });
    this._voiceState();
  }

  stop({ notify = true,
    state = this.role === 'host' ? 'broadcast-ended' : 'listener-left' } = {}) {
    if (notify && this._active && this._socket?.auth) {
      this._send(this.role === 'host' ? { type: 'end', generation: this._generation } : { type: 'leave' });
    }
    this._active = false;
    ++this._epoch;
    this._clock.clearTimeout(this._tickTimer);
    this._clock.clearTimeout(this._retryTimer);
    this._tickTimer = this._retryTimer = null;
    this._closeSocket(this._socket);
    this._socket = null;
    for (const id of [...this._peers.keys()]) this._drop(id);
    this._hostIds.clear();
    this._orphanIce = [];
    if (this._stream) {
      for (const track of this._stream.getTracks()) {
        track.onended = null;
        track.enabled = false;
        track.stop();
      }
      this._stream = null;
    }
    this._generation = this._id = null;
    this._talking = this._remoteTalking = false;
    this._waiting = true;
    this._settleStart(false);
    if (state) this._state(state);
  }

  _live(epoch) { return this._active && epoch === this._epoch; }
  _currentSocket(ctx) { return this._live(ctx.epoch) && this._socket === ctx && !ctx.closed; }
  _current(peer) {
    return this._live(peer.epoch) && this._peers.get(peer.id) === peer && peer.generation === this._generation;
  }
  _connected() { return [...this._peers.values()].filter(peer => peer.pc.connectionState === 'connected'); }
  _canSignal() { return Boolean(this._socket?.auth && !this._waiting && this._socket.ws.readyState === 1); }
  _state(key) {
    this.onState(key, { talking: this.role === 'host' ? this._talking : this._remoteTalking,
      listeners: this.role === 'host' ? this._connected().filter(p => !p.departed).length : 0,
      signaling: this._canSignal(), waiting: this._waiting, directReady: this._connected().length > 0 });
  }
  _voiceState() {
    if (!this._active) return;
    if (this.role === 'listener' && this._waiting) {
      this._state('listener-reconnecting');
      return;
    }
    const usable = this.role === 'host' ? this._canSignal() || this._connected().length : this._connected().length;
    this._state(usable ? (this.role === 'host' ?
      (this._talking ? 'host-talking' : 'host-ready') :
      (this._remoteTalking ? 'listener-talking' : 'listener-listening')) :
      (this.role === 'host' ? 'host-reconnecting' : 'listener-reconnecting'));
  }
  _settleStart(value) {
    const resolve = this._resolveStart;
    this._resolveStart = null;
    if (resolve) resolve(value);
  }
  _finish(key) { this.stop({ notify: false, state: key }); }

  _connect(epoch) {
    if (!this._live(epoch) || this._socket) return;
    let ws;
    try { ws = new this._Socket(this._endpoint); }
    catch { this._voiceState(); this._retry(epoch, 1006); return; }
    const ctx = { ws, epoch, auth: false, closed: false, pending: 0, chain: Promise.resolve(),
      timer: null, pongTimer: null, lastPing: 0 };
    this._socket = ctx;
    ctx.timer = this._clock.setTimeout(() => this._lost(ctx, 1006), DEADLINE);
    ws.onopen = () => {
      if (!this._currentSocket(ctx)) return;
      this._send({ type: 'auth', role: this.role, key: this.key,
        ...(this.role === 'host' ? { listenKey: this.listenKey } : {}) });
      if (this.role === 'listener') this._settleStart(true);
    };
    ws.onmessage = event => {
      if (!this._currentSocket(ctx)) return;
      if (event.data === 'pong') {
        this._clock.clearTimeout(ctx.pongTimer);
        ctx.pongTimer = null;
        return;
      }
      if (typeof event.data !== 'string' || event.data.length > 65536 || ctx.pending >= 256) {
        this._lost(ctx, 1006);
        return;
      }
      let frame;
      try { frame = JSON.parse(event.data); } catch { this._lost(ctx, 1006); return; }
      ctx.pending++;
      ctx.chain = ctx.chain.then(async () => {
        if (this._currentSocket(ctx)) await this._message(frame, ctx);
      }).catch(() => {
        if (this._currentSocket(ctx)) this._lost(ctx, 1006);
      }).finally(() => { ctx.pending--; });
    };
    ws.onclose = event => this._lost(ctx, event.code);
    // Browsers hide an HTTP429 upgrade response behind a generic socket failure.
    ws.onerror = () => this._lost(ctx, 1006);
  }

  _closeSocket(ctx) {
    if (!ctx) return;
    ctx.closed = true;
    this._clock.clearTimeout(ctx.timer);
    this._clock.clearTimeout(ctx.pongTimer);
    ctx.timer = ctx.pongTimer = null;
    ctx.ws.onopen = ctx.ws.onmessage = ctx.ws.onclose = ctx.ws.onerror = null;
    try { ctx.ws.close(1000); } catch {}
  }
  _lost(ctx, code) {
    if (!this._currentSocket(ctx)) return;
    this._closeSocket(ctx);
    this._socket = null;
    if ([4400, 4403, 4409].includes(code)) {
      this._finish(code === 4400 ? 'error-connection' : 'error-access');
      return;
    }
    if (this.role === 'host' && !this._connected().length) this.setTalking(false);
    this._waiting = true;
    this._voiceState();
    if (code === 4429) this._state('error-full');
    this._retry(ctx.epoch, code);
  }
  _retry(epoch, code) {
    if (!this._live(epoch) || this._retryTimer !== null) return;
    const failures = this._failures++;
    const delay = Math.min(30000, (code === 4429 ? 3000 : INTERVAL) * 2 ** Math.min(failures, 5));
    this._retryTimer = this._clock.setTimeout(() => {
      this._retryTimer = null;
      this._connect(epoch);
    }, delay);
  }
  _send(frame) {
    const ctx = this._socket;
    if (!ctx || !this._currentSocket(ctx) || ctx.ws.readyState !== 1 || ctx.ws.bufferedAmount > 65536) return false;
    try { ctx.ws.send(typeof frame === 'string' ? frame : JSON.stringify(frame)); return true; }
    catch { this._lost(ctx, 1006); return false; }
  }
  _authenticated(ctx) {
    if (!ctx.auth) ctx.lastPing = this._clock.now();
    ctx.auth = true;
    this._failures = 0;
    this._clock.clearTimeout(ctx.timer);
    ctx.timer = null;
  }

  async _message(frame, ctx) {
    if (!frame || typeof frame !== 'object') return;
    if (frame.type === 'ended') { this._finish('broadcast-ended'); return; }
    if (frame.type === 'replaced') { this._finish('error-access'); return; }
    if (frame.type === 'error') {
      if (['full', 'busy'].includes(frame.error)) this._lost(ctx, 4429);
      else if (frame.error === 'timeout') this._lost(ctx, 1006);
      else if (frame.error === 'stale' && this.role === 'listener') this._send({ type: 'check' });
      else if (frame.error === 'stale' || frame.error === 'unauthorized') this._finish('error-access');
      return;
    }
    if (frame.type === 'host-ready' && this.role === 'host' && UUID.test(frame.generation || '')) {
      if (frame.generation !== this._generation) this._generationChange(frame.generation);
      this._authenticated(ctx);
      this._waiting = false;
      this._send({ type: 'status', generation: this._generation, talking: this._talking });
      this._settleStart(true);
      this._voiceState();
      return;
    }
    if (this.role === 'listener' && frame.type === 'waiting') {
      this._authenticated(ctx);
      this._waiting = true;
      this._voiceState();
      return;
    }
    if (this.role === 'listener' && frame.type === 'ready' && UUID.test(frame.id || '') && UUID.test(frame.generation || '')) {
      if (this._generation !== frame.generation) {
        this._generationChange(frame.generation);
        this._offerAt = this._clock.now();
      }
      if (this._id !== frame.id) {
        for (const peer of [...this._peers.values()]) {
          if (peer.pc.connectionState !== 'connected') this._drop(peer.id);
          else peer.outgoing = [];
        }
        this._orphanIce = [];
        this._offerAt = this._clock.now();
      }
      this._id = frame.id;
      this._remoteTalking = Boolean(frame.talking);
      this._authenticated(ctx);
      this._waiting = false;
      const peer = this._peers.get(this._id);
      if (peer) this._flushOutgoing(peer);
      this._voiceState();
      return;
    }
    if (!ctx.auth || frame.generation !== this._generation) return;
    if (this.role === 'host') {
      if (frame.type === 'join' && UUID.test(frame.id || '')) {
        if (!this._hostIds.has(frame.id) && this._hostIds.size >= 10) return;
        this._hostIds.add(frame.id);
        if (!this._peers.has(frame.id)) void this._offer(frame.id, ctx.epoch);
      } else if (frame.type === 'leave') this._depart(frame.id);
      else if (['answer', 'candidate'].includes(frame.type)) {
        try { await this._receiveHost(frame); } catch { this._failPeer(this._peers.get(frame.from)); }
      }
    } else if (frame.type === 'status') {
      this._remoteTalking = Boolean(frame.talking);
      this._voiceState();
    } else if (frame.from === 'host' && frame.to === this._id && ['offer', 'candidate'].includes(frame.type)) {
      try { await this._receiveListener(frame, ctx.epoch); }
      catch { this._failPeer(this._peers.get(this._id)); }
    }
  }

  _generationChange(generation) {
    for (const id of [...this._peers.keys()]) this._drop(id);
    this._hostIds.clear();
    this._orphanIce = [];
    this._generation = generation;
  }
  _scheduleTick(epoch) {
    if (!this._live(epoch)) return;
    this._tickTimer = this._clock.setTimeout(() => {
      this._tickTimer = null;
      if (!this._live(epoch)) return;
      const ctx = this._socket;
      if (ctx?.auth && ctx.pongTimer === null && this._clock.now() - ctx.lastPing >= KEEPALIVE) {
        ctx.lastPing = this._clock.now();
        ctx.pongTimer = this._clock.setTimeout(() => this._lost(ctx, 1006), DEADLINE);
        this._send('ping');
      }
      if (this._canSignal()) {
        for (const peer of this._peers.values()) this._flushOutgoing(peer);
      }
      if (this.role === 'listener' && this._socket?.auth) {
        if (this._waiting) this._send({ type: 'check' });
        else if (!this._peers.has(this._id) && this._clock.now() - this._offerAt >= DEADLINE) this._lost(this._socket, 1000);
      } else if (this.role === 'host') {
        if (this._canSignal()) {
          for (const id of this._hostIds) if (!this._peers.has(id)) void this._offer(id, epoch);
        } else if (!this._connected().length && this._talking) this.setTalking(false);
      }
      this._scheduleTick(epoch);
    }, INTERVAL);
  }

  _peer(id, connection, epoch) {
    const pc = new this._Peer({ iceServers: [], iceTransportPolicy: 'all' });
    const peer = { id, connection, pc, epoch, generation: this._generation, ice: [], outgoing: [],
      timer: null, departed: false, stream: null };
    this._peers.set(id, peer);
    const deadline = () => {
      this._clock.clearTimeout(peer.timer);
      peer.timer = this._clock.setTimeout(() => {
        if (this._current(peer) && pc.connectionState !== 'connected') this._failPeer(peer);
      }, DEADLINE);
    };
    deadline();
    pc.onicecandidate = event => {
      if (!this._current(peer) || !allowedCandidate(event.candidate, true)) return;
      this._signal(peer, { type: 'candidate', candidate: event.candidate?.toJSON() || null });
    };
    pc.onconnectionstatechange = () => {
      if (!this._current(peer)) return;
      if (pc.connectionState === 'connected') {
        if (!peer.departed) { this._clock.clearTimeout(peer.timer); peer.timer = null; }
        if (this.role === 'listener') this._activate(peer);
        this._voiceState();
      } else if (pc.connectionState === 'failed') this._failPeer(peer);
      else if (pc.connectionState === 'disconnected' && !peer.timer) deadline();
    };
    if (this.role === 'listener') pc.ontrack = event => {
      if (!this._current(peer) || event.track.kind !== 'audio') return;
      peer.stream = event.streams[0] || new MediaStream([event.track]);
      if (pc.connectionState === 'connected') this._activate(peer);
    };
    return peer;
  }
  async _offer(id, epoch) {
    if (!this._live(epoch) || !this._canSignal() || !this._hostIds.has(id)) return;
    if (this._peers.size >= 10) {
      const departed = [...this._peers.values()].find(peer => peer.departed);
      if (!departed) return;
      this._drop(departed.id);
    }
    let peer;
    try {
      peer = this._peer(id, uuid(), epoch);
      for (const track of this._stream.getAudioTracks()) peer.pc.addTrack(track, this._stream);
      for (const transceiver of peer.pc.getTransceivers()) transceiver.direction = 'sendonly';
      const offer = await peer.pc.createOffer();
      if (!this._current(peer)) return;
      await peer.pc.setLocalDescription(offer);
      if (this._current(peer)) this._signal(peer, localDescription(peer.pc.localDescription));
    } catch { this._failPeer(peer); }
  }
  _signal(peer, data) {
    if (!this._current(peer) || (this.role === 'listener' && peer.id !== this._id)) return;
    const frame = { ...data, generation: peer.generation, connection: peer.connection,
      ...(this.role === 'host' ? { to: peer.id } : {}) };
    if (peer.outgoing.length || !this._canSignal() || !this._send(frame)) {
      if (this._current(peer) && peer.outgoing.length < MAX_ICE) peer.outgoing.push(frame);
    }
  }
  _flushOutgoing(peer) {
    if (!this._current(peer) || !this._canSignal() ||
        (this.role === 'listener' && peer.id !== this._id)) return;
    let sent = 0;
    while (sent < peer.outgoing.length && this._canSignal()) {
      if (!this._send(peer.outgoing[sent])) break;
      sent++;
    }
    peer.outgoing.splice(0, sent);
  }
  async _receiveHost(frame) {
    const peer = this._peers.get(frame.from);
    if (!peer || frame.to !== 'host' || frame.connection !== peer.connection || !this._current(peer)) return;
    if (frame.type === 'answer' && !peer.pc.remoteDescription) {
      await peer.pc.setRemoteDescription(localDescription({ type: 'answer', sdp: frame.sdp }));
      await this._flushIce(peer);
    } else if (frame.type === 'candidate') await this._candidate(peer, frame.candidate);
  }
  async _receiveListener(frame, epoch) {
    if (!UUID.test(frame.connection || '')) return;
    let peer = this._peers.get(this._id);
    if (frame.type === 'offer') {
      if (peer?.connection === frame.connection) return;
      // Only one replacement may negotiate alongside the currently audible peer.
      for (const other of [...this._peers.values()]) if (other !== this._activePeer) this._drop(other.id);
      if (peer?.id === this._id) this._drop(peer.id);
      peer = this._peer(this._id, frame.connection, epoch);
      peer.ice = this._orphanIce.filter(item => item.connection === frame.connection).map(item => item.candidate);
      this._orphanIce = [];
      await peer.pc.setRemoteDescription(localDescription({ type: 'offer', sdp: frame.sdp }));
      if (!this._current(peer)) return;
      for (const transceiver of peer.pc.getTransceivers()) transceiver.direction = 'recvonly';
      await this._flushIce(peer);
      const answer = await peer.pc.createAnswer();
      if (!this._current(peer)) return;
      await peer.pc.setLocalDescription(answer);
      if (this._current(peer)) this._signal(peer, localDescription(peer.pc.localDescription));
    } else if (allowedCandidate(frame.candidate, true)) {
      if (peer?.connection === frame.connection) await this._candidate(peer, frame.candidate);
      else if (this._orphanIce.length < MAX_ICE) this._orphanIce.push(frame);
    }
  }
  async _candidate(peer, candidate) {
    if (!this._current(peer) || !allowedCandidate(candidate, true)) return;
    if (!peer.pc.remoteDescription) {
      if (peer.ice.length < MAX_ICE) peer.ice.push(candidate);
    } else {
      try { await peer.pc.addIceCandidate(candidate); } catch {}
    }
  }
  async _flushIce(peer) {
    for (const candidate of peer.ice.splice(0)) {
      if (!this._current(peer)) return;
      await this._candidate(peer, candidate);
    }
  }
  _activate(peer) {
    if (!this._current(peer) || !peer.stream) return;
    this._activePeer = peer;
    this.onStream(peer.stream);
    for (const other of [...this._peers.values()]) if (other !== peer) this._drop(other.id);
  }
  _depart(id) {
    this._hostIds.delete(id);
    const peer = this._peers.get(id);
    if (!peer) return;
    peer.departed = true;
    if (peer.pc.connectionState !== 'connected') this._drop(id);
    else {
      // A signaling outage should not cut a direct connection that is still carrying audio.
      this._clock.clearTimeout(peer.timer);
      peer.timer = this._clock.setTimeout(() => {
        if (this._current(peer)) this._drop(id);
        this._voiceState();
      }, DEADLINE);
    }
    this._voiceState();
  }
  _failPeer(peer) {
    if (!peer || !this._current(peer)) return;
    this._drop(peer.id);
    if (this.role === 'listener' && peer.id === this._id && this._socket) this._lost(this._socket, 1000);
    this._voiceState();
  }
  _drop(id) {
    const peer = this._peers.get(id);
    if (!peer) return;
    this._peers.delete(id);
    this._clock.clearTimeout(peer.timer);
    peer.pc.onicecandidate = peer.pc.onconnectionstatechange = peer.pc.ontrack = null;
    peer.pc.close();
    peer.ice = peer.outgoing = [];
    if (this._activePeer === peer) { this._activePeer = null; this.onStream(null); }
  }
}
