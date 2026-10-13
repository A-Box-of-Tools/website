# Watch a camera — from another device on your local network

Open a camera on one device and watch it in another browser, with optional viewer approval. Live video travels directly between them, encrypted.

> Watch a phone or computer camera from another browser on a reachable local network. Direct encrypted video, optional viewer approval, camera switching, no microphone or recording.

Camera video travels directly between connected browsers, with viewer approval on by default. Internet rendezvous carries setup metadata, never video; no microphone or recording feature.

## Camera video goes **directly to one viewer**. You choose whether approval is required. Internet introduces the browsers.

Your camera video goes directly to one accepted viewer over an encrypted WebRTC connection. Our introduction service carries connection negotiation, never the video or the viewer's note. There is no recording feature and no microphone request. Stop, hide or close the camera page and capture ends. Internet access is required for the introduction; pairing also reveals network addresses to the other browser. Viewer approval is on by default; turning it off lets anyone who knows your link or finds your listed camera watch while it is free.

- ✓ Camera only
- ✓ Optional viewer approval
- ✓ Direct encrypted video
- ✗ No recording
- ✗ No internet relay

## How to watch another device's camera

1. **Start on the camera device.** Open this HTTPS page on the phone or computer whose camera you want. Choose a viewer link name or keep the random suggestion, choose Start camera, and allow camera access. Your browser chooses the initial camera. After permission, a Camera selector appears if this browser exposes more than one camera; use it to switch without ending the invitation. No microphone is requested.
2. **Invite the viewing device.** Open the viewer link or scan the QR code on the other device. You can also choose a name under Online cameras, or enter the code in Watch a camera. Both devices need internet for pairing and a network that lets them reach each other.
3. **Connect the viewer.** Choosing an online camera requests a connection immediately. For a viewer link or manually entered code, choose Connect to camera. If Require my approval is on, approve the request you recognise on the source. With it off, the first accepted viewer connects automatically. Live video then appears in the viewer; use Play live video if the browser pauses playback.
4. **Keep the source visible, then stop.** Keep the source page visible and its device awake while watching. Stop camera and end the link releases the camera. If a viewer is connected or connecting, confirm Stop sharing or choose Keep sharing to cancel. Switching away from the source page also stops it.

## The longer version

