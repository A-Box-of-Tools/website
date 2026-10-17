import { OfflineChannel, OfflineSocket as LocalSocket } from './offline-channel.js';
import { readOfflineBlock } from './offline-pairing.js';
import { allowedCandidate, localDescription } from './peer-network.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const KEY = /^[A-Za-z0-9_-]{43}$/;
const CODE = /^[0-9a-f]{64}$/;
const LIMIT = 65536;
const parse = text => { try { return JSON.parse(text); } catch { return null; } };
const digest = async key => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key))), b => b.toString(16).padStart(2, '0')).join('');
const wire = (epoch, text) => JSON.stringify({ kind: 'voice', epoch, text });
const validWire = value => value?.kind === 'voice' && Number.isSafeInteger(value.epoch) && value.epoch > 0
  && typeof value.text === 'string' && value.text.length < LIMIT - 256;

function signal(frame, expected) {
  if (frame?.type === 'candidate') {
    if (!allowedCandidate(frame.candidate, true)) return null;
    return { type: 'candidate', candidate: frame.candidate ?? null };
  }
  if (frame?.type !== expected || typeof frame.sdp !== 'string' || frame.sdp.length > 50000) return null;
  const sections = frame.sdp.match(/^m=.*$/gm) || [];
  if (sections.length !== 1 || !sections[0].startsWith('m=audio ')) return null;
  return { type: expected, sdp: localDescription(frame.sdp) };
}

