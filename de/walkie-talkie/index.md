# Local Walkie-Talkie

Start a named channel, then hold to talk or speak hands-free. Connect directly on your local network, or choose Cloud relay for listeners over the internet.

> Broadcast voice to up to ten receive-only browsers. Direct local connections or optional Cloud relay, with push to talk, hands-free speech and private group discovery.

Keep Direct for reachable devices, or choose Cloud relay before starting. Choose Start channel, allow microphone access and share the listener link or QR code. Relay invitations ask listeners to confirm Join. Approve requests in the popup or pending list; Review later keeps them pending. Internet is required for pairing and for relayed audio.

## **Direct voice by default.** Choose Cloud relay when needed. No recording.

Host and listen in your browser without installing anything. Internet access introduces the devices and helps them reconnect. Each listener has a separate encrypted WebRTC connection to the host. Direct uses no relay; Cloud relay sends encrypted audio through Cloudflare when both devices choose that route. New channels require host approval before listeners can hear audio. You can turn approval off before starting. Share invitations carefully.

- ✓ One host, ten listeners
- ✓ No installation
- ✓ Receive-only listeners
- ✗ Direct or optional Cloud relay

## How to open a local voice channel

1. **Start directly on this website.** On the speaking device, keep Direct or explicitly choose Cloud relay, then choose Start channel and allow microphone access. Use the website's HTTPS address. There is no Python helper, download, account or installation.
2. **Invite listeners.** Listeners check the route icon beside your channel in Available connections, then select Join on its row. For discovery across networks, enter the same private group code on both devices before the host starts. The group code does not change Direct reachability; choose Cloud relay on the host when a direct path is unavailable. Browsing alone does not connect. You can also share the listener link or QR code. Direct invitations join automatically; Cloud relay invitations require Join. Listening never asks for microphone access. Both sides need internet access for discovery and pairing, and Cloud relay also needs it for audio.
3. **Hold to talk or speak hands-free.** Hold the Talk button, or focus it and hold Space. Release, leave the page or switch focus to release a physical hold. For hands-free speech, choose Start talking; it can continue with the page hidden while the browser allows. Choose Stop talking to stop, and check the displayed talking state before setting the device down. Microphone mute overrides both modes, and a microphone interruption clears hands-free speech. Listening starts automatically where permitted; Unmute starts sound if the browser blocks playback.
4. **Recover or end the channel.** Receivers retry a temporarily missing host in place. If the microphone is interrupted, talking stops while the channel remains connected. Return to the page or choose Resume microphone to replace an ended microphone; then deliberately start talking again. If the page was suspended, it attempts to restore the same channel silently, with Resume channel as a fallback. End broadcast prevents automatic resumption and creates a fresh invitation on the next Start; Leave closes one listener. Keep the pages open; screen-lock continuity is not guaranteed.

## Die ausführliche Fassung

