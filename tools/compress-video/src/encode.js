/**
 * The whole clip, decoded, drawn smaller, and encoded again at the bitrate
 * the plan chose; the sound copied through untouched.
 *
 * The decode-draw-encode loop itself is shared/js/reencode-video.js, which
 * the converter runs too. What is this tool's own is the two things put
 * beside its result: the frame size the plan chose, which the loop draws
 * into, and the sound, which is never decoded. Its samples are sliced out
 * of the file and written into the new one with the same clock, which is
 * what keeps this the length it was.
 */

import { Mp4Writer } from './shared/mp4-writer.js';
import { reencodeVideo, closeDurations, VIDEO_TIMESCALE } from './shared/reencode-video.js';

/**
 * @param {object} args
 * @param {File} args.file
 * @param {{video: object, audio: object|null}} args.media  from demux()
 * @param {{width: number, height: number}} args.frame  the output size
 * @param {number} args.bitrate  bits per second, for the picture
 * @param {number} args.fps
 * @param {boolean} args.keepAudio
 * @param {(progress: {phase: string, done: number, total: number}) => void} [args.onProgress]
 * @param {AbortSignal} [args.signal]
 * @returns {Promise<{blob: Blob, frames: number, codec: string}>}
 */
export async function compress({
  file, media, frame, bitrate, fps, keepAudio, onProgress, signal,
}) {
  const { video, audio } = media;

  const picture = await reencodeVideo({ file, video, frame, bitrate, fps, onProgress, signal });

  const writer = new Mp4Writer();
  const videoTrack = writer.addTrack({
    kind: 'vide',
    timescale: VIDEO_TIMESCALE,
    sampleEntry: picture.sampleEntry,
    // The frames were drawn the right way up on their way through the
    // canvas, so there is nothing left for a matrix to turn.
    matrix: null,
    width: frame.width << 16,
    height: frame.height << 16,
  });
  for (const sample of picture.samples) videoTrack.addSample(sample);

  if (keepAudio && audio?.samples.length) {
    const audioTrack = writer.addTrack({
      kind: 'soun',
      timescale: audio.timescale,
      sampleEntry: audio.sampleEntry,
    });
    const last = audio.samples[audio.samples.length - 1];
    const tailAudio = Math.max(1, audio.duration - last.dts);
    for (const sample of closeDurations(audio.samples.map((s) => ({
      data: file.slice(s.offset, s.offset + s.size),
      isKey: true,
      dts: s.dts,
      pts: s.pts,
      tailDuration: tailAudio,
    })))) {
      audioTrack.addSample(sample);
    }
  }

  return { blob: writer.finalize(), frames: picture.frames, codec: picture.codec };
}
