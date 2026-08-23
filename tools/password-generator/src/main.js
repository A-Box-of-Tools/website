/** UI wiring and application state. */

import { classSizes, generate, phraseChoices, SYMBOL_SETS } from './generate.js';
import {
  bits, crackTime, passphraseSpace, passwordSpace, rating, scientific,
} from './strength.js';
import { wordlist } from './wordlist.js';

const $ = (id) => document.getElementById(id);

const el = {
  tabs: Array.from(document.querySelectorAll('.tab')),
  panels: {
    password: $('options-password'),
    passphrase: $('options-passphrase'),
  },

  length: $('length'),
  lengthOut: $('length-out'),
  useLower: $('use-lower'),
  useUpper: $('use-upper'),
  useDigits: $('use-digits'),
  useSymbols: $('use-symbols'),
  symbolSet: $('symbol-set'),
  symbolChars: $('symbol-chars'),
  requireEach: $('require-each'),
  avoidLookalikes: $('avoid-lookalikes'),

  words: $('words'),
  wordsOut: $('words-out'),
  list: $('list'),
  separator: $('separator'),
  capitals: $('capitals'),
  addDigit: $('add-digit'),
  addSymbol: $('add-symbol'),

  noClasses: $('no-classes'),
  error: $('error'),
  result: $('result'),
  secret: $('secret'),
  regenerate: $('regenerate'),
  copy: $('copy'),
  copyNote: $('copy-note'),

  strength: $('strength'),
  bits: $('bits'),
  verdict: $('verdict'),
  fill: $('strength-fill'),
  crack: $('crack'),
  space: $('space'),

  count: $('count'),
  countOut: $('count-out'),
  batch: $('batch'),
  copyAll: $('copy-all'),
  download: $('download-txt'),

  privacyToggle: $('privacy-toggle'),
  privacyPanel: $('privacy-panel'),
  networkCount: $('network-count'),
  networkDot: $('network-dot'),
  offlineStatus: $('offline-status'),
  offlineDot: $('offline-dot'),
};

/**
 * Every word this file can put on screen is read out of body.html, which is
 * the file that gets translated. `data-very-weak` becomes `dataset.veryWeak`,
 * and the two tables below are that mapping written down rather than computed,
 * so a missing attribute is visible here instead of silently rendering
 * `undefined` in somebody's language.
 */
const RATING_WORD = {
  'very-weak': 'veryWeak',
  weak: 'weak',
  fair: 'fair',
  strong: 'strong',
  'very-strong': 'veryStrong',
};

const CRACK_WORD = {
  instant: 'instant',
  minutes: 'minutes',
  hours: 'hours',
  days: 'days',
  months: 'months',
  years: 'years',
  centuries: 'centuries',
  ages: 'ages',
};

/**
 * The passwords currently on screen, and the only place they exist in this
 * page. Nothing writes them to localStorage, to sessionStorage, to a cookie or
 * to the history, and reloading the page drops this array along with the rest
 * of the document.
 */
let shown = [];

let mode = 'password';

/* ---------------------------------------------------------------- the tabs */

function setMode(next) {
  mode = next;
  for (const tab of el.tabs) {
    const on = tab.dataset.mode === next;
    tab.setAttribute('aria-selected', String(on));
    tab.tabIndex = on ? 0 : -1;
  }
  for (const [name, panel] of Object.entries(el.panels)) panel.hidden = name !== next;
  make();
}

for (const tab of el.tabs) {
  tab.addEventListener('click', () => setMode(tab.dataset.mode));
  // The arrow keys move between tabs, which is what a tab strip is expected to
  // do and what a row of buttons does not do on its own.
  tab.addEventListener('keydown', (event) => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const index = el.tabs.indexOf(tab);
    const next = el.tabs[(index + step + el.tabs.length) % el.tabs.length];
    next.focus();
    setMode(next.dataset.mode);
  });
}

/* ------------------------------------------------------------- the settings */

function options() {
  return {
    mode,
    length: Number(el.length.value),
    lower: el.useLower.checked,
    upper: el.useUpper.checked,
    digits: el.useDigits.checked,
    symbols: el.useSymbols.checked,
    symbolSet: el.symbolSet.value,
    requireEach: el.requireEach.checked,
    avoidLookalikes: el.avoidLookalikes.checked,

    words: Number(el.words.value),
    list: el.list.value,
    separator: el.separator.value,
    capitals: el.capitals.value,
    addDigit: el.addDigit.checked,
    addSymbol: el.addSymbol.checked,
  };
}

/** How many results the settings could have produced, exactly. */
function space(chosen) {
  if (chosen.mode === 'passphrase') {
    return passphraseSpace(
      wordlist(chosen.list).length, chosen.words, phraseChoices(chosen),
    );
  }
  return passwordSpace(classSizes(chosen), chosen.length, chosen.requireEach);
}

/* -------------------------------------------------------------- the reading */

function showStrength(chosen) {
  const total = space(chosen);
  const value = bits(total);

  // Rounded down, not to the nearest. Every other rounding decision on this
  // page goes the same way: when the choice is between claiming a bit the
  // password does not have and disclaiming one it does, disclaim it.
  el.bits.textContent = String(Math.floor(value));

  const grade = rating(value);
  el.strength.dataset.rating = grade;
  el.verdict.textContent = el.strength.dataset[RATING_WORD[grade]];
  el.crack.textContent = el.strength.dataset[CRACK_WORD[crackTime(value)]];

  // 128 bits is the top of the bar rather than of the scale: past it the
  // difference stops meaning anything a person can act on.
  el.fill.style.width = `${Math.min(100, (value / 128) * 100)}%`;

  const { mantissa, exponent } = scientific(value);
  if (exponent < 6) {
    el.space.textContent = total.toLocaleString();
  } else {
    el.space.replaceChildren(
      document.createTextNode(`${mantissa} \u00d7 10`),
      Object.assign(document.createElement('sup'), { textContent: String(exponent) }),
    );
  }
}

