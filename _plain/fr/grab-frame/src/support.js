/**
 * Feature detection for the two paths, and for the three still formats.
 *
 * The exact path needs WebCodecs, because it decodes the frame it was asked for
 * rather than the one a player happened to stop on. The playback path needs
 * only a <video> element and a canvas, which every browser has had for years,
 * which is why it can take any file the browser knows how to play - including
 * containers this repository has no reader for.
 *
 * Nothing here encodes video. This tool writes pictures, and the encoders for
 * those are the browser's own.
 */

export function hasWebCodecs() {
  return typeof window.VideoDecoder === 'function'
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
 * Which of PNG, JPEG and WebP this browser will actually write.
 *
 * `canvas.toBlob` does not refuse a type it has no encoder for: it quietly
 * hands back a PNG with the wrong extension on it, which is the sort of thing
 * nobody notices until a file will not open. So each one is tried on a 1x1
 * canvas first and the answer read off the blob's own type.
 *
 * PNG is not asked about. Every browser that has a canvas writes one, and it is
 * what this tool falls back to if the question ever came back no.
 *
 * @returns {Promise<Set<string>>} the mime types that came back as themselves
 */
export async function encodableTypes(candidates = ['image/webp', 'image/jpeg']) {
  const ok = new Set(['image/png']);
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;

  for (const type of candidates) {
    const blob = await new Promise((resolve) => {
      try {
        canvas.toBlob(resolve, type, 0.9);
      } catch {
        resolve(null);
      }
    });
    if (blob && blob.type === type) ok.add(type);
  }

  return ok;
}
