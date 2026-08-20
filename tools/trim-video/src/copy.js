/**
 * The lossless path: choose a run of samples and write them back out.
 *
 * Nothing here decodes anything. A trim does not change what any frame looks
 * like, so there is no reason to write any frame again - the encoded bytes that
 * were in the file go into the new file exactly as they were, and the work is
 * entirely bookkeeping: which samples, at what times, described by which
 * tables.
 *
 * Two consequences worth knowing, and both are said on the page:
 *
 *   - It is quick. A minute out of an hour-long recording takes about as long
 *     as the browser needs to write the file, because the frames are never
 *     read into this page at all. Each sample is stored as a slice of the file
 *     on disk - a promise to read those bytes later - and the browser reads
 *     them for the first time as it assembles the download.
 *   - The cut starts at a keyframe. There is no way around that while copying,
 *     so the frames between the keyframe and where you asked to start are kept
 *     and marked not to be played. See ranges.js for the long version.
 *
 * The sound is carried across the same way, sample by sample, without being
 * decoded. Between them these two facts mean this path cannot lose quality:
 * there is no step in it that could.
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

/**
 * @param {object} args
 * @param {File} args.file
 * @param {object} args.media  what demux() returned
 * @param {{start: number, end: number}[]} args.ranges  in seconds
 * @returns {Promise<{blob: Blob, extension: string, frames: number,
 *                    preRoll: number, exact: boolean}>}
 */
export async function trimByCopy({
  file, media, ranges, keepAudio = true, onProgress, signal,
}) {
  const { video, audio } = media;
  if (!ranges.length) throw new Error('There is nothing selected to keep.');

  const useAudio = Boolean(keepAudio && audio && audio.samples.length);
  const { plans, videoDurations, audioDurations } = planRanges({
    video,
    audio: useAudio ? audio : null,
    ranges,
    anchor: 'keyframe',
  });

  const writer = new Mp4Writer();
  const videoTrack = writer.addTrack({
    kind: 'vide',
    timescale: video.timescale,
    sampleEntry: video.sampleEntry,
    matrix: video.matrix,
    width: video.trackWidth,
    height: video.trackHeight,
  });

  const audioTrack = useAudio
    ? writer.addTrack({
      kind: 'soun',
      timescale: audio.timescale,
      sampleEntry: audio.sampleEntry,
    })
    : null;

  const total = plans.reduce((count, plan) => count
    + (plan.video.to - plan.video.from + 1)
    + (plan.audio ? plan.audio.to - plan.audio.from + 1 : 0), 0);

  let done = 0;
  let frames = 0;
  const tick = () => {
    done++;
    // Every few hundred samples rather than every one: this loop is fast enough
    // that reporting it more often costs more than the loop does.
    if (done % 500 === 0 || done === total) onProgress?.({ phase: 'copying', done, total });
  };

  onProgress?.({ phase: 'preparing', done: 0, total });

  for (const plan of plans) {
    throwIfAborted(signal);

    for (let i = plan.video.from; i <= plan.video.to; i++) {
      const sample = video.samples[i];
      videoTrack.addSample({
        data: file.slice(sample.offset, sample.offset + sample.size),
        isKey: sample.isKey,
        dts: sample.dts - plan.video.base + plan.video.offset,
        pts: sample.pts - plan.video.base + plan.video.offset,
        duration: videoDurations[i],
      });
      frames++;
      tick();
    }

    if (audioTrack && plan.audio) {
      for (let i = plan.audio.from; i <= plan.audio.to; i++) {
        const sample = audio.samples[i];
        audioTrack.addSample({
          data: file.slice(sample.offset, sample.offset + sample.size),
          isKey: true,
          dts: sample.dts - plan.audio.base + plan.audio.offset,
          pts: sample.dts - plan.audio.base + plan.audio.offset,
          duration: audioDurations[i],
        });
        tick();
      }
    }

    // What the file is asked to play out of what it now holds. Both tracks are
    // given the same length, from the same instant, so a player following the
    // edit list keeps them together - and one ignoring it keeps them together
    // too, because they were cut from the same span of time to begin with.
    const wanted = plan.end - plan.start;
    const available = (plan.video.spanTs - plan.video.editStart) / video.timescale;
    const playMs = Math.round(Math.max(0, Math.min(wanted, available)) * MOVIE_TIMESCALE);

    videoTrack.addEdit(plan.video.offset + plan.video.editStart, playMs);
    if (audioTrack && plan.audio) {
      audioTrack.addEdit(plan.audio.offset + plan.audio.editStart, playMs);
    }
  }

  throwIfAborted(signal);
  onProgress?.({ phase: 'finishing', done: total, total });

  return {
    blob: writer.finalize(),
    extension: 'mp4',
    codec: `${video.codec}, copied`,
    frames,
    exact: false,
    preRoll: Math.max(...plans.map((plan) => plan.preRoll)),
  };
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
