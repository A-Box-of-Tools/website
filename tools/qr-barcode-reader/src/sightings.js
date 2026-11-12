/**
 * Which of the camera's reads are worth saying anything about.
 *
 * The camera examines a frame about eight times a second, so a code held in
 * front of it is read eight times a second for as long as it stays there. The
 * page has to say so once. A beep per frame is a buzzer, and a reader that
 * stays silent the second time somebody shows it the same code looks exactly
 * like one that has stopped working.
 *
 * So every read is one of three things:
 *
 *   first   this camera session has not seen the code before
 *   back    it has, and somebody took the code away and has shown it again
 *   still   it has not left: nothing to say
 *
 * What separates the last two is how long the code was out of sight, and how
 * long that has to be depends on what the camera did in the meantime.
 *
 * If it read nothing else, the gap has to be a long one. A code held still
 * under poor light is missed for several frames between reads, and each of
 * those gaps would otherwise count as leaving and coming back.
 *
 * If it read a different code, a much shorter gap will do, because then the
 * page is no longer naming the code in front of the camera: the last thing it
 * announced was the other one. The gap cannot be nothing at all, though. Two
 * codes in one frame - a sheet of them, mid-way between one and the next -
 * are read turn and turn about, a fraction of a second apart, and that is one
 * picture rather than somebody switching eight times a second.
 *
 * Nothing here knows what a code is. It is handed a key and a clock reading,
 * which is also what lets the tests run it without a camera or a second of
 * waiting.
 */

/**
 * @param {object} [options]
 * @param {number} [options.awayMs]  out of sight this long is a return,
 *   whatever happened in between
 * @param {number} [options.swapMs]  out of sight this long is a return if a
 *   different code was announced in between
 * @param {number} [options.most]  how many codes are remembered
 */
export function sightings({ awayMs = 2000, swapMs = 800, most = 20 } = {}) {
  /** Code -> when it was last read. A Map keeps insertion order, so the
      first key is always the one seen longest ago. */
  const last = new Map();
  /** The code the page last said something about. */
  let named = null;

  return {
    /**
     * Record a read, and say which of the three it was.
     *
     * @param {string} key  what identifies the code
     * @param {number} now  any clock that only runs forward, in milliseconds
     * @returns {'first'|'back'|'still'}
     */
    note(key, now) {
      const before = last.get(key);
      // Deleted first so that setting it again moves it to the end.
      last.delete(key);
      last.set(key, now);
      for (const oldest of last.keys()) {
        if (last.size <= most) break;
        last.delete(oldest);
      }

      let what = 'still';
      if (before === undefined) what = 'first';
      else if (now - before >= (key === named ? awayMs : swapMs)) what = 'back';

      if (what !== 'still') named = key;
      return what;
    },

    /** Start again, as a new camera session does. */
    forget() {
      last.clear();
      named = null;
    },
  };
}
