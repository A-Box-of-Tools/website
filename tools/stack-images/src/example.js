/**
 * The burst behind the "Try an example" button.
 *
 * Six frames of one scene, identical but for the grain: same seed for
 * everything that is drawn, a different `grainSeed` on each. That is what a
 * burst off a camera in poor light actually is, and it is the one input where
 * this tool's answer can be checked by eye - averaging six of these should
 * leave the picture and take the noise, which is the claim on the page.
 */

import { photoFile } from './shared/example-photo.js';

const FRAMES = 6;

export function makeExample() {
  return Promise.all(Array.from({ length: FRAMES }, (unused, i) => photoFile(
    `example-${i + 1}.jpg`,
    { width: 1280, height: 960, grainSeed: 5000 + i * 977 },
  )));
}
