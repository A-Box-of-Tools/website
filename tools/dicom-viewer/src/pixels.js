/**
 * Pixel Data, turned back into the numbers the scanner measured.
 *
 * There is no such thing as "the pixels" in a DICOM file. There are between one
 * and three samples per pixel, stored in 1, 8, 16 or 32 bits, of which only
 * some are the value, signed or not, in one of two orders, either interleaved
 * or in planes, possibly as indexes into three lookup tables, possibly
 * compressed by one of four schemes, and possibly not even in this element in
 * the order the frames are shown. Every one of those is a separate field in the
 * header and every combination of them exists in the wild.
 *
 * WHAT COMES OUT
 *
 * One frame, as *stored values*: the numbers as the file holds them, masked to
 * the bits that are real, sign-extended if the file says they are signed, and
 * de-planarised and colour-converted if they were neither of those. What has
 * deliberately *not* happened yet is the rescale to real units and the window,
 * because those are display decisions and belong to window.js, and because the
 * probe readout on the page has to be able to say both "the file stores 1123
 * here" and "that is 100 HU".
 *
 * MEMORY
 *
 * One frame at a time, always. A viewer holding every slice of a study as
 * decoded pixels is a viewer that is killed by the browser on the study its
 * user cared about: three hundred slices of a 512x512 CT is 150 MB of 16-bit
 * samples before anything is drawn. main.js keeps a small ring of recently
 * decoded frames and reads the rest off the disk again, which is fast because
 * the file is already on the disk and slow only in the sense that a disk is.
 */

import { decodeRLE } from './rle.js';
import { decodeJPEGLossless } from './jpeg-lossless.js';
import { number, numbers, text } from './values.js';
import { refuse } from './refusal.js';

/** What is needed to turn this file's Pixel Data into pictures. */
export function imageInfo(dataset, decoder) {
  const rows = number(dataset, '00280010', decoder, 0);
  const columns = number(dataset, '00280011', decoder, 0);
  const samplesPerPixel = number(dataset, '00280002', decoder, 1);
  const bitsAllocated = number(dataset, '00280100', decoder, 16);
  const bitsStored = number(dataset, '00280101', decoder, bitsAllocated);
  const highBit = number(dataset, '00280102', decoder, bitsStored - 1);
  const photometric = text(dataset, '00280004', decoder).toUpperCase() || 'MONOCHROME2';

  const centers = numbers(dataset, '00281050', decoder);
  const widths = numbers(dataset, '00281051', decoder);
  const spacing = numbers(dataset, '00280030', decoder);

  return {
    rows,
    columns,
    samplesPerPixel,
    bitsAllocated,
    bitsStored: bitsStored > 0 && bitsStored <= bitsAllocated ? bitsStored : bitsAllocated,
    highBit: highBit >= 0 && highBit < bitsAllocated ? highBit : bitsStored - 1,
    signed: number(dataset, '00280103', decoder, 0) === 1,
    planar: number(dataset, '00280006', decoder, 0) === 1,
    photometric,
    // Not a pixel property, but window.js needs it to know whether the numbers
    // it is showing are Hounsfield units, and it would otherwise be the only
    // thing the display code had to reach back into the dataset for.
    modality: text(dataset, '00080060', decoder).toUpperCase(),
    // YBR_FULL_422 stores the two colour-difference channels once per pair of
    // pixels, so a frame of it is two bytes a pixel rather than three. That
    // changes where the *next* frame starts, which is why it has to be known
    // before a single sample is read rather than during the colour conversion.
    subsampled: photometric === 'YBR_FULL_422' && samplesPerPixel === 3,
    frames: Math.max(1, number(dataset, '00280008', decoder, 1)),

    // The modality transform: stored value times slope plus intercept, which is
    // what turns a CT's 16-bit integers into Hounsfield units and is why the
    // window presets below can be written in HU at all.
    slope: number(dataset, '00281053', decoder, 1) || 1,
    intercept: number(dataset, '00281052', decoder, 0),
    rescaleType: text(dataset, '00281054', decoder),

    windowCenters: centers,
    windowWidths: widths,
    windowNames: (dataset?.byTag.get('00281055')?.value
      ? String(decoder.decode(dataset.byTag.get('00281055').value)).split('\\')
      : []).map((name) => name.trim()),
    voiFunction: text(dataset, '00281056', decoder).toUpperCase(),

    // Millimetres between the centres of adjacent pixels, down then across.
    // Without it no measurement on the page can be in anything but pixels, and
    // saying "42 px" where a length was asked for is the honest answer.
    spacing: spacing.length >= 2 ? { row: spacing[0], column: spacing[1] } : null,

    padding: padValue(dataset, decoder, number(dataset, '00280103', decoder, 0) === 1),

    palette: readPalette(dataset, decoder),
  };
}

