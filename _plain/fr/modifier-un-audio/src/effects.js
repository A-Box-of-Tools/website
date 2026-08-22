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
  for (const samples of channels) {
    for (let i = 0, j = samples.length - 1; i < j; i += 1, j -= 1) {
      const held = samples[i];
      samples[i] = samples[j];
      samples[j] = held;
    }
  }
  return channels;
}

/** The largest distance from silence in any channel. 1 is full scale. */
export function peak(channels) {
  let highest = 0;
  for (const samples of channels) {
    for (let i = 0; i < samples.length; i += 1) {
      const size = Math.abs(samples[i]);
      if (size > highest) highest = size;
    }
  }
  return highest;
}

/**
 * Multiply every sample, in place, and report what that did.
 *
 * Nothing is clamped here. A sample that ends up past full scale stays past
 * full scale, so a 32-bit float export carries it out intact and the count
 * below is a warning rather than a description of damage already done. The
 * 16-bit writer is where clamping actually happens.
 */
export function applyGain(channels, gain) {
  let highest = 0;
  let over = 0;
  for (const samples of channels) {
    for (let i = 0; i < samples.length; i += 1) {
      const value = samples[i] * gain;
      samples[i] = value;
      const size = Math.abs(value);
      if (size > highest) highest = size;
      if (size > 1) over += 1;
    }
  }
  return { peak: highest, clipped: over };
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
