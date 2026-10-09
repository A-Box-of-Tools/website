/** Only callers opting in trade immediate output for progress and Cancel. */
import { prepareWav, packWavFrames } from './wav.js';
import { workCheckpoint } from './cooperative-work.js';

const BLOCK_FRAMES = 8192;

/** The same header and samples as writeWav, packed in bounded pieces. */
export async function writeWavAsync(channels, sampleRate,
  { bits = 16, signal, onProgress, budgetMs } = {}) {
  const checkpoint = workCheckpoint({ signal, budgetMs });
  await checkpoint(true);
  const { header, float, frames } = prepareWav(channels, sampleRate, { bits });
  const parts = [header];
  for (let from = 0; from < frames; from += BLOCK_FRAMES) {
    const to = Math.min(frames, from + BLOCK_FRAMES);
    parts.push(packWavFrames(channels, float, from, to));
    onProgress?.({ done: to, total: frames });
    await checkpoint();
  }
  await checkpoint();
  return new Blob(parts, { type: 'audio/wav' });
}
