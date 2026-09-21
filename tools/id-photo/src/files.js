/**
 * Names, numbers and sentences - the small conversions that would otherwise be
 * written out four times each in main.js and drift apart.
 *
 * Kept separate from the arithmetic because these are the strings somebody
 * reads, and a wrong one is a wrong claim about what the tool did. They are
 * plain functions on plain values, so the tests can check them.
 */

import {
  backgroundOf, pixelLabel, portalBytes, portalPixels, printLabel, trim,
} from './specs.js';
import { sizeText } from './encode.js';
import { ltr } from './shared/phrases.js';

/**
 * A rule's size in one short line, for the list of documents to choose from.
 *
 * Not printLabel: that sentence carries the resolution as well, and twelve of
 * them stacked under a country is a wall rather than a list. What somebody
 * choosing between a country's documents is comparing is the shape of the
 * thing - 35 x 45 against 50 x 70 - and, where the rule is a web form's, the
 * pixels instead.
 *
 * The keys are looked up rather than built. `doc.size.${kind}` would be a
 * template literal containing the word "size", which is what the count in
 * tests/python/test_english_in_js.py reads as a sentence.
 */
const SIZE_KEYS = { print: 'doc.size.mm', upload: 'doc.size.px', both: 'doc.size.both' };

export function docSize(spec, t) {
  const print = spec.print
    ? t(SIZE_KEYS.print, {
      width: trim(spec.print.widthMm),
      height: trim(spec.print.heightMm),
    })
    : null;
  const pixels = portalPixels(spec);
  const upload = pixels
    ? t(SIZE_KEYS.upload, { width: pixels.width, height: pixels.height })
    : null;
  if (print && upload) return t(SIZE_KEYS.both, { print, upload });
  return print ?? upload ?? '';
}

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
 * One rule's figures, as the rows of a table: [term, value] pairs, in the order
 * they are read.
 *
 * Here rather than in main.js because two things draw this table and they must
 * not be able to disagree. The panel under the chooser is one. The other is the
 * page each rule has to itself - /id-photo/us-passport/ - which the build
 * writes from landing/pages.json, and landing/emit.mjs fills that file by
 * calling this with a `t` that hands back the key and the values instead of a
 * sentence. So nothing here may look inside what `t` returns: a row is put
 * together out of whole answers and never out of pieces of one.
 *
 * A signature has no head and no eye line, and showing it "0% to 100%" for both
 * would be the panel filling a row rather than stating a rule.
 */
export function specFacts(spec, t) {
  const heightMm = spec.print?.heightMm ?? null;
  // A band, with the note that nobody published it as a requirement.
  const guidance = (text, advisory) => (advisory ? t('band.guidance', { band: text }) : text);

  const rows = [[t('facts.print'), printLabel(spec, t)]];
  if (spec.kind !== 'signature') {
    rows.push(
      [t('facts.head'), guidance(bandText(spec.head, heightMm, t), spec.head.advisory)],
      [t('facts.eye'), guidance(bandText(spec.eye, heightMm, t), spec.eye.advisory)],
    );
  }
  rows.push([t('facts.background'), backgroundOf(spec, t).label]);

  if (!spec.digital) {
    rows.push([t('facts.upload'), t('facts.upload.print')]);
    return rows;
  }

  // Not every rule states both ends, and one that states neither must not be
  // reported as "up to Infinity".
  const bytes = portalBytes(spec);
  const size = Number.isFinite(bytes.max)
    ? (bytes.min
      ? t('bytes.band', { min: sizeText(bytes.min, t), max: sizeText(bytes.max, t) })
      : t('bytes.upto', { max: sizeText(bytes.max, t) }))
    : (bytes.min ? t('bytes.from', { min: sizeText(bytes.min, t) }) : t('bytes.none'));
  rows.push([t(spec.digital.label),
    t('facts.upload.value', { pixels: pixelLabel(spec, t), size })]);
  return rows;
}

/**
 * Where a rule's figures came from, as the line printed under them.
 *
 * A published authority and document keep the wording they were published in: a
 * citation is what a reader searches for to check the transcription, and one
 * translated is one that no longer finds anything. The two entries that cite
 * nothing are keys instead - see specs.js - and `t` hands a real citation back
 * unchanged because it has no entry for it.
 */
const SOURCE_KEYS = { figures: 'source.line', words: 'source.line.words', own: 'source.own' };

export function sourceLine(spec, t) {
  if (!spec.source.checked) return t(SOURCE_KEYS.own);
  return t(spec.published === 'words' ? SOURCE_KEYS.words : SOURCE_KEYS.figures, {
    authority: t(spec.source.authority),
    document: t(spec.source.document),
    checked: spec.source.checked,
  });
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
    have: ltr(`${check.have.width} x ${check.have.height}`),
    need: ltr(`${check.need.width} x ${check.need.height}`),
  };
  if (!check.enlarging) return t('resample.enough', sizes);
  return t(check.severe ? 'resample.severe' : 'resample.slight', sizes);
}

/** The one-line summary above the download buttons. */
export function readyText(passing, backgroundStatus, t) {
  if (!passing) return t('ready.geometry');
  return t(backgroundStatus === 'bad' ? 'ready.background' : 'ready.good');
}
