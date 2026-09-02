/** UI wiring and application state. */

import { phrase } from './shared/phrases.js';
import { measureImage } from './shared/media.js';
import { saveBlob } from './shared/download.js';
import { messageBox } from './shared/message-box.js';
import {
  decode, encodableTypes, release, FORMATS, JPEG, PNG, WEBP, READABLE,
} from './codecs.js';
import {
  fitToTarget, keepFormat, alternativeFormat, QUALITY_FLOOR,
} from './compress.js';
import { wireFilePicker, readingLabel } from './shared/file-picker.js';
import { compare, hasTransparency } from './measure.js';
import {
  bytes, targetBytes, dimensions, outName, change, matchText, psnrText,
} from './files.js';
import { makeZip } from './shared/zip.js';

const $ = (id) => document.getElementById(id);

/**
 * Resolve what files.js hands back.
 *
 * That module is imported by the tests straight off the disk, so it cannot
 * import phrases.js - the path it would import only exists inside a built
 * tool - and it returns the key of a phrase and the blanks to fill it with
 * instead of a sentence. This is where the sentence is looked up.
 */
const say = (saying) => (saying ? phrase(saying.key, saying.values) : '');

/** The same, for the one that is always a size. */
const humanBytes = (n) => say(bytes(n));

const el = {
  dropzone: $('dropzone'),
  fileInput: $('file-input'),
  fileList: $('file-list'),
  listToolbar: $('list-toolbar'),
  countLabel: $('count-label'),
  clearAll: $('clear-all'),
  loadError: $('load-error'),
  targetValue: $('target-value'),
  targetUnit: $('target-unit'),
  presets: $('presets'),
  targetSummary: $('target-summary'),
  formatSelect: $('format-select'),
  allowResize: $('allow-resize'),
  formatNote: $('format-note'),
  compressAll: $('compress-all'),
  cancel: $('cancel'),
  progress: $('progress'),
  progressBar: $('progress-bar'),
  progressLabel: $('progress-label'),
  results: $('results'),
  resultList: $('result-list'),
  downloadZip: $('download-zip'),
  resultsSummary: $('results-summary'),
  privacyToggle: $('privacy-toggle'),
  privacyPanel: $('privacy-panel'),
};

const { show: showLoadError, clear: clearLoadError } = messageBox(el.loadError);

/**
 * @typedef {object} Item
 * @property {number} id
 * @property {File} file
 * @property {string} thumbUrl an object URL, revoked when the item is dropped
 * @property {{width: number, height: number}|null} size in pixels
 */

/** @type {Item[]} */
let items = [];
let nextId = 1;
let busy = false;
let stopping = false;

/** Everything the run produced, kept so the rows can be redrawn and the zip
 *  built without compressing anything twice. */
let results = [];

/** Object URLs handed to download links and previews. Revoked as a set when
 *  the results are replaced; holding a dozen decoded copies of somebody's
 *  photo library alive is how a browser tab ends up using two gigabytes. */
let resultUrls = [];

/** Which formats this browser will actually write. Filled in at boot. */
let writable = new Set([JPEG, PNG]);

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

  picker.busy(readingLabel(files.length));

  const failures = [];

  try {
    for (const file of files) {
      if (!isImage(file)) {
        failures.push(phrase('load.unreadable', { name: file.name }));
        continue;
      }

      const item = {
        id: nextId,
        file,
        thumbUrl: URL.createObjectURL(file),
        size: null,
      };
      nextId += 1;

      // The thumbnail decode doubles as the measurement, so the picture is
      // read once here and not again until it is actually compressed.
      item.size = await measureImage(item.thumbUrl);
      if (!item.size) {
        URL.revokeObjectURL(item.thumbUrl);
        failures.push(phrase('load.undecodable', { name: file.name }));
        continue;
      }

      items.push(item);
    }
  } finally {
    picker.done();
  }

  if (failures.length) showLoadError(failures.join('\n'));
  else clearLoadError();

  clearResults();
  render();
}

