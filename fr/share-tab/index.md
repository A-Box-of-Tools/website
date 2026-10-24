# Share a Browser Tab

Choose a tab on your computer and let one approved viewer watch it using Direct or Cloud relay. Invite by link, network discovery or a private group. No extension, sound or remote control.

> Share a browser tab with one approved viewer using Direct or optional Cloud relay. Invite by link, network discovery or a private group. No extension, audio or remote control.

Encrypted live tab video with mandatory approval, Direct by default or explicit Cloud relay. Internet introductions carry setup metadata, never video. The relay forwards encrypted traffic and sees connection metadata. No audio, extension, recording feature or remote control.

## Tab video is **encrypted for one viewer you approve**. Direct is the default; Cloud relay is optional. Internet introduces the browsers.

You choose a browser tab in your browser's own picker and approve the viewer before video is sent. The viewer receives an encrypted live picture of that tab over Direct on a reachable local network or an explicitly selected Cloud relay, without control of your browser. Pairing uses an internet introduction service that sees setup metadata, never video or the viewer note. You can opt into listing the random invitation code for network or private-group discovery before starting; its connection mode is listed too, but the tab's title, address and picture are not. The relay forwards encrypted traffic and sees connection addresses, timing and volume, not decrypted video. Direct never falls back to the relay. No recording is made by this tool. A viewer can still capture what they see. Stop sharing, end capture in the browser, or close this sharing page to end the session.

- ✓ Approval required
- ✓ Encrypted video
- ✗ No extension
- ✗ No audio
- ✗ No remote control

## How to share a browser tab live

1. **Open the website and this sharing tool on your computer.** Keep the website in its own tab. Use a desktop browser that supports browser-tab capture, such as Chrome or Edge, and open this tool at its HTTPS address. The viewer needs only a browser with WebRTC video playback.
2. **Choose Direct or Cloud relay.** Direct uses a reachable local network such as home Wi-Fi or Ethernet. Cloud relay sends encrypted traffic through the relay service and needs internet throughout. Both devices need internet for discovery and pairing. Optionally check Show in Available connections before starting. To discover across networks, create or enter the same private group code on each device and choose Cloud relay for reachability. A private group does not make a Direct session reachable across networks.
3. **Choose one browser tab.** Click Choose a tab to share, then select the website tab in the browser's picker. A window or whole screen is refused. No audio is requested. Check the local preview before inviting anyone.
4. **Exchange the invitation, then approve the viewer.** Copy the viewer link, or have the viewer choose Find connections and Join beside your code if you opted into discovery. Direct and Cloud relay entries appear together with route and access icons. Join starts the viewing request using the displayed route. A copied invitation still waits for Request to watch, with an optional note. Approve the request you recognise before any video is sent.
5. **Browse in the selected tab, then end the session.** The viewer watches your scrolling and navigation as live video, without controlling the page or selecting its text. Keep both host tabs open and the device awake. Stop sharing here or in the browser when finished. If capture ends, starting again requires a new picker choice and a fresh invitation.

## La version longue

