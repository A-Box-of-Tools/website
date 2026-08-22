/**
 * The exact path: decode from the keyframe in front of each cut, throw away
 * the frames before it, and encode the rest into one stream.
 *
 * This is the path for a cut that has to land where you put it, and the only
 * path for a join whose clips do not already agree with each other. The copy
 * path next door cannot start anywhere but a keyframe, and cannot put two
 * differently-encoded clips into one track at all; this one starts on the frame
 * you chose and re-describes everything it touches, at the cost of writing the
 * picture out again.
 *
 * What it costs, stated plainly because the page states it plainly:
 *   - The picture is encoded a second time, so it is a generation further from
 *     the camera than the files you started with.
 *   - It takes as long as the machine takes, which is faster than real time on
 *     most hardware but is not instant the way a copy is.
 *
 * What it does not cost is the sound, whenever the clips describe theirs the
 * same way: those samples are chosen by the same arithmetic the copy path uses
 * and written out without being decoded. Only a join between clips that
 * disagree about their sound has to re-encode it, and audio.js does that.
 */

import { FileWindow } from './demux.js';
import { Mp4Writer, MOVIE_TIMESCALE, avcSampleEntry } from './mp4.js';
import { planRanges } from './ranges.js';
import { closeDurations, audioSamplesFor } from './copy.js';
import { encodeJoinedAudio, targetAudioFormat } from './audio.js';
import { drawFitted } from './draw.js';
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

/** The output frame size for one clip: the picture as watched, rounded to the
 *  even numbers H.264 can describe. */
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

/**
 * The same, over a join.
 *
 * The busiest clip decides, because one bitrate has to cover all of them and
 * choosing the average would spend the quiet clips' headroom on nothing while
 * starving the one that needed it.
 */
