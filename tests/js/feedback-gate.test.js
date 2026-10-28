import test from 'node:test';
import assert from 'node:assert/strict';
import { createFeedbackHandler } from '../../workers/feedback/handler.js';
import { feedbackFixture } from './helpers/feedback-store.js';

const handler = createFeedbackHandler('<main>{{notice}}<textarea>{{message}}</textarea></main>');
const DAY = 86400000;
const TEN_MINUTES = 600000;

function report(message, options = {}) {
  return new Request('https://feedback.abox.tools/feedback', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': options.ip || '192.0.2.1' },
    body: JSON.stringify({ message, sender_type: options.sender || 'agent', page: options.page || 'https://abox.tools/compress-image/', ...options.fields }),
  });
}

test('sender declarations appear separately from server-observed format', async () => {
  for (const sender of ['person', 'agent', 'unspecified']) {
    const fixture = feedbackFixture();
    assert.equal((await handler(report('A report', { sender }), fixture.env)).status, 201);
    const label = sender === 'person' ? 'Person' : sender === 'agent' ? 'Agent' : 'Unspecified';
    assert.ok(fixture.sent[0].subject.includes(`[${label}]`));
    assert.ok(fixture.sent[0].text.includes(`Sender: ${label}${sender === 'unspecified' ? '' : ' (self-declared)'}`));
    assert.ok(fixture.sent[0].text.includes('Submission method: JSON'));
    assert.ok(fixture.sent[0].text.includes('not a verified identity'));
  }
});

test('an agent can use the form and a form without a declaration is rejected', async () => {
  const fixture = feedbackFixture();
  const form = fields => new Request('https://feedback.abox.tools/feedback', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(fields),
  });
  assert.equal((await handler(form({ message: 'Agent using the form' }), fixture.env)).status, 400);
  assert.equal((await handler(form({ message: 'Agent using the form', sender_type: 'agent' }), fixture.env)).status, 201);
  assert.ok(fixture.sent[0].text.includes('Sender: Agent (self-declared)'));
  assert.ok(fixture.sent[0].text.includes('Submission method: Form submission'));
});

test('legacy JSON is unspecified rather than assumed to be human', async () => {
  const fixture = feedbackFixture();
  const response = await handler(new Request('https://feedback.abox.tools/feedback', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"message":"Older client"}',
  }), fixture.env);
  assert.equal(response.status, 201);
  assert.ok(fixture.sent[0].text.includes('Sender: Unspecified'));
});

test('concurrent duplicate requests reserve only one email attempt', async () => {
  const fixture = feedbackFixture();
  const responses = await Promise.all(Array.from({ length: 12 }, () => handler(report('One repeated report'), fixture.env)));
  assert.equal(responses.filter(response => response.status === 201).length, 1);
  assert.ok(responses.every(response => [200, 201, 202].includes(response.status)));
  assert.equal(fixture.sent.length, 1);
  const bodies = await Promise.all(responses.map(response => response.json()));
  assert.equal(new Set(bodies.map(body => body.receipt)).size, 1);
  for (let index = 0; index < responses.length; index++) {
    assert.equal(bodies[index].ok, responses[index].status !== 202);
  }
  const duplicate = await handler(report('  ONE   repeated report  ', {
    sender: 'person', page: 'https://abox.tools/compress-image/index.html?ignored=1#different',
    fields: { environment: 'Changed', reply_to: 'different@example.com' },
  }), fixture.env);
  const repeated = await duplicate.json();
  assert.equal(duplicate.status, 200);
  assert.equal(repeated.duplicate, true);
  assert.equal(repeated.receipt, bodies[0].receipt);
  assert.equal(fixture.sent.length, 1);
  assert.equal(fixture.storage.rows.get('budget').times.length, 1);
});

test('the same message for different pages remains a distinct report', async () => {
  const fixture = feedbackFixture();
  assert.equal((await handler(report('A broken control'), fixture.env)).status, 201);
  assert.equal((await handler(report('A broken control', {
    ip: '192.0.2.2', page: 'https://abox.tools/resize-image/',
  }), fixture.env)).status, 201);
  assert.equal(fixture.sent.length, 2);
});

test('one global reservation ledger bounds simultaneous senders to twenty attempts', async () => {
  const fixture = feedbackFixture();
  const responses = await Promise.all(Array.from({ length: 25 }, (_, index) =>
    handler(report(`Distinct report ${index}`, { ip: `192.0.2.${index + 1}` }), fixture.env)));
  assert.equal(responses.filter(response => response.status === 201).length, 20);
  assert.equal(responses.filter(response => response.status === 429).length, 5);
  assert.equal(fixture.sent.length, 20);
  for (const response of responses.filter(response => response.status === 429)) {
    assert.equal(response.headers.get('Retry-After'), '86400');
  }
});

