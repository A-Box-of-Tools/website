/**
 * Feature detection for the two crop paths.
 *
 * The exact path needs WebCodecs, because it decodes and re-encodes the frames
 * itself. The recording path needs only the things every browser has had for
 * years - a <video> element and MediaRecorder - which is why it can accept any
 * file the browser knows how to play, including containers this repository has
 * no demuxer for.
 */

import { askSupported } from './shared/codec-support.js';

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
  if (!hasWebCodecs()) return null;

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