/** Types the browser is likely to decode. An empty type means the platform did
 *  not recognise the file; the decode below is the real test either way. */
function isImage(file) {
  if (!file.type) return /\.(jpe?g|png|webp|gif|bmp|avif)$/i.test(file.name);
  return READABLE.includes(file.type) || file.type.startsWith('image/');
}


function removeItem(id) {
  const at = items.findIndex((i) => i.id === id);
  if (at < 0) return;
  URL.revokeObjectURL(items[at].thumbUrl);
  items.splice(at, 1);
  clearResults();
  render();
}

el.clearAll.addEventListener('click', () => {
  for (const item of items) URL.revokeObjectURL(item.thumbUrl);
  items = [];
  clearResults();
  clearLoadError();
  render();
});

/* --------------------------------------------------------------- rendering */

/*
  Everything below builds DOM nodes and sets textContent. Nothing that came out
  of a file - a name above all - is ever put through innerHTML. File names are
  chosen by whoever made the file, and some of them contain markup precisely
  because pages like this one exist.
*/

function render() {
  const any = items.length > 0;
  el.listToolbar.hidden = !any;
  // Held off during a run for the same reason each row's remove button is: the
  // run iterates the list, and emptying it mid-way would hand back results for
  // files whose thumbnails have already been revoked.
  el.clearAll.disabled = busy;
  el.countLabel.textContent = any
    ? phrase(items.length === 1 ? 'list.count.one' : 'list.count.many',
      { count: items.length, size: humanBytes(totalBytes()) })
    : '';
  // The button's state belongs to renderTargetSummary, which runs last here.
  renderList();
  renderTargetSummary();
  renderFormatNote();
}

const totalBytes = () => items.reduce((n, i) => n + i.file.size, 0);

function renderList() {
  el.fileList.replaceChildren();

  for (const item of items) {
    const li = document.createElement('li');
    li.className = 'file-row';

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
      FORMATS[item.file.type]?.label ?? (item.file.type || 'image').replace('image/', '').toUpperCase(),
      humanBytes(item.file.size),
      item.size ? dimensions(item.size.width, item.size.height) : null,
    ].filter(Boolean).join(' · ');
    text.appendChild(sub);

    const target = targetBytes(el.targetValue.value, el.targetUnit.value);
    if (target && item.file.size <= target) {
      const note = document.createElement('p');
      note.className = 'file-note';
      note.textContent = phrase('row.under');
      text.appendChild(note);
    }

    main.appendChild(text);
    li.appendChild(main);

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'row-remove';
    const takeOff = phrase('row.remove', { name: item.file.name });
    remove.title = takeOff;
    remove.setAttribute('aria-label', takeOff);
    remove.textContent = '×';
    remove.disabled = busy;
    remove.addEventListener('click', () => removeItem(item.id));
    li.appendChild(remove);

    el.fileList.appendChild(li);
  }
}

/**
 * The target, restated as the sentence the button is about to act on.
 *
 * This owns whether the button is live, rather than sharing that with render():
 * a field can go from empty to valid without anything being added or removed,
 * and a button left disabled after the number was fixed is the kind of dead end
 * people do not report, they just leave.
 */
function renderTargetSummary() {
  const target = targetBytes(el.targetValue.value, el.targetUnit.value);
  el.compressAll.disabled = !target || !items.length || busy;

  if (!target) {
    el.targetSummary.textContent = phrase('target.none');
    el.targetSummary.className = 'field-summary warn';
    return;
  }

  el.targetSummary.className = 'field-summary';

  const over = items.filter((i) => i.file.size > target).length;
  const under = items.length - over;
  const size = humanBytes(target);

  if (!items.length) {
    el.targetSummary.textContent = phrase('target.empty', { size });
    return;
  }

  if (items.length === 1) {
    el.targetSummary.textContent = phrase(over ? 'target.single.over' : 'target.single.under',
      { size });
    return;
  }

  // Two halves and the sentence that joins them, rather than one string built
  // by concatenation: how many are over the target and how many are under it
  // are separate plurals, and their order is not the same in every language.
  const overPart = phrase(over === 1 ? 'target.over.one' : 'target.over.many',
    { over, total: items.length, size });
  el.targetSummary.textContent = under === 0
    ? phrase('target.summary', { over: overPart })
    : phrase('target.summary.rest', {
      over: overPart,
      rest: phrase(under === 1 ? 'target.rest.one' : 'target.rest.many', { count: under }),
    });
}

