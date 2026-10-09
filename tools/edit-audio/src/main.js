/** UI wiring and application state. */

import { phrase } from './shared/phrases.js';
import { sizeText, clockText } from './shared/format.js';
import { messageBox } from './shared/message-box.js';
import { wireFilePicker } from './shared/file-picker.js';
import { decodeAudio, UnreadableFile } from './shared/audio-decode.js';
import { render, lengthAfter } from './edit.js';
import { peak, dbToGain, gainToDb, normalizeGain } from './effects.js';
import { wavSize } from './shared/wav.js';
import { writeWavAsync } from './shared/wav-async.js';
import { parseEditNumber, previewSource } from './controls.js';
import { drawWaveform } from './waveform.js';
import { makeExample } from './example.js';

const $ = (id) => document.getElementById(id);

const el = {
  dropzone: $('dropzone'),
  fileInput: $('file-input'),
  source: $('source'),
  srcName: $('src-name'),
  srcSize: $('src-size'),
  srcLength: $('src-length'),
  srcFormat: $('src-format'),
  srcPeak: $('src-peak'),
  srcRate: $('src-rate'),
  srcWaveWrap: $('src-wave-wrap'),
  srcWave: $('src-wave'),
  preview: $('preview'),
  pathNote: $('path-note'),
  editCard: $('edit-card'),
  reverse: $('reverse'),
  speed: $('speed'),
  speedValue: $('speed-value'),
  speedNote: $('speed-note'),
  speedError: $('speed-error'),
  volume: $('volume'),
  volumeValue: $('volume-value'),
  volumeNote: $('volume-note'),
  volumeError: $('volume-error'),
  previewEdit: $('preview-edit'),
  excerpt: $('excerpt'),
  excerptAudio: $('excerpt-audio'),
  excerptInfo: $('excerpt-info'),
  sumLength: $('sum-length'),
  sumSpeed: $('sum-speed'),
  sumPeak: $('sum-peak'),
  sumSize: $('sum-size'),
  clipNote: $('clip-note'),
  exportCard: $('export-card'),
  depth: $('depth'),
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
/** The loudest sample in the file as it was decoded. Measured once. */
let sourcePeak = 0;
let previewUrl = null;
let resultUrl = null;
let excerptUrl = null;
/** The samples that came out of the last edit, kept only so the picture of
 *  them can be drawn again when the window changes size. */
let lastEdited = null;

let exporting = false;
let loading = false;
let loadGeneration = 0;
let abortController = null;
let runGeneration = 0;

/** What the speed slider means, as a multiple. Held here rather than read back
 *  off the slider; see setSpeed. */
let speed = 1;
// A text entry may fall between slider ticks; the displayed value is the one used.
let volumeDb = 0;

/** How far the speed can be taken either way. Past these the stretcher starts
 *  to sound like an effect rather than a speed change. */
const SPEED_LIMITS = { min: 0.25, max: 4 };
/** Where "as loud as it will go" stops, in dB below full scale. */
const NORMALIZE_TARGET = -1;

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
  example: makeExample,
});

