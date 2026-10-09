/** UI wiring and application state. */

import { phrase } from './shared/phrases.js';
import { decoderConfig, averageFps } from './shared/webcodecs.js';
import { sizeText, durationText } from './shared/format.js';
import { openInPlayer } from './shared/media.js';
import { messageBox } from './shared/message-box.js';
import { wireFilePicker } from './shared/file-picker.js';
import { demux, UnsupportedFile } from './shared/mp4-reader.js';
import { reverseExact } from './reverse.js';
import { measureFps, reverseByPlayback } from './playback.js';
import { gopRanges } from './timeline.js';
import { audioDecoderConfig, audioMemoryEstimate } from './audio.js';
import { hasWebCodecs, hasEncoder, canDecode } from './shared/video-support.js';
import { makeExample } from './example.js';

/**
 * A reader refusal, in the reader's language. The demuxer and the writer are
 * copied byte for byte into fifteen languages, so what they hand back is a
 * phrase key and its values; `absent` is the sentence for the file that was
 * never given to them at all - the browser's own player took it instead.
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
  srcAudio: $('src-audio'),
  previewWrap: $('preview-wrap'),
  preview: $('preview'),
  stageNote: $('stage-note'),
  pathNote: $('path-note'),
  exportCard: $('export-card'),
  quality: $('quality'),
  keepAudio: $('keep-audio'),
  audioNote: $('audio-note'),
  audioMemory: $('audio-memory'),
  sumSize: $('sum-size'),
  sumLength: $('sum-length'),
  sumFrames: $('sum-frames'),
  sumPath: $('sum-path'),
  exportBtn: $('export'),
  cancelBtn: $('cancel'),
  progress: $('progress'),
  progressBar: $('progress-bar'),
  progressLabel: $('progress-label'),
  error: $('error'),
  result: $('result'),
  resultVideo: $('result-video'),
  resultInfo: $('result-info'),
  download: $('download'),
  privacyToggle: $('privacy-toggle'),
  privacyPanel: $('privacy-panel'),
};

const { show: showError, clear: clearError } = messageBox(el.error);
const formatBytes = (n) => sizeText(n, phrase, { kb: 0, mb: 1, gb: 'size.gb' });
const formatDuration = (seconds) => durationText(seconds, phrase);

/** @type {File|null} */
let file = null;
let objectUrl = null;
/** What demux() found, or null if this file is for the playback path. */
let media = null;
/** Why the exact path is unavailable, in words, or null. */
let fallbackReason = null;
let source = { width: 0, height: 0 };
let duration = 0;
let frames = 0;
let fps = 30;
let fpsMeasured = false;
let canReverseExactly = false;
let canPlay = false;
/** True from the moment a file is chosen until the page has finished reading it. */
let loading = false;
let loadId = 0;
let loadController = null;
let exporting = false;
let abortController = null;
let lastResultUrl = null;

/**
 * A second <video>, never shown, which the playback path steps through.
 *
 * Separate from the preview on purpose: measuring the frame rate means playing
 * a second of the clip muted, and stepping through it means seeking a few
 * hundred times. Doing either to the player you are watching would be rude, and
 * would also mean the export moved the picture under you while it ran.
 */
let worker = null;

function playbackWorker() {
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  return video;
}

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

/* ------------------------------------------------------------------ loading */