[How to share a browser tab live without an extension](https://abox.tools/fr/guides/share-a-browser-tab/): Show a browser tab to an approved viewer. Choose Direct on a reachable local network or an optional encrypted Cloud relay. No extension or remote control.

## Questions

### Do I need a Chrome extension?

No. A supporting desktop browser supplies its own tab-capture picker after you click Choose a tab to share. The tool uses that capture stream and WebRTC. Browser-tab capture support varies; Chrome and Edge on a computer are the intended hosts. The viewer needs no extension either.

### Can the viewer click my website or copy its text?

They receive live video, not an interactive webpage. Their clicks and typing cannot operate your browser, and text in the video is not selectable. They can take screenshots, record their own view or use their own text-recognition tools. For copyable text or files, use Share Text & Files instead.

### Can I share a window, screen, camera or sound?

This version accepts one browser tab only. It refuses window and whole-screen selections and does not request microphone or camera access. It sends no tab audio. Choose a tab in the browser's own picker; if your browser cannot confirm tab capture, this tool cannot host there.

### Does the viewer need an account on the website I show?

No. They see the pixels your browser can show, including content in your logged-in account, without receiving your cookies or login session. That also means private information visible in the chosen tab becomes visible to the approved viewer. Some protected content may appear black or be unavailable for capture.

### Can anyone with the link watch?

A viewer link permits a connection request and network-address exchange. You must approve the viewer before video is sent, and their browser must acknowledge the approval. Their introduction is not verified identity. Invitations are fresh for each session. Discovery is off by default; opting in publishes the random invitation code in the selected network or private group, without the tab's title, address or picture. Knowing a group code allows discovery but does not bypass approval.

### Can the other device find my tab without a link?

Yes. Check Show in Available connections before choosing the tab. The viewer chooses Find connections, checks the route icon and selects Join beside your random code. Browsing alone does not connect; Join requests access and you still approve before video is sent. Network discovery groups this tool's pages by public IPv4 address or IPv6 /64 subnet and website origin. Private groups instead use the same group code on each device and can discover across networks; choose Cloud relay for a connection across networks. Private sessions are not also published in the network list. Use the copied link if discovery is unavailable.

### Can several viewers watch together?

One approved viewer can watch at a time, with up to four waiting requests. A waiting or refused viewer receives no video.

### Is the video uploaded or recorded on a server?

The tool makes no recording. Direct sends encrypted video between the browsers without a relay. Optional Cloud relay forwards encrypted traffic through the relay service, which sees addresses, timing and traffic volume rather than decrypted video. The introduction service carries setup metadata, never video. A viewer can independently record what reaches their device.

### What does the connection service learn?

The rendezvous sees the invitation code, IP addresses, connection times, chosen connection mode, WebRTC descriptions and candidates. If the host opts into discovery, its selected network or private group can see the random room code and connection mode, never the captured tab's title, address or picture. Private group codes are sent to the service to authenticate their directory; viewer links omit them. Cloudflare retains introduction request metadata for seven days. Direct uses no public STUN or TURN service. Cloud relay also exposes connection addresses, timing and traffic volume to the relay service. Viewer notes and approval controls use the encrypted peer channel. The tool page explains its usual third-party scripts separately.

### Can I share without an internet connection?

Internet access is required on both devices to discover and introduce the browsers. An established Direct view may continue through a brief internet interruption while that connection survives, but this is not guaranteed. Cloud relay requires internet throughout, including renewal of its short-lived credentials. New viewers and reconnection need the introduction service. The page's saved browser cache does not provide an alternative pairing method.

### Does being on the same Wi-Fi or hotspot guarantee a connection?

No. Guest networks or hotspot client isolation can prevent Direct, as can firewalls, VPN routes and browser local-network permissions. Direct accepts only host connection addresses; that controls address types rather than physical location. You can deliberately choose Cloud relay before starting and send its invitation to the viewer, who explicitly requests to watch. A failed Direct attempt never switches automatically, and managed devices can block relay traffic too.

### Will switching tabs reveal another tab?

The capture belongs to the browser tab you selected; simply activating another tab does not choose a new source. Changes and navigation inside the selected tab remain visible. Use the browser's capture indicator to check the source, and stop the session before showing anything private.

### Can I hide the sharing page or close my laptop?

You can work in the selected website tab while the sharing page remains open. Healthy capture is kept when the page is hidden where the browser permits. A sleeping computer, closed laptop or suspended browser may interrupt or end it. Returning never silently starts a new capture after the track ends; start again and choose the tab again.

### What if the connection fails?

Keep both pages open and keep internet available. For Direct, check local reachability, client isolation, firewalls, VPN routes and browser permissions. You may instead start a new Cloud relay session and share its invitation; the viewer must explicitly request to watch using that mode. Relay failure releases capture instead of retrying through Direct. Use the viewer link if discovery misses the host. Starting again requires your action and another tab choice; the tool never silently recaptures or switches routes.

## Comment cette promesse se vérifie

- **You select the tab, then approve the viewer.** The browser opens its own capture picker after you choose to start. Select a browser tab: this tool refuses a window or whole screen, and refuses capture when the browser cannot confirm that it is a tab. The first peer connection contains only an encrypted control channel. A viewer can add an introduction, you approve the request, and the viewer acknowledges that approval before a video track is added. Only one approved viewer can watch at a time, with up to four waiting requests. A note is self-chosen text, not verified identity; recognise the expected person and request before approving. The viewer's browser stores a random approval receipt locally and presents it only over the encrypted peer channel. That browser can disconnect and rejoin this host session without another approval. Host removal revokes the receipt; stopping or starting a new session resets approval. Clearing or blocking site storage can require approval again. Normal scripts on this website can read stored receipts.
- **The viewer gets video, including anything visible in that tab.** The stream includes the chosen tab's changing picture while you scroll, navigate or open content. That can include private account pages, messages and secrets you reveal there. The viewer receives neither your login cookies nor an interactive copy of the website. Their clicks and typing cannot operate your browser. Text in the video is not selectable. The tool requests no microphone or camera access and sends no audio. It has no recording feature, but a viewer can independently capture their screen or record received video. Ending the session cannot erase anything they already kept.
- **Pairing exposes setup metadata to the introduction service.** Starting or connecting opens a WebSocket to `rendezvous.abox.tools`. The service sees the random room code, IP addresses, connection times, WebRTC descriptions and ICE candidates; these setup messages are not hidden from it. Video, viewer notes and approval decisions travel the encrypted peer connection. No room content is written to storage. Cloudflare, which runs the service, keeps connection logs for seven days containing request metadata such as the code, address and time, never video. Internet access is required for discovery and connection setup.
- **Discovery is optional and lists the code and connection mode.** Show in Available connections is off by default. Check it before starting to publish the random room code and chosen connection mode; the setting stays fixed until you stop. A viewer chooses Find connections to open a discovery connection. The listing includes no captured tab title, address, picture or viewer note. Join on a result starts a viewing request using its displayed route; host approval and the viewer's acknowledgement still come before video. The service groups this tool's pages by public IPv4 address or IPv6 /64 subnet and website origin. Shared carrier gateways or VPNs can include strangers, while different routes can hide nearby devices. This is a network hint, not a Wi-Fi scan or proof of proximity. A private group instead uses the same random group code on each device, including devices on different networks. The service receives the code to authenticate that directory; the code is not saved by this tool or included in viewer links. Private group listings do not also appear in the network list. Anyone with the group code can discover its listed sessions, but viewer approval still applies. Listings live on open connections without stored history; stopping the host withdraws its listing.
- **Direct is the default; Cloud relay needs both people's consent.** Direct configures no public STUN server or TURN relay. Only host connection addresses are accepted in setup descriptions and candidate messages. Pairing exposes network addresses to the other browser before video approval. Use a reachable Wi-Fi, Ethernet or hotspot network; guest isolation, firewalls, VPN routes and browser local-network permissions can prevent a connection. Host addresses can include public interfaces or follow a VPN route, so this setting does not prove that traffic stays inside a physical building. The tool does not create a hotspot, Wi-Fi Direct or Bluetooth connection. Cloud relay must be chosen before sharing; its invitation carries that choice and the viewer explicitly requests to watch. It uses short-lived credentials and forces relay-only connections. The relay forwards encrypted media and control traffic and sees addresses, timing and traffic volume, not decrypted video or viewer notes. It needs internet throughout and may still be blocked by a managed device. A Direct failure never silently selects the relay.
- **Stop ends capture; returning does not grant a new capture.** Stop sharing releases the captured track and closes this session. The browser's own Stop sharing control, closing the captured tab, or closing this sharing page also ends the source. Hiding this sharing page keeps healthy capture where the browser permits, so you can work in the selected tab. Sleep or browser suspension can interrupt it. An ended track is never captured again automatically: starting again requires another click and the browser's picker. A viewer disconnection releases that viewer without granting a new request access.
- **Invitations are visible to page scripts.** A session uses a fresh random link. Possessing it permits a connection attempt, and approval still controls the video. This page has the site's usual Google advertising and measurement scripts and Buy Me a Coffee button. The tool does not deliberately pass video or viewer notes to them, but scripts running in the page can read its address and same-page state, including a link code. A URL fragment is not a secret from page scripts or a guarantee against browser history. Treat the expected person's request and your approval as the admission step.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/capture.js` for the browser-tab-only capture check and cleanup, `src/session.js` for approval before media and connection ownership, and `src/protocol.js` for bounded control messages. The introduction service is published beside the tool under `workers/rendezvous/`
