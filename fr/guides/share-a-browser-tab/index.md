# How to share a browser tab live without an extension

Show someone the website you are using while you keep control of it. Your browser captures one chosen tab and sends its changing picture to the viewer. Direct uses a reachable local network; Cloud relay is an explicit option that forwards encrypted video through Cloudflare. Invite by link or nearby discovery and approve the viewer before sending video.

[Ouvrir Share a Browser Tab](https://abox.tools/fr/share-tab/): Choose a tab on your computer and let one approved viewer watch it using Direct or Cloud relay. Invite by link, network discovery or a private group. No extension, sound or remote control.

Dernière mise à jour 15 October 2026

## Connect the devices and choose the tab

Open the website in one tab and [Share a Browser Tab](https://abox.tools/fr/share-tab/) in another on your computer. Both devices need internet access for pairing. The default Direct choice also needs a network that lets them reach each other. Home Wi-Fi or Ethernet is a useful starting point. Choose Cloud relay before starting if Direct cannot reach the other device; the invitation carries that choice. Then click *Choose a tab to share* and select the website tab in your browser's own picker. Choose a browser tab, rather than a window or your whole screen: this tool refuses those broader sources. Check the local preview before sending the link.

Choose *Copy viewer link* and send it to the other person. They open it, read the connection notice, optionally add a short introduction and choose *Request to watch*. Return to the sharing page to approve the request you expect. The connection first carries only encrypted control messages; video begins after your approval and the viewer's acknowledgement. One viewer can watch at a time, with up to four requests waiting.

Work in the selected website tab while keeping the sharing page open. A current desktop Chrome or Edge browser is the intended host. The viewer needs a browser that can play WebRTC video, without an extension or an account on the website you show. Pairing needs internet for its introduction. Direct video uses host addresses without public STUN or TURN. Cloud relay instead forwards encrypted video through Cloudflare and needs internet throughout.

## Find a nearby tab without copying its link

The host can check *Show in Available connections* before choosing a tab to share. It is off by default and cannot be changed during a session. The list shows the random invitation code and connection choice, never the captured tab's title, address or picture.

On the viewer, choose *Find connections*, check the route icon and select *Join* beside the host's code to request a view. The host still approves the request, and your browser acknowledges that approval before any video arrives. Stop sharing removes the host from the list.

Nearby discovery needs internet. The service groups this tool's pages by public IPv4 address or IPv6 /64 subnet and website origin. It does not scan Wi-Fi or prove that someone is physically nearby. A shared carrier gateway or VPN can include strangers, while different routes can hide a device beside you. Confirm the code with the host and use the copied viewer link if it is missing.

## Keep internet available for pairing

Both devices need the introduction service to establish a new session. A saved copy of the page does not replace that service. An established view may continue through a brief internet interruption while its direct connection survives, but this is not guaranteed. New viewers and reconnection need internet access again.

Use a network that lets the devices communicate directly. A phone hotspot is an optional best-effort route: it needs internet for pairing and must allow traffic between the devices. Some hotspots and guest networks isolate them. This page cannot enable a hotspot or create a Wi-Fi Direct or Bluetooth link.

## What the viewer can see and do

The viewer sees a live video picture. Your scrolling, page navigation, menus and visible account content in that tab become part of the picture. Simply activating another browser tab does not select a new capture source, but anything you reveal inside the selected tab is shared. Check the browser's capture indicator and stop before opening private information there.

The viewer's clicks and typing cannot operate your browser. They do not receive your login cookies or a working copy of the website. Text in a video is not selectable, so this version cannot provide webpage copying. Use [Share Text & Files](https://abox.tools/fr/partager-du-texte/) alongside it when the other person needs a link, note or file they can copy. Some protected content may be black or unavailable in a capture.

No audio is requested or sent, including tab sound. The tool does not request camera or microphone access and makes no recording. A viewer can still record their own view or take screenshots. Ending the link stops future video; it cannot erase anything already kept.

## The invitation permits a request; your approval permits video

Sessions have fresh random links. A host may choose to publish its invitation code in the nearby list; this is off by default. Anyone who obtains an invitation can attempt a connection, including its network-address exchange. They still need your approval for video. The name or note they type is not verified identity, so recognise the person through the conversation you already have and approve only the request you expect.

A URL fragment does not hide a link code from scripts running in the same page, and a browser may keep its history. The tool page has the site's usual advertising, measurement and donation scripts. The tool does not deliberately send them video or notes, but same-page scripts can read the page's address and state. Mandatory approval remains the admission step.

## How the video reaches the other browser

A small internet introduction service matches the browsers through the random code and forwards WebRTC setup messages. It sees the code, addresses, connection times, descriptions and connection candidates. Setup is not hidden from that service. Optional nearby discovery also publishes the room code to the service's network group, without the tab title, address or picture. The video, viewer note and approval decisions do not pass through it. Cloudflare keeps connection request metadata for seven days. The service writes no room content to storage.

Direct video uses an encrypted WebRTC connection with no STUN server or TURN relay. Setup accepts only the browsers' host connection addresses, and each browser learns addresses from the other before video approval. Host addresses can include public interfaces or follow a VPN route; this policy does not prove that traffic stays inside a building.

Guest-network or hotspot isolation, firewalls, VPN routes and browser local-network permissions can block the connection. Sharing a Wi-Fi name alone does not establish reachability. Try the actual network before a demonstration or support call. Direct never falls back automatically. For Cloud relay, stop and start a new session with that choice. Cloudflare forwards encrypted video and control messages without their decryption keys, but sees addresses, timing and traffic volume. Pairing is not a promise of continuity when its internet connection disappears.

If the introduction service cannot connect, check internet access on both devices and try again. If the session has ended, start again, choose the tab and send its fresh viewer link. A new capture always requires your action and the browser's picker.

## Keep both host tabs open, then stop deliberately

Hiding the sharing page keeps healthy capture where the browser permits, which lets you use the selected website tab normally. Keep both tabs open and the device awake. Sleep, a closed laptop or browser suspension can interrupt or end the stream; this page cannot override those policies.

Choose *Stop sharing* on the tool page or use your browser's capture control when finished. Closing the sharing page or ending the captured tab also ends the source. If capture ends, returning to the page never silently captures again. Start again, choose a tab again and send the new invitation. A new viewer always needs fresh approval.
