# Remote Camera

One browser opens a camera and approves one viewer. The camera track is added
only after approval; the initial WebRTC offer has a control channel and no
media. The viewer note, hello and approval travel that encrypted channel.
This makes approval a transport boundary rather than a hidden video element.

The tool uses the existing rendezvous at `wss://rendezvous.abox.tools`.
`src/session.js` names that origin. Start and Connect each open one socket;
opening a viewer fragment only selects the form. There is no discovery.
The socket remains open during the session. Losing it ends capture or viewing.
The worker sees descriptions, candidates, room code, addresses and timing,
never media or the viewer note. Cloudflare keeps seven-day metadata logs.

Both peers configure `iceServers: []`. The shared `peer-network` part rejects
non-host trickled candidates and removes them from SDP in both directions.
A VPN, public interface or OS route can still influence host routing. This
policy requires direct reachability and has no relay fallback; it cannot
prove that a physical Wi-Fi network contains every byte.

Codes are `cam-` followed by twelve uniformly sampled base32 characters,
with 60 random bits. The protocol marker `remote-camera-v1` distinguishes the
tool from text sharing. The source holds at most four pending peer connections
and one approved viewer. Notes are bounded to 80 characters and rendered with
`textContent`; signal queues and messages are bounded too.

Capture always requests `audio: false`. `CameraCapture` invalidates pending
permission requests on Stop; a late successful grant has every track closed.
Source Stop, page hide, page close and signaling loss stop capture, peers and
socket. Viewer Disconnect closes its own peer while the source retains preview.
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

The website's capture, protocol and session tests run in CI. Functional browser
coverage lives in the sibling `A-Box-of-Tools/qa` repository. Do not run the
website suites locally; reproduce a named failure only after CI reports it.

For acceptance use two physical devices and test camera permissions, QR/link
pairing, front/back preference, app switching, device sleep and the actual
network. Two browser processes on one computer verify transport and UI but
do not establish that a particular phone or Wi-Fi network supports it.

The guide is `/guides/watch-camera-from-another-device/`.
