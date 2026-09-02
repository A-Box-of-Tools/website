/**
 * shared/js/image-list.js - a list of pictures to work through in order.
 *
 * The decode and the thumbnail are the browser's; here they are stubs that
 * record what they were asked for, so the test can pin what the two tools
 * that share this file relied on: a file that is not an image or will not
 * decode is skipped by name rather than failing the batch, the full-size
 * bitmap is closed once the thumbnail exists, the thumbnail is bounded by the
 * size the tool names, and the tool's own fields land on the item.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { loadImages, moveItem, sortItems } from '../../shared/js/image-list.js';

/** A browser that decodes any image whose name says its size, and refuses "broken". */
function browser() {
  const closed = [];
  const canvases = [];
  globalThis.createImageBitmap = async (file) => {
    if (file.name.startsWith('broken')) throw new Error('undecodable');
    const [width, height] = file.name.match(/(\d+)x(\d+)/).slice(1).map(Number);
    return { width, height, close: () => closed.push(file.name) };
  };
  globalThis.document = {
    createElement: () => {
      const canvas = {
        getContext: () => ({ drawImage() {} }),
        toBlob: (resolve) => resolve({ size: canvas.width * canvas.height }),
      };
      canvases.push(canvas);
      return canvas;
    },
  };
  globalThis.URL.createObjectURL = (blob) => `blob:${blob.size}`;
  return { closed, canvases };
}

const file = (name, type = 'image/jpeg', lastModified = 0) => ({ name, type, lastModified });

test('images are decoded once, measured, thumbnailed within the size given, and closed', async () => {
  const { closed, canvases } = browser();
  const { items, skipped } = await loadImages(
    [file('a-4000x3000.jpg'), file('b-100x50.png', 'image/png')],
    { thumbMax: 200, fields: () => ({ delay: 0.5 }) });

  assert.deepEqual(skipped, []);
  assert.equal(items.length, 2);
  assert.deepEqual(
    items.map(({ name, width, height, delay }) => ({ name, width, height, delay })),
    [{ name: 'a-4000x3000.jpg', width: 4000, height: 3000, delay: 0.5 },
      { name: 'b-100x50.png', width: 100, height: 50, delay: 0.5 }]);
  assert.deepEqual([canvases[0].width, canvases[0].height], [200, 150], 'scaled to the longer side');
  assert.deepEqual([canvases[1].width, canvases[1].height], [100, 50], 'never scaled up');
  assert.ok(items[0].thumbUrl.startsWith('blob:'));
  assert.deepEqual(closed, ['a-4000x3000.jpg', 'b-100x50.png']);
  assert.ok(items[1].id > items[0].id);
});

test('a file that is not an image or will not decode is skipped by name', async () => {
  browser();
  const { items, skipped } = await loadImages(
    [file('notes.txt', 'text/plain'), file('broken-10x10.jpg'), file('ok-10x10.jpg')]);
  assert.deepEqual(skipped, ['notes.txt', 'broken-10x10.jpg']);
  assert.deepEqual(items.map((item) => item.name), ['ok-10x10.jpg']);
});

test('the tool decides what else an item carries', async () => {
  browser();
  const { items } = await loadImages([file('ok-10x10.jpg')], {
    fields: () => ({ frames: 12, seconds: 0.5 }),
  });
  assert.equal(items[0].frames, 12);
  assert.equal(items[0].seconds, 0.5);
  assert.equal('delay' in items[0], false);
});

test('sorting is natural by name, by date, or reversed, in place', () => {
  const items = [
    { name: 'img10.jpg', lastModified: 3 },
    { name: 'img2.jpg', lastModified: 1 },
    { name: 'IMG1.jpg', lastModified: 2 },
  ];
  assert.deepEqual(sortItems(items, 'name').map((i) => i.name), ['IMG1.jpg', 'img2.jpg', 'img10.jpg']);
  assert.deepEqual(sortItems(items, 'date').map((i) => i.lastModified), [1, 2, 3]);
  assert.deepEqual(sortItems(items, 'reverse').map((i) => i.lastModified), [3, 2, 1]);
  assert.equal(sortItems(items, 'unknown'), items);
});

test('moving an item shifts the rest and refuses a place off the end', () => {
  const items = ['a', 'b', 'c', 'd'];
  assert.deepEqual(moveItem(items, 0, 2), ['b', 'c', 'a', 'd']);
  assert.deepEqual(moveItem(items, 3, 0), ['d', 'b', 'c', 'a']);
  assert.deepEqual(moveItem(items, 1, 4), ['d', 'b', 'c', 'a']);
  assert.deepEqual(moveItem(items, 2, 2), ['d', 'b', 'c', 'a']);
});
