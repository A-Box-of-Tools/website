/**
 * The pictures behind the "Try an example" button.
 *
 * Three, and two shapes between them: the tool's whole job is fitting pictures
 * onto a page, and a set that were all the same way up would never show the
 * orientation and margin settings doing anything.
 */

import { photoFile } from './shared/example-photo.js';

export function makeExample() {
  return Promise.all([
    photoFile('example-1.jpg', { width: 1600, height: 1200, seed: 20260907 }),
    photoFile('example-2.jpg', { width: 1200, height: 1600, seed: 481207 }),
    photoFile('example-3.jpg', { width: 1600, height: 1200, seed: 90210 }),
  ]);
}
