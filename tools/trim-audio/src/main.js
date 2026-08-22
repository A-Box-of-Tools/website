/** UI wiring and application state. */

import { wireFilePicker } from './shared/file-picker.js';
import { decodeAudio, UnreadableFile } from './decode.js';
import {
  formatDuration, openSegment, readTimestamps, segmentRanges, totalCaptured,
  writeTimestamps,
} from './segments.js';
import { Timeline, formatTime, parseTime } from './timeline.js';
import {
  invertRanges, isUntouched, planSections, sectionFrames, totalSeconds, trim,
} from './trim.js';
import { writeWav, wavSize } from './wav.js';
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
  progressWrap: $('progress-wrap'),
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
  networkCount: $('network-count'),
  networkDot: $('network-dot'),
  offlineStatus: $('offline-status'),
  offlineDot: $('offline-dot'),
};

/** @type {File|null} */
let file = null;
/** What decode.js handed back, or null before a file is chosen. */
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
  picker.busy('Reading the sound...');

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
    el.sectionCard.hidden = false;
    el.exportCard.hidden = false;

    timeline.setSource({ duration: decoded.duration, summary });
    timeline.setEnabled(true);
    renderSegments();
  } catch (error) {
    if (error instanceof UnreadableFile) showError(error.message);
    else {
      showError(`That file could not be read: ${error?.message ?? error}`);
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
  el.srcFormat.textContent = `${channelWord(source.channels.length)}, `
    + `${(source.sampleRate / 1000).toFixed(1)} kHz`;
  el.srcRate.textContent = source.guessedRate
    ? `${source.sampleRate} Hz (assumed)`
    : `${source.sampleRate} Hz (from the file)`;
  el.source.hidden = false;

  el.editing.hidden = false;
  el.editing.textContent = file.name;
  el.tlTotal.textContent = formatTime(source.duration);
  el.tlNow.textContent = formatTime(0);

  el.pathNote.hidden = !source.guessedRate;
  if (source.guessedRate) {
    el.pathNote.textContent = 'This format does not say what rate it was recorded '
      + 'at in a header this tool reads, so it was decoded at 48 kHz. If the '
      + 'recording was made at some other rate, the browser resampled it on the '
      + 'way in - which is the one thing here that is not exact.';
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
  el.play.textContent = 'Pause';
  if (!ticking) ticking = requestAnimationFrame(tick);
});

el.preview.addEventListener('pause', () => {
  el.play.textContent = 'Play';
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
    showError('Nothing is open yet. Press I where the part should start, then O where it ends.');
    return;
  }

  const at = timeline.snap(currentTime());
  if (at <= last.start) {
    showError(`That would end the part at ${formatTime(at)}, which is before it starts `
      + `at ${formatTime(last.start)}. Move the playhead past the start first.`);
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
    showError('There is not enough recording left here to add a part. Move the playhead back.');
    return;
  }
  segments.push({ id: nextId++, start, end });
  selectedSegment = segments[segments.length - 1].id;
  renderSegments();
});

el.resetSegments.addEventListener('click', () => {
  if (!segments.length) return;
  // eslint-disable-next-line no-alert
  if (!window.confirm(`Clear all ${segments.length} parts of ${file.name}?`)) return;
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
    ? 'none yet — the whole recording'
    : `${finished.length} of ${segments.length}`;
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
    iconButton('▶', 'Play this part', () => playSegment(segment), segment.end === null),
    iconButton('↑', 'Move up', () => moveSegment(index, -1), index === 0),
    iconButton('↓', 'Move down', () => moveSegment(index, 1), index === segments.length - 1),
    iconButton('✕', 'Remove', () => removeSegment(index), false, 'danger'),
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
    showError('There is nothing marked to save yet.');
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
      showError(`Every part in ${marks.name} starts after this recording ends. `
        + 'It was probably marked against a different one.');
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
      const says = [];
      if (dropped) {
        says.push(`${dropped} part${dropped === 1 ? '' : 's'} in ${marks.name} `
          + `${dropped === 1 ? 'starts' : 'start'} past the end of this recording, so `
          + `${dropped === 1 ? 'it was' : 'they were'} left out.`);
      }
      if (parsed.skipped) {
        says.push(`${parsed.skipped} line${parsed.skipped === 1 ? '' : 's'} could not be `
          + 'read as a part.');
      }
      says.push(`${kept.length} loaded.`);
      showError(says.join(' '));
    }
    renderSegments();
  } catch (error) {
    showError(`${marks.name} could not be read: ${error.message}`);
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
    el.sumParts.textContent = mode === 'cut'
      ? 'nothing — the marks cover the whole recording'
      : 'nothing marked';
    el.sumLength.textContent = '0s';
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
  el.sumParts.textContent = mode === 'cut'
    ? `${count} part${count === 1 ? '' : 's'}, once the marked ones are gone`
    : `${count} part${count === 1 ? '' : 's'}`;
  el.sumLength.textContent = formatDuration(frames / source.sampleRate);

  // Where the result begins. On the video cutter this is the line that has to
  // apologise for keyframes; here it is the line that gets to say there is
  // nothing to apologise for.
  el.sumStart.textContent = `exactly where you marked, at sample ${planned[0].from.toLocaleString()}`;

  const joins = count - 1;
  const faded = planned.reduce(
    (total, section) => total + (section.fadeIn ? 1 : 0) + (section.fadeOut ? 1 : 0), 0);
  el.sumJoins.textContent = joins === 0
    ? (faded ? 'none — one part, faded at its cut edges' : 'none — one part, untouched')
    : `${joins} join${joins === 1 ? '' : 's'}`
      + (faded ? `, ${faded} edge${faded === 1 ? '' : 's'} faded` : ', no fades');

  el.sumSound.textContent = `${channelWord(source.channels.length)}, `
    + `${(source.sampleRate / 1000).toFixed(1)} kHz, `
    + `${bits === 32 ? '32-bit float' : '16-bit'}`;
  el.sumSize.textContent = formatBytes(wavSize(frames, source.channels.length, bits));

  el.fadeNote.textContent = fadeNote(fadeSeconds, faded);

  // The one claim worth making loudly, and only when it is true.
  const untouched = isUntouched(planned, source.frames);
  el.cutNote.hidden = !untouched;
  if (untouched) {
    el.cutNote.textContent = 'Nothing is marked, so nothing is being cut: this will write '
      + 'out every sample the decoder produced, in order, with no fade anywhere. It is a '
      + 'format change and nothing else.';
  }
}

