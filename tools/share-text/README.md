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
negotiation between them. The rendezvous does that and nothing else. It
writes no storage — a room is its open sockets and dies with them — and the
content never passes through it. What it can see: that a name is in use,
when peers come and go, their IPs, and the negotiation blobs. What it
cannot see: the text, the files, who was admitted, or what a knock said —
all of that travels the peer channel.

The endpoint is a constant at the top of `src/main.js` and one line in
`tool.toml`'s `[csp]`; those two places change together or not at all. It is
a subdomain of the site, `rendezvous.abox.tools`, rather than the worker's
own `workers.dev` name, because that whole domain is blocked inside mainland
China and the site's is not; the worker answers at both.
STUN (Cloudflare's and Google's public servers) helps the browsers discover
their own addresses; ICE traffic — STUN and, when a reader chooses it, the
TURN relay — is outside `connect-src`'s vocabulary, which is why CSP alone
can never fully describe a WebRTC page.

## How the pieces work

- **Roles.** One page, both halves: no hash means sharer, `#name` means
  reader. A hash-only navigation never reloads a page, so `hashchange`
  forces the reload routing needs.
- **Signalling.** The reader's socket gets `{ready}`, dials only after the
  consent click (before it, the sharer has not learned the reader exists),
  and the switchboard forwards offers, answers and candidates. Rejections
  arrive as 4xxx close codes: 4404 nobody sharing, 4409 name taken, 4429
  full, 4410 sharer gone.
- **End of share.** The 4410 close is the fast, authoritative signal — the
  reader's page wipes what it was showing within a couple of seconds.
  WebRTC's own detection (ICE consent expiry) takes ~30s and is kept only
  as the fallback for when signalling itself is down. The wipe is courtesy,
  not revocation: copied or downloaded content is the reader's.
- **Private mode** (default). The host's first message on a new channel is
  `{private}` instead of the content; the reader's introduction returns as
  `{knock, note}`; admit sends the content, deny sends `{denied}` and closes.
  All of it on the peer channel — the worker needed nothing for this.
- **Files.** Pull model on the same channel: `{files, list}` advertises,
  `{get, id}` requests, then `file-begin` → 64 KB binary chunks paced by
  `bufferedAmountLowThreshold` (1 MB low, 8 MB high-water, with a close
  listener racing the wait so a vanished reader cannot hang the sender) →
  `file-end`. String frames are JSON control; binary frames are the one
  in-flight file. A `get` is honoured only from an admitted channel. The
  receiver assembles in memory, which is what the 200 MB cap is about.
- **Markdown.** `src/markdown.js`, ~80 lines, escape-first: input is
  entity-escaped before any tag is emitted, the tag set is fixed, links
  allow only http/https/mailto. It runs on remote-peer text; that is the
  design constraint, not a style choice. The sharer sees it rendered live
  beside the editor; the reader gets Formatted/Source with the sharer's
  flag as the default.
- **Names.** `src/names.js`: adjective-noun-number suggestions, free-typed
  names folded to `[a-z0-9-]{1,64}`. The name is the only secret, and the
  page says so.
- **The draft** persists in `localStorage` (`share-text-draft`), or not at
  all with one-off checked. Nothing else is ever stored.

## The relay, and why it is the reader's

Direct first, always: the page dials with STUN alone, and a pair that cannot
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

## Limits, deliberate

Sixteen readers, 50k characters, 200 MB a file. The sharer's tab must stay
open and awake: phones suspend background tabs quickly, so this is "desktop
shares, anyone reads".
