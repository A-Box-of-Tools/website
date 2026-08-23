/**
 * The arithmetic behind a time-lapse: which instants to take, how big the
 * picture comes out, and which parts of the file have to be read to get there.
 *
 * All of it is pure - seconds, pixels and sample tables in, the same out - so
 * it is the half of this tool that can be checked without a browser, and it is
 * where the mistakes that would be hard to see live. A clip that comes out a
 * second longer than it was asked for, or a plan that decodes a whole file when
 * it needed a hundredth of it, are both errors nobody would spot by looking at
 * the result.
 */

/** Below this the tool is not making a time-lapse, it is copying a video. */
export const MIN_SPEED = 1.1;

/**
 * The fastest speed offered.
 *
 * Not a limit of anything here. Past some point the interval between instants
 * passes the length of the clip and there is one frame left, which is a
 * photograph; a thousand turns a twelve-hour night into forty-three seconds,
 * which is already past where anybody stops.
 */
export const MAX_SPEED = 1000;

/** A time-lapse of one frame is a still, so this is the floor on the output. */
export const MIN_FRAMES = 2;

/* --------------------------------------------------------- speed and length */

/**
 * How long the finished clip runs, in seconds.
 *
 * This is the definition the whole tool is built on: the speed is the ratio
 * between what went in and what comes out, so an hour at sixty times is a
 * minute - whatever frame rate it is written at.
 */
export function lengthForSpeed({ duration, speed }) {
  if (!(duration > 0) || !(speed > 0)) return 0;
  return duration / speed;
}

/** The same sum backwards, for the box that asks for a finished length. */
export function speedForLength({ duration, seconds }) {
  if (!(duration > 0) || !(seconds > 0)) return MIN_SPEED;
  return clampSpeed(duration / seconds);
}

export function clampSpeed(speed) {
  if (!Number.isFinite(speed)) return MIN_SPEED;
  return Math.min(MAX_SPEED, Math.max(MIN_SPEED, speed));
}

/**
 * The gap between the instants, in seconds of the original.
 *
 * The number a photographer would call the interval, and the one worth putting
 * on the page: "one frame every two seconds" says what the tool is about to do
 * far better than "sixty times" does.
 */
export function sampleInterval({ speed, fps }) {
  return speed / fps;
}

/**
 * When each frame is taken from, in seconds.
 *
 * The count is rounded down rather than up, so nothing is sampled from beyond
 * the end of the clip: at an interval of two seconds a clip of 9.5 seconds
 * gives four frames, not five, and the fourth is not a repeat of one already
 * seen. The epsilon is for the duration that arrives as 9.499999999999998
 * because it was divided out of a timescale.
 */
export function frameTimes({ duration, speed, fps }) {
  const interval = sampleInterval({ speed, fps });
  if (!(interval > 0) || !(duration > 0)) return [0];

  const count = Math.max(1, Math.floor(duration / interval + 1e-6));
  const times = new Array(count);
  for (let i = 0; i < count; i += 1) times[i] = i * interval;
  return times;
}

/**
 * Whether the plan asks for instants closer together than the source has
 * frames, in which case some of them are answered by the same frame twice.
 *
 * Not an error - a 12 fps clip sped up twice and written at 30 asks for exactly
 * this, and repeating a frame is the right answer - but it is the one setting
 * that makes the tool do work with nothing to show for it, so the page says so
 * rather than quietly padding the output.
 */
export function repeatsFrames({ speed, fps, sourceFps }) {
  if (!(sourceFps > 0)) return false;
  return sampleInterval({ speed, fps }) < 1 / sourceFps - 1e-9;
}

/* ----------------------------------------------------------------- the picture */

/**
 * The output frame: the source scaled so its shorter side is at most
 * `shortEdge`, never scaled up, and rounded to the even numbers H.264 can
 * describe.
 *
 * The shorter side rather than the height, because "1080p" means 1920x1080 for
 * a clip filmed the usual way round and 1080x1920 for one filmed on a phone
 * held upright. Capping the height instead would leave a portrait clip at a
 * third of the size that was asked for.
 */
export function outputSize({ width, height, shortEdge = 0 }) {
  if (!(width > 0) || !(height > 0)) return { width: 2, height: 2 };
  const even = (value) => Math.max(2, Math.round(value / 2) * 2);

  const shorter = Math.min(width, height);
  const scale = shortEdge > 0 ? Math.min(1, shortEdge / shorter) : 1;
  return { width: even(width * scale), height: even(height * scale) };
}

/**
 * Bits per pixel per frame.
 *
 * Higher than the figures the cropping tool uses, and deliberately so. A codec
 * saves most of its bits by describing a frame as a set of small changes to the
 * one before it, and in a time-lapse the one before it is two seconds - or two
 * minutes - earlier. The clouds have moved, the light has changed and the
 * traffic is somewhere else, so there is far less to reuse, and a figure tuned
 * for ordinary footage comes out blocky.
 */
const QUALITY_BPP = { low: 0.08, medium: 0.15, high: 0.3 };

const MIN_BITRATE = 300_000;
const MAX_BITRATE = 60_000_000;

/**
 * What to spend on the picture.
 *
 * There is no "never more than the original spent" ceiling here, which every
 * other video tool in this repository has. It would be the wrong sum: the
 * original spread its bits over sixty times as many frames, so its rate says
 * nothing about what one frame of this output is worth.
 */
