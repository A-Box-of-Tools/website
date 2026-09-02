/** UI wiring and application state. */

import { phrase } from './shared/phrases.js';
import { base64DataUri, svgDataUri } from './encode.js';
import { sniff, extensionType } from './sniff.js';
import { metadata } from './metadata.js';
import {
  SHAPES, render as renderShape, bundle, bundleName, fileName, identifiers,
} from './shapes.js';
import {
  bytes as humanBytes, count, overhead, verdict, metadataNote, dimensions,
} from './files.js';
import { wireFilePicker, readingLabel } from './shared/file-picker.js';

const $ = (id) => document.getElementById(id);

const el = {
  dropzone: $('dropzone'),
  fileInput: $('file-input'),
  fileList: $('file-list'),
  listToolbar: $('list-toolbar'),
  countLabel: $('count-label'),
  clearAll: $('clear-all'),
  loadError: $('load-error'),
  shapes: $('shapes'),
  svgBase64: $('svg-base64'),
  emptyNote: $('empty-note'),
  results: $('results'),
  resultsSummary: $('results-summary'),
  copyAll: $('copy-all'),
  downloadAll: $('download-all'),
  resultList: $('result-list'),
  privacyToggle: $('privacy-toggle'),
  privacyPanel: $('privacy-panel'),
};

/**
 * @typedef {object} Item
 * @property {number} id
 * @property {File} file
 * @property {Uint8Array} data the file exactly as it came off the disk
 * @property {string} thumbUrl an object URL, revoked when the item is dropped
 * @property {string} mime what the bytes say it is
 * @property {string} label the same thing in the words a person uses
 * @property {string} note set when the format is one browsers will not draw
 * @property {string} mismatch set when the extension disagrees with the bytes
 * @property {{bytes: number, kinds: string[]}|null} meta null means not looked at
 * @property {boolean} svg
 * @property {string} text the SVG source; empty for everything else
 * @property {number} width in pixels, 0 until measured or when unmeasurable
 * @property {number} height
 * @property {boolean} renders whether the URI drew as a picture here
 * @property {{key: string, uri: string}|null} cache the last URI built, and
 *   the settings it was built under
 */

/** @type {Item[]} */
let items = [];
let nextId = 1;
let busy = false;

const utf8 = new TextDecoder('utf-8');

/* ------------------------------------------------------------------ adding */

// The drop zone and the picker: shared, because every tool here needs the
// same one. src/shared/file-picker.js, copied in from shared/js/ by the
// build. The resting label comes off the markup, so it is written once,
// in this tool.toml, rather than here as well.
const picker = wireFilePicker({
  input: el.fileInput,
  dropzone: el.dropzone,
  onFiles(files) {
    addFiles(files);
  },
});

async function addFiles(files) {
  if (!files?.length || busy) return;

  busy = true;
  picker.busy(readingLabel(files.length));

  const failures = [];
  const added = [];

  try {
    for (const file of files) {
      // The whole file, because the whole file is what gets encoded. There is
      // no streaming version of this: a data URI is one string.
      const data = new Uint8Array(await file.arrayBuffer());
      const kind = sniff(data);

      if (!kind) {
        failures.push(phrase('read.notimage', { name: file.name }));
        continue;
      }

      const declared = extensionType(file.name);
      const item = {
        id: nextId,
        file,
        data,
        thumbUrl: URL.createObjectURL(file),
        mime: kind.mime,
        label: kind.label,
        note: kind.note ?? '',
        mismatch: declared && declared !== kind.mime
          ? phrase('read.mismatch', {
            extension: file.name.replace(/^.*\./, '.'),
            label: kind.label,
            mime: kind.mime,
          })
          : '',
        meta: metadata(data, kind.mime),
        svg: kind.mime === 'image/svg+xml',
        text: kind.mime === 'image/svg+xml' ? utf8.decode(data) : '',
        width: 0,
        height: 0,
        renders: true,
        cache: null,
      };
      nextId += 1;

      items.push(item);
      added.push(item);
    }
  } finally {
    busy = false;
    picker.done();
  }

  if (failures.length) showLoadError(failures.join('\n'));
  else clearLoadError();

  draw();
  // The measurement is the preview: an <img> pointed at the URI this tool
  // just built, which settles both questions at once - how big the picture is,
  // and whether the URI works at all.
  for (const item of added) measure(item).then(draw);
}

/**
 * Load the data URI as an image, and believe whatever happens.
 *
 * A dimension read off the original file would be a different claim from the
 * one the page is making. This draws the URI, so a URI that does not render -
 * a HEIC outside Safari, a TIFF anywhere - is reported as not rendering rather
 * than as a picture of a known size.
 */
function measure(item) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      item.width = image.naturalWidth;
      item.height = image.naturalHeight;
      item.renders = true;
      resolve();
    };
    image.onerror = () => {
      item.renders = false;
      resolve();
    };
    image.src = uriFor(item);
  });
}

