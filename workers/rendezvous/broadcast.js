// A voice room has no directory, relay, or stored payloads. Its authority and
// current generation live in socket attachments, so hibernation cannot forget
// them and the last socket leaving removes the room's complete state.

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

function candidateLine(value) {
  if (typeof value !== "string" || value.length > 4096 || /[\r\n\x00]/.test(value)) return false;
  if (value === "") return true;
  const parts = value.trim().split(/ +/);
  if (parts.length < 8 || !/^candidate:[a-z0-9+/_-]{1,64}$/i.test(parts[0])
      || !/^[12]$/.test(parts[1]) || !/^(udp|tcp)$/i.test(parts[2])
      || !/^\d{1,10}$/.test(parts[3]) || Number(parts[3]) > 0xffffffff
      || !hostAddress(parts[4]) || !/^\d{1,5}$/.test(parts[5])
      || Number(parts[5]) < 1 || Number(parts[5]) > 65535
      || parts[6] !== "typ" || parts[7] !== "host" || (parts.length - 8) % 2 !== 0) return false;
  const extensions = new Set(["raddr", "rport", "tcptype", "generation", "ufrag", "network-id", "network-cost"]);
  for (let i = 8; i < parts.length; i += 2) {
    if (!extensions.has(parts[i]) || !/^[a-z0-9+/_-]{1,256}$/i.test(parts[i + 1])
        && !(parts[i] === "raddr" && hostAddress(parts[i + 1]))) return false;
    if (parts[i] === "raddr" && !hostAddress(parts[i + 1])) return false;
  }
  return true;
}

function candidate(value) {
  if (value === null) return true;
  if (!object(value) || !Object.hasOwn(value, "candidate")
      || Object.keys(value).some((name) => !["candidate", "sdpMid", "sdpMLineIndex", "usernameFragment"].includes(name))
      || !candidateLine(value.candidate)) return false;
  for (const name of ["sdpMid", "usernameFragment"]) {
    if (value[name] != null && (typeof value[name] !== "string" || value[name].length > 256)) return false;
  }
  return value.sdpMLineIndex == null || Number.isInteger(value.sdpMLineIndex)
    && value.sdpMLineIndex >= 0 && value.sdpMLineIndex <= 255;
}

