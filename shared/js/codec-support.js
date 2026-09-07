/**
 * Asking a browser what it can encode, with a deadline on the answer.
 *
 * WHY THERE IS A DEADLINE
 *
 * `VideoEncoder.isConfigSupported` is specified to return a promise, and every
 * browser that implements the class is expected to settle it. One does not.
 * On the WebKit build this site's QA suite runs against, the question never
 * comes back, while `VideoDecoder.isConfigSupported` on the same build answers
 * immediately - which is how video-to-gif works there and everything that
 * encodes did not.
 *
 * What "did not" looked like was worse than a refusal. `pickH264Codec` awaits
 * that promise inside a loop over nine candidate codec strings, so pressing
 * Create video started a wait that never ended: no progress bar, no error, no
 * second attempt, a button that had visibly been pressed and a page that never
 * said anything again. Every one of the five tools that encodes did this.
 *
 * A capability question is not work. Nothing is being encoded while it is
 * outstanding, and a browser that cannot say within two seconds whether it
 * supports H.264 Baseline at 320x240 is not a browser that was about to encode
 * any. So no answer is read as no, the tool falls through to whatever it does
 * when a codec is unavailable, and the visitor is told - which is the whole of
 * what these tools promise to do when they cannot do the work.
 *
 * WHY THE DEADLINE NEEDED A SECOND THREAD
 *
 * The first version of this raced the question against a `setTimeout` on the
 * same thread, which is sound against a promise that never settles and
 * useless against what actually happens. That build does not leave the promise
 * pending - it blocks the thread that asked, so the timer set to rescue it
 * never gets a turn. The deadline was there, correct, and unreachable; the
 * page still wedged on the click, and the QA suite went on watching a Create
 * video button that had not answered five minutes later.
 *
 * So the question goes to codec-probe.js, a worker, and the clock stays here.
 * A thread that is still running can hold a deadline over one that is not.
 * When the worker goes quiet the page ends the wait, terminates it, and the
 * tool says what it says when a codec is unavailable.
 *
 * Falling back matters as much as the worker does. A page that cannot start
 * one - a policy without worker-src, a browser with no Worker - must not
 * conclude from that that it cannot encode; it asks on its own thread
 * instead, exactly as this file used to. Which is why the worker announces
 * itself before any question is put to it: silence from a worker that never
 * started is not evidence about the browser's encoder.
 *
 * WHY THE THIRD ANSWER
 *
 * `null` means the browser did not reply, and it is worth telling apart from a
 * plain no. A caller walking a list of codecs should stop at the first silence
 * rather than pay the deadline nine times over: the silence was about the
 * browser, not about the codec string it was holding.
 */

/**
 * How long to wait for a browser to answer a question about itself.
 *
 * Generous. Chrome answers these in single-digit milliseconds, and the point
 * is not to hurry a slow machine - it is to end a wait that has no end. The
 * same figure bounds the worker's start, for the same reason.
 */
const PATIENCE = 2000;

/**
 * The classes a question can be about.
 *
 * A worker cannot be handed a class, so it is handed the name and looks the
 * class up for itself. Anything not on this list - a double a test passes in,
 * most usefully - is asked on this thread, because there is nothing the worker
 * could look up that would be the same object.
 */
const CLASSES = ['VideoEncoder', 'VideoDecoder', 'AudioEncoder', 'AudioDecoder'];

/** Which of those `codec` is, or null for anything else. */
function nameOf(codec) {
  return CLASSES.find((name) => globalThis[name] === codec) ?? null;
}

/** The worker, once one has started. */
let probe = null;

/** A promise for that worker, so a page starts at most one at a time. */
let started = null;

/** The questions outstanding on it, by id, and how many have been asked. */
const waiting = new Map();
let asked = 0;

/**
 * The classes whose question has already stopped a thread.
 *
 * Once a browser has failed to answer about H.264 it will fail again, and a
 * second attempt costs another worker and another deadline to learn what the
 * first one established. Remembered by class rather than for the whole page,
 * because a build that blocks on the encoder still answers about the decoder
 * and there is no reason to stop asking it.
 */
const wedged = new Set();

