# Share text & files — straight from your browser to theirs, nothing uploaded

The share lives in this open tab. Readers fetch it directly from your browser, encrypted, and closing the tab ends it - nothing is stored on any server.

> Send text or files from one browser to another over a direct encrypted connection. A speakable link name, live updates as you type, approval for each reader - and nothing stored on any server, ever. Free, no sign-up.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/share-text/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your shared text and files are **never uploaded**. There is no server.

What you share here travels from your browser to each reader's browser over a WebRTC channel that is encrypted end to end, and it goes nowhere else. The one server involved — named in this page's `Content-Security-Policy`, source in the repository — introduces the two browsers and then stands aside: it stores nothing, and the content never passes through it. There is no history and no account. Close this tab and the share ends everywhere at once, including on readers' open pages.

- ✗ Nothing stored
- ✗ No account
- ✓ End-to-end encrypted
- ✓ Ends with your tab
- ✓ Open source

## How to share text and files without uploading them anywhere

1. **Write the text, or attach the files.** The editor is the share: whatever is in it when a reader connects is what they receive, and edits after that reach connected readers live, as you type. Files ride the same channel, up to 200 MB each; readers see the list and fetch only what they ask for, so nobody's bandwidth is spent on a file they did not want.
2. **Turn on Markdown if the text deserves formatting.** One toggle. Headings, bold, lists, code and links render live beside the editor as you type, and readers get the formatted view by default with a switch back to the raw source. The renderer ships with this page and escapes everything: shared text cannot become script on a reader's machine, whoever wrote it.
3. **Name the link, or keep the suggestion.** The name is the address: `brave-otter-42` can be said across a room, read over the phone, or typed from a whiteboard. It is also the only secret, so for anything private either pick a name nobody would guess or rely on the private switch instead. A name someone else is actively sharing under is refused, and yours frees up the moment you stop.
4. **Decide who gets in.** Private is on by default: each reader is asked to introduce themselves — a name, a hint, anything you would recognise — and you see the message with a button to let them read or turn them away. The introduction travels the direct channel, so not even the rendezvous learns who asked. Untick it for an open share that anyone with the name can read.
5. **Start sharing, and keep the tab open.** The tab is the server: the share is reachable while it is open and awake, and stops the moment it is not. A laptop lid closing ends it too. Copy the link, or just say the name — a reader can type it into this page's address as `#name` on the end.
6. **On the other side: consent, then knock.** A reader opening the link is told someone is sharing, warned that a direct connection shows each side the other's network address, and connects only by choosing to. On a private share they introduce themselves and wait for you. What they receive updates live while you edit, and clears when you close the tab.

## The longer version

