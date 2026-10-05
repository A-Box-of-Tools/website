import { phrase } from './shared/phrases.js';
import { wireFilePicker } from './shared/file-picker.js';
import { saveBlob } from './shared/download.js';
import { Cropper } from './shared/cropper.js';
import { makeZip } from './shared/zip.js';
import { acceptsImageFile } from './shared/image-input.js';
import { exampleFiles } from './example.js';
import { recognize, terminateOcr } from './ocr.js';
import { receiptFromRecognition } from './ocr-results.js';
import { extractReceipt, parseAmount, formatMinor, summarize } from './receipt.js';
import { inferLocationCurrency } from './location-currency.js';
import { mostUsedCurrency, isoDate, parseRate, conversionFor, summarizeConverted, buildConversionCsv, fetchHistoricalRate } from './fx.js';
import { FULL_CROP, inspectImage, prepareImage, readImageCanvas, rotateCrop } from './attachments.js';
import { buildEmailDraft } from './email.js';
import { wireCurrencyHelp } from './currency-help.js';

const $ = id => document.getElementById(id);
const records = [];
let epoch = 0;
let running = false;
let exporting = false;
let nextId = 0;
let finalCurrency = '';
let finalCustom = false;
let useDefaultCurrency = true;
let useDefaultSubject = true;
let imageQueue = Promise.resolve();
const picker = wireFilePicker({
  input: $('file-input'), dropzone: $('dropzone'), onFiles: addFiles, example: exampleFiles,
});

function imageTask(record, version, work) {
  // A decoded phone photograph can be much larger than its file. Serialize
  // decodes, and skip queued crops superseded by the visitor's next move.
  const result = imageQueue.then(() => record.disposed || version !== record.imageVersion ? null : work());
  imageQueue = result.catch(() => {});
  return result;
}

function sayError(key, values = {}) {
  $('load-error').textContent = phrase(key, values);
  $('load-error').hidden = false;
}

function updateControls(record) {
  const busy = running || exporting || record.inspecting;
  for (const control of record.element.querySelectorAll('button, input, textarea, select')) control.disabled = busy;
  record.element.querySelector('[data-field="confirmed"]').disabled = busy || !record.attachment || record.preparing;
  record.element.querySelector('.download-picture').disabled = busy || !record.attachment || record.preparing;
  record.cropper?.setEnabled(!busy);
  const same = record.currency && record.currency === finalCurrency;
  record.element.querySelector('[data-field="rate"]').disabled = busy || same || record.rateMode === 'online';
  record.element.querySelector('[data-field="rateMode"]').disabled = busy || same;
  record.element.querySelector('[data-field="conversionDate"]').disabled = busy || same;
  record.element.querySelector('.get-rate').disabled = busy || record.rateBusy || same
    || !/^[A-Z]{3}$/.test(record.currency) || !/^[A-Z]{3}$/.test(finalCurrency) || !isoDate(record.conversionDate);
  if (record.rateBusy) record.element.querySelector('[data-field="confirmed"]').disabled = true;
}

function setRunning(value) {
  running = value;
  $('file-input').disabled = value || exporting;
  $('example-button').disabled = value || exporting;
  $('stop-reading').hidden = !value;
  if (!value) { picker.done(); updateDefaultCurrency(); }
  for (const record of records) updateControls(record);
  updateReport();
}

function uncheck(record) {
  record.confirmed = false;
  record.element.querySelector('[data-field="confirmed"]').checked = false;
  updateDocumentStatus(record);
}

function releaseRecord(record) {
  record.rateController?.abort();
  record.rateVersion += 1;
  record.disposed = true;
  record.imageVersion += 1;
  clearTimeout(record.prepareTimer);
  URL.revokeObjectURL(record.url);
  if (record.attachmentUrl) URL.revokeObjectURL(record.attachmentUrl);
  if (record.preview) record.preview.width = record.preview.height = 0;
}

