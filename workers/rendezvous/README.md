# The rendezvous

The one server component anything on this site has. `/share-text/`, `/share-tab/`,
`/remote-camera/`, `/walkie-talkie/`, and `/voice-oncall/` connect browsers over WebRTC.
Direct is the default. An explicit Cloud relay option routes encrypted peer
traffic through Cloudflare TURN, using short-lived credentials from this Worker.
Text and files, tab video, camera frames, and voice stay on the peer connection. A direct
connection needs an introduction: the two sides must exchange a few KB of
session descriptions before a channel can exist, and something has to carry
them and match "the person who typed `brave-otter-42`" with the other person
who typed it. This Worker carries that introduction and lists opted-in
connections in either the network directory or a private code group, never
the shared text or files.

One Room Durable Object per text/camera tool and code word, a Discovery Durable
Object per tool, origin and network or private group, and separate Broadcast and
Inbox Durable Objects per voice invitation. No application storage is ever written;
room authority and directory entries live in socket attachments. Text/camera
rooms end when their sharer disconnects, though a host whose connection was lost
rather than closed leaves its digest in the object's memory for two minutes, as
described under the protocol below. Voice listeners can remain parked
while their host reconnects; their room disappears when its last socket leaves.
What it can see: that an invitation or code word is in use, when peers come
and go, their IP addresses, and negotiation metadata. The voice object also
validates anonymous capabilities and handles talking status. Voice Oncall also
carries room and participant names, password-derived admission credentials,
and individual moderation, never microphone audio.
An explicitly discoverable Walkie-Talkie broadcast adds its room name and
listener capability to the nearby directory. That capability admits listeners;
the separate host capability never enters the directory.
What it cannot see: shared text or files, camera frames, or voice. Those
travel the encrypted peer connection. Text/camera admission decisions,
including the knock on a private share, also stay on that peer channel.

That is what it sees. What it stores is a shorter list, and no longer an
empty one: `observability.logs` in `wrangler.toml` asks Cloudflare to keep
its own record of every invocation for seven days, readable in the Workers
dashboard. That record is the request and its outcome - the URL, which for
text/camera carries the code word, role and a host's opaque digest, and the metadata Cloudflare attaches to
it - and never a payload. Voice URLs carry an opaque digest of the host secret;
both voice capabilities enter the first WSS message, never the URL. The worker
adds one line of its own on a text/camera refusal,
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
while the site's own domain resolves fine. The connected tool pages name the
hostname in their `connect-src` and client endpoint. If the worker moves again,
update every connected tool's declarations.

This folder is invisible to `build.py` - the deploy is by hand, and rare,
because nearly every feature the tool has gained since the first version has
been page-side. The protocol carries introductions, the relay credential
below and the local discovery directory.

Both voice tools use the same origin check and address connection limit, with
nearby discovery under separate namespaces. The voice signaling services never carry audio.
Direct configures no STUN or TURN; Cloud relay forces TURN candidates and does
not silently fall back to Direct. Host-only ICE candidates can
include globally routable interface addresses, especially IPv6: a candidate
type describes how an address was obtained, not a physical LAN boundary.

### Development worker

`env.dev` in `wrangler.toml` deploys a separate Worker named `rendezvous-dev`,
with the custom domain `rendezvous-dev.abox.tools` and its own `workers.dev`
address. Its explicit route list contains only the development hostname;
it must never inherit or include the production `rendezvous.abox.tools` route.
The top-level configuration remains the production deployment.

From this directory, using Wrangler 4.36 or later:

```
npx wrangler deploy --env dev --dry-run
npx wrangler deploy --env dev
```

The first command checks and bundles the development configuration without
deploying it. The second creates or updates only the development Worker and
its configured custom domain. Future worker changes can be tried there before
a separately requested production deployment. The static Pages preview
workflow does not deploy either Worker.

Repeat all four Durable Object bindings under `env.dev`, without a
`script_name` pointing at production. Cloudflare binds those classes to the
development Worker, giving rooms, discovery, voice objects, socket state and
any future storage separate namespaces. The existing `v1` through `v4`
migration history is inherited and creates the same classes in that separate
Worker. Do not copy production namespace identifiers into the environment.
The `LIMIT` binding uses namespace `1002`, while production uses `1001`, so
development requests do not consume the production address counter.
The existing logging policy is inherited: invocation metadata logs are on,
traces are off, and no message payload is added to logs.

