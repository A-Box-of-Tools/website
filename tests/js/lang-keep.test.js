/**
 * shared/lang-keep.js - the work a language switch carries across with it.
 *
 * Run the way tests/js/lang.test.js and tests/js/feedback.test.js run theirs,
 * and for the same reason: the file is a frame script rather than a module, so
 * there is nothing to import. The source is read off disk and evaluated with a
 * hand-built window, document and IndexedDB in front of it.
 *
 * The stub is the point. Every decision this file makes is a function of what
 * is in the DOM and what is in the store, and both are faked here so that the
 * questions can be asked at all. Three in particular are worth checking here
 * and nowhere else, because a browser answers them only after a deploy:
 *
 *   - that a page NOBODY HAS TOUCHED is left completely alone. The switcher is
 *     a plain link and the whole design of it depends on staying one; a version
 *     of this file that intercepted every click would have looked identical in
 *     use and quietly put the switcher behind IndexedDB.
 *   - that only what CHANGED travels. The record is the visitor's work, and a
 *     file that carried every control on the page would carry the tool's own
 *     defaults over the top of the next language's - which are the same
 *     defaults, so nothing would ever look wrong while the record grew to the
 *     size of the form.
 *   - that a record is refused unless the language on it DIFFERS from the page
 *     reading it. That single comparison is what separates "the far side of a
 *     switch" from "a reload", and getting it wrong means a refresh hands back
 *     work the visitor refreshed to be rid of.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SOURCE = readFileSync(
  fileURLToPath(new URL('../../shared/lang-keep.js', import.meta.url)),
  'utf8',
);

/* -------------------------------------------------------------- the storage */

/**
 * An IndexedDB that behaves like one, or one that refuses to open.
 *
 * The shape matters more than it looks. Every request here fires its
 * `onsuccess` in a microtask rather than immediately, because the source
 * attaches that handler AFTER the call that returns the request - `take()`
 * sets `got.onsuccess` on the line below `store.get()` - and a fake that
 * called back synchronously would run a handler nobody had set yet and pass a
 * file the browser would fail.
 */
function indexed(held, refuse = false) {
  function store(pending) {
    return {
      put(value, key) {
        const req = { result: undefined, onsuccess: null };
        held.set(key, value);
        pending.push(() => { if (req.onsuccess) req.onsuccess(); });
        return req;
      },
      get(key) {
        const req = { result: held.get(key), onsuccess: null };
        pending.push(() => { if (req.onsuccess) req.onsuccess(); });
        return req;
      },
      delete(key) {
        held.delete(key);
        return { result: undefined, onsuccess: null };
      },
      openCursor() {
        const keys = Array.from(held.keys());
        const req = { result: null, onsuccess: null };
        let at = 0;
        const step = () => {
          if (at >= keys.length) {
            req.result = null;
          } else {
            const key = keys[at];
            at += 1;
            req.result = {
              value: held.get(key),
              delete: () => held.delete(key),
              continue: step,
            };
          }
          if (req.onsuccess) req.onsuccess();
        };
        pending.push(step);
        return req;
      },
    };
  }

  const database = {
    createObjectStore: () => {},
    close: () => {},
    transaction() {
      const pending = [];
      const tx = { objectStore: () => store(pending), oncomplete: null, onerror: null };
      // After the synchronous body of inStore() has run, which is the only
      // moment at which every handler it means to attach has been attached.
      Promise.resolve().then(() => {
        while (pending.length) pending.shift()();
        if (tx.oncomplete) tx.oncomplete();
      });
      return tx;
    },
  };

  return {
    open() {
      const req = {
        result: database, error: new Error('refused'),
        onupgradeneeded: null, onsuccess: null, onerror: null,
      };
      Promise.resolve().then(() => {
        if (refuse) {
          if (req.onerror) req.onerror();
          return;
        }
        if (req.onupgradeneeded) req.onupgradeneeded();
        if (req.onsuccess) req.onsuccess();
      });
      return req;
    },
  };
}

/* ------------------------------------------------------------------ the DOM */

/**
 * One element.
 *
 * `selectors` is the set of selector strings it answers to, and closest()
 * matches against exactly the strings the source passes - so a test fails if
 * the source starts asking for something the markup does not offer, which is
 * the failure this stub exists to catch.
 */
