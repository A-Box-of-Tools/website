import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import { AppBridge, PostMessageTransport } from '@modelcontextprotocol/ext-apps/app-bridge';
import * as z from 'zod/v4';
import { decodeCatalogueData, decodeUtf8Data } from './view-data.mjs';

z.config({ jitless: true });

const MIME = 'text/html;profile=mcp-app';
const service = __MCP_SERVICE__;
if (!['local', 'dev'].includes(service)) throw new TypeError('Unexpected fixed preview service');
const endpoint = service === 'dev' ? 'https://mcp-dev.abox.tools/mcp'
  : `http://${location.hostname}:8787/mcp`;
const info = { name: 'Local abox.tools preview host', version: 'local-preview' };
const status = document.getElementById('status');
const submit = document.getElementById('send');
const locale = document.getElementById('host-locale');
const query = document.getElementById('host-query');
const container = document.getElementById('app-container');
const events = document.getElementById('events');
const theme = document.getElementById('host-theme');
const width = document.getElementById('host-width');
document.getElementById('service-endpoint').textContent = endpoint;
document.getElementById('service-local').hidden = service !== 'local';
document.getElementById('service-dev').hidden = service !== 'dev';
let bridge;
let frame;
let client;
let resource;
let tool;
let approved;
let verified = false;
let verifiedModuleHash;
let verifiedBootstrapHash;

function hostContext() {
  return { theme: theme.value === 'dark' ? 'dark' : 'light', platform: 'web',
    displayMode: 'inline', availableDisplayModes: ['inline'], locale: locale.value,
    containerDimensions: { width: container.clientWidth, maxHeight: 10000 } };
}

function displayContext() {
  container.style.width = width.value === '390' ? '390px' : '100%';
  if (bridge) bridge.setHostContext(hostContext());
}
theme.addEventListener('change', displayContext);
width.addEventListener('change', displayContext);
document.getElementById('display-controls').addEventListener('submit', event => event.preventDefault());
window.addEventListener('resize', displayContext);

async function verifyResource() {
  const fields = ['connectDomains', 'resourceDomains', 'frameDomains', 'baseUriDomains'];
  const csp = resource._meta.ui.csp;
  if (!csp || Object.keys(csp).some(key => !fields.includes(key))
      || fields.some(key => !Array.isArray(csp[key]) || csp[key].length)) {
    throw new Error('This local host renders only the catalogue App with no external domains.');
  }
  const response = await fetch('/view-receipt.json', { cache: 'no-store' });
  if (!response.ok) throw new Error('The local public resource receipt is unavailable.');
  const receipt = await response.json();
  const bytes = new TextEncoder().encode(resource.text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const sha256 = Array.from(new Uint8Array(digest), value => value.toString(16).padStart(2, '0')).join('');
  if (receipt.algorithm !== 'SHA-256' || !/^[0-9a-f]{64}$/.test(receipt.sha256)
      || receipt.sha256 !== sha256 || receipt.bytes !== bytes.byteLength) {
    throw new Error('The live MCP App HTML differs from the local build. Rebuild/redeploy as intended, then restart this preview.');
  }
  const parsed = new DOMParser().parseFromString(resource.text, 'text/html');
  const modules = [...parsed.querySelectorAll('script[type="module"]')];
  if (modules.length !== 1 || modules[0].hasAttribute('src')
      || !/^[A-Za-z0-9+/]{43}=$/.test(receipt.bootstrapSha256)
      || !/^[A-Za-z0-9+/]{43}=$/.test(receipt.moduleSha256)) {
    throw new Error('Expected a self-contained App bootstrap and module with exact SHA-256 receipts.');
  }
  const bootstrapDigest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(modules[0].textContent));
  const bootstrapHash = btoa(String.fromCharCode(...new Uint8Array(bootstrapDigest)));
  if (bootstrapHash !== receipt.bootstrapSha256) throw new Error('The actual bootstrap differs from the locally allowed script hash.');
  const packed = parsed.getElementById('app-module-data');
  if (packed?.dataset.encoding !== 'gzip-base64') throw new Error('Expected a compressed build module.');
  const source = await decodeUtf8Data(packed.textContent, Number(packed.dataset.bytes));
  const moduleDigest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(source));
  const moduleHash = btoa(String.fromCharCode(...new Uint8Array(moduleDigest)));
  if (moduleHash !== receipt.moduleSha256 || packed.dataset.sha256 !== moduleHash) {
    throw new Error('The decoded App script differs from the locally allowed script hash.');
  }
  verifiedBootstrapHash = bootstrapHash;
  verifiedModuleHash = moduleHash;
  verified = true;
  document.getElementById('resource-receipt').textContent = `Verified actual MCP resource: SHA-256 ${sha256}, ${bytes.byteLength} bytes.`;
  log(`Live resources/read HTML matches local served HTML: SHA-256 ${sha256}`);
}

