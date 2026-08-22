/**
 * Feature detection for the two paths a reversal can take.
 *
 * Both of them encode, so both need `VideoEncoder`; that is the one thing this
 * tool cannot do without, and the page says so rather than failing halfway
 * through. What separates them is the reading: the exact path decodes the file
 * itself and needs `VideoDecoder` as well, while the playback path leaves the
 * decoding to the <video> element and so accepts anything the browser plays.
 */

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
  try {
    const { supported } = await VideoDecoder.isConfigSupported(config);
    return Boolean(supported);
  } catch {
    // A codec string this browser cannot even parse. Not decodable either.
    return false;
  }
}

/**
 * Find an H.264 configuration the browser will encode at these dimensions.
 * @returns {Promise<string|null>}
 */
export async function pickH264Codec({ width, height, framerate, bitrate }) {
  if (!hasEncoder()) return null;

  for (const codec of H264_CANDIDATES) {
    try {
      const { supported } = await VideoEncoder.isConfigSupported({
        codec, width, height, framerate, bitrate,
        avc: { format: 'avc' },
      });
      if (supported) return codec;
    } catch {
      // Malformed-for-this-browser codec string; try the next one.
    }
  }
  return null;
}
