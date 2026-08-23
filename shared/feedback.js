/**
 * The one question this site asks: did the file you just downloaded do the job?
 *
 * GENERATED FILE - do not edit; see shared/feedback.js.
 *
 * WHY THIS IS ALLOWED TO EXIST ON A SITE THAT MEASURES NOTHING
 *
 * The tools here work or they do not, and until this file there was no way to
 * find out which. Nothing is uploaded, so there is no server log to read; the
 * page view already counted says a tool was opened and cannot say whether
 * anybody left with a file they could use. A tool that quietly produces a
 * broken GIF on one browser is invisible for as long as nobody writes in.
 *
 * So: two buttons, after a download, once. Four rules keep that from becoming
 * the thing the rest of this site is arguing against.
 *
 *   1. IT SENDS AN ANSWER, NOT A REPORT. The tool's slug, "up" or "down", and
 *      one of four fixed reasons. There is no filename in it, no size, no
 *      count, no dimension, no format, and no free-text box that could carry
 *      any of those by accident - which is the whole reason the reasons are
 *      chips rather than a comment field. The panel prints that same promise
 *      where it is asking, in the language of the page around it.
 *   2. IT GOES WHERE THE PAGE VIEW ALREADY GOES. The one call is a gtag event
 *      to the measurement host every page here already loads, and which the
 *      live network check on the page already accounts for. No new origin, no
 *      widened Content-Security-Policy, and nothing under this site's control
 *      gains the ability to receive anything.
 *   3. IT ASKS ONCE AND THEN LEAVES. An answer buys silence for six months on
 *      that tool, a dismissal thirty days, a second dismissal a year. Kept in
 *      localStorage rather than a cookie, for the same reason shared/lang.js
 *      keeps the language choice there: a cookie would be sent to a server on
 *      every request, and this is nobody's business but the browser's.
 *   4. IT NEVER GETS IN THE WAY. It is a panel in the flow of the page, not a
 *      modal and not a toast: it takes no focus, covers nothing, blocks no
 *      button, and waits a second and a half after the click so that it is not
 *      competing with the browser's own download bar for the eye.
 *
 * WHAT COUNTS AS A DOWNLOAD
 *
 * There is no one place a download happens - a tool either offers an <a
 * download> or runs a button that builds a blob and saves it through an anchor
 * it never puts in the page - so this listens for the click rather than for the
 * save. Three shapes, all of them already in the markup: an anchor with a
 * download attribute and something to download, a button whose id starts with
 * "download", and anything carrying data-download, which is how a save button
 * named something else opts in.
 *
 * Delegated from the document in the capture phase, so a tool that stops the
 * event on the way up is still counted, and so a link built after the page
 * loaded needs no wiring of its own. That is what makes this a frame script and
 * not a shared module: no tool imports it, and no tool.toml asks for it.
 */
