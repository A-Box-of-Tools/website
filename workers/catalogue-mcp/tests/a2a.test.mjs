import assert from 'node:assert/strict';
import test from 'node:test';

import { A2A_PATH, A2A_VERSION, a2aResponse, buildAgentCard } from '../src/a2a.mjs';
import { searchCatalogue } from '../src/search.mjs';

const catalogue = {
  schemaVersion: 1,
  build: { version: '0.0.0+test.fixture', revision: '0'.repeat(40), dirty: false },
  locales: {
    en: { language: 'en', tools: [
      { name: 'Image Compressor', description: 'Compress JPEG and PNG images.', url: 'https://abox.tools/compress-image/' },
      { name: 'PNG to WebP', description: 'Convert PNG images to WebP.', url: 'https://abox.tools/png-to-webp/' },
      { name: 'PDF Compressor', description: 'Reduce PDF file size.', url: 'https://abox.tools/compress-pdf/' },
    ] },
    de: { language: 'de', tools: [
      { name: 'Bilder komprimieren', description: 'JPEG- und PNG-Bilder komprimieren.', url: 'https://abox.tools/de/compress-image/' },
      { name: 'PDF komprimieren', description: 'PDF-Dateien lokal komprimieren.', url: 'https://abox.tools/de/compress-pdf/' },
    ] },
  },
};

function rpc(method, params = {}, id = 7) {
  return { jsonrpc: '2.0', id, method, params };
}

function send(part = { text: 'PNG' }, options = {}) {
  return rpc('SendMessage', { message: { messageId: 'public-client-message', role: 'ROLE_USER', parts: [part],
    ...options.message }, ...(options.configuration === undefined ? {} : { configuration: options.configuration }) });
}

async function call(body, headers = { 'A2A-Version': '1.0' }, source = catalogue) {
  const response = a2aResponse(source, body, new Headers(headers));
  assert.equal(response.headers.get('Content-Type'), 'application/json');
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.equal(response.headers.get('A2A-Version'), '1.0');
  return { status: response.status, body: await response.json() };
}

function error(reply, code, status = 200) {
  assert.equal(reply.status, status);
  assert.equal(reply.body.jsonrpc, '2.0');
  assert.equal(reply.body.error.code, code);
  assert.equal(typeof reply.body.error.message, 'string');
  assert.equal(Object.hasOwn(reply.body, 'result'), false);
}

test('the A2A card advertises only the real bounded public search interface', () => {
  assert.equal(A2A_PATH, '/a2a');
  assert.equal(A2A_VERSION, '1.0');
  const card = buildAgentCard(catalogue);
  assert.equal(card.version, catalogue.build.version);
  assert.deepEqual(card.supportedInterfaces, [{ url: 'https://mcp.abox.tools/a2a',
    protocolBinding: 'JSONRPC', protocolVersion: '1.0' }]);
  assert.deepEqual(card.capabilities, { streaming: false, pushNotifications: false, extendedAgentCard: false });
  assert.deepEqual(card.defaultInputModes, ['text/plain', 'application/json']);
  assert.deepEqual(card.defaultOutputModes, ['text/plain', 'application/json']);
  assert.match(card.description, /Authentication is not required/);
  assert.match(card.description, /does not accept files/);
  assert.ok(card.documentationUrl.includes(catalogue.build.revision));
  assert.equal(card.skills.length, 1);
  assert.equal(card.skills[0].id, 'find_browser_tools');
  for (const key of ['securitySchemes', 'securityRequirements', 'signatures', 'url', 'protocolVersion']) {
    assert.equal(Object.hasOwn(card, key), false, key);
  }
  for (const origin of ['https://mcp-dev.abox.tools', 'http://localhost:8787', 'http://127.0.0.1:8787']) {
    assert.equal(buildAgentCard(catalogue, origin).supportedInterfaces[0].url, `${origin}/a2a`);
  }
  for (const origin of ['https://attacker.example', 'https://mcp.abox.tools/a2a',
    'https://user:password@mcp.abox.tools', 'https://mcp.abox.tools?query=private', 'http://mcp.abox.tools']) {
    assert.throws(() => buildAgentCard(catalogue, origin), TypeError, origin);
  }
  card.supportedInterfaces[0].url = 'https://attacker.example/';
  card.defaultInputModes.push('image/png');
  assert.equal(buildAgentCard(catalogue).supportedInterfaces[0].url, 'https://mcp.abox.tools/a2a');
  assert.deepEqual(buildAgentCard(catalogue).defaultInputModes, ['text/plain', 'application/json']);
});

