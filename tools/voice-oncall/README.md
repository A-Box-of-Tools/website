# Voice Oncall

A separate tool for the reverse of Local Walkie-Talkie: up to ten participants
send live voice to one listening host. Each has an independent encrypted WebRTC
audio connection terminating at that host, so participants never receive one
another's audio and the host can silence or remove one without affecting the rest.

The host opens a named pager, optionally protects it with a password, and listens
without microphone permission. Participants find it in nearby discovery or open
its invitation, enter the password when required, and Connect without supplying a
name. Their microphone starts disabled until they hold Talk or enable the talking
toggle. A physical hold releases on blur or hiding; explicit hands-free speech
and healthy connections can continue in the background while the browser allows.
No account, installation, Python
helper, recording, STUN server or audio relay is involved.

The interface calls the listening endpoint a pager. Internal inbox and room
identifiers retain their existing names so invitations, credentials and recovery
remain compatible.

## Admission and discovery

`workers/rendezvous/inbox.js` uses a separate `INBOXES` Durable Object namespace.
The public room code is SHA-256 of a random host capability. Host authorization
proves ownership of that code without putting its secret in a request URL. A
participant has a separate random capability retained in per-tab session storage;
its hashed identity stays stable across reconnection and is not a verified person.
The host labels an unnamed participant with a localized Caller label and a short
prefix of that identity, extending the prefix when needed to distinguish callers.
The page no longer retains caller names and removes names saved by older pages
without discarding recovery credentials or session blocks. The worker still
accepts older clients that send a display name, which the host can display.

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
The host watches playback interruptions and can restore its existing audio
context without rebuilding the room or requesting a microphone. Browsers that
offer AudioSession receive a temporary playback hint; ending the host restores
the previous hint. A native source-track mute or audio-session interruption
clears talking while retaining the participant's connection and live track.
Recovery never restores the previous hands-free transmission. An ended
microphone track can be replaced within the same pairing, automatically once on
returning to the foreground or through Resume microphone. Replacement starts
with transmission disabled and retains host moderation. Sources request the
optional play-and-record audio-session hint and restore its previous value when
the last owning session stops, provided another owner has not changed it.

A pagehide notification releases media; a subsequent pageshow attempts to
restore the same pager or caller identity, with caller transmission off. Browser restrictions can
require Resume microphone or Restore sound. Healthy hidden pages are not
deliberately disconnected, but screen lock, browser suspension and operating-
system interruptions can still stop audio or connections. Locked-screen
operation is not guaranteed. Disconnect and End cancel recovery and stop late
microphone grants.

The room retains bounded
moderation history on socket attachments without persistent storage. Creating a
new identity can bypass a session block, so the page does not promise a permanent
ban on a person. End creates a new room and clears the old moderation history.

The service carries room names, participant identifiers, derived admission
credentials, moderation and connection metadata, never audio. Older clients may
also send participant display names. Cloudflare keeps seven-day
invocation metadata logs. The website's normal scripts run on the page and can
read its address and browser storage. The tool page and Privacy page disclose
these boundaries together.

## Checking it

Use a scoped build, then open the built page over HTTPS or loopback. A full clean
build checks the catalogue and guide registration. CI owns the Python and
JavaScript suites; do not run the full suites locally. Browser acceptance should
exercise protected and open discovery, host receive-only behavior without capture,
connecting without a caller name, several synthetic sender streams, distinct
caller labels, wrong-password refusal, individual mute and
removal, reconnect moderation, hidden hands-free continuity, hold release,
microphone interruptions, silent capture replacement, End/Disconnect and late
microphone cleanup. Simulated lifecycle events do not prove locked-screen
continuity; physical phones and Wi-Fi routes need separate acceptance.

## The shared pairing library

Socket ownership, guarded callbacks, heartbeat timers and page lifecycle events
come from `shared/js/peer-pairing.js` and `shared/js/foreground-recovery.js`.
[The pairing library guide](../../docs/paired-tools.md) describes their contract
and how another tool can use them. This tool still owns its protocol, consent,
credentials, approval and media policy; a foreground event cannot grant any of
those permissions or undo an explicit Stop.
