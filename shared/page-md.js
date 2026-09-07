/**
 * "Copy for LLM" - the button beside every page's Markdown twin.
 *
 * GENERATED FILE - do not edit; see shared/page-md.js.
 *
 * The text it copies is already in the page, in the hidden <pre> that
 * templates/partials/page-md.html renders, so the whole job is reading one
 * element and writing the clipboard. That is the point of the arrangement and
 * not an accident of it: fetching index.md would be the first thing on a tool
 * page to reach the network, and the page's own Content-Security-Policy would
 * refuse it - connect-src names nothing under this site's control, and
 * widening it for a convenience button is exactly the kind of change the
 * policy is written down to make visible. buildlib/markdown.py says the rest.
 *
 * Nothing is sent anywhere; the clipboard is the visitor's own. Where there is
 * no clipboard to write - a page served over plain http from a machine that is
 * not localhost, or a browser old enough not to have the API - the button goes
 * away, and the "View as Markdown" link beside it, which needs no script,
 * stays. A frame script rather than a shared module for the reason
 * shared/feedback.js is one: no tool imports it and no tool.toml asks for it.
 */
(function () {
  'use strict';

  var button = document.querySelector('.page-md-copy');
  var block = document.getElementById('page-markdown');
  var status = document.querySelector('.page-md-status');
  if (!button || !block || !status) return;

  var clipboard = navigator.clipboard;
  if (!clipboard || typeof clipboard.writeText !== 'function') {
    button.hidden = true;
    return;
  }

  // How long the word stays: long enough to be read, short enough that the
  // row is itself again before the next thing the visitor does.
  var LINGER = 2000;
  var timer = 0;

  function say(word) {
    status.textContent = word;
    clearTimeout(timer);
    timer = setTimeout(function () { status.textContent = ''; }, LINGER);
  }

  button.addEventListener('click', function () {
    clipboard.writeText(block.textContent).then(
      function () { say(status.getAttribute('data-copied') || ''); },
      function () { say(status.getAttribute('data-failed') || ''); }
    );
  });
})();
