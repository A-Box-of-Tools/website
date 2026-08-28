/**
 * The crop box: the rectangle you drag over the preview.
 *
 * It keeps its state in the coordinates of the picture itself - a crop is
 * "1080 x 1080 starting 420 across", not "38% of the way in" - because that is
 * what the encoder is given and what the numbers under the preview show. The
 * box is drawn in percentages of the preview, so the same rectangle survives
 * the window being resized, a phone being turned, and the preview swapping to
 * a different image.
 *
 * The same shape as the video cropper next door, with one rule dropped: that
 * one rounds every side to an even number because H.264 cannot store an odd
 * frame. No image format cares, so this one takes any size down to a single
 * pixel and a 1001-pixel-wide crop is 1001 pixels wide.
 *
 * Everything it does is arithmetic on one rectangle. There is no canvas here
 * and nothing is read out of the file.
 */

/** The smallest crop, in source pixels. Small enough for a favicon, large
 *  enough that a mis-drag cannot produce a one-pixel picture. */
const MIN_SIZE = 8;

/** Which point of the box stays still while a handle is dragged. */
const ANCHORS = {
  n: [0.5, 1], s: [0.5, 0], e: [0, 0.5], w: [1, 0.5],
  ne: [0, 1], nw: [1, 1], se: [0, 0], sw: [1, 0],
};

const HANDLES = Object.keys(ANCHORS);

const clampSize = (value, limit) => Math.max(Math.min(MIN_SIZE, limit), Math.min(Math.round(value), limit));

export class Cropper {
  #stage;
  #box;
  #label;
  #onChange;
  #source = { width: 0, height: 0 };
  #rect = { x: 0, y: 0, width: 0, height: 0 };
  #aspect = null;
  #drag = null;
  #enabled = true;

