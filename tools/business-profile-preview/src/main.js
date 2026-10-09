/**
 * The page: the form on one side, the drawing on the other, and nothing in
 * between that could reach the network.
 *
 * WHAT THIS FILE OWNS
 *
 * The DOM, and only the DOM. Every decision about what a listing looks like is
 * in surfaces.js, every decision about what a profile means is in profile.js
 * and view.js, and every word is in body.html. What is left here is reading
 * the boxes, handing the result on, and putting the answer back - which is why
 * this is the one module in the tool with no arithmetic in it worth a test.
 *
 * WHY THE FORM IS THE STATE
 *
 * There is no model held alongside the inputs: `read()` builds a profile out
 * of the page every time something changes, and the importers write back into
 * the boxes rather than into a variable. A second copy of the truth is a
 * second thing to keep in step, and the failure it produces - a preview that
 * disagrees with a field somebody is looking straight at - is the one failure
 * this page cannot afford.
 */

import { saveBlob } from './shared/download.js';
import { phrase } from './shared/phrases.js';
import { textImport } from './shared/text-import.js';
import { readPhoto } from './photo.js';
import { parseListing } from './parse-listing.js';
import { DAY_KEYS, FORM_DAYS, empty, normalise } from './profile.js';
import { FONT } from './render.js';
import { toPng, svgBlob } from './raster.js';
import { EXAMPLE, coverPhoto } from './samples.js';
import { fromJson, toJson } from './saved.js';
import { SURFACES } from './surfaces.js';
import { describe } from './view.js';
import { localDateValue, previewDate } from './preview-time.js';

const el = (id) => document.getElementById(id);

const ui = {
  paste: el('paste'), readPaste: el('read-paste'), openJson: el('open-json'),
  jsonFile: el('json-file'), importNote: el('import-note'), importError: el('import-error'),
  name: el('name'), nameNote: el('name-note'), category: el('category'),
  rating: el('rating'), reviews: el('reviews'), price: el('price'),
  description: el('description'), descriptionNote: el('description-note'),
  attributes: el('attributes'),
  pickPhoto: el('pick-photo'), dropPhoto: el('drop-photo'), photoFile: el('photo-file'),
  photoNote: el('photo-note'), sample: el('sample'), clear: el('clear'),
  address: el('address'), serviceArea: el('service-area'),
  phone: el('phone'), website: el('website'),
  status: el('status'), clock: el('clock'), week: el('week'), weekNote: el('week-note'),
  previewFixed: el('preview-fixed'), previewAt: el('preview-at'),
  previewTimeError: el('preview-time-error'),
  copyMonday: el('copy-monday'), weekdaysOnly: el('weekdays-only'),
  privacyToggle: el('privacy-toggle'), privacyPanel: el('privacy-panel'),
  stage: el('stage'), stageNote: el('stage-note'), scale: el('scale'),
  savePng: el('save-png'), saveSvg: el('save-svg'), saveJson: el('save-json'),
  saveNote: el('save-note'), saveError: el('save-error'),
};

/* ------------------------------------------------------------- measuring text */

// One canvas for the whole page. Not a pixel is ever drawn on it: it exists so
// that surfaces.js can ask the browser how wide a name is before deciding
// where the name has to break.
const gauge = document.createElement('canvas').getContext('2d');

function measure(value, size, weight = 400) {
  gauge.font = `${weight} ${size}px ${FONT}`;
  return gauge.measureText(String(value)).width;
}

/* ------------------------------------------------------------------ the words */

/**
 * Every phrase this body defines, resolved once rather than per redraw.
 *
 * Read off the markup rather than from a list written out here, and that is
 * the point: a list is a second place to remember, and the first key added to
 * body.html without it went to the search result as the literal text
 * `label.reviewsshort`. The block is the declaration; this just reads it.
 */
const labels = Object.fromEntries(
  [...document.querySelectorAll('#phrases [data-phrase]')]
    .map((node) => [node.dataset.phrase, phrase(node.dataset.phrase)]));

const longDays = DAY_KEYS.map((day) => labels[`day.long.${day}`]);

/* --------------------------------------------------------------- the week rows */

/**
 * Seven rows of controls, built here rather than written out in the markup.
 *
 * Twenty-one controls hand-written would be twenty-one to keep in step across
 * fifteen translated copies of this body; built from the day names, they follow
 * whatever those say. The names themselves are phrases, so they are still
 * translated - it is the scaffolding that is not repeated.
 */
