import test from 'node:test';
import assert from 'node:assert/strict';
import { PairingSocket } from '../../shared/js/peer-pairing.js';

function fixture(options = {}) {
  let live = true, next = 0;
  const pending = new Map(), history = new Map(), sent = [], closes = [], errors = [];
  const clock = {
    setTimeout(callback, delay) {
      const id = ++next;
      const timer = { callback, delay };
      pending.set(id, timer); history.set(id, timer);
      return id;
    },
    clearTimeout(id) { pending.delete(id); },
  };
  const socket = {
    readyState: 1, bufferedAmount: 0,
    send(frame) { sent.push(frame); },
    close(code) { closes.push(code); this.onclose?.({ code }); },
  };
  const pairing = new PairingSocket(socket, {
    current: () => live, clock, onSendError: (error) => errors.push(error), ...options,
  });
  return {
    pairing, socket, pending, history, sent, closes, errors,
    retire() { live = false; },
    fire(id) {
      const timer = pending.get(id);
      if (!timer) return;
      pending.delete(id);
      timer.callback();
    },
    stale(id) { history.get(id).callback(); },
  };
}

test('the default clock preserves the browser receiver for native timers', (t) => {
  let next = 0;
  const pending = new Map(), calls = [];
  t.mock.method(globalThis, 'setTimeout', function(callback, delay) {
    assert.ok(this === undefined || this === globalThis, 'native timer received a foreign receiver');
    const id = ++next;
    pending.set(id, { callback, delay });
    return id;
  });
  t.mock.method(globalThis, 'clearTimeout', function(id) {
    assert.ok(this === undefined || this === globalThis, 'native timer cancellation received a foreign receiver');
    pending.delete(id);
  });
  const socket = { readyState: 1, send() {}, close() {} };
  const pairing = new PairingSocket(socket);
  const opening = pairing.after('opening', 20, () => calls.push('opening'));
  assert.equal(pending.get(opening).delay, 20);
  const heartbeat = pairing.every('heartbeat', 25, () => calls.push('heartbeat'));
  const tick = pending.get(heartbeat).callback;
  pending.delete(heartbeat); tick();
  assert.deepEqual(calls, ['heartbeat']);
  assert.equal(pending.size, 2);
  assert.equal(pairing.probe({ timeout: 8 }), true);
  assert.equal(pending.size, 3);
  pairing.cancelProbe();
  pairing.clear('opening');
  pairing.close();
  assert.equal(pending.size, 0);
});

test('paired frames preserve their wire form and cannot send through stale, closed or backed-up sockets', () => {
  const f = fixture({ maxBuffered: 8 });
  assert.equal(f.pairing.send('ping'), true);
  assert.equal(f.pairing.send({ type: 'hello', value: 2 }), true);
  assert.deepEqual(f.sent, ['ping', '{"type":"hello","value":2}']);
  f.socket.bufferedAmount = 9;
  assert.equal(f.pairing.send('blocked'), false);
  f.socket.bufferedAmount = 0; f.socket.readyState = 0;
  assert.equal(f.pairing.send('connecting'), false);
  f.socket.readyState = 3;
  assert.equal(f.pairing.send('closed'), false);
  f.socket.readyState = 1; f.retire();
  assert.equal(f.pairing.send('stale'), false);
  assert.equal(f.sent.length, 2);
  assert.deepEqual(f.errors, []);
});

test('a failed native send is reported once without leaving a probe deadline behind', () => {
  const f = fixture();
  const failure = new Error('Socket unavailable');
  f.socket.send = () => { throw failure; };
  assert.equal(f.pairing.probe({ timeout: 10, onTimeout() { assert.fail('unsent probe expired'); } }), false);
  assert.deepEqual(f.errors, [failure]);
  assert.equal(f.pairing.probing, false);
  assert.equal(f.pending.size, 0);
  f.stale(1);
  assert.deepEqual(f.errors, [failure]);
});

test('unserializable frames use the send-error path without touching the native socket', () => {
  const f = fixture(), frame = {};
  frame.self = frame;
  assert.equal(f.pairing.send(frame), false);
  assert.equal(f.errors.length, 1);
  assert.deepEqual(f.sent, []);
});

test('native adapter events remain unchanged and stale or replaced listeners cannot dispatch', () => {
  const f = fixture(), received = [];
  f.pairing.listen(Object.fromEntries(['open', 'message', 'close', 'error'].map(type => [
    type, event => received.push([type, event]),
  ])));
  for (const type of ['open', 'message', 'close', 'error']) {
    const event = { type, data: 'setup', code: 1006 };
    f.socket['on' + type](event);
    assert.equal(received.at(-1)[1], event);
  }
  const oldMessage = f.socket.onmessage;
  f.pairing.listen({ message: event => received.push(['new', event]) });
  oldMessage({ data: 'old listener' });
  assert.equal(received.length, 4);
  f.socket.onmessage({ data: 'new listener' });
  assert.equal(received.at(-1)[0], 'new');
  f.retire();
  f.socket.onmessage({ data: 'stale session' });
  assert.equal(received.length, 5);
});

