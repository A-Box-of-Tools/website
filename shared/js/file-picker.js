/**
 * The drop zone and the file picker, which every tool here needs and none of
 * them should own.
 *
 * GENERATED INTO EACH TOOL. This file lives at shared/js/file-picker.js and the
 * build copies it to <tool>/src/shared/file-picker.js, which is why a tool's
 * source folder imports a file it does not contain. Nothing is bundled: each
 * tool still gets its own copy, cached by its own service worker, and a tool
 * folder on the deployed site is still complete on its own. Edit it here.
 *
 * WHAT IS SHARED AND WHAT IS NOT
 *
 * Only choosing the files. What a tool does with them afterwards - the list, the
 * thumbnails, the reordering, the per-row buttons - is the tool's own business
 * and stays in the tool. The markup this drives comes from the same place:
 * templates/partials/file-picker.html, filled in from the [picker] table in each
 * tool.toml.
 *
 * WHY THERE IS NO CLICK HANDLER
 *
 * The drop zone is a <label for="file-input">, so the browser opens the picker
 * itself. Calling .click() on a display:none input is refused outright by Safari
 * and by some Chrome configurations, which is the bug this shape avoids. The
 * input stays in the layout - visually hidden, still focusable, still reachable
 * by keyboard - and there is no JavaScript in that path at all.
 */

import { phrase } from './phrases.js';

/**
 * @typedef {object} Picker
 * @property {(text: string) => void} busy   drop zone shows it is reading
 * @property {() => void} done               back to its resting label
 */

/**
 * @param {object} options
 * @param {HTMLInputElement} options.input      the file input
 * @param {HTMLElement} options.dropzone        the <label> around it
 * @param {(files: File[]) => void} options.onFiles  called with what was chosen
 * @param {string} [options.idleTitle]  resting label; taken from the markup if
 *   left out, so the wording lives in one place rather than two
 * @returns {Picker}
 */
export function wireFilePicker({ input, dropzone, onFiles, idleTitle }) {
  const titleEl = dropzone.querySelector('.dropzone-title');
  const idle = idleTitle ?? titleEl?.textContent ?? '';

  const hand = (files) => {
    const picked = Array.from(files ?? []);
    if (picked.length) onFiles(picked);
  };

  input.addEventListener('change', () => {
    // `input.files` is a live list and resetting `value` empties it, so take a
    // real array first. Clearing the input is what lets somebody pick the same
    // file twice in a row.
    const picked = Array.from(input.files);
    input.value = '';
    hand(picked);
  });

  for (const type of ['dragenter', 'dragover']) {
    dropzone.addEventListener(type, (event) => {
      event.preventDefault();
      dropzone.classList.add('dragover');
    });
  }

  for (const type of ['dragleave', 'drop']) {
    dropzone.addEventListener(type, () => dropzone.classList.remove('dragover'));
  }

  dropzone.addEventListener('drop', (event) => {
    event.preventDefault();
    hand(event.dataTransfer?.files);
  });

  // A file dropped anywhere else on the page would otherwise be opened by the
  // browser, navigating away from the app and throwing away everything chosen
  // so far. Both of these are needed: without the dragover handler the drop
  // never fires at all.
  window.addEventListener('dragover', (event) => event.preventDefault());
  window.addEventListener('drop', (event) => event.preventDefault());

  return {
    busy(text) {
      dropzone.classList.add('busy');
      if (titleEl && text) titleEl.textContent = text;
    },
    done() {
      dropzone.classList.remove('busy');
      if (titleEl) titleEl.textContent = idle;
    },
  };
}

/**
 * "Reading 1 file..." / "Reading 4 files...", said the same way everywhere,
 * and in the language of the page.
 *
 * Two keys rather than one with an `s` appended: the plural of a noun is not a
 * suffix in every language, and a sentence assembled by adding one can only be
 * right in the language it was assembled for.
 */
export function readingLabel(count) {
  return phrase(count === 1 ? 'reading.one' : 'reading.many', { count });
}