[How to share text and files between devices without uploading them](https://abox.tools/guides/share-text-between-devices/): Move text or files from one browser to another over a direct encrypted connection - no email-to-self, no chat history, no account, and nothing stored on any server to delete later.

## Also in the box

- [QR & Barcode Generator](https://abox.tools/qr-barcode/): Type it, and it becomes a code. Nothing is sent to make one.
- [QR & Barcode Reader](https://abox.tools/qr-barcode-reader/): Point it at a code, or drop a picture of one. It is read here, and nowhere else.
- [Hash & Checksum](https://abox.tools/hash-checksum/): Check a download against the number the publisher printed, without sending it to anyone.
- [Password & Passphrase Generator](https://abox.tools/password-generator/): Made here, by your own browser, and never sent anywhere. Nothing is stored and there is no history.

## Questions

### Is anything uploaded, anywhere?

No. The text and the files go from your browser to each reader's browser over an encrypted WebRTC channel, directly. The one server involved carries the introduction — a few kilobytes of connection negotiation — and never the content. There is nothing on it to breach, subpoena or leak: it holds no bytes of yours, and a room ceases to exist the moment you disconnect.

### So why does this tool contact a server at all, on this site of all sites?

Because two browsers cannot find each other unaided: something has to match the person who typed `brave-otter-42` with the person sharing under it, and carry the connection offer between them. That something is the rendezvous, this page's one network dependency, named in its `Content-Security-Policy` and published in the same repository as this page. It is the smallest server that could do the job — it stores nothing, reads nothing, and stands aside once the two browsers hold a direct channel.

### What exactly can that server see?

That a link name is in use, when a sharer and readers connect and leave, their IP addresses, and the encrypted-connection set-up they exchange. Not the text, not the files, not their names or sizes, not who was admitted to a private share, and not what anyone wrote in an introduction — all of that travels the peer channel, which is encrypted end to end and does not pass through the server. Cloudflare, which runs the server, keeps a log of each connection for seven days: the link name, the address and the time. Nothing else outlives the share.

### What happens when I close the tab?

The share ends everywhere at once. The link stops working within a second or two, and readers who still have the page open see their copy clear with a note that the share has ended. That is not a deletion request to a server — there is no server copy to delete. The tab was the only place the share existed, and closing it is the whole of the cleanup.

### Can a reader keep what I shared?

While the share is open, yes — that is what sharing is. A reader can copy the text or download a file, and what they took is theirs, exactly as if you had handed it over any other way. What ending the share guarantees is the future: nobody new can get it, and open pages stop showing it. No tool can unsend what has already arrived, and this page does not pretend otherwise.

### What is private mode?

The default. Each arriving reader is told the share is private and asked to introduce themselves; you see the message — “it’s Alice from the standup” — with buttons to let them read or turn them away, and nothing is sent until you choose. The introduction travels the already-encrypted direct channel, so the server never learns who asked or what you decided. Untick the box before sharing for an open share instead.

### Why will the reader see my IP address?

Because the connection is genuinely direct, and a direct connection is between two addresses — each end necessarily learns the other's, as with a phone call. The reader is warned before any connection exists and connects only by choosing to; until then you have not even learned they opened the link. If that trade is wrong for a given share, a service that relays through a server is the alternative — with the opposite trade.

### How big can the files be, and how fast is it?

Up to 200 MB per file, any type, and as fast as the slower of the two connections — there is no server in the middle to slow it down or meter it. Two machines on the same Wi-Fi transfer at local-network speed, and the bytes never leave the building. Readers fetch each file on demand, so attaching something large costs nothing until somebody actually asks for it.

### Does it work offline?

Half of it, honestly: the editor does — the page loads, your draft is here, markdown renders, and you can write and save with no network at all. Sharing does not, and cannot: reaching another person's browser is a network act, and the introduction needs the rendezvous. This is the one tool on this site with a job that is impossible offline, and it would be dishonest to imply otherwise.

### What if we can't connect?

Most pairs of browsers can reach each other directly once introduced; a minority cannot, typically when one side is on a mobile carrier's shared-address network or behind a strict corporate one. This page never switches to a relay quietly — that would change what this tool is without saying so — so after twenty seconds it says plainly that a direct connection could not be made, and offers the reader one: a relay run by Cloudflare that forwards the encrypted bytes between the two browsers and cannot read them, since the key never leaves the two ends. The reader chooses it by name, on their own page, after being told what it sees — both addresses, as the direct connection would — and nothing is stored there either. Your side of the share does not change: your browser still sends to that one reader, as it would if they were on a VPN.

### Is the markdown safe to render, if anyone can share anything?

That question is why the renderer is eighty lines in this page's own source rather than a library. Every character is entity-escaped before any tag is emitted, only a fixed set of harmless tags can be produced, and links accept only `http`, `https` and `mailto` — a `javascript:` link stays inert text. Shared text cannot become script on your machine, no matter who wrote it, and you can read the eighty lines.

### Can two people share under the same name?

Not at the same time. One live share per name, enforced at the rendezvous: a second sharer is refused and asked to pick another. The moment a share ends its name is free again, which also means a saved link is only as fresh as the share behind it — the same name next week may be somebody else. Treat a link as belonging to a moment, not to a person.

### Is it free, and do I need an account?

Free, no account, no sign-in, and no limit worth mentioning — sixteen simultaneous readers per share. The site carries advertising, which is what pays for it; the ads are given nothing about what this page shares, and the rendezvous runs comfortably inside a free tier precisely because it stores nothing and does almost nothing.

## How the privacy claim is verifiable

- **The content goes to your reader, and nowhere else.** The text and the files travel over a WebRTC data channel: a direct, DTLS-encrypted connection between your browser and each reader's. There is no server in that path. On the same network the bytes never even leave the building — two laptops on one Wi-Fi exchange them locally. The one exception is a reader whose network cannot be reached directly and who then chooses, on their own page, an encrypted relay: it forwards the same ciphertext and cannot read it.
- **What the rendezvous is, and the whole of what it sees.** A direct connection needs an introduction, so this page — alone on this site — opens one WebSocket to a server of ours. That server matches the person who typed a link name with the person sharing under it, forwards a few kilobytes of connection negotiation between them, and holds nothing: no storage is ever written, and a room ceases to exist the moment the sharer disconnects. It can see that a name is in use, when peers come and go, and their IP addresses. It cannot see the text, the files, who was let in, or what anybody said — even the knock on a private share travels the encrypted peer channel. Its entire source is in the repository beside this tool's. What outlives a share is one thing: Cloudflare, which runs the server, keeps a log of each connection for seven days — the link name, the address and the time, never a payload.
- **Nothing is stored, so closing the tab is the deletion.** The share exists only while your tab is open. Close it and new readers find nothing, and readers already looking at it see their copy clear — though what someone copied out or downloaded before that moment is theirs, as it would be with anything you had handed them. The draft you type is kept in your own browser's storage so it is still here next time, and only there; mark it one-off and it is kept nowhere at all.
- **The link name is the only secret, and private mode is the lock.** Anyone who knows or guesses a name can open the share behind it, which is why the suggestions are three random words and why anything sensitive deserves an unguessable name — or the private switch, which is on by default: each arriving reader must introduce themselves, over the direct channel, and nothing is sent until you let them in.
- **A direct connection shows each side the other's address.** That is what peer-to-peer means, and the reader is told before it happens: opening a share link only asks the rendezvous whether anyone is sharing, and the page then says plainly that connecting reveals each side's IP address to the other, and waits for a click. Until that click, the sharer has not even learned the reader exists.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google, and the donate button from Buy Me a Coffee. None of them is handed the text, the files, their names or sizes, or who connected. The exception is this page's own address: a reader's link carries the link name in it, and the ad script reads the address. A share worth keeping to yourself wants the private switch. Every line that touches the content is served from this origin and listed in the repository.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/main.js` for both halves of the exchange — the sharer's tab and the reader's are the same file — and `src/markdown.js` for the renderer that runs on text from the other side of the wire, which escapes everything before it emits anything. The server's whole source is `workers/rendezvous/worker.js` in the same repository: one room per link name, holding nothing but the open connections.
