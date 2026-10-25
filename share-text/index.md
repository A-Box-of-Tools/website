# Share Text & Files

Share text and files from your open browser, encrypted. Direct is the default; Cloud relay is an optional route when devices cannot connect directly.

> Send text or files between browsers with Direct or optional Cloud relay. Live updates, per-reader approval, no server content storage and no account.

This is an interactive browser tool at https://abox.tools/share-text/. Files are processed on the device running that browser. Any deliberate sharing or optional network feature is described on the page. What follows is its written explanation; open the address to use it.

## Your shared text and files are **processed in your browser**. No processing upload.

Text and files are encrypted between your browser and each reader. Direct is the default. If you choose Cloud relay before starting, encrypted packets pass through Cloudflare TURN; the relay cannot read their content. The introduction service carries setup and discoverable link names, not text or files. We store no shared content on a server. Close this tab to end the source; readers clear their view after the end notice or detected failure. Copies or downloads they already saved remain theirs.

- ✗ No server content storage
- ✗ No account
- ✓ End-to-end encrypted
- ✓ Ends with your tab
- ✓ Open source

## How to share text and files between browsers

1. **Write the text, or attach the files.** The editor is the share: whatever is in it when a reader connects is what they receive, and edits after that reach connected readers live, as you type. Files ride the same channel, up to 200 MB each; readers see the list and fetch only what they ask for, so nobody's bandwidth is spent on a file they did not want.
2. **Turn on Markdown if the text deserves formatting.** One toggle. Headings, bold, lists, code and links render live beside the editor as you type, and readers get the formatted view by default with a switch back to the raw source. The renderer ships with this page and escapes everything: shared text cannot become script on a reader's machine, whoever wrote it.
3. **Name the link, or keep the suggestion.** The name is the address: `brave-otter-42` can be said across a room, read over the phone, or typed from a whiteboard. Discoverable local shares list their name, so keep Private on for anything sensitive. For a share available only by link, an unguessable name is useful too. A name someone else is actively sharing under is refused, and yours frees up the moment you stop.
4. **Decide who gets in.** Private is on by default: each reader is asked to introduce themselves — a name, a hint, anything you would recognise — and you see the message with a button to let them read or turn them away. The introduction travels the direct channel, so not even the rendezvous learns who asked. Untick it for an open share that anyone with the name can read.
5. **Start sharing, and keep the tab open.** The tab is the server: keep it open and the device awake for uninterrupted sharing. Healthy connections stay open when the page is hidden, but a phone or sleeping laptop can suspend the browser. Returning checks the connection and tries to restore the same share; Stop sharing ends it without automatic resumption. Copy the link, or just say the name — a reader can type it into this page's address as `#name` on the end. For Local network mode, copy the link: it carries `?local=1` before the name. A reader who uses the wrong mode is asked before retrying with yours.
6. **On the other side: consent, then knock.** A reader opening the link is told someone is sharing, warned that a direct connection shows each side the other's network address, and connects only by choosing to. Join beside a discovered share starts the request in a new reader tab using the displayed connection type. Private shares wait for you; Review later closes the approval popup but keeps the request in the list. What they receive updates live while you edit, and clears when you close the tab.

## The longer version

