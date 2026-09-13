/**
 * UI wiring and application state.
 *
 * The shape of this file follows from what people arrive here with: a GIF
 * that something refused - too big for the chat app, not accepted by the
 * form, rejected by the editor - and the knowledge that "the same thing as
 * an MP4" is what they were asked for. So the page reads the GIF, says what
 * it is and how long it plays, asks the one question a video needs answered
 * that a GIF does not (what colour goes where the GIF was transparent),
 * encodes every frame with the delay the GIF gave it, and opens the result
 * to check it is the length the GIF plays for and has every frame.
 */

import { ltr, phrase } from './shared/phrases.js';
import { messageBox } from './shared/message-box.js';
import { wireFilePicker, readingLabel } from './shared/file-picker.js';
import { sizeText, durationText } from './shared/format.js';
import { decodeGif, GifFormatError, totalDuration } from './shared/gif-decode.js';
import { demux, UnsupportedFile } from './shared/mp4-reader.js';
import { hasWebCodecs, hasEncoder } from './shared/video-support.js';
import { gifToMp4 } from './encode.js';
import {
  bitrateFor, hasTransparency, nominalFps, outputSize, parseHex,
} from './plan.js';
import { bitrateText, frameText, outName, timingText } from './format.js';
import { makeExample } from './example.js';

const $ = (id) => document.getElementById(id);

const el = {
  dropzone: $('dropzone'),
  fileInput: $('file-input'),
  fileRow: $('file-row'),
  fileName: $('file-name'),
  fileFacts: $('file-facts'),
  clearFile: $('clear-file'),
  loadError: $('load-error'),
  loadNote: $('load-note'),
  background: $('background'),
  backgroundRow: $('background-row'),
  backgroundNote: $('background-note'),
  plan: $('plan-line'),
  runCard: $('run-card'),
  run: $('run'),
  cancel: $('cancel'),
  progress: $('progress'),
  progressBar: $('progress-bar'),
  progressLabel: $('progress-label'),
  runError: $('run-error'),
  result: $('result'),
  resultSize: $('result-size'),
  resultSub: $('result-sub'),
  download: $('download'),
  player: $('player'),
  checkLine: $('check-line'),
  resultFacts: $('result-facts'),
  privacyToggle: $('privacy-toggle'),
  privacyPanel: $('privacy-panel'),
};

const { show: showLoadError } = messageBox(el.loadError);
const { show: note } = messageBox(el.loadNote);

/**
 * @typedef {object} Loaded
 * @property {File} file
 * @property {object} gif  what decodeGif() returned
 * @property {number} seconds  how long it plays
 * @property {number} fps  the nominal rate
 * @property {{width: number, height: number, scale: number}} size
 * @property {number} bitrate
 */

/** @type {Loaded|null} */
let loaded = null;
let downloadUrl = '';
let running = null;

/* ------------------------------------------------------------------ loading */

const picker = wireFilePicker({
  input: el.fileInput,
  dropzone: el.dropzone,
  onFiles(files) {
    load(files[0]);
  },
  example: makeExample,
});

async function load(file) {
  if (!file || running) return;

  reset();
  picker.busy(readingLabel(1));

  try {
    if (!hasWebCodecs() || !hasEncoder()) throw new Error('support.nowebcodecs');

    const gif = decodeGif(new Uint8Array(await file.arrayBuffer()));
    if (!gif.frames.length) throw new GifFormatError('gif.noframes');

    const fps = nominalFps(gif.frames);
    const size = outputSize(gif);
    loaded = {
      file,
      gif,
      seconds: totalDuration(gif.frames),
      fps,
      size,
      bitrate: bitrateFor({ width: size.width, height: size.height, fps }),
    };

    el.fileName.textContent = file.name;
    el.fileFacts.textContent = phrase('file.facts', {
      size: sizeOf(file.size),
      frames: gif.frames.length.toLocaleString(),
      length: durationText(loaded.seconds, phrase),
      frame: say(frameText(gif)),
    });
    el.fileRow.hidden = false;

    if (gif.truncated === 'enormous') {
      note(phrase('gif.enormous', { n: gif.frames.length.toLocaleString() }));
    } else if (gif.truncated) {
      note(phrase('gif.midframe'));
    }

    // The one question a video needs answered that a GIF does not. Asked
    // only when the GIF has anywhere it could show through.
    const transparent = hasTransparency(gif.frames);
    el.backgroundRow.hidden = !transparent;
    el.backgroundNote.textContent = phrase(transparent ? 'background.some' : 'background.none');

    refresh();
  } catch (error) {
    showLoadError(messageFor(error));
    picker.waiting();
  } finally {
    picker.done();
  }
}

