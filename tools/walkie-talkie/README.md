# Local Walkie-Talkie

The shared Direct / Cloud relay switch sits beside the host's Start action, with Direct as the default. Once started, a read-only badge shows that choice. Joining adopts the host's verified route rather than offering a separate route switch. Available connections lists both routes together, with shared accessible icons for the route and access requirement. Browsing opens no media connection; Join on a channel row confirms its receive-only connection without requesting microphone access.

The website hosts one microphone and up to ten receive-only browsers. Nothing
needs downloading or installing. Opening the page lists available channels over
a discovery WebSocket; joining never requests microphone access. Starting the
host or confirming Join opens its own rendezvous connection; microphone audio
travels over a separate encrypted WebRTC connection to each listener. Direct is
the default; Cloud relay is an explicit alternative shared by the host and listener.

Available connections appears first, before hosting controls. Each row's Join
button requests entry in one step, with the route included in its accessible name.
A withdrawn listing cannot be joined through a stale row.
Opening a Direct listener invitation starts its admission request automatically;
required host approval still applies. A Cloud relay invitation shows the chosen
route and requires Join before requesting admission.
Shared network guidance
covers Wi-Fi and phone hotspots that permit direct traffic, while making clear
that discovery and pairing still need internet and a hotspot is not a guarantee.

The broadcast protocol is separate from text and camera rooms. Its room code
is the SHA-256 digest of a random host secret, so knowing a listener invitation
cannot take over a vanished host. Host and listener capabilities travel in
the first authenticated socket message, never request URLs. Socket attachments
retain bounded temporary state while browsers remain connected. The service
carries setup and availability messages, never audio, and writes no room history.
Cloudflare retains seven-day invocation metadata logs.

Direct uses iceServers: [] and filters inline and trickled candidates to host
candidates only. VPNs and operating-system routes can still affect the path;
this policy does not prove a physical LAN boundary. Cloud relay requests
temporary TURN credentials only after authenticated admission, uses
iceTransportPolicy: 'relay', and filters both directions to relay candidates.
Cloudflare forwards encrypted audio and sees connection metadata and traffic
volume, but cannot decrypt the WebRTC audio. There is no automatic fallback.

The host's mode is pinned in invitations, authentication and retained room
attachments. A mismatch is refused, including after host reconnection. Changing
the host mode creates a fresh identity. Discovery includes the verified
mode, never TURN credentials. The shared selector is locked during connection
and an active session. Actual-route status comes from selected candidate-pair
statistics, with unknown shown until those statistics establish a route.

`peer-transport.js` owns credential validation, expiry and renewal. The voice
adapter consumes credential replies outside its sequential offer queue, so an
offer awaiting credentials cannot block their response. Renewal updates peer
configuration and negotiates replacement connections in the same selected mode.
Credential failure stops the session and capture instead of trying Direct.
The worker's per-service switch, participant cap and credential limits apply;
End and Leave invalidate pending mints and stop all renewal timers.

Starting with Make this channel discoverable selected publishes a bounded
channel name and its listener capability to the selected discovery scope.
Local network uses an address-and-origin group; Private group uses the shared
group code and works across network addresses. The group code only grants
discovery, and is never placed in a listener invitation. Discovery verifies
the live host lease, its scope and listener-key hash through the Broadcast
binding. The host authority key is never listed. Public IPv4 or IPv6 /64
grouping is a hint rather than proof of physical Wi-Fi membership.
New channels offer discovery by default with an explicit checkbox; retained
legacy channels remain link-only. Uncheck before starting for link-only use.
End, pagehide, disconnect and replacement withdraw the old listing; a restarted
host publishes its new lease. Browsing creates no peer or microphone stream.

The host key stays in per-tab session storage. Listener invitations carry a
different key in the URL fragment; the page saves it per tab and removes the
fragment where storage is available, retaining the fragment when it is not.
A separate random listener identity is retained in the browser, distinct from the
shared invitation capability. Reload can then rejoin the same channel. End retires the host identity and the
next Start creates a fresh invitation; Leave retires the active connection,
while keeping the personal key for a later explicit Join.
The site's regular scripts run on this page and can read its URL and storage.
The page states this boundary rather than claiming that fragment credentials
are inaccessible to other scripts.

