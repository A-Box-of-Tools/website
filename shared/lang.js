/**
 * The language a visitor is served, and the way out of it.
 *
 * GENERATED FILE - do not edit; see shared/lang.js.
 *
 * WHAT THIS DOES, IN ONE SENTENCE
 *
 * On the English page - and only there - it looks at the languages the browser
 * says it reads, and if this page exists in one of them it goes there instead.
 *
 * WHY IT IS ALLOWED TO EXIST ON A SITE THAT SAYS IT DOES NOT DO THIS
 *
 * The switcher in the footer was built as plain links on purpose, and that has
 * not changed: it still works with this file blocked, and a crawler still walks
 * from one language to the next on foot. What is added here is the first
 * arrival. Somebody who types abox.tools and reads German has, until now, been
 * shown English and left to find the word "Deutsch" at the bottom of it, which
 * is a translation nobody sees.
 *
 * Three rules keep that from becoming the usual mess:
 *
 *   1. IT ONLY EVER LEAVES THE x-default PAGE. If you are reading /de/ you are
 *      there because you asked to be - you followed a link, or somebody sent
 *      you one - and being bounced out of it because your browser is set to
 *      English would be the site overruling a decision you already made. It is
 *      also what keeps Googlebot, which crawls as en-US, from being redirected
 *      out of every translated page it is asked to index.
 *   2. NOTHING IS STORED UNLESS YOU CHOOSE. A detected language is used and
 *      forgotten. Only a click on the switcher writes anything down, because
 *      only a click says something the browser's own settings did not.
 *   3. THERE IS ALWAYS A WAY BACK, said in the language you came from. A
 *      redirect you cannot see and cannot undo is the reason this pattern has
 *      the reputation it has.
 *
 * WHERE THE FACTS COME FROM
 *
 * Nothing is compiled into this file. The set of languages a page is published
 * in is already in its <head>, as the rel="alternate" hreflang links the build
 * writes from buildlib/i18n.py, and that set is the authoritative one - it is
 * the same list the sitemap and the switcher are built from. So this file reads
 * the page rather than being told about it, and a language that finishes its
 * translation is offered here the day it is published, with no second list to
 * keep in step.
 */
