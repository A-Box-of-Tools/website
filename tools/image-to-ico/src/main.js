/** UI wiring and application state. */

import { phrase } from './shared/phrases.js';
import { messageBox } from './shared/message-box.js';
import { writeIco, dibEntry, readIcoDirectory } from './ico.js';
import { writeIcns, readIcnsElements, ICNS_TYPES, ICNS_SIZES } from './icns.js';
import { PRESETS, SIZES, WHY, presetById, storageFor, dibBytes } from './sizes.js';
import { decode, release, square, pixels, png, FIT, NOMINAL_VECTOR } from './render.js';
import { PACK_IMAGES, manifest, browserConfig, headSnippet, readme } from './pack.js';
import {
  bytes, dimensions, countOf as count, iconName, folderFor,
  describe as describeSizes, listOf as joinList,
} from './files.js';
import { wireFilePicker, readingLabel } from './shared/file-picker.js';
import { makeZip } from './shared/zip.js';

const $ = (id) => document.getElementById(id);

// files.js and pack.js cannot reach the DOM, so the words come to them. Bound
// once here rather than passed at every call site.
const humanBytes = (n) => bytes(n, phrase);
const countOf = (n, noun) => count(n, noun, phrase);
const describe = (sizes, storage, fit, transparent) =>
  describeSizes(sizes, storage, fit, transparent, phrase);

const el = {
  dropzone: $('dropzone'),
  fileInput: $('file-input'),
  fileList: $('file-list'),
  listToolbar: $('list-toolbar'),
  countLabel: $('count-label'),
  clearAll: $('clear-all'),
  loadError: $('load-error'),
  shapeNote: $('shape-note'),
  presetList: $('preset-list'),
  presetNote: $('preset-note'),
  sizeSet: $('size-set'),
  sizeGrid: $('size-grid'),
  sizeSummary: $('size-summary'),
  fitSelect: $('fit-select'),
  backgroundMode: $('background-mode'),
  backgroundColour: $('background-colour'),
  storageSelect: $('storage-select'),
  storageNote: $('storage-note'),
  wantIco: $('want-ico'),
  wantIcns: $('want-icns'),
  wantPack: $('want-pack'),
  outputSummary: $('output-summary'),
  icoSettings: $('ico-settings'),
  storageRow: $('storage-row'),
  preview: $('preview'),
  previewStrip: $('preview-strip'),
  previewNote: $('preview-note'),
  makeIcon: $('make-icon'),
  progress: $('progress'),
  progressBar: $('progress-bar'),
  progressLabel: $('progress-label'),
  results: $('results'),
  resultList: $('result-list'),
  resultsSummary: $('results-summary'),
  downloadZip: $('download-zip'),
  snippet: $('snippet'),
  snippetText: $('snippet-text'),
  copySnippet: $('copy-snippet'),
  privacyToggle: $('privacy-toggle'),
  privacyPanel: $('privacy-panel'),
};

const { show: showLoadError, clear: clearLoadError } = messageBox(el.loadError);

/**
 * @typedef {object} Item
 * @property {number} id
 * @property {File} file
 * @property {string} thumbUrl an object URL, revoked when the item is dropped
 * @property {number} width  the source, in pixels
 * @property {number} height
 */

/** @type {Item[]} */
let items = [];
let nextId = 1;
let busy = false;

/** Which picture the preview is showing. Clicking a row changes it. */
let activeId = null;

/**
 * The decoded copy of the active picture, kept so that moving a control redraws
 * the preview without decoding again. Exactly one is held at a time: a decoded
 * 4000px photograph is 64 MB of pixels, and a folder of them is how a tab ends
 * up being killed by the browser.
 */
let activeDecoded = null;
let activeFor = null;

/** The current settings. Read by the preview and by the run; never duplicated. */
let presetId = 'website';
let chosen = new Set(presetById('website').sizes);

/** Everything the run produced, kept so the rows can be redrawn without work. */
let results = [];
let resultUrls = [];

/* ------------------------------------------------------------------ adding */