// Host authority is an in-memory socket, never a role supplied by a remote
// browser. Every manually exchanged channel owns exactly one client socket.
export class OfflineVoiceHost {
  constructor({ tool, identity, Channel = OfflineChannel, onChange = () => {}, onError = () => {} }) {
    Object.assign(this, { tool, identity, Channel, onChange, onError });
    this.inbox = tool === 'voice-oncall';
    this.generation = crypto.randomUUID();
    this.links = new Set();
    this.clients = new Map();
    this.policies = new Map();
    this.pending = null;
    this.host = null;
    this.closed = false;
    this.talking = false;
    const broker = this;
    this.Socket = class {
      constructor() { return broker.hostSocket(); }
    };
  }
  get ready() { return !this.closed && this.host?.readyState === 1; }
  hostSocket() {
    if (this.closed) throw new Error('offline.disconnected');
    this.host?.close();
    let authenticated = false;
    const socket = new LocalSocket(text => {
      if (this.closed || this.host !== socket) return false;
      if (text === 'ping') { socket.receive('pong'); return true; }
      const frame = parse(text);
      if (!authenticated) {
        if (frame?.type !== 'auth' || frame.role !== 'host' || frame.key !== this.identity.key) return false;
        authenticated = true;
        this.deliverHost({ type: 'host-ready', generation: this.generation });
        for (const client of this.clients.values()) this.join(client);
        return true;
      }
      this.fromHost(frame);
      return true;
    }, () => { if (this.host === socket) this.host = null; });
    this.host = socket;
    return socket;
  }
  deliverHost(frame) { this.host?.receive(JSON.stringify(frame)); }
  deliver(client, frame) {
    return client.link.channel.send(wire(client.epoch, typeof frame === 'string' ? frame : JSON.stringify(frame)));
  }
  join(client) {
    this.deliver(client, { type: 'ready', id: client.id, generation: this.generation, talking: this.talking, muted: client.muted });
    this.deliverHost({ type: 'join', id: client.id, generation: this.generation, name: '', muted: client.muted, talking: false });
  }
  detach(client) {
    if (!client || this.clients.get(client.id) !== client) return;
    this.clients.delete(client.id);
    if (client.link.client === client) client.link.client = null;
    this.deliverHost({ type: 'leave', id: client.id, generation: this.generation });
  }
  async fromClient(link, envelope) {
    if (this.closed || !this.links.has(link) || !validWire(envelope)) return;
    const frame = parse(envelope.text);
    if (envelope.epoch > link.epoch) {
      if (frame?.type !== 'auth') return;
      this.detach(link.client);
      link.epoch = envelope.epoch;
      const reject = error => link.channel.send(wire(envelope.epoch, JSON.stringify({ type: 'error', error })));
      if (frame.role !== (this.inbox ? 'sender' : 'listener') || !KEY.test(frame.key || '')) { reject('unauthorized'); return; }
      if (this.inbox ? frame.passwordProof !== (this.identity.passwordProof ?? null) : frame.key !== this.identity.listenKey) {
        reject(this.inbox ? 'password' : 'unauthorized'); return;
      }
      const id = this.inbox ? await digest(frame.key) : link.id;
      if (this.closed || !this.links.has(link) || link.epoch !== envelope.epoch) return;
      const policy = this.policies.get(id);
      if (policy?.kicked) { link.channel.send(wire(envelope.epoch, JSON.stringify({ type: 'kicked' }))); return; }
      const previous = this.clients.get(id);
      if (!previous && this.clients.size >= 10) { reject('full'); return; }
      if (previous) { this.deliver(previous, { type: 'replaced' }); this.detach(previous); }
      const client = { id, link, epoch: envelope.epoch, muted: Boolean(policy?.muted), connection: null };
      link.client = client;
      this.clients.set(id, client);
      this.join(client);
      return;
    }
    const client = link.client;
    if (!client || envelope.epoch !== client.epoch || this.clients.get(client.id) !== client) return;
    if (envelope.text === 'ping') { this.deliver(client, 'pong'); return; }
    if (frame?.type === 'leave') { this.detach(client); return; }
    if (frame?.type === 'check') { this.join(client); return; }
    if (frame?.generation !== this.generation) return;
    if (this.inbox && frame.type === 'status' && typeof frame.talking === 'boolean') {
      this.deliverHost({ type: 'status', id: client.id, generation: this.generation, talking: !client.muted && frame.talking });
      return;
    }
    if (frame.connection !== client.connection || !UUID.test(frame.connection || '')) return;
    const data = signal(frame, 'answer');
    if (data) this.deliverHost({ ...data, from: client.id, to: 'host', generation: this.generation, connection: client.connection });
  }
  fromHost(frame) {
    if (!frame || frame.generation !== this.generation) return;
    if (frame.type === 'end') { this.close(); return; }
    if (!this.inbox && frame.type === 'status' && typeof frame.talking === 'boolean') {
      this.talking = frame.talking;
      for (const client of this.clients.values()) this.deliver(client, { type: 'status', generation: this.generation, talking: this.talking });
      return;
    }
    const client = this.clients.get(frame.to);
    if (!client) return;
    if (this.inbox && ['moderate', 'kick'].includes(frame.type)) {
      if (frame.type === 'moderate' && typeof frame.muted !== 'boolean') return;
      if (!this.policies.has(client.id) && this.policies.size >= 24) {
        this.deliverHost({ type: 'error', error: 'moderation-full', generation: this.generation, to: client.id });
        return;
      }
      if (frame.type === 'kick') {
        this.policies.set(client.id, { kicked: true, muted: true });
        this.deliver(client, { type: 'kicked' });
        this.detach(client);
        // Let the terminal notice drain, then free this participant's bootstrap
        // slot even when its page stays open. The identity block remains.
        client.link.closeTimer = setTimeout(() => client.link.channel.close(), 250);
      } else {
        client.muted = frame.muted;
        this.policies.set(client.id, { muted: frame.muted });
        const ack = { type: 'moderated', id: client.id, generation: this.generation, muted: frame.muted };
        this.deliver(client, ack);
        this.deliverHost(ack);
      }
      return;
    }
    if (!UUID.test(frame.connection || '')) return;
    const data = signal(frame, 'offer');
    if (!data) return;
    if (frame.type === 'offer') client.connection = frame.connection;
    else if (frame.connection !== client.connection) return;
    this.deliver(client, { ...data, from: 'host', to: client.id, generation: this.generation, connection: client.connection });
  }
  async createOffer() {
    if (!this.ready) throw new Error('connection.stopped');
    if (this.pending) { const previous = this.pending; this.pending = null; previous.channel.close(); }
    if (this.links.size >= 10) throw new Error('error-full');
    const link = { channel: null, epoch: 0, client: null, id: crypto.randomUUID(), processing: 0, chain: Promise.resolve() };
    link.channel = new this.Channel({ tool: this.tool,
      onOpen: () => {
        if (this.closed || !this.links.has(link)) return;
        if (this.pending === link) this.pending = null;
        link.channel.send(JSON.stringify({ kind: 'hello', tool: this.tool, code: this.identity.code,
          roomName: this.identity.roomName, locked: Boolean(this.identity.passwordProof),
          ...(this.inbox ? {} : { listenKey: this.identity.listenKey }) }));
        this.onChange();
      },
      onMessage: text => {
        if (link.processing >= 256) { link.channel.close(); return; }
        link.processing++;
        link.chain = link.chain.then(() => this.fromClient(link, parse(text)))
          .catch(() => link.channel.close()).finally(() => { link.processing--; });
      },
      onClose: reason => {
        clearTimeout(link.closeTimer);
        const pending = this.pending === link;
        if (pending) this.pending = null;
        this.detach(link.client);
        this.links.delete(link);
        if (!this.closed) { if (pending) this.onError(reason); this.onChange(); }
      } });
    this.pending = link;
    this.links.add(link);
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
    for (const client of this.clients.values()) this.deliver(client, { type: 'ended' });
    this.host?.close(4400);
    for (const link of this.links) link.channel.close();
    this.links.clear();
    this.clients.clear();
    this.pending = null;
    this.onChange();
  }
}

