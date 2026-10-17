import { rtcConfig } from './peer-network.js';
import { OfflineExchange } from './offline-pairing.js';

const LABEL = 'abox-offline-signaling-v1';
const LIMIT = 65536;
const size = value => new TextEncoder().encode(value).byteLength;

// A socket-shaped local endpoint lets existing guarded pairing adapters retain
// their lifecycle without opening a WebSocket or giving remote peers authority.
export class OfflineSocket {
  constructor(send, detach, opened = () => {}) {
    this.readyState = 0;
    this.bufferedAmount = 0;
    this.pending = 0;
    this.transmit = send;
    this.detach = detach;
    queueMicrotask(() => {
      if (this.readyState !== 0) return;
      this.readyState = 1;
      this.onopen?.({});
      if (this.readyState === 1) opened();
    });
  }
  send(text) {
    if (this.readyState !== 1 || typeof text !== 'string' || size(text) >= LIMIT - 256 || !this.transmit(text)) throw new Error('offline.disconnected');
  }
  receive(text) {
    if (this.readyState === 3) return;
    if (typeof text !== 'string' || size(text) > LIMIT || this.pending >= 256) { this.close(4400); return; }
    this.pending++;
    queueMicrotask(() => {
      this.pending--;
      if (this.readyState === 1) this.onmessage?.({ data: text });
    });
  }
  close(code = 1000) {
    if (this.readyState === 3) return;
    this.readyState = 3;
    this.detach();
    this.onclose?.({ code });
  }
}

// The manual exchange establishes only a bounded signaling channel. Applications
// still own admission, media permissions and the meaning of every message.
export class OfflineChannel {
  constructor({ tool, Peer = globalThis.RTCPeerConnection, onOpen = () => {},
    onMessage = () => {}, onClose = () => {}, random, now } = {}) {
    this.readyState = 0;
    this.onOpen = onOpen;
    this.onMessage = onMessage;
    this.onClose = onClose;
    this.channel = null;
    this.started = false;
    this.disconnectTimer = null;
    this.pc = new Peer(rtcConfig(true));
    this.exchange = new OfflineExchange({ tool, pc: this.pc,
      current: () => this.readyState !== 3,
      ...(random ? { random } : {}), ...(now ? { now } : {}),
      onExpire: () => this.close('offline.expired') });
    this.pc.ondatachannel = event => this.attach(event.channel);
    this.pc.onconnectionstatechange = () => {
      if (this.readyState === 3) return;
      clearTimeout(this.disconnectTimer);
      this.disconnectTimer = null;
      if (this.pc.connectionState === 'failed' || this.pc.connectionState === 'closed') this.close('offline.disconnected');
      else if (this.pc.connectionState === 'disconnected') this.disconnectTimer = setTimeout(() => this.close('offline.disconnected'), 10000);
    };
  }

  get bufferedAmount() { return this.channel?.bufferedAmount ?? 0; }

  attach(channel) {
    if (this.readyState === 3 || this.channel || channel.label !== LABEL) {
      channel.close();
      if (this.readyState !== 3) this.close('offline.invalid-channel');
      return;
    }
    this.channel = channel;
    channel.onopen = () => {
      if (this.readyState !== 0 || this.channel !== channel) return;
      try { this.exchange.connected(); }
      catch { this.close('offline.expired'); return; }
      this.readyState = 1;
      this.onOpen();
    };
    channel.onmessage = event => {
      if (this.readyState !== 1 || this.channel !== channel) return;
      if (typeof event.data !== 'string' || size(event.data) > LIMIT) return this.close('offline.invalid-message');
      this.onMessage(event.data);
    };
    channel.onclose = channel.onerror = () => this.close('offline.disconnected');
    if (channel.readyState === 'open') queueMicrotask(() => channel.onopen?.());
  }

  async createOffer() {
    if (this.started || this.readyState === 3) throw new Error('offline.invalid-offer');
    this.started = true;
    this.attach(this.pc.createDataChannel(LABEL, { ordered: true }));
    return this.exchange.createOffer();
  }

  async createAnswer(text) {
    if (this.started || this.readyState === 3) throw new Error('offline.invalid-offer');
    this.started = true;
    return this.exchange.createAnswer(text);
  }

  acceptAnswer(text) {
    if (!this.started || this.readyState === 3) throw new Error('offline.invalid-answer');
    return this.exchange.acceptAnswer(text);
  }

  send(text) {
    if (this.readyState !== 1 || this.channel?.readyState !== 'open'
        || typeof text !== 'string' || size(text) > LIMIT || this.bufferedAmount > LIMIT) return false;
    try { this.channel.send(text); return true; }
    catch { this.close('offline.disconnected'); return false; }
  }

  close(reason = 'offline.closed') {
    if (this.readyState === 3) return;
    this.readyState = 3;
    clearTimeout(this.disconnectTimer);
    this.exchange.close();
    this.pc.ondatachannel = this.pc.onconnectionstatechange = null;
    if (this.channel) {
      this.channel.onopen = this.channel.onmessage = this.channel.onclose = this.channel.onerror = null;
      this.channel.close();
    }
    this.pc.close();
    this.onClose(reason);
  }
}
