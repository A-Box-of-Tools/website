/**
 * The arithmetic: where the crop box goes, and whether it obeys the rules.
 *
 * Everything here is a pure function on numbers and rectangles. There is no
 * canvas, no bitmap and no DOM, which is why this is the part that is actually
 * tested (tests/js/id-photo.test.js) and why the drawing code in main.js is
 * four lines: a rectangle comes out of here and goes straight into one
 * drawImage call.
 *
 * THE MODEL. A specification constrains exactly two things about the crop, and
 * they are not the two things a crop box naturally has:
 *
 *   - the head height, chin to crown, as a fraction of the finished frame;
 *   - the eye line, as a fraction of the frame measured up from the bottom.
 *
 * A crop rectangle of a fixed shape has two degrees of freedom that matter
 * here: how tall it is, and where its top edge sits. The first fixes the head
 * height and the second fixes the eye line - one each, which is why the crown,
 * the chin and the two eyes are enough to place the box exactly, with nothing
 * left to guess.
 *
 * WHERE THE FOUR POINTS COME FROM is detect.js, and it is not a model: there
 * are no weights, no inference runtime and nothing fetched, only the outline of
 * a head against a plain wall and the dark patches in it where eyes are. What
 * it produces is a starting position, and the page says which of the four it
 * managed to measure. Nothing in this file knows or cares which of them were
 * measured and which were dragged afterwards, and that is the point: the
 * arithmetic below is applied to wherever the dots ended up.
 *
 * WHY THE EYE LINE IS MEASURED FROM THE BOTTOM. Because that is how every
 * authority in specs.js publishes it. Converting to "from the top" here once,
 * in one clearly named place, is cheaper than a reader having to work out which
 * way round each number in this file was meant.
 */

/** Millimetres in an inch. The only conversion constant in the file. */
export const MM_PER_INCH = 25.4;

export const mmToPx = (mm, dpi) => (mm * dpi) / MM_PER_INCH;
export const pxToMm = (px, dpi) => (px * MM_PER_INCH) / dpi;

/** Nothing is ever rounded to zero: a canvas of no width cannot be encoded. */
const px = (value) => Math.max(1, Math.round(value));
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

/** The middle of a published band, which is what every fit aims at. */
const mid = (band) => (band.min + band.max) / 2;

/**
 * The shape of the finished photograph, as width / height.
 *
 * The print size decides it where there is one. Where there is not - a rule
 * that is only ever a web form's rule - the pixel size is the shape, which is
 * why the two are never both allowed to be missing.
 */
export function frameAspect(spec) {
  if (spec.print) return spec.print.widthMm / spec.print.heightMm;
  const digital = spec.digital;
  const width = digital?.width?.exact ?? digital?.width?.min;
  const height = digital?.height?.exact ?? digital?.height?.min;
  if (width && height) return width / height;
  throw new Error('a specification with neither a print size nor a pixel size cannot be cropped to.');
}

/**
 * The pixel size a print of this specification comes out at.
 *
 * `dpi` overrides the specification's own, for the case where somebody has
 * been told to submit at 600. It is never allowed below the published figure:
 * the DPI in a specification is a floor, not a preference, and a 35 x 45 mm
 * photo at 150 dpi is a 207 x 266 pixel picture being described as a print.
 *
 * @returns {{width: number, height: number, dpi: number}|null}
 */
export function printPixels(spec, dpi) {
  if (!spec.print) return null;
  const used = Math.max(spec.print.dpi, Math.round(Number(dpi) || 0) || spec.print.dpi);
  return {
    width: px(mmToPx(spec.print.widthMm, used)),
    height: px(mmToPx(spec.print.heightMm, used)),
    dpi: used,
  };
}

/**
 * The four points somebody drags onto the photograph.
 *
 * @typedef {object} Marks
 * @property {{x: number, y: number}} crown     the top of the head, hair included
 * @property {{x: number, y: number}} chin      the bottom of the chin
 * @property {{x: number, y: number}} leftEye   the pupil, as you look at the picture
 * @property {{x: number, y: number}} rightEye
 */