[How to watch a camera from another device](https://abox.tools/guides/watch-camera-from-another-device/): Reuse a phone for nursery checks, pets, entryways or DIY inspections. Connect two browsers on a reachable home network and approve the live viewer.

## Also in the box

- [Video Compressor](https://abox.tools/compress-video/): Say how big it may be. The tool works out the rest, and measures the result before you get it.
- [MP4 Converter](https://abox.tools/convert-to-mp4/): Whatever came off the screen recorder, the ripper or the camera, as H.264 and AAC in an MP4. Copied where it can be, re-encoded only where it must.
- [Video Rotator](https://abox.tools/rotate-video/): A quarter turn, a half turn, the other way. With header rotation, the picture frames stay unchanged.
- [Images to Video](https://abox.tools/images-to-video/): Turn a folder of images into a video.

## Questions

### Must both devices use the same Wi-Fi?

They need a route to each other. Wi-Fi and Ethernet on the same reachable local network can work together. A shared Wi-Fi name alone does not establish reachability: guest isolation, firewalls, VPN routing and browser permissions can block it.

### Does it work without internet?

No. The introduction uses our public rendezvous and its connection stays open during the session. Video travels directly between the browsers, with no configured internet relay. Losing the introduction connection ends the session.

### Does this turn my phone into a webcam for meeting apps?

It provides a live view in another browser. It does not install a system webcam or make that camera available to desktop meeting applications.

### Why must the camera page use HTTPS?

A browser requires a secure context and camera permission. Use the site's trusted HTTPS address. Ordinary HTTP on a local-network IP cannot request a camera; localhost is a development exception on the same computer.

### Can anyone with the link watch?

With Require my approval on, a link or code permits a request and network-address exchange; the owner must approve before video. Turn approval off to let anyone with the link or a listed camera name watch while the camera is free. The optional viewer note is not proof of identity, so approve only the person and request you expect.

### Can several devices watch at once?

One viewer at a time. Disconnect the current viewer before another can watch. Up to four peer connections may be pending; further requests are refused while busy.

### Why did sharing stop when I changed apps?

Hiding or closing the source page deliberately stops capture and ends the link. Keep it visible and awake. Start again to create a new invitation after returning.

### Can I change cameras while sharing?

After camera permission, the Camera selector appears when this browser exposes multiple video devices. Choose another to keep the same invitation and viewer connection. Some devices need a brief pause while the old hardware is released. If switching fails, the tool keeps or restores the previous camera where possible; if neither camera can be opened, sharing ends and you can start again.

### Does it send sound or record video?

The tool requests video only and has no recording feature. It does not ask for microphone access. A viewer can independently capture their screen, as with anything they can see.

### Why can pairing fail on the same Wi-Fi?

Guest networks and client isolation can separate devices. Firewalls, blocked local address discovery, OS and browser local-network permissions, or VPN routes can also prevent a direct connection. Stop on both devices, check permissions and network reachability, and try a fresh link. The tool will not switch to an internet relay.

## How the privacy claim is verifiable

- **You choose whether viewers need approval.** The first WebRTC connection carries only an encrypted control channel. Require my approval is on by default. Turning it off accepts new viewers automatically: anyone who knows the link or finds the listed camera can watch while it is free. The camera track is added only after the viewer acknowledges acceptance, and only one viewer receives it. Changing the setting applies to new requests, not waiting requests or an already connected viewer. Video uses the browser's encrypted media transport directly between devices. It never passes through the rendezvous. A viewer can still capture their own screen; ending the link stops future video and cannot remove anything they already kept.
- **The introduction requires internet and exposes connection metadata.** Opening this page opens a discovery WebSocket to `rendezvous.abox.tools`. Start camera, Connect or choosing an online camera adds a room socket that stays open while the session is active. The service sees the code, IP addresses, connection times, and WebRTC setup descriptions and candidates; those setup messages are not encrypted from the service. It does not receive video or the viewer note. Discovery lists only opted-in camera names, grouped by the public IPv4 address or IPv6 /64 seen by the service and the page origin. Shared VPNs or carrier networks can include strangers; nearby devices can be missed. Turn off listing before starting for a link-only camera. Choosing a listed name requests a connection immediately. The source chooses whether its owner must approve the request. Rooms and listings exist only on open connections. Cloudflare keeps connection logs for seven days: the code, address and time, never a payload.
- **A direct connection shares addresses before video is approved.** Opening a viewer link selects the viewing form and waits. Connect or choosing an online camera asks the rendezvous to introduce the devices, and each browser then learns addresses offered by the other. Approval controls video, not that address exchange. The name you enter is a note for the source, not verified identity. Recognise the person and expected request before approving. If you turn approval off, a viewer can receive video without an owner action.
- **Host candidates are a connection policy, not proof of a building.** No STUN server or TURN relay is configured, and non-host candidates are removed from descriptions and trickled messages. A VPN, public interface or operating-system route can affect where host addresses lead. Use a reachable local network; guest isolation, firewalls and local-network permissions may prevent the connection. There is no relay fallback.
- **Stop releases the camera and ends the invitation.** Stop on the source closes its tracks, peers and introduction connection. If viewers are connected or connecting, choosing Stop first asks you to confirm; Keep sharing leaves the camera and connections running. Hiding or closing its page does the same, as does losing the introduction connection, without waiting for confirmation. A permission granted after Stop is immediately released. Disconnect on the viewer ends its connection while the source keeps its local preview available for a new request. Codes and notes are not saved by this tool.
- **The site frame still loads its usual third parties.** Advertising and measurement scripts come from Google, and the donate button from Buy Me a Coffee. The tool does not pass them video or notes. Third-party scripts can read the page address, which includes the camera code in a viewer link. Keep approval on by recognising the intended viewer. With approval off, knowing a code permits viewing while the camera is free, so leave approval on when you want to control admission.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/capture.js` for permission cancellation and track cleanup, and `src/session.js` for viewer acceptance before video, camera replacement and host-only connection policy. The introduction service source is `workers/rendezvous/worker.js` in the same repository
