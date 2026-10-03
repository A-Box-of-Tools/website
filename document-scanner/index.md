# Document Scanner — a photo of a page, straightened

Photograph the page. Get back something that looks scanned.

> Turn a phone photo of a page into a straightened, evenly lit PDF. The corners are found for you, the perspective is undone, the shadow is divided out. Runs entirely in your browser: nothing is uploaded.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/document-scanner/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your documents are **never uploaded**. There is no server.

The photo is decoded, straightened, cleaned up and written into a PDF by your own browser, using nothing but arithmetic and the codecs it already ships with. This tool has no network feature of any kind — nothing to fetch, nothing to send — and the reason that matters here is what people photograph pages of: a passport, a payslip, a lease, a form an office asked them to “scan and return”.

- ✗ No upload
- ✗ No account
- ✗ No watermark
- ✓ Works offline
- ✓ Open source

## How to scan a document with your phone camera

1. **Photograph the page.** From above, with the whole page in the frame and the four corners visible or nearly so. It does not have to be square-on and it does not have to be evenly lit: the angle and the shadow are what this tool is for. What does matter is filling the frame — a page photographed from across the room has no detail in it to recover.
2. **Check the four corners.** They are found for you when the photo is read, and the page says so when it is not sure — a page on a desk the same colour as the paper is genuinely hard to see the edge of. Press anywhere on the photo and the nearest corner comes to your finger, or reach one with `Tab` and move it with the arrow keys.
3. **Choose what to do with the light.** “Colour, evened out” measures the paper across the page and divides it out, so the shadow goes and a stamp or a signature keeps its colour. “Black and white” goes further and is what makes a scan small enough to email. What you see on screen is the real result, produced by the same code that writes the file.
4. **Add the other pages.** Every photo you add becomes another page of the same document, in the order they are listed, and each one keeps its own corners. The arrows on a page in the strip move it earlier or later.
5. **Save the PDF, and open it before you send it.** The document is written here, in this page's memory. Nothing was uploaded to make it, and nothing about it was reported anywhere.

## The longer version

