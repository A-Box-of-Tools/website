/**
 * How big the picture comes out.
 *
 * This is the whole of what the tool decides. Everything after it is one
 * `drawImage` and one `toBlob`, so a mistake here does not throw and does not
 * look like a bug: it hands somebody a file one pixel short of the size they
 * were asked for, or a logo squashed by two percent, and they find out when
 * the thing they pasted it into rejects it.
 *
 * A vector has no size of its own to lose, which is what makes this different
 * from resizing a photograph. There is no "never enlarge" rule to enforce and
 * no quality argument to have: 4000 pixels from a 24-pixel icon is exactly as
 * sharp as 24 was. The only real limits are the ones the machine imposes, and
 * they are at the bottom of this file.
 */

/** How the size is asked for. */
export const MODES = {
  scale: 'scale',
  width: 'width',
  height: 'height',
  longest: 'longest',
  box: 'box',
};

/** What happens when a box is a different shape from the drawing. */
export const FITS = {
  fit: 'fit',
  pad: 'pad',
  stretch: 'stretch',
};

/**
 * The biggest canvas worth attempting.
 *
 * Browsers do not agree and none of them says so out loud: over the limit,
 * `toBlob` hands back null or a blank image rather than an error. Chrome and
 * Firefox stop at 32,767 pixels on a side and around 268 megapixels of area;
 * Safari on an iPhone gives up at 16,777,216 pixels of area - 4096 x 4096 -
 * and has done for years.
 *
 * So there are two numbers. Over `WARN_PIXELS` the page says which machines
 * will struggle; over `MAX_PIXELS` it refuses, because 100 megapixels is 400 MB
 * of canvas before the encoder has been handed a byte, and a tab that is killed
 * mid-render looks like the tool losing your file.
 */
export const MAX_SIDE = 16384;
export const MAX_PIXELS = 100_000_000;
export const WARN_PIXELS = 16_777_216;

/**
 * Work out the canvas, and where the drawing lands on it.
 *
 * @param {{width: number, height: number, ratio: number}} intrinsic
 *   what the file says it is, from svg.js
 * @param {object} settings
 * @param {string} settings.mode     one of MODES
 * @param {number} [settings.scale]  a multiplier, for MODES.scale
 * @param {number} [settings.width]  pixels, for MODES.width and MODES.box
 * @param {number} [settings.height] pixels, for MODES.height and MODES.box
 * @param {number} [settings.longest] pixels, for MODES.longest
 * @param {string} [settings.fit]    one of FITS, for MODES.box
 * @returns {{width: number, height: number, draw: {x: number, y: number,
 *   width: number, height: number}, padded: boolean, stretch: boolean}}
 */
export function planSize(intrinsic, settings) {
  const ratio = intrinsic.ratio > 0 ? intrinsic.ratio : 1;
  const { mode } = settings;

  if (mode === MODES.box) return boxPlan(ratio, settings);

  let width;
  let height;

  if (mode === MODES.scale) {
    const scale = positive(settings.scale) ?? 1;
    width = intrinsic.width * scale;
    height = intrinsic.height * scale;
  } else if (mode === MODES.width) {
    width = positive(settings.width) ?? intrinsic.width;
    height = width / ratio;
  } else if (mode === MODES.height) {
    height = positive(settings.height) ?? intrinsic.height;
    width = height * ratio;
  } else if (mode === MODES.longest) {
    const longest = positive(settings.longest) ?? Math.max(intrinsic.width, intrinsic.height);
    if (ratio >= 1) {
      width = longest;
      height = longest / ratio;
    } else {
      height = longest;
      width = longest * ratio;
    }
  } else {
    throw new Error(`unknown size mode: ${mode}`);   // a bug here, never a file
  }

  return whole(px(width), px(height));
}

/** A box with two sides given, and the three answers to a shape that disagrees. */
function boxPlan(ratio, settings) {
  const boxWidth = px(positive(settings.width) ?? 0);
  const boxHeight = px(positive(settings.height) ?? 0);
  const fit = settings.fit ?? FITS.fit;

  // One side left blank is not an error, it is the ordinary way to say "this
  // wide, and however tall that makes it". Falling through to the whole box
  // would draw the picture into a one-pixel strip.
  if (!settings.width) return whole(px(boxHeight * ratio), boxHeight);
  if (!settings.height) return whole(boxWidth, px(boxWidth / ratio));

  if (fit === FITS.stretch) {
    const plan = whole(boxWidth, boxHeight);
    plan.stretch = true;
    return plan;
  }

  // The largest rectangle of the drawing's own shape that fits in the box.
  // Whichever side runs out first decides, which is the same arithmetic
  // `object-fit: contain` does.
  const drawWidth = px(Math.min(boxWidth, boxHeight * ratio));
  const drawHeight = px(Math.min(boxHeight, boxWidth / ratio));

  if (fit === FITS.pad) {
    return {
      width: boxWidth,
      height: boxHeight,
      draw: {
        x: Math.round((boxWidth - drawWidth) / 2),
        y: Math.round((boxHeight - drawHeight) / 2),
        width: drawWidth,
        height: drawHeight,
      },
      padded: drawWidth !== boxWidth || drawHeight !== boxHeight,
      stretch: false,
    };
  }

  // FITS.fit: no padding at all. The canvas is the picture, which is what
  // somebody who asked for "inside 800 x 600" almost always meant - a PNG with
  // transparent bars down the sides is a surprise, not a service.
  return whole(drawWidth, drawHeight);
}

