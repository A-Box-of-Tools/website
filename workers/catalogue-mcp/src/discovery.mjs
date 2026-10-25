import { SERVER_NAME } from './server.mjs';

const DISCOVERY_PATHS = new Set(['/', '/mcp/server-card', '/.well-known/mcp.json', '/.well-known/ai-catalog.json']);

function publicResponse(request, body, type) {
  let hash = 2166136261;
  for (let index = 0; index < body.length; index++) hash = Math.imul(hash ^ body.charCodeAt(index), 16777619) >>> 0;
  const etag = `W/"${hash.toString(16)}-${body.length}"`;
  const headers = { 'Content-Type': type, 'Cache-Control': 'public, max-age=300',
    'X-Content-Type-Options': 'nosniff', 'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, If-None-Match',
    'Access-Control-Expose-Headers': 'ETag', ETag: etag };
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (!['GET', 'HEAD'].includes(request.method)) {
    return new Response('Use GET for public discovery', { status: 405,
      headers: { ...headers, Allow: 'GET, HEAD, OPTIONS' } });
  }
  if (request.headers.get('If-None-Match') === etag) return new Response(null, { status: 304, headers });
  return new Response(request.method === 'HEAD' ? null : body, { headers });
}

export function discoveryResponse(request, catalogue, url = new URL(request.url)) {
  // MCP requests share this router but need none of the public document data.
  if (url.search || !DISCOVERY_PATHS.has(url.pathname)) return null;
  const endpoint = new URL('/mcp', url.origin).href;
  const card = {
    $schema: 'https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json',
    name: SERVER_NAME,
    version: catalogue.build.version,
    title: 'abox.tools public catalogue',
    description: 'Find public browser tools by task or format. No file processing or account.',
    websiteUrl: 'https://abox.tools/',
    repository: { url: 'https://github.com/A-Box-of-Tools/website', source: 'github',
      subfolder: 'workers/catalogue-mcp' },
    remotes: [{ type: 'streamable-http', url: endpoint }]
  };
  if (['/mcp/server-card', '/.well-known/mcp.json'].includes(url.pathname)) {
    return publicResponse(request, JSON.stringify(card), 'application/mcp-server-card+json');
  }
  if (url.pathname === '/.well-known/ai-catalog.json') {
    return publicResponse(request, JSON.stringify({ specVersion: '1.0', entries: [{
      identifier: `urn:air:${url.hostname}:mcp:catalogue`,
      type: 'application/mcp-server-card+json', url: new URL('/mcp/server-card', url.origin).href
    }] }), 'application/ai-catalog+json');
  }
  if (url.pathname !== '/') return null;
  const production = url.origin === 'https://mcp.abox.tools';
  const title = production ? 'abox.tools catalogue MCP' : 'abox.tools catalogue MCP — development';
  const sourceRef = production ? catalogue.build.revision : 'dev';
  const serviceNotice = production ? 'Public catalogue discovery service.'
    : 'Development service. Its presence does not mean a production MCP endpoint or registry listing exists.';
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>${title}</title>
<link rel="describedby" type="application/mcp-server-card+json" href="/mcp/server-card">
<link rel="ai-catalog" type="application/ai-catalog+json" href="/.well-known/ai-catalog.json">
</head><body><main><h1>${title}</h1>
<p>Connect an MCP client to this service’s <a href="/mcp">/mcp endpoint</a> using Streamable HTTP.</p>
<p>The public <code>find_browser_tools</code> tool searches tool names and descriptions. Apps-capable hosts can display an interactive catalogue. Text-only hosts receive the same public tool links.</p>
<p>Use public task or format keywords only. Initial MCP keywords go to this service; filtering inside its app stays local. Do not send filenames or private information. File uploads are not supported. There is no account or authentication requirement.</p>
<p>Open a chosen tool on <a href="https://abox.tools/">abox.tools</a> to process files in the browser running on that device. Optional network features are described on their own pages.</p>
<p><a href="/mcp/server-card">Server card</a> · <a href="/.well-known/ai-catalog.json">AI Catalog</a> · <a href="https://github.com/A-Box-of-Tools/website/tree/${sourceRef}/workers/catalogue-mcp">Source and setup</a></p>
<p>${serviceNotice}</p>
<p>Source build: <code>${catalogue.build.version}</code></p>
</main></body></html>`;
  return publicResponse(request, html, 'text/html; charset=utf-8');
}
