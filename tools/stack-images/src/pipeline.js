/**
 * The run: files in, one stacked picture out.
 *
 * This is the only module that touches a decoder or a canvas, and it is written
 * to be run inside a worker - see worker.js, and see the tool's README for why
 * this is the first tool here that has one. Nothing in it touches the document,
 * so it also runs on the main thread unchanged, which is the fallback for a
 * browser without OffscreenCanvas.
 *
 * THE SHAPE OF A RUN
 *
 *   open      each file is identified, and a RAW file is reduced to the byte
 *             range of the preview inside it. Kilobytes are read, not files
 *   survey    every frame is decoded once, small, for its thumbnail and for the
 *             luma square the alignment works on
 *   measure   each frame is correlated against the first to find how it moved.
 *             This answer is coarse - it was read in a small square and
 *             multiplied up, sub-pixel error and all - and is finished during
 *             the stack, where each frame's first full-size decode is already
 *             in hand and a window of it can be correlated at output
 *             resolution, where sub-pixel error stays sub-pixel
 *   stack     the real work: bands, passes and frames, exactly as plan.js said
 *   encode    the accumulated picture is written out as PNG or JPEG
 *
 * WHY THE LOOP IS BANDS, THEN PASSES, THEN FRAMES
 *
 * Because that ordering makes the common case free and the hard case possible.
 * Almost every run is one band, and one band means the loop collapses to "read
 * each frame once", which is the tool's whole performance claim. A median of
 * twenty large frames cannot be one band - the frames will not fit at once - so
 * it becomes several, and the frames are read again for each. That is a real
 * cost and plan.js quotes it up front rather than discovering it here.
 *
 * A banded run also draws only the band it needs. The destination canvas is the
 * height of the band rather than of the picture, so the browser clips the draw
 * and neither the fill nor the readback pays for rows nobody is looking at.
 */

import { NO_MOVE, estimate, isMeasured, phaseCorrelate, window2d } from './align.js';
import {
  REFINE_INSET, bands, commonArea, outputSize, placement, planRun, refineWindow, workingSize,
} from './plan.js';
import { jpegOrientation, orientationMatrix, orientedSize } from './orient.js';
import { findPreview, jpegSize, looksRaw } from './raw.js';
import { MIN_INLIERS, consensus } from './similarity.js';
import { DEFAULT_RADIUS, createStack } from './stack.js';

/**
 * The square the alignment works in. A power of two because the transform needs
 * one, and 256 because the offset between two frames is a property of the
 * picture rather than of its resolution: measuring it here and multiplying up
 * is as accurate as measuring it at 6000 across, and about five hundred times
 * less work.
 */
export const ALIGN_SIZE = 256;

/**
 * How large the survey decode is. It is the picture the list shows, and it is
 * also what the coarse alignment square is built from, which is why it matches
 * ALIGN_SIZE rather than the hundred-odd pixels a list row needs: a 256 square
 * fed from a smaller decode holds less picture than its own area, and the
 * alignment can only be as good as what it is shown.
 */
const THUMB_SIZE = 256;

/** Anything at least this big is a picture worth stacking. */
const MIN_PREVIEW_PIXELS = 640 * 480;

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

class Cancelled extends Error {}

/* --------------------------------------------------------------- opening */

/**
 * The size a file declares, without decoding it.
 *
 * Worth the two readers it takes. The alternative is decoding every frame at
 * full size purely to find out how large it is, and then decoding it again to
 * actually use it - which on a set of twenty 24-megapixel frames is twenty
 * decodes thrown away. Anything neither of these recognises falls back to a
 * decode, so this is an optimisation rather than a restriction.
 *
 * For a JPEG the size returned is the ORIENTED one. The frame header says how
 * the rows are stored; the browser's decoder reads the Exif orientation and
 * hands back the picture turned upright, so a portrait phone photograph is
 * 3000 wide in the header and 3000 tall in the bitmap. Every consumer of this
 * number - the survey resize, the output box, the placement, the full-size
 * decode - is asking what the decode will be, so that is what it gets. The
 * orientation itself rides along (a value, null for none, undefined when the
 * head ended before it could be settled) for the caller that wants to know.
 */
export function declaredSize(bytes) {
  if (bytes.length > 24 && PNG_SIGNATURE.every((byte, i) => bytes[i] === byte)) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    // IHDR is always the first chunk: its length, its name, then the size.
    if (view.getUint32(12, false) === 0x49484452) {
      return { width: view.getUint32(16, false), height: view.getUint32(20, false) };
    }
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    const stored = jpegSize(bytes);
    if (!stored) return null;
    const orientation = jpegOrientation(bytes);
    return { ...orientedSize(stored.width, stored.height, orientation ?? 1), orientation };
  }
  return null;
}

/** An IFD0 orientation a camera could have written; anything else means upright. */
const validTurn = (value) => (value >= 1 && value <= 8 ? value : 1);

/**
 * How much of a RAW preview to read when 4 KB was not enough to tell whether
 * it carries an orientation of its own. The reader takes IFD0 from whatever
 * of the Exif block it has, so this path is reached only when something
 * longer than the head sits *before* the Exif block, or when the preview has
 * no Exif and a long segment before its frame header. Sixty-four kilobytes is
 * enough to reach an Exif block written at the front of the preview, which is
 * where every camera puts it; a preview whose Exif sits behind more than that
 * of other segments is treated as having none.
 */
const PREVIEW_HEAD_RETRY = 65536;

