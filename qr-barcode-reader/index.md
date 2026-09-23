# QR & Barcode Reader — scan a QR code from an image or your camera

Point it at a code, or drop a picture of one. It is read here, and nowhere else.

> Read a QR code from a photo, a screenshot or your camera, and see exactly where the link goes before you open it. EAN, UPC, Code 128, Code 39 and ITF barcodes too. Nothing is uploaded.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/qr-barcode-reader/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your pictures and the codes in them are **never uploaded**. There is no server.

Reading a code is arithmetic over pixels, and the pixels are already here. Finding the symbol, correcting for the angle, undoing the mask, repairing the damage with Reed-Solomon and reading the bits back out all happen in about two thousand lines of JavaScript in this page that you can read. **The camera is the same promise, not an exception to it:** a frame arrives as pixels in this tab, is examined, and is gone. Nothing is recorded, nothing is kept, and this page has no network feature of any kind to send one with.

- ✗ No upload
- ✗ No account
- ✗ Nothing recorded
- ✓ Works offline
- ✓ Open source

## How to read a QR code without uploading the picture

1. **Give it the picture.** Drop a photograph or a screenshot on the box, paste one straight in, or press the camera button. Several at once is fine — each is read on its own and each gets its own answer. A screenshot of a code that is already on your screen is the fastest way in and the most reliable, because there is no lens, no angle and no light involved.
2. **Get the whole symbol in frame, margin included.** The white space around a code is part of the code: it is how a reader finds where the symbol ends. A photograph cropped to the edge of the squares is the single most common reason one will not read, and filling about half the frame with the code is about right — closer than that and the corners fall outside the picture.
3. **Read the address before you decide anything.** The point of scanning a code on a poster, a parking meter or a letter is to find out where it goes, and that is the one thing a phone camera does not really let you do. The host is printed here on its own line. If it is not a name you were expecting, you have already got what you came for and there is nothing left to open.
4. **Take the warnings seriously, especially the quiet ones.** A plain `http://` address, a name in an alphabet that is not the one it appears to be in, a link shortener, or anything before an `@` in the address — each of those is named where it appears. None of them proves anything on its own. All of them are worth ten seconds before you go there.
5. **If it will not read, change the light before you change anything else.** Almost every failure is a threshold problem: a reflection across the middle, a shadow over one corner, or a screen photographed at an angle that catches the backlight. Move so the glare is off the code, or turn the camera light on. Failing that, take one flat, straight-on photograph and drop that in — a still picture gets a far more thorough search than a live frame can.
6. **Check the sampled picture if the answer looks odd.** Open “how this one was read” and look at the little grid. It is what this page believed the code to be, drawn back out of the modules it sampled. A reader that misread a symbol and repaired it into something plausible will show it there, and nowhere else.

## The longer version

