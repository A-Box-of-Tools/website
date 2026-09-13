/**
 * The few things this tool has to turn into words.
 *
 * Every function here hands back a phrase key and the blanks to fill in, never
 * a sentence: this file is copied byte for byte into every language, so a
 * string written here would be English at every address but one. main.js
 * resolves them through phrase(). See "The strings in the JavaScript" in the
 * repository README.
 */

/** A bitrate as the unit people read: kbit/s under a megabit, Mbit/s above. */
export function bitrateText(bitsPerSecond) {
  if (bitsPerSecond >= 1_000_000) {
    return { key: 'rate.mbit', values: { n: (bitsPerSecond / 1_000_000).toFixed(1) } };
  }
  return { key: 'rate.kbit', values: { n: Math.round(bitsPerSecond / 1000) } };
}

/** A frame size, plainly: GIFs are not made in the sizes that have names. */
export function frameText({ width, height }) {
  return { key: 'frame.plain', values: { width, height } };
}

/** How the frames are timed: one rate, or a rate that varies. */
export function timingText(frames, fps) {
  const delays = new Set(frames.map((frame) => (frame.delay < 2 ? 10 : frame.delay)));
  return delays.size > 1
    ? { key: 'timing.varies', values: { fps } }
    : { key: 'timing.steady', values: { fps } };
}

/** What to call the finished file. Always .mp4, because that is what it is. */
export function outName(name) {
  const stem = name.replace(/\.[^.]+$/, '') || 'animation';
  return `${stem}.mp4`;
}