async function addFiles(files) {
  if (running || exporting) { sayError('busy'); return; }
  $('load-error').hidden = true;
  const added = [];
  for (const file of files) {
    if (records.length >= 20) { sayError('tooMany'); break; }
    if (!acceptsImageFile(file, ['jpg', 'jpeg', 'png', 'webp', 'avif'], ['image/jpeg', 'image/png', 'image/webp', 'image/avif'])) {
      sayError('badFile', { name: file.name }); continue;
    }
    if (file.size > 20 * 1024 * 1024) { sayError('tooLarge', { name: file.name }); continue; }
    const record = {
      id: ++nextId, file, filename: file.name, url: URL.createObjectURL(file), rotation: 0,
      merchant: '', date: '', reference: '', currency: '', amount: '', confirmed: false,
      text: '', recoveryText: '', headerText: '', currencySource: '', locationEvidence: '', locationText: '',
      status: 'queued', crop: { ...FULL_CROP }, imageVersion: 0,
      attachment: null, preparing: true, disposed: false,
      finalCurrency, conversionDate: '', rateMode: 'manual', rate: '', rateSource: '', rateDate: '',
      rateBase: '', rateQuote: '', rateRequestDate: '', rateVersion: 0, rateBusy: false,
    };
    records.push(record);
    createDocument(record);
    added.push(record);
  }
  if (!records.length) { picker.waiting(); return; }
  picker.arrived();
  updateReport();
  if (added.length) await readBatch(added);
}

function syncCurrency(record) {
  const choice = record.element.querySelector('[data-currency-choice]');
  const listed = [...choice.options].some(option => option.value === record.currency);
  choice.value = !record.currency ? '' : listed ? record.currency : 'custom';
  record.element.querySelector('.custom-currency').hidden = choice.value !== 'custom';
  record.element.querySelector('[data-field="currency"]').value = record.currency;
  updateCurrencyHint(record);
}

function updateCurrencyHint(record) {
  const hint = record.element.querySelector('.currency-hint');
  const inferred = record.currencySource === 'location' && record.currency && record.locationEvidence;
  hint.hidden = !inferred;
  hint.textContent = inferred ? phrase('currencyFromLocation', { currency: record.currency, location: record.locationEvidence }) : '';
}

function revalidateLocationCurrency(record) {
  if (record.currencySource !== 'location') return;
  // A new date can cross a currency changeover. A visitor's own currency
  // choice has no location marker and therefore survives edits to the date.
  const location = inferLocationCurrency(record.locationText, record.date);
  record.currency = location?.currency ?? '';
  record.locationEvidence = location?.evidence ?? '';
  syncCurrency(record);
}

function syncFinalCurrency() {
  const globalChoice = $('final-currency-choice');
  const listed = [...globalChoice.options].some(option => option.value === finalCurrency);
  const selected = finalCustom ? 'custom' : !finalCurrency ? '' : listed ? finalCurrency : 'custom';
  globalChoice.value = selected;
  $('custom-final-currency').hidden = selected !== 'custom';
  $('final-currency').value = finalCurrency;
  for (const record of records) {
    record.finalCurrency = finalCurrency;
    record.element.querySelector('[data-final-currency-choice]').value = selected;
    record.element.querySelector('.custom-final-currency').hidden = selected !== 'custom';
    record.element.querySelector('[data-field="finalCurrency"]').value = finalCurrency;
  }
}

function updateDefaultCurrency() {
  if (!useDefaultCurrency) return;
  const preferred = mostUsedCurrency(records);
  if (preferred !== finalCurrency || finalCustom) setFinalCurrency(preferred, false, true);
}

function setFinalCurrency(value, custom = false, automatic = false) {
  if (!automatic) useDefaultCurrency = false;
  const next = String(value).trim().toUpperCase();
  const changed = finalCurrency !== next;
  finalCurrency = next;
  finalCustom = custom;
  syncFinalCurrency();
  for (const record of records) {
    if (changed) { resetRate(record); uncheck(record); showDocumentError(record, ''); }
    updateConversion(record);
    updateControls(record);
  }
  updateReport();
}

function resetRate(record) {
  record.rateController?.abort();
  record.rateController = null;
  record.rateVersion += 1;
  record.rateBusy = false;
  record.rate = record.rateDate = record.rateSource = record.rateBase = record.rateQuote = record.rateRequestDate = '';
  record.element.querySelector('[data-field="rate"]').value = '';
  record.element.querySelector('.rate-status').textContent = '';
  updateConversion(record);
}

