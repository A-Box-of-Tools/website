/**
 * The capability question, asked on a thread that is not the page's.
 *
 * GENERATED INTO EACH TOOL. This file lives at shared/js/codec-probe.js and
 * the build copies it to <tool>/src/shared/codec-probe.js for the tools that
 * ask for it with `js_parts = ["codec-support", "codec-probe", ...]`. It is a
 * Worker rather than a module: nothing imports it, and codec-support.js beside
 * it names it with `new URL('./codec-probe.js', import.meta.url)`. The two
 * always ship together - buildlib/imports.py fails a build that ships one
 * without the other, the same way it does for zip.js and crc32.js.
 *
 * WHY A WHOLE THREAD FOR ONE QUESTION
 *
 * `VideoEncoder.isConfigSupported` is specified to return a promise, and every
 * browser that implements the class is expected to settle it. One does not,
 * and it does not merely leave the promise pending: it blocks the thread that
 * asked. Nothing that thread was going to do next happens - not the deadline
 * codec-support.js sets, not the error handler, not the sentence the tool
 * meant to show instead. On the WebKit build this site's QA suite runs
 * against, a click on Create video was still unanswered five minutes later.
 *
 * A deadline can only be kept by a thread that is still running, which is the
 * whole reason this file exists. The question is asked here and the clock is
 * watched over there. When this thread is the one that stops, the page is
 * still able to notice the silence, terminate it, and say so.
 */

/**
 * Say hello, before any question arrives.
 *
 * The page waits for this before trusting a silence. A worker that never
 * loaded - a Content-Security-Policy with no worker-src, a browser with no
 * Worker at all, a build that failed to ship this file - says nothing in
 * exactly the way a wedged one says nothing, and the two need opposite
 * answers: ask on the page instead, or refuse and tell the visitor. This
 * message is the only thing that tells them apart.
 */
self.postMessage({ ready: true });

self.addEventListener('message', async ({ data }) => {
  const { id, name, config } = data;
  const codec = globalThis[name];

  // Not the same as "cannot encode". Every browser that offers WebCodecs to a
  // window offers it to a worker as well, so this is not expected - but where
  // it happens the page can still ask on its own thread, and an answer from
  // there beats a guess from here.
  if (typeof codec?.isConfigSupported !== 'function') {
    self.postMessage({ id, absent: true });
    return;
  }

  try {
    const answer = await codec.isConfigSupported(config);
    self.postMessage({ id, supported: Boolean(answer && answer.supported) });
  } catch {
    // A codec string this browser cannot even parse, or a class that threw
    // rather than rejecting. The browser did answer, in its own way, and the
    // answer was no.
    self.postMessage({ id, supported: false });
  }
});
