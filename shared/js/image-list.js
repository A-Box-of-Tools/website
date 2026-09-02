/**
 * A list of pictures to work through in order.
 *
 * GENERATED INTO EACH TOOL. This file lives at shared/js/image-list.js and
 * the build copies it to <tool>/src/shared/image-list.js for the tools that
 * ask for it with `js_parts = ["image-list", ...]`: the GIF maker and the
 * slideshow maker, which carried the same file apart from the size of the
 * thumbnail and what each picture is held for. It imports nothing.
 *
 * Full-size bitmaps are deliberately not kept in memory: a hundred
 * 12-megapixel photos would be several gigabytes of decoded RGBA. Each file is
 * decoded once on import to read its dimensions and build a small thumbnail,
 * then closed. Export re-decodes from the File, one image at a time.
 *
 * What a tool adds to each item is its own business - the GIF maker holds a
 * frame for a number of seconds, the slideshow maker for a number of frames or
 * seconds, whichever unit was typed - so `loadImages` takes a `fields`
 * function and spreads what it returns into the item.
 */

let nextId = 1;

const isImage = (file) => file.type.startsWith('image/');

async function makeThumbnail(bitmap, thumbMax) {
  const scale = Math.min(1, thumbMax / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.8));
  return URL.createObjectURL(blob);
}

/**
 * @param {FileList|File[]} files
 * @param {object} [options]
 * @param {number} [options.thumbMax=240]  the thumbnail's longer side, in pixels
 * @param {(file: File) => object} [options.fields]  what the tool adds to
 *   each item - how long it is held, in the tool's own unit
 * @returns {Promise<{items: object[], skipped: string[]}>}  `skipped` names
 *   the files that were not images or would not decode
 */
export async function loadImages(files, { thumbMax = 240, fields = () => ({}) } = {}) {
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
      // sideways in the result.
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
        ...fields(file),
        thumbUrl: await makeThumbnail(bitmap, thumbMax),
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
