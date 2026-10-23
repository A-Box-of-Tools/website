const SAMPLE_MS = 250;
const COOLDOWN_MS = 10000;
const WIDTH = 32, HEIGHT = 24;
let nextTag = 0;

function expectedScope(location) {
  try { return new URL('./', location.href).href; } catch { return null; }
}
function activeRegistration(registration, scope) {
  return !!scope && registration?.scope === scope && registration.active?.state === 'activated'
    && typeof registration.showNotification === 'function' && typeof registration.getNotifications === 'function';
}
function liveTrack(stream, kind) {
  const tracks = kind === 'audio' ? stream?.getAudioTracks?.() : stream?.getVideoTracks?.();
  return tracks?.find((track) => track.readyState !== 'ended') || null;
}
function gate() { return { armed: true, high: 0, quiet: 0 }; }
function sustained(value, state, high, low) {
  if (!state.armed) {
    state.quiet = value <= low ? state.quiet + 1 : 0;
    if (state.quiet >= 3) { state.armed = true; state.high = 0; state.quiet = 0; }
    return false;
  }
  state.high = value >= high ? state.high + 1 : 0;
  if (state.high < 3) return false;
  state.armed = false; state.high = 0; state.quiet = 0;
  return true;
}

export async function alertCapabilities({ window = globalThis, navigator = window.navigator,
  document = window.document, location = window.location } = {}) {
  const unavailable = { supported: false, motion: false, sound: false, registration: null };
  if (!window.isSecureContext || typeof window.Notification?.requestPermission !== 'function'
    || typeof navigator?.serviceWorker?.getRegistration !== 'function') return unavailable;
  const scope = expectedScope(location);
  if (!scope) return unavailable;
  let registration;
  try { registration = await navigator.serviceWorker.getRegistration(scope); } catch { return unavailable; }
  if (!activeRegistration(registration, scope)) return unavailable;
  let motion = false;
  try {
    const context = document?.createElement('canvas').getContext('2d', { willReadFrequently: true });
    motion = typeof context?.drawImage === 'function' && typeof context?.getImageData === 'function';
  } catch { /* A browser may expose canvas without allowing pixel reads. */ }
  return { supported: true, motion, sound: typeof (window.AudioContext || window.webkitAudioContext) === 'function'
    && typeof window.MediaStream === 'function', registration };
}

export class ViewerAlerts {
  #video; #registration; #window; #document; #scope; #onStatus; #title; #bodies;
  #now; #setTimer; #clearTimer; #createCanvas;
  #stream = null; #streamListeners = []; #trackListeners = [];
  #token = null; #timer = null; #choices = { motion: false, sound: false };
  #context = null; #source = null; #analyser = null; #samples = null; #soundTrack = null;
  #canvas = null; #drawing = null; #baseline = null; #videoTime = null;
  #motionGate = gate(); #soundGate = gate(); #motionWarm = 2; #soundWarm = 2; #noise = null;
  #lastSample = null; #lastAlert = -Infinity; #noAudioReported = false;

  constructor({ video, registration, onStatus = () => {}, title, motionBody, soundBody,
    window = globalThis, document = window.document, location = window.location,
    now = () => globalThis.performance.now(), setTimer = (callback, delay) => globalThis.setTimeout(callback, delay),
    clearTimer = (timer) => globalThis.clearTimeout(timer), createCanvas = () => document.createElement('canvas') } = {}) {
    this.#video = video; this.#registration = registration; this.#window = window; this.#document = document;
    this.#scope = expectedScope(location); this.#onStatus = onStatus; this.#title = title;
    this.#bodies = { motion: motionBody, sound: soundBody }; this.#now = now;
    this.#setTimer = setTimer; this.#clearTimer = clearTimer; this.#createCanvas = createCanvas;
  }

