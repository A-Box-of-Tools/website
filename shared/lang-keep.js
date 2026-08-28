/**
 * The work a language switch must not throw away.
 *
 * GENERATED FILE - do not edit; see shared/lang-keep.js.
 *
 * WHAT THIS DOES, IN ONE SENTENCE
 *
 * A click on the language switcher is a navigation, and until this file it was
 * a navigation that emptied the tool: the file you had chosen, the quality you
 * had settled on, the text you had pasted. This carries all three across and
 * hands them back on the other side, so that changing the language changes the
 * words and nothing else.
 *
 * WHY IT IS NOT SIMPLY A PAGE THAT SWAPS ITS OWN WORDS
 *
 * Because there is no such page. Every language here is its own document at
 * its own address, with its own canonical, its own hreflang set and its own
 * translated slug - which is what makes the site legible to a crawler and
 * linkable in fourteen languages. Rewriting the page in place would throw all
 * of that away to save one navigation. So the navigation stays, and the work
 * travels with it.
 *
 * WHERE THE WORK IS PUT WHILE THE PAGE CHANGES
 *
 * In IndexedDB, exactly as shared/handoff.js parks a result on its way to
 * another tool, and for the same reason: it is the only storage a File
 * survives, and it is the browser's own store on this machine. Nothing here
 * touches the network - there is no fetch, no blob: URL to read back, and
 * therefore nothing for a tool's Content-Security-Policy to have to permit.
 * The record is addressed to one tool, consumed exactly once, refused if it is
 * more than a couple of minutes old, and swept if it is ever left behind.
 *
 * The address is the slug in `data-tool`, which is the English slug in every
 * language - the one thing about a tool page that does not change when the
 * language does, and so the only thing the two sides of a switch can agree on.
 *
 * WHAT IT CARRIES, AND WHAT IT DOES NOT
 *
 * Two things, both taken through doors that already exist:
 *
 *   - THE FILES, watched at the one place every file enters a tool: the change
 *     event on #file-input, and a drop on the dropzone around it. They are
 *     handed back through the same file input shared/handoff.js delivers
 *     through, with a DataTransfer and a synthetic change event, so the
 *     receiving page needs no code of its own and the tool re-reads them
 *     exactly as if they had been dropped again.
 *   - THE SETTINGS the visitor moved: every input, textarea and select inside
 *     <main> whose value differs from the one written in the markup. Only the
 *     difference, so a page nobody has touched carries nothing at all and the
 *     switcher stays the plain link it was built as. Each is named by its id,
 *     or - for the mode switch at the top of a dozen tools, which is a group of
 *     radios sharing a `name` and carrying no id at all - by that name and its
 *     own value, or by whatever `data-` attribute the markup used instead. See
 *     keyOf() below; asking for an id alone lost exactly the setting that says
 *     what to do with the file.
 *
 * What it does not carry is anything a tool worked out for itself. A result
 * already computed is not restored - the tool recomputes it from the file, the
 * way it would have anyway - and a control the tool FILLS IN from the file it
 * was given, a width read off an image or a duration read off a clip, is
 * filled in from the file again rather than from the record. There is no
 * generic way to tell those apart from a setting the visitor chose, and
 * re-deriving them is the answer that cannot be stale.
 *
 * Nor does it know about a file a tool has since dropped from a list of its
 * own: the doors above see files arriving and no tool announces a removal. A
 * list the visitor pruned therefore comes back whole. That is a smaller loss
 * than the one this file exists to fix, and the fix for it - a removal every
 * tool has to remember to announce - is a promise thirty-six tools would have
 * to keep for it to mean anything.
 *
 * Like shared/feedback.js and shared/handoff.js beside it, this is a frame
 * script rather than a shared module: no tool imports it, no tool.toml asks
 * for it, and it says nothing on screen - so there is no sentence in here to
 * arrive in the wrong language, which on this file of all files would be a
 * joke at its own expense.
 */
