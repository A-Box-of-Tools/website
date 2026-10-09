/** Reader payloads and ownership of camera requests that finish out of order. */

import test from 'node:test';
import assert from 'node:assert/strict';
import { makeQr } from '../../shared/js/qr.js';
import { scan } from '../../tools/qr-barcode-reader/src/scan.js';
import { describe } from '../../tools/qr-barcode-reader/src/payload.js';
import { session } from '../../tools/qr-barcode-reader/src/camera.js';
import { renderQr } from './code-pictures.js';

const say = (key) => key;

// The picture must decode before interpretation is on trial. These inputs used
// to turn a successfully read symbol into the page's broken-picture message.
test('malformed percent fields remain readable through QR scanning', () => {
  for (const text of [
    'mailto:%', 'mailto:alice%2', 'mailto:%C3%28',
    'otpauth://totp/%?secret=EXAMPLE', 'otpauth://totp/%FF?secret=EXAMPLE',
  ]) {
    const qr = makeQr(text, { level: 'M' }, say);
    const found = scan(renderQr(qr, 6));
    assert.equal(found?.text, text, 'the original decoded text is retained');
    assert.ok(found.payload.warnings.some((warning) => warning.key === 'warn.percent-encoding'));
    assert.equal(found.payload.link, null, 'an invalid address is not offered for opening');
    const key = text.startsWith('mailto:') ? 'field.to' : 'field.account';
    const original = text.startsWith('mailto:') ? text.slice(7) : text.split('/totp/')[1].split('?')[0];
    assert.equal(found.payload.rows.find((entry) => entry.key === key).value, original);
  }
});

test('valid escaped recipients and authenticator accounts still decode normally', () => {
  const email = describe('mailto:alice%40example.com?subject=Hello%20there').payload;
  assert.equal(email.rows.find((entry) => entry.key === 'field.to').value, 'alice@example.com');
  assert.equal(email.rows.find((entry) => entry.key === 'field.subject').value, 'Hello there');
  assert.equal(email.link.href, 'mailto:alice%40example.com?subject=Hello%20there');
  assert.deepEqual(email.warnings, []);
  const otp = describe('otpauth://totp/My%20account?secret=EXAMPLE').payload;
  assert.equal(otp.rows.find((entry) => entry.key === 'field.account').value, 'My account');
  assert.deepEqual(otp.warnings.map((warning) => warning.key), ['warn.otp-secret']);
});

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function cameraStream() {
  const track = { stops: 0, stop() { this.stops += 1; } };
  const stream = { getTracks: () => [track] };
  return { stream, track };
}

test('Stop closes a permission stream that arrives afterward', async () => {
  const request = deferred();
  const owner = session({ request: () => request.promise });
  const pending = owner.open();
  owner.stop();
  const late = cameraStream();
  request.resolve(late.stream);
  assert.equal(await pending, null);
  assert.equal(late.track.stops, 1);
  assert.equal(owner.isCurrent(late.stream), false);
});

test('a newer camera request owns the stream even when an older one resolves last', async () => {
  const requests = [deferred(), deferred()];
  const options = [];
  const owner = session({ request: (asked) => {
    options.push(asked);
    return requests[options.length - 1].promise;
  } });
  const first = owner.open({ deviceId: 'first' });
  const second = owner.open({ deviceId: 'second' });
  const old = cameraStream();
  const current = cameraStream();
  requests[1].resolve(current.stream);
  assert.equal(await second, current.stream);
  requests[0].resolve(old.stream);
  assert.equal(await first, null);
  assert.equal(old.track.stops, 1);
  assert.equal(current.track.stops, 0);
  assert.equal(owner.isCurrent(current.stream), true);
  assert.deepEqual(options, [{ deviceId: 'first' }, { deviceId: 'second' }]);
  owner.stop();
  assert.equal(current.track.stops, 1);
});

test('a replacement request stops the active camera before permission resolves', async () => {
  const replacement = deferred();
  const active = cameraStream();
  let calls = 0;
  const owner = session({ request: () => ++calls === 1 ? active.stream : replacement.promise });
  assert.equal(await owner.open(), active.stream);
  const pending = owner.open();
  assert.equal(active.track.stops, 1);
  assert.equal(owner.isCurrent(active.stream), false);
  owner.stop();
  const late = cameraStream();
  replacement.resolve(late.stream);
  assert.equal(await pending, null);
  assert.equal(late.track.stops, 1);
});

test('an obsolete permission rejection cannot close a newer camera', async () => {
  const requests = [deferred(), deferred()];
  let calls = 0;
  const owner = session({ request: () => requests[calls++].promise });
  const first = owner.open();
  const second = owner.open();
  const current = cameraStream();
  requests[1].resolve(current.stream);
  await second;
  requests[0].reject(Object.assign(new Error('denied'), { name: 'NotAllowedError' }));
  assert.equal(await first, null);
  assert.equal(owner.isCurrent(current.stream), true);
  assert.equal(current.track.stops, 0);
  owner.stop();
});

test('a current permission error keeps its original reason', async () => {
  const failure = Object.assign(new Error('denied'), { name: 'NotAllowedError' });
  const owner = session({ request: () => Promise.reject(failure) });
  await assert.rejects(owner.open(), (error) => error === failure);
});
