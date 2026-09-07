/**
 * The frames behind the "Try an example" button.
 *
 * A pan across one scene rather than a set of unrelated pictures, so that the
 * delay and the loop settings have something to be judged against - and eight
 * frames rather than twelve, because a GIF pays for every one of them in
 * palette and in bytes, and this tool's own size readout is the point.
 */

import { photoFile } from './shared/example-photo.js';

const FRAMES = 8;

export function makeExample() {
  return Promise.all(Array.from({ length: FRAMES }, (unused, i) => photoFile(
    `example-${i + 1}.jpg`,
    { width: 640, height: 480, shift: i * 45 },
  )));
}
