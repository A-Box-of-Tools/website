// The rendezvous for /share-text/: the one server component anything on this
// site has, and deliberately the smallest one that could work.
//
// It upgrades /ws/<code> to a WebSocket handled by one Durable Object per
// code word. The object stores nothing - its whole state is the sockets
// currently connected to it, so a room ceases to exist the moment the
// sharer's tab closes. All it does is forward small JSON blobs (WebRTC
// session descriptions and ICE candidates) between the one host and each
// viewer, and those blobs are all it can ever see. The text and the files
// travel over the peer-to-peer channel those blobs negotiate, encrypted end
// to end, and no byte of them passes through here.
//
// Deployed by hand: `npx wrangler deploy` from this directory, logged in to
// the site's Cloudflare account. The free plan carries it - the object
// hibernates between messages and writes nothing to storage, so an idle
// room costs nothing at all.
//
// It answers only the site's own pages, and lets one address knock only so
// often. Both are the least that keeps a switchboard with no login from being
// borrowed, and neither reads anything. The lines it ever prints are the
// close code of a refusal and the status of a relay credential it could not
// mint.
//
// The one thing it does beyond forwarding: a viewer whose direct attempt has
// failed may ask, once, for a relay. The room then mints a short-lived
// credential for Cloudflare's TURN service and hands it back on the same
// socket. The relay forwards the DTLS-encrypted bytes between the two
// browsers and cannot read them - it holds no key - so what changes is the
// path, not what anyone can see. Two secrets make it possible, set with
// `npx wrangler secret put`: TURN_KEY_ID and TURN_KEY_TOKEN, from a TURN key
// made in the dashboard under Realtime. Without them the ask goes unanswered
// and the page says no relay is available, which is exactly what is true.

// A browser sends Origin on every WebSocket handshake and a page cannot forge
// it, so checking it keeps the rendezvous from becoming free signalling for
// somebody else's site. A script can send any Origin it likes; the rate limit
// is for that. Local builds are served from localhost and need the live
// rendezvous to try the tool at all, so localhost is let in on any port.
const SITE = "https://abox.tools";
// Every pull request is deployed to a preview of its own on Cloudflare Pages
// (see the `preview` job in .github/workflows/build.yml), at
// https://pr-<n>.abox-preview.pages.dev, and the QA suite is run against it -
// share-text included, which is the one tool that cannot work without this
// worker's say-so. The suffix is the project's, so no other Pages project on
// the same platform is let in by it.
const PREVIEWS = ".abox-preview.pages.dev";

function fromOurPage(origin) {
  if (origin === SITE) return true;
  try {
    const { protocol, hostname } = new URL(origin);
    if (hostname === "localhost" || hostname === "127.0.0.1") return true;
    return protocol === "https:" && hostname.endsWith(PREVIEWS);
  } catch {
    return false;
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/") {
      return new Response(
        "The rendezvous for abox.tools/share-text/. It introduces two "
        + "browsers to each other and never sees what they exchange.\n",
        { headers: { "content-type": "text/plain; charset=utf-8" } },
      );
    }
    const room = url.pathname.match(/^\/ws\/([a-z0-9][a-z0-9-]{0,63})$/);
    if (room) {
      if (request.headers.get("Upgrade") !== "websocket") {
        return new Response("expected a websocket", { status: 426 });
      }
      if (!fromOurPage(request.headers.get("Origin"))) {
        return new Response("not for this page", { status: 403 });
      }
      // Keyed by address rather than by room: the nuisance this caps is one
      // client opening rooms by the thousand, and the room name is theirs to
      // vary. Counted per Cloudflare location, so it is a cap, not a wall.
      const knock = await env.LIMIT.limit({ key: request.headers.get("CF-Connecting-IP") ?? "" });
      if (!knock.success) {
        return new Response("too many connections from this address", { status: 429 });
      }
      return env.ROOMS.get(env.ROOMS.idFromName(room[1])).fetch(request);
    }
    return new Response("not found", { status: 404 });
  },
};

// How long a relay credential stays good. It is checked when the relay
// allocation is made and each time it is refreshed, so a reader relayed for
// longer than this loses the connection at the next refresh; a working day
// covers the classroom and the long call, and bounds what a credential that
// leaked out of a page could be used for.
const RELAY_TTL = 8 * 60 * 60;
const RELAY_API = "https://rtc.live.cloudflare.com/v1/turn/keys/";

// The TURN entry a viewer redials with, or null when there is none to give:
// no key configured, or Cloudflare declined. Only the entry carrying a
// credential is returned - the page already knows the STUN servers, and a
// relay is the one thing it is asking for.
export async function relayServers(env, fetchImpl = fetch) {
  if (!env.TURN_KEY_ID || !env.TURN_KEY_TOKEN) return null;
  let res;
  try {
    res = await fetchImpl(`${RELAY_API}${env.TURN_KEY_ID}/credentials/generate-ice-servers`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.TURN_KEY_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ttl: RELAY_TTL }),
    });
  } catch {
    console.log(JSON.stringify({ relay: "unreachable" }));
    return null;
  }
  if (!res.ok) {
    console.log(JSON.stringify({ relay: res.status }));
    return null;
  }
  let body;
  try {
    body = await res.json();
  } catch {
    return null;
  }
  const servers = Array.isArray(body?.iceServers) ? body.iceServers : [];
  const turn = servers.filter((s) => typeof s?.username === "string" && typeof s?.credential === "string");
  return turn.length > 0 ? turn : null;
}

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

  fetch(request) {
    const role = new URL(request.url).searchParams.get("role");
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
      this.ctx.acceptWebSocket(server, ["host"]);
      server.serializeAttachment({ role: "host" });
    } else if (role === "viewer") {
      if (hosts.length === 0) return refuse(4404, "no-host");
      if (this.ctx.getWebSockets("viewer").length >= MAX_VIEWERS) return refuse(4429, "full");
      // Tags are one namespace - "host", "viewer" and every id - so an id is
      // prefixed to be unmistakable for a role, and a host's `to` is honoured
      // only in that shape. Without both, `to: "viewer"` would reach the room.
      const id = "v:" + crypto.randomUUID();
      this.ctx.acceptWebSocket(server, ["viewer", id]);
      server.serializeAttachment({ role: "viewer", id });
      this.toHost({ type: "join", id });
      server.send(JSON.stringify({ type: "ready" }));
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
    const who = ws.deserializeAttachment();
    if (who === null) return;
    if (who.role === "viewer") {
      if (parsed.relay === true) {
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
    const iceServers = await relayServers(this.env);
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
