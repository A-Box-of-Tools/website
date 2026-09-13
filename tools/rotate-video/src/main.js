/**
 * UI wiring and application state.
 *
 * The shape of this file follows from what a turn is: a change to nine
 * numbers in the file's header, not to a single frame. So the page reads
 * the file, shows its first frame the way it is shown now and the way it
 * will be, writes the file again with the new header and every frame and
 * packet copied across, and opens the result to check it says what was
 * asked. "Bake it in" - drawing the frames turned and encoding them again -
 * is offered for the few players that ignore the header and required for a
 * WebM or MKV whose picture is not H.264, and the page says which.
 */

import { ltr, phrase } from './shared/phrases.js';
import { messageBox } from './shared/message-box.js';
import { wireFilePicker, readingLabel } from './shared/file-picker.js';
import { sizeText, durationText } from './shared/format.js';
import { demux, UnsupportedFile } from './shared/mp4-reader.js';
import { demuxMatroska, isMatroska } from './shared/mkv-reader.js';
import { hasWebCodecs, hasEncoder, canDecode } from './shared/video-support.js';
import { averageFps, decoderConfig } from './shared/webcodecs.js';
import { canDecodeSound, canEncodeAac, describeSound, soundJob } from './shared/reencode-sound.js';
import { rotate } from './rotate.js';
import { drawPreview, firstFrame } from './preview.js';
import {
  bakeBitrate, bakeFrame, canCopy, shownSize, turned,
} from './plan.js';
import { bitrateText, codecText, frameText, outName, rotationText, turnText } from './format.js';
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
  turns: document.querySelectorAll('.chip[data-turn]'),
  preview: $('preview'),
  previewLine: $('preview-line'),
  bake: $('bake'),
  bakeNote: $('bake-note'),
  dropAudio: $('drop-audio'),
  soundNote: $('sound-note'),
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

/** The most the preview may be, in CSS pixels. */
const PREVIEW_BOX = { width: 480, height: 360 };

/**
 * @typedef {object} Loaded
 * @property {File} file
 * @property {{video: object, audio: object|null, duration: number}} media
 * @property {object|null} sound
 * @property {boolean} copyable  the frames can go across untouched
 * @property {boolean} decodable  the browser can draw them, for a bake
 * @property {boolean} soundDecodable
 * @property {ImageBitmap|null} frame  the first frame as stored
 * @property {number} fps
 * @property {number} sourceBitrate
 */

/** @type {Loaded|null} */
let loaded = null;
let turn = 90;
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
    const matroska = await isMatroska(file);
    const media = matroska ? await demuxMatroska(file) : await demux(file);
    const { video, audio } = media;
    const sound = describeSound(audio);
    const codecs = hasWebCodecs();

    const copyable = canCopy(video);
    const decodable = codecs && await canDecode(decoderConfig(video));
    if (!copyable && !(decodable && hasEncoder())) {
      const refused = new Error('support.nodecode');
      refused.values = { codec: video.codec };
      throw refused;
    }
    const soundDecodable = Boolean(sound && !sound.copyable && sound.codec)
      && codecs && await canDecodeSound(sound)
      && await canEncodeAac({ sampleRate: Math.round(sound.sampleRate), channels: Math.min(2, sound.channels) });

    const frame = decodable ? await firstFrame(file, video) : null;
    const videoBytes = video.samples.reduce((sum, s) => sum + s.size, 0);
    loaded = {
      file, media, sound, copyable, decodable, soundDecodable, frame,
      fps: averageFps(video),
      sourceBitrate: videoBytes * 8 / Math.max(0.1, media.duration),
    };

    el.fileName.textContent = file.name;
    el.fileFacts.textContent = phrase('file.facts', {
      size: size(file.size),
      length: durationText(media.duration, phrase),
      frame: say(frameText({ width: video.displayWidth, height: video.displayHeight })),
      shown: say(rotationText(video.rotation)),
    });
    el.fileRow.hidden = false;

    // A picture that cannot be copied has to be baked, and the box says so
    // instead of offering a choice that is not one.
    if (!copyable) {
      el.bake.checked = true;
      el.bake.disabled = true;
      el.bakeNote.textContent = phrase('bake.must');
      el.bakeNote.hidden = false;
    } else if (!decodable || !hasEncoder()) {
      el.bake.checked = false;
      el.bake.disabled = true;
      el.bakeNote.textContent = phrase('bake.cannot');
      el.bakeNote.hidden = false;
    } else {
      el.bake.disabled = false;
      el.bakeNote.hidden = true;
    }

    if (!sound) {
      el.dropAudio.checked = false;
      el.dropAudio.disabled = true;
      el.soundNote.textContent = phrase('sound.none');
      el.soundNote.hidden = false;
    } else if (!sound.copyable && !soundDecodable) {
      el.dropAudio.checked = true;
      el.dropAudio.disabled = true;
      el.soundNote.textContent = phrase('sound.unknown', { codec: say(codecText(sound.codec, sound.name)) });
      el.soundNote.hidden = false;
    } else {
      el.dropAudio.disabled = false;
      el.soundNote.textContent = phrase(sound.copyable ? 'sound.copy' : 'sound.encode', { codec: say(codecText(sound.codec, sound.name)) });
      el.soundNote.hidden = false;
    }

    if (!frame) note(phrase('note.nopreview'));

    refresh();
  } catch (error) {
    showLoadError(messageFor(error));
    picker.waiting();
  } finally {
    picker.done();
  }
}

