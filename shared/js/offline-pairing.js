import { localDescription } from './peer-network.js';

export const OFFLINE_LIFETIME = 10 * 60 * 1000;
const LIMIT = 65536;
const GATHER_TIMEOUT = 20000;

function format(tool) {
  if (typeof tool !== 'string' || !/^[a-z][a-z0-9-]{0,63}$/.test(tool)) throw new TypeError('offline.tool');
  return `${tool}-offline-v1`;
}

export function newOfflinePairing(random = globalThis.crypto, now = Date.now()) {
  const bytes = random.getRandomValues(new Uint8Array(16));
  return { session: Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(''), expires: now + OFFLINE_LIFETIME };
}

export function offlineBlock(tool, pairing, description) {
  const text = JSON.stringify({ format: format(tool), type: description.type, session: pairing.session,
    expires: pairing.expires, description: localDescription(description) });
  readOfflineBlock(tool, text, description.type, { checkExpiry: false });
  return text;
}

export function readOfflineBlock(tool, text, type, { now = Date.now(), pairing = null, checkExpiry = true } = {}) {
  const invalid = () => new Error(type === 'offer' ? 'offline.invalid-offer' : 'offline.invalid-answer');
  if (!['offer', 'answer'].includes(type) || typeof text !== 'string' || text.length > LIMIT) throw invalid();
  let value;
  try { value = JSON.parse(text); } catch { throw invalid(); }
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length !== 5
      || value.format !== format(tool) || value.type !== type || !/^[a-f0-9]{32}$/.test(value.session)
      || !Number.isSafeInteger(value.expires) || value.expires <= 0
      || (checkExpiry && value.expires > now + OFFLINE_LIFETIME + 60000)
      || value.description?.type !== type || typeof value.description.sdp !== 'string'
      || value.description.sdp.length > 60000 || !value.description.sdp.startsWith('v=0')
      || !/^m=application\s/m.test(value.description.sdp) || /^m=(?:audio|video)\s/m.test(value.description.sdp)
      || (pairing && (value.session !== pairing.session || value.expires !== pairing.expires))) throw invalid();
  if (checkExpiry && value.expires <= now) throw new Error('offline.expired');
  return { session: value.session, expires: value.expires, description: localDescription(value.description) };
}

// The adapter owns its peer, data channel, consent and media. This helper owns
// only a bounded, tool-specific introduction, so ending it cannot close a
// different viewer or turn an old reply into a new session's authority.
export class OfflineExchange {
  constructor({ tool, pc, current = () => true, now = () => Date.now(), random = globalThis.crypto,
    onExpire = () => {}, clock = globalThis } = {}) {
    format(tool);
    Object.assign(this, { tool, pc, current, now, random, onExpire, clock });
    this.pairing = null;
    this.closed = false;
    this.started = false;
    this.answered = false;
    this.established = false;
    this.expiryTimer = null;
    this.cancelGather = null;
  }

  check() {
    if (this.closed || !this.current()) throw new Error('connection.stopped');
    if (!this.established && this.pairing && (this.pairing.deadline ?? this.pairing.expires) <= this.now()) throw new Error('offline.expired');
  }

  begin(pairing) {
    this.check();
    if (this.started) throw new Error('connection.stopped');
    this.started = true;
    this.pairing = pairing;
    const deadline = pairing.deadline ?? pairing.expires;
    this.expiryTimer = this.clock.setTimeout(() => {
      if (this.closed || this.established || !this.current()) return;
      this.close();
      this.onExpire('offline.expired');
    }, Math.max(0, deadline - this.now()));
  }

  async createOffer() {
    this.begin(newOfflinePairing(this.random, this.now()));
    const offer = await this.pc.createOffer();
    this.check();
    await this.pc.setLocalDescription(localDescription(offer));
    this.check();
    await this.gather();
    this.check();
    return offlineBlock(this.tool, this.pairing, this.pc.localDescription);
  }

  async createAnswer(text) {
    // Only the host compares its timestamp with its own clock. The recipient
    // gets a fresh bounded wait, allowing devices with different wall clocks.
    const offer = readOfflineBlock(this.tool, text, 'offer', { checkExpiry: false });
    this.begin({ session: offer.session, expires: offer.expires, deadline: this.now() + OFFLINE_LIFETIME });
    await this.pc.setRemoteDescription(offer.description);
    this.check();
    const answer = await this.pc.createAnswer();
    this.check();
    await this.pc.setLocalDescription(localDescription(answer));
    this.check();
    await this.gather();
    this.check();
    return offlineBlock(this.tool, this.pairing, this.pc.localDescription);
  }

  async acceptAnswer(text) {
    this.check();
    if (!this.pairing || this.pairing.deadline || this.answered) throw new Error('offline.invalid-answer');
    const answer = readOfflineBlock(this.tool, text, 'answer', { now: this.now(), pairing: this.pairing });
    this.answered = true;
    await this.pc.setRemoteDescription(answer.description);
    this.check();
  }

  gather() {
    this.check();
    if (this.pc.iceGatheringState === 'complete') return Promise.resolve();
    return new Promise((resolve, reject) => {
      let finished = false;
      const finish = (error) => {
        if (finished) return;
        finished = true;
        this.pc.removeEventListener('icegatheringstatechange', changed);
        this.clock.clearTimeout(timer);
        if (this.cancelGather === cancel) this.cancelGather = null;
        if (error) reject(error); else resolve();
      };
      const changed = () => { if (this.pc.iceGatheringState === 'complete') finish(); };
      const cancel = () => finish(new Error('connection.stopped'));
      const timer = this.clock.setTimeout(() => finish(new Error('connection.direct-failed')), GATHER_TIMEOUT);
      this.cancelGather = cancel;
      this.pc.addEventListener('icegatheringstatechange', changed);
      changed();
    });
  }

  connected() {
    this.check();
    this.established = true;
    this.clock.clearTimeout(this.expiryTimer);
    this.expiryTimer = null;
  }

  close() {
    if (this.closed) return;
    this.closed = true;
    this.clock.clearTimeout(this.expiryTimer);
    this.expiryTimer = null;
    this.cancelGather?.();
  }
}