(function () {
  'use strict';

  var DB = 'abox-lang-keep';
  var STORE = 'work';

  // Long enough for a slow navigation and a service worker update on the way;
  // short enough that work nobody came back for is not still sitting in
  // storage. Shorter than the handoff's ten minutes because this describes one
  // click and the page it lands on, not an errand somebody might finish later.
  var FRESH = 2 * 60 * 1000;

  // Output, not input. A control the tool wrote and locked is not a change the
  // visitor made, and a password field is the one value that should not be
  // written down anywhere on the way to a page that would have generated it
  // again.
  var IGNORE = {
    file: true, hidden: true, password: true,
    button: true, submit: true, reset: true, image: true,
    'select-multiple': true,
  };

  var page = document.getElementById('feedback');
  var slug = page ? page.getAttribute('data-tool') : '';
  var main = document.getElementById('main');
  var here = document.documentElement.getAttribute('lang') || '';
  var input = document.getElementById('file-input');

  // Not a tool page, or one built before this file existed. Either way there is
  // no work here to keep and nowhere to file it.
  if (!slug || !main) return;

  /* -------------------------------------------------------------- the store */

  function open() {
    return new Promise(function (resolve, reject) {
      var req = window.indexedDB.open(DB, 1);
      req.onupgradeneeded = function () { req.result.createObjectStore(STORE); };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
  }

  /** One transaction, promised. `use` gets the store and returns a request. */
  function inStore(mode, use) {
    return open().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, mode);
        var req = use(tx.objectStore(STORE));
        tx.oncomplete = function () { db.close(); resolve(req && req.result); };
        tx.onerror = function () { db.close(); reject(tx.error); };
      });
    });
  }

  function park(record) {
    return inStore('readwrite', function (store) { return store.put(record, slug); });
  }

  function take() {
    return inStore('readwrite', function (store) {
      var got = store.get(slug);
      got.onsuccess = function () { store.delete(slug); };
      return got;
    });
  }

  /**
   * Anything past FRESH goes, whichever tool it was addressed to.
   *
   * A switch that was parked and then abandoned - the back button, a closed
   * tab, a page that never finished loading - leaves a record nobody will ever
   * take. This is the only thing that collects them.
   */
  function sweep() {
    return inStore('readwrite', function (store) {
      var walk = store.openCursor();
      walk.onsuccess = function () {
        var cursor = walk.result;
        if (!cursor) return;
        var record = cursor.value;
        if (!record || !record.time || Date.now() - record.time > FRESH) cursor.delete();
        cursor.continue();
      };
      return null;
    });
  }

  /* ----------------------------------------------------------- the settings */

  /**
   * What a select shows when nobody has touched it.
   *
   * The option carrying the `selected` attribute, or - if the markup names
   * none - the first one, which is what the browser shows.
   */
  function fallback(node) {
    var options = node.options;
    for (var i = 0; i < options.length; i += 1) {
      if (options[i].defaultSelected) return options[i].value;
    }
    return options.length ? options[0].value : '';
  }

  /**
   * What to call a control, so that the page in the other language can be
   * asked for the same one.
   *
   * An `id` where there is one, which is most of them. But the control a
   * visitor is most likely to have moved often has no id at all: the mode
   * switch at the top of a tool - fill or pixelate, keep or cut, colour or
   * mono - is a group of radios sharing a `name`, and a name is all the markup
   * gives them, because the tool reads the group with a selector rather than
   * one button at a time. Skipping those, which is what asking for an id alone
   * did, meant a language switch handed back the file and lost the single
   * setting that says what to do with it.
   *
   * So: the id, or the name, or whatever `data-` attribute the markup used
   * instead - hash-checksum names its algorithms `data-algorithm` and nothing
   * else. A radio or a checkbox addressed by name carries its own `value` too,
   * since the name belongs to the group and the value is the half that says
   * which button. Every one of those comes from the markup, and the markup is
   * structurally the same in all fifteen languages, which is the whole reason
   * any of this can be named on one page and found on another.
   */
  function keyOf(node) {
    if (node.id) return '#' + node.id;

    var type = String(node.type || '').toLowerCase();
    var name = node.getAttribute('name');
    if (name) {
      return '@' + name
        + (type === 'radio' || type === 'checkbox' ? '=' + node.value : '');
    }

    // Sorted, so that the key does not depend on the order the attributes
    // happen to be written in - which is not something a translator copying a
    // body across should have to preserve.
    var data = [];
    var attrs = node.attributes;
    for (var i = 0; i < attrs.length; i += 1) {
      if (attrs[i].name.indexOf('data-') === 0) {
        data.push(attrs[i].name + '=' + attrs[i].value);
      }
    }
    return data.length ? '~' + data.sort().join('&') : '';
  }

  /** Every control inside the tool no longer showing its markup value. */
  function settings() {
    var out = [];
    var nodes = main.querySelectorAll('input, textarea, select');
    for (var i = 0; i < nodes.length; i += 1) {
      var node = nodes[i];
      var type = String(node.type || '').toLowerCase();
      if (node.disabled || node.readOnly || IGNORE[type]) continue;
      var key = keyOf(node);
      if (!key) continue;
      if (type === 'checkbox' || type === 'radio') {
        if (node.checked !== node.defaultChecked) out.push({ key: key, on: node.checked });
      } else if (node.tagName === 'SELECT') {
        if (node.value !== fallback(node)) out.push({ key: key, value: node.value });
      } else if (node.value !== node.defaultValue) {
        out.push({ key: key, value: node.value });
      }
    }
    return out;
  }

  /**
   * The control on this page that a carried key names, or nothing.
   *
   * Walked rather than selected. A key is assembled from attribute values the
   * markup chose, and putting one back into a selector would mean escaping it
   * correctly for every character a tool might have used; comparing the keys
   * this page computes for itself asks the same question and cannot be got
   * wrong. It is a handful of controls either way.
   */
  function find(key) {
    var nodes = main.querySelectorAll('input, textarea, select');
    for (var i = 0; i < nodes.length; i += 1) {
      if (keyOf(nodes[i]) === key) return nodes[i];
    }
    return null;
  }

  /**
   * Put them back, and tell the tool.
   *
   * Setting `value` from script fires nothing, so a tool that recomputes on
   * input - which is most of them - would show the restored setting and ignore
   * it. Both events are sent because tools listen for one or the other, and the
   * pair is what a person moving the control would have produced.
   *
   * Every write is guarded by a read of what is already there: a control the
   * tool has since filled in with the same value needs no event, and one whose
   * options do not include the carried value - a select the tool populates
   * itself, and has not yet - is left alone rather than told about a change
   * that did not take.
   */
  function apply(values) {
    for (var i = 0; i < values.length; i += 1) {
      var want = values[i];
      var node = want.key ? find(want.key) : null;
      if (!node) continue;
      if (typeof want.on === 'boolean') {
        if (node.checked === want.on) continue;
        node.checked = want.on;
      } else {
        if (node.value === want.value) continue;
        node.value = want.value;
        if (node.value !== want.value) continue;
      }
      node.dispatchEvent(new Event('input', { bubbles: true }));
      node.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  /* -------------------------------------------------------------- the files */

  /** What this page has been given, in the order it was given them. */
  var held = [];

  // True only while this file is handing files back, so that the change event
  // it fires is not read as the visitor choosing them a second time and
  // appended to the very set it was restored from.
  var restoring = false;

  function note(files) {
    var picked = [];
    for (var i = 0; i < (files ? files.length : 0); i += 1) picked.push(files[i]);
    if (!picked.length) return;
    // A picker marked `multiple` belongs to a tool that adds to a list; one
    // without it replaces what it had. Following the input's own attribute is
    // how this gets both right without knowing which tool it is on.
    held = (input && input.multiple && !restoring) ? held.concat(picked) : picked;
  }

  if (input) {
    // Registered here rather than in the tool, and therefore first: this file
    // is a deferred script and src/main.js is a module, so the picker's own
    // listener is added after this one and runs after it. That matters,
    // because the first thing the picker does is empty `input.value` - which
    // is what lets somebody choose the same file twice, and would leave
    // nothing here to read.
    input.addEventListener('change', function () { note(input.files); });
  }

  // A dropped file never touches the input at all, so it is caught where it
  // lands. Capturing, for the same reason as above: the dropzone's own handler
  // must not have had the chance to consume the event first. Only drops on the
  // dropzone count - the frame swallows a drop anywhere else on the page
  // precisely so that nothing happens.
  document.addEventListener('drop', function (event) {
    var target = event.target;
    if (!target || !target.closest || !target.closest('#dropzone')) return;
    if (event.dataTransfer) note(event.dataTransfer.files);
  }, true);

  /** Hand them to the tool the way a visitor would have. */
  function deliver(files) {
    if (!input || !files.length || typeof DataTransfer === 'undefined') return;
    var carrier = new DataTransfer();
    for (var i = 0; i < files.length; i += 1) carrier.items.add(files[i]);
    input.files = carrier.files;
    restoring = true;
    /* Said on the input as well as kept here, because the tool has to be able
       to see it. A tool that places a file by looking at what is already on
       the page - compare-text puts a single file into whichever box is empty,
       which is the only thing a drop could sensibly mean - gets that judgement
       wrong during a restore: it reads the file asynchronously, the settings
       below land while it is still reading, and by the time it looks the box
       it came out of is full again. It then files the text as a second
       document and reports the two as identical.

       The flag is readable for exactly as long as this dispatch runs, which is
       long enough: a handler starts synchronously and can take a copy before
       its first await. */
    input.dataset.langRestore = '1';
    input.dispatchEvent(new Event('change', { bubbles: true }));
    delete input.dataset.langRestore;
    restoring = false;
  }

  /* -------------------------------------------------------------- receiving */

  function receive() {
    take().then(function (record) {
      if (record && record.time && Date.now() - record.time <= FRESH
          // The language it was parked in, which is the proof that this is the
          // far side of a switch rather than a reload of the page it was parked
          // on. Without it, a refresh would restore work the visitor had just
          // cleared by refreshing.
          && record.lang && record.lang !== here) {
        // Files first: a tool clears its controls when a new file arrives, and
        // a setting restored before that would be cleared along with them.
        if (record.files) deliver(record.files);
        if (record.values) apply(record.values);
      }
      return sweep();
    }).catch(function () {
      // IndexedDB refused - storage disabled, or a browser mode that throws.
      // The page is then a page somebody opened, which is the state it was
      // built for.
    });
  }

  // Module scripts have all run by 'load', so the tool's own listeners are
  // wired before the synthetic events above are fired at them.
  if (document.readyState === 'complete') receive();
  else window.addEventListener('load', receive, { once: true });

  /* ---------------------------------------------------------------- sending */

  // One switch at a time: a second click while the first is still writing would
  // park a second record over the first and then race it to the navigation.
  var carrying = false;

  document.addEventListener('click', function (event) {
    // A modified click opens a second tab. That tab is a fresh page and this
    // one keeps everything it has, so there is nothing to carry and nothing to
    // intercept.
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    var target = event.target;
    if (!target || !target.closest) return;
    var link = target.closest('a[hreflang]');
    if (!link || !link.closest('.lang-switch, .lang-pick, .lang-auto')) return;
    if (carrying) { event.preventDefault(); return; }

    var values = settings();
    // Nothing has been done to this page yet. The switcher is a plain link and
    // stays one: no storage is touched, no navigation is intercepted, and a
    // reader who is only browsing pays nothing for a feature they are not
    // using.
    if (!values.length && !held.length) return;

    event.preventDefault();
    carrying = true;
    // Says the click landed, for the moment before the page changes. The
    // styling is in shared/css/tool-frame.css, beside the handoff's.
    link.setAttribute('aria-busy', 'true');

    park({ lang: here, values: values, files: held, time: Date.now() })
      .catch(function () {
        // Storage refused, or the work is more than it will hold. The switch
        // itself is not worth blocking over: the reader asked for another
        // language and gets it, on the empty page they would have got before
        // this file existed.
      })
      .then(function () { window.location.assign(link.href); });
  });
}());