/* ---------------------------------------------------------------- the turn */

for (const chip of el.turns) {
  chip.addEventListener('click', () => {
    turn = Number(chip.dataset.turn);
    for (const other of el.turns) other.setAttribute('aria-pressed', String(other === chip));
    refresh();
  });
}
el.bake.addEventListener('change', refresh);
el.dropAudio.addEventListener('change', refresh);

/** What the file will say after the turn, and what a bake would be asked for. */
function planned() {
  if (!loaded) return null;
  const { media, sound, soundDecodable, fps, sourceBitrate } = loaded;
  const { video } = media;
  const rotation = turned(video.rotation, turn);
  const shown = shownSize(video, rotation);
  const bake = el.bake.checked;
  let job = soundJob(sound, { decodable: soundDecodable });
  if (el.dropAudio.checked && job !== 'none') job = 'dropped';
  const frame = bakeFrame(shown);
  return {
    rotation,
    shown,
    bake,
    soundJob: job,
    frame,
    bitrate: bakeBitrate({ width: frame.width, height: frame.height, fps, sourceBitrate }),
    fps,
  };
}

/**
 * Redraw the preview turned as chosen and say, in one line, which way up
 * the clip is shown now and which way up it will be.
 */
function refresh() {
  const plan = planned();
  if (!plan) {
    el.previewLine.textContent = phrase('preview.nofile');
    el.preview.hidden = true;
    gate(false);
    return;
  }

  const { video } = loaded.media;
  if (loaded.frame) {
    drawPreview(el.preview, loaded.frame, plan.rotation, PREVIEW_BOX);
    el.preview.hidden = false;
  }
  el.previewLine.textContent = phrase(plan.bake ? 'preview.bake' : 'preview.copy', {
    now: say(rotationText(video.rotation)),
    after: say(rotationText(plan.rotation)),
    frame: say(frameText(plan.bake ? plan.frame : plan.shown)),
    rate: say(bitrateText(plan.bitrate)),
  });
  gate(true);
}

/**
 * Dim the last card until there is something to do, and say why.
 *
 * The picker wakes every inert card the moment a file arrives, which is
 * right for this one: a file that could be read is a file that can be
 * turned. The card is still managed here so a refused file dims it again.
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
  const plan = planned();
  if (!plan || running) return;

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
    const { file, media, sound } = loaded;
    const job = plan.soundJob === 'copy' || plan.soundJob === 'encode' ? plan.soundJob : 'none';
    setProgress({ phase: plan.bake ? 'preparing' : 'writing', done: 0, total: 1 });

    const out = await rotate({
      file, media, sound, turn, bake: plan.bake, soundJob: job,
      bitrate: plan.bitrate, frame: plan.frame, fps: plan.fps,
      signal: running.signal, onProgress: setProgress,
    });

    setProgress({ phase: 'checking', done: 1, total: 1 });
    const check = await verify(out.blob, media.duration, plan, job !== 'none');

    showResult({ out, check, plan, job, seconds: (performance.now() - started) / 1000 });
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
 * Open the finished file again, here, and hold it to three things: that it
 * is as long as the original, that it is shown the way that was asked - a
 * header that says the turn, or frames that no longer need one - and that
 * it has the sound it was meant to have.
 */
