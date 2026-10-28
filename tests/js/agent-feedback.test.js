import test from 'node:test';
import assert from 'node:assert/strict';
import { createFeedbackHandler } from '../../workers/feedback/handler.js';

const handler = createFeedbackHandler('<main>{{notice}}<textarea>{{message}}</textarea><input value="{{page}}"></main>');

function fixture() {
  const sent = [];
  const keys = [];
  return {
    sent, keys,
    env: {
      FEEDBACK_TO: 'owner@example.com',
      FEEDBACK_MAIL: { async send(message) { sent.push(message); } },
      FEEDBACK_RATE_LIMIT: { async limit({ key }) { keys.push(key); return { success: true }; } },
      FEEDBACK_GLOBAL_LIMIT: { async limit() { return { success: true }; } },
    },
  };
}

function request(body, options = {}) {
  return new Request('https://feedback.abox.tools/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    body: JSON.stringify(body),
  });
}

test('anonymous JSON feedback needs only a message and keeps identity out of email', async () => {
  const { env, sent, keys } = fixture();
  const response = await handler(request({ message: 'A synthetic report.' }, {
    headers: { 'CF-Connecting-IP': '192.0.2.7', 'User-Agent': 'private-agent-string' },
  }), env);
  assert.equal(response.status, 201);
  const result = await response.json();
  assert.equal(result.ok, true);
  assert.match(result.receipt, /^[\da-f-]{36}$/);
  assert.deepEqual(keys, ['192.0.2.7']);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to, 'owner@example.com');
  assert.equal(sent[0].from, 'hi@abox.tools');
  assert.match(sent[0].text, /A synthetic report/);
  assert.ok(!sent[0].text.includes('192.0.2.7'));
  assert.ok(!sent[0].text.includes('private-agent-string'));
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
});

test('feedback is acknowledged only after provider acceptance', async () => {
  const { env } = fixture();
  env.FEEDBACK_MAIL.send = async () => { throw new Error('Private provider error'); };
  const response = await handler(request({ message: 'Test' }), env);
  assert.equal(response.status, 503);
  const body = await response.text();
  assert.ok(!body.includes('Private provider error'));
  assert.equal(JSON.parse(body).ok, false);
  assert.ok(!Object.hasOwn(JSON.parse(body), 'receipt'));
});

test('missing delivery or abuse bindings fail closed', async () => {
  for (const binding of ['FEEDBACK_TO', 'FEEDBACK_MAIL', 'FEEDBACK_RATE_LIMIT', 'FEEDBACK_GLOBAL_LIMIT']) {
    const { env, sent } = fixture();
    delete env[binding];
    assert.equal((await handler(request({ message: 'Test' }), env)).status, 503);
    assert.equal(sent.length, 0);
  }
});

test('per-address and aggregate limits both reject without sending', async () => {
  for (const binding of ['FEEDBACK_RATE_LIMIT', 'FEEDBACK_GLOBAL_LIMIT']) {
    const { env, sent } = fixture();
    env[binding].limit = async () => ({ success: false });
    const response = await handler(request({ message: 'Test' }), env);
    assert.equal(response.status, 429);
    assert.equal(response.headers.get('Retry-After'), '60');
    assert.equal(sent.length, 0);
  }
});

test('only bounded string fields can enter a report', async () => {
  for (const fields of [null, [], { message: '' }, { message: 1 },
    { message: 'x'.repeat(4001) }, { message: 'x', page: 'x'.repeat(513) },
    { message: 'x', environment: 'x'.repeat(501) }, { message: 'x', reply_to: 'a\r\nb@c.test' },
    { message: 'x', to: 'someone@example.com' }, { message: 'x', company: 'bot' },
    { message: '\u0000' }]) {
    const { env, sent } = fixture();
    assert.equal((await handler(request(fields), env)).status, 400);
    assert.equal(sent.length, 0);
  }
});

