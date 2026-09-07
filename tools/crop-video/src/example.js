/**
 * The clip behind the "Try an example" button.
 *
 * 720p, where the GIF converter's is smaller. Cropping takes a region *out* of
 * the frame, so the frame has to be big enough that what is left after the box
 * is drawn is still worth looking at - crop a 960-wide clip in half and the
 * result is a postage stamp, which demonstrates the tool at its least useful.
 *
 * The bar along the foot and the marker that steps once a second are what make
 * a crop checkable: they say which part of the picture survived and which
 * second of the clip you are looking at. See shared/js/example-video.js.
 */

import { exampleVideoFile } from './shared/example-video.js';

export function makeExample() {
  return exampleVideoFile('example.mp4', { width: 1280, height: 720, seconds: 6 });
}
