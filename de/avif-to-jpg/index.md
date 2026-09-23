# AVIF to JPG — open the picture that will not open

The format websites save now, in the one everything has always taken.

> Convert AVIF images to JPG in your browser. Your browser already decodes AVIF, so nothing is uploaded, there is no account, and it works offline. Transparency is filled with a colour you choose.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/avif-to-jpg/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre pictures werden **nie hochgeladen**. Es gibt keinen Server.

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

## Die ausführliche Fassung

[The file nothing will open, except the thing you are reading this in](https://abox.tools/de/guides/convert-avif-to-jpg/): Downloaded a picture and got a .avif that no program will open? Your browser reads it perfectly, which is why converting needs no upload. What AVIF is, what a JPEG cannot carry over, and why the JPG comes out several times larger.

## Fragen

### Is my picture uploaded anywhere?

No. The file is read, decoded and written by your own browser on your own hardware. This tool has no network feature of any kind — it never fetches anything and never sends anything — and the page's `Content-Security-Policy` names every address it may contact, none of which belongs to this site. There is not even a decoder to load first: your browser already had one.

### Why will nothing on my computer open this file?

Because AVIF is new where it counts. Websites started serving it because it is dramatically smaller than a JPEG at the same quality, so saving a picture from one now hands you a `.avif` — and the software you then open it in is often older than the format. Windows needs an extension for it, a lot of desktop editors still refuse it, and most e-readers, printers and upload forms have never heard of it. Your browser, meanwhile, reads it perfectly, which is why this page can help and is also why the file arrived in the first place.

### Will the JPG be bigger than the AVIF?

Almost certainly, often by several times, and the result says by how much rather than hiding it. AVIF is one of the best still-image codecs there is and JPEG is one of the oldest, so a picture that is 40 KB as an AVIF can easily be 200 KB as a JPEG of the same visible quality. That is the trade: bytes for compatibility. If the size matters afterwards, the [Image Compressor](https://abox.tools/de/bild-komprimieren/) will take the JPEG down to a figure you name.

### What happens to transparency?

It is filled with a colour you choose, and the page says so before you press anything. AVIF has an alpha channel and a JPEG does not, so there is no version of this where the transparency survives — only a question of what goes underneath, which is your decision rather than the converter's. In practice most AVIFs are photographs with nothing see-through in them, so the field never appears. If you need the transparency kept, convert to PNG or WebP with the [Image Compressor](https://abox.tools/de/bild-komprimieren/), which reads AVIF and writes both.

### What about HDR and 10-bit colour?

They do not survive, because a JPEG cannot hold them. AVIF can store ten or twelve bits a channel and describe highlights brighter than a normal screen shows; a JPEG is eight bits with no such notion. So an HDR AVIF comes out as an ordinary picture — which is what you wanted if the goal was a file that opens everywhere, and a real loss if you were archiving. Almost nothing saved from an ordinary web page is HDR, so for almost everybody this costs nothing.

### Is the picture re-compressed?

Yes, and it has to be: AVIF and JPEG are different codecs, so there is no way to move from one to the other without decoding the picture and encoding it again. That is true of every AVIF converter there is, including the ones that ask you to upload. What you control is how much it costs, and the slider defaults to 92, where a photograph is very hard to tell from the original.

### Can you convert the other way, JPG to AVIF?

Not here, and the reason is worth knowing: no browser will write one. Ask a canvas for an AVIF and it quietly hands back a PNG with the wrong type on it — so a page claiming to write AVIF in your browser is either wrong or is sending your picture to a server to be encoded. Doing it properly without a server means shipping an encoder, and that is a real piece of work that is on [the roadmap](https://abox.tools/de/roadmap/) rather than pretended at here.

### Does it keep the date, camera and location?

No. The picture is drawn onto a canvas and a canvas holds pixels and nothing else, so EXIF, GPS, colour profiles and XMP are left behind. For a picture saved off a web page there is usually nothing there anyway. If you need to see or edit what a file carries, the [EXIF Viewer & Remover](https://abox.tools/de/exif-daten-entfernen/) does that without re-compressing the picture.

### Can it do a whole folder at once?

Yes. Drop in as many as you like — there is no limit on the number or the size, because there is no server paying for them. Each one gets its own row and its own download, and two or more give you a zip of the lot.

### Is it free, and does it work offline?

It is free, with no account, no sign-in, no trial and no watermark; the site carries advertising, which is what pays for it, and the ads are not given anything about your pictures. And yes — load the page once, then disconnect from the internet and it keeps working exactly as before, which is also the strongest proof available that nothing is being uploaded.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Your pictures have nowhere to go.** The Content-Security-Policy names every address this page may contact, and not one of them belongs to this site. There is no endpoint here that your files could be collected at, and nothing in the code that would send them if there were.
- **The decoder is already in your browser, which is the whole trick.** An AVIF that will not open in your photo viewer opens fine in a browser tab, because Chrome and Firefox have decoded AVIF since 2021 and Safari since 2023. This page is that decoder with a save button: it opens the file the way the browser already can, draws it, and writes a JPEG. So there is no engine to download, nothing to wait for on the first conversion, and no reason for a server to be involved — which is exactly what the converters asking you to upload are not telling you.
- **The see-through parts, and what goes behind them.** AVIF can carry an alpha channel and a JPEG cannot, so something has to go underneath. This page asks which colour and defaults to white, and it only asks when a file on the list really has transparency in it — which is read off the decoded pixels rather than guessed. Most AVIFs saved from websites are photographs with nothing see-through in them at all, so the field usually stays out of the way.
- **What a JPEG cannot carry over from an AVIF.** AVIF can hold more colours than a JPEG can and can describe brighter highlights — ten or twelve bits a channel, and HDR. A JPEG is eight bits and no HDR, so a picture that used any of that arrives flattened to ordinary range. On the overwhelming majority of pictures there is nothing to flatten and you will see no difference; on a screenshot of an HDR photo you may. It is said here rather than discovered later.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google, and the donate button from Buy Me a Coffee. None of them is handed anything about your pictures. Every line that reads, decodes or writes a file is served from this origin and listed in the repository.
- **It works offline.** Load the page once and disconnect from the network, and the tool is unchanged. That is the simplest proof of all: a converter that sent your pictures away to be converted could not possibly manage it.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, and `src/shared/image-convert.js` for the conversion — the brand sniffing that decides a file really is an AVIF, the decode, and the canvas the JPEG is written from. It is the same file the other two format converters use and there is no codec in it.
