/**
 * Putting the frames back on top of each other.
 *
 * A GIF is not a stack of pictures. It is a first picture and then a series of
 * patches, each with a rule - the disposal method - for what to do with the
 * canvas before the next patch lands. Which means the frame you *see* is
 * usually not the frame the file *stores*: frame 12 of a talking head might be
 * a 40x30 rectangle of face, and everything else on screen is what frames 1
 * through 11 left there.
 *
 * That is the whole reason this tool has two answers rather than one, and why
 * the choice is on the page instead of being decided here:
 *
 *   - **As it appears** - the canvas after this frame has been drawn onto
 *     everything before it. This is what somebody who says "I want the frames
 *     of this GIF" means, and it is what a video editor or a contact sheet
 *     needs. It is the default.
 *   - **As it is stored** - the patch on its own, at its own size, with the
 *     pixels the frame does not carry left transparent. Nothing else will show
 *     you this, and it is the only view that explains why a 400-frame GIF is
 *     900 KB rather than 40 MB.
 *
 * THE FOUR DISPOSAL METHODS, AND THE ONE THAT IS A JUDGEMENT CALL
 *
 *   0  unspecified   treated as 1: leave it alone
 *   1  do not dispose        the canvas keeps what this frame drew
 *   2  restore to background clear this frame's rectangle
 *   3  restore to previous   put back what was there before this frame
 *
 * Method 2 says "background", and the specification means the background colour
 * from the screen descriptor. Every browser written since about 1997 clears to
 * *transparent* instead, because that is what animations of the era assumed and
 * honouring the letter of the spec makes a large number of old GIFs render with
 * coloured holes punched through them. This follows the browsers, deliberately:
 * the point of the tool is to hand back the frames somebody sees, and what they
 * see is what their browser draws.
 */

/**
 * Replays a GIF frame by frame, keeping the canvas the disposal methods act on.
 *
 * Sequential on purpose. Frame N depends on every frame before it, so there is
 * no way to jump to one that is not "start again and run forward" - which is
 * cheap, because the indices are already decoded and the work per frame is a
 * copy. Deliberately holding one canvas rather than every composited frame:
 * 300 frames of 500x500 RGBA is 300 MB, and this way it is 1 MB.
 */
export class GifCanvas {
  /** @param {{width: number, height: number, frames: object[]}} gif */
  constructor(gif) {
    this.gif = gif;
    this.width = gif.width;
    this.height = gif.height;
    this.pixels = new Uint8ClampedArray(this.width * this.height * 4);
    /** The snapshot method 3 restores, taken only when a frame asks for it. */
    this.saved = null;
    this.at = 0;
  }

  /**
   * Draw the next frame and hand back the canvas as it now stands.
   *
   * Three things happen here, and the order is the whole of the algorithm:
   * the previous frame's disposal is applied first, the snapshot method 3
   * restores is taken *after* that and before this frame paints, and only then
   * does the patch land. Taking the snapshot a step early - which is the
   * natural way to write it - restores a canvas that never existed.
   *
   * The returned array is this compositor's own buffer, not a copy: a caller
   * that draws it straight onto a canvas needs no copy, and one that keeps it
   * has to make its own. `slice()` is the whole cost of doing that.
   *
   * @returns {{index: number, frame: object, pixels: Uint8ClampedArray}|null}
   */
  next() {
    const frame = this.gif.frames[this.at];
    if (!frame) return null;

    const previous = this.gif.frames[this.at - 1];
    if (previous) {
      if (previous.disposal === 2) this.clear(previous);
      else if (previous.disposal === 3 && this.saved) this.pixels.set(this.saved);
    }

    if (frame.disposal === 3) this.saved = this.pixels.slice();

    paint(this.pixels, this.width, this.height, frame);

    const index = this.at;
    this.at += 1;
    return { index, frame, pixels: this.pixels };
  }

