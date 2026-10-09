/**
 * Keep page-by-page work behind cancellation checks without changing its codecs.
 * Native image operations can finish after cancellation; only their owner may
 * keep the returned bytes, and the next page must never begin for a retired run.
 */
import { throwIfAborted } from './shared/errors.js';
import { makeZip } from './shared/zip.js';
import { encodeImage, encodePage } from './encode.js';
import { buildDocument } from './document.js';
import { outName, pageName, stemOf } from './pages.js';

const pause = () => new Promise(resolve => setTimeout(resolve, 0));

export async function writeScan(pages, options, {
  kind, signal, renderPage, report = () => {},
  encodePdfPage = encodePage, encodeImagePage = encodeImage,
  documentWriter = buildDocument, zipWriter = makeZip, yieldControl = pause,
}) {
  const checkpoint = async () => {
    throwIfAborted(signal);
    await yieldControl();
    throwIfAborted(signal);
  };
  throwIfAborted(signal);
  if (!pages.length) throw new Error('build.nopages');
  const encoded = [];
  const files = [];
  const stem = stemOf(pages[0].name);
  let extension = 'jpg';
  for (const [index, page] of pages.entries()) {
    await checkpoint();
    report('busy.page', { done: index + 1, total: pages.length });
    const cleaned = await renderPage(page, options, signal);
    await checkpoint();
    if (kind === 'pdf') {
      encoded.push(await encodePdfPage(cleaned, options, signal));
    } else {
      const written = await encodeImagePage(cleaned, options, signal);
      extension = written.extension;
      files.push({ name: pageName(stem, index, pages.length, extension), blob: written.blob });
    }
    await checkpoint();
  }

  report('busy.writing');
  await checkpoint();
  let blob;
  let name;
  if (kind === 'pdf') {
    blob = documentWriter(encoded, options);
    name = outName(stem, 'pdf');
  } else if (files.length === 1) {
    ({ blob, name } = files[0]);
  } else {
    // Reading at the end avoids retaining every image twice while it is made.
    const entries = await Promise.all(files.map(async ({ name: entryName, blob: image }) => {
      const data = new Uint8Array(await image.arrayBuffer());
      throwIfAborted(signal);
      return { name: entryName, data };
    }));
    await checkpoint();
    blob = zipWriter(entries);
    name = outName(stem, 'zip');
  }
  throwIfAborted(signal);
  return { blob, name, count: pages.length, kind, mono: options.mode === 'mono', extension };
}