/** Start one, or answer null for a page where no worker can run. */
function startProbe(ms) {
  return new Promise((resolve) => {
    let worker;
    try {
      worker = new Worker(new URL('./codec-probe.js', import.meta.url), { type: 'module' });
    } catch {
      resolve(null);
      return;
    }

    // A worker that cannot load says so here rather than at construction, and
    // until it does it looks exactly like one that is slow to start - hence
    // the deadline as well as the handler.
    let timer;
    const giveUp = () => {
      clearTimeout(timer);
      worker.terminate();
      resolve(null);
    };
    timer = setTimeout(giveUp, ms);
    worker.addEventListener('error', giveUp);

    worker.addEventListener('message', ({ data }) => {
      if (data && data.ready) {
        clearTimeout(timer);
        probe = worker;
        resolve(worker);
        return;
      }
      const settle = waiting.get(data && data.id);
      if (settle) {
        waiting.delete(data.id);
        settle(data);
      }
    });
  });
}

/** The started worker, or null once it is known there will not be one. */
function theProbe(ms) {
  if (!started) started = startProbe(ms);
  return started;
}

/**
 * Stop waiting on a thread that has stopped answering.
 *
 * Terminated rather than left alone: it is holding a question that will never
 * come back, and every later question would queue behind that one. The next
 * caller starts a fresh worker, which is worth doing - the class that wedged
 * is remembered separately and will not be asked again.
 */
function forgetProbe() {
  if (probe) probe.terminate();
  probe = null;
  started = null;
  waiting.clear();
}

/**
 * Start over: no worker, no memory of one, nothing wedged.
 *
 * For the tests. A module-level worker is otherwise remembered for the life of
 * the process, so one case's wedged encoder would decide the next case's
 * answer.
 */
export function forgetTheBrowser() {
  forgetProbe();
  wedged.clear();
}

/** Put one question to the worker, and take silence for an answer. */
function put(worker, message, ms) {
  return new Promise((resolve) => {
    let timer;
    waiting.set(message.id, (data) => {
      clearTimeout(timer);
      resolve(data);
    });
    timer = setTimeout(() => {
      waiting.delete(message.id);
      resolve(null);
    }, ms);
    worker.postMessage(message);
  });
}

/**
 * Ask on this thread, which is what a page does when no worker can answer.
 *
 * The deadline is honest here and unenforceable against the one build this was
 * written for - a `setTimeout` cannot fire on a thread that is blocked. It is
 * still right to keep: this path is reached on browsers that have no Worker
 * rather than on the one that wedges, and a promise that merely never settles
 * is bounded by it.
 */
async function askHere(codec, config, ms) {
  let timer;
  const silence = Symbol('no answer');
  try {
    const answer = await Promise.race([
      codec.isConfigSupported(config),
      new Promise((resolve) => { timer = setTimeout(() => resolve(silence), ms); }),
    ]);
    if (answer === silence) return null;
    return Boolean(answer && answer.supported);
  } catch {
    // A codec string this browser cannot even parse, or a class that threw
    // rather than rejecting. Not supported, and not silence either: the
    // browser did answer, in its own way.
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Ask a WebCodecs class whether it supports a configuration.
 *
 * @param {{isConfigSupported?: (config: object) => Promise<{supported?: boolean}>}} codec
 *        `VideoEncoder`, `VideoDecoder`, `AudioEncoder` or `AudioDecoder`.
 * @param {object} config  the configuration to ask about
 * @param {number} [ms]    how long to wait before giving up
 * @returns {Promise<boolean|null>} true, false, or null for no answer in time
 */
export async function askSupported(codec, config, ms = PATIENCE) {
  if (typeof codec?.isConfigSupported !== 'function') return false;

  const name = nameOf(codec);
  if (name === null) return askHere(codec, config, ms);
  if (wedged.has(name)) return null;

  const worker = await theProbe(ms);
  if (!worker) return askHere(codec, config, ms);

  asked += 1;
  const reply = await put(worker, { id: asked, name, config }, ms);

  if (reply === null) {
    wedged.add(name);
    forgetProbe();
    return null;
  }
  // The worker has the deadline but not the class. Nothing has been learned
  // about the browser yet, so the page asks with the object it does have.
  if (reply.absent) return askHere(codec, config, ms);
  return reply.supported;
}
