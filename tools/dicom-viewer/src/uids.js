/**
 * The unique identifiers that mean something, and what this tool can do with
 * each of them.
 *
 * A DICOM UID is a dotted number with no readable part at all, and two of them
 * decide everything about whether a file can be opened: the transfer syntax
 * says how the bytes are laid out and how the pixels are compressed, and the
 * SOP class says what kind of picture it is. Printing them raw is what most
 * tools do and is close to useless - `1.2.840.10008.1.2.4.90` is a fact about
 * a file that only tells you anything if you already knew it.
 *
 * WHY THE TABLE CARRIES A CAPABILITY AND NOT JUST A NAME
 *
 * Because the interesting question about a transfer syntax here is not what it
 * is called but whether the picture will appear. There are four answers and
 * they are properties of the syntax, so they belong beside the name rather than
 * in a list of special cases somewhere in the decoder:
 *
 *   native   the pixels are in the file as pixels, uncompressed
 *   rle      run-length encoded, and src/rle.js expands it
 *   jpeg     baseline JPEG, and the browser's own decoder expands it
 *   lossless JPEG lossless, and src/jpeg-lossless.js expands it
 *   no       nothing here can decode it, and the page says so by name
 *
 * The last is not a gap to be quietly ignored. A file this tool cannot draw is
 * still a file whose header it can read completely, so `no` means "show
 * everything except the picture, and say exactly which codec was wanted".
 */

/**
 * uid -> { name, little, explicit, encapsulated, deflated, pixels }
 *
 * `pixels` is one of the five words above. `encapsulated` is what tells the
 * parser that Pixel Data arrives as a sequence of fragments rather than as one
 * run of bytes, and it is true of every compressed syntax there is.
 */
const TRANSFER = {
  '1.2.840.10008.1.2': {
    name: 'Implicit VR Little Endian',
    little: true, explicit: false, pixels: 'native',
  },
  '1.2.840.10008.1.2.1': {
    name: 'Explicit VR Little Endian',
    little: true, explicit: true, pixels: 'native',
  },
  '1.2.840.10008.1.2.1.99': {
    name: 'Deflated Explicit VR Little Endian',
    little: true, explicit: true, deflated: true, pixels: 'native',
  },
  '1.2.840.10008.1.2.2': {
    name: 'Explicit VR Big Endian (retired)',
    little: false, explicit: true, pixels: 'native',
  },
  '1.2.840.10008.1.2.5': {
    name: 'RLE Lossless',
    little: true, explicit: true, encapsulated: true, pixels: 'rle',
  },
  '1.2.840.10008.1.2.4.50': {
    name: 'JPEG Baseline (process 1)',
    little: true, explicit: true, encapsulated: true, pixels: 'jpeg',
  },
  '1.2.840.10008.1.2.4.51': {
    name: 'JPEG Extended (process 2 & 4)',
    little: true, explicit: true, encapsulated: true, pixels: 'jpeg',
  },
  '1.2.840.10008.1.2.4.57': {
    name: 'JPEG Lossless, non-hierarchical (process 14)',
    little: true, explicit: true, encapsulated: true, pixels: 'lossless',
  },
  '1.2.840.10008.1.2.4.70': {
    name: 'JPEG Lossless, first-order prediction (process 14, selection value 1)',
    little: true, explicit: true, encapsulated: true, pixels: 'lossless',
  },
  '1.2.840.10008.1.2.4.80': {
    name: 'JPEG-LS Lossless',
    little: true, explicit: true, encapsulated: true, pixels: 'no',
  },
  '1.2.840.10008.1.2.4.81': {
    name: 'JPEG-LS Lossy (near-lossless)',
    little: true, explicit: true, encapsulated: true, pixels: 'no',
  },
  '1.2.840.10008.1.2.4.90': {
    name: 'JPEG 2000 Image Compression (lossless only)',
    little: true, explicit: true, encapsulated: true, pixels: 'no',
  },
  '1.2.840.10008.1.2.4.91': {
    name: 'JPEG 2000 Image Compression',
    little: true, explicit: true, encapsulated: true, pixels: 'no',
  },
  '1.2.840.10008.1.2.4.92': {
    name: 'JPEG 2000 Part 2 Multi-component (lossless only)',
    little: true, explicit: true, encapsulated: true, pixels: 'no',
  },
  '1.2.840.10008.1.2.4.93': {
    name: 'JPEG 2000 Part 2 Multi-component',
    little: true, explicit: true, encapsulated: true, pixels: 'no',
  },
  '1.2.840.10008.1.2.4.100': {
    name: 'MPEG2 Main Profile / Main Level',
    little: true, explicit: true, encapsulated: true, pixels: 'no',
  },
  '1.2.840.10008.1.2.4.101': {
    name: 'MPEG2 Main Profile / High Level',
    little: true, explicit: true, encapsulated: true, pixels: 'no',
  },
  '1.2.840.10008.1.2.4.102': {
    name: 'MPEG-4 AVC/H.264 High Profile / Level 4.1',
    little: true, explicit: true, encapsulated: true, pixels: 'no',
  },
  '1.2.840.10008.1.2.4.107': {
    name: 'HEVC/H.265 Main Profile / Level 5.1',
    little: true, explicit: true, encapsulated: true, pixels: 'no',
  },
  '1.2.840.10008.1.2.4.201': {
    name: 'High-Throughput JPEG 2000 (lossless only)',
    little: true, explicit: true, encapsulated: true, pixels: 'no',
  },
  '1.2.840.10008.1.2.4.202': {
    name: 'High-Throughput JPEG 2000',
    little: true, explicit: true, encapsulated: true, pixels: 'no',
  },
};

