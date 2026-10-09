/** Bounded chunks share a real browser turn rather than only a microtask. */
import { throwIfAborted } from './errors.js';

export function workCheckpoint({ signal, budgetMs = 8 } = {}) {
  let since = performance.now();
  return async (force = false) => {
    throwIfAborted(signal);
    if (force || performance.now() - since >= budgetMs) {
      await new Promise((resolve) => { setTimeout(resolve, 0); });
      throwIfAborted(signal);
      since = performance.now();
    }
  };
}