[How to make a QR code and prove it scans](https://abox.tools/guides/make-a-qr-code-and-prove-it-scans/): Generate the code, then verify it with a reader on the same site - the exact payload, the real link, at print size and from a photo - before the print run. All in the browser, nothing uploaded.

## Also in the box

- [Hash & Checksum](https://abox.tools/hash-checksum/): Check a download against the number the publisher printed, without sending it to anyone.
- [Password & Passphrase Generator](https://abox.tools/password-generator/): Made here, by your own browser, and never sent anywhere. Nothing is stored and there is no history.
- [JSON Formatter](https://abox.tools/json-formatter/): JSON, XML, HTML, CSS and YAML, formatted or converted. Nothing is pasted into anyone else's server.
- [YAML to JSON Converter](https://abox.tools/yaml-to-json/): Both directions, and it says what each one costs. Nothing is pasted into anyone else's server.

## Questions

### Is the picture uploaded anywhere?

No, and neither is anything read out of it. The picture is decoded onto a canvas in this page and read there, by JavaScript served from this site. This tool has no network feature of any kind — it never fetches anything and never sends anything — and the page's `Content-Security-Policy` names every address it may contact, none of which belongs to us. The plainest proof is to disconnect from the internet: it keeps working.

### Does the camera record anything?

No. A camera frame arrives as pixels in this tab, is drawn onto a canvas, is examined, and is overwritten by the next frame about a tenth of a second later. Nothing is written to disk and nothing is kept. The stream stops the moment you press stop, when the tab goes into the background, and when you leave the page — and the light on your camera is the indicator to trust, because no page can turn that off.

### Why does it show me the link instead of opening it?

Because that is the useful part. A QR code is an address you cannot read, which is the whole reason a sticker over the code on a parking meter works: by the time you know where it went, you are there. Here the string is printed in full, the host is called out on its own line, and opening it is a separate button you press after reading it. That is one extra click and it is the click the format has always needed.

### What can it read?

QR codes at every version from 1 to 40, at all four error-correction levels, in numeric, alphanumeric, byte and kanji mode, with ECI character sets and structured-append symbols reported rather than silently dropped. On the striped side: EAN-13, EAN-8, UPC-A, UPC-E, ITF-14, Interleaved 2 of 5, Code 128 and Code 39. It does not read Data Matrix, PDF417, Aztec or MaxiCode.

### It will not read my code. What is wrong?

Nine times in ten it is one of three things. The white margin is cropped off, and a reader uses that margin to find where the symbol ends. There is a reflection or a shadow across part of the code, so no threshold separates the dark squares from the light ones. Or the code is too small in the frame for its modules to be more than a pixel or two across. Move the light, fill about half the frame, and take the picture straight on rather than at an angle.

### Can it read a code that is damaged or partly covered?

Often, yes, and that is the format working as designed rather than anything clever here. Every QR code carries Reed-Solomon check data, and a symbol made at level H can lose about 30% of its modules and still be rebuilt exactly. The page says how many codewords it had to repair under “how this one was read”, so you can see how close to the edge it was. What it will not do is guess: a symbol damaged past what the checks can carry is reported as unreadable rather than answered wrongly.

### Why does it say it cannot tell me where a bit.ly link goes?

Because finding out would mean asking bit.ly, and that is a network request. Every other claim on this page rests on there being no code here that contacts anything, and quietly making an exception for this would be worth less than the answer. So the shortener is named, and what it hides is left honestly unknown. If you want to resolve it, paste it into something that is willing to fetch.

### Is it safe to scan a QR code at all?

Scanning one is safe. Acting on one is the risk, and it is a real one: codes stuck over the real one on parking meters, on restaurant tables and on parcel-delivery cards are now common enough to have a name. What makes them work is that nobody can read a code by looking at it. Reading it without opening it — which is what this page does — removes the whole of that advantage, and the ten seconds it takes to look at the host is the entire defence.

### What is the little grid under each result?

The modules this page actually sampled off your picture, drawn back out at one square per module. It is there so the reading can be checked by eye rather than trusted: if that grid looks like the code you photographed, the answer above it came from the right pixels. Almost no reader shows you this, and it is the difference between a tool you can check and one you have to believe.

### Does it read several codes in one picture?

One per picture, for now. Drop several pictures at once and each is read on its own, and the camera reads code after code as you move it, keeping each new one it has not already seen. A single photograph holding a sheet of codes is a job for cropping it, or for pointing the camera at them one at a time.

### Why did it say my barcode is a different format from the one I asked for?

Because a barcode does not carry its own name. UPC-A is an EAN-13 whose first digit is zero, ITF-14 is Interleaved 2 of 5 with fourteen digits and a valid check digit, and Code 128 in its numeric mode looks like nothing else. What this page reports is what the bars say plus what the check digit confirms, which is as much as the symbol itself knows.

### Does it work offline?

Yes. Load the page once, then disconnect from the internet and it keeps working, camera and all. That is also the simplest way to prove nothing is being uploaded: a reader that sent your picture away to be decoded would stop the moment you unplugged.

## How the privacy claim is verifiable

- **The picture is never uploaded, and the camera is not an exception.** A photograph you drop here is decoded onto a canvas in this page and read there. A camera frame is the same thing arriving thirty times a second: it is drawn onto that canvas, examined, and overwritten by the next one. No frame is recorded, none is kept, and the camera light going out when you press stop is the whole of it.
- **Nothing here fetches anything.** There is no `fetch`, no `XMLHttpRequest` and no `sendBeacon` anywhere in `src/`, and the page's `Content-Security-Policy` leaves no address this origin could send to even if there were. That is why this page cannot tell you where a shortened link ends up: finding out would mean asking, and it does not ask.
- **It shows you the address. It never opens it.** A printed QR code is an address nobody can read, which is exactly what makes a sticker over one worth somebody's trouble. Nothing is opened here. The whole string is printed for you to look at, the host it would actually reach is called out on its own, and the tricks that make one address look like another — a username before an `@`, a name written in a script whose letters are shaped like ours, a redirect — are named where they appear.
- **It shows you what it sampled, too.** Under every QR result is a picture of the modules this page actually read off your photograph. If it looks like the code you scanned, the answer above it is sound; if it looks like static, it is not. No reader that hands you a string and nothing else can be checked that way.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google, and the donate button from Buy Me a Coffee. None of them is handed a picture, a frame, or anything read out of one. Every line that turns pixels into a string is served from this origin and listed in the repository.
- **It works offline.** Disconnect from the network and the tool is unchanged, camera included, because there was never a network step in it. That is the simplest proof of all.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/binarize.js` and `src/detect.js` for finding a symbol in a photograph — the threshold, the finder patterns and the perspective transform — `src/qr-decode.js` for reading it back, `src/reed-solomon.js` for repairing what was misread, `src/linear.js` for the striped ones, and `src/camera.js`, which is every line in this page that touches a camera.
