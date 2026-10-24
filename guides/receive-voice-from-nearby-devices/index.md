# How to receive live voice from nearby people

One host listens while several people speak from their browsers. The host names the pager and chooses Direct or Cloud relay before starting; callers need no display name. Nearby discovery helps them find it, an optional password controls admission, and the host chooses which voices to hear. Cloud relay forwards encrypted voice through Cloudflare after callers confirm that choice.

[Open the Voice Oncall](https://abox.tools/voice-oncall/): Open a pager and hear live voice from people who connect. Use Direct on your local network or choose Cloud relay over the internet, with a password and individual mute or remove controls.

Last updated 14 October 2026

## Open the listening pager

Open [Voice Oncall](https://abox.tools/voice-oncall/) on the device that will listen. Choose Host a pager, enter a recognisable pager name and optionally set a password. Keep Connection set to Direct, or choose Cloud relay before starting when direct access is unavailable. Start pager prepares speaker playback and advertises the pager; it does not request microphone permission.

Use the website's HTTPS address. There is no installation, Python helper or account. Keep the host page open and its device awake while people are connected.

If the phone interrupts the host's sound, return to the page and choose Restore sound when shown. The pager stays open while sound is paused.

## Let nearby people connect

Participants open the same tool and choose Join beside the pager in Available connections. They enter its password if required and wait for host approval. Require approval is on for new pagers and can be turned off before starting. The host can Approve or Deny in the popup or pending list; Review later closes the popup without rejecting the request. Microphone permission is requested only after admission. Callers do not need to enter a name.

The list groups pages by their public internet address and this website's origin. That often matches people using the same connection, but it does not scan Wi-Fi or prove physical proximity. VPNs and separate routes can hide a nearby pager, while a shared carrier gateway can include strangers. Use the host's copied invitation or QR code when the list does not find it. Share passwords separately from the link.

## Speak only when you intend to

A joined microphone starts with transmission stopped. Hold Talk, or focus the button and hold Space, to send live voice. Release it to stop. Start talking provides a hands-free toggle; stop it when you have finished.

Only the host receives participants' voice. Participants do not hear one another, and several simultaneous speakers can overlap at the host. Hiding a page preserves a healthy connection. A held Talk button is released, while hands-free speech can continue if the browser allows it. Phones may still pause microphones, sound or networking when locked.

An actual microphone interruption stops talking while keeping the connection open. On return, the page tries to replace an ended microphone; use Resume microphone if needed and deliberately start talking again. After page suspension, the same pager or participant identity is used to reconnect. Disconnect closes the participant session and stops recovery; End pager prevents the host from restarting.

## Choose who the host hears

The host's participant list shows each caller with a short identifier and their speaking state. Mute silences one participant in the host browser, and Unmute allows that participant to be heard again. The normal speaking page also stops transmitting when muted; unmuting does not deliberately start its microphone.

Remove silences the participant locally while the service confirms removal, then closes its connection and blocks its retained session identity. If the service refuses the remembered action, the row stays visible and the host can choose Unmute again. Session identifiers are not verified accounts, so removal cannot permanently ban a person who creates a fresh identity. A password helps control admission. End pager closes the current pager; a new pager uses a fresh invitation and resets moderation history.

## Understand the connection

A phone hotspot can work when it lets the participating devices reach one another directly. Connect the devices to the same hotspot and keep internet access for discovery and pairing. Use the pager link or QR code if the nearby list misses it. Some hotspots and managed devices block direct traffic, so test your actual devices before relying on it.

Internet access is required for discovery, admission and connection setup. That service carries pager names, temporary participant identifiers, password-derived credentials, moderation and network details, never voice. Older pages may also send participant display names. Direct audio travels on separate encrypted browser connections without STUN or TURN. Optional Cloud relay forwards encrypted audio through Cloudflare, which sees addresses, timing and traffic volume and needs internet throughout. The invitation carries the host’s route; participants see it before connecting. Direct never switches to a relay automatically.

Waiting participants check for the host with a one-second foreground target. Sleeping devices, background timers and connection limits can delay recovery. Guest isolation, firewalls, VPN routes or browser local-network permissions may prevent direct audio even when both devices are on the same Wi-Fi. Try the actual phones and computers you intend to use.

If your goal is for one person to speak to many listeners, use [Local Walkie-Talkie](https://abox.tools/walkie-talkie/) instead. Voice Oncall receives many separate voices at one host.
