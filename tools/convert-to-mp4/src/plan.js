/**
 * What has to happen to a file for it to come out as the MP4 that uploads:
 * the decisions, without the codecs.
 *
 * Everything the page says before the button is pressed is decided here and
 * pinned in tests: which of the two tracks can be copied as it is and which
 * has to be encoded again, what bitrate an encode is asked for, and how the
 * frames of a copied track are placed on the new file's clock. Nothing here
 * touches a codec or a file, so it runs in Node and the page can say what it
 * will do before doing any of it.
 */

export { describeSound, soundJob } from './shared/reencode-sound.js';
export { closeGaps, compositionShift, rescale } from './shared/copy-tracks.js';

/* --------------------------------------------------------------- the jobs */

/**
 * H.264 in any of its MP4 spellings. It is the one picture codec copied
 * across: the file that "actually uploads" is H.264 in an MP4, and copying
 * HEVC or VP9 into an MP4 would make a file that opens in fewer places than
 * the one the visitor started with.
 */
export function isH264(codec) {
  return /^avc[13]\./.test(codec ?? '');
}

/** 'copy' when the frames can go across untouched, 'encode' otherwise. */
export function pictureJob(video) {
  return isH264(video.codec) ? 'copy' : 'encode';
}

/* ------------------------------------------------------------ the picture */

/** Bits per pixel per frame, below which H.264 stops looking like footage. */
const BPP_FLOOR = 0.06;

/** And above which more bits buy nothing a viewer would see. */
const BPP_CEILING = 0.25;

/** What a hardware encoder is happy to be asked for, and a file still sends. */
export const MAX_BITRATE = 40_000_000;

/** The longest edge H.264 encoders can be relied on to take. */
const MAX_EDGE = 3840;

/**
 * The bitrate a re-encode is asked for.
 *
 * It starts from what the source spent, because that is the one number
 * that says how busy the picture is, and scales it by how much tighter the
 * source codec packs than H.264 does: HEVC, VP9 and AV1 need about half
 * again to look the same in H.264, and VP8 about the same. Then it is held
 * between a floor and a ceiling per pixel, so a source that was starved does
 * not stay starved and one that was lavish is not copied byte for byte into
 * a file the size of the original.
 *
 * @param {{width: number, height: number, fps: number, codec: string,
 *   sourceBitrate: number}} source
 */
export function pictureBitrate({ width, height, fps, codec, sourceBitrate }) {
  const pixelsPerSecond = width * height * Math.max(1, fps);
  const factor = /^(vp8|avc)/.test(codec ?? '') ? 1.0 : 1.6;
  const asked = (sourceBitrate || 0) * factor;
  const floor = pixelsPerSecond * BPP_FLOOR;
  const ceiling = pixelsPerSecond * BPP_CEILING;
  const chosen = Math.min(MAX_BITRATE, Math.max(floor, Math.min(ceiling, asked)));
  return Math.max(1000, Math.round(chosen / 1000) * 1000);
}

/**
 * The frame a re-encode is drawn into: the picture as it is shown, and no
 * larger than an encoder will take. Even dimensions, because H.264 wants
 * them.
 */
export function outputFrame({ displayWidth, displayHeight }) {
  let width = displayWidth;
  let height = displayHeight;
  const long = Math.max(width, height);
  if (long > MAX_EDGE) {
    const scale = MAX_EDGE / long;
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }
  return { width: Math.max(2, width - (width % 2)), height: Math.max(2, height - (height % 2)) };
}

/**
 * The container a file arrived in, by its name and by what the reader said
 * it was, for the sentence that says what it was converted from.
 */
export function containerOf(name, matroska) {
  const ext = (name.match(/\.([a-z0-9]+)$/i)?.[1] ?? '').toLowerCase();
  if (matroska) return ext === 'webm' ? 'webm' : 'mkv';
  if (ext === 'mov' || ext === 'qt') return 'mov';
  if (ext === 'm4v') return 'm4v';
  return 'mp4';
}
