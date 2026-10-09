/**
 * Folding several channels down to one.
 *
 * Its own module rather than a helper in main.js because it is the only
 * arithmetic on this page that makes a choice, and a choice is worth a test.
 * The cooperative variant preserves the same Float32 accumulation order,
 * while a long mix still returns control to the visitor.
 */

import { workCheckpoint } from './shared/cooperative-work.js';

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

/** The existing mix in bounded runs, with cancellation between browser turns. */
export async function mixToMonoAsync(channels, { signal, onProgress, budgetMs } = {}) {
  const checkpoint = workCheckpoint({ signal, budgetMs });
  await checkpoint(true);
  if (!channels.length) throw new Error('wav.nochannels');
  const frames = channels[0].length;
  for (const channel of channels) {
    if (channel.length !== frames) throw new Error('wav.uneven');
  }
  if (channels.length === 1) return channels[0];
  const out = new Float32Array(frames);
  let done = 0;
  const total = frames * (channels.length + 1);
  for (const channel of channels) {
    for (let from = 0; from < frames; from += 8192) {
      const to = Math.min(frames, from + 8192);
      for (let i = from; i < to; i++) out[i] += channel[i];
      done += to - from;
      onProgress?.({ done, total });
      await checkpoint();
    }
  }
  for (let from = 0; from < frames; from += 8192) {
    const to = Math.min(frames, from + 8192);
    for (let i = from; i < to; i++) out[i] /= channels.length;
    done += to - from;
    onProgress?.({ done, total });
    await checkpoint();
  }
  await checkpoint();
  return out;
}
