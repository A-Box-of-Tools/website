import { throwIfAborted } from './shared/errors.js';

/** Native decoding owns its bitmap until a current reader accepts the canvas. */
export async function readPicture(file, signal) {
  let bitmap, canvas;
  try {
    throwIfAborted(signal);
    bitmap = await createImageBitmap(file);
    throwIfAborted(signal);
    canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const g = canvas.getContext('2d', { willReadFrequently: true });
    // White is the paper the existing threshold and colour wand agree on.
    g.fillStyle = '#fff';
    g.fillRect(0, 0, canvas.width, canvas.height);
    g.drawImage(bitmap, 0, 0);
    const picture = {
      name: file.name,
      stem: file.name.replace(/\.[^.]+$/, '') || 'drawing',
      canvas,
      image: g.getImageData(0, 0, canvas.width, canvas.height),
    };
    canvas = null;
    return picture;
  } finally {
    bitmap?.close?.();
    if (canvas) canvas.width = canvas.height = 0;
  }
}

export function releasePicture(picture) {
  if (picture) picture.canvas.width = picture.canvas.height = 0;
}

/** Selection, errors and busy cleanup belong to the same source read. */
export function pictureReads({ apply, failed, busy, done }) {
  let pending = null;
  return {
    async read(file) {
      pending?.abort();
      const owner = new AbortController();
      pending = owner;
      busy();
      let picture;
      try {
        picture = await readPicture(file, owner.signal);
        if (pending !== owner) return;
        const accepted = picture;
        picture = null;
        // Ownership transfers before the synchronous pipeline callback.
        apply(accepted);
      } catch (error) {
        if (pending === owner) failed(error);
      } finally {
        releasePicture(picture);
        if (pending === owner) { pending = null; done(); }
      }
    },
    retire() {
      if (!pending) return;
      pending.abort();
      pending = null;
      done();
    },
  };
}
