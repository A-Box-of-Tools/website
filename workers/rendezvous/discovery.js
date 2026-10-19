// Discovery is a list of live, explicitly offered room codes. A public
// IPv4 address or IPv6 /64 is only a best-effort network match: shared carrier
// gateways can include strangers, and nearby devices can use different routes.
// Nothing here decides whether their eventual WebRTC connection is local.
import { groupIdentifier, normalizeGroupCode } from "../../shared/js/discovery-group.js";

export const DISCOVERY_SCOPE_HEADER = "x-rendezvous-discovery-scope";
export const CODE_PATTERN = /^[a-z0-9][a-z0-9-]{0,63}$/;
const SCOPE_PATTERN = /^[a-f0-9]{64}$/;
const LEASE_PATTERN = /^[A-Za-z0-9_-]{20,128}$/;
const MAX_OBSERVERS = 64;
const MAX_SHARES = 32;
const MAX_MESSAGE = 512;
const MAX_UPDATES = 120;
const MAX_PENDING = 8;
const AUTH_TIMEOUT = 8000;

const DEFAULT_TOOL = "share-text";
const TOOLS = new Set([DEFAULT_TOOL, "remote-camera", "share-tab", "voice-oncall", "walkie-talkie"]);
const LISTEN_KEY_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export function rendezvousTool(value) {
  return value == null ? DEFAULT_TOOL : TOOLS.has(value) ? value : null;
}

// Missing keeps the original network protocol. Invalid must never silently
// choose that protocol: it could publish a private host to its neighbours.
export function requestedGroup(url) {
  const values = url.searchParams.getAll("group");
  if (values.length === 0) return undefined;
  return values.length === 1 && SCOPE_PATTERN.test(values[0]) ? values[0] : null;
}

export function validVoiceQuery(url) {
  return [...url.searchParams.keys()].every((name) => name === "group") && requestedGroup(url) !== null;
}

// Existing text rooms keep their identifiers, including sockets that are
// hibernating when the camera namespace is deployed.
export function roomName(code, tool = DEFAULT_TOOL) {
  return tool === DEFAULT_TOOL ? code : `${tool}:${code}`;
}

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

function ipv4Octets(value) {
  if (typeof value !== "string" || !/^(?:\d{1,3}\.){3}\d{1,3}$/.test(value)) return null;
  const parts = value.split(".");
  const octets = parts.map(Number);
  return octets.some((n, i) => n > 255 || String(n) !== parts[i]) ? null : octets;
}

