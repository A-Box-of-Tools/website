/**
 * The exact path: read the file's own frames, hand them to the encoder in the
 * other order, and write an MP4.
 *
 * The obvious way to reverse a video is to decode it into a list of frames and
 * walk the list backwards. That works for a five-second clip and runs a browser
 * out of memory on anything longer: a decoded 1080p frame is about 3 MB, so a
 * minute of footage is 5 GB of pictures. Nothing here holds a whole file.
 *
 * What it does instead follows from how video is stored. Frames come in groups,
 * each beginning with a keyframe, and only that keyframe can be decoded on its
 * own; everything after it is a description of what changed. So the file is
 * walked group by group from the end, and inside a group:
 *
 *   1. feed the group to the decoder from its keyframe forward, which is the
 *      only direction a decoder goes;
 *   2. hold the frames that come back;
 *   3. hand them to the encoder last one first, each with the timestamp
 *      src/timeline.js worked out for it.
 *
 * A group longer than the memory budget is decoded more than once - once per
 * run of frames it is split into - and the frames outside the run being
 * collected are dropped as they arrive. That is the only wasted work in here,
 * it is bounded by the length of one group, and it is what keeps a 4K clip from
 * being a tool that opens the file and then dies.
 *
 * What it costs is a re-encode of the picture, which is unavoidable: the frames
 * come out in an order that no longer matches how they were coded, so every one
 * of them has to be written afresh. The sound cannot be carried across either,
 * for the reason src/audio.js opens with.
 */

import { FileWindow } from './demux.js';
import { Mp4Writer, avcSampleEntry } from './mp4.js';
import { drawFitted } from './draw.js';
import { pickH264Codec } from './support.js';
import { reversedAudioTrack } from './audio.js';
import {
  averageFps, closeDurations, frameWindows, gopRanges, outputSize, reversedTimes, windowLimit,
} from './timeline.js';

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

/**
 * How long the decode/encode queues may sit without draining before a
 * reversal gives up rather than waiting forever.
 *
 * A codec that has genuinely stalled - a hardware encoder the driver cannot
 * actually deliver on, say, despite `isConfigSupported` saying yes - does not
 * reliably fire `error`: the `dequeue` event this waits on simply never comes
 * again. Without a ceiling on that wait, `settle` spins quietly and the page
 * sits at "Preparing..." with nothing to show for it and nothing to click.
 * Thirty seconds is far past what a queue of eight frames takes to drain on
 * any hardware actually processing them, even in software at 4K.
 */
const STALL_TIMEOUT_MS = 30_000;

/** Seconds between keyframes in the output, so seeking stays usable. */
const KEYFRAME_SECONDS = 2;

/** How much of one group may be held as compressed bytes to save re-reading it. */
const GROUP_CACHE_BYTES = 64 << 20;

