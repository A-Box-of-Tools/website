/**
 * Folding several channels down to one.
 *
 * Its own module rather than a helper in main.js because it is the only
 * arithmetic on this page that makes a choice, and a choice is worth a test.
 * main.js imports ./shared/phrases.js, which does not exist in the source tree
 * - it is copied in at build time - so nothing in main.js can be loaded by the
 * JavaScript tests at all.
 */

/**
 * Average the channels rather than taking the first one.
 *
 * Dropping a channel loses whatever was only in the other, which on a recording
 * made with two microphones is half the room - one speaker at a table, one side
 * of an interview, the whole of an instrument panned hard. Averaging can cancel
 * where two channels are out of phase, which is rarer, quieter, and recoverable
 * by going back to the stereo file; a lost speaker is not.
 *
 * @param {Float32Array[]} channels one array per channel, all the same length
 * @returns {Float32Array} one channel
 */
export function mixToMono(channels) {
  if (!channels.length) throw new Error('wav.nochannels');
  const frames = channels[0].length;
  for (const channel of channels) {
    if (channel.length !== frames) throw new Error('wav.uneven');
  }
  if (channels.length === 1) return channels[0];

  const out = new Float32Array(frames);
  for (const channel of channels) {
    for (let i = 0; i < frames; i += 1) out[i] += channel[i];
  }
  for (let i = 0; i < frames; i += 1) out[i] /= channels.length;
  return out;
}
