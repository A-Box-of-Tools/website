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
// borrowed, and neither reads anything. The one line it ever prints is the
// close code of a refusal.

// A browser sends Origin on every WebSocket handshake and a page cannot forge
// it, so checking it keeps the rendezvous from becoming free signalling for
// somebody else's site. A script can send any Origin it likes; the rate limit
// is for that. Local builds are served from localhost and need the live
// rendezvous to try the tool at all, so localhost is let in on any port.
const SITE = "https://abox.tools";

function fromOurPage(origin) {
  if (origin === SITE) return true;
  try {
    const host = new URL(origin).hostname;
    return host === "localhost" || host === "127.0.0.1";
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

const MAX_VIEWERS = 16;
// UTF-16 units, not bytes, so up to three times this on the wire: a bound on
// nonsense rather than a budget. A session description is a few kilobytes.
const MAX_MESSAGE = 64 * 1024;

// One room. Sockets are tagged with their role - viewers also with a random
// id - so the object needs no fields of its own and hibernation has nothing
// to lose.
export class Room {
  constructor(ctx) {
    this.ctx = ctx;
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

  toHost(message) {
    for (const host of this.ctx.getWebSockets("host")) {
      try {
        host.send(JSON.stringify(message));
      } catch {}
    }
  }
}
