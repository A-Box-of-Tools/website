import { createMcpHandler, hostHeaderValidationResponse, originValidationResponse } from '@modelcontextprotocol/server';
import { createCatalogueServer } from './server.mjs';
import { validateCatalogue } from './search.mjs';
import { discoveryResponse } from './discovery.mjs';

const BODY_LIMIT = 16384;

function error(status, message, extra = {}) {
  return new Response(message, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra } });
}

async function boundedBody(request) {
  const length = request.headers.get('Content-Length');
  if (length !== null && (!/^\d+$/.test(length) || Number(length) > BODY_LIMIT)) return null;
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > BODY_LIMIT) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return bytes;
}

export function createWorker({ catalogue, viewHtml, allowedHosts, allowedOrigins, rateLimiter }) {
  validateCatalogue(catalogue);
  if (!Array.isArray(allowedHosts) || !allowedHosts.length
      || !Array.isArray(allowedOrigins) || allowedOrigins.some(value => new URL(value).origin !== value)) {
    throw new TypeError('Explicit service hosts and client origins are required');
  }
  const origins = new Set(allowedOrigins);
  const originHosts = allowedOrigins.map(value => new URL(value).hostname);
  const handler = createMcpHandler(() => createCatalogueServer(catalogue, viewHtml), { responseMode: 'json' });
  return {
    async fetch(request, env = {}) {
      const url = new URL(request.url);
      const rejected = hostHeaderValidationResponse(request, allowedHosts);
      if (rejected || !allowedHosts.includes(url.hostname)) return rejected ?? error(403, 'Service host is not allowed');
      const limiter = rateLimiter ?? env.MCP_RATE_LIMIT;
      if (limiter) {
        const result = await limiter.limit({ key: request.headers.get('CF-Connecting-IP') || 'local' });
        if (!result.success) return error(429, 'Catalogue request limit reached', { 'Retry-After': '60' });
      }
      const discovery = discoveryResponse(request, catalogue);
      if (discovery) return discovery;
      const origin = request.headers.get('Origin');
      if (origin !== null && (!origins.has(origin) || originValidationResponse(request, originHosts))) {
        return error(403, 'Client origin is not allowed');
      }
      const cors = response => {
        const headers = new Headers(response.headers);
        headers.set('Cache-Control', 'no-store');
        headers.set('X-Content-Type-Options', 'nosniff');
        if (origin !== null) {
          headers.set('Access-Control-Allow-Origin', origin);
          headers.set('Vary', 'Origin');
        }
        return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
      };
      if (url.pathname !== '/mcp' || url.search) return cors(error(404, 'Use the public MCP endpoint at /mcp'));
      if (request.method === 'OPTIONS') {
        if (origin === null) return error(403, 'A browser preflight needs an allowed origin');
        return cors(new Response(null, { status: 204, headers: {
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Accept, MCP-Protocol-Version, Mcp-Method, Mcp-Name',
          'Access-Control-Max-Age': '600'
        } }));
      }
      if (request.method !== 'POST') return cors(error(405, 'Use POST for MCP requests', { Allow: 'POST, OPTIONS' }));
      if (request.headers.get('Content-Type')?.split(';', 1)[0].trim().toLowerCase() !== 'application/json') {
        return cors(error(415, 'MCP requests must be application/json'));
      }
      const bytes = await boundedBody(request);
      if (bytes === null) return cors(error(413, 'MCP request exceeds 16384 bytes'));
      try {
        // A small legacy batch can otherwise repeat the large UI resource many
        // times. This service implements single JSON-RPC messages only.
        const message = JSON.parse(new TextDecoder().decode(bytes));
        if (Array.isArray(message)) {
          return cors(new Response(JSON.stringify({ jsonrpc: '2.0', id: null,
            error: { code: -32600, message: 'JSON-RPC batch requests are not supported' } }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }));
        }
        return cors(await handler.fetch(new Request(request, { body: bytes })));
      } catch (failure) {
        return cors(error(failure instanceof SyntaxError ? 400 : 500,
          failure instanceof SyntaxError ? 'Invalid JSON request' : 'The public catalogue is temporarily unavailable'));
      }
    },
    close: () => handler.close()
  };
}
