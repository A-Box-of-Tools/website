/**
 * The picture on screen, with the boxes already applied to it.
 *
 * This is a canvas rather than an `<img>` with black rectangles laid over it,
 * and the difference is the point of the tool: what is drawn here is the same
 * three functions from redact.js that write the file, run over a scaled copy of
 * the same pixels. So the preview is not a promise about what the download will
 * look like - it is the same code, at screen resolution.
 *
 * It is a scaled copy on purpose. Redacting a 6000 x 4000 photograph takes long
 * enough to feel while a box is being dragged, and a preview that lags behind
 * the pointer is a preview nobody can aim with. The file itself is always
 * redacted at full resolution, in one pass, when the button is pressed.
 *
 * The base image is kept as ImageData and copied back before every redraw, so
 * moving a box does not blur what a previous position of it already blurred.
 * A blur of a blur is darker and softer than a blur, and it would creep with
 * every frame of a drag.
 */

import { applyRegions } from './redact.js';

/** The longest side the preview is drawn at, in device pixels. */
const MAX_SIDE = 1800;

export class Preview {
  #canvas;
  #context;
  #base = null;
  #scale = 1;
  #source = { width: 0, height: 0 };

  constructor(canvas) {
    this.#canvas = canvas;
    // `willReadFrequently` because every redraw is a putImageData, and without
    // it some browsers keep the canvas on the GPU and pay to read it back.
    this.#context = canvas.getContext('2d', { willReadFrequently: true });
  }

  /** The scale from source pixels to preview pixels. */
  get scale() {
    return this.#scale;
  }

  /**
   * Draw the picture once, at a size the machine can redraw quickly.
   *
   * @param {ImageBitmap|HTMLImageElement} bitmap
   * @param {{width: number, height: number}} size  the picture's real size
   */
  setSource(bitmap, size) {
    this.#source = size;
    const longest = Math.max(size.width, size.height);
    this.#scale = longest > MAX_SIDE ? MAX_SIDE / longest : 1;

    this.#canvas.width = Math.max(1, Math.round(size.width * this.#scale));
    this.#canvas.height = Math.max(1, Math.round(size.height * this.#scale));
    this.#context.drawImage(bitmap, 0, 0, this.#canvas.width, this.#canvas.height);
    this.#base = this.#context.getImageData(0, 0, this.#canvas.width, this.#canvas.height);
  }

  /** Forget the picture, and the copy of it this was holding. */
  clear() {
    this.#base = null;
    this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
  }

  /**
   * Redraw: the original, then the boxes.
   *
   * The boxes are scaled with the picture, so a box a tenth of the way across
   * a 6000 pixel photograph is a box a tenth of the way across the preview, and
   * its mosaic has the same number of blocks in it at both sizes - the block
   * size is derived from the box rather than fixed, which is what makes the two
   * agree. See STRENGTHS in regions.js.
   */
  draw(regions, strength) {
    if (!this.#base) return;
    const pixels = new ImageData(
      new Uint8ClampedArray(this.#base.data),
      this.#base.width,
      this.#base.height,
    );
    applyRegions(pixels, regions.map((region) => this.#scaled(region)), strength);
    this.#context.putImageData(pixels, 0, 0);
  }

  #scaled(region) {
    const scale = this.#scale;
    if (scale === 1) return region;
    const x = Math.round(region.x * scale);
    const y = Math.round(region.y * scale);
    return {
      style: region.style,
      x,
      y,
      // Rounded as edges rather than as a position and a length, so a box that
      // ends at the right-hand edge of the picture still ends there once
      // scaled, instead of leaving a one-pixel strip of the original showing.
      width: Math.max(1, Math.round((region.x + region.width) * scale) - x),
      height: Math.max(1, Math.round((region.y + region.height) * scale) - y),
    };
  }
}