function updateConversion(record) {
  const same = record.currency && record.currency === finalCurrency;
  const result = conversionFor(record, finalCurrency);
  const rate = same ? '1' : parseRate(record.rate)?.text ?? '';
  record.element.querySelector('[data-field="rate"]').value = same ? '1' : record.rate;
  record.element.querySelector('.online-rate-controls').hidden = record.rateMode !== 'online' || Boolean(same);
  const direction = record.element.querySelector('.rate-direction');
  direction.textContent = !record.currency || !finalCurrency ? phrase('rateChooseCurrencies')
    : phrase(rate ? 'rateDirection' : 'rateDirectionEmpty', { base: record.currency, quote: finalCurrency, rate });
  const status = record.element.querySelector('.rate-status');
  if (same) status.textContent = phrase('sameCurrencyRate');
  else if (!record.rateBusy && !result.error && result.source === 'manual') status.textContent = phrase('manualRateReady', { date: result.date || phrase('notEntered') });
  record.element.querySelector('.converted-value').textContent = result.error ? phrase('conversionPending')
    : phrase('convertedAmount', { amount: formatMinor(result.minor), currency: finalCurrency });
}

async function getHistoricalRate(record) {
  if (running || exporting || record.inspecting || record.rateBusy || record.rateMode !== 'online') return;
  resetRate(record);
  uncheck(record);
  const version = record.rateVersion;
  const options = { base: record.currency, quote: finalCurrency, date: record.conversionDate };
  const controller = new AbortController();
  record.rateController = controller;
  record.rateBusy = true;
  updateControls(record);
  updateReport();
  record.element.querySelector('.rate-status').textContent = phrase('fx.loading');
  try {
    const result = await fetchHistoricalRate({ ...options, signal: controller.signal });
    if (record.disposed || version !== record.rateVersion) return;
    record.rate = result.rate;
    record.rateSource = 'online';
    record.rateDate = result.date;
    record.rateBase = result.base;
    record.rateQuote = result.quote;
    record.rateRequestDate = result.requestedDate;
    record.element.querySelector('.rate-status').textContent = phrase('fx.loaded', { date: result.date, requested: result.requestedDate });
    showDocumentError(record, '');
  } catch (error) {
    if (record.disposed || version !== record.rateVersion) return;
    record.element.querySelector('.rate-status').textContent = phrase(error.message);
  } finally {
    if (!record.disposed && version === record.rateVersion) {
      record.rateBusy = false;
      record.rateController = null;
      updateConversion(record);
      updateControls(record);
      updateReport();
    }
  }
}

