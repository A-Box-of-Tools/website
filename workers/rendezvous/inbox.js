// Incoming voice uses a separate room authority from outgoing broadcasts.
// Socket attachments retain only admission and moderation metadata, including
// an anchor while the host reconnects; audio and room history are never stored.
import { broadcastCode, validBroadcastSignal } from "./broadcast.js";
import { DISCOVERY_SCOPE_HEADER, validPublication, validScope } from "./discovery.js";
import { answerRelayRequest, relayEnabled, relayPolicy } from "./relay.js";

const KEY = /^[A-Za-z0-9_-]{43}$/;
const ID = /^[a-f0-9]{64}$/;
const SIGNAL_TARGET = "00000000-0000-4000-8000-000000000001";
const MAX_SENDERS = 10;
const MAX_PROBES = 4;
const MAX_PENDING = 4;
const AUTH_TIMEOUT = 8000;
const MAX_MESSAGE = 64 * 1024;
const MAX_BUFFER = 128 * 1024;
const RATE_WINDOW = 10000;
const MAX_UPDATES = 120;
const MAX_MODERATION = 24;
const MAX_ATTACHMENT = 2048;

const object = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const fields = (value, names) => object(value) && Object.keys(value).length === names.length
  && names.every((name) => Object.hasOwn(value, name));
const identity = (value) => typeof value === "string" && ID.test(value);
const validKey = (value) => typeof value === "string" && KEY.test(value);
const proof = (value) => value === null || validKey(value);
const bytes = (value) => new TextEncoder().encode(JSON.stringify(value)).length;
const fits = (value) => bytes(value) <= MAX_ATTACHMENT;
const mode = (value) => value === undefined || value === "direct" ? "direct" : value === "relay" ? "relay" : null;
const transportFrame = (transport) => transport === "relay" ? { transport } : {};

function cleanName(value, limit) {
  if (typeof value !== "string" || value.length > limit || !value.isWellFormed()
      || /[\x00-\x1f\x7f-\x9f]/.test(value)) return null;
  const name = value.trim();
  return name.length > 0 ? name : null;
}

const anchor = (owner) => ({ name: owner.name, passwordHash: owner.passwordHash,
  moderation: owner.moderation, ended: owner.ended, ...transportFrame(mode(owner.transport)) });
// A 128-bit digest prefix bounds remembered identities within the platform's
// 2 KB attachment limit, without putting a reusable participant key there.
const token = (id) => id.slice(0, 32);
const moderation = (owner, id) => owner.moderation.find((entry) => entry.startsWith(token(id)))?.slice(-1) ?? null;

export function validInboxSignal(value, role, transport = "direct") {
  if (!object(value) || !["host", "sender"].includes(role)) return null;
  if (role === "host" && !identity(value.to)) return null;
  const signal = validBroadcastSignal(role === "host" ? { ...value, to: SIGNAL_TARGET } : value,
    role === "host" ? "host" : "listener", transport);
  if (signal?.sdp !== undefined) {
    const directions = signal.sdp.split(/\r?\n/).filter((line) => /^a=(sendonly|recvonly|sendrecv|inactive)$/.test(line));
    if (directions.length !== 1 || directions[0] !== (role === "host" ? "a=recvonly" : "a=sendonly")) return null;
  }
  return signal;
}

