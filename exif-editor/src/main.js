/** UI wiring and application state. */

import { readImage, readBytes, serialize, exifBytes, outputType, KIND_NAMES } from './container.js';
import { serializeExif, setEntryValue, createEntry, TYPE } from './tiff.js';
import { describeTag } from './tags.js';
import {
  formatValue, readPosition, buildFindings, badges, bytes as humanBytes,
  countTags, metadataSize, hasMetadata, tagGroups,
} from './report.js';
import { makeZip } from './zip.js';

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
  networkCount: $('network-count'),
  networkDot: $('network-dot'),
  offlineStatus: $('offline-status'),
  offlineDot: $('offline-dot'),
};

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

/** Object URLs handed to download links, revoked when the results are replaced. */
let resultUrls = [];

/* ------------------------------------------------------------------ adding */

const dropzoneTitle = el.dropzone.querySelector('.dropzone-title');

async function addFiles(files) {
  if (!files?.length) return;

  el.dropzone.classList.add('busy');
  dropzoneTitle.textContent = `Reading ${files.length} file${files.length === 1 ? '' : 's'}...`;

  const failures = [];

  try {
    for (const file of files) {
      let item;
      try {
        item = await readImage(file);
      } catch (error) {
        failures.push(`${file.name}: ${error.message}`);
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
      const dims = await measure(item.thumbUrl);
      if (dims && item.doc) item.doc.canvas = dims;

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
          where: position ? `${position.text}.` : 'Location tags without a full position.',
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
      if (!item.ok) failures.push(`${file.name}: ${item.error}`);
    }
  } finally {
    el.dropzone.classList.remove('busy');
    dropzoneTitle.textContent = 'Drop photos here';
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

/** Read a picture's pixel size without keeping the decoded image around. */
function measure(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

// No click handler here on purpose: the drop zone is a <label for="file-input">,
// so the browser opens the picker itself.

el.fileInput.addEventListener('change', () => {
  const picked = Array.from(el.fileInput.files);
  el.fileInput.value = ''; // lets the same file be picked twice in a row
  addFiles(picked);
});

for (const type of ['dragenter', 'dragover']) {
  el.dropzone.addEventListener(type, (event) => {
    event.preventDefault();
    el.dropzone.classList.add('dragover');
  });
}

for (const type of ['dragleave', 'drop']) {
  el.dropzone.addEventListener(type, () => el.dropzone.classList.remove('dragover'));
}

el.dropzone.addEventListener('drop', (event) => {
  event.preventDefault();
  addFiles(event.dataTransfer?.files);
});

function removeItem(id) {
  const at = items.findIndex((i) => i.id === id);
  if (at < 0) return;
  URL.revokeObjectURL(items[at].thumbUrl);
  items.splice(at, 1);
  if (selectedId === id) selectedId = items.find((i) => i.ok)?.id ?? null;
  render();
}

el.clearAll.addEventListener('click', () => {
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
    ? `${items.length} photo${items.length === 1 ? '' : 's'}`
    : '';

  renderList();
  el.stripAll.disabled = !items.some((i) => i.ok);
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
      ? `${KIND_NAMES[item.kind]} · ${humanBytes(item.size)} · about ${humanBytes(metadataSize(item))} of metadata`
      : item.error;
    main.appendChild(sub);

    if (item.ok) {
      const row = document.createElement('span');
      row.className = 'badges';
      for (const badge of badges(item)) {
        const span = document.createElement('span');
        span.className = `badge badge-${badge.level}`;
        span.textContent = badge.label;
        row.appendChild(span);
      }
      main.appendChild(row);
    }

    pick.appendChild(main);
    li.appendChild(pick);

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'row-remove';
    remove.title = `Take ${item.name} off the list`;
    remove.setAttribute('aria-label', `Take ${item.name} off the list`);
    remove.textContent = '×';
    remove.addEventListener('click', () => removeItem(item.id));
    li.appendChild(remove);

    el.fileList.appendChild(li);
  }
}

/** State the exact bargain the "remove all" button is offering, in one line. */
function renderKeepSummary() {
  const kept = [];
  if (el.keepOrientation.checked) kept.push('the orientation tag');
  if (el.keepIcc.checked) kept.push('the colour profile');

  el.keepSummary.textContent = kept.length
    ? `Everything else goes: EXIF, GPS, the maker note, XMP, IPTC, comments, the embedded thumbnail, and any block this tool could not identify. Kept: ${kept.join(' and ')}.`
    : 'Absolutely everything goes, including the orientation tag and the colour profile. The file will carry no metadata of any kind.';
}

el.keepOrientation.addEventListener('change', renderKeepSummary);
el.keepIcc.addEventListener('change', renderKeepSummary);

/* --------------------------------------------------------------- inspector */

const selected = () => items.find((i) => i.id === selectedId && i.ok) ?? null;

function renderInspector() {
  const item = selected();
  el.inspector.hidden = !item;
  el.inspectEmpty.hidden = Boolean(item);
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
    size ? `${size.width} × ${size.height}` : null,
    humanBytes(item.size),
    hasMetadata(item) ? `about ${humanBytes(metadataSize(item))} of it metadata` : 'no metadata found',
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
  const findings = buildFindings(item);

  if (!findings.length) {
    const li = document.createElement('li');
    li.className = 'finding finding-clean';
    const title = document.createElement('p');
    title.className = 'finding-title';
    title.textContent = 'Nothing in this file gives anything away';
    const detail = document.createElement('p');
    detail.className = 'finding-detail';
    detail.textContent = item.dirty
      ? 'Everything that did has been removed. Save the photo to write it out.'
      : 'No location, no timestamps, no camera, no names. Either it never had any, or something has already stripped it.';
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
      title: 'An EXIF block that would not parse',
      detail: `${humanBytes(meta.exif.length)}, and this tool could not read it: ${item.exifError} Saving rewrites the EXIF block from what is listed below, so an unreadable one cannot be carried across - it goes whichever button you press.`,
      gone: true,
      pill: 'Cannot be kept',
    });
  }

  if (item.had.exif) {
    list.push({
      title: 'EXIF tags',
      detail: `${countTags(item)} tags across the camera, image and location directories.`,
      gone: countTags(item) === 0,
      label: 'Remove every tag',
      remove: clearGroups,
    });
  }

  if (item.had.gps) {
    list.push({
      title: 'GPS location',
      detail: item.had.where,
      gone: groups.gps.length === 0,
      label: 'Remove the location',
      remove: () => { groups.gps = []; },
    });
  }

  if (item.had.thumbnail) {
    list.push({
      title: 'Embedded thumbnail',
      detail: 'A small second copy of the picture, which may predate any cropping.',
      gone: !item.exif.thumbnail,
      label: 'Remove the thumbnail',
      remove: () => { item.exif.thumbnail = null; },
    });
  }

  const containerBlocks = [
    ['xmp', 'XMP packet', meta.xmp !== null && meta.xmp !== undefined,
      () => `${humanBytes(meta.xmp.length)} of XML: usually the camera again, plus the edit history.`],
    ['iptc', 'IPTC block', Boolean(meta.iptc),
      () => `${humanBytes(meta.iptc.length)} of caption, byline and credit fields.`],
    ['text', 'Text chunks', meta.text.length > 0,
      () => `${meta.text.length} key/value pair${meta.text.length === 1 ? '' : 's'}: ${meta.text.map((t) => t.keyword).join(', ')}.`],
    ['comments', 'Comments', meta.comments.length > 0,
      () => `${meta.comments.length} comment${meta.comments.length === 1 ? '' : 's'} stored beside the picture.`],
    ['extras', 'Blocks this tool cannot read', meta.extras.length > 0,
      () => `${meta.extras.map((x) => `${x.label} (${humanBytes(x.size)})`).join(', ')}. Removable without being readable.`],
    ['icc', 'Colour profile', Boolean(meta.icc),
      () => `${humanBytes(meta.icc.length)}${meta.iccName ? ` named "${meta.iccName}"` : ''}. Says nothing about you; removing it can shift the colours.`],
  ];

  for (const [id, title, present, detail] of containerBlocks) {
    if (!present) continue;
    list.push({
      title,
      detail: detail(),
      gone: item.drop.has(id),
      label: 'Remove',
      remove: () => item.drop.add(id),
    });
  }

  return list;
}

function renderBlocks(item) {
  el.blockList.replaceChildren();
  const blocks = blockDescriptors(item);

  if (!blocks.length && !item.meta.notes.length) {
    const li = document.createElement('li');
    li.className = 'block block-none';
    li.textContent = 'This file has no metadata blocks in it at all.';
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
      pill.textContent = block.pill ?? 'Removed';
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
    title.textContent = note.label;
    const detail = document.createElement('p');
    detail.className = 'block-detail';
    detail.textContent = note.detail;
    text.append(title, detail);
    li.appendChild(text);
    const pill = document.createElement('span');
    pill.className = 'block-kept-pill';
    pill.textContent = 'Kept';
    li.appendChild(pill);
    el.blockList.appendChild(li);
  }
}

/* -------------------------------------------------------------- tag tables */

function renderTags(item) {
  el.tagGroups.replaceChildren();
  const groups = tagGroups(item);

  el.tagsNote.textContent = groups.length
    ? 'Change a value and it is written back when you save. Tags with no editor can still be removed - deleting a value never needs to understand it.'
    : 'There are no EXIF tags in this photo.';

  if (item.textChunks?.length && !item.drop.has('text')) el.tagGroups.appendChild(textChunkGroup(item));

  for (const group of groups) {
    const section = document.createElement('section');
    section.className = 'tag-group';

    const heading = document.createElement('h4');
    heading.textContent = group.title;
    const count = document.createElement('span');
    count.className = 'group-count';
    count.textContent = `${group.entries.length} tag${group.entries.length === 1 ? '' : 's'}`;
    heading.appendChild(count);
    section.appendChild(heading);

    const note = document.createElement('p');
    note.className = 'group-note';
    note.textContent = group.note;
    section.appendChild(note);

    const scroll = document.createElement('div');
    scroll.className = 'table-scroll';
    const table = document.createElement('table');
    table.className = 'tag-table';

    const head = document.createElement('thead');
    const headRow = document.createElement('tr');
    for (const label of ['Tag', 'Value', '']) {
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
  heading.textContent = 'Text chunks';
  const count = document.createElement('span');
  count.className = 'group-count';
  count.textContent = `${item.textChunks.length} pair${item.textChunks.length === 1 ? '' : 's'}`;
  heading.appendChild(count);
  section.appendChild(heading);

  const frozen = item.textChunks.some((t) => t.unreadable);

  const note = document.createElement('p');
  note.className = 'group-note';
  note.textContent = frozen
    ? 'This file has a compressed text chunk that would not unpack. Editing the set would drop it, so the set is read-only here - it can still be removed as a block.'
    : 'PNG stores these instead of EXIF tags. Editing any of them rewrites the set.';
  section.appendChild(note);

  const scroll = document.createElement('div');
  scroll.className = 'table-scroll';
  const table = document.createElement('table');
  table.className = 'tag-table';

  const head = document.createElement('thead');
  const headRow = document.createElement('tr');
  for (const label of ['Keyword', 'Value', '']) {
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
      key.setAttribute('aria-label', `Keyword for ${chunk.keyword}`);
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
      span.textContent = 'compressed, and it would not unpack';
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
      input.setAttribute('aria-label', `Value for ${chunk.keyword}`);
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
      remove.textContent = 'Remove';
      remove.setAttribute('aria-label', `Remove the ${chunk.keyword} text chunk`);
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
    dot.textContent = spec.risk === 'high' ? 'identifying' : 'revealing';
    if (spec.note) dot.title = spec.note;
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
  remove.textContent = 'Remove';
  remove.setAttribute('aria-label', `Remove ${spec.name}`);
  remove.addEventListener('click', () => {
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

  if (!spec.edit) {
    const span = document.createElement('span');
    span.className = 'tag-readonly';
    span.textContent = formatValue(group, entry);
    return span;
  }

  const commit = (control, raw) => {
    if (setEntryValue(entry, raw, item.exif.littleEndian)) {
      control.classList.remove('bad');
      clearEditError();
      markDirty(item);
    } else if (String(raw).trim() === '') {
      control.classList.add('bad');
      showEditError(`${spec.name} cannot be left blank. Use the Remove button beside it if you want the tag gone altogether.`);
    } else {
      control.classList.add('bad');
      showEditError(`"${raw}" is not a value this tag can hold. ${spec.name} expects ${spec.edit === 'text' ? 'text' : 'a number'}.`);
    }
  };

  if (spec.edit === 'enum') {
    const select = document.createElement('select');
    select.className = 'tag-input';
    const known = Object.entries(spec.values ?? {});
    // A file can hold a value the standard does not define. Offer it as an
    // option rather than silently changing it to whichever one is first.
    if (typeof entry.value === 'number' && !spec.values?.[entry.value]) {
      known.push([String(entry.value), `Unrecognised value (${entry.value})`]);
    }
    for (const [value, label] of known) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
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
  { group: 'ifd0', tag: 0x010e, type: TYPE.ASCII, hint: 'A sentence describing the picture' },
  { group: 'ifd0', tag: 0x013b, type: TYPE.ASCII, hint: 'Who took it' },
  { group: 'ifd0', tag: 0x8298, type: TYPE.ASCII, hint: 'e.g. (c) 2026 Your Name' },
  { group: 'ifd0', tag: 0x0131, type: TYPE.ASCII, hint: 'What produced the file' },
  { group: 'ifd0', tag: 0x0132, type: TYPE.ASCII, hint: '2026:08:19 14:30:00' },
  { group: 'ifd0', tag: 0x010f, type: TYPE.ASCII, hint: 'e.g. Canon' },
  { group: 'ifd0', tag: 0x0110, type: TYPE.ASCII, hint: 'e.g. EOS R6' },
  { group: 'ifd0', tag: 0x0112, type: TYPE.SHORT, hint: '1 is the right way up; 6 is rotated 90 degrees' },
  { group: 'exif', tag: 0x9003, type: TYPE.ASCII, hint: '2026:08:19 14:30:00' },
  { group: 'exif', tag: 0x9286, type: TYPE.UNDEFINED, hint: 'Free text' },
  { group: 'exif', tag: 0x8827, type: TYPE.SHORT, hint: 'e.g. 400' },
];

function renderAddTag(item) {
  el.addTagSelect.replaceChildren();

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
  el.addTagValue.placeholder = candidate?.hint ?? '';
}

el.addTagSelect.addEventListener('change', syncAddTagHint);

el.addTagGo.addEventListener('click', () => {
  const item = selected();
  if (!item) return;

  const candidate = ADDABLE.find((c) => `${c.group}:${c.tag}` === el.addTagSelect.value);
  if (!candidate) return;

  const entry = createEntry(candidate.tag, candidate.type, el.addTagValue.value, item.exif.littleEndian);
  if (!entry) {
    showEditError(`"${el.addTagValue.value}" is not a value that tag can hold.`);
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
  el.saveEdits.disabled = !item?.dirty;
  el.revertEdits.disabled = !item?.dirty;
  if (item && !item.dirty) el.saveStatus.textContent = '';
}

/* ------------------------------------------------------------ writing files */

/** What the saved file should be called. */
function outName(item, suffix) {
  const { ext } = outputType(item.kind);
  const base = item.name.replace(/\.[^.]+$/, '') || 'photo';
  return `${base}-${suffix}.${ext}`;
}

/**
 * The plan for "remove everything".
 *
 * Every key is null, which is the plan language for "take it out". The only
 * thing that can put anything back is the orientation option, and it does so by
 * writing a fresh EXIF block holding that one tag - not by keeping the original
 * block and deleting the rest of it, which would leave whatever this tool had
 * failed to parse still sitting in the file.
 */
function stripPlan(item, keepOrientation, keepIcc) {
  const plan = { exif: null, xmp: null, iptc: null, comments: null, extras: null, text: null };
  if (!keepIcc) plan.icc = null;

  if (keepOrientation && item.exif?.ok) {
    const orientation = item.exif.groups.ifd0.find((e) => e.tag === 0x0112);
    // A photo that is already the right way up does not need the tag, and not
    // writing it is the difference between "almost empty" and empty.
    if (orientation && orientation.value !== 1) {
      plan.exif = serializeExif({
        littleEndian: item.exif.littleEndian,
        groups: { ifd0: [orientation], exif: [], gps: [], interop: [], ifd1: [] },
        thumbnail: null,
      });
    }
  }

  return plan;
}

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

el.stripAll.addEventListener('click', () => {
  const keepOrientation = el.keepOrientation.checked;
  const keepIcc = el.keepIcc.checked;
  const results = [];

  for (const item of items) {
    if (!item.ok) continue;
    try {
      if (!hasMetadata(item)) {
        results.push({ item, note: 'Nothing to remove - this file had no metadata in it.' });
        continue;
      }
      results.push({ item, data: serialize(item, stripPlan(item, keepOrientation, keepIcc)) });
    } catch (error) {
      results.push({ item, error: error.message });
    }
  }

  showResults(results);
  const cleaned = results.filter((r) => r.data).length;
  el.stripStatus.textContent = cleaned
    ? `${cleaned} photo${cleaned === 1 ? '' : 's'} cleaned. Nothing left this machine.`
    : 'Nothing needed removing.';
});

function clearResults() {
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
      const saved = result.item.size - result.data.length;
      detail.textContent = `${humanBytes(result.item.size)} to ${humanBytes(result.data.length)} - ${humanBytes(Math.max(0, saved))} of metadata gone. The picture itself is unchanged.`;
    } else if (result.error) {
      detail.textContent = result.error;
      li.classList.add('result-failed');
    } else {
      detail.textContent = result.note;
    }
    text.appendChild(detail);
    li.appendChild(text);

    if (result.data) {
      const url = URL.createObjectURL(new Blob([result.data], { type: outputType(result.item.kind).mime }));
      resultUrls.push(url);
      const link = document.createElement('a');
      link.className = 'primary as-button';
      link.href = url;
      link.download = outName(result.item, 'clean');
      link.textContent = 'Download';
      li.appendChild(link);
    }

    el.resultList.appendChild(li);
  }

  const cleaned = results.filter((r) => r.data);
  el.downloadZip.hidden = cleaned.length < 2;
  el.downloadZip.onclick = () => {
    const zip = makeZip(cleaned.map((r) => ({ name: outName(r.item, 'clean'), data: r.data })));
    saveBlob(zip, 'photos-without-metadata.zip');
  };
}

/** Hand a blob to the browser's downloads. */
function saveBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  // Revoked late: revoking immediately can cancel a download that has not
  // started yet in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

el.saveEdits.addEventListener('click', () => {
  const item = selected();
  if (!item) return;

  try {
    const data = serialize(item, editPlan(item));
    saveBlob(new Blob([data], { type: outputType(item.kind).mime }), outName(item, 'edited'));
    el.saveStatus.textContent = `Saved as ${outName(item, 'edited')} - ${humanBytes(data.length)}.`;
    clearEditError();
  } catch (error) {
    showEditError(error.message);
  }
});

el.revertEdits.addEventListener('click', async () => {
  const item = selected();
  if (!item) return;

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
  el.saveStatus.textContent = 'Back to the file as it was read.';
});

/* ------------------------------------------------------------------ errors */

function showLoadError(message) {
  el.loadError.textContent = message;
  el.loadError.hidden = false;
}

function clearLoadError() {
  el.loadError.textContent = '';
  el.loadError.hidden = true;
}

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

// Hosts belonging to the ad, measurement and donate-button scripts. This tool
// has no network feature of its own, so unlike Images to Video there is no
// legitimate third bucket here: anything that is not this origin and not on
// this list would be a request nobody asked for, and the panel says so in
// those words.
// cloudflareinsights.com is included because the host injects its own beacon.
// The CSP blocks it from running, but a blocked script still leaves a resource
// timing entry, and reporting that as an unexplained request would be alarming
// and wrong. Anything the page can pull in without the user asking belongs here.
// google.com is written as a pattern because Google's measurement pixel uses
// the visitor's own country domain - www.google.ca, www.google.co.uk - and a
// list of literal hostnames turns the panel red for a visitor in the wrong
// country. That is the worst possible failure for this particular panel: the
// one place on the page meant to be checkable, saying something untrue.
// buymeacoffee.com and googleapis.com are here for the donate button in the
// header: the button's script comes from cdnjs.buymeacoffee.com and it pulls
// its lettering from fonts.googleapis.com and fonts.gstatic.com. Like the ad
// scripts, it is something the page loads without the visitor asking, and it
// is handed nothing - so it belongs in this bucket rather than being reported
// as an intruder.
const PLATFORM_HOSTS = /(^|\.)(googlesyndication\.com|doubleclick\.net|googleadservices\.com|googletagservices\.com|adtrafficquality\.google|googletagmanager\.com|google-analytics\.com|gstatic\.com|googleapis\.com|buymeacoffee\.com|cloudflareinsights\.com|google\.[a-z]{2,3}(\.[a-z]{2})?)$/;

/**
 * Report what this page has actually fetched.
 *
 * The claim on trial is not "this page is silent" - it is not silent, it
 * carries ads - but "nothing has carried your photos away". That is the part
 * that matters, and the part a sceptical visitor can watch hold in real time.
 */
function monitorNetwork() {
  const platform = new Set();
  const unexplained = new Set();

  const inspect = (entries) => {
    for (const entry of entries) {
      if (entry.name.startsWith('blob:') || entry.name.startsWith('data:')) continue;
      const url = new URL(entry.name, location.href);
      if (url.origin === location.origin) continue;
      if (PLATFORM_HOSTS.test(url.hostname)) platform.add(url.hostname);
      else unexplained.add(url.hostname);
    }

    const total = performance.getEntriesByType('resource')
      .filter((e) => !e.name.startsWith('blob:') && !e.name.startsWith('data:')).length;

    const clean = unexplained.size === 0;
    const platformNote = platform.size === 0
      ? ''
      : ` The page's own ad, measurement and donate-button scripts loaded from ${platform.size} host${platform.size === 1 ? '' : 's'}; not one of them was given a file or a tag.`;

    el.networkCount.textContent = clean
      ? `your photos have gone nowhere. ${total} files loaded, all of them this page's own.${platformNote}`
      : `something contacted ${[...unexplained].join(', ')}, which this tool never does. Treat that as worth investigating.${platformNote}`;

    el.networkCount.className = clean ? 'good' : 'warn';
    el.networkDot.className = `live-dot ${clean ? 'good' : 'warn'}`;
  };

  inspect(performance.getEntriesByType('resource'));
  try {
    new PerformanceObserver((list) => inspect(list.getEntries())).observe({ type: 'resource', buffered: true });
  } catch {
    // PerformanceObserver is unavailable; the one-time snapshot above still stands.
  }
}

async function registerServiceWorker() {
  // Keep the visible text short: this sits in the trust panel, and a raw
  // browser error dumped there reads worse than it is. Detail goes in the
  // tooltip and the console for anyone debugging.
  const fail = (message, detail) => {
    el.offlineStatus.textContent = message;
    el.offlineDot.className = 'live-dot';
    if (detail) {
      el.offlineStatus.title = detail;
      console.info('Offline caching unavailable:', detail);
    }
  };

  if (!('serviceWorker' in navigator)) {
    fail('not available in this browser (everything else still works).');
    return;
  }
  // Service workers need a secure context, so file:// and plain http:// are out.
  if (!window.isSecureContext) {
    fail('needs https:// or localhost to cache for offline use.');
    return;
  }

  try {
    await navigator.serviceWorker.register('sw.js');
    await navigator.serviceWorker.ready;
    el.offlineStatus.textContent = 'ready - disconnect from the internet and this still works.';
    el.offlineStatus.className = 'good';
    el.offlineDot.className = 'live-dot good';
  } catch (error) {
    // Caching is an optimisation, not the privacy guarantee. Everything the
    // page claims still holds when this fails, so say so rather than alarming.
    fail('caching unavailable here, but nothing is uploaded either way.', error.message);
  }
}

/* -------------------------------------------------------------------- boot */

// An error thrown after boot would otherwise only reach the console, leaving
// the page looking functional but doing nothing.
window.addEventListener('error', (event) => {
  showLoadError(`Something broke: ${event.message}. Reload the page to start over.`);
});
window.addEventListener('unhandledrejection', (event) => {
  showLoadError(`Something broke: ${event.reason?.message ?? event.reason}. Reload the page to start over.`);
});

render();
monitorNetwork();
registerServiceWorker();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
