/**
 * What turning a GIF into a video comes to, without the codecs: when each
 * frame is shown and for how long, what size the picture has to be, and
 * what the encoder is asked for. Pure, so it runs in Node and is pinned by
 * tests, and so the page can say what it will do before doing it.
 */

import { playedDelay } from './shared/gif-decode.js';

/** Seconds between keyframes in the output, so seeking stays usable. */
export const KEYFRAME_SECONDS = 2;

/** Bits per pixel per frame the picture is given: generous, because flat art shows every block. */
const BPP = 0.15;

/** Under this the encoder has nothing to work with; over this it is spending for nothing. */
export const MIN_BITRATE = 400_000;
export const MAX_BITRATE = 20_000_000;

/** The longest edge H.264 encoders can be relied on to take. */
const MAX_EDGE = 3840;

/**
 * When each frame starts and how long it stays, in seconds, as a browser
 * plays the file: a delay under two hundredths is played as ten, which is
 * the rule every browser has followed for twenty years and the one a video
 * of the same animation has to follow too.
 *
 * @param {{delay: number}[]} frames
 * @returns {{times: {start: number, duration: number}[], total: number}}
 */
export function frameTimes(frames) {
  const times = [];
  let at = 0;
  for (const frame of frames) {
    const duration = playedDelay(frame.delay);
    times.push({ start: at, duration });
    at += duration;
  }
  return { times, total: at };
}

/**
 * The frame rate the encoder is told, which is a hint and not a promise: a
 * GIF has no frame rate, only a delay on each frame, and the file written
 * here keeps every one of those. One over the commonest delay, held to what
 * an encoder accepts.
 */
export function nominalFps(frames) {
  if (!frames.length) return 10;
  const counts = new Map();
  for (const frame of frames) {
    const delay = playedDelay(frame.delay);
    counts.set(delay, (counts.get(delay) ?? 0) + 1);
  }
  let commonest = 0.1;
  let best = -1;
  for (const [delay, count] of counts) {
    if (count > best) { best = count; commonest = delay; }
  }
  return Math.min(60, Math.max(1, Math.round(1 / commonest)));
}

/**
 * The size the video is written at: the GIF's own, made even because H.264
 * needs both dimensions even, and no wider than an encoder takes. A GIF
 * with an odd edge gets one column or row of the background colour, not a
 * resample.
 */
export function outputSize({ width, height }) {
  let w = width;
  let h = height;
  const long = Math.max(w, h);
  let scale = 1;
  if (long > MAX_EDGE) scale = MAX_EDGE / long;
  w = Math.round(w * scale);
  h = Math.round(h * scale);
  return {
    width: Math.max(2, w + (w % 2)),
    height: Math.max(2, h + (h % 2)),
    scale,
  };
}

/** What the encoder is asked for, from the size and the nominal rate. */
export function bitrateFor({ width, height, fps }) {
  const asked = width * height * Math.max(1, fps) * BPP;
  const chosen = Math.min(MAX_BITRATE, Math.max(MIN_BITRATE, asked));
  return Math.round(chosen / 1000) * 1000;
}

/** Whether any frame lets what is under it show through. */
export function hasTransparency(frames) {
  return frames.some((frame) => frame.transparentIndex >= 0);
}

/** "#rrggbb" as the three numbers the compositor wants. */
export function parseHex(text) {
  const match = /^#?([0-9a-f]{6})$/i.exec(String(text ?? '').trim());
  if (!match) return { r: 255, g: 255, b: 255 };
  const n = parseInt(match[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