const picker = wireFilePicker({
  input: el.fileInput,
  dropzone: el.dropzone,
  onFiles(files) {
    addFiles(files);
  },
});

async function addFiles(files) {
  if (!files?.length || busy) return;

  picker.busy(readingLabel(files.length));
  const failures = [];

  try {
    for (const file of files) {
      if (!looksLikeImage(file)) {
        failures.push(phrase('load.notimage', { name: file.name }));
        continue;
      }

      const thumbUrl = URL.createObjectURL(file);
      const size = await probe(file, thumbUrl);
      if (!size) {
        URL.revokeObjectURL(thumbUrl);
        failures.push(phrase('load.undecodable', { name: file.name }));
        continue;
      }

      items.push({
        id: nextId,
        file,
        thumbUrl,
        width: size.width,
        height: size.height,
        vector: size.vector,
      });
      nextId += 1;
    }
  } finally {
    picker.done();
  }

  if (failures.length) showLoadError(failures.join('\n'));
  else clearLoadError();

  if (activeId === null && items.length) activeId = items[0].id;

  clearResults();
  render();
  drawPreview();
}

/** Types the browser is likely to decode. The decode itself is the real test. */
function looksLikeImage(file) {
  if (!file.type) return /\.(jpe?g|png|webp|gif|bmp|avif|svg)$/i.test(file.name);
  return file.type.startsWith('image/');
}

/**
 * A picture's pixel size, without keeping the decoded image around.
 *
 * An SVG is allowed to report nothing, because a vector has no pixel size of
 * its own and plenty are written without the attributes that would fake one.
 * render.js assumes a square of NOMINAL_VECTOR in that case, and this has to
 * assume the same one or the page would describe a picture the renderer never
 * saw.
 */