/**
 * What to decode for one chosen file.
 *
 * For an ordinary picture that is the file. For a RAW file it is a slice of the
 * file - the camera's own preview - and finding it costs a few reads of a few
 * kilobytes each. Either way the result is a Blob the browser's own decoder can
 * open, and at no point is a whole RAW file pulled into memory.
 *
 * Two fields describe which way up the frame is, and the rest of the pipeline
 * holds them apart. `width` and `height` are always the upright size. `turn`
 * is an EXIF orientation the pipeline must apply itself, 1 meaning none, and
 * `decoded` is the size of the bitmap the decoder will hand back - which is
 * the upright size when the browser does the turning and the stored size when
 * this code does. For an ordinary picture the browser always does: it reads
 * the file's own Exif. A RAW preview is the case that needs the second pair.
 * The orientation lives in the RAW's IFD0, where the decoder never looks, and
 * the preview JPEG usually carries no Exif of its own, so the sideways preview
 * arrives sideways and the turn has to be made here. When the preview *does*
 * carry Exif the browser applies that and the RAW's tag is left alone - two
 * turns would be one too many.
 */
export async function openFrame(file) {
  const read = async (offset, length) => new Uint8Array(
    await file.slice(offset, offset + length).arrayBuffer(),
  );

  const raw = looksRaw(file.name) ? await findPreview(read, file.size, MIN_PREVIEW_PIXELS) : null;
  if (raw) {
    let fromPreview = raw.previewOrientation;
    let bytesRead = raw.read;
    if (fromPreview === undefined) {
      // The 4 KB that confirmed the preview ended before its Exif block, or
      // before the frame header that would have said there is none. One
      // longer read settles it; still kilobytes, and only on this path.
      const more = Math.min(raw.length, PREVIEW_HEAD_RETRY);
      fromPreview = jpegOrientation(await read(raw.offset, more)) ?? null;
      bytesRead += more;
    }
    const turn = fromPreview === null ? validTurn(raw.orientation) : 1;
    // A preview found through a track or a RAF header, whose frame header
    // lay past the 4 KB head, arrives with no size at all; then there is no
    // upright size to give and no decoded one either, and the survey fills
    // both from the bitmap. A pair of nulls in `decoded` would not be filled,
    // and would ask the decoder for a 1 by 1 working size on every band.
    const known = Boolean(raw.width && raw.height);
    const upright = known ? orientedSize(raw.width, raw.height, fromPreview ?? turn) : null;
    let decoded = null;
    if (known) decoded = turn === 1 ? upright : { width: raw.width, height: raw.height };
    return {
      name: file.name,
      blob: file.slice(raw.offset, raw.offset + raw.length, 'image/jpeg'),
      width: upright?.width ?? null,
      height: upright?.height ?? null,
      turn,
      decoded,
      kind: 'raw',
      camera: [raw.make, raw.model].filter(Boolean).join(' ') || null,
      bytesRead,
      sourceBytes: file.size,
    };
  }

  // Not a RAW file, or one whose preview could not be found. Either way the
  // browser gets the file itself, which for a JPEG or a PNG is the right answer
  // and for an unreadable RAW is at least an honest failure.
  const head = new Uint8Array(await file.slice(0, 65536).arrayBuffer());
  const declared = declaredSize(head);
  return {
    name: file.name,
    blob: file,
    width: declared?.width ?? null,
    height: declared?.height ?? null,
    turn: 1,
    decoded: declared ? { width: declared.width, height: declared.height } : null,
    kind: looksRaw(file.name) ? 'raw-unreadable' : 'image',
    camera: null,
    bytesRead: head.length,
    sourceBytes: file.size,
  };
}

/* --------------------------------------------------------------- surfaces */

function surface(width, height) {
  const canvas = new OffscreenCanvas(width, height);
  // A canvas that is read back is better held in ordinary memory than on the
  // GPU: getImageData off a GPU-backed canvas has to bring the whole thing
  // across the bus, and this pipeline reads every pixel of every frame exactly
  // once. The hint costs a little draw speed and saves far more than that.
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  return { canvas, context };
}

/**
 * The transform that maps one frame's own pixels into a box the right way up,
 * and the plain draw through it.
 *
 * Every drawImage of a frame in this file goes through here, because a frame
 * the browser did not orient - a RAW preview whose orientation lives in the
 * RAW's directory rather than in the preview - has to be turned by whoever
 * draws it, and a draw that forgot would put one sideways frame into a stack
 * of upright ones without anything failing. With no turn it is exactly the
 * plain draw into the box. With one, the bitmap is drawn about the box's
 * centre through the orientation's matrix, at the box's size with its sides
 * swapped where the turn is a quarter one, so the stored rows land where the
 * upright picture has them. The turn composes with whatever transform is
 * already on the context - the alignment, in drawAligned - as the innermost
 * step, which is what makes it a property of the frame rather than of the
 * output.
 *
 * It is in two halves because the refinement needs the transform without the
 * draw. Knowing where a destination sits in the frame's own pixels is what
 * lets it ask the browser for that rectangle and no more, rather than handing
 * over a 24-megapixel bitmap and a 256-pixel canvas to clip it against, nine
 * times a frame. Written as a transform and a draw at the natural size, the
 * two are the same arithmetic as the scaled draw they replace.
 */
function frameTransform(context, bitmap, spot, turn) {
  if (turn === 1) {
    context.translate(spot.x, spot.y);
    context.scale(spot.width / bitmap.width, spot.height / bitmap.height);
    return;
  }
  const stored = orientedSize(spot.width, spot.height, turn);
  const [a, b, c, d] = orientationMatrix(turn);
  context.translate(spot.x + spot.width / 2, spot.y + spot.height / 2);
  context.transform(a, b, c, d, 0, 0);
  context.translate(-stored.width / 2, -stored.height / 2);
  context.scale(stored.width / bitmap.width, stored.height / bitmap.height);
}

function drawFrame(context, bitmap, spot, turn) {
  context.save();
  frameTransform(context, bitmap, spot, turn);
  context.drawImage(bitmap, 0, 0);
  context.restore();
}

