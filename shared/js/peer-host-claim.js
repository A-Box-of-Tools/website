/**
 * Proof that a text, tab or camera room is still this page's own. The room's
 * name is something people say aloud, so unlike a voice room's address it cannot
 * carry a credential. The page names a digest when it claims the room, and that
 * digest is only an identifier: it reaches an invocation log, and replacing a
 * socket takes the key behind it. The key leaves the page only when the
 * rendezvous asks for it, which it does when that digest already holds the room.
 */
export async function createHostClaim() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const key = btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key)));
  return { key, digest: Array.from(digest, (value) => value.toString(16).padStart(2, '0')).join('') };
}

export function holderUrl(value, claim = null) {
  const url = new URL(value);
  url.searchParams.delete('holder');
  if (claim !== null) url.searchParams.set('holder', claim.digest);
  return url.href;
}

/** True when the frame was the request for proof, whether or not it was answered. */
export function answerHostProve(frame, claim, send) {
  if (frame?.type !== 'host-prove') return false;
  if (claim !== null) send({ type: 'host-proof', key: claim.key });
  return true;
}
