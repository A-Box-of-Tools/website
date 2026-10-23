// The code is a bearer secret for a directory, not a room password. Its
// domain-separated digest may identify that directory in a request URL;
// proving membership still requires the code inside the encrypted socket.
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const CODE = /^[0-9A-HJKMNP-TV-Z]{26}$/;
const IDENTIFIER = /^[a-f0-9]{64}$/;
const DOMAIN = 'abox.tools/private-discovery/v1\n';

export function normalizeGroupCode(value) {
  if (typeof value !== 'string' || value.length > 80) return null;
  const code = value.replace(/[ -]/g, '').toUpperCase();
  return CODE.test(code) ? code : null;
}

export function createGroupCode() {
  // 32 divides 256, so masking each independently random byte is unbiased.
  // The generated 26 symbols carry 130 bits instead of relying on chosen words.
  const bytes = crypto.getRandomValues(new Uint8Array(26));
  const code = [...bytes].map((value) => ALPHABET[value & 31]).join('');
  return [code.slice(0, 5), code.slice(5, 10), code.slice(10, 15),
    code.slice(15, 20), code.slice(20)].join('-');
}

export async function groupIdentifier(value) {
  const code = normalizeGroupCode(value);
  if (code === null) return null;
  const bytes = new TextEncoder().encode(DOMAIN + code);
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
  return [...digest].map((value) => value.toString(16).padStart(2, '0')).join('');
}

export function groupUrl(value, identifier = null) {
  if (identifier !== null && (typeof identifier !== 'string' || !IDENTIFIER.test(identifier))) {
    throw new Error('invalid-group-identifier');
  }
  const url = new URL(value);
  url.searchParams.delete('group');
  if (identifier !== null) url.searchParams.set('group', identifier);
  return url.href;
}
