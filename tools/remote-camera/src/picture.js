/**
 * Whether the picture is still arriving.
 *
 * WHY THIS IS ASKED AT ALL
 *
 * A camera view that has stopped looks exactly like a view of an empty room.
 * The element goes on showing its last frame and says nothing: no `stalled`,
 * no `waiting`, and in Chromium no `mute` on the track. With a microphone
 * shared its clock even keeps running, because the sound has not stopped. So
 * the page went on saying it was receiving live video for as long as the
 * connection held, which is the one thing somebody watching a door must not
 * be told when it is not true.
 *
 * Nothing has to fail for this to happen. A phone that locks pauses its
 * camera, and the peer connection, which is what session.js watches, stays
 * up. The camera cannot simply say so either: an older viewer page treats a
 * control message it does not know as a broken connection and leaves.
 *
 * WHAT IS COUNTED
 *
 * Frames decoded, which main.js already reads from the connection's
 * statistics once a second for the details panel. A camera sends frames
 * whether or not anything in front of it moves, so a count that has stood
 * still for `patienceMs` is a picture that is not arriving rather than a
 * picture of nothing happening.
 *
 * WHY A LATE READING STARTS THE WAIT AGAIN
 *
 * The readings come from a timer, and a page the browser has frozen, or one
 * main.js is not reading because it is hidden, takes none. The first reading
 * afterwards would find a count that "has not moved for a minute" when
 * nothing was looking for a minute, and the visitor would come back to a
 * warning that is withdrawn a second later. A reading that arrives late
 * therefore proves nothing about the time before it, and only restarts the
 * wait.
 *
 * Nothing here knows what a frame is. It is handed a count and a clock
 * reading, which is also what lets the tests run it without a camera or a
 * second of waiting.
 */

/**
 * @param {object} [options]
 * @param {number} [options.patienceMs]  a count that has not moved for this
 *   long is a picture that has stopped
 * @param {number} [options.gapMs]  readings further apart than this were not
 *   one watch
 */
export function pictureWatch({ patienceMs = 5000, gapMs = 3000 } = {}) {
  /** The last count read, or null before the first. */
  let count = null;
  /** When the count last moved, or the wait was last restarted. */
  let since = 0;
  /** When the last reading was taken. */
  let at = null;
  let stalled = false;

  return {
    /**
     * Take a reading, and say what it changed.
     *
     * @param {number} frames  frames decoded so far
     * @param {number} now  any clock that only runs forward, in milliseconds
     * @returns {'stalled'|'moving'|null}  null when the answer is what it was
     */
    read(frames, now) {
      const late = at !== null && (now - at > gapMs || now < at);
      at = now;

      // The first reading, or a counter that started again under a new
      // receiver: something to measure from, and no verdict either way.
      if (count === null || frames < count) {
        count = frames;
        since = now;
        return null;
      }

      if (frames > count) {
        count = frames;
        since = now;
        if (!stalled) return null;
        stalled = false;
        return 'moving';
      }

      if (late) since = now;
      // A count of nothing is a picture that has not started, and session.js
      // has its own deadline for that.
      if (stalled || count === 0 || now - since < patienceMs) return null;
      stalled = true;
      return 'stalled';
    },

    /** Start again, as a new connection does. */
    reset() {
      count = null;
      at = null;
      stalled = false;
    },
  };
}
