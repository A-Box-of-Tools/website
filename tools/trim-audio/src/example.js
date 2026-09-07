/**
 * The recording behind the "Try an example" button.
 *
 * Eight seconds of music rather than a tone, because this tool is operated
 * against a drawn waveform: the second half is louder and reaches an octave
 * higher, so the picture has a middle, and a cut can be seen to have landed
 * where it was asked to. See shared/js/example-audio.js.
 */

import { exampleAudioFile } from './shared/example-audio.js';

export function makeExample() {
  return exampleAudioFile('example.wav', { bars: 4 });
}
