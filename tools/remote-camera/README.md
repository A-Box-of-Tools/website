# Remote Camera

Online cameras appear at the top of the idle page, above sharing and manual
connection. Choosing a listed camera requests a connection immediately. Start
or Connect focuses its active section until Stop or a failure returns
to the idle page. A viewer link only fills and focuses the code field; it does
not start pairing or ask for camera permission. Starting the source clears a
viewer fragment so the URL no longer suggests a different camera.

One browser opens a camera and accepts up to eight viewers. Approval is on by default;
turning it off accepts new requests through the same encrypted acknowledgement
flow. Video and enabled audio are added only after that acknowledgement; the initial WebRTC offer has a control channel and no
media. The viewer note, hello and approval travel that encrypted channel.
This makes approval a transport boundary rather than a hidden video element.

A new manual request opens a native review dialog while the camera page is
visible. Review later receives initial focus; it and Escape close the dialog
without approving or denying anything. The same request stays in Viewer
requests, whose per-viewer actions remain authoritative. Each new pending
request is offered once: arrivals while a dialog is open stay in the list
without replacing its current request or reopening it after dismissal. A new
arrival can open a dialog once the page is idle again.
Requests received while hidden or while Stop confirmation is open remain in
the list without opening a popup on return. The note is rendered
with `textContent`, never HTML. Approval and denial use the same session APIs
and camera-change/recovery guards as the list. Request withdrawal closes its
dialog; hiding the page, pagehide, Stop and Stop confirmation also dismiss it
without granting approval. The two dialogs never overlap.

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
open during the session. A lost room socket no longer closes an already
approved, connected peer with live video and an open encrypted control channel.
The source retries its invitation with the same code after 2, 4, 8, 15 and 30
seconds, with each handshake bounded at 20 seconds and confirmed by a pong.
Recovery republishes a fresh discovery lease. Unfinished peers are closed;
the viewer never rejoins the room under a new identity. If retries fail, an
established view continues, but new invitations need Restore pairing. An idle
source with no established peer ends after the retry budget is exhausted.
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
tool from text sharing. The source holds at most four unfinished peer connections
alongside up to eight accepted viewers. Each viewer is approved independently. Notes are bounded to 80 characters and rendered with
`textContent`; signal queues and messages are bounded too.

Capture defaults to `{video: true, audio: false}` so the browser chooses its camera.
The source may opt into microphone audio before starting. That choice requests
`audio: true`; it is locked while sharing, and Stop releases both track kinds. `CameraCapture` invalidates pending
permission requests on Stop; a late successful grant has every track closed.
After permission, enumerateDevices exposes a selector when several video
devices exist. Camera switching holds new approvals and video acknowledgements
until the selected capture is ready, replaces every active video sender track without
renegotiating, and keeps the invitation, discovery lease and peer connections.
Replacement waits for all senders; a failure rolls surviving senders back before
the capture is adopted. A departing viewer does not cancel a switch for the others.
A live microphone track is carried into each video replacement and rollback.
Video-only acquisition and replacement cleanup leave that microphone running.
If native capture interrupts the microphone, it is disabled until the owner
chooses Resume microphone. Ended opted-in audio can be reacquired alongside
video and replace every existing audio sender without granting audio to older
video-only peers. Automatic recovery adopts the new microphone disabled;
healthy background audio and ordinary camera switching keep the live mic.
Stop invalidates pending microphone recovery as well as video acquisition.
The old video stays alive until adoption where hardware permits. Exclusive
devices release that video and retry once; a failed retry attempts to restore the old
device. Stop invalidates both acquisition and replacement, including late
streams. A failure with no usable camera ends the invitation.

The approval switch applies to new requests. Waiting manual requests never
inherit automatic acceptance, and an accepted viewer remains connected when
the setting changes. Each accepted slot is reserved synchronously before its
acknowledgement; the separate four-pending cap and busy refusals remain in place.
Viewer Disconnect and a host's Disconnect this viewer action close only that
peer. Removing one viewer leaves the shared capture and other peers running.
Ordinary tab hiding keeps a healthy capture, peer connection and room socket.
The browser can still mute or end a camera when a phone locks, and may suspend
network traffic and JavaScript too; the page cannot guarantee background video.
Temporary track mute keeps the pairing and waits for native unmute. An ended
track keeps the chosen code, camera device and approval settings; on returning
the page attempts one recovery, replacing every accepted viewer's sender track
without changing its approval. Resume camera offers a gesture after a failed
attempt. No new camera request starts while the page is hidden, and a pending
request is invalidated if the page hides before it completes.

