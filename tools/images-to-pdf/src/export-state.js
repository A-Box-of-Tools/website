/** Files stay immutable; page order, rotation and output names do not. */
export function snapshotItems(items) {
  return items.map(({ file, name, width, height, orientation, rotate }) => ({
    file, name, width, height, orientation, rotate,
  }));
}

/** Renaming a completed download must not rewrite its document metadata. */
export function outputName(value) {
  const typed = String(value ?? '').trim().replace(/\.pdf$/i, '');
  const safe = typed.replace(/[\\/:*?"<>|]/g, '-').slice(0, 120).trim();
  return `${safe || 'images'}.pdf`;
}

const ERROR_KEYS = new Set([
  'build.noimages', 'encode.nojpeg', 'encode.nodeflate', 'read.notimage', 'read.nodecode',
]);

/** Browser diagnostics can contain quotes, so only known keys enter a selector. */
export function errorDetail(error, phrase) {
  const message = String(error?.message ?? error);
  return ERROR_KEYS.has(message) ? phrase(message, error?.values ?? {}) : message;
}
