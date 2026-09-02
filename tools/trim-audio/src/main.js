/** UI wiring and application state. */

import { phrase } from './shared/phrases.js';
import { sizeText } from './shared/format.js';
import { messageBox } from './shared/message-box.js';
import { wireFilePicker } from './shared/file-picker.js';
import { decodeAudio, UnreadableFile } from './shared/audio-decode.js';
import {
  formatDuration, openSegment, readTimestamps, segmentRanges, totalCaptured,
  writeTimestamps,
} from './segments.js';
import { Timeline, formatTime, parseTime } from './timeline.js';
import {
  invertRanges, isUntouched, planSections, sectionFrames, totalSeconds, trim,
} from './trim.js';
import { writeWav, wavSize } from './shared/wav.js';
import { drawWaveform, summarise } from './waveform.js';

const $ = (id) => document.getElementById(id);

const el = {
  dropzone: $('dropzone'),
  fileInput: $('file-input'),
  source: $('source'),
  srcName: $('src-name'),
  srcSize: $('src-size'),
  srcLength: $('src-length'),
  srcFormat: $('src-format'),
  srcRate: $('src-rate'),
  pathNote: $('path-note'),

  sectionCard: $('section-card'),
  editing: $('editing'),
  timeline: $('timeline'),
  tlNow: $('tl-now'),
  tlTotal: $('tl-total'),
  preview: $('preview'),
  play: $('play'),
  back5: $('back-5'),
  forward5: $('forward-5'),
  markIn: $('mark-in'),
  markOut: $('mark-out'),
  undo: $('undo'),
  speedRow: document.querySelector('.speed-row'),

  segmentTable: $('segment-table'),
  segmentRows: $('segment-rows'),
  segmentsEmpty: $('segments-empty'),
  segmentCount: $('segment-count'),
  totalKept: $('total-kept'),
  addSegment: $('add-segment'),
  resetSegments: $('reset-segments'),
  importMarks: $('import-marks'),
  marksInput: $('marks-input'),
  marksFormat: $('marks-format'),
  exportMarks: $('export-marks'),

  exportCard: $('export-card'),
  depth: $('depth'),
  fade: $('fade'),
  fadeNote: $('fade-note'),
  sumParts: $('sum-parts'),
  sumLength: $('sum-length'),
  sumStart: $('sum-start'),
  sumJoins: $('sum-joins'),
  sumSound: $('sum-sound'),
  sumSize: $('sum-size'),
  cutNote: $('cut-note'),
  exportBtn: $('export'),
  cancelBtn: $('cancel'),
  progress: $('progress'),
  progressBar: $('progress-bar'),
  progressLabel: $('progress-label'),
  error: $('error'),
  result: $('result'),
  outWave: $('out-wave'),
  resultAudio: $('result-audio'),
  resultInfo: $('result-info'),
  download: $('download'),

  privacyToggle: $('privacy-toggle'),
  privacyPanel: $('privacy-panel'),
};

const { show: showError, clear: clearError } = messageBox(el.error);
const formatBytes = (n) => sizeText(n, phrase, { under: 'size.b', kb: 1, mb: 1, gb: 'size.gb' });

/** @type {File|null} */
let file = null;
/** What shared/audio-decode.js handed back, or null before a file is chosen. */
let source = null;
/** The waveform, summarised once when the file is opened. See waveform.js. */
let summary = null;
/** @type {{id: number, start: number, end: number|null}[]} */
let segments = [];
let selectedSegment = null;
let nextId = 1;

/** 'keep' the marked parts, or 'cut' them out and keep the rest. */
let mode = 'keep';

let exporting = false;
let abortController = null;
let previewUrl = null;
let resultUrl = null;
/** The samples that came out of the last trim, kept only so the picture of
 *  them can be drawn again when the window changes size. */
let lastOut = null;

/** Where the playhead is, in seconds. */
let playAt = 0;
/** Set while one part is being auditioned, so playback stops at its end. */
let watchUntil = null;

