/**
 * Feature detection for the tools that both read a video's frames and write
 * new ones: what this browser will decode, what it will encode, and what it
 * can record.
 *
 * GENERATED INTO EACH TOOL. This file lives at shared/js/video-support.js and
 * the build copies it to <tool>/src/shared/video-support.js for the tools that
 * ask for it with `js_parts = ["video-support", "codec-support", ...]`: the
 * cropper, the trimmer, the reverser and the time-lapse maker. They carried
 * two variants of it - the cropper and trimmer asked about MediaRecorder for
 * their recording fallback, the reverser and time-lapse maker about the
 * encoder alone for their playback path - and this file answers every
 * question either pair asked. The three tools whose support.js asks something
 * else again (grab-frame about still formats, images-to-video about encoding
 * only, video-to-gif about reading only) keep their own.
 *
 * Every one of these tools has an exact path, which decodes and re-encodes
 * the frames itself and so needs WebCodecs, and a fallback that leaves the
 * reading to a <video> element - recording what plays for the cropper and
 * trimmer, encoding what plays for the reverser and time-lapse maker - which
 * is why the fallback can accept any file the browser knows how to play,
 * including containers this repository has no demuxer for.
 */

import { askSupported } from './codec-support.js';

/**
 * Candidate H.264 codec strings, best profile/level first. Levels matter: 4.0
 * tops out around 1080p30, so larger frames need 5.1 or better to be accepted.
 * The browser is asked rather than guessed at, because what a machine will
 * encode depends on its hardware as much as on its browser.
 */
const H264_CANDIDATES = [
  'avc1.640034', // High, level 5.2
  'avc1.640033', // High, level 5.1
  'avc1.640032', // High, level 5.0
  'avc1.64002a', // High, level 4.2
  'avc1.640028', // High, level 4.0
  'avc1.4d0034', // Main, level 5.2
  'avc1.4d0028', // Main, level 4.0
  'avc1.42003e', // Baseline, level 6.2
  'avc1.42001f', // Baseline, level 3.1
];

export function hasWebCodecs() {
  return typeof window.VideoDecoder === 'function'
    && typeof window.VideoEncoder === 'function'
    && typeof window.VideoFrame === 'function';
}

/**
 * What the writing half alone needs. The reverser's and the time-lapse
 * maker's playback paths leave the decoding to a <video> element, so they can
 * run wherever there is an encoder, decoder or not.
 */
export function hasEncoder() {
  return typeof window.VideoEncoder === 'function'
    && typeof window.VideoFrame === 'function';
}

export function hasMediaRecorder() {
  return typeof window.MediaRecorder === 'function'
    && typeof HTMLCanvasElement.prototype.captureStream === 'function';
}

/** Whether this browser will decode the configuration a demuxed track reports. */
export async function canDecode(config) {
  if (!hasWebCodecs()) return false;
  // A browser that never answers is one that cannot decode, as far as anybody
  // waiting for this page is concerned.
  return await askSupported(VideoDecoder, config) === true;
}

/**
 * Find an H.264 configuration the browser will encode at these dimensions.
 * @returns {Promise<string|null>}
 */
export async function pickH264Codec({ width, height, framerate, bitrate }) {
  // Gated on the encoder alone: this is an encoder question, and the
  // reverser's playback path asks it on browsers that have no VideoDecoder.
  // The cropper and trimmer only reach it from their exact path, which has
  // already asked hasWebCodecs(), so nothing is looser for them.
  if (!hasEncoder()) return null;

  for (const codec of H264_CANDIDATES) {
    const supported = await askSupported(VideoEncoder, {
      codec, width, height, framerate, bitrate,
      avc: { format: 'avc' },
    });
    if (supported) return codec;
    // A browser that did not answer at all will not answer for the other
    // eight either, and asking anyway would turn one deadline into nine. See
    // shared/js/codec-support.js for the build this really happens on.
    if (supported === null) return null;
    // Otherwise a plain no - most often a codec string this browser cannot
    // parse - so try the next one.
  }
  return null;
}

/**
 * Preferred container for the recording path. WebM everywhere except Safari,
 * which records MP4 and does not offer WebM at all.
 */
export function pickRecorderMimeType() {
  if (!hasMediaRecorder()) return null;
  const candidates = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
    'video/mp4',
  ];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? null;
}
