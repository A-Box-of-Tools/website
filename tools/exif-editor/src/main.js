/** UI wiring and application state. */

import { phrase, ltr } from './shared/phrases.js';
import { measureImage } from './shared/media.js';
import { saveBlob } from './shared/download.js';
import { messageBox } from './shared/message-box.js';
import { wireFilePicker, readingLabel } from './shared/file-picker.js';
import { makeZip } from './shared/zip.js';
import { readImage, readBytes, serialize, exifBytes, outputType, KIND_NAMES } from './container.js';
import { cleanAvif } from './avif.js';
import { prepareCleanCopy } from './clean-copy.js';
import { outName, cleanNames } from './names.js';
import { setEntryValue, createEntry, TYPE } from './tiff.js';
import { describeTag } from './tags.js';
import { makeExample } from './example.js';
import {
  formatValue, readPosition, buildFindings, badges, bytes as humanBytes,
  countTags, metadataSize, hasMetadata, tagGroups,
} from './report.js';

const $ = (id) => document.getElementById(id);

const el = {
  dropzone: $('dropzone'),
  fileInput: $('file-input'),
  fileList: $('file-list'),
  listToolbar: $('list-toolbar'),
  countLabel: $('count-label'),
  clearAll: $('clear-all'),
  loadError: $('load-error'),
  stripAll: $('strip-all'),
  stripStatus: $('strip-status'),
  keepOrientation: $('keep-orientation'),
  keepIcc: $('keep-icc'),
  keepSummary: $('keep-summary'),
  cleanResults: $('clean-results'),
  resultList: $('result-list'),
  downloadZip: $('download-zip'),
  inspectEmpty: $('inspect-empty'),
  inspector: $('inspector'),
  inspectThumb: $('inspect-thumb'),
  inspectName: $('inspect-name'),
  inspectSub: $('inspect-sub'),
  inspectSelect: $('inspect-select'),
  avifInspectNote: $('avif-inspect-note'),
  findingsList: $('findings-list'),
  blockList: $('block-list'),
  tagGroups: $('tag-groups'),
  tagsNote: $('tags-note'),
  addTag: $('add-tag'),
  addTagSelect: $('add-tag-select'),
  addTagValue: $('add-tag-value'),
  addTagGo: $('add-tag-go'),
  saveEdits: $('save-edits'),
  revertEdits: $('revert-edits'),
  saveStatus: $('save-status'),
  editError: $('edit-error'),
  privacyToggle: $('privacy-toggle'),
  privacyPanel: $('privacy-panel'),
};

const { show: showLoadError, clear: clearLoadError } = messageBox(el.loadError);

/**
 * @typedef {object} Item
 * @property {number} id
 * @property {string} name original file name
 * @property {number} size
 * @property {Uint8Array} bytes the file as it was read, never modified
 * @property {string} thumbUrl an object URL, revoked when the item is dropped
 * @property {Set<string>} drop container-level blocks the user has removed
 * @property {boolean} dirty true once anything has been changed
 * ...plus everything readBytes returns: ok, kind, error, doc, meta, exif
 */

/** @type {Item[]} */
let items = [];
let selectedId = null;
let nextId = 1;
let cleaning = false;
let cleanEpoch = 0;

/** Object URLs handed to download links, revoked when the results are replaced. */
let resultUrls = [];
let resultEpoch = 0;

/* ------------------------------------------------------------------ adding */

// The drop zone and the picker: shared, because every tool here needs the
// same one. src/shared/file-picker.js, copied in from shared/js/ by the
// build. The resting label comes off the markup, so it is written once,
// in this tool.toml, rather than here as well.
const picker = wireFilePicker({
  input: el.fileInput,
  dropzone: el.dropzone,
  onFiles(files) {
    addFiles(files);
  },
  example: makeExample,
});

async function addFiles(files) {
  if (!files?.length) return;

  picker.busy(readingLabel(files.length));

  const failures = [];

  try {
    for (const file of files) {
      let item;
      try {
        item = await readImage(file);
      } catch (error) {
        // The readers name their refusal; phrase() returns a key it does not
        // know unchanged, so a real message from the platform still shows.
        failures.push(`${file.name}: ${phrase(error.message, error.values)}`);
        continue;
      }

      item.id = nextId;
      nextId += 1;
      item.name = file.name;
      item.size = file.size;
      item.drop = new Set();
      item.dirty = false;
      item.thumbUrl = URL.createObjectURL(file);

      // One decode, used twice: it draws the thumbnail, and its dimensions are
      // what a WebP with no extended header needs before metadata can be added.
      const dims = await measureImage(item.thumbUrl);
      if (dims && item.doc) item.doc.canvas = dims;
      if (item.kind === 'avif' && (!dims || dims.width * dims.height > 80_000_000)) {
        item.ok = false;
        item.error = dims ? 'write.aviflarge' : 'read.avifdecode';
      }

      if (item.ok) normalizeExif(item);

      // What the file arrived with, recorded before anything can be removed.
      // The block list needs to say "removed" rather than silently dropping a
      // row, and it cannot tell the two apart from the live model alone.
      if (item.ok) {
        const position = readPosition(item.exif.groups.gps);
        item.had = {
          exif: countTags(item) > 0,
          gps: item.exif.groups.gps.length > 0,
          thumbnail: Boolean(item.exif.thumbnail?.length),
          // Kept as text, because once the tags are gone there is nothing left
          // to describe them with, and "location tags, but no position" is the
          // wrong thing to say about a row that used to name a street.
          where: position ? `${position.text}.` : phrase('block.gps.partial'),
        };

        // PNG key/value chunks, as a working copy. Editing one means rewriting
        // the set, so the set is what is held.
        item.textChunks = item.meta.text.map((t) => ({
          keyword: t.keyword,
          value: t.value ?? '',
          unreadable: Boolean(t.unreadable),
        }));
        item.textDirty = false;
      }

      items.push(item);
      if (!item.ok) failures.push(`${file.name}: ${phrase(item.error, item.values)}`);
    }
  } finally {
    picker.done();
  }

  if (failures.length) showLoadError(failures.join('\n'));
  else clearLoadError();

  if (selectedId === null) selectedId = items.find((i) => i.ok)?.id ?? null;
  render();
}

