# Voice Oncall

Open a pager and hear live voice from people who connect. Use Direct on your local network or choose Cloud relay over the internet, with a password and individual mute or remove controls.

> Let up to ten people send live voice to one host browser. Direct local connections or optional Cloud relay, with a pager password, push to talk and moderation.

The host chooses Direct or Cloud relay and opens a named pager without microphone access. Participants find it in Available connections or open its link, check the route icon, enter its password if required, and Join without entering a name. New hosts require approval by default. After approval, callers allow microphone access and deliberately hold or tap Talk. The host can mute or remove each participant. Internet is needed for pairing and for relayed audio.

## **Direct voice by default.** Choose Cloud relay when needed. No recording.

People send live voice to one listening host. Local network discovery groups pages sharing a public network address and origin; it cannot prove physical Wi-Fi membership. Private groups let devices using the same group code discover one another across networks. The introduction service carries pager names, participant identifiers and credentials, moderation and connection details, never audio. Each participant has a separate encrypted WebRTC connection. Cloud relay is an explicit alternative that forwards encrypted audio through Cloudflare.

- ✓ One host, ten participants
- ✓ Optional pager password
- ✓ Individual mute and remove
- ✗ Direct or optional Cloud relay

## How to receive voice from other devices

1. **Open the listening pager.** Choose Host a pager, give the pager a name, optionally set a password and choose Start pager. The host needs speaker output but does not grant microphone access. Keep its page open. Healthy connections can continue in the background while the browser allows; screen-lock operation is not guaranteed. If sound is interrupted, return here and choose Restore sound when shown.
2. **Find it in Available connections or use its link.** On a participating device, choose the pager from Available connections or open its invitation. Icons show the host's route, password and approval requirements. Choose Join on its row. To discover across networks, enter the same private group code on both devices before the host starts. Browsing alone never connects or requests a microphone. Both devices need internet for discovery and pairing. Direct needs a reachable network path; Cloud relay needs internet throughout. A pager keeps its host's chosen route, so changing that choice requires a new invitation.
3. **Connect and deliberately speak.** Choose Join and enter the pager password if required. Wait for host approval when enabled, then allow microphone access. You do not need to enter a name. Hold Talk or focus it and hold Space; release to stop. Physical holds also release on blur or hiding. Start talking enables hands-free speech, which can continue in the background while the browser permits. Only the host hears your audio. A microphone interruption clears talking. Return to the page or choose Resume microphone if recovery is needed, then deliberately start talking again.
4. **Control individual participants.** The host sees each caller with a short identifier and can Mute, Unmute or Remove them. Several people may speak at once, so their voices can overlap. Disconnect closes one participant; End pager closes the pager. Starting a new pager creates a fresh invitation and resets its moderation history. Removal is pending until the service confirms it; local playback is silenced immediately.

## Die ausführliche Fassung