function buildWeek() {
  const closedWord = phrase('status.closed');
  for (const day of FORM_DAYS) {
    const row = document.createElement('div');
    row.className = 'week-row';
    row.dataset.day = String(day);

    const name = document.createElement('span');
    name.className = 'week-day';
    name.textContent = longDays[day];

    const shutLabel = document.createElement('label');
    shutLabel.className = 'check week-shut';
    const shut = document.createElement('input');
    shut.type = 'checkbox';
    shut.className = 'day-shut';
    shut.setAttribute('aria-label', phrase('week.shut', { day: longDays[day] }));
    const shutText = document.createElement('span');
    shutText.textContent = closedWord;
    shutLabel.append(shut, shutText);

    const from = document.createElement('input');
    from.type = 'time';
    from.className = 'day-open';
    // `defaultValue`, not `value`. shared/lang-keep.js carries across a
    // language switch every control inside <main> whose value differs from the
    // one written in the markup, and a value set as a PROPERTY leaves the
    // default empty - so fourteen untouched time boxes read as fourteen
    // settings somebody had changed, and the switcher stopped being the plain
    // link it is built as on a page nobody has touched. Setting the default on
    // an input that has never been dirtied shows the same time.
    from.defaultValue = '09:00';
    from.setAttribute('aria-label', phrase('week.open', { day: longDays[day] }));

    const dash = document.createElement('span');
    dash.className = 'week-dash';
    dash.textContent = '–';
    dash.setAttribute('aria-hidden', 'true');

    const to = document.createElement('input');
    to.type = 'time';
    to.className = 'day-close';
    to.defaultValue = '17:00';
    to.setAttribute('aria-label', phrase('week.close', { day: longDays[day] }));

    row.append(name, shutLabel, from, dash, to);
    ui.week.append(row);
  }
}

/** The seven rows, in `getDay()` order rather than the order they are shown. */
function weekRows() {
  const rows = new Array(7);
  for (const row of ui.week.querySelectorAll('.week-row')) rows[Number(row.dataset.day)] = row;
  return rows;
}

/* ------------------------------------------------------- the form, both ways */

/** The profile as the boxes currently have it. */
function read() {
  return normalise({
    name: ui.name.value,
    category: ui.category.value,
    price: ui.price.value,
    rating: ui.rating.value,
    reviews: ui.reviews.value,
    address: ui.address.value,
    serviceArea: ui.serviceArea.checked,
    phone: ui.phone.value,
    website: ui.website.value,
    description: ui.description.value,
    attributes: ui.attributes.value,
    status: ui.status.value,
    clock: ui.clock.value,
    hours: weekRows().map((row) => ({
      closed: row.querySelector('.day-shut').checked,
      open: row.querySelector('.day-open').value,
      close: row.querySelector('.day-close').value,
    })),
    photo,
  });
}

/** A profile into the boxes. The photo is held apart; nothing else is. */
function write(profile) {
  ui.name.value = profile.name;
  ui.category.value = profile.category;
  ui.price.value = profile.price;
  ui.rating.value = profile.rating;
  ui.reviews.value = profile.reviews;
  ui.address.value = profile.address;
  ui.serviceArea.checked = profile.serviceArea;
  ui.phone.value = profile.phone;
  ui.website.value = profile.website;
  ui.description.value = profile.description;
  ui.attributes.value = profile.attributes;
  ui.status.value = profile.status;
  ui.clock.value = profile.clock;

  weekRows().forEach((row, day) => {
    const entry = profile.hours[day];
    row.querySelector('.day-shut').checked = entry.closed;
    row.querySelector('.day-open').value = entry.open;
    row.querySelector('.day-close').value = entry.close;
  });
  if (profile.photo) setPhoto(profile.photo);
}

/* ------------------------------------------------------------------ the photo */

// Held outside the form because a file input cannot be given a value, and the
// picture is the one field a visitor cannot type back in.
let photo = null;
let photoRead = null;

function retirePhoto() {
  photoRead?.abort();
  photoRead = null;
}

function setPhoto(dataUri, note = '') {
  photo = dataUri;
  ui.dropPhoto.hidden = !dataUri;
  say(ui.photoNote, note);
}

/** The name a download takes, out of the business name. */
function stem(value = read().name) {
  const name = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return name || 'business-profile';
}