/** An EXIF model with nothing in it, ready to be added to. */
const emptyExif = () => ({
  ok: true,
  littleEndian: true,
  groups: { ifd0: [], exif: [], gps: [], interop: [], ifd1: [] },
  thumbnail: null,
});

/**
 * Make sure the item has a model the rest of the app can work on.
 *
 * Two cases end up here. A photo with no EXIF at all gets an empty model, so
 * that the "add a tag" control has somewhere to put the first one. A photo whose
 * EXIF is there but will not parse gets the same empty model plus a flag, and
 * the flag is what stops the page pretending the file was clean: there is a
 * block in it, we could not read it, and saying so is the whole point.
 */
function normalizeExif(item) {
  item.exifUnreadable = Boolean(item.exif && !item.exif.ok && item.meta.exif);
  item.exifError = item.exifUnreadable ? item.exif.error : null;
  if (!item.exif?.ok) item.exif = emptyExif();
}


function removeItem(id) {
  const at = items.findIndex((i) => i.id === id);
  if (at < 0) return;
  cleanEpoch += 1;
  URL.revokeObjectURL(items[at].thumbUrl);
  items.splice(at, 1);
  if (selectedId === id) selectedId = items.find((i) => i.ok)?.id ?? null;
  render();
}

el.clearAll.addEventListener('click', () => {
  cleanEpoch += 1;
  for (const item of items) URL.revokeObjectURL(item.thumbUrl);
  items = [];
  selectedId = null;
  clearResults();
  clearLoadError();
  render();
});

/* --------------------------------------------------------------- rendering */

/*
  Everything below builds DOM nodes and sets textContent. Nothing read out of a
  photo is ever put through innerHTML, and that is a rule rather than a habit:
  every string on this page - a tag value, a comment, a file name, an XMP packet
  - came out of a file somebody else made, and some of them will contain markup
  precisely because a page like this one exists.
*/

function render() {
  const any = items.length > 0;
  el.listToolbar.hidden = !any;
  el.countLabel.textContent = any
    ? phrase(items.length === 1 ? 'list.photos.one' : 'list.photos.many', { count: items.length })
    : '';

  renderList();
  el.stripAll.disabled = cleaning || !items.some((i) => i.ok);
  renderKeepSummary();
  renderInspector();
}

function renderList() {
  el.fileList.replaceChildren();

  for (const item of items) {
    const li = document.createElement('li');
    li.className = 'file-row';
    if (item.id === selectedId) li.classList.add('selected');
    if (!item.ok) li.classList.add('unreadable');

    const pick = document.createElement('button');
    pick.type = 'button';
    pick.className = 'file-pick';
    pick.disabled = !item.ok;
    pick.addEventListener('click', () => { selectedId = item.id; render(); });

    const thumb = document.createElement('img');
    thumb.className = 'file-thumb';
    thumb.src = item.thumbUrl;
    thumb.alt = '';
    thumb.loading = 'lazy';
    pick.appendChild(thumb);

    const main = document.createElement('span');
    main.className = 'file-main';

    const name = document.createElement('span');
    name.className = 'file-name';
    name.textContent = item.name;
    main.appendChild(name);

    const sub = document.createElement('span');
    sub.className = 'file-sub';
    sub.textContent = item.ok
      ? phrase(item.kind === 'avif' ? 'row.avif' : 'row.file', {
        kind: KIND_NAMES[item.kind],
        size: humanBytes(item.size),
        metadata: humanBytes(metadataSize(item)),
      })
      : phrase(item.error, item.values);
    main.appendChild(sub);

    if (item.ok) {
      const row = document.createElement('span');
      row.className = 'badges';
      const shownBadges = badges(item).filter((badge) => item.kind !== 'avif' || badge.label !== 'badge.clean');
      if (item.kind === 'avif') shownBadges.push({ label: 'badge.avif', level: 'medium' });
      for (const badge of shownBadges) {
        const span = document.createElement('span');
        span.className = `badge badge-${badge.level}`;
        span.textContent = phrase(badge.label, badge.values);
        row.appendChild(span);
      }
      main.appendChild(row);
    }

    pick.appendChild(main);
    li.appendChild(pick);

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'row-remove';
    const off = phrase('row.remove', { name: item.name });
    remove.title = off;
    remove.setAttribute('aria-label', off);
    remove.textContent = '×';
    remove.addEventListener('click', () => removeItem(item.id));
    li.appendChild(remove);

    el.fileList.appendChild(li);
  }
}

