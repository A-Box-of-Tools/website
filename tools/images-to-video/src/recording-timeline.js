/**
 * The real-time recorder follows the same resolved seconds as the summary.
 * A one-frame hold can be shorter than the slideshow's minimum seconds value;
 * imposing that minimum again would change the speed of an image sequence.
 */

export function recordingTimeline(items) {
  const boundaries = [];
  let totalSeconds = 0;
  for (const item of items) {
    totalSeconds += item.duration;
    boundaries.push(totalSeconds);
  }
  return { boundaries, totalSeconds };
}

/** Find the picture the clock needs, including when a late tick skips several. */
export function recordingIndex(boundaries, elapsed) {
  let first = 0;
  let last = boundaries.length;
  while (first < last) {
    const middle = Math.floor((first + last) / 2);
    if (elapsed < boundaries[middle]) last = middle;
    else first = middle + 1;
  }
  return Math.min(first, boundaries.length - 1);
}
