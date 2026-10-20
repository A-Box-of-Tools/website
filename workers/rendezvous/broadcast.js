// A voice room stores no payloads. Its authority and selected transport
// current generation live in socket attachments, so hibernation cannot forget
// them and the last socket leaving removes the room's complete state.
import { DISCOVERY_SCOPE_HEADER, validPublication, validScope, validVoiceQuery } from "./discovery.js";
import { answerRelayRequest, relayEnabled, relayPolicy } from "./relay.js";
import { approvalFrame, approvalState, approvalMatches, admitted, approved, rememberApproval } from "./voice-approval.js";

const KEY = /^[A-Za-z0-9_-]{43}$/;
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const MAX_LISTENERS = 10;
const MAX_PENDING = 4;
const AUTH_TIMEOUT = 8000;
const MAX_MESSAGE = 64 * 1024;
const RATE_WINDOW = 10000;
const MAX_UPDATES = 120;

const object = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const fields = (value, names) => object(value) && Object.keys(value).length === names.length
  && names.every((name) => Object.hasOwn(value, name));
const uuid = (value) => typeof value === "string" && UUID.test(value);
const mode = (value) => value === undefined || value === "direct" ? "direct" : value === "relay" ? "relay" : null;
const transportFields = (value) => Object.hasOwn(value, "transport") ? ["transport"] : [];
const transportFrame = (transport) => transport === "relay" ? { transport } : {};

function roomName(value) {
  if (typeof value !== "string" || value.length > 80 || !value.isWellFormed()
      || /[\x00-\x1f\x7f-\x9f]/.test(value)) return null;
  return value.trim() || null;
}

export async function broadcastCode(key) {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key)));
  return [...digest].map((n) => n.toString(16).padStart(2, "0")).join("");
}

function hostAddress(value) {
  if (typeof value !== "string" || value.length > 253) return false;
  if (/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+local$/i.test(value)) return true;
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(value)) {
    const parts = value.split("."), octets = parts.map(Number);
    return !octets.some((n, i) => n > 255 || String(n) !== parts[i]);
  }
  if (!/^[a-f0-9:.]+$/i.test(value) || !value.includes(":")) return false;
  try {
    return new URL(`https://[${value}]/`).hostname.startsWith("[");
  } catch { return false; }
}

function candidateLine(value, transport = "direct") {
  if (typeof value !== "string" || value.length > 4096 || /[\r\n\x00]/.test(value)) return false;
  if (value === "") return true;
  const parts = value.trim().split(/ +/);
  if (parts.length < 8 || !/^candidate:[a-z0-9+/_-]{1,64}$/i.test(parts[0])
      || !/^[12]$/.test(parts[1]) || !/^(udp|tcp)$/i.test(parts[2])
      || !/^\d{1,10}$/.test(parts[3]) || Number(parts[3]) > 0xffffffff
      || !hostAddress(parts[4]) || !/^\d{1,5}$/.test(parts[5])
      || Number(parts[5]) < 1 || Number(parts[5]) > 65535
      || parts[6] !== "typ" || parts[7] !== (transport === "relay" ? "relay" : "host") || (parts.length - 8) % 2 !== 0) return false;
  const extensions = new Set(["raddr", "rport", "tcptype", "generation", "ufrag", "network-id", "network-cost"]);
  for (let i = 8; i < parts.length; i += 2) {
    if (!extensions.has(parts[i]) || !/^[a-z0-9+/_-]{1,256}$/i.test(parts[i + 1])
        && !(parts[i] === "raddr" && hostAddress(parts[i + 1]))) return false;
    if (parts[i] === "raddr" && !hostAddress(parts[i + 1])) return false;
  }
  return true;
}

