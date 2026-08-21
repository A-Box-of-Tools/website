/**
 * Changing the speed without moving the pitch: WSOLA.
 *
 * The idea is old and simple. Cut the recording into overlapping windows, then
 * lay them back down closer together to speed it up, or further apart to slow
 * it down, and crossfade where they overlap. The length changes; the samples
 * inside each window do not, so nothing about the pitch changes either.
 *
 * The whole difficulty is *where* to cut. Laying down two windows whose waves
 * are out of step with each other means they partly cancel where they cross,
 * which is the flanging, hollow sound that gives cheap time-stretching away.
 * So each window is allowed to slide a few milliseconds either side of where
 * the arithmetic says it should be, and the position chosen is the one whose
 * overlap looks most like the natural continuation of the window already laid
 * down - "waveform similarity", the WS in WSOLA.
 *
 * Searching for that position is nearly all of the work, so it is done twice:
 * once coarsely on a signal averaged down by four, and then finely, over the
 * few samples the coarse pass narrowed it to. That is about a tenth of the
 * arithmetic of searching every offset at full resolution, and it finds the
 * same offset.
 */

/** How far apart the coarse pass steps, and how much it averages down by. */
const DECIMATE = 4;

/** How many frames come out of a stretch at this speed. */
export const stretchedLength = (frames, speed) => Math.max(1, Math.round(frames / speed));

/**
 * Time-stretch every channel by `speed`, keeping the pitch where it was.
 *
 * @param {Float32Array[]} channels
 * @param {number} speed      2 makes it half as long, 0.5 twice as long
 * @param {number} sampleRate used to size the windows in milliseconds
 * @param {{onProgress?: (done: number) => void, signal?: AbortSignal}} options
 * @returns {Promise<Float32Array[]>} new arrays; the ones passed in are untouched
 */
export async function stretch(channels, speed, sampleRate, { onProgress, signal } = {}) {
  if (!(speed > 0)) throw new Error('speed must be greater than zero');
  const frames = channels[0].length;
  const outFrames = stretchedLength(frames, speed);

  // About 46 ms, which is long enough to hold a cycle of anything with a pitch
  // and short enough that a syllable is not smeared across two of them. A file
  // too short to hold two windows cannot be stretched this way at all.
  const frame = even(Math.min(Math.round(sampleRate * 0.046), Math.floor(frames / 2)));
  if (frame < 64) return shortened(channels, outFrames);

  const hop = frame / 2;
  // How far a window may slide: about 6 ms, which covers a full cycle of
  // anything above 170 Hz and most of one below that.
  const search = DECIMATE * Math.max(1, Math.round((sampleRate * 0.006) / DECIMATE));

  const window = hann(frame);
  const mono = mixdown(channels);
  const coarse = averageDown(mono);

  const out = channels.map(() => new Float32Array(outFrames));
  const weight = new Float32Array(outFrames);
  const lastStart = Math.max(0, frames - frame);

  let position = 0;      // where the window being written starts, in samples
  let ideal = 0;         // where the next one would start with no sliding
  let outAt = 0;
  let sincePause = 0;

  while (outAt < outFrames) {
    for (let c = 0; c < channels.length; c += 1) {
      const input = channels[c];
      const output = out[c];
      const limit = Math.min(frame, outFrames - outAt, frames - position);
      for (let i = 0; i < limit; i += 1) output[outAt + i] += input[position + i] * window[i];
    }
    {
      const limit = Math.min(frame, outFrames - outAt, frames - position);
      for (let i = 0; i < limit; i += 1) weight[outAt + i] += window[i];
    }

    // Where the recording would go next if this window simply played on. The
    // next window is chosen to look as much like that as possible.
    const continues = position + hop;
    ideal += hop * speed;
    const target = Math.min(lastStart, Math.max(0, Math.round(ideal)));
    position = target + bestOffset(mono, coarse, continues, target, search, hop, lastStart);
    outAt += hop;

    sincePause += 1;
    if (sincePause >= 64) {
      signal?.throwIfAborted();
      onProgress?.(Math.min(1, outAt / outFrames));
      await pause();
      sincePause = 0;
    }
  }

  // Every sample was written by one or two windows, and the two do not sum to
  // exactly one at the very start and end. Dividing by what was actually laid
  // down is what keeps those two moments at the level the rest of the file is.
  for (const output of out) {
    for (let i = 0; i < outFrames; i += 1) {
      if (weight[i] > 1e-4) output[i] /= weight[i];
    }
  }

  onProgress?.(1);
  return out;
}

