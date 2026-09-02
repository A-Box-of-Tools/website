/**
 * The video cutter's timeline: the shared bar (shared/js/timeline.js) with a
 * tick at every keyframe, because those are the only places a lossless cut
 * can begin and showing them beats explaining afterwards why a cut started
 * early, and with every mark landing on a frame.
 */

import { Timeline as Bar, formatTime, parseTime } from './shared/timeline.js';

export { formatTime, parseTime };

/** The shortest segment a drag will leave behind. */
const MIN_SEGMENT = 0.05;

/** Above this many keyframes the ticks are thinned, because a tick every pixel
 *  is a solid bar rather than a set of marks. */
const MAX_TICKS = 400;

function clamp(value, low, high) {
  return Math.max(low, Math.min(high, value));
}

export class Timeline extends Bar {
  #ticks;
  #frameTimes = null;

  /**
   * @param {HTMLElement} root
   * @param {{onSeek: Function, onSelect: Function, onAdjust: Function, bandTitle: Function}} options
   */
  constructor(root, options = {}) {
    const ticks = document.createElement('div');
    ticks.className = 'tl-ticks';
    ticks.setAttribute('aria-hidden', 'true');
    super(root, { ...options, layer: ticks, minSegment: MIN_SEGMENT });
    this.#ticks = ticks;
  }

  /**
   * @param {object} source  what setSource() was given, less the duration
   * @param {number[]} [source.keyframes]  presentation times, ascending
   * @param {number[]} [source.frameTimes] every frame's time, ascending
   */
  decorate({ keyframes = null, frameTimes = null } = {}) {
    this.#frameTimes = frameTimes && frameTimes.length ? frameTimes : null;
    this.#drawTicks(keyframes);
  }

  /** The nearest frame to a time, where the frames are known. */
  snap(seconds) {
    const times = this.#frameTimes;
    if (!times) return clamp(seconds, 0, this.duration);

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
    return clamp(nearest, 0, this.duration);
  }

  /** One frame, in seconds - the step the fine controls take. */
  get frameStep() {
    const times = this.#frameTimes;
    if (!times || times.length < 2) return 1 / 30;
    return Math.max(1 / 240, (times[times.length - 1] - times[0]) / (times.length - 1));
  }

  #drawTicks(keyframes) {
    this.#ticks.innerHTML = '';
    if (!keyframes || !keyframes.length || !this.duration) return;

    const step = Math.max(1, Math.ceil(keyframes.length / MAX_TICKS));
    for (let i = 0; i < keyframes.length; i += step) {
      const tick = document.createElement('span');
      tick.className = 'tl-tick';
      tick.style.left = `${this.fraction(keyframes[i]) * 100}%`;
      this.#ticks.append(tick);
    }
  }
}
