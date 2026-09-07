/**
 * The clip behind the "Try an example" button.
 *
 * 1080p, and the highest resolution of any example here, because the promise
 * at the top of this page is "a full-quality still from any point" - and a
 * still is only demonstrably full quality if the clip it came out of had
 * quality to give. The cropper's is 720p and the GIF converter's smaller
 * again; both of those are spending pixels on something else.
 *
 * Five seconds rather than six, to pay for them.
 *
 * Every frame carries a bar that has moved and a marker that steps once a
 * second, because "the frame at 3.2 seconds" demonstrates nothing against
 * footage where every frame is the same picture. See
 * shared/js/example-video.js.
 */

import { exampleVideoFile } from './shared/example-video.js';

export function makeExample() {
  return exampleVideoFile('example.mp4', { width: 1920, height: 1080, seconds: 5 });
}