function removeItem(id) {
  const item = items.find((one) => one.id === id);
  if (item) URL.revokeObjectURL(item.thumbUrl);
  items = items.filter((one) => one.id !== id);
  clearLoadError();
  draw();
}

el.clearAll.addEventListener('click', () => {
  for (const item of items) URL.revokeObjectURL(item.thumbUrl);
  items = [];
  clearLoadError();
  draw();
});

/* ---------------------------------------------------------------- encoding */

/** Which settings the cached URI was built under. Only one setting can change
 *  what an item encodes to, and it changes it for SVGs alone. */
const modeKey = (item) => (item.svg && !el.svgBase64.checked ? 'svg' : 'base64');

/**
 * The data URI for one item, built once and kept.
 *
 * Encoding is fast but it is not free - a 12 MB photo is a 16 MB string - and
 * every redraw would otherwise build every one of them again.
 */
function uriFor(item) {
  const key = modeKey(item);
  if (item.cache?.key === key) return item.cache.uri;

  const uri = key === 'svg'
    ? svgDataUri(item.text)
    : base64DataUri(item.data, item.mime);

  item.cache = { key, uri };
  return uri;
}

/** The items as the shape module wants them: names made unique and CSS-safe,
 *  in list order, so two files called logo.svg do not become one rule. */
function results() {
  const idents = identifiers(items.map((item) => item.file.name));
  return items.map((item, at) => ({
    item,
    name: item.file.name,
    ident: idents[at],
    uri: uriFor(item),
    width: item.width,
    height: item.height,
    svg: item.svg,
  }));
}

const currentShape = () =>
  el.shapes.querySelector('input[name="shape"]:checked')?.value ?? SHAPES[0].id;

el.shapes.addEventListener('change', draw);
el.svgBase64.addEventListener('change', () => {
  // Re-measuring is not needed - the same picture either way - but the
  // preview and the code both come off the URI, so both are redrawn.
  draw();
});

/* ----------------------------------------------------------------- drawing */

/** How much of a result is shown before it is cut off.
 *
 *  Not a nicety. A 4 MB photograph is 5.6 million characters, and putting that
 *  many into an element makes the browser lay out a wall of text nobody will
 *  read, on every redraw. The whole string is always what gets copied and
 *  downloaded; this is only what is drawn. */
const SNIPPET = 1200;

function draw() {
  const shape = currentShape();
  const rows = results();

  el.countLabel.textContent = phrase(items.length === 1 ? 'n.image.one' : 'n.image.many',
    { n: items.length });
  el.listToolbar.hidden = items.length === 0;
  el.emptyNote.hidden = items.length > 0;
  el.results.hidden = items.length === 0;

  drawFileList();

  if (!items.length) return;

  const total = rows.reduce((sum, row) => sum + renderShape(shape, row).length, 0);
  el.resultsSummary.textContent = phrase(
    items.length === 1 ? 'results.one' : 'results.many',
    { n: items.length, size: humanBytes(total, phrase) },
  );

  el.resultList.replaceChildren(...rows.map((row) => resultRow(shape, row)));
}

function drawFileList() {
  el.fileList.replaceChildren(...items.map((item) => {
    const row = document.createElement('li');
    row.className = 'file-row';

    const main = document.createElement('div');
    main.className = 'file-main-wrap';

    const thumb = document.createElement('img');
    thumb.className = 'file-thumb';
    thumb.src = item.thumbUrl;
    thumb.alt = '';
    main.appendChild(thumb);

    const text = document.createElement('div');
    text.className = 'file-main';

    const name = document.createElement('p');
    name.className = 'file-name';
    name.textContent = item.file.name;
    text.appendChild(name);

    const sub = document.createElement('p');
    sub.className = 'file-sub';
    sub.textContent = [
      item.label,
      humanBytes(item.file.size, phrase),
      item.width && item.height && item.renders ? dimensions(item.width, item.height) : null,
    ].filter(Boolean).reduce((a, b) => phrase('join.dot', { a, b }));
    text.appendChild(sub);

    main.appendChild(text);
    row.appendChild(main);

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'row-remove';
    const removeLabel = phrase('row.remove', { name: item.file.name });
    remove.title = removeLabel;
    remove.setAttribute('aria-label', removeLabel);
    remove.textContent = '×';
    remove.disabled = busy;
    remove.addEventListener('click', () => removeItem(item.id));
    row.appendChild(remove);

    return row;
  }));
}