/**
 * What a scanner writes outside the part of the image it actually reconstructed.
 *
 * The VR of (0028,0120) is US or SS depending on Pixel Representation, and in a
 * file written with implicit VR there is nothing to say which - the data
 * dictionary has one entry and it says US. So the sign is taken from the image
 * rather than from the element, which is what the standard means by tying the
 * two together. Reading a padding value of -2000 as 63536 does not throw and
 * does not draw anything wrong; it silently stops the padding being excluded
 * from the frame's range, and the automatic window becomes two greys.
 */
function padValue(dataset, decoder, signed) {
  if (!dataset?.byTag.has('00280120')) return null;
  const raw = number(dataset, '00280120', decoder, null);
  if (raw === null) return null;
  return signed && raw > 32767 ? raw - 65536 : raw;
}

/**
 * The three colour lookup tables, where the image is indexes rather than
 * colours.
 *
 * The descriptor is three numbers: how many entries, what value the first entry
 * stands for, and how many bits each entry has. The second is the one that
 * catches people - a table may start at 0 or at any other value, and a nuclear
 * medicine image whose first entry is 300 draws as black without it.
 *
 * Entries are 16 bits wide in the file even when the descriptor says 8, which
 * is a wrinkle in the standard rather than in any one file: PS3.3 C.7.6.3.1.6
 * allows an 8-bit table to be packed two entries per word. Both are handled by
 * measuring the data against the count.
 */
function readPalette(dataset, decoder) {
  const descriptor = numbers(dataset, '00281101', decoder);
  if (descriptor.length < 3) return null;

  const [declared, first, bits] = descriptor;
  // A count of 0 means 65536: the field is 16 bits and cannot hold the number.
  const count = declared === 0 ? 65536 : declared;

  const table = (tag) => {
    const element = dataset.byTag.get(tag);
    if (!element?.value) return null;
    const bytes = element.value;
    const out = new Uint8Array(count);
    const eightBit = bytes.length <= count;

    for (let at = 0; at < count; at += 1) {
      if (eightBit) {
        out[at] = bytes[at] ?? 0;
      } else {
        // 16-bit entries, of which only the top eight can be drawn.
        const value = (bytes[at * 2 + 1] << 8) | bytes[at * 2];
        out[at] = bits > 8 ? value >> 8 : value & 0xff;
      }
    }
    return out;
  };

  const red = table('00281201');
  const green = table('00281202');
  const blue = table('00281203');
  if (!red || !green || !blue) return null;

  return { red, green, blue, first, count };
}

/**
 * @typedef {object} Frame
 * @property {number} width
 * @property {number} height
 * @property {number} samples   1 for greyscale, 3 for colour
 * @property {Int32Array|Uint8Array} values  interleaved stored values
 * @property {number} min       the smallest stored value that is not padding
 * @property {number} max
 */

/**
 * One frame of one file.
 *
 * @param {Uint8Array} bytes    the whole file, or the inflated dataset
 * @param {object} pixel        the Pixel Data element from dicom.js
 * @param {object} info         from `imageInfo`
 * @param {object} syntax       from `transferSyntax`
 * @param {number} index        which frame
 * @returns {Frame}
 */
export function decodeFrame(bytes, pixel, info, syntax, index) {
  const { rows, columns, samplesPerPixel } = info;
  if (!rows || !columns) throw refuse('pixels.nosize');

  const count = rows * columns;

  if (syntax.pixels === 'lossless') {
    const fragment = frameFragment(bytes, pixel, info.frames, index);
    const jpeg = decodeJPEGLossless(fragment);
    // A JPEG scan is interleaved by definition, whatever Planar Configuration
    // says about how the file would have stored the same image uncompressed.
    return fromSamples(jpeg.samples, { ...info, planar: false }, jpeg.components,
      count, false);
  }

  if (syntax.pixels === 'rle') {
    const fragment = frameFragment(bytes, pixel, info.frames, index);
    const perSample = Math.max(1, Math.ceil(info.bitsAllocated / 8));
    const raw = decodeRLE(fragment, count, samplesPerPixel, perSample);
    // RLE reassembles into sample order whatever the header's Planar
    // Configuration says, because the segments themselves define the layout.
    return fromBytes(raw, { ...info, planar: false }, count, true);
  }

  if (syntax.pixels !== 'native') {
    throw refuse('pixels.nodecoder', { syntax: syntax.name });
  }

  const frameBytes = nativeFrame(bytes, pixel, info, count, index);
  if (info.subsampled) {
    return fromBytes(expand422(frameBytes, count), { ...info, subsampled: false },
      count, syntax.little);
  }
  return fromBytes(frameBytes, info, count, syntax.little);
}

