/**
 * Pictures of codes, drawn here rather than checked in.
 *
 * The reader in tools/qr-barcode-reader/ takes pixels, so testing it needs
 * pixels. Checking in a folder of photographs would test the reader against
 * whatever those particular photographs happen to be; building the pictures
 * instead means a test can say what it is testing - "the same code, turned 37
 * degrees" - and a failure names the condition rather than a file.
 *
 * There is no canvas here and none is needed: an image is a flat RGBA array,
 * which is exactly what `ImageData` is, and the reader asks for nothing else.
 *
 * The transforms are deliberately crude. Nearest-neighbour rotation leaves
 * staircased edges and the warp leaves gaps where it stretches - which is
 * harsher than a camera, not kinder, and so is the right way round for a test.
 */

/** A blank white picture. */
function blank(width, height) {
  return { data: new Uint8ClampedArray(width * height * 4).fill(255), width, height };
}

function put(image, x, y, value) {
  const at = (y * image.width + x) * 4;
  image.data[at] = value;
  image.data[at + 1] = value;
  image.data[at + 2] = value;
  image.data[at + 3] = 255;
}

/**
 * A QR symbol, at `scale` pixels per module with `quiet` modules of margin.
 *
 * @param {{size: number, modules: Uint8Array}} qr  as `makeQr` returns it
 */
export function renderQr(qr, scale = 6, quiet = 4) {
  const side = (qr.size + quiet * 2) * scale;
  const image = blank(side, side);

  for (let row = 0; row < qr.size; row += 1) {
    for (let column = 0; column < qr.size; column += 1) {
      if (!qr.modules[row * qr.size + column]) continue;
      for (let y = 0; y < scale; y += 1) {
        for (let x = 0; x < scale; x += 1) {
          put(image, (quiet + column) * scale + x, (quiet + row) * scale + y, 0);
        }
      }
    }
  }
  return image;
}

/**
 * A linear barcode, `tall` pixels high. Its quiet zones are already in
 * `modules`, which is what `makeBarcode` returns.
 */
export function renderBars(modules, scale = 3, tall = 60) {
  const image = blank(modules.length * scale, tall);
  for (let i = 0; i < modules.length; i += 1) {
    if (!modules[i]) continue;
    for (let s = 0; s < scale; s += 1) {
      for (let y = 0; y < tall; y += 1) put(image, i * scale + s, y, 0);
    }
  }
  return image;
}

/** Turn a picture, leaving white where the corners used to be. */
export function rotate(image, degrees) {
  const angle = (degrees * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const width = Math.ceil(Math.abs(image.width * cos) + Math.abs(image.height * sin));
  const height = Math.ceil(Math.abs(image.width * sin) + Math.abs(image.height * cos));
  const out = blank(width, height);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const dx = x - width / 2;
      const dy = y - height / 2;
      const sx = Math.round(dx * cos + dy * sin + image.width / 2);
      const sy = Math.round(-dx * sin + dy * cos + image.height / 2);
      if (sx < 0 || sy < 0 || sx >= image.width || sy >= image.height) continue;
      put(out, x, y, image.data[(sy * image.width + sx) * 4]);
    }
  }
  return out;
}

/* --------------------------------------------------- the projective warp */

function squareToQuad(p) {
  const dx3 = p[0].x - p[1].x + p[2].x - p[3].x;
  const dy3 = p[0].y - p[1].y + p[2].y - p[3].y;
  if (dx3 === 0 && dy3 === 0) {
    return [p[1].x - p[0].x, p[2].x - p[1].x, p[0].x,
      p[1].y - p[0].y, p[2].y - p[1].y, p[0].y, 0, 0, 1];
  }
  const dx1 = p[1].x - p[2].x;
  const dx2 = p[3].x - p[2].x;
  const dy1 = p[1].y - p[2].y;
  const dy2 = p[3].y - p[2].y;
  const denominator = dx1 * dy2 - dx2 * dy1;
  const a13 = (dx3 * dy2 - dx2 * dy3) / denominator;
  const a23 = (dx1 * dy3 - dx3 * dy1) / denominator;
  return [
    p[1].x - p[0].x + a13 * p[1].x, p[3].x - p[0].x + a23 * p[3].x, p[0].x,
    p[1].y - p[0].y + a13 * p[1].y, p[3].y - p[0].y + a23 * p[3].y, p[0].y,
    a13, a23, 1,
  ];
}