export function chooseJoinBitrate({ clips, frame, fps, quality }) {
  let best = MIN_BITRATE;
  for (const clip of clips) {
    if (!clip.media) continue;
    best = Math.max(best, chooseBitrate({
      video: clip.media.video, size: frame, fps, quality,
    }));
  }
  return best;
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
 * @param {object} args
 * @param {{file: File, media: object, ranges: object[], name?: string}[]} args.clips
 * @param {{width: number, height: number}} args.frame  the joined frame size
 * @param {'copy'|'encode'|'none'} args.audioMode  what to do about the sound
 * @returns {Promise<{blob: Blob, extension: string, codec: string, frames: number,
 *                    exact: boolean, preRoll: number, clips: number,
 *                    warning: string|null}>}
 */
export async function joinExact({
  clips, frame, quality = 'medium', audioMode = 'copy', onProgress, signal,
}) {
  const usable = clips.filter((clip) => clip.ranges.length && clip.media);
  if (!usable.length) throw new Error('There is nothing selected to keep.');

  const fps = Math.max(...usable.map((clip) => averageFps(clip.media.video)));
  const bitrate = chooseJoinBitrate({ clips: usable, frame, fps, quality });

  const codec = await pickH264Codec({
    width: frame.width, height: frame.height, framerate: Math.round(fps), bitrate,
  });
  if (!codec) {
    throw new Error(`This browser will not encode H.264 at ${frame.width}x${frame.height}. `
      + 'Choose a smaller frame, or use "Keep every byte", which encodes nothing at all.');
  }

  onProgress?.({ phase: 'preparing', done: 0, total: 1 });

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
  let wantKeyframe = true;

  /** Which section is being fed in, and what its frames are re-timed against. */
  let rangeStartSeconds = 0;
  let rangeEndSeconds = 0;
  let rangeOffsetUs = 0;
  let rotation = 0;
  let sourceWidth = frame.width;
  let sourceHeight = frame.height;

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

  const onFrame = (videoFrame) => {
    try {
      if (failure) return;

      // Frames in front of the cut were decoded only because the ones after
      // them need them. They are not part of what was asked for.
      const seconds = videoFrame.timestamp / 1_000_000;
      if (seconds < rangeStartSeconds - 1e-6 || seconds >= rangeEndSeconds - 1e-6) return;

      drawFitted(ctx, videoFrame, {
        rotation,
        displayWidth: sourceWidth,
        displayHeight: sourceHeight,
        frame,
      });

      const timestamp = Math.round((seconds - rangeStartSeconds) * 1_000_000 + rangeOffsetUs);

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
        duration: videoFrame.duration ?? undefined,
      });
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

  const total = usable.reduce((count, clip) => count + clip.media.video.samples.length, 0);
  let fed = 0;

  /** Everything the sound needs, gathered as the picture is walked. */
  const audioOut = [];
  const audioEdits = [];
  const forEncoding = [];
  let outAudioTs = 0;
  let seamSeconds = 0;

  try {
    for (const clip of usable) {
      const { video, audio } = clip.media;
      const hasAudio = Boolean(audio?.samples.length);
      // The sound is planned whenever it is wanted, not only when it is being
      // copied: the re-encoding path needs the same sample ranges to know what
      // to decode. Planning it only for the copy is how a join between clips
      // that disagree ends up silent.
      const planAudio = audioMode !== 'none' && hasAudio ? audio : null;
      const useAudio = audioMode === 'copy' && hasAudio;

      const { plans, audioDurations } = planRanges({
        video,
        audio: planAudio,
        ranges: clip.ranges,
        // The picture really does begin where you asked, so the sound is cut
        // from there too rather than from the keyframe behind it.
        anchor: 'start',
      });

      if (audioMode === 'encode') {
        forEncoding.push({ file: clip.file, media: clip.media, plans });
      }
      if (useAudio && !outAudioTs) outAudioTs = audio.timescale;

      const audioSeam = outAudioTs ? Math.round(seamSeconds * outAudioTs) : 0;

      rotation = video.rotation;
      sourceWidth = video.displayWidth;
      sourceHeight = video.displayHeight;

      const decoder = new VideoDecoder({
        output: onFrame,
        error: (error) => { failure ??= error; },
      });
      decoder.configure(decoderConfig(video));

      const window = new FileWindow(clip.file);

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
            const data = await window.read(sample.offset, sample.size);

            decoder.decode(new EncodedVideoChunk({
              type: sample.isKey ? 'key' : 'delta',
              timestamp: micros(sample.pts, video.timescale),
              data,   // EncodedVideoChunk copies, so the window may move on
            }));

            fed++;
            if (fed % 10 === 0 || fed === total) {
              onProgress?.({ phase: 'trimming', done: drawn, total });
            }
          }

          // Each section is finished before the next is fed in, so no frame of
          // one is ever re-timed against another's clock.
          await decoder.flush();
          if (failure) throw failure;

          if (useAudio && plan.audio) {
            for (const sample of audioSamplesFor({
              file: clip.file, audio, plan, durations: audioDurations,
              seam: audioSeam, outTimescale: outAudioTs,
            })) {
              audioOut.push(sample);
            }
            audioEdits.push({
              mediaTime: audioSeam + Math.round(
                (plan.audio.offset + plan.audio.editStart) * outAudioTs / audio.timescale),
              duration: Math.round((plan.end - plan.start) * MOVIE_TIMESCALE),
            });
          }

          rangeOffsetUs += Math.round((plan.end - plan.start) * 1_000_000);
          seamSeconds += plan.end - plan.start;
        }
      } finally {
        if (decoder.state !== 'closed') decoder.close();
      }
    }

    onProgress?.({ phase: 'finishing', done: drawn, total });
    await encoder.flush();
    if (failure) throw failure;
    if (!encoded.length) throw new Error('No frames could be decoded from what you chose.');
    if (!avcC) throw new Error('The encoder never reported a decoder configuration.');
  } finally {
    if (encoder.state !== 'closed') encoder.close();
  }

  /* --------------------------------------------------------------- writing */

  const writer = new Mp4Writer();
  const videoTrack = writer.addTrack({
    kind: 'vide',
    timescale: VIDEO_TIMESCALE,
    sampleEntry: avcSampleEntry(frame.width, frame.height, avcC),
    // The frames were drawn the right way up on their way through the canvas,
    // so there is nothing left for a matrix to turn.
    matrix: null,
    width: frame.width << 16,
    height: frame.height << 16,
  });

  // Durations come from the gap to the next frame, which is what keeps a clip
  // whose frame rate wanders intact: a phone that dropped from 30 to 24 fps
  // halfway through is written back with exactly the frame times it had.
  encoded.sort((a, b) => a.time - b.time);
  const tail = Math.max(1, Math.round(VIDEO_TIMESCALE / Math.max(1, fps)));
  for (const sample of closeDurations(encoded.map((chunk) => ({
    data: chunk.data, isKey: chunk.isKey, dts: chunk.time, pts: chunk.time, tailDuration: tail,
  })))) {
    videoTrack.addSample(sample);
  }

  let warning = null;

  if (audioMode === 'copy' && audioOut.length) {
    const audioTrack = writer.addTrack({
      kind: 'soun',
      timescale: outAudioTs,
      sampleEntry: usable.find((clip) => clip.media.audio?.samples.length).media.audio.sampleEntry,
    });
    for (const sample of closeDurations(audioOut)) audioTrack.addSample(sample);

    // The picture needs no edit list - it starts where it starts - but the
    // sound does: the audio sample covering the cut generally begins a fraction
    // before it, and this is what stops that fraction being heard.
    let offsetMs = 0;
    for (const edit of audioEdits) {
      videoTrack.addEdit(Math.round(offsetMs / MOVIE_TIMESCALE * VIDEO_TIMESCALE), edit.duration);
      audioTrack.addEdit(edit.mediaTime, edit.duration);
      offsetMs += edit.duration;
    }
  } else if (audioMode === 'encode') {
    onProgress?.({ phase: 'sound', done: 0, total: forEncoding.length });
    const format = targetAudioFormat(usable);
    const sound = await encodeJoinedAudio({ clips: forEncoding, format, onProgress, signal });

    if (sound) {
      const audioTrack = writer.addTrack({
        kind: 'soun',
        timescale: sound.timescale,
        sampleEntry: sound.sampleEntry,
      });
      // One continuous stream, made to be exactly as long as the picture, so
      // neither track needs an edit list to line them up.
      for (const sample of sound.samples) {
        audioTrack.addSample({
          data: sample.data,
          isKey: true,
          dts: sample.dts,
          pts: sample.dts,
          duration: sample.duration,
        });
      }
    } else {
      warning = 'These clips describe their sound differently, so it had to be re-encoded '
        + 'to be joined - and this browser will not encode AAC. The video has been joined '
        + 'without sound. Chrome and Edge will do it.';
    }
  }

  return {
    blob: writer.finalize(),
    extension: 'mp4',
    codec,
    frames: encoded.length,
    clips: usable.length,
    exact: true,
    preRoll: 0,
    warning,
  };
}

