/**
 * The lossless path: choose runs of samples, from one clip or several, and
 * write them back out.
 *
 * Nothing here decodes anything. Neither trimming nor joining changes what any
 * frame looks like, so there is no reason to write any frame again - the
 * encoded bytes that were in the files go into the new file exactly as they
 * were, and the work is entirely bookkeeping: which samples, at what times,
 * described by which tables.
 *
 * Three consequences worth knowing, and all three are said on the page:
 *
 *   - It is quick. A minute out of an hour-long recording takes about as long
 *     as the browser needs to write the file, because the frames are never
 *     read into this page at all. Each sample is stored as a slice of the file
 *     on disk - a promise to read those bytes later - and the browser reads
 *     them for the first time as it assembles the download.
 *   - Each section starts at a keyframe. There is no way around that while
 *     copying, so the frames between the keyframe and where you asked to start
 *     are kept and marked not to be played. See ranges.js for the long version.
 *   - Joining this way needs every clip to describe its track the same way,
 *     because one track carries one description. clips.js is where that is
 *     checked, and it refuses rather than guesses.
 *
 * The sound is carried across the same way, sample by sample, without being
 * decoded. Between them these facts mean this path cannot lose quality: there
 * is no step in it that could.
 *
 * ## Two clocks, and the seam between clips
 *
 * Within one clip, ranges.js does the arithmetic and its running offsets are in
 * that clip's own ticks. Across clips there is no shared tick - two files can
 * count at 30000 and at 90000 - so the seam is measured in seconds, and each
 * clip's samples are rescaled onto the output's clock as they are written.
 *
 * The durations are then derived from the times rather than rescaled one by
 * one, because `stts` defines the timeline as a sum of durations: if the
 * durations and the decode times disagree, the times lose. Taking each
 * duration as the gap to the next sample makes them agree by construction, and
 * the rounding of a seam lands in one sample's duration instead of
 * accumulating.
 */

import { Mp4Writer, MOVIE_TIMESCALE } from './mp4.js';
import { planRanges } from './ranges.js';

class AbortedError extends Error {
  constructor() {
    super('Trim cancelled.');
    this.name = 'AbortError';
  }
}

function throwIfAborted(signal) {
  if (signal?.aborted) throw new AbortedError();
}

/** Ticks on one clock, in ticks on another. */
function rescale(ticks, from, to) {
  return from === to ? ticks : ticks * to / from;
}

/**
 * Turn a list of samples carrying their own times into one carrying durations.
 *
 * Every duration is the gap to the next sample, so the sum of them is exactly
 * the span the times describe. Only the final sample has nothing after it to
 * measure against, and it keeps the length it had in the file it came from.
 */
export function closeDurations(samples) {
  for (let i = 0; i < samples.length; i++) {
    const next = samples[i + 1];
    samples[i].duration = next
      ? Math.max(1, next.dts - samples[i].dts)
      : Math.max(1, samples[i].tailDuration);
  }
  return samples;
}

/**
 * One section's audio, on the joined clock, exactly as it was in the file.
 *
 * Shared with the re-encoding path next door: which export path was chosen
 * decides what happens to the picture, and the sound is carried the same way
 * either side of that choice.
 *
 * @param {object} args
 * @param {object} args.plan  one entry from planRanges()
 * @param {Float64Array} args.durations  from sampleDurations()
 * @param {number} args.seam  where this clip begins, in output ticks
 */
export function audioSamplesFor({ file, audio, plan, durations, seam, outTimescale }) {
  const out = [];
  if (!plan.audio) return out;

  for (let i = plan.audio.from; i <= plan.audio.to; i++) {
    const sample = audio.samples[i];
    const at = sample.dts - plan.audio.base + plan.audio.offset;
    const when = seam + Math.round(rescale(at, audio.timescale, outTimescale));
    out.push({
      data: file.slice(sample.offset, sample.offset + sample.size),
      isKey: true,
      dts: when,
      pts: when,
      tailDuration: Math.round(rescale(durations[i], audio.timescale, outTimescale)),
    });
  }
  return out;
}

