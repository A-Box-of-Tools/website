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
 *   measure   each frame is correlated against the first to find how it moved
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

import { estimate, window2d } from './align.js';
import { bands, commonArea, outputSize, placement, planRun, workingSize } from './plan.js';
import { findPreview, jpegSize, looksRaw } from './raw.js';
import { createStack } from './stack.js';

/**
 * The square the alignment works in. A power of two because the transform needs
 * one, and 256 because the offset between two frames is a property of the
 * picture rather than of its resolution: measuring it here and multiplying up
 * is as accurate as measuring it at 6000 across, and about five hundred times
 * less work.
 */
export const ALIGN_SIZE = 256;

/** How large a thumbnail the list shows. */
const THUMB_SIZE = 160;

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
 */
export function declaredSize(bytes) {
  if (bytes.length > 24 && PNG_SIGNATURE.every((byte, i) => bytes[i] === byte)) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    // IHDR is always the first chunk: its length, its name, then the size.
    if (view.getUint32(12, false) === 0x49484452) {
      return { width: view.getUint32(16, false), height: view.getUint32(20, false) };
    }
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return jpegSize(bytes);
  return null;
}

/**
 * What to decode for one chosen file.
 *
 * For an ordinary picture that is the file. For a RAW file it is a slice of the
 * file - the camera's own preview - and finding it costs a few reads of a few
 * kilobytes each. Either way the result is a Blob the browser's own decoder can
 * open, and at no point is a whole RAW file pulled into memory.
 */
