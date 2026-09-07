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
 * The landscape from example-photo.js, painted once across a canvas wide
 * enough for the whole pan and then blitted a window at a time - see
 * clipPainter below for why it is not drawn per frame - with a progress bar
 * and a once-a-second marker over the top.
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

/** How deep the encoder's queue may get before we let the page breathe. */
const BREATH = 24;

/**
 * Hand the event loop one turn, without setTimeout.
 *
 * setTimeout(0) is clamped to a full second in a background tab, and encoding
 * yields dozens of times - which turned a clip that takes about a second into
 * one that took twenty-two whenever the tab was not in front. A visitor who
 * presses the button and then goes to read something else is the normal case,
 * not an edge one. A MessageChannel message is not clamped.
 */
function turn() {
  return new Promise((settle) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = () => { channel.port1.close(); settle(); };
    channel.port2.postMessage(0);
  });
}


/** How far the view moves between one frame and the next, in pixels. */
const PAN = 6;

/**
 * Paint the scene once and hand back something that draws any frame of it.
 *
 * The first version of this called drawPhoto for every frame, and a
 * two-hundred-frame clip took twenty-two seconds to encode - because that
 * function scatters several thousand blades of grass and then walks every
 * pixel to lay grain over them, which is the right cost to pay once and an
 * absurd one to pay two hundred times. So the scene is painted once, wide
 * enough to cover the whole pan, and each frame is a window blitted out of it.
 *
 * What that changes in the result is that the grain travels with the scene
 * instead of being redrawn per frame. Nobody is going to grade this footage;
 * what matters is that the encoder still has detail to spend bits on and the
 * button answers in about a second.
 *
 * @returns {(ctx: CanvasRenderingContext2D, index: number) => void}
 */
export function clipPainter(width, height, total, fps) {
  const wide = document.createElement('canvas');
  wide.width = width + PAN * Math.max(1, total);
  wide.height = height;
  drawPhoto(wide.getContext('2d', { willReadFrequently: true }), wide.width, height);

  return (ctx, index) => {
    ctx.drawImage(wide, index * PAN, 0, width, height, 0, 0, width, height);
    drawMarks(ctx, width, height, index, total, fps);
  };
}

/**
 * The two things drawn over every frame that a still picture has not: a bar
 * that fills as the clip runs, and a marker that steps once a second.
 *
 * They are there so the tools can be judged rather than merely operated - a
 * trim is only demonstrably a trim if you can see which part came back, and
 * "the frame at 3.2 seconds" means nothing against footage where every frame
 * looks the same.
 *
 * Shapes and never text: a caption would be English at fourteen of the
 * addresses this module is copied to, which is the rule phrases.js exists to
 * keep. A bar has no language.
 */
function drawMarks(ctx, width, height, index, total, fps) {
  const done = index / Math.max(1, total - 1);

  const barHeight = Math.max(4, Math.round(height * 0.018));
  const barY = height - barHeight * 3;
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(0, barY, width, barHeight);
  ctx.fillStyle = '#f2b134';
  ctx.fillRect(0, barY, Math.round(width * done), barHeight);

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

  const paint = clipPainter(width, height, total, fps);
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
      paint(ctx, i);

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

      // Room for the encoder to drain and the page to paint - but only when
      // the queue has actually grown, rather than on a fixed count.
      while (encoder.encodeQueueSize > BREATH) await turn();
    }

    await encoder.flush();
    if (failure) throw failure;
    const blob = muxer.finalize();
    return new File([blob], name, { type: 'video/mp4', lastModified: Date.now() });
  } finally {
    if (encoder.state !== 'closed') encoder.close();
  }
}