function probe(file, url) {
  const vector = file.type === 'image/svg+xml' || /\.svg$/i.test(file.name);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const width = img.naturalWidth || (vector ? NOMINAL_VECTOR : 0);
      const height = img.naturalHeight || (vector ? NOMINAL_VECTOR : 0);
      resolve(width && height ? { width, height, vector } : null);
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

function removeItem(id) {
  const item = items.find((one) => one.id === id);
  if (!item || busy) return;
  URL.revokeObjectURL(item.thumbUrl);
  items = items.filter((one) => one.id !== id);

  if (activeId === id) {
    activeId = items.length ? items[0].id : null;
    dropBitmap();
  }

  clearResults();
  render();
  drawPreview();
}

el.clearAll.addEventListener('click', () => {
  if (busy) return;
  for (const item of items) URL.revokeObjectURL(item.thumbUrl);
  items = [];
  activeId = null;
  dropBitmap();
  clearResults();
  clearLoadError();
  render();
  drawPreview();
});

/* ----------------------------------------------------- the standards, drawn */

/*
  The presets and the size list are built from sizes.js rather than written out
  in body.html. Every size carries the reason something asks for it, and a
  number and its reason written in two files is how one of them ends up wrong.
*/

function buildPresets() {
  for (const preset of PRESETS) {
    const label = document.createElement('label');
    label.className = 'preset-choice';

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'preset';
    input.value = preset.id;
    input.checked = preset.id === presetId;
    input.addEventListener('change', () => choosePreset(preset.id));

    const text = document.createElement('span');
    text.className = 'preset-choice-text';

    const strong = document.createElement('strong');
    strong.textContent = phrase(preset.label);

    const sizes = document.createElement('span');
    sizes.className = 'preset-sizes';
    sizes.textContent = preset.id === 'custom'
      ? phrase('preset.yours')
      : phrase('preset.pixels', { list: joinList(preset.sizes, phrase) });

    text.append(strong, sizes);
    label.append(input, text);
    el.presetList.append(label);
  }
}

function choosePreset(id) {
  presetId = id;
  const preset = presetById(id);
  if (id !== 'custom') {
    chosen = new Set(preset.sizes);
    el.storageSelect.value = preset.storage;
  }
  clearResults();
  render();
  drawPreview();
}

function buildSizes() {
  for (const { px } of SIZES) {
    const label = document.createElement('label');
    label.className = 'size-choice';
    label.dataset.px = String(px);

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = String(px);
    input.addEventListener('change', () => {
      // Touching a size is a choice about sizes, so the preset follows the
      // ticks rather than the ticks silently disagreeing with the preset.
      presetId = 'custom';
      const radio = el.presetList.querySelector('input[value="custom"]');
      if (radio) radio.checked = true;

      if (input.checked) chosen.add(px);
      else chosen.delete(px);

      clearResults();
      render();
      drawPreview();
    });

    const strong = document.createElement('strong');
    strong.textContent = `${px}px`;

    const why = document.createElement('span');
    why.className = 'size-why';
    why.textContent = phrase(WHY.get(px) ?? '');

    label.append(input, strong, why);
    el.sizeGrid.append(label);
  }
}

/* --------------------------------------------------------------- rendering */

function render() {
  renderList();
  renderSizes();
  renderNotes();

  el.makeIcon.disabled = busy || items.length === 0 || !wanted().any;
}

function renderList() {
  el.fileList.replaceChildren();
  el.listToolbar.hidden = items.length === 0;
  el.countLabel.textContent = `${countOf(items.length)} chosen`;
  el.clearAll.disabled = busy;

  for (const item of items) {
    const row = document.createElement('li');
    row.className = 'file-row';
    if (item.id === activeId) row.classList.add('active');

    const wrap = document.createElement('div');
    wrap.className = 'file-main-wrap';

    const thumb = document.createElement('img');
    thumb.className = 'file-thumb';
    thumb.src = item.thumbUrl;
    thumb.alt = '';

    const main = document.createElement('div');
    main.className = 'file-main';

    const name = document.createElement('p');
    name.className = 'file-name';
    name.textContent = item.file.name;

    const sub = document.createElement('p');
    sub.className = 'file-sub';
    sub.textContent = phrase(
      item.width === item.height ? 'row.square' : 'row.notsquare',
      { size: dimensions(item.width, item.height), bytes: humanBytes(item.file.size) });

    main.append(name, sub);
    wrap.append(thumb, main);

    // The whole row selects this picture for the preview. More than one image
    // on the list is a batch, and a batch still has to be checked one at a time.
    wrap.tabIndex = 0;
    wrap.setAttribute('role', 'button');
    wrap.setAttribute('aria-pressed', String(item.id === activeId));
    wrap.title = phrase('row.show');
    wrap.addEventListener('click', () => setActive(item.id));
    wrap.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setActive(item.id);
      }
    });

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'row-remove';
    remove.textContent = '×';
    remove.title = phrase('row.remove', { name: item.file.name });
    remove.setAttribute('aria-label', remove.title);
    remove.disabled = busy;
    remove.addEventListener('click', () => removeItem(item.id));

    row.append(wrap, remove);
    el.fileList.append(row);
  }
}

function renderSizes() {
  // Ten rows of tick boxes, each with a sentence saying what asks for that
  // size, and under a named preset not one of them is a decision: they are the
  // preset's own answer, drawn as controls. So they are shown when they are a
  // question - "Choose the sizes yourself" - and the rest of the time the
  // summary line underneath says which sizes went in, which is the part
  // somebody on a preset actually wants to read.
  //
  // Switching to custom keeps whatever the preset had ticked, so the grid
  // opens on the set you were already getting rather than on nothing.
  // The whole fieldset, not just the grid inside it. Hiding only the grid left
  // a titled box - "The sizes that go in the .ico" - holding one sentence and
  // no control, which reads as something that failed to load. What the sentence
  // said is on the page twice over anyway: the chosen preset prints its sizes
  // on its own tile, and how they are stored is the closing line of "How it is
  // drawn" directly below.
  el.sizeSet.hidden = presetId !== 'custom';

  for (const label of el.sizeGrid.querySelectorAll('.size-choice')) {
    const px = Number(label.dataset.px);
    const input = label.querySelector('input');
    input.checked = chosen.has(px);
    input.disabled = busy;
  }
}

