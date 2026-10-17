/**
 * A capability query must not leave an export waiting forever. VideoEncoder
 * can block synchronously on WebKit (#317), so its queries run in a disposable
 * same-origin worker with the deadline on the page's thread. A timer racing a
 * promise on the blocked thread cannot help. This isolates a stuck query, not
 * a crash of the browser process that owns both the page and its worker.
 */

/**
 * How long to wait for a browser to answer a question about itself.
 *
 * Generous. Chrome answers these in single-digit milliseconds, and the point
 * is not to hurry a slow machine - it is to end a wait that has no end.
 */
const PATIENCE = 2000;

const CODECS = new Set(['VideoEncoder', 'VideoDecoder', 'AudioEncoder', 'AudioDecoder']);

/**
 * Ask about an ordered batch in one worker, under one deadline. Only plain
 * configurations cross the boundary; constructors cannot be cloned. Buffers
 * are cloned rather than transferred so callers retain their decoder data.
 *
 * @param {string} codec a WebCodecs class name
 * @param {object[]} configs configurations in preference order
 * @param {number} [ms] deadline including worker startup
 * @returns {Promise<number|null>} first supported index, -1 for none, null if
 *          no trustworthy answer arrived; never retry on the page's thread
 */
export function firstSupported(codec, configs, ms = PATIENCE) {
  if (!CODECS.has(codec) || !Array.isArray(configs)) return Promise.resolve(null);
  if (!configs.length) return Promise.resolve(-1);
  if (typeof Worker !== 'function' || !Number.isFinite(ms) || ms <= 0) return Promise.resolve(null);

  return new Promise((resolve) => {
    let worker;
    let settled = false;
    const deadline = performance.now() + ms;
    const finish = (answer) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (worker) {
        worker.onmessage = null;
        worker.onerror = null;
        worker.onmessageerror = null;
        worker.terminate();
      }
      resolve(answer);
    };
    const timer = setTimeout(() => finish(null), ms);
    try {
      worker = new Worker(new URL('./codec-support-worker.js', import.meta.url), { type: 'module' });
      worker.onmessage = ({ data }) => {
        const index = data?.index;
        const valid = Number.isInteger(index) && index >= -1 && index < configs.length;
        finish(performance.now() < deadline && valid ? index : null);
      };
      worker.onerror = (event) => { event.preventDefault(); finish(null); };
      worker.onmessageerror = () => finish(null);
      worker.postMessage({ codec, configs });
    } catch {
      // Missing worker support, policy/load failures and uncloneable inputs
      // are not evidence of support. A later user retry gets a fresh worker.
      finish(null);
    }
  });
}

/**
 * Bound an asynchronous decoder/audio query. VideoEncoder callers must use
 * firstSupported instead: this timer cannot interrupt a synchronous block.
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