function el(selectors = [], attrs = {}) {
  const node = {
    selectors: new Set(selectors),
    attrs,
    parentNode: null,
    fired: [],
    // Every element has one, and the source now writes to it: deliver() marks
    // the file input for the length of its dispatch so a tool can tell a file
    // coming back from a file arriving. A stub without it made that line throw
    // and the dispatch never happened, which is a fault in the stub rather
    // than in the page - and exactly the kind this file exists to catch, since
    // a real input would have carried it without comment.
    dataset: {},
    getAttribute: (name) => (name in attrs ? attrs[name] : null),
    setAttribute: (name, value) => { attrs[name] = value; },
    closest(query) {
      const wanted = query.split(',').map((part) => part.trim());
      let at = node;
      while (at) {
        if (wanted.some((part) => at.selectors.has(part))) return at;
        at = at.parentNode;
      }
      return null;
    },
    addEventListener: (type, fn) => node.listeners.set(type, fn),
    // Records what was dispatched AND runs what is listening, because the
    // source relies on both: it reads `fired` nowhere, but the change event it
    // sends into the file input is caught by its own listener on that same
    // input, and a stub that only recorded events would hide the loop that
    // guard exists to break.
    dispatchEvent: (event) => {
      node.fired.push(event.type);
      const fn = node.listeners.get(event.type);
      if (fn) fn(event);
      return true;
    },
    listeners: new Map(),
  };
  return node;
}

/**
 * One form control, as the markup declares it.
 *
 * `value`/`checked` start at the markup's own, which is what makes "has this
 * been changed?" answerable at all: `defaultValue` and `defaultChecked` are
 * the attribute, and the live property is what the visitor left behind. A
 * select is given the real refusal too - assigning a value none of its options
 * carry does nothing - because the source guards against exactly that and the
 * guard is worth a test.
 */
function control(tag, id, spec = {}) {
  const node = el([], spec.attrs ? { ...spec.attrs } : {});
  node.tagName = tag.toUpperCase();
  node.id = id;
  // What keyOf() reads when there is no id: the `name` a radio group shares,
  // and the `data-` attributes a tool used instead of either. Modelled as real
  // attributes rather than as properties, because that is where the source
  // looks for them and a stub that offered properties would pass while the
  // browser found nothing.
  node.attributes = Object.keys(node.attrs).map((name) => ({ name, value: node.attrs[name] }));
  node.type = spec.type || (tag === 'select' ? 'select-one' : 'text');
  node.disabled = !!spec.disabled;
  node.readOnly = !!spec.readOnly;
  node.defaultValue = spec.value ?? '';
  node.defaultChecked = !!spec.checked;
  node.checked = !!spec.checked;

  if (tag === 'select') {
    node.options = (spec.options || []).map((value, at) => ({
      value, defaultSelected: at === (spec.selected ?? -1),
    }));
    let held = node.options.length
      ? (node.options.find((one) => one.defaultSelected) || node.options[0]).value
      : '';
    Object.defineProperty(node, 'value', {
      get: () => held,
      set: (want) => {
        if (node.options.some((one) => one.value === want)) held = want;
      },
    });
  } else {
    node.value = spec.value ?? '';
  }
  return node;
}

/* --------------------------------------------------------------- the harness */

/**
 * A tool page, in one language, with a switcher and whatever the visitor has
 * done to it.
 *
 * `parked` seeds the store with a record already waiting, which is how the
 * receiving half is put on trial: the page loads complete, finds it, and
 * either hands the work back or refuses to.
 */
