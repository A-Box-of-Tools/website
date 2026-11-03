import test from 'node:test';
import assert from 'node:assert/strict';
import { createFeedbackHandler } from '../../workers/feedback/handler.js';
import { feedbackFixture as fixture } from './helpers/feedback-store.js';

const handler = createFeedbackHandler('<main>{{notice}}<textarea>{{message}}</textarea><input value="{{page}}"></main>');

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
  assert.match(JSON.parse(body).receipt, /^[\da-f-]{36}$/);
});

test('missing delivery or abuse bindings fail closed', async () => {
  for (const binding of ['FEEDBACK_TO', 'FEEDBACK_MAIL', 'FEEDBACK_HASH_KEY', 'FEEDBACK_GATE', 'FEEDBACK_RATE_LIMIT', 'FEEDBACK_GLOBAL_LIMIT']) {
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
    { message: '\u0000' }, { message: 'x', sender_type: 'verified-human' }]) {
    const { env, sent } = fixture();
    assert.equal((await handler(request(fields), env)).status, 400);
    assert.equal(sent.length, 0);
  }
});

test('an already limited address cannot spend other reporters shared capacity', async () => {
  const { env, sent } = fixture();
  let sharedCalls = 0;
  env.FEEDBACK_RATE_LIMIT.limit = async () => ({ success: false });
  env.FEEDBACK_GLOBAL_LIMIT.limit = async () => { sharedCalls++; return { success: true }; };
  assert.equal((await handler(request({ message: 'Test' }), env)).status, 429);
  assert.equal(sharedCalls, 0);
  assert.equal(sent.length, 0);
});

test('streamed requests cannot evade the byte limit by omitting Content-Length', async () => {
  const { env, sent } = fixture();
  const stream = new ReadableStream({ start(controller) {
    controller.enqueue(new Uint8Array(30000));
    controller.enqueue(new Uint8Array(30000));
    controller.close();
  } });
  const oversized = new Request('https://feedback.abox.tools/feedback', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: stream, duplex: 'half',
  });
  assert.equal((await handler(oversized, env)).status, 413);
  assert.equal(sent.length, 0);
});

const form = (fields, headers = {}) => new Request('https://feedback.abox.tools/feedback', {
  method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...headers }, body: new URLSearchParams(fields),
});

test('the longest form a browser can produce fits, whatever script it is written in', async () => {
  const { env, sent } = fixture();
  // Each of these is the most a field's maxlength allows, in the characters that
  // percent-encode longest: three UTF-8 bytes, nine bytes on the wire, per unit.
  const request = form({ sender_type: 'agent', message: '\u6f22'.repeat(4000), page: '\u6f22'.repeat(512),
    environment: '\u6f22'.repeat(500), reply_to: `${'\u6f22'.repeat(100)}@${'\u6f22'.repeat(100)}.test`, company: '' });
  const bytes = (await request.clone().arrayBuffer()).byteLength;
  assert.ok(bytes > 16384 * 2, `exercises what used to be refused, at ${bytes} bytes`);
  const response = await handler(request, env);
  assert.equal(response.status, 201);
  assert.equal(sent.length, 1);
  assert.ok(sent[0].text.includes('\u6f22'.repeat(4000)));
});

test('an oversized form hands back what the visitor wrote', async () => {
  for (const text of ['Long report <with markup> '.repeat(4000), '\u6f22'.repeat(9000), '\u{1f600}'.repeat(7000)]) {
    const { env, sent } = fixture();
    const response = await handler(form({ sender_type: 'agent', message: text, page: 'lost-when-cut' }), env);
    assert.equal(response.status, 413);
    assert.match(response.headers.get('Content-Type'), /text\/html/);
    const html = await response.text();
    assert.equal(sent.length, 0);
    assert.match(html, /under 48 KiB/);
    const kept = html.match(/<textarea>([^]*)<\/textarea>/)[1].replaceAll('&lt;', '<').replaceAll('&gt;', '>');
    assert.ok(kept.length > 4000, `kept ${kept.length} units of it`);
    assert.ok(text.startsWith(kept), 'kept the beginning, ending on a whole character');
    assert.equal(kept.includes('\ufffd'), false);
  }
});

