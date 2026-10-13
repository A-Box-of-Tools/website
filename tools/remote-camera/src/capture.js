// A permission prompt can outlive the session that opened it. Generation checks
// close that late stream before a stopped camera can become active again.
function stopStream(stream) {
  stream?.getTracks().forEach((track) => { if (track.readyState !== 'ended') track.stop(); });
}

export class CameraCapture {
  #getUserMedia;
  #generation = 0;
  #stream = null;
  #switchOperation = null;

  constructor({ getUserMedia = (constraints) => navigator.mediaDevices.getUserMedia(constraints) } = {}) {
    this.#getUserMedia = getUserMedia;
  }

  get active() { return this.#stream !== null; }
  get stream() { return this.#stream; }
  get switching() { return this.#switchOperation !== null; }

  async start(constraints = { video: true }) {
    this.stop();
    const generation = this.#generation;
    let stream;
    try { stream = await this.#getUserMedia({ ...constraints, audio: false }); }
    catch (error) {
      if (generation !== this.#generation) return null;
      throw error;
    }
    if (generation !== this.#generation) {
      stopStream(stream);
      return null;
    }
    this.#stream = stream;
    return stream;
  }

  async switchDevice(deviceId, install) {
    if (!this.#stream || this.#switchOperation) return null;
    const previous = this.#stream;
    const previousDeviceId = previous.getVideoTracks?.()[0]?.getSettings?.().deviceId;
    const generation = this.#generation;
    const operation = { candidates: new Set() };
    this.#switchOperation = operation;
    const current = () => generation === this.#generation && this.#switchOperation === operation;
    const discard = (candidate) => {
      if (operation.candidates.delete(candidate)) stopStream(candidate);
    };
    const acquire = async (id) => {
      const candidate = await this.#getUserMedia({ video: id ? { deviceId: { exact: id } } : true, audio: false });
      if (!current()) { stopStream(candidate); return null; }
      operation.candidates.add(candidate);
      return candidate;
    };
    const accept = async (candidate) => {
      if (!candidate) return null;
      let accepted;
      try { accepted = await install(candidate); }
      catch (error) { discard(candidate); throw error; }
      if (!current() || accepted !== true) { discard(candidate); return null; }
      operation.candidates.delete(candidate);
      this.#stream = candidate;
      return candidate;
    };
    let released = false;
    try {
      let candidate;
      try { candidate = await acquire(deviceId); }
      catch (error) {
        if (!current()) return null;
        if (!['NotReadableError', 'AbortError'].includes(error.name)) throw error;
        // Some devices cannot open a second camera until the first releases
        // its hardware. The invitation and peer connection stay open.
        released = true;
        this.#stream = null;
        stopStream(previous);
        candidate = await acquire(deviceId);
      }
      const installed = await accept(candidate);
      if (installed && !released) stopStream(previous);
      return installed;
    } catch (error) {
      if (!current()) return null;
      if (!released) throw error;
      try { await accept(await acquire(previousDeviceId)); }
      catch { /* Preserve the switch failure even if restoring hardware fails. */ }
      if (!current()) return null;
      throw error;
    } finally {
      if (this.#switchOperation === operation) {
        this.#switchOperation = null;
        operation.candidates.forEach(stopStream);
        operation.candidates.clear();
      }
    }
  }

  stop() {
    this.#generation += 1;
    const stream = this.#stream;
    const operation = this.#switchOperation;
    this.#stream = null;
    this.#switchOperation = null;
    operation?.candidates.forEach(stopStream);
    operation?.candidates.clear();
    stopStream(stream);
  }
}
