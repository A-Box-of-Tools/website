/**
 * Putting one sampled frame on the canvas the output is encoded from.
 *
 * Both ways of reading a video go through here, so an instant taken by
 * WebCodecs and the same instant taken from the browser's own player land on
 * exactly the same pixels.
 *
 * Rotation is the part worth explaining. A phone films in landscape and writes
 * a rotation into the file rather than turning the pixels, so a portrait clip
 * decodes as a landscape frame that every player turns on its way to the
 * screen. WebCodecs hands over what is stored, so the turn happens here; a
 * <video> element has already done it, so that path passes 0 and nothing
 * happens. Get this wrong and a phone clip comes out on its side - which is
 * exactly what it looks like when a converter has skipped it.
 */

/**
 * @param {CanvasRenderingContext2D} ctx  a canvas of the output size
 * @param {CanvasImageSource} source  a VideoFrame or a <video>
 * @param {object} options
 * @param {number} [options.rotation]  0, 90, 180 or 270 - what the file asks
 *   for. Pass 0 for a source the browser has already turned.
 * @param {number} options.displayWidth  the frame's size after rotation
 * @param {number} options.displayHeight
 * @param {number} options.width  the output size
 * @param {number} options.height
 */
export function drawScaled(ctx, source, {
  rotation = 0, displayWidth, displayHeight, width, height,
}) {
  const scaleX = width / displayWidth;
  const scaleY = height / displayHeight;

  ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);

  // Each of these maps the stored frame's own coordinates onto the rectangle it
  // is actually watched in: (u, v) -> where that pixel belongs on screen.
  if (rotation === 90) ctx.transform(0, 1, -1, 0, displayWidth, 0);
  else if (rotation === 180) ctx.transform(-1, 0, 0, -1, displayWidth, displayHeight);
  else if (rotation === 270) ctx.transform(0, -1, 1, 0, 0, displayHeight);

  ctx.drawImage(source, 0, 0);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

/**
 * A canvas to draw the frames into.
 *
 * `alpha: false` because a video frame has no transparency and saying so lets
 * the browser skip compositing. Unlike the GIF tool's canvas this one is never
 * read back with getImageData - every frame goes straight into a VideoFrame and
 * from there to the encoder - so `willReadFrequently` would be exactly the
 * wrong hint here, and it is left off: this canvas wants to stay on the GPU.
 *
 * One canvas is reused for every frame in the clip, which is what keeps a
 * thousand-frame time-lapse from holding a thousand pictures at once.
 */
export function frameCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  return { canvas, ctx };
}