async function loadFile(picked) {
  if (!picked || exporting) return;

  clearError();
  releaseFile();
  const mine = loadId;
  const controller = new AbortController();
  loadController = controller;
  loading = true;
  file = picked;
  picker.busy(phrase('step.reading'));

  try {
    objectUrl = URL.createObjectURL(picked);
    const currentWorker = playbackWorker();
    worker = currentWorker;
    const played = await openInPlayer(el.preview, objectUrl);
    if (mine !== loadId) return;
    if (played.ok) {
      await openInPlayer(currentWorker, objectUrl);
      if (mine !== loadId) return;
    }

    let found = null;
    let refused = null;
    try {
      found = await demux(picked);
    } catch (error) {
      if (mine !== loadId) return;
      refused = error instanceof UnsupportedFile
        ? { key: error.reason, values: error.values }
        : { key: error.message || 'read.unreadable' };
    }
    if (mine !== loadId) return;

    let decodable = false;
    if (found && hasWebCodecs()) {
      decodable = await canDecode(decoderConfig(found.video));
      if (mine !== loadId) return;
      if (!decodable) refused = { key: 'read.nodecoder', values: { codec: found.video.codec } };
    } else if (found) {
      refused = { key: 'read.nowebcodecs' };
    }

    // The player is what the visitor sees. A shape disagreement still selects
    // playback, but the decision belongs to this load rather than a later one.
    if (decodable && played.ok
      && (played.width !== found.video.displayWidth
        || played.height !== found.video.displayHeight)) {
      decodable = false;
      refused = { key: 'read.turned' };
    }

    if (!decodable && !played.ok) {
      showError(phrase('open.failed', { reason: why(refused, 'read.notplayed') }));
      resetView();
      return;
    }
    if (!hasEncoder()) {
      showError(phrase('nocodec.file'));
      resetView();
      return;
    }

    const size = decodable
      ? { width: found.video.displayWidth, height: found.video.displayHeight }
      : { width: played.width, height: played.height };
    const seconds = played.duration || (found ? found.duration : 0);
    let rate;
    let measured;
    let count;
    if (decodable) {
      rate = averageFps(found.video);
      measured = true;
      count = found.video.samples.length;
    } else {
      picker.busy(phrase('step.measuring'));
      const answer = await measureFps(currentWorker, 1, controller.signal);
      if (mine !== loadId) return;
      rate = answer.fps;
      measured = answer.measured;
      count = Math.max(1, Math.floor(seconds * rate));
    }

    media = found;
    fallbackReason = refused;
    canReverseExactly = decodable;
    canPlay = played.ok;
    source = size;
    duration = seconds;
    fps = rate;
    fpsMeasured = measured;
    frames = count;
    loading = false;
    showPreview(played.ok);
    describeSource(played);
    updateAudioNote();
    updateSummary();
    el.exportCard.inert = false;
    el.exportBtn.disabled = false;
  } catch (error) {
    if (mine !== loadId) return;
    console.error(error);
    showError(error?.message
      ? phrase(error.message, error.values) : phrase('open.notopened'));
    resetView();
  } finally {
    if (mine === loadId) {
      loading = false;
      loadController = null;
      picker.done();
    }
  }
}

function showPreview(playable) {
  el.previewWrap.hidden = !playable;
  el.stageNote.hidden = playable;

  if (!playable) {
    // The exact path does not need the player at all: it reads the file itself.
    // So a clip this browser has no licence to play - iPhone HEVC in Chrome, the
    // usual case - is still reversible, it just cannot be shown first.
    el.stageNote.textContent = phrase('preview.none');
  }
}

function describeSource(played) {
  el.source.hidden = false;
  el.srcName.textContent = file.name;
  el.srcSize.textContent = formatBytes(file.size);
  el.srcFrame.textContent = phrase('size.plain',
    { width: source.width, height: source.height });
  el.srcLength.textContent = duration ? formatDuration(duration) : phrase('src.unknown');

  if (media) {
    el.srcCodec.textContent = media.video.rotation
      ? phrase('src.codec.turned', {
        codec: media.video.codec,
        entry: media.video.entryType,
        degrees: media.video.rotation,
      })
      : phrase('src.codec', { codec: media.video.codec, entry: media.video.entryType });
    el.srcAudio.textContent = media.audio
      ? phrase(media.audio.channels === 1 ? 'src.audio.one' : 'src.audio.many', {
        entry: media.audio.entryType,
        n: media.audio.channels,
        rate: Math.round(media.audio.sampleRate),
      })
      : phrase('src.audio.none');
  } else {
    el.srcCodec.textContent = phrase(played.ok ? 'src.byplayer' : 'src.unknown');
    el.srcAudio.textContent = phrase('src.audio.whatever');
  }

  el.pathNote.hidden = canReverseExactly;
  if (!canReverseExactly) {
    el.pathNote.textContent = phrase('path.record', {
      reason: why(fallbackReason, 'read.layout'),
      rate: phrase(fpsMeasured ? 'path.fps.measured' : 'path.fps.assumed', { fps }),
    });
  }
}

