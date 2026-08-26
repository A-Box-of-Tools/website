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
 * How long the queues may sit without draining before a reversal gives up.
 *
 * A stalled codec does not reliably report anything: it stops draining and the
 * `dequeue` event this waits on simply never comes again. Without a ceiling on
 * that wait the page sits at "Preparing..." forever, which is the one failure
 * a visitor cannot tell from slow progress.
 *
 * The stall this was written for - holding a window of frames and starving the
 * decoder's surface pool - is fixed above, so reaching this now means something
 * genuinely unexplained. It is kept because an indefinite hang is a bad enough
 * outcome to be worth a backstop, and thirty seconds is far longer than a queue
 * of eight frames takes anywhere that is really working, software 4K included.
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

/**
 * What a frame costs when it cannot be read and has to be held as a bitmap.
 *
 * A mappable frame is handed over in the decoder's own 4:2:0, which is the 1.5
 * bytes a pixel windowLimit() assumes. A bitmap is not: it is four. So a file
 * whose frames arrive on the GPU gets a shorter window for the same budget,
 * which is the honest trade rather than the same window at nearly three times
 * the memory.
 */
const BITMAP_BYTES_PER_PIXEL = 4;

/**
 * Whether this file's frames arrive as pictures we can read.
 *
 * Decided by decoding a single keyframe and asking, rather than by guessing
 * from the codec: it is a property of the machine's decoder, not of the file.
 * A hardware HEVC decoder typically answers `null` here - the picture is on the
 * GPU and was never in memory - and everything downstream has to know that
 * before it chooses a window size.
 */
async function framesAreOpaque(video, file) {
  const key = video.samples.findIndex((sample) => sample.isKey);
  if (key < 0) return false;

  return new Promise((resolve) => {
    let settled = false;
    const answer = (value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (probe.state !== 'closed') probe.close();
      resolve(value);
    };
    // Nothing here is worth hanging the export over: if the probe says nothing
    // in five seconds, assume readable frames and let the real run find out.
    const timer = setTimeout(() => answer(false), 5000);

    const probe = new VideoDecoder({
      output: (frame) => {
        const format = frame.format;
        frame.close();
        answer(format === null);
      },
      error: () => answer(false),
    });

    try {
      probe.configure(decoderConfig(video));
      const sample = video.samples[key];
      file.slice(sample.offset, sample.offset + sample.size).arrayBuffer()
        .then((data) => {
          probe.decode(new EncodedVideoChunk({
            type: 'key',
            timestamp: micros(sample.pts, video.timescale),
            data: new Uint8Array(data),
          }));
          return probe.flush();
        })
        .catch(() => answer(false));
    } catch {
      answer(false);
    }
  });
}

/**
 * Run a flush, but do not wait on it forever.
 *
 * settle() watches the queues while frames are being fed; this watches the two
 * points where everything has already been fed and the only thing left is a
 * codec that may never answer.
 */
