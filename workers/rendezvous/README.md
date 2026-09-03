# The rendezvous

The one server component anything on this site has. `/share-text/` moves
text and files directly between two browsers over WebRTC, and a direct
connection needs an introduction: the two sides must exchange a few KB of
session descriptions before a channel can exist, and something has to carry
them and match "the person who typed `brave-otter-42`" with the other person
who typed it. This Worker is that something, and deliberately nothing more.

One Durable Object per code word, holding nothing but the open sockets - no
storage is ever written, so a room ceases to exist the moment its sharer
disconnects, and an idle deployment costs nothing at all. What it can see:
that a code word is in use, when peers come and go, their IP addresses, and
the negotiation blobs. What it cannot see: the text, the files, who was
admitted, or what anybody said - all of that travels the encrypted peer
channel, including the knock on a private share.

That is what it sees. What it stores is a shorter list, and no longer an
empty one: `observability.logs` in `wrangler.toml` asks Cloudflare to keep
its own record of every invocation for seven days, readable in the Workers
dashboard. That record is the request and its outcome - the URL, which
carries the code word and the role, and the metadata Cloudflare attaches to
it - and never a payload. The worker adds one line of its own, on a refusal,
because a refused handshake completes the upgrade exactly like an admission
and the record alone cannot tell them apart; the line carries the close code
and nothing else. It is a view of the switchboard working, not of anything
passing through it. Tracing is written off in the same file rather than left
to its default, so there is no second stream to account for.

## Deploy

```
npx wrangler deploy
```

from this directory, logged in to the site's Cloudflare account. The tool
page names this worker's hostname in its `connect-src` and in one constant
in `tools/share-text/src/main.js`; if the worker is ever renamed or moved to
a custom domain, those are the two places that change.

This folder is invisible to `build.py` - the deploy is by hand, and rare,
because every feature the tool has gained since the first version has been
page-side. The protocol here is a dumb switchboard and has not needed to
change.

## The protocol, in full

- The handshake is answered only for the site's own pages: the browser's
  `Origin` must be `https://abox.tools`, or localhost on any port for a build
  being tried on a developer's machine. Anything else is refused with 403
  before a room is touched. Origin is the one header a page cannot forge, so
  this stops another site borrowing the switchboard; it does not stop a
  script, which is what the next line is for.
- One address may open thirty sockets a minute, counted per Cloudflare
  location; the thirty-first is refused with 429. A host opens one socket
  and each reader one, so a person never comes near it.
- A host connects to `/ws/<code>?role=host`; a second host on a live code is
  refused with close code 4409.
- A viewer connects with `?role=viewer`; with no host present it is refused
  4404, past the room cap 4429. Otherwise the host learns `{join, id}` and
  the viewer gets `{ready}`. The id is opaque to the page and begins `v:`,
  so that it can never spell a role.
- Everything a viewer sends is wrapped as `{signal, from, data}` and handed
  to the host; everything the host sends with a `to` naming a viewer's id
  goes to that viewer, and a `to` in any other shape goes nowhere. The
  payloads are WebRTC offers, answers and ICE candidates; the switchboard
  does not read them.
- When the host's socket drops, every viewer is closed with 4410
  "host-gone" - the instant, authoritative end-of-share signal, long before
  WebRTC's own ~30s consent expiry would notice.
- `ping` is answered `pong` by the runtime without waking the object.
