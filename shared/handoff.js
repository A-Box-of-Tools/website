/**
 * "Carry the result on" - the button that turns two tools into a chain.
 *
 * GENERATED FILE - do not edit; see shared/handoff.js.
 *
 * A result made on one page here so often wants to be the input of another:
 * the trimmed clip becomes the GIF, the scanned pages join the emailed
 * contract, the stacked photo goes to the compressor. Until this file the
 * route was download, find the file, drop it on the next page - three manual
 * steps carrying a file the browser already held in memory the whole time.
 *
 * WHAT THIS DOES, AND WHAT IT NEVER DOES
 *
 * When a tool that declares handoff targets finishes a result - its download
 * link gets a blob: URL and becomes visible - a small row of links appears
 * beside that link: the other tools this result can go straight into. Clicking
 * one reads the result out of the page's own blob: URL, parks it in
 * IndexedDB, and navigates. The next page finds it there, feeds it through
 * the same file input a dropped file goes through, and deletes it.
 *
 * Nothing in that journey touches the network. A blob: URL names bytes inside
 * this page; IndexedDB is the browser's own storage on this machine, the same
 * place the service worker already keeps the page itself; and the fetch() that
 * reads the blob is same-document plumbing that the sender's own
 * Content-Security-Policy has to permit explicitly (connect-src blob:, in the
 * sender's tool.toml). The promise the site makes - your files never leave
 * your machine - is exactly as true across the handoff as on either side of
 * it.
 *
 * WHY THE RECEIVER NEEDS NO CODE OF ITS OWN
 *
 * The parked file is delivered through the file input every tool already has,
 * with a DataTransfer and a synthetic change event - to the receiving tool it
 * is indistinguishable from a file the visitor picked. That is the point: the
 * receiving page keeps exactly one way of accepting a file, and this script
 * uses it rather than adding a second door to every tool. Records are keyed
 * by the receiving tool's slug, consumed exactly once, and swept after ten
 * minutes so an abandoned handoff does not sit in storage holding somebody's
 * contract.
 *
 * Like shared/feedback.js beside it, this is a frame script rather than a
 * shared module: no tool imports it, no tool.toml asks for it, and the only
 * markup it touches is its own - templates/partials/handoff.html, rendered
 * hidden on pages that declare targets and moved next to the download link
 * when there is a result to carry.
 */
