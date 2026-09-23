# Image to Data URI — base64 encode a picture for CSS or HTML

The whole picture as one line of text. Paste it straight into CSS or HTML.

> Turn a PNG, JPEG, SVG or WebP into a data URI you can paste into CSS or HTML. SVGs are percent-encoded rather than base64, so they stay readable and shorter. Runs in your browser; nothing is uploaded.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/image-to-data-uri/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your images are **never uploaded**. There is no server.

The encoding runs in your own browser, on your own hardware. It is arithmetic on bytes the page already has: no encoder, no server, and no network step to leave out. This tool has no network feature of any kind — nothing to fetch, nothing to send — and there is no server on the other end of this page to send a picture to even if there were.

- ✗ No upload
- ✗ No account
- ✗ No re-encoding
- ✓ Works offline
- ✓ Open source

## How to turn an image into a data URI

1. **Choose your images.** Drop them onto the picker or select them by hand. They are read straight off your disk by the browser; nothing is sent anywhere while you do it.
2. **Say where the result is going.** The URI on its own, a CSS rule, a custom property, an `<img>` tag or Markdown. Every one of them quotes the URI, which is the detail that decides whether an inlined SVG works or silently does not.
3. **Read what it cost.** Each result says how many characters it became, how much larger that is than the file, and whether inlining something this size is a good idea. Base64 adds a third; whether that third is worth a saved request depends entirely on the size, so the page says which side of the line you are on.
4. **Check the warnings.** If the picture carries EXIF, a colour profile or XMP, it is named along with how many bytes of your result are it. If the extension disagrees with the actual format, the page uses the format and tells you. If your browser cannot draw the result, it says that too.
5. **Copy, or download.** One button per result, and one for all of them at once — the custom properties come out wrapped in a `:root` block, ready to paste at the top of a stylesheet.

## The longer version

