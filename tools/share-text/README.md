# Share Text & Files

The share lives in the sharer's open tab. Readers who follow the link — or
type its name — receive the text and files over a WebRTC data channel,
directly from the sharer's browser, encrypted end to end; the share ends,
completely and physically, when the tab closes, because the tab is the only
place it ever existed.

Two properties set this apart from every pastebin and file-drop, and every
use case falls out of them: **the code word is speakable**, and **presence
is the storage**. Text from your desktop to your phone without signing into
anything; a password handed over without it living forever in a chat
history; notes that fill in live on a call or a classroom screen and vanish
with the lesson. Every "temporary" sharing service stores the data and
promises to delete it — this one is structurally incapable of keeping it.

## The one server, and why it is allowed

This is the first tool on the site with a network step, so the rule from
[docs/adding-a-tool.md](../../docs/adding-a-tool.md) applies: it says so on
its own page, in plain language, and does not weaken the site-wide claim
quietly. The page's `connect-src` names exactly one origin of ours — the
**rendezvous**, a Cloudflare Worker whose whole source is in
[`workers/rendezvous/`](../../workers/rendezvous/). A direct connection
needs an introduction: something must match the reader who typed
`brave-otter-42` with the sharer under that name and pass a few KB of WebRTC
negotiation between them. The rendezvous also lists opted-in local link
names for browsers using the same public IPv4 address or IPv6 /64 subnet. It writes no storage
— rooms and discovery entries live on their open sockets — and the
content never passes through it. What it can see: that a name is in use,
when peers come and go, their IPs, and the negotiation blobs. What it
cannot see: the text, the files, who was admitted, or what a knock said —
all of that travels the peer channel.

The endpoint is a constant at the top of `src/main.js` and one line in
`tool.toml`'s `[csp]`; those two places change together or not at all. It is
a subdomain of the site, `rendezvous.abox.tools`, rather than the worker's
own `workers.dev` name, because that whole domain is blocked inside mainland
China and the site's is not; the worker answers at both.
In ordinary mode, STUN (Cloudflare's and Google's public servers) helps the
browsers discover their own addresses; ICE traffic — STUN and, when a reader
chooses it, the TURN relay — is outside `connect-src`'s vocabulary, which is
why CSP alone can never fully describe a WebRTC page. Local network mode
removes those public STUN servers and does not offer TURN, but still uses
the public rendezvous for signalling.

## Local network mode

The sharer can select **Local network — no internet relay** before starting.
The copied URL carries `?local=1#name`, so the reader knows the intended mode
before consenting; `#name` by itself keeps the ordinary mode. A reader and a
sharer with different modes do not connect until the reader explicitly
chooses to retry with the sharer's mode. There is no automatic downgrade.

Both peers construct their connection with no ICE servers, and allow only
host candidates in both SDP descriptions and trickled candidate messages.
Filtering both directions matters: removing our STUN configuration alone
would still let a peer offer a relayed or server-reflexive address. Local
mode also ignores any saved relay retry and never asks the worker for TURN
credentials. The worker carries the mode in its existing opaque negotiation
messages; it needs no new deployment.
The discovery directory described below does need the newer worker and its
additional Durable Object binding; transport by link still works with an
older worker.

The intended use is two devices on the same Wi-Fi or Ethernet. The mode
constrains ICE candidates, not physical routing: a VPN, an OS route or browser
network policy can change which interfaces are visible and where a host
address leads. Guest isolation, firewalls and browser policy can prevent the
connection. The page describes that limitation rather than promising that a
packet never leaves a building. Internet access is still needed for the
introduction, private approval remains the default, and the 200 MB cap is
unchanged.

## Finding a share on the start page

The shared frame shows the tool's generated code version beside its heading,
so both roles use the same display as Remote Camera. It is
the same content hash used in this page's module URLs, so languages using the
same code show the same value, and changing the tool or its shared modules
changes it without a hand-maintained version number. The information tooltip
asks devices with different values to reload before starting a new share.
This helps identify an older open or cached page; it does not gate connections
or claim that different versions cannot work together.