/**
 * Draw one frame into a destination box, with its alignment applied.
 *
 * The three parts of the transform are applied about the middle of the output -
 * scale, then rotation, then the shift - which is the order align.js measured
 * them in. Applying the shift first would be applying it in the frame's own
 * coordinates rather than the output's, which is wrong by however much the
 * frame was rotated.
 *
 * `crop` slides it left and up to the part of the output every frame covers,
 * and `bandY` slides it further up so that a banded run draws only the rows it
 * is about to read. The centre the transform turns about stays the *uncropped*
 * output's, because that is the space the movement was measured in.
 */
function drawAligned(context, bitmap, spot, output, move, crop, bandY, turn) {
  const cx = output.width / 2;
  const cy = output.height / 2;
  context.setTransform(1, 0, 0, 1, -crop.x, -crop.y - bandY);
  context.translate(cx + move.dx, cy + move.dy);
  context.rotate((move.angle * Math.PI) / 180);
  context.scale(move.scale, move.scale);
  context.translate(-cx, -cy);
  drawFrame(context, bitmap, spot, turn);
}

/**
 * Decode one frame small, once, for the two things a small decode is good for:
 * a picture for the list, and the luma the alignment is measured in.
 *
 * The caller decides what happens to the bitmap afterwards. `inspect` closes it
 * straight away because the list only wanted the JPEG; a run keeps it, because
 * the next thing it does is correlate it.
 */
async function surveyFrame(frame) {
  const known = Boolean(frame.width && frame.height);
  let bitmap;
  if (known) {
    // The resize is asked for in the decoder's own terms - the stored size,
    // for a frame this code turns itself - or a sideways preview would be
    // squeezed into an upright box before it was ever turned.
    const fit = Math.min(1, THUMB_SIZE / Math.max(frame.width, frame.height));
    bitmap = await createImageBitmap(frame.blob, {
      resizeWidth: Math.max(1, Math.round(frame.decoded.width * fit)),
      resizeHeight: Math.max(1, Math.round(frame.decoded.height * fit)),
      resizeQuality: 'medium',
    });
  } else {
    // Nothing in the file said how big it is, so it has to be decoded to find
    // out. Rare: a JPEG and a PNG both say, and so does every RAW preview.
    bitmap = await createImageBitmap(frame.blob);
  }

  // The list shows the picture upright, whichever of the two did the turning.
  const upright = orientedSize(bitmap.width, bitmap.height, frame.turn);
  const shown = surface(upright.width, upright.height);
  drawFrame(shown.context, bitmap, { x: 0, y: 0, ...upright }, frame.turn);
  const thumb = await shown.canvas.convertToBlob({ type: 'image/jpeg', quality: 0.8 });
  shown.canvas.width = 0;

  // A frame that declared no size gets all three from the bitmap, in the same
  // terms as the rest: the upright size for the box it will occupy, and the
  // bitmap's own for what the decoder hands back. A frame that declared one
  // keeps it, because a survey decode that was resized is no witness to it.
  return {
    described: {
      ...frame,
      width: known ? frame.width : upright.width,
      height: known ? frame.height : upright.height,
      decoded: known ? frame.decoded : { width: bitmap.width, height: bitmap.height },
    },
    bitmap,
    thumb,
  };
}

/**
 * Open and measure a set of files without stacking them.
 *
 * What the list is built from the moment somebody drops files in: how large
 * each frame is, whether it was a RAW file and what came out of it, and a
 * picture of it. It is also what lets the plan be shown before the run rather
 * than after, because the plan needs the sizes and nothing else.
 */
export async function inspect(files, hooks) {
  const out = [];
  for (const [index, file] of files.entries()) {
    if (hooks.cancelled()) throw new Cancelled();
    hooks.onProgress({ stage: 'open', done: index, total: files.length, name: file.name });
    try {
      const opened = await openFrame(file);
      const surveyed = await surveyFrame(opened);
      surveyed.bitmap.close();
      out.push({ frame: describe(surveyed.described), thumb: surveyed.thumb, ok: true });
    } catch {
      // One unreadable file should not cost somebody the other nineteen.
      out.push({ frame: { name: file.name, sourceBytes: file.size }, thumb: null, ok: false });
    }
  }
  return out;
}

/* ---------------------------------------------------------------- measure */

/**
 * The luma square one frame is correlated in.
 *
 * Every frame is drawn into the same square the same way - the output box,
 * letterboxed into ALIGN_SIZE - so that a shift measured here is the same shift
 * everywhere, divided by one number. Fitting each frame to the square
 * separately would make that number different per frame, and different in each
 * axis for any frame of a different shape.
 */
function lumaSquare(bitmap, spot, output, fit, turn) {
  const { canvas, context } = surface(ALIGN_SIZE, ALIGN_SIZE);
  context.setTransform(1, 0, 0, 1, fit.x, fit.y);
  context.scale(fit.scale, fit.scale);
  drawFrame(context, bitmap, spot, turn);

  const pixels = context.getImageData(0, 0, ALIGN_SIZE, ALIGN_SIZE).data;
  const out = new Float64Array(ALIGN_SIZE * ALIGN_SIZE);
  for (let i = 0, at = 0; i < out.length; i += 1, at += 4) {
    out[i] = pixels[at] * 0.299 + pixels[at + 1] * 0.587 + pixels[at + 2] * 0.114;
  }
  canvas.width = 0;
  return window2d(out, ALIGN_SIZE);
}

/**
 * How far apart two windows' answers may be and still be counted as one
 * answer, in output pixels.
 *
 * The refinement exists to remove errors of a pixel or two, so a tolerance of
 * two is as wide as it can be and still mean anything: a window that disagrees
 * by more than the whole error being corrected is not measuring the same
 * movement as its neighbours. It is also comfortably above what a correct
 * window is off by - the browser's fit RMS over nine correct windows was 0.14
 * to 0.34 pixels on every scene that worked at all, and 17 to 42 pixels on
 * every scene that did not, so nothing measured sits near this number.
 */