function adjoint(m) {
  return [
    m[4] * m[8] - m[5] * m[7], m[2] * m[7] - m[1] * m[8], m[1] * m[5] - m[2] * m[4],
    m[5] * m[6] - m[3] * m[8], m[0] * m[8] - m[2] * m[6], m[2] * m[3] - m[0] * m[5],
    m[3] * m[7] - m[4] * m[6], m[1] * m[6] - m[0] * m[7], m[0] * m[4] - m[1] * m[3],
  ];
}

function times(a, b) {
  const out = new Array(9);
  for (let row = 0; row < 3; row += 1) {
    for (let column = 0; column < 3; column += 1) {
      out[row * 3 + column] = a[row * 3] * b[column]
        + a[row * 3 + 1] * b[3 + column]
        + a[row * 3 + 2] * b[6 + column];
    }
  }
  return out;
}

/**
 * Put the picture's four corners at four given points, which is what a
 * photograph of something not held flat does to it.
 *
 * The transform is built the other way round - destination to source - because
 * that is the direction that fills every output pixel exactly once.
 */
export function warp(image, corners, width = image.width, height = image.height) {
  const source = [
    { x: 0, y: 0 }, { x: image.width, y: 0 },
    { x: image.width, y: image.height }, { x: 0, y: image.height },
  ];
  const m = times(squareToQuad(source), adjoint(squareToQuad(corners)));
  const out = blank(width, height);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const w = m[6] * x + m[7] * y + m[8];
      const sx = Math.round((m[0] * x + m[1] * y + m[2]) / w);
      const sy = Math.round((m[3] * x + m[4] * y + m[5]) / w);
      if (sx < 0 || sy < 0 || sx >= image.width || sy >= image.height) continue;
      put(out, x, y, image.data[(sy * image.width + sx) * 4]);
    }
  }
  return out;
}

/* ------------------------------------------------------- and the spoiling */

/** Dark for light: a code printed in reverse. */
export function inverted(image) {
  const out = blank(image.width, image.height);
  for (let i = 0; i < image.data.length; i += 4) {
    const value = 255 - image.data[i];
    out.data[i] = value;
    out.data[i + 1] = value;
    out.data[i + 2] = value;
  }
  return out;
}

/**
 * Grain. Deterministic, because a test that fails one run in twenty is worse
 * than no test: the generator is a plain linear congruential one, seeded here.
 */
export function noisy(image, amount, seed = 12345) {
  const out = blank(image.width, image.height);
  let state = seed;
  const next = () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
  for (let i = 0; i < image.data.length; i += 4) {
    const value = image.data[i] + (next() - 0.5) * amount;
    out.data[i] = value;
    out.data[i + 1] = value;
    out.data[i + 2] = value;
  }
  return out;
}

/** Lit from one side, which is what defeats a single threshold for the picture. */
export function shaded(image, darkest = 0.35) {
  const out = blank(image.width, image.height);
  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const k = darkest + (1 - darkest) * (x / image.width);
      put(out, x, y, image.data[(y * image.width + x) * 4] * k);
    }
  }
  return out;
}

/** A small picture dropped into a big empty one, off to one side. */
export function placed(image, width, height, left, top) {
  const out = blank(width, height);
  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      if (left + x >= width || top + y >= height) continue;
      put(out, left + x, top + y, image.data[(y * image.width + x) * 4]);
    }
  }
  return out;
}