/**
 * What the four marks say about the face, in source pixels.
 *
 * The eye line is the average of the two pupils rather than either of them,
 * and the horizontal centre comes from the eyes rather than from the crown and
 * the chin: a head turned even slightly puts the chin off the centre line of
 * the face, while the midpoint between the pupils stays where the face is.
 *
 * `tilt` is signed and in degrees, positive when the head leans to the right of
 * the picture. It is not used to place the box - rotating somebody's photograph
 * to straighten it would re-sample the picture, and every specification here
 * asks for a level camera rather than a corrected one - but it is reported,
 * because a tilt of more than a couple of degrees is one of the things a human
 * examiner rejects and nobody notices in their own photo.
 */
export function faceOf(marks) {
  const eyeY = (marks.leftEye.y + marks.rightEye.y) / 2;
  const centreX = (marks.leftEye.x + marks.rightEye.x) / 2;
  const dx = marks.rightEye.x - marks.leftEye.x;
  const dy = marks.rightEye.y - marks.leftEye.y;

  return {
    eyeY,
    centreX,
    headPx: marks.chin.y - marks.crown.y,
    eyeSpacing: Math.hypot(dx, dy),
    tilt: dx === 0 && dy === 0 ? 0 : (Math.atan2(dy, dx) * 180) / Math.PI,
  };
}

/**
 * The crop rectangle that puts this face where this specification wants it.
 *
 * Both bands are aimed at their middle rather than at either end, which is the
 * only choice that leaves room in both directions for the rounding, for the
 * marks being a pixel or two out, and for the examiner's ruler.
 *
 * The rectangle is then clamped into the picture, and the clamping is reported
 * rather than hidden: a photograph with two centimetres of headroom cannot be
 * cropped to a rule that wants five, and the honest answer is to say which edge
 * ran out and by how much, not to hand back a box that quietly misses the rule.
 *
 * @param {Marks} marks
 * @param {object} spec
 * @param {{width: number, height: number}} source
 * @returns {{rect: object, ideal: object, short: {top: number, bottom: number, left: number, right: number}}}
 */
export function fitFrame(marks, spec, source) {
  const face = faceOf(marks);
  const aspect = frameAspect(spec);

  const headTarget = mid(spec.head);
  const eyeTarget = mid(spec.eye);

  // Head height first: it is the only thing that decides how tall the crop is.
  let height = face.headPx > 0 ? face.headPx / headTarget : source.height;
  let width = height * aspect;

  // A crop cannot be larger than the picture it is taken from. Shrinking it
  // keeps the shape and costs head height, which is the lesser of the two
  // failures - the box still frames the face, it just frames more of the room.
  const shrink = Math.min(1, source.width / width, source.height / height);
  height *= shrink;
  width *= shrink;

  // Then the eye line decides where that box sits.
  const idealTop = face.eyeY - (1 - eyeTarget) * height;
  const idealLeft = face.centreX - width / 2;

  const top = clamp(idealTop, 0, source.height - height);
  const left = clamp(idealLeft, 0, source.width - width);

  const rect = {
    x: Math.round(left),
    y: Math.round(top),
    width: px(width),
    height: px(height),
  };

  return {
    rect: containIn(rect, source),
    ideal: { x: idealLeft, y: idealTop, width, height },
    // How much picture the rule wanted and the photograph did not have. All
    // four are zero on a photograph with room to spare, which is what the page
    // checks before it says anything.
    short: {
      top: Math.max(0, Math.round(-idealTop)),
      bottom: Math.max(0, Math.round(idealTop + height - source.height)),
      left: Math.max(0, Math.round(-idealLeft)),
      right: Math.max(0, Math.round(idealLeft + width - source.width)),
    },
  };
}

/** The rectangle, guaranteed to be inside the picture. */
export function containIn(rect, source) {
  const width = Math.min(rect.width, source.width);
  const height = Math.min(rect.height, source.height);
  return {
    x: clamp(Math.round(rect.x), 0, source.width - width),
    y: clamp(Math.round(rect.y), 0, source.height - height),
    width,
    height,
  };
}

/**
 * Measure a crop against the rules, whether it was fitted or dragged by hand.
 *
 * This is what the live readout under the preview shows, and it is deliberately
 * the same function for both: a box the tool placed and a box somebody dragged
 * afterwards are judged by exactly the same arithmetic, so the numbers cannot
 * say "fits" for one and mean something else for the other.
 *
 * @param {{x:number,y:number,width:number,height:number}} rect
 * @param {Marks} marks
 * @param {object} spec
 */
