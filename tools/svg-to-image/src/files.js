/** Names, sizes and counts, as words a person would use. */

/** File sizes. Nothing here is measured against a limit, so ordinary rounding.
 *
 * B rather than the word, for the same reason KB and MB are symbols: the word
 * is English - octets in French, バイト in Japanese - and this module cannot
 * reach the markup a translation would live in. The symbol is the same in
 * every language the site is written in. */
export function bytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(n < 10240 ? 1 : 0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

/** "512 × 512", with a real multiplication sign. */
export const dimensions = (width, height) => `${width} × ${height}`;

/** "1 file" / "4 files", said the same way everywhere on the page. */


/**
 * The name with its extension taken off, or "image" if nothing is left.
 *
 * One extension, not every dotted suffix: `my.logo.v2.svg` is a file called
 * `my.logo.v2`, and stripping until the dots run out would rename it to
 * `my.logo` and lose the version somebody put there on purpose.
 */
export function stemOf(name) {
  return String(name ?? '').replace(/\.[^.]+$/, '').trim() || 'image';
}

/**
 * What one rendered file is called.
 *
 * The `@2x` convention comes from Apple and is understood by every asset
 * pipeline that has an opinion - Xcode, Android's tooling, every CSS
 * `image-set()` - so a set of three files dropped into a project is already
 * named the way the project expects. `@1x` is deliberately not written: the
 * plain name is what a `<img src>` points at, and a file called `logo@1x.png`
 * is a rename waiting to happen.
 *
 * @param {string} sourceName  the .svg it came from
 * @param {string} ext         png, jpg or webp
 * @param {number} [density]   1, 2 or 3
 */
export function outName(sourceName, ext, density = 1) {
  const suffix = density > 1 ? `@${density}x` : '';
  return `${stemOf(sourceName)}${suffix}.${ext}`;
}

/** The folder one source's files get in a batch's zip. */
export const folderFor = (name) => stemOf(name).replace(/[\\/:*?"<>|]+/g, '-');

/**
 * Make a list of names unique, in the order they were given.
 *
 * Two files called `icon.svg` from two different folders are an ordinary thing
 * to drag in at once, and both would render to `icon.png`. In a zip the second
 * silently replaces the first; downloaded one at a time the browser renames
 * them itself and the numbering has nothing to do with the order on the page.
 * Numbering them here means the page can show what each row will actually be
 * called before anything is written.
 */
export function uniqueNames(names) {
  const seen = new Map();
  return names.map((name) => {
    const key = name.toLowerCase();
    const count = seen.get(key) ?? 0;
    seen.set(key, count + 1);
    if (count === 0) return name;

    const dot = name.lastIndexOf('.');
    const stem = dot > 0 ? name.slice(0, dot) : name;
    const ext = dot > 0 ? name.slice(dot) : '';
    return `${stem}-${count + 1}${ext}`;
  });
}

/**
 * Which sentence explains where the size came from, named rather than written.
 * `source` comes from svg.js and is the part worth being honest about: a
 * picture whose size was assumed rather than read is one the visitor may want
 * to override.
 *
 * A key rather than the sentence itself, because this module is a leaf the
 * tests load straight off the disk and so cannot reach the markup the words
 * live in. main.js resolves it. See shared/js/phrases.js.
 */
export function sourceKey(intrinsic) {
  switch (intrinsic.source) {
    case 'attributes':
      return 'source.attributes';
    case 'mixed':
      return 'source.mixed';
    case 'viewbox':
      return 'source.viewbox';
    default:
      return 'source.default';
  }
}
