/**
 * The recording behind the "Try an example" button.
 *
 * Six bars rather than the four the audio editor gets, and the difference is
 * the job: this tool cuts a section *out* of something, so it wants a piece
 * long enough that there is an obvious middle to keep and obvious ends to
 * lose. Twelve seconds gives the waveform a shape a cut can be judged
 * against; eight is over before the second half has said anything.
 *
 * Music and not a tone for the same reason - see shared/js/example-audio.js.
 */

import { exampleAudioFile } from './shared/example-audio.js';

export function makeExample() {
  return exampleAudioFile('example.wav', { bars: 6 });
}
