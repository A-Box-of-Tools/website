# Image Compressor — compress to an exact size

Name the size. It works out the rest.

> Compress a JPEG, PNG or WebP to an exact size - 100 KB, 2 MB, anything. Runs entirely in your browser: nothing uploaded, no account, works offline.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/compress-image/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your images are **never uploaded**. There is no server.

The compression runs in your own browser, on your own hardware, using the encoders it already ships with. This tool has no network feature of any kind — nothing to fetch, nothing to send — and there is no server on the other end of this page to send a picture to even if there were.

- ✗ No upload
- ✗ No account
- ✗ No size limit
- ✓ Works offline
- ✓ Open source

## How to compress an image to a specific size

1. **Choose your images.** Drop them onto the picker or select them by hand. They are read straight off your disk by the browser; nothing is sent anywhere while you do it.
2. **Type the size you were told to hit.** 100 KB for the upload form that keeps refusing your photo, 500 KB for the application portal, 2 MB for a page that has to load quickly. The four common ones are buttons.
3. **Press "Compress to the target".** Each image is encoded several times while the tool narrows in on the highest quality that fits. Anything already under the target is left exactly as it is.
4. **Check what it cost, then download.** Every result says what it was written as, at what quality, whether the dimensions changed, and how closely it matches the original when measured. "Compare" puts the two pictures side by side.

## The longer version

[How to compress an image to an exact file size](https://abox.tools/guides/compress-an-image-to-a-target-size/): An upload form wants 500 KB and your photo is 4 MB. What a size limit really costs, which setting to move first, and why a PNG will not shrink the way a JPEG does.

## Also in the box

- [Image Resizer](https://abox.tools/resize-image/): Say the size. Draw the box. Pick the format.
- [HEIC to JPG](https://abox.tools/heic-to-jpg/): The photos an iPhone makes, in a format everything opens.
- [ID Photo Maker](https://abox.tools/id-photo/): Pick the country. It applies that country's rule, exactly.
- [Image Stacker](https://abox.tools/stack-images/): Twenty frames into one, without twenty uploads or a RAW converter.

## Questions

### Is my image uploaded anywhere?

No. The file is decoded, compressed and measured by your own browser on your own hardware, using the JPEG, PNG and WebP encoders the browser already ships with. This tool has no network feature of any kind — it never fetches anything and never sends anything — and the page's `Content-Security-Policy` names every address it may contact, none of which belongs to this site.

### How does it hit an exact size?

By trying. There is no formula that turns a quality setting into a byte count — it depends entirely on the picture — so the tool encodes the image several times and searches for the answer. It starts at the top of the quality range and narrows in by halving, which finds the highest quality that fits in about eight encodes. Every size you see on the page is a real encoded file, not an estimate.

### What does "minimal loss" actually mean here?

Three specific things. First, an image already under your target is passed through byte for byte rather than re-encoded. Second, quality is spent before resolution, and only down to a floor where compression artefacts start to show — past that point the tool makes the picture smaller and puts the quality back up, because fewer good pixels look better than more ruined ones. Third, once a fitting result is found the search pushes back up until the budget is used, so you do not get a 300 KB file when you asked for 500 KB.

### What are the SSIM and PSNR figures on each result?

They are a measurement of what the compression cost, taken by decoding the result and comparing it with the original picture. SSIM compares local brightness, contrast and structure, which is much closer to what an eye objects to than counting changed pixels; above about 0.98 the two are hard to tell apart side by side. PSNR is the traditional decibel figure. Both are computed on your machine, and both are shown so that the claim of low loss is checkable rather than just asserted.

### Which formats can it read and write?

It reads anything your browser can decode, which in practice means JPEG, PNG, WebP, GIF, BMP and — on most current browsers — AVIF. It writes JPEG, PNG and WebP, because those are the encoders browsers ship. On "auto" it keeps the format your file arrived in, and switches to WebP only when keeping it would have meant a resize or a visible drop in quality.

### Why can it not compress a PNG very far?

Because PNG is lossless: it has no quality dial to turn. The only way to make a PNG smaller is to give it fewer pixels or fewer colours, so with PNG selected the tool reaches a target by resizing alone. If the picture is a photograph, JPEG or WebP will get far closer to your target at a size you can see is fine — and if it is a logo or a screenshot with transparency, WebP keeps the transparency that JPEG would fill in with white.

### Does compressing an image remove its EXIF and GPS data?

Yes, as a side effect. Compressing means decoding the picture to pixels and encoding those pixels again, and a canvas full of pixels carries no tags, so the location, camera model, timestamps and everything else are simply not written to the new file. If you want the metadata gone but the picture untouched, use the [EXIF Viewer & Remover](https://abox.tools/exif-editor/) instead — it rewrites the container without re-compressing anything.

### Is it free, and do I need an account?

It is free, and there is no account, no sign-in, no trial and no watermark. There is no limit on the number or the size of the files either, because there is no server paying for them — the work happens on your own machine. The site carries advertising, which is what pays for it; the ads are not given anything about your images.

### Does it work offline?

Yes. Load the page once, then disconnect from the internet and it keeps working. That is also the simplest way to prove nothing is being uploaded: a tool that sent your images away to be compressed would stop the moment you unplugged.

## How the privacy claim is verifiable

- **Your images have nowhere to go.** The Content-Security-Policy names every address this page may contact, and not one of them belongs to this site. There is no endpoint here that your files could be collected at, and nothing in the code that would send them if there were.
- **Nothing here fetches anything.** There is no `fetch`, no `XMLHttpRequest` and no `sendBeacon` anywhere in `src/`. The compression is `canvas.toBlob` — the encoder that is already installed in your browser.
- **The numbers are measured, not reported.** The sizes, the quality figure and the SSIM comparison are all computed on this page and shown to you. There is no custom analytics event in this repository that carries a filename, a size, a count or a result.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google, and the donate button from Buy Me a Coffee. None of them is handed anything about your pictures. Every line that reads, compresses or measures a file is served from this origin and listed in the repository.
- **It works offline.** Disconnect from the network and the tool is unchanged, because there was never a network step in it. That is the simplest proof of all.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/compress.js` for the search that decides how much quality to spend, and `src/measure.js` for the comparison behind the "visual match" figure.