function fadeNote(fadeSeconds, edges) {
  if (!fadeSeconds) {
    return 'Every part is cut on the exact sample you marked, with nothing multiplied '
      + 'by anything. If a cut lands mid-word you may hear a click at the join, which is '
      + 'the waveform jumping rather than anything going wrong.';
  }
  const ms = Math.round(fadeSeconds * 1000);
  const samples = Math.round(fadeSeconds * (source?.sampleRate ?? 48000));
  return `${ms} ms — about ${samples.toLocaleString()} samples — ramped up at the start of `
    + 'a part and down at its end, so a join cannot click. Only edges that are actually '
    + `cuts get one: an edge at the very start or end of the recording is left alone`
    + (edges ? `, which leaves ${edges} edge${edges === 1 ? '' : 's'} faded here.` : '.');
}

/* ------------------------------------------------------------------ export */

async function runExport() {
  if (!source || exporting) return;
  clearError();
  clearResult();

  const planned = sections();
  if (!planned.length) {
    showError('There is nothing to keep. Mark a part, or switch back to "Keep them".');
    return;
  }

  exporting = true;
  abortController = new AbortController();
  el.exportBtn.disabled = true;
  el.cancelBtn.hidden = false;
  el.progressWrap.hidden = false;
  progress(0, 'Starting...');

  const bits = Number(el.depth.value);

  try {
    const started = performance.now();
    const cut = await trim(source, planned, {
      signal: abortController.signal,
      onProgress: (done, label) => progress(done, label),
    });

    progress(1, 'Writing the file...');
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
      `WAV, ${bits === 32 ? '32-bit float' : '16-bit'}`,
      formatDuration(seconds),
      formatBytes(blob.size),
      `${planned.length} part${planned.length === 1 ? '' : 's'}`,
      `${((performance.now() - started) / 1000).toFixed(1)}s`,
    ].join(' · ');

    el.progressWrap.hidden = true;
    el.result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (error) {
    el.progressWrap.hidden = true;
    if (error?.name !== 'AbortError') {
      showError(error?.message || 'Something went wrong while trimming the audio.');
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

function showError(message) {
  el.error.textContent = message;
  el.error.hidden = false;
}

function clearError() {
  el.error.hidden = true;
  el.error.textContent = '';
}

function clearResult() {
  el.result.hidden = true;
  el.resultAudio.removeAttribute('src');
  if (resultUrl) URL.revokeObjectURL(resultUrl);
  resultUrl = null;
  lastOut = null;
}

/* ----------------------------------------------------------------- wording */

const channelWord = (count) => (
  count === 1 ? 'mono' : count === 2 ? 'stereo' : `${count} channels`);

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

/* ------------------------------------------------- privacy panel + offline */

el.privacyToggle.addEventListener('click', () => {
  const open = el.privacyPanel.hidden;
  el.privacyPanel.hidden = !open;
  el.privacyToggle.setAttribute('aria-expanded', String(open));
});

// Hosts belonging to the ad, measurement and donate-button scripts. This tool
// has no network feature of its own at all - there is no address to paste and
// nothing to fetch - so anything outside this list appearing here would be a
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
 * but "nothing has carried your recording away". That is the part that matters,
 * and the part a sceptical visitor can watch hold in real time.
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
        + `host${platform.size === 1 ? '' : 's'}; not one of them was given a file.`;

    el.networkCount.textContent = clean
      ? `your audio has gone nowhere. ${total} files loaded.${platformNote}`
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

window.addEventListener('error', (event) => {
  showError(`Something broke: ${event.message}. Reload the page to start over.`);
});
window.addEventListener('unhandledrejection', (event) => {
  showError(`Something broke: ${event.reason?.message ?? event.reason}. `
    + 'Reload the page to start over.');
});

timeline.setEnabled(false);
monitorNetwork();
registerServiceWorker();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