  /** Method 2: this rectangle goes back to transparent. */
  clear(frame) {
    const left = Math.max(0, frame.x);
    const top = Math.max(0, frame.y);
    const right = Math.min(this.width, frame.x + frame.width);
    const bottom = Math.min(this.height, frame.y + frame.height);
    if (right <= left) return;

    for (let y = top; y < bottom; y += 1) {
      const from = (y * this.width + left) * 4;
      this.pixels.fill(0, from, from + (right - left) * 4);
    }
  }
}

/**
 * Draw one frame's patch onto a canvas, honouring its transparent index.
 *
 * Pixels carrying the transparent index are not drawn at all - they are not
 * "black with alpha zero", they are *skipped*, which is what lets the frame
 * underneath show through. Getting that wrong is the single most common way a
 * hand-written GIF renderer produces an animation that flickers black.
 *
 * A frame rectangle that hangs off the edge of the logical screen is clipped
 * rather than refused. It is illegal and it exists in the wild.
 */
export function paint(pixels, width, height, frame) {
  const { palette, indices, transparentIndex } = frame;
  const colours = Math.floor(palette.length / 3);

  for (let row = 0; row < frame.height; row += 1) {
    const y = frame.y + row;
    if (y < 0 || y >= height) continue;

    for (let column = 0; column < frame.width; column += 1) {
      const x = frame.x + column;
      if (x < 0 || x >= width) continue;

      const index = indices[row * frame.width + column];
      if (index === transparentIndex) continue;

      const entry = (index < colours ? index : 0) * 3;
      const at = (y * width + x) * 4;
      pixels[at] = palette[entry];
      pixels[at + 1] = palette[entry + 1];
      pixels[at + 2] = palette[entry + 2];
      pixels[at + 3] = 255;
    }
  }

  return pixels;
}

/**
 * One frame on its own, as the file stores it: its own rectangle, and nothing
 * from any other frame. Everything the frame does not carry is transparent.
 */
export function patchPixels(frame) {
  const pixels = new Uint8ClampedArray(frame.width * frame.height * 4);
  paint(pixels, frame.width, frame.height, { ...frame, x: 0, y: 0 });
  return pixels;
}

/**
 * Paint RGBA over a solid colour, in place.
 *
 * PNG keeps the transparency a GIF frame has, which is the right default and
 * occasionally the wrong one: a frame dropped into something that ignores alpha
 * turns its transparent areas black, and a half-drawn patch is unreadable on
 * its own. Flattening is offered for those, and it is a real choice rather than
 * a cosmetic one - it cannot be undone once the PNG is written.
 *
 * @param {Uint8ClampedArray} pixels
 * @param {{r: number, g: number, b: number}} colour
 */
export function flatten(pixels, colour) {
  for (let at = 0; at < pixels.length; at += 4) {
    const alpha = pixels[at + 3];
    if (alpha === 255) continue;

    if (alpha === 0) {
      pixels[at] = colour.r;
      pixels[at + 1] = colour.g;
      pixels[at + 2] = colour.b;
    } else {
      // GIF transparency is one bit, so partial alpha cannot come out of the
      // decoder - but this is the only place that assumption would be silently
      // wrong if it ever stopped holding, so it is mixed properly rather than
      // assumed away.
      const weight = alpha / 255;
      pixels[at] = pixels[at] * weight + colour.r * (1 - weight);
      pixels[at + 1] = pixels[at + 1] * weight + colour.g * (1 - weight);
      pixels[at + 2] = pixels[at + 2] * weight + colour.b * (1 - weight);
    }
    pixels[at + 3] = 255;
  }

  return pixels;
}

/** `#rrggbb` to three numbers. Anything unreadable comes back white. */
export function parseColour(text) {
  const match = /^#?([0-9a-f]{6})$/i.exec(String(text ?? '').trim());
  if (!match) return { r: 255, g: 255, b: 255 };
  const value = parseInt(match[1], 16);
  return { r: (value >> 16) & 0xff, g: (value >> 8) & 0xff, b: value & 0xff };
}
