# Local Walkie-Talkie

The website hosts one microphone and up to ten receive-only browsers. Nothing
needs downloading or installing. Opening the page lists nearby channels over
a discovery WebSocket; joining never requests microphone access. Starting the
host or choosing a channel opens its own rendezvous connection; microphone audio
travels over a separate direct WebRTC connection to each listener.

The broadcast protocol is separate from text and camera rooms. Its room code
is the SHA-256 digest of a random host secret, so knowing a listener invitation
cannot take over a vanished host. Host and listener capabilities travel in
the first authenticated socket message, never request URLs. Socket attachments
retain bounded temporary state while browsers remain connected. The service
carries setup and availability messages, never audio, and writes no room history.
Cloudflare retains seven-day invocation metadata logs.

Both sides use iceServers: [] and the shared peer-network filters inline and
trickled candidates to host candidates only. VPNs and operating-system routes
can still affect their path; the policy does not prove a physical LAN boundary.
Direct reachability is required and there is no relay fallback.

Starting with Show this channel nearby selected publishes a bounded channel
name and its listener capability to the trusted address-and-origin group.
Discovery verifies the live host lease and listener-key hash through the
Broadcast binding. The host authority key is never listed. Public IPv4 or
IPv6 /64 grouping is a hint rather than proof of physical Wi-Fi membership.
New channels offer discovery by default with an explicit checkbox; retained
legacy channels remain link-only. Uncheck before starting for link-only use.
End, pagehide, disconnect and replacement withdraw the old listing; a restarted
host publishes its new lease. Browsing creates no peer or microphone stream.

The host key stays in per-tab session storage. Listener invitations carry a
different key in the URL fragment; the page saves it per tab and removes the
fragment where storage is available, retaining the fragment when it is not.
Reload can then rejoin the same channel. End retires the host identity and the
next Start creates a fresh invitation; Leave retires a listener identity.
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

## The shared pairing library

Socket ownership, guarded callbacks, heartbeat timers and page lifecycle events
come from `shared/js/peer-pairing.js` and `shared/js/foreground-recovery.js`.
[The pairing library guide](../../docs/paired-tools.md) describes their contract
and how another tool can use them. This tool still owns its protocol, consent,
credentials, approval and media policy; a foreground event cannot grant any of
those permissions or undo an explicit Stop.
