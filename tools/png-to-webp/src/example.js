/**
 * The two pictures behind the "Try an example" button.
 *
 * They are drawn rather than fetched - see shared/js/example-photo.js for why
 * that is not a choice - and there are two because the page's one decision is
 * a decision about *content*, not about preference. Lossless is right for one
 * of these files and wasteful for the other, and a visitor who presses the
 * example and then flips the radio button sees exactly that:
 *
 *   - the flat mark, with an alpha channel, is the file people usually have.
 *     Lossless WebP takes a useful bite out of it and keeps every pixel and
 *     the transparency with it, which is the straight swap this tool exists
 *     for;
 *   - the photograph is the file where lossless is the wrong answer. A
 *     photograph as a PNG is enormous - which is why it makes the point - and
 *     lossless WebP will only shave a little off it, while the lossy setting
 *     takes it down by an order of magnitude at a cost nobody can see.
 *
 * Between them the two results make the argument the page's prose only
 * asserts, and they make it in the visitor's own browser with numbers off
 * their own machine.
 */

import { photoCanvas, canvasFile } from './shared/example-photo.js';
import { markCanvas } from './shared/example-mark.js';

/**
 * The photograph, flattened onto an opaque background first.
 *
 * `photoCanvas` scatters its grass and its grain with partial alpha, which
 * leaves a few thousand pixels in a 1.2-megapixel frame at alpha 215 or so.
 * Nothing can see them, but `hasAlpha` is exact and they are real, so the
 * example photograph would otherwise arrive on the list announcing that it has
 * see-through parts - which is true, useless, and muddles the one row that is
 * supposed to be demonstrating the opposite of the mark beside it.
 *
 * A real photograph does not have this: it comes out of a camera as a JPEG or
 * a HEIC, neither of which has an alpha channel at all. So the flattening here
 * makes the example more like the file it stands in for, not less.
 */
function opaquePhoto(width, height, scene) {
  const drawn = photoCanvas(width, height, scene);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(drawn, 0, 0);
  drawn.width = 0;
  drawn.height = 0;
  return canvas;
}

export function makeExample() {
  return Promise.all([
    canvasFile(markCanvas(512), 'example-logo.png', 'image/png'),
    canvasFile(opaquePhoto(1280, 960, { seed: 20260917 }), 'example-photo.png', 'image/png'),
  ]);
}
