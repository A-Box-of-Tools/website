# Share a Browser Tab

The shared Direct / Cloud relay switch sits beside the host's Start control,
with Direct initially selected. Viewers use the route in the invitation or
listing and see read-only route and access icons beside Request to watch.
Choosing a route alone never connects or captures. Actual route status remains
visible outside setup panels that disappear after connecting.

A desktop browser captures one tab and streams its picture to one approved
viewer. The viewer opens the tool in a browser, watches live video and has no
input path back to the host website. No extension is needed. There is no audio,
camera, microphone, DOM replication, text selection or recording feature.

This is an intentional network feature. Pairing needs the existing internet
introduction service. Direct is the default and uses host-only ICE without STUN
or TURN; optional Cloud relay forwards encrypted traffic. The page explains these paths and the limits of read-only viewing
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

The Available connections card comes before the host/viewer controls,
using the common `paired-tools` layout and translated Wi-Fi/hotspot help.
Starting a session hides that browsing card. Join on a listing starts the
viewing request using its displayed route. Browsing the list alone never
opens a peer connection, and host approval still gates every video stream.

A session generates a fresh random `tab-` room code. Invitations are
link-only by default. Before starting, the host can opt into Show in Available
connections; that choice stays fixed until the session ends. A viewer link
fills the invitation but does not authorize a connection. The viewer sees the
address exchange notice, optionally adds an introduction and chooses Request
to watch. Join on a discovery row supplies that explicit request instead.
The shared Direct / Cloud relay control sits beside the host's Start action and is
locked while capture or pairing is active. The host's mode is carried in the
viewer link query and discovery listing. Opening an invitation only selects
that mode; the viewer explicitly requests to watch after seeing its disclosure.
A discovery row shows the route before Join and uses any optional note already
entered in the viewer form. Pasted links also carry the choice. A plain code uses the
currently indicated mode. The worker rejects mismatched modes instead of changing
one participant's selection.
The bounded note travels over the encrypted control channel and is not
verified identity.

The initial WebRTC offer contains only the data channel. The host must
approve a request, the viewer must acknowledge acceptance, and only then may
the host attach its video track and renegotiate. One approved viewer can
watch, with up to four pending requests. Refusal, disconnect, Stop, stale
callbacks and permission promises from a retired attempt cannot grant media
to another attempt. `peer-admission.js` gives an approved browser a private
receipt for this host session. Disconnecting retains it; a later explicit
request, including in another tab of the same browser, can reuse it without
another host decision. The acknowledgement and one-viewer limit still apply.
Remove revokes that receipt, and Stop clears every grant. A new capture session
requires approval again. Receipts are sent only over the encrypted control
channel and never appear in the viewer link.

The shared `peer-greeting.js` repeats each peer's hello once after hearing the
other peer, before requesting approval. This repairs an initial greeting lost
while the other browser's channel is still connecting. Duplicate hellos do not
repeat requests, and malformed or premature controls remain invalid. The helper
owns no approval decisions or media; the gates above still belong to this tool.

The host retains up to 256 grants without evicting earlier viewers; a full set
refuses a new approval until removal or a new host session frees capacity.
The browser cache holds 64 recent tool/room/route receipts across Text, Tab and
Camera. An evicted receipt requires approval again. These limits are separate
from the one-viewer limit for live video.

Pending requests appear immediately below the host controls, before the link
and preview, as well as in the dismissible popup. The shared inline panel stays
in normal page flow so it cannot cover Stop sharing.

The viewer receives video only. The application protocol contains no remote
mouse, keyboard, navigation or website-mutation command. This is a property
of the host's input surface, not a claim about the viewer's own device: a
viewer can capture or record received video and cannot be made to forget it.
The website's text is pixels rather than selectable DOM. Private information
shown in a logged-in tab is shared as part of those pixels, without handing
over the website's cookies or login session.

## The connection is shared infrastructure

`PairingSocket` in `shared/js/peer-pairing.js` owns signaling callbacks and
timers. `peer-transport.js` supplies strict Direct or relay configuration,
candidate/description filtering and expiring relay credentials; its Direct
policy uses `peer-network.js`. `room-names.js` supplies name validation.
The tool's `session.js` and `protocol.js` retain application consent,
approval, acknowledgement, limits and media ownership.

`shared/js/peer-endpoint.js` selects `wss://rendezvous.abox.tools` for production
and `wss://rendezvous-dev.abox.tools` for recognized preview and localhost pages.
Room URLs include
`tool=share-tab`, which selects an isolated `share-tab:<code>` room identifier
through the existing worker namespace helper. It must never fall back to the
unqualified Share Text room when the worker does not recognise that tool.
The worker namespace allowlist and transport protocol must be deployed for
pairing; relay support also needs provider configuration in the worker.
See [the worker deployment notes](../../workers/rendezvous/README.md).

