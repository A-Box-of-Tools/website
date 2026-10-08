/**
 * UI wiring and application state.
 *
 * The work is not here. Everything expensive happens in a worker - see
 * worker.js for why this is the first tool in this repository with one - and
 * this file's job is to hold the list of frames, keep the settings and the
 * predicted cost in step with each other, and turn the worker's progress
 * messages into sentences that came out of the markup rather than out of here.
 */

import { phrase } from './shared/phrases.js';
import { messageBox } from './shared/message-box.js';
import { wireFilePicker, readingLabel } from './shared/file-picker.js';
import { SCALES, outputSize, planRun, scaleThatFits } from './plan.js';
import { makeExample } from './example.js';

const $ = (id) => document.getElementById(id);

const el = {
  dropzone: $('dropzone'),
  fileInput: $('file-input'),
  toolbar: $('list-toolbar'),
  countLabel: $('count-label'),
  sortName: $('sort-name'),
  clearAll: $('clear-all'),
  reorderHint: $('reorder-hint'),
  list: $('frame-list'),
  framesPanel: $('frames-panel'),
  framesSummary: $('frames-summary'),

  mode: $('mode'),
  modeNote: $('mode-note'),
  align: $('align'),
  alignNote: $('align-note'),
  scale: $('scale'),
  scaleNote: $('scale-note'),
  kappaField: $('kappa-field'),
  kappa: $('kappa'),
  kappaValue: $('kappa-value'),
  radiusField: $('radius-field'),
  radius: $('radius'),
  radiusValue: $('radius-value'),
  gain: $('gain'),
  gainValue: $('gain-value'),
  gainNote: $('gain-note'),
  normalize: $('normalize'),
  format: $('format'),
  qualityRow: $('quality-row'),
  quality: $('quality'),
  qualityValue: $('quality-value'),

  plan: $('plan'),
  planOutput: $('plan-output'),
  planMemory: $('plan-memory'),
  planDecodes: $('plan-decodes'),
  planRead: $('plan-read'),
  planWarning: $('plan-warning'),
  planNote: $('plan-note'),

  run: $('run'),
  cancel: $('cancel'),
  progress: $('progress'),
  progressBar: $('progress-bar'),
  progressLabel: $('progress-label'),
  error: $('error'),
  result: $('result'),
  resultStale: $('result-stale'),
  resultFrame: $('result-frame'),
  viewSource: $('view-source'),
  viewSize: $('view-size'),
  viewerStatus: $('viewer-status'),
  alignmentList: $('alignment-list'),
  resultImage: $('result-image'),
  resultInfo: $('result-info'),
  resultMoves: $('result-moves'),
  download: $('download'),

  privacyToggle: $('privacy-toggle'),
  privacyPanel: $('privacy-panel'),
};

const { show: showError } = messageBox(el.error);

/** @type {{file: File, info: object|null, thumb: string|null, ok: boolean}[]} */
let frames = [];

/**
 * The frame everything else is measured against, held as the slot itself
 * rather than as a position in the list.
 *
 * It used to be whichever frame was first, and "use as reference" moved the
 * row it was pressed on to the top - so choosing what to align against
 * silently rearranged a list somebody had just sorted, and a set of forty
 * frames lost the order it was added in to a single click. The two are
 * separate now: this says which frame it is, and the order is the visitor's,
 * changed by dragging and by the sort button and by nothing else.
 *
 * Null until somebody chooses, which is most runs; `referenceSlot` reads that
 * as the first frame, which is what this tool has always done by default.
 */
let reference = null;
let busy = false;
let inspecting = 0;
let resultUrl = null;
let startedAt = 0;
let activeRequest = null;
let activeSlots = [];
let completed = null;
let referenceUrl = null;
let comparing = false;
let comparisonId = 0;
let collapsedOnPhone = false;
let localQueue = Promise.resolve();
let currentPlan = null;

/* ------------------------------------------------------------------ worker */

/**
 * The worker, made on first use and kept.
 *
 * A module worker is not universal - Firefox only gained them in 114 - so a
 * browser that refuses one runs the same pipeline on this thread instead. That
 * is a worse experience rather than a broken one: the page stops answering
 * while a band is being stacked, and everything still produces the same
 * picture. OffscreenCanvas is the harder requirement, and there is no fallback
 * for it because there is nothing to fall back to.
 */
