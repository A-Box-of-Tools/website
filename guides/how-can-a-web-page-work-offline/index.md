# How can a web page work with the wi-fi off?

A service worker can keep a local copy of a tool. A completed disconnected operation is evidence of local processing; it does not guarantee every future data path. Here is how the cache works and what to check.

Last updated 13 October 2026

## The short answer

A service worker can store the resources a page needs in a cache on your device and answer later requests from that copy. This site caches each tool's page, scripts and local engines. Caching must finish first, browsers can refuse or evict a cache, and updates may require a connection. Check the tool's offline indicator before relying on the stored copy.

A ready cache lets a local processing operation run without a connection. That demonstrates where that operation ran; it is not a guarantee about every feature or about what might be sent later. A service worker is caching machinery, not a privacy boundary by itself.

## Prepare for a flight or an unreliable connection

**Before travelling,** open the exact tools you will need, wait for each offline indicator to say ready, then disconnect and try the job with a spare local file. For a [scan-to-PDF chain](https://abox.tools/guides/scan-multiple-pages-into-one-pdf/), load both the scanner and PDF maker: visiting one does not cache the other. Keep the input files on the device and save each finished output yourself.

**For receipts on a weak connection,** cache the [receipt extractor](https://abox.tools/guides/extract-receipts-and-invoices/) and its OCR assets before leaving. Recognition, review, manual rates and downloads can then work locally. An online rate lookup and eventual email delivery still need their own connections.

Recheck after clearing browser storage, changing browsers or a long period without use. An installed shortcut is convenient, but it does not guarantee that the browser retained every cached resource or that your working files were saved.

## What surviving the plug-pull proves

The upload guide's strongest check is [pull the plug](https://abox.tools/guides/is-it-safe-to-upload-files/): load the tool, disconnect, and use it. It is worth being precise about why that works. A tool that converts your file on a server needs the network at the exact moment it does its work — cut the cord and the work stops. A tool that keeps working has demonstrated, not claimed, that the work happens on your machine; and a page that cannot reach the network cannot send your file anywhere, whatever its code might wish.

Local processing tools show whether the offline copy is ready and whether a connection is available. Try the particular operation with a file from your device. Image imports, online rates, sharing and remote camera introductions have network steps and explain them beside their controls.

## How the copy stays honest

Two questions decide whether cached-forever is a gift or a trap, and the machinery answers both:

- **Does the copy go stale?** The worker checks for a newer version when a connection is available and swaps it in whole. Versions are whole because the copy must always be coherent — half-old, half-new is the one state that must never be served.
- **What exactly was copied?** Everything the page needs and nothing else, and each tool here keeps its own copy in its own compartment. A tool's cache holds that tool; installing one does not silently install ten. It also means the copy is inspectable: your browser's developer tools list every cached file, and the list is the same list the page fetched in the open.

The result is a page that behaves like an application you happen to have installed by visiting it — which is also literally on offer: the browser's address bar will install any tool here as an app, with the tool's own icon, opening straight to the tool, no button on the page and no script asking. Same machinery, wearing a shortcut.

## What offline does not prove

The check is strong, not magic, and its limits are worth stating as plainly as its strength:

- **It proves the operation while disconnected.** A page could store data and send it later. Closing a tab alone does not erase persistent site storage. Inspect source, storage and requests after reconnection if you need evidence about the whole data path.
- **It applies to a feature, not the entire site.** [Sharing](https://abox.tools/share-text/) and [Remote Camera](https://abox.tools/remote-camera/) need introductions through the public rendezvous. Local network mode still needs that internet connection. [Image URL imports](https://abox.tools/images-to-video/) and optional [online exchange rates](https://abox.tools/receipt-invoice-extractor/) need their respective servers, while the local processing portions can work disconnected.
- **It does not hide you.** Loading the page in the first place told the site your address, like every page load on the web. Offline is about where your files go, not anonymity.

Use offline completion together with request inspection, policy and source review. A completed disconnected operation shows it did not need server processing at that moment. Failure alone cannot tell you why a connection was needed, and neither result replaces checking a feature's documented boundaries.
