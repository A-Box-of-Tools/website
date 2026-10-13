import { allowedCandidate, localDescription } from './shared/peer-network.js';

const POLL_MS = 1000;
const ATTEMPT_MS = 10000;
const MAX_PENDING_ICE = 128;
const uuid = () => {
  // LAN receivers can use HTTP; randomUUID is restricted to secure browser contexts.
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};
const realClock = {
  setTimeout: (callback, delay) => globalThis.setTimeout(callback, delay),
  clearTimeout: timer => globalThis.clearTimeout(timer),
  now: () => Date.now(),
};

export class BroadcastSession {
  constructor({ role, token, onState = () => {}, onStream = () => {},
    fetchImpl = globalThis.fetch.bind(globalThis),
    PeerConnection = globalThis.RTCPeerConnection,
    getUserMedia = options => navigator.mediaDevices.getUserMedia(options), clock = realClock }) {
    this.role = role;
    this.token = token;
    this.onState = onState;
    this.onStream = onStream;
    this._fetch = fetchImpl;
    this._PC = PeerConnection;
    this._getUserMedia = getUserMedia;
    this._clock = clock;
    this._epoch = 0;
    this._active = false;
    this._requests = new Set();
    this._peers = new Map();
    this._hostIds = new Set();
    this._orphanIce = [];
    this._stream = null;
    this._timer = null;
    this._generation = null;
    this._ack = 0;
    this._talking = false;
    this._hostOnline = false;
    this._remoteTalking = false;
    this._joined = false;
    this._renew = false;
    this._lostHost = false;
    this._attemptAt = 0;
    this._id = null;
  }

  async start() {
    this.stop({ notify: false, state: null });
    const epoch = ++this._epoch;
    this._active = true;
    this._ack = 0;
    this._joined = this._renew = this._lostHost = false;
    this._remoteTalking = false;
    this._hostOnline = false;
    this._attemptAt = 0;
    this._id = uuid();
    this._state(this.role === 'host' ? 'host-starting' : 'listener-connecting');
    try {
      const config = await this._request('/api/config', null, epoch);
      if (config.role !== this.role) throw { key: 'error-access' };
      this._generation = config.generation;
      if (this.role === 'listener' && config.ended) {
        this._finish('broadcast-ended');
        return false;
      }
      if (this.role === 'host') {
        let stream;
        try {
          stream = await this._getUserMedia({ audio: true, video: false });
        } catch {
          throw { key: 'error-microphone' };
        }
        // A permission prompt can outlive both a stop and another start.
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
        const result = await this._request('/api/host/start', {}, epoch);
        this._generation = result.generation;
        this._hostOnline = true;
        this._state('host-ready');
      }
      if (!this._live(epoch)) return false;
      void this._tick(epoch);
      return true;
    } catch (error) {
      if (this._live(epoch) && this.role === 'listener' && error.key !== 'error-access' &&
          !error.state?.ended) {
        this._state(error.key === 'error-full' ? 'error-full' : 'listener-reconnecting');
        void this._tick(epoch);
        return true;
      }
      if (this._live(epoch)) this._finish(error.state?.ended ?
        'broadcast-ended' : (error.key || 'error-connection'));
      return false;
    }
  }

  setTalking(talking) {
    if (!this._active || this.role !== 'host' || !this._stream) return;
    if (talking && !this._hostOnline) return;
    this._talking = Boolean(talking);
    for (const track of this._stream.getAudioTracks()) track.enabled = this._talking;
    this._state(this._talking ? 'host-talking' : 'host-ready');
  }

