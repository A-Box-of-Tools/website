/**
 * The timeline: the bar under the preview with a start mark, an end mark and a
 * playhead.
 *
 * It keeps its state in seconds, because that is what the fields underneath it
 * show and what the export is given, and it draws itself in percentages, so the
 * same pair of marks survives the window being resized and a phone being
 * turned.
 *
 * Two things here are worth more than the drag handling, which is ordinary:
 *
 *   - **The marks snap to frames.** Where the file has been read, every frame's
 *     time is known, and a mark is put on the nearest one rather than on
 *     whatever fraction of a second the pointer happened to land on. A cut
 *     between two frames does not exist - it has to become one or the other -
 *     so it may as well become the one you were shown.
 *   - **The keyframes are drawn.** They are the only places a lossless cut can
 *     begin, so the page shows where they are instead of explaining afterwards
 *     why the result started early.
 *
 * Nothing here reads the file. It is handed a list of times and returns a pair
 * of them.
 */

/** The shortest section the marks will make, in seconds. */
const MIN_SECTION = 0.05;

/** Above this many keyframes the marks are thinned out, because a tick every
 *  pixel is a solid bar rather than a set of marks. */
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
  #selection;
  #startHandle;
  #endHandle;
  #shadeBefore;
  #shadeAfter;
  #playhead;
  #onChange;
  #onSeek;

  #duration = 0;
  #frameTimes = null;
  #start = 0;
  #end = 0;
  #playAt = 0;
  #mode = 'keep';
  #enabled = true;
  #drag = null;

  /**
   * @param {HTMLElement} root
   * @param {{onChange: Function, onSeek: Function}} options
   */
  constructor(root, { onChange, onSeek } = {}) {
    this.#root = root;
    this.#onChange = onChange;
    this.#onSeek = onSeek;

    root.innerHTML = '';
    root.classList.add('timeline');

    this.#track = document.createElement('div');
    this.#track.className = 'tl-track';

    this.#ticks = document.createElement('div');
    this.#ticks.className = 'tl-ticks';
    this.#ticks.setAttribute('aria-hidden', 'true');

    this.#shadeBefore = document.createElement('div');
    this.#shadeBefore.className = 'tl-shade tl-shade-before';
    this.#shadeAfter = document.createElement('div');
    this.#shadeAfter.className = 'tl-shade tl-shade-after';

    this.#selection = document.createElement('div');
    this.#selection.className = 'tl-selection';

    this.#startHandle = this.#makeHandle('start', 'Start of the section');
    this.#endHandle = this.#makeHandle('end', 'End of the section');

    this.#playhead = document.createElement('div');
    this.#playhead.className = 'tl-playhead';
    this.#playhead.setAttribute('aria-hidden', 'true');

    this.#selection.append(this.#startHandle, this.#endHandle);
    this.#track.append(
      this.#ticks, this.#shadeBefore, this.#shadeAfter, this.#selection, this.#playhead);
    root.append(this.#track);

    this.#track.addEventListener('pointerdown', this.#onTrackDown);
  }

  #makeHandle(which, label) {
    const handle = document.createElement('div');
    handle.className = `tl-handle tl-handle-${which}`;
    handle.dataset.handle = which;
    handle.tabIndex = 0;
    handle.setAttribute('role', 'slider');
    handle.setAttribute('aria-label',
      `${label}. The arrow keys move it one frame, Shift and the arrow keys one second.`);
    handle.addEventListener('keydown', this.#onKeyDown);
    return handle;
  }

  /* ---------------------------------------------------------------- state */

  get range() {
    return { start: this.#start, end: this.#end };
  }

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
    this.#start = 0;
    this.#end = this.#duration;
    this.#playAt = 0;
    this.#drawTicks(keyframes);
    this.#paint();
    this.#emit();
  }

  setMode(mode) {
    this.#mode = mode;
    this.#root.classList.toggle('removing', mode === 'remove');
  }

  setEnabled(enabled) {
    this.#enabled = enabled;
    this.#root.classList.toggle('disabled', !enabled);
  }

  setPlayhead(seconds) {
    this.#playAt = clamp(seconds || 0, 0, this.#duration);
    this.#playhead.style.left = `${this.#fraction(this.#playAt) * 100}%`;
  }

  /** Move one mark, from a typed field or a button. */
  setRange({ start, end }, { snap = true } = {}) {
    const next = {
      start: start === undefined ? this.#start : start,
      end: end === undefined ? this.#end : end,
    };
    this.#apply(next, { snap, moved: start !== undefined ? 'start' : 'end' });
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

  /** One frame, in seconds - the step the arrow keys take. */
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
    const from = this.#fraction(this.#start) * 100;
    const to = this.#fraction(this.#end) * 100;

    this.#selection.style.left = `${from}%`;
    this.#selection.style.width = `${Math.max(0, to - from)}%`;
    this.#shadeBefore.style.width = `${from}%`;
    this.#shadeAfter.style.left = `${to}%`;
    this.#shadeAfter.style.width = `${Math.max(0, 100 - to)}%`;
    this.#playhead.style.left = `${this.#fraction(this.#playAt) * 100}%`;

    for (const [handle, value] of [[this.#startHandle, this.#start], [this.#endHandle, this.#end]]) {
      handle.setAttribute('aria-valuemin', '0');
      handle.setAttribute('aria-valuemax', this.#duration.toFixed(3));
      handle.setAttribute('aria-valuenow', value.toFixed(3));
      handle.setAttribute('aria-valuetext', formatTime(value));
    }
  }

  /**
   * Round, keep the marks in order and inside the clip, draw, and report.
   *
   * Which mark moved decides which one gives way when they meet: dragging the
   * start past the end should push the end along, not silently swap the two.
   */
  #apply({ start, end }, { snap = true, moved = 'start' } = {}) {
    if (!this.#duration) return;

    let from = clamp(snap ? this.snap(start) : start, 0, this.#duration);
    let to = clamp(snap ? this.snap(end) : end, 0, this.#duration);

    if (to - from < MIN_SECTION) {
      if (moved === 'start') from = Math.max(0, Math.min(from, to - MIN_SECTION));
      else to = Math.min(this.#duration, Math.max(to, from + MIN_SECTION));
      if (to - from < MIN_SECTION) {
        from = Math.max(0, Math.min(from, this.#duration - MIN_SECTION));
        to = Math.min(this.#duration, from + MIN_SECTION);
      }
    }

    this.#start = from;
    this.#end = to;
    this.#paint();
    this.#emit();
  }

  #emit() {
    this.#onChange?.({ start: this.#start, end: this.#end });
  }

  /* ---------------------------------------------------------- interaction */

  /** Where along the clip a pointer is, in seconds. */
  #timeAt(event) {
    const box = this.#track.getBoundingClientRect();
    if (!box.width) return 0;
    return clamp((event.clientX - box.left) / box.width, 0, 1) * this.#duration;
  }

  #onTrackDown = (event) => {
    if (!this.#enabled || !this.#duration || event.button !== 0) return;

    const handle = event.target.closest('.tl-handle');
    const onSelection = !handle && event.target.closest('.tl-selection');
    const at = this.#timeAt(event);

    // Anywhere that is not a mark or the band between them is a scrub: the
    // playhead goes there and follows the pointer until it is let go.
    if (!handle && !onSelection) {
      this.#onSeek?.(at);
      this.#drag = { kind: 'seek' };
    } else if (handle) {
      this.#drag = { kind: handle.dataset.handle, grabbedAt: at };
      handle.focus();
    } else {
      this.#drag = {
        kind: 'move', grabbedAt: at, start: this.#start, end: this.#end,
      };
    }

    event.preventDefault();
    this.#track.setPointerCapture?.(event.pointerId);

    const move = (moveEvent) => {
      const now = this.#timeAt(moveEvent);
      if (this.#drag.kind === 'seek') {
        this.#onSeek?.(now);
      } else if (this.#drag.kind === 'start') {
        this.#apply({ start: now, end: this.#end }, { moved: 'start' });
        this.#onSeek?.(this.#start);
      } else if (this.#drag.kind === 'end') {
        this.#apply({ start: this.#start, end: now }, { moved: 'end' });
        this.#onSeek?.(this.#end);
      } else {
        const shift = now - this.#drag.grabbedAt;
        const span = this.#drag.end - this.#drag.start;
        const from = clamp(this.#drag.start + shift, 0, this.#duration - span);
        this.#apply({ start: from, end: from + span }, { snap: false });
      }
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

  #onKeyDown = (event) => {
    if (!this.#enabled) return;

    const direction = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
    if (!direction) return;
    event.preventDefault();

    const step = direction * (event.shiftKey ? 1 : this.frameStep);
    const which = event.currentTarget.dataset.handle;

    if (which === 'start') {
      this.#apply({ start: this.#start + step, end: this.#end }, { moved: 'start' });
      this.#onSeek?.(this.#start);
    } else {
      this.#apply({ start: this.#start, end: this.#end + step }, { moved: 'end' });
      this.#onSeek?.(this.#end);
    }
  };
}
