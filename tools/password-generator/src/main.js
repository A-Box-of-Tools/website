/** UI wiring and application state. */

import { phrase } from './shared/phrases.js';
import { classSizes, generate, phraseChoices, SYMBOL_SETS } from './generate.js';
import {
  bits, crackTime, passphraseSpace, passwordSpace, rating, scientific,
} from './strength.js';
import { wordlist } from './wordlist.js';

const $ = (id) => document.getElementById(id);

const el = {
  modes: Array.from(document.querySelectorAll('input[name="mode"]')),
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
  copyFallback: $('copy-fallback'),

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
};

const numericPairs = [[el.length, el.lengthOut], [el.words, el.wordsOut], [el.count, el.countOut]]
  .map(([range, number]) => ({ range, number, error: $(`${range.id}-error`) }));

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
  for (const radio of el.modes) radio.checked = radio.value === next;
  for (const [name, panel] of Object.entries(el.panels)) panel.hidden = name !== next;
  make();
}

// Radios rather than a tab strip. The choice is between two kinds of secret,
// not between two views of one thing, and a radio group says that: the arrow
// keys move within it and the roving tabindex a tablist needs is the browser's
// job rather than ours. It also means the two words are labels, which is what
// they always were.
for (const radio of el.modes) {
  radio.addEventListener('change', () => {
    if (radio.checked) setMode(radio.value);
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

let generation = 0;
let copyRequest = 0;

function make() {
  generation += 1;
  el.copyNote.textContent = '';
  el.copyFallback.hidden = true;
  el.copyFallback.textContent = '';
  const chosen = options();
  const activeRange = mode === 'passphrase' ? el.words : el.length;
  let invalid = false;
  for (const { range, number, error } of numericPairs) {
    const active = range === activeRange || range === el.count;
    const refused = !number.validity.valid;
    number.setAttribute('aria-invalid', String(refused));
    error.hidden = !active || !refused;
    invalid ||= active && refused;
  }
  const empty = chosen.mode === 'password' && classSizes(chosen).length === 0;

  el.noClasses.hidden = invalid || !empty;
  el.result.hidden = invalid || empty;
  el.strength.hidden = invalid || empty;
  if (invalid || empty) {
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
  const copiedGeneration = generation;
  const request = ++copyRequest;
  const current = () => generation === copiedGeneration && copyRequest === request;
  el.copyFallback.hidden = true;
  el.copyFallback.textContent = '';
  try {
    await navigator.clipboard.writeText(text);
    if (!current()) return;
    el.copyNote.textContent = el.result.dataset.copied;
    el.copyNote.className = 'copy-note good';
  } catch {
    if (!current()) return;
    // A selected, focusable output also works when clipboard permission is
    // refused. The batch gets one contiguous block containing every secret.
    const target = text === shown[0] ? el.secret : el.copyFallback;
    if (target === el.copyFallback) {
      target.textContent = text;
      target.hidden = false;
    }
    target.focus();
    selectSecret(target);
    el.copyNote.textContent = el.result.dataset.copyFailed;
    el.copyNote.className = 'copy-note warn';
  }
}

function selectSecret(node) {
  const range = document.createRange();
  range.selectNodeContents(node);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

for (const output of [el.secret, el.copyFallback]) {
  output.addEventListener('focus', () => selectSecret(output));
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

// Invalid drafts remain editable, but cannot describe an old secret as a new
// setting. The slider remains the last valid value until numeric entry agrees.
for (const { range, number } of numericPairs) {
  range.addEventListener('input', () => {
    number.value = range.value;
    make();
  });
  number.addEventListener('input', () => {
    if (number.validity.valid) range.value = number.value;
    make();
  });
  number.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.isComposing) {
      event.preventDefault();
      if (number.validity.valid) number.value = range.value;
    }
  });
}

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

/* -------------------------------------------------------------------- boot */

// An error thrown after boot would otherwise only reach the console, leaving
// the page looking functional but doing nothing.
window.addEventListener('error', (event) => {
  el.error.hidden = false;
  el.error.textContent = phrase('error.broke', { detail: event.message });
});
window.addEventListener('unhandledrejection', (event) => {
  el.error.hidden = false;
  el.error.textContent = phrase('error.broke', { detail: event.reason?.message ?? event.reason });
});

showSymbols();
make();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