/** Where one frame's bytes are in an unencapsulated Pixel Data element. */
function nativeFrame(bytes, pixel, info, count, index) {
  const bytesPerSample = Math.ceil(info.bitsAllocated / 8);
  const perFrame = info.bitsAllocated === 1
    ? Math.ceil(count * info.samplesPerPixel / 8)
    : count * (info.subsampled ? 2 : info.samplesPerPixel) * bytesPerSample;

  const start = pixel.offset + perFrame * index;
  const end = Math.min(start + perFrame, pixel.offset + pixel.length, bytes.length);
  if (start >= end) throw refuse('pixels.pastend', { frame: index + 1 });

  const frame = bytes.subarray(start, end);
  if (frame.length < perFrame) {
    // Short, but not empty. A truncated download is exactly the file somebody
    // opens a viewer to look at, so the rows that arrived are drawn and the
    // page says how many did not.
    const padded = new Uint8Array(perFrame);
    padded.set(frame);
    return padded;
  }
  return frame;
}

/**
 * The fragments belonging to one frame of an encapsulated file, joined.
 *
 * Three arrangements are all legal and all common: one fragment per frame, one
 * frame split across several fragments with a Basic Offset Table saying where
 * each starts, and a single-frame image in as many fragments as the encoder
 * felt like. The offset table is trusted where it has one entry per frame; the
 * count is used where it does not; and a single frame simply takes everything.
 */
export function frameFragment(bytes, pixel, frames, index) {
  const list = pixel.fragments ?? [];
  if (list.length === 0) throw refuse('pixels.nofragments');

  let wanted = list;

  if (frames <= 1) {
    wanted = list;
  } else if (list.length === frames) {
    wanted = [list[index]];
  } else if (pixel.offsetTable?.length === frames) {
    // The table is measured from the first byte of the first fragment's item
    // tag, so every fragment's position has to be measured the same way.
    const base = list[0].offset - 8;
    const from = pixel.offsetTable[index];
    const to = index + 1 < frames ? pixel.offsetTable[index + 1] : Infinity;
    wanted = list.filter((part) => part.offset - 8 - base >= from
      && part.offset - 8 - base < to);
  } else {
    throw refuse('pixels.nooffsets', {
      fragments: list.length, frames,
    });
  }

  if (wanted.length === 0) throw refuse('pixels.noframefragment', { frame: index + 1 });
  if (wanted.length === 1) {
    return bytes.subarray(wanted[0].offset, wanted[0].offset + wanted[0].length);
  }

  const total = wanted.reduce((sum, part) => sum + part.length, 0);
  const joined = new Uint8Array(total);
  let at = 0;
  for (const part of wanted) {
    joined.set(bytes.subarray(part.offset, part.offset + part.length), at);
    at += part.length;
  }
  return joined;
}

/**
 * Stored values out of raw bytes.
 *
 * The mask is the part worth reading twice. Bits Allocated is how much room a
 * sample takes; Bits Stored is how much of it is the measurement; High Bit says
 * where inside the word that measurement sits. A 12-bit CT stored in 16 bits
 * with a high bit of 11 has four bits of nothing at the top, and taking the
 * word as it stands gives a picture that is right for every value below 2048
 * and wrong for every value above it - which on a scan is bone.
 */
function fromBytes(bytes, info, count, little) {
  const { bitsAllocated, bitsStored, highBit, signed, samplesPerPixel } = info;
  const total = count * samplesPerPixel;
  const shift = Math.max(0, highBit - bitsStored + 1);
  // At 32 bits there is nothing to mask off and `1 << 32` is not 4294967296 in
  // JavaScript, it is 1. Only RT Dose stores 32-bit samples, and it stores all
  // of them.
  const wide = bitsStored >= 32;
  const mask = wide ? -1 : (1 << bitsStored) - 1;
  const sign = wide ? 0 : 1 << (bitsStored - 1);

  const raw = new Int32Array(total);

  if (bitsAllocated === 1) {
    for (let at = 0; at < total; at += 1) {
      raw[at] = (bytes[at >> 3] >> (at & 7)) & 1;
    }
  } else if (bitsAllocated === 8) {
    for (let at = 0; at < total; at += 1) raw[at] = bytes[at] ?? 0;
  } else if (bitsAllocated === 16) {
    for (let at = 0; at < total; at += 1) {
      const low = bytes[at * 2] ?? 0;
      const high = bytes[at * 2 + 1] ?? 0;
      raw[at] = little ? (high << 8) | low : (low << 8) | high;
    }
  } else if (bitsAllocated === 32) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    for (let at = 0; at < total; at += 1) {
      raw[at] = at * 4 + 4 <= bytes.length ? view.getUint32(at * 4, little) : 0;
    }
  } else {
    throw refuse('pixels.oddbits', { bits: bitsAllocated });
  }

  for (let at = 0; at < total; at += 1) {
    let value = wide ? raw[at] : (raw[at] >> shift) & mask;
    if (sign && signed && (value & sign)) value -= mask + 1;
    raw[at] = value;
  }

  return fromSamples(raw, info, samplesPerPixel, count, true);
}

