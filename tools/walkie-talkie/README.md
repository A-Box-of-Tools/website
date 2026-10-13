# Local Walkie-Talkie

One computer sends a microphone track to up to ten receive-only browsers.
The public page distributes a local ZIP and opens no pairing connection.
`buildlib/local_bundle.py` assembles the same rendered body, styles and
versioned browser modules into a local shell without platform scripts,
service workers or remote assets.

Extract the bundle and run `python helper.py` with Python 3.10 or later.
Open the printed localhost host invitation on that computer. Localhost gives
microphone access a secure context without installing a certificate. Listeners
use LAN HTTP and never request a microphone. `--address` chooses a private
IPv4 interface if automatic discovery misses the intended network.

Host and listener capabilities differ. They stay in URL fragments and travel
in Bearer headers to the local API; host controls require loopback. HTTP
signaling is observable and mutable by an active LAN attacker, even though
WebRTC encrypts voice. Use a trusted network. Anyone with the listener link
and reachability may listen. No recording feature is provided; recipients
can independently record what they hear.

The helper keeps only bounded setup queues, state and leases in memory. It
never receives audio or logs tokens and payloads. Generations retire old
negotiations, and sequence acknowledgements retain signals until handled.
One guarded polling loop targets one second in the foreground. Host-page
reloads keep the invitation; restarting the helper creates new invitations.
End and Leave deliberately stop retries. A temporary host loss reconnects.

Every peer uses `iceServers: []` and the shared `peer-network` part filters
inline and trickled non-host candidates. VPN and OS routes can still affect
host addresses. Ten is an admission cap, not a measured capacity guarantee.
The host track starts disabled; hold or tap enables it and mute overrides
both. Hiding the source or closing it retires pending permissions and releases
capture. Listener mute survives reconnection. Autoplay is attempted; Unmute
is the fallback. There is no Listen button.

Build the tool, extract the ZIP, run the helper and connect two browser
contexts. Check multiple receive-only connections, hold/release, mute, leave,
host reload, deliberate end, late permission cleanup and helper loss. CI owns
the suites. Physical-device acceptance remains necessary for phone autoplay,
Wi-Fi isolation and capacity.

The guide is `/guides/broadcast-voice-on-a-local-network/`.
