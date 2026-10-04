// Discovery is a list of live, explicitly offered room codes. A public
// address is only a best-effort gateway match: shared carrier gateways can
// include strangers, and two devices on one LAN can use different addresses.
// Nothing here decides whether their eventual WebRTC connection is local.

export const DISCOVERY_SCOPE_HEADER = "x-rendezvous-discovery-scope";
export const CODE_PATTERN = /^[a-z0-9][a-z0-9-]{0,63}$/;
const SCOPE_PATTERN = /^[a-f0-9]{64}$/;
const LEASE_PATTERN = /^[A-Za-z0-9_-]{20,128}$/;
const MAX_OBSERVERS = 64;
const MAX_SHARES = 32;
const MAX_MESSAGE = 512;
const MAX_UPDATES = 120;

export function pageOrigin(value) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password
        || url.pathname !== "/" || url.search || url.hash) return null;
    if (url.origin === "https://abox.tools") return url.origin;
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") return url.origin;
    if (url.protocol === "https:" && url.hostname.endsWith(".abox-preview.pages.dev")) return url.origin;
  } catch {}
  return null;
}

function publicAddress(value) {
  if (typeof value !== "string" || value.length > 64) return null;
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(value)) {
    const octets = value.split(".").map(Number);
    if (octets.some((n, i) => n > 255 || String(n) !== value.split(".")[i])) return null;
    const [a, b, c] = octets;
    if (a === 0 || a === 10 || a === 127 || a >= 224
        || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254)
        || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)
        || (a === 192 && b === 0 && (c === 0 || c === 2)) || (a === 192 && b === 88 && c === 99)
        || (a === 198 && (b === 18 || b === 19)) || (a === 198 && b === 51 && c === 100)
        || (a === 203 && b === 0 && c === 113)) return null;
    return octets.join(".");
  }
  if (!/^[a-fA-F0-9:]+$/.test(value) || !value.includes(":")) return null;
  try {
    const address = new URL(`https://[${value}]/`).hostname.slice(1, -1);
    const first = parseInt(address.split(":")[0], 16);
    if (!Number.isInteger(first) || first < 0x2000 || first > 0x3fff || address.startsWith("2001:db8:")
        || address === "2a06:98c0:3600::103") return null;
    return address;
  } catch {
    return null;
  }
}

// CF-Connecting-IP is supplied by the edge, but a same-zone Worker may
// override it in a subrequest. Cross-zone Workers also share one fixed IPv6
// address. Neither is a browser gateway and neither may select a group.
export async function discoveryScope(request) {
  if (request.headers.has("CF-Worker")) return null;
  const address = publicAddress(request.headers.get("CF-Connecting-IP"));
  const origin = pageOrigin(request.headers.get("Origin"));
  if (address === null || origin === null) return null;
  const bytes = new TextEncoder().encode(`${origin}\n${address}`);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  return [...digest].map((n) => n.toString(16).padStart(2, "0")).join("");
}

export const validScope = (scope) => typeof scope === "string" && SCOPE_PATTERN.test(scope);
export const validPublication = (value) => value !== null && typeof value === "object" && !Array.isArray(value)
  && typeof value.code === "string" && CODE_PATTERN.test(value.code)
  && typeof value.lease === "string" && LEASE_PATTERN.test(value.lease);

async function privateBody(request) {
  const text = await request.text();
  if (text.length > MAX_MESSAGE) return null;
  try { return JSON.parse(text); } catch { return null; }
}