/**
 * What a transfer syntax is and what can be done with it.
 *
 * An unknown UID gets the *safe* reading rather than a throw: explicit VR
 * little endian, encapsulated pixels, no decoder. Every syntax registered since
 * 1995 is explicit little endian, so a file written against a part of the
 * standard newer than this table still has a readable header - which is most of
 * what a viewer is for when it cannot draw the picture.
 */
export function transferSyntax(uid) {
  const found = TRANSFER[uid];
  if (found) return { uid, known: true, deflated: false, encapsulated: false, ...found };
  return {
    uid,
    known: false,
    name: uid ? `Unrecognised transfer syntax ${uid}` : 'No transfer syntax declared',
    little: true,
    explicit: true,
    deflated: false,
    encapsulated: true,
    pixels: 'no',
  };
}

/** The default when a file has no File Meta group at all. PS3.5 section 10. */
export const IMPLICIT_LITTLE = '1.2.840.10008.1.2';

/**
 * What kind of object the file holds.
 *
 * Only the storage classes a person is likely to be looking at, plus the two
 * that are not pictures at all - a structured report and an encapsulated PDF
 * both turn up in an image folder and both would otherwise be reported as a
 * file with no pixels, which is true and unhelpful.
 */
const SOP_CLASS = {
  '1.2.840.10008.5.1.4.1.1.1': 'Computed Radiography Image',
  '1.2.840.10008.5.1.4.1.1.1.1': 'Digital X-Ray Image (for presentation)',
  '1.2.840.10008.5.1.4.1.1.1.1.1': 'Digital X-Ray Image (for processing)',
  '1.2.840.10008.5.1.4.1.1.1.2': 'Digital Mammography X-Ray Image (for presentation)',
  '1.2.840.10008.5.1.4.1.1.1.2.1': 'Digital Mammography X-Ray Image (for processing)',
  '1.2.840.10008.5.1.4.1.1.1.3': 'Digital Intra-Oral X-Ray Image (for presentation)',
  '1.2.840.10008.5.1.4.1.1.2': 'CT Image',
  '1.2.840.10008.5.1.4.1.1.2.1': 'Enhanced CT Image',
  '1.2.840.10008.5.1.4.1.1.3.1': 'Ultrasound Multi-frame Image',
  '1.2.840.10008.5.1.4.1.1.4': 'MR Image',
  '1.2.840.10008.5.1.4.1.1.4.1': 'Enhanced MR Image',
  '1.2.840.10008.5.1.4.1.1.4.2': 'MR Spectroscopy',
  '1.2.840.10008.5.1.4.1.1.6.1': 'Ultrasound Image',
  '1.2.840.10008.5.1.4.1.1.7': 'Secondary Capture Image',
  '1.2.840.10008.5.1.4.1.1.7.1': 'Multi-frame Single Bit Secondary Capture Image',
  '1.2.840.10008.5.1.4.1.1.7.2': 'Multi-frame Greyscale Byte Secondary Capture Image',
  '1.2.840.10008.5.1.4.1.1.7.3': 'Multi-frame Greyscale Word Secondary Capture Image',
  '1.2.840.10008.5.1.4.1.1.7.4': 'Multi-frame True Colour Secondary Capture Image',
  '1.2.840.10008.5.1.4.1.1.12.1': 'X-Ray Angiographic Image',
  '1.2.840.10008.5.1.4.1.1.12.2': 'X-Ray Radiofluoroscopic Image',
  '1.2.840.10008.5.1.4.1.1.20': 'Nuclear Medicine Image',
  '1.2.840.10008.5.1.4.1.1.66': 'Raw Data',
  '1.2.840.10008.5.1.4.1.1.77.1.6': 'VL Whole Slide Microscopy Image',
  '1.2.840.10008.5.1.4.1.1.88.11': 'Basic Text Structured Report',
  '1.2.840.10008.5.1.4.1.1.88.22': 'Enhanced Structured Report',
  '1.2.840.10008.5.1.4.1.1.88.33': 'Comprehensive Structured Report',
  '1.2.840.10008.5.1.4.1.1.104.1': 'Encapsulated PDF',
  '1.2.840.10008.5.1.4.1.1.104.2': 'Encapsulated CDA',
  '1.2.840.10008.5.1.4.1.1.128': 'PET Image',
  '1.2.840.10008.5.1.4.1.1.130': 'Enhanced PET Image',
  '1.2.840.10008.5.1.4.1.1.481.1': 'RT Image',
  '1.2.840.10008.5.1.4.1.1.481.2': 'RT Dose',
  '1.2.840.10008.5.1.4.1.1.481.3': 'RT Structure Set',
  '1.2.840.10008.1.3.10': 'Media Storage Directory (DICOMDIR)',
};

export const sopClass = (uid) => SOP_CLASS[uid] ?? null;

/**
 * A readable name for any UID this file happens to print.
 *
 * Used by the tag table, which shows values of VR `UI` and has no idea which
 * kind of UID it is holding. A study instance UID is nobody's registered name
 * and comes back null, which is correct: it is an identifier the scanner made
 * up, and pretending to have a name for it would be worse than the number.
 */
export function uidName(uid) {
  return sopClass(uid) ?? TRANSFER[uid]?.name ?? null;
}