In Direct, both browsers configure no ICE servers and accept only host candidates in
local and remote descriptions and trickled messages. Removing STUN alone
would not stop a peer supplying relayed or server-reflexive addresses; the
two-sided filtering is part of the policy. Direct makes no TURN-credential
request and has no relay fallback. Host candidates may describe public interfaces or
follow VPN routes, so this is an address policy rather than proof of a
physical LAN. Client isolation, firewalls and browser local-network
permissions can still prevent a connection.

Cloud relay waits for short-lived TURN credentials over the live room socket
before creating a peer or publishing the invitation. Ready and other room
frames are buffered while credentials are pending. Both sides force relay-only
ICE and filter non-relay addresses in both directions. Credential failure
releases capture; it never retries through Direct. Renewal sets the new peer
configuration and queues a host ICE restart after an outstanding answer has
arrived. Stop retires pending credentials and timers, so late responses cannot
recreate a peer or capture. Selected candidate-pair statistics supply the route
badge; the UI never labels an unverified path as a working relay.
The relay forwards encrypted video and control traffic and sees addresses,
timing and traffic volume. It requires internet throughout the session and
may still be blocked by device management or a firewall.

Online introductions expose room codes, IPs, times, selected mode, SDP and ICE
candidates to the rendezvous. Setup is not encrypted from that service. It
does not carry video, viewer notes or approval decisions. Those use the
browser's encrypted WebRTC transports. Cloudflare connection logs retain
request metadata for seven days. The page's usual third-party scripts can
read page addresses and same-page state, so a fragment code is not treated
as a secret from those scripts.
Mandatory approval remains the media admission step.

## Optional connection discovery

`peer-discovery.js` supplies the same discovery protocol as the other paired
tools, scoped to `tool=share-tab` and the selected rendezvous endpoint. Loading
the page opens no discovery socket. A host that opted in publishes
the random room code and connection mode; a viewer explicitly chooses Find connections to
open the list. The captured tab's title, URL and pixels, and the viewer's note,
are never included in discovery messages. Join beside a result starts the
request using the displayed route. Browsing alone never connects; host
approval and the viewer's acknowledgement remain required before video.

Fresh requests open the shared approval popup while the host page is visible.
Review later or Escape leaves the request in the list. Approve remains disabled
while the single viewer slot is occupied; Deny remains available. Hiding the
page, stopping capture or withdrawing a request closes its popup without
granting access. Popup and list actions use the same session approval API.

The rendezvous groups pages by public IPv4 address or IPv6 /64, page origin
and tool. It is a best-effort network hint, not a Wi-Fi scan, verified identity
or proof of physical proximity. A shared carrier gateway or VPN can include
strangers, and differing routes can hide a nearby device. The copied invitation
still works when discovery cannot find a host. Listings are temporary state on
open connections; stopping the host withdraws its listing.

The shared `peer-discovery-ui` control can instead create or apply a private
group code. `discovery-group` derives the directory identifier, while
`peer-discovery` authenticates the directory socket with the code. The host's
room URL carries only the derived identifier; viewer invitations carry neither
the group code nor its identifier. The group is locked throughout capture and
pairing. Changing it closes the old directory, clears the selected invitation,
and opens an empty listing for the new group. Nothing persists the group or
automatically resumes a host after reload.

Private directories are separate from the public-network directory and can
list compatible sessions across different networks. Direct and Cloud relay
entries appear together with the shared route, password and approval icons;
this tool always requires approval and has no password. Discovery grants no
media access. A Direct entry still needs a reachable route, even if it was
found through a private group; Cloud relay is the choice for separate networks.

Discovery and new connections require internet access on both devices. A
cached copy of the HTTPS page does not replace that introduction. The user
supplies a reachable local network when using Direct; the page does not establish Wi-Fi
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
its selected network or private group, and selecting a listing sends no connection
request until Request to watch. Stopping removes the listing. An automated synthetic stream cannot
establish real browser-picker support.

Check introduction failure before and after a viewer is accepted. Returning
to the page must not bypass approval, request a new capture or revive a stopped
session. A healthy direct connection may survive an introduction interruption,
but new viewers and reconnection require the service to be reachable again.

Exercise Cloud relay separately: zero peer creation before credentials,
relay-only candidates, selected-route reporting, explicit viewer consent and
unchanged approval/ACK gates. Verify credential failure releases capture, Stop
ignores a late credential response, mode mismatch cannot dial, and renewal
waits for an outstanding answer. Direct must request no relay credentials.

The generator and JavaScript suites run in CI, in accordance with the
repository's local-test rule. [The pairing library guide](../../docs/paired-tools.md)
describes the shared primitives; this adapter remains responsible for the
capture and approval boundaries.
