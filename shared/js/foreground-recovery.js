/** A foreground retry belongs to an explicitly active, consented page session. */
export function foregroundRecovery(retry, {
  visible = () => document.visibilityState !== 'hidden',
  later = setTimeout,
  cancel = clearTimeout,
  exhausted = () => {},
  limit = 3,
  delay = 5000,
} = {}) {
  let active = false;
  let waiting = false;
  let attempts = 0;
  let timer = 0;
  let generation = 0;

  function clear() {
    generation += 1;
    cancel(timer);
    timer = 0;
  }

  function schedule(wait) {
    clear();
    if (!active || !waiting || !visible()) return;
    if (attempts >= limit) {
      active = false;
      waiting = false;
      exhausted();
      return;
    }
    const current = generation;
    timer = later(() => {
      if (current !== generation || !active || !waiting || !visible()) return;
      timer = 0;
      waiting = false;
      attempts += 1;
      retry();
    }, wait);
  }

  return {
    start() { clear(); active = true; waiting = false; attempts = 0; },
    ready() { clear(); waiting = false; attempts = 0; },
    pause() { if (active) { waiting = true; schedule(delay); } },
    foreground() { schedule(0); },
    stop() { clear(); active = false; waiting = false; },
    get active() { return active; },
  };
}

/**
 * Observe page lifecycle without deciding which media or connections should end.
 * Foreground work is coalesced, never emitted on registration, and cannot cross
 * a hidden, suspended or disposed page boundary.
 */
export function observeForeground({
  document = globalThis.document,
  window = globalThis.window,
  foreground = () => {},
  hidden = () => {},
  suspend = () => {},
  restore = () => {},
  blur = () => {},
  queue = queueMicrotask,
} = {}) {
  let disposed = false;
  let suspended = false;
  let queued = false;
  let generation = 0;
  const visible = () => document?.visibilityState !== 'hidden' && document?.hidden !== true;
  const invalidate = () => { generation += 1; queued = false; };
  const enqueue = (event) => {
    if (disposed || queued) return;
    queued = true;
    const current = generation;
    queue(() => {
      if (current !== generation) return;
      queued = false;
      if (!disposed && !suspended && visible()) foreground(event);
    });
  };
  const visibility = (event) => {
    if (disposed) return;
    if (visible()) enqueue(event);
    else { invalidate(); hidden(event); }
  };
  const pagehide = (event) => {
    if (disposed) return;
    suspended = true;
    invalidate();
    suspend(event);
  };
  const pageshow = (event) => {
    if (disposed) return;
    suspended = false;
    restore(event);
    enqueue(event);
  };
  const blurred = (event) => { if (!disposed) blur(event); };
  const listeners = [
    [document, 'visibilitychange', visibility],
    [window, 'pagehide', pagehide],
    [window, 'pageshow', pageshow],
    [window, 'online', enqueue],
    [window, 'blur', blurred],
  ];
  for (const [target, type, listener] of listeners) target?.addEventListener?.(type, listener);
  return () => {
    if (disposed) return;
    disposed = true;
    invalidate();
    for (const [target, type, listener] of listeners) target?.removeEventListener?.(type, listener);
  };
}
