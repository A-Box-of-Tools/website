// The rendezvous for the site's direct browser connections: one server
// component, carrying introductions rather than the content they negotiate.
//
// It upgrades /ws/<code> to a WebSocket handled by one Durable Object per
// code word. The object stores nothing - its whole state is the sockets
// currently connected to it, so a room ceases to exist the moment the
// sharer's tab closes. All it does is forward small JSON blobs (WebRTC
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
import { DISCOVERY_SCOPE_HEADER, Discovery, discoveryScope, pageOrigin, rendezvousTool, roomName, validPublication, validScope } from "./discovery.js";
import { Broadcast } from "./broadcast.js";
import { Inbox } from "./inbox.js";
import { answerRelayRequest, relayEnabled, relayPolicy, relayServers } from "./relay.js";

export { Broadcast, Discovery, Inbox, relayServers };

function roomTransport(url) {
  const values = url.searchParams.getAll('transport');
  return values.length > 1 || values.length && !['direct', 'relay'].includes(values[0]) ? null : values[0] ?? 'direct';
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
      if (url.search) return new Response("unexpected parameters", { status: 400 });
      if (request.headers.get("Upgrade") !== "websocket") return new Response("expected a websocket", { status: 426 });
      if (!fromOurPage(request.headers.get("Origin"))) return new Response("not for this page", { status: 403 });
      const knock = await env.LIMIT.limit({ key: request.headers.get("CF-Connecting-IP") ?? "" });
      if (!knock.success) return new Response("too many connections from this address", { status: 429 });
      const scope = await discoveryScope(request, "walkie-talkie");
      const headers = new Headers(request.headers);
      headers.delete(DISCOVERY_SCOPE_HEADER);
      if (scope !== null) headers.set(DISCOVERY_SCOPE_HEADER, scope);
      return env.BROADCASTS.get(env.BROADCASTS.idFromName(broadcast[1])).fetch(new Request(request, { headers }));
    }
    const inbox = url.pathname.match(/^\/inbox\/([a-f0-9]{64})$/);
    if (inbox) {
      if (url.search) return new Response("unexpected parameters", { status: 400 });
      if (request.headers.get("Upgrade") !== "websocket") return new Response("expected a websocket", { status: 426 });
      if (!fromOurPage(request.headers.get("Origin"))) return new Response("not for this page", { status: 403 });
      const knock = await env.LIMIT.limit({ key: request.headers.get("CF-Connecting-IP") ?? "" });
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
      if (room && roomTransport(url) === null) return new Response("invalid transport", { status: 400 });
      if (room && ["voice-oncall", "walkie-talkie"].includes(tool)) return new Response("not found", { status: 404 });
      if (request.headers.get("Upgrade") !== "websocket") {
        return new Response("expected a websocket", { status: 426 });
      }
      if (!fromOurPage(request.headers.get("Origin"))) {
        return new Response("not for this page", { status: 403 });
      }
      const discover = url.pathname === "/discover";
      const offered = room && url.searchParams.get("role") === "host"
        && url.searchParams.get("local") === "1" && url.searchParams.get("discover") === "1";
      let scope = null;
      if (discover || offered) {
        scope = await discoveryScope(request, tool);
        if (discover && scope === null) return new Response("discovery unavailable for this address", { status: 403 });
      }
      // Keyed by address rather than by room: the nuisance this caps is one
      // client opening rooms by the thousand, and the room name is theirs to
      // vary. Counted per Cloudflare location, so it is a cap, not a wall.
      const knock = await env.LIMIT.limit({ key: request.headers.get("CF-Connecting-IP") ?? "" });
      if (!knock.success) {
        return new Response("too many connections from this address", { status: 429 });
      }
      // The page cannot choose its group, including through a header copied
      // into this binding-only request. Ordinary room clients need no group.
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

// One room. Sockets are tagged with their role - viewers also with a random
// id - so the object needs no fields of its own and hibernation has nothing
// to lose.
export class Room {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    // Keepalives are answered without waking the object.
    this.ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair("ping", "pong"));
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
        return host.readyState === 1 && who?.role === "host" && who.local === true && who.discover === true
          && who.code === claim.code && who.lease === claim.lease && who.scope === claim.scope
          && (who.tool ?? "share-text") === tool;
      });
      if (live?.deserializeAttachment()?.transport === 'relay') {
        return Response.json({ transport: 'relay' });
      }
      return new Response(null, { status: live ? 204 : 403 });
    }
    const code = url.pathname.match(/^\/ws\/([a-z0-9][a-z0-9-]{0,63})$/)?.[1];
    if (code === undefined) return new Response(null, { status: 404 });
    const role = url.searchParams.get("role");
    const tool = rendezvousTool(url.searchParams.get("tool"));
    if (tool === null) return new Response(null, { status: 400 });
    const transport = roomTransport(url);
    if (transport === null) return new Response(null, { status: 400 });
    const transportPinned = url.searchParams.has('transport');
    const scope = request.headers.get(DISCOVERY_SCOPE_HEADER);
    // Discovery can be unavailable behind a proxy or an address transform.
    // The local share still works through its copied link; it simply has no
    // lease to advertise unless the edge supplied a trustworthy scope.
    const offered = role === "host" && url.searchParams.get("local") === "1"
      && url.searchParams.get("discover") === "1" && validScope(scope);
    const { 0: client, 1: server } = new WebSocketPair();

    // A refused handshake reaches the browser as a bare error with nothing
    // attached, so rejections complete the upgrade and then close with a
    // 4xxx code the page can read.
    const refuse = (code, reason) => {
      // The one line this worker prints. A refusal completes the upgrade with
      // 101 exactly like an admission, so the invocation log cannot tell the
      // two apart; this can, and it carries the code alone - no name, no
      // address, nothing a person typed.
      console.log(JSON.stringify({ refused: code, reason }));
      server.accept();
      server.close(code, reason);
      return new Response(null, { status: 101, webSocket: client });
    };

    const hosts = this.ctx.getWebSockets("host");
    if (role === "host") {
      if (hosts.length > 0) return refuse(4409, "taken");
      if (transport === 'relay' && !relayEnabled(this.env, tool)) return refuse(4413, 'relay-unavailable');
      this.ctx.acceptWebSocket(server, ["host"]);
      const policy = { transport, transportPinned, generation: crypto.randomUUID() };
      if (offered) {
        const lease = crypto.randomUUID();
        server.serializeAttachment({ role: "host", code, scope, tool, local: true, discover: true, lease, ...policy });
        server.send(JSON.stringify({ type: "host-ready", ...(transport === 'relay' ? { transport } : {}), discovery: { code, lease, ...(tool === "share-text" ? {} : { tool }), ...(transport === 'relay' ? { transport } : {}) } }));
      } else {
        server.serializeAttachment({ role: "host", ...(tool === "share-text" ? {} : { tool }), local: url.searchParams.get('local') === '1', ...policy });
        if (transport === 'relay') server.send(JSON.stringify({ type: 'host-ready', transport }));
      }
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
      server.serializeAttachment({ role: "viewer", id, transport, generation: owner?.generation });
      this.toHost({ type: "join", id });
      server.send(JSON.stringify({ type: "ready", ...(transport === 'relay' ? { transport } : {}) }));
    } else {
      return refuse(4400, "bad-role");
    }
    return new Response(null, { status: 101, webSocket: client });
  }

  webSocketMessage(ws, message) {
    if (typeof message !== "string" || message.length > MAX_MESSAGE) return;
    let parsed;
    try {
      parsed = JSON.parse(message);
    } catch {
      return;
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return;
    const who = ws.deserializeAttachment();
    if (who === null) return;
    if (parsed.type === 'relay-request') {
      const host = this.ctx.getWebSockets('host')[0];
      const owner = host?.deserializeAttachment();
      const current = () => ws.deserializeAttachment()?.generation === who.generation
        && this.ctx.getWebSockets('host')[0] === host && host?.readyState === 1
        && host.deserializeAttachment()?.generation === owner?.generation;
      return answerRelayRequest(ws, parsed, { env: this.env, tool: owner?.tool ?? 'share-text', current,
        authorized: () => current() && who.transport === 'relay' && owner?.transport === 'relay'
          && (who.role === 'host' ? ws === host : who.role === 'viewer' && who.generation === owner.generation) });
    }
    if (who.role === "viewer") {
      if (parsed.relay === true) {
        const host = this.ctx.getWebSockets('host')[0]?.deserializeAttachment();
        // Cached text pages retain their old explicit fallback. A new Direct
        // host, a local share, or any other tool never grants that authority.
        if (!host || (host.tool ?? 'share-text') !== 'share-text' || host.transportPinned || host.local === true) return;
        // Once per socket: the flag lives in the attachment, so hibernation
        // cannot forget it and a page cannot mint credentials by the dozen.
        if (who.relayed) return;
        ws.serializeAttachment({ ...who, relayed: true });
        return this.relay(ws);
      }
      this.toHost({ type: "signal", from: who.id, data: parsed.data });
    } else if (typeof parsed.to === "string" && parsed.to.startsWith("v:")) {
      // The viewer's id doubles as its socket tag, so addressing a reply is
      // a lookup, not a scan.
      for (const peer of this.ctx.getWebSockets(parsed.to)) {
        peer.send(JSON.stringify({ type: "signal", data: parsed.data }));
      }
    }
  }

  webSocketClose(ws) {
    this.drop(ws);
  }

  webSocketError(ws) {
    this.drop(ws);
  }

  drop(ws) {
    const who = ws.deserializeAttachment();
    if (who === null) return;
    // Close and error can both fire for one socket; blank the attachment so
    // the second pass finds nothing to do.
    ws.serializeAttachment(null);
    if (who.role === "host") {
      if (who.discover === true && who.local === true && validScope(who.scope) && validPublication(who)) {
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
    } else {
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
    for (const host of this.ctx.getWebSockets("host")) {
      try {
        host.send(JSON.stringify(message));
      } catch {}
    }
  }
}
