import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const args = process.argv.slice(2);
if (args.length !== 0 && !(args.length === 2 && args[0] === '--service' && args[1] === 'dev')) {
  throw new TypeError('Use npm run preview, or npm run preview -- --service dev. Arbitrary endpoints are not accepted.');
}
const service = args.length ? 'dev' : 'local';
const endpoints = service === 'dev' ? ['https://mcp-dev.abox.tools/mcp']
  : ['http://localhost:8787/mcp', 'http://127.0.0.1:8787/mcp'];
const ui = new URL('../ui/', import.meta.url);
const hostHtml = await readFile(new URL('preview-host.html', ui));
const appHtml = await readFile(new URL('../generated/view.html', import.meta.url));
const appText = appHtml.toString('utf8');
const modules = [...appText.matchAll(/<script\s+type="module">([\s\S]*?)<\/script\s*>/gi)];
if (modules.length !== 1 || appText.includes('\r')) {
  throw new TypeError('Build one LF-only inline App module before starting the preview.');
}
const moduleSha256 = createHash('sha256').update(modules[0][1], 'utf8').digest('base64');
const viewReceipt = JSON.stringify({ algorithm: 'SHA-256',
  sha256: createHash('sha256').update(appHtml).digest('hex'), bytes: appHtml.byteLength,
  moduleSha256 });
const bundled = await build({
  entryPoints: [fileURLToPath(new URL('preview-host.mjs', ui))],
  bundle: true, write: false, format: 'esm', platform: 'browser', target: 'es2022',
  legalComments: 'none', logLevel: 'warning',
  define: { __MCP_SERVICE__: JSON.stringify(service) },
});
const hostJs = bundled.outputFiles[0].contents;

const hostPolicy = [
  "default-src 'none'", `script-src 'self' 'sha256-${moduleSha256}'`, "style-src 'unsafe-inline'",
  `connect-src ${endpoints.join(' ')} http://localhost:8788/view-receipt.json http://127.0.0.1:8788/view-receipt.json`,
  "frame-src 'self'",
  "base-uri 'none'", "object-src 'none'", "form-action 'none'", "frame-ancestors 'none'",
].join('; ');

function serveHost(route) {
  const validHosts = new Set(['localhost:8788', '127.0.0.1:8788']);
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
  server.on('error', error => {
    console.error(`Local preview port 8788: ${error.message}`);
    process.exitCode = 1;
    server.close();
  });
  server.listen(8788, '127.0.0.1');
  return server;
}

const host = serveHost((url, send) => {
  if (url.search) return send(404, 'text/plain', 'Not found');
  if (url.pathname === '/' || url.pathname === '/index.html') return send(200, 'text/html', hostHtml, hostPolicy);
  if (url.pathname === '/preview-host.js') return send(200, 'text/javascript', hostJs, hostPolicy);
  if (url.pathname === '/view-receipt.json') return send(200, 'application/json', viewReceipt, hostPolicy);
  return send(404, 'text/plain', 'Not found');
});
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => {
  host.close();
});
console.log('Local MCP App host: http://localhost:8788/');
console.log(`Local public App resource receipt: ${viewReceipt}`);
console.log(`Selected MCP service (${service}): ${endpoints.join(' or ')}`);
if (service === 'dev') console.log('Initial public keyword requests go to the deployed development service; local view filtering does not.');