function resultRow(shape, row) {
  const { item } = row;
  const code = renderShape(shape, row);

  const li = document.createElement('li');
  li.className = 'result';

  const head = document.createElement('div');
  head.className = 'result-head';

  // Drawn from the URI rather than from the file, which is the point: what is
  // on screen here is what the line below will put on somebody's page.
  const preview = document.createElement('img');
  preview.className = 'result-preview';
  preview.src = row.uri;
  preview.alt = '';
  head.appendChild(preview);

  const meta = document.createElement('div');
  meta.className = 'result-meta';

  const name = document.createElement('p');
  name.className = 'result-name';
  name.textContent = item.file.name;
  meta.appendChild(name);

  const facts = [
    item.mime,
    item.width && item.height && item.renders ? dimensions(item.width, item.height) : null,
    phrase('facts.in', { size: humanBytes(item.file.size, phrase) }),
    phrase('facts.out', { n: count(code.length) }),
    overhead(item.file.size, row.uri.length, phrase),
  ].filter(Boolean);

  const sub = document.createElement('p');
  sub.className = 'result-sub';
  sub.textContent = facts.reduce((a, b) => phrase('join.dot', { a, b }));
  meta.appendChild(sub);

  const call = verdict(row.uri.length);
  const judgement = document.createElement('p');
  judgement.className = `result-verdict ${call.level}`;
  judgement.textContent = phrase(call.key);
  meta.appendChild(judgement);

  for (const warning of [
    item.mismatch,
    item.note,
    item.renders ? '' : phrase('render.failed'),
    item.meta ? metadataNote(item.meta, item.file.size, phrase) : '',
  ]) {
    if (!warning) continue;
    const line = document.createElement('p');
    line.className = 'result-warn';
    line.textContent = warning;
    meta.appendChild(line);
  }

  head.appendChild(meta);

  const actions = document.createElement('div');
  actions.className = 'result-actions';
  actions.appendChild(copyButton(code, 'primary'));

  const download = document.createElement('button');
  download.type = 'button';
  download.className = 'ghost';
  download.textContent = 'Download';
  download.addEventListener('click', () => saveText(code, fileName(shape, row)));
  actions.appendChild(download);

  head.appendChild(actions);
  li.appendChild(head);

  const pre = document.createElement('pre');
  pre.className = 'result-code';
  const holder = document.createElement('code');
  holder.textContent = code.length > SNIPPET ? `${code.slice(0, SNIPPET)}…` : code;
  pre.appendChild(holder);
  li.appendChild(pre);

  if (code.length > SNIPPET) {
    const more = document.createElement('button');
    more.type = 'button';
    more.className = 'ghost show-all';
    more.textContent = `Show all ${count(code.length)} characters`;
    more.addEventListener('click', () => {
      holder.textContent = code;
      more.remove();
    });
    li.appendChild(more);
  }

  return li;
}

/**
 * A copy button that says whether it worked.
 *
 * The clipboard can refuse - it needs a secure context and a gesture it agrees
 * was one - and a button that silently does nothing is the worst version of
 * that. A refusal says so and points at the download, which never fails.
 */
function copyButton(text, className) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = 'Copy';

  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(text);
      flash(button, 'Copied');
    } catch {
      flash(button, 'Copy refused - use Download');
    }
  });

  return button;
}

function flash(button, message) {
  const was = button.textContent;
  button.textContent = message;
  button.disabled = true;
  setTimeout(() => {
    button.textContent = was;
    button.disabled = false;
  }, 1600);
}

/* -------------------------------------------------------------- everything */

el.copyAll.addEventListener('click', async () => {
  if (!items.length) return;
  const text = bundle(currentShape(), results());
  try {
    await navigator.clipboard.writeText(text);
    flash(el.copyAll, 'Copied');
  } catch {
    flash(el.copyAll, 'Copy refused - use Download');
  }
});

el.downloadAll.addEventListener('click', () => {
  if (!items.length) return;
  const shape = currentShape();
  saveText(bundle(shape, results()), bundleName(shape));
});

/** Hand text to the browser's downloads. */
function saveText(text, name) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  // Revoked late: revoking immediately can cancel a download that has not
  // started yet in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

/* ------------------------------------------------------------------ errors */

function showLoadError(message) {
  el.loadError.textContent = message;
  el.loadError.hidden = false;
}

function clearLoadError() {
  el.loadError.textContent = '';
  el.loadError.hidden = true;
}

/* ------------------------------------------------- privacy panel + offline */

el.privacyToggle.addEventListener('click', () => {
  const open = el.privacyPanel.hidden;
  el.privacyPanel.hidden = !open;
  el.privacyToggle.setAttribute('aria-expanded', String(open));
});

/* -------------------------------------------------------------------- boot */

// An error thrown after boot would otherwise only reach the console, leaving
// the page looking functional but doing nothing.
window.addEventListener('error', (event) => {
  showLoadError(phrase('error.broke', { detail: event.message }));
});
window.addEventListener('unhandledrejection', (event) => {
  showLoadError(phrase('error.broke', { detail: event.reason?.message ?? event.reason }));
});

draw();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
