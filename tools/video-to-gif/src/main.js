/** UI wiring and application state. */

import { phrase } from './shared/phrases.js';
import { wireFilePicker } from './shared/file-picker.js';
import { demux, UnsupportedFile } from './demux.js';
import { framesByDecoding, framesByPlaying, decoderConfig } from './frames.js';
import { encodeGif, ColorHistogram, MAX_COLORS } from './encode.js';
import { RangeBar, formatTime, parseTime } from './range.js';
import { frameTimes, frameDelays, outputSize, workingBytes, estimateBytes, MAX_FPS } from './plan.js';
import { hasWebCodecs, canDecode } from './support.js';

/**
 * A reader refusal, in the reader's language. The demuxer is copied byte for
 * byte into fifteen languages, so what it hands back is a phrase key and its
 * values; `absent` is the sentence for the file that was never given to it at
 * all - the browser's own player took it instead.
 */
function why(fallback, absent) {
  return phrase(fallback?.key ?? absent, fallback?.values);
}

const $ = (id) => document.getElementById(id);

const el = {
  dropzone: $('dropzone'),
  fileInput: $('file-input'),
  source: $('source'),
  srcName: $('src-name'),
  srcSize: $('src-size'),
  srcFrame: $('src-frame'),
  srcLength: $('src-length'),
  srcCodec: $('src-codec'),
  srcPath: $('src-path'),
  pathNote: $('path-note'),
  sectionCard: $('section-card'),
  stage: $('stage'),
  preview: $('preview'),
  stageNote: $('stage-note'),
  rangebar: $('rangebar'),
  scaleEnd: $('scale-end'),
  startTime: $('start-time'),
  endTime: $('end-time'),
  markIn: $('mark-in'),
  markOut: $('mark-out'),
  playSection: $('play-section'),
  wholeClip: $('whole-clip'),
  exportCard: $('export-card'),
  width: $('width'),
  customWidthField: $('custom-width-field'),
  customWidth: $('custom-width'),
  widthNote: $('width-note'),
  fps: $('fps'),
  dither: $('dither'),
  loop: $('loop'),
  sumSection: $('sum-section'),
  sumSize: $('sum-size'),
  sumFrames: $('sum-frames'),
  sumBytes: $('sum-bytes'),
  memoryNote: $('memory-note'),
  exportBtn: $('export'),
  cancelBtn: $('cancel'),
  progress: $('progress'),
  progressBar: $('progress-bar'),
  progressLabel: $('progress-label'),
  error: $('error'),
  result: $('result'),
  resultImage: $('result-image'),
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
 * How long a section the tool starts you off with when the clip is longer.
 *
 * A GIF of a whole two-minute video is not something anybody wants and is
 * something a browser can run out of memory making, so the default marks a few
 * seconds rather than everything. The bar still shows the whole clip, so what
 * has been chosen for you is visible rather than silent.
 */
const DEFAULT_SECTION = 6;

/** Refuse rather than let the tab die: frames are held in memory all at once. */
const MEMORY_LIMIT = 1_200 << 20;

/** Where the histogram stops needing more pixels to choose a good palette. */
const PALETTE_SAMPLE = 4_000_000;

/** @type {File|null} */
let file = null;
let objectUrl = null;
/** What demux() found, or null if this file is for the player path. */
let media = null;
/** Why the reader path is unavailable, in words, or null. */
let fallbackReason = null;
let source = { width: 0, height: 0 };
let duration = 0;
let section = { start: 0, end: 0 };
let canRead = false;      // the demuxer and WebCodecs between them
let canPlay = false;      // the browser's own player
let exporting = false;
let abortController = null;
let lastResultUrl = null;
/** Set while "Play the section" is looping, so playback stops at the mark. */
let loopingSection = false;

const bar = new RangeBar(el.rangebar, {
  onSeek(seconds) {
    if (exporting) return;
    loopingSection = false;
    el.preview.currentTime = seconds;
  },
  onAdjust(next) {
    setSection(next.start, next.end);
  },
});

/* ------------------------------------------------------------------ adding */

// The drop zone and the picker: shared, because every tool here needs the
// same one. src/shared/file-picker.js, copied in from shared/js/ by the
// build. The resting label comes off the markup, so it is written once,
// in this tool.toml, rather than here as well.
const picker = wireFilePicker({
  input: el.fileInput,
  dropzone: el.dropzone,
  onFiles(files) {
    const [picked] = files;
    if (picked) loadFile(picked);
  },
});

/* ----------------------------------------------------------------- loading */

/**
 * Ask the <video> element to open the file, and report what it made of it.
 * A browser that will not play a format still says so quickly, so this is also
 * the test for whether the player path is available at all.
 */
function openInPlayer(video, url) {
  return new Promise((resolve) => {
    const done = (result) => {
      clearTimeout(timer);
      video.removeEventListener('loadedmetadata', ok);
      video.removeEventListener('error', bad);
      resolve(result);
    };
    const ok = () => done({
      ok: video.videoWidth > 0 && video.videoHeight > 0,
      width: video.videoWidth,
      height: video.videoHeight,
      duration: Number.isFinite(video.duration) ? video.duration : 0,
    });
    const bad = () => done({ ok: false, width: 0, height: 0, duration: 0 });

    const timer = setTimeout(bad, 15000);
    video.addEventListener('loadedmetadata', ok, { once: true });
    video.addEventListener('error', bad, { once: true });
    video.src = url;
    video.load();
  });
}

async function loadFile(picked) {
  if (exporting) return;

  clearError();
  releaseFile();

  file = picked;
  picker.busy('Reading the file...');

  try {
    objectUrl = URL.createObjectURL(picked);
    const played = await openInPlayer(el.preview, objectUrl);

    try {
      media = await demux(picked);
      fallbackReason = null;
    } catch (error) {
      media = null;
      fallbackReason = error instanceof UnsupportedFile
        ? { key: error.reason, values: error.values }
        : { key: error.message || 'read.unreadable' };
    }

    let decodable = false;
    if (media && hasWebCodecs()) {
      decodable = await canDecode(decoderConfig(media.video));
      if (!decodable) {
        fallbackReason = { key: 'read.nodecoder', values: { codec: media.video.codec } };
      }
    } else if (media && !hasWebCodecs()) {
      fallbackReason = { key: 'read.nowebcodecs' };
    }

    // If the reader and the player disagree about the shape of the picture, one
    // of them is applying a rotation the other is not, and a GIF made from the
    // wrong one would come out on its side. The player is what you are looking
    // at, so it wins and the reader path stands down.
    if (decodable && played.ok
      && (played.width !== media.video.displayWidth || played.height !== media.video.displayHeight)) {
      decodable = false;
      fallbackReason = { key: 'read.turned' };
    }

    canRead = decodable;
    canPlay = played.ok;

    if (!canRead && !canPlay) {
      showError(phrase('open.failed', { reason: why(fallbackReason, 'read.notplayed') }));
      resetView();
      return;
    }

    source = canRead
      ? { width: media.video.displayWidth, height: media.video.displayHeight }
      : { width: played.width, height: played.height };
    duration = played.duration || (media ? media.duration : 0);

    showPreview(played.ok);
    describeSource();

    bar.setSource(duration);
    el.scaleEnd.textContent = formatTime(duration);
    setSection(0, Math.min(duration, DEFAULT_SECTION || duration));
    chooseDefaultWidth();

    el.exportBtn.disabled = false;
    updateSummary();
  } catch (error) {
    console.error(error);
    showError(error?.message || 'That file could not be opened.');
    resetView();
  } finally {
    picker.done();
  }
}

/**
 * The preview is the played file where the browser will play it, and nothing
 * where it will not - an iPhone HEVC clip in a browser with no licence for it
 * can still be converted, because WebCodecs reaches the machine's own decoder,
 * but there is no way to show it moving.
 */
function showPreview(playable) {
  el.stage.style.aspectRatio = `${source.width} / ${source.height}`;
  // Height is capped through the width, so the stage keeps the video's exact
  // shape - see the note on .stage in styles.css.
  el.stage.style.maxWidth = `calc(52vh * ${source.width / source.height})`;

  el.preview.hidden = !playable;
  el.stageNote.hidden = playable;
  if (!playable) {
    el.stageNote.textContent = 'This browser will not play this file, so there is no preview. '
      + 'The frames are still read and converted - mark the section by its times below.';
  }
}

function describeSource() {
  el.source.hidden = false;
  el.srcName.textContent = file.name;
  el.srcSize.textContent = formatBytes(file.size);
  el.srcFrame.textContent = `${source.width} x ${source.height}`;
  el.srcLength.textContent = duration ? formatTime(duration) : 'unknown';

  if (media) {
    const turned = media.video.rotation ? `, turned ${media.video.rotation} degrees` : '';
    el.srcCodec.textContent = `${media.video.codec} (${media.video.entryType})${turned}`;
  } else {
    el.srcCodec.textContent = "read by the browser's own player";
  }

  el.srcPath.textContent = canRead ? 'WebCodecs, frame by frame' : 'the player, one seek per frame';

  el.pathNote.hidden = canRead;
  if (!canRead) {
    el.pathNote.textContent = phrase('path.seek', {
      reason: why(fallbackReason, 'read.layout'),
    });
  }
}

function releaseFile() {
  if (objectUrl) {
    el.preview.removeAttribute('src');
    el.preview.load();
    URL.revokeObjectURL(objectUrl);
    objectUrl = null;
  }
  media = null;
  file = null;
  duration = 0;
}

function resetView() {
  el.source.hidden = true;
  el.pathNote.hidden = true;
  releaseFile();
}

/* ----------------------------------------------------------- the section */

function setSection(start, end) {
  section = {
    start: Math.max(0, Math.min(start, duration)),
    end: Math.max(0, Math.min(end, duration)),
  };
  if (section.end < section.start) section = { start: section.end, end: section.start };

  bar.setSelection(section.start, section.end);
  el.startTime.value = formatTime(section.start);
  el.endTime.value = formatTime(section.end);
  updateSummary();
}

el.preview.addEventListener('timeupdate', () => {
  bar.setPlayhead(el.preview.currentTime);
  if (loopingSection && el.preview.currentTime >= section.end) {
    el.preview.pause();
    el.preview.currentTime = section.start;
    loopingSection = false;
  }
});

el.preview.addEventListener('seeked', () => bar.setPlayhead(el.preview.currentTime));

for (const [input, which] of [[el.startTime, 'start'], [el.endTime, 'end']]) {
  input.addEventListener('change', () => {
    const value = parseTime(input.value);
    if (value === null) {
      // Put back what it was rather than arguing: the field is a shorthand for
      // the bar, and the bar always has an answer.
      input.value = formatTime(section[which]);
      return;
    }
    setSection(
      which === 'start' ? value : section.start,
      which === 'end' ? value : section.end,
    );
  });
}

el.markIn.addEventListener('click', () => setSection(el.preview.currentTime, section.end));
el.markOut.addEventListener('click', () => setSection(section.start, el.preview.currentTime));
el.wholeClip.addEventListener('click', () => setSection(0, duration));

el.playSection.addEventListener('click', () => {
  if (exporting || el.preview.hidden) return;
  el.preview.currentTime = section.start;
  loopingSection = true;
  el.preview.play().catch(() => { loopingSection = false; });
});

// I and O, the marks every editor since the tape machine has used. Ignored
// while a field has focus, where they are just letters.
window.addEventListener('keydown', (event) => {
  if (exporting || el.sectionCard.hidden) return;
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  const tag = document.activeElement?.tagName;
  if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;

  if (event.key === 'i' || event.key === 'I') {
    setSection(el.preview.currentTime, section.end);
  } else if (event.key === 'o' || event.key === 'O') {
    setSection(section.start, el.preview.currentTime);
  } else {
    return;
  }
  event.preventDefault();
});

/* ------------------------------------------------------------- the output */

/**
 * The width to open on: the one the markup prefers, unless the video is
 * smaller than that.
 *
 * Enlarging a GIF past the size of the frames it came from buys nothing and
 * costs four bytes a pixel to make and a proportional file to keep, so a small
 * clip comes down to its own size rather than being blown up to the default.
 * Going up is still allowed - the options are all there - and the note under
 * them says what it would mean.
 *
 * Which width is preferred is read off the markup rather than written here as
 * well, so there is one place to change it.
 */
function chooseDefaultWidth() {
  const presets = [...el.width.options]
    .map((option) => Number(option.value))
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((a, b) => a - b);

  const preferred = Number([...el.width.options].find((option) => option.defaultSelected)?.value);
  const aim = Math.min(preferred || presets[presets.length - 1], source.width);

  const fits = presets.filter((value) => value <= aim);
  el.width.value = fits.length ? String(fits[fits.length - 1]) : 'source';
  el.customWidthField.hidden = true;
}

function chosenWidth() {
  if (el.width.value === 'source') return source.width || 480;
  if (el.width.value === 'custom') {
    return Math.max(16, Math.min(1920, Number(el.customWidth.value) || 480));
  }
  return Number(el.width.value);
}

function plan() {
  const size = outputSize(source.width, source.height, chosenWidth());
  const fps = Math.min(MAX_FPS, Number(el.fps.value) || 12);
  const times = frameTimes({ start: section.start, end: section.end, fps });
  return { size, fps, times };
}

el.width.addEventListener('change', () => {
  el.customWidthField.hidden = el.width.value !== 'custom';
  if (el.width.value === 'custom' && source.width) {
    el.customWidth.value = String(Math.min(1920, source.width));
  }
  updateSummary();
});

for (const input of [el.customWidth, el.fps, el.dither, el.loop]) {
  input.addEventListener('change', updateSummary);
}

function updateSummary() {
  if (!source.width) return;

  const { size, times } = plan();
  const span = Math.max(0, section.end - section.start);

  el.sumSection.textContent = `${formatTime(section.start)} to ${formatTime(section.end)}`
    + ` (${span.toFixed(2)}s)`;
  el.sumSize.textContent = `${size.width} x ${size.height}`
    + ` (from ${source.width} x ${source.height})`;
  el.sumFrames.textContent = `${times.length.toLocaleString()}`;

  const { low, high } = estimateBytes({ frames: times.length, ...size });
  el.sumBytes.textContent = `${formatBytes(low)} to ${formatBytes(high)}`;

  el.widthNote.hidden = size.width <= source.width;
  el.widthNote.textContent = `That is wider than the video itself (${source.width} px), `
    + 'which cannot add detail that was never there - only bytes.';

  const memory = workingBytes({ frames: times.length, ...size });
  el.memoryNote.hidden = memory < (300 << 20);
  el.memoryNote.textContent = `Every frame is held in memory while the palette is chosen, `
    + `which for these settings is about ${formatBytes(memory)}. `
    + (memory > MEMORY_LIMIT
      ? 'That is more than this tool will attempt - shorten the section, or drop the width or the frame rate.'
      : 'A shorter section, a smaller width or a lower frame rate all bring it down.');

  el.exportBtn.disabled = exporting || memory > MEMORY_LIMIT || span <= 0;
}

/* ------------------------------------------------------------------ export */

function showError(message) {
  el.error.textContent = message;
  el.error.hidden = false;
}

function clearError() {
  el.error.hidden = true;
  el.error.textContent = '';
}

function setProgress({ phase, done, total }) {
  // Reading the frames is most of the wait on the player path and about half of
  // it on the reader path, so the bar gives it the first two thirds rather than
  // running to the end twice.
  const share = phase === 'reading' ? 0.65 : 0.35;
  const base = phase === 'reading' ? 0 : 0.65;
  const fraction = total > 0 ? base + share * Math.min(1, done / total) : base;
  el.progressBar.style.width = `${(fraction * 100).toFixed(1)}%`;

  el.progressLabel.textContent = phase === 'reading'
    ? `Reading frame ${done.toLocaleString()} of ${total.toLocaleString()}`
    : `Writing frame ${done.toLocaleString()} of ${total.toLocaleString()}`;
}

function outputFilename() {
  const base = (file?.name ?? 'video').replace(/\.[^.]+$/, '');
  return `${base}.gif`;
}

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

async function runExport() {
  if (exporting || !file) return;

  const { size, fps, times } = plan();
  if (!times.length) {
    showError('That section is too short to take a frame from.');
    return;
  }
  if (workingBytes({ frames: times.length, ...size }) > MEMORY_LIMIT) {
    showError('That would need more memory than this tool will ask a browser for. '
      + 'Shorten the section, or drop the width or the frame rate.');
    return;
  }

  clearError();
  exporting = true;
  loopingSection = false;
  abortController = new AbortController();

  el.exportBtn.disabled = true;
  el.cancelBtn.hidden = false;
  el.progress.hidden = false;
  el.result.hidden = true;
  bar.setEnabled(false);
  el.preview.pause();
  setProgress({ phase: 'reading', done: 0, total: times.length });

  const histogram = new ColorHistogram();
  // The palette does not need every pixel of every frame to be right, and a
  // long clip at a large size is tens of millions of them.
  const step = Math.max(1, Math.ceil((times.length * size.width * size.height) / PALETTE_SAMPLE));

  try {
    const frames = canRead
      ? await framesByDecoding({
        file, media, times, ...size, histogram, step,
        onProgress: setProgress, signal: abortController.signal,
      })
      : await framesByPlaying({
        video: el.preview, times, ...size, histogram, step,
        onProgress: setProgress, signal: abortController.signal,
      });

    const delays = frameDelays(times, section.end);

    const result = await encodeGif({
      frames,
      histogram,
      delays,
      ...size,
      colors: MAX_COLORS,
      dither: el.dither.value === 'on',
      loop: el.loop.checked,
      onProgress: setProgress,
      signal: abortController.signal,
    });

    if (lastResultUrl) URL.revokeObjectURL(lastResultUrl);
    lastResultUrl = URL.createObjectURL(result.blob);

    el.resultImage.src = lastResultUrl;
    el.download.href = lastResultUrl;
    el.download.download = outputFilename();
    el.resultInfo.textContent = [
      `${size.width} x ${size.height}`,
      `${result.written} frame${result.written === 1 ? '' : 's'}`
        + (result.dropped ? ` (${result.dropped} identical, dropped)` : ''),
      `${fps} fps`,
      `${result.colors} colours`,
      formatBytes(result.blob.size),
    ].join(' · ');
    el.result.hidden = false;
    el.progress.hidden = true;
    el.result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (error) {
    el.progress.hidden = true;
    if (error?.name !== 'AbortError') {
      showError(error?.message || 'Something went wrong while making the GIF.');
      console.error(error);
    }
  } finally {
    exporting = false;
    abortController = null;
    el.cancelBtn.hidden = true;
    bar.setEnabled(true);
    updateSummary();
  }
}

el.exportBtn.addEventListener('click', runExport);
el.cancelBtn.addEventListener('click', () => abortController?.abort());

window.addEventListener('beforeunload', (event) => {
  if (!exporting) return;
  event.preventDefault();
  event.returnValue = ''; // still required by some browsers to trigger the prompt
});

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
 * but "nothing has carried your video away". That is the part that matters, and
 * the part a sceptical visitor can watch hold in real time.
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
