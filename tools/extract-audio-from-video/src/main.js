/** UI wiring and application state. */

import { phrase } from './shared/phrases.js';
import { sizeText } from './shared/format.js';
import { messageBox } from './shared/message-box.js';
import { wireFilePicker } from './shared/file-picker.js';
import { decodeAudio, UnreadableFile } from './shared/audio-decode.js';
import { writeWav } from './shared/wav.js';
import { mixToMono } from './mono.js';

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

/* ------------------------------------------------------------------- input */

const picker = wireFilePicker({
  input: el.fileInput,
  dropzone: el.dropzone,
  onFiles(files) { load(files[0]); },
});

async function load(file) {
  clearError();
  clearResult();
  picker.busy(phrase('step.reading'));
  el.status.textContent = phrase('step.reading');
  el.status.hidden = false;

  try {
    // Only the audio track is asked for. decodeAudioData is handed the bytes
    // and hands back sound; the video track is never decoded, never drawn, and
    // never reaches this page. There is no code here that could look at it.
    sound = await decodeAudio(file);
    sourceName = file.name;
    describeSource(file);
    el.takeCard.removeAttribute('inert');
    write();
  } catch (error) {
    sound = null;
    el.source.hidden = true;
    el.takeCard.setAttribute('inert', '');
    showError(say(error));
    if (!(error instanceof UnreadableFile)) console.error(error);
  } finally {
    picker.done();
    el.status.hidden = true;
  }
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

el.channels.addEventListener('change', () => { if (sound) write(); });

/* -------------------------------------------------------------- the result */

/**
 * Write the WAV.
 *
 * A WAV is the samples with a forty-four-byte header in front of them, so this
 * is not an encode and there is no quality decision in it. It is also fast
 * enough to redo whenever the channel setting changes, which is why there is no
 * button to press: the file is simply always the one the settings describe.
 */
function write() {
  clearError();
  try {
    const channels = el.channels.value === 'mono' ? [mixToMono(sound.channels)] : sound.channels;
    const blob = writeWav(channels, sound.sampleRate, { bits: 16 });

    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    downloadUrl = URL.createObjectURL(blob);

    el.resultAudio.src = downloadUrl;
    el.download.href = downloadUrl;
    el.download.download = wavName(sourceName);
    el.resultInfo.textContent = phrase('out.info', {
      size: humanBytes(blob.size),
      length: clock(sound.duration),
      channels: phrase(channelWord(channels.length)),
      rate: (sound.sampleRate / 1000).toFixed(1),
    });
    el.result.hidden = false;
  } catch (error) {
    showError(say(error));
    console.error(error);
  }
}

/** The video's name with a .wav on it, so the download is recognisable. */
function wavName(name) {
  const stem = name.replace(/\.[^.]+$/, '') || 'audio';
  return `${stem}.wav`;
}

function clearResult() {
  el.result.hidden = true;
  el.resultAudio.removeAttribute('src');
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
