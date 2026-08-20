/**
 * The exact path: decode from the keyframe in front of the cut, throw away the
 * frames before it, and encode the rest.
 *
 * This is the path for a cut that has to land where you put it. The copy path
 * next door cannot start anywhere but a keyframe, and a keyframe can be several
 * seconds away; this one starts on the frame you chose, at the cost of writing
 * the picture out again.
 *
 * What it costs, stated plainly because the page states it plainly:
 *   - The picture is encoded a second time, so it is a generation further from
 *     the camera than the file you started with.
 *   - It takes as long as the machine takes, which is faster than real time on
 *     most hardware but is not instant the way a copy is.
 *
 * What it does not cost is the sound. The audio samples are chosen by the same
 * arithmetic the copy path uses and written out without being decoded, so on
 * both MP4 paths the sound that comes out is the sound that went in.
 */

import { FileWindow } from './demux.js';
import { Mp4Writer, MOVIE_TIMESCALE, avcSampleEntry } from './mp4.js';
import { planRanges } from './ranges.js';
import { drawCropped } from './draw.js';
import { pickH264Codec } from './support.js';

/** Divides evenly by 24, 25, 30, 50 and 60 fps. */
const VIDEO_TIMESCALE = 90000;

/** Bits per pixel per frame. Real footage moves, so these sit above the
 *  slideshow figures the images-to-video tool uses. */
const QUALITY_BPP = { low: 0.05, medium: 0.1, high: 0.2 };

/** How far above the source's own bitrate each quality is allowed to go. */
const QUALITY_HEADROOM = { low: 0.8, medium: 1.25, high: 2 };

const MIN_BITRATE = 200_000;
const MAX_BITRATE = 60_000_000;

/** Frames in flight before the feed loop waits for the pipeline to catch up. */
const QUEUE_LIMIT = 8;

/** Seconds between keyframes in the output, so seeking stays usable. */
const KEYFRAME_SECONDS = 2;

class AbortedError extends Error {
  constructor() {
    super('Trim cancelled.');
    this.name = 'AbortError';
  }
}

function throwIfAborted(signal) {
  if (signal?.aborted) throw new AbortedError();
}

/** The configuration VideoDecoder needs to open this track. */
export function decoderConfig(video) {
  const config = {
    codec: video.codec,
    codedWidth: video.codedWidth,
    codedHeight: video.codedHeight,
  };
  // VP9 carries everything it needs in the bitstream; the others hand over the
  // configuration record the file was written with, untouched.
  if (video.description) config.description = video.description;
  return config;
}

/** Frames per second, averaged over the whole track. */
export function averageFps(video) {
  const seconds = video.duration / video.timescale;
  if (!seconds) return 30;
  return Math.min(240, Math.max(1, video.samples.length / seconds));
}

/** The output frame size: the picture as watched, rounded to the even numbers
 *  H.264 can describe. */
export function outputSize(video) {
  return {
    width: Math.max(2, Math.floor(video.displayWidth / 2) * 2),
    height: Math.max(2, Math.floor(video.displayHeight / 2) * 2),
  };
}

/**
 * What to spend on the picture.
 *
 * Two ceilings, and the lower one wins. The first is the usual bits-per-pixel
 * figure. The second is what the source itself spent: a clip that arrived at
 * 2 Mbit/s does not become better by leaving at 6, and re-encoding above what
 * the original spent only makes the file bigger.
 */
export function chooseBitrate({ video, size, fps, quality }) {
  const pixels = size.width * size.height;
  const byPixels = pixels * fps * (QUALITY_BPP[quality] ?? QUALITY_BPP.medium);

  const sourceBytes = video.samples.reduce((total, sample) => total + sample.size, 0);
  const seconds = video.duration / video.timescale;

  let ceiling = byPixels;
  if (seconds > 0) {
    const sourceRate = sourceBytes * 8 / seconds;
    ceiling = Math.min(ceiling, sourceRate * (QUALITY_HEADROOM[quality] ?? 1.25));
  }

  return Math.round(Math.min(MAX_BITRATE, Math.max(MIN_BITRATE, ceiling)));
}

