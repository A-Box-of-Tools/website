/** UI wiring and application state. */

import { KINDS, compose, missing } from './payload.js';
import { makeQr } from './qr.js';
import { capacityFor } from './qr-encode.js';
import { SYMBOLOGIES, makeBarcode } from './barcode.js';
import {
  barcodeSvg, download, qrSvg, sizeOfSvg, svgToPng,
} from './render.js';

const $ = (id) => document.getElementById(id);

const el = {
  symbology: $('symbology'),
  symbologyNote: $('symbology-note'),
  formatRow: $('format-row'),
  format: $('format'),
  formatNote: $('format-note'),
  fields: $('fields'),
  inputError: $('input-error'),
  encodedPanel: $('encoded-panel'),
  encoded: $('encoded'),
  encodedNote: $('encoded-note'),
  qrOptions: $('qr-options'),
  barcodeOptions: $('barcode-options'),
  level: $('level'),
  quiet: $('quiet'),
  barWidth: $('bar-width'),
  barHeight: $('bar-height'),
  showText: $('show-text'),
  code39CheckRow: $('code39-check-row'),
  code39Check: $('code39-check'),
  foreground: $('foreground'),
  background: $('background'),
  transparent: $('transparent'),
  sizeRow: $('size-row'),
  size: $('size'),
  sizeNote: $('size-note'),
  preview: $('preview'),
  facts: $('facts'),
  downloadSvg: $('download-svg'),
  downloadPng: $('download-png'),
  copyPng: $('copy-png'),
  downloadNote: $('download-note'),
  privacyToggle: $('privacy-toggle'),
  privacyPanel: $('privacy-panel'),
  networkCount: $('network-count'),
  networkDot: $('network-dot'),
  offlineStatus: $('offline-status'),
  offlineDot: $('offline-dot'),
};

/** What a barcode's single box is called, and what to show in it. */
const BARCODE_FIELD = {
  code128: ['The text', 'ABOX-TOOLS-128'],
  ean13: ['The number', '590123412345'],
  upca: ['The number', '03600029145'],
  ean8: ['The number', '9638507'],
  itf14: ['The number', '1540014128876'],
  itf: ['The number', '1234567890'],
  code39: ['The text', 'ABOX TOOLS'],
};

/**
 * Everything typed so far, keyed by the format it belongs to, so that changing
 * the menu and changing it back does not lose what was in the boxes.
 */
const typed = new Map();

/** The SVG on screen, kept so the downloads are the picture that is shown. */
let current = null;

/* --------------------------------------------------------------- the form */

/** Which format the second step is asking about. */
function formatId() {
  return el.symbology.value === 'qr' ? el.format.value : `barcode:${el.symbology.value}`;
}

function fieldValue(id) {
  return typed.get(`${formatId()}:${id}`) ?? '';
}

function setFieldValue(id, value) {
  typed.set(`${formatId()}:${id}`, value);
}

/** The fields the current selection asks for. */
function fieldsFor() {
  if (el.symbology.value !== 'qr') {
    const [label, placeholder] = BARCODE_FIELD[el.symbology.value];
    return [{ id: 'text', label, type: 'text', placeholder }];
  }
  return KINDS.find((kind) => kind.id === el.format.value).fields;
}

/** Build the boxes for the current format, keeping whatever was typed in them. */
function buildFields() {
  el.fields.replaceChildren();

  for (const field of fieldsFor()) {
    const wrapper = document.createElement('div');
    wrapper.className = field.type === 'checkbox' ? 'field check-field' : 'field';

    const input = field.type === 'textarea'
      ? document.createElement('textarea')
      : field.type === 'select'
        ? document.createElement('select')
        : document.createElement('input');

    input.id = `field-${field.id}`;
    if (field.type === 'textarea') input.rows = 3;
    else if (field.type === 'select') {
      for (const [value, text] of field.options) {
        input.append(new Option(text, value));
      }
    } else {
      input.type = field.type;
    }
    if (field.placeholder) input.placeholder = field.placeholder;

    // A checkbox is optional by being a checkbox; saying so as well reads as
    // though there were a third state it could be left in.
    const label = document.createElement('label');
    label.htmlFor = input.id;
    label.textContent = field.label
      + (field.optional && field.type !== 'checkbox' ? ' (optional)' : '');

    if (field.type === 'checkbox') {
      input.checked = fieldValue(field.id) === true;
      wrapper.append(input, label);
    } else {
      const stored = fieldValue(field.id);
      input.value = stored || (field.type === 'select' ? field.options[0][0] : '');
      setFieldValue(field.id, input.value);
      wrapper.append(label, input);
    }

    input.addEventListener('input', () => {
      setFieldValue(field.id, field.type === 'checkbox' ? input.checked : input.value);
      update();
    });
    input.addEventListener('change', () => {
      setFieldValue(field.id, field.type === 'checkbox' ? input.checked : input.value);
      update();
    });

    el.fields.append(wrapper);
  }
}

/** The values of the current format's fields, as compose() wants them. */
function currentValues() {
  const values = {};
  for (const field of fieldsFor()) values[field.id] = fieldValue(field.id);
  return values;
}