function renderNotes() {
  const preset = presetById(presetId);
  el.presetNote.textContent = phrase(preset.note);

  const want = wanted();
  for (const box of [el.wantIco, el.wantIcns, el.wantPack]) box.disabled = busy;

  // The sizes, the presets and the storage choice are all .ico questions. With
  // the .ico switched off they are not wrong, they are inapplicable, so they
  // are dimmed and taken out of the tab order rather than hidden - a control
  // that vanishes when you untick something else is how people lose their
  // settings without noticing.
  const icoOff = !el.wantIco.checked;
  el.icoSettings.classList.toggle('inactive', icoOff);
  el.storageRow.classList.toggle('inactive', icoOff);
  el.storageSelect.disabled = busy || icoOff;
  for (const input of el.icoSettings.querySelectorAll('input')) input.disabled = busy || icoOff;

  el.outputSummary.textContent = outputSentence(want);
  el.outputSummary.classList.toggle('warn', !want.any);

  const sizes = sizeList();
  el.sizeSummary.textContent = sizes.length
    ? describe(sizes, el.storageSelect.value, el.fitSelect.value, isTransparent())
    : phrase('sizes.none');
  el.sizeSummary.classList.toggle('warn', sizes.length === 0 && el.wantIco.checked);

  el.storageNote.textContent = icoOff ? '' : storageSentence(sizes);

  const shape = shapeSentence();
  el.shapeNote.textContent = shape;
  el.shapeNote.hidden = shape === '';
  el.shapeNote.classList.toggle('warn', Boolean(tooSmall().length));
}

/** What this run is about to produce, named as files rather than as options. */
function outputSentence(want) {
  if (!want.any) {
    return phrase(el.wantIco.checked ? 'output.nosizes' : 'output.nothing');
  }

  const parts = [];
  if (want.ico) parts.push(phrase('output.ico', { count: countOf(sizeList().length, 'size') }));
  if (want.icns) parts.push(phrase('output.icns', { n: ICNS_TYPES.length }));
  if (want.pack) parts.push(phrase('output.pack', { n: PACK_IMAGES.length }));

  return phrase(want.icns ? 'output.line.icns' : 'output.line',
    { parts: joinList(parts, phrase) });
}

/** What the storage choice costs, in the only figures that can be known up front. */
function storageSentence(sizes) {
  if (!sizes.length) return '';
  const storage = el.storageSelect.value;
  const dib = sizes.filter((px) => storageFor(px, storage) === 'bmp');
  const asPng = sizes.filter((px) => storageFor(px, storage) === 'png');

  const parts = [];
  if (dib.length) {
    const total = dib.reduce((n, px) => n + dibBytes(px), 0);
    parts.push(phrase('storage.dib', { n: dib.length, size: humanBytes(total) }));
  }
  if (asPng.length) {
    parts.push(phrase('storage.png', { n: asPng.length }));
  }

  return phrase('storage.line', {
    parts: joinList(parts, phrase, 'join.andalso'),
    tail: phrase(`storage.tail.${storage}`),
  });
}

/** What is worth saying about the picture that was chosen. */
function shapeSentence() {
  const item = activeItem();
  if (!item) return '';

  const size = dimensions(item.width, item.height);

  // Each of these is a whole sentence rather than a clause with a verb
  // spliced into it: "16px is larger" against "16px and 32px are larger"
  // is one sentence in English and often two elsewhere.
  const shape = item.width !== item.height
    ? phrase(`shape.${el.fitSelect.value}`, { name: item.file.name, size })
    : '';

  const small = tooSmall();
  const blown = small.length
    ? phrase(small.length === 1 ? 'shape.small.one' : 'shape.small.many',
      { size, list: joinList(small, phrase) })
    : '';

  if (shape && blown) return phrase('shape.both', { shape, small: blown });
  return shape || blown;
}

