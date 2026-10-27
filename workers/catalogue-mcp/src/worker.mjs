import { createMcpHandler, hostHeaderValidationResponse, originValidationResponse } from '@modelcontextprotocol/server';
import { createCatalogueServer } from './server.mjs';
import { validateCatalogue } from './search.mjs';
import { discoveryResponse, apexDiscoveryResponse } from './discovery.mjs';
import { A2A_PATH, A2A_VERSION, a2aResponse } from './a2a.mjs';

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

export function createWorker({ catalogue, viewHtml, allowedHosts, allowedOrigins, rateLimiter, requireRateLimiter = false }) {
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
      if (requireRateLimiter && typeof limiter?.limit !== 'function') {
        return error(503, 'Catalogue rate limiter is unavailable');
      }
      if (limiter) {
        try {
          const result = await limiter.limit({ key: request.headers.get('CF-Connecting-IP') || 'local' });
          const success = result?.success;
          if (success !== true) return success === false
            ? error(429, 'Catalogue request limit reached', { 'Retry-After': '60' })
            : error(503, 'Catalogue rate limiter is unavailable');
        } catch {
          return error(503, 'Catalogue rate limiter is unavailable');
        }
      }
      const apex = apexDiscoveryResponse(request, url);
      if (apex) return apex;
      const discovery = discoveryResponse(request, catalogue, url);
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
          headers.set('Access-Control-Expose-Headers', 'A2A-Version');
        }
        return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
      };
      if (!['/mcp', A2A_PATH].includes(url.pathname) || url.search) {
        return cors(error(404, 'Use the public MCP endpoint at /mcp or A2A endpoint at /a2a'));
      }
      if (request.method === 'OPTIONS') {
        if (origin === null) return error(403, 'A browser preflight needs an allowed origin');
        return cors(new Response(null, { status: 204, headers: {
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Accept, MCP-Protocol-Version, Mcp-Method, Mcp-Name, A2A-Version, A2A-Extensions',
          'Access-Control-Max-Age': '600'
        } }));
      }
      if (request.method !== 'POST') return cors(error(405, 'Use POST for catalogue requests', { Allow: 'POST, OPTIONS' }));
      if (request.headers.get('Content-Type')?.split(';', 1)[0].trim().toLowerCase() !== 'application/json') {
        return cors(error(415, 'Catalogue requests must be application/json'));
      }
      const bytes = await boundedBody(request);
      if (bytes === null) return cors(error(413, 'Catalogue request exceeds 16384 bytes'));
      try {
        // A small legacy batch can otherwise repeat the large UI resource many
        // times. This service implements single JSON-RPC messages only.
        const message = JSON.parse(new TextDecoder().decode(bytes));
        if (url.pathname === A2A_PATH) return cors(a2aResponse(catalogue, message, request.headers));
        if (Array.isArray(message)) {
          return cors(new Response(JSON.stringify({ jsonrpc: '2.0', id: null,
            error: { code: -32600, message: 'JSON-RPC batch requests are not supported' } }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }));
        }
        // The bounded body is already parsed for the batch guard. The SDK's
        // public parsedBody option preserves its protocol validation without
        // cloning, reading and parsing the same bytes a second time.
        return cors(await handler.fetch(request, { parsedBody: message }));
      } catch (failure) {
        if (url.pathname === A2A_PATH && failure instanceof SyntaxError) {
          return cors(new Response(JSON.stringify({ jsonrpc: '2.0', id: null,
            error: { code: -32700, message: 'Invalid JSON payload' } }),
          { status: 400, headers: { 'Content-Type': 'application/json', 'A2A-Version': A2A_VERSION } }));
        }
        return cors(error(failure instanceof SyntaxError ? 400 : 500,
          failure instanceof SyntaxError ? 'Invalid JSON request' : 'The public catalogue is temporarily unavailable'));
      }
    },
    close: () => handler.close()
  };
}