/* ------------------------------------------------------------------ the stage */

let drawn = null;
let pending = 0;
let pngWrite = null;

function syncDownloads() {
  ui.savePng.disabled = !drawn || !!pngWrite;
  ui.saveSvg.disabled = !drawn;
}

function retirePng() {
  pngWrite?.abort();
  pngWrite = null;
  syncDownloads();
  say(ui.saveNote, '');
  say(ui.saveError, '');
}

/** The surface currently being looked at. */
function chosen() {
  const pressed = document.querySelector('.chip[aria-pressed="true"]');
  return pressed?.dataset.surface ?? 'panel';
}

/** Redraw, at most once a frame however fast somebody types. */
function schedule() {
  if (pending) return;
  pending = requestAnimationFrame(() => { pending = 0; draw(); });
}

function draw() {
  if (pending) { cancelAnimationFrame(pending); pending = 0; }
  const date = ui.previewFixed.checked ? previewDate(ui.previewAt.value) : new Date();
  const invalid = !date;
  ui.previewAt.setAttribute('aria-invalid', String(invalid));
  say(ui.previewTimeError, invalid ? phrase('preview.invalid') : '');
  if (invalid) {
    drawn = null;
    ui.stage.replaceChildren();
    ui.stageNote.textContent = '';
    ui.weekNote.textContent = '';
    syncDownloads();
    return;
  }
  const profile = read();
  const view = describe(profile, labels, date);
  const surface = chosen();
  drawn = SURFACES[surface](view, measure);

  ui.stage.innerHTML = drawn.svg;
  const picture = ui.stage.firstElementChild;
  if (picture) {
    picture.setAttribute('aria-label', phrase('stage.alt', {
      name: view.name,
      status: [view.status.lead, view.status.tail].filter(Boolean).join(', '),
      reviews: view.reviewsText,
    }));
  }

  ui.stageNote.textContent = phrase(`stage.${surface}`, {
    width: drawn.width, height: drawn.height,
  });
  ui.nameNote.textContent = profile.name
    ? phrase('name.length', { count: profile.name.length }) : '';
  ui.descriptionNote.textContent = profile.description
    ? phrase('description.length', { count: profile.description.length }) : '';
  ui.weekNote.textContent = phrase(ui.previewFixed.checked ? 'week.chosen' : 'week.reads', {
    date: new Intl.DateTimeFormat(document.documentElement.lang, {
      dateStyle: 'medium', timeStyle: 'short',
    }).format(date),
    status: [view.status.lead, view.status.tail].filter(Boolean).join(' · '),
  });
  syncDownloads();
}

// Status is the one field that can change without an edit. Background tabs may
// defer their timers, so returning to the page also refreshes the local clock.
function followClock() {
  setTimeout(() => {
    if (!ui.previewFixed.checked) draw();
    followClock();
  }, 60000 - Date.now() % 60000);
}

/* ------------------------------------------------------------------- the notes */

/** A line that is either saying something or hidden. */
function say(node, message, bad = false) {
  node.textContent = message;
  node.hidden = !message;
  node.classList.toggle('bad', bad);
}

function clearImport() {
  say(ui.importNote, '');
  say(ui.importError, '');
}

/* ------------------------------------------------------------------ importing */

/** "the name, the rating and the address", out of the parser's field list. */
function fieldList(found) {
  const words = found.map((field) => phrase(`field.${field}`));
  if (words.length <= 1) return words[0] ?? '';
  return phrase('field.list', {
    first: words.slice(0, -1).join(', '),
    last: words[words.length - 1],
  });
}

function readPaste() {
  replaceProfile();
  clearImport();
  const text = ui.paste.value.trim();
  if (!text) { say(ui.importError, phrase('paste.empty')); return; }

  // The action labels go in as furniture: a copied knowledge panel brings
  // "Website", "Directions", "Save" and the rest along as lines of their own,
  // and the first of them would otherwise be read as the business name.
  const furniture = ['website', 'directions', 'call', 'save', 'share']
    .map((id) => labels[`label.${id}`]);
  const { profile, found } = parseListing(text, longDays, furniture);
  if (!found.length) { say(ui.importError, phrase('paste.nothing')); return; }

  // The photo and the clock are this page's, not the paste's, so they survive
  // an import that says nothing about them.
  write({ ...profile, clock: read().clock });
  say(ui.importNote, phrase('paste.read', { fields: fieldList(found) }));
  draw();
}