/** Chosen sizes that are bigger than the source. */
function tooSmall() {
  const item = activeItem();
  // A vector has no size to run out of: it is drawn again at every size asked
  // for, so there is no such thing as blowing one up.
  if (!item || item.vector) return [];
  const side = el.fitSelect.value === FIT.crop
    ? Math.min(item.width, item.height)
    : Math.max(item.width, item.height);
  return sizeList().filter((px) => px > side).map((px) => `${px}px`);
}

const sizeList = () => SIZES.map(({ px }) => px).filter((px) => chosen.has(px));

/**
 * Which files this run would write.
 *
 * Read straight off the checkboxes rather than kept as state beside them,
 * because a copy of a checkbox is a thing that can disagree with the checkbox.
 * An .ico with nothing ticked in the size list is not an output, which is why
 * this is more than three booleans.
 */
function wanted() {
  const ico = el.wantIco.checked && sizeList().length > 0;
  return {
    ico,
    icns: el.wantIcns.checked,
    pack: el.wantPack.checked,
    any: ico || el.wantIcns.checked || el.wantPack.checked,
  };
}

/**
 * Every distinct square that has to be drawn for this run.
 *
 * The two formats overlap - both want 16, 32, 128 and 256 - and the website
 * set wants sizes neither of them has. Working out the union here means the
 * preview can show what is really being drawn, and means nothing is rendered
 * twice for one picture.
 */
function everySize() {
  const want = wanted();
  const all = new Set();
  if (want.ico) for (const px of sizeList()) all.add(px);
  if (want.icns) for (const px of ICNS_SIZES) all.add(px);
  return [...all].sort((a, b) => a - b);
}
const activeItem = () => items.find((item) => item.id === activeId) ?? items[0] ?? null;
const isTransparent = () => el.backgroundMode.value === 'transparent';
const background = () => (isTransparent() ? null : el.backgroundColour.value);

function setActive(id) {
  if (activeId === id) return;
  activeId = id;
  dropBitmap();
  render();
  drawPreview();
}

function dropBitmap() {
  release(activeDecoded);
  activeDecoded = null;
  activeFor = null;
}

/* --------------------------------------------------------------- the preview */

/*
  Drawn from the same functions the download is built from, at the sizes that
  are actually going in the file, at their real pixel size on screen. It is the
  one thing on this page that cannot be replaced by reading the settings back:
  whether a logo survives being 16 pixels across is not a question anybody can
  answer from a number.
*/

let previewToken = 0;

/** Above this, a square is bigger than the panel and no longer worth showing. */
const PREVIEW_CEILING = 256;

async function drawPreview() {
  const token = (previewToken += 1);
  const item = activeItem();
  const drawn = everySize();
  const sizes = drawn.filter((px) => px <= PREVIEW_CEILING);

  if (!item || !sizes.length) {
    el.preview.hidden = true;
    el.previewStrip.replaceChildren();
    return;
  }

  const decoded = await decodedFor(item);
  if (token !== previewToken) return;   // a newer draw started while decoding
  if (!decoded) {
    el.preview.hidden = true;
    return;
  }

  const cells = sizes.map((px) => {
    const canvas = square(decoded.bitmap, decoded.width, decoded.height, px, {
      fit: el.fitSelect.value,
      background: background(),
      vector: decoded.vector,
    });

    const cell = document.createElement('figure');
    cell.className = 'icon-cell';
    cell.style.margin = '0';

    const caption = document.createElement('figcaption');
    caption.textContent = `${px}px`;

    cell.append(canvas, caption);
    return cell;
  });

  // The .icns goes up to 1024, which is four times the width of this panel and
  // tells you nothing anyway - the problem sizes are all at the other end.
  const large = drawn.filter((px) => px > PREVIEW_CEILING);
  const note = phrase('preview.note', { name: item.file.name });

  el.previewStrip.replaceChildren(...cells);
  el.previewNote.textContent = large.length
    ? phrase('preview.large', { note, list: joinList(large, phrase, 'join.and') })
    : note;
  el.preview.hidden = false;
}

