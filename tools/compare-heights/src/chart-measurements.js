import { parseHeight } from './units.js';

const WIDTH_ERRORS = { 'height.unreadable': 'width.unreadable',
  'height.tooshort': 'width.toosmall', 'height.tootall': 'width.toolarge' };

/** Blank width keeps the existing automatic renderer ratio; a refused value cannot. */
export function chartMeasurements(heightText, widthText, unit, shape) {
  const height = parseHeight(heightText, unit);
  const usesWidth = !!(shape.stretch || !shape.markup);
  let width = { cm: 0 };
  if (usesWidth) {
    if (!String(widthText ?? '').trim()) width = { cm: 0, auto: true };
    else {
      const parsed = parseHeight(widthText, unit);
      width = parsed.error ? { error: WIDTH_ERRORS[parsed.error] } : parsed;
    }
  }
  return { height, width, usesWidth, valid: !height.error && !width.error };
}
