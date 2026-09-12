/**
 * UI wiring and application state.
 *
 * The shape of this file follows from one fact about the job: a password set
 * here is the only way back in. So the page does not wake its last card
 * until the two password boxes agree and something has actually been asked
 * for - a password, a restriction, or both - and it does not offer a
 * download until the finished file has been opened again here, twice: once
 * with no password, where it has to be refused, and once with the password
 * that was set, where it has to open with the same number of pages.
 */

import { ltr, phrase } from './shared/phrases.js';
import { messageBox } from './shared/message-box.js';
import { wireFilePicker, readingLabel } from './shared/file-picker.js';
import { sizeText } from './shared/format.js';
import { EncryptedPdfError, NotAPdfError, PdfDocument } from './shared/pdf-reader.js';
import { writeDocument } from './shared/pdf-writer.js';
import {
  protect, standardSecurity, UnsupportedEncryptionError, WrongPasswordError,
} from './shared/pdf-crypt.js';
import { permissionsIn, refusedIn } from './shared/pdf-permissions.js';
import { outName, pages, refusedList } from './format.js';
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
  unlockHint: $('unlock-hint'),
  loadNote: $('load-note'),
  settingsCard: $('settings-card'),
  password: $('password'),
  reveal: $('reveal'),
  passwordAgain: $('password-again'),
  passwordStatus: $('password-status'),
  restrictPrint: $('restrict-print'),
  restrictCopy: $('restrict-copy'),
  restrictChange: $('restrict-change'),
  ownerPassword: $('owner-password'),
  revealOwner: $('reveal-owner'),
  schemes: document.querySelectorAll('input[name="scheme"]'),
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
  checkLine: $('check-line'),
  resultFacts: $('result-facts'),
  privacyToggle: $('privacy-toggle'),
  privacyPanel: $('privacy-panel'),
};

/**
 * /P, bit by bit. The specification numbers them from 1, and a bit that is
 * SET means the thing is permitted, so a restriction is a bit cleared out of
 * -1. "No changes" clears everything a reader could do to the document
 * short of reading it: editing, commenting, filling in forms, and adding,
 * removing or turning pages. See shared/js/pdf-permissions.js for the table.
 */
const BIT = (n) => 1 << (n - 1);
const PRINT = BIT(3) | BIT(12);
const COPY = BIT(5);
const CHANGE = BIT(4) | BIT(6) | BIT(9) | BIT(11);

/** Under this many characters the page says so. Eight is where the current
 *  scheme's cost per guess stops being the thing that protects the file. */
const SHORT = 8;

const { show: showLoadError } = messageBox(el.loadError);
const { show: note } = messageBox(el.loadNote);

/**
 * @typedef {object} Loaded
 * @property {File} file
 * @property {Uint8Array} bytes the whole file, read once and kept
 * @property {import('./shared/pdf-reader.js').PdfDocument} doc  opened, and
 *   decrypted if it arrived carrying restrictions
 * @property {boolean} restricted  it arrived with an /Encrypt dictionary
 */

/** @type {Loaded|null} */
let loaded = null;
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
    el.fileName.textContent = file.name;
    el.fileFacts.textContent = size(bytes.length);
    el.fileRow.hidden = false;

    // Tried with the blank password, so that a document carrying only
    // restrictions - which opens for anybody - is accepted and re-protected,
    // and one that genuinely needs a password is told where to go instead.
    const { unlock, report } = standardSecurity('');
    const doc = await PdfDocument.open(bytes, { unlock });
    loaded = { file, bytes, doc, restricted: report.encrypted };

    if (report.encrypted) note(phrase('note.restricted'));
    else if (doc.repaired) note(phrase('note.repaired'));
    else if (doc.incremental) note(phrase('note.incremental'));

    refresh();
  } catch (error) {
    if (error instanceof WrongPasswordError) {
      // Not an error line: the hint says what to do, and the file row stays
      // so that it is clear which file it is talking about.
      el.unlockHint.hidden = false;
    } else {
      showLoadError(messageFor(error));
    }
    picker.waiting();
  } finally {
    picker.done();
  }
}

/* ----------------------------------------------------------- the settings */

for (const input of [el.password, el.passwordAgain, el.ownerPassword]) {
  input.addEventListener('input', refresh);
}
for (const box of [el.restrictPrint, el.restrictCopy, el.restrictChange]) {
  box.addEventListener('change', refresh);
}

/**
 * What has been asked for, or null when nothing has yet.
 *
 * @returns {{userPassword: string, ownerPassword: string, permissions: number,
 *   revision: number}|null}
 */