/** The active picture, decoded once and kept until the active picture changes. */
async function decodedFor(item) {
  if (activeFor === item.id && activeDecoded) return activeDecoded;
  dropBitmap();
  try {
    activeDecoded = await decode(item.file);
    activeFor = item.id;
    return activeDecoded;
  } catch {
    showLoadError(phrase('load.undecodable', { name: item.file.name }));
    return null;
  }
}

/* ----------------------------------------------------------------- the run */

el.makeIcon.addEventListener('click', () => {
  makeAll().catch((error) => {
    showLoadError(phrase('error.broke', { detail: error.message }));
    busy = false;
    render();
  });
});

async function makeAll() {
  const want = wanted();
  if (busy || !items.length || !want.any) return;

  busy = true;
  clearResults();
  render();

  el.progress.hidden = false;
  setProgress(0, phrase('progress.all', { count: countOf(items.length, 'image') }));

  const made = [];

  for (const [index, item] of items.entries()) {
    setProgress(index / items.length, phrase('progress.one', { name: item.file.name }));
    // Yield so the progress line above is painted before the work starts.
    await new Promise((resolve) => setTimeout(resolve, 0));

    // The preview has already decoded whichever picture it is showing.
    const decoded = (item.id === activeFor && activeDecoded) || await decode(item.file);
    try {
      made.push(await makeOne(item, decoded, want));
    } finally {
      // The active picture keeps its own copy; anything else was decoded for
      // this run alone and is dropped as soon as its files exist.
      if (decoded !== activeDecoded) release(decoded);
    }
  }

  setProgress(1, phrase('progress.done'));
  busy = false;
  results = made;
  renderResults();
  render();
  el.progress.hidden = true;
}

/**
 * One picture, all the way to the files it becomes.
 *
 * Every square is drawn once and handed to whatever wants it. The two formats
 * overlap at 16, 32, 128 and 256, and an .icns asks for 32 twice over - so
 * rendering per output rather than per size would draw a picture that a Mac
 * reads at two sizes three separate times.
 */
async function makeOne(item, decoded, want) {
  const storage = el.storageSelect.value;
  const options = { fit: el.fitSelect.value, background: background(), vector: decoded.vector };
  const sizes = sizeList();
  // The website set brings its own naming with it; see iconName.
  const website = presetId === 'website' || want.pack;

  /** @type {Map<number, HTMLCanvasElement>} */
  const drawn = new Map();
  for (const px of everySize()) {
    drawn.set(px, square(decoded.bitmap, decoded.width, decoded.height, px, options));
  }

  /** PNG bytes for a size, encoded at most once however many files want them. */
  const encoded = new Map();
  const pngFor = async (px) => {
    if (!encoded.has(px)) encoded.set(px, await png(drawn.get(px)));
    return encoded.get(px);
  };

  const outputs = [];
  const files = [];

  if (want.ico) {
    const entries = [];
    for (const px of sizes) {
      const kind = storageFor(px, storage);
      const data = kind === 'png' ? await pngFor(px) : dibEntry(pixels(drawn.get(px)));
      entries.push({ width: px, height: px, kind, data });
    }

    const ico = writeIco(entries);
    const name = iconName(item.file.name, 'ico', website);
    files.push({ name, data: ico });
    outputs.push({
      kind: 'ico',
      name,
      data: ico,
      // Read back out of the bytes that were just written rather than copied
      // from the plan that produced them. If a writer and the settings ever
      // disagreed, this is where it would show.
      entries: readIcoDirectory(ico).map((entry) => ({
        label: `${entry.width}px`,
        detail: entry.kind === 'png' ? 'PNG' : phrase('entry.uncompressed'),
        bytes: entry.bytes,
      })),
    });
  }

  if (want.icns) {
    const elements = [];
    for (const slot of ICNS_TYPES) {
      // Every slot is a PNG, and the same picture serves two of them wherever
      // Apple names one size as another size's Retina version. Encoded once.
      elements.push({ type: slot.type, data: await pngFor(slot.px) });
    }

    const icns = writeIcns(elements);
    const name = iconName(item.file.name, 'icns', website);
    files.push({ name, data: icns });
    outputs.push({
      kind: 'icns',
      name,
      data: icns,
      entries: readIcnsElements(icns).map((element) => ({
        label: `${element.px}px`,
        detail: element.type,
        bytes: element.bytes,
      })),
    });
  }

  for (const canvas of drawn.values()) {
    canvas.width = 0;
    canvas.height = 0;
  }

  if (want.pack) {
    for (const image of PACK_IMAGES) {
      const canvas = square(decoded.bitmap, decoded.width, decoded.height, image.px, {
        fit: options.fit,
        vector: options.vector,
        // An opaque file has to be opaque even when the user asked for
        // transparency, which is why this is not simply `options.background`.
        // The colour is theirs; the fact that iOS gets no alpha is not.
        background: image.opaque ? (options.background ?? '#ffffff') : options.background,
        inset: image.inset ?? 0,
      });
      files.push({ name: image.name, data: await png(canvas) });
      canvas.width = 0;
      canvas.height = 0;
    }

    const tile = options.background ?? '#ffffff';
    files.push(
      { name: 'site.webmanifest', data: text(manifest({ name: phrase('manifest.name'), background: tile, theme: tile })) },
      { name: 'browserconfig.xml', data: text(browserConfig(tile)) },
      { name: 'head.html', data: text(headSnippet(phrase)) },
      { name: 'README.txt', data: text(readme(iconName(item.file.name, 'ico', true), sizes, want.ico, phrase)) },
    );
  }

  return { item, outputs, files, packed: want.pack };
}

