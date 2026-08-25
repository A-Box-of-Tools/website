/**
 * Turning a list of frames into the order, and the times, they come out in.
 *
 * All of the arithmetic a reversal needs is here, away from the decoder and the
 * encoder, because it is the part that is easy to get quietly wrong: a mistake
 * in it does not throw, it produces a video that plays backwards and is a frame
 * and a half too long, or that stutters where the source changed frame rate. It
 * is also the part that can be checked without a browser, and
 * tests/js/reverse-video.test.js does.
 *
 * Two facts about video files shape everything below.
 *
 *   - **Frames are not stored in the order they are shown.** A file with
 *     B-frames stores a frame before the ones it is displayed after, so the
 *     order to reverse is the order of the presentation times, not the order of
 *     the list.
 *   - **A frame is not independently decodable.** Only a keyframe is. So the
 *     last frame of a clip cannot be picked up on its own: the group it belongs
 *     to has to be decoded from its keyframe forward, and only then can its
 *     frames be handed to the encoder in the other order. That is why
 *     `gopRanges` exists, and why the file is walked group by group from the end
 *     rather than frame by frame.
 */

/**
 * Where each frame sits on the clock, and how long it is shown for.
 *
 * Durations come from the gap to the next frame rather than from anything the
 * file says, which is what keeps a clip whose frame rate wanders intact: a phone
 * that dropped from 30 to 24 fps halfway through has that written into its frame
 * times, and reading them off the gaps carries it across. The last frame has no
 * next one, so it gets whatever is left of the track's declared duration, or the
 * usual gap when that would be nonsense.
 *
 * @param {object} video  the demuxed video track
 * @returns {{position: Int32Array, pts: Float64Array, duration: Float64Array,
 *            totalTicks: number}}
 *   `position` is by decode index: where that frame sits in display order. `pts`
 *   and `duration` are by decode index too, in the track's own ticks, with `pts`
 *   moved so the first frame shown starts at zero.
 */
export function displayTimes(video) {
  const samples = video.samples;
  const count = samples.length;

  const order = Array.from({ length: count }, (unused, i) => i);
  order.sort((a, b) => samples[a].pts - samples[b].pts || a - b);

  const position = new Int32Array(count);
  for (let k = 0; k < count; k++) position[order[k]] = k;

  const base = count ? samples[order[0]].pts : 0;
  const pts = new Float64Array(count);
  const duration = new Float64Array(count);

  for (let k = 0; k < count; k++) pts[order[k]] = samples[order[k]].pts - base;
  for (let k = 0; k < count - 1; k++) {
    duration[order[k]] = Math.max(1, pts[order[k + 1]] - pts[order[k]]);
  }

  if (count) {
    const last = order[count - 1];
    const declared = video.duration - pts[last];
    duration[last] = declared >= 1 ? declared : usualGap(order, duration);
  }

  const totalTicks = count ? pts[order[count - 1]] + duration[order[count - 1]] : 0;
  return { position, pts, duration, totalTicks };
}

/** The typical gap between two frames, for the one frame that has no next one. */
function usualGap(order, duration) {
  if (order.length < 2) return 1;
  const gaps = [];
  for (let k = 0; k < order.length - 1; k++) gaps.push(duration[order[k]]);
  gaps.sort((a, b) => a - b);
  return Math.max(1, gaps[gaps.length >> 1]);
}

/**
 * The same frames, on the clock they will be written out on.
 *
 * A reversal keeps every frame and every frame's own duration; all that changes
 * is the order. So the frame shown last starts the output, the frame shown first
 * ends it, and the file that comes out is exactly as long as the one that went
 * in - down to the tick, uneven frame times included.
 *
 * @returns {{start: Float64Array, duration: Float64Array, totalTicks: number}}
 *   `start` and `duration` are by decode index, in the track's own ticks.
 */
