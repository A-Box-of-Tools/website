import { CODE_PATTERN as ROOM_CODE_PATTERN } from './shared/room-names.js';

// A tab invitation must never join another tool's identically named room.
export const TOOL = 'share-tab';
export const PROTOCOL = 'share-tab-v1';
export const CHANNEL = 'share-tab-control';
export const CODE_PATTERN = /^tab-[a-z2-7]{16}$/;

export function makeCode(random = globalThis.crypto) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz234567';
  const bytes = random.getRandomValues(new Uint8Array(16));
  return `tab-${Array.from(bytes, (byte) => alphabet[byte & 31]).join('')}`;
}

export function parseCode(value) {
  if (typeof value !== 'string' || value.length > 2048) return null;
  let code = value.trim();
  if (/^https?:\/\//i.test(code)) {
    try { code = new URL(code).hash.slice(1); } catch { return null; }
  }
  code = code.replace(/^#/, '').toLowerCase();
  return ROOM_CODE_PATTERN.test(code) && CODE_PATTERN.test(code) ? code : null;
}

export function viewerLink(href, code) {
  if (typeof code !== 'string' || !CODE_PATTERN.test(code)) throw new Error('code.invalid');
  const url = new URL(href);
  url.search = '';
  url.hash = code;
  return url.href;
}

export function controlMessage(text) {
  if (typeof text !== 'string' || text.length > 1024) return null;
  try {
    const value = JSON.parse(text);
    if (!value || value.protocol !== PROTOCOL || Array.isArray(value)) return null;
    if (!['hello', 'request', 'approved', 'approval-ack', 'denied', 'busy', 'ended'].includes(value.type)) return null;
    if (value.type === 'request' && (typeof value.note !== 'string' || value.note.length > 80)) return null;
    return value;
  } catch { return null; }
}

export function relayServer(values) {
  if (!Array.isArray(values)) return null;
  for (const value of values) {
    if (typeof value?.username !== 'string' || !value.username || value.username.length > 2048
        || typeof value.credential !== 'string' || !value.credential || value.credential.length > 2048) continue;
    const urls = typeof value.urls === 'string' ? [value.urls] : value.urls;
    if (!Array.isArray(urls) || !urls.length || urls.length > 8
        || urls.some((url) => typeof url !== 'string' || url.length > 512 || !/^turns?:[^\s]+$/i.test(url))) continue;
    return { urls: [...urls], username: value.username, credential: value.credential };
  }
  return null;
}