/** One clip, which is what a trim is. */
export function trimExact({
  file, media, ranges, quality = 'medium', keepAudio = true, onProgress, signal,
}) {
  return joinExact({
    clips: [{ file, media, ranges }],
    frame: outputSize(media.video),
    quality,
    audioMode: keepAudio && media.audio?.samples.length ? 'copy' : 'none',
    onProgress,
    signal,
  });
}

/**
 * Decode one frame near a point in time and draw it, whole and upright, onto a
 * canvas.
 *
 * This is what the timeline is lined up against when the browser will not play
 * the file itself - an iPhone HEVC clip in a browser without a licence for it,
 * say, which WebCodecs will still happily decode through the machine's own
 * hardware. It is also where a clip's thumbnail comes from.
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
    output: (videoFrame) => {
      try {
        // Frames arrive in presentation order, so the last one at or before the
        // target is the one wanted; anything later is only used if nothing
        // earlier turned up.
        if (!drawn || (videoFrame.timestamp <= targetUs && videoFrame.timestamp > bestUs)) {
          drawFitted(ctx, videoFrame, {
            rotation: video.rotation,
            displayWidth: video.displayWidth,
            displayHeight: video.displayHeight,
            frame: { width: canvas.width, height: canvas.height },
          });
          bestUs = videoFrame.timestamp;
          drawn = true;
        }
      } catch (error) {
        failure ??= error;
      } finally {
        videoFrame.close();
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
      const data = await window.read(sample.offset, sample.size);
      decoder.decode(new EncodedVideoChunk({
        type: sample.isKey ? 'key' : 'delta',
        timestamp: micros(sample.pts, video.timescale),
        data,
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
