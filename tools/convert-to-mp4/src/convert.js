/**
 * One file in, one MP4 out: each track copied if it can be and encoded again
 * if it cannot, then written together with their clocks lined up.
 *
 * The picture goes across untouched when it is already H.264 - a slice of
 * the file for every frame, never read until the browser writes the result
 * out - and through shared/js/reencode-video.js when it is not. The sound
 * goes across untouched when it is AAC and through ./sound.js when it is
 * not, or is left out when the visitor asked for that or the browser cannot
 * decode it.
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
 * an empty edit for the gap, for the same reason.
 */

import { Mp4Writer, MOVIE_TIMESCALE, avcSampleEntry } from './shared/mp4-writer.js';
import { reencodeVideo, VIDEO_TIMESCALE } from './shared/reencode-video.js';
import { reencodeSound } from './sound.js';
import { closeGaps, compositionShift, rescale } from './plan.js';

/** An AAC frame is 1024 samples, always. */
const AAC_FRAME = 1024;

/**
 * @param {object} args
 * @param {File} args.file
 * @param {{video: object, audio: object|null, duration: number}} args.media
 * @param {object|null} args.sound  describeSound() of the audio track
 * @param {{picture: 'copy'|'encode', sound: 'none'|'copy'|'encode'}} args.jobs
 * @param {{width: number, height: number}} args.frame  for an encode
 * @param {number} args.bitrate  for an encode
 * @param {number} args.fps
 * @param {(progress: object) => void} [args.onProgress]
 * @param {AbortSignal} [args.signal]
 * @returns {Promise<{blob: Blob, frames: number, codec: string|null}>}
 */
export async function convert({
  file, media, sound, jobs, frame, bitrate, fps, onProgress, signal,
}) {
  const { video, audio } = media;

  // The sound first: it is the short job, and a refusal from the audio
  // encoder is better met before minutes of picture have been encoded.
  let soundTrack = null;
  if (jobs.sound === 'encode') {
    soundTrack = await reencodeSound({ file, audio, sound, onProgress, signal });
  } else if (jobs.sound === 'copy') {
    soundTrack = copySound(file, audio, sound);
  }

  let pictureTrack;
  let frames = video.samples.length;
  let codec = null;
  if (jobs.picture === 'encode') {
    const picture = await reencodeVideo({ file, video, frame, bitrate, fps, onProgress, signal });
    pictureTrack = {
      timescale: VIDEO_TIMESCALE,
      sampleEntry: picture.sampleEntry,
      matrix: null,
      width: frame.width << 16,
      height: frame.height << 16,
      samples: picture.samples,
      start: picture.samples[0].dts / VIDEO_TIMESCALE,
    };
    frames = picture.frames;
    codec = picture.codec;
  } else {
    pictureTrack = copyPicture(file, video, fps);
  }

  onProgress?.({ phase: 'writing', done: 1, total: 1 });

  /* --------------------------------------------------------------- writing */

  const writer = new Mp4Writer();
  const base = Math.min(pictureTrack.start, soundTrack ? soundTrack.start : Infinity);

  const videoTrack = writer.addTrack({
    kind: 'vide',
    timescale: pictureTrack.timescale,
    sampleEntry: pictureTrack.sampleEntry,
    matrix: pictureTrack.matrix,
    width: pictureTrack.width,
    height: pictureTrack.height,
  });
  for (const sample of pictureTrack.samples) videoTrack.addSample(sample);
  place(videoTrack, pictureTrack.start - base, compositionShift(pictureTrack.samples));

  if (soundTrack) {
    const audioTrack = writer.addTrack({
      kind: 'soun',
      timescale: soundTrack.timescale,
      sampleEntry: soundTrack.sampleEntry,
    });
    for (const sample of soundTrack.samples) audioTrack.addSample(sample);
    place(audioTrack, soundTrack.start - base, 0);
  }

  return { blob: writer.finalize(), frames, codec };
}

/**
 * Where a track sits on the movie's clock: after an empty gap if it starts
 * later than the other track, and from the composition shift in if its
 * first frame decoded is not its first frame shown. Neither is said when
 * neither is needed, which is nearly always for the sound.
 */
function place(track, delaySeconds, shiftTicks) {
  const delayMs = Math.round(delaySeconds * MOVIE_TIMESCALE);
  if (delayMs < 1 && shiftTicks <= 0) return;
  const playedMs = Math.round((track.durationTs - shiftTicks) / track.timescale * MOVIE_TIMESCALE);
  if (delayMs >= 1) track.addEdit(-1, delayMs);
  track.addEdit(shiftTicks, playedMs);
}

/**
 * The H.264 frames as they are. An MP4 source hands over its sample entry
 * and display matrix whole, so what came in rotated goes out rotated; a
 * Matroska source has neither, so the entry is built round the avcC it
 * carried and the frames are timed on the conventional 90 kHz clock.
 */
function copyPicture(file, video, fps) {
  const slices = (timescale, convert) => video.samples.map((s) => ({
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
    const samples = closeGaps(slices(video.timescale, (t) => t), Math.max(1, video.duration - last.dts));
    return {
      timescale: video.timescale,
      sampleEntry: video.sampleEntry,
      matrix: video.matrix,
      width: video.trackWidth,
      height: video.trackHeight,
      samples,
      start: firstShown(samples, video.timescale),
    };
  }

  const tail = video.defaultDuration
    ? Math.round(video.defaultDuration / 1e9 * VIDEO_TIMESCALE)
    : Math.round(VIDEO_TIMESCALE / Math.max(1, fps));
  const samples = closeGaps(slices(VIDEO_TIMESCALE, (t) => rescale(t, video.timescale, VIDEO_TIMESCALE)), tail);
  return {
    timescale: VIDEO_TIMESCALE,
    sampleEntry: avcSampleEntry(video.codedWidth, video.codedHeight, video.description),
    matrix: null,
    width: video.displayWidth << 16,
    height: video.displayHeight << 16,
    samples,
    start: firstShown(samples, VIDEO_TIMESCALE),
  };
}

/** The AAC packets as they are, under the entry the source had or one built for them. */
function copySound(file, audio, sound) {
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
