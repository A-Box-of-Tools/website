import assert from 'node:assert/strict';
import test from 'node:test';

import { Client, InMemoryTransport, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';

import { searchCatalogue, validateCatalogue } from '../src/search.mjs';
import { createCatalogueServer } from '../src/server.mjs';
import { createWorker } from '../src/worker.mjs';

const catalogue = {
  schemaVersion: 1,
  build: { version: '0.0.0+test.fixture', revision: '0'.repeat(40), dirty: false },
  locales: {
    en: {
      language: 'en',
      tools: [
        { name: 'Image Compressor', description: 'Compress JPEG and PNG images.', url: 'https://abox.tools/compress-image/' },
        { name: 'Image Resizer', description: 'Resize PNG images in your browser.', url: 'https://abox.tools/resize-image/' },
        { name: 'PDF Compressor', description: 'Reduce the size of PDF documents.', url: 'https://abox.tools/compress-pdf/' },
        { name: 'JSON Formatter', description: 'Format JSON, XML, HTML and CSS in your browser.', url: 'https://abox.tools/format-json/' },
        { name: 'PNG to WebP', description: 'Convert PNG images to WebP in your browser.', url: 'https://abox.tools/png-to-webp/' },
      ],
    },
    de: {
      language: 'de',
      tools: [
        { name: 'Bilder komprimieren', description: 'JPEG- und PNG-Bilder komprimieren.', url: 'https://abox.tools/de/compress-image/' },
        { name: 'Bildgröße ändern', description: 'PNG-Bilder im Browser skalieren.', url: 'https://abox.tools/de/resize-image/' },
        { name: 'PDF komprimieren', description: 'Die Größe von PDF-Dokumenten reduzieren.', url: 'https://abox.tools/de/compress-pdf/' },
      ],
    },
  },
};

const viewHtml = '<!doctype html><html lang="en"><title>Catalogue test view</title><body><p>Public catalogue</p></body></html>';
const resourceUri = 'ui://abox/catalogue.html';
const appMime = 'text/html;profile=mcp-app';
const endpoint = 'https://mcp.abox.tools/mcp';
const allowedOrigin = 'https://abox.tools';

function workerFixture(options = {}) {
  return createWorker({
    catalogue,
    viewHtml,
    allowedHosts: ['mcp.abox.tools', 'localhost', '127.0.0.1'],
    allowedOrigins: [allowedOrigin, 'http://localhost:8123'],
    ...options,
  });
}

function request(body = { jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} }, options = {}) {
  const { url = endpoint, headers = {}, method = 'POST' } = options;
  return new Request(url, {
    method,
    headers: {
      Host: new URL(url).hostname,
      Accept: 'application/json, text/event-stream',
      ...(method === 'POST' ? { 'Content-Type': 'application/json', 'MCP-Protocol-Version': '2026-07-28' } : {}),
      ...headers,
    },
    ...(method === 'POST' ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}),
  });
}

async function memoryClient(t, withUi = true) {
  const server = createCatalogueServer(catalogue, viewHtml);
  const client = new Client({ name: 'catalogue-contract-tests', version: '1.0.0' }, withUi ? {
    capabilities: { extensions: { 'io.modelcontextprotocol/ui': { mimeTypes: [appMime] } } },
  } : {});
  t.after(async () => {
    await client.close();
    await server.close();
  });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  return client;
}

async function httpClient(t, url = endpoint) {
  const worker = workerFixture();
  const client = new Client(
    { name: 'catalogue-http-tests', version: '1.0.0' },
    { versionNegotiation: { mode: 'auto' } },
  );
  t.after(async () => {
    await client.close();
    await worker.close();
  });
  await client.connect(new StreamableHTTPClientTransport(new URL(url), {
    fetch: (input, init) => {
      const incoming = new Request(input, init);
      const headers = new Headers(incoming.headers);
      headers.set('Host', new URL(incoming.url).hostname);
      return worker.fetch(new Request(incoming, { headers }), {}, {});
    },
  }));
  return client;
}