let worker = null;
let local = null;

function ensureWorker() {
  if (worker || local) return;
  try {
    worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
    worker.addEventListener('message', (event) => handle(event.data));
    worker.addEventListener('error', () => {
      worker?.terminate();
      worker = null;
      local = import('./pipeline.js');
      for (const id of [...pending.keys()]) batchFailed(id);
      el.viewSource.value = 'result';
      finishComparison();
      finishRun();
      renderViewer();
      showError(phrase('error.unknown'));
    });
  } catch {
    local = import('./pipeline.js');
  }
}

/** Send one command, whichever of the two ways is available. */
async function send(message) {
  try {
    ensureWorker();
    if (worker) {
      worker.postMessage(message);
      return;
    }
    // The fallback must serialize inspection batches just as the worker does.
    // Otherwise two imports can draw over each other's temporary surfaces.
    localQueue = localQueue.then(async () => {
      const pipeline = await local;
      const hooks = {
        cancelled: () => cancelled,
        onProgress: (update) => handle({ type: 'progress', update }),
      };
      try {
        if (message.type === 'inspect') {
          handle({ type: 'inspected', id: message.id, found: await pipeline.inspect(message.files, hooks) });
        } else if (message.type === 'run') {
          handle({ type: 'done', result: await pipeline.runStack(message.request, hooks) });
        } else if (message.type === 'compare') {
          handle({ type: 'compared', id: message.id, result: await pipeline.compareReference(message.request, hooks) });
        }
      } catch (error) {
        handle(error instanceof pipeline.Cancelled
          ? { type: 'cancelled', id: message.id, kind: message.type }
          : { type: 'error', id: message.id, kind: message.type, message: String(error?.message ?? 'error.unknown') });
      }
    }).catch((error) => handle({ type: 'error', id: message.id, kind: message.type, message: String(error?.message ?? 'error.unknown') }));
    await localQueue;
  } catch (error) {
    handle({ type: 'error', id: message.id, kind: message.type, message: String(error?.message ?? 'error.unknown') });
  }
}

let cancelled = false;

function stopWork() {
  cancelled = true;
  if (worker) worker.postMessage({ type: 'cancel' });
}

/* ------------------------------------------------------------------- files */

/**
 * Set when the browser cannot do the drawing this tool is made of. Checked
 * before a file is looked at, not only before the run button is pressed.
 */
let unsupported = false;

const picker = wireFilePicker({
  input: el.fileInput,
  dropzone: el.dropzone,
  onFiles(chosen) {
    // Without OffscreenCanvas every frame fails to survey, and the survey
    // says so in the only words it has: "that could not be opened as a
    // picture and was left out". Which is a lie about the picture. It
    // replaced the accurate message this page put up on load, so a visitor
    // whose browser is too old was told their file was broken instead.
    //
    // So the files are not looked at at all. The message that was already
    // right stays on the page.
    if (unsupported) {
      showUnsupported();
      return;
    }
    addFiles(chosen);
  },
  example: makeExample,
});

let batch = 0;

/** Batches still being opened, so their answers can be matched back to them. */
const pending = new Map();

function addFiles(chosen) {
  // A run works from the list as it stood when it started, so adding to the
  // list would not corrupt it - but the worker is busy and the new files could
  // not be opened until it finished, which would leave rows sitting blank for
  // however long the stack takes. Saying so beats showing that.
  if (busy || comparing) {
    showError(phrase('error.busy'));
    return;
  }
  discardResult();
  const id = (batch += 1);
  inspecting += 1;
  picker.busy(readingLabel(chosen.length));

  // Placeholders go in straight away, so a set of forty files does not look
  // like nothing happened while they are being opened.
  const added = chosen.map((file) => ({ file, info: null, thumb: null, ok: true }));
  frames = frames.concat(added);
  render();

  cancelled = false;
  pending.set(id, added);
  send({ type: 'inspect', id, files: chosen });
}

/** One batch is finished with, however it finished. */
function batchDone(id) {
  const added = pending.get(id);
  if (!added) return null;
  pending.delete(id);
  inspecting -= 1;
  if (inspecting <= 0) {
    inspecting = 0;
    picker.done();
  }
  return added;
}

/**
 * A batch that did not come back at all.
 *
 * Its rows have nothing behind them, so they become removable failures
 * rather than staying stuck saying they are being read. Without this the drop
 * zone also never stops looking busy, which is the more visible half of the bug.
 */
