/**
 * The four dots you drag onto the face.
 *
 * The crown, the chin and the two pupils. Between them they fix everything a
 * specification constrains - how tall the head is and where the eye line falls -
 * so the crop box can be placed exactly rather than eyeballed, with no face
 * detection in the tool at all. geometry.js explains why that trade is the right
 * way round; this file is only the dragging.
 *
 * The dots live in the coordinates of the picture, not of the crop box, so
 * moving or resizing the box does not move them: the marks describe the face,
 * and the face does not move when you change your mind about the framing. They
 * are drawn in percentages of the stage, so a window resize costs nothing.
 *
 * They start in the places a head-and-shoulders photograph usually puts them.
 * That is a starting position and the page says so - it is not a detection, and
 * a tool that quietly presented a guess as a measurement would be worse than one
 * that asks for eight seconds of dragging.
 */

/** The dots, in the order they are tabbed through. */
export const MARK_KEYS = [
  { key: 'crown', label: 'Crown', hint: 'the very top of the head, hair included' },
  { key: 'chin', label: 'Chin', hint: 'the bottom of the chin' },
  { key: 'leftEye', label: 'Left eye', hint: 'the pupil, on the left as you look at it' },
  { key: 'rightEye', label: 'Right eye', hint: 'the other pupil' },
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

  constructor(stage, { onChange } = {}) {
    this.#stage = stage;
    this.#onChange = onChange;

    for (const { key, label, hint } of MARK_KEYS) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = `face-mark mark-${key}`;
      dot.dataset.key = key;
      dot.hidden = true;
      dot.setAttribute('aria-label', `${label}: ${hint}. The arrow keys move it; hold Shift for ten pixels at a time.`);

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
    this.#points = Object.fromEntries(MARK_KEYS.map(({ key }) => [key, {
      x: Math.round(OPENING[key].x * width),
      y: Math.round(OPENING[key].y * height),
    }]));
    for (const dot of this.#dots.values()) dot.hidden = false;
    this.#paint();
    this.#onChange?.(this.marks);
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
    this.#onChange?.(null);
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

  #set(key, point) {
    const { width, height } = this.#source;
    this.#points[key] = {
      x: Math.max(0, Math.min(Math.round(point.x), width)),
      y: Math.max(0, Math.min(Math.round(point.y), height)),
    };
    this.#paint();
    this.#onChange?.(this.marks);
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
