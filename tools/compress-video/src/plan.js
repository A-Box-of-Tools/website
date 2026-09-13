/**
 * Turning "make it 25 MB" into a frame size and a bitrate.
 *
 * This is the whole of what the page decides before the encoder starts, and
 * it is arithmetic on numbers the demuxer already handed over, so it lives
 * here where it can be tested without a browser and shown on the page before
 * a frame is decoded: the estimate under the target box is this file's
 * answer, and the encoder is then asked for exactly that.
 *
 * THE BUDGET
 *
 * A file of a given size has room for a fixed number of bits. The sound is
 * copied as it is, so it takes what it took; the container takes a little
 * for its tables; what is left, spread over the length of the clip, is the
 * bitrate the picture can have. The encoder is asked for slightly less than
 * that, because an encoder lands near a bitrate rather than on it, and a
 * file that comes out at 25.4 MB when 25 was the point is a file that still
 * will not send.
 *
 * THE LADDER
 *
 * A bitrate is only worth something relative to how many pixels it has to
 * paint. Two megabits a second is generous at 720p and mud at 4K, so once
 * the budget is known the frame is shrunk until each pixel of each frame
 * gets enough bits to look like a picture - down a ladder of the sizes
 * people recognise, never up. The floor below is where H.264 on real footage
 * stops looking like footage; it is a judgement, and it is written down as
 * one number so that it can be argued with.
 */

/** A megabyte, as the page counts it: the binary one the site's own size
 *  formatter uses, so the number in the box and the size under it agree. */
export const MB = 1024 * 1024;

/** Presets, in bytes. The first three are the limits people actually hit -
 *  a chat app's free tier, an email attachment, a form upload. */
export const PRESETS = [8, 16, 25, 50, 100].map((mb) => mb * MB);

/** Long edges of the frame sizes the picture may shrink to. A source smaller
 *  than a rung is never enlarged to reach it. */
export const LADDER = [3840, 2560, 1920, 1280, 960, 854, 640, 480];

/** Bits per pixel per frame under which a rung is not worth its pixels. */
const BPP_FLOOR = 0.045;

/** What the encoder is asked for, as a fraction of what the budget allows. */
const SAFETY = 0.94;

/** The least the picture is ever asked to spend, in bits per second. Below
 *  this the result is not a video of anything. */
export const MIN_BITRATE = 150_000;

/** Bytes the container spends on its tables, per sample and in all. */
const TABLE_BYTES_PER_SAMPLE = 20;
const HEADER_BYTES = 4096;

/**
 * @typedef {object} Source  what the page knows about the clip
 * @property {number} seconds
 * @property {number} fps
 * @property {number} displayWidth  after rotation
 * @property {number} displayHeight
 * @property {number} videoBytes  the picture track's samples, in all
 * @property {number} audioBytes  the sound track's samples, or 0
 * @property {number} samples  how many samples the two tracks hold together
 */

/** How much of the target the sound and the container will take. */
export function fixedBytes(source, keepAudio) {
  return (keepAudio ? source.audioBytes : 0)
    + HEADER_BYTES + source.samples * TABLE_BYTES_PER_SAMPLE;
}

/**
 * The bitrate the picture can have inside `targetBytes`, or null when the
 * sound and the tables alone would not fit.
 *
 * @param {Source} source
 * @param {number} targetBytes
 * @param {boolean} keepAudio
 * @returns {number|null}  bits per second
 */
export function videoBitrate(source, targetBytes, keepAudio) {
  const room = targetBytes - fixedBytes(source, keepAudio);
  if (room <= 0 || source.seconds <= 0) return null;
  const rate = (room * 8 / source.seconds) * SAFETY;
  return rate < MIN_BITRATE ? null : Math.round(rate);
}

/**
 * The frame size the budget can afford, keeping the picture's shape.
 *
 * @param {Source} source
 * @param {number} bitrate  bits per second
 * @param {number|null} [longEdge]  a rung the visitor chose, or null for auto
 * @returns {{width: number, height: number, longEdge: number, auto: boolean}}
 */
export function chooseFrame(source, bitrate, longEdge = null) {
  const sourceLong = Math.max(source.displayWidth, source.displayHeight);
  const rungs = LADDER.filter((edge) => edge <= sourceLong);
  if (!rungs.length || rungs[0] < sourceLong) rungs.unshift(sourceLong);

  let chosen = rungs[rungs.length - 1];
  let auto = true;
  if (longEdge) {
    chosen = Math.min(longEdge, sourceLong);
    auto = false;
  } else {
    // The largest rung whose pixels the bitrate can afford; the smallest if
    // none can, because a small clear picture beats a large smeared one.
    for (const edge of rungs) {
      const { width, height } = fit(source, edge);
      if (bitrate / (width * height * source.fps) >= BPP_FLOOR) {
        chosen = edge;
        break;
      }
    }
  }

  return { ...fit(source, chosen), longEdge: chosen, auto };
}

/** The source's shape at a long edge, in the even numbers H.264 wants. */
export function fit(source, longEdge) {
  const sourceLong = Math.max(source.displayWidth, source.displayHeight);
  const scale = Math.min(1, longEdge / sourceLong);
  const even = (n) => Math.max(2, Math.round((n * scale) / 2) * 2);
  return { width: even(source.displayWidth), height: even(source.displayHeight) };
}

/**
 * Everything the page needs to say before it starts, or the reason it
 * cannot.
 *
 * @param {Source} source
 * @param {{targetBytes: number, keepAudio: boolean, longEdge: number|null}} choice
 * @returns {{ok: true, bitrate: number, frame: object, estimate: number}
 *   |{ok: false, reason: 'already'|'nofit'|'toosmall', least: number}}
 */
export function plan(source, { targetBytes, keepAudio, longEdge }) {
  const bitrate = videoBitrate(source, targetBytes, keepAudio);
  if (bitrate === null) {
    // What the sound and the least watchable picture would need together,
    // so the page can say what target would work rather than only "no".
    const least = fixedBytes(source, keepAudio) + Math.ceil(MIN_BITRATE * source.seconds / 8 / SAFETY);
    return { ok: false, reason: keepAudio && source.audioBytes ? 'nofit' : 'toosmall', least };
  }
  const frame = chooseFrame(source, bitrate, longEdge);
  return {
    ok: true,
    bitrate,
    frame,
    // What the file should come out at: the bitrate asked for, over the
    // length, plus what the sound and the tables take. Under the target by
    // the safety margin, which is the point of the margin.
    estimate: Math.round(bitrate * source.seconds / 8) + fixedBytes(source, keepAudio),
  };
}

/**
 * The bitrate for a second attempt, from how far the first one missed.
 *
 * An encoder that overshot by ten per cent is asked for ten per cent less,
 * and a little more than that, so that two passes are enough.
 *
 * @param {number} bitrate  what was asked for
 * @param {number} actualBytes  what came out
 * @param {number} targetBytes
 * @param {number} fixed  from fixedBytes
 * @returns {number}
 */
export function retune(bitrate, actualBytes, targetBytes, fixed) {
  const spent = Math.max(1, actualBytes - fixed);
  const allowed = Math.max(1, targetBytes - fixed);
  return Math.max(MIN_BITRATE, Math.round(bitrate * (allowed / spent) * 0.96));
}

/** Half or a quarter of the source, as a target in bytes. */
export function fractionOf(sourceBytes, fraction) {
  return Math.max(1, Math.round(sourceBytes * fraction));
}
