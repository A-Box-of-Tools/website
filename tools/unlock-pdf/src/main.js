/**
 * UI wiring and application state.
 *
 * The shape of this file follows from one fact about protected PDFs: the
 * commonest kind needs no password, and asking for one before finding out
 * would be asking most visitors for something that does not exist. So a file
 * is always tried with the blank password first, and the password box appears
 * only when that fails - which is also the moment the page can say honestly
 * that the document is genuinely closed rather than merely restricted.
 */

import { ltr, phrase } from './shared/phrases.js';
import { messageBox } from './shared/message-box.js';
import { wireFilePicker, readingLabel } from './shared/file-picker.js';
import { sizeText } from './shared/format.js';
import { NotAPdfError, PdfDocument } from './shared/pdf-reader.js';
import { stripMetadata, writeDocument } from './shared/pdf-writer.js';
import { standardSecurity, WrongPasswordError } from './crypt.js';
import { refusedIn } from './permissions.js';
import { outName, pages, scheme, strength } from './format.js';
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
  verdict: $('verdict'),
  schemeList: $('scheme'),
  schemeWhat: $('scheme-what'),
  schemeStrength: $('scheme-strength'),
  schemeOpen: $('scheme-open'),
  schemePages: $('scheme-pages'),
  restrictions: $('restrictions'),
  restrictionsLede: $('restrictions-lede'),
  restrictionList: $('restriction-list'),
  passwordRow: $('password-row'),
  password: $('password'),
  reveal: $('reveal'),
  tryPassword: $('try-password'),
  passwordError: $('password-error'),
  runCard: $('run-card'),
  stripMeta: $('strip-meta'),
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
  checkLine: $('check-line'),
  resultFacts: $('result-facts'),
  privacyToggle: $('privacy-toggle'),
  privacyPanel: $('privacy-panel'),
};

/** The empty state of the second card, taken from the markup so that it is
 *  the translated sentence rather than an English one written here. */
const NOTHING_YET = el.verdict.textContent;

const { show: showLoadError } = messageBox(el.loadError);
const { show: showPasswordError } = messageBox(el.passwordError);
const { show: note } = messageBox(el.loadNote);

/**
 * @typedef {object} Loaded
 * @property {File} file
 * @property {Uint8Array} bytes the whole file, read once and kept
 * @property {import('./shared/pdf-reader.js').PdfDocument} doc  decrypted
 * @property {object} report what crypt.js found on the way in
 */

/** @type {Loaded|null} */
let loaded = null;
/** The bytes of a file that has been read but not yet opened, which is the
 *  state a document with an open password sits in while it is being asked
 *  for. */
let waitingOn = null;
/** The object URL behind the download link, revoked when it is replaced. */
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
    if (!looksLikePdf(file)) throw new NotAPdfError('read.notpdf');

    const bytes = new Uint8Array(await file.arrayBuffer());
    waitingOn = { file, bytes };

    el.fileName.textContent = file.name;
    el.fileFacts.textContent = size(bytes.length);
    el.fileRow.hidden = false;

    await attempt('');
  } catch (error) {
    showLoadError(messageFor(error));
    picker.waiting();
  } finally {
    picker.done();
  }
}

/**
 * Open the file with one password, and say what happened.
 *
 * Called with the empty string the moment a file arrives, and again with
 * whatever is typed into the box. A wrong password is not an error the page
 * shouts about - it is the ordinary case on the first try - so it is answered
 * by showing the box rather than by a red line, unless something had actually
 * been typed.
 *
 * @returns {Promise<boolean>} whether the document opened
 */
async function attempt(password) {
  if (!waitingOn) return false;

  const { unlock, report } = standardSecurity(password);

  try {
    const doc = await PdfDocument.open(waitingOn.bytes, { unlock });
    loaded = { ...waitingOn, doc, report };

    el.passwordRow.hidden = true;
    el.passwordError.hidden = true;
    el.password.value = '';
    describe();

    if (doc.repaired) note(phrase('note.repaired'));
    else if (doc.incremental) note(phrase('note.incremental'));

    return true;
  } catch (error) {
    if (error instanceof WrongPasswordError) {
      askForPassword(password !== '');
      return false;
    }
    throw error;
  }
}