/**
 * @param {object} args
 * @param {{file: File, media: object, ranges: object[], name?: string}[]} args.clips
 *   in the order they are to be joined. One clip is a trim; several is a join.
 * @returns {Promise<{blob: Blob, extension: string, frames: number,
 *                    preRoll: number, exact: boolean, clips: number}>}
 */
export async function joinByCopy({ clips, keepAudio = true, onProgress, signal }) {
  const usable = clips.filter((clip) => clip.ranges.length);
  if (!usable.length) throw new Error('nothing.selected');

  const firstVideo = usable[0].media.video;
  const firstAudio = usable[0].media.audio;
  const useAudio = Boolean(
    keepAudio && firstAudio && usable.every((clip) => clip.media.audio?.samples.length));

  // The output counts on the first clip's clocks. Everything else is rescaled
  // onto them, which is exact whenever the clips agree and within a tick when
  // they do not.
  const outVideoTs = firstVideo.timescale;
  const outAudioTs = useAudio ? firstAudio.timescale : 0;

  const videoOut = [];
  const audioOut = [];
  const videoEdits = [];
  const audioEdits = [];

  const total = usable.reduce((count, clip) => count
    + clip.media.video.samples.length
    + (useAudio ? clip.media.audio.samples.length : 0), 0);
  let done = 0;
  let preRoll = 0;

  const tick = () => {
    done++;
    // Every few hundred samples rather than every one: this loop is fast enough
    // that reporting it more often costs more than the loop does.
    if (done % 500 === 0) onProgress?.({ phase: 'copying', done, total });
  };

  onProgress?.({ phase: 'preparing', done: 0, total });

  /** Where the next clip begins, in seconds, on the joined timeline. */
  let seamSeconds = 0;

  for (const clip of usable) {
    throwIfAborted(signal);

    const { video, audio } = clip.media;
    const { plans, videoDurations, audioDurations } = planRanges({
      video,
      audio: useAudio ? audio : null,
      ranges: clip.ranges,
      anchor: 'keyframe',
    });

    // Both tracks are pinned to the same instant at every seam, so a join can
    // never walk the sound away from the picture one clip at a time.
    const videoSeam = Math.round(seamSeconds * outVideoTs);
    const audioSeam = useAudio ? Math.round(seamSeconds * outAudioTs) : 0;
    let clipSpanSeconds = 0;

    for (const plan of plans) {
      for (let i = plan.video.from; i <= plan.video.to; i++) {
        const sample = video.samples[i];
        const at = sample.dts - plan.video.base + plan.video.offset;
        const shown = sample.pts - plan.video.base + plan.video.offset;
        videoOut.push({
          data: clip.file.slice(sample.offset, sample.offset + sample.size),
          isKey: sample.isKey,
          dts: videoSeam + Math.round(rescale(at, video.timescale, outVideoTs)),
          pts: videoSeam + Math.round(rescale(shown, video.timescale, outVideoTs)),
          tailDuration: Math.round(rescale(videoDurations[i], video.timescale, outVideoTs)),
        });
        tick();
      }

      if (useAudio && plan.audio) {
        for (const sample of audioSamplesFor({
          file: clip.file, audio, plan, durations: audioDurations,
          seam: audioSeam, outTimescale: outAudioTs,
        })) {
          audioOut.push(sample);
          tick();
        }
      }

      // What the file is asked to play out of what it now holds. Both tracks
      // are given the same length, from the same instant, so a player following
      // the edit list keeps them together - and one ignoring it keeps them
      // together too, because they were cut from the same span of time.
      const wanted = plan.end - plan.start;
      const available = (plan.video.spanTs - plan.video.editStart) / video.timescale;
      const playMs = Math.round(Math.max(0, Math.min(wanted, available)) * MOVIE_TIMESCALE);

      videoEdits.push({
        mediaTime: videoSeam + Math.round(rescale(
          plan.video.offset + plan.video.editStart, video.timescale, outVideoTs)),
        duration: playMs,
      });
      if (useAudio && plan.audio) {
        audioEdits.push({
          mediaTime: audioSeam + Math.round(rescale(
            plan.audio.offset + plan.audio.editStart, audio.timescale, outAudioTs)),
          duration: playMs,
        });
      }

      clipSpanSeconds += plan.video.spanTs / video.timescale;
      preRoll = Math.max(preRoll, plan.preRoll);
    }

    seamSeconds += clipSpanSeconds;
  }

  throwIfAborted(signal);
  onProgress?.({ phase: 'finishing', done: total, total });

  const writer = new Mp4Writer();
  const videoTrack = writer.addTrack({
    kind: 'vide',
    timescale: outVideoTs,
    sampleEntry: firstVideo.sampleEntry,
    matrix: firstVideo.matrix,
    width: firstVideo.trackWidth,
    height: firstVideo.trackHeight,
  });
  for (const sample of closeDurations(videoOut)) videoTrack.addSample(sample);
  for (const edit of videoEdits) videoTrack.addEdit(edit.mediaTime, edit.duration);

  if (useAudio && audioOut.length) {
    const audioTrack = writer.addTrack({
      kind: 'soun',
      timescale: outAudioTs,
      sampleEntry: firstAudio.sampleEntry,
    });
    for (const sample of closeDurations(audioOut)) audioTrack.addSample(sample);
    for (const edit of audioEdits) audioTrack.addEdit(edit.mediaTime, edit.duration);
  }

  return {
    blob: writer.finalize(),
    extension: 'mp4',
    codec: `${firstVideo.codec}, copied`,
    frames: videoOut.length,
    clips: usable.length,
    exact: false,
    preRoll,
  };
}

