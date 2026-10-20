import test from 'node:test';
import assert from 'node:assert/strict';
import { openJoinedPage, consumeJoinedPage } from '../../shared/js/peer-join.js';

const sourceUrl = 'https://abox.tools/share-text/';
const href = `${sourceUrl}?local=1&transport=direct#brave-otter-42`;
function storage() {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key), clear: () => values.clear() };
}
function reader() {
  const page = { opener: {}, sessionStorage: storage(), closed: false, destination: null };
  page.location = { replace: value => { page.destination = value; } };
  page.close = () => { page.closed = true; };
  return page;
}

test('a discovery Join isolates the new tab and carries consent exactly once', () => {
  const page = reader();
  page.sessionStorage.setItem('host-identity', 'must-not-recover');
  assert.equal(openJoinedPage(href, { sourceUrl, open: () => page, now: () => 1000 }), true);
  assert.equal(page.opener, null);
  assert.equal(page.sessionStorage.getItem('host-identity'), null);
  assert.equal(page.destination, href);
  assert.equal(consumeJoinedPage({ href, storage: page.sessionStorage, now: () => 1100 }), true);
  assert.equal(consumeJoinedPage({ href, storage: page.sessionStorage, now: () => 1100 }), false);
});

test('a changed route or share cannot consume another discovery Join', () => {
  for (const changed of [href.replace('direct', 'relay'), href.replace('brave-otter-42', 'other-share')]) {
    const page = reader();
    openJoinedPage(href, { sourceUrl, open: () => page, now: () => 1000 });
    assert.equal(consumeJoinedPage({ href: changed, storage: page.sessionStorage, now: () => 1100 }), false);
    assert.equal(consumeJoinedPage({ href, storage: page.sessionStorage, now: () => 1100 }), false);
  }
});

test('expired and future handoffs require fresh consent', () => {
  for (const time of [999, 31001]) {
    const page = reader();
    openJoinedPage(href, { sourceUrl, open: () => page, now: () => 1000 });
    assert.equal(consumeJoinedPage({ href, storage: page.sessionStorage, now: () => time }), false);
  }
});

test('an ordinary link or a URL flag never grants consent', () => {
  assert.equal(consumeJoinedPage({ href: `${href}&join=1`, storage: storage(), now: () => 1000 }), false);
});

test('discovery handoffs cannot navigate to another origin or tool', () => {
  for (const target of ['https://other.example/share-text/', `${sourceUrl}../walkie-talkie/`, 'javascript:alert(1)']) {
    let opened = false;
    assert.equal(openJoinedPage(target, { sourceUrl, open: () => { opened = true; } }), false);
    assert.equal(opened, false);
  }
});

test('popup or storage denial leaves the ordinary invitation fallback available', () => {
  assert.equal(openJoinedPage(href, { sourceUrl, open: () => null }), false);
  const page = reader();
  page.sessionStorage.clear = () => { throw new Error('denied'); };
  assert.equal(openJoinedPage(href, { sourceUrl, open: () => page }), false);
  assert.equal(page.closed, true);
  assert.equal(page.destination, null);
  assert.equal(consumeJoinedPage({ href, storage: { getItem() { throw new Error('denied'); } } }), false);
});

test('a blocked sessionStorage property cannot bypass the ordinary invitation gate', () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage');
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, get() { throw new Error('denied'); } });
  try { assert.equal(consumeJoinedPage({ href }), false); }
  finally {
    if (previous) Object.defineProperty(globalThis, 'sessionStorage', previous);
    else delete globalThis.sessionStorage;
  }
});
