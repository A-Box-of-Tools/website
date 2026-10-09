/** Conversion uses one settings context, including work after engine readiness. */

import { encodePixels, FORMATS, JPEG } from './codecs.js';
import { readExif } from './boxes.js';
import { fitsInJpeg, uprightExif, withExif } from './exif.js';
import { decodeHeic } from './heif.js';
import { AVIF, decode, encode, release } from './shared/image-convert.js';
import { outName } from './files.js';

/** Each selection keeps its identity even when two camera filenames coincide. */
export function captureBatch(items, { mime, quality, keepExif }) {
  return {
    settings: Object.freeze({ mime, quality, keepExif, hasHeic: items.some(item => !item.avif) }),
    batch: Object.freeze(items.map((item) => Object.freeze({
      id: item.id, file: item.file, avif: item.avif,
      exif: Object.freeze({ ...item.exif }),
    }))),
  };
}

/**
 * Convert one file, which is usually one picture and occasionally several.
 *
 * The whole file is read here rather than at the point it was chosen. It has to
 * be - the decoder wants every byte, and the EXIF block's own offsets are
 * offsets into the complete file - and reading it here means it is held for the
 * length of one conversion instead of for the length of the visit.
 *
 * @returns {Promise<object[]>} one result per picture in the file
 */
export async function convertOne(item, settings, onStep, {
  decodeHeic: readHeic = decodeHeic, encodePixels: writePixels = encodePixels,
  readExif: readMetadata = readExif, decode: readBrowser = decode,
  encode: writeBrowser = encode, release: dispose = release,
} = {}) {
  const { mime, quality, keepExif } = settings;

  if (item.avif) {
    // AVIF uses the browser decoder, so an AVIF-only batch never loads libheif.
    // Metadata preservation remains the HEIC path's job; this copy is pixels.
    onStep('step.decoding');
    const picture = await readBrowser(new Blob([item.file], { type: AVIF }));
    try {
      onStep('step.writing.file', { format: FORMATS[mime].label });
      const blob = await writeBrowser(picture.bitmap, {
        width: picture.width, height: picture.height, mime, quality, background: mime === JPEG ? '#ffffff' : undefined,
      });
      return [{
        inputId: item.id, name: item.file.name, before: item.file.size, after: blob.size, blob,
        mime, quality, width: picture.width, height: picture.height,
        metadata: 'none', exif: item.exif, part: 0, parts: 1,
        outName: outName(item.file.name, mime),
      }];
    } finally { dispose(picture.bitmap); }
  }

  const bytes = new Uint8Array(await item.file.arrayBuffer());

  onStep('step.decoding');
  const pictures = await readHeic(bytes);

  // Read from the whole file rather than from the first 256 KB the list was
  // built off, so a photo whose metadata sits further in is not quietly
  // stripped of it here after the row promised otherwise.
  const tiff = keepExif && mime === JPEG ? readMetadata(bytes) : null;

  const out = [];
  for (const [index, picture] of pictures.entries()) {
    onStep(pictures.length > 1 ? 'step.writing.picture' : 'step.writing.file',
      pictures.length > 1
        ? { index: index + 1, total: pictures.length }
        : { format: FORMATS[mime].label });

    let blob = await writePixels(picture, { mime, quality });
    let metadata = 'none';

    // Only the primary picture gets the metadata. In a file holding several,
    // the EXIF block describes that one - stamping the same date and place onto
    // the others would be inventing facts about them.
    if (tiff && picture.primary) {
      if (fitsInJpeg(tiff)) {
        const patched = withExif(new Uint8Array(await blob.arrayBuffer()), uprightExif(tiff));
        blob = new Blob([patched], { type: JPEG });
        metadata = 'kept';
      } else {
        metadata = 'too large';
      }
    }

    out.push({
      inputId: item.id,
      name: item.file.name,
      before: item.file.size,
      after: blob.size,
      blob,
      mime,
      quality,
      width: picture.width,
      height: picture.height,
      metadata,
      exif: item.exif,
      part: pictures.length > 1 ? index + 1 : 0,
      parts: pictures.length,
      outName: outName(item.file.name, mime, index),
    });
  }
  return out;
}
