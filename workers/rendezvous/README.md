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

from this directory, logged in to the site's Cloudflare account. The worker
answers at `rendezvous.abox.tools`, a custom domain that `wrangler.toml`
declares and the deploy creates in the zone - the DNS record and the
certificate both - so no dashboard step exists. It also still answers at
the `workers.dev` name it was born with, and should keep doing so: a page
cached before the switch dials the old name. The custom domain is not a
nicety. The whole `workers.dev` domain is blocked inside mainland China, and
a reader there saw the page load and then wait forever for an introduction,
while the site's own domain resolves fine. The tool page names the hostname
in its `connect-src` and in one constant in `tools/share-text/src/main.js`;
if the worker ever moves again, those are the two places that change.

This folder is invisible to `build.py` - the deploy is by hand, and rare,
because nearly every feature the tool has gained since the first version has
been page-side. The protocol here is a dumb switchboard, and the one thing
added to it since is the relay credential below.

### The relay's two secrets

A reader whose direct attempt failed may ask for a relay, and answering
takes a TURN key: in the Cloudflare dashboard, **Realtime → TURN**, create a
key, and hand its id and its token to the worker as secrets -

```
npx wrangler secret put TURN_KEY_ID
npx wrangler secret put TURN_KEY_TOKEN
```

Secrets rather than `[vars]` because the token is a bearer token, and a
deploy from this file must never carry it. Without them the worker answers
the ask with `iceServers: null`, and the page says no relay is available -
so the deploy and the key can land in either order. The first 1,000 GB a
month of relayed traffic are free, and relayed traffic is only ever the
pairs that could not connect directly.

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
- A viewer may send `{relay: true}` once, after its direct attempt has
  failed. The room mints an eight-hour credential for Cloudflare's TURN
  service and answers `{relay, iceServers}` on the same socket - the TURN
  entry alone, or `null` when no key is configured or Cloudflare declined,
  which the worker notes with one line carrying the status and nothing
  else. A second ask on the same socket is ignored; the flag rides the
  socket's attachment, so hibernation does not forget it. The relay forwards
  the DTLS-encrypted channel between the two browsers and holds no key to
  it, so the list of what can be seen above does not grow.
- When the host's socket drops, every viewer is closed with 4410
  "host-gone" - the instant, authoritative end-of-share signal, long before
  WebRTC's own ~30s consent expiry would notice.
- `ping` is answered `pong` by the runtime without waking the object.
