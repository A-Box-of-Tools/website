# Voice Oncall

A separate tool for the reverse of Local Walkie-Talkie: up to ten participants
send live voice to one listening host. Each has an independent encrypted WebRTC
audio connection terminating at that host, so participants never receive one
another's audio and the host can silence or remove one without affecting the rest.

The host opens a named inbox, optionally protects it with a password, and listens
without microphone permission. Participants find it in nearby discovery or open
its invitation, enter a name and password when required, and Join. Their microphone
starts disabled until they hold Talk or enable the talking toggle. Hiding or
leaving a participant page releases capture. No account, installation, Python
helper, recording, STUN server or audio relay is involved.

## Admission and discovery

`workers/rendezvous/inbox.js` uses a separate `INBOXES` Durable Object namespace.
The public room code is SHA-256 of a random host capability. Host authorization
proves ownership of that code without putting its secret in a request URL. A
participant has a separate random capability retained in per-tab session storage;
its hashed identity stays stable across reconnection and is not a verified person.

Optional passwords derive a 32-byte credential with PBKDF2 SHA-256, 120,000
iterations, and the room-specific UTF-8 salt `voice-inbox:<code>`. Only the derived
access credential enters encrypted signaling, never the plain password or a
password-bearing invitation. The worker compares its digest before admitting the
participant or forwarding peer setup. A derived credential is still a bearer
credential; strong passwords and trusted page scripts remain important.

Discovery shares the existing rendezvous transport under the `voice-oncall`
namespace. The edge derives the discovery group from the page origin and public
IPv4 address or IPv6 /64, rather than trusting a caller-supplied group. A host's
socket owns a lease; the directory verifies it through the Inbox binding before
listing trusted room name and password-required metadata. Closing the host
withdraws the lease. Shared gateways can include strangers and route differences
can hide physically nearby devices, so the page does not call this a LAN scan.

## Transport and moderation

`shared/js/voice-session.js` is the native voice transport used by both voice
tools. Inbox hosts offer receive-only audio; participants answer send-only audio.
The same bounded connection-generation, ICE, backpressure, retry and idle ping/pong
logic serves both directions. Only audio SDP and host ICE candidates are accepted.
Internet pairing is required; a healthy direct voice path can outlive a brief
signaling outage, and foreground waiting participants probe at a one-second target.

The host routes each incoming stream through its own Web Audio gain. Muting sets
that gain to zero before attaching any replacement stream, which is the authority
even when a participant modifies its page. Signaling also tells cooperative
participants to stop transmission. Removal silences playback immediately and
waits for the service's confirmation before closing the peer and removing the
row. Refused removal remains visible and locally muted, so the host can Unmute
again. Successful removal blocks the retained participant session at admission.
The room retains bounded
moderation history on socket attachments without persistent storage. Creating a
new identity can bypass a session block, so the page does not promise a permanent
ban on a person. End creates a new room and clears the old moderation history.

The service carries room and participant names, derived admission credentials,
moderation and connection metadata, never audio. Cloudflare keeps seven-day
invocation metadata logs. The website's normal scripts run on the page and can
read its address and browser storage. The tool page and Privacy page disclose
these boundaries together.

## Checking it

Use a scoped build, then open the built page over HTTPS or loopback. A full clean
build checks the catalogue and guide registration. CI owns the Python and
JavaScript suites; do not run the full suites locally. Browser acceptance should
exercise protected and open discovery, host receive-only behavior without capture,
several synthetic sender streams, wrong-password refusal, individual mute and
removal, reconnect moderation, End/Leave and late microphone cleanup. Physical
phones and Wi-Fi routes still need separate acceptance.
