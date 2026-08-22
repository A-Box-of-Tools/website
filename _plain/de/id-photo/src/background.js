/**
 * The background check: is what is behind the head the colour it has to be,
 * and is it the same colour everywhere?
 *
 * Two questions, and the second is the one that actually gets photographs
 * rejected. Almost nobody submits a photo with a bookcase in it. Enormous
 * numbers of people submit a photo taken a foot from a white wall, with a
 * shadow of their own head across it, and "plain white background" is not a
 * paint colour, it is a statement about shadows.
 *
 * HOW IT LOOKS. Only the parts of the frame that are background are sampled: a
 * band across the top and a band down each side, stopping above the shoulders.
 * The middle is skipped because it is a face, and the bottom is skipped because
 * it is clothing. That is a fixed shape rather than a segmentation - it needs no
 * model, it runs in a millisecond, and where it is wrong it is wrong in the safe
 * direction, because sampling a bit of hair drags the reading towards "not
 * uniform" rather than towards "fine".
 *
 * WHAT IT MEASURES IN. CIE Lab and a plain Delta-E, not RGB distance. Two greys
 * forty RGB units apart are hard to tell apart; forty units of blue is a
 * different colour. A checker that reported the first as a failure and the
 * second as a pass would be worse than no checker, because it would be
 * confidently wrong in both directions.
 *
 * WHAT IT WILL NOT DO. It will not replace the background. Cutting a person out
 * of a photograph is a segmentation model - weights to ship and an inference
 * runtime to run them in - and a bad one eats the hair of exactly the people
 * whose photographs already get rejected most often. This tool measures and
 * reports, and tells you to move a foot further from the wall, which is the fix
 * that actually works.
 *
 * Everything below is arithmetic over a pixel array. It reads no file, touches
 * no canvas and sends nothing anywhere.
 */

/* ------------------------------------------------------------------ colour */

