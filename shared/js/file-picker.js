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

  /**
   * Say what a dimmed card is waiting for.
   *
   * The last step of a tool is on the page from the start and dimmed, so the
   * whole job can be read before anything is handed over. What that left on
   * eleven tools was a heading and a disabled button and nothing else - "3
   * Compress", "4 Your stills", "2 What it says" - which tells a reader that
   * the step exists and not what would open it.
   *
   * One sentence, from the frame, because `inert` comes off in exactly one
   * place: the moment files arrive, below. So it is the same answer on every
   * card that carries it.
   */
  const sayWaiting = () => {
    for (const card of document.querySelectorAll('main .card[inert]')) {
      if (card.querySelector('.card-waiting')) continue;
      const line = document.createElement('p');
      line.className = 'card-waiting';
      line.textContent = phrase('card.waiting');
      // Where a lede would be, rather than at the end under the controls it
      // is explaining.
      const heading = card.querySelector('h2');
      if (heading) heading.after(line);
      else card.prepend(line);
    }
  };

  const hand = (files) => {
    const picked = Array.from(files ?? []);
    if (!picked.length) return;
    // The last step of a tool is on the page from the start but inert, so the
    // whole job can be read before anything is handed over. This is the moment
    // it stops waiting, and it is done here because this is the one place every
    // tool's files arrive through - from the input or from a drop - so no tool
    // has to remember to do it. `inert` is used for nothing else on these
    // pages; see .card[inert] in tool-frame.css.
    for (const card of document.querySelectorAll('main .card[inert]')) {
      // Remembered, so a tool that turns the file away can put the card back
      // the way it found it. See waiting() below.
      card.dataset.waited = 'yes';
      card.removeAttribute('inert');
    }
    // The card is not waiting any more, so it stops saying so.
    for (const line of document.querySelectorAll('main .card .card-waiting')) line.remove();
    onFiles(picked);
  };

  sayWaiting();

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
    /**
     * Put the last step back to waiting.
     *
     * `inert` comes off the moment files are handed over, which is right for
     * a file the tool can read and wrong for one it cannot: a refused file
     * left split-gif's frames card live and empty, its Select all and Start
     * again buttons offering to act on nothing, under a line saying the file
     * was not a GIF at all.
     *
     * Called by a tool from the place it already knows the answer - its own
     * failure path - because that is the only place the answer exists. The
     * hand-over cannot wait for it: onFiles is fire and forget, and several
     * tools read their files asynchronously.
     */
    waiting() {
      for (const card of document.querySelectorAll('main .card')) {
        if (card.dataset.waited === 'yes') card.setAttribute('inert', '');
      }
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
