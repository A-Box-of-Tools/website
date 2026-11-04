// The rendezvous for the site's direct browser connections: one server
// component, carrying introductions rather than the content they negotiate.
//
// It upgrades /ws/<code> to a WebSocket handled by one Durable Object per
// code word. The object stores nothing - its whole state is the sockets
// currently connected to it, so a room ceases to exist the moment the
// sharer's tab closes. (A host whose connection is lost rather than closed
// leaves one opaque digest in the object's memory for two minutes, so its own
// retry finds the name still held. That is never written anywhere.) All it
// does is forward small JSON blobs (WebRTC
// session descriptions and ICE candidates) between the one host and each
// viewer. A separate discovery socket lists only the live codes that local
// hosts explicitly offer, grouped by the edge address and page origin. The
// text and the files travel over the peer-to-peer channel those blobs
// negotiate, encrypted end
// to end, and no byte of them passes through here.
//
// Deployed by hand: `npx wrangler deploy` from this directory, logged in to
// the site's Cloudflare account. Hibernation avoids active-object duration
// between messages; request and TURN charges follow the account's plan.
//
// It answers only the site's own pages, and lets one address knock only so
// often. Both are the least that keeps a switchboard with no login from being
// borrowed, and neither reads anything. The lines it ever prints are the
// close code of a refusal. Relay credentials and API responses are never logged.
//
// An explicitly selected Cloud relay room may mint bounded, short-lived
// credentials for Cloudflare's TURN service and receive them on the same
// socket. The relay forwards the DTLS-encrypted bytes between the two
// browsers and cannot read them - it holds no key - so what changes is the
// path, not what anyone can see. Two secrets make it possible, set with
// `npx wrangler secret put`: TURN_KEY_ID and TURN_KEY_TOKEN, from a TURN key
// made in the dashboard under Realtime. Without them the request returns
// unavailable. Direct rooms cannot silently widen their transport policy.

// A browser sends Origin on every WebSocket handshake and a page cannot forge
// it, so checking it keeps the rendezvous from becoming free signalling for
// somebody else's site. A script can send any Origin it likes; the rate limit
// is for that. Local builds are served from localhost and need the live
// rendezvous to try the tool at all, so localhost is let in on any port.
import { DISCOVERY_SCOPE_HEADER, Discovery, discoveryScope, pageOrigin, rendezvousTool, requestedGroup, roomName, validPublication, validScope, validVoiceQuery } from "./discovery.js";
import { Broadcast, broadcastCode } from "./broadcast.js";
import { Inbox } from "./inbox.js";
import { answerRelayRequest, relayEnabled, relayPolicy, relayServers, validRelayRequest } from "./relay.js";
import { requestNetwork } from "../shared/address.js";

export { Broadcast, Discovery, Inbox, relayServers };

function roomTransport(url) {
  const values = url.searchParams.getAll('transport');
  return values.length > 1 || values.length && !['direct', 'relay'].includes(values[0]) ? null : values[0] ?? 'direct';
}