const timeline = new Timeline(el.timeline, {
  t: phrase,
  onSeek: (at) => seekTo(at),
  onSelect: (id) => { selectedSegment = id; renderSegments(); },
  onAdjust: (id, times) => adjustSegment(id, times),
});

/* ------------------------------------------------------------------ adding */

// The drop zone and the picker: shared, because every tool here needs the
// same one. src/shared/file-picker.js, copied in from shared/js/ by the build.
const picker = wireFilePicker({
  input: el.fileInput,
  dropzone: el.dropzone,
  onFiles(files) {
    const [picked] = files;
    if (picked) loadFile(picked);
  },
});

async function loadFile(picked) {
  if (exporting) return;
  clearError();
  clearResult();
  picker.busy(phrase('read.reading'));

  try {
    // Everything below happens here, on this machine. There is no upload step
    // to leave out: the file is handed to the browser's own decoder and the
    // samples come back into this page's memory.
    const decoded = await decodeAudio(picked);
    file = picked;
    source = decoded;
    summary = summarise(decoded.channels);
    segments = [];
    selectedSegment = null;
    nextId = 1;
    playAt = 0;
    watchUntil = null;

    showSource();

    timeline.setSource({ duration: decoded.duration, summary });
    timeline.setEnabled(true);
    renderSegments();
  } catch (error) {
    // shared/audio-decode.js throws a key; a browser that failed for its own reasons
    // throws a sentence, and phrase() hands back what it does not know.
    if (error instanceof UnreadableFile) showError(phrase(error.message));
    else {
      showError(phrase('read.failed', { why: phrase(error?.message ?? String(error)) }));
      console.error(error);
    }
  } finally {
    picker.done();
  }
}

function showSource() {
  el.srcName.textContent = file.name;
  el.srcSize.textContent = formatBytes(file.size);
  el.srcLength.textContent = formatDuration(source.duration);
  el.srcFormat.textContent = phrase('src.format', {
    channels: channelWord(source.channels.length),
    khz: (source.sampleRate / 1000).toFixed(1),
  });
  el.srcRate.textContent = phrase(source.guessedRate ? 'src.rate.assumed' : 'src.rate.file',
    { rate: source.sampleRate });
  el.source.hidden = false;

  el.editing.hidden = false;
  el.editing.textContent = file.name;
  el.tlTotal.textContent = formatTime(source.duration);
  el.tlNow.textContent = formatTime(0);

  el.pathNote.hidden = !source.guessedRate;
  if (source.guessedRate) {
    el.pathNote.textContent = phrase('src.guessednote');
  }

  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = URL.createObjectURL(file);
  el.preview.src = previewUrl;
  el.preview.playbackRate = activeSpeed();
}

/* ------------------------------------------------------------ the playhead */

function seekTo(seconds) {
  if (!source) return;
  const at = Math.max(0, Math.min(seconds, source.duration));
  watchUntil = null;
  playAt = at;
  el.preview.currentTime = at;
  timeline.setPlayhead(at);
  el.tlNow.textContent = formatTime(at);
}

function currentTime() {
  return source ? el.preview.currentTime : 0;
}

/**
 * The playhead, driven by a frame loop rather than by `timeupdate`.
 *
 * `timeupdate` fires about four times a second, which is fine for a scrubber
 * and useless for marking: the band you are drawing with `i` would jump in
 * quarter-second steps, and the time you press `o` at could be a quarter of a
 * second stale. A frame loop costs nothing while paused because it is not
 * running then.
 */
let ticking = 0;

function tick() {
  if (!source || el.preview.paused) { ticking = 0; return; }
  const at = el.preview.currentTime;
  playAt = at;
  timeline.setPlayhead(at);
  el.tlNow.textContent = formatTime(at);

  if (watchUntil !== null && at >= watchUntil) {
    el.preview.pause();
    watchUntil = null;
  }
  ticking = requestAnimationFrame(tick);
}

