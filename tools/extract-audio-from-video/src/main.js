/** UI wiring and application state. */

import { phrase } from './shared/phrases.js';
import { wireFilePicker } from './shared/file-picker.js';
import { decodeAudio, UnreadableFile } from './decode.js';
import { writeWav } from './wav.js';
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
  networkCount: $('network-count'),
  networkDot: $('network-dot'),
  offlineStatus: $('offline-status'),
  offlineDot: $('offline-dot'),
};

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
 * decode.js throws an UnreadableFile carrying a phrase key rather than a
 * sentence, because that file is copied byte for byte into fifteen languages.
 * Anything else is the platform talking, and phrase() hands back what it cannot
 * find, so it still reads as itself.
 */
function say(error) {
  if (error instanceof UnreadableFile) return phrase(error.message);
  return error?.message ? phrase(error.message) : String(error);
}

function showError(message) {
  el.error.textContent = message;
  el.error.hidden = false;
}

function clearError() {
  el.error.hidden = true;
  el.error.textContent = '';
}

function humanBytes(bytes) {
  if (bytes < 1024) return phrase('size.bytes', { n: bytes });
  if (bytes < 1024 * 1024) return phrase('size.kb', { n: (bytes / 1024).toFixed(1) });
  return phrase('size.mb', { n: (bytes / (1024 * 1024)).toFixed(1) });
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

// Hosts belonging to the ad, measurement and donate-button scripts. This tool
// has no network feature of its own at all - there is nothing to fetch and
// nothing to send - so anything outside this list appearing here would be a
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
 * but "your video has gone nowhere". That is the part that matters, and the
 * part a sceptical visitor can watch hold in real time.
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
    // One phrase per number rather than a pluralising helper: a language
    // whose plural is not a suffix has to be able to translate the two
    // separately.
    const platformNote = platform.size
      ? phrase(platform.size === 1 ? 'net.platform.one' : 'net.platform.many',
               { hosts: platform.size })
      : '';

    el.networkCount.textContent = clean
      ? phrase('net.clean', { total, platform: platformNote })
      : phrase('net.dirty', { hosts: [...external].join(', '), platform: platformNote });

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
    fail(phrase('offline.none'));
    return;
  }
  if (!window.isSecureContext) {
    fail(phrase('offline.insecure'));
    return;
  }

  try {
    await navigator.serviceWorker.register('sw.js');
    await navigator.serviceWorker.ready;
    el.offlineStatus.textContent = phrase('offline.ready');
    el.offlineStatus.className = 'good';
    el.offlineDot.className = 'live-dot good';
  } catch (error) {
    fail(phrase('offline.failed'), error.message);
  }
}

/* -------------------------------------------------------------------- boot */

window.addEventListener('error', (event) => {
  showError(phrase('error.broke', { detail: event.message }));
});
window.addEventListener('unhandledrejection', (event) => {
  showError(phrase('error.broke', { detail: event.reason?.message ?? event.reason }));
});

monitorNetwork();
registerServiceWorker();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
