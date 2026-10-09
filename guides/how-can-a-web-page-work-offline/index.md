# How can a web page work with the wi-fi off?

Because the browser kept a complete copy, and a small program that ships with the page serves that copy whenever the network cannot. The machinery is standard and worth understanding, because a tool that works disconnected is showing you something no privacy policy can.

Last updated 26 August 2026

## The short answer

A web page normally lives and dies by its connection because every visit refetches it. But a page may ship a small program called a *service worker*, which the browser installs alongside the page and puts in charge of its network traffic. On the first visit, that worker stores a complete copy of everything the page is made of — markup, styles, scripts — in a cache on your machine. From then on, requests are answered from that copy. When the wi-fi dies, nothing changes, because nothing was being fetched anyway.

There is no magic and no special permission in any of this; it is standard browser machinery, shipping in every major browser for about a decade. What is unusual is a site leaning on it as hard as this one does — because for a site whose whole promise is that your files never leave, offline is not a convenience feature. It is the proof.

## What surviving the plug-pull proves

The upload guide's strongest check is [pull the plug](https://abox.tools/guides/is-it-safe-to-upload-files/): load the tool, disconnect, and use it. It is worth being precise about why that works. A tool that converts your file on a server needs the network at the exact moment it does its work — cut the cord and the work stops. A tool that keeps working has demonstrated, not claimed, that the work happens on your machine; and a page that cannot reach the network cannot send your file anywhere, whatever its code might wish.

No privacy policy can offer that. A policy describes intentions and can change; a page doing its job in airplane mode is physics. That is why every tool on this site works offline and carries a live indicator telling you whether you currently are — so you can watch it flip as you toggle the connection, and run the strongest check there is in about ten seconds.

## How the copy stays honest

Two questions decide whether cached-forever is a gift or a trap, and the machinery answers both:

- **Does the copy go stale?** The worker checks for a newer version when a connection is available and swaps it in whole. Versions are whole because the copy must always be coherent — half-old, half-new is the one state that must never be served.
- **What exactly was copied?** Everything the page needs and nothing else, and each tool here keeps its own copy in its own compartment. A tool's cache holds that tool; installing one does not silently install ten. It also means the copy is inspectable: your browser's developer tools list every cached file, and the list is the same list the page fetched in the open.

The result is a page that behaves like an application you happen to have installed by visiting it — which is also literally on offer: the browser's address bar will install any tool here as an app, with the tool's own icon, opening straight to the tool, no button on the page and no script asking. Same machinery, wearing a shortcut.

## What offline does not prove

The check is strong, not magic, and its limits are worth stating as plainly as its strength:

- **It proves the moment, not the future.** Work done offline stayed on your machine, full stop. A page could in principle hold data and send it after the connection returns — so for the sharpest files, close the tab before reconnecting, or check the other direction too: watch the Network tab as the connection comes back.
- **It proves this page, not the site.** Each page answers for itself. The one here that does use the network says so on its own page: the [text-sharing tool](https://abox.tools/share-text/), whose whole job is moving something between two devices, and which explains exactly what its one connection carries.
- **It does not hide you.** Loading the page in the first place told the site your address, like every page load on the web. Offline is about where your files go, not anonymity.

Those limits are why the upload guide teaches four checks rather than one — the Network tab, the security policy in the page source, and the readable code cover what the plug-pull cannot. But as first filters go, none is faster: if a tool cannot do its job with the network gone, you have learned where the job happens, and no further reading is required.