async function loadFile(picked) {
  if (exporting) { setWorking(true); return; }
  const generation = ++loadGeneration;
  loading = true;
  el.exportBtn.disabled = true;
  clearError();
  clearResult();
  clearExcerpt();
  updateSummary();
  picker.busy(phrase('step.reading'));

  try {
    // Everything below happens here, on this machine. There is no upload step
    // to leave out: the file is handed to the browser's own decoder and the
    // samples come back into this page's memory.
    const decoded = await decodeAudio(picked);
    if (generation !== loadGeneration) return;
    file = picked;
    source = decoded;
    sourcePeak = peak(decoded.channels);

    showSource();
    updateSummary();
  } catch (error) {
    if (generation !== loadGeneration) return;
    // Only known reader keys are resolved. Native sentences remain text so
    // quotes in a refusal cannot become part of a phrase selector.
    if (error instanceof UnreadableFile) showError(leafReason(error));
    else {
      showError(phrase('read.failed', { why: leafReason(error) }));
      console.error(error);
    }
  } finally {
    if (generation === loadGeneration) {
      loading = false;
      picker.done();
      if (source) updateSummary();
    }
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
  el.srcPeak.textContent = formatPeak(sourcePeak);
  el.srcRate.textContent = phrase(
    source.guessedRate ? 'src.rate.assumed' : 'src.rate.file',
    { rate: source.sampleRate },
  );
  el.source.hidden = false;

  el.pathNote.hidden = !source.guessedRate;
  if (source.guessedRate) {
    el.pathNote.textContent = phrase('src.guessednote');
  }

  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = URL.createObjectURL(file);
  el.preview.pause();
  el.preview.src = previewUrl;
  el.srcWaveWrap.hidden = false;
  drawWaveform(el.srcWave, source.channels);
}

/* ------------------------------------------------------------- the settings */

/** Everything the two sliders and the four radios currently say. */
function settings() {
  return {
    reverse: el.reverse.checked,
    speed,
    keepPitch: pickedValue('pitch') === 'keep',
    volume: {
      mode: pickedValue('level'),
      db: pickedValue('level') === 'normalize' ? NORMALIZE_TARGET : volumeDb,
    },
  };
}

const pickedValue = (name) => document.querySelector(`input[name="${name}"]:checked`).value;

/**
 * Set the speed, and say so in both places that show it.
 *
 * The multiple is held here rather than read back off the slider. A slider has
 * a step, and the position that means 1.5x does not land on one: reading it
 * back gives 1.4949x, and a page that says 1.5x while doing 1.49x is exactly
 * the kind of small dishonesty this site is written to avoid. It is rounded to
 * two decimals for the same reason - so the number shown is the number used.
 */
function setSpeed(wanted) {
  const next = Math.round(wanted * 100) / 100;
  if (next !== speed) invalidateEdits();
  speed = next;
  el.speed.value = String(Math.log2(speed));
  el.speedValue.value = formatSpeed(speed);
  numericError('speed', false);
  updateSummary();
}

function setVolume(db) {
  const next = Math.round(db * 100) / 100;
  if (next !== volumeDb) invalidateEdits();
  volumeDb = next;
  el.volume.value = String(volumeDb);
  el.volumeValue.value = formatDb(volumeDb);
  numericError('volume', false);
  updateSummary();
}

function numericError(kind, invalid) {
  const input = kind === 'speed' ? el.speedValue : el.volumeValue;
  const note = kind === 'speed' ? el.speedError : el.volumeError;
  note.hidden = !invalid;
  if (invalid) { input.setAttribute('aria-invalid', 'true'); note.textContent = phrase(`input.${kind}`); }
  else input.removeAttribute('aria-invalid');
}

function commitNumber(kind) {
  const input = kind === 'speed' ? el.speedValue : el.volumeValue;
  const value = parseEditNumber(input.value, kind);
  if (value === null) { numericError(kind, true); updateSummary(); return false; }
  if (kind === 'speed') setSpeed(value); else setVolume(value);
  return true;
}

function commitInputs() {
  const a = commitNumber('speed'); const b = commitNumber('volume');
  return a && b;
}

const validDrafts = () => parseEditNumber(el.speedValue.value, 'speed') !== null
  && parseEditNumber(el.volumeValue.value, 'volume') !== null;

el.speed.addEventListener('input', () => setSpeed(clamp(2 ** Number(el.speed.value), SPEED_LIMITS.min, SPEED_LIMITS.max)));
el.volume.addEventListener('input', () => setVolume(Number(el.volume.value)));
for (const [kind, input] of [['speed', el.speedValue], ['volume', el.volumeValue]]) {
  input.addEventListener('input', () => { invalidateEdits(); numericError(kind, false); updateSummary(); });
  input.addEventListener('change', () => commitNumber(kind));
  input.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' || event.isComposing) return;
    event.preventDefault(); commitNumber(kind);
  });
}
for (const button of document.querySelectorAll('.presets button')) {
  button.addEventListener('click', () => setSpeed(Number(button.dataset.speed)));
}
for (const input of [...document.querySelectorAll('input[name="pitch"], input[name="level"]'), el.reverse, el.depth]) {
  input.addEventListener('change', () => { invalidateEdits(); updateSummary(); });
}

