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
 * When a tool that declares handoff targets finishes - a download link gets a
 * blob: URL and becomes visible - a small row of links appears under the
 * result: the other tools it can go straight into. Clicking one reads the
 * bytes back out of the page's own blob: URLs, parks them in IndexedDB, and
 * navigates. The next page finds them there, feeds them through the same file
 * input a dropped file goes through, and deletes the record.
 *
 * A result is not always one file. Many tools here work through a batch -
 * twelve photos compressed, a folder of pictures stripped of their metadata -
 * and show a row per result rather than a single download button. Those are
 * the pages where the detour costs most, because it is twelve files to save
 * and twelve to hand over again, and they are the reason this file looks for
 * results in two shapes rather than one. Everything a page has finished
 * travels together; see `results` below.
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
 * hidden on pages that declare targets, then moved next to the download link
 * and revealed when there is a result to carry.
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

  function deliver(files) {
    var input = document.getElementById('file-input');
    if (!input || !files.length || typeof DataTransfer === 'undefined') return;
    var carrier = new DataTransfer();
    for (var i = 0; i < files.length; i++) carrier.items.add(files[i]);
    input.files = carrier.files;
    // The same event a real pick fires, so the tool's own wiring - reading,
    // thumbnails, error messages - runs unchanged and this page needs no
    // second way of accepting a file.
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /**
   * What a record is carrying, whichever shape parked it.
   *
   * `files` is the shape a batch sender parks and the one every sender parks
   * now; `file` is what a single-result sender parked before this file learned
   * to carry a list. Both are read because a record outlives the page that
   * wrote it: a visitor with a tool open in another tab from before a deploy
   * can still click carry, and the receiving page is the new one. Ten minutes
   * of overlap costs one line here and is invisible to everybody.
   */
  function carried(record) {
    if (!record) return [];
    if (record.files && record.files.length) return record.files;
    return record.file ? [record.file] : [];
  }

  function receive() {
    if (!slug) return;
    take(slug).then(function (record) {
      if (record && record.time && Date.now() - record.time <= FRESH) {
        deliver(carried(record));
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

  /** A download link is carriable when it is on screen and names bytes here. */
  function carriable(anchor) {
    if (!anchor || anchor.hidden || !anchor.hasAttribute('download')) return false;
    var href = anchor.getAttribute('href') || '';
    if (href.indexOf('blob:') !== 0) return false;
    // A row inside a results block the tool is still holding back is not
    // hidden itself - its container is - so `hidden` alone would carry the
    // leftovers of a previous run. `offsetParent` is null for anything inside
    // a display:none ancestor, which is the one read that answers for the
    // whole chain.
    return anchor.offsetParent !== null;
  }

  /**
   * The finished results: every visible download link naming bytes in this
   * page, in the order the page shows them.
   *
   * Two shapes, because tools finish in two shapes. A tool that makes ONE
   * thing - a trimmed clip, a merged PDF - reveals the single `#download`
   * anchor its body.html declares, and that was the only shape this file knew
   * how to carry. A tool that works through a BATCH - the compressor, the
   * resizer, the EXIF cleaner - has no such anchor at all: it builds a row per
   * result inside `.result-list`, each with its own link, and offers a ZIP of
   * the lot beside the heading. Those are the tools where the download
   * detour hurts most, because it is not one file to fetch and hand on but
   * twelve, and until this function looked for them the carry row could never
   * appear on any of them.
   *
   * Both shapes are read rather than one or the other, and the rows come
   * second, so a tool that grows a list beside its single result carries them
   * in the order a reader sees them.
   */
  function results() {
    var found = [];
    var one = document.getElementById('download');
    if (carriable(one)) found.push(one);
    var rows = document.querySelectorAll('.result-list a[download]');
    for (var i = 0; i < rows.length; i++) {
      if (carriable(rows[i])) found.push(rows[i]);
    }
    return found;
  }

  /**
   * The first carriable result, or null - all `show` below needs to know.
   *
   * Separate from `results` because of what watches it. The observer has to
   * include childList to see a batch tool's rows arrive at all (see there),
   * which puts this function on the end of every DOM insertion the page makes
   * while it works - and `carriable` reads `offsetParent`, which forces
   * layout. Stopping at the first hit keeps that to one read per call instead
   * of one per result, on a page that may be building fifty of them.
   */
  function firstResult() {
    var one = document.getElementById('download');
    if (carriable(one)) return one;
    var rows = document.querySelectorAll('.result-list a[download]');
    for (var i = 0; i < rows.length; i++) {
      if (carriable(rows[i])) return rows[i];
    }
    return null;
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
    var anchor = firstResult();
    // Every write in here is guarded by a read. The observer below watches
    // `hidden` across the page, and that includes this nav's own attribute:
    // setting it to the value it already has still records a mutation, which
    // re-runs this function, which sets it again - a microtask loop that
    // freezes the tab. Writing only on change is what breaks the cycle.
    if (!anchor) {
      // No result yet, so the row stays hidden. An offer to carry a result
      // is a false one until there is a result: the strip used to sit under
      // the last card, greyed, promising to pass on something the page had
      // not made.
      return;
    }
    // Already up, and already in the block this result lives in: nothing to
    // do. Worth the two reads because of what calls this - the observer fires
    // once per appended row, and `seat` below walks the ancestors asking
    // getComputedStyle for each, which forces layout on a page that is in the
    // middle of building fifty of them.
    if (!nav.hidden && nav.parentNode && nav.parentNode !== document.body
        && nav.parentNode.contains(anchor) && nav.parentNode.lastElementChild === nav) {
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
    // A result is the strongest possible sign there is something to carry, so
    // this is the one place the row is revealed. Guarded by a read for the
    // reason above: the observer watches `hidden`, and writing it unchanged
    // would re-enter this function forever.
    if (nav.hidden) nav.hidden = false;
  }

  // A tool with one result reveals its link by unhiding it and swaps the href
  // for each new result; both are attribute changes, and that anchor is in the
  // markup from the start.
  //
  // A batch tool's rows are not. They are built and appended as the run
  // finishes, and - checked in every tool that has them - the results block is
  // unhidden BEFORE the first row goes in. So the `hidden` change this used to
  // rely on arrives while the list is still empty. It happens to work anyway,
  // because a MutationObserver delivers at the end of the task and the appends
  // are in the same one; that is a coincidence of how those tools are written
  // rather than anything this file is owed, and it would break silently the
  // day a tool appended its rows from a promise. childList is what actually
  // answers the question being asked.
  var watch = new MutationObserver(show);
  watch.observe(document.body, {
    subtree: true, childList: true,
    attributes: true, attributeFilter: ['href', 'hidden'],
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
    // Read again rather than trusting what `show` last saw: the row is revealed
    // once and the list behind it goes on growing, so this is the only moment
    // the full set is known.
    var anchors = results();
    if (!anchors.length) return;    // stale click; let the plain navigation happen

    event.preventDefault();
    carrying = true;
    // Says "this click landed" for the moment before the page changes, in the
    // one way that needs no words: the styling is in tool-frame.css.
    link.setAttribute('aria-busy', 'true');

    // Read the page's own bytes back out of its blob: URLs, park them for the
    // next page, and go. If any step refuses - CSP, storage, anything - the
    // fallback is the navigation alone: the reader lands on the tool and drops
    // the files by hand, which is exactly the journey this button shortens.
    //
    // All of them or none: Promise.all rejects on the first failure and the
    // catch below falls through to the plain visit. Parking the subset that
    // did read would be worse than parking nothing, because the next page
    // cannot tell a short delivery from a complete one and neither can the
    // reader - they would see eleven of their twelve photos and no reason why.
    window.Promise.all(anchors.map(function (anchor) {
      return window.fetch(anchor.href)
        .then(function (response) { return response.blob(); })
        .then(function (blob) {
          return new File([blob], anchor.getAttribute('download') || 'result',
                          { type: blob.type });
        });
    }))
      .then(function (files) {
        return park(link.getAttribute('data-slug'),
                    { files: files, from: slug, time: Date.now() });
      })
      .catch(function () { /* fall through to the plain visit */ })
      .then(function () { window.location.assign(link.href); });
  });
})();
