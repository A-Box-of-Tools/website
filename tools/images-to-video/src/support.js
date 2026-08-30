/** Feature detection for the two encoding paths. */

import { askSupported } from './shared/codec-support.js';

/**
 * Candidate H.264 codec strings, best profile/level first. Levels matter:
 * 4.0 tops out around 1080p30, so larger canvases need 5.1+ to be accepted.
 * We let the browser tell us what it can actually do rather than guessing
 * from the resolution.
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
  return typeof window.VideoEncoder === 'function' && typeof window.VideoFrame === 'function';
}

export function hasMediaRecorder() {
  return typeof window.MediaRecorder === 'function'
    && typeof HTMLCanvasElement.prototype.captureStream === 'function';
}

/**
 * Find a codec the browser will encode at these dimensions.
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

/** Preferred WebM mime type for the MediaRecorder fallback, or null. */
export function pickWebmMimeType() {
  if (!hasMediaRecorder()) return null;
  const candidates = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t)) ?? null;
}
