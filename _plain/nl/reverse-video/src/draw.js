/**
 * Putting one frame on a canvas.
 *
 * Both export paths draw through here - the one that decodes the file itself
 * and the one that lets the <video> element do it - so a reversed frame is put
 * on the canvas by the same few lines either way.
 *
 * Rotation is the part worth explaining. A phone films in landscape and writes
 * a rotation into the file rather than turning the pixels, so a portrait clip
 * decodes as a landscape frame that every player then turns on its way to the
 * screen. Reversing a clip re-encodes every frame, so the turn is applied here,
 * once, on the way through the canvas - and the file that comes out carries no
 * rotation of its own, because by then there is nothing left to turn.
 */

/**
 * Draw one frame, the right way up, fitted inside the output frame.
 *
 * The output frame is the source's own size rounded down to the even numbers
 * H.264 can describe, so in almost every case the picture lands on an exact fit
 * and the fill underneath it is covered completely. The odd-sized clip - 1079
 * pixels tall, which cameras do produce - loses a row rather than being
 * stretched by one, and the fill is what the missing row is made of.
 *
 * The painting is not decoration. One canvas is reused for every frame in the
 * file, so a row left unpainted is not black - it is whatever was drawn there
 * last, which is the frame before.
 *
 * @param {CanvasRenderingContext2D} ctx  a canvas of frame.width x frame.height
 * @param {CanvasImageSource} source  a VideoFrame, a <video>, or an image
 * @param {object} options
 * @param {number} options.rotation  0, 90, 180 or 270 - what the file asks for
 * @param {number} options.displayWidth  the source's size after rotation
 * @param {number} options.displayHeight
 * @param {{width: number, height: number}} options.frame  the output frame
 * @param {string} [options.background]  what the bars are made of
 */
export function drawFitted(ctx, source, {
  rotation = 0, displayWidth, displayHeight, frame, background = '#000',
}) {
  const scale = Math.min(frame.width / displayWidth, frame.height / displayHeight);
  const left = (frame.width - displayWidth * scale) / 2;
  const top = (frame.height - displayHeight * scale) / 2;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, frame.width, frame.height);

  ctx.setTransform(scale, 0, 0, scale, left, top);

  // The same three maps drawCropped uses: the decoded frame's own coordinates
  // onto the rectangle the picture is actually watched in.
  if (rotation === 90) ctx.transform(0, 1, -1, 0, displayWidth, 0);
  else if (rotation === 180) ctx.transform(-1, 0, 0, -1, displayWidth, displayHeight);
  else if (rotation === 270) ctx.transform(0, -1, 1, 0, 0, displayHeight);

  ctx.drawImage(source, 0, 0);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
