/**
 * A line on the page that is either saying something or hidden.
 *
 * GENERATED INTO EACH TOOL. This file lives at shared/js/message-box.js and
 * the build copies it to <tool>/src/shared/message-box.js for the tools that
 * ask for it with `js_parts = ["message-box", ...]`. It imports nothing.
 *
 * Every tool has an error line under its drop zone, most have a second one
 * under the controls, and the PDF tools have a note beside the file they
 * opened. Showing one is two statements and clearing it is the same two the
 * other way round, and thirty-five tools had written that pair between two
 * and four times each - sixty-odd copies of the same four lines, differing
 * only in which element they named. So the element is named once, here, and
 * a tool keeps the names its call sites already use:
 *
 *   const { show: showError, clear: clearError } = messageBox(el.error);
 *
 * `hidden` rather than a class, because the frame's stylesheet gives `.error`
 * its look and `[hidden]` its absence, and a box with an empty string in it
 * would still be a box.
 */

/**
 * @param {HTMLElement} element  the line, hidden until there is something to say
 * @param {object} [options]
 * @param {() => void} [options.onShow]  run after each message is shown; the
 *   formatter pages use it to say that the result panel is empty
 * @returns {{show: (message: string) => void, clear: () => void}}
 */
export function messageBox(element, { onShow } = {}) {
  return {
    show(message) {
      element.textContent = message;
      element.hidden = false;
      onShow?.();
    },
    clear() {
      element.textContent = '';
      element.hidden = true;
    },
  };
}
