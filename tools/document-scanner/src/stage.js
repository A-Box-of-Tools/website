/**
 * The four corner handles over the photograph.
 *
 * This layer draws no pixels of the page. What it draws is an outline and four
 * grips over a canvas that already has the photograph on it, and it reports
 * where they were dragged to. All the state lives with the caller: this never
 * decides that a corner has moved, which is what keeps one list of four points
 * in main.js rather than two lists that can disagree.
 *
 * THE HANDLES ARE REACHABLE FROM THE KEYBOARD, and that is not a box being
 * ticked. Dragging a corner onto the edge of a page is the one genuinely fiddly
 * gesture in this tool, it is the gesture the result depends on, and "hold a
 * mouse steady" is not something everybody can do. Tab reaches a corner, the
 * arrow keys move it a pixel at a time and ten with Shift held, which is finer
 * than any pointer.
 *
 * The outline is an SVG polygon in a 0-100 viewBox with preserveAspectRatio
 * turned off, so it is drawn in percentages of the picture and needs no redraw
 * when the page is resized, the phone is turned, or the preview is replaced by
 * one of a different size.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

/** The corners, in the order the whole tool holds them. */
const CORNERS = ['tl', 'tr', 'br', 'bl'];

export class Corners {
  #stage;
  #handlers;
  #source = { width: 0, height: 0 };
  #polygon;
  #grips = [];

  /**
   * @param {HTMLElement} stage  the element the preview canvas exactly fills
   * @param {object} handlers
   * @param {(index: number, point: {x: number, y: number}) => void} handlers.onChange
   * @param {() => void} handlers.onGestureStart  once, before a drag edits anything
   * @param {(index: number) => {x: number, y: number}} handlers.cornerOf
   * @param {(index: number) => string} handlers.describe
   */
  constructor(stage, handlers) {
    this.#stage = stage;
    this.#handlers = handlers;

    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'quad');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');

    this.#polygon = document.createElementNS(SVG_NS, 'polygon');
    this.#polygon.setAttribute('class', 'quad-outline');
    svg.append(this.#polygon);
    stage.append(svg);

    CORNERS.forEach((name, index) => {
      const grip = document.createElement('button');
      grip.type = 'button';
      grip.className = `corner corner-${name}`;
      grip.dataset.index = String(index);
      grip.addEventListener('keydown', this.#onKeyDown);
      stage.append(grip);
      this.#grips.push(grip);
    });

    stage.addEventListener('pointerdown', this.#onPointerDown);
  }

  /** The size of the picture the corners are measured in. */
  setSource(width, height) {
    this.#source = { width, height };
  }

  /** Put the outline and the grips where the corners are. */
  render(quad, { unsure = false } = {}) {
    const { width, height } = this.#source;
    if (!width || !height || !quad) return;

    const points = quad
      .map((point) => `${(point.x / width) * 100},${(point.y / height) * 100}`)
      .join(' ');
    this.#polygon.setAttribute('points', points);
    this.#polygon.classList.toggle('unsure', unsure);

    quad.forEach((point, index) => {
      const grip = this.#grips[index];
      grip.style.left = `${(point.x / width) * 100}%`;
      grip.style.top = `${(point.y / height) * 100}%`;
      grip.setAttribute('aria-label', this.#handlers.describe(index));
    });
  }

  focus(index) {
    this.#grips[index]?.focus({ preventScroll: true });
  }

  /** A pointer position, in the coordinates of the photograph itself. */
  #pointAt(event) {
    const bounds = this.#stage.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return { x: 0, y: 0 };
    return {
      x: ((event.clientX - bounds.left) / bounds.width) * this.#source.width,
      y: ((event.clientY - bounds.top) / bounds.height) * this.#source.height,
    };
  }

  /**
   * A press anywhere on the picture drags the nearest corner.
   *
   * Not only a press on the grip itself. A corner handle is a few millimetres
   * across and the corner of a page in a photograph is often right at the edge
   * of the frame, where a finger cannot easily land on it - so the whole
   * photograph is a target, and what is dragged is whichever corner was closest
   * to where the finger went down.
   */
  #onPointerDown = (event) => {
    if (event.button !== 0 || !this.#source.width) return;

    const start = this.#pointAt(event);
    const index = event.target.dataset?.index !== undefined
      ? Number(event.target.dataset.index)
      : this.#nearest(start);

    this.#stage.setPointerCapture?.(event.pointerId);
    event.preventDefault();
    this.#grips[index].focus({ preventScroll: true });

    let moved = false;
    this.#follow((point) => {
      // The snapshot is taken on the first real movement rather than on the
      // press, so that tapping the picture to look at it does not put an
      // identical copy on the undo stack and make the next Undo look broken.
      if (!moved) this.#handlers.onGestureStart();
      moved = true;
      this.#handlers.onChange(index, point);
    });
  };

  #nearest(point) {
    let best = 0;
    let closest = Infinity;
    for (let index = 0; index < 4; index += 1) {
      const corner = this.#handlers.cornerOf(index);
      const away = Math.hypot(corner.x - point.x, corner.y - point.y);
      if (away < closest) {
        closest = away;
        best = index;
      }
    }
    return best;
  }

  /** The three listeners every drag needs, wired and unwired in one place. */
  #follow(onMove) {
    const move = (event) => onMove(this.#pointAt(event));
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  }

  #onKeyDown = (event) => {
    const directions = {
      ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1],
    };
    const direction = directions[event.key];
    if (!direction) return;

    event.preventDefault();
    const index = Number(event.currentTarget.dataset.index);
    const step = event.shiftKey ? 10 : 1;
    const from = this.#handlers.cornerOf(index);

    this.#handlers.onGestureStart();
    this.#handlers.onChange(index, {
      x: from.x + direction[0] * step,
      y: from.y + direction[1] * step,
    });
  };
}