// A cached page sends no digest and keeps first-come hosting. Invalid must not
// silently become that: it would drop the credential the page thinks it has.
function roomHolder(url) {
  const values = url.searchParams.getAll('holder');
  if (values.length === 0) return undefined;
  return values.length === 1 && /^[a-f0-9]{64}$/.test(values[0]) ? values[0] : null;
}
// Every pull request is deployed to a preview of its own on Cloudflare Pages
// (see the `preview` job in .github/workflows/build.yml), at
// https://pr-<n>.abox-preview.pages.dev, and the QA suite is run against it -
// share-text included, which is the one tool that cannot work without this
// worker's say-so. The suffix is the project's, so no other Pages project on
// the same platform is let in by it.
function fromOurPage(origin) {
  return pageOrigin(origin) !== null;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/") {
      return new Response(
        "The rendezvous for abox.tools/share-text/, share-tab/, remote-camera/, walkie-talkie/, and voice-oncall/. "
        + "It introduces browsers to each other and never sees what they exchange.\n",
        { headers: { "content-type": "text/plain; charset=utf-8" } },
      );
    }
    const broadcast = url.pathname.match(/^\/broadcast\/([a-f0-9]{64})$/);
    if (broadcast) {
      // A separate binding leaves text/camera rooms and their relay protocol
      // unchanged. Voice capabilities enter the first WSS frame, never a URL.
      if (!validVoiceQuery(url)) return new Response("unexpected parameters", { status: 400 });
      if (request.headers.get("Upgrade") !== "websocket") return new Response("expected a websocket", { status: 426 });
      if (!fromOurPage(request.headers.get("Origin"))) return new Response("not for this page", { status: 403 });
      const knock = await env.LIMIT.limit({ key: requestNetwork(request) });
      if (!knock.success) return new Response("too many connections from this address", { status: 429 });
      const scope = await discoveryScope(request, "walkie-talkie");
      const headers = new Headers(request.headers);
      headers.delete(DISCOVERY_SCOPE_HEADER);
      if (scope !== null) headers.set(DISCOVERY_SCOPE_HEADER, scope);
      return env.BROADCASTS.get(env.BROADCASTS.idFromName(broadcast[1])).fetch(new Request(request, { headers }));
    }
    const inbox = url.pathname.match(/^\/inbox\/([a-f0-9]{64})$/);
    if (inbox) {
      if (!validVoiceQuery(url)) return new Response("unexpected parameters", { status: 400 });
      if (request.headers.get("Upgrade") !== "websocket") return new Response("expected a websocket", { status: 426 });
      if (!fromOurPage(request.headers.get("Origin"))) return new Response("not for this page", { status: 403 });
      const knock = await env.LIMIT.limit({ key: requestNetwork(request) });
      if (!knock.success) return new Response("too many connections from this address", { status: 429 });
      const scope = await discoveryScope(request, "voice-oncall");
      const headers = new Headers(request.headers);
      headers.delete(DISCOVERY_SCOPE_HEADER);
      if (scope !== null) headers.set(DISCOVERY_SCOPE_HEADER, scope);
      return env.INBOXES.get(env.INBOXES.idFromName(inbox[1])).fetch(new Request(request, { headers }));
    }
    const room = url.pathname.match(/^\/ws\/([a-z0-9][a-z0-9-]{0,63})$/);
    if (room || url.pathname === "/discover") {
      const tool = rendezvousTool(url.searchParams.get("tool"));
      if (tool === null) return new Response("unknown tool", { status: 400 });
      if (requestedGroup(url) === null) return new Response("invalid discovery group", { status: 400 });
      if (room && roomTransport(url) === null) return new Response("invalid transport", { status: 400 });
      if (room && roomHolder(url) === null) return new Response("invalid holder", { status: 400 });
      if (room && ["voice-oncall", "walkie-talkie"].includes(tool)) return new Response("not found", { status: 404 });
      if (request.headers.get("Upgrade") !== "websocket") {
        return new Response("expected a websocket", { status: 426 });
      }
      if (!fromOurPage(request.headers.get("Origin"))) {
        return new Response("not for this page", { status: 403 });
      }
      const discover = url.pathname === "/discover";
      const offered = room && url.searchParams.get("role") === "host"
        && url.searchParams.get("discover") === "1"
        && (url.searchParams.get("local") === "1" || tool === "share-text" && requestedGroup(url) !== undefined);
      let scope = null;
      if (discover || offered) {
        scope = await discoveryScope(request, tool);
        if (discover && scope === null) return new Response("discovery unavailable for this address", { status: 403 });
      }
      // Keyed by address rather than by room: the nuisance this caps is one
      // client opening rooms by the thousand, and the room name is theirs to
      // vary. Counted per Cloudflare location, so it is a cap, not a wall.
      const knock = await env.LIMIT.limit({ key: requestNetwork(request) });
      if (!knock.success) {
        return new Response("too many connections from this address", { status: 429 });
      }
      // The binding-only scope is always derived here. A private directory
      // additionally requires proof inside its socket before it reveals or
      // accepts a listing; knowing its public URL identifier is insufficient.
      const headers = new Headers(request.headers);
      headers.delete(DISCOVERY_SCOPE_HEADER);
      if (scope !== null) headers.set(DISCOVERY_SCOPE_HEADER, scope);
      const forwarded = new Request(request, { headers });
      if (discover) return env.DISCOVERY.get(env.DISCOVERY.idFromName(scope)).fetch(forwarded);
      return env.ROOMS.get(env.ROOMS.idFromName(roomName(room[1], tool))).fetch(forwarded);
    }
    return new Response("not found", { status: 404 });
  },
};

