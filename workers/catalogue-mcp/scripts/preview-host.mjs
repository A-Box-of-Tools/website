import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const ui = new URL('../ui/', import.meta.url);
const hostHtml = await readFile(new URL('preview-host.html', ui));
const sandboxHtml = await readFile(new URL('sandbox.html', ui));
const bundled = await build({
  entryPoints: [fileURLToPath(new URL('preview-host.mjs', ui))],
  bundle: true, write: false, format: 'esm', platform: 'browser', target: 'es2022',
  legalComments: 'none', logLevel: 'warning',
});
const hostJs = bundled.outputFiles[0].contents;
const hostOrigins = ['http://localhost:8788', 'http://127.0.0.1:8788'];
const servers = [];

const hostPolicy = [
  "default-src 'none'", "script-src 'self'", "style-src 'unsafe-inline'",
  'connect-src http://localhost:8787 http://127.0.0.1:8787',
  'frame-src http://localhost:8789 http://127.0.0.1:8789',
  "base-uri 'none'", "object-src 'none'", "form-action 'none'", "frame-ancestors 'none'",
].join('; ');

function sandboxPolicy(raw) {
  const csp = JSON.parse(raw);
  const fields = ['connectDomains', 'resourceDomains', 'frameDomains', 'baseUriDomains'];
  if (!csp || typeof csp !== 'object' || Array.isArray(csp)
      || Object.keys(csp).some(key => !fields.includes(key))
      || fields.some(key => !Array.isArray(csp[key]) || csp[key].length !== 0)) {
    throw new TypeError('This local harness accepts the catalogue resource with no external domains');
  }
  return [
    "default-src 'none'", "script-src 'unsafe-inline'", "style-src 'unsafe-inline'",
    "connect-src 'none'", "img-src data: blob:", "font-src 'none'", "media-src 'none'",
    "worker-src 'none'", "object-src 'none'", "base-uri 'none'", "form-action 'none'",
    // The proxy creates one srcdoc frame; the view adds a policy denying descendants.
    "frame-src 'self'", `frame-ancestors ${hostOrigins.join(' ')}`,
  ].join('; ');
}

function serve(port, route) {
  const validHosts = new Set([`localhost:${port}`, `127.0.0.1:${port}`]);
  const server = createServer((request, response) => {
    const send = (status, type, body, policy) => {
      response.writeHead(status, {
        'Content-Type': `${type}; charset=utf-8`, 'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), usb=(), payment=()',
        ...(policy ? { 'Content-Security-Policy': policy } : {}),
      });
      response.end(request.method === 'HEAD' ? undefined : body);
    };
    if (!validHosts.has(request.headers.host)) return send(403, 'text/plain', 'Loopback host required');
    if (!['GET', 'HEAD'].includes(request.method)) return send(405, 'text/plain', 'Use GET');
    if (!request.url || request.url.length > 8192) return send(414, 'text/plain', 'Request target too long');
    try {
      route(new URL(request.url, `http://${request.headers.host}`), send);
    } catch {
      send(400, 'text/plain', 'Invalid local preview request');
    }
  });
  servers.push(server);
  server.on('error', error => {
    console.error(`Local preview port ${port}: ${error.message}`);
    process.exitCode = 1;
    for (const active of servers) active.close();
  });
  server.listen(port, '127.0.0.1');
  return server;
}

const host = serve(8788, (url, send) => {
  if (url.search) return send(404, 'text/plain', 'Not found');
  if (url.pathname === '/' || url.pathname === '/index.html') return send(200, 'text/html', hostHtml, hostPolicy);
  if (url.pathname === '/preview-host.js') return send(200, 'text/javascript', hostJs, hostPolicy);
  return send(404, 'text/plain', 'Not found');
});
const sandbox = serve(8789, (url, send) => {
  if (url.pathname !== '/sandbox.html') return send(404, 'text/plain', 'Not found');
  if (url.searchParams.size !== 1 || url.searchParams.getAll('csp').length !== 1) {
    return send(400, 'text/plain', 'Resource CSP required');
  }
  return send(200, 'text/html', sandboxHtml, sandboxPolicy(url.searchParams.get('csp')));
});
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => {
  host.close();
  sandbox.close();
});
console.log('Local MCP App host: http://localhost:8788/');
console.log('Sandbox proxy: http://localhost:8789/; MCP Worker must already run at http://localhost:8787/mcp.');