  stop({ notify = true,
    state = this.role === 'host' ? 'broadcast-ended' : 'listener-left' } = {}) {
    const wasActive = this._active;
    const body = this.role === 'host' ? { generation: this._generation } : { id: this._id };
    const path = this.role === 'host' ? '/api/host/end' : '/api/listener/leave';
    this._active = false;
    ++this._epoch;
    this._clock.clearTimeout(this._timer);
    this._timer = null;
    for (const controller of this._requests) controller.abort();
    this._requests.clear();
    for (const id of [...this._peers.keys()]) this._drop(id);
    this._hostIds.clear();
    this._orphanIce = [];
    if (this._stream) {
      for (const track of this._stream.getTracks()) {
        track.onended = null;
        track.stop();
      }
      this._stream = null;
    }
    this._talking = false;
    this._hostOnline = false;
    if (notify && wasActive) {
      // keepalive lets Leave and pagehide retire the channel without blocking navigation.
      void this._fetch(path, { method: 'POST', mode: 'same-origin', credentials: 'omit',
        redirect: 'error', cache: 'no-store', keepalive: true,
        headers: this._headers(), body: JSON.stringify(body) }).catch(() => {});
    }
    if (state) this._state(state);
  }

  _live(epoch) { return this._active && this._epoch === epoch; }
  _current(peer) {
    return this._live(peer.epoch) && this._peers.get(peer.id) === peer &&
      peer.generation === this._generation;
  }
  _headers() {
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${this.token}` };
  }
  _state(key) {
    this.onState(key, { talking: this.role === 'host' ? this._talking : this._remoteTalking,
      listeners: [...this._peers.values()].filter(p => p.pc.connectionState === 'connected').length });
  }
  _finish(key) { this.stop({ notify: false, state: key }); }

  async _request(path, body, epoch) {
    if (!this._live(epoch)) throw { key: 'cancelled' };
    const controller = new AbortController();
    this._requests.add(controller);
    const timeout = this._clock.setTimeout(() => controller.abort(), ATTEMPT_MS);
    try {
      const response = await this._fetch(path, { method: body === null ? 'GET' : 'POST',
        mode: 'same-origin', credentials: 'omit', redirect: 'error', cache: 'no-store',
        headers: this._headers(), signal: controller.signal,
        ...(body === null ? {} : { body: JSON.stringify(body) }) });
      const result = await response.json();
      if (!this._live(epoch)) throw { key: 'cancelled' };
      if (!response.ok) {
        const key = result.error === 'full' ? 'error-full' :
          result.error === 'unauthorized' ? 'error-access' : 'error-connection';
        throw { key, code: result.error, state: result };
      }
      return result;
    } finally {
      this._clock.clearTimeout(timeout);
      this._requests.delete(controller);
    }
  }

  async _tick(epoch) {
    const began = this._clock.now();
    try {
      if (this.role === 'host') await this._hostTick(epoch);
      else await this._listenerTick(epoch);
    } catch (error) {
      if (!this._live(epoch)) return;
      if (error.key === 'error-access') {
        this._finish(error.key);
        return;
      }
      if (error.state?.ended) {
        this._finish('broadcast-ended');
        return;
      }
      if (error.key === 'error-full') {
        if (this.role === 'listener') this._state('error-full');
        else this._finish('error-full');
        return;
      }
      if (this.role === 'host' && error.state?.generation !== undefined &&
          error.state.generation !== this._generation) {
        this._finish('broadcast-ended');
        return;
      }
      if (this.role === 'listener' && (error.code === 'invalid' || error.code === 'unknown' ||
          error.code === 'stale' ||
          (error.state?.generation !== undefined && error.state.generation !== this._generation))) {
        this._renew = true;
      }
      if (this.role === 'host') {
        this._hostOnline = false;
        this.setTalking(false);
      }
      this._state(this.role === 'host' ? 'host-reconnecting' : 'listener-reconnecting');
    } finally {
      // Scheduling after completion makes even a slow or failed request non-overlapping.
      if (this._live(epoch)) {
        this._timer = this._clock.setTimeout(() => void this._tick(epoch),
          Math.max(0, POLL_MS - (this._clock.now() - began)));
      }
    }
  }

  async _hostTick(epoch) {
    const result = await this._request('/api/host/poll', {
      generation: this._generation, ack: this._ack, talking: this._talking }, epoch);
    if (result.ended || result.generation !== this._generation) {
      this._finish('broadcast-ended');
      return;
    }
    this._hostOnline = Boolean(result.online);
    if (!this._hostOnline) {
      this.setTalking(false);
      this._state('host-reconnecting');
      return;
    }
    this._hostIds = new Set(result.listeners || []);
    for (const id of [...this._peers.keys()]) {
      if (!this._hostIds.has(id)) this._drop(id);
    }
    for (const id of this._hostIds) {
      // Offer creation must not hold up the heartbeat when several receivers join together.
      if (!this._peers.has(id)) void this._offer(id, epoch);
    }
    for (const message of result.messages || result.signals || []) {
      try { await this._receiveHost(message.id, message.payload); }
      catch { this._failPeer(this._peers.get(message.id)); }
      this._ack = Math.max(this._ack, Number(message.seq) || 0);
    }
    if (this._live(epoch)) this._state(this._talking ? 'host-talking' : 'host-ready');
  }

  async _join(epoch) {
    const result = await this._request('/api/listener/join', { id: this._id }, epoch);
    this._joined = true;
    this._attemptAt = this._clock.now();
    if (result.generation !== undefined) this._generation = result.generation;
    if (result.ended) this._finish('broadcast-ended');
  }

  async _renewListener(epoch) {
    const oldId = this._id;
    this._drop(oldId);
    this._id = uuid();
    this._ack = 0;
    this._orphanIce = [];
    this._joined = this._renew = false;
    try { await this._request('/api/listener/leave', { id: oldId }, epoch); }
    catch (error) { if (!this._live(epoch)) throw error; }
    await this._join(epoch);
  }

  async _listenerTick(epoch) {
    if (this._renew) await this._renewListener(epoch);
    if (!this._joined) await this._join(epoch);
    if (!this._live(epoch)) return;
    const result = await this._request('/api/listener/poll', {
      id: this._id, ack: this._ack, generation: this._generation }, epoch);
    if (result.ended) { this._finish('broadcast-ended'); return; }
    if (!result.online) {
      this._drop(this._id);
      this._lostHost = true;
      this._state('listener-reconnecting');
      return;
    }
    if (result.generation !== this._generation || this._lostHost) {
      this._generation = result.generation;
      this._lostHost = false;
      this._state('listener-reconnecting');
      await this._renewListener(epoch);
      return;
    }
    this._remoteTalking = Boolean(result.talking);
    for (const message of result.messages || result.signals || []) {
      try { await this._receiveListener(message.payload, epoch); }
      catch { this._failPeer(this._peers.get(this._id)); this._renew = true; }
      this._ack = Math.max(this._ack, Number(message.seq) || 0);
    }
    const peer = this._peers.get(this._id);
    if (!peer && this._clock.now() - this._attemptAt >= ATTEMPT_MS) this._renew = true;
    if (!this._live(epoch)) return;
    this._state(peer?.pc.connectionState === 'connected' ?
      (this._remoteTalking ? 'listener-talking' : 'listener-listening') : 'listener-reconnecting');
  }

  _peer(id, connection, epoch) {
    const pc = new this._PC({ iceServers: [], iceTransportPolicy: 'all' });
    const peer = { id, connection, pc, epoch, generation: this._generation,
      ice: [], timer: null };
    this._peers.set(id, peer);
    const deadline = () => {
      this._clock.clearTimeout(peer.timer);
      peer.timer = this._clock.setTimeout(() => {
        if (this._current(peer) && pc.connectionState !== 'connected') this._failPeer(peer);
      }, ATTEMPT_MS);
    };
    deadline();
    pc.onicecandidate = event => {
      if (!this._current(peer) || !allowedCandidate(event.candidate, true)) return;
      const candidate = event.candidate?.toJSON() || null;
      void this._signal(peer, { type: 'candidate', candidate }).catch(() => this._failPeer(peer));
    };
    pc.onconnectionstatechange = () => {
      if (!this._current(peer)) return;
      if (pc.connectionState === 'connected') {
        this._clock.clearTimeout(peer.timer);
        peer.timer = null;
        this._state(this.role === 'host' ? (this._talking ? 'host-talking' : 'host-ready') :
          (this._remoteTalking ? 'listener-talking' : 'listener-listening'));
      } else if (pc.connectionState === 'failed') this._failPeer(peer);
      else if (pc.connectionState === 'disconnected' && !peer.timer) deadline();
    };
    if (this.role === 'listener') {
      pc.ontrack = event => {
        if (this._current(peer) && event.track.kind === 'audio') {
          this.onStream(event.streams[0] || new MediaStream([event.track]));
        }
      };
    }
    return peer;
  }

  async _offer(id, epoch) {
    let peer;
    try {
      peer = this._peer(id, uuid(), epoch);
      for (const track of this._stream.getAudioTracks()) peer.pc.addTrack(track, this._stream);
      for (const transceiver of peer.pc.getTransceivers()) transceiver.direction = 'sendonly';
      const offer = await peer.pc.createOffer();
      if (!this._current(peer)) return;
      await peer.pc.setLocalDescription(offer);
      if (!this._current(peer)) return;
      await this._signal(peer, localDescription(peer.pc.localDescription));
    } catch { this._failPeer(peer); }
  }

  async _signal(peer, payload) {
    if (!this._current(peer)) return;
    await this._request('/api/signal', { id: peer.id, generation: peer.generation,
      payload: { ...payload, connection: peer.connection } }, peer.epoch);
  }

  async _receiveHost(id, payload) {
    const peer = this._peers.get(id);
    if (!peer || !payload || payload.connection !== peer.connection || !this._current(peer)) return;
    if (payload.type === 'answer' && !peer.pc.remoteDescription) {
      await peer.pc.setRemoteDescription(localDescription({ type: 'answer', sdp: payload.sdp }));
      await this._flushIce(peer);
    } else if (payload.type === 'candidate') await this._candidate(peer, payload.candidate);
  }

  async _receiveListener(payload, epoch) {
    if (!payload) return;
    let peer = this._peers.get(this._id);
    if (payload.type === 'offer') {
      if (peer?.connection === payload.connection) return;
      this._drop(this._id);
      peer = this._peer(this._id, payload.connection, epoch);
      peer.ice = this._orphanIce.filter(item => item.connection === payload.connection)
        .map(item => item.candidate);
      this._orphanIce = [];
      await peer.pc.setRemoteDescription(localDescription({ type: 'offer', sdp: payload.sdp }));
      if (!this._current(peer)) return;
      await this._flushIce(peer);
      const answer = await peer.pc.createAnswer();
      if (!this._current(peer)) return;
      await peer.pc.setLocalDescription(answer);
      if (this._current(peer)) await this._signal(peer, localDescription(peer.pc.localDescription));
    } else if (payload.type === 'candidate' && allowedCandidate(payload.candidate, true)) {
      if (peer?.connection === payload.connection) await this._candidate(peer, payload.candidate);
      else if (this._orphanIce.length < MAX_PENDING_ICE) this._orphanIce.push(payload);
    }
  }

  async _candidate(peer, candidate) {
    if (!this._current(peer) || !allowedCandidate(candidate, true)) return;
    if (!peer.pc.remoteDescription) {
      if (peer.ice.length < MAX_PENDING_ICE) peer.ice.push(candidate);
    } else {
      // Browsers can retire a candidate while a reconnect is already replacing its peer.
      try { await peer.pc.addIceCandidate(candidate); } catch {}
    }
  }

  async _flushIce(peer) {
    const candidates = peer.ice.splice(0);
    for (const candidate of candidates) {
      if (!this._current(peer)) return;
      await this._candidate(peer, candidate);
    }
  }

  _failPeer(peer) {
    if (!peer || !this._current(peer)) return;
    this._drop(peer.id);
    if (this.role === 'listener') {
      this._renew = true;
      this._state('listener-reconnecting');
    }
  }

  _drop(id) {
    const peer = this._peers.get(id);
    if (!peer) return;
    this._peers.delete(id);
    this._clock.clearTimeout(peer.timer);
    peer.pc.onicecandidate = peer.pc.onconnectionstatechange = peer.pc.ontrack = null;
    peer.pc.close();
    peer.ice = [];
    if (this.role === 'listener') this.onStream(null);
  }
}
