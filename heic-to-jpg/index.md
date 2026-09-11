# HEIC to JPG — convert iPhone photos

The photos an iPhone makes, in a format everything opens.

> Convert iPhone HEIC photos to JPG in your browser. The decoder runs on your own machine: nothing is uploaded, no account, works offline, and the date and camera details can come along.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/heic-to-jpg/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your photos are **never uploaded**. There is no server.

The decoding runs in your own browser, on your own hardware. HEIC is the one picture format a browser will not open by itself, so this page carries the decoder with it — about 1.4 MB, served from this site, cached after the first visit. That is the entire reason every other HEIC converter asks you to upload: they put the codec on a server and your photos have to go to it. This one puts the codec here instead. There is no network feature on this page at all, and no server on the other end of it to send a photo to.

- ✗ No upload
- ✗ No account
- ✗ No size limit
- ✓ Works offline
- ✓ Open source

## How to convert HEIC photos to JPG

1. **Choose your HEIC photos.** Drop them onto the picker or select them by hand, straight out of a phone backup or a folder on the desktop. They are read off your disk by the browser; nothing is sent anywhere while you do it. The list says what each one is and what it has inside it.
2. **Check what the photos carry.** Each row names the date it was taken, the camera, and — in green, because it is the part worth noticing — whether the file holds GPS coordinates. That is read out of the container without decoding the picture, so it costs nothing and appears immediately.
3. **Pick a format, and decide about the details.** JPEG unless you have a reason: it is the format that opens everywhere, which is the whole point of converting. The quality slider is at 92, which is the setting at which a photograph is hard to tell from the original. The checkbox decides whether the date, camera and location come along.
4. **Press "Convert", and download.** The decoder arrives on the first conversion — about 1.4 MB, once — and every photo after that is decoded and written on your own machine. One file gives you a download button; several give you a zip as well.

## The longer version

