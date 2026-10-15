import { localDescription } from './shared/peer-network.js';

const FORMAT = 'share-tab-offline-v1';
export const OFFLINE_LIFETIME = 10 * 60 * 1000;

export function newOfflinePairing(random = globalThis.crypto, now = Date.now()) {
  const bytes = random.getRandomValues(new Uint8Array(16));
  return { session: Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(''), expires: now + OFFLINE_LIFETIME };
}

export function offlineBlock(pairing, description) {
  return JSON.stringify({ format: FORMAT, type: description.type, session: pairing.session,
    expires: pairing.expires, description: localDescription(description) });
}

export function readOfflineBlock(text, type, { now = Date.now(), pairing = null, checkExpiry = true } = {}) {
  const invalid = () => new Error(type === 'offer' ? 'offline.invalid-offer' : 'offline.invalid-answer');
  if (typeof text !== 'string' || text.length > 65536) throw invalid();
  let value;
  try { value = JSON.parse(text); } catch { throw invalid(); }
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length !== 5
      || value.format !== FORMAT || value.type !== type || !/^[a-f0-9]{32}$/.test(value.session)
      || !Number.isSafeInteger(value.expires) || value.expires <= 0
      || (checkExpiry && value.expires > now + OFFLINE_LIFETIME + 60000)
      || value.description?.type !== type || typeof value.description.sdp !== 'string'
      || value.description.sdp.length > 60000 || !value.description.sdp.startsWith('v=0')
      || !/^m=application\s/m.test(value.description.sdp) || /^m=(?:audio|video)\s/m.test(value.description.sdp)
      || (pairing && (value.session !== pairing.session || value.expires !== pairing.expires))) throw invalid();
  if (checkExpiry && value.expires <= now) throw new Error('offline.expired');
  return { session: value.session, expires: value.expires, description: localDescription(value.description) };
}
