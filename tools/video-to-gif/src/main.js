/** UI wiring and application state. */

import { phrase } from './shared/phrases.js';
import { decoderConfig } from './shared/webcodecs.js';
import { sizeText } from './shared/format.js';
import { openInPlayer } from './shared/media.js';
import { messageBox } from './shared/message-box.js';
import { wireFilePicker } from './shared/file-picker.js';
import { demux, UnsupportedFile, UnsupportedTimeline } from './shared/mp4-reader.js';
import { framesByDecoding, framesByPlaying } from './frames.js';
import { encodeGif, ColorHistogram, MAX_COLORS } from './encode.js';
import { RangeBar, formatTime, parseTime } from './range.js';
import { frameCount, frameTimes, frameDelays, outputSize, workingMemory, planningLimit, smallerWidth, estimateBytes, MAX_FPS } from './plan.js';
import { throwIfAborted } from './shared/errors.js';
import { hasWebCodecs, canDecode } from './support.js';
import { makeExample } from './example.js';

/**
 * A reader refusal, in the reader's language. The demuxer is copied byte for
 * byte into fifteen languages, so what it hands back is a phrase key and its
 * values; `absent` is the sentence for the file that was never given to it at
 * all - the browser's own player took it instead.
 */
function why(fallback, absent) {
  return knownReason(fallback?.key ?? absent, fallback?.values);
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
  smallerWidth: $('smaller-width'),
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
};

const { show: showError, clear: clearError } = messageBox(el.error);
const formatBytes = (n) => sizeText(n, phrase, { kb: 0, mb: 1, gb: 'size.gb' });
const phraseKeys = new Set(['phrases', 'frame-phrases']
  .flatMap(id => [...($(id)?.querySelectorAll('[data-phrase]') ?? [])])
  .map(node => node.dataset.phrase));
const knownReason = (key, values) => phraseKeys.has(key) ? phrase(key, values) : String(key || '');

/**
 * How long a section the tool starts you off with when the clip is longer.
 *
 * A GIF of a whole two-minute video is not something anybody wants and is
 * something a browser can run out of memory making, so the default marks a few
 * seconds rather than everything. The bar still shows the whole clip, so what
 * has been chosen for you is visible rather than silent.
 */
const DEFAULT_SECTION = 6;

/** Device memory is an optional coarse hint; the fallback policy stays bounded. */
const MEMORY_LIMIT = planningLimit(navigator.deviceMemory);

/** Where the histogram stops needing more pixels to choose a good palette. */
const PALETTE_SAMPLE = 4_000_000;

/** @type {File|null} */
let file = null;
let objectUrl = null;
/** What demux() found, or null if this file is for the player path. */
let media = null;
let sourcePacketBytes = 0;
/** Why the reader path is unavailable, in words, or null. */
let fallbackReason = null;
let source = { width: 0, height: 0 };
let duration = 0;
let section = { start: 0, end: 0 };
let canRead = false;      // the demuxer and WebCodecs between them
let canPlay = false;      // the browser's own player
let exporting = false;
let loading = false;
let loadGeneration = 0;
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
  example: makeExample,
});

/* ----------------------------------------------------------------- loading */

async function loadFile(picked) {
  if (exporting) return;
  const generation = ++loadGeneration;
  loading = true;
  el.exportBtn.disabled = true;

  clearError();
  releaseFile();

  file = picked;
  picker.busy(phrase('step.reading'));

  try {
    objectUrl = URL.createObjectURL(picked);
    const played = await openInPlayer(el.preview, objectUrl);
    if (generation !== loadGeneration) return;
    let inputMedia = null;
    let inputFallback = null;
    try {
      inputMedia = await demux(picked);
    } catch (error) {
      if (error instanceof UnsupportedTimeline) throw error;
      inputFallback = error instanceof UnsupportedFile
        ? { key: error.reason, values: error.values }
        : { key: error.message || 'read.unreadable' };
    }

    if (generation !== loadGeneration) return;
    let decodable = false;
    if (inputMedia && hasWebCodecs()) {
      decodable = await canDecode(decoderConfig(inputMedia.video));
      if (!decodable) {
        inputFallback = { key: 'read.nodecoder', values: { codec: inputMedia.video.codec } };
      }
    } else if (inputMedia && !hasWebCodecs()) {
      inputFallback = { key: 'read.nowebcodecs' };
    }

    // If the reader and the player disagree about the shape of the picture, one
    // of them is applying a rotation the other is not, and a GIF made from the
    // wrong one would come out on its side. The player is what you are looking
    // at, so it wins and the reader path stands down.
    if (decodable && played.ok
      && (played.width !== inputMedia.video.displayWidth || played.height !== inputMedia.video.displayHeight)) {
      decodable = false;
      inputFallback = { key: 'read.turned' };
    }

    if (generation !== loadGeneration) return;
    media = inputMedia;
    sourcePacketBytes = inputMedia?.video.samples.reduce((n, sample) => Math.max(n, sample.size), 0) || 0;
    fallbackReason = inputFallback;
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
    if (generation !== loadGeneration) return;
    console.error(error);
    // Only declared leaf keys are translated; native prose is a value in
    // a fixed template, so quotes in an exception cannot become a selector.
    showError(error?.message ? phrase('open.notopened.detail', { why: knownReason(error.message) }) : phrase('open.notopened'));
    resetView();
  } finally {
    if (generation === loadGeneration) {
      loading = false;
      picker.done();
      updateSummary();
    }
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
    el.stageNote.textContent = phrase('preview.none');
  }
}