[How to scan a document with your phone](https://abox.tools/guides/scan-a-document-with-your-phone/): What separates a photograph of a page from a scan of one: the angle, the uneven light, and the file size. How to take the photo, what to fix afterwards, and why none of it needs a server.

## Also in the box

- [Extract Audio from Video](https://abox.tools/extract-audio-from-video/): Drop a video in and take the sound out of it. The picture is never decoded, and nothing is uploaded.
- [Audio Trimmer](https://abox.tools/trim-audio/): Mark the parts worth keeping as it plays. Get them back as one file, cut where you said.
- [Audio Editor](https://abox.tools/edit-audio/): Play it backwards, change the speed, lift a quiet recording — all of it here, on your machine.
- [PDF Merger & Splitter](https://abox.tools/merge-pdf/): Pages moved around without a round trip to a server.

## Questions

### Is my document uploaded anywhere?

No. The photo is decoded, straightened, cleaned up and written into a PDF by your own browser on your own hardware. This tool has no network feature of any kind — it never fetches anything and never sends anything — and the page's `Content-Security-Policy` names every address it may contact, none of which belongs to this site. Load the page once, unplug from the internet, and it still works.

### How does it find the corners of the page without a model?

By looking for the four long straight edges a rectangle is made of. The photo is shrunk, the gradient is taken — where the picture changes, and in which direction — and every pixel that sits on an edge votes for the straight line it would lie on. The strong lines are paired into candidate rectangles, and each candidate is scored by walking its four sides and asking how much of each one really has an edge under it, and whether the four of them are the boundary of one thing: a page is lighter than what is around it, or darker, but it is the same one on all four sides, which is what stops a line of text being mistaken for the bottom of the page. There are no weights, nothing is downloaded, and the arithmetic is the same arithmetic for every document put through it.

### The corners it found are wrong. What now?

Drag them. The corners are a starting position and never a decision: the scan is taken from wherever the four of them end up. Press anywhere on the photo and the nearest corner jumps to your finger, which is easier than hitting a small handle, and the arrow keys move the focused corner one pixel at a time. The page also tells you when the corners are a guess rather than a finding, and marks that page in the strip — a page lying on a desk of about its own colour is the usual reason, because there is genuinely almost no edge there to find.

### Why does the straightened page come out the right shape, and not squashed?

Because the shape is recovered from the perspective rather than measured off the edges. A page photographed at an angle has its far edge foreshortened, so the obvious method — take the longest pair of opposite edges and call that the ratio — produces a visibly squat A4, which is what most web scanners give you. A photograph of a rectangle actually carries enough information to recover both the rectangle's aspect ratio and the camera's focal length, given only that the camera is an ordinary one; that is a result of Zhang and He's from 2003, and it is what `src/geometry.js` does. Where the photo was taken square-on there is no perspective to work from and none is needed, because the edges are then exact — so it falls back to them, and the page says which of the two answered.

### What does “cleaned up” actually do to the picture?

It divides out the light. The paper's own brightness is measured across the page — a grid of tiles, and in each tile a high percentile of the brightness, which text is too dark and too sparse to move — and every pixel is divided by the paper estimated at that point. What is left is the ink, evenly lit, with the shadow and the falloff gone. That is not the same as raising the contrast: raising the contrast of a photographed page makes the bright part white, the dark part black, and the writing in the dark part unreadable, which is why “auto levels” makes these pictures worse rather than better.

### Why is the black and white mode so much smaller?

Because a picture with two colours in it is genuinely a fraction of the data of a picture with sixteen million, and it is stored that way here: one bit per pixel, packed eight to the byte and compressed exactly, rather than as a JPEG of a black and white picture. On the same pages it comes out about eighteen times smaller than the colour mode does, so a twenty page contract lands under a megabyte rather than at something like fifteen. The threshold is Sauvola's, which decides each pixel against the mean and the spread of its own neighbourhood rather than against one number for the whole page — that is what keeps the writing inside a shadow. It has no half tones, so a page with a photograph on it should use one of the other modes.

### Can I put several pages in one PDF?

Yes. Every photo you add becomes another page, in the order they are listed, and each page keeps its own corners — so a stack of pages photographed one after another becomes one document. The arrows on each page in the strip move it earlier or later. The cleanup setting is shared by all of them on purpose: pages in one document that were cleaned up differently look like two documents.

### Does it read the text, so I can search the PDF?

No. There is no text layer and no character recognition: what comes out is a picture of the page on a page. Doing it properly would mean an OCR engine, which is tens of megabytes of model to download — and a document scanner that fetched a model before it could read your payslip would be a document scanner that had a reason to phone home about payslips. If you need the text, the black and white mode produces exactly the sort of file that OCR software on your own machine works best on.

### It came out blurry. Why?

Almost always because the page was small in the photo. The panel under the preview says how much of the frame the page filled and roughly how many dots per inch that works out at across a sheet of that size — below about 150 DPI a printed scan looks soft, and there is nothing any tool can do about detail that was never in the file. Move closer rather than zooming, hold still, and let the camera focus on the page before pressing the button. Camera shake is the other cause, and it is not recoverable either.

### Is it free, and do I need an account?

It is free, and there is no account, no sign-in, no trial, no page limit and no watermark. There is no limit on the size of the photos either, because there is no server paying for it — the work happens on your own machine. The site carries advertising, which is what pays for it; the ads are not given anything about your documents.

## How the privacy claim is verifiable

- **Your documents have nowhere to go.** The Content-Security-Policy names every address this page may contact, and not one of them belongs to this site. There is no endpoint here that your photos could be collected at, and nothing in the code that would send them if there were.
- **There is no model, so there is nothing to download and nothing to ask.** Finding the four corners of a page is done with arithmetic: the gradient of the picture, a vote for the straight lines in it, and a check of what is actually underneath each side of the rectangle that wins. No weights, no inference runtime, nothing fetched on first use, and nothing that behaves differently on somebody else's document than on yours — see `src/detect.js`.
- **The document carries no date, no author and no machine name.** A scan is something people send to other people, usually because an office asked for it. The only thing written into the PDF besides the pages themselves is the name of this tool, and a title if you type one. There is no creation date, no author, no serial number and nothing derived from your clock, your filenames or your computer — see `src/document.js`.
- **Nothing here fetches anything.** There is no `fetch`, no `XMLHttpRequest` and no `sendBeacon` anywhere in `src/`. The work is `getImageData`, some loops over the bytes, and the browser's own JPEG encoder — all of it already installed on your machine.
- **It works offline.** Disconnect from the network and the tool is unchanged, because there was never a network step in it. That is the simplest proof of all — and the one worth running before you scan a passport.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/detect.js` for how the corners are found without a model of any kind, `src/warp.js` for the straightening, and `src/clean.js` for how the uneven light is divided out.
