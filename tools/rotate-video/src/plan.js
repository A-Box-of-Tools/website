/**
 * What turning a video comes to, without the codecs: which way it is shown
 * now, which way it will be shown, and the nine numbers that say so.
 *
 * A phone that films sideways does not turn its pixels. It writes the frames
 * as the sensor saw them and puts a quarter turn in the track header - the
 * display matrix in `tkhd` - which every player applies on the way to the
 * screen. Turning a clip is therefore a change to that matrix and nothing
 * else: the frames stay exactly where they are, and a two-gigabyte file is
 * turned in the time it takes to read it. Everything here is pure so that it
 * runs in Node and is pinned by tests.
 */

/** The three turns offered, as degrees clockwise. */
export const TURNS = [90, 180, 270];

/** The picture's rotation after a turn, as the file will say it: 0, 90, 180 or 270. */
export function turned(rotation, turn) {
  return (((rotation + turn) % 360) + 360) % 360;
}

/**
 * The display matrix that shows a stored frame turned by `rotation` degrees
 * clockwise, as the 36 bytes `tkhd` holds it: nine 16.16 fixed-point numbers
 * {a b u, c d v, x y w}, mapping a stored point (p, q) to
 * (a p + c q + x, b p + d q + y). The translation keeps the turned picture
 * in the positive quadrant, which is what players expect and what phones
 * write; a matrix without it shows a black frame in some of them.
 *
 * The same four numbers the MP4 reader turns back into a rotation, so a
 * file written here reads back as what it was asked for. The reader's test
 * pins that.
 */
export function rotationMatrix(rotation, codedWidth, codedHeight) {
  const rows = {
    0: [1, 0, 0, 1, 0, 0],
    90: [0, 1, -1, 0, codedHeight, 0],
    180: [-1, 0, 0, -1, codedWidth, codedHeight],
    270: [0, -1, 1, 0, 0, codedWidth],
  }[rotation];
  if (!rows) throw new Error('rotate.badturn');
  const [a, b, c, d, x, y] = rows;
  const out = new Uint8Array(36);
  const view = new DataView(out.buffer);
  const fixed = (n) => Math.round(n * 65536);
  view.setInt32(0, fixed(a));
  view.setInt32(4, fixed(b));
  view.setInt32(8, 0);
  view.setInt32(12, fixed(c));
  view.setInt32(16, fixed(d));
  view.setInt32(20, 0);
  view.setInt32(24, fixed(x));
  view.setInt32(28, fixed(y));
  view.setInt32(32, 0x40000000);   // w = 1.0, in 2.30 fixed point
  return out;
}

/**
 * The size the picture is shown at once it is rotated: the stored frame's
 * own size, or that turned on its side. It is what the page says and what
 * the check reads back; it is not what goes into the header, whose width
 * and height stay the stored size the way a phone writes them, because the
 * matrix is what does the turning.
 */
export function shownSize({ codedWidth, codedHeight }, rotation) {
  const turnedOnSide = rotation === 90 || rotation === 270;
  return turnedOnSide
    ? { width: codedHeight, height: codedWidth }
    : { width: codedWidth, height: codedHeight };
}

/**
 * Whether the frames can go across untouched, which is the whole point.
 *
 * An MP4 or MOV hands over its sample entry whole, so any codec it holds
 * can be copied - the header changes and the frames do not. A Matroska
 * file has no entry, and one can be built only for H.264; anything else
 * inside a WebM or MKV has to be drawn turned and encoded again.
 */
export function canCopy(video) {
  if (video.sampleEntry) return true;
  return Boolean(video.description) && /^avc[13]\./.test(video.codec ?? '');
}

/** Bits per pixel per frame the baked-in path is held between. */
const BPP_FLOOR = 0.06;
const BPP_CEILING = 0.25;
const MAX_BITRATE = 40_000_000;

/**
 * What a re-encode is asked for: a fifth more than the source spent, since
 * a second generation of H.264 wants a little room to say the same thing,
 * held between a floor and a ceiling per pixel.
 */
export function bakeBitrate({ width, height, fps, sourceBitrate }) {
  const pixelsPerSecond = width * height * Math.max(1, fps);
  const asked = (sourceBitrate || 0) * 1.2;
  const floor = pixelsPerSecond * BPP_FLOOR;
  const ceiling = pixelsPerSecond * BPP_CEILING;
  const chosen = Math.min(MAX_BITRATE, Math.max(floor, Math.min(ceiling, asked)));
  return Math.max(1000, Math.round(chosen / 1000) * 1000);
}

/** The longest edge H.264 encoders can be relied on to take. */
const MAX_EDGE = 3840;

/** The frame a bake is drawn into: the shown size, even, and no wider than an encoder takes. */
export function bakeFrame({ width, height }) {
  let w = width;
  let h = height;
  const long = Math.max(w, h);
  if (long > MAX_EDGE) {
    const scale = MAX_EDGE / long;
    w = Math.round(w * scale);
    h = Math.round(h * scale);
  }
  return { width: Math.max(2, w - (w % 2)), height: Math.max(2, h - (h % 2)) };
}