BFcache page suspension releases capture and peers but retains the chosen
camera identity for visible recovery. A healthy viewer can keep playing while
its tab is hidden; returning retries native playback and retains the existing
Play live video fallback. Losing only introductions preserves an already
approved, negotiated video connection and its source capture. Room's host-gone
and viewer-leave signals describe socket loss, not direct-peer termination.
Foreground host recovery reopens the same named room without rebuilding media;
only one attempt runs at a time, with five bounded automatic retries before the
Restore pairing action is required. A service pong confirms recovery, because
refused WebSocket upgrades also produce an open event. A still-connected viewer
does not silently join another host. Newly connected viewers need fresh
approval; viewer notes are never treated as admission credentials.

Source Stop sends the existing direct ended control before closing capture,
peers and sockets. Navigation and page close also release resources. Initial
pairing failure still releases capture and offers Resume camera with the same
chosen identity. There is no worker or room-protocol change.

Manual Source Stop asks for confirmation while any viewer peer is
attached, including before its approval request arrives. Keep sharing or Escape
leaves capture, invitation and connections intact. The native dialog does not
block lifecycle handling: suspension and page close cancel it and clean up
immediately. Viewer Disconnect closes its own peer
while the source retains preview.
A best-effort screen wake lock is released when hidden or on cleanup, including
a late grant, and is requested again only for a visible active camera.

Camera access requires trusted HTTPS and user permission. Video uses native
WebRTC encryption, with no recording feature. This provides a browser view,
not an OS webcam for meeting apps. Both pages must remain open; background
capture depends on the source browser and operating system. A viewer can
independently capture their screen.

## Multiple viewers and bandwidth

The host chooses a shared video budget of 1, 2, 4, 6 or 10 Mbps, defaulting to
6 Mbps. `src/bandwidth.js` divides it across accepted reservations, with a
1.5 Mbps ceiling per video sender. The browser's congestion control can reduce
the actual rate further. This is a video ceiling, not a measurement of total
Wi-Fi capacity; microphone traffic and network overhead are additional.
At 1 Mbps, four new viewers may be accepted; the higher choices allow eight.
Lowering a budget does not remove existing viewers, but new admissions wait
until the accepted count falls below its resulting limit.

