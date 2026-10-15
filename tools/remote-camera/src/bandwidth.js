export const DEFAULT_VIDEO_BUDGET = 6_000_000;
export const MAX_VIEWERS = 8;
const MIN_VIDEO_BUDGET = 1_000_000;
const MAX_VIDEO_BUDGET = 10_000_000;
const MAX_VIEWER_BITRATE = 1_500_000;
const ADMISSION_BITRATE = 250_000;

export function normalizeVideoBudget(value) {
  const bits = Number(value);
  return Number.isFinite(bits) && bits > 0
    ? Math.floor(Math.min(MAX_VIDEO_BUDGET, Math.max(MIN_VIDEO_BUDGET, bits)))
    : DEFAULT_VIDEO_BUDGET;
}

export function viewerLimit(budget = DEFAULT_VIDEO_BUDGET) {
  return Math.min(MAX_VIEWERS, Math.floor(normalizeVideoBudget(budget) / ADMISSION_BITRATE));
}

export function videoBitrate(viewers, budget = DEFAULT_VIDEO_BUDGET) {
  if (!Number.isSafeInteger(viewers) || viewers < 1) return 0;
  // Admission has a quality floor, but reducing a running budget must keep its
  // existing viewers without making their combined caps exceed that budget.
  return Math.min(MAX_VIEWER_BITRATE, Math.floor(normalizeVideoBudget(budget) / viewers));
}

export class VideoBandwidth {
  constructor({ current = () => true, onStatus = () => {} } = {}) {
    this.current = current;
    this.onStatus = onStatus;
    this.sequence = 0;
    this.desired = null;
    this.running = null;
  }

  update(entries, budget = DEFAULT_VIDEO_BUDGET) {
    const reserved = [...new Set(entries)].filter((entry) => this.current(entry));
    this.desired = {
      entries: reserved.map((entry) => ({ entry, sender: entry.sender })),
      budget: normalizeVideoBudget(budget),
      sequence: ++this.sequence,
    };
    // A change during setParameters replaces the waiting snapshot rather than
    // building an unbounded queue or reusing a stale parameters transaction.
    this.running ??= Promise.resolve().then(() => this.drain());
    return this.running;
  }

  valid(snapshot, entry, sender) {
    return snapshot.sequence === this.sequence && this.current(entry) && entry.sender === sender;
  }

  async apply(snapshot, entry, sender, bitrate) {
    if (!this.valid(snapshot, entry, sender)) return null;
    if (typeof sender.getParameters !== 'function' || typeof sender.setParameters !== 'function') return false;
    try {
      const parameters = sender.getParameters();
      const encodings = parameters?.encodings;
      // The encoding count and RIDs belong to the negotiated transceiver. An
      // empty array cannot be repaired by adding an encoding in setParameters.
      if (!Array.isArray(encodings) || !encodings.length) return false;
      const share = Math.floor(bitrate / encodings.length);
      // Negotiation may reset a previously applied cap. Read fresh parameters
      // even when the requested budget has not changed.
      if (encodings.every((encoding) => encoding.maxBitrate === share)) return true;
      encodings.forEach((encoding) => { encoding.maxBitrate = share; });
      await sender.setParameters(parameters);
      if (!this.valid(snapshot, entry, sender)) return null;
      const applied = sender.getParameters()?.encodings;
      if (!Array.isArray(applied) || applied.length !== encodings.length
          || applied.some((encoding) => encoding.maxBitrate !== share)) return false;
      return true;
    } catch {
      // A bitrate control is optional: failure must not stop the camera,
      // change capture constraints, or touch a microphone sender.
      return this.valid(snapshot, entry, sender) ? false : null;
    }
  }

  async drain() {
    let status = null;
    try {
      while (this.desired) {
        const snapshot = this.desired;
        this.desired = null;
        const bitrate = videoBitrate(snapshot.entries.length, snapshot.budget);
        let supported = true;
        for (const { entry, sender } of snapshot.entries) {
          if (snapshot.sequence !== this.sequence) break;
          // An accepted viewer reserves a share before its acknowledgement adds
          // a sender, allowing existing senders to be reduced first.
          if (!sender) continue;
          if (sender.track?.kind !== 'video' || !this.current(entry)) continue;
          const result = await this.apply(snapshot, entry, sender, bitrate);
          if (result === false) supported = false;
        }
        if (snapshot.sequence !== this.sequence) continue;
        status = { supported, viewers: snapshot.entries.length, budget: snapshot.budget, bitrate };
        this.onStatus(status);
      }
      return status;
    } finally {
      // Release the worker before its promise settles. A microtask reacting
      // to the last status can then start its own update instead of leaving
      // it stranded behind a worker that has already drained its snapshot.
      this.running = null;
    }
  }

  clear() {
    this.sequence += 1;
    this.desired = null;
  }
}
