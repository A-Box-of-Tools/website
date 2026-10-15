/**
 * A socket owns its callbacks, deadlines and heartbeat, never its tool's consent.
 * Readiness and terminal protocol messages remain decisions for the adapter.
 */
export class PairingSocket {
  constructor(socket, {
    current = () => true,
    clock = {
      setTimeout: (callback, delay) => globalThis.setTimeout(callback, delay),
      clearTimeout: (timer) => globalThis.clearTimeout(timer),
    },
    maxBuffered = Infinity,
    onSendError = () => {},
  } = {}) {
    this.socket = socket;
    this.current = current;
    this.clock = clock;
    this.maxBuffered = maxBuffered;
    this.onSendError = onSendError;
    this.retired = false;
    this.listeners = new Map();
    this.timers = new Map();
    this.pendingProbe = null;
  }

  isCurrent() { return !this.retired && this.current(); }

  /** Adapter callbacks receive the original event, including an accepted pong. */
  listen(handlers = {}) {
    if (this.retired) return this;
    this.unlisten();
    for (const type of ['open', 'message', 'close', 'error']) {
      const listener = (event) => {
        if (!this.isCurrent() || this.listeners.get(type) !== listener) return;
        const probe = this.pendingProbe;
        if (type === 'message' && probe?.accept(event.data) && this.pendingProbe === probe) this.cancelProbe();
        if (this.isCurrent()) handlers[type]?.(event);
      };
      this.listeners.set(type, listener);
      this.socket[`on${type}`] = listener;
    }
    return this;
  }

  unlisten() {
    for (const [type, listener] of this.listeners) {
      if (this.socket[`on${type}`] === listener) this.socket[`on${type}`] = null;
    }
    this.listeners.clear();
  }

  /** False means no frame was sent; strings such as ping remain unencoded. */
  send(frame) {
    if (!this.isCurrent() || this.socket.readyState !== 1
        || (this.socket.bufferedAmount ?? 0) > this.maxBuffered) return false;
    try {
      this.socket.send(typeof frame === 'string' ? frame : JSON.stringify(frame));
      return true;
    } catch (error) {
      this.onSendError(error);
      return false;
    }
  }

  /** Named work replaces its predecessor even if that callback was already queued. */
  after(name, delay, callback) {
    this.clear(name);
    if (!this.isCurrent()) return null;
    const timer = { id: null };
    this.timers.set(name, timer);
    timer.id = this.clock.setTimeout(() => {
      if (this.timers.get(name) !== timer) return;
      this.timers.delete(name);
      if (this.isCurrent()) callback();
    }, delay);
    return timer.id;
  }

  /** A timeout-only clock is enough for browser code and deterministic tests. */
  every(name, delay, callback) {
    this.clear(name);
    if (!this.isCurrent()) return null;
    const timer = { id: null };
    const tick = () => {
      if (this.timers.get(name) !== timer) return;
      if (!this.isCurrent()) { this.clear(name); return; }
      callback();
      if (this.timers.get(name) === timer && this.isCurrent()) {
        timer.id = this.clock.setTimeout(tick, delay);
      }
    };
    this.timers.set(name, timer);
    timer.id = this.clock.setTimeout(tick, delay);
    return timer.id;
  }

  clear(name) {
    const timer = this.timers.get(name);
    if (!timer) return;
    this.timers.delete(name);
    this.clock.clearTimeout(timer.id);
  }

  get probing() { return this.pendingProbe !== null; }

  /**
   * A pending probe is reused without another ping or a longer deadline.
   * A failed send cancels it; adapters may apply their own unsent-ping policy.
   */
  probe({ timeout, onTimeout = () => {}, accept = (data) => data === 'pong' }) {
    if (!this.isCurrent()) return false;
    if (this.pendingProbe) return true;
    const probe = { id: null, accept };
    this.pendingProbe = probe;
    probe.id = this.clock.setTimeout(() => {
      if (this.pendingProbe !== probe) return;
      this.pendingProbe = null;
      if (this.isCurrent()) onTimeout();
    }, timeout);
    if (!this.send('ping')) {
      if (this.pendingProbe === probe) this.cancelProbe();
      return false;
    }
    return true;
  }

  cancelProbe() {
    const probe = this.pendingProbe;
    this.pendingProbe = null;
    if (probe) this.clock.clearTimeout(probe.id);
  }

  /** Retire first: close can synchronously dispatch an event in an adapter. */
  close(code = 1000) {
    if (this.retired) return;
    this.retired = true;
    this.cancelProbe();
    for (const name of this.timers.keys()) this.clear(name);
    this.unlisten();
    try { this.socket.close(code); } catch {}
  }
}
