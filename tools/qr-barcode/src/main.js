/** UI wiring and application state. */

import { phrase } from './shared/phrases.js';
import { saveBlob } from './shared/download.js';
import { KINDS, compose, missing } from './payload.js';
import { makeQr } from './qr.js';
import { capacityFor } from './qr-encode.js';
import { SYMBOLOGIES, makeBarcode } from './barcode.js';
import {
  barcodeSvg, qrSvg, sizeOfSvg, svgToPng,
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
};

/** What a barcode's single box is called, and what to show in it. */
const BARCODE_FIELD = {
  code128: ['field.thetext', 'ABOX-TOOLS-128'],
  ean13: ['field.thenumber', '590123412345'],
  upca: ['field.thenumber', '03600029145'],
  ean8: ['field.thenumber', '9638507'],
  itf14: ['field.thenumber', '1540014128876'],
  itf: ['field.thenumber', '1234567890'],
  code39: ['field.thetext', 'ABOX TOOLS'],
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
        input.append(new Option(phrase(text), value));
      }
    } else {
      input.type = field.type;
    }
    // phrase() hands back anything it has no entry for, so a placeholder that
    // is an address or a number arrives unchanged and only the prose is looked up.
    if (field.placeholder) input.placeholder = phrase(field.placeholder);

    // A checkbox is optional by being a checkbox; saying so as well reads as
    // though there were a third state it could be left in.
    const label = document.createElement('label');
    label.htmlFor = input.id;
    label.textContent = field.optional && field.type !== 'checkbox'
      ? phrase('field.optional', { label: phrase(field.label) })
      : phrase(field.label);

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

  const blanks = isQr ? missing(kind, values) : (values.text ? [] : ['payload.something']);
  if (blanks.length) {
    const list = blanks.map((key) => phrase(key))
      .reduce((a, b) => phrase('join.list', { a, b }));
    showNothing(phrase('payload.fillin', { list }), blanks.length === fieldsFor().length);
    return;
  }

  let text;
  try {
    text = isQr ? compose(kind, values, phrase) : values.text;
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
  const qr = makeQr(text, { level: el.level.value }, phrase);
  const across = qr.size + quiet * 2;

  // A module has to be a whole number of pixels or its edges land on a half
  // pixel and come out grey, which is the one thing a scanner cannot forgive.
  const asked = clamp(Number(el.size.value), 64, 4096);
  const scale = Math.max(1, Math.floor(asked / across));
  const pixels = across * scale;

  el.sizeNote.textContent = pixels === asked
    ? phrase('size.exact', { pixels, scale })
    : phrase('size.rounded', {
      pixels, asked, across, scale,
    });

  const svg = qrSvg(qr, { ...style(), scale, quiet });
  const used = Math.round((qr.bits / qr.capacityBits) * 100);

  return {
    svg,
    name: 'qr-code',
    facts: phrase('facts.qr', {
      version: qr.version,
      size: qr.size,
      mode: qr.mode,
      level: qr.level,
      recovery: qr.recovery,
      mask: qr.mask,
      bits: qr.bits,
      capacity: qr.capacityBits,
      used,
      most: capacityFor(qr.mode, qr.version, qr.level),
      unit: countedIn(qr.mode),
    }),
  };
}

/** One of the striped ones, at the bar width and height asked for. */
function drawBarcode(text) {
  const code = makeBarcode(text, {
    symbology: el.symbology.value,
    code39Check: el.code39Check.checked,
  }, phrase);

  const scale = clamp(Number(el.barWidth.value), 1, 10);
  const height = clamp(Number(el.barHeight.value), 20, 600);
  const svg = barcodeSvg(code, {
    ...style(), scale, height, text: el.showText.checked,
  });
  const size = sizeOfSvg(svg);

  el.sizeNote.textContent = phrase(scale === 1 ? 'size.barcode.one' : 'size.barcode.many',
    { width: size.width, height: size.height, scale });

  return {
    svg,
    name: `${code.symbology}-${code.text}`.replace(/[^a-z0-9-]/gi, '-').toLowerCase(),
    facts: (() => {
      const facts = phrase('facts.barcode', {
        name: code.name,
        text: code.text,
        modules: code.modules.length,
        left: code.quiet.left,
        right: code.quiet.right,
      });
      return code.note ? phrase('facts.andnote', { facts, note: code.note }) : facts;
    })(),
  };
}

/** Say what the string costs, in the unit the mode counts in. */
function describeString(text) {
  const bytes = new TextEncoder().encode(text).length;
  const characters = [...text].length;
  if (bytes !== characters) return phrase('string.bytes', { characters, bytes });
  return phrase(characters === 1 ? 'string.one' : 'string.many', { n: characters });
}

function countedIn(mode) {
  return phrase(mode === 'byte' ? 'unit.bytes' : 'unit.characters');
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
    el.symbologyNote.textContent = phrase('note.symbology.qr');
    el.formatNote.textContent = phrase(kind.note);
  } else {
    const symbology = SYMBOLOGIES.find((entry) => entry.id === el.symbology.value);
    el.symbologyNote.textContent = phrase(symbology.holds);
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
  saveBlob(new Blob([current.svg], { type: 'image/svg+xml' }), `${baseName()}.svg`);
  el.downloadNote.textContent = phrase('save.done');
});

el.downloadPng.addEventListener('click', async () => {
  if (!current) return;
  try {
    saveBlob(await svgToPng(current.svg), `${baseName()}.png`);
    el.downloadNote.textContent = phrase('save.done');
  } catch (error) {
    // render.js throws a key; a browser that failed for its own reasons throws
    // a sentence, and phrase() hands back what it does not recognise.
    el.downloadNote.textContent = phrase('save.failed', { detail: phrase(error.message) });
  }
});

el.copyPng.addEventListener('click', async () => {
  if (!current) return;
  try {
    const blob = await svgToPng(current.svg);
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    el.downloadNote.textContent = phrase('save.copied');
  } catch {
    // Clipboard access is refused in plenty of ordinary situations - an
    // insecure origin, a browser that has never supported writing an image,
    // a permission the visitor declined. None of them is worth an alarm.
    el.downloadNote.textContent = phrase('save.noclipboard');
  }
});

/* ------------------------------------------------------------- the wiring */

el.symbology.addEventListener('change', switchSymbology);
el.format.addEventListener('change', () => {
  el.formatNote.textContent = phrase(KINDS.find((kind) => kind.id === el.format.value).note);
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

/* -------------------------------------------------------------------- boot */

// An error thrown after boot would otherwise only reach the console, leaving
// the page looking functional but doing nothing.
window.addEventListener('error', (event) => {
  el.inputError.hidden = false;
  el.inputError.textContent = phrase('error.broke', { detail: event.message });
});
window.addEventListener('unhandledrejection', (event) => {
  el.inputError.hidden = false;
  el.inputError.textContent = phrase('error.broke', { detail: event.reason?.message ?? event.reason });
});

for (const kind of KINDS) el.format.append(new Option(phrase(kind.name), kind.id));

switchSymbology();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