[How to receive live voice from nearby people](https://abox.tools/de/guides/receive-voice-from-nearby-devices/): Open a browser voice pager with password admission and individual speaker controls. Choose Direct or an optional encrypted Cloud relay before hosting.

## Fragen

### Is this the reverse of Local Walkie-Talkie?

Yes. Walkie-Talkie sends one host's voice to many listeners. Voice Oncall sends each participant's live voice to one listening host. Participants do not hear one another.

### Do I need Python, installation or an account?

No. Both sides use this HTTPS website, and callers do not need to enter a name. The host names the pager and never requests microphone access. A participant must grant the browser's normal microphone permission when connecting.

### Does the host approve each person?

Yes, new pagers require approval by default. Approve or Deny a caller in the popup or pending list. Review later closes the popup and keeps the request. You can turn Require approval off before starting. A password, when enabled, is checked before approval. The host can mute or remove admitted participants.

### Can it discover every device on my Wi-Fi?

No. Local network discovery groups active pages by their public internet address and this website's origin. It does not scan the LAN and cannot prove physical Wi-Fi membership. VPNs, shared carrier gateways and different routes affect the list. Use the same private group code to discover across networks, or use an invitation link. Direct still needs a reachable path; Cloud relay is the host's separate choice.

### Does any server receive our voice?

Direct sends encrypted audio between the browsers without a relay. When the host chooses Cloud relay and the participant chooses Join, Cloudflare forwards encrypted WebRTC audio and sees addresses, timing and traffic volume, but cannot decrypt the audio. The introduction service carries setup and status only. Internet remains necessary for pairing and for relayed audio.

### Can a removed person return?

Their retained participant session is blocked in the active pager. This is not a verified account or permanent person-level ban: a new browser identity can try again. A password helps control who can connect. End the pager and create a new protected one if you need a fresh invitation.

### Can I keep talking with the screen locked?

Hands-free speech and healthy connections remain active while the browser allows; physical holds release when the page loses focus or becomes hidden. A phone can still interrupt audio, suspend the page or close connections when locked, so this is not guaranteed. A microphone interruption stops talking and recovery stays silent until you deliberately speak again. Test the actual phones and browsers you plan to use. Disconnect and End pager prevent automatic restart.

### Can we use a phone hotspot?

A phone hotspot can work with Direct if it allows the devices to reach one another. Keep internet for discovery and pairing, and use the pager link or QR code if discovery misses it. Cloud relay offers another route when both devices permit it; it requires an explicit choice and internet throughout.

### Why does the same Wi-Fi sometimes fail?

Guest isolation, firewalls, VPN routes, browser permissions or sleeping devices may prevent Direct. Try a reachable trusted network or explicitly start a new Cloud relay pager. Managed devices may restrict either route. Test the actual phones and computers you intend to use.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Choose local discovery or a private group.** Opening this page connects to the rendezvous to list live pagers. Local network groups pages sharing your public IPv4 address or IPv6 subnet and page origin; shared carrier gateways can include strangers and VPNs can hide devices beside you. Private group uses the same random group code on each device and lists the pager only within that group, including across networks. Pager names, routes and password requirements are visible to the chosen group. The group code grants discovery, not admission to a password-protected pager, and never enters its invitation link. It stays in page memory; reloading a private host requires starting again in the chosen group. Neither discovery nor a direct connection proves membership of a physical LAN.
- **Approval and passwords control admission.** New pagers require the host to approve each new caller before microphone access or audio setup. The host can turn Require approval off before starting. Review later keeps a request in the pending list. A protected pager checks a credential derived from its password in the participant's browser before negotiating voice. The password is not put in an invitation or sent as plain text. The derived credential travels inside encrypted signaling messages and acts as an access credential. Choose a strong password and share it separately. Callers do not need a name; their temporary session identifiers do not verify who they are.
- **The host hears separate encrypted audio streams.** Each admitted participant sends encrypted WebRTC audio to the host browser. Other participants do not receive it. Direct uses host candidates only and no relay. Cloud relay must be chosen explicitly and uses relay candidates only; Cloudflare forwards encrypted audio and sees connection metadata, but cannot decrypt the audio. There is no automatic fallback or recording feature. The host never requests microphone access. Participants grant permission and start with transmission stopped; Hold to talk or Start talking deliberately enables it. Physical holds release on blur or hiding. Hands-free speech can continue while the browser permits it. An interruption clears talking. Recipients can independently record what they hear.
- **Mute and Remove belong to the host.** Mute silences that participant's stream in the host browser even if a modified participant page keeps sending audio. The normal participant page also stops transmission when muted. Remove closes that participant's direct connection and rejects its retained session identity. This is a session block, not a permanent ban on a person: someone can create a new identity, especially in an open pager. Per-pager moderation history is bounded; ending the pager clears it.
- **Temporary browser credentials support recovery.** Host and participant credentials are separate and stay in per-tab session storage when available. Invitation fragments identify a pager without carrying its host secret or password. Healthy hidden connections remain open while the browser allows. An ended microphone can be replaced within the same pairing on returning to the page or through Resume microphone. After page suspension, returning attempts to restore the same pager or caller identity, retaining moderation and leaving caller transmission off. Waiting participants check for the host with a one-second foreground target. Screen-lock continuity is not guaranteed; browser suspension, connection limits and sleeping devices can delay recovery. End pager and Disconnect prevent automatic restart and stop retries.
- **The rendezvous carries metadata, never voice.** The service receives pager names, temporary participant identifiers, password-derived credentials, mute and removal commands, host availability and bounded connection setup messages. Older pages may also send participant display names. Temporary pager state lives on open socket attachments without a stored pager history. Cloudflare keeps seven-day invocation metadata logs including request addresses, pager identifiers and timing. Credentials travel in secure socket payloads rather than request URLs. The website's regular scripts also run here and can read the page address and browser storage; trust the page before granting microphone access or using sensitive credentials.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, `src/main.js` for individual playback controls, `shared/js/voice-session.js` for direct connections, and `workers/rendezvous/inbox.js` for admission and moderation