/* ------------------------------------------------------------ the drawing */

function style() {
  return {
    foreground: el.foreground.value,
    background: el.transparent.checked ? 'none' : el.background.value,
  };
}

/**
 * Draw the code, or explain why there is not one.
 *
 * Everything from here down is arithmetic on a string. There is nothing to
 * read from disk, nothing to decode, and - the point of the whole tool -
 * nothing to send anywhere.
 */
function update() {
  const values = currentValues();
  const isQr = el.symbology.value === 'qr';
  const kind = isQr ? el.format.value : 'text';

  const blanks = isQr ? missing(kind, values) : (values.text ? [] : ['Something to put in it']);
  if (blanks.length) {
    showNothing(`Fill in: ${blanks.join(', ')}.`, blanks.length === fieldsFor().length);
    return;
  }

  let text;
  try {
    text = isQr ? compose(kind, values) : values.text;
  } catch (error) {
    showNothing(error.message, false);
    return;
  }

  el.encoded.textContent = text;
  el.encodedNote.textContent = describeString(text);

  try {
    current = isQr ? drawQr(text) : drawBarcode(text);
  } catch (error) {
    showNothing(error.message, false);
    return;
  }

  el.inputError.hidden = true;
  // Parsed rather than assigned to innerHTML. The markup is this page's own and
  // every value in it is escaped where it is written, but a page that builds
  // markup out of what somebody typed should not be reaching for innerHTML at
  // all - and the parser is the same amount of code.
  const parsed = new DOMParser().parseFromString(current.svg, 'image/svg+xml');
  el.preview.replaceChildren(document.importNode(parsed.documentElement, true));
  el.facts.textContent = current.facts;
  for (const button of [el.downloadSvg, el.downloadPng, el.copyPng]) button.disabled = false;
}

/** A QR code at the requested size, snapped to whole pixels per module. */
function drawQr(text) {
  const quiet = clamp(Number(el.quiet.value), 0, 16);
  const qr = makeQr(text, { level: el.level.value });
  const across = qr.size + quiet * 2;

  // A module has to be a whole number of pixels or its edges land on a half
  // pixel and come out grey, which is the one thing a scanner cannot forgive.
  const asked = clamp(Number(el.size.value), 64, 4096);
  const scale = Math.max(1, Math.floor(asked / across));
  const pixels = across * scale;

  el.sizeNote.textContent = pixels === asked
    ? `${pixels} pixels square, at ${scale} per module.`
    : `${pixels} pixels square rather than ${asked}, because ${across} modules `
      + `across only divides evenly at ${scale} pixels each. The SVG has no such `
      + 'limit - it prints at any size.';

  const svg = qrSvg(qr, { ...style(), scale, quiet });
  const used = Math.round((qr.bits / qr.capacityBits) * 100);

  return {
    svg,
    name: 'qr-code',
    facts: `Version ${qr.version}: ${qr.size} modules square, ${qr.mode} mode, `
      + `level ${qr.level} - about ${qr.recovery}% of it can be destroyed and still read. `
      + `Mask ${qr.mask}. Using ${qr.bits} of the ${qr.capacityBits} bits this version holds `
      + `(${used}%), which at this version and level is room for `
      + `${capacityFor(qr.mode, qr.version, qr.level)} ${countedIn(qr.mode)} in all.`,
  };
}

/** One of the striped ones, at the bar width and height asked for. */
function drawBarcode(text) {
  const code = makeBarcode(text, {
    symbology: el.symbology.value,
    code39Check: el.code39Check.checked,
  });

  const scale = clamp(Number(el.barWidth.value), 1, 10);
  const height = clamp(Number(el.barHeight.value), 20, 600);
  const svg = barcodeSvg(code, {
    ...style(), scale, height, text: el.showText.checked,
  });
  const size = sizeOfSvg(svg);

  el.sizeNote.textContent = `${size.width} by ${size.height} pixels, at ${scale} `
    + `pixel${scale === 1 ? '' : 's'} for the narrowest bar.`;

  return {
    svg,
    name: `${code.symbology}-${code.text}`.replace(/[^a-z0-9-]/gi, '-').toLowerCase(),
    facts: `${code.name}, holding ${code.text}. ${code.modules.length} modules across, `
      + `${code.quiet.left} of them the quiet zone on the left and ${code.quiet.right} on `
      + `the right - white space the scanner needs, so it is part of the picture rather `
      + `than something to crop off.${code.note ? ` ${code.note}` : ''}`,
  };
}

/** Say what the string costs, in the unit the mode counts in. */
function describeString(text) {
  const bytes = new TextEncoder().encode(text).length;
  const characters = [...text].length;
  return bytes === characters
    ? `${characters} character${characters === 1 ? '' : 's'}.`
    : `${characters} characters, ${bytes} bytes - some of them are not ASCII, and a QR `
      + 'code counts what it stores in bytes.';
}

function countedIn(mode) {
  return mode === 'byte' ? 'bytes' : 'characters';
}