function renderFormatNote() {
  const choice = el.formatSelect.value;
  const resize = el.allowResize.checked;

  const key = {
    auto: 'format.auto',
    keep: 'format.keep',
    [JPEG]: 'format.jpeg',
    [WEBP]: 'format.webp',
    [PNG]: 'format.png',
  }[choice];

  el.formatNote.textContent = phrase('format.note', {
    format: key ? phrase(key) : '',
    sizing: phrase(resize ? 'format.resize.on' : 'format.resize.off'),
  }).trim();
}

/* ------------------------------------------------------------- the options */

/*
  Any change to the settings throws away the results below.

  It costs somebody a download link they might still have wanted, and it is
  still the right call: the summary under the button says things like "every
  image is under the target", and leaving that sentence on screen beside a
  target it is no longer true of would be the one dishonest line on the page.
*/
for (const control of [el.targetValue, el.targetUnit]) {
  control.addEventListener('input', () => {
    clearResults();
    renderList();
    renderTargetSummary();
  });
}

for (const control of [el.formatSelect, el.allowResize]) {
  control.addEventListener('change', () => {
    clearResults();
    renderFormatNote();
  });
}

el.presets.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-bytes]');
  if (!button) return;
  const amount = Number(button.dataset.bytes);
  const unit = amount >= 1024 * 1024 ? 'MB' : 'KB';
  el.targetValue.value = String(amount / (unit === 'MB' ? 1024 * 1024 : 1024));
  el.targetUnit.value = unit;
  clearResults();
  renderList();
  renderTargetSummary();
});

/* ----------------------------------------------------------- the main event */

