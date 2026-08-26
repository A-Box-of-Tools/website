/** Sizes and names, as words a person would use. */

/** KB and MB mean 1024 and 1024*1024, which is what a file manager shows and
 *  what people mean when they say "under 5 MB". */
export function bytes(n) {
  if (!Number.isFinite(n) || n < 0) return '0 bytes';
  if (n < 1024) return `${Math.round(n)} bytes`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(n < 10240 ? 1 : 0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * What to call the finished file.
 *
 * The name says what happened to it, because the one mistake worth guarding
 * against here is sending the original by accident: two files in a downloads
 * folder with the same name and different contents is exactly the situation in
 * which the wrong one gets attached to the email.
 */
export function outName(name) {
  const stem = String(name).replace(/\.pdf$/i, '') || 'document';
  return `${stem}-redacted.pdf`;
}

/** A number with the thousands separated, so a count of words on a long
 *  document reads as a quantity rather than as a string of digits. */
export function tally(n) {
  return Number(n).toLocaleString();
}