/**
 * The last two transformations every path shares: planes to pixels, and colour
 * to RGB.
 *
 * `masked` says whether the caller has already applied the bit mask and the
 * sign. The JPEG path has not, because the codec knows its own precision and
 * the DICOM header's idea of the sign is a separate claim about the same bits.
 */
function fromSamples(values, info, samplesPerPixel, count, masked) {
  const { rows, columns, planar, photometric, bitsStored, signed } = info;
  let out = values;

  if (!masked) {
    const mask = (1 << bitsStored) - 1;
    const sign = 1 << (bitsStored - 1);
    const converted = new Int32Array(values.length);
    for (let at = 0; at < values.length; at += 1) {
      let value = values[at] & mask;
      if (signed && (value & sign)) value -= mask + 1;
      converted[at] = value;
    }
    out = converted;
  } else if (!(out instanceof Int32Array)) {
    out = Int32Array.from(out);
  }

  if (samplesPerPixel === 3 && planar) out = interleave(out, count);
  if (samplesPerPixel === 3 && photometric.startsWith('YBR')) {
    out = ybrToRgb(out, count);
  }

  let min = Infinity;
  let max = -Infinity;
  const padding = info.padding;
  for (let at = 0; at < out.length; at += 1) {
    const value = out[at];
    // The padding value is what a scanner writes outside the reconstruction
    // circle. It is often -2000 where the anatomy is -100 to 300, so leaving it
    // in the range makes the automatic window a picture of two greys.
    if (padding !== null && value === padding) continue;
    if (value < min) min = value;
    if (value > max) max = value;
  }
  if (min === Infinity) { min = 0; max = 0; }

  return {
    width: columns,
    height: rows,
    samples: samplesPerPixel === 3 ? 3 : 1,
    values: out,
    min,
    max,
  };
}

/** Three planes, one after another, back into one sample per position. */
function interleave(values, count) {
  const out = new Int32Array(count * 3);
  for (let at = 0; at < count; at += 1) {
    out[at * 3] = values[at];
    out[at * 3 + 1] = values[count + at];
    out[at * 3 + 2] = values[count * 2 + at];
  }
  return out;
}

/**
 * Luminance and two colour differences, back to red, green and blue.
 *
 * The coefficients are the ones in PS3.3 C.7.6.3.1.2, which are ITU BT.601's.
 * `YBR_FULL_422` has already been widened back to one pair of differences per
 * pixel by `expand422` before it reaches here, so there is one path rather than
 * two - and the widening is where the borrowing is explained.
 */
function ybrToRgb(values, count) {
  const out = new Int32Array(count * 3);

  for (let at = 0; at < count; at += 1) {
    const y = values[at * 3];
    const cb = values[at * 3 + 1] - 128;
    const cr = values[at * 3 + 2] - 128;

    out[at * 3] = clamp8(y + 1.402 * cr);
    out[at * 3 + 1] = clamp8(y - 0.344136 * cb - 0.714136 * cr);
    out[at * 3 + 2] = clamp8(y + 1.772 * cb);
  }
  return out;
}

const clamp8 = (value) => (value < 0 ? 0 : value > 255 ? 255 : Math.round(value));

/**
 * `YBR_FULL_422` widened back to three samples a pixel.
 *
 * The file stores Y for both pixels of a pair and then one Cb and one Cr for
 * the two of them together, so the second pixel of every pair simply takes the
 * colour of the first. That is what the format means rather than an
 * approximation made here: the difference channels for that pixel were never
 * recorded. It is only ever used on ultrasound, where the colour is a Doppler
 * overlay on a greyscale picture and losing half of its resolution costs
 * nothing anybody looks at.
 */
function expand422(bytes, count) {
  const out = new Uint8Array(count * 3);
  for (let pair = 0; pair * 2 < count; pair += 1) {
    const from = pair * 4;
    const cb = bytes[from + 2] ?? 0;
    const cr = bytes[from + 3] ?? 0;
    for (let step = 0; step < 2; step += 1) {
      const at = pair * 2 + step;
      if (at >= count) break;
      out[at * 3] = bytes[from + step] ?? 0;
      out[at * 3 + 1] = cb;
      out[at * 3 + 2] = cr;
    }
  }
  return out;
}