/**
 * One clip, which is what a trim is.
 *
 * Kept as its own name because that is what the single-clip case is called
 * everywhere else on the page, and because a join of one should read as a trim
 * rather than as a special case of something larger.
 */
export function trimByCopy({ file, media, ranges, keepAudio = true, onProgress, signal }) {
  return joinByCopy({ clips: [{ file, media, ranges }], keepAudio, onProgress, signal });
}

/**
 * What a copy would cost before anyone commits to one: how much hidden footage
 * each section would carry, and roughly how large the file would be.
 *
 * Called on every drag of the timeline, so it walks the sample tables and
 * nothing else - no reading, no decoding.
 */
export function estimateCopy({ media, ranges, keepAudio = true }) {
  const { video, audio } = media;
  if (!ranges.length) return { bytes: 0, preRoll: 0, frames: 0 };

  const useAudio = Boolean(keepAudio && audio && audio.samples.length);
  const { plans } = planRanges({
    video,
    audio: useAudio ? audio : null,
    ranges,
    anchor: 'keyframe',
  });

  let bytes = 0;
  let frames = 0;
  let preRoll = 0;

  for (const plan of plans) {
    for (let i = plan.video.from; i <= plan.video.to; i++) {
      bytes += video.samples[i].size;
      frames++;
    }
    if (plan.audio) {
      for (let i = plan.audio.from; i <= plan.audio.to; i++) bytes += audio.samples[i].size;
    }
    preRoll = Math.max(preRoll, plan.preRoll);
  }

  // The tables in front of the samples are a percent or so of a normal file.
  return { bytes: Math.round(bytes * 1.01), preRoll, frames };
}

/** The same, added up over every clip in a join. */
export function estimateJoinCopy(clips, keepAudio = true) {
  const sound = keepAudio && clips.every((clip) => clip.media?.audio?.samples.length);
  return clips.reduce((total, clip) => {
    if (!clip.media || !clip.ranges.length) return total;
    const one = estimateCopy({ media: clip.media, ranges: clip.ranges, keepAudio: sound });
    return {
      bytes: total.bytes + one.bytes,
      frames: total.frames + one.frames,
      preRoll: Math.max(total.preRoll, one.preRoll),
    };
  }, { bytes: 0, frames: 0, preRoll: 0 });
}
