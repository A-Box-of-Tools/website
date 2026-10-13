# Image Resizer — resize, crop and convert

Say the size. Draw the box. Pick the format.

> Resize, crop and convert JPEG, PNG, WebP and AVIF images in your browser. Exact pixels, a percentage, or a long edge - one image or a whole folder. Nothing is uploaded.

This is an interactive browser tool at https://abox.tools/resize-image/. Files are processed on the device running that browser. Any deliberate sharing or optional network feature is described on the page. What follows is its written explanation; open the address to use it.

## Your images are **processed in your browser**. No processing upload.

The resizing, the cropping and the format change all run in your own browser, on your own hardware, using the image encoders it already ships with. This tool has no network feature of any kind — nothing to fetch, nothing to send — and there is no server on the other end of this page to send a picture to even if there were.

- ✗ No upload
- ✗ No account
- ✗ No watermark
- ✓ Works offline
- ✓ Open source

## How to resize an image without uploading it

1. **Choose your images.** Drop them onto the picker or select them by hand. They are read straight off your disk by the browser; nothing is sent anywhere while you do it.
2. **Crop, if you want to.** The box starts on the whole picture, so leaving it alone crops nothing. Drag it, or lock it to a shape — 1:1 for a profile picture, 9:16 for a story, 16:9 for a thumbnail — and press "Largest" for the biggest one that fits. Every image keeps its own box: click any row in the list to draw on that one instead. If they should all be framed the same way, one button does that too.
3. **Say what size it should come out.** A width, a height, or both; a long edge, which keeps portrait and landscape shots the same size as each other; or a plain percentage. Leave one of the two boxes blank and the picture keeps its own shape.
4. **Pick the format, then press the button.** Keep what each file arrived as, or write everything as JPEG, PNG or WebP. Each result says what it became and how much smaller it got; click one to open it full size with every figure behind it, and the original beside it to compare against. A batch comes down as one zip.

## The longer version