class AbortedError extends Error {
  constructor() {
    super('Reverse cancelled.');
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

/**
 * What to spend on the picture.
 *
 * Two ceilings, and the lower one wins. The first is the usual bits-per-pixel
 * figure. The second is what the source itself spent: a clip that arrived at
 * 2 Mbit/s does not become better by leaving at 6, and a reversed clip holds
 * exactly the same pictures as the one that arrived, so there is nothing new
 * for the extra bits to describe.
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
  let bestSeen = decoder.decodeQueueSize + encoder.encodeQueueSize;
  let progressAt = Date.now();

  while (decoder.decodeQueueSize > QUEUE_LIMIT || encoder.encodeQueueSize > QUEUE_LIMIT) {
    const size = decoder.decodeQueueSize + encoder.encodeQueueSize;
    if (size < bestSeen) {
      bestSeen = size;
      progressAt = Date.now();
    } else if (Date.now() - progressAt > STALL_TIMEOUT_MS) {
      throw new Error('The video decoder or encoder stopped responding partway through, rather '
        + 'than reporting an error. This usually means the browser accepted this file at this '
        + 'resolution and quality but cannot actually deliver on it in hardware; a smaller '
        + 'clip, a lower quality setting, or a different browser is worth trying.');
    }

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
 * The compressed bytes of one group of frames.
 *
 * A group is read once and held while its frames are collected, because a long
 * one is decoded several times and reading it again each time would turn a
 * memory problem into a disk problem. "Held" is only ever a group of frames -
 * a couple of seconds of video, a few megabytes - and a group past the cache
 * limit is read from the file per pass instead.
 *
 * The window in demux.js is not used here, and this is why: it moves forwards
 * cheaply and backwards expensively, and this is the one thing on this site
 * that reads a file from the end.
 */
async function readGroup(file, samples, group) {
  let low = Infinity;
  let high = 0;
  for (let i = group.from; i <= group.to; i++) {
    low = Math.min(low, samples[i].offset);
    high = Math.max(high, samples[i].offset + samples[i].size);
  }

  if (high - low > GROUP_CACHE_BYTES) {
    return {
      async get(index) {
        const sample = samples[index];
        return new Uint8Array(
          await file.slice(sample.offset, sample.offset + sample.size).arrayBuffer());
      },
    };
  }

  const bytes = new Uint8Array(await file.slice(low, high).arrayBuffer());
  return {
    async get(index) {
      const sample = samples[index];
      return bytes.subarray(sample.offset - low, sample.offset - low + sample.size);
    },
  };
}

/**
 * @param {object} args
 * @param {File} args.file
 * @param {object} args.media  what demux() returned
 * @param {'low'|'medium'|'high'} [args.quality]
 * @param {boolean} [args.keepAudio]  reverse the sound as well as the picture
 * @returns {Promise<{blob: Blob, extension: string, codec: string, frames: number,
 *                    exact: boolean, warning: string|null}>}
 */
export async function reverseExact({
  file, media, quality = 'medium', keepAudio = true, onProgress, signal,
}) {
  const { video, audio } = media;
  const frame = outputSize(video);
  const fps = averageFps(video);
  const bitrate = chooseBitrate({ video, size: frame, fps, quality });

  const codec = await pickH264Codec({
    width: frame.width, height: frame.height, framerate: Math.round(fps), bitrate,
  });
  if (!codec) {
    throw new Error(`This browser will not encode H.264 at ${frame.width}x${frame.height}. `
      + 'A smaller clip will work; this one will not.');
  }

  onProgress?.({ phase: 'preparing', done: 0, total: video.samples.length });

  const times = reversedTimes(video);
  const groups = gopRanges(video.samples);
  const limit = windowLimit(video.codedWidth, video.codedHeight);

  const canvas = document.createElement('canvas');
  canvas.width = frame.width;
  canvas.height = frame.height;
  const ctx = canvas.getContext('2d', { alpha: false });

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
    width: frame.width,
    height: frame.height,
    bitrate,
    framerate: Math.round(fps),
    avc: { format: 'avc' },   // length-prefixed NALUs and an avcC record, which is what MP4 wants
    alpha: 'discard',
    latencyMode: 'quality',
  });

  /**
   * Which frames the pass being decoded is collecting, by their timestamp.
   *
   * A decoder is handed a group from its keyframe forward whatever part of it
   * is wanted, so most of what comes back on a windowed pass is not wanted and
   * is closed as it arrives. Matching on the timestamp rather than on a count
   * is what makes that safe on a file whose frames decode in one order and are
   * shown in another.
   */
  let wanted = new Map();
  let held = [];

  const decoder = new VideoDecoder({
    output: (videoFrame) => {
      if (wanted.has(videoFrame.timestamp)) held.push(videoFrame);
      else videoFrame.close();
    },
    error: (error) => { failure ??= error; },
  });
  decoder.configure(decoderConfig(video));

  /** One held frame, drawn and encoded at the time the reversal gives it. */
  const emit = (videoFrame, index) => {
    try {
      drawFitted(ctx, videoFrame, {
        rotation: video.rotation,
        displayWidth: video.displayWidth,
        displayHeight: video.displayHeight,
        frame,
      });

      const timestamp = micros(times.start[index], video.timescale);
      const duration = micros(times.duration[index], video.timescale);

      // One at the start and one every couple of seconds after it. Without them
      // the output plays but scrubs badly.
      const keyFrame = timestamp - lastKeyframeUs >= KEYFRAME_SECONDS * 1_000_000;
      if (keyFrame) lastKeyframeUs = timestamp;

      const picture = new VideoFrame(canvas, { timestamp, duration });
      try {
        encoder.encode(picture, { keyFrame });
      } finally {
        picture.close();
      }
      drawn++;
    } catch (error) {
      failure ??= error;
    } finally {
      videoFrame.close();
    }
  };

  const total = video.samples.length;

