/**
 * Putting one whole frame on a canvas, the right way up.
 *
 * The preview and the saved still both go through here, so what you are looking
 * at on the page and what lands in your downloads are drawn by the same four
 * lines - at different sizes, and from the same pixels.
 *
 * Rotation is the part worth explaining. A phone films in landscape and writes
 * a rotation into the file rather than turning the pixels, so a portrait clip
 * decodes as a landscape frame that every player then turns on its way to the
 * screen. A still saved without that turn is a plausible picture of the wrong
 * shape, sideways, and nothing about it looks like a bug until you open it. So
 * the turn is applied here, once, and the canvas is made in display
 * coordinates - the ones you can see.
 *
 * A <video> element has already applied the rotation itself, so a frame taken
 * from one is drawn with `rotation: 0`.
 */

/**
 * @param {CanvasRenderingContext2D} ctx  a canvas of displayWidth x displayHeight,
 *   multiplied by `scale`.
 * @param {CanvasImageSource} source  a VideoFrame, an ImageBitmap, or a <video>.
 * @param {object} options
 * @param {number} options.rotation  0, 90, 180 or 270 - what the file asks for.
 * @param {number} options.displayWidth  the frame's size after rotation.
 * @param {number} options.displayHeight
 * @param {number} [options.scale]  1 for a saved still, less for a preview.
 */
export function drawUpright(ctx, source, {
  rotation = 0, displayWidth, displayHeight, scale = 1,
}) {
  ctx.setTransform(scale, 0, 0, scale, 0, 0);

  // Each of these maps the decoded frame's own coordinates onto the display
  // rectangle: (u, v) -> the place that pixel is actually watched at.
  if (rotation === 90) ctx.transform(0, 1, -1, 0, displayWidth, 0);
  else if (rotation === 180) ctx.transform(-1, 0, 0, -1, displayWidth, displayHeight);
  else if (rotation === 270) ctx.transform(0, -1, 1, 0, 0, displayHeight);

  ctx.drawImage(source, 0, 0);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

/**
 * A canvas holding one frame at its full size, upright.
 *
 * This is what a saved still is made from: no scaling, no resampling, no
 * quality setting yet - the decoded pixels, turned if the file asked for it,
 * and nothing else.
 */
export function frameCanvas(source, { rotation, displayWidth, displayHeight }) {
  const canvas = document.createElement('canvas');
  canvas.width = displayWidth;
  canvas.height = displayHeight;
  const ctx = canvas.getContext('2d', { alpha: false });
  drawUpright(ctx, source, { rotation, displayWidth, displayHeight });
  return canvas;
}