function settings() {
  const userPassword = el.password.value;
  if (userPassword !== el.passwordAgain.value) return null;

  let permissions = -1;
  if (el.restrictPrint.checked) permissions &= ~PRINT;
  if (el.restrictCopy.checked) permissions &= ~COPY;
  if (el.restrictChange.checked) permissions &= ~CHANGE;

  if (!userPassword && permissions === -1) return null;

  const chosen = [...el.schemes].find((input) => input.checked);
  return {
    userPassword,
    ownerPassword: el.ownerPassword.value,
    permissions,
    revision: Number(chosen?.value ?? 6),
  };
}

/**
 * Say where the settings stand, and wake or dim the last card to match.
 *
 * The sentence under the password boxes is the page's one piece of running
 * commentary: it is the warning while nothing is typed, the mismatch while the
 * two boxes disagree, the length once they agree, and the note that nothing
 * has been asked for when both are blank and no box is ticked.
 */
function refresh() {
  const typed = el.password.value;
  const again = el.passwordAgain.value;
  const restricting = el.restrictPrint.checked || el.restrictCopy.checked
    || el.restrictChange.checked;

  let key;
  let values = {};
  if (!typed && !again) {
    key = restricting ? 'status.restrictonly' : 'status.nothing';
    if (!restricting && !loaded) key = 'status.blank';
  } else if (typed !== again) {
    key = 'status.mismatch';
  } else {
    key = typed.length < SHORT ? 'status.short' : 'status.ok';
    values = { n: typed.length };
  }
  el.passwordStatus.textContent = phrase(key, values);
  el.passwordStatus.classList.toggle('bad', key === 'status.mismatch');

  gate(Boolean(loaded) && settings() !== null);
}

/**
 * Dim the last card until there is something to do, and say why.
 *
 * The picker wakes every inert card the moment a file arrives, which is
 * right for the settings card and early for this one: a file has been chosen,
 * and nothing can yet be done to it. So this card is managed here, with the
 * same line the frame draws and a sentence of this tool's own.
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
    waiting.textContent = phrase('waiting.settings');
    el.runCard.querySelector('h2').after(waiting);
  }
}

// A password is going to be typed into a box that shows dots, twice. Being
// able to look at what is in the box is the difference between one attempt
// and four, and between a document that opens and one that never will.
function wireReveal(button, input) {
  button.addEventListener('click', () => {
    const showing = input.type === 'text';
    input.type = showing ? 'password' : 'text';
    button.setAttribute('aria-pressed', String(!showing));
    button.textContent = phrase(showing ? 'password.show' : 'password.hide');
    input.focus();
  });
}
wireReveal(el.reveal, el.password);
wireReveal(el.revealOwner, el.ownerPassword);

/* ----------------------------------------------------------------- running */

el.run.addEventListener('click', run);
el.cancel.addEventListener('click', () => running?.abort());
el.clearFile.addEventListener('click', () => {
  reset();
  picker.waiting();
});

