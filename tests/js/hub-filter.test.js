/**
 * shared/hub-filter.js runs as a frame script, so these cases give it the
 * small part of the DOM it reads rather than importing a browser dependency.
 * The important boundary is the full catalogue behind the three-card preview:
 * a search and a category fragment must reach a tool that was never drawn in
 * that preview, including after the visitor changes how a category is shown.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const SOURCE = readFileSync(new URL('../../shared/hub-filter.js', import.meta.url), 'utf8');

function element(context, { text = '', hidden = false, attrs = {}, tagName = 'DIV' } = {}) {
  const listeners = new Map();
  const queries = new Map();
  return {
    textContent: text,
    hidden,
    value: '',
    tagName,
    isContentEditable: false,
    scrolls: 0,
    getAttribute(name) { return Object.hasOwn(attrs, name) ? attrs[name] : null; },
    setAttribute(name, value) { attrs[name] = String(value); },
    querySelector(selector) { return queries.get(selector) ?? null; },
    querySelectorAll(selector) { return queries.get(selector) ?? []; },
    addEventListener(type, fn) {
      const list = listeners.get(type) ?? [];
      list.push(fn);
      listeners.set(type, list);
    },
    emit(type, values = {}) {
      const event = {
        defaultPrevented: false,
        preventDefault() { this.defaultPrevented = true; },
        ...values,
      };
      for (const fn of listeners.get(type) ?? []) fn(event);
      return event;
    },
    focus() { context.document.activeElement = this; },
    scrollIntoView() { this.scrolls++; },
    queries,
  };
}

const DEFAULTS = [
  {
    id: 'images', name: 'Images', note: 'Draw or edit locally.',
    tools: [
      { slug: 'one', text: 'First image' },
      { slug: 'two', text: 'Second image' },
      { slug: 'three', text: 'Third image' },
      { slug: 'four', text: 'Image layout', search: 'Arrange overlapping photos.' },
      { slug: 'five', text: 'Compresión' },
    ],
  },
  {
    id: 'video-and-animation', name: 'Video and animation',
    tools: [
      { slug: 'six', text: 'Cut footage' },
      { slug: 'seven', text: 'Frame capture' },
      { slug: 'eight', text: 'Reverse playback' },
      { slug: 'timelapse-video', text: 'Time-Lapse Maker' },
    ],
  },
  {
    id: 'documents-and-audio', name: 'Documents and audio',
    tools: [{ slug: 'nine', text: 'Listen locally' }],
  },
];

function run({ definitions = DEFAULTS, value = '', hash = '' } = {}) {
  const context = {};
  const box = element(context, { hidden: true });
  const input = element(context, { tagName: 'INPUT' });
  input.value = value;
  const empty = element(context, { hidden: true });
  const groups = definitions.map(definition => {
    const section = element(context, { attrs: { id: definition.id } });
    const toggle = definition.toggle === false ? null : element(context, {
      hidden: true, tagName: 'BUTTON',
      attrs: { 'aria-expanded': 'false', 'aria-controls': definition.id + '-tools' },
    });
    const more = element(context, { text: 'Localized view all' });
    const less = element(context, { text: 'Localized show fewer', hidden: true });
    section.queries.set('h2', element(context, { text: definition.name }));
    section.queries.set('.category-note', element(context, { text: definition.note || '' }));
    section.queries.set('.category-toggle', toggle);
    section.queries.set('.category-more', more);
    section.queries.set('.category-less', less);
    const rows = definition.tools.map(tool => {
      const row = element(context, { text: tool.text });
      const card = element(context, {
        text: tool.text,
        tagName: 'A',
        attrs: { 'data-tool': tool.slug, 'data-search': tool.search || '' },
      });
      row.queries.set('a.tool-card', card);
      return { row, card, slug: tool.slug };
    });
    section.queries.set('.tool-grid > li', rows.map(entry => entry.row));
    const anchor = element(context, {
      tagName: 'A', attrs: { href: '#' + definition.id },
    });
    return { section, toggle, more, less, rows, anchor };
  });

  const document = element(context);
  context.document = document;
  document.activeElement = null;
  const ids = new Map([
    ['tool-filter', box], ['tool-filter-input', input], ['tool-filter-none', empty],
  ]);
  document.getElementById = id => ids.get(id) ?? null;
  document.queries.set('main .category', groups.map(group => group.section));
  document.queries.set('.hub-categories a', groups.map(group => group.anchor));
  const window = element(context);
  window.location = { hash };

  new Function('document', 'window', SOURCE)(document, window);

  return {
    box, input, empty, groups, document, window,
    visible(index) { return groups[index].rows.filter(entry => !entry.row.hidden).map(entry => entry.slug); },
    search(query) { input.value = query; input.emit('input'); },
    hash(fragment) { window.location.hash = fragment; window.emit('hashchange'); },
  };
}

test('previews keep short categories usable and the expansion control remains focused', () => {
  const page = run();
  assert.equal(page.box.hidden, false);
  assert.deepEqual(page.visible(0), ['one', 'two', 'three']);
  assert.deepEqual(page.visible(1), ['six', 'seven', 'eight']);
  assert.deepEqual(page.visible(2), ['nine']);
  assert.equal(page.groups[2].toggle.hidden, true);
  const group = page.groups[0];
  assert.equal(group.toggle.hidden, false);
  assert.equal(group.toggle.getAttribute('aria-expanded'), 'false');
  assert.equal(group.more.hidden, false);
  assert.equal(group.less.hidden, true);

  group.toggle.focus();
  group.toggle.emit('click');
  assert.deepEqual(page.visible(0), ['one', 'two', 'three', 'four', 'five']);
  assert.equal(group.toggle.getAttribute('aria-expanded'), 'true');
  assert.equal(group.more.hidden, true);
  assert.equal(group.less.hidden, false);
  assert.equal(page.document.activeElement, group.toggle);

  group.toggle.emit('click');
  assert.deepEqual(page.visible(0), ['one', 'two', 'three']);
  assert.equal(group.toggle.getAttribute('aria-expanded'), 'false');
  assert.equal(page.document.activeElement, group.toggle);
});

test('search reaches a full-description detail outside the preview and reports no matches', () => {
  const page = run();
  page.search('overlapping photos');
  assert.deepEqual(page.visible(0), ['four']);
  assert.equal(page.groups[0].section.hidden, false);
  assert.equal(page.groups[1].section.hidden, true);
  assert.equal(page.groups[0].toggle.hidden, true);
  assert.equal(page.empty.hidden, true);

  page.search('this phrase does not occur');
  assert.equal(page.empty.hidden, false);
  assert.equal(page.groups.every(group => group.section.hidden), true);

  page.search('');
  assert.equal(page.empty.hidden, true);
  assert.equal(page.groups.every(group => !group.section.hidden), true);
  assert.deepEqual(page.visible(0), ['one', 'two', 'three']);
});

test('search shows every matching tool and clear or Escape restores each expansion choice', () => {
  const page = run();
  page.groups[0].toggle.emit('click');
  page.search('animation');
  assert.deepEqual(page.visible(1), ['six', 'seven', 'eight', 'timelapse-video']);
  assert.equal(page.groups.every(group => group.toggle.hidden), true);

  page.input.emit('keydown', { key: 'Escape' });
  assert.equal(page.input.value, '');
  assert.deepEqual(page.visible(0), ['one', 'two', 'three', 'four', 'five']);
  assert.deepEqual(page.visible(1), ['six', 'seven', 'eight']);
  assert.equal(page.groups[0].toggle.getAttribute('aria-expanded'), 'true');
  assert.equal(page.groups[1].toggle.getAttribute('aria-expanded'), 'false');

  page.search('image');
  assert.equal(page.visible(0).length, 5);
  page.search('   ');
  assert.deepEqual(page.visible(0), ['one', 'two', 'three', 'four', 'five']);
  assert.deepEqual(page.visible(1), ['six', 'seven', 'eight']);
});

test('localized text, category notes, hyphens and restored search values still find tools', () => {
  const page = run({ value: 'compresion' });
  assert.deepEqual(page.visible(0), ['five']);
  assert.equal(page.groups[0].toggle.hidden, true);

  page.search('timelapse');
  assert.deepEqual(page.visible(1), ['timelapse-video']);
  page.search('draw');
  assert.deepEqual(page.visible(0), ['one', 'two', 'three', 'four', 'five']);

  const fallback = run({
    definitions: [{ ...DEFAULTS[0], toggle: false }],
  });
  assert.equal(fallback.visible(0).length, 5);
});

test('format searches retain directional conversion matching and JPEG aliases', () => {
  const page = run({
    definitions: [{
      id: 'formats', name: 'Formats',
      tools: [
        { slug: 'resize-image', text: 'Change image size' },
        { slug: 'png-to-webp', text: 'Change image format' },
        { slug: 'webp-to-jpg', text: 'Change image format' },
        { slug: 'json-formatter', text: 'Format structured text' },
        { slug: 'yaml-to-json', text: 'Change text format' },
        { slug: 'unrelated', text: 'JPG PNG WebP YAML JSON' },
      ],
    }],
  });
  page.search('jpeg to webp');
  assert.deepEqual(page.visible(0), ['resize-image']);
  page.search('webp to jpeg');
  assert.deepEqual(page.visible(0), ['resize-image', 'webp-to-jpg']);
  page.search('json to yaml');
  assert.deepEqual(page.visible(0), ['json-formatter', 'yaml-to-json']);
  page.search('json to html');
  assert.deepEqual(page.visible(0), []);
  assert.equal(page.empty.hidden, false);
});

test('category fragments expand the complete category on load and through history navigation', () => {
  const page = run({ hash: '#video-and-animation', value: 'overlapping' });
  assert.equal(page.input.value, '');
  assert.deepEqual(page.visible(1), ['six', 'seven', 'eight', 'timelapse-video']);
  assert.equal(page.groups[1].toggle.getAttribute('aria-expanded'), 'true');
  assert.equal(page.groups[1].section.scrolls, 1);

  page.search('overlapping');
  assert.equal(page.groups[1].section.hidden, true);
  page.hash('#video-and-animation');
  assert.equal(page.input.value, '');
  assert.equal(page.groups[1].section.hidden, false);
  assert.equal(page.groups[1].section.scrolls, 2);

  page.search('compresion');
  page.hash('#missing-category');
  assert.equal(page.input.value, 'compresion');
  page.hash('#%E0%A4%A');
  assert.equal(page.input.value, 'compresion');
});

test('category jumps clear a hiding search before native navigation, including repeated fragments', () => {
  const page = run();
  page.search('overlapping');
  const group = page.groups[1];
  const modified = group.anchor.emit('click', { ctrlKey: true });
  assert.equal(modified.defaultPrevented, false);
  assert.equal(page.input.value, 'overlapping');

  const click = group.anchor.emit('click');
  assert.equal(click.defaultPrevented, false);
  assert.equal(page.input.value, '');
  assert.equal(group.section.hidden, false);
  assert.deepEqual(page.visible(1), ['six', 'seven', 'eight', 'timelapse-video']);

  group.toggle.emit('click');
  group.anchor.emit('click');
  assert.deepEqual(page.visible(1), ['six', 'seven', 'eight', 'timelapse-video']);
  assert.equal(group.section.scrolls, 0);
});

test('the slash shortcut respects editing and modifier keys while Escape clears the query', () => {
  const page = run();
  const slash = page.document.emit('keydown', { key: '/' });
  assert.equal(slash.defaultPrevented, true);
  assert.equal(page.document.activeElement, page.input);

  for (const active of [
    { tagName: 'TEXTAREA' }, { tagName: 'SELECT' }, { tagName: 'DIV', isContentEditable: true },
  ]) {
    page.document.activeElement = active;
    assert.equal(page.document.emit('keydown', { key: '/' }).defaultPrevented, false);
    assert.equal(page.document.activeElement, active);
  }
  page.document.activeElement = null;
  for (const modifier of ['ctrlKey', 'metaKey', 'altKey']) {
    assert.equal(page.document.emit('keydown', { key: '/', [modifier]: true }).defaultPrevented, false);
    assert.equal(page.document.activeElement, null);
  }
  page.search('overlapping');
  page.input.emit('keydown', { key: 'Escape' });
  assert.equal(page.input.value, '');
  assert.deepEqual(page.visible(0), ['one', 'two', 'three']);
});
