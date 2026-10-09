/**
 * A result's explanation must keep the settings that made it. In particular,
 * hidden settings from other modes and JPEG quality on a PNG must not leak into
 * the sentence a visitor reads beside the saved image.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { runContext } from '../../tools/stack-images/src/run-context.js';

const request = (values = {}) => ({
  mode: 'mean', align: 'translate', scale: 0.5, gain: 1.25,
  format: 'jpeg', quality: 0.85, kappa: 2, radius: 3, ...values,
});

test('saved stack context detaches the request values from later settings', () => {
  const saved = request();
  const context = runContext(saved);
  saved.mode = 'focus';
  saved.align = 'none';
  saved.scale = 0.25;
  saved.gain = 2;
  saved.format = 'png';
  saved.quality = 0.5;
  assert.deepEqual(context, {
    method: 'result.method.mean', alignment: 'result.alignment.translate',
    resolution: 'result.resolution.half', gain: 1.25,
    encoding: { key: 'result.encoding.jpeg', values: { quality: 85 } },
    parameter: null,
  });
});

test('PNG context never reads or reports a hidden JPEG quality setting', () => {
  const saved = request({ format: 'png' });
  Object.defineProperty(saved, 'quality', { get() { throw new Error('unused JPEG quality read'); } });
  assert.deepEqual(runContext(saved).encoding, { key: 'result.encoding.png', values: {} });
  assert.deepEqual(runContext(request({ quality: 0.926 })).encoding,
    { key: 'result.encoding.jpeg', values: { quality: 93 } });
});

test('sigma and focus describe only the parameter their method uses', () => {
  const sigma = request({ mode: 'sigma', kappa: 1.7 });
  Object.defineProperty(sigma, 'radius', { get() { throw new Error('unused focus radius read'); } });
  assert.deepEqual(runContext(sigma).parameter,
    { key: 'result.settings.sigma', values: { kappa: '1.7' } });
  const focus = request({ mode: 'focus', radius: 7 });
  Object.defineProperty(focus, 'kappa', { get() { throw new Error('unused sigma threshold read'); } });
  assert.deepEqual(runContext(focus).parameter,
    { key: 'result.settings.focus', values: { radius: 7 } });
  for (const mode of ['mean', 'median', 'max', 'min', 'sum']) {
    const saved = request({ mode });
    for (const name of ['kappa', 'radius']) {
      Object.defineProperty(saved, name, { get() { throw new Error('irrelevant method parameter read'); } });
    }
    assert.equal(runContext(saved).parameter, null, mode);
  }
});

test('the run explains exposure with the same precision as the settings readout', () => {
  assert.equal(runContext(request({ gain: 1 / 20 })).gain, 0.05);
  assert.equal(runContext(request({ gain: 1 / 3 })).gain, 0.3333);
  assert.equal(runContext(request({ gain: 0 })).gain, 0);
});

test('every offered alignment and resolution has its own result label', () => {
  for (const [align, expected] of [
    ['projective', 'result.alignment.projective'], ['translate', 'result.alignment.translate'],
    ['similarity', 'result.alignment.similarity'], ['none', 'result.alignment.none'],
  ]) assert.equal(runContext(request({ align })).alignment, expected);
  for (const [scale, expected] of [
    [1, 'result.resolution.full'], [0.5, 'result.resolution.half'], [0.25, 'result.resolution.quarter'],
  ]) assert.equal(runContext(request({ scale })).resolution, expected);
});