async function run() {
  const chosen = loaded && settings();
  if (!chosen || running) return;

  running = new AbortController();
  el.run.disabled = true;
  el.cancel.hidden = false;
  el.result.hidden = true;
  el.runError.hidden = true;
  el.progress.hidden = false;
  setProgress(0, 1, phrase('stage.keys'));
  releaseDownload();

  let cancelled = false;

  try {
    // The document's /ID goes into the older key, so it has to exist before
    // anything is encrypted; the writer puts the same bytes in the trailer.
    const id = crypto.getRandomValues(new Uint8Array(16));
    const security = await protect({ ...chosen, id });
    const signed = hasSignature(loaded.doc);

    setProgress(0, 1, phrase('stage.writing'));
    const blob = await writeDocument(loaded.doc, {
      security,
      signal: running.signal,
      onProgress: (done, total) => setProgress(done, total, null),
    });

    setProgress(1, 1, phrase('stage.checking'));
    const check = await verify(blob, chosen, loaded.doc.countPages());

    showResult({ blob, check, chosen, security, signed });
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
 * Open the finished file again, here, twice.
 *
 * This is the claim the page makes, checked rather than asserted. With no
 * unlock function the shared reader refuses any encrypted document, so a
 * file that opened would be a file with no lock on it. With the password
 * that was set it has to open, come back with the same number of pages, and
 * report exactly the restrictions that were asked for.
 */
async function verify(blob, chosen, expected) {
  const bytes = new Uint8Array(await blob.arrayBuffer());

  try {
    await PdfDocument.open(bytes);
    return { ok: false, text: { key: 'check.open', values: {} } };
  } catch (error) {
    if (!(error instanceof EncryptedPdfError)) {
      return { ok: false, text: { key: 'check.reopen', values: { detail: messageFor(error) } } };
    }
  }

  const { unlock, report } = standardSecurity(chosen.userPassword);
  let again;
  try {
    again = await PdfDocument.open(bytes, { unlock });
  } catch (error) {
    return { ok: false, text: { key: 'check.stillshut', values: { detail: messageFor(error) } } };
  }

  const found = again.countPages();
  if (found !== expected) {
    return { ok: false, text: { key: 'check.pages', values: { pages: found, expected } } };
  }

  // What the file says readers must refuse, against what was asked for -
  // both read through the same table, so this compares two readings of one
  // rule rather than two rules.
  const refused = refusedIn(report.restrictions).map((entry) => entry.bit);
  const asked = refusedIn(permissionsIn(chosen.permissions, report.revision))
    .map((entry) => entry.bit);
  if (refused.join() !== asked.join()) {
    return { ok: false, text: { key: 'check.permissions', values: {} } };
  }

  return {
    ok: true,
    text: {
      key: chosen.userPassword ? 'check.ok.locked' : 'check.ok.restricted',
      values: { pages: say(pages(found)) },
    },
  };
}

function showResult({ blob, check, chosen, security, signed }) {
  el.resultSize.textContent = phrase(
    chosen.userPassword ? 'result.locked' : 'result.restricted',
    { size: size(blob.size) },
  );
  el.resultSub.textContent = phrase('result.sub');

  el.checkLine.textContent = phrase(check.ok ? 'check.passed' : 'check.failed',
    { found: say(check.text) });
  el.checkLine.className = `check-line ${check.ok ? 'good' : 'bad'}`;

  renderFacts({ chosen, security, signed });

  downloadUrl = URL.createObjectURL(blob);
  el.download.href = downloadUrl;
  el.download.download = outName(loaded.file.name);
  // A file the tool has just said it does not trust should not be one click
  // away from being sent to somebody.
  el.download.hidden = !check.ok;

  el.result.hidden = false;
}

function renderFacts({ chosen, security, signed }) {
  const { doc, restricted } = loaded;
  const facts = [];

  facts.push(phrase(security.revision === 6 ? 'facts.scheme.aes256' : 'facts.scheme.aes128'));
  facts.push(phrase(chosen.userPassword ? 'facts.userpassword' : 'facts.nouserpassword'));

  const refused = [];
  if (el.restrictPrint.checked) refused.push(phrase('perm.print'));
  if (el.restrictCopy.checked) refused.push(phrase('perm.copy'));
  if (el.restrictChange.checked) refused.push(phrase('perm.change'));
  const list = refusedList(refused);
  facts.push(list
    ? phrase('facts.restrictions', { list: say(list) })
    : phrase('facts.norestrictions'));

  if (list) {
    if (chosen.ownerPassword) facts.push(phrase('facts.owner.own'));
    else if (chosen.userPassword) facts.push(phrase('facts.owner.same'));
    else facts.push(phrase('facts.owner.random'));
  }

  if (restricted) facts.push(phrase('facts.replaced'));
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
 */
const size = (n) => ltr(sizeText(n, phrase, { under: 'size.bytes', kb: 'auto' }));

/**
 * A {key, values} pair from format.js, as words.
 *
 * Those modules are copied byte for byte into every language, so what they
 * hand back names a phrase and fills its blanks; this is where it becomes a
 * sentence. A plain string passes through.
 */
const say = (said) => (said && said.key ? phrase(said.key, said.values) : said ?? '');

function looksLikePdf(file) {
  return file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
}

function messageFor(error) {
  // Every one of them carries a phrase key rather than a sentence. The ones
  // that name a kind of file are shown on their own; anything else goes
  // inside a sentence saying the document could not be read.
  if (error instanceof NotAPdfError || error instanceof WrongPasswordError
      || error instanceof UnsupportedEncryptionError) {
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
  el.fileRow.hidden = true;
  el.result.hidden = true;
  el.progress.hidden = true;
  el.loadError.hidden = true;
  el.unlockHint.hidden = true;
  el.loadNote.hidden = true;
  el.runError.hidden = true;
  releaseDownload();
  refresh();
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
el.revealOwner.textContent = phrase('password.show');
refresh();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
