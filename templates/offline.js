/**
 * Registers the front page's service worker. GENERATED FILE - do not edit; see
 * templates/offline.js.
 *
 * A tool page does this from its own main.js, where there is a live indicator
 * waiting to be told whether it worked. This page has neither a main.js nor an
 * indicator, and needed one file rather than a script tag the
 * Content-Security-Policy would refuse: script-src here is 'self' with no
 * 'unsafe-inline', which is the point of it.
 *
 * 'sw.js' resolves against this page, so the copy of this file at /de/ registers
 * /de/sw.js over /de/ and the one at the root registers / over everything. No
 * language has to know which one it is.
 *
 * Failing is not worth reporting. Nothing on this page needs the cache, and
 * nothing it claims depends on one - unlike a tool page, which says out loud
 * that it works with the network unplugged and so says out loud when it cannot.
 */

if ('serviceWorker' in navigator && window.isSecureContext) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
