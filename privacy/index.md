# Privacy & Cookies

Files are processed locally. Intentional sharing and optional network features have separate boundaries. This page explains those boundaries and the ads, feedback, storage and hosting around them.

Last updated 12 October 2026

## Your files

Files selected for processing are read, edited and written inside the browser on your device. abox.tools has no file-processing upload endpoint or database of those files. Downloads are assembled locally. Sharing, remote camera viewing and handing a receipt report to another app are deliberate transfers, described below.

Local processing does not give us:

- your files or their previews
- their filenames, sizes, dimensions or formats
- their contents, including EXIF, GPS and recognised document text

Each page carries a `Content-Security-Policy` that limits permitted resources and destinations. Some tool policies add the rendezvous or the optional exchange-rate API. A policy does not inspect the data sent to an allowed host, and `connect-src` does not describe WebRTC peer traffic. Read it alongside the source and observe the feature you are using, rather than treating the host list as proof of every payload.

Files you produce with a tool are handed to your browser's own download mechanism and saved wherever you tell it to. We are not involved in that step either.

## Features that deliberately use a connection

[Images to Video](https://abox.tools/images-to-video/) can fetch an image from a web address you supply. That server receives your IP address and the requested URL, including query parameters. The image is copied into local memory and re-encoded for processing. This request does not send files selected from your device.

[Receipt & Invoice Extractor](https://abox.tools/receipt-invoice-extractor/) reads photos and recognises text locally. Its optional historical-rate button requests a currency pair and your chosen date from [Frankfurter](https://frankfurter.dev/). The date may be the date printed on a receipt. The provider sees your IP address and request; the request omits credentials and referrers and contains no photo, filename, merchant, amount or email address. Manual rates require no request.

Receipt email and sharing buttons prepare reports and JPEG copies locally, then download an email file or hand them to your chosen device app. This page does not send an email. The app, provider and recipient you choose handle the next step under their policies. [Share Text & Files](https://abox.tools/share-text/) and [Remote Camera](https://abox.tools/remote-camera/) deliberately send content to another browser; their connection metadata is described below.

## What is collected, and by whom

This site is free and is paid for by advertising. That means two Google products run on these pages, and a donate button runs on most of them. Here is the whole list.

### Google AdSense — the ads

Google serves the ads and decides which ones you see. To do that it may set and read cookies or similar identifiers in your browser, and it receives your IP address, an approximate location derived from it, your user agent, and which page you were on. Depending on your settings and where you are, the ads may be personalised using a profile Google holds about you, built largely from your activity on other sites.

We do not receive any of that, we cannot see it, and we never send Google anything about your files. Google's own account of how it uses data from sites that run its ads is at [policies.google.com/technologies/partner-sites](https://policies.google.com/technologies/partner-sites).

### Google Analytics — the visit counter

We use Google Analytics 4 to count page visits, so we know which tools are worth working on. It records the page you viewed, roughly when, a randomly generated identifier stored in your browser, an approximate location, your device and browser type, and the site that referred you.

`analytics.js` configures page views. `feedback.js` also sends an optional `tool_feedback` event after you answer: the tool slug, a fixed up or down verdict and a fixed reason. There is no free-text field and no file, filename, size, dimension, count, format or file contents in that event. We can view aggregate Analytics reports. Blocking Analytics leaves local processing available.

### Buy Me a Coffee — the donate button

The hub page and the tool pages carry a donate button, which loads from Buy Me a Coffee's servers. Loading it means their CDN sees your IP address and that you were on this site, and the button's lettering is fetched from Google Fonts, which likewise sees your IP address. Nothing else is sent, and nothing further happens unless you actually click it, at which point you are on their site under their policies. This page and the [Terms page](https://abox.tools/terms/) do not draw the button.

### Hosting

The site is served by GitHub Pages, behind Cloudflare. Like any web host, they process the requests your browser makes — which includes your IP address, the page requested, and your user agent — in order to deliver the page and to keep the service up and secure. We do not have access to per-visitor logs from either of them.

### Remote Camera and browser introductions

[Remote Camera](https://abox.tools/remote-camera/) opens a discovery WebSocket when its page loads; Start camera, Connect or choosing an online camera adds a room connection to our rendezvous. Choosing a listed name requests a connection immediately and exchanges network addresses. Opening a viewer link still waits for Connect. Viewer approval is on by default and controls video, not address exchange. The rendezvous sees codes, addresses, timings and setup messages, never video or viewer notes. Video uses an encrypted direct browser connection with no configured STUN server or TURN relay, no microphone and no recording feature. Internet is still required for introductions. Routing can be affected by VPNs and operating-system policy; local mode does not prove a physical network boundary. The tool page explains these limits and how page scripts can read the viewer-link address.

### Share Text & Files and the rendezvous

[Share Text & Files](https://abox.tools/share-text/) opens a discovery connection on its start page and another connection when sharing. Names are grouped by public IPv4 address or IPv6 subnet and page origin; this is a discovery hint, not proof of the same physical network. The rendezvous sees names, IP addresses, connection times and negotiation messages, never shared text or files. Advertised names live on open connections without durable storage. Ordinary mode uses public STUN servers from Google and Cloudflare; a reader may explicitly retry through a Cloudflare TURN relay, which forwards encrypted traffic without its decryption keys. Local network mode omits STUN and TURN, but still needs the public rendezvous. Cloudflare keeps seven-day connection metadata logs for the share and camera rendezvous; these are per-visitor service logs we can read. Content copied or downloaded by a recipient remains theirs after the source tab closes.

## Cookies

We set no login or session cookies. Google scripts may set cookies and identifiers as described above. The site also uses local browser storage for preferences and temporary work.

**The language you choose.** If you pick a language from the switcher, that choice is written to your browser's local storage, under the name `abox-lang`, so that the next page you open is in the language you asked for. It is not a cookie: it is never sent to us or to anybody else, it stays on the device you are reading this on, and clearing your browser's site data removes it. If you never pick a language, nothing is written at all — a page shown in your browser's own language was matched on the spot and forgotten again.

**Other local storage.** Feedback stores an answer or dismissal timestamp to avoid asking again. Tools may keep settings or an optional sharing draft locally. A language switch or an explicit carry-on action can temporarily store files and settings in IndexedDB so another local tool page can pick them up. These records are not cookies and are not sent to us; clearing site data removes them. The relevant tool explains persistent drafts.

Google's cookies and identifiers are used to measure visits and to select and cap ads. They are distinct from the local site records described above.

### How to switch it off

- Ad personalisation can be turned off, for all sites at once, at [My Ad Center](https://myadcenter.google.com/).
- Google Analytics can be blocked everywhere with Google's [opt-out browser add-on](https://tools.google.com/dlpage/gaoptout).
- Your browser's own settings can block or clear third-party cookies, and any content blocker will stop these scripts loading in the first place.

Blocking advertising, Analytics and the donate button leaves local processing available. Once a tool's offline cache is ready, its local processing works disconnected. Web-image imports, online rates, browser introductions and delivery through another app need their respective connections. No processing feature is withheld behind an ad.

## Your rights over the data

We do not hold files you process. Analytics reports and the rendezvous connection metadata described above are different data. Questions or requests about the site's handling of these can go to [hi@abox.tools](mailto:hi@abox.tools); identify the page and approximate date, without attaching a private file.

For data in your Google account, use [your account controls](https://myaccount.google.com/) or Google's privacy contacts. Optional exchange-rate, donation and email providers handle their own services and requests.

## Children

This site is not directed at children and does not request an age or a user account. The automatic page and connection information described above applies to visitors of any age.

## Changes, and how to reach us

If this page changes, the date at the top changes with it, and the edit is in the public commit history along with everything else.

Questions about any of this can go to [hi@abox.tools](mailto:hi@abox.tools), or be raised as an issue on [the repository](https://github.com/A-Box-of-Tools/website), where the answer is visible to everyone else wondering the same thing.