function run({
  lang = 'en',
  tool = 'compress-image',
  controls = [],
  multiple = false,
  parked = null,
  held = new Map(),
  ready = 'loading',
  refuseStorage = false,
  hasInput = true,
} = {}) {
  if (parked) held.set(tool, parked);

  const feedback = el(['#feedback'], { 'data-tool': tool });
  const main = el(['#main']);
  main.querySelectorAll = () => controls;
  main.contains = (other) => controls.indexOf(other) >= 0;
  for (const node of controls) node.parentNode = main;

  const input = hasInput ? el(['#file-input']) : null;
  if (input) {
    input.multiple = multiple;
    input.files = [];
  }

  const dropzone = el(['#dropzone']);
  const inside = el([]);
  inside.parentNode = dropzone;

  const pick = el(['.lang-pick']);
  const link = el(['a[hreflang]'], { hreflang: 'de' });
  link.href = '/de/bild-komprimieren/';
  link.parentNode = pick;
  const elsewhere = el(['a[hreflang]'], { hreflang: 'de' });
  elsewhere.href = '/de/';

  const byId = { feedback, main, 'file-input': input };
  for (const node of controls) byId[node.id] = node;

  const on = { document: new Map(), window: new Map() };
  const went = [];

  const document = {
    readyState: ready,
    documentElement: { getAttribute: (name) => (name === 'lang' ? lang : null) },
    getElementById: (id) => byId[id] || null,
    addEventListener: (type, fn, capture) => on.document.set(capture ? `${type}!` : type, fn),
  };

  const window = {
    indexedDB: indexed(held, refuseStorage),
    location: { assign: (to) => went.push(to) },
    addEventListener: (type, fn) => on.window.set(type, fn),
  };

  // `DataTransfer` is a browser type Node does not have, and the source checks
  // for it before using it - so it is handed in here rather than faked onto a
  // global, which keeps the "no DataTransfer, no delivery" branch honest.
  function DataTransfer() {
    this.files = [];
    this.items = { add: (file) => this.files.push(file) };
  }

  // eslint-disable-next-line no-new-func
  new Function('window', 'document', 'DataTransfer', SOURCE)(
    window, document, DataTransfer,
  );

  /** Let every promise chain the source started run to the end. */
  const settle = () => new Promise((resolve) => { setTimeout(resolve, 0); });

  const click = (target, extra = {}) => {
    const event = {
      target,
      button: 0,
      defaultPrevented: false,
      metaKey: false,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      preventDefault() { event.defaultPrevented = true; },
      ...extra,
    };
    const fn = on.document.get('click');
    if (fn) fn(event);
    return event;
  };

  return {
    input, link, elsewhere, dropzone, inside, held, went, settle, click,
    /** A file arriving the way the picker delivers it. */
    choose: (...files) => {
      input.files = files;
      input.listeners.get('change')({});
    },
    /** A file arriving the way a drop delivers it. */
    drop: (target, ...files) => {
      on.document.get('drop!')({ target, dataTransfer: { files } });
    },
    load: () => {
      const fn = on.window.get('load');
      if (fn) fn();
    },
    record: () => held.get(tool) || null,
  };
}

/** A File, near enough: the source only ever moves them from A to B. */
const file = (name) => ({ name });

/* ---------------------------------------------- a page nobody has touched */

test('an untouched page leaves the switcher the plain link it was built as', () => {
  const page = run({ controls: [control('input', 'quality', { value: '80' })] });
  const event = page.click(page.link);
  assert.equal(event.defaultPrevented, false);
  assert.equal(page.record(), null, 'and nothing is written down');
});

test('a link outside the switcher is not a language switch', () => {
  const page = run({ controls: [control('textarea', 'input', { value: '' })] });
  const changed = page.click(page.link); // nothing changed yet either
  assert.equal(changed.defaultPrevented, false);
  const page2 = run({ controls: [(() => {
    const node = control('textarea', 'input', { value: '' });
    node.value = 'typed';
    return node;
  })()] });
  const event = page2.click(page2.elsewhere);
  assert.equal(event.defaultPrevented, false, 'an hreflang link loose on the page is left alone');
});

test('a modified click is left alone: that tab keeps its own work', () => {
  const typed = control('textarea', 'input', { value: '' });
  typed.value = 'a paragraph';
  const page = run({ controls: [typed] });
  for (const key of ['metaKey', 'ctrlKey', 'shiftKey', 'altKey']) {
    const event = page.click(page.link, { [key]: true });
    assert.equal(event.defaultPrevented, false, key);
  }
  const middle = page.click(page.link, { button: 1 });
  assert.equal(middle.defaultPrevented, false, 'and neither is the middle button');
});

/* --------------------------------------------------- what counts as changed */

test('only the controls moved off their markup value travel', async () => {
  const untouched = control('input', 'quality', { value: '80' });
  const moved = control('input', 'width', { value: '1200' });
  moved.value = '640';
  const page = run({ controls: [untouched, moved] });

  page.click(page.link);
  await page.settle();

  assert.deepEqual(page.record().values, [{ key: '#width', value: '640' }]);
});

test('a checkbox turned off travels, and one left alone does not', async () => {
  const off = control('input', 'use-symbols', { type: 'checkbox', checked: true });
  off.checked = false;
  const on = control('input', 'use-digits', { type: 'checkbox', checked: true });
  const page = run({ controls: [off, on] });

  page.click(page.link);
  await page.settle();

  assert.deepEqual(page.record().values, [{ key: '#use-symbols', on: false }]);
});

