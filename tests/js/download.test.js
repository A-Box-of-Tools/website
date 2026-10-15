/**
 * shared/js/download.js - handing a result to the browser as a file.
 *
 * What matters here is the bookkeeping around object URLs, which is the part
 * that goes wrong silently: a URL never revoked keeps its blob alive for the
 * life of the page, and one revoked too soon cancels the download it was for.
 * So `URL` is a stub that counts, `document` is the least it takes to click a
 * link, and the clock is the test runner's.
 */

import test, { mock } from 'node:test';
import assert from 'node:assert/strict';

import { saveBlob, downloadLink } from '../../shared/js/download.js';

function resultLink() {
  return Object.assign(new EventTarget(), {
    hidden: true,
    click() { this.dispatchEvent(new Event('click')); },
  });
}

/** A URL and a document that record what was done to them. */
function browser() {
  const made = [];
  const revoked = [];
  const links = [];
  globalThis.URL.createObjectURL = (blob) => {
    made.push(blob);
    return `blob:${made.length}`;
  };
  globalThis.URL.revokeObjectURL = (url) => revoked.push(url);
  globalThis.document = {
    createElement(tag) {
      const link = { tag, clicks: 0, click() { this.clicks += 1; }, remove() { this.inDocument = false; } };
      links.push(link);
      return link;
    },
    body: { append(link) { link.inDocument = true; } },
  };
  return { made, revoked, links };
}

test('saveBlob clicks a link in the document and revokes its URL a minute later', () => {
  mock.timers.enable({ apis: ['setTimeout'] });
  const { made, revoked, links } = browser();
  const blob = new Blob(['hello']);

  saveBlob(blob, 'hello.txt');

  assert.equal(made[0], blob);
  assert.equal(links.length, 1);
  assert.equal(links[0].href, 'blob:1');
  assert.equal(links[0].download, 'hello.txt');
  assert.equal(links[0].rel, 'noopener');
  assert.equal(links[0].clicks, 1);
  assert.equal(links[0].inDocument, false, 'removed again once clicked');
  assert.deepEqual(revoked, [], 'not revoked before the download can start');
  mock.timers.tick(60_000);
  assert.deepEqual(revoked, ['blob:1']);
  mock.timers.reset();
});

test('a download link points at the latest text and lets go of the last', () => {
  const { made, revoked } = browser();
  const link = resultLink();
  const download = downloadLink(link);

  download.offer('one', 'a.txt');
  assert.equal(link.href, 'blob:1');
  assert.equal(link.download, 'a.txt');
  assert.equal(link.hidden, false);
  assert.equal(made[0].type, 'text/plain;charset=utf-8');

  download.offer('two', 'b.txt');
  assert.equal(link.href, 'blob:2');
  assert.deepEqual(revoked, ['blob:1']);
});

test('an empty result hides the link, and so does clearing', () => {
  const { revoked } = browser();
  const link = resultLink();
  const download = downloadLink(link);

  download.offer('one', 'a.txt');
  download.offer('', 'a.txt');
  assert.equal(link.hidden, true);
  assert.deepEqual(revoked, ['blob:1']);

  download.offer('two', 'b.txt');
  download.clear();
  assert.equal(link.hidden, true);
  assert.deepEqual(revoked, ['blob:1', 'blob:2']);
  download.clear();
  assert.deepEqual(revoked, ['blob:1', 'blob:2'], 'nothing to revoke twice');
});

test('a Blob is offered as it is, whatever type the link was made for', () => {
  const { made } = browser();
  const link = resultLink();
  const svg = new Blob(['<svg/>'], { type: 'image/svg+xml' });
  downloadLink(link).offer(svg, 'picture.svg');
  assert.equal(made[0], svg);
});

test('completion requires choosing a ready result and receives no file data', (t) => {
  browser();
  const complete = mock.fn();
  globalThis.aboxToolComplete = complete;
  t.after(() => { delete globalThis.aboxToolComplete; });
  const link = resultLink();
  const download = downloadLink(link);
  link.click();
  download.offer('private contents', 'private-filename.txt');
  assert.equal(complete.mock.callCount(), 0, 'preparing output is not choosing it');
  link.click();
  assert.equal(complete.mock.callCount(), 1);
  assert.deepEqual(complete.mock.calls[0].arguments, []);
  download.clear();
  link.click();
  assert.equal(complete.mock.callCount(), 1, 'an invalidated result is not usable');
});
