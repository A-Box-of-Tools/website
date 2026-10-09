import test from 'node:test';
import assert from 'node:assert/strict';
import { readChartPicture } from '../../tools/compare-heights/src/chart-picture-read.js';
import { orderedLoads } from '../../shared/js/ordered-loads.js';

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function environment(t, options = {}) {
  const saved = { document: globalThis.document, createImageBitmap: globalThis.createImageBitmap,
    DOMParser: globalThis.DOMParser };
  t.after(() => { for (const [key, value] of Object.entries(saved)) {
    if (value === undefined) delete globalThis[key]; else globalThis[key] = value;
  } });
  const canvases = [], stages = [], groups = [], decodes = [];
  globalThis.createImageBitmap = file => { decodes.push(file.name); return file.decoding.promise; };
  globalThis.document = {
    body: { append() {} },
    createElement() {
      const canvas = { width: 0, height: 0, getContext: () => ({ drawImage() {} }),
        toDataURL() { if (options.failEncode) throw Error('native "encode]" error');
          return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg=='; } };
      canvases.push(canvas); return canvas;
    },
    createElementNS(_namespace, tag) {
      const element = { style: {}, removed: 0, setAttribute() {}, append() {},
        remove() { this.removed++; }, getBBox() {
          if (options.failBox) throw Error('native box'); return { x: 0, y: 0, width: 30, height: 60 };
        } };
      (tag === 'svg' ? stages : groups).push(element); return element;
    },
  };
  const rect = { tagName: 'rect', attributes: [{ name: 'width', value: '30' },
    { name: 'height', value: '60' }], children: [] };
  globalThis.DOMParser = class { parseFromString() { return { querySelector: () => null,
    documentElement: { tagName: 'svg', attributes: [], children: [rect] } }; } };
  const file = name => ({ name, size: 100, type: 'image/png', decoding: deferred(),
    bitmap: { width: 120, height: 80, closed: 0, close() { this.closed++; } } });
  return { canvases, stages, groups, decodes, file, options };
}

test('a retired bitmap decode closes before allocating or encoding chart pixels', async t => {
  const e = environment(t), file = e.file('late.png'), owner = new AbortController();
  const work = readChartPicture(file, owner.signal); owner.abort();
  file.decoding.resolve(file.bitmap);
  await assert.rejects(work, error => error.name === 'AbortError');
  assert.equal(file.bitmap.closed, 1);
  assert.equal(e.canvases.length, 0);
});

test('successful and failed native PNG encoding release their owned canvas and bitmap', async t => {
  const e = environment(t);
  for (const failEncode of [false, true]) {
    e.options.failEncode = failEncode;
    const file = e.file('picture.png');
    const work = readChartPicture(file); file.decoding.resolve(file.bitmap);
    if (failEncode) await assert.rejects(work, /encode/);
    else {
      const result = await work;
      assert.equal(result.shape.width, 1.5);
      assert.match(result.shape.markup, /href="data:image\/png;base64,/);
    }
    assert.equal(file.bitmap.closed, 1);
    assert.deepEqual([e.canvases.at(-1).width, e.canvases.at(-1).height], [0, 0]);
  }
});

test('a refused native bitmap size closes without creating a canvas', async t => {
  const e = environment(t), file = e.file('tiny.png'); file.bitmap.width = 1;
  const work = readChartPicture(file); file.decoding.resolve(file.bitmap);
  assert.equal((await work).error, 'image.unreadable');
  assert.equal(file.bitmap.closed, 1);
  assert.equal(e.canvases.length, 0);
});

test('retiring delayed SVG bytes prevents document parsing and measurement DOM', async t => {
  const e = environment(t), text = deferred(), owner = new AbortController();
  const work = readChartPicture({ name: 'late.svg', size: 100, text: () => text.promise }, owner.signal);
  owner.abort(); text.resolve('<svg/>');
  await assert.rejects(work, error => error.name === 'AbortError');
  assert.equal(e.stages.length, 0);
});

test('SVG measurement success and native failure remove both sanitized measurement nodes', async t => {
  const e = environment(t);
  for (const failBox of [false, true]) {
    e.options.failBox = failBox;
    const work = readChartPicture({ name: 'drawing.svg', size: 100, text: async () => '<svg/>' });
    if (failBox) await assert.rejects(work, /box/);
    else {
      const result = await work;
      assert.equal(result.shape.width, 0.5);
      assert.equal(result.name, 'drawing');
    }
    assert.equal(e.stages.at(-1).removed, 1);
    assert.equal(e.groups.at(-1).removed, 1);
  }
});

test('ordered additive reads keep selection order and a reset starts new work before retired decoding settles', async t => {
  const e = environment(t), names = [], pending = [];
  const loads = orderedLoads({ read: request => readChartPicture(request.file, request.owner.signal),
    complete: ({ items, errors }) => { assert.deepEqual(errors, []); names.push(...items.map(item => item.name)); },
    status: count => pending.push(count) });
  const request = name => ({ file: e.file(name), owner: new AbortController() });
  const first = request('first.png'), second = request('second.png');
  const a = loads.add([first]), b = loads.add([second]);
  second.file.decoding.resolve(second.file.bitmap);
  await Promise.resolve();
  assert.deepEqual(e.decodes, ['first.png']);
  first.file.decoding.resolve(first.file.bitmap); await a; await b;
  assert.deepEqual(names, ['first', 'second']);
  const old = request('old.png'), current = request('current.png');
  const c = loads.add([old]); await Promise.resolve();
  old.owner.abort(); loads.reset();
  const d = loads.add([current]); await Promise.resolve();
  old.file.decoding.resolve(old.file.bitmap); await c;
  assert.equal(loads.pending, 1);
  current.file.decoding.resolve(current.file.bitmap); await d;
  assert.deepEqual(names, ['first', 'second', 'current']);
  assert.equal(old.file.bitmap.closed, 1);
  assert.equal(pending.at(-1), 0);
});
