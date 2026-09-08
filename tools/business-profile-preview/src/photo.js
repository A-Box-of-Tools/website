/**
 * A picture off the disk, redrawn small enough to live inside the mock-up.
 *
 * WHY IT IS REDRAWN RATHER THAN EMBEDDED AS IT ARRIVED
 *
 * The finished SVG is one self-contained file that gets downloaded and sent to
 * whoever signs off on the listing, so the photo has to be IN it rather than
 * referenced from it. Three things fall out of drawing it onto a canvas first
 * and encoding that:
 *
 *   * the size is bounded. A cover photo occupies 428 by 168 in the panel, and
 *     base64 costs a third on top - a twelve-megapixel photograph carried
 *     through verbatim would be a 20 MB file of which the card uses a fiftieth.
 *   * the metadata is gone. Whatever the file recorded - the camera, the place
 *     it was taken, a comment - is not in a canvas, so it cannot be in the
 *     picture that gets sent on. Nobody has to think about that again.
 *   * the format is ours. What is embedded is a JPEG this page wrote, whatever
 *     was opened, which is what lets profile.js refuse any href that is not
 *     one of the two shapes this file produces.
 *
 * None of it involves the network, and the file is never read as text.
 */

export const LIMITS = {
  // The file on disk. Generous, because a cover photo straight off a phone
  // honestly is this big, and it is bounded again by `side` below before any of
  // it reaches the card.
  bytes: 20 * 1024 * 1024,
  // The longest side kept after redrawing. The widest a photo is ever drawn is
  // 428 across in the panel, so 1200 survives the 3x export with room to spare
  // and stops a phone camera's twelve megapixels going into a text file.
  side: 1200,
  // Below this there is no picture to speak of, and the aspect ratio the card
  // would take from it is noise.
  smallest: 8,
};

/** The size to redraw at: the picture's own, unless it is larger than `longest`. */
export function fit(width, height, longest = LIMITS.side) {
  const scale = Math.min(1, longest / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

/**
 * One file, as a `data:image/jpeg;base64,` URI bounded in size.
 *
 * JPEG rather than PNG because the thing being embedded is a photograph and
 * the embedding is base64, which costs a third on top of whatever it is given:
 * the same cover photo is about 300 KB of JPEG and four megabytes of PNG, and
 * that four megabytes would be re-encoded into a string on every keystroke.
 *
 * Throws with a phrase key rather than a sentence - see the note at the top of
 * shared/js/phrases.js. The caller looks it up and puts it on the page.
 *
 * @param {File|Blob} file
 * @param {number} [longest]  the longest side to keep
 * @returns {Promise<{uri: string, width: number, height: number}>}  the size is
 *   the one it was redrawn at, which is what the page reports back
 */
export async function readPhoto(file, longest = LIMITS.side) {
  if (file.size > LIMITS.bytes) throw new Error('photo.toobig');

  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error('photo.unreadable');
  }

  try {
    if (bitmap.width < LIMITS.smallest || bitmap.height < LIMITS.smallest) {
      throw new Error('photo.tiny');
    }
    const size = fit(bitmap.width, bitmap.height, longest);
    const canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext('2d');
    context.imageSmoothingQuality = 'high';
    context.drawImage(bitmap, 0, 0, size.width, size.height);
    return { uri: canvas.toDataURL('image/jpeg', 0.82), ...size };
  } finally {
    bitmap.close();
  }
}
