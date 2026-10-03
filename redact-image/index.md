# Image Redactor — black out, pixelate or blur

What you cover is deleted from the file, not covered up in it.

> Cover a name, an address or an account number in a photo or screenshot and re-encode the picture, so the hidden pixels are gone from the file rather than sitting under a rectangle. Runs entirely in your browser.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/redact-image/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your images are **never uploaded**. There is no server.

The picture is decoded, painted over and encoded again by your own browser, using the codecs it already ships with. This tool has no network feature of any kind — nothing to fetch, nothing to send — which matters more here than almost anywhere else on this site: the pictures people bring to a redaction tool are the ones with a name, an address or an account number still legible on them.

- ✗ No upload
- ✗ No account
- ✗ No watermark
- ✓ Works offline
- ✓ Open source

## How to redact an image so the hidden part is really gone

1. **Choose the image.** A screenshot, a scan or a photo — anything your browser can open. It is read straight off your disk; nothing is sent anywhere while you do it.
2. **Drag a box over what should not be seen.** Drag again for the next one. A box can be moved, resized by its handles, or reached with the Tab key and moved with the arrows. What appears under the box is the real result, drawn by the same code that writes the file.
3. **Choose black, pixelate or blur — and prefer black.** A black fill leaves nothing at all. Pixelating and blurring replace the pixels with averages of themselves, which is enough for a face in the background and is not enough for anything that reads as text.
4. **Press "Redact and save", then check the file.** The picture shown afterwards is the finished file, decoded again. Open it in an editor and look for a layer or try to select the covered text: there is one flat picture, and the parts you covered were overwritten before it was written out.

## The longer version

[How to redact an image so the hidden part is really gone](https://abox.tools/guides/redact-an-image/): Black boxes drawn in most programs sit on top of the picture and can be moved aside. What separates a real redaction from a covered one, why pixelated text can be read back, and how to check a file before you send it.

## Also in the box

- [EXIF Viewer & Remover](https://abox.tools/exif-editor/): See what a photo says about you. Then take it out.
- [DICOM Viewer](https://abox.tools/dicom-viewer/): CT, MR, X-ray and ultrasound, with the window, the header and the measurements.
- [Image to ICO](https://abox.tools/image-to-ico/): One picture in. Every size a browser, Windows or a Mac asks for, out.
- [Image to Data URI](https://abox.tools/image-to-data-uri/): The whole picture as one line of text. Paste it straight into CSS or HTML.

## Questions

### Is my image uploaded anywhere?

No. The file is decoded, redacted and encoded by your own browser on your own hardware. This tool has no network feature of any kind — it never fetches anything and never sends anything — and the page's `Content-Security-Policy` names every address it may contact, none of which belongs to this site. Load the page once, unplug from the internet, and it still works.

### Is the covered part really gone from the file?

Yes, and that is the reason this tool exists. The picture is decoded into a buffer of pixels; the boxes overwrite the pixels inside them; the buffer is then encoded as a new file. The original values are gone from memory before the encoder is handed anything, so there is no layer to hide, no annotation to remove and no history to undo. You can check it the way you would check anybody else's claim: open the result in an image editor and look for a second layer, or try to select the text you covered.

### Can a pixelated or blurred area be recovered?

Sometimes, and this is the one thing worth reading before choosing. A black fill replaces everything under it with one flat colour, so nothing survives — not an edge, not an average, not the number of characters. Pixelating replaces each block with the average of that block, and a grid of averages is still a measurement of what was underneath: for text in an ordinary font at a predictable size, published work has reconstructed the original by rendering candidate strings and comparing their averages. Blurring is a convolution, and convolutions can in principle be worked backwards. So pixelate or blur a face in the background if you like, and black out anything that reads as text.

### Why is a black rectangle drawn in a document editor not the same thing?

Because most editors save the rectangle beside the picture rather than into it. A shape drawn in a PDF reader, a slide deck, a word processor or a layered image editor is an object with a position, sitting on top of the page — and moving it, deleting it, or opening the file in a different program puts back exactly what it was covering. Newspapers, courts and government departments have all published documents that were redacted that way. Here the rectangle is not saved at all: it is a set of pixel values written over the ones that were there.

### Does it also remove the EXIF and GPS data?

Yes, as a side effect. Saving means encoding a canvas full of pixels, and a canvas carries no tags, so the location, camera model, timestamps and the embedded thumbnail are simply not written to the new file. The thumbnail matters here: it is a small second copy of the picture, it is not always regenerated when a photo is edited, and a redacted photo travelling with an un-redacted thumbnail is a real way to undo this work. If you want metadata gone without the picture being re-encoded at all, the [EXIF Viewer & Remover](https://abox.tools/exif-editor/) rewrites the container instead.

### Which formats can it read and write?

It reads anything your browser can decode, which in practice means JPEG, PNG, WebP, GIF, BMP and — on most current browsers — AVIF. It writes JPEG, PNG and WebP, because those are the encoders browsers ship. On "auto" a JPEG comes back as a JPEG and everything else as a PNG, which keeps a photograph the size of a photograph and keeps a screenshot's remaining text crisp. The choice makes no difference to the redaction: the pixels are already gone before the encoder sees them.

### Can I do this without a mouse?

Yes. "Add a box in the middle" puts one on the picture, Tab moves between boxes, the arrow keys move the focused one and Alt with the arrow keys resizes it — Shift makes each step ten pixels — and Delete removes it. Every box also has a row underneath the picture with its size, its position, what it does, and a button to remove it, so the whole tool is usable from the keyboard and readable by a screen reader.

### Does it work on a phone?

Yes. Drawing, moving and resizing are all pointer events rather than mouse events, so a finger works the same way, and the handles are drawn larger on a touch screen. The picture on screen is redrawn at screen size while you work — the file itself is always redacted at its own full resolution when you press the button.

### Is it free, and do I need an account?

It is free, and there is no account, no sign-in, no trial and no watermark. There is no limit on the size of the picture either, because there is no server paying for it — the work happens on your own machine. The site carries advertising, which is what pays for it; the ads are not given anything about your images.

## How the privacy claim is verifiable

- **Your images have nowhere to go.** The Content-Security-Policy names every address this page may contact, and not one of them belongs to this site. There is no endpoint here that your files could be collected at, and nothing in the code that would send them if there were.
- **The covered pixels stop existing here, not on the way out.** The picture is decoded into a buffer of pixels, the boxes are written over that buffer, and the buffer is handed to the encoder. There is no version of the picture in this page with the boxes as a separate layer, because no such version is ever made — see `src/redact.js`.
- **Nothing here fetches anything.** There is no `fetch`, no `XMLHttpRequest` and no `sendBeacon` anywhere in `src/`. The work is `getImageData`, three loops over the bytes, and `canvas.toBlob` — all of it already installed in your browser.
- **The boxes are never reported anywhere.** Where you drew, how many, how big, and which style you chose are held in this page's memory until you close it. There is no custom analytics event in this repository that carries any of it, and the one question this site asks after a download sends a thumb up or down and the name of the tool, nothing else.
- **It works offline.** Disconnect from the network and the tool is unchanged, because there was never a network step in it. That is the simplest proof of all — and the one worth running before you redact a passport.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/redact.js` for the three functions that overwrite the pixels, and `src/preview.js` for why what you see on screen is drawn by those same three functions.