/** State the exact bargain the "remove all" button is offering, in one line. */
function renderKeepSummary() {
  // One phrase per combination rather than a list joined with "and": which
  // word joins two things, and whether there is one at all, is a question each
  // language answers for itself.
  const orientation = el.keepOrientation.checked;
  const icc = el.keepIcc.checked;
  const anyAvif = items.some((item) => item.ok && item.kind === 'avif');
  const containerEdits = items.some((item) => item.ok && item.kind !== 'avif');
  el.keepOrientation.disabled = cleaning || (anyAvif && !containerEdits);
  el.keepIcc.disabled = cleaning || (anyAvif && !containerEdits);
  if (anyAvif && !containerEdits) {
    el.keepSummary.textContent = phrase('keep.avif');
    return;
  }
  if (!orientation && !icc) el.keepSummary.textContent = phrase('keep.nothing');
  else if (orientation && icc) el.keepSummary.textContent = phrase('keep.both');
  else el.keepSummary.textContent = phrase(orientation ? 'keep.orientation' : 'keep.icc');
  if (anyAvif) el.keepSummary.textContent += ` ${phrase('keep.avif')}`;
}

el.keepOrientation.addEventListener('change', renderKeepSummary);
el.keepIcc.addEventListener('change', renderKeepSummary);


/**
 * A tag's value, as words where it is words.
 *
 * formatValue hands back a plain string for anything read out of the file and
 * phrase descriptors for the tool's own words. Flash is a list of phrase
 * keys because its independent flags can occur together; even the separator
 * belongs to the translation, so Chinese does not inherit an English comma.
 */
const say = (value) => {
  if (value?.parts) {
    return value.parts.map((key) => phrase(key)).reduce((left, right) =>
      phrase('value.separator', { left, right }));
  }
  return value?.key ? phrase(value.key, value.values) : value;
};

/* --------------------------------------------------------------- inspector */

const selected = () => items.find((i) => i.id === selectedId && i.ok) ?? null;

function renderInspector() {
  const item = selected();
  el.inspector.hidden = !item;
  el.inspectEmpty.hidden = Boolean(item);
  if (el.avifInspectNote) el.avifInspectNote.hidden = item?.kind !== 'avif';
  if (!item) return;

  el.inspectSelect.replaceChildren();
  const readable = items.filter((i) => i.ok);
  for (const other of readable) {
    const option = document.createElement('option');
    option.value = String(other.id);
    option.textContent = other.name;
    option.selected = other.id === item.id;
    el.inspectSelect.appendChild(option);
  }
  el.inspectSelect.parentElement.hidden = readable.length < 2;

  el.inspectThumb.src = item.thumbUrl;
  el.inspectThumb.hidden = false;
  el.inspectName.textContent = item.name;

  const size = item.doc?.canvas;
  el.inspectSub.textContent = [
    KIND_NAMES[item.kind],
    size ? ltr(`${size.width} × ${size.height}`) : null,
    humanBytes(item.size),
    item.kind === 'avif' ? phrase('inspect.avif') : hasMetadata(item)
      ? phrase('inspect.metadata', { size: humanBytes(metadataSize(item)) })
      : phrase('inspect.nometadata'),
  ].filter(Boolean).join(' · ');

  renderFindings(item);
  renderBlocks(item);
  renderTags(item);
  renderAddTag(item);
  updateSaveButtons();
  clearEditError();
}

el.inspectSelect.addEventListener('change', () => {
  selectedId = Number(el.inspectSelect.value);
  render();
});

function renderFindings(item) {
  el.findingsList.replaceChildren();
  const findings = buildFindings(item, phrase);

  if (!findings.length) {
    const li = document.createElement('li');
    li.className = item.kind === 'avif' ? 'finding' : 'finding finding-clean';
    const title = document.createElement('p');
    title.className = 'finding-title';
    title.textContent = phrase(item.kind === 'avif' ? 'avif.scope.title' : 'find.clean.title');
    const detail = document.createElement('p');
    detail.className = 'finding-detail';
    detail.textContent = phrase(item.kind === 'avif' ? 'avif.nofindings'
      : item.dirty ? 'find.clean.cleared' : 'find.clean.never');
    li.append(title, detail);
    el.findingsList.appendChild(li);
    return;
  }

  for (const finding of findings) {
    const li = document.createElement('li');
    li.className = `finding finding-${finding.level}`;

    const title = document.createElement('p');
    title.className = 'finding-title';
    title.textContent = finding.title;

    const detail = document.createElement('p');
    detail.className = 'finding-detail';
    detail.textContent = finding.detail;

    li.append(title, detail);
    el.findingsList.appendChild(li);
  }
}

/**
 * The removable blocks in this file.
 *
 * A block is listed if the file arrived with it, and stays listed after it is
 * removed - marked as removed rather than quietly vanishing. A row that
 * disappears when you press its button leaves you wondering whether anything
 * happened; one that says "removed" does not.
 */
