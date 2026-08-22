/**
 * "Add from a web address": the one thing on this site that touches the network.
 *
 * GENERATED INTO EACH TOOL. Lives at shared/js/url-import.js; the build copies
 * it to <tool>/src/shared/url-import.js for any tool whose tool.toml sets
 * [picker.urls]. That flag also pulls in the matching stylesheet and widens
 * that page's img-src, so the three cannot drift apart.
 *
 * WHICH TOOLS MAY USE THIS, AND WHICH MAY NOT
 *
 * The image is copied through a <canvas>, which means it arrives as a
 * RE-ENCODED JPEG rather than the bytes the server sent. That is fine for a
 * tool that is going to re-encode anyway, and wrong - not merely imperfect -
 * for one that is not:
 *
 *   - a metadata viewer would show tags that a canvas had already destroyed;
 *   - a compressor would report its saving against a re-encode rather than
 *     against the file somebody actually has;
 *   - a tool that copies JPEG data into a container without decoding it would
 *     have decoded it after all.
 *
 * So this is opt-in per tool, and the test is not "would it work" but "would
 * the answer still be true". If it would not, the tool goes without.
 *
 * WHY <img> AND NOT fetch()
 *
 * The page's Content-Security-Policy keeps connect-src closed, so fetch, XHR,
 * WebSocket and sendBeacon remain impossible and nothing can ever be sent out.
 * Only img-src is opened, and that is a one-way door: pictures come in, data
 * cannot go out. Keeping the original bytes would mean fetch(), which would
 * mean opening connect-src to arbitrary origins - and the promise that there is
 * nowhere for your files to go would stop being true. The re-encode is the
 * price of keeping it.
 *
 * Each image is copied into a local Blob straight away, so the rest of the app
 * treats it exactly like a file picked from disk and the network is never
 * touched again - not during preview, and not during export.
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


/* ---------------------------------------------------------------- the panel */

/**
 * Wire the panel rendered by templates/partials/url-import.html.
 *
 * The tool keeps its own error reporting and its own idea of what to do with
 * the files, because those differ; what is shared is the parsing, the
 * downloading, the progress line and the disabled-while-busy handling, which
 * do not.
 *
 * @param {object} options
 * @param {HTMLTextAreaElement} options.input   the addresses, one per line
 * @param {HTMLButtonElement} options.button    the download button
 * @param {HTMLElement} options.status          the live progress line
 * @param {(downloaded: {file: File, url: URL}[]) => void|Promise<void>} options.onFiles
 *   called with what arrived, each file paired with the address it came from so
 *   the tool can attribute it. Never called with an empty list.
 * @param {(message: string) => void} options.onError
 * @param {() => void} [options.onClear]  clear whatever onError last showed
 */
export function wireUrlImport({ input, button, status, onFiles, onError, onClear }) {
  let busy = false;

  button.addEventListener('click', async () => {
    if (busy) return;

    const lines = input.value.split('\n').map((s) => s.trim()).filter(Boolean);
    if (!lines.length) {
      status.textContent = 'Paste at least one address first.';
      return;
    }

    // Reject malformed addresses before touching the network at all.
    const valid = [];
    const rejected = [];
    for (const line of lines) {
      try {
        parseImageUrl(line);
        valid.push(line);
      } catch (error) {
        rejected.push(error.message);
      }
    }

    if (!valid.length) {
      onError(rejected.join(' '));
      status.textContent = 'Nothing to download.';
      return;
    }

    busy = true;
    button.disabled = true;
    onClear?.();

    try {
      const { downloaded, failures } = await fetchImages(valid, ({ done, total }) => {
        status.textContent = `Downloading ${Math.min(done + 1, total)} of ${total}...`;
      });

      status.textContent = downloaded.length
        ? `Downloaded ${downloaded.length} of ${valid.length}.`
        : 'Nothing could be downloaded.';

      if (downloaded.length) {
        await onFiles(downloaded);
        input.value = '';
      }

      const problems = [...rejected, ...failures.map((f) => `${f.url}: ${f.reason}`)];
      if (problems.length) onError(problems.join('\n'));
    } catch (error) {
      onError(error.message);
      status.textContent = 'Download failed.';
    } finally {
      busy = false;
      button.disabled = false;
    }
  });
}
