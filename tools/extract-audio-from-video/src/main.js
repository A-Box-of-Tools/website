/** UI wiring and application state. */

import { phrase } from './shared/phrases.js';
import { sizeText } from './shared/format.js';
import { messageBox } from './shared/message-box.js';
import { wireFilePicker } from './shared/file-picker.js';
import { decodeAudio, UnreadableFile } from './shared/audio-decode.js';
import { prepareWav, wavSize } from './shared/wav.js';
import { writeWavAsync } from './shared/wav-async.js';
import { mixToMonoAsync } from './mono.js';
import { makeExample } from './example.js';

const $ = (id) => document.getElementById(id);

const el = {
  dropzone: $('dropzone'),
  fileInput: $('file-input'),
  source: $('source'),
  srcName: $('src-name'),
  srcSize: $('src-size'),
  srcLength: $('src-length'),
  srcChannels: $('src-channels'),
  srcRate: $('src-rate'),
  rateNote: $('rate-note'),
  takeCard: $('take-card'),
  channels: $('channels'),
  channelsNote: $('channels-note'),
  depth: $('depth'),
  estimate: $('estimate'),
  cancel: $('cancel'),
  retry: $('retry'),
  status: $('status'),
  error: $('error'),
  result: $('result'),
  resultAudio: $('result-audio'),
  resultInfo: $('result-info'),
  download: $('download'),
  privacyToggle: $('privacy-toggle'),
  privacyPanel: $('privacy-panel'),
};

const { show: showError, clear: clearError } = messageBox(el.error);
const humanBytes = (n) => sizeText(n, phrase, { under: 'size.bytes', kb: 1, mb: 1 });

/**
 * The decoded sound, and the name it came in under. Held so that changing the
 * channel setting rewrites the WAV from samples that are already here rather
 * than decoding the video a second time.
 */
let sound = null;
let sourceName = '';
let downloadUrl = null;
let loading = false;
let loadGeneration = 0;
let writeVersion = 0;
let writeController = null;

/* ------------------------------------------------------------------- input */

const picker = wireFilePicker({
  input: el.fileInput,
  dropzone: el.dropzone,
  onFiles(files) { load(files[0]); },
  example: makeExample,
});

function retireWrite() {
  writeVersion += 1;
  writeController?.abort();
  writeController = null;
}

async function load(file) {
  if (!file) return;
  const generation = ++loadGeneration;
  retireWrite();
  sound = null;
  sourceName = '';
  loading = true;
  clearError();
  clearResult();
  el.source.hidden = true;
  el.rateNote.hidden = true;
  el.takeCard.inert = true;
  el.estimate.hidden = true;
  el.retry.hidden = true;
  picker.busy(phrase('step.reading'));
  showActivity(phrase('step.reading'));

  try {
    // Native decoding cannot be interrupted. Only its current generation may
    // publish samples, facts or cleanup after that browser operation finishes.
    const decoded = await decodeAudio(file);
    if (generation !== loadGeneration) return;
    sound = decoded;
    sourceName = file.name;
    loading = false;
    picker.done();
    describeSource(file);
    el.takeCard.inert = false;
    await write();
  } catch (error) {
    if (generation !== loadGeneration) return;
    sound = null;
    sourceName = '';
    loading = false;
    el.source.hidden = true;
    el.takeCard.inert = true;
    clearResult();
    picker.done();
    el.cancel.hidden = true;
    el.status.hidden = true;
    showError(say(error));
    if (!(error instanceof UnreadableFile)) console.error(error);
  }
}

function showActivity(text) {
  el.status.textContent = text;
  el.status.hidden = false;
  el.cancel.hidden = false;
}

function describeSource(file) {
  el.srcName.textContent = file.name;
  el.srcSize.textContent = humanBytes(file.size);
  el.srcLength.textContent = clock(sound.duration);
  el.srcChannels.textContent = phrase(channelWord(sound.channels.length));
  el.srcRate.textContent = phrase('rate.khz', { n: (sound.sampleRate / 1000).toFixed(1) });
  // Said out loud when it matters: a rate the file did not declare means the
  // samples handed back are not the ones on the disk.
  el.rateNote.hidden = !sound.guessedRate;
  el.source.hidden = false;
}

const channelWord = (n) => (n === 1 ? 'channels.mono' : n === 2 ? 'channels.stereo' : 'channels.many');

