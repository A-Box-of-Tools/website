/**
 * shared/js/file-picker.js - what a dropped folder turns into.
 *
 * The drop zone is on every tool that takes a file, and for as long as it read
 * a drop from `dataTransfer.files` a dropped folder arrived as one entry that
 * nothing could open. Four pages told visitors to drop one. The fix walks the
 * folder, and everything about that walk is a rule somebody would otherwise
 * find out by losing an afternoon to it: a directory is listed a hundred
 * entries at a time and gives no sign there are more, the list of what was
 * dropped is emptied the moment the handler returns, and the order a disk
 * keeps its files in is nobody's order.
 *
 * No browser can be asked to drop a folder from a test, so the folder here is
 * a stub with the two methods the walk calls, listing itself in hundreds as
 * Chromium does or all at once as Firefox does. What the stub cannot say is
 * that a real browser hands a folder over in this shape; that was checked by
 * dropping real folders on the built pages in Edge.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { accepts, walkFolder, wireFilePicker } from '../../shared/js/file-picker.js';

const PHRASES = {
  'reading.one': 'Reading {count} file',
  'reading.many': 'Reading {count} files',
};

/** The two things on a page the picker reaches for outside its own markup. */
function page() {
  globalThis.document = {
    querySelector(selector) {
      const match = /^#(phrases|frame-phrases) \[data-phrase="(.+)"\]$/.exec(selector);
      if (!match) throw new Error(`unexpected selector: ${selector}`);
      return match[1] === 'frame-phrases' && match[2] in PHRASES
        ? { textContent: PHRASES[match[2]] } : null;
    },
    querySelectorAll: () => [],
  };
  globalThis.window = { addEventListener() {} };
}

/** An element that keeps its listeners, so a test can be the browser. */
function element(own = {}) {
  const listeners = new Map();
  const classes = new Set();
  return {
    ...own,
    classList: {
      add: (name) => classes.add(name),
      remove: (name) => classes.delete(name),
      contains: (name) => classes.has(name),
    },
    addEventListener(type, listener) {
      listeners.set(type, [...(listeners.get(type) ?? []), listener]);
    },
    dispatch(type, event) {
      for (const listener of listeners.get(type) ?? []) listener(event);
    },
  };
}

/**
 * A hand-over that never comes fails the test that was waiting for it. Without
 * this the test would wait for ever, and the run would stop on a timeout that
 * names no test.
 */
const soon = (handOver) => Promise.race([
  handOver,
  new Promise((_, reject) => {
    setTimeout(() => reject(new Error('nothing was handed over')), 2000).unref();
  }),
]);

/**
 * A wired picker, and a promise for each hand-over.
 *
 * `handed` is every call to onFiles so far, so a test can say that nothing has
 * arrived yet as easily as what did.
 */
function picker({ accept = '', multiple = true } = {}) {
  page();
  const title = { textContent: 'Drop files here' };
  const dropzone = element({ querySelector: () => title });
  const input = element({ accept, multiple, files: [], value: '' });
  const handed = [];
  let arrived = () => {};
  wireFilePicker({
    input,
    dropzone,
    onFiles(files) {
      handed.push(files);
      arrived(files);
    },
  });
  const next = () => soon(new Promise((resolve) => { arrived = resolve; }));
  return { dropzone, input, title, handed, next };
}

/**
 * Which entries were asked for their file, which folders for their listing,
 * and how many dropped things were asked what they are.
 */
const asked = { files: [], listings: [], entries: 0 };
test.beforeEach(() => {
  asked.files = [];
  asked.listings = [];
  asked.entries = 0;
});

const file = (name, type = '') => ({ name, type });

function fileEntry(name, type = '', { gone = false } = {}) {
  const held = file(name, type);
  return {
    name,
    isDirectory: false,
    held,
    file(found, failed) {
      asked.files.push(name);
      queueMicrotask(() => (gone ? failed(new Error('gone')) : found(held)));
    },
  };
}

/**
 * A folder that lists itself the way an engine does.
 *
 * `batch` is how many entries one call gives up: a hundred in Chromium, all of
 * them in Firefox. `locked` is the folder the visitor may not open.
 */
function folderEntry(name, children, { batch = 100, locked = false } = {}) {
  return {
    name,
    isDirectory: true,
    createReader() {
      let at = 0;
      return {
        readEntries(found, failed) {
          asked.listings.push(name);
          queueMicrotask(() => {
            if (locked) {
              failed(new Error('not allowed'));
              return;
            }
            const some = children.slice(at, at + batch);
            at += some.length;
            found(some);
          });
        },
      };
    },
  };
}

/**
 * Drop these on the zone, as the browser would.
 *
 * A folder is in `files` as the one unreadable entry the browser makes of it,
 * and the list of items is emptied as soon as the handlers have run - which is
 * what the browser does, and what makes an `await` before reading it a bug.
 */