function blockDescriptors(item) {
  const groups = item.exif.groups;
  const meta = item.meta;
  const list = [];

  const clearGroups = () => {
    for (const key of Object.keys(groups)) groups[key] = [];
    item.exif.thumbnail = null;
  };

  if (item.exifUnreadable) {
    list.push({
      title: phrase('block.exifbad.title'),
      detail: phrase('block.exifbad.detail', {
        size: humanBytes(meta.exif.length),
        reason: phrase(item.exifError),
      }),
      gone: true,
      pill: phrase('block.cannotkeep'),
    });
  }

  if (item.had.exif) {
    list.push({
      title: phrase('block.exif.title'),
      detail: phrase(countTags(item) === 1 ? 'block.exif.one' : 'block.exif.many',
                     { count: countTags(item) }),
      gone: countTags(item) === 0,
      label: phrase('block.exif.remove'),
      remove: clearGroups,
    });
  }

  if (item.had.gps) {
    list.push({
      title: phrase('block.gps.title'),
      detail: item.had.where,
      gone: groups.gps.length === 0,
      label: phrase('block.gps.remove'),
      remove: () => { groups.gps = []; },
    });
  }

  if (item.had.thumbnail) {
    list.push({
      title: phrase('block.thumbnail.title'),
      detail: phrase('block.thumbnail.detail'),
      gone: !item.exif.thumbnail,
      label: phrase('block.thumbnail.remove'),
      remove: () => { item.exif.thumbnail = null; },
    });
  }

  const containerBlocks = [
    ['xmp', meta.xmp !== null && meta.xmp !== undefined,
      () => phrase('block.xmp.detail', { size: humanBytes(meta.xmp.length) })],
    ['iptc', Boolean(meta.iptc),
      () => phrase('block.iptc.detail', { size: humanBytes(meta.iptc.length) })],
    ['text', meta.text.length > 0,
      () => phrase(meta.text.length === 1 ? 'block.text.one' : 'block.text.many', {
        count: meta.text.length,
        keywords: meta.text.map((t) => t.keyword).join(', '),
      })],
    ['comments', meta.comments.length > 0,
      () => phrase(meta.comments.length === 1 ? 'block.comments.one' : 'block.comments.many',
                   { count: meta.comments.length })],
    ['extras', meta.extras.length > 0,
      () => phrase('block.extras.detail', {
        blocks: meta.extras.map((x) => `${x.label} (${humanBytes(x.size)})`).join(', '),
      })],
    ['icc', Boolean(meta.icc),
      () => phrase(meta.iccName ? 'block.icc.named' : 'block.icc.detail', {
        size: humanBytes(meta.icc.length),
        name: meta.iccName,
      })],
  ];

  for (const [id, present, detail] of containerBlocks) {
    if (!present) continue;
    list.push({
      title: phrase(`block.${id}.title`),
      detail: detail(),
      gone: item.drop.has(id),
      label: phrase('block.remove'),
      remove: () => item.drop.add(id),
    });
  }

  return list;
}

function renderBlocks(item) {
  el.blockList.replaceChildren();
  if (item.kind === 'avif') {
    const li = document.createElement('li');
    li.className = 'block block-none';
    li.textContent = phrase('avif.blocks');
    el.blockList.appendChild(li);
    return;
  }
  const blocks = blockDescriptors(item);

  if (!blocks.length && !item.meta.notes.length) {
    const li = document.createElement('li');
    li.className = 'block block-none';
    li.textContent = phrase('block.none');
    el.blockList.appendChild(li);
    return;
  }

  for (const block of blocks) {
    const li = document.createElement('li');
    li.className = `block${block.gone ? ' block-gone' : ''}`;

    const text = document.createElement('div');
    const title = document.createElement('p');
    title.className = 'block-title';
    title.textContent = block.title;
    const detail = document.createElement('p');
    detail.className = 'block-detail';
    detail.textContent = block.detail;
    text.append(title, detail);
    li.appendChild(text);

    if (block.gone) {
      const pill = document.createElement('span');
      pill.className = 'block-removed';
      pill.textContent = block.pill ?? phrase('block.removed');
      li.appendChild(pill);
    } else {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'ghost danger';
      button.textContent = block.label;
      button.addEventListener('click', () => {
        block.remove();
        item.dirty = true;
        renderInspector();
        renderList();
      });
      li.appendChild(button);
    }

    el.blockList.appendChild(li);
  }

  // Blocks that look like metadata and are deliberately left alone. Saying so
  // is the difference between "we kept this" and "we missed this".
  for (const note of item.meta.notes) {
    const li = document.createElement('li');
    li.className = 'block block-kept';
    const text = document.createElement('div');
    const title = document.createElement('p');
    title.className = 'block-title';
    // The readers name both halves; the sentences live in body.html.
    title.textContent = phrase(note.label);
    const detail = document.createElement('p');
    detail.className = 'block-detail';
    detail.textContent = phrase(note.detail);
    text.append(title, detail);
    li.appendChild(text);
    const pill = document.createElement('span');
    pill.className = 'block-kept-pill';
    pill.textContent = phrase('block.kept');
    li.appendChild(pill);
    el.blockList.appendChild(li);
  }
}

/* -------------------------------------------------------------- tag tables */

function renderTags(item) {
  el.tagGroups.replaceChildren();
  const groups = tagGroups(item);

  el.tagsNote.textContent = phrase(item.kind === 'avif' ? 'editor.avif'
    : groups.length ? 'editor.note' : 'editor.notags');

  if (item.textChunks?.length && !item.drop.has('text')) el.tagGroups.appendChild(textChunkGroup(item));

  for (const group of groups) {
    const section = document.createElement('section');
    section.className = 'tag-group';

    const heading = document.createElement('h4');
    heading.textContent = phrase(group.title);
    const count = document.createElement('span');
    count.className = 'group-count';
    count.textContent = phrase(group.entries.length === 1 ? 'editor.tags.one' : 'editor.tags.many',
                               { count: group.entries.length });
    heading.appendChild(count);
    section.appendChild(heading);

    const note = document.createElement('p');
    note.className = 'group-note';
    note.textContent = phrase(group.note);
    section.appendChild(note);

    const scroll = document.createElement('div');
    scroll.className = 'table-scroll';
    const table = document.createElement('table');
    table.className = 'tag-table';

    const head = document.createElement('thead');
    const headRow = document.createElement('tr');
    for (const label of [phrase('editor.tag'), phrase('editor.value'), '']) {
      const th = document.createElement('th');
      th.scope = 'col';
      th.textContent = label;
      headRow.appendChild(th);
    }
    head.appendChild(headRow);
    table.appendChild(head);

    const body = document.createElement('tbody');
    for (const entry of group.entries) body.appendChild(tagRow(item, group.id, entry));
    table.appendChild(body);

    scroll.appendChild(table);
    section.appendChild(scroll);
    el.tagGroups.appendChild(section);
  }
}

