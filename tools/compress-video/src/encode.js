/**
 * The whole clip, decoded, drawn smaller, and encoded again at the bitrate
 * the plan chose; the sound copied through untouched.
 *
 * The shape is the trimmer's exact path with the cuts taken out: every video
 * sample in file order into a VideoDecoder, every frame it hands back drawn
 * on to one canvas of the output size and handed to a VideoEncoder, every
 * chunk the encoder hands back kept until the end and written with a
 * duration worked out from the gap to the next. The sound is never decoded:
 * its samples are sliced out of the file and written into the new one with
 * the same clock, which is what keeps this the length it was.
 *
 * Two rules from the tools before this one, both learned the hard way:
 *
 *   - A decoded frame is drawn and closed inside the decoder's own callback,
 *     never held. The decoder hands out surfaces from a small pool and stops
 *     dead while the page holds them; see the reverser's history.
 *   - The feed loop waits for both codecs to drain below a small queue, and
 *     gives up with a phrase key rather than sitting at "Preparing..." for
 *     ever when a codec stops answering, which is what an encoder does on a
 *     machine whose hardware encoder is missing or busy.
 */

import { FileWindow } from './shared/mp4-reader.js';
import { Mp4Writer, avcSampleEntry } from './shared/mp4-writer.js';
import { drawScaled, frameCanvas } from './shared/frame-canvas.js';
import { pickH264Codec } from './shared/video-support.js';
import { decoderConfig, micros, settle } from './shared/webcodecs.js';
import { throwIfAborted } from './shared/errors.js';

/** Divides evenly by 24, 25, 30, 50 and 60 fps. */
const VIDEO_TIMESCALE = 90000;

/** Seconds between keyframes in the output, so seeking stays usable. */
const KEYFRAME_SECONDS = 2;

/** How long a codec may go without draining before the run is called stuck. */
const STALL_MS = 30_000;

/**
 * @param {object} args
 * @param {File} args.file
 * @param {{video: object, audio: object|null}} args.media  from demux()
 * @param {{width: number, height: number}} args.frame  the output size
 * @param {number} args.bitrate  bits per second, for the picture
 * @param {number} args.fps
 * @param {boolean} args.keepAudio
 * @param {(progress: {phase: string, done: number, total: number}) => void} [args.onProgress]
 * @param {AbortSignal} [args.signal]
 * @returns {Promise<{blob: Blob, frames: number, codec: string}>}
 */