/** Wait until both queues have drained below the limit. */
async function settle(decoder, encoder) {
  while (decoder.decodeQueueSize > QUEUE_LIMIT || encoder.encodeQueueSize > QUEUE_LIMIT) {
    await new Promise((resolve) => {
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        decoder.removeEventListener('dequeue', done);
        encoder.removeEventListener('dequeue', done);
        resolve();
      };
      // `dequeue` is not in every implementation yet, so cap the wait.
      const timer = setTimeout(done, 20);
      decoder.addEventListener('dequeue', done);
      encoder.addEventListener('dequeue', done);
    });
  }
}

/** Presentation time in microseconds, which is what WebCodecs counts in. */
function micros(ticks, timescale) {
  return Math.round(ticks / timescale * 1_000_000);
}

/**
 * Copy the chosen audio samples into the writer, without decoding one of them.
 *
 * Identical in effect to what the copy path does, and deliberately so: which
 * export path was chosen decides what happens to the picture and nothing else.
 */
function writeAudio({ file, audio, audioTrack, plans, audioDurations }) {
  for (const plan of plans) {
    if (!plan.audio) continue;
    for (let i = plan.audio.from; i <= plan.audio.to; i++) {
      const sample = audio.samples[i];
      audioTrack.addSample({
        data: file.slice(sample.offset, sample.offset + sample.size),
        isKey: true,
        dts: sample.dts - plan.audio.base + plan.audio.offset,
        pts: sample.dts - plan.audio.base + plan.audio.offset,
        duration: audioDurations[i],
      });
    }
  }
}

/**
 * @param {object} args
 * @param {File} args.file
 * @param {object} args.media  what demux() returned
 * @param {{start: number, end: number}[]} args.ranges  in seconds
 * @returns {Promise<{blob: Blob, extension: string, codec: string,
 *                    frames: number, exact: boolean, preRoll: number}>}
 */
