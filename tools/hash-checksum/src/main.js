/** UI wiring and application state. */

import { phrase } from './shared/phrases.js';
import { wireFilePicker, readingLabel } from './shared/file-picker.js';
import { ALGORITHMS, ORDER, Stopped, Unreadable, hashFile } from './hash.js';
import { algorithmsIn, readExpected, verdict } from './expected.js';
import { exact, fileSize, percent, rate, remaining, smooth } from './format.js';

const $ = (id) => document.getElementById(id);

const el = {
  dropzone: $('dropzone'),
  fileInput: $('file-input'),
  loadError: $('load-error'),

  runCard: $('run-card'),
  progress: $('progress'),
  progressTrack: $('progress-track'),
  progressBar: $('progress-bar'),
  progressText: $('progress-text'),
  stop: $('stop'),

  stopped: $('stopped'),
  restart: $('restart'),
  results: $('results'),
  fileName: $('file-name'),
  fileFacts: $('file-facts'),
  digests: $('digests'),
  copyAll: $('copy-all'),
  downloadChecksums: $('download-checksums'),
  copyStatus: $('copy-status'),

  expected: $('expected'),
  expectedRead: $('expected-read'),
  verdict: $('verdict'),

  privacyToggle: $('privacy-toggle'),
  privacyPanel: $('privacy-panel'),
  networkCount: $('network-count'),
  networkDot: $('network-dot'),
  offlineStatus: $('offline-status'),
  offlineDot: $('offline-dot'),
};

/** The five checkboxes, by the algorithm they turn on. */
const boxes = new Map(
  [...document.querySelectorAll('[data-algorithm]')]
    .filter((node) => node.tagName === 'INPUT')
    .map((node) => [node.dataset.algorithm, node]),
);

/** The five result rows, by the same key. */
const rows = new Map(
  [...el.digests.querySelectorAll('.digest')].map((node) => [node.dataset.algorithm, node]),
);

/** @type {File|null} */
let chosen = null;

/**
 * Digests worked out for the file that is currently chosen, by algorithm.
 *
 * Kept when a checkbox is unticked rather than thrown away, so that unticking
 * something and changing your mind costs nothing. Emptied when the file
 * changes, which is the only event that can make one of them wrong.
 */
let digests = {};

/** What the paste box currently says, as readExpected read it. */
let expected = { entries: [], strays: [], wrapped: false };

/** @type {AbortController|null} */
let running = null;

/* --------------------------------------------------------------- the file */

const picker = wireFilePicker({
  input: el.fileInput,
  dropzone: el.dropzone,
  onFiles(files) { openFile(files[0]); },
});

function openFile(file) {
  hideError();
  chosen = file;
  digests = {};

  el.fileName.textContent = file.name;
  el.fileFacts.textContent = `${fileSize(file.size)} - ${exact(file.size)}`;
  render();

  start(ticked());
}

/** The algorithms whose boxes are ticked, in the page order. */
function ticked() {
  return ORDER.filter((id) => boxes.get(id)?.checked);
}

/** The ticked ones that have not been worked out for this file yet. */
function outstanding() {
  return ticked().filter((id) => !(id in digests));
}

/**
 * Read the file and work out the digests asked for.
 *
 * Anything already running is stopped first. There is never a reason to have
 * two passes over the same file at once, and the second one would fight the
 * first for the progress bar.
 */