test('catalogue validation accepts the public fixture without changing it', () => {
  const original = structuredClone(catalogue);
  validateCatalogue(catalogue);
  assert.deepEqual(catalogue, original);
});

test('locales can contain different numbers of genuinely available tools', () => {
  const partial = structuredClone(catalogue);
  partial.locales.de.tools.pop();
  validateCatalogue(partial);
  assert.equal(searchCatalogue(partial, { query: '', locale: 'de' }).total, 2);
});

test('catalogue validation rejects unsafe destinations and duplicate tool URLs', () => {
  for (const url of [
    'javascript:alert(1)',
    'file:///private/image.png',
    'data:image/png;base64,cHJpdmF0ZQ==',
    'https://other.example/compress-image/',
    'http://abox.tools/compress-image/',
    'https://user:password@abox.tools/compress-image/',
    'https://abox.tools/compress-image/?private=file',
    'https://abox.tools/compress-image/#private-file',
  ]) {
    const invalid = structuredClone(catalogue);
    invalid.locales.en.tools[0].url = url;
    assert.throws(() => validateCatalogue(invalid), TypeError, url);
  }
  const duplicate = structuredClone(catalogue);
  duplicate.locales.en.tools[1].url = duplicate.locales.en.tools[0].url;
  assert.throws(() => validateCatalogue(duplicate), TypeError);
});

test('search returns only matching public records and preserves localized links', () => {
  assert.deepEqual(searchCatalogue(catalogue, { query: 'jPeG' }), {
    locale: 'en', total: 1, hasMore: false, tools: [catalogue.locales.en.tools[0]],
  });
  assert.equal(searchCatalogue(catalogue, { query: 'JPG' }).tools[0].url, catalogue.locales.en.tools[0].url);
  assert.deepEqual(searchCatalogue(catalogue, { query: 'PNG', locale: 'de', limit: 1 }), {
    locale: 'de', total: 2, hasMore: true, tools: [catalogue.locales.de.tools[0]],
  });
  assert.deepEqual(searchCatalogue(catalogue, { query: 'no-such-public-tool' }), {
    locale: 'en', total: 0, hasMore: false, tools: [],
  });
});

test('query length is bounded by Unicode code points, including astral characters', () => {
  assert.equal(searchCatalogue(catalogue, { query: '😀'.repeat(200) }).total, 0);
  assert.throws(() => searchCatalogue(catalogue, { query: '😀'.repeat(201) }), TypeError);
});

test('conversion queries require a supported format pair in the public tool name', () => {
  for (const query of ['json to html', 'xml to css', 'jpg to heic']) {
    assert.equal(searchCatalogue(catalogue, { query }).total, 0, query);
  }
  const result = searchCatalogue(catalogue, { query: 'PNG to WebP' });
  assert.equal(result.total, 1);
  assert.equal(result.tools[0].name, 'PNG to WebP');
  assert.equal(result.tools[0].url, catalogue.locales.en.tools[4].url);
});

test('search rejects invalid values and private payload fields instead of ignoring them', () => {
  const invalid = [
    null, undefined, [],
    { query: null }, { query: 1 }, { query: {} }, { query: 'PNG\u0000' }, { query: '\uD800' },
    { query: 'PNG', limit: 0 }, { query: 'PNG', limit: 21 },
    { query: 'PNG', limit: 1.5 }, { query: 'PNG', limit: '1' }, { query: 'PNG', limit: null },
    { query: 'PNG', locale: 'unsupported' }, { query: 'PNG', locale: null },
    { query: 'PNG', file: 'private-image.png' },
    { query: 'PNG', files: ['private-image.png'] },
    { query: 'PNG', base64: 'cHJpdmF0ZSBjb250ZW50' },
    { query: 'PNG', url: 'https://private.example/image.png' },
    JSON.parse('{"query":"PNG","__proto__":{"polluted":true}}'),
  ];
  for (const args of invalid) assert.throws(() => searchCatalogue(catalogue, args), TypeError);
  assert.equal({}.polluted, undefined);
});