function withStallTimeout(promise, which) {
  let timer = null;
  const stalled = new Promise((resolve, reject) => {
    timer = setTimeout(() => reject(new Error(
      `The video ${which} stopped responding partway through, without reporting a reason. `
      + 'A shorter clip, a lower quality setting, or a different browser is worth trying.')),
    STALL_TIMEOUT_MS);
  });
  return Promise.race([promise, stalled]).finally(() => clearTimeout(timer));
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
      throw new Error('The video decoder or encoder stopped responding partway through, without '
        + 'reporting a reason. A shorter clip, a lower quality setting, or a different browser '
        + 'is worth trying.');
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
  // What the decoder will actually hand back, learned from one frame rather
  // than assumed. It decides both how a frame is taken out of the pool below
  // and how many will fit in the budget, and those two have to agree.
  const opaque = await framesAreOpaque(video, file);
  const limit = windowLimit(
    video.codedWidth, video.codedHeight, undefined, opaque ? BITMAP_BYTES_PER_PIXEL : 1.5);

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

  /** The wanted frames' pixels, owned by us rather than by the decoder. */
  let kept = [];

  /** Copies still running. `flush` promises the callbacks ran, not that these did. */
  let copies = [];

  const decoder = new VideoDecoder({
    output: (videoFrame) => {
      if (!wanted.has(videoFrame.timestamp)) {
        videoFrame.close();
        return;
      }

      // The pixels are copied out and the frame released immediately, rather
      // than the frame being held until the window is ready to encode it.
      //
      // That is not a memory optimisation - the copy is the same size as the
      // frame - it is what keeps the decoder running at all. A decoder hands
      // back pictures from a small pool of surfaces, and it is a pool rather
      // than an allocation: a dozen or so at 4K, whatever the machine has.
      // While the application holds them it cannot decode, and holding a
      // window of them is therefore not slow but stuck, because the frames
      // that would release the pool are the ones still queued behind it. The
      // budget in windowLimit() is counted in bytes and cannot see this, and
      // at 4K it asks for about three times what the pool can spare.
      //
      // Every line of this runs inside the decoder's own callback, so it is
      // wrapped: a throw here would escape into the browser, leave `failure`
      // unset and - the part that hangs - leave the frame unclosed, which
      // starves the pool this whole routine exists to give back.
      try {
        const rect = videoFrame.visibleRect;
        const slot = {
          timestamp: videoFrame.timestamp,
          format: videoFrame.format,
          // Sized to the visible rectangle, which is what copyTo() writes out:
          // a frame coded taller than it is shown has that padding dropped here
          // rather than travelling with it.
          width: rect ? rect.width : videoFrame.codedWidth,
          height: rect ? rect.height : videoFrame.codedHeight,
          displayWidth: videoFrame.displayWidth,
          displayHeight: videoFrame.displayHeight,
          colorSpace: videoFrame.colorSpace,
          data: null,
          layout: null,
          bitmap: null,
        };
        kept.push(slot);

        // Left to run rather than awaited in turn: each frame is released the
        // moment its own copy lands, and making them queue behind one another
        // would hold the surfaces this exists to give back.
        //
        // A frame with no `format` is one the decoder never put in memory we
        // can read - a picture living on the GPU, which is what a hardware
        // HEVC decoder usually returns. copyTo() cannot have it and throws, so
        // that frame is taken out of the pool by drawing it into an
        // ImageBitmap instead. Either way the surface goes back at once, which
        // is the only thing the decoder cares about.
        copies.push((slot.format === null
          ? createImageBitmap(videoFrame).then((bitmap) => { slot.bitmap = bitmap; })
          : (() => {
            const buffer = new ArrayBuffer(videoFrame.allocationSize());
            return videoFrame.copyTo(buffer).then((layout) => {
              slot.data = buffer;
              slot.layout = layout;
            });
          })())
          .catch((error) => { failure ??= error; })
          .finally(() => videoFrame.close()));
      } catch (error) {
        failure ??= error;
        videoFrame.close();
      }
    },
    error: (error) => { failure ??= error; },
  });
  decoder.configure(decoderConfig(video));

  /** A kept frame, back in something that can be drawn or encoded. */
  const drawable = (slot) => (slot.bitmap ? slot.bitmap : new VideoFrame(slot.data, {
    format: slot.format,
    codedWidth: slot.width,
    codedHeight: slot.height,
    timestamp: slot.timestamp,
    layout: slot.layout,
    displayWidth: slot.displayWidth,
    displayHeight: slot.displayHeight,
    colorSpace: slot.colorSpace,
  }));

  /** Drop a kept frame that will not be drawn after all. */
  const discard = (slot) => {
    slot.bitmap?.close();
    slot.bitmap = null;
    slot.data = null;
  };

  /**
   * Whether this frame has to go through the canvas on its way to the encoder.
   *
   * The canvas exists to turn a rotated clip the right way up and to letterbox
   * a picture that does not land exactly on the output frame. A clip that needs
   * neither - which is most of them, and every clip filmed the way it is
   * watched - was still paying for both: a 4K frame drawn into a 2D context is
   * decoded YUV converted to RGBA and then converted back to YUV inside the
   * encoder, and measured on a 4K frame that round trip costs more than the
   * encode it precedes. Skipping it is worth about two and a half times on the
   * whole export, and it is the more faithful of the two paths as well, the one
   * that does not resample the colour twice.
   */
  const needsCanvas = (source) => video.rotation !== 0
    || frame.width !== video.displayWidth
    || frame.height !== video.displayHeight
    // Anything whose pixels are not already the shape of the output - a clip
    // with non-square pixels reaches here - still has to be fitted.
    || (source.codedWidth ?? source.width) !== frame.width
    || (source.codedHeight ?? source.height) !== frame.height;

  /** One held frame, encoded at the time the reversal gives it. */
  const emit = (source, index) => {
    try {
      const timestamp = micros(times.start[index], video.timescale);
      const duration = micros(times.duration[index], video.timescale);

      // One at the start and one every couple of seconds after it. Without them
      // the output plays but scrubs badly.
      const keyFrame = timestamp - lastKeyframeUs >= KEYFRAME_SECONDS * 1_000_000;
      if (keyFrame) lastKeyframeUs = timestamp;

      let picture;
      if (needsCanvas(source)) {
        drawFitted(ctx, source, {
          rotation: video.rotation,
          displayWidth: video.displayWidth,
          displayHeight: video.displayHeight,
          frame,
        });
        picture = new VideoFrame(canvas, { timestamp, duration });
      } else {
        // The same picture, told when it is shown. No pixels move.
        picture = new VideoFrame(source, { timestamp, duration });
      }

      try {
        encoder.encode(picture, { keyFrame });
      } finally {
        picture.close();
      }
      drawn++;
    } catch (error) {
      failure ??= error;
    } finally {
      source.close();
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
        kept = [];
        copies = [];

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

        // Watched, because flush() is the other place a stalled decoder hides:
        // settle() guards the feeding, but by here everything has been fed and
        // a decoder that has stopped emitting simply never resolves this.
        await withStallTimeout(decoder.flush(), 'decoder');
        // `flush` waits for the output callbacks, and each of those starts a
        // copy rather than finishing one. The pixels are only ours after this.
        await Promise.all(copies);
        copies = [];
        if (failure) throw failure;

        // Last shown, first written. This is the reversal.
        kept.sort((a, b) => b.timestamp - a.timestamp);
        for (const slot of kept) {
          // Its copy failed; `failure` already holds why.
          if (!slot.data && !slot.bitmap) continue;
          emit(drawable(slot), wanted.get(slot.timestamp));
          discard(slot);
          await settle(decoder, encoder);
        }
        kept = [];

        onProgress?.({ phase: 'reversing', done: drawn, total });
      }
    }

    onProgress?.({ phase: 'finishing', done: drawn, total });
    await withStallTimeout(encoder.flush(), 'encoder');
    if (failure) throw failure;
    if (!encoded.length) throw new Error('No frames could be decoded from this file.');
    if (!avcC) throw new Error('The encoder never reported a decoder configuration.');
  } finally {
    // The frames themselves were handed back as they arrived, so what is left
    // to drop here is the copies. Any still running own a frame apiece and
    // close it themselves, so they are waited for rather than abandoned.
    await Promise.allSettled(copies);
    for (const slot of kept) discard(slot);
    kept = [];
    copies = [];
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
