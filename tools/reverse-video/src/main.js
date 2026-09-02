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
import { hasWebCodecs, hasEncoder, canDecode } from './shared/video-support.js';

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
const worker = document.createElement('video');
worker.muted = true;
worker.playsInline = true;
worker.preload = 'auto';

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

/* ------------------------------------------------------------------ loading */

async function loadFile(picked) {
  if (exporting) return;

  clearError();
  releaseFile();

  // Nothing may be exported while this runs. Opening a file takes a moment -
  // the player has to read it, the demuxer has to walk it, and on the playback
  // path a second of it is played to measure the frame rate - and for that
  // moment the page is still describing the file before this one. Leaving the
  // button live is how "reverse" gets pressed against a half-open file.
  loading = true;
  file = picked;
  el.exportBtn.disabled = true;
  picker.busy(phrase('step.reading'));

  try {
    objectUrl = URL.createObjectURL(picked);
    const played = await openInPlayer(el.preview, objectUrl);
    if (played.ok) await openInPlayer(worker, objectUrl);

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
    // of them is applying a rotation the other is not. The player is what you
    // are looking at, so it wins and the exact path stands down - the same rule
    // /crop-video/ uses, for the same reason.
    if (decodable && played.ok
      && (played.width !== media.video.displayWidth
        || played.height !== media.video.displayHeight)) {
      decodable = false;
      fallbackReason = { key: 'read.turned' };
    }

    canReverseExactly = decodable;
    canPlay = played.ok;

    if (!canReverseExactly && !canPlay) {
      showError(phrase('open.failed', { reason: why(fallbackReason, 'read.notplayed') }));
      resetView();
      return;
    }
    if (!hasEncoder()) {
      showError(phrase('nocodec.file'));
      resetView();
      return;
    }

    source = canReverseExactly
      ? { width: media.video.displayWidth, height: media.video.displayHeight }
      : { width: played.width, height: played.height };
    duration = played.duration || (media ? media.duration : 0);

    if (canReverseExactly) {
      fps = averageFps(media.video);
      fpsMeasured = true;
      frames = media.video.samples.length;
    } else {
      // Out on the playback path the file's own frame times cannot be seen, so
      // the clip is sampled at a fixed rate - measured here if the browser will
      // report one, assumed if it will not. The page says which.
      picker.busy(phrase('step.measuring'));
      const measured = await measureFps(worker);
      fps = measured.fps;
      fpsMeasured = measured.measured;
      frames = Math.max(1, Math.floor(duration * fps));
    }

    showPreview(played.ok);
    describeSource(played);

    el.exportBtn.disabled = false;
    updateAudioNote();
    updateSummary();
  } catch (error) {
    console.error(error);
    // The leaf modules throw keys; a browser that failed for its own reasons
    // throws a sentence, and phrase() hands back what it does not recognise.
    showError(error?.message
      ? phrase(error.message, error.values) : phrase('open.notopened'));
    resetView();
  } finally {
    loading = false;
    picker.done();
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

function releaseFile() {
  if (objectUrl) {
    el.preview.removeAttribute('src');
    el.preview.load();
    worker.removeAttribute('src');
    worker.load();
    URL.revokeObjectURL(objectUrl);
    objectUrl = null;
  }
  media = null;
  file = null;
}

function resetView() {
  el.exportBtn.disabled = true;
  el.source.hidden = true;
  el.previewWrap.hidden = true;
  el.stageNote.hidden = true;
  el.pathNote.hidden = true;
  releaseFile();
}

/* ------------------------------------------------------------- the output */

function updateAudioNote() {
  const off = !el.keepAudio.checked;
  if (off) {
    el.audioNote.textContent = phrase('sound.off');
    return;
  }
  el.audioNote.textContent = phrase(canReverseExactly && media?.audio
    ? 'sound.exact' : 'sound.player');
}

/** What the output frame will be: the picture as watched, at even numbers. */
function outputFrame() {
  return {
    width: Math.max(2, Math.floor(source.width / 2) * 2),
    height: Math.max(2, Math.floor(source.height / 2) * 2),
  };
}

function updateSummary() {
  if (!source.width) return;

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
  if (exporting || loading || !file) return;

  clearError();
  exporting = true;
  abortController = new AbortController();

  el.exportBtn.disabled = true;
  el.cancelBtn.hidden = false;
  el.progress.hidden = false;
  el.result.hidden = true;
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
    el.exportBtn.disabled = false;
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