[The photo your phone saved, and the format nothing will open](https://abox.tools/guides/convert-heic-to-jpg/): iPhones save photos as HEIC, and half the internet cannot open one. What the format is, why only Safari decodes it, what converting costs the picture, and how to do it without uploading the photos to anyone.

## Also in the box

- [ID Photo Maker](https://abox.tools/id-photo/): Pick the country. It applies that country's rule, exactly.
- [Image Stacker](https://abox.tools/stack-images/): Twenty frames into one, without twenty uploads or a RAW converter.
- [Image Redactor](https://abox.tools/redact-image/): What you cover is deleted from the file, not covered up in it.
- [EXIF Viewer & Remover](https://abox.tools/exif-editor/): See what a photo says about you. Then take it out.

## Questions

### Is my photo uploaded anywhere?

No. The file is read, decoded and written by your own browser on your own hardware. This tool has no network feature of any kind — it never fetches anything and never sends anything — and the page's `Content-Security-Policy` names every address it may contact, none of which belongs to this site. The one thing that does load is the decoder itself, and that comes from this site, once, before your photo is ever involved.

### Why does this page download 1.4 MB the first time?

Because HEIC is the one picture format a browser will not open. It is an HEVC frame in a box container, and only Safari, on Apple hardware, has a decoder for it; Chrome, Firefox and Edge simply refuse the file. So a HEIC converter needs a decoder from somewhere, and there are two places it can come from: a server, or the page. Every other converter chose the server, which is exactly why they all need your photos uploaded. This one carries `libheif` compiled to WebAssembly instead. It is served from this site, cached after the first visit, and it is the entire price of your photos not going anywhere.

### Does the JPEG keep the date, the camera and the location?

If you want it to, and it is a checkbox on the page. Left on, the EXIF block is copied out of the HEIC and written into the JPEG exactly as the phone wrote it, so the converted photo still sorts by the day it was taken rather than the day it was converted — which is the usual complaint about HEIC converters. One tag is changed and only one: the orientation, which is set to "upright", because the rotation has already been applied to the pixels and a viewer that applied it again would turn every portrait photo on its side. Turn the checkbox off and the JPEG comes out with the picture and nothing else.

### Does it strip GPS coordinates?

It tells you they are there, and then it does whatever you ask. The row for each photo says whether the file carries coordinates before you convert anything, which is more than the phone does. Unticking "keep the date, the camera and the settings" leaves them out of the JPEG along with everything else; leaving it ticked carries them across. If what you want is to look through the tags in detail, or to strip them from photos that are already JPEGs, the [EXIF Viewer & Remover](https://abox.tools/exif-editor/) is the tool for that, and it does it without re-compressing the picture.

### Is the picture re-compressed?

Yes, and it has to be: HEIC and JPEG are different codecs, so there is no way to move from one to the other without decoding the picture and encoding it again. What you can control is how much that costs. The quality slider defaults to 92, at which a photograph is very hard to distinguish from the original, and PNG is on the menu for the case where you want no loss at all and do not mind the file being five to ten times the size.

### What if the file is called .jpg but is really a HEIC?

It still works. Every file dropped here is identified by its first bytes rather than by its name, because the name is whatever the last app to touch the file decided to call it — and a HEIC that arrived called ".jpg" is one of the commonest ways people end up looking for a tool like this. A file that genuinely is a JPEG or a PNG is refused with a message saying so, rather than being converted into a copy of itself.

### Can it convert a Live Photo, or a burst?

The still pictures in it, yes. A HEIC can hold more than one picture, and every one it holds is converted and named after the original with a number on the end. The video half of a Live Photo is a separate file that the phone keeps beside the HEIC, so it is not in here to convert. Depth maps and thumbnails are in the container but are not pictures anybody asked for, and are left alone.

### Why will it not take my AVIF?

Because there is nothing to do to it. AVIF is the same container as HEIC with AV1 inside instead of HEVC, and every current browser decodes one natively — so a converter would be shipping a megabyte of engine to solve a problem you do not have. If you need an AVIF as a JPEG, the [Image Compressor](https://abox.tools/compress-image/) and the [Image Resizer](https://abox.tools/resize-image/) both read AVIF and write JPEG using the decoder your browser already has.

### Is it free, and do I need an account?

It is free, and there is no account, no sign-in, no trial and no watermark. There is no limit on the number or the size of the files either, because there is no server paying for them — the work happens on your own machine. The site carries advertising, which is what pays for it; the ads are not given anything about your photos.

### Does it work offline?

Yes, decoder included. Load the page once, then disconnect from the internet and it keeps working on your photos exactly as before. That is also the strongest proof available that nothing is being uploaded: a converter that sent your HEICs away to be decoded would stop the moment you unplugged, and this one does not.

## How the privacy claim is verifiable

- **Your photos have nowhere to go.** The Content-Security-Policy names every address this page may contact, and not one of them belongs to this site. There is no endpoint here that your files could be collected at, and nothing in the code that would send them if there were.
- **The decoder came from here, and it goes nowhere.** HEIC is HEVC in a box format, and no browser but Safari will decode one, so this page ships `libheif` compiled to WebAssembly — about 1.4 MB, committed to this repository, served from this origin, and cached by the service worker like every other file here. It is not fetched from a CDN, because that would put a third party in the path of every visit and would stop the tool working offline. The binary is inside the script rather than beside it precisely so that no fetch is needed to start it.
- **Nothing here fetches anything.** There is no `fetch`, no `XMLHttpRequest` and no `sendBeacon` in any file written for this tool. The vendored engine, like every Emscripten build, contains the loader paths that would fetch a `.wasm` from a URL; they are not taken, because the binary is already in hand — and if one were, `connect-src` names Google's measurement endpoints and nothing else, so the browser would refuse it. The policy is the proof, not the promise.
- **The metadata is read here and reported to you.** The list on the page says what each photo carries — the date, the camera, and whether there are GPS coordinates in it — because that is a thing you might want to know before you hand the JPEG to somebody. It is read out of the file by `src/boxes.js` in this browser, shown on this page, and written into your JPEG or left out, entirely as you choose. There is no custom analytics event in this repository that carries a filename, a date, a coordinate or a count.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google, and the donate button from Buy Me a Coffee. None of them is handed anything about your photos. Every line that reads, decodes or writes a file is served from this origin and listed in the repository.
- **It works offline.** Load the page once and disconnect from the network, and the tool is unchanged — the decoder is cached with it. That is the simplest proof of all, and it is a stronger one here than anywhere else on this site: a converter that sent your photos away to be decoded could not possibly manage it.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/heif.js` for how the decoder is loaded and what it is allowed to do, `src/boxes.js` for the container parsing that finds the photo's metadata, and `src/exif.js` for what happens to that metadata on the way into a JPEG. The engine itself is `vendor/libheif.js`, unmodified, with its licence beside it.