export class Inbox {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair("ping", "pong"));
  }

  sockets(role) {
    return this.ctx.getWebSockets("inbox").filter((ws) => ws.readyState === 1
      && ws.deserializeAttachment() !== null && (role === undefined || ws.deserializeAttachment().role === role));
  }

  host() { return this.sockets("host")[0] ?? null; }

  attach(ws, value) {
    if (!fits(value)) return false;
    ws.serializeAttachment(value);
    return true;
  }

  cleanup() {
    for (const ws of this.sockets("pending")) {
      if (ws.deserializeAttachment().deadline <= Date.now()) this.refuse(ws, 4408, "timeout");
    }
  }

  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/_discovery/check" && request.method === "POST") {
      let claim;
      try {
        const text = await request.text();
        if (text.length > 512) return new Response(null, { status: 400 });
        claim = JSON.parse(text);
      } catch { return new Response(null, { status: 400 }); }
      if (!fields(claim, ["code", "lease", "scope", "tool"]) || claim.tool !== "voice-oncall"
          || !identity(claim.code) || !validPublication(claim) || !validScope(claim.scope)) {
        return new Response(null, { status: 400 });
      }
      const owner = this.host()?.deserializeAttachment();
      if (!owner || owner.ended || owner.code !== claim.code || owner.scope !== claim.scope || owner.lease !== claim.lease) {
        return new Response(null, { status: 403 });
      }
      return new Response(JSON.stringify({ name: owner.name, locked: owner.passwordHash !== null, ...transportFrame(mode(owner.transport)) }), {
        headers: { "content-type": "application/json" },
      });
    }
    const code = url.pathname.match(/^\/inbox\/([a-f0-9]{64})$/)?.[1];
    if (!code || url.search || request.headers.get("Upgrade") !== "websocket") return new Response(null, { status: 404 });
    this.cleanup();
    const { 0: client, 1: server } = new WebSocketPair();
    if (this.sockets("pending").length >= MAX_PENDING) {
      server.accept();
      server.send(JSON.stringify({ type: "error", error: "full" }));
      server.close(4429, "full");
    } else {
      const scope = request.headers.get(DISCOVERY_SCOPE_HEADER);
      this.ctx.acceptWebSocket(server, ["inbox"]);
      this.attach(server, { role: "pending", code, scope: validScope(scope) ? scope : null,
        deadline: Date.now() + AUTH_TIMEOUT, window: Date.now(), updates: 0 });
    }
    return new Response(null, { status: 101, webSocket: client });
  }

  send(ws, value) {
    try {
      if (typeof ws.bufferedAmount === "number" && ws.bufferedAmount > MAX_BUFFER) throw new Error("backpressure");
      ws.send(JSON.stringify(value));
      return true;
    } catch {
      this.drop(ws);
      try { ws.close(1011, "send-failed"); } catch {}
      return false;
    }
  }

  refuse(ws, code, error) {
    this.send(ws, { type: "error", error });
    this.drop(ws);
    try { ws.close(code, error); } catch {}
  }

  terminal(ws, type, code = 4403) {
    this.send(ws, { type });
    this.drop(ws);
    try { ws.close(code, type); } catch {}
  }

  trusted() {
    return this.host()?.deserializeAttachment() ?? this.sockets("sender")
      .map((ws) => ws.deserializeAttachment()).find((who) => who.verified && who.anchor)?.anchor ?? null;
  }

  async authenticate(ws, value, who) {
    const isHost = value.role === "host";
    const transport = mode(value.transport);
    const anonymous = value.role === "sender" && !Object.hasOwn(value, "name");
    const name = anonymous ? "" : cleanName(isHost ? value.roomName : value.name, isHost ? 80 : 64);
    if (transport === null || !fields(value, ["type", "role", "key", ...(anonymous ? [] : [isHost ? "roomName" : "name"]), "passwordProof",
      ...(Object.hasOwn(value, "transport") ? ["transport"] : [])])
        || value.type !== "auth" || !["host", "sender"].includes(value.role)
        || !validKey(value.key) || !proof(value.passwordProof) || name === null) {
      this.refuse(ws, 4400, "invalid"); return;
    }
    this.attach(ws, { ...who, authenticating: true });
    const [keyHash, passwordHash] = await Promise.all([
      broadcastCode(value.key), value.passwordProof === null ? Promise.resolve(null) : broadcastCode(value.passwordProof),
    ]);
    const current = ws.deserializeAttachment();
    if (ws.readyState !== 1 || current?.role !== "pending" || !current.authenticating) return;
    if (current.deadline <= Date.now()) { this.refuse(ws, 4408, "timeout"); return; }
    const trusted = this.trusted();
    if (isHost) {
      if (keyHash !== who.code) { this.refuse(ws, 4403, "unauthorized"); return; }
      if (transport === "relay" && !relayEnabled(this.env, "voice-oncall")) { this.refuse(ws, 4403, "relay-unavailable"); return; }
      if (trusted?.ended) { this.terminal(ws, "ended", 1000); return; }
      if (trusted && mode(trusted.transport) !== transport) { this.refuse(ws, 4403, "transport-mismatch"); return; }
      const previous = this.sockets("host"), generation = crypto.randomUUID(), lease = crypto.randomUUID();
      const owner = { role: "host", code: who.code, scope: who.scope, lease, generation, ...transportFrame(transport),
        name: trusted?.name ?? name, passwordHash: trusted ? trusted.passwordHash : passwordHash,
        moderation: trusted?.moderation ?? [], ended: false, window: Date.now(), updates: 0 };
      if (!this.attach(ws, owner)) { this.refuse(ws, 4429, "full"); return; }
      for (const old of previous) {
        const retired = old.deserializeAttachment();
        old.serializeAttachment(null);
        this.withdraw(retired);
        this.send(old, { type: "replaced" });
        try { old.close(4409, "replaced"); } catch {}
      }
      const discovery = validScope(owner.scope) ? { code: owner.code, lease, name: owner.name,
        locked: owner.passwordHash !== null, tool: "voice-oncall" } : null;
      if (!this.send(ws, { type: "host-ready", generation, discovery, ...transportFrame(transport) })) return;
      for (const sender of this.sockets("sender")) this.ready(sender);
      return;
    }
    if (trusted?.passwordHash !== undefined && trusted.passwordHash !== passwordHash) {
      this.refuse(ws, 4403, "password"); return;
    }
    if (trusted && mode(trusted.transport) !== transport) { this.refuse(ws, 4403, "transport-mismatch"); return; }
    if (trusted?.ended) { this.terminal(ws, "ended", 1000); return; }
    if (trusted && moderation(trusted, keyHash) === "k") { this.terminal(ws, "kicked"); return; }
    const previous = this.sockets("sender").filter((peer) => peer.deserializeAttachment().id === keyHash);
    const verified = trusted !== null;
    const peers = this.sockets("sender").filter((peer) => !previous.includes(peer));
    const limit = transport === "relay" ? Math.min(MAX_SENDERS, relayPolicy(this.env)?.maxPeers ?? 0) : MAX_SENDERS;
    if (peers.filter((peer) => peer.deserializeAttachment().verified === verified).length >= (verified ? limit : Math.min(limit, MAX_PROBES))) {
      this.refuse(ws, 4429, "full"); return;
    }
    const sender = { role: "sender", id: keyHash, name, passwordHash, verified, ...transportFrame(transport),
      generation: null, connection: null, muted: trusted ? moderation(trusted, keyHash) === "m" : false,
      talking: false, anchor: trusted ? anchor(trusted) : null, window: Date.now(), updates: 0 };
    if (!this.attach(ws, sender)) { this.refuse(ws, 4429, "full"); return; }
    for (const old of previous) {
      old.serializeAttachment(null);
      this.send(old, { type: "replaced" });
      try { old.close(4409, "replaced"); } catch {}
    }
    this.ready(ws);
  }

  ready(ws) {
    const who = ws.deserializeAttachment();
    if (who?.role !== "sender" || ws.readyState !== 1) return;
    const host = this.host(), owner = host?.deserializeAttachment();
    if (!owner) { this.send(ws, { type: who.anchor?.ended ? "ended" : "waiting" }); return; }
    if (who.passwordHash !== owner.passwordHash) { this.refuse(ws, 4403, "password"); return; }
    if (mode(who.transport) !== mode(owner.transport)) { this.refuse(ws, 4403, "transport-mismatch"); return; }
    if (owner.ended) { this.terminal(ws, "ended", 1000); return; }
    if (moderation(owner, who.id) === "k") { this.terminal(ws, "kicked"); return; }
    const limit = owner.transport === "relay" ? Math.min(MAX_SENDERS, relayPolicy(this.env)?.maxPeers ?? 0) : MAX_SENDERS;
    if (!who.verified && this.sockets("sender").filter((peer) => peer.deserializeAttachment().verified).length >= limit) {
      this.refuse(ws, 4429, "full"); return;
    }
    const joining = !who.verified || who.generation !== owner.generation;
    const updated = { ...who, verified: true, generation: owner.generation, anchor: anchor(owner),
      muted: moderation(owner, who.id) === "m", ...(joining ? { connection: null, talking: false } : {}) };
    if (!this.attach(ws, updated)) { this.refuse(ws, 4429, "full"); return; }
    if (this.send(ws, { type: "ready", id: who.id, generation: owner.generation,
      muted: updated.muted, talking: updated.talking, ...transportFrame(mode(owner.transport)) }) && joining) {
      this.send(host, { type: "join", id: who.id, generation: owner.generation,
        name: updated.name, muted: updated.muted, talking: updated.talking });
    }
  }

  remember(host, who, id, state) {
    const retained = who.moderation.filter((entry) => !entry.startsWith(token(id)));
    if (state !== null) retained.push(token(id) + state);
    const owner = { ...who, moderation: retained };
    const projections = this.sockets("sender").filter((ws) => ws.deserializeAttachment().verified)
      .map((ws) => ({ ws, value: { ...ws.deserializeAttachment(), anchor: anchor(owner),
        ...(ws.deserializeAttachment().id === id ? { muted: state !== null, talking: false } : {}) } }));
    if (retained.length > MAX_MODERATION || !fits(owner) || projections.some(({ value }) => !fits(value))) {
      this.send(host, { type: "error", error: "moderation-full" }); return false;
    }
    this.attach(host, owner);
    for (const { ws, value } of projections) this.attach(ws, value);
    return true;
  }

  async webSocketMessage(ws, message) {
    this.cleanup();
    let who = ws.deserializeAttachment();
    if (who === null || ws.readyState !== 1 || message === "ping") return;
    if (typeof message !== "string" || message.length > MAX_MESSAGE) { this.refuse(ws, 4400, "invalid"); return; }
    const now = Date.now(), updates = now - who.window >= RATE_WINDOW ? 1 : who.updates + 1;
    if (updates > MAX_UPDATES) { this.refuse(ws, 4429, "busy"); return; }
    who = { ...who, window: now - who.window >= RATE_WINDOW ? now : who.window, updates };
    if (!this.attach(ws, who)) { this.refuse(ws, 4429, "full"); return; }
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
          && (current.role === "host" || current.role === "sender" && current.verified);
      };
      return answerRelayRequest(ws, value, { env: this.env, tool: "voice-oncall", authorized,
        current: () => ws.readyState === 1 && ws.deserializeAttachment()?.generation === generation });
    }
    if (who.role === "sender" && fields(value, ["type"]) && value.type === "leave") {
      this.drop(ws); try { ws.close(1000, "left"); } catch {} return;
    }
    if (who.role === "sender" && fields(value, ["type"]) && value.type === "check") { this.ready(ws); return; }
    const host = this.host(), owner = host?.deserializeAttachment();
    if (!owner) { this.send(ws, { type: who.anchor?.ended ? "ended" : "waiting" }); return; }
    if (owner.ended) { this.send(ws, { type: "ended" }); return; }
    if (value.generation !== owner.generation || who.generation !== owner.generation) {
      this.send(ws, { type: "error", error: "stale" }); return;
    }
    if (who.role === "sender" && value.type === "status" && fields(value, ["type", "generation", "talking"])
        && typeof value.talking === "boolean" && who.verified) {
      const talking = value.talking && !who.muted;
      this.attach(ws, { ...who, talking });
      this.send(host, { type: "status", id: who.id, generation: owner.generation, talking });
      return;
    }
    if (who.role === "host" && value.type === "end" && fields(value, ["type", "generation"])) {
      const ended = { ...who, ended: true };
      this.attach(ws, ended);
      this.withdraw(ended);
      for (const sender of this.sockets("sender")) {
        this.attach(sender, { ...sender.deserializeAttachment(), anchor: anchor(ended), talking: false, connection: null });
        this.send(sender, { type: "ended" });
      }
      this.send(ws, { type: "ended" });
      return;
    }
    if (who.role === "host" && ["moderate", "kick"].includes(value.type)) {
      const valid = identity(value.to) && (value.type === "kick" ? fields(value, ["type", "to", "generation"])
        : fields(value, ["type", "to", "generation", "muted"]) && typeof value.muted === "boolean");
      if (!valid) { this.send(ws, { type: "error", error: "invalid" }); return; }
      const sender = this.sockets("sender").find((peer) => peer.deserializeAttachment().id === value.to
        && peer.deserializeAttachment().verified && peer.deserializeAttachment().generation === owner.generation);
      if (!sender) { this.send(ws, { type: "error", error: "stale" }); return; }
      if (!this.remember(ws, who, value.to, value.type === "kick" ? "k" : value.muted ? "m" : null)) return;
      if (value.type === "kick") { this.terminal(sender, "kicked"); return; }
      this.send(sender, { type: "moderated", generation: owner.generation, muted: value.muted });
      this.send(ws, { type: "moderated", id: value.to, generation: owner.generation, muted: value.muted });
      return;
    }
    const signal = validInboxSignal(value, who.role, mode(owner.transport));
    if (signal === null) { this.send(ws, { type: "error", error: "invalid" }); return; }
    if (who.role === "host") {
      const sender = this.sockets("sender").find((peer) => peer.deserializeAttachment().id === value.to);
      const target = sender?.deserializeAttachment();
      if (!target?.verified || target.generation !== owner.generation) { this.send(ws, { type: "error", error: "stale" }); return; }
      if (signal.type === "offer") this.attach(sender, { ...target, connection: signal.connection });
      this.send(sender, { ...signal, from: "host", to: target.id });
    } else {
      if (!who.verified || who.connection !== signal.connection) { this.send(ws, { type: "error", error: "stale" }); return; }
      this.send(host, { ...signal, from: who.id, to: "host" });
    }
  }

  withdraw(owner) {
    if (!owner || !validScope(owner.scope) || !validPublication(owner)) return;
    this.ctx.waitUntil(Promise.resolve().then(() => this.env.DISCOVERY.get(this.env.DISCOVERY.idFromName(owner.scope)).fetch(
      "https://discovery.internal/_discovery/withdraw", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ code: owner.code, lease: owner.lease, tool: "voice-oncall" }),
      },
    )).catch(() => {}));
  }

  webSocketClose(ws) { this.drop(ws); }
  webSocketError(ws) { this.drop(ws); }

  drop(ws) {
    const who = ws.deserializeAttachment();
    if (who === null) return;
    ws.serializeAttachment(null);
    if (who.role === "host") {
      this.withdraw(who);
      for (const sender of this.sockets("sender")) {
        const participant = sender.deserializeAttachment();
        if (participant.verified) this.attach(sender, { ...participant, anchor: anchor(who), talking: false });
        this.send(sender, { type: who.ended ? "ended" : "waiting" });
      }
    } else if (who.role === "sender" && who.verified) {
      const host = this.host();
      if (host?.deserializeAttachment().generation === who.generation) {
        this.send(host, { type: "leave", id: who.id, generation: who.generation });
      }
    }
  }
}
