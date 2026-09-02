/**
 * Getting samples out of whatever was dropped on the page.
 *
 * GENERATED INTO EACH TOOL. This file lives at shared/js/audio-decode.js and
 * the build copies it to <tool>/src/shared/audio-decode.js for the tools that
 * ask for it with `js_parts = ["audio-decode", "samplerate", ...]` - the audio
 * editor, the trimmer and the extractor. It imports samplerate.js beside it,
 * so the two are asked for together, and buildlib/imports.py refuses a tool
 * that lists one without the other. The three tools carried identical copies
 * until the tests could follow a `./shared/` import; see
 * tests/js/resolve-shared.mjs.
 *
 * There is one decoder here and it is the browser's own: `decodeAudioData`,
 * the same code path that plays a file in a <video> element. It is handed the
 * bytes of the file and hands back the sound, which is what makes "the audio
 * out of a video" the same job as "the audio out of an MP3" - the video track
 * is simply not asked for, never decoded, and never reaches this tool at all.
 *
 * The one subtlety is which sample rate to ask for; see samplerate.js.
 */

import { sniffSampleRate } from './samplerate.js';

/** What to decode at when the file does not say. 48 kHz is what browsers and
 *  phones record at, and resampling up to it is the harmless direction. */
const FALLBACK_RATE = 48000;

/** Thrown for a file this browser will not decode, with something to do next. */
export class UnreadableFile extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnreadableFile';
  }
}

/**
 * Read a file into channels of samples.
 *
 * @param {File|Blob} file
 * @returns {Promise<{
 *   channels: Float32Array[], sampleRate: number, frames: number,
 *   duration: number, guessedRate: boolean,
 * }>}
 */
export async function decodeAudio(file) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!bytes.length) throw new UnreadableFile('audio.empty');

  const declared = sniffSampleRate(bytes);
  const rate = declared ?? FALLBACK_RATE;

  // An OfflineAudioContext rather than an AudioContext: it needs no audio
  // hardware, no user gesture, and - the reason it is here - it is created at
  // a sample rate this code chooses rather than at whatever the speakers
  // happen to run at.
  let audio;
  try {
    const context = new OfflineAudioContext(1, 1, rate);
    // decodeAudioData takes the buffer away from us, so it gets its own copy
    // of the bytes and the sniffing above is done before this line, not after.
    audio = await context.decodeAudioData(bytes.slice().buffer);
  } catch (error) {
    // A key rather than a sentence: this file is copied byte for byte into
    // fifteen languages, and main.js is where the words live.
    throw new UnreadableFile('audio.nodecode', { cause: error });
  }

  const channels = [];
  for (let i = 0; i < audio.numberOfChannels; i += 1) {
    channels.push(audio.getChannelData(i));
  }
  if (!channels.length || !channels[0].length) {
    throw new UnreadableFile('audio.nosound');
  }

  return {
    channels,
    sampleRate: audio.sampleRate,
    frames: channels[0].length,
    duration: audio.duration,
    // Whether the rate above came out of the file or was assumed. The page
    // says which, because in the second case the samples are not the ones on
    // the disk any more.
    guessedRate: declared === null,
  };
}
