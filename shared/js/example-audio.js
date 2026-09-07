/**
 * A short piece of music, synthesised in the page.
 *
 * The audio tools need something to work on for the same reason the image
 * tools do, and it is made here for the same reason too - see the note at the
 * top of shared/js/example-photo.js, which explains why nothing on this site
 * is ever fetched.
 *
 * WHY IT IS MUSIC AND NOT A TONE
 *
 * A sine tone would be a smaller file and a worse example. Every one of these
 * tools is judged against a waveform: the trimmer asks which part of the
 * picture to keep, the editor's speed and reverse controls are only obviously
 * doing anything if the thing they act on has a shape, and a flat tone has
 * none. So this has bars, a bass note on each one, and a second half that is
 * louder and reaches an octave higher - which means the drawn waveform has
 * landmarks, and a cut can be seen to have landed where it was asked to.
 *
 * It is written as arithmetic rather than through an AudioContext because it
 * has to come out identical every time and on every machine, and because an
 * AudioContext cannot be started without a gesture on some browsers - which is
 * exactly the moment this runs.
 */

import { writeWav } from './wav.js';

const RATE = 44100;

/** A4 = 440 Hz, twelve-tone equal temperament, semitones from A4. */
const hz = (semitones) => 440 * (2 ** (semitones / 12));

/**
 * The motif, as semitones from A4: an A-minor arpeggio that rises and falls.
 * Written as one bar and played four times, twice quietly and twice not.
 */
const BAR = [-12, -9, -5, 0, -5, -9, -12, -9];
const BASS = -24;

/**
 * A plucked envelope: immediate attack, exponential decay. Enough to give each
 * note an edge the waveform can be read by, without a click at either end.
 */
function pluck(t, length) {
  const attack = 0.006;
  if (t < attack) return t / attack;
  const decay = Math.exp(-3.2 * (t - attack) / Math.max(0.001, length - attack));
  // A short fade at the very end, so no note is cut off mid-cycle.
  const tail = Math.min(1, (length - t) / 0.01);
  return decay * Math.max(0, tail);
}

/**
 * Build the piece.
 *
 * @param {object} [options]
 * @param {number} [options.bars]  how many bars; each is two seconds at 120bpm
 * @returns {{ channels: Float32Array[], sampleRate: number }}
 */
export function exampleAudio({ bars = 4 } = {}) {
  const beat = 0.25;                 // eight notes to a two-second bar
  const barSeconds = BAR.length * beat;
  const seconds = bars * barSeconds;
  const frames = Math.round(seconds * RATE);

  const left = new Float32Array(frames);
  const right = new Float32Array(frames);

  for (let bar = 0; bar < bars; bar += 1) {
    // The second half is louder and carries an octave above, so the waveform
    // has a visible middle - which is what makes a trim checkable by eye.
    const loud = bar >= bars / 2;
    const level = loud ? 0.34 : 0.19;
    const barStart = bar * barSeconds;

    // One bass note under each bar, long and quiet, holding the picture up.
    const bassStart = Math.round(barStart * RATE);
    const bassLength = barSeconds * 0.9;
    for (let i = 0; i < bassLength * RATE && bassStart + i < frames; i += 1) {
      const t = i / RATE;
      const v = Math.sin(2 * Math.PI * hz(BASS) * t) * pluck(t, bassLength) * 0.16;
      left[bassStart + i] += v;
      right[bassStart + i] += v;
    }

    for (let n = 0; n < BAR.length; n += 1) {
      const start = Math.round((barStart + n * beat) * RATE);
      const length = beat * 0.92;
      const f = hz(BAR[n]);
      // The pan walks across the bar, so the two channels are never identical
      // and a tool that drops one is obvious.
      const pan = 0.5 + 0.35 * Math.sin((n / BAR.length) * Math.PI * 2);

      for (let i = 0; i < length * RATE && start + i < frames; i += 1) {
        const t = i / RATE;
        const env = pluck(t, length);
        // A second harmonic at a third of the level keeps it from sounding
        // like a test tone; the octave above only joins for the loud half.
        let v = Math.sin(2 * Math.PI * f * t)
          + 0.33 * Math.sin(4 * Math.PI * f * t);
        if (loud) v += 0.5 * Math.sin(4 * Math.PI * f * t + 0.4);
        v *= env * level;
        left[start + i] += v * (1 - pan);
        right[start + i] += v * pan;
      }
    }
  }

  return { channels: [left, right], sampleRate: RATE };
}

/**
 * The piece as a WAV File, which is what a tool's `onFiles` expects.
 *
 * WAV rather than MP3 or Opus: it is the format every one of these tools
 * already writes, nothing has to be encoded, and it is the one container a
 * browser can be relied on to produce without asking a codec for permission.
 */
export function exampleAudioFile(name, options) {
  const { channels, sampleRate } = exampleAudio(options);
  const blob = writeWav(channels, sampleRate);
  return new File([blob], name, { type: 'audio/wav', lastModified: Date.now() });
}
