/**
 * The cut itself: marks in seconds, samples out.
 *
 * Everything interesting about trimming video - keyframes, why a cut lands
 * earlier than you asked, whether the frames can be moved without decoding -
 * has no counterpart here, and that is worth saying plainly rather than
 * leaving somebody to wonder what the catch is. A decoded recording is a run
 * of numbers, one per channel per instant, and every one of them stands on its
 * own. There is no equivalent of a frame that cannot be read without its
 * neighbours, so a cut can land on any sample at all, and the samples that
 * come out are the ones that went in.
 *
 * That leaves exactly one thing this file has to be careful about, and it is
 * the audio-only problem: a join is a discontinuity. Cutting from the middle
 * of one word to the middle of another puts two unrelated waveforms next to
 * each other, and a speaker asked to jump between them makes a click. The fix
 * is a fade of a few milliseconds either side of every join - short enough not
 * to be heard as a fade, long enough for the cone to get there. See
 * `planSections` for where the fades are placed and, just as importantly,
 * where they are not.
 *
 * Nothing here decodes or encodes anything, and nothing here can reach a
 * network. It is arithmetic over samples the browser already decoded, in this
 * page, on this machine.
 */

/** Shorter than this and there is nothing to keep. One millisecond. */
const MIN_SECTION = 0.001;

/**
 * How long to work before handing the page back, in milliseconds.
 *
 * A frame at 60 Hz is 16.7 ms; twelve leaves room for the repaint itself. It is
 * a budget rather than a count of sections because sections are not the same
 * size: one part of an hour-long recording is more work than two hundred parts
 * of a jingle, and neither should decide how often the page gets a turn.
 */
const BUDGET_MS = 12;

/**
 * Hand the page back - properly.
 *
 * `await Promise.resolve()` does not do this, and that is the trap this
 * constant exists to name. Awaiting an already-resolved promise queues a
 * *microtask*, and microtasks run to exhaustion at the end of the task that
 * queued them: the browser never gets between them to repaint, and it never
 * gets between them to deliver a click. A loop that yields that way looks like
 * it is being polite and is in fact one uninterruptible block of work - so the
 * progress bar stays where it was, and the Cancel button cannot be pressed
 * because the click event has nowhere to be dispatched until the loop is over.
 *
 * A timer is a new task. That is the whole difference, and it is the difference
 * between a progress bar that means something and one that is decoration.
 */
const handBack = () => new Promise((resolve) => { setTimeout(resolve, 0); });

/* --------------------------------------------------------------- the marks */

/**
 * Everything the marks did *not* cover, which is what "cut them out" keeps.
 *
 * Overlapping marks are merged rather than refused: two marks over the same
 * advert is a thing people do, and the answer to "cut both out" is the same
 * either way.
 *
 * @param {{start: number, end: number}[]} ranges
 * @param {number} duration  the whole recording, in seconds
 */
export function invertRanges(ranges, duration) {
  const ordered = [...ranges].sort((a, b) => a.start - b.start);
  const gaps = [];
  let at = 0;

  for (const range of ordered) {
    if (range.start > at) gaps.push({ start: at, end: Math.min(range.start, duration) });
    at = Math.max(at, range.end);
  }
  if (at < duration) gaps.push({ start: at, end: duration });

  return gaps.filter((gap) => gap.end - gap.start > MIN_SECTION);
}

/** How long the finished recording will run to, in seconds. */
export function totalSeconds(ranges) {
  return ranges.reduce((total, range) => total + (range.end - range.start), 0);
}

/* ------------------------------------------------------------ the sections */

/**
 * Turn the marks into runs of samples, and decide where the fades go.
 *
 * Seconds become samples exactly once, here, so the number on the page and the
 * number the cut uses cannot drift apart. Rounding is to the nearest sample:
 * half a sample is eleven microseconds at 44.1 kHz, which is not a quantity
 * anybody marked on purpose.
 *
 * ## Where the fades go, and where they do not
 *
 * A fade belongs at a *join* - a place where the recording jumps. It does not
 * belong at an edge that was already an edge. If a part starts at sample zero
 * then nothing was cut off in front of it: the file began there before this
 * tool touched it, and fading it in would be an edit nobody asked for. The
 * same at the end. So a fade is placed only where `from > 0` or
 * `to < totalFrames` - which means trimming nothing at all leaves the samples
 * completely untouched, and the page can say so.
 *
 * Each fade is capped at half the part, so the two never overlap and a part
 * shorter than two fades still gets a clean ramp up and back down rather than
 * arithmetic that reaches past itself.
 *
 * @param {{start: number, end: number}[]} ranges  in seconds, in output order
 * @param {{sampleRate: number, totalFrames: number, fadeSeconds?: number}} source
 * @returns {{from: number, to: number, frames: number, fadeIn: number, fadeOut: number}[]}
 */