export function chooseBitrate({ width, height, fps, quality = 'medium' }) {
  const bpp = QUALITY_BPP[quality] ?? QUALITY_BPP.medium;
  const rate = width * height * fps * bpp;
  return Math.round(Math.min(MAX_BITRATE, Math.max(MIN_BITRATE, rate)));
}

/**
 * A rough guess at the finished size, for the summary line.
 *
 * The bitrate above is what the encoder is asked for rather than what it
 * spends, so this is honest to within a wide margin, and the page says "about".
 */
export function estimateBytes({ frames, fps, bitrate }) {
  if (!(fps > 0)) return 0;
  return Math.round(frames / fps * bitrate / 8);
}

/* ------------------------------------------------------------ what to decode */

/**
 * The most reordering this will read past an instant for, in seconds.
 *
 * A cap rather than a value - `reorderSlack` below measures the real figure -
 * and half a second is already more reordering than any real encoder does. It
 * is here so that one corrupt timestamp cannot turn a plan that reads a
 * hundredth of the file into one that reads all of it. Past this cap an instant
 * may land on the frame next door, which in a time-lapse is invisible.
 */
export const REORDER_SLACK = 0.5;

/**
 * How far a frame in this file is ever stored before one shown earlier.
 *
 * Frames are stored in the order they have to be decoded, which is not
 * necessarily the order they are shown in: a file with B-frames stores a frame
 * shown later before one shown sooner. Stopping the feed at the first stored
 * frame past an instant would therefore drop frames that are not past it.
 *
 * Every other tool here answers that with a fixed half-second allowance. This
 * one measures it instead, because here the allowance is most of the cost: at
 * one instant every two seconds, half a second of slack is fifteen extra frames
 * decoded per instant against the one or two the instant actually needs. And
 * the measurement is exact rather than cautious - if no frame is ever stored
 * before one shown earlier, which is true of every phone recording, every
 * screen capture and everything WebCodecs writes, then the answer is zero and
 * the run around each instant is as short as it can be.
 *
 * The bound holds because the largest backwards step in the stored order is
 * also the furthest a frame can be from where its presentation time would put
 * it. Anything stored later than that has a presentation time past the instant.
 */
export function reorderSlack(samples, timescale) {
  if (!samples?.length || !(timescale > 0)) return 0;

  let highest = -Infinity;
  let worst = 0;
  for (const sample of samples) {
    if (highest > sample.pts) worst = Math.max(worst, highest - sample.pts);
    else highest = sample.pts;
  }
  return Math.min(REORDER_SLACK, worst / timescale);
}

/**
 * The runs of the file that actually have to be decoded.
 *
 * This is the whole reason a time-lapse of an hour of footage does not take an
 * hour. A frame can only be decoded by starting at the keyframe in front of it
 * and working forwards, but nothing says the frames in between have to be
 * *kept* - and at one instant every two seconds, in a file with a keyframe
 * every two seconds, that is a run of a frame or two per instant instead of
 * sixty.
 *
 * Runs that touch are merged, so a clip sampled faster than its keyframes come
 * round falls back to one run per group of pictures - which is as few as there
 * can be - and this costs nothing. That is the case the merge exists for:
 * without it a 2x time-lapse would ask for one run per instant, and restart the
 * decoder hundreds of times over a file it is reading straight through anyway.
 *
 * @param {object} args
 * @param {{pts: number, isKey: boolean}[]} args.samples  the video sample
 *   table, in decode order
 * @param {number} args.timescale  ticks per second, as the file counts them
 * @param {number[]} args.times  the wanted instants, in seconds, ascending
 * @param {number} [args.slack]  how far past an instant to read; measured off
 *   the file itself unless a caller says otherwise
 * @returns {{first: number, last: number, times: number[]}[]} sample ranges to
 *   feed the decoder, each with the instants it answers
 */
export function decodeRuns({ samples, timescale, times, slack }) {
  const runs = [];
  if (!samples?.length || !times?.length) return runs;

  if (slack === undefined) slack = reorderSlack(samples, timescale);

  const slackTicks = slack * timescale;
  // The walk never goes backwards, because the instants ascend. That is what
  // keeps this linear in the sample table rather than one scan of it per
  // instant, and the table for an hour of video has a hundred thousand rows.
  let cursor = 0;
  let key = 0;

  for (const time of times) {
    const ticks = time * timescale;

    while (cursor < samples.length && samples[cursor].pts <= ticks) {
      if (samples[cursor].isKey) key = cursor;
      cursor += 1;
    }

    // Everything that could still turn out to be the frame on screen at this
    // instant, which is one reordering window past it rather than none.
    let last = cursor - 1;
    while (last + 1 < samples.length && samples[last + 1].pts <= ticks + slackTicks) last += 1;
    if (last < key) last = key;

    const open = runs[runs.length - 1];
    if (open && key <= open.last + 1) {
      open.last = Math.max(open.last, last);
      open.times.push(time);
    } else {
      runs.push({ first: key, last, times: [time] });
    }
  }

  return runs;
}

/**
 * How many samples the plan above will decode, out of how many there are.
 *
 * Shown on the page before the button is pressed, because "reads 1,204 of the
 * 108,000 frames in this file" is the one number that explains why a tool that
 * has just been handed an hour-long video finishes in half a minute.
 */
export function decodeCost(runs, total) {
  let read = 0;
  for (const run of runs) read += run.last - run.first + 1;
  return { read, total, fraction: total > 0 ? read / total : 0 };
}