[How to share text and files without storing them on a server](https://abox.tools/guides/share-text-between-devices/): Move text or files between browsers with Direct by default or an optional encrypted Cloud relay. No account or stored server copy; recipients can keep what they receive.

## Also in the box

- [Local Walkie-Talkie](https://abox.tools/walkie-talkie/): Start a named channel, then hold to talk or speak hands-free. Connect directly on your local network, or choose Cloud relay for listeners over the internet.
- [Voice Oncall](https://abox.tools/voice-oncall/): Open a pager and hear live voice from people who connect. Use Direct on your local network or choose Cloud relay over the internet, with a password and individual mute or remove controls.
- [Remote Camera](https://abox.tools/remote-camera/): Open a camera on one device and watch it in another browser, with optional viewer approval. Choose Direct or Cloud relay for encrypted live video.
- [Share a Browser Tab](https://abox.tools/share-tab/): Choose a tab on your computer and let one approved viewer watch it using Direct or Cloud relay. Invite by link, network discovery or a private group. No extension, sound or remote control.

## Questions

### Is anything uploaded, anywhere?

The tool stores no shared text or files on a server. Direct sends them between browsers. When the host chooses Cloud relay, their encrypted packets pass through Cloudflare TURN, which cannot read their contents. The separate introduction service carries setup and discovery metadata. Cloudflare retains introduction connection metadata for seven days; no shared content is logged by our application.

### So why does this tool contact a server at all, on this site of all sites?

Because two browsers cannot find each other unaided: something has to match the person who typed `brave-otter-42` with the person sharing under it, and carry the connection offer between them. That something is the rendezvous, this page's one network dependency, named in its `Content-Security-Policy` and published in the same repository as this page. It is the smallest server that could do the job. It also lists opted-in local link names for browsers using the same public IPv4 address or IPv6 subnet. It holds no content and cannot read the encrypted peer channel.

### What exactly can that server see?

That a link name is in use, when a sharer and readers connect and leave, their IP addresses, and the encrypted-connection set-up they exchange, and the link names opted into discovery. The discovery list groups names by public IPv4 address or IPv6 subnet, and page origin. Not the text, not the files, not their names or sizes, not who was admitted to a private share, and not what anyone wrote in an introduction — all of that travels the peer channel, which is encrypted end to end and does not pass through the server. Cloudflare, which runs the server, keeps a log of each connection for seven days: the link name, the address and the time. Nothing else outlives the share.

### What happens when I close the tab?

The share ends when its only source disappears. Readers clear their displayed copy when the end or connection failure is detected. Stop sharing sends an explicit end notice; a temporary network loss can instead trigger bounded recovery attempts. That is not a deletion request to a server — there is no server copy to delete. The tab was the only place the share existed, and closing it is the whole of the cleanup.

### Can a reader keep what I shared?

While the share is open, yes — that is what sharing is. A reader can copy the text or download a file, and what they took is theirs, exactly as if you had handed it over any other way. What ending the share guarantees is the future: nobody new can get it, and open pages stop showing it. No tool can unsend what has already arrived, and this page does not pretend otherwise.

### What is private mode?

The default. Each arriving reader is told the share is private and asked to introduce themselves; you see the message — “it’s Alice from the standup” — with buttons to let them read or turn them away, and nothing is sent until you choose. The introduction travels the already-encrypted channel, so the server never learns who asked or what you decided. Untick the box before sharing for an open share instead.

### Why will the reader see my IP address?

Direct connections exchange the network addresses needed to reach each other. Readers choose Join on a discovery entry or Connect after opening an ordinary invitation, using the displayed connection type. Cloud relay uses relay candidates instead and Cloudflare sees both devices' network addresses and traffic metadata. It is a connection option, not an anonymity guarantee.

### How big can the files be, and how fast is it?

Up to 200 MB per file. Speed depends on both devices and their network route. Direct can use local-network speed; Cloud relay also depends on internet bandwidth and service limits. Readers fetch files on demand.

### Does it work offline?

The editor works offline once the page is saved: you can write, render Markdown and keep a draft. Sharing requires internet access on both devices so the introduction service can connect the browsers. Saving the page does not provide offline pairing. Local network mode still needs that introduction, even though content travels directly between the browsers.

### What if we can't connect?

Check internet access on both devices. For Local network, check that Wi-Fi or Ethernet allows devices to reach each other. If Direct fails, the host can stop sharing, choose Cloud relay, start again and send the new invitation. The reader reviews that choice before connecting. This never changes a running Direct share automatically. Managed devices or restrictive networks may block the relay too.

### Is the markdown safe to render, if anyone can share anything?

That question is why the renderer is eighty lines in this page's own source rather than a library. Every character is entity-escaped before any tag is emitted, only a fixed set of harmless tags can be produced, and links accept only `http`, `https` and `mailto` — a `javascript:` link stays inert text. Shared text cannot become script on your machine, no matter who wrote it, and you can read the eighty lines.

### Can two people share under the same name?

Not at the same time. One live share per name, enforced at the rendezvous: a second sharer is refused and asked to pick another. The moment a share ends its name is free again, which also means a saved link is only as fresh as the share behind it — the same name next week may be somebody else. Treat a link as belonging to a moment, not to a person.

### Is it free, and do I need an account?

Free, no account, no sign-in, and no limit worth mentioning — sixteen simultaneous readers per share. The site carries advertising, which is what pays for it; the ads are given nothing about what this page shares, and the rendezvous runs comfortably inside a free tier precisely because it stores nothing and does almost nothing.

### Can I share files over my local network?

Yes. Before starting, choose Local network — no internet relay, connect both devices to the same Wi-Fi or Ethernet, and start sharing. Discoverable is on by default in this mode: the other browser can open the tool page and choose your name from the list on this connection. Uncheck it to share only by link. You can still copy the link to the reader. The link carries that mode, and a mismatched reader must choose explicitly before retrying with the sharer's mode. Internet is still needed for the rendezvous that introduces the browsers. Local mode uses no public address-discovery server and never falls back to an internet relay. A VPN or browser network policy can change the route or prevent a connection; the setting does not prove that bytes stay inside a physical building. Private approval stays on by default, and files are still limited to 200 MB each, with up to 256 files in one share.

### How does the list find local shares?

Opening this tool's start page asks the rendezvous for discoverable link names from browsers using the same public IPv4 address or IPv6 subnet. Usually that means the same router, but a shared VPN or an ISP sharing one address can include other networks; mixed IPv4 and IPv6 connections or different routes can hide nearby devices. The list is not proof of a physical local network. Internet is required. Only opted-in Local network or Cloud relay shares appear; choose this mode before starting, since it is off by default. Discoverability is selected by default when available; uncheck Discoverable for a link-only share, and keep Private on on shared networks. Join starts a request in a new reader tab using the displayed connection type. Browsing alone never connects, and private approval remains required. Review later keeps a request in the list. The directory holds only link names while the sharer is connected, never text, file names or file bytes. If discovery is unavailable, sharing by link still works.

## How the privacy claim is verifiable

- **You choose the encrypted connection route.** Direct sends content between browsers without a relay. Ordinary Direct uses public address discovery; Local network restricts it to host candidates. Cloud relay forwards encrypted packets through Cloudflare TURN and may connect devices on different networks. The host chooses before starting, the invitation carries that choice, and readers review it before connecting. Direct never switches automatically. Network and browser restrictions can still prevent either route.
- **What the rendezvous is, and the whole of what it sees.** A direct connection needs an introduction. This start page automatically opens a WebSocket to our rendezvous for discoverable local link names; starting a share opens another for the share itself. A reader uses one introduction socket. The server matches the person who typed a link name with the person sharing under it, forwards a few kilobytes of connection negotiation between them, and holds nothing: no storage is ever written, and a room ceases to exist the moment the sharer disconnects. It can see that a name is in use, when peers come and go, and their IP addresses. It cannot see the text, the files, who was let in, or what anybody said — even the knock on a private share travels the encrypted peer channel. Its entire source is in the repository beside this tool's. The directory lists only names offered by connected sharers using the same public IPv4 address or IPv6 subnet. That can include other networks behind a shared VPN or ISP address; nearby devices using IPv4 and IPv6, or different routes, can be absent. What outlives a share is one thing: Cloudflare, which runs the server, keeps a log of each connection for seven days — the link name, the address and the time, never a payload.
- **Shared content is not stored on a server.** The share exists only while your tab is open. Close it and new readers find nothing, and readers already looking at it see their copy clear — though what someone copied out or downloaded before that moment is theirs, as it would be with anything you had handed them. The draft you type is kept in your own browser's storage so it is still here next time, and only there; mark it one-off and it is kept nowhere at all. Separately, the reader's browser keeps a random approval receipt locally so an approved browser can disconnect and rejoin this host session without another approval. Stopping the host resets approval. One-off disables draft storage, not this receipt. Clearing or blocking site storage can require approval again; normal scripts on this website can read the stored receipt.
- **The link name is an address, and Private is the lock.** Anyone who knows or guesses a name can open the share behind it, which is why the suggestions are speakable names. Discoverable local shares publish their name to the list on this connection; the name is then public to browsers using the same public IPv4 address or IPv6 subnet. Keep Private on for anything sensitive. It is on by default: each arriving reader must introduce themselves, over the encrypted channel, and nothing is sent until you let them in.
- **A direct connection shows each side the other's address.** That is what peer-to-peer means, and the reader is told before it happens: opening a share link only asks the rendezvous whether anyone is sharing, and the page then says plainly that connecting reveals each side's IP address to the other, and waits for a click. Until that click, the sharer has not even learned the reader exists.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google, and the donate button from Buy Me a Coffee. None of them is handed the text, the files, their names or sizes, or who connected. The exception is this page's own address: a reader's link carries the link name in it, and the ad script reads the address. A share worth keeping to yourself wants the private switch. Every line that touches the content is served from this origin and listed in the repository.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/main.js` for both halves of the exchange — the sharer's tab and the reader's are the same file — and `src/markdown.js` for the renderer that runs on text from the other side of the wire, which escapes everything before it emits anything. The server's whole source is `workers/rendezvous/worker.js` in the same repository: one room per link name, plus a discovery directory holding advertised names on open connections, never the text or files.
