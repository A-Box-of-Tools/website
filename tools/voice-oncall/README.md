# Voice Oncall

The shared Direct / Cloud relay switch sits beside the host's Start action, with Direct as the default. Joining adopts the host's verified route rather than offering a separate route switch. Available connections lists both routes together, with shared accessible icons for the route and access requirement. Each row offers Join; browsing alone never connects. A required password opens a compact prompt, and host approval precedes microphone access.

A separate tool for the reverse of Local Walkie-Talkie: up to ten participants
send live voice to one listening host. Each has an independent encrypted WebRTC
audio connection terminating at that host, so participants never receive one
another's audio and the host can silence or remove one without affecting the rest.

The host opens a named pager, optionally protects it with a password, and listens
without microphone permission. Participants find it in Available connections or open
its invitation, enter the password when required, and Join without supplying a
name. Require approval is on for new hosts; callers wait before microphone access. Their microphone starts disabled until they hold Talk or enable the talking
toggle. A physical hold releases on blur or hiding; explicit hands-free speech
and healthy connections can continue in the background while the browser allows.
No account, installation, Python helper or recording is involved. Direct is
the default; Cloud relay is an explicit alternative selected before connecting.

Available connections appears first, before the role tabs. Join adopts the row's
verified route and starts its admission flow. A password prompt can be cancelled
without connecting or acquiring a microphone. Ordinary invitation links retain
an explicit Join action. The list is
hidden while a session is starting, active or paused. Shared network guidance
covers Wi-Fi and phone hotspots that permit direct traffic; neither bypasses
the internet requirement for discovery and pairing or guarantees reachability.

The interface calls the listening endpoint a pager. Internal inbox and room
identifiers retain their existing names so invitations, credentials and recovery
remain compatible.

## Admission and discovery

`workers/rendezvous/inbox.js` uses a separate `INBOXES` Durable Object namespace.
The public room code is SHA-256 of a random host capability. Host authorization
proves ownership of that code without putting its secret in a request URL. A
participant has a separate random capability retained in a bounded local browser cache;
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
namespace. Local network derives its scope from the page origin and public
IPv4 address or IPv6 /64. Private group requires the same random group code
on each device and works across network addresses. Its entries are excluded
from the local-network directory. A host's socket owns a lease; the directory
verifies the scope through the Inbox binding before listing trusted room name,
route, password-required and approval-required metadata. The group code permits discovery, not
password bypass, and never enters a pager invitation. Closing the host withdraws
the lease. Shared gateways can include strangers and route differences can hide
physically nearby devices, so the page does not call this a LAN scan.

## Transport and moderation

`shared/js/voice-session.js` is the native voice transport used by both voice
tools. Inbox hosts offer receive-only audio; participants answer send-only audio.
The same bounded connection-generation, ICE, backpressure, retry and idle ping/pong
logic serves both directions. Only audio SDP is accepted. Direct admits only
host ICE candidates and uses no STUN or TURN. Cloud relay admits only relay
candidates and configures iceTransportPolicy: 'relay'.
Internet pairing is required; a healthy direct voice path can outlive a brief
signaling outage, and foreground waiting participants probe at a one-second target.

The host's route is pinned in the invitation, authenticated admission and the
room's retained moderation anchor. Password validation still precedes admission
and TURN credential issuance. Joining adopts the host's mode; a mismatch
is refused, and changing the host mode creates a new pager identity. Discovery
rows expose the verified mode; Join starts admission without a separate selection.
The selector locks while starting, active or paused. Actual-route status comes
from the selected candidate pair, not from the user's choice alone.

`peer-transport.js` supplies temporary credential validation and renewal. Replies
are handled before the sequential offer queue to avoid deadlocking a pending
offer. Renewal updates peer configuration and negotiates replacement connections
in the same mode. Failure stops the session and capture; it never falls back to
another route. End and Disconnect invalidate pending replies and renewal timers.
The worker's per-service switch, participant cap and credential limits apply.

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

The introduction service carries room names, participant identifiers, derived admission
credentials, moderation and connection metadata, never audio. Older clients may
also send participant display names. Optional Cloud relay separately forwards
encrypted audio and sees addresses, timing and traffic volume, but cannot decrypt
the WebRTC audio. Cloudflare keeps seven-day
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
the caller's personal key by room and route for a later explicit Join, including
from another tab in the same browser. Disconnect stops automatic recovery
without forgetting that key. The browser cache retains 64 recently used
tool/room/route keys across both voice tools; cache eviction or clearing site
data can require approval again. Password checks still apply. The ten-approval
roster does not evict departed callers; Remove revokes their grant and frees a
slot, while End clears all grants. A full roster asks the host to start another
session instead of silently forgetting earlier approvals. If every socket
disappears, the ephemeral room is gone and a new room needs fresh approval.
A new identity needs approval. This is
session continuity, not verification of a person's identity or a permanent ban.
The Worker writes no room history to storage. Pending requests count toward capacity.
The shared inline request panel sits beside End pager and the participant list,
before the invitation, so a dismissed popup remains easy to act on.

## The shared pairing library

Socket ownership, guarded callbacks, heartbeat timers and page lifecycle events
come from `shared/js/peer-pairing.js` and `shared/js/foreground-recovery.js`.
[The pairing library guide](../../docs/paired-tools.md) describes their contract
and how another tool can use them. This tool still owns its protocol, consent,
credentials, approval and media policy; a foreground event cannot grant any of
those permissions or undo an explicit Stop.

Private group controls and connection icons come from `peer-discovery-ui.js`;
`discovery-group.js` owns code normalization, creation and group identifiers.
Changing scope closes the old directory, clears its selection and opens the
new one. A running or recovering session locks the scope until stopped. Group
codes stay in memory; saved host identities retain only the group identifier.
Reload discards a saved private host rather than republishing it to the public
scope. A same-page foreground recovery retains its original scope. Direct
sessions can be discovered across networks but still need a reachable direct
path; group discovery does not enable a relay automatically.