/**
 * PNG's own key/value chunks, which are not EXIF and have no tag numbers.
 *
 * Rewriting one means rewriting the set, because that is how the plan for a PNG
 * is expressed. A chunk whose compressed data would not unpack cannot be
 * written back, so if there is one the whole set is shown read-only rather than
 * offering an edit that would quietly drop it.
 */
function textChunkGroup(item) {
  const section = document.createElement('section');
  section.className = 'tag-group';

  const heading = document.createElement('h4');
  heading.textContent = phrase('block.text.title');
  const count = document.createElement('span');
  count.className = 'group-count';
  count.textContent = phrase(item.textChunks.length === 1 ? 'editor.pairs.one' : 'editor.pairs.many',
                             { count: item.textChunks.length });
  heading.appendChild(count);
  section.appendChild(heading);

  const frozen = item.textChunks.some((t) => t.unreadable);

  const note = document.createElement('p');
  note.className = 'group-note';
  note.textContent = phrase(frozen ? 'editor.frozen' : 'editor.textnote');
  section.appendChild(note);

  const scroll = document.createElement('div');
  scroll.className = 'table-scroll';
  const table = document.createElement('table');
  table.className = 'tag-table';

  const head = document.createElement('thead');
  const headRow = document.createElement('tr');
  for (const label of [phrase('editor.keyword'), phrase('editor.value'), '']) {
    const th = document.createElement('th');
    th.scope = 'col';
    th.textContent = label;
    headRow.appendChild(th);
  }
  head.appendChild(headRow);
  table.appendChild(head);

  const body = document.createElement('tbody');
  for (const chunk of item.textChunks) {
    const tr = document.createElement('tr');

    const th = document.createElement('th');
    th.scope = 'row';
    if (frozen) {
      th.textContent = chunk.keyword;
    } else {
      const key = document.createElement('input');
      key.className = 'tag-input';
      key.value = chunk.keyword;
      key.spellcheck = false;
      key.setAttribute('aria-label', phrase('editor.keywordfor', { keyword: chunk.keyword }));
      key.addEventListener('change', () => {
        chunk.keyword = key.value;
        item.textDirty = true;
        markDirty(item);
      });
      th.appendChild(key);
    }
    tr.appendChild(th);

    const valueCell = document.createElement('td');
    if (chunk.unreadable) {
      const span = document.createElement('span');
      span.className = 'tag-readonly';
      span.textContent = phrase('editor.unreadable');
      valueCell.appendChild(span);
    } else if (frozen) {
      const span = document.createElement('span');
      span.className = 'tag-readonly';
      span.textContent = chunk.value;
      valueCell.appendChild(span);
    } else {
      const input = document.createElement('input');
      input.className = 'tag-input';
      input.value = chunk.value;
      input.spellcheck = false;
      input.setAttribute('aria-label', phrase('editor.valuefor', { keyword: chunk.keyword }));
      input.addEventListener('change', () => {
        chunk.value = input.value;
        item.textDirty = true;
        markDirty(item);
      });
      valueCell.appendChild(input);
    }
    tr.appendChild(valueCell);

    const actions = document.createElement('td');
    actions.className = 'tag-actions';
    if (!frozen) {
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'tag-delete';
      remove.textContent = phrase('block.remove');
      remove.setAttribute('aria-label', phrase('editor.removechunk', { keyword: chunk.keyword }));
      remove.addEventListener('click', () => {
        const at = item.textChunks.indexOf(chunk);
        if (at >= 0) item.textChunks.splice(at, 1);
        item.textDirty = true;
        item.dirty = true;
        renderInspector();
        renderList();
      });
      actions.appendChild(remove);
    }
    tr.appendChild(actions);

    body.appendChild(tr);
  }
  table.appendChild(body);
  scroll.appendChild(table);
  section.appendChild(scroll);
  return section;
}

function tagRow(item, group, entry) {
  const spec = describeTag(group, entry.tag);
  const tr = document.createElement('tr');

  const th = document.createElement('th');
  th.scope = 'row';

  const name = document.createElement('span');
  name.className = 'tag-name';
  name.textContent = spec.name;
  th.appendChild(name);

  if (spec.risk) {
    const dot = document.createElement('span');
    dot.className = `tag-risk tag-risk-${spec.risk}`;
    dot.textContent = phrase(spec.risk === 'high' ? 'risk.high' : 'risk.medium');
    if (spec.note) dot.title = phrase(spec.note);
    th.appendChild(dot);
  }

  const id = document.createElement('span');
  id.className = 'tag-id';
  id.textContent = `0x${entry.tag.toString(16).padStart(4, '0')}`;
  th.appendChild(id);
  tr.appendChild(th);

  const valueCell = document.createElement('td');
  valueCell.appendChild(editorFor(item, group, entry));
  tr.appendChild(valueCell);

  const actions = document.createElement('td');
  actions.className = 'tag-actions';
  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'tag-delete';
  remove.disabled = item.kind === 'avif';
  remove.textContent = phrase('block.remove');
  remove.setAttribute('aria-label', phrase('editor.removetag', { tag: spec.name }));
  remove.addEventListener('click', () => {
    if (item.kind === 'avif') return;
    const list = item.exif.groups[group];
    const at = list.indexOf(entry);
    if (at >= 0) list.splice(at, 1);
    item.dirty = true;
    renderInspector();
    renderList();
  });
  actions.appendChild(remove);
  tr.appendChild(actions);

  return tr;
}