export function reversedTimes(video) {
  const { pts, duration, totalTicks } = displayTimes(video);
  const start = new Float64Array(pts.length);
  for (let i = 0; i < pts.length; i++) start[i] = totalTicks - pts[i] - duration[i];
  return { start, duration, totalTicks };
}

/**
 * The groups the file has to be decoded in, in decode order.
 *
 * Each one begins at a keyframe and runs to the frame before the next keyframe,
 * which makes it the shortest run of the file that can be decoded without
 * anything in front of it.
 *
 * A file whose first sample is not a keyframe still gets a first group here.
 * There is nothing better to do with those frames - they cannot be decoded on
 * their own and there is nothing earlier to decode them from - and dropping them
 * silently would lose the beginning of the clip, which in a reversal is the end.
 *
 * @returns {{from: number, to: number}[]} inclusive decode-index ranges
 */
export function gopRanges(samples) {
  const groups = [];
  for (let i = 0; i < samples.length; i++) {
    if (i === 0 || samples[i].isKey) groups.push({ from: i, to: i });
    else groups[groups.length - 1].to = i;
  }
  return groups;
}

/**
 * How many decoded frames may be held at once.
 *
 * Reversing means holding a run of them: they arrive in one order and leave in
 * the other, so the last one out cannot be encoded until the first one in has
 * arrived. A decoded 4K frame is around 12 MB and a group of pictures can be
 * several hundred frames long, which is how a reversal that holds a whole group
 * at a time runs a browser out of memory on exactly the files people most want
 * to reverse.
 *
 * So the run is capped by bytes rather than by frames, and a group longer than
 * the cap is decoded more than once - see `frameWindows`.
 */
export function windowLimit(width, height, budgetBytes = 384 << 20, bytesPerPixel = 1.5) {
  // 1.5 is 4:2:0, which is what a decoder hands back when it hands back pixels
  // at all. A frame that only exists on the GPU has to be held as a bitmap
  // instead, and the caller passes what that costs.
  const perFrame = Math.max(1, width * height * bytesPerPixel);
  return Math.max(4, Math.min(600, Math.floor(budgetBytes / perFrame)));
}

/**
 * Split a group of `count` frames into runs of at most `limit`, last run first.
 *
 * The last run comes first because that is the order they are wanted in: the end
 * of the group is the start of the reversed output. Each run costs one decode of
 * the group from its keyframe up to the end of that run, and the frames in front
 * of it are dropped as they arrive - which is the price of not holding the whole
 * group in memory, and it is only paid by groups long enough to need it.
 *
 * @returns {{from: number, to: number}[]} inclusive positions within the group
 */
export function frameWindows(count, limit) {
  const windows = [];
  const size = Math.max(1, limit);
  for (let end = count - 1; end >= 0; end -= size) {
    windows.push({ from: Math.max(0, end - size + 1), to: end });
  }
  return windows;
}

/**
 * Give each written sample the gap to the next one as its duration.
 *
 * The encoder is told when each frame is shown and says nothing about how long
 * for, so the durations in the finished file come from the gaps between one
 * frame and the next - which is also what carries an uneven frame rate across,
 * since an uneven rate is exactly a set of uneven gaps. The last sample has no
 * next one and keeps whatever `tailDuration` it arrived with.
 *
 * @param {{dts: number, tailDuration: number}[]} samples  sorted by dts
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
 * Frames per second, averaged over the whole track.
 *
 * Only ever used to choose an encoder configuration and to describe the file on
 * the page. The frame times themselves are never averaged: they are carried
 * across one by one by `reversedTimes`.
 */
export function averageFps(video) {
  const seconds = video.duration / video.timescale;
  if (!seconds) return 30;
  return Math.min(240, Math.max(1, video.samples.length / seconds));
}

/** The output frame size: the picture as watched, rounded to what H.264 can store. */
export function outputSize(video) {
  return {
    width: Math.max(2, Math.floor(video.displayWidth / 2) * 2),
    height: Math.max(2, Math.floor(video.displayHeight / 2) * 2),
  };
}
