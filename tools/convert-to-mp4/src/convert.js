/**
 * One file in, one MP4 out: each track copied if it can be and encoded again
 * if it cannot, then written together with their clocks lined up.
 *
 * The picture goes across untouched when it is already H.264 - a slice of
 * the file for every frame, never read until the browser writes the result
 * out, which is shared/js/copy-tracks.js - and through
 * shared/js/reencode-video.js when it is not. The sound goes across
 * untouched when it is AAC and through shared/js/reencode-sound.js when it
 * is not, or is left out when the visitor asked for that or the browser
 * cannot decode it. The clock arithmetic a copy has to get right - the
 * composition shift of a file with B-frames, a track that starts later than
 * the other - is in the shared part with the copy, and its header says why.
 */

import { Mp4Writer } from './shared/mp4-writer.js';
import { reencodeVideo, VIDEO_TIMESCALE } from './shared/reencode-video.js';
import { reencodeSound } from './shared/reencode-sound.js';
import { compositionShift, copyPicture, copySound, place } from './shared/copy-tracks.js';

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