const REFINE_TOLERANCE = 2;

/**
 * How far the refinement may move a frame, in the COARSE pass's own pixels.
 *
 * The refinement exists to finish a measurement, not to make another one, and
 * the measurement it is finishing was located to a fraction of a pixel of the
 * 256 square it was read in. So a residual worth applying is under a pixel of
 * that square - which is why it is quoted in them rather than in output
 * pixels, where the same error is one number on a 3000-pixel picture and
 * another on a 6000-pixel one. Two is a factor of two of slack over what the
 * peak's own interpolation can be wrong by, and anything past it means the
 * coarse pass locked onto a DIFFERENT peak, which is not a thing to correct by
 * a couple of pixels but a thing to refuse.
 *
 * A bound of some kind has to be here. The windows have their own wrap check -
 * a quarter of what one covers - but that is a question about one window's
 * reading and it is 128 output pixels wide; nine windows agreeing on a shift
 * of a hundred pixels pass it unanimously, which is exactly the shape a
 * globally periodic texture gives when every window's argmax lands on the same
 * wrong lattice period. The single-window refinement this replaced refused any
 * residual over eight output pixels and so refused that outright.
 */
const REFINE_LIMIT = 2;

/** Which rung of the refinement's ladder a frame's answer came off. */
export const REFINED = Object.freeze({
  reference: 'reference',
  fit: 'fit',
  partial: 'partial',
  coarse: 'coarse',
  none: 'none',
});

/**
 * A few pixels of the frame beyond what a window can see, so that the edge of
 * the source rectangle is never the edge of what gets resampled.
 */
const SOURCE_SLACK = 4;

/**
 * Where the refinement's windows sit inside the crop.
 *
 * The crop is divided into a grid of equal cells, inset from its edge, and a
 * window of `cover` output pixels is centred in each. Equal cells rather than
 * the corners and the middle, because a window's job is to sample the movement
 * field and an evenly spread sample is what a least-squares fit wants; and
 * inset, because the crop's own edge is where the frames stop covering, and a
 * window flush against it can see the transparent ground outside.
 */
export function refineGrid(crop, windows) {
  const width = crop.width - REFINE_INSET * 2;
  const height = crop.height - REFINE_INSET * 2;
  const out = [];
  for (let row = 0; row < windows.grid; row += 1) {
    for (let column = 0; column < windows.grid; column += 1) {
      const x = Math.round(
        crop.x + REFINE_INSET + (width * (column + 0.5)) / windows.grid - windows.cover / 2,
      );
      const y = Math.round(
        crop.y + REFINE_INSET + (height * (row + 0.5)) / windows.grid - windows.cover / 2,
      );
      // The corner is rounded because a window is cut at whole pixels, and the
      // centre is taken from the corner rather than the other way about, so
      // that the place the fit is told about is the place that was measured.
      out.push({ x, y, centre: { x: x + windows.cover / 2, y: y + windows.cover / 2 } });
    }
  }
  return out;
}

/**
 * Draw only as much of the bitmap as the destination can possibly show.
 *
 * The transform on the context already maps the frame's own pixels onto the
 * canvas, so inverting it and putting the canvas's four corners through it
 * gives the rectangle of the frame the canvas is looking at. Everything
 * outside that rectangle would be drawn and immediately clipped away, and at
 * nine windows a frame over a 24-megapixel bitmap that is most of the work:
 * the whole grid measured 12 ms a frame this way, against 21 ms drawing the
 * bitmap nine times over and 100 ms reading nine squares out of one full-size
 * draw. Drawing a source rectangle into the same rectangle under the same
 * transform is the same picture as drawing all of it, save at the rectangle's
 * own edge - which is why it is taken a few pixels larger than it needs to be,
 * and why the correlation's Hann window fading the square's edges to nothing
 * makes even that moot.
 */
function drawSource(context, bitmap, size) {
  const inverse = context.getTransform().inverse();
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  for (const [x, y] of [[0, 0], [size, 0], [size, size], [0, size]]) {
    const at = inverse.transformPoint({ x, y });
    left = Math.min(left, at.x);
    right = Math.max(right, at.x);
    top = Math.min(top, at.y);
    bottom = Math.max(bottom, at.y);
  }
  const x = Math.max(0, Math.floor(left) - SOURCE_SLACK);
  const y = Math.max(0, Math.floor(top) - SOURCE_SLACK);
  const width = Math.min(bitmap.width, Math.ceil(right) + SOURCE_SLACK) - x;
  const height = Math.min(bitmap.height, Math.ceil(bottom) + SOURCE_SLACK) - y;
  // A window that lands entirely off the frame - a badly mismeasured coarse
  // move, or a frame letterboxed into a corner of a much larger output - draws
  // nothing, and the empty square it leaves fails the gate rather than
  // reporting the shift between two pieces of nothing.
  if (width <= 0 || height <= 0) return;
  context.drawImage(bitmap, x, y, width, height, x, y, width, height);
}

/**
 * The luma of one refinement window, with the frame's coarse correction
 * already applied.
 *
 * Drawn through the same transform the stack will draw it through - the
 * window's corner standing in for the crop - so what the correlation sees is
 * what the accumulator would have seen, and the residual it reports is in
 * output pixels with nothing to multiply back up. That is the whole point of
 * measuring twice: here, an error of a twentieth of a pixel is a twentieth of
 * a pixel.
 *
 * The one difference from the stack's draw is the zoom, which puts `cover`
 * output pixels into a `size` square. Half scale costs a quarter of the
 * readback and of the transform behind it, and costs nothing in accuracy: the
 * residual being looked for is a pixel or two of output, and a correlation
 * resolves a fraction of a pixel of its own square either way. The caller
 * multiplies the answer back up by the same number.
 */
