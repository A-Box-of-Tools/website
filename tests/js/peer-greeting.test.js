import test from 'node:test';
import assert from 'node:assert/strict';
import { createChannelGreeting } from '../../shared/js/peer-greeting.js';

test('channel greeting repairs either lost opening frame with at most two sends per peer', async t => {
  for (const first of [0, 1]) await t.test(`peer ${first} opens first`, () => {
    const ready = [false, false], sent = [0, 0], accepted = [0, 0], pending = [], dropped = [];
    const greetings = [0, 1].map(side => createChannelGreeting({
      current: () => true,
      send() {
        sent[side]++;
        if (ready[1 - side]) pending.push(1 - side);
        else dropped.push(side);
      },
      failed: assert.fail,
    }));
    const open = side => { ready[side] = true; assert.equal(greetings[side].open(), true); };
    open(first); open(1 - first);
    let delivered = 0;
    while (pending.length) {
      assert.ok(++delivered <= 4, 'greeting echoes must terminate');
      const side = pending.shift();
      assert.equal(greetings[side].open(), true);
      if (greetings[side].receive()) accepted[side]++;
    }
    assert.deepEqual(dropped, [first]);
    assert.deepEqual(sent, [2, 2]);
    assert.deepEqual(accepted, [1, 1]);
    for (let duplicate = 0; duplicate < 20; duplicate++) for (const greeting of greetings) {
      assert.equal(greeting.open(), true);
      assert.equal(greeting.receive(), false);
    }
    assert.deepEqual(sent, [2, 2]);
  });
});

test('channel greeting handles synchronous reentrant replies without repeating either acceptance', () => {
  const sent = [0, 0], accepted = [0, 0];
  const greetings = [0, 1].map(side => createChannelGreeting({
    current: () => true,
    send() {
      assert.ok(++sent[side] <= 2, 'a reentrant echo must not loop');
      const other = greetings[1 - side];
      if (other.open() && other.receive()) accepted[1 - side]++;
    },
    failed: assert.fail,
  }));
  assert.equal(greetings[0].open(), true);
  assert.deepEqual(sent, [2, 2]);
  assert.deepEqual(accepted, [1, 1]);
});

test('channel greeting requires opening before receiving and tolerates the later open callback', () => {
  let sent = 0;
  const greeting = createChannelGreeting({ current: () => true, send: () => { sent++; }, failed: assert.fail });
  assert.equal(greeting.receive(), false);
  assert.equal(sent, 0);
  // The message handler can open before the browser's queued open callback.
  assert.equal(greeting.open(), true);
  assert.equal(greeting.receive(), true);
  assert.equal(greeting.open(), true);
  assert.equal(greeting.receive(), false);
  assert.equal(sent, 2);
});

test('channel greeting never continues after the caller retires during either send', async t => {
  for (const retirement of [1, 2]) await t.test(`retire during send ${retirement}`, () => {
    let current = true, sent = 0;
    const greeting = createChannelGreeting({
      current: () => current,
      send() { if (++sent === retirement) current = false; },
      failed: assert.fail,
    });
    assert.equal(greeting.open(), retirement !== 1);
    assert.equal(greeting.receive(), false);
    assert.equal(greeting.open(), false);
    assert.equal(greeting.receive(), false);
    assert.equal(sent, retirement);
  });
});

test('channel greeting does not send or accept a greeting for an already retired peer', () => {
  const greeting = createChannelGreeting({ current: () => false, send: assert.fail, failed: assert.fail });
  assert.equal(greeting.open(), false);
  assert.equal(greeting.receive(), false);
});

test('channel greeting send failures are terminal even when failure handling keeps the peer current', async t => {
  for (const failureAt of [1, 2]) await t.test(`fail during send ${failureAt}`, () => {
    const failure = new Error('send failed'), failures = [];
    let sent = 0, greeting;
    greeting = createChannelGreeting({
      current: () => true,
      send() { if (++sent === failureAt) throw failure; },
      failed(error) {
        failures.push(error);
        assert.equal(greeting.open(), false, 'failure is terminal before notifying the owner');
        assert.equal(greeting.receive(), false);
      },
    });
    assert.equal(greeting.open(), failureAt !== 1);
    assert.equal(greeting.receive(), false);
    assert.equal(greeting.open(), false);
    assert.equal(greeting.receive(), false);
    assert.equal(sent, failureAt);
    assert.deepEqual(failures, [failure]);
  });
});

test('channel greeting observes retirement during a synchronous echo callback', () => {
  let current = true, sends = 0, greeting;
  greeting = createChannelGreeting({
    current: () => current,
    send() {
      sends++;
      if (sends === 2) {
        assert.equal(greeting.receive(), false);
        current = false;
      }
    },
    failed: assert.fail,
  });
  assert.equal(greeting.open(), true);
  assert.equal(greeting.receive(), false, 'a retired peer must not request approval');
  assert.equal(greeting.open(), false);
  assert.equal(sends, 2);
});
