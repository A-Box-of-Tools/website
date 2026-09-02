/**
 * The timeline: the bar under the picture or the sound, with every segment
 * drawn on it.
 *
 * GENERATED INTO EACH TOOL. This file lives at shared/js/timeline.js and the
 * build copies it to <tool>/src/shared/timeline.js for the tools that ask for
 * it with `js_parts = ["timeline", "format", ...]`: the video cutter and the
 * audio trimmer. It imports `format` for the clock.
 *
 * It shows the whole recording once and the marks in place on it, which is
 * the thing a table of times cannot do - whether you have covered the middle
 * twenty minutes or left a gap in it is a question about shapes, and this is
 * the shape.
 *
 * What is drawn:
 *
 *   - **A band for every finished segment.** The one being edited carries a
 *     handle at each end; the rest are one click away from becoming it.
 *     Handles on all of them at once would be a row of grips too close
 *     together to hit.
 *   - **The segment still being marked**, from where `i` was pressed to
 *     wherever the playhead has got to, so an open mark is visibly open.
 *   - **The playhead.**
 *   - **Whatever the tool puts underneath.** The two tools carried this file
 *     apart from that layer and two rules about it: the video cutter draws a
 *     tick at every keyframe, because those are the only places a lossless
 *     cut can begin, and lands every mark on the nearest frame; the audio
 *     trimmer draws the waveform, because the shape of the sound is what
 *     helps, and lets a mark sit on any sample. Each keeps those in a subclass
 *     of this - the `layer` it hands the constructor, `decorate()` for what to
 *     draw on it when the source changes, and `snap()` for where a mark lands.
 *
 * It keeps its state in seconds and draws in percentages, so the same marks
 * survive the window being resized and a phone being turned. Nothing here
 * reads the file; it is handed times and hands times back.
 */

import { clockText as formatTime } from './format.js';

/** m:ss.mmm - the one clock every timeline here shows; format.js says why it rounds once. */
export { formatTime };

function clamp(value, low, high) {
  return Math.max(low, Math.min(high, value));
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
  #bands;
  #pendingBand;
  #playhead;
  #onSeek;
  #onSelect;
  #onAdjust;
  #bandTitle;
  #minSegment;

  #duration = 0;
  #segments = [];
  #selectedId = null;
  #pending = null;
  #playAt = 0;
  #enabled = true;

  /**
   * @param {HTMLElement} root
   * @param {object} options
   * @param {Function} options.onSeek  (seconds) the visitor pointed at a time
   * @param {Function} options.onSelect  (id) a band was clicked
   * @param {Function} options.onAdjust  (id, {start, end}) a handle was dragged
   * @param {(n: number, from: string, to: string) => string} options.bandTitle
   *   a band's tooltip - its number and its two times as a sentence, which
   *   only the page can say in the visitor's language
   * @param {number} options.minSegment  the shortest segment a drag will
   *   leave behind, in seconds
   * @param {HTMLElement} [options.layer]  what the subclass draws under the
   *   bands: a canvas, a row of ticks
   */
  constructor(root, {
    onSeek, onSelect, onAdjust, bandTitle, minSegment = 0.05, layer = null,
  } = {}) {
    this.#root = root;
    this.#onSeek = onSeek;
    this.#onSelect = onSelect;
    this.#onAdjust = onAdjust;
    this.#bandTitle = bandTitle;
    this.#minSegment = minSegment;

    root.innerHTML = '';
    root.classList.add('timeline');

    this.#track = document.createElement('div');
    this.#track.className = 'tl-track';

    this.#bands = document.createElement('div');
    this.#bands.className = 'tl-bands';

    this.#pendingBand = document.createElement('div');
    this.#pendingBand.className = 'tl-pending';
    this.#pendingBand.hidden = true;

    this.#playhead = document.createElement('div');
    this.#playhead.className = 'tl-playhead';
    this.#playhead.setAttribute('aria-hidden', 'true');

    if (layer) this.#track.append(layer);
    this.#track.append(this.#bands, this.#pendingBand, this.#playhead);
    root.append(this.#track);

    this.#track.addEventListener('pointerdown', this.#onPointerDown);
  }

  /* ---------------------------------------------------------------- state */

  get duration() {
    return this.#duration;
  }

  /**
   * Point the bar at a new recording. Everything but `duration` is handed to
   * `decorate()`, which is the subclass's to read.
   *
   * @param {object} source
   * @param {number} source.duration
   */
  setSource({ duration, ...rest }) {
    this.#duration = Math.max(0, duration || 0);
    this.#playAt = 0;
    this.#pending = null;
    this.#segments = [];
    this.#selectedId = null;
    this.decorate(rest);
    this.#paint();
  }

  /** What to draw under the bands for this source. The bar itself draws nothing there. */
  decorate() {}

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
    this.#playhead.style.left = `${this.fraction(this.#playAt) * 100}%`;
    this.#paintPending();
  }

  /**
   * Where a mark lands: anywhere inside the recording, unless the subclass
   * knows of somewhere better, such as the nearest frame.
   */
  snap(seconds) {
    return clamp(seconds, 0, this.#duration);
  }

  /* -------------------------------------------------------------- drawing */

  /** A time as a fraction of the whole, for placing anything along the bar. */
  fraction(seconds) {
    return this.#duration > 0 ? clamp(seconds / this.#duration, 0, 1) : 0;
  }

  #paint() {
    this.#bands.innerHTML = '';

    this.#segments.forEach((segment, index) => {
      if (segment.end === null) return;   // still open; drawn as the pending band

      const from = this.fraction(segment.start) * 100;
      const to = this.fraction(segment.end) * 100;
      const band = document.createElement('div');
      band.className = `tl-band${segment.id === this.#selectedId ? ' selected' : ''}`;
      band.dataset.id = String(segment.id);
      band.style.left = `${from}%`;
      band.style.width = `${Math.max(0.4, to - from)}%`;
      band.title = this.#bandTitle?.(index + 1, formatTime(segment.start), formatTime(segment.end))
        ?? String(index + 1);

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
    const from = this.fraction(Math.min(this.#pending, this.#playAt)) * 100;
    const to = this.fraction(Math.max(this.#pending, this.#playAt)) * 100;
    this.#pendingBand.hidden = false;
    this.#pendingBand.style.left = `${from}%`;
    this.#pendingBand.style.width = `${Math.max(0.3, to - from)}%`;
  }

  /* ---------------------------------------------------------- interaction */

  /** Where along the recording a pointer is, in seconds. */
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
        ? { start: Math.min(snapped, segment.end - this.#minSegment), end: segment.end }
        : { start: segment.start, end: Math.max(snapped, segment.start + this.#minSegment) };

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