const savedRead = textImport({
  busy() { ui.openJson.setAttribute('aria-busy', 'true'); },
  done() { ui.openJson.removeAttribute('aria-busy'); },
});

function readSaved(file) {
  clearImport();
  retirePhoto();
  retirePng();
  return savedRead.read([file], {
    apply([text]) {
      const { profile, shape } = fromJson(text);
      setPhoto(null);
      write(profile);
      say(ui.importNote, phrase(shape === 'google' ? 'load.google' : 'load.own'));
      draw();
    },
    failed(error) {
      const detail = ['load.notjson', 'load.unknown'].includes(error?.message)
        ? phrase(error.message) : phrase('load.failed');
      say(ui.importError, detail);
    },
  });
}

function retireImports() {
  savedRead.invalidate();
}

function replaceProfile() {
  retireImports();
  retirePhoto();
  retirePng();
}

/* ------------------------------------------------- the example, and the empty */

/**
 * The example profile, with its words looked up and its photograph drawn.
 *
 * samples.js holds keys rather than sentences, so this is where they become
 * words; `coverPhoto` is the reason the button is worth pressing at all, since
 * a picture is the one field the opening state cannot carry.
 */
function fillExample() {
  replaceProfile();
  clearImport();
  const words = ['name', 'category', 'address', 'phone', 'website', 'description',
    'attributes'];
  const profile = { ...EXAMPLE };
  for (const field of words) profile[field] = phrase(EXAMPLE[field]);

  setPhoto(coverPhoto());
  write(normalise({ ...profile, clock: read().clock, photo }));
  draw();
  say(ui.photoNote, phrase('sample.done'));
}

/** Every field empty, which is what a listing nobody has filled in looks like. */
function clearAll() {
  replaceProfile();
  ui.previewFixed.checked = false;
  ui.previewAt.disabled = true;
  ui.previewAt.value = '';
  clearImport();
  setPhoto(null);
  write(empty());
  draw();
  say(ui.photoNote, phrase('clear.done'));
}

/* ------------------------------------------------------------------- saving */

async function savePng() {
  if (pngWrite) return;
  draw();
  if (!drawn) return;
  say(ui.saveError, '');
  say(ui.saveNote, '');
  const owner = new AbortController();
  pngWrite = owner;
  syncDownloads();
  // Everything the save says belongs to the same picture, even if the form or
  // surface is edited while the native image/PNG encoder is still working.
  const picture = { ...drawn };
  const scale = Number(ui.scale.value) || 1;
  const name = `${stem()}-${chosen()}.png`;
  const width = Math.round(picture.width * scale);
  const height = Math.round(picture.height * scale);
  try {
    const blob = await toPng(picture, scale, owner.signal);
    if (pngWrite !== owner) return;
    saveBlob(blob, name);
    say(ui.saveNote, phrase('save.done', { name, width, height }));
  } catch (error) {
    if (pngWrite !== owner || error?.name === 'AbortError') return;
    const detail = ['save.nosvg', 'save.nopng'].includes(error?.message)
      ? phrase(error.message) : phrase('save.nopng');
    say(ui.saveError, phrase('save.failed', { detail }));
  } finally {
    if (pngWrite === owner) { pngWrite = null; syncDownloads(); }
  }
}

/* -------------------------------------------------------------------- wiring */