for (const control of [el.channels, el.depth]) {
  control.addEventListener('change', () => { if (sound && !loading) write(); });
}
el.retry.addEventListener('click', () => write());
el.cancel.addEventListener('click', cancel);

function cancel() {
  if (!loading && !writeController) return;
  if (loading) {
    loadGeneration += 1;
    loading = false;
    sound = null;
    sourceName = '';
    el.source.hidden = true;
    el.takeCard.inert = true;
    el.estimate.hidden = true;
    picker.done();
  }
  retireWrite();
  clearError();
  clearResult();
  el.cancel.hidden = true;
  el.retry.hidden = !sound;
  el.status.textContent = phrase('step.cancelled');
  el.status.hidden = false;
}

/* -------------------------------------------------------------- the result */

/**
 * Settings still generate automatically, but each writer owns only its exact
 * source and choices. Newer settings, a replacement or Cancel retire it.
 */
async function write() {
  if (!sound || loading) return;
  retireWrite();
  const version = writeVersion;
  const input = sound;
  const name = wavName(sourceName);
  const mono = el.channels.value === 'mono';
  const bits = Number(el.depth.value);
  const controller = new AbortController();
  writeController = controller;
  const current = () => version === writeVersion && input === sound
    && controller === writeController && !controller.signal.aborted && !loading;
  const report = (key, { done, total }) => {
    if (current()) showActivity(phrase(key, { n: Math.round(done / Math.max(1, total) * 100) }));
  };
  clearError();
  clearResult();
  el.retry.hidden = true;
  el.estimate.textContent = phrase('out.estimate', {
    size: humanBytes(wavSize(input.frames, mono ? 1 : input.channels.length, bits)),
  });
  el.estimate.hidden = false;
  showActivity(phrase(mono ? 'step.mixing' : 'step.writing', { n: 0 }));
  let failed = false;

  try {
    // Refuse the complete output before mono allocates an additional PCM plane.
    prepareWav(mono ? [input.channels[0]] : input.channels, input.sampleRate, { bits });
    const options = { signal: controller.signal };
    const channels = mono ? [await mixToMonoAsync(input.channels, {
      ...options, onProgress: (progress) => report('step.mixing', progress),
    })] : input.channels;
    if (!current()) return;
    const blob = await writeWavAsync(channels, input.sampleRate, {
      ...options, bits, onProgress: (progress) => report('step.writing', progress),
    });
    if (!current()) return;
    downloadUrl = URL.createObjectURL(blob);
    el.resultAudio.src = downloadUrl;
    el.download.href = downloadUrl;
    el.download.download = name;
    el.resultInfo.textContent = phrase('out.info', {
      depth: phrase(bits === 32 ? 'depth.float' : 'depth.16'),
      size: humanBytes(blob.size), length: clock(input.duration),
      channels: phrase(channelWord(channels.length)),
      rate: (input.sampleRate / 1000).toFixed(1),
    });
    el.result.hidden = false;
  } catch (error) {
    if (!current()) return;
    failed = true;
    showError(say(error));
    console.error(error);
  } finally {
    if (current()) {
      writeController = null;
      el.cancel.hidden = true;
      el.status.hidden = true;
      el.retry.hidden = !failed;
    }
  }
}

/** The video's name with a .wav on it, so the download is recognisable. */
function wavName(name) {
  const stem = name.replace(/\.[^.]+$/, '') || 'audio';
  return `${stem}.wav`;
}

function clearResult() {
  el.result.hidden = true;
  el.resultAudio.pause();
  el.resultAudio.removeAttribute('src');
  el.resultAudio.load();
  el.download.removeAttribute('href');
  if (downloadUrl) URL.revokeObjectURL(downloadUrl);
  downloadUrl = null;
}

/* --------------------------------------------------------------- the words */

/**
 * Whatever went wrong, as a sentence.
 *
 * shared/audio-decode.js throws an UnreadableFile carrying a phrase key rather than a
 * sentence, because that file is copied byte for byte into fifteen languages.
 * Anything else is the platform talking, and phrase() hands back what it cannot
 * find, so it still reads as itself.
 */
function say(error) {
  if (error instanceof UnreadableFile) return phrase(error.message);
  return error?.message ? phrase(error.message) : String(error);
}

/** m:ss, or h:mm:ss once there is an hour of it. */
function clock(seconds) {
  const whole = Math.max(0, Math.round(seconds));
  const s = String(whole % 60).padStart(2, '0');
  const m = Math.floor(whole / 60) % 60;
  const h = Math.floor(whole / 3600);
  return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
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

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
