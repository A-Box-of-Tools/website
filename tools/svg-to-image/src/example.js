/**
 * The drawing behind the "Try an example" button.
 *
 * Written out as SVG text rather than traced off a canvas, because that is
 * what a visitor brings here: a file somebody authored, with named shapes and
 * a viewBox and no width in pixels at all. That last part is the point of the
 * tool - a vector has no size of its own to lose - and an example carrying a
 * fixed pixel size would quietly demonstrate the opposite.
 */

import { markSvg } from './shared/example-mark.js';

export function makeExample() {
  return new File([markSvg()], 'example.svg', { type: 'image/svg+xml' });
}