Opening the tool without a share name opens one WebSocket to `/discover`.
The list contains only advertised codes and the local-mode flag; opening an
entry shows the usual consent page in another tab. It never opens WebRTC on
its own and never bypasses Private approval. Starting a local share leaves
**Discoverable** on by default; unticking it makes the share link-only.
Local network mode itself is off by default, so ordinary shares are never
listed. Starting a share hides this tab's discovery panel until sharing
stops or a name collision returns the page to editing. The discovery socket
stays open, so the advertised name remains visible to other browsers while
the panel is hidden. The rendered list excludes this tab's own share, and
Stop suppresses its name until a directory snapshot confirms it absent.
A collision releases that name because it now belongs to another host.
The share controls show an opening state, then a persistent Sharing badge
separate from reader counts or connection warnings.
Keep Private on on shared networks: without it, anyone who sees the name
can connect and read without an admission decision.
The information icon beside Discoverable opens that explanation on hover,
keyboard focus or tap. Its tooltip behavior is shared with the receipt tool
through `shared/js/help-tooltip.js`; Escape or clicking elsewhere dismisses it.

The group is derived by the worker from the canonical Cloudflare public
IPv4 address or IPv6 /64 subnet, together with the allowed page origin,
hashed with SHA-256. IPv6 devices in one /64 share the group even when their
individual addresses differ.
The page cannot pick a scope. One router usually gives the expected group,
but a shared VPN or carrier-grade NAT can include other networks. Mixed IPv4
and IPv6 connections or different routes can exclude two devices on the
same LAN.
Missing, unknown or Worker-proxied source addresses are refused rather than
falling into one global group. A host can still share by link when its
discovery scope is unsupported; it receives no publication lease. This is
a finding aid, not a LAN boundary;
internet is still required and the copied link remains the fallback.

The host starts its usual room socket with `local=1&discover=1` only when
advertising. The live room issues a random lease in
`{type: 'host-ready', discovery: {code, lease}}`; the page publishes it on
its discovery socket as `{publish: {code, lease}}`. The directory verifies
the lease against the room through its private binding before listing a
name. Socket attachments keep only transient advertisement state through
hibernation. Stopping sends `{publish: null}` as a fast withdrawal, while
the room's own binding call removes the lease when the host disappears.
A stale close cannot remove a restarted share with a different lease.
The Refresh control asks the directory to revalidate its listed room leases
before returning a fresh snapshot.

The start page keeps its discovery socket while sharing and adds one room
socket; a reader still uses one introduction socket. An unavailable or older
worker becomes a visible discovery failure, and the active share stays
reachable by link. The new worker deployment is manual, documented in
[`workers/rendezvous/README.md`](../../workers/rendezvous/README.md).

## Connection diagnostics

Both roles expose a **Connection details** panel with a readable last-stage
summary and a copyable JSON report. A failed attempt opens it automatically.
The report includes the generated tool-code identifier, parsed browser family
and version, connection mode, anonymous attempt numbers, elapsed milestones,
signaling counts, ICE/DTLS/SCTP/control-channel states, candidate classifications,
reported candidate-pair counts, and allowlisted error codes. A sharer records
each reader independently, including negotiation errors that previously reached
an empty catch. The introduction socket has its own record and numeric close
code. Seeing a discoverable name establishes directory visibility, not a working
peer connection.

`shared/js/connection-diagnostics.js` projects candidates and RTC statistics through an
allowlist. It never retains or exports raw SDP, candidate addresses or hostnames,
ICE credentials, share names, peer identifiers, text, file names, file sizes,
approval notes, admission tokens, exception messages, or stacks. Reports stay in
the tab's memory; Copy writes only to the local clipboard, with selectable text
when clipboard access is refused. The read-only report is excluded from the
frame's language-switch settings storage. No endpoint, relay policy, connection
permission or application protocol is added by diagnostics.

