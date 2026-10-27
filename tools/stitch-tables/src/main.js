import { parseTable, stitchTables, serializeTable, extractKey, LIMITS } from './table-data.js';
import { phrase } from './shared/phrases.js';
import { downloadLink } from './shared/download.js';
import { clipboardFeedback } from './shared/clipboard-feedback.js';

const $ = id => document.getElementById(id);
const sources = ['a', 'b'];
const fileVersions = { a: 0, b: 0 };
const sourceTexts = { a: null, b: null };
const pendingFiles = new Set();
let tables = null;
let pairs = [];
let result = null;
let exportValue = null;
const link = downloadLink($('download'), 'text/csv;charset=utf-8');
const copy = clipboardFeedback({
  read: () => exportValue,
  current: value => value !== null && value === exportValue,
  write: text => navigator.clipboard.writeText(text),
  done: () => { $('copy-status').textContent = phrase('stitch.copied'); },
  selected: () => {
    $('output').focus();
    $('output').select();
    $('copy-status').textContent = phrase('stitch.selected');
  },
  restore: () => { $('copy-status').textContent = ''; },
});

function sayError(id, message = '') {
  $(id).textContent = message;
  $(id).hidden = !message;
}

function discardResult() {
  result = null;
  exportValue = null;
  copy.invalidate();
  link.clear();
  $('result').inert = true;
  $('summary').textContent = phrase('stitch.await-result');
  $('duplicates').hidden = true;
  $('output').value = '';
  $('preview').replaceChildren();
  sayError('stitch-error');
}

function invalidateInputs() {
  tables = null;
  pairs = [];
  discardResult();
  $('stitch').disabled = true;
  for (const id of ['key-a', 'key-b', 'row-a', 'row-b']) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = phrase('stitch.read-first');
    $(id).replaceChildren(option);
    $(id).disabled = true;
  }
  $('add-pair').disabled = true;
  $('pairs').replaceChildren();
  $('pair-status').textContent = phrase('stitch.pairs-count', { count: 0 });
  sources.forEach(side => { $('status-' + side).textContent = phrase('stitch.empty'); });
  sayError('input-error');
}

function delimiter(id) {
  return $(id).value === 'tab' ? '\t' : $(id).value;
}

function errorText(error) {
  return phrase(error?.key || 'stitch.unexpected');
}

function columnName(table, index) {
  return `${index + 1}. ${table.headers[index] || phrase('stitch.column') + ' ' + (index + 1)}`;
}

function fillKeys(side, table) {
  $('key-' + side).disabled = false;
  $('key-' + side).replaceChildren(...table.headers.map((_, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = columnName(table, index);
    return option;
  }));
}

function readTables() {
  invalidateInputs();
  const next = [];
  for (const side of sources) {
    try {
      // A textarea normalizes CRLF, including line breaks inside quoted cells.
      const field = $('input-' + side);
      const saved = sourceTexts[side];
      const text = saved?.shown === field.value ? saved.text : field.value;
      const table = parseTable(text, {
        delimiter: delimiter('delimiter-' + side), header: $('header-' + side).checked,
      });
      next.push(table);
      $('status-' + side).textContent = phrase('stitch.loaded', { rows: table.rows.length, columns: table.headers.length });
    } catch (error) {
      sayError('input-error', phrase('stitch.side-error', { side: side.toUpperCase(), reason: errorText(error) }));
      return;
    }
  }
  if (next.some(table => !table.rows.length)) {
    sayError('input-error', phrase('stitch.no-data'));
    return;
  }
  tables = next;
  next.forEach((table, index) => fillKeys(sources[index], table));
  $('stitch').disabled = false;
  updateManual();
  updateMode();
}

function mode() {
  const value = document.querySelector('input[name="mode"]:checked').value;
  return value === 'simple' ? $('simple-mode').value : value;
}

function options() {
  return {
    mode: mode(), leftKey: Number($('key-a').value), rightKey: Number($('key-b').value),
    match: $('pattern').value, separator: $('separator').value,
    trim: $('trim').checked, ignoreCase: $('ignore-case').checked,
    join: $('join').value, pairs,
    labels: { left: phrase('stitch.left'), right: phrase('stitch.right'), column: phrase('stitch.column') },
  };
}

