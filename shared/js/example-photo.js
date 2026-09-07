/**
 * A photograph, drawn in the page rather than shipped with it.
 *
 * WHY IT IS DRAWN
 *
 * Half the tools here want a picture to demonstrate themselves on, and the
 * obvious way to give them one - put a JPEG under the tool and fetch it - is
 * the one thing this site cannot do. `connect-src` in config/site.toml names
 * no origin of our own, so the fetch is refused by the page's own policy, and
 * the live check in trust.js would report it if it were not: a request the
 * visitor never made, on the line whose whole job is to show there are none.
 * So the example is drawn, and what comes back is a File like any other.
 *
 * WHY IT LOOKS LIKE THIS
 *
 * It has to behave like a photograph, not merely look like one. A synthetic
 * picture of flat shapes compresses to almost nothing, which would make the
 * image compressor appear to work miracles and the quality slider appear to do
 * nothing at all. So the scene is built out of what actually costs a JPEG its
 * bytes: continuous tone in the sky, high-frequency detail in the grass, and a
 * layer of grain over all of it. A 1600x1200 frame lands around 400 KB at
 * quality 0.92, which is the size range a phone photograph arrives in.
 *
 * The same picture every time, because a demonstration somebody is comparing
 * two settings on must not change underneath them between presses. Every
 * random number below comes from the seeded generator, and there is no call to
 * Math.random anywhere in this file.
 */

/**
 * Mulberry32. Small, fast, and good enough for scattering grass.
 *
 * The point is not statistical quality but repeatability: the same seed has to
 * give the same picture in every browser, and Math.random cannot promise that
 * even within one.
 */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A ridgeline: two sine waves of different periods added together, which reads
 * as a hill horizon and needs no noise function to do it.
 */
function ridge(x, width, base, amplitude, phase) {
  const t = (x / width) * Math.PI * 2;
  return base + Math.sin(t + phase) * amplitude + Math.sin(t * 2.7 + phase * 1.9) * amplitude * 0.35;
}

/**
 * Draw the scene into a 2D context of the given size.
 *
 * Exported on its own because a few tools want the picture on a canvas they
 * already own - a frame of a video, a page of a PDF - rather than as a file.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width
 * @param {number} height
 * @param {object} [options]
 * @param {number} [options.seed]   same seed, same picture
 * @param {number} [options.shift]  moves the scene sideways, for callers that
 *   want several frames of one place rather than several different places
 */