/**
 * How far to slide the next window, in samples, within +/- `search`.
 *
 * Coarse first, on the averaged-down signal, then fine over the few offsets
 * between the coarse steps. Both passes score a candidate the same way: the
 * dot product of the overlap against the natural continuation, divided by the
 * candidate's own energy, so a loud passage cannot win simply by being loud.
 */
function bestOffset(mono, coarse, continues, target, search, overlap, lastStart) {
  let bestCoarse = 0;
  let best = -Infinity;
  const shortRef = Math.round(continues / DECIMATE);
  const shortLength = Math.floor(overlap / DECIMATE);

  for (let offset = -search; offset <= search; offset += DECIMATE) {
    const at = target + offset;
    if (at < 0 || at > lastStart) continue;
    const score = similarity(coarse, shortRef, Math.round(at / DECIMATE), shortLength);
    if (score > best) { best = score; bestCoarse = offset; }
  }

  let bestFine = bestCoarse;
  best = -Infinity;
  for (let offset = bestCoarse - DECIMATE + 1; offset <= bestCoarse + DECIMATE - 1; offset += 1) {
    const at = target + offset;
    if (at < 0 || at > lastStart) continue;
    const score = similarity(mono, continues, at, overlap);
    if (score > best) { best = score; bestFine = offset; }
  }

  const at = target + bestFine;
  return at < 0 || at > lastStart ? 0 : bestFine;
}

function similarity(signal, refAt, candidateAt, length) {
  if (refAt < 0 || candidateAt < 0) return -Infinity;
  const limit = Math.min(length, signal.length - refAt, signal.length - candidateAt);
  if (limit <= 0) return -Infinity;

  let dot = 0;
  let energy = 0;
  for (let i = 0; i < limit; i += 1) {
    const candidate = signal[candidateAt + i];
    dot += signal[refAt + i] * candidate;
    energy += candidate * candidate;
  }
  return dot / Math.sqrt(energy + 1e-9);
}

/** The periodic Hann window: two of them, half a window apart, sum to one. */
function hann(length) {
  const window = new Float32Array(length);
  for (let i = 0; i < length; i += 1) {
    window[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / length);
  }
  return window;
}

/** One channel to search in. Where the windows go has to be the same for all
 *  of them, or the stereo image tears in half. */
function mixdown(channels) {
  if (channels.length === 1) return channels[0];
  const frames = channels[0].length;
  const mono = new Float32Array(frames);
  for (const samples of channels) {
    for (let i = 0; i < frames; i += 1) mono[i] += samples[i];
  }
  const scale = 1 / channels.length;
  for (let i = 0; i < frames; i += 1) mono[i] *= scale;
  return mono;
}

/** The same signal at a quarter of the rate, for the coarse pass to search. */
function averageDown(mono) {
  const length = Math.ceil(mono.length / DECIMATE);
  const out = new Float32Array(length);
  for (let i = 0; i < length; i += 1) {
    let sum = 0;
    let count = 0;
    for (let j = i * DECIMATE; j < Math.min(mono.length, i * DECIMATE + DECIMATE); j += 1) {
      sum += mono[j];
      count += 1;
    }
    out[i] = count ? sum / count : 0;
  }
  return out;
}

/** A file too short to hold two windows. Nothing to overlap, so it is cut or
 *  padded to length and left alone - at these lengths, under a tenth of a
 *  second, there is nothing to hear either way. */
function shortened(channels, outFrames) {
  return channels.map((samples) => {
    const out = new Float32Array(outFrames);
    out.set(samples.subarray(0, Math.min(samples.length, outFrames)));
    return out;
  });
}

const even = (n) => (n % 2 === 0 ? n : n - 1);

/** Hand the thread back, so the page repaints and a cancel is noticed. */
const pause = () => new Promise((resolve) => { setTimeout(resolve, 0); });
