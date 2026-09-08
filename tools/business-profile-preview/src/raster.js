/**
 * The picture as a file: the SVG itself, and that same SVG as a PNG.
 *
 * The PNG is not a second rendering. The string of markup that is on the page
 * is handed to the browser as a blob and painted onto a canvas, so the download
 * cannot disagree with the preview about a colour, a font or where a line
 * broke. It is also what makes the download possible with the network
 * unplugged: the mock-up has no external reference in it - no font file, no
 * stylesheet, no linked image - so nothing is fetched, the canvas is not
 * tainted, and `toBlob` gives back bytes.
 *
 * A cover photo does put an <image> in the markup, which reads like an
 * exception and is not one: its href is a `data:` URI of bytes this page
 * encoded a moment earlier, so it is the picture itself rather than a
 * reference to one.
 *
 * WHY A SCALE RATHER THAN A SIZE
 *
 * A knowledge panel is 428 across because that is how wide one is, and a
 * mock-up handed to a client wants to be bigger than that without being a
 * different shape. Multiplying is the only enlargement that cannot change
 * where a line broke, because the layout was decided before this file saw it.
 */

/** Wrap a string of SVG as a blob the browser will treat as an image. */
export function svgBlob(svg) {
  return new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
}

/**
 * Rasterize a surface to a PNG blob at a whole multiple of its own size.
 *
 * @param {{svg: string, width: number, height: number}} drawn
 * @param {number} [scale]
 * @returns {Promise<Blob>}
 */
export async function toPng(drawn, scale = 1) {
  const url = URL.createObjectURL(svgBlob(drawn.svg));
  try {
    const image = new Image();
    image.width = drawn.width;
    image.height = drawn.height;
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error('save.nosvg'));
      image.src = url;
    });

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(drawn.width * scale);
    canvas.height = Math.round(drawn.height * scale);
    const context = canvas.getContext('2d');
    // The card is white and the page it is dropped into may not be, so the
    // background is painted rather than left transparent: a mock-up with a
    // see-through card is a mock-up of nothing.
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingQuality = 'high';
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    return await new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('save.nopng'));
      }, 'image/png');
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}