test('a select is measured against the option the markup selected', async () => {
  const kept = control('select', 'separator', {
    options: ['hyphen', 'space'], selected: 0,
  });
  const changed = control('select', 'capitals', {
    options: ['lower', 'title'], selected: 0,
  });
  changed.value = 'title';
  const page = run({ controls: [kept, changed] });

  page.click(page.link);
  await page.settle();

  assert.deepEqual(page.record().values, [{ key: '#capitals', value: 'title' }]);
});

test('a select with nothing selected in the markup defaults to its first option', async () => {
  const node = control('select', 'format', { options: ['png', 'jpeg'] });
  const page = run({ controls: [node] });
  page.click(page.link);
  await page.settle();
  assert.equal(page.record(), null, 'showing "png" is showing the default');

  node.value = 'jpeg';
  const moved = run({ controls: [node] });
  moved.click(moved.link);
  await moved.settle();
  assert.deepEqual(moved.record().values, [{ key: '#format', value: 'jpeg' }]);
});

test('output is not input: readonly, disabled and password never travel', async () => {
  const shown = control('input', 'result', { value: '', readOnly: true });
  shown.value = 'the answer the tool worked out';
  const locked = control('input', 'depth', { value: '8', disabled: true });
  locked.value = '16';
  const secret = control('input', 'passphrase', { type: 'password', value: '' });
  secret.value = 'correct horse battery staple';
  const real = control('input', 'length', { value: '20' });
  real.value = '32';

  const page = run({ controls: [shown, locked, secret, real] });
  page.click(page.link);
  await page.settle();

  assert.deepEqual(page.record().values, [{ key: '#length', value: '32' }]);
});

test('a control with no id has no name on the other side, so it is skipped', async () => {
  const anonymous = control('input', '', { value: '1' });
  anonymous.value = '2';
  const page = run({ controls: [anonymous] });
  page.click(page.link);
  await page.settle();
  assert.equal(page.record(), null);
});

/* ------------------------------------------------- controls without an id */

/**
 * The mode switch, as eleven tools actually write it.
 *
 * `redact-image` is the one that found this: fill / pixelate / blur is a group
 * of radios sharing `name="style"`, with no id on any of them, because the tool
 * reads the group with a selector rather than one button at a time. The first
 * version of this file asked every control for an id and skipped the ones that
 * had none - so a language switch handed the image back and threw away the one
 * setting that says what to do with it. Same shape in compress-pdf,
 * document-scanner, dicom-viewer, edit-audio, encode-text, image-to-data-uri,
 * merge-pdf, trim-audio and trim-video.
 */
function radios(name, values, checked) {
  return values.map((value) => {
    const node = control('input', '', {
      type: 'radio', checked: value === checked, attrs: { name, value },
    });
    node.value = value;
    return node;
  });
}

test('a radio group with no id travels by its name and its value', async () => {
  const group = radios('style', ['fill', 'pixelate', 'blur'], 'fill');
  const [fill, pixelate] = group;
  fill.checked = false;
  pixelate.checked = true;

  const page = run({ controls: group });
  page.click(page.link);
  await page.settle();

  assert.deepEqual(page.record().values, [
    { key: '@style=fill', on: false },
    { key: '@style=pixelate', on: true },
  ]);
});

test('and lands on the right button on the other side', async () => {
  const group = radios('style', ['fill', 'pixelate', 'blur'], 'fill');
  const page = run({
    lang: 'de',
    ready: 'complete',
    controls: group,
    parked: {
      lang: 'en',
      time: Date.now(),
      files: [],
      values: [{ key: '@style=fill', on: false }, { key: '@style=pixelate', on: true }],
    },
  });
  await page.settle();

  assert.deepEqual(group.map((node) => node.checked), [false, true, false]);
  assert.deepEqual(group[1].fired, ['input', 'change'], 'and the tool is told');
});

