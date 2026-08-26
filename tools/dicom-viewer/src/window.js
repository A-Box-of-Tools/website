/**
 * Window and level: the control that makes a medical image legible, and the
 * one thing a viewer has that an image editor does not.
 *
 * A CT slice holds about four thousand distinct values and a screen shows two
 * hundred and fifty-six greys. The window is the choice of which slice of that
 * range gets all of them: everything below the window is black, everything
 * above it is white, and the width in between is spread across the greys. Lung
 * and bone are in the same file and cannot be seen in the same window, which is
 * why the control exists rather than the software picking once.
 *
 * THREE TRANSFORMS, IN ORDER, AND THE ORDER IS THE WHOLE THING
 *
 *   1. the modality transform - stored value times slope plus intercept - which
 *      turns what the file holds into what was measured. For CT that is
 *      Hounsfield units, where water is 0 and air is -1000 by definition.
 *   2. the VOI transform - the window - which turns measurements into greys.
 *   3. the presentation transform - MONOCHROME1's inversion - which turns greys
 *      into what goes on the screen.
 *
 * Doing 2 before 1 gives a picture that looks plausible and whose numbers are
 * meaningless, and it is the commonest bug in a home-made viewer: the presets
 * below are in Hounsfield units, and a window of "-600, 1500" applied to raw
 * stored values of a scanner that writes an intercept of -1024 is a black
 * rectangle.
 */

/**
 * The windows a radiologist actually uses, in Hounsfield units.
 *
 * These are conventions rather than anything in the standard - they are what is
 * printed on the wall of a reading room and what every workstation ships. Only
 * offered where the file says it is a CT, because HU are defined by the CT
 * reconstruction and the same numbers mean nothing on an MR, where the values
 * are in whatever units that sequence produced.
 *
 * An id and no name. This module is too deep to reach the DOM and the words on
 * this page live in the markup, so what comes out of here is a key the page
 * resolves - see the note about the strings in the JavaScript in the repository
 * README. Copying "Soft tissue" into a module would make it "Soft tissue" in
 * every language.
 */
export const CT_PRESETS = [
  { id: 'soft', center: 40, width: 400 },
  { id: 'lung', center: -600, width: 1500 },
  { id: 'bone', center: 300, width: 1500 },
  { id: 'brain', center: 40, width: 80 },
  { id: 'liver', center: 60, width: 160 },
  { id: 'mediastinum', center: 50, width: 350 },
  { id: 'angio', center: 300, width: 600 },
];

/**
 * The window the file itself asks for, if it asks for one.
 *
 * A file may carry several, with names in (0028,1055): a chest radiograph
 * commonly ships one for the lungs and one for the mediastinum, and the reading
 * of "the first one" is the one every viewer opens with.
 */
export function fileWindows(info) {
  const out = [];
  for (let at = 0; at < info.windowCenters.length; at += 1) {
    const center = info.windowCenters[at];
    const width = info.windowWidths[at] ?? info.windowWidths[0];
    if (!Number.isFinite(center) || !Number.isFinite(width) || width <= 0) continue;
    // The file's own word for this window where it has one, and nothing where
    // it does not: the page has its own wording for the unnamed case, and this
    // module is too deep to reach it.
    out.push({ id: `file-${at}`, name: info.windowNames[at] || null, center, width });
  }
  return out;
}

/**
 * The window that shows everything, from the values this frame actually holds.
 *
 * The fallback when a file names no window, and worth having as a named choice
 * anyway: it is the only window under which nothing is clipped, which makes it
 * the one to check a suspicious black or white area against.
 */
export function fullRange(frame, info) {
  const low = frame.min * info.slope + info.intercept;
  const high = frame.max * info.slope + info.intercept;
  const width = Math.max(1, high - low);
  return { id: 'full', center: low + width / 2, width };
}

/**
 * Stored values to pixels.
 *
 * @param {object} frame  from pixels.js
 * @param {object} info   from pixels.js
 * @param {{center: number, width: number, invert: boolean, voiFunction?: string}} view
 * @returns {ImageData-shaped} `{ data, width, height }` - an ImageData is not
 *   constructed here so that this module can be tested without a DOM.
 */
export function render(frame, info, view) {
  const { width, height, samples, values } = frame;
  const data = new Uint8ClampedArray(width * height * 4);

  if (samples === 3) {
    paintColour(data, values, width * height, info);
    return { data, width, height };
  }

  if (info.palette) {
    paintPalette(data, values, width * height, info.palette);
    return { data, width, height };
  }

  paintGrey(data, frame, info, view);
  return { data, width, height };
}

/**
 * The greyscale path, through a lookup table built once per frame.
 *
 * The table is indexed by stored value, so the per-pixel work is one subtraction
 * and one array read rather than a multiply, a divide and two comparisons. On a
 * 512x512 slice that is the difference between a window/level drag that follows
 * the mouse and one that lags behind it, and the drag is how the control is
 * actually used.
 *
 * Where the range of stored values is too wide for a table - a 32-bit dose grid,
 * or a float-valued derived image - the arithmetic is done per pixel instead.
 * Correct either way; the table is only ever a speed.
 */