export async function compress({
  file, media, frame, bitrate, fps, keepAudio, onProgress, signal,
}) {
  const { video, audio } = media;
  const framerate = Math.max(1, Math.round(fps));

  const codec = await pickH264Codec({
    width: frame.width, height: frame.height, framerate, bitrate,
  });
  if (!codec) {
    const refused = new Error('encode.toobig');
    refused.values = { size: frame.width + 'x' + frame.height };
    throw refused;
  }

  onProgress?.({ phase: 'preparing', done: 0, total: 1 });

  const { ctx } = frameCanvas(frame.width, frame.height);
  const canvas = ctx.canvas;

  /** The encoded frames, held until their durations can be worked out. */
  const encoded = [];
  let avcC = null;
  let failure = null;
  let drawn = 0;
  let lastKeyframeUs = -Infinity;

  const encoder = new VideoEncoder({
    output: (chunk, metadata) => {
      try {
        if (!avcC && metadata?.decoderConfig?.description) {
          avcC = bytesOf(metadata.decoderConfig.description);
        }
        const data = new Uint8Array(chunk.byteLength);
        chunk.copyTo(data);
        encoded.push({
          data,
          isKey: chunk.type === 'key',
          time: Math.round(chunk.timestamp / 1_000_000 * VIDEO_TIMESCALE),
        });
      } catch (error) {
        failure ??= error;
      }
    },
    error: (error) => { failure ??= error; },
  });

  encoder.configure({
    codec,
    width: frame.width,
    height: frame.height,
    bitrate,
    framerate,
    // Held to the bitrate rather than allowed to wander around it: the whole
    // point of this page is a size, and a variable-rate encode of a busy clip
    // lands well past it.
    bitrateMode: 'constant',
    avc: { format: 'avc' },   // length-prefixed NALUs and an avcC record, which is what MP4 wants
    alpha: 'discard',
    latencyMode: 'quality',
  });

  const onFrame = (videoFrame) => {
    try {
      if (failure) return;

      drawScaled(ctx, videoFrame, {
        rotation: video.rotation,
        displayWidth: video.displayWidth,
        displayHeight: video.displayHeight,
        width: frame.width,
        height: frame.height,
      });

      const { timestamp } = videoFrame;
      const keyFrame = timestamp - lastKeyframeUs >= KEYFRAME_SECONDS * 1_000_000;
      if (keyFrame) lastKeyframeUs = timestamp;

      const picture = new VideoFrame(canvas, {
        timestamp,
        duration: videoFrame.duration ?? undefined,
      });
      try {
        encoder.encode(picture, { keyFrame });
      } finally {
        picture.close();
      }
      drawn += 1;
    } catch (error) {
      failure ??= error;
    } finally {
      videoFrame.close();
    }
  };

  const decoder = new VideoDecoder({
    output: onFrame,
    error: (error) => { failure ??= error; },
  });
  decoder.configure(decoderConfig(video));

  const window = new FileWindow(file);
  const total = video.samples.length;

  try {
    // In file order, which is decode order: a frame that others depend on
    // is stored before them whatever the presentation times say.
    for (let i = 0; i < total; i += 1) {
      throwIfAborted(signal);
      if (failure) throw failure;

      await settle([decoder, encoder], { stallAfter: STALL_MS, stallKey: 'stall.both' });

      const sample = video.samples[i];
      const data = await window.read(sample.offset, sample.size);
      decoder.decode(new EncodedVideoChunk({
        type: sample.isKey ? 'key' : 'delta',
        timestamp: micros(sample.pts, video.timescale),
        data,   // EncodedVideoChunk copies, so the window may move on
      }));

      if (i % 10 === 0 || i === total - 1) {
        onProgress?.({ phase: 'encoding', done: drawn, total });
      }
    }

    await decoder.flush();
    if (failure) throw failure;
    onProgress?.({ phase: 'finishing', done: drawn, total });
    await encoder.flush();
    if (failure) throw failure;
    if (!encoded.length) throw new Error('decode.none');
    if (!avcC) throw new Error('encode.noconfig');
  } finally {
    if (decoder.state !== 'closed') decoder.close();
    if (encoder.state !== 'closed') encoder.close();
  }

  /* --------------------------------------------------------------- writing */

  const writer = new Mp4Writer();
  const videoTrack = writer.addTrack({
    kind: 'vide',
    timescale: VIDEO_TIMESCALE,
    sampleEntry: avcSampleEntry(frame.width, frame.height, avcC),
    // The frames were drawn the right way up on their way through the
    // canvas, so there is nothing left for a matrix to turn.
    matrix: null,
    width: frame.width << 16,
    height: frame.height << 16,
  });

  encoded.sort((a, b) => a.time - b.time);
  const tail = Math.max(1, Math.round(VIDEO_TIMESCALE / framerate));
  for (const sample of closeDurations(encoded.map((chunk) => ({
    data: chunk.data, isKey: chunk.isKey, dts: chunk.time, pts: chunk.time, tailDuration: tail,
  })))) {
    videoTrack.addSample(sample);
  }

  if (keepAudio && audio?.samples.length) {
    const audioTrack = writer.addTrack({
      kind: 'soun',
      timescale: audio.timescale,
      sampleEntry: audio.sampleEntry,
    });
    const last = audio.samples[audio.samples.length - 1];
    const tailAudio = Math.max(1, audio.duration - last.dts);
    for (const sample of closeDurations(audio.samples.map((s) => ({
      data: file.slice(s.offset, s.offset + s.size),
      isKey: true,
      dts: s.dts,
      pts: s.pts,
      tailDuration: tailAudio,
    })))) {
      audioTrack.addSample(sample);
    }
  }

  return { blob: writer.finalize(), frames: encoded.length, codec };
}

/** Each sample lasts until the next one starts; the last as long as told. */
function closeDurations(samples) {
  for (let i = 0; i < samples.length; i += 1) {
    const next = samples[i + 1];
    samples[i].duration = next
      ? Math.max(1, next.dts - samples[i].dts)
      : Math.max(1, samples[i].tailDuration);
  }
  return samples;
}

/** The decoder configuration record as bytes, whatever shape it arrived in. */
function bytesOf(description) {
  if (description instanceof Uint8Array) return description;
  if (description instanceof ArrayBuffer) return new Uint8Array(description);
  return new Uint8Array(description.buffer.slice(
    description.byteOffset, description.byteOffset + description.byteLength));
}
