/**
 * Feature detection for the two ways of reading a video.
 *
 * Neither path needs an encoder: a GIF is written by the code in this folder,
 * not by anything in the browser, so unlike the video tools here there is
 * nothing to ask about output formats. What is being asked is only how the
 * frames get read - by WebCodecs, or by the player.
 */

export function hasWebCodecs() {
  return typeof window.VideoDecoder === 'function' && typeof window.VideoFrame === 'function';
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
