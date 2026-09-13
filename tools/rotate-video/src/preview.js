/**
 * One frame of the clip, so the page can show which way up it is now and
 * which way up it will be.
 *
 * The first keyframe is decoded and kept as a bitmap; the preview canvas is
 * then redrawn from it through the same drawScaled the encoder uses, with
 * the rotation the visitor has chosen. So what the preview shows is what
 * the file will say, drawn by the same arithmetic, rather than a CSS turn
 * that could disagree with it.
 *
 * WebCodecs hands over the stored frame, not the shown one, which is the
 * point: the source's own rotation is applied here too, so a phone clip
 * that is already portrait previews portrait before any turn is chosen.
 */

import { FileWindow } from './shared/mp4-reader.js';
import { decoderConfig, micros } from './shared/webcodecs.js';
import { drawScaled } from './shared/frame-canvas.js';

/** How many samples past the first keyframe to feed before giving up on an output. */
const PATIENCE = 60;

/**
 * @param {File} file
 * @param {object} video  the track, from either reader
 * @returns {Promise<ImageBitmap|null>} the first frame as stored, or null
 *   when this browser will not decode it
 */
export async function firstFrame(file, video) {
  if (typeof VideoDecoder !== 'function') return null;

  let bitmap = null;
  let failure = null;
  const decoder = new VideoDecoder({
    output: (frame) => {
      try {
        if (!bitmap) bitmap = frame.clone();
      } catch (error) {
        failure ??= error;
      } finally {
        frame.close();
      }
    },
    error: (error) => { failure ??= error; },
  });

  try {
    decoder.configure(decoderConfig(video));
    const window = new FileWindow(file);
    const first = video.samples.findIndex((s) => s.isKey);
    if (first < 0) return null;
    const last = Math.min(video.samples.length, first + PATIENCE);
    for (let i = first; i < last && !bitmap && !failure; i += 1) {
      const sample = video.samples[i];
      const data = await window.read(sample.offset, sample.size);
      decoder.decode(new EncodedVideoChunk({
        type: sample.isKey ? 'key' : 'delta',
        timestamp: micros(sample.pts, video.timescale),
        data,
      }));
    }
    await decoder.flush().catch(() => {});
  } catch {
    return null;
  } finally {
    if (decoder.state !== 'closed') decoder.close();
  }

  if (!bitmap) return null;
  try {
    const picture = await createImageBitmap(bitmap);
    return picture;
  } catch {
    return null;
  } finally {
    bitmap.close();
  }
}

/**
 * Draw the frame into a canvas, turned, no larger than the box given.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {ImageBitmap} frame  the stored frame
 * @param {number} rotation  what the file will say: 0, 90, 180 or 270
 * @param {{width: number, height: number}} box  the most the canvas may be
 */
export function drawPreview(canvas, frame, rotation, box) {
  const onSide = rotation === 90 || rotation === 270;
  const shownWidth = onSide ? frame.height : frame.width;
  const shownHeight = onSide ? frame.width : frame.height;
  const scale = Math.min(1, box.width / shownWidth, box.height / shownHeight);
  const width = Math.max(1, Math.round(shownWidth * scale));
  const height = Math.max(1, Math.round(shownHeight * scale));
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  drawScaled(ctx, frame, {
    rotation, displayWidth: shownWidth, displayHeight: shownHeight, width, height,
  });
}