/* ---------------------------------------------------------------- the plan */

el.background.addEventListener('input', refresh);

/**
 * Say what will be written, and wake or dim the last card: the size, the
 * frames with their timing, and the bitrate, in one line before anything
 * is encoded.
 */
function refresh() {
  if (!loaded) {
    el.plan.textContent = phrase('plan.nofile');
    gate(false);
    return;
  }
  const { gif, size, fps, bitrate, seconds } = loaded;
  el.plan.textContent = phrase(size.scale === 1 && size.width === gif.width && size.height === gif.height
    ? 'plan.same' : 'plan.resized', {
    frame: say(frameText(size)),
    from: say(frameText(gif)),
    frames: gif.frames.length.toLocaleString(),
    timing: say(timingText(gif.frames, fps)),
    length: durationText(seconds, phrase),
    rate: say(bitrateText(bitrate)),
  });
  gate(true);
}

/**
 * Dim the last card until there is something to do, and say why.
 *
 * The picker wakes every inert card the moment a file arrives, which is
 * right for this one: a GIF that could be read is a GIF that can be
 * written. The card is still managed here so a refused file dims it again.
 */
function gate(ready) {
  const line = el.runCard.querySelector('.card-waiting');
  if (ready) {
    el.runCard.removeAttribute('inert');
    line?.remove();
    return;
  }
  el.runCard.setAttribute('inert', '');
  if (!line) {
    const waiting = document.createElement('p');
    waiting.className = 'card-waiting';
    waiting.textContent = phrase('waiting.file');
    el.runCard.querySelector('h2').after(waiting);
  }
}

/* ----------------------------------------------------------------- running */

el.run.addEventListener('click', run);
el.cancel.addEventListener('click', () => running?.abort());
el.clearFile.addEventListener('click', () => {
  reset();
  picker.waiting();
});

async function run() {
  if (!loaded || running) return;

  running = new AbortController();
  el.run.disabled = true;
  el.cancel.hidden = false;
  el.result.hidden = true;
  el.runError.hidden = true;
  el.progress.hidden = false;
  releaseDownload();

  let cancelled = false;
  const started = performance.now();

  try {
    const { gif, size, fps, bitrate } = loaded;
    const out = await gifToMp4({
      gif, size, fps, bitrate,
      background: parseHex(el.background.value),
      signal: running.signal,
      onProgress: setProgress,
    });

    setProgress({ phase: 'checking', done: 1, total: 1 });
    const check = await verify(out.blob, out.seconds, gif.frames.length);

    showResult({ out, check, seconds: (performance.now() - started) / 1000 });
  } catch (error) {
    if (error?.name === 'AbortError' || error?.message === 'aborted') {
      cancelled = true;
      el.progressLabel.textContent = phrase('run.cancelled');
    } else {
      el.runError.textContent = messageFor(error);
      el.runError.hidden = false;
    }
  } finally {
    running = null;
    el.run.disabled = false;
    el.cancel.hidden = true;
    el.progress.hidden = !cancelled;
    if (cancelled) el.progressBar.style.width = '0%';
  }
}

/**
 * Open the finished file again, here, and hold it to two things: that it
 * plays for as long as the GIF does, and that it has one frame for every
 * frame the GIF had. A converter that resampled a slideshow on to a fixed
 * rate, or dropped the frames it could not fit, would still be an MP4.
 */
async function verify(blob, expectedSeconds, expectedFrames) {
  let again;
  try {
    again = await demux(new File([blob], 'check.mp4', { type: 'video/mp4' }));
  } catch (error) {
    return { ok: false, text: { key: 'check.reopen', values: { detail: messageFor(error) } } };
  }

  const drift = Math.abs(again.duration - expectedSeconds);
  if (drift > Math.max(0.05, expectedSeconds * 0.01)) {
    return {
      ok: false,
      text: {
        key: 'check.length',
        values: { got: durationText(again.duration, phrase), want: durationText(expectedSeconds, phrase) },
      },
    };
  }
  if (again.video.samples.length !== expectedFrames) {
    return {
      ok: false,
      text: {
        key: 'check.frames',
        values: { got: again.video.samples.length.toLocaleString(), want: expectedFrames.toLocaleString() },
      },
    };
  }
  return {
    ok: true,
    text: {
      key: 'check.ok',
      values: { length: durationText(again.duration, phrase), frames: expectedFrames.toLocaleString() },
    },
  };
}