test('SendMessage uses the A2A 1.0 wrapper, roles and typed parts with real catalogue results', async () => {
  const request = send({ data: { query: 'PNG', limit: 1 }, mediaType: 'application/json' });
  request.id = 'public-rpc-id';
  const reply = await call(request);
  assert.equal(reply.status, 200);
  assert.equal(reply.body.id, request.id);
  const message = reply.body.result.message;
  assert.equal(message.role, 'ROLE_AGENT');
  assert.match(message.messageId, /^[0-9a-f-]{36}$/);
  assert.match(message.contextId, /^[0-9a-f-]{36}$/);
  assert.equal(message.parts.length, 2);
  assert.equal(message.parts[0].mediaType, 'text/plain');
  assert.ok(message.parts[0].text.includes(catalogue.locales.en.tools[0].url));
  assert.equal(message.parts[1].mediaType, 'application/json');
  assert.deepEqual(message.parts[1].data, searchCatalogue(catalogue, { query: 'PNG', limit: 1 }));
  assert.deepEqual(Object.keys(reply.body.result), ['message']);
  for (const key of ['kind', 'state', 'taskId', 'history']) assert.equal(Object.hasOwn(message, key), false, key);
});

test('text input defaults to English and structured input preserves actual locale links and limits', async () => {
  const english = (await call(send())).body.result.message.parts[1].data;
  assert.deepEqual(english, searchCatalogue(catalogue, { query: 'PNG' }));
  const german = (await call(send({ data: { query: '', locale: 'de', limit: 1 } }))).body.result.message.parts[1].data;
  assert.equal(german.locale, 'de');
  assert.equal(german.total, 2);
  assert.equal(german.hasMore, true);
  assert.equal(german.tools.length, 1);
  assert.ok(german.tools[0].url.startsWith('https://abox.tools/de/'));
  const conversion = (await call(send({ text: 'PNG to WebP', mediaType: 'text/plain' }))).body.result.message.parts[1].data;
  assert.deepEqual(conversion.tools.map(tool => tool.url), ['https://abox.tools/png-to-webp/']);
  const unsupported = (await call(send({ text: 'json to html' }))).body.result.message.parts[1].data;
  assert.equal(unsupported.total, 0);
});

test('output negotiation and immediate-response preferences never create a task', async () => {
  for (const mode of ['text/plain', 'application/json']) {
    const reply = await call(send({ text: '' }, { configuration: {
      acceptedOutputModes: [mode], returnImmediately: true, historyLength: 0,
    } }));
    assert.deepEqual(Object.keys(reply.body.result), ['message']);
    assert.equal(reply.body.result.message.parts.length, 1);
    assert.equal(reply.body.result.message.parts[0].mediaType, mode);
  }
  error(await call(send({ text: 'PNG' }, { configuration: { acceptedOutputModes: ['image/png'] } })), -32005);
  error(await call(send({ text: 'PNG' }, { configuration: { returnImmediately: 'true' } })), -32602);
  error(await call(send({ text: 'PNG' }, { configuration: { taskPushNotificationConfig: {} } })), -32003);
});

test('each completed exchange has fresh identifiers and no retained task or result state', async () => {
  const body = send({ data: { query: '', limit: 20 } });
  const first = (await call(body)).body.result.message;
  const second = (await call(body)).body.result.message;
  assert.notEqual(first.messageId, second.messageId);
  assert.notEqual(first.contextId, second.contextId);
  first.parts[1].data.tools[0].name = 'Changed response copy';
  assert.equal(second.parts[1].data.tools[0].name, catalogue.locales.en.tools[0].name);
  const context = (await call(send({ text: 'PNG' }, { message: { contextId: 'public-context' } }))).body.result.message;
  assert.equal(context.contextId, 'public-context');
  const tasks = await call(rpc('ListTasks', { pageSize: 1, includeArtifacts: true }));
  assert.deepEqual(tasks.body.result, { tasks: [], nextPageToken: '', pageSize: 1, totalSize: 0 });
  for (const method of ['GetTask', 'CancelTask']) error(await call(rpc(method, { id: first.messageId })), -32001);
  error(await call(send({ text: 'PNG' }, { message: { taskId: first.messageId } })), -32001);
});

test('the same Unicode and argument bounds apply through the A2A interface', async () => {
  const accepted = await call(send({ data: { query: '😀'.repeat(200), limit: 20, locale: 'en' } }));
  assert.equal(accepted.body.result.message.parts[1].data.total, 0);
  const invalid = [
    { query: '😀'.repeat(201) }, { query: '\uD800' }, { query: 'PNG\u0000' },
    { query: 'PNG', limit: 0 }, { query: 'PNG', limit: 21 }, { query: 'PNG', limit: 1.5 },
    { query: 'PNG', limit: '1' }, { query: 'PNG', locale: 'unsupported' }, { query: 'PNG', locale: null },
    { query: 'PNG', file: 'private-file.png' }, { query: 'PNG', base64: 'cHJpdmF0ZQ==' },
    { query: 'PNG', url: 'https://private.example/file.png' },
    JSON.parse('{"query":"PNG","__proto__":{"polluted":true}}'),
  ];
  for (const args of invalid) error(await call(send({ data: args })), -32602);
  assert.equal({}.polluted, undefined);
});

