/**
 * A track carried across into a new MP4 exactly as it was: the frames or
 * packets as slices of the source file, and the clock arithmetic that keeps
 * them where they were.
 *
 * GENERATED INTO EACH TOOL. This file lives at shared/js/copy-tracks.js and
 * the build copies it to <tool>/src/shared/copy-tracks.js for the tools that
 * ask for it with `js_parts = ["copy-tracks", "mp4-reader", "mp4-writer",
 * "mp4-boxes", "aac", ...]`: the MP4 converter, whose whole point is copying
 * what it can, and the rotator, which copies everything and changes nine
 * numbers in the header. Both readers' output is accepted - the MP4 one's,
 * which hands over a sample entry and a matrix to write back whole, and the
 * Matroska one's, which has neither and gets an entry built.
 *
 * WHAT A COPY HAS TO GET RIGHT
 *
 * A Matroska file has no decode clock, only the time each frame is shown,
 * and stores frames in the order they are decoded. The reader worked out
 * decode times from that, and the first of them can sit before the first
 * presentation time by a frame or two - which is true of every H.264 file
 * with B-frames and is what MP4 expresses as composition offsets and an
 * edit that starts playing that far in. Without the edit the picture would
 * play a frame or two late against its sound, which nobody would trace to
 * this. A track that starts later than the other on the file's clock gets
 * an empty edit for the gap, for the same reason. `place` writes both.
 */

import { MOVIE_TIMESCALE, avcSampleEntry } from './mp4-writer.js';

/** The conventional clock a video track built here is written on. */
export const VIDEO_TIMESCALE = 90000;

/** An AAC frame is 1024 samples, always. */
const AAC_FRAME = 1024;

/* ------------------------------------------------------------- the clocks */

/** A time in one track's ticks as a time in another's. */
export function rescale(ticks, from, to) {
  return from === to ? ticks : Math.round(ticks * to / from);
}

/**
 * How far the first frame shown sits after the first frame decoded.
 *
 * Zero for a file without B-frames. Otherwise the decode clock starts before
 * the presentation clock by this much, and the MP4 says so with an edit
 * that starts playing this far into the track.
 *
 * @param {{dts: number, pts: number}[]} samples
 */
export function compositionShift(samples) {
  if (!samples.length) return 0;
  let minPts = Infinity;
  let minDts = Infinity;
  for (const sample of samples) {
    if (sample.pts < minPts) minPts = sample.pts;
    if (sample.dts < minDts) minDts = sample.dts;
  }
  return Math.max(0, minPts - minDts);
}

/** Each sample lasts until the next one starts; the last as long as told. */
export function closeGaps(samples, tail) {
  for (let i = 0; i < samples.length; i += 1) {
    const next = samples[i + 1];
    samples[i].duration = next
      ? Math.max(1, next.dts - samples[i].dts)
      : Math.max(1, tail);
  }
  return samples;
}

/**
 * Where a track sits on the movie's clock: after an empty gap if it starts
 * later than the other track, and from the composition shift in if its
 * first frame decoded is not its first frame shown. Neither is said when
 * neither is needed, which is nearly always for the sound.
 *
 * @param {object} track  an Mp4Writer track with its samples added
 * @param {number} delaySeconds  how long after the movie starts this track does
 * @param {number} shiftTicks  compositionShift() of its samples
 */
export function place(track, delaySeconds, shiftTicks) {
  const delayMs = Math.round(delaySeconds * MOVIE_TIMESCALE);
  if (delayMs < 1 && shiftTicks <= 0) return;
  const playedMs = Math.round((track.durationTs - shiftTicks) / track.timescale * MOVIE_TIMESCALE);
  if (delayMs >= 1) track.addEdit(-1, delayMs);
  track.addEdit(shiftTicks, playedMs);
}

/* ------------------------------------------------------------- the tracks */

/**
 * The frames as they are. An MP4 source hands over its sample entry and
 * display matrix whole, so what came in rotated goes out rotated; a Matroska
 * source has neither, so the entry is built round the avcC it carried - it
 * has to be H.264 for that - and the frames are timed on the conventional
 * 90 kHz clock.
 *
 * @param {File} file
 * @param {object} video  the track, from either reader
 * @param {number} fps  for the last frame's length when nothing else says
 * @param {object} [override]  a `matrix` (36 bytes), `width` and `height`
 *   (16.16 fixed point) to write instead of the source's, for a tool that
 *   changes how the frames are shown without changing the frames
 * @returns {{timescale: number, sampleEntry: Uint8Array, matrix: Uint8Array|null,
 *   width: number, height: number, samples: object[], start: number}} a
 *   track spec for the writer, its samples with durations, and where the
 *   picture begins on the file's clock in seconds
 */
export function copyPicture(file, video, fps, override = {}) {
  const slices = (convert) => video.samples.map((s) => ({
    data: file.slice(s.offset, s.offset + s.size),
    isKey: s.isKey,
    dts: convert(s.dts),
    pts: convert(s.pts),
  }));

  // Where the picture begins on the file's clock: its earliest frame shown,
  // which with B-frames is not the first frame stored.
  const firstShown = (samples, timescale) => {
    let first = Infinity;
    for (const sample of samples) first = Math.min(first, sample.pts);
    return first / timescale;
  };

  if (video.sampleEntry) {
    const last = video.samples[video.samples.length - 1];
    const samples = closeGaps(slices((t) => t), Math.max(1, video.duration - last.dts));
    return {
      timescale: video.timescale,
      sampleEntry: video.sampleEntry,
      matrix: override.matrix ?? video.matrix,
      width: override.width ?? video.trackWidth,
      height: override.height ?? video.trackHeight,
      samples,
      start: firstShown(samples, video.timescale),
    };
  }

  if (!video.description || !/^avc[13]\./.test(video.codec ?? '')) {
    throw new Error('copy.notavc');
  }

  const tail = video.defaultDuration
    ? Math.round(video.defaultDuration / 1e9 * VIDEO_TIMESCALE)
    : Math.round(VIDEO_TIMESCALE / Math.max(1, fps));
  const samples = closeGaps(slices((t) => rescale(t, video.timescale, VIDEO_TIMESCALE)), tail);
  return {
    timescale: VIDEO_TIMESCALE,
    sampleEntry: avcSampleEntry(video.codedWidth, video.codedHeight, video.description),
    matrix: override.matrix ?? null,
    width: override.width ?? (video.displayWidth << 16),
    height: override.height ?? (video.displayHeight << 16),
    samples,
    start: firstShown(samples, VIDEO_TIMESCALE),
  };
}

/**
 * The AAC packets as they are, under the entry the source had or one built
 * for them.
 *
 * @param {File} file
 * @param {object} audio  the track, from either reader
 * @param {object} sound  describeSound() of it, which carries the entry
 */
export function copySound(file, audio, sound) {
  const fromMp4 = Boolean(audio.sampleEntry);
  const timescale = fromMp4 ? audio.timescale : Math.round(sound.sampleRate);
  const convert = (t) => rescale(t, audio.timescale, timescale);
  const last = audio.samples[audio.samples.length - 1];
  const tail = fromMp4 ? Math.max(1, audio.duration - last.dts) : AAC_FRAME;
  const samples = closeGaps(audio.samples.map((s) => ({
    data: file.slice(s.offset, s.offset + s.size),
    isKey: true,
    dts: convert(s.dts),
    pts: convert(s.pts),
  })), tail);
  return {
    timescale,
    sampleEntry: sound.sampleEntry,
    samples,
    start: samples[0].pts / timescale,
  };
}