function windowSquare(bitmap, spot, output, move, at, windows, turn) {
  const { canvas, context } = surface(windows.size, windows.size);
  const zoom = windows.size / windows.cover;
  const cx = output.width / 2;
  const cy = output.height / 2;

  context.setTransform(zoom, 0, 0, zoom, -at.x * zoom, -at.y * zoom);
  context.translate(cx + move.dx, cy + move.dy);
  context.rotate((move.angle * Math.PI) / 180);
  context.scale(move.scale, move.scale);
  context.translate(-cx, -cy);
  frameTransform(context, bitmap, spot, turn);
  drawSource(context, bitmap, windows.size);

  const pixels = context.getImageData(0, 0, windows.size, windows.size).data;
  const out = new Float64Array(windows.size * windows.size);
  for (let i = 0, p = 0; i < out.length; i += 1, p += 4) {
    out[i] = pixels[p] * 0.299 + pixels[p + 1] * 0.587 + pixels[p + 2] * 0.114;
  }
  canvas.width = 0;
  return window2d(out, windows.size);
}

/**
 * One refinement laid on top of a coarse move, about the uncropped output
 * centre.
 *
 * Both are scale, then rotation, then shift about that centre, and applying
 * one after the other gives another of the same shape: the angles add, the
 * scales multiply, and the coarse shift is itself turned and scaled by the
 * refinement before the refinement's own shift is added. Writing that out is
 * cheaper than carrying a matrix through the drawing code, and it is the only
 * arithmetic here that has to be right for a rotated burst rather than merely
 * for a shifted one.
 */
export function compose(move, fit, turning) {
  const angle = turning ? fit.angle : 0;
  const scale = turning ? fit.scale : 1;
  const radians = (angle * Math.PI) / 180;
  const cos = Math.cos(radians) * scale;
  const sin = Math.sin(radians) * scale;
  return {
    ...move,
    angle: move.angle + angle,
    scale: move.scale * scale,
    dx: cos * move.dx - sin * move.dy + fit.dx,
    dy: sin * move.dx + cos * move.dy + fit.dy,
  };
}

/**
 * The largest group of windows reporting much the same shift as one of them.
 *
 * The fallback for a frame whose windows will not support a similarity: two
 * that agree are still two independent measurements of one translation, and
 * their mean is better than the coarse answer, which was read in a 256-pixel
 * square and multiplied up. Agreement with a member rather than with every
 * member, which is a cheaper question and the same answer whenever the group
 * is a real one.
 */
function agreeing(points) {
  let best = [];
  for (const seed of points) {
    const near = points.filter(
      (point) => Math.hypot(point.dx - seed.dx, point.dy - seed.dy) <= REFINE_TOLERANCE,
    );
    if (near.length > best.length) best = near;
  }
  return best;
}

/**
 * Whether a `commonArea` answer is its own sliver fallback rather than a
 * region every frame really covered.
 *
 * `commonArea` hands back the whole box when the true overlap is under a
 * quarter of either side, because a stack with visible edges is something
 * somebody can look at and a postage stamp is not. That answer is the only one
 * it gives that nobody covers, so everything downstream that reasons from "the
 * area is the whole box, therefore every frame reached every pixel" has to ask
 * this first. The test is that the box came back whole although something
 * moved or was letterboxed: any real shift, turn or scale gives up at least
 * one row or column to the rounding, so the two cannot be confused.
 */
export function fellBack(area, moves, output) {
  if (area.width !== output.width || area.height !== output.height) return false;
  return moves.some((move) => {
    // The same default commonArea takes, so the two read one set of moves the
    // same way.
    const box = move.spot ?? { x: 0, y: 0, width: output.width, height: output.height };
    return move.dx !== 0 || move.dy !== 0 || move.angle !== 0 || move.scale !== 1
      || box.x !== 0 || box.y !== 0
      || box.width !== output.width || box.height !== output.height;
  });
}

/**
 * The rectangle the answer is cut to, once every frame has been refined.
 *
 * `commonArea` on the final moves, held inside the box the accumulator covers
 * - which is what the frames covered under their COARSE moves, and the
 * refinement only ever moves them a pixel or two off that - and for focus
 * stacking a little less again. The accumulator has transparent ground inside
 * it wherever a frame did not reach, and stack.js reads transparent as a luma
 * of zero, which the Laplacian scores as the strongest edge in the picture and
 * the blur then spreads inward by its own radius. The pixels along the crop's
 * edge would take their colour from whichever frame happened to have its own
 * boundary there, which is a black fringe with a plausible explanation. So the
 * crop gives up the radius and two more: one for the Laplacian's own reach
 * past the boundary, one because a fringe is a fringe and a couple of pixels
 * of a 24-megapixel picture is nothing.
 *
 * Per axis, and only on an axis that has ground beside it. A crop already
 * spanning the whole accumulator on one axis has nothing outside it on that
 * axis to be transparent, so a burst that drifted only downwards keeps its
 * full width - fourteen columns at the radius slider's top. The exception is
 * the sliver fallback, where the box is whole and nobody covered it, and that
 * is the case with the most transparent ground of all.
 */
export function finalCrop(moves, output, covered, slivered, mode, radius) {
  const found = commonArea(moves, output);
  const x = Math.max(found.x, covered.x);
  const y = Math.max(found.y, covered.y);
  const width = Math.min(found.x + found.width, covered.x + covered.width) - x;
  const height = Math.min(found.y + found.height, covered.y + covered.height) - y;
  const area = width > 0 && height > 0 ? { x, y, width, height } : { ...covered };
  if (mode !== 'focus') return area;

  const inset = (radius ?? DEFAULT_RADIUS) + 2;
  const insetX = slivered || area.width < covered.width ? inset : 0;
  const insetY = slivered || area.height < covered.height ? inset : 0;
  if (area.width <= insetX * 2 || area.height <= insetY * 2) return area;
  return {
    x: area.x + insetX,
    y: area.y + insetY,
    width: area.width - insetX * 2,
    height: area.height - insetY * 2,
  };
}

