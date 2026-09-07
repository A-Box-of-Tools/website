/**
 * The recording behind the "Try an example" button.
 *
 * Four bars, where the trimmer gets six. Speed, reverse and volume act on the
 * whole file rather than a chosen part of it, so length buys nothing here and
 * costs a wait: every one of those controls re-renders the entire recording.
 * Eight seconds is long enough to hear the loud half arrive and short enough
 * that the result is back immediately.
 *
 * A sine tone played backwards sounds like a sine tone, which is why this is
 * music - see shared/js/example-audio.js.
 */

import { exampleAudioFile } from './shared/example-audio.js';

export function makeExample() {
  return exampleAudioFile('example.wav', { bars: 4 });
}