/** The value as it should appear inside an input, rather than as prose. */
function editableText(entry) {
  if (typeof entry.value === 'string') return entry.value;
  if (Array.isArray(entry.value)) return entry.value.join(' ');
  if (typeof entry.value === 'number') return String(entry.value);
  return '';
}

function editorFor(item, group, entry) {
  const spec = describeTag(group, entry.tag);

  if (!spec.edit || item.kind === 'avif') {
    const span = document.createElement('span');
    span.className = 'tag-readonly';
    span.textContent = say(formatValue(group, entry));
    return span;
  }

  const commit = (control, raw) => {
    if (setEntryValue(entry, raw, item.exif.littleEndian)) {
      control.classList.remove('bad');
      clearEditError();
      markDirty(item);
    } else if (String(raw).trim() === '') {
      control.classList.add('bad');
      showEditError(phrase('edit.blank', { tag: spec.name }));
    } else {
      control.classList.add('bad');
      // Two sentences rather than one with "text" or "a number" dropped into
      // it: which of the two it is changes the sentence around it in most of
      // these languages.
      showEditError(phrase(spec.edit === 'text' ? 'edit.wanttext' : 'edit.wantnumber',
                           { value: raw, tag: spec.name }));
    }
  };

  if (spec.edit === 'enum') {
    const select = document.createElement('select');
    select.className = 'tag-input';
    const known = Object.entries(spec.values ?? {});
    // A file can hold a value the standard does not define. Offer it as an
    // option rather than silently changing it to whichever one is first.
    if (typeof entry.value === 'number' && !spec.values?.[entry.value]) {
      known.push([String(entry.value), { key: 'value.unknown', values: { value: entry.value } }]);
    }
    for (const [value, label] of known) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = say(label);
      option.selected = Number(value) === entry.value;
      select.appendChild(option);
    }
    select.addEventListener('change', () => commit(select, select.value));
    return select;
  }

  const input = document.createElement('input');
  input.className = 'tag-input';
  input.type = spec.edit === 'int' ? 'number' : 'text';
  input.spellcheck = false;
  input.value = editableText(entry);
  input.addEventListener('change', () => commit(input, input.value));
  return input;
}

/* ------------------------------------------------------------- adding tags */

/**
 * The tags a person can add to a photo that does not have them.
 *
 * Short on purpose. Any tag can be edited or deleted, but offering to add all
 * two hundred would be a list nobody can use, and most of them are meaningless
 * without the camera that wrote them.
 */
const ADDABLE = [
  { group: 'ifd0', tag: 0x010e, type: TYPE.ASCII, hint: 'hint.description' },
  { group: 'ifd0', tag: 0x013b, type: TYPE.ASCII, hint: 'hint.artist' },
  { group: 'ifd0', tag: 0x8298, type: TYPE.ASCII, hint: 'hint.copyright' },
  { group: 'ifd0', tag: 0x0131, type: TYPE.ASCII, hint: 'hint.software' },
  { group: 'ifd0', tag: 0x0132, type: TYPE.ASCII, hint: 'hint.datetime' },
  { group: 'ifd0', tag: 0x010f, type: TYPE.ASCII, hint: 'hint.make' },
  { group: 'ifd0', tag: 0x0110, type: TYPE.ASCII, hint: 'hint.model' },
  { group: 'ifd0', tag: 0x0112, type: TYPE.SHORT, hint: 'hint.orientation' },
  { group: 'exif', tag: 0x9003, type: TYPE.ASCII, hint: 'hint.datetime' },
  { group: 'exif', tag: 0x9286, type: TYPE.UNDEFINED, hint: 'hint.comment' },
  { group: 'exif', tag: 0x8827, type: TYPE.SHORT, hint: 'hint.iso' },
];

function renderAddTag(item) {
  el.addTagSelect.replaceChildren();
  if (item.kind === 'avif') {
    el.addTag.hidden = true;
    return;
  }

  const available = ADDABLE.filter(
    (candidate) => !item.exif.groups[candidate.group].some((e) => e.tag === candidate.tag),
  );

  el.addTag.hidden = available.length === 0;
  if (!available.length) return;

  for (const candidate of available) {
    const option = document.createElement('option');
    option.value = `${candidate.group}:${candidate.tag}`;
    option.textContent = describeTag(candidate.group, candidate.tag).name;
    el.addTagSelect.appendChild(option);
  }
  syncAddTagHint();
}

function syncAddTagHint() {
  const candidate = ADDABLE.find((c) => `${c.group}:${c.tag}` === el.addTagSelect.value);
  el.addTagValue.placeholder = candidate ? phrase(candidate.hint) : '';
}

