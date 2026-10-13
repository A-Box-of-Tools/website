# Local Walkie-Talkie

The website hosts one microphone and up to ten receive-only browsers. Nothing
needs downloading or installing. Starting the host or opening a listener
invitation connects to the existing rendezvous over WSS; microphone audio
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

Host capture begins disabled. Hold or tap enables it, and microphone mute
overrides both. Stop, page hiding and a lost track invalidate pending capture
and release every track, including late permission grants. A temporary hide
keeps the invitation for a manual restart; explicit End stops listener retries.

The worker's Broadcast binding must be deployed before the updated page can
pair. Existing text and camera routes keep their protocol and room identifiers.
CI owns the JS and Python suites. Build the page, use it in a browser, verify
multiple receive-only peers, audible media, hold/release, mute, leave, host
restart, stale setup and deliberate End. Physical-device acceptance remains
necessary for phone autoplay, permissions, Wi-Fi isolation and capacity.

The guide is /guides/broadcast-voice-on-a-local-network/.
