# Share a Browser Tab

A desktop browser captures one tab and streams its picture to one approved
viewer. The viewer opens the tool in a browser, watches live video and has no
input path back to the host website. No extension is needed. There is no audio,
camera, microphone, DOM replication, text selection or recording feature.

This is an intentional network feature. Its page explains the video path,
setup metadata, public address discovery, optional relay and the limits of
read-only viewing rather than inheriting local-file-processing claims.

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

Every session generates a fresh random `tab-` room code. It is a link-only
invitation, with no discovery socket or listing. A viewer link selects the
viewing role but does not authorize a connection. The viewer sees the address
exchange notice, optionally adds an introduction and chooses Request to watch.
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
timers. `peer-network.js` supplies ordinary STUN configuration and the
viewer-selected TURN retry. `room-names.js` supplies name validation.
The tool's `session.js` and `protocol.js` retain application consent,
approval, acknowledgement, limits and media ownership.

The rendezvous endpoint is `wss://rendezvous.abox.tools`. Room URLs include
`tool=share-tab`, which selects an isolated `share-tab:<code>` room identifier
through the existing worker namespace helper. It must never fall back to the
unqualified Share Text room when the worker does not recognise that tool.
The worker namespace allowlist requires a separate manual deployment before
the static tool can pair. There is no new Durable Object class, migration,
storage or service secret. See [the worker deployment notes](../../workers/rendezvous/README.md).

The ordinary attempt uses Cloudflare and Google STUN for address discovery.
A direct failure offers the viewer an explicit relay retry using the
rendezvous's existing short-lived Cloudflare TURN credentials. That retry
uses a fresh peer attempt; it does not silently widen a failed attempt's
policy. An absent relay configuration remains a visible failure. Neither
STUN nor TURN traffic is governed by the page's `connect-src` directive.

The rendezvous sees room codes, IPs, times, SDP and ICE candidates. Setup is
not encrypted from that service. It does not carry video, viewer notes or
approval decisions. Those use the browser's encrypted WebRTC transports;
the optional TURN relay forwards ciphertext without media keys. Cloudflare
connection logs retain request metadata for seven days. The page's usual
third-party scripts can read page addresses and same-page state, so a fragment
code is not treated as a secret from those scripts. Mandatory approval is the
media admission step.

## Ending and reconnecting

Stop releases capture, closes peers and retires session intent. A browser
Stop action, the captured tab ending or closing the sharing page also ends
the source. A viewer disconnect ends only that viewer's connection. A failed
introduction service does not itself authorize media, change relay policy or
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
ends. Direct and explicitly chosen relay paths need separate network checks.
An automated synthetic stream cannot establish real browser-picker support.

The generator and JavaScript suites run in CI, in accordance with the
repository's local-test rule. [The pairing library guide](../../docs/paired-tools.md)
describes the shared primitives; this adapter remains responsible for the
capture and approval boundaries.
