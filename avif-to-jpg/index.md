# AVIF to JPG

The format websites save now, in the one everything has always taken.

> Convert AVIF images to JPG in your browser. Your browser already decodes AVIF, so nothing is uploaded, there is no account, and it works offline. Transparency is filled with a colour you choose.

This is an interactive browser tool at https://abox.tools/avif-to-jpg/. Files are processed on the device running that browser. Any deliberate sharing or optional network feature is described on the page. What follows is its written explanation; open the address to use it.

## Your pictures are **processed in your browser**. No processing upload.

The converting runs in your own browser, on your own hardware. There is no decoder to download and nothing to wait for — your browser has read AVIF since 2021, which is precisely why the picture you cannot open in anything else displays perfectly well in a browser tab. This page uses that decoder, draws the picture, and writes a JPEG beside it. There is no network feature here at all, and no server on the other end to send a photo to.

- ✗ No upload
- ✗ No account
- ✗ No size limit
- ✓ Works offline
- ✓ Open source

## How to convert an AVIF to JPG

1. **Choose your AVIF files.** Drop them onto the picker or select them by hand. Every file is identified by its first bytes rather than by its name, so an AVIF that a download renamed still works, and a file that is genuinely a PNG is turned away with a line saying what it actually is.
2. **Set the quality, and the colour behind any transparency.** The slider starts at 92, which is where a photograph is hard to tell from the original. The colour field appears only if something on the list is see-through, because a JPEG has to put something there.
3. **Press “Convert”, and download.** Each result says what it came from, what it weighs now and how that compares — usually a good deal more, because AVIF is a much better codec and you are trading bytes for compatibility. One file gives you a download button; several give you a zip as well.

## The longer version

