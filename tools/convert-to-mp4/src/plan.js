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

import { audioDecoderConfig, mp4aSampleEntry } from './shared/aac.js';

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

/**
 * The sound of a file, described the same way whichever reader found it.
 *
 * An MP4 names its sound with a sample entry, which the AAC helper opens; a
 * Matroska file names it in words, and the reader has already turned those
 * into a codec string. Out of either comes one shape: what the decoder
 * would be told, whether the samples can be copied as they are (only AAC
 * can - it is the sound an MP4 is expected to carry), and the entry to write
 * them under if so.
 *
 * @returns {object|null} null when the file has no sound
 */
export function describeSound(audio) {
  if (!audio || !audio.samples.length) return null;

  if (audio.sampleEntry) {
    const config = audioDecoderConfig(audio);
    if (config) {
      return {
        codec: config.codec,
        description: config.description,
        sampleRate: config.sampleRate,
        channels: config.numberOfChannels,
        copyable: true,
        sampleEntry: audio.sampleEntry,
        name: audio.entryType,
      };
    }
    return {
      codec: null,
      description: null,
      sampleRate: audio.sampleRate,
      channels: audio.channels,
      copyable: false,
      sampleEntry: null,
      name: audio.entryType,
    };
  }

  return {
    codec: audio.codec,
    description: audio.description,
    sampleRate: audio.sampleRate,
    channels: audio.channels,
    copyable: Boolean(audio.aac),
    sampleEntry: audio.aac
      ? mp4aSampleEntry({ channels: audio.channels, sampleRate: Math.round(audio.sampleRate), asc: audio.description })
      : null,
    name: audio.codecId,
  };
}

/**
 * 'none' for a silent file, 'copy' for AAC, 'encode' for a sound the
 * browser can decode, 'unknown' for one it cannot name - which the page
 * turns into "leave the sound out", the one thing it can still do.
 */
export function soundJob(sound, { decodable = true } = {}) {
  if (!sound) return 'none';
  if (sound.copyable) return 'copy';
  if (sound.codec && decodable) return 'encode';
  return 'unknown';
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
 * that starts playing this far into the track, so the sound does not run a
 * frame or two ahead of the picture.
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