[Stimme im lokalen Netzwerk übertragen](https://abox.tools/de/ratgeber/stimme-im-lokalen-netzwerk-senden/): Einen Sprachkanal im Browser starten und Zuhörer per Link oder Umgebungssuche einladen. Direkt ist der Standard; Cloud-Relay leitet Sprache nach ausdrücklicher Bestätigung verschlüsselt über Cloudflare weiter.

## Fragen

### Do I need Python or a download?

No. The host starts directly in this website and listeners open its link. Only the host requests microphone access.

### Does voice go through an internet server?

Direct sends voice between the browsers without a relay. If the host chooses Cloud relay and the listener confirms Join, Cloudflare forwards encrypted WebRTC audio and sees connection metadata and traffic volume, but cannot decrypt the audio. The introduction service only exchanges setup and status.

### Does it work without internet?

Internet access is required for new pairing and recovery. Healthy Direct audio may continue during a brief internet or introduction-service outage. Cloud relay needs internet for audio as well. A cached page alone cannot introduce new devices.

### Can a phone host the channel?

Yes, if its browser supports microphone access and WebRTC on this HTTPS website. Healthy connections and hands-free speech can continue with the page hidden while the browser permits. Screen lock, browser suspension or operating-system interruptions may still stop them; try your actual phone before relying on background use. Phones can also listen without granting microphone access.

### How do listeners join?

Check a channel’s route icon in Available connections, then select Join on its row, or open its listener link. Cloud relay invitations also require Join. Playback starts where permitted; Unmute starts sound if the browser requires an interaction. Listening never requests microphone access.

### Can we use a phone hotspot?

A phone hotspot can work with Direct if it allows the devices to reach one another. Keep internet for discovery and pairing, and use the listener link or QR code if discovery misses the channel. Cloud relay can provide another route when both devices permit it; it requires an explicit choice and internet throughout.

### What happens when the host disappears?

Receivers wait and check availability with a one-second target while active, keeping their mute choice. Hiding a healthy page does not deliberately disconnect it. A microphone interruption clears talking and keeps the pairing; an ended microphone can be replaced with Resume microphone or on returning to the page. If the browser suspends the page, returning tries to restore the same channel and invitation, with Resume channel as a fallback. Recovery leaves talking off. Background timers or service connection limits can delay retries. End broadcast stops receivers and prevents automatic resumption; the next channel uses a new invitation.

### How many listeners are supported?

A channel admits up to ten listeners, including waiting connections. The host sends a separate audio stream to each. Actual capacity depends on its browser, device and network; ten is a limit, not a guarantee for every phone.

### Why can the same Wi-Fi fail?

Guest isolation, firewalls, VPN routes or browser local-network permissions can block Direct. Try a reachable trusted network or explicitly start a new Cloud relay channel. Managed devices can restrict either route.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Internet discovery and pairing carry setup, never audio.** Opening the page opens a secure discovery WebSocket. Starting or joining opens a separate channel connection. Make this channel discoverable shares its name, listener invitation and chosen route in your selected scope. Local network groups browsers by public IPv4 address or IPv6 /64 subnet and website origin; shared gateways can include strangers and VPNs can hide nearby devices. Private group uses the same random group code on each device and lists the channel only within that group, including across networks. The group code permits discovery and is separate from listener invitations. It stays in page memory; reloading a private host requires starting again in the chosen group. Turn the option off before starting for link-only invitations. Browsing never opens an audio connection or asks for a microphone. Channel state and directory entries live on open sockets without a stored history. Cloudflare keeps seven-day request metadata logs; keys travel inside secure messages, not request URLs. Each listener has a separate encrypted WebRTC audio connection to the host. Optional Cloud relay forwards encrypted audio; it cannot decrypt it. There is no recording feature, but recipients can independently record what they hear.
- **A listener invitation cannot control the host.** Host and listener keys differ. The host key remains in its browser tab's session storage and is never included in a shared link. A listener link carries its invitation key in the fragment after the # character and identifies the chosen route. The tool saves it in per-tab session storage and removes the fragment when storage is available. Direct invitations join automatically; Cloud relay invitations require Join before the first connection. These are temporary browser credentials, not accounts. An invitation is not proof of physical Wi-Fi membership.
- **Direct reachability still depends on your network.** Direct offers and accepts host candidates only. VPNs, public interfaces and operating-system routes can affect the path, so Direct does not prove a physical LAN boundary. Guest isolation, firewalls and browser permissions may block it. Cloud relay is a separate explicit choice that uses relay candidates only and needs internet throughout. A failed Direct connection never switches to relay automatically. Changing the host's route creates a new invitation. Background or locked-screen operation still depends on the browser and operating system.
- **Temporary loss reconnects; End and Leave stop retries.** A waiting receiver checks host availability with a one-second foreground target and keeps its mute choice. Healthy hidden connections and explicitly enabled hands-free speech continue while the browser allows. A physical hold releases on blur or hiding. A microphone interruption stops talking while preserving the channel; an ended microphone can be replaced on returning to the page or with Resume microphone. Recovery stays silent until you deliberately talk again. If the browser suspends the page, returning attempts to restore the same channel and invitation, with Resume channel available when an action is required. End broadcast prevents automatic resumption and creates a new invitation on the next Start. Leave closes one listener and its retries. Background timers, connection limits and sleeping devices can delay recovery.
- **The website's regular scripts still run on this page.** The page uses the site's usual advertising, measurement and donate-button scripts. The tool does not hand them audio, but scripts running in the page can read its address and browser storage, including temporary invitations. Removing a URL fragment reduces its later exposure; it cannot make those scripts a separate security boundary. Trust this page and its scripts before granting microphone access or using a sensitive invitation.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, `src/session.js` for microphone cleanup and reconnects, and `workers/rendezvous/broadcast.js` for the authenticated setup protocol
