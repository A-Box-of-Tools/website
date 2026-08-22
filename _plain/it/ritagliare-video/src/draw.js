/**
 * Putting one cropped frame on a canvas.
 *
 * Both export paths and the preview go through here, so what you line up in the
 * page and what comes out of the encoder are drawn by the same six lines.
 *
 * Rotation is the part worth explaining. A phone films in landscape and writes
 * a rotation into the file rather than turning the pixels, so a portrait clip
 * decodes as a landscape frame that every player then turns on its way to the
 * screen. The crop box is drawn on what you see, so the frame is turned here
 * too, before anything is measured against it - and the output carries no
 * rotation of its own, because by then there is nothing left to turn.
 */

/**
 * @param {CanvasRenderingContext2D} ctx  a canvas of crop.width x crop.height,
 *   multiplied by `scale`.
 * @param {CanvasImageSource} source  a VideoFrame, a <video>, or an image.
 * @param {object} options
 * @param {number} options.rotation  0, 90, 180 or 270 - what the file asks for.
 *   A <video> element has already applied it, so pass 0 for one of those.
 * @param {number} options.displayWidth  the frame's size after rotation.
 * @param {number} options.displayHeight
 * @param {{x: number, y: number, width: number, height: number}} options.crop
 *   in display coordinates - the same ones the crop box on the page uses.
 * @param {number} [options.scale]  1 for an export, less for a preview.
 */
export function drawCropped(ctx, source, {
  rotation = 0, displayWidth, displayHeight, crop, scale = 1,
}) {
  ctx.setTransform(scale, 0, 0, scale, -crop.x * scale, -crop.y * scale);

  // Each of these maps the decoded frame's own coordinates onto the display
  // rectangle: (u, v) -> the place that pixel is actually watched at.
  if (rotation === 90) ctx.transform(0, 1, -1, 0, displayWidth, 0);
  else if (rotation === 180) ctx.transform(-1, 0, 0, -1, displayWidth, displayHeight);
  else if (rotation === 270) ctx.transform(0, -1, 1, 0, 0, displayHeight);

  ctx.drawImage(source, 0, 0);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