The paired tools' shared endpoint selector uses this development hostname
on localhost and recognized `abox-preview.pages.dev` preview hosts. Production
pages continue to use `rendezvous.abox.tools`. Discovery and room sockets must
use the same selection; a failed development connection must not fall back to
production. Each tool's CSP names both permitted hosts. Choosing a different
endpoint through a page query parameter is not supported.

Deployment needs an authenticated Wrangler session or an API token permitted
to create the development Worker and attach its custom domain in the
`abox.tools` zone. A Pages-only upload token is insufficient. Cloudflare's
current permissions distinguish creating a Worker from updating one; custom
domain changes also need the affected zone's Workers Routes write authority.
Keep account credentials outside this repository.

Worker secrets are environment-specific and are not copied from production.
The development instance can pair directly without TURN secrets. Testing any
tool's explicit Cloud relay option requires separately configured development secrets,
using `wrangler secret put <name> --env dev`; never export production secrets
into a checked-in file to populate the environment.

Cloudflare documents [environment inheritance](https://developers.cloudflare.com/workers/wrangler/configuration/#environments),
[separate Durable Object environments](https://developers.cloudflare.com/durable-objects/reference/environments/),
[account-wide rate-limit namespace counters](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/),
and [deployment permissions](https://developers.cloudflare.com/workers/authorization/workers/).

### The browser-tab namespace

Share a Browser Tab uses the existing room protocol with `tool=share-tab` on
both host and viewer URLs. `rendezvousTool()` must recognise that value before
the static tool is published. Its `share-tab:<code>` room names stay separate
from text and camera rooms, even if a caller supplies the same code. An older
worker refuses the unknown namespace; the page must not retry in a text room.

Deploy this allowlist update manually from this directory before publishing
the static page. It adds no class, binding, migration, storage or secret.
The page uses the same verified nearby listing and online signaling as Camera.
Direct uses host-only ICE without public STUN or TURN; Cloud relay requests
credentials through the shared protocol below. Approval and acknowledgement stay
on the encrypted control channel; the worker carries neither them nor video.

### The host digest

Text, camera and tab hosts now name a digest and prove it when replacing their own
stale socket; the protocol below says how. It adds no class, binding, migration,
secret or storage. Deploy this worker first, as usual, though either order works:
an older worker ignores the `holder` parameter and never asks for proof, and a
cached page names no digest and goes on hosting first come. Until the pages that
send a digest are live, the worker can protect nobody's name.

### The discovery migration

The local discovery page needs this worker deployed; the static site build
cannot activate it. `wrangler.toml` adds the `DISCOVERY` binding for the
exported `Discovery` class and migration `v2` with
`new_sqlite_classes = ["Discovery"]`. Keep the original `v1` Room migration
and binding: existing share names must keep addressing the same rooms.
The normal `npx wrangler deploy` from this directory applies the new class
and binding. An older worker leaves discovery unavailable on the page while
the ordinary share link and its consent workflow continue to work.

### Private discovery groups

Private groups use the existing Discovery binding and require no new
migration, secret, storage or TURN application. Deploy the Worker update
before the corresponding pages, first to development. An older Worker does
not provide an authenticated private directory; updated pages must refuse
its legacy network snapshot rather than publish to that directory.

The shared `shared/js/discovery-group.js` protocol generates 26 independently
random base32 symbols (130 bits), displayed with hyphens. The canonical code
is uppercase with display separators removed. A SHA-256 digest of
`abox.tools/private-discovery/v1\n` followed by that code is its public
identifier. Only this 64-character lowercase hexadecimal identifier enters
the `group` query parameter on room, voice and discovery requests. The
private code never enters a URL, invitation, report or application log.

The public identifier is not permission to read the group. A private
discovery socket starts silent and accepts exactly one initial JSON frame,
`{group: canonicalCode}`. It checks the derived identifier against the URL
before sending any list or accepting a publication or refresh. Its first
accepted `shares` snapshot carries `group: publicIdentifier`; the page
checks that identifier and tool before publishing. Socket attachments keep
only the identifier, scope and authentication result, never the code. The
Worker necessarily receives the code transiently inside encrypted WSS to
check membership; invocation metadata logging records no message payloads.

A group scope hashes the page origin, tool namespace and public identifier,
with a separate domain from the unchanged network scope. Different public
addresses therefore share one private directory, while other groups,
origins, tools and network directories stay separate. The Worker strips
caller-supplied internal scope headers. A live host binds its lease to
exactly one derived scope, so knowing a lease cannot republish that host in
another group or the network list. Group discovery does not alter the host's
Direct or Cloud relay policy, password checks, approval or media path.
Share Text's ordinary Direct mode can advertise in a private group without
enabling its separate local-only checkbox. That exception still requires an
authenticated private directory and live matching host lease; its listing
carries the host's actual `local: false` policy. Network discovery keeps its
existing local-only requirement, and the other tools retain their local flag.

Malformed and duplicate group parameters fail before a room is forwarded.
Malformed, wrong or repeated proof frames close the discovery socket rather
than fall back to network discovery. Pending proofs expire after eight
seconds, checked on the next request or message without a periodic alarm. A
directory holds four per IPv4 address or IPv6 /64, recognised by a digest salted
with the directory's scope that is dropped once the socket proves itself, and at
32 in all the longest-waiting closes with 4429 `full`, rather than the newcomer
being refused. The public identifier can be read from any URL that carries it,
so holding it buys a place in that queue and nothing more: a pending socket
never receives directory broadcasts, takes none of the 64 seats described under
the protocol below, and cannot cost a member theirs. The existing 32-entry cap,
update limits, live-lease verification, refresh checks and authoritative host
withdrawals also apply to private groups, including stale asynchronous checks
after Stop or disconnect.

### The voice migration

Website-native Walkie-talkie needs this worker deployed before its updated
static page. `wrangler.toml` adds `BROADCASTS`, the exported `Broadcast` class,
and migration `v3` with `new_sqlite_classes = ["Broadcast"]`. Keep `v1`, `v2`,
`ROOMS`, and `DISCOVERY` unchanged: the new voice namespace must not reinterpret
an existing text or camera room. The usual manual deploy applies the new
binding and class. There are no new secrets, relay keys, or storage records to
configure. An older worker has no `/broadcast/` route, so the page cannot pair
until that deployment has happened.

Walkie-Talkie nearby listing also requires this worker update before its static
page, using the existing `BROADCASTS` and `DISCOVERY` bindings without a new
migration. Older host authentication frames retain their exact protocol and
remain link-only; they cannot accidentally expose a listener invitation.

### The Voice Oncall migration

Voice Oncall requires `INBOXES`, the exported `Inbox` class and migration `v4`
with `new_sqlite_classes = ["Inbox"]`. Deploy the worker before its static page.
Keep the earlier bindings and migrations unchanged. `/inbox/<64hex>` has the
same origin and connection-rate gates as `/broadcast/`, and its capabilities
enter the first secure message rather than its URL. Discovery uses
`tool=voice-oncall`; its private lease check asks `INBOXES` for trusted name and
password-required metadata before publishing either. No new service secret or
application storage is required.

### What local discovery means

Remote Camera uses `tool=remote-camera` on room and discovery URLs. An omitted
tool or `tool=share-text` preserves the existing text room identifiers and
discovery hash input; unknown tools are refused. Camera room identifiers and
discovery scopes are separate, so the same custom name can belong to both
tools without mixing introductions or listings. Camera host leases and
snapshots carry a tool marker. The camera page requires that acknowledgement
before publishing or displaying names; an older deployment therefore leaves
camera discovery unavailable while direct links still work. Deploy this worker
before the updated static page. Camera tabs opened before the namespace change
must reload; bookmarked viewer links retain their names.

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

Text/camera directory entries contain codes, `local: true`, and an optional
server-verified `transport: "relay"` marker, never text,
file names, file sizes or file bytes. Voice Oncall entries additionally contain
a bounded room name and password-required flag, verified against the live host's
lease. Walkie-Talkie entries contain a bounded room name and listener capability,
verified against the live host's listener hash and current discovery lease.
Publishing that capability lets browsers in the group request admission without
a separate invitation. Voice listings also carry the live host's optional
`approval` boolean; knowing the invitation does not bypass required approval.
Directory state is held in WebSocket attachments while
the sockets are open, with no directory records written to Durable Object
storage. Cloudflare's seven-day connection logging is unchanged; leases are
message payloads and never put in URLs or logged by the worker.
Voice listings may carry the same verified transport marker. An absent marker
means Direct. A publisher cannot override the mode obtained from its live host.

### The relay's two secrets

Each explicitly selected Cloud relay session needs a TURN key: in the
Cloudflare dashboard, **Realtime → TURN**, create a
key, and hand its id and its token to the worker as secrets -

```
npx wrangler secret put TURN_KEY_ID
npx wrangler secret put TURN_KEY_TOKEN
```

Secrets rather than `[vars]` because the token is a bearer token, and a
deploy from this file must never carry it. Without them the worker answers
`error: "unavailable"`, and the page explains that Cloud relay is unavailable.
The browser never receives the long-lived API token. TURN credentials stay in
memory and renew before expiry; they are not put in links, discovery or logs.

`RELAY_TOOLS` is a comma-separated allowlist of the five tool slugs; an empty
value disables new relay sessions. Both deployment environments explicitly set
it. `RELAY_MAX_PEERS` caps simultaneous peers (default 10, maximum 16; voice
also retains its ten-peer cap). `RELAY_MAX_SESSION_SECONDS` bounds a socket's
credential session (default eight hours, allowed five minutes to one day).
`RELAY_MAX_CREDENTIALS` bounds issuance attempts per socket (default 12, maximum
48). Requests are limited to one per minute. Limits survive hibernation in
socket attachments; closing and opening a new socket starts another credential
session. Invalid limits fail closed. Credentials normally last one hour and
are shortened near the session deadline. End/Stop prevents pending credentials
from being delivered but does not revoke credentials already issued by TURN.

These controls bound admission and issuance, not total traffic or account
spending. Cloudflare currently lists TURN at $0.05 per outbound GB; consult its
[current TURN pricing](https://developers.cloudflare.com/realtime/turn/) and
account usage before enabling it. This implementation does not enforce a byte
quota or a global spending cap. Renewing credentials never changes the chosen
transport, host approval, password or microphone consent.

## The protocol, in full

- The handshake is answered only for the site's own pages: the browser's
  `Origin` must be `https://abox.tools`, `https://<anything>.abox-preview.pages.dev`
  for a pull request's preview, or `localhost` or `127.0.0.1` on any port, over
  HTTP or HTTPS, for a build being tried on a developer's machine. Anything else
  is refused with 403 before a room is touched. Origin is the one header a page
  cannot forge, so this stops another site borrowing the switchboard; it does not
  stop a script, which is what the next line is for.
- One IPv4 address or IPv6 /64 may open thirty sockets a minute, counted per
  Cloudflare location; the thirty-first is refused with 429. A /64 counts as one
  because a single customer can choose any address inside it. The start page
  opens a discovery socket and a host adds one room socket; each reader opens one
  introduction socket.
- Each socket may send 120 frames per rolling ten seconds, counted before the
  frame is parsed, so malformed and empty ones spend the same allowance. The next
  closes the socket with 4429 `busy`. A host may send that many per connected
  viewer, because every reader negotiates through its one socket. This bounds one
  socket's rate, not an address's total: at the limit a socket is still worth
  about 52,000 of the free plan's 100,000 daily requests, and opening more sockets
  multiplies that. `ping` is answered by the runtime and is not counted.
- A host connects to `/ws/<code>?role=host&transport=direct` or `transport=relay`;
  its mode is pinned for that generation. Current pages add `holder=<digest>`, the
  lowercase hex SHA-256 of a random 43-character key that stays in the page. A
  second host on a live code is refused with close code 4409, unless it names the
  same digest. Then it gets `{type: "host-prove"}` and sends
  `{type: "host-proof", key}`; the digest alone can be read from a log, so only the
  key replaces the existing socket, which is closed 4409 "replaced". Its viewers
  get 4410 as they would have had it closed first. A wrong key closes with 4409 and
  silence closes with 4408 after eight seconds. Cached pages name no digest, keep
  first-come hosting, and can neither displace a holder nor be displaced by one.
- A voice room can recognise its host after every socket has gone because its code
  is the digest. A text or camera room is named by people, so when a host naming a
  digest loses its connection without a close frame, the object keeps that digest in
  memory for two minutes and refuses anyone else 4409 while its retry is on the way.
  A clean close (Stop, navigation, a closed tab) frees the name at once. This is
  deliberately memory, never storage: eviction forgets it and the name reverts to
  first come. A script polling every few seconds keeps the object awake and so
  cannot outrun it; one polling more slowly can still win a name whose host stays
  away longer than the object stays in memory, which can be as little as ten seconds
  idle. Closing that entirely would mean writing rooms to storage.
- A viewer connects with `?role=viewer` and the matching `transport`; with no host present it is refused
  4404, past the room cap 4429. Otherwise the viewer gets `{ready}` and the host
  hears nothing: a reader's page opens this socket to ask whether anyone is
  sharing, before its visitor has agreed to connect. The host first learns of a
  reader from its first signal, and only a reader who has sent one produces a
  `{leave, id}` when it goes. The id is opaque to the page and begins `v:`, so
  that it can never spell a role.
  Mismatched transport closes with 4412; a disabled relay service closes with
  4413. Duplicate or unknown transport query values are refused. Omitted mode
  means Direct for old clients; new clients always send an explicit mode.
- Everything a viewer sends is wrapped as `{signal, from, data}` and handed
  to the host; everything the host sends with a `to` naming a viewer's id
  goes to that viewer, and a `to` in any other shape goes nowhere. The
  payloads are WebRTC offers, answers and ICE candidates; the switchboard
  does not read them.
- A live matching Cloud relay host or viewer sends
  `{type: "relay-request", id}`. The Worker answers
  `{type: "relay-credentials", id, iceServers, issuedAt, expiresAt}` or an `error` of
  `forbidden`, `limited`, or `unavailable`. This request is consumed rather than
  forwarded. Authorization is checked again after the credential service
  returns, so a stopped or replaced session cannot receive late credentials.
  New Direct rooms cannot obtain them. Cached non-local Share Text pages retain
  the old viewer-only `{relay: true}` request once per socket only when their
  host did not pin a transport. Other tools and local text shares refuse it.
- When the host's socket drops, every viewer is closed with 4410
  "host-gone" - the instant, authoritative end-of-share signal, long before
  WebRTC's own ~30s consent expiry would notice.
- `ping` is answered `pong` by the runtime without waking the object.

## The discovery protocol

- The start page opens `/discover` with a WebSocket upgrade, scoped by the
  worker as described above. A directory seats 64 observers and lists 32 share
  codes. Snapshots contain `{code, local: true}` entries and no addresses. Voice
  namespaces additionally carry the verified room metadata described below.
- A full directory still seats a newcomer, after its proof if the directory is
  private. The observer seated longest closes with 4429 `full`, and its page
  retries in thirty seconds as it does after any lost socket. An observer holding
  a listing keeps its seat, one per listed code, so listings can occupy at most
  half of them. The next section says why.
- A local host that wants listing opens
  `/ws/<code>?role=host&local=1&discover=1`. Its room issues a random lease
  in `{type: "host-ready", discovery: {code, lease}}`. Ordinary hosts keep
  their existing protocol and are never listed.
- An observer publishes `{publish: {code, lease}}`. Discovery calls the
  room through its private binding at `POST /_discovery/check` with
  `{code, lease, scope}`. A 204 confirms that the matching local,
  discoverable Direct host is still connected; a relay host returns 200 with
  the single field `{transport: "relay"}`. Other responses refuse publication.
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
  connection, and 120 frames of any kind, valid or not, per rolling ten seconds.
  The usual origin checks, address connection limit and automatic ping/pong
  responses also apply. The page does not send text or files to this socket.

### Who can fill a directory

A network directory is reachable by anyone sharing its address, which behind a
carrier-grade NAT or a VPN includes strangers. Every socket in it has that address
by construction, so the per-address allowance that protects pending proofs could
tell none of them apart. Refusing newcomers at 64 would let any one of them keep
the directory for nothing: 64 idle sockets take about two minutes at the
connection limit and then cost only a keepalive, and a host arriving after them
could not list. So seats turn over instead, even though an observer is a
long-lived page and the one given up is usually an honest one. That page loses
its list for one retry, and keeping the directory from anybody now costs the
address's own thirty sockets a minute for as long as it goes on. Giving up the
newest would leave the first 63 seated for good.

A private directory's seats take the code, so only a member can fill them, and a
group whose member misbehaves can make a new code. They turn over the same way.

This keeps a directory open. It does not make anybody on an address safe from
anybody else on it. Someone sharing the address can still spend its thirty sockets
a minute, which refuses every socket from it, rooms included, for as long as they
keep that up. They can also fill the 32 listings with live rooms of their own, at
two sockets each and free once open, which stops anyone else being listed. Nothing
takes a listing away, because that would hand the same script every honest one. A
share link and a private group do not pass through that directory.

## The voice protocol

The page generates separate random 32-byte host and listener capabilities,
each encoded as 43 URL-safe characters. Its room code is the lowercase hex
SHA-256 digest of the host capability's UTF-8 text. That derivation lets a host
authenticate a resumed room even after every socket has disappeared; no saved
room record or server signing key is needed. The listener invitation carries
the listener capability in the page URL fragment. Request URLs carry only
`/broadcast/<64 lowercase hex characters>`, with no query parameters for
network discovery or only `group=<public identifier>` for a private group.

- The new route uses the existing allowed origins and thirty-connections-per-
  address-per-minute limit. It addresses only `BROADCASTS`, never `ROOMS` or
  `DISCOVERY`. A refused upgrade still uses the ordinary 403, 426, or 429 gates.
- The legacy first frame is `{type: "auth", role: "host", key, listenKey}` or
  `{type: "auth", role: "listener", key}`. Host authority requires the digest
  of `key` to equal the path's code. Socket attachments retain hashes, roles,
  random listener ids, generations, connection ids, and bounded bookkeeping;
  they retain no raw capabilities, SDP, candidates, or audio.
  New frames also carry `transport: "direct"` or `"relay"`. Host policy and
  verified waiting peers pin that choice; mismatched peers are refused after
  capability validation. Ready frames repeat the authoritative mode. The
  shared credential request above is authorized only for the live current
  relay generation and is never forwarded as voice signaling.
- A host explicitly offering nearby listening instead sends the exact frame
  `{type: "auth", role: "host", key, listenKey, roomName, discover: true}`.
  Its capabilities must differ; its trimmed room name must contain 1–80
  characters, with control characters and malformed Unicode rejected. Only
  this frame opts into discovery. The Worker derives the selected scope and
  strips any caller-supplied scope header before forwarding the connection.
  Unsupported network scopes still permit ordinary invitation-based use;
  a malformed private-group parameter is refused without a network fallback.
  A discoverable host's attachment additionally retains its trusted name,
  scope and random lease, never the raw listener capability.
- A listener arriving before the first host can wait, but its capability is
  unverified and cannot establish authority for other listeners. A genuine
  host validates those waiting hashes and removes mismatches. After a host
  disconnects, previously authenticated listener attachments anchor the
  listener hash, so new invited listeners can join the waiting group.
- The host receives `{type: "host-ready", generation}` first. A matching
  listener receives `{type: "ready", id, generation, talking}` before the
  host receives `{type: "join", id, generation}`. Both ids and generations
  are UUIDs generated by the worker. A repeated check for the current
  generation sends `ready` again without a second `join`.
- The opted-in host-ready frame additionally carries
  `discovery: {code, lease, tool: "walkie-talkie"}`, or `discovery: null` when
  its network scope is unavailable. The page publishes `{publish: {code,
  lease, listenKey}}` on `/discover?tool=walkie-talkie`. Through `BROADCASTS`,
  the directory privately checks the listener capability's hash and the live,
  unended host's current lease and scope, then obtains `{name, listenKey}`.
  The check reads host authority again after hashing, so a concurrent End,
  disconnect or replacement cannot revive an old listing. Public snapshots
  whitelist `{code, local: true, name, listenKey}` and never expose the host
  capability, hashes, lease or scope. End, disconnect, replacement and failed
  sends withdraw the matching lease; refresh rechecks authority and metadata.
- The host sends `offer` or `candidate` frames with `to`, `generation`,
  `connection`, and either `sdp` or `candidate`. A listener sends `answer` or
  `candidate` with the same fields except `to`. The worker derives `from` and
  `to` from authenticated sockets: host-to-listener frames name `from: "host"`,
  and listener-to-host frames name `to: "host"`. A client cannot choose its
  sender or address another listener. Only an offer selects the connection
  UUID against which its listener's replies are checked; early or late host
  candidates cannot overwrite that selection.
- SDP is bounded ASCII with one encrypted audio media section. Direct ICE accepts
  syntactically valid IPv4, IPv6, or mDNS interface addresses with `typ host`;
  Cloud relay accepts only `typ relay`. `srflx`, `prflx`, data-channel offers,
  arbitrary envelopes and binary messages are not forwarded. A room
  does not relay or record media.
- An authenticated host can publish `{type: "status", generation, talking}`
  with a boolean `talking`. Listeners receive the same bounded status frame.
  `{type: "end", generation}` notifies connected listeners with `ended`,
  and their live attachments preserve that state for subsequent checks.
  Nothing preserves an ended history after the final socket has left.
- A host socket disappearing sends `waiting` and keeps listener sockets open.
  A waiting page sends `{type: "check"}` once a second; the worker replies
  `waiting`, `ready`, or `ended`. A host returning with the same capability
  receives a fresh generation and reintroduces valid listeners. A replacement
  host retires the prior host with `replaced` and close code 4409, so a late
  old-host callback cannot disturb the new generation.
- `{type: "leave"}` removes that listener and closes its socket normally.
  A current host receives `{type: "leave", id, generation}`. Socket close,
  error, and failed sends perform the same cleanup without duplicate events.
- A room permits ten listener sockets, including waiting ones, and four
  pending handshakes per IPv4 address or IPv6 /64, recognised by a digest salted
  with the room's code that is dropped once the socket authenticates. Another
  address is unaffected, so silent sockets cannot lock a host out of its own room.
  At 32 pending in all the longest-waiting closes with 4429 `full`, rather than
  the newcomer being refused. Silent pending authentication expires after eight
  seconds, checked at the next request or message without a periodic alarm.
  Frames are limited to 64 Ki UTF-16 units, SDP to 32 Ki, and ICE strings to
  4096 characters. Each socket may send 120 updates per ten-second window.
- Refusals use `{type: "error", error}` and close codes: 4400 `invalid`,
  4403 `unauthorized`, 4408 `timeout`, or 4429 `full`/`busy`. Invalid or stale
  negotiation frames receive recoverable `invalid`/`stale` error frames.
  `ping` still receives `pong` through the hibernation auto-response.

Internet access is needed for introductions and signaling recovery. Already
working direct media does not pass through this service, and a signaling
outage need not tear it down. Wi-Fi isolation, firewalls, VPNs, and browser
policies can still prevent a direct connection. In Direct, the absence of STUN/TURN and
the use of host-only candidates do not prove that two devices share a physical
LAN, and neither the worker nor the page claims that proof.

## The Voice Oncall protocol

The Inbox transport reverses the voice media directions. The host creates
receive-only offers, and each participant answers send-only audio. Participants
never receive other participants' audio. Setup uses flat audio SDP and host ICE
frames with authoritative participant, generation and connection identifiers,
as in Broadcast. Direct never switches to Cloud relay automatically; both
parties must select the host's mode, with credentials subject to the same
live-admission checks and bounded issuance as Broadcast.

Both voice protocols share `voice-approval.js`. New host authentication includes
an explicit `approval` boolean, repeated by `host-ready` and verified discovery
metadata. The page refuses a missing or different acknowledgement, so an older
Worker cannot silently ignore this policy. Deploy the Worker before the pages;
this change needs no migration or secret. A live room and its reconnect anchors
pin the policy alongside its transport. Legacy hosts omitting the field retain
their approval-free behavior only in rooms with that same policy.

Credential validation precedes approval. A valid new visitor receives
`approval-pending` with its id, generation, transport and approval policy; the
host receives `request` with id, generation and an optional visitor name. The
host sends `approve` or `deny` with `to` and the current generation. Approval
resolves the request and releases the ordinary `ready`/`join` exchange. Denial
sends terminal `denied`; leaving or losing the requesting socket resolves its
request. A pending visitor cannot mint relay credentials, send status, or
exchange offers, answers or candidates, including through a forged envelope.
Voice Oncall also waits for `ready` before requesting its caller's microphone.

Approvals remember at most ten 128-bit identity digest prefixes for the host
session in socket attachments. Voice Oncall uses the caller's existing separate
key. Walkie-Talkie adds a per-listener `clientKey` to authentication; it is
generated and retained by that browser, never copied from the shared invitation
capability. A browser keeps this personal key when explicitly leaving, so it
can rejoin the same host session without another approval. Neither a name,
invitation nor network address identifies an approved participant.

Leaving or losing a socket does not revoke approval, and a full roster never
evicts an earlier grant. The limit is ten approved identities per host session,
including those currently disconnected. Size or capacity failure returns
`request-error` without admitting the requester. A successful Voice Oncall
kick revokes that identity's grant and frees its approval slot while retaining
the separate session block; an unsuccessful moderation change changes neither.
A denied or new identity needs approval. End clears grants from the host and
every reconnect anchor, and remains terminal while any room anchor remains.
Nothing persists after the last socket leaves. Starting the same pager again
after End requires fresh approval.

Audio direction follows [SDP's session and media scopes](https://www.rfc-editor.org/rfc/rfc8866.html#section-6.7):
an audio-section direction overrides the session default. This permits a browser
to include a session-level `sendrecv` default alongside its audio `recvonly`
offer or `sendonly` answer. The effective direction must still match the role,
and duplicate direction attributes within either scope are rejected. The worker
forwards the accepted SDP unchanged and still allows only one audio section.

- `/inbox/<64hex>` addresses only `INBOXES`. The code is SHA-256 of a random
  43-character host capability, whose digest must match before host admission.
- The first frame is host `auth` with `key`, `roomName`, `passwordProof` (null
  when unset), or sender `auth` with its separate stable random `key`, optional
  `name` and `passwordProof`. The browser derives the proof with
  PBKDF2 SHA-256, 120,000 iterations, 32 output bytes and the room-specific
  salt `voice-inbox:<code>`. It is an access credential sent inside WSS, not
  plain password text or an invitation query parameter. The Inbox stores its
  digest and rejects a mismatch before forwarding any voice setup.
- A sender's public identity is SHA-256 of its retained capability. Reconnection
  therefore keeps moderation attached to the same session. A new browser
  identity is a new session; this is not an account or permanent person ban.
- A host's `moderate` command sets a participant's mute state. The worker
  reports it to both sides; the normal sender stops transmission. The host
  additionally silences its own per-stream gain, which remains the authority
  when a sender ignores the message. `kick` removes the peer and records the
  session block. Generation checks prevent stale host commands taking effect.
- Socket attachments carry a compact, bounded moderation history without
  storage writes. Unmute can free a mute-only entry. When that history is full,
  `moderation-full` leaves the room active and reports that further remembered
  moderation was refused. Ending the room and creating another resets history.
- Host-ready includes a private discovery lease. The page publishes code and
  lease on `/discover?tool=voice-oncall`; the directory obtains only trusted
  room name and password-required flag through its binding-only lease check.
  Host withdrawal cancels matching pending or verified listings. Password
  credentials and participant identities never enter directory snapshots.
- Up to ten participants can be admitted. Wrong passwords and kicked sessions
  are terminal for that attempt. Authorized senders can remain parked during
  host absence, probing at the one-second foreground target. End and Leave
  stop retries; raw ping/pong maintains idle signaling. Socket messages,
  pending authentication, negotiation and rate bookkeeping remain bounded.