const encoder = new TextEncoder();
const text = (string) => encoder.encode(string);

function setProgress(fraction, label) {
  el.progressBar.style.width = `${Math.round(fraction * 100)}%`;
  el.progressLabel.textContent = label;
}

/* ------------------------------------------------------------ the results */

function renderResults() {
  el.resultList.replaceChildren();
  el.results.hidden = results.length === 0;
  if (!results.length) return;

  // One row per file written, rather than per picture: with both formats
  // ticked there are two downloads for one source, and a download button that
  // does not sit beside the thing it downloads is a button people misread.
  const rows = results.flatMap((result) => result.outputs.map((output) => ({ ...output, result })));
  const packed = results.some((result) => result.packed);
  const total = rows.reduce((n, row) => n + row.data.length, 0);

  el.resultsSummary.textContent = summarise(rows, total, packed);

  for (const row of rows) el.resultList.append(resultRow(row));

  // A single picture keeps its files at the top of the zip; a batch gets a
  // folder each, because two of them would otherwise both be favicon.ico and
  // one would quietly overwrite the other.
  const everything = results.flatMap((result) => (results.length === 1
    ? result.files
    : result.files.map((file) => ({ ...file, name: `${folderFor(result.item.file.name)}/${file.name}` }))));

  el.downloadZip.hidden = everything.length < 2;
  el.downloadZip.onclick = () => save(makeZip(everything), 'icons.zip');

  el.snippet.hidden = !packed;
  if (packed) el.snippetText.textContent = headSnippet(phrase);
}

/** The line above the rows, said in files rather than in settings. */
function summarise(rows, total, packed) {
  const said = results.length === 1
    ? summariseOne(rows, total)
    : phrase('results.batch', {
      count: countOf(results.length, 'image'),
      n: rows.length,
      size: humanBytes(total),
    });

  return packed ? phrase('results.andpack', { summary: said }) : said;
}

/** The one-picture case: one file named, or two named together. */
function summariseOne(rows, total) {
  const names = joinList(rows.map((row) => row.name), phrase, 'join.and');
  return rows.length === 1
    ? phrase('results.single',
      { name: names, slots: slotsIn(rows[0]), size: humanBytes(total) })
    : phrase('results.multi', { names, size: humanBytes(total) });
}

