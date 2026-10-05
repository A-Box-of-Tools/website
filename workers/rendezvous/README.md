# The rendezvous

The one server component anything on this site has. `/share-text/` moves
text and files directly between two browsers over WebRTC, and a direct
connection needs an introduction: the two sides must exchange a few KB of
session descriptions before a channel can exist, and something has to carry
them and match "the person who typed `brave-otter-42`" with the other person
who typed it. This Worker carries that introduction and lists opted-in local
link names, never the shared text or files.

One Room Durable Object per code word, plus a Discovery Durable Object per
public-address-and-origin group. No storage is ever written; the rooms and
directory entries live on open sockets, so a room ends when its sharer
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
been page-side. The protocol carries introductions, the relay credential
below and the local discovery directory.

### The discovery migration

The local discovery page needs this worker deployed; the static site build
cannot activate it. `wrangler.toml` adds the `DISCOVERY` binding for the
exported `Discovery` class and migration `v2` with
`new_sqlite_classes = ["Discovery"]`. Keep the original `v1` Room migration
and binding: existing share names must keep addressing the same rooms.
The normal `npx wrangler deploy` from this directory applies the new class
and binding. An older worker leaves discovery unavailable on the page while
the ordinary share link and its consent workflow continue to work.

### What local discovery means

Discovery groups browsers by the canonical Cloudflare public IPv4 address
or IPv6 /64 subnet, together with the normalized allowed origin, hashed
with SHA-256. IPv6 devices with different addresses inside one /64 share
the group. When Cloudflare's Pseudo IPv4 mode replaces the address with a
Class E marker, the group uses its preserved `CF-Connecting-IPv6` address;
an alternate header is ignored for ordinary source addresses. No client
parameter, header or message chooses a group. Discovery requests with an
unknown, reserved, invalid or missing address, `CF-Worker`, or Cloudflare's
shared Worker address are refused rather than grouped together. A local
host with an unsupported discovery scope can still open its room and share
by link; the room issues no discovery lease for that connection.

This is a finding aid, not a physical LAN guarantee. Browsers behind one
router commonly share the address, but a shared VPN or carrier-grade NAT
can include unrelated networks; mixed IPv4 and IPv6 connections or
different routes can hide nearby devices. The page explains the scope before listing or
advertising anything. Local shares advertise by default, with a switch for
link-only sharing. Names are visible to the group, so Private stays on by
default. Choosing a name opens consent; it does not initiate a peer
connection or override admission.

The directory contains only codes and `local: true`, never text, file names,
file sizes or file bytes. Its state is held in WebSocket attachments while
the sockets are open, with no directory records written to Durable Object
storage. Cloudflare's seven-day connection logging is unchanged; leases are
message payloads and never put in URLs or logged by the worker.

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
  location; the thirty-first is refused with 429. The start page opens a
  discovery socket and a host adds one room socket; each reader opens one
  introduction socket.
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

## The discovery protocol

- The start page opens `/discover` with a WebSocket upgrade, scoped by the
  worker as described above. A directory group permits 64 observer sockets
  and 32 listed share codes. Snapshots contain `{code, local: true}` entries
  and no addresses or content metadata.
- A local host that wants listing opens
  `/ws/<code>?role=host&local=1&discover=1`. Its room issues a random lease
  in `{type: "host-ready", discovery: {code, lease}}`. Ordinary hosts keep
  their existing protocol and are never listed.
- An observer publishes `{publish: {code, lease}}`. Discovery calls the
  room through its private binding at `POST /_discovery/check` with
  `{code, lease, scope}`. A 204 confirms that the matching local,
  discoverable host is still connected; anything else refuses publication.
  The lease is not accepted as authority without that live room check.
- `{publish: null}` withdraws the observer's listing. Closing the observer
  also removes it. When the actual room host disconnects, the room calls
  Discovery through its private binding at `POST /_discovery/withdraw` with
  `{code, lease}`. That cancels matching pending or verified listings and
  broadcasts the change; an earlier host's lease cannot remove a newer one.
- `{refresh: true}` revalidates the listed rooms' leases and broadcasts a
  fresh snapshot, so refreshing cannot preserve a vanished host's listing.
- Incoming discovery messages are limited to 512 UTF-16 code units and an
  observer may send 120 publication, withdrawal or refresh updates per
  connection.
  The usual origin checks, address connection limit and automatic ping/pong
  responses also apply. The page does not send text or files to this socket.