el.preview.addEventListener('play', () => {
  el.play.textContent = '❚❚';
  if (!ticking) ticking = requestAnimationFrame(tick);
});

el.preview.addEventListener('pause', () => {
  el.play.textContent = '▶';
  // One last reading, so the playhead lands where the sound actually stopped
  // rather than wherever the previous frame left it.
  playAt = el.preview.currentTime;
  timeline.setPlayhead(playAt);
  el.tlNow.textContent = formatTime(playAt);
});

el.preview.addEventListener('seeked', () => {
  if (el.preview.paused) {
    playAt = el.preview.currentTime;
    timeline.setPlayhead(playAt);
    el.tlNow.textContent = formatTime(playAt);
  }
});

function togglePlay() {
  if (!source) return;
  watchUntil = null;
  if (el.preview.paused) el.preview.play().catch(() => {});
  else el.preview.pause();
}

el.play.addEventListener('click', togglePlay);
el.back5.addEventListener('click', () => seekTo(currentTime() - 5));
el.forward5.addEventListener('click', () => seekTo(currentTime() + 5));

const activeSpeed = () => Number(el.speedRow.querySelector('.speed.active')?.dataset.speed ?? 1);

el.speedRow.addEventListener('click', (event) => {
  const button = event.target.closest('.speed');
  if (!button) return;
  for (const other of el.speedRow.querySelectorAll('.speed')) {
    other.classList.toggle('active', other === button);
  }
  el.preview.playbackRate = Number(button.dataset.speed);
});

/* ------------------------------------------------------------- the marking */

/**
 * `i`: open a part here.
 *
 * Pressing it again while one is still open moves that start rather than
 * opening a second - which is what you want when you meant to mark the run-up
 * and pressed a beat too early.
 */
function markIn() {
  if (!source) return;
  const at = timeline.snap(currentTime());
  const open = openSegment(segments);

  if (open) open.start = at;
  else segments.push({ id: nextId++, start: at, end: null });

  selectedSegment = segments[segments.length - 1].id;
  clearError();
  renderSegments();
}

/** `o`: close the last part here. */
function markOut() {
  if (!source) return;
  const last = segments[segments.length - 1];
  if (!last) {
    showError(phrase('mark.noopen'));
    return;
  }

  const at = timeline.snap(currentTime());
  if (at <= last.start) {
    showError(phrase('mark.beforestart',
      { at: formatTime(at), start: formatTime(last.start) }));
    return;
  }

  last.end = at;
  selectedSegment = last.id;
  clearError();
  renderSegments();
}

/** `u`: take the last one back. */
function undoSegment() {
  if (!segments.length) return;
  segments.pop();
  selectedSegment = segments.length ? segments[segments.length - 1].id : null;
  renderSegments();
}

el.markIn.addEventListener('click', markIn);
el.markOut.addEventListener('click', markOut);
el.undo.addEventListener('click', undoSegment);

el.addSegment.addEventListener('click', () => {
  if (!source) return;
  const start = timeline.snap(currentTime());
  const end = Math.min(source.duration, start + Math.min(5, source.duration - start));
  if (end - start < 0.05) {
    showError(phrase('mark.noroom'));
    return;
  }
  segments.push({ id: nextId++, start, end });
  selectedSegment = segments[segments.length - 1].id;
  renderSegments();
});

el.resetSegments.addEventListener('click', () => {
  if (!segments.length) return;
  // eslint-disable-next-line no-alert
  if (!window.confirm(phrase(segments.length === 1 ? 'mark.clearone' : 'mark.clearall',
    { n: segments.length, name: file.name }))) return;
  segments = [];
  selectedSegment = null;
  renderSegments();
});

function adjustSegment(id, { start, end }) {
  const segment = segments.find((one) => one.id === id);
  if (!segment) return;
  segment.start = start;
  segment.end = end;
  renderSegments();
}

/* ---------------------------------------------------------- the parts table */

