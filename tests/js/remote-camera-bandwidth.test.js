import test from 'node:test';
import assert from 'node:assert/strict';
import { setImmediate as nextTurn } from 'node:timers/promises';
import { DEFAULT_VIDEO_BUDGET, MAX_VIEWERS, normalizeVideoBudget, videoBitrate, viewerLimit, VideoBandwidth } from '../../tools/remote-camera/src/bandwidth.js';

function deferred() {
  let resolve, reject;
  const promise = new Promise((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
}

function sender(encodings = [{}], kind = 'video') {
  return {
    track: { kind },
    parameters: { transactionId: 'initial', codecs: [{ mimeType: 'video/VP8' }], encodings },
    calls: [],
    getParameters() { return structuredClone(this.parameters); },
    async setParameters(parameters) {
      this.calls.push(structuredClone(parameters));
      this.parameters = structuredClone(parameters);
    },
  };
}

test('video admission and fair caps stay bounded without guessing network capacity', () => {
  assert.equal(DEFAULT_VIDEO_BUDGET, 6_000_000);
  assert.equal(MAX_VIEWERS, 8);
  assert.equal(viewerLimit(1_000_000), 4);
  assert.equal(viewerLimit(2_000_000), 8);
  assert.equal(viewerLimit(10_000_000), 8);
  for (const budget of [1_000_000, 2_000_000, 4_000_000, 6_000_000, 10_000_000]) {
    for (let count = 1; count <= MAX_VIEWERS; count += 1) {
      const cap = videoBitrate(count, budget);
      assert.ok(cap > 0 && cap <= 1_500_000);
      assert.ok(cap * count <= budget);
    }
  }
  assert.equal(videoBitrate(8, 1_000_000), 125_000);
  assert.equal(videoBitrate(0), 0);
  assert.equal(videoBitrate(-1), 0);
  assert.equal(videoBitrate(1.5), 0);
});

test('a malformed video budget cannot remove the cap or exceed supported choices', () => {
  for (const value of [undefined, null, '', NaN, Infinity, -1, 0]) assert.equal(normalizeVideoBudget(value), DEFAULT_VIDEO_BUDGET);
  assert.equal(normalizeVideoBudget(1), 1_000_000);
  assert.equal(normalizeVideoBudget('4000000'), 4_000_000);
  assert.equal(normalizeVideoBudget(99_000_000), 10_000_000);
});

test('approval reserves bandwidth before adding the next sender', async () => {
  const statuses = [], first = { sender: sender() }, next = {};
  const controller = new VideoBandwidth({ onStatus: (status) => statuses.push(status) });
  await controller.update([first], 1_000_000);
  await controller.update([first, next], 1_000_000);
  assert.equal(first.sender.parameters.encodings[0].maxBitrate, 500_000);
  assert.deepEqual(statuses.at(-1), { supported: true, viewers: 2, budget: 1_000_000, bitrate: 500_000 });
  next.sender = sender();
  await controller.update([first, next], 1_000_000);
  assert.equal(next.sender.parameters.encodings[0].maxBitrate, 500_000);
  assert.equal(first.sender.calls.length, 2);
  await controller.update([first], 1_000_000);
  assert.equal(first.sender.parameters.encodings[0].maxBitrate, 1_000_000);
});

test('each encoding keeps its negotiated identity while sharing one viewer cap', async () => {
  const video = sender([{ rid: 'low', active: true, scaleResolutionDownBy: 2 }, { rid: 'high', active: true, scaleResolutionDownBy: 1 }]);
  const original = structuredClone(video.parameters);
  await new VideoBandwidth().update([{ sender: video }], 6_000_000);
  assert.equal(video.parameters.transactionId, original.transactionId);
  assert.deepEqual(video.parameters.codecs, original.codecs);
  assert.deepEqual(video.parameters.encodings, original.encodings.map((encoding) => ({ ...encoding, maxBitrate: 750_000 })));
  assert.equal(video.parameters.encodings.length, 2);
});

test('every changed cap uses fresh browser parameters in the same transaction', async () => {
  const video = sender(), entry = { sender: video };
  let transaction = 0;
  video.getParameters = function () { return { ...structuredClone(this.parameters), transactionId: `transaction-${++transaction}` }; };
  video.setParameters = async function (parameters) {
    assert.equal(parameters.transactionId, `transaction-${transaction}`);
    this.calls.push(structuredClone(parameters));
    this.parameters = structuredClone(parameters);
  };
  const controller = new VideoBandwidth();
  await controller.update([entry], 1_000_000);
  await controller.update([entry], 2_000_000);
  assert.deepEqual(video.calls.map((parameters) => parameters.transactionId), ['transaction-1', 'transaction-3']);
  assert.equal(video.parameters.encodings[0].maxBitrate, 1_500_000);
});

test('video budgets never change audio senders or shared capture tracks', async () => {
  const video = sender(), audio = sender([{}], 'audio');
  const first = { sender: video, audioSender: audio };
  await new VideoBandwidth().update([first], 2_000_000);
  assert.equal(video.calls.length, 1);
  assert.equal(audio.calls.length, 0);
  assert.equal(video.track.kind, 'video');
  assert.equal(audio.track.kind, 'audio');
});

test('unsupported or empty encodings leave transport running and can recover after negotiation', async () => {
  const statuses = [], video = sender([]), entry = { sender: video };
  const controller = new VideoBandwidth({ onStatus: (status) => statuses.push(status) });
  await controller.update([entry]);
  assert.equal(video.calls.length, 0);
  assert.equal(statuses.at(-1).supported, false);
  assert.deepEqual(video.parameters.encodings, []);
  video.parameters.encodings = [{}];
  await controller.update([entry]);
  assert.equal(statuses.at(-1).supported, true);
  video.setParameters = undefined;
  await controller.update([entry], 1_000_000);
  assert.equal(statuses.at(-1).supported, false);
});

test('a rejected sender does not prevent other viewers receiving their caps', async () => {
  const refused = sender(), supported = sender();
  refused.setParameters = async () => { throw new DOMException('Unavailable', 'NotSupportedError'); };
  const controller = new VideoBandwidth();
  const result = await controller.update([{ sender: refused }, { sender: supported }], 2_000_000);
  assert.equal(result.supported, false);
  assert.equal(supported.parameters.encodings[0].maxBitrate, 1_000_000);
});

test('a browser that ignores the requested bitrate is reported as unavailable', async () => {
  const video = sender();
  video.setParameters = async (parameters) => { video.calls.push(parameters); };
  const result = await new VideoBandwidth().update([{ sender: video }]);
  assert.equal(result.supported, false);
});

test('sender updates are serialized and replace waiting budgets with the newest snapshot', async () => {
  const pending = deferred(), video = sender(), statuses = [], entry = { sender: video };
  let active = 0, maximum = 0;
  const nativeSet = video.setParameters;
  video.setParameters = async function (parameters) {
    active += 1; maximum = Math.max(maximum, active);
    if (this.calls.length === 0) { this.calls.push(structuredClone(parameters)); await pending.promise; }
    else this.calls.push(structuredClone(parameters));
    this.parameters = structuredClone(parameters);
    active -= 1;
  };
  const controller = new VideoBandwidth({ onStatus: (status) => statuses.push(status) });
  const work = controller.update([entry], 1_000_000);
  await nextTurn();
  controller.update([entry], 2_000_000);
  controller.update([entry], 4_000_000);
  controller.update([entry], 1_000_000);
  pending.resolve(); await work;
  assert.equal(maximum, 1);
  assert.deepEqual(video.calls.map((parameters) => parameters.encodings[0].maxBitrate), [1_000_000]);
  assert.equal(statuses.length, 1);
  assert.equal(statuses[0].budget, 1_000_000);
  video.setParameters = nativeSet;
});

test('a status-triggered microtask can start a new update after the last snapshot drains', async () => {
  const entry = { sender: sender() }, statuses = [];
  let followup;
  const controller = new VideoBandwidth({ onStatus: (status) => {
    statuses.push(status);
    if (statuses.length === 1) queueMicrotask(() => { followup = controller.update([entry], 2_000_000); });
  } });
  await controller.update([entry], 1_000_000);
  await nextTurn(); await followup;
  assert.deepEqual(statuses.map((status) => status.budget), [1_000_000, 2_000_000]);
  assert.equal(entry.sender.parameters.encodings[0].maxBitrate, 1_500_000);
});

test('an unchanged budget restores a sender cap reset during negotiation', async () => {
  const video = sender(), entry = { sender: video };
  const controller = new VideoBandwidth();
  await controller.update([entry], 1_000_000);
  delete video.parameters.encodings[0].maxBitrate;
  await controller.update([entry], 1_000_000);
  assert.equal(video.parameters.encodings[0].maxBitrate, 1_000_000);
  assert.equal(video.calls.length, 2);
});

test('late updates after a viewer leaves do not report or modify its replacement', async () => {
  const pending = deferred(), old = sender(), replacement = sender(), entry = { sender: old }, statuses = [];
  const nativeSet = old.setParameters;
  old.setParameters = async function (parameters) { await pending.promise; await nativeSet.call(this, parameters); };
  const controller = new VideoBandwidth({ onStatus: (status) => statuses.push(status) });
  const work = controller.update([entry], 1_000_000);
  await nextTurn();
  entry.sender = replacement;
  controller.update([entry], 2_000_000);
  pending.resolve(); await work;
  assert.equal(replacement.parameters.encodings[0].maxBitrate, 1_500_000);
  assert.equal(statuses.length, 1);
  assert.equal(statuses[0].budget, 2_000_000);
});

test('Stop invalidates in-flight work and the controller can serve a new session', async () => {
  const pending = deferred(), first = { sender: sender() }, second = { sender: sender() }, statuses = [];
  let current = first;
  const nativeSet = first.sender.setParameters;
  first.sender.setParameters = async function (parameters) { await pending.promise; await nativeSet.call(this, parameters); };
  const controller = new VideoBandwidth({ current: (entry) => entry === current, onStatus: (status) => statuses.push(status) });
  const work = controller.update([first], 1_000_000);
  await nextTurn();
  controller.clear(); current = second;
  controller.update([second], 2_000_000);
  pending.resolve(); await work;
  assert.equal(statuses.length, 1);
  assert.equal(statuses[0].budget, 2_000_000);
  assert.equal(second.sender.parameters.encodings[0].maxBitrate, 1_500_000);
});

test('cleared work and stale entries cannot publish bandwidth status', async () => {
  const pending = deferred(), first = { sender: sender() }, statuses = [];
  const nativeSet = first.sender.setParameters;
  first.sender.setParameters = async function (parameters) { await pending.promise; await nativeSet.call(this, parameters); };
  const controller = new VideoBandwidth({ onStatus: (status) => statuses.push(status) });
  const work = controller.update([first]); await nextTurn();
  controller.clear(); pending.resolve(); await work;
  assert.deepEqual(statuses, []);
  const empty = await new VideoBandwidth({ current: () => false }).update([first]);
  assert.deepEqual(empty, { supported: true, viewers: 0, budget: DEFAULT_VIDEO_BUDGET, bitrate: 0 });
});