test('file, URL, mixed and legacy parts are rejected without echoing private input', async () => {
  for (const part of [{ raw: 'cHJpdmF0ZQ==' }, { url: 'https://private.example/file.png' },
    { text: 'PNG', filename: 'private-file.png' }, { file: { uri: 'file:///private/file.png' } }]) {
    const reply = await call(send(part));
    error(reply, -32005);
    assert.doesNotMatch(JSON.stringify(reply.body), /private-file|private\.example|cHJpdmF0ZQ/);
  }
  for (const part of [{ text: 'PNG', data: { query: 'PNG' } }, { kind: 'text', text: 'PNG' },
    { data: null }, { data: ['PNG'] }, { text: 5 }, { text: 'PNG', metadata: { private: 'payload' } }]) {
    error(await call(send(part)), -32602);
  }
  error(await call(send({ text: 'PNG', mediaType: 'image/png' })), -32005);
  const multiple = send();
  multiple.params.message.parts.push({ text: 'PDF' });
  error(await call(multiple), -32602);
  error(await call(send({ text: 'PNG' }, { message: { metadata: { filename: 'private-file.png' } } })), -32602);
});

test('version negotiation, request identity and JSON-RPC validation remain explicit', async () => {
  for (const version of [undefined, '', '0.3', '2.0', '1.0.0']) {
    error(await call(send(), version === undefined ? {} : { 'A2A-Version': version }), -32009);
  }
  error(await call(send(), { 'A2A-Version': '1.0', 'A2A-Extensions': 'https://example.com/extension' }), -32004);
  for (const body of [null, [], [send(), send()], {}, { ...send(), jsonrpc: '1.0' },
    { ...send(), id: undefined }, { ...send(), id: true }, { ...send(), id: [] },
    { ...send(), file: 'private-file.png' }]) {
    error(await call(body), -32600, 400);
  }
  error(await call(rpc('message/send', {})), -32601);
  error(await call(rpc('UnknownMethod')), -32601);
  error(await call(rpc('SendMessage', [])), -32602);
  error(await call(send({ text: 'PNG' }, { message: { role: 'user' } })), -32602);
  error(await call(send({ text: 'PNG' }, { message: { role: 'ROLE_AGENT' } })), -32602);
  for (const id of [null, 0.5, 'public\nrequest']) {
    const reply = await call({ ...send(), id });
    assert.equal(reply.body.id, id);
    assert.ok(reply.body.result.message);
  }
  const notification = send();
  delete notification.id;
  const quiet = a2aResponse(catalogue, notification, new Headers({ 'A2A-Version': '1.0' }));
  assert.equal(quiet.status, 204);
  assert.equal(await quiet.text(), '');
});

test('disabled capabilities return their required A2A errors and task filters are validated', async () => {
  for (const method of ['SendStreamingMessage', 'SubscribeToTask', 'GetExtendedAgentCard']) {
    error(await call(rpc(method)), -32004);
  }
  for (const method of ['CreateTaskPushNotificationConfig', 'GetTaskPushNotificationConfig',
    'ListTaskPushNotificationConfigs', 'DeleteTaskPushNotificationConfig']) {
    error(await call(rpc(method)), -32003);
  }
  assert.deepEqual((await call(rpc('ListTasks'))).body.result,
    { tasks: [], nextPageToken: '', pageSize: 50, totalSize: 0 });
  assert.deepEqual((await call(rpc('ListTasks', { contextId: 'public-context', status: 'TASK_STATE_COMPLETED',
    statusTimestampAfter: '2026-01-01T00:00:00Z', historyLength: 0 }))).body.result.tasks, []);
  for (const params of [{ pageSize: 0 }, { pageSize: 101 }, { pageToken: 'never-issued' },
    { status: 'completed' }, { includeArtifacts: 'true' }, { historyLength: -1 },
    { statusTimestampAfter: 'not-a-timestamp' }, { statusTimestampAfter: '2026-01-01T00:00:00+01:00' },
    { tenant: 'unavailable' }]) {
    error(await call(rpc('ListTasks', params)), -32602);
  }
  error(await call(rpc('GetTask')), -32602);
  error(await call(rpc('CancelTask', { id: 'public-task', metadata: { filename: 'private-file.png' } })), -32602);
});

test('untrusted catalogue destinations fail before a public response can advertise them', async () => {
  const invalid = structuredClone(catalogue);
  invalid.locales.en.tools[0].url = 'https://attacker.example/file.png';
  const reply = await call(send(), { 'A2A-Version': '1.0' }, invalid);
  error(reply, -32603, 500);
  assert.doesNotMatch(JSON.stringify(reply.body), /attacker|file\.png/);
});
