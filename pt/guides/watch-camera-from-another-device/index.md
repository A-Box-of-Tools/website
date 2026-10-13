# How to watch a camera from another device

Give an old phone a second job: a nursery or pet view, an entryway camera, or a second pair of eyes under a sink. Open the camera in one browser and watch from another on a reachable home network.

[Abrir Remote Camera](https://abox.tools/pt/remote-camera/): Open a camera on one device and watch it in another browser, with optional viewer approval. Live video travels directly between them, encrypted.

Última atualização 13 October 2026

## What you need

Use two devices with browsers that support camera access and WebRTC. Both need internet access for an introduction and a network that lets them reach each other. A phone on Wi-Fi and a computer on Ethernet can work when that network permits communication between them.

Open this site's trusted HTTPS address. An ordinary HTTP address on a LAN IP cannot request a camera. If your browser or operating system asks for local-network access, allow it for this session.

## Ways to reuse an old phone at home

A spare phone can show you another room or a spot you cannot easily see. These uses need the same direct connection as any other camera session: both devices need internet for pairing and a home network that lets them reach each other.

- **Nursery checks.** Use a live view for an extra visual check from another room while you are at home. Place the phone on a stable support out of the child's reach. There is no audio or alert to tell you when attention is needed.
- **Pets in another room.** See whether a dog has settled in its bed or what a cat is doing in its favourite corner while you work elsewhere in the house.
- **An indoor entryway.** Keep an eye on the front door from another room. This is a live view while you watch, with no recording or motion alerts.
- **DIY inspections.** Aim a phone at a pipe joint under a sink, a dropped screw behind a cabinet, or a gap where you are routing cables. A laptop gives you a second pair of eyes where your head will not fit.

Keep the camera page visible and the phone awake for every use. Switching apps, hiding the page or losing the introduction connection ends the view. This tool offers live video within a reachable network; it has no internet relay for watching from elsewhere.

## Set up a DIY inspection view

1. Start the camera, connect the laptop and approve its request using the steps below. Pair the devices while the phone is still easy to reach.
2. Choose the camera facing the spot you want to inspect. Place the phone on a stable support and check the framing on the laptop. Add a lamp or flashlight if the space is dark.
3. Watch the live view while looking for the screw, checking the pipe joint or feeding a cable through the gap. Reposition the phone when the detail you need is outside the frame.
4. Keep the phone's camera page visible and its screen awake until you are finished, then choose Stop camera and end the link.

## Start on the camera device

1. Choose a viewer link name or keep the random suggestion. Leave Require my approval on to approve viewers yourself, or turn it off for automatic viewing. Then choose Start camera. Your browser chooses the initial camera.
2. Allow camera access. The page requests video only.

Your local preview appears along with a viewer link, your chosen code and a QR code. Nothing is sent as video yet. Keep this page visible and the device awake; switching away stops capture. Stop before changing the link name. Turn off listing before starting if you want to invite viewers by link only. If this browser exposes more than one camera, the Camera selector appears after permission. Choose another camera there to keep the same link and viewer connection; a brief pause may occur on devices that must release the old camera first.

## Connect the viewer and approve it

1. On the other device, optionally enter a note the source owner will recognise in Watch a camera, then choose a name under Online cameras to request a connection immediately.
2. Alternatively, open the viewer link, scan its QR code or enter the code in Watch a camera. These wait for you to choose Connect to camera.
3. If Require my approval is on, approve the expected request on the camera device. With approval off, the first accepted viewer receives video automatically.

The note is not verified identity. Recognise the person and expected request before approving. Pairing exchanges network addresses even before approval; the source approval setting controls whether an owner action is required before video. With approval off, anyone who knows the link or finds the listed camera can watch while it is free. Changes to the setting apply to new requests; an already connected viewer stays connected. One viewer receives video at a time. If playback pauses, choose Play live video; Full screen enlarges the view where supported.

## Stop when finished

Stop camera and end the link releases capture and closes the invitation. Hiding or closing the source page does the same. Disconnect on the viewer clears its live view while the source retains a local preview for another request.

A camera permission granted after Stop is released immediately. Starting again uses the name in the link-name field; choose New random name for a fresh invitation. Ending a session stops future video; a viewer can still keep anything they independently captured on their own screen.

## If the devices cannot connect

A shared Wi-Fi name does not establish reachability. Guest isolation, firewalls, blocked local address discovery, browser and OS local-network permissions, or VPN routing can block the direct connection. Stop on both devices, check permissions and the network, then try a fresh link.

Connection details reports the selected candidate types and the viewer's decoded frame count. The tool uses only host candidates, with no STUN server, TURN relay or relay fallback. A VPN, public interface or operating-system route can affect the path; host candidates do not prove that traffic stays inside a physical building.

## What the introduction service sees

Opening the page opens a discovery WebSocket to the rendezvous. Start, Connect or choosing an online camera adds a room WebSocket. The connection stays open during the session, and losing it ends the session. The service sees the code, IP addresses, times, and WebRTC setup descriptions and candidates. Setup messages are visible to that service; live video and the viewer note travel the encrypted peer connection instead.

Discovery lists opted-in camera names grouped by the public IPv4 address or IPv6 /64 seen by the service and this site’s address. This can include strangers behind shared VPNs or carrier networks, and nearby cameras may be missed. Choosing a listed name requests a connection immediately and exchanges network addresses. The source can require owner approval or accept a viewer automatically. Opening a viewer link still waits for Connect. Rooms and listings exist only on open connections. Cloudflare keeps seven-day connection logs containing metadata, never a payload. The usual site advertising scripts can read the page address, including a camera code in its fragment. A code permits a request, so source approval remains essential.

This is a browser camera view: it has no microphone or recording feature, and it does not install a system webcam for other applications.
