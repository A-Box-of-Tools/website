/**
 * Putting one frame on a canvas.
 *
 * Every path that shows you a picture or writes one goes through here, so what
 * you line up on the page and what comes out of the encoder are drawn by the
 * same few lines.
 *
 * Rotation is the part worth explaining. A phone films in landscape and writes
 * a rotation into the file rather than turning the pixels, so a portrait clip
 * decodes as a landscape frame that every player then turns on its way to the
 * screen. The marks on the timeline are set against what you can see, so the
 * frame is turned here too - and a file this tool writes after drawing through
 * a canvas carries no rotation of its own, because by then there is nothing
 * left to turn.
 */

/**
 * Draw one frame, the right way up, fitted inside a frame of a different shape.
 *
 * This is what joining needs and trimming never did. Clips that came from
 * different places are not all the same shape, and a joined file has one frame
 * size for the whole of it - so a portrait clip in a landscape join has to go
 * somewhere. It goes in the middle, at the largest size that fits, and the rest
 * of the frame is painted first. Not stretched: a face made 30% wider for the
 * middle third of a video is worse than a bar down each side, and it cannot be
 * undone afterwards.
 *
 * The painting is not decoration. One canvas is reused for every frame of every
 * clip, so a bar left unpainted is not black - it is whatever was drawn there
 * last, which is the clip before. Filling first is what makes a bar a bar.
 *
 * A clip that is already the right shape lands on an exact fit, and the fill
 * underneath it is covered completely.
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

/**
 * Where a clip's picture lands inside the output frame, in output pixels.
 *
 * The same arithmetic as `drawFitted`, without a canvas, so the page can say
 * "this one gets bars down the side" before anything is encoded.
 */
export function fittedBox({ displayWidth, displayHeight, frame }) {
  const scale = Math.min(frame.width / displayWidth, frame.height / displayHeight);
  const width = Math.round(displayWidth * scale);
  const height = Math.round(displayHeight * scale);
  return {
    width,
    height,
    left: Math.round((frame.width - width) / 2),
    top: Math.round((frame.height - height) / 2),
    fits: width === frame.width && height === frame.height,
  };
}
