/**
 * The timeline: the bar under the picture, with every segment drawn on it.
 *
 * It shows the whole video once and the marks in place on it, which is the
 * thing a table of times cannot do - whether you have covered the middle
 * twenty minutes or left a gap in it is a question about shapes, and this is
 * the shape.
 *
 * What is drawn:
 *
 *   - **A band for every finished segment.** The one being edited carries a
 *     handle at each end; the rest are one click away from becoming it. Handles
 *     on all of them at once would be a row of grips too close together to hit.
 *   - **The segment still being marked**, from where `i` was pressed to wherever
 *     the playhead has got to, so an open mark is visibly open.
 *   - **A tick for every keyframe**, because those are the only places a
 *     lossless cut can begin, and showing them beats explaining afterwards why
 *     a cut started early.
 *   - **The playhead.**
 *
 * It keeps its state in seconds and draws in percentages, so the same marks
 * survive the window being resized and a phone being turned. Nothing here reads
 * the file; it is handed times and hands times back.
 */

/** The shortest segment a drag will leave behind. */
const MIN_SEGMENT = 0.05;

/** Above this many keyframes the ticks are thinned, because a tick every pixel
 *  is a solid bar rather than a set of marks. */
const MAX_TICKS = 400;

function clamp(value, low, high) {
  return Math.max(low, Math.min(high, value));
}

