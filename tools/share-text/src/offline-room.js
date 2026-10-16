import { OfflineChannel, OfflineSocket } from './shared/offline-channel.js';
import { readOfflineBlock } from './shared/offline-pairing.js';
import { allowedCandidate, localDescription } from './shared/peer-network.js';

const parse = text => { try { return JSON.parse(text); } catch { return null; } };
const validEpoch = value => Number.isSafeInteger(value) && value > 0;
function signal(data, expected) {
  if (!data || typeof data !== 'object' || Array.isArray(data) || JSON.stringify(data).length >= 60000) return null;
  if (data.sdp?.type === expected && typeof data.sdp.sdp === 'string'
      && /^m=application\s/m.test(data.sdp.sdp) && !/^m=(?:audio|video)\s/m.test(data.sdp.sdp)) {
    return { sdp: localDescription(data.sdp), local: true };
  }
  if (Object.hasOwn(data, 'candidate') && allowedCandidate(data.candidate, true)) return { candidate: data.candidate, local: true };
  return null;
}

// The host's routing authority stays in this browser. A remote bootstrap channel
// gets one assigned reader identity and cannot address another reader.
export class OfflineTextHost {
  constructor({ Channel = OfflineChannel, onChange = () => {}, onError = () => {} } = {}) {
    Object.assign(this, { Channel, onChange, onError });
    this.links = new Map();
    this.pending = null;
    this.host = null;
    this.closed = false;
    const broker = this;
    this.Socket = class { constructor() { return broker.hostSocket(); } };
  }
  get ready() { return !this.closed && this.host?.readyState === 1; }
  hostSocket() {
    if (this.closed) throw new Error('offline.disconnected');
    this.host?.close();
    const socket = new OfflineSocket(text => {
      if (this.closed || this.host !== socket) return false;
      if (text === 'ping') { socket.receive('pong'); return true; }
      const frame = parse(text);
      const link = this.links.get(frame?.to);
      const data = signal(frame?.data, 'answer');
      if (!link?.active || !data) return true;
      return link.channel.send(JSON.stringify({ kind: 'signal', epoch: link.epoch, data }));
    }, () => { if (this.host === socket) this.host = null; }, () => {
      socket.receive(JSON.stringify({ type: 'host-ready' }));
      for (const link of this.links.values()) if (link.active) this.join(link);
    });
    this.host = socket;
    return socket;
  }
  deliver(frame) { this.host?.receive(JSON.stringify(frame)); }
  join(link) {
    this.deliver({ type: 'join', id: link.id });
    link.channel.send(JSON.stringify({ kind: 'ready', epoch: link.epoch }));
  }
  receive(link, text) {
    if (this.closed || this.links.get(link.id) !== link) return;
    const frame = parse(text);
    if (!validEpoch(frame?.epoch)) return;
    if (frame.kind === 'open' && frame.epoch > link.epoch) {
      if (link.epoch) this.deliver({ type: 'leave', id: link.id });
      link.epoch = frame.epoch;
      link.active = true;
      this.join(link);
    } else if (frame.epoch === link.epoch && frame.kind === 'close') {
      this.deliver({ type: 'leave', id: link.id });
      link.active = false;
    } else if (link.active && frame.epoch === link.epoch && frame.kind === 'signal') {
      const data = signal(frame.data, 'offer');
      if (data) this.deliver({ type: 'signal', from: link.id, data });
    }
  }
  async createOffer() {
    if (!this.ready) throw new Error('connection.stopped');
    if (this.pending) { const previous = this.pending; this.pending = null; previous.channel.close(); }
    if (this.links.size >= 16) throw new Error('offline.full');
    const link = { id: crypto.randomUUID(), channel: null, epoch: 0, active: false };
    link.channel = new this.Channel({ tool: 'share-text',
      onOpen: () => {
        if (this.closed || this.links.get(link.id) !== link) return;
        if (this.pending === link) this.pending = null;
        link.channel.send(JSON.stringify({ kind: 'hello' }));
        this.onChange();
      },
      onMessage: text => this.receive(link, text),
      onClose: reason => {
        const pending = this.pending === link;
        if (pending) this.pending = null;
        if (link.epoch) this.deliver({ type: 'leave', id: link.id });
        this.links.delete(link.id);
        if (!this.closed) { if (pending) this.onError(reason); this.onChange(); }
      } });
    this.pending = link;
    this.links.set(link.id, link);
    try { return await link.channel.createOffer(); }
    catch (error) { link.channel.close(); throw error; }
  }
  acceptAnswer(text) {
    if (!this.pending || this.closed) throw new Error('offline.invalid-answer');
    return this.pending.channel.acceptAnswer(text);
  }
  close() {
    if (this.closed) return;
    this.closed = true;
    this.host?.close();
    for (const link of this.links.values()) link.channel.close();
    this.links.clear();
    this.pending = null;
    this.onChange();
  }
}

export class OfflineTextClient {
  constructor({ Channel = OfflineChannel, onReady = () => {}, onClose = () => {} } = {}) {
    Object.assign(this, { Channel, onReady, onClose });
    this.channel = null;
    this.socket = null;
    this.epoch = 0;
    this.closed = false;
    this.ready = false;
    const client = this;
    this.Socket = class { constructor() { return client.clientSocket(); } };
  }
  async createAnswer(text) {
    readOfflineBlock('share-text', text, 'offer', { checkExpiry: false });
    if (this.closed || this.channel) throw new Error('connection.stopped');
    this.channel = new this.Channel({ tool: 'share-text',
      onMessage: text => {
        if (this.closed) return;
        const frame = parse(text);
        if (!this.ready && frame?.kind === 'hello') { this.ready = true; this.onReady(); }
        else if (frame?.epoch === this.epoch) {
          if (frame.kind === 'ready') this.socket?.receive(JSON.stringify({ type: 'ready' }));
          else if (frame.kind === 'signal') {
            const data = signal(frame.data, 'answer');
            if (data) this.socket?.receive(JSON.stringify({ type: 'signal', data }));
          }
        }
      },
      onClose: reason => { if (!this.closed) { this.close(); this.onClose(reason); } },
    });
    try { return await this.channel.createAnswer(text); }
    catch (error) { this.close(); throw error; }
  }
  clientSocket() {
    if (this.closed || !this.ready || this.channel?.readyState !== 1) throw new Error('offline.disconnected');
    this.socket?.close();
    const epoch = ++this.epoch;
    const socket = new OfflineSocket(text => {
      if (text === 'ping') { socket.receive('pong'); return true; }
      const frame = parse(text);
      const data = signal(frame?.data, 'offer');
      return Boolean(data) && this.channel.send(JSON.stringify({ kind: 'signal', epoch, data }));
    }, () => {
      if (this.socket !== socket) return;
      this.channel.send(JSON.stringify({ kind: 'close', epoch }));
      this.socket = null;
    }, () => this.channel.send(JSON.stringify({ kind: 'open', epoch })));
    this.socket = socket;
    return socket;
  }
  close() {
    if (this.closed) return;
    this.closed = true;
    this.ready = false;
    this.socket?.close(4400);
    this.channel?.close();
  }
}