function renderSegments() {
  const finished = segmentRanges(segments);

  el.segmentTable.hidden = segments.length === 0;
  el.segmentsEmpty.hidden = segments.length > 0;
  el.segmentRows.innerHTML = '';

  el.segmentCount.textContent = segments.length === 0
    ? phrase('parts.none')
    : phrase('parts.count', { finished: finished.length, total: segments.length });
  el.totalKept.textContent = formatTime(
    mode === 'keep' && finished.length ? totalCaptured(segments) : totalSeconds(ranges()));

  segments.forEach((segment, index) => {
    const row = document.createElement('tr');
    row.className = `segment${segment.id === selectedSegment ? ' selected' : ''}`;
    if (segment.end === null) row.classList.add('open');
    row.addEventListener('click', () => {
      selectedSegment = segment.id;
      renderSegments();
    });

    const number = document.createElement('td');
    number.className = 'col-index';
    number.textContent = String(index + 1);

    row.append(
      number,
      timeCell(segment, 'start'),
      timeCell(segment, 'end'),
      lengthCell(segment),
      actionsCell(segment, index),
    );
    el.segmentRows.append(row);
  });

  timeline.setSegments(segments, selectedSegment);
  timeline.setPending(openSegment(segments)?.start ?? null);
  updateSummary();
}

/** A start or an end, typed as freely as it is read. */
function timeCell(segment, which) {
  const cell = document.createElement('td');
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'segment-time';
  input.inputMode = 'decimal';
  input.spellcheck = false;
  input.autocomplete = 'off';
  input.setAttribute('aria-label', which === 'start' ? 'Start time' : 'End time');
  input.value = segment[which] === null ? '' : formatTime(segment[which]);
  input.placeholder = which === 'end' ? 'press O' : '';

  const commit = () => {
    const seconds = parseTime(input.value);
    if (seconds === null) {
      input.value = segment[which] === null ? '' : formatTime(segment[which]);
      return;
    }
    const at = Math.max(0, Math.min(seconds, source.duration));
    if (which === 'start' && segment.end !== null && at >= segment.end) {
      input.value = formatTime(segment.start);
      return;
    }
    if (which === 'end' && at <= segment.start) {
      input.value = segment.end === null ? '' : formatTime(segment.end);
      return;
    }
    segment[which] = at;
    renderSegments();
  };

  input.addEventListener('change', commit);
  input.addEventListener('blur', commit);
  cell.append(input);
  return cell;
}

function lengthCell(segment) {
  const cell = document.createElement('td');
  cell.className = 'segment-length';
  cell.textContent = segment.end === null ? '—' : formatTime(segment.end - segment.start);
  return cell;
}

function actionsCell(segment, index) {
  const cell = document.createElement('td');
  cell.className = 'segment-buttons';
  cell.append(
    iconButton('▶', phrase('btn.play'), () => playSegment(segment), segment.end === null),
    iconButton('↑', phrase('btn.up'), () => moveSegment(index, -1), index === 0),
    iconButton('↓', phrase('btn.down'), () => moveSegment(index, 1),
      index === segments.length - 1),
    iconButton('✕', phrase('btn.remove'), () => removeSegment(index), false, 'danger'),
  );
  return cell;
}

function iconButton(label, title, onClick, disabled = false, extra = '') {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `ghost segment-button ${extra}`.trim();
  button.textContent = label;
  button.title = title;
  button.setAttribute('aria-label', title);
  button.disabled = disabled;
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    onClick();
  });
  return button;
}

function playSegment(segment) {
  if (!source || segment.end === null) return;
  el.preview.currentTime = segment.start;
  watchUntil = segment.end;
  selectedSegment = segment.id;
  el.preview.play().catch(() => {});
  renderSegments();
}

function moveSegment(index, by) {
  const to = index + by;
  if (to < 0 || to >= segments.length) return;
  const [moved] = segments.splice(index, 1);
  segments.splice(to, 0, moved);
  renderSegments();
}