History is bounded to twelve anonymous attempts, sixty-four events and sixteen
errors per attempt, with omission counts. Statistics are sampled once per second
while a channel is opening and once on open; no payload listener is added.
Finish freezes the meaningful states before teardown and detaches sampling and
event listeners, so a late statistics promise cannot repaint a newer attempt.
Missing browser counters remain `null`; `stats.available` distinguishes an
unavailable report from an empty one. In particular, no reported ICE pairs does
not by itself prove an mDNS, browser-version, firewall or router defect. Reports
from both physical devices are needed to investigate those boundaries.

## How the pieces work

- **Roles.** One page, both halves: no hash means sharer, `#name` means
  reader. A hash-only navigation never reloads a page, so `hashchange`
  forces the reload routing needs.
- **Signalling.** The reader's socket gets `{ready}`, dials only after the
  consent click (before it, the sharer has not learned the reader exists),
  and the switchboard forwards offers, answers and candidates. Rejections
  arrive as 4xxx close codes: 4404 nobody sharing, 4409 name taken, 4429
  full, 4410 sharer gone.
- **End of share.** Stop sharing sends an ordered `{type: 'ended'}` on each
  current encrypted control channel before closing it. That explicit control
  is terminal. A 4410 introduction-socket close alone can also mean temporary
  host suspension, so a healthy direct channel is retained and checked rather
  than declared ended. Lost peers clear their displayed content and file
  buffers before any bounded recovery attempt. The wipe is courtesy, not
  revocation: copied or downloaded content is the reader's.
- **Private mode** (default). The host's first message on a new channel is
  `{private}` instead of the content; the reader's introduction returns as
  `{knock, note}`; admit sends the content, deny sends `{denied}` and closes.
  All of it on the peer channel — the worker needed nothing for this.
- **First delivery.** The reader announces that its message handler is ready
  on the peer channel; the host repeats the introduction if it already sent
  one. Both sides handle a channel delivered already open. Establishing the
  channel and receiving the first private/text message have separate twenty-
  second deadlines: an open channel alone must not leave the reader waiting
  forever. A delivery timeout closes that attempt and offers a fresh retry;
  a private reader waiting for a person's admission has no artificial deadline.
- **Files.** Pull model on the same admitted peer connection. `{files, list,
  fileChannels: true}` advertises, `{get, id, request}` requests, and the host
  creates a dedicated `share-file:<request>` data channel for that UUID. Its
  `file-begin` → 64 KB binary chunks → `file-end` stream retains the existing
  200 MiB requested-size cap, exact ID/size markers, 16,384-part ceiling and
  1 MiB/8 MiB backpressure. A host accepts requests only from its admitted
  main channel, with one active transfer and at most two pending native reads
  per reader. A file is captured before the first read; removing an attachment
  cannot replace its bytes with another file under that request.
  Cancel releases accumulated receiver parts, closes that lane and sends the
  request ID on the main channel. Retry uses a fresh UUID/channel, so a pending
  old read, close, failure or chunk cannot enter the retry. Live text and
  private admission stay open. A completed receiver closes its lane after the
  exact end marker; idle/opening lanes time out after thirty seconds. Native
  reads already started cannot be interrupted, but their bytes are discarded
  after retirement and their 64 KB size remains bounded.
  A cached older host omits the capability and sends untagged bytes on the
  main lane. That compatibility path still works, but Cancel or a failed
  transfer must close its session before Check this link again can retry it.
  An older reader can still request a file from the new host on the old lane.
  No new rendezvous message, network origin, storage or automatic relay is
  introduced. The worker still carries only introductions and discovery.
- **Markdown.** `src/markdown.js`, ~80 lines, escape-first: input is
  entity-escaped before any tag is emitted, the tag set is fixed, links
  allow only http/https/mailto. It runs on remote-peer text; that is the
  design constraint, not a style choice. The sharer sees it rendered live
  beside the editor; the reader gets Formatted/Source with the sharer's
  flag as the default.
- **Names.** `src/names.js`: adjective-noun-number suggestions, free-typed
  names folded to `[a-z0-9-]{1,64}`. A link-only share can keep the name
  unguessable; a discoverable local share publishes it to its address group.
  Private admission is the access control in either case.