function updateKeyPreview() {
  $('key-preview').textContent = '';
  if (!tables) return;
  try {
    const config = options();
    const keys = tables.map((table, i) => extractKey(table.rows[0][i ? config.rightKey : config.leftKey], config));
    $('key-preview').textContent = phrase('stitch.key-sample', {
      a: keys[0] || phrase('stitch.no-key'), b: keys[1] || phrase('stitch.no-key'),
    });
  } catch {
    // The actionable error is shown beside Stitch; a sample must not retain an old key.
  }
}

function updateMode() {
  discardResult();
  const current = mode();
  $('matching').hidden = current !== 'match';
  $('manual').hidden = current !== 'manual';
  $('simple').hidden = !['append', 'position'].includes(current);
  $('join-options').hidden = ['append', 'position'].includes(current);
  $('separator-field').hidden = !['before', 'after'].includes($('pattern').value);
  updateKeyPreview();
}

function rowLabel(table, index) {
  return phrase('stitch.row', { row: index + 1, cells: table.rows[index].join(' · ').slice(0, 160) });
}

function updateManual() {
  if (!tables) return;
  for (let side = 0; side < 2; side += 1) {
    const used = new Set(pairs.map(pair => pair[side]));
    const select = $('row-' + sources[side]);
    const previous = select.value;
    const fragment = document.createDocumentFragment();
    tables[side].rows.forEach((_, index) => {
      if (used.has(index)) return;
      const option = document.createElement('option');
      option.value = index;
      option.textContent = rowLabel(tables[side], index);
      fragment.append(option);
    });
    select.replaceChildren(fragment);
    if ([...select.options].some(option => option.value === previous)) select.value = previous;
    select.disabled = !select.options.length;
    if (select.disabled) {
      const option = document.createElement('option');
      option.textContent = phrase('stitch.no-rows');
      select.append(option);
    }
  }
  $('add-pair').disabled = $('row-a').disabled || $('row-b').disabled;
  $('pair-status').textContent = phrase('stitch.pairs-count', { count: pairs.length });
  $('pairs').replaceChildren(...pairs.map((pair, index) => {
    const item = document.createElement('li');
    item.textContent = phrase('stitch.pair', { a: pair[0] + 1, b: pair[1] + 1 });
    const remove = document.createElement('button');
    remove.className = 'btn small';
    remove.type = 'button';
    remove.textContent = phrase('stitch.remove', { number: index + 1 });
    remove.addEventListener('click', () => {
      pairs.splice(index, 1);
      discardResult();
      updateManual();
    });
    item.append(remove);
    return item;
  }));
}

function renderPreview() {
  const head = document.createElement('thead');
  const heading = document.createElement('tr');
  for (const value of result.headers.slice(0, 20)) {
    const cell = document.createElement('th');
    cell.scope = 'col';
    cell.textContent = value;
    heading.append(cell);
  }
  head.append(heading);
  const body = document.createElement('tbody');
  for (const row of result.rows.slice(0, 100)) {
    const line = document.createElement('tr');
    for (const value of row.slice(0, 20)) {
      const cell = document.createElement('td');
      cell.textContent = value;
      line.append(cell);
    }
    body.append(line);
  }
  $('preview').replaceChildren(head, body);
}

function prepareExport() {
  if (!result) return;
  const sep = delimiter('output-delimiter');
  const text = serializeTable(result.headers, result.rows, {
    delimiter: sep, protectFormulas: $('protect').checked, includeHeader: $('output-header').checked,
  });
  copy.invalidate();
  exportValue = { text };
  $('output').value = text;
  link.offer(new Blob(['\uFEFF', text], { type: sep === '\t' ? 'text/tab-separated-values;charset=utf-8' : 'text/csv;charset=utf-8' }),
    sep === '\t' ? 'stitched-table.tsv' : 'stitched-table.csv');
}