function createDocument(record) {
  const element = $('document-template').content.firstElementChild.cloneNode(true);
  record.element = element;
  element.querySelector('.document-name').textContent = record.filename;
  element.querySelector('.original-link').href = record.url;
  element.querySelector('.attachment-status').textContent = phrase('preparingImage');
  const finalChoice = element.querySelector('[data-final-currency-choice]');
  finalChoice.replaceChildren(...[...$('final-currency-choice').children].map(option => option.cloneNode(true)));
  finalChoice.id = `doc-${record.id}-final-currency-choice`;
  finalChoice.addEventListener('change', () => {
    setFinalCurrency(finalChoice.value === 'custom' ? '' : finalChoice.value, finalChoice.value === 'custom');
    if (finalChoice.value === 'custom') element.querySelector('[data-field="finalCurrency"]').focus();
  });
  element.querySelector('.get-rate').addEventListener('click', () => getHistoricalRate(record));
  const choice = element.querySelector('[data-currency-choice]');
  choice.id = `doc-${record.id}-currency-choice`;
  const currencyHint = element.querySelector('.currency-hint');
  currencyHint.id = `doc-${record.id}-currency-hint`;
  choice.setAttribute('aria-describedby', currencyHint.id);
  choice.addEventListener('change', () => {
    record.currency = choice.value === 'custom' ? '' : choice.value;
    record.currencySource = '';
    record.locationEvidence = '';
    record.locationText = '';
    updateCurrencyHint(record);
    element.querySelector('.custom-currency').hidden = choice.value !== 'custom';
    element.querySelector('[data-field="currency"]').value = record.currency;
    if (choice.value === 'custom') element.querySelector('[data-field="currency"]').focus();
    resetRate(record);
    uncheck(record);
    showDocumentError(record, '');
    updateControls(record);
    updateDefaultCurrency();
    updateReport();
  });
  for (const input of element.querySelectorAll('[data-field]')) {
    input.id = `doc-${record.id}-${input.dataset.field}`;
    input.addEventListener(input.type === 'checkbox' ? 'change' : 'input', () => {
      const field = input.dataset.field;
      if (field === 'finalCurrency') { setFinalCurrency(input.value, true); return; }
      if (field === 'confirmed') {
        record.confirmed = input.checked;
        const problem = validation(record) || (!record.attachment || record.preparing ? 'attachmentRequired' : '');
        if (problem && record.confirmed) { uncheck(record); showDocumentError(record, problem); }
        else showDocumentError(record, '');
      } else {
        record[field] = field === 'currency' ? input.value.trim().toUpperCase() : input.value;
        if (field === 'currency') {
          input.value = record.currency;
          record.currencySource = '';
          record.locationEvidence = '';
          record.locationText = '';
          updateCurrencyHint(record);
        }
        if (field === 'rate') {
          record.rateController?.abort();
          record.rateController = null;
          record.rateVersion += 1;
          record.rateBusy = false;
          record.rateSource = 'manual';
          record.rateDate = record.conversionDate;
          element.querySelector('.rate-status').textContent = '';
        } else if (['currency', 'date', 'conversionDate', 'rateMode'].includes(field)) {
          if (field === 'date') {
            revalidateLocationCurrency(record);
            record.conversionDate = isoDate(record.date);
            element.querySelector('[data-field="conversionDate"]').value = record.conversionDate;
          }
          resetRate(record);
        }
        // Approval belongs to the exact fields and image the visitor checked.
        uncheck(record);
        showDocumentError(record, '');
      }
      if (field === 'currency' || field === 'date' && record.currencySource === 'location') updateDefaultCurrency();
      updateDocumentStatus(record);
      updateConversion(record);
      updateControls(record);
      updateReport();
    });
  }
  for (const input of element.querySelectorAll('[data-crop]')) {
    input.id = `doc-${record.id}-crop-${input.dataset.crop}`;
    input.addEventListener('input', () => {
      if (!record.cropper) return;
      const rect = record.cropper.rect;
      const value = Number(input.value);
      if (input.value !== '' && Number.isFinite(value)) rect[input.dataset.crop] = value;
      record.cropper.setRect(rect);
    });
    input.addEventListener('blur', () => {
      if (record.cropper) input.value = record.cropper.rect[input.dataset.crop];
    });
  }
  element.querySelector('.remove-document').addEventListener('click', () => {
    records.splice(records.indexOf(record), 1);
    releaseRecord(record);
    element.remove();
    updateDefaultCurrency();
    updateReport();
    if (!records.length) picker.waiting();
  });
  element.querySelector('.rotate-document').addEventListener('click', async () => {
    record.rotation = (record.rotation + 90) % 360;
    record.crop = rotateCrop(record.crop);
    invalidateImage(record);
    await inspectDocument(record, false);
    await readBatch([record]);
  });
  element.querySelector('.detect-crop').addEventListener('click', async () => {
    invalidateImage(record);
    await inspectDocument(record, true);
  });
  element.querySelector('.reset-crop').addEventListener('click', () => record.cropper?.reset());
  element.querySelector('.reread-document').addEventListener('click', () => readBatch([record]));
  element.querySelector('.download-picture').addEventListener('click', () => {
    if (record.attachment && !record.preparing) saveBlob(record.attachment.file, record.attachment.file.name);
  });
  element.querySelector('.parse-text').addEventListener('click', () => {
    record.text = element.querySelector('.ocr-text').value;
    fillExtraction(record);
    updateReport();
  });
  $('documents').append(element);
  syncFinalCurrency();
  updateConversion(record);
  updateDocumentStatus(record);
  updateControls(record);
}

function invalidateImage(record) {
  record.imageVersion += 1;
  record.attachment = null;
  record.preparing = true;
  clearTimeout(record.prepareTimer);
  if (record.attachmentUrl) URL.revokeObjectURL(record.attachmentUrl);
  record.attachmentUrl = '';
  record.element.querySelector('.attachment-link').removeAttribute('href');
  record.element.querySelector('.document-image').hidden = true;
  record.element.querySelector('.attachment-status').textContent = phrase('preparingImage');
  uncheck(record);
  updateControls(record);
  updateReport();
}

function cropChanged(record, rect) {
  if (record.syncingCrop || record.disposed || !record.width) return;
  const crop = { x: rect.x / record.width, y: rect.y / record.height, width: rect.width / record.width, height: rect.height / record.height };
  for (const input of record.element.querySelectorAll('[data-crop]')) {
    if (document.activeElement !== input) input.value = rect[input.dataset.crop];
  }
  if (Object.keys(crop).every(key => Math.abs(crop[key] - record.crop[key]) < 1e-9)) return;
  record.crop = crop;
  record.element.querySelector('.crop-status').textContent = phrase('cropManual');
  invalidateImage(record);
  record.prepareTimer = setTimeout(() => prepareAttachment(record), 250);
}

