/**
 * Drawing: modules in, an SVG out, and that SVG rasterized to a PNG.
 *
 * There is one drawing routine per kind of code and not two, which is the
 * point of this file. The picture on screen, the SVG you download and the PNG
 * you download are all the same string of markup - the PNG is that SVG painted
 * onto a canvas at its own size. A tool with a separate canvas renderer has two
 * things to keep in step and eventually ships a PNG that disagrees with the
 * vector beside it.
 *
 * Everything is drawn on a whole number of pixels per module. A QR code whose
 * modules land on half a pixel is a QR code with grey edges, and grey edges are
 * what makes a scanner hesitate under bad light.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

/** XML-escape. Only the three characters that can end an attribute or a tag. */
function escape(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Merge each row's dark modules into as few rectangles as they will go. */
function runsToPath(isDark, width, height, scale, offsetX = 0, offsetY = 0) {
  const parts = [];
  for (let y = 0; y < height; y += 1) {
    let x = 0;
    while (x < width) {
      if (!isDark(x, y)) {
        x += 1;
        continue;
      }
      let run = 1;
      while (x + run < width && isDark(x + run, y)) run += 1;
      parts.push(`M${(offsetX + x) * scale} ${(offsetY + y) * scale}`
        + `h${run * scale}v${scale}h-${run * scale}z`);
      x += run;
    }
  }
  return parts.join('');
}

/** The opening tag, shared so that every code this tool draws carries the same one. */
function open(width, height, background) {
  const fill = background === 'none'
    ? ''
    : `<rect width="${width}" height="${height}" fill="${escape(background)}"/>`;
  return `<svg xmlns="${SVG_NS}" width="${width}" height="${height}" `
    + `viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges">${fill}`;
}

/**
 * A QR code as an SVG.
 *
 * @param {{size: number, modules: Uint8Array}} qr from makeQr
 * @param {{scale: number, quiet: number, foreground: string, background: string}} style
 *   `scale` is pixels per module, `quiet` the margin in modules.
 */
export function qrSvg(qr, style) {
  const across = qr.size + style.quiet * 2;
  const pixels = across * style.scale;
  const dark = (x, y) => qr.modules[y * qr.size + x] === 1;

  const path = runsToPath(dark, qr.size, qr.size, style.scale, style.quiet, style.quiet);

  return `${open(pixels, pixels, style.background)}`
    + `<path fill="${escape(style.foreground)}" d="${path}"/></svg>`;
}

/**
 * A linear barcode as an SVG, with its digits under it.
 *
 * The guard bars of a retail code run down past the text rather than stopping
 * level with it. That is not decoration either: those long bars are how a
 * scanner finds the two ends of the symbol when it crosses the label at an
 * angle.
 */
export function barcodeSvg(code, style) {
  const width = code.modules.length * style.scale;
  const fontSize = style.text ? Math.max(8, style.scale * 7) : 0;
  const textGap = style.text ? Math.round(fontSize * 0.25) : 0;
  const height = style.height + (style.text ? fontSize + textGap : 0);
  const guardExtra = style.text ? fontSize * 0.6 : 0;

  const parts = [open(width, height, style.background)];
  const fill = escape(style.foreground);

  let x = 0;
  while (x < code.modules.length) {
    if (code.modules[x] === 0) {
      x += 1;
      continue;
    }
    const guard = code.guards[x] === 1;
    let run = 1;
    while (x + run < code.modules.length && code.modules[x + run] === 1
      && (code.guards[x + run] === 1) === guard) run += 1;

    const barHeight = Math.round(style.height + (guard ? guardExtra : 0));
    parts.push(`<rect x="${x * style.scale}" y="0" width="${run * style.scale}" `
      + `height="${barHeight}" fill="${fill}"/>`);
    x += run;
  }

  if (style.text) {
    // A monospaced stack, because the digits under a retail code are meant to
    // line up with the halves of the symbol above them.
    const baseline = height - Math.round(fontSize * 0.15);
    for (const label of code.labels) {
      const middle = ((label.from + label.to) / 2) * style.scale;
      parts.push(`<text x="${middle}" y="${baseline}" fill="${fill}" `
        + `font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" `
        + `font-size="${fontSize}" text-anchor="middle">${escape(label.text)}</text>`);
    }
  }

  parts.push('</svg>');
  return parts.join('');
}

/** The dimensions an SVG string declares, read back out of its own markup. */
export function sizeOfSvg(svg) {
  const width = Number(/width="(\d+(?:\.\d+)?)"/.exec(svg)?.[1] ?? 0);
  const height = Number(/height="(\d+(?:\.\d+)?)"/.exec(svg)?.[1] ?? 0);
  return { width, height };
}

/**
 * Rasterize an SVG string to a PNG blob, at its own size or a multiple of it.
 *
 * The SVG is handed to the browser as a blob URL and drawn onto a canvas. It
 * has no external reference of any kind - no font file, no image, no
 * stylesheet - so nothing is fetched, the canvas is not tainted, and
 * `toBlob` gives back the bytes.
 */
export async function svgToPng(svg, multiple = 1) {
  const { width, height } = sizeOfSvg(svg);
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));

  try {
    const image = new Image();
    image.width = width;
    image.height = height;
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error('this browser would not draw the SVG'));
      image.src = url;
    });

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * multiple);
    canvas.height = Math.round(height * multiple);
    const context = canvas.getContext('2d');
    context.imageSmoothingEnabled = false;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    return await new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('this browser would not write a PNG'));
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
  // Revoked on the next turn of the event loop: revoking it immediately can
  // beat the download starting in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
