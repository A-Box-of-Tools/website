/** Sizes, counts and the one judgement this tool is in a position to make. */

/** KB and MB mean 1024 and 1024*1024 here, which is what a file manager shows
 *  on every platform except macOS. */
export function bytes(n) {
  if (n < 1024) return `${n} bytes`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(n < 10240 ? 1 : 0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

/** "1,204,556" - a character count is read, not compared, so it gets commas. */
export function count(n) {
  return n.toLocaleString('en-US');
}

/** "a third longer", as a number. A data URI is ASCII, so one character is one
 *  byte and the length of the string is the size of the thing. */
export function overhead(fileBytes, uriLength) {
  if (!fileBytes) return '';
  const delta = Math.round(((uriLength - fileBytes) / fileBytes) * 100);
  if (delta === 0) return 'the same size as the file';
  return delta > 0 ? `${delta}% larger than the file` : `${-delta}% smaller than the file`;
}

/**
 * Whether inlining this one is a good idea.
 *
 * Worth being blunt about, because the tool that does a thing is the last
 * place anybody gets told not to do it, and an inlined picture has a cost that
 * does not show up anywhere: it is not a separate file any more, so it cannot
 * be cached separately, cannot be fetched in parallel, and is downloaded again
 * in full every time the stylesheet or the page it sits in changes. A 4 KB
 * icon that saves a request is a clear win. A 300 KB photograph on the
 * critical path of every page is a mistake with no error message.
 *
 * The thresholds are round numbers rather than measurements. They are where
 * the advice changes, not where the browser does anything different.
 *
 * @returns {{level: 'good'|'fair'|'poor', text: string}}
 */
export function verdict(uriLength) {
  if (uriLength <= 2 * 1024) {
    return {
      level: 'good',
      text: 'Small enough that this is a clear win: one fewer request, and nothing much added to the file it lands in.',
    };
  }
  if (uriLength <= 10 * 1024) {
    return {
      level: 'good',
      text: 'A normal size for an inlined icon. Worth it for something that appears on every page.',
    };
  }
  if (uriLength <= 50 * 1024) {
    return {
      level: 'fair',
      text: 'Large for an inline picture. Everything that includes this stylesheet now carries it, and it cannot be cached on its own.',
    };
  }
  return {
    level: 'poor',
    text: 'Too big to inline. Served as an ordinary file this would be cached once and fetched in parallel; inlined, it is on the critical path of every page and re-downloaded whenever anything around it changes.',
  };
}

/**
 * How much of the encoded size is metadata rather than picture.
 *
 * Said as a proportion because that is what makes the case: "30 KB of EXIF" is
 * a fact, and "a third of what you are about to paste is not the picture" is
 * the reason to do something about it.
 */
export function metadataNote(meta, fileBytes) {
  const share = fileBytes ? Math.round((meta.bytes / fileBytes) * 100) : 0;
  const kinds = list(meta.kinds);
  const portion = share >= 5 ? `, which is ${share}% of the file` : '';
  return `Carries ${bytes(meta.bytes)} of ${kinds}${portion}. It is copied into the URI along with the picture.`;
}

/** "EXIF", "EXIF and XMP", "EXIF, XMP and a colour profile". */
export function list(items) {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/** "4032 x 3024", with a real multiplication sign. */
export function dimensions(width, height) {
  return `${width} × ${height}`;
}