const MAX_VIEWERS = 16;
// UTF-16 units, not bytes, so up to three times this on the wire: a bound on
// nonsense rather than a budget. A session description is a few kilobytes.
const MAX_MESSAGE = 64 * 1024;
const RATE_WINDOW = 10000;
const MAX_UPDATES = 120;
const HOST_KEY = /^[A-Za-z0-9_-]{43}$/;
const PROOF_TIMEOUT = 8000;
// Outlasts a page's automatic retries (Camera's run for about a minute). It
// binds nobody who left deliberately: a clean close frees the name at once.
const HOST_GRACE = 120000;

// The one line this worker prints. A refusal completes the upgrade with 101
// exactly like an admission, so the invocation log cannot tell the two apart;
// this can, and it carries the code alone - no name, no address, nothing a
// person typed.
const logRefusal = (code, reason) => console.log(JSON.stringify({ refused: code, reason }));

// One room. Sockets are tagged with their role - viewers also with a random
// id - and everything that must survive hibernation lives on them. A voice
// room's code is the digest of its host's secret, so its address alone can
// recognise that host after every socket has gone. A text or camera room is
// named by people and has no such memory, which is why `vacancy` exists: the
// digest of a host whose connection was lost, held only in this object's
// memory and never written to storage.
export class Room {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.vacancy = null;
    // Keepalives are answered without waking the object.
    this.ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair("ping", "pong"));
  }

  // Tags are fixed when a socket is accepted, and a socket waiting to prove it
  // holds the room may yet become its host, so the attachment decides.
  hosts() {
    return this.ctx.getWebSockets("host").filter((ws) => ws.deserializeAttachment()?.role === "host");
  }

  vacated() {
    if (this.vacancy !== null && this.vacancy.until <= Date.now()) this.vacancy = null;
    return this.vacancy;
  }

  retire(ws, code, reason) {
    this.drop(ws);
    try { ws.close(code, reason); } catch {}
  }

  seat(ws, { code, tool, scope, local, offered, transport, transportPinned, holder }) {
    this.vacancy = null;
    const policy = { transport, transportPinned, generation: crypto.randomUUID(), window: Date.now(), updates: 0,
      ...(holder === undefined ? {} : { holder }) };
    if (offered) {
      const lease = crypto.randomUUID();
      ws.serializeAttachment({ role: "host", code, scope, tool, local, discover: true, lease, ...policy });
      ws.send(JSON.stringify({ type: "host-ready", ...(transport === 'relay' ? { transport } : {}), discovery: { code, lease, ...(tool === "share-text" ? {} : { tool }), ...(transport === 'relay' ? { transport } : {}) } }));
    } else {
      ws.serializeAttachment({ role: "host", ...(tool === "share-text" ? {} : { tool }), local, ...policy });
      if (transport === 'relay') ws.send(JSON.stringify({ type: 'host-ready', transport }));
    }
  }

  // Naming the digest is not enough to displace anybody: it can be read back out
  // of an invocation log. Only the secret behind it replaces a host.
  async prove(ws, parsed, who) {
    // A relay page asks for credentials the moment its socket opens, before it
    // has read the request for proof. Its question is answered once it is seated.
    if (parsed.type === "relay-request") {
      if (validRelayRequest(parsed)) ws.serializeAttachment({ ...who, relayAsk: parsed.id });
      return;
    }
    if (parsed.type !== "host-proof" || who.proving) return;
    ws.serializeAttachment({ ...who, proving: true });
    const digest = typeof parsed.key === "string" && HOST_KEY.test(parsed.key) ? await broadcastCode(parsed.key) : null;
    const current = ws.deserializeAttachment();
    if (ws.readyState !== 1 || current?.role !== "pending") return;
    if (current.deadline <= Date.now()) { logRefusal(4408, "timeout"); this.retire(ws, 4408, "timeout"); return; }
    const held = this.hosts()[0]?.deserializeAttachment() ?? this.vacated();
    if (digest !== current.claim.holder || held && held.holder !== current.claim.holder) {
      logRefusal(4409, "taken");
      this.retire(ws, 4409, "taken");
      return;
    }
    // Readers hear host-gone exactly as if the stale socket had closed a moment
    // sooner. Their ids belonged to that connection and a relay host discards
    // its peers with it, so nothing here can be carried across.
    for (const old of this.hosts()) this.retire(old, 4409, "replaced");
    this.seat(ws, current.claim);
    if (current.relayAsk) await this.relayRequest(ws, { type: "relay-request", id: current.relayAsk }, ws.deserializeAttachment());
  }

  relayRequest(ws, parsed, who) {
    const host = this.hosts()[0];
    const owner = host?.deserializeAttachment();
    const current = () => ws.deserializeAttachment()?.generation === who.generation
      && this.hosts()[0] === host && host?.readyState === 1
      && host.deserializeAttachment()?.generation === owner?.generation;
    return answerRelayRequest(ws, parsed, { env: this.env, tool: owner?.tool ?? 'share-text', current,
      authorized: () => current() && who.transport === 'relay' && owner?.transport === 'relay'
        && (who.role === 'host' ? ws === host : who.role === 'viewer' && who.generation === owner.generation) });
  }

  async fetch(request) {
    const url = new URL(request.url);
    // This endpoint is reachable only through a binding. The public Worker
    // does not forward its path, and the lease never enters a request URL.
    if (url.pathname === "/_discovery/check" && request.method === "POST") {
      let claim;
      try {
        const text = await request.text();
        if (text.length > 512) return new Response(null, { status: 400 });
        claim = JSON.parse(text);
      } catch { return new Response(null, { status: 400 }); }
      const tool = rendezvousTool(claim?.tool);
      if (!validPublication(claim) || !validScope(claim.scope) || tool === null) return new Response(null, { status: 400 });
      const live = this.ctx.getWebSockets("host").find((host) => {
        const who = host.deserializeAttachment();
        return host.readyState === 1 && who?.role === "host" && who.discover === true
          && who.code === claim.code && who.lease === claim.lease && who.scope === claim.scope
          && (who.tool ?? "share-text") === tool;
      });
      const owner = live?.deserializeAttachment();
      if (owner && (owner.transport === 'relay' || owner.local === false)) {
        return Response.json({ ...(owner.transport === 'relay' ? { transport: 'relay' } : {}),
          ...(owner.local === false ? { local: false } : {}) });
      }
      return new Response(null, { status: live ? 204 : 403 });
    }
    const code = url.pathname.match(/^\/ws\/([a-z0-9][a-z0-9-]{0,63})$/)?.[1];
    if (code === undefined) return new Response(null, { status: 404 });
    const role = url.searchParams.get("role");
    const tool = rendezvousTool(url.searchParams.get("tool"));
    if (tool === null) return new Response(null, { status: 400 });
    const group = requestedGroup(url);
    if (group === null) return new Response(null, { status: 400 });
    const transport = roomTransport(url);
    if (transport === null) return new Response(null, { status: 400 });
    const holder = roomHolder(url);
    if (holder === null) return new Response(null, { status: 400 });
    const transportPinned = url.searchParams.has('transport');
    const scope = request.headers.get(DISCOVERY_SCOPE_HEADER);
    // Discovery can be unavailable behind a proxy or an address transform.
    // The local share still works through its copied link; it simply has no
    // lease to advertise unless the edge supplied a trustworthy scope.
    const local = url.searchParams.get("local") === "1";
    const offered = role === "host" && (local || tool === "share-text" && group !== undefined)
      && url.searchParams.get("discover") === "1" && validScope(scope);
    const { 0: client, 1: server } = new WebSocketPair();

    // A refused handshake reaches the browser as a bare error with nothing
    // attached, so rejections complete the upgrade and then close with a
    // 4xxx code the page can read.
    const refuse = (code, reason) => {
      logRefusal(code, reason);
      server.accept();
      server.close(code, reason);
      return new Response(null, { status: 101, webSocket: client });
    };

    for (const ws of this.ctx.getWebSockets("host")) {
      const who = ws.deserializeAttachment();
      if (who?.role !== "pending") continue;
      // A silent claim has no alarm to expire it, and a retrying page only
      // wants its newest socket to be the one that proves itself.
      if (who.deadline <= Date.now() || role === "host" && who.claim.holder === holder) this.retire(ws, 4408, "timeout");
    }
    const hosts = this.hosts();
    if (role === "host") {
      const claimed = hosts[0]?.deserializeAttachment() ?? this.vacated();
      if (claimed && (holder === undefined || claimed.holder !== holder)) return refuse(4409, "taken");
      if (transport === 'relay' && !relayEnabled(this.env, tool)) return refuse(4413, 'relay-unavailable');
      this.ctx.acceptWebSocket(server, ["host"]);
      const claim = { code, tool, scope, local, offered, transport, transportPinned, holder };
      if (claimed) {
        server.serializeAttachment({ role: "pending", claim, deadline: Date.now() + PROOF_TIMEOUT, window: Date.now(), updates: 0 });
        server.send(JSON.stringify({ type: "host-prove" }));
      } else this.seat(server, claim);
    } else if (role === "viewer") {
      if (hosts.length === 0) return refuse(4404, "no-host");
      const owner = hosts[0].deserializeAttachment();
      if ((owner?.transport ?? 'direct') !== transport) return refuse(4412, 'transport-mismatch');
      const limit = transport === 'relay' ? Math.min(MAX_VIEWERS, relayPolicy(this.env)?.maxPeers ?? 0) : MAX_VIEWERS;
      if (this.ctx.getWebSockets("viewer").length >= limit) return refuse(4429, "full");
      // Tags are one namespace - "host", "viewer" and every id - so an id is
      // prefixed to be unmistakable for a role, and a host's `to` is honoured
      // only in that shape. Without both, `to: "viewer"` would reach the room.
      const id = "v:" + crypto.randomUUID();
      this.ctx.acceptWebSocket(server, ["viewer", id]);
      server.serializeAttachment({ role: "viewer", id, transport, generation: owner?.generation, window: Date.now(), updates: 0 });
      // Nothing tells the host yet. A reader's page opens this socket to ask
      // whether anyone is sharing, and promises the host hears nothing of them
      // until they choose to connect.
      server.send(JSON.stringify({ type: "ready", ...(transport === 'relay' ? { transport } : {}) }));
    } else {
      return refuse(4400, "bad-role");
    }
    return new Response(null, { status: 101, webSocket: client });
  }

  // A host answers every reader through this one socket, so a room filling at
  // once needs far more than a single reader's share. It earns that by holding
  // the room's capped seats, and an empty room earns nothing beyond the base.
  allowance(who) {
    return MAX_UPDATES * (who.role === "host" ? Math.max(1, this.ctx.getWebSockets("viewer").length) : 1);
  }

  webSocketMessage(ws, message) {
    if (message === "ping") return;
    let who = ws.deserializeAttachment();
    if (who === null) return;
    // The window comes before anything about the frame is believed, so every
    // kind of frame counts.
    const now = Date.now(), restart = now - (who.window ?? 0) >= RATE_WINDOW, updates = restart ? 1 : who.updates + 1;
    if (updates > this.allowance(who)) {
      logRefusal(4429, "busy");
      this.drop(ws, true);
      try { ws.close(4429, "busy"); } catch {}
      return;
    }
    who = { ...who, window: restart ? now : who.window, updates };
    ws.serializeAttachment(who);
    if (typeof message !== "string" || message.length > MAX_MESSAGE) return;
    let parsed;
    try {
      parsed = JSON.parse(message);
    } catch {
      return;
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return;
    if (who.role === "pending") return this.prove(ws, parsed, who);
    if (parsed.type === 'relay-request') return this.relayRequest(ws, parsed, who);
    if (who.role === "viewer") {
      if (parsed.relay === true) {
        const host = this.hosts()[0]?.deserializeAttachment();
        // Cached text pages retain their old explicit fallback. A new Direct
        // host, a local share, or any other tool never grants that authority.
        if (!host || (host.tool ?? 'share-text') !== 'share-text' || host.transportPinned || host.local === true) return;
        // Once per socket: the flag lives in the attachment, so hibernation
        // cannot forget it and a page cannot mint credentials by the dozen.
        if (who.relayed) return;
        ws.serializeAttachment({ ...who, relayed: true });
        return this.relay(ws);
      }
      if (!who.introduced) ws.serializeAttachment({ ...who, introduced: true });
      this.toHost({ type: "signal", from: who.id, data: parsed.data });
    } else if (typeof parsed.to === "string" && parsed.to.startsWith("v:")) {
      // The viewer's id doubles as its socket tag, so addressing a reply is
      // a lookup, not a scan.
      for (const peer of this.ctx.getWebSockets(parsed.to)) {
        peer.send(JSON.stringify({ type: "signal", data: parsed.data }));
      }
    }
  }

  // A page that stops, navigates or closes sends a close frame and means it. A
  // connection that merely died may be back in seconds, so its name stays held.
  webSocketClose(ws, code, reason, wasClean) {
    this.drop(ws, wasClean !== true);
  }

  webSocketError(ws) {
    this.drop(ws, true);
  }

  drop(ws, lost = false) {
    const who = ws.deserializeAttachment();
    if (who === null) return;
    // Close and error can both fire for one socket; blank the attachment so
    // the second pass finds nothing to do.
    ws.serializeAttachment(null);
    if (who.role === "host") {
      if (lost && who.holder !== undefined) this.vacancy = { holder: who.holder, until: Date.now() + HOST_GRACE };
      if (who.discover === true && validScope(who.scope) && validPublication(who)) {
        // A closing browser may never deliver its fast unpublish hint. Room
        // owns the live-host lease and authoritatively removes both verified
        // advertisements and checks still waiting on its reply.
        this.ctx.waitUntil(this.env.DISCOVERY.get(this.env.DISCOVERY.idFromName(who.scope)).fetch(
          "https://discovery.internal/_discovery/withdraw", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ code: who.code, lease: who.lease, tool: who.tool ?? "share-text" }),
          },
        ).catch(() => {}));
      }
      for (const viewer of this.ctx.getWebSockets("viewer")) {
        try {
          viewer.close(4410, "host-gone");
        } catch {}
      }
    } else if (who.introduced) {
      this.toHost({ type: "leave", id: who.id });
    }
  }

  async relay(ws) {
    const iceServers = relayEnabled(this.env, 'share-text') ? await relayServers(this.env) : null;
    try {
      ws.send(JSON.stringify({ type: "relay", iceServers }));
    } catch {}
  }

  toHost(message) {
    for (const host of this.hosts()) {
      try {
        host.send(JSON.stringify(message));
      } catch {}
    }
  }
}
