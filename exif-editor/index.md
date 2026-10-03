# EXIF Viewer & Remover — remove photo metadata

See what a photo says about you. Then take it out.

> See the EXIF and GPS data hidden in a photo, edit it, or strip the lot in one click. In your browser: nothing uploaded, and the photo is never re-encoded.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/exif-editor/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your photos are **never uploaded**. There is no server.

The file is opened, parsed and rewritten by your own browser. This tool has no network feature of any kind — nothing to fetch, nothing to send — and there is no server on the other end of this page to send a photo to even if there were.

- ✗ No upload
- ✗ No account
- ✓ Works offline
- ✓ Open source
- ✓ Never re-encodes the picture

## How to remove EXIF data from a photo

1. **Choose your photos.** Drop them onto the picker or select them by hand. They are read straight off your disk by the browser; nothing is sent anywhere while you do it.
2. **Read what is in them, if you want to.** The findings list names the things worth knowing about — the GPS position, the timestamps, the serial numbers — before the full table of every tag.
3. **Press "Remove all metadata".** That is the whole job for most people. Every tag, the XMP and IPTC blocks, the comments and the embedded thumbnail all go, on every photo on the list at once.
4. **Or edit instead of removing.** Change a date, correct a copyright line, drop the location and keep the camera settings — then save that photo on its own.

## The longer version

[What a photo says about you, and how to take it out](https://abox.tools/guides/remove-exif-and-gps-data/): A photo off a phone usually carries the exact spot it was taken, the time to the second, and the camera's serial number. What is in there, who can read it, and how to take it out without touching the picture.

## Also in the box

- [DICOM Viewer](https://abox.tools/dicom-viewer/): CT, MR, X-ray and ultrasound, with the window, the header and the measurements.
- [Image to ICO](https://abox.tools/image-to-ico/): One picture in. Every size a browser, Windows or a Mac asks for, out.
- [Image to Data URI](https://abox.tools/image-to-data-uri/): The whole picture as one line of text. Paste it straight into CSS or HTML.
- [SVG to Image](https://abox.tools/svg-to-image/): Name the size. A vector has none of its own to lose.

## Questions

### Is my photo uploaded anywhere?

No. The file is read, parsed and rewritten by your own browser on your own hardware. This tool has no network feature of any kind — it never fetches anything and never sends anything — and the page's `Content-Security-Policy` names every address it may contact, none of which belongs to this site.

### What is EXIF, and what else is hiding in a photo?

EXIF is a block of tags a camera writes beside the picture: the make and model, the exposure settings, the date and time to the second, often a GPS position, and sometimes a serial number. Photos frequently carry more besides — an XMP packet of XML from an editor, an IPTC block of caption and byline fields, a colour profile, a small second copy of the image as a thumbnail, and a maker note of undocumented manufacturer data. This tool lists all of it.

### Does removing metadata reduce the image quality?

No, and this is the main reason to use a tool like this rather than re-saving the photo. Metadata sits in the container around the compressed picture, not inside it. Removing it means deleting items from a list and writing the list back out; the compressed image data is copied across byte for byte, so the result decodes to exactly the same pixels. Nothing is decoded and nothing is re-compressed.

### Which file formats does it handle?

JPEG, PNG and WebP. HEIC and AVIF are recognised but not rewritten: they are box formats built from nested atoms and need a different parser, so the tool says so rather than producing a broken file. A bare TIFF is not handled either, because in a TIFF the metadata and the pixels are addressed by the same offsets.

### Will my photo appear rotated after the metadata is removed?

It can, and there is a setting for it. Phones usually record the picture the way the sensor saw it and add an Orientation tag saying how to turn it. Remove that tag and some viewers show the photo sideways. The "keep the orientation tag" option, which is on by default, writes back a tiny EXIF block containing nothing but that one tag — and only when the photo actually needed it. Turn it off if you would rather the file carry no EXIF whatsoever.

### Does it remove the GPS location?

Yes. Removing everything removes the whole GPS directory, and you can also delete the location on its own and keep the rest. The position is shown in decimal degrees first, because "51 degrees, 30 minutes, 26 seconds" does not make it obvious that a photo names the building it was taken in.

### Can I change a tag instead of deleting it?

Yes. Text tags, dates, the ISO, the orientation and the resolution can all be edited, and a few common tags can be added to a photo that has none. One caveat: writing the file rebuilds the EXIF block, and a maker note contains offsets into the original block, so a rebuilt maker note may not be readable by the manufacturer's own software afterwards. Delete it or leave the file unedited if that matters to you.

### Is it free, and do I need an account?

It is free, and there is no account, no sign-in and no trial. The site carries advertising, which is what pays for it; the ads are not given anything about your photos.

### Does it work offline?

Yes. Load the page once, then disconnect from the internet and it keeps working. That is also the simplest way to prove nothing is being uploaded: a tool that sent your photos away to be processed would stop the moment you unplugged.

## How the privacy claim is verifiable

- **Your photos have nowhere to go.** The Content-Security-Policy names every address this page may contact, and not one of them belongs to this site. There is no endpoint here that your files could be collected at, and nothing in the code that would send them if there were.
- **Nothing here fetches anything.** Unlike the other tools in this box, this one has no "load from a web address" feature and no optional network step at all. There is no `fetch`, no `XMLHttpRequest` and no `sendBeacon` anywhere in `src/`.
- **The metadata we read is never read out.** Your GPS position is displayed on this page and goes nowhere else. There is no custom analytics event in this repository that carries a tag, a filename, a size or a count.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google. Neither is handed anything about your photos. Every line that reads, parses or rewrites a file is served from this origin and listed in the repository.
- **What the donate button loads, and what it is not given.** The "Buy me a coffee" button in the header is drawn by a script from cdnjs.buymeacoffee.com and letters itself from Google Fonts. It is a link and nothing more: it reports no visit, and it is handed nothing about you or your files. Nothing happens unless you click it, and what you would be clicking through to is somebody else's site.
- **It works offline.** Disconnect from the network and the tool is unchanged, because there was never a network step in it. That is the simplest proof of all.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/tiff.js` for the EXIF parser, and `src/jpeg.js` for the proof that the picture itself is only ever copied.