function drop(dropzone, entries) {
  const files = entries.map((entry) => (entry.isDirectory ? file(entry.name) : entry.held));
  const items = entries.map((entry, at) => ({
    kind: 'file',
    webkitGetAsEntry() {
      asked.entries += 1;
      return entry;
    },
    getAsFile: () => files[at],
  }));
  dropzone.dispatch('drop', { preventDefault() {}, dataTransfer: { files, items } });
  items.length = 0;
  return files;
}

const names = (files) => files.map((each) => each.name);

/* ------------------------------------------------------------ the hand-over */

test('a drop with no folder in it is handed over as it came, in the same turn', () => {
  const { dropzone, handed } = picker({ accept: 'image/*' });
  const files = drop(dropzone, [fileEntry('b.png', 'image/png'), fileEntry('notes.txt', 'text/plain')]);

  // Before anything is awaited, and not held to `accept`: somebody who drops a
  // file chose that file, and the tool owes them its own answer about it.
  assert.equal(handed.length, 1);
  assert.deepEqual(handed[0], files);
  assert.deepEqual(asked.listings, []);
});

test('a drop from a page that has no entries to ask still arrives', () => {
  // A DataTransfer built by a script has files and nothing behind them.
  const { dropzone, handed } = picker();
  const files = [file('a.png', 'image/png')];
  dropzone.dispatch('drop', { preventDefault() {}, dataTransfer: { files } });
  dropzone.dispatch('drop', {
    preventDefault() {},
    dataTransfer: { files, items: [{ kind: 'file', getAsFile: () => files[0] }] },
  });
  assert.deepEqual(handed, [files, files]);
});

test('a dropped folder is the files in it, its own before those of the folders inside', async () => {
  const { dropzone, handed, next } = picker();
  const arriving = next();
  drop(dropzone, [folderEntry('scans', [
    fileEntry('page10.png'),
    folderEntry('appendix', [fileEntry('b.png'), fileEntry('a.png')]),
    fileEntry('page2.png'),
    fileEntry('Page1.png'),
  ])]);

  assert.equal(handed.length, 0, 'nothing is handed over until the folder has been read');
  // page2 before page10, which a plain sort gets backwards, and the appendix
  // after the pages it sorts ahead of by name.
  assert.deepEqual(names(await arriving), ['Page1.png', 'page2.png', 'page10.png', 'a.png', 'b.png']);
});

test('files and folders dropped together keep the order they were dropped in', async () => {
  const { dropzone, next } = picker();
  const arriving = next();
  drop(dropzone, [
    fileEntry('first.dcm'),
    folderEntry('series', [fileEntry('IM2'), fileEntry('IM1')]),
    fileEntry('last.dcm'),
  ]);
  assert.deepEqual(names(await arriving), ['first.dcm', 'IM1', 'IM2', 'last.dcm']);
});

test('a drop of more than a hundred things is handed over without asking which are folders', async () => {
  // Asking is a synchronous round trip for each item in Chromium, and five
  // thousand loose slices froze the page for 1.3 s on a drop that used to
  // take 2 ms.
  const loose = Array.from({ length: 100 }, (_, at) => fileEntry(`IM${at + 1}`));
  const series = () => folderEntry('series', [fileEntry('IM999')]);

  const over = picker();
  const files = drop(over.dropzone, [...loose, series()]);
  assert.equal(asked.entries, 0);
  assert.deepEqual(over.handed, [files], 'in the same turn, the folder still the one entry the browser makes of it');

  // At the limit itself the folder is opened like any other.
  const at = picker();
  const arriving = at.next();
  drop(at.dropzone, [...loose.slice(1), series()]);
  const opened = await arriving;
  assert.equal(opened.length, 100);
  assert.equal(opened.at(-1).name, 'IM999');
});

test('a folder is read to its end, not to its first hundred', async () => {
  const slices = Array.from({ length: 250 }, (_, at) => fileEntry(`IM${at + 1}`));
  for (const batch of [100, 1000]) {
    const { dropzone, next } = picker();
    const arriving = next();
    drop(dropzone, [folderEntry('series', slices, { batch })]);
    const files = await arriving;
    assert.equal(files.length, 250, `listed ${batch} at a time`);
    assert.equal(files[249].name, 'IM250');
  }
});

test('what comes out of a folder is held to the accept list, and a dropped file is not', async () => {
  const { dropzone, next } = picker({ accept: 'image/*,.avif' });
  const arriving = next();
  drop(dropzone, [
    fileEntry('chosen.txt', 'text/plain'),
    folderEntry('photos', [
      fileEntry('Thumbs.db'),
      fileEntry('one.jpg', 'image/jpeg'),
      fileEntry('two.AVIF'),
      fileEntry('notes.txt', 'text/plain'),
    ]),
  ]);
  assert.deepEqual(names(await arriving), ['chosen.txt', 'one.jpg', 'two.AVIF']);
});

