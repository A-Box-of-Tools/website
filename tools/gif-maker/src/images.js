/**
 * Loading and ordering the source images.
 *
 * Full-size bitmaps are deliberately not kept in memory: a hundred 12-megapixel
 * photos would be several gigabytes of decoded RGBA. Each file is decoded once
 * on import to read its dimensions and build a small thumbnail, then closed.
 * Export re-decodes from the File, one image at a time.
 */

const THUMB_MAX = 200;

/**
 * How long a newly added image is held, in seconds. Half a second is about
 * where a slideshow of photographs stops feeling like a flicker, and it is what
 * most people are about to type anyway.
 */
export const DEFAULT_DELAY = 0.5;

/**
 * The shortest and longest a frame may be held.
 *
 * The floor is not arbitrary. A GIF stores its delay in hundredths of a second,
 * and browsers have clamped anything under two of them to a tenth of a second
 * since the 1990s - a rule that outlived the spinning-globe animations it was
 * written for. Offering 0.01s would be offering a number that silently becomes
 * 0.1s in every browser there is.
 */
export const MIN_DELAY = 0.02;
export const MAX_DELAY = 60;

let nextId = 1;

const isImage = (file) => file.type.startsWith('image/');

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
 * @param {FileList|File[]} files
 * @param {number} delay  seconds each new image is held
 * @returns {Promise<{items: object[], skipped: string[]}>}
 */
export async function loadImages(files, delay) {
  const items = [];
  const skipped = [];

  for (const file of Array.from(files)) {
    if (!isImage(file)) {
      skipped.push(file.name);
      continue;
    }

    let bitmap;
    try {
      // imageOrientation honours EXIF rotation, so portrait photos are not
      // sideways in the animation.
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
        delay: clampDelay(delay),
        thumbUrl: await makeThumbnail(bitmap),
      });
    } finally {
      bitmap.close();
    }
  }

  return { items, skipped };
}

/** A delay in seconds, rounded to the hundredths the format actually stores. */
export function clampDelay(seconds) {
  const value = Number(seconds);
  if (!Number.isFinite(value)) return DEFAULT_DELAY;
  return Math.min(MAX_DELAY, Math.max(MIN_DELAY, Math.round(value * 100) / 100));
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
