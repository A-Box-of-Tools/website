/**
 * The order things are tried in, which is most of what makes a reader feel
 * good or bad to use.
 *
 * Every other module here does one thing to one input. This one decides which
 * inputs to make and in what order: a picture is thresholded three different
 * ways, each of those is tried the right way up and inverted, the finder
 * search is run coarsely before it is run over every row, and only when all of
 * that has found no QR symbol is the picture asked whether it holds a striped
 * barcode instead.
 *
 * The order is not arbitrary. The first attempt is the one that reads an
 * ordinary photograph of an ordinary code, so the common case costs one pass.
 * What follows it are the answers to particular problems - a code printed
 * light on dark, a grainy picture taken in poor light, a small symbol whose
 * finder patterns a coarse scan steps over - each of which costs a pass and
 * each of which turns some real photographs from "no code found" into a read.
 *
 * There are two speeds. A still picture is worth every attempt, because the
 * visitor chose it and is waiting for one answer. A camera frame is not: there
 * is another one along in a thirtieth of a second, and a thorough search of
 * this one would mean missing the next four.
 */

import { blur, globalBinarize, grayscale, invert, localBinarize } from './binarize.js';
import { readQr } from './detect.js';
import { readLinear } from './linear.js';
import { describe } from './payload.js';

/**
 * Look for a code in one picture.
 *
 * @param {{data: Uint8ClampedArray|Uint8Array, width: number, height: number}} image
 * @param {{thorough?: boolean}} [options]  false for a camera frame
 * @returns {object|null} what was found, already interpreted, or null
 */
export function scan(image, { thorough = true } = {}) {
  const { width, height } = image;
  if (!width || !height) return null;

  const gray = grayscale(image.data, width, height);
  const local = localBinarize(gray, width, height);

  // Each entry is a whole way of seeing the picture, in the order they earn
  // their place. The label is carried through to the page: "found after
  // inverting it" is a useful thing to be told, because it says something
  // about the code rather than about this program.
  const passes = [{ bits: local, how: 'local' }];
  if (thorough) {
    passes.push(
      { bits: invert(local), how: 'inverted' },
      { bits: globalBinarize(gray, width, height), how: 'global' },
      { bits: localBinarize(blur(gray, width, height), width, height), how: 'softened' },
    );
  } else {
    passes.push({ bits: invert(local), how: 'inverted' });
  }

  for (const dense of thorough ? [false, true] : [false]) {
    for (const pass of passes) {
      const found = readQr(pass.bits, width, height, dense);
      if (found) {
        return {
          kind: 'qr',
          symbology: 'qr',
          name: 'QR code',
          how: pass.how,
          dense,
          ...found,
          ...describe(found.text),
        };
      }
    }
  }

  for (const pass of passes) {
    const found = readLinear(pass.bits, width, height, thorough ? 24 : 12);
    if (found) {
      return {
        kind: 'linear',
        symbology: found.format,
        how: pass.how,
        ...found,
        ...describe(found.text),
      };
    }
  }

  return null;
}