/** A canvas the drawing fills exactly. */
const whole = (width, height) => ({
  width,
  height,
  draw: { x: 0, y: 0, width, height },
  padded: false,
  stretch: false,
});

/** Pixels are whole, and a zero-pixel canvas cannot be drawn on. */
const px = (n) => Math.max(1, Math.round(n));

const positive = (n) => (Number.isFinite(n) && n > 0 ? n : null);

/**
 * The same plan at a device-pixel multiple, for the @2x and @3x copies.
 *
 * Multiplied rather than re-planned, so the copies cannot disagree with the
 * one they are copies of: an @2x that was not exactly twice the size of its
 * @1x would be the one bug in an asset set nobody notices until a phone draws
 * it half a pixel off.
 */
export function atDensity(plan, multiple) {
  if (multiple === 1) return plan;
  return {
    width: plan.width * multiple,
    height: plan.height * multiple,
    draw: {
      x: plan.draw.x * multiple,
      y: plan.draw.y * multiple,
      width: plan.draw.width * multiple,
      height: plan.draw.height * multiple,
    },
    padded: plan.padded,
    stretch: plan.stretch,
  };
}

/**
 * Whether this is a canvas a browser will actually produce.
 *
 * @returns {{ok: boolean, warn: boolean, key: string, values: object}} `key`
 *   names the sentence and is empty when there is nothing to say; a value
 *   that is itself `{key, values}` is a phrase the caller resolves first.
 */
export function checkLimits(plan) {
  const pixels = plan.width * plan.height;

  if (plan.width > MAX_SIDE || plan.height > MAX_SIDE) {
    return {
      ok: false,
      warn: false,
      key: 'limit.side',
      values: { width: plan.width, height: plan.height, max: MAX_SIDE },
    };
  }

  if (pixels > MAX_PIXELS) {
    return {
      ok: false,
      warn: false,
      key: 'limit.pixels',
      values: { size: megapixels(pixels), mb: Math.round(pixels * 4 / 1e6) },
    };
  }

  if (pixels > WARN_PIXELS) {
    return {
      ok: true,
      warn: true,
      key: 'limit.safari',
      values: { size: megapixels(pixels), ceiling: Math.round(WARN_PIXELS / 1e6) },
    };
  }

  return { ok: true, warn: false, key: '', values: {} };
}

/** A phrase and its blank, not a sentence: the word for it is not English. */
export const megapixels = (pixels) => {
  const mp = pixels / 1e6;
  return { key: 'unit.megapixels', values: { n: mp < 10 ? mp.toFixed(1) : Math.round(mp) } };
};

/**
 * One sentence saying what is about to happen, built from the same numbers the
 * renderer is handed - so the page cannot describe something other than what
 * runs.
 */
export function describePlan(plan, intrinsic, densities, t) {
  const parts = [t('plan.from', {
    fromWidth: intrinsic.width,
    fromHeight: intrinsic.height,
    width: plan.width,
    height: plan.height,
    times: times(plan.width / intrinsic.width),
  })];

  // A clause spliced into a sentence cannot be translated, so each of the
  // three shapes this can take is a sentence of its own.
  if (plan.stretch) parts.push(t('plan.stretched'));
  else if (plan.padded) parts.push(t('plan.padded'));

  if (densities.length > 1) {
    const list = densities.slice(1)
      .map((d) => t('plan.density', { width: plan.width * d, height: plan.height * d, d }))
      .reduce((a, b) => t('join.and', { a, b }));
    parts.push(t('plan.plus', { list }));
  }

  return parts.reduce((a, b) => t('join.sentences', { a, b }));
}

/** "2x", "0.5x", "1.33x" - said the same way wherever a scale is shown. */
export function times(factor) {
  if (!Number.isFinite(factor) || factor <= 0) return '?';
  if (Math.abs(factor - Math.round(factor)) < 0.005) return `${Math.round(factor)}×`;
  return `${factor.toFixed(2).replace(/0$/, '')}×`;
}
