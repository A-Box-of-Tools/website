/**
 * A sound the page makes itself, and the buzz that goes with it.
 *
 * WHY THE SOUND IS MADE HERE AND NOT PLAYED FROM A FILE
 *
 * A beep kept as an audio file would be a request a tool made while it was
 * being used, on a site whose whole argument is that its tools make none. Two
 * notes from an oscillator are arithmetic the browser already knows how to
 * do: there is no file, so there is no request, no `media-src` to add to the
 * Content-Security-Policy and nothing for the service worker to keep. It
 * sounds the same with the network unplugged, which is the test these pages
 * invite.
 *
 * It is output only. Nothing here asks for a microphone, and a context that
 * plays two notes cannot hear anything.
 *
 * WHY IT IS ARMED BEFORE IT IS NEEDED
 *
 * A browser lets a page make a sound only once the visitor has touched it,
 * and the context has to be started inside that touch. What the sound is for
 * happens later - a code is read seconds on, something moves in a camera view
 * an hour on - from a frame callback or a timer no browser counts as a
 * gesture, so a context created then would stay suspended and the first sound
 * would be silence. `arm()` is therefore called from the tap that turns the
 * thing on, before anything is awaited, and `play()` only ever uses a context
 * that is already running. One that is not is asked to resume and this
 * occasion goes without its sound: a beep that arrives whenever the browser
 * relents is worse than none, because by then it is about nothing.
 *
 * WHY THIS IS NEVER THE ONLY SIGNAL
 *
 * A phone with its sound switched off is silent here too, which is right, and
 * Safari gives a page no way to vibrate. So the caller says the same thing on
 * the screen at the same moment, and this module is the half that may be
 * missing.
 *
 * WHO USES IT
 *
 * qr-barcode-reader, for a code its camera has read, with the notes below.
 * remote-camera, for motion or sound in a view somebody may have stopped
 * looking at, with a lower and longer pair of its own: an answer to "did that
 * scan?" and a call from across the room are not the same sound. share-tab,
 * walkie-talkie and voice-oncall, for a request to join, with the falling
 * pair peer-request-signal.js keeps and plays for them. It began as the
 * reader's own module and moved here when the second tool needed it.
 */

/**
 * Two notes, the second a fourth above the first: the shape of "yes" at every
 * till. High enough for a phone's small speaker to carry them, and over in a
 * fifth of a second.
 */
const NOTES = [
  { hertz: 1319, starts: 0, lasts: 0.07 },
  { hertz: 1760, starts: 0.08, lasts: 0.13 },
];

/** How loud a note is while it is held, where 1 is as loud as the device goes. */
const LOUDEST = 0.25;

/** How long a note takes to arrive and to leave, in seconds. */
const FADE_IN = 0.008;
const FADE_OUT = 0.03;

/** How long the buzz lasts, in milliseconds. */
const BUZZ_MS = 60;

/**
 * Schedule the notes on a context, starting at `at`.
 *
 * Each note is faded in, held, and faded out. An oscillator switched on and
 * off at full level starts and ends on a step, and a step is a click: the
 * visitor would hear two ticks with a tone between them.
 *
 * The hold is the part that is heard. The first version of this ramped
 * straight down from the peak, exponentially, and rendered as two notes that
 * had each lost five sixths of their level within fifteen milliseconds - the
 * right pitches, and all but inaudible over a shop.
 *
 * @param {BaseAudioContext} context  a live one, or an offline one to render into
 * @param {number} [at]  context time, in seconds
 * @param {{hertz: number, starts: number, lasts: number}[]} [notes]  each
 *   one's pitch, when it starts after `at` and how long it lasts, in seconds
 */
export function ring(context, at = context.currentTime, notes = NOTES) {
  for (const note of notes) {
    const from = at + note.starts;
    const until = from + note.lasts;
    const oscillator = context.createOscillator();
    const level = context.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(note.hertz, from);
    level.gain.setValueAtTime(0, from);
    level.gain.linearRampToValueAtTime(LOUDEST, from + FADE_IN);
    level.gain.setValueAtTime(LOUDEST, until - FADE_OUT);
    level.gain.linearRampToValueAtTime(0, until);

    // Two calls rather than one chained: the prefixed context old Safari has
    // returns nothing from connect().
    oscillator.connect(level);
    level.connect(context.destination);
    oscillator.start(from);
    oscillator.stop(until + 0.02);
  }
}

/**
 * Own the one context this page makes a sound with.
 *
 * @param {object} [options]
 * @param {typeof AudioContext} [options.AudioContext]
 * @param {(pattern: number|number[]) => unknown} [options.vibrate]
 * @param {{hertz: number, starts: number, lasts: number}[]} [options.notes]
 *   what `play()` sounds like, for a tool that is not saying "yes"
 * @param {number|number[]} [options.buzz]  what `play()` feels like: one
 *   length in milliseconds, or lengths of buzz and pause turn about
 */
export function createChime({
  AudioContext = globalThis.AudioContext ?? globalThis.webkitAudioContext,
  vibrate = (pattern) => globalThis.navigator?.vibrate?.(pattern),
  notes = NOTES,
  buzz = BUZZ_MS,
} = {}) {
  let context = null;

  /** Ask a suspended context to start, and never mind the answer. */
  const wake = () => {
    try {
      // A promise in every current browser, and nothing at all in an old
      // prefixed one.
      Promise.resolve(context.resume?.()).catch(() => {});
    } catch {
      // A context that will not resume is a silent one, which is survivable.
    }
  };

  return {
    /**
     * Get ready to make a sound. Call it from inside a tap, and call it again
     * from any later one: a context the system interrupted - a phone call, a
     * permission sheet - comes back only when it is asked to from a gesture.
     */
    arm() {
      if (typeof AudioContext !== 'function') return;
      try {
        if (!context || context.state === 'closed') context = new AudioContext();
      } catch {
        // Some browsers ration contexts. No sound is not a failure here.
        context = null;
        return;
      }
      wake();
    },

    /**
     * One occasion: the buzz, and the notes if a context is running.
     *
     * @returns {boolean}  whether the notes were scheduled
     */
    play() {
      try {
        vibrate(buzz);
      } catch {
        // A refusal to vibrate takes nothing else down with it.
      }

      if (!context) return false;
      if (context.state !== 'running') {
        wake();
        return false;
      }
      try {
        ring(context, context.currentTime, notes);
        return true;
      } catch {
        return false;
      }
    },

    /** Let the audio device go. The next `arm()` makes a new context. */
    release() {
      const closing = context;
      context = null;
      try {
        Promise.resolve(closing?.close?.()).catch(() => {});
      } catch {
        // Already closed, or never opened.
      }
    },
  };
}
