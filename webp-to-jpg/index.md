# WebP to JPG — convert without uploading

The pictures the web saves, in the format everything still takes.

> Convert WebP images to JPG in your browser. Your browser already decodes WebP, so nothing is uploaded, there is no account, and it works offline. Transparency is filled with a colour you choose.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/webp-to-jpg/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your pictures are **never uploaded**. There is no server.

The converting runs in your own browser, on your own hardware. There is no decoder to download and no engine to wait for — your browser has read WebP since 2020 and has written JPEG for as long as it has existed, so everything this page needs was already on your machine before you arrived. That is the whole reason it can promise what it promises: there is no network feature on this page, and no server on the other end of it to send a picture to.

- ✗ No upload
- ✗ No account
- ✗ No size limit
- ✓ Works offline
- ✓ Open source

## How to convert a WebP to JPG

1. **Choose your WebP files.** Drop them onto the picker or select them by hand. Every file is identified by its first bytes rather than by its name, so a WebP that arrived called “.jpg” still works — and a file that is genuinely a PNG is turned away with a line saying what it actually is, rather than converted into a copy of itself.
2. **Read what each row says about the file.** The list names the size and the dimensions, and then the three things worth knowing before you convert: whether the WebP is lossless, whether it has see-through parts, and whether it is animated. Each one only appears when it is true of that file.
3. **Set the quality, and the colour behind the transparency.** The slider starts at 92, which is where a photograph is hard to tell from the original. The colour field appears only if something on the list is see-through, because a JPEG has to put something there.
4. **Press “Convert”, and download.** Each result says what it came from, what it weighs now and how that compares, and carries a note if its transparency was filled in or if only the first frame of an animation was written. One file gives you a download button; several give you a zip as well.

## The longer version