function describeSource() {
  el.source.hidden = false;
  el.srcName.textContent = file.name;
  el.srcSize.textContent = formatBytes(file.size);
  el.srcFrame.textContent = phrase('size.plain',
    { width: source.width, height: source.height });
  el.srcLength.textContent = duration ? formatTime(duration) : phrase('len.unknown');

  if (media) {
    el.srcCodec.textContent = media.video.rotation
      ? phrase('src.codec.turned', {
        codec: media.video.codec,
        entry: media.video.entryType,
        degrees: media.video.rotation,
      })
      : phrase('src.codec', { codec: media.video.codec, entry: media.video.entryType });
  } else {
    el.srcCodec.textContent = phrase('src.byplayer');
  }

  el.srcPath.textContent = phrase(canRead ? 'path.codecs' : 'path.player');

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
  const modest = matchMedia('(max-width: 600px)').matches
    || (Number.isFinite(navigator.deviceMemory) && navigator.deviceMemory <= 2);
  const aim = Math.min(modest ? 240 : preferred || presets[presets.length - 1], source.width);

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
  const frames = frameCount({ start: section.start, end: section.end, fps });
  return { size, fps, frames };
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

function memorySettings() {
  return {
    sourceWidth: canRead ? media.video.codedWidth : source.width,
    sourceHeight: canRead ? media.video.codedHeight : source.height,
    packetBytes: canRead ? sourcePacketBytes : 0,
  };
}

el.smallerWidth.addEventListener('click', () => {
  if (loading || exporting || !source.width) return;
  const { size, frames } = plan(), native = memorySettings();
  const width = smallerWidth({ frames, width: size.width,
    sourceWidth: source.width, sourceHeight: source.height,
    codedWidth: native.sourceWidth, codedHeight: native.sourceHeight,
    packetBytes: native.packetBytes, limit: MEMORY_LIMIT });
  if (width === null) return;
  el.width.value = 'custom';
  el.customWidth.value = String(width);
  el.customWidthField.hidden = false;
  updateSummary();
});

function updateSummary() {
  if (!source.width) return;

  const { size, frames } = plan();
  const span = Math.max(0, section.end - section.start);

  el.sumSection.textContent = phrase('sum.section', {
    from: formatTime(section.start),
    to: formatTime(section.end),
    span: span.toFixed(2),
  });
  el.sumSize.textContent = phrase('size.from', {
    width: size.width,
    height: size.height,
    fromWidth: source.width,
    fromHeight: source.height,
  });
  el.sumFrames.textContent = frames.toLocaleString();

  const { low, high } = estimateBytes({ frames, ...size });
  el.sumBytes.textContent = phrase('sum.bytes',
    { low: formatBytes(low), high: formatBytes(high) });

  el.widthNote.hidden = size.width <= source.width;
  el.widthNote.textContent = phrase('note.wider', { px: source.width });

  const native = memorySettings();
  const memory = workingMemory({ frames, ...size, ...native });
  el.memoryNote.hidden = false;
  // Sentence joining follows each language's own punctuation convention.
  el.memoryNote.textContent = phrase('join.sentences', {
    a: phrase('note.memory', { size: formatBytes(memory), limit: formatBytes(MEMORY_LIMIT) }),
    b: phrase(memory > MEMORY_LIMIT ? 'note.memory.toobig' : 'note.memory.ok'),
  });
  const width = memory > MEMORY_LIMIT ? smallerWidth({ frames, width: size.width,
    sourceWidth: source.width, sourceHeight: source.height,
    codedWidth: native.sourceWidth, codedHeight: native.sourceHeight,
    packetBytes: native.packetBytes, limit: MEMORY_LIMIT }) : null;
  el.smallerWidth.hidden = width === null;
  el.smallerWidth.disabled = loading || exporting;
  el.exportBtn.disabled = loading || exporting || !file || (!canRead && !canPlay)
    || memory > MEMORY_LIMIT || span <= 0;
}

/* ------------------------------------------------------------------ export */

function setProgress({ phase, done, total }) {
  // Reading the frames is most of the wait on the player path and about half of
  // it on the reader path, so the bar gives it the first two thirds rather than
  // running to the end twice.
  const share = phase === 'reading' ? 0.65 : 0.35;
  const base = phase === 'reading' ? 0 : 0.65;
  const fraction = total > 0 ? base + share * Math.min(1, done / total) : base;
  el.progressBar.style.width = `${(fraction * 100).toFixed(1)}%`;

  el.progressLabel.textContent = phrase(
    phase === 'reading' ? 'step.readframe' : 'step.writeframe',
    { done: done.toLocaleString(), total: total.toLocaleString() },
  );
}

function outputFilename() {
  const base = (file?.name ?? 'video').replace(/\.[^.]+$/, '');
  return `${base}.gif`;
}

async function runExport() {
  if (exporting || loading || !file) return;

  const { size, fps, frames: count } = plan();
  if (workingMemory({ frames: count, ...size, ...memorySettings() }) > MEMORY_LIMIT) {
    showError(phrase('export.toobig'));
    return;
  }
  const times = frameTimes({ start: section.start, end: section.end, fps });
  // The controls may describe the next run while frames are being collected;
  // their new values must not change the timing or encoding of this one.
  const delays = frameDelays(times, section.end);
  const dither = el.dither.value === 'on';
  const loop = el.loop.checked;
  const name = outputFilename();
  const inputFile = file;
  const inputMedia = media;
  if (!times.length) {
    showError(phrase('export.tooshort'));
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
        file: inputFile, media: inputMedia, times, ...size, histogram, step,
        onProgress: setProgress, signal: abortController.signal,
      })
      : await framesByPlaying({
        video: el.preview, times, ...size, histogram, step,
        onProgress: setProgress, signal: abortController.signal,
      });

    const result = await encodeGif({
      frames,
      histogram,
      delays,
      ...size,
      colors: MAX_COLORS,
      dither,
      loop,
      onProgress: setProgress,
      signal: abortController.signal,
    });

    throwIfAborted(abortController.signal);
    if (lastResultUrl) URL.revokeObjectURL(lastResultUrl);
    lastResultUrl = URL.createObjectURL(result.blob);

    el.resultImage.src = lastResultUrl;
    el.download.href = lastResultUrl;
    el.download.download = name;
    const written = phrase(result.written === 1 ? 'n.frame.one' : 'n.frame.many',
      { n: result.written });
    el.resultInfo.textContent = [
      phrase('size.plain', { width: size.width, height: size.height }),
      result.dropped
        ? phrase('out.dropped', { frames: written, n: result.dropped })
        : written,
      ...(result.continued ? [phrase('out.holds', { n: result.continued })] : []),
      phrase('out.fps', { n: fps }),
      phrase('out.colours', { n: result.colors }),
      formatBytes(result.blob.size),
    ].reduce((a, b) => phrase('join.dot', { a, b }));
    el.result.hidden = false;
    el.progress.hidden = true;
    el.result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (error) {
    el.progress.hidden = true;
    if (!abortController.signal.aborted && error?.name !== 'AbortError') {
      showError(error?.message ? phrase('export.failed.detail', { why: knownReason(error.message) }) : phrase('export.failed'));
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

/* -------------------------------------------------------------------- boot */

window.addEventListener('error', (event) => {
  showError(phrase('error.broke', { detail: event.message }));
});
window.addEventListener('unhandledrejection', (event) => {
  showError(phrase('error.broke', { detail: event.reason?.message ?? event.reason }));
});

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