async function start(ids) {
  if (!chosen || !ids.length) return;

  running?.abort();
  const controller = new AbortController();
  running = controller;

  el.stopped.hidden = true;
  picker.busy(readingLabel(1));
  el.progress.hidden = false;
  showProgress(0, chosen.size, null);

  const began = performance.now();
  let last = { at: 0, when: began };
  let speed = null;

  try {
    const found = await hashFile(chosen, ids, {
      signal: controller.signal,
      onProgress(done, total) {
        const now = performance.now();
        if (done > last.at && now > last.when) {
          speed = smooth(speed, rate(done - last.at, (now - last.when) / 1000));
          last = { at: done, when: now };
        }
        showProgress(done, total, speed);
      },
    });
    Object.assign(digests, found);
  } catch (error) {
    if (error instanceof Stopped) {
      // Not a failure. Whatever was already worked out for this file stays on
      // the page, because it is still true of it - and if that is nothing, the
      // note below is the way back, because a Stop button with no way to start
      // again leaves the visitor holding a file and no button.
      //
      // Only when this is still the current run, though. A pass that was
      // superseded by a newer one was not stopped by anybody, and the note
      // would be about something the visitor never asked to end.
      if (running === controller) el.stopped.hidden = ORDER.some((id) => id in digests);
      return;
    }
    if (error instanceof Unreadable) {
      showError(`${chosen.name} could not be read to the end: ${error.message}. `
        + 'A file that changed on disk while it was being read is the usual reason. '
        + 'Nothing partial is shown, because half a file has the wrong checksum '
        + 'rather than a partial one.');
      return;
    }
    throw error;
  } finally {
    if (running === controller) {
      running = null;
      el.progress.hidden = true;
      picker.done();
    }
  }

  render();
}

el.stop.addEventListener('click', () => {
  running?.abort();
});

el.restart.addEventListener('click', () => start(outstanding()));

function showProgress(done, total, speed) {
  const fraction = total ? done / total : 1;
  el.progressBar.style.width = `${Math.min(100, fraction * 100)}%`;
  el.progressTrack.setAttribute('aria-valuenow', String(Math.round(fraction * 100)));

  const parts = [percent(fraction)];
  if (speed) {
    parts.push(`${speed.toFixed(0)} MB/s`);
    const left = remaining((total - done) / 1048576 / speed);
    if (left && done < total) parts.push(`${left} left`);
  }
  el.progressText.textContent = parts.join('  -  ');
}

/* ------------------------------------------------------- which algorithms */

for (const [id, box] of boxes) {
  box.addEventListener('change', () => {
    render();
    if (box.checked && chosen && !(id in digests)) start(outstanding());
  });
}

/* ------------------------------------------------ what it should have been */

let typing = null;

el.expected.addEventListener('input', () => {
  // A paste of a SHA256SUMS file is a few thousand characters and re-reading it
  // on every keystroke is wasted work; a quarter of a second after the typing
  // stops is soon enough to feel immediate and late enough to only happen once.
  clearTimeout(typing);
  typing = setTimeout(readPaste, 250);
});

function readPaste() {
  expected = readExpected(el.expected.value);

  // Ticking the algorithm the paste turned out to be is the whole reason this
  // box identifies one. Somebody who pastes an MD5 has said which checksum they
  // care about more clearly than a checkbox ever could.
  let asked = false;
  for (const id of algorithmsIn(expected.entries)) {
    const box = boxes.get(id);
    if (box && !box.checked) {
      box.checked = true;
      asked = true;
    }
  }

  render();
  if (asked || outstanding().length) start(outstanding());
}

/* ---------------------------------------------------------------- drawing */

function render() {
  const answer = verdict(expected.entries, digests, chosen?.name);

  // What the paste actually says, as opposed to what it is also allowed to
  // mean. A digest wrapped across lines keeps its line-by-line readings as
  // candidates for the comparison, and marking a row "differs" because of one
  // of those would be reporting a checksum nobody wrote.
  const declared = expected.wrapped ? expected.entries.slice(0, 1) : expected.entries;

  for (const id of ORDER) {
    const row = rows.get(id);
    const has = id in digests;
    row.hidden = !(boxes.get(id)?.checked && has);
    if (!has) continue;

    row.querySelector('[data-slot="value"]').textContent = digests[id];

    // A row is marked only when this paste actually says something about that
    // algorithm. A green tick beside SHA-256 because the MD5 matched would be
    // a claim nobody made.
    const said = declared.some((entry) => entry.algorithm === id);
    const matched = answer.state === 'match' && answer.entry.algorithm === id;
    row.querySelector('[data-slot="match"]').hidden = !matched;
    row.querySelector('[data-slot="differs"]').hidden = !(said && !matched);
    row.classList.toggle('is-match', matched);
    row.classList.toggle('is-differs', said && !matched);
  }

  el.results.hidden = !ORDER.some((id) => id in digests);

  renderRead();
  renderVerdict(answer);
}

