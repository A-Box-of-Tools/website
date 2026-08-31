/**
 * Heights: what somebody typed, and what the ruler says back.
 *
 * A height chart has one hard problem and it is not the drawing. It is that
 * "5'8" and "173" and "1.73 m" are the same person, that half the world writes
 * one of those and half the other, and that a tool which guesses wrong draws a
 * confident picture of the wrong thing. So every route in this file ends at a
 * number of centimetres, the page shows that number back in both systems, and
 * the two ambiguous cases - a bare number, and a bare number with a decimal
 * point - are resolved by rules written down here and repeated on the page
 * rather than by whichever regular expression happened to match first.
 *
 * No DOM and no words. What a mistake is called comes back as a phrase key for
 * the caller to look up, because a sentence written here would be English on
 * fourteen pages that are not.
 */

const CM_PER_INCH = 2.54;
const CM_PER_FOOT = 30.48;

/**
 * Below this a figure would be a line, and above it the ruler stops meaning
 * anything. Both numbers are quoted on the page, in the two phrases a height
 * outside them resolves to.
 */
const MIN_CM = 5;
const MAX_CM = 1200;

/** Curly quotes and the prime marks, which are what a phone keyboard produces. */
const QUOTES = /[\u2018\u2019\u02B9\u2032]/g;
const DOUBLES = /[\u201C\u201D\u02BA\u2033]/g;