/** mm:ss.mmm, which is short enough to read and exact enough to type back. */
export function formatTime(seconds) {
  const safe = Math.max(0, seconds || 0);
  const whole = Math.floor(safe);
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const rest = whole % 60;
  const millis = Math.round((safe - whole) * 1000);
  const tail = `${String(rest).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
  return hours
    ? `${hours}:${String(minutes).padStart(2, '0')}:${tail}`
    : `${minutes}:${tail}`;
}

/**
 * The reverse: "1:23.5", "83.5" and "0:01:23.500" all mean the same instant.
 * @returns {number|null} seconds, or null if it is not a time at all.
 */
export function parseTime(text) {
  const trimmed = String(text ?? '').trim();
  if (!trimmed) return null;

  const parts = trimmed.split(':');
  if (parts.length > 3) return null;

  let total = 0;
  for (const part of parts) {
    if (!/^\d*\.?\d*$/.test(part) || part === '' || part === '.') return null;
    total = total * 60 + Number(part);
  }
  return Number.isFinite(total) ? total : null;
}

export class Timeline {
  #root;
  #track;
  #ticks;
  #bands;
  #pendingBand;
  #playhead;
  #onSeek;
  #onSelect;
  #onAdjust;

  #duration = 0;
  #frameTimes = null;
  #segments = [];
  #selectedId = null;
  #pending = null;
  #playAt = 0;
  #enabled = true;

  /**
   * @param {HTMLElement} root
   * @param {{onSeek: Function, onSelect: Function, onAdjust: Function}} options
   */
  constructor(root, { onSeek, onSelect, onAdjust } = {}) {
    this.#root = root;
    this.#onSeek = onSeek;
    this.#onSelect = onSelect;
    this.#onAdjust = onAdjust;

    root.innerHTML = '';
    root.classList.add('timeline');

    this.#track = document.createElement('div');
    this.#track.className = 'tl-track';

    this.#ticks = document.createElement('div');
    this.#ticks.className = 'tl-ticks';
    this.#ticks.setAttribute('aria-hidden', 'true');

    this.#bands = document.createElement('div');
    this.#bands.className = 'tl-bands';

    this.#pendingBand = document.createElement('div');
    this.#pendingBand.className = 'tl-pending';
    this.#pendingBand.hidden = true;

    this.#playhead = document.createElement('div');
    this.#playhead.className = 'tl-playhead';
    this.#playhead.setAttribute('aria-hidden', 'true');

    this.#track.append(this.#ticks, this.#bands, this.#pendingBand, this.#playhead);
    root.append(this.#track);

    this.#track.addEventListener('pointerdown', this.#onPointerDown);
  }

  /* ---------------------------------------------------------------- state */

  get duration() {
    return this.#duration;
  }

  /**
   * @param {object} source
   * @param {number} source.duration
   * @param {number[]} [source.keyframes]  presentation times, ascending
   * @param {number[]} [source.frameTimes] every frame's time, ascending
   */
  setSource({ duration, keyframes = null, frameTimes = null }) {
    this.#duration = Math.max(0, duration || 0);
    this.#frameTimes = frameTimes && frameTimes.length ? frameTimes : null;
    this.#playAt = 0;
    this.#pending = null;
    this.#segments = [];
    this.#selectedId = null;
    this.#drawTicks(keyframes);
    this.#paint();
  }

  /** @param {object[]} segments  [{ id, start, end }], end null while open. */
  setSegments(segments, selectedId = null) {
    this.#segments = segments;
    this.#selectedId = selectedId;
    this.#paint();
  }

  /** Where `i` was pressed, while `o` has not been. */
  setPending(startSeconds) {
    this.#pending = startSeconds;
    this.#paintPending();
  }

  setEnabled(enabled) {
    this.#enabled = enabled;
    this.#root.classList.toggle('disabled', !enabled);
  }

  setPlayhead(seconds) {
    this.#playAt = clamp(seconds || 0, 0, this.#duration);
    this.#playhead.style.left = `${this.#fraction(this.#playAt) * 100}%`;
    this.#paintPending();
  }

  /** The nearest frame to a time, where the frames are known. */
  snap(seconds) {
    const times = this.#frameTimes;
    if (!times) return clamp(seconds, 0, this.#duration);

    let low = 0;
    let high = times.length - 1;
    while (low < high) {
      const middle = (low + high) >> 1;
      if (times[middle] < seconds) low = middle + 1;
      else high = middle;
    }

    const after = times[low];
    const before = low > 0 ? times[low - 1] : after;
    const nearest = Math.abs(after - seconds) < Math.abs(seconds - before) ? after : before;
    return clamp(nearest, 0, this.#duration);
  }

  /** One frame, in seconds - the step the fine controls take. */
  get frameStep() {
    const times = this.#frameTimes;
    if (!times || times.length < 2) return 1 / 30;
    return Math.max(1 / 240, (times[times.length - 1] - times[0]) / (times.length - 1));
  }

  /* -------------------------------------------------------------- drawing */

  #fraction(seconds) {
    return this.#duration > 0 ? clamp(seconds / this.#duration, 0, 1) : 0;
  }

  #drawTicks(keyframes) {
    this.#ticks.innerHTML = '';
    if (!keyframes || !keyframes.length || !this.#duration) return;

    const step = Math.max(1, Math.ceil(keyframes.length / MAX_TICKS));
    for (let i = 0; i < keyframes.length; i += step) {
      const tick = document.createElement('span');
      tick.className = 'tl-tick';
      tick.style.left = `${this.#fraction(keyframes[i]) * 100}%`;
      this.#ticks.append(tick);
    }
  }

  #paint() {
    this.#bands.innerHTML = '';

    this.#segments.forEach((segment, index) => {
      if (segment.end === null) return;   // still open; drawn as the pending band

      const from = this.#fraction(segment.start) * 100;
      const to = this.#fraction(segment.end) * 100;
      const band = document.createElement('div');
      band.className = `tl-band${segment.id === this.#selectedId ? ' selected' : ''}`;
      band.dataset.id = String(segment.id);
      band.style.left = `${from}%`;
      band.style.width = `${Math.max(0.4, to - from)}%`;
      band.title = `Segment ${index + 1}: ${formatTime(segment.start)} to ${formatTime(segment.end)}`;

      const number = document.createElement('span');
      number.className = 'tl-band-number';
      number.textContent = String(index + 1);
      band.append(number);

      if (segment.id === this.#selectedId) {
        for (const which of ['start', 'end']) {
          const handle = document.createElement('span');
          handle.className = `tl-handle tl-handle-${which}`;
          handle.dataset.handle = which;
          band.append(handle);
        }
      }

      this.#bands.append(band);
    });

    this.setPlayhead(this.#playAt);
  }

  /** The open segment, from where it began to wherever the playhead is now. */
  #paintPending() {
    if (this.#pending === null || !this.#duration) {
      this.#pendingBand.hidden = true;
      return;
    }
    const from = this.#fraction(Math.min(this.#pending, this.#playAt)) * 100;
    const to = this.#fraction(Math.max(this.#pending, this.#playAt)) * 100;
    this.#pendingBand.hidden = false;
    this.#pendingBand.style.left = `${from}%`;
    this.#pendingBand.style.width = `${Math.max(0.3, to - from)}%`;
  }

  /* ---------------------------------------------------------- interaction */

  /** Where along the video a pointer is, in seconds. */
  #timeAt(event) {
    const box = this.#track.getBoundingClientRect();
    if (!box.width) return 0;
    return clamp((event.clientX - box.left) / box.width, 0, 1) * this.#duration;
  }

  #onPointerDown = (event) => {
    if (!this.#enabled || !this.#duration || event.button !== 0) return;

    const handle = event.target.closest('.tl-handle');
    const band = event.target.closest('.tl-band');
    const at = this.#timeAt(event);

    event.preventDefault();

    // A band that is not the one being edited becomes it, and nothing else
    // happens - the first click on a segment should never also move it.
    if (band && !handle && band.dataset.id !== String(this.#selectedId)) {
      this.#onSelect?.(Number(band.dataset.id));
      return;
    }

    if (!handle) {
      this.#onSeek?.(at);
      this.#drag = { kind: 'seek' };
    } else {
      const segment = this.#segments.find((one) => one.id === this.#selectedId);
      if (!segment) return;
      this.#drag = { kind: handle.dataset.handle, segment };
    }

    this.#track.setPointerCapture?.(event.pointerId);

    const move = (moveEvent) => {
      const now = this.#timeAt(moveEvent);
      if (this.#drag.kind === 'seek') {
        this.#onSeek?.(now);
        return;
      }

      const { segment } = this.#drag;
      const snapped = this.snap(now);
      const next = this.#drag.kind === 'start'
        ? { start: Math.min(snapped, segment.end - MIN_SEGMENT), end: segment.end }
        : { start: segment.start, end: Math.max(snapped, segment.start + MIN_SEGMENT) };

      this.#onAdjust?.(segment.id, {
        start: clamp(next.start, 0, this.#duration),
        end: clamp(next.end, 0, this.#duration),
      });
      this.#onSeek?.(this.#drag.kind === 'start' ? next.start : next.end);
    };

    const up = () => {
      this.#drag = null;
      this.#track.releasePointerCapture?.(event.pointerId);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  };

  #drag = null;
}