(function () {
  'use strict';

  // The language the visitor picked, if they ever picked one. localStorage
  // rather than a cookie: a cookie would be sent to the server on every
  // request, and this is nobody's business but the browser's.
  var CHOICE = 'abox-lang';

  // "You did not arrive here, you were sent." Set immediately before the
  // redirect and read once on the other side, which is the only way the page
  // being landed on can know to offer the way back. Per tab and per session,
  // because it describes one navigation and nothing longer.
  var MOVED = 'abox-lang-from';

  // A language tag and nothing else. Both values below are written by this
  // file, but they are read out of storage a user can edit, and they end up in
  // an attribute selector - so they are checked on the way in rather than
  // trusted because of where they came from.
  var TAG = /^[a-z]{2,3}(-[a-z0-9]{2,8})*$/i;

  function read(store, key) {
    try {
      var value = window[store].getItem(key);
      return value && TAG.test(value) ? value : null;
    } catch (err) {
      // Storage disabled, or a browser in a mode that throws rather than
      // returning null. Not knowing is a perfectly good state to be in here.
      return null;
    }
  }

  function forget(store, key) {
    try {
      window[store].removeItem(key);
    } catch (err) { /* see read() */ }
  }

  function remember(store, key, value) {
    try {
      window[store].setItem(key, value);
    } catch (err) { /* see read() */ }
  }

  /**
   * Every language this page is published in, as {tag, path}.
   *
   * Paths, not URLs: the href in an hreflang link is absolute and carries the
   * production domain, and comparing that to where we actually are would mean
   * this never fires on localhost or on a preview deploy - which is to say it
   * would only ever be tested in production.
   */
  function offered() {
    var links = document.querySelectorAll('link[rel="alternate"][hreflang]');
    var out = [];
    for (var i = 0; i < links.length; i += 1) {
      out.push({
        tag: links[i].getAttribute('hreflang'),
        path: new URL(links[i].getAttribute('href'), location.href).pathname,
      });
    }
    return out;
  }

  /**
   * The first language the browser asks for that this page is published in.
   *
   * Two passes per entry, in the order the browser gave them, because
   * navigator.languages is a preference list and the whole point is to honour
   * its order. An exact match first - a reader who asks for pt-BR and is
   * offered both pt-BR and pt should get pt-BR - then the primary subtag, which
   * is what makes de-AT find German and a plain pt find pt-BR.
   */
  function preferred(wanted, available) {
    for (var i = 0; i < wanted.length; i += 1) {
      var want = String(wanted[i]).toLowerCase();
      var root = want.split('-')[0];
      for (var j = 0; j < available.length; j += 1) {
        if (available[j].tag.toLowerCase() === want) return available[j];
      }
      for (var k = 0; k < available.length; k += 1) {
        if (available[k].tag.toLowerCase().split('-')[0] === root) return available[k];
      }
    }
    return null;
  }

  function named(available, tag) {
    for (var i = 0; i < available.length; i += 1) {
      if (available[i].tag.toLowerCase() === String(tag).toLowerCase()) return available[i];
    }
    return null;
  }

  // -------------------------------------------------------------- the switch

  var all = offered();
  var here = document.documentElement.getAttribute('lang') || '';
  var languages = [];
  var base = null;
  for (var i = 0; i < all.length; i += 1) {
    if (all[i].tag === 'x-default') base = all[i];
    else languages.push(all[i]);
  }

  // Whether this document is on its way out. location.replace() asks for a
  // navigation; it does not stop the page it was called from. This one carries
  // on parsing, fires its own DOMContentLoaded, and would run the notice
  // handler at the bottom of this file - which reads the "you were sent"
  // sessionStorage flag and clears it. That is the flag it had just written for
  // the page it is being replaced by, so the notice never appeared and the
  // redirect happened silently. Found in a browser rather than in a test,
  // because both halves are correct on their own.
  var leaving = false;

  // A page with no alternates has nothing to switch to and this file has
  // nothing to do - which is every page until a second language finishes it.
  if (base && languages.length > 1 && base.path === location.pathname) {
    var choice = read('localStorage', CHOICE);
    var want = (choice && named(languages, choice))
      || (choice ? null : preferred(navigator.languages || [navigator.language], languages));

    if (want && want.path !== location.pathname) {
      remember('sessionStorage', MOVED, here);
      leaving = true;
      // replace, not assign: the page being left is not somewhere the visitor
      // ever chose to be, and leaving it in the history turns the back button
      // into a loop back through this same redirect.
      location.replace(want.path + location.search + location.hash);
    }
  }

  // ------------------------------------------------- a choice is a statement

  // Delegated, and registered now rather than on DOMContentLoaded, so that a
  // click on a switcher link is recorded even if it happens while the rest of
  // the page is still arriving. Anything inside a switcher counts, including
  // the way-back link in the notice below: choosing English is as much a choice
  // as choosing German, and is the one that has to stick.
  document.addEventListener('click', function (event) {
    var target = event.target;
    if (!target || !target.closest) return;
    // Either attribute. A switcher entry for a language this page has not been
    // translated into carries data-lang and no hreflang, because there is no
    // translation of this page for an hreflang to point at - but choosing it is
    // every bit as much a choice, and has to stick the same way.
    var link = target.closest('a[hreflang], a[data-lang]');
    if (!link || !link.closest('.lang-switch, .lang-pick, .lang-auto')) return;
    var tag = link.getAttribute('hreflang') || link.getAttribute('data-lang');
    if (tag && TAG.test(tag)) remember('localStorage', CHOICE, tag);
  });

  // ------------------------------------------------------------- the way out

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  // Not on a page that is leaving: see `leaving` above.
  if (!leaving) {
    ready(function () {
      var from = read('sessionStorage', MOVED);
      // Read once. It describes the navigation that just happened, and leaving
      // it set would put the notice on the next page as well.
      forget('sessionStorage', MOVED);
      if (!from || from === here) return;

      var notice = document.getElementById('lang-auto');
      // The switcher already has this language's name, written in that
      // language, and its address on this page. Both are taken from it rather
      // than built here, so the notice cannot offer a link the switcher would
      // not.
      // Written out rather than folded into :is(). This file runs blocking, on
      // the first paint, in whatever browser turned up.
      var link = document.querySelector(
        '.lang-switch a[hreflang="' + from + '"], .lang-switch a[data-lang="' + from + '"], ' +
        '.lang-pick a[hreflang="' + from + '"], .lang-pick a[data-lang="' + from + '"]');
      if (!notice || !link) return;

      var back = notice.querySelector('.lang-auto-back');
      if (!back) return;
      back.setAttribute('href', link.getAttribute('href'));
      back.setAttribute('hreflang', from);
      back.setAttribute('lang', from);
      back.textContent = link.textContent.trim();
      notice.hidden = false;
    });
  }
}());
