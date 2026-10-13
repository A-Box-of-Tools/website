# Image Compressor — fit an image under a size limit

Name the size. It works out the rest.

> Compress a JPEG, PNG, WebP or AVIF to fit a file-size limit, such as 100 KB or 2 MB. The result aims at or below your target, not an exact byte count. No upload, works offline.

This is an interactive browser tool at https://abox.tools/compress-image/. Files are processed on the device running that browser. Any deliberate sharing or optional network feature is described on the page. What follows is its written explanation; open the address to use it.

## Your images are **processed in your browser**. No processing upload.

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

[How to Compress an Image Under a File-Size Limit](https://abox.tools/guides/compress-an-image-to-a-target-size/): An upload form wants 500 KB and your photo is 4 MB. What a size limit really costs, which setting to move first, and why a PNG will not shrink the way a JPEG does.

## Also in the box

- [Image Resizer](https://abox.tools/resize-image/): Say the size. Draw the box. Pick the format.
- [Image Layout](https://abox.tools/image-layout/): Put your pictures together. Keep them on your machine.
- [HEIC to JPG](https://abox.tools/heic-to-jpg/): The photos an iPhone makes, in a format everything opens.
- [WebP to JPG](https://abox.tools/webp-to-jpg/): The pictures the web saves, in the format everything still takes.

## Questions

### Is my image uploaded anywhere?

No. The file is decoded, compressed and measured by your own browser on your own hardware, using the JPEG, PNG and WebP encoders the browser already ships with. This tool has no network feature of any kind — it never fetches anything and never sends anything — and the page's `Content-Security-Policy` names every address it may contact, none of which belongs to this site.

### How does it fit a file-size limit?

It encodes and measures several candidates, then searches for the highest quality that fits. The result is at or below the target when a fitting candidate can be produced, not necessarily the exact number of bytes you entered. A file already under the limit stays unchanged. If quality alone cannot fit, the tool reduces the dimensions; inspect the result before using it.

### What does "minimal loss" actually mean here?

Three specific things. First, an image already under your target is passed through byte for byte rather than re-encoded. Second, quality is spent before resolution, and only down to a floor where compression artefacts start to show — past that point the tool makes the picture smaller and puts the quality back up, because fewer good pixels look better than more ruined ones. Third, once a fitting result is found the search pushes back up until the budget is used, so you do not get a 300 KB file when you asked for 500 KB.

### What are the SSIM and PSNR figures on each result?

They are a measurement of what the compression cost, taken by decoding the result and comparing it with the original picture. SSIM compares local brightness, contrast and structure, which is much closer to what an eye objects to than counting changed pixels; above about 0.98 the two are hard to tell apart side by side. PSNR is the traditional decibel figure. Both are computed on your machine, and both are shown so that the claim of low loss is checkable rather than just asserted.

### Which formats can it read and write?

It reads pictures your browser can decode, including JPEG, PNG, WebP, GIF, BMP and AVIF. New encodes use JPEG, PNG or WebP. Files already under the target are returned unchanged, including their original format and metadata. When encoding is needed, Auto starts with the source format if the browser can write it; otherwise GIF starts as PNG and AVIF, BMP or an unknown MIME type starts as JPEG. Auto may then choose WebP if it meets the target with less visible loss.

### Why can it not compress a PNG very far?

Because PNG is lossless: it has no quality dial to turn. The only way to make a PNG smaller is to give it fewer pixels or fewer colours, so with PNG selected the tool reaches a target by resizing alone. If the picture is a photograph, JPEG or WebP will get far closer to your target at a size you can see is fine — and if it is a logo or a screenshot with transparency, WebP keeps the transparency that JPEG would fill in with white.

### Does compressing an image remove its EXIF and GPS data?

A re-encoded result leaves out the original EXIF, GPS, timestamps and other metadata because the canvas carries pixels only. A file already under the target is returned unchanged, with its metadata still present. [EXIF Viewer & Remover](https://abox.tools/exif-editor/) reads and edits JPEG, PNG and WebP metadata without re-encoding their pictures. For AVIF, it shows available EXIF as read-only and cleans by converting the first decoded image to a new PNG; color or HDR may change.

### Is it free, and do I need an account?

It is free, and there is no account, no sign-in, no trial and no watermark. There is no limit on the number or the size of the files either, because there is no server paying for them — the work happens on your own machine. The site carries advertising, which is what pays for it; the ads are not given anything about your images.

### Does it work offline?

Yes. Load the page once, then disconnect from the internet and it keeps working. That is also the simplest way to prove nothing is being uploaded: a tool that sent your images away to be compressed would stop the moment you unplugged.

## How the privacy claim is verifiable

- **Processing happens in this browser.** This tool processes input and results inside your browser. Its processing code does not upload them for processing. Content-Security-Policy restricts permitted resources and connection destinations, but allowed hosts can still receive requests: the policy does not inspect payloads and alone cannot prove that nothing is sent. Compare the source with the requests for the operation you use, or complete that local operation while disconnected.
- **Nothing here fetches anything.** There is no `fetch`, no `XMLHttpRequest` and no `sendBeacon` anywhere in `src/`. The compression is `canvas.toBlob` — the encoder that is already installed in your browser.
- **The numbers are measured, not reported.** The sizes, the quality figure and the SSIM comparison are all computed on this page and shown to you. There is no custom analytics event in this repository that carries a filename, a size, a count or a result.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google, and the donate button from Buy Me a Coffee. None of them is handed anything about your pictures. Every line that reads, compresses or measures a file is served from this origin and listed in the repository.
- **It works offline.** Disconnect from the network and the tool is unchanged, because there was never a network step in it. That is the simplest proof of all.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/compress.js` for the search that decides how much quality to spend, and `src/measure.js` for the comparison behind the "visual match" figure.
