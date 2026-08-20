/**
 * Working out what a cut actually consists of.
 *
 * Everything on this page is expressed in seconds, because that is what a
 * person setting a start and an end is thinking in. Everything in the file is
 * expressed in ticks of that track's own clock, and the video clock and the
 * audio clock are different clocks. This module is where the one becomes the
 * other, once, so that the two export paths and the summary on the page cannot
 * disagree about where a cut lands.
 *
 * The part worth reading is `planRange`, and the part of that worth reading is
 * why a lossless cut starts earlier than you asked.
 *
 * A frame that is not a keyframe is stored as a description of how it differs
 * from the frames around it, so it cannot be decoded without them. A cut that
 * copies frames rather than re-encoding them therefore has to begin at a
 * keyframe - there is no other frame it *can* begin at - and keyframes are
 * generally one to ten seconds apart. Two ways out of that, and this tool takes
 * both, one per export path:
 *
 *   - Copy the run of frames from the keyframe in front of the cut, and write
 *     an edit list saying to start playing partway in. The extra frames are in
 *     the file and are not shown. Nothing is re-encoded, so the picture is the
 *     picture that arrived.
 *   - Decode from that keyframe, throw away the frames before the cut, and
 *     encode the rest. Exact to the frame, at the cost of a re-encode.
 *
 * The summary on the page names which of the two is about to happen and, for
 * the first, how much hidden footage that means. Neither is a secret.
 */

/**
 * How long each sample lasts, in its own track's ticks.
 *
 * Decode times are stored, durations are not, so a sample lasts until the next
 * one decodes. The last sample has nothing after it to measure against and
 * takes the track's declared length instead - falling back to the sample before
 * it where that is missing or absurd, which is what a fragmented file whose
 * header was written before its fragments existed looks like.
 */
export function sampleDurations(track) {
  const samples = track.samples;
  const out = new Float64Array(samples.length);
  if (!samples.length) return out;

  for (let i = 0; i < samples.length - 1; i++) {
    out[i] = Math.max(0, samples[i + 1].dts - samples[i].dts);
  }

  const last = samples.length - 1;
  const previous = last > 0 ? out[last - 1] : 0;
  const declared = track.duration - samples[last].dts;
  out[last] = declared > 0 && (!previous || declared <= previous * 20)
    ? declared
    : (previous || 1);

  return out;
}

/** Every keyframe's presentation time, in seconds. Drawn under the timeline. */
export function keyframeTimes(video) {
  const times = [];
  for (const sample of video.samples) {
    if (sample.isKey) times.push(sample.pts / video.timescale);
  }
  times.sort((a, b) => a - b);
  return times;
}

/**
 * The last keyframe at or before `seconds` - where a lossless cut would really
 * begin. Used by the page to say so before anything is exported.
 */
export function keyframeBefore(video, seconds) {
  const ticks = seconds * video.timescale;
  let best = null;
  for (const sample of video.samples) {
    if (!sample.isKey || sample.pts > ticks) continue;
    if (best === null || sample.pts > best) best = sample.pts;
  }
  return best === null ? 0 : best / video.timescale;
}

/** The index of the sample `keyframeBefore` found, in decode order. */
function keyframeIndexBefore(video, ticks) {
  let best = -1;
  let bestPts = -Infinity;
  video.samples.forEach((sample, index) => {
    if (sample.isKey && sample.pts <= ticks && sample.pts > bestPts) {
      best = index;
      bestPts = sample.pts;
    }
  });
  if (best >= 0) return best;

  // No keyframe at or before the cut at all, which means the cut is in front of
  // the first one. The first keyframe in the file is then the only place a copy
  // can start from.
  const first = video.samples.findIndex((sample) => sample.isKey);
  return first >= 0 ? first : 0;
}

/**
 * The last sample shown before `ticks`.
 *
 * Searched over the whole list rather than stopped at the first sample past the
 * mark, because with B-frames the list is in decode order and a frame shown
 * later can be stored earlier. Taking the highest index that is still shown in
 * time keeps every frame those later ones lean on.
 */
function lastIndexBefore(samples, from, ticks) {
  let best = from;
  for (let i = from; i < samples.length; i++) {
    if (samples[i].pts < ticks) best = i;
  }
  return best;
}

/** The last sample that starts at or before `ticks`, so the sound covers it. */
function indexCovering(samples, ticks) {
  let best = 0;
  for (let i = 0; i < samples.length; i++) {
    if (samples[i].dts <= ticks) best = i;
    else break;
  }
  return best;
}