async function inspectDocument(record, detect) {
  record.inspecting = true;
  updateControls(record);
  const version = record.imageVersion;
  try {
    const view = await imageTask(record, version, () => inspectImage(record.file, { rotation: record.rotation }));
    if (!view) return;
    if (record.disposed || version !== record.imageVersion) { view.canvas.width = view.canvas.height = 0; return; }
    if (record.preview) record.preview.width = record.preview.height = 0;
    record.preview = view.canvas;
    view.canvas.setAttribute('role', 'img');
    view.canvas.setAttribute('aria-label', phrase('cropPreview'));
    record.width = view.width;
    record.height = view.height;
    if (detect) record.crop = view.crop;
    const stage = record.element.querySelector('.crop-stage');
    record.syncingCrop = true;
    stage.replaceChildren(view.canvas);
    record.cropper = new Cropper(stage, { label: phrase('cropLabel'), onChange: rect => cropChanged(record, rect) });
    record.cropper.setSource(record.width, record.height);
    record.cropper.setRect({ x: record.crop.x * record.width, y: record.crop.y * record.height, width: record.crop.width * record.width, height: record.crop.height * record.height });
    // The shared cropper rounds to source pixels. Encode exactly those bounds.
    const rect = record.cropper.rect;
    record.crop = { x: rect.x / record.width, y: rect.y / record.height, width: rect.width / record.width, height: rect.height / record.height };
    for (const input of record.element.querySelectorAll('[data-crop]')) {
      input.value = rect[input.dataset.crop];
      input.max = ['x', 'width'].includes(input.dataset.crop) ? record.width : record.height;
    }
    record.syncingCrop = false;
    record.element.querySelector('.crop-status').textContent = phrase(detect ? view.found ? 'cropSuggested' : 'cropNotFound' : 'cropManual');
    await prepareAttachment(record);
  } catch {
    if (!record.disposed && version === record.imageVersion) {
      record.preparing = false;
      record.element.querySelector('.attachment-status').textContent = phrase('attachmentFailed');
    }
  } finally {
    record.inspecting = false;
    if (!record.disposed) { updateControls(record); updateReport(); }
  }
}

async function prepareAttachment(record) {
  const version = record.imageVersion;
  record.preparing = true;
  updateControls(record);
  try {
    const result = await imageTask(record, version, () => prepareImage(record.file, { rotation: record.rotation, crop: record.crop, name: `${String(record.id).padStart(2, '0')}-${record.filename}` }));
    if (!result) return;
    if (record.disposed || version !== record.imageVersion) return;
    record.attachment = result;
    if (record.attachmentUrl) URL.revokeObjectURL(record.attachmentUrl);
    record.attachmentUrl = URL.createObjectURL(result.file);
    record.element.querySelector('.attachment-link').href = record.attachmentUrl;
    const image = record.element.querySelector('.document-image');
    image.src = record.attachmentUrl;
    image.hidden = false;
    record.element.querySelector('.attachment-status').textContent = phrase('attachmentReady', {
      width: result.width, height: result.height, size: Math.ceil(result.size / 1024), original: Math.ceil(result.originalSize / 1024),
    }) + (result.targetMet ? '' : ` ${phrase('attachmentTargetMissed')}`);
  } catch {
    if (!record.disposed && version === record.imageVersion) record.element.querySelector('.attachment-status').textContent = phrase('attachmentFailed');
  } finally {
    if (!record.disposed && version === record.imageVersion) {
      record.preparing = false;
      updateControls(record);
      updateReport();
    }
  }
}

function validation(record) {
  if (parseAmount(record.amount) === null) return 'invalidAmount';
  if (!/^[A-Z]{3}$/.test(record.currency.trim().toUpperCase())) return 'invalidCurrency';
  return conversionFor(record, finalCurrency).error || (record.rateBusy ? 'rateRequired' : '');
}

function showDocumentError(record, key) {
  const error = record.element.querySelector('.document-error');
  error.textContent = key ? phrase(key) : '';
  error.hidden = !key;
}

function updateDocumentStatus(record) {
  record.element.dataset.confirmed = String(record.confirmed);
  record.element.querySelector('.document-status').textContent = phrase(record.confirmed ? 'documentChecked' : record.status);
}

