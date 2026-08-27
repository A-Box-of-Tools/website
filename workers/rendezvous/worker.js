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
      return env.ROOMS.get(env.ROOMS.idFromName(room[1])).fetch(request);
    }
    return new Response("not found", { status: 404 });
  },
};

const MAX_VIEWERS = 16;
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
      const id = crypto.randomUUID();
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
    } else if (typeof parsed.to === "string") {
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
