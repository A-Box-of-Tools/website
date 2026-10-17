# Share a Browser Tab

A desktop browser captures one tab and streams its picture to one approved
viewer. The viewer opens the tool in a browser, watches live video and has no
input path back to the host website. No extension is needed. There is no audio,
camera, microphone, DOM replication, text selection or recording feature.

This is an intentional network feature. Pairing needs the existing internet
introduction service; video uses host-only ICE on a reachable local network,
without STUN or TURN. The page explains these paths and the limits of read-only viewing
rather than inheriting local-file-processing claims.

## Capture belongs to the browser picker

The host must click to request `getDisplayMedia()`. The browser presents its
own picker; this tool cannot silently select a website or reuse a grant.
`src/capture.js` accepts only a video track whose `displaySurface` is
`browser`. Window, monitor and unidentifiable surfaces are stopped and
refused. Audio is not requested, and any unexpected audio tracks are stopped.
The local preview lets the host check the source before inviting a viewer.

The page remains open while the host browses in the selected tab. Hiding the
control page does not voluntarily release healthy capture. Browser suspension
and sleep remain outside the tool's control. A track's `ended` event retires
the session; returning to the page never requests another capture. Starting
again requires another click, picker selection and fresh invitation.

## The invitation and approval boundary

The nearby card comes before the host/viewer controls,
using the common `paired-tools` layout and translated Wi-Fi/hotspot help.
Starting a session hides that browsing card. Selecting a
listing still only fills the invitation and focuses Request; the layout does
not grant consent, change discovery timing or create a hotspot.

A session generates a fresh random `tab-` room code. Invitations are
link-only by default. Before starting, the host can opt into Show in nearby
shared tabs; that choice stays fixed until the session ends. A viewer link or
selected nearby listing fills the invitation but does not authorize a
connection. The viewer sees the address exchange notice, optionally adds an
introduction and chooses Request to watch.
The bounded note travels over the encrypted control channel and is not
verified identity.

The initial WebRTC offer contains only the data channel. The host must
approve a request, the viewer must acknowledge acceptance, and only then may
the host attach its video track and renegotiate. One approved viewer can
watch, with up to four pending requests. Refusal, disconnect, Stop, stale
callbacks and permission promises from a retired attempt cannot grant media
to another attempt. A new viewer connection requires fresh approval.

The viewer receives video only. The application protocol contains no remote
mouse, keyboard, navigation or website-mutation command. This is a property
of the host's input surface, not a claim about the viewer's own device: a
viewer can capture or record received video and cannot be made to forget it.
The website's text is pixels rather than selectable DOM. Private information
shown in a logged-in tab is shared as part of those pixels, without handing
over the website's cookies or login session.

## The connection is shared infrastructure

`PairingSocket` in `shared/js/peer-pairing.js` owns signaling callbacks and
timers. `peer-network.js` supplies host-only ICE configuration and filtering
of remote descriptions and candidates. `room-names.js` supplies name validation.
The tool's `session.js` and `protocol.js` retain application consent,
approval, acknowledgement, limits and media ownership.

`shared/js/peer-endpoint.js` selects `wss://rendezvous.abox.tools` for production
and `wss://rendezvous-dev.abox.tools` for recognized preview and localhost pages.
Room URLs include
`tool=share-tab`, which selects an isolated `share-tab:<code>` room identifier
through the existing worker namespace helper. It must never fall back to the
unqualified Share Text room when the worker does not recognise that tool.
The worker namespace allowlist must be deployed for pairing. There is
no new Durable Object class, migration, storage or service secret. The page-side local policy requires no
worker protocol change. See [the worker deployment notes](../../workers/rendezvous/README.md).

Both browsers configure no ICE servers and accept only host candidates in
local and remote descriptions and trickled messages. Removing STUN alone
would not stop a peer supplying relayed or server-reflexive addresses; the
two-sided filtering is part of the policy. There is no TURN-credential
request or relay retry. Host candidates may describe public interfaces or
follow VPN routes, so this is an address policy rather than proof of a
physical LAN. Client isolation, firewalls and browser local-network
permissions can still prevent a connection.

Online introductions expose room codes, IPs, times, SDP and host ICE
candidates to the rendezvous. Setup is not encrypted from that service. It
does not carry video, viewer notes or approval decisions. Those use the
browser's encrypted WebRTC transports. Cloudflare connection logs retain
request metadata for seven days. The page's usual third-party scripts can
read page addresses and same-page state, so a fragment code is not treated
as a secret from those scripts.
Mandatory approval remains the media admission step.

## Optional nearby discovery

`peer-discovery.js` supplies the same discovery protocol as the other paired
tools, scoped to `tool=share-tab` and the selected rendezvous endpoint. Loading
the page opens no discovery socket. A host that opted in publishes
only the random room code; a viewer explicitly chooses Find nearby tabs to
open the list. The captured tab's title, URL and pixels, and the viewer's note,
are never included in discovery messages. Selecting a result only fills the
invitation: Request to watch, host approval and the viewer's acknowledgement
remain separate steps.

The rendezvous groups pages by public IPv4 address or IPv6 /64, page origin
and tool. It is a best-effort network hint, not a Wi-Fi scan, verified identity
or proof of physical proximity. A shared carrier gateway or VPN can include
strangers, and differing routes can hide a nearby device. The copied invitation
still works when discovery cannot find a host. Listings are temporary state on
open connections; stopping the host withdraws its listing.

Discovery and new connections require internet access on both devices. A
cached copy of the HTTPS page does not replace that introduction. The user
also supplies a reachable local network; the page does not establish Wi-Fi
Direct, Bluetooth or a hotspot. Hotspots are a best-effort option because some
isolate devices even when each can access the internet.

## Ending and reconnecting

Stop releases capture, closes peers and retires session intent. A browser
Stop action, the captured tab ending or closing the sharing page also ends
the source. A viewer disconnect ends only that viewer's connection. A failed
introduction service does not itself authorize media, change candidate policy or
request new capture. The session code owns the handling of an already healthy
peer while signaling is interrupted; returning to the page never bypasses
an ended track or an explicit Stop.

## Verification

Build the tool with `python build.py --only share-tab --locale en --quiet`,
serve the built output and use two browser pages. Exercise the real picker
on a desktop browser: tab accepted; window and screen refused; cancellation
releases nothing. Verify no media before approval and acknowledgement,
only one approved viewer, refusal and disconnect, browser Stop, late capture
after Stop, hidden control-page continuity and a fresh start after capture
ends. Exercise pairing on the actual local network with internet access.
Verify discovery is off initially, an opted-in host appears only in
its network/origin/tool group, and selecting a listing sends no connection
request until Request to watch. Stopping removes the listing. An automated synthetic stream cannot
establish real browser-picker support.

Check introduction failure before and after a viewer is accepted. Returning
to the page must not bypass approval, request a new capture or revive a stopped
session. A healthy direct connection may survive an introduction interruption,
but new viewers and reconnection require the service to be reachable again.

The generator and JavaScript suites run in CI, in accordance with the
repository's local-test rule. [The pairing library guide](../../docs/paired-tools.md)
describes the shared primitives; this adapter remains responsible for the
capture and approval boundaries.
