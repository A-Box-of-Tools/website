/**
 * The turn itself, in either of its two forms.
 *
 * The one this page exists for copies every frame and every packet across
 * as slices of the file and writes a new header whose display matrix says
 * "shown turned this far". Not one frame is decoded; the file is read once
 * for its layout and once more as the browser writes the result out, and
 * the picture is exactly what it was.
 *
 * The other, "bake it in", is for the player that ignores the matrix - a
 * few old desktop ones do - and for a WebM or MKV whose picture is not
 * H.264, since an MP4 entry can be built for nothing else. It draws every
 * frame turned on to a canvas and encodes it again as H.264, through the
 * loop the compressor and the converter share, and costs a generation.
 *
 * The sound goes across untouched when it is AAC, is encoded again as AAC
 * when it is something a browser can decode, and is left out when it is
 * not - the same three answers the converter gives, from the same parts.
 */

import { Mp4Writer } from './shared/mp4-writer.js';
import { reencodeVideo, VIDEO_TIMESCALE } from './shared/reencode-video.js';
import { reencodeSound } from './shared/reencode-sound.js';
import { compositionShift, copyPicture, copySound, place } from './shared/copy-tracks.js';
import { rotationMatrix, shownSize, turned } from './plan.js';

/**
 * @param {object} args
 * @param {File} args.file
 * @param {{video: object, audio: object|null, duration: number}} args.media
 * @param {object|null} args.sound  describeSound() of the audio track
 * @param {number} args.turn  90, 180 or 270, clockwise
 * @param {boolean} args.bake  draw the frames turned and encode again
 * @param {'none'|'copy'|'encode'} args.soundJob
 * @param {number} args.bitrate  for a bake
 * @param {{width: number, height: number}} args.frame  for a bake
 * @param {number} args.fps
 * @param {(progress: object) => void} [args.onProgress]
 * @param {AbortSignal} [args.signal]
 * @returns {Promise<{blob: Blob, rotation: number, frames: number}>}
 */
export async function rotate({
  file, media, sound, turn, bake, soundJob, bitrate, frame, fps, onProgress, signal,
}) {
  const { video, audio } = media;
  const rotation = turned(video.rotation, turn);

  let soundTrack = null;
  if (soundJob === 'encode') {
    soundTrack = await reencodeSound({ file, audio, sound, onProgress, signal });
  } else if (soundJob === 'copy') {
    soundTrack = copySound(file, audio, sound);
  }

  let pictureTrack;
  let frames = video.samples.length;
  if (bake) {
    // The loop draws each stored frame through drawScaled with the
    // rotation it is told, so a track described as "shown turned this far,
    // at this size" comes out of the canvas already the right way up and is
    // encoded with no matrix at all.
    const shown = shownSize(video, rotation);
    const turnedVideo = {
      ...video, rotation, displayWidth: shown.width, displayHeight: shown.height,
    };
    const picture = await reencodeVideo({
      file, video: turnedVideo, frame, bitrate, fps, onProgress, signal,
    });
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
  } else {
    // The header's width and height stay the stored frame's own size, the
    // way a phone writes them: the matrix does the turning, and a player
    // given the turned size here as well turns it twice and shows a
    // stretched picture. Chrome did exactly that when this was first
    // written the other way.
    pictureTrack = copyPicture(file, video, fps, {
      matrix: rotationMatrix(rotation, video.codedWidth, video.codedHeight),
      width: video.codedWidth << 16,
      height: video.codedHeight << 16,
    });
  }

  onProgress?.({ phase: 'writing', done: 1, total: 1 });

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

  return { blob: writer.finalize(), rotation: bake ? 0 : rotation, frames };
}