async function verify(blob, expectedSeconds, plan, expectSound) {
  let again;
  try {
    again = await demux(new File([blob], 'check.mp4', { type: 'video/mp4' }));
  } catch (error) {
    return { ok: false, text: { key: 'check.reopen', values: { detail: messageFor(error) } } };
  }

  const drift = Math.abs(again.duration - expectedSeconds);
  if (drift > Math.max(0.25, expectedSeconds * 0.02)) {
    return {
      ok: false,
      text: {
        key: 'check.length',
        values: { got: durationText(again.duration, phrase), want: durationText(expectedSeconds, phrase) },
      },
    };
  }

  const want = plan.bake ? 0 : plan.rotation;
  const shownWidth = plan.bake ? plan.frame.width : plan.shown.width;
  const shownHeight = plan.bake ? plan.frame.height : plan.shown.height;
  if (again.video.rotation !== want
    || again.video.displayWidth !== shownWidth || again.video.displayHeight !== shownHeight) {
    return {
      ok: false,
      text: {
        key: 'check.turn',
        values: {
          got: say(rotationText(again.video.rotation)),
          frame: say(frameText({ width: again.video.displayWidth, height: again.video.displayHeight })),
        },
      },
    };
  }
  if (expectSound && !again.audio?.samples.length) {
    return { ok: false, text: { key: 'check.sound' } };
  }

  return {
    ok: true,
    text: {
      key: 'check.ok',
      values: {
        length: durationText(again.duration, phrase),
        shown: say(rotationText(plan.rotation)),
        frame: say(frameText({ width: shownWidth, height: shownHeight })),
      },
    },
  };
}

function showResult({ out, check, plan, job, seconds }) {
  const { file, media, fps } = loaded;
  const { video } = media;

  el.resultSize.textContent = phrase('result.ready', {
    size: size(out.blob.size), turn: say(turnText(turn)),
  });
  el.resultSub.textContent = phrase(plan.bake ? 'result.sub.bake' : 'result.sub.copy');

  el.checkLine.textContent = phrase(check.ok ? 'check.passed' : 'check.failed', { found: say(check.text) });
  el.checkLine.className = `check-line ${check.ok ? 'good' : 'bad'}`;

  const facts = [
    plan.bake
      ? phrase('facts.picture.baked', {
        rate: say(bitrateText(plan.bitrate)), frame: say(frameText(plan.frame)), fps: Math.round(fps),
      })
      : phrase('facts.picture.copied', {
        frame: say(frameText({ width: video.displayWidth, height: video.displayHeight })),
        frames: out.frames.toLocaleString(),
      }),
    phrase({ copy: 'facts.sound.copied', encode: 'facts.sound.encoded', none: 'facts.sound.none' }[job]),
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

  // The result played from memory: a turn is the one change a person can
  // see at a glance, so the player is the check that matters most.
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
  if (phase === 'sound') {
    text = phrase('progress.sound', { done: done.toLocaleString(), total: total.toLocaleString() });
  } else if (phase === 'preparing') {
    text = phrase('progress.preparing');
  } else if (phase === 'encoding') {
    text = phrase('progress.frame', {
      done: done.toLocaleString(), total: total.toLocaleString(), percent,
    });
  } else if (phase === 'finishing') {
    text = phrase('progress.finishing');
  } else if (phase === 'writing') {
    text = phrase('progress.writing');
  } else if (phase === 'checking') {
    text = phrase('progress.checking');
  }
  if (text) el.progressLabel.textContent = text;
}

/* ------------------------------------------------------------------ scraps */

/** A size, marked as reading left to right, for the reason in the trimmer. */
const size = (n) => ltr(sizeText(n, phrase, { kb: 0, mb: 1, gb: 'size.gb' }));

/** A {key, values} pair from format.js, as words. A plain string passes through. */
const say = (said) => (said && said.key ? phrase(said.key, said.values) : said ?? '');

function messageFor(error) {
  if (error instanceof UnsupportedFile) return phrase(error.message, error.values);
  if (error?.name === 'AbortError') return phrase('run.cancelled');
  const key = String(error?.message ?? '');
  if (/^(support|stall|encode|decode|read|sound|write|copy|rotate)\./.test(key)) return phrase(key, error.values);
  return phrase('run.failed', { detail: key || String(error) });
}

function reset() {
  if (loaded?.frame) loaded.frame.close();
  loaded = null;
  el.fileRow.hidden = true;
  el.result.hidden = true;
  el.progress.hidden = true;
  el.loadError.hidden = true;
  el.loadNote.hidden = true;
  el.runError.hidden = true;
  el.bake.disabled = false;
  el.bake.checked = false;
  el.bakeNote.hidden = true;
  el.dropAudio.disabled = false;
  el.dropAudio.checked = false;
  el.soundNote.hidden = true;
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
