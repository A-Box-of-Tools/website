/**
 * Loading and ordering the source images.
 *
 * Full-size bitmaps are deliberately *not* kept in memory: a hundred 12-megapixel
 * photos would be several gigabytes of decoded RGBA. Instead each file is decoded
 * once on import to read its dimensions and build a small thumbnail, then closed.
 * Export re-decodes from the File one image at a time.
 */

const THUMB_MAX = 240;

let nextId = 1;

/** @returns {boolean} */
function isSupportedImage(file) {
  return file.type.startsWith('image/');
}

async function makeThumbnail(bitmap) {
  const scale = Math.min(1, THUMB_MAX / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.8));
  return URL.createObjectURL(blob);
}

/**
 * Each item carries both a frame count and a seconds value. Which one is used
 * depends on the unit the user picked; keeping both means switching units back
 * and forth never loses what was typed.
 *
 * @param {FileList|File[]} files
 * @param {{frames: number, seconds: number}} defaults how long each new image is held
 * @returns {Promise<{items: object[], skipped: string[]}>}
 */
export async function loadImages(files, defaults) {
  const items = [];
  const skipped = [];

  for (const file of Array.from(files)) {
    if (!isSupportedImage(file)) {
      skipped.push(file.name);
      continue;
    }

    let bitmap;
    try {
      // imageOrientation honours EXIF rotation so portrait photos are not sideways.
      bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      skipped.push(file.name);
      continue;
    }

    try {
      items.push({
        id: nextId++,
        file,
        name: file.name,
        width: bitmap.width,
        height: bitmap.height,
        lastModified: file.lastModified,
        frames: defaults.frames,
        seconds: defaults.seconds,
        thumbUrl: await makeThumbnail(bitmap),
      });
    } finally {
      bitmap.close();
    }
  }

  return { items, skipped };
}

/** Decode one item at full size. The caller owns the bitmap and must close it. */
export function decodeFull(item) {
  return createImageBitmap(item.file, { imageOrientation: 'from-image' });
}

/** Release an item's thumbnail object URL. */
export function releaseItem(item) {
  URL.revokeObjectURL(item.thumbUrl);
}

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

/** Sort in place by the given key. 'name' uses natural order, so img2 precedes img10. */
export function sortItems(items, key) {
  if (key === 'name') return items.sort((a, b) => collator.compare(a.name, b.name));
  if (key === 'date') return items.sort((a, b) => a.lastModified - b.lastModified);
  if (key === 'reverse') return items.reverse();
  return items;
}

/** Move the item at `from` to index `to`, shifting the rest. */
export function moveItem(items, from, to) {
  if (to < 0 || to >= items.length || from === to) return items;
  const [moved] = items.splice(from, 1);
  items.splice(to, 0, moved);
  return items;
}