export class OfflineVoiceClient {
  constructor({ tool, Channel = OfflineChannel, onReady = () => {}, onClose = () => {} }) {
    Object.assign(this, { tool, Channel, onReady, onClose });
    this.channel = null;
    this.socket = null;
    this.epoch = 0;
    this.closed = false;
    this.identity = null;
    const client = this;
    this.Socket = class { constructor() { return client.clientSocket(); } };
  }
  async createAnswer(text) {
    readOfflineBlock(this.tool, text, 'offer', { checkExpiry: false });
    if (this.closed || this.channel) throw new Error('connection.stopped');
    this.channel = new this.Channel({ tool: this.tool,
      onMessage: data => {
        if (this.closed) return;
        const value = parse(data);
        if (!this.identity && value?.kind === 'hello' && value.tool === this.tool && CODE.test(value.code || '')
            && typeof value.roomName === 'string' && value.roomName.length <= 80 && typeof value.locked === 'boolean'
            && (this.tool === 'voice-oncall' || KEY.test(value.listenKey || ''))) {
          this.identity = { code: value.code, roomName: value.roomName, locked: value.locked,
            ...(this.tool === 'voice-oncall' ? {} : { key: value.listenKey }) };
          this.onReady(this.identity);
        } else if (validWire(value) && value.epoch === this.epoch) this.socket?.receive(value.text);
      },
      onClose: reason => { if (!this.closed) { this.close(); this.onClose(reason); } } });
    try { return await this.channel.createAnswer(text); }
    catch (error) { this.close(); throw error; }
  }
  clientSocket() {
    if (this.closed || !this.identity || this.channel?.readyState !== 1) throw new Error('offline.disconnected');
    this.socket?.close();
    const epoch = ++this.epoch;
    const socket = new LocalSocket(text => this.channel.send(wire(epoch, text)), () => {
      if (this.socket !== socket) return;
      this.channel.send(wire(epoch, JSON.stringify({ type: 'leave' })));
      this.socket = null;
    });
    this.socket = socket;
    return socket;
  }
  close() {
    if (this.closed) return;
    this.closed = true;
    this.socket?.close(4400);
    this.channel?.close();
    this.identity = null;
  }
}
