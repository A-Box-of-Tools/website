/**
 * The two pictures, side by side, moving together.
 *
 * The picture and the outline traced from it are two views of one thing, so
 * they share one zoom and one pan and cannot drift apart. That is why the
 * boxes are moved with a transform rather than scrolled: there is one number
 * for where we are looking, both panes read it, and there is no scroll event
 * to chase round a loop.
 *
 * Everything a visitor does here means one of three things - move the view,
 * point at something, or choose something - and a drag is the first, a click
 * the last, and the difference between them is whether the pointer travelled.
 * Ending a pan must never also choose whatever it happened to finish over.
 */

const GRAB = 3;              // px of travel before a press becomes a drag
export const MIN_ZOOM = 2 ** -5;
export const MAX_ZOOM = 2 ** 4;

export class Viewport {
  /**
   * @param {{hosts: HTMLElement[], onHover: Function, onPick: Function,
   *          onView: Function}} options
   */
  constructor({ hosts, onHover, onPick, onView }) {
    this.panes = hosts.map((host) => makePane(host));
    this.onHover = onHover;
    this.onPick = onPick;
    this.onView = onView;
    this.zoom = 1;
    this.fit = true;
    this.pan = { x: 0, y: 0 };
    this.offset = { x: 0, y: 0 };
    this.size = { w: 1, h: 1 };
    for (const pane of this.panes) this.wire(pane);
  }

  /** The size of the picture both panes are showing, in its own pixels. */
  setSize(w, h) {
    this.size = { w, h };
  }

  /**
   * The largest zoom at which the whole picture is inside the pane.
   *
   * A pane with no size is one that is not on screen yet - a hidden tab, or
   * the moment before layout. Falling back to 1 there is the worst answer
   * available: on an eight megapixel photograph it would size two canvases to
   * the whole picture to show something nobody is looking at.
   */
  fitZoom() {
    const host = this.panes[0].host;
    const bw = host.clientWidth - 14;
    const bh = host.clientHeight - 14;
    if (!(bw > 0 && bh > 0)) return this.zoom;
    return clamp(Math.min(bw / this.size.w, bh / this.size.h), 0.02, MAX_ZOOM);
  }

  /** Work out the zoom, hand each pane its canvas size, and place them. */
  apply() {
    if (this.fit) this.zoom = this.fitZoom();
    const zw = Math.max(1, Math.round(this.size.w * this.zoom));
    const zh = Math.max(1, Math.round(this.size.h * this.zoom));
    for (const pane of this.panes) {
      pane.box.style.width = `${zw}px`;
      pane.box.style.height = `${zh}px`;
      pane.overlay.width = zw;
      pane.overlay.height = zh;
    }
    this.layout();
    return { zw, zh, zoom: this.zoom };
  }

  /**
   * When the picture is smaller than the pane it is centred and that axis
   * stops panning, which is what every image viewer does and nobody notices
   * until it is missing.
   */
  layout() {
    const zw = Math.max(1, Math.round(this.size.w * this.zoom));
    const zh = Math.max(1, Math.round(this.size.h * this.zoom));
    const host = this.panes[0].host;
    const bw = host.clientWidth, bh = host.clientHeight;

    this.pan.x = zw <= bw ? 0 : clamp(this.pan.x, 0, this.size.w - bw / this.zoom);
    this.pan.y = zh <= bh ? 0 : clamp(this.pan.y, 0, this.size.h - bh / this.zoom);
    this.offset = {
      x: zw <= bw ? Math.round((bw - zw) / 2) : -Math.round(this.pan.x * this.zoom),
      y: zh <= bh ? Math.round((bh - zh) / 2) : -Math.round(this.pan.y * this.zoom),
    };
    for (const pane of this.panes) {
      pane.box.style.transform = `translate(${this.offset.x}px, ${this.offset.y}px)`;
    }
  }

  setZoom(zoom, { fit = false } = {}) {
    this.fit = fit;
    this.zoom = clamp(zoom, MIN_ZOOM, MAX_ZOOM);
  }

  /** Where in the picture a pointer event landed. */
  at(pane, event) {
    const box = pane.host.getBoundingClientRect();
    return [
      Math.floor((event.clientX - box.left - this.offset.x) / this.zoom),
      Math.floor((event.clientY - box.top - this.offset.y) / this.zoom),
    ];
  }

  inside([x, y]) {
    return x >= 0 && y >= 0 && x < this.size.w && y < this.size.h;
  }

  wire(pane) {
    let drag = null;

    pane.host.addEventListener('pointerdown', (e) => {
      // A pointer id that is not down - a stylus already lifted, a synthetic
      // event - makes this throw, and losing the capture is not a reason to
      // lose the drag.
      try { pane.host.setPointerCapture(e.pointerId); } catch { /* no capture */ }
      pane.host.classList.add('dragging');
      drag = { x: e.clientX, y: e.clientY, pan: { ...this.pan }, moved: false };
    });

    pane.host.addEventListener('pointermove', (e) => {
      if (drag) {
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (Math.abs(dx) > GRAB || Math.abs(dy) > GRAB) drag.moved = true;
        this.pan.x = drag.pan.x - dx / this.zoom;
        this.pan.y = drag.pan.y - dy / this.zoom;
        this.layout();
        return;
      }
      const point = this.at(pane, e);
      this.onHover(this.inside(point) ? point : null);
    });

    pane.host.addEventListener('pointerup', (e) => {
      pane.host.classList.remove('dragging');
      const dragged = drag?.moved;
      drag = null;
      if (dragged) return;
      const point = this.at(pane, e);
      if (this.inside(point)) this.onPick(point);
    });

    pane.host.addEventListener('pointerleave', () => {
      if (!drag) this.onHover(null);
    });

    pane.host.addEventListener('wheel', (e) => {
      e.preventDefault();
      const [sx, sy] = this.at(pane, e);
      const next = clamp(this.zoom * Math.exp(-e.deltaY * 0.0015), MIN_ZOOM, MAX_ZOOM);
      const box = pane.host.getBoundingClientRect();
      // Keep the pixel under the pointer under the pointer.
      this.setZoom(next);
      this.pan.x = sx - (e.clientX - box.left) / next;
      this.pan.y = sy - (e.clientY - box.top) / next;
      this.onView();
    }, { passive: false });
  }
}

function makePane(host) {
  const box = document.createElement('div');
  box.className = 'stage-box';
  const content = document.createElement('canvas');
  const overlay = document.createElement('canvas');
  overlay.setAttribute('aria-hidden', 'true');
  box.append(content, overlay);
  host.replaceChildren(box);
  return { host, box, content, overlay };
}

export function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}