el.addTagSelect.addEventListener('change', syncAddTagHint);

el.addTagGo.addEventListener('click', () => {
  const item = selected();
  if (!item || item.kind === 'avif') return;

  const candidate = ADDABLE.find((c) => `${c.group}:${c.tag}` === el.addTagSelect.value);
  if (!candidate) return;

  const entry = createEntry(candidate.tag, candidate.type, el.addTagValue.value, item.exif.littleEndian);
  if (!entry) {
    showEditError(phrase('edit.badvalue', { value: el.addTagValue.value }));
    return;
  }

  item.exif.groups[candidate.group].push(entry);
  item.dirty = true;
  el.addTagValue.value = '';
  renderInspector();
  renderList();
  el.addTag.open = true;
});

function markDirty(item) {
  item.dirty = true;
  updateSaveButtons();
  renderFindings(item);
  renderList();
}

function updateSaveButtons() {
  const item = selected();
  el.saveEdits.disabled = !item?.dirty || item.kind === 'avif';
  el.revertEdits.disabled = !item?.dirty || item.kind === 'avif';
  if (item && !item.dirty) el.saveStatus.textContent = '';
}

/* ------------------------------------------------------------ writing files */

/** The plan for "save this photo": whatever the model says now. */
function editPlan(item) {
  const plan = { exif: exifBytes(item.exif) };
  for (const id of ['xmp', 'iptc', 'icc', 'comments', 'extras', 'text']) {
    if (item.drop.has(id)) plan[id] = null;
  }
  if (!item.drop.has('text') && item.textDirty) {
    plan.text = item.textChunks
      .filter((t) => !t.unreadable)
      .map(({ keyword, value }) => ({ keyword, value }));
  }
  return plan;
}

el.stripAll.addEventListener('click', async () => {
  if (cleaning) return;
  cleaning = true;
  const epoch = ++cleanEpoch;
  const keepOrientation = el.keepOrientation.checked;
  const keepIcc = el.keepIcc.checked;
  const results = [];
  const batch = items.filter((item) => item.ok).map((item) => {
    try { return { item, ...prepareCleanCopy(item, { keepOrientation, keepIcc }) }; }
    catch (error) { return { item, error }; }
  });
  render();

  try {
    for (const { item, source, requested, plan, metadata, error: planError } of batch) {
      if (epoch !== cleanEpoch) return;
      try {
        if (planError) throw planError;
        if (item.kind === 'avif') {
          const data = await cleanAvif(item.bytes);
          results.push({ item: source, requested, data, note: phrase('clean.avif') });
        } else if (!metadata) {
          results.push({ item: source, note: phrase('strip.nothing') });
        } else {
          results.push({ item: source, requested, data: serialize(item, plan) });
        }
      } catch (error) {
        results.push({ item, error: phrase(error.message, error.values) });
      }
    }
    if (epoch !== cleanEpoch) return;
    showResults(results);
    const cleaned = results.filter((r) => r.data).length;
    el.stripStatus.textContent = cleaned
      ? phrase(cleaned === 1 ? 'strip.done.one' : 'strip.done.many', { count: cleaned })
      : phrase('strip.none');
  } finally {
    cleaning = false;
    render();
  }
});

function clearResults() {
  resultEpoch += 1;
  for (const url of resultUrls) URL.revokeObjectURL(url);
  resultUrls = [];
  el.resultList.replaceChildren();
  el.cleanResults.hidden = true;
  el.downloadZip.hidden = true;
  el.stripStatus.textContent = '';
}

function showResults(results) {
  clearResults();
  if (!results.length) return;
  const cleaned = results.filter(result => result.data);
  const names = cleanNames(cleaned.map(result => result.item));
  cleaned.forEach((result, index) => { result.outputName = names[index]; });

  el.cleanResults.hidden = false;

  for (const result of results) {
    const li = document.createElement('li');
    li.className = 'result-row';

    const text = document.createElement('div');
    const name = document.createElement('p');
    name.className = 'result-name';
    name.textContent = result.item.name;
    text.appendChild(name);

    const detail = document.createElement('p');
    detail.className = 'result-detail';
    if (result.data) {
      const sizes = {
        before: humanBytes(result.item.size),
        after: humanBytes(result.data.length),
      };
      if (result.item.kind === 'avif') detail.textContent = phrase('result.avif', sizes);
      else {
        detail.textContent = phrase('result.saved', {
          ...sizes, saved: humanBytes(Math.max(0, result.item.size - result.data.length)),
        });
        if (result.note) detail.textContent = `${result.note} · ${detail.textContent}`;
      }
    } else if (result.error) {
      detail.textContent = result.error;
      li.classList.add('result-failed');
    } else {
      detail.textContent = result.note;
    }
    text.appendChild(detail);
    if (result.data) {
      const policy = document.createElement('p');
      policy.className = 'result-policy';
      policy.textContent = result.requested.applies ? phrase('copy.requested', {
        orientation: phrase(result.requested.keepOrientation ? 'copy.on' : 'copy.off'),
        icc: phrase(result.requested.keepIcc ? 'copy.on' : 'copy.off'),
      }) : phrase('copy.avif');
      text.appendChild(policy);
    }
    li.appendChild(text);

    if (result.data) {
      const url = URL.createObjectURL(new Blob([result.data], { type: outputType(result.item.kind).mime }));
      resultUrls.push(url);
      const link = document.createElement('a');
      link.className = 'primary as-button';
      link.href = url;
      link.download = result.outputName;
      link.textContent = phrase('result.download');
      li.appendChild(link);
      li.appendChild(cleanedInspection(result, resultEpoch));
    }

    el.resultList.appendChild(li);
  }

  el.downloadZip.hidden = cleaned.length < 2;
  el.downloadZip.onclick = () => {
    const zip = makeZip(cleaned.map((r) => ({ name: r.outputName, data: r.data })));
    saveBlob(zip, 'photos-without-metadata.zip');
  };
}