export function drawPhoto(ctx, width, height, { seed = 20260907, shift = 0 } = {}) {
  const random = rng(seed);
  const horizon = height * 0.52;

  const sky = ctx.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, '#1b4a7a');
  sky.addColorStop(0.55, '#6ea3cc');
  sky.addColorStop(1, '#dfe6e2');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, horizon);

  const sunX = width * 0.72 - shift * 0.15;
  const sunY = horizon * 0.42;
  const glow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, height * 0.34);
  glow.addColorStop(0, 'rgba(255,246,214,0.95)');
  glow.addColorStop(0.35, 'rgba(255,230,170,0.35)');
  glow.addColorStop(1, 'rgba(255,230,170,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, horizon);

  // Clouds. Overlapping translucent ellipses give the soft edges and the
  // uneven density that a gradient alone will not, and they are what stops the
  // top half of the frame being a smooth ramp that costs no bytes at all.
  for (let i = 0; i < 26; i += 1) {
    const cx = random() * width * 1.2 - width * 0.1 - shift * 0.3;
    const cy = horizon * (0.1 + random() * 0.55);
    const rx = width * (0.05 + random() * 0.13);
    const ry = rx * (0.18 + random() * 0.22);
    ctx.fillStyle = `rgba(255,255,255,${0.10 + random() * 0.22})`;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, random() * 0.3 - 0.15, 0, Math.PI * 2);
    ctx.fill();
  }

  // Three ranges of hills, each paler and higher than the one in front of it,
  // which is the cheapest convincing depth cue there is.
  const ranges = [
    { base: horizon * 0.82, amp: height * 0.05, fill: '#8ba7ad', phase: 0.4 },
    { base: horizon * 0.9, amp: height * 0.07, fill: '#5f7f84', phase: 2.1 },
    { base: horizon * 0.98, amp: height * 0.05, fill: '#41595f', phase: 3.8 },
  ];
  for (const range of ranges) {
    ctx.fillStyle = range.fill;
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    for (let x = 0; x <= width; x += 4) {
      ctx.lineTo(x, ridge(x + shift, width, range.base, range.amp, range.phase));
    }
    ctx.lineTo(width, horizon);
    ctx.closePath();
    ctx.fill();
  }

  const water = ctx.createLinearGradient(0, horizon, 0, height * 0.72);
  water.addColorStop(0, '#3d5f6b');
  water.addColorStop(1, '#223b46');
  ctx.fillStyle = water;
  ctx.fillRect(0, horizon, width, height * 0.72 - horizon);

  // The sun's reflection, broken into horizontal strokes the way water breaks
  // it. Bright, narrow and irregular: a lot of local contrast in a small area,
  // which is exactly what a quality slider shows first.
  for (let i = 0; i < 140; i += 1) {
    const y = horizon + random() * (height * 0.72 - horizon);
    const spread = (y - horizon) / (height * 0.72 - horizon);
    const w = width * (0.01 + random() * 0.06) * (0.4 + spread);
    const x = sunX - w / 2 + (random() - 0.5) * width * 0.18 * (0.3 + spread);
    ctx.fillStyle = `rgba(255,238,196,${0.5 - spread * 0.35})`;
    ctx.fillRect(x, y, w, Math.max(1, height * 0.004));
  }

  const bank = ctx.createLinearGradient(0, height * 0.72, 0, height);
  bank.addColorStop(0, '#3f5230');
  bank.addColorStop(1, '#22301b');
  ctx.fillStyle = bank;
  ctx.fillRect(0, height * 0.72, width, height * 0.28);

  // Grass. Thousands of one-pixel strokes: the most expensive thing in the
  // frame for a compressor, and the first place blocking shows up.
  const blades = Math.round(width * height * 0.004);
  for (let i = 0; i < blades; i += 1) {
    const x = random() * width;
    const y = height * 0.72 + random() * height * 0.28;
    const depth = (y - height * 0.72) / (height * 0.28);
    const len = height * (0.008 + random() * 0.03) * (0.4 + depth);
    const green = Math.round(70 + random() * 90 + depth * 30);
    ctx.strokeStyle = `rgba(${Math.round(green * 0.55)},${green},${Math.round(green * 0.4)},0.75)`;
    ctx.lineWidth = Math.max(1, height * 0.0015 * (0.5 + depth));
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (random() - 0.5) * len * 0.6, y - len);
    ctx.stroke();
  }

  grain(ctx, width, height, random);
}

/**
 * Film grain, applied to the whole frame.
 *
 * Without it every flat region is a perfect ramp and JPEG spends nothing on
 * it, so the compressor's before-and-after numbers stop resembling anything a
 * visitor would see with a real photograph. It is the last step because it has
 * to sit over everything, sky included.
 */
function grain(ctx, width, height, random) {
  const image = ctx.getImageData(0, 0, width, height);
  const { data } = image;
  for (let i = 0; i < data.length; i += 4) {
    const n = (random() - 0.5) * 16;
    data[i] = clamp(data[i] + n);
    data[i + 1] = clamp(data[i + 1] + n);
    data[i + 2] = clamp(data[i + 2] + n);
  }
  ctx.putImageData(image, 0, 0);
}

const clamp = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);

/**
 * A canvas of the given size with the scene already on it.
 *
 * A plain DOM canvas rather than an OffscreenCanvas: every caller here is on
 * the main thread anyway, and `toBlob` is available on both far longer than
 * `convertToBlob` has been.
 */
export function photoCanvas(width, height, options) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  drawPhoto(canvas.getContext('2d', { willReadFrequently: true }), width, height, options);
  return canvas;
}

/**
 * Encode a canvas and wrap it up as a File, which is what every tool's
 * `onFiles` is expecting to be handed.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {string} name  the file name the visitor will see on the result
 * @param {string} [type]
 * @param {number} [quality]
 * @returns {Promise<File>}
 */
export async function canvasFile(canvas, name, type = 'image/jpeg', quality = 0.92) {
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((made) => (made ? resolve(made) : reject(new Error('encode'))), type, quality);
  });
  return new File([blob], name, { type: blob.type, lastModified: Date.now() });
}

/**
 * The common case in one call: draw a photograph and hand back the File.
 */
export async function photoFile(name, {
  width = 1600, height = 1200, type, quality, ...scene
} = {}) {
  return canvasFile(photoCanvas(width, height, scene), name, type, quality);
}