  /**
   * @param {HTMLElement} stage  the element the preview exactly fills
   * @param {{onChange: Function}} options
   */
  constructor(stage, { onChange, label } = {}) {
    this.#stage = stage;
    this.#onChange = onChange;

    this.#box = document.createElement('div');
    this.#box.className = 'crop-box';
    this.#box.tabIndex = 0;
    this.#box.setAttribute('role', 'application');
    if (label) this.#box.setAttribute('aria-label', label);

    this.#label = document.createElement('span');
    this.#label.className = 'crop-size';
    this.#box.append(this.#label);

    for (const handle of HANDLES) {
      const grip = document.createElement('span');
      grip.className = `crop-handle handle-${handle}`;
      grip.dataset.handle = handle;
      this.#box.append(grip);
    }

    stage.append(this.#box);

    this.#box.addEventListener('pointerdown', this.#onPointerDown);
    this.#box.addEventListener('keydown', this.#onKeyDown);
  }

  /* ------------------------------------------------------------- geometry */

  get rect() {
    return { ...this.#rect };
  }

  get aspect() {
    return this.#aspect;
  }

  /**
   * Point the box at a different picture.
   *
   * The rectangle is carried across as fractions rather than pixels, so
   * switching the preview to another image in the batch keeps the crop you
   * drew instead of silently reopening on the whole frame. `keep` is false
   * when the picture is genuinely new and there is nothing to carry.
   */
  setSource(width, height, keep = false) {
    const before = this.#source;
    const carried = keep && before.width && before.height
      ? {
        x: (this.#rect.x / before.width) * width,
        y: (this.#rect.y / before.height) * height,
        width: (this.#rect.width / before.width) * width,
        height: (this.#rect.height / before.height) * height,
      }
      : { x: 0, y: 0, width, height };

    this.#source = { width, height };
    this.#apply(carried);
  }

  setEnabled(enabled) {
    this.#enabled = enabled;
    this.#box.classList.toggle('disabled', !enabled);
  }

  reset() {
    this.#aspect = null;
    this.#apply({
      x: 0, y: 0, width: this.#source.width, height: this.#source.height,
    });
  }

  /**
   * Lock the box to a shape - 1 for a square, 16/9 for a wide frame, null to
   * let it be dragged freely. The largest box of that shape that fits inside
   * the current one is what you get, kept where it already was.
   */
  setAspect(aspect) {
    this.#aspect = aspect || null;
    if (!this.#aspect) {
      this.#emit();
      return;
    }

    const centreX = this.#rect.x + this.#rect.width / 2;
    const centreY = this.#rect.y + this.#rect.height / 2;

    // The largest box of that shape that fits inside the one already there,
    // kept where it was. Applied to a box that is still the whole picture -
    // which is where most people press these - that is the largest square, or
    // the widest 16:9, the picture holds.
    const width = Math.min(this.#rect.width, this.#rect.height * this.#aspect);
    const height = width / this.#aspect;

    this.#apply({ x: centreX - width / 2, y: centreY - height / 2, width, height });
  }

  /** The largest box of the current shape, centred. */
  maximize() {
    const { width: sw, height: sh } = this.#source;
    let width = sw;
    let height = sh;
    if (this.#aspect) {
      width = Math.min(sw, sh * this.#aspect);
      height = width / this.#aspect;
    }
    this.#apply({ x: (sw - width) / 2, y: (sh - height) / 2, width, height });
  }

  centre() {
    this.#apply({
      ...this.#rect,
      x: (this.#source.width - this.#rect.width) / 2,
      y: (this.#source.height - this.#rect.height) / 2,
    });
  }

  /** Set the box from the number fields under the preview. */
  setRect(rect) {
    this.#apply(rect);
  }

  /* -------------------------------------------------------------- pointer */

  #scale() {
    const bounds = this.#stage.getBoundingClientRect();
    return bounds.width ? this.#source.width / bounds.width : 1;
  }

  #onPointerDown = (event) => {
    if (!this.#enabled || event.button !== 0) return;
    const handle = event.target.dataset?.handle ?? 'move';

    this.#drag = {
      handle,
      pointerX: event.clientX,
      pointerY: event.clientY,
      scale: this.#scale(),
      start: { ...this.#rect },
    };

    event.target.setPointerCapture?.(event.pointerId);
    event.preventDefault();
    this.#box.focus({ preventScroll: true });
    this.#box.classList.add('dragging');

    const move = (moved) => {
      if (!this.#drag) return;
      const dx = (moved.clientX - this.#drag.pointerX) * this.#drag.scale;
      const dy = (moved.clientY - this.#drag.pointerY) * this.#drag.scale;
      if (this.#drag.handle === 'move') this.#move(dx, dy);
      else this.#resize(this.#drag.handle, dx, dy);
    };

    const up = () => {
      this.#drag = null;
      this.#box.classList.remove('dragging');
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

    const directions = {
      ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1],
    };
    const direction = directions[event.key];
    if (!direction) return;
    event.preventDefault();

    const [x, y] = direction;
    const step = event.shiftKey ? 10 : 1;
    // Alt turns the arrows into a resize, which is the one gesture a pointer
    // has and a keyboard otherwise does not.
    if (event.altKey) this.#resizeBy(x * step, y * step);
    else this.#move(x * step, y * step, this.#rect);
  };

  #move(dx, dy, from = this.#drag?.start ?? this.#rect) {
    this.#apply({ ...from, x: from.x + dx, y: from.y + dy });
  }

  #resizeBy(dx, dy) {
    const start = this.#rect;
    let width = start.width + dx;
    let height = start.height + dy;
    if (this.#aspect) {
      if (dx) height = width / this.#aspect;
      else width = height * this.#aspect;
    }
    this.#apply({ ...start, width, height });
  }

  /**
   * Resize from one handle.
   *
   * The anchor - the corner or edge opposite the one being dragged - is what
   * stays still, and everything else is derived from it. Doing it this way is
   * what makes a locked shape behave: the box can only grow until the anchor
   * runs into the edge of the picture, and then it stops rather than sliding.
   */
  #resize(handle, dx, dy) {
    const start = this.#drag.start;
    const [ax, ay] = ANCHORS[handle];
    const anchorX = start.x + ax * start.width;
    const anchorY = start.y + ay * start.height;

    let width = start.width + (handle.includes('e') ? dx : handle.includes('w') ? -dx : 0);
    let height = start.height + (handle.includes('s') ? dy : handle.includes('n') ? -dy : 0);

    if (this.#aspect) {
      const horizontal = handle === 'e' || handle === 'w';
      const vertical = handle === 'n' || handle === 's';
      if (horizontal) height = width / this.#aspect;
      else if (vertical) width = height * this.#aspect;
      // On a corner, whichever axis was dragged further decides, so the box
      // follows the pointer rather than one chosen axis.
      else if (width / this.#aspect >= height) height = width / this.#aspect;
      else width = height * this.#aspect;
    }

    const room = (anchor, span, side) => (
      side === 0 ? span - anchor : side === 1 ? anchor : 2 * Math.min(anchor, span - anchor)
    );
    const maxWidth = room(anchorX, this.#source.width, ax);
    const maxHeight = room(anchorY, this.#source.height, ay);

    if (this.#aspect) {
      const limit = Math.min(maxWidth, maxHeight * this.#aspect);
      width = Math.min(width, limit);
      height = width / this.#aspect;
    } else {
      width = Math.min(width, maxWidth);
      height = Math.min(height, maxHeight);
    }

    this.#apply({
      x: anchorX - ax * width,
      y: anchorY - ay * height,
      width,
      height,
    });
  }

  /* ------------------------------------------------------------- applying */

  /** Round, clamp inside the picture, draw, and report. */
  #apply(rect) {
    const { width: sw, height: sh } = this.#source;
    if (!sw || !sh) return;

    // Size first, then position: the size is what the edges of the picture
    // constrain, and the position is then whatever keeps that size inside them.
    const width = clampSize(rect.width, sw);
    const height = clampSize(rect.height, sh);
    const x = Math.max(0, Math.min(Math.round(rect.x), sw - width));
    const y = Math.max(0, Math.min(Math.round(rect.y), sh - height));

    this.#rect = { x, y, width, height };
    this.#paint();
    this.#emit();
  }

  #paint() {
    const { width: sw, height: sh } = this.#source;
    if (!sw || !sh) return;
    const { x, y, width, height } = this.#rect;

    this.#box.style.left = `${(x / sw) * 100}%`;
    this.#box.style.top = `${(y / sh) * 100}%`;
    this.#box.style.width = `${(width / sw) * 100}%`;
    this.#box.style.height = `${(height / sh) * 100}%`;
    this.#label.textContent = `${width} x ${height}`;
  }

  #emit() {
    this.#onChange?.(this.rect);
  }
}