[The file nothing will open, except the thing you are reading this in](https://abox.tools/guides/convert-avif-to-jpg/): Downloaded a picture and got a .avif that no program will open? Your browser reads it perfectly, which is why converting needs no upload. What AVIF is, what a JPEG cannot carry over, and why the JPG comes out several times larger.

## Also in the box

- [ID Photo Maker](https://abox.tools/id-photo/): Choose a supported country and document. Published rules and guidance are marked.
- [Image Stacker](https://abox.tools/stack-images/): Average a steady burst, take the median for a clear background, or lighten a night-sky sequence.
- [Image Redactor](https://abox.tools/redact-image/): What you cover is deleted from the file, not covered up in it.
- [EXIF Viewer & Remover](https://abox.tools/exif-editor/): See what a photo says about you. Then take it out.

## Questions

### Is my picture uploaded anywhere?

No. The file is read, decoded and written by your own browser on your own hardware. This tool has no network feature of any kind — it never fetches anything and never sends anything — and the page's `Content-Security-Policy` names every address it may contact, none of which belongs to this site. There is not even a decoder to load first: your browser already had one.

### Why will nothing on my computer open this file?

Because AVIF is new where it counts. Websites started serving it because it is dramatically smaller than a JPEG at the same quality, so saving a picture from one now hands you a `.avif` — and the software you then open it in is often older than the format. Windows needs an extension for it, a lot of desktop editors still refuse it, and most e-readers, printers and upload forms have never heard of it. Your browser, meanwhile, reads it perfectly, which is why this page can help and is also why the file arrived in the first place.

### Will the JPG be bigger than the AVIF?

Almost certainly, often by several times, and the result says by how much rather than hiding it. AVIF is one of the best still-image codecs there is and JPEG is one of the oldest, so a picture that is 40 KB as an AVIF can easily be 200 KB as a JPEG of the same visible quality. That is the trade: bytes for compatibility. If the size matters afterwards, the [Image Compressor](https://abox.tools/compress-image/) will take the JPEG down to a figure you name.

### What happens to transparency?

It is filled with a colour you choose, and the page says so before you press anything. AVIF has an alpha channel and a JPEG does not, so there is no version of this where the transparency survives — only a question of what goes underneath, which is your decision rather than the converter's. In practice most AVIFs are photographs with nothing see-through in them, so the field never appears. If you need the transparency kept, convert to PNG or WebP with the [Image Compressor](https://abox.tools/compress-image/), which reads AVIF and writes both.

### What about HDR and 10-bit colour?

This tool writes an ordinary 8-bit SDR JPEG from a browser canvas. Extra AVIF bit depth and HDR information are not preserved, and colours or bright highlights may change. Keep the original for archiving. JPEG-based HDR formats do exist: [Android’s Ultra HDR specification](https://developer.android.com/media/platform/hdr-image-format) describes a gain map, which this tool does not create.

### Is the picture re-compressed?

Yes, and it has to be: AVIF and JPEG are different codecs, so there is no way to move from one to the other without decoding the picture and encoding it again. That is true of every AVIF converter there is, including the ones that ask you to upload. What you control is how much it costs, and the slider defaults to 92, where a photograph is very hard to tell from the original.

### Can you convert the other way, JPG to AVIF?

Not here. This tool uses the browser’s canvas encoder and ships no AVIF encoder. An unsupported canvas output type falls back to PNG, so changing the file extension would not create an AVIF. Other tools can encode AVIF locally with a separate encoder; that does not require uploading. [Canvas output rules](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob) explain the fallback.

### Does it keep the date, camera and location?

No. The picture is drawn onto a canvas and a canvas holds pixels and nothing else, so EXIF, GPS, colour profiles and XMP are left behind. For a picture saved off a web page there is usually nothing there anyway. If you need to see or edit what a file carries, the [EXIF Viewer & Remover](https://abox.tools/exif-editor/) does that without re-compressing the picture.

### Can it do a whole folder at once?

Yes. Drop in as many as you like — there is no limit on the number or the size, because there is no server paying for them. Each one gets its own row and its own download, and two or more give you a zip of the lot.

### Is it free, and does it work offline?

It is free, with no account, no sign-in, no trial and no watermark; the site carries advertising, which is what pays for it, and the ads are not given anything about your pictures. And yes — load the page once, then disconnect from the internet and it keeps working exactly as before, which is also the strongest proof available that nothing is being uploaded.

## How the privacy claim is verifiable

- **Processing happens in this browser.** This tool processes input and results inside your browser. Its processing code does not upload them for processing. Content-Security-Policy restricts permitted resources and connection destinations, but allowed hosts can still receive requests: the policy does not inspect payloads and alone cannot prove that nothing is sent. Compare the source with the requests for the operation you use, or complete that local operation while disconnected.
- **The decoder is already in your browser, which is the whole trick.** An AVIF that will not open in your photo viewer opens fine in a browser tab, because Chrome and Firefox have decoded AVIF since 2021 and Safari since 2023. This page is that decoder with a save button: it opens the file the way the browser already can, draws it, and writes a JPEG. So there is no engine to download, nothing to wait for on the first conversion, and no reason for a server to be involved — which is exactly what the converters asking you to upload are not telling you.
- **The see-through parts, and what goes behind them.** AVIF can carry an alpha channel and a JPEG cannot, so something has to go underneath. This page asks which colour and defaults to white, and it only asks when a file on the list really has transparency in it — which is read off the decoded pixels rather than guessed. Most AVIFs saved from websites are photographs with nothing see-through in them at all, so the field usually stays out of the way.
- **What this conversion does not preserve.** This tool writes an ordinary 8-bit SDR JPEG from a browser canvas. Extra AVIF bit depth and HDR information are not preserved, and colours or bright highlights may change. Keep the original for archiving.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google, and the donate button from Buy Me a Coffee. None of them is handed anything about your pictures. Every line that reads, decodes or writes a file is served from this origin and listed in the repository.
- **It works offline.** Load the page once and disconnect from the network, and the tool is unchanged. That is the simplest proof of all: a converter that sent your pictures away to be converted could not possibly manage it.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, and `src/shared/image-convert.js` for the conversion — the brand sniffing that decides a file really is an AVIF, the decode, and the canvas the JPEG is written from. It is the same file the other two format converters use and there is no codec in it.