[The picture the web saved, and the format everything still takes](https://abox.tools/guides/convert-webp-to-jpg/): Saved a picture from a website and got a .webp nothing will open? What WebP is, why converting makes the file larger rather than smaller, what happens to transparency, and how to do it without uploading anything.

## Also in the box

- [PNG to WebP](https://abox.tools/png-to-webp/): The same picture, often a third off, with the see-through parts intact.
- [AVIF to JPG](https://abox.tools/avif-to-jpg/): The format websites save now, in the one everything has always taken.
- [ID Photo Maker](https://abox.tools/id-photo/): Pick the country. It applies that country's rule, exactly.
- [Image Stacker](https://abox.tools/stack-images/): Twenty frames into one, without twenty uploads or a RAW converter.

## Questions

### Is my picture uploaded anywhere?

No. The file is read, decoded and written by your own browser on your own hardware. This tool has no network feature of any kind — it never fetches anything and never sends anything — and the page's `Content-Security-Policy` names every address it may contact, none of which belongs to this site. Unlike the HEIC converter next door, there is not even a decoder to load first: your browser already had one.

### Why would I convert a WebP to a JPG at all?

Because the software you are handing it to has not caught up. WebP is what a browser saves when you right-click a picture on the web, and it is excellent at being small — but plenty of things still will not take one: older versions of Office and Photoshop, some print shops, a good number of upload forms that check the extension, most e-readers, and a surprising amount of software that came with a camera or a printer. A JPG is the format that has never been turned away.

### What happens to the transparent parts?

They are filled with a colour you choose, and the page tells you it is going to before you press anything. A JPEG has no alpha channel, so there is no version of this where the transparency survives — the only question is what goes underneath, and the honest answer is that it is your decision rather than the converter's. White is the default because it is right for a logo going into a document. If you need the transparency kept, keep the WebP, or convert it to a PNG with the [Image Compressor](https://abox.tools/compress-image/), which writes PNG and WebP as well as JPEG.

### Can it convert an animated WebP?

It converts the first frame, and it says so on the row before you press anything and again on the result afterwards. A JPEG holds one picture, so there is nothing else it could do with the other frames. If what you want is every frame as a separate file, or the animation as a video, the tools for that are [Split a GIF](https://abox.tools/split-gif/) and [GIF to MP4](https://abox.tools/gif-to-mp4/) once the animation is a GIF.

### Is the picture re-compressed?

Yes, and it has to be: WebP and JPEG are different codecs, so there is no way to move from one to the other without decoding the picture and encoding it again. That is true of every WebP-to-JPG converter there is, including the ones that ask you to upload. What you control is how much it costs — the slider defaults to 92, where a photograph is very hard to tell from the original. A lossless WebP is the case worth knowing about: the JPEG made from one will be the first lossy copy that picture has ever had, and the row on the list says when a file is lossless so that is not a surprise.

### Will the JPG be bigger than the WebP?

Often, yes, and the result says by how much rather than hiding it. WebP is simply a better codec than JPEG at the same visual quality — that is why the web moved to it — so converting the other way usually costs you some size back. You are trading bytes for compatibility, which is a perfectly good trade when the thing on the other end will not take a WebP. If the size matters afterwards, the [Image Compressor](https://abox.tools/compress-image/) will take the JPEG down to a figure you name.

### Does it keep the date, camera and location?

No. The picture is drawn onto a canvas and a canvas holds pixels and nothing else, so EXIF, GPS, colour profiles and XMP are all left behind. In practice most WebPs on the web have already had that stripped, and for anybody converting a picture to send somewhere it is usually the outcome they wanted. If you need to see or edit what a file carries, the [EXIF Viewer & Remover](https://abox.tools/exif-editor/) does that without re-compressing the picture.

### Can it do a whole folder at once?

Yes. Drop in as many as you like — there is no limit on the number or the size, because there is no server paying for them. Each one gets its own row and its own download, and two or more give you a zip of the lot. Files that share a name get a number added before the extension, so nothing quietly replaces anything else in the archive.

### Is it free, and do I need an account?

It is free, and there is no account, no sign-in, no trial and no watermark. The site carries advertising, which is what pays for it; the ads are not given anything about your pictures.

### Does it work offline?

Yes. Load the page once, then disconnect from the internet and it keeps working exactly as before. That is also the strongest proof available that nothing is being uploaded: a converter that sent your files away to be processed would stop the moment you unplugged, and this one does not.

## How the privacy claim is verifiable

- **Your pictures have nowhere to go.** The Content-Security-Policy names every address this page may contact, and not one of them belongs to this site. There is no endpoint here that your files could be collected at, and nothing in the code that would send them if there were.
- **There is no decoder to ship, which is why there is no server.** Every browser released since 2020 decodes WebP, and every one of them has written JPEG since long before that. So this tool carries no engine, downloads nothing on first use, and has no reason to exist on a server — which is exactly what the converters that ask you to upload are not telling you. The one tool here that does carry a codec is the [HEIC converter](https://abox.tools/heic-to-jpg/), because HEIC genuinely is a format no browser but Safari will open, and it says so on its own page.
- **The see-through parts, and what goes behind them.** A WebP can be transparent and a JPEG cannot — there is no alpha channel in the format, so something has to go underneath. This page asks which colour and defaults to white, and it only asks when a file on the list actually has transparency in it, which is read off the decoded pixels rather than guessed from the format. A converter that does not ask is not keeping your transparency; it is choosing black for you, which is where the black-background logo comes from.
- **What a canvas does not carry across.** The picture is decoded and drawn onto a canvas, and a canvas holds pixels and nothing else, so EXIF, ICC colour profiles, XMP and any copyright block do not survive the trip. For most people that is a bonus and for some it is a loss, so it is said here rather than discovered later. If what you wanted was the metadata, the [EXIF Viewer & Remover](https://abox.tools/exif-editor/) reads and writes it without re-compressing anything.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google, and the donate button from Buy Me a Coffee. None of them is handed anything about your pictures. Every line that reads, decodes or writes a file is served from this origin and listed in the repository.
- **It works offline.** Load the page once and disconnect from the network, and the tool is unchanged. That is the simplest proof of all: a converter that sent your pictures away to be converted could not possibly manage it.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, and `src/shared/image-convert.js` for the conversion itself — the sniffing that decides what a file really is, the decode, and the canvas the JPEG is written from. It is the same file the other two format converters use, and it is about three hundred lines with no codec in it.
