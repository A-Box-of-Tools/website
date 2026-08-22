/**
 * Loading, ordering and turning the pictures.
 *
 * Full size bitmaps are deliberately not kept. A hundred phone photos would be
 * several gigabytes of decoded pixels, and the only moment this tool actually
 * needs the pixels is the moment it writes a page. So each file is decoded once
 * on arrival to make a small thumbnail, measured, and then closed; the File
 * itself is what is held on to, and the browser keeps that on disk.
 */

import { inspectJpeg } from './jpeg.js';

const THUMB_MAX = 320;

/**
 * How much of a JPEG is read to find its size and its orientation tag.
 *
 * The frame header sits within the first few kilobytes of essentially every
 * JPEG, but a file carrying a large EXIF preview can push it further down, so
 * this is generous. It is a slice rather than the whole file because holding
 * every chosen photo in memory is exactly what this file exists to avoid. The
 * whole file is read later, once, and only for the pictures that are going into
 * the document untouched - and that read is the one the page is laid out from.
 */
const HEAD_BYTES = 512 * 1024;

let nextId = 1;

/**
 * @param {FileList|File[]} files
 * @returns {Promise<{items: object[], skipped: string[]}>}
 */
export async function loadImages(files) {
  const items = [];
  const skipped = [];

  for (const file of Array.from(files)) {
    if (!looksLikeImage(file)) {
      skipped.push(`${file.name}: not an image this tool can read.`);
      continue;
    }

    let bitmap;
    try {
      // from-image honours the EXIF tag, so the thumbnail is the right way up
      // and the preview never has to think about rotation twice.
      bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      skipped.push(`${file.name}: this browser could not decode it.`);
      continue;
    }

    try {
      const jpeg = await peekJpeg(file);
      // Stored size and orientation, kept as a pair: the picture is `width` by
      // `height` inside the file, and the tag says which way up that is.
      // Everything that lays out a page works from the size those two make
      // together, which is what seenSize in layout.js returns.
      const stored = jpeg
        ? { width: jpeg.width, height: jpeg.height, orientation: jpeg.orientation }
        : { width: bitmap.width, height: bitmap.height, orientation: 1 };

      items.push({
        id: nextId++,
        file,
        name: file.name,
        lastModified: file.lastModified,
        ...stored,
        /** Quarter turns asked for by the buttons on the tile, clockwise. */
        rotate: 0,
        thumb: await makeThumbnail(bitmap),
      });
    } finally {
      bitmap.close();
    }
  }

  return { items, skipped };
}

function looksLikeImage(file) {
  if (file.type) return file.type.startsWith('image/');
  return /\.(jpe?g|png|webp|gif|bmp|avif)$/i.test(file.name);
}

async function peekJpeg(file) {
  if (!/^image\/jpe?g$/i.test(file.type) && !/\.jpe?g$/i.test(file.name)) return null;
  try {
    const head = new Uint8Array(await file.slice(0, HEAD_BYTES).arrayBuffer());
    return inspectJpeg(head);
  } catch {
    return null;
  }
}

/**
 * A small copy of the picture, kept as a decoded <img>.
 *
 * The list and the preview both draw it, and both draw it turned, so what is
 * kept is the upright original rather than a rotated copy: rotating is a
 * transform at drawing time and costs nothing, while re-encoding a thumbnail on
 * every press of the rotate button would slowly grind it into mush.
 */
async function makeThumbnail(bitmap) {
  const scale = Math.min(1, THUMB_MAX / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.82));
  const url = URL.createObjectURL(blob);
  const image = new Image();
  image.src = url;
  try {
    await image.decode();
  } catch {
    // Nothing to do about a thumbnail this page itself just encoded failing to
    // decode; the tile and the preview both skip an image that is not ready.
  }
  return { url, image };
}

/** Release one item's thumbnail. */
export function releaseItem(item) {
  URL.revokeObjectURL(item.thumb.url);
}

/** Turn one picture a quarter circle. Negative goes anticlockwise. */
export function rotateItem(item, quarters) {
  item.rotate = (((item.rotate + quarters * 90) % 360) + 360) % 360;
}

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

/** Sort in place. 'name' is natural order, so page2 comes before page10. */
export function sortItems(items, key) {
  if (key === 'name') return items.sort((a, b) => collator.compare(a.name, b.name));
  if (key === 'date') return items.sort((a, b) => a.lastModified - b.lastModified);
  if (key === 'reverse') return items.reverse();
  return items;
}

/** Move the item at `from` to `to`, shifting everything between. */
export function moveItem(items, from, to) {
  if (to < 0 || to >= items.length || from === to) return items;
  const [moved] = items.splice(from, 1);
  items.splice(to, 0, moved);
  return items;
}