function batchFailed(id) {
  const added = batchDone(id);
  if (!added) return;
  for (const slot of added) {
    slot.ok = false;
    slot.info = { name: slot.file.name };
  }
  render();
}

function inspected(id, found) {
  const added = batchDone(id);
  if (!added) return;

  found.forEach((result, index) => {
    const slot = added[index];
    if (!slot || !frames.includes(slot)) return;
    slot.ok = result.ok && Boolean(result.frame.width);
    slot.info = result.frame;
    slot.thumb = result.thumb ? URL.createObjectURL(result.thumb) : null;
  });

  const failed = added.filter((slot) => !slot.ok);
  if (failed.length) {
    showError(phrase('import.skipped', { count: failed.length }));
  }
  if (!reference || !ready().includes(reference)) reference = ready()[0] ?? null;
  if (!collapsedOnPhone && frames.length > 4 && matchMedia('(max-width: 544px)').matches) {
    el.framesPanel.open = false;
    collapsedOnPhone = true;
  }
  render();
}

function removeAt(index) {
  if (busy || comparing) return;
  discardResult();
  const [gone] = frames.splice(index, 1);
  if (gone?.thumb) URL.revokeObjectURL(gone.thumb);
  // Dropping the pointer as well as the row keeps the removed frame's File out
  // of memory; `referenceSlot` would have fallen back without this.
  if (gone === reference) reference = ready()[0] ?? null;
  render();
}

/** Mark a frame as the reference. The list keeps the order it had. */
function makeReference(index) {
  if (busy || comparing || !ready().includes(frames[index])) return;
  discardResult();
  reference = frames[index] ?? null;
  render();
}

/**
 * Move a frame within the list. Nothing else reorders it.
 *
 * The keyboard reaches this through the handle's arrow keys, so the handle in
 * the row's new position is focused afterwards: `render` has replaced every
 * row, and the element the key was pressed on no longer exists.
 */
function moveFrame(from, to) {
  if (busy || comparing || to < 0 || to >= frames.length || from === to) return;
  const [moved] = frames.splice(from, 1);
  frames.splice(to, 0, moved);
  render();
  el.list.children[to]?.querySelector('.drag-handle')?.focus();
}

function clearAll() {
  if (busy || comparing) return;
  discardResult();
  for (const slot of frames) if (slot.thumb) URL.revokeObjectURL(slot.thumb);
  frames = [];
  reference = null;
  collapsedOnPhone = false;
  el.framesPanel.open = true;
  render();
}

/* ------------------------------------------------------------------ render */

const bytes = (n) => {
  if (!Number.isFinite(n)) return '';
  if (n >= 1024 * 1024 * 1024) return `${(n / 1024 / 1024 / 1024).toFixed(1)} GB`;
  if (n >= 1024 * 1024) return `${Math.round(n / 1024 / 1024)} MB`;
  if (n >= 1024) return `${Math.round(n / 1024)} KB`;
  return `${n} B`;
};

function render() {
  renderList();
  renderSettings();
  renderPlan();
  const locked = busy || comparing;
  for (const control of [el.fileInput, el.sortName, el.clearAll, el.mode, el.align,
    el.scale, el.kappa, el.radius, el.gain, el.format, el.quality,
    ...el.list.querySelectorAll('button')]) control.disabled = locked;
  el.viewSource.disabled = comparing;
  el.run.disabled = unsupported || locked || inspecting > 0 || ready().length < 2 || Boolean(currentPlan?.overBudget);
  el.normalize.disabled = locked || inspecting > 0 || ready().length < 2;
}

/** The frames that are opened and usable. */
const ready = () => frames.filter((slot) => slot.ok && slot.info?.width);

/**
 * Which frame is the reference right now.
 *
 * A chosen one can be removed, or turn out not to be a picture and be taken
 * out of the list by the survey, and the first frame is the answer until
 * somebody chooses at all. Both cases land on the same fallback rather than on
 * a badge that has gone missing.
 */
const referenceSlot = () => (
  reference && ready().includes(reference) ? reference : ready()[0] ?? null
);