[How to resize an image without wrecking it](https://abox.tools/guides/resize-an-image/): What changes when you resize: fine detail lost when shrinking, interpolation when enlarging, fitting a different shape, and choosing when to crop.

## Also in the box

- [Image Layout](https://abox.tools/image-layout/): Put your pictures together. Keep them on your machine.
- [HEIC to JPG](https://abox.tools/heic-to-jpg/): The photos an iPhone makes, in a format everything opens.
- [WebP to JPG](https://abox.tools/webp-to-jpg/): The pictures the web saves, in the format everything still takes.
- [PNG to WebP](https://abox.tools/png-to-webp/): The same picture, often a third off, with the see-through parts intact.

## Questions

### Is my image uploaded anywhere?

No. The file is decoded, cropped, scaled and written by your own browser on your own hardware, using the JPEG, PNG and WebP encoders the browser already ships with. This tool has no network feature of any kind — it never fetches anything and never sends anything — and the page's `Content-Security-Policy` names every address it may contact, none of which belongs to this site.

### What happens if I give it a width but not a height?

The height follows from the picture's own shape, which is almost always what was wanted: "1920 wide" means "1920 wide and whatever tall that makes it". Fill in both and the two can disagree with the shape of the picture, which is the only time the "if the shapes disagree" choice appears — fit inside the box, fill it and cut the overflow off, pad it out with a background, or stretch it and accept the distortion.

### Does resizing an image lose quality?

Shrinking removes pixels and can lose small text, thin lines and fine detail, even when a photo looks good at the intended display size. Enlarging cannot recover detail that was never recorded. JPEG and lossy WebP encoding can add further loss after resizing; PNG preserves the resized pixels, not the original detail. Check the result at the size where it will be used.

### Can I crop each image differently?

Yes — that is the default. Every image on the list carries its own box, in its own pixels, and clicking a row puts that image in the preview with its own box and its own locked shape back on it. Nothing you do to one affects another. Every box also starts on the whole picture, so an image you never draw on is not cropped at all.

### Can it crop a whole batch the same way at once?

Yes, with the button under the preview. It gives every other image the same relative area — the same fractions of its own width and height — which for a set of screenshots or exports that are all the same size is the same box exactly, and the page says so. With a shape locked it gives each one the largest box of that shape inside that area instead, so pressing 1:1 and then that button gets you squares out of a folder of mixed portrait and landscape shots. Every box stays editable afterwards.

### Which formats can it read and write?

It reads anything your browser can decode, which in practice means JPEG, PNG, WebP, GIF, BMP and — on most current browsers — AVIF. It writes JPEG, PNG and WebP, because those are the encoders browsers ship. On "keep the format" a JPEG stays a JPEG and a PNG stays a PNG; anything the browser cannot write, such as a GIF or a BMP, comes out as PNG, which is the one that keeps transparency and flat colour intact.

### What happens to transparency when I save as JPEG?

It is filled in with the background colour, because JPEG has no alpha channel to store it in. The colour is yours to pick and starts at white, which is what most people want and what almost every other tool does without telling you. The same colour is used behind a padded frame. Save as PNG or WebP instead and the transparency comes through untouched.

### Does it remove EXIF and GPS data?

Anything it actually processes, yes, as a side effect: cropping or resizing means decoding the picture to pixels and encoding those pixels again, and a canvas full of pixels carries no tags, so the location, camera model and timestamps are simply not written to the new file. A file you are not changing at all is a different case — it is handed back byte for byte, tags and all. [EXIF Viewer & Remover](https://abox.tools/exif-editor/) reads and edits JPEG, PNG and WebP metadata without re-encoding their pictures. For AVIF, it shows available EXIF as read-only and cleans by converting the first decoded image to a new PNG; color or HDR may change.

### How is this different from the image compressor?

This one is about dimensions: you say how many pixels you want and it gives you that. The [Image Compressor](https://abox.tools/compress-image/) is about file size: you say how many kilobytes you are allowed and it searches for the highest quality that fits, resizing only if quality alone cannot get there. If you were told "1200 pixels wide", you are in the right place. If you were told "under 500 KB", the other one will get you closer.

### Is it free, and do I need an account?

It is free, and there is no account, no sign-in, no trial and no watermark. There is no limit on the number or the size of the files either, because there is no server paying for them — the work happens on your own machine. The site carries advertising, which is what pays for it; the ads are not given anything about your images.

### Does it work offline?

Yes. Load the page once, then disconnect from the internet and it keeps working. That is also the simplest way to prove nothing is being uploaded: a tool that sent your images away to be resized would stop the moment you unplugged.

## How the privacy claim is verifiable

- **Processing happens in this browser.** This tool processes input and results inside your browser. Its processing code does not upload them for processing. Content-Security-Policy restricts permitted resources and connection destinations, but allowed hosts can still receive requests: the policy does not inspect payloads and alone cannot prove that nothing is sent. Compare the source with the requests for the operation you use, or complete that local operation while disconnected.
- **Nothing here fetches anything.** There is no `fetch`, no `XMLHttpRequest` and no `sendBeacon` anywhere in `src/`. The resizing is one `drawImage` onto a canvas and one `canvas.toBlob` — the scaler and the encoder that are already installed in your browser.
- **A file nobody asked to change is not changed.** With no crop, no resize and no format change, the file you chose is handed straight back to you byte for byte rather than re-saved. That is not only politeness: it is why this tool cannot quietly re-encode a picture, or quietly drop the metadata of one you only wanted to look at.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google, and the donate button from Buy Me a Coffee. None of them is handed anything about your pictures. Every line that reads, crops, scales or writes a file is served from this origin and listed in the repository.
- **It works offline.** Disconnect from the network and the tool is unchanged, because there was never a network step in it. That is the simplest proof of all.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/geometry.js` for the arithmetic that decides what is kept and how large it comes out, and `src/codecs.js` for the single `drawImage` call that does the crop and the resize together.