/**
 * "3 sizes" / "10 slots".
 *
 * An .icns is counted in slots rather than sizes because ten of them hold
 * seven pictures: Apple names some sizes twice, once as themselves and once as
 * the Retina version of the size below. Calling that "10 sizes" would be
 * describing a file that does not exist.
 */
const slotsIn = (row) =>
  countOf(row.entries.length, row.kind === 'icns' ? 'slot' : 'size');

function resultRow(row) {
  const item = row.result.item;
  const li = document.createElement('li');
  li.className = 'result-row';

  const textBlock = document.createElement('div');
  textBlock.className = 'result-text';

  const name = document.createElement('p');
  name.className = 'result-name';
  name.textContent = row.name;

  const headline = document.createElement('p');
  headline.className = 'result-headline';
  headline.textContent = phrase('result.head',
    { slots: slotsIn(row), size: humanBytes(row.data.length) });

  const detail = document.createElement('p');
  detail.className = 'result-detail';
  let said = phrase('result.from',
    { name: item.file.name, size: dimensions(item.width, item.height) });
  if (row.kind === 'icns') said = phrase('result.icns', { detail: said });
  if (row.result.packed && row.kind === 'ico') {
    said = phrase('result.plus',
      { detail: said, n: row.result.files.length - row.result.outputs.length });
  }
  detail.textContent = said;

  const list = document.createElement('ul');
  list.className = 'result-entries';
  for (const entry of row.entries) {
    const chip = document.createElement('li');
    chip.textContent = phrase('result.chip', {
      label: entry.label,
      detail: entry.detail,
      size: humanBytes(entry.bytes),
    });
    list.append(chip);
  }

  textBlock.append(name, headline, detail, list);

  const actions = document.createElement('div');
  actions.className = 'result-actions';

  const download = document.createElement('a');
  download.className = 'primary';
  download.textContent = phrase('result.download', { kind: row.kind });
  download.href = urlFor(new Blob([row.data], {
    type: row.kind === 'icns' ? 'image/icns' : 'image/x-icon',
  }));
  download.download = row.name;
  actions.append(download);

  li.append(textBlock, actions);
  return li;
}

function urlFor(blob) {
  const url = URL.createObjectURL(blob);
  resultUrls.push(url);
  return url;
}

function save(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  // Revoked late: revoking immediately can cancel a download that has not
  // started yet in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

function clearResults() {
  for (const url of resultUrls) URL.revokeObjectURL(url);
  resultUrls = [];
  results = [];
  el.results.hidden = true;
  el.snippet.hidden = true;
  el.resultList.replaceChildren();
  el.resultsSummary.textContent = '';
  // The zip button is hidden along with the panel, but its handler still holds
  // the files from the last run. Nothing can reach it there and it would still
  // be a set of stale blobs kept alive by a closure nobody can see.
  el.downloadZip.hidden = true;
  el.downloadZip.onclick = null;
}

el.copySnippet.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(headSnippet(phrase));
    el.copySnippet.textContent = phrase('copy.copied');
  } catch {
    // Clipboard access can be refused outright, and there is nothing to fix.
    // Selecting the block is a route that always works.
    const range = document.createRange();
    range.selectNodeContents(el.snippetText);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    el.copySnippet.textContent = phrase('copy.selected');
  }
  setTimeout(() => { el.copySnippet.textContent = phrase('copy.copy'); }, 2500);
});

/* ------------------------------------------------------------- the controls */

el.backgroundMode.addEventListener('change', () => {
  el.backgroundColour.hidden = isTransparent();
  clearResults();
  render();
  drawPreview();
});

for (const control of [el.backgroundColour, el.fitSelect, el.storageSelect]) {
  control.addEventListener('input', () => {
    clearResults();
    render();
    drawPreview();
  });
}

for (const box of [el.wantIco, el.wantIcns, el.wantPack]) {
  box.addEventListener('change', () => {
    clearResults();
    render();
    drawPreview();
  });
}

/* ------------------------------------------------------------------ errors */

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

buildPresets();
buildSizes();
render();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
