/**
 * The operating system's MIME registry may not know a newer image format.
 * A recognized extension admits a file to the decoder; it never establishes
 * that the bytes really are a picture. Callers still decode or inspect them.
 */
export function acceptsImageFile(file, extensions = [], mimeTypes = null) {
  const mime = String(file?.type ?? '').toLowerCase();
  const declared = mimeTypes === null
    ? mime.startsWith('image/')
    : mimeTypes.some(type => type.toLowerCase() === mime);
  if (declared) return true;
  const extension = /\.([a-z0-9]+)$/i.exec(String(file?.name ?? ''))?.[1]?.toLowerCase();
  return Boolean(extension && extensions.some(value => value.replace(/^\./, '').toLowerCase() === extension));
}
