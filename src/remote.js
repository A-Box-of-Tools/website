/**
 * Loading images from web addresses.
 *
 * Deliberately uses <img> rather than fetch(). The page's CSP keeps
 * `connect-src 'none'`, so fetch/XHR/WebSocket/sendBeacon stay impossible and
 * nothing can ever be sent out. Only `img-src` is opened up, which is a
 * one-way door: images come in, data cannot go out.
 *
 * Each image is copied into a local Blob straight away, so the rest of the app
 * treats it exactly like a file picked from disk and the network is never
 * touched again — not during preview, and not during export.
 */

const TIMEOUT_MS = 20000;

/** Re-encode quality. The result is headed into a lossy video codec regardless. */
const JPEG_QUALITY = 0.95;

function filenameFromUrl(url) {
  const last = url.pathname.split('/').filter(Boolean).pop() || 'image';
  const decoded = decodeURIComponent(last);
  return /\.(jpe?g|png|webp|gif|avif|bmp)$/i.test(decoded) ? decoded : `${decoded}.jpg`;
}

/**
 * Parse and validate one address.
 * @throws {Error} with a message suitable for showing to the user
 */
export function parseImageUrl(raw) {
  let url;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new Error(`Not a valid web address: ${raw.trim().slice(0, 60)}`);
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error(`Only http and https addresses are supported (got ${url.protocol}).`);
  }
  return url;
}

/**
 * Download one image and hand back a local File.
 *
 * @param {string} raw a URL
 * @returns {Promise<File>}
 */
export async function fetchImageAsFile(raw) {
  const url = parseImageUrl(raw);

  const img = new Image();
  // Without CORS permission the canvas would be tainted and the frame could
  // never be encoded. Requesting it up front turns that into an honest load
  // failure we can explain, instead of a confusing error at export time.
  img.crossOrigin = 'anonymous';
  img.decoding = 'async';
  img.referrerPolicy = 'no-referrer'; // do not leak this page's address

  let timer;
  try {
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => reject(new Error(
        `Could not load ${url.hostname}. The server may not allow other sites to `
        + 'use its images (no CORS header), or the address may be wrong.',
      ));
      timer = setTimeout(() => reject(new Error(`${url.hostname} did not respond within 20 seconds.`)), TIMEOUT_MS);
      img.src = url.href;
    });
  } finally {
    clearTimeout(timer);
  }

  if (!img.naturalWidth || !img.naturalHeight) {
    throw new Error(`${url.hostname} returned something that is not a usable image.`);
  }

  // Copy the pixels into a local blob. From here on the image lives entirely
  // on this machine and the address is never requested again.
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  canvas.getContext('2d', { alpha: false }).drawImage(img, 0, 0);

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error('Could not copy the image locally.'))),
      'image/jpeg',
      JPEG_QUALITY,
    );
  });

  return new File([blob], filenameFromUrl(url), { type: 'image/jpeg' });
}

/**
 * Download several addresses, reporting progress as it goes. One bad address
 * never stops the rest.
 *
 * Each success is returned paired with the address it came from. Keeping them
 * together matters: when some downloads fail the results no longer line up
 * with the input list by index, and attributing an image to the wrong site
 * would be worse than showing nothing.
 *
 * @returns {Promise<{
 *   downloaded: {file: File, url: URL}[],
 *   failures: {url: string, reason: string}[]
 * }>}
 */
export async function fetchImages(urls, onProgress) {
  const downloaded = [];
  const failures = [];

  for (let i = 0; i < urls.length; i++) {
    onProgress?.({ done: i, total: urls.length, url: urls[i] });
    try {
      downloaded.push({ file: await fetchImageAsFile(urls[i]), url: parseImageUrl(urls[i]) });
    } catch (error) {
      failures.push({ url: urls[i], reason: error.message });
    }
  }

  onProgress?.({ done: urls.length, total: urls.length });
  return { downloaded, failures };
}