function renderList() {
  el.toolbar.hidden = frames.length === 0;
  el.reorderHint.hidden = frames.length < 2;
  el.countLabel.textContent = frames.length === 0
    ? phrase('count.none')
    : phrase(frames.length === 1 ? 'count.one' : 'count.many', { count: frames.length });

  const chosen = referenceSlot();
  el.framesPanel.hidden = frames.length === 0;
  el.framesSummary.textContent = chosen?.ok && chosen.info?.width
    ? phrase('frames.summary', { frames: el.countLabel.textContent, name: chosen.file.name })
    : el.countLabel.textContent;
  el.list.replaceChildren(...frames.map((slot, index) => row(slot, index, slot === chosen)));
}

function row(slot, index, isReference) {
  const item = document.createElement('li');
  item.className = slot.ok ? 'frame-row' : 'frame-row is-invalid';
  if (isReference) item.classList.add('is-reference');

  const label = slot.info?.name ?? slot.file.name;
  item.append(dragHandle(label, index));

  const thumb = document.createElement('img');
  thumb.className = 'frame-thumb';
  thumb.alt = '';
  if (slot.thumb) thumb.src = slot.thumb;
  item.append(thumb);

  const body = document.createElement('div');
  body.className = 'frame-body';

  const name = document.createElement('p');
  name.className = 'frame-name';
  name.textContent = label;
  body.append(name);

  const detail = document.createElement('p');
  detail.className = 'frame-detail';
  detail.textContent = describe(slot);
  body.append(detail);

  if (slot.info?.kind === 'raw' && slot.info.bytesRead) {
    const read = document.createElement('p');
    read.className = 'frame-read';
    read.textContent = phrase('frame.read', {
      read: bytes(slot.info.bytesRead), total: bytes(slot.info.sourceBytes),
    });
    body.append(read);
  }

  item.append(body);

  const actions = document.createElement('div');
  actions.className = 'frame-actions';

  if (isReference) {
    const badge = document.createElement('span');
    badge.className = 'frame-badge';
    badge.textContent = phrase('frame.reference');
    actions.append(badge);
  } else if (slot.ok && slot.info?.width) {
    const promote = document.createElement('button');
    promote.type = 'button';
    promote.className = 'ghost';
    promote.textContent = phrase('frame.make-reference');
    promote.addEventListener('click', () => makeReference(index));
    actions.append(promote);
  }

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'ghost danger';
  remove.textContent = phrase('frame.remove');
  remove.addEventListener('click', () => removeAt(index));
  actions.append(remove);

  item.append(actions);
  wireDrag(item, index);
  return item;
}

/* -------------------------------------------------------------- reordering */

/** The row being dragged, and where it would land: `{ index, after }`. */
let dragIndex = null;
let dropAt = null;

function clearDropMarkers() {
  for (const node of el.list.querySelectorAll('.insert-before, .insert-after')) {
    node.classList.remove('insert-before', 'insert-after');
  }
}

/**
 * The grip, which is both what a pointer drags and how a keyboard reorders.
 *
 * A handle rather than the whole row: each row carries two buttons, and a row
 * that is itself draggable turns pressing one into a gamble on whether the
 * pointer moved a few pixels first. Dragging is also the one gesture that has
 * no keyboard at all, which is why this is a button and answers the arrow
 * keys - a list nobody can reorder without a mouse is not reorderable.
 */
function dragHandle(label, index) {
  const handle = document.createElement('button');
  handle.type = 'button';
  handle.className = 'drag-handle';
  handle.draggable = true;
  handle.textContent = '⋮⋮'; // two vertical ellipses, a grip
  const said = phrase('frame.move', { name: label });
  handle.title = said;
  handle.setAttribute('aria-label', said);

  handle.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    // Otherwise the page scrolls as well, and the row being moved walks off
    // the screen a keypress at a time.
    event.preventDefault();
    moveFrame(index, event.key === 'ArrowUp' ? index - 1 : index + 1);
  });

  return handle;
}