function fillExtraction(record, recognition = null) {
  const result = recognition ? receiptFromRecognition(recognition) : extractReceipt(record.text);
  record.currencySource = result.currencySource || '';
  record.locationEvidence = result.locationEvidence || '';
  record.recoveryText = recognition?.recoveryText || '';
  record.headerText = recognition?.headerText || '';
  record.locationText = record.currencySource === 'location'
    ? [recognition?.bodyText ?? record.text, record.recoveryText, record.headerText].find(text => {
      const suggestion = inferLocationCurrency(text, result.date);
      return suggestion?.currency === result.currency && suggestion.evidence === result.locationEvidence;
    }) ?? '' : '';
  const previousCurrency = record.currency;
  const previousDate = record.date;
  const previousConversionDate = record.conversionDate;
  for (const field of ['merchant', 'date', 'reference', 'currency', 'amount']) {
    record[field] = result[field] ?? '';
    record.element.querySelector(`[data-field="${field}"]`).value = record[field];
  }
  syncCurrency(record);
  record.conversionDate = isoDate(record.date);
  record.element.querySelector('[data-field="conversionDate"]').value = record.conversionDate;
  if (record.currency !== previousCurrency || record.date !== previousDate
      || record.conversionDate !== previousConversionDate) resetRate(record);
  else updateConversion(record);
  uncheck(record);
  record.element.querySelector('.ocr-text').value = record.text;
  record.element.querySelector('.ocr-recovery-text').value = record.recoveryText;
  record.element.querySelector('.ocr-recovery').hidden = !record.recoveryText;
  record.element.querySelector('.ocr-header-text').value = record.headerText;
  record.element.querySelector('.ocr-header').hidden = !record.headerText;
  record.status = result.warning || 'reviewExtraction';
  showDocumentError(record, '');
  updateDocumentStatus(record);
  updateControls(record);
  if (!running) updateDefaultCurrency();
}

async function readBatch(batch) {
  if (running || exporting) return;
  const generation = epoch;
  setRunning(true);
  picker.busy(phrase('loadingEngine', { name: batch[0].filename }));
  let completed = 0;
  try {
    for (const record of batch) {
      if (generation !== epoch || record.disposed) return;
      uncheck(record);
      showDocumentError(record, '');
      record.status = 'loadingEngine';
      record.element.querySelector('.document-status').textContent = phrase('loadingEngine', { name: record.filename });
      let canvas;
      try {
        if (!record.preview) await inspectDocument(record, true);
        if (generation !== epoch || record.disposed) return;
        canvas = await imageTask(record, record.imageVersion, () => readImageCanvas(record.file, { rotation: record.rotation, crop: record.crop, maxEdge: 2400 }));
        if (!canvas) continue;
        if (generation !== epoch || record.disposed) return;
        const result = await recognize(canvas, progress => {
          if (generation !== epoch || record.disposed) return;
          const key = progress.status === 'recognizing text' ? 'reading' : 'loadingEngine';
          const text = phrase(key, { name: record.filename, percent: Math.round((progress.progress || 0) * 100) });
          $('read-progress').textContent = text;
          record.element.querySelector('.document-status').textContent = text;
        });
        if (generation !== epoch || record.disposed) return;
        record.text = result.text;
        fillExtraction(record, result);
        completed += 1;
      } catch {
        if (generation !== epoch || record.disposed) return;
        record.status = 'readFailed';
        updateDocumentStatus(record);
      } finally {
        if (canvas) canvas.width = canvas.height = 0;
      }
      updateReport();
    }
    $('read-progress').textContent = phrase('batchDone', { count: completed });
  } finally {
    if (generation === epoch) setRunning(false);
  }
}

function stopReading() {
  epoch += 1;
  terminateOcr();
  for (const record of records) {
    if (record.status === 'loadingEngine' || record.status === 'queued') {
      record.status = 'stopped'; updateDocumentStatus(record);
    }
  }
  $('read-progress').textContent = phrase('stopped');
  setRunning(false);
}

function csvFile() {
  const labels = Object.fromEntries(['filename', 'merchant', 'date', 'reference', 'currency', 'amount', 'conversionDate', 'rate', 'rateSource', 'rateDate', 'finalCurrency', 'convertedAmount', 'confirmed', 'yes', 'no', 'manual', 'online', 'same', 'documentCount', 'checkedCount', 'grandTotal'].map(key => [key, phrase(`csv.${key}`)]));
  labels.notEntered = phrase('notEntered');
  return new File(['\ufeff', buildConversionCsv(records, finalCurrency, labels)], phrase('csvFilename'), { type: 'text/csv;charset=utf-8' });
}