function stitch() {
  discardResult();
  if (!tables) {
    sayError('input-error', phrase('stitch.stale'));
    return;
  }
  try {
    result = stitchTables(tables[0], tables[1], options());
    $('summary').textContent = phrase(['append', 'position'].includes(mode()) ? 'stitch.simple-summary' : 'stitch.summary', {
      rows: result.rows.length, columns: result.headers.length, matched: result.matched,
      a: result.unmatchedA, b: result.unmatchedB,
    });
    $('duplicates').hidden = !result.duplicateKeys || mode() !== 'match';
    $('duplicates').textContent = phrase('stitch.duplicates', { count: result.duplicateKeys });
    renderPreview();
    $('result').inert = false;
    prepareExport();
  } catch (error) {
    discardResult();
    sayError('stitch-error', errorText(error));
  }
}

for (const side of sources) {
  $('input-' + side).addEventListener('input', () => {
    sourceTexts[side] = null;
    fileVersions[side] += 1;
    pendingFiles.delete(side);
    $('load').disabled = pendingFiles.size > 0;
    invalidateInputs();
  });
  for (const prefix of ['delimiter-', 'header-']) $(prefix + side).addEventListener('change', invalidateInputs);
  $('clear-' + side).addEventListener('click', () => {
    sourceTexts[side] = null;
    fileVersions[side] += 1;
    pendingFiles.delete(side);
    $('load').disabled = pendingFiles.size > 0;
    $('file-' + side).value = '';
    $('input-' + side).value = '';
    invalidateInputs();
  });
  $('file-' + side).addEventListener('change', async () => {
    const file = $('file-' + side).files[0];
    if (!file) return;
    const owner = ++fileVersions[side];
    sourceTexts[side] = null;
    pendingFiles.add(side);
    $('load').disabled = true;
    $('input-' + side).value = '';
    invalidateInputs();
    $('status-' + side).textContent = phrase('stitch.reading');
    try {
      if (file.size > LIMITS.inputChars) throw { key: 'table.input-limit' };
      const text = new TextDecoder('utf-8', { fatal: true }).decode(await file.arrayBuffer());
      if (owner !== fileVersions[side]) return;
      if (text.includes('\0')) throw { key: 'stitch.read-error' };
      $('input-' + side).value = text;
      sourceTexts[side] = { text, shown: $('input-' + side).value };
    } catch (error) {
      if (owner !== fileVersions[side]) return;
      sayError('input-error', phrase('stitch.side-error', { side: side.toUpperCase(), reason: error?.key ? errorText(error) : phrase('stitch.read-error') }));
    } finally {
      if (owner === fileVersions[side]) {
        pendingFiles.delete(side);
        $('load').disabled = pendingFiles.size > 0;
        $('status-' + side).textContent = phrase('stitch.empty');
      }
    }
  });
}

$('load').addEventListener('click', readTables);
$('example').addEventListener('click', () => {
  pendingFiles.clear();
  $('load').disabled = false;
  sources.forEach(side => {
    sourceTexts[side] = null;
    fileVersions[side] += 1;
    $('file-' + side).value = '';
    $('input-' + side).value = $('example-' + side).textContent.trim();
    $('delimiter-' + side).value = 'auto';
    $('header-' + side).checked = true;
  });
  document.querySelector('input[name="mode"][value="match"]').checked = true;
  $('pattern').value = 'digits';
  $('join').value = 'full';
  readTables();
  stitch();
});
document.querySelectorAll('input[name="mode"]').forEach(input => input.addEventListener('change', updateMode));
for (const id of ['key-a', 'key-b', 'pattern', 'separator', 'trim', 'ignore-case', 'join', 'simple-mode']) {
  $(id).addEventListener(id === 'separator' ? 'input' : 'change', updateMode);
}
$('add-pair').addEventListener('click', () => {
  if ($('add-pair').disabled || !tables) return;
  pairs.push([Number($('row-a').value), Number($('row-b').value)]);
  discardResult();
  updateManual();
});
$('clear-pairs').addEventListener('click', () => { pairs = []; discardResult(); updateManual(); });
$('stitch').addEventListener('click', stitch);
for (const id of ['output-delimiter', 'output-header', 'protect']) $(id).addEventListener('change', prepareExport);
$('copy').addEventListener('click', () => copy.copy());
$('privacy-toggle').addEventListener('click', () => {
  const open = $('privacy-panel').hidden;
  $('privacy-panel').hidden = !open;
  $('privacy-toggle').setAttribute('aria-expanded', String(open));
});
document.getElementById('boot-warning')?.remove();
