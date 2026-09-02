/**
 * The audio trimmer's timeline: the shared bar (shared/js/timeline.js) with
 * the waveform drawn under the marks.
 *
 * The video cutter next door draws a tick at every keyframe, because a
 * keyframe is the only thing about a video that constrains where a cut may
 * land. Audio has no such constraint - a cut can land on any sample - so the
 * ticks are gone and the space is given to the thing that actually helps: the
 * shape of the sound. Silence looks like silence, a cough looks like a cough,
 * and the four seconds of room tone before somebody starts talking are
 * visible without hunting for them. See waveform.js for how it is summarised.
 *
 * Nothing snaps: the shared bar's own `snap()` keeps a mark inside the
 * recording and that is all a mark here needs.
 */

import { drawWaveform } from './waveform.js';
import { Timeline as Bar, formatTime, parseTime } from './shared/timeline.js';

export { formatTime, parseTime };

/** The shortest part a drag will leave behind. */
const MIN_SEGMENT = 0.02;

export class Timeline extends Bar {
  #canvas;
  #summary = null;

  /**
   * @param {HTMLElement} root
   * @param {{onSeek: Function, onSelect: Function, onAdjust: Function, bandTitle: Function}} options
   */
  constructor(root, options = {}) {
    const canvas = document.createElement('canvas');
    canvas.className = 'tl-wave';
    canvas.setAttribute('aria-hidden', 'true');
    super(root, { ...options, layer: canvas, minSegment: MIN_SEGMENT });
    this.#canvas = canvas;
  }

  /**
   * @param {object} source  what setSource() was given, less the duration
   * @param {object} [source.summary]  what waveform.js summarised, or null
   */
  decorate({ summary = null } = {}) {
    this.#summary = summary;
    this.redraw();
  }

  /** Draw the waveform again, at whatever size the bar is now. */
  redraw() {
    if (this.#canvas.clientWidth) drawWaveform(this.#canvas, this.#summary);
  }

  /** The step the fine controls take: ten milliseconds, which is about the
   *  shortest move that can be heard as a move. */
  get fineStep() {
    return 0.01;
  }
}
