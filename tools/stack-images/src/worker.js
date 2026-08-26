/**
 * The worker the stacking runs in.
 *
 * This is the first tool in this repository with one, and it is here for a
 * reason that does not apply to the others: a stack is minutes of solid
 * arithmetic over hundreds of megabytes, not the second or two a resize or a
 * crop takes. On the main thread that is a frozen page - no progress bar
 * moving, no Cancel button that answers, and a browser eventually offering to
 * kill the tab. Every other tool here is quick enough that a worker would be
 * ceremony; this one is not.
 *
 * WHAT CROSSES THE BOUNDARY, AND WHAT DELIBERATELY DOES NOT
 *
 * The Files themselves go over, which costs nothing: a File is a handle to
 * bytes on disk rather than the bytes, so posting one hands the worker the
 * right to read it and copies nothing. That is also what keeps the promise this
 * whole site makes - the worker slices those files itself, on this machine, and
 * has no way to send anything anywhere.
 *
 * What does not cross is pixels. Decoding, aligning, accumulating and encoding
 * all happen here, and the only image data that goes back is a thumbnail per
 * frame and the finished picture, both as Blobs.
 *
 * HOW CANCELLING WORKS
 *
 * By the worker's own event loop, not by a shared flag. Every frame ends with
 * an await - on a decode, or on a readback - and returning to the event loop is
 * what lets a queued `cancel` message be delivered. So a cancel is noticed
 * within one frame, which on the largest frames anybody stacks is a fraction of
 * a second. A SharedArrayBuffer would notice sooner and is not available: it
 * needs cross-origin isolation headers, and those break the advertising that
 * pays for this site. See docs/what-can-be-built-here.md.
 */

import { Cancelled, inspect, runStack } from './pipeline.js';

let cancelled = false;
let working = false;

/**
 * Work waiting its turn.
 *
 * There is one of everything in here - one decoder to queue against, one set of
 * accumulators - so two jobs must not overlap. The queue is what makes that
 * safe rather than lossy: dropping a message instead would mean that somebody
 * who adds a second folder of RAW files while the first is still being opened
 * gets rows that never fill in and a drop zone that never stops saying it is
 * reading. Which is exactly what a second folder of RAW files is for.
 */
const waiting = [];

self.onmessage = (event) => {
  const message = event.data;

  if (message?.type === 'cancel') {
    cancelled = true;
    return;
  }
  if (message?.type !== 'run' && message?.type !== 'inspect') return;

  waiting.push(message);
  pump();
};

async function pump() {
  if (working) return;
  working = true;

  const hooks = {
    cancelled: () => cancelled,
    onProgress: (update) => self.postMessage({ type: 'progress', update }),
  };

  try {
    while (waiting.length) {
      const message = waiting.shift();
      // Cleared per job, not per batch: a cancel arriving during one job must
      // not still be set when the next one starts.
      cancelled = false;
      try {
        if (message.type === 'inspect') {
          // The id is echoed back. Two batches can be in flight from the page's
          // point of view, and without it their answers arrive looking alike.
          self.postMessage({
            type: 'inspected', id: message.id, found: await inspect(message.files, hooks),
          });
        } else {
          self.postMessage({ type: 'done', result: await runStack(message.request, hooks) });
        }
      } catch (error) {
        if (error instanceof Cancelled) {
          self.postMessage({ type: 'cancelled', id: message.id });
        } else {
          // The message is a phrase key wherever the pipeline raised it
          // deliberately and a browser's own text where it did not; main.js
          // resolves the first and shows the second. Nothing a visitor reads is
          // written in here - see "The strings in the JavaScript" in the
          // repository README.
          self.postMessage({
            type: 'error', id: message.id, message: String(error?.message ?? 'error.unknown'),
          });
        }
      }
    }
  } finally {
    working = false;
  }
}