- **The draft** persists in `localStorage` (`share-text-draft`), or not at
  all with one-off checked. Nothing else is ever stored.

## The relay, and why it is the reader's

In ordinary mode, direct first: the page dials with STUN alone, and a pair that cannot
be joined that way — typically a phone on a carrier's address-sharing network
against a laptop behind a strict router, which is the tool's headline use
case at its unluckiest — fails after twenty seconds with an honest message.
That used to be the end of it. It is now followed by an offer, on the
reader's page only: redial through Cloudflare's TURN service. The reader
sends `{relay: true}` on the rendezvous socket, the room mints a
short-lived credential (`relayServers` in the worker, `TURN_KEY_ID` and
`TURN_KEY_TOKEN` as secrets, eight-hour TTL, once per socket) and hands it
back as `{relay, iceServers}`, and the page reloads with a flag in
`sessionStorage` so the redial is a fresh socket and a fresh peer connection
rather than a renegotiation of a failed one. The sharer's side does not
change at all: its own candidates pair with the reader's relayed one, and
ICE's peer-reflexive discovery handles the sharer being the one behind the
strict NAT.

Why the reader and not the sharer: the relay forwards DTLS ciphertext it holds
no key to, so what it changes is the path, not what anyone can see — and the
path on the reader's side is the reader's business, exactly as a VPN would be.
The sharer's page still sends to that one reader and nowhere else. The relay
is never chosen for anyone: the page says what it is and what it sees (both
addresses, as the direct connection would have) and waits for a click, which
is the same shape as the consent before the direct connection. A rendezvous
with no key configured, or an older one that does not know the question,
leaves the ask unanswered, and five seconds of silence becomes "no relay is
available" — the page degrades to exactly what it was.

## Foreground continuity

Hiding this page does not close healthy sockets, peers or file lanes. A phone
can still freeze or discard its browser while locked; this page cannot make
background execution reliable. Returning to the foreground, restoring a page
or coming back online probes the existing connection first. A host with active
sharing intent reconnects its introduction socket under the same code. A clean
WebSocket close is not treated as a user Stop. A name now held by another host
ends that recovery rather than silently selecting a different code.

A reader who already chose Connect can retry a lost transport in the same
page, with at most three foreground attempts. The Local/ordinary mode and any
explicit relay choice stay fixed; recovery never selects a relay or changes
mode. Admission tokens remain in the reader's memory when browser storage is
unavailable, and the same live host can recognize them after suspension. The
reader keeps its source/formatted choice and any introduction input. A new
connection discards partial file bytes and requires a fresh download request.
Failed recovery leaves Check this link again for a deliberate fresh attempt.

Stop sharing clears the host's admission tokens and disables host recovery.
An explicit ended control, a refusal or an intentional legacy-file shutdown
disables reader recovery. Closing the page does not persist recovery intent.
If an abrupt closure or older cached host cannot deliver an ended control,
the bounded retries distinguish it from a temporarily missing host without
polling forever. A name remains an address, not proof of a particular person;
Private admission still protects a new share reusing that name.

## Limits, deliberate

Sixteen readers, 50k characters, 200 MB a file. Keep the sharer's tab open and
the device awake for uninterrupted sharing. Foreground recovery helps after
suspension; it cannot keep a phone browser executing while its screen is locked.

## Copy feedback

Both copy controls await the browser clipboard result before saying Copied.
A refusal selects the raw text or share link for manual copying. Live text
replacement, end of share, a new share and a newer copy action retire feedback
and its timer; they cannot cancel a clipboard write already accepted by the
browser. A stale rejection does not select or change the current content.

## The shared pairing library

Socket ownership, guarded callbacks, heartbeat timers and page lifecycle events
come from `shared/js/peer-pairing.js` and `shared/js/foreground-recovery.js`.
[The pairing library guide](../../docs/paired-tools.md) describes their contract
and how another tool can use them. This tool still owns its protocol, consent,
credentials, approval and media policy; a foreground event cannot grant any of
those permissions or undo an explicit Stop.