function log(message) {
  const item = document.createElement('li');
  item.textContent = message;
  events.append(item);
}

function safeToolUrl(value) {
  const url = new URL(value);
  if (url.origin !== 'https://abox.tools' || url.username || url.password || url.search || url.hash
      || !/^\/(?:[a-zA-Z0-9-]+\/)+$/.test(url.pathname)) throw new TypeError('Unexpected tool address');
  return url.href;
}

async function showApp(args) {
  if (!verified) throw new Error('Actual MCP App resource integrity must be verified before rendering.');
  if (bridge) {
    clearTimeout(frame.readyTimer);
    await Promise.race([bridge.teardownResource({}).catch(() => {}), new Promise(resolve => setTimeout(resolve, 1000))]);
    await bridge.close();
    frame.remove();
  }
  const result = await client.callTool({ name: tool.name, arguments: args });
  if (result.isError) throw new Error(result.content.filter(item => item.type === 'text').map(item => item.text).join('\n'));
  document.getElementById('text-fallback').textContent = result.content.filter(item => item.type === 'text').map(item => item.text).join('\n\n');
  log(`tools/call ${tool.name}: ${result.structuredContent?.total ?? 'unknown'} matches (${args.locale})`);
  frame = document.createElement('iframe');
  frame.title = 'Sandboxed abox.tools catalogue App';
  frame.setAttribute('sandbox', 'allow-scripts');
  frame.referrerPolicy = 'no-referrer';
  const policy = ["default-src 'none'", `script-src 'sha256-${verifiedBootstrapHash}' 'sha256-${verifiedModuleHash}'`,
    "style-src 'unsafe-inline'", "connect-src 'none'", "img-src data: blob:",
    "font-src 'none'", "media-src 'none'", "worker-src 'none'", "frame-src 'none'",
    "object-src 'none'", "base-uri 'none'", "form-action 'none'"].join('; ');
  if (!/<head(?:\s[^>]*)?>/i.test(resource.text)) throw new Error('Expected a complete verified App HTML document.');
  // Only this restrictive policy is added. Both the bootstrap and decoded
  // build module retain the exact sources verified against the local receipt.
  frame.srcdoc = resource.text.replace(/<head(?:\s[^>]*)?>/i, head => head
    + `<meta http-equiv="Content-Security-Policy" content="${policy}">`);
  bridge = new AppBridge(client, info, {
    openLinks: {}, serverTools: client.getServerCapabilities()?.tools,
    serverResources: client.getServerCapabilities()?.resources,
  }, { hostContext: hostContext() });
  const activeBridge = bridge;
  const activeFrame = frame;
  bridge.onopenlink = async ({ url }) => {
    let target;
    try { target = safeToolUrl(url); } catch { return { isError: true }; }
    if (!approved.has(target)) return { isError: true };
    const link = document.getElementById('selected-link');
    link.href = target;
    link.textContent = target;
    document.getElementById('link-result').hidden = false;
    log(`ui/open-link: ${target}`);
    window.open(target, '_blank', 'noopener,noreferrer');
    return {};
  };
  bridge.onsizechange = ({ height }) => {
    if (Number.isFinite(height)) activeFrame.style.height = `${Math.min(10000, Math.max(200, Math.ceil(height)))}px`;
  };
  bridge.onerror = () => { status.textContent = 'The App bridge reported an error. See the browser console.'; status.dataset.state = 'error'; };
  bridge.oninitialized = async () => {
    clearTimeout(activeFrame.readyTimer);
    await activeBridge.sendToolInput({ arguments: args });
    await activeBridge.sendToolResult(result);
    log('App initialized; actual tool input and result delivered through AppBridge');
    status.textContent = 'App connected through the MCP SDK and AppBridge.';
    status.dataset.state = 'ready';
  };
  frame.addEventListener('load', () => log('Verified opaque srcdoc App frame finished loading'));
  frame.addEventListener('error', () => {
    status.textContent = 'The local sandbox frame could not load.';
    status.dataset.state = 'error';
  });
  frame.readyTimer = setTimeout(() => {
    if (frame !== activeFrame) return;
    status.textContent = 'The verified App frame has not initialized its bridge. Check the frame loading and browser CSP messages.';
    status.dataset.state = 'error';
    log('Direct App initialization timeout; no tool inputs or resource contents were logged');
  }, 10000);
  container.append(frame);
  const frameWindow = frame.contentWindow;
  if (!frameWindow) throw new Error('The browser did not create an App frame browsing context.');
  // connect() installs its message listener synchronously before its first
  // await. The iframe's asynchronous navigation cannot dispatch a message
  // until this host task has installed that listener.
  await bridge.connect(new PostMessageTransport(frameWindow, frameWindow));
  log('Verified App srcdoc attached with exact bootstrap/module hashes and AppBridge transport listening');
}