function candidate(value, transport) {
  if (value === null) return true;
  if (!object(value) || !Object.hasOwn(value, "candidate")
      || Object.keys(value).some((name) => !["candidate", "sdpMid", "sdpMLineIndex", "usernameFragment"].includes(name))
      || !candidateLine(value.candidate, transport)) return false;
  for (const name of ["sdpMid", "usernameFragment"]) {
    if (value[name] != null && (typeof value[name] !== "string" || value[name].length > 256)) return false;
  }
  return value.sdpMLineIndex == null || Number.isInteger(value.sdpMLineIndex)
    && value.sdpMLineIndex >= 0 && value.sdpMLineIndex <= 255;
}

function description(value, transport) {
  if (typeof value !== "string" || value.length > 32 * 1024) return false;
  const lines = value.split(/\r?\n/).filter(Boolean);
  if (lines.length > 512 || lines[0] !== "v=0"
      || lines.some((line) => !/^[a-z]=[\x20-\x7e]*$/.test(line))) return false;
  const media = lines.filter((line) => line.startsWith("m="));
  if (media.length !== 1 || !/^m=audio \d{1,5} (?:UDP|TCP)\/TLS\/RTP\/SAVPF [0-9 ]+$/.test(media[0])) return false;
  for (const line of lines) {
    if (line.startsWith("a=candidate:") && !candidateLine(line.slice(2), transport)) return false;
    if (line.startsWith("c=")) {
      const address = line.match(/^c=IN IP[46] (\S+)$/)?.[1];
      if (address !== "0.0.0.0" && address !== "::" && !hostAddress(address)) return false;
    }
    if (line.startsWith("a=remote-candidates:")) {
      const parts = line.slice(20).split(" ");
      if (parts.length % 3 !== 0) return false;
      for (let i = 0; i < parts.length; i += 3) if (!hostAddress(parts[i + 1])) return false;
    }
  }
  return true;
}

// Rebuilding the envelope discards client claims about sender identity. Only
// browser connection metadata is admitted, including host-only ICE addresses.
export function validBroadcastSignal(value, role, transport = "direct") {
  if (mode(transport) === null || !object(value) || !uuid(value.generation) || !uuid(value.connection)) return null;
  const names = ["type", "generation", "connection", ...(role === "host" ? ["to"] : [])];
  if (role === "host" && !uuid(value.to)) return null;
  if (value.type === (role === "host" ? "offer" : "answer")) {
    if (!fields(value, [...names, "sdp"]) || !description(value.sdp, transport)) return null;
    return { type: value.type, generation: value.generation, connection: value.connection, sdp: value.sdp };
  }
  if (value.type === "candidate" && fields(value, [...names, "candidate"]) && candidate(value.candidate, transport)) {
    return { type: "candidate", generation: value.generation, connection: value.connection, candidate: value.candidate };
  }
  return null;
}