/** The one line under the paste box saying what was recognised in it. */
function renderRead() {
  const { entries, strays, wrapped } = expected;
  // A wrapped digest is one checksum read two ways, not several: readExpected
  // keeps the line-by-line readings as candidates but the first entry is the
  // one it actually is, and that is what the visitor is told.
  const which = entries.length > 1 && !wrapped ? 'many'
    : entries.length >= 1 ? 'one'
      : strays.length ? 'stray'
        : el.expected.value.trim() ? 'nothing' : null;

  el.expectedRead.hidden = which === null;
  for (const line of el.expectedRead.querySelectorAll('[data-read]')) {
    line.hidden = line.dataset.read !== which;
  }
  if (which === 'one') fill(el.expectedRead, 'algorithm', label(entries[0].algorithm));
  if (which === 'many') fill(el.expectedRead, 'count', String(entries.length));
  if (which === 'stray') fill(el.expectedRead, 'length', String(strays[0].hex.length));
}

/** The verdict block, which is the answer the visitor actually came for. */
function renderVerdict(answer) {
  const which = answer.state === 'none' ? null
    : !chosen ? 'nofile'
      : answer.state === 'match' ? (answer.renamed ? 'renamed' : 'match')
        : answer.state;

  el.verdict.hidden = which === null;
  for (const line of el.verdict.querySelectorAll('[data-outcome]')) {
    line.hidden = line.dataset.outcome !== which;
  }
  if (which === 'match' || which === 'renamed') {
    fill(el.verdict, 'algorithm', label(answer.entry.algorithm));
    fill(el.verdict, 'name', answer.entry.name ?? '');
  }
  if (which === 'mismatch') fill(el.verdict, 'algorithm', label(answer.entry.algorithm));
  if (which === 'waiting') fill(el.verdict, 'algorithm', label(answer.missing[0]));
}

function fill(root, slot, text) {
  for (const node of root.querySelectorAll(`[data-slot="${slot}"]`)) node.textContent = text;
}

/**
 * The visible name of an algorithm, read off the markup rather than written
 * here, so that a translation of body.html reaches it like everything else.
 */
function label(id) {
  return rows.get(id)?.querySelector('.digest-name')?.textContent ?? id;
}

/* ------------------------------------------------------------ taking them */

/**
 * The digests as text, in the tagged form `shasum --tag` and the BSD tools
 * write.
 *
 * That form rather than the bare GNU one because it names the algorithm. A file
 * holding five untagged lines of hex is a file whose reader has to count
 * characters to know what any of them is, and this page has just spent three
 * paragraphs arguing that nobody should have to.
 */
function asText() {
  const name = chosen ? chosen.name : '';
  return ticked()
    .filter((id) => id in digests)
    .map((id) => `${ALGORITHMS[id].tag} (${name}) = ${digests[id]}`)
    .join('\n');
}

for (const [id, row] of rows) {
  row.querySelector('[data-slot="copy"]').addEventListener('click', async (event) => {
    event.preventDefault();
    await copy(digests[id], 'One checksum, on your clipboard and nowhere else.');
  });
}

el.copyAll.addEventListener('click', () => copy(asText(),
  'Copied. It is plain text, and it went to your clipboard only.'));

async function copy(text, said) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    el.copyStatus.textContent = said;
  } catch {
    el.copyStatus.textContent = 'This browser would not let the page write to the clipboard. '
      + 'Select the text and copy it, or use "Save them as a file".';
  }
}