function askForPassword(afterATry) {
  el.verdict.textContent = phrase('verdict.locked');
  el.schemeList.hidden = true;
  el.restrictions.hidden = true;
  el.passwordRow.hidden = false;

  if (afterATry) showPasswordError(phrase('crypt.wrongpassword'));
  else el.passwordError.hidden = true;

  // The run card goes back to waiting: there is a file, and nothing that can
  // yet be done to it.
  waitFor('waiting.password');
  el.password.focus();
}

/* ------------------------------------------------- what is on this document */

/**
 * Fill in the second card from the report crypt.js wrote on the way past.
 *
 * The three lines are what somebody would have to open a hex editor to learn:
 * which scheme, what it is worth, and which of the document's two passwords
 * was the one that opened it.
 */
function describe() {
  const { report, doc } = loaded;

  if (!report.encrypted) {
    // Nothing to do, and saying so is more use than a disabled button.
    el.verdict.textContent = phrase('verdict.none');
    el.schemeList.hidden = true;
    el.restrictions.hidden = true;
    waitFor('waiting.nothing');
    return;
  }

  el.verdict.textContent = phrase(
    report.opened === 'blank' ? 'verdict.restricted' : 'verdict.open');

  // The last card was put back to waiting while the password was being asked
  // for, and nothing else would ever wake it: the file arrived long before the
  // password did, so the picker's own hand-over has already been and gone.
  picker.arrived();

  el.schemeWhat.textContent = say(scheme(report));
  el.schemeStrength.textContent = phrase(strength(report));
  el.schemeOpen.textContent = [
    phrase(`open.${report.opened}`),
    report.keyConfirmed ? phrase('open.keyconfirmed') : '',
  ].filter(Boolean).join(' ');
  // Composed through a phrase rather than here, so that the separator and the
  // order belong to the language. One isolate around the finished pair, not
  // one per half: two isolates side by side are still two neutral objects to
  // the paragraph around them, and swap exactly as bare numbers do.
  el.schemePages.textContent = ltr(phrase('scheme.sizepages', {
    size: plainSize(loaded.bytes.length),
    pages: say(pages(doc.countPages())),
  }));
  el.schemeList.hidden = false;

  renderRestrictions(refusedIn(report.restrictions));
  el.restrictions.hidden = false;
}

function renderRestrictions(refused) {
  el.restrictionsLede.textContent = phrase(
    refused.length ? 'restrictions.some' : 'restrictions.none');

  el.restrictionList.replaceChildren(...refused.map((entry) => {
    const row = document.createElement('li');
    row.textContent = phrase(entry.id);
    return row;
  }));
}

/**
 * Dim the last card, and say why.
 *
 * The frame's own sentence for a waiting card is "this opens as soon as you
 * choose a file above", which is right on ten other tools and wrong on both of
 * the states this tool dims for: a file has been chosen in each of them. One
 * asks for a password it does not have, the other has read a document with
 * nothing on it to remove, and a card that answered either with "choose a
 * file" would be contradicting the sentence directly above it.
 */
function waitFor(key) {
  picker.waiting();
  const line = el.runCard.querySelector('.card-waiting');
  if (line) line.textContent = phrase(key);
}

/* -------------------------------------------------------------- the password */

el.tryPassword.addEventListener('click', submitPassword);
el.password.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') submitPassword();
});

async function submitPassword() {
  if (!waitingOn || running) return;
  const typed = el.password.value;
  if (!typed) return;

  el.tryPassword.disabled = true;
  try {
    await attempt(typed);
  } catch (error) {
    showPasswordError(messageFor(error));
  } finally {
    el.tryPassword.disabled = false;
  }
}