function paintGrey(data, frame, info, view) {
  const { values } = frame;
  const count = frame.width * frame.height;
  const inverted = view.invert !== (info.photometric === 'MONOCHROME1');
  const span = frame.max - frame.min;

  if (span >= 0 && span <= 65535) {
    const table = new Uint8Array(span + 1);
    for (let at = 0; at <= span; at += 1) {
      table[at] = grey(at + frame.min, info, view, inverted);
    }
    for (let at = 0; at < count; at += 1) {
      const value = values[at];
      const shade = value < frame.min ? table[0]
        : value > frame.max ? table[span]
          : table[value - frame.min];
      data[at * 4] = shade;
      data[at * 4 + 1] = shade;
      data[at * 4 + 2] = shade;
      data[at * 4 + 3] = 255;
    }
    return;
  }

  for (let at = 0; at < count; at += 1) {
    const shade = grey(values[at], info, view, inverted);
    data[at * 4] = shade;
    data[at * 4 + 1] = shade;
    data[at * 4 + 2] = shade;
    data[at * 4 + 3] = 255;
  }
}

/** One stored value, all three transforms applied, as a shade from 0 to 255. */
function grey(stored, info, view, inverted) {
  const value = stored * info.slope + info.intercept;
  const shade = voi(value, view.center, view.width, view.voiFunction);
  return inverted ? 255 - shade : shade;
}

/**
 * The VOI transform of PS3.3 C.11.2.1.2, all three of its forms.
 *
 * `LINEAR` is the default and the one everything uses, and its half-unit
 * offsets are not a rounding choice: the standard defines the window's edges at
 * `c - 0.5 - (w-1)/2` exactly, so that a window of width 1 selects a single
 * value rather than none. Writing it the obvious way instead puts every
 * rendering half a grey level away from every other viewer's, which nobody sees
 * until they compare two screenshots.
 */
export function voi(value, center, width, fn) {
  if (fn === 'SIGMOID') {
    return clamp(255 / (1 + Math.exp((-4 * (value - center)) / Math.max(width, 1e-6))));
  }

  if (fn === 'LINEAR_EXACT') {
    const half = width / 2;
    if (value <= center - half) return 0;
    if (value > center + half) return 255;
    return clamp(((value - center) / width + 0.5) * 255);
  }

  const c = center - 0.5;
  const w = Math.max(width, 1) - 1;
  if (w <= 0) return value <= c ? 0 : 255;
  if (value <= c - w / 2) return 0;
  if (value > c + w / 2) return 255;
  return clamp(((value - c) / w + 0.5) * 255);
}

const clamp = (value) => (value < 0 ? 0 : value > 255 ? 255 : Math.round(value));

/**
 * Colour images, which have no window at all.
 *
 * RGB and YBR data is display-ready by definition - it is what somebody's
 * screen showed, photographed by an endoscope or drawn by an ultrasound - and
 * there is nothing measured in it to window. The only work is bringing a
 * deeper-than-eight-bit sample down to eight.
 */
function paintColour(data, values, count, info) {
  const shift = Math.max(0, info.bitsStored - 8);
  for (let at = 0; at < count; at += 1) {
    data[at * 4] = values[at * 3] >> shift;
    data[at * 4 + 1] = values[at * 3 + 1] >> shift;
    data[at * 4 + 2] = values[at * 3 + 2] >> shift;
    data[at * 4 + 3] = 255;
  }
}

/**
 * Palette colour: the stored value is not a brightness, it is a row number.
 *
 * `first` is the value the table's first row stands for, and it is why this
 * cannot be a plain array index. Nuclear medicine images routinely carry a
 * table that starts somewhere other than zero.
 */
function paintPalette(data, values, count, palette) {
  const last = palette.count - 1;
  for (let at = 0; at < count; at += 1) {
    const index = Math.min(last, Math.max(0, values[at] - palette.first));
    data[at * 4] = palette.red[index];
    data[at * 4 + 1] = palette.green[index];
    data[at * 4 + 2] = palette.blue[index];
    data[at * 4 + 3] = 255;
  }
}

/**
 * A stored value in the units the file is actually in, and what to call them.
 *
 * What the probe under the cursor reads out. `Rescale Type` names the units
 * where the file bothered to; a CT that does not is still in Hounsfield units,
 * because that is what a CT's modality transform is defined to produce.
 */
export function measured(stored, info) {
  const value = stored * info.slope + info.intercept;
  let unit = info.rescaleType;
  if (!unit && info.modality === 'CT') unit = 'HU';
  if (unit === 'US') unit = '';           // "unspecified", which is not a unit
  return { value, unit };
}
