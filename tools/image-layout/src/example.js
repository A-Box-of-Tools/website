/** Different shapes make the cost of fitting and cropping visible immediately. */
import { photoFile } from './shared/example-photo.js';

export function makeExample() {
  return Promise.all([
    photoFile('landscape.jpg', { width: 960, height: 640, seed: 11 }),
    photoFile('portrait.jpg', { width: 480, height: 720, seed: 22 }),
    photoFile('square.jpg', { width: 640, height: 640, seed: 33 }),
    photoFile('wide.jpg', { width: 960, height: 480, seed: 44 }),
  ]);
}