function wireDrag(item, index) {
  const handle = item.querySelector('.drag-handle');

  handle.addEventListener('dragstart', (event) => {
    dragIndex = index;
    item.classList.add('dragging');
    event.dataTransfer.effectAllowed = 'move';
    // Firefox refuses to start a drag unless some data is set.
    event.dataTransfer.setData('text/plain', String(index));
    // The whole row follows the pointer. Without this it is the grip that
    // does, which says nothing about what is being moved.
    event.dataTransfer.setDragImage(item, 24, item.offsetHeight / 2);
  });

  handle.addEventListener('dragend', () => {
    dragIndex = null;
    dropAt = null;
    item.classList.remove('dragging');
    clearDropMarkers();
  });

  item.addEventListener('dragover', (event) => {
    if (dragIndex === null) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';

    // Which half of the row the pointer is in decides where the frame lands,
    // so the marker reads as "it goes here" rather than "it swaps with this".
    const rect = item.getBoundingClientRect();
    const after = event.clientY > rect.top + rect.height / 2;

    clearDropMarkers();
    item.classList.add(after ? 'insert-after' : 'insert-before');
    dropAt = { index, after };
  });

  item.addEventListener('drop', (event) => {
    event.preventDefault();
    event.stopPropagation();
    applyDrop();
  });
}

/** Move the dragged frame to wherever the marker sits. */
function applyDrop() {
  if (dragIndex === null || dropAt === null) {
    clearDropMarkers();
    return;
  }

  let target = dropAt.after ? dropAt.index + 1 : dropAt.index;
  // Taking the row out first shifts everything below it up by one.
  if (dragIndex < target) target -= 1;

  const from = dragIndex;
  dragIndex = null;
  dropAt = null;
  clearDropMarkers();
  moveFrame(from, target);
}

function describe(slot) {
  const info = slot.info;
  if (!info) return phrase('progress.survey', { name: slot.file.name });
  if (!slot.ok) return phrase('frame.unreadable');
  if (info.kind === 'raw-unreadable') return phrase('frame.raw-unreadable');
  if (info.kind === 'raw') {
    return info.camera
      ? phrase('frame.raw-camera', { camera: info.camera, width: info.width, height: info.height })
      : phrase('frame.raw', { width: info.width, height: info.height });
  }
  return phrase('frame.size', { width: info.width, height: info.height });
}

function renderSettings() {
  const mode = el.mode.value;
  const count = Math.max(ready().length, 1);

  el.modeNote.textContent = phrase(`mode.${mode}`, {
    count,
    factor: Math.sqrt(count).toFixed(1),
  });
  el.alignNote.textContent = phrase(`align.${el.align.value}`);
  el.scaleNote.textContent = phrase('scale.note');

  el.kappaField.hidden = mode !== 'sigma';
  el.radiusField.hidden = mode !== 'focus';
  el.kappaValue.textContent = `${Number(el.kappa.value).toFixed(1)}σ`;
  el.radiusValue.textContent = `${el.radius.value} px`;
  el.gainValue.textContent = `${Number(Number(el.gain.value).toPrecision(4))}×`;
  el.normalize.hidden = mode !== 'sum';
  el.qualityValue.textContent = String(Math.round(Number(el.quality.value) * 100));
  el.qualityRow.hidden = el.format.value !== 'jpeg';

  el.gainNote.textContent = mode === 'sum' && ready().length > 1
    ? phrase('gain.sum-note', { count, suggested: Number((1 / count).toPrecision(4)) })
    : phrase('gain.note');
}