window.addEventListener('message', event => {
  if (!frame || event.source !== frame.contentWindow
      || event.origin !== 'null') return;
  const message = event.data;
  if (message?.jsonrpc === '2.0'
      && ['ui/initialize', 'ui/notifications/initialized'].includes(message.method)) {
    log(`Direct opaque App message: ${message.method}`);
  }
});

async function submitSearch() {
  if (Array.from(query.value).length > 200 || !query.value.isWellFormed() || /[\u0000-\u001f\u007f]/u.test(query.value)) {
    throw new TypeError('Use up to 200 characters of public catalogue keywords.');
  }
  status.textContent = 'Loading the actual MCP App resource…';
  status.dataset.state = 'loading';
  await showApp({ query: query.value, locale: locale.value, limit: 20 });
}

document.getElementById('search-form').addEventListener('submit', async event => {
  event.preventDefault();
  submit.disabled = true;
  try { await submitSearch(); } catch (error) { status.textContent = error.message; status.dataset.state = 'error'; }
  finally { submit.disabled = false; }
});

try {
  if (!['http://localhost:8788', 'http://127.0.0.1:8788'].includes(location.origin)) throw new Error('Use the local preview server.');
  client = new Client(info, { versionNegotiation: { mode: 'auto' }, capabilities: {
    extensions: { 'io.modelcontextprotocol/ui': { mimeTypes: [MIME] } },
  } });
  log(`Connecting to fixed ${service} service: ${endpoint}`);
  await client.connect(new StreamableHTTPClientTransport(new URL(endpoint)));
  log(`Connected to ${endpoint} with StreamableHTTPClientTransport`);
  tool = (await client.listTools()).tools.find(entry => entry.name === 'find_browser_tools');
  if (!tool?._meta?.ui?.resourceUri) throw new Error('The catalogue tool does not declare an App resource.');
  const read = await client.readResource({ uri: tool._meta.ui.resourceUri });
  if (read.contents.length !== 1) throw new Error('Expected one App resource.');
  resource = read.contents[0];
  if (resource.mimeType !== MIME || typeof resource.text !== 'string' || !resource._meta?.ui?.csp) throw new Error('Invalid App HTML resource or CSP metadata.');
  log(`resources/read ${resource.uri}: actual ${resource.mimeType} HTML received`);
  await verifyResource();
  const parsed = new DOMParser().parseFromString(resource.text, 'text/html');
  const data = parsed.getElementById('catalogue-data');
  if (data?.dataset.encoding !== 'gzip-base64') throw new Error('Expected the compressed public catalogue.');
  const catalogue = await decodeCatalogueData(data.textContent, Number(data.dataset.bytes));
  approved = new Set(Object.values(catalogue.locales).flatMap(section => section.tools.map(entry => safeToolUrl(entry.url))));
  locale.replaceChildren();
  const names = new Intl.DisplayNames(['en'], { type: 'language' });
  for (const code of Object.keys(catalogue.locales)) {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = names.of(code);
    locale.append(option);
  }
  displayContext();
  await submitSearch();
  submit.disabled = false;
} catch (error) {
  const hint = document.getElementById('service-phrases').dataset[service];
  status.textContent = `MCP preview unavailable for ${endpoint}: ${error.message}. ${hint}`;
  status.dataset.state = 'error';
}