function showNothing(message, quiet) {
  current = null;
  el.preview.replaceChildren();
  el.facts.textContent = '';
  el.encoded.textContent = '';
  el.encodedNote.textContent = '';
  el.sizeNote.textContent = '';
  el.inputError.textContent = message;
  // Nothing typed yet is not an error, it is the starting state.
  el.inputError.hidden = quiet;
  for (const button of [el.downloadSvg, el.downloadPng, el.copyPng]) button.disabled = true;
}

function clamp(value, low, high) {
  if (!Number.isFinite(value)) return low;
  return Math.min(high, Math.max(low, Math.round(value)));
}

/* ------------------------------------------------------------- the menus */

/** Show the options that apply to what is selected, and hide the rest. */
function switchSymbology() {
  const isQr = el.symbology.value === 'qr';

  el.formatRow.hidden = !isQr;
  el.qrOptions.hidden = !isQr;
  el.barcodeOptions.hidden = isQr;
  el.sizeRow.hidden = !isQr;
  el.code39CheckRow.hidden = el.symbology.value !== 'code39';
  el.encodedPanel.hidden = !isQr;

  if (isQr) {
    const kind = KINDS.find((entry) => entry.id === el.format.value);
    el.symbologyNote.textContent = 'A QR code holds any text at all, and every phone '
      + 'camera made in the last ten years reads one without an app.';
    el.formatNote.textContent = kind.note;
  } else {
    const symbology = SYMBOLOGIES.find((entry) => entry.id === el.symbology.value);
    el.symbologyNote.textContent = symbology.holds;
    el.formatNote.textContent = '';
  }

  buildFields();
  update();
}

/* ---------------------------------------------------------- the downloads */

function baseName() {
  return current?.name ?? 'code';
}

el.downloadSvg.addEventListener('click', () => {
  if (!current) return;
  download(new Blob([current.svg], { type: 'image/svg+xml' }), `${baseName()}.svg`);
  el.downloadNote.textContent = 'Saved. Nothing was sent anywhere to make it.';
});

el.downloadPng.addEventListener('click', async () => {
  if (!current) return;
  try {
    download(await svgToPng(current.svg), `${baseName()}.png`);
    el.downloadNote.textContent = 'Saved. Nothing was sent anywhere to make it.';
  } catch (error) {
    el.downloadNote.textContent = `${error.message}. The SVG will still download.`;
  }
});

el.copyPng.addEventListener('click', async () => {
  if (!current) return;
  try {
    const blob = await svgToPng(current.svg);
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    el.downloadNote.textContent = 'Copied. Paste it wherever you need it.';
  } catch {
    // Clipboard access is refused in plenty of ordinary situations - an
    // insecure origin, a browser that has never supported writing an image,
    // a permission the visitor declined. None of them is worth an alarm.
    el.downloadNote.textContent = 'This browser would not let the page write to the '
      + 'clipboard. Download it instead.';
  }
});

/* ------------------------------------------------------------- the wiring */

el.symbology.addEventListener('change', switchSymbology);
el.format.addEventListener('change', () => {
  el.formatNote.textContent = KINDS.find((kind) => kind.id === el.format.value).note;
  buildFields();
  update();
});

for (const control of [el.level, el.quiet, el.barWidth, el.barHeight, el.showText,
  el.code39Check, el.foreground, el.background, el.transparent, el.size]) {
  control.addEventListener('input', update);
  control.addEventListener('change', update);
}

el.privacyToggle.addEventListener('click', () => {
  const open = el.privacyPanel.hidden;
  el.privacyPanel.hidden = !open;
  el.privacyToggle.setAttribute('aria-expanded', String(open));
});

/* ------------------------------------------------------ the live network check */

// Google's ad and measurement scripts, and the donate button's. They are the
// price of the site being free, they are loaded without the visitor asking, and
// none of them is handed anything about what was typed into this page - so they
// are reported as themselves rather than counted as an intruder.
const PLATFORM_HOSTS = /(^|\.)(googlesyndication\.com|doubleclick\.net|googleadservices\.com|googletagservices\.com|adtrafficquality\.google|googletagmanager\.com|google-analytics\.com|gstatic\.com|googleapis\.com|buymeacoffee\.com|cloudflareinsights\.com|google\.[a-z]{2,3}(\.[a-z]{2})?)$/;

/**
 * Report what this page has actually fetched.
 *
 * The claim on trial is not "this page is silent" - it is not, it carries ads -
 * but "nothing has carried away what you typed". On this tool that is a sharper
 * claim than usual: the thing being encoded is often a Wi-Fi password.
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
      ? `what you typed has gone nowhere. ${total} files loaded.${platformNote}`
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
  el.inputError.hidden = false;
  el.inputError.textContent = `Something broke: ${event.message}. Reload the page to start over.`;
});
window.addEventListener('unhandledrejection', (event) => {
  el.inputError.hidden = false;
  el.inputError.textContent = `Something broke: ${event.reason?.message ?? event.reason}. `
    + 'Reload the page to start over.';
});

for (const kind of KINDS) el.format.append(new Option(kind.name, kind.id));

switchSymbology();
monitorNetwork();
registerServiceWorker();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