test('streamed requests cannot evade the byte limit by omitting Content-Length', async () => {
  const { env, sent } = fixture();
  const stream = new ReadableStream({ start(controller) {
    controller.enqueue(new Uint8Array(9000));
    controller.enqueue(new Uint8Array(9000));
    controller.close();
  } });
  const oversized = new Request('https://feedback.abox.tools/feedback', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: stream, duplex: 'half',
  });
  assert.equal((await handler(oversized, env)).status, 413);
  assert.equal(sent.length, 0);
});

test('browser origins are explicit and native clients need no Origin', async () => {
  for (const origin of ['https://feedback.abox.tools', 'https://abox.tools']) {
    const { env } = fixture();
    const response = await handler(request({ message: 'Test' }, { headers: { Origin: origin } }), env);
    assert.equal(response.status, 201);
    assert.equal(response.headers.get('Access-Control-Allow-Origin'), origin);
  }
  for (const origin of ['null', 'https://example.com', 'https://abox.tools.evil.example']) {
    const { env, sent } = fixture();
    assert.equal((await handler(request({ message: 'Test' }, { headers: { Origin: origin } }), env)).status, 403);
    assert.equal(sent.length, 0);
  }
});

test('the no-script form supports anonymous submission and escapes reflected failures', async () => {
  const { env } = fixture();
  env.FEEDBACK_MAIL.send = async () => { throw new Error(); };
  const response = await handler(new Request('https://feedback.abox.tools/feedback', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ message: '</textarea><script>bad()</script>{{notice}}', page: '"><svg onload=bad()>', company: '' }),
  }), env);
  const html = await response.text();
  assert.equal(response.status, 503);
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('<svg'));
  assert.ok(html.includes('&lt;/textarea&gt;'));
  assert.ok(html.includes('{{notice}}'));
  assert.match(response.headers.get('Content-Security-Policy'), /default-src 'none'/);
});

test('a report cannot choose mail headers or fetch a submitted address', async () => {
  const { env, sent } = fixture();
  assert.equal((await handler(request({
    message: 'From: intruder@example.com\nBcc: another@example.com',
    page: 'https://example.com/private-do-not-fetch', reply_to: 'reply@example.com',
  }), env)).status, 201);
  assert.equal(sent[0].to, 'owner@example.com');
  assert.ok(!Object.hasOwn(sent[0], 'bcc'));
  assert.ok(!Object.hasOwn(sent[0], 'replyTo'));
  assert.match(sent[0].text, /reply@example.com/);
});

test('a validation error preserves safe text so a reply-address typo does not erase a report', async () => {
  const { env, sent } = fixture();
  const response = await handler(new Request('https://feedback.abox.tools/feedback', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ message: 'Keep this report <safely>.', reply_to: 'typo' }),
  }), env);
  assert.equal(response.status, 400);
  assert.ok((await response.text()).includes('Keep this report &lt;safely&gt;.'));
  assert.equal(sent.length, 0);
});

test('no-referrer form navigation uses same-origin metadata without granting null-Origin CORS', async () => {
  for (const site of ['same-origin', 'cross-site']) {
    const { env, sent } = fixture();
    const response = await handler(new Request('https://feedback.abox.tools/feedback', {
      method: 'POST', headers: {
        'Content-Type': 'application/x-www-form-urlencoded', Origin: 'null', 'Sec-Fetch-Site': site,
      }, body: 'message=A+synthetic+form+report',
    }), env);
    assert.equal(response.status, site === 'same-origin' ? 201 : 403);
    assert.equal(sent.length, site === 'same-origin' ? 1 : 0);
    assert.equal(response.headers.get('Access-Control-Allow-Origin'), null);
  }
});

test('unknown routes, unsupported uploads and duplicate form fields are rejected', async () => {
  const { env, sent } = fixture();
  assert.equal((await handler(new Request('https://feedback.abox.tools/elsewhere'), env)).status, 404);
  assert.equal((await handler(new Request('https://feedback.abox.tools/feedback', {
    method: 'POST', headers: { 'Content-Type': 'multipart/form-data; boundary=test' }, body: 'test',
  }), env)).status, 415);
  assert.equal((await handler(new Request('https://feedback.abox.tools/feedback', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'message=one&message=two',
  }), env)).status, 400);
  assert.equal(sent.length, 0);
});