test('a folder with nothing in it for this tool is handed over as the browser gave it', async () => {
  // So the tool turns it away in its own words, as it did before folders were
  // opened, and a folder is never answered with nothing at all.
  for (const inside of [[], [fileEntry('notes.txt', 'text/plain')]]) {
    const { dropzone, next } = picker({ accept: 'image/*' });
    const arriving = next();
    const [asDropped] = drop(dropzone, [folderEntry('letters', inside)]);
    const files = await arriving;
    assert.equal(files.length, 1);
    assert.equal(files[0], asDropped);
  }
});

test('a picker for one file gets the first it asks for, and the walk stops there', async () => {
  const { dropzone, next } = picker({ accept: '.pdf', multiple: false });
  const arriving = next();
  drop(dropzone, [folderEntry('letters', [
    fileEntry('a.txt'),
    fileEntry('c.pdf'),
    fileEntry('b.pdf'),
    folderEntry('older', [fileEntry('z.pdf')]),
  ])]);
  assert.deepEqual(names(await arriving), ['b.pdf']);
  // Not one file further: the folder inside was never listed, and nothing in
  // it was opened.
  assert.equal(asked.listings.includes('older'), false);
  assert.equal(asked.files.includes('z.pdf'), false);
});

test('a file that has gone and a folder that will not open are passed over', async () => {
  const { dropzone, next } = picker();
  const arriving = next();
  drop(dropzone, [folderEntry('disc', [
    fileEntry('IM1'),
    fileEntry('IM2', '', { gone: true }),
    folderEntry('private', [fileEntry('IM9')], { locked: true }),
    folderEntry('series', [fileEntry('IM3')]),
  ])]);
  assert.deepEqual(names(await arriving), ['IM1', 'IM3']);
});

test('the drop zone counts the files the tool will be given, and rests before it is given them', async () => {
  page();
  const labels = [];
  const title = {
    get textContent() { return labels.at(-1) ?? 'Drop files here'; },
    set textContent(value) { labels.push(value); },
  };
  const dropzone = element({ querySelector: () => title });
  const input = element({ accept: '.png', multiple: true, files: [], value: '' });
  const arriving = new Promise((resolve) => {
    wireFilePicker({
      input,
      dropzone,
      // A tool that shows its own progress does it by calling busy() from
      // here, so the picker has to have let go of the zone by now.
      onFiles: () => resolve({ busy: dropzone.classList.contains('busy'), said: [...labels] }),
    });
  });
  drop(dropzone, [folderEntry('photos', [fileEntry('a.png'), fileEntry('b.txt'), fileEntry('c.png')])]);

  assert.ok(dropzone.classList.contains('busy'), 'out of action from the moment of the drop');
  assert.deepEqual(await soon(arriving), {
    busy: false,
    said: ['Reading 1 file', 'Reading 2 files', 'Drop files here'],
  });
});

/* ----------------------------------------------------------------- the walk */

test('the walk can be stopped, and says whether it was', async () => {
  const folder = folderEntry('series', [fileEntry('IM1'), fileEntry('IM2'), fileEntry('IM3')]);
  const seen = [];
  assert.equal(await walkFolder(folder, (found) => { seen.push(found.name); return seen.length < 2; }), false);
  assert.deepEqual(seen, ['IM1', 'IM2']);

  // Answering nothing at all is not a request to stop.
  const all = [];
  assert.equal(await walkFolder(folder, (found) => { all.push(found.name); }), true);
  assert.deepEqual(all, ['IM1', 'IM2', 'IM3']);
});

/* --------------------------------------------------------------- the accept */

test('accept is read the way the file dialog reads it', () => {
  const images = accepts('image/*, .AVIF ,application/pdf');
  assert.equal(images(file('a.jpg', 'image/jpeg')), true);
  assert.equal(images(file('a.JPG', 'IMAGE/JPEG')), true);
  assert.equal(images(file('scan.avif')), true, 'by its extension, where the system knows no type for it');
  assert.equal(images(file('scan.Avif')), true);
  assert.equal(images(file('letter.pdf', 'application/pdf')), true);
  assert.equal(images(file('letter.pdf', 'application/x-pdf')), false);
  assert.equal(images(file('notes.txt', 'text/plain')), false);
  assert.equal(images(file('Thumbs.db')), false);
  // The extension has to be the end of the name, not somewhere in it.
  assert.equal(images(file('scan.avif.txt', 'text/plain')), false);
});

test('an accept of everything, or of nothing, takes every file', () => {
  for (const accept of ['*/*', ' */* ', '', undefined]) {
    assert.equal(accepts(accept)(file('IM000001')), true, `accept=${accept}`);
  }
});