/* ------------------------------------------------------------ making them */

function make() {
  const chosen = options();
  const empty = chosen.mode === 'password' && classSizes(chosen).length === 0;

  el.noClasses.hidden = !empty;
  el.result.hidden = empty;
  el.strength.hidden = empty;
  if (empty) {
    shown = [];
    el.batch.hidden = true;
    el.copyAll.hidden = true;
    el.download.hidden = true;
    return;
  }

  const wanted = Number(el.count.value);
  shown = Array.from({ length: wanted }, () => generate(chosen));

  el.secret.textContent = shown[0];
  el.batch.replaceChildren(...shown.slice(1).map((secret) => {
    const item = document.createElement('li');
    item.textContent = secret;
    return item;
  }));
  el.batch.hidden = wanted < 2;
  el.copyAll.hidden = wanted < 2;
  el.download.hidden = wanted < 2;

  showStrength(chosen);
  el.copyNote.textContent = '';
}

/* ---------------------------------------------------------- taking them away */

async function toClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    el.copyNote.textContent = el.result.dataset.copied;
    el.copyNote.className = 'copy-note good';
  } catch {
    el.copyNote.textContent = el.result.dataset.copyFailed;
    el.copyNote.className = 'copy-note warn';
  }
}

/**
 * The list as a text file.
 *
 * A blob and an object URL, both made here and revoked immediately: the file
 * is assembled out of the strings already on screen and handed to the
 * browser's own download machinery, which writes it to the disk this page is
 * running on. There is no upload step to leave out.
 */
function downloadList() {
  const blob = new Blob([`${shown.join('\n')}\n`], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = mode === 'passphrase' ? 'passphrases.txt' : 'passwords.txt';
  link.click();
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ wiring */

el.regenerate.addEventListener('click', make);
el.copy.addEventListener('click', () => toClipboard(shown[0] ?? ''));
el.copyAll.addEventListener('click', () => toClipboard(shown.join('\n')));
el.download.addEventListener('click', downloadList);

el.length.addEventListener('input', () => {
  el.lengthOut.textContent = el.length.value;
  make();
});
el.words.addEventListener('input', () => {
  el.wordsOut.textContent = el.words.value;
  make();
});
el.count.addEventListener('input', () => {
  el.countOut.textContent = el.count.value;
  make();
});

for (const control of [
  el.useLower, el.useUpper, el.useDigits, el.useSymbols, el.symbolSet,
  el.requireEach, el.avoidLookalikes, el.list, el.separator, el.capitals,
  el.addDigit, el.addSymbol,
]) {
  control.addEventListener('change', () => {
    if (control === el.symbolSet) showSymbols();
    make();
  });
}

function showSymbols() {
  el.symbolChars.textContent = SYMBOL_SETS[el.symbolSet.value];
}

el.privacyToggle.addEventListener('click', () => {
  const open = el.privacyPanel.hidden;
  el.privacyPanel.hidden = !open;
  el.privacyToggle.setAttribute('aria-expanded', String(open));
});

/* ------------------------------------------------ the live network check */

const PLATFORM_HOSTS = /(^|\.)(googlesyndication\.com|doubleclick\.net|googleadservices\.com|googletagservices\.com|adtrafficquality\.google|googletagmanager\.com|google-analytics\.com|gstatic\.com|googleapis\.com|buymeacoffee\.com|cloudflareinsights\.com|google\.[a-z]{2,3}(\.[a-z]{2})?)$/;

/**
 * Report what this page has actually fetched.
 *
 * The claim on trial is not "this page is silent" - it is not, it carries ads -
 * but "nothing has carried away what it made". On this tool that is the whole
 * product: a generator that sent its output anywhere would not be a weak
 * password tool, it would be a password collection.
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
    const platformNote = platform.size === 0
      ? ''
      : ` The page's own ad, measurement and donate-button scripts loaded from ${platform.size} `
        + `host${platform.size === 1 ? '' : 's'}; not one of them was given a character of it.`;

    el.networkCount.textContent = clean
      ? `what this page made has gone nowhere. ${total} files loaded.${platformNote}`
      : `something contacted ${[...external].join(', ')}, which this tool never does.${platformNote}`;

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
    fail('not available in this browser (everything else still works).');
    return;
  }
  if (!window.isSecureContext) {
    fail('needs https:// or localhost to cache for offline use.');
    return;
  }

  try {
    await navigator.serviceWorker.register('sw.js');
    await navigator.serviceWorker.ready;
    el.offlineStatus.textContent = 'ready - disconnect from the internet and this still works.';
    el.offlineStatus.className = 'good';
    el.offlineDot.className = 'live-dot good';
  } catch (error) {
    fail('caching unavailable here, but nothing is uploaded either way.', error.message);
  }
}

/* -------------------------------------------------------------------- boot */

// An error thrown after boot would otherwise only reach the console, leaving
// the page looking functional but doing nothing.
window.addEventListener('error', (event) => {
  el.error.hidden = false;
  el.error.textContent = `Something broke: ${event.message}. Reload the page to start over.`;
});
window.addEventListener('unhandledrejection', (event) => {
  el.error.hidden = false;
  el.error.textContent = `Something broke: ${event.reason?.message ?? event.reason}. `
    + 'Reload the page to start over.';
});

showSymbols();
make();
monitorNetwork();
registerServiceWorker();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