/**
 * What a frame's surviving windows add up to: the ladder, in order.
 *
 * Four or more windows agreeing on one similarity is the answer the grid was
 * built for, and it is good to about five thousandths of a degree wherever it
 * is available. Below that - and only below it, counted in windows that
 * SURVIVED the gate - two of them agreeing on a shift is a shift worth
 * applying and nothing worth saying about rotation, and the move is marked
 * `partial` so that which happened is not a guess. That count is the whole
 * distinction between a frame nobody could measure much of and a frame
 * everybody measured differently: with four or more windows in hand, a
 * consensus that came back empty has already reported that they disagree, and
 * the two of them that happen to coincide are the two that sat on the same
 * moving subject. Below that the coarse move stands, which is the honest
 * outcome for such a frame: no single transform describes a walking figure and
 * the ground behind it, and leaving the frame where the first measurement put
 * it beats taking the loudest window's word for the whole picture.
 *
 * Nothing is applied that moves the frame further than `limit`, whichever rung
 * proposed it, and the rung below is tried instead. REFINE_LIMIT says why a
 * bound has to be here at all.
 *
 * A frame the coarse pass clamped was reported to the visitor as one corrected
 * by shifting alone, and in similarity mode the fit's angle and scale are
 * about to be applied to it, so the flag comes off with the same movement that
 * makes it untrue.
 *
 * In translate mode the same consensus runs and only its translation is
 * applied. Not a median of the windows, which is what the single-window
 * refinement's obvious generalisation would have been: a rotated burst makes
 * the windows disagree BY DESIGN, and the median of nine disagreeing shifts is
 * a number that describes no part of the frame.
 */
export function refineMove(move, points, turning, centre, limit) {
  const found = consensus(points, REFINE_TOLERANCE, centre);
  if (found && Math.hypot(found.fit.dx, found.fit.dy) <= limit) {
    return {
      ...compose(move, found.fit, turning),
      refine: REFINED.fit,
      clamped: turning ? false : move.clamped,
    };
  }

  const together = points.length < MIN_INLIERS ? agreeing(points) : [];
  if (together.length >= 2) {
    let dx = 0;
    let dy = 0;
    for (const point of together) {
      dx += point.dx;
      dy += point.dy;
    }
    const shift = { angle: 0, scale: 1, dx: dx / together.length, dy: dy / together.length };
    if (Math.hypot(shift.dx, shift.dy) <= limit) {
      return { ...compose(move, shift, false), refine: REFINED.partial, partial: true };
    }
  }

  return { ...move, refine: REFINED.coarse };
}

/* -------------------------------------------------------------------- run */

/**
 * Stack a set of files.
 *
 * @param {object} request
 * @param {File[]} request.files
 * @param {string} request.mode        a plan.js mode
 * @param {string} request.align       an align.js mode
 * @param {number} request.scale       working resolution, 1 / 0.5 / 0.25
 * @param {number} [request.kappa]     sigma clipping threshold
 * @param {number} [request.gain]      exposure applied to the result
 * @param {number} [request.radius]    focus stacking measurement radius
 * @param {string} [request.format]    'png' or 'jpeg'
 * @param {number} [request.quality]   JPEG quality
 * @param {number} [request.budget]    working memory ceiling
 * @param {object} hooks
 * @param {(update: object) => void} hooks.onProgress
 * @param {() => boolean} hooks.cancelled
 */
