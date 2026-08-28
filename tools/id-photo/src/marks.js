/**
 * The four dots you drag onto the face.
 *
 * The crown, the chin and the two pupils. Between them they fix everything a
 * specification constrains - how tall the head is and where the eye line falls -
 * so the crop box can be placed exactly rather than eyeballed. geometry.js
 * explains that arithmetic; this file is only the dragging.
 *
 * The dots live in the coordinates of the picture, not of the crop box, so
 * moving or resizing the box does not move them: the marks describe the face,
 * and the face does not move when you change your mind about the framing. They
 * are drawn in percentages of the stage, so a window resize costs nothing.
 *
 * WHERE THEY START is not this file's business. detect.js measures the picture
 * and main.js hands the answer to `place`; when there is nothing to measure, or
 * when somebody has asked to do it themselves, `open` puts them where a
 * head-and-shoulders photograph usually has them. Both are starting positions
 * and the page says which one it used - a guess quietly presented as a
 * measurement would be worse than either.
 *
 * Every change reports WHY it happened, because the page says something
 * different about dots it worked out and dots you moved, and the only moment
 * either can be told apart is here.
 */

/**
 * The dots, in the order they are tabbed through.
 *
 * The name and the hint are phrase keys: this file is copied byte for byte
 * into fifteen languages, and the caller hands in the resolver.
 */
export const MARK_KEYS = [
  { key: 'crown', label: 'mark.crown', hint: 'mark.crown.hint' },
  { key: 'chin', label: 'mark.chin', hint: 'mark.chin.hint' },
  { key: 'leftEye', label: 'mark.lefteye', hint: 'mark.lefteye.hint' },
  { key: 'rightEye', label: 'mark.righteye', hint: 'mark.righteye.hint' },
];

/** Where each dot opens, as fractions of the picture. */
const OPENING = {
  crown: { x: 0.5, y: 0.14 },
  chin: { x: 0.5, y: 0.54 },
  leftEye: { x: 0.42, y: 0.28 },
  rightEye: { x: 0.58, y: 0.28 },
};

export class Marks {
  #stage;
  #onChange;
  #dots = new Map();
  #source = { width: 0, height: 0 };
  #points = null;

  constructor(stage, { onChange, t } = {}) {
    this.#stage = stage;
    this.#onChange = onChange;

    for (const entry of MARK_KEYS) {
      const { key } = entry;
      const label = t(entry.label);
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = `face-mark mark-${key}`;
      dot.dataset.key = key;
      dot.hidden = true;
      dot.setAttribute('aria-label', t('mark.aria', { label, hint: t(entry.hint) }));

      const caption = document.createElement('span');
      caption.className = 'face-mark-label';
      caption.textContent = label;
      dot.append(caption);

      dot.addEventListener('pointerdown', this.#onPointerDown);
      dot.addEventListener('keydown', this.#onKeyDown);

      this.#dots.set(key, dot);
      stage.append(dot);
    }
  }

  get placed() {
    return this.#points !== null;
  }

  /** @returns {import('./geometry.js').Marks|null} in source pixels */
  get marks() {
    return this.#points ? structuredClone(this.#points) : null;
  }

  setSource(width, height) {
    this.#source = { width, height };
    this.#points = null;
    this.hide();
  }

  /** Put the dots on the picture at their opening positions. */
  open() {
    const { width, height } = this.#source;
    if (!width || !height) return;
    this.#show(Object.fromEntries(MARK_KEYS.map(({ key }) => [key, {
      x: OPENING[key].x * width,
      y: OPENING[key].y * height,
    }])), 'open');
  }

  /**
   * Put the dots where something else worked out they belong.
   *
   * Clamped and rounded by the same code that clamps a drag, so a detector
   * that came back with a pupil half a pixel off the edge of the picture
   * cannot put a dot somewhere a hand could not have put it.
   *
   * @param {import('./geometry.js').Marks} points  in source pixels
   */
  place(points) {
    const { width, height } = this.#source;
    if (!width || !height || !points) return;
    this.#show(points, 'place');
  }

  hide() {
    for (const dot of this.#dots.values()) dot.hidden = true;
  }

  /** Put them back, where they were left, after a rule that had no use for them. */
  show() {
    if (!this.#points) return;
    for (const dot of this.#dots.values()) dot.hidden = false;
    this.#paint();
  }

  clear() {
    this.#points = null;
    this.hide();
    this.#onChange?.(null, 'clear');
  }

  /* -------------------------------------------------------------- dragging */

  #scale() {
    const bounds = this.#stage.getBoundingClientRect();
    return bounds.width ? this.#source.width / bounds.width : 1;
  }

  #onPointerDown = (event) => {
    if (event.button !== 0 || !this.#points) return;
    // Held in a const: currentTarget is only valid while the event is being
    // dispatched, and the pointerup handler below runs long after that.
    const dot = event.currentTarget;
    const key = dot.dataset.key;
    const start = { ...this.#points[key] };
    const scale = this.#scale();

    dot.setPointerCapture?.(event.pointerId);
    event.preventDefault();
    dot.focus({ preventScroll: true });
    dot.classList.add('dragging');

    const from = { x: event.clientX, y: event.clientY };

    const move = (moved) => {
      this.#set(key, {
        x: start.x + (moved.clientX - from.x) * scale,
        y: start.y + (moved.clientY - from.y) * scale,
      });
    };

    const up = () => {
      dot.classList.remove('dragging');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  };

  #onKeyDown = (event) => {
    const directions = {
      ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1],
    };
    const direction = directions[event.key];
    if (!direction || !this.#points) return;
    event.preventDefault();

    const key = event.currentTarget.dataset.key;
    const step = event.shiftKey ? 10 : 1;
    const at = this.#points[key];
    this.#set(key, { x: at.x + direction[0] * step, y: at.y + direction[1] * step });
  };

  /** All four at once, shown, painted and announced. */
  #show(points, why) {
    this.#points = Object.fromEntries(MARK_KEYS.map(({ key }) => [
      key, this.#inside(points[key]),
    ]));
    for (const dot of this.#dots.values()) dot.hidden = false;
    this.#paint();
    this.#onChange?.(this.marks, why);
  }

  #set(key, point) {
    this.#points[key] = this.#inside(point);
    this.#paint();
    // 'drag' whether it came from a pointer or from the arrow keys: what the
    // page needs to know is that a person moved it, not which hand they used.
    this.#onChange?.(this.marks, 'drag');
  }

  #inside(point) {
    const { width, height } = this.#source;
    return {
      x: Math.max(0, Math.min(Math.round(point?.x ?? 0), width)),
      y: Math.max(0, Math.min(Math.round(point?.y ?? 0), height)),
    };
  }

  #paint() {
    const { width, height } = this.#source;
    if (!this.#points || !width || !height) return;
    for (const [key, dot] of this.#dots) {
      const at = this.#points[key];
      dot.style.left = `${(at.x / width) * 100}%`;
      dot.style.top = `${(at.y / height) * 100}%`;
    }
  }
}
