import { frameData } from './gif.js';
import { lzwSteps } from './lzw.js';
import { Compositor, paintFrameSteps } from './frames.js';
import { readSteps } from './analysis-steps.js';
import { analysisMemory, PIXEL_BUDGET, WORKING_LIMIT, thumbnailSize } from './analysis-memory.js';
import { workCheckpoint } from './shared/cooperative-work.js';

/** Retired thumbnails own native backing stores even when they never reached the DOM. */
export function releaseDrawn(drawn) {
  for (const frame of drawn ?? []) for (const canvas of [frame?.stored, frame?.composited]) {
    if (canvas) { canvas.width = canvas.height = 0; canvas.remove(); }
  }
}

function* sameSteps(a, b) {
  for (let at = 0; at < a.length; at += 1) {
    if (a[at] !== b[at]) return false;
    if (at && at % 8192 === 0) yield;
  }
  return true;
}

function thumbnail(pixels, width, height, label, pending) {
  const { shown, store } = thumbnailSize(width, height);
  const canvas = document.createElement('canvas');
  pending.add(canvas);
  let scratch;
  try {
    canvas.width = store.width; canvas.height = store.height;
    canvas.className = 'frame-canvas';
    canvas.style.width = `${shown.width}px`; canvas.style.height = `${shown.height}px`;
    canvas.setAttribute('role', 'img'); canvas.setAttribute('aria-label', label);
    const context = canvas.getContext('2d'), image = new ImageData(pixels, width, height);
    if (store.width === width && store.height === height) context.putImageData(image, 0, 0);
    else {
      scratch = document.createElement('canvas');
      scratch.width = width; scratch.height = height;
      scratch.getContext('2d').putImageData(image, 0, 0);
      context.drawImage(scratch, 0, 0, store.width, store.height);
    }
    return canvas;
  } finally { if (scratch) scratch.width = scratch.height = 0; }
}

/** Any missing dependency ends drawing; the literal parsed analysis remains complete. */
export async function drawAnalysis(gif, bytes, { signal, onProgress, label,
  pixelBudget = PIXEL_BUDGET, limitBytes = WORKING_LIMIT } = {}) {
  const drawn = gif.frames.map(() => null), pending = new Set();
  const checkpoint = workCheckpoint({ signal });
  let compositor, previous = null, spent = 0, retainedBytes = 0, identical = 0;
  let reason = null, preserve = false;
  try {
    await checkpoint(true);
    if (!gif.width || !gif.height) reason = { key: 'drawing.empty', values: {} };
    else if (!analysisMemory(gif, bytes.byteLength, { limitBytes }).fits) {
      reason = { key: 'drawing.memory', values: {} };
    }
    if (!reason) compositor = new Compositor(gif.width, gif.height);
    for (const frame of gif.frames) {
      if (reason) break;
      onProgress?.({ done: frame.index, total: gif.frames.length });
      const pixels = frame.width * frame.height;
      if (!pixels) reason = { key: 'drawing.empty', values: {} };
      else if (spent + pixels > pixelBudget) reason = { key: 'drawing.pixels', values: {} };
      else if (!analysisMemory(gif, bytes.byteLength, { frame, retainedBytes, limitBytes }).fits) {
        reason = { key: 'drawing.memory', values: {} };
      }
      if (reason) break;
      spent += pixels;
      const stream = await readSteps(lzwSteps(frameData(bytes, frame), frame.minCodeSize, pixels), checkpoint);
      const painted = await readSteps(paintFrameSteps(frame, stream.indices, frame.palette ?? gif.globalPalette), checkpoint);
      const composited = await readSteps(compositor.drawSteps(frame, painted.pixels), checkpoint);
      const matchesPrevious = previous && await readSteps(sameSteps(previous, composited), checkpoint);
      previous = composited;
      const stored = thumbnail(painted.pixels, frame.width, frame.height, label('shot.stored', frame.index + 1), pending);
      await checkpoint();
      const shown = thumbnail(composited, gif.width, gif.height, label('shot.composited', frame.index + 1), pending);
      await checkpoint();
      drawn[frame.index] = { stored, composited: shown, used: painted.used, missing: painted.missing,
        clears: stream.clears, codes: stream.codes, pixels: stream.pixels,
        truncated: stream.truncated, corrupt: stream.corrupt,
        ratio: frame.payloadBytes > 0 ? pixels / frame.payloadBytes : 0 };
      pending.delete(stored); pending.delete(shown);
      if (matchesPrevious) identical += 1;
      retainedBytes += (stored.width * stored.height + shown.width * shown.height) * 4 + painted.used.byteLength;
      onProgress?.({ done: frame.index + 1, total: gif.frames.length });
      await checkpoint((frame.index + 1) % 8 === 0);
    }
    preserve = true;
    return { drawn, identical, reason };
  } catch (error) {
    if (!signal?.aborted) throw error;
    preserve = true;
    return { drawn, identical, reason: drawn.every(Boolean) ? null
      : { key: 'drawing.cancelled', values: {} } };
  } finally {
    if (!preserve) releaseDrawn(drawn);
    for (const canvas of pending) { canvas.width = canvas.height = 0; canvas.remove(); }
    if (compositor) { compositor.pixels = null; compositor.saved = null; }
    previous = null;
  }
}