function clearResult() {
  el.result.hidden = true;
  el.resultVideo.pause();
  el.resultVideo.removeAttribute('src');
  el.resultVideo.load();
  el.download.removeAttribute('href');
  if (lastResultUrl) URL.revokeObjectURL(lastResultUrl);
  lastResultUrl = null;
}

function releaseFile() {
  loadId++;
  loadController?.abort();
  loadController = null;
  loading = false;
  el.preview.pause();
  el.preview.removeAttribute('src');
  el.preview.load();
  if (worker) {
    worker.pause();
    worker.removeAttribute('src');
    worker.load();
    worker = null;
  }
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = null;
  media = null;
  file = null;
  fallbackReason = null;
  source = { width: 0, height: 0 };
  duration = 0;
  frames = 0;
  fps = 30;
  fpsMeasured = false;
  canReverseExactly = false;
  canPlay = false;
  el.exportBtn.disabled = true;
  el.exportCard.inert = true;
  el.source.hidden = true;
  el.previewWrap.hidden = true;
  el.stageNote.hidden = true;
  el.pathNote.hidden = true;
  el.audioMemory.hidden = true;
  clearResult();
}

function resetView() {
  releaseFile();
  picker.done();
  picker.waiting();
}

/* ------------------------------------------------------------- the output */

function updateAudioNote() {
  if (loading || !file || !source.width) return;
  updateAudioMemory();
  const off = !el.keepAudio.checked;
  if (off) {
    el.audioNote.textContent = phrase('sound.off');
    return;
  }
  el.audioNote.textContent = phrase(canReverseExactly && media?.audio
    ? 'sound.exact' : 'sound.player');
}

function updateAudioMemory() {
  el.audioMemory.hidden = false;
  if (!el.keepAudio.checked) {
    el.audioMemory.textContent = phrase('memory.off');
    return;
  }
  if (!canReverseExactly) {
    el.audioMemory.textContent = phrase('memory.unknown', { file: formatBytes(file.size) });
    return;
  }
  if (!media.audio) {
    el.audioMemory.textContent = phrase('memory.none');
    return;
  }
  const config = audioDecoderConfig(media.audio);
  const byTrack = Boolean(config) && typeof window.AudioDecoder === 'function';
  const estimate = audioMemoryEstimate({
    duration: media.audio.duration / media.audio.timescale,
    sampleRate: config?.sampleRate ?? 48000,
    channels: config?.numberOfChannels ?? media.audio.channels,
  });
  if (!estimate) {
    el.audioMemory.textContent = phrase(byTrack ? 'memory.unavailable' : 'memory.unknown',
      { file: formatBytes(file.size) });
    return;
  }
  el.audioMemory.textContent = phrase(byTrack ? 'memory.track' : 'memory.file', {
    pcm: formatBytes(estimate.pcmBytes),
    peak: formatBytes(estimate.assemblyBytes),
    file: formatBytes(file.size),
  });
}

/** What the output frame will be: the picture as watched, at even numbers. */
function outputFrame() {
  return {
    width: Math.max(2, Math.floor(source.width / 2) * 2),
    height: Math.max(2, Math.floor(source.height / 2) * 2),
  };
}

function updateSummary() {
  if (loading || !file || !source.width) return;

  const frame = outputFrame();
  el.sumSize.textContent = frame.width === source.width && frame.height === source.height
    ? phrase('size.plain', { width: frame.width, height: frame.height })
    : phrase('size.evened', {
      width: frame.width,
      height: frame.height,
      fromWidth: source.width,
      fromHeight: source.height,
    });
  el.sumLength.textContent = duration ? formatDuration(duration) : phrase('src.unknown');
  el.sumFrames.textContent = canReverseExactly
    ? phrase('frames.groups', {
      n: frames.toLocaleString(),
      groups: gopRanges(media.video.samples).length.toLocaleString(),
    })
    : phrase('frames.about', { n: frames.toLocaleString(), fps });
  el.sumPath.textContent = phrase(canReverseExactly ? 'path.exact' : 'path.player');
}