function wire() {
  for (const node of [
    ui.name, ui.category, ui.rating, ui.reviews, ui.price, ui.description,
    ui.attributes, ui.address, ui.serviceArea, ui.phone, ui.website,
    ui.status, ui.clock,
  ]) {
    node.addEventListener('input', () => { retireImports(); schedule(); });
  }
  ui.week.addEventListener('input', () => { retireImports(); schedule(); });
  ui.previewFixed.addEventListener('change', () => {
    ui.previewAt.disabled = !ui.previewFixed.checked;
    if (ui.previewFixed.checked && !ui.previewAt.value) {
      ui.previewAt.value = localDateValue(new Date());
    }
    draw();
  });
  ui.previewAt.addEventListener('input', schedule);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !ui.previewFixed.checked) draw();
  });

  for (const button of document.querySelectorAll('.chip[data-surface]')) {
    button.addEventListener('click', () => {
      for (const other of document.querySelectorAll('.chip[data-surface]')) {
        other.setAttribute('aria-pressed', String(other === button));
      }
      draw();
    });
  }

  ui.copyMonday.addEventListener('click', () => {
    retireImports();
    const monday = weekRows()[1];
    const from = monday.querySelector('.day-open').value;
    const to = monday.querySelector('.day-close').value;
    const shut = monday.querySelector('.day-shut').checked;
    for (const row of weekRows()) {
      row.querySelector('.day-open').value = from;
      row.querySelector('.day-close').value = to;
      row.querySelector('.day-shut').checked = shut;
    }
    draw();
    ui.weekNote.textContent = `${phrase('week.copied')} ${ui.weekNote.textContent}`;
  });

  ui.weekdaysOnly.addEventListener('click', () => {
    retireImports();
    weekRows().forEach((row, day) => {
      row.querySelector('.day-shut').checked = day === 0 || day === 6;
    });
    draw();
    ui.weekNote.textContent = `${phrase('week.weekdays')} ${ui.weekNote.textContent}`;
  });

  ui.pickPhoto.addEventListener('click', () => ui.photoFile.click());
  ui.photoFile.addEventListener('change', async () => {
    const file = ui.photoFile.files?.[0];
    // Cleared before the read rather than after, so choosing the same file
    // twice - which is what somebody does after cropping it - fires again.
    ui.photoFile.value = '';
    if (!file) return;
    retireImports();
    retirePhoto();
    const owner = new AbortController();
    photoRead = owner;
    try {
      const picture = await readPhoto(file, undefined, owner.signal);
      if (photoRead !== owner) return;
      setPhoto(picture.uri, phrase('photo.added', {
        width: picture.width, height: picture.height,
      }));
      draw();
    } catch (error) {
      if (photoRead !== owner || error?.name === 'AbortError') return;
      const key = ['photo.toobig', 'photo.unreadable', 'photo.tiny'].includes(error?.message)
        ? error.message : 'photo.unreadable';
      say(ui.photoNote, phrase(key), true);
    } finally {
      if (photoRead === owner) photoRead = null;
    }
  });
  ui.dropPhoto.addEventListener('click', () => {
    retireImports();
    retirePhoto();
    setPhoto(null, phrase('photo.gone'));
    draw();
  });

  ui.sample.addEventListener('click', fillExample);
  ui.clear.addEventListener('click', clearAll);

  ui.readPaste.addEventListener('click', readPaste);
  ui.openJson.addEventListener('click', () => ui.jsonFile.click());
  ui.jsonFile.addEventListener('change', () => {
    const file = ui.jsonFile.files?.[0];
    ui.jsonFile.value = '';
    if (file) readSaved(file);
  });

  // The frame writes the privacy panel and its toggle; every tool wires the
  // one to the other in its own main.js. It is the frame's only half-finished
  // part, and a tool that forgets it ships a button that does nothing - which
  // is what this one did until the QA suite pressed it.
  ui.privacyToggle.addEventListener('click', () => {
    const open = ui.privacyPanel.hidden;
    ui.privacyPanel.hidden = !open;
    ui.privacyToggle.setAttribute('aria-expanded', String(open));
  });

  ui.savePng.addEventListener('click', savePng);
  ui.saveSvg.addEventListener('click', () => {
    draw();
    if (!drawn) return;
    saveBlob(svgBlob(drawn.svg), `${stem()}-${chosen()}.svg`);
    say(ui.saveNote, phrase('save.svgdone'));
  });
  ui.saveJson.addEventListener('click', () => {
    saveBlob(new Blob([toJson(read())], { type: 'application/json' }), `${stem()}.json`);
    say(ui.saveNote, phrase('save.jsondone'));
  });
}

/* -------------------------------------------------------------------- boot */

// An error thrown after boot would otherwise only reach the console, leaving
// the page looking functional but drawing nothing.
window.addEventListener('error', (event) => {
  say(ui.saveError, phrase('error.broke', { detail: event.message }));
});
window.addEventListener('unhandledrejection', (event) => {
  say(ui.saveError, phrase('error.broke', {
    detail: event.reason?.message ?? event.reason,
  }));
});

// The form arrives with a coffee shop already in it, so the page opens as a
// picture rather than as an empty grid of boxes: the example is written into
// body.html as the boxes' own values, which is what makes it translatable
// without a line of it living here.
buildWeek();
wire();
draw();
followClock();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