el.downloadChecksums.addEventListener('click', () => {
  const text = asText();
  if (!text) return;
  const blob = new Blob([`${text}\n`], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${chosen.name}.checksums.txt`;
  link.click();
  // Long enough for the download to have started, and revoked either way so a
  // page left open all afternoon does not accumulate them.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
});

/* ------------------------------------------------------------- the frame */

function showError(message) {
  el.loadError.textContent = message;
  el.loadError.hidden = false;
}

function hideError() {
  el.loadError.hidden = true;
  el.copyStatus.textContent = '';
}

el.privacyToggle?.addEventListener('click', () => {
  const open = el.privacyPanel.hidden;
  el.privacyPanel.hidden = !open;
  el.privacyToggle.setAttribute('aria-expanded', String(open));
});

// Hosts belonging to the ad, measurement and donate-button scripts. This tool
// has no network feature of its own at all - there is nothing to fetch and
// nowhere to send anything - so any other host appearing here would be a
// genuine surprise, and the panel says so in those terms.
// google.com is written as a pattern because Google's measurement pixel uses
// the visitor's own country domain, and a list of literal hostnames would turn
// this panel red for a visitor in the wrong country - which is the worst
// possible failure for the one part of the page that exists to be checked.
// cloudflareinsights.com is here because the host injects its own beacon; the
// CSP blocks it from running, but a blocked script still leaves a timing entry.
const PLATFORM_HOSTS = /(^|\.)(googlesyndication\.com|doubleclick\.net|googleadservices\.com|googletagservices\.com|adtrafficquality\.google|googletagmanager\.com|google-analytics\.com|gstatic\.com|googleapis\.com|buymeacoffee\.com|cloudflareinsights\.com|google\.[a-z]{2,3}(\.[a-z]{2})?)$/;

/**
 * Report what this page has actually fetched.
 *
 * The claim on trial is not "this page is silent" - it is not, it carries ads -
 * but "nothing has carried your file away". That is the part that matters, and
 * the part a sceptical visitor can watch hold in real time.
 */
function monitorNetwork() {
  const platform = new Set();
  const external = new Set();

  const inspect = (entries) => {
    for (const entry of entries) {
      if (entry.name.startsWith('blob:') || entry.name.startsWith('data:')) continue;
      const url = new URL(entry.name, location.href);
      if (url.origin === location.origin) continue;
      if (PLATFORM_HOSTS.test(url.hostname)) platform.add(url.hostname);
      else external.add(url.hostname);
    }
    const total = performance.getEntriesByType('resource')
      .filter((entry) => !entry.name.startsWith('blob:') && !entry.name.startsWith('data:')).length;

    const clean = external.size === 0;
    // One phrase per number rather than a pluralising helper: a language
    // whose plural is not a suffix has to be able to translate the two
    // separately.
    const platformNote = platform.size
      ? phrase(platform.size === 1 ? 'net.platform.one' : 'net.platform.many',
               { hosts: platform.size })
      : '';

    el.networkCount.textContent = clean
      ? phrase('net.clean', { total, platform: platformNote })
      : phrase('net.dirty', { hosts: [...external].join(', '), platform: platformNote });

    el.networkCount.className = clean ? 'good' : 'warn';
    el.networkDot.className = `live-dot ${clean ? 'good' : 'warn'}`;
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
  // Keep the visible text short: this sits in the trust panel, and a raw
  // browser error dumped there reads worse than it is.
  const fail = (message, detail) => {
    el.offlineStatus.textContent = message;
    el.offlineDot.className = 'live-dot';
    if (detail) {
      el.offlineStatus.title = detail;
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
    el.offlineStatus.textContent = phrase('offline.ready');
    el.offlineStatus.className = 'good';
    el.offlineDot.className = 'live-dot good';
  } catch (error) {
    fail(phrase('offline.failed'), error.message);
  }
}

/* -------------------------------------------------------------------- boot */

window.addEventListener('error', (event) => {
  showError(phrase('error.broke', { detail: event.message }));
});
window.addEventListener('unhandledrejection', (event) => {
  showError(phrase('error.broke', { detail: event.reason?.message ?? event.reason }));
});

monitorNetwork();
registerServiceWorker();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
