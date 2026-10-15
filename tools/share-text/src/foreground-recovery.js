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