test('a named deadline replaces even an already queued predecessor', () => {
  const f = fixture(), calls = [];
  const first = f.pairing.after('opening', 20, () => calls.push('first'));
  const second = f.pairing.after('opening', 30, () => calls.push('second'));
  assert.equal(f.pending.has(first), false);
  f.stale(first);
  assert.deepEqual(calls, []);
  f.fire(second);
  assert.deepEqual(calls, ['second']);
  f.stale(second);
  assert.deepEqual(calls, ['second']);
  const third = f.pairing.after('opening', 10, () => calls.push('cleared'));
  f.pairing.clear('opening'); f.stale(third);
  assert.deepEqual(calls, ['second']);
});

test('periodic work uses timeout-only clocks and can clear or replace itself safely', () => {
  const f = fixture(), calls = [];
  const first = f.pairing.every('heartbeat', 25, () => calls.push('ping'));
  f.fire(first);
  assert.deepEqual(calls, ['ping']);
  const second = [...f.pending.keys()][0];
  assert.notEqual(second, first);
  assert.equal(f.pending.get(second).delay, 25);
  f.pairing.every('heartbeat', 10, () => {
    calls.push('last');
    f.pairing.clear('heartbeat');
  });
  f.stale(second);
  assert.deepEqual(calls, ['ping']);
  f.fire([...f.pending.keys()][0]);
  assert.deepEqual(calls, ['ping', 'last']);
  assert.equal(f.pending.size, 0);
});

test('stale session deadlines and heartbeats cannot invoke work or reschedule', () => {
  const f = fixture();
  const deadline = f.pairing.after('opening', 20, () => assert.fail('stale deadline'));
  const heartbeat = f.pairing.every('heartbeat', 25, () => assert.fail('stale heartbeat'));
  f.retire();
  f.fire(deadline); f.fire(heartbeat);
  assert.equal(f.pending.size, 0);
  assert.equal(f.pairing.after('new', 1, () => {}), null);
  assert.equal(f.pairing.every('new', 1, () => {}), null);
});

test('coalesced probes keep the original ping, acceptance rule and deadline', () => {
  const f = fixture(), calls = [];
  f.pairing.listen({ message: event => calls.push([event.data, f.pairing.probing]) });
  assert.equal(f.pairing.probe({
    timeout: 8, accept: data => data === 'lease-pong', onTimeout: () => calls.push('original timeout'),
  }), true);
  const deadline = [...f.pending.keys()][0];
  assert.equal(f.pairing.probe({ timeout: 80, accept: () => true, onTimeout: () => calls.push('replacement timeout') }), true);
  assert.deepEqual(f.sent, ['ping']);
  assert.equal(f.pending.get(deadline).delay, 8);
  f.socket.onmessage({ data: 'setup' });
  assert.deepEqual(calls, [['setup', true]]);
  f.fire(deadline);
  assert.equal(f.pairing.probing, false);
  assert.deepEqual(calls, [['setup', true], 'original timeout']);
  f.stale(deadline);
  assert.equal(calls.length, 2);
});

test('an accepted probe reply cancels its deadline before reaching the adapter', () => {
  const f = fixture(), calls = [];
  f.pairing.listen({ message: event => calls.push([event, f.pairing.probing]) });
  f.pairing.probe({ timeout: 8, onTimeout: () => assert.fail('accepted probe expired') });
  const deadline = [...f.pending.keys()][0], event = { data: 'pong' };
  f.socket.onmessage(event);
  assert.deepEqual(calls, [[event, false]]);
  assert.equal(f.pending.size, 0);
  f.stale(deadline);
  assert.equal(calls.length, 1);
});

test('canceled, failed and stale probes cannot expire into a replacement session', () => {
  const f = fixture();
  f.pairing.probe({ timeout: 8, onTimeout: () => assert.fail('canceled probe expired') });
  const first = [...f.pending.keys()][0];
  f.pairing.cancelProbe();
  f.pairing.probe({ timeout: 9, onTimeout: () => assert.fail('stale probe expired') });
  const second = [...f.pending.keys()][0];
  f.stale(first);
  assert.equal(f.pairing.probing, true);
  f.retire(); f.fire(second);
  assert.equal(f.pairing.probing, false);
  assert.equal(f.pairing.probe({ timeout: 1 }), false);
  assert.deepEqual(f.sent, ['ping', 'ping']);
});

test('explicit close retires callbacks before native close and clears only owned listeners', () => {
  const f = fixture(), calls = [];
  f.pairing.listen({ close: () => calls.push('closed'), message: () => calls.push('message') });
  const staleMessage = f.socket.onmessage, staleClose = f.socket.onclose;
  const deadline = f.pairing.after('opening', 10, () => calls.push('deadline'));
  const heartbeat = f.pairing.every('heartbeat', 20, () => calls.push('heartbeat'));
  f.pairing.probe({ timeout: 8, onTimeout: () => calls.push('probe') });
  const probe = [...f.pending.keys()].at(-1);
  const replacement = () => calls.push('replacement');
  f.socket.onmessage = replacement;
  f.pairing.close(1001);
  assert.equal(f.pairing.isCurrent(), false);
  assert.equal(f.socket.onmessage, replacement);
  assert.equal(f.socket.onclose, null);
  assert.equal(f.pending.size, 0);
  assert.equal(f.pairing.probing, false);
  assert.deepEqual(f.closes, [1001]);
  staleMessage({ data: 'late' }); staleClose({ code: 1006 });
  f.stale(deadline); f.stale(heartbeat); f.stale(probe);
  assert.deepEqual(calls, []);
  assert.equal(f.pairing.send('late'), false);
  f.pairing.close();
  assert.deepEqual(f.closes, [1001]);
});
