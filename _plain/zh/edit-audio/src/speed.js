/**
 * Changing the speed the way a tape deck does: the samples are read out at a
 * different rate, so the pitch moves with them.
 *
 * That is a resample, and a resample is the one place in this tool where doing
 * the obvious thing sounds bad. Reading every other sample to play something
 * twice as fast folds everything above a quarter of the sampling rate back
 * down into the audible band as a metallic ring - aliasing - and it cannot be
 * removed afterwards. So the samples are read through a windowed sinc kernel
 * whose cutoff moves with the speed: speeding up narrows the band first and
 * then decimates, which is the order that keeps the fold-back out.
 *
 * The kernel is tabulated once, at module load, because the alternative is a
 * Math.sin per tap per output sample and a four-minute track has rather a lot
 * of both.
 */

/** How many zero crossings either side of the centre the kernel keeps. */
const LOBES = 8;
/** Table entries per lobe. Linear interpolation between them is inaudible. */
const RESOLUTION = 512;

/** sinc(t) * a Blackman window over |t| <= LOBES, sampled RESOLUTION per lobe. */
const KERNEL = buildKernel();

function buildKernel() {
  const table = new Float32Array(LOBES * RESOLUTION + 2);
  for (let i = 0; i < table.length; i += 1) {
    const t = i / RESOLUTION;
    const u = t / LOBES;                       // 0 at the centre, 1 at the edge
    const sinc = t === 0 ? 1 : Math.sin(Math.PI * t) / (Math.PI * t);
    const window = u >= 1
      ? 0
      : 0.42 + 0.5 * Math.cos(Math.PI * u) + 0.08 * Math.cos(2 * Math.PI * u);
    table[i] = sinc * window;
  }
  return table;
}

/** How many frames come out of a resample at this speed. */
export const resampledLength = (frames, speed) => Math.max(1, Math.round(frames / speed));

/**
 * Resample every channel by `speed`.
 *
 * @param {Float32Array[]} channels
 * @param {number} speed         2 plays twice as fast and an octave up
 * @param {{onProgress?: (done: number) => void, signal?: AbortSignal}} options
 * @returns {Promise<Float32Array[]>} new arrays; the ones passed in are untouched
 */
export async function resample(channels, speed, { onProgress, signal } = {}) {
  if (!(speed > 0)) throw new Error('speed must be greater than zero');
  const frames = channels[0].length;
  const outFrames = resampledLength(frames, speed);

  // Below the input's Nyquist when speeding up, at it when slowing down: a
  // slower playback needs no band limiting, because nothing is being folded.
  const cutoff = Math.min(1, 1 / speed);
  const radius = LOBES / cutoff;
  const out = channels.map(() => new Float32Array(outFrames));

  // Big enough that the per-block overhead disappears, small enough that the
  // page keeps repainting and Cancel is answered inside a frame or two.
  const BLOCK = 1 << 15;

  for (let start = 0; start < outFrames; start += BLOCK) {
    signal?.throwIfAborted();
    const end = Math.min(start + BLOCK, outFrames);

    for (let c = 0; c < channels.length; c += 1) {
      const input = channels[c];
      const output = out[c];
      for (let i = start; i < end; i += 1) {
        const at = i * speed;
        const first = Math.max(0, Math.ceil(at - radius));
        const last = Math.min(frames - 1, Math.floor(at + radius));

        let sum = 0;
        let weights = 0;
        for (let j = first; j <= last; j += 1) {
          // Where this input sample falls on the kernel, in output-band units.
          const position = Math.abs(j - at) * cutoff * RESOLUTION;
          const index = position | 0;
          const fraction = position - index;
          const weight = KERNEL[index] + (KERNEL[index + 1] - KERNEL[index]) * fraction;
          sum += input[j] * weight;
          weights += weight;
        }
        // Normalising by the weights actually used keeps the level right at
        // the two ends, where half the kernel hangs off the end of the file.
        output[i] = weights > 1e-6 ? sum / weights : 0;
      }
    }

    onProgress?.(end / outFrames);
    if (end < outFrames) await pause();
  }

  return out;
}

/** Hand the thread back, so the page repaints and a cancel is noticed. */
const pause = () => new Promise((resolve) => { setTimeout(resolve, 0); });
