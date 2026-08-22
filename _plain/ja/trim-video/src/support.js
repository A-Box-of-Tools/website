/**
 * Feature detection for the two crop paths.
 *
 * The exact path needs WebCodecs, because it decodes and re-encodes the frames
 * itself. The recording path needs only the things every browser has had for
 * years - a <video> element and MediaRecorder - which is why it can accept any
 * file the browser knows how to play, including containers this repository has
 * no demuxer for.
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
  if (!hasWebCodecs()) return null;

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