test('rolling network limits survive reconstruction and return precise retry times', async () => {
  const fixture = feedbackFixture();
  assert.equal((await handler(report('First report'), fixture.env)).status, 201);
  fixture.restart();
  const cooldown = await handler(report('Second report', { sender: 'person' }), fixture.env);
  assert.equal(cooldown.status, 429);
  assert.equal(cooldown.headers.get('Retry-After'), '600');
  fixture.clock.now += TEN_MINUTES;
  assert.equal((await handler(report('Second report'), fixture.env)).status, 201);
  fixture.clock.now += TEN_MINUTES;
  assert.equal((await handler(report('Third report'), fixture.env)).status, 201);
  fixture.clock.now += TEN_MINUTES;
  const daily = await handler(report('Fourth report'), fixture.env);
  assert.equal(daily.status, 429);
  assert.equal(daily.headers.get('Retry-After'), '84600');
  fixture.clock.now += DAY - 3 * TEN_MINUTES + 1;
  assert.equal((await handler(report('Fourth report'), fixture.env)).status, 201);
  assert.equal(fixture.sent.length, 4);
});

test('failed delivery consumes capacity and is never automatically sent again', async () => {
  const fixture = feedbackFixture();
  let attempts = 0;
  fixture.env.FEEDBACK_MAIL.send = async () => { attempts++; throw new Error('Provider unavailable'); };
  const first = await handler(report('Unconfirmed report'), fixture.env);
  const receipt = (await first.json()).receipt;
  assert.equal(first.status, 503);
  const second = await handler(report('Unconfirmed report'), fixture.env);
  const body = await second.json();
  assert.equal(second.status, 503);
  assert.equal(body.ok, false);
  assert.equal(body.receipt, receipt);
  assert.equal(attempts, 1);
  assert.equal(fixture.storage.rows.get('budget').times.length, 1);
});

test('failure to persist acceptance cannot acknowledge delivery or trigger a resend', async () => {
  const fixture = feedbackFixture();
  fixture.storage.rejectAccepted = true;
  const first = await handler(report('Finalization failure'), fixture.env);
  assert.equal(first.status, 503);
  assert.equal((await first.json()).ok, false);
  assert.equal((await handler(report('Finalization failure'), fixture.env)).status, 503);
  assert.equal(fixture.sent.length, 1);
});

test('an abandoned reservation becomes unconfirmed instead of pending forever', async () => {
  const fixture = feedbackFixture();
  const client = 'a'.repeat(64);
  const fingerprint = 'b'.repeat(64);
  const reservation = await fixture.gate.reserve(`client:${client}`, `report:${fingerprint}`);
  fixture.clock.now += 120001;
  const response = await fixture.gate.fetch(new Request('https://feedback.internal/deliver', {
    method: 'POST', body: JSON.stringify({ client, fingerprint, channel: 'JSON', fields: { message: 'Abandoned', sender_type: 'agent' } }),
  }));
  assert.equal(response.status, 503);
  assert.equal((await response.json()).receipt, reservation.receipt);
  assert.equal(fixture.sent.length, 0);
});

test('retrying a storage transaction never retries email', async () => {
  const fixture = feedbackFixture();
  fixture.storage.retryNext = true;
  assert.equal((await handler(report('Retried reservation'), fixture.env)).status, 201);
  assert.equal(fixture.sent.length, 1);
  assert.equal(fixture.storage.rows.get('budget').times.length, 1);
});

test('the ledger stores only keyed fingerprints, times, status and receipts', async () => {
  const fixture = feedbackFixture();
  assert.equal((await handler(report('Private synthetic text', {
    ip: '198.51.100.77', fields: { reply_to: 'private@example.com', environment: 'Private environment' },
  }), fixture.env)).status, 201);
  const persisted = JSON.stringify([...fixture.storage.rows]);
  for (const privateText of ['Private synthetic text', '198.51.100.77', 'private@example.com', 'Private environment', 'https://abox.tools']) {
    assert.ok(!persisted.includes(privateText));
  }
  assert.match(fixture.forwarded[0].client, /^[a-f0-9]{64}$/);
  assert.match(fixture.forwarded[0].fingerprint, /^[a-f0-9]{64}$/);
  fixture.clock.now += DAY + 1;
  fixture.storage.alarmAt = null;
  await fixture.gate.alarm();
  assert.equal(fixture.storage.rows.size, 0);
  assert.equal(fixture.storage.alarmAt, null);
});
