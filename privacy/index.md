# Privacy & Cookies

The short version: your files are never uploaded, because there is nowhere to upload them to. Everything else on this page is about the ads, the visit counter and the hosting — the parts that do involve other companies.

Last updated 3 September 2026

## Your files

Every tool on this site does its work inside your own browser, on your own hardware. When you choose a file, it is read by the page you already have open. It is not sent to us, because there is no server of ours for it to be sent to — this site is a set of static files, with no backend, no database, and no storage.

That means we never receive, see, store, log, or process:

- your files, in whole or in part
- thumbnails or previews of them
- their names, sizes, dimensions, or formats
- how many you chose, or what you did with them
- anything read out of them, including EXIF and GPS data

This is not a promise about our intentions. Each page carries a `Content-Security-Policy` that names every address the page is allowed to contact, and the browser enforces it. None of those addresses belong to us. You can read the policy at the top of any page's source, or open your browser's Network tab and watch: no request carries your file.

Files you produce with a tool are handed to your browser's own download mechanism and saved wherever you tell it to. We are not involved in that step either.

## The one exception, and where it applies

The [Images to Video](https://abox.tools/images-to-video/) tool has an “add from a web address” feature. If you paste an address into it, your browser fetches that image from whatever server you named, and **that server sees your IP address** and which file you asked for. That is unavoidable, and it is the whole nature of the feature.

It only ever happens for addresses you type in yourself, it is built so that images can come in but data cannot go out, and that tool's own page explains it in more detail. No other tool on this site can make an outbound request with anything of yours in it.

## What is collected, and by whom

This site is free and is paid for by advertising. That means two Google products run on these pages, and a donate button runs on most of them. Here is the whole list.

### Google AdSense — the ads

Google serves the ads and decides which ones you see. To do that it may set and read cookies or similar identifiers in your browser, and it receives your IP address, an approximate location derived from it, your user agent, and which page you were on. Depending on your settings and where you are, the ads may be personalised using a profile Google holds about you, built largely from your activity on other sites.

We do not receive any of that, we cannot see it, and we never send Google anything about your files. Google's own account of how it uses data from sites that run its ads is at [policies.google.com/technologies/partner-sites](https://policies.google.com/technologies/partner-sites).

### Google Analytics — the visit counter

We use Google Analytics 4 to count page visits, so we know which tools are worth working on. It records the page you viewed, roughly when, a randomly generated identifier stored in your browser, an approximate location, your device and browser type, and the site that referred you.

It is configured to do nothing else, and the configuration is a file you can read: `analytics.js` beside each page sets up a page-view counter and contains no custom events at all. Nothing on this site passes it a file, a filename, a dimension or a count — there is no code here that could.

### Buy Me a Coffee — the donate button

The hub page and the tool pages carry a donate button, which loads from Buy Me a Coffee's servers. Loading it means their CDN sees your IP address and that you were on this site, and the button's lettering is fetched from Google Fonts, which likewise sees your IP address. Nothing else is sent, and nothing further happens unless you actually click it, at which point you are on their site under their policies. This page and the [Terms page](https://abox.tools/terms/) do not draw the button.

### Hosting

The site is served by GitHub Pages, behind Cloudflare. Like any web host, they process the requests your browser makes — which includes your IP address, the page requested, and your user agent — in order to deliver the page and to keep the service up and secure. We do not have access to per-visitor logs from either of them.

### The share tool’s rendezvous

One tool, [Share Text & Files](https://abox.tools/share-text/), moves text and files straight from one browser to another, and a direct connection needs an introduction. So that page — alone on this site — opens one WebSocket to a small server of ours, which matches the two ends of a link name and passes their connection set-up between them. It never sees the text or the files; those travel the encrypted connection it introduced. It does see the link name, when each side connects and leaves, and their IP addresses, and Cloudflare, which runs it, keeps a log of each connection for seven days. It is the only per-visitor log on this site that we can read. The tool’s own page describes it in full, and its entire source is in the repository.

## Cookies

We do not set any cookies of our own. We have no login and no session, and there is only one preference we ever remember.

**The language you choose.** If you pick a language from the switcher, that choice is written to your browser's local storage, under the name `abox-lang`, so that the next page you open is in the language you asked for. It is not a cookie: it is never sent to us or to anybody else, it stays on the device you are reading this on, and clearing your browser's site data removes it. If you never pick a language, nothing is written at all — a page shown in your browser's own language was matched on the spot and forgotten again.

Every cookie or similar identifier you may find here belongs to Google and is set by the advertising and analytics scripts described above. They are used to measure visits, and to select and cap ads.

### How to switch it off

- Ad personalisation can be turned off, for all sites at once, at [My Ad Center](https://myadcenter.google.com/).
- Google Analytics can be blocked everywhere with Google's [opt-out browser add-on](https://tools.google.com/dlpage/gaoptout).
- Your browser's own settings can block or clear third-party cookies, and any content blocker will stop these scripts loading in the first place.

Blocking all of it is fine by us. **Every tool on this site works with the scripts blocked, and works with the network disconnected entirely.** Nothing here is held back behind an ad.

## Your rights over the data

We hold no personal data about you, so there is nothing for us to show you, correct, export, or delete — a request to us would come back empty, honestly.

The data described above is held by Google, who act as their own controller for it. Requests about it have to go to them, through [your Google account](https://myaccount.google.com/) or their privacy contacts.

## Children

This site is not directed at children and asks nobody for their age, because it asks nobody for anything. We knowingly collect no personal data from anyone, of any age.

## Changes, and how to reach us

If this page changes, the date at the top changes with it, and the edit is in the public commit history along with everything else.

Questions about any of this can go to [hi@abox.tools](mailto:hi@abox.tools), or be raised as an issue on [the repository](https://github.com/A-Box-of-Tools/website), where the answer is visible to everyone else wondering the same thing.