function showResult({ out, check, seconds }) {
  const { file, gif, size, fps, bitrate } = loaded;
  const saved = 1 - out.blob.size / file.size;

  el.resultSize.textContent = phrase(saved > 0 ? 'result.ready' : 'result.bigger', {
    size: sizeOf(out.blob.size), percent: Math.abs(Math.round(saved * 100)), from: sizeOf(file.size),
  });
  el.resultSub.textContent = phrase('result.sub');

  el.checkLine.textContent = phrase(check.ok ? 'check.passed' : 'check.failed', { found: say(check.text) });
  el.checkLine.className = `check-line ${check.ok ? 'good' : 'bad'}`;

  const facts = [
    phrase('facts.picture', {
      frame: say(frameText(size)), rate: say(bitrateText(bitrate)), frames: out.frames.toLocaleString(),
    }),
    phrase('facts.timing', { timing: say(timingText(gif.frames, fps)) }),
    phrase(gif.loopCount === null ? 'facts.loop.none' : 'facts.loop.gif'),
    phrase('facts.time', { seconds: durationText(seconds, phrase) }),
  ];
  el.resultFacts.replaceChildren(...facts.map((text) => {
    const row = document.createElement('li');
    row.textContent = text;
    return row;
  }));

  downloadUrl = URL.createObjectURL(out.blob);
  el.download.href = downloadUrl;
  el.download.download = outName(file.name);
  el.download.hidden = !check.ok;

  // Played from memory, looping the way the GIF did, so "did it survive" is
  // a thing that can be looked at rather than inferred from a number.
  el.player.src = downloadUrl;
  el.player.hidden = !check.ok;

  el.result.hidden = false;
}

/* ---------------------------------------------------------------- progress */

function setProgress({ phase, done, total }) {
  const fraction = total > 0 ? Math.min(1, done / total) : 0;
  el.progressBar.style.width = `${(fraction * 100).toFixed(1)}%`;
  const percent = Math.round(fraction * 100);

  let text = '';
  if (phase === 'preparing') {
    text = phrase('progress.preparing');
  } else if (phase === 'encoding') {
    text = phrase('progress.frame', {
      done: done.toLocaleString(), total: total.toLocaleString(), percent,
    });
  } else if (phase === 'finishing') {
    text = phrase('progress.finishing');
  } else if (phase === 'checking') {
    text = phrase('progress.checking');
  }
  if (text) el.progressLabel.textContent = text;
}

/* ------------------------------------------------------------------ scraps */

/** A size, marked as reading left to right, for the reason in the trimmer. */
const sizeOf = (n) => ltr(sizeText(n, phrase, { under: 'size.b', kb: 'auto', mb: 1 }));

/** A {key, values} pair from format.js, as words. A plain string passes through. */
const say = (said) => (said && said.key ? phrase(said.key, said.values) : said ?? '');

function messageFor(error) {
  if (error instanceof GifFormatError || error instanceof UnsupportedFile) {
    return phrase(error.message, error.values);
  }
  if (error?.name === 'AbortError') return phrase('run.cancelled');
  const key = String(error?.message ?? '');
  if (/^(support|stall|encode|gif|mp4|read)\./.test(key)) return phrase(key, error.values);
  return phrase('run.failed', { detail: key || String(error) });
}

function reset() {
  loaded = null;
  el.fileRow.hidden = true;
  el.result.hidden = true;
  el.progress.hidden = true;
  el.loadError.hidden = true;
  el.loadNote.hidden = true;
  el.runError.hidden = true;
  el.backgroundRow.hidden = true;
  releaseDownload();
  refresh();
}

function releaseDownload() {
  if (downloadUrl) URL.revokeObjectURL(downloadUrl);
  downloadUrl = '';
  el.download.removeAttribute('href');
  el.player.removeAttribute('src');
  el.player.hidden = true;
}

/* ------------------------------------------------------------------- trust */

el.privacyToggle.addEventListener('click', () => {
  const open = el.privacyPanel.hidden;
  el.privacyPanel.hidden = !open;
  el.privacyToggle.setAttribute('aria-expanded', String(open));
});

/* -------------------------------------------------------------------- boot */

window.addEventListener('error', (event) => {
  showLoadError(phrase('error.broke', { detail: event.message }));
});
window.addEventListener('unhandledrejection', (event) => {
  showLoadError(phrase('error.broke', { detail: event.reason?.message ?? event.reason }));
});

refresh();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