(function () {
  'use strict';

  var DB = 'abox-handoff';
  var STORE = 'files';

  // Long enough to survive a slow navigation and a service worker update on
  // the way; short enough that a handoff nobody completed is not still holding
  // the file when the machine changes hands at the end of the day.
  var FRESH = 10 * 60 * 1000;

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

  function park(slug, record) {
    return inStore('readwrite', function (store) { return store.put(record, slug); });
  }

  function take(slug) {
    return inStore('readwrite', function (store) {
      var got = store.get(slug);
      got.onsuccess = function () { store.delete(slug); };
      return got;
    });
  }

  /** Anything past FRESH goes, whichever tool it was addressed to. */
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

  /* ------------------------------------------------------------- receiving */

  // The slug this page files feedback under is the same name a sender parks
  // a file under, and it is already in the markup.
  var page = document.getElementById('feedback');
  var slug = page ? page.getAttribute('data-tool') : '';

  function deliver(file) {
    var input = document.getElementById('file-input');
    if (!input || typeof DataTransfer === 'undefined') return;
    var carrier = new DataTransfer();
    carrier.items.add(file);
    input.files = carrier.files;
    // The same event a real pick fires, so the tool's own wiring - reading,
    // thumbnails, error messages - runs unchanged and this page needs no
    // second way of accepting a file.
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function receive() {
    if (!slug) return;
    take(slug).then(function (record) {
      if (record && record.file && record.time
          && Date.now() - record.time <= FRESH) {
        deliver(record.file);
      }
      return sweep();
    }).catch(function () {
      // IndexedDB refused - storage disabled, or a browser mode that throws.
      // The page is then simply a page somebody opened without a file, which
      // is the state it was built for.
    });
  }

  // Module scripts have all run by 'load', so the tool's change listener is
  // wired before the synthetic event fires.
  if (document.readyState === 'complete') receive();
  else window.addEventListener('load', receive, { once: true });

  /* --------------------------------------------------------------- sending */

  var nav = document.getElementById('handoff');
  if (!nav) return;

  /** The finished result: a visible download link naming bytes in this page. */
  function result() {
    var anchor = document.getElementById('download');
    if (!anchor || anchor.hidden || !anchor.hasAttribute('download')) return null;
    var href = anchor.getAttribute('href') || '';
    return href.indexOf('blob:') === 0 ? anchor : null;
  }

  /**
   * The block the carry row belongs at the end of.
   *
   * Every tool that offers a handoff puts its download link in a row beside
   * the result's own numbers - `.result-meta`, `.results-head` - and those rows
   * are flex containers. Dropping the nav in next to the link there makes it a
   * flex item: it lands to the *right* of the button and squeezes the layout
   * the tool arranged, or wraps to a half-width band on its own line, and
   * which of the two happens depends on how long the numbers happen to be in
   * the reader's language. Climbing out of those rows to the nearest ordinary
   * block and appending puts the row under the finished result instead, which
   * is where a next step belongs and is the same place in every tool, at every
   * window width, in every language.
   */
  function seat(anchor) {
    var node = anchor;
    while (node.parentNode && node.parentNode !== document.body) {
      var parent = node.parentNode;
      var display = window.getComputedStyle(parent).display;
      // `none` is the tool holding the whole result back; seating the row
      // inside it hides the row too, which is the right answer anyway.
      if (display === 'block' || display === 'flow-root' || display === 'none') {
        return parent;
      }
      node = parent;
    }
    return null;
  }

  function show() {
    var anchor = result();
    // Every write in here is guarded by a read. The observer below watches
    // `hidden` across the page, and that includes this nav's own attribute:
    // setting it to the value it already has still records a mutation, which
    // re-runs this function, which sets it again - a microtask loop that
    // freezes the tab. Writing only on change is what breaks the cycle.
    if (!anchor) {
      // No result yet. The row stays where the markup put it, saying what this
      // tool feeds; whether it is still inert is file-picker.js's business.
      return;
    }
    // Under the result the download belongs to. A tool laid out in a way this
    // finds no block in falls back to the link's own side, which is where the
    // row used to sit unconditionally.
    var host = seat(anchor);
    if (host) {
      if (host.lastElementChild !== nav) host.appendChild(nav);
    } else if (anchor.parentNode && anchor.nextElementSibling !== nav) {
      anchor.insertAdjacentElement('afterend', nav);
    }
    if (nav.hidden) nav.hidden = false;
    // A result is the strongest possible sign there is something to carry, so
    // the row is live from here whatever the picker did.
    if (nav.hasAttribute('inert')) nav.removeAttribute('inert');
  }

  // Tools reveal the link by unhiding it and swapping its href for each new
  // result; both are attribute changes, and new anchors never appear - the
  // markup is static - so watching attributes is enough.
  var watch = new MutationObserver(show);
  watch.observe(document.body, {
    subtree: true, attributes: true, attributeFilter: ['href', 'hidden'],
  });
  show();

  // Reading the bytes back and parking them is fast - a blob: URL is a
  // reference, not a copy, and IndexedDB stores it as one - but it is not
  // instant, and the navigation only starts once it is done. A second click in
  // that window would park a second file, addressed to a tool the reader is
  // not about to open, where it would sit until the sweep. One carry at a time.
  var carrying = false;

  nav.addEventListener('click', function (event) {
    var link = event.target && event.target.closest
      ? event.target.closest('a[data-slug]') : null;
    if (!link) return;
    if (carrying) { event.preventDefault(); return; }
    var anchor = result();
    if (!anchor) return;    // stale click; let the plain navigation happen

    event.preventDefault();
    carrying = true;
    // Says "this click landed" for the moment before the page changes, in the
    // one way that needs no words: the styling is in tool-frame.css.
    link.setAttribute('aria-busy', 'true');
    var name = anchor.getAttribute('download') || 'result';

    // Read the page's own bytes back out of the blob: URL, park them for the
    // next page, and go. If any step refuses - CSP, storage, anything - the
    // fallback is the navigation alone: the reader lands on the tool and drops
    // the file by hand, which is exactly the journey this button shortens.
    window.fetch(anchor.href)
      .then(function (response) { return response.blob(); })
      .then(function (blob) {
        var file = new File([blob], name, { type: blob.type });
        return park(link.getAttribute('data-slug'),
                    { file: file, from: slug, time: Date.now() });
      })
      .catch(function () { /* fall through to the plain visit */ })
      .then(function () { window.location.assign(link.href); });
  });
})();