function makeReport(summary) {
  const grand = summarizeConverted(records, finalCurrency);
  const validFinal = /^[A-Z]{3}$/.test(finalCurrency);
  const lines = [phrase('reportTitle'), phrase('reportFinalCurrency', { currency: validFinal ? finalCurrency : phrase('notEntered') }), phrase('reportCounts', { count: summary.count, checked: grand.confirmedCount, review: summary.count - grand.confirmedCount }), ''];
  records.forEach((record, index) => {
    const minor = parseAmount(record.amount);
    lines.push(phrase('reportDocument', { number: index + 1, name: record.filename }));
    for (const [key, field] of [['reportMerchant', 'merchant'], ['reportDate', 'date'], ['reportReference', 'reference']]) {
      if (record[field].trim()) lines.push(phrase(key, { value: record[field] }));
    }
    lines.push(phrase('reportAmount', { currency: record.currency || phrase('unknownCurrency'), amount: minor === null ? phrase('notEntered') : formatMinor(minor) }));
    const conversion = conversionFor(record, finalCurrency);
    if (conversion.error) lines.push(phrase('reportConversionPending'));
    else {
      lines.push(phrase('reportRate', { base: record.currency, rate: conversion.rate, quote: finalCurrency }));
      lines.push(phrase(conversion.source === 'same' ? 'reportRateSame' : conversion.source === 'online' ? 'reportRateOnline' : 'reportRateManual', { date: conversion.date || phrase('notEntered'), requested: conversion.requestedDate }));
      lines.push(phrase('convertedAmount', { amount: formatMinor(conversion.minor), currency: finalCurrency }));
    }
    if (record.attachment) lines.push(phrase('reportAttachment', { name: record.attachment.file.name }));
    lines.push(phrase(record.confirmed && !validation(record) ? 'documentChecked' : 'needsReview'), '');
  });
  lines.push(phrase('reportTotals'));
  if (!summary.totals.length) lines.push(phrase('noTotals'));
  for (const total of summary.totals) {
    lines.push(total.warning ? phrase(total.warning) : phrase('currencyTotal', { currency: total.currency || phrase('unknownCurrency'), amount: total.amount, count: total.count }));
  }
  const images = records.filter(record => record.attachment);
  lines.push('', phrase('attachmentTotals', { count: images.length, size: Math.ceil(images.reduce((sum, record) => sum + record.attachment.size, 0) / 1024) }));
  lines.push('', grand.warning ? phrase(grand.warning) : phrase('reportGrandTotal', { amount: validFinal ? grand.amount : phrase('notEntered'), currency: validFinal ? finalCurrency : phrase('unknownCurrency'), count: grand.confirmedCount, documents: records.length }));
  return lines.join('\n');
}

function readyToSend() {
  return !running && !exporting && records.length > 0
    && records.every(record => record.confirmed && !validation(record) && record.attachment && !record.preparing && !record.inspecting)
    && !summarizeConverted(records, finalCurrency).warning;
}

function updateReport() {
  const summary = summarize(records);
  const grand = summarizeConverted(records, finalCurrency);
  $('document-count').textContent = summary.count;
  $('checked-count').textContent = grand.confirmedCount;
  $('review-count').textContent = summary.count - grand.confirmedCount;
  $('grand-total').textContent = grand.warning ? phrase(grand.warning) : /^[A-Z]{3}$/.test(finalCurrency) ? phrase('grandTotal', { amount: grand.amount, currency: finalCurrency }) : phrase('notEntered');
  $('grand-total-note').textContent = phrase('grandTotalNote', { checked: grand.confirmedCount, review: records.length - grand.confirmedCount });
  $('final-currency-choice').disabled = running || exporting;
  $('final-currency').disabled = running || exporting;
  $('use-default-currency').disabled = running || exporting;
  $('empty-documents').hidden = records.length > 0;
  $('clear-all').disabled = !records.length || exporting;
  const totals = $('currency-totals');
  totals.replaceChildren();
  for (const total of summary.totals) {
    const item = document.createElement('li');
    item.textContent = total.warning ? phrase(total.warning) : phrase('currencyTotal', { currency: total.currency || phrase('unknownCurrency'), amount: total.amount, count: total.count });
    totals.append(item);
  }
  $('report-text').value = records.length ? makeReport(summary) : '';
  if (useDefaultSubject) {
    const complete = records.length > 0 && grand.confirmedCount === records.length && !grand.warning;
    $('email-subject').value = records.length ? phrase(complete ? 'emailSubjectTotal' : 'emailSubjectCount', {
      title: phrase('reportTitle'), count: records.length, currency: finalCurrency, amount: grand.amount,
    }) : phrase('reportTitle');
  }
  for (const id of ['email-report', 'download-email', 'download-images']) $(id).disabled = !readyToSend();
  $('copy-report').disabled = !records.length || running || exporting;
  $('download-csv').disabled = !records.length || running || exporting;
  $('email-to').disabled = exporting;
  $('email-subject').disabled = exporting;
  $('export-status').textContent = records.length && !readyToSend() ? phrase('reviewFirst') : '';
}

