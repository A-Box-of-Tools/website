/**
 * The two edits that are arithmetic rather than resampling: playing the
 * samples backwards, and multiplying them by a number.
 *
 * Both are exact. Reversing a track and reversing it again gives back the
 * samples that went in, bit for bit, and so does a gain of +6 dB followed by
 * one of -6 dB in 32-bit float. That is worth saying out loud, because the
 * usual way to do either of these online is to upload the file and get an MP3
 * back - which is a re-encode, and a re-encode is never exact.
 */

/** Turn each channel back to front, in place. */
export function reverse(channels) {
  for (const samples of channels) reverseRange(samples, 0, Math.floor(samples.length / 2));
  return channels;
}

/** Range primitives let cooperative rendering keep the synchronous arithmetic. */
export function reverseRange(samples, from, to) {
  for (let i = from; i < to; i += 1) {
    const j = samples.length - 1 - i;
    const held = samples[i]; samples[i] = samples[j]; samples[j] = held;
  }
}

export function measureRange(samples, from, to) {
  let highest = 0; let clipped = 0;
  for (let i = from; i < to; i += 1) {
    const size = Math.abs(samples[i]);
    if (size > highest) highest = size;
    if (size > 1) clipped += 1;
  }
  return { peak: highest, clipped };
}

/** The largest distance from silence in any channel. 1 is full scale. */
export function peak(channels) {
  let highest = 0;
  for (const samples of channels) highest = Math.max(highest, measureRange(samples, 0, samples.length).peak);
  return highest;
}

/** Peak and clipping still use the product before its Float32 store rounds it. */
export function gainRange(samples, gain, from, to) {
  let highest = 0; let clipped = 0;
  for (let i = from; i < to; i += 1) {
    const value = samples[i] * gain;
    samples[i] = value;
    const size = Math.abs(value);
    if (size > highest) highest = size;
    if (size > 1) clipped += 1;
  }
  return { peak: highest, clipped };
}

/** Nothing clamps before the writer, so a float export can retain overshoots. */
export function applyGain(channels, gain) {
  let highest = 0; let clipped = 0;
  for (const samples of channels) {
    const result = gainRange(samples, gain, 0, samples.length);
    highest = Math.max(highest, result.peak); clipped += result.clipped;
  }
  return { peak: highest, clipped };
}

/** Decibels to the number a sample is multiplied by, and back. */
export const dbToGain = (db) => 10 ** (db / 20);
export const gainToDb = (gain) => (gain > 0 ? 20 * Math.log10(gain) : -Infinity);

/**
 * The multiplier that puts the loudest sample at `targetDb` below full scale.
 *
 * This is peak normalisation, which is the one form of "make it louder" that
 * is completely reversible: every sample is multiplied by the same number, so
 * nothing about the recording changes except how far it is from the ceiling.
 * Loudness normalisation (LUFS) would sound more even across tracks and would
 * involve deciding, on the listener's behalf, which parts to squash.
 */
export function normalizeGain(currentPeak, targetDb = -1) {
  if (!(currentPeak > 0)) return 1; // silence has nothing to raise
  return dbToGain(targetDb) / currentPeak;
}
