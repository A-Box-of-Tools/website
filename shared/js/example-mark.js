/**
 * A flat graphic mark, for the tools whose subject is a logo rather than a
 * photograph.
 *
 * Three tools want this and none of them wants the landscape in
 * example-photo.js: an icon file is square and read at sixteen pixels, a data
 * URI is only worth writing for something small, and tracing to vector wants a
 * shape with an edge rather than grass. So the mark is flat colour, high
 * contrast and closed - no gradients, no grain, nothing that a tracer would
 * have to guess at.
 *
 * It is deliberately not the site's own mark. That one belongs to the site and
 * appears in the header of the page this is drawn on; an example that borrowed
 * it would be demonstrating the tool on the furniture.
 */

/**
 * Draw the mark into a square area of the given size.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} size
 * @param {object} [options]
 * @param {boolean} [options.plate]  draw the rounded background plate. Off for
 *   a tracer, which should be given the silhouette and nothing else.
 */
export function drawMark(ctx, size, { plate = true } = {}) {
  const u = size / 100;

  if (plate) {
    ctx.fillStyle = '#12354f';
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, 22 * u);
    ctx.fill();
  }

  // The sun, behind the peaks and clipped by them, which is what makes the
  // silhouette one shape rather than three overlapping ones.
  ctx.fillStyle = '#f2b134';
  ctx.beginPath();
  ctx.arc(66 * u, 34 * u, 13 * u, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#2f9e78';
  ctx.beginPath();
  ctx.moveTo(14 * u, 74 * u);
  ctx.lineTo(38 * u, 36 * u);
  ctx.lineTo(56 * u, 62 * u);
  ctx.lineTo(66 * u, 48 * u);
  ctx.lineTo(88 * u, 74 * u);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#e8eef2';
  ctx.fillRect(14 * u, 74 * u, 74 * u, 6 * u);
}

/**
 * A square canvas with the mark on it, transparent where the plate is not.
 */
export function markCanvas(size, options) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  drawMark(canvas.getContext('2d'), size, options);
  return canvas;
}

/**
 * The same mark written as SVG text, for the tools that take a vector in.
 *
 * Hand-written rather than traced back off the canvas: an SVG example should
 * look like something a person wrote, with named shapes and round numbers, or
 * it demonstrates the tool on an input nobody would ever actually hand it.
 *
 * A viewBox and no width or height, which is the whole point of handing a
 * vector to a rasteriser: there is no pixel size in the file to lose, so the
 * size is entirely the visitor's to choose. An example carrying width="512"
 * would have the tool report 512 back as "the size the file asks for" and
 * quietly demonstrate the opposite.
 */
export function markSvg() {
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">',
    '  <rect width="100" height="100" rx="22" fill="#12354f"/>',
    '  <circle cx="66" cy="34" r="13" fill="#f2b134"/>',
    '  <path d="M14 74 L38 36 L56 62 L66 48 L88 74 Z" fill="#2f9e78"/>',
    '  <rect x="14" y="74" width="74" height="6" fill="#e8eef2"/>',
    '</svg>',
    '',
  ].join('\n');
}
