/** Names and sizes, as words a person would use. */

import { FORMATS } from './codecs.js';
import { sizeText } from './shared/format.js';

export const bytes = (n, t) => sizeText(n, t, { under: 'size.bytes', kb: 'auto', mb: 2 });

/** "4032 × 3024", with a real multiplication sign. */
export function dimensions(width, height) {
  return `${width} × ${height}`;
}

/**
 * What the converted file should be called.
 *
 * The stem is kept and only the extension changes, which is the one thing
 * everybody expects of a converter: "IMG_4021.HEIC" comes back as
 * "IMG_4021.jpg", so it sorts beside its neighbours and is still recognisable
 * in a phone backup of nine hundred photos. Nothing is appended - there is no
 * "-converted", because the extension already says what happened and a name
 * nobody recognises is worse than a name that collides.
 *
 * Where one file held several pictures - a burst, or the frames of a Live Photo
 * - the first keeps the plain name and the rest are numbered. Numbering all of
 * them would rename the ordinary case for the sake of the rare one.
 *
 * @param {string} name the original file's name
 * @param {string} mime what it is being written as
 * @param {number} index which picture out of the file, from zero
 */
export function outName(name, mime, index = 0) {
  const ext = FORMATS[mime]?.ext ?? 'jpg';
  const stem = name.replace(/\.[^.]+$/, '') || 'image';
  return index === 0 ? `${stem}.${ext}` : `${stem}-${index + 1}.${ext}`;
}

/**
 * Every name in one batch, made unique.
 *
 * Two folders of photos dropped together can easily hold two files called
 * IMG_0001.HEIC, and a zip with two entries of the same name unpacks to one
 * file on every platform - the second quietly overwrites the first. Suffixing
 * the later ones is not tidiness; it is the difference between getting twenty
 * photos back and getting nineteen.
 *
 * @param {string[]} names in the order they were produced
 * @returns {string[]} the same names, with repeats given a number
 */
export function uniqueNames(names) {
  const seen = new Map();
  return names.map((name) => {
    const taken = seen.get(name) ?? 0;
    seen.set(name, taken + 1);
    if (taken === 0) return name;

    const dot = name.lastIndexOf('.');
    const stem = dot > 0 ? name.slice(0, dot) : name;
    const ext = dot > 0 ? name.slice(dot) : '';
    // Rare enough that a loop here is cheaper than a second index, and it has
    // to be a loop: "a.jpg", "a.jpg" and "a-2.jpg" in one batch all want the
    // same name next.
    let attempt = taken + 1;
    while (seen.has(`${stem}-${attempt}${ext}`)) attempt += 1;
    const unique = `${stem}-${attempt}${ext}`;
    seen.set(unique, 1);
    return unique;
  });
}

/** "40% smaller", or "3% larger" when a conversion went the other way. */
export function change(before, after, t) {
  if (before === 0) return '';
  const delta = Math.round(((before - after) / before) * 100);
  if (delta === 0) return t('size.same');
  // The per-cent sign goes inside the sentence: Turkish writes it in front
  // of the number.
  return t(delta > 0 ? 'size.smaller' : 'size.larger', { n: Math.abs(delta) });
}

/**
 * What the metadata amounts to, as a phrase for the row.
 *
 * The order is deliberate: if there are coordinates in the file that is the
 * first thing said, because it is the only part somebody might act on.
 *
 * @param {{present: boolean, camera: string, taken: string, gps: boolean}} exif
 * @param {(key: string, values?: object) => string} t  the caller's phrase()
 */
export function metadataText(exif, t) {
  if (!exif.present) return t('meta.none');
  const parts = [];
  if (exif.gps) parts.push(t('meta.gps'));
  if (exif.taken) parts.push(exif.taken);
  if (exif.camera) parts.push(exif.camera);
  // The separator is a phrase as well: a middle dot with spaces round it is
  // an English habit, and this file is copied into fifteen languages.
  return parts.length
    ? parts.reduce((a, b) => t('join.dot', { a, b }))
    : t('meta.nothing');
}
