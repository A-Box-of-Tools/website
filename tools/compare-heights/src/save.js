/**
 * Taking the picture away: the SVG as it stands, and that same SVG as a PNG.
 *
 * The PNG is not a second rendering. The string of markup on screen is handed
 * to the browser as a blob and painted onto a canvas, so the download cannot
 * disagree with the preview about a colour, a font or where a label sits. That
 * is also what makes it possible with the network unplugged: the chart has no
 * EXTERNAL reference in it - no font file, no stylesheet, no linked image - so
 * nothing is fetched, the canvas is not tainted, and `toBlob` gives back
 * bytes.
 *
 * An uploaded photograph does put an <image> in the chart, which reads like an
 * exception to that and is not one: its href is a `data:` URI of bytes this
 * page encoded a moment earlier, so it is the picture itself rather than a
 * reference to one. The browser was asked directly before this was relied on -
 * a chart with an embedded raster in it draws, does not taint the canvas, and
 * still rasterises to a PNG. See src/import-image.js.
 *
 * Image smoothing is left ON here, which is the one place this differs from
 * the same trick in the QR generator: that tool wants hard edges on a grid of
 * modules, and a chart is curves and text.
 */

/** Wrap a string of SVG as a blob the browser will treat as an image. */
export function svgBlob(svg) {
  return new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
}

/**
 * Rasterize a chart to a PNG blob, at its own size or a multiple of it.
 *
 * @param {string} svg
 * @param {{width: number, height: number}} size  as the chart reported it
 * @param {number} [multiple]
 * @returns {Promise<Blob>}
 */
export async function svgToPng(svg, size, multiple = 1) {
  const url = URL.createObjectURL(svgBlob(svg));

  try {
    const image = new Image();
    image.width = size.width;
    image.height = size.height;
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error('render.nosvg'));
      image.src = url;
    });

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(size.width * multiple);
    canvas.height = Math.round(size.height * multiple);
    canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);

    return await new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('render.nopng'));
      }, 'image/png');
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Hand a blob to the browser as a download. Nothing leaves the machine. */
export function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.rel = 'noopener';
  document.body.append(link);
  link.click();
  link.remove();
  // Revoked on a later turn of the event loop: revoking it at once can beat
  // the download starting in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
