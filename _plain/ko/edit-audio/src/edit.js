/**
 * The three edits, in the order they have to happen.
 *
 *   reverse -> speed -> volume
 *
 * The order is not a preference. Reversing before the speed change means the
 * stretcher's windows are chosen on the samples that will actually be heard,
 * which is what keeps a reversed-and-slowed track from developing a stutter
 * the same track slowed and then reversed does not have. Volume goes last
 * because it is the only step whose result can be measured against full scale,
 * and measuring it before a resample would report a peak the file will not
 * have.
 *
 * Nothing here decodes or encodes anything. It is arithmetic over the samples
 * the browser already decoded, in this page, on this machine.
 */

import { reverse, applyGain, peak, dbToGain, normalizeGain } from './effects.js';
import { resample, resampledLength } from './speed.js';
import { stretch, stretchedLength } from './stretch.js';

/**
 * Run the edits over a copy of the decoded audio.
 *
 * @param {{channels: Float32Array[], sampleRate: number}} source
 * @param {{
 *   reverse: boolean, speed: number, keepPitch: boolean,
 *   volume: {mode: 'gain'|'normalize', db: number},
 * }} settings
 * @param {{onProgress?: (done: number, label: string) => void, signal?: AbortSignal}} options
 * @returns {Promise<{
 *   channels: Float32Array[], peak: number, clipped: number, gain: number,
 * }>} the samples, how close to full scale they came, how many went past it,
 *   and what they were multiplied by to get there
 */
export async function render(source, settings, { onProgress, signal } = {}) {
  const report = (done, label) => onProgress?.(Math.min(1, Math.max(0, done)), label);

  // A copy, so the file can be edited again with different settings without
  // being read off the disk and decoded a second time.
  let channels = source.channels.map((samples) => Float32Array.from(samples));
  signal?.throwIfAborted();

  if (settings.reverse) {
    report(0.02, 'Reversing…');
    reverse(channels);
  }

  if (settings.speed !== 1) {
    const label = settings.keepPitch ? 'Stretching, keeping the pitch…' : 'Resampling…';
    report(0.05, label);
    const onStep = (done) => report(0.05 + done * 0.88, label);
    channels = settings.keepPitch
      ? await stretch(channels, settings.speed, source.sampleRate, { onProgress: onStep, signal })
      : await resample(channels, settings.speed, { onProgress: onStep, signal });
  }

  signal?.throwIfAborted();
  report(0.95, 'Setting the level…');

  const before = peak(channels);
  const gain = settings.volume.mode === 'normalize'
    ? normalizeGain(before, settings.volume.db)
    : dbToGain(settings.volume.db);

  const after = gain === 1 ? { peak: before, clipped: countOver(channels) } : applyGain(channels, gain);
  report(1, 'Writing the file…');

  return { channels, peak: after.peak, clipped: after.clipped, gain };
}

/** How many samples are already past full scale, for the gain-of-one case
 *  where nothing is multiplied and there is nothing to count on the way. */
function countOver(channels) {
  let over = 0;
  for (const samples of channels) {
    for (let i = 0; i < samples.length; i += 1) if (Math.abs(samples[i]) > 1) over += 1;
  }
  return over;
}

/** What the speed setting will do to the length, for the line on the page that
 *  says so before anything is run. Both paths agree; they are separate
 *  functions because neither module should have to know about the other. */
export function lengthAfter(frames, speed, keepPitch) {
  if (speed === 1) return frames;
  return keepPitch ? stretchedLength(frames, speed) : resampledLength(frames, speed);
}
