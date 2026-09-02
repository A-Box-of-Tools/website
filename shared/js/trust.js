/**
 * The trust panel: the live network check and the offline line.
 *
 * GENERATED INTO EACH TOOL. This file lives at shared/js/trust.js and the
 * build copies it to <tool>/src/shared/trust.js, where templates/tool.html
 * loads it as a module of its own beside src/main.js. Like phrases.js it is
 * not opt-in and is not listed in any tool.toml: every tool page wears the
 * panel, so every tool page needs the script that fills it in. See js_parts()
 * in buildlib/site.py.
 *
 * WHY IT IS THE FRAME'S AND NOT THE TOOL'S
 *
 * The two lines at the foot of the pledge - "Live check:" and "Offline:" - are
 * frame markup, filled in from frame phrases, and they say the same thing on
 * every page. For a long time the JavaScript that filled them in was pasted
 * into every tool's main.js all the same: forty copies, and by the time they
 * were counted, nine slightly different ones, because a sentence edited in
 * one tool was not edited in the other thirty-nine. Nothing here depends on
 * what the tool does, so nothing here belongs to the tool - and a tool whose
 * own script fails to boot still gets an honest panel.
 *
 * WHAT THE LIVE CHECK MEASURES
 *
 * Every resource the page has fetched, read from the browser's own
 * performance buffer and sorted three ways: this origin's own files; the
 * platform's - the ad, measurement and donate-button scripts the page loads
 * without the visitor asking, and which are handed nothing; and everything
 * else. Everything else is what turns the panel red, and it is the whole
 * point: a visitor who will not take the pledge's word for it can watch this
 * line and the browser's network tab agree.
 *
 * A tool that legitimately talks to a host of its own - share-text's
 * rendezvous - declares that host in its CSP, and the build writes it into
 * `data-expected` on the panel. Such a host is counted, not reported: the
 * page said it would open that connection, and says so at length.
 *
 * The words come from the page. `net.*` are looked up through phrases.js, so
 * a tool that wants to name its subject ("your video has gone nowhere")
 * defines them in its own #phrases block, and one that does not gets the
 * frame's from [ui.tool].
 */

import { phrase } from './phrases.js';

// google.com is written as a pattern because Google's measurement pixel uses
// the visitor's own country domain, and a list of literal hostnames would turn
// this panel red for a visitor in the wrong country - which is the worst
// possible failure for the one part of the page that exists to be checked.
// buymeacoffee.com and googleapis.com are here for the donate button in the
// header: its script comes from cdnjs.buymeacoffee.com and it pulls its
// lettering from fonts.googleapis.com and fonts.gstatic.com. Like the ad
// scripts, it is something the page loads without the visitor asking, and it
// is handed nothing - so it belongs in this bucket rather than being reported
// as an intruder. cloudflareinsights.com is here because the host injects its
// own beacon; the CSP blocks it from running, but a blocked script still
// leaves a timing entry.
export const PLATFORM_HOSTS = /(^|\.)(googlesyndication\.com|doubleclick\.net|googleadservices\.com|googletagservices\.com|adtrafficquality\.google|googletagmanager\.com|google-analytics\.com|gstatic\.com|googleapis\.com|buymeacoffee\.com|cloudflareinsights\.com|google\.[a-z]{2,3}(\.[a-z]{2})?)$/;

/**
 * Sort resource entries into the platform's hosts and everybody else's.
 *
 * `total` counts every real fetch, this origin's own included; blob: and
 * data: URLs are not fetches and are left out of everything. A host in
 * `expected` is counted and never reported.
 *
 * @param {{ name: string }[]} entries  performance entries of type 'resource'
 * @param {{ origin: string, expected?: string[] }} page
 * @returns {{ platform: Set<string>, external: Set<string>, total: number }}
 */
export function sortHosts(entries, { origin, expected = [] }) {
  const platform = new Set();
  const external = new Set();
  let total = 0;
  for (const entry of entries) {
    if (entry.name.startsWith('blob:') || entry.name.startsWith('data:')) continue;
    total += 1;
    const url = new URL(entry.name, origin);
    if (url.origin === origin) continue;
    if (expected.includes(url.hostname)) continue;
    if (PLATFORM_HOSTS.test(url.hostname)) platform.add(url.hostname);
    else external.add(url.hostname);
  }
  return { platform, external, total };
}

/**
 * The sentence the panel shows, and whether it is the good one.
 *
 * One phrase per number rather than a pluralising helper: a language whose
 * plural is not a suffix has to be able to translate the two separately.
 *
 * @param {{ platform: Set<string>, external: Set<string>, total: number }} sorted
 * @param {(key: string, values?: object) => string} [t]  phrase(), or a stand-in
 * @returns {{ clean: boolean, text: string }}
 */
export function describe({ platform, external, total }, t = phrase) {
  const note = platform.size
    ? t(platform.size === 1 ? 'net.platform.one' : 'net.platform.many', { hosts: platform.size })
    : '';
  const clean = external.size === 0;
  const text = clean
    ? t('net.clean', { total, platform: note })
    : t('net.dirty', { hosts: [...external].join(', '), platform: note });
  return { clean, text };
}

function monitorNetwork() {
  const count = document.getElementById('network-count');
  const dot = document.getElementById('network-dot');
  if (!count || !dot) return;
  const page = {
    origin: location.origin,
    expected: (count.dataset.expected ?? '').split(' ').filter(Boolean),
  };
  // The sets outlive the buffer: the browser keeps a bounded number of
  // resource entries, and a host seen once has been seen.
  const platform = new Set();
  const external = new Set();

  const inspect = (entries) => {
    const seen = sortHosts(entries, page);
    for (const host of seen.platform) platform.add(host);
    for (const host of seen.external) external.add(host);
    const { total } = sortHosts(performance.getEntriesByType('resource'), page);
    const { clean, text } = describe({ platform, external, total });
    count.textContent = text;
    count.className = clean ? 'good' : 'warn';
    dot.className = `live-dot ${clean ? 'good' : 'warn'}`;
  };

  inspect(performance.getEntriesByType('resource'));
  try {
    new PerformanceObserver((list) => inspect(list.getEntries()))
      .observe({ type: 'resource', buffered: true });
  } catch {
    // PerformanceObserver is unavailable; the one-time snapshot above still stands.
  }
}

async function registerServiceWorker() {
  const status = document.getElementById('offline-status');
  const dot = document.getElementById('offline-dot');
  if (!status || !dot) return;

  // Keep the visible text short: this sits in the trust panel, and a raw
  // browser error dumped there reads worse than it is.
  const fail = (message, detail) => {
    status.textContent = message;
    dot.className = 'live-dot';
    if (detail) {
      status.title = detail;
      console.info('Offline caching unavailable:', detail);
    }
  };

  if (!('serviceWorker' in navigator)) {
    fail(phrase('offline.none'));
    return;
  }
  if (!window.isSecureContext) {
    fail(phrase('offline.insecure'));
    return;
  }

  try {
    await navigator.serviceWorker.register('sw.js');
    await navigator.serviceWorker.ready;
    status.textContent = phrase('offline.ready');
    status.className = 'good';
    dot.className = 'live-dot good';
  } catch (error) {
    fail(phrase('offline.failed'), error.message);
  }
}

// The page runs both on load. The tests import the two exported functions and
// never reach here, because there is no document for them to fill in.
if (typeof document !== 'undefined') {
  monitorNetwork();
  registerServiceWorker();
}
