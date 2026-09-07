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
 * @param {() => Promise<File[]|File>} [options.example]  builds this tool's
 *   worked example, for the button the partial renders when the tool's [picker]
 *   table says `example = true`. See wireExample below.
 * @returns {Picker}
 */
export function wireFilePicker({ input, dropzone, onFiles, idleTitle, example }) {
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

  /**
   * The last step of a tool is on the page from the start but inert, so the
   * whole job can be read before anything is handed over. This is the moment it
   * stops waiting.
   *
   * Split out of `hand` because files are not the only way input arrives. The
   * five text tools take theirs by typing, by pasting, and from their own "Try
   * an example" button, and for as long as this lived inside `hand` all three
   * of those left the last card dimmed - with its Copy and Download buttons
   * unclickable and a line underneath saying it would open as soon as a file
   * was chosen - directly above the finished result. `inert` is used for
   * nothing else on these pages; see .card[inert] in tool-frame.css.
   */
  const wake = () => {
    for (const card of document.querySelectorAll('main .card[inert]')) {
      // Remembered, so a tool that turns the file away can put the card back
      // the way it found it. See waiting() below.
      card.dataset.waited = 'yes';
      card.removeAttribute('inert');
    }
    // The card is not waiting any more, so it stops saying so.
    for (const line of document.querySelectorAll('main .card .card-waiting')) line.remove();
  };

  const hand = (files) => {
    const picked = Array.from(files ?? []);
    if (!picked.length) return;
    wake();
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

  const busy = (text) => {
    dropzone.classList.add('busy');
    if (titleEl && text) titleEl.textContent = text;
  };

  const done = () => {
    dropzone.classList.remove('busy');
    if (titleEl) titleEl.textContent = idle;
  };

  // The example goes in through `hand` like any other file, which is the whole
  // reason it is wired here rather than in each tool: everything that happens
  // when a visitor drops a file - the last card waking up, its waiting line
  // going away, onFiles being called with a real File - happens for the example
  // too, and no tool has to remember any of it.
  if (example) wireExample({ example, hand, busy, done, dropzone });

  return {
    busy,
    done,
    /**
     * Input arrived by a route this module does not own - typed into a box,
     * pasted, or put there by the tool's own example button - so wake the last
     * step as though a file had been dropped.
     *
     * The counterpart of `waiting()` below, and tools that take text call the
     * pair from wherever they already know whether there is anything to work
     * on.
     */
    arrived: wake,
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
      // And it says so again. These two arrived as separate changes - one
      // puts the card back when a file is turned away, the other gives a
      // waiting card its sentence - so a refused file dimmed the card and
      // left it as bare as it was before either of them.
      sayWaiting();
    },
  };
}

/**
 * The "Load example" button, for the visitor who wants to see what a tool does
 * before deciding whether to hand it anything of their own.
 *
 * WHY THE EXAMPLE IS BUILT AND NOT FETCHED
 *
 * `connect-src` in config/site.toml names no origin belonging to this site, so
 * `fetch('/examples/whatever')` is refused by the page's own policy. That is
 * not an oversight to work around: the live check in trust.js reads every
 * resource the page pulled, and a sample file would show up in it as a request
 * the visitor never asked for, on the one line of the page whose job is to be
 * checked. So a tool's example.js assembles its file out of what the browser
 * already has - a canvas, an encoder, one of the writers under shared/js - and
 * hands back a File. blob: and data: are not fetches; trust.js leaves them out
 * of everything, and the panel stays as green as it was.
 *
 * Building one can take a moment - an MP4 goes through a real encoder - so the
 * drop zone says it is working, and the button is out of action until it is.
 *
 * WHERE THE BUTTON ENDS UP
 *
 * On the step's own heading row, over on the right. The partial renders it
 * under the drop zone because that is where it can be written once for every
 * tool - the heading is each tool's own markup, in its own body.html, in
 * fifteen languages - so it is moved here instead of being declared there
 * thirty-seven times over.
 *
 * It is put beside the <h2> rather than inside it. A <button> is valid
 * phrasing content within a heading and it would lay out identically, but the
 * heading's accessible name would become "1 Choose images Try an example",
 * which is a worse heading and a worse button.
 */
function wireExample({ example, hand, busy, done, dropzone }) {
  const button = document.getElementById('example-button');
  // The markup is only rendered where the tool's [picker] table asks for it, so
  // a tool that passes `example` without setting `example = true` gets nothing
  // rather than a crash on load.
  if (!button) return;

  const holder = button.parentElement;
  liftToHeading(holder, dropzone);

  const say = (text) => {
    let note = holder.querySelector('.example-note');
    if (!note) {
      note = document.createElement('span');
      note.className = 'example-note';
      // Announced, because the button that failed is nowhere near the eye when
      // the failure lands: a visitor who pressed it may already be reading the
      // step below.
      note.setAttribute('role', 'status');
      holder.append(note);
    }
    note.textContent = text;
  };

  button.addEventListener('click', async () => {
    button.disabled = true;
    say('');
    busy(phrase('example.busy'));
    try {
      const made = await example();
      const files = (Array.isArray(made) ? made : [made]).filter(Boolean);
      done();
      hand(files);
    } catch (error) {
      done();
      say(phrase('example.failed'));
      // What went wrong is for whoever opens the console, not for the visitor:
      // the message above already names the only thing they can do about it.
      console.info('Example unavailable:', error);
    } finally {
      button.disabled = false;
    }
  });
}

/**
 * Move the button up onto the step's heading row.
 *
 * A CARD'S HEADING IS IN ONE OF TWO PLACES. It is a direct child of the card
 * until buildlib/cards.py folds the step's explanation behind it, and from then
 * on it is the <summary> of a <details>. Looking only for the first shape left
 * the five tools whose first card opens with a lede - document-scanner,
 * heic-to-jpg, id-photo, qr-barcode-reader, redact-image - with the button
 * still sitting under their drop zone, which is the position this exists to
 * move it out of.
 *
 * When it is folded, what goes in the row is the whole <details> rather than
 * the heading pulled out of it. A <summary> may hold the heading and nothing
 * else here: a button inside one opens the fold on every click, and its words
 * join the summary's accessible name - the same two objections as putting it
 * inside the <h2>, and the click one is fatal rather than untidy.
 *
 * Quietly does nothing if the shape is neither - a tool whose first card has no
 * heading keeps the button under the drop zone, which is where it already was
 * and is not wrong, only lower.
 */
function liftToHeading(holder, dropzone) {
  const card = dropzone?.closest('.card');
  const heading = card?.querySelector(
    ':scope > h2, :scope > details.card-note > summary > h2');
  if (!heading || !holder) return;

  const head = heading.closest('details.card-note') ?? heading;
  const row = document.createElement('div');
  row.className = 'card-head';
  head.before(row);
  row.append(head, holder);
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