test('a control addressed by a data- attribute travels by it', async () => {
  // hash-checksum's algorithms, which carry neither an id nor a name - only
  // `data-algorithm`, which is what its own code reads them by.
  const md5 = control('input', '', {
    type: 'checkbox', checked: true, attrs: { 'data-algorithm': 'md5' },
  });
  const sha1 = control('input', '', {
    type: 'checkbox', attrs: { 'data-algorithm': 'sha1' },
  });
  md5.checked = false;
  sha1.checked = true;

  const page = run({ controls: [md5, sha1] });
  page.click(page.link);
  await page.settle();

  assert.deepEqual(page.record().values, [
    { key: '~data-algorithm=md5', on: false },
    { key: '~data-algorithm=sha1', on: true },
  ]);
});

test('a control the markup gives no handle at all is still skipped', async () => {
  // Nothing to call it by on the other page, so carrying it would mean
  // guessing which control on a different document it meant.
  const anonymous = control('input', '', { value: '1' });
  anonymous.value = '2';
  const page = run({ controls: [anonymous] });
  page.click(page.link);
  await page.settle();
  assert.equal(page.record(), null);
});

test('an id still wins over a name, so nothing already working moves', async () => {
  const node = control('input', 'quality', {
    value: '85', attrs: { name: 'quality-field' },
  });
  node.value = '60';
  const page = run({ controls: [node] });
  page.click(page.link);
  await page.settle();
  assert.deepEqual(page.record().values, [{ key: '#quality', value: '60' }]);
});

/* ----------------------------------------------------------------- the files */

test('the file the visitor chose travels with the language', async () => {
  const page = run();
  page.choose(file('holiday.jpg'));
  page.click(page.link);
  await page.settle();

  assert.deepEqual(page.record().files, [file('holiday.jpg')]);
  assert.deepEqual(page.went, ['/de/bild-komprimieren/']);
});

test('a picker that takes one file replaces; one marked multiple adds', async () => {
  const single = run();
  single.choose(file('a.jpg'));
  single.choose(file('b.jpg'));
  single.click(single.link);
  await single.settle();
  assert.deepEqual(single.record().files, [file('b.jpg')]);

  const many = run({ multiple: true });
  many.choose(file('a.jpg'));
  many.choose(file('b.jpg'));
  many.click(many.link);
  await many.settle();
  assert.deepEqual(many.record().files, [file('a.jpg'), file('b.jpg')]);
});

test('a drop on the dropzone counts; a drop anywhere else does not', async () => {
  const page = run();
  page.drop(page.inside, file('dropped.png'));
  page.click(page.link);
  await page.settle();
  assert.deepEqual(page.record().files, [file('dropped.png')]);

  const stray = run();
  stray.drop(el([]), file('nowhere.png'));
  const event = stray.click(stray.link);
  assert.equal(event.defaultPrevented, false, 'the frame swallowed that drop, so nothing was chosen');
});

/* ------------------------------------------------------------ the other side */

test('the far side of a switch hands the work back', async () => {
  const width = control('input', 'width', { value: '1200' });
  const page = run({
    lang: 'de',
    ready: 'complete',
    controls: [width],
    parked: {
      lang: 'en', time: Date.now(), files: [file('holiday.jpg')],
      values: [{ key: '#width', value: '640' }],
    },
  });
  await page.settle();

  assert.deepEqual(page.input.files, [file('holiday.jpg')], 'through the file input');
  assert.deepEqual(page.input.fired, ['change'], 'as if it had been chosen');
  assert.equal(width.value, '640');
  assert.deepEqual(width.fired, ['input', 'change'], 'and the tool is told, or it would ignore it');
});

test('a file coming back says so, for exactly as long as it takes to say it', async () => {
  // A tool that places a file by looking at what is already on the page needs
  // to know the difference between a file arriving and a file coming back.
  // compare-text puts a single dropped file into whichever box is empty, which
  // is right for a drop and wrong for a restore: it reads the file
  // asynchronously, the settings land while it is still reading, and by the
  // time it looks the box the file came out of is full again - so it files the
  // text as a second document and calls the two identical.
  //
  // The mark is readable for the length of the dispatch and gone afterwards.
  // Both halves matter: a handler takes its copy synchronously before its
  // first await, and a mark left behind would make every later drop look like
  // a restore.
  const page = run({
    lang: 'de',
    ready: 'complete',
    parked: {
      lang: 'en', time: Date.now(), files: [file('holiday.jpg')], values: [],
    },
  });

  let saidDuring = null;
  const dispatch = page.input.dispatchEvent;
  page.input.dispatchEvent = (event) => {
    if (event.type === 'change') saidDuring = page.input.dataset.langRestore;
    return dispatch(event);
  };

  await page.settle();

  assert.equal(saidDuring, '1', 'the tool was not told the file was coming back');
  assert.equal(page.input.dataset.langRestore, undefined,
    'the mark was left on the input, so the next real drop would look like a restore');
});