// A document password is often long, copied from an email, and typed into a
// box that shows dots. Being able to look at what is in the box is the
// difference between one attempt and four.
el.reveal.addEventListener('click', () => {
  const showing = el.password.type === 'text';
  el.password.type = showing ? 'password' : 'text';
  el.reveal.setAttribute('aria-pressed', String(!showing));
  el.reveal.textContent = phrase(showing ? 'password.show' : 'password.hide');
  el.password.focus();
});

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
  setProgress(0, 1, phrase('stage.writing'));
  releaseDownload();

  let cancelled = false;

  try {
    const metadata = el.stripMeta.checked ? stripMetadata(loaded.doc) : 0;
    const signed = hasSignature(loaded.doc);

    const blob = await writeDocument(loaded.doc, {
      signal: running.signal,
      onProgress: (done, total) => setProgress(done, total, null),
    });

    setProgress(1, 1, phrase('stage.checking'));
    const check = await verify(blob, loaded.doc.countPages());

    showResult({ blob, check, metadata, signed });
  } catch (error) {
    if (error?.name === 'AbortError') {
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
 * Open the finished file again, here, with no password and no unlock function.
 *
 * This is the claim the page makes, checked rather than asserted. The reader
 * it goes back through is the same one every other PDF tool on this site uses,
 * and that reader refuses an encrypted document outright - so a file that
 * still had any encryption on it could not pass this, and the run would be
 * reported as failed with nothing offered for download.
 */
async function verify(blob, expected) {
  try {
    const again = await PdfDocument.open(new Uint8Array(await blob.arrayBuffer()));
    const found = again.countPages();

    if (found !== expected) {
      return { ok: false, text: { key: 'check.pages', values: { pages: found, expected } } };
    }
    return {
      ok: true,
      text: {
        key: found === 1 ? 'check.ok.one' : 'check.ok.many',
        values: { pages: found },
      },
    };
  } catch (error) {
    // The reader's refusal of an encrypted file arrives here as an ordinary
    // failure to reopen, which is exactly what it is from this side.
    const key = error?.message === 'read.encrypted' ? 'check.stilllocked' : 'check.reopen';
    return { ok: false, text: { key, values: { detail: messageFor(error) } } };
  }
}

function showResult({ blob, check, metadata, signed }) {
  el.resultSize.textContent = phrase('result.ready', { size: size(blob.size) });
  el.resultSub.textContent = phrase('result.sub');

  el.checkLine.textContent = phrase(check.ok ? 'check.passed' : 'check.failed',
    { found: say(check.text) });
  el.checkLine.className = `check-line ${check.ok ? 'good' : 'bad'}`;

  renderFacts({ metadata, signed });

  downloadUrl = URL.createObjectURL(blob);
  el.download.href = downloadUrl;
  el.download.download = outName(loaded.file.name);
  // A file the tool has just said it does not trust should not be one click
  // away from being sent to somebody.
  el.download.hidden = !check.ok;

  el.result.hidden = false;
}

function renderFacts({ metadata, signed }) {
  const { report, doc } = loaded;
  const lifted = refusedIn(report.restrictions).length;
  const facts = [];

  facts.push(phrase('facts.decrypted'));
  if (lifted) {
    facts.push(lifted === 1
      ? phrase('facts.lifted.one')
      : phrase('facts.lifted', { n: lifted }));
  }
  if (metadata) facts.push(phrase('facts.metadata'));
  if (signed) facts.push(phrase('facts.signature'));
  if (doc.incremental) facts.push(phrase('facts.incremental'));
  if (doc.repaired) facts.push(phrase('facts.repaired'));

  el.resultFacts.replaceChildren(...facts.map((text) => {
    const row = document.createElement('li');
    row.textContent = text;
    return row;
  }));
}

/**
 * Was this document signed?
 *
 * Worth saying, because a signature cannot survive what this tool does and the
 * visitor should hear that from the page rather than from whoever they send
 * the file to. The catalogue's /AcroForm carries the flag, and a signature
 * field is a widget whose /FT is /Sig; either is enough to warn on.
 */
function hasSignature(doc) {
  const form = doc.get(doc.catalog, 'AcroForm');
  if (form instanceof Map && doc.get(form, 'SigFlags')) return true;

  for (const value of doc.objects.values()) {
    const dict = value instanceof Map ? value : null;
    if (dict && dict.get('FT')?.value === 'Sig') return true;
  }
  return false;
}

/* ------------------------------------------------------------------ scraps */

/**
 * A size, marked as reading left to right.
 *
 * Measured in a browser rather than reasoned about: on an Arabic page a bare
 * "3.7 KB" lands as "KB 3.7", and inside a sentence it is worse - the number
 * walks to the far end of the line. The digits carry no direction of their own
 * and the space between them and the unit is neutral, so the paragraph decides,
 * and on those pages the paragraph runs the other way.
 *
 * `plainSize` is the same thing without the isolate, for the one place that
 * composes a size with something else and has to isolate the pair as a whole.
 */
const plainSize = (n) => sizeText(n, phrase, { under: 'size.bytes', kb: 'auto' });
const size = (n) => ltr(plainSize(n));

/**
 * A {key, values} pair from format.js, as words.
 *
 * Those modules are copied byte for byte into fifteen languages, so what they
 * hand back names a phrase and fills its blanks; this is where it becomes a
 * sentence. A plain string passes through, which is what makes a size usable
 * inside another phrase.
 */
const say = (said) => (said && said.key ? phrase(said.key, said.values) : said ?? '');

function looksLikePdf(file) {
  return file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
}

function messageFor(error) {
  // Every one of them carries a phrase key rather than a sentence. The two
  // that name a kind of file are shown on their own; anything else goes
  // inside a sentence saying the document could not be read.
  if (error instanceof NotAPdfError || error instanceof WrongPasswordError) {
    return phrase(error.message, error.values);
  }
  if (error?.name === 'AbortError') return phrase('run.cancelled');
  if (String(error?.message ?? '').startsWith('crypt.')) {
    return phrase(error.message, error.values);
  }
  return phrase('read.failed',
    { detail: phrase(error?.message ?? String(error), error?.values) });
}

let stageText = '';

function setProgress(done, total, stage) {
  if (stage !== null && stage !== undefined) stageText = stage;
  if (done !== null && done !== undefined && total) {
    el.progressBar.style.width = `${Math.round((done / Math.max(1, total)) * 100)}%`;
  }
  el.progressLabel.textContent = `${stageText}...`;
}

function reset() {
  loaded = null;
  waitingOn = null;
  el.fileRow.hidden = true;
  el.result.hidden = true;
  el.progress.hidden = true;
  el.loadError.hidden = true;
  el.loadNote.hidden = true;
  el.runError.hidden = true;
  el.passwordRow.hidden = true;
  el.passwordError.hidden = true;
  el.password.value = '';
  el.password.type = 'password';
  el.reveal.setAttribute('aria-pressed', 'false');
  el.reveal.textContent = phrase('password.show');
  el.verdict.textContent = NOTHING_YET;
  el.schemeList.hidden = true;
  el.restrictions.hidden = true;
  releaseDownload();
}

function releaseDownload() {
  if (downloadUrl) URL.revokeObjectURL(downloadUrl);
  downloadUrl = '';
  el.download.removeAttribute('href');
}

/* ------------------------------------------------------------------- trust */

el.privacyToggle.addEventListener('click', () => {
  const open = el.privacyPanel.hidden;
  el.privacyPanel.hidden = !open;
  el.privacyToggle.setAttribute('aria-expanded', String(open));
});

/* -------------------------------------------------------------------- boot */

// An error thrown after boot would otherwise only reach the console, leaving
// the page looking functional but doing nothing.
window.addEventListener('error', (event) => {
  showLoadError(phrase('error.broke', { detail: event.message }));
});
window.addEventListener('unhandledrejection', (event) => {
  showLoadError(phrase('error.broke', { detail: event.reason?.message ?? event.reason }));
});

el.reveal.textContent = phrase('password.show');

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
