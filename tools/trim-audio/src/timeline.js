/**
 * The timeline: the waveform, with every marked part drawn on top of it.
 *
 * The video cutter next door draws a plain bar with a tick at every keyframe,
 * because a keyframe is the only thing about a video that constrains where a
 * cut may land. Audio has no such constraint - a cut can land on any sample -
 * so the ticks are gone and the space is given to the thing that actually
 * helps: the shape of the sound. Silence looks like silence, a cough looks
 * like a cough, and the four seconds of room tone before somebody starts
 * talking are visible without hunting for them.
 *
 * What is drawn:
 *
 *   - **The waveform**, summarised once when the file is opened and reduced to
 *     the width of the bar on every paint. See waveform.js.
 *   - **A band for every finished part.** The one being edited carries a handle
 *     at each end; the rest are one click away from becoming it. Handles on all
 *     of them at once would be a row of grips too close together to hit.
 *   - **The part still being marked**, from where `i` was pressed to wherever
 *     the playhead has got to, so an open mark is visibly open.
 *   - **The playhead.**
 *
 * It keeps its state in seconds and draws in percentages, so the same marks
 * survive the window being resized and a phone being turned. Nothing here
 * reads a file; it is handed times and hands times back.
 */

import { drawWaveform } from './waveform.js';

/** The shortest part a drag will leave behind. */
const MIN_SEGMENT = 0.02;

function clamp(value, low, high) {
  return Math.max(low, Math.min(high, value));
}

/**
 * mm:ss.mmm, which is short enough to read and exact enough to type back.
 *
 * Rounded to milliseconds once, before it is taken apart: flooring the seconds
 * and rounding the fraction separately writes 3.9996 as `0:03.1000`, which is
 * four digits in a three-digit field and parses back as 3.1. This label is not
 * only read - it is what a row's time box is filled with, so a number that
 * cannot be read back is a mark that moves nine tenths of a second when
 * somebody edits the row beside it.
 */
export function formatTime(seconds) {
  const total = Math.round(Math.max(0, seconds || 0) * 1000);
  const whole = Math.floor(total / 1000);
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const tail = `${String(whole % 60).padStart(2, '0')}.${String(total % 1000).padStart(3, '0')}`;
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
  #canvas;
  #bands;
  #pendingBand;
  #playhead;
  #onSeek;
  #onSelect;
  #onAdjust;

  #duration = 0;
  #summary = null;
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

    this.#canvas = document.createElement('canvas');
    this.#canvas.className = 'tl-wave';
    this.#canvas.setAttribute('aria-hidden', 'true');

    this.#bands = document.createElement('div');
    this.#bands.className = 'tl-bands';

    this.#pendingBand = document.createElement('div');
    this.#pendingBand.className = 'tl-pending';
    this.#pendingBand.hidden = true;

    this.#playhead = document.createElement('div');
    this.#playhead.className = 'tl-playhead';
    this.#playhead.setAttribute('aria-hidden', 'true');

    this.#track.append(this.#canvas, this.#bands, this.#pendingBand, this.#playhead);
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
   * @param {object} [source.summary]  what waveform.js summarised, or null
   */
  setSource({ duration, summary = null }) {
    this.#duration = Math.max(0, duration || 0);
    this.#summary = summary;
    this.#playAt = 0;
    this.#pending = null;
    this.#segments = [];
    this.#selectedId = null;
    this.redraw();
    this.#paint();
  }

  /** Draw the waveform again, at whatever size the bar is now. */
  redraw() {
    if (this.#canvas.clientWidth) drawWaveform(this.#canvas, this.#summary);
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

  /**
   * Where a mark lands.
   *
   * On the video cutter this snaps to the nearest frame, because a video has
   * frames to snap to. Audio does not: every sample is its own instant and a
   * mark is allowed to sit on any of them, so all this does is keep the time
   * inside the recording. Left as a method rather than deleted so the two
   * tools read the same way, and so the page has one place to say that no
   * snapping happens.
   */
  snap(seconds) {
    return clamp(seconds, 0, this.#duration);
  }

  /** The step the fine controls take: ten milliseconds, which is about the
   *  shortest move that can be heard as a move. */
  get fineStep() {
    return 0.01;
  }

  /* -------------------------------------------------------------- drawing */

  #fraction(seconds) {
    return this.#duration > 0 ? clamp(seconds / this.#duration, 0, 1) : 0;
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
      band.title = `Part ${index + 1}: ${formatTime(segment.start)} to ${formatTime(segment.end)}`;

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

  /** The open part, from where it began to wherever the playhead is now. */
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
    // happens - the first click on a part should never also move it.
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