  try {
    for (let g = groups.length - 1; g >= 0; g--) {
      const group = groups[g];

      // The frames of this group in the order they are shown, which is the
      // order to reverse. It is the order of the list too on a file without
      // B-frames, and sorting one that is already sorted costs nothing.
      const shown = [];
      for (let i = group.from; i <= group.to; i++) shown.push(i);
      shown.sort((a, b) => video.samples[a].pts - video.samples[b].pts);

      const bytes = await readGroup(file, video.samples, group);

      for (const window of frameWindows(shown.length, limit)) {
        throwIfAborted(signal);
        if (failure) throw failure;

        const run = shown.slice(window.from, window.to + 1);
        wanted = new Map(
          run.map((index) => [micros(video.samples[index].pts, video.timescale), index]));
        held = [];

        // Everything a frame is built from decodes before it, so the feed can
        // stop at the last frame of this run rather than finishing the group.
        const until = Math.max(...run);

        for (let i = group.from; i <= until; i++) {
          throwIfAborted(signal);
          if (failure) throw failure;

          await settle(decoder, encoder);
          const sample = video.samples[i];
          decoder.decode(new EncodedVideoChunk({
            type: sample.isKey ? 'key' : 'delta',
            timestamp: micros(sample.pts, video.timescale),
            data: await bytes.get(i),
          }));
        }

        await decoder.flush();
        if (failure) throw failure;

        // Last shown, first written. This is the reversal.
        held.sort((a, b) => b.timestamp - a.timestamp);
        for (const videoFrame of held) {
          emit(videoFrame, wanted.get(videoFrame.timestamp));
          await settle(decoder, encoder);
        }
        held = [];

        onProgress?.({ phase: 'reversing', done: drawn, total });
      }
    }

    onProgress?.({ phase: 'finishing', done: drawn, total });
    await encoder.flush();
    if (failure) throw failure;
    if (!encoded.length) throw new Error('No frames could be decoded from this file.');
    if (!avcC) throw new Error('The encoder never reported a decoder configuration.');
  } finally {
    for (const videoFrame of held) videoFrame.close();
    if (decoder.state !== 'closed') decoder.close();
    if (encoder.state !== 'closed') encoder.close();
  }

  /* --------------------------------------------------------------- the sound */

  let sound = null;
  let warning = null;

  if (keepAudio && audio?.samples.length) {
    const result = await reversedAudioTrack({ file, audio, onProgress, signal });
    sound = result.track;
    warning = result.note;
  }

  /* -------------------------------------------------------------- the writing */

  return {
    blob: writeFile({ frame, avcC, encoded, fps, sound }),
    extension: 'mp4',
    codec,
    frames: encoded.length,
    exact: true,
    warning,
  };
}

/**
 * Put the encoded picture and the encoded sound into one MP4.
 *
 * Shared with the playback path, which arrives here with the same two things in
 * hand however it got them.
 */
export function writeFile({ frame, avcC, encoded, fps, sound }) {
  const writer = new Mp4Writer();
  const videoTrack = writer.addTrack({
    kind: 'vide',
    timescale: VIDEO_TIMESCALE,
    sampleEntry: avcSampleEntry(frame.width, frame.height, avcC),
    // The frames were turned the right way up on their way through the canvas,
    // so there is nothing left for a matrix to turn.
    matrix: null,
    width: frame.width << 16,
    height: frame.height << 16,
  });

  // Sorted because the encoder is under no obligation to hand its chunks back
  // in the order they were fed, and because the durations below are the gaps
  // between one frame and the next.
  encoded.sort((a, b) => a.time - b.time);
  const tail = Math.max(1, Math.round(VIDEO_TIMESCALE / Math.max(1, fps)));
  for (const sample of closeDurations(encoded.map((chunk) => ({
    data: chunk.data, isKey: chunk.isKey, dts: chunk.time, pts: chunk.time, tailDuration: tail,
  })))) {
    videoTrack.addSample(sample);
  }

  if (sound) {
    const audioTrack = writer.addTrack({
      kind: 'soun',
      timescale: sound.timescale,
      sampleEntry: sound.sampleEntry,
    });
    // One continuous stream, as long as the picture, so neither track needs an
    // edit list to line them up.
    for (const sample of sound.samples) {
      audioTrack.addSample({
        data: sample.data,
        isKey: true,
        dts: sample.dts,
        pts: sample.dts,
        duration: sample.duration,
      });
    }
  }

  return writer.finalize();
}

export { VIDEO_TIMESCALE };
