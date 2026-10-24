import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import { AppBridge, PostMessageTransport } from '@modelcontextprotocol/ext-apps/app-bridge';
import * as z from 'zod/v4';

z.config({ jitless: true });

const MIME = 'text/html;profile=mcp-app';
const info = { name: 'Local abox.tools preview host', version: 'local-preview' };
const status = document.getElementById('status');
const submit = document.getElementById('send');
const locale = document.getElementById('host-locale');
const query = document.getElementById('host-query');
const container = document.getElementById('app-container');
const events = document.getElementById('events');
let bridge;
let frame;
let client;
let resource;
let tool;
let approved;

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
  if (bridge) {
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
  frame.setAttribute('sandbox', 'allow-scripts allow-same-origin');
  container.append(frame);
  bridge = new AppBridge(client, info, {
    openLinks: {}, serverTools: client.getServerCapabilities()?.tools,
    serverResources: client.getServerCapabilities()?.resources,
  }, { hostContext: { theme: 'light', platform: 'web', displayMode: 'inline', availableDisplayModes: ['inline'],
    locale: args.locale, containerDimensions: { width: container.clientWidth, maxHeight: 10000 } } });
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
  bridge.onsandboxready = async () => {
    log('Sandbox proxy ready on its separate origin');
    await activeBridge.sendSandboxResourceReady({ html: resource.text, csp: resource._meta.ui.csp, sandbox: 'allow-scripts' });
  };
  bridge.oninitialized = async () => {
    await activeBridge.sendToolInput({ arguments: args });
    await activeBridge.sendToolResult(result);
    log('App initialized; actual tool input and result delivered through AppBridge');
    status.textContent = 'App connected through the MCP SDK and AppBridge.';
    status.dataset.state = 'ready';
  };
  await bridge.connect(new PostMessageTransport(frame.contentWindow, frame.contentWindow));
  const sandbox = new URL(`http://${location.hostname}:8789/sandbox.html`);
  sandbox.searchParams.set('csp', JSON.stringify(resource._meta.ui.csp));
  frame.src = sandbox.href;
}

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
  await client.connect(new StreamableHTTPClientTransport(new URL(`http://${location.hostname}:8787/mcp`)));
  log('Connected to the local Worker with StreamableHTTPClientTransport');
  tool = (await client.listTools()).tools.find(entry => entry.name === 'find_browser_tools');
  if (!tool?._meta?.ui?.resourceUri) throw new Error('The catalogue tool does not declare an App resource.');
  const read = await client.readResource({ uri: tool._meta.ui.resourceUri });
  if (read.contents.length !== 1) throw new Error('Expected one App resource.');
  resource = read.contents[0];
  if (resource.mimeType !== MIME || typeof resource.text !== 'string' || !resource._meta?.ui?.csp) throw new Error('Invalid App HTML resource or CSP metadata.');
  log(`resources/read ${resource.uri}: actual ${resource.mimeType} HTML received`);
  const parsed = new DOMParser().parseFromString(resource.text, 'text/html');
  const catalogue = JSON.parse(parsed.getElementById('catalogue-data').textContent);
  approved = new Set(Object.values(catalogue.locales).flatMap(section => section.tools.map(entry => safeToolUrl(entry.url))));
  locale.replaceChildren();
  const names = new Intl.DisplayNames(['en'], { type: 'language' });
  for (const code of Object.keys(catalogue.locales)) {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = names.of(code);
    locale.append(option);
  }
  await submitSearch();
  submit.disabled = false;
} catch (error) {
  status.textContent = `Local preview unavailable: ${error.message}. Start the Worker on port 8787.`;
  status.dataset.state = 'error';
}
