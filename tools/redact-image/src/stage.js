/**
 * The boxes on top of the preview: drawing them, moving them, resizing them.
 *
 * This layer draws no pixels. What it draws is an outline and eight handles per
 * box, over a canvas that already has the redaction painted into it - so the
 * thing being dragged is a selection, and the black or the mosaic underneath is
 * the real work, done by the same code that writes the file.
 *
 * All state lives with the caller. This class reports gestures and repaints the
 * outlines it is given; it never decides that a box has moved. That is what
 * makes undo a list of snapshots in main.js rather than a second, disagreeing
 * copy of every rectangle in here.
 *
 * Every box carries a tabindex, and the arrow keys move and resize it. A
 * pointer drag is the fast way to draw a box; it must not be the only way,
 * because "cover the account number" is not a task that should need a mouse.
 */

import { HANDLES, MIN_SIZE, clampRect, fromDrag, isUsable, moveRect, resizeRect } from './regions.js';

export class Stage {
  #stage;
  #handlers;
  #source = { width: 0, height: 0 };
  #elements = new Map();

  /**
   * @param {HTMLElement} stage  the element the preview canvas exactly fills
   * @param {object} handlers
   * @param {(rect: object) => void} handlers.onCreate
   * @param {(id: string, rect: object) => void} handlers.onChange
   * @param {(id: string) => void} handlers.onSelect
   * @param {(id: string) => void} handlers.onDelete
   * @param {() => void} handlers.onGestureStart  called once before a drag edits anything
   * @param {(id: string) => object} handlers.regionOf  the box a gesture started on
   * @param {(region: object, index: number) => string} handlers.describe
   */
  constructor(stage, handlers) {
    this.#stage = stage;
    this.#handlers = handlers;
    stage.addEventListener('pointerdown', this.#onPointerDown);
  }

  setSource(width, height) {
    this.#source = { width, height };
  }

  /**
   * Put the outlines where the boxes are.
   *
   * Elements are kept and moved rather than rebuilt, because rebuilding them
   * would throw away the focus during a keyboard drag - the box being moved
   * with the arrow keys would stop being the focused element on the first
   * keypress, and the second keypress would go to the page.
   */
  render(regions, selectedId) {
    const seen = new Set();

    regions.forEach((region, index) => {
      seen.add(region.id);
      let element = this.#elements.get(region.id);
      if (!element) {
        element = this.#build(region.id);
        this.#elements.set(region.id, element);
        this.#stage.append(element);
      }

      element.className = `redact-box style-${region.style}${region.id === selectedId ? ' selected' : ''}`;
      element.setAttribute('aria-label', this.#handlers.describe(region, index));
      element.querySelector('.box-tag').textContent = String(index + 1);
      this.#place(element, region);
    });

    for (const [id, element] of this.#elements) {
      if (seen.has(id)) continue;
      element.remove();
      this.#elements.delete(id);
    }
  }

  /** Move the keyboard to a box - after adding one, so it can be nudged at once. */
  focus(id) {
    this.#elements.get(id)?.focus({ preventScroll: true });
  }

  #build(id) {
    const element = document.createElement('div');
    element.dataset.id = id;
    element.tabIndex = 0;
    element.setAttribute('role', 'application');

    const tag = document.createElement('span');
    tag.className = 'box-tag';
    element.append(tag);

    for (const handle of HANDLES) {
      const grip = document.createElement('span');
      grip.className = `box-handle handle-${handle}`;
      grip.dataset.handle = handle;
      element.append(grip);
    }

    element.addEventListener('keydown', this.#onKeyDown);
    element.addEventListener('focus', () => this.#handlers.onSelect(id));
    return element;
  }

  #place(element, rect) {
    const { width: sw, height: sh } = this.#source;
    if (!sw || !sh) return;
    element.style.left = `${(rect.x / sw) * 100}%`;
    element.style.top = `${(rect.y / sh) * 100}%`;
    element.style.width = `${(rect.width / sw) * 100}%`;
    element.style.height = `${(rect.height / sh) * 100}%`;
  }

  /** A pointer position, in the coordinates of the picture itself. */
  #pointAt(event) {
    const bounds = this.#stage.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return { x: 0, y: 0 };
    return {
      x: ((event.clientX - bounds.left) / bounds.width) * this.#source.width,
      y: ((event.clientY - bounds.top) / bounds.height) * this.#source.height,
    };
  }

  #onPointerDown = (event) => {
    if (event.button !== 0 || !this.#source.width) return;

    const element = event.target.closest?.('.redact-box');
    const handle = event.target.dataset?.handle;
    const start = this.#pointAt(event);

    this.#stage.setPointerCapture?.(event.pointerId);
    event.preventDefault();

    if (element) {
      const id = element.dataset.id;
      element.focus({ preventScroll: true });
      this.#handlers.onSelect(id);
      this.#dragBox(id, handle, start);
    } else {
      this.#drawBox(start);
    }
  };

  /** An existing box: move it, or drag one of its edges. */
  #dragBox(id, handle, start) {
    const from = this.#handlers.regionOf(id);
    let moved = false;

    this.#follow((point) => {
      const dx = point.x - start.x;
      const dy = point.y - start.y;
      if (!moved && Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
      // The snapshot is taken on the first real movement rather than on the
      // press, so that clicking a box to select it does not put an identical
      // copy on the undo stack and make the next Undo look broken.
      if (!moved) this.#handlers.onGestureStart();
      moved = true;
      const rect = handle
        ? resizeRect(from, handle, dx, dy, this.#source)
        : moveRect(from, Math.round(dx), Math.round(dy), this.#source);
      this.#handlers.onChange(id, rect);
    });
  }

  /**
   * Empty space: draw a new box.
   *
   * The outline while drawing is a throwaway element rather than a real box,
   * because a box that existed during the drag would have to be undone when the
   * drag turned out to be a click - and "undo" would then have two meanings.
   */
  #drawBox(start) {
    const ghost = document.createElement('div');
    ghost.className = 'redact-box drawing';
    this.#stage.append(ghost);

    let rect = { x: start.x, y: start.y, width: 0, height: 0 };
    this.#follow(
      (point) => {
        rect = clampRect(fromDrag(start, point), this.#source);
        this.#place(ghost, rect);
      },
      () => {
        ghost.remove();
        if (isUsable(rect)) this.#handlers.onCreate(rect);
      },
    );
  }

  /** The three listeners every drag needs, wired and unwired in one place. */
  #follow(onMove, onEnd) {
    const move = (event) => onMove(this.#pointAt(event));
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      onEnd?.();
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  }

  #onKeyDown = (event) => {
    const id = event.currentTarget.dataset.id;

    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      this.#handlers.onGestureStart();
      this.#handlers.onDelete(id);
      return;
    }

    const directions = {
      ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1],
    };
    const direction = directions[event.key];
    if (!direction) return;
    event.preventDefault();

    const step = event.shiftKey ? 10 : 1;
    const [x, y] = direction.map((value) => value * step);
    const from = this.#handlers.regionOf(id);

    // Alt turns the arrows into a resize of the bottom right corner, which is
    // the one gesture a pointer has and a keyboard otherwise does not.
    const rect = event.altKey
      ? resizeRect(from, 'se', x, y, this.#source)
      : moveRect(from, x, y, this.#source);

    if (rect.width < MIN_SIZE || rect.height < MIN_SIZE) return;
    this.#handlers.onGestureStart();
    this.#handlers.onChange(id, rect);
  };
}