function publicAddress(value) {
  if (typeof value !== "string" || value.length > 64) return null;
  const octets = ipv4Octets(value);
  if (octets !== null) {
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

function networkAddress(request) {
  const edgeAddress = request.headers.get("CF-Connecting-IP");
  const octets = ipv4Octets(edgeAddress);
  // Pseudo IPv4's overwrite mode keeps the real IPv6 in this edge header.
  // Its Class E marker is required: an ordinary or absent source address
  // must never let a caller-supplied alternate choose the discovery group.
  const address = publicAddress(octets !== null && octets[0] >= 240
    ? request.headers.get("CF-Connecting-IPv6") : edgeAddress);
  if (address === null) return null;
  if (!address.includes(":")) return octets !== null && octets[0] >= 240 ? null : address;
  // Devices on an IPv6 LAN have distinct interface identifiers. Expanding
  // the compressed form before masking avoids dividing one /64 by device.
  const [left, right] = address.split("::");
  const leading = left ? left.split(":") : [];
  const trailing = right ? right.split(":") : [];
  const groups = right === undefined ? leading
    : [...leading, ...Array(8 - leading.length - trailing.length).fill("0"), ...trailing];
  return `${groups.slice(0, 4).map((n) => parseInt(n, 16).toString(16)).join(":")}::/64`;
}

// CF-Connecting-IP is supplied by the edge, but a same-zone Worker may
// override it in a subrequest. Cross-zone Workers also share one fixed IPv6
// address. Neither is a browser gateway and neither may select a group.
export async function discoveryScope(request, requestedTool = DEFAULT_TOOL) {
  const tool = rendezvousTool(requestedTool);
  if (tool === null || request.headers.has("CF-Worker")) return null;
  const origin = pageOrigin(request.headers.get("Origin"));
  const group = requestedGroup(new URL(request.url));
  if (origin === null || group === null) return null;
  const address = group === undefined ? networkAddress(request) : null;
  if (group === undefined && address === null) return null;
  const source = group === undefined
    ? tool === DEFAULT_TOOL ? `${origin}\n${address}` : `${origin}\n${address}\n${tool}`
    : `abox.tools/private-discovery-scope/v1\n${origin}\n${tool}\n${group}`;
  const bytes = new TextEncoder().encode(source);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  return [...digest].map((n) => n.toString(16).padStart(2, "0")).join("");
}

export const validScope = (scope) => typeof scope === "string" && SCOPE_PATTERN.test(scope);
export const validPublication = (value) => value !== null && typeof value === "object" && !Array.isArray(value)
  && typeof value.code === "string" && CODE_PATTERN.test(value.code)
  && typeof value.lease === "string" && LEASE_PATTERN.test(value.lease);

function validVoicePublication(value, tool) {
  if (!/^[a-f0-9]{64}$/.test(value.code)) return false;
  return tool !== "walkie-talkie" || Object.keys(value).length === 3
    && typeof value.listenKey === "string" && LISTEN_KEY_PATTERN.test(value.listenKey);
}

const metadataTool = (tool) => tool === "voice-oncall" || tool === "walkie-talkie";
const verificationKey = (who) => `${who.tool ?? DEFAULT_TOOL}:${who.publication.code}:${who.publication.lease}:${who.scope}:${who.publication.listenKey ?? ""}`;

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
      const tool = rendezvousTool(publication?.tool);
      if (!validPublication(publication) || tool === null) return new Response(null, { status: 400 });
      for (const ws of this.ctx.getWebSockets("observer")) {
        const who = ws.deserializeAttachment();
        if ((who?.tool ?? DEFAULT_TOOL) === tool && who?.publication?.code === publication.code && who.publication.lease === publication.lease) {
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
    const tool = rendezvousTool(url.searchParams.get("tool"));
    const group = requestedGroup(url);
    if (!validScope(scope) || tool === null || group === null) return new Response(null, { status: 403 });
    this.cleanup();
    const { 0: client, 1: server } = new WebSocketPair();
    if (this.observers().length >= MAX_OBSERVERS || group !== undefined
        && this.observers().filter((ws) => ws.deserializeAttachment().authenticated === false).length >= MAX_PENDING) {
      server.accept();
      server.close(4429, "full");
      return new Response(null, { status: 101, webSocket: client });
    }
    this.ctx.acceptWebSocket(server, ["observer"]);
    server.serializeAttachment({ scope, tool, generation: 0, updates: 0, publication: null,
      ...(group === undefined ? {} : { group, authenticated: false, deadline: Date.now() + AUTH_TIMEOUT }) });
    if (group === undefined) server.send(this.snapshot());
    return new Response(null, { status: 101, webSocket: client });
  }

  observers() {
    return this.ctx.getWebSockets("observer").filter((ws) => ws.readyState === 1 && ws.deserializeAttachment() !== null);
  }

  cleanup() {
    for (const ws of this.observers()) {
      const who = ws.deserializeAttachment();
      if (who.authenticated === false && who.deadline <= Date.now()) {
        ws.serializeAttachment(null);
        try { ws.close(4408, "timeout"); } catch {}
      }
    }
  }

  authorized(who) { return who && (who.group === undefined || who.authenticated === true); }

  snapshot() {
    const observers = this.observers();
    const tool = observers[0]?.deserializeAttachment().tool ?? DEFAULT_TOOL;
    const group = observers[0]?.deserializeAttachment().group;
    const codes = new Map();
    for (const ws of observers) {
      const who = ws.deserializeAttachment();
      if (!this.authorized(who) || (who.tool ?? DEFAULT_TOOL) !== tool) continue;
      const publication = who.publication;
      if (publication?.verified) codes.set(publication.code, publication);
    }
    const list = [...codes.keys()].sort().slice(0, MAX_SHARES).map((code) => ({ code, local: codes.get(code).local !== false,
      ...(codes.get(code).transport === 'relay' ? { transport: 'relay' } : {}),
      ...(tool === "voice-oncall" ? { name: codes.get(code).name, locked: codes.get(code).locked } : {}),
      ...(tool === "walkie-talkie" ? { name: codes.get(code).name, listenKey: codes.get(code).listenKey } : {}) }));
    return JSON.stringify({ type: "shares", ...(tool === DEFAULT_TOOL && group === undefined ? {} : { tool }),
      ...(group === undefined ? {} : { group }), list });
  }

  broadcast() {
    const message = this.snapshot();
    let lostShare = false;
    for (const ws of this.observers()) {
      if (!this.authorized(ws.deserializeAttachment())) continue;
      try { ws.send(message); }
      catch {
        lostShare ||= ws.deserializeAttachment()?.publication?.verified === true;
        ws.serializeAttachment(null);
        try { ws.close(1011, "send-failed"); } catch {}
      }
    }
    if (lostShare) this.broadcast();
  }

  async verify(publication, scope, tool = DEFAULT_TOOL, privateGroup = false) {
    try {
      const binding = tool === "voice-oncall" ? this.env.INBOXES
        : tool === "walkie-talkie" ? this.env.BROADCASTS : this.env.ROOMS;
      const room = binding.get(binding.idFromName(metadataTool(tool) ? publication.code : roomName(publication.code, tool)));
      const result = await room.fetch("https://room.internal/_discovery/check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code: publication.code, lease: publication.lease, scope, tool,
          ...(tool === "walkie-talkie" ? { listenKey: publication.listenKey } : {}) }),
      });
      if (!metadataTool(tool) && result.status === 204) return true;
      if (result.status !== 200) return false;
      const text = await result.text();
      if (text.length > MAX_MESSAGE) return false;
      const metadata = JSON.parse(text);
      if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)
          || (metadata.transport !== undefined && !['direct', 'relay'].includes(metadata.transport))) return false;
      const transport = metadata.transport === 'relay' ? { transport: 'relay' } : {};
      if (!metadataTool(tool)) {
        const ordinary = privateGroup && tool === DEFAULT_TOOL && metadata.local === false;
        if (Object.keys(metadata).some((name) => name !== 'transport' && !(ordinary && name === 'local'))
            || metadata.transport !== 'relay' && !ordinary) return false;
        return { ...transport, ...(ordinary ? { local: false } : {}) };
      }
      if (Object.keys(metadata).length !== (metadata.transport === undefined ? 2 : 3)
          || typeof metadata.name !== "string" || metadata.name.length === 0 || metadata.name.length > 80
          || !metadata.name.isWellFormed() || metadata.name.trim().length === 0
          || /[\x00-\x1f\x7f-\x9f]/.test(metadata.name)) return false;
      if (tool === "walkie-talkie") {
        if (typeof metadata.listenKey !== "string" || !LISTEN_KEY_PATTERN.test(metadata.listenKey)
            || metadata.listenKey !== publication.listenKey) return false;
        return { name: metadata.name, listenKey: metadata.listenKey, ...transport };
      }
      if (typeof metadata.locked !== "boolean") return false;
      return { name: metadata.name, locked: metadata.locked, ...transport };
    } catch {
      return false;
    }
  }

  async refresh() {
    const entries = this.observers().map((ws) => ({ ws, who: ws.deserializeAttachment() }))
      .filter(({ who }) => who.publication?.verified);
    const checks = new Map();
    for (const { who } of entries) {
      const tool = who.tool ?? DEFAULT_TOOL;
      const key = verificationKey(who);
      if (!checks.has(key)) checks.set(key, this.verify(who.publication, who.scope, tool, who.group !== undefined));
    }
    // Rechecking a manual refresh repairs a missed withdrawal without a
    // polling loop. Deduplicating leases bounds the binding calls to the list.
    await Promise.all(checks.values());
    for (const { ws, who } of entries) {
      const key = verificationKey(who);
      const valid = await checks.get(key);
      const current = ws.deserializeAttachment();
      if (current !== null && current.generation === who.generation
          && current.publication?.code === who.publication.code && current.publication.lease === who.publication.lease) {
        if (valid && typeof valid === 'object') {
          ws.serializeAttachment({ ...current, publication: { ...current.publication, ...valid } });
        } else if (!valid) ws.serializeAttachment({ ...current, generation: current.generation + 1, publication: null });
      }
    }
    this.broadcast();
  }

  async webSocketMessage(ws, message) {
    this.cleanup();
    const who = ws.deserializeAttachment();
    if (who === null || ws.readyState !== 1) return;
    const refuse = () => { this.drop(ws); try { ws.close(4403, "unauthorized"); } catch {} };
    if (typeof message !== "string" || message.length > MAX_MESSAGE) {
      if (!this.authorized(who)) refuse();
      return;
    }
    let parsed;
    try { parsed = JSON.parse(message); } catch { if (!this.authorized(who)) refuse(); return; }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      if (!this.authorized(who)) refuse();
      return;
    }
    if (who.group !== undefined && who.authenticated !== true) {
      if (who.authenticating || Object.keys(parsed).length !== 1 || !Object.hasOwn(parsed, "group")
          || normalizeGroupCode(parsed.group) === null || normalizeGroupCode(parsed.group) !== parsed.group) return refuse();
      const generation = who.generation + 1;
      ws.serializeAttachment({ ...who, authenticating: true, generation });
      let identifier = null;
      try { identifier = await groupIdentifier(parsed.group); } catch {}
      const current = ws.deserializeAttachment();
      if (ws.readyState !== 1 || current === null || current.generation !== generation) return;
      if (current.deadline <= Date.now()) {
        this.drop(ws);
        try { ws.close(4408, "timeout"); } catch {}
        return;
      }
      if (identifier !== current.group) return refuse();
      // Attachments survive hibernation. Only the public identifier and proof
      // result belong there; the entered code is never retained or echoed.
      const { deadline, authenticating, ...accepted } = current;
      ws.serializeAttachment({ ...accepted, authenticated: true });
      try { ws.send(this.snapshot()); }
      catch { this.drop(ws); try { ws.close(1011, "send-failed"); } catch {} }
      return;
    }
    if (Object.hasOwn(parsed, "group")) return refuse();
    const publishing = Object.hasOwn(parsed, "publish");
    if (!publishing && parsed.refresh !== true) return;
    if (publishing && parsed.publish !== null && !validPublication(parsed.publish)) return;
    if (publishing && parsed.publish !== null && metadataTool(who.tool)
        && !validVoicePublication(parsed.publish, who.tool)) return;
    if (who.updates >= MAX_UPDATES) { this.drop(ws); ws.close(4429, "too-many-updates"); return; }
    if (!publishing) {
      ws.serializeAttachment({ ...who, updates: who.updates + 1 });
      return this.refresh();
    }
    const generation = who.generation + 1;
    const publication = parsed.publish === null ? null : {
      code: parsed.publish.code, lease: parsed.publish.lease, verified: false,
      ...(who.tool === "walkie-talkie" ? { listenKey: parsed.publish.listenKey } : {}),
    };
    // Attach before awaiting Room: a host withdrawal can then cancel this
    // pending check, rather than arriving just before a stale result publishes.
    ws.serializeAttachment({ ...who, generation, updates: who.updates + 1, publication });
    if (who.publication?.verified || publication === null) this.broadcast();
    if (publication === null) return;
    let valid = await this.verify(publication, who.scope, who.tool ?? DEFAULT_TOOL, who.group !== undefined);
    const current = ws.deserializeAttachment();
    if (ws.readyState !== 1 || current === null || current.generation !== generation
        || current.publication?.code !== publication.code || current.publication.lease !== publication.lease) return;
    const listed = JSON.parse(this.snapshot()).list;
    if (valid && listed.length >= MAX_SHARES && !listed.some((item) => item.code === publication.code)) valid = false;
    ws.serializeAttachment({ ...current, publication: valid ? { ...publication, verified: true,
      ...(typeof valid === 'object' ? valid : {}) } : null });
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