// Socket attachments are the whole list, including any pending lease check.
// Hibernation keeps them without storage writes or periodic wake-ups.
export class Discovery {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair("ping", "pong"));
  }

  async fetch(request) {
    const url = new URL(request.url);
    // Only Room stubs call this path; the public Worker never forwards it.
    if (url.pathname === "/_discovery/withdraw" && request.method === "POST") {
      const publication = await privateBody(request);
      if (!validPublication(publication)) return new Response(null, { status: 400 });
      for (const ws of this.ctx.getWebSockets("observer")) {
        const who = ws.deserializeAttachment();
        if (who?.publication?.code === publication.code && who.publication.lease === publication.lease) {
          ws.serializeAttachment({ ...who, generation: who.generation + 1, publication: null });
        }
      }
      this.broadcast();
      return new Response(null, { status: 204 });
    }
    if (url.pathname !== "/discover" || request.headers.get("Upgrade") !== "websocket") {
      return new Response(null, { status: 404 });
    }
    const scope = request.headers.get(DISCOVERY_SCOPE_HEADER);
    if (!validScope(scope)) return new Response(null, { status: 403 });
    const { 0: client, 1: server } = new WebSocketPair();
    if (this.observers().length >= MAX_OBSERVERS) {
      server.accept();
      server.close(4429, "full");
      return new Response(null, { status: 101, webSocket: client });
    }
    this.ctx.acceptWebSocket(server, ["observer"]);
    server.serializeAttachment({ scope, generation: 0, updates: 0, publication: null });
    server.send(this.snapshot());
    return new Response(null, { status: 101, webSocket: client });
  }

  observers() {
    return this.ctx.getWebSockets("observer").filter((ws) => ws.readyState === 1 && ws.deserializeAttachment() !== null);
  }

  snapshot() {
    const codes = new Set();
    for (const ws of this.observers()) {
      const publication = ws.deserializeAttachment().publication;
      if (publication?.verified) codes.add(publication.code);
    }
    const list = [...codes].sort().slice(0, MAX_SHARES).map((code) => ({ code, local: true }));
    return JSON.stringify({ type: "shares", list });
  }

  broadcast() {
    const message = this.snapshot();
    let lostShare = false;
    for (const ws of this.observers()) {
      try { ws.send(message); }
      catch {
        lostShare ||= ws.deserializeAttachment()?.publication?.verified === true;
        ws.serializeAttachment(null);
        try { ws.close(1011, "send-failed"); } catch {}
      }
    }
    if (lostShare) this.broadcast();
  }

  async verify(publication, scope) {
    try {
      const room = this.env.ROOMS.get(this.env.ROOMS.idFromName(publication.code));
      const result = await room.fetch("https://room.internal/_discovery/check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code: publication.code, lease: publication.lease, scope }),
      });
      return result.status === 204;
    } catch {
      return false;
    }
  }

  async refresh() {
    const entries = this.observers().map((ws) => ({ ws, who: ws.deserializeAttachment() }))
      .filter(({ who }) => who.publication?.verified);
    const checks = new Map();
    for (const { who } of entries) {
      const key = `${who.publication.code}:${who.publication.lease}:${who.scope}`;
      if (!checks.has(key)) checks.set(key, this.verify(who.publication, who.scope));
    }
    // Rechecking a manual refresh repairs a missed withdrawal without a
    // polling loop. Deduplicating leases bounds the binding calls to the list.
    await Promise.all(checks.values());
    for (const { ws, who } of entries) {
      const key = `${who.publication.code}:${who.publication.lease}:${who.scope}`;
      if (await checks.get(key)) continue;
      const current = ws.deserializeAttachment();
      if (current !== null && current.generation === who.generation
          && current.publication?.code === who.publication.code && current.publication.lease === who.publication.lease) {
        ws.serializeAttachment({ ...current, generation: current.generation + 1, publication: null });
      }
    }
    this.broadcast();
  }

  async webSocketMessage(ws, message) {
    if (typeof message !== "string" || message.length > MAX_MESSAGE) return;
    let parsed;
    try { parsed = JSON.parse(message); } catch { return; }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return;
    const publishing = Object.hasOwn(parsed, "publish");
    if (!publishing && parsed.refresh !== true) return;
    const who = ws.deserializeAttachment();
    if (who === null || ws.readyState !== 1) return;
    if (publishing && parsed.publish !== null && !validPublication(parsed.publish)) return;
    if (who.updates >= MAX_UPDATES) { this.drop(ws); ws.close(4429, "too-many-updates"); return; }
    if (!publishing) {
      ws.serializeAttachment({ ...who, updates: who.updates + 1 });
      return this.refresh();
    }
    const generation = who.generation + 1;
    const publication = parsed.publish === null ? null : {
      code: parsed.publish.code, lease: parsed.publish.lease, verified: false,
    };
    // Attach before awaiting Room: a host withdrawal can then cancel this
    // pending check, rather than arriving just before a stale result publishes.
    ws.serializeAttachment({ ...who, generation, updates: who.updates + 1, publication });
    if (who.publication?.verified || publication === null) this.broadcast();
    if (publication === null) return;
    let valid = await this.verify(publication, who.scope);
    const current = ws.deserializeAttachment();
    if (ws.readyState !== 1 || current === null || current.generation !== generation
        || current.publication?.code !== publication.code || current.publication.lease !== publication.lease) return;
    const listed = JSON.parse(this.snapshot()).list;
    if (valid && listed.length >= MAX_SHARES && !listed.some((item) => item.code === publication.code)) valid = false;
    ws.serializeAttachment({ ...current, publication: valid ? { ...publication, verified: true } : null });
    this.broadcast();
  }

  webSocketClose(ws) { this.drop(ws); }
  webSocketError(ws) { this.drop(ws); }

  drop(ws) {
    if (ws.deserializeAttachment() === null) return;
    ws.serializeAttachment(null);
    this.broadcast();
  }
}