export async function runStack(request, hooks) {
  const { files, mode, align, scale = 1 } = request;
  const stop = () => { if (hooks.cancelled()) throw new Cancelled(); };
  const report = (update) => hooks.onProgress(update);

  if (!files.length) throw new Error('no.files');

  /* --- open ------------------------------------------------------------ */

  const opened = [];
  for (const [index, file] of files.entries()) {
    stop();
    report({ stage: 'open', done: index, total: files.length, name: file.name });
    opened.push(await openFrame(file));
  }

  /* --- survey ---------------------------------------------------------- */

  // Every frame is decoded once, small. This is where a frame that declared no
  // size gets one, and where the thumbnails come from.
  const frames = [];
  for (const [index, frame] of opened.entries()) {
    stop();
    report({ stage: 'survey', done: index, total: opened.length, name: frame.name });

    const surveyed = await surveyFrame(frame);
    frames.push({ ...surveyed.described, thumb: surveyed.bitmap });
  }

  const output = outputSize(frames, scale);
  if (!output) throw new Error('no.size');

  /* --- measure --------------------------------------------------------- */

  // The square every frame is correlated in, sized so that one number converts
  // a shift in it back to a shift in the output.
  const fit = placement(output, { width: ALIGN_SIZE, height: ALIGN_SIZE });
  // Where each frame sits in the output box. Constant for the whole run and
  // wanted by every stage after this one, so it is worked out once: the crop
  // needs it to know what a letterboxed frame ever covered, and the stack and
  // the refinement need it on every draw.
  const spots = frames.map((frame) => placement(frame, output));
  const centre = { x: output.width / 2, y: output.height / 2 };
  const moves = [];
  // The moves as commonArea wants them: each one carrying the box its frame
  // filled before it was moved.
  const placed = () => moves.map((move, index) => ({ ...move, spot: spots[index] }));
  let reference = null;

  for (const [index, frame] of frames.entries()) {
    stop();
    if (align === 'none') {
      moves.push({ ...NO_MOVE, measured: true, clamped: false });
      continue;
    }
    report({ stage: 'measure', done: index, total: frames.length, name: frame.name });

    const spot = spots[index];
    // The thumbnail is drawn as if it were the full frame, which it is a scaled
    // copy of. Its own size never enters the arithmetic.
    const square = lumaSquare(frame.thumb, {
      x: spot.x, y: spot.y, width: spot.width, height: spot.height,
    }, output, fit, frame.turn);

    if (!reference) {
      // Everything else is measured against this frame, so it is the one move
      // known exactly.
      reference = square;
      moves.push({
        ...NO_MOVE, measured: true, clamped: false, live: 1, coherence: 1, plateau: 0, next: 0,
        refine: REFINED.reference,
      });
      continue;
    }
    const found = estimate(reference, square, ALIGN_SIZE, align);
    // A peak the gate refused is the tallest point of a featureless surface,
    // not a shift, and the page says such a frame was left where it was. The
    // identity makes that literally true, and it is what the crop and the
    // stack below see for this frame; the statistics travel with it so the
    // page can count it.
    moves.push(found.measured ? {
      ...found,
      // Back out of the alignment square and into the output's own pixels.
      dx: found.dx / fit.scale,
      dy: found.dy / fit.scale,
      // Overwritten during the stack, when the frame is refined. A frame that
      // never reaches a full-size decode - a run cancelled part way - keeps
      // this, which is what actually happened to it.
      refine: REFINED.coarse,
    } : {
      ...NO_MOVE,
      measured: false,
      clamped: false,
      live: found.live,
      coherence: found.coherence,
      plateau: found.plateau,
      next: found.next,
      refine: REFINED.none,
    });
  }

  // The thumbnails have done both of their jobs by here.
  for (const frame of frames) frame.thumb.close();

  /* --- stack ----------------------------------------------------------- */

  // The refinement the measure stage promised. The moves above were read in a
  // small square and multiplied back up to output pixels, and the multiply-up
  // scales their sub-pixel error with them - enough to blur the stack by more
  // than it blurs a frame. So during the stack, when each frame's full-size
  // decode is in hand anyway, windows of it are correlated against the same
  // windows of the reference at output resolution and the answer is corrected
  // in place. It costs no extra decode, which is why it happens there and not
  // here.
  //
  // The grid is laid out over what the frames covered under their COARSE
  // moves, which is also the box everything below accumulates into. That is
  // not the crop the run finishes with - the refinement is about to move them
  // again, and the crop is settled afterwards from where they ended up - but
  // it is the right region to sample: the part of the output every frame has
  // something in.
  const covered = commonArea(placed(), output);
  // Except when it is not, because `commonArea` gave up and handed back the
  // whole box for a set that overlaps in almost nothing. A grid laid over that
  // puts windows where a frame has nothing, and a half-empty window correlates
  // confidently against a full one and reports a shift that is neither frame's;
  // the coarse move standing is the honest answer for such a set.
  const slivered = fellBack(covered, placed(), output);
  const windows = align === 'none' || slivered ? null : refineWindow(covered);
  const grid = windows ? refineGrid(covered, windows) : [];
  let referenceWindows = null;
  const refined = frames.map(() => false);
  // How far the refinement may move a frame, out of the coarse pass's square
  // and into the output's own pixels.
  const limit = REFINE_LIMIT / fit.scale;

  // The accumulator covers `covered` and the crop is taken at the end, out of
  // the finished rows. It has to be that way round now: the moves are not
  // final until every frame has been refined, which happens on each one's
  // first full-size decode, which is inside this loop. It is `covered` rather
  // than the whole output box because the band arithmetic is not free of the
  // difference - a run planned on the box instead of on what the frames cover
  // can gain a whole band, and a band is a re-read of every frame, so a
  // five-frame run that read each frame once would read each of them twice.
  // The refinement's corrections are a pixel or two, so the crop settled below
  // is inside this box in any case.
  const plan = planRun({
    width: covered.width, height: covered.height, frames: frames.length, mode,
    budget: request.budget,
  });
  report({ stage: 'planned', plan, output, frames: frames.map(describe) });

  // Allocated at the crop's size the moment the crop is known, which is when
  // the first band has been stacked. No second canvas and no copy: the rows
  // are cut on their way out of the accumulator.
  let crop = null;
  let out = null;
  let outContext = null;
  const list = bands(covered.height, plan.rows, plan.context);
  const totalSteps = plan.decodes;
  let step = 0;

  for (const [bandIndex, band] of list.entries()) {
    stop();
    const stack = createStack(mode, {
      width: covered.width,
      height: band.readRows,
      frames: frames.length,
      kappa: request.kappa,
      gain: request.gain,
      radius: request.radius,
    });
    const { canvas: scratch, context } = surface(covered.width, band.readRows);

    for (let pass = 0; pass < stack.passes; pass += 1) {
      stack.beginPass(pass);
      for (const [index, frame] of frames.entries()) {
        stop();
        step += 1;
        report({
          stage: 'stack', done: step, total: totalSteps, name: frame.name,
          band: bandIndex + 1, bands: list.length, pass: pass + 1, passes: stack.passes,
        });

        const spot = spots[index];
        const working = workingSize(frame.decoded.width, frame.decoded.height, 1);
        const bitmap = await decodeAt(frame.blob, working, spot, frame.turn);

        // Each frame's first full-size appearance settles its final position.
        // Later bands and passes reuse the answer, so a banded run stays
        // consistent with itself, and it is what lets the crop be taken from
        // the finished moves: every one of them is final by the end of the
        // first band's first pass.
        //
        // Every window goes through the same gate the coarse pass does, and
        // for the same reasons: a window without enough texture to correlate,
        // one whose peak is a plateau - a wall, a sky - so that its position
        // is the noise's choice, or one whose peak is merely the tallest of
        // several, so that which one the argmax took is the noise's choice
        // instead. A window that reports a shift larger than a quarter of what
        // it covers is refused as well, and that one is arithmetic rather than
        // judgement: a correlation surface wraps, so a shift approaching half
        // the square is as likely to be the same feature coming round the
        // other side as a real residual, and no residual of a coarse move is
        // that large. What survives goes to the consensus. A frame the coarse
        // pass could not measure is not refined at all: it is sitting at the
        // identity, and a residual measured from there is not a residual but a
        // whole shift, which is the measurement that was already refused.
        if (windows && !refined[index]) {
          refined[index] = true;
          if (index === 0) {
            referenceWindows = grid.map((at) => windowSquare(
              bitmap, spot, output, moves[index], at, windows, frame.turn,
            ));
          } else if (referenceWindows && moves[index].measured) {
            const points = [];
            for (const [which, at] of grid.entries()) {
              const square = windowSquare(
                bitmap, spot, output, moves[index], at, windows, frame.turn,
              );
              const residual = phaseCorrelate(referenceWindows[which], square, windows.size);
              if (!isMeasured(residual)) continue;
              // Out of the window's own square and back into output pixels,
              // which is the one number the half-scale draw costs.
              const back = windows.cover / windows.size;
              const dx = residual.dx * back;
              const dy = residual.dy * back;
              if (Math.hypot(dx, dy) > windows.cover / 4) continue;
              points.push({ x: at.centre.x, y: at.centre.y, dx, dy });
            }
            moves[index] = refineMove(
              moves[index], points, align === 'similarity', centre, limit,
            );
          }
        }

        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, covered.width, band.readRows);
        drawAligned(context, bitmap, spot, output, moves[index], covered, band.readY, frame.turn);
        bitmap.close();

        stack.add(context.getImageData(0, 0, covered.width, band.readRows).data, index, pass);
      }
      stack.endPass(pass);
    }

    // The crop, the first time there is anything to crop. Every frame was
    // refined during the pass just finished, so this is the earliest moment it
    // can be asked for and the last one at which it is needed.
    if (!crop) {
      crop = finalCrop(placed(), output, covered, slivered, mode, request.radius);
      ({ canvas: out, context: outContext } = surface(crop.width, crop.height));
      // The reference windows can never be read again - every frame was
      // refined during the pass that just finished - and at the 512/256 grid
      // they are nine 256-squares of doubles, which is more memory than the
      // single window they replaced and more than plan.peak counts.
      referenceWindows = null;
    }

    // Only the rows this band owns are written, and only the columns the crop
    // kept. The overlap above and below was read so that focus stacking could
    // measure across the seam, and it belongs to the neighbouring bands; the
    // rows outside the crop were stacked because the accumulator covers
    // everything the frames covered, and they are thrown away here rather than
    // in a second canvas. The bands are cut from that box, so the crop has to
    // come into its coordinates to be compared with them.
    const finished = stack.result();
    const top = crop.y - covered.y;
    const from = Math.max(band.y, top);
    const to = Math.min(band.y + band.rows, top + crop.height);
    if (to > from) {
      const keep = new ImageData(crop.width, to - from);
      for (let row = 0; row < to - from; row += 1) {
        const at = (band.offset + from - band.y + row) * covered.width + (crop.x - covered.x);
        keep.data.set(
          finished.subarray(at * 4, (at + crop.width) * 4),
          row * crop.width * 4,
        );
      }
      outContext.putImageData(keep, 0, from - top);
    }
    scratch.width = 0;
  }

  /* --- encode ---------------------------------------------------------- */

  // What the frames covered before any of them was moved. Measuring the crop
  // against the output box instead would call a set of two shapes cropped for
  // the letterboxing alone, and the page's note for that run says the frames
  // were stacked exactly as given - two sentences that cannot both be true.
  const base = commonArea(spots.map((spot) => ({ ...NO_MOVE, spot })), output);

  stop();
  report({ stage: 'encode', done: totalSteps, total: totalSteps });
  const format = request.format === 'jpeg' ? 'image/jpeg' : 'image/png';
  const blob = await out.convertToBlob({
    type: format,
    quality: format === 'image/jpeg' ? (request.quality ?? 0.92) : undefined,
  });
  out.width = 0;

  return {
    blob,
    width: crop.width,
    height: crop.height,
    // Whether MOVING the frames cost anything at the edges, so the page can
    // say so when it is more than a trim.
    cropped: crop.width !== base.width || crop.height !== base.height,
    plan,
    frames: frames.map(describe),
    moves,
  };
}