function sharePayload() {
  return { files: [...records.map(record => record.attachment.file), csvFile()], text: $('report-text').value, title: $('email-subject').value };
}

function setExporting(value) {
  exporting = value;
  setRunning(running);
}

async function downloadEmail() {
  if (!readyToSend()) return;
  if (!$('email-to').checkValidity()) { $('export-status').textContent = phrase('invalidEmail'); return; }
  const options = { to: $('email-to').value, subject: $('email-subject').value, body: $('report-text').value,
    attachments: records.map(record => record.attachment.file), filename: phrase('emailFilename') };
  setExporting(true);
  let status;
  try {
    const file = await buildEmailDraft(options);
    saveBlob(file, file.name);
    status = phrase('emailDownloaded', { count: options.attachments.length });
  } catch (error) { status = phrase(error.message === 'email.invalid' ? 'invalidEmail' : 'emailFailed'); }
  finally { setExporting(false); $('export-status').textContent = status; }
}

$('final-currency-choice').addEventListener('change', event => {
  setFinalCurrency(event.target.value === 'custom' ? '' : event.target.value, event.target.value === 'custom');
  if (event.target.value === 'custom') $('final-currency').focus();
});
$('final-currency').addEventListener('input', event => setFinalCurrency(event.target.value, true));
$('use-default-currency').addEventListener('click', () => {
  useDefaultCurrency = true;
  updateDefaultCurrency();
});
wireCurrencyHelp($('default-currency-help'));
$('stop-reading').addEventListener('click', stopReading);
$('clear-all').addEventListener('click', () => {
  stopReading();
  for (const record of records) releaseRecord(record);
  records.length = 0;
  $('documents').replaceChildren();
  $('load-error').hidden = true;
  $('read-progress').textContent = '';
  updateDefaultCurrency();
  updateReport();
  picker.waiting();
});
$('copy-report').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText($('report-text').value);
    $('export-status').textContent = phrase('copied');
  } catch {
    $('report-text').focus(); $('report-text').select();
    $('export-status').textContent = phrase('copyFailed');
  }
});
$('download-csv').addEventListener('click', () => saveBlob(csvFile(), phrase('csvFilename')));
$('download-email').addEventListener('click', downloadEmail);
$('email-subject').addEventListener('input', () => { useDefaultSubject = false; });
$('email-report').addEventListener('click', async () => {
  if (!readyToSend()) return;
  const payload = sharePayload();
  let supported = false;
  try { supported = Boolean(navigator.canShare?.(payload) && navigator.share); } catch { /* The email file contains the same pictures when native file sharing is unavailable. */ }
  if (!supported) { await downloadEmail(); return; }
  // Prepared files are already in memory so the share call keeps the click's
  // transient activation. An async encode here would lose it on some devices.
  setExporting(true);
  let status = '';
  try { await navigator.share(payload); status = phrase('shared'); }
  catch (error) { if (error.name !== 'AbortError') status = phrase('shareFailed'); }
  finally { setExporting(false); $('export-status').textContent = status; }
});
$('download-images').addEventListener('click', async () => {
  if (!readyToSend()) return;
  const files = [...records.map(record => record.attachment.file), csvFile()];
  setExporting(true);
  let status;
  try {
    const entries = [];
    for (const file of files) entries.push({ name: file.name, data: new Uint8Array(await file.arrayBuffer()) });
    saveBlob(makeZip(entries), phrase('zipFilename'));
    status = phrase('zipDownloaded', { count: files.length - 1 });
  } catch { status = phrase('zipFailed'); }
  finally { setExporting(false); $('export-status').textContent = status; }
});
window.addEventListener('pagehide', event => {
  if (running) stopReading();
  else terminateOcr();
  if (!event.persisted) for (const record of records) releaseRecord(record);
});
$('privacy-toggle').addEventListener('click', () => {
  const open = $('privacy-panel').hidden;
  $('privacy-panel').hidden = !open;
  $('privacy-toggle').setAttribute('aria-expanded', String(open));
});
updateReport();
document.getElementById('boot-warning')?.remove();