Listeners never request a microphone and do not create audio senders. Playback
is attempted automatically; Unmute is the fallback when a browser blocks it.
Mute survives reconnection. Waiting listeners check the parked socket every
second in the foreground rather than repeatedly opening rate-limited sockets.
Healthy direct audio can survive a brief signaling outage. New generations
retire stale peers, and failed media is negotiated again. Background timers,
sleep and connection limits can delay retries.

Host capture begins disabled. Holding Talk or enabling hands-free speech starts
transmission, and microphone mute overrides both. A physical hold releases when
the page loses focus or becomes hidden. Explicit hands-free speech and healthy
connections continue in the background for as long as the browser permits; the
interface makes hands-free transmission visible before the page is hidden.
Screen lock, browser suspension and operating-system interruptions can still
stop audio or connections, so locked-screen operation is not guaranteed.

A native microphone mute or audio-session interruption clears talking while
keeping the channel, peers and live capture track. When that track becomes
available again, transmission stays off. An ended track can be replaced within
the same pairing, automatically once on returning to the foreground or through
Resume microphone. Replacement begins disabled and never restores a previous
hands-free transmission. A pagehide notification releases capture; a subsequent
pageshow reconnects with the retained channel identity. Resume channel remains
available if an action is required. End invalidates pending capture, stops late permission
grants, retires the host identity and prevents automatic resumption and listener
retries.

The worker's Broadcast binding must be deployed before the updated page can
pair. Existing text and camera routes keep their protocol and room identifiers.
CI owns the JS and Python suites. Build the page, use it in a browser, verify
multiple receive-only peers, audible media, hold/release, hands-free state,
mute, leave, hidden hands-free continuity, hold release, microphone interruption,
silent capture replacement, the Resume channel fallback, stale setup and
deliberate End without automatic resumption. Simulated lifecycle events do not
prove locked-screen continuity; physical-device acceptance remains necessary
for background audio, phone autoplay, permissions, Wi-Fi isolation and capacity.

The guide is /guides/broadcast-voice-on-a-local-network/.

## Host approval

New hosts enable Require approval by default. Turning it off before starting
allows admission after the existing invitation/password checks. The policy is
pinned to the room and echoed by the Worker; an explicit policy without a
matching acknowledgement fails closed. Saved legacy hosts retain their previous
policy. Changing policy requires a new session identity.

The shared voice session reports pending identities through onRequests. The
Worker withholds peer joins, SDP, ICE, status forwarding and participant TURN
credentials until approval. Voice Oncall also defers microphone capture until
authoritative admission, even when approval is off. Password checks precede
approval. The popup and pending list use peer-approval-ui.js: Review later or
Escape keeps the request, while Approve and Deny check the current identity
and active host. Ending invalidates late decisions.

A bounded roster on live socket attachments allows the same approved identity
to recover within the current room. The shared `voice-identity.js` cache keeps
the listener's personal key by room and route for a later explicit Join, including
from another tab in the same browser. Leave stops automatic recovery without
forgetting that key. The browser cache retains 64 recently used tool/room/route
keys across both voice tools; cache eviction or clearing site data can require
approval again. The roster holds ten approvals for the host session and
does not evict departed listeners; a full roster requires a new host session
before another listener can be approved. End clears the grants. If every socket
disappears, the ephemeral room is gone and a new room needs fresh approval.
A new identity needs approval. This is
session continuity, not verification of a person's identity or a permanent ban.
The Worker writes no room history to storage. Pending requests count toward capacity.
The pending list is beside the host controls and uses the shared inline panel,
so Review later leaves an actionable request before the talking controls and invite.

## The shared pairing library

Socket ownership, guarded callbacks, heartbeat timers and page lifecycle events
come from `shared/js/peer-pairing.js` and `shared/js/foreground-recovery.js`.
[The pairing library guide](../../docs/paired-tools.md) describes their contract
and how another tool can use them. This tool still owns its protocol, consent,
credentials, approval and media policy; a foreground event cannot grant any of
those permissions or undo an explicit Stop.

Private group controls and connection icons come from `peer-discovery-ui.js`;
`discovery-group.js` owns code normalization, creation and group identifiers.
Changing scope closes the old directory, clears its listings and opens the
new one. A running or recovering session locks the scope until stopped. Group
codes stay in memory; saved host identities retain only the group identifier.
Reload discards a saved private host rather than republishing it to the public
scope. A same-page foreground recovery retains its original scope. Direct
sessions can be discovered across networks but still need a reachable direct
path; group discovery does not enable a relay automatically.
