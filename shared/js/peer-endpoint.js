const PRODUCTION = 'wss://rendezvous.abox.tools';
const DEVELOPMENT = 'wss://rendezvous-dev.abox.tools';

// Preview rooms must never share the live service's sockets or discovery.
// The page address selects a fixed service; copied query strings cannot.
export function rendezvousEndpoint(href = globalThis.location?.href) {
  if (typeof href !== 'string') return PRODUCTION;
  try {
    const url = new URL(href);
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return DEVELOPMENT;
    if (url.protocol === 'https:' && (url.hostname === 'abox-preview.pages.dev'
        || url.hostname.endsWith('.abox-preview.pages.dev'))) return DEVELOPMENT;
  } catch {}
  return PRODUCTION;
}