// Two literals joined, rather than one expression built out of a string: a
// regular expression written as a string needs every backslash doubled, and
// this one was written that way once and shipped matching the letter d.
const FEET = /^(\d+(?:\.\d+)?)\s*(?:'|ft|feet|foot)/;
const INCH_TAIL = /\s*(?:(\d+(?:\.\d+)?)\s*(?:"|in|ins|inch|inches)?)?$/;
const FEET_AND_INCHES = new RegExp(FEET.source + INCH_TAIL.source);
const INCHES = /^(\d+(?:\.\d+)?)\s*(?:"|in|ins|inch|inches)$/;
const METRIC = /^(\d+(?:\.\d+)?)\s*(mm|cm|m|millimet(?:re|er)s?|centimet(?:re|er)s?|met(?:re|er)s?)$/;
const BARE = /^(\d+(?:\.\d+)?)$/;

const METRIC_CM = {
  mm: 0.1, millimetre: 0.1, millimeter: 0.1,
  cm: 1, centimetre: 1, centimeter: 1,
  m: 100, metre: 100, meter: 100,
};

/** `centimetres`, `centimeters`, `cm` - all of them, to the one multiplier. */
function metricScale(word) {
  const singular = word.replace(/s$/, '');
  return METRIC_CM[singular] ?? METRIC_CM[word];
}

/**
 * A typed height, in centimetres.
 *
 * @param {string} text  what is in the box
 * @param {'cm'|'ft'} prefer  which system a bare number belongs to
 * @returns {{cm: number}|{error: string}}  `error` is a phrase key
 */
export function parseHeight(text, prefer = 'cm') {
  const clean = String(text ?? '')
    .replace(QUOTES, "'").replace(DOUBLES, '"')
    .trim().toLowerCase().replace(/\s+/g, ' ');

  if (!clean) return { error: 'height.empty' };

  const raw = toCentimetres(clean, prefer);
  if (raw === null) return { error: 'height.unreadable' };
  if (!Number.isFinite(raw) || raw < MIN_CM) return { error: 'height.tooshort' };
  if (raw > MAX_CM) return { error: 'height.tootall' };
  // To a hundredth of a micron, which is nothing, and which makes 2.01 m
  // exactly 201 rather than 200.99999999999997 - the sort of number that shows
  // up later in something that was only ever going to compare two of them.
  return { cm: Math.round(raw * 10000) / 10000 };
}

function toCentimetres(clean, prefer) {
  const feet = FEET_AND_INCHES.exec(clean);
  if (feet) {
    const inches = Number(feet[2] ?? 0);
    // 5'14" is somebody who has not carried the twelve, not a person six foot
    // two. Refusing is the only answer that cannot silently be wrong.
    if (inches >= 12) return null;
    return Number(feet[1]) * CM_PER_FOOT + inches * CM_PER_INCH;
  }

  const inches = INCHES.exec(clean);
  if (inches) return Number(inches[1]) * CM_PER_INCH;

  const metric = METRIC.exec(clean);
  if (metric) {
    const scale = metricScale(metric[2]);
    return scale === undefined ? null : Number(metric[1]) * scale;
  }

  const bare = BARE.exec(clean);
  if (!bare) return null;

  const value = Number(bare[1]);
  if (prefer === 'ft') {
    // Nobody is eight inches tall and nobody is ninety feet, so the split is
    // safe in both directions: 5.9 is feet, 68 is inches.
    return value <= 8 ? value * CM_PER_FOOT : value * CM_PER_INCH;
  }
  // 1.73 is metres for the same reason: 1.73 cm is not a height anybody types.
  return value < 3 ? value * 100 : value;
}

/* ------------------------------------------------------------- writing it out */

/** Whole centimetres, except under a metre where the half matters. */
export function formatCm(cm) {
  const rounded = cm < 100 ? Math.round(cm * 10) / 10 : Math.round(cm);
  return `${rounded} cm`;
}

/**
 * Feet and inches, with the inch rounded and the foot carried.
 *
 * Rounding first and carrying afterwards is the whole of it: 5 ft 11.7 in is
 * 6 ft, and a version that rounded the inches in place would print "5 ft 12 in".
 */
export function formatFeet(cm) {
  const totalInches = Math.round(cm / CM_PER_INCH);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  if (!feet) return `${inches} in`;
  return inches ? `${feet} ft ${inches} in` : `${feet} ft`;
}

/**
 * The height as it would be typed, in the notation the chart is now using.
 *
 * This is what makes the unit switch safe. `178` means centimetres on a metric
 * chart and inches on an imperial one, which is the right rule for somebody
 * typing and a trap for somebody switching - so the boxes are rewritten rather
 * than reinterpreted, and the picture does not move.
 */
export function toInput(cm, unit) {
  if (unit !== 'ft') return String(Math.round(cm * 10) / 10);
  const totalInches = Math.round(cm / CM_PER_INCH);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return feet ? `${feet}'${inches}"` : `${inches}"`;
}

/** The height in the chart's own unit. */
export function format(cm, unit) {
  return unit === 'ft' ? formatFeet(cm) : formatCm(cm);
}

/** The height in the chart's unit, with the other system after it. */
export function formatBoth(cm, unit) {
  return unit === 'ft'
    ? `${formatFeet(cm)} (${formatCm(cm)})`
    : `${formatCm(cm)} (${formatFeet(cm)})`;
}

/* ------------------------------------------------------------------ the ruler */

// In centimetres, because that is what the chart measures in whichever unit it
// labels. The imperial ladder is inches - 1, 3, 6, 12, 24 - converted, so its
// lines land on whole inches rather than near them.
const METRIC_STEPS = [1, 2, 5, 10, 20, 25, 50, 100, 200];
const IMPERIAL_STEPS = [1, 2, 3, 6, 12, 24, 60].map((inches) => inches * CM_PER_INCH);

/**
 * How far apart the ruler's lines go.
 *
 * Chosen by how many lines the chart can carry rather than by the height: the
 * same 10 cm that is right for two adults would be ninety lines on a chart
 * that has a giraffe on it, and one line on a chart of two babies.
 */
export function gridStep(topCm, unit, wanted = 14) {
  const steps = unit === 'ft' ? IMPERIAL_STEPS : METRIC_STEPS;
  const ideal = topCm / wanted;
  return steps.find((step) => step >= ideal) ?? steps[steps.length - 1];
}

/** The next line at or above a height, so the chart has a whole step of headroom. */
export function ceilTo(cm, step) {
  return Math.ceil(cm / step - 1e-9) * step;
}

/**
 * What one gridline is called.
 *
 * The imperial labels are computed from the line's own inch count rather than
 * from the centimetres, so a chart in feet is labelled in whole inches even
 * though everything inside it is measured in centimetres.
 */
export function gridLabel(cm, unit) {
  if (unit !== 'ft') return `${Math.round(cm)} cm`;
  const inches = Math.round(cm / CM_PER_INCH);
  const feet = Math.floor(inches / 12);
  const rest = inches % 12;
  if (!feet) return `${rest} in`;
  return rest ? `${feet}′${rest}″` : `${feet} ft`;
}