test('a real SDK client discovers the read-only tool and its MCP App resource', async (t) => {
  const client = await memoryClient(t);
  assert.equal(client.getServerVersion().name, 'tools.abox/catalogue');
  assert.equal(client.getServerVersion().version, catalogue.build.version);
  const { tools } = await client.listTools();
  assert.equal(tools.length, 1);
  const tool = tools[0];
  assert.equal(tool.name, 'find_browser_tools');
  assert.equal(tool._meta.ui.resourceUri, resourceUri);
  assert.equal(tool.inputSchema.additionalProperties, false);
  assert.deepEqual(Object.keys(tool.inputSchema.properties).sort(), ['limit', 'locale', 'query']);
  assert.equal(tool.inputSchema.properties.query.maxLength, 200);
  assert.equal(tool.annotations.readOnlyHint, true);

  const { resources } = await client.listResources();
  assert.equal(resources.length, 1);
  assert.equal(resources[0].uri, resourceUri);
  assert.equal(resources[0].mimeType, appMime);
  const { contents } = await client.readResource({ uri: resourceUri });
  assert.equal(contents.length, 1);
  assert.equal(contents[0].uri, resourceUri);
  assert.equal(contents[0].mimeType, appMime);
  assert.equal(contents[0].text, viewHtml);
  assert.equal(contents[0]._meta.ui.prefersBorder, true);
  assert.deepEqual(contents[0]._meta.ui.csp, {
    connectDomains: [], resourceDomains: [], frameDomains: [], baseUriDomains: [],
  });
});

test('text-only clients receive usable links alongside structured catalogue results', async (t) => {
  const client = await memoryClient(t, false);
  const result = await client.callTool({ name: 'find_browser_tools', arguments: { query: 'JPEG' } });
  assert.notEqual(result.isError, true);
  assert.deepEqual(result.structuredContent, searchCatalogue(catalogue, { query: 'JPEG' }));
  const text = result.content.filter((item) => item.type === 'text').map((item) => item.text).join('\n');
  assert.ok(text.includes(catalogue.locales.en.tools[0].name));
  assert.ok(text.includes(catalogue.locales.en.tools[0].url));
});

test('protocol validation refuses extra fields carrying private files or encoded content', async (t) => {
  const client = await memoryClient(t);
  for (const extra of [{ file: 'secret.png' }, { base64: 'c2VjcmV0' }, { files: ['secret.pdf'] }]) {
    let rejected = false;
    try {
      const result = await client.callTool({
        name: 'find_browser_tools', arguments: { query: 'PNG', ...extra },
      });
      rejected = result.isError === true;
    } catch (error) {
      assert.equal(typeof error.code, 'number');
      rejected = true;
    }
    assert.equal(rejected, true, JSON.stringify(Object.keys(extra)));
  }
});

test('the protocol accepts 200 astral characters and rejects 201', async (t) => {
  const client = await memoryClient(t, false);
  const accepted = await client.callTool({
    name: 'find_browser_tools', arguments: { query: '😀'.repeat(200) },
  });
  assert.notEqual(accepted.isError, true);
  assert.equal(accepted.structuredContent.total, 0);
  let rejected = false;
  try {
    const result = await client.callTool({
      name: 'find_browser_tools', arguments: { query: '😀'.repeat(201) },
    });
    rejected = result.isError === true;
  } catch (error) {
    assert.equal(typeof error.code, 'number');
    rejected = true;
  }
  assert.equal(rejected, true);
});

test('modern HTTP clients can use the public server without credentials', async (t) => {
  const client = await httpClient(t);
  const { tools } = await client.listTools();
  assert.equal(tools[0].name, 'find_browser_tools');
  const result = await client.callTool({ name: 'find_browser_tools', arguments: { query: 'JPEG' } });
  assert.equal(result.structuredContent.tools[0].url, catalogue.locales.en.tools[0].url);
});