/**
 * Turn one section, in seconds, into the run of samples that expresses it.
 *
 * @param {object} args
 * @param {object} args.video  the demuxed video track
 * @param {object|null} args.audio
 * @param {Float64Array} args.videoDurations  from sampleDurations()
 * @param {Float64Array|null} args.audioDurations
 * @param {number} args.start  seconds
 * @param {number} args.end    seconds
 * @param {'keyframe'|'start'} args.anchor  where this section's content begins.
 *   The copy path answers "the keyframe", because that is genuinely where its
 *   picture starts and the sound has to start in the same place or the two
 *   drift apart in any player that ignores the edit list. The re-encode path
 *   answers "the start", because its picture really does begin there.
 */
export function planRange({
  video, audio, videoDurations, audioDurations, start, end, anchor,
}) {
  const vts = video.timescale;
  const startTicks = start * vts;
  const endTicks = end * vts;

  const from = keyframeIndexBefore(video, startTicks);
  const to = Math.max(from, lastIndexBefore(video.samples, from, endTicks));

  const base = video.samples[from].dts;
  const keyframeSeconds = video.samples[from].pts / vts;
  const spanTs = video.samples[to].dts + videoDurations[to] - base;

  // Where the section's content begins, in seconds, on the source's own clock.
  // Both tracks are cut from this instant so that they hold the same span of
  // time, which is what keeps them together in a player that pays no attention
  // to edit lists.
  const anchorSeconds = anchor === 'keyframe' ? Math.min(keyframeSeconds, start) : start;

  const plan = {
    start,
    end,
    keyframeSeconds,
    preRoll: Math.max(0, start - keyframeSeconds),
    video: {
      from,
      to,
      base,
      spanTs,
      // Never negative: `from` is a keyframe at or before the cut. The clamp is
      // for the one file in a thousand that stores a frame shown before it
      // decodes, where the arithmetic can just cross zero.
      editStart: Math.max(0, startTicks - base),
    },
    audio: null,
  };

  if (audio && audio.samples.length) {
    const ats = audio.timescale;
    const audioFrom = indexCovering(audio.samples, anchorSeconds * ats);
    const audioTo = Math.max(audioFrom,
      lastIndexBefore(audio.samples, audioFrom, end * ats));
    const audioBase = audio.samples[audioFrom].dts;

    plan.audio = {
      from: audioFrom,
      to: audioTo,
      base: audioBase,
      spanTs: audio.samples[audioTo].dts + audioDurations[audioTo] - audioBase,
      editStart: Math.max(0, start * ats - audioBase),
    };
  }

  return plan;
}

/**
 * The same, for every section of the cut at once, with the running offsets that
 * lay them end to end on one timeline.
 *
 * @returns {{plans: object[], videoDurations: Float64Array,
 *            audioDurations: Float64Array|null}}
 */
export function planRanges({ video, audio, ranges, anchor }) {
  const videoDurations = sampleDurations(video);
  const audioDurations = audio && audio.samples.length ? sampleDurations(audio) : null;

  const plans = [];
  let videoOffset = 0;
  let audioOffset = 0;

  for (const range of ranges) {
    const plan = planRange({
      video, audio, videoDurations, audioDurations,
      start: range.start, end: range.end, anchor,
    });

    plan.video.offset = videoOffset;
    videoOffset += plan.video.spanTs;

    if (plan.audio) {
      plan.audio.offset = audioOffset;
      audioOffset += plan.audio.spanTs;
    }

    plans.push(plan);
  }

  return { plans, videoDurations, audioDurations };
}

/**
 * The sections of the source that a "keep this" or "cut this out" choice comes
 * down to.
 *
 * Keeping is the section itself. Cutting is everything either side of it, which
 * is one section when the mark touches an end of the clip and two when it does
 * not - and that is the only reason anything downstream of here deals in a list
 * of sections rather than a single pair of times.
 *
 * @returns {{start: number, end: number}[]}
 */
export function rangesFor({ mode, start, end, duration }) {
  const MIN = 0.02;   // shorter than one frame at any frame rate worth naming

  if (mode === 'keep') {
    return end - start > MIN ? [{ start, end }] : [];
  }

  return [
    { start: 0, end: start },
    { start: end, end: duration },
  ].filter((range) => range.end - range.start > MIN);
}

/** How long the finished video will be, in seconds. */
export function totalSeconds(ranges) {
  return ranges.reduce((total, range) => total + (range.end - range.start), 0);
}