el.compressAll.addEventListener('click', async () => {
  const target = targetBytes(el.targetValue.value, el.targetUnit.value);
  if (!target || !items.length || busy) return;

  busy = true;
  stopping = false;
  clearResults();
  clearLoadError();
  render();
  el.progress.hidden = false;
  el.cancel.hidden = false;

  const collected = [];
  const failures = [];
  let stopped = false;

  try {
    for (const [index, item] of items.entries()) {
      if (stopping) { stopped = true; break; }
      showProgress(index, items.length, item.file.name, 'step.reading');
      try {
        collected.push(await compressOne(item, target, (step, values) => {
          // The search calls back between attempts, so Cancel is felt inside a
          // picture rather than only between two of them - which on a large
          // photograph is the difference between stopping and watching it
          // finish.
          if (stopping) throw new DOMException('Cancelled', 'AbortError');
          showProgress(index, items.length, item.file.name, step, values);
        }));
      } catch (error) {
        if (error?.name === 'AbortError') { stopped = true; break; }
        // Through phrase() because compress.js throws the key of a sentence
        // when it gives up. Anything else - a real message from the encoder -
        // is a key phrase() does not know, and comes back out unchanged.
        failures.push(`${item.file.name}: ${phrase(error.message, error.values)}`);
      }
      // One turn of the event loop between images, so the progress bar is a
      // progress bar rather than a thing that appears finished at the end.
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  } finally {
    busy = false;
    stopping = false;
    el.cancel.hidden = true;
    // Left up after a stop, so that pressing Cancel and watching the bar
    // vanish does not read as nothing having happened.
    el.progress.hidden = !stopped;
    render();
  }

  if (stopped) {
    el.progressLabel.textContent = collected.length
      ? phrase('progress.stopped', { done: collected.length, total: items.length })
      : phrase('progress.stopped.none');
  }
  if (failures.length) showLoadError(failures.join('\n'));
  // What finished is kept. One file per picture means a run stopped halfway
  // still leaves half of them done, and dropping those would be taking work
  // back off somebody who only asked it to stop.
  results = collected;
  showResults();
});

el.cancel.addEventListener('click', () => { stopping = true; });

function showProgress(index, total, name, step, values) {
  const done = index / total;
  el.progressBar.style.width = `${Math.round(done * 100)}%`;
  el.progressLabel.textContent = phrase('progress.at', {
    at: index + 1, total, name, step: phrase(step, values),
  });
}

/**
 * Compress one image.
 *
 * The order of the checks here is the tool's whole argument about quality, so
 * it is worth reading in one go:
 *
 *   - A file already under the target is returned as it arrived. Not re-saved,
 *     not re-encoded, not "optimised": handed back byte for byte, because the
 *     best possible version of a file that already fits is the file.
 *   - Otherwise the search in compress.js finds the cheapest way to fit.
 *   - On "auto", if fitting cost real quality - a resize, or a quality below
 *     the floor - the same search runs again in WebP and the two results are
 *     compared by measurement, not by rule of thumb. The better-looking one
 *     wins, and if the original format wins a tie it keeps the tie.
 *   - Whatever comes out is then measured against the original, so the row can
 *     say what the compression cost rather than promising it was small.
 */
async function compressOne(item, target, onStep) {
  const base = {
    item,
    name: item.file.name,
    before: item.file.size,
    size: item.size,
  };

  if (item.file.size <= target) {
    return {
      ...base,
      blob: item.file,
      after: item.file.size,
      mime: item.file.type || JPEG,
      untouched: true,
      fitted: true,
      width: item.size?.width ?? 0,
      height: item.size?.height ?? 0,
      outName: item.file.name,
    };
  }

  onStep('step.decoding');
  const source = await decode(item.file);

  try {
    const alpha = hasTransparency(source.bitmap, source);
    const choice = el.formatSelect.value;
    const allowResize = el.allowResize.checked;

    const firstMime = choice === 'auto' || choice === 'keep'
      ? keepFormat(item.file.type, writable)
      : choice;

    let winner = await fitToTarget(source, {
      targetBytes: target, mime: firstMime, allowResize, onStep,
    });
    let winnerScore = await score(source, winner);
    // The winner's own count is the length of the search that produced it. The
    // row says how many times this picture was encoded in total, including a
    // search that was tried and thrown away, because that is the honest answer
    // to "what did this cost my laptop".
    let encodes = winner.encodes;

    // Only "auto" is allowed to change the extension, and only when keeping it
    // actually cost something. A tool that quietly hands back a .webp when a
    // .jpg would have been fine is not being clever, it is being surprising.
    const compromised = winner.resized || winner.quality < QUALITY_FLOOR + 0.001 || !winner.fitted;
    if (choice === 'auto' && compromised) {
      const other = alternativeFormat(firstMime, writable, alpha);
      if (other) {
        onStep('step.trying', { format: FORMATS[other].label });
        const rival = await fitToTarget(source, {
          targetBytes: target, mime: other, allowResize, onStep,
        });
        const rivalScore = await score(source, rival);
        encodes += rival.encodes;
        if (isBetter(rival, rivalScore, winner, winnerScore)) {
          winner = rival;
          winnerScore = rivalScore;
        }
      }
    }

    return {
      ...base,
      blob: winner.blob,
      after: winner.blob.size,
      mime: winner.mime,
      quality: winner.quality,
      width: winner.width,
      height: winner.height,
      resized: winner.resized,
      fitted: winner.fitted,
      encodes,
      changedFormat: winner.mime !== firstMime,
      match: winnerScore,
      untouched: false,
      outName: outName(item.file.name, winner.mime),
    };
  } finally {
    release(source.bitmap);
  }
}

/** Decode a candidate and measure it against the original it came from. */
async function score(source, candidate) {
  let decoded;
  try {
    decoded = await decode(candidate.blob);
  } catch {
    return null;
  }
  try {
    return compare(source.bitmap, decoded.bitmap, source);
  } finally {
    release(decoded.bitmap);
  }
}

/**
 * Is the challenger the better result?
 *
 * Meeting the target comes first - a prettier file that missed the budget is
 * not a better answer to "make it fit". After that it is the measurement, with
 * a small margin: SSIM differences under a couple of thousandths are noise,
 * and on a tie the format the visitor's file arrived in keeps its place.
 */
function isBetter(challenger, challengerScore, holder, holderScore) {
  if (challenger.fitted !== holder.fitted) return challenger.fitted;
  if (!challengerScore || !holderScore) return false;
  return challengerScore.ssim > holderScore.ssim + 0.002;
}

/* ---------------------------------------------------------------- results */

function clearResults() {
  for (const url of resultUrls) URL.revokeObjectURL(url);
  resultUrls = [];
  results = [];
  el.resultList.replaceChildren();
  el.results.hidden = true;
  el.downloadZip.hidden = true;
  el.resultsSummary.textContent = '';
}

function showResults() {
  el.resultList.replaceChildren();
  if (!results.length) return;

  el.results.hidden = false;

  for (const result of results) {
    el.resultList.appendChild(resultRow(result));
  }

  const before = results.reduce((n, r) => n + r.before, 0);
  const after = results.reduce((n, r) => n + r.after, 0);
  const missed = results.filter((r) => !r.fitted).length;

  el.resultsSummary.textContent = missed
    ? phrase(missed === 1 ? 'results.missed.one' : 'results.missed.many',
      { before: humanBytes(before), after: humanBytes(after), count: missed })
    : phrase('results.all', {
      before: humanBytes(before), after: humanBytes(after), change: say(change(before, after)),
    });

  el.downloadZip.hidden = results.length < 2;
  el.downloadZip.onclick = async () => {
    el.downloadZip.disabled = true;
    try {
      const files = await Promise.all(results.map(async (r) => ({
        name: r.outName,
        data: new Uint8Array(await r.blob.arrayBuffer()),
      })));
      saveBlob(makeZip(files), 'compressed-images.zip');
    } finally {
      el.downloadZip.disabled = false;
    }
  };
}

function resultRow(result) {
  const li = document.createElement('li');
  li.className = 'result-row';
  if (!result.fitted) li.classList.add('result-missed');
  if (result.untouched) li.classList.add('result-untouched');

  const text = document.createElement('div');
  text.className = 'result-text';

  const name = document.createElement('p');
  name.className = 'result-name';
  name.textContent = result.outName;
  text.appendChild(name);

  const headline = document.createElement('p');
  headline.className = 'result-headline';
  headline.textContent = result.untouched
    ? phrase('row.headline.untouched', { size: humanBytes(result.before) })
    : phrase('row.headline', {
      before: humanBytes(result.before),
      after: humanBytes(result.after),
      change: say(change(result.before, result.after)),
    });
  text.appendChild(headline);

  const detail = document.createElement('p');
  detail.className = 'result-detail';
  detail.textContent = describe(result);
  text.appendChild(detail);

  if (result.match) {
    const match = document.createElement('p');
    match.className = 'result-match';
    match.textContent = phrase('row.match', {
      match: say(matchText(result.match.ssim)),
      ssim: result.match.ssim.toFixed(3),
      psnr: say(psnrText(result.match.psnr)),
    });
    text.appendChild(match);
  }

  if (!result.fitted) {
    const warn = document.createElement('p');
    warn.className = 'result-warn';
    warn.textContent = phrase('row.missed');
    text.appendChild(warn);
  }

  li.appendChild(text);

  const actions = document.createElement('div');
  actions.className = 'result-actions';

  const url = URL.createObjectURL(result.blob);
  resultUrls.push(url);

  const link = document.createElement('a');
  link.className = 'primary as-button';
  link.href = url;
  link.download = result.outName;
  link.textContent = phrase('row.download');
  actions.appendChild(link);

  if (!result.untouched) {
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'ghost';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = phrase('row.compare');
    actions.appendChild(toggle);

    const panel = comparePanel(result, url);
    panel.hidden = true;
    li.appendChild(panel);

    toggle.addEventListener('click', () => {
      panel.hidden = !panel.hidden;
      toggle.setAttribute('aria-expanded', String(!panel.hidden));
      toggle.textContent = phrase(panel.hidden ? 'row.compare' : 'row.hide');
    });
  }

  li.appendChild(actions);
  return li;
}

/** One sentence saying exactly what was done to this picture, and at what. */
function describe(result) {
  if (result.untouched) return phrase('detail.untouched');

  const label = FORMATS[result.mime]?.label ?? result.mime;
  const lossy = FORMATS[result.mime]?.lossy;

  // The clauses go in as blanks and the commas belong to the sentence around
  // them, because a language whose list separator is not a comma has to be
  // able to say so - and one with no quality dial has no clause to separate.
  return phrase(lossy ? 'detail.line.quality' : 'detail.line', {
    format: phrase(result.changedFormat ? 'detail.format.changed' : 'detail.format',
      { format: label }),
    quality: lossy ? result.quality.toFixed(2) : '',
    size: result.resized
      ? phrase('detail.resized', {
        to: dimensions(result.width, result.height),
        from: dimensions(result.size.width, result.size.height),
      })
      : phrase('detail.full', { size: dimensions(result.width, result.height) }),
    encodes: phrase(result.encodes === 1 ? 'detail.encodes.one' : 'detail.encodes.many',
      { count: result.encodes }),
  });
}

/** Original and result, side by side and the same size on screen. */
function comparePanel(result, resultUrl) {
  const panel = document.createElement('div');
  panel.className = 'compare';

  for (const [label, src, note] of [
    [phrase('compare.original'), result.item.thumbUrl, phrase('compare.note', {
      size: humanBytes(result.before),
      dimensions: dimensions(result.size.width, result.size.height),
    })],
    [phrase('compare.compressed'), resultUrl, phrase('compare.note', {
      size: humanBytes(result.after),
      dimensions: dimensions(result.width, result.height),
    })],
  ]) {
    const figure = document.createElement('figure');
    figure.className = 'compare-side';

    const img = document.createElement('img');
    img.src = src;
    img.alt = phrase('compare.alt', { label, name: result.name });
    img.loading = 'lazy';
    figure.appendChild(img);

    const caption = document.createElement('figcaption');
    const strong = document.createElement('strong');
    strong.textContent = label;
    caption.appendChild(strong);
    caption.appendChild(document.createTextNode(` ${note}`));
    figure.appendChild(caption);

    panel.appendChild(figure);
  }

  const hint = document.createElement('p');
  hint.className = 'compare-hint';
  hint.textContent = phrase('compare.hint');
  panel.appendChild(hint);

  return panel;
}

/* ------------------------------------------------------------------ errors */

/* ------------------------------------------------- privacy panel + offline */

el.privacyToggle.addEventListener('click', () => {
  const open = el.privacyPanel.hidden;
  el.privacyPanel.hidden = !open;
  el.privacyToggle.setAttribute('aria-expanded', String(open));
});

/** Take WebP off the format menu on a browser that cannot write it. */
async function checkEncoders() {
  writable = await encodableTypes();
  if (writable.has(WEBP)) return;

  for (const option of el.formatSelect.options) {
    if (option.value === WEBP) {
      option.disabled = true;
      option.textContent = phrase('format.webp.unavailable');
    }
  }
  if (el.formatSelect.value === WEBP) el.formatSelect.value = 'auto';
  renderFormatNote();
}

/* -------------------------------------------------------------------- boot */

// An error thrown after boot would otherwise only reach the console, leaving
// the page looking functional but doing nothing.
window.addEventListener('error', (event) => {
  showLoadError(phrase('error.broke', { detail: event.message }));
});
window.addEventListener('unhandledrejection', (event) => {
  showLoadError(phrase('error.broke', { detail: event.reason?.message ?? event.reason }));
});

render();
checkEncoders();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
