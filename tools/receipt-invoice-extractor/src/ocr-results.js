/**
 * A weak logo is easy to turn into a convincing but wrong merchant. Keep the
 * engine's line confidence for this suggestion, without hiding the complete
 * OCR text the visitor needs to review the rest of the document.
 */
import { extractReceipt } from './receipt.js';

function itemTable(text) {
  return (text.match(/\b(?:qty|quantity|items?|desc(?:ription)?|desription|price)\b/gi) ?? []).length >= 2;
}

function bodyStarts(text) {
  return itemTable(text)
    || /^(?:date\b|(?:invoice|receipt|transaction|purchase|issue)\s+date\b|cashier\b|operator\b|register\b|sub\s*[- ]?\s*total\b|total\b|grand\s+total\b|amount\b|balance\b|cash\b|change\b|discount\b|bill\s+to\b|ship\s+to\b|customer\b|\d+\s+\S)/i.test(text)
    || /^\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}\b/.test(text);
}

function validBox(box) {
  return box && ['x0', 'y0', 'x1', 'y1'].every(key => Number.isFinite(box[key]))
    && box.x1 > box.x0 && box.y1 > box.y0;
}

/**
 * Confidence filtering happens after locating the table in the unfiltered
 * lines. Otherwise a faint table heading could disappear and promote a clear
 * product description to the merchant. Missing structured evidence stays
 * blank rather than falling back to the same low-confidence text.
 * Full-document recognition uses 60. Only a separately bounded logo pass
 * should lower that threshold, and even that pass cannot go below 55.
 */
export function merchantFromRecognition(data, { minimumConfidence = 60 } = {}) {
  if (!Number.isFinite(minimumConfidence) || minimumConfidence < 55 || minimumConfidence > 100) return '';
  const lines = [];
  for (const block of Array.isArray(data?.blocks) ? data.blocks : []) {
    for (const paragraph of Array.isArray(block?.paragraphs) ? block.paragraphs : []) {
      for (const line of Array.isArray(paragraph?.lines) ? paragraph.lines : []) {
        const text = typeof line?.text === 'string' ? line.text.replace(/\s+/g, ' ').trim() : '';
        if (text && validBox(line?.bbox)) lines.push({ text, confidence: line.confidence, bbox: line.bbox });
      }
    }
  }
  lines.sort((a, b) => a.bbox.y0 - b.bbox.y0 || a.bbox.x0 - b.bbox.x0);
  const leading = lines.slice(0, 8);
  const boundary = leading.findIndex(line => bodyStarts(line.text));
  const header = boundary < 0 ? leading : leading.slice(0, boundary);
  const eligible = header.filter(line => Number.isFinite(line.confidence) && line.confidence >= minimumConfidence && line.confidence <= 100
    && (line.text.match(/\p{L}/gu) ?? []).length >= 3).map(line => ({
    ...line,
    // A compact numeric brand is distinct from an address or a quantity. The
    // text parser can still reject generic headings after this prefix removal.
    parseText: line.text.replace(/^\d+(?=[A-Za-z]|[-.'’&][A-Za-z])/, ''),
  }));
  const merchant = extractReceipt(eligible.map(line => line.parseText).join('\n')).merchant;
  return eligible.find(line => line.parseText === merchant)?.text ?? '';
}

/**
 * The separately read logo can contain words resembling dates, references or
 * currencies. Its evidence belongs only to the merchant field; the document
 * body remains the sole source of every financial and reference suggestion.
 */
export function receiptFromRecognition(recognition) {
  const result = extractReceipt(recognition?.bodyText ?? '');
  if (typeof recognition?.merchant === 'string') result.merchant = recognition.merchant;
  return result;
}