export function planSections(ranges, { sampleRate, totalFrames, fadeSeconds = 0 }) {
  const wanted = Math.max(0, Math.round((Number(fadeSeconds) || 0) * sampleRate));
  const sections = [];

  for (const range of ranges) {
    const from = clamp(Math.round(range.start * sampleRate), 0, totalFrames);
    const to = clamp(Math.round(range.end * sampleRate), from, totalFrames);
    const frames = to - from;
    if (frames < 1) continue;

    const cap = Math.floor(frames / 2);
    sections.push({
      from,
      to,
      frames,
      fadeIn: from > 0 ? Math.min(wanted, cap) : 0,
      fadeOut: to < totalFrames ? Math.min(wanted, cap) : 0,
    });
  }

  return sections;
}

/** How many samples per channel the finished file will hold. */
export function sectionFrames(sections) {
  return sections.reduce((total, section) => total + section.frames, 0);
}

/**
 * Whether the samples come out exactly as they went in.
 *
 * True for one section that covers the whole recording with no fades on it -
 * the case where somebody opened a file, marked nothing, and pressed the
 * button. The page says so when it is true, because "nothing was changed" is a
 * stronger claim than "nothing was re-encoded" and it is worth making.
 */
export function isUntouched(sections, totalFrames) {
  return sections.length === 1
    && sections[0].from === 0
    && sections[0].to === totalFrames
    && sections[0].fadeIn === 0
    && sections[0].fadeOut === 0;
}

/* ----------------------------------------------------------------- the cut */

/**
 * The ramps, in place, over one section already copied into `samples` at `at`.
 *
 * Linear rather than anything cleverer. Over five milliseconds the difference
 * between a straight line and a curve is inaudible, and a straight line is the
 * one a reader can check: the first sample of a faded-in join is exactly
 * silent, the last sample of a faded-out one is too, and everything between
 * moves by an equal step.
 */
function applyFades(samples, at, { frames, fadeIn, fadeOut }) {
  for (let j = 0; j < fadeIn; j += 1) samples[at + j] *= j / fadeIn;
  for (let j = 0; j < fadeOut; j += 1) samples[at + frames - 1 - j] *= j / fadeOut;
}

/**
 * One section, into every channel of `out` at `at`.
 *
 * A straight `set` per channel, so the bulk of the work is the browser's own
 * typed-array copy, and then the handful of samples at each join are multiplied
 * by the ramp. Nothing in the middle of a section is touched at all.
 *
 * The two entry points below both go through this rather than each having their
 * own copy of the loop: one of them runs in the page and the other is what the
 * tests measure, and a tool whose tested path is not its real path is a tool
 * whose tests prove nothing.
 */
function copySection(channels, out, at, section) {
  for (let c = 0; c < channels.length; c += 1) {
    out[c].set(channels[c].subarray(section.from, section.to), at);
    applyFades(out[c], at, section);
  }
}

/**
 * Copy the marked runs of samples into new channels, in order.
 *
 * @param {Float32Array[]} channels
 * @param {ReturnType<typeof planSections>} sections
 * @returns {Float32Array[]}
 */
export function cutChannels(channels, sections) {
  const frames = sectionFrames(sections);
  const out = channels.map(() => new Float32Array(frames));

  let at = 0;
  for (const section of sections) {
    copySection(channels, out, at, section);
    at += section.frames;
  }
  return out;
}

/**
 * The whole job, a section at a time, so a long recording does not freeze the
 * page.
 *
 * The work is fast - a copy and a few hundred multiplications a join - but
 * "fast" on a two-hour recording still means a moment, and a page that stops
 * answering looks broken. So the page is handed back whenever this has been
 * working for longer than a frame: see `handBack` above for why that has to be
 * a timer and cannot be a resolved promise.
 *
 * The budget is an argument because the tests set it to zero. A test that
 * cancels from inside `onProgress` proves nothing about the Cancel button -
 * that path never returns to the event loop either - so the tests here abort
 * from a timer, the way a person's click does, and that only means something
 * if this loop really yields.
 *
 * @param {{channels: Float32Array[], sampleRate: number, frames: number}} source
 * @param {ReturnType<typeof planSections>} sections
 * @param {{onProgress?: (done: number, label: string) => void,
 *          signal?: AbortSignal, budgetMs?: number}} options
 * @returns {Promise<{channels: Float32Array[], frames: number}>}
 */
export async function trim(source, sections, { onProgress, signal, budgetMs = BUDGET_MS } = {}) {
  const frames = sectionFrames(sections);
  if (!frames) throw new Error('There is nothing marked to keep.');

  const out = source.channels.map(() => new Float32Array(frames));
  let at = 0;
  let done = 0;
  let since = performance.now();

  for (const section of sections) {
    signal?.throwIfAborted();
    copySection(source.channels, out, at, section);
    at += section.frames;
    done += 1;
    onProgress?.(at / frames, `Copying part ${done} of ${sections.length}…`);

    if (performance.now() - since >= budgetMs) {
      await handBack();
      since = performance.now();
    }
  }

  signal?.throwIfAborted();
  return { channels: out, frames };
}

function clamp(value, low, high) {
  return Math.max(low, Math.min(high, value));
}
