/**
 * Names, sizes and counts, as words a person would use.
 *
 * Everything here that says something takes `t`, the caller's `phrase`. The
 * words cannot live in this file: src/ is copied byte for byte into every
 * language. See shared/js/phrases.js.
 */
import { sizeText } from './shared/format.js';

export const bytes = (n, t) => sizeText(n, t, { under: 'size.bytes', kb: 'auto', mb: 2 });

/** "16 × 16", with a real multiplication sign. */
export const dimensions = (width, height) => `${width} × ${height}`;

/**
 * "1 image" / "4 images" / "3 sizes" / "10 slots".
 *
 * The noun is a parameter rather than a word this file appends an s to. It
 * used to be `countOf(n).replace('image', 'size')` at the call sites that
 * wanted a different one, which is a sentence being edited with a search and
 * replace over English - and there is no English here to search.
 *
 * An .icns is counted in slots rather than sizes because ten of them hold
 * seven pictures: Apple names some sizes twice, once as themselves and once as
 * the Retina version of the size below. Calling that "10 sizes" would be
 * describing a file that does not exist.
 */
export const countOf = (n, noun, t) =>
  t(`count.${noun}.${n === 1 ? 'one' : 'many'}`, { n });

/**
 * What the finished icon should be called.
 *
 * A website favicon is called `favicon.ico` and nothing else: that is the
 * address every browser asks for whether or not the page mentions it, and a
 * file called `logo.ico` sitting at the site root does not answer it. Handing
 * back the right name is the difference between the tool working and the
 * visitor's site quietly having no icon.
 *
 * Everywhere else the source's own name is kept, because an application icon
 * lives beside the thing it belongs to and "app.ico" is worth more than
 * "favicon.ico" in a folder of six of them. An .icns is always named that way:
 * a Mac finds its icon through the bundle's Info.plist rather than by a fixed
 * filename, so there is no reserved name to hand back.
 *
 * `website` is not the same question as "which preset", which is why it is a
 * parameter rather than something worked out from one. Asking for the website
 * set alongside a Windows application icon is a perfectly ordinary thing to
 * want, and the manifest, the browserconfig and the README that come with it
 * all point at /favicon.ico - so the .ico in that zip has to be called that,
 * whichever preset chose its sizes.
 *
 * @param {string} sourceName
 * @param {'ico'|'icns'} ext
 * @param {boolean} website  this file is going at the root of a site
 */
export function iconName(sourceName, ext, website) {
  if (ext === 'ico' && website) return 'favicon.ico';
  return `${stemOf(sourceName)}.${ext}`;
}

/** The name with its extension taken off, or "icon" if nothing is left. */
export function stemOf(name) {
  return name.replace(/\.[^.]+$/, '').trim() || 'icon';
}

/**
 * The folder one image's files get in a batch's zip.
 *
 * Only used when more than one picture was chosen. Two sets of favicons in the
 * root of one archive would overwrite each other, and both would be called
 * favicon.ico.
 */
export const folderFor = (name) => stemOf(name).replace(/[\\/:*?"<>|]+/g, '-');

/**
 * One sentence saying what is about to happen, built from the same settings the
 * renderer is handed - so it cannot describe something other than what runs.
 */
export function describe(sizes, storage, fit, transparent, t) {
  if (!sizes.length) return t('pick.none');

  const fitKey = fit === 'pad'
    ? `fit.pad.${transparent ? 'transparent' : 'colour'}`
    : `fit.${fit}`;

  return t('describe.line', {
    count: countOf(sizes.length, 'size', t),
    list: listOf(sizes, t),
    kind: t(`store.${storage}`),
    fit: t(fitKey),
  });
}

/**
 * "16, 32, 48", joined the way the reader's language joins a list.
 *
 * A comma and a space is English punctuation. Japanese uses 、 and no space,
 * and Arabic uses ، - so the separator is a phrase like everything else, and
 * a list of three is built by joining twice.
 */
export function listOf(parts, t, key = 'join.list') {
  return parts.reduce((a, b) => t(key, { a, b }));
}
