export const validCode = value => typeof value === 'string' && /^[0-9a-f]{64}$/i.test(value);
export const validKey = value => typeof value === 'string' && /^[A-Za-z0-9_-]{43}$/.test(value);

function encode(bytes) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function makeSenderKey() {
  return encode(crypto.getRandomValues(new Uint8Array(32)));
}

export async function codeForKey(key) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key));
  return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function makeInboxIdentity() {
  const key = makeSenderKey();
  return { code: await codeForKey(key), key };
}

export async function derivePasswordProof(code, password) {
  if (!password) return null;
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bytes = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', iterations: 120000, salt: new TextEncoder().encode(`voice-inbox:${code}`) }, material, 256);
  return encode(new Uint8Array(bytes));
}