[When to put a picture inside your CSS, and when not to](https://abox.tools/guides/embed-an-image-in-css/): What a data URI costs, why base64 adds a third and gzip does not give it back, why an SVG should never be base64, and the quoting mistake that breaks inlined SVGs silently.

## Also in the box

- [SVG to Image](https://abox.tools/svg-to-image/): Name the size. A vector has none of its own to lose.
- [Image to SVG](https://abox.tools/image-to-svg/): One shape, one outline. Point at whatever should not be there.
- [Height Comparison Chart](https://abox.tools/compare-heights/): Type the heights, take the picture. Nothing is sent to draw it.
- [Business Profile Preview](https://abox.tools/business-profile-preview/): Type it, and it becomes the card Google would draw. Nothing is sent to draw it.

## Questions

### Is my image uploaded anywhere?

No. The file is read and encoded by your own browser on your own hardware, with two functions the browser already has. This tool has no network feature of any kind — it never fetches anything and never sends anything — and the page's `Content-Security-Policy` names every address it may contact, none of which belongs to this site.

### What is a data URI?

A way of writing a whole file where a web address would normally go. Instead of `url("logo.png")`, which tells the browser to go and fetch something, you write `url("data:image/png;base64,iVBORw0...")`, which contains the picture itself. The browser decodes it on the spot. The practical effect is one fewer request: the picture arrives with the stylesheet or the page rather than after it.

### Why is my SVG not base64?

Because base64 is the wrong encoding for it. An SVG is text, and a URL can carry text already — only a handful of characters have to be escaped. Percent-encoding those and leaving the rest alone produces a URI that is typically a fifth shorter than the base64 of the same file, and that you can still read in your stylesheet: the element names, the colours and the `viewBox` are all still there to edit. There is a checkbox to force base64 for the rare toolchain that insists on it.

### How much bigger does base64 make my image?

About a third. Three bytes of file become four characters of base64, which is 33% before the `data:image/png;base64,` in front. That is the floor, and it is unavoidable: it is what it costs to write arbitrary bytes using only the characters a URL permits. It is also why the page shows the character count next to the file size rather than leaving you to find out when the stylesheet is deployed.

### When is inlining an image actually a good idea?

When it is small and it is needed immediately. A 2 KB icon in a stylesheet that every page loads is a clear win: one fewer round trip, and the picture is there the moment the CSS is. Past about 10 KB the trade turns. An inlined picture is no longer a separate file, so it cannot be cached on its own, cannot be fetched in parallel with anything else, and is downloaded again in full every time the file around it changes — a 200 KB photograph in a stylesheet is 200 KB added to the critical path of every page on the site. The page tells you which side of that line each result falls on.

### Does gzip undo the base64 overhead?

Less than people expect. Base64 of an already-compressed file — which a PNG, a JPEG and a WebP all are — compresses badly, because there is almost no redundancy left for the compressor to find; you typically get back something like a tenth of the third that base64 added, not the whole of it. A percent-encoded SVG is the opposite case: it is still text, so it compresses about as well as it did before, which is another reason not to base64 one.

### Does this change my image at all?

No, and that is a deliberate difference from most of the tools here. Nothing is decoded into pixels and encoded again: the bytes that came off your disk are the bytes that go into the URI. A JPEG stays exactly the JPEG it was, at the same quality, with the same dimensions. It is the reason the result can be described as the same file rather than a copy of it.

### So my EXIF and GPS data go into the stylesheet too?

Yes, and this is the part worth thinking about before you paste. Because nothing is re-encoded, everything the camera wrote travels with the picture: the location, the timestamp, the camera's serial number. On a phone photograph that can be 30 KB of the file, which becomes 40 KB of base64 on the critical path of your page, and a home address in something that will be committed to a repository. The page reads how much metadata is in a JPEG, PNG or WebP and says so. To take it out first, use the [EXIF Viewer & Remover](https://abox.tools/exif-editor/).

### Why did it use a different type from my file's extension?

Because the extension can be wrong and the bytes cannot. A file named `logo.png` that was actually exported as a JPEG is common enough that every image tool has to cope with it, and a data URI that declares the wrong type simply does not render — there is no fallback and no error message worth reading. So the type is read from the first few bytes of the file, which say what it is unambiguously in every format here, and the page tells you when the two disagree.

### The preview is blank. What went wrong?

Probably nothing about the URI. HEIC and TIFF both make perfectly valid data URIs that no browser except Safari will draw, so the picture is missing wherever you paste it as well — convert it to PNG, JPEG or WebP first with the [Image Compressor](https://abox.tools/compress-image/) or the [Image Resizer](https://abox.tools/resize-image/). If the format is an ordinary one, the file itself is likely damaged: the preview is drawn from the URI this page built, so a blank one means the picture did not decode.

### Is there a size limit on a data URI?

Not one you will meet in CSS or in an `<img>` tag; modern browsers impose no practical cap there. What browsers do limit is typing a data URI into the address bar, which most of them now refuse for anything non-trivial, for security reasons that have nothing to do with this use. The real limit is the one above: long before anything technical breaks, the page it is in has become slower than it would have been with an ordinary image file.

### Is it free, and do I need an account?

It is free, and there is no account, no sign-in, no trial and no watermark. There is no limit on the number or the size of the files either, because there is no server paying for them — the work happens on your own machine. The site carries advertising, which is what pays for it; the ads are not given anything about your images.

### Does it work offline?

Yes. Load the page once, then disconnect from the internet and it keeps working. That is also the simplest way to prove nothing is being uploaded: a tool that sent your images away to be encoded would stop the moment you unplugged.

## How the privacy claim is verifiable

- **Your images have nowhere to go.** The Content-Security-Policy names every address this page may contact, and not one of them belongs to this site. There is no endpoint here that your files could be collected at, and nothing in the code that would send them if there were.
- **Nothing here fetches anything.** There is no `fetch`, no `XMLHttpRequest` and no `sendBeacon` anywhere in `src/`. The encoding is `btoa` and `encodeURIComponent` — two functions the browser has had since the beginning, both of which take bytes and return text without going anywhere.
- **The preview is the proof.** The picture beside each result is drawn from the data URI this page just built, not from your file. It renders because the URI is correct, on your machine, with no server involved — and if it does not render, the page says so instead of handing you something broken.
- **The metadata warning is on your side.** A data URI copies the file exactly, so a photograph's GPS fix travels into your stylesheet with it. This page reads how much of that is there and tells you, because the alternative is you finding out after it is committed.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google, and the donate button from Buy Me a Coffee. None of them is handed anything about your pictures. Every line that reads or encodes a file is served from this origin and listed in the repository.
- **It works offline.** Disconnect from the network and the tool is unchanged, because there was never a network step in it. That is the simplest proof of all.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/encode.js` for the two encodings and the reasoning behind each, `src/sniff.js` for how the media type is read out of the file rather than out of its name, and `src/metadata.js` for the check that says how much of what you are about to paste is not the picture.
