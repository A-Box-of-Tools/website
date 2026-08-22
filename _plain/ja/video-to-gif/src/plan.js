/**
 * The arithmetic behind the three settings: which section, what size, how many
 * frames a second.
 *
 * All of it is pure - seconds and pixels in, seconds and pixels out - so it is
 * the part of this tool that can be checked without a browser, and it is where
 * the mistakes that would be hard to see live. A frame rate that quietly
 * becomes something else, or an animation that ends up a tenth longer than the
 * section it was cut from, are both errors nobody would spot by looking.
 */

/** GIF stores the time a frame stays on screen in hundredths of a second. */
export const CENTIS = 100;

/**
 * The shortest delay worth writing.
 *
 * The format allows zero, and no browser honours it: a delay under two
 * hundredths is treated as ten by every renderer that matters, a rule inherited
 * from Netscape in the 1990s and since written into the HTML specification's
 * image handling. So a GIF asking for 100 fps plays at 10, which is the one
 * failure here that would look like the tool ignoring the setting. Two is the
 * fastest a GIF actually plays, which is 50 frames a second.
 */
export const MIN_DELAY = 2;

/** Frame rates offered on the page, and the ceiling the format really has. */
export const MAX_FPS = CENTIS / MIN_DELAY;

/**
 * The output frame, scaled to a width and keeping the source's shape.
 *
 * GIF has no even-number rule - it stores whole pixels, not macroblocks - so
 * unlike the video tools here nothing is rounded to a multiple of two.
 */
export function outputSize(sourceWidth, sourceHeight, targetWidth) {
  const width = Math.max(1, Math.round(targetWidth));
  if (!sourceWidth || !sourceHeight) return { width, height: width };
  const height = Math.max(1, Math.round(width * (sourceHeight / sourceWidth)));
  return { width, height };
}

/**
 * When each frame is taken from, in seconds.
 *
 * The count is rounded down rather than up so that no frame is sampled from
 * beyond the end of the section: asking for 10 fps of a section 0.95 seconds
 * long gives nine frames, not ten, and the ninth is not a repeat of a frame the
 * viewer has already seen.
 */
export function frameTimes({ start, end, fps }) {
  const span = Math.max(0, end - start);
  const rate = Math.max(0.1, Math.min(MAX_FPS, fps));
  // The epsilon is for the section that is exactly two seconds long at 10 fps
  // and arrives as 1.9999999999999998 because the two ends came from a slider.
  const count = Math.max(1, Math.floor(span * rate + 1e-6));

  const times = new Array(count);
  for (let i = 0; i < count; i += 1) times[i] = start + i / rate;
  return times;
}

/**
 * How long each frame stays on screen, in hundredths of a second.
 *
 * Worked out from the running total rather than one frame at a time, which is
 * what keeps the animation the length of the section it was cut from. At 15 fps
 * a frame lasts 6.67 hundredths; rounding each one to 7 on its own would run a
 * ten-second clip five per cent slow, and the drift is a whole second by the
 * end of a minute. Rounding the *ends* instead means the delays alternate 7, 7,
 * 6 - which is what 15 fps actually is on a clock that only counts hundredths -
 * and the total is right.
 *
 * @param {number[]} times  when each frame is taken from
 * @param {number} end  when the last frame stops being shown
 * @returns {number[]} one delay per frame
 */
export function frameDelays(times, end) {
  if (!times.length) return [];

  const base = times[0];
  const edges = times.map((time) => Math.round((time - base) * CENTIS));
  edges.push(Math.round((Math.max(end, times[times.length - 1]) - base) * CENTIS));

  const delays = [];
  for (let i = 0; i < times.length; i += 1) {
    delays.push(Math.max(MIN_DELAY, edges[i + 1] - edges[i]));
  }
  return delays;
}

/**
 * What the frames will cost in memory while the work is going on.
 *
 * Every frame is read before the palette can be chosen - the palette has to
 * account for colours that only appear at the end - so they are all held at
 * once, as four bytes a pixel. This is what the page shows before you press the
 * button, because a browser tab that runs out of memory does not explain
 * itself: it disappears.
 */
export function workingBytes({ frames, width, height }) {
  return frames * width * height * 4;
}

/**
 * A guess at the size of the finished file, for the summary line.
 *
 * There is no honest way to predict LZW - a still shot of a wall and a shot of
 * confetti at the same size and length differ by twenty times - so this is
 * deliberately a range rather than a number, and the page says "rough" out
 * loud. The two figures are bits per pixel: about 0.4 where little moves, and
 * 2.5 where everything does.
 */
export function estimateBytes({ frames, width, height }) {
  const pixels = frames * width * height;
  return { low: Math.round(pixels * 0.4 / 8), high: Math.round(pixels * 2.5 / 8) };
}
