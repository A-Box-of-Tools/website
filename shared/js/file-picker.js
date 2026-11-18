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
 *
 * WHAT A DROPPED FOLDER IS
 *
 * The files in it, and in the folders inside it, that this tool's picker asks
 * for. Several pages tell a visitor to drop a folder - a scan off a hospital
 * disc is three hundred files in one, and GIF Maker's first step says "Drop a
 * folder onto the picker" - and for as long as a drop was read from
 * `dataTransfer.files` every one of those pages turned the folder away,
 * because that list holds a folder as a single entry no tool can open. See
 * `dropped` and `walkFolder` at the foot of this file.
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

  /**
   * A drop with a folder in it, handed over as the files it stands for.
   *
   * What comes out of a folder is held to the picker's own `accept`, which a
   * dropped file never is. Somebody who drops a file chose that file, and the
   * tool owes them its own answer about it. Nobody chose the `Thumbs.db` in a
   * folder of photographs, and a row of failures for files they have never
   * seen is not an answer to anything they did. It is the test the browser's
   * own dialog applies when the same folder is opened by clicking.
   *
   * A folder with nothing in it for this tool is handed over exactly as the
   * browser gave it, so the tool turns it away in the words it always has -
   * "photos: not an image this tool can read" is right about a folder of
   * spreadsheets too - and no folder is ever answered with silence.
   *
   * A picker that takes one file gets the first one in the folder that it
   * asks for and the walk stops there, the same file a tool for one file takes
   * out of several dropped together.
   */
  const openDropped = async (taken) => {
    const takes = accepts(input.accept);
    const files = [];
    // Out of action while the folders are read, like any other time the drop
    // zone is busy, and saying how far it has got: a disc holds thousands of
    // files, and the browser gives each one up through a request of its own.
    busy();
    try {
      for (const each of taken) {
        if (each.file) {
          files.push(each.file);
          continue;
        }
        const inside = [];
        await walkFolder(each.folder, (file) => {
          if (!takes(file)) return true;
          inside.push(file);
          busy(readingLabel(files.length + inside.length));
          return input.multiple;
        });
        if (inside.length) files.push(...inside);
        else if (each.asDropped) files.push(each.asDropped);
      }
    } finally {
      done();
    }
    hand(files);
  };

  dropzone.addEventListener('drop', (event) => {
    event.preventDefault();
    const taken = dropped(event.dataTransfer);
    // No folder in it, which is nearly every drop there is: handed over as the
    // browser gave it and in the same turn, as it was before folders opened.
    if (!taken) hand(event.dataTransfer?.files);
    else openDropped(taken);
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
 * There are two shapes to find that row in, because the build makes the second
 * one. A card that opens with a paragraph explaining the step has had that
 * paragraph - and its heading with it - folded into a <details> by
 * buildlib/cards.py, so the <h2> is no longer the card's child and the row the
 * reader sees is the fold's <summary>. Looking only for the child <h2> found
 * nothing on those cards and left the button under the drop zone, between it
 * and the step's own controls, on five tools: document-scanner, heic-to-jpg,
 * id-photo, qr-barcode-reader and redact-image.
 *
 * The whole <details> moves in that case rather than the heading inside it.
 * Taking the <h2> out of the summary would leave the fold unnamed and the
 * button on a row of its own, which is the bug over again one line lower.
 *
 * Quietly does nothing if the shape is neither - a tool whose first card has
 * no heading at all keeps the button under the drop zone, which is where it
 * already was and is not wrong, only lower.
 */
function liftToHeading(holder, dropzone) {
  const card = dropzone?.closest('.card');
  if (!card || !holder) return;

  const fold = card.querySelector(':scope > details.card-note');
  const head = card.querySelector(':scope > h2')
    ?? (fold?.querySelector(':scope > summary > h2') ? fold : null);
  if (!head) return;

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

/**
 * The most things one drop may hold and still be asked which of them are
 * folders.
 *
 * Asking is not free. In Chromium `webkitGetAsEntry()` is a synchronous round
 * trip to the browser's own process for every item, with the page frozen until
 * the last one answers: 64 ms for three hundred loose files and 1.3 s for five
 * thousand, measured in Edge, on a drop that took 2 ms before it had to ask.
 * Loose slices were the only way a scan could be dropped at all until folders
 * opened, and two thousand of them is an ordinary CT.
 *
 * So a drop of more than this many things is taken to be loose files and
 * handed over as it always was. A folder in among them is turned away by the
 * tool as it used to be, which is the worst this limit can do, and the folder
 * above it can be dropped instead. Forty series folders dropped together are
 * forty questions and 11 ms.
 */
const ASKED_AT_MOST = 100;

/**
 * What was dropped, with each folder still a folder - or null when there is no
 * folder in it, which leaves the caller on the path it has always taken.
 *
 * `dataTransfer.files` gives a folder as one entry that looks like a file and
 * is not: no size, no type, and an error from the first attempt to read it.
 * The entry behind the item still knows it is a directory. It has to be asked
 * here and all at once, because the browser empties `dataTransfer.items` the
 * moment the drop handler returns - anything left for after an `await` finds
 * the list empty.
 *
 * Each folder keeps the entry the browser would have handed over for it,
 * `asDropped`, for the folder that turns out to hold nothing a tool takes.
 *
 * @param {DataTransfer|null|undefined} transfer
 * @returns {Array<{file: File}|{folder: object, asDropped: File|null}>|null}
 */
function dropped(transfer) {
  const items = Array.from(transfer?.items ?? []).filter((item) => item.kind === 'file');
  if (items.length > ASKED_AT_MOST) return null;
  const entries = items.map((item) => item.webkitGetAsEntry?.() ?? null);
  if (!entries.some((entry) => entry?.isDirectory)) return null;

  return items
    .map((item, at) => (entries[at]?.isDirectory
      ? { folder: entries[at], asDropped: item.getAsFile() }
      : { file: item.getAsFile() }))
    .filter((each) => each.folder || each.file);
}

/**
 * `page2` before `page10`, and without regard to case: the order the visitor's
 * own file manager shows the folder in.
 *
 * A directory is listed in whatever order the disk keeps it, which is not an
 * order anybody chose. It matters to the tools that take the order they are
 * given as the answer - the pages of a PDF, the frames of a GIF - and a folder
 * of scanned pages that arrived shuffled would be a job to undo by hand.
 */
const BY_NAME = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

/**
 * How many files of one folder are asked for at once.
 *
 * Each `entry.file()` is a round trip to the browser's own process, and one at
 * a time that is most of what a big folder costs: five thousand files took
 * 3.1 s that way in Edge, and 1.0 s a hundred at a time. Asking for all five
 * thousand at once was no faster than that, so the number stays at the size
 * the browser itself lists a directory in.
 */
const TOGETHER = 100;

/**
 * Every file in a folder and in the folders inside it.
 *
 * A folder's own files come first, in name order, and then each folder inside
 * it in the same way. Sorting the two together would put the pages of a
 * folder called `appendix` ahead of `chapter1.pdf` beside it; what is seen on
 * opening the folder is what was meant first.
 *
 * `each` is handed every File in turn, and answers false to stop the walk
 * early. Resolves to false when it was stopped and true when the folder ran
 * out.
 *
 * Nothing in here rejects. A file that has gone since the folder was listed,
 * or a folder the visitor is not allowed to open, is passed over and the walk
 * carries on: the rest of a disc is still worth having, and a tool can only
 * report on the files it was given.
 *
 * @param {object} folder  a FileSystemDirectoryEntry
 * @param {(file: File) => boolean|void} each
 * @returns {Promise<boolean>}
 */
export async function walkFolder(folder, each) {
  const children = await childrenOf(folder);
  children.sort((a, b) => BY_NAME.compare(a.name, b.name));
  const files = children.filter((child) => !child.isDirectory);
  const folders = children.filter((child) => child.isDirectory);

  for (let at = 0; at < files.length; at += TOGETHER) {
    const opened = await Promise.all(files.slice(at, at + TOGETHER).map(fileOf));
    for (const file of opened) {
      if (file && each(file) === false) return false;
    }
  }

  for (const inner of folders) {
    if (!await walkFolder(inner, each)) return false;
  }
  return true;
}

/**
 * Everything directly inside one folder.
 *
 * `readEntries` is asked until it answers with nothing. Chromium hands a
 * directory over a hundred entries at a time, so one call on a series of three
 * hundred slices returns the first hundred and gives no sign that there were
 * more; Firefox returns everything at once and then the empty list.
 */
function childrenOf(folder) {
  return new Promise((resolve) => {
    const all = [];
    const stop = () => resolve(all);
    try {
      const reader = folder.createReader();
      const more = () => reader.readEntries((batch) => {
        if (!batch.length) {
          stop();
          return;
        }
        all.push(...batch);
        more();
      }, stop);
      more();
    } catch {
      stop();
    }
  });
}

/** The File behind one entry, or null where it can no longer be had. */
function fileOf(entry) {
  return new Promise((resolve) => {
    try {
      entry.file(resolve, () => resolve(null));
    } catch {
      resolve(null);
    }
  });
}

/**
 * Whether a file is one a picker's `accept` asks for, by the rules the
 * browser's own dialog reads that attribute with: `.ext` against the end of
 * the name, `image/*` against the front of the type, anything else against the
 * whole type, and none of it minding case.
 *
 * A star on each side of the slash is not in the specification and is what
 * two tools here say, because what they take cannot be told from a name: a
 * DICOM file has no extension more often than not, and a checksum is owed to
 * any file at all. It means everything, and so does an `accept` that is empty.
 *
 * @param {string} [accept]  the attribute, as written
 * @returns {(file: {name: string, type?: string}) => boolean}
 */
export function accepts(accept) {
  const wanted = String(accept ?? '').toLowerCase().split(',')
    .map((token) => token.trim()).filter(Boolean);
  if (!wanted.length || wanted.includes('*/*')) return () => true;

  return (file) => {
    const name = String(file.name).toLowerCase();
    const type = String(file.type ?? '').toLowerCase();
    return wanted.some((token) => {
      if (token.startsWith('.')) return name.endsWith(token);
      if (token.endsWith('/*')) return type.startsWith(token.slice(0, -1));
      return type === token;
    });
  };
}
