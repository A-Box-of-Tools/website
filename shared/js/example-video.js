/**
 * A short video, encoded in the page.
 *
 * Seven tools here take a clip, and none of them can be shown what it does
 * without one. The file is made the same way the site makes everything else it
 * demonstrates on - see the note at the top of shared/js/example-photo.js for
 * why nothing is ever fetched - except that this one goes through a real
 * encoder: `VideoEncoder` produces H.264, and shared/js/mp4-muxer.js wraps it
 * in the same MP4 the image-sequence tool writes.
 *
 * WHAT IS IN THE PICTURE
 *
 * The landscape from example-photo.js, panned sideways a little on every
 * frame, with two things drawn over it that no still frame has: a bar that
 * fills as the clip runs, and a marker that steps once a second. Those are
 * there so the tools can be judged rather than merely operated - a trim is
 * only demonstrably a trim if you can see which part of the clip came back,
 * and "grab the frame at 3.2 seconds" means nothing against footage where
 * every frame looks the same.
 *
 * They are drawn as shapes and never as text. A caption would be English in
 * the fourteen languages this module is copied into unchanged, which is the
 * rule phrases.js exists to keep; a bar has no language.
 *
 * WHAT IT DOES NOT HAVE
 *
 * Sound. shared/js/mp4-muxer.js writes exactly one H.264 track and no audio -
 * that is what its own header says - so a tool whose subject is the sound in a
 * video needs more than this module gives, and says so where it asks.
 */

import { drawPhoto } from './example-photo.js';
import { pickH264Codec } from './video-support.js';
import { Mp4Muxer } from './mp4-muxer.js';

/** Frames encoded between yields, so a long clip cannot lock the page up. */
const BREATH = 12;

/**
 * Draw one frame of the clip: the scene, then the two moving marks.
 *
 * Exported because example-video-sound.js draws the same clip and must draw
 * exactly the same one - two examples of the same footage that did not match
 * would be a puzzle for anybody comparing two tools on it.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width
 * @param {number} height
 * @param {number} index    which frame this is
 * @param {number} total    how many there are
 * @param {number} fps
 */
export function drawClipFrame(ctx, width, height, index, total, fps) {
  drawPhoto(ctx, width, height, { shift: index * 6, grainSeed: 900 + index });

  const done = index / Math.max(1, total - 1);

  // The progress bar, across the foot of the frame.
  const barHeight = Math.max(4, Math.round(height * 0.018));
  const barY = height - barHeight * 3;
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(0, barY, width, barHeight);
  ctx.fillStyle = '#f2b134';
  ctx.fillRect(0, barY, Math.round(width * done), barHeight);

  // A marker that steps once a second, so a still can be placed in the clip by
  // counting rather than by reading a clock that would have to be in words.
  const second = Math.floor(index / fps);
  const seconds = Math.max(1, Math.ceil(total / fps));
  const pitch = width / (seconds + 1);
  const r = Math.max(6, Math.round(height * 0.022));
  for (let s = 0; s < seconds; s += 1) {
    ctx.beginPath();
    ctx.arc(pitch * (s + 1), barY - r * 2.2, r, 0, Math.PI * 2);
    ctx.fillStyle = s === second ? '#ffffff' : 'rgba(255,255,255,0.28)';
    ctx.fill();
  }
}

/**
 * Encode the clip and hand it back as a File.
 *
 * @param {string} name
 * @param {object} [options]
 * @param {number} [options.width]
 * @param {number} [options.height]
 * @param {number} [options.fps]
 * @param {number} [options.seconds]
 * @returns {Promise<File>}
 */
export async function exampleVideoFile(name, {
  width = 960, height = 540, fps = 25, seconds = 6,
} = {}) {
  if (typeof VideoEncoder !== 'function' || typeof VideoFrame !== 'function') {
    // A key rather than a sentence: this module is copied into fifteen
    // languages and only the page can turn one into words. wireExample catches
    // it and says the frame's `example.failed`.
    throw new Error('example.nowebcodecs');
  }

  const total = Math.max(1, Math.round(fps * seconds));
  const bitrate = Math.round(width * height * fps * 0.12);
  const codec = await pickH264Codec({ width, height, framerate: fps, bitrate });
  if (!codec) throw new Error('example.noh264');

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true });

  const muxer = new Mp4Muxer({ width, height });
  let failure = null;

  const encoder = new VideoEncoder({
    output: (chunk, metadata) => {
      try {
        if (metadata?.decoderConfig?.description) {
          muxer.setDecoderConfig(metadata.decoderConfig.description);
        }
        const data = new Uint8Array(chunk.byteLength);
        chunk.copyTo(data);
        muxer.addSample(data, chunk.type === 'key', 1 / fps);
      } catch (error) {
        failure ??= error;
      }
    },
    error: (error) => { failure ??= error; },
  });

  encoder.configure({
    codec,
    width,
    height,
    bitrate,
    framerate: fps,
    // Length-prefixed NALUs and an avcC record, which is what an MP4 wants.
    avc: { format: 'avc' },
    alpha: 'discard',
    latencyMode: 'quality',
  });

  const frameDurationUs = 1_000_000 / fps;

  try {
    for (let i = 0; i < total; i += 1) {
      if (failure) throw failure;
      drawClipFrame(ctx, width, height, i, total, fps);

      const frame = new VideoFrame(canvas, {
        timestamp: Math.round(i * frameDurationUs),
        duration: Math.round(frameDurationUs),
      });
      try {
        // A keyframe every second, so the trimmers have somewhere to cut and
        // the seeking in the scrubbers lands where it is asked to.
        encoder.encode(frame, { keyFrame: i % fps === 0 });
      } finally {
        frame.close();
      }

      // The encoder is given room to drain, and the page room to paint.
      if (i % BREATH === BREATH - 1) {
        while (encoder.encodeQueueSize > BREATH) {
          await new Promise((settle) => setTimeout(settle, 0));
        }
      }
    }

    await encoder.flush();
    if (failure) throw failure;
    const blob = muxer.finalize();
    return new File([blob], name, { type: 'video/mp4', lastModified: Date.now() });
  } finally {
    if (encoder.state !== 'closed') encoder.close();
  }
}