test('explicitly allowed localhost remains usable by the same HTTP client', async (t) => {
  const client = await httpClient(t, 'http://localhost:8787/mcp');
  assert.equal((await client.listTools()).tools[0].name, 'find_browser_tools');
});

test('public discovery cards support cross-origin reads and conditional requests', async (t) => {
  const worker = workerFixture();
  t.after(() => worker.close());
  const cardUrl = new URL('/mcp/server-card', endpoint).href;
  const publicHeaders = { Origin: 'https://independent-agent.example' };
  const response = await worker.fetch(request(undefined, {
    url: cardUrl, method: 'GET', headers: publicHeaders,
  }), {}, {});
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Content-Type'), 'application/mcp-server-card+json');
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), '*');
  assert.ok(response.headers.get('Access-Control-Expose-Headers').toLowerCase().includes('etag'));
  const body = await response.text();
  const card = JSON.parse(body);
  assert.equal(card.name, 'tools.abox/catalogue');
  assert.equal(card.version, catalogue.build.version);
  assert.deepEqual(card.remotes, [{ type: 'streamable-http', url: endpoint }]);
  for (const field of ['capabilities', 'tools', 'resources']) assert.equal(Object.hasOwn(card, field), false, field);

  const alias = await worker.fetch(request(undefined, {
    url: new URL('/.well-known/mcp.json', endpoint).href, method: 'GET', headers: publicHeaders,
  }), {}, {});
  assert.equal(alias.status, 200);
  assert.equal(await alias.text(), body);
  const etag = response.headers.get('ETag');
  assert.ok(etag);
  const conditional = await worker.fetch(request(undefined, {
    url: cardUrl, method: 'GET', headers: { ...publicHeaders, 'If-None-Match': etag },
  }), {}, {});
  assert.equal(conditional.status, 304);
  assert.equal(conditional.headers.get('ETag'), etag);
  assert.equal(await conditional.text(), '');
  const head = await worker.fetch(request(undefined, {
    url: cardUrl, method: 'HEAD', headers: publicHeaders,
  }), {}, {});
  assert.equal(head.status, 200);
  assert.equal(head.headers.get('ETag'), etag);
  assert.equal(await head.text(), '');

  const preflight = await worker.fetch(request(undefined, {
    url: cardUrl, method: 'OPTIONS', headers: { ...publicHeaders,
      'Access-Control-Request-Method': 'GET', 'Access-Control-Request-Headers': 'If-None-Match' },
  }), {}, {});
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('Access-Control-Allow-Origin'), '*');
  assert.ok(preflight.headers.get('Access-Control-Allow-Methods').includes('GET'));
  assert.ok(preflight.headers.get('Access-Control-Allow-Headers').toLowerCase().includes('if-none-match'));
  assert.equal(await preflight.text(), '');

  const index = await worker.fetch(request(undefined, {
    url: new URL('/.well-known/ai-catalog.json', endpoint).href, method: 'GET', headers: publicHeaders,
  }), {}, {});
  assert.equal(index.status, 200);
  assert.equal(index.headers.get('Content-Type'), 'application/ai-catalog+json');
  assert.deepEqual((await index.json()).entries.map(entry => ({ type: entry.type, url: entry.url })), [
    { type: 'application/mcp-server-card+json', url: cardUrl },
  ]);
});

test('the public landing page identifies development status and where keywords go', async (t) => {
  const worker = workerFixture();
  t.after(() => worker.close());
  const response = await worker.fetch(request(undefined, {
    url: new URL('/', endpoint).href, method: 'GET', headers: { Origin: 'https://independent-agent.example' },
  }), {}, {});
  assert.equal(response.status, 200);
  assert.ok(response.headers.get('Content-Type').startsWith('text/html'));
  const html = await response.text();
  assert.match(html, /development/i);
  assert.match(html, /Initial MCP keywords go to this service/);
  assert.ok(html.includes('href="/mcp/server-card"'));
});