New senders start with a capped encoding after their own acceptance ACK.
Existing senders are rebalanced before a new video starts. Sender parameter
updates are serialized and stale peers are ignored. Unsupported bitrate limits
leave native congestion control in place and produce an explicit host status;
the selected shared ceiling is not promised on that browser. No connection
speed test, STUN/TURN service or extra network request is introduced. The
[WebRTC encoding parameters](https://www.w3.org/TR/webrtc/#dom-rtcrtpencodingparameters-maxbitrate)
define that ceiling excluding transport overhead and permit lower rates.

The host lists accepted viewers and can disconnect them independently. Test
several native peers at once, separate ACK timing, per-sender caps, a budget
change, one viewer leaving, introduction recovery and a camera switch across
all viewers. One peer failure must not stop another accepted view.

## Audio and viewer alerts

New viewers advertise `receiveAudio: true` in their existing hello. Hosts send
enabled audio only to such viewers after acceptance is acknowledged, so older
video-only tabs keep working. Received video and audio share one stable stream;
audio arrival or loss does not restart video. The local source preview stays
muted. The viewer tries audible playback automatically when a live audio track
arrives, falling back to muted video when the browser requires a gesture.
Unmute audio retries playback; a deliberate Mute is kept through camera
switches and stream updates. Playback promises are invalidated by a newer
choice or Disconnect. Sound detection always analyzes the received track
independently of the video's playback mute.

Mute, Unmute and Full screen sit on the video frame. Fullscreen targets the
frame so the controls remain reachable, with native video fullscreen as a
fallback on browsers that expose only that API. Viewer name, connection,
playback and notification descriptions use the same accessible help tooltips
as the host controls.

`src/alerts.js` checks notification support and an active registration at the
exact tool scope without waiting indefinitely for `serviceWorker.ready`. It
uses service-worker notifications, including on browsers that cannot construct
`Notification` directly. Permission is requested only when the viewer enables
an alert. Motion compares small grayscale frames; sound analyzes received audio
through a Web Audio analyzer with no speaker output. Sustained thresholds,
hysteresis, cold baselines and a shared cooldown reduce repeat notices. Neither
detector records or sends data. Disconnect invalidates pending permission work,
closes its audio context, clears timers and closes only its own notifications.
These notices contain generic activity text, never frames, audio or room names.

The viewer page must remain open and runnable. Browser freezing, device sleep,
lighting changes and threshold choices can miss activity or trigger false
alerts; this is not a safety monitor. Notification controls remain hidden when
unsupported; sound controls also require Web Audio. iOS notification support
may require a Home Screen app. Browser behavior follows
[MDN notifications](https://developer.mozilla.org/en-US/docs/Web/API/Notification/Notification),
[WebKit Home Screen support](https://webkit.org/blog/13878/), and
[the browser page lifecycle](https://developer.chrome.com/docs/web-platform/page-lifecycle-api).

The tracked Permissions-Policy now allows same-origin microphone requests for
preview hosts. GitHub Pages ignores `_headers`: before releasing this feature,
apply the matching `microphone=(self)` directive to the existing Cloudflare
response-header rule. This PR does not change the live account rule.

## Connection reports

Connection details and troubleshooting offers Copy connection report and
Download JSON on both devices. After a failed attempt, collect a report from
each tab before reloading. Stop and failure retain the bounded report in
memory; subsequent attempts append evidence without reopening a session.
Clipboard refusal reveals a labelled readonly JSON field, focuses it and
selects its content for manual copying. A failed download uses the same
fallback. JSON is serialized only on an explicit copy/download action, so
live events never replace a selected report.

`main.js` passes the shared `createDiagnostics` collector to `CameraSession`.
Exported reports identify the tool with the static `remote-camera` slug and
take their tool version from the built module's `?v=` hash. The shared part
retains only allowlisted browser/platform versions, relative timings,
connection stages and states, aggregate candidate/transport counts, and safe
error names and operation keys. It excludes raw user agents, addresses,
candidate strings, SDP, pairing codes, viewer notes, media and exception
messages. Its attempt/event/error limits bound retained evidence. It uses no
storage, automatic upload or additional network request; only the user's
copy/download action exports the report. The report describes where an
attempt reached, not a proven cause such as Wi-Fi isolation.

## Checking a change

Host setup descriptions use inline help beside the link name, approval choice
and microphone choice. They reuse Share Text's `wireHelpTooltip` controller for
hover, keyboard focus, touch pinning, Escape and outside-click dismissal. The
approval explanation still updates with the chosen policy inside its tooltip.
Check viewer tooltips with keyboard, hover and taps too. With an accepted live
view, close the room sockets and confirm that media keeps advancing, the source
republishes after recovery, camera switching still works and Stop releases all
resources. Before approval or live video, transport failure must still close
the unfinished attempt. Confirm sound notices while playback is muted, and
muted video plus an Unmute control after an audible autoplay rejection.

Check that a new request focuses Review later, dismissal and Escape preserve
the pending request without media, and another arrival cannot replace an open
dialog. Approve and deny from both the dialog and request list; withdraw the
current request and stop or hide the source while reviewing it. Confirm that
Stop confirmation and approval never overlap. After connection failure and
after Stop, copy and download reports from both devices. Deny clipboard access
and verify the labelled JSON fallback stays selectable. Report exports must
exclude the actual code, viewer note, network addresses and raw error text.

Build the scoped page with `python build.py --only remote-camera --locale en
--quiet`, then use the built page. A complete check joins a second browser,
observes zero senders before approval, denies a request, approves a fresh
request and observes video frames advancing. Confirm that Stop releases all
tracks and clears the viewer, and that a late camera grant after Stop closes.
Check that manual Stop asks while a viewer is connecting, waiting for approval
or watching; Keep sharing and Escape preserve the same invitation and stream.
Hide the source while the confirmation is open and verify that the existing
capture and pairing are retained. Check native track mute and unmute, ended
capture followed by visible recovery, and a failed recovery followed by Resume
camera. The code, chosen camera and live viewer approval must remain unchanged
when the original peer survives. Stop during a pending recovery must close a
late grant and prevent every later visibility event from reopening capture.
With no viewer, Stop ends sharing directly.

The website's capture, protocol and session tests run in CI. Functional browser
coverage lives in the sibling `A-Box-of-Tools/qa` repository. Do not run the
website suites locally; reproduce a named failure only after CI reports it.

For acceptance use two physical devices and test camera permissions, QR/link
pairing, browser camera selection, mid-share camera switching, both approval
modes, custom names, discovery and link-only mode, app switching, device sleep and the actual
network. Two browser processes on one computer verify transport and UI but
do not establish that a particular phone or Wi-Fi network supports it.

The guide is `/guides/watch-camera-from-another-device/`.

## The shared pairing library

Socket ownership, guarded callbacks, heartbeat timers and page lifecycle events
come from `shared/js/peer-pairing.js` and `shared/js/foreground-recovery.js`.
[The pairing library guide](../../docs/paired-tools.md) describes their contract
and how another tool can use them. This tool still owns its protocol, consent,
credentials, approval and media policy; a foreground event cannot grant any of
those permissions or undo an explicit Stop.
