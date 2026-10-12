import { CODE_PATTERN, normalize } from './shared/room-names.js';

// The worker's tool namespace and this control handshake keep an identically
// named text share from becoming a camera invitation.
export const PROTOCOL = 'remote-camera-v1';
export const TOOL = 'remote-camera';
export { CODE_PATTERN, normalize };

export function makeCode(random = globalThis.crypto) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz234567';
  const bytes = random.getRandomValues(new Uint8Array(12));
  return `cam-${Array.from(bytes, (byte) => alphabet[byte & 31]).join('')}`;
}

export function parseCode(value) {
  if (typeof value !== 'string' || value.length > 2048) return null;
  let code = value.trim();
  if (/^https?:\/\//i.test(code)) {
    try { code = new URL(code).hash.slice(1); } catch { return null; }
  }
  code = code.replace(/^#/, '').toLowerCase();
  return CODE_PATTERN.test(code) ? code : null;
}

export function viewerLink(href, code) {
  if (!CODE_PATTERN.test(code)) throw new Error('code.invalid');
  const url = new URL(href);
  url.search = '';
  url.hash = code;
  return url.href;
}

export function controlMessage(text) {
  if (typeof text !== 'string' || text.length > 1024) return null;
  try {
    const value = JSON.parse(text);
    if (!value || value.protocol !== PROTOCOL) return null;
    if (['hello', 'request', 'approved', 'approval-ack', 'denied', 'busy', 'ended'].includes(value.type)) {
      if (value.type === 'request' && (typeof value.note !== 'string' || value.note.length > 80)) return null;
      return value;
    }
  } catch {}
  return null;
}