/**
 * Decode one frame at the size it will be drawn at.
 *
 * Asking the decoder for the size wanted, rather than decoding at full size and
 * scaling afterwards, is the cheapest resampling available: it happens inside
 * the browser's own decoder, and for a JPEG being halved or quartered it can be
 * done in the frequency domain without ever building the full-size image.
 *
 * `natural` is the size the decoder will produce and `spot` is the upright box
 * the frame is going into, so for a frame this code turns itself the request
 * is the box with its sides swapped: the decoder does not know about the turn
 * and would otherwise be asked for a portrait picture from a landscape stream.
 */
function decodeAt(blob, natural, spot, turn) {
  const wanted = orientedSize(spot.width, spot.height, turn);
  const width = Math.max(1, Math.round(wanted.width));
  const height = Math.max(1, Math.round(wanted.height));
  if (width >= natural.width && height >= natural.height) {
    // Upscaling, or no change. Let the draw do it rather than the decoder, so
    // nothing is resampled twice.
    return createImageBitmap(blob);
  }
  return createImageBitmap(blob, {
    resizeWidth: width, resizeHeight: height, resizeQuality: 'high',
  });
}

function describe(frame) {
  return {
    name: frame.name,
    width: frame.width,
    height: frame.height,
    kind: frame.kind,
    camera: frame.camera,
    bytesRead: frame.bytesRead,
    sourceBytes: frame.sourceBytes,
  };
}

export { Cancelled };
