// A permission prompt can outlive the session that opened it. Generation checks
// close that late stream before a stopped camera can become active again.
export class CameraCapture {
  #getUserMedia;
  #generation = 0;
  #stream = null;

  constructor({ getUserMedia = (constraints) => navigator.mediaDevices.getUserMedia(constraints) } = {}) {
    this.#getUserMedia = getUserMedia;
  }

  get active() { return this.#stream !== null; }

  async start(constraints) {
    this.stop();
    const generation = this.#generation;
    let stream;
    try { stream = await this.#getUserMedia({ ...constraints, audio: false }); }
    catch (error) {
      if (generation !== this.#generation) return null;
      throw error;
    }
    if (generation !== this.#generation) {
      stream.getTracks().forEach((track) => track.stop());
      return null;
    }
    this.#stream = stream;
    return stream;
  }

  stop() {
    this.#generation += 1;
    const stream = this.#stream;
    this.#stream = null;
    stream?.getTracks().forEach((track) => track.stop());
  }
}
