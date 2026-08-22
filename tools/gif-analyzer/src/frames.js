/**
 * Turning palette indices into pixels, and stacking frames the way the format
 * says they stack.
 *
 * A GIF frame is not a picture of the animation at that moment. It is a
 * rectangle, possibly much smaller than the canvas, painted over whatever the
 * previous frame left behind - and what the previous frame left behind is
 * decided by its own disposal field, three frames of history ago. That is why
 * an analyzer has to draw the animation to show it, and why it is worth showing
 * both pictures per frame: the rectangle as it is stored, and the canvas as a
 * viewer sees it.
 *
 * The difference between those two is the single most useful thing this tool
 * shows about a well-optimised GIF, because a file whose frames are tiny
 * rectangles is a file whose encoder did its job, and you cannot tell by
 * looking at the animation.
 *
 * No canvas element is involved anywhere in this file. It is arithmetic over
 * typed arrays, which is what makes it testable outside a browser.
 */

/** What to leave behind when a frame's time is up, by the value in the field. */
export const DISPOSE_NONE = 0;
export const DISPOSE_KEEP = 1;
export const DISPOSE_BACKGROUND = 2;
export const DISPOSE_PREVIOUS = 3;

/**
 * Where a stored row lands in the picture, for an interlaced frame.
 *
 * Interlacing writes the rows in four passes - every eighth row, then every
 * eighth starting at four, then every fourth starting at two, then all the odd
 * ones - so that a GIF arriving down a modem showed a coarse version of itself
 * early. Nothing needs that now, and files still carry it, and a decoder that
 * ignores the flag draws stripes.
 *
 * @param {number} height  rows in the frame
 * @returns {Uint32Array} for each stored row, the row it belongs on
 */
export function interlaceMap(height) {
  const map = new Uint32Array(height);
  let out = 0;
  for (const [start, step] of [[0, 8], [4, 8], [2, 4], [1, 2]]) {
    for (let row = start; row < height; row += step) {
      map[out] = row;
      out += 1;
    }
  }
  return map;
}

/**
 * Paint one frame's indices into an RGBA buffer of the frame's own size.
 *
 * This is the "as stored" picture: the rectangle on its own, transparent where
 * the frame says transparent, with nothing underneath it.
 *
 * @param {object} frame  as parsed by gif.js
 * @param {Uint8Array} indices  one palette index per pixel, as stored
 * @param {{colors: Uint8Array, count: number}} palette
 * @returns {{pixels: Uint8ClampedArray, used: Uint8Array, missing: number}}
 *   `used` marks which palette entries the frame actually referred to, and
 *   `missing` counts pixels that named an entry the palette does not have.
 */
export function paintFrame(frame, indices, palette) {
  const { width, height } = frame;
  const pixels = new Uint8ClampedArray(width * height * 4);
  const used = new Uint8Array(Math.max(palette ? palette.count : 0, 256));
  const transparent = frame.transparentIndex;
  const rows = frame.interlaced ? interlaceMap(height) : null;
  const colors = palette ? palette.colors : null;
  const count = palette ? palette.count : 0;
  let missing = 0;

  for (let row = 0; row < height; row += 1) {
    const target = (rows ? rows[row] : row) * width * 4;
    const source = row * width;
    for (let column = 0; column < width; column += 1) {
      const index = indices[source + column];
      used[index] = 1;
      const out = target + column * 4;
      if (index === transparent) continue;
      if (index >= count) {
        missing += 1;
        continue;
      }
      const rgb = index * 3;
      pixels[out] = colors[rgb];
      pixels[out + 1] = colors[rgb + 1];
      pixels[out + 2] = colors[rgb + 2];
      pixels[out + 3] = 255;
    }
  }

  return { pixels, used, missing };
}

/**
 * The canvas the frames are stacked on.
 *
 * One buffer, reused, plus one spare for the frames that ask for what was
 * underneath them to be put back. A hundred-frame GIF holds two canvases in
 * memory rather than a hundred pictures, which is the difference between
 * opening a large file and running out of memory on it.
 */
export class Compositor {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.pixels = new Uint8ClampedArray(width * height * 4);
    this.saved = null;
  }

  /**
   * Draw one frame and return the canvas as a viewer would see it.
   *
   * The order matters and is the part people get wrong: a frame's disposal
   * happens *after* it has been shown, not before it is drawn. Applying it
   * early makes "restore what was underneath" restore the wrong thing, and the
   * symptom is an animation that flickers on exactly the frames that were meant
   * to stop it flickering.
   *
   * @returns {Uint8ClampedArray} a copy of the canvas after this frame
   */
  draw(frame, stored) {
    if (frame.disposal === DISPOSE_PREVIOUS) {
      this.saved = this.pixels.slice();
    }

    const { left, top, width, height } = frame;
    for (let row = 0; row < height; row += 1) {
      const y = top + row;
      if (y < 0 || y >= this.height) continue;
      for (let column = 0; column < width; column += 1) {
        const x = left + column;
        if (x < 0 || x >= this.width) continue;
        const from = (row * width + column) * 4;
        if (stored[from + 3] === 0) continue;
        const to = (y * this.width + x) * 4;
        this.pixels[to] = stored[from];
        this.pixels[to + 1] = stored[from + 1];
        this.pixels[to + 2] = stored[from + 2];
        this.pixels[to + 3] = 255;
      }
    }

    const shown = this.pixels.slice();

    if (frame.disposal === DISPOSE_BACKGROUND) this.clear(frame);
    else if (frame.disposal === DISPOSE_PREVIOUS && this.saved) {
      this.pixels.set(this.saved);
      this.saved = null;
    }

    return shown;
  }

  /**
   * Clear a frame's rectangle.
   *
   * The specification says "restore to the background colour", naming the index
   * in the screen descriptor. Every browser clears to transparent instead, and
   * has for twenty-five years, so a decoder that follows the specification here
   * draws a coloured box no viewer will ever show. This follows the browsers,
   * because the question this tool answers is what a viewer does.
   */
  clear(frame) {
    const { left, top, width, height } = frame;
    for (let row = 0; row < height; row += 1) {
      const y = top + row;
      if (y < 0 || y >= this.height) continue;
      const start = (y * this.width + Math.max(0, left)) * 4;
      const span = Math.min(width, this.width - left) * 4;
      if (span > 0) this.pixels.fill(0, start, start + span);
    }
  }
}

/** Whether a frame covers the whole canvas, which is what an unoptimised one does. */
export const isFullCanvas = (gif, frame) => (
  frame.left === 0 && frame.top === 0
  && frame.width === gif.width && frame.height === gif.height
);

/**
 * How long the animation runs, twice over.
 *
 * `nominal` is what the file says. `real` is what a browser plays, because
 * every browser since Netscape clamps a delay under two hundredths of a second
 * up to ten - a rule written for the spinning globes of 1996 and never removed.
 * A GIF full of 0 and 1 delays therefore plays five to ten times slower than it
 * claims, which is the single most common surprise in this format and the
 * reason both numbers are reported rather than one.
 */
export function duration(frames) {
  let nominal = 0;
  let real = 0;
  let clamped = 0;
  for (const frame of frames) {
    nominal += frame.delay;
    if (frame.delay < 2) {
      real += 10;
      clamped += 1;
    } else {
      real += frame.delay;
    }
  }
  return { nominal, real, clamped };
}