export function measure(rect, marks, spec) {
  const face = faceOf(marks);
  const headFraction = rect.height > 0 ? face.headPx / rect.height : 0;
  // From the bottom, because that is how the rules are written.
  const eyeFraction = rect.height > 0 ? 1 - (face.eyeY - rect.y) / rect.height : 0;
  const centreOffset = rect.width > 0
    ? (face.centreX - (rect.x + rect.width / 2)) / rect.width
    : 0;

  const heightMm = spec.print?.heightMm ?? null;

  return {
    head: {
      ...checkBand(headFraction, spec.head),
      mm: heightMm === null ? null : headFraction * heightMm,
    },
    eye: {
      ...checkBand(eyeFraction, spec.eye),
      mm: heightMm === null ? null : eyeFraction * heightMm,
    },
    // A face more than a fiftieth of the frame off centre reads as off centre.
    // The number is not published by anybody; it is here because "centred" is
    // a rule on every one of these forms and nobody says what it means.
    centre: {
      offset: centreOffset,
      status: Math.abs(centreOffset) <= 0.02 ? 'ok' : centreOffset < 0 ? 'low' : 'high',
    },
    tilt: {
      degrees: face.tilt,
      status: Math.abs(face.tilt) <= 3 ? 'ok' : 'high',
    },
    eyeSpacing: face.eyeSpacing,
  };
}

/**
 * Where one value sits against one band.
 *
 * 'low' and 'high' rather than a bare false, because the two have opposite
 * fixes - a head that is too small wants a tighter crop, a head that is too
 * large wants a looser one - and a readout that only says "wrong" makes
 * somebody guess which.
 */
export function checkBand(value, band) {
  const status = value < band.min ? 'low' : value > band.max ? 'high' : 'ok';
  return { value, status, min: band.min, max: band.max, advisory: Boolean(band.advisory) };
}

/** Every band this specification states, at once. True when all of them pass. */
export function passes(metrics) {
  return metrics.head.status === 'ok'
    && metrics.eye.status === 'ok'
    && metrics.centre.status === 'ok'
    && metrics.tilt.status === 'ok';
}

/**
 * Is there enough picture in this crop to write the output without inventing
 * pixels?
 *
 * Enlarging is the one thing a resampler cannot do honestly: the detail was
 * never photographed, so what comes out is a softer copy rather than a sharper
 * one. It is not refused here - a slightly enlarged photo is still accepted by
 * every form on this list, and refusing would help nobody - but it is measured
 * and said out loud, because "your photo is only 300 pixels tall and the print
 * needs 531" is the difference between a print that looks like a photograph and
 * one that looks like a screenshot.
 *
 * @param {{width: number, height: number}} rect      the crop, in source pixels
 * @param {{width: number, height: number}} output    what is being written
 */
export function resampling(rect, output) {
  const scale = Math.min(rect.width / output.width, rect.height / output.height);
  return {
    scale,
    // A little enlargement is invisible; a lot is not. 0.95 rather than 1
    // because a crop one pixel short of the output is not worth a warning.
    enlarging: scale < 0.95,
    severe: scale < 0.6,
    have: { width: rect.width, height: rect.height },
    need: { width: output.width, height: output.height },
  };
}

/**
 * The guide lines the overlay draws inside the crop box.
 *
 * All four are fractions of the box's own height measured from its top edge,
 * because that is what a CSS `top` wants. The eye band arrives from the
 * specification measured from the bottom and is turned over here, once.
 *
 * The head band is returned as the two fractions themselves rather than as a
 * position, because where it lands depends on where the crown was marked: given
 * a crown, the chin may fall anywhere between two heights, and those two
 * heights are what somebody lining a photograph up by eye needs to see. Until
 * the crown has been marked there is nothing to draw it against, and the
 * cropper leaves that band off rather than drawing a guess as a measurement.
 */
export function guideLines(spec) {
  return {
    eye: { from: 1 - spec.eye.max, to: 1 - spec.eye.min },
    head: { min: spec.head.min, max: spec.head.max },
  };
}