test('it waits for load, so the tool is listening before it is told anything', async () => {
  const page = run({
    lang: 'de',
    parked: { lang: 'en', time: Date.now(), files: [file('a.jpg')], values: [] },
  });
  await page.settle();
  assert.deepEqual(page.input.files, [], 'nothing yet');

  page.load();
  await page.settle();
  assert.deepEqual(page.input.files, [file('a.jpg')]);
});

test('a record parked in this same language is a reload, and is refused', async () => {
  const width = control('input', 'width', { value: '1200' });
  const page = run({
    lang: 'en',
    ready: 'complete',
    controls: [width],
    parked: {
      lang: 'en', time: Date.now(), files: [file('a.jpg')],
      values: [{ key: '#width', value: '640' }],
    },
  });
  await page.settle();

  assert.deepEqual(page.input.files, []);
  assert.equal(width.value, '1200', 'a refresh is how somebody clears a tool');
});

test('a record older than the switch it describes is refused', async () => {
  const page = run({
    lang: 'de',
    ready: 'complete',
    parked: {
      lang: 'en', time: Date.now() - 10 * 60 * 1000, files: [file('a.jpg')], values: [],
    },
  });
  await page.settle();
  assert.deepEqual(page.input.files, []);
});

test('a record is taken exactly once, and what is left behind is swept', async () => {
  const held = new Map();
  const first = run({
    lang: 'de',
    ready: 'complete',
    held,
    parked: { lang: 'en', time: Date.now(), files: [file('a.jpg')], values: [] },
  });
  await first.settle();
  assert.deepEqual(first.input.files, [file('a.jpg')]);
  assert.equal(held.size, 0, 'consumed');

  held.set('some-other-tool', { lang: 'en', time: Date.now() - 10 * 60 * 1000, files: [] });
  const later = run({ lang: 'de', ready: 'complete', held });
  await later.settle();
  assert.equal(held.size, 0, 'and an abandoned one does not sit there holding a file');
});

test('what comes back is not then read as a fresh choice', async () => {
  const page = run({
    lang: 'de',
    ready: 'complete',
    multiple: true,
    parked: {
      lang: 'en', time: Date.now(), files: [file('a.jpg'), file('b.jpg')], values: [],
    },
  });
  await page.settle();

  // Switch again without touching anything: the set must be the two files it
  // was handed, not those two appended to themselves.
  page.click(page.link);
  await page.settle();
  assert.deepEqual(page.record().files, [file('a.jpg'), file('b.jpg')]);
});

test('a setting the tool has already filled in with the same value is not re-announced', async () => {
  const width = control('input', 'width', { value: '1200' });
  width.value = '640';
  const page = run({
    lang: 'de',
    ready: 'complete',
    controls: [width],
    parked: { lang: 'en', time: Date.now(), files: [], values: [{ key: '#width', value: '640' }] },
  });
  await page.settle();
  assert.deepEqual(width.fired, []);
});

test('a select whose options do not carry the value is left alone', async () => {
  const empty = control('select', 'series', { options: [] });
  const page = run({
    lang: 'de',
    ready: 'complete',
    controls: [empty],
    parked: { lang: 'en', time: Date.now(), files: [], values: [{ key: '#series', value: '3' }] },
  });
  await page.settle();
  assert.equal(empty.value, '');
  assert.deepEqual(empty.fired, [], 'telling a tool about a change that did not take is a lie');
});

/* ---------------------------------------------------- when nothing will hold */

test('storage refusing loses the work but never the switch', async () => {
  const typed = control('textarea', 'input', { value: '' });
  typed.value = 'a paragraph';
  const page = run({ controls: [typed], refuseStorage: true });

  page.click(page.link);
  await page.settle();

  assert.deepEqual(page.went, ['/de/bild-komprimieren/'],
                   'the reader asked for another language and gets it');
});

test('a page with no picker still carries its settings', async () => {
  const words = control('input', 'words', { value: '6' });
  words.value = '9';
  const page = run({ controls: [words], hasInput: false, tool: 'password-generator' });

  page.click(page.link);
  await page.settle();

  assert.deepEqual(page.record().values, [{ key: '#words', value: '9' }]);
});