function description(value) {
  if (typeof value !== "string" || value.length > 32 * 1024) return false;
  const lines = value.split(/\r?\n/).filter(Boolean);
  if (lines.length > 512 || lines[0] !== "v=0"
      || lines.some((line) => !/^[a-z]=[\x20-\x7e]*$/.test(line))) return false;
  const media = lines.filter((line) => line.startsWith("m="));
  if (media.length !== 1 || !/^m=audio \d{1,5} (?:UDP|TCP)\/TLS\/RTP\/SAVPF [0-9 ]+$/.test(media[0])) return false;
  for (const line of lines) {
    if (line.startsWith("a=candidate:") && !candidateLine(line.slice(2))) return false;
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
export function validBroadcastSignal(value, role) {
  if (!object(value) || !uuid(value.generation) || !uuid(value.connection)) return null;
  const names = ["type", "generation", "connection", ...(role === "host" ? ["to"] : [])];
  if (role === "host" && !uuid(value.to)) return null;
  if (value.type === (role === "host" ? "offer" : "answer")) {
    if (!fields(value, [...names, "sdp"]) || !description(value.sdp)) return null;
    return { type: value.type, generation: value.generation, connection: value.connection, sdp: value.sdp };
  }
  if (value.type === "candidate" && fields(value, [...names, "candidate"]) && candidate(value.candidate)) {
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
    const url = new URL(request.url), code = url.pathname.match(/^\/broadcast\/([a-f0-9]{64})$/)?.[1];
    if (!code || url.search || request.headers.get("Upgrade") !== "websocket") return new Response(null, { status: 404 });
    this.cleanup();
    const { 0: client, 1: server } = new WebSocketPair();
    if (this.sockets("pending").length >= MAX_PENDING) {
      server.accept();
      server.send(JSON.stringify({ type: "error", error: "full" }));
      server.close(4429, "full");
    } else {
      this.ctx.acceptWebSocket(server, ["broadcast"]);
      server.serializeAttachment({ role: "pending", code, deadline: Date.now() + AUTH_TIMEOUT,
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
    if (!fields(value, isHost ? ["type", "role", "key", "listenKey"] : ["type", "role", "key"])
        || value.type !== "auth" || !["host", "listener"].includes(value.role)
        || typeof value.key !== "string" || !KEY.test(value.key)
        || isHost && (typeof value.listenKey !== "string" || !KEY.test(value.listenKey))) {
      this.refuse(ws, 4400, "invalid"); return;
    }
    // Claim the pending socket before digesting: a second auth frame and a
    // concurrent timeout must not install authority after this one is retired.
    ws.serializeAttachment({ ...who, authenticating: true });
    const [keyHash, listenHash] = await Promise.all([
      broadcastCode(value.key), isHost ? broadcastCode(value.listenKey) : Promise.resolve(null),
    ]);
    const current = ws.deserializeAttachment();
    if (ws.readyState !== 1 || current?.role !== "pending" || !current.authenticating) return;
    if (current.deadline <= Date.now()) { this.refuse(ws, 4408, "timeout"); return; }
    if (isHost) {
      if (keyHash !== who.code) { this.refuse(ws, 4403, "unauthorized"); return; }
      const previous = this.sockets("host");
      const generation = crypto.randomUUID();
      ws.serializeAttachment({ role: "host", code: who.code, listenHash, generation,
        talking: false, ended: false, window: Date.now(), updates: 0 });
      for (const old of previous) {
        // Blank first: the replaced socket's eventual close cannot park a
        // new host's listeners or undo the new generation.
        old.serializeAttachment(null);
        this.send(old, { type: "replaced" });
        try { old.close(4409, "replaced"); } catch {}
      }
      if (!this.send(ws, { type: "host-ready", generation })) return;
      for (const listener of this.sockets("listener")) {
        if (listener.deserializeAttachment().listenHash !== listenHash) this.refuse(listener, 4403, "unauthorized");
        else this.ready(listener);
      }
      return;
    }
    if (this.sockets("listener").length >= MAX_LISTENERS) { this.refuse(ws, 4429, "full"); return; }
    const host = this.host()?.deserializeAttachment();
    const anchors = this.sockets("listener").map((peer) => peer.deserializeAttachment()).filter((peer) => peer.verified);
    const trusted = host ?? anchors[0];
    if (trusted && trusted.listenHash !== keyHash) { this.refuse(ws, 4403, "unauthorized"); return; }
    ws.serializeAttachment({ role: "listener", code: who.code, id: crypto.randomUUID(),
      listenHash: keyHash, verified: trusted !== undefined && trusted !== null,
      generation: host ? null : trusted?.generation ?? null, connection: null,
      ended: trusted?.ended === true, window: Date.now(), updates: 0 });
    this.ready(ws);
  }

  ready(ws) {
    const who = ws.deserializeAttachment();
    if (who?.role !== "listener" || ws.readyState !== 1) return;
    const host = this.host(), owner = host?.deserializeAttachment();
    if (!owner) { this.send(ws, { type: who.ended ? "ended" : "waiting" }); return; }
    if (who.listenHash !== owner.listenHash) { this.refuse(ws, 4403, "unauthorized"); return; }
    const joining = !who.verified || who.generation !== owner.generation;
    const updated = { ...who, verified: true, generation: owner.generation,
      ended: owner.ended, ...(joining ? { connection: null } : {}) };
    ws.serializeAttachment(updated);
    if (owner.ended) { this.send(ws, { type: "ended" }); return; }
    if (this.send(ws, { type: "ready", id: who.id, generation: owner.generation, talking: owner.talking }) && joining) {
      this.send(host, { type: "join", id: who.id, generation: owner.generation });
    }
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
    if (who.role === "host" && value.type === "status" && fields(value, ["type", "generation", "talking"])
        && typeof value.talking === "boolean") {
      ws.serializeAttachment({ ...who, talking: value.talking });
      for (const listener of this.sockets("listener")) this.send(listener, {
        type: "status", generation: owner.generation, talking: value.talking });
      return;
    }
    if (who.role === "host" && value.type === "end" && fields(value, ["type", "generation"])) {
      ws.serializeAttachment({ ...who, ended: true, talking: false });
      for (const listener of this.sockets("listener")) {
        listener.serializeAttachment({ ...listener.deserializeAttachment(), ended: true, connection: null });
        this.send(listener, { type: "ended" });
      }
      this.send(ws, { type: "ended" });
      return;
    }
    const signal = validBroadcastSignal(value, who.role);
    if (signal === null) { this.send(ws, { type: "error", error: "invalid" }); return; }
    if (who.role === "host") {
      const listener = this.sockets("listener").find((peer) => peer.deserializeAttachment().id === value.to);
      const target = listener?.deserializeAttachment();
      if (!target?.verified || target.generation !== owner.generation) { this.send(ws, { type: "error", error: "stale" }); return; }
      // Candidates can precede an offer, and late candidates can follow a
      // replacement offer. Only the offer establishes the answer's authority.
      if (signal.type === "offer") listener.serializeAttachment({ ...target, connection: signal.connection });
      this.send(listener, { ...signal, from: "host", to: target.id });
    } else {
      if (!who.verified || who.connection !== signal.connection) { this.send(ws, { type: "error", error: "stale" }); return; }
      this.send(host, { ...signal, from: who.id, to: "host" });
    }
  }

  webSocketClose(ws) { this.drop(ws); }
  webSocketError(ws) { this.drop(ws); }

  drop(ws) {
    const who = ws.deserializeAttachment();
    if (who === null) return;
    ws.serializeAttachment(null);
    if (who.role === "host") {
      for (const listener of this.sockets("listener")) {
        this.send(listener, { type: listener.deserializeAttachment().ended ? "ended" : "waiting" });
      }
    } else if (who.role === "listener" && who.verified) {
      const host = this.host();
      if (host?.deserializeAttachment().generation === who.generation) {
        this.send(host, { type: "leave", id: who.id, generation: who.generation });
      }
    }
  }
}