/** A programmatic edit also retires work even when ordinary controls are locked. */
function invalidateEdits() {
  if (exporting) {
    runGeneration += 1;
    abortController?.abort(); abortController = null;
    setWorking(false);
  }
  clearResult(); clearExcerpt(); clearError();
}

/**
 * The four lines that say what pressing the button will produce.
 *
 * All of it is arithmetic on numbers already known - the length, the loudest
 * sample, the size of a WAV - so it can be recomputed on every keystroke
 * without touching the audio.
 */
function updateSummary() {
  el.exportBtn.disabled = !source || loading || exporting || !validDrafts();
  el.previewEdit.disabled = el.exportBtn.disabled;
  if (!source) return;
  const chosen = settings();
  const frames = lengthAfter(source.frames, chosen.speed, chosen.keepPitch);
  const bits = Number(el.depth.value);

  el.sumLength.textContent = formatDuration(frames / source.sampleRate);
  el.sumSpeed.textContent = chosen.speed === 1
    ? phrase('summary.speed.unchanged')
    : phrase(chosen.keepPitch ? 'summary.speed.same'
      : chosen.speed > 1 ? 'summary.speed.up' : 'summary.speed.down',
    { speed: formatSpeed(chosen.speed) });

  const gain = chosen.volume.mode === 'normalize'
    ? normalizeGain(sourcePeak, NORMALIZE_TARGET)
    : dbToGain(chosen.volume.db);
  const after = sourcePeak * gain;

  el.sumPeak.textContent = formatPeak(after);
  el.sumSize.textContent = formatBytes(wavSize(frames, source.channels.length, bits));

  el.speedNote.textContent = speedNote(chosen);
  el.volumeNote.textContent = volumeNote(chosen, gain, after);

  // Warned about here rather than after the fact, because the fix - a smaller
  // boost, or normalising instead - is a setting on this page and not
  // something to be discovered in the file that came out.
  const clips = after > 1.0001;
  el.clipNote.hidden = !clips;
  if (clips) {
    // Two sentences, and the space between them is a phrase as well: ja and
    // zh do not put one after a full stop.
    el.clipNote.textContent = phrase('join.sentences', {
      a: phrase('clip.over', { db: gainToDb(after).toFixed(1) }),
      b: phrase(bits === 32 ? 'clip.float' : 'clip.int'),
    });
  }
}

// Four whole sentences rather than one with "faster" or "slower" dropped
// into a blank: which word goes where is not the same in every language,
// and neither is whether it agrees with anything around it.
function speedNote(chosen) {
  if (chosen.speed === 1) return phrase('speed.none');
  const faster = chosen.speed > 1;
  if (chosen.keepPitch) {
    return phrase(faster ? 'speed.pitch.faster' : 'speed.pitch.slower',
      { speed: formatSpeed(chosen.speed) });
  }
  return phrase(faster ? 'speed.moves.faster' : 'speed.moves.slower', {
    speed: formatSpeed(chosen.speed),
    semitones: Math.abs(12 * Math.log2(chosen.speed)).toFixed(1),
  });
}

function volumeNote(chosen, gain, after) {
  if (chosen.volume.mode === 'normalize') {
    const change = gainToDb(gain);
    // A recording that is already up against the ceiling gets turned down by
    // this setting rather than up, and the line has to be able to say so.
    if (Math.abs(change) < 0.05) return phrase('volume.already');
    return phrase(change > 0 ? 'volume.raised' : 'volume.lowered',
      { db: Math.abs(change).toFixed(1) });
  }
  if (chosen.volume.db === 0) return phrase('volume.unchanged');
  return phrase(chosen.volume.db > 0 ? 'volume.up' : 'volume.down', {
    db: Math.abs(chosen.volume.db).toFixed(1),
    gain: gain.toFixed(3),
    peak: formatPeak(after),
  });
}