(function () {
  'use strict';

  var KEY = 'abox-feedback-';

  // A state and the moment it was written. Read out of storage a visitor can
  // edit, and used to decide whether to stay quiet, so it is checked on the way
  // in rather than trusted because of where it came from.
  var STATE = /^(a|d1|d2)\.(\d{1,15})$/;

  // How long each state buys, in days. An answer is worth the most silence:
  // they told us, and asking again in a month would be asking them to tell us
  // twice. A first dismissal is worth a month, because "not now" is not
  // "never" - and a second one is, near enough.
  var SILENCE = { a: 180, d1: 30, d2: 365 };
  var DAY = 86400000;

  // Long enough not to compete with the browser's own download bar, short
  // enough that it is plainly a response to the click and not something that
  // wandered in on its own.
  var DELAY = 1500;

  var THANKS = 2500;

  var panel = document.getElementById('feedback');
  if (!panel) return;

  var slug = panel.getAttribute('data-tool') || '';
  var ask = panel.querySelector('.feedback-ask');
  var why = panel.querySelector('.feedback-why');
  var thanks = panel.querySelector('.feedback-thanks');
  var note = panel.querySelector('.feedback-note');
  if (!slug || !ask || !why || !thanks) return;

  // Whether this page load has already had its one question. Set at the click
  // rather than when the panel appears, so a second download inside the delay
  // does not queue a second panel.
  var asked = false;

  // A "down" with no reason chosen yet. Held rather than sent, because sending
  // the verdict now and the reason afterwards would be two events for one
  // answer and a verdict counted twice. Flushed when they choose a reason, when
  // they close the panel, or when the page goes away underneath them.
  var pending = null;

  /* ------------------------------------------------------------ remembering */

  function stored() {
    try {
      var raw = window.localStorage.getItem(KEY + slug);
      return raw && STATE.test(raw) ? STATE.exec(raw) : null;
    } catch (err) {
      // Storage disabled, or a browser in a mode that throws rather than
      // returning null. Not knowing is a perfectly good state to be in here: it
      // asks, which is what happens to somebody who has never seen it.
      return null;
    }
  }

  function remember(state) {
    try {
      window.localStorage.setItem(KEY + slug, state + '.' + Date.now());
    } catch (err) { /* see stored() */ }
  }

  /** Whether this tool has already had its answer, or its refusal, recently. */
  function silent() {
    var was = stored();
    if (!was) return false;
    var when = Number(was[2]);
    // A clock that has moved backwards leaves a timestamp in the future, which
    // would otherwise silence this tool until the date it claims. Treat that as
    // no answer at all rather than as a very long one.
    if (when > Date.now()) return false;
    return Date.now() - when < SILENCE[was[1]] * DAY;
  }

  /** The state a dismissal moves to. A second refusal, and it stops asking. */
  function refusal() {
    var was = stored();
    return was && was[1].charAt(0) === 'd' ? 'd2' : 'd1';
  }

  /* ---------------------------------------------------------------- sending */

  /**
   * The whole of what leaves this page, and only when a button is pressed.
   *
   * gtag is missing whenever the measurement script is blocked, which is an
   * ordinary thing for a browser to do and not something to show anybody an
   * error about. The panel thanks them either way: they answered, and whether
   * the answer arrived is not their problem.
   */
  function send(verdict, reason) {
    if (typeof window.gtag !== 'function') return;
    try {
      window.gtag('event', 'tool_feedback', {
        tool_slug: slug,
        verdict: verdict,
        reason: reason,
      });
    } catch (err) { /* as above */ }
  }

  function flush() {
    if (pending === null) return;
    send('down', pending);
    pending = null;
  }

  /* ------------------------------------------------------------------ panel */

  function show(after) {
    // Under the step the download was in, rather than wherever the frame left
    // it: the panel belongs where the eye already is. A trigger outside a
    // section - none today, but this file cannot require it - leaves the panel
    // where it was rendered, which is directly under the tool.
    var host = after && after.closest ? after.closest('section') : null;
    if (host && host.parentNode && !host.contains(panel)) {
      host.insertAdjacentElement('afterend', panel);
    }
    panel.hidden = false;
  }

  function settle(state) {
    remember(state);
    ask.hidden = true;
    why.hidden = true;
    if (note) note.hidden = true;
    thanks.hidden = false;
    window.setTimeout(function () { panel.hidden = true; }, THANKS);
  }

  panel.addEventListener('click', function (event) {
    var target = event.target;
    if (!target || !target.closest) return;

    var vote = target.closest('[data-verdict]');
    if (vote) {
      if (vote.getAttribute('data-verdict') === 'up') {
        send('up', 'none');
        settle('a');
      } else {
        // Not sent yet - see `pending`. The answer is committed either way: the
        // chips are an invitation, and closing on them is still a no.
        pending = 'none';
        ask.hidden = true;
        why.hidden = false;
      }
      return;
    }

    var chip = target.closest('[data-reason]');
    if (chip) {
      pending = chip.getAttribute('data-reason');
      flush();
      settle('a');
      return;
    }

    if (target.closest('.feedback-close')) {
      // Closing after choosing "no" is still a "no", and counts as an answer.
      // Only somebody who closed without pressing either button has said
      // nothing, and for them `pending` is null and this sends nothing.
      var answered = pending !== null;
      flush();
      settle(answered ? 'a' : refusal());
    }
  });

  // The tab going away with a "no" chosen and no reason picked. pagehide rather
  // than unload: it is the one that fires on a phone, where a tab is more often
  // backgrounded than closed.
  window.addEventListener('pagehide', flush);

  /* --------------------------------------------------------------- the ask */

  if (silent()) return;

  document.addEventListener('click', function (event) {
    if (asked) return;
    var target = event.target;
    if (!target || !target.closest) return;

    var trigger = target.closest(
      'a[download][href], button[id^="download"], [data-download]');
    if (!trigger || trigger.disabled) return;

    asked = true;
    window.setTimeout(function () { show(trigger); }, DELAY);
  }, true);
}());