/** "#e8eaed" -> [232, 234, 237]. Accepts the three-digit form too. */
export function hexToRgb(hex) {
  const text = String(hex).trim().replace(/^#/, '');
  const full = text.length === 3 ? text.replace(/./g, (ch) => ch + ch) : text;
  if (!/^[0-9a-f]{6}$/i.test(full)) return [255, 255, 255];
  return [
    Number.parseInt(full.slice(0, 2), 16),
    Number.parseInt(full.slice(2, 4), 16),
    Number.parseInt(full.slice(4, 6), 16),
  ];
}

export function rgbToHex([r, g, b]) {
  const pair = (value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0');
  return `#${pair(r)}${pair(g)}${pair(b)}`;
}

/** The sRGB transfer curve, undone. Everything below is linear light. */
const linear = (channel) => {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
};

/** D65, the white point every sRGB picture is relative to. */
const WHITE = [0.95047, 1, 1.08883];

const labCurve = (value) => (value > 0.008856 ? Math.cbrt(value) : 7.787 * value + 16 / 116);

/**
 * sRGB to CIE Lab.
 *
 * The long way round - sRGB to linear, linear to XYZ, XYZ to Lab - because the
 * short ways are all approximations that go wrong at exactly the light end of
 * the scale where every one of these backgrounds lives.
 */
export function rgbToLab([r, g, b]) {
  const rl = linear(r);
  const gl = linear(g);
  const bl = linear(b);

  const x = (0.4124 * rl + 0.3576 * gl + 0.1805 * bl) / WHITE[0];
  const y = (0.2126 * rl + 0.7152 * gl + 0.0722 * bl) / WHITE[1];
  const z = (0.0193 * rl + 0.1192 * gl + 0.9505 * bl) / WHITE[2];

  const fx = labCurve(x);
  const fy = labCurve(y);
  const fz = labCurve(z);

  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

/** Delta-E 1976: the straight-line distance between two Lab colours. */
export function deltaE(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

/* ---------------------------------------------------------------- sampling */

/**
 * Is this pixel in the part of the frame that ought to be background?
 *
 * A band across the top, and a band down each side that stops before the
 * shoulders. Written as one predicate so the same shape can be drawn on the
 * preview as an overlay - what is checked is exactly what is shown.
 *
 * @param {number} fx  across, 0 to 1
 * @param {number} fy  down, 0 to 1
 */
export const inBackgroundZone = (fx, fy) => (
  fy <= 0.16 || (fy <= 0.55 && (fx <= 0.12 || fx >= 0.88))
);

/**
 * @typedef {object} Reading
 * @property {number[]} rgb        the average colour of the background zone
 * @property {string} hex
 * @property {number[]} lab
 * @property {number} spread       average Delta-E from that average
 * @property {number} worst        the 95th-percentile Delta-E from it
 * @property {number} lightRange   difference in lightness across the three sides
 * @property {number} samples
 */

/**
 * Read the background zone of one decoded picture.
 *
 * `stride` skips pixels: at 4, one pixel in sixteen is read, which on any
 * photograph large enough to be an ID photo is several thousand samples and
 * takes under a millisecond. Reading every pixel would change no answer here
 * to a visible number of decimal places.
 *
 * @param {{data: Uint8ClampedArray|number[], width: number, height: number}} image
 * @param {{stride?: number}} [options]
 * @returns {Reading|null} null when the zone held nothing worth averaging
 */
export function readBackground(image, { stride = 4 } = {}) {
  const { data, width, height } = image;
  if (!width || !height) return null;

  let sum = [0, 0, 0];
  let samples = 0;
  const labs = [];
  // Three separate averages, so a shadow down one side shows up as a
  // difference between sides rather than being averaged away into the whole.
  const sides = { top: [0, 0, 0, 0], left: [0, 0, 0, 0], right: [0, 0, 0, 0] };

  for (let y = 0; y < height; y += stride) {
    const fy = y / height;
    for (let x = 0; x < width; x += stride) {
      const fx = x / width;
      if (!inBackgroundZone(fx, fy)) continue;

      const at = (y * width + x) * 4;
      const rgb = [data[at], data[at + 1], data[at + 2]];
      sum = [sum[0] + rgb[0], sum[1] + rgb[1], sum[2] + rgb[2]];
      labs.push(rgbToLab(rgb));
      samples += 1;

      const side = fy <= 0.16 ? sides.top : fx <= 0.12 ? sides.left : sides.right;
      side[0] += rgb[0];
      side[1] += rgb[1];
      side[2] += rgb[2];
      side[3] += 1;
    }
  }

  if (!samples) return null;

  const rgb = [sum[0] / samples, sum[1] / samples, sum[2] / samples];
  const lab = rgbToLab(rgb);

  const distances = labs.map((one) => deltaE(one, lab)).sort((a, b) => a - b);
  const spread = distances.reduce((total, one) => total + one, 0) / distances.length;
  const worst = distances[Math.min(distances.length - 1, Math.floor(distances.length * 0.95))];

  const lightness = Object.values(sides)
    .filter((side) => side[3] > 0)
    .map((side) => rgbToLab([side[0] / side[3], side[1] / side[3], side[2] / side[3]])[0]);

  return {
    rgb,
    hex: rgbToHex(rgb),
    lab,
    spread,
    worst,
    lightRange: lightness.length > 1 ? Math.max(...lightness) - Math.min(...lightness) : 0,
    samples,
  };
}

/* ---------------------------------------------------------------- verdicts */

/** Above this the unevenness is a shadow rather than sensor noise. */
const SPREAD_LIMIT = 6;

/** Above this, one side of the frame is visibly darker than another. */
const SIDE_LIMIT = 5;

/**
 * What to tell somebody about the reading.
 *
 * Three findings rather than one verdict, because they have three different
 * fixes and a single "rejected" would send people to change the wrong thing:
 * the wrong colour is a different wall, unevenness is a shadow, and a dark side
 * is the light being on one side of you.
 *
 * @param {Reading|null} reading
 * @param {{hex: string, tolerance: number, label: string}} required
 */
export function checkBackground(reading, required) {
  if (!reading) {
    return { status: 'unknown', findings: [], distance: 0 };
  }

  const wanted = rgbToLab(hexToRgb(required.hex));
  const distance = deltaE(reading.lab, wanted);

  const findings = [];

  if (distance > required.tolerance * 2) {
    findings.push({
      key: 'colour',
      status: 'bad',
      text: `The background reads ${reading.hex}, which is a long way from ${required.label.toLowerCase()}.`,
    });
  } else if (distance > required.tolerance) {
    findings.push({
      key: 'colour',
      status: 'warn',
      text: `The background reads ${reading.hex} - close to ${required.label.toLowerCase()}, but not quite it.`,
    });
  } else {
    findings.push({
      key: 'colour',
      status: 'good',
      text: `The background reads ${reading.hex}, which passes as ${required.label.toLowerCase()}.`,
    });
  }

  if (reading.spread > SPREAD_LIMIT * 2 || reading.worst > SPREAD_LIMIT * 4) {
    findings.push({
      key: 'uniform',
      status: 'bad',
      text: 'It is not one flat colour - there is a shadow, a pattern or an object behind you.',
    });
  } else if (reading.spread > SPREAD_LIMIT) {
    findings.push({
      key: 'uniform',
      status: 'warn',
      text: 'Slightly uneven. Standing a foot further from the wall is usually the whole fix.',
    });
  } else {
    findings.push({
      key: 'uniform',
      status: 'good',
      text: 'Evenly lit, with no shadow behind the head.',
    });
  }

  if (reading.lightRange > SIDE_LIMIT * 2) {
    findings.push({
      key: 'sides',
      status: 'bad',
      text: 'One side of the background is much darker than the other, which reads as side lighting.',
    });
  } else if (reading.lightRange > SIDE_LIMIT) {
    findings.push({
      key: 'sides',
      status: 'warn',
      text: 'One side is a little darker than the other.',
    });
  }

  const status = findings.some((one) => one.status === 'bad')
    ? 'bad'
    : findings.some((one) => one.status === 'warn') ? 'warn' : 'good';

  return { status, findings, distance };
}

/* --------------------------------------------------------------- signature */

/** Below this lightness a pixel is ink rather than paper. */
const INK_LIMIT = 55;

/**
 * The signature check, which is a different question entirely.
 *
 * A signature is not a portrait: what matters is that the paper is light, that
 * there is ink on it, and that there is not so much ink that the crop has taken
 * in the ruled line or the edge of the page. The three numbers are the whole
 * check, and they are the three things that make a form reject one.
 *
 * @param {{data: Uint8ClampedArray|number[], width: number, height: number}} image
 */
export function readSignature(image, { stride = 2 } = {}) {
  const { data, width, height } = image;
  if (!width || !height) return null;

  let ink = 0;
  let paperSum = 0;
  let paperCount = 0;
  let samples = 0;

  for (let y = 0; y < height; y += stride) {
    for (let x = 0; x < width; x += stride) {
      const at = (y * width + x) * 4;
      const lightness = rgbToLab([data[at], data[at + 1], data[at + 2]])[0];
      samples += 1;
      if (lightness < INK_LIMIT) {
        ink += 1;
      } else {
        paperSum += lightness;
        paperCount += 1;
      }
    }
  }

  if (!samples) return null;
  return {
    coverage: ink / samples,
    paperLightness: paperCount ? paperSum / paperCount : 0,
    samples,
  };
}

/** @param {ReturnType<typeof readSignature>} reading */
export function checkSignature(reading) {
  if (!reading) return { status: 'unknown', findings: [] };
  const findings = [];

  if (reading.coverage < 0.01) {
    findings.push({
      key: 'ink',
      status: 'bad',
      text: 'Almost no ink in the crop. Either the box is off the signature, or the pen was too light to photograph.',
    });
  } else if (reading.coverage > 0.35) {
    findings.push({
      key: 'ink',
      status: 'warn',
      text: 'A great deal of dark pixels - check the crop has not taken in a ruled line or the edge of the page.',
    });
  } else {
    findings.push({
      key: 'ink',
      status: 'good',
      text: `Ink covers ${(reading.coverage * 100).toFixed(1)}% of the crop, which reads as a signature.`,
    });
  }

  if (reading.paperLightness < 75) {
    findings.push({
      key: 'paper',
      status: 'bad',
      text: 'The paper is coming out grey rather than white. More light on the page, or a scan rather than a photo.',
    });
  } else if (reading.paperLightness < 88) {
    findings.push({
      key: 'paper',
      status: 'warn',
      text: 'The paper is a little dull. Most forms want a clean white page behind the signature.',
    });
  } else {
    findings.push({ key: 'paper', status: 'good', text: 'The paper is clean and white.' });
  }

  const status = findings.some((one) => one.status === 'bad')
    ? 'bad'
    : findings.some((one) => one.status === 'warn') ? 'warn' : 'good';

  return { status, findings };
}
