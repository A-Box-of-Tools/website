/** Names, sizes and counts, as words a person would use. */

/** File sizes. Nothing here is measured against a limit, so ordinary rounding. */
export function bytes(n) {
  if (n < 1024) return `${n} bytes`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(n < 10240 ? 1 : 0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

/** "16 × 16", with a real multiplication sign. */
export const dimensions = (width, height) => `${width} × ${height}`;

/** "1 image" / "4 images", said the same way everywhere on the page. */
export const countOf = (n) => `${n} image${n === 1 ? '' : 's'}`;

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
export function describe(sizes, storage, fit, transparent) {
  if (!sizes.length) return 'Tick at least one size.';

  const kinds = {
    auto: 'stored the pre-Vista way up to 64 pixels and as PNG above that',
    png: 'every size stored as PNG',
    bmp: 'every size stored the pre-Vista way',
  };
  const fits = {
    pad: transparent
      ? 'padded to a square, with the padding left transparent'
      : 'padded to a square on the background colour',
    crop: 'cropped to the square in the middle',
    stretch: 'stretched to a square',
  };

  return `${sizes.length} size${sizes.length === 1 ? '' : 's'} - ${sizes.join(', ')} `
    + `- ${kinds[storage]}. A picture that is not already square is ${fits[fit]}.`;
}
