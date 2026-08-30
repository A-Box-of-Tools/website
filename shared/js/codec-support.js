/**
 * Asking a browser what it can encode, with a deadline on the answer.
 *
 * WHY THERE IS A DEADLINE
 *
 * `VideoEncoder.isConfigSupported` is specified to return a promise, and every
 * browser that implements the class is expected to settle it. One does not.
 * On the WebKit build this site's QA suite runs against, the promise from
 * `VideoEncoder.isConfigSupported` is still pending two minutes later, while
 * `VideoDecoder.isConfigSupported` on the same build answers immediately -
 * which is how video-to-gif works there and everything that encodes did not.
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
 * is not to hurry a slow machine - it is to end a wait that has no end.
 */
const PATIENCE = 2000;

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