/** Reparse this artifact rather than borrowing the original photo's working model. */
function cleanedInspection(result, epoch) {
  const details = document.createElement('details');
  details.className = 'clean-inspection';
  const summary = document.createElement('summary');
  summary.textContent = phrase('copy.inspect');
  summary.setAttribute('aria-label', phrase('copy.inspectname', { name: result.outputName }));
  const content = document.createElement('div');
  content.className = 'copy-inventory';
  const status = document.createElement('p');
  status.className = 'result-detail';
  status.setAttribute('role', 'status');
  details.append(summary, status, content);
  let started = false;
  details.addEventListener('toggle', async () => {
    if (!details.open || started) return;
    started = true;
    status.textContent = phrase('copy.reading');
    const current = () => epoch === resultEpoch && details.isConnected;
    try {
      const copy = await readBytes(result.data);
      if (!current()) return;
      if (!copy.ok) throw new Error(copy.error);
      renderCopyInventory(copy, content);
      status.textContent = '';
    } catch (error) {
      if (current()) status.textContent = phrase('copy.failed', {
        reason: phrase(error.message, error.values),
      });
    }
  });
  return details;
}

function renderCopyInventory(copy, target) {
  const intro = document.createElement('p');
  intro.className = 'copy-scope';
  intro.textContent = phrase('copy.scope');
  target.appendChild(intro);
  const list = document.createElement('dl');
  list.className = 'copy-facts';
  const fact = (label, value) => {
    const row = document.createElement('div');
    const name = document.createElement('dt');
    const detail = document.createElement('dd');
    name.textContent = label;
    detail.textContent = value;
    row.append(name, detail);
    list.appendChild(row);
  };
  fact(phrase('copy.tags'), copy.meta.exif && !copy.exif?.ok
    ? phrase('badge.exifbad') : String(countTags(copy)));
  fact(phrase('copy.profile'), copy.meta.icc
    ? humanBytes(copy.meta.icc.length) : phrase('copy.absent'));
  for (const id of ['xmp', 'iptc']) {
    if (copy.meta[id]) fact(phrase(`block.${id}.title`), humanBytes(copy.meta[id].length));
  }
  for (const id of ['comments', 'text', 'extras']) {
    if (copy.meta[id].length) fact(phrase(`block.${id}.title`), String(copy.meta[id].length));
  }
  if (copy.exif?.thumbnail?.length) {
    fact(phrase('block.thumbnail.title'), humanBytes(copy.exif.thumbnail.length));
  }
  // The tag value belongs to the output model, including a retained rotation.
  for (const group of tagGroups(copy)) {
    for (const entry of group.entries) {
      const spec = describeTag(group.id, entry.tag);
      fact(phrase(spec.name), say(formatValue(group.id, entry)));
    }
  }
  target.appendChild(list);
  if (!hasMetadata(copy)) {
    const empty = document.createElement('p');
    empty.className = 'result-detail';
    empty.textContent = phrase('copy.none');
    target.appendChild(empty);
  }
  for (const note of copy.meta.notes) {
    const text = document.createElement('p');
    text.className = 'result-detail';
    text.textContent = phrase('copy.note', {
      label: phrase(note.label), detail: phrase(note.detail),
    });
    target.appendChild(text);
  }
}

el.saveEdits.addEventListener('click', () => {
  const item = selected();
  if (!item || item.kind === 'avif') return;

  try {
    const data = serialize(item, editPlan(item));
    saveBlob(new Blob([data], { type: outputType(item.kind).mime }), outName(item, 'edited'));
    el.saveStatus.textContent = phrase('edit.saved', { name: outName(item, 'edited'), size: humanBytes(data.length) });
    clearEditError();
  } catch (error) {
    showEditError(phrase(error.message, error.values));
  }
});

el.revertEdits.addEventListener('click', async () => {
  const item = selected();
  if (!item || item.kind === 'avif') return;

  // Re-read the original bytes rather than un-picking the edits one at a time.
  // The pixel size is carried across because it came from decoding the picture,
  // which parsing the container does not do.
  const canvas = item.doc?.canvas ?? null;
  const fresh = await readBytes(item.bytes);
  Object.assign(item, fresh);
  normalizeExif(item);
  if (item.doc && canvas) item.doc.canvas = canvas;
  item.drop = new Set();
  item.textChunks = item.meta.text.map((t) => ({
    keyword: t.keyword,
    value: t.value ?? '',
    unreadable: Boolean(t.unreadable),
  }));
  item.textDirty = false;
  item.dirty = false;
  render();
  // After render, because updating the buttons clears this line - which is the
  // right thing to do everywhere except here.
  el.saveStatus.textContent = phrase('save.reverted');
});

/* ------------------------------------------------------------------ errors */

function showEditError(message) {
  el.editError.textContent = message;
  el.editError.hidden = false;
}

function clearEditError() {
  el.editError.textContent = '';
  el.editError.hidden = true;
}

/* ------------------------------------------------- privacy panel + offline */

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

render();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
