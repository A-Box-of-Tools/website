/**
 * The two errors every long job here throws: a cancellation the page ignores,
 * and a message the page looks up.
 *
 * GENERATED INTO EACH TOOL. This file lives at shared/js/errors.js and the
 * build copies it to <tool>/src/shared/errors.js for the tools that ask for
 * it with `js_parts = ["errors", ...]`. It imports nothing.
 *
 * CANCELLATION
 *
 * A job that can be cancelled takes an AbortSignal and asks it, between
 * frames, whether to go on. The answer is thrown, because the job is usually
 * several calls deep when it arrives and unwinding is the point. What is
 * thrown carries the name `AbortError`, which is what the platform's own
 * cancellations are called - a fetch that was aborted, a stream that was
 * cancelled - so a page has one test for "the visitor pressed Cancel", however
 * the job was cancelled, and it is `error.name === 'AbortError'`.
 *
 * The message is never shown. Eleven tools carried this class with a message
 * of their own ("Crop cancelled.", "Export cancelled.") and no page ever put
 * one on screen: every catch checks the name and stops. So the one copy says
 * nothing a visitor would read.
 *
 * A KEY, NOT A SENTENCE
 *
 * Nothing under src/ is translated (see shared/js/phrases.js), so a module
 * that has to say why it stopped hands back a phrase key and lets main.js
 * turn it into the visitor's own sentence. `said` is that error: its message
 * is the key, and `values` are what fill the blanks.
 */

export class AbortedError extends Error {
  constructor() {
    super('aborted');
    this.name = 'AbortError';
  }
}

/** Stop here if the visitor has pressed Cancel. */
export function throwIfAborted(signal) {
  if (signal?.aborted) throw new AbortedError();
}

/**
 * An error whose message is a phrase key; the caller resolves it.
 *
 * @param {string} key  a `data-phrase` in the tool's body
 * @param {Record<string, string|number>} [values]  what fills its blanks
 */
export const said = (key, values = {}) => Object.assign(new Error(key), { values });
