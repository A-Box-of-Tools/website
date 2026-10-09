/** Export scheduling and ownership are testable without pretending to scale pixels. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { captureIconRequest, makeIconOutput, iconErrorDetail } from '../../tools/image-to-ico/src/icon-export.js';
import { readIcoDirectory } from '../../tools/image-to-ico/src/ico.js';
import { readIcnsElements, ICNS_TYPES } from '../../tools/image-to-ico/src/icns.js';
import { PACK_IMAGES } from '../../tools/image-to-ico/src/pack.js';
import { square } from '../../tools/image-to-ico/src/render.js';

const say = (key, values = {}) => JSON.stringify({ key, values });
const file = Object.freeze({ name: 'logo.png' });
const items = () => [{ id: 1, file, width: 128, height: 64 }];
const settings = (want = { ico: true, icns: false, pack: false }) => ({
  want, sizes: [16, 32, 48], preset: 'website', storage: 'png',
  fit: 'pad', background: null,
});
const pngBytes = () => Uint8Array.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, ...new Array(32).fill(0),
]);
const deferred = () => {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
};

function renderer() {
  const canvases = [];
  const decodes = [];
  const draws = [];
  const encodes = [];
  const released = [];
  return {
    canvases, decodes, draws, encodes, released,
    async decode(source) {
      const decoded = { bitmap: { alive: true }, width: 128, height: 64, vector: false, source };
      decodes.push(decoded);
      return decoded;
    },
    release(decoded) { decoded.bitmap.alive = false; released.push(decoded); },
    square(bitmap, width, height, px, options) {
      assert.equal(bitmap.alive, true, 'export pixels must still be owned while drawing');
      const canvas = { width: px, height: px };
      canvases.push(canvas);
      draws.push({ bitmap, width, height, px, options: { ...options } });
      return canvas;
    },
    pixels(canvas) {
      return { width: canvas.width, height: canvas.height,
        data: new Uint8Array(canvas.width * canvas.height * 4).fill(255) };
    },
    async png(canvas) { encodes.push(canvas.width); return pngBytes(); },
  };
}
const retired = (rendering) => {
  assert.equal(rendering.released.length, rendering.decodes.length);
  assert.ok(rendering.decodes.every((decoded) => !decoded.bitmap.alive));
  assert.ok(rendering.canvases.every((canvas) => canvas.width === 0 && canvas.height === 0));
};

test('a complete icon request keeps batch identity and every setting before a yield', () => {
  const sources = items();
  const options = settings({ ico: true, icns: true, pack: true });
  const request = captureIconRequest(sources, options);
  sources[0].width = 9;
  sources[0].file = { name: 'replacement.png' };
  sources.push({ id: 2, file });
  options.sizes.splice(0, 3, 256);
  options.want.ico = false;
  Object.assign(options, { preset: 'legacy', storage: 'bmp', fit: 'crop', background: '#ff00ff' });
  assert.equal(request.batch.length, 1);
  assert.equal(request.batch[0].file, file);
  assert.equal(request.batch[0].width, 128);
  assert.deepEqual(request.sizes, [16, 32, 48]);
  assert.deepEqual(request.drawSizes, [16, 32, 48, 64, 128, 256, 512, 1024]);
  assert.deepEqual(request.want, { ico: true, icns: true, pack: true });
  assert.equal(request.preset, 'website');
  assert.equal(request.storage, 'png');
  assert.equal(request.fit, 'pad');
  assert.equal(request.background, null);
  assert.equal(request.website, true);
  for (const value of [request, request.batch, request.batch[0], request.want, request.sizes, request.drawSizes]) {
    assert.ok(Object.isFrozen(value));
  }
});

test('pending export survives preview retirement and uses captured settings for later pack draws', async () => {
  const options = settings({ ico: true, icns: false, pack: true });
  const request = captureIconRequest(items(), options);
  const rendering = renderer();
  const entered = deferred();
  const resume = deferred();
  const native = rendering.png;
  rendering.png = async (canvas) => { entered.resolve(); await resume.promise; return native(canvas); };
  const preview = { bitmap: { alive: true } };
  const resultPromise = makeIconOutput(request.batch[0], request, say, rendering);
  await entered.promise;
  preview.bitmap.alive = false;
  Object.assign(options, { fit: 'crop', background: '#ff00ff', storage: 'bmp' });
  options.want.pack = false;
  options.sizes.splice(0, 3, 256);
  assert.notEqual(rendering.decodes[0].bitmap, preview.bitmap);
  assert.equal(rendering.decodes[0].bitmap.alive, true);
  resume.resolve();
  const result = await resultPromise;
  assert.equal(result.request, request);
  assert.equal(result.packed, true);
  assert.deepEqual(readIcoDirectory(result.outputs[0].data).map(({ width, kind }) => [width, kind]),
    [[16, 'png'], [32, 'png'], [48, 'png']]);
  assert.ok(rendering.draws.every(({ options: draw }) => draw.fit === 'pad'));
  const packDraws = rendering.draws.slice(3);
  assert.equal(packDraws.length, PACK_IMAGES.length);
  assert.equal(packDraws.find(({ px, options: draw }) => px === 180 && !draw.inset).options.background, '#ffffff');
  assert.equal(packDraws.find(({ options: draw }) => draw.inset === 0.1).options.background, '#ffffff');
  assert.ok(packDraws.filter(({ options: draw }) => !draw.background).length > 0);
  retired(rendering);
});

test('shared ICO and ICNS sizes are encoded once and both directories read back their actual entries', async () => {
  const request = captureIconRequest(items(), settings({ ico: true, icns: true, pack: false }));
  const rendering = renderer();
  const result = await makeIconOutput(request.batch[0], request, say, rendering);
  assert.deepEqual([...rendering.encodes].sort((a, b) => a - b), request.drawSizes);
  assert.equal(result.outputs.length, 2);
  assert.equal(readIcoDirectory(result.outputs[0].data).length, 3);
  assert.deepEqual(readIcnsElements(result.outputs[1].data).map(({ type }) => type),
    ICNS_TYPES.map(({ type }) => type));
  retired(rendering);
});

test('ICO and pack encoder refusals retire all call-owned pixels before rejecting', async () => {
  for (const pack of [false, true]) {
    const request = captureIconRequest(items(), settings({ ico: !pack, icns: false, pack }));
    const rendering = renderer();
    const native = rendering.png;
    let calls = 0;
    const refusal = new Error('png.refused');
    rendering.png = async (canvas) => {
      if (++calls === 2) throw refusal;
      return native(canvas);
    };
    await assert.rejects(makeIconOutput(request.batch[0], request, say, rendering),
      (error) => error === refusal);
    assert.equal(calls, 2);
    retired(rendering);
  }
});

test('pack-only requests make all website files without inventing ICO entries', async () => {
  const request = captureIconRequest(items(), settings({ ico: false, icns: false, pack: true }));
  const rendering = renderer();
  const result = await makeIconOutput(request.batch[0], request, say, rendering);
  assert.deepEqual(request.drawSizes, []);
  assert.deepEqual(result.outputs, []);
  assert.equal(result.files.length, PACK_IMAGES.length + 4);
  assert.ok(!result.files.some(({ name }) => name.endsWith('.ico')));
  assert.equal(result.files.find(({ name }) => name === 'README.txt').data instanceof Uint8Array, true);
  retired(rendering);
});

test('failed square and intermediate draws retire only their allocated canvases', () => {
  const original = globalThis.document;
  try {
    for (const failAt of [1, 2, 5]) {
      const canvases = [];
      let calls = 0;
      globalThis.document = {
        createElement() {
          const canvas = { width: 0, height: 0, getContext: () => ({
            drawImage() { if (++calls === failAt) throw new Error('draw refused'); },
          }) };
          canvases.push(canvas);
          return canvas;
        },
      };
      const source = { width: 1024, height: 1024 };
      assert.throws(() => square(source, 1024, 1024, 16,
        { fit: 'pad', background: null }), /draw refused/);
      assert.equal(source.width, 1024);
      assert.equal(source.height, 1024);
      assert.ok(canvases.every((canvas) => canvas.width === 0 && canvas.height === 0));
    }
  } finally {
    if (original === undefined) delete globalThis.document;
    else globalThis.document = original;
  }
});


test('only known renderer refusal keys enter translated markup lookup', () => {
  const values = { name: 'logo.png' };
  const lookups = [];
  const translate = (key, supplied) => { lookups.push([key, supplied]); return 'translated'; };
  for (const message of ['decode.failed', 'png.refused']) {
    assert.equal(iconErrorDetail({ message, values }, translate), 'translated');
  }
  assert.deepEqual(lookups, [['decode.failed', values], ['png.refused', values]]);
  const native = 'Native draw refused: "logo[1].png" [invalid source]';
  assert.equal(iconErrorDetail(new Error(native), () => { throw new Error('unsafe lookup'); }), native);
});