function renderPlan() {
  currentPlan = null;
  const usable = ready();
  if (usable.length < 2) {
    el.plan.hidden = true;
    el.planNote.hidden = true;
    el.planWarning.hidden = true;
    return;
  }

  const mode = el.mode.value;
  const scale = SCALES[el.scale.value] ?? 1;
  const sizes = usable.map((slot) => slot.info);
  const surveyDecodePixels = Math.max(...sizes.map((info) => info.surveyDecodePixels ?? info.width * info.height));
  const output = outputSize(sizes, scale);
  if (!output) {
    el.plan.hidden = true;
    return;
  }

  const plan = planRun({
    width: output.width, height: output.height, frames: usable.length, mode,
    radius: Number(el.radius.value), align: el.align.value, surveyDecodePixels,
  });

  currentPlan = plan;
  el.plan.hidden = false;
  el.planNote.hidden = false;
  el.planOutput.textContent = phrase('plan.output', {
    width: output.width, height: output.height,
  });
  el.planMemory.textContent = phrase('plan.memory', {
    mb: Math.round(plan.peak / 1024 / 1024),
  });

  let decodes = 'plan.decodes.simple';
  if (plan.banded) decodes = 'plan.decodes.banded';
  else if (plan.passes > 1) decodes = 'plan.decodes.passes';
  el.planDecodes.textContent = phrase(decodes, {
    count: plan.decodes, passes: plan.passes, bands: plan.bands,
  });

  // What the RAW previews cost to find, against what the files weigh. This is
  // the figure the whole approach is justified by, so it is on the page rather
  // than in the README.
  const read = usable.reduce((sum, slot) => sum + (slot.info.bytesRead ?? 0), 0);
  const total = usable.reduce((sum, slot) => sum + (slot.info.sourceBytes ?? 0), 0);
  el.planRead.textContent = phrase('plan.read', { read: bytes(read), total: bytes(total) });

  if (plan.overBudget) {
    el.planWarning.textContent = phrase('plan.too-large');
    el.planWarning.hidden = false;
  } else if (plan.banded) {
    // Asked at the frames' own size, because a scale is what is being chosen.
    // Taking the widest frame and the tallest separately would ask about a
    // picture that does not exist whenever the set mixes shapes.
    const natural = outputSize(sizes, 1);
    const better = scaleThatFits({ ...natural, frames: usable.length, mode, radius: Number(el.radius.value), align: el.align.value, surveyDecodePixels });
    const suggestion = better && better !== el.scale.value
      ? el.scale.querySelector(`option[value="${better}"]`)?.textContent?.split('—')[0]?.trim()
      : null;
    el.planWarning.textContent = suggestion
      ? phrase('plan.banded', { bands: plan.bands, suggested: suggestion })
      : phrase('plan.banded-anyway', { bands: plan.bands });
    el.planWarning.hidden = false;
  } else {
    el.planWarning.hidden = true;
  }
}

/* --------------------------------------------------------------------- run */

function start() {
  if (busy || comparing || inspecting || unsupported) return;
  if (currentPlan?.overBudget) {
    showError(phrase('plan.too-large'));
    return;
  }
  if (!el.gain.checkValidity()) {
    el.gain.reportValidity();
    return;
  }
  const usable = ready();
  if (usable.length < 2) {
    showError(phrase('error.one.frame'));
    return;
  }

  // The pipeline measures every frame against the first file it is handed and
  // refines against that one's windows, so the reference is what goes first -
  // whatever position its row occupies here. Nothing else about the order
  // reaches the result: every method combines the frames as a set, so a
  // median is a median whichever way round they arrive.
  //
  // A frame still being opened cannot be the reference, because a run wants
  // its size, so the fallback is the same one `referenceSlot` uses.
  const chosen = referenceSlot();
  const first = usable.includes(chosen) ? chosen : usable[0];
  const ordered = [first, ...usable.filter((slot) => slot !== first)];

  discardResult(false);
  activeSlots = ordered;
  busy = true;
  cancelled = false;
  startedAt = performance.now();
  el.error.hidden = true;
  el.result.hidden = true;
  el.cancel.hidden = false;
  el.progress.hidden = false;
  el.progressBar.style.width = '0%';
  el.progressLabel.textContent = '';
  render();

  activeRequest = {
    files: ordered.map((slot) => slot.file),
    mode: el.mode.value,
    align: el.align.value,
    scale: SCALES[el.scale.value] ?? 1,
    kappa: Number(el.kappa.value),
    gain: Number(el.gain.value),
    radius: Number(el.radius.value),
    format: el.format.value,
    quality: Number(el.quality.value),
  };
  send({ type: 'run', request: activeRequest });
}

function handle(message) {
  if (!message) return;
  switch (message.type) {
    case 'inspected':
      inspected(message.id, message.found);
      break;
    case 'progress':
      progress(message.update);
      break;
    case 'done':
      finished(message.result);
      break;
    case 'compared':
      compared(message.id, message.result);
      break;
    case 'cancelled':
      if (message.kind === 'compare') finishComparison();
      else if (pending.has(message.id)) batchFailed(message.id);
      else finishRun();
      break;
    case 'error':
      showError(resolve(message.message));
      if (message.kind === 'compare') {
        el.viewSource.value = 'result';
        finishComparison();
        renderViewer();
      } else if (pending.has(message.id)) batchFailed(message.id);
      else finishRun();
      break;
    default:
      break;
  }
}

/**
 * A message from the worker is either a phrase key this tool wrote or a
 * browser's own text. A key resolves; anything else comes back unchanged, and
 * showing the browser's words is better than replacing them with a shrug.
 */