function removeSegment(index) {
  const [gone] = segments.splice(index, 1);
  if (selectedSegment === gone.id) {
    selectedSegment = segments.length
      ? segments[Math.min(index, segments.length - 1)].id
      : null;
  }
  renderSegments();
}

/* -------------------------------------------------------- saving the marks */

el.exportMarks.addEventListener('click', () => {
  if (!source) return;
  if (!segmentRanges(segments).length) {
    showError(phrase('marks.nothing'));
    return;
  }

  const text = writeTimestamps(segments, {
    format: el.marksFormat.value,
    name: file.name,
  });
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${file.name.replace(/\.[^.]+$/, '')}-marks.txt`;
  link.click();
  // Revoked on the next turn of the loop: the click has to have been handled
  // before the URL stops meaning anything.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

el.importMarks.addEventListener('click', () => el.marksInput.click());

el.marksInput.addEventListener('change', async () => {
  const [marks] = el.marksInput.files ?? [];
  el.marksInput.value = '';
  if (!marks || !source) return;

  try {
    const parsed = readTimestamps(await marks.text());
    const kept = parsed.segments.filter((segment) => segment.start < source.duration);

    if (!kept.length) {
      showError(phrase('marks.allpast', { name: marks.name }));
      return;
    }

    segments = kept.map((segment) => ({
      id: nextId++,
      start: segment.start,
      end: Math.min(segment.end, source.duration),
    }));
    selectedSegment = segments[segments.length - 1].id;
    el.marksFormat.value = parsed.format;

    // Nothing to say when the whole file loaded: the rows appearing is the
    // report. The box below is red, and red should mean something went wrong.
    const dropped = parsed.segments.length - kept.length;
    clearError();
    if (dropped || parsed.skipped) {
      // One sentence per number rather than three ternaries inside one: the
      // verb agrees with the count in most of these languages, and so does
      // the pronoun. The join is a phrase too, because ja and zh do not put
      // a space after a full stop.
      const says = [];
      if (dropped) {
        says.push(phrase(dropped === 1 ? 'marks.dropped.one' : 'marks.dropped.many',
          { n: dropped, name: marks.name }));
      }
      if (parsed.skipped) {
        says.push(phrase(parsed.skipped === 1 ? 'marks.skipped.one' : 'marks.skipped.many',
          { n: parsed.skipped }));
      }
      says.push(phrase('marks.loaded', { n: kept.length }));
      showError(says.reduce((a, b) => phrase('join.sentences', { a, b })));
    }
    renderSegments();
  } catch (error) {
    showError(phrase('marks.failed',
      { name: marks.name, why: phrase(error.message) }));
  }
});

/* --------------------------------------------------------------- shortcuts */

/** True while the keyboard belongs to something that takes typing. */
function typing(target) {
  return target instanceof HTMLInputElement
    || target instanceof HTMLTextAreaElement
    || target instanceof HTMLSelectElement
    || target?.isContentEditable;
}

window.addEventListener('keydown', (event) => {
  if (el.sectionCard.hidden || exporting) return;
  if (typing(event.target) || event.metaKey || event.ctrlKey || event.altKey) return;

  const key = event.key.toLowerCase();

  if (key === 'i') {
    event.preventDefault();
    markIn();
  } else if (key === 'o') {
    event.preventDefault();
    markOut();
  } else if (key === 'u') {
    event.preventDefault();
    undoSegment();
  } else if (event.key === ' ' && !(event.target instanceof HTMLButtonElement)) {
    event.preventDefault();
    togglePlay();
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault();
    seekTo(currentTime() - (event.shiftKey ? timeline.fineStep : 5));
  } else if (event.key === 'ArrowRight') {
    event.preventDefault();
    seekTo(currentTime() + (event.shiftKey ? timeline.fineStep : 5));
  }
});

/* -------------------------------------------------------------- the output */

/** The parts of the recording the marks and the chosen mode come down to. */
function ranges() {
  if (!source) return [];
  const marked = segmentRanges(segments);
  if (mode === 'cut') return invertRanges(marked, source.duration);
  return marked.length ? marked : [{ start: 0, end: source.duration }];
}

/** The same, as runs of samples with the fades already placed on them. */
function sections() {
  if (!source) return [];
  return planSections(ranges(), {
    sampleRate: source.sampleRate,
    totalFrames: source.frames,
    fadeSeconds: Number(el.fade.value),
  });
}

document.querySelectorAll('input[name="mode"]').forEach((radio) => {
  radio.addEventListener('change', () => {
    mode = radio.value;
    renderSegments();
  });
});

el.depth.addEventListener('change', updateSummary);
el.fade.addEventListener('change', updateSummary);

/**
 * The six lines that say what pressing the button will produce.
 *
 * All of it is arithmetic on numbers already known - where the marks are, how
 * many samples that is, what a WAV of that shape weighs - so it can be
 * recomputed on every keystroke without touching a sample.
 */
function updateSummary() {
  if (!source) return;
  const planned = sections();
  const bits = Number(el.depth.value);
  const fadeSeconds = Number(el.fade.value);

  if (!planned.length) {
    el.exportBtn.disabled = true;
    el.sumParts.textContent = phrase(mode === 'cut' ? 'sum.nothing.cut' : 'sum.nothing');
    el.sumLength.textContent = phrase('sum.zero');
    el.sumStart.textContent = '—';
    el.sumJoins.textContent = '—';
    el.sumSound.textContent = '—';
    el.sumSize.textContent = '—';
    el.cutNote.hidden = true;
    el.fadeNote.textContent = fadeNote(fadeSeconds, 0);
    return;
  }

  el.exportBtn.disabled = false;

  const frames = sectionFrames(planned);
  const count = planned.length;
  const parts = phrase(count === 1 ? 'n.part.one' : 'n.part.many', { n: count });
  el.sumParts.textContent = mode === 'cut'
    ? phrase('sum.parts.cut', { parts })
    : parts;
  el.sumLength.textContent = formatDuration(frames / source.sampleRate);

  // Where the result begins. On the video cutter this is the line that has to
  // apologise for keyframes; here it is the line that gets to say there is
  // nothing to apologise for.
  el.sumStart.textContent = phrase('sum.start',
    { sample: planned[0].from.toLocaleString() });

  const joins = count - 1;
  const faded = planned.reduce(
    (total, section) => total + (section.fadeIn ? 1 : 0) + (section.fadeOut ? 1 : 0), 0);
  if (joins === 0) {
    el.sumJoins.textContent = phrase(faded ? 'sum.onepart.faded' : 'sum.onepart');
  } else {
    const said = phrase(joins === 1 ? 'n.join.one' : 'n.join.many', { n: joins });
    el.sumJoins.textContent = faded
      ? phrase('sum.joins.faded', {
        joins: said,
        edges: phrase(faded === 1 ? 'n.edge.one' : 'n.edge.many', { n: faded }),
      })
      : phrase('sum.joins.nofades', { joins: said });
  }

  el.sumSound.textContent = phrase('sum.sound', {
    channels: channelWord(source.channels.length),
    khz: (source.sampleRate / 1000).toFixed(1),
    depth: phrase(bits === 32 ? 'depth.float' : 'depth.16'),
  });
  el.sumSize.textContent = formatBytes(wavSize(frames, source.channels.length, bits));

  el.fadeNote.textContent = fadeNote(fadeSeconds, faded);

  // The one claim worth making loudly, and only when it is true.
  const untouched = isUntouched(planned, source.frames);
  el.cutNote.hidden = !untouched;
  if (untouched) {
    el.cutNote.textContent = phrase('sum.untouched');
  }
}

function fadeNote(fadeSeconds, edges) {
  if (!fadeSeconds) return phrase('fade.none');
  const values = {
    ms: Math.round(fadeSeconds * 1000),
    samples: Math.round(fadeSeconds * (source?.sampleRate ?? 48000)).toLocaleString(),
  };
  // Whole sentences rather than a clause tacked on: where the count goes in
  // a sentence is the sentence's own business, not this file's.
  if (!edges) return phrase('fade.some', values);
  return phrase(edges === 1 ? 'fade.some.oneedge' : 'fade.some.edges',
    { ...values, n: edges });
}

/* ------------------------------------------------------------------ export */

async function runExport() {
  if (!source || exporting) return;
  clearError();
  clearResult();

  const planned = sections();
  if (!planned.length) {
    showError(phrase('export.nothing'));
    return;
  }

  exporting = true;
  abortController = new AbortController();
  el.exportBtn.disabled = true;
  el.cancelBtn.hidden = false;
  el.progress.hidden = false;
  progress(0, phrase('step.starting'));

  const bits = Number(el.depth.value);

  try {
    const started = performance.now();
    const cut = await trim(source, planned, {
      signal: abortController.signal,
      t: phrase,
      onProgress: (done, label) => progress(done, label),
    });

    progress(1, phrase('step.writing'));
    const blob = writeWav(cut.channels, source.sampleRate, { bits });
    const seconds = cut.frames / source.sampleRate;

    resultUrl = URL.createObjectURL(blob);
    el.resultAudio.src = resultUrl;
    el.download.href = resultUrl;
    el.download.download = outputName(file.name);
    el.result.hidden = false;
    lastOut = summarise(cut.channels);
    drawWaveform(el.outWave, lastOut);

    el.resultInfo.textContent = [
      phrase('result.wav', { depth: phrase(bits === 32 ? 'depth.float' : 'depth.16') }),
      formatDuration(seconds),
      formatBytes(blob.size),
      phrase(planned.length === 1 ? 'n.part.one' : 'n.part.many', { n: planned.length }),
      phrase('result.took', { seconds: ((performance.now() - started) / 1000).toFixed(1) }),
    ].reduce((a, b) => phrase('join.dot', { a, b }));

    el.progress.hidden = true;
    el.result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (error) {
    el.progress.hidden = true;
    if (error?.name !== 'AbortError') {
      showError(error?.message ? phrase(error.message) : phrase('export.failed'));
      console.error(error);
    }
  } finally {
    exporting = false;
    abortController = null;
    el.cancelBtn.hidden = true;
    el.exportBtn.disabled = false;
  }
}

/** What the file is called on the way out: the name that went in, plus what
 *  was done to it, so a folder of experiments is still readable afterwards. */
function outputName(name) {
  const base = name.replace(/\.[^.]+$/, '') || 'audio';
  return `${base}-${mode === 'cut' ? 'cut' : 'trimmed'}.wav`;
}

function progress(done, label) {
  el.progressBar.style.width = `${Math.round(Math.min(1, Math.max(0, done)) * 100)}%`;
  if (label) el.progressLabel.textContent = label;
}

el.exportBtn.addEventListener('click', runExport);
el.cancelBtn.addEventListener('click', () => abortController?.abort());

window.addEventListener('beforeunload', (event) => {
  if (!exporting) return;
  event.preventDefault();
  event.returnValue = ''; // still required by some browsers to trigger the prompt
});

// The waveforms are drawn at the size the canvas happens to be, so they are
// drawn again when that changes. Nothing is recomputed but the picture.
window.addEventListener('resize', () => {
  timeline.redraw();
  if (lastOut) drawWaveform(el.outWave, lastOut);
});

/* ---------------------------------------------------------------- reporting */

function clearResult() {
  el.result.hidden = true;
  el.resultAudio.removeAttribute('src');
  if (resultUrl) URL.revokeObjectURL(resultUrl);
  resultUrl = null;
  lastOut = null;
}

/* ----------------------------------------------------------------- wording */

const channelWord = (count) => (count <= 2
  ? phrase(count === 1 ? 'channels.mono' : 'channels.stereo')
  : phrase('channels.many', { n: count }));

/* ------------------------------------------------- privacy panel + offline */

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

timeline.setEnabled(false);

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
