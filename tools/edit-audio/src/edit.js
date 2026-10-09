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

import { reverseRange, measureRange, gainRange, dbToGain, normalizeGain } from './effects.js';
import { workCheckpoint } from './shared/cooperative-work.js';
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
 * @param {{onProgress?: (done: number, label: string) => void, signal?: AbortSignal, budgetMs?: number}} options
 * @returns {Promise<{
 *   channels: Float32Array[], peak: number, clipped: number, gain: number,
 * }>} the samples, how close to full scale they came, how many went past it,
 *   and what they were multiplied by to get there
 */
export async function render(source, settings, { onProgress, signal, budgetMs } = {}) {
  const report = (done, label) => onProgress?.(Math.min(1, Math.max(0, done)), label);
  const checkpoint = workCheckpoint({ signal, budgetMs });
  const BLOCK = 8192;
  await checkpoint(true);
  report(0, 'step.copying');
  let channels = [];
  for (const samples of source.channels) {
    const copy = new Float32Array(samples.length);
    for (let from = 0; from < samples.length; from += BLOCK) {
      copy.set(samples.subarray(from, Math.min(samples.length, from + BLOCK)), from);
      await checkpoint();
    }
    channels.push(copy);
  }

  if (settings.reverse) {
    report(0.02, 'step.reversing');
    for (const samples of channels) {
      const half = Math.floor(samples.length / 2);
      for (let from = 0; from < half; from += BLOCK) {
        reverseRange(samples, from, Math.min(half, from + BLOCK));
        await checkpoint();
      }
    }
  }

  if (settings.speed !== 1) {
    const label = settings.keepPitch ? 'step.stretching' : 'step.resampling';
    report(0.05, label);
    const onStep = (done) => report(0.05 + done * 0.88, label);
    channels = settings.keepPitch
      ? await stretch(channels, settings.speed, source.sampleRate, { onProgress: onStep, signal })
      : await resample(channels, settings.speed, { onProgress: onStep, signal });
  }

  await checkpoint();
  report(0.95, 'step.level');
  let before = 0; let clipped = 0;
  for (const samples of channels) {
    for (let from = 0; from < samples.length; from += BLOCK) {
      const result = measureRange(samples, from, Math.min(samples.length, from + BLOCK));
      before = Math.max(before, result.peak); clipped += result.clipped;
      await checkpoint();
    }
  }
  const gain = settings.volume.mode === 'normalize'
    ? normalizeGain(before, settings.volume.db) : dbToGain(settings.volume.db);
  let after = before;
  report(0.97, 'step.level');
  if (gain !== 1) {
    after = 0; clipped = 0;
    for (const samples of channels) {
      for (let from = 0; from < samples.length; from += BLOCK) {
        const result = gainRange(samples, gain, from, Math.min(samples.length, from + BLOCK));
        after = Math.max(after, result.peak); clipped += result.clipped;
        await checkpoint();
      }
    }
  }
  await checkpoint();
  report(1, 'step.writing');
  await checkpoint();
  return { channels, peak: after, clipped, gain };
}

/** What the speed setting will do to the length, for the line on the page that
 *  says so before anything is run. Both paths agree; they are separate
 *  functions because neither module should have to know about the other. */
export function lengthAfter(frames, speed, keepPitch) {
  if (speed === 1) return frames;
  return keepPitch ? stretchedLength(frames, speed) : resampledLength(frames, speed);
}