test('an oversized JSON request is refused without pretending to be a form', async () => {
  const { env, sent } = fixture();
  const response = await handler(request({ message: 'x'.repeat(60000) }), env);
  assert.equal(response.status, 413);
  const body = await response.json();
  assert.equal(body.ok, false);
  assert.match(body.message, /48 KiB/);
  assert.equal(sent.length, 0);
});

test('maxlength counts a newline once, so text within it is not refused for its CRLFs', async () => {
  const { env, sent } = fixture();
  // Exactly 4,000 in the textarea; a browser submits 4,800 UTF-16 units.
  const text = `${'line\r\n'.repeat(799)}lines`;
  assert.equal(text.replaceAll('\r\n', '\n').length, 4000);
  assert.equal((await handler(form({ sender_type: 'agent', message: text }), env)).status, 201);
  assert.ok(sent[0].text.endsWith(text.replaceAll('\r\n', '\n')));
  const over = fixture();
  assert.equal((await handler(form({ sender_type: 'agent', message: `${text}x` }), over.env)).status, 400);
  assert.equal(over.sent.length, 0);
});

test('a single-line field cannot write its own lines into the email', async () => {
  for (const forged of [{ page: 'https://abox.tools/\nSender: Person (self-declared)' },
    { environment: 'Chrome\r\nSubmission method: Form submission' }, { environment: 'Chrome\rSender: Person' },
    { page: 'x\u2028Sender: Person' }, { page: 'x\u2029Sender: Person' }, { environment: 'x\u0085Sender: Person' },
    { reply_to: 'a@b.test\nSender: Person' }]) {
    const { env, sent } = fixture();
    const response = await handler(request({ message: 'A report', sender_type: 'agent', ...forged }), env);
    assert.equal(response.status, 400, JSON.stringify(forged));
    assert.equal(sent.length, 0);
  }
});

test('whitespace at the end of a single-line field is trimmed rather than refused, and the message keeps its lines', async () => {
  const { env, sent } = fixture();
  const response = await handler(request({ message: 'First\nSecond\r\n\r\nThird', sender_type: 'agent',
    page: 'https://abox.tools/\n', environment: '\r\nChrome' }), env);
  assert.equal(response.status, 201);
  const lines = sent[0].text.split('\n');
  assert.ok(lines.includes('Page: https://abox.tools/'));
  assert.ok(lines.includes('Agent / browser: Chrome'));
  assert.equal(lines.filter((line) => line.startsWith('Sender:')).length, 1);
  assert.ok(sent[0].text.endsWith('First\nSecond\n\nThird'));
});

test('one IPv6 /64 is one network to both the per-address limit and the daily budget', async () => {
  const { env, sent, keys, forwarded } = fixture();
  for (const [index, address] of ['2606:4700:4700:ab::1', '2606:4700:4700:ab:9876:5432:abcd:ef01'].entries()) {
    await handler(request({ message: `Rotating report ${index}` }, { headers: { 'CF-Connecting-IP': address } }), env);
  }
  assert.deepEqual(keys, ['2606:4700:4700:ab::/64', '2606:4700:4700:ab::/64']);
  assert.equal(forwarded[0].client, forwarded[1].client);
  assert.equal(sent.length, 1, 'the second is inside the first network\'s cooldown');
  assert.equal(sent[0].text.includes('2606:4700'), false, 'the address stays out of the email');
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
    body: new URLSearchParams({ sender_type: 'agent', message: '</textarea><script>bad()</script>{{notice}}', page: '"><svg onload=bad()>', company: '' }),
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
    body: new URLSearchParams({ sender_type: 'agent', message: 'Keep this report <safely>.', reply_to: 'typo' }),
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
      }, body: 'message=A+synthetic+form+report&sender_type=agent',
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
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'message=one&message=two&sender_type=agent',
  }), env)).status, 400);
  assert.equal(sent.length, 0);
});