export async function openFrame(file) {
  const read = async (offset, length) => new Uint8Array(
    await file.slice(offset, offset + length).arrayBuffer(),
  );

  const raw = looksRaw(file.name) ? await findPreview(read, file.size, MIN_PREVIEW_PIXELS) : null;
  if (raw) {
    return {
      name: file.name,
      blob: file.slice(raw.offset, raw.offset + raw.length, 'image/jpeg'),
      width: raw.width,
      height: raw.height,
      kind: 'raw',
      camera: [raw.make, raw.model].filter(Boolean).join(' ') || null,
      bytesRead: raw.read,
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
function drawAligned(context, bitmap, spot, output, move, crop, bandY) {
  const cx = output.width / 2;
  const cy = output.height / 2;
  context.setTransform(1, 0, 0, 1, -crop.x, -crop.y - bandY);
  context.translate(cx + move.dx, cy + move.dy);
  context.rotate((move.angle * Math.PI) / 180);
  context.scale(move.scale, move.scale);
  context.translate(-cx, -cy);
  context.drawImage(bitmap, spot.x, spot.y, spot.width, spot.height);
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
  let bitmap;
  if (frame.width && frame.height) {
    const fit = Math.min(1, THUMB_SIZE / Math.max(frame.width, frame.height));
    bitmap = await createImageBitmap(frame.blob, {
      resizeWidth: Math.max(1, Math.round(frame.width * fit)),
      resizeHeight: Math.max(1, Math.round(frame.height * fit)),
      resizeQuality: 'medium',
    });
  } else {
    // Nothing in the file said how big it is, so it has to be decoded to find
    // out. Rare: a JPEG and a PNG both say, and so does every RAW preview.
    bitmap = await createImageBitmap(frame.blob);
  }

  const shown = surface(bitmap.width, bitmap.height);
  shown.context.drawImage(bitmap, 0, 0);
  const thumb = await shown.canvas.convertToBlob({ type: 'image/jpeg', quality: 0.8 });
  shown.canvas.width = 0;

  return {
    described: {
      ...frame,
      width: frame.width ?? bitmap.width,
      height: frame.height ?? bitmap.height,
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
function lumaSquare(bitmap, spot, output, fit) {
  const { canvas, context } = surface(ALIGN_SIZE, ALIGN_SIZE);
  context.setTransform(1, 0, 0, 1, fit.x, fit.y);
  context.scale(fit.scale, fit.scale);
  context.drawImage(bitmap, spot.x, spot.y, spot.width, spot.height);

  const pixels = context.getImageData(0, 0, ALIGN_SIZE, ALIGN_SIZE).data;
  const out = new Float64Array(ALIGN_SIZE * ALIGN_SIZE);
  for (let i = 0, at = 0; i < out.length; i += 1, at += 4) {
    out[i] = pixels[at] * 0.299 + pixels[at + 1] * 0.587 + pixels[at + 2] * 0.114;
  }
  canvas.width = 0;
  return window2d(out, ALIGN_SIZE);
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
  const moves = [];
  let reference = null;

  for (const [index, frame] of frames.entries()) {
    stop();
    if (align === 'none') {
      moves.push({ dx: 0, dy: 0, angle: 0, scale: 1, confidence: 0, clamped: false });
      continue;
    }
    report({ stage: 'measure', done: index, total: frames.length, name: frame.name });

    const spot = placement(frame, output);
    // The thumbnail is drawn as if it were the full frame, which it is a scaled
    // copy of. Its own size never enters the arithmetic.
    const square = lumaSquare(frame.thumb, {
      x: spot.x, y: spot.y, width: spot.width, height: spot.height,
    }, output, fit);

    if (!reference) {
      reference = square;
      moves.push({ dx: 0, dy: 0, angle: 0, scale: 1, confidence: Infinity, clamped: false });
      continue;
    }
    const found = estimate(reference, square, ALIGN_SIZE, align);
    moves.push({
      ...found,
      // Back out of the alignment square and into the output's own pixels.
      dx: found.dx / fit.scale,
      dy: found.dy / fit.scale,
    });
  }

  // The thumbnails have done both of their jobs by here.
  for (const frame of frames) frame.thumb.close();

  /* --- stack ----------------------------------------------------------- */

  // What every frame covers once moved. With no alignment this is the whole
  // output; with alignment it is the output less however far the frames went.
  const crop = commonArea(moves, output);
  const plan = planRun({
    width: crop.width, height: crop.height, frames: frames.length, mode,
    budget: request.budget,
  });
  report({ stage: 'planned', plan, output: crop, frames: frames.map(describe) });

  const { canvas: out, context: outContext } = surface(crop.width, crop.height);
  const list = bands(crop.height, plan.rows, plan.context);
  const totalSteps = plan.decodes;
  let step = 0;

  for (const [bandIndex, band] of list.entries()) {
    stop();
    const stack = createStack(mode, {
      width: crop.width,
      height: band.readRows,
      frames: frames.length,
      kappa: request.kappa,
      gain: request.gain,
      radius: request.radius,
    });
    const { canvas: scratch, context } = surface(crop.width, band.readRows);

    for (let pass = 0; pass < stack.passes; pass += 1) {
      stack.beginPass(pass);
      for (const [index, frame] of frames.entries()) {
        stop();
        step += 1;
        report({
          stage: 'stack', done: step, total: totalSteps, name: frame.name,
          band: bandIndex + 1, bands: list.length, pass: pass + 1, passes: stack.passes,
        });

        const spot = placement(frame, output);
        const working = workingSize(frame.width, frame.height, 1);
        const bitmap = await decodeAt(frame.blob, working, spot);
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, crop.width, band.readRows);
        drawAligned(context, bitmap, spot, output, moves[index], crop, band.readY);
        bitmap.close();

        stack.add(context.getImageData(0, 0, crop.width, band.readRows).data, index, pass);
      }
      stack.endPass(pass);
    }

    // Only the rows this band owns are written. The overlap above and below was
    // read so that focus stacking could measure across the seam, and it belongs
    // to the neighbouring bands.
    const finished = stack.result();
    const keep = new ImageData(crop.width, band.rows);
    keep.data.set(finished.subarray(
      band.offset * crop.width * 4,
      (band.offset + band.rows) * crop.width * 4,
    ));
    outContext.putImageData(keep, 0, band.y);
    scratch.width = 0;
  }

  /* --- encode ---------------------------------------------------------- */

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
    // How much the alignment cost at the edges, so the page can say so when it
    // is more than a trim.
    cropped: crop.width !== output.width || crop.height !== output.height,
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
 */
function decodeAt(blob, natural, spot) {
  const width = Math.max(1, Math.round(spot.width));
  const height = Math.max(1, Math.round(spot.height));
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