function resolve(message) {
  if (/^[a-z]+\.[a-z.-]+$/.test(message)) {
    const found = phrase(`error.${message.replace(/^error\./, '')}`);
    if (!found.startsWith('error.')) return found;
  }
  if (/quota|memory|allocat/i.test(message)) return phrase('error.memory');
  return message || phrase('error.unknown');
}

function progress(update) {
  if (!update || !busy) return;
  if (update.stage === 'planned') return;

  const total = update.total || 1;
  const done = update.done ?? 0;
  el.progressBar.style.width = `${Math.min(100, Math.round((done / total) * 100))}%`;

  if (update.stage === 'stack') {
    el.progressLabel.textContent = update.bands > 1
      ? phrase('progress.stack-banded', {
        band: update.band, bands: update.bands, done, total,
      })
      : phrase('progress.stack', { done, total });
    return;
  }
  el.progressLabel.textContent = phrase(`progress.${update.stage}`, { name: update.name ?? '' });
}

function finished(result) {
  completed = { ...result, request: activeRequest, slots: activeSlots };
  finishRun();
  if (resultUrl) URL.revokeObjectURL(resultUrl);
  resultUrl = URL.createObjectURL(result.blob);

  el.viewSource.value = 'result';
  el.viewSize.value = 'fit';
  el.resultImage.width = result.width;
  el.resultImage.height = result.height;
  renderViewer();
  el.download.href = resultUrl;
  el.download.download = `stacked.${result.blob.type === 'image/jpeg' ? 'jpg' : 'png'}`;
  el.resultInfo.textContent = phrase('result.info', {
    width: result.width,
    height: result.height,
    size: bytes(result.blob.size),
    count: result.frames.length,
    seconds: ((performance.now() - startedAt) / 1000).toFixed(1),
  });

  el.resultMoves.textContent = movesNote(result.moves, completed.request.align)
    + (result.cropped ? ` ${phrase('result.cropped')}` : '');
  renderAlignment(result, completed.request.align);
  el.resultStale.hidden = true;
  el.result.hidden = false;
}

/**
 * What the alignment actually managed, in one sentence.
 *
 * Worth saying. A stack that came out soft because four frames could not be
 * measured looks exactly like a stack that came out soft for any other reason,
 * and the tool is the only one that knows which it was.
 */
function movesNote(moves, alignment) {
  if (alignment === 'none') return phrase('result.moves-none');
  const measurable = moves.slice(1);
  // The pipeline decided, and an unmeasured frame is sitting at the identity,
  // so "left where they were" is a report and not a hope.
  const weak = measurable.filter((move) => move.measured === false).length;
  const clamped = measurable.filter((move) => move.clamped).length;

  if (weak) {
    return phrase('result.moves-some', { count: weak, total: moves.length });
  }
  if (clamped) return phrase('result.moves-clamped', { count: clamped });
  return phrase('result.moves');
}

function finishRun() {
  activeRequest = null;
  activeSlots = [];
  busy = false;
  el.cancel.hidden = true;
  el.progress.hidden = true;
  render();
}

/** The exported picture belongs to its input snapshot, including the reference. */
function discardResult(notice = true) {
  const hadResult = Boolean(completed);
  completed = null;
  activeRequest = null;
  activeSlots = [];
  comparisonId += 1;
  if (resultUrl) URL.revokeObjectURL(resultUrl);
  if (referenceUrl) URL.revokeObjectURL(referenceUrl);
  resultUrl = null;
  referenceUrl = null;
  el.result.hidden = true;
  el.resultImage.removeAttribute('src');
  el.download.removeAttribute('href');
  el.alignmentList.replaceChildren();
  if (!notice) el.resultStale.hidden = true;
  else if (hadResult) el.resultStale.hidden = false;
}

