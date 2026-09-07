/**
 * The recording behind the "Try an example" button.
 *
 * The same eight seconds the trimmer gets. Speed, reverse and volume are all
 * changes you have to be able to hear happening to something, and a piece with
 * bars and a loud half is something; a sine tone reversed sounds exactly like
 * a sine tone. See shared/js/example-audio.js.
 */

import { exampleAudioFile } from './shared/example-audio.js';

export function makeExample() {
  return exampleAudioFile('example.wav', { bars: 4 });
}
