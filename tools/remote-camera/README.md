# Remote Camera

Online cameras appear at the top of the idle page, above sharing and manual
connection. Choosing a listed camera requests a connection immediately. Start
or Connect focuses its active section until Stop or a failure returns
to the idle page. A viewer link only fills and focuses the code field; it does
not start pairing or ask for camera permission. Starting the source clears a
viewer fragment so the URL no longer suggests a different camera.

One browser opens a camera and accepts one viewer. Approval is on by default;
turning it off accepts new requests through the same encrypted acknowledgement
flow. The camera track is added only after that acknowledgement; the initial WebRTC offer has a control channel and no
media. The viewer note, hello and approval travel that encrypted channel.
This makes approval a transport boundary rather than a hidden video element.

The tool uses the existing rendezvous at `wss://rendezvous.abox.tools`.
`src/session.js` names that origin. Start and Connect each open one socket;
opening a viewer fragment only selects the form. The page also opens a
discovery socket using the shared `peer-discovery` part. Hosts are listed by
default, with a link-only switch; publication requires the room's live lease
and an explicit `remote-camera` namespace acknowledgement. Discovery groups
public IPv4 addresses or IPv6 /64 networks and page origins, as Share Text does.
Choosing a listed name starts the same viewing request as Connect, including
network-address exchange and the source's approval policy. Modified clicks
retain the viewer link; opening it still waits for Connect. Repeated clicks
cannot start another request while viewing is active. The room socket remains
open during the session. Losing it ends capture or viewing.
The worker sees descriptions, candidates, room code, addresses and timing,
never media or the viewer note. Cloudflare keeps seven-day metadata logs.

Both peers configure `iceServers: []`. The shared `peer-network` part rejects
non-host trickled candidates and removes them from SDP in both directions.
A VPN, public interface or OS route can still influence host routing. This
policy requires direct reachability and has no relay fallback; it cannot
prove that a physical Wi-Fi network contains every byte.

Random suggestions are `cam-` followed by twelve uniformly sampled base32
characters, with 60 random bits. A custom name uses the same normalization
and 64-character alphabet as Share Text, supplied by `room-names`. Room and
discovery requests use `tool=remote-camera`, keeping equal names in the two
tools independent. Deploy the updated worker before relying on discovery;
an older worker leaves discovery unavailable and direct links usable. Both
camera tabs must reload after the namespace update. The protocol marker `remote-camera-v1` distinguishes the
tool from text sharing. The source holds at most four pending peer connections
and one approved viewer. Notes are bounded to 80 characters and rendered with
`textContent`; signal queues and messages are bounded too.

Capture requests `{video: true, audio: false}` so the browser chooses its camera. `CameraCapture` invalidates pending
permission requests on Stop; a late successful grant has every track closed.
After permission, enumerateDevices exposes a selector when several video
devices exist. Camera switching holds new approvals and video acknowledgements
until the selected capture is ready, replaces the active sender track without
renegotiating, and keeps the invitation, discovery lease and peer connection.
The old capture stays alive until adoption where hardware permits. Exclusive
devices release it and retry once; a failed retry attempts to restore the old
device. Stop invalidates both acquisition and replacement, including late
streams. A failure with no usable camera ends the invitation.

The approval switch applies to new requests. Waiting manual requests never
inherit automatic acceptance, and an accepted viewer remains connected when
the setting changes. One active slot is reserved synchronously before its
acknowledgement; the four-pending cap and busy refusals remain in place.
Source Stop, page hide, page close and signaling loss stop capture, peers and
socket. Manual Source Stop asks for confirmation while any viewer peer is
attached, including before its approval request arrives. Keep sharing or Escape
leaves capture, invitation and connections intact. The native dialog does not
block lifecycle handling: page hide, page close, capture failure and signaling
loss cancel it and clean up immediately. Viewer Disconnect closes its own peer
while the source retains preview.
A best-effort screen wake lock is released on cleanup, including a late grant.

Camera access requires trusted HTTPS and user permission. Video uses native
WebRTC encryption, with no recording feature. This provides a browser view,
not an OS webcam for meeting apps. Both pages must remain open and the source
visible. A viewer can independently capture their screen.

## Checking a change

Build the scoped page with `python build.py --only remote-camera --locale en
--quiet`, then use the built page. A complete check joins a second browser,
observes zero senders before approval, denies a request, approves a fresh
request and observes video frames advancing. Confirm that Stop releases all
tracks and clears the viewer, and that a late camera grant after Stop closes.
Check that manual Stop asks while a viewer is connecting, waiting for approval
or watching; Keep sharing and Escape preserve the same invitation and stream.
Hide the source while the confirmation is open and verify that cleanup happens
without accepting the confirmation. With no viewer, Stop ends sharing directly.

The website's capture, protocol and session tests run in CI. Functional browser
coverage lives in the sibling `A-Box-of-Tools/qa` repository. Do not run the
website suites locally; reproduce a named failure only after CI reports it.

For acceptance use two physical devices and test camera permissions, QR/link
pairing, browser camera selection, mid-share camera switching, both approval
modes, custom names, discovery and link-only mode, app switching, device sleep and the actual
network. Two browser processes on one computer verify transport and UI but
do not establish that a particular phone or Wi-Fi network supports it.

The guide is `/guides/watch-camera-from-another-device/`.
