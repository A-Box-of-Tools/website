/**
 * Numbers, as a person would say them.
 *
 * One file rather than a helper per module, because the same quantity has to
 * read the same way in three places - the header panel, the measurement
 * readout and the downloadable report - and three copies of "round it unless it
 * is small" is how a page ends up saying 5.0 mm in one row and 5 mm in the next.
 */

/** Bytes, with the exact figure left for the tooltip that wants it. */
export function fileSize(count) {
  if (count < 1024) return `${count} B`;
  if (count < 1024 * 1024) return `${(count / 1024).toFixed(count < 10240 ? 1 : 0)} KB`;
  return `${(count / 1048576).toFixed(count < 10485760 ? 2 : 1)} MB`;
}

export const exact = (count) => `${count.toLocaleString()} bytes`;

export const count = (value) => value.toLocaleString();

/**
 * A measurement, to a sensible number of decimals for its size.
 *
 * Three significant figures below ten and one decimal above, which is the
 * precision a pixel spacing of 0.4785 mm actually supports: a 40 mm line across
 * such an image is 40 mm give or take a pixel, and printing 40.14 mm claims a
 * hundredth of a millimetre nothing measured.
 */
export function millimetres(value) {
  const size = Math.abs(value);
  if (size >= 100) return `${value.toFixed(0)} mm`;
  if (size >= 10) return `${value.toFixed(1)} mm`;
  return `${value.toFixed(2)} mm`;
}

/**
 * A measured pixel value, in whatever units the file's modality transform
 * produces.
 *
 * Integers stay integers. A CT stores integers, its rescale slope is 1, and
 * showing `100.0 HU` where the answer is exactly 100 suggests a precision the
 * scanner did not have.
 */
export function quantity(value, unit, t) {
  const shown = Number.isInteger(value) ? String(value)
    : Math.abs(value) >= 100 ? value.toFixed(1) : value.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
  // Where the unit goes is the language's business: it follows the number
  // in English and precedes it in some others.
  return unit ? t('unit.value', { n: shown, unit }) : shown;
}

/** A window, said the way a workstation says it: centre first, then width. */
export const windowLabel = (center, width) => `C ${Math.round(center)} / W ${Math.round(width)}`;