function renderAlignment(result, alignment) {
  el.alignmentList.replaceChildren(...result.frames.map((frame, index) => {
    const move = result.moves[index];
    const item = document.createElement('li');
    const name = document.createElement('strong');
    name.textContent = frame.name;
    const detail = document.createElement('span');
    const status = index === 0 ? 'reference' : alignment === 'none' ? 'none'
      : move.measured === false ? 'weak' : move.clamped ? 'clamped'
        : move.refine === 'partial' ? 'partial' : 'aligned';
    detail.textContent = phrase(`alignment.${status}`);
    if (index > 0 && alignment !== 'none' && move.measured !== false) {
      detail.textContent += ` — ${phrase('alignment.offset', {
        dx: move.dx.toFixed(2), dy: move.dy.toFixed(2),
        angle: move.angle.toFixed(3), scale: move.scale.toFixed(4),
      })}`;
    }
    item.append(name, detail);
    if (status === 'weak') {
      const slot = completed.slots[index];
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'ghost danger';
      remove.textContent = phrase('alignment.remove');
      remove.addEventListener('click', () => {
        const at = frames.indexOf(slot);
        if (at >= 0) removeAt(at);
      });
      item.append(remove);
    }
    return item;
  }));
}

function renderViewer() {
  if (!completed) return;
  const isReference = el.viewSource.value === 'reference' && referenceUrl;
  el.resultImage.src = isReference ? referenceUrl : resultUrl;
  el.resultImage.alt = el.viewSource.querySelector(`option[value="${isReference ? 'reference' : 'result'}"]`).textContent;
  el.resultFrame.classList.toggle('actual-size', el.viewSize.value === 'actual');
  el.viewerStatus.textContent = comparing ? phrase('viewer.loading')
    : isReference ? phrase('viewer.reference', { name: completed.request.files[0].name })
      : phrase('viewer.result');
}

function compare() {
  if (!completed || comparing) return;
  if (el.viewSource.value !== 'reference' || referenceUrl) {
    renderViewer();
    return;
  }
  comparing = true;
  cancelled = false;
  const id = ++comparisonId;
  render();
  renderViewer();
  send({ type: 'compare', id, request: { file: completed.request.files[0], ...completed.comparison } });
}

function compared(id, result) {
  if (id !== comparisonId || !completed) return;
  referenceUrl = URL.createObjectURL(result.blob);
  finishComparison();
  renderViewer();
}

function finishComparison() {
  comparing = false;
  render();
}

/* ------------------------------------------------------------------ events */

el.run.addEventListener('click', start);
el.cancel.addEventListener('click', stopWork);
el.clearAll.addEventListener('click', clearAll);
el.viewSource.addEventListener('change', compare);
el.viewSize.addEventListener('change', renderViewer);
el.normalize.addEventListener('click', () => {
  if (busy || comparing || inspecting > 0 || ready().length < 2) return;
  el.gain.value = String(1 / ready().length);
  discardResult();
  renderSettings();
});

// Dropping in the gaps between rows should still land somewhere sensible
// rather than being swallowed by the window, which navigates to a dropped file.
el.list.addEventListener('dragover', (event) => {
  if (dragIndex !== null) event.preventDefault();
});
el.list.addEventListener('drop', (event) => {
  if (dragIndex === null) return;
  event.preventDefault();
  applyDrop();
});

el.sortName.addEventListener('click', () => {
  if (busy || comparing) return;
  frames.sort((a, b) => (a.info?.name ?? a.file.name)
    .localeCompare(b.info?.name ?? b.file.name, undefined, { numeric: true }));
  render();
});

for (const control of [el.mode, el.align, el.scale, el.format]) {
  control.addEventListener('change', () => {
    if (busy || comparing) return;
    discardResult();
    render();
  });
}
for (const control of [el.kappa, el.radius, el.gain, el.quality]) {
  control.addEventListener('input', () => {
    if (busy || comparing) return;
    discardResult();
    if (control === el.radius) render();
    else renderSettings();
  });
}

el.privacyToggle.addEventListener('click', () => {
  const open = el.privacyPanel.hidden;
  el.privacyPanel.hidden = !open;
  el.privacyToggle.setAttribute('aria-expanded', String(open));
});

/* -------------------------------------------------------------------- boot */

window.addEventListener('error', (event) => {
  showError(phrase('error.broke', { detail: event.message }));
});
window.addEventListener('unhandledrejection', (event) => {
  showError(phrase('error.broke', { detail: event.reason?.message ?? event.reason }));
});

/** The one thing this tool cannot work around, said the same way every time. */
function showUnsupported() {
  showError(phrase('error.unsupported'));
}

if (typeof OffscreenCanvas !== 'function') {
  // There is no fallback for this one. Every surface in the pipeline is an
  // OffscreenCanvas, because the work happens off the main thread and a
  // document canvas cannot go there.
  unsupported = true;
  showUnsupported();
  el.run.disabled = true;
}

render();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