test('HTTP boundaries reject unrecognized hosts and origins before protocol handling', async (t) => {
  const worker = workerFixture();
  t.after(() => worker.close());
  for (const url of ['https://attacker.example/mcp', 'https://mcp.abox.tools.attacker.example/mcp']) {
    assert.equal((await worker.fetch(request(undefined, { url }), {}, {})).status, 403);
  }
  for (const origin of ['https://attacker.example', 'https://abox.tools.attacker.example', 'null']) {
    assert.equal((await worker.fetch(request(undefined, { headers: { Origin: origin } }), {}, {})).status, 403);
  }
});

test('unrelated paths are 404 and unsupported endpoint methods are 405', async (t) => {
  const worker = workerFixture();
  t.after(() => worker.close());
  assert.equal((await worker.fetch(request(undefined, { url: 'https://mcp.abox.tools/private-file' }), {}, {})).status, 404);
  for (const method of ['GET', 'DELETE']) {
    assert.equal((await worker.fetch(request(undefined, { method }), {}, {})).status, 405);
  }
});

test('CORS preflight permits only configured origins', async (t) => {
  const worker = workerFixture();
  t.after(() => worker.close());
  const headers = { Origin: allowedOrigin, 'Access-Control-Request-Method': 'POST' };
  const response = await worker.fetch(request(undefined, { method: 'OPTIONS', headers }), {}, {});
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), allowedOrigin);
  assert.ok(response.headers.get('Access-Control-Allow-Methods').includes('POST'));
  const denied = await worker.fetch(request(undefined, {
    method: 'OPTIONS', headers: { ...headers, Origin: 'https://attacker.example' },
  }), {}, {});
  assert.equal(denied.status, 403);
  assert.equal(denied.headers.get('Access-Control-Allow-Origin'), null);
});

test('body limits count actual UTF-8 bytes without relying on Content-Length', async (t) => {
  const worker = workerFixture();
  t.after(() => worker.close());
  for (const body of [' '.repeat(16_385), JSON.stringify({ query: '😀'.repeat(5_000) })]) {
    assert.ok(new TextEncoder().encode(body).length > 16_384);
    const response = await worker.fetch(request(body), {}, {});
    assert.equal(response.status, 413);
  }
});

test('small JSON-RPC batches cannot amplify UI resource responses', async (t) => {
  const worker = workerFixture();
  t.after(() => worker.close());
  const batch = JSON.stringify([1, 2].map(id => ({
    jsonrpc: '2.0', id, method: 'resources/read', params: { uri: resourceUri },
  })));
  assert.ok(new TextEncoder().encode(batch).length < 16_384);
  const response = await worker.fetch(request(batch, {
    headers: { 'MCP-Protocol-Version': '2025-11-25' },
  }), {}, {});
  assert.equal(response.status, 400);
  const result = await response.json();
  assert.equal(result.error.code, -32600);
  assert.equal(result.id, null);
  assert.equal(result.contents, undefined);
});

test('POST requires JSON and rate limiting returns a retryable 429', async (t) => {
  const ordinaryWorker = workerFixture();
  const calls = [];
  const limitedWorker = workerFixture({
    rateLimiter: { limit: async (entry) => { calls.push(entry); return { success: false }; } },
  });
  t.after(async () => { await ordinaryWorker.close(); await limitedWorker.close(); });
  assert.equal((await ordinaryWorker.fetch(request('{}', {
    headers: { 'Content-Type': 'text/plain' },
  }), {}, {})).status, 415);
  const response = await limitedWorker.fetch(request(), {}, {});
  assert.equal(response.status, 429);
  assert.equal(response.headers.get('Retry-After'), '60');
  assert.equal(calls.length, 1);
  assert.equal(typeof calls[0].key, 'string');
  assert.ok(calls[0].key.length > 0);
});
