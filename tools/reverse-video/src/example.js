/**
 * The clip behind the "Try an example" button.
 *
 * A clip with a soundtrack, because the line at the top of this page is "last
 * frame first, sound and all" and half of that cannot be shown on a silent
 * file.
 *
 * Six seconds rather than the eight the audio extractor gets. Reversing is the
 * most expensive thing any video tool here does - every frame is decoded, held
 * and re-encoded - and this page says so; an example that made a visitor wait
 * to see it would be proving the point the hard way.
 */

import { exampleVideoWithSound } from './shared/example-video-sound.js';

export function makeExample() {
  return exampleVideoWithSound('example.mp4', { width: 854, height: 480, seconds: 6 });
}