export async function trimExact({
  file, media, ranges, quality = 'medium', keepAudio = true, onProgress, signal,
}) {
  const { video, audio } = media;
  if (!ranges.length) throw new Error('There is nothing selected to keep.');

  const size = outputSize(video);
  const fps = averageFps(video);
  const bitrate = chooseBitrate({ video, size, fps, quality });

  const codec = await pickH264Codec({
    width: size.width, height: size.height, framerate: Math.round(fps), bitrate,
  });
  if (!codec) {
    throw new Error(`This browser will not encode H.264 at ${size.width}x${size.height}. `
      + 'Use "Keep every byte" instead, which encodes nothing at all.');
  }

  const useAudio = Boolean(keepAudio && audio && audio.samples.length);
  const { plans, audioDurations } = planRanges({
    video,
    audio: useAudio ? audio : null,
    ranges,
    // The picture really does begin where you asked, so the sound is cut from
    // there too rather than from the keyframe behind it.
    anchor: 'start',
  });

  onProgress?.({ phase: 'preparing', done: 0, total: 1 });

  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext('2d', { alpha: false });

  /** The encoded frames, held until their durations can be worked out. */
  const encoded = [];
  let avcC = null;
  let failure = null;
  let decoded = 0;
  let lastKeyframeUs = -Infinity;
  let wantKeyframe = true;

  /** Which section is being fed in, and what its frames are re-timed against. */
  let rangeStartSeconds = 0;
  let rangeOffsetUs = 0;
  let rangeEndSeconds = 0;

  const encoder = new VideoEncoder({
    output: (chunk, metadata) => {
      try {
        if (!avcC && metadata?.decoderConfig?.description) {
          const description = metadata.decoderConfig.description;
          avcC = description instanceof Uint8Array
            ? description
            : new Uint8Array(description instanceof ArrayBuffer
              ? description
              : description.buffer.slice(
                description.byteOffset, description.byteOffset + description.byteLength));
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
    width: size.width,
    height: size.height,
    bitrate,
    framerate: Math.round(fps),
    avc: { format: 'avc' },   // length-prefixed NALUs and an avcC record, which is what MP4 wants
    alpha: 'discard',
    latencyMode: 'quality',
  });

  const decoder = new VideoDecoder({
    output: (frame) => {
      try {
        if (failure) return;

        // Frames in front of the cut were decoded only because the ones after
        // them need them. They are not part of what was asked for.
        const seconds = frame.timestamp / 1_000_000;
        if (seconds < rangeStartSeconds - 1e-6 || seconds >= rangeEndSeconds - 1e-6) return;

        drawCropped(ctx, frame, {
          rotation: video.rotation,
          displayWidth: video.displayWidth,
          displayHeight: video.displayHeight,
          crop: { x: 0, y: 0, width: size.width, height: size.height },
        });

        const timestamp = Math.round(
          (seconds - rangeStartSeconds) * 1_000_000 + rangeOffsetUs);

        // Every section begins on a keyframe, so the joins are clean and the
        // result can be seeked to; after that, one every couple of seconds.
        const keyFrame = wantKeyframe
          || timestamp - lastKeyframeUs >= KEYFRAME_SECONDS * 1_000_000;
        if (keyFrame) {
          lastKeyframeUs = timestamp;
          wantKeyframe = false;
        }

        const picture = new VideoFrame(canvas, {
          timestamp,
          duration: frame.duration ?? undefined,
        });
        try {
          encoder.encode(picture, { keyFrame });
        } finally {
          picture.close();
        }
        decoded++;
      } catch (error) {
        failure ??= error;
      } finally {
        frame.close();
      }
    },
    error: (error) => { failure ??= error; },
  });

  decoder.configure(decoderConfig(video));

  const window = new FileWindow(file);
  const total = plans.reduce(
    (count, plan) => count + (plan.video.to - plan.video.from + 1), 0);
  let fed = 0;

  try {
    for (const plan of plans) {
      rangeStartSeconds = plan.start;
      rangeEndSeconds = plan.end;
      wantKeyframe = true;

      for (let i = plan.video.from; i <= plan.video.to; i++) {
        throwIfAborted(signal);
        if (failure) throw failure;

        await settle(decoder, encoder);

        const sample = video.samples[i];
        const bytes = await window.read(sample.offset, sample.size);

        decoder.decode(new EncodedVideoChunk({
          type: sample.isKey ? 'key' : 'delta',
          timestamp: micros(sample.pts, video.timescale),
          data: bytes,   // EncodedVideoChunk copies, so the window may move on
        }));

        fed++;
        if (fed % 10 === 0 || fed === total) {
          onProgress?.({ phase: 'trimming', done: decoded, total });
        }
      }

      // Each section is finished before the next one is fed in, so no frame of
      // one is ever re-timed against another's clock.
      await decoder.flush();
      if (failure) throw failure;
      rangeOffsetUs += Math.round((plan.end - plan.start) * 1_000_000);
    }

    onProgress?.({ phase: 'finishing', done: decoded, total });
    await encoder.flush();
    if (failure) throw failure;
    if (!encoded.length) throw new Error('No frames could be decoded from the section you chose.');
    if (!avcC) throw new Error('The encoder never reported a decoder configuration.');

    const writer = new Mp4Writer();
    const videoTrack = writer.addTrack({
      kind: 'vide',
      timescale: VIDEO_TIMESCALE,
      sampleEntry: avcSampleEntry(size.width, size.height, avcC),
      // The frames were drawn the right way up on their way through the canvas,
      // so there is nothing left for a matrix to turn.
      matrix: null,
      width: size.width << 16,
      height: size.height << 16,
    });

    // Durations come from the gap to the next frame, which is what keeps a clip
    // whose frame rate wanders intact: a phone that dropped from 30 to 24 fps
    // halfway through is written back with exactly the frame times it had.
    encoded.sort((a, b) => a.time - b.time);
    for (let i = 0; i < encoded.length; i++) {
      const next = encoded[i + 1];
      const duration = next
        ? Math.max(1, next.time - encoded[i].time)
        : Math.max(1, Math.round(VIDEO_TIMESCALE / Math.max(1, fps)));
      videoTrack.addSample({
        data: encoded[i].data,
        isKey: encoded[i].isKey,
        dts: encoded[i].time,
        pts: encoded[i].time,
        duration,
      });
    }

    if (useAudio) {
      const audioTrack = writer.addTrack({
        kind: 'soun',
        timescale: audio.timescale,
        sampleEntry: audio.sampleEntry,
      });
      writeAudio({ file, audio, audioTrack, plans, audioDurations });

      // The picture needs no edit list - it starts where it starts - but the
      // sound does: the audio sample that covers the cut generally begins a
      // fraction before it, and this is what stops that fraction being heard.
      let offsetMs = 0;
      for (const plan of plans) {
        const playMs = Math.round((plan.end - plan.start) * MOVIE_TIMESCALE);
        videoTrack.addEdit(
          Math.round(offsetMs / MOVIE_TIMESCALE * VIDEO_TIMESCALE), playMs);
        if (plan.audio) audioTrack.addEdit(plan.audio.offset + plan.audio.editStart, playMs);
        offsetMs += playMs;
      }
    }

    return {
      blob: writer.finalize(),
      extension: 'mp4',
      codec,
      frames: encoded.length,
      exact: true,
      preRoll: 0,
    };
  } finally {
    if (decoder.state !== 'closed') decoder.close();
    if (encoder.state !== 'closed') encoder.close();
  }
}

/**
 * Decode one frame near a point in time and draw it, whole and upright, onto a
 * canvas.
 *
 * This is what the timeline is lined up against when the browser will not play
 * the file itself - an iPhone HEVC clip in a browser without a licence for it,
 * say, which WebCodecs will still happily decode through the machine's own
 * hardware.
 */
export async function grabFrame({ file, media, atSeconds = 0, maxWidth = 960, signal }) {
  const { video } = media;
  const targetTicks = atSeconds * video.timescale;

  let start = 0;
  for (let i = 0; i < video.samples.length; i++) {
    if (video.samples[i].isKey && video.samples[i].pts <= targetTicks) start = i;
    if (video.samples[i].pts > targetTicks) break;
  }

  const scale = Math.min(1, maxWidth / video.displayWidth);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(2, Math.round(video.displayWidth * scale));
  canvas.height = Math.max(2, Math.round(video.displayHeight * scale));
  const ctx = canvas.getContext('2d', { alpha: false });

  let failure = null;
  let drawn = false;
  let bestUs = -Infinity;
  const targetUs = micros(targetTicks, video.timescale);

  const decoder = new VideoDecoder({
    output: (frame) => {
      try {
        // Frames arrive in presentation order, so the last one at or before the
        // target is the one wanted; anything later is only used if nothing
        // earlier turned up.
        if (!drawn || (frame.timestamp <= targetUs && frame.timestamp > bestUs)) {
          drawCropped(ctx, frame, {
            rotation: video.rotation,
            displayWidth: video.displayWidth,
            displayHeight: video.displayHeight,
            crop: { x: 0, y: 0, width: video.displayWidth, height: video.displayHeight },
            scale,
          });
          bestUs = frame.timestamp;
          drawn = true;
        }
      } catch (error) {
        failure ??= error;
      } finally {
        frame.close();
      }
    },
    error: (error) => { failure ??= error; },
  });

  decoder.configure(decoderConfig(video));

  const window = new FileWindow(file, 4 << 20);

  try {
    // A few samples past the target, so a file with reordered frames still has
    // everything the target frame depends on.
    for (let i = start; i < video.samples.length; i++) {
      throwIfAborted(signal);
      if (failure) throw failure;

      const sample = video.samples[i];
      const bytes = await window.read(sample.offset, sample.size);
      decoder.decode(new EncodedVideoChunk({
        type: sample.isKey ? 'key' : 'delta',
        timestamp: micros(sample.pts, video.timescale),
        data: bytes,
      }));

      if (sample.pts > targetTicks + video.timescale * 0.4) break;
    }

    await decoder.flush();
    if (failure) throw failure;
    if (!drawn) throw new Error('No frame could be decoded from this file.');
    return canvas;
  } finally {
    if (decoder.state !== 'closed') decoder.close();
  }
}