  get choices() { return { ...this.#choices }; }

  attach(stream) {
    if (stream !== this.#stream) {
      this.#removeListeners(); this.#stream = stream; this.#resetDetectors();
      if (stream) {
        this.#listen(stream, 'addtrack', () => this.#mediaChanged(), this.#streamListeners);
        this.#listen(stream, 'removetrack', () => this.#mediaChanged(), this.#streamListeners);
        this.#listen(this.#document, 'visibilitychange', () => this.#resetDetectors(), this.#streamListeners);
      }
    }
    this.#mediaChanged();
  }

  async enable({ motion = false, sound = false } = {}) {
    this.#clearRun();
    if (!motion && !sound) { this.#onStatus('alerts.off'); return false; }
    if (!this.#window.isSecureContext || typeof this.#window.Notification?.requestPermission !== 'function'
      || !activeRegistration(this.#registration, this.#scope)) {
      this.#onStatus('alerts.failed'); return false;
    }
    const nonce = this.#window.crypto?.randomUUID?.() || Date.now() + '-' + Math.random().toString(36).slice(2);
    const token = { tag: 'remote-camera-alert-' + nonce + '-' + ++nextTag, permitted: false };
    this.#token = token; this.#choices = { motion: !!motion, sound: !!sound };
    let permission, resume = Promise.resolve();
    try {
      const notifications = this.#window.Notification;
      permission = notifications.permission === 'granted' || notifications.permission === 'denied'
        ? Promise.resolve(notifications.permission) : Promise.resolve(notifications.requestPermission());
      if (sound) {
        const AudioContext = this.#window.AudioContext || this.#window.webkitAudioContext;
        this.#context = new AudioContext();
        resume = Promise.resolve(this.#context.resume());
      }
    } catch {
      Promise.resolve(permission).catch(() => {});
      if (this.#current(token)) { this.#clearRun(); this.#onStatus('alerts.failed'); }
      return false;
    }
    // Permission and audio activation must both begin inside the original gesture.
    const [allowed, resumed] = await Promise.allSettled([permission, resume]);
    if (!this.#current(token)) return false;
    if (allowed.status !== 'fulfilled' || allowed.value !== 'granted') {
      this.#clearRun(); this.#onStatus(allowed.status === 'fulfilled' ? 'alerts.denied' : 'alerts.failed'); return false;
    }
    if (resumed.status !== 'fulfilled' || (sound && this.#context?.state !== 'running')) {
      this.#clearRun(); this.#onStatus('alerts.failed'); return false;
    }
    token.permitted = true;
    try {
      if (motion) {
        this.#canvas = this.#createCanvas(); this.#canvas.width = WIDTH; this.#canvas.height = HEIGHT;
        this.#drawing = this.#canvas.getContext('2d', { willReadFrequently: true });
        if (!this.#drawing) throw new Error();
      }
      this.#syncAudio();
    } catch {
      this.#clearRun(); this.#onStatus('alerts.failed'); return false;
    }
    this.#noAudioReported = sound && !this.#soundTrack;
    this.#onStatus(this.#noAudioReported ? 'alerts.no-audio' : 'alerts.enabled');
    this.#schedule(token);
    return true;
  }

  disable() { this.#clearRun(); this.#onStatus('alerts.off'); }
  disconnect() { this.disable(); this.#removeListeners(); this.#stream = null; }

  #current(token) { return this.#token === token; }
  #listen(target, type, handler, listeners) {
    if (!target?.addEventListener) return;
    target.addEventListener(type, handler); listeners.push(() => target.removeEventListener(type, handler));
  }
  #removeListeners() {
    this.#streamListeners.splice(0).forEach((remove) => remove());
    this.#trackListeners.splice(0).forEach((remove) => remove());
  }
  #mediaChanged() {
    this.#trackListeners.splice(0).forEach((remove) => remove());
    for (const track of this.#stream?.getTracks?.() || []) {
      for (const event of ['ended', 'mute', 'unmute']) {
        this.#listen(track, event, () => { this.#resetDetectors(); this.#refreshAudio(); }, this.#trackListeners);
      }
    }
    this.#refreshAudio();
  }
  #refreshAudio() {
    try { this.#syncAudio(); } catch {
      if (this.#token) { this.#clearRun(); this.#onStatus('alerts.failed'); }
    }
  }
  #syncAudio() {
    const track = this.#choices.sound && this.#context ? liveTrack(this.#stream, 'audio') : null;
    if (track === this.#soundTrack) return;
    this.#disconnectAudio(); this.#soundTrack = track; this.#resetSound();
    if (track) {
      this.#source = this.#context.createMediaStreamSource(new this.#window.MediaStream([track]));
      this.#analyser = this.#context.createAnalyser(); this.#analyser.fftSize = 512;
      this.#samples = new Float32Array(this.#analyser.fftSize);
      this.#source.connect(this.#analyser);
      if (this.#noAudioReported && this.#token?.permitted) this.#onStatus('alerts.enabled');
      this.#noAudioReported = false;
    } else if (this.#choices.sound && this.#token?.permitted && !this.#noAudioReported) {
      this.#noAudioReported = true; this.#onStatus('alerts.no-audio');
    }
  }
  #disconnectAudio() {
    try { this.#source?.disconnect(); } catch { /* Cleanup also follows browser-initiated suspension. */ }
    try { this.#analyser?.disconnect(); } catch { /* Cleanup must not interrupt the viewer. */ }
    this.#source = null; this.#analyser = null; this.#samples = null; this.#soundTrack = null;
  }
  #resetSound() { this.#soundGate = gate(); this.#soundWarm = 2; this.#noise = null; }
  #resetDetectors() {
    this.#baseline = null; this.#videoTime = null; this.#motionGate = gate(); this.#motionWarm = 2;
    this.#resetSound(); this.#lastSample = null;
  }
  #clearRun() {
    const token = this.#token; this.#token = null;
    if (this.#timer !== null) this.#clearTimer(this.#timer);
    this.#timer = null; this.#choices = { motion: false, sound: false }; this.#disconnectAudio();
    const context = this.#context; this.#context = null;
    try { Promise.resolve(context?.close()).catch(() => {}); } catch { /* A closed context needs no further work. */ }
    this.#canvas = null; this.#drawing = null; this.#resetDetectors();
    this.#lastAlert = -Infinity; this.#noAudioReported = false;
    if (token) this.#closeNotifications(token.tag);
  }
  #schedule(token) {
    if (!this.#current(token)) return;
    this.#timer = this.#setTimer(() => this.#tick(token), SAMPLE_MS);
  }
  #tick(token) {
    if (!this.#current(token)) return;
    this.#timer = null;
    const time = this.#now();
    if (this.#lastSample !== null && (time - this.#lastSample > 1500 || time < this.#lastSample)) this.#resetDetectors();
    this.#lastSample = time;
    try {
      if (this.#choices.motion) this.#sampleMotion(token);
      if (this.#choices.sound) this.#sampleSound(token);
    } catch {
      if (this.#current(token)) { this.#clearRun(); this.#onStatus('alerts.failed'); }
    }
    this.#schedule(token);
  }
  #sampleMotion(token) {
    const video = this.#video, track = liveTrack(this.#stream, 'video');
    if (!track || track.muted || video?.readyState < 2 || !video?.videoWidth || !video?.videoHeight
      || video.paused || video.ended || video.currentTime === this.#videoTime) {
      this.#baseline = null; this.#motionGate = gate(); this.#motionWarm = 2; return;
    }
    this.#videoTime = video.currentTime;
    this.#drawing.drawImage(video, 0, 0, WIDTH, HEIGHT);
    const pixels = this.#drawing.getImageData(0, 0, WIDTH, HEIGHT).data;
    const frame = new Float32Array(WIDTH * HEIGHT);
    let difference = 0;
    for (let i = 0; i < frame.length; i++) {
      const offset = i * 4;
      frame[i] = (pixels[offset] * 3 + pixels[offset + 1] * 6 + pixels[offset + 2]) / 10;
      if (this.#baseline) difference += Math.abs(frame[i] - this.#baseline[i]);
    }
    const hadBaseline = this.#baseline !== null; this.#baseline = frame;
    if (!hadBaseline) return;
    if (this.#motionWarm > 0) { this.#motionWarm -= 1; return; }
    if (sustained(difference / (frame.length * 255), this.#motionGate, 0.045, 0.015)) this.#notify('motion', token);
  }
  #sampleSound(token) {
    if (!this.#analyser || !this.#soundTrack || this.#soundTrack.muted || this.#context?.state !== 'running') {
      this.#resetSound(); return;
    }
    this.#analyser.getFloatTimeDomainData(this.#samples);
    let power = 0;
    for (const value of this.#samples) power += value * value;
    const rms = Math.sqrt(power / this.#samples.length);
    if (this.#soundWarm > 0) {
      this.#noise = Math.min(0.01, this.#noise === null ? rms : (this.#noise + rms) / 2);
      this.#soundWarm -= 1; return;
    }
    const high = Math.max(0.035, this.#noise * 2.5), low = Math.max(0.015, this.#noise * 1.3);
    if (sustained(rms, this.#soundGate, high, low)) this.#notify('sound', token);
    if (rms < high) this.#noise = Math.min(0.01, this.#noise * 0.95 + rms * 0.05);
  }
  #notify(kind, token) {
    if (!this.#current(token)) return;
    if (this.#window.Notification.permission !== 'granted') {
      this.#clearRun(); this.#onStatus('alerts.denied'); return;
    }
    if (!activeRegistration(this.#registration, this.#scope)) {
      this.#clearRun(); this.#onStatus('alerts.failed'); return;
    }
    const time = this.#now();
    if (time - this.#lastAlert < COOLDOWN_MS) return;
    this.#lastAlert = time;
    let displayed;
    try {
      displayed = this.#registration.showNotification(this.#title, { body: this.#bodies[kind], tag: token.tag, renotify: false });
    } catch {
      this.#clearRun(); this.#onStatus('alerts.failed'); return;
    }
    Promise.resolve(displayed).then(() => {
      if (!this.#current(token)) this.#closeNotifications(token.tag);
      else this.#onStatus(kind === 'motion' ? 'alerts.motion' : 'alerts.sound');
    }, () => {
      if (this.#current(token)) { this.#clearRun(); this.#onStatus('alerts.failed'); }
    });
  }
  #closeNotifications(tag) {
    try {
      Promise.resolve(this.#registration.getNotifications({ tag })).then((notifications) => {
        for (const notification of notifications) if (notification.tag === tag) {
          try { notification.close(); } catch { /* One stale handle must not prevent the others from closing. */ }
        }
      }, () => {});
    } catch { /* Notification cleanup is best effort after disconnection. */ }
  }
}
