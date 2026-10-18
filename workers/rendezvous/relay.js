// Only authenticated, live room adapters may ask this module for credentials.
// TURN sees encrypted traffic; neither signaling nor logs carry shared content.
export const RELAY_TTL = 60 * 60;
const MIN_REQUEST_INTERVAL = 60 * 1000;
const RELAY_API = 'https://rtc.live.cloudflare.com/v1/turn/keys/';
const TOOLS = new Set(['share-text', 'share-tab', 'remote-camera', 'walkie-talkie', 'voice-oncall']);

export function relayPolicy(env) {
  const number = (key, fallback, min, max) => {
    const value = env[key] === undefined ? fallback : Number(env[key]);
    return Number.isSafeInteger(value) && value >= min && value <= max ? value : null;
  };
  const maxPeers = number('RELAY_MAX_PEERS', 10, 1, 16);
  const maxSessionSeconds = number('RELAY_MAX_SESSION_SECONDS', 8 * 60 * 60, 5 * 60, 24 * 60 * 60);
  const maxCredentials = number('RELAY_MAX_CREDENTIALS', 12, 1, 48);
  return maxPeers && maxSessionSeconds && maxCredentials ? { maxPeers, maxSessionSeconds, maxCredentials } : null;
}

export function relayEnabled(env, tool) {
  // A deployment can disable an expensive service without changing its pages.
  if (!TOOLS.has(tool) || !relayPolicy(env)) return false;
  if (env.RELAY_TOOLS === undefined) return true;
  return String(env.RELAY_TOOLS).split(',').map((value) => value.trim()).includes(tool);
}

export async function relayServers(env, fetchImpl = fetch, ttl = RELAY_TTL) {
  if (!env.TURN_KEY_ID || !env.TURN_KEY_TOKEN) return null;
  let response;
  try {
    response = await fetchImpl(`${RELAY_API}${encodeURIComponent(env.TURN_KEY_ID)}/credentials/generate-ice-servers`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.TURN_KEY_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ttl }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;
    const body = await response.json();
    const servers = Array.isArray(body?.iceServers) ? body.iceServers : [];
    const valid = [];
    for (const server of servers) {
      if (typeof server?.username !== 'string' || !server.username || server.username.length > 1024
          || typeof server.credential !== 'string' || !server.credential || server.credential.length > 2048) continue;
      const urls = typeof server.urls === 'string' ? [server.urls] : server.urls;
      if (!Array.isArray(urls) || !urls.length || urls.length > 8 || urls.some((url) => typeof url !== 'string'
          || url.length > 256 || /\s/.test(url) || !/^turns?:[a-z0-9.-]+(?::\d{1,5})?(?:\?transport=(?:udp|tcp))?$/i.test(url))) continue;
      valid.push({ urls: [...urls], username: server.username, credential: server.credential });
    }
    return valid.length && valid.length <= 8 ? valid : null;
  } catch { return null; }
}

export function validRelayRequest(frame) {
  return frame?.type === 'relay-request' && Object.keys(frame).length === 2
    && typeof frame.id === 'string' && /^[a-z0-9-]{1,64}$/i.test(frame.id);
}

/**
 * Authorization is checked again after minting: a stopped host or replaced
 * generation must not deliver a late credential. Only a timestamp is retained
 * in the socket attachment, so hibernation cannot erase the issuance limit.
 */
export async function answerRelayRequest(ws, frame, {
  env, authorized = () => false, current = () => true, tool,
  now = () => Date.now(), fetchImpl = fetch,
} = {}) {
  if (frame?.type !== 'relay-request') return false;
  if (!validRelayRequest(frame)) return true;
  const allowed = () => current() && ws.readyState === 1
    && (typeof authorized === 'function' ? authorized() : authorized === true);
  const reply = (fields) => {
    if (!current() || ws.readyState !== 1) return;
    try { ws.send(JSON.stringify({ type: 'relay-credentials', id: frame.id, ...fields })); } catch {}
  };
  if (!allowed()) { reply({ error: 'forbidden' }); return true; }
  if (!relayEnabled(env, tool)) { reply({ error: 'unavailable' }); return true; }
  const policy = relayPolicy(env);
  const attachment = ws.deserializeAttachment();
  if (!attachment) return true;
  const issuedAt = now();
  if (Number.isFinite(attachment.relayRequestedAt) && issuedAt - attachment.relayRequestedAt < MIN_REQUEST_INTERVAL) {
    reply({ error: 'limited' }); return true;
  }
  const startedAt = attachment.relaySessionStartedAt ?? issuedAt;
  const issued = attachment.relayCredentialsIssued ?? 0;
  const ttl = Math.min(RELAY_TTL, Math.floor((startedAt + policy.maxSessionSeconds * 1000 - issuedAt) / 1000));
  if (!Number.isSafeInteger(startedAt) || !Number.isSafeInteger(issued) || issued >= policy.maxCredentials || ttl < 120) {
    reply({ error: 'limited' }); return true;
  }
  const next = { ...attachment, relayRequestedAt: issuedAt,
    relaySessionStartedAt: startedAt, relayCredentialsIssued: issued + 1 };
  // Moderation state shares this attachment. Refuse before minting rather than
  // exceed the runtime limit or overwrite a room's existing authority.
  if (new TextEncoder().encode(JSON.stringify(next)).length > 2048) {
    reply({ error: 'limited' }); return true;
  }
  try { ws.serializeAttachment(next); }
  catch { reply({ error: 'limited' }); return true; }
  const iceServers = await relayServers(env, fetchImpl, ttl);
  if (!allowed() || ws.deserializeAttachment()?.relayRequestedAt !== issuedAt) return true;
  reply(iceServers ? { iceServers, expiresAt: issuedAt + ttl * 1000 } : { error: 'unavailable' });
  return true;
}
