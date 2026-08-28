/**
 * Names, numbers and sentences - the small conversions that would otherwise be
 * written out four times each in main.js and drift apart.
 *
 * Kept separate from the arithmetic because these are the strings somebody
 * reads, and a wrong one is a wrong claim about what the tool did. They are
 * plain functions on plain values, so the tests can check them.
 */

import { trim } from './specs.js';

/** A filename with its extension taken off, and nothing else changed. */
export function stemOf(name) {
  const clean = String(name ?? '').replace(/\.[^./\\]+$/, '');
  return clean || 'photo';
}

/**
 * What each download is called.
 *
 * The specification's own id is in the name, because the whole point of this
 * tool is that a file is cut to one country's rule and not another's, and three
 * files called photo.jpg in a downloads folder is exactly how somebody uploads
 * the Canadian one to the American form.
 *
 * @param {string} stem
 * @param {object} spec
 * @param {'print'|'sheet'|'upload'} kind
 * @param {object} [detail]
 */
export function outName(stem, spec, kind, detail = {}) {
  const safe = stem.replace(/[^\w-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'photo';
  if (kind === 'print') {
    const size = spec.print ? `${trim(spec.print.widthMm)}x${trim(spec.print.heightMm)}mm` : 'print';
    return `${safe}-${spec.id}-${size}.jpg`;
  }
  if (kind === 'sheet') return `${safe}-${spec.id}-sheet-${detail.paper ?? 'print'}.jpg`;
  return `${safe}-${spec.id}-${detail.width}x${detail.height}.jpg`;
}

/** 0.732 -> "73%". Used for head height and eye line alike. */
export const percent = (value) => `${(value * 100).toFixed(1)}%`;

/** A band, as it reads on the page: "70.0% to 80.0% (31.5-36.0 mm)". */
export function bandText(band, heightMm, t) {
  const fractions = t('band.range', { min: percent(band.min), max: percent(band.max) });
  if (band.minMm !== undefined && band.maxMm !== undefined) {
    return t('band.mm', { range: fractions, min: trim(band.minMm), max: trim(band.maxMm) });
  }
  if (heightMm) {
    return t('band.mm', {
      range: fractions,
      min: trim(band.min * heightMm),
      max: trim(band.max * heightMm),
    });
  }
  return fractions;
}

/**
 * One measurement, as a sentence that says what to do about it.
 *
 * "Too small" on its own makes somebody guess which way to drag, so there is a
 * whole sentence for each way a measurement can be wrong, named by the subject
 * and the status: verdict.head.low says the head is too small AND which way to
 * drag the box. Assembling one from a subject, a direction and a fix is English
 * word order, and this file is copied into fifteen languages.
 *
 * `subject` is 'head' or 'eye'; `t` resolves a phrase key against the page.
 */
export function verdictText(check, subject, heightMm, t) {
  const measured = check.mm !== null && check.mm !== undefined
    ? t('measured.mm', { percent: percent(check.value), mm: trim(check.mm) })
    : percent(check.value);
  return t(`verdict.${subject}.${check.status}`, {
    measured,
    wanted: bandText(check, heightMm, t),
  });
}

/** 'ok' | 'low' | 'high' -> the class the page paints the row with. */
export const statusClass = (status, advisory = false) => {
  if (status === 'ok') return 'good';
  return advisory ? 'warn' : 'bad';
};

/** "4.2 degrees to the left" - the tilt line, which has no band, only a limit. */
export function tiltText(tilt, t) {
  const size = Math.abs(tilt.degrees);
  if (size < 0.5) return t('tilt.level');
  const side = tilt.degrees > 0 ? 'right' : 'left';
  return t(`tilt.${tilt.status === 'ok' ? 'ok' : 'bad'}.${side}`, { degrees: size.toFixed(1) });
}

/** The centring line. The offset is a fraction of the frame's width. */
export function centreText(centre, t) {
  const size = Math.abs(centre.offset);
  if (centre.status === 'ok') return t('centre.ok');
  const side = centre.offset > 0 ? 'right' : 'left';
  return t(`centre.${side}`, { size: percent(size) });
}

/**
 * What to say about a crop that has to be enlarged to reach the output size.
 *
 * @param {ReturnType<import('./geometry.js').resampling>} check
 */
export function resamplingText(check, t) {
  const sizes = {
    have: `${check.have.width} x ${check.have.height}`,
    need: `${check.need.width} x ${check.need.height}`,
  };
  if (!check.enlarging) return t('resample.enough', sizes);
  return t(check.severe ? 'resample.severe' : 'resample.slight', sizes);
}

/** The one-line summary above the download buttons. */
export function readyText(passing, backgroundStatus, t) {
  if (!passing) return t('ready.geometry');
  return t(backgroundStatus === 'bad' ? 'ready.background' : 'ready.good');
}
