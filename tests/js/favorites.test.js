/**
 * A tool page knows only its own slug. Saving it must preserve preferences
 * from other pages and languages, even when storage or navigation intervenes.
 * The real catalogue rendering and keyboard focus are checked in the browser.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const SOURCE = readFileSync(new URL('../../shared/favorites.js', import.meta.url), 'utf8');
const KEY = 'abox-favorites';

function storage(raw) {
  const values = new Map(raw === undefined ? [] : [[KEY, raw]]);
  return {
    values, reads: 0, blockRead: false, blockWrite: false,
    getItem(key) {
      this.reads++;
      if (this.blockRead) throw new Error('Storage denied');
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      if (this.blockWrite) throw new Error('Storage denied');
      values.set(key, value);
    },
    removeItem(key) {
      if (this.blockWrite) throw new Error('Storage denied');
      values.delete(key);
    },
  };
}

function page(store, slugs = ['alpha']) {
  const listeners = new Map();
  const unavailable = { hidden: true, textContent: 'Localized storage feedback' };
  const buttons = slugs.map(slug => {
    const events = new Map();
    const attrs = new Map([['data-favorite', slug]]);
    return {
      hidden: true,
      getAttribute(name) { return attrs.get(name) ?? null; },
      setAttribute(name, value) { attrs.set(name, String(value)); },
      addEventListener(name, callback) { events.set(name, callback); },
      click() { events.get('click')?.(); },
    };
  });
  const document = {
    querySelectorAll(selector) { return selector === '[data-favorite]' ? buttons : []; },
    getElementById(id) { return id === 'favorites-unavailable' ? unavailable : null; },
  };
  const window = {
    localStorage: store,
    addEventListener(name, callback) { listeners.set(name, callback); },
  };
  new Function('document', 'window', SOURCE)(document, window);
  const button = slug => buttons.find(item => item.getAttribute('data-favorite') === slug);
  return {
    button, unavailable,
    click(slug) { button(slug).click(); },
    pressed(slug) { return button(slug).getAttribute('aria-pressed') === 'true'; },
    emit(name, event = {}) { listeners.get(name)?.(event); },
  };
}

const saved = store => JSON.parse(store.values.get(KEY)).sort();

test('a tool page saves a canonical slug that another page recognizes', () => {
  const store = storage();
  const first = page(store, ['alpha-tool']);
  assert.equal(first.button('alpha-tool').hidden, false);
  assert.equal(first.pressed('alpha-tool'), false);
  first.click('alpha-tool');
  assert.deepEqual(saved(store), ['alpha-tool']);
  const second = page(store, ['alpha-tool', 'beta-tool']);
  assert.equal(second.pressed('alpha-tool'), true);
  assert.equal(second.pressed('beta-tool'), false);
});

test('removing the last favorite removes the storage key', () => {
  const store = storage('["alpha"]');
  const current = page(store);
  current.click('alpha');
  assert.equal(current.pressed('alpha'), false);
  assert.equal(store.values.has(KEY), false);
  assert.equal(page(store).pressed('alpha'), false);
});

test('malformed saved data recovers without dropping valid slugs from other pages', () => {
  for (const raw of ['{broken', '{"alpha":true}', 'null']) {
    const store = storage(raw);
    page(store).click('alpha');
    assert.deepEqual(saved(store), ['alpha']);
  }
  const store = storage(JSON.stringify([
    'alpha', 'alpha', 'future-tool', '', '../unsafe', 'BadSlug', null, 7, {},
  ]));
  page(store, ['beta']).click('beta');
  assert.deepEqual(saved(store), ['alpha', 'beta', 'future-tool']);
});

test('failed writes retain page selections through navigation and later clicks', () => {
  const store = storage();
  store.blockWrite = true;
  const current = page(store, ['alpha', 'beta']);
  current.click('alpha');
  assert.equal(current.pressed('alpha'), true);
  assert.equal(current.unavailable.hidden, false);
  assert.equal(current.unavailable.textContent, 'Localized storage feedback');
  const reads = store.reads;
  current.emit('pageshow');
  current.click('beta');
  current.click('alpha');
  assert.equal(current.pressed('alpha'), false);
  assert.equal(current.pressed('beta'), true);
  assert.equal(store.reads, reads);
  assert.equal(store.values.has(KEY), false);
});

test('blocked reads still allow selections and explain saving failed', () => {
  const store = storage();
  store.blockRead = true;
  const current = page(store);
  assert.equal(current.unavailable.hidden, true);
  current.click('alpha');
  assert.equal(current.pressed('alpha'), true);
  assert.equal(current.unavailable.hidden, false);
  current.click('alpha');
  assert.equal(current.pressed('alpha'), false);
  assert.equal(store.values.has(KEY), false);
});

test('back navigation and other-tab changes refresh selection, including cleared storage', () => {
  const store = storage();
  const current = page(store, ['alpha', 'beta']);
  store.values.set(KEY, '["alpha"]');
  current.emit('pageshow');
  assert.equal(current.pressed('alpha'), true);
  store.values.set(KEY, '["beta"]');
  current.emit('storage', { key: 'unrelated' });
  assert.equal(current.pressed('alpha'), true);
  current.emit('storage', { key: KEY });
  assert.equal(current.pressed('beta'), true);
  store.values.clear();
  current.emit('storage', { key: null });
  assert.equal(current.pressed('alpha'), false);
  assert.equal(current.pressed('beta'), false);
});

test('a click preserves newer choices from another tab before its storage event arrives', () => {
  const store = storage();
  const current = page(store, ['alpha', 'beta']);
  store.values.set(KEY, '["beta"]');
  current.click('alpha');
  assert.deepEqual(saved(store), ['alpha', 'beta']);
  store.values.set(KEY, '["alpha","beta","future-tool"]');
  current.click('beta');
  assert.deepEqual(saved(store), ['alpha', 'future-tool']);
});