export class Broadcast {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair("ping", "pong"));
  }

  sockets(role) {
    return this.ctx.getWebSockets("broadcast").filter((ws) => ws.readyState === 1
      && ws.deserializeAttachment() !== null && (role === undefined || ws.deserializeAttachment().role === role));
  }

  host() { return this.sockets("host")[0] ?? null; }

  cleanup() {
    for (const ws of this.sockets("pending")) {
      if (ws.deserializeAttachment().deadline <= Date.now()) this.refuse(ws, 4408, "timeout");
    }
  }

  async fetch(request) {
    const url = new URL(request.url);
    // The public Worker never forwards this path. Publication proves both a
    // live host lease and the separate listener capability without retaining it.
    if (url.pathname === "/_discovery/check" && request.method === "POST") {
      let claim;
      try {
        const text = await request.text();
        if (text.length > 512) return new Response(null, { status: 400 });
        claim = JSON.parse(text);
      } catch { return new Response(null, { status: 400 }); }
      if (!fields(claim, ["code", "lease", "scope", "tool", "listenKey"])
          || claim.tool !== "walkie-talkie" || !/^[a-f0-9]{64}$/.test(claim.code)
          || !validPublication(claim) || !validScope(claim.scope)
          || typeof claim.listenKey !== "string" || !KEY.test(claim.listenKey)) {
        return new Response(null, { status: 400 });
      }
      const listenHash = await broadcastCode(claim.listenKey);
      // Digesting yields to socket events: only authority still live after it
      // completes may make an entry visible or revive one during refresh.
      const owner = this.host()?.deserializeAttachment();
      if (!owner || owner.ended || owner.code !== claim.code || owner.lease !== claim.lease
          || owner.scope !== claim.scope || owner.listenHash !== listenHash) {
        return new Response(null, { status: 403 });
      }
      return new Response(JSON.stringify({ name: owner.name, listenKey: claim.listenKey, ...transportFrame(mode(owner.transport)), ...approvalFrame(owner) }), {
        headers: { "content-type": "application/json" },
      });
    }
    const code = url.pathname.match(/^\/broadcast\/([a-f0-9]{64})$/)?.[1];
    if (!code || !validVoiceQuery(url) || request.headers.get("Upgrade") !== "websocket") return new Response(null, { status: 404 });
    this.cleanup();
    const { 0: client, 1: server } = new WebSocketPair();
    if (this.sockets("pending").length >= MAX_PENDING) {
      server.accept();
      server.send(JSON.stringify({ type: "error", error: "full" }));
      server.close(4429, "full");
    } else {
      const scope = request.headers.get(DISCOVERY_SCOPE_HEADER);
      this.ctx.acceptWebSocket(server, ["broadcast"]);
      server.serializeAttachment({ role: "pending", code, scope: validScope(scope) ? scope : null,
        deadline: Date.now() + AUTH_TIMEOUT,
        window: Date.now(), updates: 0 });
    }
    return new Response(null, { status: 101, webSocket: client });
  }

  send(ws, value) {
    try { ws.send(JSON.stringify(value)); return true; }
    catch { this.drop(ws); try { ws.close(1011, "send-failed"); } catch {} return false; }
  }

  refuse(ws, code, error) {
    this.send(ws, { type: "error", error });
    this.drop(ws);
    try { ws.close(code, error); } catch {}
  }

  async authenticate(ws, value, who) {
    const isHost = value.role === "host";
    const transport = mode(value.transport), extra = [...transportFields(value),
      ...(isHost && Object.hasOwn(value, "approval") ? ["approval"] : []),
      ...(!isHost && Object.hasOwn(value, "clientKey") ? ["clientKey"] : [])];
    const offered = isHost && fields(value, ["type", "role", "key", "listenKey", "roomName", "discover", ...extra])
      && value.discover === true;
    const name = offered ? roomName(value.roomName) : null;
    if (transport === null || !(isHost ? offered || fields(value, ["type", "role", "key", "listenKey", ...extra])
        : fields(value, ["type", "role", "key", ...extra]))
        || value.type !== "auth" || !["host", "listener"].includes(value.role)
        || typeof value.key !== "string" || !KEY.test(value.key)
        || isHost && (typeof value.listenKey !== "string" || !KEY.test(value.listenKey))
        || Object.hasOwn(value, "approval") && (!isHost || typeof value.approval !== "boolean")
        || Object.hasOwn(value, "clientKey") && (isHost || typeof value.clientKey !== "string" || !KEY.test(value.clientKey))
        || offered && (name === null || value.key === value.listenKey)) {
      this.refuse(ws, 4400, "invalid"); return;
    }
    // Claim the pending socket before digesting: a second auth frame and a
    // concurrent timeout must not install authority after this one is retired.
    ws.serializeAttachment({ ...who, authenticating: true });
    const [keyHash, listenHash, clientHash] = await Promise.all([
      broadcastCode(value.key), isHost ? broadcastCode(value.listenKey) : Promise.resolve(null),
      !isHost && value.clientKey ? broadcastCode(value.clientKey) : Promise.resolve(null),
    ]);
    const current = ws.deserializeAttachment();
    if (ws.readyState !== 1 || current?.role !== "pending" || !current.authenticating) return;
    if (current.deadline <= Date.now()) { this.refuse(ws, 4408, "timeout"); return; }
    if (isHost) {
      if (keyHash !== who.code) { this.refuse(ws, 4403, "unauthorized"); return; }
      if (transport === "relay" && !relayEnabled(this.env, "walkie-talkie")) { this.refuse(ws, 4403, "relay-unavailable"); return; }
      const retained = this.host()?.deserializeAttachment() ?? this.sockets("listener")
        .map(peer => peer.deserializeAttachment()).find(peer => peer.verified);
      if (retained && mode(retained.transport) !== transport) { this.refuse(ws, 4403, "transport-mismatch"); return; }
      if (!approvalMatches(retained, value.approval)) { this.refuse(ws, 4403, "approval-mismatch"); return; }
      if (retained?.ended) { this.send(ws, { type: "ended" }); this.drop(ws); try { ws.close(1000, "ended"); } catch {} return; }
      const previous = this.sockets("host");
      const generation = crypto.randomUUID();
      const scope = offered && validScope(who.scope) ? who.scope : null;
      const lease = scope === null ? null : crypto.randomUUID();
      ws.serializeAttachment({ role: "host", code: who.code, listenHash, generation, transport,
        ...approvalState({ ...retained, ...approvalFrame(value) }),
        ...(offered ? { name, scope, lease } : {}),
        talking: false, ended: false, window: Date.now(), updates: 0 });
      for (const old of previous) {
        // Blank first: the replaced socket's eventual close cannot park a
        // new host's listeners or undo the new generation.
        const retired = old.deserializeAttachment();
        old.serializeAttachment(null);
        this.withdraw(retired);
        this.send(old, { type: "replaced" });
        try { old.close(4409, "replaced"); } catch {}
      }
      if (!this.send(ws, { type: "host-ready", generation, ...transportFrame(transport), ...approvalFrame(ws.deserializeAttachment()),
        ...(offered ? { discovery: lease === null ? null : { code: who.code, lease, tool: "walkie-talkie" } } : {}) })) return;
      for (const listener of this.sockets("listener")) {
        if (listener.deserializeAttachment().listenHash !== listenHash) this.refuse(listener, 4403, "unauthorized");
        else this.ready(listener);
      }
      return;
    }
    const limit = transport === "relay" ? Math.min(MAX_LISTENERS, relayPolicy(this.env)?.maxPeers ?? 0) : MAX_LISTENERS;
    const previous = clientHash ? this.sockets("listener").filter(peer => peer.deserializeAttachment().clientHash === clientHash) : [];
    if (this.sockets("listener").filter(peer => !previous.includes(peer)).length >= limit) { this.refuse(ws, 4429, "full"); return; }
    const host = this.host()?.deserializeAttachment();
    const anchors = this.sockets("listener").map((peer) => peer.deserializeAttachment()).filter((peer) => peer.verified);
    const trusted = host ?? anchors[0];
    if (trusted && trusted.listenHash !== keyHash) { this.refuse(ws, 4403, "unauthorized"); return; }
    if (trusted && mode(trusted.transport) !== transport) { this.refuse(ws, 4403, "transport-mismatch"); return; }
    ws.serializeAttachment({ role: "listener", code: who.code, id: crypto.randomUUID(),
      ...(clientHash ? { clientHash } : {}), admitted: false, ...approvalState(trusted),
      listenHash: keyHash, transport, verified: trusted !== undefined && trusted !== null,
      generation: host ? null : trusted?.generation ?? null, connection: null,
      ended: trusted?.ended === true, window: Date.now(), updates: 0 });
    for (const old of previous) {
      this.drop(old);
      this.send(old, { type: "replaced" });
      try { old.close(4409, "replaced"); } catch {}
    }
    this.ready(ws);
  }

  ready(ws) {
    const who = ws.deserializeAttachment();
    if (who?.role !== "listener" || ws.readyState !== 1) return;
    const host = this.host(), owner = host?.deserializeAttachment();
    if (!owner) { this.send(ws, { type: who.ended ? "ended" : "waiting" }); return; }
    if (who.listenHash !== owner.listenHash) { this.refuse(ws, 4403, "unauthorized"); return; }
    if (mode(who.transport) !== mode(owner.transport)) { this.refuse(ws, 4403, "transport-mismatch"); return; }
    const joining = !admitted(who) || who.generation !== owner.generation;
    const allowed = approved(owner, who);
    const updated = { ...who, verified: true, admitted: allowed, ...approvalState(owner), generation: owner.generation,
      ended: owner.ended, ...(joining ? { connection: null } : {}) };
    ws.serializeAttachment(updated);
    if (owner.ended) { this.send(ws, { type: "ended" }); return; }
    if (!allowed) {
      if (who.generation !== owner.generation || !who.verified) this.send(host, {
        type: "request", id: who.id, name: "", generation: owner.generation });
      this.send(ws, { type: "approval-pending", id: who.id, generation: owner.generation,
        ...transportFrame(mode(owner.transport)), ...approvalFrame(owner) });
      return;
    }
    if (this.send(ws, { type: "ready", id: who.id, generation: owner.generation, talking: owner.talking,
      ...transportFrame(mode(owner.transport)), ...approvalFrame(owner) }) && joining) {
      this.send(host, { type: "join", id: who.id, generation: owner.generation });
    }
  }

  decide(host, owner, value) {
    const listener = this.sockets("listener").find(peer => peer.deserializeAttachment().id === value.to);
    const who = listener?.deserializeAttachment();
    if (!who || !who.verified || admitted(who) || who.generation !== owner.generation) {
      this.send(host, { type: "request-resolved", id: value.to, generation: owner.generation }); return;
    }
    if (value.type === "deny") {
      this.send(listener, { type: "denied" }); this.drop(listener);
      try { listener.close(4403, "denied"); } catch {} return;
    }
    const updated = rememberApproval(owner, who, this.sockets("listener").map(peer => peer.deserializeAttachment()));
    if (!updated) { this.send(host, { type: "request-error", id: who.id, generation: owner.generation, error: "full" }); return; }
    host.serializeAttachment(updated);
    for (const peer of this.sockets("listener")) {
      const state = peer.deserializeAttachment();
      if (state.verified) peer.serializeAttachment({ ...state, ...approvalState(updated) });
    }
    this.send(host, { type: "request-resolved", id: who.id, generation: owner.generation });
    this.ready(listener);
  }

  async webSocketMessage(ws, message) {
    this.cleanup();
    let who = ws.deserializeAttachment();
    if (who === null || ws.readyState !== 1 || message === "ping") return;
    if (typeof message !== "string" || message.length > MAX_MESSAGE) { this.refuse(ws, 4400, "invalid"); return; }
    const now = Date.now(), updates = now - who.window >= RATE_WINDOW ? 1 : who.updates + 1;
    if (updates > MAX_UPDATES) { this.refuse(ws, 4429, "busy"); return; }
    who = { ...who, window: now - who.window >= RATE_WINDOW ? now : who.window, updates };
    ws.serializeAttachment(who);
    let value;
    try { value = JSON.parse(message); } catch { this.refuse(ws, 4400, "invalid"); return; }
    if (!object(value)) { this.refuse(ws, 4400, "invalid"); return; }
    if (who.role === "pending") {
      if (who.authenticating) { this.refuse(ws, 4400, "invalid"); return; }
      return this.authenticate(ws, value, who);
    }
    if (value.type === "relay-request") {
      const generation = who.generation;
      const authorized = () => {
        const current = ws.deserializeAttachment(), owner = this.host()?.deserializeAttachment();
        return ws.readyState === 1 && current?.generation === generation && owner?.generation === generation
          && !owner.ended && owner.transport === "relay" && current.transport === "relay"
          && (current.role === "host" || current.role === "listener" && admitted(current));
      };
      return answerRelayRequest(ws, value, { env: this.env, tool: "walkie-talkie", authorized,
        current: () => ws.readyState === 1 && ws.deserializeAttachment()?.generation === generation });
    }
    if (who.role === "listener" && fields(value, ["type"]) && value.type === "leave") {
      this.drop(ws); try { ws.close(1000, "left"); } catch {} return;
    }
    if (who.role === "listener" && fields(value, ["type"]) && value.type === "check") { this.ready(ws); return; }
    const host = this.host(), owner = host?.deserializeAttachment();
    if (!owner) { this.send(ws, { type: who.ended ? "ended" : "waiting" }); return; }
    if (owner.ended) { this.send(ws, { type: "ended" }); return; }
    if (value.generation !== owner.generation || who.generation !== owner.generation) {
      this.send(ws, { type: "error", error: "stale" }); return;
    }
    if (who.role === "host" && ["approve", "deny"].includes(value.type)
        && fields(value, ["type", "generation", "to"]) && uuid(value.to)) {
      this.decide(ws, owner, value); return;
    }
    if (who.role === "host" && value.type === "status" && fields(value, ["type", "generation", "talking"])
        && typeof value.talking === "boolean") {
      ws.serializeAttachment({ ...who, talking: value.talking });
      for (const listener of this.sockets("listener").filter(peer => admitted(peer.deserializeAttachment()))) this.send(listener, {
        type: "status", generation: owner.generation, talking: value.talking });
      return;
    }
    if (who.role === "host" && value.type === "end" && fields(value, ["type", "generation"])) {
      ws.serializeAttachment({ ...who, ended: true, talking: false });
      this.withdraw(who);
      for (const listener of this.sockets("listener")) {
        listener.serializeAttachment({ ...listener.deserializeAttachment(), ended: true, connection: null });
        this.send(listener, { type: "ended" });
      }
      this.send(ws, { type: "ended" });
      return;
    }
    const signal = validBroadcastSignal(value, who.role, mode(owner.transport));
    if (signal === null) { this.send(ws, { type: "error", error: "invalid" }); return; }
    if (who.role === "host") {
      const listener = this.sockets("listener").find((peer) => peer.deserializeAttachment().id === value.to);
      const target = listener?.deserializeAttachment();
      if (!admitted(target) || target.generation !== owner.generation) { this.send(ws, { type: "error", error: "stale" }); return; }
      // Candidates can precede an offer, and late candidates can follow a
      // replacement offer. Only the offer establishes the answer's authority.
      if (signal.type === "offer") listener.serializeAttachment({ ...target, connection: signal.connection });
      this.send(listener, { ...signal, from: "host", to: target.id });
    } else {
      if (!admitted(who) || who.connection !== signal.connection) { this.send(ws, { type: "error", error: "stale" }); return; }
      this.send(host, { ...signal, from: who.id, to: "host" });
    }
  }

  webSocketClose(ws) { this.drop(ws); }
  webSocketError(ws) { this.drop(ws); }

  withdraw(owner) {
    if (!owner || !validScope(owner.scope) || !validPublication(owner)) return;
    this.ctx.waitUntil(Promise.resolve().then(() => this.env.DISCOVERY.get(this.env.DISCOVERY.idFromName(owner.scope)).fetch(
      "https://discovery.internal/_discovery/withdraw", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ code: owner.code, lease: owner.lease, tool: "walkie-talkie" }),
      },
    )).catch(() => {}));
  }

  drop(ws) {
    const who = ws.deserializeAttachment();
    if (who === null) return;
    ws.serializeAttachment(null);
    if (who.role === "host") {
      this.withdraw(who);
      for (const listener of this.sockets("listener")) {
        this.send(listener, { type: listener.deserializeAttachment().ended ? "ended" : "waiting" });
      }
    } else if (who.role === "listener" && who.verified) {
      const host = this.host();
      if (host?.deserializeAttachment().generation === who.generation) {
        this.send(host, { type: admitted(who) ? "leave" : "request-resolved", id: who.id, generation: who.generation });
      }
    }
  }
}
