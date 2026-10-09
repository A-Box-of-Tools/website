/** Native format converters keep completed files when another input fails. */

import { decode, encode, FORMATS, outName, release, uniqueNames } from './image-convert.js';

/** Names and source facts stay attached to the selected batch, including failed jobs. */
export function prepareImageBatch(items, settings) {
  const captured = Object.freeze({ ...settings });
  const sources = items.map((item) => Object.freeze({ ...item }));
  const names = uniqueNames(sources.map((item) => outName(item.file.name, FORMATS[captured.mime].ext)));
  return Object.freeze({
    settings: captured,
    jobs: Object.freeze(sources.map((item, index) => Object.freeze({ item, name: names[index] }))),
  });
}

const writeImage = async (bitmap, settings) => ({ blob: await encode(bitmap, settings) });
const yieldTurn = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Each writer returns an envelope rather than just a Blob, so encodeWebp can
 * keep the lossless verdict read from its own output bytes. No wording or DOM
 * belongs here: the caller resolves each failed input's error key and values.
 *
 * Native decoding and encoding cannot be aborted. A stop during decoding skips
 * its write; a stop during writing keeps that completed result and starts no
 * later job. Every decoded bitmap belongs to this call until its finally exit.
 */
export async function convertImageBatch(plan, {
  read = decode, write = writeImage, dispose = release,
  onProgress = () => {}, shouldStop = () => false, yieldControl = yieldTurn,
} = {}) {
  const results = [];
  const failures = [];
  let stopped = false;

  for (const [index, { item, name }] of plan.jobs.entries()) {
    if (shouldStop()) { stopped = true; break; }
    onProgress(index, plan.jobs.length, item);
    await yieldControl();
    if (shouldStop()) { stopped = true; break; }

    let decoded;
    try {
      decoded = await read(item.file);
      if (shouldStop()) { stopped = true; break; }
      const written = await write(decoded.bitmap, {
        ...plan.settings, width: decoded.width, height: decoded.height,
      });
      results.push({ ...written, item, name, settings: plan.settings });
    } catch (error) {
      failures.push({ item, error });
    } finally {
      if (decoded) dispose(decoded.bitmap);
    }
    if (shouldStop()) { stopped = true; break; }
  }

  return { results, failures, stopped, total: plan.jobs.length };
}
