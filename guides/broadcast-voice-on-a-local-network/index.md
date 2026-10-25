# How to broadcast voice on a local network

One person speaks and everyone else listens through a browser. Start on this website and list the channel nearby or share its listener link. Direct sends voice between devices on a reachable local network. The host can instead choose Cloud relay; listeners confirm before encrypted voice passes through Cloudflare.

[Open the Local Walkie-Talkie](https://abox.tools/walkie-talkie/): Start a named channel, then hold to talk or speak hands-free. Connect directly on your local network, or choose Cloud relay for listeners over the internet.

Last updated 14 October 2026

## Start on the speaking device

Open Local Walkie-Talkie on this website and enter a Channel name that listeners will recognize. Keep Make this channel discoverable selected to list it, or clear it to invite people only by link. Keep Connection set to Direct, or choose Cloud relay before starting when the devices cannot connect directly. Choose Start channel and allow microphone access. A supported phone or computer can host through the HTTPS page. There is no Python helper, download or account. For the most reliable connection, keep the host page visible and its device awake when possible.

## Approve listeners

Require approval is on for new channels. Each new listener waits before receiving audio. Approve or Deny in the request popup or list; Review later closes the popup and keeps the request pending. You can turn approval off before starting. A previously approved identity can recover in the same room; ending the broadcast prevents recovery.

## Find a channel or invite listeners

Listeners open Local Walkie-Talkie, check a channel’s route icon in Available connections, then select Join on its row. The list updates automatically. Browsing alone does not connect; joining is receive-only and never requests microphone access. If the channel is not listed, share its listener link or QR code instead; opening a Direct invitation starts connecting automatically. A Cloud relay invitation first shows its connection choice and waits for Join. If the browser blocks sound, Unmute starts it. Once connected, listeners use Mute/Unmute and Leave.

Both sides need internet access for discovery and pairing. The service carries channel names, listener invitations, connection details and status; live voice takes a separate encrypted route from the host to each listener. Direct is the default and never switches routes automatically. Cloud relay is an explicit alternative that forwards encrypted audio through Cloudflare; it sees addresses, timing and traffic volume and needs internet throughout. Both sides use the host’s chosen route.

Nearby discovery groups browsers by their public IPv4 address or IPv6 /64 and this website's origin. It does not scan Wi-Fi or prove that a listed channel is on your physical network. Shared gateways can include strangers; VPNs and different internet routes can hide devices beside you. Use the listener link when discovery misses a channel.

## Hold to talk

Hold the Talk button with touch or a mouse, or focus it and hold Space. Release to stop sending voice. For hands-free speech, choose Start talking: voice keeps transmitting until you choose Stop talking. Check the displayed talking state before setting the device down. Microphone mute overrides both modes. Up to ten listeners may connect, including waiting connections; begin with a small group and check the devices and network you intend to use.

## Recover a lost host

Waiting receivers check host availability in place with a one-second foreground target and keep their mute choice. Working direct voice can continue during a brief pairing-service outage. Background browsers, service connection limits and sleeping devices can delay recovery.

Hiding the page keeps a healthy connection open. A held Talk button is released; hands-free speech started with Start talking can continue while the browser allows it. Phones may still suspend the microphone, playback or network when locked. An actual microphone interruption stops talking while keeping the channel open. On return, the page tries to replace an ended microphone; choose Resume microphone if needed. After page suspension, it tries to restore the same channel and invitation; choose Resume channel if the browser requires an action. Talking stays off after an interruption until you start it again.

Temporary per-tab browser storage lets a reload retain the channel too; when storage is unavailable, a host reload creates a new invitation. End broadcast removes the listing and deliberately stops the session. It prevents automatic resumption, and the next Start creates a fresh invitation. Leave stops one listener and its retries.

## Share invitations carefully

A listener invitation lets its holder request access using the host’s chosen route. With Require approval on, the host must approve before any audio is received. Starting with Make this channel discoverable selected intentionally shares the channel name and listener invitation key with its discovery group. Anyone who finds it can request to join; approval still applies. Clear that option before starting if you want to share invitations only by link. The host's separate key stays in its browser tab and is not shared. For copied links, listener keys travel in the fragment after the # character, then in secure pairing messages. The service keeps temporary room state on open connections; Cloudflare retains seven-day invocation metadata logs, never microphone audio.

The website's regular advertising, measurement and donate-button scripts run on this page. The tool does not hand them audio, but page scripts can read the address and browser storage. Removing an invitation fragment where storage is available reduces its later exposure; it does not isolate those scripts. Trust the page before granting microphone access. Recipients can independently record what they hear.

## Check reachability

A phone hotspot can work when it lets the participating devices reach one another directly. Connect the devices to the same hotspot and keep internet access for discovery and pairing. Use the listener link or QR code if the nearby list misses the channel. Some hotspots and managed devices block direct traffic, so test your actual devices before relying on it.

Guest Wi-Fi can isolate devices. Firewalls, browser local-network permissions, VPNs and operating-system routes can affect direct connectivity even when two devices appear to share Wi-Fi. Direct uses host candidates only and no STUN or TURN server; that limits the route without proving a physical network boundary. Try the actual phones and computers before relying on the channel.