el.quality.addEventListener('change', updateSummary);
el.keepAudio.addEventListener('change', updateAudioNote);

/* ------------------------------------------------------------------ export */

function setProgress({ phase, done, total }) {
  const fraction = total > 0 ? Math.min(1, done / total) : 0;

  if (phase === 'preparing') {
    el.progressLabel.textContent = phrase('step.preparing');
  } else if (phase === 'sound-reading') {
    el.progressLabel.textContent = phrase('step.soundreading');
  } else if (phase === 'sound-writing') {
    el.progressLabel.textContent = phrase('step.soundwriting');
  } else if (phase === 'finishing') {
    el.progressLabel.textContent = phrase('step.finishing');
  } else {
    el.progressBar.style.width = `${(fraction * 100).toFixed(1)}%`;
    el.progressLabel.textContent = phrase('step.frame', {
      done: done.toLocaleString(),
      total: total.toLocaleString(),
      percent: Math.round(fraction * 100),
    });
    return;
  }

  // The sound is done after the picture and is a small fraction of the work, so
  // the bar is left where the frames put it rather than starting again at zero.
  if (phase === 'preparing') el.progressBar.style.width = '0%';
}

function outputFilename(extension) {
  const base = (file?.name ?? 'video').replace(/\.[^.]+$/, '');
  return `${base}-reversed.${extension}`;
}

async function runExport() {
  if (exporting || loading || !file || !source.width) return;

  clearError();
  exporting = true;
  abortController = new AbortController();

  el.exportBtn.disabled = true;
  el.cancelBtn.hidden = false;
  el.progress.hidden = false;
  clearResult();
  el.preview.pause();
  setProgress({ phase: 'preparing', done: 0, total: 1 });

  const quality = el.quality.value;
  const keepAudio = el.keepAudio.checked;

  try {
    const result = canReverseExactly
      ? await reverseExact({
        file, media, quality, keepAudio,
        onProgress: setProgress, signal: abortController.signal,
      })
      : await reverseByPlayback({
        file, video: worker, duration, fps, quality, keepAudio,
        onProgress: setProgress, signal: abortController.signal,
      });

    if (result.warning) showError(phrase(result.warning));

    if (lastResultUrl) URL.revokeObjectURL(lastResultUrl);
    lastResultUrl = URL.createObjectURL(result.blob);

    el.resultVideo.src = lastResultUrl;
    el.download.href = lastResultUrl;
    el.download.download = outputFilename(result.extension);
    const frame = outputFrame();
    el.resultInfo.textContent = [
      result.extension.toUpperCase(),
      phrase('size.plain', { width: frame.width, height: frame.height }),
      phrase(result.frames === 1 ? 'n.frame.one' : 'n.frame.many',
        { n: result.frames.toLocaleString() }),
      formatBytes(result.blob.size),
      result.codec,
    ].reduce((a, b) => phrase('join.dot', { a, b }));
    el.result.hidden = false;
    el.progress.hidden = true;
    el.result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (error) {
    el.progress.hidden = true;
    if (error?.name !== 'AbortError') {
      showError(error?.message
        ? phrase(error.message, error.values) : phrase('export.failed'));
      console.error(error);
    }
  } finally {
    exporting = false;
    abortController = null;
    el.cancelBtn.hidden = true;
    el.exportBtn.disabled = loading || !file || !source.width;
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

// Both paths encode, so this is the one thing the tool cannot do without. Said
// now, on an empty page, rather than after somebody has chosen a file and
// waited: a reversal is not something that can be faked with a canvas and a
// recorder, because a recorder writes frames in the order they are painted and
// in real time, which is neither what this needs nor what it promises.
if (!hasEncoder()) {
  showError(phrase('nocodec.page'));
}

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
