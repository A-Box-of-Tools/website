/**
 * Feature detection for the two paths a reversal can take.
 *
 * Both of them encode, so both need `VideoEncoder`; that is the one thing this
 * tool cannot do without, and the page says so rather than failing halfway
 * through. What separates them is the reading: the exact path decodes the file
 * itself and needs `VideoDecoder` as well, while the playback path leaves the
 * decoding to the <video> element and so accepts anything the browser plays.
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

/** Everything the exact path needs: it reads the frames as well as writing them. */
export function hasWebCodecs() {
  return typeof window.VideoDecoder === 'function'
    && typeof window.VideoEncoder === 'function'
    && typeof window.VideoFrame === 'function';
}

/** What the playback path needs, which is only the writing half. */
export function hasEncoder() {
  return typeof window.VideoEncoder === 'function'
    && typeof window.VideoFrame === 'function';
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