/* ---------------------------------------------------------------- exporting */

function setWorking(active) {
  exporting = active;
  el.editCard.inert = active;
  el.depth.disabled = active;
  el.dropzone.inert = active;
  el.fileInput.disabled = active;
  el.cancelBtn.hidden = !active;
  el.progress.hidden = !active;
  updateSummary();
}

async function runExport() { await runJob('export'); }

async function runJob(kind) {
  if (!source || loading || exporting || !commitInputs()) return;
  clearError(); clearExcerpt();
  const excerpt = kind === 'preview' ? previewSource(source, el.preview.currentTime) : null;
  if (kind === 'preview' && !excerpt) { showError(phrase('preview.end')); return; }
  const input = excerpt?.source ?? source;
  const chosen = settings();
  const bits = Number(el.depth.value);
  const name = outputName(file.name, chosen);
  if (kind === 'export') clearResult();
  const controller = new AbortController();
  const generation = ++runGeneration;
  abortController = controller;
  const owns = () => generation === runGeneration && abortController === controller;
  const current = () => owns() && !controller.signal.aborted;
  setWorking(true);
  progress(0, 'step.starting');
  el.progress.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  try {
    const frames = lengthAfter(input.frames, chosen.speed, chosen.keepPitch);
    if (!Number.isSafeInteger(frames) || wavSize(frames, input.channels.length, bits) - 8 > 0xffffffff) {
      throw new Error('wav.toobig');
    }
    const started = performance.now();
    const edited = await render(input, chosen, { signal: controller.signal,
      onProgress: (done, label) => { if (current()) progress(done * 0.9, label); } });
    const blob = await writeWavAsync(edited.channels, input.sampleRate, { bits,
      signal: controller.signal,
      onProgress: ({ done, total }) => { if (current()) progress(0.9 + 0.1 * done / Math.max(1, total), 'step.writing'); } });
    controller.signal.throwIfAborted();
    if (!current()) return;
    const url = URL.createObjectURL(blob);
    const seconds = edited.channels[0].length / input.sampleRate;
    if (kind === 'preview') {
      excerptUrl = url;
      el.excerptAudio.src = url;
      el.excerptInfo.textContent = phrase('preview.interval', {
        from: formatDuration(excerpt.from / input.sampleRate),
        to: formatDuration(excerpt.to / input.sampleRate),
        length: formatDuration(seconds),
      });
      el.excerpt.hidden = false;
      el.excerpt.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      resultUrl = url;
      el.resultAudio.src = url;
      el.download.href = url;
      el.download.download = name;
      el.result.hidden = false;
      lastEdited = edited.channels;
      drawWaveform(el.outWave, lastEdited);
      el.resultInfo.textContent = [
        phrase(bits === 32 ? 'out.wav.float' : 'out.wav.int'),
        formatDuration(seconds), formatBytes(blob.size),
        phrase('out.peak', { peak: formatPeak(edited.peak) }),
        edited.clipped ? phrase(edited.clipped === 1 ? 'out.clipped.one' : 'out.clipped.many',
          { n: edited.clipped.toLocaleString() }) : null,
        phrase('out.took', { n: ((performance.now() - started) / 1000).toFixed(1) }),
      ].filter(Boolean).reduce((a, b) => phrase('join.dot', { a, b }));
      el.result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  } catch (error) {
    if (current() && error?.name !== 'AbortError') {
      if (kind === 'preview') clearExcerpt(); else clearResult();
      showError(phrase(kind === 'preview' ? 'preview.failed' : 'edit.failed.reason', { why: leafReason(error) }));
      console.error(error);
    }
  } finally {
    if (owns()) { abortController = null; setWorking(false); }
  }
}

const LEAF_KEYS = new Set(['audio.empty', 'audio.nodecode', 'audio.nosound',
  'wav.nochannels', 'wav.uneven', 'wav.toobig']);
function leafReason(error) {
  const message = error?.message ?? String(error);
  return LEAF_KEYS.has(message) ? phrase(message) : message;
}

/** What the file is called on the way out: the name that went in, plus what
 *  was done to it, so a folder of experiments is still readable afterwards. */
function outputName(name, chosen) {
  const base = name.replace(/\.[^.]+$/, '') || 'audio';
  const parts = [];
  if (chosen.reverse) parts.push('reversed');
  if (chosen.speed !== 1) parts.push(`${formatSpeed(chosen.speed).replace('.', '-')}`);
  if (chosen.volume.mode === 'normalize') parts.push('normalised');
  else if (chosen.volume.db) parts.push(`${chosen.volume.db > 0 ? 'up' : 'down'}${Math.abs(chosen.volume.db)}db`);
  if (!parts.length) parts.push('edited');
  return `${base}-${parts.join('-')}.wav`;
}

// `label` is a phrase key: edit.js names the step and the page says it.
function progress(done, label) {
  el.progressBar.style.width = `${Math.round(done * 100)}%`;
  if (label) el.progressLabel.textContent = phrase(label);
}

el.exportBtn.addEventListener('click', runExport);
el.previewEdit.addEventListener('click', () => runJob('preview'));
el.cancelBtn.addEventListener('click', () => abortController?.abort());

window.addEventListener('beforeunload', (event) => {
  if (!exporting) return;
  event.preventDefault();
  event.returnValue = ''; // still required by some browsers to trigger the prompt
});

// The waveforms are drawn at the size the canvas happens to be, so they are
// drawn again when that changes. Nothing is recomputed but the picture.
window.addEventListener('resize', () => {
  if (source) drawWaveform(el.srcWave, source.channels);
  if (lastEdited) drawWaveform(el.outWave, lastEdited);
});

/* ---------------------------------------------------------------- reporting */

function clearResult() {
  el.result.hidden = true;
  el.resultAudio.pause();
  el.resultAudio.removeAttribute('src');
  el.resultAudio.load();
  el.download.removeAttribute('href');
  el.download.removeAttribute('download');
  el.resultInfo.textContent = '';
  if (resultUrl) URL.revokeObjectURL(resultUrl);
  resultUrl = null;
  lastEdited = null;
}

function clearExcerpt() {
  el.excerpt.hidden = true;
  el.excerptAudio.pause();
  el.excerptAudio.removeAttribute('src');
  el.excerptAudio.load();
  el.excerptInfo.textContent = '';
  if (excerptUrl) URL.revokeObjectURL(excerptUrl);
  excerptUrl = null;
}

/* ----------------------------------------------------------------- wording */

const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

const channelWord = (count) => phrase(
  count === 1 ? 'channels.mono' : count === 2 ? 'channels.stereo' : 'channels.many',
  { n: count },
);

function formatSpeed(value) {
  const shown = value >= 10 ? value.toFixed(1) : value.toFixed(2);
  return phrase('speed.times', { n: shown.replace(/\.?0+$/, '') });
}

const formatDb = (db) => `${db > 0 ? '+' : ''}${db.toFixed(2).replace(/0$/, '')} dB`;

/** Full scale as 0 dBFS, which is how every meter in every editor says it. */
function formatPeak(value) {
  if (!(value > 0)) return phrase('peak.silence');
  return phrase('peak.dbfs', { n: gainToDb(value).toFixed(1) });
}

/** The dash shown where there is no length to show. */
const EMPTY = '\u2013';

function formatDuration(seconds) {
  return Number.isFinite(seconds) ? clockText(seconds, { decimals: 1 }) : EMPTY;
}

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

setSpeed(1);
setVolume(0);

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
